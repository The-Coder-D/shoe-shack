CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  comment text,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews public read" ON public.reviews
  FOR SELECT TO anon, authenticated USING (is_hidden = false);

CREATE POLICY "admins read all reviews" ON public.reviews
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users write own review" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "users update own review" ON public.reviews
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "users delete own review" ON public.reviews
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX reviews_product_idx ON public.reviews (product_id);

CREATE OR REPLACE FUNCTION public.get_product_rating(_product_id uuid)
RETURNS TABLE (avg_rating numeric, review_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0), COUNT(*)
  FROM public.reviews
  WHERE product_id = _product_id AND is_hidden = false
$$;

REVOKE ALL ON FUNCTION public.get_product_rating(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_product_rating(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.has_purchased_product(_product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = _product_id AND o.user_id = auth.uid()
  )
$$;

REVOKE ALL ON FUNCTION public.has_purchased_product(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_purchased_product(uuid) TO authenticated;