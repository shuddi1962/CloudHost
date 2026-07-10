"use client";

import { useState, useEffect } from "react";
import {
  Plus, Store, Printer, ShoppingBag,
  DollarSign, Package, Shirt
} from "lucide-react";

interface PrintStore {
  id: string;
  storeName: string;
  provider: string;
  connectedPlatform: string;
  status: string;
  products: number;
  orders: number;
  totalSales: number;
  templates: PrintTemplate[];
}

interface PrintTemplate {
  id: string;
  name: string;
  image: string;
  variants: { name: string; price: number }[];
}

const PROVIDERS = [
  { value: "printful", label: "Printful" },
  { value: "printify", label: "Printify" },
  { value: "teespring", label: "Teespring" },
];

export default function PrintOnDemandPage() {
  const [stores, setStores] = useState<PrintStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ storeName: "", provider: "printful", connectedPlatform: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/hostinger-services/print-on-demand", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setStores(data.stores || []))
      .finally(() => setLoading(false));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/hostinger-services/print-on-demand", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setStores([...stores, data.store]);
      setShowForm(false);
      setForm({ storeName: "", provider: "printful", connectedPlatform: "" });
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Print on Demand</h1>
          <p className="text-gray-500">Create and manage print-on-demand stores</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Store
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="input-field" placeholder="My POD Store" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Provider</label>
              <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="input-field">
                {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Connected Platform</label>
              <select value={form.connectedPlatform} onChange={(e) => setForm({ ...form, connectedPlatform: e.target.value })} className="input-field">
                <option value="">None</option>
                <option value="shopify">Shopify</option>
                <option value="etsy">Etsy</option>
                <option value="woocommerce">WooCommerce</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Store</button>
        </form>
      )}

      {stores.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Printer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No print-on-demand stores yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first POD store</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-brand-500" />
                  <h3 className="font-semibold">{store.storeName}</h3>
                </div>
                <span className={`badge ${store.status === "active" ? "badge-success" : "badge-warning"}`}>
                  {store.status}
                </span>
              </div>
              <div className="flex gap-2 text-xs mb-3">
                <span className="badge badge-info">{store.provider}</span>
                {store.connectedPlatform && <span className="badge badge-info">{store.connectedPlatform}</span>}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <Package className="w-4 h-4 mx-auto mb-1 text-brand-500" />
                  <span className="font-medium">{store.products}</span>
                  <p className="text-gray-400">Products</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <ShoppingBag className="w-4 h-4 mx-auto mb-1 text-green-500" />
                  <span className="font-medium">{store.orders}</span>
                  <p className="text-gray-400">Orders</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <DollarSign className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                  <span className="font-medium">${store.totalSales}</span>
                  <p className="text-gray-400">Sales</p>
                </div>
              </div>
              {store.templates?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Design Templates</p>
                  <div className="grid grid-cols-2 gap-2">
                    {store.templates.slice(0, 4).map((tpl) => (
                      <div key={tpl.id} className="bg-gray-50 rounded-lg p-2 text-center">
                        <Shirt className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                        <p className="text-xs font-medium">{tpl.name}</p>
                        <p className="text-[10px] text-gray-400">{tpl.variants?.length || 0} variants</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
