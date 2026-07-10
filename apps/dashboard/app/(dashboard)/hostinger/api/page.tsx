"use client";

import { useState, useEffect } from "react";
import {
  Plus, Key, Shield, Eye, EyeOff,
  Trash2, Clock
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created: string;
  lastUsed: string;
  status: string;
}

export default function ApiPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", permissions: [] as string[], expiry: "30"
  });
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/hostinger-services/api-keys", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setKeys(data.keys || []))
      .finally(() => setLoading(false));
  }, []);

  const togglePerm = (perm: string) => {
    setForm({
      ...form,
      permissions: form.permissions.includes(perm)
        ? form.permissions.filter((p) => p !== perm)
        : [...form.permissions, perm],
    });
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/hostinger-services/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, expiry: parseInt(form.expiry) }),
    });
    if (res.ok) {
      const data = await res.json();
      setKeys([...keys, data.key]);
      setShowForm(false);
      setForm({ name: "", permissions: [], expiry: "30" });
    }
  };

  const deleteKey = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/hostinger-services/api-keys/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setKeys(keys.filter((k) => k.id !== id));
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hostinger API</h1>
          <p className="text-gray-500">Manage API keys for programmatic access</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> New API Key
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Key Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="Production API Key" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiry</label>
              <select value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} className="input-field">
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="0">No expiry</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Permissions</label>
              <div className="flex gap-4">
                {["read", "write", "admin"].map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.permissions.includes(perm)}
                      onChange={() => togglePerm(perm)} />
                    <Shield className="w-4 h-4 text-gray-400" />
                    {perm.charAt(0).toUpperCase() + perm.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary">Create API Key</button>
        </form>
      )}

      <div className="card">
        <div className="card-header"><h2 className="font-semibold">API Keys</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Key</th>
                <th className="px-6 py-3 font-medium">Permissions</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium">Last Used</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No API keys created</td></tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{k.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Key className="w-3 h-3 text-gray-400" />
                        {showKey[k.id] ? (
                          <span className="font-mono text-xs">{k.key}</span>
                        ) : (
                          <span className="font-mono text-xs">{k.key?.substring(0, 8)}...{k.key?.slice(-4)}</span>
                        )}
                        <button onClick={() => setShowKey({ ...showKey, [k.id]: !showKey[k.id] })}>
                          {showKey[k.id] ? <EyeOff className="w-3 h-3 text-gray-400" /> : <Eye className="w-3 h-3 text-gray-400" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {k.permissions?.map((p) => (
                          <span key={p} className="badge badge-info text-[10px]">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{k.created ? new Date(k.created).toLocaleDateString() : "-"}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : "Never"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${k.status === "active" ? "badge-success" : "badge-error"}`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => deleteKey(k.id)} className="btn-danger py-1 px-2 text-xs">
                        <Trash2 className="w-3 h-3" /> Revoke
                      </button>
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
