"use client";
import { useState, useEffect } from "react";

export default function CloudflarePagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", projectName: "", domain: "", gitProvider: "github", gitRepo: "", buildCommand: "npm run build", buildOutputDir: "dist" });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/compute${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/pages").then(r => r.json()).then(d => setPages(d.pages || [])).catch(() => {}); }, []);

  const create = async () => {
    const d = await (await api("/pages", { method: "POST", body: JSON.stringify(form) })).json();
    setPages([...pages, d.page]);
    setForm({ name: "", projectName: "", domain: "", gitProvider: "github", gitRepo: "", buildCommand: "npm run build", buildOutputDir: "dist" });
  };

  const deploy = async (id: string) => {
    const d = await (await api(`/pages/${id}/deploy`, { method: "POST", body: JSON.stringify({ branch: "main" }) })).json();
    setPages(pages.map((p: any) => p.id === id ? d.page : p));
  };

  const deleteP = async (id: string) => {
    await api(`/pages/${id}`, { method: "DELETE" });
    setPages(pages.filter((p: any) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cloudflare Pages</h1>
          <p className="text-gray-500">Build and deploy frontend sites with git integration</p>
        </div>
      </div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">New Pages Project</h3>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Project Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Project Slug" value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Domain (optional)" value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <select value={form.gitProvider} onChange={e => setForm({ ...form, gitProvider: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="github">GitHub</option>
            <option value="gitlab">GitLab</option>
            <option value="bitbucket">Bitbucket</option>
          </select>
          <input placeholder="Git Repo (user/repo)" value={form.gitRepo} onChange={e => setForm({ ...form, gitRepo: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Build Command" value={form.buildCommand} onChange={e => setForm({ ...form, buildCommand: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Output Directory" value={form.buildOutputDir} onChange={e => setForm({ ...form, buildOutputDir: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <button onClick={create} className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">Create Project</button>
      </div>
      <div className="space-y-3">
        {pages.map((p: any) => (
          <div key={p.id} className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-xs text-gray-400">{p.projectName} · {p.gitRepo || "No repo"} · {p.domain || "No domain"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === "active" ? "bg-green-100 text-green-700" : p.status === "building" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => deploy(p.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">Deploy</button>
              <button onClick={() => deleteP(p.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">Delete</button>
            </div>
            {(p.deployments as any[])?.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-gray-500">Recent Deployments</p>
                {(p.deployments as any[]).slice(-3).reverse().map((d: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-gray-50 rounded">
                    <span>{d.branch} · {d.commit?.slice(0, 7) || "—"}</span>
                    <span className={`px-1.5 py-0.5 rounded ${d.status === "deployed" || d.status === "active" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{d.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {pages.length === 0 && <p className="text-center text-gray-400 py-8">No Pages projects yet.</p>}
      </div>
    </div>
  );
}
