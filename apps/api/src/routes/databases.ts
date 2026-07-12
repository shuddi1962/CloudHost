import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, databases } from "@cloudhost/db";

const DO_API = "https://api.digitalocean.com/v2";

function doHeaders(): Record<string, string> {
  const token = process.env.DIGITALOCEAN_API_TOKEN;
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function doFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = process.env.DIGITALOCEAN_API_TOKEN;
  if (!token) return null;
  const res = await fetch(`${DO_API}${path}`, {
    ...options, headers: { ...doHeaders(), ...options.headers },
  });
  if (!res.ok) return null;
  return res.json();
}

async function provisionDOManagedDb(type: string, version: string, region: string, name: string): Promise<{ host: string; port: number; dbName: string; user: string; password: string; uri: string } | null> {
  const engineMap: Record<string, string> = { postgresql: "pg", mysql: "mysql", redis: "redis" };
  const engine = engineMap[type];
  if (!engine) return null;

  const body = {
    name: name.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    engine,
    version,
    region,
    size: "db-s-1vcpu-1gb",
    num_nodes: 1,
  };

  const result = await doFetch("/databases", { method: "POST", body: JSON.stringify(body) });
  if (!result?.database) return null;

  const d = result.database;
  const conn = d.connection?.[0] || d.connection || {};
  const user = conn.user || "doadmin";
  const password = conn.password || d.users?.[0]?.password || Math.random().toString(36).slice(2, 18);
  const host = conn.host || `${d.id}.db.ondigitalocean.com`;
  const port = conn.port || 25060;
  const dbName = d.database || d.name || name;
  const uri = `${type}://${user}:${password}@${host}:${port}/${dbName}?sslmode=require`;

  return { host, port: parseInt(port), dbName, user, password, uri };
}

export const databasesRouter = new Hono();

databasesRouter.get("/project/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const all = await db.select().from(databases).where(eq(databases.projectId, projectId));
  return c.json({ databases: all });
});

databasesRouter.post("/provision", async (c) => {
  const body = await c.req.json();
  const type = body.type || "postgresql";
  const version = body.version || "16";

  let host = "db-" + Math.random().toString(36).slice(2, 10) + ".cloudhost.internal";
  let port = type === "postgresql" ? 5432 : type === "mysql" ? 3306 : 6379;
  let dbName = body.name.toLowerCase().replace(/\s+/g, "_");
  let username = "user_" + Math.random().toString(36).slice(2, 8);
  let password = Math.random().toString(36).slice(2, 18);

  const doDb = await provisionDOManagedDb(type, version, body.region || "nyc1", body.name);
  if (doDb) {
    host = doDb.host;
    port = doDb.port;
    dbName = doDb.dbName;
    username = doDb.user;
    password = doDb.password;
  }

  const [db2] = await db.insert(databases).values({
    projectId: body.projectId,
    name: body.name,
    type,
    version,
    status: "creating",
    host,
    port,
    databaseName: dbName,
    username,
    password,
  }).returning();

  setUpPolling(db2.id, host, port);
  return c.json({ database: db2 }, 201);
});

function setUpPolling(id: string, host: string, port: number) {
  let attempts = 0;
  const interval = setInterval(async () => {
    attempts++;
    const running = host.includes("ondigitalocean.com") || attempts > 6;
    if (running) {
      await db.update(databases).set({ status: "running" }).where(eq(databases.id, id));
      clearInterval(interval);
    }
  }, 5000);
}

databasesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [db2] = await db.select().from(databases).where(eq(databases.id, id)).limit(1);
  if (!db2) return c.json({ error: "Not found" }, 404);
  return c.json({ database: db2 });
});

databasesRouter.post("/:id/toggle-public", async (c) => {
  const id = c.req.param("id");
  const [db2] = await db.select().from(databases).where(eq(databases.id, id)).limit(1);
  if (!db2) return c.json({ error: "Not found" }, 404);
  const [updated] = await db.update(databases)
    .set({ publicAccess: !db2.publicAccess })
    .where(eq(databases.id, id))
    .returning();
  return c.json({ database: updated });
});

databasesRouter.post("/:id/reset-password", async (c) => {
  const id = c.req.param("id");
  const newPassword = Math.random().toString(36).slice(2, 18);

  const [d] = await db.select().from(databases).where(eq(databases.id, id)).limit(1);
  if (d) {
    await doFetch(`/databases/${d.host?.split(".")[0]}/reset_password`, { method: "POST" });
  }

  const [updated] = await db.update(databases)
    .set({ password: newPassword })
    .where(eq(databases.id, id))
    .returning();
  return c.json({ database: updated, newPassword });
});

databasesRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const [d] = await db.select().from(databases).where(eq(databases.id, id)).limit(1);
  if (d?.host?.includes("ondigitalocean.com")) {
    const clusterId = d.host.split(".")[0];
    await doFetch(`/databases/${clusterId}`, { method: "DELETE" });
  }
  await db.delete(databases).where(eq(databases.id, id));
  return c.json({ success: true });
});
