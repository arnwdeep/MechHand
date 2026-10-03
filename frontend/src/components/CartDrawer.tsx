"use client";

import Image from "next/image";
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0F1014] text-white shadow-2xl flex flex-col justify-between border-l border-white/15">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2
                className="text-xl font-normal italic tracking-wide font-serif text-white"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Shopping Bag
              </h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mt-0.5">
                {items.length} {items.length === 1 ? "Piece" : "Pieces"} &bull; Insured Delivery
              </p>
            </div>
            <button
              onClick={closeDrawer}
              className="text-xs uppercase tracking-widest text-white/60 hover:text-white p-2 cursor-pointer transition-colors"
            >
              Close ✕
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-white/10">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="text-sm text-white/60">Your shopping bag is empty.</p>
                <button
                  onClick={closeDrawer}
                  className="inline-block text-xs uppercase tracking-[0.2em] font-medium border-b border-white pb-1 text-white hover:opacity-70 cursor-pointer"
                >
                  Return to Sanctuary &rarr;
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={`${item.id}-${item.size}-${index}`} className="pt-6 first:pt-0 flex gap-4">
                  <div className="relative w-20 h-20 bg-white/5 border border-white/10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center p-1">
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
                        <h3 className="text-xs font-medium tracking-wide leading-tight text-white">
                          {item.name}
                        </h3>
                        <span className="text-xs font-semibold tabular shrink-0 text-white">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/60 uppercase tracking-wider mt-1">
                        {item.purity} {item.metal} {item.size && `• Size ${item.size}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <div className="flex items-center border border-white/20 rounded-md bg-white/5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                          className="px-2.5 py-0.5 hover:bg-white/10 text-white/80 cursor-pointer"
                        >
                          &minus;
                        </button>
                        <span className="px-2 text-[11px] tabular text-white font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                          className="px-2.5 py-0.5 hover:bg-white/10 text-white/80 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="text-[10px] uppercase tracking-wider text-white/50 hover:text-white underline cursor-pointer"
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
            <div className="p-6 border-t border-white/10 bg-[#08090C] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span className="tabular text-white">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>GST (3% Standard)</span>
                  <span className="text-[10px] text-emerald-400 font-medium uppercase">Included</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Insured Express Shipping</span>
                  <span className="text-[10px] text-emerald-400 font-medium uppercase">Complimentary</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-white/10 text-white">
                  <span>Grand Total</span>
                  <span className="tabular">{formatINR(subtotal)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    alert("Order request received. Atelier concierge will connect shortly.");
                    closeDrawer();
                  }}
                  className="block w-full text-center bg-gradient-to-r from-zinc-100 via-slate-200 to-zinc-300 text-black py-3.5 text-xs uppercase tracking-[0.22em] font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(255,255,255,0.2)] rounded-lg cursor-pointer"
                >
                  Proceed to Checkout &rarr;
                </button>

                <p className="text-[10px] text-center text-white/50 tracking-wide">
                  &bull; 100% Certified Hallmark &bull; Direct Atelier Insured Delivery
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
