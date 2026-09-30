import { useEffect, useRef } from "react";

// Port of the Stitch reveal script: direct children of the attached element
// get .reveal with a staggered delay (80ms, capped at 320ms) and gain .in
// once on entering the viewport. Under prefers-reduced-motion everything is
// shown immediately and nothing is hidden. The documentElement "js" class
// preserves the CSS no-JS fallback (content stays visible without JS).
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    document.documentElement.classList.add("js");

    const children = Array.from(root.children) as HTMLElement[];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      children.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("in");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    children.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = `${Math.min(i * 80, 320)}ms`;
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return ref;
}
