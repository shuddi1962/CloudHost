import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError, ApiError } from "@/lib/api-error";
import { ProvisioningEngine } from "@/lib/provisioning-engine";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data } = await supabase.from("container_services").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return NextResponse.json(data || []);
  } catch (e) { return handleApiError(e); }
}

const NODE_PRICES: Record<string, number> = { light: 5, standard: 10, plus: 20, pro: 40, max: 80 };

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const { name, region, nodeSize, nodeCount } = body;
    if (!name || !region || !nodeSize || !nodeCount) {
      throw new ApiError(400, "Missing required fields: name, region, nodeSize, nodeCount");
    }
    const pricePerNode = NODE_PRICES[nodeSize] || 10;
    const service = await ProvisioningEngine.provisionContainerService(
      userId, name, region, nodeSize, nodeCount, "", [], {}, true
    );
    return NextResponse.json(service, { status: 201 });
  } catch (e) { return handleApiError(e); }
}
