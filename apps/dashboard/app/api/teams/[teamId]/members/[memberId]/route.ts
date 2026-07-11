import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";

export async function PATCH(request: NextRequest, { params }: { params: { teamId: string; memberId: string } }) {
  try { const { userId } = await requireAuth(); const body = await request.json(); const supabase = createClient();
    const { data } = await supabase.from("team_members").update({ role: body.role }).eq("id", params.memberId).eq("team_id", params.teamId).select().single();
    return NextResponse.json(data);
  } catch (e) { return handleApiError(e); }
}

export async function DELETE(request: NextRequest, { params }: { params: { teamId: string; memberId: string } }) {
  try { const { userId } = await requireAuth(); const supabase = createClient();
    await supabase.from("team_members").delete().eq("id", params.memberId).eq("team_id", params.teamId);
    return NextResponse.json({ success: true });
  } catch (e) { return handleApiError(e); }
}
