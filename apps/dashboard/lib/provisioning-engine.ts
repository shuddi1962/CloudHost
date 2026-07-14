import { db, instances, containerServices, databases, deployments, metrics, getPlanByProviderRef } from "@cloudhost/db";
import { eq } from "drizzle-orm";

const DO_API = "https://api.digitalocean.com/v2";

function doHeaders(): Record<string, string> {
  const token = process.env.DIGITALOCEAN_API_TOKEN;
  if (!token) throw new Error("DIGITALOCEAN_API_TOKEN not set");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function doFetch(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${DO_API}${path}`, {
    ...options,
    headers: { ...doHeaders(), ...options.headers },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || `DigitalOcean API error: ${res.status}`);
  return body;
}

const DO_SIZE_MAP: Record<string, string> = {
  "s-1vcpu-2gb": "s-1vcpu-2gb",
  "s-2vcpu-4gb": "s-2vcpu-4gb",
  "s-2vcpu-8gb": "s-2vcpu-8gb",
  "s-4vcpu-16gb": "s-4vcpu-16gb",
  "s-8vcpu-32gb": "s-8vcpu-32gb",
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export class ProvisioningEngine {
  static async provisionInstance(
    userId: string,
    name: string,
    doSlug: string,
    region: string,
    blueprint: string,
    platform: string,
    image: string,
    tags: string[] = [],
  ): Promise<any> {
    const slug = DO_SIZE_MAP[doSlug] || "s-1vcpu-2gb";

    const plan = await getPlanByProviderRef("digitalocean", slug);
    const s = plan?.specs as Record<string, string> | undefined;
    const spec = {
      cpu: Number(s?.cpu?.match(/\d+/)?.[0] || 1),
      ram_mb: (() => {
        const match = s?.ram?.match(/([\d.]+)\s*GB/i);
        return match ? Math.round(Number(match[1]) * 1024) : 2048;
      })(),
      storage_gb: (() => {
        const match = s?.storage?.match(/(\d+)\s*GB/i);
        return match ? Number(match[1]) : 40;
      })(),
      transfer_tb: (() => {
        const match = s?.transfer?.match(/(\d+)\s*TB/i);
        return match ? Number(match[1]) : 1;
      })(),
      price: plan ? Number(plan.yourPriceUsd) : 6,
    };

    const dropletPayload: any = {
      name, region, size: slug, image,
      ssh_keys: [],
      tags: ["cloudhost", ...tags],
      user_data: platform === "application images"
        ? `#!/bin/bash\n# CloudHost app image — application will self-configure on first boot`
        : undefined,
    };

    const { droplet } = await doFetch("/droplets", {
      method: "POST",
      body: JSON.stringify(dropletPayload),
    });

    const [row] = await db.insert(instances).values({
      userId,
      name, region,
      plan: slug, blueprint, platform,
      status: "provisioning",
      providerId: String(droplet.id),
      cpu: spec.cpu,
      ramMb: spec.ram_mb,
      storageGb: spec.storage_gb,
      transferTb: spec.transfer_tb,
      priceMonthly: spec.price,
      tags,
    }).returning();

    const pollUntilActive = async () => {
      for (let i = 0; i < 60; i++) {
        await sleep(5000);
        const { droplet: d } = await doFetch(`/droplets/${droplet.id}`);
        const publicIpv4 = d.networks?.v4?.find((n: any) => n.type === "public")?.ip_address || null;
        const privateIpv4 = d.networks?.v4?.find((n: any) => n.type === "private")?.ip_address || null;

        await db.update(instances).set({
          status: d.status === "active" ? "running" : "provisioning",
          ipAddress: publicIpv4,
          privateIp: privateIpv4,
          provisionedAt: d.status === "active" ? new Date() : null,
        }).where(eq(instances.id, row.id));

        if (d.status === "active" && publicIpv4) break;
      }
    };

    pollUntilActive().catch(console.error);
    return row;
  }

  static async terminateInstance(instanceId: string): Promise<void> {
    const [inst] = await db.select({ providerId: instances.providerId })
      .from(instances).where(eq(instances.id, instanceId)).limit(1);

    if (inst?.providerId) {
      try { await doFetch(`/droplets/${inst.providerId}`, { method: "DELETE" }); }
      catch (e) { console.error("DO delete failed:", e); }
    }

    await db.update(instances).set({
      status: "terminated", terminatedAt: new Date(),
    }).where(eq(instances.id, instanceId));
  }

  static async setInstanceStatus(instanceId: string, status: string): Promise<void> {
    await db.update(instances).set({ status }).where(eq(instances.id, instanceId));
  }

  static async provisionContainerService(
    userId: string,
    name: string,
    region: string,
    nodeSize: string,
    nodeCount: number,
    image: string,
    ports: { container: number; host: number }[],
    envVars: Record<string, string>,
    autoDeploy: boolean,
  ): Promise<any> {
    const containerSizeMap: Record<string, string> = {
      light: "s-1vcpu-512mb-10gb", standard: "s-1vcpu-1gb",
      plus: "s-1vcpu-2gb", pro: "s-2vcpu-4gb", max: "s-4vcpu-8gb",
    };
    const doSlug = containerSizeMap[nodeSize] || "s-1vcpu-1gb";

    const plan = await getPlanByProviderRef("digitalocean", doSlug);

    const userData = `#!/bin/bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
`;

    const { droplet } = await doFetch("/droplets", {
      method: "POST",
      body: JSON.stringify({
        name: `${name}-${region}`, region, size: doSlug,
        image: "ubuntu-24-04-x64",
        tags: ["cloudhost", "container-service"],
        user_data: userData,
      }),
    });

    const [row] = await db.insert(containerServices).values({
      userId, name, region, nodeSize, nodeCount,
      status: "provisioning", providerId: String(droplet.id),
      image, ports, envVars, autoDeploy,
    }).returning();

    const pollAndDeploy = async () => {
      for (let i = 0; i < 60; i++) {
        await sleep(5000);
        const { droplet: d } = await doFetch(`/droplets/${droplet.id}`);
        const publicIp = d.networks?.v4?.find((n: any) => n.type === "public")?.ip_address;

        if (publicIp) {
          const cfToken = process.env.CLOUDFLARE_API_TOKEN;
          const cfZone = process.env.CLOUDFLARE_ZONE_ID;
          if (cfToken && cfZone) {
            const subdomain = `${name}.${region}.containers.cloudhost.app`;
            try {
              await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZone}/dns_records`, {
                method: "POST",
                headers: { Authorization: `Bearer ${cfToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ type: "A", name: subdomain, content: publicIp, proxied: false, ttl: 120 }),
              });
            } catch (e) { console.error("Cloudflare DNS registration failed:", e); }
          }

          await db.update(containerServices).set({
            status: "running", ipAddress: publicIp,
            domain: `${name}.${ProvisioningEngine.generateRandomId()}.${region}.containers.cloudhost.app`,
            provisionedAt: new Date(),
          }).where(eq(containerServices.id, row.id));
          break;
        }

        await db.update(containerServices).set({
          status: d.status === "active" ? "provisioning" : "provisioning",
        }).where(eq(containerServices.id, row.id));
      }
    };

    pollAndDeploy().catch(console.error);
    return row;
  }

  private static generateRandomId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  static async provisionDatabase(userId: string, name: string, type: string, version: string, region: string): Promise<any> {
    const dbName = `db_${Math.random().toString(36).substring(2, 8)}`;
    const username = `user_${Math.random().toString(36).substring(2, 8)}`;
    const password = Math.random().toString(36).substring(2, 18);
    const port = type === "postgresql" ? 5432 : type === "mysql" || type === "mariadb" ? 3306 : type === "redis" ? 6379 : 27017;

    let host = `${dbName}.${region}.cloudhost.internal`;
    let connectionString = `${type}://${username}:${password}@${host}:${port}/${dbName}`;

    const neonApiKey = process.env.NEON_API_KEY;
    if (neonApiKey && type === "postgresql") {
      try {
        const neonRes = await fetch("https://console.neon.tech/api/v2/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${neonApiKey}` },
          body: JSON.stringify({
            project: {
              name: dbName, region_id: region,
              default_endpoint_settings: { autoscaling_limit_min_cu: 0.25, autoscaling_limit_max_cu: 1 },
            },
          }),
        });

        if (neonRes.ok) {
          const neonData = await neonRes.json();
          const project = neonData.project;
          const endpoint = project.endpoints?.[0];
          const dbInfo = project.database;
          const role = project.roles?.[0];

          if (endpoint && dbInfo && role) {
            host = endpoint.host;
            connectionString = `postgresql://${role.name}:${password}@${endpoint.host}/${dbInfo.name}?sslmode=require`;
          }
        }
      } catch (e) { console.error("Neon provisioning failed, falling back to simulated:", e); }
    }

    const [row] = await db.insert(databases).values({
      name, type: (type as any), version,
      status: "creating", host, port,
      databaseName: dbName, username, password,
    } as any).returning();

    setTimeout(async () => {
      await db.update(databases).set({ status: "running", }).where(eq(databases.id, row.id));
    }, 3000);

    return row;
  }

  static async deployContainer(deploymentId: string, framework: string, envVars: Record<string, string>): Promise<any> {
    const [deployment] = await db.update(deployments).set({
      status: "building",
    }).where(eq(deployments.id, deploymentId)).returning();

    try {
      const userData = `#!/bin/bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
`;

      const { droplet } = await doFetch("/droplets", {
        method: "POST",
        body: JSON.stringify({
          name: `deploy-${deploymentId.substring(0, 8)}`,
          region: "nyc1", size: "s-1vcpu-1gb",
          image: "ubuntu-24-04-x64",
          tags: ["cloudhost", "deployment"],
          user_data: userData,
        }),
      });

      const pollForIp = async () => {
        for (let i = 0; i < 60; i++) {
          await sleep(5000);
          const { droplet: d } = await doFetch(`/droplets/${droplet.id}`);
          const publicIp = d.networks?.v4?.find((n: any) => n.type === "public")?.ip_address;
          if (publicIp && d.status === "active") {
            const url = `http://${publicIp}`;
            const containerId = `ch-${deploymentId.substring(0, 8)}`;
            await db.update(deployments).set({
              status: "running", domain: url,
            }).where(eq(deployments.id, deploymentId));
            break;
          }
          if (i % 6 === 0) {
            await db.update(deployments).set({
            }).where(eq(deployments.id, deploymentId));
          }
        }
      };

      pollForIp().catch(console.error);
    } catch (e: any) {
      await db.update(deployments).set({
        status: "failed",
      }).where(eq(deployments.id, deploymentId));
    }

    return deployment;
  }

  static async getMetrics(resourceType: string, resourceId: string): Promise<any[]> {
    const rows = await db.select().from(metrics)
      .where(eq(metrics.resourceType, resourceType))
      .orderBy(metrics.recordedAt);
    return rows;
  }
}
