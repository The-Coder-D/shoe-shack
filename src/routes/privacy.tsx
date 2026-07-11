import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Marché" },
      { name: "description", content: "Marché privacy notice." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="eyebrow">Legal</div>
        <h1 className="mt-4 font-display text-5xl">Privacy notice.</h1>
        <p className="mt-6 text-xs text-muted-foreground">This page is maintained by Marché.</p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section><h2 className="font-display text-xl text-foreground">What we collect</h2><p className="mt-2">Your name, email, phone, shipping address, and order history — the details needed to fulfil your order and stay in touch about it.</p></section>
          <section><h2 className="font-display text-xl text-foreground">How we use it</h2><p className="mt-2">To process orders, deliver shoes, and respond to your queries. We do not sell your data.</p></section>
          <section><h2 className="font-display text-xl text-foreground">Your rights</h2><p className="mt-2">You can request a copy of your data, ask us to correct it, or ask us to delete your account at any time. Write to hello@vortex.example.</p></section>
        </div>
      </div>
    </div>
  );
}