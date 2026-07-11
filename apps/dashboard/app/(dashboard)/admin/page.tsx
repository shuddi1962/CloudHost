"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const demoStats = {
  users: 1284,
  organizations: 342,
  projects: 2891,
  deployments: 15420,
  databases: 876,
  wordpressSites: 543,
};

const demoServices = [
  { name: "Next.js Hosting", status: "Operational", uptime: "99.98%" },
  { name: "PostgreSQL", status: "Operational", uptime: "99.99%" },
  { name: "MySQL", status: "Operational", uptime: "99.97%" },
  { name: "Redis", status: "Operational", uptime: "99.95%" },
  { name: "Edge Functions", status: "Operational", uptime: "99.99%" },
  { name: "CDN", status: "Operational", uptime: "100%" },
  { name: "DNS", status: "Operational", uptime: "100%" },
  { name: "File Storage", status: "Degraded", uptime: "98.5%" },
  { name: "VPS", status: "Operational", uptime: "99.93%" },
  { name: "AI Builder", status: "Beta", uptime: "99.2%" },
];

const demoUsers = [
  { id: "1", name: "Admin User", email: "admin@cloudhost.com", isAdmin: true, isSuperAdmin: true, createdAt: "2026-01-15T08:00:00Z" },
  { id: "2", name: "John Customer", email: "user@cloudhost.com", isAdmin: false, isSuperAdmin: false, createdAt: "2026-02-20T10:30:00Z" },
  { id: "3", name: "Sarah Johnson", email: "sarah@acmecorp.com", isAdmin: true, isSuperAdmin: false, createdAt: "2026-03-05T14:15:00Z" },
  { id: "4", name: "Mike Chen", email: "mike@startup.co", isAdmin: false, isSuperAdmin: false, createdAt: "2026-03-18T09:45:00Z" },
  { id: "5", name: "Emily Davis", email: "emily@webagency.com", isAdmin: false, isSuperAdmin: false, createdAt: "2026-04-01T11:00:00Z" },
  { id: "6", name: "Alex Rodriguez", email: "alex@techlabs.io", isAdmin: false, isSuperAdmin: false, createdAt: "2026-04-12T16:20:00Z" },
  { id: "7", name: "Lisa Wang", email: "lisa@ecomstore.com", isAdmin: true, isSuperAdmin: false, createdAt: "2026-05-02T08:30:00Z" },
  { id: "8", name: "Tom Baker", email: "tom@devshop.net", isAdmin: false, isSuperAdmin: false, createdAt: "2026-05-19T13:10:00Z" },
];

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const isSuperAdmin = user?.isSuperAdmin;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Platform-wide management and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-info">CloudHost v2.0</span>
          <span className="badge badge-success">Node v24.14</span>
          {isSuperAdmin && <span className="badge bg-red-100 text-red-700">Super Admin</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: "Users", value: demoStats.users.toLocaleString(), href: "/admin/users", color: "text-blue-600", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" },
          { label: "Organizations", value: demoStats.organizations, href: "/admin/users", color: "text-indigo-600", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
          { label: "Projects", value: demoStats.projects.toLocaleString(), href: "/admin", color: "text-purple-600", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
          { label: "Deployments", value: demoStats.deployments.toLocaleString(), href: "/deployments", color: "text-green-600", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
          { label: "Databases", value: demoStats.databases, href: "/databases", color: "text-cyan-600", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
          { label: "WordPress", value: demoStats.wordpressSites, href: "/wordpress", color: "text-cyan-600", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 12a1 1 0 000 2h6a1 1 0 100-2H9z" },
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
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold">System Health</h2>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              All Systems Operational
            </span>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">CPU Cores</p>
                <p className="text-xl font-bold">16</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Uptime</p>
                <p className="text-xl font-bold">14.2d</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Memory Usage</span>
                <span className="text-gray-500">62%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-brand-500 rounded-full h-2.5" style={{ width: "62%" }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">12.4 GB free / 32 GB total</p>
            </div>
            <div className="space-y-2">
              {demoServices.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.status === "Operational" ? "bg-green-500" : s.status === "Degraded" ? "bg-yellow-500" : "bg-blue-500"}`} />
                    <span>{s.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">{s.uptime}</span>
                    <span className={`text-xs ${s.status === "Operational" ? "text-green-600" : s.status === "Degraded" ? "text-yellow-600" : "text-blue-600"}`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Quick Actions</h2>
            </div>
            <div className="card-body space-y-2">
              {[
                { label: "Manage Users", href: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" },
                { label: "Server Nodes", href: "/admin/servers", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                { label: "Billing Plans", href: "/admin/billing", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                ...(isSuperAdmin ? [
                  { label: "Feature Flags", href: "/admin", icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" },
                  { label: "Audit Logs", href: "/admin", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                  { label: "System Config", href: "/admin", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
                ] : []),
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

          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Revenue Overview</h2>
            </div>
            <div className="card-body text-center space-y-3">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold text-green-600">$128,450</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Active Subs</p>
                  <p className="text-lg font-bold text-brand-600">847</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Churn Rate</p>
                  <p className="text-lg font-bold text-red-600">3.2%</p>
                </div>
              </div>
            </div>
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
                {demoUsers.slice(0, 5).map((u: any) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-brand-700">{u.name[0]}</span>
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{u.email}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${u.isSuperAdmin ? "bg-red-100 text-red-700" : u.isAdmin ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                        {u.isSuperAdmin ? "Super Admin" : u.isAdmin ? "Admin" : "User"}
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