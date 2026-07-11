import { NextRequest, NextResponse } from "next/server";
import { EdgeFunctionManager } from "@/lib/edge-function-manager";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const limit = Number(_req.nextUrl.searchParams.get('limit')) || 50;
  const logs = await EdgeFunctionManager.getLogs(params.id, limit);
  return NextResponse.json({ logs });
}
