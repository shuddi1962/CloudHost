import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";
import { BuildRunner } from "@/lib/build-runner";
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, createWriteStream } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const UPLOAD_DIR = join(tmpdir(), "cloudhost-uploads");

interface UploadedFile {
  path: string;
  content: string;
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function extractZip(zipPath: string, destDir: string): Promise<UploadedFile[]> {
  const files: UploadedFile[] = [];

  // Use a dynamic import for extract-zip (ESM module)
  const extractZip = (await import("extract-zip")).default;
  await extractZip(zipPath, { dir: destDir });

  function readDirRecursive(dir: string, base: string = "") {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        readDirRecursive(fullPath, join(base, entry.name));
      } else if (entry.isFile()) {
        const content = readFileSync(fullPath, "utf-8");
        files.push({ path: join(base, entry.name).replace(/\\/g, "/"), content });
      }
    }
  }

  readDirRecursive(destDir);
  return files;
}

// Database config injection for detected frameworks
function injectDatabaseConfig(files: UploadedFile[], dbCredentials: {
  host: string; port: number; database: string; username: string; password: string; type: string;
}): UploadedFile[] {
  const { host, port, database, username, password, type } = dbCredentials;

  return files.map(f => {
    let content = f.content;

    // WordPress: wp-config.php
    if (f.path.endsWith("wp-config.php")) {
      content = content
        .replace(/define\s*\(\s*['"]DB_NAME['"]\s*,\s*['"][^'"]*['"]\s*\)/, `define('DB_NAME', '${database}')`)
        .replace(/define\s*\(\s*['"]DB_USER['"]\s*,\s*['"][^'"]*['"]\s*\)/, `define('DB_USER', '${username}')`)
        .replace(/define\s*\(\s*['"]DB_PASSWORD['"]\s*,\s*['"][^'"]*['"]\s*\)/, `define('DB_PASSWORD', '${password}')`)
        .replace(/define\s*\(\s*['"]DB_HOST['"]\s*,\s*['"][^'"]*['"]\s*\)/, `define('DB_HOST', '${host}')`);
    }

    // Laravel: .env
    if (f.path.endsWith(".env") && !f.path.includes("node_modules")) {
      const dbPrefix = type === "postgresql" ? "pgsql" : "mysql";
      content = content
        .replace(/^DB_CONNECTION=.*$/m, `DB_CONNECTION=${dbPrefix}`)
        .replace(/^DB_HOST=.*$/m, `DB_HOST=${host}`)
        .replace(/^DB_PORT=.*$/m, `DB_PORT=${port}`)
        .replace(/^DB_DATABASE=.*$/m, `DB_DATABASE=${database}`)
        .replace(/^DB_USERNAME=.*$/m, `DB_USERNAME=${username}`)
        .replace(/^DB_PASSWORD=.*$/m, `DB_PASSWORD=${password}`);
    }

    // Generic PHP config files
    if (f.path.match(/config\.(php|inc)$/i) || f.path.match(/database\.(php|inc)$/i)) {
      content = content
        .replace(/\$db_(?:name|database)\s*=.*/i, `$db_name = '${database}';`)
        .replace(/\$db_(?:user|username)\s*=.*/i, `$db_user = '${username}';`)
        .replace(/\$db_(?:pass|password)\s*=.*/i, `$db_pass = '${password}';`)
        .replace(/\$db_(?:host|server)\s*=.*/i, `$db_host = '${host}';`);
    }

    return { ...f, content };
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) throw new ApiError(400, "Missing required field: file");

    const name = formData.get("name") as string;
    if (!name) throw new ApiError(400, "Missing required field: name");

    // Save uploaded zip
    const uploadId = randomBytes(8).toString("hex");
    const uploadDir = join(UPLOAD_DIR, uploadId);
    ensureDir(uploadDir);
    const zipPath = join(uploadDir, "upload.zip");

    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(zipPath, buffer);

    // Extract and scan files
    const extractDir = join(uploadDir, "extracted");
    ensureDir(extractDir);
    const files = await extractZip(zipPath, extractDir);

    // Detect framework
    const detected = BuildRunner.detectFramework(files);
    const frameworkId = detected?.id || "static";

    // Check if project needs a database
    const needsDatabase = files.some(f =>
      f.path.endsWith("wp-config.php") ||
      (f.path.endsWith(".env") && !f.path.includes("node_modules")) ||
      f.path.match(/config\.(php|inc)$/i) ||
      f.path.match(/database\.(php|inc)$/i)
    );

    // Create deployment record via API
    const deployRes = await fetch(`${API_URL}/api/deployments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type: "upload",
        framework: frameworkId,
        status: "pending",
      }),
    });
    const deployment = await deployRes.json();

    // Auto-provision database if needed
    let dbCredentials: any = null;
    if (needsDatabase) {
      try {
        const dbName = `app_${uploadId.substring(0, 6)}`;
        const dbRes = await fetch(`${API_URL}/api/databases/provision`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${name}-db`,
            type: "postgresql",
            version: "16",
            region: "us-east-1",
          }),
        });
        if (dbRes.ok) {
          dbCredentials = await dbRes.json();
          // Inject DB config into project files
          const injectedFiles = injectDatabaseConfig(files, {
            host: dbCredentials.host || "localhost",
            port: dbCredentials.port || 5432,
            database: dbCredentials.database_name || dbName,
            username: dbCredentials.username || "app",
            password: dbCredentials.password || randomBytes(12).toString("hex"),
            type: "postgresql",
          });

          // Write modified files back
          for (const f of injectedFiles) {
            const outPath = join(extractDir, f.path);
            ensureDir(outPath.substring(0, outPath.lastIndexOf("/")));
            writeFileSync(outPath, f.content);
          }
        }
      } catch (e) {
        console.error("Database auto-provision failed:", e);
      }
    }

    // Upload extracted files to deployment service for building
    // For now, mark as deployed with extracted files info
    const fileCount = files.length;
    const totalSizeKb = Math.round(files.reduce((s, f) => s + f.content.length, 0) / 1024);

    return NextResponse.json({
      id: deployment?.id || uploadId,
      name,
      framework: frameworkId,
      status: "created",
      fileCount,
      totalSizeKb,
      databaseProvisioned: !!dbCredentials,
      dbCredentials: dbCredentials ? {
        host: dbCredentials.host,
        port: dbCredentials.port,
        database: dbCredentials.database_name,
        username: dbCredentials.username,
      } : null,
      message: `Detected ${detected?.name || "static site"} with ${fileCount} files (${totalSizeKb} KB)`,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
