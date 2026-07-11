"use client";

import { useState } from "react";
import Link from "next/link";

export default function SellPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", company: "", productName: "", productType: "SaaS", category: "", description: "", terms: false });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-3">Application Submitted!</h1>
        <p className="text-gray-500 mb-6">Thank you for your interest in selling on CloudHost Marketplace. Our team will review your application and get back to you within 2-3 business days.</p>
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left max-w-sm mx-auto">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">1. <span>Our team reviews your application</span></li>
            <li className="flex items-start gap-2">2. <span>We verify your product and set up integration</span></li>
            <li className="flex items-start gap-2">3. <span>Your product goes live on the marketplace</span></li>
            <li className="flex items-start gap-2">4. <span>Start reaching CloudHost customers!</span></li>
          </ol>
        </div>
        <Link href="/dashboard/marketplace" className="btn-primary inline-flex">Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Sell in the CloudHost Marketplace</h1>
        <p className="text-brand-100 max-w-2xl">Reach millions of CloudHost customers and grow your business. List your software, SaaS, containers, and services on the fastest-growing cloud marketplace.</p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "🚀", title: "Global Reach", desc: "Access millions of CloudHost customers worldwide" },
          { icon: "💰", title: "Simple Pricing", desc: "Keep up to 90% revenue share with flexible pricing" },
          { icon: "⚡", title: "Easy Onboarding", desc: "List your product in days, not months with our streamlined process" },
        ].map((b, i) => (
          <div key={i} className="card p-6 text-center">
            <span className="text-3xl mb-3 block">{b.icon}</span>
            <h3 className="font-semibold mb-1">{b.title}</h3>
            <p className="text-sm text-gray-500">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Customers", value: "2M+" },
          { label: "Products Listed", value: "50+" },
          { label: "Monthly Active Users", value: "500K+" },
          { label: "Avg. Revenue Share", value: "85%" },
        ].map((s, i) => (
          <div key={i} className="card p-4 text-center">
            <p className="text-2xl font-bold text-brand-600">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Registration Form */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Register as a Seller</h2>
          <p className="text-sm text-gray-500">Fill out the form below and our team will reach out to you.</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field" placeholder="john@company.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input type="text" required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                className="input-field" placeholder="My Company Inc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input type="text" required value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })}
                className="input-field" placeholder="My Amazing Product" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type *</label>
                <select value={form.productType} onChange={e => setForm({ ...form, productType: e.target.value })}
                  className="input-field">
                  {["SaaS", "Container", "Machine Learning", "Professional Services", "Data", "AMI"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="input-field">
                  <option value="">Select category</option>
                  {["AI Agents & Tools", "Business Applications", "Cloud Operations", "Data Products", "DevOps", "Infrastructure Software", "IoT", "Machine Learning", "Security", "Storage"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="input-field h-24" placeholder="Describe what your product does..." />
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" checked={form.terms} onChange={e => setForm({ ...form, terms: e.target.checked })}
                className="mt-1" required />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the <a href="#" className="text-brand-600 hover:underline">Marketplace Seller Agreement</a> and <a href="#" className="text-brand-600 hover:underline">Partner Terms</a>
              </label>
            </div>
            <button type="submit" className="btn-primary">Submit Application</button>
          </form>
        </div>
      </div>

      {/* How it works */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">How Selling Works</h2>
        </div>
        <div className="card-body grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            { step: "1", title: "Register", desc: "Create your seller account and submit your product" },
            { step: "2", title: "Verify", desc: "Our team reviews and verifies your product" },
            { step: "3", title: "Publish", desc: "Your product goes live on the marketplace" },
            { step: "4", title: "Grow", desc: "Reach customers and grow your business" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-700 font-bold">{s.step}</span>
              </div>
              <h3 className="font-semibold text-sm">{s.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Frequently Asked Questions</h2>
        </div>
        <div className="card-body divide-y divide-gray-100">
          {[
            { q: "How long does the listing process take?", a: "Most products are listed within 2-3 business days after submission." },
            { q: "What types of products can I sell?", a: "SaaS, Containers, Machine Learning models, Professional Services, Data products, and AMI images." },
            { q: "What is the revenue share?", a: "You keep up to 90% of the revenue. The exact percentage depends on your product type and volume." },
            { q: "How do I get paid?", a: "Payouts are processed monthly via bank transfer or PayPal, with a minimum threshold of $100." },
          ].map((faq, i) => (
            <details key={i} className="py-3 group">
              <summary className="font-medium text-sm cursor-pointer flex items-center justify-between text-gray-900 hover:text-brand-600">
                {faq.q}
                <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-sm text-gray-500 mt-2">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
