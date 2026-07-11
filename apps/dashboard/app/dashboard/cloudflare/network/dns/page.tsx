"use client";
import { useState, useEffect } from "react";

export default function DNSPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [zoneForm, setZoneForm] = useState({ name: "", type: "full" });
  const [selectedZone, setSelectedZone] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [recordForm, setRecordForm] = useState({ type: "A", name: "", content: "", ttl: 120, proxied: true });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/network${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/dns").then(r => r.json()).then(d => setZones(d.zones || [])).catch(() => {}); }, []);

  const addZone = async () => {
    const d = await (await api("/dns", { method: "POST", body: JSON.stringify(zoneForm) })).json();
    setZones([...zones, d.zone]);
    setZoneForm({ name: "", type: "full" });
  };

  const selectZone = async (id: string) => {
    setSelectedZone(id);
    const d = await (await api(`/dns/${id}/records`)).json();
    setRecords(d.records || []);
  };

  const addRecord = async () => {
    const d = await (await api(`/dns/${selectedZone}/records`, { method: "POST", body: JSON.stringify(recordForm) })).json();
    setRecords([...records, d.record]);
    setRecordForm({ type: "A", name: "", content: "", ttl: 120, proxied: true });
  };

  const deleteRecord = async (recId: string) => {
    await api(`/dns/${selectedZone}/records/${recId}`, { method: "DELETE" });
    setRecords(records.filter((r: any) => r.id !== recId));
  };

  const deleteZone = async (id: string) => {
    await api(`/dns/${id}`, { method: "DELETE" });
    setZones(zones.filter((z: any) => z.id !== id));
    if (selectedZone === id) { setSelectedZone(""); setRecords([]); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">DNS</h1><p className="text-gray-500">Fast, global DNS management</p></div></div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">Add Zone</h3>
        <div className="flex gap-3">
          <input placeholder="example.com" value={zoneForm.name} onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <button onClick={addZone} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">Add Zone</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          {zones.map((z: any) => (
            <div key={z.id} className={`p-3 rounded-xl border cursor-pointer ${selectedZone === z.id ? "border-brand-300 bg-brand-50" : "border-gray-200 bg-white"}`} onClick={() => selectZone(z.id)}>
              <div className="flex justify-between items-center">
                <div><span className="font-medium text-sm">{z.name}</span><span className="text-xs text-gray-400 ml-2">{z.type}</span></div>
                <div className="flex gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${z.paused ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{z.paused ? "Paused" : "Active"}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteZone(z.id); }} className="text-red-600 text-xs hover:text-red-800">✕</button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{(z.nameServers as string[])?.join(", ")}</p>
            </div>
          ))}
        </div>
        <div className="p-5 rounded-xl border border-gray-200 bg-white">
          <h3 className="font-semibold text-sm mb-3">DNS Records {selectedZone ? `(${records.length})` : ""}</h3>
          {selectedZone && (
            <>
              <div className="grid grid-cols-5 gap-2 mb-3">
                <select value={recordForm.type} onChange={e => setRecordForm({ ...recordForm, type: e.target.value })} className="px-2 py-1.5 border border-gray-300 rounded text-xs">
                  {["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "NS"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input placeholder="Name" value={recordForm.name} onChange={e => setRecordForm({ ...recordForm, name: e.target.value })} className="px-2 py-1.5 border border-gray-300 rounded text-xs" />
                <input placeholder="Content" value={recordForm.content} onChange={e => setRecordForm({ ...recordForm, content: e.target.value })} className="col-span-2 px-2 py-1.5 border border-gray-300 rounded text-xs" />
                <button onClick={addRecord} className="px-2 py-1.5 bg-blue-600 text-white rounded text-xs">Add</button>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {records.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                    <div><span className="font-mono font-medium">{r.name}</span> <span className="text-gray-400">{r.type}</span> <span className="ml-1">{r.content}</span></div>
                    <div className="flex items-center gap-2">
                      {r.proxied && <span className="text-orange-500">Proxied</span>}
                      <button onClick={() => deleteRecord(r.id)} className="text-red-600 hover:text-red-800">✕</button>
                    </div>
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
