-- =====================================================================
-- YaMo Deals — Fresh PENDING test order
-- Target restaurant: Soya King Mvog-Ada (a0000000-0000-4000-8000-000000000002)
--   ^ This is the restaurant the merchant 237677002222 dashboard resolves to,
--     so the pending order will appear in "Nouvelles" for the Accepter test.
-- Customer: Fatima (phone 237699005555)
-- Status: pending
-- Run in: Supabase Dashboard → SQL Editor
-- =====================================================================

DO $$
DECLARE
  v_customer_id uuid;
  v_restaurant_id uuid := 'a0000000-0000-4000-8000-000000000002';  -- Soya King Mvog-Ada
  v_order_id uuid;
BEGIN
  -- Resolve Fatima's profile id
  SELECT id INTO v_customer_id
  FROM profiles
  WHERE phone = '237699005555';

  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Customer 237699005555 (Fatima) not found — register her first.';
  END IF;

  -- Order header — total_amount = sum of item lines (excl. delivery)
  -- 1x Brochettes 1500 + 1x Demi-poulet 3000 + 2x Top Ananas 700 = 5900
  INSERT INTO orders (
    customer_id, restaurant_id, status,
    total_amount, delivery_fee, delivery_address,
    note_to_kitchen, payment_method
  ) VALUES (
    v_customer_id, v_restaurant_id, 'pending',
    5900, 200, 'Bastos, Yaoundé',
    'Test — bien épicé', 'cash'
  ) RETURNING id INTO v_order_id;

  -- Order items (Soya King menu, snapshots of name + price)
  INSERT INTO order_items (order_id, menu_item_id, name, unit_price, quantity) VALUES
    (v_order_id, 'c0000000-0000-4000-8000-000000000011', 'Brochettes de bœuf soya', 1500, 1),
    (v_order_id, 'c0000000-0000-4000-8000-000000000013', 'Demi-poulet braisé',      3000, 1),
    (v_order_id, 'c0000000-0000-4000-8000-000000000019', 'Top Ananas 33 cl',        700,  2);

  RAISE NOTICE 'Pending order % created at Soya King for customer %.', v_order_id, v_customer_id;
END $$;

-- Verify
SELECT o.id, o.status, o.total_amount, o.created_at, count(oi.id) AS items
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.restaurant_id = 'a0000000-0000-4000-8000-000000000002'
  AND o.status = 'pending'
GROUP BY o.id
ORDER BY o.created_at DESC;
