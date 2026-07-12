"use client";

import { useEffect, useState } from "react";
import { Package, Plus, X, RefreshCw, CheckCircle, Globe, Mail, Server, FileText, Building2 } from "lucide-react";

interface KitProject {
  id: string;
  businessName: string;
  businessType: string;
  kitType: string;
  llcStatus: string;
  einStatus: string;
  createdAt: string;
  includedServices: string[];
}

const kitTypes = ["basic", "pro", "enterprise"];
const kitPricing: Record<string, string> = { basic: "$99", pro: "$199", enterprise: "$499" };

export default function StarterKitPage() {
  const [projects, setProjects] = useState<KitProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [kitType, setKitType] = useState("basic");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("llc");
  const [llcState, setLlcState] = useState("de");
  const [applying, setApplying] = useState(false);
  const [selectedProject, setSelectedProject] = useState<KitProject | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/starter-kit`, { headers });
      const data = await res.json();
      setProjects(data.projects || data.kits || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const createKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    setApplying(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/starter-kit`, {
        method: "POST", headers,
        body: JSON.stringify({ businessName: businessName.trim(), businessType, kitType, llcState }),
      });
      setBusinessName(""); setKitType("basic"); setBusinessType("llc"); setLlcState("de");
      setShowForm(false);
      await fetchProjects();
    } catch {} finally { setApplying(false); }
  };

  const applyLlc = async (id: string) => {
    setApplying(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/starter-kit/${id}/apply-llc`, {
        method: "POST", headers,
      });
      await fetchProjects();
    } catch {} finally { setApplying(false); }
  };

  const statusBadge = (status: string) => {
    if (status === "completed") return "badge-success";
    if (status === "processing" || status === "pending") return "badge-warning";
    return "badge-error";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Starter Kit</h1>
          <p className="text-gray-500">Launch your business with LLC formation, EIN, and essential services</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Application</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-gray-500 mb-6">Start your business with a starter kit</p>
              <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Get Started</button>
            </div>
          ) : projects.map(p => (
            <div key={p.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{p.businessName}</h3>
                  <p className="text-xs text-gray-500 capitalize">{p.businessType} | {p.kitType} kit</p>
                </div>
                <span className={`badge ${p.kitType === "enterprise" ? "badge-error" : p.kitType === "pro" ? "badge-warning" : "badge-success"} text-xs`}>{p.kitType}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Building2 className="w-3 h-3" /> LLC Status</p>
                  <span className={`badge ${statusBadge(p.llcStatus)} text-xs`}>{p.llcStatus || "Not started"}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> EIN Status</p>
                  <span className={`badge ${statusBadge(p.einStatus)} text-xs`}>{p.einStatus || "Not started"}</span>
                </div>
              </div>
              {p.includedServices?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.includedServices.map((s, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                      {s.includes("domain") && <Globe className="w-3 h-3" />}
                      {s.includes("email") && <Mail className="w-3 h-3" />}
                      {s.includes("host") && <Server className="w-3 h-3" />}
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {p.llcStatus !== "completed" && (
                <button onClick={() => applyLlc(p.id)} disabled={applying} className="btn-primary text-sm">
                  {applying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Apply for LLC & EIN
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg"><Package className="w-5 h-5 inline mr-2" />New Application</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createKit}>
              <div className="flex gap-2 mb-4">
                {kitTypes.map(kt => (
                  <button key={kt} type="button" onClick={() => setKitType(kt)} className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${kitType === kt ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <p className="font-semibold capitalize text-sm">{kt}</p>
                    <p className="text-xs text-gray-500">{kitPricing[kt]}</p>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Business Name</label>
                  <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Business Type</label>
                  <select value={businessType} onChange={e => setBusinessType(e.target.value)} className="input-field">
                    <option value="llc">LLC</option>
                    <option value="corporation">Corporation</option>
                    <option value="nonprofit">Nonprofit</option>
                    <option value="sole-proprietorship">Sole Proprietorship</option>
                  </select>
                </div>
              </div>
              <label className="block text-sm font-medium mb-1">LLC Formation State</label>
              <select value={llcState} onChange={e => setLlcState(e.target.value)} className="input-field mb-4">
                <option value="de">Delaware</option>
                <option value="wy">Wyoming</option>
                <option value="nv">Nevada</option>
                <option value="ca">California</option>
                <option value="ny">New York</option>
                <option value="tx">Texas</option>
                <option value="fl">Florida</option>
              </select>
              <button type="submit" disabled={applying} className="btn-primary w-full">
                {applying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                {applying ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
