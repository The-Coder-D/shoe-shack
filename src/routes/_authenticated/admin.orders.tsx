import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatInr } from "@/lib/format";
import { toast } from "sonner";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_inr, created_at, shipping_address, order_items(name, size, qty)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <div className="space-y-4">
      {(data ?? []).map((o: any) => (
        <div key={o.id} className="rounded-sm border border-border/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium">Order #{o.id.slice(0, 8)}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString("en-IN")} · {o.order_items?.length ?? 0} items
              </div>
              {o.shipping_address && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {o.shipping_address.full_name}, {o.shipping_address.city}, {o.shipping_address.pincode}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium">{formatInr(o.total_inr)}</span>
              <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                className="rounded-sm border border-border bg-background px-3 py-2 text-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
      {data && data.length === 0 && (
        <div className="rounded-sm border border-border/60 p-10 text-center text-sm text-muted-foreground">No orders yet.</div>
      )}
    </div>
  );
}