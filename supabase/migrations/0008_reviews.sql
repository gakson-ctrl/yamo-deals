-- 0008_reviews.sql
-- insert_review RPC: validates ownership + delivery status, inserts review, updates restaurant rating

CREATE OR REPLACE FUNCTION insert_review(
  p_order_id     uuid,
  p_customer_id  uuid,
  p_restaurant_id uuid,
  p_rating       int,
  p_comment      text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_review_id       uuid;
  v_order_status    text;
  v_order_customer  uuid;
BEGIN
  -- Verify order exists and belongs to the customer
  SELECT status, customer_id
  INTO v_order_status, v_order_customer
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Commande introuvable';
  END IF;

  IF v_order_customer != p_customer_id THEN
    RAISE EXCEPTION 'Cette commande ne vous appartient pas';
  END IF;

  IF v_order_status != 'delivered' THEN
    RAISE EXCEPTION 'La commande n''a pas encore été livrée';
  END IF;

  -- One review per order (UNIQUE constraint on reviews.order_id also enforces this)
  IF EXISTS (SELECT 1 FROM reviews WHERE order_id = p_order_id) THEN
    RAISE EXCEPTION 'Avis déjà soumis pour cette commande';
  END IF;

  -- Insert review
  INSERT INTO reviews (customer_id, restaurant_id, order_id, rating, comment)
  VALUES (p_customer_id, p_restaurant_id, p_order_id, p_rating, p_comment)
  RETURNING id INTO v_review_id;

  -- Update restaurant rolling average
  UPDATE restaurants
  SET
    rating       = (
      SELECT ROUND(AVG(r.rating)::numeric, 1)
      FROM reviews r
      WHERE r.restaurant_id = p_restaurant_id
    ),
    rating_count = (
      SELECT COUNT(*) FROM reviews r WHERE r.restaurant_id = p_restaurant_id
    )
  WHERE id = p_restaurant_id;

  RETURN v_review_id;
END;
$$;

GRANT EXECUTE ON FUNCTION insert_review TO authenticated;
