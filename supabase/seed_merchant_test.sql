-- =====================================================================
-- YaMo Deals — Merchant test account + 2 pending orders
-- Target: Chez Maman Beti (a0000000-0000-4000-8000-000000000001)
-- Run in: Supabase Dashboard → SQL Editor
--
-- Wrapped in a DO block so the gen_random_uuid() merchant id flows
-- through auth.users → profiles → restaurants → orders → order_items.
--
-- Handles the POSSA-shared profiles columns (possa_handle, pin_hash)
-- and the phone / handle format constraints.
-- =====================================================================

DO $$
DECLARE
  v_merchant_id  uuid := gen_random_uuid();
  v_customer_id  uuid;
  v_restaurant_id uuid := 'a0000000-0000-4000-8000-000000000001';  -- Chez Maman Beti
  v_order1_id    uuid;
  v_order2_id    uuid;
BEGIN
  -- ─── Pick an existing customer ────────────────────────────────────────────
  SELECT id INTO v_customer_id
  FROM profiles
  WHERE role = 'customer'
  ORDER BY created_at
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'No customer profile found — create a customer account first (register a customer in the app), then re-run.';
  END IF;

  -- ─── auth.users row (FK target for profiles.id) ───────────────────────────
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role, aud
  ) VALUES (
    v_merchant_id,
    '00000000-0000-0000-0000-000000000000',
    'demo_237677000999@yamo.demo',
    crypt('YamoDemo2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(), now(), 'authenticated', 'authenticated'
  );

  -- ─── Merchant profile ─────────────────────────────────────────────────────
  INSERT INTO profiles (
    id, phone, display_name, role, locale, possa_handle, pin_hash
  ) VALUES (
    v_merchant_id,
    '237677000999',
    'Patron Maman Beti',
    'merchant',
    'fr',
    'maman_beti@possa-cm',
    crypt('000000', gen_salt('bf'))   -- dummy PIN, seed only
  );

  -- ─── Link + open the restaurant ───────────────────────────────────────────
  UPDATE restaurants
  SET owner_id = v_merchant_id,
      is_open  = true
  WHERE id = v_restaurant_id;

  -- ─── Order 1 — Ndolé + 2 jus de gingembre ─────────────────────────────────
  -- 4 500 + (800 × 2) = 6 100 FCFA
  INSERT INTO orders (
    customer_id, restaurant_id, status,
    total_amount, delivery_fee, delivery_address,
    note_to_kitchen, payment_method
  ) VALUES (
    v_customer_id, v_restaurant_id, 'pending',
    6100, 300, 'Rue 1.750, Bastos, Yaoundé',
    'Bien pimenté svp', 'cash'
  ) RETURNING id INTO v_order1_id;

  INSERT INTO order_items (order_id, menu_item_id, name, unit_price, quantity) VALUES
    (v_order1_id, 'c0000000-0000-4000-8000-000000000004', 'Ndolé aux crevettes', 4500, 1),
    (v_order1_id, 'c0000000-0000-4000-8000-000000000008', 'Jus de gingembre',    800,  2);

  -- ─── Order 2 — Poulet DG + Foléré + Eau ───────────────────────────────────
  -- 6 000 + 700 + 600 = 7 300 FCFA
  INSERT INTO orders (
    customer_id, restaurant_id, status,
    total_amount, delivery_fee, delivery_address,
    note_to_kitchen, payment_method
  ) VALUES (
    v_customer_id, v_restaurant_id, 'pending',
    7300, 300, 'Avenue Kennedy, immeuble T-Bo, Yaoundé',
    NULL, 'cash'
  ) RETURNING id INTO v_order2_id;

  INSERT INTO order_items (order_id, menu_item_id, name, unit_price, quantity) VALUES
    (v_order2_id, 'c0000000-0000-4000-8000-000000000005', 'Poulet DG',         6000, 1),
    (v_order2_id, 'c0000000-0000-4000-8000-000000000009', 'Foléré (bissap)',   700,  1),
    (v_order2_id, 'c0000000-0000-4000-8000-000000000010', 'Eau minérale 1,5 L', 600,  1);

  RAISE NOTICE 'Merchant % created, restaurant linked, orders % and % inserted for customer %.',
    v_merchant_id, v_order1_id, v_order2_id, v_customer_id;
END $$;

-- ─── Verify ───────────────────────────────────────────────────────────────────
SELECT o.id, o.status, o.total_amount, o.delivery_address,
       count(oi.id) AS item_count
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.restaurant_id = 'a0000000-0000-4000-8000-000000000001'
GROUP BY o.id
ORDER BY o.created_at DESC;
