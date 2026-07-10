import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, deployments } from "@cloudhost/db";

export const deploymentsRouter = new Hono();

deploymentsRouter.get("/project/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const all = await db.select().from(deployments).where(eq(deployments.projectId, projectId));
  return c.json({ deployments: all });
});

deploymentsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const [deployment] = await db.insert(deployments).values({
    projectId: body.projectId,
    name: body.name,
    gitRepository: body.gitRepository,
    gitBranch: body.gitBranch,
    buildCommand: body.buildCommand,
    outputDirectory: body.outputDirectory,
    installCommand: body.installCommand,
    framework: body.framework || "nextjs",
    environment: body.environment || {},
    status: "pending",
  }).returning();
  return c.json({ deployment }, 201);
});

deploymentsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [deployment] = await db.select().from(deployments).where(eq(deployments.id, id)).limit(1);
  if (!deployment) return c.json({ error: "Not found" }, 404);
  return c.json({ deployment });
});

deploymentsRouter.post("/:id/deploy", async (c) => {
  const id = c.req.param("id");
  const [deployment] = await db.update(deployments)
    .set({ status: "building", updatedAt: new Date() })
    .where(eq(deployments.id, id))
    .returning();
  return c.json({ deployment, message: "Deployment started" });
});

deploymentsRouter.post("/:id/stop", async (c) => {
  const id = c.req.param("id");
  const [deployment] = await db.update(deployments)
    .set({ status: "stopped", updatedAt: new Date() })
    .where(eq(deployments.id, id))
    .returning();
  return c.json({ deployment });
});

deploymentsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(deployments).where(eq(deployments.id, id));
  return c.json({ success: true });
});
