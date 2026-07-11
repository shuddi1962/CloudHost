import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { handleApiError } from "@/lib/api-error";

export async function POST(_request: NextRequest) {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return NextResponse.json({ message: "Signed out successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
