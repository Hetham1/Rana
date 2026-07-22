CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE workplaces (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  type text NOT NULL,
  address text,
  phone_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id text PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  workplace_id text REFERENCES workplaces(id) ON UPDATE CASCADE ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'security', 'analyst')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE manufacturers (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  is_high_demand boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE customers (
  id text PRIMARY KEY,
  name text NOT NULL,
  address text,
  phone_number text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE production_plans (
  id text PRIMARY KEY,
  manufactured_at timestamptz NOT NULL DEFAULT now(),
  device text,
  product_amount numeric(14, 3),
  linear_velocity numeric(14, 3),
  overlap numeric(14, 3),
  product_state text,
  produced_length numeric(14, 3),
  gauge numeric(14, 3),
  annealing_percent numeric(6, 3),
  insulation_type text,
  insulation_color text,
  product_size text,
  product_id text REFERENCES products(id) ON UPDATE CASCADE ON DELETE SET NULL,
  output_gauge numeric(14, 3),
  arc_length numeric(14, 3),
  material_amount numeric(14, 3),
  input_speed numeric(14, 3),
  output_speed numeric(14, 3),
  user_id text REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  situation text NOT NULL DEFAULT 'planned',
  detail text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wire_spools (
  id text PRIMARY KEY CHECK (id LIKE 'wsp%'),
  direction text,
  material text,
  type text,
  production_plan_id text REFERENCES production_plans(id) ON UPDATE CASCADE ON DELETE SET NULL,
  state text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  input_spool text,
  output_spool text,
  length numeric(14, 3),
  empty_weight numeric(14, 3),
  full_weight numeric(14, 3),
  pure_weight numeric(14, 3),
  quality_approved boolean NOT NULL DEFAULT false,
  workplace_id text REFERENCES workplaces(id) ON UPDATE CASCADE ON DELETE SET NULL,
  location_state text NOT NULL DEFAULT 'خروج',
  sector text,
  waybill_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE insulation_batches (
  id text PRIMARY KEY CHECK (id LIKE 'ins%'),
  type text,
  code text,
  manufacturer_id text REFERENCES manufacturers(id) ON UPDATE CASCADE ON DELETE SET NULL,
  entry_date timestamptz NOT NULL DEFAULT now(),
  receipt_number text,
  state text,
  expires_at timestamptz,
  location text,
  color text,
  quantity numeric(14, 3),
  quality_approved boolean NOT NULL DEFAULT false,
  workplace_id text REFERENCES workplaces(id) ON UPDATE CASCADE ON DELETE SET NULL,
  location_state text NOT NULL DEFAULT 'خروج',
  sector text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE carts (
  id text PRIMARY KEY CHECK (id LIKE 'car%'),
  type text,
  device text,
  input_value text,
  output_value text,
  shift text,
  length numeric(14, 3),
  product_name text,
  production_plan_id text REFERENCES production_plans(id) ON UPDATE CASCADE ON DELETE SET NULL,
  manufactured_at timestamptz NOT NULL DEFAULT now(),
  user_id text REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  color text,
  insulation_batch_id text REFERENCES insulation_batches(id) ON UPDATE CASCADE ON DELETE SET NULL,
  wire_spool_id text REFERENCES wire_spools(id) ON UPDATE CASCADE ON DELETE SET NULL,
  workplace_id text REFERENCES workplaces(id) ON UPDATE CASCADE ON DELETE SET NULL,
  location_state text NOT NULL DEFAULT 'خروج',
  quality_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE final_products (
  id text PRIMARY KEY CHECK (id LIKE 'fip%'),
  type text,
  cart_id text REFERENCES carts(id) ON UPDATE CASCADE ON DELETE SET NULL,
  user_id text REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  end_user_code text,
  location text,
  situation text,
  workplace_id text REFERENCES workplaces(id) ON UPDATE CASCADE ON DELETE SET NULL,
  location_state text NOT NULL DEFAULT 'خروج',
  sector text,
  is_wrapped boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id text PRIMARY KEY,
  ordered_at timestamptz NOT NULL DEFAULT now(),
  customer_id text NOT NULL REFERENCES customers(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  is_approved boolean NOT NULL DEFAULT false,
  situation text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  order_id text NOT NULL REFERENCES orders(id) ON UPDATE CASCADE ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES products(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (order_id, product_id)
);

CREATE TABLE sold_final_products (
  order_id text NOT NULL REFERENCES orders(id) ON UPDATE CASCADE ON DELETE CASCADE,
  final_product_id text NOT NULL UNIQUE REFERENCES final_products(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (order_id, final_product_id)
);

CREATE TABLE requests (
  id text PRIMARY KEY DEFAULT ('req' || replace(gen_random_uuid()::text, '-', '')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL,
  detail text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  sender_id text NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  receiver_id text NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (sender_id <> receiver_id)
);

CREATE TABLE transports (
  id text PRIMARY KEY DEFAULT ('tp' || replace(gen_random_uuid()::text, '-', '')),
  order_id text NOT NULL REFERENCES orders(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  driver_name text NOT NULL,
  driver_phone text,
  driver_license text,
  situation text NOT NULL DEFAULT 'در مسیر',
  customer_address text,
  dispatched_at timestamptz NOT NULL DEFAULT now(),
  created_by text REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE production_plan_materials (
  id bigserial PRIMARY KEY,
  production_plan_id text NOT NULL REFERENCES production_plans(id) ON UPDATE CASCADE ON DELETE CASCADE,
  wire_spool_id text REFERENCES wire_spools(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  insulation_batch_id text REFERENCES insulation_batches(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by text REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CHECK (num_nonnulls(wire_spool_id, insulation_batch_id) = 1),
  UNIQUE (production_plan_id, wire_spool_id),
  UNIQUE (production_plan_id, insulation_batch_id)
);

CREATE TABLE inventory_movements (
  id bigserial PRIMARY KEY,
  item_type text NOT NULL CHECK (item_type IN ('wire_spool', 'insulation', 'cart', 'final_product')),
  item_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('entry', 'exit', 'relocate', 'consume')),
  workplace_id text REFERENCES workplaces(id) ON UPDATE CASCADE ON DELETE SET NULL,
  sector text,
  performed_by text REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX wire_spools_workplace_index ON wire_spools (workplace_id, location_state);
CREATE INDEX insulation_batches_workplace_index ON insulation_batches (workplace_id, location_state);
CREATE INDEX carts_workplace_index ON carts (workplace_id, location_state);
CREATE INDEX final_products_workplace_index ON final_products (workplace_id, location_state);
CREATE INDEX orders_situation_date_index ON orders (situation, ordered_at DESC);
CREATE INDEX requests_sender_date_index ON requests (sender_id, requested_at DESC);
CREATE INDEX requests_receiver_status_index ON requests (receiver_id, status, requested_at DESC);
CREATE INDEX inventory_movements_item_index ON inventory_movements (item_type, item_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'workplaces', 'users', 'production_plans', 'wire_spools',
    'insulation_batches', 'carts', 'final_products', 'orders', 'requests'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      table_name,
      table_name
    );
  END LOOP;
END;
$$;
