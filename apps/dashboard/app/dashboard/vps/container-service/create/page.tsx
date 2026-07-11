"use client";

import { useState } from "react";
import Link from "next/link";

const regions = [
  { code: "eu-west-3", label: "Paris, all zones (eu-west-3)" },
  { code: "us-east-1", label: "N. Virginia, all zones (us-east-1)" },
  { code: "us-west-2", label: "Oregon, all zones (us-west-2)" },
  { code: "ap-southeast-1", label: "Singapore, all zones (ap-southeast-1)" },
  { code: "ap-northeast-1", label: "Tokyo, all zones (ap-northeast-1)" },
  { code: "eu-central-1", label: "Frankfurt, all zones (eu-central-1)" },
  { code: "eu-west-2", label: "London, all zones (eu-west-2)" },
];

const powers = [
  { id: "nano", label: "Na", name: "Nano", price: 7, ram: "512 MB", cpu: "0.25 vCPUs" },
  { id: "micro", label: "Mi", name: "Micro", price: 10, ram: "1 GB", cpu: "0.25 vCPUs" },
  { id: "small", label: "Sm", name: "Small", price: 15, ram: "1 GB", cpu: "0.5 vCPUs" },
  { id: "medium", label: "Md", name: "Medium", price: 40, ram: "2 GB", cpu: "1 vCPU" },
  { id: "large", label: "Lg", name: "Large", price: 80, ram: "4 GB", cpu: "2 vCPUs" },
  { id: "xlarge", label: "Xl", name: "Xlarge", price: 160, ram: "8 GB", cpu: "4 vCPUs" },
];

const scaleOptions = [1, 5, 10, 15, 20];

export default function CreateContainerServicePage() {
  const [selectedRegion, setSelectedRegion] = useState("eu-west-3");
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [selectedPower, setSelectedPower] = useState("micro");
  const [scale, setScale] = useState(1);

  const power = powers.find((p) => p.id === selectedPower) || powers[0];
  const totalCost = power.price * scale;
  const region = regions.find((r) => r.code === selectedRegion) || regions[0];

  const serviceName = "container-service-1";
  const defaultDomain = `${serviceName}.a1b2c3d4-e5f6-7890-abcd-ef1234567890.eu-west-3.cs.amazonlightsail.com`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/vps" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create a container service</h1>
          <p className="text-sm text-gray-500">A container service is a compute resource to which you can deploy containers.</p>
        </div>
      </div>

      {/* Location */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Container service location</h2>
          <p className="text-sm text-gray-600 mb-3">
            You are creating this container service in <strong>{region.label}</strong>
          </p>
          <button onClick={() => setShowRegionPicker(!showRegionPicker)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Change AWS Region
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

      {/* Capacity */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Choose your container service capacity</h2>
          <p className="text-sm text-gray-500 mb-5">The power specifies the memory, vCPUs, and base cost of each node in your container service. The scale specifies the number of compute nodes in your container service.</p>

          {/* Power */}
          <p className="text-sm font-medium text-gray-700 mb-3">Choose the power</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {powers.map((p) => (
              <button key={p.id} onClick={() => setSelectedPower(p.id)}
                className={`text-center p-4 rounded-xl border text-sm transition-all ${
                  p.id === selectedPower ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold ${
                  p.id === selectedPower ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                }`}>{p.label}</div>
                <p className="font-semibold text-gray-800">{p.name}</p>
                <p className="text-lg font-bold text-gray-900">${p.price}</p>
                <p className="text-[10px] text-gray-400">USD per node</p>
                <hr className="my-2 border-gray-100" />
                <p className="text-xs text-gray-600">{p.ram} RAM</p>
                <p className="text-xs text-gray-600">{p.cpu}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-2 text-sm">
            <span className="font-medium text-gray-700">Memory</span>
            <span className="text-gray-500">{power.ram} RAM</span>
          </div>
          <div className="flex items-center gap-4 mb-6 text-sm">
            <span className="font-medium text-gray-700">Processing</span>
            <span className="text-gray-500">{power.cpu}</span>
          </div>

          {/* Scale */}
          <p className="text-sm font-medium text-gray-700 mb-3">Choose the scale</p>
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

          {/* Cost */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-700">
              Your container service will cost <strong className="text-lg text-indigo-700">${totalCost} USD</strong> per month.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Your container service includes a data transfer quota of 500 GB per month. Data transfer in excess of the quota will result in an overage charge that varies by AWS Region and starts at $0.09 USD per GB.
            </p>
            <Link href="#" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">Learn more about Lightsail pricing</Link>
          </div>
        </div>
      </div>

      {/* Deployment */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Set up your first deployment</h2>
          <p className="text-sm text-gray-500 mb-4">A deployment specifies the containers you want to launch on your container service, and their configuration. <Link href="#" className="text-indigo-600 hover:underline">Learn more about container service deployments</Link></p>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <p className="text-sm text-gray-500 font-medium">Set up deployment</p>
            <p className="text-xs text-gray-400 mt-1">Configure your container images, ports, environment variables, and auto-deploy settings</p>
          </div>
        </div>
      </div>

      {/* Service name */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Identify your service</h2>
          <p className="text-sm text-gray-500 mb-4">The name of your container service must be unique within each AWS Region in your Lightsail account. It must also be lower-case, and DNS-compliant. <Link href="#" className="text-indigo-600 hover:underline">Learn more about container service names</Link></p>
          <div className="max-w-sm">
            <input type="text" value={serviceName} readOnly
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            The default domain of your container service will be:
          </p>
          <p className="text-xs text-indigo-600 font-mono mt-1 break-all">{defaultDomain}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="card border-indigo-200">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Summary</h2>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-4">
            <p className="text-sm text-gray-700">
              Your container service will cost <strong className="text-lg text-indigo-700">${totalCost} USD</strong> per month.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Your container service includes a data transfer quota of 500 GB per month. Data transfer in excess of the quota will result in an overage charge that varies by AWS Region and starts at $0.09 USD per GB.
            </p>
            <Link href="#" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">Learn more about Lightsail pricing</Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>{power.name}</strong> ({power.ram} RAM, {power.cpu}) &times;{scale} node{scale > 1 ? "s" : ""}</span>
          </div>
          <p className="text-xs text-gray-400 mt-4">It might take a few minutes for your container service to be available for use.</p>
        </div>
      </div>

      {/* Create button */}
      <div className="flex justify-end">
        <button className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Create container service
        </button>
      </div>
    </div>
  );
}
