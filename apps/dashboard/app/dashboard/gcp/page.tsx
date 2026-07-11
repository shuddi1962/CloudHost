"use client";
import { useState } from "react";
import Link from "next/link";

const jumpStartSolutions = [
  { title: "Generative AI Knowledge Base", desc: "Build a knowledge base powered by generative AI and LLMs", icon: "🧠" },
  { title: "Generative AI RAG with Cloud SQL", desc: "Retrieval-augmented generation using Cloud SQL and LLMs", icon: "🔗" },
  { title: "Dynamic web app (Python/JS)", desc: "Deploy a Python or JavaScript dynamic web application", icon: "🐍" },
  { title: "Three-tier web app", desc: "Classic web, application, and database tier architecture", icon: "🏗️" },
  { title: "Data warehouse with BigQuery", desc: "Scalable data warehousing and analytics with BigQuery", icon: "📊" },
  { title: "AI/ML Image Processing", desc: "Image analysis and processing using AI/ML models", icon: "🖼️" },
  { title: "Generative AI Document Summarization", desc: "Automated document summarization with generative AI", icon: "📄" },
  { title: "Dynamic web app (JS)", desc: "Deploy a JavaScript-based dynamic web application", icon: "🟨" },
  { title: "Analytics lakehouse", desc: "Unified analytics lakehouse architecture on GCP", icon: "🏠" },
  { title: "Load balanced managed VMs", desc: "Auto-scaled, load-balanced managed VM instances", icon: "⚖️" },
  { title: "Ecommerce on Kubernetes", desc: "Ecommerce platform deployed on GKE", icon: "🛒" },
  { title: "Ecommerce serverless", desc: "Serverless ecommerce with Cloud Run and Firebase", icon: "☁️" },
  { title: "Dynamic web app (Java)", desc: "Deploy a Java-based dynamic web application", icon: "☕" },
  { title: "Use Cloud SDK Client Library", desc: "Get started with the Google Cloud SDK client libraries", icon: "📚" },
];

const categories = [
  { name: "Compute", slug: "/dashboard/gcp/compute", desc: "VMs, Kubernetes, VMware, Batch, and more", icon: "⚡", color: "from-blue-400 to-blue-600" },
  { name: "Storage", slug: "/dashboard/gcp/storage", desc: "Object, file, block, and backup storage", icon: "💾", color: "from-cyan-400 to-blue-600" },
  { name: "Databases", slug: "/dashboard/gcp/databases", desc: "SQL, NoSQL, caching, and migrations", icon: "🗄️", color: "from-indigo-400 to-blue-600" },
  { name: "Networking", slug: "/dashboard/gcp/networking", desc: "VPC, CDN, DNS, Load Balancing, and more", icon: "🌐", color: "from-sky-400 to-blue-600" },
];

export default function GcpPage() {
  const [deploying, setDeploying] = useState<string | null>(null);

  const handleDeploy = (title: string) => {
    setDeploying(title);
    setTimeout(() => setDeploying(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Google Cloud Platform</h1>
          <p className="text-gray-500">Google Cloud services and solutions for your platform</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Jump Start Solutions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {jumpStartSolutions.map((s) => (
            <div key={s.title} className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-blue-200 transition-all group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-lg mb-3">
                {s.icon}
              </div>
              <h3 className="font-semibold text-sm group-hover:text-blue-600">{s.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.desc}</p>
              <button
                onClick={() => handleDeploy(s.title)}
                disabled={deploying === s.title}
                className="mt-3 w-full text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {deploying === s.title ? "Deploying..." : "Deploy"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Explore all products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.slug} href={cat.slug}
              className="block p-6 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-blue-200 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-4`}>
                {cat.icon}
              </div>
              <h3 className="font-semibold text-lg group-hover:text-blue-600">{cat.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
