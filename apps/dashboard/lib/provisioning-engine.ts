import { createClient } from "@/lib/supabase-server";

const DO_API = "https://api.digitalocean.com/v2";

function doHeaders(): Record<string, string> {
  const token = process.env.DIGITALOCEAN_API_TOKEN;
  if (!token) throw new Error("DIGITALOCEAN_API_TOKEN not set");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
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

const PLAN_SPECS: Record<string, { cpu: number; ram_mb: number; storage_gb: number; transfer_tb: number; price: number }> = {
  "s-1vcpu-2gb":  { cpu: 1, ram_mb: 2048,  storage_gb: 40,  transfer_tb: 1, price: 6 },
  "s-2vcpu-4gb":  { cpu: 2, ram_mb: 4096,  storage_gb: 80,  transfer_tb: 2, price: 12 },
  "s-2vcpu-8gb":  { cpu: 2, ram_mb: 8192,  storage_gb: 160, transfer_tb: 3, price: 24 },
  "s-4vcpu-16gb": { cpu: 4, ram_mb: 16384, storage_gb: 320, transfer_tb: 4, price: 48 },
  "s-8vcpu-32gb": { cpu: 8, ram_mb: 32768, storage_gb: 640, transfer_tb: 5, price: 96 },
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
    const spec = PLAN_SPECS[slug] || PLAN_SPECS["s-1vcpu-2gb"];

    // 1. Create droplet via DO API
    const dropletPayload: any = {
      name,
      region,
      size: slug,
      image,
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

    // 2. Insert DB row immediately
    const supabase = createClient();
    const { data, error } = await supabase.from("instances").insert({
      user_id: userId,
      name,
      region,
      plan: slug,
      blueprint,
      platform,
      status: "provisioning",
      provider_id: String(droplet.id),
      ip_address: null,
      private_ip: null,
      cpu: spec.cpu,
      ram_mb: spec.ram_mb,
      storage_gb: spec.storage_gb,
      transfer_tb: spec.transfer_tb,
      price_monthly: spec.price,
      tags,
    }).select().single();

    if (error) throw error;

    // 3. Poll DO until droplet is active with public IP
    const pollUntilActive = async () => {
      for (let i = 0; i < 60; i++) {
        await sleep(5000);
        const { droplet: d } = await doFetch(`/droplets/${droplet.id}`);
        const publicIpv4 = d.networks?.v4?.find((n: any) => n.type === "public")?.ip_address || null;
        const privateIpv4 = d.networks?.v4?.find((n: any) => n.type === "private")?.ip_address || null;

        await supabase.from("instances").update({
          status: d.status === "active" ? "running" : "provisioning",
          ip_address: publicIpv4,
          private_ip: privateIpv4,
          provisioned_at: d.status === "active" ? new Date().toISOString() : null,
        }).eq("id", data.id);

        if (d.status === "active" && publicIpv4) break;
      }
    };

    pollUntilActive().catch(console.error);

    return data;
  }

  static async terminateInstance(instanceId: string): Promise<void> {
    const supabase = createClient();
    const { data: inst } = await supabase.from("instances")
      .select("provider_id")
      .eq("id", instanceId)
      .single();

    if (inst?.provider_id) {
      try {
        await doFetch(`/droplets/${inst.provider_id}`, { method: "DELETE" });
      } catch (e) {
        console.error("DO delete failed:", e);
      }
    }

    await supabase.from("instances").update({
      status: "terminated",
      terminated_at: new Date().toISOString(),
    }).eq("id", instanceId);
  }

  static async setInstanceStatus(instanceId: string, status: string): Promise<void> {
    const supabase = createClient();
    await supabase.from("instances").update({ status }).eq("id", instanceId);
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
    // Map node size to DO slug
    const containerSizeMap: Record<string, string> = {
      light: "s-1vcpu-512mb-10gb",
      standard: "s-1vcpu-1gb",
      plus: "s-1vcpu-2gb",
      pro: "s-2vcpu-4gb",
      max: "s-4vcpu-8gb",
    };
    const doSlug = containerSizeMap[nodeSize] || "s-1vcpu-1gb";

    // Create a VM with Docker pre-installed via cloud-init
    const userData = `#!/bin/bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
`;

    const { droplet } = await doFetch("/droplets", {
      method: "POST",
      body: JSON.stringify({
        name: `${name}-${region}`,
        region,
        size: doSlug,
        image: "ubuntu-24-04-x64",
        tags: ["cloudhost", "container-service"],
        user_data: userData,
      }),
    });

    const supabase = createClient();
    const { data, error } = await supabase.from("container_services").insert({
      user_id: userId,
      name,
      region,
      node_size: nodeSize,
      node_count: nodeCount,
      status: "provisioning",
      provider_id: String(droplet.id),
      image,
      ports,
      env_vars: envVars,
      auto_deploy: autoDeploy,
    }).select().single();

    if (error) throw error;

    // Poll for active + IP
    const pollAndDeploy = async () => {
      for (let i = 0; i < 60; i++) {
        await sleep(5000);
        const { droplet: d } = await doFetch(`/droplets/${droplet.id}`);
        const publicIp = d.networks?.v4?.find((n: any) => n.type === "public")?.ip_address;

        if (publicIp) {
          // Register DNS via Cloudflare API
          const cfToken = process.env.CLOUDFLARE_API_TOKEN;
          const cfZone = process.env.CLOUDFLARE_ZONE_ID;
          if (cfToken && cfZone) {
            const subdomain = `${name}.${region}.containers.cloudhost.app`;
            try {
              await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZone}/dns_records`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${cfToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "A",
                  name: subdomain,
                  content: publicIp,
                  proxied: false,
                  ttl: 120,
                }),
              });
            } catch (e) {
              console.error("Cloudflare DNS registration failed:", e);
            }
          }

          await supabase.from("container_services").update({
            status: "running",
            ip_address: publicIp,
            domain: `${name}.${this.generateRandomId()}.${region}.containers.cloudhost.app`,
            provisioned_at: new Date().toISOString(),
          }).eq("id", data.id);
          break;
        }

        await supabase.from("container_services").update({
          status: d.status === "active" ? "provisioning" : "provisioning",
          ip_address: null,
        }).eq("id", data.id);
      }
    };

    pollAndDeploy().catch(console.error);

    return data;
  }

  private static generateRandomId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  static async provisionDatabase(userId: string, name: string, type: string, version: string, region: string): Promise<any> {
    const supabase = createClient();
    const dbName = `db_${Math.random().toString(36).substring(2, 8)}`;
    const username = `user_${Math.random().toString(36).substring(2, 8)}`;
    const password = Math.random().toString(36).substring(2, 18);

    const { data, error } = await supabase.from("databases").insert({
      user_id: userId,
      name,
      type,
      version,
      status: "creating",
      host: `${dbName}.${region}.cloudhost.internal`,
      port: type === "postgresql" ? 5432 : type === "mysql" || type === "mariadb" ? 3306 : type === "redis" ? 6379 : 27017,
      database_name: dbName,
      username,
      password,
      region,
    }).select().single();

    if (error) throw error;

    setTimeout(async () => {
      await supabase.from("databases").update({
        status: "running",
        connection_string: `${type}://${username}:${password}@${data.host}:${data.port}/${dbName}`,
      }).eq("id", data.id);
    }, 3000);

    return data;
  }

  static async deployContainer(deploymentId: string, framework: string, envVars: Record<string, string>): Promise<any> {
    const supabase = createClient();
    const { data: deployment } = await supabase.from("deployments").update({
      status: "building",
    }).eq("id", deploymentId).select().single();

    setTimeout(async () => {
      const containerId = `ch-${Math.random().toString(36).substring(2, 10)}`;
      await supabase.from("deployments").update({
        status: "running",
        container_id: containerId,
        deployed_at: new Date().toISOString(),
      }).eq("id", deploymentId);
    }, 8000);

    return deployment;
  }

  static async getMetrics(resourceType: string, resourceId: string): Promise<any[]> {
    const supabase = createClient();
    const { data } = await supabase.from("metrics")
      .select("*")
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId)
      .order("recorded_at", { ascending: false })
      .limit(60);
    return data || [];
  }
}
