import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, buckets, storageObjects } from "@cloudhost/db";

export const storageRouter = new Hono();

storageRouter.get("/buckets/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const all = await db.select().from(buckets).where(eq(buckets.projectId, projectId));
  return c.json({ buckets: all });
});

storageRouter.post("/buckets", async (c) => {
  const body = await c.req.json();
  const [bucket] = await db.insert(buckets).values({
    projectId: body.projectId,
    name: body.name,
    public: body.public || false,
  }).returning();
  return c.json({ bucket }, 201);
});

storageRouter.put("/buckets/:id/toggle-public", async (c) => {
  const id = c.req.param("id");
  const [bucket] = await db.select().from(buckets).where(eq(buckets.id, id)).limit(1);
  if (!bucket) return c.json({ error: "Not found" }, 404);
  const [updated] = await db.update(buckets).set({ public: !bucket.public }).where(eq(buckets.id, id)).returning();
  return c.json({ bucket: updated });
});

storageRouter.delete("/buckets/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(buckets).where(eq(buckets.id, id));
  return c.json({ success: true });
});

storageRouter.get("/objects/:bucketId", async (c) => {
  const bucketId = c.req.param("bucketId");
  const all = await db.select().from(storageObjects).where(eq(storageObjects.bucketId, bucketId));
  return c.json({ objects: all });
});

storageRouter.post("/objects", async (c) => {
  const body = await c.req.json();
  const [object] = await db.insert(storageObjects).values({
    bucketId: body.bucketId,
    name: body.name,
    path: body.path,
    size: body.size || 0,
    mimeType: body.mimeType || "application/octet-stream",
  }).returning();
  return c.json({ object }, 201);
});

storageRouter.delete("/objects/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(storageObjects).where(eq(storageObjects.id, id));
  return c.json({ success: true });
});
