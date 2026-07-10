import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, databaseWebhooks, webhookLogs } from "@cloudhost/db";

export const webhooksRouter = new Hono();

webhooksRouter.get("/database/:databaseId", async (c) => {
  const databaseId = c.req.param("databaseId");
  const all = await db.select().from(databaseWebhooks).where(eq(databaseWebhooks.databaseId, databaseId));
  return c.json({ webhooks: all });
});

webhooksRouter.post("/", async (c) => {
  const body = await c.req.json();
  const [webhook] = await db.insert(databaseWebhooks).values({
    databaseId: body.databaseId,
    name: body.name,
    tableName: body.tableName,
    events: body.events || "*",
    url: body.url,
    headers: body.headers || {},
  }).returning();
  return c.json({ webhook }, 201);
});

webhooksRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(databaseWebhooks)
    .set({
      name: body.name, tableName: body.tableName, events: body.events,
      url: body.url, headers: body.headers, enabled: body.enabled, updatedAt: new Date(),
    })
    .where(eq(databaseWebhooks.id, id))
    .returning();
  return c.json({ webhook: updated });
});

webhooksRouter.post("/:id/toggle", async (c) => {
  const id = c.req.param("id");
  const [wh] = await db.select().from(databaseWebhooks).where(eq(databaseWebhooks.id, id)).limit(1);
  if (!wh) return c.json({ error: "Not found" }, 404);
  const [updated] = await db.update(databaseWebhooks)
    .set({ enabled: !wh.enabled })
    .where(eq(databaseWebhooks.id, id))
    .returning();
  return c.json({ webhook: updated });
});

webhooksRouter.get("/:id/logs", async (c) => {
  const id = c.req.param("id");
  const logs = await db.select().from(webhookLogs).where(eq(webhookLogs.webhookId, id)).limit(100);
  return c.json({ logs });
});

webhooksRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(databaseWebhooks).where(eq(databaseWebhooks.id, id));
  return c.json({ success: true });
});
