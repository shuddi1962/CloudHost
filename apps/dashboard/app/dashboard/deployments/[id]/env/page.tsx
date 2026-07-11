"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DeploymentEnvPage() {
  const params = useParams();
  const router = useRouter();
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newScope, setNewScope] = useState<'all' | 'production' | 'preview' | 'development'>('all');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editScope, setEditScope] = useState<'all' | 'production' | 'preview' | 'development'>('all');
  const [search, setSearch] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const load = () => {
    if (!id) return;
    fetch(`/api/deployments/${id}/env`).then(r => r.json()).then(d => {
      setEnvVars(d.env_vars || {});
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  const addVar = async () => {
    if (!newKey.trim()) return;
    await fetch(`/api/deployments/${id}/env`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: newKey.trim(), value: newValue }),
    });
    setNewKey("");
    setNewValue("");
    load();
  };

  const updateVar = async (key: string, value: string) => {
    await fetch(`/api/deployments/${id}/env`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    });
    setEditingKey(null);
    load();
  };

  const deleteVar = async (key: string) => {
    if (!confirm(`Delete "${key}"?`)) return;
    await fetch(`/api/deployments/${id}/env?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
    load();
  };

  const importPreset = (preset: string) => {
    const presets: Record<string, Record<string, string>> = {
      nextjs: { NODE_ENV: 'production', NEXT_PUBLIC_API_URL: 'https://api.cloudhost.app' },
      node: { NODE_ENV: 'production', PORT: '3000' },
      django: { DJANGO_SETTINGS_MODULE: 'settings.production', DEBUG: 'False', ALLOWED_HOSTS: '*' },
      laravel: { APP_ENV: 'production', APP_DEBUG: 'false', DB_CONNECTION: 'pgsql' },
      database: { DATABASE_URL: 'postgresql://user:pass@host:5432/db', REDIS_URL: 'redis://host:6379' },
      storage: { S3_ENDPOINT: 'https://storage.cloudhost.app', S3_BUCKET: 'my-bucket' },
    };
    const selected = presets[preset];
    if (!selected) return;
    fetch(`/api/deployments/${id}/env`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selected),
    }).then(() => load());
  };

  const filtered = Object.entries(envVars).filter(([k]) => k.toLowerCase().includes(search.toLowerCase()));
  const groupByPrefix = () => {
    const groups: Record<string, [string, string][]> = {};
    filtered.forEach(([k, v]) => {
      const prefix = k.includes('_') ? k.split('_')[0] : 'Other';
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push([k, v]);
    });
    return groups;
  };

  const groups = groupByPrefix();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => router.push(`/dashboard/deployments/${id}`)}
        className="text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1 text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Deployment
      </button>
      <button onClick={() => router.push('/dashboard/env-vars')}
        className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        All Environment Variables
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Environment Variables</h1>
          <p className="text-sm text-gray-400 mt-1">Manage environment variables for {id?.substring(0, 8)}</p>
        </div>
        <div className="text-sm text-gray-400">{Object.keys(envVars).length} variables</div>
      </div>

      {/* Add new variable */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">Key</label>
              <input value={newKey} onChange={e => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                placeholder="MY_VARIABLE" className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div className="flex-[2]">
              <label className="text-xs text-gray-500 block mb-1">Value</label>
              <input value={newValue} onChange={e => setNewValue(e.target.value)}
                placeholder="my-value" className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Scope</label>
              <select value={newScope} onChange={e => setNewScope(e.target.value as any)}
                className="border rounded-lg px-3 py-2 text-sm">
                <option value="all">All Environments</option>
                <option value="production">Production</option>
                <option value="preview">Preview</option>
                <option value="development">Development</option>
              </select>
            </div>
            <button onClick={addVar} disabled={!newKey.trim()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap">
              + Add
            </button>
          </div>

          {/* Presets */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Import preset:</span>
            {Object.entries({ nextjs: 'Next.js', node: 'Node.js', django: 'Django', laravel: 'Laravel', database: 'Database', storage: 'Storage' }).map(([k, v]) => (
              <button key={k} onClick={() => importPreset(k)}
                className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1">{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search variables..." className="w-full border rounded-lg px-4 py-2 text-sm mb-4" />

      {/* Variables list */}
      {loading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <p>No environment variables yet</p>
          <p className="text-sm mt-1">Add one above or import a preset</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groups).sort().map(([prefix, vars]) => (
            <div key={prefix}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{prefix}*</h3>
              <div className="space-y-1">
                {vars.map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 group hover:bg-gray-100 transition-colors">
                    {editingKey === key ? (
                      <>
                        <code className="text-sm font-mono text-indigo-600 w-44">{key}</code>
                        <input value={editValue} onChange={e => setEditValue(e.target.value)}
                          className="flex-1 border rounded px-2 py-1 text-sm font-mono" autoFocus />
                        <select value={editScope} onChange={e => setEditScope(e.target.value as any)}
                          className="border rounded px-2 py-1 text-xs">
                          <option value="all">All</option><option value="production">Production</option>
                          <option value="preview">Preview</option><option value="development">Development</option>
                        </select>
                        <button onClick={() => updateVar(key, editValue)}
                          className="text-xs text-green-600 hover:underline">Save</button>
                        <button onClick={() => setEditingKey(null)}
                          className="text-xs text-gray-400 hover:underline">Cancel</button>
                      </>
                    ) : (
                      <>
                        <code className="text-sm font-mono text-indigo-600 w-44 truncate">{key}</code>
                        <div className="flex-1 flex items-center gap-2">
                          <code className="text-sm font-mono text-gray-500 truncate max-w-md">
                            {revealed.has(key) ? value : value.length > 20 ? value.slice(0, 3) + '•'.repeat(Math.min(value.length - 6, 20)) + value.slice(-3) : '•'.repeat(value.length || 8)}
                          </code>
                          <button onClick={() => setRevealed(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; })}
                            className="text-xs text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100">
                            {revealed.has(key) ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{'all'}</span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                            <button onClick={() => { setEditingKey(key); setEditValue(value); setEditScope('all'); }}
                              className="text-xs text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => deleteVar(key)}
                              className="text-xs text-red-600 hover:underline">Delete</button>
                            <button onClick={async () => { await navigator.clipboard.writeText(value); }}
                              className="text-xs text-gray-400 hover:text-gray-600">Copy</button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
