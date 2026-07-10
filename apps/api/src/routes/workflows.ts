import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, workflows, workflowExecutions } from "@cloudhost/db";

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
    .set({ name: body.name, description: body.description, nodes: body.nodes, connections: body.connections, updatedAt: new Date() })
    .where(eq(workflows.id, id))
    .returning();
  return c.json({ workflow: updated });
});

workflowsRouter.post("/:id/activate", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(workflows).set({ status: "active" }).where(eq(workflows.id, id)).returning();
  return c.json({ workflow: updated });
});

workflowsRouter.post("/:id/deactivate", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(workflows).set({ status: "inactive" }).where(eq(workflows.id, id)).returning();
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

  setTimeout(async () => {
    await db.update(workflowExecutions)
      .set({ status: "success", finishedAt: new Date(), output: { message: "Workflow completed successfully" } })
      .where(eq(workflowExecutions.id, execution.id));
    await db.update(workflows).set({ lastRunAt: new Date() }).where(eq(workflows.id, id));
  }, 2000);

  return c.json({ execution, message: "Workflow execution started" });
});

workflowsRouter.get("/:id/executions", async (c) => {
  const id = c.req.param("id");
  const all = await db.select().from(workflowExecutions).where(eq(workflowExecutions.workflowId, id));
  return c.json({ executions: all });
});

workflowsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(workflows).where(eq(workflows.id, id));
  return c.json({ success: true });
});
