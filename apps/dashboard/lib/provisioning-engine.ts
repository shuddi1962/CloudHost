import { createClient } from "@/lib/supabase-server";

const REGIONS: Record<string, { name: string; az: string[] }> = {
  "eu-west-3": { name: "Paris, France", az: ["eu-west-3a", "eu-west-3b", "eu-west-3c"] },
  "us-east-1": { name: "N. Virginia, USA", az: ["us-east-1a", "us-east-1b", "us-east-1c"] },
  "us-west-2": { name: "Oregon, USA", az: ["us-west-2a", "us-west-2b"] },
  "ap-southeast-1": { name: "Singapore", az: ["ap-southeast-1a", "ap-southeast-1b"] },
  "eu-central-1": { name: "Frankfurt, Germany", az: ["eu-central-1a", "eu-central-1b"] },
  "ap-northeast-1": { name: "Tokyo, Japan", az: ["ap-northeast-1a", "ap-northeast-1c"] },
};

const PLAN_SPECS: Record<string, { cpu: number; ram_mb: number; storage_gb: number; transfer_tb: number; price: number }> = {
  nano:     { cpu: 1, ram_mb: 512,  storage_gb: 20,  transfer_tb: 1,  price: 5 },
  micro:    { cpu: 1, ram_mb: 1024, storage_gb: 40,  transfer_tb: 2,  price: 10 },
  small:    { cpu: 2, ram_mb: 2048, storage_gb: 60,  transfer_tb: 3,  price: 20 },
  medium:   { cpu: 2, ram_mb: 4096, storage_gb: 80,  transfer_tb: 4,  price: 40 },
  large:    { cpu: 4, ram_mb: 8192, storage_gb: 160, transfer_tb: 5,  price: 80 },
  xlarge:   { cpu: 8, ram_mb: 16384,storage_gb: 320, transfer_tb: 6,  price: 160 },
  "2xlarge": { cpu: 16, ram_mb: 32768,storage_gb: 640, transfer_tb: 8,  price: 320 },
};

function generateIp(): string {
  return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
}

function generatePublicIp(): string {
  const range = Math.floor(Math.random() * 50) + 50;
  return `${range}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
}

export class ProvisioningEngine {
  static async provisionInstance(userId: string, name: string, plan: string, region: string, blueprint: string, platform: string, tags: string[] = []): Promise<any> {
    const spec = PLAN_SPECS[plan] || PLAN_SPECS.nano;
    const regionInfo = REGIONS[region] || REGIONS["eu-west-3"];
    const az = regionInfo.az[Math.floor(Math.random() * regionInfo.az.length)];

    const supabase = createClient();
    const { data, error } = await supabase.from("instances").insert({
      user_id: userId,
      name,
      region: az,
      plan,
      blueprint,
      platform,
      status: "provisioning",
      ip_address: generatePublicIp(),
      private_ip: generateIp(),
      cpu: spec.cpu,
      ram_mb: spec.ram_mb,
      storage_gb: spec.storage_gb,
      transfer_tb: spec.transfer_tb,
      price_monthly: spec.price,
      tags,
    }).select().single();

    if (error) throw error;

    // Simulate async provisioning (5 seconds then mark running)
    setTimeout(async () => {
      await supabase.from("instances").update({
        status: "running",
        provisioned_at: new Date().toISOString(),
      }).eq("id", data.id);
    }, 5000);

    return data;
  }

  static async terminateInstance(instanceId: string): Promise<void> {
    const supabase = createClient();
    await supabase.from("instances").update({
      status: "terminated",
      terminated_at: new Date().toISOString(),
    }).eq("id", instanceId);
  }

  static async setInstanceStatus(instanceId: string, status: string): Promise<void> {
    const supabase = createClient();
    await supabase.from("instances").update({ status }).eq("id", instanceId);
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

    // Simulate build + deploy
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
