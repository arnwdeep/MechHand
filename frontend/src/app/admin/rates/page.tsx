import type { Metadata } from "next";
import { BackendUnreachable, getRatesToday } from "@/lib/api";
import BackendDown from "@/components/BackendDown";
import RateManager from "@/components/RateManager";

export const metadata: Metadata = { title: "Today's rates" };

export default async function AdminRatesPage() {
  let rates;
  try {
    rates = await getRatesToday();
  } catch (error) {
    if (error instanceof BackendUnreachable) return <BackendDown />;
    throw error;
  }

  const date = new Date(rates.date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <p className="eyebrow text-gold">Owner</p>
      <h1 className="display text-4xl mt-2">Today&apos;s metal rates</h1>
      <p className="mt-2 text-sm text-muted">{date}</p>
      <p className="mt-4 text-sm text-muted max-w-2xl leading-relaxed">
        This is the only screen that moves prices. No price is stored against a
        product, so setting a rate here re-prices the whole catalogue at once.
      </p>

      <div className="mt-10">
        <RateManager rates={rates} />
      </div>
    </div>
  );
}
