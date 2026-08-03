import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const CHART = [
  { uk: "6", eu: "40", us: "7", cm: "25.0" },
  { uk: "7", eu: "41", us: "8", cm: "25.8" },
  { uk: "8", eu: "42", us: "9", cm: "26.7" },
  { uk: "9", eu: "43", us: "10", cm: "27.5" },
  { uk: "10", eu: "44", us: "11", cm: "28.3" },
  { uk: "11", eu: "45", us: "12", cm: "29.2" },
];

const BRAND_OFFSET: Record<string, number> = {
  Nike: 0,
  Adidas: 0,
  Puma: 0,
  "Bata / Indian sizing": 0,
  "Converse (runs large)": -1,
};

export function SizeGuide({ onSelectSize }: { onSelectSize?: (uk: string) => void }) {
  const [open, setOpen] = useState(false);
  const [brand, setBrand] = useState<string>("Nike");
  const [wornUk, setWornUk] = useState<string>("");
  const [wide, setWide] = useState(false);

  const recommend = () => {
    if (!wornUk) return null;
    const base = Number(wornUk) + (BRAND_OFFSET[brand] ?? 0) + (wide ? 0.5 : 0);
    return String(Math.round(base));
  };
  const rec = recommend();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="link-sweep text-xs">
        Size guide &amp; fit finder
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-lg bg-background p-6 shadow-xl md:rounded-lg md:p-10"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close size guide"
                className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="eyebrow">Fit finder</div>
              <h3 className="mt-2 font-display text-2xl md:text-3xl">Find your size in 2 questions.</h3>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="eyebrow">Brand you wear</span>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  >
                    {Object.keys(BRAND_OFFSET).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="eyebrow">Your usual UK size</span>
                  <select
                    value={wornUk}
                    onChange={(e) => setWornUk(e.target.value)}
                    className="mt-2 w-full rounded-sm border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  >
                    <option value="">Select</option>
                    {CHART.map((r) => (
                      <option key={r.uk} value={r.uk}>
                        UK {r.uk}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={wide}
                  onChange={(e) => setWide(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
                I have wide feet
              </label>

              <AnimatePresence mode="wait">
                {rec && (
                  <motion.div
                    key={rec}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="mt-6 flex items-center justify-between gap-4 rounded-sm bg-secondary p-5"
                  >
                    <div>
                      <div className="eyebrow">We recommend</div>
                      <div className="mt-1 font-display text-3xl">UK {rec}</div>
                    </div>
                    {onSelectSize && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSize(`UK ${rec}`);
                          setOpen(false);
                        }}
                        className="press rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Select UK {rec}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-10 eyebrow">Conversion chart</div>
              <div className="mt-3 overflow-hidden rounded-sm border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary text-xs uppercase tracking-widest">
                    <tr>
                      <th className="px-4 py-3 text-left">UK</th>
                      <th className="px-4 py-3 text-left">EU</th>
                      <th className="px-4 py-3 text-left">US</th>
                      <th className="px-4 py-3 text-left">Foot length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CHART.map((r) => (
                      <tr
                        key={r.uk}
                        className={`border-t border-border/60 transition-colors hover:bg-secondary/60 ${
                          rec === r.uk ? "bg-accent/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3">{r.uk}</td>
                        <td className="px-4 py-3">{r.eu}</td>
                        <td className="px-4 py-3">{r.us}</td>
                        <td className="px-4 py-3">{r.cm} cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Between sizes? Our lasts run true to size — go up for thicker socks or wide feet.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}