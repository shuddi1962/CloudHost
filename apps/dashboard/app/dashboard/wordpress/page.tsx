"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const statusStyles: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  building: { dot: "bg-blue-500", bg: "bg-blue-100", text: "text-blue-700", label: "Building" },
  running: { dot: "bg-green-500", bg: "bg-green-100", text: "text-green-700", label: "Running" },
  failed: { dot: "bg-red-500", bg: "bg-red-100", text: "text-red-700", label: "Failed" },
  stopping: { dot: "bg-yellow-500", bg: "bg-yellow-100", text: "text-yellow-700", label: "Stopping" },
  stopped: { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600", label: "Stopped" },
};

const demoSites = [
  { id: "1", name: "My Blog", domain: "myblog.cloudhost.app", wordpressVersion: "6.7", status: "running", adminUrl: "https://myblog.cloudhost.app/wp-admin", php: "8.2", mysql: "8.0", region: "us-east-1" },
  { id: "2", name: "Ecommerce Store", domain: "store.cloudhost.app", wordpressVersion: "6.6", status: "building", adminUrl: "https://store.cloudhost.app/wp-admin", php: "8.1", mysql: "8.0", region: "eu-west-1" },
  { id: "3", name: "Portfolio Site", domain: "portfolio.cloudhost.app", wordpressVersion: "6.7", status: "failed", adminUrl: "https://portfolio.cloudhost.app/wp-admin", php: "8.2", mysql: "8.0", region: "us-west-1" },
  { id: "4", name: "Agency Website", domain: "agency.cloudhost.app", wordpressVersion: "6.5", status: "running", adminUrl: "https://agency.cloudhost.app/wp-admin", php: "8.0", mysql: "8.0", region: "ap-southeast-1" },
];

export default function WordPressPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSites = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wordpress/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = data.deployments?.filter((d: any) => d.framework === "wordpress") || data.sites || [];
      if (list.length > 0) setSites(list); else setSites(demoSites);
    } catch {
      setSites(demoSites);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSites(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this WordPress site? This action cannot be undone.")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wordpress/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSites(sites.filter((s: any) => s.id !== id));
    } catch {
      setSites(sites.filter((s: any) => s.id !== id));
    }
  };

  const handleAction = async (id: string, action: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wordpress/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSites(sites.map((s: any) => s.id === id ? { ...s, ...data.site } : s));
      }
    } catch {
      alert(`${action} triggered (demo mode)`);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading WordPress sites...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WordPress Management</h1>
          <p className="text-gray-500">Install and manage your WordPress sites</p>
        </div>
        <Link href="/dashboard/wordpress/create" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Site
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Site Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">WP Version</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Admin URL</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 12a1 1 0 000 2h6a1 1 0 100-2H9z" />
                    </svg>
                    <p className="font-medium">No WordPress sites yet</p>
                    <p className="text-sm mt-1">Create your first WordPress site to get started</p>
                    <Link href="/dashboard/wordpress/create" className="btn-primary mt-4 inline-flex text-sm">Create Site</Link>
                  </td>
                </tr>
              ) : (
                sites.map((site: any) => {
                  const st = statusStyles[site.status as string] || statusStyles.running;
                  return (
                    <tr key={site.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900">{site.name}</span>
                      </td>
                      <td className="px-4 py-4">
                        <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-800 text-xs font-medium truncate max-w-[160px] block">
                          {site.domain || "-"}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{site.wordpressVersion || site.wpVersion || "6.7"}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <a href={site.adminUrl || `https://${site.domain}/wp-admin`} target="_blank" rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-800 text-xs font-medium">
                          {site.adminUrl ? "Visit Admin" : "/wp-admin"}
                        </a>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <a href={site.adminUrl || `https://${site.domain}/wp-admin`} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                            title="Visit Admin">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <button onClick={() => router.push(`/dashboard/wordpress/${site.id}/edit`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                            title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(site.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Delete">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button onClick={() => router.push(`/dashboard/wordpress/${site.id}/plugins`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
                            title="Manage Plugins">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
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

      {sites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-sm text-gray-500">Total Sites</p>
            <p className="text-2xl font-bold">{sites.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Running</p>
            <p className="text-2xl font-bold text-green-600">{sites.filter((s: any) => s.status === "running").length}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Building</p>
            <p className="text-2xl font-bold text-blue-600">{sites.filter((s: any) => s.status === "building").length}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-red-600">{sites.filter((s: any) => s.status === "failed").length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
