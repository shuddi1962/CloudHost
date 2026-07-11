import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try { const { userId } = await requireAuth(); const supabase = createClient();
    const { data: owned } = await supabase.from("teams").select("*").eq("owner_id", userId);
    const { data: member } = await supabase.from("team_members").select("team_id").eq("user_id", userId);
    const teamIds = [...new Set([...(owned || []).map(t => t.id), ...(member || []).map(m => m.team_id)])];
    if (teamIds.length === 0) return NextResponse.json([]);
    const { data } = await supabase.from("teams").select("*").in("id", teamIds);
    return NextResponse.json(data || []);
  } catch (e) { return handleApiError(e); }
}

export async function POST(request: NextRequest) {
  try { const { userId } = await requireAuth(); const body = await request.json(); const supabase = createClient();
    const { data, error } = await supabase.from("teams").insert({ name: body.name, owner_id: userId }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) { return handleApiError(e); }
}
