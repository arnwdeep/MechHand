"use client";

import { useEffect, useRef, useState } from "react";

interface HandHeroVideoProps {
  video1Src?: string;
  video2Src?: string;
}

export default function HandHeroVideo({
  video1Src = "/media/hero/hand-hero.mp4",
  video2Src = "/media/hero/hand2-hero.mp4",
}: HandHeroVideoProps) {
  const containerRef = useRef<HTMLElement>(null);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [isEnded, setIsEnded] = useState(false);
  const [hasMouseMoved, setHasMouseMoved] = useState(false);

  // Smooth liquid water-flow cursor animation state (Clean single fluid pool)
  const targetPos = useRef({ x: -1000, y: -1000 });
  const p1 = useRef({ x: -1000, y: -1000 }); // Main fluid pool
  const [maskStyle, setMaskStyle] = useState<string>("");

  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    if (!video1) return;

    video1.muted = true;
    video1.playsInline = true;
    video1.loop = false;

    if (video2) {
      video2.muted = true;
      video2.playsInline = true;
      video2.loop = true;
      video2.play().catch(() => {});
    }

    const handleEnded = () => {
      setIsEnded(true);
      if (video1) {
        video1.pause();
      }
    };

    const handleTimeUpdate = () => {
      if (video1 && video1.duration > 0 && video1.currentTime >= video1.duration - 0.15) {
        setIsEnded(true);
      }
    };

    video1.addEventListener("ended", handleEnded);
    video1.addEventListener("timeupdate", handleTimeUpdate);

    const playPromise = video1.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video1.muted = true;
        video1.play().catch(() => {});
      });
    }

    return () => {
      video1.removeEventListener("ended", handleEnded);
      video1.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [video1Src, video2Src]);

  // Liquid water flow animation loop - Clean single fluid pool with silky smooth viscosity
  useEffect(() => {
    let rafId: number;
    let time = 0;

    const animate = () => {
      time += 0.03;

      // Organic liquid wave breathing oscillation
      const wave = Math.sin(time) * 9.5;

      // Silky smooth viscous spring/lerp easing
      p1.current.x += (targetPos.current.x - p1.current.x) * 0.085;
      p1.current.y += (targetPos.current.y - p1.current.y) * 0.085;

      // Clean single revealing fluid pool
      const r1 = Math.max(145, 224 + wave);

      // Single clean feathered liquid water mask (no trailing small droplets)
      const mask = `radial-gradient(circle ${r1.toFixed(1)}px at ${p1.current.x.toFixed(1)}px ${p1.current.y.toFixed(1)}px, black 0%, black 25%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.3) 78%, transparent 100%)`;

      setMaskStyle(mask);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    targetPos.current = { x, y };

    if (!hasMouseMoved) {
      p1.current = { x, y };
      setHasMouseMoved(true);
    }
  };

  const handlePointerLeave = () => {
    targetPos.current = { x: -1000, y: -1000 };
  };

  return (
    <section
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none cursor-default"
    >
      {/* 01. Base Video (Hand 1) - Plays once and stays clean on last frame (No Shadow) */}
      <video
        ref={video1Ref}
        src={video1Src}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
      />

      {/* 02. Overlay Video (Hand 2) - Revealed with enlarged liquid water-flow mask (No Shadow) */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 ${
          isEnded && hasMouseMoved ? "opacity-100" : "opacity-0"
        }`}
        style={{
          maskImage: maskStyle,
          WebkitMaskImage: maskStyle,
          maskComposite: "add",
          WebkitMaskComposite: "source-over",
        }}
      >
        <video
          ref={video2Ref}
          src={video2Src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Bottom Minimal Info - Small Helvetica Font (Clean & Unshadowed) */}
      <div
        className={`absolute bottom-6 sm:bottom-8 inset-x-0 z-20 px-6 sm:px-12 flex items-center justify-between pointer-events-none transition-all duration-1000 ${
          isEnded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        {/* Bottom Left Info */}
        <div className="flex flex-col text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-white/60">
          <span className="text-white/90">OBJECT 001 // MECHHAND ARTICULATION</span>
          <span>MECHHAND &bull; CYBERNETIC CHROME 2026</span>
        </div>

        {/* Bottom Right Info */}
        <div className="flex flex-col text-right text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-white/60">
          <span className="text-white/90">LIMITED ALLOCATION</span>
          <span>DOVER STREET MARKET &amp; DSML</span>
        </div>
      </div>
    </section>
  );
}
