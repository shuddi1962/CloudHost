import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("storage_buckets")
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
    const { name, region, public: isPublic } = body;
    if (!name) throw new ApiError(400, "Missing required field: name");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("storage_buckets")
      .insert({
        user_id: userId,
        name,
        region: region || "us-east-1",
        public: isPublic ?? false,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
