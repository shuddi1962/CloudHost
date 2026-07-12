"use client";

import Link from "next/link";

export default function ClustersPage() {
  const nodes = [
    { name: "cloudhost-web1", ip: "10.0.1.101", role: "Primary Web", status: "Online", load: "0.45", services: 45, uptime: "45d 12h" },
    { name: "cloudhost-web2", ip: "10.0.1.102", role: "Web Node", status: "Online", load: "0.32", services: 38, uptime: "45d 12h" },
    { name: "cloudhost-db1", ip: "10.0.2.101", role: "Database Primary", status: "Online", load: "0.78", services: 12, uptime: "90d 3h" },
    { name: "cloudhost-db2", ip: "10.0.2.102", role: "Database Replica", status: "Online", load: "0.21", services: 12, uptime: "90d 3h" },
    { name: "cloudhost-dns1", ip: "10.0.3.101", role: "DNS Primary", status: "Online", load: "0.12", services: 3, uptime: "120d 0h" },
    { name: "cloudhost-dns2", ip: "10.0.3.102", role: "DNS Secondary", status: "Online", load: "0.08", services: 3, uptime: "120d 0h" },
    { name: "cloudhost-backup", ip: "10.0.4.101", role: "Backup Node", status: "Offline", load: "0.00", services: 2, uptime: "0d 0h" },
  ];

  return (
    <div className="text-[13px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1c3f66]">Clusters</h1>
          <p className="text-xs text-gray-500">Multi-server cluster management and synchronization</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-[#3cb878] text-white rounded text-xs font-medium hover:bg-[#2da066]">+ Add Node</button>
          <Link href="/dashboard/whmcs/admin/whm" className="text-xs text-[#1c3f66] hover:underline font-medium">← Back to WHM</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Cluster Nodes", value: "7", color: "text-[#1c3f66]" },
          { label: "Online", value: "6", color: "text-[#3cb878]" },
          { label: "Offline", value: "1", color: "text-[#e2372f]" },
          { label: "Total Services", value: "115", color: "text-[#3ea6c9]" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="font-semibold text-sm text-[#1c3f66]">Cluster Nodes</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {nodes.map((node) => (
              <div key={node.name} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${node.status === "Online" ? "bg-[#3cb878]" : "bg-[#e2372f]"} flex-shrink-0`} />
                  <div>
                    <p className="text-xs font-medium text-gray-800">{node.name}</p>
                    <p className="text-[10px] text-gray-400">{node.ip} · {node.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Load: {node.load}</p>
                  <p className="text-[10px] text-gray-400">Uptime: {node.uptime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="font-semibold text-sm text-[#1c3f66]">Cluster Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: "Configure DNS Clustering", desc: "Synchronize DNS zones across cluster", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9" },
                { label: "Configure MySQL Clustering", desc: "Set up database replication", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7" },
                { label: "Synchronize Cluster", desc: "Sync all services across nodes", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9" },
                { label: "Cluster Status Report", desc: "View detailed cluster health report", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6" },
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

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="font-semibold text-sm text-[#1c3f66]">Cluster Health</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-bold text-[#3cb878]">98.7%</span>
                  <p className="text-xs text-gray-500 mt-1">Cluster Uptime (30 days)</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-gray-50">
                  <p className="text-sm font-bold text-[#1c3f66]">124 ms</p>
                  <p className="text-[10px] text-gray-500">Avg. Latency</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-50">
                  <p className="text-sm font-bold text-[#1c3f66]">2.3 Gbps</p>
                  <p className="text-[10px] text-gray-500">Total Throughput</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
