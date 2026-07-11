import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try { const { userId } = await requireAuth(); const supabase = createClient();
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    return NextResponse.json(data || {});
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(request: NextRequest) {
  try { const { userId } = await requireAuth(); const body = await request.json(); const supabase = createClient();
    const { data, error } = await supabase.from("profiles").upsert({ id: userId, ...body, updated_at: new Date().toISOString() }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (e) { return handleApiError(e); }
}
