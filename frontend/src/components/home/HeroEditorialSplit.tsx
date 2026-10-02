"use client";

import Link from "next/link";
import Image from "next/image";

export default function HeroEditorialSplit() {
  return (
    <section className="w-full border-b border-black/15 bg-[#F9F7F3] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full">
        {/* Left Column: Model Editorial with Cursive & Sans Overlay */}
        <div className="relative group border-b md:border-b-0 md:border-r border-black/15 min-h-[560px] sm:min-h-[680px] lg:min-h-[820px] flex items-end overflow-hidden">
          <Image
            src="/media/editorial/hero-left.jpg"
            alt="Shree Rani Gehna Haute Joaillerie Campaign"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-103"
          />
          {/* Subtle gradient vignette at the bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

          {/* Bottom Left Overlay Text (Exact Reike Nen Aesthetic: "From Seoul with Love" -> "From Jaipur with Love") */}
          <div className="relative z-10 p-6 sm:p-10 text-white select-none">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-normal italic tracking-wide text-white drop-shadow-md mb-2 font-serif"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                textShadow: "0 2px 12px rgba(0,0,0,0.4)",
              }}
            >
              From Jaipur with Love
            </h1>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.22em] font-medium text-white/95 hover:text-white transition-colors group/link"
            >
              <span>Shop All New &mdash; Spring/Summer 26</span>
              <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* Right Column: Vibrant Complementary High-Fashion Editorial */}
        <div className="relative group min-h-[560px] sm:min-h-[680px] lg:min-h-[820px] flex items-end overflow-hidden">
          <Image
            src="/media/editorial/hero-right.jpg"
            alt="Shree Rani Gehna Fine Jewellery Styling"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-103"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Bottom Right Tag */}
          <div className="relative z-10 p-6 sm:p-10 text-white w-full flex justify-end items-end">
            <Link
              href="/products?category=necklaces"
              className="text-xs uppercase tracking-[0.22em] font-medium text-white/90 hover:text-white transition-colors"
            >
              Haute Joaillerie Atelier &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
