"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/api-client";

const demoDatabases = [
  { id: "1", name: "prod-db", type: "PostgreSQL", version: "16", status: "running", host: "db.cloudhost.app", port: 5432, databaseName: "proddb", username: "admin", password: "********" },
  { id: "2", name: "cache-redis", type: "Redis", version: "7", status: "running", host: "redis.cloudhost.app", port: 6379, databaseName: "0", username: "default", password: "********" },
  { id: "3", name: "analytics-db", type: "MySQL", version: "8", status: "running", host: "mysql.cloudhost.app", port: 3306, databaseName: "analytics", username: "admin", password: "********" },
];

export default function DatabasesPage() {
  const [databases, setDatabases] = useState<any[]>(demoDatabases);
  const [showCreate, setShowCreate] = useState(false);

  const { data: dbData } = useApi<any>("/api/databases/");

  useEffect(() => {
    if (dbData) {
      const list = Array.isArray(dbData) ? dbData : dbData.databases || dbData.data || [];
      if (list.length > 0) setDatabases(list);
    }
  }, [dbData]);
  const [form, setForm] = useState({ name: "", type: "postgresql", version: "16" });

  const createDB = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/databases/provision`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        projectId: "00000000-0000-0000-0000-000000000000",
        name: form.name,
        type: form.type,
        version: form.version,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setDatabases([...databases, data.database]);
      setShowCreate(false);
    }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Databases</h1>
          <p className="text-gray-500">Managed PostgreSQL, MySQL, and Redis databases</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Database
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createDB} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Database Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="my-database" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="redis">Redis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Version</label>
              <select value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} className="input-field">
                <option value="16">PostgreSQL 16</option>
                <option value="15">PostgreSQL 15</option>
                <option value="14">PostgreSQL 14</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Provision Database</button>
        </form>
      )}

      {databases.map((db) => (
        <div key={db.id} className="card p-6 space-y-4" onClick={() => window.location.href = `/dashboard/databases/${db.id}`} style={{ cursor: "pointer" }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg hover:text-brand-600 transition-colors">{db.name}</h3>
              <span className="text-sm text-gray-500">{db.type} {db.version}</span>
              <span className={`ml-2 badge ${db.status === "running" ? "badge-success" : "badge-warning"}`}>{db.status}</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Host</p>
              <p className="font-mono">{db.host}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Port</p>
              <p className="font-mono">{db.port}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Database</p>
              <p className="font-mono">{db.databaseName}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Username</p>
              <p className="font-mono">{db.username}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg md:col-span-2">
              <p className="text-gray-500">Connection String</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-gray-100 rounded text-xs break-all">
                  postgresql://{db.username}:{db.password}@{db.host}:{db.port}/{db.databaseName}
                </code>
                <button onClick={() => copyToClipboard(`postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.databaseName}`)}
                  className="text-brand-600 hover:text-brand-800 text-xs whitespace-nowrap">Copy</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {databases.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <p className="text-gray-500 font-medium">No databases yet</p>
            <p className="text-gray-400 text-sm mt-1">Provision your first PostgreSQL, MySQL, or Redis database</p>
          </div>
        </div>
      )}
    </div>
  );
}
