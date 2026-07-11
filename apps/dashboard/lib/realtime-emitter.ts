type EventCallback = (event: string, data: any) => void;

class RealtimeEmitter {
  private listeners = new Map<string, Set<EventCallback>>();

  on(deploymentId: string, cb: EventCallback) {
    if (!this.listeners.has(deploymentId)) this.listeners.set(deploymentId, new Set());
    this.listeners.get(deploymentId)!.add(cb);
    return () => this.listeners.get(deploymentId)?.delete(cb);
  }

  emit(deploymentId: string, event: string, data: any) {
    this.listeners.get(deploymentId)?.forEach(cb => cb(event, data));
  }

  removeAll(deploymentId: string) {
    this.listeners.delete(deploymentId);
  }
}

export const emitter = new RealtimeEmitter();
