"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

type GlyphName = "the-split" | "attention-dial" | "bypass-arrow" | "blip";

type GlyphProps = {
  name: GlyphName;
  size?: number;
  className?: string;
};

/**
 * The four scroll-drawn brand glyphs (the-split, attention-dial,
 * bypass-arrow, blip). Each stroked shape carries pathLength="100" so its
 * dash values are in a fixed 0-100 unit space regardless of real path
 * length, and draws itself in on first scroll into view:
 *  - open paths (bypass-arrow) use the canonical dasharray "100 100" /
 *    dashoffset 100→0 line-draw.
 *  - closed authored arcs (the-split, blip) keep their authored dasharray
 *    (which IS the artwork — a segment length) and instead animate the
 *    dashoffset from (finalOffset + visibleLength) down to finalOffset, so
 *    the segment grows into its resting position rather than popping in.
 * Filled shapes (attention-dial's wedge) fade in alongside the stroke.
 */
export default function Glyph({ name, size = 48, className }: GlyphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const drawEls = Array.from(svg.querySelectorAll<SVGGeometryElement>("[data-draw]"));
    const fadeEls = Array.from(svg.querySelectorAll<SVGElement>("[data-fade]"));
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      drawEls.forEach((el) => {
        const mode = el.dataset.draw;
        if (mode === "line") {
          gsap.fromTo(
            el,
            { strokeDashoffset: 100 },
            {
              strokeDashoffset: 0,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: { trigger: svg, start: "top 85%" },
            }
          );
        } else if (mode === "grow") {
          const finalOffset = Number(el.dataset.offset ?? 0);
          const visible = Number(el.dataset.visible ?? 0);
          gsap.fromTo(
            el,
            { strokeDashoffset: finalOffset + visible },
            {
              strokeDashoffset: finalOffset,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: { trigger: svg, start: "top 85%" },
            }
          );
        }
      });
      if (fadeEls.length) {
        gsap.fromTo(
          fadeEls,
          { opacity: 0, scale: 0.85, transformOrigin: "center" },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: 0.4,
            ease: "power2.out",
            scrollTrigger: { trigger: svg, start: "top 85%" },
          }
        );
      }
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(drawEls, { strokeDashoffset: (i, el) => el.dataset.offset ?? 0 });
      gsap.set(fadeEls, { opacity: 1, scale: 1 });
    });

    return () => mm.revert();
  }, [name]);

  const common = { width: size, height: size, viewBox: "0 0 96 96", fill: "none" as const };

  if (name === "the-split") {
    return (
      <svg ref={svgRef} {...common} className={className} aria-hidden="true">
        <circle
          cx="48" cy="48" r="38" stroke="var(--green)" strokeWidth="9"
          pathLength={100} strokeDasharray="55 45" strokeDashoffset="0"
          strokeLinecap="round" transform="rotate(-90 48 48)"
          data-draw="grow" data-offset="0" data-visible="55"
        />
        <circle
          cx="48" cy="48" r="38" stroke="currentColor" strokeWidth="9"
          pathLength={100} strokeDasharray="14 86" strokeDashoffset="-58"
          strokeLinecap="round" opacity="0.35" transform="rotate(-90 48 48)"
          data-draw="grow" data-offset="-58" data-visible="14"
        />
        <circle
          cx="48" cy="48" r="38" stroke="currentColor" strokeWidth="9"
          pathLength={100} strokeDasharray="22 78" strokeDashoffset="-75"
          strokeLinecap="round" opacity="0.2" transform="rotate(-90 48 48)"
          data-draw="grow" data-offset="-75" data-visible="22"
        />
      </svg>
    );
  }

  if (name === "blip") {
    return (
      <svg ref={svgRef} {...common} className={className} aria-hidden="true">
        <circle cx="48" cy="48" r="7" fill="var(--green)" data-fade="true" />
        <circle
          cx="48" cy="48" r="20" stroke="currentColor" strokeWidth="4"
          pathLength={100} strokeDasharray="30 70" strokeDashoffset="-8"
          strokeLinecap="round" transform="rotate(-90 48 48)"
          data-draw="grow" data-offset="-8" data-visible="30"
        />
        <circle
          cx="48" cy="48" r="32" stroke="currentColor" strokeWidth="3"
          pathLength={100} strokeDasharray="22 78" strokeDashoffset="-12"
          strokeLinecap="round" opacity="0.4" transform="rotate(-90 48 48)"
          data-draw="grow" data-offset="-12" data-visible="22"
        />
      </svg>
    );
  }

  if (name === "bypass-arrow") {
    return (
      <svg ref={svgRef} {...common} className={className} aria-hidden="true">
        <path
          d="M10,64 H28 Q48,28 68,64 H82" stroke="currentColor" strokeWidth="5"
          strokeLinecap="round" fill="none" pathLength={100}
          strokeDasharray="100 100" strokeDashoffset="100" data-draw="line"
        />
        <path
          d="M74,55 L84,64 L74,73" stroke="currentColor" strokeWidth="5"
          strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={100}
          strokeDasharray="100 100" strokeDashoffset="100" data-draw="line"
        />
        <circle cx="48" cy="70" r="5" fill="currentColor" opacity="0.3" data-fade="true" />
      </svg>
    );
  }

  // attention-dial
  return (
    <svg ref={svgRef} {...common} className={className} aria-hidden="true">
      <circle
        cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="2.5" opacity="0.3"
        pathLength={100} strokeDasharray="100 100" strokeDashoffset="100" data-draw="line"
      />
      <path d="M48,48 L48,8 A40,40 0 0 1 71.5,80.4 Z" fill="var(--green)" data-fade="true" />
    </svg>
  );
}
