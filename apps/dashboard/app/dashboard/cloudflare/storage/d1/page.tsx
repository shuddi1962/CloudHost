"use client";
import { useState, useEffect } from "react";

export default function D1Page() {
  const [databases, setDatabases] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", region: "auto" });
  const [queryResults, setQueryResults] = useState<any>(null);
  const [sqlInput, setSqlInput] = useState("");
  const [selectedDb, setSelectedDb] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/storage${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/d1").then(r => r.json()).then(d => setDatabases(d.databases || [])).catch(() => {}); }, []);

  const create = async () => {
    const d = await (await api("/d1", { method: "POST", body: JSON.stringify(form) })).json();
    setDatabases([...databases, d.database]);
    setForm({ name: "", region: "auto" });
  };

  const runQuery = async () => {
    const d = await (await api(`/d1/${selectedDb}/query`, { method: "POST", body: JSON.stringify({ sql: sqlInput }) })).json();
    setQueryResults(d);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">D1 Database</h1><p className="text-gray-500">Serverless SQL database built on SQLite</p></div></div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">New Database</h3>
        <div className="flex gap-3">
          <input placeholder="Database name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <button onClick={create} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">Create</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          {databases.map((db: any) => (
            <div key={db.id} className="p-4 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-brand-200" onClick={() => setSelectedDb(db.id)}>
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold">{db.name}</h3><p className="text-xs text-gray-400">{db.region} · {db.status}</p></div>
                {selectedDb === db.id && <span className="text-brand-600 text-xs font-medium">Selected</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 rounded-xl border border-gray-200 bg-white">
          <h3 className="font-semibold mb-3">SQL Query</h3>
          <textarea placeholder="SELECT * FROM users LIMIT 10" value={sqlInput} onChange={e => setSqlInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono h-24" />
          <button onClick={runQuery} disabled={!selectedDb} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Run Query</button>
          {queryResults && (
            <div className="mt-3 p-3 bg-gray-50 rounded text-xs font-mono">
              <pre>{JSON.stringify(queryResults.results, null, 2)}</pre>
              <p className="text-gray-400 mt-1">Reads: {queryResults.rowsRead} · Writes: {queryResults.rowsWritten}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
