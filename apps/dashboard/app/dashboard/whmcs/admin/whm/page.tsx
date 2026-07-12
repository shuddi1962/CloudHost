"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const whmSections = [
  {
    title: "Server Configuration",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    color: "bg-[#1c3f66]",
    href: "/dashboard/whmcs/admin/whm/server-configuration",
    items: ["Basic Setup", "Root Password", "Cron Jobs", "Quotas", "Server Time", "Tweak Settings"],
  },
  {
    title: "Security Center",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    color: "bg-[#e2372f]",
    href: "/dashboard/whmcs/admin/whm/security-center",
    items: ["Mod Userdir Tweak", "Compiler Access", "Security Policies", "Brute-Force Protection", "SSL/TLS Manager", "Host Access Control"],
  },
  {
    title: "Networking Setup",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "bg-[#3ea6c9]",
    href: "/dashboard/whmcs/admin/whm/server-configuration",
    items: ["Hostname", "Resolver Configuration", "Nameserver Setup", "Network Interfaces"],
  },
  {
    title: "Account Functions",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197",
    color: "bg-[#3cb878]",
    href: "/dashboard/whmcs/admin/whm/accounts",
    items: ["Create Account", "Modify Account", "Upgrade/Downgrade", "Suspend/Unsuspend", "Terminate Account", "List Accounts"],
  },
  {
    title: "Packages",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    color: "bg-[#e08a1e]",
    href: "/dashboard/whmcs/admin/whm/packages",
    items: ["Add Package", "Edit Package", "Delete Package", "Package Categories", "Feature Lists"],
  },
  {
    title: "DNS Functions",
    icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9",
    color: "bg-[#1c3f66]",
    href: "/dashboard/whmcs/admin/whm/dns",
    items: ["Zone Templates", "Add DNS Zone", "Edit DNS Zone", "DNS Clustering", "Nameserver Configuration"],
  },
  {
    title: "SQL Services",
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
    color: "bg-[#e6427a]",
    href: "/dashboard/whmcs/admin/whm/sql-services",
    items: ["Manage MySQL Profiles", "Manage MariaDB Profiles", "phpMyAdmin Access", "Remote Database Access", "Database Map"],
  },
  {
    title: "IP Functions",
    icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    color: "bg-[#3ea6c9]",
    href: "/dashboard/whmcs/admin/whm/ip-functions",
    items: ["Add IP", "Remove IP", "View IP Usage", "Rebuild IP Pool", "IP Allocation Rules"],
  },
  {
    title: "Transfers",
    icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
    color: "bg-[#e08a1e]",
    href: "/dashboard/whmcs/admin/whm/transfers",
    items: ["Account Transfer", "Package Transfer", "Remote Transfer", "Transfer Status"],
  },
  {
    title: "Clusters",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5",
    color: "bg-[#1c3f66]",
    href: "/dashboard/whmcs/admin/whm/clusters",
    items: ["Cluster Status", "Add Cluster Node", "DNS Clustering", "MySQL Clustering", "Sync Cluster"],
  },
  {
    title: "Multi Account Functions",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857",
    color: "bg-[#3cb878]",
    href: "/dashboard/whmcs/admin/whm/accounts",
    items: ["Bulk Account Creation", "Parallel Account Modification", "Account Terminations"],
  },
];

const resellerAccounts = [
  { domain: "reseller1.com", package: "Reseller Pro", diskspace: "45 GB / 100 GB", accounts: 12, status: "Active" },
  { domain: "hostingboss.net", package: "Reseller Starter", diskspace: "22 GB / 50 GB", accounts: 5, status: "Active" },
  { domain: "webhostco.io", package: "Reseller Pro", diskspace: "67 GB / 100 GB", accounts: 18, status: "Active" },
  { domain: "cloudresell.com", package: "Reseller Unlimited", diskspace: "120 GB / 250 GB", accounts: 34, status: "Active" },
  { domain: "downedhost.com", package: "Reseller Pro", diskspace: "100 GB / 100 GB", accounts: 22, status: "Suspended" },
];

const sharedAccounts = [
  { domain: "acme.com", package: "Business", diskspace: "45 MB / 100 GB", ip: "192.168.1.101", status: "Active" },
  { domain: "shop.acme.com", package: "Starter", diskspace: "12 MB / 50 GB", ip: "192.168.1.102", status: "Active" },
  { domain: "api.acme.com", package: "Pro", diskspace: "28 MB / 200 GB", ip: "192.168.1.103", status: "Active" },
  { domain: "blog.sarah.com", package: "Business", diskspace: "234 MB / 100 GB", ip: "192.168.1.104", status: "Active" },
  { domain: "store.mike.net", package: "Starter", diskspace: "890 MB / 50 GB", ip: "192.168.1.105", status: "Suspended" },
];

export default function WhmPage() {
  const [searchSection, setSearchSection] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (title: string) => {
    const next = new Set(expandedSections);
    if (next.has(title)) next.delete(title);
    else next.add(title);
    setExpandedSections(next);
  };

  const filteredSections = whmSections.filter(
    (s) => s.title.toLowerCase().includes(searchSection.toLowerCase()) ||
      s.items.some((i) => i.toLowerCase().includes(searchSection.toLowerCase()))
  );

  return (
    <div className="text-[13px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-[#1c3f66]">WHM</h1>
            <span className="text-xs bg-[#1c3f66]/10 text-[#1c3f66] px-2 py-0.5 rounded font-medium">WebHost Manager v110.0</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Server: cloudhost-web1.cpanel.net · cPanel Version 110.0 (build 12)</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text" placeholder="Search features..." value={searchSection}
              onChange={(e) => setSearchSection(e.target.value)}
              className="w-48 pl-8 pr-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20 focus:border-[#1c3f66]"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <Link href="/dashboard/whmcs/admin" className="text-xs text-[#1c3f66] hover:underline font-medium">← Admin Dashboard</Link>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Left Sidebar - Reseller & Shared Accounts */}
        <div className="w-64 flex-shrink-0 space-y-4">
          {/* Reseller Accounts */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-3 py-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#1c3f66] uppercase tracking-wider">Reseller Accounts</h3>
              <span className="text-[10px] text-gray-400">{resellerAccounts.length}</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {resellerAccounts.map((r) => (
                <div key={r.domain} className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${r.status === "Active" ? "bg-[#3cb878]" : "bg-[#e2372f]"} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{r.domain}</p>
                      <p className="text-[10px] text-gray-400">{r.package} · {r.accounts} accts</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Accounts */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-3 py-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#1c3f66] uppercase tracking-wider">Shared Accounts</h3>
              <span className="text-[10px] text-gray-400">{sharedAccounts.length}</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {sharedAccounts.map((a) => (
                <div key={a.domain} className="px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${a.status === "Active" ? "bg-[#3cb878]" : "bg-[#e2372f]"} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{a.domain}</p>
                      <p className="text-[10px] text-gray-400">{a.package} · {a.diskspace}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Panel - Searchable Accordion */}
        <div className="flex-1 space-y-1">
          {filteredSections.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No features match your search.</div>
          )}
          {filteredSections.map((section) => (
            <div key={section.title} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${section.color} rounded-lg flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={section.icon} /></svg>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{section.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={section.href} onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-[#1c3f66] hover:underline font-medium">Open →</Link>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.has(section.title) ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              {expandedSections.has(section.title) && (
                <div className="border-t border-gray-100 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {section.items.map((item) => (
                    <Link key={item} href={section.href}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-50 hover:text-[#1c3f66] transition-colors">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      {item}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Support Section */}
          <div className="bg-white rounded-lg border border-gray-200 mt-4">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <h3 className="text-xs font-semibold text-[#1c3f66] uppercase tracking-wider">Support</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/dashboard/services/support-tickets" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                <div className="w-8 h-8 bg-[#3ea6c9] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">Create Support Ticket</p>
                  <p className="text-[10px] text-gray-400">Submit a ticket to support staff</p>
                </div>
              </Link>
              <Link href="/dashboard/services/support-tickets" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                <div className="w-8 h-8 bg-[#1c3f66] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">Grant cPanel Access</p>
                  <p className="text-[10px] text-gray-400">Allow support staff to access your cPanel</p>
                </div>
              </Link>
              <Link href="/dashboard/services/knowledgebase" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                <div className="w-8 h-8 bg-[#e08a1e] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">Documentation</p>
                  <p className="text-[10px] text-gray-400">Browse WHM documentation</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Themes */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <h3 className="text-xs font-semibold text-[#1c3f66] uppercase tracking-wider">Themes</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "cPanel Paper Lantern", active: true, color: "bg-[#1c3f66]" },
                { name: "cPanel Jupiter", active: false, color: "bg-[#3cb878]" },
                { name: "WHM Retro", active: false, color: "bg-[#e08a1e]" },
              ].map((t) => (
                <div key={t.name} className={`flex items-center gap-3 p-3 rounded-lg border ${t.active ? "border-[#1c3f66] bg-[#1c3f66]/5" : "border-gray-100"} transition-all`}>
                  <div className={`w-8 h-8 ${t.color} rounded-lg flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">{t.name}</p>
                    <span className={`text-[10px] font-medium ${t.active ? "text-[#3cb878]" : "text-gray-400"}`}>{t.active ? "Active" : "Not Active"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
