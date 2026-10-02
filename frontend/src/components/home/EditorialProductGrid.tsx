"use client";

import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";

export interface EditorialProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  purity: string;
  metal: string;
  price: number;
  imageSrc: string;
  alt: string;
  tag?: string;
}

interface EditorialProductGridProps {
  items: EditorialProductItem[];
  className?: string;
}

export default function EditorialProductGrid({
  items,
  className = "",
}: EditorialProductGridProps) {
  return (
    <section className={`w-full bg-[#FAF8F5] border-b border-black/15 ${className}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 w-full">
        {items.map((item, index) => {
          // Calculate right border and bottom border classes for clean 4-column matrix
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
              {/* Optional Tag (e.g. New / Icon) */}
              {item.tag && (
                <span className="absolute top-4 left-4 z-10 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1816]/70 bg-white/70 px-2 py-0.5 rounded-xs backdrop-blur-xs">
                  {item.tag}
                </span>
              )}

              {/* Product Visual Area - Pure Clean Minimal Centered Object */}
              <div className="relative w-full aspect-square flex items-center justify-center my-3 sm:my-6 overflow-hidden">
                <div className="relative w-[85%] h-[85%] transition-transform duration-700 ease-out group-hover:scale-108">
                  <Image
                    src={item.imageSrc}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Metadata Row: Product Name on Left, Price on Right */}
              <div className="w-full pt-3 flex items-baseline justify-between gap-2 border-t border-black/10 text-[#1A1816]">
                <div className="min-w-0 pr-2">
                  <h3 className="text-[11px] sm:text-[12px] font-normal tracking-[0.04em] text-[#1A1816] truncate capitalize group-hover:underline underline-offset-2">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-muted tracking-wide mt-0.5 uppercase hidden sm:block">
                    {item.purity} &bull; {item.metal}
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
    </section>
  );
}
