import { NextRequest, NextResponse } from "next/server";
import { GitAccountManager } from "@/lib/git-account-manager";

export async function GET() {
  const accounts = await GitAccountManager.list();
  return NextResponse.json({ accounts });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';
  const ok = await GitAccountManager.disconnect(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Disconnected" });
}
