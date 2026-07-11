import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { appId, planId, deploymentId } = await req.json();
  if (!appId || !planId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const subscription = {
    id: `sub-${Date.now()}`,
    appId,
    planId,
    deploymentId: deploymentId || null,
    status: 'active',
    created_at: new Date().toISOString(),
    next_billing_at: new Date(Date.now() + 30 * 86400000).toISOString(),
  };

  return NextResponse.json({ subscription, message: "Subscription created. Your app is being provisioned." }, { status: 201 });
}
