import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { full_name, email, password, role } = await request.json();

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Email and Full Name are required' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Create User in Supabase Authentication (auth.users)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || 'Welcome2026!',
      email_confirm: true,
      user_metadata: {
        full_name,
        role: role || 'Sales',
      },
    });

    if (authError) {
      console.error('Supabase Auth Admin create error:', authError);
      // If user already exists in Auth, continue to sync profile
    }

    const userId = authData?.user?.id;

    // 2. Insert/Upsert into public.profiles
    const profileRecord = {
      ...(userId ? { id: userId } : {}),
      full_name,
      email,
      role: role || 'Sales',
    };

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileRecord, { onConflict: 'email' })
      .select()
      .single();

    if (profileError) {
      console.error('Profiles table insert error:', profileError);
    }

    return NextResponse.json({
      success: true,
      user: authData?.user,
      profile: profileData,
    });
  } catch (err: any) {
    console.error('API create-user exception:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
