"use client";

import { useState, useEffect } from "react";

const defaultFeatures = [
  { id: "ai-builder", name: "AI Builder", description: "AI-powered website generation tool", category: "AI", enabled: true },
  { id: "ai-assistant", name: "AI Assistant", description: "Conversational AI help and support", category: "AI", enabled: true },
  { id: "workflows", name: "Workflows", description: "n8n-style automation workflows", category: "Automation", enabled: true },
  { id: "cron-jobs", name: "Cron Jobs", description: "Scheduled task execution", category: "Automation", enabled: true },
  { id: "edge-functions", name: "Edge Functions", description: "Serverless functions at the edge", category: "Compute", enabled: true },
  { id: "site-builder", name: "Site Builder", description: "Drag & drop website builder", category: "Hosting", enabled: true },
  { id: "vps", name: "VPS Servers", description: "Virtual private server provisioning", category: "Hosting", enabled: true },
  { id: "wordpress", name: "WordPress Hosting", description: "Managed WordPress deployment", category: "Hosting", enabled: true },
  { id: "databases", name: "Databases", description: "PostgreSQL, MySQL, Redis database hosting", category: "Storage", enabled: true },
  { id: "cdn", name: "CDN & Security", description: "Content delivery network and WAF", category: "Network", enabled: true },
  { id: "ssl", name: "SSL Certificates", description: "Free Let's Encrypt SSL certificates", category: "Network", enabled: true },
  { id: "domains", name: "Domain Registration", description: "Domain search, registration, and transfers", category: "Network", enabled: true },
  { id: "cloudflare", name: "Cloudflare Integration", description: "Cloudflare DNS, CDN, Workers, R2", category: "Integrations", enabled: true },
  { id: "hostinger", name: "Hostinger Services", description: "Hostinger hosting and tools marketplace", category: "Integrations", enabled: true },
  { id: "marketplace", name: "App Catalog", description: "One-click app deployment marketplace", category: "Marketplace", enabled: true },
  { id: "team", name: "Team Collaboration", description: "Multi-user team management", category: "Platform", enabled: true },
  { id: "oauth", name: "OAuth Providers", description: "Google and GitHub social login", category: "Auth", enabled: false },
  { id: "realtime", name: "Realtime Subscriptions", description: "Live database change subscriptions", category: "Database", enabled: true },
  { id: "file-manager", name: "File Manager", description: "Browser-based file management", category: "Hosting", enabled: true },
  { id: "analytics", name: "Analytics Dashboard", description: "Usage analytics and reporting", category: "Platform", enabled: true },
  { id: "email", name: "Business Email", description: "Professional email hosting", category: "Communications", enabled: true },
  { id: "backups", name: "Automated Backups", description: "Scheduled database and file backups", category: "Platform", enabled: true },
];

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<any[]>(() => {
    const saved = localStorage.getItem("admin_features");
    return saved ? JSON.parse(saved) : defaultFeatures;
  });

  useEffect(() => {
    localStorage.setItem("admin_features", JSON.stringify(features));
  }, [features]);

  const toggle = (id: string) => {
    setFeatures(prev => prev.map(f =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ));
  };

  const enabledCount = features.filter(f => f.enabled).length;
  const categories = [...new Set(features.map(f => f.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-gray-500">Enable or disable platform features and functionality</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success">{enabledCount} Enabled</span>
          <span className="badge badge-error">{features.length - enabledCount} Disabled</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-brand-600">{features.length}</p>
          <p className="text-xs text-gray-500">Total Features</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{enabledCount}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{features.length - enabledCount}</p>
          <p className="text-xs text-gray-500">Disabled</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{((enabledCount / features.length) * 100).toFixed(0)}%</p>
          <p className="text-xs text-gray-500">Uptime</p>
        </div>
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">{cat}</h2>
          <div className="grid gap-3">
            {features.filter(f => f.category === cat).map(feature => (
              <div key={feature.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.enabled ? "bg-green-100" : "bg-gray-100"}`}>
                      <span className={`text-sm font-bold ${feature.enabled ? "text-green-700" : "text-gray-400"}`}>
                        {feature.name[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${feature.enabled ? "text-gray-900" : "text-gray-400"}`}>{feature.name}</h3>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${feature.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {feature.enabled ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <p className={`text-sm ${feature.enabled ? "text-gray-500" : "text-gray-400"}`}>{feature.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(feature.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${feature.enabled ? "bg-brand-600" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${feature.enabled ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}