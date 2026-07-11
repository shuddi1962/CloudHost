"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EdgeFunctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [fn, setFn] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'logs'>('overview');

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/edge-functions/${params.id}`).then(r => r.json()).then(d => setFn(d));
    fetch(`/api/edge-functions/${params.id}/logs`).then(r => r.json()).then(d => setLogs(d.logs || []));
  }, [params?.id]);

  const deploy = async () => {
    await fetch(`/api/edge-functions/${params?.id}/deploy`, { method: 'POST' });
    alert('Deploying...');
  };

  if (!fn) return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => router.push('/dashboard/edge-functions')} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{fn.function.name}</h1>
          <p className="text-sm text-gray-400">{fn.function.runtime} · {fn.function.url}</p>
        </div>
        <button onClick={deploy} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Deploy</button>
      </div>

      <div className="flex gap-1 mb-6 border-b">
        {['overview', 'metrics', 'logs'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="card">
          <div className="card-body">
            <h2 className="font-semibold mb-3">Function Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Name', fn.function.name], ['Runtime', fn.function.runtime], ['Status', fn.function.status],
                ['Memory', `${fn.function.memory_mb} MB`], ['Timeout', `${fn.function.timeout_seconds}s`],
                ['URL', fn.function.url], ['Entrypoint', fn.function.entrypoint],
                ['Created', new Date(fn.function.created_at).toLocaleString()],
              ].map(([l, v]) => (
                <div key={l}><p className="text-gray-500 text-xs">{l}</p><p className="text-xs mt-0.5">{v}</p></div>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-gray-500 text-xs mb-1">Source Code</p>
              <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded-lg overflow-x-auto max-h-40">{fn.function.source}</pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metrics' && fn.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Invocations', value: fn.metrics.invocations_total.toLocaleString(), color: 'text-blue-600' },
            { label: 'Avg Duration', value: `${fn.metrics.avg_duration_ms}ms`, color: 'text-green-600' },
            { label: 'Errors (24h)', value: fn.metrics.errors_24h, color: fn.metrics.errors_24h > 10 ? 'text-red-600' : 'text-gray-600' },
          ].map(m => (
            <div key={m.label} className="card"><div className="card-body"><p className="text-sm text-gray-400">{m.label}</p><p className={`text-2xl font-bold ${m.color}`}>{m.value}</p></div></div>
          ))}
          <div className="md:col-span-3 card">
            <div className="card-body">
              <h3 className="font-semibold mb-3">Invocations (last 24h)</h3>
              <div className="flex items-end gap-1 h-20">
                {fn.metrics.invocations_history?.map((h: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-indigo-200 rounded-t" style={{ height: `${(h.count / Math.max(...fn.metrics.invocations_history.map((x: any) => x.count))) * 100}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card">
          <div className="card-body">
            <h2 className="font-semibold mb-3">Function Logs</h2>
            {logs.length === 0 ? (
              <p className="text-sm text-gray-400">No logs yet</p>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {logs.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-2 text-xs font-mono bg-gray-50 p-2 rounded">
                    <span className={`${log.level === 'error' ? 'text-red-500' : log.level === 'warn' ? 'text-yellow-500' : 'text-gray-400'}`}>{log.level.toUpperCase()}</span>
                    <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span>{log.message}</span>
                    {log.duration_ms && <span className="text-gray-400">{log.duration_ms}ms</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
