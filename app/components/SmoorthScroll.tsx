"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "@studio-freight/lenis";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<InstanceType<typeof Lenis> | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    lenisRef.current = new Lenis({
      lerp: 0.22,
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.1,
    });

    const tick = (time: number) => {
      if (lenisRef.current) lenisRef.current.raf(time);
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenisRef.current && typeof lenisRef.current.destroy === "function") {
        lenisRef.current.destroy();
      }
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}