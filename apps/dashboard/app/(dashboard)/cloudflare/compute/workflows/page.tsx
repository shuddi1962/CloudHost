"use client";
import { useState, useEffect } from "react";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", steps: [{ name: "step1", type: "fetch", config: { url: "https://example.com", method: "GET" } }], schedule: "" });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/compute${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/cf-workflows").then(r => r.json()).then(d => setWorkflows(d.workflows || [])).catch(() => {}); }, []);

  const create = async () => {
    const d = await (await api("/cf-workflows", { method: "POST", body: JSON.stringify(form) })).json();
    setWorkflows([...workflows, d.workflow]);
    setForm({ name: "", description: "", steps: [{ name: "step1", type: "fetch", config: { url: "https://example.com", method: "GET" } }], schedule: "" });
  };

  const trigger = async (id: string) => {
    const d = await (await api(`/cf-workflows/${id}/trigger`, { method: "POST" })).json();
    setWorkflows(workflows.map((w: any) => w.id === id ? d.workflow : w));
  };

  const pause = async (id: string) => {
    const d = await (await api(`/cf-workflows/${id}/pause`, { method: "POST" })).json();
    setWorkflows(workflows.map((w: any) => w.id === id ? d.workflow : w));
  };

  const deleteW = async (id: string) => {
    await api(`/cf-workflows/${id}`, { method: "DELETE" });
    setWorkflows(workflows.filter((w: any) => w.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-gray-500">Process orchestration — build and schedule multi-step workflows</p>
        </div>
      </div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">New Workflow</h3>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Workflow Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Schedule (cron, optional)" value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <button onClick={create} className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">Create Workflow</button>
      </div>
      <div className="space-y-3">
        {workflows.map((w: any) => (
          <div key={w.id} className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{w.name}</h3>
                <p className="text-xs text-gray-400">{w.description} · {(w.steps as any[])?.length || 0} steps · {w.schedule || "Manual trigger"}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${w.status === "active" ? "bg-green-100 text-green-700" : w.status === "paused" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{w.status}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => trigger(w.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">Trigger</button>
              <button onClick={() => pause(w.id)} className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-xs hover:bg-yellow-700">{w.status === "paused" ? "Resume" : "Pause"}</button>
              <button onClick={() => deleteW(w.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">Delete</button>
            </div>
            {(w.steps as any[])?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Steps</p>
                <div className="flex gap-2 flex-wrap">
                  {(w.steps as any[]).map((s: any, i: number) => (
                    <span key={i} className="px-2 py-1 bg-gray-50 rounded text-xs border border-gray-200">{s.name} ({s.type})</span>
                  ))}
                </div>
              </div>
            )}
            {(w.runs as any[])?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Recent Runs</p>
                {(w.runs as any[]).slice(-3).reverse().map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-gray-50 rounded mt-1">
                    <span>Run #{r.id?.slice(-6)}</span>
                    <span className={r.status === "running" ? "text-blue-600" : "text-green-600"}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {workflows.length === 0 && <p className="text-center text-gray-400 py-8">No workflows yet.</p>}
      </div>
    </div>
  );
}
