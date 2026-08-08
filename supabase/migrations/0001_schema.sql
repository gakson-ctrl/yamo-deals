-- ============================================================
-- YaMo Deals — Migration 0001: Schema
-- Apply with: supabase db push
-- ============================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── profiles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  phone        text UNIQUE NOT NULL,
  display_name text NOT NULL,
  role         text NOT NULL DEFAULT 'customer'
                 CHECK (role IN ('customer', 'merchant')),
  avatar_url   text,
  locale       text NOT NULL DEFAULT 'fr'
                 CHECK (locale IN ('fr', 'en')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── restaurants ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          text NOT NULL,
  description   text,
  cover_url     text,
  logo_url      text,
  categories    text[] NOT NULL DEFAULT '{}',
  address       text NOT NULL,
  latitude      numeric(9,6),
  longitude     numeric(9,6),
  delivery_fee  numeric(8,0) NOT NULL DEFAULT 500,
  min_order     numeric(8,0) NOT NULL DEFAULT 1000,
  avg_prep_time int NOT NULL DEFAULT 20,
  is_open       boolean NOT NULL DEFAULT false,
  rating        numeric(2,1) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  rating_count  int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── menu_categories ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          text NOT NULL,
  display_order int NOT NULL DEFAULT 0
);

-- ─── menu_items ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id   uuid REFERENCES menu_categories(id) ON DELETE SET NULL,
  name          text NOT NULL,
  description   text,
  price         numeric(8,0) NOT NULL CHECK (price > 0),
  image_url     text,
  is_available  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── orders ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      uuid NOT NULL REFERENCES profiles(id),
  restaurant_id    uuid NOT NULL REFERENCES restaurants(id),
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN (
                       'pending','accepted','preparing',
                       'ready','delivering','delivered','cancelled'
                     )),
  total_amount     numeric(10,0) NOT NULL CHECK (total_amount > 0),
  delivery_fee     numeric(8,0) NOT NULL,
  delivery_address text NOT NULL,
  note_to_kitchen  text,
  promo_code       text,
  payment_method   text NOT NULL DEFAULT 'cash'
                     CHECK (payment_method IN ('cash')),
  prep_time_min    int CHECK (prep_time_min > 0),
  created_at       timestamptz NOT NULL DEFAULT now(),
  accepted_at      timestamptz,
  ready_at         timestamptz,
  delivered_at     timestamptz
);

-- ─── order_items ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  name         text NOT NULL,
  unit_price   numeric(8,0) NOT NULL CHECK (unit_price > 0),
  quantity     int NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

-- ─── reviews ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid NOT NULL REFERENCES profiles(id),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id),
  order_id      uuid NOT NULL REFERENCES orders(id) UNIQUE,
  rating        int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_open  ON restaurants(is_open);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category   ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer       ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant     ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order     ON order_items(order_id);

-- ─── Realtime ────────────────────────────────────────────────────────────────
-- Enable Realtime on orders table (run in Supabase dashboard or via CLI)
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;
