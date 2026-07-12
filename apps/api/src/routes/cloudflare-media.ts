import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, images, streams, realtimeKit } from "@cloudhost/db";
import { cfFetch, cfFetchOrNull } from "../lib/cloudflare";

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
  let deliveryUrls: Record<string, string> = {
    public: `https://images.cloudhost.app/${Date.now()}/public`,
    thumbnail: `https://images.cloudhost.app/${Date.now()}/thumbnail`,
    preview: `https://images.cloudhost.app/${Date.now()}/preview`,
  };
  const metadata: any = { ...body.metadata };

  const cfResult = await cfFetchOrNull("/images/v1", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url: body.sourceUrl || "https://example.com/placeholder.jpg" }),
  });
  if (cfResult?.success && cfResult.result) {
    metadata.cfImageId = cfResult.result.id;
    if (cfResult.result.variants) {
      deliveryUrls = {};
      for (const v of cfResult.result.variants) {
        const name = v.split("/").pop()?.replace(/^v_/, "") || "public";
        deliveryUrls[name] = v;
      }
    }
  }

  const [created] = await db.insert(images).values({
    userId: jwtPayload(c).sub, name: body.name, filename: body.filename,
    contentType: body.contentType, size: body.size, width: body.width, height: body.height,
    variants: body.variants || ["public", "thumbnail", "preview"],
    variantConfigs, transformations: body.transformations, deliveryUrls, metadata,
  }).returning();
  return c.json({ image: created }, 201);
});

cloudflareMediaRouter.post("/images/:id/variants", async (c) => {
  const body = await c.req.json();
  const [img] = await db.select().from(images).where(eq(images.id, c.req.param("id"))).limit(1);
  if (!img) return c.json({ error: "Not found" }, 404);

  const providerId = (img.metadata as any)?.cfImageId;
  if (providerId) {
    await cfFetchOrNull(`/images/v1/${providerId}/variants`, {
      method: "POST",
      body: JSON.stringify({ name: body.name, width: body.width, height: body.height, fit: body.fit || "scale-down" }),
    });
  }

  const variantConfigs = [...(img.variantConfigs as any[] || []), { name: body.name, width: body.width, height: body.height, fit: body.fit || "scale-down" }];
  const variants = [...(img.variants as any[] || []), body.name];
  const [updated] = await db.update(images).set({ variantConfigs, variants, updatedAt: new Date() }).where(eq(images.id, c.req.param("id"))).returning();
  return c.json({ image: updated });
});

cloudflareMediaRouter.delete("/images/:id", async (c) => {
  const [img] = await db.select().from(images).where(eq(images.id, c.req.param("id"))).limit(1);
  if (img) {
    const providerId = (img.metadata as any)?.cfImageId;
    if (providerId) {
      await cfFetchOrNull(`/images/v1/${providerId}`, { method: "DELETE" });
    }
  }
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
  let playbackUrl = `https://videodelivery.net/${Date.now()}`;
  let previewUrl = `https://videodelivery.net/${Date.now()}/thumbnails/thumbnail.jpg`;
  const meta: any = { ...body.meta };

  if (body.sourceUrl) {
    const cfResult = await cfFetchOrNull("/stream/copy", {
      method: "POST",
      body: JSON.stringify({ url: body.sourceUrl, meta: { name: body.title } }),
    });
    if (cfResult?.success && cfResult.result) {
      meta.cfStreamId = cfResult.result.uid;
      playbackUrl = cfResult.result.playback?.url || playbackUrl;
      previewUrl = cfResult.result.preview || previewUrl;
    }
  }

  const [created] = await db.insert(streams).values({
    userId: jwtPayload(c).sub, title: body.title, description: body.description,
    filename: body.filename, duration: body.duration, size: body.size,
    status: "processing", playbackUrl, previewUrl, meta,
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
  const [s] = await db.select().from(streams).where(eq(streams.id, c.req.param("id"))).limit(1);
  if (s) {
    const providerId = (s.meta as any)?.cfStreamId;
    if (providerId) {
      await cfFetchOrNull(`/stream/${providerId}`, {
        method: "PUT",
        body: JSON.stringify({
          meta: { name: body.title },
          ...(body.allowedOrigins ? { allowedOrigins: body.allowedOrigins } : {}),
          ...(body.requireSignedUrls !== undefined ? { requireSignedUrls: body.requireSignedUrls } : {}),
        }),
      });
    }
  }
  const [updated] = await db.update(streams).set({ ...body, updatedAt: new Date() }).where(eq(streams.id, c.req.param("id"))).returning();
  return c.json({ stream: updated });
});

cloudflareMediaRouter.post("/stream/:id/signed-url", async (c) => {
  const [s] = await db.select().from(streams).where(eq(streams.id, c.req.param("id"))).limit(1);
  if (!s) return c.json({ error: "Not found" }, 404);

  const body = await c.req.json();
  let signedUrl = `${s.playbackUrl}?token=signed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}&expires=${Date.now() + 3600000}`;
  let expiresIn = body.expiresIn || 3600;

  const providerId = (s.meta as any)?.cfStreamId;
  if (providerId) {
    const cfResult = await cfFetchOrNull(`/stream/${providerId}/token`, {
      method: "POST",
      body: JSON.stringify({ exp: expiresIn }),
    });
    if (cfResult?.success && cfResult.result) {
      signedUrl = `${s.playbackUrl}?token=${cfResult.result.token}`;
    }
  }

  return c.json({ signedUrl, expiresIn });
});

cloudflareMediaRouter.delete("/stream/:id", async (c) => {
  const [s] = await db.select().from(streams).where(eq(streams.id, c.req.param("id"))).limit(1);
  if (s) {
    const providerId = (s.meta as any)?.cfStreamId;
    if (providerId) {
      await cfFetchOrNull(`/stream/${providerId}`, { method: "DELETE" });
    }
  }
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
  let tokens = [{ id: `token-${Date.now()}`, name: "default", permissions: ["send", "receive"], createdAt: new Date().toISOString() }];
  const sfuConfig: any = { ...body.sfuConfig };

  const cfResult = await cfFetchOrNull("/calls/apps", {
    method: "POST",
    body: JSON.stringify({ name: body.name, appType: body.appType }),
  });
  if (cfResult?.success && cfResult.result) {
    sfuConfig.cfAppId = cfResult.result.id;
    sfuConfig.cfAppSecret = cfResult.result.secret;
    if (cfResult.result.tokens?.length) {
      tokens = cfResult.result.tokens.map((t: any) => ({
        id: t.id || `token-${Date.now()}`,
        name: t.name || "default",
        permissions: ["send", "receive"],
        createdAt: t.createdAt || new Date().toISOString(),
      }));
    }
  }

  const [created] = await db.insert(realtimeKit).values({
    userId: jwtPayload(c).sub, name: body.name, appType: body.appType,
    allowedOrigins: body.allowedOrigins, maxConnections: body.maxConnections,
    webhookUrl: body.webhookUrl, turnConfig: body.turnConfig, sfuConfig,
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
  const [app] = await db.select().from(realtimeKit).where(eq(realtimeKit.id, c.req.param("id"))).limit(1);
  if (app) {
    const cfAppId = (app.sfuConfig as any)?.cfAppId;
    if (cfAppId) {
      await cfFetchOrNull(`/calls/apps/${cfAppId}`, {
        method: "PUT",
        body: JSON.stringify({ name: body.name }),
      });
    }
  }
  const [updated] = await db.update(realtimeKit).set({ ...body, updatedAt: new Date() }).where(eq(realtimeKit.id, c.req.param("id"))).returning();
  return c.json({ realtimeApp: updated });
});

cloudflareMediaRouter.delete("/realtime-kit/:id", async (c) => {
  const [app] = await db.select().from(realtimeKit).where(eq(realtimeKit.id, c.req.param("id"))).limit(1);
  if (app) {
    const cfAppId = (app.sfuConfig as any)?.cfAppId;
    if (cfAppId) {
      await cfFetchOrNull(`/calls/apps/${cfAppId}`, { method: "DELETE" });
    }
  }
  await db.delete(realtimeKit).where(eq(realtimeKit.id, c.req.param("id")));
  return c.json({ success: true });
});
