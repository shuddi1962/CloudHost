import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("backups")
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
    const { name, resource_type, resource_id, schedule, retention_days } = body;
    if (!name || !resource_type || !resource_id) {
      throw new ApiError(400, "Missing required fields: name, resource_type, resource_id");
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("backups")
      .insert({
        user_id: userId,
        name,
        resource_type,
        resource_id,
        schedule: schedule || "manual",
        retention_days: retention_days || 30,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw error;

    setTimeout(async () => {
      await supabase
        .from("backups")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", data.id);
    }, 3000);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
