import { NextRequest, NextResponse } from "next/server";
import { EdgeFunctionManager } from "@/lib/edge-function-manager";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const fn = await EdgeFunctionManager.get(params.id);
  if (!fn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const metrics = await EdgeFunctionManager.getMetrics(params.id);
  return NextResponse.json({ function: fn, metrics });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = await EdgeFunctionManager.remove(params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
