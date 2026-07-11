"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const catalogApps: Record<string, any> = {
  "wordpress": { id: "wordpress", name: "WordPress", description: "The world's most popular content management system (CMS), powering millions of websites and blogs. WordPress makes it easy to create beautiful websites, blogs, and apps with its intuitive interface and vast ecosystem of themes and plugins.", fullDescription: "WordPress is open-source software you can use to create beautiful websites, blogs, or apps. It has a vast library of themes and plugins that let you customize your site to your exact needs. From simple blogs to complex e-commerce stores, WordPress can handle it all with ease.", category: "CMS", version: "6.7", icon: "W", color: "bg-blue-600", phpVersion: "8.2", dbNeeded: "MySQL 8.0", ram: "512 MB", installCount: 15420, rating: 4.7, reviews: 892, vendor: "WordPress Foundation", screenshots: 3, features: ["Intuitive block editor (Gutenberg)", "Thousands of themes and plugins", "SEO-friendly with permalinks", "Built-in media management", "User roles and permissions", "Multilingual support", "REST API for headless CMS", "Automatic updates and backups"] },
  "joomla": { id: "joomla", name: "Joomla", description: "A powerful open-source CMS for building professional websites and applications.", fullDescription: "Joomla is an award-winning content management system that enables you to build powerful websites and applications. It offers advanced features like user management, media manager, and multilingual support out of the box.", category: "CMS", version: "5.1", icon: "J", color: "bg-red-600", phpVersion: "8.1", dbNeeded: "MySQL 8.0", ram: "512 MB", installCount: 5420, rating: 4.3, reviews: 234, vendor: "Open Source Matters", screenshots: 3, features: ["Advanced user management", "Built-in multilingual support", "Powerful media manager", "Banner management system", "Contact management"] },
  "drupal": { id: "drupal", name: "Drupal", description: "Enterprise-grade CMS known for its flexibility and scalability.", fullDescription: "Drupal is a robust content management platform that powers some of the largest websites in the world. It offers exceptional scalability, security, and flexibility for content-rich websites.", category: "CMS", version: "11.0", icon: "D", color: "bg-blue-800", phpVersion: "8.2", dbNeeded: "MySQL 8.0", ram: "1 GB", installCount: 3210, rating: 4.4, reviews: 187, vendor: "Drupal Association", screenshots: 3, features: ["Taxonomy system", "Advanced access control", "Views and panels", "Multilingual capabilities", "Extensive API"] },
  "ghost": { id: "ghost", name: "Ghost", description: "A modern publishing platform focused on content creation and subscriptions.", fullDescription: "Ghost is a powerful platform for building newsletters, blogs, and membership sites. It focuses on speed, SEO, and a clean editing experience with its signature card-based editor.", category: "CMS", version: "5.88", icon: "G", color: "bg-black", phpVersion: "", dbNeeded: "MySQL 8.0", ram: "1 GB", installCount: 4890, rating: 4.6, reviews: 312, vendor: "Ghost Foundation", screenshots: 3, features: ["Card-based editor", "Built-in membership system", "SEO optimized", "Newsletter sending", "Fast and lightweight"] },
  "woocommerce": { id: "woocommerce", name: "WooCommerce", description: "The most popular e-commerce platform for WordPress.", fullDescription: "WooCommerce is a customizable, open-source e-commerce platform built on WordPress. It gives you complete control over your online store with powerful features for selling physical and digital products.", category: "E-commerce", version: "9.3", icon: "W", color: "bg-purple-700", phpVersion: "8.2", dbNeeded: "MySQL 8.0", ram: "1 GB", installCount: 12300, rating: 4.5, reviews: 567, vendor: "Automattic", screenshots: 3, features: ["Product management", "Payment gateway integration", "Shipping management", "Tax configuration", "Inventory management"] },
  "magento": { id: "magento", name: "Magento", description: "Enterprise e-commerce platform with powerful features.", fullDescription: "Magento Open Source provides a flexible e-commerce platform with advanced features for merchants of all sizes. It offers a robust product catalog, order management, and marketing tools.", category: "E-commerce", version: "2.4.7", icon: "M", color: "bg-orange-500", phpVersion: "8.2", dbNeeded: "MySQL 8.0", ram: "2 GB", installCount: 2100, rating: 4.2, reviews: 145, vendor: "Adobe", screenshots: 3, features: ["Advanced catalog management", "Multi-store support", "Built-in marketing tools", "Mobile-optimized checkout", "Order management"] },
  "prestashop": { id: "prestashop", name: "PrestaShop", description: "Popular open-source e-commerce solution.", fullDescription: "PrestaShop is a free, open-source e-commerce platform that lets you create an online store from scratch. It offers hundreds of features out of the box.", category: "E-commerce", version: "8.1", icon: "P", color: "bg-teal-600", phpVersion: "8.1", dbNeeded: "MySQL 8.0", ram: "512 MB", installCount: 3400, rating: 4.1, reviews: 198, vendor: "PrestaShop SA", screenshots: 3, features: ["Product catalog", "Payment and shipping", "SEO tools", "Analytics and reports", "Multi-language support"] },
  "matomo": { id: "matomo", name: "Matomo", description: "Privacy-first web analytics platform.", fullDescription: "Matomo is the leading open-source analytics platform that gives you full ownership of your data. Track website traffic, user behavior, and conversions without compromising privacy.", category: "Analytics", version: "5.1", icon: "M", color: "bg-red-500", phpVersion: "8.1", dbNeeded: "MySQL 8.0", ram: "512 MB", installCount: 8700, rating: 4.6, reviews: 423, vendor: "Matomo", screenshots: 3, features: ["Real-time analytics", "Heatmaps and session recordings", "Goal tracking", "E-commerce tracking", "GDPR compliant"] },
  "plausible": { id: "plausible", name: "Plausible", description: "Simple, privacy-friendly web analytics.", fullDescription: "Plausible is a lightweight, open-source web analytics tool. No cookies, no tracking, and fully compliant with GDPR, CCPA, and PECR.", category: "Analytics", version: "2.1", icon: "P", color: "bg-blue-500", phpVersion: "", dbNeeded: "PostgreSQL", ram: "256 MB", installCount: 5600, rating: 4.8, reviews: 312, vendor: "Plausible Insights", screenshots: 3, features: ["Cookie-free tracking", "Real-time dashboard", "Pageview goals", "Campaign tracking", "Exportable reports"] },
  "umami": { id: "umami", name: "Umami", description: "Simple, fast, privacy-friendly analytics.", fullDescription: "Umami is a simple, fast, privacy-focused alternative to Google Analytics. It provides the insights you need without the complexity.", category: "Analytics", version: "2.12", icon: "U", color: "bg-green-500", phpVersion: "", dbNeeded: "PostgreSQL", ram: "256 MB", installCount: 4300, rating: 4.5, reviews: 234, vendor: "Umami Software", screenshots: 3, features: ["Lightweight tracking", "Multi-site support", "Real-time stats", "Custom events", "No cookie consent needed"] },
  "wordfence": { id: "wordfence", name: "Wordfence", description: "Comprehensive WordPress security firewall.", fullDescription: "Wordfence Security is a free enterprise-grade WordPress security plugin. It includes a firewall, malware scanner, and login security.", category: "Security", version: "7.11", icon: "W", color: "bg-red-700", phpVersion: "8.2", dbNeeded: "", ram: "256 MB", installCount: 9800, rating: 4.4, reviews: 567, vendor: "Defiant", screenshots: 3, features: ["Web application firewall", "Malware scanner", "Login security", "Live traffic monitoring", "Blocked attacks"] },
  "fail2ban": { id: "fail2ban", name: "Fail2Ban", description: "Intrusion prevention software.", fullDescription: "Fail2Ban scans log files and bans IPs that show malicious signs like too many password failures. It helps protect your server from brute-force attacks.", category: "Security", version: "1.0", icon: "F", color: "bg-yellow-600", phpVersion: "", dbNeeded: "", ram: "128 MB", installCount: 12000, rating: 4.7, reviews: 345, vendor: "Fail2Ban Contributors", screenshots: 2, features: ["Brute-force protection", "Log file monitoring", "Automatic IP banning", "Customizable rules", "Email notifications"] },
  "letsencrypt": { id: "letsencrypt", name: "Let's Encrypt", description: "Free, automated SSL/TLS certificates.", fullDescription: "Let's Encrypt is a free, automated, and open Certificate Authority that provides SSL/TLS certificates to enable HTTPS on your websites.", category: "Security", version: "2.12", icon: "L", color: "bg-blue-500", phpVersion: "", dbNeeded: "", ram: "128 MB", installCount: 25000, rating: 4.9, reviews: 890, vendor: "Internet Security Research Group", screenshots: 2, features: ["Free SSL certificates", "Automatic renewal", "Wildcard certificates", "ACMEv2 protocol", "Widely trusted"] },
  "gitlab-ce": { id: "gitlab-ce", name: "GitLab CE", description: "Complete DevOps platform with Git repos and CI/CD.", fullDescription: "GitLab Community Edition is a complete DevOps platform delivered as a single application. It includes Git repository management, CI/CD pipelines, and project management.", category: "Development", version: "17.3", icon: "G", color: "bg-orange-600", phpVersion: "", dbNeeded: "PostgreSQL", ram: "4 GB", installCount: 6500, rating: 4.3, reviews: 445, vendor: "GitLab Inc", screenshots: 3, features: ["Git repository management", "CI/CD pipelines", "Issue tracking", "Code review", "Container registry"] },
  "phpmyadmin": { id: "phpmyadmin", name: "phpMyAdmin", description: "Popular web-based MySQL/MariaDB admin tool.", fullDescription: "phpMyAdmin is a free software tool written in PHP, intended to handle the administration of MySQL and MariaDB databases over the web.", category: "Development", version: "5.2", icon: "P", color: "bg-blue-700", phpVersion: "8.2", dbNeeded: "", ram: "256 MB", installCount: 18000, rating: 4.2, reviews: 678, vendor: "phpMyAdmin Team", screenshots: 3, features: ["Database management", "SQL query execution", "Import/export data", "User management", "Table operations"] },
  "adminer": { id: "adminer", name: "Adminer", description: "Lightweight database management in a single PHP file.", fullDescription: "Adminer is a full-featured database management tool in a single PHP file. It supports MySQL, PostgreSQL, SQLite, and more.", category: "Development", version: "4.8", icon: "A", color: "bg-green-600", phpVersion: "8.2", dbNeeded: "", ram: "128 MB", installCount: 3200, rating: 4.5, reviews: 156, vendor: "Jakub Vrana", screenshots: 3, features: ["Single PHP file", "Multi-database support", "Visual table editor", "SQL export/import", "Lightweight footprint"] },
  "portainer": { id: "portainer", name: "Portainer", description: "Simplified Docker container management UI.", fullDescription: "Portainer provides a lightweight, web-based interface for managing Docker environments. It simplifies container management, making it accessible to everyone.", category: "Development", version: "2.21", icon: "P", color: "bg-blue-400", phpVersion: "", dbNeeded: "", ram: "256 MB", installCount: 7800, rating: 4.6, reviews: 432, vendor: "Portainer.io", screenshots: 3, features: ["Container management", "Image management", "Network management", "Volume management", "Stack deployment"] },
  "openclaw": { id: "openclaw", name: "OpenClaw", description: "Open-source autonomous AI agent.", fullDescription: "OpenClaw is an open-source autonomous AI agent that runs on your own infrastructure. It connects to messaging platforms like Slack, Telegram, and Discord.", category: "AI/ML", version: "2026.6", icon: "O", color: "bg-indigo-600", phpVersion: "", dbNeeded: "PostgreSQL", ram: "2 GB", installCount: 1500, rating: 4.8, reviews: 89, vendor: "OpenClaw", screenshots: 3, features: ["Autonomous task execution", "Multi-channel integration", "Code execution", "File management", "Web browsing"] },
  "stable-diffusion": { id: "stable-diffusion", name: "Stable Diffusion WebUI", description: "Generate images from text using AI.", fullDescription: "Stable Diffusion WebUI provides a browser interface for generating images from text descriptions using Stable Diffusion AI models.", category: "AI/ML", version: "1.10", icon: "S", color: "bg-purple-600", phpVersion: "", dbNeeded: "", ram: "8 GB", installCount: 8900, rating: 4.5, reviews: 567, vendor: "Automatic1111", screenshots: 3, features: ["Text-to-image generation", "Image-to-image editing", "Inpainting", "Batch processing", "Model management"] },
  "llm-dashboard": { id: "llm-dashboard", name: "LLM Dashboard", description: "Unified dashboard for multiple LLM providers.", fullDescription: "LLM Dashboard provides a unified interface for interacting with various LLM providers including OpenAI, Anthropic, and open-source models.", category: "AI/ML", version: "1.3", icon: "L", color: "bg-cyan-600", phpVersion: "", dbNeeded: "", ram: "1 GB", installCount: 890, rating: 4.3, reviews: 45, vendor: "LLM Dashboard Team", screenshots: 3, features: ["Multi-provider support", "Conversation history", "Prompt templates", "API key management", "Usage analytics"] },
  "mautic": { id: "mautic", name: "Mautic", description: "Open-source marketing automation.", fullDescription: "Mautic provides a comprehensive marketing automation platform including email campaigns, lead management, and analytics.", category: "Marketing", version: "5.1", icon: "M", color: "bg-amber-500", phpVersion: "8.1", dbNeeded: "MySQL 8.0", ram: "1 GB", installCount: 2100, rating: 4.1, reviews: 156, vendor: "Mautic Community", screenshots: 3, features: ["Email campaigns", "Lead management", "Segmentation", "A/B testing", "Analytics dashboard"] },
  "sendy": { id: "sendy", name: "Sendy", description: "Send newsletters via Amazon SES.", fullDescription: "Sendy sends newsletters to your subscribers via Amazon SES at a fraction of the cost of other email marketing services.", category: "Marketing", version: "6.2", icon: "S", color: "bg-red-600", phpVersion: "8.2", dbNeeded: "MySQL 8.0", ram: "512 MB", installCount: 3400, rating: 4.4, reviews: 234, vendor: "Sendy", screenshots: 3, features: ["Amazon SES integration", "Campaign management", "Subscriber management", "Bounce handling", "Analytics reports"] },
  "listmonk": { id: "listmonk", name: "ListMonk", description: "High-performance newsletter manager.", fullDescription: "ListMonk is a self-hosted newsletter and mailing list manager that is fast, feature-rich, and easy to use.", category: "Marketing", version: "3.0", icon: "L", color: "bg-green-600", phpVersion: "", dbNeeded: "PostgreSQL", ram: "256 MB", installCount: 1800, rating: 4.7, reviews: 123, vendor: "ListMonk", screenshots: 3, features: ["High-performance sending", "Subscriber management", "Templates", "Campaign scheduling", "Analytics"] },
};

const installedApps = ["wordpress", "matomo", "phpmyadmin", "portainer"];

const reviewsData = [
  { id: 1, author: "John D.", rating: 5, title: "Excellent platform", text: "This app has been a game-changer for our workflow. Highly recommended!", date: "2026-06-15" },
  { id: 2, author: "Sarah M.", rating: 4, title: "Great features", text: "Really solid app with lots of useful features. Could use better documentation.", date: "2026-06-10" },
  { id: 3, author: "Alex R.", rating: 5, title: "Exactly what I needed", text: "Easy to install and configure. The one-click deploy is amazing.", date: "2026-05-28" },
  { id: 4, author: "Emily K.", rating: 4, title: "Good but needs improvements", text: "Works well for basic use cases. Would love to see more advanced features.", date: "2026-05-20" },
];

export default function AppDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || "";
  const [app, setApp] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const found = catalogApps[id];
    if (found) {
      setApp(found);
      setIsInstalled(installedApps.includes(found.id));
    }
  }, [id]);

  if (!app) return (
    <div className="text-center py-20">
      <svg className="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-gray-500 font-medium">App not found</p>
      <Link href="/dashboard/app-catalog" className="btn-secondary mt-4 inline-flex text-sm">Back to App Catalog</Link>
    </div>
  );

  const similarApps = Object.values(catalogApps).filter((a: any) => a.category === app.category && a.id !== app.id).slice(0, 4);

  const content = (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/dashboard/app-catalog" className="hover:text-brand-600">App Catalog</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{app.category}</span>
        <span>/</span>
        <span className="text-gray-900">{app.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl ${app.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-2xl">{app.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold">{app.name}</h1>
                  <p className="text-gray-500">by {app.vendor}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      app.category === "CMS" ? "bg-blue-100 text-blue-700" :
                      app.category === "E-commerce" ? "bg-purple-100 text-purple-700" :
                      app.category === "Analytics" ? "bg-green-100 text-green-700" :
                      app.category === "Security" ? "bg-red-100 text-red-700" :
                      app.category === "Development" ? "bg-cyan-100 text-cyan-700" :
                      app.category === "AI/ML" ? "bg-indigo-100 text-indigo-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {app.category}
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
              <p className="text-gray-700 leading-relaxed">{app.fullDescription || app.description}</p>
            </div>
          </div>

          {/* Screenshots */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold">Screenshots</h2>
            </div>
            <div className="card-body grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Array.from({ length: app.screenshots || 3 }, (_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs">{app.name} Screenshot {i + 1}</p>
                    </div>
                  </div>
                </div>
              ))}
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
              <h2 className="font-semibold">Reviews & Ratings</h2>
            </div>
            <div className="card-body space-y-4">
              {reviewsData.map((r) => (
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
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <div className="card sticky top-6">
            <div className="card-body space-y-4">
              <div className="text-center pb-4 border-b border-gray-100">
                <p className="text-2xl font-bold text-brand-600">Free</p>
                <p className="text-xs text-gray-500 mt-1">Open source - no licensing fees</p>
              </div>

              {isInstalled ? (
                <Link href={`/dashboard/app-catalog/${app.id}`}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-green-100 text-green-700 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Installed
                </Link>
              ) : (
                <button onClick={() => { setInstalling(true); setTimeout(() => { setInstalling(false); router.push("/dashboard/app-catalog"); }, 1500); }}
                  disabled={installing}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-all">
                  {installing ? "Installing..." : "Install Now"}
                </button>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Version</span>
                  <span className="font-medium">v{app.version}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium">{app.category}</span>
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
                {app.phpVersion && (
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">PHP</span>
                    <span className="font-medium">{app.phpVersion}</span>
                  </div>
                )}
                {app.dbNeeded && (
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Database</span>
                    <span className="font-medium">{app.dbNeeded}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">RAM</span>
                  <span className="font-medium">{app.ram}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Apps */}
      {similarApps.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Similar {app.category} Apps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {similarApps.map((sa: any) => (
              <div key={sa.id} onClick={() => router.push(`/dashboard/app-catalog/${sa.id}`)}
                className="card p-4 hover:shadow-md transition-all cursor-pointer border hover:border-brand-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${sa.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-sm">{sa.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{sa.name}</p>
                    <p className="text-[11px] text-gray-500">{sa.shortDesc || sa.description?.slice(0, 40) + "..."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-amber-400 flex items-center gap-0.5">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {sa.rating}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{sa.installCount?.toLocaleString()} installs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (typeof window === "undefined") return null;
  return content;
}
