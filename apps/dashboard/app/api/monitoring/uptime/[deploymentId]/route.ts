import { NextRequest, NextResponse } from "next/server";
import { MonitoringEngine } from "@/lib/monitoring-engine";

export async function GET(_req: NextRequest, { params }: { params: { deploymentId: string } }) {
  const hours = Number(_req.nextUrl.searchParams.get('hours')) || 24;
  const [checks, percentage] = await Promise.all([
    MonitoringEngine.getUptime(params.deploymentId, hours),
    MonitoringEngine.getUptimePercentage(params.deploymentId, hours),
  ]);
  return NextResponse.json({ checks, percentage });
}
