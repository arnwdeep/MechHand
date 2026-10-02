import type { PriceResult } from "@/lib/types";
import { formatAmount, formatINR } from "@/lib/format";

/**
 * The full price breakup, exactly as the server computed it.
 *
 * Every figure here is read straight from PriceResult. This component does no
 * arithmetic — not even summing the lines to check the total — because the
 * engine is the only thing allowed to decide what a piece costs.
 */
export default function PriceBreakup({ price }: { price: PriceResult }) {
  return (
    <div className="border border-line rounded-xl overflow-hidden">
      <div className="px-5 py-3 bg-cream/60 border-b border-line flex items-baseline justify-between">
        <span className="eyebrow text-muted">Price breakup</span>
        {price.rate_per_gram !== null && (
          <span className="text-xs text-muted tabular">
            at ₹{formatAmount(price.rate_per_gram)}/g today
          </span>
        )}
      </div>

      <table className="w-full text-sm tabular">
        <tbody>
          {price.breakup.map((line) => (
            <tr key={line.label} className="border-b border-line/70">
              <td className="px-5 py-3 text-muted">{line.label}</td>
              <td className="px-5 py-3 text-right">{formatINR(line.amount)}</td>
            </tr>
          ))}
          <tr>
            <td className="px-5 py-4 display text-lg">Total</td>
            <td className="px-5 py-4 text-right display text-xl">
              {price.total !== null ? formatINR(price.total) : "—"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
