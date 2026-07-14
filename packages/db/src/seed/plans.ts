import { db } from "../index";
import { plans } from "../schema/plans";

function seedPrice(cost: number, multiplier = 1.5): string {
  const n = cost * multiplier;
  const rounded = Math.round(n * 100) / 100;
  return rounded.toFixed(2);
}

interface SeedPlan {
  category: string;
  planName: string;
  provider: "digitalocean" | "cloudflare" | "internal";
  providerRef: string;
  providerCostUsd: string;
  yourPriceUsd: string;
  yourPriceNgn: string | null;
  specs: Record<string, unknown>;
  isActive: boolean;
}

function dropletPlans(): SeedPlan[] {
  const droplets: { slug: string; name: string; cpu: number; ramGb: number; storageGb: number; transferTb: number; cost: number }[] = [
    { slug: "s-1vcpu-512mb-10gb", name: "Nano", cpu: 1, ramGb: 0.5, storageGb: 10, transferTb: 0.5, cost: 4 },
    { slug: "s-1vcpu-1gb", name: "Micro", cpu: 1, ramGb: 1, storageGb: 25, transferTb: 1, cost: 6 },
    { slug: "s-1vcpu-2gb", name: "Starter", cpu: 1, ramGb: 2, storageGb: 40, transferTb: 1, cost: 6 },
    { slug: "s-2vcpu-2gb", name: "Basic-2", cpu: 2, ramGb: 2, storageGb: 60, transferTb: 2, cost: 10 },
    { slug: "s-2vcpu-4gb", name: "Basic", cpu: 2, ramGb: 4, storageGb: 80, transferTb: 2, cost: 12 },
    { slug: "s-2vcpu-8gb", name: "Standard", cpu: 2, ramGb: 8, storageGb: 160, transferTb: 3, cost: 24 },
    { slug: "s-4vcpu-8gb", name: "Performance-4", cpu: 4, ramGb: 8, storageGb: 240, transferTb: 4, cost: 36 },
    { slug: "s-4vcpu-16gb", name: "Performance", cpu: 4, ramGb: 16, storageGb: 320, transferTb: 4, cost: 48 },
    { slug: "s-8vcpu-32gb", name: "Business", cpu: 8, ramGb: 32, storageGb: 640, transferTb: 5, cost: 96 },
    { slug: "s-12vcpu-48gb", name: "Business-12", cpu: 12, ramGb: 48, storageGb: 960, transferTb: 6, cost: 144 },
    { slug: "s-16vcpu-64gb", name: "Enterprise", cpu: 16, ramGb: 64, storageGb: 1280, transferTb: 7, cost: 192 },
    { slug: "s-20vcpu-96gb", name: "Enterprise-20", cpu: 20, ramGb: 96, storageGb: 1920, transferTb: 8, cost: 288 },
    { slug: "s-24vcpu-128gb", name: "Enterprise-24", cpu: 24, ramGb: 128, storageGb: 2560, transferTb: 9, cost: 384 },
  ];

  return droplets.map((d) => ({
    category: "instance",
    planName: d.name,
    provider: "digitalocean" as const,
    providerRef: d.slug,
    providerCostUsd: d.cost.toString(),
    yourPriceUsd: seedPrice(d.cost),
    yourPriceNgn: null,
    specs: {
      cpu: `${d.cpu} vCPU`,
      ram: `${d.ramGb} GB`,
      storage: `${d.storageGb} GB SSD`,
      transfer: `${d.transferTb} TB`,
    },
    isActive: true,
  }));
}

function containerPlans(): SeedPlan[] {
  const sizes: { slug: string; name: string; ram: string; cpu: string; cost: number }[] = [
    { slug: "s-1vcpu-512mb-10gb", name: "Light", ram: "512 MB", cpu: "shared vCPU", cost: 4 },
    { slug: "s-1vcpu-1gb", name: "Standard", ram: "1 GB", cpu: "shared vCPU", cost: 6 },
    { slug: "s-1vcpu-2gb", name: "Plus", ram: "2 GB", cpu: "1 vCPU", cost: 6 },
    { slug: "s-2vcpu-4gb", name: "Pro", ram: "4 GB", cpu: "2 vCPUs", cost: 12 },
    { slug: "s-4vcpu-8gb", name: "Max", ram: "8 GB", cpu: "4 vCPUs", cost: 24 },
  ];

  return sizes.map((s) => ({
    category: "container",
    planName: s.name,
    provider: "digitalocean" as const,
    providerRef: s.slug,
    providerCostUsd: s.cost.toString(),
    yourPriceUsd: seedPrice(s.cost),
    yourPriceNgn: null,
    specs: { cpu: s.cpu, ram: s.ram },
    isActive: true,
  }));
}

function databasePlans(): SeedPlan[] {
  const tiers: { name: string; ram: string; cpu: string; storage: string; cost: number }[] = [
    { name: "Starter", ram: "1 GB", cpu: "1 vCPU", storage: "10 GB", cost: 15 },
    { name: "Basic", ram: "2 GB", cpu: "1 vCPU", storage: "25 GB", cost: 25 },
    { name: "Standard", ram: "4 GB", cpu: "2 vCPUs", storage: "50 GB", cost: 50 },
    { name: "Pro", ram: "8 GB", cpu: "2 vCPUs", storage: "100 GB", cost: 100 },
    { name: "Business", ram: "16 GB", cpu: "4 vCPUs", storage: "200 GB", cost: 200 },
    { name: "Enterprise", ram: "32 GB", cpu: "8 vCPUs", storage: "500 GB", cost: 400 },
  ];

  return tiers.map((t) => ({
    category: "database",
    planName: t.name,
    provider: "digitalocean" as const,
    providerRef: `db-${t.name.toLowerCase()}`,
    providerCostUsd: t.cost.toString(),
    yourPriceUsd: seedPrice(t.cost),
    yourPriceNgn: null,
    specs: { cpu: t.cpu, ram: t.ram, storage: t.storage },
    isActive: true,
  }));
}

function storagePlans(): SeedPlan[] {
  const tiers: { name: string; storage: string; transfer: string; cost: number }[] = [
    { name: "Free", storage: "1 GB", transfer: "1 GB", cost: 0 },
    { name: "Starter", storage: "10 GB", transfer: "50 GB", cost: 5 },
    { name: "Basic", storage: "50 GB", transfer: "250 GB", cost: 10 },
    { name: "Standard", storage: "250 GB", transfer: "500 GB", cost: 20 },
    { name: "Pro", storage: "1 TB", transfer: "1 TB", cost: 50 },
    { name: "Business", storage: "5 TB", transfer: "5 TB", cost: 100 },
  ];

  return tiers.map((t) => ({
    category: "storage",
    planName: t.name,
    provider: "digitalocean" as const,
    providerRef: `spaces-${t.name.toLowerCase()}`,
    providerCostUsd: t.cost.toString(),
    yourPriceUsd: seedPrice(t.cost),
    yourPriceNgn: null,
    specs: { storage: t.storage, transfer: t.transfer },
    isActive: true,
  }));
}

function deploymentPlans(): SeedPlan[] {
  const tiers: { name: string; cost: number; specs: Record<string, unknown> }[] = [
    { name: "Starter", cost: 7, specs: { builds: "5/mo", bandwidth: "50 GB", team: "1 user" } },
    { name: "Pro", cost: 19, specs: { builds: "50/mo", bandwidth: "500 GB", team: "5 users" } },
    { name: "Business", cost: 49, specs: { builds: "500/mo", bandwidth: "1 TB", team: "Unlimited" } },
    { name: "Enterprise", cost: 149, specs: { builds: "Unlimited", bandwidth: "5 TB", team: "Unlimited" } },
  ];

  return tiers.map((t) => ({
    category: "deployment",
    planName: t.name,
    provider: "internal" as const,
    providerRef: `deploy-${t.name.toLowerCase()}`,
    providerCostUsd: t.cost.toString(),
    yourPriceUsd: seedPrice(t.cost),
    yourPriceNgn: null,
    specs: t.specs,
    isActive: true,
  }));
}

function sslPlans(): SeedPlan[] {
  const tiers: { name: string; cost: number; specs: Record<string, unknown> }[] = [
    { name: "Free", cost: 0, specs: { validation: "Domain", warranty: "None" } },
    { name: "Basic", cost: 3, specs: { validation: "Domain", warranty: "$10,000" } },
    { name: "Standard", cost: 10, specs: { validation: "Organization", warranty: "$50,000" } },
    { name: "Premium", cost: 25, specs: { validation: "Extended", warranty: "$250,000" } },
  ];

  return tiers.map((t) => ({
    category: "ssl_addon",
    planName: t.name,
    provider: "internal" as const,
    providerRef: `ssl-${t.name.toLowerCase()}`,
    providerCostUsd: t.cost.toString(),
    yourPriceUsd: seedPrice(t.cost),
    yourPriceNgn: null,
    specs: t.specs,
    isActive: true,
  }));
}

function vpnPlans(): SeedPlan[] {
  const tiers: { name: string; cost: number; specs: Record<string, unknown> }[] = [
    { name: "Basic", cost: 2, specs: { devices: 5, servers: "10+", speed: "Standard" } },
    { name: "Pro", cost: 5, specs: { devices: 10, servers: "50+", speed: "High" } },
    { name: "Business", cost: 12, specs: { devices: "Unlimited", servers: "All", speed: "Priority", dedicatedIp: true } },
  ];

  return tiers.map((t) => ({
    category: "vpn",
    planName: t.name,
    provider: "internal" as const,
    providerRef: `vpn-${t.name.toLowerCase()}`,
    providerCostUsd: t.cost.toString(),
    yourPriceUsd: seedPrice(t.cost),
    yourPriceNgn: null,
    specs: t.specs,
    isActive: true,
  }));
}

const allPlans: SeedPlan[] = [
  ...dropletPlans(),
  ...containerPlans(),
  ...databasePlans(),
  ...storagePlans(),
  ...deploymentPlans(),
  ...sslPlans(),
  ...vpnPlans(),
];

async function seed() {
  console.log(`Seeding ${allPlans.length} plans...`);

  for (const plan of allPlans) {
    await db.insert(plans).values(plan).onConflictDoNothing();
    console.log(`  ✓ ${plan.category}/${plan.planName} — $${plan.yourPriceUsd}/mo`);
  }

  console.log("\nDone! Plans seeded successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
