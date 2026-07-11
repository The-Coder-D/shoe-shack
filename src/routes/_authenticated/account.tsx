import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatInr } from "@/lib/format";
import { useAuth } from "@/lib/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — Vortex" }] }),
  component: Account,
});

function Account() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: orders } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_inr, created_at, order_items(name, qty, size)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="container-page py-12 md:py-16">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Account</div>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Hello{user?.email ? `, ${user.email.split("@")[0]}` : ""}.</h1>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && <Link to="/admin" className="text-sm underline underline-offset-4">Admin</Link>}
          <button onClick={signOut} className="text-sm underline underline-offset-4">Sign out</button>
        </div>
      </div>

      <div className="mt-10">
        <div className="font-display text-2xl">Recent orders</div>
        {orders && orders.length === 0 && (
          <div className="mt-6 rounded-sm border border-border/60 p-10 text-center text-sm text-muted-foreground">
            No orders yet. <Link to="/shop" className="underline underline-offset-4">Start shopping</Link>
          </div>
        )}
        <div className="mt-6 divide-y divide-border/60 border-y border-border/60">
          {(orders ?? []).map((o: any) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div>
                <div className="font-medium">Order #{o.id.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {o.order_items?.length ?? 0} item(s)
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">{o.status}</span>
                <span className="text-sm font-medium">{formatInr(o.total_inr)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}