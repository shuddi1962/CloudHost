"use client";

import { useEffect, useState } from "react";
import { Image, Plus, Palette, X, RefreshCw } from "lucide-react";

interface LogoProject {
  id: string;
  brandName: string;
  industry: string;
  style: string;
  colors: string[];
  previewUrl?: string;
  variants?: string[];
}

const styles = ["minimal", "modern", "classic", "playful", "vintage", "abstract", "mascot"];
const colorOptions = ["#2563EB", "#DC2626", "#059669", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#4F46E5"];

export default function LogoMakerPage() {
  const [projects, setProjects] = useState<LogoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [style, setStyle] = useState("minimal");
  const [colors, setColors] = useState<string[]>(["#2563EB"]);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/logo-maker`, { headers });
      const data = await res.json();
      setProjects(data.projects || data.logos || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const toggleColor = (c: string) => {
    setColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/logo-maker`, {
        method: "POST", headers,
        body: JSON.stringify({ brandName: brandName.trim(), industry, style, colors }),
      });
      const data = await res.json();
      setPreview(data.logo || data);
      await fetchProjects();
      setShowForm(false);
    } catch {} finally { setGenerating(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Logo Maker</h1>
          <p className="text-gray-500">Create professional logos for your brand</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Logo</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full card p-12 text-center">
              <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Logos Yet</h3>
              <p className="text-gray-500 mb-6">Create your first logo design</p>
              <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Logo</button>
            </div>
          ) : projects.map(p => (
            <div key={p.id} className="card p-5">
              <div className="bg-gray-50 rounded-lg h-32 flex items-center justify-center mb-3">
                {p.previewUrl ? (
                  <img src={p.previewUrl} alt={p.brandName} className="max-h-24 object-contain" />
                ) : (
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: p.colors?.[0] || "#2563EB" }}>{p.brandName?.charAt(0)}</p>
                    <p className="text-xs text-gray-400">Preview</p>
                  </div>
                )}
              </div>
              <h3 className="font-semibold">{p.brandName}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span className="badge badge-info">{p.style}</span>
                {p.industry && <span>{p.industry}</span>}
              </div>
              {p.colors && (
                <div className="flex gap-1 mt-2">{p.colors.map((c, i) => <div key={i} className="w-4 h-4 rounded-full border" style={{ backgroundColor: c }} />)}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg"><Image className="w-5 h-5 inline mr-2" />Create Logo</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={generate}>
              <label className="block text-sm font-medium mb-1">Brand Name</label>
              <input value={brandName} onChange={e => setBrandName(e.target.value)} className="input-field mb-3" required />
              <label className="block text-sm font-medium mb-1">Industry (optional)</label>
              <input value={industry} onChange={e => setIndustry(e.target.value)} className="input-field mb-3" placeholder="e.g. technology, healthcare" />
              <label className="block text-sm font-medium mb-1">Style</label>
              <select value={style} onChange={e => setStyle(e.target.value)} className="input-field mb-3">
                {styles.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <label className="block text-sm font-medium mb-2">Colors</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {colorOptions.map(c => (
                  <button key={c} type="button" onClick={() => toggleColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${colors.includes(c) ? "border-gray-900 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                ))}
              </div>
              <button type="submit" disabled={generating} className="btn-primary w-full">
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                {generating ? "Generating..." : "Generate Logo"}
              </button>
            </form>
          </div>
        </div>
      )}

      {preview && !showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl text-center" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Logo Preview</h3>
            <div className="bg-gray-50 rounded-xl p-8 mb-4">
              {preview.previewUrl ? <img src={preview.previewUrl} alt="Logo" className="max-h-48 mx-auto" /> : <p className="text-6xl font-bold" style={{ color: colors[0] || "#2563EB" }}>{brandName?.charAt(0) || "L"}</p>}
            </div>
            {preview.variants?.length > 0 && (
              <div className="flex gap-2 justify-center mb-4">
                {preview.variants.map((v: string, i: number) => (
                  <button key={i} className="btn-secondary text-sm">{v}</button>
                ))}
              </div>
            )}
            <button onClick={() => setPreview(null)} className="btn-primary">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
