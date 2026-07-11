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
      .from("email_accounts")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (error || !data) throw new ApiError(404, "Email account not found");
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
    if (body.forward_to !== undefined) allowed.forward_to = body.forward_to;
    if (body.auto_reply !== undefined) allowed.auto_reply = body.auto_reply;
    if (body.auto_reply_message !== undefined) allowed.auto_reply_message = body.auto_reply_message;
    if (body.spam_filter !== undefined) allowed.spam_filter = body.spam_filter;
    allowed.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("email_accounts")
      .update(allowed)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error || !data) throw new ApiError(404, "Email account not found");
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

    const { data: account, error: fetchError } = await supabase
      .from("email_accounts")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (fetchError || !account) throw new ApiError(404, "Email account not found");

    const { error } = await supabase
      .from("email_accounts")
      .update({ status: "deleted", updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .eq("user_id", userId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
