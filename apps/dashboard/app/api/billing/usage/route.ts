import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

const planLimits: Record<string, Record<string, number>> = {
  free: { instances: 1, deployments: 5, databases: 1, storage_gb: 1, domains: 1 },
  starter: { instances: 5, deployments: 25, databases: 5, storage_gb: 10, domains: 5 },
  pro: { instances: 25, deployments: 100, databases: 25, storage_gb: 50, domains: 25 },
  business: { instances: 100, deployments: 500, databases: 100, storage_gb: 250, domains: 100 },
  enterprise: { instances: -1, deployments: -1, databases: -1, storage_gb: 1024, domains: -1 },
};

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    const planId = sub?.plan_id || "free";
    const limits = planLimits[planId] || planLimits.free;
    const [
      { count: instances },
      { count: deployments },
      { count: databases },
      { count: domains },
    ] = await Promise.all([
      supabase.from("instances").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("deployments").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("databases").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("domains").select("*", { count: "exact", head: true }).eq("user_id", userId),
    ]);
    const storageUsed = 0;
    return NextResponse.json({
      plan: planId,
      limits,
      usage: {
        instances: instances || 0,
        deployments: deployments || 0,
        databases: databases || 0,
        storage_gb: storageUsed,
        domains: domains || 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
