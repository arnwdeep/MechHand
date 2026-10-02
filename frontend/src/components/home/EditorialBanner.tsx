import Link from "next/link";
import JewelIllustration from "@/components/JewelIllustration";

export default function EditorialBanner() {
  return (
    <section className="bg-[#EBE8E3] border-t border-line py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-5 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
        {/* Left Editorial Card: Heritage Motif */}
        <div className="relative aspect-4/5 md:aspect-1/1 bg-[#DFD9CE] rounded-xl overflow-hidden flex items-center justify-center group">
          <div className="absolute inset-0 bg-black/25 z-10 transition-opacity duration-500 group-hover:bg-black/35" />
          
          {/* Background Illustration / Art */}
          <div className="w-4/5 h-4/5 flex items-center justify-center opacity-85 group-hover:scale-105 transition-transform duration-700">
            <JewelIllustration category="necklaces" className="w-full h-full text-white" />
          </div>

          {/* Centered Overlay Text matching KLUR image */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-white/80 font-medium mb-3">
              MAISON FONDÉE 1974
            </p>
            <h3 className="display text-2xl sm:text-4xl text-white font-normal uppercase tracking-[0.12em] max-w-xs leading-snug">
              CENTURY-OLD CRAFTSMANSHIP &amp; ROYAL HERITAGE
            </h3>
            <Link
              href="/products"
              className="mt-6 text-xs uppercase tracking-[0.2em] text-white border-b border-white/60 hover:border-white pb-1 transition-colors"
            >
              Explore Heritage Craft →
            </Link>
          </div>
        </div>

        {/* Right Editorial Card: Atelier Lifestyle */}
        <div className="relative aspect-4/5 md:aspect-1/1 bg-[#F4F1EA] rounded-xl overflow-hidden flex flex-col justify-end p-8 sm:p-12 border border-line/60">
          <div className="absolute top-8 left-8 z-10">
            <span className="eyebrow text-gold uppercase tracking-[0.2em]">ATELIER ARCHIVE</span>
          </div>

          <div className="relative z-10 max-w-md">
            <h3 className="display text-3xl sm:text-4xl text-ink font-normal leading-tight">
              Live Rate Transparency
            </h3>
            <p className="text-muted text-sm sm:text-base mt-3 leading-relaxed">
              Every creation is priced in real time based on the day&apos;s metal rates, offering complete breakups for gold net weight, making labor, and certified diamonds.
            </p>
            <Link
              href="/products"
              className="inline-block mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-ink border-b border-ink/40 hover:border-ink pb-1 transition-colors"
            >
              View Live Pricing Breakdown →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
