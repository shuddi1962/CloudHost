import { pgTable, uuid, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { organizations } from "./users";

export const emailAccounts = pgTable("email_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  domainId: uuid("domain_id"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  quota: integer("quota").default(1024),
  forwardTo: text("forward_to"),
  autoresponder: text("autoresponder"),
  status: text("status", { enum: ["active", "disabled"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
