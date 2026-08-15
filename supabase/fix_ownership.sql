-- =====================================================================
-- YaMo Deals — Split restaurant ownership across two merchants
-- Run in: Supabase Dashboard → SQL Editor
--
-- Merchant A: 237677002222 (9dbe55f0-c29a-409e-af86-c240c13f31ac)
--   → Soya King, La Cabane Sandwich, Pizzeria Il Gusto, Brasa Poulet Braisé
-- Merchant B: 237677003333
--   → Boulangerie des Beignets, Saveurs d'Afrique, Bar Le Pirogue, Chez Maman Beti
--
-- NOTE: the merchant dashboard resolves to ONE restaurant per owner
-- (getRestaurantByOwner → limit 1 = oldest). So each merchant will still
-- surface only their oldest restaurant until a restaurant-switcher is added.
-- =====================================================================

DO $$
DECLARE
  v_merchant_a uuid := '9dbe55f0-c29a-409e-af86-c240c13f31ac';  -- 237677002222
  v_merchant_b uuid;
BEGIN
  SELECT id INTO v_merchant_b FROM profiles WHERE phone = '237677003333';
  IF v_merchant_b IS NULL THEN
    RAISE EXCEPTION 'Merchant 237677003333 not found — register that account first.';
  END IF;

  -- Merchant A → Soya King (0002), La Cabane (0003), Pizzeria (0004), Brasa (0005)
  UPDATE restaurants
  SET owner_id = v_merchant_a, is_open = true
  WHERE id IN (
    'a0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000004',
    'a0000000-0000-4000-8000-000000000005'
  );

  -- Merchant B → Boulangerie (0006), Saveurs d'Afrique (0008), Bar Le Pirogue (0007), Chez Maman Beti (0001)
  UPDATE restaurants
  SET owner_id = v_merchant_b, is_open = true
  WHERE id IN (
    'a0000000-0000-4000-8000-000000000006',
    'a0000000-0000-4000-8000-000000000008',
    'a0000000-0000-4000-8000-000000000007',
    'a0000000-0000-4000-8000-000000000001'
  );

  RAISE NOTICE 'Ownership split: A=% (4), B=% (4).', v_merchant_a, v_merchant_b;
END $$;

-- ─── Verify: restaurant name + owner phone ────────────────────────────────────
SELECT r.name, p.phone AS owner_phone, r.is_open
FROM restaurants r
JOIN profiles p ON p.id = r.owner_id
ORDER BY p.phone, r.name;
