import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, users, organizations, projects, deployments, databases, wordpressSites } from "@cloudhost/db";

export const adminRouter = new Hono();

adminRouter.get("/stats", async (c) => {
  const totalUsers = (await db.select().from(users)).length;
  const totalOrgs = (await db.select().from(organizations)).length;
  const totalProjects = (await db.select().from(projects)).length;
  const totalDeployments = (await db.select().from(deployments)).length;
  const totalDatabases = (await db.select().from(databases)).length;
  const totalWpSites = (await db.select().from(wordpressSites)).length;

  return c.json({
    stats: {
      users: totalUsers,
      organizations: totalOrgs,
      projects: totalProjects,
      deployments: totalDeployments,
      databases: totalDatabases,
      wordpressSites: totalWpSites,
    }
  });
});

adminRouter.get("/users", async (c) => {
  const all = await db.select().from(users);
  return c.json({ users: all });
});

adminRouter.put("/users/:id/role", async (c) => {
  const id = c.req.param("id");
  const { role } = await c.req.json();
  const isAdmin = role === "admin";
  const [updated] = await db.update(users).set({ isAdmin }).where(eq(users.id, id)).returning();
  return c.json({ user: updated });
});

adminRouter.delete("/users/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(users).where(eq(users.id, id));
  return c.json({ success: true });
});

adminRouter.get("/system", async (c) => {
  const cpus = require("os").cpus().length;
  const freemem = require("os").freemem();
  const totalmem = require("os").totalmem();
  const uptime = require("os").uptime();

  return c.json({
    system: {
      platform: process.platform,
      cpus,
      memory: { free: freemem, total: totalmem, usage: ((totalmem - freemem) / totalmem * 100).toFixed(1) },
      uptime,
      nodeVersion: process.version,
    }
  });
});
