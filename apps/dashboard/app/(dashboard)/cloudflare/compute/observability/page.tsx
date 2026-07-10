"use client";
import { useState, useEffect } from "react";

export default function ObservabilityPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [obs, setObs] = useState<any>(null);
  const [selectedWorker, setSelectedWorker] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/compute${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/workers").then(r => r.json()).then(d => setWorkers(d.workers || [])).catch(() => {}); }, []);

  const loadObs = async (wid: string) => {
    setSelectedWorker(wid);
    const d = await (await api(`/observability/${wid}`)).json();
    setObs(d.observability);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workers Observability</h1>
          <p className="text-gray-500">Logs, traces, and metrics for your Workers</p>
        </div>
      </div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">Select Worker</h3>
        <select value={selectedWorker} onChange={e => loadObs(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Choose a worker...</option>
          {workers.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>
      {obs && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <h3 className="font-semibold text-sm mb-3">Metrics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Requests</span><span className="font-mono">{(obs.metrics as any)?.requests || 0}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Errors</span><span className="font-mono">{(obs.metrics as any)?.errors || 0}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Sampling</span><span className="font-mono">{obs.samplingRate || 100}%</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Retention</span><span className="font-mono">{obs.retentionDays || 7}d</span></div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 bg-white lg:col-span-2">
            <h3 className="font-semibold text-sm mb-3">Recent Logs</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {(obs.logs as any[])?.length > 0 ? (obs.logs as any[]).slice(-20).reverse().map((l: any, i: number) => (
                <div key={i} className="text-xs p-1.5 bg-gray-50 rounded font-mono">
                  <span className="text-gray-400">[{l.time || l.timestamp}]</span> {l.message || l.level}: {JSON.stringify(l)}
                </div>
              )) : <p className="text-xs text-gray-400">No logs yet</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
