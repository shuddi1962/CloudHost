"use client";
import { useState } from "react";
import Link from "next/link";

const services = [
  {
    name: "VPC",
    desc: "Virtual Private Cloud for isolated, secure networking",
    icon: "🔲",
    status: "GA",
    route: "#",
  },
  {
    name: "Network Services",
    desc: "Load balancing, Cloud NAT, and private connectivity",
    icon: "🌐",
    status: "GA",
    route: "#",
  },
  {
    name: "Network Connectivity",
    desc: "Connect on-prem and cloud with VPN, Interconnect, and Peering",
    icon: "🔗",
    status: "GA",
    route: "#",
  },
  {
    name: "Network Security",
    desc: "Firewall rules, policies, and security controls",
    icon: "🛡️",
    status: "GA",
    route: "#",
  },
  {
    name: "Network Intelligence",
    desc: "Visibility and diagnostics for your network topology",
    icon: "📊",
    status: "GA",
    route: "#",
  },
  {
    name: "Network Service Tiers",
    desc: "Premium Tier and Standard Tier for optimized performance",
    icon: "📶",
    status: "GA",
    route: "#",
  },
  {
    name: "Spectrum Access System",
    desc: "Dynamic spectrum allocation for wireless services",
    icon: "📡",
    status: "GA",
    route: "#",
  },
  {
    name: "Telecom Network Automation",
    desc: "Automate telecom network management and operations",
    icon: "📞",
    status: "GA",
    route: "#",
  },
  {
    name: "Cloud CDN",
    desc: "Fast, reliable content delivery using Google's global network",
    icon: "🚀",
    status: "GA",
    route: "#",
  },
  {
    name: "Cloud DNS",
    desc: "Scalable, reliable DNS service with low latency",
    icon: "📋",
    status: "GA",
    route: "#",
  },
  {
    name: "Cloud Load Balancing",
    desc: "Multi-region load balancing for all traffic types",
    icon: "⚖️",
    status: "GA",
    route: "#",
  },
  {
    name: "Cloud NAT",
    desc: "Network address translation for private instances",
    icon: "🔀",
    status: "GA",
    route: "#",
  },
  {
    name: "Cloud VPN",
    desc: "Secure VPN connections to your GCP VPC",
    icon: "🔒",
    status: "GA",
    route: "#",
  },
  {
    name: "Private Service Connect",
    desc: "Private access to managed services from your VPC",
    icon: "🔌",
    status: "GA",
    route: "#",
  },
  {
    name: "Cloud Number Registry",
    desc: "Register and manage phone numbers for communications",
    icon: "📱",
    status: "GA",
    route: "#",
  },
];

export default function GcpNetworkingPage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Networking</h1>
          <p className="text-gray-500">VPC, CDN, DNS, load balancing, and connectivity on Google Cloud</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map((s) => (
          <div
            key={s.name}
            onMouseEnter={() => setHovered(s.name)}
            onMouseLeave={() => setHovered(null)}
            className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-blue-200 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
                {s.icon}
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                {s.status}
              </span>
            </div>
            <h3 className="font-semibold">{s.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.desc}</p>
            <Link
              href={s.route}
              className="mt-3 inline-block text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Go to {s.name} &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
