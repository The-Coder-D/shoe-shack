import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";

const KEY = "marche_welcome_banner_dismissed";

export function WelcomeBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(KEY) === "1");
    } catch {}
  }, []);

  if (user || dismissed) return null;

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  };

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container-page flex items-center justify-between gap-4 py-2.5 text-xs md:text-sm">
        <p className="flex-1 text-center">
          Create a free account and get <span className="font-semibold">₹200 off</span> your first order.{" "}
          <Link to="/auth" className="underline underline-offset-4">
            Sign up
          </Link>
        </p>
        <button
          type="button"
          onClick={close}
          aria-label="Dismiss"
          className="rounded-full p-1 transition-colors hover:bg-primary-foreground/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
