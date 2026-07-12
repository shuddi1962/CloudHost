"use client";
import Link from "next/link";

const services = [
  { name: "Access", desc: "Zero trust access to private resources", icon: "🔐", route: "/cloudflare/zero-trust/access", color: "bg-violet-500", comingSoon: true },
  { name: "Browser Isolation", desc: "Secure web browsing", icon: "🌍", route: "/cloudflare/zero-trust/browser-isolation", color: "bg-blue-500", comingSoon: true },
  { name: "CASB", desc: "SaaS and cloud posture management", icon: "☁️", route: "/cloudflare/zero-trust/casb", color: "bg-sky-500", comingSoon: true },
  { name: "DLP", desc: "Data loss prevention", icon: "🔏", route: "/cloudflare/zero-trust/dlp", color: "bg-red-500", comingSoon: true },
  { name: "Email Security", desc: "Phishing protection", icon: "🛡️", route: "/cloudflare/zero-trust/email-security", color: "bg-cyan-500", comingSoon: true },
  { name: "Secure Web Gateway", desc: "Web filtering & DNS filtering", icon: "🚧", route: "/cloudflare/zero-trust/gateway", color: "bg-amber-500", comingSoon: true },
  { name: "Magic Mesh", desc: "Agents private network", icon: "🔗", route: "/cloudflare/zero-trust/mesh", color: "bg-indigo-500", comingSoon: true },
  { name: "Magic WAN", desc: "Cloud-delivered networking", icon: "🌐", route: "/cloudflare/zero-trust/wan", color: "bg-emerald-500", comingSoon: true },
];

export default function ZeroTrustPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Zero Trust / SASE</h1>
          <p className="text-gray-500">Secure access, web gateway, DLP, and more</p>
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
    </div>
  );
}
