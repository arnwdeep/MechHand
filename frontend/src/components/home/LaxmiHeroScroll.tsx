"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface LaxmiHeroScrollProps {
  videoSrc?: string;
  scrollVh?: number;
}

export default function LaxmiHeroScroll({
  videoSrc = "/media/hero/lv_0_20261003011808.mp4",
  scrollVh = 260,
}: LaxmiHeroScrollProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    video.muted = true;
    video.playsInline = true;
    video.pause();

    let targetTime = 0;
    let isSeeking = false;
    let rafId: number;

    const handleReady = () => {
      setIsVideoReady(true);
      if (video.currentTime === 0) {
        video.currentTime = 0.001;
      }
    };

    video.addEventListener("loadedmetadata", handleReady);
    video.addEventListener("canplay", handleReady);
    video.addEventListener("loadeddata", handleReady);

    if (video.readyState >= 2) {
      handleReady();
    }

    const seekVideo = () => {
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
      if (isSeeking) return;

      const diff = Math.abs(targetTime - video.currentTime);
      if (diff > 0.015) {
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
      const rawProgress = scrollableHeight > 0 ? -rect.top / scrollableHeight : 0;
      const p = Math.min(1, Math.max(0, rawProgress));

      setProgress(p);

      const maxDuration = Math.max(0, video.duration - 0.05);
      targetTime = p * maxDuration;

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
      video.removeEventListener("loadedmetadata", handleReady);
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("loadeddata", handleReady);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [videoSrc]);

  return (
    <section
      ref={sectionRef}
      id="hero-section"
      className="relative w-full bg-[#FAF8F5] text-[#1A1816]"
      style={{ height: `${scrollVh}vh` }}
    >
      {/* Sticky Fullscreen Viewport */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Fullscreen Video */}
        <video
          ref={videoRef}
          src={videoSrc}
          preload="auto"
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-700 ${
            isVideoReady ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Phase 1: Editorial Overlay (0% - 45% scroll) */}
        <div
          className="absolute bottom-10 sm:bottom-14 left-6 sm:left-12 lg:left-16 z-20 transition-all duration-700 pointer-events-auto"
          style={{
            opacity: progress < 0.5 ? 1 - progress * 2 : 0,
            transform: `translateY(${progress * 40}px)`,
          }}
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#1A1816]/75 font-semibold block mb-2">
            HAUTE JOAILLERIE &bull; MAISON DE HÉRITAGE
          </span>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-normal italic tracking-wide text-[#1A1816] mb-3 font-serif"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
            }}
          >
            From Jaipur with Love
          </h1>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.22em] font-medium text-[#1A1816] hover:opacity-70 transition-opacity group/link"
          >
            <span className="border-b border-[#1A1816]/40 pb-0.5">Shop All New &mdash; Spring/Summer 26</span>
            <span className="transition-transform duration-300 group-hover/link:translate-x-1.5">
              &rarr;
            </span>
          </Link>
        </div>

        {/* Phase 2: Live Rate & Craftsmanship Phase (45% - 95% scroll) */}
        <div
          className="absolute inset-x-0 bottom-12 sm:bottom-16 px-6 text-center z-20 transition-all duration-700 pointer-events-none"
          style={{
            opacity: progress >= 0.45 ? Math.min(1, (progress - 0.45) * 2.8) : 0,
            transform: `translateY(${(1 - progress) * 30}px)`,
          }}
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#1A1816]/80 font-semibold block mb-2">
            THE MASTERPIECE &bull; 22K GOLD &amp; SYNDICATE POLKI
          </span>
          <p
            className="text-2xl sm:text-4xl lg:text-5xl font-normal italic text-[#1A1816] max-w-2xl mx-auto font-serif"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Sculpted with Live Bullion Transparency
          </p>
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#1A1816]/75 mt-3 font-sans font-medium">
            Every Gram Accounted &bull; Zero Speculative Markup
          </p>
        </div>

        {/* Minimal Bottom Scroll Indicator & Progress Bar */}
        <div
          className="absolute bottom-4 inset-x-0 flex flex-col items-center justify-center gap-2 z-20 pointer-events-none transition-opacity duration-500 px-6"
          style={{ opacity: progress < 0.95 ? 1 : 0 }}
        >
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#1A1816]/60 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A1816] animate-pulse" />
            <span>Scroll to Animate</span>
          </div>
          <div className="w-28 sm:w-36 h-[2px] bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1A1816] transition-all duration-75"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
