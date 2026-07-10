import { Hono } from "hono";
import { db, projects } from "@cloudhost/db";

export const vpsRouter = new Hono();

vpsRouter.post("/deploy", async (c) => {
  const { plan, projectId, name, region } = await c.req.json();
  const server = {
    id: Math.random().toString(36).slice(2, 10),
    name: name || `${plan}-server`,
    plan,
    region: region || "us-east",
    status: "provisioning",
    ip: "0.0.0.0",
    os: "Ubuntu 22.04",
    cpu: plan.includes("1") ? "1 vCPU" : plan.includes("2") ? "2 vCPU" : "4 vCPU",
    ram: plan.includes("1") ? "1 GB" : plan.includes("2") ? "4 GB" : "8 GB",
    storage: plan.includes("1") ? "25 GB" : plan.includes("2") ? "50 GB" : "100 GB",
    createdAt: new Date().toISOString(),
  };

  setTimeout(async () => {
    server.status = "running";
    server.ip = `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }, 5000);

  return c.json({ server }, 201);
});

vpsRouter.get("/list", async (c) => {
  return c.json({ servers: [] });
});

vpsRouter.post("/:id/action", async (c) => {
  const id = c.req.param("id");
  const { action } = await c.req.json();
  const actions: Record<string, string> = {
    start: "Server started",
    stop: "Server stopped",
    restart: "Server restarting",
    rebuild: "Server rebuilding",
  };
  return c.json({ message: actions[action] || "Action executed", serverId: id });
});
