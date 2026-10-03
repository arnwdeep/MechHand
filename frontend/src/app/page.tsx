import HandHeroVideo from "@/components/home/HandHeroVideo";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* 01. Full Screen Hand Hero - Plays Once & Freezes on Last Frame with Hand2 Liquid Reveal */}
      <HandHeroVideo
        video1Src="/media/hero/hand-hero.mp4"
        video2Src="/media/hero/hand2-hero.mp4"
      />

      {/* Product Description Section - Matching Hero Blue Tint Background with Small White Helvetica Typography */}
      <section id="categories" className="relative w-full bg-[#090D16] border-t border-white/10 py-16 sm:py-24 px-6 sm:px-12 md:px-16 lg:px-20 text-white">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-white/10 pb-4 gap-2">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/50 font-normal">
              01 // MECHHAND ARCHIVE &amp; SPECIFICATIONS
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/50 font-normal">
              EDITION 2026 // CYBERNETIC CHROME
            </span>
          </div>

          {/* Overview Paragraphs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 text-[10px] sm:text-[11px] md:text-[11.5px] leading-[1.6] tracking-[0.04em] uppercase font-normal text-white/90">
            <div className="md:col-span-6 space-y-4">
              <p className="text-white font-medium text-[11px] sm:text-[12px] tracking-[0.05em]">
                MECHHAND UNVEILS A COLLISION OF CYBERNETIC KINETICS AND HIGH-POLISH LIQUID CHROME ADORNMENTS.
              </p>
              <p className="text-white/70">
                Engineered as an ergonomic extension of the hand, each piece explores biological articulation, modular armor segments, and liquid alloy finishes developed specifically for next-generation wear.
              </p>
            </div>
            <div className="md:col-span-6 space-y-4">
              <p className="text-white/70">
                Every hardware piece is constructed with micron-tolerance machining—from cast titanium alloy hinges to magnetic clasp connectors and tactile ribbed underlayers.
              </p>
              <div className="flex items-center gap-6 pt-2 text-[9px] sm:text-[10px] tracking-[0.15em] text-white/50">
                <span>GLOBAL DROP: APRIL 2, 2026</span>
                <span>LIMITED ALLOCATION</span>
              </div>
            </div>
          </div>

          {/* Product Items Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pt-4">
            {/* Item 01 */}
            <div className="bg-[#0F1626]/90 border border-white/10 rounded-lg p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-cyan-400/40 transition-colors duration-300">
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block">
                  01 / HARDWARE
                </span>
                <h4 className="text-[11px] sm:text-[12px] font-normal uppercase tracking-[0.06em] text-white">
                  MECHHAND ARTICULATED GAUNTLET
                </h4>
                <p className="text-[9.5px] sm:text-[10px] leading-[1.5] tracking-[0.03em] uppercase text-white/70 font-normal">
                  Cast chrome alloy with multi-axis joint articulation. Wraps seamlessly along the metacarpal geometry with magnetic locking tension pins.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between text-[9px] uppercase tracking-[0.1em] text-white/50">
                <span>MATERIAL</span>
                <span>CHROME ALLOY / TITANIUM</span>
              </div>
            </div>

            {/* Item 02 */}
            <div className="bg-[#0F1626]/90 border border-white/10 rounded-lg p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-cyan-400/40 transition-colors duration-300">
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block">
                  02 / HARDWARE
                </span>
                <h4 className="text-[11px] sm:text-[12px] font-normal uppercase tracking-[0.06em] text-white">
                  KINETIC EXOSKELETON RING SET
                </h4>
                <p className="text-[9.5px] sm:text-[10px] leading-[1.5] tracking-[0.03em] uppercase text-white/70 font-normal">
                  Modular articulated finger armor rings. Interlocking kinetic bridges allow full ergonomic flexion while maintaining structural chrome sheen.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between text-[9px] uppercase tracking-[0.1em] text-white/50">
                <span>MATERIAL</span>
                <span>LIQUID MIRROR CHROME</span>
              </div>
            </div>

            {/* Item 03 */}
            <div className="bg-[#0F1626]/90 border border-white/10 rounded-lg p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-cyan-400/40 transition-colors duration-300">
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block">
                  03 / GARMENT
                </span>
                <h4 className="text-[11px] sm:text-[12px] font-normal uppercase tracking-[0.06em] text-white">
                  CYBERNETIC RACING UNDERLAYER
                </h4>
                <p className="text-[9.5px] sm:text-[10px] leading-[1.5] tracking-[0.03em] uppercase text-white/70 font-normal">
                  High-tenacity metallic woven polymer blend. Contoured thumb-loop cuff integration designed specifically to anchor Mechhand hardware.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between text-[9px] uppercase tracking-[0.1em] text-white/50">
                <span>MATERIAL</span>
                <span>METALLIC POLYMER</span>
              </div>
            </div>

            {/* Item 04 */}
            <div className="bg-[#0F1626]/90 border border-white/10 rounded-lg p-5 sm:p-6 space-y-3 flex flex-col justify-between hover:border-cyan-400/40 transition-colors duration-300">
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 block">
                  04 / ACCESSORY
                </span>
                <h4 className="text-[11px] sm:text-[12px] font-normal uppercase tracking-[0.06em] text-white">
                  MODULAR ARMOR WRIST LOCK
                </h4>
                <p className="text-[9.5px] sm:text-[10px] leading-[1.5] tracking-[0.03em] uppercase text-white/70 font-normal">
                  Water-resistant ballistic strap with laser-etched cast chrome buckle and quick-release spring mechanism.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between text-[9px] uppercase tracking-[0.1em] text-white/50">
                <span>MATERIAL</span>
                <span>BALLISTIC / CHROME</span>
              </div>
            </div>
          </div>

          {/* Stockist & Release Information Footer */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.15em] text-white/60">
            <div>
              <span className="text-white/40 mr-2">STOCKISTS:</span>
              <span className="text-white">DOVER STREET MARKET (LONDON, GINZA, NEW YORK) &amp; DSML E-SHOP</span>
            </div>
            <div className="text-white/40">
              &copy; 2026 MECHHAND &bull; ALL RIGHTS RESERVED
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

