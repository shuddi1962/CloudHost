import { jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { ApiError } from "@/lib/api-error";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface AuthenticatedRequest {
  userId: string;
  userEmail: string;
}

function getToken(): string | null {
  const headersList = headers();
  const authHeader = headersList.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookieStore = cookies();
  return cookieStore.get("token")?.value || null;
}

async function verifyJwt(token: string): Promise<AuthenticatedRequest | null> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.sub as string,
      userEmail: (payload.email as string) || "",
    };
  } catch {
    return null;
  }
}

async function fetchFromApi(path: string, options?: RequestInit): Promise<Response> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  return response;
}

export { fetchFromApi };

export async function requireAuth(): Promise<AuthenticatedRequest> {
  const token = getToken();

  if (token) {
    const jwtResult = await verifyJwt(token);
    if (jwtResult) return jwtResult;
  }

  throw new ApiError(401, "Unauthorized");
}

export async function requireAdmin(): Promise<AuthenticatedRequest> {
  const auth = await requireAuth();
  const res = await fetchFromApi(`/api/admin/check?userId=${auth.userId}`);
  if (!res.ok) throw new ApiError(403, "Admin access required");
  const data = await res.json();
  if (!data.isAdmin && !data.isSuperAdmin) throw new ApiError(403, "Admin access required");
  return auth;
}
