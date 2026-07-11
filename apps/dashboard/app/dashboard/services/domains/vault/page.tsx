"use client";

import { useEffect, useState } from "react";
import { Shield, Lock, Unlock, Users, CheckCircle, XCircle } from "lucide-react";

export default function DomainVaultPage() {
  const [vault, setVault] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [domain, setDomain] = useState("");
  const [vaultLevel, setVaultLevel] = useState("standard");
  const [trustedContacts, setTrustedContacts] = useState("");
  const [unlockModal, setUnlockModal] = useState<string | null>(null);
  const [unlockReason, setUnlockReason] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchVault = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/domain-services/vault", { headers });
      const data = await res.json();
      setVault(data.vault || []);
    } catch (e) {
      console.error("Failed to fetch vault");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVault(); }, []);

  const addToVault = async (e: React.FormEvent) => {
    e.preventDefault();
    const contacts = trustedContacts.split(",").map(s => s.trim()).filter(Boolean);
    const res = await fetch("http://localhost:3001/api/domain-services/vault", {
      method: "POST", headers,
      body: JSON.stringify({ domain, vaultLevel, trustedContacts: contacts.length > 0 ? contacts : undefined }),
    });
    if (res.ok) {
      const data = await res.json();
      setVault([data.vault, ...vault]);
      setDomain(""); setVaultLevel("standard"); setTrustedContacts(""); setShowForm(false);
    }
  };

  const requestUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockModal) return;
    const res = await fetch(`http://localhost:3001/api/domain-services/vault/${unlockModal}/unlock`, {
      method: "POST", headers,
      body: JSON.stringify({ reason: unlockReason }),
    });
    if (res.ok) {
      const data = await res.json();
      setVault(vault.map(v => v.id === unlockModal ? data.vault : v));
      setUnlockModal(null); setUnlockReason("");
    }
  };

  const approveUnlock = async (id: string) => {
    const res = await fetch(`http://localhost:3001/api/domain-services/vault/${id}/approve-unlock`, {
      method: "POST", headers,
    });
    if (res.ok) {
      const data = await res.json();
      setVault(vault.map(v => v.id === id ? data.vault : v));
    }
  };

  const lockIcon = (locked: boolean) => locked ? <Lock className="w-3 h-3 text-green-600" /> : <Unlock className="w-3 h-3 text-gray-400" />;

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Domain Vault</h1>
          <p className="text-gray-500">Enterprise-grade domain security with multi-approval unlock</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Shield className="w-4 h-4" /> Add to Vault
        </button>
      </div>

      {showForm && (
        <form onSubmit={addToVault} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domain Name</label>
              <input value={domain} onChange={e => setDomain(e.target.value)} className="input-field" placeholder="example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vault Level</label>
              <select value={vaultLevel} onChange={e => setVaultLevel(e.target.value)} className="input-field">
                <option value="standard">Standard</option>
                <option value="enhanced">Enhanced</option>
                <option value="maximum">Maximum</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Trusted Contacts (comma separated)</label>
              <input value={trustedContacts} onChange={e => setTrustedContacts(e.target.value)} className="input-field" placeholder="admin@example.com, user@example.com" />
            </div>
          </div>
          <button type="submit" className="btn-primary">Add to Vault</button>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Vault Entries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Level</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Transfer Lock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Delete Lock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Update Lock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vault.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No domains in vault</p>
                    <p className="text-xs mt-1">Add domains to protect them with multi-layer security</p>
                  </td>
                </tr>
              ) : vault.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{v.domain}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${v.vaultLevel === "maximum" ? "badge-error" : v.vaultLevel === "enhanced" ? "badge-warning" : "badge-info"}`}>
                      {v.vaultLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">{lockIcon(v.transferLock)}</td>
                  <td className="px-4 py-3">{lockIcon(v.deleteLock)}</td>
                  <td className="px-4 py-3">{lockIcon(v.updateLock)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${v.status === "unlocked" ? "badge-success" : v.unlockRequestedAt ? "badge-warning" : "badge-info"}`}>
                      {v.unlockRequestedAt ? "Unlock Requested" : v.status === "unlocked" ? "Unlocked" : "Locked"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!v.unlockRequestedAt && v.status !== "unlocked" && (
                        <button onClick={() => setUnlockModal(v.id)} className="btn-secondary text-xs">
                          <Unlock className="w-3 h-3" /> Unlock
                        </button>
                      )}
                      {v.unlockRequestedAt && v.status !== "unlocked" && (
                        <button onClick={() => approveUnlock(v.id)} className="btn-secondary text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {unlockModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setUnlockModal(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Request Unlock</h3>
            <form onSubmit={requestUnlock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Unlock</label>
                <textarea value={unlockReason} onChange={e => setUnlockReason(e.target.value)}
                  className="input-field" rows={3} placeholder="Explain why you need to unlock this domain..." required />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Submit Request</button>
                <button type="button" onClick={() => setUnlockModal(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
