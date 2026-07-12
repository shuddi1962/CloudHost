"use client";

import { useEffect, useState } from "react";
import { Tag, Percent, Clock, Gift, CheckCircle, XCircle } from "lucide-react";

interface Promo {
  id: string;
  code: string;
  description: string;
  discount: string;
  discountType: string;
  expiry: string;
  active: boolean;
}

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<any>(null);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/promos`, { headers })
      .then(r => r.json())
      .then(data => setPromos(data.promos || data.coupons || []))
      .catch(() => setPromos([]))
      .finally(() => setLoading(false));
  }, []);

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setRedeeming(true);
    setError("");
    setRedeemResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketing-suite/promos/redeem`, {
        method: "POST", headers,
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok) setRedeemResult(data);
      else setError(data.error || "Invalid or expired code");
    } catch { setError("Failed to redeem. Try again."); } finally { setRedeeming(false); }
  };

  const isExpired = (date: string) => date && new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Promos & Coupons</h1>
        <p className="text-gray-500">View active promotions and redeem coupon codes</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Gift className="w-5 h-5 text-brand-600" /> Redeem a Coupon</h2>
        <form onSubmit={redeem} className="flex gap-3">
          <input value={code} onChange={e => setCode(e.target.value)} className="input-field max-w-xs" placeholder="Enter coupon code" />
          <button type="submit" disabled={redeeming} className="btn-primary">{redeeming ? "Validating..." : "Apply"}</button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><XCircle className="w-4 h-4" /> {error}</p>}
        {redeemResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 font-medium mb-1"><CheckCircle className="w-5 h-5" /> Code Applied!</div>
            <p className="text-sm text-green-600">Discount: {redeemResult.discountValue || redeemResult.discount}{redeemResult.discountType === "percentage" ? "%" : "$"} {redeemResult.discountType}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.length === 0 ? (
            <div className="col-span-full card p-12 text-center">
              <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Active Promotions</h3>
              <p className="text-gray-500">Check back later for new deals</p>
            </div>
          ) : promos.filter(p => p.active).map(promo => (
            <div key={promo.id} className={`card p-5 ${isExpired(promo.expiry) ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold font-mono text-brand-600">{promo.code}</span>
                <span className="badge badge-success text-xs">{promo.discount}{promo.discountType === "percentage" ? "% OFF" : "$ OFF"}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{promo.description}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {promo.expiry ? (isExpired(promo.expiry) ? "Expired" : `Expires ${new Date(promo.expiry).toLocaleDateString()}`) : "No expiry"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
