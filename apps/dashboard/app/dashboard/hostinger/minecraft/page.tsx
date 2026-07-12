"use client";

import { useState, useEffect } from "react";
import {
  Plus, Play, StopCircle, Skull, Server,
  Users, Award, Shield, PocketKnife as Knife
} from "lucide-react";

interface MinecraftServer {
  id: string;
  name: string;
  version: string;
  serverType: string;
  ram: string;
  cpu: string;
  storage: string;
  maxPlayers: number;
  onlinePlayers: number;
  pvp: boolean;
  difficulty: string;
  ip: string;
  port: number;
  status: string;
  operators: string[];
}

const STATUS_COLORS: Record<string, string> = {
  running: "badge-success",
  stopped: "badge-error",
  starting: "badge-warning",
  stopping: "badge-warning",
  killed: "badge-error",
};

export default function MinecraftPage() {
  const [servers, setServers] = useState<MinecraftServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", version: "1.20.4", serverType: "vanilla",
    ram: "2", cpu: "2", storage: "10", maxPlayers: "20",
    pvp: true, difficulty: "normal", operators: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/minecraft`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setServers(data.servers || []))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/minecraft`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        maxPlayers: parseInt(form.maxPlayers),
        ram: form.ram + "GB",
        cpu: form.cpu + " vCPU",
        storage: form.storage + "GB",
        operators: form.operators.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setServers([...servers, data.server]);
      setShowForm(false);
      setForm({ name: "", version: "1.20.4", serverType: "vanilla", ram: "2", cpu: "2", storage: "10", maxPlayers: "20", pvp: true, difficulty: "normal", operators: "" });
    }
  };

  const action = async (id: string, action: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/minecraft/${id}/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setServers(servers.map((s) => (s.id === id ? { ...s, status: action === "start" ? "starting" : action === "stop" ? "stopping" : "killed" } : s)));
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Minecraft Hosting</h1>
          <p className="text-gray-500">High-performance Minecraft server hosting</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Server
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Server Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="My Minecraft Server" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Version</label>
              <select value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="input-field">
                <option value="1.20.4">1.20.4</option>
                <option value="1.19">1.19</option>
                <option value="1.18">1.18</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Server Type</label>
              <select value={form.serverType} onChange={(e) => setForm({ ...form, serverType: e.target.value })} className="input-field">
                <option value="vanilla">Vanilla</option>
                <option value="paper">Paper</option>
                <option value="spigot">Spigot</option>
                <option value="forge">Forge</option>
                <option value="fabric">Fabric</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">RAM</label>
              <select value={form.ram} onChange={(e) => setForm({ ...form, ram: e.target.value })} className="input-field">
                <option value="2">2 GB</option>
                <option value="4">4 GB</option>
                <option value="8">8 GB</option>
                <option value="16">16 GB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CPU (vCPU)</label>
              <select value={form.cpu} onChange={(e) => setForm({ ...form, cpu: e.target.value })} className="input-field">
                <option value="2">2 vCPU</option>
                <option value="4">4 vCPU</option>
                <option value="6">6 vCPU</option>
                <option value="8">8 vCPU</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Storage</label>
              <select value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} className="input-field">
                <option value="10">10 GB</option>
                <option value="20">20 GB</option>
                <option value="50">50 GB</option>
                <option value="100">100 GB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Players</label>
              <input type="number" value={form.maxPlayers} onChange={(e) => setForm({ ...form, maxPlayers: e.target.value })}
                className="input-field" min="1" max="100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input-field">
                <option value="peaceful">Peaceful</option>
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Operators (comma separated)</label>
              <input value={form.operators} onChange={(e) => setForm({ ...form, operators: e.target.value })}
                className="input-field" placeholder="Notch, Dinnerbone" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.pvp} onChange={(e) => setForm({ ...form, pvp: e.target.checked })} />
              Enable PvP
            </label>
          </div>
          <button type="submit" className="btn-primary">Create Server</button>
        </form>
      )}

      {servers.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Knife className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No Minecraft servers yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first server and start playing</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((s) => (
            <div key={s.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-brand-500" />
                  <h3 className="font-semibold">{s.name}</h3>
                </div>
                <span className={`badge ${STATUS_COLORS[s.status] || "badge-info"}`}>{s.status}</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-mono">{s.ip}:{s.port}</span>
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                <span className="badge badge-info">{s.version}</span>
                <span className="badge badge-info">{s.serverType}</span>
                <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {s.difficulty}</span>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> PvP: {s.pvp ? "On" : "Off"}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.onlinePlayers}/{s.maxPlayers}</span>
              </div>
              {s.operators?.length > 0 && (
                <p className="text-xs text-gray-400 mb-3">Ops: {s.operators.join(", ")}</p>
              )}
              <div className="flex gap-2">
                <button onClick={() => action(s.id, "start")} className="btn-primary py-1 px-2 text-xs"
                  disabled={s.status === "running" || s.status === "starting"}>
                  <Play className="w-3 h-3" /> Start
                </button>
                <button onClick={() => action(s.id, "stop")} className="btn-secondary py-1 px-2 text-xs"
                  disabled={s.status !== "running"}>
                  <StopCircle className="w-3 h-3" /> Stop
                </button>
                <button onClick={() => action(s.id, "kill")} className="btn-danger py-1 px-2 text-xs"
                  disabled={s.status !== "running" && s.status !== "stopping"}>
                  <Skull className="w-3 h-3" /> Kill
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
