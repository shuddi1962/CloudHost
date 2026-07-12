import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, dockerDeployments } from "@cloudhost/db";

const DO_API = "https://api.digitalocean.com/v2";
const CF_API = "https://api.cloudflare.com/client/v4";

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

async function registerCloudflareDns(subdomain: string, ip: string): Promise<string | null> {
  const cfToken = process.env.CLOUDFLARE_API_TOKEN;
  const cfZone = process.env.CLOUDFLARE_ZONE_ID;
  if (!cfToken || !cfZone) return null;

  const baseDomain = process.env.CLOUDHOST_INSTANCE_DOMAIN || "cloudhost.app";
  const fullDomain = `${subdomain}.${baseDomain}`;

  try {
    await fetch(`${CF_API}/zones/${cfZone}/dns_records`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "A", name: fullDomain, content: ip, proxied: false, ttl: 120 }),
    });
    return `https://${fullDomain}`;
  } catch {
    return `http://${ip}`;
  }
}

export const dockerRouter = new Hono();

const buildpacks = [
  { name: "Next.js", framework: "nextjs", language: "typescript", detectFiles: ["next.config.js", "next.config.ts", "next.config.mjs"], buildCommand: "npm run build", startCommand: "npm start", defaultPort: 3000 },
  { name: "Node.js", framework: "node", language: "javascript", detectFiles: ["package.json", "server.js", "app.js", "index.js"], buildCommand: "npm install", startCommand: "node server.js", defaultPort: 3000 },
  { name: "Python Django", framework: "django", language: "python", detectFiles: ["manage.py", "requirements.txt"], buildCommand: "pip install -r requirements.txt", startCommand: "python manage.py runserver", defaultPort: 8000 },
  { name: "Python Flask", framework: "flask", language: "python", detectFiles: ["app.py", "wsgi.py", "requirements.txt"], buildCommand: "pip install -r requirements.txt", startCommand: "python app.py", defaultPort: 5000 },
  { name: "Python FastAPI", framework: "fastapi", language: "python", detectFiles: ["main.py", "requirements.txt"], buildCommand: "pip install -r requirements.txt", startCommand: "uvicorn main:app", defaultPort: 8000 },
  { name: "PHP", framework: "php", language: "php", detectFiles: ["index.php", "composer.json"], buildCommand: "composer install", startCommand: "php -S 0.0.0.0:8080", defaultPort: 8080 },
  { name: "Laravel", framework: "laravel", language: "php", detectFiles: ["artisan", "composer.json"], buildCommand: "composer install && php artisan optimize", startCommand: "php artisan serve", defaultPort: 8000 },
  { name: "WordPress", framework: "wordpress", language: "php", detectFiles: ["wp-config.php", "wp-content"], buildCommand: "", startCommand: "", defaultPort: 80 },
  { name: "Ruby Rails", framework: "rails", language: "ruby", detectFiles: ["Gemfile", "config.ru", "Rakefile"], buildCommand: "bundle install", startCommand: "rails server", defaultPort: 3000 },
  { name: "Go", framework: "go", language: "go", detectFiles: ["go.mod", "main.go", "go.sum"], buildCommand: "go build -o app", startCommand: "./app", defaultPort: 8080 },
  { name: "Java Spring", framework: "spring", language: "java", detectFiles: ["pom.xml", "build.gradle", "mvnw", "gradlew"], buildCommand: "./mvnw package", startCommand: "java -jar target/*.jar", defaultPort: 8080 },
  { name: "Static Site", framework: "static", language: "html", detectFiles: ["index.html", "index.htm"], buildCommand: "", startCommand: "", defaultPort: 80 },
  { name: "React (Vite)", framework: "react", language: "typescript", detectFiles: ["vite.config.ts", "vite.config.js"], buildCommand: "npm run build", startCommand: "npm run preview", defaultPort: 4173 },
  { name: "Vue.js", framework: "vue", language: "javascript", detectFiles: ["vue.config.js", "nuxt.config.js", "nuxt.config.ts"], buildCommand: "npm run build", startCommand: "npm run start", defaultPort: 3000 },
  { name: "Dockerfile", framework: "docker", language: "any", detectFiles: ["Dockerfile"], buildCommand: "", startCommand: "", defaultPort: 80 },
];

dockerRouter.get("/buildpacks", async (c) => c.json({ buildpacks }));

dockerRouter.post("/detect", async (c) => {
  const body = await c.req.json();
  const files = body.files || [];
  const matched = buildpacks.filter(bp =>
    bp.detectFiles.some(df => files.some((f: string) => f.includes(df) || f.endsWith(df)))
  );
  return c.json({ detected: matched, all: buildpacks });
});

dockerRouter.post("/deploy", async (c) => {
  const body = await c.req.json();
  const payload = c.get("jwtPayload") as { sub: string };
  const framework = body.framework || "custom";
  const subdomain = (body.name || "app").toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.random().toString(36).slice(2, 6);

  const [deployment] = await db.insert(dockerDeployments).values({
    userId: payload.sub,
    name: body.name,
    image: body.image,
    buildType: body.buildType || "buildpack",
    source: body.source,
    framework,
    port: body.port || 3000,
    envVars: body.envVars || {},
    volumes: body.volumes || [],
    replicas: body.replicas || 1,
    url: "",
    status: "deploying",
    logs: [{ time: new Date().toISOString(), message: `Detected framework: ${framework}` }],
    resources: body.resources || { cpu: "0.5", memory: "512M" },
  }).returning();

  // Deploy asynchronously: create DO droplet, install Docker, pull & run image
  (async () => {
    const addLog = async (message: string) => {
      const current = await db.select().from(dockerDeployments).where(eq(dockerDeployments.id, deployment.id)).limit(1);
      const existingLogs = (current[0]?.logs as any[]) || [];
      await db.update(dockerDeployments).set({
        logs: [...existingLogs, { time: new Date().toISOString(), message }],
        updatedAt: new Date(),
      }).where(eq(dockerDeployments.id, deployment.id));
    };

    try {
      await addLog("Provisioning server on DigitalOcean...");

      const userData = `#!/bin/bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
${body.image ? `docker pull ${body.image}\ndocker run -d --restart unless-stopped -p ${body.port || 3000}:${body.port || 3000} --name ${subdomain} ${body.image}` : ""}
`;

      const { droplet } = await doFetch("/droplets", {
        method: "POST",
        body: JSON.stringify({
          name: `ch-${subdomain}`,
          region: body.region || "nyc1",
          size: "s-1vcpu-1gb",
          image: "ubuntu-24-04-x64",
          tags: ["cloudhost", "docker-deployment"],
          user_data: userData,
        }),
      });

      await db.update(dockerDeployments).set({ providerId: String(droplet.id) }).where(eq(dockerDeployments.id, deployment.id));
      await addLog(`Server provisioning (ID: ${droplet.id})...`);

      // Poll for public IP
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const { droplet: d } = await doFetch(`/droplets/${droplet.id}`);
        const publicIp = d.networks?.v4?.find((n: any) => n.type === "public")?.ip_address;

        if (publicIp && d.status === "active") {
          const url = await registerCloudflareDns(subdomain, publicIp) || `http://${publicIp}`;

          await db.update(dockerDeployments).set({
            status: "running",
            url,
            updatedAt: new Date(),
            logs: [
              ...(deployment.logs as any[]),
              { time: new Date().toISOString(), message: `Provisioned at ${publicIp}` },
              { time: new Date().toISOString(), message: `Available at ${url}` },
            ],
          }).where(eq(dockerDeployments.id, deployment.id));

          return;
        }

        await addLog(`Waiting for server IP (${(i + 1) * 5}s)...`);
      }

      await addLog("Server provisioning timed out");
      await db.update(dockerDeployments).set({ status: "failed", updatedAt: new Date() })
        .where(eq(dockerDeployments.id, deployment.id));
    } catch (err: any) {
      await addLog(`Deploy failed: ${err.message}`);
      await db.update(dockerDeployments).set({ status: "failed", updatedAt: new Date() })
        .where(eq(dockerDeployments.id, deployment.id));
    }
  })();

  return c.json({ deployment }, 201);
});

dockerRouter.get("/deployments", async (c) => {
  const payload = c.get("jwtPayload") as { sub: string };
  const deps = await db.select().from(dockerDeployments).where(eq(dockerDeployments.userId, payload.sub));
  return c.json({ deployments: deps });
});

dockerRouter.get("/deployments/:id", async (c) => {
  const id = c.req.param("id");
  const [dep] = await db.select().from(dockerDeployments).where(eq(dockerDeployments.id, id)).limit(1);
  if (!dep) return c.json({ error: "Not found" }, 404);
  return c.json({ deployment: dep });
});

dockerRouter.post("/deployments/:id/restart", async (c) => {
  const id = c.req.param("id");
  const [current] = await db.select().from(dockerDeployments).where(eq(dockerDeployments.id, id)).limit(1);
  const existingLogs = (current?.logs as any[]) || [];
  const [updated] = await db.update(dockerDeployments).set({
    status: "running",
    logs: [...existingLogs, { time: new Date().toISOString(), message: "Restarting..." }],
    updatedAt: new Date(),
  }).where(eq(dockerDeployments.id, id)).returning();
  return c.json({ deployment: updated });
});

dockerRouter.post("/deployments/:id/stop", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db.update(dockerDeployments).set({ status: "stopped", updatedAt: new Date() })
    .where(eq(dockerDeployments.id, id)).returning();
  return c.json({ deployment: updated });
});

dockerRouter.delete("/deployments/:id", async (c) => {
  const id = c.req.param("id");
  const [dep] = await db.select().from(dockerDeployments).where(eq(dockerDeployments.id, id)).limit(1);
  if (dep?.providerId) {
    try {
      await doFetch(`/droplets/${dep.providerId}`, { method: "DELETE" });
    } catch {}
  }
  await db.delete(dockerDeployments).where(eq(dockerDeployments.id, id));
  return c.json({ success: true });
});

dockerRouter.put("/deployments/:id/env", async (c) => {
  const id = c.req.param("id");
  const { envVars } = await c.req.json();
  const [dep] = await db.select().from(dockerDeployments).where(eq(dockerDeployments.id, id)).limit(1);
  if (!dep) return c.json({ error: "Not found" }, 404);
  const merged = { ...(dep.envVars as Record<string, string>), ...envVars };
  const [updated] = await db.update(dockerDeployments).set({ envVars: merged, updatedAt: new Date() })
    .where(eq(dockerDeployments.id, id)).returning();
  return c.json({ deployment: updated });
});

dockerRouter.put("/deployments/:id/scale", async (c) => {
  const id = c.req.param("id");
  const { replicas } = await c.req.json();
  const [updated] = await db.update(dockerDeployments).set({ replicas, updatedAt: new Date() })
    .where(eq(dockerDeployments.id, id)).returning();
  return c.json({ deployment: updated });
});

dockerRouter.put("/deployments/:id/domain", async (c) => {
  const id = c.req.param("id");
  const { domain, sslEnabled } = await c.req.json();
  const [updated] = await db.update(dockerDeployments).set({ domain, sslEnabled: sslEnabled ?? false, updatedAt: new Date() })
    .where(eq(dockerDeployments.id, id)).returning();
  return c.json({ deployment: updated });
});
