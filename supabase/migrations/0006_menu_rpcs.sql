-- ============================================================
-- YaMo Deals — Migration 0006: Menu Manager RPCs
-- ============================================================
-- NOTE: Before running this migration, create a Supabase Storage bucket
-- named "menu-items" with public read + authenticated write policies.
-- Supabase Dashboard → Storage → New bucket → name: menu-items → Public: true

-- ─── insert_menu_item ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION insert_menu_item(
  p_restaurant_id uuid,
  p_owner_id      uuid,
  p_category_id   uuid,
  p_name          text,
  p_description   text    DEFAULT NULL,
  p_price         numeric DEFAULT 0,
  p_image_url     text    DEFAULT NULL,
  p_is_available  boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id uuid;
  v_item_id  uuid;
BEGIN
  SELECT owner_id INTO v_owner_id
  FROM restaurants WHERE id = p_restaurant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Restaurant not found';
  END IF;

  IF v_owner_id <> p_owner_id THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  INSERT INTO menu_items (
    restaurant_id, category_id, name, description, price, image_url, is_available
  ) VALUES (
    p_restaurant_id, p_category_id, p_name, p_description, p_price, p_image_url, p_is_available
  )
  RETURNING id INTO v_item_id;

  RETURN v_item_id;
END;
$$;

-- ─── update_menu_item ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_menu_item(
  p_item_id      uuid,
  p_owner_id     uuid,
  p_name         text,
  p_description  text    DEFAULT NULL,
  p_price        numeric DEFAULT 0,
  p_image_url    text    DEFAULT NULL,
  p_is_available boolean DEFAULT true,
  p_category_id  uuid    DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id uuid;
BEGIN
  SELECT r.owner_id INTO v_owner_id
  FROM menu_items mi
  JOIN restaurants r ON r.id = mi.restaurant_id
  WHERE mi.id = p_item_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found';
  END IF;

  IF v_owner_id <> p_owner_id THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  UPDATE menu_items
  SET
    name         = p_name,
    description  = p_description,
    price        = p_price,
    image_url    = p_image_url,
    is_available = p_is_available,
    category_id  = p_category_id
  WHERE id = p_item_id;

  RETURN true;
END;
$$;

-- ─── delete_menu_item ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION delete_menu_item(
  p_item_id  uuid,
  p_owner_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id uuid;
BEGIN
  SELECT r.owner_id INTO v_owner_id
  FROM menu_items mi
  JOIN restaurants r ON r.id = mi.restaurant_id
  WHERE mi.id = p_item_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found';
  END IF;

  IF v_owner_id <> p_owner_id THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  DELETE FROM menu_items WHERE id = p_item_id;

  RETURN true;
END;
$$;

-- ─── insert_menu_category ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION insert_menu_category(
  p_restaurant_id uuid,
  p_owner_id      uuid,
  p_name          text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id uuid;
  v_cat_id   uuid;
  v_order    int;
BEGIN
  SELECT owner_id INTO v_owner_id
  FROM restaurants WHERE id = p_restaurant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Restaurant not found';
  END IF;

  IF v_owner_id <> p_owner_id THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT COALESCE(MAX(display_order), -1) + 1 INTO v_order
  FROM menu_categories WHERE restaurant_id = p_restaurant_id;

  INSERT INTO menu_categories (restaurant_id, name, display_order)
  VALUES (p_restaurant_id, p_name, v_order)
  RETURNING id INTO v_cat_id;

  RETURN v_cat_id;
END;
$$;

GRANT EXECUTE ON FUNCTION insert_menu_item     TO authenticated;
GRANT EXECUTE ON FUNCTION update_menu_item     TO authenticated;
GRANT EXECUTE ON FUNCTION delete_menu_item     TO authenticated;
GRANT EXECUTE ON FUNCTION insert_menu_category TO authenticated;
