"use client";

import { useState } from "react";

export default function EmailPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", forwardTo: "", quota: "1024" });

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        organizationId: "00000000-0000-0000-0000-000000000000",
        email: form.email,
        password: form.password,
        quota: parseInt(form.quota),
        forwardTo: form.forwardTo || undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setAccounts([...accounts, data.account]);
      setShowCreate(false);
      setForm({ email: "", password: "", forwardTo: "", quota: "1024" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Accounts</h1>
          <p className="text-gray-500">Manage professional email accounts for your domains</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Email Account
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createAccount} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="contact@yourdomain.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="input-field" placeholder="••••••••" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Forward to (optional)</label>
              <input type="email" value={form.forwardTo} onChange={e => setForm({ ...form, forwardTo: e.target.value })}
                className="input-field" placeholder="forward@other.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quota (MB)</label>
              <input type="number" value={form.quota} onChange={e => setForm({ ...form, quota: e.target.value })}
                className="input-field" />
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Account</button>
        </form>
      )}

      {accounts.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 font-medium">No email accounts yet</p>
            <p className="text-gray-400 text-sm mt-1">Create professional email accounts for your domain</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{acc.email}</h3>
                  <span className={`badge ${acc.status === "active" ? "badge-success" : "badge-error"}`}>{acc.status}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-gray-400">{acc.quota} MB quota</span>
                </div>
              </div>
              {acc.forwardTo && (
                <p className="text-sm text-gray-500 mt-2">Forwarding to: {acc.forwardTo}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
