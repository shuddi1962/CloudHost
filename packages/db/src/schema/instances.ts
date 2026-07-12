import { pgTable, uuid, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const instances = pgTable("instances", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  plan: text("plan").notNull(),
  blueprint: text("blueprint"),
  platform: text("platform"),
  status: text("status").notNull().default("provisioning"),
  providerId: text("provider_id"),
  ipAddress: text("ip_address"),
  privateIp: text("private_ip"),
  cpu: integer("cpu"),
  ramMb: integer("ram_mb"),
  storageGb: integer("storage_gb"),
  transferTb: integer("transfer_tb"),
  priceMonthly: integer("price_monthly"),
  tags: jsonb("tags").default([]),
  provisionedAt: timestamp("provisioned_at"),
  terminatedAt: timestamp("terminated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
