export interface MetricPoint {
  timestamp: number;
  value: number;
}

export interface ServiceMetrics {
  cpu: MetricPoint[];
  memory: MetricPoint[];
  response_time: MetricPoint[];
  requests_per_minute: MetricPoint[];
}

export interface UptimeCheck {
  id: string;
  deploymentId: string;
  status: 'up' | 'down' | 'degraded';
  response_time_ms: number;
  status_code: number;
  checked_at: string;
}

export interface AlertRule {
  id: string;
  deploymentId: string;
  metric: 'cpu' | 'memory' | 'response_time' | 'uptime';
  condition: '>' | '<' | '==' | '>=' | '<=';
  threshold: number;
  enabled: boolean;
  last_triggered_at?: string;
}

const metricsStore = new Map<string, ServiceMetrics>();
const uptimeStore = new Map<string, UptimeCheck[]>();
const alertRules: AlertRule[] = [];

function generateTimeline(base: number, variance: number, points: number, trend: 'up' | 'down' | 'stable' = 'stable'): MetricPoint[] {
  const now = Date.now();
  const result: MetricPoint[] = [];
  let current = base;
  for (let i = points; i >= 0; i--) {
    current += (Math.random() - 0.5) * variance;
    if (trend === 'up') current += variance * 0.05;
    if (trend === 'down') current -= variance * 0.05;
    result.push({ timestamp: now - i * 60000, value: Math.max(0, Math.round(current * 100) / 100) });
  }
  return result;
}

export class MonitoringEngine {
  static async getMetrics(deploymentId: string): Promise<ServiceMetrics> {
    if (!metricsStore.has(deploymentId)) {
      metricsStore.set(deploymentId, {
        cpu: generateTimeline(45, 15, 60),
        memory: generateTimeline(62, 10, 60),
        response_time: generateTimeline(120, 40, 60),
        requests_per_minute: generateTimeline(300, 100, 60),
      });
    }
    return metricsStore.get(deploymentId)!;
  }

  static async getUptime(deploymentId: string, hours: number = 24): Promise<UptimeCheck[]> {
    if (!uptimeStore.has(deploymentId)) {
      const checks: UptimeCheck[] = [];
      const now = Date.now();
      const interval = (hours * 3600000) / 288;
      for (let i = 288; i >= 0; i--) {
        const isUp = Math.random() > 0.03;
        checks.push({
          id: `uptime-${deploymentId}-${i}`,
          deploymentId,
          status: isUp ? 'up' : Math.random() > 0.5 ? 'degraded' : 'down',
          response_time_ms: isUp ? Math.floor(80 + Math.random() * 200) : 0,
          status_code: isUp ? 200 : Math.random() > 0.5 ? 503 : 500,
          checked_at: new Date(now - i * interval).toISOString(),
        });
      }
      uptimeStore.set(deploymentId, checks);
    }
    return uptimeStore.get(deploymentId)!;
  }

  static async getUptimePercentage(deploymentId: string, hours: number = 24): Promise<number> {
    const checks = await this.getUptime(deploymentId, hours);
    const up = checks.filter(c => c.status === 'up').length;
    return Math.round((up / checks.length) * 10000) / 100;
  }

  static async getAlertRules(deploymentId: string): Promise<AlertRule[]> {
    return alertRules.filter(r => r.deploymentId === deploymentId);
  }

  static async saveAlertRule(rule: Omit<AlertRule, 'id' | 'last_triggered_at'>): Promise<AlertRule> {
    const newRule: AlertRule = { ...rule, id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
    alertRules.push(newRule);
    return newRule;
  }

  static async deleteAlertRule(id: string): Promise<boolean> {
    const idx = alertRules.findIndex(r => r.id === id);
    if (idx === -1) return false;
    alertRules.splice(idx, 1);
    return true;
  }

  static async getMetricsStream(deploymentId: string): Promise<ReadableStream> {
    const metrics = await this.getMetrics(deploymentId);
    const encoder = new TextEncoder();
    let index = 0;

    return new ReadableStream({
      start(controller) {
        const interval = setInterval(() => {
          index++;
          const point = {
            cpu: 30 + Math.random() * 40,
            memory: 50 + Math.random() * 30,
            response_time: 80 + Math.random() * 200,
            requests_per_minute: 200 + Math.random() * 200,
            timestamp: Date.now(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(point)}\n\n`));
          if (index > 300) { clearInterval(interval); controller.close(); }
        }, 2000);
      },
    });
  }
}
