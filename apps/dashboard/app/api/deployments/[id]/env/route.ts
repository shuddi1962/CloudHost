import { NextRequest, NextResponse } from "next/server";

const envStore = new Map<string, Record<string, string>>();

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const vars = envStore.get(params.id) || {};
  return NextResponse.json({ env_vars: vars });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "Key is required" }, { status: 400 });
  const vars = envStore.get(params.id) || {};
  vars[key] = value;
  envStore.set(params.id, vars);
  return NextResponse.json({ env_vars: vars });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const vars = envStore.get(params.id) || {};
  Object.assign(vars, data);
  envStore.set(params.id, vars);
  return NextResponse.json({ env_vars: vars });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const key = req.nextUrl.searchParams.get('key');
  if (!key) return NextResponse.json({ error: "Key is required" }, { status: 400 });
  const vars = envStore.get(params.id) || {};
  delete vars[key];
  return NextResponse.json({ env_vars: vars });
}
