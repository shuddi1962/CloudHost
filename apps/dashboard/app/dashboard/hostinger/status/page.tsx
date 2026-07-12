"use client";

import { useState } from "react";

interface FeatureStatus {
  area: string;
  status: "live" | "beta" | "coming-soon";
  description: string;
}

const FEATURES: FeatureStatus[] = [
  { area: "Deployments (Git)", status: "live", description: "Deploy apps from GitHub repositories with auto-detected frameworks" },
  { area: "Deployments (Upload)", status: "live", description: "Deploy PHP, WordPress, and static sites from zip uploads" },
  { area: "Databases", status: "live", description: "Provision PostgreSQL, MySQL, and Redis databases" },
  { area: "Workflows", status: "live", description: "Visual workflow automation with HTTP, email, AI, and database nodes" },
  { area: "VPS Servers", status: "live", description: "Provision and manage virtual private servers via DigitalOcean" },
  { area: "Docker Deployments", status: "live", description: "Deploy containerized apps on provisioned infrastructure" },
  { area: "File Manager", status: "live", description: "Browser-based file management" },
  { area: "SSL Certificates", status: "live", description: "Free Let's Encrypt SSL certificate management" },
  { area: "Cron Jobs", status: "live", description: "Scheduled task execution" },
  { area: "Credentials", status: "live", description: "Encrypted credential storage for API keys and secrets" },
  { area: "Cloudflare Workers", status: "beta", description: "Deploy serverless workers via Cloudflare API" },
  { area: "Cloudflare Storage (R2/D1/KV)", status: "beta", description: "Cloudflare-backed object, document, and key-value storage" },
  { area: "Domains & DNS", status: "beta", description: "Domain registration and DNS management" },
  { area: "Email", status: "beta", description: "Business email and SMTP configuration" },
  { area: "Supabase Integration", status: "beta", description: "Supabase project management and edge functions" },
  { area: "Marketplace", status: "beta", description: "One-click app catalog and third-party integrations" },
  { area: "Google Cloud (GCP)", status: "coming-soon", description: "GCP Compute Engine, Storage, and AI/ML resource provisioning" },
  { area: "AWS", status: "coming-soon", description: "EC2, S3, and Lambda resource provisioning" },
  { area: "Hostinger Services", status: "coming-soon", description: "Agency hosting, WooCommerce, and managed WordPress" },
  { area: "AI Builder", status: "coming-soon", description: "AI-powered site generation and deployment" },
  { area: "Site Builder", status: "coming-soon", description: "Drag-and-drop website builder" },
  { area: "WHM/cPanel", status: "coming-soon", description: "Shared hosting management (planned for future)" },
];

const STATUS_STYLES: Record<string, { label: string; class: string }> = {
  "live": { label: "Live", class: "bg-green-100 text-green-700" },
  "beta": { label: "Beta", class: "bg-blue-100 text-blue-700" },
  "coming-soon": { label: "Coming Soon", class: "bg-gray-100 text-gray-500" },
};

export default function PlatformStatusPage() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? FEATURES : FEATURES.filter(f => f.status === filter);

  const liveCount = FEATURES.filter(f => f.status === "live").length;
  const betaCount = FEATURES.filter(f => f.status === "beta").length;
  const comingCount = FEATURES.filter(f => f.status === "coming-soon").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Status</h1>
          <p className="text-sm text-gray-500 mt-1">What&apos;s real, what&apos;s in beta, and what&apos;s coming next</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{liveCount}</p>
          <p className="text-xs text-gray-500 mt-1">Live</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{betaCount}</p>
          <p className="text-xs text-gray-500 mt-1">Beta</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{comingCount}</p>
          <p className="text-xs text-gray-500 mt-1">Coming Soon</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: "all", label: `All (${FEATURES.length})` },
          { key: "live", label: `Live (${liveCount})` },
          { key: "beta", label: `Beta (${betaCount})` },
          { key: "coming-soon", label: `Coming Soon (${comingCount})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${filter === f.key ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-gray-100">
        {filtered.map(f => {
          const s = STATUS_STYLES[f.status];
          return (
            <div key={f.area} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium">{f.area}</p>
                <p className="text-xs text-gray-400 mt-0.5">{f.description}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.class}`}>{s.label}</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        This page is updated as each feature area reaches production readiness.
      </p>
    </div>
  );
}
