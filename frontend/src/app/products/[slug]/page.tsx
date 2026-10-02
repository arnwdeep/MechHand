import type { Metadata } from "next";
import ProductDetailView, { type ProductDetailData } from "./ProductDetailView";
import EditorialProductGrid, { type EditorialProductItem } from "@/components/home/EditorialProductGrid";

type Params = { params: Promise<{ slug: string }> };

const PRODUCT_DATABASE: Record<string, ProductDetailData> = {
  "puffy-twisted-sapphire-ring": {
    id: "p1",
    slug: "puffy-twisted-sapphire-ring",
    name: "Puffy Twisted Sapphire & Diamond Ring",
    category: "rings",
    metal: "Yellow Gold",
    purity: "18K",
    netWeightGrams: 3.8,
    grossWeightGrams: 4.8,
    diamondValue: 98000,
    makingRate: 1400,
    priceTotal: 235000,
    images: [
      "/media/products/prod-1.jpg",
      "/media/products/prod-2.jpg",
      "/media/editorial/mid-left.jpg",
      "/media/editorial/hero-left.jpg",
    ],
    description:
      "A sculptural twisted statement ring crafted in vibrant sapphire blue enamel and 18K solid yellow gold, micro-paved with hand-selected brilliant diamonds.",
    details: [
      { label: "Material", value: "18K Yellow Gold & Sapphire Enamel" },
      { label: "Net Weight", value: "3.800 g" },
      { label: "Gross Weight", value: "4.800 g" },
      { label: "Diamond Appraisal", value: "0.45ct VVS-EF" },
    ],
  },
  "petaled-cut-out-solitaire-ring": {
    id: "p2",
    slug: "petaled-cut-out-solitaire-ring",
    name: "Petaled Cut-Out Solitaire Ring",
    category: "rings",
    metal: "Yellow Gold",
    purity: "18K",
    netWeightGrams: 4.2,
    grossWeightGrams: 5.2,
    diamondValue: 145000,
    makingRate: 1500,
    priceTotal: 285000,
    images: [
      "/media/products/prod-2.jpg",
      "/media/products/prod-1.jpg",
      "/media/editorial/mid-left.jpg",
      "/media/editorial/hero-left.jpg",
    ],
    description:
      "Architectural arch silhouette in polished 18K yellow gold centering a luminous floating cushion-cut certified natural diamond.",
    details: [
      { label: "Material", value: "18K Yellow Gold" },
      { label: "Net Weight", value: "4.200 g" },
      { label: "Gross Weight", value: "5.200 g" },
      { label: "Diamond Center", value: "0.70ct Certified Solitaire" },
    ],
  },
  "noodle-dual-band-ruby-ring": {
    id: "p3",
    slug: "noodle-dual-band-ruby-ring",
    name: "Noodle Dual-Band Ruby & Diamond Ring",
    category: "rings",
    metal: "Rose Gold",
    purity: "18K",
    netWeightGrams: 3.0,
    grossWeightGrams: 3.6,
    diamondValue: 62000,
    makingRate: 1200,
    priceTotal: 170000,
    images: [
      "/media/products/prod-3.jpg",
      "/media/products/prod-4.jpg",
      "/media/editorial/mid-left.jpg",
      "/media/editorial/hero-right.jpg",
    ],
    description:
      "Ultra-fine double-arch silhouette in warm 18K rose gold accented with pigeon blood natural rubies and a row of micro-pavé diamonds.",
    details: [
      { label: "Material", value: "18K Rose Gold" },
      { label: "Gemstones", value: "Natural Rubies & Pavé Diamonds" },
      { label: "Net Weight", value: "3.000 g" },
      { label: "Gross Weight", value: "3.600 g" },
    ],
  },
  "noodle-u-platinum-sculptural-ring": {
    id: "p4",
    slug: "noodle-u-platinum-sculptural-ring",
    name: "Noodle U-Platinum Sculptural Diamond Ring",
    category: "rings",
    metal: "Silver & Platinum",
    purity: "925 / Plat",
    netWeightGrams: 5.2,
    grossWeightGrams: 5.8,
    diamondValue: 75000,
    makingRate: 1300,
    priceTotal: 195000,
    images: [
      "/media/products/prod-4.jpg",
      "/media/products/prod-7.jpg",
      "/media/editorial/mid-left.jpg",
      "/media/editorial/hero-left.jpg",
    ],
    description:
      "Sculptural double-twist loop band forged in solid platinum-coated 925 silver, illuminated with diagonal pave-set white diamonds.",
    details: [
      { label: "Material", value: "Platinum & 925 Sterling Silver" },
      { label: "Net Weight", value: "5.200 g" },
      { label: "Gross Weight", value: "5.800 g" },
    ],
  },
  "diamond-solitaire-ring": {
    id: "p9",
    slug: "diamond-solitaire-ring",
    name: "Imperial Diamond Solitaire Heritage Ring",
    category: "rings",
    metal: "Yellow Gold",
    purity: "18K",
    netWeightGrams: 3.0,
    grossWeightGrams: 3.5,
    diamondValue: 13800,
    makingRate: 1100,
    priceTotal: 36719.5,
    images: [
      "/media/products/prod-2.jpg",
      "/media/products/prod-1.jpg",
      "/media/editorial/mid-left.jpg",
      "/media/editorial/hero-left.jpg",
    ],
    description:
      "Handcrafted 18K yellow gold diamond ring. Net weight 3.0g gold, gross weight 3.5g, featuring an authenticated 0.230ct diamond with locked transparent pricing formula.",
    details: [
      { label: "Material", value: "18K Yellow Gold" },
      { label: "Net Gold Weight", value: "3.000 g" },
      { label: "Gross Weight", value: "3.500 g" },
      { label: "Diamond Value", value: "₹13,800" },
    ],
  },
};

// Fallback for any unknown slug
function getProductBySlug(slug: string): ProductDetailData {
  if (PRODUCT_DATABASE[slug]) {
    return PRODUCT_DATABASE[slug];
  }

  return {
    id: slug,
    slug: slug,
    name: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    category: "rings",
    metal: "Yellow Gold",
    purity: "18K",
    netWeightGrams: 3.5,
    grossWeightGrams: 4.2,
    diamondValue: 85000,
    makingRate: 1200,
    priceTotal: 215000,
    images: [
      "/media/products/prod-1.jpg",
      "/media/products/prod-2.jpg",
      "/media/editorial/mid-left.jpg",
      "/media/editorial/hero-left.jpg",
    ],
    description:
      "Masterpiece creation in solid gold and certified diamonds, crafted with live metal rate transparency and BIS hallmark authentication.",
    details: [
      { label: "Metal", value: "18K Gold" },
      { label: "Net Weight", value: "3.500 g" },
      { label: "Gross Weight", value: "4.200 g" },
    ],
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return {
    title: `${product.name} — Shree Rani Gehna`,
    description: product.description,
  };
}

const RELATED_ITEMS: EditorialProductItem[] = [
  {
    id: "r1",
    name: "Noodle Dual-Band Ruby Ring",
    slug: "noodle-dual-band-ruby-ring",
    category: "rings",
    purity: "18K",
    metal: "Rose Gold",
    price: 170000,
    imageSrc: "/media/products/prod-3.jpg",
    alt: "Noodle Dual-Band Ruby Ring",
  },
  {
    id: "r2",
    name: "Noodle U-Platinum Ring",
    slug: "noodle-u-platinum-sculptural-ring",
    category: "rings",
    purity: "925 Plat",
    metal: "Silver & Platinum",
    price: 195000,
    imageSrc: "/media/products/prod-4.jpg",
    alt: "Noodle U-Platinum Ring",
  },
  {
    id: "r3",
    name: "Noodle High Cocktail Ring",
    slug: "puffy-twisted-sapphire-ring",
    category: "rings",
    purity: "18K",
    metal: "Yellow Gold",
    price: 345000,
    imageSrc: "/media/products/prod-5.jpg",
    alt: "Noodle High Cocktail Ring",
  },
  {
    id: "r4",
    name: "Noodle Low Diamond Band",
    slug: "petaled-cut-out-solitaire-ring",
    category: "rings",
    purity: "18K",
    metal: "Yellow Gold",
    price: 210000,
    imageSrc: "/media/products/prod-6.jpg",
    alt: "Noodle Low Diamond Band",
  },
];

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  return (
    <div className="w-full bg-[#FAF8F5]">
      {/* Product Detail Interactive View */}
      <ProductDetailView product={product} />

      {/* Related Masterpieces Section (4-column hairline grid) */}
      <div className="w-full bg-[#FAF8F5]">
        <div className="px-5 sm:px-10 lg:px-12 py-8 border-b border-black/15">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C857B] font-semibold block">
            CURATED PAIRINGS
          </span>
          <h2
            className="text-2xl sm:text-3xl font-normal italic tracking-wide text-[#1A1816] mt-1 font-serif"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Related Masterpieces
          </h2>
        </div>

        <EditorialProductGrid items={RELATED_ITEMS} />
      </div>
    </div>
  );
}
