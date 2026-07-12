"use client";

import { useState, useEffect } from "react";

const demoUsers = [
  { id: "1", name: "Admin User", email: "admin@cloudhost.com", isAdmin: true, createdAt: "2026-01-15T08:00:00Z" },
  { id: "2", name: "John Customer", email: "user@cloudhost.com", isAdmin: false, createdAt: "2026-02-20T10:30:00Z" },
  { id: "3", name: "Sarah Johnson", email: "sarah@acmecorp.com", isAdmin: true, createdAt: "2026-03-05T14:15:00Z" },
  { id: "4", name: "Mike Chen", email: "mike@startup.co", isAdmin: false, createdAt: "2026-03-18T09:45:00Z" },
  { id: "5", name: "Emily Davis", email: "emily@webagency.com", isAdmin: false, createdAt: "2026-04-01T11:00:00Z" },
  { id: "6", name: "Alex Rodriguez", email: "alex@techlabs.io", isAdmin: false, createdAt: "2026-04-12T16:20:00Z" },
  { id: "7", name: "Lisa Wang", email: "lisa@ecomstore.com", isAdmin: true, createdAt: "2026-05-02T08:30:00Z" },
  { id: "8", name: "Tom Baker", email: "tom@devshop.net", isAdmin: false, createdAt: "2026-05-19T13:10:00Z" },
  { id: "9", name: "Rachel Green", email: "rachel@fashion.co", isAdmin: false, createdAt: "2026-06-01T09:00:00Z" },
  { id: "10", name: "David Kim", email: "david@saaspro.com", isAdmin: false, createdAt: "2026-06-10T11:30:00Z" },
  { id: "11", name: "Anna Schmidt", email: "anna@eurohost.de", isAdmin: false, createdAt: "2026-06-22T15:45:00Z" },
  { id: "12", name: "James Wilson", email: "james@devops.io", isAdmin: true, createdAt: "2026-07-01T08:15:00Z" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>(demoUsers);
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-500">Manage all platform users ({users.length} total)</p>
        </div>
        <div className="flex gap-2">
          <span className="badge badge-info">{users.filter((u: any) => !u.isAdmin).length} Users</span>
          <span className="badge badge-warning">{users.filter((u: any) => u.isAdmin).length} Admins</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="input-field" placeholder="Search users by name or email..." />
        </div>
        <button className="btn-primary">Add User</button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/50">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Joined</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u: any) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-brand-700">{u.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          {u.isAdmin && <span className="badge badge-warning text-[10px]">Admin</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <select defaultValue={u.isAdmin ? "admin" : "user"}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button className="text-red-500 hover:text-red-700 text-xs font-medium">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}