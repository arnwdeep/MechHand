import Link from "next/link";

/**
 * The made-to-order path. High-value and bespoke pieces do not sell from a
 * cart; they start a conversation. The enquiry form and WhatsApp follow-up
 * are Phase 4 — until then this routes to the made-to-order listing.
 */
export default function ConsultationCta() {
  return (
    <section className="bg-[#EBE8E3] border-t border-line/60 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="border border-line/60 rounded-xl bg-[#F4F1EA] p-8 md:p-14 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center shadow-xs">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-gold">BESPOKE COMMISSIONS</p>
            <h2 className="display text-3xl md:text-4xl text-ink mt-2 leading-tight font-normal">
              Bring us a drawing, a photograph, or your grandmother&apos;s set.
            </h2>
            <p className="mt-5 text-muted leading-relaxed text-sm sm:text-base max-w-xl">
              Bridal sets and larger commissions are quoted piece by piece — we will talk through stones, weight and finish, then give you the same transparent price breakdown.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products?type=made_to_order"
                className="bg-[#1A1816] text-[#EBE8E3] px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-[0.2em] hover:bg-gold hover:text-white transition-all shadow-xs"
              >
                See Commissions →
              </Link>
              <Link
                href="/products"
                className="border border-line/80 text-ink px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-[0.2em] hover:border-ink transition-colors"
              >
                Browse Collection
              </Link>
            </div>
          </div>

          <ol className="space-y-6 border-t lg:border-t-0 lg:border-l border-line/60 pt-6 lg:pt-0 lg:pl-10">
            {[
              ["Tell us what you have in mind", "A reference image is enough to start."],
              ["We quote it, fully broken up", "Metal, stones, making and GST, itemised."],
              ["Approve, and we begin", "Four to six weeks for most commissions."],
            ].map(([title, detail], index) => (
              <li key={title} className="flex gap-4">
                <span className="roman text-gold text-xs font-bold pt-0.5 shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-ink">{title}</p>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
