import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — Vortex Footwear" },
      { name: "description", content: "Free shipping across India, 14-day exchanges, and easy returns." },
    ],
  }),
  component: ShippingReturns,
});

function ShippingReturns() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="eyebrow">Shipping & Returns</div>
        <h1 className="mt-4 font-display text-5xl">How it works.</h1>
        <div className="mt-12 space-y-10">
          <section>
            <h2 className="font-display text-2xl">Shipping</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Free standard shipping across India. Delivery to metros in 2–4 business days, tier-2 and tier-3 in 4–7 days. All orders are dispatched from our Bengaluru studio with tracking.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl">Returns & exchanges</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">14 days to change your mind. Unworn pairs in original packaging can be exchanged or refunded, with a free pickup we arrange. We only ask that soles stay clean — try them on carpet first.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl">Repair programme</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Free resoling within two years of purchase. After that, we resole and recondition at cost. Write to us with photos and we&apos;ll arrange the details.</p>
          </section>
        </div>
      </div>
    </div>
  );
}