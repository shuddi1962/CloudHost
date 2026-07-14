const { execSync } = require('child_process');
const postgres = require('postgres');

// Get fresh credentials
const dumpOutput = execSync('npx supabase db dump --linked --dry-run 2>&1', {
  cwd: 'C:/Users/USER/Desktop/MY WORKFLOWS/Cloud host',
  encoding: 'utf8'
});

const match = dumpOutput.match(/PGPASSWORD="([^"]+)"/);
if (!match) throw new Error('Could not get password');
const password = match[1];

const url = `postgresql://cli_login_postgres.lkgzokfnpslqnubbqhru:${password}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`;
const sql = postgres(url, { max: 1 });

function seedPrice(cost, multiplier = 1.5) {
  const n = cost * multiplier;
  return (Math.round(n * 100) / 100).toFixed(2);
}

const seeds = [];

// All plan data
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
  seeds.push(`('instance','${d.name}','digitalocean','${d.slug}',${d.cost},${seedPrice(d.cost,1.5)},${seedPrice(d.cost*1600,1.4)},'${JSON.stringify({cpu:d.cpu,ramGb:d.ramGb,storageGb:d.storageGb,transferTb:d.transferTb,type:'ssd'})}',true)`);
}

const containerPlans = [
  { slug: 'container-1vcpu-1gb', name: 'Micro Container', cpu: 1, ramGb: 1, cost: 5 },
  { slug: 'container-1vcpu-2gb', name: 'Starter Container', cpu: 1, ramGb: 2, cost: 8 },
  { slug: 'container-2vcpu-2gb', name: 'Basic Container', cpu: 2, ramGb: 2, cost: 12 },
  { slug: 'container-2vcpu-4gb', name: 'Standard Container', cpu: 2, ramGb: 4, cost: 18 },
  { slug: 'container-4vcpu-8gb', name: 'Performance Container', cpu: 4, ramGb: 8, cost: 36 },
  { slug: 'container-8vcpu-16gb', name: 'Pro Container', cpu: 8, ramGb: 16, cost: 72 },
];
for (const p of containerPlans) {
  seeds.push(`('container','${p.name}','digitalocean','${p.slug}',${p.cost},${seedPrice(p.cost,1.5)},${seedPrice(p.cost*1600,1.4)},'${JSON.stringify({cpu:p.cpu,ramGb:p.ramGb,type:'container'})}',true)`);
}

const dbPlans = [
  { slug: 'db-1vcpu-1gb-10gb', name: 'Micro DB', cpu: 1, ramGb: 1, storageGb: 10, cost: 10 },
  { slug: 'db-1vcpu-2gb-20gb', name: 'Starter DB', cpu: 1, ramGb: 2, storageGb: 20, cost: 18 },
  { slug: 'db-2vcpu-4gb-40gb', name: 'Basic DB', cpu: 2, ramGb: 4, storageGb: 40, cost: 35 },
  { slug: 'db-2vcpu-8gb-80gb', name: 'Standard DB', cpu: 2, ramGb: 8, storageGb: 80, cost: 65 },
  { slug: 'db-4vcpu-16gb-160gb', name: 'Performance DB', cpu: 4, ramGb: 16, storageGb: 160, cost: 130 },
  { slug: 'db-8vcpu-32gb-320gb', name: 'Pro DB', cpu: 8, ramGb: 32, storageGb: 320, cost: 260 },
];
for (const p of dbPlans) {
  seeds.push(`('database','${p.name}','digitalocean','${p.slug}',${p.cost},${seedPrice(p.cost,1.5)},${seedPrice(p.cost*1600,1.4)},'${JSON.stringify({cpu:p.cpu,ramGb:p.ramGb,storageGb:p.storageGb,type:'pg'})}',true)`);
}

const storagePlans = [
  { slug: 'storage-250gb', name: '250GB Volume', storageGb: 250, cost: 10 },
  { slug: 'storage-500gb', name: '500GB Volume', storageGb: 500, cost: 20 },
  { slug: 'storage-1tb', name: '1TB Volume', storageGb: 1024, cost: 40 },
  { slug: 'storage-2tb', name: '2TB Volume', storageGb: 2048, cost: 80 },
  { slug: 'storage-5tb', name: '5TB Volume', storageGb: 5120, cost: 200 },
  { slug: 'storage-10tb', name: '10TB Volume', storageGb: 10240, cost: 400 },
];
for (const p of storagePlans) {
  seeds.push(`('storage','${p.name}','digitalocean','${p.slug}',${p.cost},${seedPrice(p.cost,1.5)},${seedPrice(p.cost*1600,1.4)},'${JSON.stringify({storageGb:p.storageGb,type:'volume'})}',true)`);
}

const deploymentPlans = [
  { slug: 'workers-free', name: 'Free Tier', requests: 100000, cost: 0 },
  { slug: 'workers-paid', name: 'Paid Tier', requests: 10000000, cost: 5 },
  { slug: 'workers-business', name: 'Business Tier', requests: 100000000, cost: 25 },
];
for (const p of deploymentPlans) {
  seeds.push(`('deployment','${p.name}','cloudflare','${p.slug}',${p.cost},${p.cost>0?seedPrice(p.cost,1.5):'0.00'},${p.cost>0?seedPrice(p.cost*1600,1.4):'0.00'},'${JSON.stringify({requests:p.requests,type:'workers'})}',true)`);
}

const sslPlans = [
  { slug: 'ssl-single', name: 'Single Domain SSL', domains: 1, cost: 8 },
  { slug: 'ssl-wildcard', name: 'Wildcard SSL', domains: 999, cost: 25 },
  { slug: 'ssl-multi', name: 'Multi-Domain SSL', domains: 5, cost: 15 },
];
for (const p of sslPlans) {
  seeds.push(`('ssl_addon','${p.name}','internal','${p.slug}',${p.cost},${seedPrice(p.cost,1.5)},${seedPrice(p.cost*1600,1.4)},'${JSON.stringify({domains:p.domains,type:'ssl'})}',true)`);
}

const vpnPlans = [
  { slug: 'vpn-monthly', name: 'Monthly VPN', duration: 'monthly', cost: 3 },
  { slug: 'vpn-yearly', name: 'Yearly VPN', duration: 'yearly', cost: 30 },
  { slug: 'vpn-lifetime', name: 'Lifetime VPN', duration: 'lifetime', cost: 99 },
];
for (const p of vpnPlans) {
  seeds.push(`('vpn','${p.name}','internal','${p.slug}',${p.cost},${seedPrice(p.cost,1.5)},${seedPrice(p.cost*1600,1.4)},'${JSON.stringify({duration:p.duration,type:'vpn'})}',true)`);
}

(async () => {
  try {
    // Disable RLS on plans table
    await sql.unsafe('ALTER TABLE plans DISABLE ROW LEVEL SECURITY');

    // Insert all in batches
    for (let i = 0; i < seeds.length; i += 10) {
      const batch = seeds.slice(i, i + 10).join(',');
      await sql.unsafe(`INSERT INTO plans (category, plan_name, provider, provider_ref, provider_cost_usd, your_price_usd, your_price_ngn, specs, is_active) VALUES ${batch}`);
    }
    console.log(`Seeded ${seeds.length} plans successfully`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
})();
