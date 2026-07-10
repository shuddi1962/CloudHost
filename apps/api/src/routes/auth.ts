import { Hono } from "hono";
import { sign } from "hono/jwt";
import { eq } from "drizzle-orm";
import { db, users, organizations, organizationMembers } from "@cloudhost/db";
import bcrypt from "bcryptjs";

export const authRouter = new Hono();

authRouter.post("/register", async (c) => {
  const { email, password, name, organizationName } = await c.req.json();

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return c.json({ error: "Email already registered" }, 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(users).values({ email, name, passwordHash }).returning();

  const orgSlug = (organizationName || name).toLowerCase().replace(/\s+/g, "-");
  const [org] = await db.insert(organizations).values({ name: organizationName || name, slug: orgSlug }).returning();
  await db.insert(organizationMembers).values({ organizationId: org.id, userId: user.id, role: "owner" });

  const token = await sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || "dev-secret");

  return c.json({ user: { id: user.id, email: user.email, name: user.name }, organization: org, token });
});

authRouter.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return c.json({ error: "Invalid credentials" }, 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return c.json({ error: "Invalid credentials" }, 401);

  const token = await sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || "dev-secret");
  const orgs = await db.select().from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, user.id));

  return c.json({ user: { id: user.id, email: user.email, name: user.name }, organizations: orgs.map(o => o.organizations), token });
});

authRouter.get("/me", async (c) => {
  const payload = c.get("jwtPayload") as { sub: string };
  const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  if (!user) return c.json({ error: "User not found" }, 404);
  return c.json({ user });
});
