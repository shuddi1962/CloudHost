import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bucketId: string; fileId: string } }
) {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();

    const { data: file, error: fetchError } = await supabase
      .from("storage_files")
      .select("id")
      .eq("id", params.fileId)
      .eq("bucket_id", params.bucketId)
      .eq("user_id", userId)
      .single();
    if (fetchError || !file) throw new ApiError(404, "File not found");

    const { error } = await supabase
      .from("storage_files")
      .delete()
      .eq("id", params.fileId)
      .eq("user_id", userId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
