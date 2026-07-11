import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";
import { ProvisioningEngine } from "@/lib/provisioning-engine";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get("resourceType");
    const resourceId = searchParams.get("resourceId");

    if (resourceType && resourceId) {
      const metrics = await ProvisioningEngine.getMetrics(resourceType, resourceId);
      return NextResponse.json(metrics);
    }

    const now = Date.now();
    const sampleMetrics = [];
    for (let i = 59; i >= 0; i--) {
      const t = new Date(now - i * 60000).toISOString();
      sampleMetrics.push(
        { id: `cpu-${i}`, user_id: userId, resource_type: "instance", resource_id: "demo", metric_type: "cpu", value: +(30 + Math.random() * 60).toFixed(1), unit: "%", recorded_at: t },
        { id: `mem-${i}`, user_id: userId, resource_type: "instance", resource_id: "demo", metric_type: "memory", value: +(40 + Math.random() * 40).toFixed(1), unit: "%", recorded_at: t },
        { id: `dsk-${i}`, user_id: userId, resource_type: "instance", resource_id: "demo", metric_type: "disk", value: +(20 + Math.random() * 30).toFixed(1), unit: "%", recorded_at: t },
        { id: `net-${i}`, user_id: userId, resource_type: "instance", resource_id: "demo", metric_type: "network", value: +(Math.random() * 100).toFixed(1), unit: "Mbps", recorded_at: t }
      );
    }
    return NextResponse.json(sampleMetrics);
  } catch (error) {
    return handleApiError(error);
  }
}
