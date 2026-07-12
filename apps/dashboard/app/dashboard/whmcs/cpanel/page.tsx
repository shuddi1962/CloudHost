"use client";

import Link from "next/link";

const groups = [
  {
    title: "Files",
    color: "bg-[#1c3f66]",
    tools: [
      { label: "File Manager", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", href: "/dashboard/whmcs/files" },
      { label: "Images", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", href: "/dashboard/whmcs/files" },
      { label: "Directory Privacy", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", href: "/dashboard/whmcs/files" },
      { label: "Disk Usage", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", href: "/dashboard/whmcs/files" },
      { label: "Web Disk", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z", href: "/dashboard/whmcs/files" },
      { label: "Backup", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", href: "/dashboard/backups" },
    ],
  },
  {
    title: "Billing & Support",
    color: "bg-[#e6427a]",
    tools: [
      { label: "Upgrade Account", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", href: "/dashboard/projects" },
      { label: "Register Domain", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", href: "/dashboard/domains" },
      { label: "Transfer Domain", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", href: "/dashboard/domains" },
      { label: "Network Status", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10", href: "/dashboard/monitoring" },
      { label: "Billing Info", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1", href: "/dashboard/admin/billing" },
      { label: "View Tickets", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", href: "/dashboard/services/support-tickets" },
      { label: "Invoice History", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", href: "/dashboard/billing" },
      { label: "Email History", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", href: "/dashboard/email" },
      { label: "News", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", href: "/dashboard/whmcs" },
      { label: "Open Ticket", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", href: "/dashboard/services/support-tickets" },
      { label: "KB Search", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", href: "/dashboard/services/knowledgebase" },
      { label: "Download Resources", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", href: "/dashboard/files" },
      { label: "Manage Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", href: "/dashboard/settings" },
    ],
  },
  {
    title: "Databases",
    color: "bg-[#3ea6c9]",
    tools: [
      { label: "phpMyAdmin", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", href: "/dashboard/databases" },
      { label: "MySQL Databases", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7", href: "/dashboard/databases" },
      { label: "MySQL DB Wizard", icon: "M13 10V3L4 14h7v7l9-11h-7z", href: "/dashboard/databases" },
      { label: "Remote MySQL", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z", href: "/dashboard/databases" },
    ],
  },
  {
    title: "Domains",
    color: "bg-[#e08a1e]",
    tools: [
      { label: "Addon Domains", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9", href: "/dashboard/domains" },
      { label: "Subdomains", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9", href: "/dashboard/domains" },
      { label: "Aliases", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z", href: "/dashboard/domains" },
      { label: "Redirects", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", href: "/dashboard/domains" },
      { label: "Zone Editor", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", href: "/dashboard/domains" },
    ],
  },
  {
    title: "Email",
    color: "bg-[#3cb878]",
    tools: [
      { label: "Email Accounts", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", href: "/dashboard/email" },
      { label: "Forwarders", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", href: "/dashboard/email" },
      { label: "MX Entry", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", href: "/dashboard/email" },
      { label: "Autoresponders", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", href: "/dashboard/email" },
      { label: "Default Address", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", href: "/dashboard/email" },
    ],
  },
];

export default function WhmcsCpanelPage() {
  return (
    <div className="space-y-6 text-[13px]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1c3f66]">cPanel Control Panel</h1>
          <p className="text-xs text-gray-500">Manage your hosting account — files, databases, domains, email &amp; more</p>
        </div>
        <div className="text-xs text-gray-400">
          WHM · cPanel v110.0
        </div>
      </div>

      {/* Grouped Sections */}
      {groups.map((group) => (
        <div key={group.title} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className={`${group.color} px-5 py-2.5`}>
            <h2 className="text-sm font-semibold text-white">{group.title}</h2>
          </div>
          <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {group.tools.map((tool) => (
              <Link key={tool.label} href={tool.href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-[#1c3f66]/10 group-hover:text-[#1c3f66] transition-colors">
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-[#1c3f66]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tool.icon} /></svg>
                </div>
                <span className="text-[11px] text-gray-600 group-hover:text-[#1c3f66] font-medium text-center leading-tight">{tool.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Server Info Footer */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-4">
        <span>Server: cloudhost-web1.cpanel.net · cPanel Version 110.0 (build 12)</span>
        <Link href="/dashboard/whmcs" className="text-[#1c3f66] hover:underline font-medium">← Back to Dashboard</Link>
      </div>
    </div>
  );
}
