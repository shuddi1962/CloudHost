"use client";
import Link from "next/link";

const services = [
  { name: "DNS", desc: "Fast DNS management", icon: "🌐", route: "/cloudflare/network/dns", color: "bg-blue-500" },
  { name: "CDN", desc: "Faster delivery & caching", icon: "⚡", route: "/cloudflare/network/cdn", color: "bg-orange-500" },
  { name: "Load Balancing", desc: "Zero-downtime load balancing", icon: "⚖️", route: "/cloudflare/network/load-balancers", color: "bg-green-500" },
  { name: "API Shield", desc: "API security & monitoring", icon: "🔌", route: "/cloudflare/network/api-shield", color: "bg-purple-500" },
  { name: "Bot Management", desc: "Block bad bots", icon: "🤖", route: "/cloudflare/network/bot-management", color: "bg-red-500" },
  { name: "Spectrum", desc: "DDoS protection for TCP/UDP", icon: "📡", route: "/cloudflare/network/spectrum", color: "bg-cyan-500" },
  { name: "Waiting Room", desc: "Traffic management", icon: "🚦", route: "/cloudflare/network/waiting-room", color: "bg-yellow-500" },
  { name: "Email Routing", desc: "Custom email addresses", icon: "✉️", route: "/cloudflare/network/email-routing", color: "bg-indigo-500" },
  { name: "Log Explorer", desc: "Observability & forensics", icon: "📊", route: "/cloudflare/network/log-explorer", color: "bg-teal-500" },
  { name: "Network Interconnect", desc: "Direct physical interconnection", icon: "🔗", route: "/cloudflare/network/network-interconnect", color: "bg-gray-600" },
];

export default function NetworkPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Network</h1>
          <p className="text-gray-500">DNS, CDN, load balancing, API security and more</p>
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
    </div>
  );
}
