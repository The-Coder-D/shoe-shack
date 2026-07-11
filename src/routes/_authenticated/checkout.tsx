import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { formatInr } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Vortex" }] }),
  component: Checkout,
});

function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const subtotal = cart.subtotalInr;
  const shipping = 0;
  const total = subtotal + shipping;

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) return toast.error("Your bag is empty");
    setSubmitting(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user!.id;

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: uid,
          status: "paid", // NOTE: Stripe wiring can flip this to 'pending' when enabled
          subtotal_inr: subtotal,
          shipping_inr: shipping,
          total_inr: total,
          shipping_address: form,
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: iErr } = await supabase.from("order_items").insert(
        cart.items.map((i) => ({
          order_id: order.id,
          product_id: i.productId,
          name: i.name,
          image_url: i.imageUrl,
          size: i.size,
          qty: i.qty,
          unit_price_inr: i.unitPriceInr,
        })),
      );
      if (iErr) throw iErr;

      navigate({ to: "/order/success", search: { id: order.id } });
    } catch (err: any) {
      toast.error(err.message ?? "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container-page py-24 text-center text-sm text-muted-foreground">
        Your bag is empty.
      </div>
    );
  }

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl">Checkout</h1>

      <div className="mt-10 grid gap-12 md:grid-cols-3">
        <form onSubmit={placeOrder} className="space-y-4 md:col-span-2">
          <div className="eyebrow">Shipping address</div>
          <div className="grid gap-4 md:grid-cols-2">
            <input required placeholder="Full name" className="input" value={form.full_name} onChange={set("full_name")} />
            <input required placeholder="Phone" className="input" value={form.phone} onChange={set("phone")} />
          </div>
          <input required placeholder="Address line 1" className="input" value={form.line1} onChange={set("line1")} />
          <input placeholder="Address line 2 (optional)" className="input" value={form.line2} onChange={set("line2")} />
          <div className="grid gap-4 md:grid-cols-3">
            <input required placeholder="City" className="input" value={form.city} onChange={set("city")} />
            <input required placeholder="State" className="input" value={form.state} onChange={set("state")} />
            <input required placeholder="PIN code" className="input" value={form.pincode} onChange={set("pincode")} />
          </div>

          <button disabled={submitting}
            className="mt-4 w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
            {submitting ? "Placing order…" : `Pay ${formatInr(total)}`}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Payments are secured. Test-mode checkout until Stripe live keys are activated.
          </p>
        </form>

        <aside className="h-fit rounded-sm border border-border/60 bg-secondary/40 p-6">
          <div className="font-display text-2xl">Your bag</div>
          <div className="mt-4 space-y-4">
            {cart.items.map((i) => (
              <div key={`${i.productId}-${i.size}`} className="flex gap-3">
                <img src={i.imageUrl} alt={i.name} className="h-16 w-16 rounded-sm object-cover" />
                <div className="flex flex-1 flex-col text-sm">
                  <div className="font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">Size {i.size} · Qty {i.qty}</div>
                </div>
                <div className="text-sm">{formatInr(i.qty * i.unitPriceInr)}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-border/60 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatInr(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
            <div className="flex justify-between border-t border-border/60 pt-2 text-base font-medium"><span>Total</span><span>{formatInr(total)}</span></div>
          </div>
        </aside>
      </div>

      <style>{`
        .input { width: 100%; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.85rem 1rem; font-size: 0.875rem; border-radius: 0.125rem; }
        .input:focus { outline: none; border-color: var(--color-primary); }
      `}</style>
    </div>
  );
}