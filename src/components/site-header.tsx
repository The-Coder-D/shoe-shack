import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, User, Heart, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/use-auth";

export function SiteHeader() {
  const { count } = useCart();
  const { user } = useAuth();
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
        <Link to="/" aria-label="Marché — home" className="group font-display text-2xl tracking-tight">
          <span className="inline-flex items-end">
            {Array.from("Marché").map((ch, i) => (
              <motion.span
                key={`${ch}-${i}`}
                className="inline-block will-change-transform"
                initial={{ y: "80%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.06 * i }}
                whileHover={{ y: -4, color: "var(--color-accent)" }}
              >
                {ch}
              </motion.span>
            ))}
            <motion.span
              className="logo-dot"
              whileHover={{ scale: 1.6, rotate: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 16 }}
            >
              .
            </motion.span>
          </span>
        </Link>

        <nav className="relative hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <motion.div
                key={n.to}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
              >
                <Link
                  to={n.to}
                  className={`group relative block overflow-hidden rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
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
                  <span className="pointer-events-none absolute inset-x-3 bottom-1.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100" />
                  {n.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/account"
              aria-label="Account"
              className="hidden h-10 w-10 items-center justify-center rounded-full icon-pop hover:bg-secondary md:inline-flex"
            >
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/auth"
              aria-label="Sign in"
              className="hidden h-10 w-10 items-center justify-center rounded-full icon-pop hover:bg-secondary md:inline-flex"
            >
              <User className="h-5 w-5" />
            </Link>
          )}
          {user && (
            <Link
              to="/account"
              aria-label="Wishlist"
              className="hidden h-10 w-10 items-center justify-center rounded-full icon-pop hover:bg-secondary md:inline-flex"
            >
              <Heart className="h-5 w-5" />
            </Link>
          )}
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full icon-pop hover:bg-secondary"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-medium text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full icon-pop hover:bg-secondary md:hidden"
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
              {[...nav, { label: user ? "Account" : "Sign in", to: user ? "/account" : "/auth" }].map((n) => (
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
