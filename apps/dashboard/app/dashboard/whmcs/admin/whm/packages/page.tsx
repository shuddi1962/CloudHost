"use client";

import { useState } from "react";
import Link from "next/link";

export default function PackagesPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  const packages = [
    { name: "Starter", disk: "50 GB", bw: "500 GB", addonDomains: 1, subdomains: 5, emailAccounts: 5, ftpAccounts: 1, databases: 1, price: "$9.99/mo", categories: ["Basic"] },
    { name: "Business", disk: "100 GB", bw: "1 TB", addonDomains: 5, subdomains: 25, emailAccounts: 25, ftpAccounts: 5, databases: 10, price: "$19.99/mo", categories: ["Basic", "Popular"] },
    { name: "Pro", disk: "200 GB", bw: "2 TB", addonDomains: 20, subdomains: 100, emailAccounts: 100, ftpAccounts: 20, databases: 50, price: "$39.99/mo", categories: ["Professional"] },
    { name: "Unlimited", disk: "Unlimited", bw: "Unlimited", addonDomains: 100, subdomains: 500, emailAccounts: 500, ftpAccounts: 100, databases: 200, price: "$69.99/mo", categories: ["Professional", "Featured"] },
    { name: "Reseller Pro", disk: "100 GB", bw: "1 TB", addonDomains: 50, subdomains: 200, emailAccounts: 200, ftpAccounts: 50, databases: 50, price: "$49.99/mo", categories: ["Reseller"] },
    { name: "Reseller Unlimited", disk: "250 GB", bw: "3 TB", addonDomains: 200, subdomains: 500, emailAccounts: 500, ftpAccounts: 200, databases: 200, price: "$89.99/mo", categories: ["Reseller"] },
  ];

  return (
    <div className="text-[13px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1c3f66]">Packages</h1>
          <p className="text-xs text-gray-500">Define and manage hosting plan packages</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-[#3cb878] text-white rounded text-xs font-medium hover:bg-[#2da066] transition-colors">+ Add Package</button>
          <Link href="/dashboard/whmcs/admin/whm" className="text-xs text-[#1c3f66] hover:underline font-medium">← Back to WHM</Link>
        </div>
      </div>

      {/* Add Package Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-sm text-[#1c3f66]">Add New Package</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Package Name</label>
              <input className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20" placeholder="e.g. Gold" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Disk Space (MB)</label>
              <input className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20" placeholder="0 = unlimited" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Bandwidth (MB)</label>
              <input className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20" placeholder="0 = unlimited" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Max Addon Domains</label>
              <input className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20" placeholder="0 = unlimited" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Max Email Accounts</label>
              <input className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20" placeholder="0 = unlimited" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Max Databases</label>
              <input className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20" placeholder="0 = unlimited" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-1.5 border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button className="px-4 py-1.5 bg-[#3cb878] text-white rounded text-xs font-medium hover:bg-[#2da066]">Create Package</button>
          </div>
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div key={pkg.name} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-[#1c3f66] px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{pkg.name}</h3>
              <span className="text-xs text-white/70">{pkg.price}</span>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-xs"><span className="text-gray-500">Disk</span><span className="font-medium text-gray-800">{pkg.disk}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Bandwidth</span><span className="font-medium text-gray-800">{pkg.bw}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Addon Domains</span><span className="font-medium text-gray-800">{pkg.addonDomains}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Subdomains</span><span className="font-medium text-gray-800">{pkg.subdomains}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Email Accounts</span><span className="font-medium text-gray-800">{pkg.emailAccounts}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">FTP Accounts</span><span className="font-medium text-gray-800">{pkg.ftpAccounts}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Databases</span><span className="font-medium text-gray-800">{pkg.databases}</span></div>
              <div className="flex flex-wrap gap-1 mt-2">
                {pkg.categories.map((c) => (
                  <span key={c} className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#1c3f66]/10 text-[#1c3f66]">{c}</span>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100 px-4 py-2 flex justify-end gap-2">
              <button className="text-[10px] text-[#1c3f66] hover:underline">Edit</button>
              <button className="text-[10px] text-[#e2372f] hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
