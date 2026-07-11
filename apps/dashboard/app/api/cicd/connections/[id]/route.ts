import { NextRequest, NextResponse } from "next/server";
import { CICDManager } from "@/lib/cicd-manager";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const connection = await CICDManager.get(params.id);
  if (!connection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ connection });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const connection = await CICDManager.update(params.id, data);
  if (!connection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ connection });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = await CICDManager.remove(params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
