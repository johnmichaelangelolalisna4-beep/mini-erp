-- ==============================================================================
-- SUPABASE SQL SCRIPT: CREATE / UPDATE SYSTEM ADMINISTRATOR ACCOUNT
-- Handles existing accounts gracefully (no duplicate key errors)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  existing_id UUID;
  new_admin_id UUID := '2107c59e-4dd6-4169-997f-b417f3e9bbcb';
BEGIN
  -- 1. Check if admin@minierp.com already exists in auth.users
  SELECT id INTO existing_id FROM auth.users WHERE email = 'admin@minierp.com' LIMIT 1;

  IF existing_id IS NOT NULL THEN
    -- 2A. Update the existing account's password and status
    UPDATE auth.users
    SET 
      encrypted_password = crypt('adminpassword123', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_user_meta_data = '{"full_name":"System Administrator","role":"Admin"}',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'
    WHERE id = existing_id;

    -- Update or insert into public.profiles
    INSERT INTO public.profiles (id, email, full_name, role, created_at)
    VALUES (existing_id, 'admin@minierp.com', 'System Administrator', 'Admin', now())
    ON CONFLICT (id) DO UPDATE SET role = 'Admin', full_name = 'System Administrator', email = 'admin@minierp.com';

    -- Ensure identity is linked
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (existing_id, existing_id, format('{"sub":"%s","email":"%s"}', existing_id, 'admin@minierp.com')::jsonb, 'email', 'admin@minierp.com', now(), now(), now())
    ON CONFLICT (provider, provider_id) DO NOTHING;

    RAISE NOTICE 'Existing Admin account updated successfully with password: adminpassword123';

  ELSE
    -- 2B. Insert fresh Administrator into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      new_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@minierp.com',
      crypt('adminpassword123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"System Administrator","role":"Admin"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );

    -- Insert into auth.identities
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (new_admin_id, new_admin_id, format('{"sub":"%s","email":"%s"}', new_admin_id, 'admin@minierp.com')::jsonb, 'email', 'admin@minierp.com', now(), now(), now())
    ON CONFLICT (provider, provider_id) DO NOTHING;

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, email, full_name, role, created_at)
    VALUES (new_admin_id, 'admin@minierp.com', 'System Administrator', 'Admin', now())
    ON CONFLICT (id) DO UPDATE SET role = 'Admin', full_name = 'System Administrator', email = 'admin@minierp.com';

    RAISE NOTICE 'New Admin account created successfully with password: adminpassword123';
  END IF;

END $$;
