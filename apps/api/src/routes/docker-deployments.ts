import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, dockerDeployments, buildpackDetections } from "@cloudhost/db";

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
  { name: "Java (generic)", framework: "java", language: "java", detectFiles: ["Dockerfile", "pom.xml", "build.gradle"], buildCommand: "./mvnw package", startCommand: "java -jar app.jar", defaultPort: 8080 },
  { name: ".NET Core", framework: "dotnet", language: "csharp", detectFiles: ["*.csproj", "Program.cs", "Startup.cs"], buildCommand: "dotnet publish -c Release", startCommand: "dotnet run", defaultPort: 5000 },
  { name: "Static Site", framework: "static", language: "html", detectFiles: ["index.html", "index.htm"], buildCommand: "", startCommand: "", defaultPort: 80 },
  { name: "React (Vite)", framework: "react", language: "typescript", detectFiles: ["vite.config.ts", "vite.config.js"], buildCommand: "npm run build", startCommand: "npm run preview", defaultPort: 4173 },
  { name: "Vue.js", framework: "vue", language: "javascript", detectFiles: ["vue.config.js", "nuxt.config.js", "nuxt.config.ts"], buildCommand: "npm run build", startCommand: "npm run start", defaultPort: 3000 },
  { name: "Python (generic)", framework: "python", language: "python", detectFiles: ["setup.py", "pyproject.toml", "requirements.txt"], buildCommand: "pip install -r requirements.txt", startCommand: "python main.py", defaultPort: 8000 },
  { name: "Dockerfile", framework: "docker", language: "any", detectFiles: ["Dockerfile"], buildCommand: "", startCommand: "", defaultPort: 80 },
  { name: "Deno", framework: "deno", language: "typescript", detectFiles: ["deno.json", "deno.jsonc", "main.ts", "main.js"], buildCommand: "", startCommand: "deno run --allow-net --allow-read main.ts", defaultPort: 8000 },
  { name: "Elixir Phoenix", framework: "phoenix", language: "elixir", detectFiles: ["mix.exs"], buildCommand: "mix deps.get", startCommand: "mix phx.server", defaultPort: 4000 },
  { name: "Rust", framework: "rust", language: "rust", detectFiles: ["Cargo.toml"], buildCommand: "cargo build --release", startCommand: "./target/release/app", defaultPort: 8080 },
  { name: "Django (Python)", framework: "django", language: "python", detectFiles: ["manage.py"], buildCommand: "pip install -r requirements.txt", startCommand: "gunicorn --bind 0.0.0.0:8000 project.wsgi", defaultPort: 8000 },
];

dockerRouter.get("/buildpacks", async (c) => {
  return c.json({ buildpacks });
});

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
  const url = `https://${subdomain}.cloudhost.app`;

  const [deployment] = await db.insert(dockerDeployments).values({
    userId: payload.sub,
    name: body.name,
    image: body.image,
    buildType: body.buildType || "buildpack",
    source: body.source,
    framework: framework,
    port: body.port || 3000,
    envVars: body.envVars || {},
    volumes: body.volumes || [],
    replicas: body.replicas || 1,
    url,
    status: "deploying",
    logs: [{ time: new Date().toISOString(), message: `Detected framework: ${framework}` }],
    resources: body.resources || { cpu: "0.5", memory: "512M" },
  }).returning();

  const steps = [
    `Cloning source from ${body.source || "uploaded files"}...`,
    body.buildType === "dockerfile" ? "Building Docker image..." : `Detected framework: ${framework}`,
    body.buildType !== "dockerfile" && framework !== "static" ? `Installing dependencies...` : "Preparing container...",
    `Starting ${framework} on port ${body.port || 3000}...`,
    `Deployed to ${url}`,
  ];

  steps.forEach((msg, i) => {
    setTimeout(async () => {
      const current = await db.select().from(dockerDeployments).where(eq(dockerDeployments.id, deployment.id)).limit(1);
      const existingLogs = (current[0]?.logs as any[]) || [];
      await db.update(dockerDeployments).set({
        logs: [...existingLogs, { time: new Date().toISOString(), message: msg }],
        status: i === steps.length - 1 ? "running" : "deploying",
        updatedAt: new Date(),
      }).where(eq(dockerDeployments.id, deployment.id));
    }, i * 2000);
  });

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
  const [updated] = await db.update(dockerDeployments).set({ status: "stopped", updatedAt: new Date() }).where(eq(dockerDeployments.id, id)).returning();
  return c.json({ deployment: updated });
});

dockerRouter.delete("/deployments/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(dockerDeployments).where(eq(dockerDeployments.id, id));
  return c.json({ success: true });
});

dockerRouter.put("/deployments/:id/env", async (c) => {
  const id = c.req.param("id");
  const { envVars } = await c.req.json();
  const [dep] = await db.select().from(dockerDeployments).where(eq(dockerDeployments.id, id)).limit(1);
  if (!dep) return c.json({ error: "Not found" }, 404);
  const merged = { ...(dep.envVars as Record<string, string>), ...envVars };
  const [updated] = await db.update(dockerDeployments).set({ envVars: merged, updatedAt: new Date() }).where(eq(dockerDeployments.id, id)).returning();
  return c.json({ deployment: updated });
});

dockerRouter.put("/deployments/:id/scale", async (c) => {
  const id = c.req.param("id");
  const { replicas } = await c.req.json();
  const [updated] = await db.update(dockerDeployments).set({ replicas, updatedAt: new Date() }).where(eq(dockerDeployments.id, id)).returning();
  return c.json({ deployment: updated });
});

dockerRouter.put("/deployments/:id/domain", async (c) => {
  const id = c.req.param("id");
  const { domain, sslEnabled } = await c.req.json();
  const [updated] = await db.update(dockerDeployments).set({ domain, sslEnabled: sslEnabled ?? false, updatedAt: new Date() }).where(eq(dockerDeployments.id, id)).returning();
  return c.json({ deployment: updated });
});
