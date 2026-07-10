import { Hono } from "hono";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@cloudhost/db";
import {
  n8nInstances, cloudHostingInstances, woocommerceHosting,
  agencyHosting, minecraftServers, aiAgentDeployments,
  googleWorkspace, websiteTemplates, ecommerceBuilderProjects,
  printOnDemand, linkInBio, aiNewsletterCampaigns,
  horizonsProjects, hostingerApiKeys, customerReviews,
  systemStatusEvents, roadmapItems, agencyDirectory,
  educationalPartnerships,
} from "@cloudhost/db";

const jwtPayload = (c: any) => c.get("jwtPayload") as { sub: string };

export const hostingerServicesRouter = new Hono();

// ─── Self-hosted n8n ───
hostingerServicesRouter.get("/n8n", async (c) => {
  const list = await db.select().from(n8nInstances).where(eq(n8nInstances.userId, jwtPayload(c).sub));
  return c.json({ instances: list });
});

hostingerServicesRouter.post("/n8n", async (c) => {
  const body = await c.req.json();
  const [instance] = await db.insert(n8nInstances).values({
    userId: jwtPayload(c).sub, name: body.name, version: body.version || "latest",
    domain: body.domain, vpsId: body.vpsId, username: body.username || "admin",
    password: body.password || Math.random().toString(36).slice(2) + "Aa1!",
    apiKey: `n8n_${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("")}`,
    dockerContainerId: `n8n_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
  }).returning();
  setTimeout(async () => {
    await db.update(n8nInstances).set({ status: "running", deployedAt: new Date(), updatedAt: new Date() }).where(eq(n8nInstances.id, instance.id));
  }, 3000);
  return c.json({ instance }, 201);
});

hostingerServicesRouter.post("/n8n/:id/restart", async (c) => {
  const [updated] = await db.update(n8nInstances).set({ status: "restarting", updatedAt: new Date() }).where(eq(n8nInstances.id, c.req.param("id"))).returning();
  setTimeout(async () => {
    await db.update(n8nInstances).set({ status: "running", updatedAt: new Date() }).where(eq(n8nInstances.id, c.req.param("id")));
  }, 5000);
  return c.json({ instance: updated });
});

hostingerServicesRouter.delete("/n8n/:id", async (c) => {
  await db.update(n8nInstances).set({ status: "deleted", updatedAt: new Date() }).where(eq(n8nInstances.id, c.req.param("id")));
  return c.json({ success: true });
});

// ─── Cloud Hosting ───
hostingerServicesRouter.get("/cloud-hosting", async (c) => {
  const list = await db.select().from(cloudHostingInstances).where(eq(cloudHostingInstances.userId, jwtPayload(c).sub));
  return c.json({ instances: list });
});

hostingerServicesRouter.post("/cloud-hosting", async (c) => {
  const body = await c.req.json();
  const ips = Array.from({ length: 3 }, () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`);
  const [instance] = await db.insert(cloudHostingInstances).values({
    userId: jwtPayload(c).sub, name: body.name, plan: body.plan,
    cpu: body.cpu, ram: body.ram, storage: body.storage,
    bandwidth: body.bandwidth, location: body.location,
    os: body.os, managed: body.managed ?? false, autoScaled: body.autoScaled ?? false,
    ipAddress: ips[0], price: body.price,
  }).returning();
  setTimeout(async () => {
    await db.update(cloudHostingInstances).set({ status: "running", provisionedAt: new Date(), updatedAt: new Date() }).where(eq(cloudHostingInstances.id, instance.id));
  }, 5000);
  return c.json({ instance }, 201);
});

hostingerServicesRouter.get("/cloud-hosting/:id/metrics", async (c) => {
  const metrics = {
    cpu: Math.floor(Math.random() * 80 + 5), ram: Math.floor(Math.random() * 70 + 10),
    disk: Math.floor(Math.random() * 40 + 20), network: Math.floor(Math.random() * 900 + 100),
    requests: Math.floor(Math.random() * 10000 + 500), uptime: `${Math.floor(Math.random() * 99 + 1)}%`,
  };
  await db.update(cloudHostingInstances).set({ metrics, updatedAt: new Date() }).where(eq(cloudHostingInstances.id, c.req.param("id")));
  return c.json({ metrics });
});

hostingerServicesRouter.delete("/cloud-hosting/:id", async (c) => {
  await db.update(cloudHostingInstances).set({ status: "stopped", updatedAt: new Date() }).where(eq(cloudHostingInstances.id, c.req.param("id")));
  return c.json({ success: true });
});

// ─── WooCommerce Hosting ───
hostingerServicesRouter.get("/woocommerce", async (c) => {
  const list = await db.select().from(woocommerceHosting).where(eq(woocommerceHosting.userId, jwtPayload(c).sub));
  return c.json({ stores: list });
});

hostingerServicesRouter.post("/woocommerce", async (c) => {
  const body = await c.req.json();
  const [store] = await db.insert(woocommerceHosting).values({
    userId: jwtPayload(c).sub, domain: body.domain, plan: body.plan || "starter",
    storeName: body.storeName, theme: body.theme || "Storefront",
    woocommerceVersion: "9.2.0", wpVersion: "6.7.0",
    plugins: ["WooCommerce", "Jetpack", "Yoast SEO", "WooCommerce Payments", "MailPoet"],
    caching: "enabled", cdn: true, sslEnabled: true,
    price: body.price,
  }).returning();
  setTimeout(async () => {
    await db.update(woocommerceHosting).set({ status: "active", provisionedAt: new Date(), updatedAt: new Date() }).where(eq(woocommerceHosting.id, store.id));
  }, 4000);
  return c.json({ store }, 201);
});

hostingerServicesRouter.post("/woocommerce/:id/sync", async (c) => {
  const [updated] = await db.update(woocommerceHosting).set({
    productCount: Math.floor(Math.random() * 50 + 5),
    orderCount: Math.floor(Math.random() * 200 + 10),
    revenue: (Math.random() * 10000 + 100).toFixed(2),
    updatedAt: new Date(),
  }).where(eq(woocommerceHosting.id, c.req.param("id"))).returning();
  return c.json({ store: updated });
});

// ─── Agency Hosting ───
hostingerServicesRouter.get("/agency-hosting", async (c) => {
  const list = await db.select().from(agencyHosting).where(eq(agencyHosting.userId, jwtPayload(c).sub));
  return c.json({ agencies: list });
});

hostingerServicesRouter.post("/agency-hosting", async (c) => {
  const body = await c.req.json();
  const [agency] = await db.insert(agencyHosting).values({
    userId: jwtPayload(c).sub, agencyName: body.agencyName, plan: body.plan,
    maxClients: body.maxClients || 10, whiteLabel: body.whiteLabel ?? false,
    customBranding: body.customBranding, revenueShare: body.revenueShare || "20",
    price: body.price,
  }).returning();
  return c.json({ agency }, 201);
});

// ─── Minecraft Servers ───
hostingerServicesRouter.get("/minecraft", async (c) => {
  const list = await db.select().from(minecraftServers).where(eq(minecraftServers.userId, jwtPayload(c).sub));
  return c.json({ servers: list });
});

hostingerServicesRouter.post("/minecraft", async (c) => {
  const body = await c.req.json();
  const ips = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  const [server] = await db.insert(minecraftServers).values({
    userId: jwtPayload(c).sub, name: body.name, version: body.version || "1.20.4",
    serverType: body.serverType || "vanilla", ram: body.ram || "2GB", cpu: body.cpu || "2 vCPU",
    storage: body.storage || "20GB", maxPlayers: body.maxPlayers || 20,
    ipAddress: ips, port: 25565, onlineMode: body.onlineMode ?? true,
    pvp: body.pvp ?? true, difficulty: body.difficulty || "normal",
    whitelist: body.whitelist || [], operators: body.operators || [],
    price: body.price,
  }).returning();
  setTimeout(async () => {
    await db.update(minecraftServers).set({ status: "running", provisionedAt: new Date(), lastStartedAt: new Date(), updatedAt: new Date() }).where(eq(minecraftServers.id, server.id));
  }, 3000);
  return c.json({ server }, 201);
});

hostingerServicesRouter.post("/minecraft/:id/start", async (c) => {
  const [updated] = await db.update(minecraftServers).set({ status: "running", lastStartedAt: new Date(), updatedAt: new Date() }).where(eq(minecraftServers.id, c.req.param("id"))).returning();
  return c.json({ server: updated });
});

hostingerServicesRouter.post("/minecraft/:id/stop", async (c) => {
  const [updated] = await db.update(minecraftServers).set({ status: "stopped", onlinePlayers: 0, updatedAt: new Date() }).where(eq(minecraftServers.id, c.req.param("id"))).returning();
  return c.json({ server: updated });
});

hostingerServicesRouter.post("/minecraft/:id/kill", async (c) => {
  const [updated] = await db.update(minecraftServers).set({ status: "killed", onlinePlayers: 0, updatedAt: new Date() }).where(eq(minecraftServers.id, c.req.param("id"))).returning();
  return c.json({ server: updated });
});

// ─── AI Agent Deployments (Hermes, OpenClaw, Paperclip) ───
hostingerServicesRouter.get("/ai-agents", async (c) => {
  const list = await db.select().from(aiAgentDeployments).where(eq(aiAgentDeployments.userId, jwtPayload(c).sub));
  return c.json({ agents: list });
});

hostingerServicesRouter.post("/ai-agents", async (c) => {
  const body = await c.req.json();
  const ports: Record<string, number> = { hermes: 3000, openclaw: 3001, paperclip: 3002 };
  const [agent] = await db.insert(aiAgentDeployments).values({
    userId: jwtPayload(c).sub, agentType: body.agentType, name: body.name,
    version: body.version || "latest", vpsId: body.vpsId, domain: body.domain,
    port: ports[body.agentType] || 8080, apiKey: `${body.agentType}_${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("")}`,
    apiEndpoint: `https://${body.domain || `${body.name}.cloudhost.app`}/api`,
    configuration: body.configuration || {},
    dockerContainerId: `${body.agentType}_${Date.now()}`,
    price: body.price,
  }).returning();
  setTimeout(async () => {
    await db.update(aiAgentDeployments).set({ status: "running", deployedAt: new Date(), uptime: "0d 0h 5m", updatedAt: new Date() }).where(eq(aiAgentDeployments.id, agent.id));
  }, 3000);
  return c.json({ agent }, 201);
});

hostingerServicesRouter.post("/ai-agents/:id/restart", async (c) => {
  const [updated] = await db.update(aiAgentDeployments).set({ status: "restarting", updatedAt: new Date() }).where(eq(aiAgentDeployments.id, c.req.param("id"))).returning();
  return c.json({ agent: updated });
});

hostingerServicesRouter.delete("/ai-agents/:id", async (c) => {
  await db.update(aiAgentDeployments).set({ status: "deleted", updatedAt: new Date() }).where(eq(aiAgentDeployments.id, c.req.param("id")));
  return c.json({ success: true });
});

// ─── Google Workspace ───
hostingerServicesRouter.get("/google-workspace", async (c) => {
  const list = await db.select().from(googleWorkspace).where(eq(googleWorkspace.userId, jwtPayload(c).sub));
  return c.json({ accounts: list });
});

hostingerServicesRouter.post("/google-workspace", async (c) => {
  const body = await c.req.json();
  const mx = [
    { priority: 1, value: "ASPMX.L.GOOGLE.COM" },
    { priority: 5, value: "ALT1.ASPMX.L.GOOGLE.COM" },
    { priority: 5, value: "ALT2.ASPMX.L.GOOGLE.COM" },
    { priority: 10, value: "ALT3.ASPMX.L.GOOGLE.COM" },
    { priority: 10, value: "ALT4.ASPMX.L.GOOGLE.COM" },
  ];
  const [account] = await db.insert(googleWorkspace).values({
    userId: jwtPayload(c).sub, domain: body.domain, plan: body.plan || "business_starter",
    seats: body.seats || 1, adminEmail: `admin@${body.domain}`,
    mxRecords: mx, price: body.price,
  }).returning();
  return c.json({ account }, 201);
});

hostingerServicesRouter.post("/google-workspace/:id/verify", async (c) => {
  const [updated] = await db.update(googleWorkspace).set({
    verified: true, dnsStatus: "verified", activatedAt: new Date(), status: "active",
    updatedAt: new Date(),
  }).where(eq(googleWorkspace.id, c.req.param("id"))).returning();
  return c.json({ account: updated });
});

// ─── Templates ───
hostingerServicesRouter.get("/templates", async (c) => {
  const cat = c.req.query("category");
  const industry = c.req.query("industry");
  let list = await db.select().from(websiteTemplates).where(eq(websiteTemplates.active, true));
  if (cat) list = list.filter(t => t.category === cat);
  if (industry) list = list.filter(t => t.industry === industry);
  return c.json({ templates: list });
});

hostingerServicesRouter.post("/templates/seed", async (c) => {
  const templates = [
    { name: "Business Pro", slug: "business-pro", category: "business", industry: "general", description: "Professional business website template", features: ["Contact form", "About page", "Services grid", "Testimonials"], pages: ["Home", "About", "Services", "Contact", "Blog"], isResponsive: true, popularity: 95 },
    { name: "Online Store", slug: "online-store", category: "ecommerce", industry: "retail", description: "Full-featured online store template", features: ["Product catalog", "Shopping cart", "Checkout", "Payment integration"], pages: ["Home", "Shop", "Product", "Cart", "Checkout", "About"], isResponsive: true, isEcommerce: true, popularity: 90 },
    { name: "Portfolio", slug: "portfolio", category: "creative", industry: "design", description: "Showcase your work beautifully", features: ["Gallery", "Filter", "Project pages", "Contact"], pages: ["Home", "Projects", "About", "Contact"], isResponsive: true, popularity: 85 },
    { name: "Blog & Magazine", slug: "blog-magazine", category: "blog", industry: "media", description: "Modern blog and magazine layout", features: ["Article grid", "Categories", "Search", "Newsletter"], pages: ["Home", "Articles", "Categories", "About", "Contact"], isResponsive: true, popularity: 88 },
    { name: "Restaurant", slug: "restaurant", category: "food", industry: "hospitality", description: "Restaurant with online ordering", features: ["Menu display", "Online ordering", "Reservations", "Location"], pages: ["Home", "Menu", "Reservations", "About", "Contact"], isResponsive: true, popularity: 82 },
    { name: "Landing Page", slug: "landing-page", category: "marketing", industry: "general", description: "High-converting landing page", features: ["Hero section", "Features", "Testimonials", "CTA"], pages: ["Home", "Features", "Pricing", "Contact"], isResponsive: true, popularity: 92 },
    { name: "SaaS Dashboard", slug: "saas-dashboard", category: "saas", industry: "technology", description: "SaaS product dashboard layout", features: ["Analytics", "User management", "Settings", "Billing"], pages: ["Dashboard", "Analytics", "Users", "Settings", "Billing"], isResponsive: true, popularity: 78 },
    { name: "Wedding", slug: "wedding", category: "event", industry: "events", description: "Elegant wedding website", features: ["Countdown", "Gallery", "RSVP", "Venue info"], pages: ["Home", "Gallery", "Schedule", "RSVP", "Contact"], isResponsive: true, popularity: 75 },
    { name: "Photography", slug: "photography", category: "creative", industry: "photography", description: "Stunning photography portfolio", features: ["Masonry gallery", "Lightbox", "Client area", "Booking"], pages: ["Home", "Gallery", "Pricing", "About", "Contact"], isResponsive: true, popularity: 80 },
    { name: "Fitness Coach", slug: "fitness-coach", category: "health", industry: "fitness", description: "Fitness coaching website", features: ["Program display", "Booking", "Blog", "Testimonials"], pages: ["Home", "Programs", "Schedule", "Blog", "Contact"], isResponsive: true, popularity: 72 },
    { name: "Real Estate", slug: "real-estate", category: "business", industry: "real-estate", description: "Property listing website", features: ["Property search", "Listing grid", "Agent profiles", "Mortgage calc"], pages: ["Home", "Listings", "Property", "Agents", "Contact"], isResponsive: true, popularity: 83 },
    { name: "AI Startup", slug: "ai-startup", category: "saas", industry: "technology", description: "Modern AI startup landing page", features: ["Hero animation", "Feature showcase", "Team", "Waitlist"], pages: ["Home", "Product", "Team", "Blog", "Contact"], isResponsive: true, isAi: true, popularity: 88 },
  ];
  for (const t of templates) {
    await db.insert(websiteTemplates).values(t).onConflictDoNothing();
  }
  return c.json({ seeded: templates.length });
});

// ─── Ecommerce Builder ───
hostingerServicesRouter.get("/ecommerce-builder", async (c) => {
  const list = await db.select().from(ecommerceBuilderProjects).where(eq(ecommerceBuilderProjects.userId, jwtPayload(c).sub));
  return c.json({ projects: list });
});

hostingerServicesRouter.post("/ecommerce-builder", async (c) => {
  const body = await c.req.json();
  const [project] = await db.insert(ecommerceBuilderProjects).values({
    userId: jwtPayload(c).sub, name: body.name, template: body.template,
    industry: body.industry, paymentGateways: body.paymentGateways || ["stripe"],
    shippingMethods: body.shippingMethods || [{ name: "Standard", price: "5.99" }, { name: "Express", price: "14.99" }],
    taxSettings: body.taxSettings || { autoCalculate: true, defaultRate: "0.08" },
  }).returning();
  return c.json({ project }, 201);
});

hostingerServicesRouter.post("/ecommerce-builder/:id/publish", async (c) => {
  const [updated] = await db.update(ecommerceBuilderProjects).set({
    status: "published", publishedUrl: `${(await db.select().from(ecommerceBuilderProjects).where(eq(ecommerceBuilderProjects.id, c.req.param("id"))).limit(1))[0]?.name || "store"}.cloudhost.app`,
    publishedAt: new Date(), updatedAt: new Date(),
  }).where(eq(ecommerceBuilderProjects.id, c.req.param("id"))).returning();
  return c.json({ project: updated });
});

// ─── Print on Demand ───
hostingerServicesRouter.get("/print-on-demand", async (c) => {
  const list = await db.select().from(printOnDemand).where(eq(printOnDemand.userId, jwtPayload(c).sub));
  return c.json({ stores: list });
});

hostingerServicesRouter.post("/print-on-demand", async (c) => {
  const body = await c.req.json();
  const [store] = await db.insert(printOnDemand).values({
    userId: jwtPayload(c).sub, storeName: body.storeName, provider: body.provider || "printful",
    connectedPlatform: body.connectedPlatform, apiKey: `pod_${Math.random().toString(36).substring(2)}`,
    designTemplates: body.designTemplates || [{ name: "T-Shirt", variants: ["Black", "White", "Navy"] }, { name: "Hoodie", variants: ["Black", "Gray"] }, { name: "Mug", variants: ["White", "Black"] }],
  }).returning();
  return c.json({ store }, 201);
});

// ─── Link in Bio ───
hostingerServicesRouter.get("/link-in-bio", async (c) => {
  const list = await db.select().from(linkInBio).where(eq(linkInBio.userId, jwtPayload(c).sub));
  return c.json({ pages: list });
});

hostingerServicesRouter.post("/link-in-bio", async (c) => {
  const body = await c.req.json();
  const [page] = await db.insert(linkInBio).values({
    userId: jwtPayload(c).sub, title: body.title, username: body.username,
    bio: body.bio, avatarUrl: body.avatarUrl,
    theme: body.theme || { background: "#0F172A", text: "#FFFFFF", accent: "#3B82F6", font: "Inter", rounded: true },
    links: body.links || [{ title: "My Website", url: "https://example.com" }, { title: "Portfolio", url: "https://portfolio.example.com" }],
    socialLinks: body.socialLinks || [{ platform: "twitter", url: `https://twitter.com/${body.username}` }],
    publishedUrl: `https://cloudhost.app/${body.username}`,
  }).returning();
  return c.json({ page }, 201);
});

hostingerServicesRouter.post("/link-in-bio/:id/publish", async (c) => {
  const [updated] = await db.update(linkInBio).set({
    status: "published", publishedAt: new Date(), updatedAt: new Date(),
  }).where(eq(linkInBio.id, c.req.param("id"))).returning();
  return c.json({ page: updated });
});

// ─── AI Newsletter Generator ───
hostingerServicesRouter.get("/newsletter", async (c) => {
  const list = await db.select().from(aiNewsletterCampaigns).where(eq(aiNewsletterCampaigns.userId, jwtPayload(c).sub));
  return c.json({ campaigns: list });
});

hostingerServicesRouter.post("/newsletter", async (c) => {
  const body = await c.req.json();
  const topics: Record<string, string> = {
    technology: "Latest tech trends, AI breakthroughs, and digital transformation insights",
    business: "Business strategies, growth hacks, and entrepreneurial success stories",
    marketing: "Digital marketing tips, SEO strategies, and social media tactics",
    lifestyle: "Wellness tips, productivity hacks, and lifestyle inspiration",
    random: "Curated insights, industry news, and actionable tips",
  };
  const content = `# ${body.title || "Monthly Newsletter"}\n\n## ${body.topic || "Industry"} Updates\n\n${topics[body.topic || "random"] || "Curated content just for you"}\n\n### Key Highlights\n- Industry trend analysis and insights\n- Expert tips and best practices\n- Upcoming events and webinars\n- Exclusive offers and resources\n\n---\n\nThank you for reading! Stay tuned for more updates.`;
  const [campaign] = await db.insert(aiNewsletterCampaigns).values({
    userId: jwtPayload(c).sub, title: body.title, subject: body.subject,
    topic: body.topic, tone: body.tone || "professional",
    subscribers: Math.floor(Math.random() * 1000 + 50),
    generatedContent: content,
  }).returning();
  return c.json({ campaign }, 201);
});

hostingerServicesRouter.post("/newsletter/:id/generate", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(aiNewsletterCampaigns).set({
    topic: body.topic, tone: body.tone,
    generatedContent: `# ${body.topic || "Newsletter"} Edition\n\nAI-generated content based on your preferences...\n\n*Generated at ${new Date().toISOString()}*`,
    updatedAt: new Date(),
  }).where(eq(aiNewsletterCampaigns.id, c.req.param("id"))).returning();
  return c.json({ campaign: updated });
});

hostingerServicesRouter.post("/newsletter/:id/send", async (c) => {
  const [updated] = await db.update(aiNewsletterCampaigns).set({
    status: "sent", sentAt: new Date(), sentCount: Math.floor(Math.random() * 500 + 100),
    openRate: (Math.random() * 40 + 20).toFixed(1),
    clickRate: (Math.random() * 10 + 2).toFixed(1),
    updatedAt: new Date(),
  }).where(eq(aiNewsletterCampaigns.id, c.req.param("id"))).returning();
  return c.json({ campaign: updated });
});

// ─── Hostinger Horizons ───
hostingerServicesRouter.get("/horizons", async (c) => {
  const list = await db.select().from(horizonsProjects).where(eq(horizonsProjects.userId, jwtPayload(c).sub));
  return c.json({ projects: list });
});

hostingerServicesRouter.post("/horizons", async (c) => {
  const body = await c.req.json();
  const [project] = await db.insert(horizonsProjects).values({
    userId: jwtPayload(c).sub, name: body.name, description: body.description,
    prompt: body.prompt, techStack: body.techStack || ["React", "Node.js", "PostgreSQL"],
    pages: body.pages || [{ name: "Home", route: "/" }, { name: "About", route: "/about" }],
    features: body.features || [],
    integrations: body.integrations || [],
    aiCredits: body.aiCredits || 30,
  }).returning();
  return c.json({ project }, 201);
});

hostingerServicesRouter.post("/horizons/:id/generate", async (c) => {
  const body = await c.req.json();
  const [project] = await db.select().from(horizonsProjects).where(eq(horizonsProjects.id, c.req.param("id"))).limit(1);
  if (!project) return c.json({ error: "Not found" }, 404);
  const creditsUsed = (project.aiCreditsUsed || 0) + 1;
  const [updated] = await db.update(horizonsProjects).set({
    prompt: body.prompt || project.prompt, aiCreditsUsed: creditsUsed,
    pages: (project.pages as any[] || []).concat(body.newPages || []),
    features: (project.features as any[] || []).concat(body.newFeatures || []),
    updatedAt: new Date(),
  }).where(eq(horizonsProjects.id, c.req.param("id"))).returning();
  return c.json({ project: updated, creditsRemaining: (project.aiCredits || 30) - creditsUsed });
});

hostingerServicesRouter.post("/horizons/:id/publish", async (c) => {
  const body = await c.req.json();
  const url = body.customDomain || `${(await db.select().from(horizonsProjects).where(eq(horizonsProjects.id, c.req.param("id"))).limit(1))[0]?.name || "app"}.cloudhost.app`;
  const [updated] = await db.update(horizonsProjects).set({
    status: "published", publishedUrl: url, customDomain: body.customDomain,
    publishedAt: new Date(), updatedAt: new Date(),
  }).where(eq(horizonsProjects.id, c.req.param("id"))).returning();
  return c.json({ project: updated });
});

// ─── Hostinger API ───
hostingerServicesRouter.get("/api-keys", async (c) => {
  const keys = await db.select().from(hostingerApiKeys).where(eq(hostingerApiKeys.userId, jwtPayload(c).sub));
  return c.json({ keys });
});

hostingerServicesRouter.post("/api-keys", async (c) => {
  const body = await c.req.json();
  const key = `CH_API_${Array.from({ length: 48 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`;
  const [apiKey] = await db.insert(hostingerApiKeys).values({
    userId: jwtPayload(c).sub, name: body.name, key,
    permissions: body.permissions || ["read"], expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
  }).returning();
  return c.json({ key: apiKey }, 201);
});

hostingerServicesRouter.delete("/api-keys/:id", async (c) => {
  await db.update(hostingerApiKeys).set({ active: false }).where(eq(hostingerApiKeys.id, c.req.param("id")));
  return c.json({ success: true });
});

// ─── Reviews ───
hostingerServicesRouter.get("/reviews", async (c) => {
  const list = await db.select().from(customerReviews).where(eq(customerReviews.approved, true));
  return c.json({ reviews: list });
});

// ─── System Status ───
hostingerServicesRouter.get("/status", async (c) => {
  const events = await db.select().from(systemStatusEvents).orderBy(desc(systemStatusEvents.createdAt)).limit(10);
  return c.json({ events });
});

// ─── Roadmap ───
hostingerServicesRouter.get("/roadmap", async (c) => {
  const items = await db.select().from(roadmapItems).orderBy(desc(roadmapItems.votes));
  return c.json({ items });
});

hostingerServicesRouter.post("/roadmap/:id/vote", async (c) => {
  const [updated] = await db.update(roadmapItems).set({ votes: sql`${roadmapItems.votes} + 1` }).where(eq(roadmapItems.id, c.req.param("id"))).returning();
  return c.json({ item: updated });
});

// ─── Agency Directory ───
hostingerServicesRouter.get("/agency-directory", async (c) => {
  const list = await db.select().from(agencyDirectory).where(eq(agencyDirectory.status, "active"));
  return c.json({ agencies: list });
});

hostingerServicesRouter.post("/agency-directory", async (c) => {
  const body = await c.req.json();
  const [agency] = await db.insert(agencyDirectory).values({
    userId: jwtPayload(c).sub, agencyName: body.agencyName, description: body.description,
    website: body.website, services: body.services, expertise: body.expertise,
    location: body.location,
  }).returning();
  return c.json({ agency }, 201);
});

// ─── Educational Partnerships ───
hostingerServicesRouter.get("/educational-partnerships", async (c) => {
  const list = await db.select().from(educationalPartnerships).where(eq(educationalPartnerships.userId, jwtPayload(c).sub));
  return c.json({ partnerships: list });
});

hostingerServicesRouter.post("/educational-partnerships", async (c) => {
  const body = await c.req.json();
  const code = `EDU_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const [partnership] = await db.insert(educationalPartnerships).values({
    userId: jwtPayload(c).sub, institutionName: body.institutionName,
    institutionType: body.institutionType, contactName: body.contactName,
    contactEmail: body.contactEmail, country: body.country,
    studentCount: body.studentCount, programType: body.programType,
    discountRate: body.discountRate || "30", discountCode: code,
  }).returning();
  return c.json({ partnership }, 201);
});
