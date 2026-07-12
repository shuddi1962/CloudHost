import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, workflows, workflowExecutions } from "@cloudhost/db";

const WORKFLOW_SERVICE_URL = `http://localhost:${process.env.WORKFLOW_PORT || "4001"}`;

export const workflowsRouter = new Hono();

workflowsRouter.get("/project/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const all = await db.select().from(workflows).where(eq(workflows.projectId, projectId));
  return c.json({ workflows: all });
});

workflowsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const [workflow] = await db.insert(workflows).values({
    projectId: body.projectId,
    name: body.name,
    description: body.description,
    nodes: body.nodes || [],
    connections: body.connections || {},
    webhookUrl: `/webhook/${Math.random().toString(36).slice(2, 14)}`,
  }).returning();
  return c.json({ workflow }, 201);
});

workflowsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  if (!workflow) return c.json({ error: "Not found" }, 404);
  return c.json({ workflow });
});

workflowsRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(workflows)
    .set({
      name: body.name,
      description: body.description,
      nodes: body.nodes,
      connections: body.connections,
      updatedAt: new Date(),
    })
    .where(eq(workflows.id, id))
    .returning();
  return c.json({ workflow: updated });
});

workflowsRouter.post("/:id/activate", async (c) => {
  const id = c.req.param("id");
  const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  if (!workflow) return c.json({ error: "Not found" }, 404);

  const [updated] = await db.update(workflows)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(workflows.id, id))
    .returning();

  // Notify the workflow service to register webhooks and cron schedules
  try {
    await fetch(`${WORKFLOW_SERVICE_URL}/webhook/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflowId: id,
        webhookUrl: workflow.webhookUrl,
        nodes: workflow.nodes,
      }),
    });
  } catch (err) {
    console.error(`[Workflows] Failed to notify workflow service:`, err);
  }

  return c.json({ workflow: updated });
});

workflowsRouter.post("/:id/deactivate", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(workflows)
    .set({ status: "inactive", updatedAt: new Date() })
    .where(eq(workflows.id, id))
    .returning();

  try {
    await fetch(`${WORKFLOW_SERVICE_URL}/webhook/unregister`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflowId: id }),
    });
  } catch (err) {
    console.error(`[Workflows] Failed to notify workflow service:`, err);
  }

  return c.json({ workflow: updated });
});

workflowsRouter.post("/:id/execute", async (c) => {
  const id = c.req.param("id");
  const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  if (!workflow) return c.json({ error: "Not found" }, 404);

  const [execution] = await db.insert(workflowExecutions).values({
    workflowId: id,
    status: "running",
  }).returning();

  // Trigger execution via workflow service
  try {
    await fetch(`${WORKFLOW_SERVICE_URL}/webhook/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflowId: id }),
    });
  } catch (err) {
    console.error(`[Workflows] Failed to trigger workflow service:`, err);
  }

  return c.json({ execution, message: "Workflow execution started" });
});

workflowsRouter.get("/:id/executions", async (c) => {
  const id = c.req.param("id");
  const all = await db.select().from(workflowExecutions).where(eq(workflowExecutions.workflowId, id));
  return c.json({ executions: all });
});

workflowsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.update(workflows).set({ status: "inactive" }).where(eq(workflows.id, id));

  try {
    await fetch(`${WORKFLOW_SERVICE_URL}/webhook/unregister`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflowId: id }),
    });
  } catch (err) {
    console.error(`[Workflows] Failed to notify workflow service:`, err);
  }

  await db.delete(workflows).where(eq(workflows.id, id));
  return c.json({ success: true });
});
