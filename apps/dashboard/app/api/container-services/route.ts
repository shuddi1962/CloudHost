import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data } = await supabase.from("container_services").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return NextResponse.json(data || []);
  } catch (e) { return handleApiError(e); }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const supabase = createClient();

    const powerPrices: Record<string, number> = { nano: 7, micro: 15, small: 30, medium: 55, large: 100, xlarge: 160 };
    const price = powerPrices[body.power] || 7;

    const { data, error } = await supabase.from("container_services").insert({
      user_id: userId,
      name: body.name,
      region: body.region || "eu-west-3",
      power: body.power || "nano",
      scale: body.scale || 1,
      status: "provisioning",
      price_monthly: price * (body.scale || 1),
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    setTimeout(async () => {
      await supabase.from("container_services").update({
        status: "running",
        default_domain: `${body.name}.containers.cloudhost.app`,
      }).eq("id", data.id);
    }, 5000);

    return NextResponse.json(data, { status: 201 });
  } catch (e) { return handleApiError(e); }
}
