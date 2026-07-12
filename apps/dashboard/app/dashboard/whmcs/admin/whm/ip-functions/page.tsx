"use client";

import Link from "next/link";

export default function IpFunctionsPage() {
  const ips = [
    { ip: "192.168.1.101", domain: "acme.com", type: "Shared", status: "In Use", usage: "1 account" },
    { ip: "192.168.1.102", domain: "shop.acme.com", type: "Shared", status: "In Use", usage: "1 account" },
    { ip: "192.168.1.103", domain: "api.acme.com", type: "Dedicated", status: "In Use", usage: "1 account" },
    { ip: "192.168.1.104", domain: "blog.sarah.com", type: "Shared", status: "In Use", usage: "1 account" },
    { ip: "192.168.1.105", domain: "-", type: "Shared", status: "Available", usage: "Unassigned" },
    { ip: "192.168.1.106", domain: "-", type: "Dedicated", status: "Available", usage: "Unassigned" },
  ];

  return (
    <div className="text-[13px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1c3f66]">IP Functions</h1>
          <p className="text-xs text-gray-500">Manage IP addresses, allocation, and usage</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-[#3cb878] text-white rounded text-xs font-medium hover:bg-[#2da066]">+ Add IP</button>
          <Link href="/dashboard/whmcs/admin/whm" className="text-xs text-[#1c3f66] hover:underline font-medium">← Back to WHM</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total IPs", value: "256", color: "text-[#1c3f66]" },
          { label: "In Use", value: "184", color: "text-[#3cb878]" },
          { label: "Available", value: "72", color: "text-[#3ea6c9]" },
          { label: "Usage", value: "71.9%", color: "text-[#e08a1e]" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="font-semibold text-sm text-[#1c3f66]">IP Address Pool</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-2 font-medium text-gray-600">IP Address</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Domain</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Type</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Status</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Usage</th>
                <th className="text-right px-5 py-2 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ips.map((ip) => (
                <tr key={ip.ip} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-2.5 font-mono text-xs text-gray-800 font-medium">{ip.ip}</td>
                  <td className="px-5 py-2.5 text-gray-600">{ip.domain}</td>
                  <td className="px-5 py-2.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${ip.type === "Dedicated" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{ip.type}</span>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={`text-[10px] font-medium ${ip.status === "In Use" ? "text-[#3cb878]" : ip.status === "Available" ? "text-[#3ea6c9]" : "text-gray-500"}`}>{ip.status}</span>
                  </td>
                  <td className="px-5 py-2.5 text-gray-500">{ip.usage}</td>
                  <td className="px-5 py-2.5 text-right">
                    <button className="text-[10px] text-[#1c3f66] hover:underline">Assign</button>
                    <button className="text-[10px] text-[#e2372f] hover:underline ml-2">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
