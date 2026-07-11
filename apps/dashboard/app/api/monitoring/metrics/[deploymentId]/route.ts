import { NextRequest, NextResponse } from "next/server";
import { MonitoringEngine } from "@/lib/monitoring-engine";

export async function GET(_req: NextRequest, { params }: { params: { deploymentId: string } }) {
  const metrics = await MonitoringEngine.getMetrics(params.deploymentId);
  return NextResponse.json({ metrics });
}
