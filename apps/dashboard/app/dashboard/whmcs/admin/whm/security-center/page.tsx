"use client";

import { useState } from "react";
import Link from "next/link";

export default function SecurityCenterPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Allow cPanel users to modify their Apache directory": false,
    "Allow users to access compilers on the server": false,
    "Enable Brute-Force Protection": true,
    "Enable SSL/TLS for all services": true,
    "Allow shell access for resellers": false,
  });

  const toggleSetting = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const securityPolicies = [
    { name: "Brute-Force Detection", status: "Active", threshold: "5 attempts/min", action: "Block IP 30 min", color: "text-[#3cb878]" },
    { name: "cPHulk Brute-Force Protection", status: "Active", threshold: "3 attempts/15s", action: "Block IP 15 min", color: "text-[#3cb878]" },
    { name: "ModSecurity", status: "Active", threshold: "OWASP CRS 3.3", action: "Log & Block", color: "text-[#3cb878]" },
    { name: "SMTP Restrictions", status: "Active", threshold: "100/hr per domain", action: "Queue & Notify", color: "text-[#3cb878]" },
    { name: "SSH Password Auth", status: "Disabled", threshold: "Key-only enforced", action: "Key Auth Required", color: "text-[#e2372f]" },
    { name: "FTP Brute-Force Protection", status: "Active", threshold: "10 attempts/min", action: "Block IP 1 hour", color: "text-[#3cb878]" },
  ];

  const hostAccess = [
    { rule: "Allow", ip: "192.168.1.0/24", service: "SSH (22)", comment: "Internal office" },
    { rule: "Allow", ip: "10.0.0.0/8", service: "All", comment: "Internal network" },
    { rule: "Deny", ip: "185.220.101.0/24", service: "All", comment: "Known spammer" },
    { rule: "Deny", ip: "91.121.85.0/24", service: "FTP (21)", comment: "Brute-force source" },
  ];

  return (
    <div className="text-[13px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1c3f66]">Security Center</h1>
          <p className="text-xs text-gray-500">Server security policies, access control, and brute-force protection</p>
        </div>
        <Link href="/dashboard/whmcs/admin/whm" className="text-xs text-[#1c3f66] hover:underline font-medium">← Back to WHM</Link>
      </div>

      {/* Tweak Settings */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="font-semibold text-sm text-[#1c3f66]">Security Tweak Settings</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {Object.entries(toggles).map(([key, value]) => (
            <div key={key} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <span className="text-sm text-gray-700">{key}</span>
              <button onClick={() => toggleSetting(key)}
                className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-[#3cb878]" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 px-5 py-3 flex justify-end">
          <button className="px-4 py-1.5 bg-[#1c3f66] text-white rounded text-xs font-medium hover:bg-[#2b5a8a] transition-colors">Save Settings</button>
        </div>
      </div>

      {/* Security Policies */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="font-semibold text-sm text-[#1c3f66]">Active Security Policies</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-2 font-medium text-gray-600">Policy</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Status</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Threshold</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {securityPolicies.map((p) => (
                <tr key={p.name} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-2.5 font-medium text-gray-800">{p.name}</td>
                  <td className={`px-5 py-2.5 font-medium ${p.color}`}>{p.status}</td>
                  <td className="px-5 py-2.5 text-gray-500">{p.threshold}</td>
                  <td className="px-5 py-2.5 text-gray-500">{p.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Host Access Control */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-[#1c3f66]">Host Access Control</h2>
          <button className="text-xs text-[#1c3f66] hover:underline font-medium">+ Add Rule</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-2 font-medium text-gray-600">Rule</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">IP / Range</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Service</th>
                <th className="text-left px-5 py-2 font-medium text-gray-600">Comment</th>
                <th className="text-right px-5 py-2 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostAccess.map((h, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-2.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${h.rule === "Allow" ? "bg-[#3cb878]/10 text-[#3cb878]" : "bg-[#e2372f]/10 text-[#e2372f]"}`}>{h.rule}</span>
                  </td>
                  <td className="px-5 py-2.5 font-mono text-xs text-gray-800">{h.ip}</td>
                  <td className="px-5 py-2.5 text-gray-600">{h.service}</td>
                  <td className="px-5 py-2.5 text-gray-500">{h.comment}</td>
                  <td className="px-5 py-2.5 text-right">
                    <button className="text-[10px] text-[#1c3f66] hover:underline">Edit</button>
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
