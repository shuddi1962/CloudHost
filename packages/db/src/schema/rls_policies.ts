import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { databases } from "./databases";

export const rlsPolicies = pgTable("rls_policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  databaseId: uuid("database_id").references(() => databases.id).notNull(),
  tableName: text("table_name").notNull(),
  name: text("name").notNull(),
  definition: text("definition").notNull(),
  policyType: text("policy_type", { enum: ["select", "insert", "update", "delete", "all"] }).default("all").notNull(),
  role: text("role").default("authenticated"),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
