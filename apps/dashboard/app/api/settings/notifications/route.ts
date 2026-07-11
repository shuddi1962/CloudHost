import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";

const defaultPreferences = {
  email_notifications: true,
  deployment_alerts: true,
  billing_alerts: true,
  maintenance_notices: true,
  weekly_digest: false,
  marketing_emails: false,
};

export async function GET() {
  try {
    await requireAuth();
    return NextResponse.json(defaultPreferences);
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    return NextResponse.json({ ...defaultPreferences, ...body });
  } catch (e) { return handleApiError(e); }
}
