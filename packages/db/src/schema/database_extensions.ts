import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { databases } from "./databases";

export const databaseExtensions = pgTable("database_extensions", {
  id: uuid("id").defaultRandom().primaryKey(),
  databaseId: uuid("database_id").references(() => databases.id).notNull(),
  name: text("name").notNull(),
  version: text("version"),
  enabled: boolean("enabled").default(false).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
