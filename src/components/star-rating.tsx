import { Star } from "lucide-react";

export function StarRating({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className ?? ""}`} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i - 0.25;
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={`transition-colors duration-300 ${filled ? "fill-accent text-accent" : "text-border"}`}
          />
        );
      })}
    </span>
  );
}