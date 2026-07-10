import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, credentials } from "@cloudhost/db";

export const credentialsRouter = new Hono();

credentialsRouter.get("/project/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const all = await db.select().from(credentials).where(eq(credentials.projectId, projectId));
  return c.json({ credentials: all.map(c => ({ ...c, data: "***hidden***" })) });
});

credentialsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const [cred] = await db.insert(credentials).values({
    projectId: body.projectId,
    name: body.name,
    type: body.type,
    data: body.data,
  }).returning();
  return c.json({ credential: { ...cred, data: "***hidden***" } }, 201);
});

credentialsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [cred] = await db.select().from(credentials).where(eq(credentials.id, id)).limit(1);
  if (!cred) return c.json({ error: "Not found" }, 404);
  return c.json({ credential: cred });
});

credentialsRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(credentials)
    .set({ name: body.name, data: body.data, updatedAt: new Date() })
    .where(eq(credentials.id, id))
    .returning();
  return c.json({ credential: { ...updated, data: "***hidden***" } });
});

credentialsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(credentials).where(eq(credentials.id, id));
  return c.json({ success: true });
});
