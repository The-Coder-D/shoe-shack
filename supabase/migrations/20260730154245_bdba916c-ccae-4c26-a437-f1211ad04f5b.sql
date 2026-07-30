DROP POLICY IF EXISTS "products read visible" ON public.products;
CREATE POLICY "products read visible"
ON public.products
FOR SELECT
TO anon, authenticated
USING (
  (is_active = true AND (members_only = false OR auth.uid() IS NOT NULL))
  OR (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
);