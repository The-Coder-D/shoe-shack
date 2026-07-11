import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { CheckCircle2 } from "lucide-react";

const search = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/order/success")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Order confirmed — Marché" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { id } = useSearch({ from: "/order/success" });
  const cart = useCart();
  useEffect(() => { cart.clear(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <CheckCircle2 className="mx-auto h-14 w-14 text-accent" />
        <h1 className="mt-6 font-display text-4xl">Order confirmed.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Thank you for shopping Marché. A receipt is on its way.
        </p>
        {id && <p className="mt-2 text-xs text-muted-foreground">Order #{id.slice(0, 8)}</p>}
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/account/orders" className="rounded-full border border-primary px-6 py-3 text-sm">View orders</Link>
          <Link to="/shop" className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}