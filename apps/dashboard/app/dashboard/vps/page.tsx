"use client";

import { useState } from "react";

const plans = [
  { name: "VPS-1", cpu: "1 vCPU", ram: "1 GB", storage: "25 GB NVMe", transfer: "1 TB", price: "$5.99", badge: "Starter" },
  { name: "VPS-2", cpu: "2 vCPU", ram: "4 GB", storage: "50 GB NVMe", transfer: "2 TB", price: "$12.99", badge: "Popular", popular: true },
  { name: "VPS-3", cpu: "4 vCPU", ram: "8 GB", storage: "100 GB NVMe", transfer: "4 TB", price: "$24.99", badge: "Business" },
  { name: "VPS-4", cpu: "8 vCPU", ram: "16 GB", storage: "200 GB NVMe", transfer: "8 TB", price: "$49.99", badge: "Pro" },
];

export default function VpsPage() {
  const [servers, setServers] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">VPS Servers</h1>
        <p className="text-gray-500">Virtual private servers with full root access</p>
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
          {servers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm">No VPS servers deployed</p>
              <p className="text-xs mt-1">Choose a plan above to deploy your first server</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
