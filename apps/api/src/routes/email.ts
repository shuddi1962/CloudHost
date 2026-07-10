import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, emailAccounts, organizationMembers } from "@cloudhost/db";

export const emailRouter = new Hono();

emailRouter.get("/", async (c) => {
  const payload = c.get("jwtPayload") as { sub: string };
  const memberships = await db.select().from(organizationMembers).where(eq(organizationMembers.userId, payload.sub));
  const orgIds = memberships.map(m => m.organizationId);
  if (orgIds.length === 0) return c.json({ accounts: [] });

  const all = await db.select().from(emailAccounts).where(
    orgIds.map(id => eq(emailAccounts.organizationId, id)).reduce((a, b) => a || b)
  );
  return c.json({ accounts: all });
});

emailRouter.post("/", async (c) => {
  const body = await c.req.json();
  const [account] = await db.insert(emailAccounts).values({
    organizationId: body.organizationId,
    domainId: body.domainId,
    email: body.email,
    password: body.password,
    quota: body.quota || 1024,
  }).returning();
  return c.json({ account }, 201);
});

emailRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [account] = await db.select().from(emailAccounts).where(eq(emailAccounts.id, id)).limit(1);
  if (!account) return c.json({ error: "Not found" }, 404);
  return c.json({ account });
});

emailRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(emailAccounts)
    .set({ forwardTo: body.forwardTo, autoresponder: body.autoresponder, quota: body.quota })
    .where(eq(emailAccounts.id, id))
    .returning();
  return c.json({ account: updated });
});

emailRouter.post("/:id/toggle", async (c) => {
  const id = c.req.param("id");
  const [account] = await db.select().from(emailAccounts).where(eq(emailAccounts.id, id)).limit(1);
  if (!account) return c.json({ error: "Not found" }, 404);
  const newStatus = account.status === "active" ? "disabled" : "active";
  const [updated] = await db.update(emailAccounts).set({ status: newStatus }).where(eq(emailAccounts.id, id)).returning();
  return c.json({ account: updated });
});

emailRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(emailAccounts).where(eq(emailAccounts.id, id));
  return c.json({ success: true });
});
