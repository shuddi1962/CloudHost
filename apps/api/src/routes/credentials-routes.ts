import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, credentials } from "@cloudhost/db";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  console.error("FATAL: ENCRYPTION_KEY environment variable is required");
  process.exit(1);
}

function encrypt(plaintext: unknown): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY!, "hex"), iv);
  const json = JSON.stringify(plaintext);
  let encrypted = cipher.update(json, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return JSON.stringify({ iv: iv.toString("hex"), encrypted, authTag });
}

function decrypt(encryptedStr: string): unknown {
  try {
    const { iv, encrypted, authTag } = JSON.parse(encryptedStr);
    const decipher = createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY!, "hex"),
      Buffer.from(iv, "hex")
    );
    decipher.setAuthTag(Buffer.from(authTag, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch {
    // If it fails to decrypt, return as-is (legacy unencrypted data)
    return encryptedStr;
  }
}

const HIDDEN = "***encrypted***";

export const credentialsRouter = new Hono();

credentialsRouter.get("/project/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const all = await db.select().from(credentials).where(eq(credentials.projectId, projectId));
  return c.json({
    credentials: all.map(cr => ({
      ...cr,
      data: HIDDEN,
    })),
  });
});

credentialsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const encrypted = encrypt(body.data);
  const [cred] = await db.insert(credentials).values({
    projectId: body.projectId,
    name: body.name,
    type: body.type,
    data: encrypted,
  }).returning();
  return c.json({ credential: { ...cred, data: HIDDEN } }, 201);
});

credentialsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [cred] = await db.select().from(credentials).where(eq(credentials.id, id)).limit(1);
  if (!cred) return c.json({ error: "Not found" }, 404);

  const payload = c.get("jwtPayload") as { sub: string };
  const decrypted = decrypt(String(cred.data));

  return c.json({ credential: { ...cred, data: decrypted } });
});

credentialsRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const encrypted = encrypt(body.data);
  const [updated] = await db.update(credentials)
    .set({ name: body.name, data: encrypted, updatedAt: new Date() })
    .where(eq(credentials.id, id))
    .returning();
  return c.json({ credential: { ...updated, data: HIDDEN } });
});

credentialsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(credentials).where(eq(credentials.id, id));
  return c.json({ success: true });
});
