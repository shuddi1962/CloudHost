"use client";

import { useState, useEffect } from "react";
import {
  Plus, Bot, RotateCcw, Trash2, Server,
  MessageCircle, Clock, Zap, Sparkles, Globe
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
  port: number;
  apiEndpoint: string;
  messagesProcessed: number;
  uptime: string;
}

const AGENT_TYPES = [
  { id: "hermes", name: "Hermes", desc: "Self-improving AI agent that learns and adapts", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-100" },
  { id: "openclaw", name: "OpenClaw", desc: "Personal AI assistant for daily tasks", icon: Bot, color: "text-blue-500", bg: "bg-blue-100" },
  { id: "paperclip", name: "Paperclip", desc: "AI orchestration platform for workflows", icon: Zap, color: "text-orange-500", bg: "bg-orange-100" },
];

export default function AiAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ agentType: "hermes", name: "", vps: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/hostinger-services/ai-agents", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setAgents(data.agents || []))
      .finally(() => setLoading(false));
  }, []);

  const deploy = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/hostinger-services/ai-agents", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setAgents([...agents, data.agent]);
      setShowForm(false);
      setForm({ agentType: "hermes", name: "", vps: "" });
    }
  };

  const restart = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/hostinger-services/ai-agents/${id}/restart`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const deleteAgent = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/hostinger-services/ai-agents/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setAgents(agents.filter((a) => a.id !== id));
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Agents</h1>
          <p className="text-gray-500">Deploy and manage AI agents — Hermes, OpenClaw, Paperclip</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Deploy Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AGENT_TYPES.map((type) => (
          <div key={type.id} className="card p-5">
            <div className={`w-12 h-12 ${type.bg} rounded-xl flex items-center justify-center mb-3`}>
              <type.icon className={`w-6 h-6 ${type.color}`} />
            </div>
            <h3 className="font-semibold mb-1">{type.name}</h3>
            <p className="text-sm text-gray-500">{type.desc}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={deploy} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Agent Type</label>
              <select value={form.agentType} onChange={(e) => setForm({ ...form, agentType: e.target.value })} className="input-field">
                {AGENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Agent Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="my-agent" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">VPS (optional)</label>
              <input value={form.vps} onChange={(e) => setForm({ ...form, vps: e.target.value })}
                className="input-field" placeholder="vps-id" />
            </div>
          </div>
          <button type="submit" className="btn-primary">Deploy</button>
        </form>
      )}

      <div className="card">
        <div className="card-header"><h2 className="font-semibold">Deployed Agents</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Port</th>
                <th className="px-6 py-3 font-medium">API Endpoint</th>
                <th className="px-6 py-3 font-medium">Messages</th>
                <th className="px-6 py-3 font-medium">Uptime</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No agents deployed</td></tr>
              ) : (
                agents.map((agent) => {
                  const typeInfo = AGENT_TYPES.find((t) => t.id === agent.type);
                  return (
                    <tr key={agent.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className={`badge ${typeInfo?.bg.replace("100", "200")} ${typeInfo?.color.replace("text-", "text-")}`}>
                          {typeInfo?.name || agent.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{agent.name}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${agent.status === "running" ? "badge-success" : agent.status === "deploying" ? "badge-warning" : "badge-error"}`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{agent.port}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{agent.apiEndpoint}</td>
                      <td className="px-6 py-4">{agent.messagesProcessed?.toLocaleString()}</td>
                      <td className="px-6 py-4">{agent.uptime}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => restart(agent.id)} className="btn-secondary py-1 px-2 text-xs">
                            <RotateCcw className="w-3 h-3" /> Restart
                          </button>
                          <button onClick={() => deleteAgent(agent.id)} className="btn-danger py-1 px-2 text-xs">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
