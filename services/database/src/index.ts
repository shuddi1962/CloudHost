import { db, databases } from "@cloudhost/db";
import { eq } from "drizzle-orm";

console.log("[DB Service] Database provisioning service running");

async function provisionDatabase(dbId: string) {
  const [database] = await db.select().from(databases).where(eq(databases.id, dbId)).limit(1);
  if (!database || database.status !== "creating") return;

  console.log(`[DB Service] Provisioning ${database.type} ${database.name}`);

  // In production: spin up Docker container with PostgreSQL/MySQL/Redis
  // const docker = new Docker();
  // const container = await docker.createContainer({ ... });

  await new Promise(resolve => setTimeout(resolve, 3000));

  await db.update(databases)
    .set({ status: "running", updatedAt: new Date() })
    .where(eq(databases.id, dbId));

  console.log(`[DB Service] ${database.name} is ready`);
}

setInterval(async () => {
  try {
    const pending = await db.select().from(databases).where(eq(databases.status, "creating"));
    for (const db2 of pending) {
      provisionDatabase(db2.id);
    }
  } catch (err) {
    console.error("[DB Service] Error:", err);
  }
}, 5000);
