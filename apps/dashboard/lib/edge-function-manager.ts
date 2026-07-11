export interface EdgeFunction {
  id: string;
  name: string;
  runtime: 'node18' | 'node20' | 'python3' | 'deno';
  source: string;
  entrypoint: string;
  env_vars: Record<string, string>;
  memory_mb: number;
  timeout_seconds: number;
  status: 'active' | 'deploying' | 'failed' | 'disabled';
  invocations: number;
  avg_duration_ms: number;
  errors_24h: number;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface FunctionLog {
  id: string;
  functionId: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  duration_ms?: number;
  status_code?: number;
}

const functions: EdgeFunction[] = [
  {
    id: 'fn-auth-hook', name: 'Auth Webhook', runtime: 'node20',
    source: 'export default async (req) => { return new Response("OK"); }',
    entrypoint: 'index.js', env_vars: {}, memory_mb: 256, timeout_seconds: 30,
    status: 'active', invocations: 1423, avg_duration_ms: 45, errors_24h: 2,
    url: 'https://fn-auth-hook.cloudhost.app', created_at: '2026-06-15T10:00:00Z', updated_at: '2026-07-10T14:30:00Z',
  },
  {
    id: 'fn-api-proxy', name: 'API Proxy', runtime: 'node18',
    source: 'export default async (req) => { return fetch(req.url.replace("/api/","https://api.example.com/")); }',
    entrypoint: 'index.js', env_vars: { API_KEY: 'sk-***' }, memory_mb: 512, timeout_seconds: 60,
    status: 'active', invocations: 8921, avg_duration_ms: 120, errors_24h: 15,
    url: 'https://fn-api-proxy.cloudhost.app', created_at: '2026-05-20T08:00:00Z', updated_at: '2026-07-11T09:00:00Z',
  },
  {
    id: 'fn-img-optimize', name: 'Image Optimizer', runtime: 'deno',
    source: 'import { sharp } from "npm:sharp"; export default async (req) => { ... }',
    entrypoint: 'mod.ts', env_vars: {}, memory_mb: 1024, timeout_seconds: 120,
    status: 'deploying', invocations: 0, avg_duration_ms: 0, errors_24h: 0,
    url: 'https://fn-img-optimize.cloudhost.app', created_at: '2026-07-11T10:00:00Z', updated_at: '2026-07-11T10:00:00Z',
  },
];

let fnLogs: FunctionLog[] = [];
let fnIdCounter = functions.length + 1;

export class EdgeFunctionManager {
  static async list(): Promise<EdgeFunction[]> { return functions; }

  static async get(id: string): Promise<EdgeFunction | undefined> { return functions.find(f => f.id === id); }

  static async create(data: Partial<EdgeFunction>): Promise<EdgeFunction> {
    const id = `fn-${Date.now()}-${fnIdCounter++}`;
    const fn: EdgeFunction = {
      id, name: data.name || `function-${id}`, runtime: data.runtime || 'node20',
      source: data.source || 'export default async (req) => new Response("Hello");',
      entrypoint: data.entrypoint || 'index.js', env_vars: data.env_vars || {},
      memory_mb: data.memory_mb || 256, timeout_seconds: data.timeout_seconds || 30,
      status: 'active', invocations: 0, avg_duration_ms: 0, errors_24h: 0,
      url: `https://${id}.cloudhost.app`, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    functions.unshift(fn);
    return fn;
  }

  static async deploy(id: string): Promise<EdgeFunction | undefined> {
    const fn = functions.find(f => f.id === id);
    if (!fn) return undefined;
    fn.status = 'deploying';
    setTimeout(() => { fn.status = 'active'; fn.updated_at = new Date().toISOString(); }, 3000);
    return fn;
  }

  static async remove(id: string): Promise<boolean> {
    const idx = functions.findIndex(f => f.id === id);
    if (idx === -1) return false;
    functions.splice(idx, 1);
    return true;
  }

  static async getLogs(functionId: string, limit = 50): Promise<FunctionLog[]> {
    return fnLogs.filter(l => l.functionId === functionId).slice(-limit);
  }

  static async addLog(log: Omit<FunctionLog, 'id'>): Promise<FunctionLog> {
    const entry: FunctionLog = { ...log, id: `flog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    fnLogs.push(entry);
    return entry;
  }

  static async getMetrics(functionId: string) {
    const fn = functions.find(f => f.id === functionId);
    if (!fn) return null;
    return {
      invocations_total: fn.invocations,
      avg_duration_ms: fn.avg_duration_ms,
      errors_24h: fn.errors_24h,
      invocations_history: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`, count: Math.floor(Math.random() * fn.invocations / 24),
      })),
      duration_history: Array.from({ length: 60 }, (_, i) => ({
        minute: i, ms: Math.floor(fn.avg_duration_ms * (0.5 + Math.random())),
      })),
    };
  }
}
