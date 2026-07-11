"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const frameworks = [
  { name: "Next.js", icon: "N", color: "bg-black", lang: "TypeScript" },
  { name: "Node.js", icon: "N", color: "bg-green-600", lang: "JavaScript" },
  { name: "Python", icon: "Py", color: "bg-blue-600", lang: "Python" },
  { name: "PHP", icon: "PHP", color: "bg-indigo-600", lang: "PHP" },
  { name: "Ruby", icon: "Rb", color: "bg-red-600", lang: "Ruby" },
  { name: "Go", icon: "Go", color: "bg-cyan-600", lang: "Go" },
  { name: "Java", icon: "J", color: "bg-orange-600", lang: "Java" },
  { name: ".NET", icon: ".N", color: "bg-purple-600", lang: "C#" },
  { name: "Rust", icon: "Rs", color: "bg-stone-600", lang: "Rust" },
  { name: "Deno", icon: "D", color: "bg-gray-700", lang: "TypeScript" },
  { name: "Django", icon: "Dj", color: "bg-green-800", lang: "Python" },
  { name: "Laravel", icon: "L", color: "bg-red-700", lang: "PHP" },
  { name: "Flask", icon: "Fl", color: "bg-gray-600", lang: "Python" },
  { name: "Rails", icon: "R", color: "bg-rose-700", lang: "Ruby" },
  { name: "Spring", icon: "Sp", color: "bg-lime-700", lang: "Java" },
  { name: "Express", icon: "Ex", color: "bg-gray-800", lang: "JavaScript" },
  { name: "Vue/Nuxt", icon: "V", color: "bg-emerald-600", lang: "TypeScript" },
  { name: "Static Site", icon: "SS", color: "bg-amber-600", lang: "HTML/CSS" },
  { name: "Dockerfile", icon: "D", color: "bg-blue-700", lang: "Any" },
  { name: "WordPress", icon: "WP", color: "bg-blue-500", lang: "PHP" },
];

const buildTypes = [
  { value: "buildpack", label: "Auto-Detect (Buildpacks)", desc: "Heroku-style — we detect your framework automatically" },
  { value: "dockerfile", label: "Dockerfile", desc: "Bring your own Dockerfile for full control" },
  { value: "image", label: "Existing Image", desc: "Deploy from a public Docker image" },
  { value: "git", label: "Git Repository", desc: "Connect a GitHub/GitLab repo" },
];

export default function UniversalDeployPage() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [buildpacks, setBuildpacks] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", buildType: "buildpack", framework: "node", image: "", source: "", port: "3000", envVars: "{}", resources: "{\"cpu\":\"0.5\",\"memory\":\"512M\"}" });
  const [detected, setDetected] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [depRes, bpRes] = await Promise.all([
        fetch("http://localhost:3001/api/docker/deployments", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:3001/api/docker/buildpacks", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const depData = await depRes.json();
      const bpData = await bpRes.json();
      setDeployments(depData.deployments || []);
      setBuildpacks(bpData.buildpacks || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const deploy = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setLogs(["🚀 Starting deployment..."]);
    setShowForm(false);

    const res = await fetch("http://localhost:3001/api/docker/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        port: parseInt(form.port),
        envVars: JSON.parse(form.envVars),
        resources: JSON.parse(form.resources),
      }),
    });
    if (res.ok) {
      setLogs((prev: string[]) => [...prev, "✅ Deployment created! Refreshing..."]);
      setTimeout(() => { fetchData(); setLogs([]); }, 2000);
    } else {
      setLogs((prev: string[]) => [...prev, "❌ Deployment failed"]);
    }
  };

  const detectFramework = async () => {
    const token = localStorage.getItem("token");
    const files = ["package.json", "index.js", "requirements.txt", "main.py", "Dockerfile", "go.mod", "Cargo.toml", "composer.json", "Gemfile", "pom.xml", "index.html"];
    const res = await fetch("http://localhost:3001/api/docker/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ files }),
    });
    const data = await res.json();
    setDetected(data.detected || []);
  };

  const deleteDeployment = async (id: string) => {
    if (!confirm("Delete this deployment?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/docker/deployments/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchData();
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Universal Deploy</h1>
          <p className="text-gray-500">Deploy any app from any tech stack — auto-detect framework, Docker, or custom image</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); detectFramework(); }} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Deployment
        </button>
      </div>

      {logs.length > 0 && (
        <div className="card p-4 bg-gray-900 text-green-400 font-mono text-xs">
          {logs.map((l, i) => <p key={i}>{l}</p>)}
        </div>
      )}

      {showForm && (
        <form onSubmit={deploy} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">App Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="my-app" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Build Type</label>
              <select value={form.buildType} onChange={e => setForm({ ...form, buildType: e.target.value })} className="input-field">
                {buildTypes.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">{buildTypes.find(bt => bt.value === form.buildType)?.desc}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Framework / Language</label>
              <select value={form.framework} onChange={e => setForm({ ...form, framework: e.target.value })} className="input-field">
                <optgroup label="Auto-Detected">
                  {detected.map((bp: any) => <option key={bp.framework} value={bp.framework}>{bp.name} ({bp.language})</option>)}
                </optgroup>
                <optgroup label="All Frameworks">
                  {buildpacks.map((bp: any) => <option key={bp.framework} value={bp.framework}>{bp.name} ({bp.language})</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Port</label>
              <input value={form.port} onChange={e => setForm({ ...form, port: e.target.value })}
                className="input-field" placeholder="3000" />
            </div>
            {form.buildType === "image" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Docker Image</label>
                <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })}
                  className="input-field font-mono" placeholder="nginx:latest, node:20, python:3.12-slim" />
              </div>
            )}
            {(form.buildType === "git" || form.buildType === "buildpack" || form.buildType === "dockerfile") && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Source (Git URL or upload)</label>
                <input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                  className="input-field font-mono" placeholder="https://github.com/user/repo.git or drag & drop files" />
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium mb-2">Supported Frameworks</p>
            <div className="flex flex-wrap gap-2">
              {frameworks.map((fw) => (
                <button key={fw.name} type="button" onClick={() => setForm({ ...form, framework: fw.name.toLowerCase() })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.framework === fw.name.toLowerCase() ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}>
                  <span className={`w-4 h-4 rounded ${fw.color} flex items-center justify-center text-[8px] text-white font-bold`}>{fw.icon}</span>
                  {fw.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Environment Variables (JSON)</label>
              <textarea value={form.envVars} onChange={e => setForm({ ...form, envVars: e.target.value })}
                className="input-field font-mono text-xs" rows={3} placeholder='{"NODE_ENV": "production"}' />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Resources (JSON)</label>
              <input value={form.resources} onChange={e => setForm({ ...form, resources: e.target.value })}
                className="input-field font-mono text-xs" placeholder='{"cpu":"0.5","memory":"512M"}' />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center">Deploy App</button>
        </form>
      )}

      <div className="grid gap-4">
        {deployments.map((dep: any) => (
          <div key={dep.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{dep.name}</h3>
                  <span className="badge badge-info text-[10px]">{dep.framework}</span>
                  <span className={`badge text-[10px] ${dep.status === "running" ? "badge-success" : dep.status === "error" ? "badge-error" : "badge-warning"}`}>
                    {dep.status}
                  </span>
                </div>
                <a href={`https://${dep.url}`} target="_blank" className="text-sm text-brand-600 hover:text-brand-800">
                  {dep.url}
                </a>
                {dep.domain && <p className="text-xs text-gray-400 mt-0.5">Custom domain: {dep.domain}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>Build: {dep.buildType}</span>
                  <span>Port: {dep.port}</span>
                  <span>Replicas: {dep.replicas}</span>
                  <span>{(dep.resources as any)?.cpu} CPU / {(dep.resources as any)?.memory} RAM</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={async () => {
                  const token = localStorage.getItem("token");
                  await fetch(`http://localhost:3001/api/docker/deployments/${dep.id}/restart`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
                  fetchData();
                }} className="btn-secondary text-xs px-3 py-1.5">Restart</button>
                <button onClick={() => deleteDeployment(dep.id)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            {dep.logs && (dep.logs as any[]).length > 0 && (
              <div className="mt-3 bg-gray-900 rounded-lg p-3 max-h-32 overflow-y-auto">
                {(dep.logs as any[]).slice(-5).map((log: any, i: number) => (
                  <p key={i} className="text-xs font-mono text-green-400">
                    <span className="text-gray-500">{new Date(log.time).toLocaleTimeString()}</span> {log.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {deployments.length === 0 && !showForm && (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500 font-medium">No deployments yet</p>
            <p className="text-gray-400 text-sm mt-1">Deploy any app — Node, Python, PHP, Ruby, Go, Java, .NET, Rust, Docker, or static site</p>
          </div>
        </div>
      )}
    </div>
  );
}
