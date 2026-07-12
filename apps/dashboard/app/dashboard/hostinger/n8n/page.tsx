"use client";

import { useState, useEffect } from "react";
import {
  Plus, RotateCcw, Trash2, Server, Globe, Key,
  ChevronDown, ChevronUp
} from "lucide-react";

interface N8nInstance {
  id: string;
  name: string;
  version: string;
  status: string;
  port: number;
  domain: string;
  apiKey: string;
}

const STATUS_COLORS: Record<string, string> = {
  deploying: "badge-warning",
  running: "badge-success",
  restarting: "badge-info",
  deleted: "badge-error",
};

export default function N8nPage() {
  const [instances, setInstances] = useState<N8nInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", version: "1.0.0", domain: "" });
  const [polling, setPolling] = useState<Record<string, number>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/n8n`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setInstances(data.instances || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const activeIds = Object.keys(polling);
      if (activeIds.length === 0) return;
      const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/n8n`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setInstances(data.instances || []);
          const newPolling = { ...polling };
          for (const id of activeIds) {
            const inst = (data.instances || []).find((i: N8nInstance) => i.id === id);
            if (inst && inst.status !== "deploying" && inst.status !== "restarting") {
              delete newPolling[id];
            } else if (newPolling[id] >= 8) {
              delete newPolling[id];
            } else {
              newPolling[id] = (newPolling[id] || 0) + 1;
            }
          }
          setPolling(newPolling);
        });
    }, 2000);
    return () => clearInterval(interval);
  }, [polling]);

  const deploy = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/n8n`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setInstances([...instances, data.instance]);
      setPolling({ ...polling, [data.instance.id]: 0 });
      setShowForm(false);
      setForm({ name: "", version: "1.0.0", domain: "" });
    }
  };

  const restart = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/n8n/${id}/restart`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setInstances(instances.map((i) => (i.id === id ? { ...i, status: "restarting" } : i)));
      setPolling({ ...polling, [id]: 0 });
    }
  };

  const deleteInstance = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/n8n/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setInstances(instances.filter((i) => i.id !== id));
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Self-hosted n8n</h1>
          <p className="text-gray-500">Deploy and manage n8n automation instances</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Deploy n8n
        </button>
      </div>

      {showForm && (
        <form onSubmit={deploy} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Instance Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="my-n8n" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Version</label>
              <select value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="input-field">
                <option value="1.0.0">1.0.0</option>
                <option value="0.239.0">0.239.0</option>
                <option value="latest">latest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domain (optional)</label>
              <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}
                className="input-field" placeholder="n8n.example.com" />
            </div>
          </div>
          <button type="submit" className="btn-primary">Deploy</button>
        </form>
      )}

      <div className="card">
        <div className="card-header"><h2 className="font-semibold">n8n Instances</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Version</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Port</th>
                <th className="px-6 py-3 font-medium">Domain</th>
                <th className="px-6 py-3 font-medium">API Key</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instances.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No n8n instances deployed</td></tr>
              ) : (
                instances.map((inst) => (
                  <tr key={inst.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-brand-500" />
                        <span className="font-medium">{inst.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{inst.version}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${STATUS_COLORS[inst.status] || "badge-info"}`}>{inst.status}</span>
                    </td>
                    <td className="px-6 py-4">{inst.port}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-gray-400" />
                        {inst.domain || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Key className="w-3 h-3 text-gray-400" />
                        {inst.apiKey ? inst.apiKey.substring(0, 8) + "****" : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => restart(inst.id)} className="btn-secondary py-1 px-2 text-xs"
                          disabled={inst.status === "restarting"}>
                          <RotateCcw className="w-3 h-3" /> Restart
                        </button>
                        <button onClick={() => deleteInstance(inst.id)} className="btn-danger py-1 px-2 text-xs">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
