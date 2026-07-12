"use client";

import { useState } from "react";
import { AlertTriangle, Send, Shield, Upload, CheckCircle } from "lucide-react";

const reportTypes = ["abuse", "spam", "phishing", "malware", "copyright", "trademark", "other"];

export default function AbuseReportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reportType, setReportType] = useState("abuse");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [caseId, setCaseId] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !description.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/abuse`, {
        method: "POST", headers,
        body: JSON.stringify({ name: name.trim(), email: email.trim(), reportType, domain: domain.trim(), description: description.trim() }),
      });
      const data = await res.json();
      setCaseId(data.caseId || data.id || "ABUSE-" + Date.now());
    } catch {} finally { setSending(false); }
  };

  if (caseId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Report Abuse</h1>
          <p className="text-gray-500">Report submitted successfully</p>
        </div>
        <div className="card p-12 text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-bold mb-2">Report Submitted</h2>
          <p className="text-gray-500 mb-2">Your abuse report has been received.</p>
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg mb-6">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-mono font-bold text-blue-600">{caseId}</span>
          </div>
          <p className="text-sm text-gray-400">We will investigate and follow up within 24 hours.</p>
          <button onClick={() => { setCaseId(""); setName(""); setEmail(""); setReportType("abuse"); setDomain(""); setDescription(""); }} className="btn-primary mt-6">Submit Another Report</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Report Abuse</h1>
        <p className="text-gray-500">Report abusive content, spam, or security issues</p>
      </div>

      <div className="card p-6">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Full name" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="your@email.com" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Report Type</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)} className="input-field">
                {reportTypes.map(rt => <option key={rt} value={rt}>{rt.charAt(0).toUpperCase() + rt.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domain / IP (optional)</label>
              <input value={domain} onChange={e => setDomain(e.target.value)} className="input-field" placeholder="example.com or IP address" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={5} placeholder="Describe the issue in detail. Include URLs, timestamps, and any relevant information." required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Evidence (optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-400 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Click to upload screenshots or evidence files</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF (max 10MB)</p>
            </div>
          </div>

          <button type="submit" disabled={sending} className="btn-primary">
            {sending ? <span className="animate-pulse">Submitting...</span> : <><Send className="w-4 h-4" /> Submit Report</>}
          </button>
        </form>
      </div>
    </div>
  );
}
