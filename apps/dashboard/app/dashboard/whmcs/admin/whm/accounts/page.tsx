"use client";

import { useState } from "react";
import Link from "next/link";

export default function AccountFunctionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const accounts = [
    { domain: "acme.com", user: "acme", package: "Business", ip: "192.168.1.101", diskspace: "45 MB / 100 GB", status: "Active", created: "Jan 15, 2026" },
    { domain: "shop.acme.com", user: "shopacme", package: "Starter", ip: "192.168.1.102", diskspace: "12 MB / 50 GB", status: "Active", created: "Feb 20, 2026" },
    { domain: "api.acme.com", user: "apiacme", package: "Pro", ip: "192.168.1.103", diskspace: "28 MB / 200 GB", status: "Active", created: "Mar 05, 2026" },
    { domain: "blog.sarah.com", user: "sarahblog", package: "Business", ip: "192.168.1.104", diskspace: "234 MB / 100 GB", status: "Active", created: "Mar 18, 2026" },
    { domain: "store.mike.net", user: "mikestore", package: "Starter", ip: "192.168.1.105", diskspace: "890 MB / 50 GB", status: "Suspended", created: "Apr 01, 2026" },
    { domain: "dev.test.io", user: "testdev", package: "Pro", ip: "192.168.1.106", diskspace: "2.1 GB / 200 GB", status: "Active", created: "Apr 12, 2026" },
    { domain: "old.biz", user: "oldbiz", package: "Business", ip: "192.168.1.107", diskspace: "0 MB / 100 GB", status: "Terminated", created: "Jan 01, 2025" },
  ];

  const filtered = accounts.filter(
    (a) => a.domain.includes(searchTerm) || a.user.includes(searchTerm) || a.package.includes(searchTerm)
  );

  return (
    <div className="text-[13px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1c3f66]">Account Functions</h1>
          <p className="text-xs text-gray-500">Create, modify, suspend, and manage hosting accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-3 py-1.5 bg-[#3cb878] text-white rounded text-xs font-medium hover:bg-[#2da066] transition-colors">+ Create Account</button>
          <Link href="/dashboard/whmcs/admin/whm" className="text-xs text-[#1c3f66] hover:underline font-medium">← Back to WHM</Link>
        </div>
      </div>

      {/* Create Account Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-sm text-[#1c3f66]">Create a New Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Domain</label>
              <input className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20" placeholder="example.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Username</label>
              <input className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20" placeholder="username" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Password</label>
              <input type="password" className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Package</label>
              <select className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20">
                <option>Starter</option>
                <option>Business</option>
                <option>Pro</option>
                <option>Unlimited</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Email</label>
              <input className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">PHP Version</label>
              <select className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20">
                <option>8.2</option>
                <option>8.1</option>
                <option>8.0</option>
                <option>7.4</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreateForm(false)} className="px-4 py-1.5 border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button className="px-4 py-1.5 bg-[#3cb878] text-white rounded text-xs font-medium hover:bg-[#2da066]">Create</button>
          </div>
        </div>
      )}

      {/* Account List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-[#1c3f66]">Accounts</h2>
          <div className="flex items-center gap-2">
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search accounts..." className="w-48 px-3 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20" />
            <button className="px-3 py-1.5 bg-[#1c3f66] text-white rounded text-xs font-medium hover:bg-[#2b5a8a]">List All</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-2 font-medium text-gray-600">Domain</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Username</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Package</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">IP</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Disk Usage</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Status</th>
                <th className="text-right px-5 py-2 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.domain} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-2.5 font-medium text-gray-800">{a.domain}</td>
                  <td className="px-5 py-2.5 text-gray-600">{a.user}</td>
                  <td className="px-5 py-2.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#1c3f66]/10 text-[#1c3f66]">{a.package}</span>
                  </td>
                  <td className="px-5 py-2.5 font-mono text-gray-500">{a.ip}</td>
                  <td className="px-5 py-2.5 text-gray-500">{a.diskspace}</td>
                  <td className="px-5 py-2.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${a.status === "Active" ? "bg-[#3cb878]/10 text-[#3cb878]" : a.status === "Suspended" ? "bg-[#e08a1e]/10 text-[#e08a1e]" : "bg-gray-100 text-gray-500"}`}>{a.status}</span>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <button className="text-[10px] text-[#1c3f66] hover:underline">Modify</button>
                    <button className="text-[10px] text-[#e08a1e] hover:underline ml-2">{a.status === "Active" ? "Suspend" : "Unsuspend"}</button>
                    <button className="text-[10px] text-[#e2372f] hover:underline ml-2">Terminate</button>
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
