import { NextRequest, NextResponse } from "next/server";
import { BackupManager } from "@/lib/backup-manager";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const backup = await BackupManager.restore(params.id);
  if (!backup) return NextResponse.json({ error: "Backup not found or not completed" }, { status: 400 });
  return NextResponse.json({ message: "Restore initiated", backup });
}
