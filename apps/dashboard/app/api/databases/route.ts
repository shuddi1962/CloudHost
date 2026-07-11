import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";
import { ProvisioningEngine } from "@/lib/provisioning-engine";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("databases")
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
    const { name, type, version, region } = body;
    if (!name || !type || !version || !region) {
      throw new ApiError(400, "Missing required fields: name, type, version, region");
    }
    const database = await ProvisioningEngine.provisionDatabase(userId, name, type, version, region);
    return NextResponse.json(database, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
