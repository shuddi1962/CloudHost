"use client";

import { useState } from "react";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7d");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-gray-500">Track performance, usage, and growth</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {["24h", "7d", "30d", "90d"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${period === p ? "bg-white shadow-sm" : "text-gray-500"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Visitors", value: "0", change: "0%", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z", color: "text-blue-600" },
          { label: "Page Views", value: "0", change: "0%", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-purple-600" },
          { label: "Bandwidth", value: "0 GB", change: "0%", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7", color: "text-green-600" },
          { label: "API Requests", value: "0", change: "0%", icon: "M8 9l3 3-3 3m5 0h3", color: "text-orange-600" },
        ].map(s => (
          <div key={s.label} className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <svg className={`w-5 h-5 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
              </svg>
              <span className="text-xs text-green-600 font-medium">{s.change}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h2 className="font-semibold">Traffic Overview</h2>
          </div>
          <div className="card-body h-64 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm">No traffic data yet</p>
              <p className="text-xs mt-1">Data will appear once your sites receive visitors</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">Top Pages</h2>
          </div>
          <div className="card-body">
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No data</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Active Deployments</p>
          <p className="text-2xl font-bold text-purple-600">0</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Database Queries</p>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">CDN Cache Hit Rate</p>
          <p className="text-2xl font-bold text-brand-600">0%</p>
        </div>
      </div>
    </div>
  );
}
