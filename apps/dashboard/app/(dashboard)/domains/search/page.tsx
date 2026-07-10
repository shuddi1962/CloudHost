"use client";

import { useState } from "react";

const tlds = [
  { tld: ".com", price: "$9.99", status: "available" },
  { tld: ".net", price: "$11.99", status: "available" },
  { tld: ".org", price: "$12.99", status: "available" },
  { tld: ".io", price: "$34.99", status: "premium" },
  { tld: ".dev", price: "$14.99", status: "available" },
  { tld: ".app", price: "$15.99", status: "available" },
  { tld: ".co", price: "$24.99", status: "premium" },
  { tld: ".ai", price: "$59.99", status: "premium" },
  { tld: ".blog", price: "$19.99", status: "available" },
  { tld: ".shop", price: "$29.99", status: "available" },
];

export default function DomainSearchPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setSearched(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Domain Search</h1>
        <p className="text-gray-500">Find and register your perfect domain name</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex gap-3">
            <input value={query} onChange={e => setQuery(e.target.value)}
              className="input-field text-lg py-3" placeholder="Search for a domain..." autoFocus />
            <button type="submit" className="btn-primary px-8 text-base">Search</button>
          </div>
        </form>

        {searched && (
          <div className="mt-8 space-y-3">
            <p className="text-sm text-gray-500 text-center">Domain availability for "{query}"</p>
            {tlds.map((t) => (
              <div key={t.tld} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">{query}{t.tld}</span>
                  <span className={`badge ${t.status === "available" ? "badge-success" : t.status === "premium" ? "badge-warning" : "badge-error"}`}>
                    {t.status === "available" ? "Available" : t.status === "premium" ? "Premium" : "Taken"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{t.price}/yr</span>
                  <button className={`text-sm ${t.status === "available" ? "btn-primary" : "btn-secondary"}`}>
                    {t.status === "available" ? "Add to Cart" : "Contact"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!searched && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {tlds.slice(0, 5).map((t) => (
              <div key={t.tld} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-2xl font-bold text-brand-600">{t.tld}</p>
                <p className="text-xs text-gray-500 mt-1">from {t.price}/yr</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Your Domains</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No domains registered yet</p>
            <p className="text-xs mt-1">Search and register your first domain above</p>
          </div>
        </div>
      </div>
    </div>
  );
}
