"use client";

import { useState } from "react";
import Link from "next/link";

const regions = [
  { code: "eu-west-3a", label: "Paris, Zone A (eu-west-3a)", price: "" },
  { code: "us-east-1a", label: "N. Virginia, Zone A (us-east-1a)", price: "" },
  { code: "us-west-2a", label: "Oregon, Zone A (us-west-2a)", price: "" },
  { code: "ap-southeast-1a", label: "Singapore, Zone A (ap-southeast-1a)", price: "" },
  { code: "ap-northeast-1a", label: "Tokyo, Zone A (ap-northeast-1a)", price: "" },
  { code: "eu-central-1a", label: "Frankfurt, Zone A (eu-central-1a)", price: "" },
  { code: "eu-west-2a", label: "London, Zone A (eu-west-2a)", price: "" },
  { code: "eu-west-3a", label: "Paris, Zone A (eu-west-3a)", price: "" },
];

const platforms = ["Linux apps", "Linux operating system", "Microsoft Windows"] as const;

const blueprints: Record<string, { name: string; version: string; desc: string }[]> = {
  "Linux apps": [
    { name: "OpenClaw", version: "2026.6.9", desc: "Open-source autonomous AI agent" },
    { name: "WordPress", version: "7.0", desc: "" },
    { name: "WordPress Multisite", version: "7.0", desc: "" },
    { name: "LAMP", version: "8.5.7", desc: "" },
    { name: "Node.js", version: "24.18.0", desc: "" },
    { name: "Joomla", version: "6.1.0", desc: "Originally packaged by Bitnami (no longer maintained)" },
    { name: "Magento", version: "2.4.8", desc: "Originally packaged by Bitnami (no longer maintained)" },
    { name: "MEAN", version: "8.3.2", desc: "Originally packaged by Bitnami (no longer maintained)" },
    { name: "Drupal", version: "11.3.9", desc: "Originally packaged by Bitnami (no longer maintained)" },
    { name: "GitLab CE", version: "18.9.7-ce.0", desc: "Originally packaged by Bitnami (no longer maintained)" },
    { name: "Redmine", version: "6.0.9", desc: "Originally packaged by Bitnami (no longer maintained)" },
    { name: "Nginx", version: "1.30.3", desc: "" },
    { name: "Ghost", version: "6.37.1", desc: "Originally packaged by Bitnami (no longer maintained)" },
    { name: "Django", version: "6.0.5", desc: "Originally packaged by Bitnami (no longer maintained)" },
    { name: "PrestaShop", version: "9.1.1", desc: "Originally packaged by Bitnami (no longer maintained)" },
    { name: "Plesk Hosting Stack on Ubuntu (BYOL)", version: "18.0.77", desc: "" },
    { name: "cPanel & WHM for AlmaLinux", version: "RELEASE Tier", desc: "" },
    { name: "Ruby on Rails", version: "8.1.3", desc: "Lightsail" },
  ],
  "Linux operating system": [
    { name: "Amazon Linux", version: "2026", desc: "AWS-optimized Linux distribution" },
    { name: "Ubuntu", version: "24.04 LTS", desc: "" },
    { name: "Debian", version: "12.8", desc: "" },
    { name: "CentOS Stream", version: "9", desc: "" },
    { name: "Fedora", version: "41", desc: "" },
    { name: "Rocky Linux", version: "9.5", desc: "" },
    { name: "AlmaLinux", version: "9.5", desc: "" },
    { name: "SUSE Linux Enterprise Server", version: "15 SP6", desc: "" },
    { name: "openSUSE Leap", version: "15.6", desc: "" },
    { name: "FreeBSD", version: "14.2", desc: "" },
    { name: "Alpine Linux", version: "3.21", desc: "" },
    { name: "RHEL", version: "9.5", desc: "BYOL — requires Red Hat subscription" },
  ],
  "Microsoft Windows": [
    { name: "Windows Server 2025", version: "2025", desc: "" },
    { name: "Windows Server 2022", version: "2022", desc: "" },
    { name: "Windows Server 2019", version: "2019", desc: "" },
    { name: "Windows Server 2025 with SQL Server 2025 Express", version: "2025", desc: "" },
    { name: "Windows Server 2022 with SQL Server 2022 Express", version: "2022", desc: "" },
    { name: "Windows Server 2019 with SQL Server 2019 Express", version: "2019", desc: "" },
  ],
};

const plans = [
  { type: "general_purpose", label: "General purpose", desc: "Best for most workloads. Ideal for web servers, development environments, and small to medium databases." },
  { type: "memory_optimized", label: "Memory-optimized", desc: "Best for memory-intensive applications. Ideal for in-memory databases, real-time analytics, and applications with high memory demands." },
  { type: "compute_optimized", label: "Compute-optimized", desc: "Best for compute-intensive applications. Ideal for batch processing, high-performance computing, and CPU-bound workloads." },
] as const;

const networkTypes = [
  { id: "dual-stack", label: "Dual-stack", desc: "For workloads that require full network compatibility. Includes a public IPv4 and a public IPv6 address." },
  { id: "ipv6-only", label: "IPv6-only", desc: "For workloads that do not require a public IPv4 address. Includes a public IPv6 address." },
] as const;

const sizes = [
  { price: 5, label: "$5", mem: "512 MB", cpu: "2 vCPUs", storage: "20 GB SSD", transfer: "1 TB Transfer", new: false },
  { price: 7, label: "$7", mem: "1 GB", cpu: "2 vCPUs", storage: "40 GB SSD", transfer: "2 TB Transfer", new: false },
  { price: 12, label: "$12", mem: "2 GB", cpu: "2 vCPUs", storage: "60 GB SSD", transfer: "3 TB Transfer", new: false },
  { price: 24, label: "$24", mem: "4 GB", cpu: "2 vCPUs", storage: "80 GB SSD", transfer: "4 TB Transfer", new: false },
  { price: 44, label: "$44", mem: "8 GB", cpu: "2 vCPUs", storage: "160 GB SSD", transfer: "5 TB Transfer", new: false },
  { price: 84, label: "$84", mem: "16 GB", cpu: "4 vCPUs", storage: "320 GB SSD", transfer: "6 TB Transfer", new: false },
  { price: 164, label: "$164", mem: "32 GB", cpu: "8 vCPUs", storage: "640 GB SSD", transfer: "7 TB Transfer", new: false },
  { price: 384, label: "$384", mem: "64 GB", cpu: "16 vCPUs", storage: "1,280 GB SSD", transfer: "8 TB Transfer", new: false },
  { price: 884, label: "$884", mem: "128 GB", cpu: "32 vCPUs", storage: "1,280 GB SSD", transfer: "9 TB Transfer", new: true },
  { price: 1324, label: "$1,324", mem: "192 GB", cpu: "48 vCPUs", storage: "1,280 GB SSD", transfer: "10 TB Transfer", new: true },
  { price: 1764, label: "$1,764", mem: "256 GB", cpu: "64 vCPUs", storage: "1,280 GB SSD", transfer: "10 TB Transfer", new: true },
];

export default function CreateInstancePage() {
  const [selectedRegion, setSelectedRegion] = useState("eu-west-3a");
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [platform, setPlatform] = useState<typeof platforms[number]>("Linux apps");
  const [selectedBlueprint, setSelectedBlueprint] = useState("OpenClaw");
  const [planType, setPlanType] = useState("general_purpose");
  const [networkType, setNetworkType] = useState("dual-stack");
  const [selectedSize, setSelectedSize] = useState<number | null>(12);
  const [instanceName, setInstanceName] = useState("OpenClaw-1");
  const [showLaunchScript, setShowLaunchScript] = useState(false);
  const [launchScript, setLaunchScript] = useState("");
  const [sshOption, setSshOption] = useState("default");
  const [autoSnapshots, setAutoSnapshots] = useState(false);
  const [tags, setTags] = useState<{key: string; value: string}[]>([]);

  const currentBlueprintObj = blueprints[platform].find(b => b.name === selectedBlueprint) || blueprints[platform][0];

  const [showBlueprintDetail, setShowBlueprintDetail] = useState("OpenClaw");

  function handleAddTag() {
    setTags([...tags, { key: "", value: "" }]);
  }

  function handleTagChange(i: number, field: "key" | "value", val: string) {
    const next = [...tags];
    next[i] = { ...next[i], [field]: val };
    setTags(next);
  }

  function removeTag(i: number) {
    setTags(tags.filter((_, idx) => idx !== i));
  }

  const region = regions.find((r) => r.code === selectedRegion) || regions[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/vps" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create an instance</h1>
          <p className="text-sm text-gray-500">Instance location, image, plan, and configuration</p>
        </div>
      </div>

      {/* Region */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-3">Instance location <span className="text-gray-400 font-normal text-sm">Info</span></h2>
          <p className="text-sm text-gray-600 mb-3">
            You are creating this instance in <strong>{region.label}</strong>
          </p>
          <button onClick={() => setShowRegionPicker(!showRegionPicker)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Change AWS Region and Availability Zone
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

      {/* Image picker */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Pick your instance image <span className="text-gray-400 font-normal text-sm">Info</span></h2>
          <p className="text-sm text-gray-600 mb-5">The instance image you pick determines the operating system and whether there are any included applications in your instance.</p>

          {/* Platform tabs */}
          <div className="flex border-b border-gray-200 mb-5">
            {platforms.map((p) => (
              <button key={p} onClick={() => { setPlatform(p); setSelectedBlueprint(blueprints[p][0].name); }}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  p === platform ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                {p} <span className="text-xs text-gray-400 ml-1">{blueprints[p].length} blueprints</span>
              </button>
            ))}
          </div>

          {/* Blueprints grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {blueprints[platform].map((bp) => (
              <button key={bp.name} onClick={() => { setSelectedBlueprint(bp.name); setShowBlueprintDetail(bp.name); }}
                className={`text-left p-3 rounded-lg border text-sm transition-all ${
                  bp.name === selectedBlueprint
                    ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}>
                <p className="font-medium truncate">{bp.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{bp.version}</p>
                {bp.desc && bp.desc.includes("Bitnami") && (
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight">Originally packaged by Bitnami</p>
                )}
                {bp.desc === "Lightsail" && <p className="text-[10px] text-gray-400 mt-1">Lightsail</p>}
              </button>
            ))}
          </div>

          {/* Blueprint details */}
          {showBlueprintDetail && currentBlueprintObj && (
            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold">{currentBlueprintObj.name}</h3>
                  <p className="text-sm text-gray-500">{currentBlueprintObj.version}</p>
                </div>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Lightsail</span>
              </div>
              <div className="text-sm text-gray-700 space-y-1 mb-4">
                {currentBlueprintObj.name === "OpenClaw" && (
                  <p>OpenClaw is an open-source autonomous AI agent (formerly Clawdbot/Moltbot). It runs continuously in the background on your own server, connecting to messaging platforms like Slack, Telegram, WhatsApp, and Discord as its primary interface. OpenClaw features proactive task execution, multi-channel integration, and the ability to run code, manage files, and browse the web.</p>
                )}
                {currentBlueprintObj.name === "WordPress" && (
                  <p>WordPress is the world's most popular content management system (CMS), powering millions of websites and blogs. This blueprint provides a pre-configured WordPress installation ready for immediate use.</p>
                )}
                {currentBlueprintObj.desc && !currentBlueprintObj.desc.includes("Bitnami") && currentBlueprintObj.desc !== "Lightsail" && (
                  <p>{currentBlueprintObj.desc}</p>
                )}
              </div>
              <p className="text-xs text-gray-400">Lightsail packages blueprints to be secure and up-to-date using industry best practices. <Link href="#" className="text-indigo-600 hover:underline">Learn more about {currentBlueprintObj.name}</Link>.</p>
              {currentBlueprintObj.name === "OpenClaw" && (
                <p className="text-xs text-gray-400 mt-1">By using this software, you agree to the software's <Link href="#" className="text-indigo-600 hover:underline">end user license agreement</Link></p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Optional: Launch script, SSH key, Auto snapshots */}
      <div className="card">
        <div className="card-body space-y-6">
          {/* Launch script */}
          <div>
            <button onClick={() => setShowLaunchScript(!showLaunchScript)}
              className="flex items-center justify-between w-full text-left">
              <div>
                <h3 className="text-base font-semibold">Launch script <span className="text-gray-400 font-normal text-sm">Info</span></h3>
                <p className="text-xs text-gray-500">You can add a shell script that will run in your instance the first time it launches.</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showLaunchScript ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showLaunchScript && (
              <textarea value={launchScript} onChange={(e) => setLaunchScript(e.target.value)}
                placeholder="# Enter your shell script here"
                className="mt-3 w-full h-28 border border-gray-200 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            )}
          </div>

          <hr className="border-gray-200" />

          {/* SSH key */}
          <div>
            <h3 className="text-base font-semibold mb-1">SSH key <span className="text-gray-400 font-normal text-sm">Info</span></h3>
            <p className="text-xs text-gray-500 mb-3">Select an existing key pair to SSH into your instance. You can also create or upload a new SSH key pair to use instead. <Link href="#" className="text-indigo-600 hover:underline">Manage SSH keys</Link></p>
            <div className="flex items-center gap-3">
              {["default", "custom", "upload"].map((opt) => (
                <button key={opt} onClick={() => setSshOption(opt)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                    sshOption === opt ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}>
                  {opt === "default" ? "Default SSH key" : opt === "custom" ? "Create custom key" : "Upload key"}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Auto snapshots */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={autoSnapshots} onChange={(e) => setAutoSnapshots(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <div>
                <h3 className="text-base font-semibold">Automatic snapshots <span className="text-gray-400 font-normal text-sm">Info</span></h3>
                <p className="text-xs text-gray-500">Automatic snapshots run on a daily schedule to create a backup image of your instance and attached disks. Automatic snapshots are billed the same as manual snapshots. <Link href="#" className="text-indigo-600 hover:underline">Learn more about Amazon Lightsail pricing</Link></p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Instance plan */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-4">Choose your instance plan <span className="text-gray-400 font-normal text-sm">Info</span></h2>

          <p className="text-sm text-gray-500 mb-2">Select a plan type <span className="text-gray-400 text-xs">Info</span></p>
          <div className="flex flex-wrap gap-2 mb-6">
            {plans.map((p) => (
              <button key={p.type} onClick={() => setPlanType(p.type)}
                className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                  planType === p.type ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                <p className={`font-medium ${planType === p.type ? "text-indigo-700" : "text-gray-700"}`}>{p.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 max-w-xs">{p.desc}</p>
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-3">Select a network type <span className="text-gray-400 text-xs">Info</span></p>
          <div className="flex flex-wrap gap-2 mb-4">
            {networkTypes.map((n) => (
              <button key={n.id} onClick={() => setNetworkType(n.id)}
                className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                  networkType === n.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                }`}>
                <p className={`font-medium ${networkType === n.id ? "text-indigo-700" : "text-gray-700"}`}>{n.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 max-w-xs">{n.desc}</p>
              </button>
            ))}
          </div>
          {selectedBlueprint === "OpenClaw" && networkType === "ipv6-only" && (
            <p className="text-xs text-amber-600 mb-4">OpenClaw isn't compatible with an IPv6-only instance plan. <Link href="#" className="underline">Learn more about instance blueprint offerings</Link></p>
          )}

          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">Select a size</p>
            <span className="text-xs text-gray-400">Sort by <span className="font-medium">Price per month</span></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sizes.map((s) => (
              <button key={s.price} onClick={() => setSelectedSize(s.price)}
                className={`text-left p-4 rounded-xl border text-sm transition-all relative ${
                  selectedSize === s.price
                    ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                } ${s.new ? "bg-gradient-to-br from-gray-50 to-indigo-50/30" : ""}`}>
                {s.new && <span className="absolute -top-2 right-3 bg-indigo-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">New</span>}
                <p className="text-xl font-bold text-gray-800">{s.label}</p>
                <p className="text-[11px] text-gray-400">USD per month</p>
                <hr className="my-2 border-gray-100" />
                <p className="text-xs text-gray-600">{s.mem} Memory</p>
                <p className="text-xs text-gray-600">{s.cpu} Processing</p>
                <p className="text-xs text-gray-600">{s.storage} SSD Storage</p>
                <p className="text-xs text-gray-600">{s.transfer}</p>
              </button>
            ))}
            {selectedBlueprint === "OpenClaw" && selectedSize && selectedSize < 12 && (
              <div className="col-span-full text-xs text-amber-600 mt-1">
                <span className="font-medium">Not available for selected blueprint</span> — OpenClaw requires at least 2 GB memory
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-4">Both inbound and outbound data transfer count towards your data transfer allowance. Only outbound data transfer in excess of your plan's data transfer allowance is subject to overage charges. <Link href="#" className="text-indigo-600 hover:underline">Learn more about instance data transfer allowances</Link></p>
        </div>
      </div>

      {/* Instance name */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Identify your instance</h2>
          <p className="text-sm text-gray-500 mb-4">Instance names help you identify an instance once it's created. The instance name must be unique in the AWS Region for your Lightsail account.</p>
          <div className="max-w-sm flex items-center gap-2">
            <div className="flex-1">
              <input type="text" value={instanceName} onChange={(e) => setInstanceName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <span className="text-xs text-gray-400">1</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Tagging options <span className="text-gray-400 font-normal text-sm">Info</span></h2>
          <p className="text-sm text-gray-500 mb-4">You can specify tags to assign to this resource after it's created. Key-value tags are used to filter and organize your resources, organize your billing, and control access to your resources in the Lightsail console.</p>
          {tags.length === 0 && <p className="text-sm text-gray-400 italic mb-3">No tags associated with the resource.</p>}
          <div className="space-y-2 mb-3">
            {tags.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input placeholder="Key" value={t.key} onChange={(e) => handleTagChange(i, "key", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input placeholder="Value" value={t.value} onChange={(e) => handleTagChange(i, "value", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={() => removeTag(i)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button onClick={handleAddTag} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">+ Add new tag</button>
          <p className="text-xs text-gray-400 mt-2">You can add up to 50 tags.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <p className="text-xs text-gray-400">Your use of AWS services is subject to the <Link href="#" className="text-indigo-600 hover:underline">AWS Customer Agreement</Link>.</p>
        <button className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Create instance
        </button>
      </div>
    </div>
  );
}
