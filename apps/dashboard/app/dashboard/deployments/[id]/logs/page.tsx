"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DeploymentLogsPage() {
  const params = useParams();
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<string>('idle');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!params?.id) return;
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const evtSource = new EventSource(`/api/deployments/${id}/stream`);

    evtSource.onopen = () => setConnected(true);

    evtSource.addEventListener('log', (e) => {
      try {
        const data = JSON.parse(e.data);
        setLogs(prev => [...prev, `[${data.type}] ${data.message}`]);
      } catch { /* skip */ }
    });

    evtSource.addEventListener('phase_start', (e) => {
      try {
        const data = JSON.parse(e.data);
        setLogs(prev => [...prev, `\n━━━ [${data.name}] ━━━`]);
        setStatus(data.name);
      } catch { /* skip */ }
    });

    evtSource.addEventListener('phase_end', (e) => {
      try {
        const data = JSON.parse(e.data);
        setLogs(prev => [...prev, `━━━ ${data.name}: ${data.status} ━━━\n`]);
      } catch { /* skip */ }
    });

    evtSource.addEventListener('build_end', (e) => {
      try {
        const data = JSON.parse(e.data);
        setLogs(prev => [...prev, `\n✓ Build ${data.status}`]);
        setStatus('done');
      } catch { /* skip */ }
    });

    evtSource.onerror = () => setConnected(false);

    return () => evtSource.close();
  }, [params?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => router.push(`/dashboard/deployments/${params?.id}`)}
        className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Deployment
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Build Logs</h1>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-400">{connected ? 'Connected' : 'Disconnected'}</span>
          {status !== 'idle' && status !== 'done' && (
            <span className="text-xs text-blue-500 animate-pulse">{status}...</span>
          )}
        </div>
      </div>

      <div className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg font-mono leading-relaxed h-[500px] overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-500 italic">Waiting for build output...</p>
        ) : (
          logs.map((line, i) => <div key={i} className="whitespace-pre-wrap">{line}</div>)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
