import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db, databaseExtensions } from "@cloudhost/db";

export const extensionsRouter = new Hono();

const availableExtensions = [
  { name: "pgcrypto", description: "Cryptographic functions", version: "1.3" },
  { name: "pgvector", description: "Vector similarity search for AI/embeddings", version: "0.7" },
  { name: "uuid-ossp", description: "UUID generation", version: "1.1" },
  { name: "pg_stat_statements", description: "Query performance monitoring", version: "1.10" },
  { name: "postgis", description: "Geographic information system", version: "3.4" },
  { name: "pg_trgm", description: "Text similarity and fuzzy matching", version: "1.6" },
  { name: "pgraphql", description: "GraphQL support", version: "1.5" },
  { name: "pg_cron", description: "Job scheduler", version: "1.6" },
  { name: "pgmq", description: "Message queue", version: "1.0" },
  { name: "pg_net", description: "HTTP networking for triggers/functions", version: "0.8" },
  { name: "http", description: "HTTP client in SQL", version: "1.0" },
  { name: "pgroonga", description: "Full text search (multilingual)", version: "3.0" },
  { name: "timescaledb", description: "Time-series data", version: "2.14" },
  { name: "hll", description: "HyperLogLog cardinality estimation", version: "2.18" },
  { name: "hypopg", description: "Hypothetical indexes for testing", version: "1.4" },
  { name: "fuzzystrmatch", description: "String similarity matching", version: "1.1" },
  { name: "citext", description: "Case-insensitive text", version: "1.6" },
  { name: "ltree", description: "Hierarchical tree structures", version: "1.2" },
  { name: "pg_prewarm", description: "Cache warming for faster queries", version: "1.2" },
  { name: "pg_surgery", description: "Low-level tuple surgery", version: "1.0" },
  { name: "pg_readonly", description: "Read-only mode for specific roles", version: "1.0" },
  { name: "pg_repack", description: "Rebuild tables without locks", version: "1.5" },
  { name: "pg_hint_plan", description: "Query plan hints", version: "1.6" },
  { name: "pg_qualstats", description: "WHERE clause statistics", version: "2.1" },
  { name: "pg_tle", description: "Trusted Language Extensions", version: "1.3" },
  { name: "anon", description: "Data anonymization", version: "1.3" },
  { name: "pg_diffix", description: "Privacy-preserving queries", version: "1.0" },
  { name: "pg_idkit", description: "ID generation (ULID, KSUID, etc)", version: "0.2" },
];

extensionsRouter.get("/available", async (c) => {
  return c.json({ extensions: availableExtensions });
});

extensionsRouter.get("/database/:databaseId", async (c) => {
  const databaseId = c.req.param("databaseId");
  const installed = await db.select().from(databaseExtensions).where(eq(databaseExtensions.databaseId, databaseId));
  return c.json({ extensions: installed });
});

extensionsRouter.post("/install", async (c) => {
  const body = await c.req.json();
  const existing = await db.select().from(databaseExtensions)
    .where(and(eq(databaseExtensions.databaseId, body.databaseId), eq(databaseExtensions.name, body.name)))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db.update(databaseExtensions)
      .set({ enabled: true, updatedAt: new Date() })
      .where(eq(databaseExtensions.id, existing[0].id))
      .returning();
    return c.json({ extension: updated });
  }

  const ext = availableExtensions.find(e => e.name === body.name);
  const [installed] = await db.insert(databaseExtensions).values({
    databaseId: body.databaseId,
    name: body.name,
    version: ext?.version || "1.0",
    description: ext?.description || "",
    enabled: true,
  }).returning();
  return c.json({ extension: installed }, 201);
});

extensionsRouter.post("/:id/uninstall", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(databaseExtensions)
    .set({ enabled: false, updatedAt: new Date() })
    .where(eq(databaseExtensions.id, id))
    .returning();
  return c.json({ extension: updated });
});
