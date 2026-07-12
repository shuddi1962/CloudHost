import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, deployments, deploymentLogs } from "@cloudhost/db";
import { writeFile, mkdir, readFile } from "fs/promises";
import { createReadStream, existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { spawn } from "child_process";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const BUILD_DIR = path.join(process.cwd(), "data", "builds");
const DO_API = "https://api.digitalocean.com/v2";

function doHeaders(): Record<string, string> {
  const token = process.env.DIGITALOCEAN_API_TOKEN;
  if (!token) throw new Error("DIGITALOCEAN_API_TOKEN not set");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function doFetch(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${DO_API}${path}`, {
    ...options,
    headers: { ...doHeaders(), ...options.headers },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || `DO API error: ${res.status}`);
  return body;
}

const buildpacks = [
  { framework: "nextjs", name: "Next.js", detectFiles: ["next.config.js", "next.config.ts", "next.config.mjs"], buildCmd: "npm run build", startCmd: "npm start", port: 3000 },
  { framework: "node", name: "Node.js", detectFiles: ["package.json", "server.js", "app.js", "index.js"], buildCmd: "npm install", startCmd: "node server.js", port: 3000 },
  { framework: "static", name: "Static HTML", detectFiles: ["index.html", "index.htm"], buildCmd: "", startCmd: "", port: 80 },
  { framework: "django", name: "Python Django", detectFiles: ["manage.py", "requirements.txt"], buildCmd: "pip install -r requirements.txt", startCmd: "python manage.py runserver 0.0.0.0:8000", port: 8000 },
  { framework: "flask", name: "Python Flask", detectFiles: ["app.py", "requirements.txt"], buildCmd: "pip install -r requirements.txt", startCmd: "python app.py", port: 5000 },
  { framework: "laravel", name: "Laravel", detectFiles: ["artisan", "composer.json"], buildCmd: "composer install && php artisan optimize", startCmd: "php artisan serve --host=0.0.0.0 --port=8000", port: 8000 },
  { framework: "vite", name: "React (Vite)", detectFiles: ["vite.config.ts", "vite.config.js"], buildCmd: "npm run build", startCmd: "npm run preview -- --host 0.0.0.0", port: 4173 },
  { framework: "docker", name: "Docker", detectFiles: ["Dockerfile"], buildCmd: "", startCmd: "", port: 80 },
];

async function detectFramework(files: string[]): Promise<typeof buildpacks[0]> {
  const matched = buildpacks.filter(bp =>
    bp.detectFiles.some(df => files.some(f => f.endsWith(df) || f.includes(df)))
  );
  if (matched.length === 0) return buildpacks.find(b => b.framework === "static")!;
  if (matched.find(m => m.framework === "docker")) return matched.find(m => m.framework === "docker")!;
  return matched[0];
}

async function extractZip(zipPath: string, destDir: string): Promise<string[]> {
  await mkdir(destDir, { recursive: true });
  const AdmZip = require("adm-zip");
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(destDir, true);
  const files: string[] = [];
  function walk(dir: string) {
    const { readdirSync, statSync } = require("fs");
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      const s = statSync(full);
      if (s.isDirectory()) walk(full);
      else files.push(path.relative(destDir, full));
    }
  }
  walk(destDir);
  return files;
}

function generateDeployScript(buildpack: typeof buildpacks[0], appDir: string, deployDir: string, envVars: Record<string, string>): string {
  const envExport = Object.entries(envVars).map(([k, v]) => `export ${k}="${v}"`).join("\n");
  const buildStep = buildpack.buildCmd ? `cd ${appDir}\n${buildpack.buildCmd}` : "";
  const runCmd = buildpack.startCmd
    ? `cd ${appDir}\nnohup ${buildpack.startCmd} > /var/log/app.log 2>&1 &`
    : buildpack.framework === "static"
      ? `cd ${appDir}\nnohup python3 -m http.server ${buildpack.port} > /var/log/app.log 2>&1 &`
      : `cd ${appDir}\necho "No start command configured"`;
  return `#!/bin/bash
set -e
${envExport}
mkdir -p /opt/app
cd /opt/app
${buildStep}
${runCmd}
echo "DEPLOYED_PORT=${buildpack.port}"
`;
}

export const deployUploadRouter = new Hono();

deployUploadRouter.post("/upload-and-deploy", async (c) => {
  const payload = c.get("jwtPayload") as { sub: string };
  const formData = await c.req.formData();
  const file = formData.get("file") as File;
  const name = (formData.get("name") as string) || `deploy-${Date.now()}`;
  const envVarsRaw = formData.get("envVars") as string;
  const envVars: Record<string, string> = envVarsRaw ? JSON.parse(envVarsRaw) : {};
  const region = (formData.get("region") as string) || "nyc1";

  if (!file) return c.json({ error: "No file uploaded" }, 400);

  const deploymentId = randomBytes(8).toString("hex");
  const zipPath = path.join(UPLOAD_DIR, `${deploymentId}.zip`);
  const extractDir = path.join(BUILD_DIR, deploymentId);
  const subdomain = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + deploymentId.slice(0, 6);

  const [dep] = await db.insert(deployments).values({
    projectId: "",
    name,
    status: "building",
    buildCommand: "",
    outputDirectory: "",
    framework: "static",
  }).returning();

  await db.insert(deploymentLogs).values({
    deploymentId: dep.id,
    message: "Upload received, processing...",
    type: "info",
  });

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(zipPath, buffer);

  await db.insert(deploymentLogs).values({
    deploymentId: dep.id,
    message: "Extracting archive...",
    type: "info",
  });

  let extractedFiles: string[];
  try {
    extractedFiles = await extractZip(zipPath, extractDir);
  } catch (e: any) {
    await db.update(deployments).set({ status: "failed" }).where(eq(deployments.id, dep.id));
    await db.insert(deploymentLogs).values({
      deploymentId: dep.id,
      message: `Extraction failed: ${e.message}`,
      type: "error",
    });
    return c.json({ error: "Failed to extract archive" }, 400);
  }

  await db.insert(deploymentLogs).values({
    deploymentId: dep.id,
    message: `Extracted ${extractedFiles.length} files`,
    type: "info",
  });

  const buildpack = await detectFramework(extractedFiles);
  const fw = ["nextjs", "static", "node"].includes(buildpack.framework) ? buildpack.framework : "static";
  await db.update(deployments).set({ framework: fw as any }).where(eq(deployments.id, dep.id));

  await db.insert(deploymentLogs).values({
    deploymentId: dep.id,
    message: `Detected framework: ${buildpack.name}`,
    type: "info",
  });

  (async () => {
    try {
      await db.insert(deploymentLogs).values({
        deploymentId: dep.id,
        message: "Provisioning server on DigitalOcean...",
        type: "info",
      });

      const deployScript = generateDeployScript(buildpack, extractDir, "", envVars);
      const userData = `#!/bin/bash
set -e
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
mkdir -p /opt/deploy
cat > /opt/deploy/deploy.sh << 'DEPLOYSCRIPT'
${deployScript}
DEPLOYSCRIPT
chmod +x /opt/deploy/deploy.sh
bash /opt/deploy/deploy.sh
`;

      const { droplet } = await doFetch("/droplets", {
        method: "POST",
        body: JSON.stringify({
          name: `ch-${subdomain}`,
          region,
          size: "s-1vcpu-1gb",
          image: "ubuntu-24-04-x64",
          tags: ["cloudhost", "upload-deploy"],
          user_data: userData,
        }),
      });

      await db.update(deployments).set({
        buildCommand: `Provisioned droplet ${droplet.id}`,
      }).where(eq(deployments.id, dep.id));

      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const { droplet: d } = await doFetch(`/droplets/${droplet.id}`);
        const publicIp = d.networks?.v4?.find((n: any) => n.type === "public")?.ip_address;

        if (publicIp && d.status === "active") {
          const url = `http://${publicIp}:${buildpack.port}`;
          await db.update(deployments).set({
            status: "running",
            domain: url,
          }).where(eq(deployments.id, dep.id));

          await db.insert(deploymentLogs).values({
            deploymentId: dep.id,
            message: `Deployed at ${url}`,
            type: "info",
          });
          return;
        }

        if (i % 6 === 0) {
          await db.insert(deploymentLogs).values({
            deploymentId: dep.id,
            message: `Waiting for server... (${(i + 1) * 5}s)`,
            type: "info",
          });
        }
      }

      await db.update(deployments).set({ status: "failed" }).where(eq(deployments.id, dep.id));
      await db.insert(deploymentLogs).values({
        deploymentId: dep.id,
        message: "Server provisioning timed out",
        type: "error",
      });
    } catch (e: any) {
      await db.update(deployments).set({ status: "failed" }).where(eq(deployments.id, dep.id));
      await db.insert(deploymentLogs).values({
        deploymentId: dep.id,
        message: `Deploy failed: ${e.message}`,
        type: "error",
      });
    }
  })();

  return c.json({ deployment: dep, detectedFramework: buildpack }, 202);
});

deployUploadRouter.get("/buildpacks", async (c) => {
  return c.json({ buildpacks });
});
