"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const services = [
  { name: "WAF", desc: "Web application firewall rules", icon: "🛡️", route: "/cloudflare/security/waf", color: "bg-green-500" },
  { name: "DDoS Protection", desc: "DDoS mitigation & alerts", icon: "⚔️", route: "/cloudflare/security/ddos", color: "bg-red-500" },
  { name: "Magic Transit", desc: "DDoS protection for networks", icon: "🔀", route: "/cloudflare/security/magic-transit", color: "bg-blue-500" },
  { name: "Network Firewall", desc: "Cloud-native network firewall", icon: "🧱", route: "/cloudflare/security/network-firewall", color: "bg-gray-600" },
  { name: "Rate Limiting", desc: "Abuse prevention", icon: "⏱️", route: "/cloudflare/security/rate-limiting", color: "bg-yellow-500" },
  { name: "SSL", desc: "Secure your site with SSL", icon: "🔒", route: "/cloudflare/security/ssl", color: "bg-cyan-500" },
  { name: "Turnstile", desc: "CAPTCHA replacement", icon: "✅", route: "/cloudflare/security/turnstile", color: "bg-purple-500" },
  { name: "Client-Side Security", desc: "Client-side protection", icon: "👁️", route: "/cloudflare/security/client-security", color: "bg-indigo-500" },
];

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security</h1>
          <p className="text-gray-500">WAF, DDoS protection, SSL, bot management and more</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
