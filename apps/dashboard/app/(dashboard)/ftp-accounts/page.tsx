"use client";

import { useEffect, useState } from "react";

export default function FTPAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", directory: "/", permissions: "read_write" });
  const [newPassword, setNewPassword] = useState("");

  const fetchAccounts = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3001/api/hosting/account/00000000-0000-0000-0000-000000000000/ftp", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAccounts(data.ftpAccounts || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchAccounts(); }, []);

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3001/api/hosting/ftp", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, hostingAccountId: "00000000-0000-0000-0000-000000000000" }),
    });
    setShowCreate(false);
    setForm({ username: "", password: "", directory: "/", permissions: "read_write" });
    fetchAccounts();
  };

  const resetPassword = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/hosting/ftp/${id}/reset-password`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNewPassword(data.newPassword);
    setTimeout(() => setNewPassword(""), 10000);
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("Delete this FTP account?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/hosting/ftp/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchAccounts();
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading FTP accounts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">FTP Accounts</h1>
          <p className="text-gray-500">Manage FTP access for file transfers to your hosting account</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New FTP Account
        </button>
      </div>

      {newPassword && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          <p className="font-medium">New password generated</p>
          <code className="block mt-1 bg-white px-3 py-1.5 rounded border border-green-200 font-mono">{newPassword}</code>
          <p className="text-xs mt-1 text-green-600">Copy this now — it won't be shown again</p>
        </div>
      )}

      {showCreate && (
        <form onSubmit={createAccount} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                className="input-field" placeholder="ftpuser" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="input-field" type="password" placeholder="Leave blank for random" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Directory</label>
              <input value={form.directory} onChange={e => setForm({ ...form, directory: e.target.value })}
                className="input-field font-mono" placeholder="/" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Permissions</label>
              <select value={form.permissions} onChange={e => setForm({ ...form, permissions: e.target.value })} className="input-field">
                <option value="read">Read Only</option>
                <option value="read_write">Read & Write</option>
                <option value="full">Full Access</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Create FTP Account</button>
        </form>
      )}

      <div className="space-y-3">
        {accounts.map((acc) => (
          <div key={acc.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold font-mono">{acc.username}</h3>
                  <span className="badge badge-info text-[10px]">{acc.permissions}</span>
                  <span className={`badge text-[10px] ${acc.status === "active" ? "badge-success" : "badge-warning"}`}>{acc.status}</span>
                </div>
                <p className="text-xs text-gray-500">Directory: <code className="font-mono">{acc.directory}</code></p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                  <span>Host: <code className="font-mono">ftp.cloudhost.app</code></span>
                  <span>Port: <code className="font-mono">21</code></span>
                  <span>Protocol: SFTP / FTP</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => resetPassword(acc.id)} className="btn-secondary text-xs px-3 py-1.5">Reset Password</button>
                <button onClick={() => deleteAccount(acc.id)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && !showCreate && (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 font-medium">No FTP accounts</p>
            <p className="text-gray-400 text-sm mt-1">Create an FTP account to upload and manage files via FTP client</p>
          </div>
        </div>
      )}
    </div>
  );
}
