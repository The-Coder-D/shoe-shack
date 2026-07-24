import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props { productId?: string }

export function ProductForm({ productId }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    slug: "", name: "", description: "", price_inr: 0, compare_at_price_inr: 0,
    category_id: "", is_active: true, is_featured: false, image_urls: "",
  });

  const { data: categories } = useQuery({
    queryKey: ["cats"],
    queryFn: async () => (await supabase.from("categories").select("id, name").order("sort_order")).data ?? [],
  });

  useEffect(() => {
    if (!productId) return;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(url, sort_order)")
        .eq("id", productId)
        .maybeSingle();
      if (data) {
        const orderedUrls = ((data as any).product_images ?? [])
          .slice()
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((img: any) => img.url);
        setForm({
          slug: data.slug,
          name: data.name,
          description: data.description ?? "",
          price_inr: data.price_inr,
          compare_at_price_inr: data.compare_at_price_inr ?? 0,
          category_id: data.category_id ?? "",
          is_active: data.is_active,
          is_featured: data.is_featured,
          image_urls: orderedUrls.join("\n"),
        });
      }
    })();
  }, [productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        slug: form.slug,
        name: form.name,
        description: form.description,
        price_inr: Number(form.price_inr),
        compare_at_price_inr: form.compare_at_price_inr ? Number(form.compare_at_price_inr) : null,
        category_id: form.category_id || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
      };

      let pid = productId;
      if (productId) {
        const { error } = await supabase.from("products").update(payload).eq("id", productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        pid = data.id;
      }

      const urls = form.image_urls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);

      if (urls.length) {
        // Replace all images with the new ordered set (first = main photo)
        await supabase.from("product_images").delete().eq("product_id", pid!);
        await supabase.from("product_images").insert(
          urls.map((url, i) => ({ product_id: pid!, url, sort_order: i })),
        );
      }

      if (!productId) {
        // Seed default sizes
        await supabase.from("product_variants").insert(
          ["UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"].map((size) => ({ product_id: pid!, size, stock: 10 })),
        );
      }

      toast.success(productId ? "Product updated" : "Product created");
      navigate({ to: "/admin/products" });
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none";

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4">
      <h2 className="font-display text-2xl">{productId ? "Edit product" : "New product"}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2"><span className="eyebrow">Name</span><input required className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="space-y-2"><span className="eyebrow">Slug</span><input required className={inp} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
      </div>
      <label className="block space-y-2"><span className="eyebrow">Description</span><textarea className={inp} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2"><span className="eyebrow">Price ₹</span><input required type="number" className={inp} value={form.price_inr} onChange={(e) => setForm({ ...form, price_inr: e.target.valueAsNumber })} /></label>
        <label className="space-y-2"><span className="eyebrow">Compare price ₹</span><input type="number" className={inp} value={form.compare_at_price_inr} onChange={(e) => setForm({ ...form, compare_at_price_inr: e.target.valueAsNumber })} /></label>
        <label className="space-y-2">
          <span className="eyebrow">Category</span>
          <select className={inp} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">—</option>
            {(categories ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>
      <label className="block space-y-2">
        <span className="eyebrow">Image URLs (one per line — first one is the main photo)</span>
        <textarea
          className={inp}
          rows={5}
          placeholder={"https://…/front.jpg\nhttps://…/side.jpg\nhttps://…/back.jpg\nhttps://…/sole.jpg"}
          value={form.image_urls}
          onChange={(e) => setForm({ ...form, image_urls: e.target.value })}
        />
      </label>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured</label>
      </div>
      <button disabled={loading} className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground disabled:opacity-60">
        {loading ? "Saving…" : productId ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
