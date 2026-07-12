"use client";

import { useEffect, useState } from "react";
import { Globe, Server, Activity, Database, Trash2, Plus } from "lucide-react";

export default function FreeDnsPage() {
  const [dnsList, setDnsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [domain, setDomain] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchDns = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domain-services/free-dns`, { headers });
      const data = await res.json();
      setDnsList(data.freeDns || []);
    } catch (e) {
      console.error("Failed to fetch free DNS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDns(); }, []);

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domain-services/free-dns`, {
      method: "POST", headers,
      body: JSON.stringify({ domain }),
    });
    if (res.ok) {
      const data = await res.json();
      setDnsList([data.freeDns, ...dnsList]);
      setDomain(""); setShowForm(false);
    }
  };

  const deleteDns = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domain-services/free-dns/${id}`, {
      method: "DELETE", headers,
    });
    if (res.ok) {
      setDnsList(dnsList.filter(d => d.id !== id));
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Free DNS</h1>
          <p className="text-gray-500">Free managed DNS hosting with global anycast network</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Domain
        </button>
      </div>

      {showForm && (
        <form onSubmit={addDomain} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Domain Name</label>
            <input value={domain} onChange={e => setDomain(e.target.value)} className="input-field" placeholder="example.com" required />
            <p className="text-xs text-gray-400 mt-1">Free DNS hosting — no credit card required</p>
          </div>
          <button type="submit" className="btn-primary">Add Domain</button>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">DNS Zones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nameservers</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Records</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Queries (30d)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dnsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No DNS zones yet</p>
                    <p className="text-xs mt-1">Add a domain to start using free managed DNS</p>
                  </td>
                </tr>
              ) : dnsList.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{d.domain}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Server className="w-3 h-3 text-gray-400" />
                      <span className="font-mono text-xs text-gray-600">
                        {Array.isArray(d.nameservers) ? d.nameservers.join(", ") : d.nameservers}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3 text-gray-400" /> {d.recordCount || d.records?.length || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-gray-400" /> {d.queryCount || 0} queries
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-success">Active</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteDns(d.id)} className="btn-secondary text-xs text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
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
