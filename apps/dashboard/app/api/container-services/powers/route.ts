import { NextResponse } from "next/server";

export async function GET() {
  const powerTiers = [
    { id: "nano", name: "Nano", cpu: "0.25 vCPU", ram_mb: 512, price: 7, desc: "Lowest cost for low-traffic websites" },
    { id: "micro", name: "Micro", cpu: "0.5 vCPU", ram_mb: 1024, price: 15, desc: "For simple web apps and APIs" },
    { id: "small", name: "Small", cpu: "1 vCPU", ram_mb: 2048, price: 30, desc: "Production apps with moderate traffic" },
    { id: "medium", name: "Medium", cpu: "2 vCPU", ram_mb: 4096, price: 55, desc: "High-traffic web applications" },
    { id: "large", name: "Large", cpu: "2 vCPU", ram_mb: 8192, price: 100, desc: "Resource-intensive applications" },
    { id: "xlarge", name: "Xlarge", cpu: "4 vCPU", ram_mb: 16384, price: 160, desc: "Heavy workloads and data processing" },
  ];
  return NextResponse.json(powerTiers);
}
