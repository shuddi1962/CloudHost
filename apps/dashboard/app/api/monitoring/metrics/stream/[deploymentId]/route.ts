import { NextRequest } from "next/server";
import { MonitoringEngine } from "@/lib/monitoring-engine";

export async function GET(_req: NextRequest, { params }: { params: { deploymentId: string } }) {
  const stream = await MonitoringEngine.getMetricsStream(params.deploymentId);
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
