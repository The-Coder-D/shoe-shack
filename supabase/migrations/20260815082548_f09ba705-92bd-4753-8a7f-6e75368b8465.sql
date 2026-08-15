-- 1) Stop bulk enumeration of active coupons
DROP POLICY IF EXISTS "Anyone can read active coupons by code" ON public.coupons;
REVOKE ALL ON public.coupons FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated; -- admin-only policy still gates access
REVOKE EXECUTE ON FUNCTION public.validate_coupon(text) FROM anon, authenticated, PUBLIC;

-- 2) Reduce SECURITY DEFINER surface: these do not need elevated privileges
CREATE OR REPLACE FUNCTION public.get_product_rating(_product_id uuid)
RETURNS TABLE(avg_rating numeric, review_count bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0), COUNT(*)
  FROM public.reviews
  WHERE product_id = _product_id AND is_hidden = false
$$;

CREATE OR REPLACE FUNCTION public.has_purchased_product(_product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = _product_id AND o.user_id = auth.uid()
  )
$$;
REVOKE EXECUTE ON FUNCTION public.has_purchased_product(uuid) FROM anon;

-- 3) Public catalog functions stay SECURITY DEFINER by design (they mask members-only
-- pricing for guests) but must not be executable beyond the intended API roles.
REVOKE EXECUTE ON FUNCTION public.get_shop_products() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_shop_products_by_category(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shop_products() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_shop_products_by_category(text) TO anon, authenticated;