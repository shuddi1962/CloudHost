import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, workersAi, aiModels, vectorizeIndexes, aiGateway, aiSearch, aiAgents } from "@cloudhost/db";

export const cloudflareAiRouter = new Hono();

const jwtPayload = (c: any) => c.get("jwtPayload") as { sub: string };

const seedModels = [
  { name: "@cf/meta/llama-3.1-8b-instruct", provider: "cloudflare", category: "text-generation", description: "Meta Llama 3.1 8B instruction-tuned model", maxTokens: 8192, pricing: { perRequest: 0, perToken: 0.00001 }, capabilities: ["chat", "completion", "function-calling"] },
  { name: "@cf/meta/llama-3.1-70b-instruct", provider: "cloudflare", category: "text-generation", description: "Meta Llama 3.1 70B instruction-tuned model", maxTokens: 8192, pricing: { perRequest: 0, perToken: 0.00005 }, capabilities: ["chat", "completion", "function-calling"] },
  { name: "@cf/mistral/mistral-7b-instruct-v0.3", provider: "cloudflare", category: "text-generation", description: "Mistral 7B instruction-tuned model", maxTokens: 8192, pricing: { perRequest: 0, perToken: 0.000008 }, capabilities: ["chat", "completion"] },
  { name: "@hf/google/gemma-2b-it", provider: "huggingface", category: "text-generation", description: "Google Gemma 2B instruction-tuned model", maxTokens: 4096, pricing: { perRequest: 0, perToken: 0.000003 }, capabilities: ["chat", "completion"] },
  { name: "@cf/stabilityai/stable-diffusion-xl-base-1.0", provider: "cloudflare", category: "image-generation", description: "Stable Diffusion XL for text-to-image", maxTokens: 0, pricing: { perRequest: 0.002, perToken: 0 }, capabilities: ["text-to-image"] },
  { name: "@cf/baai/bge-base-en-v1.5", provider: "cloudflare", category: "embeddings", description: "BAAI general embedding model", maxTokens: 512, pricing: { perRequest: 0, perToken: 0.000001 }, capabilities: ["embeddings"] },
  { name: "@cf/openai/whisper-large-v3", provider: "cloudflare", category: "audio", description: "OpenAI Whisper for speech-to-text", maxTokens: 0, pricing: { perRequest: 0.01, perToken: 0 }, capabilities: ["speech-to-text"] },
  { name: "@cf/meta/llama-3.2-11b-vision-instruct", provider: "cloudflare", category: "vision", description: "Llama 3.2 11B vision model", maxTokens: 4096, pricing: { perRequest: 0, perToken: 0.00002 }, capabilities: ["image-understanding", "chat"] },
];

// AI Models catalog
cloudflareAiRouter.get("/models", async (c) => {
  const existing = await db.select().from(aiModels).limit(1);
  if (existing.length === 0) {
    for (const m of seedModels) await db.insert(aiModels).values(m as any);
  }
  const all = await db.select().from(aiModels);
  return c.json({ models: all });
});

cloudflareAiRouter.get("/models/:id", async (c) => {
  const [item] = await db.select().from(aiModels).where(eq(aiModels.id, c.req.param("id"))).limit(1);
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json({ model: item });
});

// Workers AI inference
cloudflareAiRouter.post("/inference", async (c) => {
  const body = await c.req.json();
  const prompt = body.prompt || "Hello!";
  const modelName = body.model || "@cf/meta/llama-3.1-8b-instruct";
  const inferenceResult = { model: modelName, response: `Echo: ${prompt}. This is a simulated AI inference response.`, tokensUsed: prompt.length, latency: Math.floor(Math.random() * 500 + 100) };

  const existing = await db.select().from(workersAi).where(eq(workersAi.userId, jwtPayload(c).sub)).limit(1);
  if (existing.length > 0) {
    const history = [...(existing[0].inferenceHistory as any[] || []), { ...inferenceResult, timestamp: new Date().toISOString() }];
    const usage = { totalRequests: ((existing[0].usage as any)?.totalRequests || 0) + 1, totalTokens: ((existing[0].usage as any)?.totalTokens || 0) + inferenceResult.tokensUsed, totalCost: ((existing[0].usage as any)?.totalCost || 0) + 0.0001 };
    await db.update(workersAi).set({ inferenceHistory: history, usage, updatedAt: new Date() }).where(eq(workersAi.id, existing[0].id));
  } else {
    await db.insert(workersAi).values({ userId: jwtPayload(c).sub, inferenceHistory: [{ ...inferenceResult, timestamp: new Date().toISOString() }], usage: { totalRequests: 1, totalTokens: inferenceResult.tokensUsed, totalCost: 0.0001 } });
  }
  return c.json(inferenceResult);
});

cloudflareAiRouter.get("/inference-history", async (c) => {
  const existing = await db.select().from(workersAi).where(eq(workersAi.userId, jwtPayload(c).sub)).limit(1);
  return c.json({ history: existing[0]?.inferenceHistory || [], usage: existing[0]?.usage || {} });
});

// Vectorize
cloudflareAiRouter.get("/vectorize", async (c) => {
  const list = await db.select().from(vectorizeIndexes).where(eq(vectorizeIndexes.userId, jwtPayload(c).sub));
  return c.json({ indexes: list });
});

cloudflareAiRouter.post("/vectorize", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(vectorizeIndexes).values({
    userId: jwtPayload(c).sub, name: body.name, description: body.description,
    dimensions: body.dimensions, metric: body.metric, config: body.config,
  }).returning();
  return c.json({ index: created }, 201);
});

cloudflareAiRouter.post("/vectorize/:id/query", async (c) => {
  const body = await c.req.json();
  const [idx] = await db.select().from(vectorizeIndexes).where(eq(vectorizeIndexes.id, c.req.param("id"))).limit(1);
  if (!idx) return c.json({ error: "Not found" }, 404);
  const matches = (idx.vectors as any[] || []).slice(0, body.topK || 10).map((v: any) => ({ ...v, score: Math.random() }));
  await db.update(vectorizeIndexes).set({ usage: { queries: ((idx.usage as any)?.queries || 0) + 1, vectorsInserted: (idx.usage as any)?.vectorsInserted || 0, storage: (idx.usage as any)?.storage || 0 }, updatedAt: new Date() }).where(eq(vectorizeIndexes.id, c.req.param("id")));
  return c.json({ matches, count: matches.length });
});

cloudflareAiRouter.post("/vectorize/:id/vectors", async (c) => {
  const body = await c.req.json();
  const [idx] = await db.select().from(vectorizeIndexes).where(eq(vectorizeIndexes.id, c.req.param("id"))).limit(1);
  if (!idx) return c.json({ error: "Not found" }, 404);
  const newVectors = (body.vectors || []).map((v: any, i: number) => ({ id: `vec-${Date.now()}-${i}`, values: v.values, metadata: v.metadata }));
  const vectors = [...(idx.vectors as any[] || []), ...newVectors];
  const [updated] = await db.update(vectorizeIndexes).set({ vectors, vectorCount: vectors.length, updatedAt: new Date() }).where(eq(vectorizeIndexes.id, c.req.param("id"))).returning();
  return c.json({ index: updated, inserted: newVectors.length });
});

cloudflareAiRouter.delete("/vectorize/:id", async (c) => {
  await db.delete(vectorizeIndexes).where(eq(vectorizeIndexes.id, c.req.param("id")));
  return c.json({ success: true });
});

// AI Gateway
cloudflareAiRouter.get("/gateway", async (c) => {
  const list = await db.select().from(aiGateway).where(eq(aiGateway.userId, jwtPayload(c).sub));
  return c.json({ gateways: list });
});

cloudflareAiRouter.post("/gateway", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(aiGateway).values({
    userId: jwtPayload(c).sub, name: body.name, provider: body.provider,
    endpoint: body.endpoint, cacheConfig: body.cacheConfig, rateLimits: body.rateLimits,
    fallbackProviders: body.fallbackProviders,
  }).returning();
  return c.json({ gateway: created }, 201);
});

cloudflareAiRouter.put("/gateway/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(aiGateway).set({ ...body, updatedAt: new Date() }).where(eq(aiGateway.id, c.req.param("id"))).returning();
  return c.json({ gateway: updated });
});

cloudflareAiRouter.post("/gateway/:id/proxy", async (c) => {
  const body = await c.req.json();
  const simulatedResponse = { id: "chatcmpl-" + Date.now(), object: "chat.completion", choices: [{ message: { role: "assistant", content: `Simulated AI response via gateway to: ${body.model || "gpt-4"}` } }], usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 } };
  const [gw] = await db.select().from(aiGateway).where(eq(aiGateway.id, c.req.param("id"))).limit(1);
  if (!gw) return c.json({ error: "Gateway not found" }, 404);
  const logs = [...(gw.logs as any[] || []), { model: body.model, timestamp: new Date().toISOString(), tokens: 30, cached: false }];
  const analytics = { totalRequests: ((gw.analytics as any)?.totalRequests || 0) + 1, cachedResponses: (gw.analytics as any)?.cachedResponses || 0, tokensSaved: (gw.analytics as any)?.tokensSaved || 0, costSaved: (gw.analytics as any)?.costSaved || 0 };
  await db.update(aiGateway).set({ logs, analytics, updatedAt: new Date() }).where(eq(aiGateway.id, c.req.param("id")));
  return c.json(simulatedResponse);
});

cloudflareAiRouter.delete("/gateway/:id", async (c) => {
  await db.update(aiGateway).set({ status: "deleted", updatedAt: new Date() }).where(eq(aiGateway.id, c.req.param("id")));
  return c.json({ success: true });
});

// AI Search
cloudflareAiRouter.get("/search", async (c) => {
  const list = await db.select().from(aiSearch).where(eq(aiSearch.userId, jwtPayload(c).sub));
  return c.json({ searches: list });
});

cloudflareAiRouter.post("/search", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(aiSearch).values({
    userId: jwtPayload(c).sub, name: body.name, config: body.config,
  }).returning();
  return c.json({ search: created }, 201);
});

cloudflareAiRouter.post("/search/:id/index", async (c) => {
  const body = await c.req.json();
  const [sr] = await db.select().from(aiSearch).where(eq(aiSearch.id, c.req.param("id"))).limit(1);
  if (!sr) return c.json({ error: "Not found" }, 404);
  const newDoc = { id: `doc-${Date.now()}`, content: body.content, metadata: body.metadata, indexedAt: new Date().toISOString() };
  const documents = [...(sr.documents as any[] || []), newDoc];
  const indexes = [...(sr.indexes as any[] || []), { name: `index-${(sr.indexes as any[])?.length || 0 + 1}`, status: "ready", docCount: (sr.indexes as any[])?.length || 0 + 1 }];
  const [updated] = await db.update(aiSearch).set({ documents, indexes, updatedAt: new Date() }).where(eq(aiSearch.id, c.req.param("id"))).returning();
  return c.json({ search: updated });
});

cloudflareAiRouter.post("/search/:id/query", async (c) => {
  const body = await c.req.json();
  const [sr] = await db.select().from(aiSearch).where(eq(aiSearch.id, c.req.param("id"))).limit(1);
  if (!sr) return c.json({ error: "Not found" }, 404);
  const results = (sr.documents as any[] || []).slice(0, body.limit || 5).map((d: any) => ({ ...d, score: Math.random().toFixed(4) }));
  const searchHistory = [...(sr.searchHistory as any[] || []), { query: body.query, results: results.length, timestamp: new Date().toISOString() }];
  await db.update(aiSearch).set({ searchHistory, updatedAt: new Date() }).where(eq(aiSearch.id, c.req.param("id")));
  return c.json({ results, total: results.length });
});

cloudflareAiRouter.delete("/search/:id", async (c) => {
  await db.delete(aiSearch).where(eq(aiSearch.id, c.req.param("id")));
  return c.json({ success: true });
});

// AI Agents
cloudflareAiRouter.get("/agents", async (c) => {
  const list = await db.select().from(aiAgents).where(eq(aiAgents.userId, jwtPayload(c).sub));
  return c.json({ agents: list });
});

cloudflareAiRouter.post("/agents", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(aiAgents).values({
    userId: jwtPayload(c).sub, name: body.name, description: body.description,
    model: body.model, systemPrompt: body.systemPrompt, tools: body.tools,
    knowledge: body.knowledge, memory: body.memory, config: body.config, webhookUrl: body.webhookUrl,
  }).returning();
  return c.json({ agent: created }, 201);
});

cloudflareAiRouter.post("/agents/:id/chat", async (c) => {
  const body = await c.req.json();
  const [agent] = await db.select().from(aiAgents).where(eq(aiAgents.id, c.req.param("id"))).limit(1);
  if (!agent) return c.json({ error: "Not found" }, 404);
  const response = `Simulated response from ${agent.name}: I received "${body.message || "hello"}". This is an AI agent running on Cloudflare Workers.`;
  const sessions = [...(agent.sessions as any[] || [])];
  const currentSession = sessions[sessions.length - 1] || { id: `session-${Date.now()}`, messages: [] };
  currentSession.messages.push({ role: "user", content: body.message || "hello" }, { role: "assistant", content: response });
  const runs = [...(agent.runs as any[] || []), { id: `run-${Date.now()}`, status: "completed", input: body.message, output: response, timestamp: new Date().toISOString() }];
  await db.update(aiAgents).set({ sessions: currentSession.messages.length > (agent.memory as any)?.maxMessages ? [currentSession] : [...sessions.slice(0, -1), currentSession], runs, status: "completed", updatedAt: new Date() }).where(eq(aiAgents.id, c.req.param("id")));
  return c.json({ response, agent: { ...agent, sessions: [currentSession] } });
});

cloudflareAiRouter.put("/agents/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(aiAgents).set({ ...body, updatedAt: new Date() }).where(eq(aiAgents.id, c.req.param("id"))).returning();
  return c.json({ agent: updated });
});

cloudflareAiRouter.delete("/agents/:id", async (c) => {
  await db.delete(aiAgents).where(eq(aiAgents.id, c.req.param("id")));
  return c.json({ success: true });
});
