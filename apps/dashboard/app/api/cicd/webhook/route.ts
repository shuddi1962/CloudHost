import { NextRequest, NextResponse } from "next/server";
import { CICDManager } from "@/lib/cicd-manager";
import { BuildRunner } from "@/lib/build-runner";
import { RollbackManager } from "@/lib/rollback-manager";
import { WebhookDeploymentStore } from "@/lib/webhook-deployment-store";

export async function POST(req: NextRequest) {
  const provider = req.headers.get('x-github-event') ? 'github' : 'gitlab';
  const event = req.headers.get('x-github-event') || 'push';
  const signature = req.headers.get('x-hub-signature-256') || undefined;
  const payload = await req.json();

  if (event === 'ping') {
    return NextResponse.json({ message: 'pong', ok: true });
  }

  if (event !== 'push') {
    return NextResponse.json({ message: `Ignoring event: ${event}` });
  }

  const result = await CICDManager.handleWebhook(provider, payload, signature);
  if (!result) {
    return NextResponse.json({ message: "No matching connection or auto-deploy disabled" });
  }

  const { connection } = result;
  const commitSha = payload.after?.substring(0, 7) || 'HEAD';
  const commitMsg = payload.head_commit?.message?.split('\n')[0] || 'Auto-deploy';
  const branch = payload.ref?.replace('refs/heads/', '') || 'main';
  const deployId = `deploy-${connection.id}-${Date.now()}`;
  const repoName = connection.repository.split('/').pop() || connection.repository;

  const runner = new BuildRunner(deployId);
  const buildConfig = {
    sourceType: 'git' as const,
    sourceUrl: `https://github.com/${connection.repository}.git`,
    framework: connection.node_version ? 'nextjs' : 'node',
    buildCommand: connection.build_command,
    installCommand: connection.install_command,
    outputDir: connection.output_directory,
    envVars: { COMMIT_SHA: commitSha, COMMIT_MSG: commitMsg, AUTO_DEPLOY: 'true' },
  };

  const buildPromise = runner.executePipeline(buildConfig).then(async (build) => {
    if (build.status === 'success') {
      await RollbackManager.createSnapshot(deployId, {
        build_command: buildConfig.buildCommand,
        output_directory: buildConfig.outputDir,
        node_version: '20',
        env_vars: buildConfig.envVars || {},
      }, {
        total_files: Math.floor(Math.random() * 200) + 50,
        total_size: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 9)} MB`,
        framework: buildConfig.framework || 'node',
      });
    }
    return build;
  });

  const build = await buildPromise;

  const webhookDeploy = {
    id: deployId,
    name: repoName,
    type: 'auto' as const,
    framework: buildConfig.framework || 'node',
    status: build.status === 'success' ? 'running' : 'failed',
    domain: `https://${deployId.substring(0, 8)}.cloudhost.app`,
    commit_sha: commitSha,
    commit_message: commitMsg,
    branch,
    repository: connection.repository,
    auto_deploy: true,
    build_log: build.phases.map(p => p.log).join('\n'),
    created: new Date().toISOString(),
  };
  WebhookDeploymentStore.add(webhookDeploy);

  return NextResponse.json({
    message: `Auto-deploy triggered for ${connection.repository}`,
    connection: connection.id,
    deployment: {
      id: deployId,
      status: build.status,
      commit: commitSha,
      message: commitMsg,
      url: webhookDeploy.domain,
    },
    build_log: build.phases.map(p => p.log).join('\n'),
  });
}
