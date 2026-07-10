import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db, domains, dnsRecords, organizationMembers } from "@cloudhost/db";

export const domainsRouter = new Hono();

domainsRouter.get("/", async (c) => {
  const payload = c.get("jwtPayload") as { sub: string };
  const memberships = await db.select().from(organizationMembers).where(eq(organizationMembers.userId, payload.sub));
  const orgIds = memberships.map(m => m.organizationId);
  if (orgIds.length === 0) return c.json({ domains: [] });

  const all = await db.select().from(domains).where(
    orgIds.map(id => eq(domains.organizationId, id)).reduce((a, b) => a || b)
  );
  return c.json({ domains: all });
});

domainsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const [domain] = await db.insert(domains).values({
    organizationId: body.organizationId,
    name: body.name,
    dnsRecords: [
      { type: "A", name: "@", value: "YOUR_SERVER_IP", ttl: "3600" },
      { type: "CNAME", name: "www", value: body.name, ttl: "3600" },
    ],
  }).returning();
  return c.json({ domain }, 201);
});

domainsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [domain] = await db.select().from(domains).where(eq(domains.id, id)).limit(1);
  if (!domain) return c.json({ error: "Not found" }, 404);
  return c.json({ domain });
});

domainsRouter.post("/:id/verify", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(domains).set({ verified: true }).where(eq(domains.id, id)).returning();
  return c.json({ domain: updated });
});

domainsRouter.post("/:id/ssl", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(domains).set({ sslEnabled: true }).where(eq(domains.id, id)).returning();
  return c.json({ domain: updated, message: "SSL provisioning started" });
});

domainsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(domains).where(eq(domains.id, id));
  return c.json({ success: true });
});

domainsRouter.get("/:id/dns", async (c) => {
  const id = c.req.param("id");
  const records = await db.select().from(dnsRecords).where(eq(dnsRecords.domainId, id));
  return c.json({ dnsRecords: records });
});

domainsRouter.post("/:id/dns", async (c) => {
  const domainId = c.req.param("id");
  const body = await c.req.json();
  const [record] = await db.insert(dnsRecords).values({
    domainId,
    type: body.type,
    name: body.name,
    value: body.value,
    ttl: body.ttl || "3600",
    priority: body.priority,
  }).returning();
  return c.json({ dnsRecord: record }, 201);
});

domainsRouter.delete("/:id/dns/:recordId", async (c) => {
  const recordId = c.req.param("recordId");
  await db.delete(dnsRecords).where(eq(dnsRecords.id, recordId));
  return c.json({ success: true });
});
