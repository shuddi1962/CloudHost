"use client";

import { useEffect, useState, useRef } from "react";
import {
  ArrowRight, Globe, Layout, Server, CheckSquare, X, Clock, FileText,
  RefreshCw, AlertCircle, BarChart3, Play, StopCircle
} from "lucide-react";

interface Migration {
  id: string; sourceUrl: string; sourceType: string; target: string; status: string;
  filesTransferred: number; totalFiles: number; estimatedTime: string; createdAt: string;
  preserveSettings: string[];
}

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/business-tools/migrations`;

export default function MigrationsPage() {
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("website");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sourceUrl: "", sourceType: "website", target: "", preserveSettings: [] as string[] });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchMigrations = async () => {
    try {
      const res = await fetch(API, { headers });
      if (res.ok) { const d = await res.json(); setMigrations(d.migrations || []); }
    } catch (e) { console.error("Failed to fetch migrations"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMigrations(); }, []);

  useEffect(() => {
    const running = migrations.some(m => m.status === "running");
    if (running && !pollRef.current) {
      pollRef.current = setInterval(fetchMigrations, 2000);
    } else if (!running && pollRef.current) {
      clearInterval(pollRef.current); pollRef.current = null;
    }
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
  }, [migrations]);

  const togglePreserve = (key: string) => {
    setForm(prev => ({
      ...prev,
      preserveSettings: prev.preserveSettings.includes(key)
        ? prev.preserveSettings.filter(k => k !== key)
        : [...prev.preserveSettings, key],
    }));
  };

  const startMigration = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(API, {
      method: "POST", headers,
      body: JSON.stringify({ ...form, sourceType: activeTab }),
    });
    if (res.ok) { const d = await res.json(); setMigrations([d.migration, ...migrations]); setShowForm(false); }
  };

  const cancelMigration = async (id: string) => {
    const res = await fetch(`${API}/${id}/cancel`, { method: "POST", headers });
    if (res.ok) setMigrations(migrations.map(m => m.id === id ? { ...m, status: "cancelled" } : m));
  };

  const progressPercent = (m: Migration) => m.totalFiles > 0 ? Math.round((m.filesTransferred / m.totalFiles) * 100) : 0;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { pending: "badge-info", running: "badge-warning", completed: "badge-success", failed: "badge-error", cancelled: "badge-error" };
    return <span className={`badge ${map[status] || "badge-info"}`}>{status}</span>;
  };

  const tabs = [
    { key: "website", label: "Website", icon: Globe },
    { key: "wordpress", label: "WordPress", icon: Layout },
    { key: "hosting", label: "Hosting", icon: Server },
  ];

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Migration Tools</h1>
          <p className="text-gray-500">Seamlessly migrate websites, WordPress sites, and hosting accounts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <ArrowRight className="w-4 h-4" /> New Migration
        </button>
      </div>

      {showForm && (
        <form onSubmit={startMigration} className="card p-6 space-y-4">
          <div className="flex gap-2 border-b border-gray-200 pb-3">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.key} type="button"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.key ? "bg-brand-100 text-brand-700" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => setActiveTab(t.key)}>
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Source URL</label>
              <input value={form.sourceUrl} onChange={e => setForm({ ...form, sourceUrl: e.target.value })} className="input-field" placeholder={activeTab === "website" ? "https://example.com" : activeTab === "wordpress" ? "https://example.com/wp-admin" : "ssh://user@host"} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target</label>
              <select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="input-field" required>
                <option value="">Select target...</option>
                <option value="cloudhost-basic">CloudHost Basic</option>
                <option value="cloudhost-pro">CloudHost Pro</option>
                <option value="cloudhost-enterprise">CloudHost Enterprise</option>
                <option value="external">External Server</option>
              </select>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Preserve Settings</p>
            <div className="flex flex-wrap gap-3">
              {[
                { key: "permissions", label: "File Permissions" },
                { key: "owners", label: "File Owners" },
                { key: "symlinks", label: "Symlinks" },
                { key: "cron", label: "Cron Jobs" },
                { key: "env", label: "Environment Variables" },
                { key: "ssl", label: "SSL Config" },
              ].map(p => (
                <label key={p.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.preserveSettings.includes(p.key)}
                    onChange={() => togglePreserve(p.key)} className="w-4 h-4 rounded border-gray-300" />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary"><Play className="w-4 h-4" /> Start Migration</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-header"><h2 className="font-semibold">Migrations</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Target</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Progress</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Files</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Est. Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {migrations.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  <ArrowRight className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No migrations</p>
                  <p className="text-xs mt-1">Start a new migration to move your site</p>
                </td></tr>
              ) : migrations.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium max-w-[150px] truncate">{m.sourceUrl}</td>
                  <td className="px-4 py-3"><span className="badge badge-info">{m.sourceType}</span></td>
                  <td className="px-4 py-3 text-gray-500">{m.target}</td>
                  <td className="px-4 py-3 w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-brand-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent(m)}%` }}></div>
                      </div>
                      <span className="text-xs font-medium">{progressPercent(m)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{m.filesTransferred}/{m.totalFiles}</td>
                  <td className="px-4 py-3 text-gray-500">{m.estimatedTime}</td>
                  <td className="px-4 py-3">{statusBadge(m.status)}</td>
                  <td className="px-4 py-3">
                    {m.status === "running" && (
                      <button onClick={() => cancelMigration(m.id)} className="btn-secondary text-xs px-2 py-1 text-red-600 hover:bg-red-50">
                        <StopCircle className="w-3 h-3" /> Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
