// Root-level seed runner
// Usage: npx tsx scripts/seed-plans.ts
// Requires DATABASE_URL env var to be set.

import "dotenv/config";
import { db, plans } from "@cloudhost/db";

async function run() {
  // Delegate to the package-level seed
  const { default: seed } = await import("../packages/db/src/seed/plans");
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
