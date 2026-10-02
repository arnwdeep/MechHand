/**
 * Trust row.
 *
 * IMPORTANT: only claims the system itself makes true are stated here. Every
 * major jeweller's homepage also carries hallmarking, certification, buyback
 * and returns badges — those are commercial promises only the client can make,
 * and on a jeweller's site a claim that turns out to be untrue is a legal
 * problem, not a copy problem. The placeholders below are deliberately
 * unpublished until the client confirms each one in writing.
 */

const PROVABLE = [
  {
    title: "The rate is on the record",
    body: "Every rate we have ever set is kept, never overwritten. The rate behind your purchase can be produced months later.",
  },
  {
    title: "Nothing is rounded away",
    body: "Metal, diamond, making and GST are shown as four separate lines. The total is their sum, with no undisclosed margin folded in.",
  },
  {
    title: "The price is held while you pay",
    body: "Your price is locked when you add a piece to the cart, so a rate change mid-checkout can never move what you are charged.",
  },
  {
    title: "A GST invoice, every time",
    body: "Itemised, with the rate and weights that produced the figure printed on it.",
  },
];

/* TODO(client): confirm each before publishing, then move into PROVABLE.
 *   - BIS hallmarking: which purities, which assaying centre?
 *   - Diamond certification: IGI / GIA / in-house? Above what carat?
 *   - Exchange & buyback: rate of deduction, time limit?
 *   - Returns window and who pays return shipping?
 *   - Shipping: insured? Free above a threshold?
 */

export default function Assurance() {
  return (
    <section className="bg-[#F4F1EA] border-t border-line/60 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-gold">ATELIER GUARANTEE</p>
        <h2 className="display text-3xl md:text-4xl text-ink mt-2 max-w-2xl font-normal">
          A jeweller&apos;s word, with the arithmetic attached.
        </h2>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PROVABLE.map((item) => (
            <div key={item.title} className="bg-[#EBE8E3] border border-line/50 p-6 rounded-lg">
              <div className="h-px w-8 bg-gold mb-4" />
              <h3 className="display text-lg text-ink font-normal leading-snug">{item.title}</h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
