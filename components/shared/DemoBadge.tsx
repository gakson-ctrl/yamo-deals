/**
 * DemoBadge — fixed DÉMO watermark in the top-right corner of every page.
 * Remove this component from layout.tsx when going to production.
 *
 * Text is intentionally not run through t() — "DÉMO" is the same in FR and EN
 * and removing it at go-live is a one-line change.
 */
export function DemoBadge() {
  return (
    <div
      aria-hidden="true"
      className="
        fixed top-3 right-3 z-[9999]
        bg-yamo-mango text-yamo-ebony
        text-[10px] font-bold font-sora tracking-widest
        px-2 py-0.5 rounded-yamo-chip
        pointer-events-none select-none
        shadow-sm
      "
    >
      DÉMO
    </div>
  );
}
