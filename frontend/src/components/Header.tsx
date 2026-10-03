"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSelectSpecimen = (specimenId: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("select-specimen", { detail: specimenId })
      );
      const el = document.getElementById("hand-carousel");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      {/* Floating iOS Liquid Glass Header - Transparent Dark (No Shadow) */}
      <header className="fixed top-3 sm:top-4.5 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
        <div
          className="w-full max-w-5xl rounded-full px-4 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between pointer-events-auto border border-white/10 bg-black/25 backdrop-blur-[6px] shadow-none transition-all duration-300"
          style={{
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          {/* Left: Streetwear Wide Typography MECHHAND Logo */}
          <Link
            href="/"
            className="flex items-center group transition-transform duration-300 hover:scale-105 select-none pl-1"
            aria-label="MECHHAND"
          >
            <span
              className="text-[13px] sm:text-[14px] md:text-[15px] font-black uppercase tracking-[-0.03em] sm:tracking-[-0.02em] text-white leading-none inline-block transform scale-y-90"
              style={{
                fontFamily: 'var(--font-syne), "Helvetica Neue", Arial, sans-serif',
                fontWeight: 800,
              }}
            >
              MECHHAND
            </span>
          </Link>

          {/* Middle: Cybernetic Hand Categories in Small Helvetica Font */}
          <nav
            className="flex items-center gap-3 sm:gap-5 md:gap-6 text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.16em] font-normal text-white/70 select-none"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
          >
            <a
              href="#hand-carousel"
              className="hover:text-white transition-colors duration-200 font-medium text-white/95"
            >
              SPECIMENS
            </a>
            <span className="hidden md:inline-block text-white/30 text-[8px]">&bull;</span>
            <button
              onClick={() => handleSelectSpecimen("rock")}
              className="hidden md:inline-block hover:text-white transition-colors duration-200 cursor-pointer"
            >
              ROCK
            </button>
            <button
              onClick={() => handleSelectSpecimen("skin")}
              className="hidden md:inline-block hover:text-white transition-colors duration-200 cursor-pointer"
            >
              SKIN
            </button>
            <button
              onClick={() => handleSelectSpecimen("bone")}
              className="hidden lg:inline-block hover:text-white transition-colors duration-200 cursor-pointer"
            >
              BONE
            </button>
            <span className="hidden sm:inline-block text-white/30 text-[8px]">&bull;</span>
            <a
              href="#categories"
              className="hidden sm:inline-block hover:text-white transition-colors duration-200"
            >
              ARCHIVE
            </a>
          </nav>

          {/* Right: Fluid Liquid Transparent Account Button (No Circle) */}
          <div className="flex items-center text-white pr-1">
            <button
              onClick={() => setAccountOpen(true)}
              className="relative p-1 opacity-85 hover:opacity-100 active:scale-95 transition-all duration-300 cursor-pointer group flex items-center justify-center bg-transparent border-0 shadow-none"
              aria-label="Account Portal"
              title="Account"
            >
              <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/media/icons/acc-icon.png"
                  alt="Account"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Silver / White Themed Account Modal */}
      {accountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#121316] border border-white/20 rounded-xl p-6 sm:p-8 text-white relative"
          >
            <button
              onClick={() => setAccountOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white text-xs uppercase tracking-widest p-2 cursor-pointer transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto mb-3 relative w-14 h-14 flex items-center justify-center">
                <Image
                  src="/media/icons/acc-icon.png"
                  alt="Account"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
              <h3 className="text-base font-normal tracking-wide text-white uppercase">
                Client Portal
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mt-1 font-normal">
                Access Private Commissions &amp; Orders
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAccountOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/70 block mb-1.5 font-normal">
                  Mobile Number / Email
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/60 transition-colors font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity cursor-pointer"
              >
                Send Access Code
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
