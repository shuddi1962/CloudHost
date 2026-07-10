import { pgTable, text, timestamp, uuid, boolean, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { organizations } from "./projects";

export const wafActionEnum = pgEnum("waf_action", ["block", "challenge", "js_challenge", "managed_challenge", "log", "allow", "bypass"]);
export const wafStatusEnum = pgEnum("waf_status", ["active", "inactive", "paused", "deleted"]);
export const sslTypeEnum = pgEnum("ssl_type", ["universal", "custom", "advanced", "keyless"]);

export const wafRules = pgTable("waf_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  description: text("description"),
  action: wafActionEnum("action").default("block"),
  status: wafStatusEnum("status").default("active"),
  expression: text("expression").default("true"),
  priority: integer("priority").default(1),
  group: text("group").default("custom"),
  ref: text("ref"),
  logging: jsonb("logging").default({ enabled: true }),
  ruleset: text("ruleset"),
  category: text("category"),
  hits: integer("hits").default(0),
  lastHit: timestamp("last_hit"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ddosProtection = pgTable("ddos_protection", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  mode: text("mode").default("automatic"),
  rules: jsonb("rules").default([]),
  thresholds: jsonb("thresholds").default({ requestsPerSecond: 1000, burstSize: 2000 }),
  alerts: jsonb("alerts").default({ email: true, webhook: false }),
  trafficAnomalies: jsonb("traffic_anomalies").default([]),
  mitigationHistory: jsonb("mitigation_history").default([]),
  attackLogs: jsonb("attack_logs").default([]),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const magicTransit = pgTable("magic_transit", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  tunnels: jsonb("tunnels").default([]),
  routes: jsonb("routes").default([]),
  greTunnels: jsonb("gre_tunnels").default([]),
  ipsecTunnels: jsonb("ipsec_tunnels").default([]),
  staticRoutes: jsonb("static_routes").default([]),
  healthChecks: jsonb("health_checks").default([]),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const networkFirewall = pgTable("network_firewall", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  rules: jsonb("rules").default([]),
  lists: jsonb("lists").default([]),
  ipLists: jsonb("ip_lists").default([]),
  geoRules: jsonb("geo_rules").default([]),
  packetFilters: jsonb("packet_filters").default([]),
  logs: jsonb("logs").default([]),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rateLimiting = pgTable("rate_limiting", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  description: text("description"),
  thresholds: jsonb("thresholds").default({ requestsPerPeriod: 100, period: 60 }),
  action: text("action").default("block"),
  expression: text("expression").default("true"),
  countingExpression: text("counting_expression"),
  mitigationTimeout: integer("mitigation_timeout").default(60),
  status: text("status").default("active"),
  hits: integer("hits").default(0),
  blocked: integer("blocked").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sslCertificates = pgTable("ssl_certificates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  hostname: text("hostname").notNull(),
  type: sslTypeEnum("type").default("universal"),
  status: text("status").default("pending"),
  issuer: text("issuer"),
  signature: text("signature"),
  serialNumber: text("serial_number"),
  fingerprint: text("fingerprint"),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  keylessServer: jsonb("keyless_server").default({}),
  customCertificate: text("custom_certificate"),
  privateKey: text("private_key"),
  bundleMethod: text("bundle_method").default("compatible"),
  geoRestrictions: jsonb("geo_restrictions").default({}),
  settings: jsonb("settings").default({ alwaysUseHttps: true, minTlsVersion: "1.2" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const turnstile = pgTable("turnstile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  siteKey: text("site_key").notNull(),
  secretKey: text("secret_key").notNull(),
  mode: text("mode").default("invisible"),
  status: text("status").default("active"),
  settings: jsonb("settings").default({ preClearance: false, verifyOnIdle: false }),
  analytics: jsonb("analytics").default({ totalPassed: 0, totalFailed: 0, totalChallenges: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientSideSecurity = pgTable("client_side_security", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  policies: jsonb("policies").default([]),
  scripts: jsonb("scripts").default([]),
  alerts: jsonb("alerts").default([]),
  reports: jsonb("reports").default([]),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
