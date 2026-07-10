import { Hono } from "hono";

export const cdnRouter = new Hono();

cdnRouter.get("/stats", async (c) => {
  return c.json({
    requests: 0,
    bandwidth: "0 GB",
    cacheHitRate: "0%",
    avgResponseTime: "0ms",
    activeRules: 0,
    edgeLocations: 330,
  });
});

cdnRouter.post("/purge", async (c) => {
  const { urls } = await c.req.json();
  return c.json({ message: `Cache purged for ${urls?.length || "all"} URLs` });
});

cdnRouter.post("/rules", async (c) => {
  const rule = await c.req.json();
  return c.json({ rule, status: "active" }, 201);
});
