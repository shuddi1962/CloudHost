"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function WebhooksPage() {
  const params = useParams();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", tableName: "", events: "*", url: "" });
  const [viewingLogs, setViewingLogs] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchWebhooks = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/webhooks/database/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setWebhooks(data.webhooks || []);
    setLoading(false);
  };

  useEffect(() => { fetchWebhooks(); }, [params.id]);

  const createWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3001/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, databaseId: params.id }),
    });
    setShowCreate(false);
    setForm({ name: "", tableName: "", events: "*", url: "" });
    fetchWebhooks();
  };

  const toggleWebhook = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/webhooks/${id}/toggle`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchWebhooks();
  };

  const viewLogs = async (id: string) => {
    setViewingLogs(id);
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/webhooks/${id}/logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLogs(data.logs || []);
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Delete this webhook?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/webhooks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchWebhooks();
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading webhooks...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Database Webhooks</h1>
          <p className="text-gray-500">Send database changes to external endpoints via HTTP</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Webhook
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createWebhook} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="notify-slack" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Table Name</label>
              <input value={form.tableName} onChange={e => setForm({ ...form, tableName: e.target.value })}
                className="input-field" placeholder="orders" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Events</label>
              <select value={form.events} onChange={e => setForm({ ...form, events: e.target.value })} className="input-field">
                <option value="*">All Events</option>
                <option value="insert">INSERT</option>
                <option value="update">UPDATE</option>
                <option value="delete">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Endpoint URL</label>
              <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                className="input-field" placeholder="https://hooks.example.com/webhook" required />
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Webhook</button>
        </form>
      )}

      <div className="space-y-3">
        {webhooks.map((wh) => (
          <div key={wh.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{wh.name}</h3>
                  <span className="badge badge-info text-[10px]">{wh.tableName}</span>
                  <span className="badge badge-warning text-[10px]">{wh.events === "*" ? "ALL" : wh.events.toUpperCase()}</span>
                </div>
                <code className="text-xs text-gray-500">{wh.url}</code>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => viewLogs(wh.id)}
                  className="btn-secondary text-xs px-3 py-1.5">Logs</button>
                <button onClick={() => toggleWebhook(wh.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${wh.enabled ? "bg-brand-600" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${wh.enabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <button onClick={() => deleteWebhook(wh.id)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {viewingLogs === wh.id && (
              <div className="mt-4">
                <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-xs text-center py-4">No webhook calls yet. Logs will appear when this webhook fires.</p>
                  ) : (
                    logs.map((log: any) => (
                      <div key={log.id} className="flex gap-2 text-xs font-mono mb-1">
                        <span className="text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        <span className={log.success ? "text-green-400" : "text-red-400"}>{log.statusCode || "---"}</span>
                        <span className="text-gray-300">{log.eventTriggered}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {webhooks.length === 0 && !showCreate && (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="text-gray-500 font-medium">No webhooks configured</p>
            <p className="text-gray-400 text-sm mt-1">Send database changes to external services via HTTP</p>
          </div>
        </div>
      )}
    </div>
  );
}
