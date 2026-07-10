"use client";

import { useEffect, useState } from "react";
import { Store, ShoppingBag, Eye, Heart, MessageSquare, DollarSign, Plus, List } from "lucide-react";

export default function DomainMarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"browse" | "mine">("browse");
  const [showList, setShowList] = useState(false);
  const [domain, setDomain] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [makeOffer, setMakeOffer] = useState(false);
  const [selectedOffers, setSelectedOffers] = useState<any[] | null>(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerListingId, setOfferListingId] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchListings = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/domain-services/marketplace", { headers });
      const data = await res.json();
      setListings(data.listings || []);
    } catch (e) {}
  };

  const fetchMyListings = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/domain-services/marketplace/my-listings", { headers });
      const data = await res.json();
      setMyListings(data.listings || []);
    } catch (e) {}
  };

  useEffect(() => {
    Promise.all([fetchListings(), fetchMyListings()]).finally(() => setLoading(false));
  }, []);

  const listDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3001/api/domain-services/marketplace", {
      method: "POST", headers,
      body: JSON.stringify({ domain, price: Number(price), category, description, makeOffer, listingType: "fixed" }),
    });
    if (res.ok) {
      const data = await res.json();
      setMyListings([data.listing, ...myListings]);
      setDomain(""); setPrice(""); setCategory(""); setDescription(""); setMakeOffer(false); setShowList(false);
    }
  };

  const viewOffers = async (id: string) => {
    const res = await fetch(`http://localhost:3001/api/domain-services/marketplace/${id}/offers`, { headers });
    const data = await res.json();
    setSelectedOffers(data.offers || []);
  };

  const submitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerListingId) return;
    const res = await fetch(`http://localhost:3001/api/domain-services/marketplace/${offerListingId}/offer`, {
      method: "POST", headers,
      body: JSON.stringify({ amount: Number(offerAmount), message: "" }),
    });
    if (res.ok) {
      setOfferListingId(null); setOfferAmount("");
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Domain Marketplace</h1>
          <p className="text-gray-500">Buy, sell, and trade domain names</p>
        </div>
        <button onClick={() => setShowList(!showList)} className="btn-primary">
          <Plus className="w-4 h-4" /> List Domain
        </button>
      </div>

      {showList && (
        <form onSubmit={listDomain} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Domain Name</label>
              <input value={domain} onChange={e => setDomain(e.target.value)} className="input-field" placeholder="example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="input-field" placeholder="99" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
                <option value="">Select category</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="finance">Finance</option>
                <option value="health">Health</option>
                <option value="gaming">Gaming</option>
                <option value="travel">Travel</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={makeOffer} onChange={e => setMakeOffer(e.target.checked)} className="rounded border-gray-300" />
                <span className="text-sm font-medium">Allow Offers</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={2} placeholder="Describe your domain..." />
          </div>
          <button type="submit" className="btn-primary">List Domain</button>
        </form>
      )}

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button onClick={() => setTab("browse")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "browse" ? "bg-brand-50 text-brand-700" : "text-gray-500 hover:text-gray-700"}`}>
          <Store className="w-4 h-4 inline mr-1" /> Browse Listings
        </button>
        <button onClick={() => setTab("mine")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "mine" ? "bg-brand-50 text-brand-700" : "text-gray-500 hover:text-gray-700"}`}>
          <ShoppingBag className="w-4 h-4 inline mr-1" /> My Listings ({myListings.length})
        </button>
      </div>

      {tab === "browse" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.length === 0 ? (
            <div className="col-span-full card">
              <div className="card-body text-center py-12">
                <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">No active listings</p>
                <p className="text-gray-400 text-sm mt-1">Check back later or list your own domain</p>
              </div>
            </div>
          ) : listings.map((l) => (
            <div key={l.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">{l.domain}</h3>
                <span className="badge badge-info text-xs">{l.category || "general"}</span>
              </div>
              <p className="text-2xl font-bold text-brand-600 mb-3">${l.price}</p>
              {l.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{l.description}</p>}
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {l.views || 0}</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {l.watchers || 0}</span>
                {l.makeOffer && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Offers</span>}
              </div>
              <div className="flex gap-2">
                {l.makeOffer && (
                  <button onClick={() => setOfferListingId(l.id)} className="btn-secondary text-xs flex-1">
                    <MessageSquare className="w-3 h-3" /> Make Offer
                  </button>
                )}
                <button onClick={() => viewOffers(l.id)} className="btn-secondary text-xs flex-1">
                  <List className="w-3 h-3" /> View Offers
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "mine" && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Domain</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Views</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Watchers</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Listed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myListings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">You haven't listed any domains</p>
                    </td>
                  </tr>
                ) : myListings.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{l.domain}</td>
                    <td className="px-4 py-3 font-bold text-brand-600">${l.price}</td>
                    <td className="px-4 py-3"><span className="badge badge-info">{l.category || "general"}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${l.status === "active" ? "badge-success" : "badge-warning"}`}>{l.status}</span></td>
                    <td className="px-4 py-3">{l.views || 0}</td>
                    <td className="px-4 py-3">{l.watchers || 0}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(l.listedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {offerListingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setOfferListingId(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Make an Offer</h3>
            <form onSubmit={submitOffer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Offer ($)</label>
                <input type="number" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} className="input-field" placeholder="50" required />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Submit Offer</button>
                <button type="button" onClick={() => setOfferListingId(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOffers && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedOffers(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Offers</h3>
              <button onClick={() => setSelectedOffers(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {selectedOffers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No offers yet</p>
            ) : (
              <div className="space-y-3">
                {selectedOffers.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">${o.amount}</p>
                      <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`badge ${o.status === "pending" ? "badge-warning" : o.status === "accepted" ? "badge-success" : "badge-error"}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
