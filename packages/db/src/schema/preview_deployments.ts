import { pgTable, uuid, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { deployments } from "./deployments";

export const previewDeployments = pgTable("preview_deployments", {
  id: uuid("id").defaultRandom().primaryKey(),
  deploymentId: uuid("deployment_id").references(() => deployments.id).notNull(),
  branchName: text("branch_name").notNull(),
  commitSha: text("commit_sha"),
  commitMessage: text("commit_message"),
  previewUrl: text("preview_url"),
  status: text("status", { enum: ["building", "ready", "failed", "expired"] }).default("building").notNull(),
  logs: jsonb("logs").default([]),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
