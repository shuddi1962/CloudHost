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

    const { data: bucket, error: bucketError } = await supabase
      .from("storage_buckets")
      .select("id")
      .eq("id", params.bucketId)
      .eq("user_id", userId)
      .single();
    if (bucketError || !bucket) throw new ApiError(404, "Bucket not found");

    const { data, error } = await supabase
      .from("storage_files")
      .select("*")
      .eq("bucket_id", params.bucketId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { bucketId: string } }
) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const { filename, path, content_type, size_bytes } = body;
    if (!filename) throw new ApiError(400, "Missing required field: filename");

    const supabase = createClient();

    const { data: bucket, error: bucketError } = await supabase
      .from("storage_buckets")
      .select("id")
      .eq("id", params.bucketId)
      .eq("user_id", userId)
      .single();
    if (bucketError || !bucket) throw new ApiError(404, "Bucket not found");

    const { data, error } = await supabase
      .from("storage_files")
      .insert({
        bucket_id: params.bucketId,
        user_id: userId,
        filename,
        path: path || filename,
        content_type: content_type || "application/octet-stream",
        size_bytes: size_bytes || 0,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
