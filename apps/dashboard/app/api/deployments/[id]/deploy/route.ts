import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";
import { ProvisioningEngine } from "@/lib/provisioning-engine";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth();
    const supabase = createClient();

    const { data: deployment, error: fetchError } = await supabase
      .from("deployments")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();
    if (fetchError || !deployment) throw new ApiError(404, "Deployment not found");

    const envVars = deployment.env_vars || {};
    const result = await ProvisioningEngine.deployContainer(
      deployment.id,
      deployment.framework,
      envVars
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
