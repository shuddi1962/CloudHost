"use client";

import { useState } from "react";

const apps = [
  { name: "WordPress", desc: "Blog & CMS platform", icon: "W", color: "bg-blue-600", category: "CMS", url: "/dashboard/wordpress" },
  { name: "Ghost", desc: "Modern publishing platform", icon: "G", color: "bg-black", category: "CMS" },
  { name: "Strapi", desc: "Headless CMS", icon: "S", color: "bg-purple-600", category: "CMS" },
  { name: "n8n", desc: "Workflow automation", icon: "n", color: "bg-red-600", category: "Automation", url: "/dashboard/workflows" },
  { name: "Next.js", desc: "React framework", icon: "N", color: "bg-black", category: "Framework", url: "/dashboard/deployments" },
  { name: "Node.js", desc: "JavaScript runtime", icon: "N", color: "bg-green-600", category: "Runtime" },
  { name: "Python", desc: "Python web apps", icon: "P", color: "bg-yellow-600", category: "Runtime" },
  { name: "PHP", desc: "PHP apps", icon: "P", color: "bg-indigo-600", category: "Runtime" },
  { name: "MongoDB", desc: "NoSQL database", icon: "M", color: "bg-green-700", category: "Database" },
  { name: "Redis", desc: "In-memory cache", icon: "R", color: "bg-red-500", category: "Database" },
  { name: "PostgreSQL", desc: "Relational database", icon: "P", color: "bg-blue-800", category: "Database", url: "/dashboard/databases" },
  { name: "MySQL", desc: "SQL database", icon: "M", color: "bg-orange-600", category: "Database" },
  { name: "Django", desc: "Python web framework", icon: "D", color: "bg-green-800", category: "Framework" },
  { name: "Laravel", desc: "PHP framework", icon: "L", color: "bg-red-700", category: "Framework" },
  { name: "Directus", desc: "Headless CMS", icon: "D", color: "bg-teal-600", category: "CMS" },
  { name: "Plausible", desc: "Web analytics", icon: "P", color: "bg-blue-500", category: "Analytics" },
  { name: "Umami", desc: "Privacy analytics", icon: "U", color: "bg-green-500", category: "Analytics" },
  { name: "Minio", desc: "S3-compatible storage", icon: "M", color: "bg-red-600", category: "Storage" },
  { name: "WooCommerce", desc: "Ecommerce for WP", icon: "W", color: "bg-purple-700", category: "Ecommerce" },
  { name: "Magento", desc: "Ecommerce platform", icon: "M", color: "bg-orange-500", category: "Ecommerce" },
];

const categories = [...new Set(apps.map(a => a.category))];

export default function AppCatalogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = apps.filter(a => {
    if (category !== "All" && a.category !== category) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">App Catalog</h1>
        <p className="text-gray-500">Deploy open-source applications with one click</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-field w-64" placeholder="Search apps..." />
        <div className="flex gap-1 flex-wrap">
          {["All", ...categories].map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === c ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((app) => (
          <div key={app.name}
            className="card p-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className={`w-12 h-12 ${app.color} rounded-xl flex items-center justify-center mb-3`}>
              <span className="text-white font-bold text-lg">{app.icon}</span>
            </div>
            <p className="font-semibold text-sm group-hover:text-brand-600 transition-colors">{app.name}</p>
            <p className="text-xs text-gray-500 mt-1">{app.desc}</p>
            <span className="inline-block mt-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{app.category}</span>
            <button className="mt-3 w-full text-xs btn-primary py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Deploy
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No apps found matching your search</p>
        </div>
      )}
    </div>
  );
}
