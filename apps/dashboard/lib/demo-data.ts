export function setupDemoApi() {
  if (typeof window === "undefined") return;
  const orig = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    if (!url.includes(apiBase)) return orig(input, init);
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

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const uuid = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16); });
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600000).toISOString();

const demoProjects = [
  { id: slug("acme-corp-website"), name: "Acme Corp Website", description: "Company landing page and blog", createdAt: daysAgo(45), organizationId: "org-acme" },
  { id: slug("ecommerce-store"), name: "E-commerce Store", description: "Online storefront with payments", createdAt: daysAgo(30), organizationId: "org-acme" },
  { id: slug("saas-dashboard"), name: "SaaS Dashboard", description: "Customer analytics dashboard", createdAt: daysAgo(15), organizationId: "org-acme" },
  { id: slug("mobile-api-backend"), name: "Mobile API Backend", description: "GraphQL API for mobile clients", createdAt: daysAgo(7), organizationId: "org-acme" },
];

const demoDeployments = [
  { id: slug("acme-website"), projectId: demoProjects[0].id, name: "acme-website", framework: "Next.js", status: "running", gitBranch: "main", buildCommand: "npm run build", outputDirectory: ".next", environment: { NODE_ENV: "production", API_URL: "https://api.acme.com" }, gitRepository: "https://github.com/acme/website.git", url: "acme-website.cloudhost.app", createdAt: daysAgo(45), updatedAt: hoursAgo(2) },
  { id: slug("ecommerce-store"), projectId: demoProjects[1].id, name: "ecommerce-store", framework: "React", status: "running", gitBranch: "main", buildCommand: "npm run build", outputDirectory: "build", environment: { NODE_ENV: "production", STRIPE_KEY: "sk_live_***" }, gitRepository: "https://github.com/acme/store.git", url: "ecommerce-store.cloudhost.app", createdAt: daysAgo(30), updatedAt: hoursAgo(6) },
  { id: slug("saas-dashboard"), projectId: demoProjects[2].id, name: "saas-dashboard", framework: "Next.js", status: "running", gitBranch: "develop", buildCommand: "npm run build", outputDirectory: ".next", environment: { NODE_ENV: "development" }, gitRepository: "https://github.com/acme/saas.git", url: "saas-dashboard.cloudhost.app", createdAt: daysAgo(15), updatedAt: hoursAgo(1) },
  { id: slug("api-backend"), projectId: demoProjects[3].id, name: "api-backend", framework: "Node.js", status: "running", gitBranch: "main", buildCommand: "npm run build", outputDirectory: "dist", environment: { NODE_ENV: "production", DB_URL: "postgres://***" }, gitRepository: "https://github.com/acme/api.git", url: "api-backend.cloudhost.app", createdAt: daysAgo(7), updatedAt: hoursAgo(12) },
  { id: slug("acme-staging"), projectId: demoProjects[0].id, name: "acme-staging", framework: "Next.js", status: "stopped", gitBranch: "staging", buildCommand: "npm run build", outputDirectory: ".next", environment: { NODE_ENV: "staging" }, gitRepository: "https://github.com/acme/website.git", url: "acme-staging.cloudhost.app", createdAt: daysAgo(10), updatedAt: daysAgo(3) },
  { id: slug("admin-panel"), projectId: demoProjects[1].id, name: "admin-panel", framework: "PHP", status: "failed", gitBranch: "main", buildCommand: "composer install", outputDirectory: "public", environment: {}, gitRepository: "https://github.com/acme/admin.git", url: "admin-panel.cloudhost.app", createdAt: daysAgo(5), updatedAt: hoursAgo(8) },
];

const demoDatabases = [
  { id: slug("acme-main-db"), projectId: demoProjects[0].id, name: "acme-main-db", type: "PostgreSQL", version: "16", status: "running", host: "db.cloudhost.internal", port: 5432, databaseName: "acme_production", username: "acme_admin", password: "", createdAt: daysAgo(45), size: "2.4 GB" },
  { id: slug("store-inventory"), projectId: demoProjects[1].id, name: "store-inventory", type: "MySQL", version: "8.0", status: "running", host: "db.cloudhost.internal", port: 3306, databaseName: "store_inventory", username: "store_user", password: "", createdAt: daysAgo(30), size: "1.1 GB" },
  { id: slug("saas-cache"), projectId: demoProjects[2].id, name: "saas-cache", type: "Redis", version: "7.2", status: "running", host: "redis.cloudhost.internal", port: 6379, databaseName: "", username: "", password: "", createdAt: daysAgo(15), size: "128 MB" },
  { id: slug("acme-analytics"), projectId: demoProjects[0].id, name: "acme-analytics", type: "PostgreSQL", version: "15", status: "stopped", host: "db.cloudhost.internal", port: 5432, databaseName: "acme_analytics", username: "analytics_user", password: "", createdAt: daysAgo(20), size: "856 MB" },
];

const demoWordPress = [
  { id: slug("acme-blog"), name: "Acme Blog", domain: "blog.acme.com", phpVersion: "8.2", status: "running", adminEmail: "admin@acme.com", adminPassword: "wp_***", createdAt: daysAgo(30), url: "https://blog.acme.com" },
  { id: slug("company-news"), name: "Company News", domain: "news.acme.com", phpVersion: "8.1", status: "running", adminEmail: "editor@acme.com", adminPassword: "wp_***", createdAt: daysAgo(14), url: "https://news.acme.com" },
];

const demoDomains = [
  { id: slug("acme.com"), name: "acme.com", verified: true, dnsRecords: [
    { type: "A", name: "@", value: "76.76.21.21", ttl: 3600 },
    { type: "CNAME", name: "www", value: "acme.cloudhost.app", ttl: 3600 },
    { type: "MX", name: "@", value: "mail.acme.com", ttl: 3600 },
    { type: "TXT", name: "@", value: "v=spf1 include:_spf.cloudhost.app ~all", ttl: 3600 },
  ]},
  { id: slug("shop.acme.com"), name: "shop.acme.com", verified: true, dnsRecords: [
    { type: "CNAME", name: "@", value: "acme.cloudhost.app", ttl: 3600 },
  ]},
  { id: slug("api.acme.com"), name: "api.acme.com", verified: false, dnsRecords: [] },
];

const demoWorkflows = [
  { id: slug("deploy-notification"), name: "Deploy Notification", description: "Send Slack message on deploy", active: true, trigger: "Webhook", createdAt: daysAgo(20), updatedAt: hoursAgo(4), nodes: [{ id: "1", type: "webhook" }, { id: "2", type: "slack" }] },
  { id: slug("daily-backup"), name: "Daily Backup", description: "Backup all databases at midnight", active: true, trigger: "Schedule", createdAt: daysAgo(15), updatedAt: daysAgo(1), nodes: [{ id: "1", type: "schedule" }, { id: "2", type: "database" }] },
  { id: slug("welcome-email"), name: "Welcome Email", description: "Send welcome email to new users", active: false, trigger: "Email", createdAt: daysAgo(10), updatedAt: daysAgo(5), nodes: [{ id: "1", type: "email" }, { id: "2", type: "http" }] },
  { id: slug("deploy-to-staging"), name: "Deploy to Staging", description: "Auto-deploy main branch to staging", active: true, trigger: "Webhook", createdAt: daysAgo(5), updatedAt: hoursAgo(12), nodes: [{ id: "1", type: "webhook" }, { id: "2", type: "http" }, { id: "3", type: "database" }] },
  { id: slug("site-monitoring"), name: "Site Monitoring", description: "Check site uptime every 5 minutes", active: true, trigger: "Schedule", createdAt: daysAgo(3), updatedAt: hoursAgo(8), nodes: [{ id: "1", type: "schedule" }, { id: "2", type: "http" }] },
];

const demoEdgeFunctions = [
  { id: slug("hello-world"), name: "hello-world", runtime: "deno", status: "active", url: "https://edge.cloudhost.app/hello-world", sourceCode: `export default async (req: Request) => {\n  const { name } = await req.json().catch(() => ({ name: "World" }));\n  return new Response(\n    JSON.stringify({ message: \`Hello \${name} from the edge!\` }),\n    { headers: { "Content-Type": "application/json" } }\n  );\n};`, createdAt: daysAgo(20), projectId: demoProjects[0].id },
  { id: slug("auth-middleware"), name: "auth-middleware", runtime: "deno", status: "active", url: "https://edge.cloudhost.app/auth-middleware", sourceCode: `export default async (req: Request) => {\n  const token = req.headers.get("Authorization");\n  if (!token) return new Response("Unauthorized", { status: 401 });\n  return fetch("https://api.example.com/verify", { headers: { Authorization: token } });\n};`, createdAt: daysAgo(12), projectId: demoProjects[0].id },
  { id: slug("image-optimizer"), name: "image-optimizer", runtime: "node", status: "inactive", url: "https://edge.cloudhost.app/image-optimizer", sourceCode: `import sharp from "sharp";\nexport default async (req: Request) => {\n  const url = new URL(req.url);\n  const imageUrl = url.searchParams.get("url");\n  if (!imageUrl) return new Response("Missing url param", { status: 400 });\n  return new Response("Optimized image", { headers: { "Content-Type": "image/webp" } });\n};`, createdAt: daysAgo(5), projectId: demoProjects[1].id },
];

const mkProduct = (name: string, slugId: string, icon: string, category: string, type: string, description: string, longDescription: string, vendor: string, pricing: string, rating: number, reviews: number, installCount: number, color: string, features: string[]) => ({
  id: slugId, name, icon, category, type, version: "1.0", description, longDescription, vendor, pricing, rating, reviews, installCount, color, features,
  screenshots: [`https://placehold.co/800x450/${color.replace("bg-", "").split("-")[1] || "6366f1"}/ffffff?text=${name.replace(/ /g, "+")}`],
  documentationUrl: `https://docs.cloudhost.app/marketplace/${slugId}`,
  supportUrl: `https://support.cloudhost.app/${slugId}`,
  termsUrl: `https://cloudhost.app/terms/marketplace`,
  createdAt: daysAgo(Math.floor(Math.random() * 90)),
  updatedAt: hoursAgo(Math.floor(Math.random() * 720)),
});

const demoMarketplaceApps = [
  mkProduct("Brave Search API", "brave-search-api", "Br", "AI Agents & Tools", "SaaS", "The largest commercially-available developer tool for programmable Web search used to connect apps and AI to the global internet.", "Brave Search API provides developers with programmatic access to the Brave Search index, enabling AI agents, applications, and services to retrieve real-time web results. With privacy-preserving architecture and comprehensive coverage, it's the go-to search API for AI-powered applications.", "Brave Software", "Pay-as-you-go", 4.5, 128, 3400, "bg-orange-600", ["Real-time web search", "Privacy-preserving", "AI-optimized results", "RESTful API", "10M queries/month included", "99.9% uptime SLA"]),
  mkProduct("Document Intelligence AI", "doc-intelligence-ai", "DI", "AI Agents & Tools", "SaaS", "Extract structured information or convert messy documents into clean HTML with a single API.", "Document Intelligence AI transforms unstructured documents into structured, machine-readable data. Leveraging advanced LLMs and computer vision, it handles PDFs, scanned images, Word docs, and more — outputting clean JSON, HTML, or Markdown.", "Upstage", "Usage-based", 4.3, 89, 2100, "bg-violet-600", ["Multi-format document parsing", "Structured data extraction", "Clean HTML/MD output", "Handles scanned documents", "Batch processing", "Custom schema support"]),
  mkProduct("Pokee AI Agent", "pokee-ai-agent", "PK", "AI Agents & Tools", "Container", "Autonomous agent platform for solving complex enterprise problems with large-scale Agent workflows.", "Pokee AI is a research lab building next-generation autonomous agents. Their platform designs, builds, and runs complex multi-agent workflows for enterprises, from customer service automation to supply chain optimization.", "Pokee AI", "Custom pricing", 5.0, 12, 890, "bg-cyan-600", ["Multi-agent orchestration", "Enterprise-grade security", "Custom workflow builder", "Real-time monitoring", "Integration marketplace", "Dedicated support"]),
  mkProduct("Brave AI Chat", "brave-ai-chat", "BC", "AI Agents & Tools", "SaaS", "AI-powered chat with real-time web search integration for accurate, up-to-date responses.", "Brave AI Chat combines LLM capabilities with Brave's search index to provide accurate, citation-backed responses. Perfect for customer support, research, and knowledge management applications.", "Brave Software", "Free / Pro", 4.6, 234, 5600, "bg-purple-700", ["Real-time web knowledge", "Citation-backed answers", "Privacy-first design", "Customizable personas", "API access", "Multi-language support"]),
  mkProduct("Asana MCP Server", "asana-mcp-server", "As", "AI Agents & Tools", "Free", "Model Context Protocol server allowing AI assistants to access the Asana Work Graph.", "Asana MCP Server bridges AI assistants with Asana's project management platform. AI agents can create tasks, update projects, search work graphs, and manage workflows directly through natural language.", "Asana", "Free (AWS)", 4.4, 1001, 7800, "bg-red-500", ["AI-native task management", "Work Graph access", "Natural language interface", "Real-time sync", "Multi-project support", "Team collaboration"]),
  mkProduct("1Password Business", "1password-business", "1P", "Security", "SaaS", "Password manager for businesses with secrets automation and identity management.", "1Password takes the guesswork out of logins, shadow IT, and infrastructure secrets. Secure your workforce with SSO integration, automated provisioning, and developer-friendly CLI tools.", "1Password", "Per-user/month", 4.6, 1783, 12000, "bg-blue-600", ["Unlimited shared vaults", "SSO integration", "Developer CLI tools", "Secrets automation", "Breach monitoring", "Travel mode"]),
  mkProduct("Tailscale", "tailscale", "Ts", "Security", "SaaS", "Secure connectivity platform replacing legacy VPNs for remote teams and multi-cloud environments.", "Tailscale is a secure connectivity platform that replaces your legacy VPN, SASE, and PAM. Connect remote teams, multi-cloud environments, CI/CD pipelines, Edge & IoT devices, and AI workloads with zero-configuration networking.", "Tailscale", "Free / Team / Enterprise", 4.5, 57, 4500, "bg-gray-800", ["Zero-config VPN", "Multi-cloud networking", "CI/CD integration", "IoT device support", "ACL-based security", "Audit logging"]),
  mkProduct("TrendAI Vision One", "trendai-vision-one", "TV", "Security", "SaaS", "AI-powered enterprise cybersecurity platform for hybrid and multi-cloud environments.", "Stop threats before they strike with TrendAI Vision One — the AI-powered enterprise cybersecurity platform built to predict, prevent, and respond to threats across AWS, hybrid, and multi-cloud environments.", "Trend Micro", "Per-endpoint/month", 4.6, 338, 3200, "bg-emerald-600", ["AI threat prediction", "Multi-cloud coverage", "Automated response", "Endpoint protection", "Network security", "Compliance reporting"]),
  mkProduct("Orca Security CNAPP", "orca-security-cnapp", "OS", "Security", "SaaS", "Agentless cloud security platform with 100% coverage across AWS, Azure, and GCP.", "Agentless Cloud Security in a single, complete platform with 100% coverage. Orca detects vulnerabilities, misconfigurations, and threats across your entire cloud estate without deploying agents.", "Orca Security", "Per-resource/month", 4.7, 317, 5100, "bg-orange-500", ["Agentless scanning", "100% cloud coverage", "Vulnerability management", "Compliance automation", "Threat detection", "Context-based prioritization"]),
  mkProduct("Okta Workforce", "okta-workforce", "Ok", "Security", "SaaS", "Secure identity management for employees, contractors, and partners.", "Secure your workforce — wherever they are. Covers every part of the Identity lifecycle, from governance to access management to privileged controls.", "Okta, Inc", "Per-user/month", 4.4, 892, 8500, "bg-blue-700", ["SSO & MFA", "Lifecycle management", "API access management", "Privileged access", "Governance & compliance", "Workforce identity"]),
  mkProduct("Vanta", "vanta", "Va", "Security", "SaaS", "Simplify and centralize compliance and security workflows for fast-growing companies.", "Vanta helps thousands of fast-growing companies simplify and centralize compliance and security workflows so they can build trust. Automate SOC 2, ISO 27001, HIPAA, and more.", "Vanta", "Per-assessment", 4.6, 2540, 9200, "bg-teal-600", ["Automated compliance", "SOC 2 readiness", "ISO 27001 support", "HIPAA compliance", "Vendor risk management", "Continuous monitoring"]),
  mkProduct("Cast AI", "cast-ai", "CA", "Cloud Operations", "SaaS", "EKS fully automated cost optimization and monitoring platform.", "Get EKS monitoring and automated cost optimization in one easy-to-use platform. Cast AI shows you how much you spend on EKS and reduces your cost by 50-75% automatically with smart rightsizing and spot instances.", "Cast AI", "Percentage of savings", 4.6, 201, 3400, "bg-sky-600", ["Automated cost optimization", "EKS monitoring", "Spot instance management", "Rightsizing recommendations", "Multi-cloud support", "Cost forecasting"]),
  mkProduct("Suger Marketplace", "suger-marketplace", "Su", "Cloud Operations", "SaaS", "Multi-cloud marketplace platform to onboard and sell products across cloud marketplaces.", "Suger platform helps you reduce engineering effort to onboard products to multiple cloud marketplaces. Reach customers on AWS, GCP, and Azure with minimal engineering requirements.", "Suger Inc", "Percentage of revenue", 4.9, 71, 1800, "bg-pink-600", ["Multi-marketplace support", "Automated onboarding", "Billing integration", "Metering API", "Customer analytics", "Partner network"]),
  mkProduct("LucidLink", "lucidlink", "LL", "Storage", "SaaS", "Instant file collaboration without syncing or downloading.", "Collaborate everywhere, instantly with LucidLink. Empower your team to access, edit and share files of any size in real time, without syncing or downloading.", "LucidLink", "Per-TB/month", 4.5, 730, 2900, "bg-indigo-600", ["Real-time collaboration", "No sync required", "Files of any size", "Global access", "Enterprise security", "Native client apps"]),
  mkProduct("Aurora Endpoint Defense", "aurora-endpoint-defense", "AE", "Security", "SaaS", "AI-driven prevention, detection, and response for endpoint threats.", "Aurora Endpoint Defense delivers AI-driven prevention, detection, and response capabilities to stop endpoint threats before they disrupt your business. Leverage the Aurora EDR console for complete visibility.", "Arctic Wolf", "Per-endpoint/month", 4.3, 142, 2100, "bg-slate-700", ["AI-driven detection", "EDR capabilities", "Threat hunting", "Automated response", "24/7 SOC support", "Forensic analysis"]),
  mkProduct("Aurora Protect", "aurora-protect", "AP", "Security", "SaaS", "AI-driven prevention capabilities for enterprises.", "Aurora Protect delivers AI-driven prevention capabilities to stop endpoint threats before they disrupt your business. Features Alpha AI for Endpoint with the longest running predictive AI model on the market.", "Arctic Wolf", "Per-endpoint/month", 4.7, 279, 1900, "bg-cyan-700", ["Predictive AI prevention", "Zero-day protection", "Ransomware defense", "Malware prevention", "Script control", "Device control"]),
  mkProduct("Neon Serverless Postgres", "neon-serverless-postgres", "Ne", "DevOps", "SaaS", "Serverless PostgreSQL with instant provisioning and branching.", "Neon is a serverless PostgreSQL platform that separates storage from compute. Get instant provisioning, database branching, and bottomless storage — perfect for development and production workloads.", "Neon Inc", "Free / Scale / Enterprise", 4.8, 567, 8900, "bg-green-600", ["Serverless PostgreSQL", "Instant provisioning", "Database branching", "Bottomless storage", "Connection pooling", "Point-in-time recovery"]),
  mkProduct("Supabase", "supabase", "Sb", "DevOps", "SaaS", "Open-source Firebase alternative with PostgreSQL, auth, and realtime.", "Supabase is an open-source Firebase alternative providing PostgreSQL database, authentication, instant APIs, realtime subscriptions, and storage. Build faster with a complete backend platform.", "Supabase", "Free / Pro / Team", 4.7, 890, 15000, "bg-emerald-700", ["Managed PostgreSQL", "Row-level security", "Realtime subscriptions", "Built-in auth", "Auto-generated APIs", "Edge Functions"]),
  mkProduct("Terraform Cloud", "terraform-cloud", "Tc", "DevOps", "SaaS", "Infrastructure as Code platform for provisioning and managing cloud resources.", "Terraform Cloud helps teams provision and manage infrastructure using declarative configuration files. Collaborate on infrastructure changes with version control, policy enforcement, and cost estimation.", "HashiCorp", "Free / Team / Enterprise", 4.5, 1203, 11000, "bg-purple-600", ["Infrastructure as Code", "Version control integration", "Policy as Code", "Cost estimation", "Collaborative runs", "Private registry"]),
  mkProduct("Datadog", "datadog", "Dd", "DevOps", "SaaS", "Cloud-scale monitoring and observability platform for infrastructure and applications.", "Datadog is the essential monitoring and security platform for cloud applications. Bring together data, logs, and traces from servers, containers, databases, and third-party services.", "Datadog", "Per-host/month", 4.5, 2341, 18000, "bg-purple-700", ["Infrastructure monitoring", "APM & distributed tracing", "Log management", "Synthetic monitoring", "Security monitoring", "Dashboards & alerts"]),
  mkProduct("Sentry", "sentry", "Se", "DevOps", "SaaS", "Real-time error tracking and performance monitoring for applications.", "Sentry provides real-time insight into production application health. Track errors, monitor performance, and debug issues across every layer of your stack.", "Functional Software", "Free / Team / Business", 4.6, 1567, 13000, "bg-red-600", ["Error tracking", "Performance monitoring", "Release health", "Session replay", "Mobile crash reporting", "Code-level diagnostics"]),
  mkProduct("Redis Enterprise", "redis-enterprise", "Re", "Data Products", "Container", "Enterprise-grade Redis with advanced data structures and high availability.", "Redis Enterprise delivers enterprise-grade Redis capabilities including active-active geo-distribution, multi-tenancy, and advanced data structures. Deploy on your infrastructure of choice.", "Redis Ltd", "Per-GB/month", 4.4, 432, 5600, "bg-red-700", ["Active-active geo-distribution", "Advanced data structures", "Multi-tenancy", "High availability", "Auto-failover", "Redis Stack modules"]),
  mkProduct("MongoDB Atlas", "mongodb-atlas", "Mo", "Data Products", "SaaS", "Fully-managed MongoDB database service with global distribution.", "MongoDB Atlas is the fully-managed cloud database service for modern applications. Deploy globally with automated backups, monitoring, and scaling.", "MongoDB Inc", "Per-instance/month", 4.5, 2340, 20000, "bg-green-700", ["Global clusters", "Automated backups", "Built-in monitoring", "Serverless instances", "Atlas Search", "Data federation"]),
  mkProduct("TimescaleDB", "timescaledb", "Ti", "Data Products", "Container", "Time-series database built on PostgreSQL for IoT and financial data.", "TimescaleDB is an open-source time-series database optimized for fast ingest and complex queries. Built on PostgreSQL, it supports full SQL with automatic partitioning and compression.", "Timescale", "Free / Premium", 4.6, 289, 3200, "bg-blue-500", ["Time-series optimization", "Full SQL support", "Automatic partitioning", "Native compression", "Continuous aggregates", "Multi-node support"]),
  mkProduct("Qdrant", "qdrant", "Qd", "Machine Learning", "Container", "High-performance vector similarity search engine for AI applications.", "Qdrant is a vector database and similarity search engine designed for production AI applications. Store, manage, and search vectors at scale with filtering and rich metadata.", "Qdrant", "Free / Cloud / Enterprise", 4.7, 345, 4100, "bg-red-600", ["Vector similarity search", "Filtering & payload", "Horizontal scaling", "REST + gRPC APIs", "Built-in quantization", "Multi-tenancy"]),
  mkProduct("Weaviate", "weaviate", "We", "Machine Learning", "Container", "Open-source vector database with built-in ML models and GraphQL API.", "Weaviate is an open-source vector database that allows you to store data objects and vector embeddings from ML models. Leverage built-in modules for text, image, and multimodal search.", "Weaviate", "Free / Cloud / Enterprise", 4.5, 267, 3800, "bg-teal-700", ["Vector + object storage", "Built-in ML modules", "GraphQL API", "Hybrid search", "Multi-modal support", "Automatic schema inference"]),
  mkProduct("LangChain", "langchain", "Lc", "Machine Learning", "Container", "Framework for building LLM-powered applications with composable chains.", "LangChain is a framework for developing applications powered by language models. Build context-aware reasoning applications with composable chains, agents, and retrieval-augmented generation.", "LangChain", "Free / LangSmith Cloud", 4.6, 890, 12000, "bg-green-600", ["Composable chains", "Agent framework", "RAG support", "Model agnostic", "Streaming first", "Observability"]),
  mkProduct("Ollama", "ollama", "Ol", "Machine Learning", "Container", "Run Llama 3, Mistral, Gemma, and other LLMs locally.", "Ollama allows you to run large language models locally on your infrastructure. Deploy Llama 3, Mistral, Gemma, and other open-source models with minimal setup.", "Ollama", "Free (Open Source)", 4.8, 567, 9500, "bg-gray-800", ["Local LLM deployment", "Multi-model support", "REST API", "GPU acceleration", "Model customization", "Lightweight footprint"]),
  mkProduct("Stripe Connect", "stripe-connect", "Sc", "Business Applications", "SaaS", "Platform for marketplace and platform payment processing.", "Stripe Connect lets platforms and marketplaces handle payments, onboard sellers, and manage payouts globally. Accept money from customers and pay out to sellers in 135+ currencies.", "Stripe", "Per-transaction", 4.6, 3456, 25000, "bg-indigo-600", ["Payment processing", "Seller onboarding", "Global payouts", "Marketplace platform", "Fraud prevention", "Tax automation"]),
  mkProduct("Algolia", "algolia", "Al", "Business Applications", "SaaS", "AI-powered search and discovery platform for websites and apps.", "Algolia provides AI-powered search and discovery experiences. Deliver relevant results in milliseconds with typo tolerance, faceting, and personalization.", "Algolia", "Free / Build / Pro", 4.5, 1234, 14000, "bg-blue-600", ["AI search", "Typo tolerance", "Faceted search", "Personalization", "Real-time indexing", "Analytics"]),
  mkProduct("Contentful", "contentful", "Cf", "Business Applications", "SaaS", "Composable content platform for digital experiences.", "Contentful is a composable content platform that enables content creators and developers to create, manage, and distribute content across any channel.", "Contentful", "Free / Team / Enterprise", 4.4, 890, 11000, "bg-orange-600", ["Headless CMS", "Content modeling", "API-first architecture", "Multi-channel delivery", "Media management", "Localization"]),
  mkProduct("Shopify", "shopify", "Sh", "Business Applications", "SaaS", "Complete commerce platform for selling online, in-store, and everywhere.", "Shopify is the commerce platform powering millions of businesses worldwide. Sell online, in-person, and across marketplaces with integrated payments, shipping, and marketing tools.", "Shopify", "Per-month + transaction", 4.3, 4567, 35000, "bg-green-800", ["Online store builder", "POS system", "Payment processing", "Multi-channel selling", "Inventory management", "Marketing tools"]),
  mkProduct("Salesforce", "salesforce", "Sf", "Business Applications", "SaaS", "CRM platform for sales, service, marketing, and analytics.", "Salesforce is the world's leading CRM platform. Connect with customers across sales, service, marketing, commerce, and IT with AI-powered insights.", "Salesforce", "Per-user/month", 4.2, 5678, 40000, "bg-blue-800", ["Sales CRM", "Service cloud", "Marketing cloud", "Commerce cloud", "AI (Einstein)", "Analytics"]),
  mkProduct("Auth0", "auth0", "Au", "Security", "SaaS", "Identity platform for securing applications with authentication and authorization.", "Auth0 provides a universal identity platform for web, mobile, and legacy applications. Implement SSO, MFA, passwordless, and social login with minimal code.", "Okta", "Free / Developer / Enterprise", 4.6, 2345, 18000, "bg-orange-600", ["Universal login", "SSO & MFA", "Passwordless auth", "Social login", "Machine-to-machine", "Anomaly detection"]),
  mkProduct("Cloudflare Workers", "cloudflare-workers", "Cf", "DevOps", "Free", "Serverless platform for deploying code globally at the edge.", "Cloudflare Workers is a serverless execution environment that runs your code on Cloudflare's global network. Deploy JavaScript, WASM, or compiled languages in 300+ locations.", "Cloudflare", "Free / Paid", 4.7, 1890, 22000, "bg-orange-700", ["Global edge deployment", "Zero cold starts", "WASM support", "KV & D1 storage", "Cron triggers", "Durable Objects"]),
  mkProduct("Docker Desktop", "docker-desktop", "Dk", "DevOps", "Free", "Containerization platform for building, sharing, and running applications.", "Docker Desktop is the fastest way to containerize applications. Build, share, and run containers on any infrastructure — from local development to production.", "Docker Inc", "Free / Pro / Team", 4.5, 3456, 30000, "bg-blue-600", ["Container runtime", "Docker Compose", "Image management", "Kubernetes integration", "Dev environment", "Extensions"]),
  mkProduct("GitHub Actions", "github-actions", "Gh", "DevOps", "Free", "CI/CD platform integrated with GitHub for automating workflows.", "GitHub Actions makes it easy to automate all your software workflows. Build, test, and deploy your code right from GitHub with world-class CI/CD.", "GitHub", "Free / Team / Enterprise", 4.7, 4567, 35000, "bg-gray-900", ["CI/CD pipelines", "Matrix builds", "Secret management", "Self-hosted runners", "Marketplace actions", "Container support"]),
  mkProduct("Kubernetes", "kubernetes", "K8", "DevOps", "Container", "Production-grade container orchestration for automated deployment and scaling.", "Kubernetes automates deployment, scaling, and management of containerized applications. Group containers into pods, manage resources, and self-heal failures.", "CNCF", "Free (Open Source)", 4.8, 5678, 40000, "bg-blue-700", ["Container orchestration", "Auto-scaling", "Self-healing", "Service discovery", "Load balancing", "Rolling updates"]),
  mkProduct("TensorFlow", "tensorflow", "Tf", "Machine Learning", "Container", "Open-source machine learning platform for building and deploying ML models.", "TensorFlow is an end-to-end open-source ML platform. Build and train ML models using intuitive APIs, deploy anywhere with TensorFlow Serving, and scale across CPUs, GPUs, and TPUs.", "Google", "Free (Open Source)", 4.6, 3456, 28000, "bg-orange-600", ["Model building API", "Training infrastructure", "Model serving", "GPU/TPU support", "Mobile & web", "TFX pipelines"]),
  mkProduct("PyTorch", "pytorch", "Py", "Machine Learning", "Container", "Open-source machine learning framework for research and production.", "PyTorch is an optimized tensor library for deep learning using GPUs and CPUs. From research prototyping to production deployment, PyTorch provides the flexibility and speed needed.", "Meta AI", "Free (Open Source)", 4.7, 2890, 25000, "bg-red-600", ["Dynamic computation graphs", "GPU acceleration", "Distributed training", "TorchScript deployment", "Ecosystem libraries", "ONNX export"]),
  mkProduct("NGINX", "nginx", "Nx", "Infrastructure Software", "Container", "High-performance web server, reverse proxy, and load balancer.", "NGINX is a high-performance web server known for its stability, rich feature set, and low resource consumption. Use it as a reverse proxy, load balancer, API gateway, and web accelerator.", "F5", "Free (Open Source) / Plus", 4.7, 4567, 35000, "bg-green-700", ["Web server", "Reverse proxy", "Load balancing", "API gateway", "SSL termination", "Media streaming"]),
  mkProduct("HAProxy", "haproxy", "Ha", "Infrastructure Software", "Container", "Reliable, high-performance TCP/HTTP load balancer and proxy server.", "HAProxy is the world's fastest and most widely used open-source load balancer. It provides high availability, load balancing, and proxy for TCP and HTTP-based applications.", "HAProxy Technologies", "Free (Open Source) / Enterprise", 4.6, 1234, 15000, "bg-gray-700", ["TCP/HTTP load balancing", "High availability", "Health checking", "SSL termination", "Sticky sessions", "Rate limiting"]),
  mkProduct("Prometheus", "prometheus", "Pr", "DevOps", "Container", "Open-source monitoring system and time-series database for infrastructure and applications.", "Prometheus is an open-source systems monitoring and alerting toolkit. Collect metrics from configured targets at given intervals, evaluate rule expressions, and trigger alerts.", "CNCF", "Free (Open Source)", 4.7, 2345, 22000, "bg-red-700", ["Multi-dimensional data model", "PromQL query language", "Alerting", "Service discovery", "Pull-based metrics", "Grafana integration"]),
  mkProduct("Grafana", "grafana", "Gr", "DevOps", "Container", "Observability and data visualization platform for metrics, logs, and traces.", "Grafana allows you to query, visualize, alert on, and understand your data. Create interactive dashboards from multiple data sources including Prometheus, Elasticsearch, and SQL databases.", "Grafana Labs", "Free (Open Source) / Cloud / Enterprise", 4.7, 3456, 28000, "bg-orange-700", ["Dashboard visualization", "Multi-source queries", "Alerting engine", "Team collaboration", "Annotations", "Library panels"]),
  mkProduct("Elasticsearch", "elasticsearch", "El", "Data Products", "Container", "Distributed search and analytics engine for all types of data.", "Elasticsearch is a distributed, RESTful search and analytics engine capable of addressing a growing number of use cases. Store, search, and analyze large volumes of data quickly.", "Elastic", "Free (Open Source) / Cloud / Enterprise", 4.6, 4567, 32000, "bg-green-600", ["Full-text search", "Real-time analytics", "Distributed architecture", "RESTful API", "Schema-free", "Machine learning"]),
  mkProduct("Kafka", "kafka", "Kf", "Data Products", "Container", "Distributed event streaming platform for high-throughput data pipelines.", "Apache Kafka is a distributed event streaming platform capable of handling trillions of events a day. Build real-time data pipelines and streaming applications with high throughput.", "Apache Software Foundation", "Free (Open Source)", 4.6, 3456, 26000, "bg-gray-800", ["Event streaming", "High throughput", "Pub/sub messaging", "Stream processing", "Exactly-once semantics", "Connect API"]),
  mkProduct("JupyterHub", "jupyterhub", "Ju", "Machine Learning", "Container", "Multi-user notebook server for teams and organizations.", "JupyterHub brings the power of notebooks to groups of users. It gives users access to computational environments and resources without burdening the users with installation and maintenance tasks.", "Project Jupyter", "Free (Open Source)", 4.5, 1234, 8500, "bg-orange-500", ["Multi-user notebooks", "Resource management", "Authentication", "Custom environments", "Spawner options", "Scalable deployment"]),
  mkProduct("Mistral AI", "mistral-ai", "Mi", "Machine Learning", "SaaS", "Open-weight LLMs for high-performance AI applications.", "Mistral AI provides cutting-edge open-weight language models optimized for performance and efficiency. Deploy models via API or self-host for enterprise workloads.", "Mistral AI", "Per-token / Self-host", 4.7, 678, 7500, "bg-blue-600", ["Open-weight models", "API access", "Self-hosting option", "Multi-language", "Code generation", "Function calling"]),
  mkProduct("PostHog", "posthog", "Ph", "Business Applications", "Container", "Open-source product analytics platform for understanding user behavior.", "PostHog is an all-in-one product analytics platform. Track users, analyze behavior, run experiments, and deploy feature flags — all in one platform.", "PostHog", "Free (Self-host) / Cloud", 4.7, 890, 6500, "bg-yellow-600", ["Product analytics", "Session recording", "Feature flags", "A/B testing", "Heatmaps", "Data warehouse"]),
  mkProduct("Clerk", "clerk", "Cl", "Security", "SaaS", "User management and authentication platform with pre-built UI components.", "Clerk provides complete user management — from sign-up to multi-factor authentication. Pre-built components, social login, and enterprise SSO with zero configuration.", "Clerk", "Free / Pro / Enterprise", 4.6, 567, 7200, "bg-purple-600", ["Pre-built auth UI", "Social login", "MFA support", "Organization management", "User profiles", "Webhook events"]),
  mkProduct("Neon Postgres", "neon-postgres", "Ne", "Data Products", "SaaS", "Serverless PostgreSQL platform with branching and instant provisioning.", "Neon is Serverless Postgres with instant provisioning and bottomless storage. Spin up databases in seconds, branch for development, and scale to zero when idle.", "Neon", "Free / Scale / Enterprise", 4.8, 890, 12000, "bg-green-600", ["Serverless Postgres", "Branching", "Instant provisioning", "Scale to zero", "Connection pooling", "Point-in-time recovery"]),
];

const marketplaceCategories = [
  { name: "AI Agents & Tools", icon: "🤖", count: 5, color: "bg-violet-100 text-violet-700" },
  { name: "Business Applications", icon: "💼", count: 5, color: "bg-blue-100 text-blue-700" },
  { name: "Cloud Operations", icon: "☁️", count: 2, color: "bg-cyan-100 text-cyan-700" },
  { name: "Data Products", icon: "📊", count: 5, color: "bg-emerald-100 text-emerald-700" },
  { name: "DevOps", icon: "🛠️", count: 9, color: "bg-orange-100 text-orange-700" },
  { name: "Infrastructure Software", icon: "🏗️", count: 2, color: "bg-gray-100 text-gray-700" },
  { name: "Machine Learning", icon: "🧠", count: 8, color: "bg-purple-100 text-purple-700" },
  { name: "Security", icon: "🔒", count: 8, color: "bg-red-100 text-red-700" },
  { name: "Storage", icon: "💾", count: 1, color: "bg-indigo-100 text-indigo-700" },
];

const deliveryMethods = ["SaaS", "Container", "Free", "Machine Learning", "Professional Services", "Data", "AMI"];

const demoMarketplaceInstallations = [
  { id: uuid(), appId: "demo-n8n", appName: "n8n", status: "active", installedAt: daysAgo(20), version: "1.0", url: "n8n.cloudhost.app" },
  { id: uuid(), appId: "demo-ghost", appName: "Ghost", status: "active", installedAt: daysAgo(15), version: "5.8", url: "blog.cloudhost.app" },
  { id: uuid(), appId: "demo-redis", appName: "Redis", status: "inactive", installedAt: daysAgo(10), version: "7.2", url: "" },
];

const demoMarketplaceInstances = [
  { id: uuid(), appId: "supabase", appName: "Supabase", type: "SaaS", status: "running", region: "us-east-1", cpu: "2 vCPU", memory: "4 GB", storage: "50 GB", ip: "203.0.113.101", url: "https://supabase.cloudhost.app", version: "1.2.0", createdAt: daysAgo(20), lastActive: hoursAgo(1), cost: "$0.50/hr" },
  { id: uuid(), appId: "neon-serverless-postgres", appName: "Neon Postgres", type: "SaaS", status: "running", region: "eu-west-1", cpu: "1 vCPU", memory: "2 GB", storage: "20 GB", ip: "203.0.113.102", url: "https://neon.cloudhost.app", version: "2.0.1", createdAt: daysAgo(15), lastActive: hoursAgo(3), cost: "$0.25/hr" },
  { id: uuid(), appId: "ollama", appName: "Ollama LLM", type: "Container", status: "stopped", region: "us-west-2", cpu: "4 vCPU", memory: "16 GB", storage: "100 GB", ip: "203.0.113.103", url: "", version: "0.3.0", createdAt: daysAgo(10), lastActive: daysAgo(2), cost: "$0.80/hr" },
  { id: uuid(), appId: "redis-enterprise", appName: "Redis Enterprise", type: "Container", status: "running", region: "us-east-1", cpu: "2 vCPU", memory: "8 GB", storage: "30 GB", ip: "203.0.113.104", url: "https://redis.cloudhost.app", version: "7.2.4", createdAt: daysAgo(5), lastActive: hoursAgo(0), cost: "$0.35/hr" },
  { id: uuid(), appId: "supabase", appName: "Supabase (Staging)", type: "SaaS", status: "provisioning", region: "eu-west-1", cpu: "1 vCPU", memory: "2 GB", storage: "10 GB", ip: "", url: "", version: "1.3.0-beta", createdAt: hoursAgo(1), lastActive: hoursAgo(1), cost: "$0.15/hr" },
  { id: uuid(), appId: "docker-desktop", appName: "Docker Registry", type: "Container", status: "running", region: "us-east-1", cpu: "2 vCPU", memory: "4 GB", storage: "200 GB", ip: "203.0.113.105", url: "https://registry.cloudhost.app", version: "2.0", createdAt: daysAgo(3), lastActive: hoursAgo(0), cost: "$0.30/hr" },
];

const demoMarketplaceSubscriptions = [
  { id: uuid(), appId: "supabase", appName: "Supabase", plan: "Pro", status: "active", billingPeriod: "monthly", amount: 25, currency: "USD", nextBilling: daysAgo(-15), startedAt: daysAgo(45), usage: { apiCalls: 125000, storageGB: 2.4, bandwidthGB: 45 }, autoRenew: true },
  { id: uuid(), appId: "neon-serverless-postgres", appName: "Neon Postgres", plan: "Scale", status: "active", billingPeriod: "monthly", amount: 49, currency: "USD", nextBilling: daysAgo(-10), startedAt: daysAgo(30), usage: { apiCalls: 45000, storageGB: 8.2, bandwidthGB: 120 }, autoRenew: true },
  { id: uuid(), appId: "datadog", appName: "Datadog", plan: "Pro", status: "active", billingPeriod: "monthly", amount: 15, currency: "USD", nextBilling: daysAgo(-5), startedAt: daysAgo(60), usage: {}, autoRenew: true },
  { id: uuid(), appId: "github-actions", appName: "GitHub Actions", plan: "Team", status: "active", billingPeriod: "monthly", amount: 4, currency: "USD", nextBilling: daysAgo(-20), startedAt: daysAgo(90), usage: {}, autoRenew: true },
  { id: uuid(), appId: "ollama", appName: "Ollama LLM", plan: "Free", status: "past_due", billingPeriod: "monthly", amount: 0, currency: "USD", nextBilling: daysAgo(-3), startedAt: daysAgo(10), usage: {}, autoRenew: true },
  { id: uuid(), appId: "sentry", appName: "Sentry", plan: "Team", status: "canceled", billingPeriod: "monthly", amount: 26, currency: "USD", nextBilling: daysAgo(-30), startedAt: daysAgo(120), usage: {}, autoRenew: false, canceledAt: daysAgo(30) },
];

const demoMarketplaceReviews = [
  { id: uuid(), appId: "supabase", appName: "Supabase", author: "Alex K.", rating: 5, title: "Best backend platform", text: "Supabase has completely replaced Firebase for our stack. The Postgres integration is seamless and the realtime features are incredible.", createdAt: daysAgo(5), helpful: 23 },
  { id: uuid(), appId: "supabase", appName: "Supabase", author: "Maria G.", rating: 4, title: "Great but needs better docs", text: "Overall a fantastic product. The auto-generated APIs save so much time. Documentation could be more comprehensive for advanced use cases.", createdAt: daysAgo(12), helpful: 8 },
  { id: uuid(), appId: "supabase", appName: "Supabase", author: "David R.", rating: 5, title: "Game changer for indie devs", text: "As a solo developer, Supabase lets me ship features that would normally require a full backend team.", createdAt: daysAgo(20), helpful: 45 },
  { id: uuid(), appId: "datadog", appName: "Datadog", author: "Sarah L.", rating: 4, title: "Solid monitoring platform", text: "Datadog provides excellent visibility into our infrastructure. The APM traces are particularly useful for debugging performance issues.", createdAt: daysAgo(3), helpful: 12 },
  { id: uuid(), appId: "datadog", appName: "Datadog", author: "Mike T.", rating: 5, title: "Enterprise-grade monitoring", text: "We migrated from Grafana + Prometheus and it was worth every penny. The integrations library is massive.", createdAt: daysAgo(8), helpful: 19 },
  { id: uuid(), appId: "neon-serverless-postgres", appName: "Neon Postgres", author: "Jenny W.", rating: 5, title: "Branching is a superpower", text: "Neon's database branching has transformed our development workflow. Each PR gets its own database branch.", createdAt: daysAgo(2), helpful: 34 },
  { id: uuid(), appId: "neon-serverless-postgres", appName: "Neon Postgres", author: "Tom H.", rating: 4, title: "Great serverless Postgres", text: "Instantly provisioning databases is amazing for dev environments. Production performance has been solid too.", createdAt: daysAgo(15), helpful: 7 },
  { id: uuid(), appId: "ollama", appName: "Ollama LLM", author: "Chris M.", rating: 5, title: "Local LLMs made easy", text: "Ollama is the easiest way to run LLMs locally or on your own infrastructure. The API is simple and it just works.", createdAt: daysAgo(7), helpful: 28 },
  { id: uuid(), appId: "langchain", appName: "LangChain", author: "Priya S.", rating: 4, title: "Powerful but complex", text: "LangChain is incredibly powerful but the learning curve is steep. The composability is unmatched though.", createdAt: daysAgo(10), helpful: 15 },
  { id: uuid(), appId: "mongodb-atlas", appName: "MongoDB Atlas", author: "Raj P.", rating: 5, title: "Best managed MongoDB", text: "Atlas takes the pain out of MongoDB operations. Auto-scaling, backups, and global clusters just work.", createdAt: daysAgo(4), helpful: 21 },
];

const demoMarketplaceAnalytics: any = {
  totalImpressions: 245000, totalClicks: 12800, totalInstalls: 234, totalRevenue: 1870,
  monthlyData: [
    { month: "Jan", impressions: 32000, clicks: 1800, installs: 28, revenue: 210 },
    { month: "Feb", impressions: 35000, clicks: 2100, installs: 35, revenue: 280 },
    { month: "Mar", impressions: 42000, clicks: 2400, installs: 42, revenue: 340 },
    { month: "Apr", impressions: 38000, clicks: 2200, installs: 38, revenue: 310 },
    { month: "May", impressions: 45000, clicks: 2600, installs: 45, revenue: 360 },
    { month: "Jun", impressions: 53000, clicks: 3200, installs: 56, revenue: 470 },
  ],
  topProducts: [
    { name: "Supabase", installs: 45, revenue: 1125, conversion: 3.2 },
    { name: "Cloudflare Workers", installs: 38, revenue: 0, conversion: 2.8 },
    { name: "Neon Postgres", installs: 32, revenue: 1568, conversion: 4.1 },
    { name: "Ollama", installs: 28, revenue: 0, conversion: 5.3 },
    { name: "Datadog", installs: 22, revenue: 330, conversion: 1.9 },
  ],
  byCategory: [
    { name: "Databases", impressions: 85000, clicks: 4200, installs: 78, revenue: 2100 },
    { name: "AI/ML", impressions: 62000, clicks: 3400, installs: 55, revenue: 890 },
    { name: "DevOps", impressions: 48000, clicks: 2600, installs: 42, revenue: 1200 },
    { name: "Security", impressions: 35000, clicks: 1800, installs: 34, revenue: 2800 },
    { name: "Storage", impressions: 15000, clicks: 800, installs: 25, revenue: 450 },
  ],
};

const demoMarketplaceAdminQueue = [
  { id: uuid(), sellerName: "Jane Smith", sellerEmail: "jane@devtoolify.com", company: "DevToolify Inc", productName: "CodeReview AI", productType: "SaaS", category: "DevOps", description: "AI-powered code review assistant that integrates with GitHub and GitLab. Automatically reviews pull requests for bugs, security issues, and best practices.", submittedAt: daysAgo(2), status: "pending" },
  { id: uuid(), sellerName: "Mike Chen", sellerEmail: "mike@cloudsecure.com", company: "CloudSecure", productName: "CloudSecure WAF", productType: "Container", category: "Security", description: "Web application firewall with AI-driven threat detection. Protects against OWASP Top 10, DDoS, and API abuse.", submittedAt: daysAgo(4), status: "pending" },
  { id: uuid(), sellerName: "Sarah Williams", sellerEmail: "sarah@dataflow.io", company: "DataFlow Inc", productName: "DataFlow Pipeline", productType: "Data", category: "Data Products", description: "Managed data pipeline service for ETL, streaming, and batch processing. Supports 50+ connectors and real-time transformations.", submittedAt: daysAgo(7), status: "under_review" },
  { id: uuid(), sellerName: "Alex Johnson", sellerEmail: "alex@opsgenie.com", company: "OpsGenie", productName: "OpsGenie Alerter", productType: "SaaS", category: "Cloud Operations", description: "Cloud operations alerting platform that aggregates alerts from monitoring tools and routes them to the right team.", submittedAt: daysAgo(14), status: "approved" },
  { id: uuid(), sellerName: "Emily Davis", sellerEmail: "emily@analytix.com", company: "Analytix", productName: "Analytix Dashboard", productType: "SaaS", category: "Business Applications", description: "Business intelligence dashboard with drag-and-drop visualization, SQL queries, and automated report scheduling.", submittedAt: daysAgo(21), status: "rejected" },
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
  { id: slug("acme.com"), domain: "acme.com", package: "Business", phpVersion: "8.2", diskUsed: 45, diskLimit: 100, status: "active", createdAt: daysAgo(45) },
  { id: slug("shop.acme.com"), domain: "shop.acme.com", package: "Starter", phpVersion: "8.1", diskUsed: 12, diskLimit: 50, status: "active", createdAt: daysAgo(30) },
  { id: slug("api.acme.com"), domain: "api.acme.com", package: "Pro", phpVersion: "8.3", diskUsed: 28, diskLimit: 200, status: "active", createdAt: daysAgo(15) },
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
    "GET /api/marketplace/apps": () => ({ status: 200, data: { apps: demoMarketplaceApps, categories: marketplaceCategories, deliveryMethods } }),
    "GET /api/marketplace/installations": () => ({ status: 200, data: { installations: demoMarketplaceInstallations } }),
    "POST /api/marketplace/install": () => ({ status: 201, data: { installation: { id: uuid(), ...body, status: "active", installedAt: new Date().toISOString(), url: `${body.name}.cloudhost.app` } } }),
    "GET /api/marketplace/instances": () => ({ status: 200, data: { instances: demoMarketplaceInstances } }),
    "POST /api/marketplace/instances/provision": () => ({ status: 201, data: { instance: { id: uuid(), ...body, status: "provisioning", region: "us-east-1", ip: "", createdAt: new Date().toISOString(), lastActive: new Date().toISOString() } } }),
    "GET /api/marketplace/subscriptions": () => ({ status: 200, data: { subscriptions: demoMarketplaceSubscriptions } }),
    "POST /api/marketplace/reviews": () => ({ status: 201, data: { review: { id: uuid(), ...body, createdAt: new Date().toISOString(), helpful: 0 } } }),
    "GET /api/marketplace/analytics": () => ({ status: 200, data: { analytics: demoMarketplaceAnalytics } }),
    "GET /api/marketplace/admin/queue": () => ({ status: 200, data: { queue: demoMarketplaceAdminQueue } }),
    "POST /api/marketplace/admin/queue/:id/approve": () => ({ status: 200, data: { success: true, status: "approved" } }),
    "POST /api/marketplace/admin/queue/:id/reject": () => ({ status: 200, data: { success: true, status: "rejected" } }),
    "POST /api/marketplace/seller/register": () => ({ status: 201, data: { submission: { id: uuid(), ...body, status: "pending", submittedAt: new Date().toISOString() } } }),
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
  // --- Marketplace API dynamic routes ---

  // Product detail
  if (path.match(/^\/api\/marketplace\/apps\/[^/]+$/) && method === "GET") {
    const id = path.split("/")[4];
    const app = demoMarketplaceApps.find(a => a.id === id);
    if (app) return { status: 200, data: { app } };
    return { status: 404, data: { error: "App not found" } };
  }

  // Reviews for a specific app
  if (path.match(/^\/api\/marketplace\/reviews\/[^/]+$/) && method === "GET") {
    const appId = path.split("/")[4];
    const reviews = demoMarketplaceReviews.filter(r => r.appId === appId);
    return { status: 200, data: { reviews } };
  }

  // Instance detail
  if (path.match(/^\/api\/marketplace\/instances\/[^/]+$/) && method === "GET") {
    const id = path.split("/")[4];
    const instance = demoMarketplaceInstances.find(i => i.id === id);
    if (instance) return { status: 200, data: { instance } };
    return { status: 404, data: { error: "Instance not found" } };
  }

  // Instance actions (stop/start/restart)
  if (path.match(/^\/api\/marketplace\/instances\/[^/]+\/(stop|start|restart)$/) && method === "POST") {
    return { status: 200, data: { success: true, message: "Action completed" } };
  }

  // Instance logs
  if (path.match(/^\/api\/marketplace\/instances\/[^/]+\/logs$/) && method === "GET") {
    return { status: 200, data: { logs: [
      { time: hoursAgo(0.5), message: "Health check passed" },
      { time: hoursAgo(1), message: "Request handled: GET /api/status" },
      { time: hoursAgo(2), message: "Connection pool at 45% capacity" },
      { time: hoursAgo(4), message: "Instance started successfully" },
    ] } };
  }

  // Subscription cancel
  if (path.match(/^\/api\/marketplace\/subscriptions\/[^/]+\/cancel$/) && method === "POST") {
    return { status: 200, data: { success: true, status: "canceled", canceledAt: new Date().toISOString() } };
  }

  // Admin queue actions
  if (path.match(/^\/api\/marketplace\/admin\/queue\/[^/]+\/(approve|reject)$/) && method === "POST") {
    const action = path.split("/").pop();
    return { status: 200, data: { success: true, status: action, message: `Product ${action === "approve" ? "approved" : "rejected"}` } };
  }
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

  // Project detail
  if (path.match(/^\/api\/projects\/(?!provision)[^/]+$/) && method === "GET") {
    const id = path.split("/")[3];
    const proj = demoProjects.find(p => p.id === id);
    return { status: 200, data: { project: proj || demoProjects[0] } };
  }
  if (path.match(/^\/api\/projects\/([^/]+)$/) && method === "DELETE") {
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
