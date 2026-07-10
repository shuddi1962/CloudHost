"use client";

import { useEffect, useState } from "react";
import { ArrowRightLeft, X, RefreshCw, Globe } from "lucide-react";

export default function DomainTransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [years, setYears] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchTransfers = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/domain-services/transfers", { headers });
      const data = await res.json();
      setTransfers(data.transfers || []);
    } catch (e) {
      console.error("Failed to fetch transfers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransfers(); }, []);

  useEffect(() => {
    if (transfers.length === 0) return;
    let cycles = 0;
    const interval = setInterval(async () => {
      cycles++;
      if (cycles > 3) { clearInterval(interval); return; }
      try {
        const res = await fetch("http://localhost:3001/api/domain-services/transfers", { headers });
        const data = await res.json();
        setTransfers(data.transfers || []);
      } catch (e) {}
    }, 3000);
    return () => clearInterval(interval);
  }, [transfers.length]);

  const initiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3001/api/domain-services/transfers", {
      method: "POST", headers,
      body: JSON.stringify({ domain, authCode, years, price: 9.99 }),
    });
    if (res.ok) {
      const data = await res.json();
      setTransfers([data.transfer, ...transfers]);
      setDomain(""); setAuthCode(""); setYears(1); setShowForm(false);
    }
  };

  const cancelTransfer = async (id: string) => {
    const res = await fetch(`http://localhost:3001/api/domain-services/transfers/${id}/cancel`, {
      method: "POST", headers,
    });
    if (res.ok) {
      const data = await res.json();
      setTransfers(transfers.map(t => t.id === id ? data.transfer : t));
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "badge-warning", in_progress: "badge-info", completed: "badge-success", cancelled: "badge-error",
    };
    return `badge ${map[status] || "badge-warning"}`;
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Domain Transfers</h1>
          <p className="text-gray-500">Transfer domains to CloudHost from other registrars</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <ArrowRightLeft className="w-4 h-4" />
          Initiate Transfer
        </button>
      </div>

      {showForm && (
        <form onSubmit={initiateTransfer} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domain Name</label>
              <input value={domain} onChange={e => setDomain(e.target.value)} className="input-field" placeholder="example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Auth Code (EPP)</label>
              <input value={authCode} onChange={e => setAuthCode(e.target.value)} className="input-field" placeholder="Enter auth code" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Registration Years</label>
              <select value={years} onChange={e => setYears(Number(e.target.value))} className="input-field">
                {[1, 2, 3, 5, 10].map(y => <option key={y} value={y}>{y} {y === 1 ? "year" : "years"}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Start Transfer ($9.99/yr)</button>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">All Transfers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Auth Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Years</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No domain transfers yet</p>
                    <p className="text-xs mt-1">Initiate a transfer to get started</p>
                  </td>
                </tr>
              ) : transfers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{t.domain}</td>
                  <td className="px-4 py-3"><span className={statusBadge(t.status)}>{t.status}</span></td>
                  <td className="px-4 py-3 font-mono text-xs">{t.authCode ? `${t.authCode.slice(0, 6)}...` : "-"}</td>
                  <td className="px-4 py-3">{t.years}</td>
                  <td className="px-4 py-3">${t.price}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {t.status === "pending" && (
                      <button onClick={() => cancelTransfer(t.id)} className="btn-secondary text-xs">
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    )}
                    {t.status === "in_progress" && (
                      <span className="flex items-center gap-1 text-xs text-blue-600"><RefreshCw className="w-3 h-3 animate-spin" /> Processing</span>
                    )}
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
