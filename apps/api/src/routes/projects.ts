import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db, projects, organizationMembers } from "@cloudhost/db";

export const projectsRouter = new Hono();

projectsRouter.get("/", async (c) => {
  const payload = c.get("jwtPayload") as { sub: string };
  const memberships = await db.select().from(organizationMembers).where(eq(organizationMembers.userId, payload.sub));
  const orgIds = memberships.map(m => m.organizationId);
  if (orgIds.length === 0) return c.json({ projects: [] });

  const allProjects = await db.select().from(projects).where(
    orgIds.map(id => eq(projects.organizationId, id)).reduce((a, b) => a || b)
  );
  return c.json({ projects: allProjects });
});

projectsRouter.post("/", async (c) => {
  const payload = c.get("jwtPayload") as { sub: string };
  const { name, description, organizationId } = await c.req.json();

  const [membership] = await db.select().from(organizationMembers)
    .where(and(eq(organizationMembers.userId, payload.sub), eq(organizationMembers.organizationId, organizationId)))
    .limit(1);

  if (!membership) return c.json({ error: "Not authorized" }, 403);

  const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Math.random().toString(36).slice(2, 6);
  const [project] = await db.insert(projects).values({ name, slug, description, organizationId }).returning();
  return c.json({ project }, 201);
});

projectsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return c.json({ error: "Not found" }, 404);
  return c.json({ project });
});

projectsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(projects).where(eq(projects.id, id));
  return c.json({ success: true });
});
