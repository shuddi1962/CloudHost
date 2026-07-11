import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("deployments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const {
      name, type, framework, region, plan,
      node_version, php_version, build_command,
      output_directory, install_command, env_vars,
    } = body;

    if (!name) throw new ApiError(400, "Missing required field: name");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("deployments")
      .insert({
        user_id: userId,
        name,
        type: type || "git",
        framework: framework || null,
        region: region || null,
        plan: plan || null,
        node_version: node_version || null,
        php_version: php_version || null,
        build_command: build_command || null,
        output_directory: output_directory || null,
        install_command: install_command || null,
        env_vars: env_vars || null,
        status: "created",
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
