import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";
import { ProvisioningEngine } from "@/lib/provisioning-engine";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("instances")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const { name, plan, region, blueprint, platform, tags } = body;
    if (!name || !plan || !region || !blueprint || !platform) {
      throw new ApiError(400, "Missing required fields: name, plan, region, blueprint, platform");
    }
    const instance = await ProvisioningEngine.provisionInstance(
      userId, name, plan, region, blueprint, platform, tags || []
    );
    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
