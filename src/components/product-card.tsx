import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { formatInr } from "@/lib/format";
import { useWishlist } from "@/lib/wishlist";
import { useAuth } from "@/lib/use-auth";

export interface ProductCardData {
  productId?: string;
  slug: string;
  name: string;
  price_inr: number;
  compare_at_price_inr: number | null;
  imageUrl: string;
  images?: string[];
  categoryName?: string | null;
  membersOnly?: boolean;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const images = (p.images && p.images.length > 0 ? p.images : [p.imageUrl]).filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [hovering, setHovering] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchMoved = useRef(false);
  const { user } = useAuth();
  const { isInWishlist, toggle } = useWishlist();
  const liked = isInWishlist(p.productId ?? p.slug);

  const onEnter = () => setHovering(true);
  const onLeave = () => {
    setHovering(false);
    setIdx(0);
  };

  // Preload neighbouring images so the next angle appears instantly.
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
    setIdx((n) => (n + dir + images.length) % images.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchMoved.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) touchMoved.current = true;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    const dy = (e.changedTouches[0]?.clientY ?? (touchStartY.current ?? 0)) - (touchStartY.current ?? 0);
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
      swipeTo(dx < 0 ? 1 : -1);
    }
  };
  const onClickCapture = (e: React.MouseEvent) => {
    // Prevent navigating to the product when the tap was actually a swipe.
    if (touchMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      touchMoved.current = false;
    }
  };

  const onHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      // Let the link handle navigation to auth if needed; otherwise just toggle.
      return;
    }
    toggle(p.productId ?? p.slug);
  };

  return (
    <Link
      to="/product/$slug"
      params={{ slug: p.slug }}
      className="group block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClickCapture={onClickCapture}
    >
      <div
        className="relative aspect-square overflow-hidden rounded-sm bg-secondary/60 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={p.name}
            width={1000}
            height={1000}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
              i === idx ? "opacity-100 scale-100 group-hover:scale-[1.03]" : "opacity-0"
            }`}
          />
        ))}
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 opacity-100 md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIdx(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-6 bg-primary" : "w-1.5 bg-primary/40"
                }`}
              />
            ))}
          </div>
        )}
        <HoverCycler enabled={hovering} length={images.length} onTick={setIdx} />
        {p.membersOnly && (
          <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-3 py-1 text-[10px] uppercase tracking-widest text-primary-foreground">
            Members
          </span>
        )}
        <button
          type="button"
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          onClick={onHeartClick}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition-all ${
            liked
              ? "bg-primary text-primary-foreground"
              : "bg-background/80 text-foreground opacity-0 backdrop-blur-sm group-hover:opacity-100"
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          {p.categoryName && <div className="eyebrow">{p.categoryName}</div>}
          <div className="mt-1 font-display text-lg leading-tight">{p.name}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{formatInr(p.price_inr)}</div>
          {p.compare_at_price_inr && p.compare_at_price_inr > p.price_inr && (
            <div className="text-xs text-muted-foreground line-through">
              {formatInr(p.compare_at_price_inr)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function HoverCycler({
  enabled,
  length,
  onTick,
}: {
  enabled: boolean;
  length: number;
  onTick: (updater: (n: number) => number) => void;
}) {
  useEffect(() => {
    if (!enabled || length <= 1) return;
    const id = window.setInterval(() => {
      onTick((n: number) => (n + 1) % length);
    }, 900);
    return () => window.clearInterval(id);
  }, [enabled, length, onTick]);
  return null;
}