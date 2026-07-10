"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [system, setSystem] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("http://localhost:3001/api/admin/stats", { headers }).then(r => r.json()),
      fetch("http://localhost:3001/api/admin/system", { headers }).then(r => r.json()),
      fetch("http://localhost:3001/api/admin/users", { headers }).then(r => r.json()),
    ]).then(([statsData, sysData, usersData]) => {
      setStats(statsData.stats);
      setSystem(sysData.system);
      setUsers(usersData.users || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading admin dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Platform-wide management and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-info">System: {system?.platform}</span>
          <span className="badge badge-success">Node v{system?.nodeVersion}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: "Users", value: stats?.users || 0, href: "/dashboard/admin/users", color: "text-blue-600", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" },
          { label: "Organizations", value: stats?.organizations || 0, href: "/dashboard/admin/users", color: "text-indigo-600", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
          { label: "Projects", value: stats?.projects || 0, href: "/dashboard/admin", color: "text-purple-600", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
          { label: "Deployments", value: stats?.deployments || 0, href: "/dashboard/deployments", color: "text-green-600", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
          { label: "Databases", value: stats?.databases || 0, href: "/dashboard/databases", color: "text-cyan-600", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
          { label: "WordPress", value: stats?.wordpressSites || 0, href: "/dashboard/wordpress", color: "text-cyan-600", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 12a1 1 0 000 2h6a1 1 0 100-2H9z" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">{s.label}</p>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
              </svg>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="font-semibold">System Health</h2>
          </div>
          <div className="card-body space-y-4">
            {system && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">CPU Cores</p>
                    <p className="text-xl font-bold">{system.cpus}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Uptime</p>
                    <p className="text-xl font-bold">{(system.uptime / 3600).toFixed(1)}h</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Memory Usage</span>
                    <span className="text-gray-500">{system.memory.usage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-brand-500 rounded-full h-2.5" style={{ width: `${system.memory.usage}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {(system.memory.free / 1024 / 1024 / 1024).toFixed(1)} GB free / {(system.memory.total / 1024 / 1024 / 1024).toFixed(1)} GB total
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">Quick Actions</h2>
          </div>
          <div className="card-body space-y-2">
            {[
              { label: "Manage Users", href: "/dashboard/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" },
              { label: "Server Nodes", href: "/dashboard/admin/servers", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
              { label: "Billing Plans", href: "/dashboard/admin/billing", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((a) => (
              <Link key={a.label} href={a.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} />
                </svg>
                <span className="text-sm font-medium group-hover:text-brand-700">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Recent Users</h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 10).map((u: any) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-brand-700">{u.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{u.email}</td>
                    <td className="py-3">
                      <span className={`badge ${u.isAdmin ? "badge-error" : "badge-info"}`}>
                        {u.isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
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
