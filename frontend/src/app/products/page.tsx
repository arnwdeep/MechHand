import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Collection — Haute Joaillerie & Sculptural Jewellery",
  description:
    "Explore Shree Rani Gehna's 18K/22K gold and diamond jewellery catalog, priced dynamically with full transparent bullion rate calculation.",
};

const ALL_CATALOGUE_ITEMS = [
  {
    id: "p1",
    slug: "puffy-twisted-sapphire-ring",
    name: "Puffy Twisted Sapphire & Diamond Ring",
    category: "rings",
    metal: "gold",
    purity: "18K",
    price: 235000,
    grossWeight: 4.8,
    imageSrc: "/media/products/prod-1.jpg",
    tag: "Icon",
  },
  {
    id: "p2",
    slug: "petaled-cut-out-solitaire-ring",
    name: "Petaled Cut-Out Solitaire Ring",
    category: "rings",
    metal: "gold",
    purity: "18K",
    price: 285000,
    grossWeight: 5.2,
    imageSrc: "/media/products/prod-2.jpg",
    tag: "High Jewellery",
  },
  {
    id: "p3",
    slug: "noodle-dual-band-ruby-ring",
    name: "Noodle Dual-Band Ruby & Diamond Ring",
    category: "rings",
    metal: "gold",
    purity: "18K Rose",
    price: 170000,
    grossWeight: 3.6,
    imageSrc: "/media/products/prod-3.jpg",
    tag: "New",
  },
  {
    id: "p4",
    slug: "noodle-u-platinum-sculptural-ring",
    name: "Noodle U-Platinum Sculptural Diamond Ring",
    category: "rings",
    metal: "silver",
    purity: "925 / Plat",
    price: 195000,
    grossWeight: 5.8,
    imageSrc: "/media/products/prod-4.jpg",
    tag: "Platinum Set",
  },
  {
    id: "p5",
    slug: "noodle-high-architectural-black-enamel-ring",
    name: "Noodle High Black Enamel & Diamond Cocktail Ring",
    category: "rings",
    metal: "gold",
    purity: "18K",
    price: 345000,
    grossWeight: 7.4,
    imageSrc: "/media/products/prod-5.jpg",
    tag: "Masterpiece",
  },
  {
    id: "p6",
    slug: "noodle-low-flush-onyx-diamond-band",
    name: "Noodle Low Flush Onyx & Baguette Diamond Band",
    category: "rings",
    metal: "gold",
    purity: "18K",
    price: 210000,
    grossWeight: 4.1,
    imageSrc: "/media/products/prod-6.jpg",
    tag: "Atelier Edit",
  },
  {
    id: "p7",
    slug: "noodle-platinum-sculptural-loop-ring",
    name: "Noodle Platinum Sculptural Diamond Loop Ring",
    category: "rings",
    metal: "silver",
    purity: "925 / Plat",
    price: 198000,
    grossWeight: 4.6,
    imageSrc: "/media/products/prod-7.jpg",
    tag: "New",
  },
  {
    id: "p8",
    slug: "noodle-low-open-loop-champagne-gold-ring",
    name: "Noodle Low Open Loop Champagne Gold Ring",
    category: "rings",
    metal: "gold",
    purity: "18K",
    price: 225000,
    grossWeight: 4.5,
    imageSrc: "/media/products/prod-8.jpg",
    tag: "Signature",
  },
  {
    id: "p9",
    slug: "diamond-solitaire-ring",
    name: "Imperial Diamond Solitaire Heritage Ring",
    category: "rings",
    metal: "gold",
    purity: "18K",
    price: 36719.5,
    grossWeight: 3.5,
    imageSrc: "/media/products/prod-2.jpg",
    tag: "Hand Calculated Case A",
  },
  {
    id: "p10",
    slug: "syndicate-polki-choker-necklace",
    name: "Syndicate Polki Royal Choker Necklace",
    category: "necklaces",
    metal: "gold",
    purity: "22K",
    price: 675628.5,
    grossWeight: 42.0,
    imageSrc: "/media/editorial/mid-right.jpg",
    tag: "Haute Joaillerie",
  },
  {
    id: "p11",
    slug: "diamond-chandelier-drop-earrings",
    name: "Diamond Chandelier Waterfall Earrings",
    category: "earrings",
    metal: "gold",
    purity: "18K",
    price: 312000,
    grossWeight: 9.8,
    imageSrc: "/media/editorial/hero-right.jpg",
    tag: "Editorial",
  },
  {
    id: "p12",
    slug: "sculptural-wave-statement-cuff",
    name: "Sculptural Wave Diamond Statement Cuff",
    category: "rings",
    metal: "gold",
    purity: "18K",
    price: 480000,
    grossWeight: 18.5,
    imageSrc: "/media/editorial/hero-left.jpg",
    tag: "Vogue Icon",
  },
];

const FILTERS = [
  { label: "All Items", key: "all", value: "all" },
  { label: "Rings", key: "category", value: "rings" },
  { label: "Necklaces", key: "category", value: "necklaces" },
  { label: "Earrings", key: "category", value: "earrings" },
  { label: "18K & 22K Gold", key: "metal", value: "gold" },
  { label: "Silver & Platinum", key: "metal", value: "silver" },
];

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const activeCategory = params.category;
  const activeMetal = params.metal;
  const searchQuery = (params.q || "").toLowerCase();

  let filtered = ALL_CATALOGUE_ITEMS.filter((item) => {
    if (activeCategory && item.category !== activeCategory) return false;
    if (activeMetal && item.metal !== activeMetal) return false;
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery) &&
      !item.purity.toLowerCase().includes(searchQuery) &&
      !item.category.toLowerCase().includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1A1816] pt-24 sm:pt-28 pb-20">
      {/* Top Editorial Banner */}
      <div className="px-5 sm:px-10 lg:px-12 pb-10 border-b border-black/15">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C857B] font-semibold">
              HAUTE JOAILLERIE &bull; MAISON DE CRÉATION
            </span>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-normal italic tracking-wide text-[#1A1816] mt-2 font-serif"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              The Masterpiece Archive
            </h1>
            <p className="text-xs sm:text-sm text-[#5B564F] max-w-xl mt-3 leading-relaxed">
              Every creation is cast in certified 18K/22K gold or 925 platinum-silver with brilliant-cut diamonds. Prices are calculated dynamically from today&apos;s bullion metal rate with full transparent breakup.
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <span className="text-xs text-[#8C857B] uppercase tracking-wider block">
              CATALOGUE COUNT
            </span>
            <span className="text-2xl font-normal tabular font-serif">
              {filtered.length} {filtered.length === 1 ? "Creation" : "Creations"}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] uppercase tracking-[0.18em]">
          {FILTERS.map((f) => {
            let isActive = false;
            let targetHref = "/products";

            if (f.key === "all") {
              isActive = !activeCategory && !activeMetal;
              targetHref = "/products";
            } else if (f.key === "category") {
              isActive = activeCategory === f.value;
              targetHref = `/products?category=${f.value}`;
            } else if (f.key === "metal") {
              isActive = activeMetal === f.value;
              targetHref = `/products?metal=${f.value}`;
            }

            return (
              <Link
                key={f.label}
                href={targetHref}
                className={`px-3.5 py-1.5 border transition-all ${
                  isActive
                    ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816] font-semibold"
                    : "border-black/15 text-[#1A1816] hover:border-black hover:bg-black/5"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4-Column Editorial Matrix */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center px-4">
          <p className="font-serif italic text-2xl text-[#1A1816]">No creations match your filter.</p>
          <p className="text-xs text-muted mt-2">Try clearing your filters to explore the full collection.</p>
          <Link
            href="/products"
            className="inline-block mt-6 text-xs uppercase tracking-[0.2em] font-medium border-b border-black pb-1 hover:opacity-60"
          >
            Reset Filters &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 w-full border-b border-black/15">
          {filtered.map((item, index) => {
            const isRightEdge = (index + 1) % 4 === 0;
            const isTwoColRightEdge = (index + 1) % 2 === 0;

            return (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className={`group relative flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-[#FAF8F5] transition-colors duration-300 hover:bg-[#F3EFE8] border-b border-black/15 ${
                  isTwoColRightEdge ? "border-r-0 md:border-r" : "border-r"
                } ${isRightEdge ? "lg:border-r-0" : "lg:border-r"}`}
              >
                {/* Tag */}
                {item.tag && (
                  <span className="absolute top-4 left-4 z-10 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1816]/70 bg-white/80 px-2 py-0.5 rounded-xs backdrop-blur-xs">
                    {item.tag}
                  </span>
                )}

                {/* Centered Image */}
                <div className="relative w-full aspect-square flex items-center justify-center my-4 sm:my-6 overflow-hidden">
                  <div className="relative w-[85%] h-[85%] transition-transform duration-700 ease-out group-hover:scale-108">
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Metadata row */}
                <div className="w-full pt-3 flex items-baseline justify-between gap-2 border-t border-black/10 text-[#1A1816]">
                  <div className="min-w-0 pr-2">
                    <h3 className="text-[11px] sm:text-[12px] font-normal tracking-[0.04em] text-[#1A1816] truncate capitalize group-hover:underline underline-offset-2">
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-muted tracking-wide mt-0.5 uppercase hidden sm:block">
                      {item.purity} &bull; {item.grossWeight}g
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-[11px] sm:text-[12px] font-medium tabular text-[#1A1816] tracking-tight">
                      {formatINR(item.price)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
