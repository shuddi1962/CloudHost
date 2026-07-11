import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";
import crypto from "crypto";

export async function GET() {
  try { const { userId } = await requireAuth(); const supabase = createClient();
    const { data } = await supabase.from("api_keys").select("id,name,key_prefix,permissions,last_used_at,expires_at,status,created_at").eq("user_id", userId).eq("status", "active");
    return NextResponse.json(data || []);
  } catch (e) { return handleApiError(e); }
}

export async function POST(request: NextRequest) {
  try { const { userId } = await requireAuth(); const body = await request.json(); const supabase = createClient();
    const key = `ch_${crypto.randomBytes(24).toString("hex")}`;
    const hash = crypto.createHash("sha256").update(key).digest("hex");
    const prefix = key.substring(0, 8);
    const { data, error } = await supabase.from("api_keys").insert({
      user_id: userId, name: body.name, key_hash: hash, key_prefix: prefix, permissions: body.permissions || [],
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ...data, key }, { status: 201 });
  } catch (e) { return handleApiError(e); }
}
