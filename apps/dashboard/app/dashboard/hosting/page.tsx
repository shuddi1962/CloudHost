"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HostingPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/hosting/account`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      setAccounts(data.accounts || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Web Hosting</h1>
          <p className="text-gray-500">Manage your shared hosting, control panel, and hosted websites</p>
        </div>
        <Link href="/dashboard/marketplace" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Website
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/dashboard/control-panel/new"}>
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="font-semibold">Create Hosting Account</h3>
          <p className="text-sm text-gray-500 mt-1">Provision a new shared hosting account with control panel</p>
        </div>

        <Link href="/dashboard/marketplace" className="card p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="font-semibold">App Marketplace</h3>
          <p className="text-sm text-gray-500 mt-1">1-click install WordPress, WooCommerce, Ghost, and 50+ apps</p>
        </Link>

        <Link href="/dashboard/deployments/universal" className="card p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="font-semibold">Universal Deploy</h3>
          <p className="text-sm text-gray-500 mt-1">Deploy any tech stack — Node, Python, PHP, Ruby, Go, Java, .NET, Docker</p>
        </Link>
      </div>

      {accounts.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mt-8">Your Hosting Accounts</h2>
          <div className="grid gap-4">
            {accounts.map((acc: any) => (
              <Link key={acc.id} href={`/dashboard/control-panel/${acc.id}`}
                className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{acc.domain}</h3>
                    <span className={`badge text-[10px] ${acc.status === "active" ? "badge-success" : acc.status === "suspended" ? "badge-error" : "badge-warning"}`}>
                      {acc.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    PHP {acc.phpVersion} | {acc.package} | {(acc.diskUsed / 1024).toFixed(1)}GB / {acc.diskQuota}MB used
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </>
      )}

      {accounts.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <p className="text-gray-500 font-medium">No hosting accounts yet</p>
            <p className="text-gray-400 text-sm mt-1">Create a hosting account to manage websites, files, databases, and email</p>
          </div>
        </div>
      )}
    </div>
  );
}
