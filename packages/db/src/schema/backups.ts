import { pgTable, uuid, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { databases } from "./databases";
import { projects } from "./projects";

export const backups = pgTable("backups", {
  id: uuid("id").defaultRandom().primaryKey(),
  databaseId: uuid("database_id").references(() => databases.id),
  projectId: uuid("project_id").references(() => projects.id),
  name: text("name").notNull(),
  type: text("type", { enum: ["manual", "automated", "scheduled"] }).default("manual").notNull(),
  status: text("status", { enum: ["in_progress", "completed", "failed"] }).default("in_progress").notNull(),
  size: integer("size").default(0),
  filePath: text("file_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const backupSchedules = pgTable("backup_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  databaseId: uuid("database_id").references(() => databases.id).notNull(),
  frequency: text("frequency", { enum: ["daily", "weekly", "monthly"] }).default("daily").notNull(),
  retention: integer("retention").default(7),
  time: text("time").default("02:00"),
  enabled: text("enabled").default("true"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
