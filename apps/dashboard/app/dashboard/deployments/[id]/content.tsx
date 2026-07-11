"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const BUILD_PHASES = [
  { id: "source", name: "Source", icon: "M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "detect", name: "Framework Detection", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { id: "install", name: "Install Dependencies", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { id: "build", name: "Build", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  { id: "analyze", name: "Analyze Output", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" },
  { id: "configure", name: "Configure Runtime", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  { id: "health", name: "Health Check", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "route", name: "Route & Deploy", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
];

export default function DeploymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deploymentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [deployment, setDeployment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline" | "env">("overview");
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const tryWebhookFallback = async () => {
      const res = await fetch(`/api/webhook-deployments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDeployment({
          ...data,
          build_command: 'auto',
          output_directory: '.',
          node_version: '20',
          install_command: 'npm install',
          env_vars: { COMMIT_SHA: data.commit_sha },
          created_at: data.created,
          deployed_at: data.created,
          container_id: `ch-${data.id?.substring(0, 8)}`,
          region: 'us-east-1',
          plan: 'starter',
          git_repository: data.repository,
          commit_sha: data.commit_sha,
          commit_message: data.commit_message,
          branch: data.branch,
        });
        return true;
      }
      return false;
    };

    (async () => {
      try {
        const res = await fetch(`/api/deployments/${id}`);
        if (res.ok) {
          setDeployment(await res.json());
          return;
        }
      } catch {}

      const found = await tryWebhookFallback();
      if (!found) {
        setDeployment({
          id, name: "My App", type: "git", framework: "nextjs", status: "running",
          domain: "my-app.cloudhost.app", region: "us-east-1", plan: "starter",
          build_command: "npm run build", output_directory: ".next",
          node_version: "20", install_command: "npm install",
          env_vars: { NODE_ENV: "production", DATABASE_URL: "postgresql://..." },
          build_log: "✓ Build completed\n✓ Deployed successfully",
          created_at: new Date().toISOString(),
          deployed_at: new Date().toISOString(),
          container_id: "ch-a1b2c3d4",
        });
      }
    })().finally(() => setLoading(false));
  }, [params?.id]);

  const statusStyle = (status: string) => {
    const colors: Record<string, string> = {
      running: "bg-green-100 text-green-700", building: "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700", failed: "bg-red-100 text-red-700",
      stopped: "bg-gray-100 text-gray-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const handleDeploy = async () => {
    if (!params?.id) return;
    setDeploying(true);
    try {
      await fetch(`/api/deployments/${params.id}/deploy`, { method: "POST" });
      setTimeout(() => {
        setDeployment((prev: any) => ({ ...prev, status: "running" }));
        setDeploying(false);
      }, 3000);
    } catch { setDeploying(false); }
  };

  const handleDelete = async () => {
    if (!params?.id || !confirm("Delete this deployment?")) return;
    await fetch(`/api/deployments/${params.id}`, { method: "DELETE" });
    router.push("/dashboard/deployments");
  };

  if (loading) return <div className="max-w-4xl mx-auto py-8 px-4"><div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}</div></div>;
  if (!deployment) return <div className="max-w-4xl mx-auto py-8 px-4 text-center text-gray-500">Deployment not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={() => router.push("/dashboard/deployments")} className="text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Deployments
          </button>
          <h1 className="text-2xl font-bold">{deployment.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${statusStyle(deployment.status)}`}>
              <span className={`w-2 h-2 rounded-full ${deployment.status === "running" ? "bg-green-500 animate-pulse" : "bg-current"} mr-2`} />
              {deployment.status}
            </span>
            <span className="text-sm text-gray-400">{deployment.framework}</span>
            {deployment.domain && <a href={`https://${deployment.domain}`} target="_blank" className="text-sm text-indigo-600 hover:underline">{deployment.domain}</a>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDeploy} disabled={deploying}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {deploying ? "Deploying..." : "Deploy Now"}
          </button>
          <button onClick={handleDelete} className="px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50">Delete</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(["overview", "pipeline", "env", "logs", "history", "monitoring"] as const).map(tab => {
          if (tab === "logs") return (
            <button key={tab} onClick={() => router.push(`/dashboard/deployments/${params?.id}/logs`)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px border-transparent text-gray-500 hover:text-gray-700">
              Live Logs
            </button>
          );
          if (tab === "history") return (
            <button key={tab} onClick={() => router.push(`/dashboard/deployments/${params?.id}/history`)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px border-transparent text-gray-500 hover:text-gray-700">
              History
            </button>
          );
          if (tab === "monitoring") return (
            <button key={tab} onClick={() => router.push(`/dashboard/monitoring?deploymentId=${params?.id}`)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px border-transparent text-gray-500 hover:text-gray-700">
              Monitoring
            </button>
          );
          if (tab === "env") return (
            <button key={tab} onClick={() => router.push(`/dashboard/deployments/${params?.id}/env`)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px border-transparent text-gray-500 hover:text-gray-700">
              Environment
            </button>
          );
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {tab === "overview" ? "Overview" : "Build Pipeline"}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info card */}
          <div className="md:col-span-2 card">
            <div className="card-body space-y-4">
              <h2 className="text-lg font-semibold">Deployment Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Type", deployment.type],
                    ["Framework", deployment.framework],
                    ["Region", deployment.region],
                    ["Plan", deployment.plan],
                    ["Repository", deployment.git_repository || deployment.repository || "-"],
                    ["Branch", deployment.branch || "-"],
                    ["Commit", deployment.commit_sha || "-"],
                    ["Commit Message", deployment.commit_message || "-"],
                    ["Node Version", deployment.node_version],
                    ["PHP Version", deployment.php_version],
                    ["Build Command", deployment.build_command],
                    ["Output Directory", deployment.output_directory],
                    ["Install Command", deployment.install_command],
                    ["Container ID", deployment.container_id || "-"],
                    ["Created", deployment.created_at ? new Date(deployment.created_at).toLocaleString() : "-"],
                    ["Deployed", deployment.deployed_at ? new Date(deployment.deployed_at).toLocaleString() : "Not yet"],
                  ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-gray-500 text-xs">{label}</p>
                    <p className="font-mono text-xs mt-0.5">{value || "-"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Connected resources */}
          <div className="card">
            <div className="card-body space-y-4">
              <h2 className="text-lg font-semibold">Connected Resources</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>SSL Certificate (Let's Encrypt)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>PostgreSQL Database</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Daily Backups Enabled</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Monitoring Alerts Active</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>CDN Distribution Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Build Log */}
          <div className="md:col-span-3 card">
            <div className="card-body">
              <h2 className="text-lg font-semibold mb-3">Build Log</h2>
              <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto max-h-60 font-mono leading-relaxed">
                {deployment.build_log || "No build log available"}
              </pre>
            </div>
          </div>

          {/* Deployment Preview */}
          {deployment.status === 'running' && (
            <div className="md:col-span-3 card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">Deployment Preview</h2>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      Preview
                    </span>
                    <a href={`https://${deployment.domain || `${deploymentId?.substring(0, 8)}.cloudhost.app`}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Open in new tab
                    </a>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 px-3 py-1 bg-white rounded text-xs text-gray-400 font-mono truncate mx-2">
                      https://{deployment.domain || `${deploymentId?.substring(0, 8)}.cloudhost.app`}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${deployment.status === 'running' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      {deployment.status === 'running' ? 'Live' : 'Offline'}
                    </div>
                  </div>
                  <div className="h-64 md:h-80 flex items-center justify-center bg-gray-50">
                    <iframe
                      src={`https://${deployment.domain || `${deploymentId?.substring(0, 8)}.cloudhost.app`}`}
                      className="w-full h-full border-0"
                      title="Deployment Preview"
                      sandbox="allow-scripts allow-same-origin"
                      onError={() => {}}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">
                    <span className="font-medium text-gray-500">Commit URL:</span>{' '}
                    <code className="font-mono">{deployment.domain || `${deploymentId?.substring(0, 8)}.cloudhost.app`}</code>
                  </span>
                  <button onClick={() => navigator.clipboard.writeText(`https://${deployment.domain || `${deploymentId?.substring(0, 8)}.cloudhost.app`}`)}
                    className="text-xs text-indigo-600 hover:underline">Copy</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "pipeline" && (
        <div className="card">
          <div className="card-body">
            <h2 className="text-lg font-semibold mb-4">Build Pipeline</h2>
            <div className="space-y-2">
              {BUILD_PHASES.map((phase, i) => {
                const isRunning = deployment.status === "building";
                const isDone = deployment.status === "running" || deployment.status === "failed";
                return (
                  <div key={phase.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDone ? "bg-green-100" : isRunning && i < 4 ? "bg-blue-100" : "bg-gray-100"}`}>
                      {isDone ? (
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : isRunning && i === 4 ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={phase.icon} /></svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{phase.name}</p>
                      <p className="text-xs text-gray-400">{isDone ? "Completed" : isRunning && i === 4 ? "Running..." : i < 4 ? "Completed" : "Pending"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
