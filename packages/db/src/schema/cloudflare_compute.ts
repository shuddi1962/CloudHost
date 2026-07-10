import { pgTable, text, timestamp, uuid, boolean, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { organizations } from "./projects";

export const workerRuntimeEnum = pgEnum("worker_runtime", ["javascript", "typescript", "python", "rust", "wasm"]);
export const workerStatusEnum = pgEnum("worker_status", ["active", "inactive", "deploying", "failed", "deleted"]);
export const durableObjectStatusEnum = pgEnum("durable_object_status", ["active", "inactive", "deleted"]);
export const pagesBuildStatusEnum = pgEnum("pages_build_status", ["queued", "building", "deploying", "deployed", "failed"]);
export const containerStatusEnum = pgEnum("container_status", ["running", "stopped", "deploying", "failed", "deleted"]);
export const cfWorkflowStatusEnum = pgEnum("cf_workflow_status", ["active", "paused", "completed", "failed", "deleted"]);
export const sandboxStatusEnum = pgEnum("sandbox_status", ["running", "stopped", "expired", "failed"]);

export const workers = pgTable("workers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  script: text("script").default("export default { async fetch(request, env, ctx) { return new Response('Hello World!'); } }"),
  runtime: workerRuntimeEnum("runtime").default("javascript"),
  status: workerStatusEnum("status").default("inactive"),
  url: text("url"),
  routes: jsonb("routes").default([]),
  triggers: jsonb("triggers").default([]),
  envVars: jsonb("env_vars").default({}),
  secrets: jsonb("secrets").default({}),
  compatibilityDate: text("compatibility_date").default("2024-01-01"),
  compatibilityFlags: jsonb("compatibility_flags").default([]),
  tailConsumers: jsonb("tail_consumers").default([]),
  observability: jsonb("observability").default({ logs: false, metrics: false, traces: false }),
  migrations: jsonb("migrations").default([]),
  deploymentId: text("deployment_id"),
  logs: jsonb("logs").default([]),
  usage: jsonb("usage").default({ requests: 0, duration: 0, cpuTime: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const durableObjects = pgTable("durable_objects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  workerId: uuid("worker_id").references(() => workers.id),
  name: text("name").notNull(),
  className: text("class_name").notNull(),
  status: durableObjectStatusEnum("status").default("active"),
  storage: jsonb("storage").default({}),
  alarms: jsonb("alarms").default([]),
  migrations: jsonb("migrations").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cloudflarePages = pgTable("cloudflare_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  projectName: text("project_name").notNull(),
  domain: text("domain"),
  customDomains: jsonb("custom_domains").default([]),
  gitProvider: text("git_provider"),
  gitRepo: text("git_repo"),
  gitBranch: text("git_branch"),
  buildCommand: text("build_command").default("npm run build"),
  buildOutputDir: text("build_output_dir").default("dist"),
  rootDir: text("root_dir").default("/"),
  envVars: jsonb("env_vars").default({}),
  compatibilityDate: text("compatibility_date"),
  compatibilityFlags: jsonb("compatibility_flags").default([]),
  deployments: jsonb("deployments").default([]),
  deploymentHistory: jsonb("deployment_history").default([]),
  analytics: jsonb("analytics").default({ visits: 0, bandwidth: 0 }),
  status: text("status").default("inactive"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const containers = pgTable("containers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  tag: text("tag").default("latest"),
  registry: text("registry").default("docker.io"),
  command: text("command"),
  args: jsonb("args").default([]),
  envVars: jsonb("env_vars").default({}),
  secrets: jsonb("secrets").default({}),
  ports: jsonb("ports").default([]),
  volumes: jsonb("volumes").default([]),
  replicas: integer("replicas").default(1),
  resources: jsonb("resources").default({ cpu: "0.5", memory: "512MB" }),
  status: containerStatusEnum("status").default("stopped"),
  url: text("url"),
  region: text("region").default("auto"),
  autoScale: boolean("auto_scale").default(false),
  healthCheck: jsonb("health_check").default({ path: "/health", interval: 30 }),
  logs: jsonb("logs").default([]),
  usage: jsonb("usage").default({ cpu: 0, memory: 0, network: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailService = pgTable("email_service", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  dnsConfigured: boolean("dns_configured").default(false),
  forwardingAddresses: jsonb("forwarding_addresses").default([]),
  catchAllAddress: text("catch_all_address"),
  customAddresses: jsonb("custom_addresses").default([]),
  sendConfig: jsonb("send_config").default({ enabled: false, senderName: "", apiKey: "" }),
  receivedEmails: jsonb("received_emails").default([]),
  sentEmails: jsonb("sent_emails").default([]),
  routingRules: jsonb("routing_rules").default([]),
  usage: jsonb("usage").default({ received: 0, sent: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sandboxes = pgTable("sandboxes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  runtime: text("runtime").default("node:18"),
  code: text("code").default("console.log('hello world');"),
  status: sandboxStatusEnum("status").default("stopped"),
  output: jsonb("output").default([]),
  resources: jsonb("resources").default({ cpu: "0.2", memory: "128MB", timeout: 30 }),
  network: jsonb("network").default({ internet: true, allowedDomains: [] }),
  files: jsonb("files").default([]),
  envVars: jsonb("env_vars").default({}),
  config: jsonb("config").default({}),
  executionHistory: jsonb("execution_history").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workersForPlatforms = pgTable("workers_for_platforms", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  namespace: text("namespace").notNull().unique(),
  description: text("description"),
  dispatchWorkers: jsonb("dispatch_workers").default([]),
  smartPlacement: boolean("smart_placement").default(true),
  bindings: jsonb("bindings").default({ kv: [], r2: [], d1: [], queues: [], services: [] }),
  limits: jsonb("limits").default({ cpuTime: "10ms", memory: "128MB", requestsPerMinute: 1000 }),
  analytics: jsonb("analytics").default({ totalWorkers: 0, activeWorkers: 0, totalRequests: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workerObservability = pgTable("worker_observability", {
  id: uuid("id").defaultRandom().primaryKey(),
  workerId: uuid("worker_id").references(() => workers.id).notNull(),
  logs: jsonb("logs").default([]),
  traces: jsonb("traces").default([]),
  metrics: jsonb("metrics").default({ requests: 0, errors: 0, latency: {}, statusCodes: {} }),
  alerts: jsonb("alerts").default([]),
  dashboards: jsonb("dashboards").default([]),
  retentionDays: integer("retention_days").default(7),
  samplingRate: integer("sampling_rate").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cfWorkflows = pgTable("cf_workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  steps: jsonb("steps").default([]),
  triggers: jsonb("triggers").default([]),
  status: cfWorkflowStatusEnum("status").default("paused"),
  runs: jsonb("runs").default([]),
  runHistory: jsonb("run_history").default([]),
  schedule: text("schedule"),
  concurrency: integer("concurrency").default(1),
  retries: jsonb("retries").default({ maxRetries: 3, backoff: "exponential" }),
  timeout: integer("timeout").default(300),
  envVars: jsonb("env_vars").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
