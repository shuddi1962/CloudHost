import { pgTable, text, timestamp, uuid, boolean, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { organizations } from "./projects";

export const dnsRecordTypeEnum = pgEnum("dns_record_type", ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "NS", "CAA", "DS", "SSHFP", "TLSA", "HTTPS", "SVCB"]);
export const loadBalancingStatusEnum = pgEnum("load_balancing_status", ["active", "inactive", "degraded", "healthy", "unhealthy"]);

export const dnsZones = pgTable("dns_zones", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  status: text("status").default("active"),
  paused: boolean("paused").default(false),
  type: text("type").default("full"),
  nameServers: jsonb("name_servers").default([]),
  originalNameServers: jsonb("original_name_servers").default([]),
  verificationKey: text("verification_key"),
  records: jsonb("records").default([]),
  recordCount: integer("record_count").default(0),
  analytics: jsonb("analytics").default({ dnsQueries: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cfDnsRecords = pgTable("cf_dns_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  zoneId: uuid("zone_id").references(() => dnsZones.id).notNull(),
  type: dnsRecordTypeEnum("type").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  ttl: integer("ttl").default(120),
  priority: integer("priority"),
  proxied: boolean("proxied").default(false),
  proxiable: boolean("proxiable").default(true),
  comment: text("comment"),
  tags: jsonb("tags").default([]),
  createdOn: timestamp("created_on").defaultNow(),
  modifiedOn: timestamp("modified_on").defaultNow(),
});

export const cdnConfig = pgTable("cdn_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  zone: text("zone").notNull(),
  cachingRules: jsonb("caching_rules").default([]),
  cacheLevel: text("cache_level").default("standard"),
  edgeCacheTtl: integer("edge_cache_ttl").default(86400),
  browserCacheTtl: integer("browser_cache_ttl").default(14400),
  purgeHistory: jsonb("purge_history").default([]),
  cacheKeys: jsonb("cache_keys").default({ enabled: true, includeHost: true, includeScheme: true }),
  preloadUrls: jsonb("preload_urls").default([]),
  argoEnabled: boolean("argo_enabled").default(false),
  argoSmartRouting: boolean("argo_smart_routing").default(false),
  tieredCaching: boolean("tiered_caching").default(false),
  usage: jsonb("usage").default({ cachedBytes: 0, bandwidthSaved: 0, hitRate: 0, requests: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const loadBalancers = pgTable("load_balancers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  hostname: text("hostname").notNull(),
  pools: jsonb("pools").default([]),
  monitors: jsonb("monitors").default([]),
  steeringPolicy: text("steering_policy").default("geo"),
  sessionAffinity: text("session_affinity").default("none"),
  ttl: integer("ttl").default(30),
  proxied: boolean("proxied").default(true),
  status: loadBalancingStatusEnum("status").default("active"),
  healthChecks: jsonb("health_checks").default([]),
  usage: jsonb("usage").default({ requests: 0, failovers: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiShield = pgTable("api_shield", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  zone: text("zone").notNull(),
  endpoints: jsonb("endpoints").default([]),
  schemaValidation: boolean("schema_validation").default(false),
  schema: jsonb("schema").default({}),
  mtlsRules: jsonb("mtls_rules").default([]),
  sensitiveDataDetection: boolean("sensitive_data_detection").default(true),
  anomalyDetection: boolean("anomaly_detection").default(true),
  usage: jsonb("usage").default({ totalEndpoints: 0, requests: 0, blockedRequests: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const botManagement = pgTable("bot_management", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  zone: text("zone").notNull(),
  mode: text("mode").default("javascript_detection"),
  rules: jsonb("rules").default([]),
  botScores: jsonb("bot_scores").default([]),
  analytics: jsonb("analytics").default({ totalRequests: 0, automatedRequests: 0, verifiedBots: 0 }),
  customRulesets: jsonb("custom_rulesets").default([]),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const spectrumApps = pgTable("spectrum_apps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  protocol: text("protocol").default("tcp"),
  originDns: text("origin_dns"),
  originPort: integer("origin_port").default(80),
  proxyPorts: jsonb("proxy_ports").default([]),
  ipFirewall: boolean("ip_firewall").default(true),
  proxyProtocol: text("proxy_protocol").default("off"),
  tls: text("tls").default("off"),
  trafficType: text("traffic_type").default("direct"),
  edgeIps: jsonb("edge_ips").default({ type: "dynamic" }),
  dns: jsonb("dns").default({ type: "CNAME", name: "" }),
  usage: jsonb("usage").default({ bandwidth: 0, connections: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const waitingRoom = pgTable("waiting_room", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  hostname: text("hostname").notNull(),
  path: text("path").default("/"),
  totalActiveUsers: integer("total_active_users").default(200),
  newUserPerMinute: integer("new_user_per_minute").default(10),
  queueingMethod: text("queueing_method").default("fifo"),
  sessionDuration: integer("session_duration").default(5),
  sessionRenewalEnabled: boolean("session_renewal_enabled").default(true),
  cookieSuffix: text("cookie_suffix"),
  customPageHtml: text("custom_page_html"),
  defaultTemplateLanguage: text("default_template_language").default("en-US"),
  jsonResponseEnabled: boolean("json_response_enabled").default(false),
  status: text("status").default("active"),
  analytics: jsonb("analytics").default({ totalUsers: 0, queuedUsers: 0, waitedUsers: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailRouting = pgTable("email_routing", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  domain: text("domain").notNull(),
  enabled: boolean("enabled").default(true),
  catchAll: text("catch_all"),
  rules: jsonb("rules").default([]),
  addresses: jsonb("addresses").default([]),
  dnsRecords: jsonb("dns_records").default([]),
  analytics: jsonb("analytics").default({ totalReceived: 0, totalForwarded: 0, totalRejected: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const logExplorer = pgTable("log_explorer", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  dataset: text("dataset").default("http_requests"),
  queries: jsonb("queries").default([]),
  savedQueries: jsonb("saved_queries").default([]),
  dashboards: jsonb("dashboards").default([]),
  retentionDays: integer("retention_days").default(7),
  sampling: integer("sampling").default(100),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const networkInterconnect = pgTable("network_interconnect", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").default("private"),
  facility: text("facility"),
  vlan: integer("vlan"),
  ipAddress: text("ip_address"),
  bgpConfig: jsonb("bgp_config").default({ localAsn: 0, peerAsn: 0, multihop: false }),
  bandwidth: integer("bandwidth").default(1000),
  description: text("description"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
