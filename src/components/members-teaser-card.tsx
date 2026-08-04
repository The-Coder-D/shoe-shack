import { useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { motion } from "motion/react";

export interface MembersTeaserData {
  slug: string;
  name: string;
  imageUrl: string;
  categoryName?: string | null;
}

export function MembersTeaserCard({ p }: { p: MembersTeaserData }) {
  const navigate = useNavigate();
  return (
    <motion.button
      type="button"
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      onClick={() => navigate({ to: "/auth", search: { next: `/shop` } as any })}
      className="group block w-full text-left will-change-transform"
    >
      <div className="relative aspect-square overflow-hidden rounded-sm bg-secondary/60">
        <img
          src={p.imageUrl}
          alt={p.name}
          width={1000}
          height={1000}
          loading="lazy"
          className="h-full w-full scale-[1.04] object-cover opacity-50 blur-[14px] saturate-50 transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:blur-[10px] group-hover:opacity-60"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50 p-4 text-center backdrop-blur-[2px] transition-colors duration-500 group-hover:bg-background/40">
          <motion.span
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
            initial={false}
            whileHover={{ rotate: -8 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Lock className="h-5 w-5 transition-transform duration-500 group-hover:scale-110" />
          </motion.span>
          <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest">
            Members only
          </span>
          <span className="link-sweep text-xs">Sign in to unlock</span>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          {p.categoryName && <div className="eyebrow">{p.categoryName}</div>}
          <div className="mt-1 font-display text-lg leading-tight">
            <span className="link-sweep">{p.name}</span>
          </div>
        </div>
        <div className="text-right text-xs uppercase tracking-widest text-muted-foreground transition-transform duration-500 group-hover:-translate-y-0.5">
          Locked
        </div>
      </div>
    </motion.button>
  );
}
