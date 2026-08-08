-- ============================================================
-- YaMo Deals — Migration 0005: toggle_restaurant_status RPC
-- ============================================================
CREATE OR REPLACE FUNCTION toggle_restaurant_status(
  p_restaurant_id uuid,
  p_owner_id      uuid,
  p_is_open       boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id uuid;
BEGIN
  SELECT owner_id INTO v_owner_id
  FROM restaurants
  WHERE id = p_restaurant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Restaurant not found';
  END IF;

  IF v_owner_id <> p_owner_id THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  UPDATE restaurants
  SET is_open = p_is_open
  WHERE id = p_restaurant_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_restaurant_status TO authenticated;
