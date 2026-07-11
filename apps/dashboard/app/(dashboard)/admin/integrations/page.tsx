"use client";

import { useState, useEffect } from "react";

const defaultServices = [
  { id: "stripe", name: "Stripe", description: "Payment processing for billing plans", category: "Payments", docs: "https://stripe.com/docs/api" },
  { id: "openai", name: "OpenAI", description: "AI Builder, AI Assistant, content generation", category: "AI", docs: "https://platform.openai.com/api-keys" },
  { id: "sendgrid", name: "SendGrid", description: "Transactional emails, password resets, notifications", category: "Email", docs: "https://sendgrid.com/docs/api-reference" },
  { id: "github", name: "GitHub OAuth", description: "OAuth authentication provider", category: "Auth", docs: "https://docs.github.com/en/apps/oauth-apps" },
  { id: "google", name: "Google OAuth", description: "OAuth authentication provider", category: "Auth", docs: "https://console.cloud.google.com/apis/credentials" },
  { id: "aws", name: "AWS S3", description: "File storage and CDN origin", category: "Storage", docs: "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html" },
  { id: "cloudflare", name: "Cloudflare API", description: "DNS, CDN, DDoS protection, Workers", category: "Infrastructure", docs: "https://dash.cloudflare.com/profile/api-tokens" },
  { id: "resend", name: "Resend", description: "Email delivery for marketing campaigns", category: "Email", docs: "https://resend.com/api-keys" },
  { id: "supabase", name: "Supabase", description: "Database, Auth, Realtime, Storage backend", category: "Infrastructure", docs: "https://supabase.com/dashboard/account/tokens" },
  { id: "vercel", name: "Vercel", description: "Deployment platform for frontend hosting", category: "Infrastructure", docs: "https://vercel.com/account/tokens" },
  { id: "docker", name: "Docker Registry", description: "Container registry for deployments", category: "Infrastructure", docs: "https://hub.docker.com/settings/security" },
  { id: "digitalocean", name: "DigitalOcean", description: "VPS and cloud infrastructure", category: "Infrastructure", docs: "https://cloud.digitalocean.com/account/api/tokens" },
];

export default function AdminIntegrationsPage() {
  const [services, setServices] = useState<any[]>(() => {
    const saved = localStorage.getItem("admin_integrations");
    if (saved) return JSON.parse(saved);
    return defaultServices.map(s => ({ ...s, key: "", status: "disconnected" }));
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [editKey, setEditKey] = useState("");

  useEffect(() => {
    localStorage.setItem("admin_integrations", JSON.stringify(services));
  }, [services]);

  const connect = (id: string) => {
    setEditing(id);
    const svc = services.find(s => s.id === id);
    setEditKey(svc?.key || "");
  };

  const save = (id: string) => {
    setServices(prev => prev.map(s =>
      s.id === id ? { ...s, key: editKey, status: editKey ? "connected" : "disconnected" } : s
    ));
    setEditing(null);
    setEditKey("");
  };

  const disconnect = (id: string) => {
    setServices(prev => prev.map(s =>
      s.id === id ? { ...s, key: "", status: "disconnected" } : s
    ));
  };

  const categories = [...new Set(services.map(s => s.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-gray-500">Connect external services and manage API keys</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success">{services.filter(s => s.status === "connected").length} Connected</span>
          <span className="badge badge-info">{services.filter(s => s.status === "disconnected").length} Disconnected</span>
        </div>
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">{cat}</h2>
          <div className="grid gap-4">
            {services.filter(s => s.category === cat).map(service => (
              <div key={service.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service.status === "connected" ? "bg-green-100" : "bg-gray-100"}`}>
                      <span className={`text-sm font-bold ${service.status === "connected" ? "text-green-700" : "text-gray-500"}`}>
                        {service.name[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        <span className={`inline-block w-2 h-2 rounded-full ${service.status === "connected" ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className={`text-xs ${service.status === "connected" ? "text-green-600" : "text-gray-400"}`}>
                          {service.status === "connected" ? "Connected" : "Disconnected"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={service.docs} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-brand-600 underline">Docs</a>
                  </div>
                </div>

                {editing === service.id ? (
                  <div className="mt-4 pl-14">
                    <div className="flex items-center gap-3">
                      <input type="text" value={editKey} onChange={e => setEditKey(e.target.value)}
                        className="input-field flex-1 font-mono text-sm" placeholder="Enter API key..." />
                      <button onClick={() => save(service.id)} className="btn-primary text-sm">Save</button>
                      <button onClick={() => setEditing(null)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                  </div>
                ) : service.key ? (
                  <div className="mt-3 pl-14 flex items-center gap-3">
                    <code className="text-xs bg-gray-100 px-3 py-1.5 rounded font-mono text-gray-600">
                      {service.key.substring(0, 8)}...{service.key.substring(service.key.length - 4)}
                    </code>
                    <button onClick={() => connect(service.id)} className="text-xs text-brand-600 hover:text-brand-700">Edit</button>
                    <button onClick={() => disconnect(service.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ) : (
                  <div className="mt-3 pl-14">
                    <button onClick={() => connect(service.id)} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                      + Add API Key
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}