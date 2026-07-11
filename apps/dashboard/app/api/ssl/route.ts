import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ssl_certificates")
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
    const { domain_name } = body;
    if (!domain_name) throw new ApiError(400, "Missing required field: domain_name");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("ssl_certificates")
      .insert({
        user_id: userId,
        domain_name,
        status: "issuing",
        issued_at: null,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();
    if (error) throw error;

    setTimeout(async () => {
      await supabase
        .from("ssl_certificates")
        .update({
          status: "active",
          issued_at: new Date().toISOString(),
        })
        .eq("id", data.id);
    }, 3000);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
