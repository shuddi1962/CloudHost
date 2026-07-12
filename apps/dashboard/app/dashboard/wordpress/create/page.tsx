"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const steps = [
  { number: 1, label: "Site Details" },
  { number: 2, label: "Domain" },
  { number: 3, label: "WordPress Config" },
  { number: 4, label: "Summary" },
];

const wpVersions = ["6.7", "6.6", "6.5", "6.4"];

const themes = [
  { id: "twentytwentyfour", name: "Twenty Twenty-Four", color: "bg-blue-500" },
  { id: "twentytwentythree", name: "Twenty Twenty-Three", color: "bg-green-500" },
  { id: "astra", name: "Astra", color: "bg-purple-500" },
  { id: "kadence", name: "Kadence", color: "bg-orange-500" },
];

const plugins = [
  { id: "yoast", name: "Yoast SEO" },
  { id: "jetpack", name: "Jetpack" },
  { id: "woocommerce", name: "WooCommerce" },
  { id: "elementor", name: "Elementor" },
  { id: "wordfence", name: "Wordfence" },
  { id: "w3-total-cache", name: "W3 Total Cache" },
  { id: "akismet", name: "Akismet" },
  { id: "contact-form-7", name: "Contact Form 7" },
];

export default function CreateWordPressPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    siteName: "",
    siteDescription: "",
    domain: "",
    adminEmail: "",
    adminUsername: "admin",
    adminPassword: "",
    wpVersion: "6.7",
    theme: "twentytwentyfour",
    plugins: [] as string[],
  });

  const update = (field: string, value: any) => setForm({ ...form, [field]: value });

  const togglePlugin = (id: string) => {
    setForm({
      ...form,
      plugins: form.plugins.includes(id)
        ? form.plugins.filter((p) => p !== id)
        : [...form.plugins, id],
    });
  };

  const canNext = () => {
    if (step === 1) return form.siteName.trim().length > 0;
    if (step === 2) return form.domain.trim().length > 0 && form.adminEmail.trim().length > 0 && form.adminUsername.trim().length > 0 && form.adminPassword.length >= 8;
    if (step === 3) return true;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wordpress/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.siteName,
          description: form.siteDescription,
          domain: `${form.domain}.cloudhost.app`,
          adminEmail: form.adminEmail,
          adminUsername: form.adminUsername,
          adminPassword: form.adminPassword,
          wordpressVersion: form.wpVersion,
          theme: form.theme,
          plugins: form.plugins,
          framework: "wordpress",
        }),
      });
      if (res.ok) {
        router.push("/dashboard/wordpress");
      } else {
        router.push("/dashboard/wordpress");
      }
    } catch {
      router.push("/dashboard/wordpress");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/wordpress" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Install WordPress</h1>
          <p className="text-sm text-gray-500">Set up a new WordPress site in minutes</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > s.number ? "bg-green-500 text-white" : step === s.number ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {step > s.number ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.number}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${step === s.number ? "text-gray-900" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${step > s.number ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Site Details */}
      {step === 1 && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Site Details</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Site Name</label>
            <input value={form.siteName} onChange={(e) => update("siteName", e.target.value)}
              className="input-field" placeholder="My WordPress Site" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Site Description</label>
            <textarea value={form.siteDescription} onChange={(e) => update("siteDescription", e.target.value)}
              className="input-field h-24" placeholder="A short description of your site..." />
          </div>
        </div>
      )}

      {/* Step 2: Domain */}
      {step === 2 && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Domain Configuration</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Domain</label>
            <div className="flex items-center gap-1">
              <input value={form.domain} onChange={(e) => update("domain", e.target.value.replace(/[^a-z0-9-]/g, ""))}
                className="input-field font-mono" placeholder="my-site" required />
              <span className="text-gray-400 text-sm font-mono">.cloudhost.app</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Your site will be available at <strong>{form.domain || "my-site"}.cloudhost.app</strong></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Admin Email</label>
              <input type="email" value={form.adminEmail} onChange={(e) => update("adminEmail", e.target.value)}
                className="input-field" placeholder="admin@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Admin Username</label>
              <input value={form.adminUsername} onChange={(e) => update("adminUsername", e.target.value)}
                className="input-field" placeholder="admin" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Admin Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.adminPassword}
                onChange={(e) => update("adminPassword", e.target.value)}
                className="input-field w-full pr-10" placeholder="At least 8 characters" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {form.adminPassword.length > 0 && form.adminPassword.length < 8 && (
              <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: WordPress Config */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold">WordPress Version</h2>
            <div className="flex flex-wrap gap-2">
              {wpVersions.map((ver) => (
                <button key={ver} onClick={() => update("wpVersion", ver)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                    form.wpVersion === ver ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500" : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}>
                  WordPress {ver}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Theme Selection</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themes.map((theme) => (
                <button key={theme.id} onClick={() => update("theme", theme.id)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    form.theme === theme.id ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}>
                  <div className={`w-12 h-12 ${theme.color} rounded-xl mx-auto mb-2 flex items-center justify-center`}>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Plugins</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plugins.map((plugin) => (
                <label key={plugin.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    form.plugins.includes(plugin.id) ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <input type="checkbox" checked={form.plugins.includes(plugin.id)}
                    onChange={() => togglePlugin(plugin.id)}
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500" />
                  <span className="text-sm font-medium">{plugin.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Summary */}
      {step === 4 && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Summary</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Site Name</span>
              <span className="font-medium">{form.siteName}</span>
            </div>
            {form.siteDescription && (
              <div className="flex justify-between">
                <span className="text-gray-500">Description</span>
                <span className="font-medium text-right max-w-xs">{form.siteDescription}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Domain</span>
              <span className="font-medium">{form.domain}.cloudhost.app</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Admin Email</span>
              <span className="font-medium">{form.adminEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Admin Username</span>
              <span className="font-medium">{form.adminUsername}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">WordPress Version</span>
              <span className="font-medium">{form.wpVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Theme</span>
              <span className="font-medium">{themes.find((t) => t.id === form.theme)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Plugins</span>
              <span className="font-medium">{form.plugins.length > 0 ? form.plugins.length + " selected" : "None"}</span>
            </div>
          </div>

          {form.plugins.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.plugins.map((p) => (
                <span key={p} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                  {plugins.find((pl) => pl.id === p)?.name}
                </span>
              ))}
            </div>
          )}

          <button onClick={handleSubmit} disabled={submitting}
            className="btn-primary w-full justify-center">
            {submitting ? "Installing WordPress..." : "Install WordPress"}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
          className="btn-secondary disabled:opacity-50">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Step {step} of 4</span>
          {step < 4 && (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()}
              className="btn-primary disabled:opacity-50">
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
