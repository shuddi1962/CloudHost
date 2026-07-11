import { NextRequest, NextResponse } from "next/server";
import { RollbackManager } from "@/lib/rollback-manager";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { snapshotId } = await req.json();
  const snapshot = await RollbackManager.rollback(params.id, snapshotId);
  if (!snapshot) return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  return NextResponse.json({ message: "Rollback initiated", snapshot });
}
