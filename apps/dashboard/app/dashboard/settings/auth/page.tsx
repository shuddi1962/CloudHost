"use client";

import { useEffect, useState } from "react";

interface ProviderInfo {
  name: string;
  icon: string;
  color: string;
  docsUrl: string;
}

interface AuthProvider {
  id: string;
  provider: string;
  enabled: boolean;
  clientId: string;
}

export default function AuthSettingsPage() {
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [providerInfo, setProviderInfo] = useState<Record<string, ProviderInfo>>({});
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState({ clientId: "", clientSecret: "", redirectUrl: "" });

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [provRes, infoRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth-providers/organization/00000000-0000-0000-0000-000000000000`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth-providers/providers-info`, { headers }),
      ]);
      const provData = await provRes.json();
      const infoData = await infoRes.json();
      setProviders(provData.providers || []);
      setProviderInfo(infoData.providers || {});
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const configureProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuring) return;
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth-providers/configure`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        organizationId: "00000000-0000-0000-0000-000000000000",
        provider: configuring,
        ...configForm,
      }),
    });
    setConfiguring(null);
    setConfigForm({ clientId: "", clientSecret: "", redirectUrl: "" });
    fetchData();
  };

  const toggleProvider = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth-providers/${id}/toggle`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const allProviderKeys = Object.keys(providerInfo);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading auth settings...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Authentication Providers</h1>
        <p className="text-gray-500">Configure OAuth and SSO providers for your users</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Enabled Providers</h2>
            <span className="badge badge-info">{providers.filter(p => p.enabled).length} active</span>
          </div>
        </div>
        <div className="card-body">
          {providers.filter(p => p.enabled).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No providers enabled. Configure one below.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {providers.filter(p => p.enabled).map((p) => {
                const info = providerInfo[p.provider];
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${info?.color || "bg-gray-500"} flex items-center justify-center`}>
                        <span className="text-white font-bold text-xs">{info?.icon || p.provider[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{info?.name || p.provider}</p>
                        <p className="text-xs text-green-600">Connected</p>
                      </div>
                    </div>
                    <button onClick={() => toggleProvider(p.id)} className="text-gray-400 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">All Providers</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allProviderKeys.map((key) => {
              const info = providerInfo[key];
              const configured = providers.find(p => p.provider === key);
              const isEnabled = configured?.enabled;

              return (
                <div key={key} className={`p-4 rounded-xl border transition-all ${
                  isEnabled ? "border-green-200 bg-green-50/50" : "border-gray-100 bg-gray-50 hover:border-brand-200"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${info?.color || "bg-gray-500"} flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{info?.icon || key[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium">{info?.name || key}</p>
                        <p className="text-xs text-gray-400">{key}</p>
                      </div>
                    </div>
                    {configured && (
                      <button onClick={() => toggleProvider(configured.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isEnabled ? "bg-green-500" : "bg-gray-300"}`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    )}
                  </div>

                  {configured ? (
                    <div className="space-y-2">
                      {configured.clientId && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Client ID:</span>
                          <code className="text-gray-700">{configured.clientId.substring(0, 20)}...</code>
                        </div>
                      )}
                      <button onClick={() => {
                        setConfiguring(key);
                        setConfigForm({ clientId: configured.clientId || "", clientSecret: "", redirectUrl: "" });
                      }} className="text-xs text-brand-600 hover:text-brand-800 font-medium">
                        Edit Configuration
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => {
                      setConfiguring(key);
                      setConfigForm({ clientId: "", clientSecret: "", redirectUrl: "" });
                    }} className="btn-secondary text-xs w-full justify-center mt-1">
                      Configure
                    </button>
                  )}

                  {info?.docsUrl && !configured && (
                    <a href={info.docsUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-gray-400 hover:text-brand-600 mt-2 inline-block">
                      Setup guide →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {configuring && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setConfiguring(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${providerInfo[configuring]?.color || "bg-gray-500"} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{providerInfo[configuring]?.icon || configuring[0].toUpperCase()}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold">Configure {providerInfo[configuring]?.name}</h2>
                <p className="text-sm text-gray-500">Enter your OAuth credentials</p>
              </div>
            </div>

            <form onSubmit={configureProvider} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Client ID</label>
                <input value={configForm.clientId} onChange={e => setConfigForm({ ...configForm, clientId: e.target.value })}
                  className="input-field" placeholder="your-client-id" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client Secret</label>
                <input value={configForm.clientSecret} onChange={e => setConfigForm({ ...configForm, clientSecret: e.target.value })}
                  className="input-field" type="password" placeholder="your-client-secret" />
                <p className="text-xs text-gray-400 mt-1">Leave blank to keep existing</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Redirect URL</label>
                <input value={configForm.redirectUrl} onChange={e => setConfigForm({ ...configForm, redirectUrl: e.target.value })}
                  className="input-field" placeholder="https://your-app.cloudhost.app/auth/callback" />
                <p className="text-xs text-gray-400 mt-1">
                  Set this as the callback URL in your OAuth app: <code className="bg-gray-100 px-1 rounded">http://localhost:3000/auth/callback</code>
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setConfiguring(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Configuration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
