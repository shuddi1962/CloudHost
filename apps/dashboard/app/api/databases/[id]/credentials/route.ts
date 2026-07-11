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
      .from("databases")
      .select("host, port, database_name, username, password")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (error || !data) throw new ApiError(404, "Database not found");

    return NextResponse.json({
      host: data.host,
      port: data.port,
      database_name: data.database_name,
      username: data.username,
      password: data.password ? "••••••••" : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
