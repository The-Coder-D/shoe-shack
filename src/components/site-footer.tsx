import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="container-page grid gap-12 py-16 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl">Vortex<span className="text-accent">.</span></div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Considered footwear, made for the long walk. Designed in Bengaluru, crafted in
            small runs.
          </p>
        </div>
        <div>
          <div className="eyebrow">Shop</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/shop">All footwear</Link></li>
            <li><Link to="/shop/sneakers">Sneakers</Link></li>
            <li><Link to="/shop/boots">Boots</Link></li>
            <li><Link to="/shop/formal">Formal</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow">Company</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/shipping-returns">Shipping & Returns</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow">Legal</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/privacy">Privacy</Link></li>
            <li><Link to="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Vortex Footwear. All rights reserved.</div>
          <div>Made with care in India.</div>
        </div>
      </div>
    </footer>
  );
}