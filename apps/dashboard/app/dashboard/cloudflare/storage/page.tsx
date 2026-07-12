"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const services = [
  { name: "R2", desc: "Egress-free object storage", icon: "🗄️", route: "/cloudflare/storage/r2", color: "bg-blue-500", comingSoon: false },
  { name: "D1", desc: "Serverless SQL database", icon: "🗃️", route: "/cloudflare/storage/d1", color: "bg-indigo-500", comingSoon: false },
  { name: "KV", desc: "Ultra-fast key-value storage", icon: "🔑", route: "/cloudflare/storage/kv", color: "bg-yellow-500", comingSoon: false },
  { name: "Queues", desc: "Message processing at scale", icon: "📨", route: "/cloudflare/storage/queues", color: "bg-purple-500", comingSoon: true },
  { name: "Hyperdrive", desc: "Global database acceleration", icon: "🚀", route: "/cloudflare/storage/hyperdrive", color: "bg-cyan-500", comingSoon: true },
  { name: "Cache Reserve", desc: "Persistent caching for static content", icon: "💨", route: "/cloudflare/storage/cache-reserve", color: "bg-green-500", comingSoon: true },
  { name: "Artifacts", desc: "Git-native versioned storage", icon: "📦", route: "/cloudflare/storage/artifacts", color: "bg-orange-500", comingSoon: true },
  { name: "Data Platform", desc: "Ingest, catalog & query", icon: "📊", route: "/cloudflare/storage/data-platform", color: "bg-rose-500", comingSoon: true },
];

export default function StoragePage() {
  const [r2, setR2] = useState<any[]>([]);
  const [d1, setD1] = useState<any[]>([]);
  const [kv, setKV] = useState<any[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch("/api/cloudflare/storage/r2", { headers: h }).then(r => r.json()).then(d => setR2(d.buckets || [])).catch(() => {});
    fetch("/api/cloudflare/storage/d1", { headers: h }).then(r => r.json()).then(d => setD1(d.databases || [])).catch(() => {});
    fetch("/api/cloudflare/storage/kv", { headers: h }).then(r => r.json()).then(d => setKV(d.namespaces || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Storage</h1>
          <p className="text-gray-500">Object storage, databases, KV, queues and more</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((s) => (
          s.comingSoon ? (
            <div key={s.route} className="block p-5 rounded-xl border border-gray-200 bg-white opacity-60 cursor-not-allowed">
              <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>{s.icon}</div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{s.name}</h3>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Coming Soon</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </div>
          ) : (
            <Link key={s.route} href={s.route}
              className="block p-5 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-brand-200 transition-all"
            >
              <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>{s.icon}</div>
              <h3 className="font-semibold">{s.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </Link>
          )
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <h3 className="font-semibold text-sm mb-2">R2 Buckets</h3>
          <p className="text-2xl font-bold text-blue-600">{r2.length}</p>
          <p className="text-xs text-gray-400">{r2.reduce((a: number, b: any) => a + (b.objectCount || 0), 0)} total objects</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <h3 className="font-semibold text-sm mb-2">D1 Databases</h3>
          <p className="text-2xl font-bold text-indigo-600">{d1.length}</p>
          <p className="text-xs text-gray-400">Serverless SQL databases</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <h3 className="font-semibold text-sm mb-2">KV Namespaces</h3>
          <p className="text-2xl font-bold text-yellow-600">{kv.length}</p>
          <p className="text-xs text-gray-400">{kv.reduce((a: number, b: any) => a + (b.keyCount || 0), 0)} total keys</p>
        </div>
      </div>
    </div>
  );
}
