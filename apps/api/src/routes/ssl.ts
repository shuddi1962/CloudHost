import { Hono } from "hono";
import { db } from "@cloudhost/db";

export const sslRouter = new Hono();

sslRouter.post("/install-le", async (c) => {
  const { domain } = await c.req.json();
  return c.json({ message: `Let's Encrypt certificate being provisioned for ${domain}`, status: "processing" });
});

sslRouter.post("/purchase", async (c) => {
  const { type, domain } = await c.req.json();
  return c.json({ message: `${type} certificate order initiated for ${domain}`, status: "pending" });
});

sslRouter.get("/status/:domain", async (c) => {
  const domain = c.req.param("domain");
  return c.json({ domain, status: "active", expiresAt: "2027-07-10", issuer: "Let's Encrypt" });
});
