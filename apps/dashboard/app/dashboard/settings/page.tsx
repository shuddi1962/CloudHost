"use client";

import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage your account and platform preferences</p>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold">Authentication</h2>
          <Link href="/dashboard/settings/auth" className="text-sm text-brand-600 hover:text-brand-800 font-medium">Manage Providers</Link>
        </div>
        <div className="card-body">
          <p className="text-sm text-gray-500">Configure OAuth providers (Google, GitHub, Discord, etc.) and SSO for your organization</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Profile</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input className="input-field" placeholder="john@example.com" />
            </div>
          </div>
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">API Keys</h2>
        </div>
        <div className="card-body">
          <p className="text-sm text-gray-500 mb-4">Manage API keys for programmatic access to your resources</p>
          <button className="btn-secondary">Generate API Key</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Notifications</h2>
        </div>
        <div className="card-body space-y-3">
          {["Deployment completed", "Database backup ready", "SSL certificate expiring", "Workflow execution failed"].map((n) => (
            <label key={n} className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
              <span className="text-sm">{n}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
