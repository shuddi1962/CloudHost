"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RealtimePage() {
  const params = useParams();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", tableName: "", event: "*" });
  const [viewingMessages, setViewingMessages] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const fetchSubscriptions = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/realtime/database/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSubscriptions(data.subscriptions || []);
    setLoading(false);
  };

  useEffect(() => { fetchSubscriptions(); }, [params.id]);

  const createSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3001/api/realtime", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, databaseId: params.id }),
    });
    setShowCreate(false);
    setForm({ name: "", tableName: "", event: "*" });
    fetchSubscriptions();
  };

  const toggleSubscription = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/realtime/${id}/toggle`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSubscriptions();
  };

  const viewMessages = async (id: string) => {
    setViewingMessages(id);
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/realtime/${id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(data.messages || []);
  };

  const deleteSubscription = async (id: string) => {
    if (!confirm("Delete this subscription?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/realtime/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSubscriptions();
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading subscriptions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Realtime</h1>
          <p className="text-gray-500">Subscribe to database changes in real-time via WebSocket</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Subscription
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createSubscription} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="changes-tracking" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Table Name</label>
              <input value={form.tableName} onChange={e => setForm({ ...form, tableName: e.target.value })}
                className="input-field" placeholder="users" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Event</label>
              <select value={form.event} onChange={e => setForm({ ...form, event: e.target.value })} className="input-field">
                <option value="*">All Events</option>
                <option value="insert">INSERT</option>
                <option value="update">UPDATE</option>
                <option value="delete">DELETE</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Subscription</button>
        </form>
      )}

      <div className="space-y-3">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{sub.name}</h3>
                  <span className="badge badge-info text-[10px]">{sub.tableName}</span>
                  <span className="badge badge-warning text-[10px]">{sub.event === "*" ? "ALL" : sub.event.toUpperCase()}</span>
                  <span className={`badge text-[10px] ${sub.status === "active" ? "badge-success" : "badge-warning"}`}>{sub.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => viewMessages(sub.id)}
                  className="btn-secondary text-xs px-3 py-1.5">Messages</button>
                <button onClick={() => toggleSubscription(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${sub.status === "active" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                  {sub.status === "active" ? "Pause" : "Resume"}
                </button>
                <button onClick={() => deleteSubscription(sub.id)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {viewingMessages === sub.id && (
              <div className="mt-4">
                <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-xs text-center py-4">No messages yet. Changes will appear here in real-time.</p>
                  ) : (
                    messages.map((msg: any) => (
                      <div key={msg.id} className="flex gap-2 text-xs font-mono mb-1">
                        <span className="text-gray-500">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                        <span className="text-green-400">{msg.event}</span>
                        <span className="text-gray-300">{JSON.stringify(msg.payload)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {subscriptions.length === 0 && !showCreate && (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p className="text-gray-500 font-medium">No realtime subscriptions</p>
            <p className="text-gray-400 text-sm mt-1">Subscribe to database changes to get live updates</p>
          </div>
        </div>
      )}
    </div>
  );
}
