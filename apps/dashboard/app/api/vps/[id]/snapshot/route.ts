import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { data, error } = await supabase
      .from("backups")
      .insert({
        resource_type: "instance",
        resource_id: params.id,
        user_id: userId,
        status: "running",
      })
      .select()
      .single();
    if (error) throw error;

    setTimeout(async () => {
      const sb = createClient();
      await sb.from("backups").update({ status: "completed" }).eq("id", data.id);
    }, 5000);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
