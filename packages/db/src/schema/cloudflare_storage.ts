import { pgTable, text, timestamp, uuid, boolean, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { organizations } from "./projects";

export const bucketVisibilityEnum = pgEnum("bucket_visibility", ["public", "private"]);
export const d1StatusEnum = pgEnum("d1_status", ["active", "deleted", "creating", "error"]);
export const queueTypeEnum = pgEnum("queue_type", ["fifo", "standard"]);
export const hyperdriveStatusEnum = pgEnum("hyperdrive_status", ["connected", "disconnected", "error"]);

export const r2Buckets = pgTable("r2_buckets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  providerId: text("provider_id"),
  description: text("description"),
  visibility: bucketVisibilityEnum("visibility").default("private"),
  region: text("region").default("auto"),
  objects: jsonb("objects").default([]),
  objectCount: integer("object_count").default(0),
  totalSize: integer("total_size").default(0),
  lifecycleRules: jsonb("lifecycle_rules").default([]),
  corsRules: jsonb("cors_rules").default([]),
  customDomains: jsonb("custom_domains").default([]),
  r2Policies: jsonb("r2_policies").default([]),
  publicUrl: text("public_url"),
  usage: jsonb("usage").default({ requests: 0, bandwidth: 0, storage: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const r2Objects = pgTable("r2_objects", {
  id: uuid("id").defaultRandom().primaryKey(),
  bucketId: uuid("bucket_id").references(() => r2Buckets.id).notNull(),
  key: text("key").notNull(),
  size: integer("size").notNull(),
  contentType: text("content_type"),
  etag: text("etag"),
  storageClass: text("storage_class").default("standard"),
  metadata: jsonb("metadata").default({}),
  versions: jsonb("versions").default([]),
  isPublic: boolean("is_public").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const d1Databases = pgTable("d1_databases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  providerId: text("provider_id"),
  status: d1StatusEnum("status").default("active"),
  version: text("version").default("1.0"),
  region: text("region").default("auto"),
  queries: jsonb("queries").default([]),
  migrations: jsonb("migrations").default([]),
  tables: jsonb("tables").default([]),
  bindings: jsonb("bindings").default([]),
  backupSchedule: text("backup_schedule"),
  backups: jsonb("backups").default([]),
  usage: jsonb("usage").default({ reads: 0, writes: 0, storage: 0, rows: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kvNamespaces = pgTable("kv_namespaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  title: text("title").notNull(),
  providerId: text("provider_id"),
  description: text("description"),
  keys: jsonb("keys").default([]),
  keyCount: integer("key_count").default(0),
  totalSize: integer("total_size").default(0),
  bindings: jsonb("bindings").default([]),
  metadata: jsonb("metadata").default({}),
  usage: jsonb("usage").default({ reads: 0, writes: 0, deletes: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kvEntries = pgTable("kv_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  namespaceId: uuid("namespace_id").references(() => kvNamespaces.id).notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  metadata: jsonb("metadata").default({}),
  expirationTtl: integer("expiration_ttl"),
  expiration: timestamp("expiration"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const queues = pgTable("queues", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  type: queueTypeEnum("type").default("standard"),
  consumers: jsonb("consumers").default([]),
  producers: jsonb("producers").default([]),
  messages: jsonb("messages").default([]),
  messageCount: integer("message_count").default(0),
  maxRetries: integer("max_retries").default(3),
  maxConcurrency: integer("max_concurrency").default(10),
  retentionPeriod: integer("retention_period").default(86400),
  deliveryDelay: integer("delivery_delay").default(0),
  usage: jsonb("usage").default({ published: 0, delivered: 0, acknowledged: 0, retried: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const hyperdriveDatabases = pgTable("hyperdrive_databases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  connectionString: text("connection_string"),
  originHost: text("origin_host"),
  originPort: integer("origin_port").default(5432),
  originDatabase: text("origin_database"),
  originUser: text("origin_user"),
  cachedConnections: integer("cached_connections").default(50),
  maxAge: integer("max_age").default(300),
  status: hyperdriveStatusEnum("status").default("disconnected"),
  poolSize: integer("pool_size").default(10),
  latency: jsonb("latency").default({ average: 0, p50: 0, p95: 0, p99: 0 }),
  queries: jsonb("queries").default([]),
  usage: jsonb("usage").default({ queries: 0, cacheHits: 0, cacheMisses: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cacheReserve = pgTable("cache_reserve", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  zone: text("zone").notNull(),
  enabled: boolean("enabled").default(false),
  tieredCache: boolean("tiered_cache").default(false),
  cacheRules: jsonb("cache_rules").default([]),
  purgeHistory: jsonb("purge_history").default([]),
  usage: jsonb("usage").default({ cachedBytes: 0, bandwidthSaved: 0, hitRate: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const artifacts = pgTable("artifacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  store: jsonb("store").default({ type: "r2", bucket: "", prefix: "" }),
  versions: jsonb("versions").default([]),
  retentionPolicy: jsonb("retention_policy").default({ maxVersions: 10, daysToLive: 90 }),
  accessControl: jsonb("access_control").default({ public: false, allowedUsers: [] }),
  usage: jsonb("usage").default({ totalVersions: 0, totalSize: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dataPlatform = pgTable("data_platform", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  source: jsonb("source").default({ type: "r2", bucket: "", prefix: "" }),
  schema: jsonb("schema").default({ fields: [], partitions: [] }),
  pipelines: jsonb("pipelines").default([]),
  transforms: jsonb("transforms").default([]),
  catalog: jsonb("catalog").default({ tables: [], views: [], materializedViews: [] }),
  queries: jsonb("queries").default([]),
  schedules: jsonb("schedules").default([]),
  usage: jsonb("usage").default({ ingested: 0, queried: 0, storage: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
