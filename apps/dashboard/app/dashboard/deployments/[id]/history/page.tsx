"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Snapshot {
  id: string; version: number; created_at: string; status: string;
  summary: { total_files: number; total_size: string; framework: string };
  config: { build_command: string; node_version: string; env_vars: Record<string, string> };
}

export default function DeploymentHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    fetch(`/api/deployments/${id}/history`).then(r => r.json()).then(data => {
      setHistory(data.history || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [params?.id]);

  const handleRollback = async (snapshotId: string) => {
    if (!confirm('Rollback to this deployment? The current version will be replaced.')) return;
    await fetch(`/api/deployments/${params?.id}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshotId }),
    });
    alert('Rollback initiated');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => router.push(`/dashboard/deployments/${params?.id}`)}
        className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back
      </button>

      <h1 className="text-xl font-bold mb-6">Deployment History</h1>

      {loading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded" />)}</div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p>No deployment history yet</p>
          <p className="text-sm">Snapshots are created automatically on each deploy</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((snap, idx) => (
            <div key={snap.id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRollback(snap.id)}>
              <div className="card-body flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                    v{snap.version}
                  </div>
                  <div>
                    <p className="font-medium text-sm">Deployment v{snap.version}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(snap.created_at).toLocaleString()} &middot;
                      {snap.summary.total_files} files &middot;
                      {snap.summary.total_size} &middot;
                      {snap.summary.framework}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Build: {snap.config.build_command} &middot; Node: {snap.config.node_version}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {idx === 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Current</span>}
                  {snap.status === 'rolling_back' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Rolling back...</span>}
                  <button onClick={(e) => { e.stopPropagation(); handleRollback(snap.id); }}
                    className="text-xs text-red-600 hover:underline">Rollback</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
