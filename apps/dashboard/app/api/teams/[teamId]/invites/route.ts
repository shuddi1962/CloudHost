import { NextRequest, NextResponse } from "next/server";

interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: 'viewer' | 'deployer' | 'admin';
  status: 'pending' | 'accepted' | 'rejected';
  invited_at: string;
  expires_at: string;
}

const invites: TeamInvite[] = [];

export async function GET(_req: NextRequest, { params }: { params: { teamId: string } }) {
  const teamInvites = invites.filter(i => i.teamId === params.teamId);
  return NextResponse.json({ invites: teamInvites });
}

export async function POST(req: NextRequest, { params }: { params: { teamId: string } }) {
  const { email, role } = await req.json();
  const invite: TeamInvite = {
    id: `inv-${Date.now()}`,
    teamId: params.teamId,
    email,
    role: role || 'viewer',
    status: 'pending',
    invited_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  };
  invites.push(invite);
  return NextResponse.json({ invite }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const invite = invites.find(i => i.id === id);
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });
  invite.status = status;
  return NextResponse.json({ invite });
}
