"use client";

import { useEffect, useState } from "react";
import { Search, Clock, Globe, FileText, Server, User } from "lucide-react";

export default function WhoisPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/domain-services/whois/history`, { headers })
      .then(r => r.json())
      .then(data => setHistory(data.history || []))
      .catch(() => {});
  }, []);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/domain-services/whois`, {
        method: "POST", headers,
        body: JSON.stringify({ domain: query.trim() }),
      });
      const data = await res.json();
      setResult(data.whois);
      setHistory(prev => [data.whois, ...prev].slice(0, 20));
    } catch (e) {
      console.error("Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">WHOIS Lookup</h1>
        <p className="text-gray-500">Look up domain registration information and ownership details</p>
      </div>

      <div className="card p-6">
        <form onSubmit={lookup} className="flex gap-3">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              className="input-field pl-10 text-lg" placeholder="example.com" autoFocus />
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? <span className="animate-pulse">Searching...</span> : <><Search className="w-4 h-4" /> Lookup</>}
          </button>
        </form>
      </div>

      {result && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">{result.domain}</h2>
          </div>
          <div className="card-body space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><Server className="w-4 h-4" /> Registrar</div>
                <p className="font-medium">{result.registrar}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><Clock className="w-4 h-4" /> Dates</div>
                <p className="font-medium text-xs">Created: {new Date(result.creationDate).toLocaleDateString()}</p>
                <p className="font-medium text-xs">Expires: {new Date(result.expiryDate).toLocaleDateString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><Server className="w-4 h-4" /> Name Servers</div>
                {result.nameServers?.map((ns: string, i: number) => (
                  <p key={i} className="font-mono text-xs">{ns}</p>
                ))}
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><User className="w-4 h-4" /> Registrant</div>
                <p className="font-medium text-xs">{result.registrantName}</p>
                <p className="text-xs text-gray-500">{result.registrantOrg}</p>
                <p className="text-xs text-gray-500">{result.registrantEmail}</p>
                <p className="text-xs text-gray-500">{result.registrantCountry}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-2"><FileText className="w-4 h-4" /> Raw WHOIS Data</div>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto max-h-64 whitespace-pre-wrap font-mono">{result.rawData}</pre>
            </div>

            <div className="flex flex-wrap gap-2">
              {result.status?.map((s: string) => (
                <span key={s} className="badge badge-warning text-xs">{s}</span>
              ))}
              <span className={`badge ${result.dnssec ? "badge-success" : "badge-error"} text-xs`}>DNSSEC: {result.dnssec ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Lookup History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Registrar</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Expiry</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">DNSSEC</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Looked Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No lookups yet</p>
                    <p className="text-xs mt-1">Search for a domain above</p>
                  </td>
                </tr>
              ) : history.map((h, i) => (
                <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => setResult(h)}>
                  <td className="px-4 py-3 font-medium">{h.domain}</td>
                  <td className="px-4 py-3 text-gray-500">{h.registrar}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(h.expiryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className={`badge ${h.dnssec ? "badge-success" : "badge-error"}`}>{h.dnssec ? "Yes" : "No"}</span></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(h.lookedUpAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
