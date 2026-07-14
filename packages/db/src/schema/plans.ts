import { pgTable, uuid, text, timestamp, boolean, jsonb, decimal } from "drizzle-orm/pg-core";

export const planCategory = {
  instance: "instance",
  container: "container",
  database: "database",
  storage: "storage",
  domain: "domain",
  ssl_addon: "ssl_addon",
  deployment: "deployment",
  vpn: "vpn",
} as const;

export type PlanCategory = (typeof planCategory)[keyof typeof planCategory];

export const providerEnum = ["digitalocean", "cloudflare", "internal"] as const;
export type Provider = (typeof providerEnum)[number];

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: text("category", {
    enum: Object.values(planCategory) as [string, ...string[]],
  }).notNull(),
  planName: text("plan_name").notNull(),
  provider: text("provider", { enum: providerEnum }).notNull(),
  providerRef: text("provider_ref").notNull(),
  providerCostUsd: decimal("provider_cost_usd", { precision: 10, scale: 4 }).notNull(),
  yourPriceUsd: decimal("your_price_usd", { precision: 10, scale: 2 }).notNull(),
  yourPriceNgn: decimal("your_price_ngn", { precision: 12, scale: 2 }),
  specs: jsonb("specs").default({}).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
