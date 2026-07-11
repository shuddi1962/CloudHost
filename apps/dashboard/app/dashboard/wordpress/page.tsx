"use client";

import { useState } from "react";

export default function WordPressPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [showInstall, setShowInstall] = useState(false);
  const [form, setForm] = useState({ name: "", domain: "", phpVersion: "8.2", adminEmail: "" });

  const installWP = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/wordpress/provision", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        projectId: "00000000-0000-0000-0000-000000000000",
        name: form.name,
        domain: form.domain,
        phpVersion: form.phpVersion,
        adminEmail: form.adminEmail,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSites([...sites, { ...data.site, credentials: data.credentials }]);
      setShowInstall(false);
    }
  };

  const actionSite = async (id: string, action: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/wordpress/${id}/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setSites(sites.map(s => s.id === id ? { ...s, ...data.site } : s));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WordPress</h1>
          <p className="text-gray-500">Install and manage WordPress sites with PHP & MySQL</p>
        </div>
        <button onClick={() => setShowInstall(!showInstall)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Install WordPress
        </button>
      </div>

      {showInstall && (
        <form onSubmit={installWP} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="My Blog" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PHP Version</label>
              <select value={form.phpVersion} onChange={e => setForm({ ...form, phpVersion: e.target.value })} className="input-field">
                <option value="8.2">PHP 8.2</option>
                <option value="8.1">PHP 8.1</option>
                <option value="8.0">PHP 8.0</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domain (optional)</label>
              <input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}
                className="input-field" placeholder="myblog.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Admin Email</label>
              <input type="email" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })}
                className="input-field" placeholder="admin@myblog.com" />
            </div>
          </div>
          <button type="submit" className="btn-primary">Install WordPress</button>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Quick Actions</h2>
        </div>
        <div className="card-body flex flex-wrap gap-3">
          <button onClick={() => setShowInstall(true)} className="btn-secondary">Install New WP Site</button>
        </div>
      </div>

      {sites.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 12a1 1 0 000 2h6a1 1 0 100-2H9z" />
            </svg>
            <p className="text-gray-500 font-medium">No WordPress sites yet</p>
            <p className="text-gray-400 text-sm mt-1">Install WordPress with one click — includes PHP, MySQL, and SSL</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {sites.map((site) => (
            <div key={site.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{site.name}</h3>
                  {site.domain && <p className="text-sm text-gray-500">{site.domain}</p>}
                </div>
                <span className={`badge ${site.status === "running" ? "badge-success" : site.status === "installing" ? "badge-warning" : "badge-error"}`}>
                  {site.status}
                </span>
              </div>

              {site.credentials && site.status === "running" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-green-800 mb-2">WordPress Admin Credentials</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-green-600">URL:</span> http://{site.domain || "localhost"}/wp-admin</p>
                    <p><span className="text-green-600">Username:</span> {site.credentials.adminUser}</p>
                    <p><span className="text-green-600">Password:</span> {site.credentials.adminPassword}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {site.status === "running" && (
                  <button onClick={() => actionSite(site.id, "stop")} className="btn-secondary text-sm">Stop</button>
                )}
                {site.status === "stopped" && (
                  <button onClick={() => actionSite(site.id, "restart")} className="btn-primary text-sm">Start</button>
                )}
                <button onClick={() => actionSite(site.id, "ssl")} className="btn-secondary text-sm">Enable SSL</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
