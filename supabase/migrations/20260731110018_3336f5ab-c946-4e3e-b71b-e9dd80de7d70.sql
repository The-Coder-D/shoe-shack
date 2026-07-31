ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS discount_inr integer NOT NULL DEFAULT 0;

GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;