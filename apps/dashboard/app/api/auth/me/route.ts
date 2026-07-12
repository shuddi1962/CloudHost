import { NextResponse } from "next/server";
import { requireAuth, fetchFromApi } from "@/lib/api-middleware";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const auth = await requireAuth();
    const res = await fetchFromApi(`/api/auth/me`);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ user: data.user });
    }
    return NextResponse.json({ user: { id: auth.userId } });
  } catch (error) {
    return handleApiError(error);
  }
}
