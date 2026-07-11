import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const { status } = body;
    if (!status || !["open", "acknowledged", "resolved"].includes(status)) {
      throw new ApiError(400, "Invalid status. Must be open, acknowledged, or resolved");
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("alerts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error || !data) throw new ApiError(404, "Alert not found");
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data: alert, error: fetchError } = await supabase
      .from("alerts")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (fetchError || !alert) throw new ApiError(404, "Alert not found");

    const { error } = await supabase
      .from("alerts")
      .delete()
      .eq("id", params.id)
      .eq("user_id", userId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
