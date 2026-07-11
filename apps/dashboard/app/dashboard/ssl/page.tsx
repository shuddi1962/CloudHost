"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/api-client";

const certificateTypes = [
  { name: "Let's Encrypt", type: "free", desc: "Free SSL certificate, auto-renewed", validity: "90 days", domains: "Single", badge: "Free", color: "bg-green-100 text-green-800" },
  { name: "PositiveSSL", type: "paid", desc: "Domain-validated SSL", validity: "1 year", domains: "Single", badge: "$9/yr", color: "bg-blue-100 text-blue-800" },
  { name: "Wildcard SSL", type: "paid", desc: "Secure all subdomains", validity: "1 year", domains: "Unlimited", badge: "$69/yr", color: "bg-purple-100 text-purple-800" },
  { name: "EV SSL", type: "paid", desc: "Extended Validation - green bar", validity: "1-2 years", domains: "Single", badge: "$149/yr", color: "bg-indigo-100 text-indigo-800" },
];

const demoCertificates = [
  { id: "1", name: "example.com", type: "Let's Encrypt", status: "active", expiresAt: "2026-10-10T00:00:00Z", domains: ["example.com", "www.example.com"] },
  { id: "2", name: "myapp.com", type: "Let's Encrypt", status: "active", expiresAt: "2026-09-15T00:00:00Z", domains: ["myapp.com"] },
];

export default function SslPage() {
  const [certs, setCerts] = useState<any[]>(demoCertificates);

  const { data: certData, loading } = useApi<any>("/api/ssl/");

  useEffect(() => {
    if (certData) {
      const list = Array.isArray(certData) ? certData : certData.certificates || certData.certs || certData.data || [];
      if (list.length > 0) setCerts(list);
    }
  }, [certData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SSL Certificates</h1>
        <p className="text-gray-500">Secure your websites with automatic HTTPS</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Issue New Certificate</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {certificateTypes.map((cert) => (
              <div key={cert.name} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-200 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{cert.name}</h3>
                  <span className={`badge ${cert.color}`}>{cert.badge}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{cert.desc}</p>
                <div className="text-xs text-gray-400 space-y-1 mb-4">
                  <p>Validity: {cert.validity}</p>
                  <p>Domains: {cert.domains}</p>
                </div>
                <button className={`w-full text-sm ${cert.type === "free" ? "btn-primary" : "btn-secondary"}`}>
                  {cert.type === "free" ? "Install Free" : "Purchase"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Your Certificates</h2>
        </div>
        <div className="card-body">
          {certs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-sm">No SSL certificates installed</p>
              <p className="text-xs mt-1">Install a free Let's Encrypt certificate to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {certs.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-sm text-gray-500">{cert.type} · Expires {new Date(cert.expiresAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge ${cert.status === "active" ? "badge-success" : "badge-warning"}`}>
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
