"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const typeColors: Record<string, string> = {
  SaaS: "bg-blue-100 text-blue-700",
  Container: "bg-cyan-100 text-cyan-700",
  Free: "bg-emerald-100 text-emerald-700",
  "Machine Learning": "bg-purple-100 text-purple-700",
  "Professional Services": "bg-amber-100 text-amber-700",
  Data: "bg-indigo-100 text-indigo-700",
  AMI: "bg-orange-100 text-orange-700",
};

const starRating = (rating: number) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < full ? "fill-current" : i === full && half ? "fill-current opacity-50" : "fill-gray-300"}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
};

export default function MarketplacePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [installations, setInstallations] = useState<any[]>([]);
  const [showInstallModal, setShowInstallModal] = useState<any>(null);
  const [installing, setInstalling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketplace/apps`, { headers }).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketplace/installations`, { headers }).then(r => r.json()),
    ]).then(([appsData, instData]) => {
      setData(appsData);
      setInstallations(instData.installations || []);
    }).finally(() => setLoading(false));
  }, []);

  const install = async (app: any) => {
    setInstalling(true);
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketplace/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ appId: app.id, appName: app.name }),
    });
    setShowInstallModal(null);
    setInstalling(false);
    const headers = { Authorization: `Bearer ${token}` };
    const instData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketplace/installations`, { headers }).then(r => r.json());
    setInstallations(instData.installations || []);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading marketplace...</div>;
  if (!data) return null;

  const { apps, categories, deliveryMethods } = data;
  const allApps: any[] = apps || [];
  const cats: any[] = categories || [];
  const types: string[] = deliveryMethods || [];

  const topApps = [...allApps].sort((a, b) => b.installCount - a.installCount).slice(0, 8);

  const filtered = allApps.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.vendor?.toLowerCase().includes(search.toLowerCase()) || a.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || a.category === selectedCategory;
    const matchesType = selectedType === "all" || a.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">CloudHost Marketplace</h1>
          <p className="text-brand-100 mb-6">Find, buy, and deploy software that runs on CloudHost. Thousands of popular applications and services.</p>
          <div className="relative max-w-xl">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="Search products, vendors, and categories..." />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <Link href="/dashboard/marketplace/sell" className="text-sm text-white/80 hover:text-white flex items-center gap-1.5 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Sell in Marketplace
          </Link>
          <Link href="/dashboard/marketplace/my-apps" className="text-sm text-white/80 hover:text-white flex items-center gap-1.5 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Apps
          </Link>
        </div>
      </div>

      {/* Your Installations */}
      {installations.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Your Installations
            </h2>
          </div>
          <div className="card-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {installations.map((inst: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                <div>
                  <p className="font-medium text-sm text-green-800">{inst.appName || "App"}</p>
                  <p className="text-xs text-green-600">{inst.url || "installed"}</p>
                </div>
                <span className={`badge text-[10px] ${inst.status === "active" ? "badge-success" : "badge-warning"}`}>
                  {inst.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Categories */}
      <div>
        <h2 className="text-xl font-bold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {cats.map((cat: any) => (
            <button key={cat.name} onClick={() => { setSelectedCategory(cat.name); setSelectedType("all"); }}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedCategory === cat.name ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-gray-200 bg-white hover:border-brand-200 hover:shadow-sm"
              }`}>
              <span className="text-2xl mb-2 block">{cat.icon}</span>
              <p className="font-medium text-sm">{cat.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{cat.count} products</p>
            </button>
          ))}
          <button onClick={() => setSelectedCategory("all")}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedCategory === "all" ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-gray-200 bg-white hover:border-brand-200 hover:shadow-sm"
            }`}>
            <span className="text-2xl mb-2 block">📋</span>
            <p className="font-medium text-sm">All Categories</p>
            <p className="text-xs text-gray-400 mt-0.5">{allApps.length} products</p>
          </button>
        </div>
      </div>

      {/* Most Subscribed Products */}
      {selectedCategory === "all" && selectedType === "all" && !search && (
        <div>
          <h2 className="text-xl font-bold mb-4">Most Subscribed Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {topApps.map((app: any, i: number) => (
              <div key={app.id} className="card p-4 hover:shadow-md transition-all cursor-pointer border hover:border-brand-200 relative"
                onClick={() => router.push(`/dashboard/marketplace/${app.id}`)}>
                {i < 3 && <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow">#{i + 1}</span>}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl ${app.color || "bg-brand-600"} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-sm">{app.icon || app.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{app.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{app.vendor}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeColors[app.type] || "bg-gray-100 text-gray-600"}`}>
                        {app.type || "SaaS"}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{app.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    {starRating(app.rating)}
                    <span className="ml-1">({app.reviews})</span>
                  </div>
                  <span className="font-medium text-gray-600">{app.installCount.toLocaleString()} installs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Method Filter */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {selectedCategory === "all" ? "All Products" : selectedCategory}
            {selectedType !== "all" && ` — ${selectedType}`}
            {search && ` — "${search}"`}
          </h2>
          <span className="text-sm text-gray-400">{filtered.length} products</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setSelectedType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedType === "all" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            All Types
          </button>
          {types.filter((t: string) => allApps.some((a: any) => a.type === t)).map((type: string) => (
            <button key={type} onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedType === type ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {type}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((app: any) => (
            <div key={app.id} className="card p-4 hover:shadow-md transition-all cursor-pointer border hover:border-brand-200"
              onClick={() => router.push(`/dashboard/marketplace/${app.id}`)}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${app.color || "bg-brand-600"} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">{app.icon || app.name[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{app.name}</p>
                  <p className="text-[11px] text-gray-500">by {app.vendor}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{app.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeColors[app.type] || "bg-gray-100 text-gray-600"}`}>
                    {app.type || "SaaS"}
                  </span>
                  {app.pricing && <span className="text-gray-400">{app.pricing}</span>}
                </div>
                <div className="flex items-center gap-1">
                  {starRating(app.rating)}
                  <span className="ml-1">({app.reviews})</span>
                </div>
              </div>
              {app.installCount > 1000 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {(app.installCount / 1000).toFixed(1)}K installs
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card">
            <div className="card-body text-center py-16">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 font-medium text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
              <button onClick={() => { setSearch(""); setSelectedCategory("all"); setSelectedType("all"); }}
                className="btn-secondary mt-4 text-sm">Clear all filters</button>
            </div>
          </div>
        )}
      </div>

      {/* Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => !installing && setShowInstallModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl ${showInstallModal.color || "bg-brand-600"} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{showInstallModal.icon || showInstallModal.name[0]}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold">{showInstallModal.name}</h2>
                <p className="text-sm text-gray-500">by {showInstallModal.vendor}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{showInstallModal.description}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className={`text-xs font-medium px-2 py-0.5 rounded ${typeColors[showInstallModal.type] || "bg-gray-100 text-gray-600"}`}>{showInstallModal.type || "SaaS"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pricing</span><span>{showInstallModal.pricing || "Free"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rating</span><span className="flex items-center gap-1">{starRating(showInstallModal.rating)} ({showInstallModal.reviews})</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => install(showInstallModal)} disabled={installing}
                className="btn-primary flex-1 justify-center">
                {installing ? "Installing..." : "Subscribe"}
              </button>
              <button onClick={() => setShowInstallModal(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
