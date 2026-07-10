import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db, users, organizations, organizationMembers } from "@cloudhost/db";
import bcrypt from "bcryptjs";

export const teamRouter = new Hono();

teamRouter.get("/:orgId/members", async (c) => {
  const orgId = c.req.param("orgId");
  const members = await db.select().from(organizationMembers)
    .innerJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, orgId));

  return c.json({ members: members.map(m => ({
    id: m.organization_members.id,
    userId: m.users.id,
    name: m.users.name,
    email: m.users.email,
    role: m.organization_members.role,
    joinedAt: m.organization_members.createdAt,
  })) });
});

teamRouter.post("/:orgId/invite", async (c) => {
  const orgId = c.req.param("orgId");
  const { email, name, role } = await c.req.json();

  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    const tempPassword = Math.random().toString(36).slice(2, 18);
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    [user] = await db.insert(users).values({ email, name: name || email.split("@")[0], passwordHash }).returning();
  }

  const existing = await db.select().from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, user.id)))
    .limit(1);

  if (existing.length > 0) {
    return c.json({ error: "User is already a member" }, 400);
  }

  const [member] = await db.insert(organizationMembers).values({
    organizationId: orgId,
    userId: user.id,
    role: role || "member",
  }).returning();

  return c.json({ member, message: `Invited ${email} to the organization` }, 201);
});

teamRouter.put("/:orgId/members/:memberId", async (c) => {
  const memberId = c.req.param("memberId");
  const { role } = await c.req.json();
  const [updated] = await db.update(organizationMembers)
    .set({ role })
    .where(eq(organizationMembers.id, memberId))
    .returning();
  return c.json({ member: updated });
});

teamRouter.delete("/:orgId/members/:memberId", async (c) => {
  const memberId = c.req.param("memberId");
  await db.delete(organizationMembers).where(eq(organizationMembers.id, memberId));
  return c.json({ success: true });
});
