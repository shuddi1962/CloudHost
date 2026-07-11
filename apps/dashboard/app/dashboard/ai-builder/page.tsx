"use client";

import { useState } from "react";

export default function AiBuilderPage() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const generateSite = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setPreview(null);

    // Simulate AI generation
    await new Promise(r => setTimeout(r, 3000));

    setPreview(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${prompt.split(" ").slice(0, 3).join(" ")}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
  <header class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
    <div class="max-w-6xl mx-auto px-4 py-16">
      <h1 class="text-5xl font-bold mb-4">${prompt}</h1>
      <p class="text-xl opacity-90">AI-generated website from your description</p>
      <button class="mt-8 bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100">
        Get Started
      </button>
    </div>
  </header>
  <section class="max-w-6xl mx-auto px-4 py-16">
    <h2 class="text-3xl font-bold mb-8 text-center">Features</h2>
    <div class="grid grid-cols-3 gap-8">
      <div class="p-6 bg-gray-50 rounded-xl"><h3 class="font-bold text-xl mb-2">Fast</h3><p class="text-gray-600">Lightning-fast performance powered by edge computing</p></div>
      <div class="p-6 bg-gray-50 rounded-xl"><h3 class="font-bold text-xl mb-2">Secure</h3><p class="text-gray-600">Enterprise-grade security with automatic SSL and DDoS protection</p></div>
      <div class="p-6 bg-gray-50 rounded-xl"><h3 class="font-bold text-xl mb-2">Scalable</h3><p class="text-gray-600">Auto-scaling infrastructure that grows with your business</p></div>
    </div>
  </section>
  <footer class="bg-gray-900 text-white py-8 text-center">
    <p>Built with CloudHost AI Website Builder</p>
  </footer>
</body>
</html>`);

    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Website Builder</h1>
        <p className="text-gray-500">Describe what you want, and AI builds it for you — no coding needed</p>
      </div>

      <div className="card p-6">
        <div className="max-w-2xl">
          <label className="block text-sm font-medium mb-2">Describe your website</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="input-field h-24"
            placeholder="e.g. A modern landing page for my coffee shop with a menu section, contact form, and beautiful product photography..."
          />
          <div className="flex items-center gap-3 mt-4">
            <button onClick={generateSite} disabled={generating || !prompt.trim()}
              className="btn-primary">
              {generating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </span>
              ) : "Generate Website"}
            </button>
            <span className="text-xs text-gray-400">Powered by CloudHost AI</span>
          </div>
        </div>
      </div>

      {preview && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold">Preview</h2>
            <div className="flex gap-2">
              <button className="btn-primary text-sm">Deploy to Production</button>
              <button className="btn-secondary text-sm">Edit in Site Builder</button>
            </div>
          </div>
          <div className="card-body p-0">
            <iframe srcDoc={preview} className="w-full h-[600px] rounded-b-xl border-0" title="AI Site Preview" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { emoji: "🌐", title: "Landing Pages", desc: "Business, portfolio, event pages" },
          { emoji: "🛒", title: "Ecommerce", desc: "Online stores with checkout" },
          { emoji: "📝", title: "Blogs", desc: "Content sites with CMS" },
          { emoji: "🏢", title: "Business Sites", desc: "Company websites with contact" },
          { emoji: "🎨", title: "Portfolios", desc: "Creative portfolios & galleries" },
          { emoji: "📄", title: "SaaS Landing", desc: "Product & app landing pages" },
        ].map((t) => (
          <button key={t.title} onClick={() => setPrompt(`Create a ${t.title.toLowerCase()} website for my business`)}
            className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-200 text-left transition-all">
            <span className="text-2xl">{t.emoji}</span>
            <p className="font-medium mt-2">{t.title}</p>
            <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
