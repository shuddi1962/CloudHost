"use client";

import { useState, useEffect } from "react";
import {
  Plus, Mail, Send, Sparkles, FileText,
  Users, BarChart3, TrendingUp
} from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  subject: string;
  topic: string;
  tone: string;
  content: string;
  status: string;
  subscribers: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
}

export default function NewsletterPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", subject: "", topic: "technology", tone: "professional" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/hostinger-services/newsletter", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setCampaigns(data.campaigns || []))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/hostinger-services/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setCampaigns([...campaigns, data.campaign]);
      setShowForm(false);
      setForm({ title: "", subject: "", topic: "technology", tone: "professional" });
    }
  };

  const generateContent = async (id: string) => {
    setGenerating(id);
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/hostinger-services/newsletter/${id}/generate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, ...data.campaign } : c)));
    }
    setGenerating(null);
  };

  const sendCampaign = async (id: string) => {
    setSending(id);
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/hostinger-services/newsletter/${id}/send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, ...data.campaign } : c)));
    }
    setSending(null);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Newsletter Generator</h1>
          <p className="text-gray-500">Create and send AI-powered newsletters</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field" placeholder="May Newsletter" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject Line</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="input-field" placeholder="Your weekly update" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Topic</label>
              <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="input-field">
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tone</label>
              <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} className="input-field">
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="funny">Funny</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Campaign</button>
        </form>
      )}

      {campaigns.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No campaigns yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first newsletter campaign</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{c.title}</h3>
                <span className={`badge ${c.status === "sent" ? "badge-success" : "badge-warning"}`}>
                  {c.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{c.subject}</p>
              <div className="flex gap-1 mb-3">
                <span className="badge badge-info text-[10px]">{c.topic}</span>
                <span className="badge badge-info text-[10px]">{c.tone}</span>
              </div>

              {c.content && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3 text-xs text-gray-600 max-h-24 overflow-y-auto">
                  {c.content.substring(0, 200)}...
                </div>
              )}

              {c.status === "sent" ? (
                <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <Users className="w-4 h-4 mx-auto mb-1 text-brand-500" />
                    <span className="font-medium">{c.subscribers}</span>
                    <p className="text-gray-400">Sent</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
                    <span className="font-medium">{c.openRate}%</span>
                    <p className="text-gray-400">Opens</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <BarChart3 className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                    <span className="font-medium">{c.clickRate}%</span>
                    <p className="text-gray-400">Clicks</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mb-3">{c.subscribers} subscribers</p>
              )}

              <div className="flex gap-2">
                {c.status === "draft" && (
                  <>
                    <button onClick={() => generateContent(c.id)} disabled={generating === c.id}
                      className="btn-secondary flex-1 text-xs">
                      <Sparkles className={`w-3 h-3 ${generating === c.id ? "animate-spin" : ""}`} />
                      {generating === c.id ? "Generating..." : "Generate Content"}
                    </button>
                    {c.content && (
                      <button onClick={() => sendCampaign(c.id)} disabled={sending === c.id}
                        className="btn-primary flex-1 text-xs">
                        <Send className="w-3 h-3" />
                        {sending === c.id ? "Sending..." : "Send"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
