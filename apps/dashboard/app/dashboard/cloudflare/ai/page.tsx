"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const services = [
  { name: "Workers AI", desc: "Edge AI inference models", icon: "🧠", route: "/cloudflare/ai/workers-ai", color: "bg-purple-500" },
  { name: "Vectorize", desc: "Vector database & similarity search", icon: "📐", route: "/cloudflare/ai/vectorize", color: "bg-pink-500" },
  { name: "AI Gateway", desc: "AI gateway with caching & rate limiting", icon: "🚪", route: "/cloudflare/ai/gateway", color: "bg-indigo-500" },
  { name: "AI Search", desc: "Instant retrieval & semantic search", icon: "🔍", route: "/cloudflare/ai/search", color: "bg-blue-500" },
  { name: "AI Agents", desc: "Build stateful AI agents", icon: "🤖", route: "/cloudflare/ai/agents", color: "bg-violet-500" },
];

export default function AiPage() {
  const [models, setModels] = useState<any[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch("/api/cloudflare/ai/models", { headers: h }).then(r => r.json()).then(d => setModels(d.models || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI</h1>
          <p className="text-gray-500">Edge AI models, vector search, agents and more</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <Link key={s.route} href={s.route}
            className="block p-5 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-brand-200 transition-all"
          >
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>{s.icon}</div>
            <h3 className="font-semibold">{s.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-3">Available AI Models</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {models.map((m: any) => (
            <div key={m.id} className="p-3 bg-gray-50 rounded-lg text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{m.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs ${m.status === "available" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{m.status}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{m.category} · {(m.pricing as any)?.perToken ? `$${(m.pricing as any).perToken}/token` : "Free"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
