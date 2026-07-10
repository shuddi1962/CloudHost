"use client";

import { useState } from "react";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular: boolean;
  color: string;
}

const defaultPlans: Plan[] = [
  { id: "1", name: "Free", price: 0, interval: "month", features: ["1 Project", "1 Database (1GB)", "1 Deployment", "Basic Support", "500MB Storage"], popular: false, color: "bg-gray-500" },
  { id: "2", name: "Starter", price: 12, interval: "month", features: ["5 Projects", "3 Databases (5GB each)", "10 Deployments", "Email Support", "10GB Storage", "Custom Domain"], popular: true, color: "bg-brand-500" },
  { id: "3", name: "Professional", price: 49, interval: "month", features: ["25 Projects", "10 Databases (20GB each)", "Unlimited Deployments", "Priority Support", "100GB Storage", "Custom Domains", "Team Members (10)", "Edge Functions", "VPS Access"], popular: false, color: "bg-purple-500" },
  { id: "4", name: "Enterprise", price: 199, interval: "month", features: ["Unlimited Projects", "Unlimited Databases", "Unlimited Deployments", "Dedicated Support", "1TB+ Storage", "Unlimited Domains", "Unlimited Team Members", "Edge Functions + CDN", "VPS + Dedicated Servers", "SLA Guarantee", "Custom Contracts"], popular: false, color: "bg-amber-500" },
];

export default function AdminBillingPage() {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing Plans</h1>
          <p className="text-gray-500">Manage subscription plans and pricing</p>
        </div>
        <button className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className={`card p-6 ${plan.popular ? "ring-2 ring-brand-500" : ""} relative`}>
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <div className={`w-10 h-10 rounded-xl ${plan.color} flex items-center justify-center mb-4`}>
              <span className="text-white font-bold">{plan.name[0]}</span>
            </div>
            <h3 className="text-lg font-bold">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-gray-500 text-sm">/{plan.interval}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button onClick={() => setEditingPlan(plan)} className="btn-secondary flex-1 text-xs">Edit</button>
              <button className="btn-secondary flex-1 text-xs text-red-600 hover:text-red-700">Disable</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Subscription Overview</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-brand-600">0</p>
              <p className="text-sm text-gray-500 mt-1">Active Subscriptions</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-green-600">$0</p>
              <p className="text-sm text-gray-500 mt-1">Monthly Recurring Revenue</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-purple-600">$0</p>
              <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
