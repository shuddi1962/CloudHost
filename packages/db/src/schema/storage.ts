import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const buckets = pgTable("buckets", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  public: boolean("public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storageObjects = pgTable("storage_objects", {
  id: uuid("id").defaultRandom().primaryKey(),
  bucketId: uuid("bucket_id").references(() => buckets.id).notNull(),
  name: text("name").notNull(),
  size: integer("size").default(0).notNull(),
  mimeType: text("mime_type").default("application/octet-stream"),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
