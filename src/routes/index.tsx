import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";
import { ArrowRight } from "lucide-react";
import floatingShoe from "@/assets/floating-shoe.png";
import { AnimatedContent, CountUp, Magnetic, ShinyText, SplitText, StaggerGrid, StaggerItem, TiltCard } from "@/components/animate";

const WALKING_VIDEO_SRC = "/videos/walking-hero.mp4";
const WALKING_VIDEO_POSTER = "/images/walking-hero-poster.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Marché — Premium minimal sneakers, boots & formal shoes" },
      {
        name: "description",
        content:
          "Marché makes considered footwear in small runs: cream leather sneakers, chukka boots and derbies. Free shipping across India, 14-day exchanges.",
      },
      { property: "og:title", content: "Marché — Premium minimal sneakers, boots & formal shoes" },
      { property: "og:description", content: "Considered footwear made in small runs. Designed in Bengaluru, shipped free across India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const { scrollY } = useScroll();
  const shoeY1 = useTransform(scrollY, [0, 600], [0, -140]);
  const shoeY2 = useTransform(scrollY, [0, 600], [0, 90]);
  const shoeRot1 = useTransform(scrollY, [0, 600], [-8, -2]);
  const shoeRot2 = useTransform(scrollY, [0, 600], [14, 6]);
  const shoeScale = useTransform(scrollY, [0, 600], [1, 1.08]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    const tryPlay = async () => {
      try {
        await el.play();
        setVideoReady(true);
      } catch {
        // Autoplay blocked — poster stays visible; retry on first user gesture.
        const resume = () => {
          el.play().then(() => setVideoReady(true)).catch(() => {});
          window.removeEventListener("pointerdown", resume);
          window.removeEventListener("touchstart", resume);
        };
        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("touchstart", resume, { once: true });
      }
    };
    if (el.readyState >= 2) tryPlay();
    else el.addEventListener("loadeddata", tryPlay, { once: true });
  }, []);

  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_shop_products");
      if (error) throw error;
      return (data ?? []).slice(0, 4);
    },
  });

  return (
    <div>
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="aurora" aria-hidden="true" />
        <div className="grid-drift" aria-hidden="true" />
        <motion.img
          src={floatingShoe}
          alt=""
          aria-hidden="true"
          style={{ y: shoeY1, rotate: shoeRot1, scale: shoeScale }}
          className="pointer-events-none absolute -right-24 top-1/3 z-0 hidden w-[520px] opacity-[0.10] blur-[1px] md:block will-change-transform"
        />
        <motion.img
          src={floatingShoe}
          alt=""
          aria-hidden="true"
          style={{ y: shoeY2, rotate: shoeRot2 }}
          className="pointer-events-none absolute -left-32 bottom-8 z-0 hidden w-[380px] opacity-[0.07] blur-[1px] md:block will-change-transform"
        />
        <div className="container-page relative z-10 grid gap-10 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-6 md:pt-8">
            <div className="eyebrow">
              <ShinyText>Autumn / Winter 26</ShinyText>
            </div>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] md:text-7xl">
              <SplitText text="Considered" className="block" />
              <SplitText text="footwear," className="block" delay={0.08} />
              <SplitText text="made for" className="block" delay={0.16} />
              <SplitText text="the long walk." className="block text-accent" delay={0.24} />
            </h1>
            <AnimatedContent delay={0.35} className="mt-8 max-w-md text-muted-foreground">
              Premium sneakers, boots and formal shoes — designed in Bengaluru, crafted
              in small runs from full-grain leather and heritage textiles.
            </AnimatedContent>
            <AnimatedContent delay={0.45} className="mt-10 flex flex-wrap items-center gap-4">
              <Magnetic strength={0.2}>
                <Link
                  to="/shop"
                  className="press group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Shop the collection
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <Link to="/about" className="link-sweep text-sm">
                Our story
              </Link>
            </AnimatedContent>
          </div>
          <div className="md:col-span-6">
            <AnimatedContent delay={0.15} y={40}>
              <TiltCard className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
                <img
                  src="/images/hero.jpg"
                  alt="Marché Atlas Low sneaker in cream"
                  width={1600}
                  height={1200}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
                <div className="absolute bottom-6 left-6 rounded-sm bg-background/90 px-4 py-3 backdrop-blur transition-transform duration-700 ease-out group-hover:-translate-y-1">
                  <div className="eyebrow">New</div>
                  <div className="mt-1 font-display text-lg">Atlas Low — Cream</div>
                </div>
              </TiltCard>
            </AnimatedContent>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="aurora opacity-60" aria-hidden="true" />
        <div className="container-page grid gap-10 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-4 md:pt-6">
            <div className="eyebrow opacity-70">In motion</div>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
              <SplitText text="Built for" className="block" />
              <SplitText text="the walk" className="block" delay={0.08} />
              <SplitText text="home." className="block text-accent" delay={0.16} />
            </h2>
            <AnimatedContent delay={0.25} className="mt-6 max-w-sm text-sm opacity-75">
              The Atlas Low, in cream — moving as it was made to. Filmed on the streets of
              Bengaluru at dusk.
            </AnimatedContent>
          </div>
          <div className="md:col-span-8">
            <AnimatedContent y={40} className="relative aspect-video overflow-hidden rounded-sm">
              <video
                ref={videoRef}
                src={WALKING_VIDEO_SRC}
                poster={WALKING_VIDEO_POSTER}
                autoPlay
                muted
                loop
                playsInline
                disablePictureInPicture
                disableRemotePlayback
                preload="metadata"
                aria-label="A person walking in Marché Atlas Low cream sneakers at dusk"
                className={`h-full w-full object-cover transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
              />
              <img
                src={WALKING_VIDEO_POSTER}
                alt=""
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoReady ? "opacity-0" : "opacity-100"}`}
              />
            </AnimatedContent>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <StaggerGrid className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            { label: "Sneakers", to: "/shop/sneakers" },
            { label: "Boots", to: "/shop/boots" },
            { label: "Formal", to: "/shop/formal" },
          ].map((c) => (
            <StaggerItem key={c.to}>
              <Link
                to={c.to}
                className="hover-lift group relative flex aspect-[4/3] items-end overflow-hidden rounded-sm border border-border/60 bg-secondary p-5 transition-colors hover:bg-secondary/70"
              >
                <span className="pointer-events-none absolute inset-0 -translate-y-full bg-primary/5 transition-transform duration-700 ease-out group-hover:translate-y-0" />
                <div className="relative">
                  <div className="eyebrow">Shop</div>
                  <div className="mt-1 font-display text-2xl">
                    <span className="link-sweep text-sheen">{c.label}</span>
                  </div>
                </div>
                <ArrowRight className="absolute right-5 top-5 h-4 w-4 -translate-x-2 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      <section className="container-page py-16 md:py-24">
        <AnimatedContent className="flex items-end justify-between">
          <div className="rule-grow">
            <div className="eyebrow">Featured</div>
            <SplitText as="h2" text="This month." className="mt-3 block font-display text-4xl md:text-5xl" />
          </div>
          <Link to="/shop" className="link-sweep hidden text-sm md:inline">
            View all
          </Link>
        </AnimatedContent>
        <StaggerGrid className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {(featured ?? []).map((p: any) =>
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
      </section>

      <section className="border-y border-border/60 bg-secondary/40">
        <StaggerGrid className="container-page grid gap-8 py-16 md:grid-cols-3 md:py-24">
          {[
            { t: "Made in small runs", d: "No overproduction. Every pair is stitched to order in workshops we know by name.", n: 12, suffix: " workshops" },
            { t: "Full-grain leather", d: "Sourced from tanneries certified by the Leather Working Group.", n: 100, suffix: "% full-grain" },
            { t: "Free shipping in India", d: "Two-day delivery to metros. 14-day exchanges, no questions asked.", n: 14, suffix: "-day exchanges" },
          ].map((b) => (
            <StaggerItem key={b.t}>
              <div className="rule-grow font-display text-2xl text-sheen">{b.t}</div>
              <p className="mt-3 text-sm text-muted-foreground">{b.d}</p>
              <div className="mt-4 text-xs uppercase tracking-widest text-accent">
                <CountUp to={b.n} />
                {b.suffix}
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>
    </div>
  );
}
