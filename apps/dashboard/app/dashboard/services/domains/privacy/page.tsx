"use client";

import { useEffect, useState } from "react";
import { Shield, ShieldOff, Eye, Trash2, Mail } from "lucide-react";

export default function DomainPrivacyPage() {
  const [privacyList, setPrivacyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [domain, setDomain] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchPrivacy = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/domain-services/privacy", { headers });
      const data = await res.json();
      setPrivacyList(data.privacy || []);
    } catch (e) {
      console.error("Failed to fetch privacy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrivacy(); }, []);

  const enablePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3001/api/domain-services/privacy", {
      method: "POST", headers,
      body: JSON.stringify({ domain, price: 2.88 }),
    });
    if (res.ok) {
      const data = await res.json();
      setPrivacyList([data.privacy, ...privacyList]);
      setDomain(""); setShowForm(false);
    }
  };

  const disablePrivacy = async (id: string) => {
    const res = await fetch(`http://localhost:3001/api/domain-services/privacy/${id}`, {
      method: "DELETE", headers,
    });
    if (res.ok) {
      setPrivacyList(privacyList.filter(p => p.id !== id));
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Domain Privacy</h1>
          <p className="text-gray-500">Protect your personal information from public WHOIS queries</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Shield className="w-4 h-4" /> Enable Privacy
        </button>
      </div>

      {showForm && (
        <form onSubmit={enablePrivacy} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Domain Name</label>
            <input value={domain} onChange={e => setDomain(e.target.value)} className="input-field" placeholder="example.com" required />
            <p className="text-xs text-gray-400 mt-1">WHOIS privacy protection — $2.88/yr per domain</p>
          </div>
          <button type="submit" className="btn-primary">Enable Privacy ($2.88/yr)</button>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Privacy Enabled Domains</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Masked Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Masked Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Expires</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {privacyList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No privacy protection enabled</p>
                    <p className="text-xs mt-1">Enable WHOIS privacy to hide your personal information</p>
                  </td>
                </tr>
              ) : privacyList.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.domain}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs font-mono">
                      <Mail className="w-3 h-3 text-gray-400" /> {p.maskedEmail}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.maskedPhone}</td>
                  <td className="px-4 py-3"><span className="badge badge-info">{p.privacyType}</span></td>
                  <td className="px-4 py-3">
                    <span className="badge badge-success">Active</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(p.expiresAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => disablePrivacy(p.id)} className="btn-secondary text-xs text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" /> Disable
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
