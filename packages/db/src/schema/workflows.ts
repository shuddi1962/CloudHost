import { pgTable, uuid, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const workflows = pgTable("workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  nodes: jsonb("nodes").default([]),
  connections: jsonb("connections").default({}),
  settings: jsonb("settings").default({}),
  status: text("status", { enum: ["inactive", "active", "error"] }).default("inactive").notNull(),
  webhookUrl: text("webhook_url"),
  errorCount: text("error_count").default("0"),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflowExecutions = pgTable("workflow_executions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id").references(() => workflows.id).notNull(),
  status: text("status", { enum: ["running", "success", "error"] }).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
  error: text("error"),
  output: jsonb("output"),
});
