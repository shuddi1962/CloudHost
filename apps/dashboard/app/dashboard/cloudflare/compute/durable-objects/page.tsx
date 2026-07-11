"use client";
import { useState, useEffect } from "react";

export default function DurableObjectsPage() {
  const [objects, setObjects] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", workerId: "", className: "" });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/compute${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/durable-objects").then(r => r.json()).then(d => setObjects(d.durableObjects || [])).catch(() => {}); }, []);

  const create = async () => {
    const d = await (await api("/durable-objects", { method: "POST", body: JSON.stringify(form) })).json();
    setObjects([...objects, d.durableObject]);
    setForm({ name: "", workerId: "", className: "" });
  };

  const deleteDO = async (id: string) => {
    await api(`/durable-objects/${id}`, { method: "DELETE" });
    setObjects(objects.filter((o: any) => o.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Durable Objects</h1>
          <p className="text-gray-500">Stateful compute — consistent storage, coordinated across regions</p>
        </div>
      </div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">New Durable Object</h3>
        <div className="grid grid-cols-3 gap-3">
          <input placeholder="DO Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Class Name" value={form.className} onChange={e => setForm({ ...form, className: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Worker ID (optional)" value={form.workerId} onChange={e => setForm({ ...form, workerId: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <button onClick={create} className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">Create Durable Object</button>
      </div>
      <div className="space-y-3">
        {objects.map((o: any) => (
          <div key={o.id} className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{o.name}</h3>
                <p className="text-xs text-gray-400">Class: {o.className} · Status: {o.status}</p>
              </div>
              <button onClick={() => deleteDO(o.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">Delete</button>
            </div>
            {o.storage && Object.keys(o.storage).length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <pre>{JSON.stringify(o.storage, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
        {objects.length === 0 && <p className="text-center text-gray-400 py-8">No durable objects yet.</p>}
      </div>
    </div>
  );
}
