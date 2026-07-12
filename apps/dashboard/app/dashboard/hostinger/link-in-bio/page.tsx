"use client";

import { useState, useEffect } from "react";
import {
  Plus, Link2, Eye, MousePointerClick, Send,
  User, Globe, Palette, Hash
} from "lucide-react";

interface LinkBio {
  id: string;
  title: string;
  username: string;
  bio: string;
  avatarUrl: string;
  links: { label: string; url: string }[];
  socialLinks: { platform: string; url: string }[];
  themeColor: string;
  status: string;
  views: number;
  clicks: number;
}

export default function LinkInBioPage() {
  const [pages, setPages] = useState<LinkBio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", username: "", bio: "", avatarUrl: "",
    links: "", socialLinks: "", themeColor: "#6366f1"
  });
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/link-in-bio`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setPages(data.pages || []))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/link-in-bio`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        links: form.links.split("\n").filter(Boolean).map((l) => {
          const [label, url] = l.split(",");
          return { label: label?.trim(), url: url?.trim() };
        }),
        socialLinks: form.socialLinks.split("\n").filter(Boolean).map((l) => {
          const [platform, url] = l.split(",");
          return { platform: platform?.trim(), url: url?.trim() };
        }),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setPages([...pages, data.page]);
      setShowForm(false);
      setForm({ title: "", username: "", bio: "", avatarUrl: "", links: "", socialLinks: "", themeColor: "#6366f1" });
    }
  };

  const publish = async (id: string) => {
    setPublishing(id);
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/link-in-bio/${id}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setPages(pages.map((p) => (p.id === id ? { ...p, ...data.page } : p)));
    }
    setPublishing(null);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Link in Bio</h1>
          <p className="text-gray-500">Create beautiful link-in-bio pages</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Page
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field" placeholder="My Links" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input-field" placeholder="myusername" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="input-field" rows={2} placeholder="Your bio..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Avatar URL</label>
              <input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                className="input-field" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Theme Color</label>
              <input type="color" value={form.themeColor} onChange={(e) => setForm({ ...form, themeColor: e.target.value })}
                className="input-field h-10" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Links (label,url per line)</label>
              <textarea value={form.links} onChange={(e) => setForm({ ...form, links: e.target.value })}
                className="input-field" rows={3} placeholder="My Website,https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Social Links (platform,url per line)</label>
              <textarea value={form.socialLinks} onChange={(e) => setForm({ ...form, socialLinks: e.target.value })}
                className="input-field" rows={3} placeholder="twitter,https://..." />
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Page</button>
        </form>
      )}

      {pages.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Link2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No link-in-bio pages yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first page</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <div key={page.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{page.title}</h3>
                <span className={`badge ${page.status === "published" ? "badge-success" : "badge-warning"}`}>
                  {page.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-2">@{page.username}</div>

              <div className="bg-gray-50 rounded-xl p-4 mb-3 text-center" style={{ borderTop: `4px solid ${page.themeColor}` }}>
                <div className="w-16 h-16 bg-gradient-to-br from-brand-200 to-purple-200 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                  {page.avatarUrl ? (
                    <img src={page.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-brand-500" />
                  )}
                </div>
                {page.bio && <p className="text-xs text-gray-600 mb-2">{page.bio}</p>}
                <div className="space-y-1">
                  {page.links?.map((link, i) => (
                    <div key={i} className="text-xs bg-white rounded-lg py-1.5 px-3 border border-gray-200">
                      <Link2 className="w-3 h-3 inline mr-1" />{link.label}
                    </div>
                  ))}
                </div>
                {page.socialLinks?.length > 0 && (
                  <div className="flex justify-center gap-2 mt-2 text-xs text-gray-400">
                    {page.socialLinks.map((s, i) => <span key={i}>{s.platform}</span>)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {page.views} views</span>
                <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> {page.clicks} clicks</span>
              </div>

              {page.status === "draft" && (
                <button onClick={() => publish(page.id)} disabled={publishing === page.id} className="btn-primary w-full text-xs">
                  <Send className="w-3 h-3" />
                  {publishing === page.id ? "Publishing..." : "Publish"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
