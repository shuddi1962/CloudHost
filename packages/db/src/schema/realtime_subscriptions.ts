import { pgTable, uuid, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { databases } from "./databases";

export const realtimeSubscriptions = pgTable("realtime_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  databaseId: uuid("database_id").references(() => databases.id).notNull(),
  name: text("name").notNull(),
  tableName: text("table_name").notNull(),
  event: text("event", { enum: ["insert", "update", "delete", "*"] }).default("*").notNull(),
  filter: jsonb("filter").default({}),
  status: text("status", { enum: ["active", "paused", "error"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const realtimeMessages = pgTable("realtime_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  subscriptionId: uuid("subscription_id").references(() => realtimeSubscriptions.id).notNull(),
  event: text("event").notNull(),
  payload: jsonb("payload").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
