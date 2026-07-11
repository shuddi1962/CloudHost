import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try { const { userId } = await requireAuth(); const supabase = createClient();
    const { data } = await supabase.from("projects").select("*").eq("id", params.id).eq("user_id", userId).single();
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 }); return NextResponse.json(data);
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try { const { userId } = await requireAuth(); const body = await request.json(); const supabase = createClient();
    const { data } = await supabase.from("projects").update(body).eq("id", params.id).eq("user_id", userId).select().single();
    return NextResponse.json(data);
  } catch (e) { return handleApiError(e); }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try { const { userId } = await requireAuth(); const supabase = createClient();
    await supabase.from("projects").delete().eq("id", params.id).eq("user_id", userId);
    return NextResponse.json({ success: true });
  } catch (e) { return handleApiError(e); }
}
