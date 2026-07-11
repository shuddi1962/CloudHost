"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type EnvScope = 'production' | 'preview' | 'development' | 'all';

interface EnvVar {
  key: string;
  value: string;
  scope: EnvScope;
  targets: string[];
}

export default function EnvVarsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDeploymentId = searchParams.get('deployment') || 'global';

  const [deployments, setDeployments] = useState<any[]>([]);
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newScope, setNewScope] = useState<EnvScope>('all');
  const [search, setSearch] = useState('');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editScope, setEditScope] = useState<EnvScope>('all');
  const [activeTab, setActiveTab] = useState<'all' | EnvScope>('all');

  const loadDeployments = () => {
    Promise.all([
      fetch('/api/deployments').then(r => r.json()).catch(() => ({ deployments: [] })),
      fetch('/api/webhook-deployments').then(r => r.json()).catch(() => ({ deployments: [] })),
    ]).then(([reg, wh]) => {
      setDeployments([...(wh.deployments || []), ...(reg.deployments || [])]);
    });
  };
  useEffect(() => { loadDeployments(); }, []);

  const loadEnvVars = () => {
    if (selectedDeploymentId === 'global') {
      const stored = localStorage.getItem('env-vars-global');
      setEnvVars(stored ? JSON.parse(stored) : []);
      setLoading(false);
      return;
    }
    fetch(`/api/deployments/${selectedDeploymentId}/env`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const vars = d.env_vars || {};
        setEnvVars(Object.entries(vars).map(([key, value]) => ({
          key, value: value as string, scope: 'all' as EnvScope, targets: [],
        })));
        setLoading(false);
      })
      .catch(() => {
        const stored = localStorage.getItem(`env-vars-${selectedDeploymentId}`);
        setEnvVars(stored ? JSON.parse(stored) : []);
        setLoading(false);
      });
  };
  useEffect(() => { loadEnvVars(); }, [selectedDeploymentId]);

  const saveEnvVars = async (vars: EnvVar[]) => {
    setEnvVars(vars);
    const obj: Record<string, string> = {};
    vars.forEach(v => { obj[v.key] = v.value; });
    if (selectedDeploymentId === 'global') {
      localStorage.setItem('env-vars-global', JSON.stringify(vars));
    } else {
      const ok = await fetch(`/api/deployments/${selectedDeploymentId}/env`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj),
      }).then(r => r.ok).catch(() => false);
      if (!ok) {
        localStorage.setItem(`env-vars-${selectedDeploymentId}`, JSON.stringify(vars));
      }
    }
  };

  const addVar = () => {
    if (!newKey.trim()) return;
    const exists = envVars.find(v => v.key === newKey.trim());
    if (exists) {
      setEnvVars(envVars.map(v => v.key === newKey.trim() ? { ...v, value: newValue, scope: newScope } : v));
    } else {
      saveEnvVars([...envVars, { key: newKey.trim(), value: newValue, scope: newScope, targets: [] }]);
    }
    setNewKey(''); setNewValue(''); setNewScope('all');
  };

  const updateVar = (key: string, value: string, scope: EnvScope) => {
    saveEnvVars(envVars.map(v => v.key === key ? { ...v, value, scope } : v));
    setEditingKey(null);
  };

  const deleteVar = (key: string) => {
    if (!confirm(`Delete "${key}"?`)) return;
    saveEnvVars(envVars.filter(v => v.key !== key));
  };

  const importPreset = (preset: string) => {
    const presets: Record<string, EnvVar[]> = {
      nextjs: [{ key: 'NODE_ENV', value: 'production', scope: 'all', targets: [] },
        { key: 'NEXT_PUBLIC_API_URL', value: 'https://api.cloudhost.app', scope: 'production', targets: [] }],
      database: [{ key: 'DATABASE_URL', value: 'postgresql://user:pass@host:5432/db', scope: 'production', targets: [] },
        { key: 'REDIS_URL', value: 'redis://host:6379', scope: 'production', targets: [] }],
      stripe: [{ key: 'STRIPE_KEY', value: 'sk_live_...', scope: 'production', targets: [] },
        { key: 'STRIPE_WEBHOOK_SECRET', value: 'whsec_...', scope: 'production', targets: [] }],
      aws: [{ key: 'AWS_ACCESS_KEY_ID', value: 'AKIA...', scope: 'production', targets: [] },
        { key: 'AWS_SECRET_ACCESS_KEY', value: '...', scope: 'production', targets: [] },
        { key: 'AWS_REGION', value: 'us-east-1', scope: 'all', targets: [] }],
    };
    const selected = presets[preset];
    if (!selected) return;
    const merged = [...envVars];
    selected.forEach(sv => { if (!merged.find(v => v.key === sv.key)) merged.push(sv); });
    saveEnvVars(merged);
  };

  const filtered = envVars.filter(v => {
    if (activeTab !== 'all' && v.scope !== 'all' && v.scope !== activeTab) return false;
    return v.key.toLowerCase().includes(search.toLowerCase());
  });

  const getScopeBadge = (scope: EnvScope) => {
    const colors = { production: 'bg-red-100 text-red-700', preview: 'bg-blue-100 text-blue-700', development: 'bg-green-100 text-green-700', all: 'bg-gray-100 text-gray-600' };
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${colors[scope]}`}>{scope}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Environment Variables</h1>
          <p className="text-sm text-gray-400 mt-1">Manage secrets and configuration across environments</p>
        </div>
        <div className="text-sm text-gray-400">{envVars.length} variables</div>
      </div>

      {/* Project selector */}
      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm text-gray-500">Project:</label>
        <select
          value={selectedDeploymentId}
          onChange={e => router.push(`/dashboard/env-vars?deployment=${e.target.value}`)}
          className="border rounded-lg px-3 py-2 text-sm min-w-[200px]"
        >
          <option value="global">🌐 Global (all projects)</option>
          {deployments.map((d: any) => (
            <option key={d.id} value={d.id}>{d.name} ({d.framework})</option>
          ))}
        </select>
        {selectedDeploymentId !== 'global' && (
          <button onClick={() => router.push(`/dashboard/deployments/${selectedDeploymentId}/env`)}
            className="text-xs text-indigo-600 hover:underline">
            Open in Deployment
          </button>
        )}
      </div>

      {/* Add new variable */}
      <div className="card mb-6">
        <div className="card-body">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Add Variable</p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">Key</label>
              <input value={newKey} onChange={e => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                placeholder="MY_KEY" className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div className="flex-[2]">
              <label className="text-xs text-gray-500 block mb-1">Value</label>
              <input value={newValue} onChange={e => setNewValue(e.target.value)}
                placeholder="my-value" className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Scope</label>
              <select value={newScope} onChange={e => setNewScope(e.target.value as EnvScope)}
                className="border rounded-lg px-3 py-2 text-sm">
                <option value="all">All</option>
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
            {[{k:'nextjs',l:'Next.js'},{k:'database',l:'Database'},{k:'stripe',l:'Stripe'},{k:'aws',l:'AWS'}].map(p => (
              <button key={p.k} onClick={() => importPreset(p.k)}
                className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1">{p.l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Scope tabs + search */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {([
            { id: 'all' as const, label: 'All' },
            { id: 'production' as const, label: 'Production' },
            { id: 'preview' as const, label: 'Preview' },
            { id: 'development' as const, label: 'Development' },
          ]).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search keys..." className="border rounded-lg px-3 py-1.5 text-sm w-60" />
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-700">
        <strong>How env vars work:</strong> Variables scoped to <strong>Production</strong> only apply to production deployments.
        <strong> Preview</strong> applies to preview/branch deployments. <strong>Development</strong> applies to local dev.
        <strong> All</strong> applies everywhere. Select a project above to scope variables to a specific project, or use
        <strong> Global</strong> for variables shared across all projects.
      </div>

      {/* Variables list */}
      {loading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <p>No environment variables {activeTab !== 'all' ? `scoped to ${activeTab}` : ''}</p>
          <p className="text-sm mt-1">Add one above or import a preset</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(v => (
            <div key={v.key} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 group hover:bg-gray-100 transition-colors">
              {editingKey === v.key ? (
                <>
                  <code className="text-sm font-mono text-indigo-600 w-44 truncate">{v.key}</code>
                  <input value={editValue} onChange={e => setEditValue(e.target.value)}
                    className="flex-1 border rounded px-2 py-1 text-sm font-mono" autoFocus />
                  <select value={editScope} onChange={e => setEditScope(e.target.value as EnvScope)}
                    className="border rounded px-2 py-1 text-xs">
                    <option value="all">All</option><option value="production">Production</option>
                    <option value="preview">Preview</option><option value="development">Development</option>
                  </select>
                  <button onClick={() => updateVar(v.key, editValue, editScope)}
                    className="text-xs text-green-600 hover:underline">Save</button>
                  <button onClick={() => setEditingKey(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                </>
              ) : (
                <>
                  <code className="text-sm font-mono text-indigo-600 w-44 truncate">{v.key}</code>
                  <div className="flex-1 flex items-center gap-2">
                    <code className="text-sm font-mono text-gray-500 truncate max-w-md">
                      {revealed.has(v.key) ? v.value : v.value.length > 20
                        ? v.value.slice(0, 3) + '•'.repeat(Math.min(v.value.length - 6, 20)) + v.value.slice(-3)
                        : '•'.repeat(v.value.length || 8)}
                    </code>
                    <button onClick={() => setRevealed(prev => { const n = new Set(prev); n.has(v.key) ? n.delete(v.key) : n.add(v.key); return n; })}
                      className="text-[10px] text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100">
                      {revealed.has(v.key) ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {getScopeBadge(v.scope)}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => { setEditingKey(v.key); setEditValue(v.value); setEditScope(v.scope); }}
                        className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => deleteVar(v.key)}
                        className="text-xs text-red-600 hover:underline">Delete</button>
                      <button onClick={async () => { await navigator.clipboard.writeText(v.value); }}
                        className="text-xs text-gray-400 hover:text-gray-600">Copy</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
