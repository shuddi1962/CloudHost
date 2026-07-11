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
      .from("deployments")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (error || !data) throw new ApiError(404, "Deployment not found");
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
    if (body.framework !== undefined) allowed.framework = body.framework;
    if (body.region !== undefined) allowed.region = body.region;
    if (body.plan !== undefined) allowed.plan = body.plan;
    if (body.node_version !== undefined) allowed.node_version = body.node_version;
    if (body.php_version !== undefined) allowed.php_version = body.php_version;
    if (body.build_command !== undefined) allowed.build_command = body.build_command;
    if (body.output_directory !== undefined) allowed.output_directory = body.output_directory;
    if (body.install_command !== undefined) allowed.install_command = body.install_command;
    if (body.env_vars !== undefined) allowed.env_vars = body.env_vars;
    if (body.status !== undefined) allowed.status = body.status;
    allowed.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("deployments")
      .update(allowed)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error || !data) throw new ApiError(404, "Deployment not found");
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
    const { data: deployment, error: fetchError } = await supabase
      .from("deployments")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (fetchError || !deployment) throw new ApiError(404, "Deployment not found");

    const { error } = await supabase
      .from("deployments")
      .delete()
      .eq("id", params.id)
      .eq("user_id", userId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
