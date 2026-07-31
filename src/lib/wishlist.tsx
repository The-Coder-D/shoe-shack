import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

interface WishlistItem {
  product_id: string;
  products: {
    slug: string;
    name: string;
    price_inr: number;
    compare_at_price_inr: number | null;
    members_only: boolean;
    product_images: { url: string; sort_order: number }[];
    category: { name: string } | null;
  };
}

interface WishlistCtx {
  items: WishlistItem[];
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggle: (productId: string) => void;
}

const Ctx = createContext<WishlistCtx | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("product_id, products(slug, name, price_inr, compare_at_price_inr, members_only, product_images(url, sort_order), category:categories(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as WishlistItem[];
    },
    enabled: !!user,
  });

  const add = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from("wishlists").insert({ product_id: productId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist", user?.id] });
      toast.success("Saved to wishlist");
    },
  });

  const remove = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from("wishlists").delete().eq("product_id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist", user?.id] });
      toast.success("Removed from wishlist");
    },
  });

  const ids = useMemo(() => new Set((data ?? []).map((i) => i.product_id)), [data]);

  const value = useMemo<WishlistCtx>(
    () => ({
      items: data ?? [],
      isLoading,
      isInWishlist: (id) => ids.has(id),
      toggle: (id) => {
        if (!user) return;
        if (ids.has(id)) remove.mutate(id);
        else add.mutate(id);
      },
    }),
    [data, isLoading, ids, user, add, remove],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist(): WishlistCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWishlist must be inside WishlistProvider");
  return v;
}
