import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { db, marketplaceApps, appInstallations } from "@cloudhost/db";

export const marketplaceRouter = new Hono();

const seedApps = [
  { name: "WordPress", slug: "wordpress", category: "cms", description: "The world's most popular CMS for websites and blogs", version: "6.5", framework: "php", installType: "php", icon: "WP", defaultPort: 80, sourceUrl: "https://wordpress.org/latest.tar.gz", envVars: [{ key: "WP_HOME", default: "https://${DOMAIN}" }, { key: "DB_NAME", default: "wordpress" }] },
  { name: "WooCommerce", slug: "woocommerce", category: "ecommerce", description: "WordPress eCommerce plugin for online stores", version: "8.8", framework: "php", installType: "php", icon: "WC", defaultPort: 80, sourceUrl: "https://downloads.wordpress.org/plugin/woocommerce.zip" },
  { name: "Ghost", slug: "ghost", category: "blog", description: "Professional publishing platform for modern creators", version: "5.90", framework: "node", installType: "docker", icon: "GH", defaultPort: 2368, dockerImage: "ghost:5" },
  { name: "Next.js", slug: "nextjs", category: "cms", description: "React framework with SSR, SSG, and edge functions", version: "14.2", framework: "nextjs", installType: "node", icon: "N", defaultPort: 3000, sourceUrl: "https://github.com/vercel/next.js" },
  { name: "Strapi", slug: "strapi", category: "cms", description: "Open-source headless CMS with API-first approach", version: "4.25", framework: "node", installType: "node", icon: "S", defaultPort: 1337, dockerImage: "strapi/strapi:4" },
  { name: "Directus", slug: "directus", category: "cms", description: "Open-source data platform and headless CMS", version: "10.13", framework: "node", installType: "docker", icon: "D", defaultPort: 8055, dockerImage: "directus/directus:10" },
  { name: "Magento", slug: "magento", category: "ecommerce", description: "Enterprise-grade eCommerce platform", version: "2.4", framework: "php", installType: "php", icon: "M", defaultPort: 80, sourceUrl: "https://github.com/magento/magento2" },
  { name: "PrestaShop", slug: "prestashop", category: "ecommerce", description: "Free eCommerce platform for online merchants", version: "8.1", framework: "php", installType: "php", icon: "PS", defaultPort: 80, sourceUrl: "https://github.com/PrestaShop/PrestaShop" },
  { name: "Drupal", slug: "drupal", category: "cms", description: "Enterprise content management framework", version: "11.0", framework: "php", installType: "php", icon: "D", defaultPort: 80, sourceUrl: "https://github.com/drupal/drupal" },
  { name: "Joomla", slug: "joomla", category: "cms", description: "Award-winning CMS for websites and online applications", version: "5.1", framework: "php", installType: "php", icon: "J", defaultPort: 80, sourceUrl: "https://github.com/joomla/joomla-cms" },
  { name: "Laravel", slug: "laravel", category: "devtools", description: "PHP web application framework with elegant syntax", version: "11.0", framework: "php", installType: "php", icon: "L", defaultPort: 8000, sourceUrl: "https://github.com/laravel/laravel" },
  { name: "Django", slug: "django", category: "devtools", description: "High-level Python web framework", version: "5.0", framework: "python", installType: "python", icon: "DJ", defaultPort: 8000, sourceUrl: "https://github.com/django/django" },
  { name: "Flask", slug: "flask", category: "devtools", description: "Lightweight Python web framework", version: "3.0", framework: "python", installType: "python", icon: "F", defaultPort: 5000, sourceUrl: "https://github.com/pallets/flask" },
  { name: "Ruby on Rails", slug: "rails", category: "devtools", description: "Full-stack Ruby web framework", version: "7.1", framework: "ruby", installType: "ruby", icon: "R", defaultPort: 3000, sourceUrl: "https://github.com/rails/rails" },
  { name: "Express.js", slug: "express", category: "devtools", description: "Fast, unopinionated Node.js web framework", version: "4.19", framework: "node", installType: "node", icon: "EX", defaultPort: 3000, sourceUrl: "https://github.com/expressjs/express" },
  { name: "Nuxt.js", slug: "nuxt", category: "cms", description: "Vue.js framework for SSR and static sites", version: "3.12", framework: "vue", installType: "node", icon: "N", defaultPort: 3000, sourceUrl: "https://github.com/nuxt/nuxt" },
  { name: "Astro", slug: "astro", category: "cms", description: "All-in-one web framework for content-driven sites", version: "4.9", framework: "static", installType: "node", icon: "A", defaultPort: 4321, sourceUrl: "https://github.com/withastro/astro" },
  { name: "Discourse", slug: "discourse", category: "forum", description: "Modern open-source forum platform", version: "3.3", framework: "ruby", installType: "docker", icon: "D", defaultPort: 80, dockerImage: "discourse/discourse:latest" },
  { name: "NodeBB", slug: "nodebb", category: "forum", description: "Next-generation forum platform for the modern web", version: "3.8", framework: "node", installType: "node", icon: "N", defaultPort: 4567, sourceUrl: "https://github.com/NodeBB/NodeBB" },
  { name: "Wiki.js", slug: "wikijs", category: "wiki", description: "Modern, lightweight wiki for documentation", version: "2.5", framework: "node", installType: "docker", icon: "W", defaultPort: 3000, dockerImage: "requarks/wiki:2" },
  { name: "Matomo", slug: "matomo", category: "analytics", description: "Privacy-friendly web analytics platform", version: "5.1", framework: "php", installType: "php", icon: "M", defaultPort: 80, sourceUrl: "https://github.com/matomo-org/matomo" },
  { name: "Plausible", slug: "plausible", category: "analytics", description: "Simple, privacy-friendly web analytics", version: "2.1", framework: "elixir", installType: "docker", icon: "P", defaultPort: 8000, dockerImage: "plausible/analytics:latest" },
  { name: "Umami", slug: "umami", category: "analytics", description: "Simple, fast, privacy-focused web analytics", version: "2.10", framework: "node", installType: "docker", icon: "U", defaultPort: 3000, dockerImage: "ghcr.io/umami-software/umami:latest" },
  { name: "n8n", slug: "n8n", category: "devtools", description: "Workflow automation with 400+ integrations", version: "1.55", framework: "node", installType: "docker", icon: "N", defaultPort: 5678, dockerImage: "n8nio/n8n:latest" },
  { name: "Supabase", slug: "supabase", category: "devtools", description: "Open-source Firebase alternative with Postgres", version: "1.2", framework: "node", installType: "docker", icon: "SB", defaultPort: 8000, dockerImage: "supabase/supabase:latest" },
  { name: "NocoDB", slug: "nocodb", category: "devtools", description: "Open-source Airtable alternative", version: "0.255", framework: "node", installType: "docker", icon: "N", defaultPort: 8080, dockerImage: "nocodb/nocodb:latest" },
  { name: "Appwrite", slug: "appwrite", category: "devtools", description: "Backend server for web and mobile apps", version: "1.5", framework: "node", installType: "docker", icon: "A", defaultPort: 80, dockerImage: "appwrite/appwrite:latest" },
  { name: "MinIO", slug: "minio", category: "storage", description: "S3-compatible object storage server", version: "2024", framework: "go", installType: "docker", icon: "M", defaultPort: 9000, dockerImage: "minio/minio:latest" },
  { name: "Redis", slug: "redis", category: "devtools", description: "In-memory data structure store and cache", version: "7.2", framework: "c", installType: "docker", icon: "R", defaultPort: 6379, dockerImage: "redis:7-alpine" },
  { name: "PostgreSQL", slug: "postgresql", category: "devtools", description: "Advanced open-source relational database", version: "16", framework: "c", installType: "docker", icon: "PG", defaultPort: 5432, dockerImage: "postgres:16-alpine" },
  { name: "MongoDB", slug: "mongodb", category: "devtools", description: "NoSQL document database", version: "7.0", framework: "cpp", installType: "docker", icon: "M", defaultPort: 27017, dockerImage: "mongo:7" },
  { name: "MySQL", slug: "mysql", category: "devtools", description: "Popular open-source relational database", version: "8.4", framework: "cpp", installType: "docker", icon: "M", defaultPort: 3306, dockerImage: "mysql:8.4" },
  { name: "Grafana", slug: "grafana", category: "analytics", description: "Open-source monitoring and observability", version: "11.0", framework: "go", installType: "docker", icon: "G", defaultPort: 3000, dockerImage: "grafana/grafana:latest" },
  { name: "Prometheus", slug: "prometheus", category: "devtools", description: "Open-source monitoring and alerting toolkit", version: "2.53", framework: "go", installType: "docker", icon: "P", defaultPort: 9090, dockerImage: "prom/prometheus:latest" },
  { name: "Portainer", slug: "portainer", category: "devtools", description: "Docker and Kubernetes management UI", version: "2.21", framework: "go", installType: "docker", icon: "P", defaultPort: 9000, dockerImage: "portainer/portainer-ce:latest" },
  { name: "Jellyfin", slug: "jellyfin", category: "media", description: "Open-source media streaming server", version: "10.9", framework: "csharp", installType: "docker", icon: "J", defaultPort: 8096, dockerImage: "jellyfin/jellyfin:latest" },
  { name: "Mastodon", slug: "mastodon", category: "social", description: "Federated social media platform", version: "4.3", framework: "ruby", installType: "docker", icon: "M", defaultPort: 3000, dockerImage: "tootsuite/mastodon:latest" },
  { name: "Paperless-ngx", slug: "paperless", category: "finance", description: "Document management system for paperless office", version: "2.11", framework: "python", installType: "docker", icon: "P", defaultPort: 8000, dockerImage: "ghcr.io/paperless-ngx/paperless-ngx:latest" },
  { name: "OpenProject", slug: "openproject", category: "crm", description: "Open-source project management platform", version: "14.3", framework: "ruby", installType: "docker", icon: "O", defaultPort: 8080, dockerImage: "openproject/openproject:latest" },
  { name: "Hugo", slug: "hugo", category: "cms", description: "World's fastest static site generator", version: "0.127", framework: "go", installType: "static", icon: "H", defaultPort: 80, sourceUrl: "https://github.com/gohugoio/hugo" },
  { name: "Jekyll", slug: "jekyll", category: "cms", description: "Simple static site generator for blogs", version: "4.3", framework: "ruby", installType: "ruby", icon: "J", defaultPort: 4000, sourceUrl: "https://github.com/jekyll/jekyll" },
  { name: "Ollama", slug: "ollama", category: "ai", description: "Run open-source AI models locally", version: "0.3", framework: "go", installType: "docker", icon: "O", defaultPort: 11434, dockerImage: "ollama/ollama:latest" },
  { name: "Open WebUI", slug: "openwebui", category: "ai", description: "ChatGPT-like interface for local LLMs", version: "0.3", framework: "python", installType: "docker", icon: "OW", defaultPort: 3000, dockerImage: "ghcr.io/open-webui/open-webui:latest" },
  { name: "phpMyAdmin", slug: "phpmyadmin", category: "devtools", description: "Web-based MySQL/MariaDB management", version: "5.2", framework: "php", installType: "docker", icon: "P", defaultPort: 80, dockerImage: "phpmyadmin:latest" },
  { name: "pgAdmin", slug: "pgadmin", category: "devtools", description: "PostgreSQL management and administration tool", version: "8.11", framework: "python", installType: "docker", icon: "P", defaultPort: 80, dockerImage: "dpage/pgadmin4:latest" },
  { name: "Vaultwarden", slug: "vaultwarden", category: "security", description: "Lightweight password manager (Bitwarden compatible)", version: "1.31", framework: "rust", installType: "docker", icon: "V", defaultPort: 80, dockerImage: "vaultwarden/server:latest" },
  { name: "Gitea", slug: "gitea", category: "devtools", description: "Lightweight self-hosted Git service", version: "1.22", framework: "go", installType: "docker", icon: "G", defaultPort: 3000, dockerImage: "gitea/gitea:latest" },
  { name: "Metabase", slug: "metabase", category: "analytics", description: "Business intelligence and analytics tool", version: "0.50", framework: "clojure", installType: "docker", icon: "M", defaultPort: 3000, dockerImage: "metabase/metabase:latest" },
  { name: "Caddy", slug: "caddy", category: "devtools", description: "Automatic HTTPS web server in Go", version: "2.8", framework: "go", installType: "docker", icon: "C", defaultPort: 80, dockerImage: "caddy:latest" },
];

marketplaceRouter.get("/apps", async (c) => {
  const existing = await db.select().from(marketplaceApps).limit(1);
  if (existing.length === 0) {
    for (const app of seedApps) {
      await db.insert(marketplaceApps).values(app as any).onConflictDoNothing({ target: marketplaceApps.slug });
    }
  }
  const all = await db.select().from(marketplaceApps);
  return c.json({ apps: all });
});

marketplaceRouter.get("/apps/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [app] = await db.select().from(marketplaceApps).where(eq(marketplaceApps.slug, slug)).limit(1);
  if (!app) return c.json({ error: "Not found" }, 404);
  return c.json({ app });
});

marketplaceRouter.get("/installations", async (c) => {
  const payload = c.get("jwtPayload") as { sub: string };
  const all = await db.select().from(appInstallations)
    .innerJoin(marketplaceApps, eq(appInstallations.appId, marketplaceApps.id));
  return c.json({ installations: all });
});

marketplaceRouter.post("/install", async (c) => {
  const body = await c.req.json();
  const [app] = await db.select().from(marketplaceApps).where(eq(marketplaceApps.id, body.appId)).limit(1);
  if (!app) return c.json({ error: "App not found" }, 404);

  const adminUser = "admin_" + Math.random().toString(36).slice(2, 6);
  const adminPassword = Math.random().toString(36).slice(2, 18);

  const [installation] = await db.insert(appInstallations).values({
    appId: body.appId,
    hostingAccountId: body.hostingAccountId,
    domain: body.domain || `${app.slug}-${Math.random().toString(36).slice(2, 6)}.cloudhost.app`,
    version: app.version,
    adminUrl: body.domain ? `https://${body.domain}/admin` : `https://${app.slug}.cloudhost.app/admin`,
    adminUser,
    adminPassword,
    config: body.config || {},
    status: "installing",
  }).returning();

  await db.update(marketplaceApps).set({ installs: sql`${marketplaceApps.installs} + 1` }).where(eq(marketplaceApps.id, body.appId));

  setTimeout(async () => {
    await db.update(appInstallations).set({ status: "running" }).where(eq(appInstallations.id, installation.id));
  }, 5000);

  return c.json({ installation, adminUser, adminPassword }, 201);
});

marketplaceRouter.post("/installations/:id/action", async (c) => {
  const id = c.req.param("id");
  const { action } = await c.req.json();
  const actions: Record<string, string> = { restart: "running", stop: "installing", reset: "installing" };
  const newStatus = (actions[action] || "running") as "running" | "error" | "installing";
  const [updated] = await db.update(appInstallations).set({ status: newStatus, updatedAt: new Date() }).where(eq(appInstallations.id, id)).returning();
  return c.json({ installation: updated });
});

marketplaceRouter.delete("/installations/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(appInstallations).where(eq(appInstallations.id, id));
  return c.json({ success: true });
});
