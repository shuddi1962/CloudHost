import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, hostingAccounts, cronJobs, ftpAccounts, phpSettings } from "@cloudhost/db";
import { randomBytes } from "crypto";

export const hostingRouter = new Hono();

hostingRouter.post("/account", async (c) => {
  const body = await c.req.json();
  const payload = c.get("jwtPayload") as { sub: string };
  const [account] = await db.insert(hostingAccounts).values({
    userId: payload.sub,
    domain: body.domain,
    package: body.package || "free",
    phpVersion: body.phpVersion || "8.2",
    serverIp: "10.0.1." + Math.floor(Math.random() * 254 + 1),
  }).returning();
  return c.json({ account }, 201);
});

hostingRouter.get("/account", async (c) => {
  const payload = c.get("jwtPayload") as { sub: string };
  const accounts = await db.select().from(hostingAccounts).where(eq(hostingAccounts.userId, payload.sub));
  return c.json({ accounts });
});

hostingRouter.get("/account/:id", async (c) => {
  const id = c.req.param("id");
  const [account] = await db.select().from(hostingAccounts).where(eq(hostingAccounts.id, id)).limit(1);
  if (!account) return c.json({ error: "Not found" }, 404);
  return c.json({ account });
});

hostingRouter.put("/account/:id/php", async (c) => {
  const id = c.req.param("id");
  const { version } = await c.req.json();
  const [updated] = await db.update(hostingAccounts).set({ phpVersion: version, updatedAt: new Date() }).where(eq(hostingAccounts.id, id)).returning();
  return c.json({ account: updated });
});

hostingRouter.post("/account/:id/suspend", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(hostingAccounts).set({ status: "suspended" }).where(eq(hostingAccounts.id, id)).returning();
  return c.json({ account: updated });
});

hostingRouter.post("/account/:id/unsuspend", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(hostingAccounts).set({ status: "active" }).where(eq(hostingAccounts.id, id)).returning();
  return c.json({ account: updated });
});

hostingRouter.delete("/account/:id", async (c) => {
  const id = c.req.param("id");
  await db.update(hostingAccounts).set({ status: "terminated" }).where(eq(hostingAccounts.id, id));
  return c.json({ success: true });
});

hostingRouter.get("/account/:id/cron", async (c) => {
  const id = c.req.param("id");
  const jobs = await db.select().from(cronJobs).where(eq(cronJobs.hostingAccountId, id));
  return c.json({ cronJobs: jobs });
});

hostingRouter.post("/cron", async (c) => {
  const body = await c.req.json();
  const [job] = await db.insert(cronJobs).values({
    hostingAccountId: body.hostingAccountId,
    command: body.command,
    schedule: body.schedule,
  }).returning();
  return c.json({ cronJob: job }, 201);
});

hostingRouter.put("/cron/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(cronJobs).set({ command: body.command, schedule: body.schedule, status: body.status }).where(eq(cronJobs.id, id)).returning();
  return c.json({ cronJob: updated });
});

hostingRouter.post("/cron/:id/toggle", async (c) => {
  const id = c.req.param("id");
  const [job] = await db.select().from(cronJobs).where(eq(cronJobs.id, id)).limit(1);
  if (!job) return c.json({ error: "Not found" }, 404);
  const [updated] = await db.update(cronJobs).set({ status: job.status === "active" ? "inactive" : "active" }).where(eq(cronJobs.id, id)).returning();
  return c.json({ cronJob: updated });
});

hostingRouter.delete("/cron/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(cronJobs).where(eq(cronJobs.id, id));
  return c.json({ success: true });
});

hostingRouter.get("/account/:id/ftp", async (c) => {
  const id = c.req.param("id");
  const accounts = await db.select().from(ftpAccounts).where(eq(ftpAccounts.hostingAccountId, id));
  return c.json({ ftpAccounts: accounts });
});

hostingRouter.post("/ftp", async (c) => {
  const body = await c.req.json();
  const password = randomBytes(12).toString("hex");
  const [account] = await db.insert(ftpAccounts).values({
    hostingAccountId: body.hostingAccountId,
    username: body.username,
    password: body.password || password,
    directory: body.directory || "/",
    permissions: body.permissions || "read_write",
  }).returning();
  return c.json({ ftpAccount: account }, 201);
});

hostingRouter.put("/ftp/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db.update(ftpAccounts).set({
    directory: body.directory, permissions: body.permissions,
    status: body.status,
  }).where(eq(ftpAccounts.id, id)).returning();
  return c.json({ ftpAccount: updated });
});

hostingRouter.post("/ftp/:id/reset-password", async (c) => {
  const id = c.req.param("id");
  const password = randomBytes(12).toString("hex");
  const [updated] = await db.update(ftpAccounts).set({ password }).where(eq(ftpAccounts.id, id)).returning();
  return c.json({ ftpAccount: updated, newPassword: password });
});

hostingRouter.delete("/ftp/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(ftpAccounts).where(eq(ftpAccounts.id, id));
  return c.json({ success: true });
});

hostingRouter.get("/account/:id/php-settings", async (c) => {
  const id = c.req.param("id");
  const [settings] = await db.select().from(phpSettings).where(eq(phpSettings.hostingAccountId, id)).limit(1);
  return c.json({ settings: settings || { version: "8.2", memoryLimit: "256M", maxUploadSize: "64M", maxExecutionTime: "120", extensions: [] } });
});

hostingRouter.put("/account/:id/php-settings", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const existing = await db.select().from(phpSettings).where(eq(phpSettings.hostingAccountId, id)).limit(1);
  if (existing.length > 0) {
    const [updated] = await db.update(phpSettings).set({
      version: body.version, memoryLimit: body.memoryLimit, maxUploadSize: body.maxUploadSize,
      maxExecutionTime: body.maxExecutionTime, extensions: body.extensions, updatedAt: new Date(),
    }).where(eq(phpSettings.hostingAccountId, id)).returning();
    return c.json({ settings: updated });
  }

  const [created] = await db.insert(phpSettings).values({
    hostingAccountId: id, version: body.version || "8.2", memoryLimit: body.memoryLimit || "256M",
    maxUploadSize: body.maxUploadSize || "64M", maxExecutionTime: body.maxExecutionTime || "120",
    extensions: body.extensions || [],
  }).returning();
  return c.json({ settings: created }, 201);
});

const phpVersions = ["8.3", "8.2", "8.1", "8.0", "7.4", "7.3"];
const phpExtensions = ["curl", "gd", "mbstring", "xml", "zip", "bcmath", "imagick", "intl", "mysqli", "pdo", "pdo_mysql", "pdo_pgsql", "redis", "soap", "sodium", "opcache", "apcu", "exif", "fileinfo", "gettext", "json", "openssl", "tokenizer"];

hostingRouter.get("/php-info", async (c) => {
  return c.json({ versions: phpVersions, extensions: phpExtensions });
});
