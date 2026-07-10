import { db, workflows, workflowExecutions } from "@cloudhost/db";
import { eq, and } from "drizzle-orm";

console.log("[Workflow] Workflow execution service running");

// Supported node types
const NODE_HANDLERS: Record<string, Function> = {
  webhook: async (node: any, data: any) => data,
  schedule: async (node: any, data: any) => ({ triggered: true, at: new Date().toISOString() }),
  email: async (node: any, data: any) => ({ sent: true, to: node.config?.to }),
  database: async (node: any, data: any) => ({ query: node.config?.query, result: [] }),
  http: async (node: any, data: any) => ({ status: 200, body: "OK" }),
  file: async (node: any, data: any) => ({ written: true, path: node.config?.path }),
};

async function executeWorkflow(workflowId: string) {
  const [workflow] = await db.select().from(workflows).where(eq(workflows.id, workflowId)).limit(1);
  if (!workflow || workflow.status !== "active") return;

  const [execution] = await db.insert(workflowExecutions).values({
    workflowId,
    status: "running",
  }).returning();

  console.log(`[Workflow] Executing ${workflow.name}`);

  try {
    const nodes = (workflow.nodes as any[]) || [];
    const connections = workflow.connections as any || {};
    const executionOrder = topologicalSort(nodes, connections);
    let data: any = {};

    for (const nodeId of executionOrder) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      const handler = NODE_HANDLERS[node.type];
      if (handler) {
        data[nodeId] = await handler(node, data);
      }
    }

    await db.update(workflowExecutions)
      .set({ status: "success", finishedAt: new Date(), output: data })
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
  const visited = new Set<string>();
  const sorted: string[] = [];

  function visit(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const edges = Object.values(connections).flatMap((conns: any) =>
      conns.filter((c: any) => c.node === nodeId)
    );

    for (const edge of edges as any[]) {
      visit(edge.node);
    }

    sorted.unshift(nodeId);
  }

  for (const node of nodes) {
    visit(node.id);
  }

  return sorted;
}

// Poll for scheduled workflows
setInterval(async () => {
  try {
    const activeWorkflows = await db.select().from(workflows).where(eq(workflows.status, "active"));
    for (const wf of activeWorkflows) {
      const nodes = (wf.nodes as any[]) || [];
      const hasSchedule = nodes.some(n => n.type === "schedule");
      if (hasSchedule) {
        executeWorkflow(wf.id);
      }
    }
  } catch (err) {
    console.error("[Workflow] Poll error:", err);
  }
}, 60000);
