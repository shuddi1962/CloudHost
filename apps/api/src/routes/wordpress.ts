import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, wordpressSites } from "@cloudhost/db";

export const wordpressRouter = new Hono();

wordpressRouter.get("/project/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const all = await db.select().from(wordpressSites).where(eq(wordpressSites.projectId, projectId));
  return c.json({ sites: all });
});

wordpressRouter.post("/provision", async (c) => {
  const body = await c.req.json();
  const adminUser = "admin_" + Math.random().toString(36).slice(2, 8);
  const adminPassword = Math.random().toString(36).slice(2, 18);

  const [site] = await db.insert(wordpressSites).values({
    projectId: body.projectId,
    name: body.name,
    domain: body.domain,
    phpVersion: body.phpVersion || "8.2",
    adminUser,
    adminPassword,
    adminEmail: body.adminEmail || "admin@" + (body.domain || "localhost"),
    status: "installing",
  }).returning();

  setTimeout(async () => {
    await db.update(wordpressSites).set({ status: "running" }).where(eq(wordpressSites.id, site.id));
  }, 5000);

  return c.json({ site, credentials: { adminUser, adminPassword } }, 201);
});

wordpressRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [site] = await db.select().from(wordpressSites).where(eq(wordpressSites.id, id)).limit(1);
  if (!site) return c.json({ error: "Not found" }, 404);
  return c.json({ site });
});

wordpressRouter.post("/:id/restart", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(wordpressSites).set({ status: "running" }).where(eq(wordpressSites.id, id)).returning();
  return c.json({ site: updated });
});

wordpressRouter.post("/:id/stop", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(wordpressSites).set({ status: "stopped" }).where(eq(wordpressSites.id, id)).returning();
  return c.json({ site: updated });
});

wordpressRouter.post("/:id/ssl", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(wordpressSites).set({ sslEnabled: true }).where(eq(wordpressSites.id, id)).returning();
  return c.json({ site: updated, message: "SSL certificate being provisioned" });
});

wordpressRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(wordpressSites).where(eq(wordpressSites.id, id));
  return c.json({ success: true });
});
