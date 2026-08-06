import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Heart, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatInr } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/use-auth";
import { useWishlist } from "@/lib/wishlist";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { ProductCard } from "@/components/product-card";
import { RecentlyViewed } from "@/components/recently-viewed";
import { SizeGuide } from "@/components/size-guide";
import { ProductReviews, useProductRating } from "@/components/product-reviews";
import { StarRating } from "@/components/star-rating";
import { AnimatedContent, Magnetic, SplitText, StaggerGrid, StaggerItem } from "@/components/animate";
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
  const { isInWishlist, toggle } = useWishlist();
  const { record, slugs: recentSlugs } = useRecentlyViewed();
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

  useEffect(() => {
    if (slug) record(slug);
  }, [slug, record]);

  const { data: rating } = useProductRating(data?.id);

  const { data: related } = useQuery({
    queryKey: ["related-products", data?.id, (data?.category as any)?.name],
    queryFn: async () => {
      const categoryName = (data?.category as any)?.name;
      if (!data?.id || !categoryName) return [];
      const { data: rows, error } = await supabase
        .from("products")
        .select("slug, name, price_inr, compare_at_price_inr, members_only, category:categories(name), product_images(url, sort_order)")
        .neq("id", data.id)
        .eq("is_active", true)
        .limit(4);
      if (error) throw error;
      return (rows ?? []).filter((p: any) => (p.category as any)?.name === categoryName).slice(0, 4);
    },
    enabled: !!data,
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
  const totalStock = sizes.reduce((sum: number, s: any) => sum + (s.stock ?? 0), 0);
  const lowStock = totalStock > 0 && totalStock <= 5;
  const liked = isInWishlist(data.id);

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

  const onNotify = async (sizeValue: string) => {
    if (!user) {
      toast.message("Sign in to get notified", { description: "We'll email you when your size is back." });
      navigate({ to: "/auth", search: { redirect: `/product/${slug}` } as any });
      return;
    }
    const { error } = await supabase.from("stock_alerts").insert({ product_id: data.id, size: sizeValue });
    if (error) {
      toast.error("Already subscribed or something went wrong");
      return;
    }
    toast.success("We'll email you when this size is back");
  };

  return (
    <div className="container-page py-8 md:py-14">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <SwipeGallery
            images={images}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
            alt={data.name}
          />
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
          <div className="flex items-start justify-between gap-4">
            <div>
              {data.category && <div className="eyebrow">{(data.category as any).name}</div>}
              <h1 className="mt-3 font-display text-4xl md:text-5xl"><span className="heading-hover"><SplitText text={data.name} by="char" stagger={0.02} /></span></h1>
              {(rating?.count ?? 0) > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <StarRating value={rating!.avg} />
                  <span className="text-xs text-muted-foreground">
                    {rating!.avg.toFixed(1)} · {rating!.count} review{rating!.count === 1 ? "" : "s"}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
              onClick={() => {
                if (!user) {
                  toast.message("Sign in to save favourites");
                  navigate({ to: "/auth", search: { redirect: `/product/${slug}` } as any });
                  return;
                }
                toggle(data.id);
              }}
              className={`press flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-500 hover:scale-110 ${
                liked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary"
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <div className="text-xl font-medium">{formatInr(data.price_inr)}</div>
            {data.compare_at_price_inr && data.compare_at_price_inr > data.price_inr && (
              <div className="text-sm text-muted-foreground line-through">
                {formatInr(data.compare_at_price_inr)}
              </div>
            )}
          </div>
          {data.description && <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{data.description}</p>}

          {lowStock && (
            <div className="mt-6 text-xs font-medium text-amber-600">
              Only a few pairs left — order soon.
            </div>
          )}

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div className="eyebrow">Size (UK)</div>
              <SizeGuide onSelectSize={(uk) => setSize(uk)} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {sizes.map((s: any) => {
                const outOfStock = s.stock <= 0;
                const selected = size === s.size;
                return (
                  <div key={s.size} className="relative">
                    <button
                      disabled={outOfStock}
                      onClick={() => setSize(s.size)}
                      className={`press w-full rounded-sm border px-3 py-3 text-sm transition-all duration-300 ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground scale-[1.04]"
                          : outOfStock
                            ? "cursor-not-allowed border-border/50 text-muted-foreground line-through"
                            : "border-border hover:border-primary hover:-translate-y-0.5"
                      }`}
                    >
                      {s.size.replace("UK ", "")}
                    </button>
                    {outOfStock && (
                      <button
                        type="button"
                        onClick={() => onNotify(s.size)}
                        aria-label={`Notify when size ${s.size} is back`}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground shadow-sm"
                      >
                        <Bell className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Magnetic strength={0.12}>
              <button
                onClick={onAdd}
                className="press w-full rounded-full border border-primary py-4 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Add to bag
              </button>
            </Magnetic>
            <Magnetic strength={0.12}>
              <button
                onClick={onBuyNow}
                className="press w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Buy now
              </button>
            </Magnetic>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border/60 pt-6 text-xs text-muted-foreground">
            <div><div className="font-medium text-foreground">Free shipping</div>All India, 2–4 days</div>
            <div><div className="font-medium text-foreground">14-day returns</div>Try them on at home</div>
          </div>
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-20 border-t border-border/60 py-16 md:py-24">
          <AnimatedContent>
            <div className="eyebrow">You may also like</div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl"><span className="heading-hover"><SplitText text="Complete the look." /></span></h2>
          </AnimatedContent>
          <StaggerGrid className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-10 lg:grid-cols-4">
            {related.map((p: any) => (
              <StaggerItem key={p.slug}>
                <ProductCard
                  p={{
                  productId: p.id,
                  slug: p.slug,
                  name: p.name,
                  price_inr: p.price_inr,
                  compare_at_price_inr: p.compare_at_price_inr,
                  imageUrl: p.product_images?.[0]?.url ?? "/images/product-1.jpg",
                  images: (p.product_images ?? [])
                    .slice()
                    .sort((a: any, b: any) => a.sort_order - b.sort_order)
                    .map((im: any) => im.url),
                  categoryName: (p.category as any)?.name,
                  membersOnly: p.members_only,
                  }}
                />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}

      <ProductReviews productId={data.id} slug={slug} />

      <RecentlyViewed slugs={recentSlugs} />

      {/* Sticky mobile add-to-cart bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs text-muted-foreground">{data.name}</div>
            <div className="text-sm font-medium">{formatInr(data.price_inr)}</div>
          </div>
          <select
            value={size ?? ""}
            onChange={(e) => setSize(e.target.value || null)}
            aria-label="Choose size"
            className="rounded-full border border-input bg-background px-3 py-2.5 text-xs outline-none"
          >
            <option value="">Size</option>
            {sizes
              .filter((s: any) => s.stock > 0)
              .map((s: any) => (
                <option key={s.size} value={s.size}>
                  {s.size.replace("UK ", "UK ")}
                </option>
              ))}
          </select>
          <button
            onClick={onAdd}
            className="press rounded-full bg-primary px-5 py-3 text-xs font-medium text-primary-foreground"
          >
            Add to bag
          </button>
        </div>
      </div>
      <div className="h-20 md:hidden" />
    </div>
  );
}

function SwipeGallery({
  images,
  activeImage,
  setActiveImage,
  alt,
}: {
  images: string[];
  activeImage: number;
  setActiveImage: (n: number) => void;
  alt: string;
}) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const idx = Math.min(activeImage, images.length - 1);

  // Preload next / previous images so swipes feel instant.
  useEffect(() => {
    if (typeof window === "undefined" || images.length <= 1) return;
    const next = (idx + 1) % images.length;
    const prev = (idx - 1 + images.length) % images.length;
    [next, prev].forEach((i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = images[i];
    });
  }, [idx, images]);

  const swipeTo = (dir: 1 | -1) => {
    if (images.length <= 1) return;
    setActiveImage((idx + dir + images.length) % images.length);
  };

  return (
    <div
      className="relative aspect-square overflow-hidden rounded-sm bg-secondary touch-pan-y select-none"
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX;
        startY.current = e.touches[0].clientY;
      }}
      onTouchEnd={(e) => {
        if (startX.current == null || startY.current == null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        const dy = e.changedTouches[0].clientY - startY.current;
        startX.current = null;
        startY.current = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          swipeTo(dx < 0 ? 1 : -1);
        }
      }}
    >
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={alt}
          width={1000}
          height={1000}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-6 bg-primary" : "w-1.5 bg-primary/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
