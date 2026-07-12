"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewHostingAccountPage() {
  const router = useRouter();
  const [form, setForm] = useState({ domain: "", package: "starter", phpVersion: "8.2" });
  const [loading, setLoading] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/hosting/account`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/control-panel/${data.account.id}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Hosting Account</h1>
        <p className="text-gray-500">Provision a new shared hosting account with full control panel</p>
      </div>

      <form onSubmit={create} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Domain Name</label>
          <input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}
            className="input-field" placeholder="example.com" required />
          <p className="text-xs text-gray-400 mt-1">Or leave empty for a subdomain: <code>your-site.cloudhost.app</code></p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hosting Package</label>
            <select value={form.package} onChange={e => setForm({ ...form, package: e.target.value })} className="input-field">
              <option value="starter">Starter — 1 site, 1GB disk</option>
              <option value="basic">Basic — 5 sites, 5GB disk</option>
              <option value="business">Business — 25 sites, 25GB disk</option>
              <option value="pro">Professional — Unlimited, 100GB disk</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PHP Version</label>
            <select value={form.phpVersion} onChange={e => setForm({ ...form, phpVersion: e.target.value })} className="input-field">
              <option value="8.3">PHP 8.3</option>
              <option value="8.2">PHP 8.2</option>
              <option value="8.1">PHP 8.1</option>
              <option value="8.0">PHP 8.0</option>
              <option value="7.4">PHP 7.4</option>
            </select>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">What you get:</p>
          <ul className="space-y-1 text-blue-700">
            <li>✓ cPanel-like control panel with file manager, DBs, email, domains</li>
            <li>✓ 1-click app installer (WordPress, 50+ apps)</li>
            <li>✓ Free SSL, FTP access, cron jobs, PHP selector</li>
            <li>✓ Daily backups and DDoS protection</li>
          </ul>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? "Provisioning..." : "Create Hosting Account"}
        </button>
      </form>
    </div>
  );
}
