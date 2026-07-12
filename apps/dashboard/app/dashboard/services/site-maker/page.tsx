"use client";

import { useEffect, useState } from "react";
import { Globe, Plus, ExternalLink, Monitor, Palette, FileText, CheckCircle, X, Loader2 } from "lucide-react";

interface SiteProject {
  id: string;
  name: string;
  template: string;
  industry: string;
  status: string;
  publishedUrl?: string;
}

const templates = ["business", "portfolio", "ecommerce", "blog", "landing", "restaurant", "creative"];
const industries = ["technology", "healthcare", "finance", "education", "retail", "realestate", "hospitality", "other"];

export default function SiteMakerPage() {
  const [projects, setProjects] = useState<SiteProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("business");
  const [industry, setIndustry] = useState("technology");
  const [customDomain, setCustomDomain] = useState("");
  const [publishing, setPublishing] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/site-maker`, { headers });
      const data = await res.json();
      setProjects(data.projects || data.sites || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/site-maker`, {
        method: "POST", headers,
        body: JSON.stringify({ name: name.trim(), template, industry }),
      });
      setName(""); setTemplate("business"); setIndustry("technology");
      setShowForm(false);
      await fetchProjects();
    } catch {}
  };

  const publish = async (id: string) => {
    setPublishing(id);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/site-maker/${id}/publish`, {
        method: "POST", headers,
        body: customDomain ? JSON.stringify({ customDomain: customDomain.trim() }) : undefined,
      });
      setCustomDomain("");
      await fetchProjects();
    } catch {} finally { setPublishing(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Site Maker</h1>
          <p className="text-gray-500">Build and publish beautiful websites</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Project</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full card p-12 text-center">
              <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
              <p className="text-gray-500 mb-6">Create your first site project</p>
              <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Project</button>
            </div>
          ) : projects.map(project => (
            <div key={project.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{project.name}</h3>
                <span className={`badge ${project.status === "published" ? "badge-success" : "badge-warning"} text-xs`}>{project.status}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Palette className="w-3 h-3" /> {project.template}
                <FileText className="w-3 h-3 ml-2" /> {project.industry}
              </div>
              {project.publishedUrl && (
                <a href={project.publishedUrl} target="_blank" className="text-sm text-brand-600 flex items-center gap-1 mb-3 hover:underline">
                  <ExternalLink className="w-3 h-3" /> {project.publishedUrl}
                </a>
              )}
              {project.status !== "published" && (
                <div className="space-y-2">
                  <input value={customDomain} onChange={e => setCustomDomain(e.target.value)} className="input-field text-sm" placeholder="Custom domain (optional)" />
                  <button onClick={() => publish(project.id)} disabled={publishing === project.id} className="btn-primary w-full text-sm">
                    {publishing === project.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {publishing === project.id ? "Publishing..." : "Publish"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg"><Monitor className="w-5 h-5 inline mr-2" />New Site Project</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createProject}>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-field mb-3" required />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-sm font-medium mb-1">Template</label><select value={template} onChange={e => setTemplate(e.target.value)} className="input-field">{templates.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">Industry</label><select value={industry} onChange={e => setIndustry(e.target.value)} className="input-field">{industries.map(i => <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}</select></div>
              </div>
              <button type="submit" className="btn-primary w-full">Create Project</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
