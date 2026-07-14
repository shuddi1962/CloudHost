const postgres = require('postgres');
const path = require('path');

const url = process.env.DATABASE_URL;
const sql = postgres(url, { max: 1 });

function seedPrice(cost, multiplier = 1.5) {
  const n = cost * multiplier;
  const rounded = Math.round(n * 100) / 100;
  return rounded.toFixed(2);
}

const seeds = [];

// Droplet plans (instance)
const droplets = [
  { slug: 's-1vcpu-512mb-10gb', name: 'Nano', cpu: 1, ramGb: 0.5, storageGb: 10, transferTb: 0.5, cost: 4 },
  { slug: 's-1vcpu-1gb', name: 'Micro', cpu: 1, ramGb: 1, storageGb: 25, transferTb: 1, cost: 6 },
  { slug: 's-1vcpu-2gb', name: 'Starter', cpu: 1, ramGb: 2, storageGb: 40, transferTb: 1, cost: 6 },
  { slug: 's-2vcpu-2gb', name: 'Basic-2', cpu: 2, ramGb: 2, storageGb: 60, transferTb: 2, cost: 10 },
  { slug: 's-2vcpu-4gb', name: 'Basic', cpu: 2, ramGb: 4, storageGb: 80, transferTb: 2, cost: 12 },
  { slug: 's-2vcpu-8gb', name: 'Standard', cpu: 2, ramGb: 8, storageGb: 160, transferTb: 3, cost: 24 },
  { slug: 's-4vcpu-8gb', name: 'Performance-4', cpu: 4, ramGb: 8, storageGb: 240, transferTb: 4, cost: 36 },
  { slug: 's-4vcpu-16gb', name: 'Performance', cpu: 4, ramGb: 16, storageGb: 320, transferTb: 5, cost: 48 },
  { slug: 's-8vcpu-16gb', name: 'Pro-8', cpu: 8, ramGb: 16, storageGb: 400, transferTb: 6, cost: 72 },
  { slug: 's-8vcpu-32gb', name: 'Pro', cpu: 8, ramGb: 32, storageGb: 600, transferTb: 7, cost: 96 },
  { slug: 's-12vcpu-48gb', name: 'Advanced', cpu: 12, ramGb: 48, storageGb: 800, transferTb: 8, cost: 144 },
  { slug: 's-16vcpu-64gb', name: 'Enterprise', cpu: 16, ramGb: 64, storageGb: 1200, transferTb: 10, cost: 240 },
  { slug: 's-20vcpu-96gb', name: 'Enterprise-20', cpu: 20, ramGb: 96, storageGb: 1600, transferTb: 12, cost: 360 },
  { slug: 's-24vcpu-128gb', name: 'Enterprise-24', cpu: 24, ramGb: 128, storageGb: 2000, transferTb: 15, cost: 480 },
];
for (const d of droplets) {
  seeds.push({
    category: 'instance',
    planName: d.name,
    provider: 'digitalocean',
    providerRef: d.slug,
    providerCostUsd: d.cost.toFixed(2),
    yourPriceUsd: seedPrice(d.cost, 1.5),
    yourPriceNgn: seedPrice(d.cost * 1600, 1.4),
    specs: { cpu: d.cpu, ramGb: d.ramGb, storageGb: d.storageGb, transferTb: d.transferTb, type: 'ssd' },
    isActive: true,
  });
}

// Container service plans
const containerPlans = [
  { slug: 'container-1vcpu-1gb', name: 'Micro Container', cpu: 1, ramGb: 1, cost: 5 },
  { slug: 'container-1vcpu-2gb', name: 'Starter Container', cpu: 1, ramGb: 2, cost: 8 },
  { slug: 'container-2vcpu-2gb', name: 'Basic Container', cpu: 2, ramGb: 2, cost: 12 },
  { slug: 'container-2vcpu-4gb', name: 'Standard Container', cpu: 2, ramGb: 4, cost: 18 },
  { slug: 'container-4vcpu-8gb', name: 'Performance Container', cpu: 4, ramGb: 8, cost: 36 },
  { slug: 'container-8vcpu-16gb', name: 'Pro Container', cpu: 8, ramGb: 16, cost: 72 },
];
for (const p of containerPlans) {
  seeds.push({
    category: 'container',
    planName: p.name,
    provider: 'digitalocean',
    providerRef: p.slug,
    providerCostUsd: p.cost.toFixed(2),
    yourPriceUsd: seedPrice(p.cost, 1.5),
    yourPriceNgn: seedPrice(p.cost * 1600, 1.4),
    specs: { cpu: p.cpu, ramGb: p.ramGb, type: 'container' },
    isActive: true,
  });
}

// Database plans
const dbPlans = [
  { slug: 'db-1vcpu-1gb-10gb', name: 'Micro DB', cpu: 1, ramGb: 1, storageGb: 10, cost: 10 },
  { slug: 'db-1vcpu-2gb-20gb', name: 'Starter DB', cpu: 1, ramGb: 2, storageGb: 20, cost: 18 },
  { slug: 'db-2vcpu-4gb-40gb', name: 'Basic DB', cpu: 2, ramGb: 4, storageGb: 40, cost: 35 },
  { slug: 'db-2vcpu-8gb-80gb', name: 'Standard DB', cpu: 2, ramGb: 8, storageGb: 80, cost: 65 },
  { slug: 'db-4vcpu-16gb-160gb', name: 'Performance DB', cpu: 4, ramGb: 16, storageGb: 160, cost: 130 },
  { slug: 'db-8vcpu-32gb-320gb', name: 'Pro DB', cpu: 8, ramGb: 32, storageGb: 320, cost: 260 },
];
for (const p of dbPlans) {
  seeds.push({
    category: 'database',
    planName: p.name,
    provider: 'digitalocean',
    providerRef: p.slug,
    providerCostUsd: p.cost.toFixed(2),
    yourPriceUsd: seedPrice(p.cost, 1.5),
    yourPriceNgn: seedPrice(p.cost * 1600, 1.4),
    specs: { cpu: p.cpu, ramGb: p.ramGb, storageGb: p.storageGb, type: 'pg' },
    isActive: true,
  });
}

// Storage plans
const storagePlans = [
  { slug: 'storage-250gb', name: '250GB Volume', storageGb: 250, cost: 10 },
  { slug: 'storage-500gb', name: '500GB Volume', storageGb: 500, cost: 20 },
  { slug: 'storage-1tb', name: '1TB Volume', storageGb: 1024, cost: 40 },
  { slug: 'storage-2tb', name: '2TB Volume', storageGb: 2048, cost: 80 },
  { slug: 'storage-5tb', name: '5TB Volume', storageGb: 5120, cost: 200 },
  { slug: 'storage-10tb', name: '10TB Volume', storageGb: 10240, cost: 400 },
];
for (const p of storagePlans) {
  seeds.push({
    category: 'storage',
    planName: p.name,
    provider: 'digitalocean',
    providerRef: p.slug,
    providerCostUsd: p.cost.toFixed(2),
    yourPriceUsd: seedPrice(p.cost, 1.5),
    yourPriceNgn: seedPrice(p.cost * 1600, 1.4),
    specs: { storageGb: p.storageGb, type: 'volume' },
    isActive: true,
  });
}

// Deployment plans (Cloudflare Workers)
const deploymentPlans = [
  { slug: 'workers-free', name: 'Free Tier', requests: 100000, cost: 0 },
  { slug: 'workers-paid', name: 'Paid Tier', requests: 10000000, cost: 5 },
  { slug: 'workers-business', name: 'Business Tier', requests: 100000000, cost: 25 },
];
for (const p of deploymentPlans) {
  seeds.push({
    category: 'deployment',
    planName: p.name,
    provider: 'cloudflare',
    providerRef: p.slug,
    providerCostUsd: p.cost.toFixed(2),
    yourPriceUsd: p.cost > 0 ? seedPrice(p.cost, 1.5) : '0.00',
    yourPriceNgn: p.cost > 0 ? seedPrice(p.cost * 1600, 1.4) : '0.00',
    specs: { requests: p.requests, type: 'workers' },
    isActive: true,
  });
}

// SSL / addon plans
const sslPlans = [
  { slug: 'ssl-single', name: 'Single Domain SSL', domains: 1, cost: 8 },
  { slug: 'ssl-wildcard', name: 'Wildcard SSL', domains: 999, cost: 25 },
  { slug: 'ssl-multi', name: 'Multi-Domain SSL', domains: 5, cost: 15 },
];
for (const p of sslPlans) {
  seeds.push({
    category: 'ssl_addon',
    planName: p.name,
    provider: 'internal',
    providerRef: p.slug,
    providerCostUsd: p.cost.toFixed(2),
    yourPriceUsd: seedPrice(p.cost, 1.5),
    yourPriceNgn: seedPrice(p.cost * 1600, 1.4),
    specs: { domains: p.domains, type: 'ssl' },
    isActive: true,
  });
}

// VPN plans
const vpnPlans = [
  { slug: 'vpn-monthly', name: 'Monthly VPN', duration: 'monthly', cost: 3 },
  { slug: 'vpn-yearly', name: 'Yearly VPN', duration: 'yearly', cost: 30 },
  { slug: 'vpn-lifetime', name: 'Lifetime VPN', duration: 'lifetime', cost: 99 },
];
for (const p of vpnPlans) {
  seeds.push({
    category: 'vpn',
    planName: p.name,
    provider: 'internal',
    providerRef: p.slug,
    providerCostUsd: p.cost.toFixed(2),
    yourPriceUsd: seedPrice(p.cost, 1.5),
    yourPriceNgn: seedPrice(p.cost * 1600, 1.4),
    specs: { duration: p.duration, type: 'vpn' },
    isActive: true,
  });
}

(async () => {
  try {
    for (const s of seeds) {
      await sql`
        INSERT INTO plans (category, plan_name, provider, provider_ref, provider_cost_usd, your_price_usd, your_price_ngn, specs, is_active)
        VALUES (${s.category}, ${s.planName}, ${s.provider}, ${s.providerRef}, ${s.providerCostUsd}, ${s.yourPriceUsd}, ${s.yourPriceNgn}, ${JSON.stringify(s.specs)}, ${s.isActive})
      `;
    }
    console.log(`Seeded ${seeds.length} plans successfully`);
  } catch (err) {
    console.error('Error seeding:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
})();
