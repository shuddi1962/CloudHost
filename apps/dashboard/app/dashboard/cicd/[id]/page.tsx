"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CICDDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [conn, setConn] = useState<any>(null);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/cicd/connections/${params.id}`).then(r => r.json()).then(d => setConn(d.connection)).catch(() => {});
  }, [params?.id]);

  if (!conn) return <div className="max-w-3xl mx-auto px-4 py-8 text-gray-400">Loading...</div>;

  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/cicd/webhook`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => router.push('/dashboard/cicd')} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to CI/CD
      </button>

      <div className="card mb-6">
        <div className="card-body space-y-4">
          <h1 className="text-xl font-bold">{conn.name}</h1>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[['Provider', conn.provider], ['Repository', conn.repository], ['Branch', conn.branch],
              ['Build Command', conn.build_command], ['Install Command', conn.install_command],
              ['Output Dir', conn.output_directory], ['Node Version', conn.node_version],
              ['Auto-deploy', conn.auto_deploy ? 'Yes' : 'No'],
              ['Last Deploy', conn.last_deploy_at ? new Date(conn.last_deploy_at).toLocaleString() : 'Never'],
            ].map(([l, v]) => (
              <div key={l}><p className="text-gray-500 text-xs">{l}</p><p className="font-mono text-xs mt-0.5">{v}</p></div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-3">Webhook Setup</h2>
          <p className="text-sm text-gray-500 mb-3">Add this URL to your repository webhooks settings:</p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Payload URL</p>
            <code className="text-sm font-mono text-indigo-600 break-all">{webhookUrl}</code>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 mt-2">
            <p className="text-xs text-gray-400 mb-1">Secret (keep this safe)</p>
            <code className="text-sm font-mono text-red-600">{conn.webhook_secret}</code>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 mt-3 text-xs text-yellow-700">
            For GitHub: Settings → Webhooks → Add webhook. Select &quot;Just the push event.&quot;
          </div>
        </div>
      </div>
    </div>
  );
}
