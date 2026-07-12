"use client";

import { useState, useEffect } from "react";
import {
  Plus, Building2, MapPin, Users, Star,
  BadgeCheck, Search, Tag
} from "lucide-react";

interface AgencyDir {
  id: string;
  name: string;
  description: string;
  services: string[];
  location: string;
  clientCount: number;
  avgRating: number;
  verified: boolean;
  logo: string;
}

export default function AgencyDirectoryPage() {
  const [agencies, setAgencies] = useState<AgencyDir[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", services: "",
    location: "", clientCount: "0"
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/hostinger-services/agency-directory`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setAgencies(data.agencies || []))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/hostinger-services/agency-directory`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        services: form.services.split(",").map((s) => s.trim()).filter(Boolean),
        clientCount: parseInt(form.clientCount),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setAgencies([...agencies, data.agency]);
      setShowForm(false);
      setForm({ name: "", description: "", services: "", location: "", clientCount: "0" });
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agency Directory</h1>
          <p className="text-gray-500">Find and connect with verified hosting agencies</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> List Your Agency
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Agency Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="My Agency" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="input-field" placeholder="City, Country" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field" rows={2} placeholder="Tell us about your agency..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Services (comma separated)</label>
              <input value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })}
                className="input-field" placeholder="Web Design, SEO, Marketing" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Count</label>
              <input type="number" value={form.clientCount} onChange={(e) => setForm({ ...form, clientCount: e.target.value })}
                className="input-field" min="0" />
            </div>
          </div>
          <button type="submit" className="btn-primary">List Agency</button>
        </form>
      )}

      {agencies.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No agencies listed</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to list your agency</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agencies.map((agency) => (
            <div key={agency.id} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {agency.logo ? (
                    <img src={agency.logo} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Building2 className="w-7 h-7 text-brand-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold">{agency.name}</h3>
                    {agency.verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {agency.location}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-yellow-500 mt-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{agency.avgRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{agency.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {agency.services?.map((s, i) => (
                  <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />{s}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span>{agency.clientCount} clients</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
