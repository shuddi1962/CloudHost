"use client";
import { useState } from "react";
import Link from "next/link";

const services = [
  {
    name: "Database Center",
    desc: "Centralized management for all your GCP databases",
    icon: "🎛️",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "AlloyDB for PostgreSQL",
    desc: "Fully managed, PostgreSQL-compatible database for demanding workloads",
    icon: "🐘",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Cloud SQL",
    desc: "Fully managed MySQL, PostgreSQL, and SQL Server databases",
    icon: "🗃️",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Datastore",
    desc: "NoSQL document database for scalable, high-availability apps",
    icon: "📄",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Firestore",
    desc: "Serverless NoSQL document database with real-time sync",
    icon: "🔥",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Spanner",
    desc: "Globally distributed, strongly consistent relational database",
    icon: "🌍",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Bigtable",
    desc: "Fully managed, scalable NoSQL database for large analytical workloads",
    icon: "📈",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Memorystore",
    desc: "Managed in-memory caching with Valkey, Redis, and Memcached",
    icon: "⚡",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Database Migration Service",
    desc: "Simplify and accelerate database migrations to GCP",
    icon: "🔄",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "MongoDB Atlas",
    desc: "MongoDB Atlas on Google Cloud — fully managed NoSQL",
    icon: "🍃",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Neo4j Aura",
    desc: "Managed graph database powered by Neo4j on GCP",
    icon: "🔗",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Redis Cloud",
    desc: "Enterprise-grade Redis on Google Cloud",
    icon: "📦",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
  {
    name: "Oracle AI Database@Google Cloud",
    desc: "Oracle database services with AI capabilities on GCP",
    icon: "🟠",
    status: "Coming Soon",
    route: "/dashboard/coming-soon",
  },
];

export default function GcpDatabasesPage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Databases</h1>
          <p className="text-gray-500">Relational, NoSQL, caching, and managed database services on Google Cloud</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
                {s.icon}
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
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
