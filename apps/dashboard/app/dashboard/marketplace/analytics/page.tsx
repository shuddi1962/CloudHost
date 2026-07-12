"use client"

import { useState, useEffect } from "react"

type MonthlyData = { month: string; impressions: number; clicks: number; installs: number; revenue: number }
type Product = { name: string; installs: number; revenue: number; conversion: number }
type Category = { name: string; impressions: number; clicks: number; installs: number; revenue: number }

type Analytics = {
  totalImpressions: number
  totalClicks: number
  totalInstalls: number
  totalRevenue: number
  monthlyData: MonthlyData[]
  topProducts: Product[]
  byCategory: Category[]
}

function formatCompact(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return (n / 1000).toFixed(1) + "K"
  return String(n)
}

function formatCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function maxVal(data: MonthlyData[], key: "impressions" | "installs"): number {
  let m = 1
  for (const d of data) if (d[key] > m) m = d[key]
  return m
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const token = localStorage.getItem("token") || ""
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/marketplace/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch analytics")
        const json = await res.json()
        setAnalytics(json.analytics)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <div className="card"><div className="card-body">Loading analytics...</div></div>
  if (error) return <div className="card"><div className="card-body">Error: {error}</div></div>
  if (!analytics) return null

  const a = analytics
  const maxImp = maxVal(a.monthlyData, "impressions")
  const maxIns = maxVal(a.monthlyData, "installs")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h1>Seller Analytics</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <div className="card">
          <div className="card-header">Total Impressions</div>
          <div className="card-body" style={{ fontSize: 24, fontWeight: 700 }}>{formatCompact(a.totalImpressions)}</div>
        </div>
        <div className="card">
          <div className="card-header">Total Clicks</div>
          <div className="card-body" style={{ fontSize: 24, fontWeight: 700 }}>{formatCompact(a.totalClicks)}</div>
        </div>
        <div className="card">
          <div className="card-header">Total Installs</div>
          <div className="card-body" style={{ fontSize: 24, fontWeight: 700 }}>{formatCompact(a.totalInstalls)}</div>
        </div>
        <div className="card">
          <div className="card-header">Total Revenue</div>
          <div className="card-body" style={{ fontSize: 24, fontWeight: 700 }}>{formatCurrency(a.totalRevenue)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Monthly Performance</div>
        <div className="card-body">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, minHeight: 200, paddingTop: 16 }}>
            {a.monthlyData.map((m) => {
              const impH = (m.impressions / maxImp) * 160
              const insH = (m.installs / maxIns) * 160
              return (
                <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 160 }}>
                    <div style={{ width: 20, background: "#3b82f6", borderRadius: "4px 4px 0 0", height: impH, transition: "height 0.3s" }} title={`${m.month}: ${m.impressions} impressions`} />
                    <div style={{ width: 20, background: "#22c55e", borderRadius: "4px 4px 0 0", height: insH, transition: "height 0.3s" }} title={`${m.month}: ${m.installs} installs`} />
                  </div>
                  <span style={{ fontSize: 11, textAlign: "center" }}>{m.month}</span>
                </div>
              )
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 13 }}>
            <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#3b82f6", borderRadius: 2, marginRight: 4 }} /> Impressions</span>
            <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#22c55e", borderRadius: 2, marginRight: 4 }} /> Installs</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Top Products</div>
        <div className="card-body">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "8px 12px" }}>Product</th>
                <th style={{ padding: "8px 12px" }}>Installs</th>
                <th style={{ padding: "8px 12px" }}>Revenue</th>
                <th style={{ padding: "8px 12px" }}>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {a.topProducts.map((p) => (
                <tr key={p.name} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "8px 12px" }}>{p.name}</td>
                  <td style={{ padding: "8px 12px" }}>{p.installs}</td>
                  <td style={{ padding: "8px 12px" }}>{formatCurrency(p.revenue)}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <span className={p.conversion > 5 ? "badge-success" : "badge-warning"}>
                      {p.conversion.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Category Breakdown</div>
        <div className="card-body">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "8px 12px" }}>Category</th>
                <th style={{ padding: "8px 12px" }}>Impressions</th>
                <th style={{ padding: "8px 12px" }}>Clicks</th>
                <th style={{ padding: "8px 12px" }}>Installs</th>
                <th style={{ padding: "8px 12px" }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {a.byCategory.map((c) => (
                <tr key={c.name} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "8px 12px" }}>{c.name}</td>
                  <td style={{ padding: "8px 12px" }}>{c.impressions.toLocaleString()}</td>
                  <td style={{ padding: "8px 12px" }}>{c.clicks.toLocaleString()}</td>
                  <td style={{ padding: "8px 12px" }}>{c.installs}</td>
                  <td style={{ padding: "8px 12px" }}>{formatCurrency(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
