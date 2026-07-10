import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, images, streams, realtimeKit } from "@cloudhost/db";

export const cloudflareMediaRouter = new Hono();

const jwtPayload = (c: any) => c.get("jwtPayload") as { sub: string };

// Images
cloudflareMediaRouter.get("/images", async (c) => {
  const list = await db.select().from(images).where(eq(images.userId, jwtPayload(c).sub));
  return c.json({ images: list });
});

cloudflareMediaRouter.post("/images", async (c) => {
  const body = await c.req.json();
  const variantConfigs = body.variantConfigs || [
    { name: "public", width: 0, height: 0, fit: "scale-down" },
    { name: "thumbnail", width: 200, height: 200, fit: "cover" },
    { name: "preview", width: 800, height: 600, fit: "contain" },
  ];
  const deliveryUrls = { public: `https://images.cloudhost.app/${Date.now()}/public`, thumbnail: `https://images.cloudhost.app/${Date.now()}/thumbnail`, preview: `https://images.cloudhost.app/${Date.now()}/preview` };
  const [created] = await db.insert(images).values({
    userId: jwtPayload(c).sub, name: body.name, filename: body.filename,
    contentType: body.contentType, size: body.size, width: body.width, height: body.height,
    variants: body.variants || ["public", "thumbnail", "preview"],
    variantConfigs, transformations: body.transformations, deliveryUrls, metadata: body.metadata,
  }).returning();
  return c.json({ image: created }, 201);
});

cloudflareMediaRouter.post("/images/:id/variants", async (c) => {
  const body = await c.req.json();
  const [img] = await db.select().from(images).where(eq(images.id, c.req.param("id"))).limit(1);
  if (!img) return c.json({ error: "Not found" }, 404);
  const variantConfigs = [...(img.variantConfigs as any[] || []), { name: body.name, width: body.width, height: body.height, fit: body.fit || "scale-down" }];
  const variants = [...(img.variants as any[] || []), body.name];
  const [updated] = await db.update(images).set({ variantConfigs, variants, updatedAt: new Date() }).where(eq(images.id, c.req.param("id"))).returning();
  return c.json({ image: updated });
});

cloudflareMediaRouter.delete("/images/:id", async (c) => {
  await db.delete(images).where(eq(images.id, c.req.param("id")));
  return c.json({ success: true });
});

// Stream
cloudflareMediaRouter.get("/stream", async (c) => {
  const list = await db.select().from(streams).where(eq(streams.userId, jwtPayload(c).sub));
  return c.json({ streams: list });
});

cloudflareMediaRouter.post("/stream", async (c) => {
  const body = await c.req.json();
  const playbackUrl = `https://videodelivery.net/${Date.now()}`;
  const previewUrl = `https://videodelivery.net/${Date.now()}/thumbnails/thumbnail.jpg`;
  const [created] = await db.insert(streams).values({
    userId: jwtPayload(c).sub, title: body.title, description: body.description,
    filename: body.filename, duration: body.duration, size: body.size,
    status: "processing", playbackUrl, previewUrl, meta: body.meta,
    allowedOrigins: body.allowedOrigins, requireSignedUrls: body.requireSignedUrls,
    liveInput: body.liveInput, watermark: body.watermark,
  }).returning();
  setTimeout(async () => {
    await db.update(streams).set({ status: "ready", readyToStream: true, thumbnailUrl: previewUrl, updatedAt: new Date() }).where(eq(streams.id, created.id));
  }, 3000);
  return c.json({ stream: created }, 201);
});

cloudflareMediaRouter.put("/stream/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(streams).set({ ...body, updatedAt: new Date() }).where(eq(streams.id, c.req.param("id"))).returning();
  return c.json({ stream: updated });
});

cloudflareMediaRouter.post("/stream/:id/signed-url", async (c) => {
  const [s] = await db.select().from(streams).where(eq(streams.id, c.req.param("id"))).limit(1);
  if (!s) return c.json({ error: "Not found" }, 404);
  const signedUrl = `${s.playbackUrl}?token=signed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}&expires=${Date.now() + 3600000}`;
  return c.json({ signedUrl, expiresIn: 3600 });
});

cloudflareMediaRouter.delete("/stream/:id", async (c) => {
  await db.delete(streams).where(eq(streams.id, c.req.param("id")));
  return c.json({ success: true });
});

// RealtimeKit
cloudflareMediaRouter.get("/realtime-kit", async (c) => {
  const list = await db.select().from(realtimeKit).where(eq(realtimeKit.userId, jwtPayload(c).sub));
  return c.json({ realtimeApps: list });
});

cloudflareMediaRouter.post("/realtime-kit", async (c) => {
  const body = await c.req.json();
  const tokens = [{ id: `token-${Date.now()}`, name: "default", permissions: ["send", "receive"], createdAt: new Date().toISOString() }];
  const [created] = await db.insert(realtimeKit).values({
    userId: jwtPayload(c).sub, name: body.name, appType: body.appType,
    allowedOrigins: body.allowedOrigins, maxConnections: body.maxConnections,
    webhookUrl: body.webhookUrl, turnConfig: body.turnConfig, sfuConfig: body.sfuConfig,
    tokens,
  }).returning();
  return c.json({ realtimeApp: created }, 201);
});

cloudflareMediaRouter.post("/realtime-kit/:id/tokens", async (c) => {
  const body = await c.req.json();
  const [app] = await db.select().from(realtimeKit).where(eq(realtimeKit.id, c.req.param("id"))).limit(1);
  if (!app) return c.json({ error: "Not found" }, 404);
  const newToken = { id: `token-${Date.now()}`, name: body.name || "token", permissions: body.permissions || ["send", "receive"], createdAt: new Date().toISOString() };
  const tokens = [...(app.tokens as any[] || []), newToken];
  const [updated] = await db.update(realtimeKit).set({ tokens, updatedAt: new Date() }).where(eq(realtimeKit.id, c.req.param("id"))).returning();
  return c.json({ realtimeApp: updated, token: newToken });
});

cloudflareMediaRouter.post("/realtime-kit/:id/connect", async (c) => {
  const [app] = await db.select().from(realtimeKit).where(eq(realtimeKit.id, c.req.param("id"))).limit(1);
  if (!app) return c.json({ error: "Not found" }, 404);
  const connections = [...(app.connections as any[] || []), { id: `conn-${Date.now()}`, connectedAt: new Date().toISOString(), ip: c.req.header("x-forwarded-for") || "127.0.0.1" }];
  const [updated] = await db.update(realtimeKit).set({ connections, connectionCount: connections.length, updatedAt: new Date() }).where(eq(realtimeKit.id, c.req.param("id"))).returning();
  return c.json({ realtimeApp: updated, connectionId: `conn-${Date.now()}`, turnServers: [{ urls: "turn:cloudhost.app:3478", username: "test", credential: "test" }] });
});

cloudflareMediaRouter.put("/realtime-kit/:id", async (c) => {
  const body = await c.req.json();
  const [updated] = await db.update(realtimeKit).set({ ...body, updatedAt: new Date() }).where(eq(realtimeKit.id, c.req.param("id"))).returning();
  return c.json({ realtimeApp: updated });
});

cloudflareMediaRouter.delete("/realtime-kit/:id", async (c) => {
  await db.delete(realtimeKit).where(eq(realtimeKit.id, c.req.param("id")));
  return c.json({ success: true });
});
