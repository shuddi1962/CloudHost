import { pgTable, uuid, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const edgeFunctions = pgTable("edge_functions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sourceCode: text("source_code").default(`export default async (req: Request) => {\n  return new Response("Hello from Edge!");\n}`),
  runtime: text("runtime", { enum: ["deno", "node"] }).default("deno").notNull(),
  status: text("status", { enum: ["inactive", "active", "error"] }).default("inactive").notNull(),
  url: text("url"),
  environment: jsonb("environment").default({}),
  memory: text("memory").default("256"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const edgeFunctionLogs = pgTable("edge_function_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  functionId: uuid("function_id").references(() => edgeFunctions.id).notNull(),
  message: text("message").notNull(),
  type: text("type", { enum: ["info", "error", "warn"] }).default("info").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
