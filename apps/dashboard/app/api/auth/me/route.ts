import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const { userId } = await requireAuth();

    const supabase = createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw new ApiError(401, userError.message);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw new ApiError(500, profileError.message);
    }

    return NextResponse.json({ user, profile: profile ?? null });
  } catch (error) {
    return handleApiError(error);
  }
}
