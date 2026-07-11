import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { domainId: string } }
) {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();

    const { data: domain, error: domainError } = await supabase
      .from("domains")
      .select("id")
      .eq("id", params.domainId)
      .eq("user_id", userId)
      .single();
    if (domainError || !domain) throw new ApiError(404, "Domain not found");

    const { data, error } = await supabase
      .from("dns_records")
      .select("*")
      .eq("domain_id", params.domainId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { domainId: string } }
) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const { type, name, value, ttl, priority } = body;
    if (!type || !name || !value) {
      throw new ApiError(400, "Missing required fields: type, name, value");
    }

    const supabase = createClient();

    const { data: domain, error: domainError } = await supabase
      .from("domains")
      .select("id")
      .eq("id", params.domainId)
      .eq("user_id", userId)
      .single();
    if (domainError || !domain) throw new ApiError(404, "Domain not found");

    const { data, error } = await supabase
      .from("dns_records")
      .insert({
        domain_id: params.domainId,
        type,
        name,
        value,
        ttl: ttl || 3600,
        priority: priority || null,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { domainId: string } }
) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const { id, type, name, value, ttl, priority } = body;
    if (!id) throw new ApiError(400, "Missing required field: id");

    const supabase = createClient();

    const { data: domain, error: domainError } = await supabase
      .from("domains")
      .select("id")
      .eq("id", params.domainId)
      .eq("user_id", userId)
      .single();
    if (domainError || !domain) throw new ApiError(404, "Domain not found");

    const allowed: Record<string, unknown> = {};
    if (type !== undefined) allowed.type = type;
    if (name !== undefined) allowed.name = name;
    if (value !== undefined) allowed.value = value;
    if (ttl !== undefined) allowed.ttl = ttl;
    if (priority !== undefined) allowed.priority = priority;
    allowed.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("dns_records")
      .update(allowed)
      .eq("id", id)
      .eq("domain_id", params.domainId)
      .select()
      .single();
    if (error || !data) throw new ApiError(404, "DNS record not found");
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { domainId: string } }
) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const recordId = body.id || params.domainId;

    const supabase = createClient();

    const { data: domain, error: domainError } = await supabase
      .from("domains")
      .select("id")
      .eq("id", params.domainId)
      .eq("user_id", userId)
      .single();
    if (domainError || !domain) throw new ApiError(404, "Domain not found");

    const { data: record, error: fetchError } = await supabase
      .from("dns_records")
      .select("id")
      .eq("id", recordId)
      .eq("domain_id", params.domainId)
      .single();
    if (fetchError || !record) throw new ApiError(404, "DNS record not found");

    const { error } = await supabase
      .from("dns_records")
      .delete()
      .eq("id", recordId)
      .eq("domain_id", params.domainId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
