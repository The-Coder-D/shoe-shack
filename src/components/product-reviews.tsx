import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Star } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { StarRating } from "./star-rating";
import { AnimatedContent, CountUp, SplitText } from "./animate";

const EASE = [0.16, 1, 0.3, 1] as const;

export function useProductRating(productId?: string) {
  return useQuery({
    queryKey: ["product-rating", productId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_product_rating", { _product_id: productId! });
      if (error) throw error;
      const row = (data as any)?.[0];
      return { avg: Number(row?.avg_rating ?? 0), count: Number(row?.review_count ?? 0) };
    },
    enabled: !!productId,
  });
}

export function ProductReviews({ productId, slug }: { productId: string; slug: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const { data: summary } = useProductRating(productId);

  const { data: reviews } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, title, comment, created_at, user_id")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: purchased } = useQuery({
    queryKey: ["purchased", productId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_purchased_product", { _product_id: productId });
      if (error) throw error;
      return Boolean(data);
    },
    enabled: !!user,
  });

  const mine = (reviews ?? []).find((r: any) => r.user_id === user?.id);

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const payload = {
        product_id: productId,
        user_id: user.id,
        rating,
        title: title.trim() || null,
        comment: comment.trim() || null,
      };
      const { error } = mine
        ? await supabase.from("reviews").update(payload).eq("id", mine.id)
        : await supabase.from("reviews").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
      qc.invalidateQueries({ queryKey: ["product-rating", productId] });
      setOpen(false);
      setTitle("");
      setComment("");
      setRating(0);
      toast.success("Thanks — your review is live");
    },
    onError: (e: any) => toast.error(e.message ?? "Could not save your review"),
  });

  const startWriting = () => {
    if (!user) {
      toast.message("Sign in to write a review");
      navigate({ to: "/auth", search: { redirect: `/product/${slug}` } as any });
      return;
    }
    if (!purchased) {
      toast.message("Reviews are for verified buyers", {
        description: "Once your order is placed you can share your fit and comfort notes.",
      });
      return;
    }
    if (mine) {
      setRating(mine.rating);
      setTitle(mine.title ?? "");
      setComment(mine.comment ?? "");
    }
    setOpen((o) => !o);
  };

  return (
    <section className="mt-20 border-t border-border/60 py-16 md:py-24">
      <div className="grid gap-10 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-16">
        <AnimatedContent>
          <div className="eyebrow">Reviews</div>
          <SplitText as="h2" text="What wearers say." className="mt-3 font-display text-3xl md:text-4xl" />
          <div className="mt-6 flex items-end gap-3">
            <div className="font-display text-5xl leading-none">{(summary?.avg ?? 0).toFixed(1)}</div>
            <div className="pb-1">
              <StarRating value={summary?.avg ?? 0} size={16} />
              <div className="mt-1 text-xs text-muted-foreground">
                <CountUp to={summary?.count ?? 0} /> review{(summary?.count ?? 0) === 1 ? "" : "s"}
              </div>
            </div>
          </div>
          <button
            onClick={startWriting}
            className="press mt-6 rounded-full border border-primary px-6 py-3 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {mine ? "Edit your review" : "Write a review"}
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="overflow-hidden"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (rating < 1) return toast.error("Pick a star rating");
                  submit.mutate();
                }}
              >
                <div className="mt-6 space-y-4 rounded-sm border border-border bg-card p-5">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`${i} star`}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(i)}
                        className="p-1 transition-transform duration-200 hover:scale-125"
                      >
                        <Star
                          className={`h-5 w-5 transition-colors ${
                            (hover || rating) >= i ? "fill-accent text-accent" : "text-border"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Headline (optional)"
                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="How is the fit, comfort and finish?"
                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={submit.isPending}
                    className="press w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {submit.isPending ? "Saving…" : "Post review"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </AnimatedContent>

        <div>
          {(reviews ?? []).length === 0 ? (
            <AnimatedContent className="rounded-sm border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No reviews yet — verified buyers can be the first to share their fit notes.
            </AnimatedContent>
          ) : (
            <ul className="divide-y divide-border/60">
              {(reviews ?? []).map((r: any, i: number) => (
                <AnimatedContent key={r.id} delay={i * 0.06}>
                  <li className="py-6">
                    <div className="flex items-center justify-between gap-4">
                      <StarRating value={r.rating} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {r.title && <div className="mt-3 font-display text-lg leading-tight">{r.title}</div>}
                    {r.comment && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>}
                    <div className="mt-3 text-[10px] uppercase tracking-widest text-accent">Verified buyer</div>
                  </li>
                </AnimatedContent>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}