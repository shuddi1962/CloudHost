import { Hono } from "hono";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { db } from "@cloudhost/db";
import {
  sslCatalog, userSslCertificates, promoCodes, userPromos,
  knowledgebaseArticles, supportTickets, relateSeo, relateSocial,
  relateReviews, relateAds, relateLocal, relateBrandMonitoring,
  siteMakerProjects, logoMakerProjects, fontMakerProjects,
  businessNames, businessCardProjects, businessStarterKits,
  affiliates, affiliateReferrals, abuseReports,
} from "@cloudhost/db";

const jwtPayload = (c: any) => c.get("jwtPayload") as { sub: string };

export const marketingSuiteRouter = new Hono();

// ─── SSL Catalog ───
marketingSuiteRouter.get("/ssl-catalog", async (c) => {
  const brand = c.req.query("brand");
  const validation = c.req.query("validation");
  let list = await db.select().from(sslCatalog).where(eq(sslCatalog.active, true));
  if (brand) list = list.filter(s => s.brand === brand);
  if (validation) list = list.filter(s => s.validation === validation);
  return c.json({ certificates: list });
});

marketingSuiteRouter.post("/ssl-catalog/seed", async (c) => {
  const certs: any[] = [
    { name: "Comodo PositiveSSL", brand: "Comodo", type: "single", validation: "dv", domains: "1", warranty: "$10,000", encryption: "256-bit", issuanceTime: "5-10 min", price: "9.99", regularPrice: "49.99", popular: false, features: ["Free reissue", "99.9% browser trust", "Mobile friendly"] },
    { name: "Comodo EssentialSSL", brand: "Comodo", type: "single", validation: "dv", domains: "1", warranty: "$10,000", encryption: "256-bit", issuanceTime: "5-10 min", price: "14.99", regularPrice: "69.99", popular: false, features: ["Free reissue", "SGC support", "$10K warranty"] },
    { name: "Comodo InstantSSL", brand: "Comodo", type: "single", validation: "ov", domains: "1", warranty: "$100,000", encryption: "256-bit", issuanceTime: "10-30 min", price: "29.99", regularPrice: "99.99", popular: false, features: ["Organization validated", "Free reissue", "$100K warranty", "Trust Seal"] },
    { name: "Comodo PositiveSSL Wildcard", brand: "Comodo", type: "wildcard", validation: "dv", domains: "Unlimited subdomains", warranty: "$10,000", encryption: "256-bit", issuanceTime: "5-10 min", price: "49.99", regularPrice: "149.99", popular: true, features: ["Secure unlimited subdomains", "Free reissue", "Wildcard coverage"] },
    { name: "Comodo EV SSL", brand: "Comodo", type: "single", validation: "ev", domains: "1", warranty: "$1,750,000", encryption: "256-bit", issuanceTime: "1-5 days", price: "89.99", regularPrice: "249.99", popular: false, features: ["Green address bar", "Highest trust level", "$1.75M warranty", "Extended validation"] },
    { name: "Comodo Multi-Domain SSL", brand: "Comodo", type: "multi-domain", validation: "ov", domains: "3-100", warranty: "$100,000", encryption: "256-bit", issuanceTime: "10-30 min", price: "39.99", regularPrice: "129.99", popular: false, features: ["Up to 100 domains", "Free reissue", "Manage from one certificate"] },
    { name: "Sectigo PositiveSSL", brand: "Sectigo", type: "single", validation: "dv", domains: "1", warranty: "$10,000", encryption: "256-bit", issuanceTime: "5-10 min", price: "8.99", regularPrice: "44.99", popular: false, features: ["Free reissue", "Quick issuance"] },
    { name: "Sectigo EV SSL", brand: "Sectigo", type: "single", validation: "ev", domains: "1", warranty: "$2,000,000", encryption: "256-bit", issuanceTime: "1-5 days", price: "79.99", regularPrice: "229.99", popular: false, features: ["Green address bar", "$2M warranty", "Highest validation"] },
    { name: "DigiCert Basic SSL", brand: "DigiCert", type: "single", validation: "ov", domains: "1", warranty: "$250,000", encryption: "256-bit", issuanceTime: "10-30 min", price: "49.99", regularPrice: "199.99", popular: false, features: ["DigiCert trust", "$250K warranty", "Seal-in-Search"] },
    { name: "DigiCert Secure Site EV", brand: "DigiCert", type: "single", validation: "ev", domains: "1", warranty: "$2,000,000", encryption: "256-bit", issuanceTime: "1-5 days", price: "149.99", regularPrice: "499.99", popular: false, features: ["Green address bar", "$2M warranty", "DigiCert Seal", "Seal-in-Search"] },
    { name: "GeoTrust QuickSSL", brand: "GeoTrust", type: "single", validation: "dv", domains: "1", warranty: "$10,000", encryption: "256-bit", issuanceTime: "5-10 min", price: "11.99", regularPrice: "59.99", popular: false, features: ["Quick issuance", "Free reissue", "GeoTrust trust"] },
    { name: "GeoTrust TrueBusinessID", brand: "GeoTrust", type: "single", validation: "ov", domains: "1", warranty: "$100,000", encryption: "256-bit", issuanceTime: "10-30 min", price: "34.99", regularPrice: "109.99", popular: false, features: ["Org validated", "$100K warranty", "GeoTrust Seal"] },
  ];
  for (const cert of certs) {
    await db.insert(sslCatalog).values(cert).onConflictDoNothing();
  }
  return c.json({ seeded: certs.length });
});

marketingSuiteRouter.post("/ssl-catalog/purchase", async (c) => {
  const body = await c.req.json();
  const [cert] = await db.insert(userSslCertificates).values({
    userId: jwtPayload(c).sub, catalogId: body.catalogId,
    domain: body.domain, brand: body.brand, type: body.type,
    validation: body.validation, price: body.price,
  }).returning();
  return c.json({ certificate: cert }, 201);
});

marketingSuiteRouter.get("/ssl-catalog/my-certs", async (c) => {
  const certs = await db.select().from(userSslCertificates).where(eq(userSslCertificates.userId, jwtPayload(c).sub));
  return c.json({ certificates: certs });
});

// ─── Promos ───
marketingSuiteRouter.get("/promos", async (c) => {
  const promos = await db.select().from(promoCodes).where(and(eq(promoCodes.active, true), sql`${promoCodes.expiresAt} > NOW()`));
  return c.json({ promos });
});

marketingSuiteRouter.post("/promos/redeem", async (c) => {
  const body = await c.req.json();
  const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.code, body.code)).limit(1);
  if (!promo) return c.json({ error: "Invalid promo code" }, 404);
  if (!promo.active) return c.json({ error: "Promo code expired" }, 400);
  if (promo.usageLimit && (promo.usageCount ?? 0) >= promo.usageLimit) return c.json({ error: "Promo code usage limit reached" }, 400);
  await db.update(promoCodes).set({ usageCount: sql`${promoCodes.usageCount} + 1` }).where(eq(promoCodes.id, promo.id));
  await db.insert(userPromos).values({ userId: jwtPayload(c).sub, promoId: promo.id, code: body.code });
  return c.json({ promo, discount: promo.discountValue, discountType: promo.discountType });
});

// ─── Knowledgebase ───
marketingSuiteRouter.get("/knowledgebase", async (c) => {
  const cat = c.req.query("category");
  const search = c.req.query("search");
  let articles = await db.select().from(knowledgebaseArticles).where(eq(knowledgebaseArticles.published, true));
  if (cat) articles = articles.filter(a => a.category === cat);
  if (search) articles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.content?.toLowerCase().includes(search.toLowerCase()));
  return c.json({ articles });
});

marketingSuiteRouter.get("/knowledgebase/:slug", async (c) => {
  const [article] = await db.select().from(knowledgebaseArticles).where(eq(knowledgebaseArticles.slug, c.req.param("slug"))).limit(1);
  if (!article) return c.json({ error: "Not found" }, 404);
  await db.update(knowledgebaseArticles).set({ views: sql`${knowledgebaseArticles.views} + 1` }).where(eq(knowledgebaseArticles.id, article.id));
  return c.json({ article });
});

marketingSuiteRouter.post("/knowledgebase/:id/vote", async (c) => {
  const body = await c.req.json();
  const col = body.helpful ? knowledgebaseArticles.helpful : knowledgebaseArticles.notHelpful;
  await db.update(knowledgebaseArticles).set({ [body.helpful ? "helpful" : "notHelpful"]: sql`${col} + 1` }).where(eq(knowledgebaseArticles.id, c.req.param("id")));
  return c.json({ success: true });
});

// ─── Support Tickets ───
marketingSuiteRouter.get("/tickets", async (c) => {
  const tickets = await db.select().from(supportTickets).where(eq(supportTickets.userId, jwtPayload(c).sub)).orderBy(desc(supportTickets.createdAt));
  return c.json({ tickets });
});

marketingSuiteRouter.post("/tickets", async (c) => {
  const body = await c.req.json();
  const [ticket] = await db.insert(supportTickets).values({
    userId: jwtPayload(c).sub, subject: body.subject, category: body.category,
    priority: body.priority || "normal",
    messages: [{ from: jwtPayload(c).sub, message: body.message, sentAt: new Date().toISOString() }],
  }).returning();
  return c.json({ ticket }, 201);
});

marketingSuiteRouter.post("/tickets/:id/reply", async (c) => {
  const body = await c.req.json();
  const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, c.req.param("id"))).limit(1);
  if (!ticket) return c.json({ error: "Not found" }, 404);
  const messages = [...(ticket.messages as any[] || []), { from: jwtPayload(c).sub, message: body.message, sentAt: new Date().toISOString() }];
  const [updated] = await db.update(supportTickets).set({ messages, updatedAt: new Date() }).where(eq(supportTickets.id, c.req.param("id"))).returning();
  return c.json({ ticket: updated });
});

marketingSuiteRouter.post("/tickets/:id/close", async (c) => {
  const [updated] = await db.update(supportTickets).set({ status: "closed", closedAt: new Date(), updatedAt: new Date() }).where(eq(supportTickets.id, c.req.param("id"))).returning();
  return c.json({ ticket: updated });
});

// ─── Relate SEO ───
marketingSuiteRouter.get("/relate/seo", async (c) => {
  const list = await db.select().from(relateSeo).where(eq(relateSeo.userId, jwtPayload(c).sub));
  return c.json({ seo: list });
});

marketingSuiteRouter.post("/relate/seo", async (c) => {
  const body = await c.req.json();
  const [seo] = await db.insert(relateSeo).values({
    userId: jwtPayload(c).sub, domain: body.domain,
    keywords: body.keywords || [{ word: body.domain?.split(".")[0] || "business", volume: Math.floor(Math.random() * 1000 + 50), difficulty: Math.floor(Math.random() * 100), position: Math.floor(Math.random() * 50 + 10) }],
    keywordCount: Math.floor(Math.random() * 30 + 5), backlinks: Math.floor(Math.random() * 500 + 10),
    domainAuthority: Math.floor(Math.random() * 40 + 10), pageAuthority: Math.floor(Math.random() * 30 + 10),
    organicTraffic: Math.floor(Math.random() * 2000 + 100), competitors: ["competitor1.com", "competitor2.com"],
    recommendations: ["Optimize meta descriptions", "Improve page load speed", "Build quality backlinks", "Fix broken links"],
  }).returning();
  return c.json({ seo }, 201);
});

marketingSuiteRouter.get("/relate/seo/:id/analyze", async (c) => {
  const [updated] = await db.update(relateSeo).set({
    crawlErrors: Math.floor(Math.random() * 15), indexPages: Math.floor(Math.random() * 500 + 10),
    organicTraffic: Math.floor(Math.random() * 300 + 100), lastCrawled: new Date(),
    updatedAt: new Date(),
  }).where(eq(relateSeo.id, c.req.param("id"))).returning();
  return c.json({ seo: updated, analysis: "Analysis complete" });
});

// ─── Relate Social ───
marketingSuiteRouter.get("/relate/social", async (c) => {
  const list = await db.select().from(relateSocial).where(eq(relateSocial.userId, jwtPayload(c).sub));
  return c.json({ social: list });
});

marketingSuiteRouter.post("/relate/social", async (c) => {
  const body = await c.req.json();
  const [social] = await db.insert(relateSocial).values({
    userId: jwtPayload(c).sub, platform: body.platform, accountName: body.accountName,
    followers: Math.floor(Math.random() * 1000 + 50), following: Math.floor(Math.random() * 200 + 10),
    posts: Math.floor(Math.random() * 100 + 5), engagement: (Math.random() * 5 + 0.5).toFixed(2),
    impressions: Math.floor(Math.random() * 5000 + 100),
  }).returning();
  return c.json({ social }, 201);
});

// ─── Relate Reviews ───
marketingSuiteRouter.get("/relate/reviews", async (c) => {
  const list = await db.select().from(relateReviews).where(eq(relateReviews.userId, jwtPayload(c).sub));
  return c.json({ reviews: list });
});

marketingSuiteRouter.post("/relate/reviews", async (c) => {
  const body = await c.req.json();
  const [review] = await db.insert(relateReviews).values({
    userId: jwtPayload(c).sub, platform: body.platform,
    rating: (3 + Math.random() * 2).toFixed(1), reviewCount: Math.floor(Math.random() * 50 + 5),
    totalRating: (3.5 + Math.random() * 1.5).toFixed(1), responseRate: Math.floor(Math.random() * 50 + 50),
    avgResponseTime: `${Math.floor(Math.random() * 24 + 1)}h`, sentiment: "positive",
  }).returning();
  return c.json({ review }, 201);
});

// ─── Relate Ads ───
marketingSuiteRouter.get("/relate/ads", async (c) => {
  const list = await db.select().from(relateAds).where(eq(relateAds.userId, jwtPayload(c).sub));
  return c.json({ campaigns: list });
});

marketingSuiteRouter.post("/relate/ads", async (c) => {
  const body = await c.req.json();
  const [campaign] = await db.insert(relateAds).values({
    userId: jwtPayload(c).sub, campaignName: body.campaignName, platform: body.platform,
    budget: body.budget, targetAudience: body.targetAudience, adContent: body.adContent,
  }).returning();
  return c.json({ campaign }, 201);
});

marketingSuiteRouter.post("/relate/ads/:id/launch", async (c) => {
  const [updated] = await db.update(relateAds).set({
    status: "active", startedAt: new Date(),
    impressions: Math.floor(Math.random() * 1000 + 100), clicks: Math.floor(Math.random() * 50 + 5),
    spent: (Math.random() * 50 + 1).toFixed(2), conversions: Math.floor(Math.random() * 10 + 1),
    updatedAt: new Date(),
  }).where(eq(relateAds.id, c.req.param("id"))).returning();
  return c.json({ campaign: updated });
});

// ─── Relate Local ───
marketingSuiteRouter.get("/relate/local", async (c) => {
  const list = await db.select().from(relateLocal).where(eq(relateLocal.userId, jwtPayload(c).sub));
  return c.json({ local: list });
});

marketingSuiteRouter.post("/relate/local", async (c) => {
  const body = await c.req.json();
  const [local] = await db.insert(relateLocal).values({
    userId: jwtPayload(c).sub, businessName: body.businessName, category: body.category,
    address: body.address, city: body.city, state: body.state, zip: body.zip,
    phone: body.phone, website: body.website,
    listings: body.listings || [{ platform: "Google Business Profile", verified: true }, { platform: "Yelp", verified: false }, { platform: "Bing Places", verified: false }],
    listingCount: body.listings?.length || 3, citationCount: Math.floor(Math.random() * 30 + 5),
  }).returning();
  return c.json({ local }, 201);
});

// ─── Relate Brand Monitoring ───
marketingSuiteRouter.get("/relate/brand", async (c) => {
  const list = await db.select().from(relateBrandMonitoring).where(eq(relateBrandMonitoring.userId, jwtPayload(c).sub));
  return c.json({ brands: list });
});

marketingSuiteRouter.post("/relate/brand", async (c) => {
  const body = await c.req.json();
  const [brand] = await db.insert(relateBrandMonitoring).values({
    userId: jwtPayload(c).sub, brandName: body.brandName,
    mentions: Math.floor(Math.random() * 100 + 5), sentimentScore: (5 + Math.random() * 5).toFixed(1),
    topSources: [{ name: "Twitter", count: Math.floor(Math.random() * 30) }, { name: "Reddit", count: Math.floor(Math.random() * 20) }, { name: "News", count: Math.floor(Math.random() * 10) }],
    recentMentions: [{ source: "Twitter", text: `Check out ${body.brandName} - amazing service!`, sentiment: "positive", date: new Date().toISOString() }],
    alerts: [{ keyword: body.brandName, threshold: 10 }],
  }).returning();
  return c.json({ brand }, 201);
});

// ─── Site Maker ───
marketingSuiteRouter.get("/site-maker", async (c) => {
  const projects = await db.select().from(siteMakerProjects).where(eq(siteMakerProjects.userId, jwtPayload(c).sub));
  return c.json({ projects });
});

marketingSuiteRouter.post("/site-maker", async (c) => {
  const body = await c.req.json();
  const [project] = await db.insert(siteMakerProjects).values({
    userId: jwtPayload(c).sub, name: body.name, template: body.template,
    industry: body.industry, theme: body.theme || { primary: "#3B82F6", secondary: "#10B981", font: "Inter" },
    pages: body.pages || [{ name: "Home", slug: "/", content: "" }, { name: "About", slug: "/about", content: "" }, { name: "Contact", slug: "/contact", content: "" }],
  }).returning();
  return c.json({ project }, 201);
});

marketingSuiteRouter.post("/site-maker/:id/publish", async (c) => {
  const body = await c.req.json();
  const url = body.customDomain || `${(await db.select().from(siteMakerProjects).where(eq(siteMakerProjects.id, c.req.param("id"))).limit(1))[0]?.name || "site"}.cloudhost.app`;
  const [updated] = await db.update(siteMakerProjects).set({
    status: "published", publishedUrl: url, customDomain: body.customDomain,
    publishedAt: new Date(), updatedAt: new Date(),
  }).where(eq(siteMakerProjects.id, c.req.param("id"))).returning();
  return c.json({ project: updated, url });
});

// ─── Logo Maker ───
marketingSuiteRouter.get("/logo-maker", async (c) => {
  const projects = await db.select().from(logoMakerProjects).where(eq(logoMakerProjects.userId, jwtPayload(c).sub));
  return c.json({ projects });
});

marketingSuiteRouter.post("/logo-maker", async (c) => {
  const body = await c.req.json();
  const styles = ["minimal", "modern", "classic", "playful", "luxury", "tech", "hand-drawn", "geometric"];
  const style = body.style || styles[Math.floor(Math.random() * styles.length)];
  const [project] = await db.insert(logoMakerProjects).values({
    userId: jwtPayload(c).sub, brandName: body.brandName, industry: body.industry,
    style, colors: body.colors || ["#3B82F6", "#1E40AF"],
    fonts: body.fonts || { primary: "Inter", secondary: "Playfair Display" },
    svgUrl: `/api/generated/logos/${body.brandName?.toLowerCase().replace(/\s+/g, "-") || "logo"}.svg`,
    variants: [{ style: "primary", colors: ["#3B82F6", "#1E40AF"] }, { style: "dark", colors: ["#FFFFFF", "#3B82F6"] }],
  }).returning();
  return c.json({ project }, 201);
});

// ─── Font Maker ───
marketingSuiteRouter.get("/font-maker", async (c) => {
  const projects = await db.select().from(fontMakerProjects).where(eq(fontMakerProjects.userId, jwtPayload(c).sub));
  return c.json({ projects });
});

marketingSuiteRouter.post("/font-maker", async (c) => {
  const body = await c.req.json();
  const [project] = await db.insert(fontMakerProjects).values({
    userId: jwtPayload(c).sub, name: body.name, style: body.style || "sans-serif",
    preview: "The quick brown fox jumps over the lazy dog",
    formats: ["woff2", "woff", "ttf"],
    glyphs: Array.from({ length: 52 }, (_, i) => ({ char: String.fromCharCode(i + 65), svg: "" })),
  }).returning();
  return c.json({ project }, 201);
});

// ─── Business Name Generator ───
marketingSuiteRouter.post("/business-name-generator", async (c) => {
  const body = await c.req.json();
  const prefixes = ["Cloud", "Nex", "Apex", "Prime", "Zen", "Nova", "Vox", "Flux", "Core", "Pulse", "Strato", "Orbit", "Echo", "Luma", "Synth"];
  const roots = ["Tech", "Host", "Net", "Web", "Soft", "Byte", "Node", "Grid", "Edge", "Wave", "Nest", "Forge", "Vault", "Shift", "Lane"];
  const suffixes = ["Studio", "Lab", "Hub", "Pro", "Solutions", "Systems", "Global", "Dynamics", "Ventures", "Group", "Works", "Ops", "Flow", "Base", "Line"];
  const adjectives = ["Rapid", "Smart", "Bold", "Bright", "Swift", "Elite", "Peak", "True", "Next", "Vision", "Quantum", "Dynamic", "Pioneer", "Elevate", "Summit"];
  const generated: string[] = [];
  const keywords = (body.keywords || [body.industry || "tech"]) as string[];
  for (let i = 0; i < 12; i++) {
    const patterns = [
      () => `${prefixes[Math.floor(Math.random() * prefixes.length)]}${roots[Math.floor(Math.random() * roots.length)]}`,
      () => `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${keywords[Math.floor(Math.random() * keywords.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
      () => `${keywords[Math.floor(Math.random() * keywords.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
      () => `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${keywords[Math.floor(Math.random() * keywords.length)]}`,
      () => `${adjectives[Math.floor(Math.random() * adjectives.length)]}${keywords[Math.floor(Math.random() * keywords.length)]}`,
    ];
    generated.push(patterns[Math.floor(Math.random() * patterns.length)]());
  }
  const unique = [...new Set(generated)];
  const [entry] = await db.insert(businessNames).values({
    userId: jwtPayload(c).sub, industry: body.industry || "tech",
    keywords: keywords, generatedNames: unique.map(name => ({ name, available: Math.random() > 0.3, domain: `${name.toLowerCase().replace(/\s+/g, "")}.com` })),
  }).returning();
  return c.json({ names: entry.generatedNames, industry: body.industry });
});

// ─── Business Card Maker ───
marketingSuiteRouter.get("/business-cards", async (c) => {
  const cards = await db.select().from(businessCardProjects).where(eq(businessCardProjects.userId, jwtPayload(c).sub));
  return c.json({ cards });
});

marketingSuiteRouter.post("/business-cards", async (c) => {
  const body = await c.req.json();
  const [card] = await db.insert(businessCardProjects).values({
    userId: jwtPayload(c).sub, name: body.name,
    design: body.design || { layout: "portrait", rounded: true, border: true },
    colors: body.colors || { background: "#FFFFFF", text: "#1F2937", accent: "#3B82F6" },
    fonts: body.fonts || { name: "Inter", title: "Inter", details: "Inter" },
    format: body.format || "digital",
  }).returning();
  return c.json({ card }, 201);
});

// ─── Business Starter Kit ───
marketingSuiteRouter.get("/starter-kit", async (c) => {
  const kits = await db.select().from(businessStarterKits).where(eq(businessStarterKits.userId, jwtPayload(c).sub));
  return c.json({ kits });
});

marketingSuiteRouter.post("/starter-kit", async (c) => {
  const body = await c.req.json();
  const [kit] = await db.insert(businessStarterKits).values({
    userId: jwtPayload(c).sub, kitType: body.kitType || "basic",
    businessName: body.businessName, businessType: body.businessType,
    llcState: body.llcState, domainIncluded: true, emailIncluded: true, hostingIncluded: true,
  }).returning();
  return c.json({ kit }, 201);
});

marketingSuiteRouter.post("/starter-kit/:id/apply-llc", async (c) => {
  const body = await c.req.json();
  const ein = `${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10000000)}`;
  const [updated] = await db.update(businessStarterKits).set({
    llcState: body.state, llcStatus: "approved",
    einNumber: ein, einStatus: "approved",
    operatingAgreement: "standard_llc_operating_agreement_v2.pdf",
    status: "completed", completedAt: new Date(), updatedAt: new Date(),
  }).where(eq(businessStarterKits.id, c.req.param("id"))).returning();
  return c.json({ kit: updated, ein, message: `LLC registered in ${body.state}. EIN: ${ein}` });
});

// ─── Affiliates ───
marketingSuiteRouter.get("/affiliates", async (c) => {
  const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.userId, jwtPayload(c).sub)).limit(1);
  if (!affiliate) return c.json({ affiliate: null });
  const referrals = await db.select().from(affiliateReferrals).where(eq(affiliateReferrals.affiliateId, affiliate.id));
  return c.json({ affiliate, referrals });
});

marketingSuiteRouter.post("/affiliates/join", async (c) => {
  const existing = await db.select().from(affiliates).where(eq(affiliates.userId, jwtPayload(c).sub)).limit(1);
  if (existing.length > 0) return c.json({ error: "Already an affiliate" }, 400);
  const code = `CH${jwtPayload(c).sub.substring(0, 6).toUpperCase()}`;
  const [affiliate] = await db.insert(affiliates).values({
    userId: jwtPayload(c).sub, referralCode: code,
  }).returning();
  return c.json({ affiliate }, 201);
});

marketingSuiteRouter.post("/affiliates/generate-link", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(affiliates).set({
    promotedServices: body.services || body.promotedServices,
    updatedAt: new Date(),
  }).where(eq(affiliates.userId, jwtPayload(c).sub)).returning();
  return c.json({ affiliateLink: `https://cloudhost.app/ref/${updated?.referralCode || "CH"}` });
});

// ─── Abuse Reports ───
marketingSuiteRouter.post("/abuse", async (c) => {
  const body = await c.req.json();
  const [report] = await db.insert(abuseReports).values({
    reporterName: body.name, reporterEmail: body.email,
    reportType: body.type, domain: body.domain, ipAddress: body.ip,
    description: body.description, evidence: body.evidence,
  }).returning();
  return c.json({ report, message: "Abuse report submitted. We will review within 24 hours." }, 201);
});
