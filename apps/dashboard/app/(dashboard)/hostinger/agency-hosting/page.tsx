"use client";

import { useState, useEffect } from "react";
import {
  Plus, Users, Building2, Award, DollarSign,
  Eye, EyeOff, CheckCircle, XCircle
} from "lucide-react";

interface Agency {
  id: string;
  agencyName: string;
  plan: string;
  maxClients: number;
  clients: number;
  whiteLabel: boolean;
  branding: { logo?: string; primaryColor?: string; customDomain?: string };
  revenueShare: number;
  totalEarned: number;
  status: string;
}

export default function AgencyHostingPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    agencyName: "", plan: "starter", maxClients: "10",
    whiteLabel: false, brandingLogo: "", brandingColor: "#6366f1",
    brandingDomain: "", revenueShare: "10"
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/hostinger-services/agency-hosting", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setAgencies(data.agencies || []))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/hostinger-services/agency-hosting", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        agencyName: form.agencyName,
        plan: form.plan,
        maxClients: parseInt(form.maxClients),
        whiteLabel: form.whiteLabel,
        branding: { logo: form.brandingLogo, primaryColor: form.brandingColor, customDomain: form.brandingDomain },
        revenueShare: parseInt(form.revenueShare),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setAgencies([...agencies, data.agency]);
      setShowForm(false);
      setForm({ agencyName: "", plan: "starter", maxClients: "10", whiteLabel: false, brandingLogo: "", brandingColor: "#6366f1", brandingDomain: "", revenueShare: "10" });
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agency Hosting</h1>
          <p className="text-gray-500">White-label hosting platform for agencies and resellers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Agency
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Agency Name</label>
              <input value={form.agencyName} onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                className="input-field" placeholder="My Agency" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plan</label>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="input-field">
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Clients</label>
              <select value={form.maxClients} onChange={(e) => setForm({ ...form, maxClients: e.target.value })} className="input-field">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Revenue Share (%)</label>
              <input type="number" value={form.revenueShare} onChange={(e) => setForm({ ...form, revenueShare: e.target.value })}
                className="input-field" min="0" max="100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branding Logo URL</label>
              <input value={form.brandingLogo} onChange={(e) => setForm({ ...form, brandingLogo: e.target.value })}
                className="input-field" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Primary Color</label>
              <input type="color" value={form.brandingColor} onChange={(e) => setForm({ ...form, brandingColor: e.target.value })}
                className="input-field h-10" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Custom Domain</label>
              <input value={form.brandingDomain} onChange={(e) => setForm({ ...form, brandingDomain: e.target.value })}
                className="input-field" placeholder="panel.myagency.com" />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.whiteLabel} onChange={(e) => setForm({ ...form, whiteLabel: e.target.checked })} />
                White-label Mode
              </label>
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Agency</button>
        </form>
      )}

      {agencies.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No agencies yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your agency hosting account</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agencies.map((agency) => (
            <div key={agency.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-500" />
                  <h3 className="font-semibold">{agency.agencyName}</h3>
                </div>
                <span className={`badge ${agency.status === "active" ? "badge-success" : "badge-warning"}`}>
                  {agency.status}
                </span>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="badge badge-info">{agency.plan}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{agency.clients} / {agency.maxClients} clients</span>
                </div>
                <div className="flex items-center gap-2">
                  {agency.whiteLabel ? (
                    <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-green-700">White-label enabled</span></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-gray-400" /><span className="text-gray-400">White-label disabled</span></>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span>{agency.revenueShare}% revenue share</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">${agency.totalEarned} earned</span>
                </div>
              </div>
              {agency.branding?.primaryColor && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: agency.branding.primaryColor }} />
                  {agency.branding.customDomain && <span>{agency.branding.customDomain}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
