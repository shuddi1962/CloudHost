"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const regions = [
  { code: "nyc3", label: "New York (NYC)", price: "" },
  { code: "sfo3", label: "San Francisco (SFO)", price: "" },
  { code: "ams3", label: "Amsterdam (AMS)", price: "" },
  { code: "sgp1", label: "Singapore (SGP)", price: "" },
  { code: "lon1", label: "London (LON)", price: "" },
  { code: "fra1", label: "Frankfurt (FRA)", price: "" },
  { code: "tor1", label: "Toronto (TOR)", price: "" },
  { code: "blr1", label: "Bangalore (BLR)", price: "" },
  { code: "syd1", label: "Sydney (SYD)", price: "" },
];

const platforms = ["Application Images", "Base Operating Systems"] as const;

const blueprintLogos: Record<string, string> = {
  "WordPress": "#21759b",
  "LAMP Stack": "#44a833",
  "Node.js": "#339933",
  "Ghost": "#15171A",
  "GitLab CE": "#E24329",
  "Django": "#092e20",
  "Redmine": "#b32025",
  "n8n": "#ea4b35",
  "Nginx": "#009639",
  "Joomla": "#f44321",
  "Drupal": "#0678be",
  "PrestaShop": "#df0067",
  "Plesk": "#52b6e8",
  "cPanel & WHM": "#ff6c2c",
  "Ruby on Rails": "#cc0000",
  "MEAN Stack": "#3fb27f",
  "Ubuntu": "#E95420",
  "Debian": "#D70A53",
  "AlmaLinux": "#1a4d8c",
  "Rocky Linux": "#10b981",
  "Fedora": "#294172",
};

const osLogos: Record<string, string> = {
  "Ubuntu": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='11' fill='%23E95420'/%3E%3Ctext x='12' y='16' text-anchor='middle' font-size='12' font-weight='bold' fill='white'%3EU%3C/text%3E%3C/svg%3E",
};

function BlueprintIcon({ name, color }: { name: string; color: string }) {
  const letter = name.charAt(0);
  return (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill={color} />
      <text x="20" y="26" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">
        {letter}
      </text>
    </svg>
  );
}

const blueprints: Record<string, { name: string; version: string; desc: string }[]> = {
  "Application Images": [
    { name: "WordPress", version: "7.0", desc: "Pre-configured WordPress installation ready for immediate use." },
    { name: "LAMP Stack", version: "8.5.7", desc: "Linux, Apache, MySQL, PHP stack." },
    { name: "Node.js", version: "24.18.0", desc: "JavaScript runtime environment." },
    { name: "Ghost", version: "6.37.1", desc: "Modern publishing platform." },
    { name: "GitLab CE", version: "18.9.7", desc: "Self-hosted Git repository manager." },
    { name: "Django", version: "6.0.5", desc: "High-level Python web framework." },
    { name: "Redmine", version: "6.0.9", desc: "Project management and issue tracking." },
    { name: "n8n", version: "1.92.0", desc: "Workflow automation tool." },
    { name: "Nginx", version: "1.30.3", desc: "High-performance web server and reverse proxy." },
    { name: "Joomla", version: "6.1.0", desc: "Content management system." },
    { name: "Drupal", version: "11.3.9", desc: "Enterprise content management platform." },
    { name: "PrestaShop", version: "9.1.1", desc: "E-commerce platform." },
    { name: "Plesk", version: "18.0.77", desc: "Web hosting control panel (BYOL)." },
    { name: "cPanel & WHM", version: "RELEASE Tier", desc: "Web hosting control panel for AlmaLinux." },
    { name: "Ruby on Rails", version: "8.1.3", desc: "Full-stack web application framework." },
    { name: "MEAN Stack", version: "8.3.2", desc: "MongoDB, Express, Angular, Node.js stack." },
  ],
  "Base Operating Systems": [
    { name: "Ubuntu", version: "24.04 LTS", desc: "" },
    { name: "Debian", version: "12", desc: "" },
    { name: "AlmaLinux", version: "9", desc: "" },
    { name: "Rocky Linux", version: "9", desc: "" },
    { name: "Fedora", version: "41", desc: "" },
  ],
};

const sizes = [
  { price: 6, label: "$6", name: "Starter", cpu: "1 vCPU", mem: "2 GB", storage: "40 GB SSD", transfer: "1 TB Transfer", doSlug: "s-1vcpu-2gb", new: false },
  { price: 12, label: "$12", name: "Basic", cpu: "2 vCPU", mem: "4 GB", storage: "80 GB SSD", transfer: "2 TB Transfer", doSlug: "s-2vcpu-4gb", new: false },
  { price: 24, label: "$24", name: "Standard", cpu: "2 vCPU", mem: "8 GB", storage: "160 GB SSD", transfer: "3 TB Transfer", doSlug: "s-2vcpu-8gb", new: false },
  { price: 48, label: "$48", name: "Performance", cpu: "4 vCPU", mem: "16 GB", storage: "320 GB SSD", transfer: "4 TB Transfer", doSlug: "s-4vcpu-16gb", new: false },
  { price: 96, label: "$96", name: "Business", cpu: "8 vCPU", mem: "32 GB", storage: "640 GB SSD", transfer: "5 TB Transfer", doSlug: "s-8vcpu-32gb", new: false },
];

export default function CreateInstancePage() {
  const [selectedRegion, setSelectedRegion] = useState("nyc3");
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [platform, setPlatform] = useState<typeof platforms[number]>("Application Images");
  const [selectedBlueprint, setSelectedBlueprint] = useState("WordPress");
  const [selectedSize, setSelectedSize] = useState<number | null>(12);
  const [instanceName, setInstanceName] = useState("my-instance-1");
  const [showLaunchScript, setShowLaunchScript] = useState(false);
  const [launchScript, setLaunchScript] = useState("");
  const [sshOption, setSshOption] = useState("default");
  const [autoSnapshots, setAutoSnapshots] = useState(false);
  const [tags, setTags] = useState<{key: string; value: string}[]>([]);

  const currentBlueprintObj = blueprints[platform].find(b => b.name === selectedBlueprint) || blueprints[platform][0];

  const [showBlueprintDetail, setShowBlueprintDetail] = useState("WordPress");

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

  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function handleCreate() {
    setCreating(true);
    setCreateError("");
    try {
      const sizeObj = sizes.find(s => s.price === selectedSize);
      const res = await fetch("/api/vps/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: instanceName,
          plan: sizeObj?.doSlug || "s-1vcpu-2gb",
          region: selectedRegion,
          blueprint: selectedBlueprint,
          platform: platform.toLowerCase(),
          image: null,
          tags: tags.filter(t => t.key).map(t => `${t.key}=${t.value}`),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create instance");
      }
      router.push("/dashboard/vps");
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
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
          <h1 className="text-2xl font-bold">Create Instance</h1>
          <p className="text-sm text-gray-500">Choose a region, an image, and a plan to launch your server.</p>
        </div>
      </div>

      {/* Region */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-3">Instance Location</h2>
          <p className="text-sm text-gray-600 mb-3">
            Your instance will be created in <strong>{region.label}</strong>.
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

      {/* Image picker */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Choose Your Image</h2>
          <p className="text-sm text-gray-600 mb-5">Pick the operating system or pre-configured application for your instance.</p>

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
                <div className="flex items-center gap-3">
                  <BlueprintIcon name={bp.name} color={blueprintLogos[bp.name] || "#6366f1"} />
                  <div>
                    <p className="font-medium truncate">{bp.name}</p>
                    <p className="text-xs text-gray-400">{bp.version}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Blueprint details */}
          {showBlueprintDetail && currentBlueprintObj && (
            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
              <div className="flex items-center gap-4">
                <BlueprintIcon name={currentBlueprintObj.name} color={blueprintLogos[currentBlueprintObj.name] || "#6366f1"} />
                <div>
                  <h3 className="text-base font-semibold">{currentBlueprintObj.name}</h3>
                  <p className="text-sm text-gray-500">{currentBlueprintObj.version}</p>
                </div>
              </div>
              <div className="text-sm text-gray-700 space-y-1 mb-4 mt-3">
                {currentBlueprintObj.desc && (
                  <p>{currentBlueprintObj.desc}</p>
                )}
                {platform === "Application Images" && (
                  <p className="text-xs text-gray-400 mt-2">Installed via cloud-init scripts on first boot.</p>
                )}
              </div>
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
            <h3 className="text-base font-semibold mb-1">SSH Key</h3>
            <p className="text-xs text-gray-500 mb-3">Select or add an SSH key to access your instance. <Link href="/dashboard/credentials" className="text-indigo-600 hover:underline">Manage SSH keys</Link></p>
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

          {/* Auto backups */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={autoSnapshots} onChange={(e) => setAutoSnapshots(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <div>
                <h3 className="text-base font-semibold">Automatic Backups</h3>
                <p className="text-xs text-gray-500">Enable daily automatic backups of this instance. Backups are billed at the same rate as manual snapshots.</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Instance plan */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-4">Choose Your Plan</h2>

          <p className="text-sm text-gray-500 mb-4">All plans include a public IPv4 address, SSD storage, and a monthly transfer allowance.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sizes.map((s) => (
              <button key={s.price} onClick={() => setSelectedSize(s.price)}
                className={`text-left p-4 rounded-xl border text-sm transition-all relative ${
                  selectedSize === s.price
                    ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}>
                <p className="text-xl font-bold text-gray-800">{s.label}</p>
                <p className="text-[11px] text-gray-400">per month</p>
                <hr className="my-2 border-gray-100" />
                <p className="text-xs font-medium text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-600">{s.cpu} / {s.mem} RAM</p>
                <p className="text-xs text-gray-600">{s.storage} SSD</p>
                <p className="text-xs text-gray-600">{s.transfer}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instance name */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-1">Name Your Instance</h2>
          <p className="text-sm text-gray-500 mb-4">Give your instance a unique name so you can identify it later.</p>
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
          <h2 className="text-lg font-semibold mb-1">Tags</h2>
          <p className="text-sm text-gray-500 mb-4">Add key-value tags to organize your instances and track billing.</p>
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
        <p className="text-xs text-gray-400">By creating an instance, you agree to our <Link href="/legal" className="text-indigo-600 hover:underline">Terms of Service</Link>.</p>
        {createError && <p className="text-sm text-red-600">{createError}</p>}
        <button onClick={handleCreate} disabled={creating}
          className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
          {creating ? "Creating..." : "Create Instance"}
        </button>
      </div>
    </div>
  );
}
