"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if user prefers reduced motion.
 * Returns true if prefers-reduced-motion: reduce is active.
 * Use this to disable or simplify animations for accessibility.
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}

/**
 * Returns animation config that respects reduced motion preference.
 * Use with framer-motion transition props.
 */
export function useMotionConfig(defaultDuration = 0.3) {
  const reducedMotion = useReducedMotion();
  return {
    duration: reducedMotion ? 0 : defaultDuration,
    stagger: reducedMotion ? 0 : 0.05,
  };
}
