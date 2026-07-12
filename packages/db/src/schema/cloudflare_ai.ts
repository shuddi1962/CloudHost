import { pgTable, text, timestamp, uuid, boolean, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { organizations } from "./projects";

export const aiModelStatusEnum = pgEnum("ai_model_status", ["available", "deprecated", "beta"]);
export const aiGatewayStatusEnum = pgEnum("ai_gateway_status", ["active", "paused", "deleted"]);
export const agentStatusEnum = pgEnum("agent_status", ["idle", "running", "paused", "error", "completed"]);

export const workersAi = pgTable("workers_ai", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  models: jsonb("models").default([]),
  favoriteModels: jsonb("favorite_models").default([]),
  customModels: jsonb("custom_models").default([]),
  inferenceHistory: jsonb("inference_history").default([]),
  batchJobs: jsonb("batch_jobs").default([]),
  usage: jsonb("usage").default({ totalRequests: 0, totalTokens: 0, totalCost: 0 }),
  rateLimits: jsonb("rate_limits").default({ requestsPerMinute: 100, tokensPerMinute: 100000 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiModels = pgTable("ai_models", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").default("cloudflare"),
  category: text("category").notNull(),
  description: text("description"),
  status: aiModelStatusEnum("status").default("available"),
  maxTokens: integer("max_tokens").default(8192),
  pricing: jsonb("pricing").default({ perRequest: 0, perToken: 0 }),
  capabilities: jsonb("capabilities").default([]),
  supportedLanguages: jsonb("supported_languages").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vectorizeIndexes = pgTable("vectorize_indexes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  description: text("description"),
  dimensions: integer("dimensions").default(768),
  metric: text("metric").default("cosine"),
  vectors: jsonb("vectors").default([]),
  vectorCount: integer("vector_count").default(0),
  providerId: text("provider_id"),
  config: jsonb("config").default({ similarity: "cosine", quantization: "fp32" }),
  usage: jsonb("usage").default({ queries: 0, vectorsInserted: 0, storage: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiGateway = pgTable("ai_gateway", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  provider: text("provider").default("openai"),
  endpoint: text("endpoint"),
  apiKey: text("api_key"),
  status: aiGatewayStatusEnum("status").default("active"),
  cacheConfig: jsonb("cache_config").default({ enabled: true, ttl: 3600 }),
  rateLimits: jsonb("rate_limits").default({ requestsPerMinute: 60, tokensPerMinute: 60000 }),
  logs: jsonb("logs").default([]),
  analytics: jsonb("analytics").default({ totalRequests: 0, cachedResponses: 0, tokensSaved: 0, costSaved: 0 }),
  fallbackProviders: jsonb("fallback_providers").default([]),
  providerId: text("provider_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiSearch = pgTable("ai_search", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  indexes: jsonb("indexes").default([]),
  documents: jsonb("documents").default([]),
  searchHistory: jsonb("search_history").default([]),
  config: jsonb("config").default({ chunkSize: 512, chunkOverlap: 64, embeddingModel: "@cf/baai/bge-base-en-v1.5" }),
  providerId: text("provider_id"),
  usage: jsonb("usage").default({ searches: 0, documentsIndexed: 0, storage: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiAgents = pgTable("ai_agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  name: text("name").notNull(),
  description: text("description"),
  model: text("model").default("@cf/meta/llama-3.1-8b-instruct"),
  systemPrompt: text("system_prompt").default("You are a helpful AI assistant."),
  tools: jsonb("tools").default([]),
  knowledge: jsonb("knowledge").default({ sources: [], vectorIndexId: "" }),
  memory: jsonb("memory").default({ type: "conversation", maxMessages: 50 }),
  status: agentStatusEnum("status").default("idle"),
  sessions: jsonb("sessions").default([]),
  runs: jsonb("runs").default([]),
  config: jsonb("config").default({ maxTokens: 2048, temperature: 0.7, topP: 0.9 }),
  webhookUrl: text("webhook_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
