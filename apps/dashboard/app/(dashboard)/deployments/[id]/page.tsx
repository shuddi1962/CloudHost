"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function DeploymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [deployment, setDeployment] = useState<any>(null);
  const [previews, setPreviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"logs" | "domains" | "env" | "previews">("logs");
  const [buildLogs, setBuildLogs] = useState<string[]>([
    "[00:00:01] Cloning repository...",
    "[00:00:03] Installing dependencies...",
    "[00:00:15] Running build command: npm run build",
    "[00:00:18] ✓ Build completed successfully",
    "[00:00:19] Deploying to edge network...",
    "[00:00:21] ✓ Deployment ready",
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3001/api/deployments/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      setDeployment(data.deployment);
    }).finally(() => setLoading(false));

    fetch(`http://localhost:3001/api/preview-deployments/deployment/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      setPreviews(data.previews || []);
    });
  }, [params.id]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading deployment...</div>;
  if (!deployment) return <div className="text-center py-12 text-gray-400">Deployment not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/deployments")} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">{deployment.name}</h1>
            <p className="text-gray-500">{deployment.framework}</p>
          </div>
          <span className={`badge ${deployment.status === "running" ? "badge-success" : deployment.status === "failed" ? "badge-error" : "badge-warning"}`}>
            {deployment.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={async () => {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:3001/api/deployments/${params.id}/deploy`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
            alert("Deployment triggered!");
          }} className="btn-primary text-sm">Redeploy</button>
          <button className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Visit Site
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Framework", value: deployment.framework },
          { label: "Branch", value: deployment.gitBranch || "main" },
          { label: "Build Command", value: deployment.buildCommand || "npm run build" },
          { label: "Output Dir", value: deployment.outputDirectory || "out" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-sm font-medium mt-1 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {[
            { key: "logs", label: "Build Logs", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
            { key: "domains", label: "Domains", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
            { key: "env", label: "Environment", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
            { key: "previews", label: "Preview Deployments", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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

      <div className="card">
        <div className="card-body">
          {activeTab === "logs" && (
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs max-h-96 overflow-y-auto">
              {buildLogs.map((log, i) => (
                <div key={i} className="flex gap-3 mb-1.5">
                  <span className="text-gray-500 w-20 flex-shrink-0">{log.split("]")[0]}]</span>
                  <span className={log.includes("Error") || log.includes("Failed") ? "text-red-400" : log.includes("✓") ? "text-green-400" : "text-gray-300"}>
                    {log.split("]").slice(1).join("]").trim()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "domains" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm">{deployment.name}.cloudhost.app</p>
                  <p className="text-xs text-gray-500">Default CloudHost domain</p>
                </div>
                <span className="badge badge-success">Active</span>
              </div>
              <p className="text-sm text-gray-500 text-center py-4">
                <Link href="/domains" className="text-brand-600 hover:text-brand-800 font-medium">Add a custom domain</Link> to point to this deployment
              </p>
            </div>
          )}

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
                      <code className="text-sm font-mono">{key}</code>
                      <code className="text-sm font-mono text-gray-500">********</code>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No environment variables configured</p>
              )}
            </div>
          )}

          {activeTab === "previews" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Preview Deployments</p>
                <Link href={`/deployments/preview?deploymentId=${params.id}`} className="btn-primary text-xs px-3 py-1.5">
                  + New Preview
                </Link>
              </div>
              {previews.length > 0 ? (
                previews.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{p.branchName}</span>
                        <span className={`badge text-[10px] ${p.status === "ready" ? "badge-success" : p.status === "failed" ? "badge-error" : "badge-warning"}`}>
                          {p.status}
                        </span>
                      </div>
                      {p.commitMessage && <p className="text-xs text-gray-500 mt-0.5">{p.commitMessage}</p>}
                      <a href={p.previewUrl} target="_blank" className="text-xs text-brand-600 hover:text-brand-800 mt-1 inline-block">{p.previewUrl}</a>
                    </div>
                    <div className="text-xs text-gray-400">
                      {p.expiresAt ? `Expires ${new Date(p.expiresAt).toLocaleDateString()}` : ""}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  Create a preview deployment for any branch or pull request
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {deployment.gitRepository && (
        <div className="card p-5">
          <p className="text-sm text-gray-500">Git Repository</p>
          <div className="flex items-center gap-2 mt-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <code className="text-sm">{deployment.gitRepository}</code>
            <span className="text-gray-400">|</span>
            <code className="text-sm">{deployment.gitBranch || "main"}</code>
          </div>
        </div>
      )}
    </div>
  );
}
