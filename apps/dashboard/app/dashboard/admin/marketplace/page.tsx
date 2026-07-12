"use client"

import { useState, useEffect, useCallback } from "react"

type QueueStatus = "pending" | "under_review" | "approved" | "rejected"

interface QueueItem {
  id: string
  sellerName: string
  sellerEmail: string
  company: string
  productName: string
  productType: string
  category: string
  description: string
  submittedAt: string
  status: QueueStatus
}

type Tab = "all" | QueueStatus

const statusBadge: Record<QueueStatus, string> = {
  pending: "badge-warning",
  under_review: "badge-info",
  approved: "badge-success",
  rejected: "badge-error",
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

async function fetchQueue(token: string): Promise<QueueItem[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketplace/admin/queue`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch queue")
  const data = await res.json()
  return data.queue ?? data
}

async function updateStatus(
  token: string,
  id: string,
  action: "approve" | "reject" | "review"
): Promise<void> {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/marketplace/admin/queue/${id}/${action}`
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Failed to ${action} submission`)
}

export default function AdminMarketplacePage() {
  const [token] = useState(() => {
    if (typeof window === "undefined") return ""
    return (
      document.cookie
        .split("; ")
        .find((r) => r.startsWith("token="))
        ?.split("=")[1] ?? ""
    )
  })
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError("")
    try {
      const items = await fetchQueue(token)
      setQueue(items)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "review"
  ) => {
    const nextStatus: Record<string, QueueStatus> = {
      approve: "approved",
      reject: "rejected",
      review: "under_review",
    }

    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus[action] } : item
      )
    )

    try {
      await updateStatus(token, id, action)
    } catch {
      load()
    }
  }

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "under_review", label: "Under Review" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ]

  const filtered =
    activeTab === "all"
      ? queue
      : queue.filter((item) => item.status === activeTab)

  const stats = {
    pending: queue.filter((i) => i.status === "pending").length,
    under_review: queue.filter((i) => i.status === "under_review").length,
    approved: queue.filter((i) => i.status === "approved").length,
    rejected: queue.filter((i) => i.status === "rejected").length,
  }

  return (
    <div>
      <h1>Marketplace Approval Queue</h1>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-body">
            <strong>Pending</strong>
            <div style={{ fontSize: 24 }}>{stats.pending}</div>
          </div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-body">
            <strong>Under Review</strong>
            <div style={{ fontSize: 24 }}>{stats.under_review}</div>
          </div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-body">
            <strong>Approved</strong>
            <div style={{ fontSize: 24 }}>{stats.approved}</div>
          </div>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-body">
            <strong>Rejected</strong>
            <div style={{ fontSize: 24 }}>{stats.rejected}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "btn-primary" : "btn-secondary"}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p>Loading submissions...</p>}

      {error && <p style={{ color: "var(--error, red)" }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p>No submissions found.</p>
      )}

      {!loading &&
        filtered.map((item) => {
          const isOpen = expanded.has(item.id)
          return (
            <div key={item.id} className="card" style={{ marginBottom: 12 }}>
              <div className="card-header">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div>
                    <strong>{item.productName}</strong>
                    <span style={{ marginLeft: 8, color: "var(--muted, #666)" }}>
                      by {item.sellerName}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className={`badge-${item.status === "under_review" ? "info" : item.status}`}>
                      {item.status.replace("_", " ")}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--muted, #666)" }}>
                      {relativeDate(item.submittedAt)}
                    </span>
                    <span>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>
              </div>
              {isOpen && (
                <div className="card-body">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <strong>Seller:</strong> {item.sellerName} ({item.sellerEmail})
                    </div>
                    <div>
                      <strong>Company:</strong> {item.company}
                    </div>
                    <div>
                      <strong>Type:</strong> {item.productType}
                    </div>
                    <div>
                      <strong>Category:</strong> {item.category}
                    </div>
                    <div>
                      <strong>Submitted:</strong>{" "}
                      {new Date(item.submittedAt).toLocaleString()}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      <span className={statusBadge[item.status]}>
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <strong>Description:</strong>
                    <p style={{ whiteSpace: "pre-wrap" }}>{item.description}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {item.status !== "approved" && (
                      <button
                        className="btn-primary"
                        style={{ background: "var(--success, #22c55e)" }}
                        onClick={() => handleAction(item.id, "approve")}
                      >
                        Approve
                      </button>
                    )}
                    {item.status !== "rejected" && (
                      <button
                        className="btn-secondary"
                        style={{ color: "var(--error, #ef4444)", borderColor: "var(--error, #ef4444)" }}
                        onClick={() => handleAction(item.id, "reject")}
                      >
                        Reject
                      </button>
                    )}
                    {item.status !== "under_review" && item.status !== "approved" && item.status !== "rejected" && (
                      <button
                        className="btn-secondary"
                        onClick={() => handleAction(item.id, "review")}
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
    </div>
  )
}
