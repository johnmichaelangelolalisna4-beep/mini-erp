import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { id, role, email } = await request.json();

    if (!id || !role) {
      return NextResponse.json({ error: "User ID and Role are required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Update public.profiles table
    let updatedProfile = null;

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (profileError) {
      console.warn("Profile update by ID notice:", profileError);
    } else {
      updatedProfile = profileData;
    }

    // Fallback: If ID didn't match profile row, try updating by email
    if (!updatedProfile && email) {
      const { data: emailProfile, error: emailError } = await supabaseAdmin
        .from("profiles")
        .update({ role })
        .ilike("email", email)
        .select()
        .maybeSingle();

      if (!emailError && emailProfile) {
        updatedProfile = emailProfile;
      }
    }

    // 2. Update Supabase Auth (auth.users) user_metadata
    try {
      // Try direct update by Auth ID
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: { role },
      });

      if (authUpdateError) {
        console.warn("Auth update by ID notice, searching by email:", authUpdateError.message);
        // If ID was custom, find user by email in auth
        if (email) {
          const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
          const matchedUser = userList?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
          );

          if (matchedUser) {
            await supabaseAdmin.auth.admin.updateUserById(matchedUser.id, {
              user_metadata: { role },
            });
          }
        }
      }
    } catch (authErr) {
      console.warn("Auth metadata sync warning:", authErr);
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      role,
    });
  } catch (err: any) {
    console.error("API update-role exception:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
