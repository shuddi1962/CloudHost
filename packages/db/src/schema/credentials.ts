import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const credentials = pgTable("credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  type: text("type", { enum: ["oauth2", "api_key", "basic_auth", "database", "custom"] }).notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
