CREATE OR REPLACE FUNCTION public.get_shop_products()
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  price_inr integer,
  compare_at_price_inr integer,
  members_only boolean,
  category_id uuid,
  category_name text,
  first_image text,
  locked boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.slug,
    p.name,
    CASE WHEN p.members_only AND auth.uid() IS NULL THEN NULL ELSE p.price_inr END AS price_inr,
    CASE WHEN p.members_only AND auth.uid() IS NULL THEN NULL ELSE p.compare_at_price_inr END AS compare_at_price_inr,
    p.members_only,
    p.category_id,
    c.name AS category_name,
    (SELECT pi.url FROM public.product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) AS first_image,
    (p.members_only AND auth.uid() IS NULL) AS locked
  FROM public.products p
  LEFT JOIN public.categories c ON c.id = p.category_id
  WHERE p.is_active = true
  ORDER BY p.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_shop_products_by_category(_category_slug text)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  price_inr integer,
  compare_at_price_inr integer,
  members_only boolean,
  category_id uuid,
  category_name text,
  first_image text,
  locked boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.slug,
    p.name,
    CASE WHEN p.members_only AND auth.uid() IS NULL THEN NULL ELSE p.price_inr END AS price_inr,
    CASE WHEN p.members_only AND auth.uid() IS NULL THEN NULL ELSE p.compare_at_price_inr END AS compare_at_price_inr,
    p.members_only,
    p.category_id,
    c.name AS category_name,
    (SELECT pi.url FROM public.product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) AS first_image,
    (p.members_only AND auth.uid() IS NULL) AS locked
  FROM public.products p
  LEFT JOIN public.categories c ON c.id = p.category_id
  WHERE p.is_active = true AND c.slug = _category_slug
  ORDER BY p.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_shop_products() TO anon;
GRANT EXECUTE ON FUNCTION public.get_shop_products() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shop_products_by_category(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_shop_products_by_category(text) TO authenticated;