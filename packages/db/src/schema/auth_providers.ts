import { pgTable, uuid, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const authProviders = pgTable("auth_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  provider: text("provider", {
    enum: ["google", "github", "gitlab", "bitbucket", "facebook", "twitter", "apple", "discord", "slack", "microsoft", "linkedin", "saml", "oidc"]
  }).notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  clientId: text("client_id"),
  clientSecret: text("client_secret"),
  redirectUrl: text("redirect_url"),
  additionalConfig: jsonb("additional_config").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const socialLogins = pgTable("social_logins", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  provider: text("provider").notNull(),
  providerUserId: text("provider_user_id").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
