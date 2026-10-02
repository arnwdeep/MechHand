"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface LaxmiHeroScrollProps {
  videoSrc?: string;
  scrollVh?: number;
}

export default function LaxmiHeroScroll({
  videoSrc = "/media/hero/laxmihero.mp4",
  scrollVh = 220,
}: LaxmiHeroScrollProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    video.muted = true;
    video.playsInline = true;
    video.currentTime = 0.001;

    let targetTime = 0;
    let isSeeking = false;
    let rafId: number;

    const onLoadedMetadata = () => {
      setIsVideoLoaded(true);
      video.currentTime = 0.001;
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    if (video.readyState >= 1) {
      setIsVideoLoaded(true);
    }

    const seekVideo = () => {
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
      if (isSeeking) return;

      const diff = Math.abs(targetTime - video.currentTime);
      if (diff > 0.02) {
        isSeeking = true;
        try {
          if (
            "fastSeek" in video &&
            typeof (video as unknown as { fastSeek: (t: number) => void }).fastSeek === "function"
          ) {
            (video as unknown as { fastSeek: (t: number) => void }).fastSeek(targetTime);
          } else {
            video.currentTime = targetTime;
          }
        } catch {
          video.currentTime = targetTime;
        }
      }
    };

    const onSeeked = () => {
      isSeeking = false;
      seekVideo();
    };

    video.addEventListener("seeked", onSeeked);

    const handleScroll = () => {
      if (!section || !video || !Number.isFinite(video.duration) || video.duration <= 0) return;

      const rect = section.getBoundingClientRect();
      const scrollableHeight = rect.height - window.innerHeight;
      const p = scrollableHeight > 0 ? Math.min(1, Math.max(0, -rect.top / scrollableHeight)) : 0;

      setProgress(p);

      const maxTime = Math.max(0, video.duration - 0.05);
      targetTime = p * maxTime;

      if (!isSeeking) {
        seekVideo();
      }
    };

    const tick = () => {
      handleScroll();
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", onSeeked);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero-section"
      className="relative w-full bg-[#1A1816] text-white"
      style={{ height: `${scrollVh}vh` }}
    >
      {/* Sticky Fullscreen Viewport */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Fullscreen Video Element */}
        <video
          ref={videoRef}
          src={videoSrc}
          preload="auto"
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Ambient Top & Bottom Vignettes for High Fashion Contrast */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/40 via-black/15 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/65 via-black/25 to-transparent pointer-events-none" />

        {/* Dynamic Editorial Text Overlays reacting to scroll */}

        {/* Phase 1: From Jaipur with Love (0% - 45% scroll) */}
        <div
          className="absolute bottom-10 sm:bottom-14 left-6 sm:left-12 lg:left-16 z-20 transition-all duration-700 pointer-events-auto"
          style={{
            opacity: progress < 0.55 ? 1 - progress * 1.8 : 0,
            transform: `translateY(${progress * 40}px)`,
          }}
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white/80 font-semibold block mb-2 drop-shadow-sm">
            HAUTE JOAILLERIE &bull; MAISON DE HÉRITAGE
          </span>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-normal italic tracking-wide text-white drop-shadow-lg mb-3 font-serif"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              textShadow: "0 2px 16px rgba(0,0,0,0.5)",
            }}
          >
            From Jaipur with Love
          </h1>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.22em] font-medium text-white/95 hover:text-white transition-colors group/link"
          >
            <span>Shop All New &mdash; Spring/Summer 26 Collection</span>
            <span className="transition-transform duration-300 group-hover/link:translate-x-1.5">
              &rarr;
            </span>
          </Link>
        </div>

        {/* Phase 2: Live Rate & Imperial Craftsmanship (45% - 95% scroll) */}
        <div
          className="absolute inset-x-0 bottom-12 sm:bottom-16 px-6 text-center z-20 transition-all duration-700 pointer-events-none"
          style={{
            opacity: progress >= 0.45 ? Math.min(1, (progress - 0.45) * 2.8) : 0,
            transform: `translateY(${(1 - progress) * 30}px)`,
          }}
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-white/90 font-semibold block mb-2">
            THE MASTERPIECE &bull; 22K GOLD &amp; SYNDICATE POLKI
          </span>
          <p
            className="text-2xl sm:text-4xl lg:text-5xl font-normal italic text-white drop-shadow-md max-w-2xl mx-auto font-serif"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Sculpted with Live Bullion Transparency
          </p>
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/80 mt-3 font-sans">
            Every Gram Accounted &bull; Zero Speculative Markup
          </p>
        </div>

        {/* Bottom Scroll Indicator */}
        <div
          className="absolute bottom-4 inset-x-0 flex justify-center z-20 pointer-events-none transition-opacity duration-500"
          style={{ opacity: progress < 0.15 ? 1 : 0 }}
        >
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Scroll to Animate</span>
          </div>
        </div>
      </div>
    </section>
  );
}
