"use client";

import Link from "next/link";

export default function TransfersPage() {
  const transfers = [
    { domain: "oldhost.com", type: "cPanel → cPanel", progress: 100, status: "Completed", started: "Jul 10, 2026", size: "2.4 GB", accounts: 3 },
    { domain: "legacy-site.net", type: "cPanel → cPanel", progress: 72, status: "In Progress", started: "Jul 12, 2026", size: "8.1 GB", accounts: 1 },
    { domain: "fromplesk.com", type: "Plesk → cPanel", progress: 45, status: "In Progress", started: "Jul 12, 2026", size: "12.5 GB", accounts: 5 },
    { domain: "directadmin.org", type: "DirectAdmin → cPanel", progress: 0, status: "Queued", started: "-", size: "3.2 GB", accounts: 2 },
    { domain: "oldsite.io", type: "cPanel → cPanel", progress: 100, status: "Failed", started: "Jul 8, 2026", size: "1.8 GB", accounts: 1 },
  ];

  return (
    <div className="text-[13px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1c3f66]">Transfers</h1>
          <p className="text-xs text-gray-500">Migrate accounts from other servers or control panels</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-[#3cb878] text-white rounded text-xs font-medium hover:bg-[#2da066]">+ New Transfer</button>
          <Link href="/dashboard/whmcs/admin/whm" className="text-xs text-[#1c3f66] hover:underline font-medium">← Back to WHM</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Account Transfer", desc: "Migrate individual cPanel accounts", icon: "M8 7h12m0 0l-4-4m4 4l-4 4" },
          { label: "Package Transfer", desc: "Transfer hosting packages between servers", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" },
          { label: "Remote Transfer", desc: "Transfer from Plesk, DirectAdmin, or remote cPanel", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999" },
        ].map((t) => (
          <div key={t.label} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 bg-[#1c3f66] rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} /></svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-800">{t.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="font-semibold text-sm text-[#1c3f66]">Transfer Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-2 font-medium text-gray-600">Domain</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Type</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Progress</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Status</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Size</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Accounts</th>
                <th className="text-right px-5 py-2 font-medium text-gray-600">Started</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.domain} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-2.5 font-medium text-gray-800">{t.domain}</td>
                  <td className="px-5 py-2.5 text-gray-500 text-[10px]">{t.type}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div className={`${t.status === "Completed" ? "bg-[#3cb878]" : t.status === "Failed" ? "bg-[#e2372f]" : "bg-[#e08a1e]"} rounded-full h-1.5`} style={{ width: `${t.progress}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500">{t.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={`text-[10px] font-medium ${t.status === "Completed" ? "text-[#3cb878]" : t.status === "Failed" ? "text-[#e2372f]" : t.status === "In Progress" ? "text-[#e08a1e]" : "text-gray-400"}`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-2.5 text-gray-500">{t.size}</td>
                  <td className="px-5 py-2.5 text-gray-500">{t.accounts}</td>
                  <td className="px-5 py-2.5 text-right text-gray-500">{t.started}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
