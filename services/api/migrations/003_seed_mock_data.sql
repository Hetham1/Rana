BEGIN;

INSERT INTO manufacturers (id, name) VALUES
  ('manf2', 'پارس پلیمر'),
  ('manf3', 'صنایع مس ایران'),
  ('manf4', 'پتروشیمی خلیج فارس')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, is_high_demand) VALUES
  ('prod4', 'کابل قدرت ۴', true),
  ('prod5', 'کابل کنترل ۱.۵', false),
  ('prod6', 'سیم ارت', true),
  ('prod7', 'کابل شبکه صنعتی', false),
  ('prod8', 'کابل افشان ۶', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (id, name, address, phone_number)
SELECT
  'cust' || lpad(series::text, 3, '0'),
  'مشتری سازمانی ' || series,
  CASE series % 5
    WHEN 0 THEN 'تهران، شهرک صنعتی'
    WHEN 1 THEN 'کرج، منطقه ویژه اقتصادی'
    WHEN 2 THEN 'قزوین، شهر صنعتی البرز'
    WHEN 3 THEN 'اصفهان، شهرک صنعتی محمودآباد'
    ELSE 'تبریز، شهرک صنعتی غرب'
  END,
  '0912' || lpad((1000000 + series)::text, 7, '0')
FROM generate_series(2, 30) AS series
ON CONFLICT (id) DO NOTHING;

INSERT INTO production_plans (
  id, manufactured_at, device, product_amount, linear_velocity, overlap,
  product_state, produced_length, gauge, annealing_percent, insulation_type,
  insulation_color, product_size, product_id, output_gauge, material_amount,
  input_speed, output_speed, user_id, situation, detail
)
SELECT
  'ppmock' || lpad(series::text, 4, '0'),
  now() - ((series - 1000) * interval '4 days'),
  'خط ' || (((series - 1) % 3) + 1),
  700 + ((series * 47) % 1800),
  18 + ((series * 3) % 22),
  8 + (series % 9),
  CASE WHEN series % 7 = 0 THEN 'نیازمند بازبینی' ELSE 'تکمیل' END,
  650 + ((series * 41) % 1700),
  1.2 + ((series % 5) * 0.25),
  70 + (series % 25),
  CASE WHEN series % 2 = 0 THEN 'PVC' ELSE 'XLPE' END,
  (ARRAY['آبی', 'قرمز', 'مشکی', 'سبز', 'سفید'])[(series % 5) + 1],
  (ARRAY['1.5', '2.5', '4', '6'])[(series % 4) + 1],
  'prod' || (((series - 1) % 8) + 1),
  1.1 + ((series % 6) * 0.2),
  90 + ((series * 13) % 400),
  15 + (series % 18),
  13 + (series % 20),
  'usr_operator',
  CASE WHEN series % 8 = 0 THEN 'planned' ELSE 'completed' END,
  'برنامه تولید آزمایشی برای نمایش روند و ظرفیت خطوط'
FROM generate_series(1001, 1090) AS series
ON CONFLICT (id) DO NOTHING;

INSERT INTO wire_spools (
  id, direction, material, type, production_plan_id, state, recorded_at,
  input_spool, output_spool, length, empty_weight, full_weight, pure_weight,
  quality_approved, workplace_id, location_state, sector, waybill_number
)
SELECT
  'wsp' || lpad(series::text, 4, '0'),
  CASE WHEN series % 2 = 0 THEN 'راست' ELSE 'چپ' END,
  CASE WHEN series % 5 = 0 THEN 'آلومینیوم' ELSE 'مس' END,
  (ARRAY['A', 'B', 'C'])[(series % 3) + 1],
  CASE WHEN series <= 1090 THEN 'ppmock' || lpad(series::text, 4, '0') END,
  CASE WHEN series % 11 = 0 THEN 'نیازمند بررسی' ELSE 'سالم' END,
  now() - ((series % 180) * interval '1 day'),
  'IN-' || series,
  'OUT-' || series,
  1200 + ((series * 17) % 2600),
  12 + (series % 8),
  65 + (series % 55),
  48 + (series % 45),
  series % 9 <> 0,
  'wp' || (((series - 1) % 2) + 1),
  CASE WHEN series % 6 = 0 THEN 'خروج' ELSE 'ورود' END,
  chr(65 + (series % 8)),
  'BJ-' || series
FROM generate_series(1001, 1120) AS series
ON CONFLICT (id) DO NOTHING;

INSERT INTO insulation_batches (
  id, type, code, manufacturer_id, entry_date, receipt_number, state,
  expires_at, location, color, quantity, quality_approved, workplace_id,
  location_state, sector
)
SELECT
  'ins' || lpad(series::text, 4, '0'),
  CASE WHEN series % 2 = 0 THEN 'PVC' ELSE 'XLPE' END,
  'MAT-' || series,
  'manf' || (((series - 1) % 4) + 1),
  now() - ((series % 160) * interval '1 day'),
  'REC-' || series,
  CASE WHEN series % 13 = 0 THEN 'قرنطینه' ELSE 'سالم' END,
  now() + ((180 + series % 540) * interval '1 day'),
  'قفسه ' || (((series - 1) % 12) + 1),
  (ARRAY['آبی', 'قرمز', 'مشکی', 'سبز', 'سفید', 'زرد'])[(series % 6) + 1],
  180 + ((series * 19) % 700),
  series % 10 <> 0,
  'wp' || (((series - 1) % 2) + 1),
  CASE WHEN series % 7 = 0 THEN 'خروج' ELSE 'ورود' END,
  chr(65 + (series % 8))
FROM generate_series(1001, 1120) AS series
ON CONFLICT (id) DO NOTHING;

INSERT INTO carts (
  id, type, device, input_value, output_value, shift, length, product_name,
  production_plan_id, manufactured_at, user_id, color, insulation_batch_id,
  wire_spool_id, workplace_id, location_state, quality_approved
)
SELECT
  'car' || lpad(series::text, 4, '0'),
  'سبد تولید',
  'خط ' || (((series - 1) % 3) + 1),
  (500 + series % 300)::text,
  (450 + series % 280)::text,
  CASE WHEN series % 2 = 0 THEN 'صبح' ELSE 'عصر' END,
  600 + ((series * 23) % 1900),
  p.name,
  'ppmock' || lpad(series::text, 4, '0'),
  now() - ((series - 1000) * interval '4 days'),
  'usr_operator',
  (ARRAY['آبی', 'قرمز', 'مشکی', 'سبز', 'سفید'])[(series % 5) + 1],
  'ins' || lpad(series::text, 4, '0'),
  'wsp' || lpad(series::text, 4, '0'),
  CASE WHEN series % 4 = 0 THEN 'wp1' ELSE 'wp2' END,
  CASE WHEN series % 9 = 0 THEN 'خروج' ELSE 'ورود' END,
  series % 8 <> 0
FROM generate_series(1001, 1090) AS series
JOIN products p ON p.id = 'prod' || (((series - 1) % 8) + 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO final_products (
  id, type, cart_id, user_id, end_user_code, location, situation,
  workplace_id, location_state, sector, is_wrapped, created_at
)
SELECT
  'fip' || lpad(series::text, 4, '0'),
  p.name,
  CASE WHEN series <= 1090 THEN 'car' || lpad(series::text, 4, '0') END,
  'usr_operator',
  'END-' || series,
  'انبار محصول نهایی',
  CASE WHEN series % 12 = 0 THEN 'کنترل کیفیت' ELSE 'آماده ارسال' END,
  'wp1',
  CASE WHEN series % 7 = 0 THEN 'خروج' ELSE 'ورود' END,
  chr(65 + (series % 10)),
  series % 5 <> 0,
  now() - ((series % 240) * interval '1 day')
FROM generate_series(1001, 1300) AS series
JOIN products p ON p.id = 'prod' || (((series - 1) % 8) + 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, ordered_at, customer_id, is_approved, situation)
SELECT
  'ord' || lpad(series::text, 4, '0'),
  now() - (((series * 37) % 365) * interval '1 day') - ((series % 20) * interval '1 hour'),
  CASE WHEN series % 10 = 0 THEN 'cust1' ELSE 'cust' || lpad((((series - 2) % 29) + 2)::text, 3, '0') END,
  series % 11 <> 0,
  CASE series % 4
    WHEN 0 THEN 'submitted'
    WHEN 1 THEN 'Gathered'
    WHEN 2 THEN 'Security Checked'
    ELSE 'exited'
  END
FROM generate_series(10, 250) AS series
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity)
SELECT 'ord' || lpad(series::text, 4, '0'), 'prod' || (((series - 1) % 8) + 1), 2 + (series % 24)
FROM generate_series(10, 250) AS series
UNION ALL
SELECT 'ord' || lpad(series::text, 4, '0'), 'prod' || (((series + 2) % 8) + 1), 1 + ((series * 3) % 16)
FROM generate_series(10, 250) AS series
ON CONFLICT (order_id, product_id) DO NOTHING;

INSERT INTO sold_final_products (order_id, final_product_id, created_at)
SELECT
  'ord' || lpad(series::text, 4, '0'),
  'fip' || lpad((1000 + series)::text, 4, '0'),
  now() - (((series * 37) % 365) * interval '1 day')
FROM generate_series(10, 250) AS series
WHERE series % 4 IN (1, 2, 3)
ON CONFLICT DO NOTHING;

INSERT INTO transports (
  id, order_id, driver_name, driver_phone, driver_license, situation,
  customer_address, dispatched_at, created_by
)
SELECT
  'tpmock' || lpad(series::text, 4, '0'),
  'ord' || lpad(series::text, 4, '0'),
  'راننده نمونه ' || series,
  '0912' || lpad((2000000 + series)::text, 7, '0'),
  'DL-' || series,
  CASE WHEN series % 8 = 3 THEN 'تحویل شده' ELSE 'در مسیر' END,
  'نشانی مشتری ' || series,
  now() - (((series * 37) % 365) * interval '1 day'),
  'usr_security'
FROM generate_series(10, 250) AS series
WHERE series % 4 = 3
ON CONFLICT (id) DO NOTHING;

INSERT INTO requests (
  id, requested_at, type, detail, status, sender_id, receiver_id, resolved_at
)
SELECT
  'reqmock' || lpad(series::text, 4, '0'),
  now() - ((series * 19 % 180) * interval '1 day') - ((series % 12) * interval '1 hour'),
  (ARRAY['تامین مواد اولیه', 'مجوز ورود', 'بازبینی کنترل کیفیت', 'تغییر برنامه تولید'])[(series % 4) + 1],
  'درخواست آزمایشی شماره ' || series || ' برای نمایش گردش کار سامانه',
  CASE series % 5 WHEN 0 THEN 'pending' WHEN 1 THEN 'denied' ELSE 'approved' END,
  CASE WHEN series % 2 = 0 THEN 'usr_operator' ELSE 'usr_security' END,
  'usr_admin',
  CASE WHEN series % 5 = 0 THEN NULL ELSE now() - ((series * 19 % 180) * interval '1 day') + ((2 + series % 30) * interval '1 hour') END
FROM generate_series(1, 120) AS series
ON CONFLICT (id) DO NOTHING;

INSERT INTO production_plan_materials (
  production_plan_id, wire_spool_id, insulation_batch_id, assigned_at, assigned_by
)
SELECT
  'ppmock' || lpad(series::text, 4, '0'),
  'wsp' || lpad(series::text, 4, '0'),
  NULL,
  now() - ((series - 1000) * interval '4 days'),
  'usr_operator'
FROM generate_series(1001, 1090) AS series
ON CONFLICT DO NOTHING;

INSERT INTO production_plan_materials (
  production_plan_id, wire_spool_id, insulation_batch_id, assigned_at, assigned_by
)
SELECT
  'ppmock' || lpad(series::text, 4, '0'),
  NULL,
  'ins' || lpad(series::text, 4, '0'),
  now() - ((series - 1000) * interval '4 days'),
  'usr_operator'
FROM generate_series(1001, 1090) AS series
ON CONFLICT DO NOTHING;

INSERT INTO inventory_movements (
  item_type, item_id, action, workplace_id, sector, performed_by, occurred_at, metadata
)
SELECT
  CASE WHEN series % 2 = 0 THEN 'wire_spool' ELSE 'insulation' END,
  CASE WHEN series % 2 = 0
    THEN 'wsp' || lpad((1000 + series)::text, 4, '0')
    ELSE 'ins' || lpad((1000 + series)::text, 4, '0')
  END,
  CASE WHEN series % 6 = 0 THEN 'relocate' ELSE 'entry' END,
  'wp' || (((series - 1) % 2) + 1),
  chr(65 + (series % 8)),
  'usr_operator',
  now() - ((series % 120) * interval '1 day'),
  jsonb_build_object('mock', true, 'batch', 'development')
FROM generate_series(1, 120) AS series
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_movements movement
  WHERE movement.metadata @> '{"mock": true, "batch": "development"}'::jsonb
);

COMMIT;
