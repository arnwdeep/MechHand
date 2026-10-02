import Link from "next/link";
import { getRatesToday } from "@/lib/api";
import { formatAmount, titleCase } from "@/lib/format";

/**
 * Today's rates, shown on every page.
 *
 * This is the customer-facing half of the stale-rate rule: when a rate is
 * missing the strip says so rather than letting the site look normal while
 * prices quietly disappear from the cards.
 */
export default async function RateStrip() {
  let rates;
  try {
    rates = await getRatesToday();
  } catch {
    return (
      <div className="bg-warn-soft text-warn text-center text-xs py-2 px-4">
        Backend not running — start the API on port 8000 to see live prices.
      </div>
    );
  }

  const date = new Date(rates.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!rates.all_rates_set) {
    return (
      <div className="bg-warn-soft text-warn text-xs py-2 px-4 text-center">
        <span className="font-semibold">Prices updating.</span>{" "}
        {rates.missing.map((m) => `${titleCase(m.metal)} ${m.purity}`).join(", ")}{" "}
        {rates.missing.length === 1 ? "rate has" : "rates have"} not been set for today.{" "}
        <Link href="/admin/rates" className="underline underline-offset-2">
          Set today&apos;s rate
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 bg-transparent text-[#1A1816] text-[10px] sm:text-[11px] py-1 px-4 uppercase tracking-[0.2em] pointer-events-none">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center">
        <span className="font-semibold text-[#1A1816]/70">Today&apos;s Rates &bull; {date}</span>
        {rates.rates.map((rate) => (
          <span key={rate.id} className="tabular font-medium text-[#1A1816]">
            {titleCase(rate.metal)} {rate.purity}{" "}
            <span className="text-gold font-semibold">₹{formatAmount(rate.rate_per_gram)}/g</span>
          </span>
        ))}
      </div>
    </div>
  );
}
