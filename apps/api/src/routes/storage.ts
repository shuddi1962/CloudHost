import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, buckets, storageObjects } from "@cloudhost/db";
import { S3Client, PutObjectCommand, DeleteObjectCommand, CreateBucketCommand } from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;

function getS3(): S3Client | null {
  const endpoint = process.env.DO_SPACES_ENDPOINT || process.env.S3_ENDPOINT;
  const key = process.env.DO_SPACES_KEY || process.env.S3_ACCESS_KEY;
  const secret = process.env.DO_SPACES_SECRET || process.env.S3_SECRET_KEY;
  const region = process.env.DO_SPACES_REGION || process.env.S3_REGION || "us-east-1";
  if (!endpoint || !key || !secret) return null;
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId: key, secretAccessKey: secret },
      forcePathStyle: true,
    });
  }
  return s3Client;
}

export const storageRouter = new Hono();

storageRouter.get("/buckets/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const all = await db.select().from(buckets).where(eq(buckets.projectId, projectId));
  return c.json({ buckets: all });
});

storageRouter.post("/buckets", async (c) => {
  const body = await c.req.json();
  const s3 = getS3();
  if (s3) {
    try {
      await s3.send(new CreateBucketCommand({ Bucket: body.name }));
    } catch (e: any) {
      if (e.name !== "BucketAlreadyExists" && e.name !== "BucketAlreadyOwnedByYou") {
        console.error("S3 CreateBucket failed:", e.message);
      }
    }
  }
  const [bucket] = await db.insert(buckets).values({
    projectId: body.projectId,
    name: body.name,
    public: body.public || false,
  }).returning();
  return c.json({ bucket }, 201);
});

storageRouter.put("/buckets/:id/toggle-public", async (c) => {
  const id = c.req.param("id");
  const [bucket] = await db.select().from(buckets).where(eq(buckets.id, id)).limit(1);
  if (!bucket) return c.json({ error: "Not found" }, 404);
  const [updated] = await db.update(buckets).set({ public: !bucket.public }).where(eq(buckets.id, id)).returning();
  return c.json({ bucket: updated });
});

storageRouter.delete("/buckets/:id", async (c) => {
  const id = c.req.param("id");
  const [bucket] = await db.select().from(buckets).where(eq(buckets.id, id)).limit(1);
  if (bucket) {
    const s3 = getS3();
    if (s3) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: bucket.name, Key: "" }));
      } catch {}
    }
    await db.delete(storageObjects).where(eq(storageObjects.bucketId, id));
  }
  await db.delete(buckets).where(eq(buckets.id, id));
  return c.json({ success: true });
});

storageRouter.get("/objects/:bucketId", async (c) => {
  const bucketId = c.req.param("bucketId");
  const all = await db.select().from(storageObjects).where(eq(storageObjects.bucketId, bucketId));
  return c.json({ objects: all });
});

storageRouter.post("/objects", async (c) => {
  const body = await c.req.json();
  const [bucket] = await db.select().from(buckets).where(eq(buckets.id, body.bucketId)).limit(1);
  const s3 = getS3();
  if (s3 && bucket) {
    try {
      const content = body.content || "";
      await s3.send(new PutObjectCommand({
        Bucket: bucket.name,
        Key: body.path || body.name,
        Body: typeof content === "string" ? Buffer.from(content, "base64") : Buffer.from(content),
        ContentType: body.mimeType || "application/octet-stream",
      }));
    } catch (e: any) {
      console.error("S3 PutObject failed:", e.message);
    }
  }
  const [object] = await db.insert(storageObjects).values({
    bucketId: body.bucketId,
    name: body.name,
    path: body.path || body.name,
    size: body.size || 0,
    mimeType: body.mimeType || "application/octet-stream",
  }).returning();
  return c.json({ object }, 201);
});

storageRouter.delete("/objects/:id", async (c) => {
  const id = c.req.param("id");
  const [obj] = await db.select().from(storageObjects).where(eq(storageObjects.id, id)).limit(1);
  if (obj) {
    const bId = obj.bucketId;
    const [bucket] = await db.select().from(buckets).where(eq(buckets.id, bId)).limit(1);
    const s3 = getS3();
    if (s3 && bucket) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: bucket.name!, Key: obj.path || obj.name }));
      } catch {}
    }
  }
  await db.delete(storageObjects).where(eq(storageObjects.id, id));
  return c.json({ success: true });
});
