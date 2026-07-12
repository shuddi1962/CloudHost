import { pgTable, uuid, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const containerServices = pgTable("container_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  nodeSize: text("node_size").notNull(),
  nodeCount: integer("node_count").default(1).notNull(),
  status: text("status").notNull().default("provisioning"),
  providerId: text("provider_id"),
  image: text("image"),
  ports: jsonb("ports").default([]),
  envVars: jsonb("env_vars").default({}),
  autoDeploy: boolean("auto_deploy").default(true),
  ipAddress: text("ip_address"),
  domain: text("domain"),
  provisionedAt: timestamp("provisioned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
