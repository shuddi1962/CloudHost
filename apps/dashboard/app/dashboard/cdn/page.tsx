"use client";

import { useState } from "react";

const securityFeatures = [
  { name: "CDN", desc: "Global content delivery network", status: "Enabled", icon: "M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.701 2.701 0 001.5 15.546M21 12.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.701 2.701 0 001.5 12.546M21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" },
  { name: "WAF", desc: "Web application firewall", status: "Enabled", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { name: "DDoS Protection", desc: "Mitigate DDoS attacks", status: "Enabled", icon: "M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" },
  { name: "Bot Mitigation", desc: "Block malicious bots", status: "Disabled", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { name: "Rate Limiting", desc: "Protect against abuse", status: "Disabled", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { name: "Load Balancing", desc: "Distribute traffic", status: "Disabled", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
];

export default function CdnPage() {
  const [features, setFeatures] = useState(securityFeatures);

  const toggleFeature = (name: string) => {
    setFeatures(features.map(f =>
      f.name === name ? { ...f, status: f.status === "Enabled" ? "Disabled" : "Enabled" } : f
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CDN & Security</h1>
        <p className="text-gray-500">Global CDN, DDoS protection, WAF, and more</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Security Features</h2>
        </div>
        <div className="card-body space-y-3">
          {features.map((f) => (
            <div key={f.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                </svg>
                <div>
                  <p className="font-medium">{f.name}</p>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${f.status === "Enabled" ? "badge-success" : "badge-warning"}`}>{f.status}</span>
                <button onClick={() => toggleFeature(f.name)}
                  className={`w-12 h-6 rounded-full transition-colors ${f.status === "Enabled" ? "bg-brand-600" : "bg-gray-300"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${f.status === "Enabled" ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">CDN Analytics</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Requests", value: "0", sub: "Last 24h" },
                { label: "Bandwidth Saved", value: "0 GB", sub: "CDN cache hit" },
                { label: "Avg. Response Time", value: "0ms", sub: "Global average" },
                { label: "Cache Hit Rate", value: "0%", sub: "Edge caching" },
              ].map((s) => (
                <div key={s.label} className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-brand-600">{s.value}</p>
                  <p className="text-sm font-medium mt-1">{s.label}</p>
                  <p className="text-xs text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">Edge Network</h2>
          </div>
          <div className="card-body">
            <p className="text-sm text-gray-600 mb-4">CloudHost Edge runs on 330+ data centers worldwide.</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {["North America", "South America", "Europe", "Asia", "Africa", "Oceania"].map((region) => (
                <div key={region} className="p-2 bg-gray-50 rounded-lg flex justify-between">
                  <span>{region}</span>
                  <span className="text-gray-400">✅ Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
