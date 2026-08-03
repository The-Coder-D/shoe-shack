import { useCallback, useEffect, useState } from "react";

const KEY = "marche_recently_viewed";
const MAX = 12;

export function useRecentlyViewed() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSlugs(JSON.parse(raw));
    } catch {}
  }, []);

  const record = useCallback((slug: string) => {
    setSlugs((prev) => {
      if (prev[0] === slug) return prev;
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { slugs, record };
}
