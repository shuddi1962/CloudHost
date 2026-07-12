"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/whmcs`;

const adminTabs = [
  { label: "Clients", href: "#", count: "1,284" },
  { label: "Orders", href: "#", count: "47" },
  { label: "Billing", href: "#", count: "$128K" },
  { label: "Support", href: "#", count: "12" },
  { label: "Reports", href: "#", count: "" },
  { label: "Utilities", href: "#", count: "" },
  { label: "Addons", href: "#", count: "3" },
];

const defaultStatCards = [
  { label: "Pending Orders", value: "23", bg: "bg-[#e08a1e]", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { label: "Tickets Waiting", value: "12", bg: "bg-[#e6427a]", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { label: "Pending Cancellations", value: "5", bg: "bg-[#e2372f]", icon: "M6 18L18 6M6 6l12 12" },
  { label: "Pending Module Actions", value: "8", bg: "bg-[#3ea6c9]", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
];

const automationTasks = [
  { name: "Server Status Check", lastRun: "1 min ago", status: "Completed", statusColor: "text-[#3cb878]" },
  { name: "Invoice Generation", lastRun: "15 min ago", status: "Completed", statusColor: "text-[#3cb878]" },
  { name: "Domain Renewal Check", lastRun: "1 hour ago", status: "Completed", statusColor: "text-[#3cb878]" },
  { name: "Suspension Check", lastRun: "2 hours ago", status: "Running", statusColor: "text-[#e08a1e]" },
  { name: "Email Queue", lastRun: "3 hours ago", status: "Pending", statusColor: "text-gray-400" },
];

const defaultSupportFeed = [
  { ticket: "#TKT-2841", subject: "Cannot access cPanel", status: "Open", statusColor: "text-[#e6427a]" },
  { ticket: "#TKT-2840", subject: "SSL renewal failed", status: "Open", statusColor: "text-[#e6427a]" },
  { ticket: "#TKT-2839", subject: "Email setup help", status: "Replied", statusColor: "text-[#e08a1e]" },
  { ticket: "#TKT-2838", subject: "Migration request", status: "Closed", statusColor: "text-[#3cb878]" },
];

const defaultInvoices = [
  { id: "INV-2024", client: "John Customer", amount: "$24.99", status: "Unpaid", statusColor: "text-red-600 bg-red-50" },
  { id: "INV-2023", client: "Sarah Johnson", amount: "$49.99", status: "Paid", statusColor: "text-[#3cb878] bg-green-50" },
  { id: "INV-2022", client: "Mike Chen", amount: "$12.99", status: "Paid", statusColor: "text-[#3cb878] bg-green-50" },
  { id: "INV-2021", client: "Emily Davis", amount: "$89.99", status: "Cancelled", statusColor: "text-gray-500 bg-gray-50" },
];

const defaultNetworkStatus = [
  { name: "Web Server", status: "Online", color: "bg-[#3cb878]" },
  { name: "Database Cluster", status: "Online", color: "bg-[#3cb878]" },
  { name: "Email Server", status: "Degraded", color: "bg-[#e08a1e]" },
  { name: "DNS", status: "Online", color: "bg-[#3cb878]" },
  { name: "CDN", status: "Online", color: "bg-[#3cb878]" },
];

const defaultToDoItems = [
  { task: "Review pending migrations", priority: "High", priorityColor: "text-[#e2372f]" },
  { task: "Update pricing for VPS plans", priority: "Medium", priorityColor: "text-[#e08a1e]" },
  { task: "Check server disk usage", priority: "Normal", priorityColor: "text-[#3ea6c9]" },
];

const defaultStripeBalance = {
  available: "$45,230.00",
  pending: "$12,450.00",
  payoutsToday: "$3,200.00",
};

const defaultClientActivity = [
  { name: "John Customer", action: "Paid invoice INV-2023", time: "5 min ago" },
  { name: "Sarah Johnson", action: "Opened support ticket", time: "12 min ago" },
  { name: "Mike Chen", action: "Registered new domain", time: "1 hour ago" },
  { name: "Emily Davis", action: "Upgraded hosting plan", time: "2 hours ago" },
];

const marketConnect = [
  { name: "Weebly Site Builder", icon: "W", color: "bg-blue-500", desc: "Drag-and-drop website builder" },
  { name: "Open-Xchange", icon: "OX", color: "bg-green-600", desc: "Professional email hosting" },
  { name: "Sitelock", icon: "SL", color: "bg-orange-500", desc: "Website security & monitoring" },
  { name: "CodeGuard", icon: "CG", color: "bg-purple-500", desc: "Automated website backups" },
  { name: "DigiCert SSL", icon: "DC", color: "bg-teal-500", desc: "SSL certificate authority" },
  { name: "Google Analytics", icon: "GA", color: "bg-yellow-500", desc: "Website analytics & insights" },
];

const defaultAnalyticsData = {
  sessions: 2841,
  pageViews: 12450,
  bounceRate: "32.4%",
  avgSessionDuration: "4m 12s",
  realTimeUsers: 47,
  topCountries: [
    { country: "United States", sessions: 1240 },
    { country: "United Kingdom", sessions: 384 },
    { country: "Canada", sessions: 291 },
    { country: "Australia", sessions: 187 },
    { country: "Germany", sessions: 156 },
  ],
  topBrowsers: [
    { browser: "Chrome", percentage: 58 },
    { browser: "Safari", percentage: 22 },
    { browser: "Firefox", percentage: 11 },
    { browser: "Edge", percentage: 7 },
    { browser: "Other", percentage: 2 },
  ],
  topPages: [
    { page: "/", views: 8450 },
    { page: "/hosting", views: 3210 },
    { page: "/domains", views: 1890 },
    { page: "/support", views: 1450 },
    { page: "/cart", views: 980 },
  ],
  topSources: [
    { source: "Google Organic", sessions: 980 },
    { source: "Direct", sessions: 654 },
    { source: "Twitter", sessions: 321 },
    { source: "Facebook", sessions: 245 },
    { source: "Referral", sessions: 187 },
  ],
};

const defaultRevenueByCategory = [
  { category: "Shared Hosting", revenue: 45230, percentage: 42 },
  { category: "VPS Servers", revenue: 28100, percentage: 26 },
  { category: "Domain Names", revenue: 12450, percentage: 12 },
  { category: "Other Products", revenue: 21500, percentage: 20 },
];

export default function WhmcsAdminPage() {
  const [user, setUser] = useState<any>(null);
  const [chartPeriod, setChartPeriod] = useState<"today" | "30d" | "1yr">("30d");
  const [activeTab, setActiveTab] = useState("");
  const [analyticsTab, setAnalyticsTab] = useState<"overview" | "countries" | "browsers" | "sources">("overview");

  const [statCards, setStatCards] = useState(defaultStatCards);
  const [supportFeed, setSupportFeed] = useState(defaultSupportFeed);
  const [recentInvoices, setRecentInvoices] = useState(defaultInvoices);
  const [networkStatus, setNetworkStatus] = useState(defaultNetworkStatus);
  const [toDoItems, setToDoItems] = useState(defaultToDoItems);
  const [stripeBalance, setStripeBalance] = useState(defaultStripeBalance);
  const [clientActivity, setClientActivity] = useState(defaultClientActivity);
  const [analyticsData, setAnalyticsData] = useState(defaultAnalyticsData);
  const [revenueByCategory, setRevenueByCategory] = useState(defaultRevenueByCategory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));

    fetch(`${API}/dashboard`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.admin) {
          const a = data.admin;
          setStatCards([
            { label: "Pending Orders", value: String(a.pendingOrders ?? 23), bg: "bg-[#e08a1e]", icon: defaultStatCards[0].icon },
            { label: "Tickets Waiting", value: String(a.ticketsWaiting ?? 12), bg: "bg-[#e6427a]", icon: defaultStatCards[1].icon },
            { label: "Pending Cancellations", value: String(a.pendingCancellations ?? 5), bg: "bg-[#e2372f]", icon: defaultStatCards[2].icon },
            { label: "Pending Module Actions", value: String(a.pendingModuleActions ?? 8), bg: "bg-[#3ea6c9]", icon: defaultStatCards[3].icon },
          ]);
          if (a.revenueByCategory) setRevenueByCategory(a.revenueByCategory);
          if (a.analytics) setAnalyticsData(a.analytics);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = chartPeriod === "today"
    ? { labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"], orders: [3, 7, 12, 18, 14, 9], income: [120, 340, 560, 890, 720, 450] }
    : chartPeriod === "30d"
    ? { labels: ["Week 1", "Week 2", "Week 3", "Week 4"], orders: [45, 62, 38, 71], income: [2240, 3100, 1900, 3550] }
    : { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], orders: [180, 210, 195, 240, 280, 310, 290, 350, 320, 380, 410, 450], income: [9000, 10500, 9750, 12000, 14000, 15500, 14500, 17500, 16000, 19000, 20500, 22500] };

  const maxOrders = Math.max(...chartData.orders, 1);
  const maxIncome = Math.max(...chartData.income, 1);
  const maxRevenue = Math.max(...revenueByCategory.map((r: any) => r.revenue), 1);

  return (
    <div className="space-y-4 text-[13px]">
      {/* Admin Top Navigation */}
      <div className="bg-[#1c3f66] rounded-lg overflow-hidden">
        <div className="flex items-center text-white text-xs">
          <div className="px-4 py-2.5 bg-[#2b5a8a] font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
            Admin
          </div>
          {adminTabs.map((tab) => (
            <button key={tab.label} onClick={() => setActiveTab(tab.label)}
              className={`px-4 py-2.5 hover:bg-[#2b5a8a]/50 transition-colors flex items-center gap-1.5 ${activeTab === tab.label ? "bg-[#2b5a8a]/70" : ""}`}>
              {tab.label}
              {tab.count && <span className="bg-white/15 text-[10px] px-1.5 py-0.5 rounded">{tab.count}</span>}
            </button>
          ))}
          <Link href="/dashboard/whmcs/admin/whm" className="px-4 py-2.5 hover:bg-[#2b5a8a]/50 transition-colors text-white flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
            WHM
          </Link>
          <div className="ml-auto px-4 py-2.5 text-white/60 text-[10px]">
            WHMCS Admin · v8.11
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1c3f66]">Dashboard</h1>
          <p className="text-xs text-gray-500">System overview and management</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">Last updated: just now</span>
          <button className="text-xs text-white bg-[#1c3f66] px-3 py-1.5 rounded hover:bg-[#2b5a8a] transition-colors">Refresh</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-lg overflow-hidden shadow-sm">
            <div className={`${s.bg} px-4 py-3`}>
              <div className="flex items-center justify-between">
                <p className="text-white/80 text-[10px] uppercase tracking-wider font-medium">{s.label}</p>
                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} /></svg>
              </div>
              <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
            </div>
            <div className="bg-white border border-t-0 border-gray-200 px-4 py-2 flex justify-end">
              <Link href="/dashboard/coming-soon" className="text-[10px] text-[#1c3f66] hover:underline">View Details →</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* System Overview Chart */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-[#1c3f66]">System Overview</h2>
              <div className="flex items-center gap-1 bg-gray-100 rounded p-0.5">
                {(["today", "30d", "1yr"] as const).map((p) => (
                  <button key={p} onClick={() => setChartPeriod(p)}
                    className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${chartPeriod === p ? "bg-white shadow-sm text-[#1c3f66]" : "text-gray-500 hover:text-gray-700"}`}>
                    {p === "today" ? "Today" : p === "30d" ? "30 Days" : "1 Year"}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#1c3f66]" />
                  <span className="text-xs text-gray-500">Orders</span>
                  <span className="text-sm font-bold text-[#1c3f66]">{chartData.orders.reduce((a, b) => a + b, 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#3cb878]" />
                  <span className="text-xs text-gray-500">Income</span>
                  <span className="text-sm font-bold text-[#3cb878]">${chartData.income.reduce((a, b) => a + b, 0).toLocaleString()}</span>
                </div>
              </div>
              {/* SVG Bar Chart */}
              <div className="relative h-40 flex items-end gap-2">
                {chartData.labels.map((label, i) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                    <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: "100%" }}>
                      <div
                        className="w-2.5 bg-[#1c3f66] rounded-t transition-all duration-500"
                        style={{ height: `${(chartData.orders[i] / maxOrders) * 100}%` }}
                        title={`Orders: ${chartData.orders[i]}`}
                      />
                      <div
                        className="w-2.5 bg-[#3cb878] rounded-t transition-all duration-500"
                        style={{ height: `${(chartData.income[i] / maxIncome) * 100}%` }}
                        title={`Income: $${chartData.income[i]}`}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1 truncate w-full text-center">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lower Widget Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stripe Balance */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                <h2 className="font-semibold text-sm text-[#1c3f66]">Stripe Balance</h2>
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Available</span>
                  <span className="text-lg font-bold text-[#1c3f66]">{stripeBalance.available}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Pending</span>
                  <span className="text-sm font-semibold text-[#e08a1e]">{stripeBalance.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Payouts Today</span>
                  <span className="text-sm font-semibold text-[#3cb878]">{stripeBalance.payoutsToday}</span>
                </div>
                <Link href="/dashboard/admin/billing" className="block text-center text-xs font-medium text-white bg-[#1c3f66] rounded py-1.5 hover:bg-[#2b5a8a] transition-colors">View Payouts</Link>
              </div>
            </div>

            {/* Client Activity */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                <h2 className="font-semibold text-sm text-[#1c3f66]">Client Activity</h2>
                <span className="text-[10px] text-gray-400">Live</span>
              </div>
              <div className="divide-y divide-gray-100">
                {clientActivity.map((a, i) => (
                  <div key={i} className="px-5 py-2.5 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i < 2 ? "bg-[#3cb878]" : "bg-gray-300"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800"><strong>{a.name}</strong> {a.action}</p>
                      <p className="text-[10px] text-gray-400">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Google Analytics Widget */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-[#1c3f66]">Google Analytics</h2>
              <div className="flex items-center gap-1 bg-gray-100 rounded p-0.5">
                {(["overview", "countries", "browsers", "sources"] as const).map((t) => (
                  <button key={t} onClick={() => setAnalyticsTab(t)}
                    className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${analyticsTab === t ? "bg-white shadow-sm text-[#1c3f66]" : "text-gray-500 hover:text-gray-700"}`}>
                    {t === "overview" ? "Overview" : t === "countries" ? "Countries" : t === "browsers" ? "Browsers" : "Sources"}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5">
              {analyticsTab === "overview" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1c3f66]">{analyticsData.sessions.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1c3f66]">{analyticsData.pageViews.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Page Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#e6427a]">{analyticsData.bounceRate}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Bounce Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#3cb878]">{analyticsData.avgSessionDuration}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Avg. Session</p>
                  </div>
                  <div className="col-span-2 md:col-span-4 mt-2 flex items-center gap-2 bg-yellow-50 rounded px-3 py-2">
                    <span className="w-2 h-2 rounded-full bg-[#e08a1e] animate-pulse" />
                    <span className="text-xs text-gray-600"><strong>{analyticsData.realTimeUsers}</strong> active users right now</span>
                  </div>
                </div>
              )}
              {analyticsTab === "countries" && (
                <div className="space-y-2">
                  {analyticsData.topCountries.map((c) => (
                    <div key={c.country} className="flex items-center justify-between">
                      <span className="text-xs text-gray-700">{c.country}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-[#1c3f66] rounded-full h-1.5" style={{ width: `${(c.sessions / analyticsData.topCountries[0].sessions) * 100}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-12 text-right">{c.sessions.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {analyticsTab === "browsers" && (
                <div className="space-y-2">
                  {analyticsData.topBrowsers.map((b) => (
                    <div key={b.browser} className="flex items-center justify-between">
                      <span className="text-xs text-gray-700">{b.browser}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-[#3ea6c9] rounded-full h-1.5" style={{ width: `${b.percentage}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-8 text-right">{b.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {analyticsTab === "sources" && (
                <div className="space-y-2">
                  {analyticsData.topSources.map((s) => (
                    <div key={s.source} className="flex items-center justify-between">
                      <span className="text-xs text-gray-700">{s.source}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-[#3cb878] rounded-full h-1.5" style={{ width: `${(s.sessions / analyticsData.topSources[0].sessions) * 100}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-12 text-right">{s.sessions.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Revenue by Category */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-[#1c3f66]">Revenue by Category</h2>
              <Link href="/dashboard/admin/billing" className="text-xs text-[#1c3f66] hover:underline font-medium">View Full Report</Link>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-center gap-6">
                {/* Donut Chart */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {revenueByCategory.reduce((acc: { offset: number; elements: any[] }, cat, i) => {
                      const colors = ["#1c3f66", "#3cb878", "#e08a1e", "#e6427a"];
                      const circumference = 2 * Math.PI * 14;
                      const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                      acc.elements.push(
                        <circle key={cat.category} cx="18" cy="18" r="14" fill="none"
                          stroke={colors[i]} strokeWidth="3.5"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={-acc.offset}
                          className="transition-all duration-500"
                        />
                      );
                      acc.offset += (cat.percentage / 100) * circumference;
                      return acc;
                    }, { offset: 0, elements: [] }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#1c3f66]">
                      ${revenueByCategory.reduce((s, c) => s + c.revenue, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                {/* Legend */}
                <div className="space-y-2 flex-1">
                  {revenueByCategory.map((cat, i) => {
                    const colors = ["#1c3f66", "#3cb878", "#e08a1e", "#e6427a"];
                    return (
                      <div key={cat.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i] }} />
                          <span className="text-xs text-gray-600">{cat.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-gray-800">${cat.revenue.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 ml-1">({cat.percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* MarketConnect */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-[#1c3f66]">MarketConnect</h2>
              <Link href="/dashboard/marketplace" className="text-xs text-[#1c3f66] hover:underline font-medium">Browse Marketplace</Link>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {marketConnect.map((m) => (
                <Link key={m.name} href="/dashboard/marketplace"
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
                  <div className={`w-10 h-10 ${m.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{m.icon}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700 group-hover:text-[#1c3f66]">{m.name}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{m.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Automation Status */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
              <h3 className="font-semibold text-xs text-[#1c3f66] uppercase tracking-wider">Automation</h3>
              <span className="w-2 h-2 rounded-full bg-[#3cb878]" />
            </div>
            <div className="divide-y divide-gray-100">
              {automationTasks.map((t) => (
                <div key={t.name} className="px-4 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-700">{t.name}</p>
                    <span className={`text-[10px] font-medium ${t.statusColor}`}>{t.status}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{t.lastRun}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Support Feed */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <h3 className="font-semibold text-xs text-[#1c3f66] uppercase tracking-wider">Support</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {supportFeed.map((t) => (
                <div key={t.ticket} className="px-4 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-700">{t.subject}</p>
                    <span className={`text-[10px] font-medium ${t.statusColor}`}>{t.status}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{t.ticket}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <h3 className="font-semibold text-xs text-[#1c3f66] uppercase tracking-wider">Billing</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="px-4 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-700">{inv.id}</p>
                    <p className="text-[10px] text-gray-400">{inv.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-[#1c3f66]">{inv.amount}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${inv.statusColor}`}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* To-Do */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
              <h3 className="font-semibold text-xs text-[#1c3f66] uppercase tracking-wider">To-Do</h3>
              <span className="text-[10px] text-gray-400">{toDoItems.length}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {toDoItems.map((t, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-[#1c3f66] focus:ring-[#1c3f66]" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-700">{t.task}</p>
                  </div>
                  <span className={`text-[10px] font-medium ${t.priorityColor}`}>{t.priority}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Network Status */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <h3 className="font-semibold text-xs text-[#1c3f66] uppercase tracking-wider">Network Status</h3>
            </div>
            <div className="p-4 space-y-2">
              {networkStatus.map((n) => (
                <div key={n.name} className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">{n.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${n.color}`} />
                    <span className="text-[10px] font-medium text-gray-500">{n.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <h3 className="font-semibold text-xs text-[#1c3f66] uppercase tracking-wider">System Health</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">CPU</span>
                  <span className="text-gray-700 font-medium">42%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#3cb878] rounded-full h-1.5" style={{ width: "42%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Memory</span>
                  <span className="text-gray-700 font-medium">68%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#e08a1e] rounded-full h-1.5" style={{ width: "68%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Disk</span>
                  <span className="text-gray-700 font-medium">55%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#3ea6c9] rounded-full h-1.5" style={{ width: "55%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
