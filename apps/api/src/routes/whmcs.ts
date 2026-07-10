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
