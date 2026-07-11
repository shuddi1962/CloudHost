'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'

interface Usage {
  api_calls?: number
  storage?: number
  bandwidth?: number
}

interface Subscription {
  id: string
  product: string
  plan: string
  status: string
  amount: number
  currency: string
  interval: string
  next_billing: string
  auto_renew: boolean
  usage?: Usage
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const getToken = () => {
    try {
      const stored = localStorage.getItem('sb-session') || localStorage.getItem('supabase_session') || '{}'
      const parsed = JSON.parse(stored)
      return parsed?.access_token || ''
    } catch {
      return ''
    }
  }

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch('http://localhost:3001/api/marketplace/subscriptions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setSubscriptions(Array.isArray(data) ? data : data.subscriptions ?? [])
    } catch {
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const filtered = subscriptions.filter((s) => {
    if (filter === 'all') return true
    return s.status === filter
  })

  const activeCount = subscriptions.filter((s) => s.status === 'active').length
  const monthlySpend = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0)

  const nextBillingDates = subscriptions
    .filter((s) => s.status === 'active' && s.next_billing)
    .map((s) => new Date(s.next_billing))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  const nextBilling = nextBillingDates.length > 0 ? nextBillingDates[0] : null

  const formatAmount = (amount: number, currency: string, interval: string) => {
    const fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
    const map: Record<string, string> = { month: '/mo', year: '/yr', week: '/wk', day: '/day' }
    return `${fmt}${map[interval] || `/${interval}`}`
  }

  const relativeDate = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    const now = new Date()
    const diff = d.getTime() - now.getTime()
    const days = Math.round(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return `${Math.abs(days)}d overdue`
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    return `${days}d`
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      active: { cls: 'badge-success', label: 'Active' },
      past_due: { cls: 'badge-warning', label: 'Past Due' },
      canceled: { cls: 'badge-error', label: 'Canceled' },
    }
    const { cls, label } = map[status] || { cls: 'badge-info', label: status }
    return <span className={`badge ${cls}`}>{label}</span>
  }

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      const token = getToken()
      const res = await fetch(`http://localhost:3001/api/marketplace/subscriptions/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Cancel failed')
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'canceled', auto_renew: false } : s)),
      )
    } catch {
      alert('Failed to cancel subscription.')
    } finally {
      setCancellingId(null)
    }
  }

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  }

  if (loading) {
    return <div className="card"><div className="card-body">Loading subscriptions...</div></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subscriptions</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-header">Active Subscriptions</div>
          <div className="card-body text-3xl font-bold">{activeCount}</div>
        </div>
        <div className="card">
          <div className="card-header">Monthly Spend</div>
          <div className="card-body text-3xl font-bold">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlySpend)}
          </div>
        </div>
        <div className="card">
          <div className="card-header">Next Billing</div>
          <div className="card-body text-3xl font-bold">
            {nextBilling ? nextBilling.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'active', 'past_due', 'canceled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={filter === tab ? 'btn-primary' : 'btn-secondary'}
          >
            {tab === 'past_due' ? 'Past Due' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="card">
        <div className="card-body p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Next Billing</th>
                <th className="text-left p-3">Auto Renew</th>
                <th className="text-left p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No subscriptions found.
                  </td>
                </tr>
              )}
              {filtered.map((sub) => (
                <Fragment key={sub.id}>
                  <tr
                    className="border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => handleToggleExpand(sub.id)}
                  >
                    <td className="p-3">{sub.product}</td>
                    <td className="p-3">{sub.plan}</td>
                    <td className="p-3">{statusBadge(sub.status)}</td>
                    <td className="p-3">{formatAmount(sub.amount, sub.currency, sub.interval)}</td>
                    <td className="p-3">{relativeDate(sub.next_billing)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${
                          sub.auto_renew ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={sub.auto_renew ? 'Auto-renew on' : 'Auto-renew off'}
                      />
                    </td>
                    <td className="p-3">
                      {sub.status === 'active' && (
                        <button
                          className="btn-secondary text-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Are you sure you want to cancel this subscription?')) {
                              handleCancel(sub.id)
                            }
                          }}
                          disabled={cancellingId === sub.id}
                        >
                          {cancellingId === sub.id ? '...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === sub.id && sub.usage && (
                    <tr>
                      <td colSpan={7} className="p-4 bg-gray-50">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">API Calls:</span>{' '}
                            {sub.usage.api_calls?.toLocaleString() ?? '—'}
                          </div>
                          <div>
                            <span className="font-medium">Storage:</span>{' '}
                            {formatBytes(sub.usage.storage)}
                          </div>
                          <div>
                            <span className="font-medium">Bandwidth:</span>{' '}
                            {formatBytes(sub.usage.bandwidth)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
