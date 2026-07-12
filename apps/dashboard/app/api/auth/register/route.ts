import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Registration failed" }, { status: response.status });
    }

    const nextRes = NextResponse.json(data, { status: 201 });

    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      nextRes.headers.set("Set-Cookie", setCookieHeader);
    }

    return nextRes;
  } catch (error) {
    return handleApiError(error);
  }
}
