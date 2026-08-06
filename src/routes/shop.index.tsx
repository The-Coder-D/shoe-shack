import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";
import { MembersTeaserCard } from "@/components/members-teaser-card";
import { ProductGridSkeleton } from "@/components/product-skeleton";
import { AnimatedContent, ShinyText, SplitText, StaggerGrid, StaggerItem } from "@/components/animate";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop all footwear — Marché" },
      { name: "description", content: "Browse the full Marché collection: sneakers, boots, and formal shoes." },
      { property: "og:title", content: "Shop all footwear — Marché" },
      { property: "og:description", content: "The complete Marché collection." },
    ],
  }),
  component: ShopIndex,
});

function ShopIndex() {
  const { data, isLoading } = useQuery({
    queryKey: ["shop-all"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_shop_products");
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        slug: string;
        name: string;
        price_inr: number | null;
        compare_at_price_inr: number | null;
        members_only: boolean;
        category_name: string | null;
        first_image: string | null;
        locked: boolean;
      }[];
    },
  });

  return (
    <div className="container-page py-12 md:py-16">
      <AnimatedContent className="border-b border-border/60 pb-8">
        <div className="eyebrow">
          <ShinyText>Collection</ShinyText>
        </div>
        <h1 className="mt-3 font-display text-5xl">
          <span className="heading-hover">
            <SplitText text="All footwear" by="char" stagger={0.03} />
          </span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          {data?.length ?? 0} styles available. Every pair is made to order.
        </p>
      </AnimatedContent>
      {isLoading && (
        <ProductGridSkeleton
          count={8}
          className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-10 lg:grid-cols-4"
        />
      )}
      <StaggerGrid className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-10 lg:grid-cols-4">
        {(data ?? []).map((p) =>
          p.locked ? (
            <StaggerItem key={p.slug}>
              <MembersTeaserCard
                p={{
                slug: p.slug,
                name: p.name,
                imageUrl: p.first_image ?? "/images/product-1.jpg",
                categoryName: p.category_name,
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
                categoryName: p.category_name,
                membersOnly: p.members_only,
                }}
              />
            </StaggerItem>
          ),
        )}
      </StaggerGrid>
    </div>
  );
}
