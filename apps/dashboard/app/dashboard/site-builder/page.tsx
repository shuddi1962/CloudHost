"use client";

import { useState } from "react";

const templates = [
  { name: "Business Pro", desc: "Professional business site", preview: "🏢", color: "bg-blue-500" },
  { name: "Portfolio", desc: "Showcase your work", preview: "🎨", color: "bg-purple-500" },
  { name: "Restaurant", desc: "Menu & reservations", preview: "🍽️", color: "bg-red-500" },
  { name: "Blog", desc: "Personal blog", preview: "📝", color: "bg-green-500" },
  { name: "Store", desc: "Ecommerce store", preview: "🛒", color: "bg-orange-500" },
  { name: "SaaS", desc: "Software landing page", preview: "☁️", color: "bg-cyan-500" },
  { name: "Agency", desc: "Digital agency", preview: "🚀", color: "bg-indigo-500" },
  { name: "Event", desc: "Event landing page", preview: "🎪", color: "bg-pink-500" },
];

const blocks = [
  { name: "Header", icon: "H" },
  { name: "Hero", icon: "◆" },
  { name: "Features", icon: "⊞" },
  { name: "Pricing", icon: "$" },
  { name: "Testimonials", icon: "❝" },
  { name: "Contact", icon: "✉" },
  { name: "Footer", icon: "—" },
  { name: "Gallery", icon: "▦" },
];

export default function SiteBuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Builder</h1>
        <p className="text-gray-500">Drag-and-drop website builder — no coding required</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-sm">Blocks</h2>
            </div>
            <div className="card-body p-2 space-y-1">
              {blocks.map((b) => (
                <div key={b.name}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-grab hover:bg-gray-100 transition-colors text-sm">
                  <span className="w-6 h-6 bg-brand-100 text-brand-700 rounded flex items-center justify-center text-xs font-bold">{b.icon}</span>
                  {b.name}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-sm">Settings</h2>
            </div>
            <div className="card-body space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Site Title</label>
                <input className="input-field text-sm" placeholder="My Site" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Primary Color</label>
                <input type="color" className="w-full h-8 rounded cursor-pointer" defaultValue="#6366f1" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Font</label>
                <select className="input-field text-sm">
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Poppins</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {!selectedTemplate ? (
            <div>
              <p className="text-sm font-medium mb-3">Choose a template to start</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {templates.map((t) => (
                  <button key={t.name} onClick={() => setSelectedTemplate(t.name)}
                    className="card p-4 hover:shadow-md transition-all text-center group">
                    <div className={`w-16 h-16 ${t.color} rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl`}>
                      {t.preview}
                    </div>
                    <p className="font-semibold text-sm group-hover:text-brand-600 transition-colors">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="font-semibold">Editing: {selectedTemplate}</h2>
                <div className="flex gap-2">
                  <button className="btn-primary text-sm">Publish</button>
                  <button className="btn-secondary text-sm">Preview</button>
                  <button onClick={() => setSelectedTemplate(null)} className="btn-secondary text-sm">Change Template</button>
                </div>
              </div>
              <div className="card-body h-[500px] bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <p>Drag blocks from the left panel to build your site</p>
                  <p className="text-xs mt-1">Click on any element to edit its content</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
