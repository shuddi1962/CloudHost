import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const wordpressSites = pgTable("wordpress_sites", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  domain: text("domain"),
  status: text("status", { enum: ["installing", "running", "stopped", "failed"] }).default("installing").notNull(),
  phpVersion: text("php_version").default("8.2"),
  wpVersion: text("wp_version").default("latest"),
  adminUser: text("admin_user"),
  adminPassword: text("admin_password"),
  adminEmail: text("admin_email"),
  containerPort: integer("container_port").default(8080),
  resourceLimits: text("resource_limits"),
  sslEnabled: boolean("ssl_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
