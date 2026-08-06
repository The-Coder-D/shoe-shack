import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ProductCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.07 }}
    >
      <div className="skeleton aspect-square w-full rounded-sm" />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="skeleton h-2.5 w-16 rounded-full" />
          <div className="skeleton mt-3 h-4 w-3/4 rounded-sm" />
        </div>
        <div className="skeleton h-3.5 w-14 rounded-sm" />
      </div>
    </motion.div>
  );
}

export function ProductGridSkeleton({
  count = 4,
  className = "mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
