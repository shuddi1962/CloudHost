import { createClient } from "@/lib/supabase-server";
import { ApiError } from "@/lib/api-error";

export interface AuthenticatedRequest {
  userId: string;
  userEmail: string;
}

export async function requireAuth(): Promise<AuthenticatedRequest> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new ApiError(401, "Unauthorized");
  return { userId: user.id, userEmail: user.email || "" };
}

export async function requireAdmin(): Promise<AuthenticatedRequest> {
  const auth = await requireAuth();
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("is_admin,is_super_admin").eq("id", auth.userId).single();
  if (!profile?.is_admin && !profile?.is_super_admin) throw new ApiError(403, "Admin access required");
  return auth;
}
