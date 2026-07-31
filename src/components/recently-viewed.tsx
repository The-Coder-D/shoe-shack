import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "./product-card";

export function RecentlyViewed({ slugs }: { slugs: string[] }) {
  const { data } = useQuery({
    queryKey: ["recently-viewed", slugs],
    queryFn: async () => {
      if (slugs.length === 0) return [];
      const { data, error } = await supabase
        .from("products")
        .select("slug, name, price_inr, compare_at_price_inr, members_only, category:categories(name), product_images(url, sort_order)")
        .in("slug", slugs)
        .eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
    enabled: slugs.length > 0,
  });

  if (!data || data.length === 0) return null;

  const ordered = slugs
    .map((slug) => data.find((p: any) => p.slug === slug))
    .filter(Boolean) as any[];

  return (
    <section className="container-page border-t border-border/60 py-16 md:py-24">
      <div className="eyebrow">Recently viewed</div>
      <h2 className="mt-3 font-display text-3xl md:text-4xl">Pick up where you left off.</h2>
      <div className="mt-8 flex gap-4 overflow-x-auto pb-4 md:gap-6">
        {ordered.map((p) => (
          <div key={p.slug} className="w-40 flex-shrink-0 md:w-56">
            <ProductCard
              p={{
                slug: p.slug,
                name: p.name,
                price_inr: p.price_inr,
                compare_at_price_inr: p.compare_at_price_inr,
                imageUrl: p.product_images?.[0]?.url ?? "/images/product-1.jpg",
                images: (p.product_images ?? [])
                  .slice()
                  .sort((a: any, b: any) => a.sort_order - b.sort_order)
                  .map((im: any) => im.url),
                categoryName: p.category?.name,
                membersOnly: p.members_only,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
