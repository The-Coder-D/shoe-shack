import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async (u: User | null) => {
      if (!mounted) return;
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", u.id)
          .eq("role", "admin")
          .maybeSingle();
        if (mounted) setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
      if (mounted) setLoading(false);
    };

    supabase.auth.getUser().then(({ data }) => check(data.user));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      check(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading, isAdmin };
}