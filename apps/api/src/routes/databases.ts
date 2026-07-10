import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, databases } from "@cloudhost/db";

export const databasesRouter = new Hono();

databasesRouter.get("/project/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const all = await db.select().from(databases).where(eq(databases.projectId, projectId));
  return c.json({ databases: all });
});

databasesRouter.post("/provision", async (c) => {
  const body = await c.req.json();
  const [db2] = await db.insert(databases).values({
    projectId: body.projectId,
    name: body.name,
    type: body.type || "postgresql",
    version: body.version || "16",
    status: "creating",
    host: "db-" + Math.random().toString(36).slice(2, 10) + ".cloudhost.internal",
    databaseName: body.name.toLowerCase().replace(/\s+/g, "_"),
    username: "user_" + Math.random().toString(36).slice(2, 8),
    password: Math.random().toString(36).slice(2, 18),
  }).returning();
  return c.json({ database: db2 }, 201);
});

databasesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [db2] = await db.select().from(databases).where(eq(databases.id, id)).limit(1);
  if (!db2) return c.json({ error: "Not found" }, 404);
  return c.json({ database: db2 });
});

databasesRouter.post("/:id/toggle-public", async (c) => {
  const id = c.req.param("id");
  const [db2] = await db.select().from(databases).where(eq(databases.id, id)).limit(1);
  if (!db2) return c.json({ error: "Not found" }, 404);
  const [updated] = await db.update(databases)
    .set({ publicAccess: !db2.publicAccess })
    .where(eq(databases.id, id))
    .returning();
  return c.json({ database: updated });
});

databasesRouter.post("/:id/reset-password", async (c) => {
  const id = c.req.param("id");
  const newPassword = Math.random().toString(36).slice(2, 18);
  const [updated] = await db.update(databases)
    .set({ password: newPassword })
    .where(eq(databases.id, id))
    .returning();
  return c.json({ database: updated, newPassword });
});

databasesRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(databases).where(eq(databases.id, id));
  return c.json({ success: true });
});
