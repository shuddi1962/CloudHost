"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/whmcs`;

const defaultStatCards = [
  { label: "Services", value: "4", href: "/dashboard/projects", borderColor: "border-l-[#3cb878]", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
  { label: "Domains", value: "3", href: "/dashboard/domains", borderColor: "border-l-[#e08a1e]", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
  { label: "Tickets", value: "2", href: "/dashboard/services/support-tickets", borderColor: "border-l-[#e6427a]", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { label: "Invoices", value: "1", href: "/dashboard/billing", borderColor: "border-l-[#e2372f]", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

const cpanelTools = [
  { label: "File Manager", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", href: "/dashboard/whmcs/files" },
  { label: "Databases", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", href: "/dashboard/databases" },
  { label: "Domains", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9", href: "/dashboard/domains" },
  { label: "Email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", href: "/dashboard/email" },
  { label: "FTP", icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", href: "/dashboard/ftp-accounts" },
  { label: "SSL/TLS", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", href: "/dashboard/ssl" },
  { label: "Backups", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", href: "/dashboard/backups" },
  { label: "Cron Jobs", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", href: "/dashboard/cron-jobs" },
  { label: "PHP Settings", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", href: "/dashboard/php-settings" },
  { label: "WordPress", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 12a1 1 0 000 2h6a1 1 0 100-2H9z", href: "/dashboard/wordpress" },
  { label: "Application Manager", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z", href: "/dashboard/app-catalog" },
  { label: "Metrics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", href: "/dashboard/monitoring" },
];

const priorityBadge = (p: string) => {
  const colors: Record<string, string> = { High: "bg-red-100 text-red-700", Medium: "bg-yellow-100 text-yellow-700", Low: "bg-blue-100 text-blue-700" };
  return colors[p] || "bg-gray-100 text-gray-700";
};

export default function WhmcsUserPage() {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainSearch, setDomainSearch] = useState("");

  const [services, setServices] = useState([
    { name: "Business Hosting", plan: "Business", domain: "acme.com", status: "Active", nextDue: "Aug 15, 2026", amount: "$24.99/mo" },
    { name: "cPanel License", plan: "Pro", domain: "cpanel.acme.com", status: "Active", nextDue: "Aug 20, 2026", amount: "$15.99/mo" },
    { name: "SSL Certificate", plan: "PositiveSSL", domain: "acme.com", status: "Active", nextDue: "Sep 01, 2026", amount: "$9.99/yr" },
    { name: "Domain Registration", plan: "acme.com", domain: "acme.com", status: "Active", nextDue: "Jan 15, 2027", amount: "$12.99/yr" },
  ]);
  const [tickets, setTickets] = useState([
    { id: "#TKT-2841", subject: "Cannot access cPanel - 403 error", priority: "High", status: "Open", lastUpdated: "2 hours ago", statusColor: "bg-[#e6427a]" },
    { id: "#TKT-2840", subject: "SSL certificate renewal failed", priority: "Medium", status: "Awaiting Reply", lastUpdated: "1 day ago", statusColor: "bg-[#e08a1e]" },
    { id: "#TKT-2839", subject: "How to set up email forwarding", priority: "Low", status: "Closed", lastUpdated: "3 days ago", statusColor: "bg-gray-400" },
  ]);
  const [announcements, setAnnouncements] = useState([
    { title: "New Data Center in Singapore Now Live", date: "Jul 8, 2026", excerpt: "We're excited to announce our newest data center location in Singapore, providing faster speeds for APAC customers." },
    { title: "Scheduled Maintenance: July 15, 2026", date: "Jul 5, 2026", excerpt: "Planned maintenance on our core networking infrastructure from 2:00 AM - 4:00 AM EST." },
    { title: "Introducing the New Site Builder", date: "Jun 28, 2026", excerpt: "Build beautiful websites with our new drag-and-drop site builder, now available on all hosting plans." },
  ]);
  const [statCards, setStatCards] = useState(defaultStatCards);
  const [overdueInvoices, setOverdueInvoices] = useState<{ id: string; amount: number; dueDate: string }[]>([
    { id: "INV-2024", amount: 24.99, dueDate: "Jul 10, 2026" },
  ]);
  const [expiringDomains, setExpiringDomains] = useState<{ domain: string; expires: string; daysLeft: number }[]>([
    { domain: "acme.com", expires: "Aug 15, 2026", daysLeft: 34 },
    { domain: "shop.acme.com", expires: "Sep 01, 2026", daysLeft: 51 },
    { domain: "api.acme.com", expires: "Jul 28, 2026", daysLeft: 16 },
  ]);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; date: string }[]>([]);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));

    fetch(`${API}/dashboard`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          const u = data.user;
          setStatCards([
            { label: "Services", value: String(u.services ?? 4), href: "/dashboard/projects", borderColor: "border-l-[#3cb878]", icon: defaultStatCards[0].icon },
            { label: "Domains", value: String(u.domains ?? 3), href: "/dashboard/domains", borderColor: "border-l-[#e08a1e]", icon: defaultStatCards[1].icon },
            { label: "Tickets", value: String(u.tickets ?? 2), href: "/dashboard/services/support-tickets", borderColor: "border-l-[#e6427a]", icon: defaultStatCards[2].icon },
            { label: "Invoices", value: String(u.invoices ?? 1), href: "/dashboard/billing", borderColor: "border-l-[#e2372f]", icon: defaultStatCards[3].icon },
          ]);
          if (u.activeServices) setServices(u.activeServices);
          if (u.recentTickets) setTickets(u.recentTickets.map((t: any) => ({ ...t, statusColor: t.status === "Open" ? "bg-[#e6427a]" : t.status === "Awaiting Reply" ? "bg-[#e08a1e]" : "bg-gray-400" })));
          if (u.announcements) setAnnouncements(u.announcements);
          if (u.overdueInvoices) setOverdueInvoices(u.overdueInvoices);
          if (u.expiringDomains) setExpiringDomains(u.expiringDomains);
          if (u.attachedFiles) setAttachedFiles(u.attachedFiles);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5 text-[13px]">
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-[#1c3f66] to-[#2b5a8a] text-white rounded-lg px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
          <p className="text-sm"><strong>New Data Center!</strong> Our Singapore location is now live — faster speeds for APAC customers.</p>
        </div>
        <button className="text-white/70 hover:text-white text-xs font-medium flex-shrink-0">Dismiss</button>
      </div>

      {/* Welcome + Knowledgebase Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#1c3f66]">Welcome back, {user?.name || "Client"}!</h1>
          <p className="text-gray-500 text-xs mt-0.5">{user?.email || "client@example.com"} · <span className="text-[#3cb878] font-medium">Active</span></p>
        </div>
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text" placeholder="Search the knowledgebase..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20 focus:border-[#1c3f66]"
          />
        </div>
      </div>

      {/* Overdue Invoice Alert */}
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        <div className="text-sm text-red-800">
          <strong>1 overdue invoice.</strong> Please pay invoice <Link href="/dashboard/billing" className="underline font-medium">#INV-2024</Link> for $24.99 to avoid service interruption.
        </div>
        <Link href="/dashboard/billing" className="ml-auto text-xs font-medium text-red-600 hover:text-red-800 border border-red-300 rounded px-3 py-1 hover:bg-red-100 flex-shrink-0">Pay Now</Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href} className={`bg-white rounded-lg border border-gray-200 border-l-4 ${s.borderColor} p-4 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{s.label}</p>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} /></svg>
            </div>
            <p className="text-2xl font-bold text-[#1c3f66]">{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Domain Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#e08a1e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="font-medium text-sm text-[#1c3f66]">Register a New Domain</span>
          </div>
          <div className="flex-1 flex gap-2 w-full sm:w-auto">
            <input
              type="text" placeholder="Enter your domain name..."
              value={domainSearch} onChange={(e) => setDomainSearch(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1c3f66]/20 focus:border-[#1c3f66]"
            />
            <select className="px-3 py-1.5 border border-gray-200 rounded text-sm bg-white">
              <option>.com - $12.99</option><option>.net - $11.99</option><option>.org - $10.99</option><option>.io - $29.99</option>
            </select>
            <button className="px-4 py-1.5 bg-[#3cb878] text-white rounded text-sm font-medium hover:bg-[#2da066] transition-colors flex-shrink-0">Search</button>
          </div>
        </div>
      </div>

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-3 space-y-5">
          {/* cPanel-style Tool Grid */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
              <Link href="/dashboard/whmcs/cpanel" className="font-semibold text-sm text-[#1c3f66] hover:underline">Quick Tools</Link>
              <Link href="/dashboard/whmcs/cpanel" className="text-[10px] text-[#1c3f66] hover:underline font-medium">All cPanel Tools →</Link>
            </div>
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {cpanelTools.map((tool) => (
                <Link key={tool.label} href={tool.href}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-gray-50 hover:border-gray-200 border border-transparent transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-[#1c3f66]/10 group-hover:text-[#1c3f66] transition-colors">
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-[#1c3f66]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tool.icon} /></svg>
                  </div>
                  <span className="text-[11px] text-gray-600 group-hover:text-[#1c3f66] font-medium text-center">{tool.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Active Services */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-[#1c3f66]">Active Services</h2>
              <Link href="/dashboard/projects" className="text-xs text-[#1c3f66] hover:underline font-medium">View All</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {services.map((s) => (
                <div key={s.name} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#3cb878]" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.domain} · {s.plan}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Next Due: {s.nextDue}</p>
                      <p className="text-sm font-medium text-[#1c3f66]">{s.amount}</p>
                    </div>
                    <Link href={"/dashboard/projects"} className="text-xs text-[#1c3f66] hover:underline font-medium">Manage</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Tickets */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-[#1c3f66]">Support Tickets</h2>
              <Link href="/dashboard/services/support-tickets" className="text-xs text-[#1c3f66] hover:underline font-medium">Open New Ticket</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {tickets.map((t) => (
                <Link key={t.id} href="/dashboard/services/support-tickets" className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${t.statusColor} flex-shrink-0`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.subject}</p>
                      <p className="text-xs text-gray-500">{t.id} · {t.lastUpdated}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${priorityBadge(t.priority)}`}>{t.priority}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      t.status === "Open" ? "bg-[#e6427a]/10 text-[#e6427a]" :
                      t.status === "Awaiting Reply" ? "bg-[#e08a1e]/10 text-[#e08a1e]" :
                      "bg-gray-100 text-gray-500"
                    }`}>{t.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-[#1c3f66]">Announcements</h2>
              <Link href="/dashboard/services/knowledgebase" className="text-xs text-[#1c3f66] hover:underline font-medium">View All</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {announcements.map((a) => (
                <div key={a.title} className="px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-gray-800">{a.title}</p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{a.date}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{a.excerpt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Domains Expiring Soon */}
          {expiringDomains.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                <h2 className="font-semibold text-sm text-[#1c3f66]">Domains Expiring Soon</h2>
                <Link href="/dashboard/domains" className="text-xs text-[#1c3f66] hover:underline font-medium">Renew Now</Link>
              </div>
              <div className="divide-y divide-gray-100">
                {expiringDomains.map((d) => (
                  <div key={d.domain} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-[#e08a1e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{d.domain}</p>
                        <p className="text-xs text-gray-500">Expires: {d.expires}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${d.daysLeft <= 30 ? "bg-red-100 text-red-700" : d.daysLeft <= 90 ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                        {d.daysLeft} days
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Your Info */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <h3 className="font-semibold text-xs text-[#1c3f66] uppercase tracking-wider">Your Info</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Name</p>
                <p className="text-sm font-medium">{user?.name || "Client"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email</p>
                <p className="text-sm">{user?.email || "client@example.com"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Status</p>
                <span className="text-xs font-medium text-[#3cb878]">Active</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Account Balance</p>
                <p className="text-sm font-semibold text-[#1c3f66]">$24.99 <span className="text-xs text-red-500 font-normal">(overdue)</span></p>
              </div>
              <Link href="/dashboard/settings" className="block text-center text-xs font-medium text-[#1c3f66] border border-gray-200 rounded py-1.5 hover:bg-gray-50 transition-colors">Edit Profile</Link>
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
              <h3 className="font-semibold text-xs text-[#1c3f66] uppercase tracking-wider">Contacts</h3>
              <span className="text-[10px] text-gray-400">2</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1c3f66]/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-[#1c3f66]">JD</span>
                </div>
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-500">john@acme.com</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-500">JS</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Jane Smith</p>
                  <p className="text-xs text-gray-500">jane@acme.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Affiliate Program */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <h3 className="font-semibold text-xs text-[#1c3f66] uppercase tracking-wider">Affiliate Program</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Commission Balance</span>
                <span className="text-lg font-bold text-[#3cb878]">$124.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Pending Commissions</span>
                <span className="text-sm font-semibold text-[#e08a1e]">$32.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Referrals</span>
                <span className="text-sm font-semibold text-[#1c3f66]">7</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#3cb878] rounded-full h-2" style={{ width: "41.5%" }} />
              </div>
              <p className="text-[10px] text-gray-400 text-center">$124.50 of $300.00 payout threshold</p>
              <Link href="/dashboard/services/affiliates" className="block text-center text-xs font-medium text-white bg-[#3cb878] rounded py-1.5 hover:bg-[#2da066] transition-colors">View Affiliate Page</Link>
            </div>
          </div>

          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
                <h3 className="font-semibold text-xs text-[#1c3f66] uppercase tracking-wider">Attached Files</h3>
                <span className="text-[10px] text-gray-400">{attachedFiles.length}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {attachedFiles.map((f) => (
                  <div key={f.name} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{f.name}</p>
                      <p className="text-[10px] text-gray-400">{f.size} · {f.date}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-gray-300 hover:text-[#1c3f66] cursor-pointer flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shortcuts */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <h3 className="font-semibold text-xs text-[#1c3f66] uppercase tracking-wider">Shortcuts</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { label: "Submit Ticket", href: "/dashboard/services/support-tickets", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
                { label: "Make Payment", href: "/dashboard/billing", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                { label: "Affiliates", href: "/dashboard/services/affiliates", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" },
              ].map((s) => (
                <Link key={s.label} href={s.href} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} /></svg>
                  <span className="text-sm text-gray-700">{s.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
