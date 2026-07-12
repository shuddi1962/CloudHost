"use client";

import { useState } from "react";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const createWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/workflows`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        projectId: "00000000-0000-0000-0000-000000000000",
        name: form.name,
        description: form.description,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setWorkflows([...workflows, data.workflow]);
      setShowCreate(false);
      setForm({ name: "", description: "" });
    }
  };

  const toggleWorkflow = async (id: string, currentStatus: string) => {
    const token = localStorage.getItem("token");
    const action = currentStatus === "active" ? "deactivate" : "activate";
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/workflows/${id}/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setWorkflows(workflows.map(w => w.id === id ? data.workflow : w));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-gray-500">Automate tasks with powerful workflow builder</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Workflow
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createWorkflow} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Workflow Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field" placeholder="My Automation" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field" rows={3} placeholder="What does this workflow do?" />
          </div>
          <button type="submit" className="btn-primary">Create Workflow</button>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Available Trigger Nodes</h2>
        </div>
        <div className="card-body grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {["Webhook", "Schedule", "Email", "Database", "HTTP", "File"].map((node) => (
            <div key={node} className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100 hover:border-brand-200 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-brand-700 font-bold text-sm">{node[0]}</span>
              </div>
              <p className="text-xs font-medium">{node}</p>
            </div>
          ))}
        </div>
      </div>

      {workflows.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="text-gray-500 font-medium">No workflows yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first automation workflow</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {workflows.map((w) => (
            <div key={w.id} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{w.name}</h3>
                  {w.description && <p className="text-sm text-gray-500">{w.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.location.href = `/dashboard/workflows/editor/${w.id}`}
                    className="btn-secondary text-xs px-3 py-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Open Editor
                  </button>
                  <span className={`badge ${w.status === "active" ? "badge-success" : "badge-warning"}`}>{w.status}</span>
                  <button onClick={() => toggleWorkflow(w.id, w.status)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${w.status === "active" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                    {w.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
              {w.webhookUrl && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg text-sm flex items-center gap-2">
                  <span className="text-gray-500">Webhook:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{w.webhookUrl}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
