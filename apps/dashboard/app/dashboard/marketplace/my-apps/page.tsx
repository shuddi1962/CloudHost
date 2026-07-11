"use client";

import { useState } from "react";
import Link from "next/link";

const myProducts = [
  { id: "my-app-1", name: "Awesome Analytics", type: "SaaS", status: "published", category: "Business Applications", installs: 234, revenue: "$1,870", listedAt: "2026-03-15" },
  { id: "my-app-2", name: "DevOps Dashboard", type: "Container", status: "under_review", category: "DevOps", installs: 0, revenue: "$0", listedAt: "2026-06-28" },
  { id: "my-app-3", name: "ML Predictor", type: "Machine Learning", status: "draft", category: "Machine Learning", installs: 0, revenue: "$0", listedAt: "" },
];

const statusBadge: Record<string, string> = {
  published: "badge-success",
  under_review: "badge-warning",
  draft: "bg-gray-100 text-gray-600",
};

export default function MyAppsPage() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Marketplace Apps</h1>
          <p className="text-gray-500">Manage your products listed on the CloudHost Marketplace</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Product
        </button>
      </div>

      {/* New Product Form */}
      {showNew && (
        <div className="card border-brand-200">
          <div className="card-header">
            <h2 className="font-semibold">List a New Product</h2>
          </div>
          <div className="card-body">
            <form className="space-y-4 max-w-lg" onSubmit={(e) => { e.preventDefault(); alert("Product submitted for review!"); setShowNew(false); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input className="input-field" placeholder="My Product" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select className="input-field" defaultValue="SaaS">
                    <option>SaaS</option><option>Container</option><option>Machine Learning</option>
                    <option>Professional Services</option><option>Data</option><option>AMI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="input-field" defaultValue="">
                    <option value="">Select...</option>
                    <option>AI Agents & Tools</option><option>Business Applications</option>
                    <option>Cloud Operations</option><option>Data Products</option><option>DevOps</option>
                    <option>Infrastructure Software</option><option>Machine Learning</option><option>Security</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field h-24" placeholder="Describe your product..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pricing</label>
                <input className="input-field" placeholder="e.g. Free, $9.99/month, Per-use" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Submit for Review</button>
                <button type="button" onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-2xl font-bold text-brand-600">{myProducts.filter(p => p.status === "published").length}</p>
          <p className="text-xs text-gray-500">Published</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-brand-600">{myProducts.reduce((a, p) => a + p.installs, 0)}</p>
          <p className="text-xs text-gray-500">Total Installs</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-green-600">{myProducts.reduce((a, p) => a + parseInt(p.revenue.replace(/[$,]/g, "") || "0"), 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Revenue</p>
        </div>
      </div>

      {/* Product Table */}
      <div className="card">
        <div className="card-body p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Installs</th>
                <th className="px-6 py-3 font-medium">Revenue</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium">{p.name}</p>
                    {p.listedAt && <p className="text-[10px] text-gray-400">Listed {p.listedAt}</p>}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.type}</td>
                  <td className="px-6 py-4 text-gray-600">{p.category}</td>
                  <td className="px-6 py-4">
                    <span className={`badge text-[10px] ${statusBadge[p.status] || "badge-info"}`}>
                      {p.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">{p.installs}</td>
                  <td className="px-6 py-4 font-medium">{p.revenue}</td>
                  <td className="px-6 py-4">
                    <button className="text-brand-600 hover:text-brand-700 text-xs font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help */}
      <div className="card bg-brand-50 border-brand-100">
        <div className="card-body flex items-start gap-4">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Seller Resources</h3>
            <p className="text-xs text-gray-600 mt-1">Visit our <a href="#" className="text-brand-600 hover:underline">Seller Guide</a> to learn about best practices, pricing strategies, and how to optimize your product listing for maximum visibility.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
