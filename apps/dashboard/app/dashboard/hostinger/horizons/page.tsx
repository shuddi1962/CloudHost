"use client";

import { useState, useEffect } from "react";
import {
  Plus, Send, Rocket, FileText, Sparkles,
  Cpu, Layers
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  initialPrompt: string;
  techStack: string[];
  status: string;
  pagesCount: number;
  features: string[];
  aiCreditsUsed: number;
  aiCreditsRemaining: number;
}

const TECH_OPTIONS = [
  "React", "Next.js", "TypeScript", "Tailwind CSS",
  "Node.js", "PostgreSQL", "Prisma", "Stripe"
];

export default function HorizonsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", initialPrompt: "",
    techStack: [] as string[]
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/horizons`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setProjects(data.projects || []))
      .finally(() => setLoading(false));
  }, []);

  const toggleTech = (tech: string) => {
    setForm({
      ...form,
      techStack: form.techStack.includes(tech)
        ? form.techStack.filter((t) => t !== tech)
        : [...form.techStack, tech],
    });
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/horizons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setProjects([...projects, data.project]);
      setShowForm(false);
      setForm({ name: "", description: "", initialPrompt: "", techStack: [] });
    }
  };

  const generate = async (id: string) => {
    if (!prompt) return;
    setGenerating(id);
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/horizons/${id}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ prompt }),
    });
    if (res.ok) {
      const data = await res.json();
      setProjects(projects.map((p) => (p.id === id ? { ...p, ...data.project } : p)));
      setPrompt("");
    }
    setGenerating(null);
  };

  const publish = async (id: string) => {
    setPublishing(id);
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/horizons/${id}/publish`, {
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
          <h1 className="text-2xl font-bold">Hostinger Horizons</h1>
          <p className="text-gray-500">AI-powered app builder — describe, generate, deploy</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="My App" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field" placeholder="A beautiful app..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Initial Prompt</label>
              <textarea value={form.initialPrompt} onChange={(e) => setForm({ ...form, initialPrompt: e.target.value })}
                className="input-field" rows={3} placeholder="Describe what you want to build..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Tech Stack</label>
              <div className="flex flex-wrap gap-2">
                {TECH_OPTIONS.map((tech) => (
                  <button key={tech} type="button" onClick={() => toggleTech(tech)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      form.techStack.includes(tech)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                    }`}>
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Project</button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Rocket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No projects yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first AI-generated project</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div key={proj.id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{proj.name}</h3>
                <span className={`badge ${proj.status === "published" ? "badge-success" : "badge-warning"}`}>
                  {proj.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{proj.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {proj.techStack?.map((t) => (
                  <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <FileText className="w-4 h-4 mx-auto mb-1 text-brand-500" />
                  <span className="font-medium">{proj.pagesCount}</span>
                  <p className="text-gray-400">Pages</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <Layers className="w-4 h-4 mx-auto mb-1 text-green-500" />
                  <span className="font-medium">{proj.features?.length || 0}</span>
                  <p className="text-gray-400">Features</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <Cpu className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                  <span className="font-medium">{proj.aiCreditsRemaining}</span>
                  <p className="text-gray-400">Credits</p>
                </div>
              </div>
              {proj.features?.length > 0 && (
                <div className="text-xs text-gray-500 mb-2">
                  {proj.features.slice(0, 3).map((f, i) => (
                    <p key={i} className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-500" />{f}</p>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mb-3">
                <input value={prompt} onChange={(e) => setPrompt(e.target.value)}
                  className="input-field flex-1 text-xs" placeholder="Prompt to update project..." />
                <button onClick={() => generate(proj.id)} disabled={generating === proj.id || !prompt}
                  className="btn-primary text-xs">
                  <Send className="w-3 h-3" />
                </button>
              </div>
              {proj.status === "draft" && (
                <button onClick={() => publish(proj.id)} disabled={publishing === proj.id}
                  className="btn-primary w-full text-xs">
                  <Rocket className="w-3 h-3" />
                  {publishing === proj.id ? "Publishing..." : "Publish"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
