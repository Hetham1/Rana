INSERT INTO workplaces (id, name, type, address, phone_number) VALUES
  ('wp1', 'انبار مرکزی', 'warehouse', 'کارخانه - انبار مرکزی', '02100000001'),
  ('wp2', 'خط تولید یک', 'production', 'سالن تولید', '02100000002'),
  ('wp3', 'حراست', 'security', 'درب خروج', '02100000003')
ON CONFLICT (id) DO NOTHING;

-- These are development-only accounts. The seed script is intentionally blocked in production.
INSERT INTO users (id, username, password_hash, full_name, workplace_id, role) VALUES
  ('usr_admin', 'admin', crypt('ChangeMe123!', gen_salt('bf', 12)), 'مدیر سامانه', 'wp1', 'admin'),
  ('usr_operator', 'operator', crypt('ChangeMe123!', gen_salt('bf', 12)), 'اپراتور انبار', 'wp1', 'operator'),
  ('usr_security', 'security', crypt('ChangeMe123!', gen_salt('bf', 12)), 'کارشناس حراست', 'wp3', 'security')
ON CONFLICT (id) DO NOTHING;

INSERT INTO manufacturers (id, name) VALUES
  ('manf1', 'تامین‌کننده نمونه')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, is_high_demand) VALUES
  ('prod1', 'کابل افشان ۱.۵', true),
  ('prod2', 'کابل افشان ۲.۵', true),
  ('prod3', 'سیم مسی', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (id, name, address, phone_number) VALUES
  ('cust1', 'مشتری نمونه', 'تهران، آدرس نمونه', '09120000000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO production_plans (
  id, manufactured_at, device, product_amount, product_state, produced_length,
  insulation_type, insulation_color, product_size, product_id, user_id, situation, detail
) VALUES (
  'pp1', now() - interval '1 day', 'خط ۱', 1200, 'تکمیل', 1200,
  'PVC', 'آبی', '1.5', 'prod1', 'usr_operator', 'completed', 'داده نمونه محیط توسعه'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO wire_spools (
  id, direction, material, type, state, recorded_at, length, empty_weight,
  full_weight, pure_weight, quality_approved, workplace_id, location_state, sector, waybill_number
) VALUES (
  'wsp0001', 'راست', 'مس', 'A', 'سالم', now() - interval '2 days', 2500,
  15, 90, 75, true, 'wp1', 'ورود', 'A', 'BJ-1001'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO insulation_batches (
  id, type, code, manufacturer_id, entry_date, receipt_number, state, expires_at,
  location, color, quantity, quality_approved, workplace_id, location_state, sector
) VALUES (
  'ins0001', 'PVC', 'PVC-BLUE', 'manf1', now() - interval '3 days', 'REC-1001',
  'سالم', now() + interval '1 year', 'قفسه ۲', 'آبی', 500, true, 'wp1', 'ورود', 'B'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO carts (
  id, type, device, shift, length, product_name, production_plan_id, manufactured_at,
  user_id, color, insulation_batch_id, wire_spool_id, workplace_id, location_state, quality_approved
) VALUES (
  'car0001', 'سبد تولید', 'خط ۱', 'صبح', 1200, 'کابل افشان ۱.۵', 'pp1', now() - interval '1 day',
  'usr_operator', 'آبی', 'ins0001', 'wsp0001', 'wp2', 'ورود', true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO final_products (
  id, type, cart_id, user_id, end_user_code, location, situation,
  workplace_id, location_state, sector, is_wrapped
) VALUES (
  'fip0001', 'کابل افشان ۱.۵', 'car0001', 'usr_operator', 'END-001', 'انبار محصول',
  'آماده ارسال', 'wp1', 'ورود', 'C', true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, ordered_at, customer_id, is_approved, situation) VALUES
  ('ord0001', now() - interval '4 hours', 'cust1', true, 'submitted'),
  ('ord0002', now() - interval '2 hours', 'cust1', true, 'Gathered')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity) VALUES
  ('ord0001', 'prod1', 10),
  ('ord0002', 'prod2', 5)
ON CONFLICT (order_id, product_id) DO NOTHING;

INSERT INTO sold_final_products (order_id, final_product_id) VALUES
  ('ord0002', 'fip0001')
ON CONFLICT DO NOTHING;
