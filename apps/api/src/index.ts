import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

import { jwtAuth } from "./middleware/auth";
import { authRouter } from "./routes/auth";
import { projectsRouter } from "./routes/projects";
import { deploymentsRouter } from "./routes/deployments";
import { databasesRouter } from "./routes/databases";
import { workflowsRouter } from "./routes/workflows";
import { wordpressRouter } from "./routes/wordpress";
import { domainsRouter } from "./routes/domains";
import { emailRouter } from "./routes/email";
import { storageRouter } from "./routes/storage";
import { filesRouter } from "./routes/files";
import { adminRouter } from "./routes/admin";
import { sqlRouter } from "./routes/sql";
import { edgeFunctionsRouter } from "./routes/edge-functions";
import { backupsRouter } from "./routes/backups";
import { credentialsRouter } from "./routes/credentials-routes";
import { teamRouter } from "./routes/team";
import { sslRouter } from "./routes/ssl";
import { vpsRouter } from "./routes/vps";
import { cdnRouter } from "./routes/cdn";
import { rlsRouter } from "./routes/rls";
import { realtimeRouter } from "./routes/realtime";
import { extensionsRouter } from "./routes/extensions";
import { authProvidersRouter } from "./routes/auth-providers";
import { previewDeploymentsRouter } from "./routes/preview-deployments";
import { webhooksRouter } from "./routes/webhooks";
import { hostingRouter } from "./routes/hosting";
import { dockerRouter } from "./routes/docker-deployments";
import { marketplaceRouter } from "./routes/marketplace";
import { whmcsRouter } from "./routes/whmcs";
import { cloudflareComputeRouter } from "./routes/cloudflare-compute";
import { cloudflareStorageRouter } from "./routes/cloudflare-storage";
import { cloudflareAiRouter } from "./routes/cloudflare-ai";
import { cloudflareMediaRouter } from "./routes/cloudflare-media";
import { cloudflareSecurityRouter } from "./routes/cloudflare-security";
import { cloudflareNetworkRouter } from "./routes/cloudflare-network";
import { cloudflareZeroTrustRouter } from "./routes/cloudflare-zero-trust";
import { domainServicesRouter } from "./routes/domain-services";
import { businessToolsRouter } from "./routes/business-tools";
import { marketingSuiteRouter } from "./routes/marketing-suite";
import { hostingerServicesRouter } from "./routes/hostinger-services";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("FATAL: JWT_SECRET environment variable is required");
  process.exit(1);
}

const app = new Hono();

app.use("*", cors({
  origin: process.env.DASHBOARD_URL || "http://localhost:3000",
  credentials: true,
}));

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

app.route("/api/auth", authRouter);

app.use("/api/*", jwtAuth);

app.route("/api/projects", projectsRouter);
app.route("/api/deployments", deploymentsRouter);
app.route("/api/databases", databasesRouter);
app.route("/api/workflows", workflowsRouter);
app.route("/api/wordpress", wordpressRouter);
app.route("/api/domains", domainsRouter);
app.route("/api/email", emailRouter);
app.route("/api/storage", storageRouter);
app.route("/api/files", filesRouter);
app.route("/api/admin", adminRouter);
app.route("/api/sql", sqlRouter);
app.route("/api/edge-functions", edgeFunctionsRouter);
app.route("/api/backups", backupsRouter);
app.route("/api/credentials", credentialsRouter);
app.route("/api/team", teamRouter);
app.route("/api/ssl", sslRouter);
app.route("/api/vps", vpsRouter);
app.route("/api/cdn", cdnRouter);
app.route("/api/rls", rlsRouter);
app.route("/api/realtime", realtimeRouter);
app.route("/api/extensions", extensionsRouter);
app.route("/api/auth-providers", authProvidersRouter);
app.route("/api/preview-deployments", previewDeploymentsRouter);
app.route("/api/webhooks", webhooksRouter);
app.route("/api/hosting", hostingRouter);
app.route("/api/docker", dockerRouter);
app.route("/api/marketplace", marketplaceRouter);
app.route("/api/whmcs", whmcsRouter);
app.route("/api/cloudflare/compute", cloudflareComputeRouter);
app.route("/api/cloudflare/storage", cloudflareStorageRouter);
app.route("/api/cloudflare/ai", cloudflareAiRouter);
app.route("/api/cloudflare/media", cloudflareMediaRouter);
app.route("/api/cloudflare/security", cloudflareSecurityRouter);
app.route("/api/cloudflare/network", cloudflareNetworkRouter);
app.route("/api/cloudflare/zero-trust", cloudflareZeroTrustRouter);
app.route("/api/domain-services", domainServicesRouter);
app.route("/api/business-tools", businessToolsRouter);
app.route("/api/marketing-suite", marketingSuiteRouter);
app.route("/api/hostinger-services", hostingerServicesRouter);

const port = parseInt(process.env.API_PORT || "3001");
console.log(`API server running on port ${port}`);

serve({ fetch: app.fetch, port });
