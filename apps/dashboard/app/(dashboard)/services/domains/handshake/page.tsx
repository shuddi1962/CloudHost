"use client";

import { useEffect, useState } from "react";
import { Globe, Fingerprint, Wallet, ExternalLink, Clock } from "lucide-react";

export default function HandshakePage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [domain, setDomain] = useState("");
  const [years, setYears] = useState(1);
  const [walletAddress, setWalletAddress] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchDomains = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/domain-services/handshake", { headers });
      const data = await res.json();
      setDomains(data.domains || []);
    } catch (e) {
      console.error("Failed to fetch handshake domains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDomains(); }, []);

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3001/api/domain-services/handshake", {
      method: "POST", headers,
      body: JSON.stringify({ domain, registrationPeriod: years, walletAddress, price: years * 15 }),
    });
    if (res.ok) {
      const data = await res.json();
      setDomains([data.domain, ...domains]);
      setDomain(""); setYears(1); setWalletAddress(""); setShowForm(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Handshake Domains</h1>
          <p className="text-gray-500">Decentralized blockchain-based domain names</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Globe className="w-4 h-4" /> Register HNS Domain
        </button>
      </div>

      {showForm && (
        <form onSubmit={register} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domain Name</label>
              <input value={domain} onChange={e => setDomain(e.target.value)} className="input-field" placeholder="example" required />
              <p className="text-xs text-gray-400 mt-1">Enter without TLD (e.g. example for example/)</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Registration Period</label>
              <select value={years} onChange={e => setYears(Number(e.target.value))} className="input-field">
                {[1, 2, 5, 10].map(y => <option key={y} value={y}>{y} {y === 1 ? "year" : "years"} (${y * 15})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Wallet Address</label>
              <input value={walletAddress} onChange={e => setWalletAddress(e.target.value)} className="input-field font-mono text-xs" placeholder="0x... or bc1..." required />
            </div>
          </div>
          <button type="submit" className="btn-primary">Register Domain (${years * 15})</button>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Your Handshake Domains</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Blockchain TX</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Wallet</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Period</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {domains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Fingerprint className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No Handshake domains registered</p>
                    <p className="text-xs mt-1">Register your first decentralized domain</p>
                  </td>
                </tr>
              ) : domains.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{d.domain}/</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${d.status === "registered" ? "badge-success" : "badge-warning"}`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {d.blockchainTx ? (
                      <span className="font-mono text-xs flex items-center gap-1">
                        {d.blockchainTx.slice(0, 10)}...
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Pending...</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-gray-400" />
                      {d.walletAddress?.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-4 py-3">{d.registrationPeriod || d.years} yr</td>
                  <td className="px-4 py-3 text-gray-500">
                    {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : <Clock className="w-3 h-3 animate-pulse" />}
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
