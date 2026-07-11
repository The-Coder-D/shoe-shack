import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatInr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account/orders")({
  head: () => ({ meta: [{ title: "Orders — Marché" }] }),
  component: Orders,
});

function Orders() {
  const { data } = useQuery({
    queryKey: ["orders-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_inr, created_at, shipping_address, order_items(name, size, qty, unit_price_inr, image_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="container-page py-12 md:py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Orders</h1>
        <Link to="/account" className="text-sm underline underline-offset-4">Back to account</Link>
      </div>
      <div className="mt-10 space-y-6">
        {(data ?? []).map((o: any) => (
          <div key={o.id} className="rounded-sm border border-border/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <div className="font-medium">Order #{o.id.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")}</div>
              </div>
              <div className="flex items-center gap-6">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">{o.status}</span>
                <span className="font-medium">{formatInr(o.total_inr)}</span>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {o.order_items?.map((it: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4">
                  {it.image_url && <img src={it.image_url} alt={it.name} className="h-14 w-14 rounded-sm object-cover" />}
                  <div className="flex-1 text-sm">
                    <div>{it.name}</div>
                    <div className="text-xs text-muted-foreground">Size {it.size} · Qty {it.qty}</div>
                  </div>
                  <div className="text-sm">{formatInr(it.qty * it.unit_price_inr)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {data && data.length === 0 && (
          <div className="rounded-sm border border-border/60 p-10 text-center text-sm text-muted-foreground">No orders yet.</div>
        )}
      </div>
    </div>
  );
}