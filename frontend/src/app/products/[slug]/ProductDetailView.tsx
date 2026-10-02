"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart";

export interface ProductDetailData {
  id: string;
  slug: string;
  name: string;
  category: string;
  metal: string;
  purity: string;
  netWeightGrams: number;
  grossWeightGrams: number;
  diamondValue: number;
  makingRate: number;
  priceTotal: number;
  images: string[];
  description: string;
  details: { label: string; value: string }[];
}

export default function ProductDetailView({ product }: { product: ProductDetailData }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("14");
  const [engraving, setEngraving] = useState("");
  const [showPriceBreakup, setShowPriceBreakup] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("composition");

  const { addItem } = useCart();

  // Price Calculation Breakdown
  const metalRatePerGram =
    product.purity === "22K" ? 7745 : product.purity === "18K" ? 6338 : 95;
  const metalValue = Math.round(metalRatePerGram * product.netWeightGrams);
  const makingCharges = Math.round(product.makingRate * product.grossWeightGrams);
  const diamondVal = product.diamondValue;
  const subtotal = metalValue + makingCharges + diamondVal;
  const gst = Math.round(subtotal * 0.03);
  const calculatedTotal = subtotal + gst;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      metal: product.metal,
      purity: product.purity,
      grossWeight: product.grossWeightGrams,
      netWeight: product.netWeightGrams,
      price: product.priceTotal || calculatedTotal,
      size: `${selectedSize} (Indian Standard)`,
      engraving: engraving.trim() || undefined,
      imageSrc: product.images[0],
    });
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Shree Rani Gehna Atelier, I am interested in inquiring about the "${product.name}" (${product.purity} ${product.metal}, Price: ${formatINR(product.priceTotal)}). Could you provide further bespoke consultation?`,
  );

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1A1816] pt-24 sm:pt-28 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="px-5 sm:px-10 lg:px-12 py-4 text-[11px] uppercase tracking-[0.18em] text-[#8C857B] border-b border-black/10">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span className="mx-2">&bull;</span>
        <Link href="/products" className="hover:text-black">
          Collection
        </Link>
        <span className="mx-2">&bull;</span>
        <span className="text-[#1A1816] font-medium">{product.name}</span>
      </div>

      {/* Main Split Product Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full border-b border-black/15">
        {/* Left Column: Image Gallery (Spans 7 cols on desktop) */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-black/15 p-6 sm:p-10 lg:p-14 flex flex-col justify-between">
          {/* Main Focused Visual */}
          <div className="relative w-full aspect-square bg-[#F4F1EA] rounded-xs overflow-hidden flex items-center justify-center p-8 border border-black/10">
            <Image
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain p-6 transition-all duration-500"
            />
          </div>

          {/* Thumbnail Selector Row */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4 mt-6">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative aspect-square bg-[#F4F1EA] border rounded-xs overflow-hidden p-2 transition-all cursor-pointer ${
                  selectedImageIndex === idx
                    ? "border-black ring-1 ring-black"
                    : "border-black/15 hover:border-black/50 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`Angle ${idx + 1}`} fill className="object-contain p-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Buy Panel & Live Price Engine (Spans 5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 space-y-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C857B] font-semibold block">
              {product.purity} {product.metal} &bull; CERTIFIED NATURAL DIAMONDS
            </span>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-normal italic tracking-wide text-[#1A1816] mt-1.5 font-serif"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {product.name}
            </h1>
          </div>

          {/* Live Price Tag & Bullion Badge */}
          <div className="p-4 bg-[#F4F1EA] border border-black/10 rounded-xs space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-normal tabular font-serif text-[#1A1816]">
                {formatINR(product.priceTotal)}
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#2A6E48] font-semibold bg-[#2A6E48]/10 px-2 py-0.5 rounded-xs">
                Live Rate Protected
              </span>
            </div>
            <p className="text-[11px] text-[#5B564F] leading-snug">
              Priced at today&apos;s bullion metal rate with 3% GST included. No hidden margins.
            </p>

            <button
              onClick={() => setShowPriceBreakup(!showPriceBreakup)}
              className="text-[11px] uppercase tracking-wider font-semibold text-black underline underline-offset-2 hover:opacity-70 pt-1 cursor-pointer block"
            >
              {showPriceBreakup ? "Hide Transparent Price Breakup ▲" : "View Live Transparent Price Breakup ▼"}
            </button>
          </div>

          {/* Expandable Price Breakup Table */}
          {showPriceBreakup && (
            <div className="p-4 bg-white/70 border border-black/15 rounded-xs text-xs space-y-2 animate-fadeIn">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C857B] border-b border-black/10 pb-1">
                Artisan Formula Breakdown
              </h4>
              <div className="flex justify-between text-[#5B564F]">
                <span>
                  Gold ({product.purity}) &bull; {product.netWeightGrams}g Net Wt.
                </span>
                <span className="tabular">{formatINR(metalValue)}</span>
              </div>
              {diamondVal > 0 && (
                <div className="flex justify-between text-[#5B564F]">
                  <span>Syndicate Certified Diamonds</span>
                  <span className="tabular">{formatINR(diamondVal)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#5B564F]">
                <span>
                  Crafting / Making &bull; {product.grossWeightGrams}g Gross Wt.
                </span>
                <span className="tabular">{formatINR(makingCharges)}</span>
              </div>
              <div className="flex justify-between text-[#5B564F]">
                <span>GST (3% Indian Standard)</span>
                <span className="tabular">{formatINR(gst)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-black/10 text-black">
                <span>Calculated Total</span>
                <span className="tabular">{formatINR(calculatedTotal)}</span>
              </div>
            </div>
          )}

          {/* Ring / Jewellery Size Selector */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="uppercase tracking-wider font-semibold text-[#1A1816]">
                Select Size (Indian Standard)
              </span>
              <a
                href="#sizing"
                className="text-[11px] text-muted underline hover:text-black uppercase tracking-wider"
              >
                Sizing Guide
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              {["10", "12", "14", "16", "18", "20", "22"].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-11 h-11 text-xs border rounded-xs font-mono transition-all cursor-pointer ${
                    selectedSize === size
                      ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816] font-semibold"
                      : "border-black/20 text-[#1A1816] hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Complimentary Laser Engraving */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#1A1816] block">
              Complimentary Atelier Engraving (Optional)
            </label>
            <input
              type="text"
              maxLength={15}
              value={engraving}
              onChange={(e) => setEngraving(e.target.value)}
              placeholder="e.g. SRG 1914 / Initials (Max 15 chars)"
              className="w-full bg-white/70 border border-black/20 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-black font-mono placeholder:text-muted/60"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#1A1816] text-[#FAF8F5] py-4 text-xs uppercase tracking-[0.22em] font-semibold hover:bg-black transition-colors cursor-pointer"
            >
              Add to Atelier Bag &bull; {formatINR(product.priceTotal)}
            </button>

            <Link
              href="/checkout"
              onClick={handleAddToCart}
              className="block w-full text-center border border-black/40 text-[#1A1816] py-3.5 text-xs uppercase tracking-[0.22em] font-medium hover:bg-black/5 transition-colors"
            >
              Instant Private Checkout &rarr;
            </Link>

            <a
              href={`https://wa.me/919829000000?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center text-[#2A6E48] bg-[#2A6E48]/8 border border-[#2A6E48]/30 py-3 text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#2A6E48]/15 transition-colors"
            >
              Inquire with Salon Concierge (WhatsApp)
            </a>
          </div>

          {/* Assurance / Guarantee Badges */}
          <div className="pt-4 border-t border-black/10 grid grid-cols-2 gap-3 text-[11px] text-[#5B564F]">
            <div className="flex items-center gap-2">
              <span className="text-sm">&check;</span>
              <span>100% BIS Hallmarked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">&check;</span>
              <span>Insured Pan-India Transit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">&check;</span>
              <span>Certified Diamond Report</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">&check;</span>
              <span>7-Day Atelier Exchange</span>
            </div>
          </div>

          {/* Accordion Specs */}
          <div className="border-t border-black/10 pt-4 divide-y divide-black/10">
            <div>
              <button
                onClick={() =>
                  setActiveAccordion(activeAccordion === "composition" ? null : "composition")
                }
                className="w-full py-3 flex justify-between items-center text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                <span>Composition &amp; Technical Weights</span>
                <span>{activeAccordion === "composition" ? "−" : "+"}</span>
              </button>
              {activeAccordion === "composition" && (
                <div className="pb-4 text-xs text-[#5B564F] space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-[#1A1816]">Metal Purity:</strong> {product.purity} Solid{" "}
                    {product.metal}
                  </p>
                  <p>
                    <strong className="text-[#1A1816]">Gross Weight:</strong>{" "}
                    {product.grossWeightGrams} grams
                  </p>
                  <p>
                    <strong className="text-[#1A1816]">Net Gold Weight:</strong>{" "}
                    {product.netWeightGrams} grams
                  </p>
                  <p>
                    <strong className="text-[#1A1816]">Diamond Grade:</strong> Natural Syndicate
                    Polki / VVS-EF Brilliant Diamonds
                  </p>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() =>
                  setActiveAccordion(activeAccordion === "provenance" ? null : "provenance")
                }
                className="w-full py-3 flex justify-between items-center text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                <span>Atelier Provenance &amp; Craftsmanship</span>
                <span>{activeAccordion === "provenance" ? "−" : "+"}</span>
              </button>
              {activeAccordion === "provenance" && (
                <div className="pb-4 text-xs text-[#5B564F] leading-relaxed">
                  Handcrafted by master goldsmiths in Jaipur, Rajasthan using traditional nakshi
                  repose and high-precision modern setting techniques. Every jewel carries the
                  official hallmark and unique laser registry.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
