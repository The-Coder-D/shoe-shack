import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatInr } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Marché` },
      { property: "og:title", content: `${params.slug.replace(/-/g, " ")} — Marché` },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const cart = useCart();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [size, setSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, description, price_inr, compare_at_price_inr, category:categories(name), product_images(url, sort_order), product_variants(size, stock)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading || !data) {
    return <div className="container-page py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  const images = (data.product_images ?? [])
    .slice()
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((img: any) => img.url);
  if (images.length === 0) images.push("/images/product-1.jpg");
  const image = images[Math.min(activeImage, images.length - 1)];
  const sizes = (data.product_variants ?? []).sort((a: any, b: any) => a.size.localeCompare(b.size));

  const onAdd = () => {
    if (!authLoading && !user) {
      toast.message("Sign in to add to bag", { description: "Create a free account to save your bag and orders." });
      navigate({ to: "/auth", search: { redirect: `/product/${slug}` } as any });
      return;
    }
    if (!size) return toast.error("Choose a size first");
    cart.add({
      productId: data.id,
      slug: data.slug,
      name: data.name,
      imageUrl: image,
      size,
      unitPriceInr: data.price_inr,
      qty: 1,
    });
    toast.success(`${data.name} added to bag`);
  };

  const onBuyNow = () => {
    if (!authLoading && !user) {
      toast.message("Sign in to continue", { description: "You need an account to check out." });
      navigate({ to: "/auth", search: { redirect: `/product/${slug}` } as any });
      return;
    }
    if (!size) return toast.error("Choose a size first");
    cart.add({
      productId: data.id,
      slug: data.slug,
      name: data.name,
      imageUrl: image,
      size,
      unitPriceInr: data.price_inr,
      qty: 1,
    });
    navigate({ to: "/checkout" });
  };

  return (
    <div className="container-page py-8 md:py-14">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-sm bg-secondary">
            <img src={image} alt={data.name} width={1000} height={1000} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {images.map((url, i) => (
                <button
                  key={url + i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square overflow-hidden rounded-sm bg-secondary transition-opacity ${
                    i === activeImage ? "opacity-100 ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Show photo ${i + 1}`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="md:pt-8">
          {data.category && <div className="eyebrow">{(data.category as any).name}</div>}
          <h1 className="mt-3 font-display text-4xl md:text-5xl">{data.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <div className="text-xl font-medium">{formatInr(data.price_inr)}</div>
            {data.compare_at_price_inr && data.compare_at_price_inr > data.price_inr && (
              <div className="text-sm text-muted-foreground line-through">
                {formatInr(data.compare_at_price_inr)}
              </div>
            )}
          </div>
          {data.description && <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{data.description}</p>}

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <div className="eyebrow">Size (UK)</div>
              <button className="text-xs underline underline-offset-4">Size guide</button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {sizes.map((s: any) => {
                const outOfStock = s.stock <= 0;
                const selected = size === s.size;
                return (
                  <button
                    key={s.size}
                    disabled={outOfStock}
                    onClick={() => setSize(s.size)}
                    className={`rounded-sm border px-3 py-3 text-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : outOfStock
                          ? "cursor-not-allowed border-border/50 text-muted-foreground line-through"
                          : "border-border hover:border-primary"
                    }`}
                  >
                    {s.size.replace("UK ", "")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={onAdd}
              className="w-full rounded-full border border-primary py-4 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Add to bag
            </button>
            <button
              onClick={onBuyNow}
              className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Buy now
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border/60 pt-6 text-xs text-muted-foreground">
            <div><div className="font-medium text-foreground">Free shipping</div>All India, 2–4 days</div>
            <div><div className="font-medium text-foreground">14-day returns</div>Try them on at home</div>
          </div>
        </div>
      </div>
    </div>
  );
}
