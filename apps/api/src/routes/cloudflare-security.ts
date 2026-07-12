import { Hono } from "hono";
import { eq } from "drizzle-orm";
import {
  db, wafRules, ddosProtection, magicTransit, networkFirewall,
  rateLimiting, sslCertificates, turnstile, clientSideSecurity
} from "@cloudhost/db";
import { cfFetch, cfFetchOrNull } from "../lib/cloudflare";

export const cloudflareSecurityRouter = new Hono();

const jwtPayload = (c: any) => c.get("jwtPayload") as { sub: string };

const resolveZone = (body?: any) => body?.zone || process.env.CLOUDFLARE_ZONE_ID || "";

// ── WAF Rules ────────────────────────────────────────────────
cloudflareSecurityRouter.get("/waf", async (c) => {
  const list = await db.select().from(wafRules).where(eq(wafRules.userId, jwtPayload(c).sub));
  return c.json({ rules: list });
});

cloudflareSecurityRouter.post("/waf", async (c) => {
  const body = await c.req.json();
  const zone = resolveZone(body);
  const cfRes = await cfFetchOrNull(`/zones/${zone}/rulesets/rules`, {
    method: "POST",
    body: JSON.stringify({
      name: body.name, description: body.description, action: body.action,
      expression: body.expression, priority: body.priority,
      group: body.group, ruleset: body.ruleset, category: body.category,
    }),
  });
  const [created] = await db.insert(wafRules).values({
    userId: jwtPayload(c).sub, name: body.name, description: body.description,
    action: body.action, expression: body.expression, priority: body.priority,
    group: body.group, ruleset: body.ruleset, category: body.category,
    ref: cfRes?.result?.id || null,
  }).returning();
  return c.json({ rule: created }, 201);
});

cloudflareSecurityRouter.put("/waf/:id", async (c) => {
  const body = await c.req.json();
  const [existing] = await db.select().from(wafRules).where(eq(wafRules.id, c.req.param("id"))).limit(1);
  if (existing?.ref) {
    const zone = resolveZone();
    await cfFetchOrNull(`/zones/${zone}/rulesets/rules/${existing.ref}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }
  const [updated] = await db.update(wafRules).set({ ...body, updatedAt: new Date() }).where(eq(wafRules.id, c.req.param("id"))).returning();
  return c.json({ rule: updated });
});

cloudflareSecurityRouter.post("/waf/:id/toggle", async (c) => {
  const [r] = await db.select().from(wafRules).where(eq(wafRules.id, c.req.param("id"))).limit(1);
  if (!r) return c.json({ error: "Not found" }, 404);
  const newStatus = r.status === "active" ? "inactive" : "active";
  if (r.ref) {
    const zone = resolveZone();
    await cfFetchOrNull(`/zones/${zone}/rulesets/rules/${r.ref}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: newStatus === "active" }),
    });
  }
  const [updated] = await db.update(wafRules).set({ status: newStatus, updatedAt: new Date() }).where(eq(wafRules.id, c.req.param("id"))).returning();
  return c.json({ rule: updated });
});

cloudflareSecurityRouter.delete("/waf/:id", async (c) => {
  const [existing] = await db.select().from(wafRules).where(eq(wafRules.id, c.req.param("id"))).limit(1);
  if (existing?.ref) {
    const zone = resolveZone();
    await cfFetchOrNull(`/zones/${zone}/rulesets/rules/${existing.ref}`, { method: "DELETE" });
  }
  await db.update(wafRules).set({ status: "deleted", updatedAt: new Date() }).where(eq(wafRules.id, c.req.param("id")));
  return c.json({ success: true });
});

// ── DDoS Protection ─────────────────────────────────────────
cloudflareSecurityRouter.get("/ddos", async (c) => {
  const list = await db.select().from(ddosProtection).where(eq(ddosProtection.userId, jwtPayload(c).sub));
  return c.json({ ddosProtections: list });
});

cloudflareSecurityRouter.post("/ddos", async (c) => {
  const body = await c.req.json();
  const zone = resolveZone(body);
  const cfRes = await cfFetchOrNull(`/zones/${zone}/ddos_protection`, {
    method: "POST",
    body: JSON.stringify({ mode: body.mode, thresholds: body.thresholds }),
  });
  const [created] = await db.insert(ddosProtection).values({
    userId: jwtPayload(c).sub, name: body.name, mode: body.mode,
    thresholds: body.thresholds, alerts: body.alerts,
    rules: cfRes?.result?.id ? [{ providerId: cfRes.result.id }] : body.rules,
  }).returning();
  return c.json({ ddosProtection: created }, 201);
});

cloudflareSecurityRouter.put("/ddos/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(ddosProtection).set({ ...body, updatedAt: new Date() }).where(eq(ddosProtection.id, c.req.param("id"))).returning();
  return c.json({ ddosProtection: updated });
});

cloudflareSecurityRouter.delete("/ddos/:id", async (c) => {
  const [existing] = await db.select().from(ddosProtection).where(eq(ddosProtection.id, c.req.param("id"))).limit(1);
  const pid = Array.isArray(existing?.rules) ? existing.rules[0]?.providerId : null;
  if (pid) {
    const zone = resolveZone();
    await cfFetchOrNull(`/zones/${zone}/ddos_protection/${pid}`, { method: "DELETE" });
  }
  await db.delete(ddosProtection).where(eq(ddosProtection.id, c.req.param("id")));
  return c.json({ success: true });
});

// ── Magic Transit ───────────────────────────────────────────
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

// ── Network Firewall ────────────────────────────────────────
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

// ── Rate Limiting ───────────────────────────────────────────
cloudflareSecurityRouter.get("/rate-limiting", async (c) => {
  const list = await db.select().from(rateLimiting).where(eq(rateLimiting.userId, jwtPayload(c).sub));
  return c.json({ rateLimits: list });
});

cloudflareSecurityRouter.post("/rate-limiting", async (c) => {
  const body = await c.req.json();
  const zone = resolveZone(body);
  const cfRes = await cfFetchOrNull(`/zones/${zone}/rate_limits`, {
    method: "POST",
    body: JSON.stringify({
      name: body.name, description: body.description,
      thresholds: body.thresholds, action: body.action,
      expression: body.expression,
      counting_expression: body.countingExpression,
      mitigation_timeout: body.mitigationTimeout,
    }),
  });
  const [created] = await db.insert(rateLimiting).values({
    userId: jwtPayload(c).sub, name: body.name, description: body.description,
    thresholds: cfRes?.result?.id ? { ...(body.thresholds || {}), cfProviderId: cfRes.result.id } : body.thresholds,
    action: body.action, expression: body.expression,
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
  const newStatus = r.status === "active" ? "inactive" : "active";
  const pid = (r.thresholds as any)?.cfProviderId;
  if (pid) {
    const zone = resolveZone();
    await cfFetchOrNull(`/zones/${zone}/rate_limits/${pid}`, {
      method: "PATCH",
      body: JSON.stringify({ disabled: newStatus !== "active" }),
    });
  }
  const [updated] = await db.update(rateLimiting).set({ status: newStatus, updatedAt: new Date() }).where(eq(rateLimiting.id, c.req.param("id"))).returning();
  return c.json({ rateLimit: updated });
});

cloudflareSecurityRouter.delete("/rate-limiting/:id", async (c) => {
  const [existing] = await db.select().from(rateLimiting).where(eq(rateLimiting.id, c.req.param("id"))).limit(1);
  const pid = (existing?.thresholds as any)?.cfProviderId;
  if (pid) {
    const zone = resolveZone();
    await cfFetchOrNull(`/zones/${zone}/rate_limits/${pid}`, { method: "DELETE" });
  }
  await db.delete(rateLimiting).where(eq(rateLimiting.id, c.req.param("id")));
  return c.json({ success: true });
});

// ── SSL Certificates ────────────────────────────────────────
cloudflareSecurityRouter.get("/ssl", async (c) => {
  const list = await db.select().from(sslCertificates).where(eq(sslCertificates.userId, jwtPayload(c).sub));
  return c.json({ certificates: list });
});

cloudflareSecurityRouter.post("/ssl", async (c) => {
  const body = await c.req.json();
  const zone = resolveZone(body);
  const validFrom = new Date();
  const validTo = new Date(Date.now() + 90 * 86400000);
  const cfRes = await cfFetchOrNull(`/zones/${zone}/ssl/certificate_packs`, {
    method: "POST",
    body: JSON.stringify({
      hostname: body.hostname, type: body.type || "universal",
      settings: body.settings, bundle_method: body.bundleMethod,
    }),
  });
  const [created] = await db.insert(sslCertificates).values({
    userId: jwtPayload(c).sub, hostname: body.hostname, type: body.type || "universal",
    issuer: "Cloudflare", signature: "SHA-256", serialNumber: `serial-${Date.now()}`,
    fingerprint: `fingerprint-${Date.now()}`, validFrom, validTo,
    settings: cfRes?.result?.id ? { ...(body.settings || {}), cfPackId: cfRes.result.id } : body.settings,
    bundleMethod: body.bundleMethod,
  }).returning();
  return c.json({ certificate: created }, 201);
});

cloudflareSecurityRouter.post("/ssl/:id/deploy", async (c) => {
  const [existing] = await db.select().from(sslCertificates).where(eq(sslCertificates.id, c.req.param("id"))).limit(1);
  const sslPid = (existing?.settings as any)?.cfPackId;
  if (sslPid) {
    const zone = resolveZone();
    await cfFetchOrNull(`/zones/${zone}/ssl/certificate_packs/${sslPid}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "active" }),
    });
  }
  const [updated] = await db.update(sslCertificates).set({ status: "active", updatedAt: new Date() }).where(eq(sslCertificates.id, c.req.param("id"))).returning();
  return c.json({ certificate: updated });
});

cloudflareSecurityRouter.delete("/ssl/:id", async (c) => {
  const [existing] = await db.select().from(sslCertificates).where(eq(sslCertificates.id, c.req.param("id"))).limit(1);
  const sslDelPid = (existing?.settings as any)?.cfPackId;
  if (sslDelPid) {
    const zone = resolveZone();
    await cfFetchOrNull(`/zones/${zone}/ssl/certificate_packs/${sslDelPid}`, { method: "DELETE" });
  }
  await db.delete(sslCertificates).where(eq(sslCertificates.id, c.req.param("id")));
  return c.json({ success: true });
});

// ── Turnstile ───────────────────────────────────────────────
cloudflareSecurityRouter.get("/turnstile", async (c) => {
  const list = await db.select().from(turnstile).where(eq(turnstile.userId, jwtPayload(c).sub));
  return c.json({ turnstileSites: list });
});

cloudflareSecurityRouter.post("/turnstile", async (c) => {
  const body = await c.req.json();
  let siteKey = `sitekey-${Date.now().toString(36)}`;
  let secretKey = `secret-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  let cfWidgetId: string | null = null;
  const cfRes = await cfFetchOrNull("/turnstile/widgets", {
    method: "POST",
    body: JSON.stringify({
      name: body.name, domains: [body.domain], mode: body.mode || "invisible",
    }),
  });
  if (cfRes?.result) {
    siteKey = cfRes.result.site_key || siteKey;
    secretKey = cfRes.result.secret_key || secretKey;
    cfWidgetId = cfRes.result.id || null;
  }
  const baseSettings = body.settings || {};
  const [created] = await db.insert(turnstile).values({
    userId: jwtPayload(c).sub, name: body.name, domain: body.domain,
    siteKey, secretKey, mode: body.mode || "invisible",
    settings: cfWidgetId ? { ...baseSettings, cfWidgetId } : body.settings,
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
  const newStatus = t.status === "active" ? "inactive" : "active";
  const pid = (t.settings as any)?.cfWidgetId;
  if (pid) {
    await cfFetchOrNull(`/turnstile/widgets/${pid}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });
  }
  const [updated] = await db.update(turnstile).set({ status: newStatus, updatedAt: new Date() }).where(eq(turnstile.id, c.req.param("id"))).returning();
  return c.json({ turnstile: updated });
});

cloudflareSecurityRouter.delete("/turnstile/:id", async (c) => {
  const [existing] = await db.select().from(turnstile).where(eq(turnstile.id, c.req.param("id"))).limit(1);
  const pid = (existing?.settings as any)?.cfWidgetId;
  if (pid) {
    await cfFetchOrNull(`/turnstile/widgets/${pid}`, { method: "DELETE" });
  }
  await db.delete(turnstile).where(eq(turnstile.id, c.req.param("id")));
  return c.json({ success: true });
});

// ── Client-Side Security ────────────────────────────────────
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
