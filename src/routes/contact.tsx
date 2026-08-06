import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Marché" },
      { name: "description", content: "Get in touch with Marché for orders, support, and press." },
      { property: "og:title", content: "Contact — Marché" },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="eyebrow">Reach us</div>
        <h1 className="mt-4 font-display text-5xl"><span className="heading-hover">In touch.</span></h1>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <div className="font-medium">Customer care</div>
            <p className="mt-2 text-sm text-muted-foreground">Mon–Sat, 10am–7pm IST</p>
            <a href="mailto:hello@vortex.example" className="mt-2 block text-sm underline underline-offset-4">hello@vortex.example</a>
          </div>
          <div>
            <div className="font-medium">Studio</div>
            <p className="mt-2 text-sm text-muted-foreground">Indiranagar, Bengaluru<br />Karnataka 560038, India</p>
          </div>
          <div>
            <div className="font-medium">Press</div>
            <a href="mailto:press@vortex.example" className="mt-2 block text-sm underline underline-offset-4">press@vortex.example</a>
          </div>
          <div>
            <div className="font-medium">Wholesale</div>
            <a href="mailto:trade@vortex.example" className="mt-2 block text-sm underline underline-offset-4">trade@vortex.example</a>
          </div>
        </div>
      </div>
    </div>
  );
}