"use client";

import { useEffect, useState } from "react";
import {
  Search, Globe, Clock, Activity, Server, BookOpen,
  ChevronDown, ChevronRight, Zap, RefreshCw, List
} from "lucide-react";

interface DnsRecord {
  name: string; type: string; ttl: number; value: string; priority?: number;
}

interface LookupResult {
  domain: string; queryType: string; records: DnsRecord[]; responseTime: number; queriedAt: string;
}

interface HistoryItem {
  id: string; domain: string; queryType: string; responseTime: number; queriedAt: string;
}

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/business-tools/public-dns`;

const queryTypes = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "SRV", "CAA", "PTR"];

export default function PublicDnsPage() {
  const [domain, setDomain] = useState("");
  const [queryType, setQueryType] = useState("A");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/history`, { headers })
      .then(r => r.json())
      .then(data => setHistory(data.history || []))
      .catch(() => {});
  }, []);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/lookup`, {
        method: "POST", headers,
        body: JSON.stringify({ domain: domain.trim(), queryType }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
        setHistory(prev => [data.result, ...prev].slice(0, 20));
      }
    } catch (e) { console.error("Lookup failed"); }
    finally { setLoading(false); }
  };

  const responseTimeColor = (ms: number) => {
    if (ms < 50) return "badge-success";
    if (ms < 150) return "badge-warning";
    return "badge-error";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Public DNS Resolver</h1>
        <p className="text-gray-500">Query public DNS records with performance metrics and history</p>
      </div>

      <div className="card p-6">
        <form onSubmit={lookup} className="flex gap-3">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={domain} onChange={e => setDomain(e.target.value)}
              className="input-field pl-10 text-lg" placeholder="example.com" autoFocus />
          </div>
          <select value={queryType} onChange={e => setQueryType(e.target.value)} className="input-field w-28">
            {queryTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Querying...</> : <><Search className="w-4 h-4" /> Lookup</>}
          </button>
        </form>
      </div>

      {result && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{result.domain} <span className="text-gray-400 font-normal">({result.queryType} record)</span></h2>
              <span className={`badge ${responseTimeColor(result.responseTime)}`}>
                <Zap className="w-3 h-3 mr-1" /> {result.responseTime}ms
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">TTL</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.records.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No records found</td></tr>
                ) : result.records.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{r.name}</td>
                    <td className="px-4 py-3"><span className="badge badge-info">{r.type}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.ttl}s</td>
                    <td className="px-4 py-3 text-gray-500">{r.priority ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs max-w-[400px] break-all">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Query History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Response Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Queried At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No queries yet</p>
                  <p className="text-xs mt-1">Look up a domain above</p>
                </td></tr>
              ) : history.map((h, i) => (
                <tr key={h.id || i} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setDomain(h.domain); setQueryType(h.queryType); }}>
                  <td className="px-4 py-3 font-medium">{h.domain}</td>
                  <td className="px-4 py-3"><span className="badge badge-info">{h.queryType}</span></td>
                  <td className="px-4 py-3">
                    <span className={`badge ${responseTimeColor(h.responseTime)}`}>{h.responseTime}ms</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(h.queriedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
