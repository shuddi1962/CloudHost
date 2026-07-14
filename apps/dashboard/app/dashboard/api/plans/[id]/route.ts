import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getClient() {
  let svcRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const jwtMatch = svcRole.match(/eyJ[a-zA-Z0-9_-]+?\.[a-zA-Z0-9_-]+?\.[a-zA-Z0-9_-]+/);
  if (jwtMatch) svcRole = jwtMatch[0];
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    svcRole,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = getClient();

    const allowedFields: Record<string, any> = {};
    if (body.planName !== undefined) allowedFields.plan_name = body.planName;
    if (body.category !== undefined) allowedFields.category = body.category;
    if (body.provider !== undefined) allowedFields.provider = body.provider;
    if (body.providerRef !== undefined) allowedFields.provider_ref = body.providerRef;
    if (body.providerCostUsd !== undefined) allowedFields.provider_cost_usd = body.providerCostUsd;
    if (body.yourPriceUsd !== undefined) allowedFields.your_price_usd = body.yourPriceUsd;
    if (body.yourPriceNgn !== undefined) allowedFields.your_price_ngn = body.yourPriceNgn;
    if (body.specs !== undefined) allowedFields.specs = body.specs;
    if (body.isActive !== undefined) allowedFields.is_active = body.isActive;
    allowedFields.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("plans")
      .update(allowedFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    return NextResponse.json({ plan: data });
  } catch (error: any) {
    console.error("Failed to update plan:", error);
    return NextResponse.json({ error: "Failed to update plan", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getClient();

    const { data, error } = await supabase
      .from("plans")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    return NextResponse.json({ message: "Plan deleted" });
  } catch (error: any) {
    console.error("Failed to delete plan:", error);
    return NextResponse.json({ error: "Failed to delete plan", details: error.message }, { status: 500 });
  }
}
