import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const { email, password, ...profileData } = await request.json();

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }
    if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

    const supabase = createClient();

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: profileData },
    });

    if (signUpError) throw new ApiError(400, signUpError.message);
    if (!authData.user) throw new ApiError(500, "Failed to create user");

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: authData.user.email,
      ...profileData,
    });

    if (profileError) throw new ApiError(500, profileError.message);

    return NextResponse.json(
      { user: authData.user, session: authData.session },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
