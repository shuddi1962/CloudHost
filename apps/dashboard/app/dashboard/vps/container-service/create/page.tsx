"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const regions = [
  { code: "nyc3", label: "New York (NYC)" },
  { code: "sfo3", label: "San Francisco (SFO)" },
  { code: "ams3", label: "Amsterdam (AMS)" },
  { code: "sgp1", label: "Singapore (SGP)" },
  { code: "lon1", label: "London (LON)" },
  { code: "fra1", label: "Frankfurt (FRA)" },
  { code: "tor1", label: "Toronto (TOR)" },
  { code: "blr1", label: "Bangalore (BLR)" },
  { code: "syd1", label: "Sydney (SYD)" },
];

interface NodePower {
  id: string;
  planName: string;
  yourPriceUsd: string;
  specs: { cpu?: string; ram?: string };
  providerRef: string;
}

const scaleOptions = [1, 5, 10, 15, 20];

export default function CreateContainerServicePage() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState("nyc3");
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [selectedPowerId, setSelectedPowerId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [serviceName, setServiceName] = useState("my-service-1");
  const [powers, setPowers] = useState<NodePower[]>([]);
  const [loadingPowers, setLoadingPowers] = useState(true);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${apiBase}/api/plans?category=container`)
      .then((r) => r.json())
      .then((data) => {
        const list: NodePower[] = (data.plans || [])
          .filter((p: any) => p.isActive)
          .map((p: any) => ({
            id: p.id,
            planName: p.planName,
            yourPriceUsd: p.yourPriceUsd,
            specs: p.specs || {},
            providerRef: p.providerRef,
          }));
        setPowers(list);
        if (list.length > 0) setSelectedPowerId(list[0].id);
        setLoadingPowers(false);
      })
      .catch(() => setLoadingPowers(false));
  }, []);

  const power = powers.find((p) => p.id === selectedPowerId) || powers[0];
  const totalCost = power ? Number(power.yourPriceUsd) * scale : 0;
  const region = regions.find((r) => r.code === selectedRegion) || regions[0];

  const randomId = Math.random().toString(36).substring(2, 10);
  const defaultDomain = `${serviceName}.${randomId}.${selectedRegion}.containers.cloudhost.app`;

  const colorMap: Record<string, string> = {
    Light: "#6b7280", Standard: "#3b82f6", Plus: "#8b5cf6", Pro: "#f59e0b", Max: "#ef4444",
  };

  async function handleCreate() {
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/container-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serviceName,
          region: selectedRegion,
          nodeSize: power?.providerRef || "s-1vcpu-1gb",
          nodeCount: scale,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create container service");
      }
      router.push("/dashboard/vps");
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/vps" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Container Service</h1>
          <p className="text-sm text-gray-500">A container service runs your Docker containers on managed compute nodes.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Service Location</h2>
          <p className="text-sm text-gray-600 mb-3">
            Your container service will run in <strong>{region.label}</strong>.
          </p>
          <button onClick={() => setShowRegionPicker(!showRegionPicker)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Change region
          </button>
          {showRegionPicker && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {regions.map((r) => (
                <button key={r.code} onClick={() => { setSelectedRegion(r.code); setShowRegionPicker(false); }}
                  className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                    r.code === selectedRegion ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Choose Your Node Size</h2>
          <p className="text-sm text-gray-500 mb-5">The node size determines the memory, vCPUs, and monthly cost per node.</p>

          <p className="text-sm font-medium text-gray-700 mb-3">Choose a node size</p>

          {loadingPowers ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {powers.map((p) => (
                <button key={p.id} onClick={() => setSelectedPowerId(p.id)}
                  className={`text-center p-4 rounded-xl border text-sm transition-all ${
                    p.id === selectedPowerId ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}>
                  <svg className="w-10 h-10 mx-auto mb-2" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" fill={p.id === selectedPowerId ? "#4f46e5" : colorMap[p.planName] || "#6b7280"} />
                    <text x="20" y="26" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">{p.planName.slice(0, 2)}</text>
                  </svg>
                  <p className="font-semibold text-gray-800">{p.planName}</p>
                  <p className="text-lg font-bold text-gray-900">${Number(p.yourPriceUsd).toFixed(2)}</p>
                  <p className="text-[10px] text-gray-400">USD per node</p>
                  <hr className="my-2 border-gray-100" />
                  {p.specs.ram && <p className="text-xs text-gray-600">{p.specs.ram} RAM</p>}
                  {p.specs.cpu && <p className="text-xs text-gray-600">{p.specs.cpu}</p>}
                </button>
              ))}
            </div>
          )}

          <p className="text-sm font-medium text-gray-700 mb-3">Choose Node Count</p>
          <p className="text-xs text-gray-500 mb-3">Increase node count to scale your service across multiple compute nodes.</p>
          <div className="flex items-center gap-2 mb-6">
            {scaleOptions.map((n) => (
              <button key={n} onClick={() => setScale(n)}
                className={`w-12 h-12 rounded-lg border text-sm font-medium transition-colors ${
                  scale === n ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}>
                {n}
              </button>
            ))}
            <span className="text-sm text-gray-500 ml-2">×{scale}</span>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-700">
              Your container service will cost <strong className="text-lg text-indigo-700">${totalCost.toFixed(2)} USD</strong> per month.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Outbound data transfer is billed at $0.01 per GB beyond plan allowance. See our <Link href="/dashboard/billing" className="text-indigo-600 hover:underline">pricing page</Link> for details.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Set Up Your Deployment</h2>
          <p className="text-sm text-gray-500 mb-4">Configure the container image, ports, environment variables, and whether new pushes auto-deploy.</p>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <p className="text-sm text-gray-500 font-medium">Set up deployment</p>
            <p className="text-xs text-gray-400 mt-1">Configure your container images, ports, environment variables, and auto-deploy settings</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Name Your Service</h2>
          <p className="text-sm text-gray-500 mb-4">Your container service name must be unique, lowercase, and DNS-compliant.</p>
          <div className="max-w-sm">
            <input type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <p className="text-xs text-gray-400 mt-3">The default domain of your container service will be:</p>
          <p className="text-xs text-indigo-600 font-mono mt-1 break-all">{defaultDomain}</p>
        </div>
      </div>

      <div className="card border-indigo-200">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Summary</h2>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-4">
            <p className="text-sm text-gray-700">
              Your container service will cost <strong className="text-lg text-indigo-700">${totalCost.toFixed(2)} USD</strong> per month.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Outbound data transfer is billed at $0.01 per GB beyond plan allowance. See our <Link href="/dashboard/billing" className="text-indigo-600 hover:underline">pricing page</Link> for details.
            </p>
          </div>
          {power && (
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>{power.planName}</strong> ({power.specs.ram || "?"} RAM, {power.specs.cpu || "?"}) &times;{scale} node{scale > 1 ? "s" : ""}</span>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">It might take a few minutes for your container service to be available for use.</p>
        </div>
      </div>

      <div className="flex justify-end">
        {createError && <p className="text-sm text-red-600 mr-4">{createError}</p>}
        <button onClick={handleCreate} disabled={creating}
          className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
          {creating ? "Creating..." : "Create Container Service"}
        </button>
      </div>
    </div>
  );
}
