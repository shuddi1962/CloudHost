"use client";

import { useState } from "react";
import { Lightbulb, RefreshCw, Globe, CheckCircle, XCircle } from "lucide-react";

interface GeneratedName {
  name: string;
  available: boolean;
  domainSuggestions: string[];
}

export default function BusinessNameGeneratorPage() {
  const [industry, setIndustry] = useState("");
  const [keywords, setKeywords] = useState("");
  const [results, setResults] = useState<GeneratedName[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/marketing-suite/business-name-generator", {
        method: "POST", headers,
        body: JSON.stringify({ industry: industry.trim(), keywords: keywords.trim().split(",").map(k => k.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (res.ok) setResults(data.names || data.results || []);
      else setError(data.error || "Generation failed");
    } catch { setError("Failed to generate names. Try again."); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Business Name Generator</h1>
        <p className="text-gray-500">Generate creative business name ideas with domain availability</p>
      </div>

      <div className="card p-6">
        <form onSubmit={generate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Industry</label>
            <input value={industry} onChange={e => setIndustry(e.target.value)} className="input-field" placeholder="e.g. technology, healthcare" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Keywords (comma separated)</label>
            <input value={keywords} onChange={e => setKeywords(e.target.value)} className="input-field" placeholder="e.g. cloud, secure, fast" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
            {loading ? "Generating..." : "Generate Names"}
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{results.length} name(s) generated</p>
            <button onClick={generate} disabled={loading} className="btn-secondary text-sm"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Generate Again</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-brand-600">{item.name}</h3>
                  {item.available ? (
                    <span className="badge badge-success text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Available</span>
                  ) : (
                    <span className="badge badge-error text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> Taken</span>
                  )}
                </div>
                {item.domainSuggestions?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Domain Suggestions</p>
                    <div className="flex flex-wrap gap-1">
                      {item.domainSuggestions.map((d, j) => (
                        <span key={j} className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
