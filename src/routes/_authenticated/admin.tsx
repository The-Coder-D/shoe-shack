import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const user = (context as any).user;
    if (!user) throw redirect({ to: "/auth" });
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) throw redirect({ to: "/account" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { to: "/admin", label: "Overview" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/orders", label: "Orders" },
  ];
  return (
    <div className="container-page py-12 md:py-16">
      <div className="flex items-end justify-between border-b border-border/60 pb-6">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="mt-3 font-display text-4xl">Dashboard</h1>
        </div>
        <nav className="flex gap-6 text-sm">
          {tabs.map((t) => (
            <Link key={t.to} to={t.to}
              className={path === t.to ? "text-foreground underline underline-offset-8" : "text-muted-foreground"}>
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-10">
        <Outlet />
      </div>
    </div>
  );
}