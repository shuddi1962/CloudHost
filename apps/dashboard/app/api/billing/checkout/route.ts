import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

const plans = [
  { id: "free", name: "Free", price: 0 },
  { id: "starter", name: "Starter", price: 19 },
  { id: "pro", name: "Pro", price: 49 },
  { id: "business", name: "Business", price: 149 },
  { id: "enterprise", name: "Enterprise", price: 499 },
];

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const { plan_id } = body;
    if (!plan_id) throw new ApiError(400, "Missing required field: plan_id");
    const plan = plans.find((p) => p.id === plan_id);
    if (!plan) throw new ApiError(400, `Invalid plan_id: ${plan_id}`);
    const supabase = createClient();
    const now = new Date();
    const nextBilling = new Date(now);
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    let subscription;
    if (existing) {
      const { data, error } = await supabase
        .from("subscriptions")
        .update({
          plan_id: plan.id,
          plan_name: plan.name,
          price: plan.price,
          current_period_start: now.toISOString(),
          current_period_end: nextBilling.toISOString(),
          status: "active",
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      subscription = data;
    } else {
      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: plan.id,
          plan_name: plan.name,
          price: plan.price,
          currency: "USD",
          interval: "month",
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: nextBilling.toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      subscription = data;
    }
    const checkoutUrl = `https://checkout.cloudhost.app/session?user_id=${userId}&plan_id=${plan.id}&price=${plan.price}`;
    return NextResponse.json({ subscription, checkoutUrl }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
