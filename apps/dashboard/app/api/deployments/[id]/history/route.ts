import { NextRequest, NextResponse } from "next/server";
import { RollbackManager } from "@/lib/rollback-manager";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const history = await RollbackManager.getHistory(params.id);
  return NextResponse.json({ history });
}
