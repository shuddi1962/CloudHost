import { NextRequest, NextResponse } from "next/server";
import { GitAccountManager } from "@/lib/git-account-manager";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    const clientId = process.env.GITHUB_CLIENT_ID || 'ov23li_demo_client_id';
    const redirectUri = `${req.nextUrl.origin}/api/git/oauth/github`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user&state=${Math.random().toString(36).slice(2)}`;
    return NextResponse.redirect(url);
  }

  const account = await GitAccountManager.connect('github', code);
  return NextResponse.redirect(new URL(`/dashboard/git/accounts/${account.id}`, req.url));
}
