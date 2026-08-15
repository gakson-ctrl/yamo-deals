-- =====================================================================
-- YaMo Deals — Customer test account
-- Login in app with: phone 237699001234  →  password YamoDemo2026!
-- (app derives email demo_237699001234@yamo.demo internally)
--
-- Creates auth.users + auth.identities + profiles.
-- The auth.identities row is REQUIRED for signInWithPassword to work
-- on accounts created via SQL.
-- Idempotent: safe to re-run.
-- =====================================================================

DO $$
DECLARE
  v_id    uuid := 'c5700000-0000-4000-8000-000000000001';
  v_email text := 'demo_237699001234@yamo.demo';
BEGIN
  -- auth.users
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', v_email,
    crypt('YamoDemo2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(), now()
  ) ON CONFLICT (id) DO NOTHING;

  -- auth.identities (needed so email/password login resolves)
  INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_id::text, v_id,
    jsonb_build_object('sub', v_id::text, 'email', v_email),
    'email', now(), now(), now()
  ) ON CONFLICT DO NOTHING;

  -- profiles (POSSA-shared columns included)
  INSERT INTO profiles (
    id, phone, display_name, role, locale, possa_handle, pin_hash
  ) VALUES (
    v_id, '237699001234', 'Client Démo', 'customer', 'fr',
    'client_demo@possa-cm', crypt('000000', gen_salt('bf'))
  ) ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Customer test account ready: phone 237699001234 / password YamoDemo2026!';
END $$;

-- Verify
SELECT p.phone, p.display_name, p.role, u.email
FROM profiles p JOIN auth.users u ON u.id = p.id
WHERE p.phone = '237699001234';
