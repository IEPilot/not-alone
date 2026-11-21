"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TARGETS =
  ".section h1, .section h2, .section .eyebrow, .section .lede, .section p, .card, .chapter-list li, .prose > *, .post-body > *, blockquote, .newsletter, .footer-grid > div";

export default function ScrollEffects() {
  const pathname = usePathname();

  // Reading progress line + header shadow
  useEffect(() => {
    const bar = document.getElementById("scroll-progress");
    let ticking = false;
    const update = () => {
      ticking = false;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
      if (bar) bar.style.transform = `scaleX(${pct})`;
      document.body.classList.toggle("is-scrolled", h.scrollTop > 12);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  // Gentle fade-and-rise as things scroll into view
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(TARGETS)).filter(
      (el) => !el.closest("header, .hero, nav")
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      // Anything already on screen at load stays put; only what is below the fold animates.
      if (r.top < window.innerHeight * 0.9) return;
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${(i % 4) * 70}ms`);
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  return <div id="scroll-progress" aria-hidden="true" />;
}
