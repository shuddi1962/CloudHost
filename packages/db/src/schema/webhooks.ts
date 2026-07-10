import { pgTable, uuid, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { databases } from "./databases";

export const databaseWebhooks = pgTable("database_webhooks", {
  id: uuid("id").defaultRandom().primaryKey(),
  databaseId: uuid("database_id").references(() => databases.id).notNull(),
  name: text("name").notNull(),
  tableName: text("table_name").notNull(),
  events: text("events", { enum: ["insert", "update", "delete", "*"] }).default("*").notNull(),
  url: text("url").notNull(),
  headers: jsonb("headers").default({}),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const webhookLogs = pgTable("webhook_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  webhookId: uuid("webhook_id").references(() => databaseWebhooks.id).notNull(),
  eventTriggered: text("event_triggered").notNull(),
  statusCode: text("status_code"),
  responseBody: text("response_body"),
  success: boolean("success").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
