import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db, authProviders, socialLogins } from "@cloudhost/db";

export const authProvidersRouter = new Hono();

const providerDefaults: Record<string, { name: string; icon: string; color: string; docsUrl: string }> = {
  google: { name: "Google", icon: "G", color: "bg-red-500", docsUrl: "https://console.cloud.google.com" },
  github: { name: "GitHub", icon: "GH", color: "bg-gray-800", docsUrl: "https://github.com/settings/developers" },
  gitlab: { name: "GitLab", icon: "GL", color: "bg-orange-600", docsUrl: "https://gitlab.com/-/profile/applications" },
  bitbucket: { name: "Bitbucket", icon: "BB", color: "bg-blue-600", docsUrl: "https://bitbucket.org/account/settings/app-passwords/" },
  facebook: { name: "Facebook", icon: "FB", color: "bg-blue-700", docsUrl: "https://developers.facebook.com" },
  twitter: { name: "Twitter/X", icon: "X", color: "bg-black", docsUrl: "https://developer.twitter.com" },
  apple: { name: "Apple", icon: "A", color: "bg-gray-900", docsUrl: "https://developer.apple.com" },
  discord: { name: "Discord", icon: "DC", color: "bg-indigo-600", docsUrl: "https://discord.com/developers/applications" },
  slack: { name: "Slack", icon: "S", color: "bg-green-600", docsUrl: "https://api.slack.com/apps" },
  microsoft: { name: "Microsoft", icon: "MS", color: "bg-blue-600", docsUrl: "https://portal.azure.com" },
  linkedin: { name: "LinkedIn", icon: "LI", color: "bg-blue-800", docsUrl: "https://www.linkedin.com/developers" },
  saml: { name: "SAML 2.0", icon: "SAML", color: "bg-purple-600", docsUrl: "" },
  oidc: { name: "OpenID Connect", icon: "OIDC", color: "bg-cyan-600", docsUrl: "" },
};

authProvidersRouter.get("/providers-info", async (c) => {
  return c.json({ providers: providerDefaults });
});

authProvidersRouter.get("/organization/:orgId", async (c) => {
  const orgId = c.req.param("orgId");
  const providers = await db.select().from(authProviders).where(eq(authProviders.organizationId, orgId));
  return c.json({ providers });
});

authProvidersRouter.post("/configure", async (c) => {
  const body = await c.req.json();

  const existing = await db.select().from(authProviders)
    .where(and(eq(authProviders.organizationId, body.organizationId), eq(authProviders.provider, body.provider)))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db.update(authProviders)
      .set({
        enabled: body.enabled ?? existing[0].enabled,
        clientId: body.clientId ?? existing[0].clientId,
        clientSecret: body.clientSecret ?? existing[0].clientSecret,
        redirectUrl: body.redirectUrl ?? existing[0].redirectUrl,
        additionalConfig: body.additionalConfig ?? existing[0].additionalConfig,
        updatedAt: new Date(),
      })
      .where(eq(authProviders.id, existing[0].id))
      .returning();
    return c.json({ provider: updated });
  }

  const [created] = await db.insert(authProviders).values({
    organizationId: body.organizationId,
    provider: body.provider,
    enabled: body.enabled ?? true,
    clientId: body.clientId,
    clientSecret: body.clientSecret,
    redirectUrl: body.redirectUrl,
    additionalConfig: body.additionalConfig || {},
  }).returning();
  return c.json({ provider: created }, 201);
});

authProvidersRouter.post("/:id/toggle", async (c) => {
  const id = c.req.param("id");
  const [provider] = await db.select().from(authProviders).where(eq(authProviders.id, id)).limit(1);
  if (!provider) return c.json({ error: "Not found" }, 404);
  const [updated] = await db.update(authProviders)
    .set({ enabled: !provider.enabled, updatedAt: new Date() })
    .where(eq(authProviders.id, id))
    .returning();
  return c.json({ provider: updated });
});

authProvidersRouter.get("/social-logins/:userId", async (c) => {
  const userId = c.req.param("userId");
  const logins = await db.select().from(socialLogins).where(eq(socialLogins.userId, userId));
  return c.json({ socialLogins: logins });
});

authProvidersRouter.post("/social-login", async (c) => {
  const body = await c.req.json();
  const [login] = await db.insert(socialLogins).values({
    userId: body.userId,
    provider: body.provider,
    providerUserId: body.providerUserId,
    email: body.email,
    avatarUrl: body.avatarUrl,
  }).returning();
  return c.json({ socialLogin: login }, 201);
});

authProvidersRouter.delete("/social-login/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(socialLogins).where(eq(socialLogins.id, id));
  return c.json({ success: true });
});

authProvidersRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(authProviders).where(eq(authProviders.id, id));
  return c.json({ success: true });
});
