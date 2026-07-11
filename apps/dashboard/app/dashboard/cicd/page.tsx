"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CICDConnection { id: string; name: string; provider: string; repository: string; branch: string; auto_deploy: boolean; last_deploy_at?: string; last_deploy_status?: string; created_at: string; }

export default function CICDPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<CICDConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', provider: 'github', repository: '', branch: 'main', build_command: 'npm run build', output_directory: '.next', install_command: 'npm install', node_version: '20', auto_deploy: true });

  const load = () => fetch('/api/cicd/connections').then(r => r.json()).then(d => setConnections(d.connections || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const create = async () => {
    await fetch('/api/cicd/connections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ name: '', provider: 'github', repository: '', branch: 'main', build_command: 'npm run build', output_directory: '.next', install_command: 'npm install', node_version: '20', auto_deploy: true });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this connection?')) return;
    await fetch(`/api/cicd/connections/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">CI/CD Pipeline</h1>
          <p className="text-sm text-gray-400 mt-1">Connect your repositories for automatic deployments</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Connection
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="card-body grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Connection Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="My App" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Provider</label>
              <select value={form.provider} onChange={e => setForm({...form, provider: e.target.value as 'github' | 'gitlab'})} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="github">GitHub</option>
                <option value="gitlab">GitLab</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Repository</label>
              <input value={form.repository} onChange={e => setForm({...form, repository: e.target.value})} placeholder="owner/repository-name" className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Branch</label>
              <input value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Node Version</label>
              <select value={form.node_version} onChange={e => setForm({...form, node_version: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="18">18.x</option>
                <option value="20">20.x</option>
                <option value="22">22.x</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Install Command</label>
              <input value={form.install_command} onChange={e => setForm({...form, install_command: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Build Command</label>
              <input value={form.build_command} onChange={e => setForm({...form, build_command: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Output Directory</label>
              <input value={form.output_directory} onChange={e => setForm({...form, output_directory: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" checked={form.auto_deploy} onChange={e => setForm({...form, auto_deploy: e.target.checked})} id="autoDeploy" />
              <label htmlFor="autoDeploy" className="text-sm">Auto-deploy on push</label>
            </div>
            <div className="col-span-2 flex gap-2">
              <button onClick={create} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Create Connection</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg" />)}</div>
      ) : connections.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          <p className="font-medium">No connections yet</p>
          <p className="text-sm mt-1">Connect a GitHub or GitLab repository to enable auto-deploy</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {connections.map(conn => (
            <div key={conn.id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/cicd/${conn.id}`)}>
              <div className="card-body flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                    {conn.provider === 'github' ? '🐙' : '🦊'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{conn.name}</p>
                    <p className="text-xs text-gray-400">{conn.repository} &middot; {conn.branch}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {conn.auto_deploy && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Auto-deploy</span>}
                      {conn.last_deploy_status === 'success' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Last deploy: success</span>}
                      {conn.last_deploy_status === 'failed' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Last deploy: failed</span>}
                    </div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); remove(conn.id); }}
                  className="text-xs text-red-600 hover:underline px-2">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
