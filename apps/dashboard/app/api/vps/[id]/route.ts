import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";
import { ProvisioningEngine } from "@/lib/provisioning-engine";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("instances")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (error || !data) throw new ApiError(404, "Instance not found");
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const supabase = createClient();

    const allowed: Record<string, any> = {};
    if (body.name !== undefined) allowed.name = body.name;
    if (body.tags !== undefined) allowed.tags = body.tags;
    if (body.auto_snapshots !== undefined) allowed.auto_snapshots = body.auto_snapshots;
    allowed.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("instances")
      .update(allowed)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error || !data) throw new ApiError(404, "Instance not found");
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    await ProvisioningEngine.terminateInstance(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
