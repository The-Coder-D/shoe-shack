import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const nav = [
    { label: "Shop All", to: "/shop" },
    { label: "Sneakers", to: "/shop/sneakers" },
    { label: "Boots", to: "/shop/boots" },
    { label: "Formal", to: "/shop/formal" },
    { label: "About", to: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="font-display text-xl tracking-tight">
          Vortex<span className="text-accent">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`text-sm transition-colors hover:text-foreground ${
                path === n.to ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            aria-label="Account"
            className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-secondary md:inline-flex"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-medium text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 md:hidden">
          <nav className="container-page flex flex-col py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm"
              >
                {n.label}
              </Link>
            ))}
            <Link to="/auth" onClick={() => setOpen(false)} className="py-3 text-sm">
              Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}