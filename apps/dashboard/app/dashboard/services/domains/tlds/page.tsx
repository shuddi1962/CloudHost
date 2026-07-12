"use client";

import { useEffect, useState } from "react";
import { Tags, Filter, Star, Sparkles } from "lucide-react";

const categories = ["", "general", "technology", "business", "finance", "health", "gaming", "travel", "education", "entertainment", "social"];

export default function TldsPage() {
  const [tlds, setTlds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchTlds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (popularOnly) params.set("popular", "true");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domain-services/tlds?${params}`, { headers });
      const data = await res.json();
      setTlds(data.tlds || []);
    } catch (e) {
      console.error("Failed to fetch TLDs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTlds(); }, [category, popularOnly]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New TLDs Catalog</h1>
        <p className="text-gray-500">Browse and register new generic top-level domains</p>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field w-48">
              <option value="">All Categories</option>
              {categories.filter(c => c).map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={popularOnly} onChange={e => setPopularOnly(e.target.checked)} className="rounded border-gray-300" />
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Popular Only</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tlds.length === 0 ? (
            <div className="col-span-full card">
              <div className="card-body text-center py-12">
                <Tags className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">No TLDs found</p>
                <p className="text-gray-400 text-sm mt-1">Try changing the filter</p>
              </div>
            </div>
          ) : tlds.map((t) => (
            <div key={t.tld} className={`card p-5 text-center relative hover:shadow-md transition-shadow ${t.popular ? "ring-2 ring-yellow-400" : ""}`}>
              {t.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Popular
                </span>
              )}
              {t.promo && (
                <span className="absolute -top-2.5 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  SALE
                </span>
              )}
              <p className="text-3xl font-bold text-brand-600 mt-1">{t.tld}</p>
              <p className="text-2xl font-bold mt-2">${t.price}<span className="text-sm text-gray-400 font-normal">/yr</span></p>
              <p className="text-xs text-gray-500 mt-2 capitalize">{t.category || "general"}</p>
              {t.promo && <p className="text-xs text-red-500 font-medium mt-1">{t.promo}</p>}
              <button className="btn-primary w-full mt-4 text-sm">Register</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
