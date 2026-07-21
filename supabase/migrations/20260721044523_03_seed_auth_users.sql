/*
# Create demo auth users for admin and worker portals

Creates Supabase Auth (email/password) accounts for the demo admin and
the three demo workers, then links the workers.user_id and creates the
admins row. Email confirmation is OFF by default.

Accounts:
- admin@deco.dz / admin123  -> role: admin
- yacine@deco.dz / worker123 -> role: worker (links to worker w1)
- karim@deco.dz / worker123  -> role: worker (links to worker w2)
- samir@deco.dz / worker123  -> role: worker (links to worker w3)

The role is stored in raw_app_meta_data (user-immutable) so the frontend
can read it from the JWT after sign-in to decide which portal to show.
This is idempotent: if a user already exists (matched by email), the
password is updated and metadata is refreshed; the link rows are upserted.
*/

-- Helper: upsert an auth user with a fixed id, email, password, and role metadata.
-- Uses auth.users so the accounts can sign in via Supabase Auth.
DO $$
DECLARE
  admin_uid uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  w1_uid    uuid := 'aaaaaaaa-0000-0000-0000-000000000002';
  w2_uid    uuid := 'aaaaaaaa-0000-0000-0000-000000000003';
  w3_uid    uuid := 'aaaaaaaa-0000-0000-0000-000000000004';
BEGIN
  -- Admin
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (admin_uid, '00000000-0000-0000-0000-000000000000', 'admin@deco.dz', crypt('admin123', gen_salt('bf')), now(), jsonb_build_object('role','admin'), jsonb_build_object('name','مدير النظام'), now(), now(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO UPDATE SET encrypted_password = crypt('admin123', gen_salt('bf')), raw_app_meta_data = jsonb_build_object('role','admin'), updated_at = now();

  -- Worker 1 (yacine)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (w1_uid, '00000000-0000-0000-0000-000000000000', 'yacine@deco.dz', crypt('worker123', gen_salt('bf')), now(), jsonb_build_object('role','worker','worker_id','22222222-0000-0000-0000-000000000001'), jsonb_build_object('name','ياسين بن علي'), now(), now(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO UPDATE SET encrypted_password = crypt('worker123', gen_salt('bf')), raw_app_meta_data = jsonb_build_object('role','worker','worker_id','22222222-0000-0000-0000-000000000001'), updated_at = now();

  -- Worker 2 (karim)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (w2_uid, '00000000-0000-0000-0000-000000000000', 'karim@deco.dz', crypt('worker123', gen_salt('bf')), now(), jsonb_build_object('role','worker','worker_id','22222222-0000-0000-0000-000000000002'), jsonb_build_object('name','كريم زيدان'), now(), now(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO UPDATE SET encrypted_password = crypt('worker123', gen_salt('bf')), raw_app_meta_data = jsonb_build_object('role','worker','worker_id','22222222-0000-0000-0000-000000000002'), updated_at = now();

  -- Worker 3 (samir)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES (w3_uid, '00000000-0000-0000-0000-000000000000', 'samir@deco.dz', crypt('worker123', gen_salt('bf')), now(), jsonb_build_object('role','worker','worker_id','22222222-0000-0000-0000-000000000003'), jsonb_build_object('name','سمير بوزيد'), now(), now(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO UPDATE SET encrypted_password = crypt('worker123', gen_salt('bf')), raw_app_meta_data = jsonb_build_object('role','worker','worker_id','22222222-0000-0000-0000-000000000003'), updated_at = now();

  -- Link workers.user_id
  UPDATE workers SET user_id = w1_uid WHERE id = '22222222-0000-0000-0000-000000000001';
  UPDATE workers SET user_id = w2_uid WHERE id = '22222222-0000-0000-0000-000000000002';
  UPDATE workers SET user_id = w3_uid WHERE id = '22222222-0000-0000-0000-000000000003';

  -- Admins row
  INSERT INTO admins (id, user_id, name)
  VALUES ('55555555-0000-0000-0000-000000000001', admin_uid, 'مدير النظام')
  ON CONFLICT (id) DO NOTHING;
END $$;
