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
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (error || !data) throw new ApiError(404, "Domain not found");
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const supabase = createClient();

    const allowed: Record<string, unknown> = {};
    if (body.auto_renew !== undefined) allowed.auto_renew = body.auto_renew;
    if (body.privacy_enabled !== undefined) allowed.privacy_enabled = body.privacy_enabled;
    if (body.locked !== undefined) allowed.locked = body.locked;
    allowed.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("domains")
      .update(allowed)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error || !data) throw new ApiError(404, "Domain not found");
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
    const { data: domain, error: fetchError } = await supabase
      .from("domains")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (fetchError || !domain) throw new ApiError(404, "Domain not found");

    const { error } = await supabase
      .from("domains")
      .delete()
      .eq("id", params.id)
      .eq("user_id", userId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
