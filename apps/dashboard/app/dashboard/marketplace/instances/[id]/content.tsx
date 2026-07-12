"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Instance {
  id: string;
  name: string;
  appId: string;
  appName: string;
  version: string;
  region: string;
  ip: string;
  port: number | null;
  status: string;
  lastActive: string;
  cpu: string;
  memory: string;
  storage: string;
  cost: string;
}

export default function InstanceDetail() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [instance, setInstance] = useState<Instance | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchInstance = () => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketplace/instances/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 404) setNotFound(true);
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => setInstance(data.instance ?? data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchLogs = () => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketplace/instances/${id}/logs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setLogs(data.logs ?? data ?? []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchInstance();
    fetchLogs();
  }, [id]);

  const handleAction = (action: "start" | "stop" | "restart") => {
    setActionLoading(action);
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketplace/instances/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (r.ok) fetchInstance(); })
      .catch(() => {})
      .finally(() => setActionLoading(null));
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading instance...</div>;
  }

  if (notFound || !instance) {
    return (
      <div className="text-center py-20">
        <svg className="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 font-medium">Instance not found</p>
        <Link href="/dashboard/marketplace/instances" className="btn-secondary mt-4 inline-flex text-sm">Back to Instances</Link>
      </div>
    );
  }

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard/marketplace" className="hover:text-brand-600">Marketplace</Link>
        <span>/</span>
        <Link href="/dashboard/marketplace/instances" className="hover:text-brand-600">Instances</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{instance.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">Instance Details</div>
            <div className="card-body space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{instance.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">App</span>
                <span className={`badge-${instance.status === "running" ? "success" : "warning"}`}>{instance.appName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Version</span>
                <span className="font-mono text-sm">{instance.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Region</span>
                <span>{instance.region}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">IP Address</span>
                <code className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{instance.ip}</code>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Status</div>
            <div className="card-body space-y-3">
              <div className="flex items-center gap-2">
                <span className={`badge-${instance.status === "running" ? "success" : instance.status === "stopped" ? "error" : "warning"}`}>
                  {instance.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Last Active</span>
                <span className="text-sm">{instance.lastActive}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Specifications</div>
            <div className="card-body space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">CPU</span>
                <span className="font-medium">{instance.cpu}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Memory</span>
                <span className="font-medium">{instance.memory}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Storage</span>
                <span className="font-medium">{instance.storage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Cost</span>
                <span className="font-medium text-brand-600">{instance.cost}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Actions</div>
            <div className="card-body flex gap-2">
              <button
                className="btn-primary"
                disabled={actionLoading !== null}
                onClick={() => handleAction("start")}
              >
                {actionLoading === "start" ? "..." : "Start"}
              </button>
              <button
                className="btn-secondary"
                disabled={actionLoading !== null}
                onClick={() => handleAction("stop")}
              >
                {actionLoading === "stop" ? "..." : "Stop"}
              </button>
              <button
                className="btn-secondary"
                disabled={actionLoading !== null}
                onClick={() => handleAction("restart")}
              >
                {actionLoading === "restart" ? "..." : "Restart"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header">Resource Usage</div>
            <div className="card-body space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">CPU</span>
                  <span className="text-gray-400">--</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 rounded-full h-2 w-3/5" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Memory</span>
                  <span className="text-gray-400">--</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2 w-2/5" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Storage</span>
                  <span className="text-gray-400">--</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-yellow-500 rounded-full h-2 w-1/3" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Connection Details</div>
            <div className="card-body space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">IP</span>
                <code className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{instance.ip}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">URL</span>
                <code className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">
                  http://{instance.ip}{instance.port ? `:${instance.port}` : ""}
                </code>
              </div>
              {instance.port && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Port</span>
                  <code className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{instance.port}</code>
                </div>
              )}
              <Link
                href={`/dashboard/marketplace/${instance.appId}`}
                className="btn-primary inline-flex items-center justify-center mt-2 w-full"
              >
                View in Marketplace
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Provisioning Logs</div>
            <div className="card-body">
              {logs.length > 0 ? (
                <pre className="text-xs font-mono bg-gray-900 text-green-400 p-4 rounded-lg max-h-48 overflow-y-auto leading-relaxed">
                  {logs.join("\n")}
                </pre>
              ) : (
                <p className="text-sm text-gray-400">No logs available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
