-- ============================================================
-- Seed: Admin Production
-- Email  : orydhl@gmail.com
-- Password: Admin12345!
-- Role   : SUPER_ADMIN
-- ============================================================
-- Jalankan di Neon dashboard (SQL Editor) atau:
--   psql "$DATABASE_URL" -f seed-admin-production.sql
-- ============================================================

DO $$
DECLARE
  v_user_id TEXT := gen_random_uuid()::text;
  v_existing_user_id TEXT;
  v_account_id TEXT;
BEGIN

  -- 1. Cari user existing by email atau username
  SELECT id INTO v_existing_user_id
  FROM "user"
  WHERE lower(email) = lower('orydhl@gmail.com')
     OR lower(username) = lower('rydhlnst')
  LIMIT 1;

  -- 2. Upsert user
  IF v_existing_user_id IS NOT NULL THEN
    v_user_id := v_existing_user_id;

    UPDATE "user" SET
      name             = 'Admin RW 25',
      email            = 'orydhl@gmail.com',
      email_verified   = true,
      username         = 'rydhlnst',
      display_username = 'Rydhlnst',
      role             = 'SUPER_ADMIN',
      status           = 'ACTIVE',
      updated_at       = now()
    WHERE id = v_user_id;

    RAISE NOTICE 'UPDATED user id=%', v_user_id;
  ELSE
    INSERT INTO "user" (
      id, name, email, email_verified,
      username, display_username, phone_number,
      role, status, created_at, updated_at
    ) VALUES (
      v_user_id,
      'Admin RW 25',
      'orydhl@gmail.com',
      true,
      'rydhlnst',
      'Rydhlnst',
      NULL,
      'SUPER_ADMIN',
      'ACTIVE',
      now(),
      now()
    );

    RAISE NOTICE 'CREATED user id=%', v_user_id;
  END IF;

  -- 3. Upsert account (credential / password login)
  --    Hash di bawah = scrypt hash dari 'Admin12345!' via better-auth
  SELECT id INTO v_account_id
  FROM account
  WHERE user_id = v_user_id AND provider_id = 'credential'
  LIMIT 1;

  IF v_account_id IS NOT NULL THEN
    UPDATE account SET
      password   = '5bd40521dd8e7e9fe7e075e4a15407b8:40bcc595063c2083755789de5dc062ae46b958559db95555b7ab3ae2061b44d8535fc4ac114b39aa4a200d490191ea7d2eb65a089640e4361e6b5839b1581553',
      account_id = v_user_id,
      updated_at = now()
    WHERE id = v_account_id;

    RAISE NOTICE 'UPDATED account id=%', v_account_id;
  ELSE
    INSERT INTO account (
      id, user_id, account_id, provider_id, password, created_at, updated_at
    ) VALUES (
      gen_random_uuid()::text,
      v_user_id,
      v_user_id,
      'credential',
      '5bd40521dd8e7e9fe7e075e4a15407b8:40bcc595063c2083755789de5dc062ae46b958559db95555b7ab3ae2061b44d8535fc4ac114b39aa4a200d490191ea7d2eb65a089640e4361e6b5839b1581553',
      now(),
      now()
    );

    RAISE NOTICE 'CREATED account for user id=%', v_user_id;
  END IF;

  -- 4. Upsert admin_access (SUPER_ADMIN = scope RW, managed_rt_codes kosong)
  INSERT INTO admin_access (id, user_id, access_scope, managed_rt_codes, created_at, updated_at)
  VALUES (
    gen_random_uuid()::text,
    v_user_id,
    'RW',
    ARRAY[]::text[],
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    access_scope     = 'RW',
    managed_rt_codes = ARRAY[]::text[],
    updated_at       = now();

  RAISE NOTICE 'admin_access upserted for user id=%', v_user_id;

END $$;

-- Verifikasi hasil
SELECT
  u.id,
  u.name,
  u.email,
  u.username,
  u.role,
  u.status,
  a.provider_id,
  CASE WHEN a.password IS NOT NULL THEN 'YES' ELSE 'NO' END AS has_password,
  aa.access_scope
FROM "user" u
LEFT JOIN account a ON a.user_id = u.id AND a.provider_id = 'credential'
LEFT JOIN admin_access aa ON aa.user_id = u.id
WHERE lower(u.email) = lower('orydhl@gmail.com');
