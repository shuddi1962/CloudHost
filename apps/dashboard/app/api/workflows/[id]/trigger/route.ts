import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();

    const { data: workflow, error: fetchError } = await supabase
      .from("workflows")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (fetchError || !workflow) throw new ApiError(404, "Workflow not found");

    const { error } = await supabase
      .from("workflows")
      .update({ last_run_at: new Date().toISOString() })
      .eq("id", params.id)
      .eq("user_id", userId);
    if (error) throw error;

    return NextResponse.json({ success: true, triggered_at: new Date().toISOString() });
  } catch (error) {
    return handleApiError(error);
  }
}
