import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const databases = pgTable("databases", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  type: text("type", { enum: ["postgresql", "mysql", "redis"] }).default("postgresql").notNull(),
  version: text("version").default("16"),
  status: text("status", { enum: ["creating", "running", "stopped", "failed"] }).default("creating").notNull(),
  host: text("host"),
  port: integer("port").default(5432),
  databaseName: text("database_name"),
  username: text("username"),
  password: text("password"),
  publicAccess: boolean("public_access").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
