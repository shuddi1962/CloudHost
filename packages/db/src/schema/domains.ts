import { pgTable, uuid, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { organizations } from "./users";

export const domains = pgTable("domains", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  name: text("name").notNull().unique(),
  verified: boolean("verified").default(false),
  sslEnabled: boolean("ssl_enabled").default(false),
  dnsRecords: jsonb("dns_records").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dnsRecords = pgTable("dns_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  domainId: uuid("domain_id").references(() => domains.id).notNull(),
  type: text("type", { enum: ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV"] }).notNull(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  ttl: text("ttl").default("3600"),
  priority: text("priority"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
