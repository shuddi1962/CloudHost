"use client";
import { useState, useEffect } from "react";

export default function EmailServicePage() {
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState({ domain: "", forwardingAddresses: [""], sendConfig: { enabled: false, senderName: "" } });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const api = (path: string, opts?: any) => fetch(`/api/cloudflare/compute${path}`, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, ...opts });

  useEffect(() => { api("/email").then(r => r.json()).then(d => setServices(d.emailServices || [])).catch(() => {}); }, []);

  const create = async () => {
    const d = await (await api("/email", { method: "POST", body: JSON.stringify(form) })).json();
    setServices([...services, d.emailService]);
    setForm({ domain: "", forwardingAddresses: [""], sendConfig: { enabled: false, senderName: "" } });
  };

  const deleteE = async (id: string) => {
    await api(`/email/${id}`, { method: "DELETE" });
    setServices(services.filter((s: any) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Service</h1>
          <p className="text-gray-500">Send and receive email from your domains</p>
        </div>
      </div>
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h3 className="font-semibold mb-4">Add Email Domain</h3>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Domain (e.g. example.com)" value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <button onClick={create} className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">Add Domain</button>
      </div>
      <div className="space-y-3">
        {services.map((s: any) => (
          <div key={s.id} className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{s.domain}</h3>
                <p className="text-xs text-gray-400">Forwarding: {(s.forwardingAddresses as string[])?.join(", ") || "None"} · DNS: {s.dnsConfigured ? "✅" : "❌"}</p>
              </div>
              <button onClick={() => deleteE(s.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">Remove</button>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-center text-gray-400 py-8">No email domains configured.</p>}
      </div>
    </div>
  );
}
