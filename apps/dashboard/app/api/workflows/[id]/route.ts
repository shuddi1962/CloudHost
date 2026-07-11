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
      .from("workflows")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (error || !data) throw new ApiError(404, "Workflow not found");
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
    if (body.name !== undefined) allowed.name = body.name;
    if (body.description !== undefined) allowed.description = body.description;
    if (body.trigger !== undefined) allowed.trigger = body.trigger;
    if (body.schedule !== undefined) allowed.schedule = body.schedule;
    if (body.steps !== undefined) allowed.steps = body.steps;
    if (body.enabled !== undefined) allowed.enabled = body.enabled;
    allowed.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("workflows")
      .update(allowed)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error || !data) throw new ApiError(404, "Workflow not found");
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

    const { data: workflow, error: fetchError } = await supabase
      .from("workflows")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (fetchError || !workflow) throw new ApiError(404, "Workflow not found");

    const { error } = await supabase
      .from("workflows")
      .delete()
      .eq("id", params.id)
      .eq("user_id", userId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
