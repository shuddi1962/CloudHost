"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const frameworkIcons: Record<string, { color: string; icon: string }> = {
  "Next.js": { color: "bg-black", icon: "N" },
  "React": { color: "bg-blue-400", icon: "R" },
  "Node.js": { color: "bg-green-600", icon: "N" },
  "PHP": { color: "bg-indigo-600", icon: "P" },
  "Python": { color: "bg-blue-600", icon: "Py" },
  "Go": { color: "bg-cyan-600", icon: "G" },
  "Static Site": { color: "bg-amber-600", icon: "SS" },
  "Dockerfile": { color: "bg-blue-700", icon: "D" },
};

const statusStyles: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  running: { dot: "bg-green-500", bg: "bg-green-100", text: "text-green-700", label: "Ready" },
  ready: { dot: "bg-green-500", bg: "bg-green-100", text: "text-green-700", label: "Ready" },
  building: { dot: "bg-yellow-500", bg: "bg-yellow-100", text: "text-yellow-700", label: "Building" },
  stopped: { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600", label: "Stopped" },
  failed: { dot: "bg-red-500", bg: "bg-red-100", text: "text-red-700", label: "Error" },
  error: { dot: "bg-red-500", bg: "bg-red-100", text: "text-red-700", label: "Error" },
};

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", gitRepo: "", framework: "nextjs", buildCommand: "npm run build" });

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3001/api/deployments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDeployments(data.deployments || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

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

  if (loading) return <div className="text-center py-12 text-gray-400">Loading deployments...</div>;

  const getFramework = (dep: any) => {
    for (const [name, val] of Object.entries(frameworkIcons)) {
      if (dep.framework?.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(dep.framework?.toLowerCase())) {
        return { name, ...val };
      }
    }
    return { name: dep.framework || "App", color: "bg-gray-600", icon: (dep.framework?.[0] || "A").toUpperCase() };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deployments</h1>
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
              <select value={form.framework} onChange={e => setForm({ ...form, framework: e.target.value })} className="input-field">
                <option value="nextjs">Next.js</option>
                <option value="react">React</option>
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
        <div className="grid gap-3">
          {deployments.map((dep) => {
            const fw = getFramework(dep);
            const st = statusStyles[dep.status as keyof typeof statusStyles] || statusStyles.running;
            return (
              <Link key={dep.id} href={`/deployments/${dep.id}`} className="card p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${fw.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-sm font-bold">{fw.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm group-hover:text-brand-600 transition-colors">{dep.name}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      <span>{fw.name}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
                        </svg>
                        {dep.gitBranch || "main"}
                      </span>
                      {dep.url && <span className="text-gray-400">{dep.url}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={`https://${dep.url}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 border border-gray-200 hover:border-brand-200 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Visit
                    </a>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
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
    </div>
  );
}