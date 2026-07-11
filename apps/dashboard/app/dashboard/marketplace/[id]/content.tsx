"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const typeColors: Record<string, string> = {
  SaaS: "bg-blue-100 text-blue-700",
  Container: "bg-cyan-100 text-cyan-700",
  Free: "bg-emerald-100 text-emerald-700",
  "Machine Learning": "bg-purple-100 text-purple-700",
  "Professional Services": "bg-amber-100 text-amber-700",
  Data: "bg-indigo-100 text-indigo-700",
  AMI: "bg-orange-100 text-orange-700",
};

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || "";
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`http://localhost:3001/api/marketplace/apps/${id}`, { headers })
      .then(r => r.json())
      .then(data => setApp(data.app || null))
      .catch(() => setApp(null))
      .finally(() => setLoading(false));
    fetch(`http://localhost:3001/api/marketplace/reviews/${id}`, { headers })
      .then(r => r.json())
      .then(data => setReviews(data.reviews || []))
      .catch(() => {});
  }, [id]);

  const submitReview = async () => {
    if (!newRating || !reviewText) return;
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/marketplace/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ appId: id, appName: app?.name, author: "You", rating: newRating, title: reviewTitle, text: reviewText }),
    });
    const data = await res.json();
    setReviews(prev => [data.review, ...prev]);
    setNewRating(0);
    setReviewTitle("");
    setReviewText("");
  };

  const relativeDate = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 30) return `${diff}d ago`;
    return new Date(d).toLocaleDateString();
  };

  const install = async () => {
    if (!app) return;
    setInstalling(true);
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3001/api/marketplace/install", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ appId: app.id, appName: app.name }),
    });
    setInstalled(true);
    setInstalling(false);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!app) return (
    <div className="text-center py-20">
      <svg className="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-gray-500 font-medium">Product not found</p>
      <Link href="/dashboard/marketplace" className="btn-secondary mt-4 inline-flex text-sm">Back to Marketplace</Link>
    </div>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard/marketplace" className="hover:text-brand-600">Marketplace</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{app.category}</span>
        <span>/</span>
        <span className="text-gray-900">{app.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl ${app.color || "bg-brand-600"} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-2xl">{app.icon || app.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold">{app.name}</h1>
                  <p className="text-gray-500">by {app.vendor}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeColors[app.type] || "bg-gray-100 text-gray-600"}`}>
                      {app.type || "SaaS"}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < Math.floor(app.rating) ? "fill-current" : "fill-gray-300"}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-600 ml-1">{app.rating} ({app.reviews})</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{app.longDescription || app.description}</p>
            </div>
          </div>

          {/* Features */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Features</h2>
            </div>
            <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-3">
              {app.features?.map((f: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Customer Reviews ({reviews.length})</h2>
            </div>
            <div className="card-body space-y-4">
              {reviews.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No reviews yet. Be the first to review!</p>}
              {reviews.map((r: any) => (
                <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">{r.author[0]}</span>
                      </div>
                      <span className="font-medium text-sm">{r.author}</span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }, (_, i) => (
                          <svg key={i} className={`w-3 h-3 ${i < r.rating ? "fill-current" : "fill-gray-300"}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">{relativeDate(r.createdAt)}</span>
                  </div>
                  {r.title && <p className="text-sm font-medium text-gray-800">{r.title}</p>}
                  <p className="text-xs text-gray-600 mt-0.5">{r.text}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                    <button className="hover:text-brand-600 transition-colors">Helpful ({r.helpful})</button>
                  </div>
                </div>
              ))}
              {/* Write a review */}
              <details className="border-t border-gray-100 pt-4 group">
                <summary className="text-sm font-medium text-brand-600 cursor-pointer hover:text-brand-700">Write a Review</summary>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setNewRating(s)}
                        className={`w-6 h-6 ${s <= newRating ? "text-amber-400" : "text-gray-300"} hover:text-amber-400 transition-colors`}>
                        <svg className="w-full h-full fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="text-xs text-gray-400 ml-2">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][newRating]}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                    <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} className="input-field text-sm" placeholder="Summarize your review" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Review</label>
                    <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} className="input-field h-20 text-sm" placeholder="Share your experience..." />
                  </div>
                  <button onClick={submitReview} disabled={!newRating || !reviewText}
                    className="btn-primary text-sm">Submit Review</button>
                </div>
              </details>
            </div>
          </div>

          {/* Screenshots */}
          {app.screenshots?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold">Screenshots</h2>
              </div>
              <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                {app.screenshots.map((url: string, i: number) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs">{app.name} Preview {i + 1}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <div className="card sticky top-6">
            <div className="card-body space-y-4">
              <div className="text-center pb-4 border-b border-gray-100">
                <p className="text-2xl font-bold text-brand-600">{app.pricing || "Free"}</p>
                <p className="text-xs text-gray-500 mt-1">Pricing may vary by usage</p>
              </div>

              <button onClick={install} disabled={installing || installed}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  installed
                    ? "bg-green-100 text-green-700 cursor-default"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                }`}>
                {installing ? "Subscribing..." : installed ? "✓ Subscribed" : "Subscribe"}
              </button>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium">{app.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Type</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeColors[app.type] || "bg-gray-100 text-gray-600"}`}>
                    {app.type || "SaaS"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Vendor</span>
                  <span className="font-medium">{app.vendor}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Installs</span>
                  <span className="font-medium">{app.installCount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-medium">{app.rating} / 5</span>
                </div>
              </div>

              <div className="pt-2 space-y-2 text-sm">
                {app.documentationUrl && (
                  <a href={app.documentationUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Documentation
                  </a>
                )}
                {app.supportUrl && (
                  <a href={app.supportUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Support
                  </a>
                )}
                {app.termsUrl && (
                  <a href={app.termsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Terms & License
                  </a>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <Link href="/dashboard/marketplace/sell"
                  className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand-600 py-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  List your own product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
