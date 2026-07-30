ALTER TABLE public.products ADD COLUMN IF NOT EXISTS members_only boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "products public read active" ON public.products;
CREATE POLICY "products read visible"
ON public.products
FOR SELECT
TO anon, authenticated
USING (
  (is_active = true AND (members_only = false OR auth.uid() IS NOT NULL))
  OR has_role(auth.uid(), 'admin'::app_role)
);