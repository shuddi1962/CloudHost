import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Login failed" }, { status: response.status });
    }

    const nextRes = NextResponse.json(data);

    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      nextRes.headers.set("Set-Cookie", setCookieHeader);
    }

    return nextRes;
  } catch (error) {
    return handleApiError(error);
  }
}
