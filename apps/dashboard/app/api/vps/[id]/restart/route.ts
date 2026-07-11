import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";
import { ProvisioningEngine } from "@/lib/provisioning-engine";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data: instance, error: fetchError } = await supabase
      .from("instances")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (fetchError || !instance) throw new ApiError(404, "Instance not found");

    await ProvisioningEngine.setInstanceStatus(params.id, "stopped");
    setTimeout(async () => {
      await ProvisioningEngine.setInstanceStatus(params.id, "running");
    }, 3000);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
