import { NextRequest, NextResponse } from "next/server";
import { EdgeFunctionManager } from "@/lib/edge-function-manager";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const fn = await EdgeFunctionManager.deploy(params.id);
  if (!fn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deploying", function: fn });
}
