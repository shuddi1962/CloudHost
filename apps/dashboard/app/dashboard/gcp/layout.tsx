"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: "Jump Start",
    items: [
      { href: "/dashboard/gcp", label: "Solutions Overview" },
    ],
  },
  {
    title: "Management",
    items: [
      { href: "/dashboard/gcp/management", label: "APIs & Services" },
      { href: "/dashboard/gcp/iam", label: "IAM & Admin" },
      { href: "/dashboard/gcp/settings", label: "Billing" },
      { href: "/dashboard/gcp/settings", label: "Cloud Hub" },
    ],
  },
  {
    title: "Compute",
    items: [
      { href: "/dashboard/gcp/compute", label: "Compute Engine" },
      { href: "/dashboard/gcp/compute", label: "Kubernetes Engine" },
      { href: "/dashboard/gcp/compute", label: "VMware Engine" },
      { href: "/dashboard/gcp/compute", label: "Batch" },
      { href: "/dashboard/gcp/compute", label: "Cloud Run" },
    ],
  },
  {
    title: "Storage",
    items: [
      { href: "/dashboard/gcp/storage", label: "Cloud Storage" },
      { href: "/dashboard/gcp/storage", label: "Filestore" },
      { href: "/dashboard/gcp/storage", label: "Backup & DR" },
      { href: "/dashboard/gcp/storage", label: "NetApp Volumes" },
    ],
  },
  {
    title: "Databases",
    items: [
      { href: "/dashboard/gcp/databases", label: "Database Center" },
      { href: "/dashboard/gcp/databases", label: "Cloud SQL" },
      { href: "/dashboard/gcp/databases", label: "AlloyDB" },
      { href: "/dashboard/gcp/databases", label: "Spanner" },
      { href: "/dashboard/gcp/databases", label: "Firestore" },
      { href: "/dashboard/gcp/databases", label: "Bigtable" },
      { href: "/dashboard/gcp/databases", label: "Memorystore" },
      { href: "/dashboard/gcp/databases", label: "Database Migration" },
    ],
  },
  {
    title: "Networking",
    items: [
      { href: "/dashboard/gcp/networking", label: "VPC Network" },
      { href: "/dashboard/gcp/networking", label: "Network Services" },
      { href: "/dashboard/gcp/networking", label: "Network Security" },
      { href: "/dashboard/gcp/networking", label: "Network Intelligence" },
      { href: "/dashboard/gcp/networking", label: "Cloud CDN" },
      { href: "/dashboard/gcp/networking", label: "Cloud DNS" },
      { href: "/dashboard/gcp/networking", label: "Cloud Load Balancing" },
      { href: "/dashboard/gcp/networking", label: "Cloud NAT" },
      { href: "/dashboard/gcp/networking", label: "Cloud VPN" },
      { href: "/dashboard/gcp/networking", label: "Private Service Connect" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: "/dashboard/gcp/analytics", label: "BigQuery" },
      { href: "/dashboard/gcp/analytics", label: "Pub/Sub" },
      { href: "/dashboard/gcp/analytics", label: "Dataflow" },
      { href: "/dashboard/gcp/analytics", label: "Looker" },
      { href: "/dashboard/gcp/analytics", label: "Databricks" },
      { href: "/dashboard/gcp/analytics", label: "Data Catalog" },
    ],
  },
  {
    title: "AI / ML",
    items: [
      { href: "/dashboard/gcp/ai", label: "Vertex AI" },
      { href: "/dashboard/gcp/ai", label: "Gemini" },
      { href: "/dashboard/gcp/ai", label: "Document AI" },
      { href: "/dashboard/gcp/ai", label: "Translation AI" },
      { href: "/dashboard/gcp/ai", label: "Speech AI" },
      { href: "/dashboard/gcp/ai", label: "Discovery Engine" },
      { href: "/dashboard/gcp/ai", label: "Agent Platform" },
    ],
  },
  {
    title: "Serverless",
    items: [
      { href: "/dashboard/gcp/serverless", label: "Cloud Run" },
      { href: "/dashboard/gcp/serverless", label: "Cloud Functions" },
      { href: "/dashboard/gcp/serverless", label: "App Engine" },
      { href: "/dashboard/gcp/serverless", label: "API Gateway" },
      { href: "/dashboard/gcp/serverless", label: "Eventarc" },
    ],
  },
  {
    title: "Observability",
    items: [
      { href: "/dashboard/gcp/observability", label: "Monitoring" },
      { href: "/dashboard/gcp/observability", label: "Logging" },
      { href: "/dashboard/gcp/observability", label: "Error Reporting" },
      { href: "/dashboard/gcp/observability", label: "Trace" },
      { href: "/dashboard/gcp/observability", label: "Profiler" },
    ],
  },
  {
    title: "Security",
    items: [
      { href: "/dashboard/gcp/security", label: "Security Command Center" },
      { href: "/dashboard/gcp/security", label: "Compliance" },
      { href: "/dashboard/gcp/security", label: "Cloud KMS" },
      { href: "/dashboard/gcp/security", label: "Secret Manager" },
      { href: "/dashboard/gcp/security", label: "Certificate Authority" },
      { href: "/dashboard/gcp/security", label: "Access Transparency" },
      { href: "/dashboard/gcp/security", label: "VPC Service Controls" },
      { href: "/dashboard/gcp/security", label: "Cloud Armor" },
    ],
  },
  {
    title: "CI/CD & Dev",
    items: [
      { href: "/dashboard/gcp/cicd", label: "Cloud Build" },
      { href: "/dashboard/gcp/cicd", label: "Artifact Registry" },
      { href: "/dashboard/gcp/cicd", label: "Cloud Deploy" },
      { href: "/dashboard/gcp/cicd", label: "Source Repositories" },
      { href: "/dashboard/gcp/cicd", label: "Gemini Code Assist" },
      { href: "/dashboard/gcp/cicd", label: "Firebase" },
    ],
  },
  {
    title: "Integration",
    items: [
      { href: "/dashboard/gcp/integration", label: "Workflows" },
      { href: "/dashboard/gcp/integration", label: "Cloud Tasks" },
      { href: "/dashboard/gcp/integration", label: "Cloud Scheduler" },
      { href: "/dashboard/gcp/integration", label: "Apigee" },
      { href: "/dashboard/gcp/integration", label: "Application Integration" },
      { href: "/dashboard/gcp/integration", label: "Integration Connectors" },
    ],
  },
  {
    title: "Tools & Migration",
    items: [
      { href: "/dashboard/gcp/tools", label: "Cloud Workstations" },
      { href: "/dashboard/gcp/tools", label: "Migration Center" },
      { href: "/dashboard/gcp/tools", label: "Carbon Footprint" },
      { href: "/dashboard/gcp/tools", label: "Service Health" },
      { href: "/dashboard/gcp/tools", label: "Active Assist" },
      { href: "/dashboard/gcp/tools", label: "Infrastructure Manager" },
    ],
  },
  {
    title: "Web3",
    items: [
      { href: "/dashboard/gcp/web3", label: "Blockchain Node Engine" },
      { href: "/dashboard/gcp/web3", label: "Blockchain RPC" },
    ],
  },
  {
    title: "Identity & Access",
    items: [
      { href: "/dashboard/gcp/iam", label: "IAM" },
      { href: "/dashboard/gcp/iam", label: "Service Accounts" },
      { href: "/dashboard/gcp/iam", label: "Groups" },
      { href: "/dashboard/gcp/iam", label: "Roles" },
      { href: "/dashboard/gcp/iam", label: "Workload Identity" },
      { href: "/dashboard/gcp/iam", label: "Workforce Identity" },
      { href: "/dashboard/gcp/iam", label: "Identity-Aware Proxy" },
      { href: "/dashboard/gcp/iam", label: "Org Policies" },
    ],
  },
  {
    title: "Admin",
    items: [
      { href: "/dashboard/gcp/management", label: "Quotas & Limits" },
      { href: "/dashboard/gcp/management", label: "Audit Logs" },
      { href: "/dashboard/gcp/management", label: "Labels & Tags" },
      { href: "/dashboard/gcp/iam", label: "Policy Analyzer" },
      { href: "/dashboard/gcp/iam", label: "Policy Troubleshooter" },
    ],
  },
];

const searchIcons: Record<string, string> = {
  "Compute Engine": "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  "Cloud Storage": "M4 7v10c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4z M8 7v10c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4z",
  "BigQuery": "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10",
  "Vertex AI": "M13 10V3L4 14h7v7l9-11h-7z",
  "Cloud SQL": "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4",
  "VPC Network": "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9",
  "IAM": "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  "Cloud Run": "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
  "Monitoring": "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  "Gemini": "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "Cloud Build": "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  "Security": "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  "Workflows": "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581",
  "Cloud Workstations": "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  "Migration Center": "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  "Blockchain": "M13 10V3L4 14h7v7l9-11h-7z",
  "Firebase": "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944",
  "Apigee": "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
};

export default function GcpLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Compute", "Storage", "Jump Start"]);

  function toggleGroup(title: string) {
    setExpandedGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  }

  return (
    <div className="flex gap-6">
      <aside className="w-60 flex-shrink-0">
        <div className="space-y-0.5 sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="font-bold text-sm">Google Cloud</span>
          </div>
          {navGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.title);
            const anyActive = group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
            return (
              <div key={group.title}>
                <button onClick={() => toggleGroup(group.title)}
                  className={`flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
                    anyActive ? "text-blue-700 bg-blue-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}>
                  {group.title}
                  <svg className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="ml-2 space-y-0.5 mb-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <Link key={item.href + item.label} href={item.href}
                          className={`block px-3 py-1 rounded-lg text-xs transition-colors ${
                            isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-500 hover:bg-gray-100"
                          }`}>
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
