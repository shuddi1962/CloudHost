import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { users } from "./users";

// Self-hosted n8n instances
export const n8nInstances = pgTable("n8n_instances", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  version: text("version").default("latest"),
  status: text("status").notNull().default("deploying"),
  vpsId: uuid("vps_id"),
  domain: text("domain"),
  port: integer("port").default(5678),
  username: text("username"),
  password: text("password"),
  apiKey: text("api_key"),
  activeWorkflows: integer("active_workflows").default(0),
  totalWorkflows: integer("total_workflows").default(0),
  executions24h: integer("executions_24h").default(0),
  dockerContainerId: text("docker_container_id"),
  deployedAt: timestamp("deployed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cloud Hosting instances
export const cloudHostingInstances = pgTable("cloud_hosting_instances", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  plan: text("plan").notNull(),
  cpu: text("cpu").notNull(),
  ram: text("ram").notNull(),
  storage: text("storage").notNull(),
  bandwidth: text("bandwidth"),
  location: text("location"),
  status: text("status").notNull().default("provisioning"),
  ipAddress: text("ip_address"),
  os: text("os"),
  managed: boolean("managed").default(false),
  autoScaled: boolean("auto_scaled").default(false),
  price: decimal("price", { precision: 10, scale: 2 }),
  provisionedAt: timestamp("provisioned_at"),
  expiresAt: timestamp("expires_at"),
  metrics: jsonb("metrics"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WooCommerce Hosting
export const woocommerceHosting = pgTable("woocommerce_hosting", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  plan: text("plan").notNull().default("starter"),
  status: text("status").notNull().default("provisioning"),
  storeName: text("store_name"),
  productCount: integer("product_count").default(0),
  orderCount: integer("order_count").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0"),
  woocommerceVersion: text("woocommerce_version"),
  wpVersion: text("wp_version"),
  plugins: jsonb("plugins"),
  theme: text("theme"),
  sslEnabled: boolean("ssl_enabled").default(true),
  caching: text("caching").default("enabled"),
  cdn: boolean("cdn").default(true),
  price: decimal("price", { precision: 10, scale: 2 }),
  provisionedAt: timestamp("provisioned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Agency Hosting (white-label)
export const agencyHosting = pgTable("agency_hosting", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  agencyName: text("agency_name").notNull(),
  plan: text("plan").notNull(),
  status: text("status").notNull().default("active"),
  clientCount: integer("client_count").default(0),
  maxClients: integer("max_clients").default(10),
  whiteLabel: boolean("white_label").default(false),
  customBranding: jsonb("custom_branding"),
  clientDomains: jsonb("client_domains"),
  revenueShare: decimal("revenue_share", { precision: 5, scale: 2 }).default("20"),
  totalEarned: decimal("total_earned", { precision: 12, scale: 2 }).default("0"),
  price: decimal("price", { precision: 10, scale: 2 }),
  activatedAt: timestamp("activated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Minecraft Servers
export const minecraftServers = pgTable("minecraft_servers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  version: text("version").default("latest"),
  serverType: text("server_type").default("vanilla"),
  status: text("status").notNull().default("provisioning"),
  ram: text("ram").default("2GB"),
  cpu: text("cpu").default("2 vCPU"),
  storage: text("storage").default("20GB"),
  port: integer("port").default(25565),
  ipAddress: text("ip_address"),
  maxPlayers: integer("max_players").default(20),
  onlinePlayers: integer("online_players").default(0),
  worldSize: text("world_size"),
  mods: jsonb("mods"),
  plugins: jsonb("plugins"),
  whitelist: text("whitelist").array(),
  operators: text("operators").array(),
  onlineMode: boolean("online_mode").default(true),
  pvp: boolean("pvp").default(true),
  difficulty: text("difficulty").default("normal"),
  price: decimal("price", { precision: 10, scale: 2 }),
  provisionedAt: timestamp("provisioned_at"),
  lastStartedAt: timestamp("last_started_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Agent Deployments (Hermes, OpenClaw, Paperclip)
export const aiAgentDeployments = pgTable("ai_agent_deployments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  agentType: text("agent_type").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("deploying"),
  vpsId: uuid("vps_id"),
  domain: text("domain"),
  port: integer("port"),
  version: text("version").default("latest"),
  dockerContainerId: text("docker_container_id"),
  apiEndpoint: text("api_endpoint"),
  apiKey: text("api_key"),
  configuration: jsonb("configuration"),
  activeSessions: integer("active_sessions").default(0),
  messagesProcessed: integer("messages_processed").default(0),
  uptime: text("uptime"),
  price: decimal("price", { precision: 10, scale: 2 }),
  deployedAt: timestamp("deployed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Google Workspace
export const googleWorkspace = pgTable("google_workspace", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  plan: text("plan").notNull().default("business_starter"),
  status: text("status").notNull().default("pending"),
  seats: integer("seats").default(1),
  storagePerSeat: text("storage_per_seat").default("30GB"),
  adminEmail: text("admin_email"),
  verified: boolean("verified").default(false),
  mxRecords: jsonb("mx_records"),
  dnsStatus: text("dns_status").default("pending"),
  price: decimal("price", { precision: 10, scale: 2 }),
  activatedAt: timestamp("activated_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Website Templates
export const websiteTemplates = pgTable("website_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  description: text("description"),
  previewUrl: text("preview_url"),
  thumbnail: text("thumbnail"),
  features: jsonb("features"),
  pages: jsonb("pages"),
  industry: text("industry"),
  isResponsive: boolean("is_responsive").default(true),
  isEcommerce: boolean("is_ecommerce").default(false),
  isAi: boolean("is_ai").default(false),
  popularity: integer("popularity").default(0),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ecommerce Website Builder projects
export const ecommerceBuilderProjects = pgTable("ecommerce_builder_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  template: text("template"),
  industry: text("industry"),
  products: integer("products").default(0),
  orders: integer("orders").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0"),
  paymentGateways: jsonb("payment_gateways"),
  shippingMethods: jsonb("shipping_methods"),
  taxSettings: jsonb("tax_settings"),
  customDomain: text("custom_domain"),
  publishedUrl: text("published_url"),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Print on Demand
export const printOnDemand = pgTable("print_on_demand", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  storeName: text("store_name").notNull(),
  provider: text("provider").default("printful"),
  status: text("status").notNull().default("active"),
  products: integer("products").default(0),
  orders: integer("orders").default(0),
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).default("0"),
  connectedPlatform: text("connected_platform"),
  apiKey: text("api_key"),
  designTemplates: jsonb("design_templates"),
  mockupUrls: jsonb("mockup_urls"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Link in Bio pages
export const linkInBio = pgTable("link_in_bio", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  username: text("username").notNull().unique(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  theme: jsonb("theme"),
  links: jsonb("links"),
  socialLinks: jsonb("social_links"),
  analytics: jsonb("analytics"),
  customDomain: text("custom_domain"),
  publishedUrl: text("published_url"),
  status: text("status").notNull().default("draft"),
  views: integer("views").default(0),
  clicks: integer("clicks").default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Newsletter Generator
export const aiNewsletterCampaigns = pgTable("ai_newsletter_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  subject: text("subject"),
  topic: text("topic"),
  tone: text("tone").default("professional"),
  content: text("content"),
  generatedContent: text("generated_content"),
  subscribers: integer("subscribers").default(0),
  sentCount: integer("sent_count").default(0),
  openRate: decimal("open_rate", { precision: 5, scale: 2 }),
  clickRate: decimal("click_rate", { precision: 5, scale: 2 }),
  status: text("status").notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Hostinger Horizons (AI App Builder projects)
export const horizonsProjects = pgTable("horizons_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  prompt: text("prompt"),
  techStack: jsonb("tech_stack"),
  pages: jsonb("pages"),
  features: jsonb("features"),
  integrations: jsonb("integrations"),
  customDomain: text("custom_domain"),
  publishedUrl: text("published_url"),
  aiCredits: integer("ai_credits").default(30),
  aiCreditsUsed: integer("ai_credits_used").default(0),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Hostinger API keys
export const hostingerApiKeys = pgTable("hostinger_api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  permissions: jsonb("permissions"),
  lastUsed: timestamp("last_used"),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reviews & Testimonials
export const customerReviews = pgTable("customer_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  authorName: text("author_name").notNull(),
  authorTitle: text("author_title"),
  authorAvatar: text("author_avatar"),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  serviceType: text("service_type"),
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  approved: boolean("approved").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// System Status
export const systemStatusEvents = pgTable("system_status_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  severity: text("severity").notNull().default("info"),
  description: text("description"),
  services: text("services").array(),
  updates: jsonb("updates"),
  startedAt: timestamp("started_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Roadmap
export const roadmapItems = pgTable("roadmap_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  status: text("status").notNull().default("planned"),
  priority: text("priority").default("medium"),
  votes: integer("votes").default(0),
  voters: jsonb("voters"),
  eta: text("eta"),
  launchedAt: timestamp("launched_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Agency Directory
export const agencyDirectory = pgTable("agency_directory", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  agencyName: text("agency_name").notNull(),
  description: text("description"),
  website: text("website"),
  logo: text("logo"),
  services: jsonb("services"),
  expertise: jsonb("expertise"),
  location: text("location"),
  clientCount: integer("client_count").default(0),
  projectCount: integer("project_count").default(0),
  avgRating: decimal("avg_rating", { precision: 2, scale: 1 }),
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Educational Partnerships
export const educationalPartnerships = pgTable("educational_partnerships", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  institutionName: text("institution_name").notNull(),
  institutionType: text("institution_type").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  country: text("country"),
  studentCount: integer("student_count"),
  programType: text("program_type"),
  status: text("status").notNull().default("pending"),
  discountRate: decimal("discount_rate", { precision: 5, scale: 2 }),
  discountCode: text("discount_code"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
