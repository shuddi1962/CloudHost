"use client";

import { useEffect, useState } from "react";
import {
  Shield, ShieldCheck, Plus, FileText, Calendar, DollarSign,
  Building, Users, ClipboardList, Check, ChevronDown, ChevronRight, X, AlertTriangle, Clock
} from "lucide-react";

interface InsurancePlan {
  id: string; name: string; coverage: number; premium: number; features: string[]; popular?: boolean;
}

interface Policy {
  id: string; plan: string; policyNumber: string; coverage: number; premium: number;
  industry: string; companySize: string; status: string; createdAt: string;
}

interface Claim {
  id: string; type: string; description: string; amount: number; status: string; incidentDate: string; createdAt: string;
}

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/business-tools/insurance`;

const plans: InsurancePlan[] = [
  { id: "basic", name: "Basic", coverage: 500000, premium: 99, features: ["Data breach response", "Legal consultation", "Public relations support", "$500K coverage"], popular: false },
  { id: "pro", name: "Pro", coverage: 2000000, premium: 249, features: ["Everything in Basic", "Ransomware coverage", "Business interruption", "Regulatory fines", "$2M coverage"], popular: true },
  { id: "enterprise", name: "Enterprise", coverage: 5000000, premium: 599, features: ["Everything in Pro", "Cyber extortion", "Network damage", "Third-party liability", "$5M coverage", "Dedicated claims manager"], popular: false },
];

export default function CyberInsurancePage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<{ [policyId: string]: Claim[] }>({});
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"policies" | "claims">("policies");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [applyForm, setApplyForm] = useState({ industry: "", companySize: "", insuredAssets: [] as string[] });
  const [claimForm, setClaimForm] = useState({ type: "data-breach", description: "", amount: "", incidentDate: "" });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchPolicies = async () => {
    try {
      const res = await fetch(API, { headers });
      if (res.ok) { const d = await res.json(); setPolicies(d.policies || []); }
    } catch (e) { console.error("Failed to fetch policies"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const fetchClaims = async (policyId: string) => {
    try {
      const res = await fetch(`${API}/${policyId}/claims`, { headers });
      if (res.ok) { const d = await res.json(); setClaims(prev => ({ ...prev, [policyId]: d.claims || [] })); }
    } catch (e) { console.error("Failed to fetch claims"); }
  };

  const applyInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(API, {
      method: "POST", headers,
      body: JSON.stringify({ plan: selectedPlan, ...applyForm }),
    });
    if (res.ok) { const d = await res.json(); setPolicies([d.policy, ...policies]); setShowApplyForm(false); }
  };

  const fileClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showClaimForm) return;
    const res = await fetch(`${API}/${showClaimForm}/claims`, {
      method: "POST", headers,
      body: JSON.stringify({ ...claimForm, amount: parseFloat(claimForm.amount) }),
    });
    if (res.ok) {
      const d = await res.json();
      setClaims(prev => ({ ...prev, [showClaimForm]: [d.claim, ...(prev[showClaimForm] || [])] }));
      setShowClaimForm(null);
    }
  };

  const toggleAsset = (asset: string) => {
    setApplyForm(prev => ({
      ...prev,
      insuredAssets: prev.insuredAssets.includes(asset) ? prev.insuredAssets.filter(a => a !== asset) : [...prev.insuredAssets, asset],
    }));
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { active: "badge-success", pending: "badge-warning", expired: "badge-error", approved: "badge-success", rejected: "badge-error" };
    return <span className={`badge ${map[status] || "badge-info"}`}>{status}</span>;
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cyber Insurance</h1>
          <p className="text-gray-500">Protect your business from cyber threats with comprehensive coverage</p>
        </div>
        <button onClick={() => setShowApplyForm(!showApplyForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Apply Now
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan.id} className={`card p-6 relative cursor-pointer transition-all ${selectedPlan === plan.id ? "ring-2 ring-brand-500" : "hover:shadow-md"} ${plan.popular ? "ring-2 ring-brand-500" : ""}`}
            onClick={() => setSelectedPlan(plan.id)}>
            {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-medium px-3 py-1 rounded-full">Popular</span>}
            <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
            <p className="text-3xl font-bold mb-1">${plan.coverage.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mb-4">coverage at <span className="font-medium">${plan.premium}/mo</span></p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0" /> {f}</li>
              ))}
            </ul>
            <button className="btn-primary w-full" onClick={() => { setSelectedPlan(plan.id); setShowApplyForm(true); }}>Choose {plan.name}</button>
          </div>
        ))}
      </div>

      {showApplyForm && (
        <form onSubmit={applyInsurance} className="card p-6 space-y-4">
          <h3 className="font-semibold">Apply for {plans.find(p => p.id === selectedPlan)?.name} Insurance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <select value={applyForm.industry} onChange={e => setApplyForm({ ...applyForm, industry: e.target.value })} className="input-field" required>
                <option value="">Select industry...</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="ecommerce">E-commerce</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Size</label>
              <select value={applyForm.companySize} onChange={e => setApplyForm({ ...applyForm, companySize: e.target.value })} className="input-field" required>
                <option value="">Select size...</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-1000">201-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Insured Assets</p>
            <div className="flex flex-wrap gap-3">
              {[
                "Customer data", "Financial records", "Intellectual property",
                "Employee data", "IT infrastructure", "Cloud services",
                "Third-party integrations", "Backup systems",
              ].map(a => (
                <label key={a} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={applyForm.insuredAssets.includes(a)} onChange={() => toggleAsset(a)} className="w-4 h-4 rounded border-gray-300" />
                  {a}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary"><Shield className="w-4 h-4" /> Submit Application</button>
            <button type="button" onClick={() => setShowApplyForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab("policies")}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${activeTab === "policies" ? "bg-brand-100 text-brand-700" : "text-gray-500 hover:text-gray-700"}`}>
              Active Policies
            </button>
            <button onClick={() => setActiveTab("claims")}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${activeTab === "claims" ? "bg-brand-100 text-brand-700" : "text-gray-500 hover:text-gray-700"}`}>
              Claims
            </button>
          </div>
        </div>

        {activeTab === "policies" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Policy #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Coverage</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Premium</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Industry</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {policies.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No active policies</p>
                    <p className="text-xs mt-1">Apply for insurance to protect your business</p>
                  </td></tr>
                ) : policies.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{p.policyNumber}</td>
                    <td className="px-4 py-3"><span className="badge badge-info">{p.plan}</span></td>
                    <td className="px-4 py-3 font-medium">${p.coverage.toLocaleString()}</td>
                    <td className="px-4 py-3">${p.premium}/mo</td>
                    <td className="px-4 py-3 text-gray-500">{p.industry}</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setShowClaimForm(p.id); fetchClaims(p.id); }}
                        className="btn-secondary text-xs px-2 py-1">
                        <FileText className="w-3 h-3" /> File Claim
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            {Object.keys(claims).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No claims filed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(claims).map(([policyId, policyClaims]) => (
                  <div key={policyId}>
                    <p className="text-sm font-medium mb-2 text-gray-500">Policy: {policyId}</p>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Type</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Description</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Amount</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Incident Date</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {policyClaims.map(c => (
                          <tr key={c.id}>
                            <td className="px-4 py-2"><span className="badge badge-info">{c.type}</span></td>
                            <td className="px-4 py-2 text-gray-600 max-w-[200px] truncate">{c.description}</td>
                            <td className="px-4 py-2 font-medium">${c.amount.toLocaleString()}</td>
                            <td className="px-4 py-2 text-gray-500">{new Date(c.incidentDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2">{statusBadge(c.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showClaimForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowClaimForm(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">File a Claim</h3>
              <button onClick={() => setShowClaimForm(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={fileClaim} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Claim Type</label>
                <select value={claimForm.type} onChange={e => setClaimForm({ ...claimForm, type: e.target.value })} className="input-field">
                  <option value="data-breach">Data Breach</option>
                  <option value="ransomware">Ransomware</option>
                  <option value="business-interruption">Business Interruption</option>
                  <option value="cyber-extortion">Cyber Extortion</option>
                  <option value="network-damage">Network Damage</option>
                  <option value="third-party-liability">Third-Party Liability</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={claimForm.description} onChange={e => setClaimForm({ ...claimForm, description: e.target.value })} className="input-field" rows={3} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount ($)</label>
                  <input type="number" value={claimForm.amount} onChange={e => setClaimForm({ ...claimForm, amount: e.target.value })} className="input-field" min="0" step="0.01" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Incident Date</label>
                  <input type="date" value={claimForm.incidentDate} onChange={e => setClaimForm({ ...claimForm, incidentDate: e.target.value })} className="input-field" required />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full"><FileText className="w-4 h-4" /> Submit Claim</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
