import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";
import { BuildRunner } from "@/lib/build-runner";
import { FeatureConnector } from "@/lib/feature-connector";

export async function GET() {
  try { const { userId } = await requireAuth(); const supabase = createClient();
    const { data } = await supabase.from("deployments").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return NextResponse.json(data || []);
  } catch (e) { return handleApiError(e); }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();
    const supabase = createClient();

    const { data, error } = await supabase.from("deployments").insert({
      user_id: userId,
      name: body.name,
      type: body.type || "git",
      framework: body.framework || "custom",
      status: "pending",
      domain: body.domain,
      region: body.region || "us-east-1",
      plan: body.plan || "starter",
      source_url: body.source_url,
      build_command: body.build_command,
      output_directory: body.output_directory || "public",
      node_version: body.node_version || "20",
      php_version: body.php_version || "8.2",
      install_command: body.install_command || "npm install",
      env_vars: body.env_vars || {},
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Auto-trigger build pipeline
    const runner = new BuildRunner(data.id);
    runner.executePipeline({
      sourceType: body.type,
      sourceUrl: body.source_url,
      framework: body.framework,
      buildCommand: body.build_command,
      installCommand: body.install_command,
      outputDir: body.output_directory,
      envVars: body.env_vars,
    }).then(async (build) => {
      await supabase.from("deployments").update({
        status: build.status === "success" ? "running" : "failed",
        build_log: build.phases.map(p => `[${p.status.toUpperCase()}] ${p.name}: ${p.log}`).join("\n"),
        deployed_at: build.status === "success" ? new Date().toISOString() : null,
        container_id: `ch-${data.id.substring(0, 8)}`,
      }).eq("id", data.id);

      if (build.status === "success") {
        await FeatureConnector.onDeploymentCreated({
          userId, resourceId: data.id, resourceType: "deployment",
          name: body.name, domain: body.domain, region: body.region,
        });
      }
    });

    return NextResponse.json(data, { status: 201 });
  } catch (e) { return handleApiError(e); }
}
