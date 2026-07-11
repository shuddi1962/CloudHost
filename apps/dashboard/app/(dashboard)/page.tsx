"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const quickActions = [
  { href: "/projects", label: "New Project", desc: "Create a new project", color: "bg-blue-500" },
  { href: "/deployments", label: "Deploy App", desc: "Next.js, Node, PHP, static", color: "bg-purple-500" },
  { href: "/databases", label: "Create Database", desc: "PostgreSQL, MySQL, Redis", color: "bg-green-500" },
  { href: "/workflows", label: "New Workflow", desc: "Build automation workflows", color: "bg-orange-500" },
  { href: "/wordpress", label: "Install WordPress", desc: "Launch a WordPress site", color: "bg-cyan-500" },
  { href: "/domains", label: "Add Domain", desc: "Connect your custom domain", color: "bg-indigo-500" },
  { href: "/vps", label: "Deploy VPS", desc: "Virtual private server", color: "bg-red-500" },
  { href: "/ai-builder", label: "AI Builder", desc: "AI website generator", color: "bg-pink-500" },
  { href: "/site-builder", label: "Site Builder", desc: "Drag & drop builder", color: "bg-teal-500" },
  { href: "/app-catalog", label: "App Catalog", desc: "1-click app deploy", color: "bg-yellow-500" },
  { href: "/edge-functions", label: "Edge Functions", desc: "Serverless functions", color: "bg-violet-500" },
  { href: "/domains/search", label: "Find Domain", desc: "Search & register domains", color: "bg-sky-500" },
];

const demoStats = [
  { label: "Projects", value: "4", href: "/projects", color: "text-blue-600" },
  { label: "Deployments", value: "12", href: "/deployments", color: "text-purple-600" },
  { label: "Databases", value: "3", href: "/databases", color: "text-green-600" },
  { label: "VPS Servers", value: "2", href: "/vps", color: "text-red-600" },
  { label: "WordPress Sites", value: "1", href: "/wordpress", color: "text-cyan-600" },
  { label: "Workflows", value: "5", href: "/workflows", color: "text-orange-600" },
  { label: "Domains", value: "3", href: "/domains", color: "text-indigo-600" },
  { label: "Edge Functions", value: "7", href: "/edge-functions", color: "text-violet-600" },
];

const recentDeployments = [
  { name: "acme-website", branch: "main", commit: "2a4b8c1", status: "ready", url: "acme-website.cloudhost.app", time: "2m ago", framework: "Next.js" },
  { name: "ecommerce-store", branch: "feat/payment-methods", commit: "9d7e3f2", status: "ready", url: "ecommerce-store-git-feat-payment.cloudhost.app", time: "15m ago", framework: "React" },
  { name: "saas-dashboard", branch: "develop", commit: "5b1c8d4", status: "building", url: "saas-dashboard-git-develop.cloudhost.app", time: "5m ago", framework: "Next.js" },
  { name: "api-backend", branch: "main", commit: "3f6a2e9", status: "error", url: "api-backend.cloudhost.app", time: "1h ago", framework: "Node.js" },
];

const frameworkColors: Record<string, string> = {
  "Next.js": "bg-black", "React": "bg-blue-400", "Node.js": "bg-green-600", "PHP": "bg-indigo-600",
};

const recentActivity = [
  { action: "Deployed", target: "Next.js Blog", type: "Deployment", time: "2 min ago", color: "bg-purple-500" },
  { action: "Created", target: "MySQL Database (prod-db)", type: "Database", time: "15 min ago", color: "bg-green-500" },
  { action: "Pushed", target: "main → cloudhost-webapp", type: "Git", time: "1 hour ago", color: "bg-gray-500" },
  { action: "Added", target: "Domain (myapp.com)", type: "Domain", time: "3 hours ago", color: "bg-indigo-500" },
  { action: "Scaled", target: "VPS Node (us-east-1a)", type: "Infra", time: "5 hours ago", color: "bg-red-500" },
  { action: "Generated", target: "SSL Certificate (wildcard)", type: "SSL", time: "1 day ago", color: "bg-cyan-500" },
  { action: "Configured", target: "WAF Rules (DDoS protection)", type: "Security", time: "2 days ago", color: "bg-orange-500" },
  { action: "Deployed", target: "Edge Function (auth-webhook)", type: "Functions", time: "3 days ago", color: "bg-violet-500" },
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || "User"}</h1>
        <p className="text-gray-500">Here&apos;s what&apos;s happening with your projects today</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {demoStats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-5 hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Deployments</h2>
          <Link href="/deployments" className="text-sm text-brand-600 hover:text-brand-800 font-medium">View all</Link>
        </div>
        <div className="grid gap-3">
          {recentDeployments.map((dep) => (
            <div key={dep.name + dep.branch} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${frameworkColors[dep.framework] || "bg-gray-600"} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm font-bold">{dep.framework[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{dep.name}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      dep.status === "ready" ? "bg-green-100 text-green-700" :
                      dep.status === "building" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        dep.status === "ready" ? "bg-green-500" :
                        dep.status === "building" ? "bg-yellow-500" :
                        "bg-red-500"
                      }`} />
                      {dep.status === "ready" ? "Ready" : dep.status === "building" ? "Building" : "Error"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {dep.branch}
                    </span>
                    <span>{dep.commit}</span>
                    <span>{dep.time}</span>
                  </div>
                </div>
                <a href={`https://${dep.url}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 border border-gray-200 hover:border-brand-200 transition-all flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Visit
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Quick Actions</h2>
        </div>
        <div className="card-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all group">
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-bold text-lg">{action.label[0]}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-brand-700 transition-colors">{action.label}</p>
                <p className="text-sm text-gray-500">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="card-body">
            <div className="space-y-1">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{item.action}</span>{" "}
                      <span className="text-gray-600">{item.target}</span>
                    </p>
                    <p className="text-xs text-gray-400">{item.type}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Resource Usage</h2>
            </div>
            <div className="card-body space-y-4">
              {[
                { label: "Storage", used: "3.2 GB", total: "10 GB", pct: 32, color: "bg-brand-500" },
                { label: "Databases", used: "3", total: "5", pct: 60, color: "bg-blue-500" },
                { label: "Deployments", used: "12", total: "25", pct: 48, color: "bg-purple-500" },
                { label: "Bandwidth", used: "45 GB", total: "200 GB", pct: 22, color: "bg-cyan-500" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{r.label}</span>
                    <span className="text-gray-500">{r.used} / {r.total}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${r.color} rounded-full h-2`} style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Active Services</h2>
            </div>
            <div className="card-body grid grid-cols-2 gap-3">
              {[
                { name: "Next.js App", status: "Running", online: true },
                { name: "MySQL DB", status: "Online", online: true },
                { name: "VPS Server", status: "Active", online: true },
                { name: "WordPress", status: "Active", online: true },
                { name: "Redis Cache", status: "Running", online: true },
                { name: "CDN", status: "Enabled", online: true },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg border border-gray-100">
                  <div className={`w-2 h-2 rounded-full ${s.online ? "bg-green-500" : "bg-gray-300"}`} />
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}