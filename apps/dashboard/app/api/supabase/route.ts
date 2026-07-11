import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const demoProjects = [
      { id: "1", name: "My Project", region: "us-east-1", status: "active", created_at: new Date().toISOString() },
      { id: "2", name: "Staging", region: "eu-west-3", status: "active", created_at: new Date().toISOString() },
    ];
    return NextResponse.json(demoProjects);
  } catch (e) { return handleApiError(e); }
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ id: "new", status: "created", message: "Supabase project provisioning is not yet available via this API" }, { status: 202 });
  } catch (e) { return handleApiError(e); }
}
