import { NextRequest, NextResponse } from "next/server";
import { GitAccountManager } from "@/lib/git-account-manager";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const account = await GitAccountManager.get(params.id);
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ account });
}
