"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

function getStatusStyle(status: string) {
  switch (status) {
    case "running": case "ready": return { dot: "bg-green-500", bg: "bg-green-100", text: "text-green-700", label: "Running" };
    case "building": return { dot: "bg-yellow-500", bg: "bg-yellow-100", text: "text-yellow-700", label: "Building" };
    case "pending": return { dot: "bg-yellow-500", bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" };
    case "stopped": return { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600", label: "Stopped" };
    case "failed": case "error": return { dot: "bg-red-500", bg: "bg-red-100", text: "text-red-700", label: "Failed" };
    default: return { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600", label: status };
  }
}

const demoBuildLog = `[00:00:01] Cloning repository: https://github.com/acme/website.git
[00:00:03] Checking framework: Next.js detected
[00:00:04] Using Node.js 20.x
[00:00:05] Installing dependencies...
[00:00:08] npm install completed (142 packages)
[00:00:10] Running build command: npm run build
[00:00:12] ✓ Linting and checking validity of types
[00:00:14] ✓ Creating optimized production build
[00:00:16] ✓ Generating static pages (5/5)
[00:00:17] ✓ Collecting build traces
[00:00:18] ✓ Build completed in 17.2s
[00:00:19] Deploying to edge network...
[00:00:20] Uploading static assets (2.4 MB)
[00:00:21] ✓ Deployment ready at acme-website.cloudhost.app`;

const demoEnv: Record<string, string> = {
  NODE_ENV: "production",
  NEXT_PUBLIC_API_URL: "https://api.cloudhost.app",
  DATABASE_URL: "postgresql://...",
};

export default function DeploymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [deployment, setDeployment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "env">("overview");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    if (!params?.id) return;
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`http://localhost:3001/api/deployments/${id}`, { headers })
      .then(r => r.json())
      .then(data => {
        const dep = data.deployment;
        setDeployment(dep);
        setEditForm({
          name: dep?.name || "",
          buildCommand: dep?.buildCommand || "npm run build",
          outputDirectory: dep?.outputDirectory || ".next",
          installCommand: dep?.installCommand || "npm install",
        });
      })
      .catch(() => {
        setDeployment({
          id: id,
          name: "acme-website",
          type: "git",
          framework: "Next.js",
          status: "building",
          domain: "acme-website.cloudhost.app",
          url: "acme-website.cloudhost.app",
          gitBranch: "main",
          gitRepository: "https://github.com/acme/website.git",
          buildCommand: "npm run build",
          outputDirectory: ".next",
          installCommand: "npm install",
          environment: demoEnv,
          buildLog: demoBuildLog,
          createdAt: "2026-07-10T10:00:00Z",
        });
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading deployment...</div>;
  if (!deployment) return <div className="text-center py-12 text-gray-400">Deployment not found</div>;

  const st = getStatusStyle(deployment.status);
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const handleDeploy = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3001/api/deployments/${id}/deploy`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      alert("Deployment triggered!");
    } catch {
      alert("Deploy triggered (demo mode)");
    }
  };

  const handleStop = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3001/api/deployments/${id}/stop`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      alert("Deployment stopped!");
    } catch {
      alert("Stop triggered (demo mode)");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this deployment?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3001/api/deployments/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/dashboard/deployments");
    } catch {
      router.push("/dashboard/deployments");
    }
  };

  const handleEditSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3001/api/deployments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      setDeployment({ ...deployment, ...editForm });
      setEditMode(false);
    } catch {
      setDeployment({ ...deployment, ...editForm });
      setEditMode(false);
    }
  };

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
                {deployment.status === "building" ? (
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                )}
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
          {(deployment.status !== "running" && deployment.status !== "ready") && (
            <button onClick={handleDeploy} className="btn-primary text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Deploy
            </button>
          )}
          {(deployment.status === "running" || deployment.status === "ready") && (
            <button onClick={handleStop} className="btn-secondary text-sm flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop
            </button>
          )}
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 p-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Deployment info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Framework", value: deployment.framework, icon: "M8 9l3 3-3 3m5 0h3" },
          { label: "Branch", value: deployment.gitBranch || "main", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
          { label: "Domain", value: deployment.domain || deployment.url || "-", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9" },
          { label: "Type", value: deployment.type === "quick-install" ? "Quick Install" : deployment.type === "git" ? "Git" : "Upload", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {[
            { key: "overview", label: "Overview" },
            { key: "logs", label: "Build Logs" },
            { key: "env", label: "Environment" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Details</h3>
                <button onClick={() => setEditMode(!editMode)}
                  className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>
              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Name</label>
                    <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Build Command</label>
                    <input value={editForm.buildCommand} onChange={e => setEditForm({ ...editForm, buildCommand: e.target.value })}
                      className="input-field text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Output Directory</label>
                    <input value={editForm.outputDirectory} onChange={e => setEditForm({ ...editForm, outputDirectory: e.target.value })}
                      className="input-field text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Install Command</label>
                    <input value={editForm.installCommand} onChange={e => setEditForm({ ...editForm, installCommand: e.target.value })}
                      className="input-field text-sm font-mono" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleEditSave} className="btn-primary text-xs px-4 py-1.5">Save</button>
                    <button onClick={() => setEditMode(false)} className="btn-secondary text-xs px-4 py-1.5">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Name", value: deployment.name },
                    { label: "Build Command", value: deployment.buildCommand || "npm run build", mono: true },
                    { label: "Output Directory", value: deployment.outputDirectory || ".next", mono: true },
                    { label: "Install Command", value: deployment.installCommand || "npm install", mono: true },
                    { label: "Created", value: new Date(deployment.createdAt).toLocaleString() },
                    { label: "Git Repository", value: deployment.gitRepository || "-", mono: true },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-xs text-gray-500">{f.label}</p>
                      <p className={`text-sm font-medium mt-0.5 ${f.mono ? "font-mono" : ""}`}>{f.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Domain / URL */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-4">Domain / URL</h3>
              {deployment.domain || deployment.url ? (
                <a href={`https://${deployment.domain || deployment.url}`} target="_blank"
                  className="flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {deployment.domain || deployment.url}
                </a>
              ) : (
                <p className="text-sm text-gray-400">No domain assigned yet</p>
              )}
            </div>
          </div>
        )}

        {/* Build Logs */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Build Log</p>
              <span className="text-xs text-gray-400">Last 50 lines</span>
            </div>
            <pre className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
              {deployment.buildLog || demoBuildLog}
            </pre>
          </div>
        )}

        {/* Environment */}
        {activeTab === "env" && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Environment Variables</p>
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
      </div>
    </div>
  );
}
