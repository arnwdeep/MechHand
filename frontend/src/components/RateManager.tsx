"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { DeriveRatesResponse, RatesToday } from "@/lib/types";
import { formatAmount, titleCase } from "@/lib/format";

type Status =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "saved"; message: string }
  | { kind: "error"; message: string };

type Mode = "pure" | "single";

export default function RateManager({ rates }: { rates: RatesToday }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("pure");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // --- derive-from-pure state ---------------------------------------------
  const [metal, setMetal] = useState("gold");
  const [pureRate, setPureRate] = useState("");
  const [derived, setDerived] = useState<DeriveRatesResponse | null>(null);
  /** Purity → the rate the owner will actually save (may be edited). */
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [chosen, setChosen] = useState<Set<string>>(new Set());

  // --- single-purity state -------------------------------------------------
  const [oneMetal, setOneMetal] = useState("gold");
  const [onePurity, setOnePurity] = useState("18K");
  const [oneRate, setOneRate] = useState("");

  async function workOutRates(event: React.FormEvent) {
    event.preventDefault();
    setStatus({ kind: "busy" });
    setDerived(null);

    const query = new URLSearchParams({ pure_rate_per_gram: pureRate.trim(), metal });
    const response = await fetch(`/api/admin/rates/derive?${query}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus({ kind: "error", message: detailOf(data) });
      return;
    }

    const body = data as DeriveRatesResponse;
    setDerived(body);
    setEdited(
      Object.fromEntries(body.derived.map((d) => [d.purity, String(d.rate_per_gram)])),
    );
    // Default to the purities you actually have stock in — the rest are noise.
    setChosen(new Set(body.derived.filter((d) => d.product_count > 0).map((d) => d.purity)));
    setStatus({ kind: "idle" });
  }

  async function saveDerived() {
    if (!derived || chosen.size === 0) return;
    setStatus({ kind: "busy" });

    const payload = {
      rates: derived.derived
        .filter((d) => chosen.has(d.purity))
        .map((d) => ({
          metal: derived.metal,
          purity: d.purity,
          // The owner's edited figure wins over the suggestion.
          rate_per_gram: (edited[d.purity] ?? String(d.rate_per_gram)).trim(),
        })),
    };

    const response = await fetch("/api/admin/rates/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus({ kind: "error", message: detailOf(data) });
      return;
    }

    setStatus({
      kind: "saved",
      message: `${payload.rates.length} ${payload.rates.length === 1 ? "rate" : "rates"} saved. Every piece in those purities has been re-priced.`,
    });
    setDerived(null);
    setPureRate("");
    router.refresh();
  }

  async function saveOne(event: React.FormEvent) {
    event.preventDefault();
    setStatus({ kind: "busy" });

    const response = await fetch("/api/admin/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metal: oneMetal,
        purity: onePurity,
        rate_per_gram: oneRate.trim(),
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus({ kind: "error", message: detailOf(data) });
      return;
    }

    setStatus({
      kind: "saved",
      message: `${titleCase(oneMetal)} ${onePurity} set to ₹${formatAmount(data.rate_per_gram)}/g.`,
    });
    setOneRate("");
    router.refresh();
  }

  const pureLabel = derived?.pure_purity ?? (metal === "silver" ? "999" : "24K");

  return (
    <div className="space-y-10">
      {!rates.all_rates_set && (
        <div className="border-2 border-warn/40 bg-warn-soft rounded-xl p-5">
          <p className="display text-xl text-warn">Today&apos;s rates are incomplete</p>
          <p className="mt-2 text-sm text-ink/80 leading-relaxed">
            Pieces in{" "}
            <strong>
              {rates.missing.map((m) => `${titleCase(m.metal)} ${m.purity}`).join(", ")}
            </strong>{" "}
            cannot be priced or bought until you set the rate. Customers see “price on
            request” on those pieces — never an old price.
          </p>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      <section className="border border-line rounded-xl bg-white overflow-hidden">
        <div className="flex border-b border-line">
          {(
            [
              ["pure", "From one pure rate"],
              ["single", "One purity at a time"],
            ] as [Mode, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setMode(value);
                setStatus({ kind: "idle" });
              }}
              className={`px-5 py-3 text-sm transition-colors ${
                mode === value
                  ? "bg-cream/60 text-ink font-medium"
                  : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {mode === "pure" ? (
            <>
              <form onSubmit={workOutRates} className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Metal</label>
                  <select
                    value={metal}
                    onChange={(e) => {
                      setMetal(e.target.value);
                      setDerived(null);
                    }}
                    className="border border-line rounded-lg px-3 py-2 text-sm bg-ivory"
                  >
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                  </select>
                </div>
                <div className="grow min-w-[180px]">
                  <label className="block text-xs text-muted mb-1">
                    Pure {metal} rate — {pureLabel}, 100 touch (₹ per gram)
                  </label>
                  <input
                    value={pureRate}
                    onChange={(e) => setPureRate(e.target.value)}
                    inputMode="decimal"
                    required
                    placeholder={metal === "silver" ? "95" : "8000"}
                    className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-ivory tabular"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status.kind === "busy"}
                  className="border border-ink px-5 py-2 rounded-full text-sm hover:bg-ink hover:text-cream transition-colors disabled:opacity-50"
                >
                  {status.kind === "busy" ? "Working…" : "Work out rates"}
                </button>
              </form>

              <p className="mt-3 text-xs text-muted leading-relaxed">
                Rates are worked out on the server and shown below before anything is
                saved. Adjust any figure the market quotes differently — what you save
                is what customers are charged.
              </p>

              {derived && (
                <div className="mt-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-line">
                        <th className="py-2 pr-2 eyebrow text-muted font-semibold">Save</th>
                        <th className="py-2 pr-2 eyebrow text-muted font-semibold">Purity</th>
                        <th className="py-2 pr-2 eyebrow text-muted font-semibold">Of pure</th>
                        <th className="py-2 pr-2 eyebrow text-muted font-semibold">
                          Rate ₹/g
                        </th>
                        <th className="py-2 eyebrow text-muted font-semibold text-right">
                          Pieces
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {derived.derived.map((row) => {
                        const on = chosen.has(row.purity);
                        return (
                          <tr
                            key={row.purity}
                            className={`border-b border-line/60 ${on ? "" : "opacity-45"}`}
                          >
                            <td className="py-2 pr-2">
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() => {
                                  const next = new Set(chosen);
                                  if (on) next.delete(row.purity);
                                  else next.add(row.purity);
                                  setChosen(next);
                                }}
                              />
                            </td>
                            <td className="py-2 pr-2 tabular font-medium">{row.purity}</td>
                            <td className="py-2 pr-2 tabular text-muted text-xs">
                              {(row.fineness * 100).toFixed(2)}%
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                value={edited[row.purity] ?? ""}
                                onChange={(e) =>
                                  setEdited({ ...edited, [row.purity]: e.target.value })
                                }
                                inputMode="decimal"
                                className="w-32 border border-line rounded-md px-2 py-1 text-sm bg-ivory tabular"
                              />
                            </td>
                            <td className="py-2 text-right tabular text-muted">
                              {row.product_count > 0 ? (
                                <span className="text-ink">{row.product_count}</span>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <button
                    onClick={saveDerived}
                    disabled={status.kind === "busy" || chosen.size === 0}
                    className="mt-5 bg-ink text-cream px-6 py-3 rounded-full text-sm hover:bg-gold transition-colors disabled:opacity-40"
                  >
                    {chosen.size === 0
                      ? "Tick a purity to save"
                      : `Save ${chosen.size} ${chosen.size === 1 ? "rate" : "rates"}`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={saveOne} className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Metal</label>
                <select
                  value={oneMetal}
                  onChange={(e) => setOneMetal(e.target.value)}
                  className="border border-line rounded-lg px-3 py-2 text-sm bg-ivory"
                >
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Purity</label>
                <input
                  value={onePurity}
                  onChange={(e) => setOnePurity(e.target.value)}
                  list="purity-options"
                  className="w-28 border border-line rounded-lg px-3 py-2 text-sm bg-ivory tabular"
                />
                <datalist id="purity-options">
                  {["24K", "22K", "18K", "14K", "925", "999"].map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
              <div className="grow min-w-[160px]">
                <label className="block text-xs text-muted mb-1">Rate per gram (₹)</label>
                <input
                  value={oneRate}
                  onChange={(e) => setOneRate(e.target.value)}
                  inputMode="decimal"
                  required
                  placeholder="6000"
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-ivory tabular"
                />
              </div>
              <button
                type="submit"
                disabled={status.kind === "busy"}
                className="bg-ink text-cream px-6 py-2.5 rounded-full text-sm hover:bg-gold transition-colors disabled:opacity-50"
              >
                Save rate
              </button>
            </form>
          )}

          {status.kind === "saved" && (
            <div className="mt-4 text-xs bg-gold-soft text-ok rounded-lg px-4 py-3">
              <strong>{status.message}</strong>{" "}
              <Link href="/products" className="underline underline-offset-2">
                See the collection
              </Link>
            </div>
          )}
          {status.kind === "error" && (
            <div className="mt-4 text-xs bg-warn-soft text-warn rounded-lg px-4 py-3">
              {status.message}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="display text-2xl mb-4">What each purity is set to</h2>
        <table className="w-full text-sm border border-line rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-cream/60 text-left">
              <th className="px-4 py-3 eyebrow text-muted font-semibold">Metal</th>
              <th className="px-4 py-3 eyebrow text-muted font-semibold">Purity</th>
              <th className="px-4 py-3 eyebrow text-muted font-semibold text-right">Pieces</th>
              <th className="px-4 py-3 eyebrow text-muted font-semibold text-right">
                Rate today
              </th>
            </tr>
          </thead>
          <tbody>
            {rates.purities.map((row) => (
              <tr key={`${row.metal}-${row.purity}`} className="border-t border-line">
                <td className="px-4 py-3">{titleCase(row.metal)}</td>
                <td className="px-4 py-3 tabular">
                  {row.purity}
                  {row.fineness !== null && (
                    <span className="text-muted text-xs ml-2">
                      {(row.fineness * 100).toFixed(1)}% pure
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular text-muted">
                  {row.product_count || "—"}
                </td>
                <td className="px-4 py-3 text-right tabular">
                  {row.rate_per_gram !== null ? (
                    `₹${formatAmount(row.rate_per_gram)}/g`
                  ) : (
                    <span className="text-warn font-medium">Not set</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-4 text-xs text-muted leading-relaxed">
          Rates are stored per purity and append-only: saving a rate adds a new row and
          keeps the old one, so the rate behind every past sale stays provable. A pure
          rate is only ever a starting point for working these out — it is never used
          to price a piece directly.
        </p>
      </section>
    </div>
  );
}

function detailOf(data: unknown): string {
  const detail = (data as { detail?: unknown })?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d: { msg?: string }) => d.msg ?? "invalid").join(", ");
  }
  return typeof detail === "string" ? detail : "Something went wrong.";
}
