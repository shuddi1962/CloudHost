"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO_ACCOUNTS: Record<string, { password: string; user: { id: string; email: string; name: string; isAdmin: boolean }; org: { id: string; name: string; slug: string; role: string } }> = {
  "admin@cloudhost.com": {
    password: "admin123",
    user: { id: "demo-admin-001", email: "admin@cloudhost.com", name: "Admin User", isAdmin: true },
    org: { id: "org-demo-001", name: "CloudHost Inc.", slug: "cloudhost", role: "owner" },
  },
  "user@cloudhost.com": {
    password: "user123",
    user: { id: "demo-user-001", email: "user@cloudhost.com", name: "John Customer", isAdmin: false },
    org: { id: "org-demo-002", name: "Acme Corp", slug: "acme-corp", role: "member" },
  },
};

function base64url(str: string) {
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fakeJwt(userId: string, email: string) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ sub: userId, email, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }));
  return `${header}.${payload}.demo_signature`;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const demouser = DEMO_ACCOUNTS[email];
    if (isLogin && demouser && password === demouser.password) {
      localStorage.setItem("token", fakeJwt(demouser.user.id, demouser.user.email));
      localStorage.setItem("user", JSON.stringify(demouser.user));
      localStorage.setItem("organizations", JSON.stringify([demouser.org]));
      router.push("/");
      return;
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin
      ? { email, password }
      : { email, password, name, organizationName: orgName };

    try {
      const res = await fetch(`${API_BASE || "http://localhost:3001"}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
      return;
    } catch {
      if (isLogin && email && password) {
        const fallback = DEMO_ACCOUNTS[email.toLowerCase()];
        if (fallback && password === fallback.password) {
          localStorage.setItem("token", fakeJwt(fallback.user.id, fallback.user.email));
          localStorage.setItem("user", JSON.stringify(fallback.user));
          localStorage.setItem("organizations", JSON.stringify([fallback.org]));
          router.push("/");
          return;
        }
      }
      setError("Connection error. API server is not running. Use demo credentials below.");
      setLoading(false);
    }
  };

  const features = [
    { name: "Next.js Hosting", desc: "Deploy Next.js apps with git", icon: "N" },
    { name: "Preview Deployments", desc: "Branch previews before merge", icon: "PD" },
    { name: "Databases", desc: "PostgreSQL, MySQL, Redis", icon: "DB" },
    { name: "RLS Policies", desc: "Row-level security", icon: "RLS" },
    { name: "Database Extensions", desc: "pgvector, postgis & more", icon: "EX" },
    { name: "Realtime", desc: "Live DB subscriptions", icon: "RT" },
    { name: "Webhooks", desc: "DB change webhooks", icon: "WH" },
    { name: "Auth Providers", desc: "OAuth + SSO providers", icon: "OA" },
    { name: "WordPress", desc: "Managed WordPress hosting", icon: "WP" },
    { name: "VPS Servers", desc: "Full root access VPS", icon: "V" },
    { name: "Workflows", desc: "n8n-style automation", icon: "W" },
    { name: "Workflow Editor", desc: "Visual drag & drop", icon: "WE" },
    { name: "Edge Functions", desc: "Serverless at the edge", icon: "EF" },
    { name: "Site Builder", desc: "Drag & drop builder", icon: "SB" },
    { name: "AI Builder", desc: "AI generates your site", icon: "AI" },
    { name: "App Catalog", desc: "1-click app deploy", icon: "AC" },
    { name: "File Manager", desc: "Browser-based file mgmt", icon: "FM" },
    { name: "Domains & DNS", desc: "Domain registration + DNS", icon: "D" },
    { name: "Business Email", desc: "Professional email", icon: "E" },
    { name: "SSL Certificates", desc: "Free Let's Encrypt SSL", icon: "S" },
    { name: "CDN & Security", desc: "Global CDN + WAF + DDoS", icon: "C" },
    { name: "SQL Editor", desc: "Query DB in browser", icon: "SQ" },
    { name: "Team", desc: "Collaborate with team", icon: "T" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">CloudHost Platform</h1>
          <p className="text-lg text-gray-500 mt-2">The all-in-one cloud platform — deploy, host, automate, and scale</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-12">
          {features.map((f) => (
            <div key={f.name} className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-xs font-bold text-brand-700">{f.icon}</span>
              </div>
              <p className="text-xs font-semibold">{f.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Login/Register Card */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CloudHost</h1>
          <p className="text-gray-500 mt-1">All-in-One Cloud Platform</p>
        </div>

        <div className="card p-8">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isLogin ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isLogin ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="input-field" placeholder="Your name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                    className="input-field" placeholder="My Company" />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input-field" placeholder="••••••••" required />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center">
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { provider: "Google", icon: "G", color: "bg-red-500" },
                { provider: "GitHub", icon: "GH", color: "bg-gray-800" },
              ].map((p) => (
                <button key={p.provider} onClick={() => alert(`${p.provider} OAuth coming soon!`)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  <div className={`w-5 h-5 rounded ${p.color} flex items-center justify-center`}>
                    <span className="text-white text-[8px] font-bold">{p.icon}</span>
                  </div>
                  {p.provider}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center space-y-1">
            <p className="text-xs text-gray-400">
              CloudHost Platform v2.0 — All-in-One Cloud Platform
            </p>
            <div className="pt-2 border-t border-gray-100 mt-2">
              <p className="text-[11px] font-medium text-gray-500 mb-1">Demo Credentials</p>
              <p className="text-[10px] text-gray-400">Admin: admin@cloudhost.com / admin123</p>
              <p className="text-[10px] text-gray-400">User: user@cloudhost.com / user123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      </div>

      <div className="text-center pb-8 text-xs text-gray-400">
        <p>Powered by CloudHost — Next.js + PostgreSQL + Edge Computing</p>
      </div>
    </div>
    </div>
  );
}
