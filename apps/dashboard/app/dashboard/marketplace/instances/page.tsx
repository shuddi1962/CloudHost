"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const statusConfig: Record<string, { label: string; badge: string }> = {
  running: { label: "Running", badge: "badge-success" },
  stopped: { label: "Stopped", badge: "bg-gray-100 text-gray-600" },
  provisioning: { label: "Provisioning", badge: "badge-warning" },
};

const regions = ["us-east-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-southeast-1", "ap-northeast-1"];
const plans = [
  { id: "small", label: "Small", cpu: "1 vCPU", memory: "2 GB", storage: "20 GB", cost: "$9.99/mo" },
  { id: "medium", label: "Medium", cpu: "2 vCPU", memory: "4 GB", storage: "40 GB", cost: "$29.99/mo" },
  { id: "large", label: "Large", cpu: "4 vCPU", memory: "8 GB", storage: "80 GB", cost: "$79.99/mo" },
  { id: "xlarge", label: "X-Large", cpu: "8 vCPU", memory: "16 GB", storage: "160 GB", cost: "$199.99/mo" },
];

const demoApps = [
  { id: "wordpress", name: "WordPress", type: "SaaS", icon: "W" },
  { id: "nginx", name: "NGINX", type: "Container", icon: "N" },
  { id: "postgres", name: "PostgreSQL", type: "Data", icon: "P" },
  { id: "redis", name: "Redis", type: "Data", icon: "R" },
  { id: "docker", name: "Docker", type: "Container", icon: "D" },
  { id: "mongodb", name: "MongoDB", type: "Data", icon: "M" },
];

function formatUptime(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export default function InstancesPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProvision, setShowProvision] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [selectedApp, setSelectedApp] = useState(demoApps[0].id);
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const [selectedPlan, setSelectedPlan] = useState(plans[0].id);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/marketplace/instances", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setInstances(data.instances || []))
      .finally(() => setLoading(false));
  }, []);

  const provision = async () => {
    setProvisioning(true);
    const token = localStorage.getItem("token");
    const app = demoApps.find((a) => a.id === selectedApp);
    const plan = plans.find((p) => p.id === selectedPlan);
    await fetch("http://localhost:3001/api/marketplace/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        appId: app?.id,
        appName: app?.name,
        type: app?.type,
        region: selectedRegion,
        plan: selectedPlan,
        cpu: plan?.cpu,
        memory: plan?.memory,
        storage: plan?.storage,
        cost: plan?.cost,
      }),
    });
    setProvisioning(false);
    setShowProvision(false);
    const res = await fetch("http://localhost:3001/api/marketplace/instances", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    setInstances(res.instances || []);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading instances...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deployed Instances</h1>
          <p className="text-gray-500">Manage your marketplace application deployments</p>
        </div>
        <button onClick={() => setShowProvision(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Provision Instance
        </button>
      </div>

      {/* Stats */}
      {instances.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-2xl font-bold text-brand-600">{instances.length}</p>
            <p className="text-xs text-gray-500">Total Instances</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-green-600">{instances.filter((i) => i.status === "running").length}</p>
            <p className="text-xs text-gray-500">Running</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-amber-600">{instances.filter((i) => i.status === "provisioning").length}</p>
            <p className="text-xs text-gray-500">Provisioning</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-gray-600">{instances.filter((i) => i.status === "stopped").length}</p>
            <p className="text-xs text-gray-500">Stopped</p>
          </div>
        </div>
      )}

      {/* Instances Grid */}
      {instances.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-16">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <p className="text-gray-500 font-medium text-lg">No deployed instances</p>
            <p className="text-gray-400 text-sm mt-1">Deploy a marketplace app to get started</p>
            <button onClick={() => setShowProvision(true)} className="btn-primary mt-4 text-sm">
              Provision Instance
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instances.map((inst) => {
            const cfg = statusConfig[inst.status] || { label: inst.status, badge: "badge-info" };
            return (
              <div
                key={inst.id}
                className="card p-4 hover:shadow-md transition-all cursor-pointer border hover:border-brand-200"
                onClick={() => router.push(`/dashboard/marketplace/instances/${inst.id}`)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{inst.appName?.[0] || "A"}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{inst.appName}</p>
                      <span className={`badge text-[10px] ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{inst.type || "App"}</span>
                      <span className="text-[10px] text-gray-400">{inst.region}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{inst.cpu || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <span>{inst.memory || "—"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    {inst.ip && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {inst.ip}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {inst.createdAt && (
                      <span className="text-gray-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatUptime(inst.createdAt)}
                      </span>
                    )}
                    <span className="font-medium text-brand-600">{inst.cost || "—"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Provision Modal */}
      {showProvision && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => !provisioning && setShowProvision(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1">Provision Instance</h2>
            <p className="text-sm text-gray-500 mb-4">Select an app, region, and plan to deploy</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application</label>
                <select className="input-field" value={selectedApp} onChange={(e) => setSelectedApp(e.target.value)}>
                  {demoApps.map((app) => (
                    <option key={app.id} value={app.id}>{app.name} ({app.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select className="input-field" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
                  {regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <div className="grid grid-cols-2 gap-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedPlan === plan.id
                          ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                          : "border-gray-200 hover:border-brand-200"
                      }`}
                    >
                      <p className="font-semibold text-sm">{plan.label}</p>
                      <p className="text-[10px] text-gray-500">{plan.cpu} &middot; {plan.memory} &middot; {plan.storage}</p>
                      <p className="text-xs font-medium text-brand-600 mt-1">{plan.cost}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={provision} disabled={provisioning} className="btn-primary flex-1 justify-center">
                {provisioning ? "Provisioning..." : "Deploy Instance"}
              </button>
              <button onClick={() => setShowProvision(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
