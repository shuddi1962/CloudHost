"use client";

import { useEffect, useState } from "react";
import {
  Shield, Plus, Trash2, AlertTriangle, Check, Search,
  Activity, Globe, Clock, ChevronDown, ChevronRight, X, RefreshCw
} from "lucide-react";

interface Site {
  id: string; domain: string; plan: string; scanFrequency: string; autoFix: boolean;
  vulnerabilities: number; critical: number; high: number; medium: number; low: number;
  lastScan: string; status: string;
}

interface Finding {
  id: string; severity: string; description: string; path: string; recommendation: string; fixed: boolean;
}

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/business-tools/website-security`;

export default function WebsiteSecurityPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ domain: "", plan: "basic", scanFrequency: "daily", autoFix: false });
  const [findings, setFindings] = useState<{ [siteId: string]: Finding[] }>({});
  const [scanning, setScanning] = useState<string | null>(null);
  const [expandedFindings, setExpandedFindings] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchSites = async () => {
    try {
      const res = await fetch(API, { headers });
      if (res.ok) { const d = await res.json(); setSites(d.sites || []); }
    } catch (e) { console.error("Failed to fetch sites"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSites(); }, []);

  const addSite = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(API, {
      method: "POST", headers,
      body: JSON.stringify(form),
    });
    if (res.ok) { const d = await res.json(); setSites([d.site, ...sites]); setShowForm(false); }
  };

  const deleteSite = async (id: string) => {
    if (!confirm("Remove this site?")) return;
    const res = await fetch(`${API}/${id}`, { method: "DELETE", headers });
    if (res.ok) setSites(sites.filter(s => s.id !== id));
  };

  const runScan = async (id: string) => {
    setScanning(id);
    try {
      const res = await fetch(`${API}/${id}/scan`, { method: "POST", headers });
      if (res.ok) {
        const findingsRes = await fetch(`${API}/${id}/findings`, { headers });
        if (findingsRes.ok) {
          const d = await findingsRes.json();
          setFindings(prev => ({ ...prev, [id]: d.findings || [] }));
          setExpandedFindings(id);
        }
        fetchSites();
      }
    } catch (e) { console.error("Scan failed"); }
    finally { setScanning(null); }
  };

  const markFixed = async (findingId: string, siteId: string) => {
    const res = await fetch(`${API}/findings/${findingId}/fix`, { method: "POST", headers });
    if (res.ok) {
      setFindings(prev => ({
        ...prev,
        [siteId]: (prev[siteId] || []).map(f => f.id === findingId ? { ...f, fixed: true } : f),
      }));
    }
  };

  const severityBadge = (severity: string) => {
    const map: Record<string, string> = { critical: "badge-error", high: "badge-error", medium: "badge-warning", low: "badge-info" };
    return <span className={`badge ${map[severity] || "badge-info"}`}>{severity}</span>;
  };

  const severityColor = (severity: string) => {
    const map: Record<string, string> = { critical: "text-red-600", high: "text-orange-600", medium: "text-yellow-600", low: "text-blue-600" };
    return map[severity] || "text-gray-600";
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Website Security</h1>
          <p className="text-gray-500">Monitor and protect your websites from vulnerabilities</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Website
        </button>
      </div>

      {showForm && (
        <form onSubmit={addSite} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} className="input-field" placeholder="example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plan</label>
              <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} className="input-field">
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Scan Frequency</label>
              <select value={form.scanFrequency} onChange={e => setForm({ ...form, scanFrequency: e.target.value })} className="input-field">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="autoFix" checked={form.autoFix} onChange={e => setForm({ ...form, autoFix: e.target.checked })} className="w-4 h-4 rounded border-gray-300" />
              <label htmlFor="autoFix" className="text-sm font-medium">Auto-fix low severity issues</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary"><Shield className="w-4 h-4" /> Add Website</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.length === 0 ? (
          <div className="card p-12 col-span-full text-center text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No sites monitored</p>
            <p className="text-xs mt-1">Add a website above to start security monitoring</p>
          </div>
        ) : sites.map(site => (
          <div key={site.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" /> {site.domain}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Plan: {site.plan} | Scan: {site.scanFrequency}</p>
              </div>
              <button onClick={() => deleteSite(site.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{site.vulnerabilities}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-red-600 font-medium">{site.critical} critical</span>
                <span className="text-orange-600 font-medium">{site.high} high</span>
                <span className="text-yellow-600 font-medium">{site.medium} med</span>
                <span className="text-blue-600 font-medium">{site.low} low</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {site.lastScan ? new Date(site.lastScan).toLocaleDateString() : "Never"}</span>
              {site.autoFix && <span className="badge badge-success text-xs">Auto-fix</span>}
            </div>
            <button onClick={() => runScan(site.id)} disabled={scanning === site.id} className="btn-primary w-full text-xs">
              {scanning === site.id ? <><RefreshCw className="w-3 h-3 animate-spin" /> Scanning...</> : <><Search className="w-3 h-3" /> Run Scan</>}
            </button>

            {expandedFindings === site.id && findings[site.id] && (
              <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                <p className="text-sm font-medium">Findings</p>
                {findings[site.id].length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4"><Check className="w-8 h-8 mx-auto mb-2 text-green-500" />No vulnerabilities found</p>
                ) : findings[site.id].map(f => (
                  <div key={f.id} className={`p-3 rounded-lg border ${f.fixed ? "border-green-200 bg-green-50" : "border-gray-200"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {severityBadge(f.severity)}
                          {f.fixed && <span className="badge badge-success text-xs">Fixed</span>}
                        </div>
                        <p className="text-sm font-medium">{f.description}</p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">{f.path}</p>
                        <p className="text-xs text-gray-500 mt-1">{f.recommendation}</p>
                      </div>
                      {!f.fixed && (
                        <button onClick={() => markFixed(f.id, site.id)} className="btn-secondary text-xs whitespace-nowrap px-2 py-1">
                          <Check className="w-3 h-3" /> Mark Fixed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
