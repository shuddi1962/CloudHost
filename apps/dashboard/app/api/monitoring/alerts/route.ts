import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("alerts")
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
    const { type, severity, message, resource_type, resource_id } = body;
    if (!type || !severity || !message) {
      throw new ApiError(400, "Missing required fields: type, severity, message");
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("alerts")
      .insert({
        user_id: userId,
        type,
        severity,
        message,
        resource_type: resource_type || null,
        resource_id: resource_id || null,
        status: "open",
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
