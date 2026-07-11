import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("slug, name, price_inr, compare_at_price_inr, category:categories(name), product_images(url, sort_order)")
        .eq("is_featured", true)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="container-page grid gap-10 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-6 md:pt-8">
            <div className="eyebrow">Autumn / Winter 26</div>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] md:text-7xl">
              Considered<br />footwear,<br />made for<br /><em className="text-accent not-italic">the long walk.</em>
            </h1>
            <p className="mt-8 max-w-md text-muted-foreground">
              Premium sneakers, boots and formal shoes — designed in Bengaluru, crafted
              in small runs from full-grain leather and heritage textiles.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="text-sm underline underline-offset-4">Our story</Link>
            </div>
          </div>
          <div className="md:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
              <img src="/images/hero.jpg" alt="Vortex Atlas Low sneaker in cream" width={1600} height={1200} className="h-full w-full object-cover" />
              <div className="absolute bottom-6 left-6 rounded-sm bg-background/90 px-4 py-3 backdrop-blur">
                <div className="eyebrow">New</div>
                <div className="mt-1 font-display text-lg">Atlas Low — Cream</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Sneakers", to: "/shop/sneakers" },
            { label: "Runners", to: "/shop/runners" },
            { label: "Boots", to: "/shop/boots" },
            { label: "Formal", to: "/shop/formal" },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-sm border border-border/60 bg-secondary p-5 transition-colors hover:bg-secondary/70">
              <div>
                <div className="eyebrow">Shop</div>
                <div className="mt-1 font-display text-2xl">{c.label}</div>
              </div>
              <ArrowRight className="absolute right-5 top-5 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-16 md:py-24">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow">Featured</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">This month.</h2>
          </div>
          <Link to="/shop" className="hidden text-sm underline underline-offset-4 md:inline">View all</Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {(featured ?? []).map((p: any) => (
            <ProductCard
              key={p.slug}
              p={{
                slug: p.slug,
                name: p.name,
                price_inr: p.price_inr,
                compare_at_price_inr: p.compare_at_price_inr,
                imageUrl: p.product_images?.[0]?.url ?? "/images/product-1.jpg",
                categoryName: p.category?.name,
              }}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-secondary/40">
        <div className="container-page grid gap-8 py-16 md:grid-cols-3 md:py-24">
          {[
            { t: "Made in small runs", d: "No overproduction. Every pair is stitched to order in workshops we know by name." },
            { t: "Full-grain leather", d: "Sourced from tanneries certified by the Leather Working Group." },
            { t: "Free shipping in India", d: "Two-day delivery to metros. 14-day exchanges, no questions asked." },
          ].map((b) => (
            <div key={b.t}>
              <div className="font-display text-2xl">{b.t}</div>
              <p className="mt-3 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
