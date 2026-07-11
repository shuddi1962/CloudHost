"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApi } from "@/lib/api-client";

const plans = [
  { name: "VPS-1", cpu: "1 vCPU", ram: "1 GB", storage: "25 GB NVMe", transfer: "1 TB", price: "$5.99", badge: "Starter" },
  { name: "VPS-2", cpu: "2 vCPU", ram: "4 GB", storage: "50 GB NVMe", transfer: "2 TB", price: "$12.99", badge: "Popular", popular: true },
  { name: "VPS-3", cpu: "4 vCPU", ram: "8 GB", storage: "100 GB NVMe", transfer: "4 TB", price: "$24.99", badge: "Business" },
  { name: "VPS-4", cpu: "8 vCPU", ram: "16 GB", storage: "200 GB NVMe", transfer: "8 TB", price: "$49.99", badge: "Pro" },
];

const demoServers = [
  { id: "1", name: "web-server-01", plan: "VPS-2", ip: "192.168.1.100", status: "running", os: "Ubuntu 22.04", region: "us-east-1a" },
  { id: "2", name: "db-server-01", plan: "VPS-3", ip: "192.168.1.101", status: "running", os: "Ubuntu 22.04", region: "us-east-1a" },
  { id: "3", name: "staging-server", plan: "VPS-1", ip: "192.168.1.102", status: "stopped", os: "Debian 12", region: "eu-west-1a" },
];

export default function VpsPage() {
  const [servers, setServers] = useState<any[]>(demoServers);

  const { data: vpsData, loading } = useApi<any>("/api/vps/");

  useEffect(() => {
    if (vpsData) {
      const list = Array.isArray(vpsData) ? vpsData : vpsData.vps || vpsData.servers || [];
      setServers(list);
    }
  }, [vpsData]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">VPS Servers</h1>
          <p className="text-gray-500">Virtual private servers with full root access</p>
        </div>
        <Link href="/dashboard/vps/create" className="btn-primary">
          Create Instance
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className={`card p-6 relative ${plan.popular ? "ring-2 ring-brand-500" : ""}`}>
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <span className="badge badge-info">{plan.badge}</span>
            </div>
            <p className="text-3xl font-bold mb-4">{plan.price}<span className="text-sm text-gray-400 font-normal">/mo</span></p>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p className="flex justify-between"><span>CPU</span><span className="font-medium">{plan.cpu}</span></p>
              <p className="flex justify-between"><span>RAM</span><span className="font-medium">{plan.ram}</span></p>
              <p className="flex justify-between"><span>Storage</span><span className="font-medium">{plan.storage}</span></p>
              <p className="flex justify-between"><span>Transfer</span><span className="font-medium">{plan.transfer}</span></p>
            </div>
            <button className="btn-primary w-full">Deploy VPS</button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Your Servers</h2>
        </div>
        <div className="card-body">
          {loading && (
            <p className="text-sm text-gray-400 mb-3 animate-pulse">Loading servers...</p>
          )}
          {servers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm">No VPS servers deployed</p>
              <p className="text-xs mt-1">Choose a plan above to deploy your first server</p>
            </div>
          ) : (
            <div className="space-y-3">
              {servers.map((server) => (
                <div key={server.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${server.status === "running" ? "bg-green-500" : "bg-gray-400"}`} />
                    <div>
                      <p className="font-medium">{server.name}</p>
                      <p className="text-sm text-gray-500">{server.ip} · {server.plan}</p>
                    </div>
                  </div>
                  <span className={`badge ${server.status === "running" ? "badge-success" : "badge-warning"}`}>
                    {server.status}
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
