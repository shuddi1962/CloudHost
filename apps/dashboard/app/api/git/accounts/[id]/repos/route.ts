import { NextRequest, NextResponse } from "next/server";
import { GitAccountManager } from "@/lib/git-account-manager";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const repos = await GitAccountManager.listRepos(params.id);
  return NextResponse.json({ repos });
}
