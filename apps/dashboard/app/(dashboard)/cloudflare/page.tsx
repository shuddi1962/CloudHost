"use client";
import Link from "next/link";

const categories = [
  { name: "Compute", slug: "compute", desc: "Workers, Durable Objects, Pages, Containers, Email, Sandboxes, Platforms, Observability, Workflows", icon: "⚡", color: "from-yellow-400 to-orange-500", count: 9 },
  { name: "Storage", slug: "storage", desc: "R2, D1, KV, Queues, Hyperdrive, Cache Reserve, Artifacts, Data Platform", icon: "💾", color: "from-blue-400 to-cyan-500", count: 8 },
  { name: "AI", slug: "ai", desc: "Workers AI, Vectorize, AI Gateway, AI Search, AI Agents", icon: "🤖", color: "from-purple-400 to-pink-500", count: 5 },
  { name: "Media", slug: "media", desc: "Images, Stream, RealtimeKit", icon: "📹", color: "from-rose-400 to-red-500", count: 3 },
  { name: "Security", slug: "security", desc: "WAF, DDoS, Magic Transit, Network Firewall, Rate Limiting, SSL, Turnstile, Client-Side Security", icon: "🛡️", color: "from-green-400 to-emerald-500", count: 8 },
  { name: "Network", slug: "network", desc: "DNS, CDN, Load Balancing, API Shield, Bot Management, Spectrum, Waiting Room, Email Routing, Log Explorer, Interconnect", icon: "🌐", color: "from-sky-400 to-indigo-500", count: 10 },
  { name: "Zero Trust", slug: "zero-trust", desc: "Access, Browser Isolation, CASB, DLP, Email Security, Gateway, Mesh, WAN", icon: "🔐", color: "from-violet-400 to-purple-500", count: 8 },
];

export default function CloudflarePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cloudflare</h1>
          <p className="text-gray-500">All Cloudflare-powered services for your platform</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link key={cat.slug} href={`/cloudflare/${cat.slug}`}
            className="block p-6 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-brand-200 transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-4`}>
              {cat.icon}
            </div>
            <h3 className="font-semibold text-lg group-hover:text-brand-600">{cat.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.desc}</p>
            <span className="text-xs text-gray-400 mt-2 block">{cat.count} services</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
