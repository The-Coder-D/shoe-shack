import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/shop/$category")({
  head: ({ params }) => ({
    meta: [
      { title: `${cap(params.category)} — Marché` },
      { name: "description", content: `Shop ${cap(params.category)} at Marché.` },
      { property: "og:title", content: `${cap(params.category)} — Marché` },
    ],
  }),
  component: CategoryPage,
});

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function CategoryPage() {
  const { category } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["shop", category],
    queryFn: async () => {
      const { data: cat, error: e1 } = await supabase
        .from("categories")
        .select("id, name, description")
        .eq("slug", category)
        .maybeSingle();
      if (e1) throw e1;
      if (!cat) throw notFound();
      const { data: prods, error } = await supabase
        .from("products")
        .select("slug, name, price_inr, compare_at_price_inr, members_only, product_images(url, sort_order)")
        .eq("category_id", cat.id)
        .eq("is_active", true);
      if (error) throw error;
      return { cat, prods: prods ?? [] };
    },
  });

  const skeletonCount =
    category === "sneakers" ? 3 : category === "boots" ? 1 : category === "formal" ? 1 : 3;

  if (isLoading || !data) {
    return (
      <div className="container-page py-12 md:py-16">
        <div className="border-b border-border/60 pb-8">
          <div className="eyebrow">Collection</div>
          <h1 className="mt-3 font-display text-5xl capitalize">{category}</h1>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-10 lg:grid-cols-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] w-full rounded-sm bg-secondary/60" />
              <div className="mt-4 h-3 w-2/3 rounded-sm bg-secondary/60" />
              <div className="mt-2 h-3 w-1/3 rounded-sm bg-secondary/40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12 md:py-16">
      <div className="border-b border-border/60 pb-8">
        <div className="eyebrow">Collection</div>
        <h1 className="mt-3 font-display text-5xl">{data.cat.name}</h1>
        {data.cat.description && <p className="mt-3 max-w-xl text-sm text-muted-foreground">{data.cat.description}</p>}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-10 lg:grid-cols-4">
        {data.prods.map((p: any) => (
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
              categoryName: data.cat.name,
              membersOnly: p.members_only,
            }}
          />
        ))}
        {data.prods.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
            Nothing here yet. Check back soon.
          </div>
        )}
      </div>
    </div>
  );
}