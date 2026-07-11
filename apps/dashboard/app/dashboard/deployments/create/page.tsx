"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const frameworks = [
  { value: "custom", label: "Custom" },
  { value: "nextjs", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "nuxt", label: "Nuxt" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
  { value: "express", label: "Express" },
  { value: "django", label: "Django" },
  { value: "flask", label: "Flask" },
  { value: "laravel", label: "Laravel" },
  { value: "wordpress", label: "WordPress" },
  { value: "static", label: "Static HTML" },
  { value: "node", label: "Node.js" },
  { value: "php", label: "PHP" },
];

const regions = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-west-1", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "EU West (Ireland)" },
  { value: "eu-central-1", label: "EU Central (Frankfurt)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
];

const plans = [
  { value: "starter", label: "Starter — $10/mo" },
  { value: "pro", label: "Pro — $29/mo" },
  { value: "business", label: "Business — $79/mo" },
];

const nodeVersions = ["16", "18", "20", "22"];
const phpVersions = ["7.4", "8.0", "8.1", "8.2", "8.3"];

const frameworkDefaults: Record<string, { buildCommand: string; outputDir: string; installCommand: string }> = {
  nextjs: { buildCommand: "npm run build", outputDir: ".next", installCommand: "npm install" },
  react: { buildCommand: "npm run build", outputDir: "build", installCommand: "npm install" },
  vue: { buildCommand: "npm run build", outputDir: "dist", installCommand: "npm install" },
  nuxt: { buildCommand: "npm run build", outputDir: ".output", installCommand: "npm install" },
  svelte: { buildCommand: "npm run build", outputDir: "build", installCommand: "npm install" },
  angular: { buildCommand: "npm run build", outputDir: "dist", installCommand: "npm install" },
  express: { buildCommand: "", outputDir: "", installCommand: "npm install" },
  django: { buildCommand: "", outputDir: "", installCommand: "pip install -r requirements.txt" },
  flask: { buildCommand: "", outputDir: "", installCommand: "pip install -r requirements.txt" },
  laravel: { buildCommand: "", outputDir: "public", installCommand: "composer install" },
  wordpress: { buildCommand: "", outputDir: "", installCommand: "" },
  static: { buildCommand: "", outputDir: "", installCommand: "" },
  node: { buildCommand: "", outputDir: "", installCommand: "npm install" },
  php: { buildCommand: "", outputDir: "", installCommand: "composer install" },
};

const quickInstallApps = [
  { id: "wordpress", name: "WordPress", desc: "Blog & CMS", icon: "WP" },
  { id: "laravel", name: "Laravel", desc: "PHP Framework", icon: "L" },
  { id: "nextjs", name: "Next.js", desc: "React Framework", icon: "N" },
  { id: "react", name: "React", desc: "UI Library", icon: "R" },
  { id: "node", name: "Node.js", desc: "JavaScript Runtime", icon: "N" },
  { id: "express", name: "Express", desc: "Node.js Framework", icon: "Ex" },
  { id: "django", name: "Django", desc: "Python Framework", icon: "Dj" },
  { id: "flask", name: "Flask", desc: "Python Microframework", icon: "Fl" },
  { id: "static", name: "Static HTML", desc: "HTML/CSS/JS", icon: "SS" },
];

export default function CreateDeploymentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "quick-install" | "git">("upload");
  const [dragging, setDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    framework: "nextjs",
    region: "us-east-1",
    plan: "starter",
  });

  const [buildSettings, setBuildSettings] = useState({
    buildCommand: "npm run build",
    outputDirectory: ".next",
    installCommand: "npm install",
    nodeVersion: "20",
    phpVersion: "8.2",
  });

  const [showBuildSettings, setShowBuildSettings] = useState(false);

  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([
    { key: "NODE_ENV", value: "production" },
  ]);

  const [gitUrl, setGitUrl] = useState("");
  const [gitBranch, setGitBranch] = useState("main");
  const [gitAuth, setGitAuth] = useState<"ssh" | "token">("token");
  const [gitToken, setGitToken] = useState("");

  const updateFramework = (fw: string) => {
    setForm({ ...form, framework: fw });
    const defaults = frameworkDefaults[fw];
    if (defaults) {
      setBuildSettings({
        ...buildSettings,
        buildCommand: defaults.buildCommand,
        outputDirectory: defaults.outputDir,
        installCommand: defaults.installCommand,
      });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile({ name: file.name, size: file.size, type: file.type });
      if (!form.name) setForm({ ...form, name: file.name.replace(/\.[^.]+$/, "") });
    }
  }, [form]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({ name: file.name, size: file.size, type: file.type });
      if (!form.name) setForm({ ...form, name: file.name.replace(/\.[^.]+$/, "") });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const addEnvVar = () => setEnvVars([...envVars, { key: "", value: "" }]);
  const removeEnvVar = (i: number) => setEnvVars(envVars.filter((_, idx) => idx !== i));
  const updateEnvVar = (i: number, field: "key" | "value", val: string) => {
    const updated = [...envVars];
    updated[i][field] = val;
    setEnvVars(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      let deploymentId: string | null = null;

      if (activeTab === "upload") {
        const fd = new FormData();
        if (fileInputRef.current?.files?.[0]) fd.append("file", fileInputRef.current.files[0]);
        fd.append("name", form.name);
        fd.append("framework", form.framework);
        fd.append("region", form.region);
        fd.append("plan", form.plan);
        fd.append("buildCommand", buildSettings.buildCommand);
        fd.append("outputDirectory", buildSettings.outputDirectory);
        fd.append("installCommand", buildSettings.installCommand);
        fd.append("nodeVersion", buildSettings.nodeVersion);
        fd.append("phpVersion", buildSettings.phpVersion);
        fd.append("environment", JSON.stringify(Object.fromEntries(envVars.filter(e => e.key).map(e => [e.key, e.value]))));

        const res = await fetch("http://localhost:3001/api/deployments/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          deploymentId = data.deployment?.id || data.id;
        } else {
          alert("Upload failed. Using demo mode — redirecting.");
          router.push("/dashboard/deployments");
          return;
        }
      } else if (activeTab === "quick-install") {
        const res = await fetch("http://localhost:3001/api/deployments", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            projectId: "00000000-0000-0000-0000-000000000000",
            name: form.name,
            type: "quick-install",
            framework: form.framework,
            region: form.region,
            plan: form.plan,
            buildCommand: buildSettings.buildCommand,
            outputDirectory: buildSettings.outputDirectory,
            installCommand: buildSettings.installCommand,
            nodeVersion: buildSettings.nodeVersion,
            phpVersion: buildSettings.phpVersion,
            environment: Object.fromEntries(envVars.filter(e => e.key).map(e => [e.key, e.value])),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          deploymentId = data.deployment?.id || data.id;
        } else {
          alert("Quick install failed. Using demo mode — redirecting.");
          router.push("/dashboard/deployments");
          return;
        }
      } else {
        const res = await fetch("http://localhost:3001/api/deployments", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            projectId: "00000000-0000-0000-0000-000000000000",
            name: form.name,
            type: "git",
            sourceUrl: gitUrl,
            gitBranch,
            gitAuthMethod: gitAuth,
            gitToken,
            framework: form.framework,
            region: form.region,
            plan: form.plan,
            buildCommand: buildSettings.buildCommand,
            outputDirectory: buildSettings.outputDirectory,
            installCommand: buildSettings.installCommand,
            nodeVersion: buildSettings.nodeVersion,
            phpVersion: buildSettings.phpVersion,
            environment: Object.fromEntries(envVars.filter(e => e.key).map(e => [e.key, e.value])),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          deploymentId = data.deployment?.id || data.id;
        } else {
          alert("Git deploy failed. Using demo mode — redirecting.");
          router.push("/dashboard/deployments");
          return;
        }
      }

      if (deploymentId) {
        await fetch(`http://localhost:3001/api/deployments/${deploymentId}/deploy`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }

      router.push("/dashboard/deployments");
    } catch {
      router.push("/dashboard/deployments");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">New Deployment</h1>
          <p className="text-gray-500">Deploy your app via file upload, quick install, or Git repository</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {[
            { key: "upload", label: "Upload Files", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
            { key: "quick-install", label: "Quick Install", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { key: "git", label: "Git Repository", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Upload Files Tab */}
        {activeTab === "upload" && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`card p-10 text-center transition-colors ${
              dragging ? "border-brand-500 bg-brand-50/30" : ""
            }`}
            style={{ borderWidth: 2, borderStyle: "dashed" }}
          >
            {!uploadedFile ? (
              <>
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-500 font-medium">Drag & drop your files here</p>
                <p className="text-gray-400 text-sm mt-1">Supports .zip archives and individual files</p>
                <button onClick={() => fileInputRef.current?.click()}
                  className="btn-primary mt-4 inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Browse Files
                </button>
                <input ref={fileInputRef} type="file" accept=".zip,.tar.gz,.tar,.js,.ts,.jsx,.tsx,.json,.html,.css,.php,.py,.rb,.go,.java"
                  onChange={handleFileSelect} className="hidden" />
              </>
            ) : (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 bg-brand-50 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                <div className="flex items-center justify-center gap-4 mt-1 text-sm text-gray-500">
                  <span>{formatFileSize(uploadedFile.size)}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{uploadedFile.type || "Unknown type"}</span>
                </div>
                <button onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="text-sm text-red-500 hover:text-red-700 mt-3 font-medium">
                  Remove file
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Install Tab */}
        {activeTab === "quick-install" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickInstallApps.map((app) => (
              <button key={app.id} type="button" onClick={() => { setForm({ ...form, name: app.name.toLowerCase().replace(/\s+/g, "-"), framework: app.id }); }}
                className={`card p-5 text-center hover:shadow-md hover:border-brand-200 transition-all group ${
                  form.framework === app.id ? "border-brand-500 ring-2 ring-brand-100" : ""
                }`}>
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                  form.framework === app.id ? "bg-brand-600" : "bg-gray-600 group-hover:bg-gray-700"
                } transition-colors`}>
                  {app.icon}
                </div>
                <p className="font-medium text-sm text-gray-900 group-hover:text-brand-700 transition-colors">{app.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{app.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Git Repository Tab */}
        {activeTab === "git" && (
          <div className="card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Git Repository URL</label>
              <input value={gitUrl} onChange={e => setGitUrl(e.target.value)}
                className="input-field font-mono" placeholder="https://github.com/user/repo.git" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Branch</label>
                <input value={gitBranch} onChange={e => setGitBranch(e.target.value)}
                  className="input-field font-mono" placeholder="main" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Auth Method</label>
                <select value={gitAuth} onChange={e => setGitAuth(e.target.value as any)} className="input-field">
                  <option value="token">Personal Access Token</option>
                  <option value="ssh">SSH Key</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {gitAuth === "token" ? "Personal Access Token" : "SSH Private Key"}
              </label>
              {gitAuth === "token" ? (
                <input value={gitToken} onChange={e => setGitToken(e.target.value)}
                  className="input-field font-mono" type="password" placeholder="ghp_..." />
              ) : (
                <textarea value={gitToken} onChange={e => setGitToken(e.target.value)}
                  className="input-field font-mono text-xs" rows={4} placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;..." />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Common Settings */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold">Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field" placeholder="my-app" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Framework</label>
            <select value={form.framework} onChange={e => updateFramework(e.target.value)} className="input-field">
              {frameworks.map((fw) => (
                <option key={fw.value} value={fw.value}>{fw.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Region</label>
            <select value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className="input-field">
              {regions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plan</label>
            <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} className="input-field">
              {plans.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Build Settings (expandable) */}
      <div className="card">
        <button type="button" onClick={() => setShowBuildSettings(!showBuildSettings)}
          className="w-full flex items-center justify-between p-5 text-left">
          <h2 className="font-semibold">Build Settings</h2>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${showBuildSettings ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showBuildSettings && (
          <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Build Command</label>
                <input value={buildSettings.buildCommand} onChange={e => setBuildSettings({ ...buildSettings, buildCommand: e.target.value })}
                  className="input-field font-mono" placeholder="npm run build" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Output Directory</label>
                <input value={buildSettings.outputDirectory} onChange={e => setBuildSettings({ ...buildSettings, outputDirectory: e.target.value })}
                  className="input-field font-mono" placeholder=".next" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Install Command</label>
                <input value={buildSettings.installCommand} onChange={e => setBuildSettings({ ...buildSettings, installCommand: e.target.value })}
                  className="input-field font-mono" placeholder="npm install" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Node Version</label>
                  <select value={buildSettings.nodeVersion} onChange={e => setBuildSettings({ ...buildSettings, nodeVersion: e.target.value })} className="input-field">
                    {nodeVersions.map((v) => <option key={v} value={v}>Node {v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PHP Version</label>
                  <select value={buildSettings.phpVersion} onChange={e => setBuildSettings({ ...buildSettings, phpVersion: e.target.value })} className="input-field">
                    {phpVersions.map((v) => <option key={v} value={v}>PHP {v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Environment Variables</label>
                <button type="button" onClick={addEnvVar}
                  className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Variable
                </button>
              </div>
              <div className="space-y-2">
                {envVars.map((ev, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={ev.key} onChange={e => updateEnvVar(i, "key", e.target.value)}
                      className="input-field font-mono text-sm w-48" placeholder="KEY" />
                    <input value={ev.value} onChange={e => updateEnvVar(i, "value", e.target.value)}
                      className="input-field font-mono text-sm flex-1" placeholder="value" />
                    <button type="button" onClick={() => removeEnvVar(i)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deploy Button */}
      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => router.push("/dashboard/deployments")}
          className="btn-secondary">Cancel</button>
        <button type="button" onClick={handleSubmit} disabled={submitting}
          className="btn-primary inline-flex items-center gap-2">
          {submitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Deploying...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Deploy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
