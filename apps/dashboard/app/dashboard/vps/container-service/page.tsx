"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ContainerService {
  id: string;
  name: string;
  region: string;
  power: string;
  scale: number;
  status: string;
  domain: string | null;
  price_monthly: number;
  created_at: string;
}

const demoData: ContainerService[] = [
  { id: "1", name: "my-app-service", region: "eu-west-3", power: "nano", scale: 1, status: "running", domain: "my-app-service.containers.cloudhost.app", price_monthly: 7, created_at: new Date().toISOString() },
  { id: "2", name: "api-backend", region: "us-east-1", power: "small", scale: 3, status: "running", domain: "api-backend.containers.cloudhost.app", price_monthly: 60, created_at: new Date().toISOString() },
  { id: "3", name: "staging-env", region: "eu-west-3", power: "micro", scale: 1, status: "provisioning", domain: null, price_monthly: 15, created_at: new Date().toISOString() },
];

const statusColors: Record<string, string> = {
  running: "bg-green-100 text-green-800",
  provisioning: "bg-blue-100 text-blue-800",
  stopped: "bg-gray-100 text-gray-800",
  failed: "bg-red-100 text-red-800",
  terminated: "bg-gray-100 text-gray-500",
};

export default function ContainerServicesPage() {
  const [services, setServices] = useState<ContainerService[]>(demoData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/container-services/")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => { if (data?.length) setServices(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Container Services</h1>
          <p className="text-sm text-gray-500 mt-1">Managed container services powered by Lightsail</p>
        </div>
        <Link href="/dashboard/vps/container-service/create"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
          Create container service
        </Link>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Power</th>
                <th className="px-6 py-3">Scale</th>
                <th className="px-6 py-3">Region</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Monthly</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm">{svc.name}</div>
                    {svc.domain && <div className="text-xs text-gray-400">{svc.domain}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm capitalize">{svc.power}</td>
                  <td className="px-6 py-4 text-sm">{svc.scale} node{svc.scale > 1 ? "s" : ""}</td>
                  <td className="px-6 py-4 text-sm">{svc.region}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[svc.status] || "bg-gray-100 text-gray-800"}`}>
                      {svc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">${svc.price_monthly}/mo</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {svc.status === "running" && (
                        <button className="text-xs text-gray-600 hover:text-gray-900 font-medium">Stop</button>
                      )}
                      {svc.status === "stopped" && (
                        <button className="text-xs text-green-600 hover:text-green-900 font-medium">Start</button>
                      )}
                      <button className="text-xs text-red-600 hover:text-red-900 font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && !loading && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">No container services yet</td></tr>
              )}
              {loading && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">Loading...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
