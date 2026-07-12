"use client";

import { useEffect, useState } from "react";
import {
  Shield, ShieldCheck, Plus, Trash2, MailWarning, CheckCircle,
  Mail, Clock, RefreshCw, X, List, Ban, Inbox, AlertTriangle
} from "lucide-react";

interface Protection {
  id: string; domain: string; dkim: boolean; spf: boolean; dmarc: boolean;
  quarantineSpam: boolean; blockMalware: boolean;
  emailsBlocked: number; emailsQuarantined: number; emailsAllowed: number; spamScore: number;
  whitelist: string[]; blacklist: string[]; status: string;
}

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/business-tools/anti-spam`;

export default function AntiSpamPage() {
  const [protections, setProtections] = useState<Protection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    domain: "", dkim: true, spf: true, dmarc: false, quarantineSpam: true, blockMalware: true,
  });
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchProtections = async () => {
    try {
      const res = await fetch(API, { headers });
      if (res.ok) { const d = await res.json(); setProtections(d.protections || []); }
    } catch (e) { console.error("Failed to fetch protections"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProtections(); }, []);

  const enableProtection = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(API, {
      method: "POST", headers,
      body: JSON.stringify(form),
    });
    if (res.ok) { const d = await res.json(); setProtections([d.protection, ...protections]); setShowForm(false); }
  };

  const checkNow = async (id: string) => {
    setCheckingId(id);
    try {
      const res = await fetch(`${API}/${id}/check`, { method: "POST", headers });
      if (res.ok) {
        const d = await res.json();
        setProtections(protections.map(p => p.id === id ? { ...p, ...d.protection } : p));
      }
    } catch (e) { console.error("Check failed"); }
    finally { setCheckingId(null); }
  };

  const toggleFormField = (key: keyof typeof form) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Anti-Spam Protection</h1>
          <p className="text-gray-500">Protect your domains from spam, phishing, and malware</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Enable Protection
        </button>
      </div>

      {showForm && (
        <form onSubmit={enableProtection} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Domain</label>
            <input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} className="input-field" placeholder="example.com" required />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Authentication Protocols</p>
            <div className="flex flex-wrap gap-4">
              {[
                { key: "dkim" as const, label: "DKIM Signing", desc: "Digitally sign outgoing emails" },
                { key: "spf" as const, label: "SPF Record", desc: "Authorize sending servers" },
                { key: "dmarc" as const, label: "DMARC Policy", desc: "Domain-based authentication" },
              ].map(p => (
                <label key={p.key} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={form[p.key]} onChange={() => toggleFormField(p.key)} className="w-4 h-4 mt-0.5 rounded border-gray-300" />
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Protection Settings</p>
            <div className="flex flex-wrap gap-4">
              {[
                { key: "quarantineSpam" as const, label: "Quarantine Spam", desc: "Move spam to quarantine" },
                { key: "blockMalware" as const, label: "Block Malware", desc: "Block malicious attachments" },
              ].map(p => (
                <label key={p.key} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={form[p.key]} onChange={() => toggleFormField(p.key)} className="w-4 h-4 mt-0.5 rounded border-gray-300" />
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary"><Shield className="w-4 h-4" /> Enable Protection</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {protections.length === 0 ? (
          <div className="card p-12 col-span-full text-center text-gray-400">
            <MailWarning className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No domains protected</p>
            <p className="text-xs mt-1">Enable anti-spam protection for your domains</p>
          </div>
        ) : protections.map(p => (
          <div key={p.id} className="card p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{p.domain}</h3>
                <div className="flex gap-1 mt-1">
                  {p.dkim && <span className="badge badge-success text-xs">DKIM</span>}
                  {p.spf && <span className="badge badge-success text-xs">SPF</span>}
                  {p.dmarc && <span className="badge badge-success text-xs">DMARC</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="p-2 bg-red-50 rounded-lg">
                <Ban className="w-4 h-4 mx-auto mb-1 text-red-500" />
                <p className="text-lg font-bold text-red-600">{p.emailsBlocked}</p>
                <p className="text-xs text-gray-500">Blocked</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Inbox className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold text-yellow-600">{p.emailsQuarantined}</p>
                <p className="text-xs text-gray-500">Quarantined</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 mx-auto mb-1 text-green-500" />
                <p className="text-lg font-bold text-green-600">{p.emailsAllowed}</p>
                <p className="text-xs text-gray-500">Allowed</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-500">Spam Score:</span>
              <span className={`font-bold ${p.spamScore > 70 ? "text-red-600" : p.spamScore > 40 ? "text-yellow-600" : "text-green-600"}`}>{p.spamScore}/100</span>
            </div>
            <div className="flex gap-2 mb-3">
              <button onClick={() => checkNow(p.id)} disabled={checkingId === p.id} className="btn-secondary text-xs flex-1 justify-center">
                {checkingId === p.id ? <><RefreshCw className="w-3 h-3 animate-spin" /> Checking...</> : <><RefreshCw className="w-3 h-3" /> Check Now</>}
              </button>
            </div>
            {(p.whitelist?.length > 0 || p.blacklist?.length > 0) && (
              <div className="border-t border-gray-100 pt-3 space-y-2">
                {p.whitelist?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Whitelist</p>
                    <div className="flex flex-wrap gap-1">
                      {p.whitelist.map((w, i) => <span key={i} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded">{w}</span>)}
                    </div>
                  </div>
                )}
                {p.blacklist?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Ban className="w-3 h-3 text-red-500" /> Blacklist</p>
                    <div className="flex flex-wrap gap-1">
                      {p.blacklist.map((b, i) => <span key={i} className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded">{b}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
