export interface WebhookDeployment {
  id: string;
  name: string;
  type: 'git' | 'auto';
  framework: string;
  status: string;
  domain: string;
  commit_sha: string;
  commit_message: string;
  branch: string;
  repository: string;
  auto_deploy: boolean;
  build_log: string;
  created: string;
  gitAccountId?: string;
}

const store: WebhookDeployment[] = [];

export class WebhookDeploymentStore {
  static add(dep: WebhookDeployment) {
    store.unshift(dep);
  }

  static list(): WebhookDeployment[] {
    return [...store];
  }

  static get(id: string): WebhookDeployment | undefined {
    return store.find(d => d.id === id);
  }

  static update(id: string, updates: Partial<WebhookDeployment>): WebhookDeployment | undefined {
    const idx = store.findIndex(d => d.id === id);
    if (idx === -1) return undefined;
    store[idx] = { ...store[idx], ...updates };
    return store[idx];
  }

  static delete(id: string): boolean {
    const idx = store.findIndex(d => d.id === id);
    if (idx === -1) return false;
    store.splice(idx, 1);
    return true;
  }

  static clear() {
    store.length = 0;
  }
}
