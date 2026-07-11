"use client";
import { useState, useEffect } from "react";

export default function WorkersAiPage() {
  const [models, setModels] = useState<any[]>([]);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("@cf/meta/llama-3.1-8b-instruct");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/ai${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => {
    api("/models").then(r => r.json()).then(d => setModels(d.models || [])).catch(() => {});
    api("/inference-history").then(r => r.json()).then(d => setHistory(d.history || [])).catch(() => {});
  }, []);

  const infer = async () => {
    setLoading(true);
    const d = await (await api("/inference", { method: "POST", body: JSON.stringify({ prompt, model }) })).json();
    setResponse(d.response);
    setLoading(false);
    api("/inference-history").then(r => r.json()).then(d2 => setHistory(d2.history || [])).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Workers AI</h1><p className="text-gray-500">Run AI inference at the edge</p></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-gray-200 bg-white">
          <h3 className="font-semibold mb-4">Inference</h3>
          <select value={model} onChange={e => setModel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3">
            {models.filter((m: any) => m.category === "text-generation" || m.category === "vision").map((m: any) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
          <textarea placeholder="Enter your prompt..." value={prompt} onChange={e => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-24" />
          <button onClick={infer} disabled={loading || !prompt} className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">{loading ? "Running..." : "Run Inference"}</button>
          {response && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
              <h4 className="font-medium mb-2">Response</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </div>
        <div className="p-5 rounded-xl border border-gray-200 bg-white">
          <h3 className="font-semibold mb-4">Recent Inferences</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.slice().reverse().map((h: any, i: number) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg text-xs">
                <div className="flex justify-between text-gray-400"><span>{h.model}</span><span>{new Date(h.timestamp).toLocaleString()}</span></div>
                <p className="mt-1">{h.response?.slice(0, 150)}</p>
                <p className="text-gray-400 mt-1">{h.tokensUsed} tokens · {h.latency}ms</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
