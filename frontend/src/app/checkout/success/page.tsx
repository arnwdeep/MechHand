import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order Confirmed — Shree Rani Gehna",
  description: "Your bespoke jewellery creation order is secured at the locked live bullion rate.",
};

export default function CheckoutSuccessPage() {
  const orderId = "SRG-" + Math.floor(100000 + Math.random() * 900000);
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1A1816] min-h-[80vh] pt-28 pb-24 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-5 sm:px-8">
        <div className="bg-[#F4F1EA] border border-black/15 p-8 sm:p-12 text-center space-y-8 rounded-xs shadow-sm">
          {/* Royal Seal Monogram */}
          <div className="mx-auto w-16 h-16 rounded-full border border-black/20 bg-white flex items-center justify-center text-xl font-serif font-black text-[#1A1816]">
            SRG
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C857B] font-semibold block">
              ATELIER ACQUISITION CONFIRMED
            </span>
            <h1
              className="text-3xl sm:text-4xl font-normal italic tracking-wide text-[#1A1816] mt-2 font-serif"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Thank You for Your Patronage
            </h1>
            <p className="text-xs sm:text-sm text-[#5B564F] max-w-md mx-auto mt-2 leading-relaxed">
              Your order has been officially recorded in our Jaipur ledger at today&apos;s locked bullion rate.
            </p>
          </div>

          {/* Receipt Specs Box */}
          <div className="bg-white/80 border border-black/10 p-6 text-left text-xs space-y-3 font-mono">
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-[#8C857B]">Order Registry ID:</span>
              <span className="font-semibold text-black">{orderId}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-[#8C857B]">Order Date:</span>
              <span>{today}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-[#8C857B]">Hallmark &amp; Diamond Certificate:</span>
              <span className="text-[#2A6E48] font-semibold">BIS 100% Certified / IGI Enclosed</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-[#8C857B]">Transit Status:</span>
              <span>Armoured Vault Despatch (3&ndash;5 Business Days)</span>
            </div>
            <div className="flex justify-between text-sm font-sans font-semibold pt-1 text-black">
              <span>Payment Status:</span>
              <span className="text-[#2A6E48]">Settled &amp; Rate Locked</span>
            </div>
          </div>

          {/* Action Links */}
          <div className="space-y-3 pt-2">
            <Link
              href="/products"
              className="block w-full bg-[#1A1816] text-[#FAF8F5] py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-black transition-colors"
            >
              Continue Exploring The Archive &rarr;
            </Link>

            <a
              href={`https://wa.me/919829000000?text=Hello%20Atelier,%20tracking%20update%20for%20order%20${orderId}`}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center text-[#2A6E48] bg-[#2A6E48]/10 border border-[#2A6E48]/30 py-3 text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#2A6E48]/15 transition-colors"
            >
              Track on WhatsApp Live Concierge
            </a>
          </div>

          <p className="text-[10px] text-[#8C857B] uppercase tracking-wider">
            Official Tax Invoice &bull; GSTIN: 08AAACS1234F1Z5 &bull; Shree Rani Gehna Jewellers Pvt Ltd
          </p>
        </div>
      </div>
    </div>
  );
}
