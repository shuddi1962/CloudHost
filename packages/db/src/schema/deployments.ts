import { pgTable, uuid, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const deployments = pgTable("deployments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  gitRepository: text("git_repository"),
  gitBranch: text("git_branch").default("main"),
  buildCommand: text("build_command").default("npm run build"),
  outputDirectory: text("output_directory").default(".next"),
  installCommand: text("install_command").default("npm ci"),
  environment: jsonb("environment").default({}),
  framework: text("framework", { enum: ["nextjs", "static", "node"] }).default("nextjs").notNull(),
  status: text("status", { enum: ["pending", "building", "deploying", "running", "stopped", "failed"] }).default("pending").notNull(),
  domain: text("domain"),
  containerPort: integer("container_port").default(3000),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deploymentLogs = pgTable("deployment_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  deploymentId: uuid("deployment_id").references(() => deployments.id).notNull(),
  message: text("message").notNull(),
  type: text("type", { enum: ["info", "error", "warn"] }).default("info").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
