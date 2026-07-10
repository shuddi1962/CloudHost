"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const services = [
  { name: "Workers", desc: "Global serverless functions", icon: "⚡", route: "/cloudflare/compute/workers", color: "bg-yellow-500" },
  { name: "Durable Objects", desc: "Stateful compute", icon: "🔵", route: "/cloudflare/compute/durable-objects", color: "bg-blue-500" },
  { name: "Cloudflare Pages", desc: "Build & deploy frontend sites", icon: "📄", route: "/cloudflare/compute/pages", color: "bg-orange-500" },
  { name: "Containers", desc: "Any language, anywhere", icon: "🐳", route: "/cloudflare/compute/containers", color: "bg-cyan-500" },
  { name: "Email Service", desc: "Send and receive email", icon: "✉️", route: "/cloudflare/compute/email", color: "bg-indigo-500" },
  { name: "Sandboxes", desc: "Secure code execution", icon: "📦", route: "/cloudflare/compute/sandboxes", color: "bg-green-500" },
  { name: "Workers for Platforms", desc: "Programmable Platform Solutions", icon: "🏗️", route: "/cloudflare/compute/platforms", color: "bg-purple-500" },
  { name: "Workers Observability", desc: "First-party observability", icon: "📊", route: "/cloudflare/compute/observability", color: "bg-teal-500" },
  { name: "Workflows", desc: "Process orchestration", icon: "🔄", route: "/cloudflare/compute/workflows", color: "bg-rose-500" },
];

export default function CloudflareComputePage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [containers, setContainers] = useState<any[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetch("/api/cloudflare/compute/workers", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setWorkers(d.workers || [])).catch(() => {});
    fetch("/api/cloudflare/compute/containers", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setContainers(d.containers || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compute</h1>
          <p className="text-gray-500">Serverless functions, containers, pages, and more</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <Link key={s.route} href={s.route}
            className="block p-5 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-brand-200 transition-all"
          >
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>{s.icon}</div>
            <h3 className="font-semibold">{s.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="p-5 rounded-xl border border-gray-200 bg-white">
          <h3 className="font-semibold mb-3">Workers Overview</h3>
          <div className="space-y-2">
            {workers.slice(0, 5).map((w: any) => (
              <div key={w.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                <span className="font-medium">{w.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${w.status === "active" ? "bg-green-100 text-green-700" : w.status === "deploying" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{w.status}</span>
              </div>
            ))}
            {workers.length === 0 && <p className="text-sm text-gray-400">No workers deployed yet</p>}
          </div>
        </div>
        <div className="p-5 rounded-xl border border-gray-200 bg-white">
          <h3 className="font-semibold mb-3">Containers Overview</h3>
          <div className="space-y-2">
            {containers.slice(0, 5).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                <span><span className="font-medium">{c.name}</span> <span className="text-gray-400">({c.image}:{c.tag})</span></span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "running" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{c.status}</span>
              </div>
            ))}
            {containers.length === 0 && <p className="text-sm text-gray-400">No containers running</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
