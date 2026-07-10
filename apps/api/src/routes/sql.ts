import { Hono } from "hono";
import postgres from "postgres";

export const sqlRouter = new Hono();

sqlRouter.post("/execute", async (c) => {
  const { connectionString, query } = await c.req.json();
  if (!query) return c.json({ error: "Query is required" }, 400);

  try {
    const sql = postgres(connectionString);
    const result = await sql.unsafe(query);
    const columns = result.length > 0 ? Object.keys(result[0]) : [];
    return c.json({ columns, rows: result, rowCount: result.length });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

sqlRouter.post("/tables", async (c) => {
  const { connectionString } = await c.req.json();
  try {
    const sql = postgres(connectionString);
    const tables = await sql`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `;
    return c.json({ tables });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

sqlRouter.post("/describe", async (c) => {
  const { connectionString, table } = await c.req.json();
  try {
    const sql = postgres(connectionString);
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = ${table}
      ORDER BY ordinal_position
    `;
    return c.json({ columns });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});
