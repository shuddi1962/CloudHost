"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EdgeFunctionsPage() {
  const router = useRouter();
  const [functions, setFunctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', runtime: 'node20', memory_mb: 256, timeout_seconds: 30 });

  const load = () => fetch('/api/edge-functions').then(r => r.json()).then(d => setFunctions(d.functions || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const create = async () => {
    const res = await fetch('/api/edge-functions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    setShowCreate(false);
    router.push(`/dashboard/edge-functions/${data.function.id}`);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this function?')) return;
    await fetch(`/api/edge-functions/${id}`, { method: 'DELETE' });
    load();
  };

  const statusColor = (s: string) => ({ active: 'bg-green-100 text-green-700', deploying: 'bg-blue-100 text-blue-700', failed: 'bg-red-100 text-red-700', disabled: 'bg-gray-100 text-gray-600' }[s] || '');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edge Functions</h1>
          <p className="text-sm text-gray-400 mt-1">Serverless functions running at the edge</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ New Function</button>
      </div>

      {showCreate && (
        <div className="card mb-6">
          <div className="card-body grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Function Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="My Function" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Runtime</label>
              <select value={form.runtime} onChange={e => setForm({...form, runtime: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="node20">Node.js 20</option><option value="node18">Node.js 18</option><option value="deno">Deno</option><option value="python3">Python 3.12</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Memory</label>
              <select value={form.memory_mb} onChange={e => setForm({...form, memory_mb: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="128">128 MB</option><option value="256">256 MB</option><option value="512">512 MB</option><option value="1024">1024 MB</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Timeout</label>
              <select value={form.timeout_seconds} onChange={e => setForm({...form, timeout_seconds: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="10">10s</option><option value="30">30s</option><option value="60">60s</option><option value="120">120s</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-2">
              <button onClick={create} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Create</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded" />)}</div>
      ) : (
        <div className="grid gap-3">
          {functions.map(fn => (
            <div key={fn.id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/edge-functions/${fn.id}`)}>
              <div className="card-body flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{fn.name}</p>
                    <span className={`text-xs rounded-full px-2 ${statusColor(fn.status)}`}>{fn.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{fn.runtime} · {fn.url}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{fn.invocations.toLocaleString()} invocations</span>
                    <span>{fn.avg_duration_ms}ms avg</span>
                    <span className={fn.errors_24h > 10 ? 'text-red-500' : ''}>{fn.errors_24h} errors (24h)</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); remove(fn.id); }} className="text-xs text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
