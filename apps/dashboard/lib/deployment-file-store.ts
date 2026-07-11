export interface DeploymentFile {
  path: string;
  content: string;
  size: number;
}

const fileStore = new Map<string, DeploymentFile[]>();

export class DeploymentFileStore {
  static save(deploymentId: string, files: DeploymentFile[]) {
    fileStore.set(deploymentId, files);
  }

  static get(deploymentId: string): DeploymentFile[] {
    return fileStore.get(deploymentId) || [];
  }

  static delete(deploymentId: string) {
    fileStore.delete(deploymentId);
  }

  static has(deploymentId: string): boolean {
    return fileStore.has(deploymentId);
  }
}
