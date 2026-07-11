import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    if (!file) throw new ApiError(400, "Missing required field: file");

    const name = formData.get("name") as string;
    if (!name) throw new ApiError(400, "Missing required field: name");

    const framework = formData.get("framework") as string | null;
    const buildCommand = formData.get("build_command") as string | null;
    const outputDirectory = formData.get("output_directory") as string | null;
    const installCommand = formData.get("install_command") as string | null;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("deployments")
      .insert({
        user_id: userId,
        name,
        type: "upload",
        framework: framework || null,
        build_command: buildCommand || null,
        output_directory: outputDirectory || null,
        install_command: installCommand || null,
        status: "created",
        metadata: {
          file_size: file.size,
          file_name: file.name,
          file_type: file.type,
        },
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
