'use client';

// RAAYDR — ScrollTextReveal
// Faithful port of the Framer "Text Reveal" marketplace component
// (https://www.framer.com/community/marketplace/components/text-reveal/)
// Original by Soyeb. Ported from vanilla DOM manipulation into a React
// component for use outside Framer. Logic is unchanged: as the block
// scrolls through a defined viewport window, characters or words light
// up from dim to full opacity in sequence, tracking scroll position —
// no pin, no GSAP ScrollTrigger, just scroll + rAF.

import { useEffect, useRef } from 'react';

interface ScrollTextRevealProps {
  text: string;
  /** Reveal character-by-character or word-by-word. */
  revealMode?: 'chars' | 'words';
  /** Viewport % from top where the reveal begins (segment 0 starts lighting). */
  startOffset?: number;
  /** Viewport % from top where the reveal completes (last segment fully lit). */
  endOffset?: number;
  /** Opacity of not-yet-revealed segments. */
  dimOpacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrollTextReveal({
  text,
  revealMode = 'words',
  startOffset = 90,
  endOffset = 30,
  dimOpacity = 0.2,
  className,
  style
}: ScrollTextRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const segmentsRef = useRef<HTMLElement[]>([]);
  const isVisibleRef = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    const textRoot = textRef.current;
    if (!root || !textRoot) return;

    const allSegments: HTMLElement[] = [];
    textRoot.style.visibility = 'hidden';

    // Split into segments (words or chars), each wrapped in its own span.
    const parts =
      revealMode === 'chars'
        ? text.split('')
        : text.split(/(\s+)/).filter((p) => p.length > 0);

    textRoot.innerHTML = '';
    parts.forEach((part) => {
      if (/^\s+$/.test(part)) {
        textRoot.appendChild(document.createTextNode(part));
        return;
      }
      const span = document.createElement('span');
      span.textContent = part;
      span.style.display = 'inline';
      span.style.opacity = String(dimOpacity);
      span.style.willChange = 'opacity';
      span.style.transition = 'opacity 0.05s linear';
      textRoot.appendChild(span);
      allSegments.push(span);
    });

    if (allSegments.length === 0) {
      textRoot.style.visibility = 'visible';
      return;
    }

    segmentsRef.current = allSegments;
    textRoot.style.visibility = 'visible';

    const computeReveal = () => {
      if (!isVisibleRef.current || !root) return;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const startPx = vh * (startOffset / 100);
      const endPx = vh * (endOffset / 100);
      const totalRange = rect.height + (startPx - endPx);
      const scrolled = startPx - rect.top;
      const progress = Math.min(Math.max(scrolled / totalRange, 0), 1);

      const total = segmentsRef.current.length;
      const litCount = Math.floor(progress * total);

      segmentsRef.current.forEach((seg, i) => {
        if (i < litCount) {
          seg.style.opacity = '1';
        } else if (i === litCount) {
          const frac = progress * total - litCount;
          seg.style.opacity = String(dimOpacity + frac * (1 - dimOpacity));
        } else {
          seg.style.opacity = String(dimOpacity);
        }
      });
    };

    const scheduleReveal = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(computeReveal);
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting;
        if (isVisibleRef.current) scheduleReveal();
      },
      { rootMargin: '200px 0px 200px 0px', threshold: 0 }
    );
    intersectionObserver.observe(root);

    window.addEventListener('scroll', scheduleReveal, { passive: true });
    window.addEventListener('resize', scheduleReveal, { passive: true });
    scheduleReveal();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', scheduleReveal);
      window.removeEventListener('resize', scheduleReveal);
      intersectionObserver.disconnect();
      segmentsRef.current = [];
    };
  }, [text, revealMode, startOffset, endOffset, dimOpacity]);

  return (
    <div ref={rootRef} style={{ position: 'relative', width: '100%', height: 'auto', ...style }} className={className}>
      <div ref={textRef} style={{ width: '100%', height: 'auto' }}>
        {text}
      </div>
    </div>
  );
}
