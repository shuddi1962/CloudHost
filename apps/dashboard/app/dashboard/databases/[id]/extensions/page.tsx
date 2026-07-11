"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ExtensionsPage() {
  const params = useParams();
  const [extensions, setExtensions] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [extRes, availRes] = await Promise.all([
        fetch(`http://localhost:3001/api/extensions/database/${params.id}`, { headers }),
        fetch("http://localhost:3001/api/extensions/available", { headers }),
      ]);
      const extData = await extRes.json();
      const availData = await availRes.json();
      setExtensions(extData.extensions || []);
      setAvailable(availData.extensions || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [params.id]);

  const installExtension = async (name: string) => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3001/api/extensions/install", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ databaseId: params.id, name }),
    });
    fetchData();
  };

  const uninstallExtension = async (id: string) => {
    if (!confirm("Uninstall this extension?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/extensions/${id}/uninstall`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading extensions...</div>;

  const installedNames = extensions.filter(e => e.enabled).map(e => e.name);
  const filteredAvailable = available.filter(a =>
    !installedNames.includes(a.name) &&
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Database Extensions</h1>
        <p className="text-gray-500">Enable PostgreSQL extensions for your database</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Installed Extensions ({extensions.filter(e => e.enabled).length})</h2>
        </div>
        <div className="card-body">
          {extensions.filter(e => e.enabled).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No extensions installed. Browse the available extensions below.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {extensions.filter(e => e.enabled).map((ext) => (
                <div key={ext.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                  <div>
                    <p className="font-medium text-sm text-green-800">{ext.name}</p>
                    {ext.description && <p className="text-xs text-green-600 mt-0.5">{ext.description}</p>}
                  </div>
                  <button onClick={() => uninstallExtension(ext.id)}
                    className="text-green-600 hover:text-red-600 text-xs font-medium ml-2">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Available Extensions</h2>
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input-field max-w-xs text-sm" placeholder="Search extensions..." />
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAvailable.map((ext) => (
              <div key={ext.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-200 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{ext.name}</p>
                    <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">v{ext.version}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{ext.description}</p>
                </div>
                <button onClick={() => installExtension(ext.name)}
                  className="btn-primary text-xs px-3 py-1.5 ml-2">Enable</button>
              </div>
            ))}
          </div>
          {filteredAvailable.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">
              {search ? "No extensions match your search" : "All available extensions are installed"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
