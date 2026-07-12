"use client";

import { useState, useEffect } from "react";
import {
  Plus, ShoppingCart, Globe, FileText,
  DollarSign, Send
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  template: string;
  industry: string;
  status: string;
  products: number;
  orders: number;
  revenue: number;
}

export default function EcommerceBuilderPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", template: "default", industry: "general" });
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/ecommerce-builder`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setProjects(data.projects || []))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/ecommerce-builder`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setProjects([...projects, data.project]);
      setShowForm(false);
      setForm({ name: "", template: "default", industry: "general" });
    }
  };

  const publish = async (id: string) => {
    setPublishing(id);
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/ecommerce-builder/${id}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setProjects(projects.map((p) => (p.id === id ? { ...p, ...data.project } : p)));
    }
    setPublishing(null);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ecommerce Builder</h1>
          <p className="text-gray-500">Build and manage your online store</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="My Store" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Template</label>
              <select value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className="input-field">
                <option value="default">Default</option>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="input-field">
                <option value="general">General</option>
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="food">Food & Drink</option>
                <option value="handmade">Handmade</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Project</button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No ecommerce projects yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first store project</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{p.name}</h3>
                <span className={`badge ${p.status === "published" ? "badge-success" : "badge-warning"}`}>
                  {p.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                <span className="badge badge-info">{p.template}</span>
                <span className="badge badge-info ml-1">{p.industry}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <ShoppingCart className="w-4 h-4 mx-auto mb-1 text-brand-500" />
                  <span className="font-medium">{p.products}</span>
                  <p className="text-gray-400">Products</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <FileText className="w-4 h-4 mx-auto mb-1 text-green-500" />
                  <span className="font-medium">{p.orders}</span>
                  <p className="text-gray-400">Orders</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <DollarSign className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                  <span className="font-medium">${p.revenue}</span>
                  <p className="text-gray-400">Revenue</p>
                </div>
              </div>
              {p.status === "draft" && (
                <button onClick={() => publish(p.id)} disabled={publishing === p.id} className="btn-primary w-full text-xs">
                  <Send className="w-3 h-3" />
                  {publishing === p.id ? "Publishing..." : "Publish"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
