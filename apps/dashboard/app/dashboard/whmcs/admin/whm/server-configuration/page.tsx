"use client";

import { useState } from "react";
import Link from "next/link";

export default function ServerConfigurationPage() {
  const [hostname, setHostname] = useState("cloudhost-web1.cpanel.net");
  const [rootPassword, setRootPassword] = useState("••••••••••••••••");
  const [showPassword, setShowPassword] = useState(false);

  const configSections = [
    {
      title: "Basic Setup",
      fields: [
        { label: "Hostname", value: hostname, onChange: setHostname, type: "text" },
        { label: "Primary Nameserver", value: "ns1.cloudhost.com", type: "text" },
        { label: "Secondary Nameserver", value: "ns2.cloudhost.com", type: "text" },
      ],
    },
    {
      title: "Root Password",
      fields: [
        { label: "Current Password", value: rootPassword, type: showPassword ? "text" : "password" },
        { label: "New Password", value: "", type: "password" },
        { label: "Confirm Password", value: "", type: "password" },
      ],
    },
    {
      title: "Server Time",
      fields: [
        { label: "Time Zone", value: "America/New_York (EST)", type: "text" },
        { label: "Current Server Time", value: new Date().toLocaleString(), type: "text" },
        { label: "NTP Synchronization", value: "Enabled", type: "text" },
      ],
    },
  ];

  return (
    <div className="text-[13px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1c3f66]">Server Configuration</h1>
          <p className="text-xs text-gray-500">Basic server settings, root password, time zone, and tweaks</p>
        </div>
        <Link href="/dashboard/whmcs/admin/whm" className="text-xs text-[#1c3f66] hover:underline font-medium">← Back to WHM</Link>
      </div>

      {configSections.map((section) => (
        <div key={section.title} className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="font-semibold text-sm text-[#1c3f66]">{section.title}</h2>
          </div>
          <div className="p-5 space-y-4">
            {section.fields.map((field) => (
              <div key={field.label} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <label className="text-xs font-medium text-gray-600">{field.label}</label>
                <div className="sm:col-span-2 relative">
                  <input
                    type={field.type} value={field.value}
                    onChange={field.onChange ? (e) => field.onChange(e.target.value) : undefined}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20 focus:border-[#1c3f66]"
                  />
                  {field.label === "Current Password" && (
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#1c3f66] hover:underline">
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-5 py-3 flex justify-end">
            <button className="px-4 py-1.5 bg-[#1c3f66] text-white rounded text-xs font-medium hover:bg-[#2b5a8a] transition-colors">Save Settings</button>
          </div>
        </div>
      ))}

      {/* Cron Jobs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-[#1c3f66]">Cron Jobs</h2>
          <button className="text-xs text-[#1c3f66] hover:underline font-medium">+ Add New</button>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { command: "/usr/local/cpanel/bin/autossl-check", schedule: "*/5 * * * *", lastRun: "2 min ago", status: "Completed" },
            { command: "/scripts/upcp --cron", schedule: "0 0 * * *", lastRun: "12 hours ago", status: "Completed" },
            { command: "/usr/local/cpanel/scripts/diskusage", schedule: "0 */6 * * *", lastRun: "4 hours ago", status: "Completed" },
            { command: "/usr/local/cpanel/bin/dcpumon", schedule: "* * * * *", lastRun: "1 min ago", status: "Running" },
          ].map((cron, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div>
                <p className="text-xs font-mono text-gray-800">{cron.command}</p>
                <p className="text-[10px] text-gray-400">Schedule: {cron.schedule}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400">{cron.lastRun}</p>
                <span className={`text-[10px] font-medium ${cron.status === "Running" ? "text-[#e08a1e]" : "text-[#3cb878]"}`}>{cron.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quotas */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="font-semibold text-sm text-[#1c3f66]">Quotas</h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Disk Quota", used: "1.2 TB", total: "5 TB", pct: 24, color: "bg-[#3cb878]" },
            { label: "Inode Quota", used: "850K", total: "5M", pct: 17, color: "bg-[#3ea6c9]" },
            { label: "Bandwidth Quota", used: "3.4 TB", total: "10 TB", pct: 34, color: "bg-[#e08a1e]" },
            { label: "Email Quota", used: "45 GB", total: "100 GB", pct: 45, color: "bg-[#e6427a]" },
          ].map((q) => (
            <div key={q.label} className="p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{q.label}</p>
              <p className="text-lg font-bold text-[#1c3f66]">{q.used} <span className="text-xs text-gray-400">/ {q.total}</span></p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className={`${q.color} rounded-full h-1.5`} style={{ width: `${q.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
