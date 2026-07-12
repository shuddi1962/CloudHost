"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Play, Box } from "lucide-react";

export default function N8nPage() {
  const [alive, setAlive] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("http://localhost:5678/healthz", { mode: "no-cors" })
      .then(() => setAlive(true))
      .catch(() => setAlive(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Self-hosted n8n</h1>
          <p className="text-gray-500">n8n workflow automation running locally</p>
        </div>
        <a href="http://localhost:5678" target="_blank" rel="noopener noreferrer"
          className="btn-primary">
          <ExternalLink className="w-4 h-4" /> Open n8n
        </a>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${alive === null ? "bg-yellow-400 animate-pulse" : alive ? "bg-green-500" : "bg-red-400"}`} />
          <span className="font-medium">
            {alive === null ? "Checking..." : alive ? "n8n is running" : "n8n is not running"}
          </span>
        </div>

        {alive === false && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-amber-800 font-medium">Start n8n to use it</p>
            <div className="space-y-2 text-sm text-amber-700">
              <p><strong>Docker (recommended):</strong></p>
              <code className="block bg-amber-100 px-3 py-2 rounded text-xs">
                docker compose -f infrastructure/docker/docker-compose.yml up -d n8n
              </code>
              <p className="mt-2"><strong>Or via npx:</strong></p>
              <code className="block bg-amber-100 px-3 py-2 rounded text-xs">
                pnpm n8n
              </code>
            </div>
          </div>
        )}

        {alive === true && (
          <iframe src="http://localhost:5678" className="w-full h-[600px] rounded-lg border border-gray-200" />
        )}
      </div>
    </div>
  );
}
