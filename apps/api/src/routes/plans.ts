import { Hono } from "hono";
import { db, plans, eq, and, asc, getAllPlansGrouped, getPlansByCategory } from "@cloudhost/db";

export const plansRouter = new Hono();

plansRouter.get("/", async (c) => {
  const category = c.req.query("category");
  let result;

  if (category) {
    result = await getPlansByCategory(category);
  } else {
    result = await getAllPlansGrouped();
  }

  return c.json({ plans: result });
});

plansRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [plan] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  if (!plan) return c.json({ error: "Plan not found" }, 404);
  return c.json({ plan });
});

plansRouter.post("/", async (c) => {
  const body = await c.req.json();

  const [plan] = await db
    .insert(plans)
    .values({
      category: body.category,
      planName: body.planName,
      provider: body.provider,
      providerRef: body.providerRef,
      providerCostUsd: body.providerCostUsd,
      yourPriceUsd: body.yourPriceUsd,
      yourPriceNgn: body.yourPriceNgn || null,
      specs: body.specs || {},
      isActive: body.isActive !== undefined ? body.isActive : true,
    })
    .returning();

  return c.json({ plan }, 201);
});

plansRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const allowedFields: Record<string, any> = {};

  if (body.planName !== undefined) allowedFields.planName = body.planName;
  if (body.category !== undefined) allowedFields.category = body.category;
  if (body.provider !== undefined) allowedFields.provider = body.provider;
  if (body.providerRef !== undefined) allowedFields.providerRef = body.providerRef;
  if (body.providerCostUsd !== undefined) allowedFields.providerCostUsd = body.providerCostUsd;
  if (body.yourPriceUsd !== undefined) allowedFields.yourPriceUsd = body.yourPriceUsd;
  if (body.yourPriceNgn !== undefined) allowedFields.yourPriceNgn = body.yourPriceNgn;
  if (body.specs !== undefined) allowedFields.specs = body.specs;
  if (body.isActive !== undefined) allowedFields.isActive = body.isActive;
  allowedFields.updatedAt = new Date();

  const [plan] = await db
    .update(plans)
    .set(allowedFields)
    .where(eq(plans.id, id))
    .returning();

  if (!plan) return c.json({ error: "Plan not found" }, 404);
  return c.json({ plan });
});

plansRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const [plan] = await db
    .delete(plans)
    .where(eq(plans.id, id))
    .returning();

  if (!plan) return c.json({ error: "Plan not found" }, 404);
  return c.json({ message: "Plan deleted" });
});
