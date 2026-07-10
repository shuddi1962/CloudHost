"use client";
import { useState, useEffect } from "react";

export default function ContainersPage() {
  const [containers, setContainers] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", image: "nginx", tag: "latest", registry: "docker.io", ports: [{ container: 80, host: 8080, protocol: "TCP" }], resources: { cpu: "0.5", memory: "512MB" }, region: "auto" });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/compute${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/containers").then(r => r.json()).then(d => setContainers(d.containers || [])).catch(() => {}); }, []);

  const create = async () => {
    const d = await (await api("/containers", { method: "POST", body: JSON.stringify(form) })).json();
    setContainers([...containers, d.container]);
    setForm({ name: "", image: "nginx", tag: "latest", registry: "docker.io", ports: [{ container: 80, host: 8080, protocol: "TCP" }], resources: { cpu: "0.5", memory: "512MB" }, region: "auto" });
  };

  const start = async (id: string) => {
    const d = await (await api(`/containers/${id}/start`, { method: "POST" })).json();
    setContainers(containers.map((c: any) => c.id === id ? d.container : c));
  };

  const stop = async (id: string) => {
    const d = await (await api(`/containers/${id}/stop`, { method: "POST" })).json();
    setContainers(containers.map((c: any) => c.id === id ? d.container : c));
  };

  const deleteC = async (id: string) => {
    await api(`/containers/${id}`, { method: "DELETE" });
    setContainers(containers.filter((c: any) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Containers</h1>
          <p className="text-gray-500">Run any containerized workload at the edge</p>
        </div>
      </div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">New Container</h3>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Container Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Image" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Tag" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Registry" value={form.registry} onChange={e => setForm({ ...form, registry: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="CPU (e.g. 0.5)" value={form.resources.cpu} onChange={e => setForm({ ...form, resources: { ...form.resources, cpu: e.target.value } })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Memory (e.g. 512MB)" value={form.resources.memory} onChange={e => setForm({ ...form, resources: { ...form.resources, memory: e.target.value } })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <button onClick={create} className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">Create Container</button>
      </div>
      <div className="space-y-3">
        {containers.map((c: any) => (
          <div key={c.id} className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-xs text-gray-400">{c.image}:{c.tag} · {c.region} · {(c.ports as any[])?.map((p: any) => `${p.host}:${p.container}`).join(", ")}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "running" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{c.status}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {c.status !== "running" ? (
                <button onClick={() => start(c.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">Start</button>
              ) : (
                <button onClick={() => stop(c.id)} className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-xs hover:bg-yellow-700">Stop</button>
              )}
              <button onClick={() => deleteC(c.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">Delete</button>
            </div>
          </div>
        ))}
        {containers.length === 0 && <p className="text-center text-gray-400 py-8">No containers. Create one above.</p>}
      </div>
    </div>
  );
}
