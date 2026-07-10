import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { users } from "./users";

// SSL Certificates Catalog
export const sslCatalog = pgTable("ssl_catalog", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull().default("Comodo"),
  type: text("type").notNull(),
  validation: text("validation").notNull(),
  domains: text("domains").notNull().default("1"),
  warranty: text("warranty"),
  encryption: text("encryption").default("256-bit"),
  issuanceTime: text("issuance_time"),
  reissueFree: boolean("reissue_free").default(true),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  regularPrice: decimal("regular_price", { precision: 10, scale: 2 }),
  popular: boolean("popular").default(false),
  features: jsonb("features"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSslCertificates = pgTable("user_ssl_certificates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  catalogId: uuid("catalog_id").references(() => sslCatalog.id),
  domain: text("domain").notNull(),
  brand: text("brand").notNull().default("Comodo"),
  type: text("type").notNull(),
  validation: text("validation").notNull(),
  status: text("status").notNull().default("pending"),
  csr: text("csr"),
  certificate: text("certificate"),
  privateKey: text("private_key"),
  caBundle: text("ca_bundle"),
  expiresAt: timestamp("expires_at"),
  autoRenew: boolean("auto_renew").default(true),
  price: decimal("price", { precision: 10, scale: 2 }),
  orderDate: timestamp("order_date").defaultNow(),
  issuedAt: timestamp("issued_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Promos & Coupons
export const promoCodes = pgTable("promo_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: text("discount_type").notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minPurchase: decimal("min_purchase", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0),
  appliesTo: jsonb("applies_to"),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userPromos = pgTable("user_promos", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  promoId: uuid("promo_id").references(() => promoCodes.id),
  code: text("code").notNull(),
  usedAt: timestamp("used_at").defaultNow(),
  orderAmount: decimal("order_amount", { precision: 10, scale: 2 }),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
});

// Knowledgebase / Help Center
export const knowledgebaseArticles = pgTable("knowledgebase_articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  content: text("content"),
  excerpt: text("excerpt"),
  authorId: uuid("author_id").references(() => users.id),
  tags: text("tags").array(),
  views: integer("views").default(0),
  helpful: integer("helpful").default(0),
  notHelpful: integer("not_helpful").default(0),
  isVideo: boolean("is_video").default(false),
  videoUrl: text("video_url"),
  videoDuration: text("video_duration"),
  published: boolean("published").default(true),
  featured: boolean("featured").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  category: text("category"),
  priority: text("priority").default("normal"),
  status: text("status").notNull().default("open"),
  messages: jsonb("messages"),
  assignedTo: uuid("assigned_to"),
  orderId: text("order_id"),
  relatedService: text("related_service"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Marketing Tools - Relate Suite
export const relateSeo = pgTable("relate_seo", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  keywords: jsonb("keywords"),
  keywordCount: integer("keyword_count").default(0),
  backlinks: integer("backlinks").default(0),
  domainAuthority: integer("domain_authority").default(0),
  pageAuthority: integer("page_authority").default(0),
  organicTraffic: integer("organic_traffic").default(0),
  crawlErrors: integer("crawl_errors").default(0),
  indexPages: integer("index_pages").default(0),
  competitors: jsonb("competitors"),
  recommendations: jsonb("recommendations"),
  lastCrawled: timestamp("last_crawled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relateSocial = pgTable("relate_social", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(),
  accountName: text("account_name"),
  posts: integer("posts").default(0),
  followers: integer("followers").default(0),
  following: integer("following").default(0),
  engagement: decimal("engagement", { precision: 5, scale: 2 }).default("0"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  lastPosted: timestamp("last_posted"),
  connected: boolean("connected").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relateReviews = pgTable("relate_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  reviewCount: integer("review_count").default(0),
  totalRating: decimal("total_rating", { precision: 3, scale: 1 }),
  responseRate: integer("response_rate").default(0),
  avgResponseTime: text("avg_response_time"),
  sentiment: text("sentiment"),
  recentReviews: jsonb("recent_reviews"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relateAds = pgTable("relate_ads", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  campaignName: text("campaign_name").notNull(),
  platform: text("platform").notNull(),
  status: text("status").notNull().default("draft"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  ctr: decimal("ctr", { precision: 5, scale: 2 }),
  targetAudience: jsonb("target_audience"),
  adContent: jsonb("ad_content"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relateLocal = pgTable("relate_local", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  businessName: text("business_name").notNull(),
  category: text("category"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  phone: text("phone"),
  website: text("website"),
  listings: jsonb("listings"),
  listingCount: integer("listing_count").default(0),
  citationCount: integer("citation_count").default(0),
  ratingCount: integer("rating_count").default(0),
  avgRating: decimal("avg_rating", { precision: 2, scale: 1 }),
  accuracyScore: integer("accuracy_score").default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const relateBrandMonitoring = pgTable("relate_brand_monitoring", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  brandName: text("brand_name").notNull(),
  mentions: integer("mentions").default(0),
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 1 }),
  topSources: jsonb("top_sources"),
  recentMentions: jsonb("recent_mentions"),
  competitors: jsonb("competitors"),
  alerts: jsonb("alerts"),
  lastScanned: timestamp("last_scanned"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Creative Tools
export const siteMakerProjects = pgTable("site_maker_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  template: text("template"),
  industry: text("industry"),
  pages: jsonb("pages"),
  theme: jsonb("theme"),
  customDomain: text("custom_domain"),
  publishedUrl: text("published_url"),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const logoMakerProjects = pgTable("logo_maker_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  brandName: text("brand_name").notNull(),
  industry: text("industry"),
  style: text("style"),
  colors: jsonb("colors"),
  fonts: jsonb("fonts"),
  svgUrl: text("svg_url"),
  pngUrl: text("png_url"),
  variants: jsonb("variants"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fontMakerProjects = pgTable("font_maker_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  style: text("style"),
  glyphs: jsonb("glyphs"),
  preview: text("preview"),
  fontUrl: text("font_url"),
  formats: text("formats").array(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const businessNames = pgTable("business_names", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  industry: text("industry").notNull(),
  keywords: text("keywords").array(),
  generatedNames: jsonb("generated_names"),
  saved: boolean("saved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessCardProjects = pgTable("business_card_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  design: jsonb("design"),
  colors: jsonb("colors"),
  fonts: jsonb("fonts"),
  frontUrl: text("front_url"),
  backUrl: text("back_url"),
  format: text("format").default("digital"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Business Starter Kit
export const businessStarterKits = pgTable("business_starter_kits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  kitType: text("kit_type").notNull(),
  businessName: text("business_name"),
  businessType: text("business_type"),
  llcState: text("llc_state"),
  llcStatus: text("llc_status").default("pending"),
  einNumber: text("ein_number"),
  einStatus: text("ein_status").default("pending"),
  operatingAgreement: text("operating_agreement"),
  bankAccountSetup: boolean("bank_account_setup").default(false),
  domainIncluded: boolean("domain_included").default(true),
  emailIncluded: boolean("email_included").default(true),
  hostingIncluded: boolean("hosting_included").default(true),
  status: text("status").notNull().default("pending"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Affiliates
export const affiliates = pgTable("affiliates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  referralCode: text("referral_code").notNull().unique(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10"),
  totalEarned: decimal("total_earned", { precision: 12, scale: 2 }).default("0"),
  totalPaid: decimal("total_paid", { precision: 12, scale: 2 }).default("0"),
  pendingBalance: decimal("pending_balance", { precision: 12, scale: 2 }).default("0"),
  referralCount: integer("referral_count").default(0),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default("0"),
  paymentMethod: text("payment_method"),
  paymentEmail: text("payment_email"),
  promotedServices: jsonb("promoted_services"),
  status: text("status").notNull().default("active"),
  joinedAt: timestamp("joined_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const affiliateReferrals = pgTable("affiliate_referrals", {
  id: uuid("id").defaultRandom().primaryKey(),
  affiliateId: uuid("affiliate_id").references(() => affiliates.id).notNull(),
  referredEmail: text("referred_email").notNull(),
  referredUserId: uuid("referred_user_id").references(() => users.id),
  status: text("status").notNull().default("pending"),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0"),
  orderAmount: decimal("order_amount", { precision: 10, scale: 2 }),
  serviceType: text("service_type"),
  signedUpAt: timestamp("signed_up_at"),
  convertedAt: timestamp("converted_at"),
  commissionPaidAt: timestamp("commission_paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Report Abuse
export const abuseReports = pgTable("abuse_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterName: text("reporter_name").notNull(),
  reporterEmail: text("reporter_email").notNull(),
  reportType: text("report_type").notNull(),
  domain: text("domain"),
  ipAddress: text("ip_address"),
  description: text("description").notNull(),
  evidence: jsonb("evidence"),
  status: text("status").notNull().default("pending"),
  assignedTo: uuid("assigned_to"),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
