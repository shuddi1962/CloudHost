import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, previewDeployments, deployments } from "@cloudhost/db";

export const previewDeploymentsRouter = new Hono();

previewDeploymentsRouter.get("/deployment/:deploymentId", async (c) => {
  const deploymentId = c.req.param("deploymentId");
  const all = await db.select().from(previewDeployments).where(eq(previewDeployments.deploymentId, deploymentId));
  return c.json({ previews: all });
});

previewDeploymentsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const previewUrl = `https://preview-${body.branchName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.random().toString(36).slice(2, 6)}.cloudhost.app`;

  const [preview] = await db.insert(previewDeployments).values({
    deploymentId: body.deploymentId,
    branchName: body.branchName,
    commitSha: body.commitSha,
    commitMessage: body.commitMessage,
    previewUrl,
    status: "building",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  }).returning();

  setTimeout(async () => {
    await db.update(previewDeployments)
      .set({
        status: "ready",
        logs: [
          { time: new Date().toISOString(), message: `Cloning branch ${body.branchName}...` },
          { time: new Date().toISOString(), message: "Installing dependencies..." },
          { time: new Date().toISOString(), message: "Building application..." },
          { time: new Date().toISOString(), message: `Deployed to ${previewUrl}` },
        ],
      })
      .where(eq(previewDeployments.id, preview.id));
  }, 3000);

  return c.json({ preview }, 201);
});

previewDeploymentsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [preview] = await db.select().from(previewDeployments).where(eq(previewDeployments.id, id)).limit(1);
  if (!preview) return c.json({ error: "Not found" }, 404);
  return c.json({ preview });
});

previewDeploymentsRouter.post("/:id/rebuild", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(previewDeployments)
    .set({ status: "building", logs: [], updatedAt: new Date() })
    .where(eq(previewDeployments.id, id))
    .returning();

  setTimeout(async () => {
    await db.update(previewDeployments)
      .set({ status: "ready", logs: [{ time: new Date().toISOString(), message: "Rebuild complete" }] })
      .where(eq(previewDeployments.id, id));
  }, 3000);

  return c.json({ preview: updated });
});

previewDeploymentsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(previewDeployments).where(eq(previewDeployments.id, id));
  return c.json({ success: true });
});
