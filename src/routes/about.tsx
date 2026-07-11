import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Vortex Footwear" },
      { name: "description", content: "Vortex Footwear is a small-batch shoemaker designing and crafting premium footwear in India." },
      { property: "og:title", content: "About — Vortex Footwear" },
      { property: "og:description", content: "Small-batch shoemaker, designed in India." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="eyebrow">Our story</div>
        <h1 className="mt-4 font-display text-5xl md:text-6xl">Made with intent.</h1>
        <div className="mt-10 space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>Vortex began in a small workshop in Bengaluru with a simple idea: the footwear industry produces too much, too fast, and cares too little for the people who make and wear it.</p>
          <p>We work in small runs — never more than a few hundred pairs per style — with a handful of family-run workshops. Full-grain leather from LWG-certified tanneries. Vulcanized rubber that lasts. Stitching we can trace by hand.</p>
          <p>Every pair carries a lifetime of care: free resoling for two years, discounted repairs forever. Shoes are meant to be worn, and worn well.</p>
        </div>
      </div>
    </div>
  );
}