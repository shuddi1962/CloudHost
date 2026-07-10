import { pgTable, uuid, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const hostingAccounts = pgTable("hosting_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  status: text("status", { enum: ["pending", "active", "suspended", "terminated"] }).default("pending").notNull(),
  package: text("package").default("free"),
  diskQuota: integer("disk_quota").default(1024),
  diskUsed: integer("disk_used").default(0),
  bandwidthQuota: integer("bandwidth_quota").default(10240),
  bandwidthUsed: integer("bandwidth_used").default(0),
  phpVersion: text("php_version").default("8.2"),
  serverIp: text("server_ip"),
  nameservers: jsonb("nameservers").default(["ns1.cloudhost.app", "ns2.cloudhost.app"]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cronJobs = pgTable("cron_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostingAccountId: uuid("hosting_account_id").references(() => hostingAccounts.id).notNull(),
  command: text("command").notNull(),
  schedule: text("schedule").notNull(),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
  lastRunAt: timestamp("last_run_at"),
  lastOutput: text("last_output"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ftpAccounts = pgTable("ftp_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostingAccountId: uuid("hosting_account_id").references(() => hostingAccounts.id).notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  directory: text("directory").default("/"),
  permissions: text("permissions", { enum: ["read", "read_write", "full"] }).default("read_write").notNull(),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const phpSettings = pgTable("php_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  hostingAccountId: uuid("hosting_account_id").references(() => hostingAccounts.id).notNull(),
  version: text("version").default("8.2").notNull(),
  memoryLimit: text("memory_limit").default("256M"),
  maxUploadSize: text("max_upload_size").default("64M"),
  maxExecutionTime: text("max_execution_time").default("120"),
  extensions: jsonb("extensions").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
