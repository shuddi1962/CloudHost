import { eq, and, asc, sql } from "drizzle-orm";
import { db } from "../db-instance";
import { plans, type Plan, type PlanCategory, type Provider } from "../schema/plans";

export async function getPlanPrice(
  category: PlanCategory | string,
  planName: string,
): Promise<{ usd: string; ngn: string | null } | null> {
  const [plan] = await db
    .select({
      yourPriceUsd: plans.yourPriceUsd,
      yourPriceNgn: plans.yourPriceNgn,
    })
    .from(plans)
    .where(
      and(
        eq(plans.category, category),
        eq(plans.planName, planName),
        eq(plans.isActive, true),
      ),
    )
    .limit(1);

  if (!plan) return null;
  return {
    usd: plan.yourPriceUsd,
    ngn: plan.yourPriceNgn,
  };
}

export async function getPlansByCategory(
  category: PlanCategory | string,
): Promise<Plan[]> {
  return db
    .select()
    .from(plans)
    .where(
      and(
        eq(plans.category, category),
        eq(plans.isActive, true),
      ),
    )
    .orderBy(asc(plans.yourPriceUsd));
}

export async function getAllPlansGrouped(): Promise<Record<string, Plan[]>> {
  const allPlans = await db
    .select()
    .from(plans)
    .orderBy(asc(plans.category), asc(plans.yourPriceUsd));

  return allPlans.reduce(
    (acc, plan) => {
      const cat = plan.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(plan);
      return acc;
    },
    {} as Record<string, Plan[]>,
  );
}

export async function getPlanByProviderRef(
  provider: Provider | string,
  providerRef: string,
): Promise<Plan | null> {
  const [plan] = await db
    .select()
    .from(plans)
    .where(
      and(
        eq(plans.provider, provider as any),
        eq(plans.providerRef, providerRef),
        eq(plans.isActive, true),
      ),
    )
    .limit(1);

  return plan || null;
}

export type { Plan, PlanCategory };
