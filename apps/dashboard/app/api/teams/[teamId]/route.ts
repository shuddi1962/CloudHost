import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest, { params }: { params: { teamId: string } }) {
  try { const { userId } = await requireAuth(); const supabase = createClient();
    const { data: membership } = await supabase.from("team_members").select("id").eq("team_id", params.teamId).eq("user_id", userId).maybeSingle();
    const { data: team } = await supabase.from("teams").select("*").eq("id", params.teamId).eq("owner_id", userId).maybeSingle();
    if (!team && !membership) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { data } = await supabase.from("teams").select("*").eq("id", params.teamId).single();
    return NextResponse.json(data);
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(request: NextRequest, { params }: { params: { teamId: string } }) {
  try { const { userId } = await requireAuth(); const body = await request.json(); const supabase = createClient();
    const { data } = await supabase.from("teams").update(body).eq("id", params.teamId).eq("owner_id", userId).select().single();
    return NextResponse.json(data);
  } catch (e) { return handleApiError(e); }
}

export async function DELETE(request: NextRequest, { params }: { params: { teamId: string } }) {
  try { const { userId } = await requireAuth(); const supabase = createClient();
    await supabase.from("teams").delete().eq("id", params.teamId).eq("owner_id", userId);
    return NextResponse.json({ success: true });
  } catch (e) { return handleApiError(e); }
}
