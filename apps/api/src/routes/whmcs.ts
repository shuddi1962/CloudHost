import { Hono } from "hono";

export const whmcsRouter = new Hono();

const WHMCS_URL = process.env.WHMCS_URL || "https://whmcs.cloudhost.app";
const WHMCS_API_ID = process.env.WHMCS_API_ID || "";
const WHMCS_API_SECRET = process.env.WHMCS_API_SECRET || "";

async function whmcsCall(action: string, params: Record<string, any> = {}) {
  const payload = {
    action,
    identifier: WHMCS_API_ID,
    secret: WHMCS_API_SECRET,
    responsetype: "json",
    ...params,
  };

  try {
    const res = await fetch(`${WHMCS_URL}/includes/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(payload),
    });
    return await res.json();
  } catch (e: any) {
    return { error: `WHMCS connection failed: ${e.message}`, localFallback: true };
  }
}

whmcsRouter.get("/status", async (c) => {
  const result = await whmcsCall("GetStats");
  return c.json({ connected: !result.localFallback, whmcsUrl: WHMCS_URL, ...result });
});

whmcsRouter.post("/client", async (c) => {
  const body = await c.req.json();
  const result = await whmcsCall("AddClient", {
    firstname: body.firstName || "CloudHost",
    lastname: body.lastName || "User",
    email: body.email,
    password2: body.password || Math.random().toString(36).slice(2, 18),
    companyname: body.company || "",
    address1: body.address || "",
    city: body.city || "",
    state: body.state || "",
    postcode: body.postcode || "",
    country: body.country || "US",
    phonenumber: body.phone || "",
    currency: body.currency || 1,
    sendemail: false,
    noemail: true,
  });

  if (result.localFallback) {
    return c.json({ clientId: Math.random().toString(36).slice(2, 10), name: body.email, message: "WHMCS not connected — simulated client creation" });
  }
  return c.json(result);
});

whmcsRouter.post("/order", async (c) => {
  const body = await c.req.json();
  const result = await whmcsCall("AddOrder", {
    clientid: body.clientId,
    pid: body.productId || 1,
    domain: body.domain || "",
    billingcycle: body.billingCycle || "monthly",
    paymentmethod: body.paymentMethod || "stripe",
    customfields: body.customFields || "",
    configoptions: body.configOptions || "",
    serverid: body.serverId || "",
    noinvoice: body.noInvoice || false,
    noinvoiceemail: true,
    noemail: true,
  });

  if (result.localFallback) {
    return c.json({ orderId: Math.random().toString(36).slice(2, 10), message: "WHMCS not connected — simulated order" });
  }
  return c.json(result);
});

whmcsRouter.get("/invoice/:id", async (c) => {
  const id = c.req.param("id");
  const result = await whmcsCall("GetInvoice", { invoiceid: id });
  return c.json(result);
});

whmcsRouter.get("/products", async (c) => {
  const result = await whmcsCall("GetProducts");
  if (result.localFallback) {
    return c.json({
      products: [
        { id: 1, name: "Starter Hosting", price: { monthly: 12 }, description: "1 website, 10GB SSD" },
        { id: 2, name: "Business Hosting", price: { monthly: 29 }, description: "10 websites, 50GB SSD" },
        { id: 3, name: "Professional Hosting", price: { monthly: 59 }, description: "Unlimited websites, 100GB SSD" },
        { id: 4, name: "Docker Deployment", price: { monthly: 19 }, description: "Run any containerized app" },
        { id: 5, name: "Managed WordPress", price: { monthly: 15 }, description: "Managed WordPress with staging" },
        { id: 6, name: "VPS Server", price: { monthly: 49 }, description: "Full root access VPS" },
      ]
    });
  }
  return c.json(result);
});

whmcsRouter.get("/clients", async (c) => {
  const result = await whmcsCall("GetClients", { limitnum: 50 });
  return c.json(result);
});

whmcsRouter.post("/ticket", async (c) => {
  const body = await c.req.json();
  const result = await whmcsCall("OpenTicket", {
    clientid: body.clientId,
    subject: body.subject,
    message: body.message,
    priority: body.priority || "Medium",
    departmentid: body.departmentId || 1,
  });
  return c.json(result);
});

whmcsRouter.get("/tickets/:clientId", async (c) => {
  const clientId = c.req.param("clientId");
  const result = await whmcsCall("GetTickets", { clientid: clientId });
  return c.json(result);
});

whmcsRouter.get("/transactions/:clientId", async (c) => {
  const clientId = c.req.param("clientId");
  const result = await whmcsCall("GetTransactions", { clientid: clientId });
  return c.json(result);
});

whmcsRouter.get("/dashboard", async (c) => {
  const stats = await whmcsCall("GetStats");
  const products = await whmcsCall("GetProducts");

  if (stats.localFallback) {
    return c.json({
      admin: {
        pendingOrders: 23,
        ticketsWaiting: 12,
        pendingCancellations: 5,
        pendingModuleActions: 8,
        ordersLast30Days: 216,
        incomeLast30Days: 10790,
        revenueByCategory: [
          { category: "Shared Hosting", revenue: 45230, percentage: 42 },
          { category: "VPS Servers", revenue: 28100, percentage: 26 },
          { category: "Domain Names", revenue: 12450, percentage: 12 },
          { category: "Other Products", revenue: 21500, percentage: 20 },
        ],
        analytics: {
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
        },
      },
      user: {
        services: 4,
        domains: 3,
        tickets: 2,
        invoices: 1,
        overdueInvoices: [
          { id: "INV-2024", amount: 24.99, dueDate: "Jul 10, 2026" },
        ],
        expiringDomains: [
          { domain: "acme.com", expires: "Jan 15, 2027", daysLeft: 187 },
          { domain: "myapp.net", expires: "Sep 22, 2026", daysLeft: 72 },
          { domain: "blog.org", expires: "Aug 5, 2026", daysLeft: 24 },
        ],
        attachedFiles: [
          { name: "Service Agreement.pdf", size: "245 KB", date: "Jun 15, 2026" },
          { name: "Welcome Pack.pdf", size: "1.2 MB", date: "Jun 1, 2026" },
        ],
        activeServices: [
          { name: "Business Hosting", plan: "Business", domain: "acme.com", nextDue: "Aug 15, 2026", amount: "$24.99/mo" },
          { name: "cPanel License", plan: "Pro", domain: "cpanel.acme.com", nextDue: "Aug 20, 2026", amount: "$15.99/mo" },
          { name: "SSL Certificate", plan: "PositiveSSL", domain: "acme.com", nextDue: "Sep 01, 2026", amount: "$9.99/yr" },
          { name: "Domain Registration", plan: "acme.com", domain: "acme.com", nextDue: "Jan 15, 2027", amount: "$12.99/yr" },
        ],
        recentTickets: [
          { id: "#TKT-2841", subject: "Cannot access cPanel - 403 error", priority: "High", status: "Open", lastUpdated: "2 hours ago" },
          { id: "#TKT-2840", subject: "SSL certificate renewal failed", priority: "Medium", status: "Awaiting Reply", lastUpdated: "1 day ago" },
          { id: "#TKT-2839", subject: "How to set up email forwarding", priority: "Low", status: "Closed", lastUpdated: "3 days ago" },
        ],
        announcements: [
          { title: "New Data Center in Singapore Now Live", date: "Jul 8, 2026", excerpt: "We're excited to announce our newest data center location in Singapore." },
          { title: "Scheduled Maintenance: July 15, 2026", date: "Jul 5, 2026", excerpt: "Planned maintenance on our core networking infrastructure." },
          { title: "Introducing the New Site Builder", date: "Jun 28, 2026", excerpt: "Build beautiful websites with our new drag-and-drop site builder." },
        ],
      },
    });
  }

  return c.json({ admin: stats, user: products });
});
