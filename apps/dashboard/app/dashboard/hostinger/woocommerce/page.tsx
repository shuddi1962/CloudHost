"use client";

import { useState, useEffect } from "react";
import {
  Plus, ShoppingCart, Globe, RefreshCw, DollarSign,
  Package, FileText, Server
} from "lucide-react";

interface WooStore {
  id: string;
  domain: string;
  plan: string;
  storeName: string;
  theme: string;
  status: string;
  products: number;
  orders: number;
  revenue: number;
  woocommerceVersion: string;
  wpVersion: string;
}

export default function WooCommercePage() {
  const [stores, setStores] = useState<WooStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ domain: "", plan: "starter", storeName: "", theme: "storefront" });
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/woocommerce`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setStores(data.stores || []))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/woocommerce`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setStores([...stores, data.store]);
      setShowForm(false);
      setForm({ domain: "", plan: "starter", storeName: "", theme: "storefront" });
    }
  };

  const sync = async (id: string) => {
    setSyncing(id);
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hostinger-services/woocommerce/${id}/sync`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setStores(stores.map((s) => (s.id === id ? { ...s, ...data.store } : s)));
    }
    setSyncing(null);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WooCommerce Hosting</h1>
          <p className="text-gray-500">Managed WooCommerce stores with optimized performance</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Store
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}
                className="input-field" placeholder="mystore.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plan</label>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="input-field">
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="input-field" placeholder="My Store" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} className="input-field">
                <option value="storefront">Storefront</option>
                <option value="astra">Astra</option>
                <option value="flatsome">Flatsome</option>
                <option value="divi">Divi</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Store</button>
        </form>
      )}

      {stores.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No WooCommerce stores yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first online store</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-500" />
                  <h3 className="font-semibold">{store.domain}</h3>
                </div>
                <span className={`badge ${store.status === "active" ? "badge-success" : "badge-warning"}`}>
                  {store.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{store.storeName}</p>
              <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <Package className="w-4 h-4 mx-auto mb-1 text-brand-500" />
                  <span className="font-medium">{store.products}</span>
                  <p className="text-gray-400">Products</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <FileText className="w-4 h-4 mx-auto mb-1 text-green-500" />
                  <span className="font-medium">{store.orders}</span>
                  <p className="text-gray-400">Orders</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <DollarSign className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                  <span className="font-medium">${store.revenue}</span>
                  <p className="text-gray-400">Revenue</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Server className="w-3 h-3" />
                <span>WC {store.woocommerceVersion} / WP {store.wpVersion}</span>
                <span className="badge badge-info text-[10px]">{store.plan}</span>
              </div>
              <button onClick={() => sync(store.id)} disabled={syncing === store.id} className="btn-secondary w-full text-xs">
                <RefreshCw className={`w-3 h-3 ${syncing === store.id ? "animate-spin" : ""}`} />
                {syncing === store.id ? "Syncing..." : "Sync Data"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
