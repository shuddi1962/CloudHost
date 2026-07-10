import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import {
  db, workers, durableObjects, cloudflarePages, containers, emailService,
  sandboxes, workersForPlatforms, workerObservability, cfWorkflows
} from "@cloudhost/db";

export const cloudflareComputeRouter = new Hono();

const jwtPayload = (c: any) => c.get("jwtPayload") as { sub: string };

// Workers
cloudflareComputeRouter.get("/workers", async (c) => {
  const list = await db.select().from(workers).where(eq(workers.userId, jwtPayload(c).sub));
  return c.json({ workers: list });
});

cloudflareComputeRouter.post("/workers", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(workers).values({
    userId: jwtPayload(c).sub, name: body.name, script: body.script,
    runtime: body.runtime, routes: body.routes, triggers: body.triggers,
    envVars: body.envVars, compatibilityDate: body.compatibilityDate,
  }).returning();
  return c.json({ worker: created }, 201);
});

cloudflareComputeRouter.get("/workers/:id", async (c) => {
  const [item] = await db.select().from(workers).where(eq(workers.id, c.req.param("id"))).limit(1);
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json({ worker: item });
});

cloudflareComputeRouter.put("/workers/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(workers).set({ ...body, updatedAt: new Date() }).where(eq(workers.id, c.req.param("id"))).returning();
  return c.json({ worker: updated });
});

cloudflareComputeRouter.post("/workers/:id/deploy", async (c) => {
  const [updated] = await db.update(workers).set({
    status: "deploying", deploymentId: `deploy-${Date.now()}`, logs: [{ time: new Date().toISOString(), message: "Deploying worker..." }], updatedAt: new Date(),
  }).where(eq(workers.id, c.req.param("id"))).returning();
  setTimeout(async () => {
    await db.update(workers).set({ status: "active", url: `https://${updated?.name || "worker"}.${jwtPayload(c).sub}.workers.dev`, updatedAt: new Date() }).where(eq(workers.id, c.req.param("id")));
  }, 2000);
  return c.json({ worker: updated });
});

cloudflareComputeRouter.post("/workers/:id/toggle", async (c) => {
  const [worker] = await db.select().from(workers).where(eq(workers.id, c.req.param("id"))).limit(1);
  if (!worker) return c.json({ error: "Not found" }, 404);
  const newStatus = worker.status === "active" ? "inactive" : "active";
  const [updated] = await db.update(workers).set({ status: newStatus, updatedAt: new Date() }).where(eq(workers.id, c.req.param("id"))).returning();
  return c.json({ worker: updated });
});

cloudflareComputeRouter.delete("/workers/:id", async (c) => {
  await db.update(workers).set({ status: "deleted", updatedAt: new Date() }).where(eq(workers.id, c.req.param("id")));
  return c.json({ success: true });
});

// Durable Objects
cloudflareComputeRouter.get("/durable-objects", async (c) => {
  const list = await db.select().from(durableObjects).where(eq(durableObjects.userId, jwtPayload(c).sub));
  return c.json({ durableObjects: list });
});

cloudflareComputeRouter.post("/durable-objects", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(durableObjects).values({
    userId: jwtPayload(c).sub, workerId: body.workerId, name: body.name, className: body.className,
  }).returning();
  return c.json({ durableObject: created }, 201);
});

cloudflareComputeRouter.put("/durable-objects/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(durableObjects).set({ ...body, updatedAt: new Date() }).where(eq(durableObjects.id, c.req.param("id"))).returning();
  return c.json({ durableObject: updated });
});

cloudflareComputeRouter.delete("/durable-objects/:id", async (c) => {
  await db.update(durableObjects).set({ status: "deleted", updatedAt: new Date() }).where(eq(durableObjects.id, c.req.param("id")));
  return c.json({ success: true });
});

// Cloudflare Pages
cloudflareComputeRouter.get("/pages", async (c) => {
  const list = await db.select().from(cloudflarePages).where(eq(cloudflarePages.userId, jwtPayload(c).sub));
  return c.json({ pages: list });
});

cloudflareComputeRouter.post("/pages", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(cloudflarePages).values({
    userId: jwtPayload(c).sub, name: body.name, projectName: body.projectName,
    domain: body.domain, gitProvider: body.gitProvider, gitRepo: body.gitRepo,
    buildCommand: body.buildCommand, buildOutputDir: body.buildOutputDir,
    envVars: body.envVars,
  }).returning();
  return c.json({ page: created }, 201);
});

cloudflareComputeRouter.post("/pages/:id/deploy", async (c) => {
  const body = await c.req.json();
  const [page] = await db.select().from(cloudflarePages).where(eq(cloudflarePages.id, c.req.param("id"))).limit(1);
  if (!page) return c.json({ error: "Not found" }, 404);
  const newDeploy = { id: `deploy-${Date.now()}`, branch: body.branch || "main", status: "building", timestamp: new Date().toISOString(), commit: body.commit || "" };
  const deploys = [...(page.deployments as any[] || []), newDeploy];
  const [updated] = await db.update(cloudflarePages).set({ deployments: deploys, status: "building", updatedAt: new Date() }).where(eq(cloudflarePages.id, c.req.param("id"))).returning();
  setTimeout(async () => {
    await db.update(cloudflarePages).set({ status: "active", updatedAt: new Date() }).where(eq(cloudflarePages.id, c.req.param("id")));
  }, 3000);
  return c.json({ page: updated });
});

cloudflareComputeRouter.get("/pages/:id", async (c) => {
  const [item] = await db.select().from(cloudflarePages).where(eq(cloudflarePages.id, c.req.param("id"))).limit(1);
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json({ page: item });
});

cloudflareComputeRouter.delete("/pages/:id", async (c) => {
  await db.delete(cloudflarePages).where(eq(cloudflarePages.id, c.req.param("id")));
  return c.json({ success: true });
});

// Containers
cloudflareComputeRouter.get("/containers", async (c) => {
  const list = await db.select().from(containers).where(eq(containers.userId, jwtPayload(c).sub));
  return c.json({ containers: list });
});

cloudflareComputeRouter.post("/containers", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(containers).values({
    userId: jwtPayload(c).sub, name: body.name, image: body.image, tag: body.tag,
    registry: body.registry, command: body.command, ports: body.ports, envVars: body.envVars,
    resources: body.resources, replicas: body.replicas, region: body.region,
  }).returning();
  return c.json({ container: created }, 201);
});

cloudflareComputeRouter.post("/containers/:id/start", async (c) => {
  const [updated] = await db.update(containers).set({ status: "running", logs: [{ time: new Date().toISOString(), message: "Container starting..." }], updatedAt: new Date() }).where(eq(containers.id, c.req.param("id"))).returning();
  return c.json({ container: updated });
});

cloudflareComputeRouter.post("/containers/:id/stop", async (c) => {
  const [updated] = await db.update(containers).set({ status: "stopped", updatedAt: new Date() }).where(eq(containers.id, c.req.param("id"))).returning();
  return c.json({ container: updated });
});

cloudflareComputeRouter.delete("/containers/:id", async (c) => {
  await db.update(containers).set({ status: "deleted", updatedAt: new Date() }).where(eq(containers.id, c.req.param("id")));
  return c.json({ success: true });
});

// Email Service
cloudflareComputeRouter.get("/email", async (c) => {
  const list = await db.select().from(emailService).where(eq(emailService.userId, jwtPayload(c).sub));
  return c.json({ emailServices: list });
});

cloudflareComputeRouter.post("/email", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(emailService).values({
    userId: jwtPayload(c).sub, domain: body.domain, forwardingAddresses: body.forwardingAddresses,
    customAddresses: body.customAddresses, sendConfig: body.sendConfig, routingRules: body.routingRules,
  }).returning();
  return c.json({ emailService: created }, 201);
});

cloudflareComputeRouter.put("/email/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(emailService).set({ ...body, updatedAt: new Date() }).where(eq(emailService.id, c.req.param("id"))).returning();
  return c.json({ emailService: updated });
});

cloudflareComputeRouter.delete("/email/:id", async (c) => {
  await db.delete(emailService).where(eq(emailService.id, c.req.param("id")));
  return c.json({ success: true });
});

// Sandboxes
cloudflareComputeRouter.get("/sandboxes", async (c) => {
  const list = await db.select().from(sandboxes).where(eq(sandboxes.userId, jwtPayload(c).sub));
  return c.json({ sandboxes: list });
});

cloudflareComputeRouter.post("/sandboxes", async (c) => {
  const body = await c.req.json();
  const expiresAt = new Date(Date.now() + (body.ttl || 3600) * 1000);
  const [created] = await db.insert(sandboxes).values({
    userId: jwtPayload(c).sub, name: body.name, runtime: body.runtime, code: body.code,
    resources: body.resources, network: body.network, envVars: body.envVars, expiresAt,
  }).returning();
  return c.json({ sandbox: created }, 201);
});

cloudflareComputeRouter.post("/sandboxes/:id/execute", async (c) => {
  const body = await c.req.json();
  const output = [
    { time: new Date().toISOString(), type: "info", text: `Sandbox [${body.runtime || "node:18"}] executing...` },
    { time: new Date().toISOString(), type: "output", text: body.code ? `> ${body.code.split("\n").pop()}` : "> Hello from sandbox!" },
    { time: new Date().toISOString(), type: "info", text: "Execution completed in 0.042s" },
  ];
  const [updated] = await db.update(sandboxes).set({ status: "running", output, executionHistory: [{ executedAt: new Date().toISOString(), status: "success" }], updatedAt: new Date() }).where(eq(sandboxes.id, c.req.param("id"))).returning();
  return c.json({ sandbox: updated });
});

cloudflareComputeRouter.post("/sandboxes/:id/stop", async (c) => {
  const [updated] = await db.update(sandboxes).set({ status: "stopped", updatedAt: new Date() }).where(eq(sandboxes.id, c.req.param("id"))).returning();
  return c.json({ sandbox: updated });
});

cloudflareComputeRouter.delete("/sandboxes/:id", async (c) => {
  await db.delete(sandboxes).where(eq(sandboxes.id, c.req.param("id")));
  return c.json({ success: true });
});

// Workers for Platforms
cloudflareComputeRouter.get("/platforms", async (c) => {
  const list = await db.select().from(workersForPlatforms).where(eq(workersForPlatforms.userId, jwtPayload(c).sub));
  return c.json({ platforms: list });
});

cloudflareComputeRouter.post("/platforms", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(workersForPlatforms).values({
    userId: jwtPayload(c).sub, namespace: body.namespace, description: body.description,
    smartPlacement: body.smartPlacement, bindings: body.bindings, limits: body.limits,
  }).returning();
  return c.json({ platform: created }, 201);
});

cloudflareComputeRouter.put("/platforms/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(workersForPlatforms).set({ ...body, updatedAt: new Date() }).where(eq(workersForPlatforms.id, c.req.param("id"))).returning();
  return c.json({ platform: updated });
});

cloudflareComputeRouter.delete("/platforms/:id", async (c) => {
  await db.delete(workersForPlatforms).where(eq(workersForPlatforms.id, c.req.param("id")));
  return c.json({ success: true });
});

// Worker Observability
cloudflareComputeRouter.get("/observability/:workerId", async (c) => {
  const [item] = await db.select().from(workerObservability).where(eq(workerObservability.workerId, c.req.param("workerId"))).limit(1);
  if (!item) return c.json({ observability: { logs: [], traces: [], metrics: {}, alerts: [], dashboards: [] } });
  return c.json({ observability: item });
});

cloudflareComputeRouter.post("/observability/:workerId/logs", async (c) => {
  const body = await c.req.json();
  const existing = await db.select().from(workerObservability).where(eq(workerObservability.workerId, c.req.param("workerId"))).limit(1);
  if (existing.length > 0) {
    const logs = [...(existing[0].logs as any[] || []), { time: new Date().toISOString(), ...body }];
    const [updated] = await db.update(workerObservability).set({ logs, updatedAt: new Date() }).where(eq(workerObservability.id, existing[0].id)).returning();
    return c.json({ observability: updated });
  }
  const [created] = await db.insert(workerObservability).values({ workerId: c.req.param("workerId"), logs: [{ time: new Date().toISOString(), ...body }] }).returning();
  return c.json({ observability: created }, 201);
});

// CF Workflows
cloudflareComputeRouter.get("/cf-workflows", async (c) => {
  const list = await db.select().from(cfWorkflows).where(eq(cfWorkflows.userId, jwtPayload(c).sub));
  return c.json({ workflows: list });
});

cloudflareComputeRouter.post("/cf-workflows", async (c) => {
  const body = await c.req.json();
  const [created] = await db.insert(cfWorkflows).values({
    userId: jwtPayload(c).sub, name: body.name, description: body.description,
    steps: body.steps, triggers: body.triggers, schedule: body.schedule,
    concurrency: body.concurrency, retries: body.retries, timeout: body.timeout,
  }).returning();
  return c.json({ workflow: created }, 201);
});

cloudflareComputeRouter.post("/cf-workflows/:id/trigger", async (c) => {
  const newRun = { id: `run-${Date.now()}`, status: "running", startedAt: new Date().toISOString(), steps: [] };
  const [wf] = await db.select().from(cfWorkflows).where(eq(cfWorkflows.id, c.req.param("id"))).limit(1);
  if (!wf) return c.json({ error: "Not found" }, 404);
  const runs = [...(wf.runs as any[] || []), newRun];
  const [updated] = await db.update(cfWorkflows).set({ runs, status: "active", updatedAt: new Date() }).where(eq(cfWorkflows.id, c.req.param("id"))).returning();
  return c.json({ workflow: updated });
});

cloudflareComputeRouter.post("/cf-workflows/:id/pause", async (c) => {
  const [updated] = await db.update(cfWorkflows).set({ status: "paused", updatedAt: new Date() }).where(eq(cfWorkflows.id, c.req.param("id"))).returning();
  return c.json({ workflow: updated });
});

cloudflareComputeRouter.delete("/cf-workflows/:id", async (c) => {
  await db.update(cfWorkflows).set({ status: "deleted", updatedAt: new Date() }).where(eq(cfWorkflows.id, c.req.param("id")));
  return c.json({ success: true });
});
