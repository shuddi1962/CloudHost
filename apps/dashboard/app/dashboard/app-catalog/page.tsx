"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const categoryIcons: Record<string, string> = {
  "All": "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  "CMS": "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  "E-commerce": "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z",
  "Analytics": "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  "Security": "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  "Development": "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  "AI/ML": "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "Marketing": "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z",
};

const categoryColors: Record<string, string> = {
  "All": "bg-gray-600",
  "CMS": "bg-blue-600",
  "E-commerce": "bg-purple-600",
  "Analytics": "bg-green-600",
  "Security": "bg-red-600",
  "Development": "bg-cyan-600",
  "AI/ML": "bg-indigo-600",
  "Marketing": "bg-amber-600",
};

const catalogApps = [
  { id: "wordpress", name: "WordPress", description: "The world's most popular CMS. Power blogs, websites, and e-commerce stores with ease.", shortDesc: "Blog & CMS platform", category: "CMS", version: "6.7", icon: "W", color: "bg-blue-600", phpVersion: "8.2", dbNeeded: "MySQL 8.0", ram: "512 MB", screenshots: 2 },
  { id: "joomla", name: "Joomla", description: "A powerful open-source CMS for building professional websites and applications.", shortDesc: "Open-source CMS", category: "CMS", version: "5.1", icon: "J", color: "bg-red-600", phpVersion: "8.1", dbNeeded: "MySQL 8.0", ram: "512 MB", screenshots: 2 },
  { id: "drupal", name: "Drupal", description: "Enterprise-grade CMS known for its flexibility and scalability.", shortDesc: "Enterprise CMS", category: "CMS", version: "11.0", icon: "D", color: "bg-blue-800", phpVersion: "8.2", dbNeeded: "MySQL 8.0", ram: "1 GB", screenshots: 2 },
  { id: "ghost", name: "Ghost", description: "A modern publishing platform focused on content creation and subscriptions.", shortDesc: "Modern publishing", category: "CMS", version: "5.88", icon: "G", color: "bg-black", phpVersion: "", dbNeeded: "MySQL 8.0", ram: "1 GB", screenshots: 2 },
  { id: "woocommerce", name: "WooCommerce", description: "The most popular e-commerce platform for WordPress. Sell anything, anywhere.", shortDesc: "E-commerce for WP", category: "E-commerce", version: "9.3", icon: "W", color: "bg-purple-700", phpVersion: "8.2", dbNeeded: "MySQL 8.0", ram: "1 GB", screenshots: 2 },
  { id: "magento", name: "Magento", description: "Enterprise e-commerce platform with powerful features and flexibility.", shortDesc: "E-commerce platform", category: "E-commerce", version: "2.4.7", icon: "M", color: "bg-orange-500", phpVersion: "8.2", dbNeeded: "MySQL 8.0", ram: "2 GB", screenshots: 2 },
  { id: "prestashop", name: "PrestaShop", description: "Popular open-source e-commerce solution for online stores.", shortDesc: "Open-source e-commerce", category: "E-commerce", version: "8.1", icon: "P", color: "bg-teal-600", phpVersion: "8.1", dbNeeded: "MySQL 8.0", ram: "512 MB", screenshots: 2 },
  { id: "matomo", name: "Matomo", description: "Privacy-first web analytics platform. Own your data completely.", shortDesc: "Privacy analytics", category: "Analytics", version: "5.1", icon: "M", color: "bg-red-500", phpVersion: "8.1", dbNeeded: "MySQL 8.0", ram: "512 MB", screenshots: 2 },
  { id: "plausible", name: "Plausible", description: "Simple, privacy-friendly web analytics. No cookies, no tracking.", shortDesc: "Simple analytics", category: "Analytics", version: "2.1", icon: "P", color: "bg-blue-500", phpVersion: "", dbNeeded: "PostgreSQL", ram: "256 MB", screenshots: 2 },
  { id: "umami", name: "Umami", description: "Simple, fast, privacy-friendly analytics alternative to Google Analytics.", shortDesc: "Privacy analytics", category: "Analytics", version: "2.12", icon: "U", color: "bg-green-500", phpVersion: "", dbNeeded: "PostgreSQL", ram: "256 MB", screenshots: 2 },
  { id: "wordfence", name: "Wordfence", description: "Comprehensive WordPress security firewall and malware scanner.", shortDesc: "WordPress security", category: "Security", version: "7.11", icon: "W", color: "bg-red-700", phpVersion: "8.2", dbNeeded: "", ram: "256 MB", screenshots: 2 },
  { id: "fail2ban", name: "Fail2Ban", description: "Intrusion prevention software that blocks brute-force attacks.", shortDesc: "Intrusion prevention", category: "Security", version: "1.0", icon: "F", color: "bg-yellow-600", phpVersion: "", dbNeeded: "", ram: "128 MB", screenshots: 2 },
  { id: "letsencrypt", name: "Let's Encrypt", description: "Free, automated, and open Certificate Authority for SSL/TLS.", shortDesc: "Free SSL certificates", category: "Security", version: "2.12", icon: "L", color: "bg-blue-500", phpVersion: "", dbNeeded: "", ram: "128 MB", screenshots: 2 },
  { id: "gitlab-ce", name: "GitLab CE", description: "Complete DevOps platform with Git repos, CI/CD, and project management.", shortDesc: "Git repository manager", category: "Development", version: "17.3", icon: "G", color: "bg-orange-600", phpVersion: "", dbNeeded: "PostgreSQL", ram: "4 GB", screenshots: 2 },
  { id: "phpmyadmin", name: "phpMyAdmin", description: "Popular web-based MySQL/MariaDB administration tool.", shortDesc: "Database admin tool", category: "Development", version: "5.2", icon: "P", color: "bg-blue-700", phpVersion: "8.2", dbNeeded: "", ram: "256 MB", screenshots: 2 },
  { id: "adminer", name: "Adminer", description: "Lightweight database management tool in a single PHP file.", shortDesc: "Lightweight DB manager", category: "Development", version: "4.8", icon: "A", color: "bg-green-600", phpVersion: "8.2", dbNeeded: "", ram: "128 MB", screenshots: 2 },
  { id: "portainer", name: "Portainer", description: "Simplified Docker container management through a web UI.", shortDesc: "Docker management UI", category: "Development", version: "2.21", icon: "P", color: "bg-blue-400", phpVersion: "", dbNeeded: "", ram: "256 MB", screenshots: 2 },
  { id: "openclaw", name: "OpenClaw", description: "Open-source autonomous AI agent that runs on your own infrastructure.", shortDesc: "Autonomous AI agent", category: "AI/ML", version: "2026.6", icon: "O", color: "bg-indigo-600", phpVersion: "", dbNeeded: "PostgreSQL", ram: "2 GB", screenshots: 2 },
  { id: "stable-diffusion", name: "Stable Diffusion WebUI", description: "Generate images from text using Stable Diffusion AI models.", shortDesc: "AI image generation", category: "AI/ML", version: "1.10", icon: "S", color: "bg-purple-600", phpVersion: "", dbNeeded: "", ram: "8 GB", screenshots: 2 },
  { id: "llm-dashboard", name: "LLM Dashboard", description: "Unified dashboard for interacting with multiple LLM providers.", shortDesc: "Multi-LLM interface", category: "AI/ML", version: "1.3", icon: "L", color: "bg-cyan-600", phpVersion: "", dbNeeded: "", ram: "1 GB", screenshots: 2 },
  { id: "mautic", name: "Mautic", description: "Open-source marketing automation platform for email campaigns.", shortDesc: "Marketing automation", category: "Marketing", version: "5.1", icon: "M", color: "bg-amber-500", phpVersion: "8.1", dbNeeded: "MySQL 8.0", ram: "1 GB", screenshots: 2 },
  { id: "sendy", name: "Sendy", description: "Send newsletters via Amazon SES at a fraction of the cost.", shortDesc: "Email newsletters", category: "Marketing", version: "6.2", icon: "S", color: "bg-red-600", phpVersion: "8.2", dbNeeded: "MySQL 8.0", ram: "512 MB", screenshots: 2 },
  { id: "listmonk", name: "ListMonk", description: "High-performance, self-hosted newsletter and mailing list manager.", shortDesc: "Newsletter manager", category: "Marketing", version: "3.0", icon: "L", color: "bg-green-600", phpVersion: "", dbNeeded: "PostgreSQL", ram: "256 MB", screenshots: 2 },
];

const categories = ["All", "CMS", "E-commerce", "Analytics", "Security", "Development", "AI/ML", "Marketing"];

const installedApps = ["wordpress", "matomo", "phpmyadmin", "portainer"];

export default function AppCatalogPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState<any>(null);
  const [installing, setInstalling] = useState(false);
  const [installDomain, setInstallDomain] = useState("");
  const [installProgress, setInstallProgress] = useState("");
  const [installedAppsList, setInstalledAppsList] = useState<string[]>(installedApps);
  const [showDetailModal, setShowDetailModal] = useState<any>(null);

  const filtered = catalogApps.filter((a) => {
    if (category !== "All" && a.category !== category) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.shortDesc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const installApp = async (app: any) => {
    setInstalling(true);
    setInstallProgress("Provisioning server...");
    setTimeout(() => setInstallProgress("Downloading application..."), 800);
    setTimeout(() => setInstallProgress("Configuring database..."), 1600);
    setTimeout(() => setInstallProgress("Setting up domain..."), 2400);
    setTimeout(async () => {
      const token = localStorage.getItem("token");
      try {
        await fetch("http://localhost:3001/api/wordpress/", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: app.name.toLowerCase().replace(/\s+/g, "-"),
            domain: installDomain || `${app.id}.cloudhost.app`,
            framework: "wordpress",
            appId: app.id,
          }),
        });
      } catch {}
      setInstalledAppsList([...installedAppsList, app.id]);
      setShowInstallModal(null);
      setInstalling(false);
      setInstallDomain("");
      setInstallProgress("");
      router.push(`/dashboard/app-catalog/${app.id}`);
    }, 3200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">App Catalog</h1>
          <p className="text-gray-500">Browse and deploy open-source applications with one click</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          className="input-field w-full pl-10" placeholder="Search apps..." />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = category === cat;
          return (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={isActive ? { backgroundColor: categoryColors[cat].replace("bg-", "#").replace("600", "").replace("blue-", "3B82F6").replace("red-", "EF4444").replace("green-", "22C55E").replace("purple-", "A855F7").replace("cyan-", "06B6D4").replace("indigo-", "6366F1").replace("amber-", "F59E0B").replace("gray-", "6B7280"), color: "#fff" } : {}}>
              {categoryIcons[cat] ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categoryIcons[cat]} />
                </svg>
              ) : null}
              {cat}
            </button>
          );
        })}
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((app) => {
          const isInstalled = installedAppsList.includes(app.id);
          return (
            <div key={app.id}
              onClick={() => setShowDetailModal(app)}
              className="card p-4 hover:shadow-md transition-all cursor-pointer border hover:border-brand-200 group relative">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${app.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">{app.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{app.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{app.shortDesc}</p>
                </div>
              </div>
              <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                app.category === "CMS" ? "bg-blue-100 text-blue-700" :
                app.category === "E-commerce" ? "bg-purple-100 text-purple-700" :
                app.category === "Analytics" ? "bg-green-100 text-green-700" :
                app.category === "Security" ? "bg-red-100 text-red-700" :
                app.category === "Development" ? "bg-cyan-100 text-cyan-700" :
                app.category === "AI/ML" ? "bg-indigo-100 text-indigo-700" :
                "bg-amber-100 text-amber-700"
              }`}>
                {app.category}
              </span>
              <div className="mt-3">
                {isInstalled ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Installed
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">v{app.version}</span>
                )}
              </div>
              <button onClick={(e) => { e.stopPropagation(); if (!isInstalled) { setShowInstallModal(app); setInstallDomain(""); } else { router.push(`/dashboard/app-catalog/${app.id}`); } }}
                className={`mt-3 w-full text-xs py-1.5 rounded-lg font-medium transition-all ${
                  isInstalled
                    ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                }`}>
                {isInstalled ? "Manage" : "Install"}
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-16">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 font-medium text-lg">No apps found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or category filter</p>
            <button onClick={() => { setSearch(""); setCategory("All"); }}
              className="btn-secondary mt-4 text-sm">Clear filters</button>
          </div>
        </div>
      )}

      {/* Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => !installing && setShowInstallModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl ${showInstallModal.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{showInstallModal.icon}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold">{showInstallModal.name}</h2>
                <p className="text-sm text-gray-500">{showInstallModal.shortDesc}</p>
              </div>
            </div>

            {installing ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="font-medium text-gray-900">Installing {showInstallModal.name}...</p>
                  <p className="text-sm text-gray-500 mt-1">{installProgress}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-brand-600 rounded-full h-2 w-3/4 animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">Choose a domain for your {showInstallModal.name} installation.</p>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Domain</label>
                  <div className="flex items-center gap-1">
                    <input value={installDomain} onChange={(e) => setInstallDomain(e.target.value.replace(/[^a-z0-9-]/g, ""))}
                      className="input-field font-mono" placeholder={showInstallModal.id} />
                    <span className="text-gray-400 text-sm font-mono">.cloudhost.app</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Version</span><span>v{showInstallModal.version}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Category</span><span>{showInstallModal.category}</span></div>
                  {showInstallModal.phpVersion && <div className="flex justify-between"><span className="text-gray-500">PHP</span><span>{showInstallModal.phpVersion}</span></div>}
                  {showInstallModal.dbNeeded && <div className="flex justify-between"><span className="text-gray-500">Database</span><span>{showInstallModal.dbNeeded}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">RAM Required</span><span>{showInstallModal.ram}</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => installApp(showInstallModal)}
                    className="btn-primary flex-1 justify-center">Install</button>
                  <button onClick={() => setShowInstallModal(null)} className="btn-secondary">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowDetailModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-14 h-14 rounded-2xl ${showDetailModal.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-bold text-xl">{showDetailModal.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold">{showDetailModal.name}</h2>
                <p className="text-sm text-gray-500">{showDetailModal.shortDesc}</p>
                <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  showDetailModal.category === "CMS" ? "bg-blue-100 text-blue-700" :
                  showDetailModal.category === "E-commerce" ? "bg-purple-100 text-purple-700" :
                  showDetailModal.category === "Analytics" ? "bg-green-100 text-green-700" :
                  showDetailModal.category === "Security" ? "bg-red-100 text-red-700" :
                  showDetailModal.category === "Development" ? "bg-cyan-100 text-cyan-700" :
                  showDetailModal.category === "AI/ML" ? "bg-indigo-100 text-indigo-700" :
                  "bg-amber-100 text-amber-700"
                }`}>{showDetailModal.category}</span>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4">{showDetailModal.description}</p>

            {/* Screenshot placeholders */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {Array.from({ length: showDetailModal.screenshots }, (_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 h-32 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[10px] text-gray-400">Screenshot {i + 1}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
              {showDetailModal.phpVersion && <div className="flex justify-between"><span className="text-gray-500">PHP Version</span><span className="font-medium">{showDetailModal.phpVersion}</span></div>}
              {showDetailModal.dbNeeded && <div className="flex justify-between"><span className="text-gray-500">Database</span><span className="font-medium">{showDetailModal.dbNeeded}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">RAM</span><span className="font-medium">{showDetailModal.ram}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Version</span><span className="font-medium">v{showDetailModal.version}</span></div>
            </div>

            <div className="flex gap-2">
              {installedAppsList.includes(showDetailModal.id) ? (
                <button onClick={() => { setShowDetailModal(null); router.push(`/dashboard/app-catalog/${showDetailModal.id}`); }}
                  className="btn-primary flex-1 justify-center">Manage</button>
              ) : (
                <button onClick={() => { setShowDetailModal(null); setShowInstallModal(showDetailModal); setInstallDomain(""); }}
                  className="btn-primary flex-1 justify-center">Install on Server</button>
              )}
              <button onClick={() => setShowDetailModal(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
