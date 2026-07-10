import { pgTable, text, timestamp, uuid, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { organizations } from "./projects";

export const zeroTrustAccess = pgTable("zero_trust_access", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  sessionDuration: text("session_duration").default("24h"),
  policies: jsonb("policies").default([]),
  applications: jsonb("applications").default([]),
  groups: jsonb("groups").default([]),
  serviceTokens: jsonb("service_tokens").default([]),
  sshConfig: jsonb("ssh_config").default({ enabled: false, bastionHost: "" }),
  logs: jsonb("logs").default([]),
  usage: jsonb("usage").default({ totalUsers: 0, activeSessions: 0, totalRequests: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const browserIsolation = pgTable("browser_isolation", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  policies: jsonb("policies").default([]),
  allowedUrls: jsonb("allowed_urls").default([]),
  blockedUrls: jsonb("blocked_urls").default([]),
  clipboardControl: text("clipboard_control").default("read_write"),
  fileUpload: text("file_upload").default("allow"),
  fileDownload: text("file_download").default("allow"),
  keyboardControl: boolean("keyboard_control").default(true),
  printerControl: boolean("printer_control").default(false),
  status: text("status").default("active"),
  analytics: jsonb("analytics").default({ totalSessions: 0, activeSessions: 0, bandwidth: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const casb = pgTable("casb", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  integrations: jsonb("integrations").default([]),
  findings: jsonb("findings").default([]),
  severityCounts: jsonb("severity_counts").default({ critical: 0, high: 0, medium: 0, low: 0 }),
  autoRemediation: boolean("auto_remediation").default(false),
  schedules: jsonb("schedules").default([]),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dataLossPrevention = pgTable("data_loss_prevention", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  profiles: jsonb("profiles").default([]),
  entries: jsonb("entries").default([]),
  matchedEntries: jsonb("matched_entries").default([]),
  rules: jsonb("rules").default([]),
  status: text("status").default("active"),
  analytics: jsonb("analytics").default({ totalMatches: 0, blocked: 0, allowed: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailSecurity = pgTable("email_security", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  domain: text("domain").notNull(),
  quarantine: jsonb("quarantine").default([]),
  settings: jsonb("settings").default({ spamLevel: "standard", malwareProtection: true, phishingProtection: true }),
  dmarc: text("dmarc").default("none"),
  spf: text("spf"),
  dkim: text("dkim"),
  rules: jsonb("rules").default([]),
  analytics: jsonb("analytics").default({ totalEmails: 0, blocked: 0, quarantined: 0, delivered: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const secureWebGateway = pgTable("secure_web_gateway", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  policies: jsonb("policies").default([]),
  categories: jsonb("categories").default([]),
  urlCategories: jsonb("url_categories").default([]),
  rules: jsonb("rules").default([]),
  lists: jsonb("lists").default([]),
  logs: jsonb("logs").default([]),
  analytics: jsonb("analytics").default({ totalRequests: 0, blocked: 0, allowed: 0 }),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const magicMesh = pgTable("magic_mesh", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  network: text("network").notNull(),
  connectors: jsonb("connectors").default([]),
  tunnels: jsonb("tunnels").default([]),
  routes: jsonb("routes").default([]),
  virtualNetworks: jsonb("virtual_networks").default([]),
  devices: jsonb("devices").default([]),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const magicWan = pgTable("magic_wan", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  connectors: jsonb("connectors").default([]),
  tunnels: jsonb("tunnels").default([]),
  ipsecTunnels: jsonb("ipsec_tunnels").default([]),
  greTunnels: jsonb("gre_tunnels").default([]),
  routes: jsonb("routes").default([]),
  staticRoutes: jsonb("static_routes").default([]),
  healthChecks: jsonb("health_checks").default([]),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
