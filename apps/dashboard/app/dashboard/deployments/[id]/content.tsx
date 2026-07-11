"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

function getStatusStyle(status: string) {
  switch (status) {
    case "running": case "ready": return { dot: "bg-green-500", bg: "bg-green-100", text: "text-green-700", label: "Ready" };
    case "building": return { dot: "bg-yellow-500", bg: "bg-yellow-100", text: "text-yellow-700", label: "Building" };
    case "stopped": return { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600", label: "Stopped" };
    case "failed": case "error": return { dot: "bg-red-500", bg: "bg-red-100", text: "text-red-700", label: "Error" };
    default: return { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600", label: status };
  }
}

const demoBuildLogs = [
  { time: "00:00:01", level: "info", message: "Cloning repository: https://github.com/acme/website.git" },
  { time: "00:00:03", level: "info", message: "Checking framework: Next.js detected" },
  { time: "00:00:04", level: "info", message: "Using Node.js 20.x" },
  { time: "00:00:05", level: "info", message: "Installing dependencies..." },
  { time: "00:00:08", level: "info", message: "npm install completed (142 packages)" },
  { time: "00:00:10", level: "info", message: "Running build command: npm run build" },
  { time: "00:00:12", level: "info", message: "✓ Linting and checking validity of types" },
  { time: "00:00:14", level: "info", message: "✓ Creating optimized production build" },
  { time: "00:00:16", level: "info", message: "✓ Generating static pages (5/5)" },
  { time: "00:00:17", level: "info", message: "✓ Collecting build traces" },
  { time: "00:00:18", level: "success", message: "✓ Build completed in 17.2s" },
  { time: "00:00:19", level: "info", message: "Deploying to edge network..." },
  { time: "00:00:20", level: "info", message: "Uploading static assets (2.4 MB)" },
  { time: "00:00:21", level: "success", message: "✓ Deployment ready at acme-website.cloudhost.app" },
];

export default function DeploymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [deployment, setDeployment] = useState<any>(null);
  const [previews, setPreviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "domains" | "env" | "previews">("overview");
  const [logFilter, setLogFilter] = useState("all");

  useEffect(() => {
    if (!params?.id) return;
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`http://localhost:3001/api/deployments/${id}`, { headers })
      .then(r => r.json())
      .then(data => setDeployment(data.deployment))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch(`http://localhost:3001/api/preview-deployments/deployment/${id}`, { headers })
      .then(r => r.json())
      .then(data => setPreviews(data.previews || []))
      .catch(() => {});
  }, [params?.id]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading deployment...</div>;
  if (!deployment) return <div className="text-center py-12 text-gray-400">Deployment not found</div>;

  const st = getStatusStyle(deployment.status);
  const filteredLogs = logFilter === "all" ? demoBuildLogs : demoBuildLogs.filter(l => l.level === logFilter);
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/deployments")} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{deployment.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
            </div>
            <p className="text-sm text-gray-500">{deployment.framework} · {deployment.gitBranch || "main"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {deployment.url && (
            <a href={`https://${deployment.url}`} target="_blank"
              className="btn-secondary text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit Site
            </a>
          )}
          <button onClick={async () => {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:3001/api/deployments/${id}/deploy`, {
              method: "POST", headers: { Authorization: `Bearer ${token}` },
            });
            alert("Deployment triggered!");
          }} className="btn-primary text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Redeploy
          </button>
        </div>
      </div>

      {/* Status + Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Framework", value: deployment.framework, icon: "M8 9l3 3-3 3m5 0h3" },
          { label: "Branch", value: deployment.gitBranch || "main", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
          { label: "Build Command", value: deployment.buildCommand || "npm run build", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m16-6h-2m2 6h-2" },
          { label: "Output Directory", value: deployment.outputDirectory || ".next", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
              </svg>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
            <p className="text-sm font-medium truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Preview Box — like Vercel's deployment preview */}
      {deployment.url && (
        <div className="card overflow-hidden">
          <div className="relative bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white rounded-md border border-gray-200 px-3 py-1 flex items-center gap-2 text-xs text-gray-500 max-w-md truncate">
                <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                https://{deployment.url}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-brand-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-700">{deployment.name}</p>
              <p className="text-sm text-gray-400 mt-1">Deployed to CloudHost Edge Network</p>
              <a href={`https://${deployment.url}`} target="_blank"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Preview
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto">
          {[
            { key: "overview", label: "Overview", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            { key: "logs", label: "Logs", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
            { key: "domains", label: "Domains", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9" },
            { key: "env", label: "Environment", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
            { key: "previews", label: "Previews", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Git Details */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-4">Git Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Repository</p>
                    <p className="text-sm font-medium">{deployment.gitRepository || "acme/website"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Branch</p>
                    <p className="text-sm font-medium">{deployment.gitBranch || "main"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Author</p>
                    <p className="text-sm font-medium">{deployment.author || "Team Member"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium">{new Date(deployment.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Build Summary */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-4">Build Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-green-600">17.2s</p>
                  <p className="text-xs text-green-700">Build Time</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-blue-600">142</p>
                  <p className="text-xs text-blue-700">Packages</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-purple-600">2.4 MB</p>
                  <p className="text-xs text-purple-700">Bundle Size</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-amber-600">5</p>
                  <p className="text-xs text-amber-700">Static Pages</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex items-center gap-2">
              {[
                { key: "all", label: "All" },
                { key: "info", label: "Info" },
                { key: "success", label: "Success" },
                { key: "error", label: "Error" },
              ].map((f) => (
                <button key={f.key} onClick={() => setLogFilter(f.key)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    logFilter === f.key ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>{f.label}</button>
              ))}
              <div className="flex-1" />
              <span className="text-xs text-gray-400">{filteredLogs.length} entries</span>
            </div>
            {/* Terminal */}
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto">
              {filteredLogs.map((log, i) => (
                <div key={i} className="flex gap-4 mb-1">
                  <span className="text-gray-500 w-16 flex-shrink-0">{log.time}</span>
                  <span className={`w-14 flex-shrink-0 text-[10px] font-semibold uppercase ${
                    log.level === "error" ? "text-red-400" :
                    log.level === "success" ? "text-green-400" : "text-blue-400"
                  }`}>{log.level}</span>
                  <span className={`${
                    log.level === "error" ? "text-red-300" :
                    log.level === "success" ? "text-green-300" : "text-gray-300"
                  }`}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Domains Tab */}
        {activeTab === "domains" && (
          <div className="space-y-3">
            <div className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{deployment.name}.cloudhost.app</p>
                <p className="text-xs text-gray-500">Default CloudHost domain</p>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
            <p className="text-sm text-gray-500 text-center py-4">
                             <Link href="/dashboard/domains" className="text-brand-600 hover:text-brand-800 font-medium">Add a custom domain</Link> to point to this deployment
            </p>
          </div>
        )}

        {/* Environment Tab */}
        {activeTab === "env" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Environment Variables</p>
              <button className="btn-primary text-xs px-3 py-1.5">+ Add Variable</button>
            </div>
            {deployment.environment && Object.keys(deployment.environment).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(deployment.environment).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                      <code className="text-sm font-mono">{key}</code>
                    </div>
                    <code className="text-sm font-mono text-gray-500">********</code>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                <p>No environment variables configured</p>
              </div>
            )}
          </div>
        )}

        {/* Previews Tab */}
        {activeTab === "previews" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Preview Deployments</p>
              <Link href={`/deployments/preview?deploymentId=${id}`} className="btn-primary text-xs px-3 py-1.5">
                + New Preview
              </Link>
            </div>
            {previews.length > 0 ? (
              previews.map((p: any) => (
                <div key={p.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{p.branchName}</span>
                          <span className={`badge text-[10px] ${
                            p.status === "ready" ? "badge-success" :
                            p.status === "failed" ? "badge-error" : "badge-warning"
                          }`}>{p.status}</span>
                        </div>
                        {p.commitMessage && <p className="text-xs text-gray-500 mt-0.5">{p.commitMessage}</p>}
                      </div>
                    </div>
                    <a href={p.previewUrl} target="_blank"
                      className="text-xs text-brand-600 hover:text-brand-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-brand-200 transition-all">
                      Visit Preview
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p>Create a preview deployment for any branch or pull request</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}