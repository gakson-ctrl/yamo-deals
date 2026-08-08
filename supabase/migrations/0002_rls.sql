-- ============================================================
-- YaMo Deals — Migration 0002: Row Level Security
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE restaurants    ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;

-- ─── restaurants ─────────────────────────────────────────────────────────────
-- Public read; only the owner can insert/update/delete
CREATE POLICY "restaurants_select_all" ON restaurants
  FOR SELECT USING (true);

CREATE POLICY "restaurants_insert_owner" ON restaurants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "restaurants_update_owner" ON restaurants
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "restaurants_delete_owner" ON restaurants
  FOR DELETE USING (auth.uid() = owner_id);

-- ─── menu_categories ─────────────────────────────────────────────────────────
-- Public read; restaurant owner writes
CREATE POLICY "menu_categories_select_all" ON menu_categories
  FOR SELECT USING (true);

CREATE POLICY "menu_categories_write_owner" ON menu_categories
  FOR ALL USING (
    auth.uid() = (
      SELECT owner_id FROM restaurants WHERE id = restaurant_id
    )
  );

-- ─── menu_items ──────────────────────────────────────────────────────────────
-- Public read (available items only); restaurant owner writes all
CREATE POLICY "menu_items_select_available" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "menu_items_select_owner" ON menu_items
  FOR SELECT USING (
    auth.uid() = (
      SELECT owner_id FROM restaurants WHERE id = restaurant_id
    )
  );

CREATE POLICY "menu_items_write_owner" ON menu_items
  FOR ALL USING (
    auth.uid() = (
      SELECT owner_id FROM restaurants WHERE id = restaurant_id
    )
  );

-- ─── orders ──────────────────────────────────────────────────────────────────
-- Customer reads own orders; restaurant owner reads orders for their restaurant
-- No direct writes from client — all mutations go through RPCs

CREATE POLICY "orders_select_customer" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "orders_select_merchant" ON orders
  FOR SELECT USING (
    auth.uid() = (
      SELECT owner_id FROM restaurants WHERE id = restaurant_id
    )
  );

-- RPCs use SECURITY DEFINER so they bypass RLS internally
-- No INSERT/UPDATE policies needed for client — all writes go through RPCs

-- ─── order_items ─────────────────────────────────────────────────────────────
-- Follows order access: customer sees own, merchant sees their restaurant's
CREATE POLICY "order_items_select_customer" ON order_items
  FOR SELECT USING (
    auth.uid() = (SELECT customer_id FROM orders WHERE id = order_id)
  );

CREATE POLICY "order_items_select_merchant" ON order_items
  FOR SELECT USING (
    auth.uid() = (
      SELECT r.owner_id FROM orders o
      JOIN restaurants r ON r.id = o.restaurant_id
      WHERE o.id = order_id
    )
  );

-- ─── reviews ─────────────────────────────────────────────────────────────────
-- Public read; authenticated customer inserts for own completed orders only
CREATE POLICY "reviews_select_all" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_insert_customer" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_id
        AND customer_id = auth.uid()
        AND status = 'delivered'
    )
  );
