import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const search = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Sign in — Vortex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: next ?? "/account", replace: true });
    });
  }, [navigate, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Account created");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
      navigate({ to: next ?? "/account", replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) return toast.error(result.error.message);
      if (result.redirected) return;
      navigate({ to: next ?? "/account", replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Google sign-in failed");
    }
  };

  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="eyebrow">Account</div>
          <h1 className="mt-3 font-display text-4xl">
            {mode === "signin" ? "Welcome back." : "Create account."}
          </h1>
        </div>

        <form onSubmit={submit} className="mt-10 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-2 block text-xs">Full name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
            </div>
          )}
          <div>
            <label className="mb-2 block text-xs">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-xs">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
          </div>
          <button disabled={loading}
            className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <button onClick={google}
          className="w-full rounded-full border border-border py-4 text-sm font-medium transition-colors hover:bg-secondary">
          Continue with Google
        </button>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>New to Vortex? <button className="text-foreground underline underline-offset-4" onClick={() => setMode("signup")}>Create an account</button></>
          ) : (
            <>Already have an account? <button className="text-foreground underline underline-offset-4" onClick={() => setMode("signin")}>Sign in</button></>
          )}
        </div>
        <div className="mt-2 text-center">
          <Link to="/" className="text-xs text-muted-foreground underline underline-offset-4">Back to home</Link>
        </div>
      </div>
    </div>
  );
}