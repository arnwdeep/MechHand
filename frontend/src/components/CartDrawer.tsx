"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, subtotal } =
    useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] text-[#1A1816] shadow-2xl flex flex-col justify-between border-l border-black/15">
          {/* Header */}
          <div className="p-6 border-b border-black/10 flex items-center justify-between">
            <div>
              <h2
                className="text-xl font-normal italic tracking-wide font-serif"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Atelier Shopping Bag
              </h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C857B] mt-0.5">
                {items.length} {items.length === 1 ? "Piece" : "Pieces"} &bull; Live Rate Protected
              </p>
            </div>
            <button
              onClick={closeDrawer}
              className="text-xs uppercase tracking-widest text-[#5B564F] hover:text-black p-2 cursor-pointer"
            >
              Close ✕
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-black/10">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="text-sm text-muted">Your shopping bag is empty.</p>
                <Link
                  href="/products"
                  onClick={closeDrawer}
                  className="inline-block text-xs uppercase tracking-[0.2em] font-medium border-b border-black pb-1 hover:opacity-60"
                >
                  Explore The Collection &rarr;
                </Link>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={`${item.id}-${item.size}-${index}`} className="pt-6 first:pt-0 flex gap-4">
                  <div className="relative w-20 h-20 bg-white/60 border border-black/10 rounded-xs shrink-0 overflow-hidden flex items-center justify-center p-1">
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-medium tracking-wide leading-tight">
                          {item.name}
                        </h3>
                        <span className="text-xs font-semibold tabular shrink-0">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8C857B] uppercase tracking-wider mt-1">
                        {item.purity} {item.metal} {item.size && `• Size ${item.size}`}
                      </p>
                      {item.engraving && (
                        <p className="text-[10px] text-gold italic mt-0.5">
                          Engraving: &ldquo;{item.engraving}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <div className="flex items-center border border-black/20 rounded-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                          className="px-2 py-0.5 hover:bg-black/5"
                        >
                          &minus;
                        </button>
                        <span className="px-2 text-[11px] tabular">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                          className="px-2 py-0.5 hover:bg-black/5"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="text-[10px] uppercase tracking-wider text-muted hover:text-black underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-black/10 bg-[#F4F1EA] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#5B564F]">
                  <span>Subtotal</span>
                  <span className="tabular">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#5B564F]">
                  <span>GST (3% Indian Standard)</span>
                  <span className="text-[10px] text-[#2A6E48] font-medium uppercase">Included</span>
                </div>
                <div className="flex justify-between text-[#5B564F]">
                  <span>Insured Express Shipping</span>
                  <span className="text-[10px] text-[#2A6E48] font-medium uppercase">Complimentary</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-black/10 text-black">
                  <span>Grand Total</span>
                  <span className="tabular">{formatINR(subtotal)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="block w-full text-center bg-[#1A1816] text-[#FAF8F5] py-3.5 text-xs uppercase tracking-[0.22em] font-medium hover:bg-black transition-colors"
                >
                  Proceed to Checkout &rarr;
                </Link>

                <p className="text-[10px] text-center text-[#8C857B] tracking-wide">
                  &bull; 100% BIS Hallmarked &bull; 7-Day Royal Atelier Exchange
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
