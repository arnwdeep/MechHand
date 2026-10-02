import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Discover — The Maison & Atelier Heritage | Shree Rani Gehna",
  description:
    "Founded in 1914, Shree Rani Gehna is an Indian family jewellery maison creating high jewellery with live metal rate transparency and master nakshi craftsmanship.",
};

export default function DiscoverPage() {
  return (
    <div className="w-full bg-[#FAF8F5] text-[#1A1816] pt-24 sm:pt-28 pb-24">
      {/* Editorial Title Banner */}
      <div className="px-5 sm:px-10 lg:px-12 pb-12 border-b border-black/15">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C857B] font-semibold block">
          MAISON FONDÉE 1914 &bull; JAIPUR &bull; HAUTE JOAILLERIE
        </span>
        <h1
          className="text-4xl sm:text-6xl lg:text-7xl font-normal italic tracking-wide text-[#1A1816] mt-3 font-serif"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Artisan Heritage &amp; Pure Transparency
        </h1>
        <p className="text-sm sm:text-base text-[#5B564F] max-w-2xl mt-4 leading-relaxed">
          For over a century, Shree Rani Gehna has shaped the landscape of Indian high jewellery. We believe luxury is heightened by absolute honesty: live bullion rates, transparent gram weights, and peerless craftsmanship.
        </p>
      </div>

      {/* Split Editorial Story 1: The Live Pricing Revolution */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full border-b border-black/15">
        <div className="relative min-h-[460px] sm:min-h-[580px] border-b md:border-b-0 md:border-r border-black/15 overflow-hidden">
          <Image
            src="/media/editorial/hero-left.jpg"
            alt="Crafting High Jewellery in Jaipur"
            fill
            className="object-cover"
          />
        </div>

        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6 bg-[#FAF8F5]">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C857B] font-semibold">
            CHAPTER I &bull; THE FORMULA
          </span>
          <h2
            className="text-3xl sm:text-4xl font-normal italic text-[#1A1816] font-serif"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            No Stored Prices. Every Rupee Proven.
          </h2>
          <p className="text-xs sm:text-sm text-[#5B564F] leading-relaxed">
            Conventional jewellery retailers embed speculative markups into fixed price tags. At Shree Rani Gehna, no product price is ever fixed. When pure bullion gold moves on the international market, our pricing engine calculates the exact piece value on the fly:
          </p>

          <div className="p-4 bg-[#F4F1EA] border border-black/10 text-xs space-y-1.5 font-mono">
            <p className="text-[#1A1816] font-semibold">Live Transparent Equation:</p>
            <p className="text-[#5B564F]">&bull; Net Gold Weight &times; Today&apos;s Exact Bullion Rate</p>
            <p className="text-[#5B564F]">&bull; Certified Natural Diamond Valuation</p>
            <p className="text-[#5B564F]">&bull; Gross Weight Crafting &amp; Making Charges</p>
            <p className="text-[#5B564F]">&bull; 3% Official Indian GST</p>
          </div>
        </div>
      </div>

      {/* Split Editorial Story 2: Craftsmanship & Atelier Legacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full border-b border-black/15">
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6 bg-[#FAF8F5] order-2 md:order-1 border-r border-black/15">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C857B] font-semibold">
            CHAPTER II &bull; ARTISTRY
          </span>
          <h2
            className="text-3xl sm:text-4xl font-normal italic text-[#1A1816] font-serif"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Jaipur Royal Courts to Contemporary Runways
          </h2>
          <p className="text-xs sm:text-sm text-[#5B564F] leading-relaxed">
            Every piece is brought to life in our private Jaipur atelier. Master karigars combine age-old Nakshi hand-embossing with modern CAD micro-pavé pronging to create sculptural jewels that feel weightless yet imperial.
          </p>

          <ul className="space-y-2 text-xs text-[#5B564F]">
            <li className="flex items-center gap-2">
              <span className="text-black font-bold">&bull;</span>
              <span>100% BIS Hallmarked Solid 18K &amp; 22K Gold</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-black font-bold">&bull;</span>
              <span>Conflict-Free Natural Syndicate Polki &amp; Brilliant Diamonds</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-black font-bold">&bull;</span>
              <span>Individual Masterpiece Certificate &amp; Laser Registry</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              href="/products"
              className="inline-block bg-[#1A1816] text-[#FAF8F5] px-7 py-3 text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-colors"
            >
              Explore The Masterpiece Archive &rarr;
            </Link>
          </div>
        </div>

        <div className="relative min-h-[460px] sm:min-h-[580px] order-1 md:order-2 overflow-hidden">
          <Image
            src="/media/editorial/mid-right.jpg"
            alt="Royal Heirlooms and Ornaments"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Private Salon & Bespoke Commission Callout */}
      <div className="px-5 sm:px-10 lg:px-12 py-16 text-center max-w-3xl mx-auto space-y-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C857B] font-semibold block">
          PRIVATE APPOINTMENTS
        </span>
        <h2
          className="text-3xl sm:text-4xl font-normal italic font-serif"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Experience The Private Salon
        </h2>
        <p className="text-xs sm:text-sm text-[#5B564F] leading-relaxed">
          We welcome clients for private viewings and bespoke commissions at our flagship Jaipur atelier and Mumbai salon. Every custom jewel is designed alongside our master goldsmiths.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
          <a
            href="https://wa.me/919829000000?text=Hello%20Atelier,%20I%20would%20like%20to%20book%20a%20private%20salon%20appointment"
            target="_blank"
            rel="noreferrer"
            className="bg-[#2A6E48] text-white px-7 py-3.5 uppercase tracking-[0.18em] font-semibold hover:bg-[#235839] transition-colors"
          >
            Reserve Private Consultation (WhatsApp)
          </a>
          <Link
            href="/products"
            className="border border-black/30 px-7 py-3.5 uppercase tracking-[0.18em] font-semibold hover:bg-black/5 transition-colors"
          >
            View All Pieces
          </Link>
        </div>
      </div>
    </div>
  );
}
