import { NextRequest, NextResponse } from "next/server";
import { CICDManager } from "@/lib/cicd-manager";

export async function GET() {
  const connections = await CICDManager.list();
  return NextResponse.json({ connections });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const conn = await CICDManager.create(data);
  return NextResponse.json({ connection: conn }, { status: 201 });
}
