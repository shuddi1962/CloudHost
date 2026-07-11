"use client";
import { useState, useEffect } from "react";

export default function SandboxesPage() {
  const [sandboxes, setSandboxes] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", runtime: "node:18", code: "console.log('hello world');", ttl: 3600 });
  const [execOutput, setExecOutput] = useState<any>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/compute${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/sandboxes").then(r => r.json()).then(d => setSandboxes(d.sandboxes || [])).catch(() => {}); }, []);

  const create = async () => {
    const d = await (await api("/sandboxes", { method: "POST", body: JSON.stringify(form) })).json();
    setSandboxes([...sandboxes, d.sandbox]);
    setForm({ name: "", runtime: "node:18", code: "console.log('hello world');", ttl: 3600 });
  };

  const execute = async (id: string) => {
    const d = await (await api(`/sandboxes/${id}/execute`, { method: "POST", body: JSON.stringify({ runtime: "node:18", code: "console.log('test')" }) })).json();
    setSandboxes(sandboxes.map((s: any) => s.id === id ? d.sandbox : s));
    setExecOutput(d.sandbox);
  };

  const stop = async (id: string) => {
    const d = await (await api(`/sandboxes/${id}/stop`, { method: "POST" })).json();
    setSandboxes(sandboxes.map((s: any) => s.id === id ? d.sandbox : s));
  };

  const deleteS = async (id: string) => {
    await api(`/sandboxes/${id}`, { method: "DELETE" });
    setSandboxes(sandboxes.filter((s: any) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sandboxes</h1>
          <p className="text-gray-500">Secure, isolated code execution environments</p>
        </div>
      </div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">New Sandbox</h3>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Sandbox Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <select value={form.runtime} onChange={e => setForm({ ...form, runtime: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="node:18">Node.js 18</option>
            <option value="node:20">Node.js 20</option>
            <option value="python:3.11">Python 3.11</option>
            <option value="python:3.12">Python 3.12</option>
            <option value="rust:latest">Rust</option>
            <option value="go:1.22">Go 1.22</option>
          </select>
        </div>
        <textarea placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
          className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono h-24" />
        <button onClick={create} className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">Create Sandbox</button>
      </div>
      <div className="space-y-3">
        {sandboxes.map((s: any) => (
          <div key={s.id} className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-xs text-gray-400">{s.runtime} · Expires: {s.expiresAt ? new Date(s.expiresAt).toLocaleString() : "—"}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${s.status === "running" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{s.status}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => execute(s.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">Execute</button>
              {s.status === "running" && <button onClick={() => stop(s.id)} className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-xs hover:bg-yellow-700">Stop</button>}
              <button onClick={() => deleteS(s.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">Delete</button>
            </div>
            {s.output && (s.output as any[]).length > 0 && (
              <div className="mt-3 p-3 bg-gray-900 text-green-400 rounded-lg text-xs font-mono max-h-32 overflow-y-auto">
                {(s.output as any[]).map((o: any, i: number) => <div key={i}>[{o.type}] {o.text}</div>)}
              </div>
            )}
          </div>
        ))}
        {sandboxes.length === 0 && <p className="text-center text-gray-400 py-8">No sandboxes yet.</p>}
      </div>
    </div>
  );
}
