"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export interface SpecimenItem {
  id: string;
  name: string;
  topLeft: { left: string; right: string }[];
  topRight: { left: string; right: string }[];
  bottomLeft: { left: string; right: string }[];
  bottomRight: { left: string; right: string }[];
  imageSrc: string;
  baseRotation: number;
}

const SPECIMENS: SpecimenItem[] = [
  {
    id: "rock",
    name: "ROCK",
    topLeft: [
      { left: "MECHHAND", right: "ROCK" },
    ],
    topRight: [
      { left: "MECHHAND for", right: "2026/04/02" },
      { left: "ARCHIVE", right: "release" },
    ],
    bottomLeft: [
      { left: "CHONDRITE", right: "TITANIUM" },
      { left: "METEORITE", right: "520G" },
    ],
    bottomRight: [
      { left: "KINETIC", right: "GAUNTLET" },
      { left: "RIGGING", right: "BRAIDED" },
    ],
    imageSrc: "/media/hands/Rock-and-Metal Cyborg Hand Cutout.png",
    baseRotation: 135,
  },
  {
    id: "skin",
    name: "SKIN",
    topLeft: [
      { left: "MECHHAND", right: "SKIN" },
    ],
    topRight: [
      { left: "MECHHAND for", right: "2026/04/02" },
      { left: "ARCHIVE", right: "release" },
    ],
    bottomLeft: [
      { left: "EPIDERMIS", right: "POLYMER" },
      { left: "ALUMINUM", right: "410G" },
    ],
    bottomRight: [
      { left: "TACTILE", right: "DERMAL" },
      { left: "EXOSKELETON", right: "SUB-MICRON" },
    ],
    imageSrc: "/media/hands/Hyperrealistic Cybernetic Hand Cutout.png",
    baseRotation: 135,
  },
  {
    id: "bone",
    name: "BONE",
    topLeft: [
      { left: "MECHHAND", right: "BONE" },
    ],
    topRight: [
      { left: "MECHHAND for", right: "2026/04/02" },
      { left: "ARCHIVE", right: "release" },
    ],
    bottomLeft: [
      { left: "CALCIUM", right: "RESIN" },
      { left: "ACTUATION", right: "340G" },
    ],
    bottomRight: [
      { left: "BIOMORPHIC", right: "KINETIC" },
      { left: "SKELETAL", right: "18-AXIS" },
    ],
    imageSrc: "/media/hands/Futuristic Robotic Prosthetic Hand Cutout.png",
    baseRotation: 135,
  },
];

export default function Hand3DCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const total = SPECIMENS.length;
  const currentSpecimen = SPECIMENS[activeIndex];

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Listen for Header navigation selection
  useEffect(() => {
    const handleSpecimenSelect = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const target = customEvent.detail?.toLowerCase();
      const foundIdx = SPECIMENS.findIndex(
        (s) => s.id.toLowerCase() === target || s.name.toLowerCase() === target
      );
      if (foundIdx !== -1) {
        setActiveIndex(foundIdx);
      }
    };

    window.addEventListener("select-specimen", handleSpecimenSelect);
    return () => window.removeEventListener("select-specimen", handleSpecimenSelect);
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 40) handleNext();
    if (diff < -40) handlePrev();
    setTouchStart(null);
  };

  return (
    <section
      id="hand-carousel"
      className="relative w-full bg-[#090D16] py-14 sm:py-24 px-4 sm:px-8 md:px-14 lg:px-20 overflow-hidden select-none border-t border-white/10"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      <div className="max-w-6xl mx-auto relative z-10 space-y-4 sm:space-y-6">
        {/* Top Editorial Slash Typography Row (ASICS x BEAMS style) */}
        <div className="flex justify-between items-start text-[11px] sm:text-[13px] md:text-[14px] uppercase tracking-[0.14em] text-white/90">
          {/* Top Left: Brand / Model */}
          <div className="space-y-1">
            {currentSpecimen.topLeft.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 sm:gap-3.5">
                <span className="font-normal text-white/70">{item.left}</span>
                <span className="text-white/40 font-light text-[13px] sm:text-[16px]">/</span>
                <span className="font-bold text-white tracking-[0.18em]">{item.right}</span>
              </div>
            ))}
          </div>

          {/* Top Right: Release info with slashes */}
          <div className="space-y-1 text-right">
            {currentSpecimen.topRight.map((item, idx) => (
              <div key={idx} className="flex items-center justify-end gap-2.5 sm:gap-3.5">
                <span className="font-normal text-white/70">{item.left}</span>
                <span className="text-white/40 font-light text-[13px] sm:text-[16px]">/</span>
                <span className="font-normal text-white/90">{item.right}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main 3D Carousel Stage */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-[380px] sm:h-[480px] md:h-[560px] flex items-center justify-center my-2 sm:my-4"
          style={{ perspective: "1500px" }}
        >
          {/* 3D Hands */}
          {SPECIMENS.map((spec, idx) => {
            // Calculate position relative to active index
            let offset = idx - activeIndex;
            if (offset < -1) offset += total;
            if (offset > 1) offset -= total;

            const isCurrent = offset === 0;
            const isLeft = offset === -1;
            const isRight = offset === 1;

            if (!isCurrent && !isLeft && !isRight) return null;

            let transformStyle = "";
            let zIndex = 10;
            let opacity = 1;
            let filter = "none";
            let scale = 1;

            if (isCurrent) {
              zIndex = 30;
              scale = 1.32;
              opacity = 1;
              filter = "none";
              transformStyle = `
                translateX(0%) 
                translateY(0%) 
                translateZ(70px) 
                scale(${scale})
              `;
            } else if (isLeft) {
              zIndex = 15;
              scale = 0.76;
              opacity = 0.45;
              filter = "blur(3.5px) brightness(0.65)";
              transformStyle = `
                translateX(-33%) 
                translateZ(-100px) 
                rotateY(26deg) 
                rotateZ(-4deg) 
                scale(${scale})
              `;
            } else if (isRight) {
              zIndex = 15;
              scale = 0.76;
              opacity = 0.45;
              filter = "blur(3.5px) brightness(0.65)";
              transformStyle = `
                translateX(33%) 
                translateZ(-100px) 
                rotateY(-26deg) 
                rotateZ(4deg) 
                scale(${scale})
              `;
            }

            return (
              <div
                key={spec.id}
                onClick={() => {
                  if (isLeft) handlePrev();
                  if (isRight) handleNext();
                }}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out ${
                  !isCurrent ? "cursor-pointer hover:opacity-75" : ""
                }`}
                style={{
                  transform: transformStyle,
                  zIndex,
                  opacity,
                  filter,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Hand Container: Aspect Ratio strictly preserved with no stretch, rotated to top side */}
                <div className="relative w-[290px] h-[290px] sm:w-[380px] sm:h-[380px] md:w-[460px] md:h-[460px] flex items-center justify-center p-3">
                  <div
                    className="relative w-full h-full"
                    style={{
                      transform: `rotate(${spec.baseRotation}deg)`,
                      transformOrigin: "center center",
                    }}
                  >
                    <Image
                      src={spec.imageSrc}
                      alt={spec.name}
                      fill
                      priority={isCurrent}
                      sizes="(max-width: 768px) 380px, 560px"
                      className="object-contain select-none pointer-events-none drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Navigation Arrows (Frameless minimal arrows) */}
          <button
            onClick={handlePrev}
            aria-label="Previous"
            className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-40 p-2 text-white/40 hover:text-white active:scale-90 transition-all cursor-pointer group"
          >
            <svg
              className="w-7 h-7 sm:w-9 sm:h-9 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            aria-label="Next"
            className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-40 p-2 text-white/40 hover:text-white active:scale-90 transition-all cursor-pointer group"
          >
            <svg
              className="w-7 h-7 sm:w-9 sm:h-9 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Bottom Editorial Slash Metadata Section */}
        <div className="pt-2">
          {/* Bottom Left & Right Editorial Slash Typography Row */}
          <div className="flex justify-between items-end text-[11px] sm:text-[13px] md:text-[14px] uppercase tracking-[0.14em] text-white/90">
            {/* Bottom Left Specs */}
            <div className="space-y-1">
              {currentSpecimen.bottomLeft.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 sm:gap-3.5">
                  <span className="font-normal text-white/70">{item.left}</span>
                  <span className="text-white/40 font-light text-[13px] sm:text-[16px]">/</span>
                  <span className="font-normal text-white/95">{item.right}</span>
                </div>
              ))}
            </div>

            {/* Bottom Right Specs */}
            <div className="space-y-1 text-right">
              {currentSpecimen.bottomRight.map((item, idx) => (
                <div key={idx} className="flex items-center justify-end gap-2.5 sm:gap-3.5">
                  <span className="font-normal text-white/70">{item.left}</span>
                  <span className="text-white/40 font-light text-[13px] sm:text-[16px]">/</span>
                  <span className="font-normal text-white/95">{item.right}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
