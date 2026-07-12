"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function DatabaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/databases/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      setDb(data.database);
    }).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!db) return <div className="text-center py-12 text-gray-400">Database not found</div>;

  const tabs = [
    { label: "Overview", href: `/dashboard/databases/${db.id}` },
    { label: "Table Editor", href: `/dashboard/table-editor?db=${db.id}` },
    { label: "SQL Editor", href: `/dashboard/sql-editor?db=${db.id}` },
    { label: "RLS Policies", href: `/dashboard/databases/${db.id}/rls` },
    { label: "Extensions", href: `/dashboard/databases/${db.id}/extensions` },
    { label: "Realtime", href: `/dashboard/databases/${db.id}/realtime` },
    { label: "Webhooks", href: `/dashboard/databases/${db.id}/webhooks` },
    { label: "API", href: `/dashboard/api?db=${db.id}` },
    { label: "Backups", href: `/dashboard/backups?db=${db.id}` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard/databases")} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">{db.name}</h1>
            <p className="text-gray-500">{db.type} {db.version}</p>
          </div>
          <span className={`badge ${db.status === "running" ? "badge-success" : "badge-warning"}`}>{db.status}</span>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <Link key={tab.label} href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab.href === `/dashboard/databases/${db.id}` ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Connection Details</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Host</span>
              <code className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{db.host}</code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Port</span>
              <code className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{db.port}</code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Database</span>
              <code className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{db.databaseName}</code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Username</span>
              <code className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{db.username}</code>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <p className="text-sm text-gray-500">Connection String</p>
          <div className="mt-3">
            <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono break-all">
              postgresql://{db.username}:******@{db.host}:{db.port}/{db.databaseName}
            </div>
            <button onClick={() => navigator.clipboard.writeText(`postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.databaseName}`)}
              className="mt-2 text-sm text-brand-600 hover:text-brand-800 font-medium">
              Copy connection string
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Public Access</p>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-sm font-medium ${db.publicAccess ? "text-green-600" : "text-gray-500"}`}>
              {db.publicAccess ? "Enabled" : "Disabled"}
            </span>
            <button className="btn-secondary text-xs">Toggle</button>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Size</p>
          <p className="text-lg font-bold mt-1">1 GB</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Created</p>
          <p className="text-lg font-bold mt-1">{new Date(db.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn-danger text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Database
        </button>
        <button className="btn-secondary text-sm">Reset Password</button>
        <button className="btn-secondary text-sm">Restart</button>
      </div>
    </div>
  );
}
