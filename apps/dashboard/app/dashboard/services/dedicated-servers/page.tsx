"use client";

import { useEffect, useState } from "react";
import {
  Server, Cpu, HardDrive, Wifi, Zap, RotateCw, Activity, X, Trash2,
  Monitor, Globe, ToggleLeft, BarChart3, RefreshCw, Clock, Download,
  Gauge, Circle, ChevronRight, ChevronDown, Plus
} from "lucide-react";

interface Plan {
  id: string; name: string; cpu: string; ram: string; storage: string; bandwidth: string; price: number; popular?: boolean;
}

interface ServerType {
  id: string; name: string; plan: string; os: string; location: string; managed: boolean; status: string; ip: string; createdAt: string;
}

interface Metrics {
  cpu: number; ram: number; disk: number; bandwidth: number; uptime: string; loadAverage: number[];
}

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/business-tools/dedicated-servers`;

export default function DedicatedServersPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [servers, setServers] = useState<ServerType[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", os: "ubuntu-22.04", location: "us-east", managed: false });
  const [metricsServer, setMetricsServer] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [plansRes, serversRes] = await Promise.all([
        fetch(`${API}/plans`, { headers }),
        fetch(API, { headers }),
      ]);
      if (plansRes.ok) { const d = await plansRes.json(); setPlans(d.plans || []); }
      if (serversRes.ok) { const d = await serversRes.json(); setServers(d.servers || []); }
    } catch (e) { console.error("Failed to fetch data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const orderServer = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedPlan) return;
    const res = await fetch(API, {
      method: "POST", headers,
      body: JSON.stringify({ planId: selectedPlan.id, ...form }),
    });
    if (res.ok) { const d = await res.json(); setServers([d.server, ...servers]); setShowForm(false); setSelectedPlan(null); }
  };

  const rebootServer = async (id: string) => {
    const res = await fetch(`${API}/${id}/reboot`, { method: "POST", headers });
    if (res.ok) setServers(servers.map(s => s.id === id ? { ...s, status: "rebooting" } : s));
  };

  const reinstallServer = async (id: string) => {
    const res = await fetch(`${API}/${id}/reinstall`, { method: "POST", headers });
    if (res.ok) setServers(servers.map(s => s.id === id ? { ...s, status: "provisioning" } : s));
  };

  const deleteServer = async (id: string) => {
    if (!confirm("Delete this server?")) return;
    const res = await fetch(`${API}/${id}`, { method: "DELETE", headers });
    if (res.ok) setServers(servers.filter(s => s.id !== id));
  };

  const fetchMetrics = async (id: string) => {
    setMetricsServer(id); setMetricsLoading(true); setMetrics(null);
    try {
      const res = await fetch(`${API}/${id}/metrics`, { headers });
      if (res.ok) { const d = await res.json(); setMetrics(d.metrics); }
    } catch (e) { console.error("Failed to fetch metrics"); }
    finally { setMetricsLoading(false); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { provisioning: "badge-info", active: "badge-success", rebooting: "badge-warning", cancelled: "badge-error" };
    return <span className={`badge ${map[status] || "badge-info"}`}>{status}</span>;
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dedicated Servers</h1>
          <p className="text-gray-500">Bare-metal servers with full isolation and performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className={`card p-6 relative cursor-pointer transition-all ${selectedPlan?.id === plan.id ? "ring-2 ring-brand-500" : "hover:shadow-md"} ${plan.popular ? "ring-2 ring-brand-500" : ""}`} onClick={() => { setSelectedPlan(plan); setShowForm(true); }}>
            {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-medium px-3 py-1 rounded-full">Popular</span>}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{plan.name}</h3>
            </div>
            <p className="text-3xl font-bold mb-4">${plan.price}<span className="text-sm text-gray-400 font-normal">/mo</span></p>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p className="flex justify-between"><Cpu className="w-3.5 h-3.5 inline" /><span className="flex-1 ml-2">CPU</span><span className="font-medium">{plan.cpu}</span></p>
              <p className="flex justify-between"><Monitor className="w-3.5 h-3.5 inline" /><span className="flex-1 ml-2">RAM</span><span className="font-medium">{plan.ram}</span></p>
              <p className="flex justify-between"><HardDrive className="w-3.5 h-3.5 inline" /><span className="flex-1 ml-2">Storage</span><span className="font-medium">{plan.storage}</span></p>
              <p className="flex justify-between"><Wifi className="w-3.5 h-3.5 inline" /><span className="flex-1 ml-2">Bandwidth</span><span className="font-medium">{plan.bandwidth}</span></p>
            </div>
            <button className="btn-primary w-full" onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); setShowForm(true); }}>Select Plan</button>
          </div>
        ))}
      </div>

      {showForm && selectedPlan && (
        <form onSubmit={orderServer} className="card p-6 space-y-4">
          <h3 className="font-semibold">Order {selectedPlan.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Server Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="my-server" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Operating System</label>
              <select value={form.os} onChange={e => setForm({ ...form, os: e.target.value })} className="input-field">
                <option value="ubuntu-22.04">Ubuntu 22.04 LTS</option>
                <option value="ubuntu-24.04">Ubuntu 24.04 LTS</option>
                <option value="debian-12">Debian 12</option>
                <option value="centos-9">CentOS 9</option>
                <option value="windows-server-2022">Windows Server 2022</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field">
                <option value="us-east">US East (NYC)</option>
                <option value="us-west">US West (LA)</option>
                <option value="eu-west">EU West (London)</option>
                <option value="eu-central">EU Central (Frankfurt)</option>
                <option value="ap-southeast">AP Southeast (Singapore)</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="managed" checked={form.managed} onChange={e => setForm({ ...form, managed: e.target.checked })} className="w-4 h-4 rounded border-gray-300" />
              <label htmlFor="managed" className="text-sm font-medium">Fully Managed Support (+$49/mo)</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary"><Zap className="w-4 h-4" /> Deploy Server</button>
            <button type="button" onClick={() => { setShowForm(false); setSelectedPlan(null); }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-header"><h2 className="font-semibold">Your Servers</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">OS</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Managed</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {servers.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  <Server className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No dedicated servers</p>
                  <p className="text-xs mt-1">Select a plan above to deploy your first server</p>
                </td></tr>
              ) : servers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.plan}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.ip}</td>
                  <td className="px-4 py-3">{s.os}</td>
                  <td className="px-4 py-3">{s.location}</td>
                  <td className="px-4 py-3">{s.managed ? <span className="badge badge-success">Yes</span> : <span className="badge badge-info">No</span>}</td>
                  <td className="px-4 py-3">{statusBadge(s.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => rebootServer(s.id)} className="btn-secondary text-xs px-2 py-1" title="Reboot"><RotateCw className="w-3 h-3" /></button>
                      <button onClick={() => reinstallServer(s.id)} className="btn-secondary text-xs px-2 py-1" title="Reinstall OS"><RefreshCw className="w-3 h-3" /></button>
                      <button onClick={() => fetchMetrics(s.id)} className="btn-secondary text-xs px-2 py-1" title="Metrics"><Activity className="w-3 h-3" /></button>
                      <button onClick={() => deleteServer(s.id)} className="btn-secondary text-xs px-2 py-1 text-red-600 hover:bg-red-50" title="Delete"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {metricsServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setMetricsServer(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Server Metrics</h3>
              <button onClick={() => setMetricsServer(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            {metricsLoading ? (
              <div className="text-center py-8 text-gray-400">Loading metrics...</div>
            ) : metrics ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500"><Clock className="w-4 h-4" /> Uptime: <span className="font-medium text-gray-800">{metrics.uptime}</span></div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "CPU", value: metrics.cpu, icon: Cpu },
                    { label: "RAM", value: metrics.ram, icon: Monitor },
                    { label: "Disk", value: metrics.disk, icon: HardDrive },
                    { label: "Bandwidth", value: metrics.bandwidth, icon: Wifi },
                  ].map(m => (
                    <div key={m.label} className="p-4 bg-gray-50 rounded-xl text-center">
                      <m.icon className="w-6 h-6 mx-auto mb-2 text-brand-600" />
                      <p className="text-xs text-gray-500">{m.label}</p>
                      <div className="relative pt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${Math.min(m.value, 100)}%` }}></div>
                        </div>
                        <span className="text-sm font-bold">{m.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Load Average</p>
                  <div className="flex gap-2">
                    {metrics.loadAverage.map((v, i) => (
                      <span key={i} className="badge badge-info">{v.toFixed(2)}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No metrics available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
