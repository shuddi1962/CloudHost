"use client";

import { useEffect, useState } from "react";

const defaultCode = `export default async (req: Request) => {
  const { name } = await req.json().catch(() => ({ name: "World" }));
  return new Response(
    JSON.stringify({ message: \`Hello \${name} from the edge!\` }),
    { headers: { "Content-Type": "application/json" } }
  );
};`;

export default function EdgeFunctionsPage() {
  const [functions, setFunctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sourceCode: defaultCode, runtime: "deno" });
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchFunctions = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/edge-functions/project/00000000-0000-0000-0000-000000000000", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setFunctions(data.functions || []);
    setLoading(false);
  };

  useEffect(() => { fetchFunctions(); }, []);

  const createFunction = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3001/api/edge-functions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        projectId: "00000000-0000-0000-0000-000000000000",
        ...form,
      }),
    });
    setShowCreate(false);
    setForm({ name: "", sourceCode: defaultCode, runtime: "deno" });
    fetchFunctions();
  };

  const deploy = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/edge-functions/${id}/deploy`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchFunctions();
  };

  const deactivate = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/edge-functions/${id}/deactivate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchFunctions();
  };

  const viewLogs = async (id: string) => {
    setActiveTab(id);
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/edge-functions/${id}/logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLogs(data.logs || []);
  };

  const deleteFn = async (id: string) => {
    if (!confirm("Delete this edge function?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/edge-functions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchFunctions();
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading edge functions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edge Functions</h1>
          <p className="text-gray-500">Serverless functions deployed at the edge for low-latency responses</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Function
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createFunction} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Function Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="hello-world" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Runtime</label>
              <select value={form.runtime} onChange={e => setForm({ ...form, runtime: e.target.value })} className="input-field">
                <option value="deno">Deno</option>
                <option value="node">Node.js</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Code</label>
            <textarea value={form.sourceCode} onChange={e => setForm({ ...form, sourceCode: e.target.value })}
              className="input-field font-mono text-xs" rows={12} />
          </div>
          <button type="submit" className="btn-primary">Create Function</button>
        </form>
      )}

      <div className="grid gap-4">
        {functions.map((fn) => (
          <div key={fn.id} className="card overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{fn.name}</h3>
                    <span className="badge badge-info text-[10px]">{fn.runtime}</span>
                    <span className={`badge text-[10px] ${fn.status === "active" ? "badge-success" : fn.status === "error" ? "badge-error" : "badge-warning"}`}>
                      {fn.status}
                    </span>
                  </div>
                  <code className="text-xs text-gray-500">{fn.url}</code>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {fn.status !== "active" ? (
                    <button onClick={() => deploy(fn.id)} className="btn-primary text-xs px-3 py-1.5">Deploy</button>
                  ) : (
                    <button onClick={() => deactivate(fn.id)} className="btn-secondary text-xs px-3 py-1.5">Deactivate</button>
                  )}
                  <button onClick={() => viewLogs(fn.id)}
                    className={`btn-secondary text-xs px-3 py-1.5 ${activeTab === fn.id ? "bg-brand-50 text-brand-700" : ""}`}>Logs</button>
                  <button onClick={() => deleteFn(fn.id)} className="text-gray-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                <pre className="text-xs font-mono overflow-x-auto max-h-32">
                  <code>{fn.sourceCode?.substring(0, 300)}{fn.sourceCode?.length > 300 ? "..." : ""}</code>
                </pre>
              </div>

              {activeTab === fn.id && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Logs</p>
                  <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {logs.length === 0 ? (
                      <p className="text-gray-500 text-xs text-center py-4">No logs yet</p>
                    ) : (
                      logs.map((log: any) => (
                        <div key={log.id} className="flex gap-2 text-xs font-mono mb-1">
                          <span className="text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                          <span className={log.type === "error" ? "text-red-400" : log.type === "warn" ? "text-yellow-400" : "text-green-400"}>
                            [{log.type}]
                          </span>
                          <span className="text-gray-300">{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {functions.length === 0 && !showCreate && (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-gray-500 font-medium">No edge functions</p>
            <p className="text-gray-400 text-sm mt-1">Create serverless functions that run at the edge</p>
          </div>
        </div>
      )}
    </div>
  );
}
