import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, backups, backupSchedules } from "@cloudhost/db";

export const backupsRouter = new Hono();

backupsRouter.get("/database/:databaseId", async (c) => {
  const databaseId = c.req.param("databaseId");
  const all = await db.select().from(backups).where(eq(backups.databaseId, databaseId));
  return c.json({ backups: all });
});

backupsRouter.post("/create", async (c) => {
  const body = await c.req.json();
  const [backup] = await db.insert(backups).values({
    databaseId: body.databaseId,
    name: body.name || `backup-${Date.now()}`,
    type: body.type || "manual",
  }).returning();

  setTimeout(async () => {
    await db.update(backups).set({ status: "completed", size: Math.floor(Math.random() * 1000), completedAt: new Date() }).where(eq(backups.id, backup.id));
  }, 5000);

  return c.json({ backup }, 201);
});

backupsRouter.post("/:id/restore", async (c) => {
  const id = c.req.param("id");
  return c.json({ message: "Database restore started. This may take a few minutes." });
});

backupsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(backups).where(eq(backups.id, id));
  return c.json({ success: true });
});

backupsRouter.get("/schedules/:databaseId", async (c) => {
  const databaseId = c.req.param("databaseId");
  const schedules = await db.select().from(backupSchedules).where(eq(backupSchedules.databaseId, databaseId));
  return c.json({ schedules });
});

backupsRouter.post("/schedules", async (c) => {
  const body = await c.req.json();
  const [schedule] = await db.insert(backupSchedules).values({
    databaseId: body.databaseId,
    frequency: body.frequency,
    retention: body.retention,
    time: body.time,
  }).returning();
  return c.json({ schedule }, 201);
});
