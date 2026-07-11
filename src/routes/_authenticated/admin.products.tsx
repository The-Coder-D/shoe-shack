import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatInr } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, price_inr, is_active, is_featured, category:categories(name), product_images(url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{data?.length ?? 0} products</div>
        <Link to="/admin/products/new" className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">Add product</Link>
      </div>
      <div className="divide-y divide-border/60 border-y border-border/60">
        {(data ?? []).map((p: any) => (
          <div key={p.id} className="flex items-center gap-4 py-4">
            <img src={p.product_images?.[0]?.url ?? "/images/product-1.jpg"} alt={p.name} className="h-14 w-14 rounded-sm object-cover" />
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.category?.name} · {p.is_active ? "Active" : "Draft"}{p.is_featured ? " · Featured" : ""}</div>
            </div>
            <div className="text-sm">{formatInr(p.price_inr)}</div>
            <Link to="/admin/products/$id" params={{ id: p.id }} className="text-sm underline underline-offset-4">Edit</Link>
            <button onClick={() => del(p.id)} className="text-sm text-destructive underline underline-offset-4">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}