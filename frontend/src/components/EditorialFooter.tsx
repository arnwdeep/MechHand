"use client";

import { useState } from "react";
import Link from "next/link";

export default function EditorialFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="w-full bg-[#FAF8F5] text-[#1A1816] pt-12 sm:pt-16 pb-8 border-t border-black/15">
      <div className="w-full px-5 sm:px-10 lg:px-12">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-black/15">
          {/* Column 1: Newsletter & Payment Badges (Spans 5 cols on desktop) */}
          <div className="lg:col-span-5 pr-0 lg:pr-8">
            <h2
              className="text-2xl sm:text-3xl font-normal italic tracking-wide text-[#1A1816] mb-2 font-serif"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Newsletter
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#5B564F] leading-relaxed mb-5 max-w-sm">
              Be the first to know about our special creations, private salon launches, and daily gold rate updates.
            </p>

            {subscribed ? (
              <p className="text-xs text-[#2A6E48] font-medium py-2">
                &check; Thank you for subscribing to the atelier private newsletter.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="relative max-w-sm mb-7">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail Address"
                  required
                  className="w-full bg-transparent border-b border-black/40 py-2 pr-10 text-xs sm:text-sm text-[#1A1816] placeholder:text-muted/60 focus:outline-none focus:border-black font-sans"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-lg text-black hover:opacity-70 transition-opacity p-1 cursor-pointer"
                >
                  &rarr;
                </button>
              </form>
            )}

            {/* Payment & Trust Method Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px] text-[#5B564F]">
              <span className="px-2 py-1 border border-black/15 rounded-xs font-mono font-semibold bg-white/60">
                VISA
              </span>
              <span className="px-2 py-1 border border-black/15 rounded-xs font-mono font-semibold bg-white/60">
                MC
              </span>
              <span className="px-2 py-1 border border-black/15 rounded-xs font-mono font-semibold bg-white/60">
                AMEX
              </span>
              <span className="px-2 py-1 border border-black/15 rounded-xs font-mono font-semibold bg-white/60">
                UPI
              </span>
              <span className="px-2 py-1 border border-black/15 rounded-xs font-mono font-semibold bg-white/60">
                RUPAY
              </span>
              <span className="px-2 py-1 border border-black/15 rounded-xs font-mono font-semibold bg-white/60">
                APPLE PAY
              </span>
              <span className="px-2 py-1 border border-[#9E8056]/40 rounded-xs font-mono font-semibold text-[#9E8056] bg-[#9E8056]/5">
                BIS 100% HALLMARK
              </span>
            </div>
          </div>

          {/* Column 2: Customer Care (Spans 2-3 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#1A1816] mb-4">
              CUSTOMER CARE
            </h3>
            <ul className="space-y-2.5 text-[11px] sm:text-[12px] text-[#5B564F]">
              <li>
                <a
                  href="mailto:concierge@shreeranigehna.com"
                  className="hover:text-black transition-colors"
                >
                  concierge@shreeranigehna.com
                </a>
              </li>
              <li>
                <Link href="/#chat" className="hover:text-black transition-colors">
                  Live Salon Chat
                </Link>
              </li>
              <li>
                <a
                  href="tel:+911412568920"
                  className="hover:text-black transition-colors tabular"
                >
                  +91 (0) 141 256 8920
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919829000000"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-black transition-colors"
                >
                  WhatsApp Atelier
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Help & Policies (Spans 2-3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#1A1816] mb-4">
              HELP &amp; SERVICES
            </h3>
            <ul className="space-y-2.5 text-[11px] sm:text-[12px] text-[#5B564F]">
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  Insured Shipping &amp; Returns
                </Link>
              </li>
              <li>
                <Link href="/admin/rates" className="hover:text-black transition-colors">
                  Daily Metal Rate Integrity
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  Certificate of Authenticity
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  Custom Bespoke Commissions
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-black transition-colors">
                  FAQ &amp; Sizing Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Find Us & Social (Spans 2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#1A1816] mb-4">
              FIND US
            </h3>
            <ul className="space-y-2.5 text-[11px] sm:text-[12px] text-[#5B564F]">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-black transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <Link href="/#stockists" className="hover:text-black transition-colors">
                  Jaipur Flagship Atelier
                </Link>
              </li>
              <li>
                <Link href="/#stockists" className="hover:text-black transition-colors">
                  Mumbai Private Salon
                </Link>
              </li>
              <li>
                <Link href="/#stockists" className="hover:text-black transition-colors">
                  Stockists &amp; Stockrooms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Legal Fine Print + Giant Signature Brand Typography */}
        <div className="pt-8 sm:pt-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          {/* Left: Fine Print & Legal Links */}
          <div className="text-[10px] text-[#8C857B] space-y-1.5 max-w-md">
            <p>COMPANY REGISTRY: SHREE RANI GEHNA JEWELLERS PRIVATE LIMITED</p>
            <p>REGISTRATION: 08AAACS1234F1Z5 &bull; BIS HALLMARK: HM-928471</p>
            <p>CUSTOMER SERVICES: +91 (0) 141 256 8920 &bull; ATELIER: JAIPUR, RAJASTHAN 302001</p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[#5B564F]">
              <span>&copy; 2026 Shree Rani Gehna</span>
              <span>&bull;</span>
              <Link href="/products" className="hover:text-black transition-colors underline">
                Privacy Policy
              </Link>
              <span>&bull;</span>
              <Link href="/products" className="hover:text-black transition-colors underline">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>

          {/* Right: Giant Bold High-Fashion Brand Wordmark (Exact Reike Nen Look) */}
          <div className="shrink-0 text-left md:text-right">
            <div
              className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-[#1A1816] select-none uppercase font-serif"
              style={{
                letterSpacing: "-0.04em",
                lineHeight: "0.85",
              }}
            >
              Shree Rani Gehna
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
