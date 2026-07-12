import { db, workflows, workflowExecutions } from "@cloudhost/db";
import { eq } from "drizzle-orm";
import { createServer } from "http";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import vm from "vm";
import cron from "node-cron";

const WORKFLOW_PORT = parseInt(process.env.WORKFLOW_PORT || "4001");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

console.log("[Workflow] Workflow execution service starting");

const webhookRoutes = new Map<string, string>();

interface NodeData {
  id: string;
  type: string;
  config: Record<string, any>;
}

interface WorkflowData {
  nodes: NodeData[];
  connections: Record<string, string[]>;
}

function getInputData(nodeId: string, connections: Record<string, string[]>, results: Record<string, any>, nodes: NodeData[]): any {
  const upstreamIds = Object.entries(connections)
    .filter(([_, targets]) => targets.includes(nodeId))
    .map(([from]) => from);

  if (upstreamIds.length === 0) return {};

  const upstream = nodes.find(n => n.id === upstreamIds[0]);
  return results[upstreamIds[0]] || {};
}

function resolveTemplate(template: string, data: any): string {
  return template.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
    try {
      const keys = expr.trim().split(".");
      let val: any = data;
      for (const key of keys) {
        if (key === "$json") continue;
        val = val?.[key];
      }
      return val !== undefined ? String(val) : "";
    } catch {
      return "";
    }
  });
}

const NODE_HANDLERS: Record<string, (node: NodeData, data: any, connections: Record<string, string[]>, nodes: NodeData[]) => Promise<any>> = {
  webhook: async (node, data) => data,

  schedule: async (node) => ({ triggered: true, at: new Date().toISOString(), config: node.config }),

  "http-request": async (node) => {
    const url = node.config.url;
    if (!url) throw new Error("HTTP node: URL is required");
    const method = (node.config.method || "GET").toUpperCase();
    const headers: Record<string, string> = node.config.headers || {};
    const body = node.config.body;

    const options: RequestInit = { method, headers };
    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      options.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const responseBody = await response.text();
    let parsedBody: any;
    try {
      parsedBody = JSON.parse(responseBody);
    } catch {
      parsedBody = responseBody;
    }

    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: parsedBody,
    };
  },

  email: async (node) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;
    if (!SMTP_HOST) throw new Error("Email node: SMTP not configured");

    const to = node.config.to;
    const subject = node.config.subject || "Workflow Notification";
    const text = node.config.text || node.config.message || "";

    if (!to) throw new Error("Email node: 'to' address is required");

    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || "587"),
      secure: SMTP_PORT === "465",
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: FROM_EMAIL || "noreply@cloudhost.local",
      to,
      subject,
      text,
    });

    return { sent: true, to, subject };
  },

  database: async (node) => {
    const query = node.config.query;
    if (!query) throw new Error("Database node: query is required");

    const { db: drizzleDb } = await import("@cloudhost/db");
    const { sql } = await import("drizzle-orm");
    const result = await drizzleDb.execute(sql.raw(query));
    return { query, rowCount: result.length || 0, rows: result };
  },

  slack: async (node) => {
    const webhookUrl = node.config.webhookUrl;
    if (!webhookUrl) throw new Error("Slack node: webhook URL required");

    const message = node.config.message || "Notification from CloudHost workflow";
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    return { sent: true, provider: "slack", status: response.status };
  },

  discord: async (node) => {
    const webhookUrl = node.config.webhookUrl;
    if (!webhookUrl) throw new Error("Discord node: webhook URL required");

    const content = node.config.message || "Notification from CloudHost workflow";
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    return { sent: true, provider: "discord", status: response.status };
  },

  telegram: async (node) => {
    const botToken = node.config.botToken;
    const chatId = node.config.chatId;
    if (!botToken || !chatId) throw new Error("Telegram node: botToken and chatId required");

    const text = node.config.message || "Notification from CloudHost workflow";
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      }
    );

    return { sent: true, provider: "telegram", status: response.status };
  },

  code: async (node, data) => {
    const code = node.config.code;
    if (!code) throw new Error("Code node: no code provided");

    const sandbox: Record<string, any> = { data, console: { log: (...args: any[]) => console.log("[Workflow Code]", ...args) }, result: null };
    const script = new vm.Script(`
      (function() {
        ${code}
      })();
    `);

    const context = vm.createContext(sandbox);
    script.runInContext(context, { timeout: 5000 });
    return sandbox.result !== undefined ? (sandbox.result as any) : { executed: true };
  },

  condition: async (node, data) => {
    const variable = node.config.variable || "";
    const operator = node.config.operator || "equals";
    const value = node.config.value || "";

    const resolvedValue = resolveTemplate(variable, data);
    const resolvedCompare = resolveTemplate(value, data);

    let result = false;
    switch (operator) {
      case "equals":
        result = resolvedValue === resolvedCompare;
        break;
      case "notEquals":
        result = resolvedValue !== resolvedCompare;
        break;
      case "contains":
        result = resolvedValue.includes(resolvedCompare);
        break;
      case "greaterThan":
        result = Number(resolvedValue) > Number(resolvedCompare);
        break;
      case "lessThan":
        result = Number(resolvedValue) < Number(resolvedCompare);
        break;
      case "isEmpty":
        result = !resolvedValue || resolvedValue === "";
        break;
      default:
        result = false;
    }

    return { condition: result, variable: resolvedValue, operator, compareTo: resolvedCompare };
  },

  loop: async (node, data) => {
    const iterations = parseInt(node.config.iterations || "3");
    const results = [];
    for (let i = 0; i < iterations; i++) {
      results.push({ iteration: i + 1, timestamp: new Date().toISOString() });
    }
    return { iterations, results };
  },

  wait: async (node) => {
    const duration = parseInt(node.config.duration || "1000");
    await new Promise(resolve => setTimeout(resolve, duration));
    return { waited: true, durationMs: duration };
  },

  transform: async (node, data) => {
    const raw = node.config.expression;
    if (!raw) return data;

    const resolved = resolveTemplate(raw, data);
    try {
      return { transformed: JSON.parse(resolved) };
    } catch {
      return { transformed: resolved };
    }
  },

  ai: async (node) => {
    const provider = node.config.provider || "anthropic";
    const prompt = node.config.prompt || "";

    if (provider === "anthropic") {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("AI node: ANTHROPIC_API_KEY not configured");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const result = (await response.json()) as any;
      return {
        provider: "anthropic",
        content: result.content?.[0]?.text || JSON.stringify(result),
      };
    }

    throw new Error(`AI node: unsupported provider "${provider}"`);
  },

  notification: async (node, data, connections, nodes) => {
    const upstream = getInputData(node.id, connections, data, nodes);
    const message = resolveTemplate(node.config.message || "Workflow notification", upstream);
    return { notified: true, message };
  },

  github: async (node) => {
    const token = node.config.token;
    const repo = node.config.repo;
    const action = node.config.action || "star";
    if (!token || !repo) throw new Error("GitHub node: token and repo required");

    const response = await fetch(`https://api.github.com/repos/${repo}/${action}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "CloudHost-Workflow",
      },
    });

    return { github: true, status: response.status };
  },

  file: async (node) => {
    return { written: true, path: node.config?.path };
  },
};

async function executeWorkflow(workflowId: string, triggerData?: any) {
  const [workflow] = await db.select().from(workflows).where(eq(workflows.id, workflowId)).limit(1);
  if (!workflow || workflow.status !== "active") return;

  const [execution] = await db.insert(workflowExecutions).values({
    workflowId,
    status: "running",
  }).returning();

  console.log(`[Workflow] Executing ${workflow.name}`);

  try {
    const nodes = (workflow.nodes as any[]) || [];
    const connections: Record<string, string[]> = (workflow.connections as Record<string, string[]>) || {};
    let results: Record<string, any> = {};

    if (triggerData) {
      const triggerNode = nodes.find(n => n.type === "webhook");
      if (triggerNode) results[triggerNode.id] = triggerData;
    }

    const executionOrder = topologicalSort(nodes, connections);

    for (const nodeId of executionOrder) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      if (results[nodeId] !== undefined) continue;

      const handler = NODE_HANDLERS[node.type];
      if (handler) {
        const inputData = getInputData(nodeId, connections, results, nodes);
        results[nodeId] = await handler(node, inputData, connections, nodes);
      }
    }

    await db.update(workflowExecutions)
      .set({ status: "success", finishedAt: new Date(), output: results })
      .where(eq(workflowExecutions.id, execution.id));

    await db.update(workflows)
      .set({ lastRunAt: new Date(), errorCount: "0" })
      .where(eq(workflows.id, workflowId));

    console.log(`[Workflow] ${workflow.name} completed`);
  } catch (err: any) {
    await db.update(workflowExecutions)
      .set({ status: "error", finishedAt: new Date(), error: err.message })
      .where(eq(workflowExecutions.id, execution.id));

    await db.update(workflows)
      .set({ errorCount: String(parseInt(workflow.errorCount || "0") + 1) })
      .where(eq(workflows.id, workflowId));

    console.error(`[Workflow] ${workflow.name} failed:`, err.message);
  }
}

function topologicalSort(nodes: any[], connections: any): string[] {
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};

  for (const node of nodes) {
    inDegree[node.id] = 0;
    adjList[node.id] = [];
  }

  for (const [from, targets] of Object.entries(connections)) {
    for (const to of targets as string[]) {
      adjList[from]?.push(to);
      inDegree[to] = (inDegree[to] || 0) + 1;
    }
  }

  const queue: string[] = [];
  for (const [nodeId, degree] of Object.entries(inDegree)) {
    if (degree === 0) queue.push(nodeId);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjList[current] || []) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  return sorted;
}

async function registerWebhook(workflowId: string, webhookUrl: string, nodes: any[]) {
  const path = webhookUrl.startsWith("/") ? webhookUrl : `/${webhookUrl}`;
  webhookRoutes.set(path, workflowId);
  console.log(`[Workflow] Registered webhook ${path} for workflow ${workflowId}`);

  // Set up cron schedule if schedule node exists
  const scheduleNode = nodes.find(n => n.type === "schedule");
  if (scheduleNode) {
    const interval = scheduleNode.config?.interval || "hourly";
    const cronMap: Record<string, string> = {
      everyMinute: "* * * * *",
      every5Minutes: "*/5 * * * *",
      every15Minutes: "*/15 * * * *",
      hourly: "0 * * * *",
      daily: "0 0 * * *",
      weekly: "0 0 * * 0",
    };
    const cronExpr = interval === "cron" ? scheduleNode.config?.cron : cronMap[interval];
    if (cronExpr && cron.validate(cronExpr)) {
      cron.schedule(cronExpr, () => {
        console.log(`[Workflow] Cron trigger for ${workflowId}`);
        executeWorkflow(workflowId);
      });
      console.log(`[Workflow] Scheduled cron ${cronExpr} for workflow ${workflowId}`);
    }
  }
}

async function unregisterWebhook(workflowId: string) {
  for (const [path, id] of webhookRoutes) {
    if (id === workflowId) {
      webhookRoutes.delete(path);
      console.log(`[Workflow] Unregistered webhook ${path} for workflow ${workflowId}`);
    }
  }
}

async function loadActiveWorkflows() {
  const activeWorkflows = await db.select().from(workflows).where(eq(workflows.status, "active"));
  for (const wf of activeWorkflows) {
    const nodes = (wf.nodes as any[]) || [];
    const webhookNode = nodes.find(n => n.type === "webhook");
    if (webhookNode && wf.webhookUrl) {
      await registerWebhook(wf.id, wf.webhookUrl!, nodes);
    }
  }
  console.log(`[Workflow] Loaded ${activeWorkflows.length} active workflows`);
}

const webhookApp = new Hono();

webhookApp.all("/webhook/:path", async (c) => {
  const path = c.req.param("path");
  const workflowId = webhookRoutes.get(`/webhook/${path}`);

  if (!workflowId) {
    return c.json({ error: "No workflow registered for this webhook" }, 404);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    body = { raw: await c.req.text() };
  }

  const query = c.req.queries();
  const headers = Object.fromEntries(c.req.raw.headers.entries());
  const triggerData = { body, query, headers, method: c.req.method, path: c.req.path };

  executeWorkflow(workflowId, triggerData);

  return c.json({ received: true, workflowId });
});

webhookApp.post("/webhook/register", async (c) => {
  const { workflowId, webhookUrl, nodes } = await c.req.json();
  await registerWebhook(workflowId, webhookUrl, nodes || []);
  return c.json({ registered: true });
});

webhookApp.post("/webhook/unregister", async (c) => {
  const { workflowId } = await c.req.json();
  await unregisterWebhook(workflowId);
  return c.json({ unregistered: true });
});

webhookApp.post("/webhook/execute", async (c) => {
  const { workflowId } = await c.req.json();
  executeWorkflow(workflowId);
  return c.json({ triggered: true });
});

webhookApp.get("/health", (c) => c.json({ status: "ok", webhooks: webhookRoutes.size }));

export { executeWorkflow, registerWebhook, unregisterWebhook, NODE_HANDLERS };

async function start() {
  await loadActiveWorkflows();

  serve({ fetch: webhookApp.fetch, port: WORKFLOW_PORT });
  console.log(`[Workflow] Webhook receiver listening on port ${WORKFLOW_PORT}`);
}

start();
