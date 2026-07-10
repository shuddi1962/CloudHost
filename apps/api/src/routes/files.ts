import { Hono } from "hono";
import fs from "fs/promises";
import path from "path";

const BASE_STORAGE = process.env.FILE_MANAGER_PATH || path.join(process.cwd(), "data", "sites");

export const filesRouter = new Hono();

filesRouter.get("/list/*", async (c) => {
  const filePath = c.req.path.replace("/api/files/list", "") || "/";
  const fullPath = path.join(BASE_STORAGE, filePath);

  try {
    await fs.access(fullPath);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      const entries = await fs.readdir(fullPath);
      const items = await Promise.all(entries.map(async (entry) => {
        const entryPath = path.join(fullPath, entry);
        const entryStat = await fs.stat(entryPath);
        return {
          name: entry,
          path: path.join(filePath, entry).replace(/\\/g, "/"),
          type: entryStat.isDirectory() ? "directory" : "file",
          size: entryStat.size,
          modifiedAt: entryStat.mtime.toISOString(),
        };
      }));
      return c.json({ items, path: filePath });
    } else {
      const content = await fs.readFile(fullPath, "utf-8");
      return c.json({ file: { name: path.basename(filePath), path: filePath, content, size: stat.size } });
    }
  } catch {
    return c.json({ error: "Path not found" }, 404);
  }
});

filesRouter.post("/read", async (c) => {
  const { filePath } = await c.req.json();
  const fullPath = path.join(BASE_STORAGE, filePath);

  try {
    const content = await fs.readFile(fullPath, "utf-8");
    const stat = await fs.stat(fullPath);
    return c.json({ content, size: stat.size, path: filePath });
  } catch {
    return c.json({ error: "File not found" }, 404);
  }
});

filesRouter.post("/write", async (c) => {
  const { filePath: fp, content } = await c.req.json();
  const fullPath = path.join(BASE_STORAGE, fp);

  try {
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
    return c.json({ success: true, path: fp });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

filesRouter.post("/create-directory", async (c) => {
  const { filePath: fp } = await c.req.json();
  const fullPath = path.join(BASE_STORAGE, fp);

  try {
    await fs.mkdir(fullPath, { recursive: true });
    return c.json({ success: true, path: fp });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

filesRouter.post("/delete", async (c) => {
  const { filePath: fp } = await c.req.json();
  const fullPath = path.join(BASE_STORAGE, fp);

  try {
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      await fs.rm(fullPath, { recursive: true });
    } else {
      await fs.unlink(fullPath);
    }
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

filesRouter.post("/rename", async (c) => {
  const { filePath: fp, newName } = await c.req.json();
  const fullPath = path.join(BASE_STORAGE, fp);
  const newPath = path.join(path.dirname(fullPath), newName);

  try {
    await fs.rename(fullPath, newPath);
    return c.json({ success: true, newPath: path.join(path.dirname(fp), newName).replace(/\\/g, "/") });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

filesRouter.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const filePath = formData.get("path") as string;
  const file = formData.get("file") as File;

  if (!file) return c.json({ error: "No file provided" }, 400);

  const fullPath = path.join(BASE_STORAGE, filePath || "", file.name);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return c.json({ success: true, path: path.join(filePath || "", file.name).replace(/\\/g, "/") });
});
