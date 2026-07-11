export function setupDemoApi() {
  if (typeof window === "undefined") return;
  const orig = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!url.includes("localhost:3001")) return orig(input, init);
    const method = init?.method || "GET";
    const body = init?.body ? JSON.parse(init.body as string) : undefined;
    const handler = findHandler(url, method, body);
    if (handler) {
      await delay(200 + Math.random() * 300);
      return new Response(JSON.stringify(handler.data), { status: handler.status, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  };
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

const uuid = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16); });
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600000).toISOString();

const demoProjects = [
  { id: uuid(), name: "Acme Corp Website", description: "Company landing page and blog", createdAt: daysAgo(45), organizationId: uuid() },
  { id: uuid(), name: "E-commerce Store", description: "Online storefront with payments", createdAt: daysAgo(30), organizationId: uuid() },
  { id: uuid(), name: "SaaS Dashboard", description: "Customer analytics dashboard", createdAt: daysAgo(15), organizationId: uuid() },
  { id: uuid(), name: "Mobile API Backend", description: "GraphQL API for mobile clients", createdAt: daysAgo(7), organizationId: uuid() },
];

const demoDeployments = [
  { id: uuid(), projectId: demoProjects[0].id, name: "acme-website", framework: "Next.js", status: "running", gitBranch: "main", buildCommand: "npm run build", outputDirectory: ".next", environment: { NODE_ENV: "production", API_URL: "https://api.acme.com" }, gitRepository: "https://github.com/acme/website.git", url: "acme-website.cloudhost.app", createdAt: daysAgo(45), updatedAt: hoursAgo(2) },
  { id: uuid(), projectId: demoProjects[1].id, name: "ecommerce-store", framework: "React", status: "running", gitBranch: "main", buildCommand: "npm run build", outputDirectory: "build", environment: { NODE_ENV: "production", STRIPE_KEY: "sk_live_***" }, gitRepository: "https://github.com/acme/store.git", url: "ecommerce-store.cloudhost.app", createdAt: daysAgo(30), updatedAt: hoursAgo(6) },
  { id: uuid(), projectId: demoProjects[2].id, name: "saas-dashboard", framework: "Next.js", status: "running", gitBranch: "develop", buildCommand: "npm run build", outputDirectory: ".next", environment: { NODE_ENV: "development" }, gitRepository: "https://github.com/acme/saas.git", url: "saas-dashboard.cloudhost.app", createdAt: daysAgo(15), updatedAt: hoursAgo(1) },
  { id: uuid(), projectId: demoProjects[3].id, name: "api-backend", framework: "Node.js", status: "running", gitBranch: "main", buildCommand: "npm run build", outputDirectory: "dist", environment: { NODE_ENV: "production", DB_URL: "postgres://***" }, gitRepository: "https://github.com/acme/api.git", url: "api-backend.cloudhost.app", createdAt: daysAgo(7), updatedAt: hoursAgo(12) },
  { id: uuid(), projectId: demoProjects[0].id, name: "acme-staging", framework: "Next.js", status: "stopped", gitBranch: "staging", buildCommand: "npm run build", outputDirectory: ".next", environment: { NODE_ENV: "staging" }, gitRepository: "https://github.com/acme/website.git", url: "acme-staging.cloudhost.app", createdAt: daysAgo(10), updatedAt: daysAgo(3) },
  { id: uuid(), projectId: demoProjects[1].id, name: "admin-panel", framework: "PHP", status: "failed", gitBranch: "main", buildCommand: "composer install", outputDirectory: "public", environment: {}, gitRepository: "https://github.com/acme/admin.git", url: "admin-panel.cloudhost.app", createdAt: daysAgo(5), updatedAt: hoursAgo(8) },
];

const demoDatabases = [
  { id: uuid(), projectId: demoProjects[0].id, name: "acme-main-db", type: "PostgreSQL", version: "16", status: "running", host: "db.cloudhost.internal", port: 5432, databaseName: "acme_production", username: "acme_admin", password: uuid().substring(0, 20), createdAt: daysAgo(45), size: "2.4 GB" },
  { id: uuid(), projectId: demoProjects[1].id, name: "store-inventory", type: "MySQL", version: "8.0", status: "running", host: "db.cloudhost.internal", port: 3306, databaseName: "store_inventory", username: "store_user", password: uuid().substring(0, 20), createdAt: daysAgo(30), size: "1.1 GB" },
  { id: uuid(), projectId: demoProjects[2].id, name: "saas-cache", type: "Redis", version: "7.2", status: "running", host: "redis.cloudhost.internal", port: 6379, databaseName: "", username: "", password: uuid().substring(0, 20), createdAt: daysAgo(15), size: "128 MB" },
  { id: uuid(), projectId: demoProjects[0].id, name: "acme-analytics", type: "PostgreSQL", version: "15", status: "stopped", host: "db.cloudhost.internal", port: 5432, databaseName: "acme_analytics", username: "analytics_user", password: uuid().substring(0, 20), createdAt: daysAgo(20), size: "856 MB" },
];

const demoWordPress = [
  { id: uuid(), name: "Acme Blog", domain: "blog.acme.com", phpVersion: "8.2", status: "running", adminEmail: "admin@acme.com", adminPassword: "wp_***", createdAt: daysAgo(30), url: "https://blog.acme.com" },
  { id: uuid(), name: "Company News", domain: "news.acme.com", phpVersion: "8.1", status: "running", adminEmail: "editor@acme.com", adminPassword: "wp_***", createdAt: daysAgo(14), url: "https://news.acme.com" },
];

const demoDomains = [
  { id: uuid(), name: "acme.com", verified: true, dnsRecords: [
    { type: "A", name: "@", value: "76.76.21.21", ttl: 3600 },
    { type: "CNAME", name: "www", value: "acme.cloudhost.app", ttl: 3600 },
    { type: "MX", name: "@", value: "mail.acme.com", ttl: 3600 },
    { type: "TXT", name: "@", value: "v=spf1 include:_spf.cloudhost.app ~all", ttl: 3600 },
  ]},
  { id: uuid(), name: "shop.acme.com", verified: true, dnsRecords: [
    { type: "CNAME", name: "@", value: "acme.cloudhost.app", ttl: 3600 },
  ]},
  { id: uuid(), name: "api.acme.com", verified: false, dnsRecords: [] },
];

const demoWorkflows = [
  { id: uuid(), name: "Deploy Notification", description: "Send Slack message on deploy", active: true, trigger: "Webhook", createdAt: daysAgo(20), updatedAt: hoursAgo(4), nodes: [{ id: "1", type: "webhook" }, { id: "2", type: "slack" }] },
  { id: uuid(), name: "Daily Backup", description: "Backup all databases at midnight", active: true, trigger: "Schedule", createdAt: daysAgo(15), updatedAt: daysAgo(1), nodes: [{ id: "1", type: "schedule" }, { id: "2", type: "database" }] },
  { id: uuid(), name: "Welcome Email", description: "Send welcome email to new users", active: false, trigger: "Email", createdAt: daysAgo(10), updatedAt: daysAgo(5), nodes: [{ id: "1", type: "email" }, { id: "2", type: "http" }] },
  { id: uuid(), name: "Deploy to Staging", description: "Auto-deploy main branch to staging", active: true, trigger: "Webhook", createdAt: daysAgo(5), updatedAt: hoursAgo(12), nodes: [{ id: "1", type: "webhook" }, { id: "2", type: "http" }, { id: "3", type: "database" }] },
  { id: uuid(), name: "Site Monitoring", description: "Check site uptime every 5 minutes", active: true, trigger: "Schedule", createdAt: daysAgo(3), updatedAt: hoursAgo(8), nodes: [{ id: "1", type: "schedule" }, { id: "2", type: "http" }] },
];

const demoEdgeFunctions = [
  { id: uuid(), name: "hello-world", runtime: "deno", status: "active", url: "https://edge.cloudhost.app/hello-world", sourceCode: `export default async (req: Request) => {\n  const { name } = await req.json().catch(() => ({ name: "World" }));\n  return new Response(\n    JSON.stringify({ message: \`Hello \${name} from the edge!\` }),\n    { headers: { "Content-Type": "application/json" } }\n  );\n};`, createdAt: daysAgo(20), projectId: uuid() },
  { id: uuid(), name: "auth-middleware", runtime: "deno", status: "active", url: "https://edge.cloudhost.app/auth-middleware", sourceCode: `export default async (req: Request) => {\n  const token = req.headers.get("Authorization");\n  if (!token) return new Response("Unauthorized", { status: 401 });\n  return fetch("https://api.example.com/verify", { headers: { Authorization: token } });\n};`, createdAt: daysAgo(12), projectId: uuid() },
  { id: uuid(), name: "image-optimizer", runtime: "node", status: "inactive", url: "https://edge.cloudhost.app/image-optimizer", sourceCode: `import sharp from "sharp";\nexport default async (req: Request) => {\n  const url = new URL(req.url);\n  const imageUrl = url.searchParams.get("url");\n  if (!imageUrl) return new Response("Missing url param", { status: 400 });\n  return new Response("Optimized image", { headers: { "Content-Type": "image/webp" } });\n};`, createdAt: daysAgo(5), projectId: uuid() },
];

const demoMarketplaceApps = [
  { id: uuid(), name: "WordPress", icon: "WP", category: "CMS", version: "6.5", description: "Popular CMS and blogging platform", installCount: 1250, color: "bg-blue-500" },
  { id: uuid(), name: "Ghost", icon: "Gh", category: "CMS", version: "5.8", description: "Modern publishing platform", installCount: 420, color: "bg-indigo-600" },
  { id: uuid(), name: "Strapi", icon: "St", category: "CMS", version: "4.2", description: "Headless CMS", installCount: 380, color: "bg-purple-600" },
  { id: uuid(), name: "n8n", icon: "n8", category: "Automation", version: "1.0", description: "Workflow automation", installCount: 780, color: "bg-red-600" },
  { id: uuid(), name: "Next.js", icon: "N", category: "Framework", version: "14.2", description: "React framework for production", installCount: 2100, color: "bg-black" },
  { id: uuid(), name: "Node.js", icon: "No", category: "Runtime", version: "20.0", description: "JavaScript runtime", installCount: 1800, color: "bg-green-600" },
  { id: uuid(), name: "Python", icon: "Py", category: "Runtime", version: "3.12", description: "Python runtime", installCount: 950, color: "bg-blue-600" },
  { id: uuid(), name: "PHP", icon: "PH", category: "Runtime", version: "8.3", description: "PHP runtime", installCount: 1100, color: "bg-indigo-600" },
  { id: uuid(), name: "MongoDB", icon: "Mo", category: "Database", version: "7.0", description: "NoSQL document database", installCount: 650, color: "bg-green-700" },
  { id: uuid(), name: "Redis", icon: "Re", category: "Database", version: "7.2", description: "In-memory data store", installCount: 890, color: "bg-red-500" },
  { id: uuid(), name: "PostgreSQL", icon: "PG", category: "Database", version: "16", description: "Advanced relational database", installCount: 1400, color: "bg-blue-700" },
  { id: uuid(), name: "MySQL", icon: "My", category: "Database", version: "8.0", description: "Popular relational database", installCount: 1200, color: "bg-orange-600" },
  { id: uuid(), name: "Django", icon: "Dj", category: "Framework", version: "5.0", description: "Python web framework", installCount: 340, color: "bg-green-800" },
  { id: uuid(), name: "Laravel", icon: "La", category: "Framework", version: "11.0", description: "PHP web framework", installCount: 420, color: "bg-red-700" },
  { id: uuid(), name: "Directus", icon: "Di", category: "CMS", version: "10.0", description: "Headless CMS", installCount: 190, color: "bg-teal-600" },
  { id: uuid(), name: "Plausible", icon: "Pl", category: "Analytics", version: "2.0", description: "Privacy-friendly analytics", installCount: 250, color: "bg-gray-700" },
  { id: uuid(), name: "Umami", icon: "Um", category: "Analytics", version: "2.5", description: "Lightweight analytics", installCount: 180, color: "bg-emerald-600" },
  { id: uuid(), name: "Minio", icon: "Mi", category: "Storage", version: "2024", description: "S3-compatible storage", installCount: 310, color: "bg-blue-500" },
  { id: uuid(), name: "Docker", icon: "Do", category: "Runtime", version: "25.0", description: "Container runtime", installCount: 1600, color: "bg-blue-600" },
  { id: uuid(), name: "Deno", icon: "De", category: "Runtime", version: "1.5", description: "Secure JS/TS runtime", installCount: 220, color: "bg-gray-800" },
];

const demoMarketplaceInstallations = [
  { id: uuid(), appId: "demo-n8n", appName: "n8n", status: "active", installedAt: daysAgo(20), version: "1.0", url: "n8n.cloudhost.app" },
  { id: uuid(), appId: "demo-ghost", appName: "Ghost", status: "active", installedAt: daysAgo(15), version: "5.8", url: "blog.cloudhost.app" },
  { id: uuid(), appId: "demo-redis", appName: "Redis", status: "inactive", installedAt: daysAgo(10), version: "7.2", url: "" },
];

const demoEmailAccounts = [
  { id: uuid(), email: "admin@acme.com", status: "active", quota: 2048, forwardTo: "admin.personal@gmail.com", createdAt: daysAgo(45) },
  { id: uuid(), email: "support@acme.com", status: "active", quota: 1024, forwardTo: "", createdAt: daysAgo(30) },
  { id: uuid(), email: "info@acme.com", status: "active", quota: 512, forwardTo: "info.forward@gmail.com", createdAt: daysAgo(20) },
];

const demoFtpAccounts = [
  { id: uuid(), username: "acme_main", directory: "/var/www/acme", permissions: "Read/Write", status: "active", createdAt: daysAgo(45) },
  { id: uuid(), username: "acme_backup", directory: "/backups/acme", permissions: "Read only", status: "active", createdAt: daysAgo(30) },
];

const demoHostingAccounts = [
  { id: uuid(), domain: "acme.com", package: "Business", phpVersion: "8.2", diskUsed: 45, diskLimit: 100, status: "active", createdAt: daysAgo(45) },
  { id: uuid(), domain: "shop.acme.com", package: "Starter", phpVersion: "8.1", diskUsed: 12, diskLimit: 50, status: "active", createdAt: daysAgo(30) },
  { id: uuid(), domain: "api.acme.com", package: "Pro", phpVersion: "8.3", diskUsed: 28, diskLimit: 200, status: "active", createdAt: daysAgo(15) },
];

const demoPreviewDeployments = [
  { id: uuid(), deploymentId: demoDeployments[0].id, branchName: "feature/new-hero", commitSha: "a1b2c3d4e5f6", commitMessage: "Redesign hero section", status: "ready", previewUrl: "acme-website-git-feature-new-hero.cloudhost.app", expiresAt: daysAgo(-7), createdAt: hoursAgo(6) },
  { id: uuid(), deploymentId: demoDeployments[0].id, branchName: "fix/mobile-nav", commitSha: "f6e5d4c3b2a1", commitMessage: "Fix mobile navigation", status: "building", previewUrl: "acme-website-git-fix-mobile-nav.cloudhost.app", expiresAt: daysAgo(-6), createdAt: hoursAgo(1) },
  { id: uuid(), deploymentId: demoDeployments[1].id, branchName: "feat/payment-methods", commitSha: "9a8b7c6d5e4f", commitMessage: "Add Apple Pay & Google Pay", status: "ready", previewUrl: "ecommerce-store-git-feat-payment.cloudhost.app", expiresAt: daysAgo(-5), createdAt: hoursAgo(3) },
];

const demoDockerDeployments = [
  { id: uuid(), name: "nginx-proxy", framework: "Dockerfile", status: "running", buildType: "dockerfile", url: "nginx-proxy.cloudhost.app", domain: "", port: 80, replicas: 2, resources: { cpu: "0.5", memory: "512M" }, logs: [{ time: hoursAgo(1), message: "Container healthy" }, { time: hoursAgo(2), message: "Request handled: GET /" }] },
  { id: uuid(), name: "python-worker", framework: "Python", status: "running", buildType: "buildpack", url: "python-worker.cloudhost.app", domain: "worker.acme.com", port: 8080, replicas: 1, resources: { cpu: "1.0", memory: "1G" }, logs: [{ time: hoursAgo(1), message: "Job completed successfully" }] },
  { id: uuid(), name: "redis-cache", framework: "Redis", status: "running", buildType: "image", url: "redis-cache.cloudhost.app", domain: "", port: 6379, replicas: 1, resources: { cpu: "0.5", memory: "256M" }, logs: [] },
];

const demoBuildpacks = [
  { framework: "node", name: "Node.js", language: "JavaScript", versions: ["18", "20", "22"] },
  { framework: "python", name: "Python", language: "Python", versions: ["3.10", "3.11", "3.12"] },
  { framework: "php", name: "PHP", language: "PHP", versions: ["8.1", "8.2", "8.3"] },
  { framework: "ruby", name: "Ruby", language: "Ruby", versions: ["3.2", "3.3"] },
  { framework: "go", name: "Go", language: "Go", versions: ["1.21", "1.22"] },
  { framework: "java", name: "Java", language: "Java", versions: ["17", "21"] },
  { framework: "rust", name: "Rust", language: "Rust", versions: ["1.75", "1.76"] },
  { framework: "dotnet", name: ".NET", language: "C#", versions: ["8.0"] },
  { framework: "deno", name: "Deno", language: "TypeScript", versions: ["1.40", "1.41"] },
  { framework: "static", name: "Static Site", language: "HTML/CSS", versions: ["1.0"] },
];

const demoDetectedBps = [
  { framework: "node", name: "Node.js", language: "JavaScript", confidence: 95 },
  { framework: "python", name: "Python", language: "Python", confidence: 72 },
  { framework: "php", name: "PHP", language: "PHP", confidence: 20 },
];

const demoCronJobs = [
  { id: uuid(), name: "Database Backup", command: "pg_dump -U admin acme_prod > /backups/db.sql", schedule: "0 3 * * *", scheduleLabel: "Daily at 3:00 AM", active: true, createdAt: daysAgo(30) },
  { id: uuid(), name: "Clear Cache", command: "redis-cli FLUSHALL", schedule: "*/30 * * * *", scheduleLabel: "Every 30 minutes", active: true, createdAt: daysAgo(20) },
  { id: uuid(), name: "Send Reports", command: "node /scripts/generate-report.js", schedule: "0 8 * * 1", scheduleLabel: "Every Monday at 8:00 AM", active: false, createdAt: daysAgo(15) },
  { id: uuid(), name: "Health Check", command: "curl -f https://acme.com/health", schedule: "*/5 * * * *", scheduleLabel: "Every 5 minutes", active: true, createdAt: daysAgo(10) },
];

const demoPhpSettings = {
  version: "8.2",
  memoryLimit: "256M",
  uploadMaxFilesize: "64M",
  maxExecutionTime: 120,
  extensions: [
    { name: "curl", enabled: true }, { name: "gd", enabled: true }, { name: "mbstring", enabled: true }, { name: "pdo", enabled: true }, { name: "mysql", enabled: true }, { name: "pgsql", enabled: true }, { name: "redis", enabled: true }, { name: "xml", enabled: true }, { name: "zip", enabled: true }, { name: "intl", enabled: true }, { name: "bcmath", enabled: true }, { name: "exif", enabled: true }, { name: "imagick", enabled: false }, { name: "sodium", enabled: false }, { name: "opcache", enabled: true }, { name: "xdebug", enabled: false },
  ],
  availableVersions: ["8.1", "8.2", "8.3"],
};

const demoWebhooks = [
  { id: uuid(), databaseId: "db-1", name: "User Created", url: "https://api.acme.com/webhooks/user-created", event: "INSERT", table: "users", active: true, createdAt: daysAgo(20) },
  { id: uuid(), databaseId: "db-1", name: "Order Paid", url: "https://api.acme.com/webhooks/order-paid", event: "UPDATE", table: "orders", active: true, createdAt: daysAgo(15) },
];

const demoWebhookLogs = [
  { id: uuid(), status: "success", statusCode: 200, responseTime: 120, createdAt: hoursAgo(1) },
  { id: uuid(), status: "success", statusCode: 200, responseTime: 95, createdAt: hoursAgo(2) },
  { id: uuid(), status: "failed", statusCode: 500, responseTime: 3000, createdAt: hoursAgo(5) },
];

const demoRlsPolicies = [
  { id: uuid(), name: "Users can read own data", table: "users", type: "SELECT", using: "auth.uid() = id", active: true, createdAt: daysAgo(30) },
  { id: uuid(), name: "Users can update own profile", table: "profiles", type: "UPDATE", using: "auth.uid() = user_id", active: true, createdAt: daysAgo(30) },
  { id: uuid(), name: "Admins can read all", table: "orders", type: "SELECT", using: "auth.role() = 'admin'", active: false, createdAt: daysAgo(15) },
];

const demoRealtimeSubscriptions = [
  { id: uuid(), name: "Live Orders", table: "orders", event: "INSERT, UPDATE", filter: "", active: true, createdAt: daysAgo(20), messagesPerMin: 12 },
  { id: uuid(), name: "User Activity", table: "user_activity", event: "INSERT", filter: "type='login'", active: true, createdAt: daysAgo(15), messagesPerMin: 5 },
  { id: uuid(), name: "System Alerts", table: "system_events", event: "INSERT", filter: "severity='critical'", active: false, createdAt: daysAgo(10), messagesPerMin: 0 },
];

const demoExtensions = [
  { id: uuid(), name: "pg_stat_statements", version: "1.10", description: "Track execution statistics of SQL statements", installed: true, databaseId: "db-1" },
  { id: uuid(), name: "pg_cron", version: "1.6", description: "Job scheduler for PostgreSQL", installed: true, databaseId: "db-1" },
  { id: uuid(), name: "pg_graphql", version: "1.5", description: "GraphQL support for PostgreSQL", installed: false, databaseId: "db-1" },
  { id: uuid(), name: "pg_net", version: "0.5", description: "Async HTTP requests from SQL", installed: true, databaseId: "db-1" },
  { id: uuid(), name: "uuid-ossp", version: "1.1", description: "UUID generation functions", installed: true, databaseId: "db-1" },
  { id: uuid(), name: "postgis", version: "3.4", description: "Geographic information system", installed: false, databaseId: "db-1" },
  { id: uuid(), name: "pgvector", version: "0.6", description: "Vector similarity search", installed: false, databaseId: "db-1" },
  { id: uuid(), name: "pgmq", version: "1.0", description: "Message queue extension", installed: false, databaseId: "db-1" },
];

const demoAvailableExtensions = [
  { id: uuid(), name: "pg_stat_statements", version: "1.10", description: "Track execution statistics of SQL statements" },
  { id: uuid(), name: "pg_cron", version: "1.6", description: "Job scheduler for PostgreSQL" },
  { id: uuid(), name: "pg_graphql", version: "1.5", description: "GraphQL support for PostgreSQL" },
  { id: uuid(), name: "pg_net", version: "0.5", description: "Async HTTP requests from SQL" },
  { id: uuid(), name: "uuid-ossp", version: "1.1", description: "UUID generation functions" },
  { id: uuid(), name: "postgis", version: "3.4", description: "Geographic information system" },
  { id: uuid(), name: "pgvector", version: "0.6", description: "Vector similarity search" },
  { id: uuid(), name: "pgmq", version: "1.0", description: "Message queue extension" },
  { id: uuid(), name: "pg_partman", version: "5.1", description: "Partition management" },
  { id: uuid(), name: "pg_repack", version: "1.5", description: "Table reorganization" },
  { id: uuid(), name: "pgaudit", version: "16.0", description: "Database audit logging" },
  { id: uuid(), name: "hypopg", version: "1.4", description: "Hypothetical indexes" },
];

const demoAuthProviders = [
  { id: uuid(), name: "Google", clientId: "123456789-xxxx.apps.googleusercontent.com", clientSecret: "G-***", redirectUrl: "https://cloudhost.app/auth/callback/google", enabled: true },
  { id: uuid(), name: "GitHub", clientId: "Iv***", clientSecret: "***", redirectUrl: "https://cloudhost.app/auth/callback/github", enabled: true },
  { id: uuid(), name: "Twitter", clientId: "", clientSecret: "", redirectUrl: "https://cloudhost.app/auth/callback/twitter", enabled: false },
];

const demoProvidersInfo = [
  { id: "google", name: "Google", icon: "G", color: "bg-red-500", docs: "https://console.cloud.google.com/apis/credentials" },
  { id: "github", name: "GitHub", icon: "GH", color: "bg-gray-800", docs: "https://github.com/settings/developers" },
  { id: "twitter", name: "Twitter/X", icon: "X", color: "bg-blue-400", docs: "https://developer.twitter.com/en/portal/projects" },
  { id: "facebook", name: "Facebook", icon: "F", color: "bg-blue-600", docs: "https://developers.facebook.com/apps" },
  { id: "microsoft", name: "Microsoft", icon: "M", color: "bg-blue-700", docs: "https://portal.azure.com/" },
  { id: "apple", name: "Apple", icon: "A", color: "bg-black", docs: "https://developer.apple.com/account/" },
];

const demoEdgeFunctionLogs = [
  { id: uuid(), type: "info", message: "Function invoked successfully", createdAt: hoursAgo(1) },
  { id: uuid(), type: "info", message: "Request processed in 45ms", createdAt: hoursAgo(1) },
  { id: uuid(), type: "warn", message: "Memory usage approaching limit (78%)", createdAt: hoursAgo(2) },
  { id: uuid(), type: "info", message: "Function deployed version 2.1", createdAt: hoursAgo(6) },
];

const demoSqlResults = {
  columns: ["id", "name", "email", "created_at"],
  rows: [
    [1, "Alice Johnson", "alice@example.com", "2024-01-15"],
    [2, "Bob Smith", "bob@example.com", "2024-02-20"],
    [3, "Charlie Brown", "charlie@example.com", "2024-03-10"],
    [4, "Diana Prince", "diana@example.com", "2024-04-05"],
  ],
  rowCount: 4,
  executionTime: 2.3,
};

const demoSqlTemplates = [
  { name: "List all tables", sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" },
  { name: "User count", sql: "SELECT COUNT(*) FROM users;" },
  { name: "Active users", sql: "SELECT * FROM users WHERE last_login > NOW() - INTERVAL '30 days';" },
  { name: "Database size", sql: "SELECT pg_size_pretty(pg_database_size(current_database()));" },
];

interface Handler { status: number; data: any; }

function findHandler(url: string, method: string, body?: any): Handler | null {
  const path = new URL(url).pathname;
  const fullPath = `${method} ${path}`;

  const handlers: Record<string, () => Handler> = {
    // Projects
    "GET /api/projects": () => ({ status: 200, data: { projects: demoProjects } }),
    "POST /api/projects": () => ({ status: 201, data: { project: { id: uuid(), ...body, createdAt: new Date().toISOString() } } }),
    // Deployments
    "GET /api/deployments": () => ({ status: 200, data: { deployments: demoDeployments } }),
    "POST /api/deployments": () => ({ status: 201, data: { deployment: { id: uuid(), ...body, status: "running", url: `${body.name}.cloudhost.app`, createdAt: new Date().toISOString() } } }),
    // Databases
    "POST /api/databases/provision": () => ({ status: 201, data: { database: { id: uuid(), ...body, status: "running", host: "db.cloudhost.internal", port: body.type === "postgresql" ? 5432 : body.type === "mysql" ? 3306 : 6379, databaseName: body.name, username: `${body.name}_user`, password: uuid().substring(0, 20), createdAt: new Date().toISOString(), size: "128 MB" } } }),
    // Domains
    "POST /api/domains": () => ({ status: 201, data: { domain: { id: uuid(), name: body.name, verified: false, dnsRecords: [] } } }),
    // Email
    "POST /api/email": () => ({ status: 201, data: { account: { id: uuid(), ...body, status: "active", createdAt: new Date().toISOString() } } }),
    // Edge Functions
    "GET /api/edge-functions/project/00000000-0000-0000-0000-000000000000": () => ({ status: 200, data: { functions: demoEdgeFunctions } }),
    "POST /api/edge-functions": () => ({ status: 201, data: { function: { id: uuid(), ...body, status: "inactive", url: `https://edge.cloudhost.app/${body.name}`, createdAt: new Date().toISOString() } } }),
    // WordPress
    "POST /api/wordpress/provision": () => ({ status: 201, data: { site: { id: uuid(), ...body, status: "running", url: `https://${body.domain}`, adminPassword: uuid().substring(0, 12), createdAt: new Date().toISOString() } } }),
    // Workflows
    "GET /api/workflows": () => ({ status: 200, data: { workflows: demoWorkflows } }),
    "POST /api/workflows": () => ({ status: 201, data: { workflow: { id: uuid(), ...body, active: false, createdAt: new Date().toISOString() } } }),
    // Docker
    "GET /api/docker/deployments": () => ({ status: 200, data: { deployments: demoDockerDeployments } }),
    "GET /api/docker/buildpacks": () => ({ status: 200, data: { buildpacks: demoBuildpacks } }),
    "POST /api/docker/deploy": () => ({ status: 201, data: { deployment: { id: uuid(), ...body, status: "running", url: `${body.name}.cloudhost.app`, createdAt: new Date().toISOString() } } }),
    "POST /api/docker/detect": () => ({ status: 200, data: { detected: demoDetectedBps } }),
    // Marketplace
    "GET /api/marketplace/apps": () => ({ status: 200, data: { apps: demoMarketplaceApps } }),
    "GET /api/marketplace/installations": () => ({ status: 200, data: { installations: demoMarketplaceInstallations } }),
    "POST /api/marketplace/install": () => ({ status: 201, data: { installation: { id: uuid(), ...body, status: "active", installedAt: new Date().toISOString(), url: `${body.name}.cloudhost.app` } } }),
    // Hosting
    "GET /api/hosting/account/00000000-0000-0000-0000-000000000000": () => ({ status: 200, data: { account: demoHostingAccounts[0] } }),
    "GET /api/hosting/account/00000000-0000-0000-0000-000000000000/cron": () => ({ status: 200, data: { cronJobs: demoCronJobs } }),
    "POST /api/hosting/cron": () => ({ status: 201, data: { cronJob: { id: uuid(), ...body, active: true, createdAt: new Date().toISOString() } } }),
    // Preview
    "GET /api/preview-deployments": () => ({ status: 200, data: { previews: demoPreviewDeployments.filter(p => p.deploymentId === findIdInPath(url, "deployment")) } }),
    "POST /api/preview-deployments": () => ({ status: 201, data: { preview: { id: uuid(), ...body, status: "building", previewUrl: `${body.branchName}.preview.cloudhost.app`, expiresAt: daysAgo(-7), createdAt: new Date().toISOString() } } }),
    // Auth
    "GET /api/auth-providers/organization/00000000-0000-0000-0000-000000000000": () => ({ status: 200, data: { authProviders: demoAuthProviders } }),
    "GET /api/auth-providers/providers-info": () => ({ status: 200, data: { providersInfo: demoProvidersInfo } }),
    "POST /api/auth-providers/configure": () => ({ status: 200, data: { success: true } }),
    // Edge function actions
    "POST /api/edge-functions/:id/deploy": () => ({ status: 200, data: { success: true, status: "active" } }),
    "POST /api/edge-functions/:id/deactivate": () => ({ status: 200, data: { success: true, status: "inactive" } }),
    // Workflow actions
    "POST /api/workflows/:id/activate": () => ({ status: 200, data: { success: true, active: true } }),
    "POST /api/workflows/:id/deactivate": () => ({ status: 200, data: { success: true, active: false } }),
    // Logs
    "GET /api/edge-functions/:id/logs": () => ({ status: 200, data: { logs: demoEdgeFunctionLogs } }),
    // SQL
    "POST /api/sql/execute": () => ({ status: 200, data: demoSqlResults }),
    // PHP
    "GET /api/php-settings": () => ({ status: 200, data: demoSqlResults }), // fallback, not critical
    // Hosting account by ID
  };

  const exactMatch = handlers[fullPath];
  if (exactMatch) return exactMatch();

  // Pattern matching for dynamic URLs
  if (path.startsWith("/api/deployments/") && method === "GET") {
    const id = path.split("/")[3];
    if (id && id !== "preview" && id !== "universal") {
      const dep = demoDeployments.find(d => d.id === id);
      if (dep) return { status: 200, data: { deployment: dep } };
      return { status: 200, data: { deployment: demoDeployments[0] } };
    }
  }
  if (path.startsWith("/api/deployments/") && path.endsWith("/deploy") && method === "POST") {
    return { status: 200, data: { success: true, message: "Deployment triggered" } };
  }
  if (path.match(/\/api\/deployments\/[^/]+\/deploy$/)) {
    return { status: 200, data: { success: true, message: "Deployment triggered" } };
  }
  if (path.startsWith("/api/domains") && method === "GET") {
    return { status: 200, data: { domains: demoDomains } };
  }
  if (path.startsWith("/api/email") && method === "GET") {
    return { status: 200, data: { accounts: demoEmailAccounts } };
  }
  if (path.startsWith("/api/fetch/email") && method === "GET") {
    return { status: 200, data: { accounts: demoEmailAccounts } };
  }
  if (path.startsWith("/api/fetch/ftp") && method === "GET") {
    return { status: 200, data: { ftpAccounts: demoFtpAccounts } };
  }
  if (path.startsWith("/api/fetch/domains") && method === "GET") {
    return { status: 200, data: { domains: demoDomains } };
  }
  if (path.startsWith("/api/fetch/wordpress") && method === "GET") {
    return { status: 200, data: { sites: demoWordPress } };
  }
  if (path.match(/\/api\/preview-deployments\/deployment\//)) {
    return { status: 200, data: { previews: demoPreviewDeployments } };
  }
  if (path.match(/\/api\/preview-deployments\/[^/]+\/rebuild/)) {
    return { status: 200, data: { success: true } };
  }
  if (path.match(/\/api\/docker\/deployments\/[^/]+\/restart/)) {
    return { status: 200, data: { success: true, message: "Container restarted" } };
  }
  if (path.match(/\/api\/hostinger-services\/(\w+)/)) {
    const service = path.match(/\/hostinger-services\/(\w+)/)?.[1];
    return handleHostingerService(service!, method, path, body);
  }
  if (path.match(/\/api\/business-tools\/(\w+)/)) {
    const tool = path.match(/\/business-tools\/(\w+)/)?.[1];
    return handleBusinessTool(tool!, method, url, body);
  }
  if (path.match(/\/api\/cloudflare\//)) {
    return handleCloudflareService(path, method, body);
  }
  if (path.match(/\/api\/extensions\//)) {
    return handleExtensions(path, method, body);
  }
  if (path.match(/\/api\/webhooks\//)) {
    return handleWebhooks(path, method, body);
  }
  if (path.match(/\/api\/rls\//)) {
    return handleRLS(path, method, body);
  }
  if (path.match(/\/api\/realtime\//)) {
    return handleRealtime(path, method, body);
  }
  if (path.match(/\/api\/workflows\/[^/]+\/toggle$/)) {
    return { status: 200, data: { success: true, active: body?.active ?? true } };
  }
  if (path.match(/\/api\/workflows\/[^/]+$/)) {
    return { status: 200, data: { workflow: demoWorkflows[0] } };
  }
  if (path.startsWith("/api/wordpress/") && method === "GET") {
    return { status: 200, data: { sites: demoWordPress } };
  }
  if (path.match(/\/api\/edge-functions\/[^/]+$/)) {
    return { status: 200, data: { success: true } };
  }

  // Databases list
  if (path === "/api/databases" && method === "GET") {
    return { status: 200, data: { databases: demoDatabases } };
  }
  if (path.match(/\/api\/databases\/(?!provision)[^/]+$/) && method === "GET") {
    const id = path.split("/")[3];
    const db = demoDatabases.find(d => d.id === id);
    return { status: 200, data: { database: db || demoDatabases[0] } };
  }
  // Hosting accounts
  if (path === "/api/hosting/accounts" && method === "GET") {
    return { status: 200, data: { accounts: demoHostingAccounts } };
  }
  if (path === "/api/ftp" && method === "GET") {
    return { status: 200, data: { ftpAccounts: demoFtpAccounts } };
  }
  if (path === "/api/cron" && method === "GET") {
    return { status: 200, data: { cronJobs: demoCronJobs } };
  }
  // WordPress detail
  if (path.match(/\/api\/wordpress\/(?!provision)[^/]+$/) && method === "GET") {
    const id = path.split("/")[3];
    const wp = demoWordPress.find(w => w.id === id);
    return { status: 200, data: { site: wp || demoWordPress[0] } };
  }
  // WordPress actions (restart, stop, start, etc.)
  if (path.match(/\/api\/wordpress\/([^/]+)\/(\w+)/) && method === "POST") {
    return { status: 200, data: { success: true, message: "Action completed" } };
  }
  // PHP settings
  if (path === "/api/php-settings" && method === "GET") {
    return { status: 200, data: { settings: demoPhpSettings } };
  }
  if (path === "/api/php-settings" && method === "PUT") {
    return { status: 200, data: { success: true, settings: { ...demoPhpSettings, ...body } } };
  }
  // File manager
  if (path.startsWith("/api/files") && method === "GET") {
    return { status: 200, data: { files: [
      { name: "index.html", type: "file", size: "2.4 KB", modified: hoursAgo(2), permissions: "644" },
      { name: "style.css", type: "file", size: "12.1 KB", modified: hoursAgo(3), permissions: "644" },
      { name: "app.js", type: "file", size: "45.2 KB", modified: hoursAgo(1), permissions: "644" },
      { name: "images", type: "directory", size: "-", modified: hoursAgo(5), permissions: "755" },
      { name: "assets", type: "directory", size: "-", modified: daysAgo(1), permissions: "755" },
      { name: "node_modules", type: "directory", size: "-", modified: daysAgo(7), permissions: "755" },
    ], currentPath: path.replace("/api/files", "") || "/" } };
  }
  if (path.startsWith("/api/files") && method === "POST") {
    if (body?.action === "create_folder") return { status: 201, data: { success: true, name: body.name } };
    if (body?.action === "create_file") return { status: 201, data: { success: true, name: body.name } };
    if (body?.action === "delete") return { status: 200, data: { success: true } };
    if (body?.action === "rename") return { status: 200, data: { success: true } };
    if (body?.action === "chmod") return { status: 200, data: { success: true } };
    return { status: 200, data: { success: true } };
  }
  // Business tools
  if (path === "/api/business-name-generator" && method === "GET") {
    return { status: 200, data: { suggestions: ["NovaTech Solutions", "Pinnacle Digital", "Vertex Systems", "Catalyst Media", "Apex Innovations", "Meridian Group", "Stratus Cloud Services", "Quantum Web", "Fusion Interactive", "Orion Digital Agency"] } };
  }
  if (path.match(/\/api\/relate/) && method === "GET") {
    return { status: 200, data: { 
      campaigns: [
        { id: uuid(), name: "Summer Sale 2024", status: "active", sent: 12500, opens: 3800, clicks: 1200, conversions: 245, revenue: 48000 },
        { id: uuid(), name: "Product Launch", status: "draft", sent: 0, opens: 0, clicks: 0, conversions: 0, revenue: 0 },
        { id: uuid(), name: "Newsletter June", status: "sent", sent: 9800, opens: 3200, clicks: 890, conversions: 120, revenue: 15000 },
      ]
    } };
  }
  if (path.match(/\/api\/business-cards/) && method === "GET") {
    return { status: 200, data: { 
      cards: [
        { id: uuid(), name: "John Doe", title: "CEO", company: "Acme Corp", email: "john@acme.com", phone: "+1-555-0100", design: "Modern Blue" },
        { id: uuid(), name: "Jane Smith", title: "CTO", company: "Acme Corp", email: "jane@acme.com", phone: "+1-555-0101", design: "Dark Pro" },
      ]
    } };
  }
  if (path.match(/\/api\/affiliates/) && method === "GET") {
    return { status: 200, data: { 
      affiliates: [
        { id: uuid(), name: "TechBlogger", email: "tech@blogger.com", referrals: 45, commission: 2250, status: "active", joinedAt: daysAgo(60) },
        { id: uuid(), name: "DevStreamer", email: "dev@streamer.com", referrals: 28, commission: 1400, status: "active", joinedAt: daysAgo(45) },
        { id: uuid(), name: "CloudGuru", email: "cloud@guru.com", referrals: 12, commission: 600, status: "pending", joinedAt: daysAgo(10) },
      ]
    } };
  }
  if (path.match(/\/api\/ssl-catalog/) && method === "GET") {
    return { status: 200, data: { 
      certificates: [
        { id: uuid(), name: "Let's Encrypt", price: "Free", type: "DV", validity: "90 days", features: ["Auto-renewal", "Single domain"], wildcard: false, ev: false },
        { id: uuid(), name: "CloudHost Basic", price: "$9.99/yr", type: "DV", validity: "1 year", features: ["Auto-renewal", "Single domain", "30-day money back"], wildcard: false, ev: false },
        { id: uuid(), name: "CloudHost Pro", price: "$49.99/yr", type: "OV", validity: "1 year", features: ["Auto-renewal", "Wildcard support", "Company validation", "Priority support"], wildcard: true, ev: false },
        { id: uuid(), name: "CloudHost EV", price: "$199.99/yr", type: "EV", validity: "1-2 years", features: ["Extended Validation", "Green address bar", "Wildcard support", "Highest trust level"], wildcard: false, ev: true },
      ]
    } };
  }
  // Marketing suite
  if (path.startsWith("/api/marketing-suite/") && method === "GET") {
    const area = path.replace("/api/marketing-suite/", "").split("/")[0];
    const marketingData: Record<string, any> = {
      "social": { posts: [
        { id: uuid(), platform: "Twitter", content: "Excited to launch our new cloud platform! 🚀", scheduled: hoursAgo(4), status: "published", engagement: 234 },
        { id: uuid(), platform: "LinkedIn", content: "How cloud computing is transforming small businesses", scheduled: daysAgo(1), status: "published", engagement: 89 },
        { id: uuid(), platform: "Instagram", content: "Behind the scenes at CloudHost HQ", scheduled: daysAgo(2), status: "draft", engagement: 0 },
        { id: uuid(), platform: "Facebook", content: "Customer spotlight: Acme Corp's journey to the cloud", scheduled: hoursAgo(12), status: "scheduled", engagement: 0 },
      ] },
      "seo": { keywords: [
        { word: "cloud hosting", position: 3, volume: 24500, traffic: 3200, change: 2 },
        { word: "web hosting", position: 7, volume: 18000, traffic: 2100, change: -1 },
        { word: "vps server", position: 2, volume: 12000, traffic: 4800, change: 1 },
        { word: "next.js hosting", position: 1, volume: 8400, traffic: 6200, change: 3 },
      ] },
      "analytics": { visitors: 45200, pageViews: 128000, avgSession: 245, bounceRate: 32.4, sources: [
        { name: "Organic Search", percentage: 42 },
        { name: "Direct", percentage: 28 },
        { name: "Referral", percentage: 18 },
        { name: "Social", percentage: 12 },
      ] },
    };
    return { status: 200, data: marketingData[area] || { success: true } };
  }
  // Email send
  if (path === "/api/email/send" && method === "POST") {
    return { status: 200, data: { success: true, message: "Email sent successfully" } };
  }
  // Sidebar routes without page files (provide fallback data)
  if (path === "/api/api-keys" && method === "GET") {
    return { status: 200, data: { keys: [{ id: uuid(), name: "Production API Key", key: "ch_prod_***", created: daysAgo(30), lastUsed: hoursAgo(2) }] } };
  }
  if (path === "/api/backups" && method === "GET") {
    return { status: 200, data: { backups: [
      { id: uuid(), name: "Daily Backup", type: "Automated", size: "2.4 GB", status: "completed", createdAt: hoursAgo(6) },
      { id: uuid(), name: "Manual Backup", type: "Manual", size: "2.4 GB", status: "completed", createdAt: daysAgo(1) },
    ] } };
  }
  // Generic ID pattern for resource deletion
  if (method === "DELETE" && path.includes("/api/")) {
    return { status: 200, data: { success: true } };
  }

  // Generic POST toggle
  if (method === "POST" && path.includes("/toggle")) {
    return { status: 200, data: { success: true } };
  }

  return null;
}

function findIdInPath(url: string, segment: string): string {
  try {
    const parts = new URL(url).pathname.split("/");
    const idx = parts.indexOf(segment);
    return idx >= 0 && idx + 1 < parts.length ? parts[idx + 1] : "";
  } catch { return ""; }
}

function handleHostingerService(service: string, method: string, path: string, body?: any): Handler {
  const services: Record<string, any> = {
    "woocommerce": [{ id: uuid(), storeName: "Acme Gear", domain: "shop.acme.com", status: "active", products: 45, orders: 128, revenue: 12800, currency: "USD", createdAt: daysAgo(30) }],
    "ai-agents": [{ id: uuid(), name: "Hermes", status: "running", port: 3001, apiEndpoint: "https://hermes.cloudhost.ai", messages: 2847, uptime: 99.8, createdAt: daysAgo(45) }, { id: uuid(), name: "OpenClaw", status: "running", port: 3002, apiEndpoint: "https://openclaw.cloudhost.ai", messages: 1523, uptime: 99.2, createdAt: daysAgo(30) }],
    "cloud-hosting": [{ id: uuid(), name: "acme-web", plan: "Business", cpu: 4, ram: 8, storage: 200, bandwidth: 5000, location: "New York", os: "Ubuntu 22.04", status: "running", managed: true, autoScale: false, ip: "203.0.113.42", createdAt: daysAgo(45) }, { id: uuid(), name: "acme-db", plan: "Pro", cpu: 8, ram: 16, storage: 500, bandwidth: 10000, location: "Frankfurt", os: "Ubuntu 22.04", status: "running", managed: true, autoScale: true, ip: "203.0.113.84", createdAt: daysAgo(30) }],
    "templates": [{ id: uuid(), name: "Business Pro", category: "business", preview: "https://placehold.co/400x300/eee/999?text=Business+Pro", price: "$49", responsive: true, seoOptimized: true }],
    "status": { overall: "operational", services: [{ name: "Web Hosting", status: "operational" }, { name: "VPS", status: "operational" }, { name: "Domains", status: "operational" }, { name: "Email", status: "degraded" }, { name: "Databases", status: "operational" }, { name: "CDN", status: "operational" }], incidents: [{ id: uuid(), title: "Email delivery delays", status: "investigating", createdAt: hoursAgo(2) }] },
    "roadmap": [{ id: uuid(), title: "IPv6 Support for all VPS", description: "Enable IPv6 on all cloud servers", status: "in_progress", votes: 128, category: "feature", createdAt: daysAgo(14) }, { id: uuid(), title: "Docker Compose Support", description: "Deploy multi-container apps", status: "planned", votes: 89, category: "feature", createdAt: daysAgo(20) }],
    "reviews": [{ id: uuid(), author: "Sarah K.", rating: 5, text: "Excellent hosting platform! Very fast and reliable.", service: "Cloud Hosting", createdAt: daysAgo(3) }, { id: uuid(), author: "Mike R.", rating: 4, text: "Great features but could use better documentation.", service: "VPS", createdAt: daysAgo(7) }],
    "print-on-demand": [{ id: uuid(), productName: "Summer T-Shirt", status: "active", sales: 234, revenue: 4680, createdAt: daysAgo(20) }],
    "newsletter": [{ id: uuid(), name: "Weekly Updates", subject: "New features this week", status: "draft", recipients: 1280, openRate: 34, clickRate: 12, createdAt: daysAgo(7) }],
    "minecraft": [{ id: uuid(), name: "Survival World", version: "1.20", status: "running", players: 12, maxPlayers: 20, port: 25565, ip: "mc.cloudhost.app", createdAt: daysAgo(60) }],
    "link-in-bio": [{ id: uuid(), title: "@acme", username: "acme", status: "published", clicks: 340, createdAt: daysAgo(15) }],
    "horizons": [{ id: uuid(), name: "Growth Plan 2024", status: "draft", industry: "Tech", goals: ["Increase traffic", "Boost sales"], createdAt: daysAgo(10) }],
    "google-workspace": [{ id: uuid(), email: "admin@acme.com", status: "active", plan: "Business Starter", storage: 30, users: 5, createdAt: daysAgo(45) }],
    "agency-directory": [{ id: uuid(), name: "Acme Digital Agency", website: "https://acme.agency", services: ["Web Design", "SEO", "Marketing"], status: "active", verified: true, createdAt: daysAgo(20) }],
    "agency-hosting": [{ id: uuid(), name: "Acme Agency", plan: "Agency Pro", clients: 12, storageUsed: 145, storageLimit: 500, websites: 24, status: "active", createdAt: daysAgo(60) }],
    "educational-partnerships": [{ id: uuid(), institution: "Tech University", program: "Cloud Computing Course", participants: 85, status: "active", createdAt: daysAgo(90) }],
    "ecommerce-builder": [{ id: uuid(), storeName: "Acme Store", domain: "store.acme.com", status: "published", products: 56, orders: 234, revenue: 28900, createdAt: daysAgo(25) }],
  };

  if (method === "GET") {
    const data = services[service];
    if (data) {
      if (typeof data === "object" && "overall" in data) return { status: 200, data };
      return { status: 200, data: { [service]: data } };
    }
  }

  if (method === "POST" && !pathIncludesAction(path)) {
    return { status: 201, data: { [service]: { id: uuid(), ...body, status: "active", createdAt: new Date().toISOString() } } };
  }

  return { status: 200, data: { success: true } };
}

function pathIncludesAction(p: string) {
  return p.includes("/sync") || p.includes("/generate") || p.includes("/send") || p.includes("/publish") || p.includes("/vote") || p.includes("/verify") || p.includes("/seed");
}

function handleBusinessTool(tool: string, method: string, url: string, body?: any): Handler {
  const tools: Record<string, any> = {
    "website-security": { sites: [{ id: uuid(), domain: "acme.com", lastScan: hoursAgo(2), status: "safe", findings: [] }, { id: uuid(), domain: "shop.acme.com", lastScan: hoursAgo(6), status: "warning", findings: [{ severity: "medium", title: "Missing security headers", description: "X-XSS-Protection header not set" }] }], scans: [{ id: uuid(), siteId: "1", status: "completed", findings: 2, completedAt: hoursAgo(2) }] },
    "vpn": { plans: [{ name: "Basic", price: 4.99, devices: 1, servers: 50, bandwidth: "10 GB", support: "Email" }, { name: "Pro", price: 9.99, devices: 5, servers: "All 200+", bandwidth: "Unlimited", support: "Priority" }, { name: "Business", price: 19.99, devices: "Unlimited", servers: "All 200+", bandwidth: "Unlimited", support: "24/7 Priority" }], active: { connected: false, ip: "203.0.113.50", server: "US East", protocol: "WireGuard", config: "[Interface]\nAddress = 10.0.0.2/32\nPrivateKey = ***************************\nDNS = 1.1.1.1\n\n[Peer]\nPublicKey = ***************************\nEndpoint = us-east.cloudhost.app:51820\nAllowedIPs = 0.0.0.0/0" } },
    "tickets": { tickets: [{ id: uuid(), subject: "Cannot deploy to production", description: "Getting 503 errors on deploy", category: "Technical", priority: "high", status: "open", messages: [{ author: "You", content: "Hi, I'm getting 503 errors when deploying to production. Can you help?", createdAt: hoursAgo(3) }, { author: "Support", content: "Hi there! Let me look into this. Could you share the deployment logs?", createdAt: hoursAgo(2) }], createdAt: hoursAgo(3) }, { id: uuid(), subject: "SSL certificate renewal", description: "Auto-renewal failed for acme.com", category: "Billing", priority: "medium", status: "closed", messages: [{ author: "You", content: "My SSL cert for acme.com expired yesterday. Can you help renew?", createdAt: daysAgo(5) }, { author: "Support", content: "We've renewed the certificate. It should be active within 30 minutes.", createdAt: daysAgo(4) }], createdAt: daysAgo(5) }] },
    "migrations": { migrations: [{ id: uuid(), domain: "oldsite.com", sourceType: "cpanel", status: "completed", progress: 100, filesMigrated: 1245, dbMigrated: true, emailsMigrated: false, preserveSettings: true, createdAt: daysAgo(7) }, { id: uuid(), domain: "another-site.com", sourceType: "website", status: "in_progress", progress: 60, filesMigrated: 842, dbMigrated: false, emailsMigrated: false, preserveSettings: true, createdAt: daysAgo(1) }] },
    "starter-kit": { kits: [{ id: uuid(), name: "Acme LLC", tier: "Pro", status: "in_progress", steps: [{ name: "LLC Formation", completed: true }, { name: "EIN Registration", completed: true }, { name: "Operating Agreement", completed: false }, { name: "Bank Account", completed: false }], createdAt: daysAgo(3) }] },
    "site-maker": { sites: [{ id: uuid(), name: "Acme Landing", template: "Business Pro", domain: "acme-landing.cloudhost.app", status: "published", industry: "Technology", createdAt: daysAgo(10) }] },
  };

  if (method === "GET") {
    const data = tools[tool];
    if (data) return { status: 200, data };
  }

  if (method === "POST") {
    return { status: 201, data: { success: true, id: uuid() } };
  }

  return { status: 200, data: { success: true } };
}

function handleCloudflareService(path: string, method: string, body?: any): Handler {
  if (path.includes("/workers")) {
    return { status: 200, data: { workers: [{ id: uuid(), name: "api-worker", status: "active", url: "https://api-worker.cloudflare.workers.dev", modified: hoursAgo(4) }, { id: uuid(), name: "auth-worker", status: "active", url: "https://auth-worker.cloudflare.workers.dev", modified: hoursAgo(12) }] } };
  }
  if (path.includes("/containers")) {
    return { status: 200, data: { containers: [{ id: uuid(), name: "web-app", image: "nginx:latest", status: "running", port: 80, cpu: "0.5 vCPU", memory: "512 MB", createdAt: daysAgo(10) }] } };
  }
  if (path.includes("/r2")) {
    return { status: 200, data: { buckets: [{ id: uuid(), name: "acme-assets", objects: 450, size: "2.3 GB", public: true, region: "US East" }, { id: uuid(), name: "acme-backups", objects: 89, size: "45 GB", public: false, region: "US East" }] } };
  }
  if (path.includes("/d1")) {
    return { status: 200, data: { databases: [{ id: uuid(), name: "user-data", version: "1.0", rows: 12500, size: "45 MB" }] } };
  }
  if (path.includes("/kv")) {
    return { status: 200, data: { namespaces: [{ id: uuid(), name: "session-store", keys: 2840, size: "12 MB" }] } };
  }
  if (path.includes("/pages")) {
    return { status: 200, data: { projects: [{ id: uuid(), name: "docs-site", url: "https://docs.pages.dev", status: "active", lastDeploy: hoursAgo(8) }] } };
  }
  if (path.includes("/durable-objects")) {
    return { status: 200, data: { objects: [{ id: uuid(), name: "chat-rooms", classes: 3, requests: 12500 }] } };
  }
  if (path.includes("/email")) {
    return { status: 200, data: { addresses: [{ id: uuid(), email: "forward@cloudhost.app", destination: "user@gmail.com", status: "active" }] } };
  }
  if (path.includes("/sandboxes")) {
    return { status: 200, data: { sandboxes: [{ id: uuid(), name: "dev-sandbox", status: "running", runtime: "Node.js 20", expiresAt: hoursAgo(22) }] } };
  }
  if (path.includes("/platforms")) {
    return { status: 200, data: { platforms: [{ id: uuid(), name: "E-Commerce Platform", workers: 5, requests: 50000 }] } };
  }
  if (path.includes("/observability")) {
    return { status: 200, data: { traces: [], metrics: { invocations: 12500, errors: 23, p50Latency: 45, p99Latency: 280 } } };
  }
  if (path.includes("/workflows")) {
    return { status: 200, data: { workflows: [{ id: uuid(), name: "Order Pipeline", status: "active", runs: 1280, lastRun: hoursAgo(1) }] } };
  }
  if (path.includes("/workers-ai")) {
    return { status: 200, data: { models: [{ name: "@cf/meta/llama-3-8b", type: "text-generation" }, { name: "@cf/stabilityai/stable-diffusion-xl", type: "image-generation" }] } };
  }
  if (path.includes("/dns")) {
    return { status: 200, data: { zones: [{ id: uuid(), name: "acme.com", records: 12, status: "active" }] } };
  }
  return { status: 200, data: { success: true } };
}

function handleExtensions(path: string, method: string, body?: any): Handler {
  if (method === "GET" && path.includes("/database/")) {
    return { status: 200, data: { extensions: demoExtensions } };
  }
  if (method === "GET" && path.includes("/available")) {
    return { status: 200, data: { extensions: demoAvailableExtensions } };
  }
  if (method === "POST" && path.includes("/install")) {
    return { status: 201, data: { extension: { id: uuid(), ...body, installed: true } } };
  }
  if (path.includes("/uninstall")) {
    return { status: 200, data: { success: true } };
  }
  return { status: 200, data: { extensions: demoExtensions } };
}

function handleWebhooks(path: string, method: string, body?: any): Handler {
  if (method === "GET" && path.includes("/database/")) {
    return { status: 200, data: { webhooks: demoWebhooks } };
  }
  if (method === "GET" && path.includes("/logs")) {
    return { status: 200, data: { logs: demoWebhookLogs } };
  }
  if (method === "POST" && !path.includes("/toggle")) {
    return { status: 201, data: { webhook: { id: uuid(), ...body, active: true, createdAt: new Date().toISOString() } } };
  }
  return { status: 200, data: { success: true } };
}

function handleRLS(path: string, method: string, body?: any): Handler {
  if (method === "GET" && path.includes("/database/")) {
    return { status: 200, data: { policies: demoRlsPolicies } };
  }
  if (method === "POST" && !path.includes("/toggle")) {
    return { status: 201, data: { policy: { id: uuid(), ...body, active: true, createdAt: new Date().toISOString() } } };
  }
  return { status: 200, data: { success: true } };
}

function handleRealtime(path: string, method: string, body?: any): Handler {
  if (method === "GET" && path.includes("/database/")) {
    return { status: 200, data: { subscriptions: demoRealtimeSubscriptions } };
  }
  if (method === "GET" && path.includes("/messages")) {
    return { status: 200, data: { messages: [] } };
  }
  if (method === "POST" && !path.includes("/toggle")) {
    return { status: 201, data: { subscription: { id: uuid(), ...body, active: true, createdAt: new Date().toISOString(), messagesPerMin: 0 } } };
  }
  return { status: 200, data: { success: true } };
}
