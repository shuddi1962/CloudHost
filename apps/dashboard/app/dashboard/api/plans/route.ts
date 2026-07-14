import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let svcRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
    const jwtMatch = svcRole.match(/eyJ[a-zA-Z0-9_-]+?\.[a-zA-Z0-9_-]+?\.[a-zA-Z0-9_-]+/);
    if (jwtMatch) svcRole = jwtMatch[0];
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      svcRole,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    let query = supabase.from("plans").select("*");

    if (category) {
      query = query.eq("category", category).order("your_price_usd", { ascending: true });
    } else {
      query = query.order("category").order("your_price_usd", { ascending: true });
    }

    const { data, error } = await query;

    if (error) throw error;

    if (category) {
      return NextResponse.json({ plans: data });
    }

    const grouped: Record<string, any[]> = {};
    for (const plan of data) {
      const cat = plan.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(plan);
    }

    return NextResponse.json({ plans: grouped });
  } catch (error: any) {
    console.error("Failed to load plans:", error);
    return NextResponse.json({ error: "Failed to load plans", details: error.message }, { status: 500 });
  }
}
