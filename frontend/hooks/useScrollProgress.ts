import { useEffect, useState } from "react";

// Port of the Stitch scroll handler: top progress-bar percent plus the
// active section id (last section whose top, minus 180px, is above scrollY).
export function useScrollProgress(sectionIds: string[]): {
  progress: number;
  activeId: string;
} {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("");
  const idsKey = sectionIds.join(",");

  useEffect(() => {
    const ids = idsKey.split(",");
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);

      let current = "";
      for (const id of ids) {
        const sec = document.getElementById(id);
        if (sec && window.scrollY >= sec.offsetTop - 180) {
          current = id;
        }
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [idsKey]);

  return { progress, activeId };
}
