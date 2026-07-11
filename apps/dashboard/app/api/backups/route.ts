import { NextRequest, NextResponse } from "next/server";
import { BackupManager } from "@/lib/backup-manager";

export async function GET(req: NextRequest) {
  const databaseId = req.nextUrl.searchParams.get('databaseId') || '';
  const [backups, schedules] = await Promise.all([
    BackupManager.list(databaseId),
    BackupManager.getSchedules(databaseId),
  ]);
  return NextResponse.json({ backups, schedules });
}

export async function POST(req: NextRequest) {
  const { databaseId, databaseName, type } = await req.json();
  const backup = await BackupManager.create(databaseId, databaseName, type);
  return NextResponse.json({ backup }, { status: 201 });
}
