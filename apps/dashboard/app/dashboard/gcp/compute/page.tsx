"use client";
import { useState } from "react";
import Link from "next/link";

const services = [
  {
    name: "Compute Engine",
    desc: "VMs, GPUs, TPUs, and disks for any workload",
    icon: "🖥️",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Google Kubernetes Engine",
    desc: "Managed Kubernetes and container orchestration",
    icon: "⎈",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "VMware Engine",
    desc: "VMware as a service on Google Cloud",
    icon: "🧩",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Batch",
    desc: "Jobs as a service for batch computing",
    icon: "📋",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "License Manager",
    desc: "Manage and track software license entitlements",
    icon: "🔑",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Workload Manager",
    desc: "Optimize workload performance and costs",
    icon: "📊",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Red Hat OpenShift",
    desc: "Enterprise Kubernetes platform by Red Hat",
    icon: "🔴",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Cluster Director",
    desc: "Orchestrate and manage cluster deployments",
    icon: "🎯",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
];

export default function GcpComputePage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compute</h1>
          <p className="text-gray-500">VMs, Kubernetes, containers, and batch computing on Google Cloud</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.name}
            onMouseEnter={() => setHovered(s.name)}
            onMouseLeave={() => setHovered(null)}
            className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-blue-200 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
                {s.icon}
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {s.status}
              </span>
            </div>
            <h3 className="font-semibold">{s.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
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
