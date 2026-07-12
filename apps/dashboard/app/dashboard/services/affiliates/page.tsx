"use client";

import { useEffect, useState } from "react";
import { Users, Link, DollarSign, TrendingUp, Copy, CheckCircle, ExternalLink, RefreshCw, Gift } from "lucide-react";

interface AffiliateData {
  isAffiliate: boolean;
  referralCode?: string;
  totalEarned: number;
  totalPaid: number;
  pendingPayout: number;
  referralCount: number;
  conversionRate: number;
  referrals: { id: string; email: string; status: string; commission: number; createdAt: string }[];
}

export default function AffiliatesPage() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/affiliates`, { headers });
      const d = await res.json();
      setData(d.affiliate || d);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const join = async () => {
    setJoining(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/affiliates/join`, { method: "POST", headers });
      const d = await res.json();
      setData(d.affiliate || d);
    } catch {} finally { setJoining(false); }
  };

  const generateLink = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/affiliates/generate-link`, {
        method: "POST", headers,
        body: JSON.stringify({}),
      });
      const d = await res.json();
      setGeneratedLink(d.referralLink || d.link || `https://cloudhost.com/ref/${data?.referralCode}`);
    } catch {}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  if (data && !data.isAffiliate) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Affiliates Program</h1>
          <p className="text-gray-500">Earn commissions by referring customers</p>
        </div>
        <div className="card p-12 text-center">
          <Gift className="w-16 h-16 mx-auto mb-4 text-brand-600" />
          <h2 className="text-xl font-bold mb-2">Join Our Affiliates Program</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Earn competitive commissions for every customer you refer. Get paid monthly with no minimum payout threshold.</p>
          <button onClick={join} disabled={joining} className="btn-primary text-lg px-8 py-3">{joining ? "Joining..." : "Join Now"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Affiliates Program</h1>
        <p className="text-gray-500">Track your referrals and earnings</p>
      </div>

      {data?.referralCode && (
        <div className="card p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Your Referral Code</p>
              <p className="text-2xl font-bold font-mono text-brand-600">{data.referralCode}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => copyToClipboard(data.referralCode!)} className="btn-secondary">
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Code"}
              </button>
              <button onClick={generateLink} className="btn-secondary"><Link className="w-4 h-4" /> Generate Link</button>
            </div>
          </div>
          {generatedLink && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-600 truncate">{generatedLink}</span>
              <button onClick={() => copyToClipboard(generatedLink)} className="btn-secondary text-xs ml-2"><Copy className="w-3 h-3" /> Copy</button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><DollarSign className="w-4 h-4" /> Total Earned</p>
          <p className="text-2xl font-bold text-green-600">${(data?.totalEarned || 0).toFixed(2)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><DollarSign className="w-4 h-4" /> Paid</p>
          <p className="text-2xl font-bold text-brand-600">${(data?.totalPaid || 0).toFixed(2)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><DollarSign className="w-4 h-4" /> Pending</p>
          <p className="text-2xl font-bold text-yellow-500">${(data?.pendingPayout || 0).toFixed(2)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Conversion</p>
          <p className="text-2xl font-bold text-brand-600">{data?.conversionRate || 0}%</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4" /> Referrals ({data?.referralCount || 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Commission</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.referrals?.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No referrals yet</p>
                  <p className="text-xs mt-1">Share your referral code to start earning</p>
                </td></tr>
              ) : data?.referrals?.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3"><span className={`badge ${r.status === "converted" ? "badge-success" : r.status === "pending" ? "badge-warning" : "badge-error"} text-xs`}>{r.status}</span></td>
                  <td className="px-4 py-3 font-medium">${r.commission?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
