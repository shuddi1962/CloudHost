"use client";

import { useEffect, useState } from "react";

export default function PHPSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [phpInfo, setPhpInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ version: "8.2", memoryLimit: "256M", maxUploadSize: "64M", maxExecutionTime: "120", extensions: [] as string[] });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("http://localhost:3001/api/hosting/account/00000000-0000-0000-0000-000000000000/php-settings", { headers }).then(r => r.json()),
      fetch("http://localhost:3001/api/hosting/php-info", { headers }).then(r => r.json()),
    ]).then(([settingsData, infoData]) => {
      const s = settingsData.settings;
      setSettings(s);
      setForm({ version: s.version || "8.2", memoryLimit: s.memoryLimit || "256M", maxUploadSize: s.maxUploadSize || "64M", maxExecutionTime: s.maxExecutionTime || "120", extensions: s.extensions || [] });
      setPhpInfo(infoData);
    }).finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3001/api/hosting/account/00000000-0000-0000-0000-000000000000/php-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setSaving(false);
  };

  const toggleExtension = (ext: string) => {
    setForm(prev => ({
      ...prev,
      extensions: prev.extensions.includes(ext) ? prev.extensions.filter(e => e !== ext) : [...prev.extensions, ext]
    }));
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading PHP settings...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PHP Settings</h1>
        <p className="text-gray-500">Configure PHP version, limits, and extensions for your hosting account</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">PHP Version</h2>
          <div className="flex gap-2">
            {phpInfo?.versions.map((v: string) => (
              <button key={v} type="button" onClick={() => setForm({ ...form, version: v })}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  form.version === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}>
                PHP {v}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Resource Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Memory Limit</label>
              <select value={form.memoryLimit} onChange={e => setForm({ ...form, memoryLimit: e.target.value })} className="input-field">
                <option value="128M">128 MB</option><option value="256M">256 MB</option>
                <option value="512M">512 MB</option><option value="1G">1 GB</option><option value="2G">2 GB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Upload Size</label>
              <select value={form.maxUploadSize} onChange={e => setForm({ ...form, maxUploadSize: e.target.value })} className="input-field">
                <option value="16M">16 MB</option><option value="32M">32 MB</option>
                <option value="64M">64 MB</option><option value="128M">128 MB</option><option value="256M">256 MB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Execution Time</label>
              <select value={form.maxExecutionTime} onChange={e => setForm({ ...form, maxExecutionTime: e.target.value })} className="input-field">
                <option value="30">30 seconds</option><option value="60">60 seconds</option>
                <option value="120">120 seconds</option><option value="300">300 seconds</option><option value="600">600 seconds</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">PHP Extensions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {phpInfo?.extensions.map((ext: string) => (
              <button key={ext} type="button" onClick={() => toggleExtension(ext)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                  form.extensions.includes(ext) ? "border-green-400 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}>
                <span className="mr-1">{form.extensions.includes(ext) ? "✓" : ""}</span>
                {ext}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary justify-center">
          {saving ? "Saving..." : "Save PHP Settings"}
        </button>
      </form>
    </div>
  );
}
