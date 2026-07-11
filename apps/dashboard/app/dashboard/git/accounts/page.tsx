"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GitAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => fetch('/api/git/accounts').then(r => r.json()).then(d => setAccounts(d.accounts || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const disconnect = async (id: string) => {
    if (!confirm('Disconnect this account?')) return;
    await fetch(`/api/git/accounts?id=${id}`, { method: 'DELETE' });
    load();
  };

  const connectGitHub = () => {
    window.location.href = '/api/git/oauth/github';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Git Accounts</h1>
          <p className="text-sm text-gray-400 mt-1">Connect your GitHub or GitLab repositories for auto-deployment</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={connectGitHub}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            GitHub
          </button>
          <button disabled className="px-4 py-2 border text-sm rounded-lg text-gray-400 cursor-not-allowed flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.08-.66l.38-1.44a.37.37 0 01.52-.24l1.75.74 1.66-6.39a.71.71 0 01.69-.54H18.7a.71.71 0 01.69.55l1.66 6.39 1.75-.74a.37.37 0 01.52.24l.38 1.44a.84.84 0 01-.08.66z" /></svg>
            GitLab
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg" />)}</div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          <p className="font-medium text-gray-500">No git accounts connected</p>
          <p className="text-sm mt-1">Connect GitHub to import repositories and auto-deploy</p>
          <button onClick={connectGitHub}
            className="mt-4 px-5 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            Connect GitHub
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {accounts.map(acc => (
            <div key={acc.id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/git/accounts/${acc.id}`)}>
              <div className="card-body flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={acc.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium text-sm">{acc.username}</p>
                    <p className="text-xs text-gray-400 capitalize">{acc.provider} · {acc.repos_count} repositories</p>
                    <p className="text-xs text-gray-400">Connected {new Date(acc.connected_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); disconnect(acc.id); }}
                  className="text-xs text-red-600 hover:underline">Disconnect</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
