-- =====================================================================
-- YaMo Deals — Fix Bug 1 (place_order RPC) + Bug 2 (restaurant owner)
-- Run in: Supabase Dashboard → SQL Editor
-- Run each numbered section in order; read the diagnostic output first.
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- 0. DIAGNOSTICS — run these first and read the output
-- ─────────────────────────────────────────────────────────────────────

-- 0a. What columns does the orders table actually have?
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 0b. Does the place_order RPC exist?  (empty result = it's missing = Bug 1)
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'place_order';


-- ─────────────────────────────────────────────────────────────────────
-- 1. BUG 1 FIX — (re)create the order RPCs
--    CREATE OR REPLACE is idempotent: safe whether or not they exist.
-- ─────────────────────────────────────────────────────────────────────

-- place_order — re-fetches prices server-side, validates min_order,
-- inserts order + order_items atomically. SECURITY DEFINER bypasses RLS.
CREATE OR REPLACE FUNCTION place_order(
  p_customer_id      uuid,
  p_restaurant_id    uuid,
  p_items            jsonb,   -- [{"menu_item_id":"...","quantity":N}]
  p_delivery_address text,
  p_note             text DEFAULT NULL,
  p_promo_code       text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id     uuid;
  v_total        numeric(10,0) := 0;
  v_delivery_fee numeric(8,0);
  v_min_order    numeric(8,0);
  v_item         jsonb;
  v_item_id      uuid;
  v_quantity     int;
  v_price        numeric(8,0);
  v_name         text;
BEGIN
  SELECT delivery_fee, min_order
  INTO v_delivery_fee, v_min_order
  FROM restaurants
  WHERE id = p_restaurant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Restaurant not found';
  END IF;

  -- Validate + accumulate total (never trust client prices)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_id  := (v_item->>'menu_item_id')::uuid;
    v_quantity := (v_item->>'quantity')::int;

    IF v_quantity < 1 THEN
      RAISE EXCEPTION 'Quantity must be >= 1';
    END IF;

    SELECT price, name INTO v_price, v_name
    FROM menu_items
    WHERE id = v_item_id
      AND restaurant_id = p_restaurant_id
      AND is_available = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Menu item % not available', v_item_id;
    END IF;

    v_total := v_total + (v_price * v_quantity);
  END LOOP;

  IF v_total < v_min_order THEN
    RAISE EXCEPTION 'Order total % FCFA is below minimum % FCFA', v_total, v_min_order;
  END IF;

  INSERT INTO orders (
    customer_id, restaurant_id, status,
    total_amount, delivery_fee, delivery_address,
    note_to_kitchen, promo_code, payment_method
  ) VALUES (
    p_customer_id, p_restaurant_id, 'pending',
    v_total, v_delivery_fee, p_delivery_address,
    p_note, p_promo_code, 'cash'
  )
  RETURNING id INTO v_order_id;

  -- Snapshot each item's name + price at order time
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_id  := (v_item->>'menu_item_id')::uuid;
    v_quantity := (v_item->>'quantity')::int;

    SELECT price, name INTO v_price, v_name
    FROM menu_items WHERE id = v_item_id;

    INSERT INTO order_items (order_id, menu_item_id, name, unit_price, quantity)
    VALUES (v_order_id, v_item_id, v_name, v_price, v_quantity);
  END LOOP;

  RETURN jsonb_build_object(
    'order_id',     v_order_id,
    'total_amount', v_total,
    'delivery_fee', v_delivery_fee
  );
END;
$$;

-- accept_order
CREATE OR REPLACE FUNCTION accept_order(
  p_order_id uuid, p_merchant_id uuid, p_prep_time_min int
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_owner_id uuid; v_status text;
BEGIN
  SELECT r.owner_id, o.status INTO v_owner_id, v_status
  FROM orders o JOIN restaurants r ON r.id = o.restaurant_id
  WHERE o.id = p_order_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_owner_id <> p_merchant_id THEN RAISE EXCEPTION 'Not authorised'; END IF;
  IF v_status <> 'pending' THEN RAISE EXCEPTION 'Order is not pending (current: %)', v_status; END IF;
  IF p_prep_time_min < 1 THEN RAISE EXCEPTION 'prep_time_min must be >= 1'; END IF;

  UPDATE orders
  SET status = 'accepted', accepted_at = now(), prep_time_min = p_prep_time_min
  WHERE id = p_order_id;
  RETURN true;
END;
$$;

-- update_order_status
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id uuid, p_merchant_id uuid, p_new_status text
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_owner_id uuid; v_cur_status text; v_allowed text[];
BEGIN
  SELECT r.owner_id, o.status INTO v_owner_id, v_cur_status
  FROM orders o JOIN restaurants r ON r.id = o.restaurant_id
  WHERE o.id = p_order_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_owner_id <> p_merchant_id THEN RAISE EXCEPTION 'Not authorised'; END IF;

  v_allowed := CASE v_cur_status
    WHEN 'accepted'   THEN ARRAY['preparing','cancelled']
    WHEN 'preparing'  THEN ARRAY['ready','cancelled']
    WHEN 'ready'      THEN ARRAY['delivering','delivered']
    WHEN 'delivering' THEN ARRAY['delivered']
    ELSE ARRAY[]::text[]
  END;

  IF p_new_status <> ALL(v_allowed) THEN
    RAISE EXCEPTION 'Invalid transition: % -> %', v_cur_status, p_new_status;
  END IF;

  UPDATE orders
  SET status = p_new_status,
      ready_at     = CASE WHEN p_new_status = 'ready'     THEN now() ELSE ready_at END,
      delivered_at = CASE WHEN p_new_status = 'delivered' THEN now() ELSE delivered_at END
  WHERE id = p_order_id;
  RETURN true;
END;
$$;

-- cancel_order
CREATE OR REPLACE FUNCTION cancel_order(p_order_id uuid, p_actor_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_customer_id uuid; v_owner_id uuid; v_status text;
        v_is_customer boolean; v_is_merchant boolean;
BEGIN
  SELECT o.customer_id, r.owner_id, o.status
  INTO v_customer_id, v_owner_id, v_status
  FROM orders o JOIN restaurants r ON r.id = o.restaurant_id
  WHERE o.id = p_order_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;

  v_is_customer := (p_actor_id = v_customer_id);
  v_is_merchant := (p_actor_id = v_owner_id);

  IF NOT v_is_customer AND NOT v_is_merchant THEN RAISE EXCEPTION 'Not authorised'; END IF;
  IF v_is_customer AND v_status <> 'pending' THEN
    RAISE EXCEPTION 'Customer can only cancel pending orders';
  END IF;
  IF v_is_merchant AND v_status IN ('delivered','cancelled') THEN
    RAISE EXCEPTION 'Order already terminal: %', v_status;
  END IF;

  UPDATE orders SET status = 'cancelled' WHERE id = p_order_id;
  RETURN true;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION place_order         TO authenticated;
GRANT EXECUTE ON FUNCTION accept_order        TO authenticated;
GRANT EXECUTE ON FUNCTION update_order_status TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_order        TO authenticated;


-- ─────────────────────────────────────────────────────────────────────
-- 1b. TEST place_order without side effects (BEGIN … ROLLBACK)
--     Should return a jsonb with order_id + total_amount, then roll back
--     so no real order is persisted. If it errors, the message tells why.
-- ─────────────────────────────────────────────────────────────────────
BEGIN;
  SELECT place_order(
    (SELECT id FROM profiles WHERE role = 'customer' ORDER BY created_at LIMIT 1),
    'a0000000-0000-4000-8000-000000000001',                       -- Chez Maman Beti
    '[{"menu_item_id":"c0000000-0000-4000-8000-000000000004","quantity":1}]'::jsonb,  -- Ndolé 4500
    'Adresse de test, Bastos, Yaoundé'
  ) AS test_result;
ROLLBACK;


-- ─────────────────────────────────────────────────────────────────────
-- 2. BUG 2 FIX — assign all restaurants to the merchant
--    (merchant id 9dbe55f0-c29a-409e-af86-c240c13f31ac / 237677002222)
-- ─────────────────────────────────────────────────────────────────────
UPDATE restaurants
SET owner_id = '9dbe55f0-c29a-409e-af86-c240c13f31ac',
    is_open  = true
WHERE owner_id IS NULL
   OR owner_id <> '9dbe55f0-c29a-409e-af86-c240c13f31ac';

-- 2b. Verify — every row should now show the merchant id + is_open = true
SELECT id, name, owner_id, is_open
FROM restaurants
ORDER BY name;
