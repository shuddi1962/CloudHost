import { Hono } from "hono";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@cloudhost/db";
import {
  domainTransfers, domainMarketplace, marketplaceOffers, whoisLookups,
  tldCatalog, handshakeDomains, domainPrivacy, domainVault,
  premiumDns, freeDns, domains,
} from "@cloudhost/db";

const jwtPayload = (c: any) => c.get("jwtPayload") as { sub: string };

export const domainServicesRouter = new Hono();

// ─── TLD Catalog ───
domainServicesRouter.get("/tlds", async (c) => {
  const category = c.req.query("category");
  const popular = c.req.query("popular");
  let query = db.select().from(tldCatalog).where(eq(tldCatalog.active, true));
  const all = await query.orderBy(tldCatalog.tld);
  let filtered = all;
  if (category) filtered = filtered.filter(t => t.category === category);
  if (popular === "true") filtered = filtered.filter(t => t.popular);
  return c.json({ tlds: filtered });
});

domainServicesRouter.get("/tlds/:tld", async (c) => {
  const [tld] = await db.select().from(tldCatalog).where(eq(tldCatalog.tld, c.req.param("tld"))).limit(1);
  if (!tld) return c.json({ error: "TLD not found" }, 404);
  return c.json({ tld });
});

// ─── Domain Search (extended with TLD catalog) ───
domainServicesRouter.get("/search", async (c) => {
  const query = c.req.query("q") || "";
  const tlds = c.req.query("tlds")?.split(",") || [".com", ".net", ".org", ".io", ".co"];
  const results = tlds.map(tld => {
    const domain = `${query}${tld}`;
    const available = Math.random() > 0.3;
    const price = available ? (10.99).toString() : undefined;
    return {
      domain,
      tld,
      available,
      price,
      premium: Math.random() > 0.9,
      suggestions: available ? [] : [`${query}${tld.replace(".", "")}online.com`, `${query}app.com`, `get${query}${tld}`],
    };
  });
  return c.json({ results, query });
});

// ─── Domain Transfers ───
domainServicesRouter.get("/transfers", async (c) => {
  const list = await db.select().from(domainTransfers).where(eq(domainTransfers.userId, jwtPayload(c).sub)).orderBy(desc(domainTransfers.createdAt));
  return c.json({ transfers: list });
});

domainServicesRouter.post("/transfers", async (c) => {
  const body = await c.req.json();
  const [transfer] = await db.insert(domainTransfers).values({
    userId: jwtPayload(c).sub, domain: body.domain, authCode: body.authCode,
    transferLock: body.transferLock ?? true, privacyEnabled: body.privacyEnabled ?? true,
    years: body.years || 1, price: body.price,
    status: "pending",
  }).returning();
  setTimeout(async () => {
    await db.update(domainTransfers).set({ status: "in_progress", updatedAt: new Date() }).where(eq(domainTransfers.id, transfer.id));
  }, 5000);
  return c.json({ transfer }, 201);
});

domainServicesRouter.post("/transfers/:id/check-status", async (c) => {
  const [transfer] = await db.select().from(domainTransfers).where(eq(domainTransfers.id, c.req.param("id"))).limit(1);
  if (!transfer) return c.json({ error: "Not found" }, 404);
  return c.json({ transfer, status: "checked" });
});

domainServicesRouter.post("/transfers/:id/cancel", async (c) => {
  const [updated] = await db.update(domainTransfers).set({ status: "cancelled", updatedAt: new Date() }).where(eq(domainTransfers.id, c.req.param("id"))).returning();
  return c.json({ transfer: updated });
});

// ─── Domain Marketplace ───
domainServicesRouter.get("/marketplace", async (c) => {
  const list = await db.select().from(domainMarketplace).where(eq(domainMarketplace.status, "active")).orderBy(desc(domainMarketplace.listedAt));
  return c.json({ listings: list });
});

domainServicesRouter.post("/marketplace", async (c) => {
  const body = await c.req.json();
  const [listing] = await db.insert(domainMarketplace).values({
    userId: jwtPayload(c).sub, domain: body.domain, listingType: body.listingType || "fixed",
    price: body.price, category: body.category, description: body.description,
    makeOffer: body.makeOffer ?? false, minOffer: body.minOffer,
  }).returning();
  return c.json({ listing }, 201);
});

domainServicesRouter.get("/marketplace/my-listings", async (c) => {
  const list = await db.select().from(domainMarketplace).where(eq(domainMarketplace.userId, jwtPayload(c).sub)).orderBy(desc(domainMarketplace.listedAt));
  return c.json({ listings: list });
});

domainServicesRouter.post("/marketplace/:id/offer", async (c) => {
  const body = await c.req.json();
  const [offer] = await db.insert(marketplaceOffers).values({
    listingId: c.req.param("id"), buyerId: jwtPayload(c).sub,
    amount: body.amount, message: body.message,
  }).returning();
  await db.update(domainMarketplace).set({ watchers: sql`${domainMarketplace.watchers} + 1` }).where(eq(domainMarketplace.id, c.req.param("id")));
  return c.json({ offer }, 201);
});

domainServicesRouter.get("/marketplace/:id/offers", async (c) => {
  const offers = await db.select().from(marketplaceOffers).where(eq(marketplaceOffers.listingId, c.req.param("id"))).orderBy(desc(marketplaceOffers.createdAt));
  return c.json({ offers });
});

domainServicesRouter.post("/marketplace/offers/:id/respond", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(marketplaceOffers).set({
    status: body.accept ? "accepted" : "rejected", respondedAt: new Date(),
  }).where(eq(marketplaceOffers.id, c.req.param("id"))).returning();
  return c.json({ offer: updated });
});

// ─── Whois Lookup ───
domainServicesRouter.post("/whois", async (c) => {
  const body = await c.req.json();
  const domain = body.domain;
  const tld = domain.split(".").pop() || "com";
  const registrar = ["Namecheap", "GoDaddy", "Google Domains", "Cloudflare", "Name.com", "Porkbun"][Math.floor(Math.random() * 6)];
  const created = new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000);
  const expires = new Date(created.getTime() + Math.random() * 3 * 365 * 24 * 60 * 60 * 1000);
  const nameservers = ["ns1.cloudhost.com", "ns2.cloudhost.com", "ns3.cloudhost.com"];
  const result = {
    domain, registrar, creationDate: created, expiryDate: expires,
    nameServers: nameservers, dnssec: Math.random() > 0.5,
    registrantName: "Whois Guard Protected", registrantOrg: "CloudHost Privacy Services",
    registrantEmail: `${domain.replace(".", "-")}@whoisprotect.cloudhost.com`,
    registrantCountry: "US", status: ["clientTransferProhibited", "clientUpdateProhibited"],
    rawData: `Domain Name: ${domain}\nRegistry Domain ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}\nRegistrar WHOIS Server: whois.cloudhost.com\nUpdated Date: ${new Date().toISOString()}\nCreation Date: ${created.toISOString()}\nRegistry Expiry Date: ${expires.toISOString()}\nName Server: ns1.cloudhost.com\nName Server: ns2.cloudhost.com\nDNSSEC: ${Math.random() > 0.5 ? "signedDelegation" : "unsigned"}`,
  };
  await db.insert(whoisLookups).values({ userId: jwtPayload(c).sub, ...result }).onConflictDoNothing();
  return c.json({ whois: result });
});

domainServicesRouter.get("/whois/history", async (c) => {
  const list = await db.select().from(whoisLookups).where(eq(whoisLookups.userId, jwtPayload(c).sub)).orderBy(desc(whoisLookups.lookedUpAt)).limit(20);
  return c.json({ history: list });
});

// ─── Handshake Domains ───
domainServicesRouter.get("/handshake", async (c) => {
  const list = await db.select().from(handshakeDomains).where(eq(handshakeDomains.userId, jwtPayload(c).sub));
  return c.json({ domains: list });
});

domainServicesRouter.post("/handshake", async (c) => {
  const body = await c.req.json();
  const [domain] = await db.insert(handshakeDomains).values({
    userId: jwtPayload(c).sub, domain: body.domain,
    registrationPeriod: body.registrationPeriod || 1, price: body.price,
    walletAddress: body.walletAddress, signature: body.signature,
    nameserver: body.nameserver, status: "pending",
  }).returning();
  setTimeout(async () => {
    await db.update(handshakeDomains).set({
      status: "registered", blockchainTx: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      registeredAt: new Date(), expiresAt: new Date(Date.now() + (domain.registrationPeriod || 1) * 365 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    }).where(eq(handshakeDomains.id, domain.id));
  }, 3000);
  return c.json({ domain }, 201);
});

// ─── Domain Privacy ───
domainServicesRouter.get("/privacy", async (c) => {
  const list = await db.select().from(domainPrivacy).where(eq(domainPrivacy.userId, jwtPayload(c).sub));
  return c.json({ privacy: list });
});

domainServicesRouter.post("/privacy", async (c) => {
  const body = await c.req.json();
  const maskedEmail = `${body.domain.replace(/[^a-zA-Z0-9]/g, "")}@privacy.cloudhost.com`;
  const [privacy] = await db.insert(domainPrivacy).values({
    userId: jwtPayload(c).sub, domain: body.domain,
    maskedEmail, maskedPhone: "+1-555-000-0000",
    price: body.price || 2.88, privacyType: body.privacyType || "whois",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  }).returning();
  return c.json({ privacy }, 201);
});

domainServicesRouter.delete("/privacy/:id", async (c) => {
  await db.delete(domainPrivacy).where(eq(domainPrivacy.id, c.req.param("id")));
  return c.json({ success: true });
});

// ─── Domain Vault ───
domainServicesRouter.get("/vault", async (c) => {
  const list = await db.select().from(domainVault).where(eq(domainVault.userId, jwtPayload(c).sub));
  return c.json({ vault: list });
});

domainServicesRouter.post("/vault", async (c) => {
  const body = await c.req.json();
  const [vault] = await db.insert(domainVault).values({
    userId: jwtPayload(c).sub, domain: body.domain,
    vaultLevel: body.vaultLevel || "standard",
    transferLock: true, deleteLock: true, updateLock: true,
    authCodeProtection: true, approvalsRequired: body.approvalsRequired || 1,
    trustedContacts: body.trustedContacts, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  }).returning();
  return c.json({ vault }, 201);
});

domainServicesRouter.post("/vault/:id/unlock", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(domainVault).set({
    unlockRequestedAt: new Date(), unlockReason: body.reason, updatedAt: new Date(),
  }).where(eq(domainVault.id, c.req.param("id"))).returning();
  return c.json({ vault: updated });
});

domainServicesRouter.post("/vault/:id/approve-unlock", async (c) => {
  const [updated] = await db.update(domainVault).set({
    status: "unlocked", transferLock: false, unlockApprovedAt: new Date(), updatedAt: new Date(),
  }).where(eq(domainVault.id, c.req.param("id"))).returning();
  return c.json({ vault: updated });
});

// ─── Premium DNS ───
domainServicesRouter.get("/premium-dns", async (c) => {
  const list = await db.select().from(premiumDns).where(eq(premiumDns.userId, jwtPayload(c).sub));
  return c.json({ premiumDns: list });
});

domainServicesRouter.post("/premium-dns", async (c) => {
  const body = await c.req.json();
  const [dns] = await db.insert(premiumDns).values({
    userId: jwtPayload(c).sub, domain: body.domain, plan: body.plan || "basic",
    dnssec: body.dnssec ?? false, ddosProtection: body.ddosProtection ?? false,
    analytics: body.analytics ?? false, geoDns: body.geoDns ?? false,
    templateManagement: body.templateManagement ?? false,
    price: body.price, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  }).returning();
  return c.json({ premiumDns: dns }, 201);
});

domainServicesRouter.delete("/premium-dns/:id", async (c) => {
  await db.update(premiumDns).set({ status: "cancelled", updatedAt: new Date() }).where(eq(premiumDns.id, c.req.param("id")));
  return c.json({ success: true });
});

// ─── Free DNS ───
domainServicesRouter.get("/free-dns", async (c) => {
  const list = await db.select().from(freeDns).where(eq(freeDns.userId, jwtPayload(c).sub));
  return c.json({ freeDns: list });
});

domainServicesRouter.post("/free-dns", async (c) => {
  const body = await c.req.json();
  const [dns] = await db.insert(freeDns).values({
    userId: jwtPayload(c).sub, domain: body.domain,
    nameservers: body.nameservers || ["dns1.cloudhost.com", "dns2.cloudhost.com"],
  }).returning();
  return c.json({ freeDns: dns }, 201);
});

domainServicesRouter.delete("/free-dns/:id", async (c) => {
  await db.delete(freeDns).where(eq(freeDns.id, c.req.param("id")));
  return c.json({ success: true });
});
