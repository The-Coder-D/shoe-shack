import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop all footwear — Marché" },
      { name: "description", content: "Browse the full Marché collection: sneakers, runners, boots, and formal shoes." },
      { property: "og:title", content: "Shop all footwear — Marché" },
      { property: "og:description", content: "The complete Marché collection." },
    ],
  }),
  component: ShopIndex,
});

function ShopIndex() {
  const { data } = useQuery({
    queryKey: ["shop-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("slug, name, price_inr, compare_at_price_inr, category:categories(name), product_images(url, sort_order)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="container-page py-12 md:py-16">
      <div className="border-b border-border/60 pb-8">
        <div className="eyebrow">Collection</div>
        <h1 className="mt-3 font-display text-5xl">All footwear</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          {data?.length ?? 0} styles available. Every pair is made to order.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-10 lg:grid-cols-4">
        {(data ?? []).map((p: any) => (
          <ProductCard
            key={p.slug}
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
            }}
          />
        ))}
      </div>
    </div>
  );
}