import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Marché" },
      { name: "description", content: "Marché terms of service." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="eyebrow">Legal</div>
        <h1 className="mt-4 font-display text-5xl">Terms of service.</h1>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <p>By using this site or placing an order, you agree to the following simple terms.</p>
          <section><h2 className="font-display text-xl text-foreground">Orders</h2><p className="mt-2">All orders are subject to acceptance and availability. Prices are in Indian Rupees and inclusive of applicable taxes.</p></section>
          <section><h2 className="font-display text-xl text-foreground">Payments</h2><p className="mt-2">Payments are processed by our partner Stripe. Marché never stores your card details.</p></section>
          <section><h2 className="font-display text-xl text-foreground">Intellectual property</h2><p className="mt-2">All product designs, imagery, and copy on this site are the property of Marché.</p></section>
        </div>
      </div>
    </div>
  );
}