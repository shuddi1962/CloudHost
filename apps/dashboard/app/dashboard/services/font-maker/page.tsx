"use client";

import { useEffect, useState } from "react";
import { Type, Plus, X, RefreshCw } from "lucide-react";

interface FontProject {
  id: string;
  name: string;
  style: string;
  formats: string[];
  previewUrl?: string;
  previewText?: string;
}

const styles = ["sans-serif", "serif", "display", "handwriting", "monospace", "script"];

export default function FontMakerPage() {
  const [projects, setProjects] = useState<FontProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [style, setStyle] = useState("sans-serif");
  const [generating, setGenerating] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/font-maker`, { headers });
      const data = await res.json();
      setProjects(data.projects || data.fonts || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const createFont = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setGenerating(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/font-maker`, {
        method: "POST", headers,
        body: JSON.stringify({ name: name.trim(), style }),
      });
      setName(""); setStyle("sans-serif");
      setShowForm(false);
      await fetchProjects();
    } catch {} finally { setGenerating(false); }
  };

  const fontFamily = (style: string) => {
    const map: Record<string, string> = { "sans-serif": "sans-serif", serif: "serif", display: "Impact, fantasy", handwriting: "cursive", monospace: "monospace", script: "cursive" };
    return map[style] || "sans-serif";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Font Maker</h1>
          <p className="text-gray-500">Design and generate custom fonts</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Font</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full card p-12 text-center">
              <Type className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Fonts Yet</h3>
              <p className="text-gray-500 mb-6">Create your first custom font</p>
              <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Font</button>
            </div>
          ) : projects.map(p => (
            <div key={p.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{p.name}</h3>
                <span className="badge badge-info text-xs">{p.style}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="text-xl" style={{ fontFamily: fontFamily(p.style) }}>{p.previewText || "The quick brown fox jumps over the lazy dog"}</p>
              </div>
              {p.formats?.length > 0 && (
                <div className="flex flex-wrap gap-1 text-xs text-gray-500">{p.formats.map(f => <span key={f} className="badge badge-info">{f}</span>)}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg"><Type className="w-5 h-5 inline mr-2" />Create Font</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createFont}>
              <label className="block text-sm font-medium mb-1">Font Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-field mb-3" placeholder="e.g. Cloud Sans" required />
              <label className="block text-sm font-medium mb-1">Style</label>
              <select value={style} onChange={e => setStyle(e.target.value)} className="input-field mb-4">
                {styles.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <button type="submit" disabled={generating} className="btn-primary w-full">
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />}
                {generating ? "Generating..." : "Generate Font"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
