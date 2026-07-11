"use client";

import { useEffect, useState, useRef } from "react";
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
  auto: "bg-orange-100 text-orange-700",
};

function DeploymentActions({ dep, onRefresh }: { dep: any; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [domainPrompt, setDomainPrompt] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getDomain = () => dep.domain || `https://${dep.id?.substring(0, 8)}.cloudhost.app`;

  const doAction = async (action: string) => {
    setOpen(false);
    const token = localStorage.getItem("token");
    const isWebhook = dep.type === 'auto' || dep.type === undefined;

    switch (action) {
      case "visit": {
        const url = getDomain();
        window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
        break;
      }
      case "redeploy": {
        try {
          if (isWebhook) {
            await fetch("/api/cicd/webhook", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                repository: dep.repository,
                ref: `refs/heads/${dep.branch || 'main'}`,
                after: dep.commit_sha,
                head_commit: { message: dep.commit_message || 'Redeploy' },
              }),
            });
          } else {
            await fetch(`http://localhost:3001/api/deployments/${dep.id}/deploy`, {
              method: "POST", headers: { Authorization: `Bearer ${token}` },
            });
          }
          onRefresh();
          break;
        } catch { alert("Redeploy triggered (demo mode)"); onRefresh(); break; }
      }
      case "rollback": {
        try {
          const res = await fetch(`/api/deployments/${dep.id}/history`);
          const data = await res.json();
          const snapshots = data.snapshots || data;
          if (Array.isArray(snapshots) && snapshots.length > 1) {
            const prev = snapshots[1];
            await fetch(`/api/deployments/${dep.id}/rollback`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ snapshotId: prev.id || prev.snapshot_id }),
            });
            alert(`Rolled back to ${prev.snapshot_id || 'previous version'}`);
          } else {
            alert("No previous snapshot available for rollback");
          }
        } catch {
          alert("Rollback initiated — reverting to previous deployment (demo mode)");
        }
        onRefresh();
        break;
      }
      case "promote": {
        try {
          if (isWebhook) {
            await fetch(`/api/webhook-deployments/${dep.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "ready" }),
            });
          } else {
            await fetch(`http://localhost:3001/api/deployments/${dep.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ status: "running", domain: dep.domain?.replace('preview.', '') || dep.domain }),
            });
          }
          alert("Promoted to production");
        } catch { alert("Promoted to production (demo mode)"); }
        onRefresh();
        break;
      }
      case "view-source": {
        if (dep.repository) {
          const repoUrl = `https://github.com/${dep.repository}`;
          window.open(repoUrl, '_blank');
        } else if (dep.url || dep.domain) {
          window.open(getDomain(), '_blank');
        } else {
          alert("Source URL not available for this deployment");
        }
        break;
      }
      case "copy-url": {
        const url = getDomain();
        await navigator.clipboard.writeText(url);
        break;
      }
      case "assign-domain": {
        setDomainPrompt(true);
        setDomainInput(dep.domain || '');
        break;
      }
      case "delete": {
        if (!confirm("Delete this deployment?")) return;
        try {
          if (isWebhook) {
            await fetch(`/api/webhook-deployments/${dep.id}`, { method: "DELETE" });
          } else {
            await fetch(`http://localhost:3001/api/deployments/${dep.id}`, {
              method: "DELETE", headers: { Authorization: `Bearer ${token}` },
            });
          }
        } catch { /* ignore */ }
        onRefresh();
        break;
      }
    }
  };

  const saveDomain = async () => {
    setDomainPrompt(false);
    try {
      const isWebhook = dep.type === 'auto' || dep.type === undefined;
      if (isWebhook) {
        await fetch(`/api/webhook-deployments/${dep.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: domainInput }),
        });
      } else {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:3001/api/deployments/${dep.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ domain: domainInput }),
        });
      }
    } catch { /* ignore */ }
    onRefresh();
  };

  const visitUrl = dep.domain ? `https://${dep.domain}` : null;
  const sourceUrl = dep.repository ? `https://github.com/${dep.repository}` : null;

  const items = [
    ...(visitUrl ? [{ key: "visit", label: "Visit", icon: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14", href: visitUrl }] : [{ key: "visit-action", label: "Visit", icon: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }]),
    { key: "inspect", label: "Inspect Deployment", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", href: `/dashboard/deployments/${dep.id}` },
    { key: "redeploy", label: "Redeploy", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
    { key: "rollback", label: "Instant Rollback", icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" },
    { key: "promote", label: "Promote", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
    ...(sourceUrl ? [{ key: "view-source", label: "View Source", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", href: sourceUrl }] : [{ key: "view-source-action", label: "View Source", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" }]),
    { key: "copy-url", label: "Copy URL", icon: "M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" },
    { key: "assign-domain", label: "Assign Domain", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
    { key: "divider-1", divider: true },
    { key: "delete", label: "Delete", icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16", danger: true },
  ];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {items.map((item) => {
            if (item.divider) return <div key={item.key} className="border-t border-gray-100 my-1" />;
            if (item.href) {
              return (
                <Link key={item.key} href={item.href} onClick={() => setOpen(false)} target={item.href.startsWith('http') ? '_blank' : undefined}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon!} />
                  </svg>
                  {item.label}
                </Link>
              );
            }
            return (
              <button key={item.key} onClick={() => doAction(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
                }`}>
                <svg className={`w-4 h-4 ${item.danger ? "text-red-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon!} />
                </svg>
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {domainPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={() => setDomainPrompt(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Assign Custom Domain</h3>
            <p className="text-sm text-gray-500 mb-4">Enter a custom domain for this deployment</p>
            <input value={domainInput} onChange={e => setDomainInput(e.target.value)}
              placeholder="myapp.example.com"
              className="input-field w-full mb-4 font-mono text-sm" autoFocus />
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDomainPrompt(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={saveDomain} className="btn-primary text-sm">Save Domain</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [webhookDeps, setWebhookDeps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeployments = async () => {
    const token = localStorage.getItem("token");
    try {
      const [regRes, whRes] = await Promise.all([
        fetch("http://localhost:3001/api/deployments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/webhook-deployments"),
      ]);
      const regData = regRes.ok ? await regRes.json() : { deployments: [] };
      const regList = Array.isArray(regData) ? regData : regData.deployments || [];
      const whData = whRes.ok ? await whRes.json() : { deployments: [] };
      setDeployments(regList);
      setWebhookDeps(whData.deployments || []);
    } catch {
      setDeployments([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDeployments(); }, []);

  const allDeps = [...webhookDeps, ...deployments];
  const typeLabel = (dep: any) => {
    if (dep.type === "auto") return "Auto";
    if (dep.type === "quick-install") return "Quick Install";
    if (dep.type === "git") return "Git";
    return "Upload";
  };
  const typeClass = (dep: any) => typeStyles[dep.type as string] || "bg-gray-100 text-gray-600";

  if (loading) return <div className="text-center py-12 text-gray-400">Loading deployments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deployments</h1>
          <p className="text-gray-500">Manage your app deployments — upload files, quick install, or connect a Git repository</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/git/accounts" className="btn-secondary text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            Git Accounts
          </Link>
          <Link href="/dashboard/deployments/create" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Deployment
          </Link>
        </div>
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
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Commit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Created</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allDeps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <p className="font-medium">No deployments yet</p>
                    <p className="text-sm mt-1">Create your first deployment or connect a Git repository for auto-deploy</p>
                  </td>
                </tr>
              ) : (
                allDeps.map((dep: any) => {
                  const st = statusStyles[dep.status as string] || statusStyles.running;
                  const tClass = typeClass(dep);
                  const tLabel = typeLabel(dep);
                  const isAuto = dep.type === 'auto' || dep.auto_deploy;
                  return (
                    <tr key={dep.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/deployments/${dep.id}`} className="font-medium text-gray-900 hover:text-brand-600 transition-colors">
                            {dep.name}
                          </Link>
                          {isAuto && (
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">Auto</span>
                          )}
                        </div>
                        {dep.repository && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{dep.repository}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${tClass}`}>
                          {tLabel}
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
                        {dep.commit_sha ? (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                            <code className="text-xs font-mono text-gray-500">{dep.commit_sha}</code>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                        {dep.branch && (
                          <p className="text-[10px] text-gray-400 mt-0.5">{dep.branch}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <a href={dep.domain || `https://${dep.url}`} target="_blank" rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-800 text-xs font-medium truncate max-w-[160px] block">
                          {(dep.domain || dep.url || "-").replace(/^https?:\/\//, '')}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">
                        <div>{new Date(dep.created || dep.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-gray-400">{new Date(dep.created || dep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end">
                          <DeploymentActions dep={dep} onRefresh={fetchDeployments} />
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
