"use client";

import { useEffect, useState } from "react";
import { Search, BarChart3, Globe, Users, MessageSquare, Star, TrendingUp, Target, MapPin, Bell, Eye, ThumbsUp, Share2, Send, Play, ExternalLink, Loader2, Sparkles } from "lucide-react";

type Tab = "seo" | "social" | "reviews" | "ads" | "local" | "brand";

export default function RelatePage() {
  const [tab, setTab] = useState<Tab>("seo");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relate Marketing Suite</h1>
        <p className="text-gray-500">SEO, social media, reviews, ads, and brand monitoring tools</p>
      </div>

      <div className="card p-1">
        <div className="flex flex-wrap">
          {(["seo", "social", "reviews", "ads", "local", "brand"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${tab === t ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {t === "seo" && <Search className="w-4 h-4" />}
              {t === "social" && <Users className="w-4 h-4" />}
              {t === "reviews" && <Star className="w-4 h-4" />}
              {t === "ads" && <Target className="w-4 h-4" />}
              {t === "local" && <MapPin className="w-4 h-4" />}
              {t === "brand" && <Bell className="w-4 h-4" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {tab === "seo" && <SeoTab headers={headers} />}
      {tab === "social" && <SocialTab headers={headers} />}
      {tab === "reviews" && <ReviewsTab headers={headers} />}
      {tab === "ads" && <AdsTab headers={headers} />}
      {tab === "local" && <LocalTab headers={headers} />}
      {tab === "brand" && <BrandTab headers={headers} />}
    </div>
  );
}

function SeoTab({ headers }: { headers: Record<string, string> }) {
  const [domain, setDomain] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    try {
      let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/relate/seo`, { headers });
      let d = await res.json();
      const sites = d.sites || d.seoData || [];
      const existing = sites.find((s: any) => s.domain === domain.trim());
      if (existing) { setData(existing); setLoading(false); return; }

      res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/relate/seo/analyze`, {
        method: "POST", headers,
        body: JSON.stringify({ domain: domain.trim() }),
      });
      d = await res.json();
      setData(d.seoData || d);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <form onSubmit={analyze} className="flex gap-3">
          <input value={domain} onChange={e => setDomain(e.target.value)} className="input-field" placeholder="Enter domain (e.g. example.com)" />
          <button type="submit" disabled={loading} className="btn-primary"><Search className="w-4 h-4" /> {loading ? "Analyzing..." : "Analyze"}</button>
        </form>
      </div>
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Domain Authority</p><p className="text-2xl font-bold text-brand-600">{data.da || data.domainAuthority || "N/A"}</p></div>
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Page Authority</p><p className="text-2xl font-bold text-brand-600">{data.pa || data.pageAuthority || "N/A"}</p></div>
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Organic Traffic</p><p className="text-2xl font-bold text-brand-600">{(data.organicTraffic || data.traffic || 0).toLocaleString()}</p></div>
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Backlinks</p><p className="text-2xl font-bold text-brand-600">{(data.backlinks || 0).toLocaleString()}</p></div>
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Crawl Errors</p><p className="text-2xl font-bold text-red-500">{data.crawlErrors || data.errors || 0}</p></div>
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Keywords</p><p className="text-2xl font-bold text-brand-600">{(data.keywords || []).length}</p></div>
        </div>
      )}
      {data?.keywords?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold mb-3">Keywords</h3>
          <div className="flex flex-wrap gap-2">{data.keywords.map((k: string, i: number) => <span key={i} className="badge badge-info">{k}</span>)}</div>
        </div>
      )}
      {data?.recommendations?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold mb-3">Recommendations</h3>
          <ul className="space-y-2">{data.recommendations.map((r: string, i: number) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />{r}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

function SocialTab({ headers }: { headers: Record<string, string> }) {
  const [platform, setPlatform] = useState("twitter");
  const [handle, setHandle] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const connect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/relate/social`, {
        method: "POST", headers,
        body: JSON.stringify({ platform, handle: handle.trim() }),
      });
      const d = await res.json();
      setData(d.socialData || d);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <form onSubmit={connect} className="flex flex-wrap gap-3">
          <select value={platform} onChange={e => setPlatform(e.target.value)} className="input-field w-36">
            <option value="twitter">Twitter/X</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube</option>
          </select>
          <input value={handle} onChange={e => setHandle(e.target.value)} className="input-field flex-1" placeholder="Username or handle" />
          <button type="submit" disabled={loading} className="btn-primary">{loading ? "Connecting..." : "Connect"}</button>
        </form>
      </div>
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Followers</p><p className="text-2xl font-bold text-brand-600">{(data.followers || 0).toLocaleString()}</p></div>
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Engagement</p><p className="text-2xl font-bold text-brand-600">{data.engagement || data.engagementRate || "N/A"}</p></div>
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Posts</p><p className="text-2xl font-bold text-brand-600">{(data.posts || data.postCount || 0).toLocaleString()}</p></div>
        </div>
      )}
    </div>
  );
}

function ReviewsTab({ headers }: { headers: Record<string, string> }) {
  const [platform, setPlatform] = useState("google");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/relate/reviews?platform=${platform}`, { headers })
      .then(r => r.json())
      .then(d => setData(d.reviewsData || d))
      .catch(() => {});
  }, [platform]);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <select value={platform} onChange={e => setPlatform(e.target.value)} className="input-field w-44">
          <option value="google">Google</option>
          <option value="yelp">Yelp</option>
          <option value="trustpilot">Trustpilot</option>
          <option value="facebook">Facebook</option>
        </select>
      </div>
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Rating</p><p className="text-2xl font-bold text-yellow-500">{data.rating || "N/A"}</p></div>
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Total Reviews</p><p className="text-2xl font-bold text-brand-600">{(data.reviewCount || 0).toLocaleString()}</p></div>
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Response Rate</p><p className="text-2xl font-bold text-brand-600">{data.responseRate || "N/A"}</p></div>
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Sentiment</p><p className="text-2xl font-bold text-green-500">{data.sentiment || "N/A"}</p></div>
        </div>
      )}
    </div>
  );
}

function AdsTab({ headers }: { headers: Record<string, string> }) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("google");
  const [budget, setBudget] = useState("500");
  const [audience, setAudience] = useState("");

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/relate/ads`, { headers });
      const d = await res.json();
      setCampaigns(d.campaigns || []);
    } catch {}
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/relate/ads`, {
        method: "POST", headers,
        body: JSON.stringify({ name, platform, budget: Number(budget), audience }),
      });
      setName(""); setPlatform("google"); setBudget("500"); setAudience("");
      setShowForm(false);
      await fetchCampaigns();
    } catch {}
  };

  const launchCampaign = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/relate/ads/${id}/launch`, { method: "POST", headers });
      await fetchCampaigns();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{campaigns.length} campaign(s)</p>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Target className="w-4 h-4" /> New Campaign</button>
      </div>
      {campaigns.length === 0 ? (
        <div className="card p-12 text-center"><Target className="w-16 h-16 mx-auto mb-4 text-gray-300" /><h3 className="text-lg font-semibold mb-2">No Campaigns</h3><p className="text-gray-500">Create your first ad campaign</p></div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <div key={c.id} className="card p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-xs text-gray-500">{c.platform} | Budget: ${c.budget} | {c.audience}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${c.status === "active" || c.status === "launched" ? "badge-success" : "badge-warning"} text-xs`}>{c.status}</span>
                {c.status !== "active" && c.status !== "launched" && <button onClick={() => launchCampaign(c.id)} className="btn-primary text-sm"><Play className="w-4 h-4" /> Launch</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">New Ad Campaign</h3>
            <form onSubmit={createCampaign}>
              <label className="block text-sm font-medium mb-1">Campaign Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-field mb-3" required />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-sm font-medium mb-1">Platform</label><select value={platform} onChange={e => setPlatform(e.target.value)} className="input-field"><option value="google">Google Ads</option><option value="facebook">Facebook</option><option value="linkedin">LinkedIn</option><option value="twitter">Twitter/X</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Budget ($)</label><input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="input-field" /></div>
              </div>
              <label className="block text-sm font-medium mb-1">Audience</label>
              <input value={audience} onChange={e => setAudience(e.target.value)} className="input-field mb-4" placeholder="e.g. small business owners" />
              <button type="submit" className="btn-primary w-full">Create Campaign</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LocalTab({ headers }: { headers: Record<string, string> }) {
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/relate/local`, {
        method: "POST", headers,
        body: JSON.stringify({ businessName, address, phone }),
      });
      const d = await res.json();
      setData(d.localData || d);
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card p-6">
        <h3 className="font-semibold mb-4">Business Information</h3>
        <form onSubmit={saveInfo}>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="input-field mb-3" />
          <label className="block text-sm font-medium mb-1">Address</label>
          <input value={address} onChange={e => setAddress(e.target.value)} className="input-field mb-3" />
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field mb-4" />
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save & Check"}</button>
        </form>
      </div>
      {data && (
        <div className="space-y-4">
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Listing Accuracy</p><p className="text-2xl font-bold text-brand-600">{data.listingAccuracy || data.accuracyScore || "N/A"}%</p></div>
          <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Citation Count</p><p className="text-2xl font-bold text-brand-600">{data.citationCount || data.citations || 0}</p></div>
        </div>
      )}
    </div>
  );
}

function BrandTab({ headers }: { headers: Record<string, string> }) {
  const [brand, setBrand] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const monitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/relate/brand`, {
        method: "POST", headers,
        body: JSON.stringify({ brand: brand.trim() }),
      });
      const d = await res.json();
      setData(d.brandData || d);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <form onSubmit={monitor} className="flex gap-3">
          <input value={brand} onChange={e => setBrand(e.target.value)} className="input-field" placeholder="Enter brand name" />
          <button type="submit" disabled={loading} className="btn-primary"><Bell className="w-4 h-4" /> {loading ? "Scanning..." : "Monitor"}</button>
        </form>
      </div>
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Mentions</p><p className="text-2xl font-bold text-brand-600">{(data.mentions || 0).toLocaleString()}</p></div>
            <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Sentiment</p><p className="text-2xl font-bold text-green-500">{data.sentiment || "N/A"}</p></div>
            <div className="card p-5"><p className="text-sm text-gray-500 mb-1">Top Sources</p><p className="text-2xl font-bold text-brand-600">{data.topSources?.length || data.sources?.length || 0}</p></div>
          </div>
          {data.topSources?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold mb-3">Top Sources</h3>
              <div className="flex flex-wrap gap-2">{data.topSources.map((s: string, i: number) => <span key={i} className="badge badge-info">{s}</span>)}</div>
            </div>
          )}
          {data.recentMentions?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold mb-3">Recent Mentions</h3>
              <ul className="space-y-2">{data.recentMentions.map((m: any, i: number) => <li key={i} className="text-sm text-gray-600 flex items-center gap-2"><ExternalLink className="w-3 h-3 text-gray-400" />{m.title || m.text || m}</li>)}</ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
