export interface CICDConnection {
  id: string;
  name: string;
  provider: 'github' | 'gitlab';
  repository: string;
  branch: string;
  build_command: string;
  output_directory: string;
  install_command: string;
  node_version: string;
  auto_deploy: boolean;
  webhook_secret: string;
  last_deploy_at?: string;
  last_deploy_status?: 'success' | 'failed';
  created_at: string;
}

const connections: CICDConnection[] = [];

export class CICDManager {
  static async list(): Promise<CICDConnection[]> {
    return connections;
  }

  static async get(id: string): Promise<CICDConnection | undefined> {
    return connections.find(c => c.id === id);
  }

  static async create(data: Omit<CICDConnection, 'id' | 'webhook_secret' | 'created_at'>): Promise<CICDConnection> {
    const conn: CICDConnection = {
      ...data,
      id: `cicd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      webhook_secret: Math.random().toString(36).slice(2, 18) + Math.random().toString(36).slice(2, 18),
      created_at: new Date().toISOString(),
    };
    connections.unshift(conn);
    return conn;
  }

  static async update(id: string, data: Partial<CICDConnection>): Promise<CICDConnection | undefined> {
    const idx = connections.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    connections[idx] = { ...connections[idx], ...data };
    return connections[idx];
  }

  static async remove(id: string): Promise<boolean> {
    const idx = connections.findIndex(c => c.id === id);
    if (idx === -1) return false;
    connections.splice(idx, 1);
    return true;
  }

  static async handleWebhook(provider: 'github' | 'gitlab', payload: any, signature?: string): Promise<{ connection: CICDConnection; action: string } | null> {
    const repo = payload.repository?.full_name;
    const ref = payload.ref;
    const branch = ref?.replace('refs/heads/', '');
    if (!repo || !branch) return null;

    const conn = connections.find(c => c.provider === provider && c.repository === repo && c.branch === branch);
    if (!conn || !conn.auto_deploy) return null;

    conn.last_deploy_at = new Date().toISOString();
    conn.last_deploy_status = 'success';
    return { connection: conn, action: 'deploy' };
  }
}
