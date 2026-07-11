"use client"

import Link from "next/link"

const services = [
  {
    name: "BigQuery",
    description: "Data warehouse and analytics platform with built-in Gen AI capabilities for large-scale querying.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 8h8M8 12h6M8 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Pub/Sub",
    description: "Global real-time messaging and event ingestion system for building event-driven applications.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Dataflow",
    description: "Streaming analytics service for real-time data processing pipelines with auto-scaling.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4l6 6-6 6M20 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Managed Apache Airflow",
    description: "Fully managed workflow orchestration service built on Apache Airflow for DAG-based pipelines.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 15h4l2-6 4 12 2-6h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Managed Apache Spark",
    description: "Fully managed Spark cluster service for large-scale data processing and analytics workloads.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9" />
      </svg>
    ),
  },
  {
    name: "Alteryx Designer Cloud",
    description: "Cloud-based analytics automation platform for data preparation, blending, and analysis.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Data Fusion",
    description: "Cloud-native data integration platform for building and managing ETL/ELT pipelines at scale.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 20h16M4 20V4M4 20l6-10 4 6 6-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Looker",
    description: "Enterprise business intelligence platform for data exploration, visualization, and embedded analytics.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    name: "Healthcare API",
    description: "HIPAA-compliant API for ingesting, storing, and analyzing healthcare data at enterprise scale.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
        <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
      </svg>
    ),
  },
  {
    name: "Elastic Cloud",
    description: "Managed Elasticsearch service for real-time search, logging, and analytics across any data source.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    ),
  },
  {
    name: "Databricks",
    description: "Unified data analytics and AI platform with collaborative notebooks and lakehouse architecture.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" />
        <path d="M12 12l-8-4M12 12l8-4M12 12v9" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Earth Engine",
    description: "Planetary-scale geospatial analysis platform for environmental monitoring and earth observation.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a15 15 0 010 18 15 15 0 010-18z" />
        <path d="M3 12h18" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Managed Kafka",
    description: "Fully managed Apache Kafka service for high-throughput data streaming and event processing.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v6M12 16v6M12 9l3 3-3 3M12 9l-3 3 3 3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Confluent Cloud",
    description: "Managed Apache Kafka platform with advanced stream processing and data integration capabilities.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16v16H4z" />
        <path d="M4 4l16 16M20 4L4 20" />
      </svg>
    ),
  },
  {
    name: "Lakehouse",
    description: "Open-source Iceberg-based lakehouse engine for unified batch and streaming analytics on data lakes.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v20M2 12h20M4 4l16 16M20 4L4 16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Data Catalog",
    description: "Managed metadata management service for discovering, understanding, and governing data assets.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
  {
    name: "Datastream",
    description: "Serverless change data capture (CDC) service for real-time replication across databases and storage.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 12h18M12 3l9 9-9 9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Knowledge Catalog",
    description: "AI-powered data and analytics catalog for automated discovery, classification, and governance.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M8 8h8M8 12h6M8 16h4" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Data</h1>
          </div>
          <p className="text-gray-500 ml-14">
            Data warehousing, streaming analytics, messaging, and business intelligence services.
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
