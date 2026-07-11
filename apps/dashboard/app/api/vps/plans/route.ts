import { NextRequest, NextResponse } from "next/server";

const plans = [
  { id: "nano", name: "Nano", cpu: 1, ram_mb: 512, storage_gb: 20, transfer_tb: 1, price_monthly: 5 },
  { id: "micro", name: "Micro", cpu: 1, ram_mb: 1024, storage_gb: 40, transfer_tb: 2, price_monthly: 10 },
  { id: "small", name: "Small", cpu: 2, ram_mb: 2048, storage_gb: 60, transfer_tb: 3, price_monthly: 20 },
  { id: "medium", name: "Medium", cpu: 2, ram_mb: 4096, storage_gb: 80, transfer_tb: 4, price_monthly: 40 },
  { id: "large", name: "Large", cpu: 4, ram_mb: 8192, storage_gb: 160, transfer_tb: 5, price_monthly: 80 },
  { id: "xlarge", name: "X-Large", cpu: 8, ram_mb: 16384, storage_gb: 320, transfer_tb: 6, price_monthly: 160 },
  { id: "2xlarge", name: "2X-Large", cpu: 16, ram_mb: 32768, storage_gb: 640, transfer_tb: 8, price_monthly: 320 },
];

const regions = [
  { id: "eu-west-3", name: "Paris, France", available_zones: ["eu-west-3a", "eu-west-3b", "eu-west-3c"] },
  { id: "us-east-1", name: "N. Virginia, USA", available_zones: ["us-east-1a", "us-east-1b", "us-east-1c"] },
  { id: "us-west-2", name: "Oregon, USA", available_zones: ["us-west-2a", "us-west-2b"] },
  { id: "ap-southeast-1", name: "Singapore", available_zones: ["ap-southeast-1a", "ap-southeast-1b"] },
  { id: "eu-central-1", name: "Frankfurt, Germany", available_zones: ["eu-central-1a", "eu-central-1b"] },
  { id: "ap-northeast-1", name: "Tokyo, Japan", available_zones: ["ap-northeast-1a", "ap-northeast-1c"] },
];

export async function GET() {
  return NextResponse.json({ plans, regions });
}
