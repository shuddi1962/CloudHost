/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cloudhost/db", "@cloudhost/ui"],
  async redirects() {
    const segments = [
      "admin", "ai-assistant", "ai-builder", "analytics", "api",
      "app-catalog", "backups", "cdn", "cloudflare", "control-panel",
      "credentials", "cron-jobs", "databases", "deployments", "domains",
      "edge-functions", "email", "files", "ftp-accounts", "hosting",
      "hostinger", "marketplace", "php-settings", "projects", "services",
      "settings", "site-builder", "sql-editor", "ssl", "table-editor",
      "team", "vps", "whmcs", "wordpress", "workflows",
    ];
    return segments.flatMap((s) => [
      { source: `/${s}`, destination: `/dashboard/${s}`, permanent: true },
      { source: `/${s}/:path*`, destination: `/dashboard/${s}/:path*`, permanent: true },
    ]);
  },
};

module.exports = nextConfig;
