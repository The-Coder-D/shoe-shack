import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatInr } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your bag — Marché" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const shipping = cart.subtotalInr > 0 ? 0 : 0;
  const total = cart.subtotalInr + shipping;

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl">Your bag</h1>

      {cart.items.length === 0 ? (
        <div className="mt-16 border-y border-border/60 py-24 text-center">
          <p className="text-muted-foreground">Your bag is empty.</p>
          <Link to="/shop" className="mt-6 inline-block text-sm underline underline-offset-4">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 md:grid-cols-3">
          <div className="divide-y divide-border/60 md:col-span-2">
            {cart.items.map((it) => (
              <div key={`${it.productId}-${it.size}`} className="flex gap-4 py-6">
                <img src={it.imageUrl} alt={it.name} className="h-28 w-28 rounded-sm object-cover" width={200} height={200} loading="lazy" />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display text-lg">{it.name}</div>
                      <div className="text-xs text-muted-foreground">Size {it.size}</div>
                    </div>
                    <button
                      aria-label="Remove"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => cart.remove(it.productId, it.size)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button className="p-2" onClick={() => cart.update(it.productId, it.size, it.qty - 1)}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{it.qty}</span>
                      <button className="p-2" onClick={() => cart.update(it.productId, it.size, it.qty + 1)}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-sm font-medium">{formatInr(it.qty * it.unitPriceInr)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-sm border border-border/60 bg-secondary/40 p-6">
            <div className="font-display text-2xl">Summary</div>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatInr(cart.subtotalInr)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
              <div className="mt-4 flex justify-between border-t border-border/60 pt-4 text-base font-medium"><span>Total</span><span>{formatInr(total)}</span></div>
            </div>
            <button
              onClick={() => navigate({ to: "/checkout" })}
              className="mt-6 w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Checkout
            </button>
            <Link to="/shop" className="mt-4 block text-center text-xs text-muted-foreground underline underline-offset-4">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}