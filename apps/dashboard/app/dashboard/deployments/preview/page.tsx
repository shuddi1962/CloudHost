"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PreviewDeploymentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deploymentId = searchParams.get("deploymentId") || "00000000-0000-0000-0000-000000000000";
  const [previews, setPreviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ branchName: "", commitSha: "", commitMessage: "" });

  const fetchPreviews = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/preview-deployments/deployment/${deploymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPreviews(data.previews || []);
    setLoading(false);
  };

  useEffect(() => { fetchPreviews(); }, [deploymentId]);

  const createPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/preview-deployments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, deploymentId }),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ branchName: "", commitSha: "", commitMessage: "" });
      fetchPreviews();
    }
  };

  const rebuild = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/preview-deployments/${id}/rebuild`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPreviews();
  };

  const deletePreview = async (id: string) => {
    if (!confirm("Delete this preview deployment?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/preview-deployments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPreviews();
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading previews...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Preview Deployments</h1>
            <p className="text-gray-500">Deploy branches for preview before merging to production</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Preview
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createPreview} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Branch Name</label>
              <input value={form.branchName} onChange={e => setForm({ ...form, branchName: e.target.value })}
                className="input-field font-mono" placeholder="feature/new-ui" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commit SHA</label>
              <input value={form.commitSha} onChange={e => setForm({ ...form, commitSha: e.target.value })}
                className="input-field font-mono" placeholder="abc123def456" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commit Message</label>
              <input value={form.commitMessage} onChange={e => setForm({ ...form, commitMessage: e.target.value })}
                className="input-field" placeholder="Add new dashboard features" />
            </div>
          </div>
          <p className="text-xs text-gray-400">Preview URLs are automatically generated and expire after 7 days</p>
          <button type="submit" className="btn-primary">Create Preview</button>
        </form>
      )}

      <div className="space-y-3">
        {previews.map((p: any) => (
          <div key={p.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold font-mono text-sm">{p.branchName}</span>
                  <span className={`badge text-[10px] ${p.status === "ready" ? "badge-success" : p.status === "failed" ? "badge-error" : "badge-warning"}`}>
                    {p.status}
                  </span>
                </div>
                {p.commitMessage && <p className="text-sm text-gray-600 mb-1">{p.commitMessage}</p>}
                {p.commitSha && <code className="text-xs text-gray-400">{p.commitSha?.substring(0, 8)}</code>}
                <div className="mt-2">
                  <a href={`https://${p.previewUrl}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {p.previewUrl}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {p.status !== "building" && (
                  <button onClick={() => rebuild(p.id)} className="btn-secondary text-xs px-3 py-1.5">Rebuild</button>
                )}
                <button onClick={() => deletePreview(p.id)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            {p.expiresAt && (
              <div className="mt-3 text-xs text-gray-400">
                Expires {new Date(p.expiresAt).toLocaleDateString()} ({Math.ceil((new Date(p.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining)
              </div>
            )}
          </div>
        ))}
      </div>

      {previews.length === 0 && !showCreate && (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <p className="text-gray-500 font-medium">No preview deployments</p>
            <p className="text-gray-400 text-sm mt-1">Create preview deployments for feature branches and pull requests</p>
          </div>
        </div>
      )}
    </div>
  );
}
