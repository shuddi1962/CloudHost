import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, rlsPolicies } from "@cloudhost/db";

export const rlsRouter = new Hono();

rlsRouter.get("/database/:databaseId", async (c) => {
  const databaseId = c.req.param("databaseId");
  const all = await db.select().from(rlsPolicies).where(eq(rlsPolicies.databaseId, databaseId));
  return c.json({ policies: all });
});

rlsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const [policy] = await db.insert(rlsPolicies).values({
    databaseId: body.databaseId,
    tableName: body.tableName,
    name: body.name,
    definition: body.definition,
    policyType: body.policyType || "all",
    role: body.role || "authenticated",
  }).returning();
  return c.json({ policy }, 201);
});

rlsRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(rlsPolicies)
    .set({ name: body.name, definition: body.definition, policyType: body.policyType, role: body.role, enabled: body.enabled, updatedAt: new Date() })
    .where(eq(rlsPolicies.id, id))
    .returning();
  return c.json({ policy: updated });
});

rlsRouter.post("/:id/toggle", async (c) => {
  const id = c.req.param("id");
  const [policy] = await db.select().from(rlsPolicies).where(eq(rlsPolicies.id, id)).limit(1);
  if (!policy) return c.json({ error: "Not found" }, 404);
  const [updated] = await db.update(rlsPolicies)
    .set({ enabled: !policy.enabled, updatedAt: new Date() })
    .where(eq(rlsPolicies.id, id))
    .returning();
  return c.json({ policy: updated });
});

rlsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(rlsPolicies).where(eq(rlsPolicies.id, id));
  return c.json({ success: true });
});
