import Link from "next/link";
import { getProducts, getRatesToday } from "@/lib/api";
import { formatAmount, formatGrams, formatINR, titleCase } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * How the price is built, shown with a piece actually in stock.
 *
 * The worked example is a live PriceResult from the API, not an illustration —
 * if the owner changes today's rate, the numbers on the homepage move with it.
 * That is the whole proposition, so faking it here would be self-defeating.
 */
export default async function PricingExplainer() {
  const [rates, products] = await Promise.all([
    getRatesToday(),
    getProducts({ limit: "12" }),
  ]);

  const example: Product | undefined =
    products.items.find((p) => p.price && p.is_buyable) ?? products.items[0];

  return (
    <section className="bg-[#EBE8E3] border-t border-line/60 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-gold">TRANSPARENT ATELIER</p>
          <h2 className="display text-3xl md:text-5xl mt-2 leading-[1.1] text-ink font-normal">
            You see the whole sum, not just the total.
          </h2>
          <p className="mt-5 text-muted leading-relaxed text-sm sm:text-base">
            Gold and silver rates move daily, so printed price tags are either outdated or padded. We cost every piece in real-time from the day&apos;s rate for its exact purity.
          </p>

          <dl className="mt-8 space-y-4">
            {[
              [
                "Metal, on net weight",
                "Today's rate for exact purity, multiplied by net metal weight alone.",
              ],
              [
                "Diamonds, per piece",
                "Valued individually per piece, never averaged by gram.",
              ],
              [
                "Making, on gross weight",
                "Artisan labor charged on finished piece gross weight.",
              ],
              ["GST at 3%", "Statutory tax calculated on subtotal, shown as its own line."],
            ].map(([term, detail]) => (
              <div key={term} className="border-l-2 border-gold/40 pl-4 py-1">
                <dt className="font-semibold text-xs uppercase tracking-wider text-ink">{term}</dt>
                <dd className="text-xs text-muted mt-0.5 leading-relaxed">{detail}</dd>
              </div>
            ))}
          </dl>

          {rates.all_rates_set && rates.rates.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-wider uppercase tabular pt-4 border-t border-line/50">
              <span className="text-muted self-center font-semibold">Today&apos;s Rates</span>
              {rates.rates.map((rate) => (
                <span key={rate.id} className="text-ink">
                  {titleCase(rate.metal)} {rate.purity}{" "}
                  <span className="text-gold font-medium">₹{formatAmount(rate.rate_per_gram)}/g</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Live worked example */}
        <div className="border border-line/60 rounded-xl overflow-hidden bg-[#F4F1EA] shadow-xs">
          <div className="px-6 py-4 bg-[#EBE8E3] border-b border-line/50">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted">Worked Example &bull; Live Re-calculation</p>
          </div>

          {example?.price ? (
            <div className="p-6">
              <h3 className="display text-2xl text-ink font-normal">{example.name}</h3>
              <p className="text-xs text-muted mt-1 uppercase tracking-wider">
                {titleCase(example.metal)} {example.purity} &bull; net{" "}
                {formatGrams(example.net_weight_grams)} &bull; gross{" "}
                {formatGrams(example.gross_weight_grams)}
              </p>

              <table className="w-full text-xs tabular mt-6">
                <tbody>
                  {example.price.breakup.map((line) => (
                    <tr key={line.label} className="border-b border-line/50">
                      <td className="py-2.5 text-muted uppercase tracking-wider">{line.label}</td>
                      <td className="py-2.5 text-right font-medium text-ink">{formatINR(line.amount)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="pt-4 display text-base text-ink uppercase tracking-wider font-semibold">Total</td>
                    <td className="pt-4 text-right display text-xl text-ink font-semibold">
                      {formatINR(example.price.total!)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <Link
                href={`/products/${example.slug}`}
                className="mt-6 block text-center bg-[#1A1816] text-[#EBE8E3] py-3 rounded-full text-xs uppercase tracking-[0.2em] font-semibold hover:bg-gold hover:text-white transition-all shadow-xs"
              >
                Inspect Price Breakdown →
              </Link>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-xs text-warn font-medium uppercase tracking-wider">
                Today&apos;s rate has not been set yet.
              </p>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Rather than show yesterday&apos;s price, prices update live as soon as the day&apos;s rate is entered.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
