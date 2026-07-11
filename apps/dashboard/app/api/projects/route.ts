import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try { const { userId } = await requireAuth(); const supabase = createClient();
    const { data } = await supabase.from("projects").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return NextResponse.json(data || []);
  } catch (e) { return handleApiError(e); }
}

export async function POST(request: NextRequest) {
  try { const { userId } = await requireAuth(); const body = await request.json(); const supabase = createClient();
    const slug = (body.name || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await supabase.from("projects").insert({
      user_id: userId, name: body.name, description: body.description || "", slug, region: body.region || "us-east-1",
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) { return handleApiError(e); }
}
