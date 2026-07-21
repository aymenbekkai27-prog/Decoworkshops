/*
# Seed reference data

Seeds the initial reference data for the deco marketplace app:
3 workers, 7 materials, 1 app_settings row, and 2 demo projects with bids.
Auth users are created in a separate migration because they require the
auth schema functions. Uses fixed UUIDs so re-runs are idempotent.
*/

-- ============ app_settings ============
INSERT INTO app_settings (id, admin_profit_split)
VALUES ('00000000-0000-0000-0000-000000000001', 60)
ON CONFLICT (id) DO NOTHING;

-- ============ materials ============
INSERT INTO materials (id, name, category, unit, unit_cost, stock, box_opened) VALUES
  ('11111111-0000-0000-0000-000000000001','لوح بلاكو بلاطر 1.2x2.5م','placo','لوح',850,120,false),
  ('11111111-0000-0000-0000-000000000002','لوح بلاكو بلاطر مقاوم للرطوبة','placo','لوح',1100,40,false),
  ('11111111-0000-0000-0000-000000000003','لوح PVC ديكوري أبيض','pvc','لوح',1450,60,false),
  ('11111111-0000-0000-0000-000000000004','سبوت LED مدمج 7 واط','spotlight','قطعة',180,300,false),
  ('11111111-0000-0000-0000-000000000005','سبوت LED مدمج 12 واط','spotlight','قطعة',260,150,false),
  ('11111111-0000-0000-0000-000000000006','علبة براغي 1000 قطعة','consumable','علبة',1200,8,false),
  ('11111111-0000-0000-0000-000000000007','علبة مسامير 500 قطعة','consumable','علبة',800,12,false)
ON CONFLICT (id) DO NOTHING;

-- ============ workers ============
INSERT INTO workers (id, name, phone, city, rating, jobs_completed) VALUES
  ('22222222-0000-0000-0000-000000000001','ياسين بن علي','0551234567','الجزائر',4.8,23),
  ('22222222-0000-0000-0000-000000000002','كريم زيدان','0661234567','وهران',4.6,15),
  ('22222222-0000-0000-0000-000000000003','سمير بوزيد','0771234567','الجزائر',4.9,41)
ON CONFLICT (id) DO NOTHING;

-- ============ demo projects ============
INSERT INTO projects (id, tracking_code, client_name, client_phone, property_type, city, estimated_area, status, created_at) VALUES
  ('33333333-0000-0000-0000-000000000001','DEC-SEED1','أحمد بومدين','0551987654','home','الجزائر',25,'new', now() - interval '1 day'),
  ('33333333-0000-0000-0000-000000000002','DEC-SEED2','فاطمة حمداني','0661987654','shop','وهران',8,'new', now() - interval '12 hours')
ON CONFLICT (id) DO NOTHING;

-- ============ demo bids on project 2 ============
INSERT INTO job_bids (id, project_id, worker_id, worker_name, earliest_inspection, proposed_start, note, created_at) VALUES
  ('44444444-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000002','كريم زيدان', now() + interval '1 day', to_char(now() + interval '3 days','YYYY-MM-DD'),'متوفر خلال هذا الأسبوع', now() - interval '1 hour'),
  ('44444444-0000-0000-0000-000000000002','33333333-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000003','سمير بوزيد', now() + interval '12 hours', to_char(now() + interval '2 days','YYYY-MM-DD'), NULL, now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;
