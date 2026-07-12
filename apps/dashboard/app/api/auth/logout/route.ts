import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function POST(_request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
    });

    const data = await response.json();

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
