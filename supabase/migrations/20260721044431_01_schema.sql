/*
# Core schema for Deco Marketplace

Creates the normalized tables that back the deco marketplace app:
projects, workers, materials, job bids, job photos, job measurements,
app settings, and admins. Also creates a public Storage bucket for
job photos and enables Row Level Security on every table.

## 1. New Tables

- projects: a client job/order. Tracks the client request from
  submission through inspection, execution, and completion.
  - tracking_code: human-readable code shown to the client (DEC-XXXXXX)
  - property_type: home | workshop | shop
  - status: new | inspecting | executing | completed
  - manual_override: jsonb of admin price overrides
  - ledger_locked: true once final accounting is closed
- workers: the field technicians who bid on and execute projects.
  - user_id: optional link to an auth.users account (for Supabase Auth login)
  - rating, jobs_completed: reputation stats
- admins: platform administrators who can log in.
  - user_id: link to an auth.users account
- materials: raw material inventory with stock and unit cost.
  - category: placo | pvc | spotlight | consumable
  - box_opened / box_opened_for_job_id: tracks opened consumable boxes
- job_bids: a worker offer to inspect/execute a project.
  - earliest_inspection, proposed_start: scheduling fields
- job_photos: photos attached to a project, categorized by kind.
  - kind: site_visit | before | after
  - storage_path: path in the job-photos Storage bucket
  - url: public URL used by the frontend img tag
- job_measurements: measured field data for a project.
  - kind: initial (site visit) | final (completion confirmation)
  - verified_area, spotlights_count, complexity, deposit_received,
    final_payment_received, return_method, final_measurements_confirmed,
    inspected_by, inspected_at, completed_at
- app_settings: single-row table for global settings
  (admin profit split percentage).

## 2. Storage
- Creates public bucket job-photos for uploading project images.
- Storage policies allow anyone to read and authenticated users to upload.

## 3. Security (RLS)
- This app has a public customer portal (no login) that submits projects
  and tracks them by code, plus authenticated worker/admin portals.
- All operational tables use TO anon, authenticated for SELECT so the
  anon-key frontend can read its own data. INSERT/UPDATE/DELETE are
  restricted to authenticated (workers/admins) except projects INSERT
  which is also allowed for anon (customer job submission).
- admins SELECT is authenticated only (only logged-in users check roles).
*/

-- ============ projects ============
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code text UNIQUE NOT NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  property_type text NOT NULL DEFAULT 'home',
  city text NOT NULL,
  estimated_area numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'new',
  assigned_worker_id uuid,
  assigned_worker_name text,
  manual_override jsonb,
  ledger_locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_projects" ON projects;
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ workers ============
CREATE TABLE IF NOT EXISTS workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  city text,
  rating numeric NOT NULL DEFAULT 5.0,
  jobs_completed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_workers" ON workers;
CREATE POLICY "anon_select_workers" ON workers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_workers" ON workers;
CREATE POLICY "auth_insert_workers" ON workers FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_workers" ON workers;
CREATE POLICY "auth_update_workers" ON workers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ admins ============
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_admins" ON admins;
CREATE POLICY "auth_select_admins" ON admins FOR SELECT
  TO authenticated USING (true);

-- ============ materials ============
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'placo',
  unit text NOT NULL DEFAULT 'وحدة',
  unit_cost numeric NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  box_opened boolean NOT NULL DEFAULT false,
  box_opened_for_job_id text,
  consumption_per_sqm numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_materials" ON materials;
CREATE POLICY "anon_select_materials" ON materials FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_materials" ON materials;
CREATE POLICY "auth_insert_materials" ON materials FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_materials" ON materials;
CREATE POLICY "auth_update_materials" ON materials FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_materials" ON materials;
CREATE POLICY "auth_delete_materials" ON materials FOR DELETE
  TO authenticated USING (true);

-- ============ job_bids ============
CREATE TABLE IF NOT EXISTS job_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES workers(id) ON DELETE SET NULL,
  worker_name text NOT NULL,
  earliest_inspection timestamptz,
  proposed_start text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE job_bids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bids" ON job_bids;
CREATE POLICY "anon_select_bids" ON job_bids FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_bids" ON job_bids;
CREATE POLICY "auth_insert_bids" ON job_bids FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_bids" ON job_bids;
CREATE POLICY "auth_update_bids" ON job_bids FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ job_photos ============
CREATE TABLE IF NOT EXISTS job_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('site_visit','before','after')),
  storage_path text NOT NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_photos" ON job_photos;
CREATE POLICY "anon_select_photos" ON job_photos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_photos" ON job_photos;
CREATE POLICY "auth_insert_photos" ON job_photos FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_photos" ON job_photos;
CREATE POLICY "auth_delete_photos" ON job_photos FOR DELETE
  TO authenticated USING (true);

-- ============ job_measurements ============
CREATE TABLE IF NOT EXISTS job_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('initial','final')),
  verified_area numeric,
  spotlights_count integer,
  complexity text,
  deposit_received boolean NOT NULL DEFAULT false,
  final_payment_received boolean NOT NULL DEFAULT false,
  return_method text,
  final_measurements_confirmed boolean NOT NULL DEFAULT false,
  inspected_by text,
  inspected_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE job_measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_measurements" ON job_measurements;
CREATE POLICY "anon_select_measurements" ON job_measurements FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_measurements" ON job_measurements;
CREATE POLICY "auth_insert_measurements" ON job_measurements FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_measurements" ON job_measurements;
CREATE POLICY "auth_update_measurements" ON job_measurements FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ app_settings ============
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_profit_split integer NOT NULL DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON app_settings;
CREATE POLICY "anon_select_settings" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_settings" ON app_settings;
CREATE POLICY "auth_update_settings" ON app_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ Storage bucket for job photos ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_read_job_photos" ON storage.objects;
CREATE POLICY "anon_read_job_photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'job-photos');

DROP POLICY IF EXISTS "auth_insert_job_photos" ON storage.objects;
CREATE POLICY "auth_insert_job_photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'job-photos');

DROP POLICY IF EXISTS "auth_delete_job_photos" ON storage.objects;
CREATE POLICY "auth_delete_job_photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'job-photos');
