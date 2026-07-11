"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function GitAccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState<string | null>(null);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/git/accounts/${id}`).then(r => r.json()),
      fetch(`/api/git/accounts/${id}/repos`).then(r => r.json()),
    ]).then(([a, r]) => {
      setAccount(a.account);
      setRepos(r.repos || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const importRepo = async (repo: any) => {
    setImporting(repo.id);
    setTimeout(() => {
      router.push(`/dashboard/deployments/create?repo=${encodeURIComponent(repo.full_name)}&branch=${repo.default_branch}&gitAccount=${id}`);
    }, 500);
  };

  const filteredRepos = repos.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-400">Loading...</div>;
  if (!account) return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-400">Account not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => router.push('/dashboard/git/accounts')} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Git Accounts
      </button>

      <div className="flex items-center gap-4 mb-6">
        <img src={account.avatar_url} alt="" className="w-12 h-12 rounded-full" />
        <div>
          <h1 className="text-xl font-bold">{account.username}</h1>
          <p className="text-sm text-gray-400 capitalize">{account.provider} · {account.repos_count} repositories</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search repositories..." className="w-full border rounded-lg px-4 py-2 text-sm" />
        </div>
        <span className="text-xs text-gray-400">{filteredRepos.length} repos</span>
      </div>

      <div className="grid gap-2">
        {filteredRepos.map(repo => (
          <div key={repo.id} className="card hover:shadow-md transition-shadow">
            <div className="card-body flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  <p className="font-medium text-sm truncate">{repo.full_name}</p>
                  {repo.private && (
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>Branch: {repo.default_branch}</span>
                  <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => importRepo(repo)} disabled={importing === repo.id}
                className="px-4 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap ml-3">
                {importing === repo.id ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
