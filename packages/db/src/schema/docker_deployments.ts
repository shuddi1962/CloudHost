import { pgTable, uuid, text, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";

export const dockerDeployments = pgTable("docker_deployments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  image: text("image"),
  buildType: text("build_type", { enum: ["dockerfile", "buildpack", "image", "git"] }).notNull(),
  source: text("source"),
  framework: text("framework"),
  port: integer("port").default(3000),
  envVars: jsonb("env_vars").default({}),
  volumes: jsonb("volumes").default([]),
  replicas: integer("replicas").default(1),
  status: text("status", { enum: ["deploying", "running", "stopped", "error"] }).default("deploying").notNull(),
  url: text("url"),
  logs: jsonb("logs").default([]),
  resources: jsonb("resources").default({ cpu: "0.5", memory: "512M" }),
  domain: text("domain"),
  sslEnabled: boolean("ssl_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const buildpackDetections = pgTable("buildpack_detections", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  framework: text("framework").notNull(),
  language: text("language").notNull(),
  detectFiles: jsonb("detect_files").notNull(),
  buildCommand: text("build_command"),
  startCommand: text("start_command"),
  defaultPort: integer("default_port"),
  enabled: boolean("enabled").default(true).notNull(),
});
