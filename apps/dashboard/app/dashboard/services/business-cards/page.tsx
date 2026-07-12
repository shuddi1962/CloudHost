"use client";

import { useEffect, useState } from "react";
import { CreditCard, Plus, X, RefreshCw } from "lucide-react";

interface CardProject {
  id: string;
  name: string;
  format: string;
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
  previewUrl?: string;
}

export default function BusinessCardsPage() {
  const [projects, setProjects] = useState<CardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563EB");
  const [secondaryColor, setSecondaryColor] = useState("#FFFFFF");
  const [font, setFont] = useState("Inter");
  const [format, setFormat] = useState("digital");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/business-cards`, { headers });
      const data = await res.json();
      setProjects(data.projects || data.cards || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const createCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/business-cards`, {
        method: "POST", headers,
        body: JSON.stringify({ name: name.trim(), primaryColor, secondaryColor, font, format }),
      });
      const data = await res.json();
      setPreview(data.card || data);
      await fetchProjects();
      setShowForm(false);
    } catch {} finally { setGenerating(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Card Maker</h1>
          <p className="text-gray-500">Design professional business cards</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Card</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full card p-12 text-center">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Cards Yet</h3>
              <p className="text-gray-500 mb-6">Create your first business card design</p>
              <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Card</button>
            </div>
          ) : projects.map(p => (
            <div key={p.id} className="card p-5">
              <div className="bg-gray-50 rounded-lg h-40 flex items-center justify-center mb-3">
                {p.previewUrl ? (
                  <img src={p.previewUrl} alt={p.name} className="max-h-32 object-contain" />
                ) : (
                  <div className="w-64 h-36 rounded-lg shadow-sm flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${p.primaryColor || "#2563EB"} 0%, ${p.secondaryColor || "#FFFFFF"} 100%)` }}>
                    <p className="text-white font-bold text-lg drop-shadow-lg">{p.name}</p>
                  </div>
                )}
              </div>
              <h3 className="font-semibold">{p.name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span className="badge badge-info">{p.format}</span>
                {p.font && <span>{p.font}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg"><CreditCard className="w-5 h-5 inline mr-2" />Create Business Card</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createCard}>
              <label className="block text-sm font-medium mb-1">Card Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-field mb-3" placeholder="e.g. My Business Card" required />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                    <span className="text-xs text-gray-500">{primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                    <span className="text-xs text-gray-500">{secondaryColor}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Font</label>
                  <select value={font} onChange={e => setFont(e.target.value)} className="input-field">
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Format</label>
                  <select value={format} onChange={e => setFormat(e.target.value)} className="input-field">
                    <option value="digital">Digital</option>
                    <option value="print">Print</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={generating} className="btn-primary w-full">
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {generating ? "Generating..." : "Create Card"}
              </button>
            </form>
          </div>
        </div>
      )}

      {preview && !showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl text-center" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Card Preview</h3>
            <div className="bg-gray-50 rounded-xl p-8 mb-4 flex items-center justify-center">
              {preview.previewUrl ? (
                <img src={preview.previewUrl} alt="Card" className="max-h-48 object-contain" />
              ) : (
                <div className="w-72 h-40 rounded-lg shadow-md flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
                  <p className="text-white font-bold text-xl drop-shadow-lg">{name || "Business Card"}</p>
                </div>
              )}
            </div>
            <button onClick={() => setPreview(null)} className="btn-primary">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
