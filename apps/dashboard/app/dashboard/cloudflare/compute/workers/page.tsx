"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", script: "export default { async fetch(request, env, ctx) { return new Response('Hello World!'); } }", runtime: "javascript" });
  const [logs, setLogs] = useState<any[]>([]);
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/compute${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/workers").then(r => r.json()).then(d => setWorkers(d.workers || [])).catch(() => {}); }, []);

  const deploy = async (id: string) => {
    const d = await (await api(`/workers/${id}/deploy`, { method: "POST" })).json();
    setWorkers(workers.map((w: any) => w.id === id ? d.worker : w));
  };

  const toggle = async (id: string) => {
    const d = await (await api(`/workers/${id}/toggle`, { method: "POST" })).json();
    setWorkers(workers.map((w: any) => w.id === id ? d.worker : w));
  };

  const deleteW = async (id: string) => {
    await api(`/workers/${id}`, { method: "DELETE" });
    setWorkers(workers.filter((w: any) => w.id !== id));
  };

  const create = async () => {
    const d = await (await api("/workers", { method: "POST", body: JSON.stringify(form) })).json();
    setWorkers([...workers, d.worker]);
    setForm({ name: "", script: "export default { async fetch(request, env, ctx) { return new Response('Hello World!'); } }", runtime: "javascript" });
  };

  const viewLogs = async (id: string) => {
    const w = workers.find(w => w.id === id);
    setLogs(w?.logs || []);
    setEditingId(editingId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workers</h1>
          <p className="text-gray-500">Global serverless functions deployed at the edge</p>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">New Worker</h3>
        <div className="space-y-3">
          <input placeholder="Worker name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <select value={form.runtime} onChange={e => setForm({ ...form, runtime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
          </select>
          <textarea placeholder="Script" value={form.script} onChange={e => setForm({ ...form, script: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono h-24" />
          <button onClick={create} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">Create Worker</button>
        </div>
      </div>

      <div className="space-y-3">
        {workers.map((w: any) => (
          <div key={w.id} className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{w.name}</h3>
                <p className="text-xs text-gray-400">{w.runtime} · {w.url || "Not deployed"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${w.status === "active" ? "bg-green-100 text-green-700" : w.status === "deploying" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{w.status}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => deploy(w.id)} disabled={w.status === "deploying"} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50">Deploy</button>
              <button onClick={() => toggle(w.id)} className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs hover:bg-gray-700">{w.status === "active" ? "Deactivate" : "Activate"}</button>
              <button onClick={() => viewLogs(w.id)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-gray-50">Logs</button>
              <button onClick={() => deleteW(w.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">Delete</button>
            </div>
            {editingId === w.id && logs.length > 0 && (
              <div className="mt-3 p-3 bg-gray-900 text-green-400 rounded-lg text-xs font-mono max-h-32 overflow-y-auto">
                {logs.map((l: any, i: number) => <div key={i}>[{l.time}] {l.message}</div>)}
              </div>
            )}
          </div>
        ))}
        {workers.length === 0 && <p className="text-center text-gray-400 py-8">No workers. Create your first worker above.</p>}
      </div>
    </div>
  );
}
