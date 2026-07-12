"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ControlPanelPage() {
  const params = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/hosting/account/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      setAccount(data.account);
    }).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading control panel...</div>;
  if (!account) return <div className="text-center py-12 text-gray-400">Account not found</div>;

  const sections: Record<string, { label: string; icon: string; href: string; desc: string; color: string }[]> = {
    overview: [
      { label: "File Manager", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", href: "/dashboard/files", desc: "Upload, edit, and manage website files", color: "bg-blue-500" },
      { label: "Databases", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", href: "/dashboard/databases", desc: "Create and manage MySQL/PostgreSQL databases", color: "bg-cyan-500" },
      { label: "Domains", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9", href: "/dashboard/domains", desc: "Add domains, subdomains, and parked domains", color: "bg-indigo-500" },
      { label: "Email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", href: "/dashboard/email", desc: "Create email accounts and forwarders", color: "bg-red-500" },
      { label: "SSL / HTTPS", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", href: "/dashboard/ssl", desc: "Install free Let's Encrypt SSL certificates", color: "bg-green-500" },
      { label: "Backups", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", href: "/dashboard/backups", desc: "Manage backup schedules and restore", color: "bg-orange-500" },
      { label: "Cron Jobs", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", href: "/dashboard/cron-jobs", desc: "Schedule automated tasks", color: "bg-purple-500" },
      { label: "FTP Accounts", icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", href: "/dashboard/ftp-accounts", desc: "Manage FTP access for file transfers", color: "bg-pink-500" },
      { label: "PHP Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", href: "/dashboard/php-settings", desc: "Configure PHP version, limits & extensions", color: "bg-teal-500" },
      { label: "Marketplace", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", href: "/dashboard/marketplace", desc: "1-click install WordPress, Ghost, and more", color: "bg-amber-500" },
      { label: "WordPress", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 12a1 1 0 000 2h6a1 1 0 100-2H9z", href: "/dashboard/wordpress", desc: "Managed WordPress tools & staging", color: "bg-blue-600" },
    ],
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/dashboard/hosting")} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">{account.domain}</h1>
          <p className="text-gray-500">Control Panel — manage your hosting account</p>
        </div>
        <span className={`badge ${account.status === "active" ? "badge-success" : "badge-error"}`}>{account.status}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500">Disk Usage</p>
          <p className="text-lg font-bold text-brand-600">{(account.diskUsed / 1024).toFixed(1)} GB</p>
          <p className="text-xs text-gray-400">of {account.diskQuota} MB</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500">Bandwidth</p>
          <p className="text-lg font-bold text-purple-600">{(account.bandwidthUsed / 1024).toFixed(1)} GB</p>
          <p className="text-xs text-gray-400">of {account.bandwidthQuota} GB</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500">PHP Version</p>
          <p className="text-lg font-bold text-green-600">{account.phpVersion}</p>
          <p className="text-xs text-gray-400">configurable</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500">Server IP</p>
          <p className="text-lg font-bold text-cyan-600">{account.serverIp || "—"}</p>
          <p className="text-xs text-gray-400">{account.package} plan</p>
        </div>
      </div>

      {account.nameservers && (
        <div className="card p-4 mb-8">
          <p className="text-xs text-gray-500 mb-2">Nameservers</p>
          <div className="flex gap-4 text-sm font-mono">
            {(account.nameservers as string[]).map((ns: string, i: number) => (
              <code key={i} className="bg-gray-100 px-3 py-1.5 rounded-lg">{ns}</code>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">Account Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.overview.map((tool) => (
          <Link key={tool.label} href={tool.href}
            className="card p-4 flex items-center gap-4 hover:shadow-md hover:border-brand-200 transition-all group">
            <div className={`w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center flex-shrink-0`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tool.icon} />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm group-hover:text-brand-700 transition-colors">{tool.label}</p>
              <p className="text-xs text-gray-500">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="card p-5 mt-8">
        <p className="text-sm font-medium mb-3">Account Actions</p>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-secondary text-xs">Suspend Account</button>
          <button className="btn-secondary text-xs">Reset Password</button>
          <button className="btn-danger text-xs">Terminate Account</button>
        </div>
      </div>
    </div>
  );
}
