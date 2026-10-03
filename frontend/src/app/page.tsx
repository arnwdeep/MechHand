import HandHeroVideo from "@/components/home/HandHeroVideo";
import Hand3DCarousel from "@/components/home/Hand3DCarousel";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* 01. Full Screen Hand Hero - Plays Once & Freezes on Last Frame with Hand2 Liquid Reveal */}
      <HandHeroVideo
        video1Src="/media/hero/hand-hero.mp4"
        video2Src="/media/hero/hand2-hero.mp4"
      />

      {/* Product Description Section - Exact Unboxed Swiss Editorial Tabular Typography Layout */}
      <section
        id="categories"
        className="relative w-full bg-[#090D16] border-t border-white/10 py-20 sm:py-28 px-6 sm:px-12 md:px-16 lg:px-24 text-white"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        <div className="max-w-3xl mx-auto space-y-10 sm:space-y-12">
          {/* Top Title Line */}
          <div className="text-center">
            <h2 className="text-[13px] sm:text-[15px] md:text-[16px] uppercase tracking-[0.25em] font-medium text-white">
              MECHHAND
            </h2>
          </div>

          {/* Editorial Key-Value Tabular Block (Right-aligned keys, Left-aligned values with slashes) */}
          <div className="text-[11px] sm:text-[12.5px] md:text-[13px] leading-[1.8] tracking-[0.12em] uppercase font-normal text-white/90">
            {/* ID */}
            <div className="grid grid-cols-12 gap-x-4 sm:gap-x-6 py-1">
              <div className="col-span-4 sm:col-span-3 text-right text-white/50 font-normal">
                ID
              </div>
              <div className="col-span-8 sm:col-span-9 text-left font-mono text-white">
                26-MH
              </div>
            </div>

            {/* DEPARTMENT */}
            <div className="grid grid-cols-12 gap-x-4 sm:gap-x-6 py-1">
              <div className="col-span-4 sm:col-span-3 text-right text-white/50 font-normal">
                DEPARTMENT
              </div>
              <div className="col-span-8 sm:col-span-9 text-left text-white/90">
                / CYBERNETIC KINETICS &ndash;
              </div>
            </div>

            {/* TYPE */}
            <div className="grid grid-cols-12 gap-x-4 sm:gap-x-6 py-1">
              <div className="col-span-4 sm:col-span-3 text-right text-white/50 font-normal">
                TYPE
              </div>
              <div className="col-span-8 sm:col-span-9 text-left text-white/90 space-y-0.5">
                <div>
                  BIO-ARTICULATION <span className="text-white/40">/</span> TITANIUM ARMOR <span className="text-white/40">/</span> LIQUID CHROME <span className="text-white/40">/</span>
                </div>
                <div>
                  METEORIC INLAY <span className="text-white/40">/</span> SYNTHETIC DERMIS <span className="text-white/40">/</span>
                </div>
              </div>
            </div>

            {/* Space separator */}
            <div className="h-4 sm:h-6" />

            {/* MATERIEL */}
            <div className="grid grid-cols-12 gap-x-4 sm:gap-x-6 py-1">
              <div className="col-span-4 sm:col-span-3 text-right text-white/50 font-normal">
                MATERIEL
              </div>
              <div className="col-span-8 sm:col-span-9 text-left text-white/90 space-y-0.5">
                <div>
                  CAST TITANIUM ALLOY <span className="text-white/40">/</span> ELECTRO-ACTIVE POLYMER <span className="text-white/40">/</span>
                </div>
                <div>
                  MICRON-MACHINED RIGGING <span className="text-white/40">/</span> HIGH-POLISH LIQUID MIRROR <span className="text-white/40">/</span>
                </div>
              </div>
            </div>

            {/* Space separator */}
            <div className="h-4 sm:h-6" />

            {/* HARDWARE */}
            <div className="grid grid-cols-12 gap-x-4 sm:gap-x-6 py-1">
              <div className="col-span-4 sm:col-span-3 text-right text-white/50 font-normal">
                HARDWARE
              </div>
              <div className="col-span-8 sm:col-span-9 text-left text-white/90 space-y-0.5">
                <div>
                  01 ARTICULATED GAUNTLET <span className="text-white/40">/</span> 02 EXOSKELETON RING SET <span className="text-white/40">/</span>
                </div>
                <div>
                  03 RACING UNDERLAYER <span className="text-white/40">/</span> 04 MODULAR WRIST LOCK <span className="text-white/40">/</span>
                </div>
              </div>
            </div>

            {/* Space separator */}
            <div className="h-4 sm:h-6" />

            {/* LOCATION / ALLOCATION */}
            <div className="grid grid-cols-12 gap-x-4 sm:gap-x-6 py-1">
              <div className="col-span-4 sm:col-span-3 text-right text-white/50 font-normal">
                STOCKISTS
              </div>
              <div className="col-span-8 sm:col-span-9 text-left text-white/90">
                DOVER STREET MARKET (LDN / GNZ / NYC) <span className="text-white/40">/</span> DSML E-SHOP <span className="text-white/40">/</span>
              </div>
            </div>

            {/* Location Code */}
            <div className="grid grid-cols-12 gap-x-4 sm:gap-x-6 py-2">
              <div className="col-span-4 sm:col-span-3 text-right text-white/50 font-normal">
                GLB
              </div>
              <div className="col-span-8 sm:col-span-9 text-left text-white/40 font-mono text-[10px] sm:text-[11px]">
                LIMITED ALLOCATION
              </div>
            </div>
          </div>

          {/* Date Stamp at Bottom Right (Matching Reference) */}
          <div className="text-right pt-4 sm:pt-6">
            <span className="font-mono text-[11px] sm:text-[12px] tracking-[0.2em] text-white/60">
              02.04.26
            </span>
          </div>
        </div>
      </section>

      {/* 02. Interactive 3D Hand Carousel (SSENSE / Balenciaga Style) Under Product Description */}
      <Hand3DCarousel />

      {/* Global Stockist & Release Information Footer */}
      <footer className="w-full bg-[#05070B] border-t border-white/10 py-10 px-6 sm:px-12 md:px-16 lg:px-20 text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.15em] text-white/60">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-white/40 mr-2">STOCKISTS:</span>
            <span className="text-white">DOVER STREET MARKET (LONDON, GINZA, NEW YORK) &amp; DSML E-SHOP</span>
          </div>
          <div className="text-white/40">
            &copy; 2026 MECHHAND &bull; ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}

