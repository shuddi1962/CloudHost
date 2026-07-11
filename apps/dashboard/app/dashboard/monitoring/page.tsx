"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function MonitoringPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deploymentId = searchParams.get('deploymentId') || '';
  const [metrics, setMetrics] = useState<any>(null);
  const [uptime, setUptime] = useState<any>(null);
  const [uptimePct, setUptimePct] = useState(0);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [editingAlert, setEditingAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({ metric: 'cpu', condition: '>', threshold: 80 });

  const load = () => {
    if (!deploymentId) return;
    fetch(`/api/monitoring/metrics/${deploymentId}`).then(r => r.json()).then(d => setMetrics(d.metrics));
    fetch(`/api/monitoring/uptime/${deploymentId}`).then(r => r.json()).then(d => { setUptime(d.checks); setUptimePct(d.percentage); });
    fetch(`/api/monitoring/alerts/rule?deploymentId=${deploymentId}`).then(r => r.json()).then(d => setAlerts(d.rules || []));
  };
  useEffect(() => { load(); const interval = setInterval(load, 15000); return () => clearInterval(interval); }, [deploymentId]);

  const addAlert = async () => {
    await fetch('/api/monitoring/alerts/rule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newAlert, deploymentId, enabled: true }) });
    setEditingAlert(false);
    load();
  };

  const deleteAlert = async (id: string) => {
    await fetch(`/api/monitoring/alerts/rule?id=${id}`, { method: 'DELETE' });
    load();
  };

  const sparkline = (points: { value: number }[] = [], color: string) => (
    <svg viewBox={`0 0 ${points.length} 50`} className="w-full h-12">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points.map((p, i) => `${i},${50 - p.value / 2}`).join(' ')} />
    </svg>
  );

  if (!deploymentId) return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Monitoring</h1>
      <p className="text-gray-400 mb-4">Select a deployment to monitor</p>
      <input placeholder="Enter deployment ID" className="border rounded-lg px-4 py-2 text-sm w-80" onKeyDown={e => { if (e.key === 'Enter') router.push(`/dashboard/monitoring?deploymentId=${(e.target as HTMLInputElement).value}`); }} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Monitoring · {deploymentId.substring(0, 8)}</h1>

      {/* Uptime bar */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Uptime (24h)</h2>
            <span className={`text-lg font-bold ${uptimePct >= 99.9 ? 'text-green-600' : uptimePct >= 99 ? 'text-yellow-600' : 'text-red-600'}`}>{uptimePct}%</span>
          </div>
          <div className="flex gap-0.5 h-6">
            {uptime?.slice(-96).map((c: any, i: number) => (
              <div key={i} className={`flex-1 rounded-sm ${c.status === 'up' ? 'bg-green-400' : c.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'}`} title={`${c.status} - ${c.response_time_ms}ms`} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">15-minute intervals</p>
        </div>
      </div>

      {/* Metric cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { label: 'CPU', data: metrics.cpu, color: '#6366f1', unit: '%', current: metrics.cpu[metrics.cpu.length - 1]?.value },
            { label: 'Memory', data: metrics.memory, color: '#10b981', unit: '%', current: metrics.memory[metrics.memory.length - 1]?.value },
            { label: 'Response Time', data: metrics.response_time, color: '#f59e0b', unit: 'ms', current: metrics.response_time[metrics.response_time.length - 1]?.value },
            { label: 'Requests/min', data: metrics.requests_per_minute, color: '#ef4444', unit: '', current: metrics.requests_per_minute[metrics.requests_per_minute.length - 1]?.value },
          ].map(m => (
            <div key={m.label} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-500">{m.label}</p>
                  <p className="text-lg font-bold">{m.current}{m.unit}</p>
                </div>
                {sparkline(m.data, m.color)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert rules */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Alert Rules</h2>
            <button onClick={() => setEditingAlert(!editingAlert)} className="text-sm text-indigo-600 hover:underline">+ Add Rule</button>
          </div>

          {editingAlert && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
              <select value={newAlert.metric} onChange={e => setNewAlert({...newAlert, metric: e.target.value})} className="border rounded px-2 py-1 text-sm">
                <option value="cpu">CPU</option><option value="memory">Memory</option><option value="response_time">Response Time</option><option value="uptime">Uptime</option>
              </select>
              <select value={newAlert.condition} onChange={e => setNewAlert({...newAlert, condition: e.target.value})} className="border rounded px-2 py-1 text-sm">
                <option value=">">&gt;</option><option value=">=">&gt;=</option><option value="<">&lt;</option>
              </select>
              <input type="number" value={newAlert.threshold} onChange={e => setNewAlert({...newAlert, threshold: Number(e.target.value)})} className="border rounded px-2 py-1 text-sm w-20" />
              <button onClick={addAlert} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg">Save</button>
            </div>
          )}

          {alerts.length === 0 ? (
            <p className="text-sm text-gray-400">No alert rules configured</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((rule: any) => (
                <div key={rule.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{rule.metric}</span>
                    <span>{rule.condition}</span>
                    <span className="font-mono">{rule.threshold}{rule.metric === 'response_time' ? 'ms' : '%'}</span>
                    {rule.enabled && <span className="text-xs bg-green-100 text-green-700 px-2 rounded-full">Active</span>}
                  </div>
                  <button onClick={() => deleteAlert(rule.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
