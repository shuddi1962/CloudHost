"use client";

import { useState } from "react";

interface ServerNode {
  id: string;
  name: string;
  region: string;
  type: string;
  status: string;
  cpu: number;
  memory: number;
  disk: number;
  ip: string;
  load: number;
}

export default function AdminServersPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [servers] = useState<ServerNode[]>([
    { id: "1", name: "us-east-1a", region: "US East (N. Virginia)", type: "compute-optimized", status: "online", cpu: 45, memory: 62, disk: 34, ip: "10.0.1.10", load: 0.42 },
    { id: "2", name: "us-west-2a", region: "US West (Oregon)", type: "general-purpose", status: "online", cpu: 28, memory: 41, disk: 22, ip: "10.0.2.10", load: 0.31 },
    { id: "3", name: "eu-west-1a", region: "Europe (Ireland)", type: "memory-optimized", status: "online", cpu: 52, memory: 78, disk: 45, ip: "10.0.3.10", load: 0.58 },
    { id: "4", name: "ap-southeast-1a", region: "Asia Pacific (Singapore)", type: "general-purpose", status: "maintenance", cpu: 12, memory: 23, disk: 18, ip: "10.0.4.10", load: 0.15 },
    { id: "5", name: "eu-central-1a", region: "Europe (Frankfurt)", type: "storage-optimized", status: "online", cpu: 67, memory: 55, disk: 71, ip: "10.0.5.10", load: 0.63 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Server Nodes</h1>
          <p className="text-gray-500">Infrastructure nodes powering the platform</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Node
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Nodes</p>
          <p className="text-2xl font-bold mt-1">{servers.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Online</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{servers.filter(s => s.status === "online").length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Avg CPU Load</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">
            {(servers.reduce((a, s) => a + s.cpu, 0) / servers.length).toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {servers.map((server) => (
          <div key={server.id} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${server.status === "online" ? "bg-green-500" : "bg-yellow-500"}`} />
                <div>
                  <h3 className="font-semibold">{server.name}</h3>
                  <p className="text-sm text-gray-500">{server.region}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge badge-info">{server.type}</span>
                <span className={`badge ${server.status === "online" ? "badge-success" : "badge-warning"}`}>{server.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">CPU</span>
                  <span className="text-gray-500">{server.cpu}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`rounded-full h-2 ${server.cpu > 70 ? "bg-red-500" : server.cpu > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${server.cpu}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Memory</span>
                  <span className="text-gray-500">{server.memory}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`rounded-full h-2 ${server.memory > 70 ? "bg-red-500" : server.memory > 50 ? "bg-yellow-500" : "bg-blue-500"}`}
                    style={{ width: `${server.memory}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Disk</span>
                  <span className="text-gray-500">{server.disk}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`rounded-full h-2 ${server.disk > 70 ? "bg-red-500" : server.disk > 50 ? "bg-yellow-500" : "bg-purple-500"}`}
                    style={{ width: `${server.disk}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>IP: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{server.ip}</code></span>
              <span>Load: {(server.load * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
