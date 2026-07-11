import { NextResponse } from "next/server";
import { WebhookDeploymentStore } from "@/lib/webhook-deployment-store";

export async function GET() {
  const deployments = WebhookDeploymentStore.list();
  return NextResponse.json({ deployments });
}
