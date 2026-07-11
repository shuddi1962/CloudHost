import { NextRequest, NextResponse } from "next/server";
import { BackupManager } from "@/lib/backup-manager";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = await BackupManager.remove(params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
