import Link from "next/link";
import JewelIllustration from "@/components/JewelIllustration";

/**
 * Shop-by-category grid — the first thing most jewellery shoppers reach for.
 *
 * Categories are declared here rather than derived from stock so the grid does
 * not reshuffle as pieces sell out. A category with nothing in it still lands
 * on a valid, empty listing.
 */
const CATEGORIES = [
  { slug: "maang-tikka", label: "Maang tikka" },
  { slug: "jhumkas", label: "Jhumkas" },
  { slug: "earrings", label: "Earrings" },
  { slug: "necklaces", label: "Necklaces" },
  { slug: "pendants", label: "Pendants" },
  { slug: "rings", label: "Rings" },
  { slug: "bangles", label: "Bangles" },
  { slug: "kamarbandh", label: "Kamarbandh" },
  { slug: "anklets", label: "Anklets" },
];

export default function CategoryTiles() {
  return (
    <section className="bg-[#EBE8E3] border-t border-line/60 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-center justify-between gap-6 mb-10 pb-4 border-b border-line/50">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-gold">BROWSE ATELIER</p>
            <h2 className="display text-3xl sm:text-4xl text-ink mt-1">Shop By Category</h2>
          </div>
          <Link
            href="/products"
            className="text-xs uppercase tracking-[0.2em] font-medium text-ink hover:text-gold transition-colors underline underline-offset-4 shrink-0"
          >
            VIEW ALL →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group bg-[#F4F1EA] border border-line/60 rounded-lg p-3 hover:border-ink/40 transition-all duration-300 block text-center"
            >
              <div className="aspect-square bg-white/40 rounded-md p-3 flex items-center justify-center mb-3">
                <JewelIllustration category={category.slug} className="w-4/5 h-4/5 object-contain transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-ink group-hover:text-gold transition-colors py-1">
                {category.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
