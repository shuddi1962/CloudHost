"use client";
import { useState, useEffect } from "react";

export default function KVPage() {
  const [namespaces, setNamespaces] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [selectedNs, setSelectedNs] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [entryForm, setEntryForm] = useState({ key: "", value: "" });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/storage${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/kv").then(r => r.json()).then(d => setNamespaces(d.namespaces || [])).catch(() => {}); }, []);

  const create = async () => {
    const d = await (await api("/kv", { method: "POST", body: JSON.stringify(form) })).json();
    setNamespaces([...namespaces, d.namespace]);
    setForm({ title: "", description: "" });
  };

  const loadEntries = async (nsId: string) => {
    setSelectedNs(nsId);
    const d = await (await api(`/kv/${nsId}/entries`)).json();
    setEntries(d.entries || []);
  };

  const addEntry = async () => {
    const d = await (await api(`/kv/${selectedNs}/entries`, { method: "POST", body: JSON.stringify(entryForm) })).json();
    setEntries([...entries, d.entry]);
    setEntryForm({ key: "", value: "" });
  };

  const deleteEntry = async (id: string) => {
    await api(`/kv/${selectedNs}/entries/${id}`, { method: "DELETE" });
    setEntries(entries.filter((e: any) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">KV</h1><p className="text-gray-500">Ultra-fast global key-value storage</p></div></div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">New Namespace</h3>
        <div className="flex gap-3">
          <input placeholder="Namespace title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <button onClick={create} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">Create</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          {namespaces.map((ns: any) => (
            <div key={ns.id} className={`p-3 rounded-xl border cursor-pointer ${selectedNs === ns.id ? "border-brand-300 bg-brand-50" : "border-gray-200 bg-white"}`} onClick={() => loadEntries(ns.id)}>
              <div className="flex justify-between"><span className="font-medium text-sm">{ns.title}</span><span className="text-xs text-gray-400">{ns.keyCount} keys</span></div>
            </div>
          ))}
        </div>
        <div className="p-5 rounded-xl border border-gray-200 bg-white">
          <h3 className="font-semibold text-sm mb-3">Entries {selectedNs ? `(${entries.length})` : ""}</h3>
          {selectedNs && (
            <>
              <div className="flex gap-2 mb-3">
                <input placeholder="Key" value={entryForm.key} onChange={e => setEntryForm({ ...entryForm, key: e.target.value })} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs" />
                <input placeholder="Value" value={entryForm.value} onChange={e => setEntryForm({ ...entryForm, value: e.target.value })} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs" />
                <button onClick={addEntry} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs">Add</button>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {entries.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                    <div><span className="font-mono font-medium">{e.key}</span><span className="text-gray-400 ml-2">{e.value?.slice(0, 50)}</span></div>
                    <button onClick={() => deleteEntry(e.id)} className="text-red-600 hover:text-red-800">✕</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
