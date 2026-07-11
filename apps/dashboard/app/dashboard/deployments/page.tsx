"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const statusStyles: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  pending: { dot: "bg-yellow-500", bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
  building: { dot: "bg-blue-500", bg: "bg-blue-100", text: "text-blue-700", label: "Building" },
  running: { dot: "bg-green-500", bg: "bg-green-100", text: "text-green-700", label: "Running" },
  ready: { dot: "bg-green-500", bg: "bg-green-100", text: "text-green-700", label: "Ready" },
  failed: { dot: "bg-red-500", bg: "bg-red-100", text: "text-red-700", label: "Failed" },
  error: { dot: "bg-red-500", bg: "bg-red-100", text: "text-red-700", label: "Failed" },
  stopped: { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600", label: "Stopped" },
};

const typeStyles: Record<string, string> = {
  git: "bg-purple-100 text-purple-700",
  upload: "bg-blue-100 text-blue-700",
  "quick-install": "bg-green-100 text-green-700",
};

const demoDeployments = [
  { id: "1", name: "acme-website", type: "git", framework: "Next.js", status: "running", domain: "acme-website.cloudhost.app", created: "2026-07-10T10:00:00Z" },
  { id: "2", name: "ecommerce-store", type: "git", framework: "React", status: "building", domain: "store.cloudhost.app", created: "2026-07-09T15:30:00Z" },
  { id: "3", name: "wp-blog", type: "quick-install", framework: "WordPress", status: "ready", domain: "blog.cloudhost.app", created: "2026-07-08T09:00:00Z" },
  { id: "4", name: "api-backend", type: "upload", framework: "Node.js", status: "failed", domain: "api.cloudhost.app", created: "2026-07-07T14:00:00Z" },
  { id: "5", name: "laravel-app", type: "git", framework: "Laravel", status: "stopped", domain: "laravel.cloudhost.app", created: "2026-07-06T11:00:00Z" },
  { id: "6", name: "landing-page", type: "upload", framework: "Static HTML", status: "ready", domain: "landing.cloudhost.app", created: "2026-07-05T08:00:00Z" },
];

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeployments = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3001/api/deployments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDeployments(data.deployments || []);
    } catch {
      setDeployments(demoDeployments);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDeployments(); }, []);

  const handleDeploy = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3001/api/deployments/${id}/deploy`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDeployments();
    } catch {
      alert("Deploy triggered (demo mode)");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this deployment?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3001/api/deployments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDeployments();
    } catch {
      setDeployments(deployments.filter((d: any) => d.id !== id));
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading deployments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deployments</h1>
          <p className="text-gray-500">Manage your app deployments — upload files, quick install, or connect a Git repository</p>
        </div>
        <Link href="/dashboard/deployments/create" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Deployment
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Framework</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Created</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deployments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <p className="font-medium">No deployments yet</p>
                    <p className="text-sm mt-1">Create your first deployment to get started</p>
                  </td>
                </tr>
              ) : (
                deployments.map((dep: any) => {
                  const st = statusStyles[dep.status as string] || statusStyles.running;
                  const typeLabel = dep.type === "quick-install" ? "Quick Install" : dep.type === "git" ? "Git" : "Upload";
                  const typeClass = typeStyles[dep.type as string] || "bg-gray-100 text-gray-600";
                  return (
                    <tr key={dep.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-4">
                        <Link href={`/dashboard/deployments/${dep.id}`} className="font-medium text-gray-900 hover:text-brand-600 transition-colors">
                          {dep.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${typeClass}`}>
                          {typeLabel}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{dep.framework}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <a href={`https://${dep.domain || dep.url}`} target="_blank" rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-800 text-xs font-medium truncate max-w-[160px] block">
                          {dep.domain || dep.url || "-"}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs">
                        {new Date(dep.created || dep.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleDeploy(dep.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                            title="Deploy">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <Link href={`/dashboard/deployments/${dep.id}?tab=logs`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                            title="View Logs">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </Link>
                          <Link href={`/dashboard/deployments/${dep.id}?tab=edit`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                            title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button onClick={() => handleDelete(dep.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Delete">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
