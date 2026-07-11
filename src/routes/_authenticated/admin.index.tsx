import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatInr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [p, o] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total_inr, status"),
      ]);
      const orders = o.data ?? [];
      return {
        productCount: p.count ?? 0,
        orderCount: orders.length,
        revenue: orders.filter((x: any) => x.status !== "cancelled").reduce((n: number, x: any) => n + x.total_inr, 0),
      };
    },
  });

  const stats = [
    { label: "Products", value: data?.productCount ?? 0 },
    { label: "Orders", value: data?.orderCount ?? 0 },
    { label: "Revenue", value: formatInr(data?.revenue ?? 0) },
  ];

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-sm border border-border/60 p-6">
            <div className="eyebrow">{s.label}</div>
            <div className="mt-3 font-display text-3xl">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex gap-3">
        <Link to="/admin/products/new" className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Add product</Link>
        <Link to="/admin/orders" className="rounded-full border border-primary px-6 py-3 text-sm">View orders</Link>
      </div>
    </div>
  );
}