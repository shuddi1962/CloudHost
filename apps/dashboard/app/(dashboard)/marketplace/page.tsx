"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const categoryColors: Record<string, string> = {
  cms: "bg-blue-500", ecommerce: "bg-green-500", blog: "bg-purple-500",
  forum: "bg-orange-500", wiki: "bg-teal-500", analytics: "bg-cyan-500",
  crm: "bg-indigo-500", devtools: "bg-gray-600", media: "bg-pink-500",
  social: "bg-rose-500", learning: "bg-amber-500", finance: "bg-emerald-500",
  storage: "bg-yellow-600", security: "bg-red-600", ai: "bg-violet-600", other: "bg-gray-400",
};

export default function MarketplacePage() {
  const [apps, setApps] = useState<any[]>([]);
  const [installations, setInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("http://localhost:3001/api/marketplace/apps", { headers }).then(r => r.json()),
      fetch("http://localhost:3001/api/marketplace/installations", { headers }).then(r => r.json()),
    ]).then(([appsData, instData]) => {
      setApps(appsData.apps || []);
      setInstallations(instData.installations || []);
    }).finally(() => setLoading(false));
  }, []);

  const install = async (app: any) => {
    setInstalling(true);
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3001/api/marketplace/install", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ appId: app.id, hostingAccountId: "" }),
    });
    setSelected(null);
    setInstalling(false);
    const headers = { Authorization: `Bearer ${token}` };
    const instData = await fetch("http://localhost:3001/api/marketplace/installations", { headers }).then(r => r.json());
    setInstallations(instData.installations || []);
  };

  const categories = ["all", ...new Set(apps.map(a => a.category))];
  const filtered = apps.filter(a =>
    (category === "all" || a.category === category) &&
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-12 text-gray-400">Loading marketplace...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">App Marketplace</h1>
        <p className="text-gray-500">1-click install your favorite apps — WordPress, Ghost, WooCommerce, and 50+ more</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-field max-w-xs" placeholder="Search apps..." />
        <div className="flex gap-1 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                category === cat ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {installations.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">Your Installations</h2>
          </div>
          <div className="card-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {installations.map((inst: any) => (
              <div key={inst.app_installations?.id || Math.random()} className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                <div>
                  <p className="font-medium text-sm text-green-800">{inst.marketplace_apps?.name || "App"}</p>
                  <p className="text-xs text-green-600">{inst.app_installations?.domain}</p>
                </div>
                <span className={`badge text-[10px] ${inst.app_installations?.status === "running" ? "badge-success" : "badge-warning"}`}>
                  {inst.app_installations?.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((app) => (
          <div key={app.id} className="card p-4 hover:shadow-md transition-all cursor-pointer border hover:border-brand-200"
            onClick={() => setSelected(app)}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${categoryColors[app.category] || "bg-gray-500"} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{app.icon || app.name[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-sm">{app.name}</p>
                <div className="flex items-center gap-1">
                  <span className="badge badge-info text-[10px]">{app.category}</span>
                  <span className="text-[10px] text-gray-400">v{app.version}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{app.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{app.framework}</span>
              <span>{app.installs || 0} installs</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 font-medium">No apps found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => !installing && setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 rounded-2xl ${categoryColors[selected.category] || "bg-gray-500"} flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">{selected.icon || selected.name[0]}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <p className="text-sm text-gray-500">v{selected.version} · {selected.framework} · {selected.category}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{selected.description}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Install Type</span><span>{selected.installType}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Default Port</span><span>{selected.defaultPort}</span></div>
              {selected.dockerImage && <div className="flex justify-between"><span className="text-gray-500">Docker Image</span><code className="text-xs">{selected.dockerImage}</code></div>}
              {selected.sourceUrl && <div className="flex justify-between"><span className="text-gray-500">Source</span><code className="text-xs">{selected.sourceUrl}</code></div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => install(selected)} disabled={installing}
                className="btn-primary flex-1 justify-center">
                {installing ? "Installing..." : "Install Now"}
              </button>
              <button onClick={() => setSelected(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
