import { NextRequest, NextResponse } from "next/server";
import { MonitoringEngine } from "@/lib/monitoring-engine";

export async function GET(req: NextRequest) {
  const deploymentId = req.nextUrl.searchParams.get('deploymentId') || '';
  const rules = await MonitoringEngine.getAlertRules(deploymentId);
  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const rule = await MonitoringEngine.saveAlertRule(data);
  return NextResponse.json({ rule }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';
  const ok = await MonitoringEngine.deleteAlertRule(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
