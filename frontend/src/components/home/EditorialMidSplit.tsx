"use client";

import Image from "next/image";
import Link from "next/link";

export default function EditorialMidSplit() {
  return (
    <section className="w-full bg-[#FAF8F5] border-b border-black/15 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full">
        {/* Left Editorial Feature: Model & Fine Jewellery Styling */}
        <Link
          href="/products?category=rings"
          className="group relative block min-h-[520px] sm:min-h-[640px] lg:min-h-[760px] border-b md:border-b-0 md:border-r border-black/15 overflow-hidden"
        >
          <Image
            src="/media/editorial/mid-left.jpg"
            alt="Fine Jewellery & Iconic Rings"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-104"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Bottom Left Minimal Overlay (Matching Reference "Footwear - All Icons") */}
          <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 z-10 text-white">
            <span className="text-xs sm:text-sm uppercase tracking-[0.22em] font-medium text-white/95 group-hover:underline underline-offset-4">
              Fine Jewellery &mdash; All Icons &rarr;
            </span>
          </div>
        </Link>

        {/* Right Editorial Feature: Circular Ornaments & Royal Blue Drape */}
        <Link
          href="/products?category=necklaces"
          className="group relative block min-h-[520px] sm:min-h-[640px] lg:min-h-[760px] overflow-hidden"
        >
          <Image
            src="/media/editorial/mid-right.jpg"
            alt="Royal Heirlooms & Amulets"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-104"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Bottom Left Minimal Overlay (Matching Reference "Bags - All Icons") */}
          <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 z-10 text-white">
            <span className="text-xs sm:text-sm uppercase tracking-[0.22em] font-medium text-white/95 group-hover:underline underline-offset-4">
              Royal Heirlooms & Ornaments &mdash; All Icons &rarr;
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
