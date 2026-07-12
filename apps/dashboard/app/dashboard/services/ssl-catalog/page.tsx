"use client";

import { useEffect, useState } from "react";
import { Shield, Star, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, X, ShoppingCart, ShieldCheck, Sparkles, Filter } from "lucide-react";

const brands = ["Comodo", "Sectigo", "DigiCert", "GeoTrust"];
const validations = ["DV", "OV", "EV"];

interface SslCert {
  id: string;
  name: string;
  brand: string;
  validation: string;
  price: number;
  warranty: string;
  issuanceTime: string;
  features: string[];
  popular: boolean;
}

interface MyCert {
  id: string;
  certName: string;
  domain: string;
  status: string;
  purchasedAt: string;
  expiresAt: string;
}

export default function SslCatalogPage() {
  const [certs, setCerts] = useState<SslCert[]>([]);
  const [myCerts, setMyCerts] = useState<MyCert[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showMyCerts, setShowMyCerts] = useState(false);
  const [brand, setBrand] = useState("");
  const [validation, setValidation] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<SslCert | null>(null);
  const [domain, setDomain] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseMsg, setPurchaseMsg] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (brand) params.set("brand", brand);
      if (validation) params.set("validation", validation);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/ssl-catalog?${params}`, { headers });
      const data = await res.json();
      if (data.certs) setCerts(data.certs);
      else if (data.sslCertificates) setCerts(data.sslCertificates);
      else setCerts([]);
    } catch { setCerts([]); } finally { setLoading(false); }
  };

  const fetchMyCerts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/ssl-catalog/my-certs`, { headers });
      const data = await res.json();
      setMyCerts(data.certificates || data.myCertificates || []);
    } catch {}
  };

  useEffect(() => { fetchCerts(); fetchMyCerts(); }, [brand, validation]);

  const seedCatalog = async () => {
    setSeeding(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/ssl-catalog/seed`, { method: "POST", headers });
      await fetchCerts();
    } catch {} finally { setSeeding(false); }
  };

  const openPurchase = (cert: SslCert) => {
    setSelectedCert(cert);
    setDomain("");
    setPurchaseMsg("");
    setModalOpen(true);
  };

  const purchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || !selectedCert) return;
    setPurchasing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketing-suite/ssl-catalog/purchase`, {
        method: "POST", headers,
        body: JSON.stringify({ certificateId: selectedCert.id, domain: domain.trim() }),
      });
      const data = await res.json();
      setPurchaseMsg(data.message || "Certificate purchased successfully!");
      await fetchMyCerts();
    } catch { setPurchaseMsg("Purchase failed. Please try again."); } finally { setPurchasing(false); }
  };

  const statusIcon = (s: string) => {
    if (s === "issued") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (s === "pending") return <Clock className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SSL Certificates</h1>
          <p className="text-gray-500">Browse and purchase SSL certificates for your domains</p>
        </div>
        <button onClick={() => { setShowMyCerts(!showMyCerts); if (!showMyCerts) fetchMyCerts(); }} className="btn-secondary">
          <ShieldCheck className="w-4 h-4" /> {showMyCerts ? "Browse Catalog" : "My Certificates"}
        </button>
      </div>

      {!showMyCerts ? (
        <>
          {certs.length === 0 && !loading ? (
            <div className="card p-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No SSL Certificates Yet</h3>
              <p className="text-gray-500 mb-6">Seed the catalog with SSL certificate offerings</p>
              <button onClick={seedCatalog} disabled={seeding} className="btn-primary">
                {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {seeding ? "Seeding..." : "Seed SSL Catalog"}
              </button>
            </div>
          ) : (
            <>
              <div className="card p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select value={brand} onChange={e => setBrand(e.target.value)} className="input-field w-44">
                      <option value="">All Brands</option>
                      {brands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={validation} onChange={e => setValidation(e.target.value)} className="input-field w-36">
                      <option value="">All Validation</option>
                      {validations.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certs.map(cert => (
                    <div key={cert.id} className={`card p-6 relative ${cert.popular ? "ring-2 ring-yellow-400" : ""}`}>
                      {cert.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" /> Popular
                        </span>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg">{cert.name}</h3>
                        <span className="badge badge-info text-xs">{cert.brand}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`badge ${cert.validation === "DV" ? "badge-success" : cert.validation === "OV" ? "badge-warning" : "badge-error"} text-xs`}>{cert.validation}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {cert.issuanceTime}</span>
                      </div>
                      <p className="text-3xl font-bold text-brand-600 mb-4">${cert.price}<span className="text-sm text-gray-400 font-normal">/yr</span></p>
                      {cert.warranty && <p className="text-xs text-gray-500 mb-2">Warranty: {cert.warranty}</p>}
                      <ul className="space-y-1 mb-6">
                        {cert.features?.map((f, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => openPurchase(cert)} className="btn-primary w-full">
                        <ShoppingCart className="w-4 h-4" /> Purchase
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="card">
          <div className="card-header"><h2 className="font-semibold">My Certificates</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Certificate</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Domain</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Purchased</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myCerts.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No certificates purchased yet</p>
                  </td></tr>
                ) : myCerts.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.certName}</td>
                    <td className="px-4 py-3 text-gray-500">{c.domain}</td>
                    <td className="px-4 py-3"><span className={`flex items-center gap-1 badge ${c.status === "issued" ? "badge-success" : c.status === "pending" ? "badge-warning" : "badge-error"}`}>{statusIcon(c.status)}{c.status}</span></td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.purchasedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && selectedCert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Purchase {selectedCert.name}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-2">Brand: {selectedCert.brand} | Validation: {selectedCert.validation}</p>
            <p className="text-2xl font-bold text-brand-600 mb-4">${selectedCert.price}<span className="text-sm text-gray-400 font-normal">/yr</span></p>
            <form onSubmit={purchase}>
              <label className="block text-sm font-medium mb-1">Domain Name</label>
              <input value={domain} onChange={e => setDomain(e.target.value)} className="input-field mb-4" placeholder="example.com" required />
              {purchaseMsg && <p className={`text-sm mb-3 ${purchaseMsg.includes("failed") ? "text-red-500" : "text-green-600"}`}>{purchaseMsg}</p>}
              <button type="submit" disabled={purchasing} className="btn-primary w-full">{purchasing ? "Processing..." : "Purchase Certificate"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
