import { pgTable, uuid, text, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { hostingAccounts } from "./hosting_accounts";

export const marketplaceApps = pgTable("marketplace_apps", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  category: text("category", { enum: ["cms", "ecommerce", "blog", "forum", "wiki", "analytics", "crm", "devtools", "media", "social", "learning", "finance", "other"] }).notNull(),
  icon: text("icon"),
  version: text("version").notNull(),
  framework: text("framework").notNull(),
  installType: text("install_type", { enum: ["docker", "php", "node", "python", "static", "ruby", "go", "java"] }).notNull(),
  dockerImage: text("docker_image"),
  sourceUrl: text("source_url"),
  defaultPort: integer("default_port").default(80),
  envVars: jsonb("env_vars").default([]),
  requirements: jsonb("requirements").default({}),
  enabled: boolean("enabled").default(true).notNull(),
  installs: integer("installs").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appInstallations = pgTable("app_installations", {
  id: uuid("id").defaultRandom().primaryKey(),
  appId: uuid("app_id").references(() => marketplaceApps.id).notNull(),
  hostingAccountId: uuid("hosting_account_id").references(() => hostingAccounts.id).notNull(),
  domain: text("domain").notNull(),
  status: text("status", { enum: ["installing", "running", "error"] }).default("installing").notNull(),
  version: text("version").notNull(),
  adminUrl: text("admin_url"),
  adminUser: text("admin_user"),
  adminPassword: text("admin_password"),
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
