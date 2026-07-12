"use client";

import Link from "next/link";

export default function DnsFunctionsPage() {
  const zones = [
    { domain: "cloudhost.com", type: "Master", nameservers: "ns1.cloudhost.com, ns2.cloudhost.com", serial: "2026071201", status: "Active", records: 12 },
    { domain: "acme.com", type: "Master", nameservers: "ns1.cloudhost.com, ns2.cloudhost.com", serial: "2026071102", status: "Active", records: 8 },
    { domain: "example.org", type: "Slave", nameservers: "ns1.external.com", serial: "2026071003", status: "Active", records: 6 },
    { domain: "test.io", type: "Master", nameservers: "ns1.cloudhost.com, ns2.cloudhost.com", serial: "2026070901", status: "Suspended", records: 4 },
  ];

  return (
    <div className="text-[13px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1c3f66]">DNS Functions</h1>
          <p className="text-xs text-gray-500">DNS zone management, templates, and clustering</p>
        </div>
        <Link href="/dashboard/whmcs/admin/whm" className="text-xs text-[#1c3f66] hover:underline font-medium">← Back to WHM</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-[#1c3f66] rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Add DNS Zone</h3>
          <p className="text-xs text-gray-500 mt-1">Create a new DNS zone for a domain</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-[#3ea6c9] rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Zone Templates</h3>
          <p className="text-xs text-gray-500 mt-1">Manage DNS zone templates</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-[#e08a1e] rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Nameserver Config</h3>
          <p className="text-xs text-gray-500 mt-1">Configure nameserver settings</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="font-semibold text-sm text-[#1c3f66]">DNS Zones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-2 font-medium text-gray-600">Domain</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Type</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Nameservers</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Serial</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Records</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Status</th>
                <th className="text-right px-5 py-2 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.domain} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-2.5 font-medium text-gray-800">{z.domain}</td>
                  <td className="px-5 py-2.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${z.type === "Master" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{z.type}</span>
                  </td>
                  <td className="px-5 py-2.5 text-gray-500 text-[10px]">{z.nameservers}</td>
                  <td className="px-5 py-2.5 font-mono text-gray-500">{z.serial}</td>
                  <td className="px-5 py-2.5 text-gray-500">{z.records}</td>
                  <td className="px-5 py-2.5">
                    <span className={`text-[10px] font-medium ${z.status === "Active" ? "text-[#3cb878]" : "text-[#e08a1e]"}`}>{z.status}</span>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <button className="text-[10px] text-[#1c3f66] hover:underline">Edit</button>
                    <button className="text-[10px] text-[#e2372f] hover:underline ml-2">Delete</button>
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
