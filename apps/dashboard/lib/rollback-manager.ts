export interface DeploymentSnapshot {
  id: string;
  deploymentId: string;
  version: number;
  created_at: string;
  status: 'active' | 'rolling_back';
  artifact_url?: string;
  config: {
    build_command?: string;
    output_directory?: string;
    node_version?: string;
    php_version?: string;
    env_vars: Record<string, string>;
  };
  summary: {
    total_files: number;
    total_size: string;
    framework: string;
  };
}

const snapshots: Map<string, DeploymentSnapshot[]> = new Map();
const versionCounters: Map<string, number> = new Map();

export class RollbackManager {
  static async createSnapshot(deploymentId: string, config: DeploymentSnapshot['config'], summary: DeploymentSnapshot['summary']): Promise<DeploymentSnapshot> {
    const vc = versionCounters.get(deploymentId) || 0;
    const version = vc + 1;
    versionCounters.set(deploymentId, version);

    const snapshot: DeploymentSnapshot = {
      id: `snap-${deploymentId}-${version}-${Date.now()}`,
      deploymentId,
      version,
      created_at: new Date().toISOString(),
      status: 'active',
      config,
      summary,
    };

    const existing = snapshots.get(deploymentId) || [];
    existing.unshift(snapshot);
    snapshots.set(deploymentId, existing);
    return snapshot;
  }

  static async getHistory(deploymentId: string): Promise<DeploymentSnapshot[]> {
    return snapshots.get(deploymentId) || [];
  }

  static async rollback(deploymentId: string, snapshotId: string): Promise<DeploymentSnapshot | null> {
    const history = snapshots.get(deploymentId) || [];
    const target = history.find(s => s.id === snapshotId);
    if (!target) return null;

    target.status = 'rolling_back';
    return target;
  }
}
