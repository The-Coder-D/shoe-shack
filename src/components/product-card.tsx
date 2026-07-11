import { Link } from "@tanstack/react-router";
import { formatInr } from "@/lib/format";

export interface ProductCardData {
  slug: string;
  name: string;
  price_inr: number;
  compare_at_price_inr: number | null;
  imageUrl: string;
  categoryName?: string | null;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  return (
    <Link
      to="/product/$slug"
      params={{ slug: p.slug }}
      className="group block"
    >
      <div className="aspect-square overflow-hidden rounded-sm bg-secondary/60">
        <img
          src={p.imageUrl}
          alt={p.name}
          width={1000}
          height={1000}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
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