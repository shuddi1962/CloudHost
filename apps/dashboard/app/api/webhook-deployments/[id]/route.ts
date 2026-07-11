import { NextRequest, NextResponse } from "next/server";
import { WebhookDeploymentStore } from "@/lib/webhook-deployment-store";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const dep = WebhookDeploymentStore.get(params.id);
  if (!dep) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dep);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = WebhookDeploymentStore.delete(params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
