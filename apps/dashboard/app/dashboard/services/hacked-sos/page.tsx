"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle, Shield, Wrench, CheckCircle, FileText, Server,
  Clock, User, Plus, ChevronDown, ChevronRight, X, RefreshCw, Bug, HardDrive
} from "lucide-react";

interface SosCase {
  id: string; domain: string; severity: string; description: string; status: string;
  symptoms: string[]; technician: string | null; createdAt: string;
  filesAffected: number; filesCleaned: number; patchesApplied: string[];
  backupDate: string | null; backupSize: string | null;
}

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/business-tools/hacked-sos`;

export default function HackedSosPage() {
  const [cases, setCases] = useState<SosCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [form, setForm] = useState({ domain: "", severity: "high", description: "", symptoms: [] as string[] });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchCases = async () => {
    try {
      const res = await fetch(API, { headers });
      if (res.ok) { const d = await res.json(); setCases(d.cases || []); }
    } catch (e) { console.error("Failed to fetch SOS cases"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCases(); }, []);

  const reportCase = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(API, {
      method: "POST", headers,
      body: JSON.stringify(form),
    });
    if (res.ok) { const d = await res.json(); setCases([d.case, ...cases]); setShowForm(false); }
  };

  const toggleSymptom = (symptom: string) => {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom) ? prev.symptoms.filter(s => s !== symptom) : [...prev.symptoms, symptom],
    }));
  };

  const startRepair = async (id: string) => {
    const res = await fetch(`${API}/${id}/start-repair`, { method: "POST", headers });
    if (res.ok) {
      setCases(cases.map(c => c.id === id ? { ...c, status: "repairing" } : c));
    }
  };

  const completeRepair = async (id: string) => {
    const res = await fetch(`${API}/${id}/complete-repair`, { method: "POST", headers });
    if (res.ok) {
      const d = await res.json();
      setCases(cases.map(c => c.id === id ? { ...c, ...d.case, status: "resolved" } : c));
    }
  };

  const severityBadge = (severity: string) => {
    const map: Record<string, string> = { critical: "badge-error", high: "badge-error", medium: "badge-warning", low: "badge-info" };
    return <span className={`badge ${map[severity] || "badge-info"}`}>{severity}</span>;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { reported: "badge-info", repairing: "badge-warning", resolved: "badge-success" };
    return <span className={`badge ${map[status] || "badge-info"}`}>{status}</span>;
  };

  const symptomsChecklist = [
    "Homepage defaced", "Unknown admin users", "Spam emails from server",
    "Suspicious files detected", "Database compromised", "SSL certificate error",
    "Redirect to malicious sites", "Performance degradation",
  ];

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fix Hacked Website SOS</h1>
          <p className="text-gray-500">Emergency malware removal and website recovery service</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-danger">
          <AlertTriangle className="w-4 h-4" /> Report Hack
        </button>
      </div>

      {showForm && (
        <form onSubmit={reportCase} className="card p-6 space-y-4 border-red-200">
          <h3 className="font-semibold text-red-700 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Report Hacked Website</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} className="input-field" placeholder="hacked-site.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="input-field">
                <option value="critical">Critical - Site is down or defaced</option>
                <option value="high">High - Malware detected</option>
                <option value="medium">Medium - Suspicious activity</option>
                <option value="low">Low - Minor issues</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} placeholder="Describe what happened..." />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Symptoms</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {symptomsChecklist.map(s => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.symptoms.includes(s)} onChange={() => toggleSymptom(s)} className="w-4 h-4 rounded border-gray-300" />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-danger"><AlertTriangle className="w-4 h-4" /> Submit Report</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-header"><h2 className="font-semibold">SOS Cases</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Severity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Technician</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Reported</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cases.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No SOS cases</p>
                  <p className="text-xs mt-1">Report a hacked site to start the recovery process</p>
                </td></tr>
              ) : cases.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.domain}</td>
                  <td className="px-4 py-3">{severityBadge(c.severity)}</td>
                  <td className="px-4 py-3">{statusBadge(c.status)}</td>
                  <td className="px-4 py-3">{c.technician || <span className="text-gray-400">Unassigned</span>}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => setSelectedCase(selectedCase === c.id ? null : c.id)} className="btn-secondary text-xs px-2 py-1">
                        {selectedCase === c.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} Details
                      </button>
                      {c.status === "reported" && (
                        <button onClick={() => startRepair(c.id)} className="btn-primary text-xs px-2 py-1">
                          <Wrench className="w-3 h-3" /> Start Repair
                        </button>
                      )}
                      {c.status === "repairing" && (
                        <button onClick={() => completeRepair(c.id)} className="btn-primary text-xs px-2 py-1">
                          <CheckCircle className="w-3 h-3" /> Complete Repair
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCase && (() => {
        const c = cases.find(c => c.id === selectedCase);
        if (!c) return null;
        return (
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Case Details - {c.domain}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><Bug className="w-4 h-4" /> Files</div>
                <p className="font-medium">{c.filesAffected} affected / {c.filesCleaned} cleaned</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><FileText className="w-4 h-4" /> Patches Applied</div>
                <div className="flex flex-wrap gap-1">
                  {c.patchesApplied?.length ? c.patchesApplied.map((p, i) => (
                    <span key={i} className="badge badge-success text-xs">{p}</span>
                  )) : <span className="text-xs text-gray-400">None</span>}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><HardDrive className="w-4 h-4" /> Backup</div>
                <p className="text-xs">{c.backupDate ? new Date(c.backupDate).toLocaleDateString() : "N/A"}</p>
                <p className="text-xs text-gray-500">{c.backupSize || "N/A"}</p>
              </div>
            </div>
            {c.symptoms?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {c.symptoms.map((s, i) => <span key={i} className="badge badge-warning text-xs">{s}</span>)}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
