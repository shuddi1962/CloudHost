import { NextRequest, NextResponse } from "next/server";
import { CICDManager } from "@/lib/cicd-manager";

export async function POST(req: NextRequest) {
  const provider = req.headers.get('x-github-event') ? 'github' : 'gitlab';
  const signature = req.headers.get('x-hub-signature-256') || undefined;
  const payload = await req.json();

  const result = await CICDManager.handleWebhook(provider, payload, signature);
  if (!result) return NextResponse.json({ message: "No matching connection or auto-deploy disabled" });

  return NextResponse.json({ message: `Webhook received - triggering ${result.action}`, connection: result.connection.id });
}
