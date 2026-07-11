import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { bucketId: string } }
) {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();

    const { data: bucket, error } = await supabase
      .from("storage_buckets")
      .select("*")
      .eq("id", params.bucketId)
      .eq("user_id", userId)
      .single();
    if (error || !bucket) throw new ApiError(404, "Bucket not found");

    const { count } = await supabase
      .from("storage_files")
      .select("*", { count: "exact", head: true })
      .eq("bucket_id", params.bucketId);

    const { data: files } = await supabase
      .from("storage_files")
      .select("size_bytes")
      .eq("bucket_id", params.bucketId);

    const totalSize = files?.reduce((sum, f) => sum + (f.size_bytes || 0), 0) || 0;

    return NextResponse.json({ ...bucket, file_count: count || 0, total_size_bytes: totalSize });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { bucketId: string } }
) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const supabase = createClient();

    const allowed: Record<string, unknown> = {};
    if (body.name !== undefined) allowed.name = body.name;
    if (body.public !== undefined) allowed.public = body.public;
    allowed.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("storage_buckets")
      .update(allowed)
      .eq("id", params.bucketId)
      .eq("user_id", userId)
      .select()
      .single();
    if (error || !data) throw new ApiError(404, "Bucket not found");
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bucketId: string } }
) {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();

    const { data: bucket, error: fetchError } = await supabase
      .from("storage_buckets")
      .select("id")
      .eq("id", params.bucketId)
      .eq("user_id", userId)
      .single();
    if (fetchError || !bucket) throw new ApiError(404, "Bucket not found");

    await supabase.from("storage_files").delete().eq("bucket_id", params.bucketId);

    const { error } = await supabase
      .from("storage_buckets")
      .delete()
      .eq("id", params.bucketId)
      .eq("user_id", userId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
