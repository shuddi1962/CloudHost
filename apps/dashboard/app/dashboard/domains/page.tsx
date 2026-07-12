"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/api-client";

const demoDomains = [
  { id: "1", name: "example.com", verified: true, dnsRecords: [{ type: "A", name: "@", value: "192.168.1.1", ttl: 3600 }, { type: "CNAME", name: "www", value: "example.com", ttl: 3600 }] },
  { id: "2", name: "myapp.com", verified: true, dnsRecords: [{ type: "A", name: "@", value: "192.168.1.2", ttl: 3600 }] },
  { id: "3", name: "pending-domain.com", verified: false, dnsRecords: [] },
];

export default function DomainsPage() {
  const [domains, setDomains] = useState<any[]>(demoDomains);
  const [showAdd, setShowAdd] = useState(false);

  const { data: domainData } = useApi<any>("/api/domains/");

  useEffect(() => {
    if (domainData) {
      const list = Array.isArray(domainData) ? domainData : domainData.domains || domainData.data || [];
      if (list.length > 0) setDomains(list);
    }
  }, [domainData]);
  const [domainName, setDomainName] = useState("");

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        organizationId: "00000000-0000-0000-0000-000000000000",
        name: domainName,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setDomains([...domains, data.domain]);
      setDomainName("");
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Domains & DNS</h1>
          <p className="text-gray-500">Manage custom domains, DNS records, and SSL certificates</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Domain
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addDomain} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Domain Name</label>
            <input value={domainName} onChange={e => setDomainName(e.target.value)}
              className="input-field" placeholder="example.com" required />
            <p className="text-xs text-gray-400 mt-1">Enter the domain you want to connect</p>
          </div>
          <button type="submit" className="btn-primary">Add Domain</button>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">DNS Record Types</h2>
        </div>
        <div className="card-body grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { type: "A", desc: "IPv4 address" },
            { type: "AAAA", desc: "IPv6 address" },
            { type: "CNAME", desc: "Alias to domain" },
            { type: "MX", desc: "Mail exchange" },
            { type: "TXT", desc: "Text records" },
            { type: "NS", desc: "Name servers" },
            { type: "SRV", desc: "Service locator" },
          ].map((r) => (
            <div key={r.type} className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="font-bold text-brand-600">{r.type}</p>
              <p className="text-xs text-gray-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {domains.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <p className="text-gray-500 font-medium">No domains added yet</p>
            <p className="text-gray-400 text-sm mt-1">Add a domain and configure DNS records</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {domains.map((domain) => (
            <div key={domain.id} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{domain.name}</h3>
                  <span className={`badge ${domain.verified ? "badge-success" : "badge-warning"}`}>
                    {domain.verified ? "Verified" : "Pending Verification"}
                  </span>
                </div>
              </div>
              {domain.dnsRecords && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">DNS Records</p>
                  <div className="space-y-2">
                    {domain.dnsRecords.map((record: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg text-sm">
                        <span className="badge badge-info w-16 text-center">{record.type}</span>
                        <span className="font-mono text-xs">{record.name}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-mono text-xs">{record.value}</span>
                        <span className="text-gray-400 text-xs ml-auto">TTL: {record.ttl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
