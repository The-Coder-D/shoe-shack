-- Validate a coupon by code without exposing all codes
CREATE OR REPLACE FUNCTION public.validate_coupon(_code text)
RETURNS TABLE (
  id uuid,
  code text,
  discount_inr integer,
  discount_percent integer,
  min_order_inr integer,
  usage_limit integer,
  used_count integer,
  is_welcome boolean,
  expires_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.code, c.discount_inr, c.discount_percent, c.min_order_inr, c.usage_limit, c.used_count, c.is_welcome, c.expires_at
  FROM public.coupons c
  WHERE c.code = _code
    AND c.is_active = true
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND (c.usage_limit IS NULL OR c.used_count < c.usage_limit);
$$;

-- Stock alerts: authenticated only, no anonymous spoofing
DROP POLICY IF EXISTS "Users manage own stock alerts" ON public.stock_alerts;

CREATE POLICY "Users manage own stock alerts"
ON public.stock_alerts
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant execute on helpers
GRANT EXECUTE ON FUNCTION public.validate_coupon(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text) TO anon;