"use client";

import { useState, useEffect } from "react";
import {
  Plus, GraduationCap, School, Users,
  CheckCircle, Clock, XCircle, Globe, Percent, Copy
} from "lucide-react";

interface Partnership {
  id: string;
  institutionName: string;
  type: string;
  contactName: string;
  email: string;
  country: string;
  studentCount: number;
  programType: string;
  status: string;
  discount: number;
  discountCode: string;
}

export default function EducationalPartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    institutionName: "", type: "school", contactName: "",
    email: "", country: "", studentCount: "100", programType: "web_hosting"
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/hostinger-services/educational-partnerships", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setPartnerships(data.partnerships || []))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/hostinger-services/educational-partnerships", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, studentCount: parseInt(form.studentCount) }),
    });
    if (res.ok) {
      const data = await res.json();
      setPartnerships([...partnerships, data.partnership]);
      setShowForm(false);
      setForm({ institutionName: "", type: "school", contactName: "", email: "", country: "", studentCount: "100", programType: "web_hosting" });
    }
  };

  const copyCode = async (code: string) => {
    try { await navigator.clipboard.writeText(code); } catch {}
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Educational Partnerships</h1>
          <p className="text-gray-500">Partner with us to provide hosting for educational institutions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Apply Now
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Institution Name</label>
              <input value={form.institutionName} onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                className="input-field" placeholder="University of Example" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="school">School</option>
                <option value="university">University</option>
                <option value="bootcamp">Bootcamp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Program Type</label>
              <select value={form.programType} onChange={(e) => setForm({ ...form, programType: e.target.value })} className="input-field">
                <option value="web_hosting">Web Hosting</option>
                <option value="cloud_computing">Cloud Computing</option>
                <option value="web_development">Web Development</option>
                <option value="computer_science">Computer Science</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Name</label>
              <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                className="input-field" placeholder="Dr. Smith" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="admin@institution.edu" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="input-field" placeholder="United States" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Student Count</label>
              <input type="number" value={form.studentCount} onChange={(e) => setForm({ ...form, studentCount: e.target.value })}
                className="input-field" min="1" />
            </div>
          </div>
          <button type="submit" className="btn-primary">Submit Application</button>
        </form>
      )}

      {partnerships.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No partnerships yet</p>
            <p className="text-gray-400 text-sm mt-1">Apply for an educational partnership</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partnerships.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5 text-brand-500" />
                  <h3 className="font-semibold">{p.institutionName}</h3>
                </div>
                <span className={`badge ${
                  p.status === "approved" ? "badge-success" :
                  p.status === "rejected" ? "badge-error" : "badge-warning"
                }`}>
                  {p.status}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-500 mb-3">
                <p className="flex items-center gap-1"><Globe className="w-3 h-3" /> {p.country || "N/A"}</p>
                <p className="flex items-center gap-1"><School className="w-3 h-3" /> {p.type}</p>
                <p className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.studentCount} students</p>
                <p className="flex items-center gap-1"><Percent className="w-3 h-3" /> {p.discount}% discount</p>
                <p className="text-[10px] text-gray-400">{p.contactName} · {p.email}</p>
              </div>
              {p.status === "approved" && p.discountCode && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-700 mb-1">Your discount code:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-sm font-bold text-green-800 bg-white px-3 py-1 rounded border border-green-200">
                      {p.discountCode}
                    </code>
                    <button onClick={() => copyCode(p.discountCode)} className="text-green-600 hover:text-green-700">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
