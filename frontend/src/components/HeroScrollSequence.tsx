"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Props = {
  videoSrc?: string;
  poster: string;
  scrollVh?: number;
  availableCategories?: string[];
  children?: React.ReactNode;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const readMotion = () => window.matchMedia(REDUCED_MOTION).matches;
const readMotionOnServer = () => false;

export default function HeroScrollSequence({
  videoSrc = "/media/hero/hero-video.mp4",
  poster,
  scrollVh = 200,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  const reduced = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    readMotionOnServer,
  );

  useEffect(() => {
    if (reduced) return;

    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = true;
    vid.playsInline = true;

    let targetTime = 0;
    let isSeeking = false;
    let rafId: number;

    const performSeek = () => {
      if (!vid || !Number.isFinite(vid.duration) || vid.duration <= 0) return;
      if (isSeeking) return;

      const diff = Math.abs(targetTime - vid.currentTime);
      if (diff > 0.015) {
        isSeeking = true;
        try {
          if ("fastSeek" in vid && typeof (vid as unknown as { fastSeek: (t: number) => void }).fastSeek === "function") {
            (vid as unknown as { fastSeek: (t: number) => void }).fastSeek(targetTime);
          } else {
            vid.currentTime = targetTime;
          }
        } catch {
          vid.currentTime = targetTime;
        }
      }
    };

    const handleSeeked = () => {
      isSeeking = false;
      performSeek();
    };

    vid.addEventListener("seeked", handleSeeked);

    const onScrollOrFrame = () => {
      const section = sectionRef.current;
      if (vid && section && Number.isFinite(vid.duration) && vid.duration > 0) {
        const rect = section.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const p = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
        const maxTime = Math.max(0, vid.duration - 0.05);

        targetTime = p * maxTime;

        if (!isSeeking) {
          performSeek();
        }
      }
      rafId = requestAnimationFrame(onScrollOrFrame);
    };

    rafId = requestAnimationFrame(onScrollOrFrame);

    if (vid.readyState >= 2) {
      setReady(true);
    }

    return () => {
      cancelAnimationFrame(rafId);
      vid.removeEventListener("seeked", handleSeeked);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" className="w-full h-screen object-cover" />
      </section>
    );
  }

  return (
    <section
      id="hero-section"
      ref={sectionRef}
      style={{ height: `${scrollVh}vh` }}
      className="relative bg-[#1A1816]"
    >
      <div className="sticky top-0 h-screen overflow-hidden w-full">
        {/* Hardware GPU-accelerated video player */}
        <video
          ref={videoRef}
          src={videoSrc}
          poster={poster}
          playsInline
          muted
          preload="auto"
          onLoadedData={() => setReady(true)}
          onLoadedMetadata={() => setReady(true)}
          onCanPlay={() => setReady(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: ready ? 1 : 0.8,
            transition: "opacity .3s ease",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        />

        {/* Poster fallback */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: ready ? 0 : 1, transition: "opacity .3s ease" }}
        />
      </div>
    </section>
  );
}

