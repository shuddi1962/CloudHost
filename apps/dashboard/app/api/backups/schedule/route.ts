import { NextRequest, NextResponse } from "next/server";
import { BackupManager } from "@/lib/backup-manager";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const schedule = await BackupManager.saveSchedule(data);
  return NextResponse.json({ schedule }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';
  const ok = await BackupManager.deleteSchedule(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
