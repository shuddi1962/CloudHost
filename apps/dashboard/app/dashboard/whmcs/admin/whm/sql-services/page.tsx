"use client";

import Link from "next/link";

export default function SqlServicesPage() {
  return (
    <div className="text-[13px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1c3f66]">SQL Services</h1>
          <p className="text-xs text-gray-500">Manage MySQL and MariaDB database server profiles</p>
        </div>
        <Link href="/dashboard/whmcs/admin/whm" className="text-xs text-[#1c3f66] hover:underline font-medium">← Back to WHM</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="font-semibold text-sm text-[#1c3f66]">MySQL Profiles</h2>
          </div>
          <div className="p-4 space-y-3">
            {[
              { name: "MySQL 8.0 Default", port: 3306, memory: "2 GB", status: "Active", connections: 45 },
              { name: "MySQL 8.0 Memory Optimized", port: 3307, memory: "8 GB", status: "Active", connections: 120 },
              { name: "MariaDB 11.4", port: 3308, memory: "4 GB", status: "Active", connections: 78 },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
                <div>
                  <p className="text-xs font-medium text-gray-800">{p.name}</p>
                  <p className="text-[10px] text-gray-400">Port {p.port} · {p.memory} RAM</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium text-[#3cb878]">{p.status}</span>
                  <p className="text-[10px] text-gray-400">{p.connections} connections</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="font-semibold text-sm text-[#1c3f66]">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: "phpMyAdmin", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", desc: "Web-based MySQL admin" },
              { label: "Remote Database Access", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999", desc: "Configure remote access hosts" },
              { label: "Database Map", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586", desc: "View database-to-user mapping" },
              { label: "Upgrade MySQL", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", desc: "Upgrade database server version" },
            ].map((a) => (
              <button key={a.label} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} /></svg>
                <div>
                  <p className="text-xs font-medium text-gray-700">{a.label}</p>
                  <p className="text-[10px] text-gray-400">{a.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-[#1c3f66]">Database Server Status</h2>
          <span className="text-xs text-[#3cb878] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3cb878]" />
            All Services Running
          </span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 text-center">
            <p className="text-lg font-bold text-[#1c3f66]">MySQL 8.0</p>
            <p className="text-xs text-gray-500">v8.0.35 · 2 GB RAM</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3cb878]" />
              <span className="text-xs text-[#3cb878]">Running</span>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 text-center">
            <p className="text-lg font-bold text-[#1c3f66]">MariaDB 11.4</p>
            <p className="text-xs text-gray-500">v11.4.2 · 4 GB RAM</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3cb878]" />
              <span className="text-xs text-[#3cb878]">Running</span>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 text-center">
            <p className="text-lg font-bold text-[#1c3f66]">Total Databases</p>
            <p className="text-xs text-gray-500">876 databases across all profiles</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ea6c9]" />
              <span className="text-xs text-[#3ea6c9]">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
