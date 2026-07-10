import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { users } from "./users";

// Domain Transfers
export const domainTransfers = pgTable("domain_transfers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  status: text("status").notNull().default("pending"),
  authCode: text("auth_code"),
  transferLock: boolean("transfer_lock").default(true),
  privacyEnabled: boolean("privacy_enabled").default(true),
  years: integer("years").default(1),
  price: decimal("price", { precision: 10, scale: 2 }),
  initiatedAt: timestamp("initiated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Domain Marketplace (Buy/Sell)
export const domainMarketplace = pgTable("domain_marketplace", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  listingType: text("listing_type").notNull().default("fixed"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  status: text("status").notNull().default("active"),
  category: text("category"),
  description: text("description"),
  views: integer("views").default(0),
  watchers: integer("watchers").default(0),
  makeOffer: boolean("make_offer").default(false),
  minOffer: decimal("min_offer", { precision: 10, scale: 2 }),
  listedAt: timestamp("listed_at").defaultNow(),
  soldAt: timestamp("sold_at"),
  buyerId: uuid("buyer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketplaceOffers = pgTable("marketplace_offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id").references(() => domainMarketplace.id).notNull(),
  buyerId: uuid("buyer_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Whois Lookup History
export const whoisLookups = pgTable("whois_lookups", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  registrar: text("registrar"),
  creationDate: timestamp("creation_date"),
  expiryDate: timestamp("expiry_date"),
  nameServers: text("name_servers").array(),
  registrantName: text("registrant_name"),
  registrantOrg: text("registrant_org"),
  registrantEmail: text("registrant_email"),
  registrantCountry: text("registrant_country"),
  adminName: text("admin_name"),
  adminEmail: text("admin_email"),
  techName: text("tech_name"),
  techEmail: text("tech_email"),
  dnssec: boolean("dnssec").default(false),
  status: text("status").array(),
  rawData: jsonb("raw_data"),
  lookedUpAt: timestamp("looked_up_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// TLD Catalog
export const tldCatalog = pgTable("tld_catalog", {
  id: uuid("id").defaultRandom().primaryKey(),
  tld: text("tld").notNull().unique(),
  category: text("category"),
  description: text("description"),
  registrationPrice: decimal("registration_price", { precision: 10, scale: 2 }).notNull(),
  renewalPrice: decimal("renewal_price", { precision: 10, scale: 2 }).notNull(),
  transferPrice: decimal("transfer_price", { precision: 10, scale: 2 }),
  isNew: boolean("is_new").default(false),
  isPromo: boolean("is_promo").default(false),
  promoPrice: decimal("promo_price", { precision: 10, scale: 2 }),
  minYears: integer("min_years").default(1),
  maxYears: integer("max_years").default(10),
  requiresDnssec: boolean("requires_dnssec").default(false),
  requiresAuthCode: boolean("requires_auth_code").default(true),
  popular: boolean("popular").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Handshake Domains (Blockchain)
export const handshakeDomains = pgTable("handshake_domains", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  status: text("status").notNull().default("pending"),
  blockchainTx: text("blockchain_tx"),
  registrationPeriod: integer("registration_period").default(1),
  price: decimal("price", { precision: 10, scale: 2 }),
  nameserver: text("nameserver"),
  walletAddress: text("wallet_address"),
  signature: text("signature"),
  expiresAt: timestamp("expires_at"),
  registeredAt: timestamp("registered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Domain Privacy
export const domainPrivacy = pgTable("domain_privacy", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domainId: uuid("domain_id"),
  domain: text("domain").notNull(),
  status: text("status").notNull().default("active"),
  privacyType: text("privacy_type").notNull().default("whois"),
  maskedEmail: text("masked_email"),
  maskedPhone: text("masked_phone"),
  autoRenew: boolean("auto_renew").default(true),
  price: decimal("price", { precision: 10, scale: 2 }),
  enabledAt: timestamp("enabled_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Domain Vault
export const domainVault = pgTable("domain_vault", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  status: text("status").notNull().default("locked"),
  vaultLevel: text("vault_level").notNull().default("standard"),
  transferLock: boolean("transfer_lock").default(true),
  deleteLock: boolean("delete_lock").default(true),
  updateLock: boolean("update_lock").default(true),
  authCodeProtection: boolean("auth_code_protection").default(true),
  approvalsRequired: integer("approvals_required").default(1),
  trustedContacts: jsonb("trusted_contacts"),
  unlockRequestedAt: timestamp("unlock_requested_at"),
  unlockApprovedAt: timestamp("unlock_approved_at"),
  unlockReason: text("unlock_reason"),
  lockedAt: timestamp("locked_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Premium DNS
export const premiumDns = pgTable("premium_dns", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  plan: text("plan").notNull().default("basic"),
  status: text("status").notNull().default("active"),
  dnssec: boolean("dnssec").default(false),
  ddosProtection: boolean("ddos_protection").default(false),
  analytics: boolean("analytics").default(false),
  geoDns: boolean("geo_dns").default(false),
  templateManagement: boolean("template_management").default(false),
  recordCount: integer("record_count").default(0),
  queryCount: integer("query_count").default(0),
  price: decimal("price", { precision: 10, scale: 2 }),
  activatedAt: timestamp("activated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Free DNS
export const freeDns = pgTable("free_dns", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  status: text("status").notNull().default("active"),
  nameservers: text("nameservers").array(),
  recordCount: integer("record_count").default(0),
  queryLimit: integer("query_limit").default(500000),
  queryUsage: integer("query_usage").default(0),
  activatedAt: timestamp("activated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
