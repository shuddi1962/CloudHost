"use client";
import { useState, useEffect } from "react";

export default function R2Page() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", visibility: "private", region: "auto" });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/storage${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/r2").then(r => r.json()).then(d => setBuckets(d.buckets || [])).catch(() => {}); }, []);

  const create = async () => {
    const d = await (await api("/r2", { method: "POST", body: JSON.stringify(form) })).json();
    setBuckets([...buckets, d.bucket]);
    setForm({ name: "", description: "", visibility: "private", region: "auto" });
  };

  const deleteB = async (id: string) => { await api(`/r2/${id}`, { method: "DELETE" }); setBuckets(buckets.filter((b: any) => b.id !== id)); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">R2 Object Storage</h1><p className="text-gray-500">Egress-free object storage compatible with S3</p></div></div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">New Bucket</h3>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Bucket name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="private">Private</option><option value="public">Public</option>
          </select>
        </div>
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <button onClick={create} className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">Create Bucket</button>
      </div>
      <div className="space-y-3">
        {buckets.map((b: any) => (
          <div key={b.id} className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div><h3 className="font-semibold">{b.name}</h3><p className="text-xs text-gray-400">{b.visibility} · {b.region} · {b.objectCount} objects · {(b.totalSize / 1024 / 1024).toFixed(2)} MB</p></div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${b.visibility === "public" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{b.visibility}</span>
            </div>
            <div className="flex gap-2 mt-3"><button onClick={() => deleteB(b.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">Delete</button></div>
          </div>
        ))}
        {buckets.length === 0 && <p className="text-center text-gray-400 py-8">No buckets yet.</p>}
      </div>
    </div>
  );
}
