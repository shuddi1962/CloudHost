"use client";

import { useEffect, useState } from "react";
import {
  Shield, ShieldCheck, Plus, Globe, MapPin, Key, Wifi, WifiOff,
  Check, ChevronDown, Copy, Monitor, Smartphone, Layers, Server, Zap
} from "lucide-react";

interface VpnPlan {
  id: string; name: string; price: number; features: string[]; popular?: boolean;
}

interface Location {
  id: string; name: string; country: string; flag: string;
}

interface VpnSubscription {
  id: string; plan: string; protocol: string; killSwitch: boolean; splitTunneling: boolean;
  locationId: string; assignedIp: string; server: string; port: number; publicKey: string;
  configPreview: string; status: string; createdAt: string;
}

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/business-tools/vpn`;

export default function VpnPage() {
  const [plans, setPlans] = useState<VpnPlan[]>([
    { id: "basic", name: "Basic", price: 4.99, features: ["1 device", "5 locations", "10 Gbps speed", "No logs policy"] },
    { id: "pro", name: "Pro", price: 9.99, features: ["5 devices", "15 locations", "20 Gbps speed", "No logs policy", "Kill switch", "Split tunneling"], popular: true },
    { id: "business", name: "Business", price: 19.99, features: ["Unlimited devices", "All locations", "40 Gbps speed", "No logs policy", "Kill switch", "Split tunneling", "Dedicated IP", "24/7 support"] },
  ]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [subscriptions, setSubscriptions] = useState<VpnSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ protocol: "wireguard", killSwitch: true, splitTunneling: false, locationId: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [subRes, locRes] = await Promise.all([
        fetch(API, { headers }),
        fetch(`${API}/locations`, { headers }),
      ]);
      if (subRes.ok) { const d = await subRes.json(); setSubscriptions(d.subscriptions || []); }
      if (locRes.ok) { const d = await locRes.json(); setLocations(d.locations || []); }
    } catch (e) { console.error("Failed to fetch VPN data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(API, {
      method: "POST", headers,
      body: JSON.stringify({ plan: selectedPlan, ...form }),
    });
    if (res.ok) { const d = await res.json(); setSubscriptions([d.subscription, ...subscriptions]); setShowForm(false); }
  };

  const connectVpn = async (id: string) => {
    const res = await fetch(`${API}/${id}/connect`, { method: "POST", headers });
    if (res.ok) setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, status: "connected" } : s));
  };

  const disconnectVpn = async (id: string) => {
    const res = await fetch(`${API}/${id}/disconnect`, { method: "POST", headers });
    if (res.ok) setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, status: "disconnected" } : s));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">FastVPN</h1>
          <p className="text-gray-500">Secure, high-speed VPN with WireGuard protocol</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Subscribe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan.id} className={`card p-6 relative cursor-pointer transition-all ${selectedPlan === plan.id ? "ring-2 ring-brand-500" : "hover:shadow-md"} ${plan.popular ? "ring-2 ring-brand-500" : ""}`}
            onClick={() => setSelectedPlan(plan.id)}>
            {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-medium px-3 py-1 rounded-full">Popular</span>}
            <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
            <p className="text-3xl font-bold mb-4">${plan.price}<span className="text-sm text-gray-400 font-normal">/mo</span></p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={subscribe} className="card p-6 space-y-4">
          <h3 className="font-semibold">Subscribe to {plans.find(p => p.id === selectedPlan)?.name} Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Protocol</label>
              <select value={form.protocol} onChange={e => setForm({ ...form, protocol: e.target.value })} className="input-field">
                <option value="wireguard">WireGuard</option>
                <option value="openvpn">OpenVPN</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <select value={form.locationId} onChange={e => setForm({ ...form, locationId: e.target.value })} className="input-field" required>
                <option value="">Select location...</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.flag} {l.name} ({l.country})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.killSwitch} onChange={e => setForm({ ...form, killSwitch: e.target.checked })} className="w-4 h-4 rounded border-gray-300" />
              Kill Switch
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.splitTunneling} onChange={e => setForm({ ...form, splitTunneling: e.target.checked })} className="w-4 h-4 rounded border-gray-300" />
              Split Tunneling
            </label>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary"><Shield className="w-4 h-4" /> Subscribe Now</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {subscriptions.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No active subscriptions</p>
            <p className="text-xs mt-1">Subscribe to a plan above to get started</p>
          </div>
        ) : subscriptions.map(sub => (
          <div key={sub.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold">{sub.plan} VPN</h3>
                <p className="text-sm text-gray-500">
                  <MapPin className="w-3 h-3 inline" /> {sub.server} | <Shield className="w-3 h-3 inline" /> {sub.protocol}
                </p>
              </div>
              <span className={`badge ${sub.status === "connected" ? "badge-success" : "badge-error"}`}>{sub.status}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Assigned IP</p>
                <p className="font-mono text-sm font-medium">{sub.assignedIp}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Server</p>
                <p className="font-mono text-sm font-medium">{sub.server}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Port</p>
                <p className="font-mono text-sm font-medium">{sub.port}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Public Key</p>
                <p className="font-mono text-xs font-medium truncate">{sub.publicKey}</p>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              {sub.status === "disconnected" ? (
                <button onClick={() => connectVpn(sub.id)} className="btn-primary text-xs">
                  <Wifi className="w-3 h-3" /> Connect
                </button>
              ) : (
                <button onClick={() => disconnectVpn(sub.id)} className="btn-secondary text-xs text-red-600">
                  <WifiOff className="w-3 h-3" /> Disconnect
                </button>
              )}
            </div>
            {sub.configPreview && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">WireGuard Config</p>
                  <button onClick={() => copyToClipboard(sub.configPreview, sub.id)} className="btn-secondary text-xs px-2 py-1">
                    {copiedId === sub.id ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto font-mono select-all whitespace-pre-wrap">{sub.configPreview}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
