"use client";
import { useState, useEffect } from "react";

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [form, setForm] = useState({ namespace: "", description: "", smartPlacement: true, limits: { cpuTime: "10ms", memory: "128MB", requestsPerMinute: 1000 } });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/compute${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/platforms").then(r => r.json()).then(d => setPlatforms(d.platforms || [])).catch(() => {}); }, []);

  const create = async () => {
    const d = await (await api("/platforms", { method: "POST", body: JSON.stringify(form) })).json();
    setPlatforms([...platforms, d.platform]);
    setForm({ namespace: "", description: "", smartPlacement: true, limits: { cpuTime: "10ms", memory: "128MB", requestsPerMinute: 1000 } });
  };

  const deleteP = async (id: string) => {
    await api(`/platforms/${id}`, { method: "DELETE" });
    setPlatforms(platforms.filter((p: any) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workers for Platforms</h1>
          <p className="text-gray-500">Programmable platform solutions — let your users deploy Workers on your platform</p>
        </div>
      </div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">New Namespace</h3>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Namespace (unique)" value={form.namespace} onChange={e => setForm({ ...form, namespace: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <button onClick={create} className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">Create Namespace</button>
      </div>
      <div className="space-y-3">
        {platforms.map((p: any) => (
          <div key={p.id} className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{p.namespace}</h3>
                <p className="text-xs text-gray-400">{p.description} · Smart Placement: {p.smartPlacement ? "✅" : "❌"}</p>
              </div>
              <button onClick={() => deleteP(p.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">Delete</button>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-gray-50 rounded"><strong>CPU Limit:</strong> {(p.limits as any)?.cpuTime}</div>
              <div className="p-2 bg-gray-50 rounded"><strong>Memory:</strong> {(p.limits as any)?.memory}</div>
              <div className="p-2 bg-gray-50 rounded"><strong>Req/min:</strong> {(p.limits as any)?.requestsPerMinute}</div>
            </div>
          </div>
        ))}
        {platforms.length === 0 && <p className="text-center text-gray-400 py-8">No namespaces yet.</p>}
      </div>
    </div>
  );
}
