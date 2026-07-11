"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RLSPoliciesPage() {
  const params = useParams();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ tableName: "", name: "", definition: "", policyType: "all", role: "authenticated" });

  const fetchPolicies = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/rls/database/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPolicies(data.policies || []);
    setLoading(false);
  };

  useEffect(() => { fetchPolicies(); }, [params.id]);

  const createPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3001/api/rls", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, databaseId: params.id }),
    });
    setShowCreate(false);
    setForm({ tableName: "", name: "", definition: "", policyType: "all", role: "authenticated" });
    fetchPolicies();
  };

  const togglePolicy = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/rls/${id}/toggle`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPolicies();
  };

  const deletePolicy = async (id: string) => {
    if (!confirm("Delete this RLS policy?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/rls/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPolicies();
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading policies...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Row Level Security</h1>
          <p className="text-gray-500">Define RLS policies to control row-level access</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Policy
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createPolicy} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Table Name</label>
              <input value={form.tableName} onChange={e => setForm({ ...form, tableName: e.target.value })}
                className="input-field" placeholder="users" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Policy Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="Users can view own data" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Policy Type</label>
              <select value={form.policyType} onChange={e => setForm({ ...form, policyType: e.target.value })} className="input-field">
                <option value="all">All Operations</option>
                <option value="select">SELECT</option>
                <option value="insert">INSERT</option>
                <option value="update">UPDATE</option>
                <option value="delete">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field">
                <option value="authenticated">Authenticated Users</option>
                <option value="anon">Anonymous Users</option>
                <option value="public">Public</option>
                <option value="service_role">Service Role</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Policy Definition (SQL USING expression)</label>
            <textarea value={form.definition} onChange={e => setForm({ ...form, definition: e.target.value })}
              className="input-field font-mono text-xs" rows={4} placeholder="user_id = auth.uid()" required />
          </div>
          <button type="submit" className="btn-primary">Create Policy</button>
        </form>
      )}

      <div className="space-y-3">
        {policies.map((p) => (
          <div key={p.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className="badge badge-info text-[10px]">{p.policyType.toUpperCase()}</span>
                  <span className="badge badge-warning text-[10px]">{p.tableName}</span>
                  <span className="badge badge-success text-[10px]">{p.role}</span>
                </div>
                <code className="block bg-gray-50 p-3 rounded-lg text-xs font-mono mt-2 text-gray-700">
                  {(p.policyType === "all" ? "ALL" : p.policyType.toUpperCase())} ON {p.tableName} TO {p.role} USING ({p.definition})
                </code>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => togglePolicy(p.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${p.enabled ? "bg-brand-600" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${p.enabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <button onClick={() => deletePolicy(p.id)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {policies.length === 0 && !showCreate && (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-gray-500 font-medium">No RLS policies</p>
            <p className="text-gray-400 text-sm mt-1">Row Level Security restricts which rows users can access</p>
          </div>
        </div>
      )}
    </div>
  );
}
