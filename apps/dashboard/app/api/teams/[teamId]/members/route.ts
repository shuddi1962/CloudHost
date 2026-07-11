import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();
    const { data: members } = await supabase
      .from("team_members")
      .select("*, profiles:user_id(name, avatar_url)")
      .eq("team_id", params.teamId);
    return NextResponse.json(members || []);
  } catch (e) { return handleApiError(e); }
}

export async function POST(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const supabase = createClient();
    const { data, error } = await supabase.from("team_members").insert({
      team_id: params.teamId,
      user_id: body.user_id,
      role: body.role || "member",
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) { return handleApiError(e); }
}
