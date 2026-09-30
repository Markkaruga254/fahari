import { useEffect, useRef, useState } from "react";

// Port of the Stitch count-up: counts from 0 to target once on entering the
// viewport (threshold 0.6), ease-out-cubic over durationMs. Under
// prefers-reduced-motion the final value renders immediately with no
// animation. Initial state is the final value so SSR and no-JS stay correct.
export function useCountUp(
  target: number,
  decimals = 0,
  suffix = "",
  durationMs = 1200,
): { ref: React.RefObject<HTMLSpanElement | null>; text: string } {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [text, setText] = useState(`${target.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min((t - t0) / durationMs, 1);
            const v = target * (1 - Math.pow(1 - p, 3));
            setText(`${v.toFixed(decimals)}${suffix}`);
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.6 },
    );

    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, decimals, suffix, durationMs]);

  return { ref, text };
}
