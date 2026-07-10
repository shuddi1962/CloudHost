"use client";

import { useState, useEffect } from "react";
import {
  Plus, Server, MapPin, DollarSign, Cpu, HardDrive,
  Activity, Wifi, Monitor, StopCircle, Trash2, X
} from "lucide-react";

interface Instance {
  id: string;
  name: string;
  plan: string;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  location: string;
  os: string;
  managed: boolean;
  ip: string;
  status: string;
  price: number;
}

interface Metrics {
  cpu: number;
  ram: number;
  disk: number;
  network: number;
}

export default function CloudHostingPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Instance | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [form, setForm] = useState({
    name: "", plan: "starter", cpu: "2", ram: "4", storage: "50",
    bandwidth: "1", location: "us-east", os: "ubuntu", managed: false, autoScale: false
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/hostinger-services/cloud-hosting", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setInstances(data.instances || []))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/hostinger-services/cloud-hosting", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setInstances([...instances, data.instance]);
      setShowForm(false);
      setForm({ name: "", plan: "starter", cpu: "2", ram: "4", storage: "50", bandwidth: "1", location: "us-east", os: "ubuntu", managed: false, autoScale: false });
    }
  };

  const showMetrics = async (inst: Instance) => {
    setSelected(inst);
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/hostinger-services/cloud-hosting/${inst.id}/metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMetrics(data.metrics);
    }
  };

  const deleteInstance = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/hostinger-services/cloud-hosting/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setInstances(instances.filter((i) => i.id !== id));
  };

  const stopInstance = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/hostinger-services/cloud-hosting/${id}/stop`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setInstances(instances.map((i) => (i.id === id ? { ...i, status: "stopped" } : i)));
    }
  };

  const Gauge = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
      <Icon className={`w-6 h-6 ${color} mb-2`} />
      <div className="relative w-24 h-24 mb-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8"
            strokeDasharray={`${(value / 100) * 339.292} 339.292`} className={color} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{value}%</span>
      </div>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cloud Hosting</h1>
          <p className="text-gray-500">Deploy and manage scalable cloud instances</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Instance
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="my-instance" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plan</label>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="input-field">
                <option value="starter">Starter</option>
                <option value="business">Business</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CPU (vCPU)</label>
              <select value={form.cpu} onChange={(e) => setForm({ ...form, cpu: e.target.value })} className="input-field">
                <option value="1">1 vCPU</option>
                <option value="2">2 vCPU</option>
                <option value="4">4 vCPU</option>
                <option value="8">8 vCPU</option>
                <option value="16">16 vCPU</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">RAM (GB)</label>
              <select value={form.ram} onChange={(e) => setForm({ ...form, ram: e.target.value })} className="input-field">
                <option value="2">2 GB</option>
                <option value="4">4 GB</option>
                <option value="8">8 GB</option>
                <option value="16">16 GB</option>
                <option value="32">32 GB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Storage (GB)</label>
              <select value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} className="input-field">
                <option value="50">50 GB</option>
                <option value="100">100 GB</option>
                <option value="250">250 GB</option>
                <option value="500">500 GB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bandwidth (TB)</label>
              <select value={form.bandwidth} onChange={(e) => setForm({ ...form, bandwidth: e.target.value })} className="input-field">
                <option value="1">1 TB</option>
                <option value="2">2 TB</option>
                <option value="4">4 TB</option>
                <option value="10">10 TB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field">
                <option value="us-east">US East</option>
                <option value="us-west">US West</option>
                <option value="eu-west">EU West</option>
                <option value="eu-central">EU Central</option>
                <option value="ap-southeast">Asia Pacific</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">OS</label>
              <select value={form.os} onChange={(e) => setForm({ ...form, os: e.target.value })} className="input-field">
                <option value="ubuntu">Ubuntu 24.04</option>
                <option value="debian">Debian 12</option>
                <option value="centos">CentOS 9</option>
                <option value="rocky">Rocky Linux 9</option>
                <option value="windows">Windows Server 2022</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.managed} onChange={(e) => setForm({ ...form, managed: e.target.checked })} />
              Managed Hosting
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.autoScale} onChange={(e) => setForm({ ...form, autoScale: e.target.checked })} />
              Auto-scale
            </label>
          </div>
          <button type="submit" className="btn-primary">Deploy Instance</button>
        </form>
      )}

      <div className="grid gap-4">
        {instances.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <Server className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">No cloud instances yet</p>
              <p className="text-gray-400 text-sm mt-1">Deploy your first cloud instance to get started</p>
            </div>
          </div>
        ) : (
          instances.map((inst) => (
            <div key={inst.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-brand-500" />
                  <div>
                    <h3 className="font-semibold">{inst.name}</h3>
                    <p className="text-xs text-gray-500">{inst.ip || "No IP assigned"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${inst.status === "running" ? "badge-success" : inst.status === "stopped" ? "badge-error" : "badge-warning"}`}>
                    {inst.status}
                  </span>
                  <span className="text-sm font-semibold text-brand-600">${inst.price}/mo</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {inst.cpu} vCPU</span>
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {inst.ram} GB RAM</span>
                <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {inst.storage} GB</span>
                <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> {inst.bandwidth} TB</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {inst.location}</span>
                <span className="badge badge-info text-[10px]">{inst.plan}</span>
                {inst.managed && <span className="badge badge-success text-[10px]">Managed</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => showMetrics(inst)} className="btn-secondary py-1 px-2 text-xs">
                  <Monitor className="w-3 h-3" /> Metrics
                </button>
                <button onClick={() => stopInstance(inst.id)} className="btn-secondary py-1 px-2 text-xs"
                  disabled={inst.status !== "running"}>
                  <StopCircle className="w-3 h-3" /> Stop
                </button>
                <button onClick={() => deleteInstance(inst.id)} className="btn-danger py-1 px-2 text-xs">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setSelected(null); setMetrics(null); }}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{selected.name} - Metrics</h3>
              <button onClick={() => { setSelected(null); setMetrics(null); }}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {metrics ? (
              <div className="grid grid-cols-2 gap-4">
                <Gauge label="CPU" value={metrics.cpu} icon={Cpu} color="text-blue-500" />
                <Gauge label="RAM" value={metrics.ram} icon={Activity} color="text-green-500" />
                <Gauge label="Disk" value={metrics.disk} icon={HardDrive} color="text-yellow-500" />
                <Gauge label="Network" value={metrics.network} icon={Wifi} color="text-purple-500" />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">Loading metrics...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
