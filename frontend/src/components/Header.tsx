"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

const NAV_LINKS = [
  { href: "/products?category=rings", label: "Rings" },
  { href: "/products?category=necklaces", label: "Necklaces" },
  { href: "/products?category=earrings", label: "Earrings" },
  { href: "/products", label: "High Jewellery" },
  { href: "/discover", label: "Discover" },
];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalCount, openDrawer } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || 0;
      // On homepage: show background after scrolling past the full screen hero
      // On other pages: show background as soon as user scrolls slightly
      const threshold = isHome ? window.innerHeight * 1.8 : 20;
      setIsScrolled(y > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Clean, dark typography for visibility across video & pages
  const headerBg = isScrolled
    ? "bg-[#FAF8F5]/95 backdrop-blur-md border-b border-black/10 shadow-xs"
    : "bg-transparent border-none";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 ${headerBg} text-[#1A1816] transition-all duration-400 pointer-events-auto`}
    >
      <div className="w-full px-5 sm:px-8 md:px-10 py-4 sm:py-5 flex items-center justify-between gap-4">
        {/* Left: Bold Luxury Brand Title in Dark Typography */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-[#1A1816] hover:opacity-70 transition-opacity font-serif uppercase select-none"
            style={{ letterSpacing: "-0.04em", lineHeight: "1" }}
          >
            Shree Rani Gehna
          </Link>
        </div>

        {/* Center: Clean Minimal Navigation Links in Dark Typography */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-[11px] lg:text-[12px] uppercase tracking-[0.2em] font-medium text-[#1A1816]">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`hover:opacity-60 transition-opacity ${
                  isActive ? "font-semibold underline underline-offset-4" : "opacity-90"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Gold Bullion Ticker + Minimalist Dark SVG Symbols */}
        <div className="flex items-center gap-4 sm:gap-5 text-[11px] uppercase tracking-[0.16em] font-medium text-[#1A1816]">
          <Link
            href="/admin/rates"
            className="hidden lg:inline-block hover:opacity-60 transition-opacity tabular text-xs mr-1 text-[#1A1816]"
            title="Live Bullion Rate"
          >
            INR / 24K <span className="font-semibold">₹8,450/g</span>
          </Link>

          {/* Search SVG Icon */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1.5 hover:opacity-60 transition-opacity cursor-pointer flex items-center justify-center"
            aria-label="Search Collection"
            title="Search"
          >
            <svg
              className="w-5 h-5 stroke-[#1A1816] fill-none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" />
            </svg>
          </button>

          {/* Account SVG Icon */}
          <Link
            href="/admin/rates"
            className="p-1.5 hover:opacity-60 transition-opacity flex items-center justify-center"
            aria-label="User Account"
            title="Account / Portal"
          >
            <svg
              className="w-5 h-5 stroke-[#1A1816] fill-none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
            </svg>
          </Link>

          {/* Cart SVG Icon */}
          <button
            onClick={openDrawer}
            className="relative p-1.5 hover:opacity-60 transition-opacity cursor-pointer flex items-center justify-center"
            aria-label="Shopping Bag"
            title="Shopping Bag"
          >
            <svg
              className="w-5 h-5 stroke-[#1A1816] fill-none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8h12l-1 12H7L6 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#1A1816] text-[#FAF8F5] text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Drawer */}
      {searchOpen && (
        <div className="w-full bg-[#FAF8F5]/95 backdrop-blur-md px-5 sm:px-10 py-3.5 border-y border-black/10 text-[#1A1816] flex items-center justify-between animate-fadeIn">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/products?q=${encodeURIComponent(searchQuery)}`;
              }
            }}
            className="flex-1 flex items-center gap-3"
          >
            <svg
              className="w-4 h-4 stroke-[#8C857B] fill-none shrink-0"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections, solitaire rings, polki necklaces, gold purity..."
              className="bg-transparent border-b border-black/40 text-xs sm:text-sm py-1 px-2 focus:outline-none focus:border-black w-full max-w-md font-sans text-[#1A1816]"
              autoFocus
            />
          </form>
          <button
            onClick={() => setSearchOpen(false)}
            className="text-[11px] uppercase tracking-widest text-[#5B564F] hover:text-black ml-4"
          >
            Close ✕
          </button>
        </div>
      )}
    </header>
  );
}
