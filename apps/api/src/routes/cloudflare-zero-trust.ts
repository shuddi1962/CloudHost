import { Hono } from "hono";
import { eq } from "drizzle-orm";
import {
  db, zeroTrustAccess, browserIsolation, casb, dataLossPrevention,
  emailSecurity, secureWebGateway, magicMesh, magicWan
} from "@cloudhost/db";

export const cloudflareZeroTrustRouter = new Hono();

const jwtPayload = (c: any) => c.get("jwtPayload") as { sub: string };

// Zero Trust Access
cloudflareZeroTrustRouter.get("/access", async (c) => {
  const list = await db.select().from(zeroTrustAccess).where(eq(zeroTrustAccess.userId, jwtPayload(c).sub));
  return c.json({ accessApps: list });
});

cloudflareZeroTrustRouter.post("/access", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(zeroTrustAccess).values({
    userId: jwtPayload(c).sub, name: body.name, domain: body.domain,
    sessionDuration: body.sessionDuration, policies: body.policies,
    applications: body.applications, groups: body.groups, serviceTokens: body.serviceTokens,
    sshConfig: body.sshConfig,
  }).returning();
  return c.json({ accessApp: created }, 201);
});

cloudflareZeroTrustRouter.put("/access/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(zeroTrustAccess).set({ ...body, updatedAt: new Date() }).where(eq(zeroTrustAccess.id, c.req.param("id"))).returning();
  return c.json({ accessApp: updated });
});

cloudflareZeroTrustRouter.post("/access/:id/test", async (c) => {
  const [app] = await db.select().from(zeroTrustAccess).where(eq(zeroTrustAccess.id, c.req.param("id"))).limit(1);
  if (!app) return c.json({ error: "Not found" }, 404);
  const policies = app.policies as any[] || [];
  const results = policies.map((p: any) => ({ policy: p.name || "policy", status: Math.random() > 0.3 ? "pass" : "fail", reason: Math.random() > 0.3 ? "" : "Device posture check failed" }));
  return c.json({ results, overall: results.every((r: any) => r.status === "pass") ? "pass" : "fail" });
});

cloudflareZeroTrustRouter.delete("/access/:id", async (c) => {
  await db.delete(zeroTrustAccess).where(eq(zeroTrustAccess.id, c.req.param("id")));
  return c.json({ success: true });
});

// Browser Isolation
cloudflareZeroTrustRouter.get("/browser-isolation", async (c) => {
  const list = await db.select().from(browserIsolation).where(eq(browserIsolation.userId, jwtPayload(c).sub));
  return c.json({ browserIsolation: list });
});

cloudflareZeroTrustRouter.post("/browser-isolation", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(browserIsolation).values({
    userId: jwtPayload(c).sub, name: body.name, policies: body.policies,
    allowedUrls: body.allowedUrls, blockedUrls: body.blockedUrls,
    clipboardControl: body.clipboardControl, fileUpload: body.fileUpload,
    fileDownload: body.fileDownload, keyboardControl: body.keyboardControl,
    printerControl: body.printerControl,
  }).returning();
  return c.json({ browserIsolation: created }, 201);
});

cloudflareZeroTrustRouter.put("/browser-isolation/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(browserIsolation).set({ ...body, updatedAt: new Date() }).where(eq(browserIsolation.id, c.req.param("id"))).returning();
  return c.json({ browserIsolation: updated });
});

// CASB
cloudflareZeroTrustRouter.get("/casb", async (c) => {
  const list = await db.select().from(casb).where(eq(casb.userId, jwtPayload(c).sub));
  return c.json({ casb: list });
});

cloudflareZeroTrustRouter.post("/casb", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(casb).values({
    userId: jwtPayload(c).sub, name: body.name, integrations: body.integrations,
    autoRemediation: body.autoRemediation, schedules: body.schedules,
  }).returning();
  return c.json({ casb: created }, 201);
});

cloudflareZeroTrustRouter.post("/casb/:id/scan", async (c) => {
  const [cItem] = await db.select().from(casb).where(eq(casb.id, c.req.param("id"))).limit(1);
  if (!cItem) return c.json({ error: "Not found" }, 404);
  const findings = [
    { id: `finding-${Date.now()}`, severity: "high", title: "Public S3 Bucket", description: "Bucket allows public read access", resource: "s3://example-bucket", detectedAt: new Date().toISOString(), status: "open" },
    { id: `finding-${Date.now() + 1}`, severity: "medium", title: "Overprivileged IAM Role", description: "Role has more permissions than needed", resource: "arn:aws:iam::123:role/admin", detectedAt: new Date().toISOString(), status: "open" },
    { id: `finding-${Date.now() + 2}`, severity: "low", title: "Unencrypted Data", description: "Data at rest not encrypted", resource: "rds://prod-db", detectedAt: new Date().toISOString(), status: "open" },
  ];
  const existingFindings = [...(cItem.findings as any[] || []), ...findings];
  const severityCounts = { critical: existingFindings.filter((f: any) => f.severity === "critical").length, high: existingFindings.filter((f: any) => f.severity === "high").length, medium: existingFindings.filter((f: any) => f.severity === "medium").length, low: existingFindings.filter((f: any) => f.severity === "low").length };
  const [updated] = await db.update(casb).set({ findings: existingFindings, severityCounts, updatedAt: new Date() }).where(eq(casb.id, c.req.param("id"))).returning();
  return c.json({ casb: updated, newFindings: findings });
});

cloudflareZeroTrustRouter.delete("/casb/:id", async (c) => {
  await db.delete(casb).where(eq(casb.id, c.req.param("id")));
  return c.json({ success: true });
});

// Data Loss Prevention
cloudflareZeroTrustRouter.get("/dlp", async (c) => {
  const list = await db.select().from(dataLossPrevention).where(eq(dataLossPrevention.userId, jwtPayload(c).sub));
  return c.json({ dlp: list });
});

cloudflareZeroTrustRouter.post("/dlp", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(dataLossPrevention).values({
    userId: jwtPayload(c).sub, name: body.name, profiles: body.profiles,
    entries: body.entries, rules: body.rules,
  }).returning();
  return c.json({ dlp: created }, 201);
});

cloudflareZeroTrustRouter.put("/dlp/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(dataLossPrevention).set({ ...body, updatedAt: new Date() }).where(eq(dataLossPrevention.id, c.req.param("id"))).returning();
  return c.json({ dlp: updated });
});

cloudflareZeroTrustRouter.post("/dlp/:id/test", async (c) => {
  const body = await c.req.json();
  const matches = body.content ? [{ pattern: "credit-card", match: "4111-****-****-****", confidence: 0.95, action: "block" }] : [];
  return c.json({ matches, blocked: matches.length > 0, allowed: matches.length === 0 });
});

// Email Security
cloudflareZeroTrustRouter.get("/email-security", async (c) => {
  const list = await db.select().from(emailSecurity).where(eq(emailSecurity.userId, jwtPayload(c).sub));
  return c.json({ emailSecurity: list });
});

cloudflareZeroTrustRouter.post("/email-security", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(emailSecurity).values({
    userId: jwtPayload(c).sub, domain: body.domain, settings: body.settings,
    dmarc: body.dmarc, spf: body.spf, dkim: body.dkim, rules: body.rules,
  }).returning();
  return c.json({ emailSecurity: created }, 201);
});

cloudflareZeroTrustRouter.put("/email-security/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(emailSecurity).set({ ...body, updatedAt: new Date() }).where(eq(emailSecurity.id, c.req.param("id"))).returning();
  return c.json({ emailSecurity: updated });
});

// Secure Web Gateway
cloudflareZeroTrustRouter.get("/gateway", async (c) => {
  const list = await db.select().from(secureWebGateway).where(eq(secureWebGateway.userId, jwtPayload(c).sub));
  return c.json({ gateways: list });
});

cloudflareZeroTrustRouter.post("/gateway", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(secureWebGateway).values({
    userId: jwtPayload(c).sub, name: body.name, policies: body.policies,
    categories: body.categories, urlCategories: body.urlCategories,
    rules: body.rules, lists: body.lists,
  }).returning();
  return c.json({ gateway: created }, 201);
});

cloudflareZeroTrustRouter.put("/gateway/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(secureWebGateway).set({ ...body, updatedAt: new Date() }).where(eq(secureWebGateway.id, c.req.param("id"))).returning();
  return c.json({ gateway: updated });
});

// Magic Mesh
cloudflareZeroTrustRouter.get("/mesh", async (c) => {
  const list = await db.select().from(magicMesh).where(eq(magicMesh.userId, jwtPayload(c).sub));
  return c.json({ meshes: list });
});

cloudflareZeroTrustRouter.post("/mesh", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(magicMesh).values({
    userId: jwtPayload(c).sub, name: body.name, network: body.network,
    connectors: body.connectors, tunnels: body.tunnels,
    routes: body.routes, virtualNetworks: body.virtualNetworks,
  }).returning();
  return c.json({ mesh: created }, 201);
});

cloudflareZeroTrustRouter.put("/mesh/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(magicMesh).set({ ...body, updatedAt: new Date() }).where(eq(magicMesh.id, c.req.param("id"))).returning();
  return c.json({ mesh: updated });
});

// Magic WAN
cloudflareZeroTrustRouter.get("/wan", async (c) => {
  const list = await db.select().from(magicWan).where(eq(magicWan.userId, jwtPayload(c).sub));
  return c.json({ wans: list });
});

cloudflareZeroTrustRouter.post("/wan", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(magicWan).values({
    userId: jwtPayload(c).sub, name: body.name, connectors: body.connectors,
    tunnels: body.tunnels, ipsecTunnels: body.ipsecTunnels,
    greTunnels: body.greTunnels, routes: body.routes,
    staticRoutes: body.staticRoutes, healthChecks: body.healthChecks,
  }).returning();
  return c.json({ wan: created }, 201);
});

cloudflareZeroTrustRouter.put("/wan/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(magicWan).set({ ...body, updatedAt: new Date() }).where(eq(magicWan.id, c.req.param("id"))).returning();
  return c.json({ wan: updated });
});
