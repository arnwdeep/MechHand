"use client";

import { useState } from "react";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalCount, openDrawer } = useCart();

  return (
    <header className="absolute top-0 inset-x-0 z-40 bg-transparent text-[#1A1816] pointer-events-auto">
      <div className="w-full px-5 sm:px-8 md:px-10 py-5 sm:py-6 flex items-center justify-between gap-4">
        {/* Left: Bold Brand Logo (No background, exact Reike Nen placement) */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-[#1A1816] hover:opacity-80 transition-opacity font-serif uppercase select-none drop-shadow-xs"
            style={{ letterSpacing: "-0.04em", lineHeight: "1" }}
          >
            Shree Rani Gehna
          </Link>
        </div>

        {/* Center: Clean Minimal Navigation Links (No background) */}
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

        {/* Right: Rate / Search / Account / Cart (No background) */}
        <div className="flex items-center gap-4 sm:gap-6 text-[10px] sm:text-[11px] lg:text-[12px] uppercase tracking-[0.16em] font-medium text-[#1A1816]">
          <Link
            href="/admin/rates"
            className="hidden lg:inline-block hover:opacity-60 transition-opacity tabular"
            title="Live gold rate"
          >
            INR / 24K <span className="font-semibold">₹8,450/g</span>
          </Link>

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="hover:opacity-60 transition-opacity flex items-center gap-1 cursor-pointer"
            aria-label="Search"
          >
            <span>Search</span>
          </button>

          <Link
            href="/admin/rates"
            className="hidden sm:inline-block hover:opacity-60 transition-opacity"
          >
            Account
          </Link>

          <button
            onClick={openDrawer}
            className="hover:opacity-60 transition-opacity flex items-center gap-1 cursor-pointer"
          >
            <span>Cart</span>
            <span className="text-muted tabular">({totalCount})</span>
          </button>
        </div>
      </div>

      {/* Search Bar Overlay */}
      {searchOpen && (
        <div className="w-full bg-[#FAF8F5]/95 backdrop-blur-md px-5 sm:px-10 py-3 border-y border-black/10 flex items-center justify-between animate-fadeIn">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/products?q=${encodeURIComponent(searchQuery)}`;
              }
            }}
            className="flex-1 flex items-center gap-3"
          >
            <span className="text-[11px] uppercase tracking-wider text-muted font-mono">SEARCH:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by collection, ring, gold purity..."
              className="bg-transparent border-b border-black/40 text-xs sm:text-sm py-1 px-2 focus:outline-none focus:border-black w-full max-w-md font-sans"
              autoFocus
            />
          </form>
          <button
            onClick={() => setSearchOpen(false)}
            className="text-[11px] uppercase tracking-widest text-muted hover:text-black ml-4"
          >
            Close ✕
          </button>
        </div>
      )}
    </header>
  );
}
