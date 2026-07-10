"use client";

import { useState } from "react";

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", gitRepo: "", framework: "nextjs", buildCommand: "npm run build" });

  const createDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/deployments", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        projectId: "00000000-0000-0000-0000-000000000000",
        name: form.name,
        gitRepository: form.gitRepo,
        framework: form.framework,
        buildCommand: form.buildCommand,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setDeployments([...deployments, data.deployment]);
      setShowCreate(false);
      setForm({ name: "", gitRepo: "", framework: "nextjs", buildCommand: "npm run build" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hosting</h1>
          <p className="text-gray-500">Deploy Next.js apps, static sites, Node.js backends & PHP sites</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Deployment
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createDeployment} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">App Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="my-app" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Framework</label>
              <select value={form.framework} onChange={e => setForm({ ...form, framework: e.target.value })}
                className="input-field">
                <option value="nextjs">Next.js</option>
                <option value="static">Static Site (HTML/CSS/JS)</option>
                <option value="node">Node.js Backend</option>
                <option value="php">PHP Site</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Git Repository (optional)</label>
              <input value={form.gitRepo} onChange={e => setForm({ ...form, gitRepo: e.target.value })}
                className="input-field" placeholder="https://github.com/user/repo.git" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Build Command</label>
              <input value={form.buildCommand} onChange={e => setForm({ ...form, buildCommand: e.target.value })}
                className="input-field" placeholder="npm run build" />
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Deployment</button>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Supported Frameworks & Sites</h2>
        </div>
        <div className="card-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Next.js", desc: "React framework", badge: "SSR/SSG" },
            { name: "Static Sites", desc: "HTML, CSS, JS", badge: "Static" },
            { name: "Node.js", desc: "Express, Nest, etc", badge: "Backend" },
            { name: "PHP Sites", desc: "WordPress, Laravel", badge: "PHP" },
          ].map((f) => (
            <div key={f.name} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{f.name}</span>
                <span className="badge badge-info">{f.badge}</span>
              </div>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {deployments.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <p className="text-gray-500 font-medium">No deployments yet</p>
            <p className="text-gray-400 text-sm mt-1">Deploy your first app — Next.js, Node.js, PHP, or static site</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {deployments.map((dep) => (
            <div key={dep.id} className="card p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = `/dashboard/deployments/${dep.id}`}>
              <div>
                <p className="font-semibold hover:text-brand-600 transition-colors">{dep.name}</p>
                <p className="text-sm text-gray-500">Framework: {dep.framework}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${dep.status === "running" ? "badge-success" : dep.status === "failed" ? "badge-error" : "badge-warning"}`}>
                  {dep.status}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
