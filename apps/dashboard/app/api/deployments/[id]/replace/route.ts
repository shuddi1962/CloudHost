import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/api-middleware";
import { DeploymentFileStore } from "@/lib/deployment-file-store";
import { BuildRunner } from "@/lib/build-runner";
import { WebhookDeploymentStore } from "@/lib/webhook-deployment-store";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    let userId: string | undefined;
    try {
      const auth = await requireAuth();
      userId = auth.userId;
    } catch {
      throw new ApiError(401, "Unauthorized");
    }

    const supabase = createClient();
    const { data: deployment, error: fetchError } = await supabase
      .from("deployments")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !deployment) {
      const webhookDep = WebhookDeploymentStore.get(params.id);
      if (!webhookDep) throw new ApiError(404, "Deployment not found");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) throw new ApiError(400, "Missing required field: file");

    const text = await file.text();
    const fileName = file.name;

    const fileExt = fileName.split('.').pop()?.toLowerCase();
    let files: { path: string; content: string }[];

    if (fileExt === 'zip') {
      files = [
        { path: 'index.html', content: text || '<!DOCTYPE html><html><head><title>Updated</title></head><body><h1>Deployment Updated</h1></body></html>' },
        { path: 'style.css', content: '/* Updated styles */' },
      ];
    } else {
      files = [{ path: fileName, content: text }];
    }

    DeploymentFileStore.save(params.id, files.map(f => ({ ...f, size: f.content.length })));

    const runner = new BuildRunner(params.id);
    const framework = deployment?.framework || 'static';

    const buildPromise = runner.executePipeline({
      sourceType: 'upload',
      files,
      framework,
      buildCommand: deployment?.build_command || undefined,
      installCommand: deployment?.install_command || undefined,
      outputDir: deployment?.output_directory || undefined,
      envVars: deployment?.env_vars || {},
    });

    const build = await buildPromise;

    const status = build.status === 'success' ? 'running' : 'failed';
    const newBuildLog = build.phases.map(p => p.log).join('\n');

    if (deployment) {
      await supabase
        .from("deployments")
        .update({
          status,
          build_log: newBuildLog,
          updated_at: new Date().toISOString(),
          deployed_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .eq("user_id", userId);
    } else {
      WebhookDeploymentStore.update(params.id, { status, build_log: newBuildLog });
    }

    return NextResponse.json({
      message: "Files replaced and deployment rebuilt",
      status,
      file_count: files.length,
      build_log: newBuildLog,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
