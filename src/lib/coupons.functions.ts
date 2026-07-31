import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const validateCoupon = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ code: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("validate_coupon", { _code: data.code });
    if (error) throw new Error(error.message);
    const coupon = rows?.[0] ?? null;
    if (!coupon) return { valid: false, coupon: null };
    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_inr: coupon.discount_inr,
        discount_percent: coupon.discount_percent,
        min_order_inr: coupon.min_order_inr,
        is_welcome: coupon.is_welcome,
      },
    };
  });
