"use client";

import { useState } from "react";

const sampleTables = [
  { name: "users", columns: ["id", "email", "name", "created_at"], rows: 0 },
  { name: "projects", columns: ["id", "name", "slug", "organization_id", "created_at"], rows: 0 },
  { name: "deployments", columns: ["id", "project_id", "name", "framework", "status", "domain"], rows: 0 },
  { name: "databases", columns: ["id", "project_id", "name", "type", "host", "port", "status"], rows: 0 },
  { name: "workflows", columns: ["id", "project_id", "name", "status", "webhook_url"], rows: 0 },
  { name: "wordpress_sites", columns: ["id", "project_id", "name", "status", "php_version", "domain"], rows: 0 },
];

export default function TableEditorPage() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [editRow, setEditRow] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Table Editor</h1>
        <p className="text-gray-500">Browse, edit, and manage database tables visually</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-sm">Tables</h2>
          </div>
          <div className="card-body p-2 space-y-1">
            {sampleTables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${
                  selectedTable === t.name
                    ? "bg-brand-50 text-brand-700 border border-brand-200"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{t.name}</span>
                </div>
                <span className="text-xs text-gray-400">{t.columns.length} cols</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {!selectedTable ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">Select a table to browse its data</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold">{selectedTable}</h2>
                  <span className="text-xs text-gray-400">{rows.length} rows</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary text-sm">Add Row</button>
                  <button className="btn-secondary text-sm">Export</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {sampleTables.find(t => t.name === selectedTable)?.columns.map((col) => (
                        <th key={col} className="px-4 py-3 text-left font-medium text-gray-600">{col}</th>
                      ))}
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                          <p>No data in this table</p>
                          <p className="text-xs mt-1">Click "Add Row" to insert data</p>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="px-4 py-2 text-gray-700">{val}</td>
                          ))}
                          <td className="px-4 py-2 text-right">
                            <button className="text-brand-600 hover:text-brand-800 text-xs">Edit</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
