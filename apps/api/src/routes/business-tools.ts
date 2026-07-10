import { Hono } from "hono";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@cloudhost/db";
import {
  dedicatedServers, dedicatedServerPlans, siteMigrations, websiteSecurity,
  securityFindings, hackedWebsiteSos, antiSpamProtection, fastVpn,
  vpnLocations, cyberInsurance, insuranceClaims, publicDnsResolver,
} from "@cloudhost/db";

const jwtPayload = (c: any) => c.get("jwtPayload") as { sub: string };

export const businessToolsRouter = new Hono();

// ─── Dedicated Servers ───
businessToolsRouter.get("/dedicated-servers", async (c) => {
  const list = await db.select().from(dedicatedServers).where(eq(dedicatedServers.userId, jwtPayload(c).sub));
  return c.json({ servers: list });
});

businessToolsRouter.get("/dedicated-servers/plans", async (c) => {
  const plans = await db.select().from(dedicatedServerPlans).where(eq(dedicatedServerPlans.active, true));
  return c.json({ plans });
});

businessToolsRouter.post("/dedicated-servers", async (c) => {
  const body = await c.req.json();
  const plan = body.planId ? (await db.select().from(dedicatedServerPlans).where(eq(dedicatedServerPlans.id, body.planId)).limit(1))[0] : null;
  const [server] = await db.insert(dedicatedServers).values({
    userId: jwtPayload(c).sub, name: body.name, plan: plan?.name || body.plan,
    cpu: plan?.cpu || body.cpu, ram: plan?.ram || body.ram, storage: plan?.storage || body.storage,
    bandwidth: plan?.bandwidth, location: body.location || plan?.location,
    ipCount: plan?.ipCount || 1, ips: [body.ip || "10.0.0.1"],
    os: body.os, managed: body.managed ?? false,
    price: plan?.price || body.price, provider: body.provider || "CloudHost Dedicated",
  }).returning();
  setTimeout(async () => {
    await db.update(dedicatedServers).set({ status: "active", provisionedAt: new Date(), updatedAt: new Date() }).where(eq(dedicatedServers.id, server.id));
  }, 5000);
  return c.json({ server }, 201);
});

businessToolsRouter.post("/dedicated-servers/:id/reboot", async (c) => {
  const [updated] = await db.update(dedicatedServers).set({ status: "rebooting", updatedAt: new Date() }).where(eq(dedicatedServers.id, c.req.param("id"))).returning();
  setTimeout(async () => {
    await db.update(dedicatedServers).set({ status: "active", lastRebootedAt: new Date(), updatedAt: new Date() }).where(eq(dedicatedServers.id, c.req.param("id")));
  }, 10000);
  return c.json({ server: updated });
});

businessToolsRouter.post("/dedicated-servers/:id/reinstall", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(dedicatedServers).set({ os: body.os, status: "provisioning", updatedAt: new Date() }).where(eq(dedicatedServers.id, c.req.param("id"))).returning();
  return c.json({ server: updated });
});

businessToolsRouter.get("/dedicated-servers/:id/metrics", async (c) => {
  const [server] = await db.select().from(dedicatedServers).where(eq(dedicatedServers.id, c.req.param("id"))).limit(1);
  if (!server) return c.json({ error: "Not found" }, 404);
  const metrics = {
    cpu: { used: Math.floor(Math.random() * 80 + 10), total: 100, unit: "%" },
    ram: { used: Math.floor(Math.random() * 64 + 8), total: parseInt(server.ram) || 64, unit: "GB" },
    disk: { used: Math.floor(Math.random() * 500 + 50), total: parseInt(server.storage) || 1000, unit: "GB" },
    bandwidth: { used: Math.floor(Math.random() * 5 + 0.5), total: parseInt(server.bandwidth ?? "10") || 10, unit: "TB" },
    uptime: `${Math.floor(Math.random() * 365)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
    processes: Math.floor(Math.random() * 200 + 50),
    loadAverage: [Math.random() * 4, Math.random() * 3, Math.random() * 2],
  };
  await db.update(dedicatedServers).set({ metrics, updatedAt: new Date() }).where(eq(dedicatedServers.id, c.req.param("id")));
  return c.json({ metrics });
});

businessToolsRouter.delete("/dedicated-servers/:id", async (c) => {
  await db.update(dedicatedServers).set({ status: "cancelled", updatedAt: new Date() }).where(eq(dedicatedServers.id, c.req.param("id")));
  return c.json({ success: true });
});

// ─── Site Migrations ───
businessToolsRouter.get("/migrations", async (c) => {
  const list = await db.select().from(siteMigrations).where(eq(siteMigrations.userId, jwtPayload(c).sub)).orderBy(desc(siteMigrations.createdAt));
  return c.json({ migrations: list });
});

businessToolsRouter.post("/migrations", async (c) => {
  const body = await c.req.json();
  const [migration] = await db.insert(siteMigrations).values({
    userId: jwtPayload(c).sub, type: body.type, sourceUrl: body.sourceUrl,
    sourceType: body.sourceType, targetType: body.targetType || "cloudhost",
    preserveSettings: body.preserveSettings ?? true, preserveContent: body.preserveContent ?? true,
    preserveUsers: body.preserveUsers ?? true, sslMigration: body.sslMigration ?? true,
    incrementalSync: body.incrementalSync ?? false,
    estimatedTime: Math.floor(Math.random() * 30 + 5),
  }).returning();
  simulateMigration(migration.id);
  return c.json({ migration }, 201);
});

async function simulateMigration(id: string) {
  const totalFiles = Math.floor(Math.random() * 5000 + 100);
  await db.update(siteMigrations).set({ status: "running", totalFiles, startedAt: new Date(), updatedAt: new Date() }).where(eq(siteMigrations.id, id));
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const progress = Math.floor((i / steps) * 100);
    const transferred = Math.floor((i / steps) * totalFiles);
    await db.update(siteMigrations).set({ progress, filesTransferred: transferred, updatedAt: new Date() }).where(eq(siteMigrations.id, id));
  }
  await db.update(siteMigrations).set({ status: "completed", progress: 100, filesTransferred: totalFiles, completedAt: new Date(), updatedAt: new Date() }).where(eq(siteMigrations.id, id));
}

businessToolsRouter.post("/migrations/:id/cancel", async (c) => {
  const [updated] = await db.update(siteMigrations).set({ status: "cancelled", updatedAt: new Date() }).where(eq(siteMigrations.id, c.req.param("id"))).returning();
  return c.json({ migration: updated });
});

// ─── Website Security ───
businessToolsRouter.get("/website-security", async (c) => {
  const list = await db.select().from(websiteSecurity).where(eq(websiteSecurity.userId, jwtPayload(c).sub));
  return c.json({ security: list });
});

businessToolsRouter.post("/website-security", async (c) => {
  const body = await c.req.json();
  const [security] = await db.insert(websiteSecurity).values({
    userId: jwtPayload(c).sub, domain: body.domain, plan: body.plan || "basic",
    scanFrequency: body.scanFrequency || "daily", autoFix: body.autoFix ?? false,
    firewall: body.firewall ?? false, price: body.price,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  }).returning();
  return c.json({ security }, 201);
});

businessToolsRouter.get("/website-security/:id/scan", async (c) => {
  const [security] = await db.select().from(websiteSecurity).where(eq(websiteSecurity.id, c.req.param("id"))).limit(1);
  if (!security) return c.json({ error: "Not found" }, 404);
  const findings = [
    { type: "xss", severity: "high", title: "Cross-Site Scripting in contact form", path: "/contact.php", recommendation: "Sanitize user input with htmlspecialchars()" },
    { type: "sql_injection", severity: "critical", title: "SQL Injection vulnerability in search", path: "/search.php", recommendation: "Use prepared statements instead of string concatenation" },
    { type: "outdated_plugin", severity: "medium", title: "Outdated jQuery version (1.12.4)", path: "/wp-includes/js/jquery/jquery.js", recommendation: "Update jQuery to latest version" },
    { type: "ssl_issue", severity: "low", title: "SSL certificate expires in 30 days", path: "/", recommendation: "Renew SSL certificate before expiration" },
    { type: "open_port", severity: "medium", title: "Port 3306 (MySQL) exposed to public", path: "server:3306", recommendation: "Restrict MySQL port to internal network only" },
    { type: "missing_headers", severity: "low", title: "Missing X-Frame-Options header", path: "/", recommendation: "Add X-Frame-Options: SAMEORIGIN to response headers" },
    { type: "malware", severity: "critical", title: "Suspicious base64 encoded script in footer", path: "/wp-content/themes/theme/footer.php", recommendation: "Remove obfuscated script and scan for backdoors" },
    { type: "directory_listing", severity: "medium", title: "Directory listing enabled on /uploads", path: "/uploads/", recommendation: "Disable directory listing in web server config" },
  ];
  const selectedFindings = findings.slice(0, Math.floor(Math.random() * 6 + 2)).map(f => ({
    ...f, status: "open", detectedAt: new Date(),
    securityId: security.id,
  }));
  for (const f of selectedFindings) {
    await db.insert(securityFindings).values(f);
  }
  const critical = selectedFindings.filter(f => f.severity === "critical").length;
  const high = selectedFindings.filter(f => f.severity === "high").length;
  const medium = selectedFindings.filter(f => f.severity === "medium").length;
  const low = selectedFindings.filter(f => f.severity === "low").length;
  const malware = selectedFindings.some(f => f.type === "malware");
  await db.update(websiteSecurity).set({
    lastScan: new Date(), vulnerabilities: selectedFindings.length,
    criticalCount: critical, highCount: high, mediumCount: medium, lowCount: low,
    malwareDetected: malware, updatedAt: new Date(),
  }).where(eq(websiteSecurity.id, c.req.param("id")));
  return c.json({ findings: selectedFindings, summary: { critical, high, medium, low, total: selectedFindings.length, malware } });
});

businessToolsRouter.get("/website-security/:id/findings", async (c) => {
  const findings = await db.select().from(securityFindings).where(eq(securityFindings.securityId, c.req.param("id")));
  return c.json({ findings });
});

businessToolsRouter.post("/website-security/findings/:id/fix", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(securityFindings).set({
    status: "resolved", autoFixed: body.autoFix ?? false, resolvedAt: new Date(),
  }).where(eq(securityFindings.id, c.req.param("id"))).returning();
  return c.json({ finding: updated });
});

businessToolsRouter.delete("/website-security/:id", async (c) => {
  await db.delete(websiteSecurity).where(eq(websiteSecurity.id, c.req.param("id")));
  return c.json({ success: true });
});

// ─── Fix Hacked Website (SOS) ───
businessToolsRouter.get("/hacked-sos", async (c) => {
  const list = await db.select().from(hackedWebsiteSos).where(eq(hackedWebsiteSos.userId, jwtPayload(c).sub));
  return c.json({ sos: list });
});

businessToolsRouter.post("/hacked-sos", async (c) => {
  const body = await c.req.json();
  const infected = Math.floor(Math.random() * 50 + 5);
  const [sos] = await db.insert(hackedWebsiteSos).values({
    userId: jwtPayload(c).sub, domain: body.domain, severity: body.severity || "medium",
    description: body.description, symptoms: body.symptoms || ["Unexpected redirects", "Unknown admin users", "Suspicious files"],
    infectionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    filesAffected: infected, totalFiles: Math.floor(Math.random() * 2000 + 500),
    price: body.price || ({ low: "49.99", medium: "99.99", high: "199.99" } as Record<string, string>)[body.severity || "medium"],
  }).returning();
  return c.json({ sos }, 201);
});

businessToolsRouter.post("/hacked-sos/:id/start-repair", async (c) => {
  const [updated] = await db.update(hackedWebsiteSos).set({
    status: "in_progress", startedAt: new Date(),
    assignedTechnician: ["Alex K.", "Jordan M.", "Sam T.", "Casey R."][Math.floor(Math.random() * 4)],
    updatedAt: new Date(),
  }).where(eq(hackedWebsiteSos.id, c.req.param("id"))).returning();
  return c.json({ sos: updated });
});

businessToolsRouter.post("/hacked-sos/:id/complete-repair", async (c) => {
  const [sos] = await db.select().from(hackedWebsiteSos).where(eq(hackedWebsiteSos.id, c.req.param("id"))).limit(1);
  if (!sos) return c.json({ error: "Not found" }, 404);
  const cleaned = Math.floor((sos.filesAffected || 0) * (0.8 + Math.random() * 0.2));
  const [updated] = await db.update(hackedWebsiteSos).set({
    status: "completed", completedAt: new Date(), filesCleaned: cleaned,
    securityPatches: [
      { name: "WordPress core update", applied: true },
      { name: "Plugin vulnerability patches", applied: true },
      { name: "File permission hardening", applied: true },
      { name: "Database credential rotation", applied: true },
      { name: "Web application firewall rules", applied: true },
    ],
    backupRestored: Math.random() > 0.5, backupDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  }).where(eq(hackedWebsiteSos.id, c.req.param("id"))).returning();
  return c.json({ sos: updated });
});

// ─── Anti-Spam Protection ───
businessToolsRouter.get("/anti-spam", async (c) => {
  const list = await db.select().from(antiSpamProtection).where(eq(antiSpamProtection.userId, jwtPayload(c).sub));
  return c.json({ antiSpam: list });
});

businessToolsRouter.post("/anti-spam", async (c) => {
  const body = await c.req.json();
  const [spam] = await db.insert(antiSpamProtection).values({
    userId: jwtPayload(c).sub, domain: body.domain,
    dkimEnabled: body.dkimEnabled ?? false, spfEnabled: body.spfEnabled ?? false,
    dmarcEnabled: body.dmarcEnabled ?? false, quarantineSpam: body.quarantineSpam ?? true,
    blockMalware: body.blockMalware ?? true, blockPhishing: body.blockPhishing ?? true,
    whitelist: body.whitelist || [], blacklist: body.blacklist || [],
    rules: body.rules || [{ type: "spf_check", action: "quarantine", priority: 1 }, { type: "dkim_check", action: "quarantine", priority: 2 }, { type: "dmarc_check", action: "reject", priority: 3 }],
    price: body.price, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  }).returning();
  return c.json({ antiSpam: spam }, 201);
});

businessToolsRouter.post("/anti-spam/:id/check", async (c) => {
  const blocked = Math.floor(Math.random() * 150 + 10);
  const quarantined = Math.floor(Math.random() * 50 + 5);
  const allowed = Math.floor(Math.random() * 500 + 100);
  const [updated] = await db.update(antiSpamProtection).set({
    emailsBlocked: sql`${antiSpamProtection.emailsBlocked} + ${blocked}`,
    emailsQuarantined: sql`${antiSpamProtection.emailsQuarantined} + ${quarantined}`,
    emailsAllowed: sql`${antiSpamProtection.emailsAllowed} + ${allowed}`,
    spamScore: Math.floor(Math.random() * 20 + 1),
    updatedAt: new Date(),
  }).where(eq(antiSpamProtection.id, c.req.param("id"))).returning();
  return c.json({ antiSpam: updated, stats: { blocked, quarantined, allowed } });
});

// ─── FastVPN ───
businessToolsRouter.get("/vpn", async (c) => {
  const list = await db.select().from(fastVpn).where(eq(fastVpn.userId, jwtPayload(c).sub));
  return c.json({ vpn: list });
});

businessToolsRouter.get("/vpn/locations", async (c) => {
  const locations = await db.select().from(vpnLocations).where(eq(vpnLocations.active, true));
  return c.json({ locations });
});

businessToolsRouter.post("/vpn", async (c) => {
  const body = await c.req.json();
  const location = body.locationId ? (await db.select().from(vpnLocations).where(eq(vpnLocations.id, body.locationId)).limit(1))[0] : null;
  const publicKey = `pubkey_${Array.from({ length: 44 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[Math.floor(Math.random() * 64)]).join("")}`;
  const privateKey = `privkey_${Array.from({ length: 44 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[Math.floor(Math.random() * 64)]).join("")}`;
  const [vpn] = await db.insert(fastVpn).values({
    userId: jwtPayload(c).sub, plan: body.plan || "basic",
    protocol: body.protocol || "wireguard",
    serverLocation: location ? `${location.city}, ${location.country}` : "Auto",
    serverIp: `vpn-${Math.floor(Math.random() * 99 + 1)}.cloudhost.com`,
    assignedIp: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    port: Math.floor(Math.random() * 50000 + 10000),
    publicKey, privateKey, maxDevices: ({ basic: 5, pro: 10, business: 25 } as Record<string, number>)[body.plan || "basic"],
    killSwitch: body.killSwitch ?? false, splitTunneling: body.splitTunneling ?? false,
    obfuscation: body.obfuscation ?? false, dnsLeakProtection: true,
    price: body.price, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }).returning();
  return c.json({ vpn }, 201);
});

businessToolsRouter.post("/vpn/:id/connect", async (c) => {
  const body = await c.req.json();
  const [existing] = await db.select().from(fastVpn).where(eq(fastVpn.id, c.req.param("id"))).limit(1);
  const [updated] = await db.update(fastVpn).set({
    serverLocation: body.location || existing?.serverLocation,
    lastConnectedAt: new Date(), connectedDevices: body.devices || 1,
    updatedAt: new Date(),
  }).where(eq(fastVpn.id, c.req.param("id"))).returning();
  return c.json({ vpn: updated, config: `[Interface]\nPrivateKey = ${updated?.privateKey || "..."}\nAddress = ${updated?.assignedIp || "10.0.0.2"}/32\nDNS = 1.1.1.1\n\n[Peer]\nPublicKey = ${updated?.publicKey || "..."}\nEndpoint = ${updated?.serverIp || "vpn.cloudhost.com"}:${updated?.port || 51820}\nAllowedIPs = 0.0.0.0/0` });
});

businessToolsRouter.post("/vpn/:id/disconnect", async (c) => {
  const [updated] = await db.update(fastVpn).set({ connectedDevices: 0, updatedAt: new Date() }).where(eq(fastVpn.id, c.req.param("id"))).returning();
  return c.json({ vpn: updated });
});

// ─── Cyber Insurance ───
businessToolsRouter.get("/insurance", async (c) => {
  const list = await db.select().from(cyberInsurance).where(eq(cyberInsurance.userId, jwtPayload(c).sub));
  return c.json({ policies: list });
});

businessToolsRouter.post("/insurance", async (c) => {
  const body = await c.req.json();
  const coverageAmounts: Record<string, string> = { basic: "100000", pro: "500000", enterprise: "2000000" };
  const premiums: Record<string, string> = { basic: "29.99", pro: "89.99", enterprise: "299.99" };
  const policyNumber = `CH-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const [policy] = await db.insert(cyberInsurance).values({
    userId: jwtPayload(c).sub, plan: body.plan || "basic",
    coverageAmount: body.coverageAmount || coverageAmounts[body.plan || "basic"],
    deductible: body.deductible || ({ basic: "500", pro: "1000", enterprise: "5000" } as Record<string, string>)[body.plan || "basic"],
    premium: body.premium || premiums[body.plan || "basic"],
    paymentFrequency: body.paymentFrequency || "monthly",
    policyNumber, startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    insuredAssets: body.insuredAssets || ["servers", "data", "reputation"],
    coverageTypes: body.coverageTypes || ["data_breach", "ransomware", "business_interruption", "legal_fees"],
    riskLevel: body.riskLevel || "medium", industry: body.industry, companySize: body.companySize,
  }).returning();
  return c.json({ policy }, 201);
});

businessToolsRouter.get("/insurance/:id/claims", async (c) => {
  const claims = await db.select().from(insuranceClaims).where(eq(insuranceClaims.policyId, c.req.param("id")));
  return c.json({ claims });
});

businessToolsRouter.post("/insurance/:id/claims", async (c) => {
  const body = await c.req.json();
  const [claim] = await db.insert(insuranceClaims).values({
    policyId: c.req.param("id"), userId: jwtPayload(c).sub,
    type: body.type, description: body.description,
    amount: body.amount, incidentDate: body.incidentDate ? new Date(body.incidentDate) : new Date(),
    evidence: body.evidence,
  }).returning();
  return c.json({ claim }, 201);
});

// ─── Public DNS ───
businessToolsRouter.post("/public-dns/lookup", async (c) => {
  const body = await c.req.json();
  const domain = body.domain;
  const type = body.type || "A";
  const records: Record<string, any[]> = {
    A: [{ name: domain, type: "A", ttl: 3600, value: `192.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` }],
    AAAA: [{ name: domain, type: "AAAA", ttl: 3600, value: `2606:4700:${Math.floor(Math.random() * 9999)}::${Math.floor(Math.random() * 9999)}:${Math.floor(Math.random() * 9999)}` }],
    MX: [{ name: domain, type: "MX", ttl: 3600, priority: 10, value: `mail.${domain}` }, { name: domain, type: "MX", ttl: 3600, priority: 20, value: `backup-mail.${domain}` }],
    NS: [{ name: domain, type: "NS", ttl: 86400, value: "ns1.cloudhost.com" }, { name: domain, type: "NS", ttl: 86400, value: "ns2.cloudhost.com" }],
    TXT: [{ name: domain, type: "TXT", ttl: 3600, value: "v=spf1 include:_spf.cloudhost.com ~all" }],
    CNAME: [{ name: `www.${domain}`, type: "CNAME", ttl: 3600, value: domain }],
  };
  const result = records[type] || records.A;
  const responseTime = Math.floor(Math.random() * 150 + 10);
  await db.insert(publicDnsResolver).values({
    userId: jwtPayload(c).sub, queryDomain: domain, queryType: type,
    result, responseTime, sourceIp: c.req.header("x-forwarded-for") || "127.0.0.1",
  });
  return c.json({ domain, type, records: result, responseTime: `${responseTime}ms`, resolver: "cloudhost.public.dns" });
});

businessToolsRouter.get("/public-dns/history", async (c) => {
  const history = await db.select().from(publicDnsResolver).where(eq(publicDnsResolver.userId, jwtPayload(c).sub)).orderBy(desc(publicDnsResolver.queriedAt)).limit(25);
  return c.json({ history });
});
