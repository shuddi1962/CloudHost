"use client";
import { useState } from "react";
import Link from "next/link";

const services = [
  {
    name: "Cloud Storage",
    desc: "Enterprise-ready object storage for any data type",
    icon: "☁️",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Filestore",
    desc: "Fully managed NFS server for shared file storage",
    icon: "📁",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Backup and DR",
    desc: "Simplified backup administration and disaster recovery",
    icon: "🔄",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Storage Transfer Service",
    desc: "Fast and secure online data transfer into Cloud Storage",
    icon: "🚚",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Parallelstore",
    desc: "Managed parallel file system for HPC workloads",
    icon: "⚡",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Managed Lustre",
    desc: "High-performance parallel file system for Lustre workloads",
    icon: "🚀",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "NetApp Volumes",
    desc: "Enterprise-grade file storage with NetApp data management",
    icon: "💠",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
];

export default function GcpStoragePage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Storage</h1>
          <p className="text-gray-500">Object, file, block, and backup storage services on Google Cloud</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
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
