import { Hono } from "hono";
import { eq } from "drizzle-orm";
import {
  db, wafRules, ddosProtection, magicTransit, networkFirewall,
  rateLimiting, sslCertificates, turnstile, clientSideSecurity
} from "@cloudhost/db";

export const cloudflareSecurityRouter = new Hono();

const jwtPayload = (c: any) => c.get("jwtPayload") as { sub: string };

// WAF Rules
cloudflareSecurityRouter.get("/waf", async (c) => {
  const list = await db.select().from(wafRules).where(eq(wafRules.userId, jwtPayload(c).sub));
  return c.json({ rules: list });
});

cloudflareSecurityRouter.post("/waf", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(wafRules).values({
    userId: jwtPayload(c).sub, name: body.name, description: body.description,
    action: body.action, expression: body.expression, priority: body.priority,
    group: body.group, ruleset: body.ruleset, category: body.category,
  }).returning();
  return c.json({ rule: created }, 201);
});

cloudflareSecurityRouter.put("/waf/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(wafRules).set({ ...body, updatedAt: new Date() }).where(eq(wafRules.id, c.req.param("id"))).returning();
  return c.json({ rule: updated });
});

cloudflareSecurityRouter.post("/waf/:id/toggle", async (c) => {
  const [r] = await db.select().from(wafRules).where(eq(wafRules.id, c.req.param("id"))).limit(1);
  if (!r) return c.json({ error: "Not found" }, 404);
  const [updated] = await db.update(wafRules).set({ status: r.status === "active" ? "inactive" : "active", updatedAt: new Date() }).where(eq(wafRules.id, c.req.param("id"))).returning();
  return c.json({ rule: updated });
});

cloudflareSecurityRouter.delete("/waf/:id", async (c) => {
  await db.update(wafRules).set({ status: "deleted", updatedAt: new Date() }).where(eq(wafRules.id, c.req.param("id")));
  return c.json({ success: true });
});

// DDoS Protection
cloudflareSecurityRouter.get("/ddos", async (c) => {
  const list = await db.select().from(ddosProtection).where(eq(ddosProtection.userId, jwtPayload(c).sub));
  return c.json({ ddosProtections: list });
});

cloudflareSecurityRouter.post("/ddos", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(ddosProtection).values({
    userId: jwtPayload(c).sub, name: body.name, mode: body.mode,
    thresholds: body.thresholds, alerts: body.alerts,
  }).returning();
  return c.json({ ddosProtection: created }, 201);
});

cloudflareSecurityRouter.put("/ddos/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(ddosProtection).set({ ...body, updatedAt: new Date() }).where(eq(ddosProtection.id, c.req.param("id"))).returning();
  return c.json({ ddosProtection: updated });
});

// Magic Transit
cloudflareSecurityRouter.get("/magic-transit", async (c) => {
  const list = await db.select().from(magicTransit).where(eq(magicTransit.userId, jwtPayload(c).sub));
  return c.json({ magicTransit: list });
});

cloudflareSecurityRouter.post("/magic-transit", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(magicTransit).values({
    userId: jwtPayload(c).sub, name: body.name, tunnels: body.tunnels,
    routes: body.routes, greTunnels: body.greTunnels, ipsecTunnels: body.ipsecTunnels,
    staticRoutes: body.staticRoutes, healthChecks: body.healthChecks,
  }).returning();
  return c.json({ magicTransit: created }, 201);
});

cloudflareSecurityRouter.put("/magic-transit/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(magicTransit).set({ ...body, updatedAt: new Date() }).where(eq(magicTransit.id, c.req.param("id"))).returning();
  return c.json({ magicTransit: updated });
});

// Network Firewall
cloudflareSecurityRouter.get("/network-firewall", async (c) => {
  const list = await db.select().from(networkFirewall).where(eq(networkFirewall.userId, jwtPayload(c).sub));
  return c.json({ networkFirewalls: list });
});

cloudflareSecurityRouter.post("/network-firewall", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(networkFirewall).values({
    userId: jwtPayload(c).sub, name: body.name, rules: body.rules,
    lists: body.lists, ipLists: body.ipLists, geoRules: body.geoRules,
  }).returning();
  return c.json({ networkFirewall: created }, 201);
});

cloudflareSecurityRouter.put("/network-firewall/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(networkFirewall).set({ ...body, updatedAt: new Date() }).where(eq(networkFirewall.id, c.req.param("id"))).returning();
  return c.json({ networkFirewall: updated });
});

// Rate Limiting
cloudflareSecurityRouter.get("/rate-limiting", async (c) => {
  const list = await db.select().from(rateLimiting).where(eq(rateLimiting.userId, jwtPayload(c).sub));
  return c.json({ rateLimits: list });
});

cloudflareSecurityRouter.post("/rate-limiting", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(rateLimiting).values({
    userId: jwtPayload(c).sub, name: body.name, description: body.description,
    thresholds: body.thresholds, action: body.action, expression: body.expression,
    countingExpression: body.countingExpression, mitigationTimeout: body.mitigationTimeout,
  }).returning();
  return c.json({ rateLimit: created }, 201);
});

cloudflareSecurityRouter.put("/rate-limiting/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(rateLimiting).set({ ...body, updatedAt: new Date() }).where(eq(rateLimiting.id, c.req.param("id"))).returning();
  return c.json({ rateLimit: updated });
});

cloudflareSecurityRouter.post("/rate-limiting/:id/toggle", async (c) => {
  const [r] = await db.select().from(rateLimiting).where(eq(rateLimiting.id, c.req.param("id"))).limit(1);
  if (!r) return c.json({ error: "Not found" }, 404);
  const [updated] = await db.update(rateLimiting).set({ status: r.status === "active" ? "inactive" : "active", updatedAt: new Date() }).where(eq(rateLimiting.id, c.req.param("id"))).returning();
  return c.json({ rateLimit: updated });
});

cloudflareSecurityRouter.delete("/rate-limiting/:id", async (c) => {
  await db.delete(rateLimiting).where(eq(rateLimiting.id, c.req.param("id")));
  return c.json({ success: true });
});

// SSL Certificates
cloudflareSecurityRouter.get("/ssl", async (c) => {
  const list = await db.select().from(sslCertificates).where(eq(sslCertificates.userId, jwtPayload(c).sub));
  return c.json({ certificates: list });
});

cloudflareSecurityRouter.post("/ssl", async (c) => {
  const body = await c.req.json();
  const validFrom = new Date();
  const validTo = new Date(Date.now() + 90 * 86400000);
  const [created] = await db.insert(sslCertificates).values({
    userId: jwtPayload(c).sub, hostname: body.hostname, type: body.type || "universal",
    issuer: "Cloudflare", signature: "SHA-256", serialNumber: `serial-${Date.now()}`,
    fingerprint: `fingerprint-${Date.now()}`, validFrom, validTo,
    settings: body.settings, bundleMethod: body.bundleMethod,
  }).returning();
  return c.json({ certificate: created }, 201);
});

cloudflareSecurityRouter.post("/ssl/:id/deploy", async (c) => {
  const [updated] = await db.update(sslCertificates).set({ status: "active", updatedAt: new Date() }).where(eq(sslCertificates.id, c.req.param("id"))).returning();
  return c.json({ certificate: updated });
});

cloudflareSecurityRouter.delete("/ssl/:id", async (c) => {
  await db.delete(sslCertificates).where(eq(sslCertificates.id, c.req.param("id")));
  return c.json({ success: true });
});

// Turnstile
cloudflareSecurityRouter.get("/turnstile", async (c) => {
  const list = await db.select().from(turnstile).where(eq(turnstile.userId, jwtPayload(c).sub));
  return c.json({ turnstileSites: list });
});

cloudflareSecurityRouter.post("/turnstile", async (c) => {
  const body = await c.req.json();
  const siteKey = `sitekey-${Date.now().toString(36)}`;
  const secretKey = `secret-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const [created] = await db.insert(turnstile).values({
    userId: jwtPayload(c).sub, name: body.name, domain: body.domain,
    siteKey, secretKey, mode: body.mode || "invisible", settings: body.settings,
  }).returning();
  return c.json({ turnstile: created, siteKey, secretKey }, 201);
});

cloudflareSecurityRouter.put("/turnstile/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(turnstile).set({ ...body, updatedAt: new Date() }).where(eq(turnstile.id, c.req.param("id"))).returning();
  return c.json({ turnstile: updated });
});

cloudflareSecurityRouter.post("/turnstile/:id/toggle", async (c) => {
  const [t] = await db.select().from(turnstile).where(eq(turnstile.id, c.req.param("id"))).limit(1);
  if (!t) return c.json({ error: "Not found" }, 404);
  const [updated] = await db.update(turnstile).set({ status: t.status === "active" ? "inactive" : "active", updatedAt: new Date() }).where(eq(turnstile.id, c.req.param("id"))).returning();
  return c.json({ turnstile: updated });
});

cloudflareSecurityRouter.delete("/turnstile/:id", async (c) => {
  await db.delete(turnstile).where(eq(turnstile.id, c.req.param("id")));
  return c.json({ success: true });
});

// Client-Side Security
cloudflareSecurityRouter.get("/client-security", async (c) => {
  const list = await db.select().from(clientSideSecurity).where(eq(clientSideSecurity.userId, jwtPayload(c).sub));
  return c.json({ clientSecurity: list });
});

cloudflareSecurityRouter.post("/client-security", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(clientSideSecurity).values({
    userId: jwtPayload(c).sub, name: body.name, policies: body.policies,
    scripts: body.scripts, alerts: body.alerts,
  }).returning();
  return c.json({ clientSecurity: created }, 201);
});

cloudflareSecurityRouter.put("/client-security/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(clientSideSecurity).set({ ...body, updatedAt: new Date() }).where(eq(clientSideSecurity.id, c.req.param("id"))).returning();
  return c.json({ clientSecurity: updated });
});
