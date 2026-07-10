import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, realtimeSubscriptions, realtimeMessages } from "@cloudhost/db";

export const realtimeRouter = new Hono();

realtimeRouter.get("/database/:databaseId", async (c) => {
  const databaseId = c.req.param("databaseId");
  const all = await db.select().from(realtimeSubscriptions).where(eq(realtimeSubscriptions.databaseId, databaseId));
  return c.json({ subscriptions: all });
});

realtimeRouter.post("/", async (c) => {
  const body = await c.req.json();
  const [sub] = await db.insert(realtimeSubscriptions).values({
    databaseId: body.databaseId,
    name: body.name,
    tableName: body.tableName,
    event: body.event || "*",
    filter: body.filter || {},
  }).returning();
  return c.json({ subscription: sub }, 201);
});

realtimeRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(realtimeSubscriptions)
    .set({ name: body.name, tableName: body.tableName, event: body.event, filter: body.filter, updatedAt: new Date() })
    .where(eq(realtimeSubscriptions.id, id))
    .returning();
  return c.json({ subscription: updated });
});

realtimeRouter.post("/:id/toggle", async (c) => {
  const id = c.req.param("id");
  const [sub] = await db.select().from(realtimeSubscriptions).where(eq(realtimeSubscriptions.id, id)).limit(1);
  if (!sub) return c.json({ error: "Not found" }, 404);
  const newStatus = sub.status === "active" ? "paused" : "active";
  const [updated] = await db.update(realtimeSubscriptions)
    .set({ status: newStatus })
    .where(eq(realtimeSubscriptions.id, id))
    .returning();
  return c.json({ subscription: updated });
});

realtimeRouter.get("/:id/messages", async (c) => {
  const id = c.req.param("id");
  const messages = await db.select().from(realtimeMessages).where(eq(realtimeMessages.subscriptionId, id)).limit(50);
  return c.json({ messages });
});

realtimeRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(realtimeSubscriptions).where(eq(realtimeSubscriptions.id, id));
  return c.json({ success: true });
});
