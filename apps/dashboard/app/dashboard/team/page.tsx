"use client";

import { useState } from "react";

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([
    { id: 1, name: "You (Owner)", email: "owner@example.com", role: "owner", joined: "Today" }
  ]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const inviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    setMembers([...members, { id: Date.now(), name: inviteEmail.split("@")[0], email: inviteEmail, role: inviteRole, joined: "Just now" }]);
    setShowInvite(false);
    setInviteEmail("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-gray-500">Manage your organization members and permissions</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Invite Member
        </button>
      </div>

      {showInvite && (
        <form onSubmit={inviteMember} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                className="input-field" placeholder="colleague@company.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="input-field">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Send Invitation</button>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Organization Members</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-700">{m.name[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${m.role === "owner" ? "badge-info" : m.role === "admin" ? "badge-success" : "badge-warning"}`}>
                  {m.role}
                </span>
                <span className="text-xs text-gray-400">{m.joined}</span>
                {m.role !== "owner" && (
                  <button className="text-gray-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
