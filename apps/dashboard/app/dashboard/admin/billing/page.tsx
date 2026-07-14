"use client";

import { useEffect, useState, useCallback } from "react";

interface Specs {
  cpu?: string;
  ram?: string;
  storage?: string;
  transfer?: string;
  [key: string]: unknown;
}

interface Plan {
  id: string;
  category: string;
  planName: string;
  provider: string;
  providerRef: string;
  providerCostUsd: string;
  yourPriceUsd: string;
  yourPriceNgn: string | null;
  specs: Specs;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function formatUsd(v: string | number): string {
  return Number(v).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function calcMargin(priceUsd: string, costUsd: string): string {
  const p = Number(priceUsd);
  const c = Number(costUsd);
  if (!c || !p) return "—";
  return ((p - c) / c * 100).toFixed(1) + "%";
}

function marginColor(priceUsd: string, costUsd: string): string {
  const p = Number(priceUsd);
  const c = Number(costUsd);
  if (!c || !p) return "text-gray-400";
  const ratio = p / c;
  if (ratio < 1.15) return "text-red-600 font-bold";
  if (ratio < 1.3) return "text-amber-600";
  if (ratio < 2) return "text-green-600";
  return "text-green-700";
}

function usePlans() {
  const [plans, setPlans] = useState<Record<string, Plan[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/plans");
      if (!res.ok) throw new Error("Failed to load plans");
      const data = await res.json();
      setPlans(data.plans || {});
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  return { plans, loading, error, refetch: fetchPlans };
}

function SpecsDisplay({ specs }: { specs: Specs }) {
  if (!specs || Object.keys(specs).length === 0) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <div className="text-xs text-gray-600 space-y-0.5">
      {specs.cpu && <span>{specs.cpu} · </span>}
      {specs.ram && <span>{specs.ram} · </span>}
      {specs.storage && <span>{specs.storage} · </span>}
      {specs.transfer && <span>{specs.transfer}</span>}
    </div>
  );
}

function EditPlanModal({
  plan,
  onClose,
  onSaved,
}: {
  plan: Plan;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [yourPriceUsd, setYourPriceUsd] = useState(plan.yourPriceUsd);
  const [yourPriceNgn, setYourPriceNgn] = useState(plan.yourPriceNgn || "");
  const [isActive, setIsActive] = useState(plan.isActive);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [warnMargin, setWarnMargin] = useState(false);

  const costVal = Number(plan.providerCostUsd);
  const priceVal = Number(yourPriceUsd);
  const marginOk = costVal > 0 && priceVal > 0 && priceVal >= costVal * 1.15;

  useEffect(() => {
    setWarnMargin(costVal > 0 && priceVal > 0 && priceVal < costVal * 1.15);
  }, [yourPriceUsd, costVal, priceVal]);

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yourPriceUsd: yourPriceUsd,
          yourPriceNgn: yourPriceNgn || null,
          isActive,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update plan");
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Edit Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
          <p><span className="text-gray-500">Plan:</span> <span className="font-medium">{plan.planName}</span></p>
          <p><span className="text-gray-500">Category:</span> {plan.category}</p>
          <p><span className="text-gray-500">Provider ref:</span> <code className="text-xs bg-gray-200 px-1 rounded">{plan.providerRef}</code></p>
          <p><span className="text-gray-500">Provider cost:</span> {formatUsd(plan.providerCostUsd)} <span className="text-xs text-gray-400">(your cost, not shown to customers)</span></p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Price (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input
                type="number" step="0.01" min="0"
                value={yourPriceUsd}
                onChange={(e) => setYourPriceUsd(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {warnMargin && (
              <p className="text-xs text-amber-600 mt-1">
                Warning: This price is less than a 15% margin above your provider cost ({formatUsd(plan.providerCostUsd)}). Your margin would be {calcMargin(yourPriceUsd, plan.providerCostUsd)}.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Your Price (NGN) <span className="text-gray-400 font-normal">— optional, set manually</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">₦</span>
              <input
                type="number" step="0.01" min="0"
                value={yourPriceNgn}
                onChange={(e) => setYourPriceNgn(e.target.value)}
                placeholder="Leave blank to hide NGN price"
                className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Plan is active <span className="text-gray-400 font-normal">(visible for new purchases)</span>
            </label>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <span className="text-gray-500">Current margin: </span>
            <span className={marginColor(yourPriceUsd, plan.providerCostUsd)}>
              {calcMargin(yourPriceUsd, plan.providerCostUsd)}
            </span>
          </div>
        </div>

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBillingPage() {
  const { plans, loading, error, refetch } = usePlans();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [collapseAll, setCollapseAll] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const categories = Object.keys(plans).sort();

  function categoryLabel(cat: string): string {
    return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Billing Plans</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Billing Plans</h1>
        <div className="card p-6 text-center">
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button onClick={refetch} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing &amp; Plans</h1>
          <p className="text-sm text-gray-500">
            Every price shown on the platform comes from this table. Edit here &mdash; it updates everywhere.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCollapseAll(!collapseAll)} className="btn-secondary text-sm">
            {collapseAll ? "Expand All" : "Collapse All"}
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary">+ New Plan</button>
        </div>
      </div>

      {/* Hard Rule reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Hard rule:</strong> No page displays a price pulled directly from a provider API. Every customer-facing price comes from this <code className="bg-amber-100 px-1 rounded">plans</code> table. Provider cost is for your reference/margin tracking only.
      </div>

      {categories.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-400">No plans yet. Create your first plan to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const isCollapsed = collapsed[cat];
            const catPlans = plans[cat];
            const totalMargin = catPlans.reduce((acc, p) => {
              const cost = Number(p.providerCostUsd);
              const price = Number(p.yourPriceUsd);
              return acc + (price - cost);
            }, 0);

            return (
              <div key={cat} className="card overflow-hidden">
                <button
                  onClick={() => setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <h2 className="text-lg font-semibold">{categoryLabel(cat)}</h2>
                    <span className="badge badge-info text-xs">{catPlans.length} plans</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Total margin: <span className="font-medium text-green-700">{formatUsd(totalMargin)}</span>/mo
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="overflow-x-auto border-t border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                          <th className="px-5 py-3 font-medium">Plan</th>
                          <th className="px-5 py-3 font-medium">Specs</th>
                          <th className="px-5 py-3 font-medium">Provider Cost</th>
                          <th className="px-5 py-3 font-medium">Your Price (USD)</th>
                          <th className="px-5 py-3 font-medium">Your Price (NGN)</th>
                          <th className="px-5 py-3 font-medium">Margin</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                          <th className="px-5 py-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {catPlans.map((plan) => (
                          <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="font-medium">{plan.planName}</div>
                              <div className="text-xs text-gray-400">{plan.provider} &middot; <code className="bg-gray-100 px-1 rounded">{plan.providerRef}</code></div>
                            </td>
                            <td className="px-5 py-3">
                              <SpecsDisplay specs={plan.specs} />
                            </td>
                            <td className="px-5 py-3 text-gray-500">
                              {formatUsd(plan.providerCostUsd)}
                            </td>
                            <td className="px-5 py-3 font-medium">
                              {formatUsd(plan.yourPriceUsd)}
                            </td>
                            <td className="px-5 py-3">
                              {plan.yourPriceNgn ? `₦${Number(plan.yourPriceNgn).toLocaleString()}` : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-5 py-3">
                              <span className={marginColor(plan.yourPriceUsd, plan.providerCostUsd)}>
                                {calcMargin(plan.yourPriceUsd, plan.providerCostUsd)}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              {plan.isActive
                                ? <span className="badge badge-success text-xs">Active</span>
                                : <span className="badge badge-warning text-xs">Inactive</span>
                              }
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button
                                onClick={() => setEditingPlan(plan)}
                                className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Subscription overview */}
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

      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
