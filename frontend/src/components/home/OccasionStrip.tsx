import Link from "next/link";

const OCCASIONS = [
  { slug: "bridal", label: "Bridal", note: "The full set, worn once and kept forever" },
  { slug: "wedding", label: "Wedding guest", note: "Pieces that carry a room" },
  { slug: "festive", label: "Festive", note: "Diwali, Karva Chauth, Navratri" },
  { slug: "gifting", label: "Gifting", note: "Something small and certain" },
  { slug: "daily", label: "Everyday", note: "Light enough to forget you have it on" },
];

export default function OccasionStrip() {
  return (
    <section className="border-y border-line bg-cream/40">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <p className="eyebrow text-gold">Find it faster</p>
        <h2 className="display text-3xl md:text-4xl mt-2">Shop by occasion</h2>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {OCCASIONS.map((occasion) => (
            <Link
              key={occasion.slug}
              href={`/products?occasion=${occasion.slug}`}
              className="group border border-line bg-white rounded-xl p-5 hover:border-gold transition-colors"
            >
              <h3 className="display text-xl group-hover:text-gold transition-colors">
                {occasion.label}
              </h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">{occasion.note}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
