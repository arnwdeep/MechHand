"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatGrams, formatINR, titleCase } from "@/lib/format";
import JewelIllustration from "@/components/JewelIllustration";

type Props = {
  videoSrc?: string;
  products: Product[];
};

export default function HandJewellerySection({
  videoSrc = "/media/hero/hand-video.mp4",
  products = [],
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter 3-4 hand items (bangles, rings, bracelets, etc.)
  const handItems = products.filter((p) => {
    const cat = (p.category || "").toLowerCase();
    const slug = p.slug.toLowerCase();
    return (
      cat.includes("ring") ||
      cat.includes("bangle") ||
      cat.includes("kamarbandh") ||
      cat.includes("anklet") ||
      slug.includes("ring") ||
      slug.includes("bangle")
    );
  }).slice(0, 4);

  // Fallback to available products if not enough match
  const displayItems = handItems.length > 0 ? handItems : products.slice(0, 4);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      if (video.readyState >= 2) {
        setVideoReady(true);
      }
    }

    let rafId: number;

    function tick() {
      const vid = videoRef.current;
      const section = sectionRef.current;

      if (
        vid &&
        section &&
        vid.duration &&
        Number.isFinite(vid.duration) &&
        vid.duration > 0
      ) {
        const rect = section.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const p = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
        const maxTime = vid.duration - 0.05;
        const targetTime = Math.min(maxTime, Math.max(0, p * maxTime));

        const diff = targetTime - vid.currentTime;
        if (Math.abs(diff) > 0.005) {
          vid.currentTime += diff * 0.3;
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  const nextSlide = () => {
    if (displayItems.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % displayItems.length);
  };

  const prevSlide = () => {
    if (displayItems.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-white border-t border-line"
      style={{ height: "180vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side: Hand Scroll Video */}
        <div className="relative w-full lg:w-1/2 h-1/2 lg:h-full bg-cream/30 overflow-hidden border-b lg:border-b-0 lg:border-r border-line">
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            muted
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
            onLoadedMetadata={() => setVideoReady(true)}
            onCanPlay={() => setVideoReady(true)}
            className="absolute inset-0 w-full h-full object-cover object-left"
            style={{
              opacity: videoReady ? 1 : 0.8,
              transition: "opacity 0.4s ease",
              transform: "translateZ(0)",
              willChange: "transform",
            }}
          />

          {/* Overlay Badge */}
          <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur px-3.5 py-1.5 rounded-full border border-line shadow-xs">
            <span className="eyebrow text-gold">Scroll Interactive</span>
          </div>
        </div>

        {/* Right Side: Warm Greige BG with Hand Products Carousel */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-[#EBE8E3] flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-8 bg-gold" />
              <p className="eyebrow text-gold uppercase tracking-[0.2em]">HANDCRAFTED HERITAGE</p>
            </div>
            <h2 className="display text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight">
              Bangles &amp; Diamond Rings
            </h2>
            <p className="text-muted text-sm sm:text-base mt-2 max-w-md leading-relaxed">
              Explore royal hand ornaments designed with fine Nakshi carvings and certified diamonds.
            </p>
          </div>

          {/* Carousel Body */}
          <div className="my-auto py-4 sm:py-6">
            {displayItems.length > 0 && (
              <div className="relative bg-[#F4F1EA] border border-line/60 rounded-xl p-5 sm:p-7 shadow-xs">
                {/* Product Card Content */}
                {(() => {
                  const product = displayItems[activeIndex];
                  if (!product) return null;
                  const madeToOrder = product.type === "made_to_order";
                  return (
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-xl overflow-hidden bg-white border border-line p-2">
                        <JewelIllustration category={product.category} className="w-full h-full" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <span className="eyebrow text-gold uppercase tracking-wider text-xs">
                          {titleCase(product.metal)} {product.purity}
                        </span>
                        <h3 className="display text-xl sm:text-2xl mt-1 text-ink font-normal">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted mt-1">
                          Gross Weight: {formatGrams(product.gross_weight_grams)}
                        </p>

                        <div className="mt-3 pt-3 border-t border-line/70">
                          {product.price ? (
                            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                              <span className="display text-2xl text-ink font-semibold tabular">
                                {formatINR(product.price.total!)}
                              </span>
                              <span className="text-[11px] text-muted">
                                {madeToOrder ? "Indicative" : "Incl. 3% GST"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-warn font-medium">Price on request</span>
                          )}
                        </div>

                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-block mt-4 bg-ink text-white px-5 py-2.5 rounded-full text-xs font-medium hover:bg-gold transition-colors"
                        >
                          View Details &amp; Breakup →
                        </Link>
                      </div>
                    </div>
                  );
                })()}

                {/* Carousel Controls */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-line/60">
                  <div className="flex items-center gap-2">
                    {displayItems.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === activeIndex ? "w-6 bg-gold" : "w-2 bg-line"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevSlide}
                      className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink hover:bg-gold hover:text-white transition-colors"
                      aria-label="Previous hand item"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextSlide}
                      className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink hover:bg-gold hover:text-white transition-colors"
                      aria-label="Next hand item"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Show All Link in Small / Compact Format */}
          <div className="pt-4 border-t border-line/50 flex items-center justify-between">
            <span className="text-xs text-muted">
              Showing {activeIndex + 1} of {displayItems.length} featured items
            </span>
            <Link
              href="/products"
              className="text-xs font-semibold text-gold hover:text-ink transition-colors uppercase tracking-wider underline underline-offset-4"
            >
              Show all options →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
