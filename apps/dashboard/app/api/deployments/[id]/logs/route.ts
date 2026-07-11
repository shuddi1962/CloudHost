import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();

    const { data: deployment, error: fetchError } = await supabase
      .from("deployments")
      .select("id, build_log")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (fetchError || !deployment) throw new ApiError(404, "Deployment not found");

    return NextResponse.json({ build_log: deployment.build_log || "" });
  } catch (error) {
    return handleApiError(error);
  }
}
