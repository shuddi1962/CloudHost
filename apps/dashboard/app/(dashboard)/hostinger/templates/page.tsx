"use client";

import { useState, useEffect } from "react";
import {
  Grid3X3, Plus, Star, Sparkles, Layout,
  ShoppingBag, Palette, Pen, Briefcase, RefreshCw
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  popularity: number;
  preview?: string;
}

const CATEGORIES = [
  { id: "all", label: "All", icon: Grid3X3 },
  { id: "business", label: "Business", icon: Briefcase },
  { id: "ecommerce", label: "Ecommerce", icon: ShoppingBag },
  { id: "creative", label: "Creative", icon: Palette },
  { id: "blog", label: "Blog", icon: Pen },
  { id: "saas", label: "SaaS", icon: Layout },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [category]);

  const loadTemplates = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const url = category === "all"
      ? "http://localhost:3001/api/hostinger-services/templates"
      : `http://localhost:3001/api/hostinger-services/templates?category=${category}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates || []))
      .finally(() => setLoading(false));
  };

  const seed = async () => {
    setSeeding(true);
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/hostinger-services/templates/seed", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      loadTemplates();
    }
    setSeeding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Website Templates</h1>
          <p className="text-gray-500">Browse and preview website templates</p>
        </div>
        {templates.length > 0 && (
          <button onClick={loadTemplates} className="btn-secondary">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat.id
                ? "bg-brand-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}>
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : templates.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Layout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No templates available</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">Seed templates to get started</p>
            <button onClick={seed} disabled={seeding} className="btn-primary">
              <Sparkles className="w-4 h-4" />
              {seeding ? "Seeding..." : "Seed Templates"}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="card overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center">
                <Layout className="w-12 h-12 text-brand-300" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{tpl.name}</h3>
                  <span className="badge badge-info text-[10px]">{tpl.category}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{tpl.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {tpl.features?.slice(0, 3).map((f, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{f}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-yellow-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{tpl.popularity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
