"use client";

import { useState, useEffect } from "react";
import {
  Plus, Mail, Globe, Users, CheckCircle,
  XCircle, RefreshCw, ExternalLink
} from "lucide-react";

interface Account {
  id: string;
  domain: string;
  plan: string;
  seats: number;
  adminEmail: string;
  status: string;
  verified: boolean;
  mxRecords: string[];
}

const PLANS = [
  { value: "business_starter", label: "Business Starter", price: "$6" },
  { value: "business_standard", label: "Business Standard", price: "$12" },
  { value: "business_plus", label: "Business Plus", price: "$18" },
];

export default function GoogleWorkspacePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ domain: "", plan: "business_starter", seats: "5", adminEmail: "" });
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/hostinger-services/google-workspace", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setAccounts(data.accounts || []))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/hostinger-services/google-workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, seats: parseInt(form.seats) }),
    });
    if (res.ok) {
      const data = await res.json();
      setAccounts([...accounts, data.account]);
      setShowForm(false);
      setForm({ domain: "", plan: "business_starter", seats: "5", adminEmail: "" });
    }
  };

  const verify = async (id: string) => {
    setVerifying(id);
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/hostinger-services/google-workspace/${id}/verify`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setAccounts(accounts.map((a) => (a.id === id ? { ...a, ...data.account } : a)));
    }
    setVerifying(null);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Google Workspace</h1>
          <p className="text-gray-500">Set up and manage Google Workspace for your domain</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Setup Workspace
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}
                className="input-field" placeholder="yourcompany.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plan</label>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="input-field">
                {PLANS.map((p) => <option key={p.value} value={p.value}>{p.label} ({p.price}/user)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Seats</label>
              <input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })}
                className="input-field" min="1" max="300" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Admin Email</label>
              <input type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                className="input-field" placeholder="admin@yourcompany.com" required />
            </div>
          </div>
          <button type="submit" className="btn-primary">Setup Workspace</button>
        </form>
      )}

      {accounts.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No Google Workspace accounts</p>
            <p className="text-gray-400 text-sm mt-1">Set up Google Workspace for your domain</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand-500" />
                  <h3 className="font-semibold">{acc.domain}</h3>
                </div>
                <span className={`badge ${acc.status === "active" ? "badge-success" : "badge-warning"}`}>
                  {acc.status}
                </span>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>{acc.adminEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>{acc.seats} seats</span>
                  <span className="badge badge-info">{acc.plan.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  {acc.verified ? (
                    <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-green-700">Domain verified</span></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-yellow-500" /><span className="text-yellow-700">Not verified</span></>
                  )}
                </div>
              </div>
              {acc.mxRecords?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">MX Records</p>
                  {acc.mxRecords.map((mx, i) => (
                    <p key={i} className="text-xs font-mono text-gray-500">{mx}</p>
                  ))}
                </div>
              )}
              {!acc.verified && (
                <button onClick={() => verify(acc.id)} disabled={verifying === acc.id} className="btn-secondary w-full text-xs">
                  <RefreshCw className={`w-3 h-3 ${verifying === acc.id ? "animate-spin" : ""}`} />
                  {verifying === acc.id ? "Verifying..." : "Verify DNS"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
