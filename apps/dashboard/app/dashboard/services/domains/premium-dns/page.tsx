"use client";

import { useEffect, useState } from "react";
import { Shield, Zap, BarChart3, Globe, X, Check, ChevronRight } from "lucide-react";

const plans = [
  { value: "basic", label: "Basic", price: "$5.99/mo", features: ["DNSSEC", "100 queries/sec"] },
  { value: "pro", label: "Pro", price: "$14.99/mo", features: ["DNSSEC", "DDoS Protection", "Analytics", "1000 queries/sec"] },
  { value: "business", label: "Business", price: "$39.99/mo", features: ["DNSSEC", "DDoS Protection", "Analytics", "GeoDNS", "Template Management", "10000 queries/sec"] },
];

export default function PremiumDnsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [domain, setDomain] = useState("");
  const [plan, setPlan] = useState("basic");
  const [dnssec, setDnssec] = useState(true);
  const [ddos, setDdos] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [geoDns, setGeoDns] = useState(false);
  const [templates, setTemplates] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/domain-services/premium-dns", { headers });
      const data = await res.json();
      setSubscriptions(data.premiumDns || []);
    } catch (e) {
      console.error("Failed to fetch premium DNS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscriptions(); }, []);

  useEffect(() => {
    setDnssec(plan === "basic" || plan === "pro" || plan === "business");
    setDdos(plan === "pro" || plan === "business");
    setAnalytics(plan === "pro" || plan === "business");
    setGeoDns(plan === "business");
    setTemplates(plan === "business");
  }, [plan]);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceMap = { basic: 5.99, pro: 14.99, business: 39.99 };
    const res = await fetch("http://localhost:3001/api/domain-services/premium-dns", {
      method: "POST", headers,
      body: JSON.stringify({ domain, plan, dnssec, ddosProtection: ddos, analytics, geoDns, templateManagement: templates, price: priceMap[plan as keyof typeof priceMap] }),
    });
    if (res.ok) {
      const data = await res.json();
      setSubscriptions([data.premiumDns, ...subscriptions]);
      setDomain(""); setPlan("basic"); setShowForm(false);
    }
  };

  const cancel = async (id: string) => {
    const res = await fetch(`http://localhost:3001/api/domain-services/premium-dns/${id}`, {
      method: "DELETE", headers,
    });
    if (res.ok) {
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Premium DNS</h1>
          <p className="text-gray-500">Enterprise DNS with DNSSEC, DDoS protection, and advanced analytics</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Zap className="w-4 h-4" /> Subscribe
        </button>
      </div>

      {showForm && (
        <form onSubmit={subscribe} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domain Name</label>
              <input value={domain} onChange={e => setDomain(e.target.value)} className="input-field" placeholder="example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plan</label>
              <select value={plan} onChange={e => setPlan(e.target.value)} className="input-field">
                {plans.map(p => <option key={p.value} value={p.value}>{p.label} — {p.price}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Features</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: "dnssec", label: "DNSSEC", icon: Shield, checked: dnssec, set: setDnssec },
                { key: "ddos", label: "DDoS Protection", icon: Shield, checked: ddos, set: setDdos },
                { key: "analytics", label: "Analytics", icon: BarChart3, checked: analytics, set: setAnalytics },
                { key: "geoDns", label: "GeoDNS", icon: Globe, checked: geoDns, set: setGeoDns },
                { key: "templates", label: "Template Management", icon: ChevronRight, checked: templates, set: setTemplates },
              ].map((f) => (
                <label key={f.key} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${f.checked ? "border-brand-200 bg-brand-50" : "border-gray-200 bg-gray-50"}`}>
                  <input type="checkbox" checked={f.checked} onChange={e => f.set(e.target.checked)} className="rounded border-gray-300" />
                  <f.icon className="w-4 h-4 text-brand-600" />
                  <span className="text-sm">{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary">Subscribe — {plans.find(p => p.value === plan)?.price}</button>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Subscriptions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">DNSSEC</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">DDoS</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Analytics</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">GeoDNS</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Expires</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No premium DNS subscriptions</p>
                    <p className="text-xs mt-1">Subscribe to protect your domains with enterprise DNS</p>
                  </td>
                </tr>
              ) : subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.domain}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${s.plan === "business" ? "badge-error" : s.plan === "pro" ? "badge-warning" : "badge-info"}`}>
                      {s.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">{s.dnssec ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />}</td>
                  <td className="px-4 py-3">{s.ddosProtection ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />}</td>
                  <td className="px-4 py-3">{s.analytics ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />}</td>
                  <td className="px-4 py-3">{s.geoDns ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${s.status === "active" || !s.status ? "badge-success" : "badge-error"}`}>{s.status || "active"}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(s.expiresAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => cancel(s.id)} className="btn-secondary text-xs text-red-600 hover:bg-red-50">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
