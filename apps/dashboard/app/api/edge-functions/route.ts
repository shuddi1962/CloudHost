import { NextRequest, NextResponse } from "next/server";
import { EdgeFunctionManager } from "@/lib/edge-function-manager";

export async function GET() {
  const functions = await EdgeFunctionManager.list();
  return NextResponse.json({ functions });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const fn = await EdgeFunctionManager.create(data);
  return NextResponse.json({ function: fn }, { status: 201 });
}
