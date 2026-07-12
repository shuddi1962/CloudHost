import { pgTable, uuid, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

export const metrics = pgTable("metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  resourceType: text("resource_type").notNull(),
  resourceId: uuid("resource_id").notNull(),
  data: jsonb("data").default({}),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export type Metric = typeof metrics.$inferSelect;
export type NewMetric = typeof metrics.$inferInsert;
