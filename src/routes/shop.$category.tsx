import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";
import { MembersTeaserCard } from "@/components/members-teaser-card";
import { ProductGridSkeleton } from "@/components/product-skeleton";
import { AnimatedContent, ShinyText, SplitText, StaggerGrid, StaggerItem } from "@/components/animate";

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
      const { data: prods, error } = await supabase.rpc("get_shop_products_by_category", {
        _category_slug: category,
      });
      if (error) throw error;
      return {
        cat,
        prods: (prods ?? []) as {
          id: string;
          slug: string;
          name: string;
          price_inr: number | null;
          compare_at_price_inr: number | null;
          members_only: boolean;
          category_name: string | null;
          first_image: string | null;
          locked: boolean;
        }[],
      };
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
        <ProductGridSkeleton
          count={skeletonCount}
          className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-10 lg:grid-cols-4"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-12 md:py-16">
      <AnimatedContent className="border-b border-border/60 pb-8">
        <div className="eyebrow">
          <ShinyText>Collection</ShinyText>
        </div>
        <h1 className="mt-3 font-display text-5xl">
          <span className="heading-hover">
            <SplitText text={data.cat.name} by="char" stagger={0.03} />
          </span>
        </h1>
        {data.cat.description && <p className="mt-3 max-w-xl text-sm text-muted-foreground">{data.cat.description}</p>}
      </AnimatedContent>
      <StaggerGrid className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-10 lg:grid-cols-4">
        {data.prods.map((p) =>
          p.locked ? (
            <StaggerItem key={p.slug}>
              <MembersTeaserCard
                p={{
                slug: p.slug,
                name: p.name,
                imageUrl: p.first_image ?? "/images/product-1.jpg",
                categoryName: data.cat.name,
                }}
              />
            </StaggerItem>
          ) : (
            <StaggerItem key={p.slug}>
              <ProductCard
                p={{
                productId: p.id,
                slug: p.slug,
                name: p.name,
                price_inr: p.price_inr ?? 0,
                compare_at_price_inr: p.compare_at_price_inr,
                imageUrl: p.first_image ?? "/images/product-1.jpg",
                images: p.first_image ? [p.first_image] : ["/images/product-1.jpg"],
                categoryName: data.cat.name,
                membersOnly: p.members_only,
                }}
              />
            </StaggerItem>
          ),
        )}
        {data.prods.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
            Nothing here yet. Check back soon.
          </div>
        )}
      </StaggerGrid>
    </div>
  );
}
