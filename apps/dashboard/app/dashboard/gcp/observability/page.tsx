"use client"

import Link from "next/link"

const services = [
  {
    name: "Cloud Monitoring",
    description: "Full-stack monitoring with dashboards, alerting, and visibility into applications, infrastructure, and services.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18" strokeLinecap="round" />
        <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Cloud Logging",
    description: "Real-time log management with ingestion, storage, search, analysis, and export at any scale.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6h16M4 12h16M4 18h12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Error Reporting",
    description: "Real-time exception monitoring and alerting with automatic grouping, analysis, and crash trends.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Cloud Trace",
    description: "Distributed tracing system for latency analysis and performance optimization across microservices.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 12h4l3-9 4 18 3-9h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Cloud Profiler",
    description: "Statistical CPU and memory profiling for identifying performance bottlenecks in production code.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 12h18M12 3v18" strokeLinecap="round" />
        <circle cx="8" cy="8" r="1.5" />
        <circle cx="16" cy="8" r="1.5" />
        <circle cx="8" cy="16" r="1.5" />
        <circle cx="16" cy="16" r="1.5" />
      </svg>
    ),
  },
  {
    name: "Capacity Planner",
    description: "Resource capacity planning and forecasting tool for optimizing cloud resource allocation and costs.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="18" rx="1" />
        <rect x="14" y="8" width="7" height="13" rx="1" />
      </svg>
    ),
  },
  {
    name: "App Hub",
    description: "Centralized view of your application portfolio with automated discovery, grouping, and monitoring.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="8" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
        <rect x="13" y="13" width="8" height="8" rx="2" />
      </svg>
    ),
  },
  {
    name: "App Lifecycle Manager",
    description: "Automate application deployment, upgrades, and rollbacks across environments with policy-based controls.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l4 4-4 4M12 6H4M12 18l-4-4 4-4M12 14h8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function ObservabilityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" strokeLinecap="round" />
                <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Observability & Ops</h1>
          </div>
          <p className="text-gray-500 ml-14">
            Monitoring, logging, tracing, and operations management for your cloud applications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Link
              key={service.name}
              href="#"
              className="group block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-600 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                  {service.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {service.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
