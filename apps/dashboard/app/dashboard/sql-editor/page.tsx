"use client";

import { useState } from "react";

export default function SqlEditorPage() {
  const [query, setQuery] = useState("SELECT * FROM pg_catalog.pg_tables LIMIT 10;");
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const executeQuery = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/sql/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          connectionString: "postgresql://postgres:postgres@localhost:5432/cloudhost",
          query,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setResults(null);
      } else {
        setResults(data);
        setHistory((h) => [query, ...h].slice(0, 20));
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SQL Editor</h1>
        <p className="text-gray-500">Run SQL queries directly against your database</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="font-semibold">Query</h2>
              <div className="flex gap-2">
                <button onClick={executeQuery} disabled={loading}
                  className="btn-primary text-sm">
                  {loading ? "Running..." : "Run"}
                </button>
                <button onClick={() => setQuery("")} className="btn-secondary text-sm">Clear</button>
              </div>
            </div>
            <div className="card-body p-0">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-48 p-4 text-sm font-mono bg-gray-900 text-green-400 focus:outline-none resize-none"
                spellCheck={false}
                placeholder="Enter SQL query..."
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {results && (
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="font-semibold">Results</h2>
                <span className="text-xs text-gray-400">{results.rowCount} rows returned</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {results.columns.map((col: string) => (
                        <th key={col} className="px-4 py-3 text-left font-medium text-gray-600">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.rows.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {results.columns.map((col: string) => (
                          <td key={col} className="px-4 py-2 font-mono text-xs text-gray-700">
                            {String(row[col] ?? "NULL")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-sm">Query History</h2>
            </div>
            <div className="card-body p-2 space-y-1">
              {history.length === 0 ? (
                <p className="text-xs text-gray-400 p-2">No queries yet</p>
              ) : (
                history.map((q, i) => (
                  <button key={i} onClick={() => setQuery(q)}
                    className="w-full text-left p-2 text-xs font-mono bg-gray-50 rounded hover:bg-gray-100 truncate">
                    {q}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-sm">Quick Templates</h2>
            </div>
            <div className="card-body p-2 space-y-1">
              {[
                "SELECT * FROM pg_tables WHERE schemaname = 'public';",
                "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public';",
                "SELECT pg_size_pretty(pg_database_size(current_database()));",
              ].map((q) => (
                <button key={q} onClick={() => setQuery(q)}
                  className="w-full text-left p-2 text-xs font-mono bg-gray-50 rounded hover:bg-gray-100 truncate">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
