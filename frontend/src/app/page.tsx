import LaxmiHeroScroll from "@/components/home/LaxmiHeroScroll";
import EditorialProductGrid, {
  type EditorialProductItem,
} from "@/components/home/EditorialProductGrid";
import EditorialMidSplit from "@/components/home/EditorialMidSplit";
import { getProducts, BackendUnreachable } from "@/lib/api";

const PRODUCT_ROW_1: EditorialProductItem[] = [
  {
    id: "p1",
    name: "Puffy Twisted Sapphire Ring",
    slug: "puffy-twisted-sapphire-ring",
    category: "rings",
    purity: "18K",
    metal: "Yellow Gold",
    price: 235000,
    imageSrc: "/media/products/prod-1.jpg",
    alt: "Puffy Twisted Sapphire and Diamond 18K Gold Ring",
    tag: "Icon",
  },
  {
    id: "p2",
    name: "Petaled Cut-Out Solitaire",
    slug: "petaled-cut-out-solitaire-ring",
    category: "rings",
    purity: "18K",
    metal: "Yellow Gold",
    price: 285000,
    imageSrc: "/media/products/prod-2.jpg",
    alt: "Petaled Cut-Out Architectural Solitaire Ring",
    tag: "High Jewellery",
  },
  {
    id: "p3",
    name: "Noodle Dual-Band Ruby Ring",
    slug: "noodle-dual-band-ruby-ring",
    category: "rings",
    purity: "18K",
    metal: "Rose Gold",
    price: 170000,
    imageSrc: "/media/products/prod-3.jpg",
    alt: "Noodle Dual-Band Ruby and Diamond Pavé Ring",
    tag: "New",
  },
  {
    id: "p4",
    name: "Noodle U-Platinum Ring",
    slug: "noodle-u-platinum-sculptural-ring",
    category: "rings",
    purity: "925 Plat",
    metal: "Silver & Platinum",
    price: 195000,
    imageSrc: "/media/products/prod-4.jpg",
    alt: "Noodle U-Platinum Sculptural Diamond Ring",
    tag: "Platinum Set",
  },
];

const PRODUCT_ROW_2: EditorialProductItem[] = [
  {
    id: "p5",
    name: "Noodle High Cocktail Ring",
    slug: "puffy-twisted-sapphire-ring",
    category: "rings",
    purity: "18K",
    metal: "Yellow Gold",
    price: 345000,
    imageSrc: "/media/products/prod-5.jpg",
    alt: "Noodle High Architectural Black Enamel & Diamond Cocktail Ring",
    tag: "Masterpiece",
  },
  {
    id: "p6",
    name: "Noodle Low Diamond Band",
    slug: "petaled-cut-out-solitaire-ring",
    category: "rings",
    purity: "18K",
    metal: "Yellow Gold",
    price: 210000,
    imageSrc: "/media/products/prod-6.jpg",
    alt: "Noodle Low Flush Onyx & Baguette Diamond Band",
  },
  {
    id: "p7",
    name: "Noodle Platinum Loop Ring",
    slug: "noodle-u-platinum-sculptural-ring",
    category: "rings",
    purity: "925 Plat",
    metal: "Platinum",
    price: 198000,
    imageSrc: "/media/products/prod-7.jpg",
    alt: "Noodle Platinum Sculptural Diamond Loop Ring",
    tag: "New",
  },
  {
    id: "p8",
    name: "Noodle Low Open Bangle Ring",
    slug: "noodle-dual-band-ruby-ring",
    category: "rings",
    purity: "18K",
    metal: "Champagne Gold",
    price: 225000,
    imageSrc: "/media/products/prod-8.jpg",
    alt: "Noodle Low Open Loop Champagne Gold Ring",
    tag: "Signature",
  },
];

export default async function HomePage() {
  let dynamicRow1 = [...PRODUCT_ROW_1];
  let dynamicRow2 = [...PRODUCT_ROW_2];

  try {
    const backendProducts = await getProducts({ limit: "10" });
    if (backendProducts && backendProducts.items && backendProducts.items.length > 0) {
      const firstLivePrice = backendProducts.items[0]?.price?.total;
      if (firstLivePrice) {
        dynamicRow1[0] = {
          ...dynamicRow1[0],
          price: Math.round(firstLivePrice * 6.4),
        };
      }
    }
  } catch (error) {
    if (!(error instanceof BackendUnreachable)) {
      console.error("Non-critical backend check error:", error);
    }
  }

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1A1816] selection:bg-[#9E8056] selection:text-white">
      {/* 1. Full Screen Scroll-to-Animate Hero with laxmihero.mp4 */}
      <LaxmiHeroScroll videoSrc="/media/hero/laxmihero.mp4" scrollVh={240} />

      {/* 2. Product Row 1: 4-Column Hairline Editorial Matrix */}
      <EditorialProductGrid items={dynamicRow1} />

      {/* 3. Middle Section: Split 2-Column Feature Banners */}
      <EditorialMidSplit />

      {/* 4. Product Row 2: 4-Column Hairline Editorial Matrix */}
      <EditorialProductGrid items={dynamicRow2} />
    </div>
  );
}
