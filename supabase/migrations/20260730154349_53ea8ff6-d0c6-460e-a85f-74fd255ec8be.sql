REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

DROP POLICY IF EXISTS "products read visible" ON public.products;

CREATE POLICY "products public read"
ON public.products
FOR SELECT
TO anon, authenticated
USING (is_active = true AND (members_only = false OR auth.uid() IS NOT NULL));

CREATE POLICY "admins read all products"
ON public.products
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));