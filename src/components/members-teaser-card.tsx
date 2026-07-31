import { Link, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";

export interface MembersTeaserData {
  slug: string;
  name: string;
  imageUrl: string;
  categoryName?: string | null;
}

export function MembersTeaserCard({ p }: { p: MembersTeaserData }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate({ to: "/auth", search: { next: `/shop` } as any })}
      className="group block w-full text-left"
    >
      <div className="relative aspect-square overflow-hidden rounded-sm bg-secondary/60">
        <img
          src={p.imageUrl}
          alt={p.name}
          width={1000}
          height={1000}
          loading="lazy"
          className="h-full w-full object-cover opacity-60 blur-[2px] transition-all duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/30 p-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
            <Lock className="h-3 w-3" /> Members only
          </span>
          <span className="text-xs underline underline-offset-4">Sign in to unlock</span>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          {p.categoryName && <div className="eyebrow">{p.categoryName}</div>}
          <div className="mt-1 font-display text-lg leading-tight">{p.name}</div>
        </div>
      </div>
    </button>
  );
}
