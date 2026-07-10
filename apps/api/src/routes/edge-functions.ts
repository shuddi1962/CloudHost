import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, edgeFunctions, edgeFunctionLogs } from "@cloudhost/db";

export const edgeFunctionsRouter = new Hono();

edgeFunctionsRouter.get("/project/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const all = await db.select().from(edgeFunctions).where(eq(edgeFunctions.projectId, projectId));
  return c.json({ functions: all });
});

edgeFunctionsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const slug = body.name.toLowerCase().replace(/\s+/g, "-");
  const [fn] = await db.insert(edgeFunctions).values({
    projectId: body.projectId,
    name: body.name,
    slug,
    sourceCode: body.sourceCode,
    runtime: body.runtime || "deno",
    url: `/api/edge/${slug}`,
    environment: body.environment || {},
  }).returning();
  return c.json({ function: fn }, 201);
});

edgeFunctionsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [fn] = await db.select().from(edgeFunctions).where(eq(edgeFunctions.id, id)).limit(1);
  if (!fn) return c.json({ error: "Not found" }, 404);
  return c.json({ function: fn });
});

edgeFunctionsRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(edgeFunctions)
    .set({ sourceCode: body.sourceCode, environment: body.environment, updatedAt: new Date() })
    .where(eq(edgeFunctions.id, id))
    .returning();
  return c.json({ function: updated });
});

edgeFunctionsRouter.post("/:id/deploy", async (c) => {
  const id = c.req.param("id");
  await db.insert(edgeFunctionLogs).values({ functionId: id, message: "Deploying function...", type: "info" });

  setTimeout(async () => {
    await db.update(edgeFunctions).set({ status: "active" }).where(eq(edgeFunctions.id, id));
    await db.insert(edgeFunctionLogs).values({ functionId: id, message: "Function deployed and active", type: "info" });
  }, 3000);

  const [updated] = await db.update(edgeFunctions).set({ status: "active", updatedAt: new Date() }).where(eq(edgeFunctions.id, id)).returning();
  return c.json({ function: updated, message: "Deploying function..." });
});

edgeFunctionsRouter.post("/:id/deactivate", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(edgeFunctions).set({ status: "inactive" }).where(eq(edgeFunctions.id, id)).returning();
  return c.json({ function: updated });
});

edgeFunctionsRouter.get("/:id/logs", async (c) => {
  const id = c.req.param("id");
  const logs = await db.select().from(edgeFunctionLogs).where(eq(edgeFunctionLogs.functionId, id));
  return c.json({ logs });
});

edgeFunctionsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(edgeFunctions).where(eq(edgeFunctions.id, id));
  return c.json({ success: true });
});
