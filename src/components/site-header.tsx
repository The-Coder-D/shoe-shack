import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/cart";

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { label: "Shop All", to: "/shop" },
    { label: "Sneakers", to: "/shop/sneakers" },
    { label: "Boots", to: "/shop/boots" },
    { label: "Formal", to: "/shop/formal" },
    { label: "About", to: "/about" },
  ];

  return (
    <motion.header
      initial={false}
      animate={{
        backgroundColor: scrolled ? "color-mix(in oklab, var(--color-background) 82%, transparent)" : "color-mix(in oklab, var(--color-background) 0%, transparent)",
        borderColor: scrolled ? "color-mix(in oklab, var(--color-border) 60%, transparent)" : "color-mix(in oklab, var(--color-border) 0%, transparent)",
        backdropFilter: scrolled ? "blur(16px) saturate(140%)" : "blur(0px) saturate(100%)",
        boxShadow: scrolled ? "0 8px 30px -18px color-mix(in oklab, var(--color-foreground) 25%, transparent)" : "0 0 0 0 transparent",
      }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 border-b"
    >
      <motion.div
        animate={{ height: scrolled ? 60 : 84 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="container-page flex items-center justify-between gap-6"
      >
        <Link to="/" className="font-display text-2xl tracking-tight">
          Marché<span className="text-accent">.</span>
        </Link>

        <nav className="relative hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.9 }}
                    className="absolute inset-0 -z-10 rounded-full bg-secondary"
                  />
                )}
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            aria-label="Account"
            className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 hover:bg-secondary md:inline-flex"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 hover:bg-secondary"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-medium text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 hover:bg-secondary md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/60 md:hidden"
          >
            <nav className="container-page flex flex-col py-4">
              {[...nav, { label: "Account", to: "/auth" }].map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}