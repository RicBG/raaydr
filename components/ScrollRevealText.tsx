'use client';

// RAAYDR — ScrollRevealText
// Ported from a purchased Framer marketplace component by AliThemes.com
// ("ScrollRevealText" — used under the buyer's license). Framer-only APIs
// (addPropertyControls, ControlType, useIsStaticRenderer, the Framer
// runtime import) have been stripped and replaced with plain React/TS.
// All animation logic — character/word/line splitting, stagger timing,
// blur, 3D tilt, scale, colour-mix reveal, scroll and on-load triggers —
// is unchanged from the original and verified to run error-free with real
// RAAYDR copy before being handed off.

import { useRef, useEffect, useMemo, useState, ElementType, CSSProperties } from 'react';

export type SplitMode = 'Characters' | 'Words' | 'Lines';
export type RevealDirection = 'Left to Right' | 'Right to Left';
export type Trigger = 'Scroll' | 'On Load';
export type Preset =
  | 'Default'
  | 'Fade In Up'
  | 'Blur Reveal'
  | 'Cinematic'
  | '3D Flip'
  | 'Wave RTL'
  | 'Typewriter'
  | 'Glitch Rise'
  | 'Soft Words'
  | 'Cascade Down'
  | 'Masked Lines'
  | 'Scale Pop'
  | 'Custom';

interface PresetConfig {
  splitMode: SplitMode;
  revealDirection: RevealDirection;
  stagger: number;
  xOffset: number;
  yOffset: number;
  blur: number;
  rotateX: number;
  perspective: number;
  scale: number;
}

const PRESETS: Record<Exclude<Preset, 'Custom'>, PresetConfig> = {
  Default: { splitMode: 'Characters', revealDirection: 'Left to Right', stagger: 0.2, xOffset: 7, yOffset: 0, blur: 0, rotateX: 0, perspective: 800, scale: 1 },
  'Fade In Up': { splitMode: 'Characters', revealDirection: 'Left to Right', stagger: 0.15, xOffset: 0, yOffset: 25, blur: 0, rotateX: 0, perspective: 800, scale: 1 },
  'Blur Reveal': { splitMode: 'Characters', revealDirection: 'Left to Right', stagger: 0.2, xOffset: 0, yOffset: 0, blur: 8, rotateX: 0, perspective: 800, scale: 1 },
  Cinematic: { splitMode: 'Characters', revealDirection: 'Left to Right', stagger: 0.12, xOffset: 10, yOffset: 20, blur: 4, rotateX: 0, perspective: 800, scale: 1 },
  '3D Flip': { splitMode: 'Characters', revealDirection: 'Left to Right', stagger: 0.15, xOffset: 0, yOffset: 0, blur: 2, rotateX: 45, perspective: 800, scale: 1 },
  'Wave RTL': { splitMode: 'Characters', revealDirection: 'Right to Left', stagger: 0.1, xOffset: 5, yOffset: 15, blur: 0, rotateX: 0, perspective: 800, scale: 1 },
  Typewriter: { splitMode: 'Characters', revealDirection: 'Left to Right', stagger: 0.4, xOffset: 0, yOffset: 0, blur: 0, rotateX: 0, perspective: 800, scale: 1 },
  'Glitch Rise': { splitMode: 'Characters', revealDirection: 'Left to Right', stagger: 0.08, xOffset: 15, yOffset: 40, blur: 10, rotateX: 30, perspective: 600, scale: 1 },
  'Soft Words': { splitMode: 'Words', revealDirection: 'Left to Right', stagger: 0.3, xOffset: 0, yOffset: 12, blur: 3, rotateX: 0, perspective: 800, scale: 1 },
  'Cascade Down': { splitMode: 'Characters', revealDirection: 'Right to Left', stagger: 0.12, xOffset: 0, yOffset: -30, blur: 5, rotateX: -20, perspective: 900, scale: 1 },
  'Masked Lines': { splitMode: 'Lines', revealDirection: 'Left to Right', stagger: 0.15, xOffset: 0, yOffset: 0, blur: 0, rotateX: 0, perspective: 800, scale: 1 },
  'Scale Pop': { splitMode: 'Characters', revealDirection: 'Left to Right', stagger: 0.1, xOffset: 0, yOffset: 15, blur: 2, rotateX: 0, perspective: 800, scale: 0.5 }
};

export interface ScrollRevealTextProps {
  text: string;
  preset?: Preset;
  font?: CSSProperties;
  colorHidden?: string;
  colorRevealed?: string;
  htmlTag?: ElementType;
  trigger?: Trigger;
  onLoadDuration?: number;
  offsetStart?: number;
  offsetEnd?: number;
  style?: CSSProperties;

  // Only used when preset === 'Custom'
  splitMode?: SplitMode;
  revealDirection?: RevealDirection;
  stagger?: number;
  xOffset?: number;
  yOffset?: number;
  blur?: number;
  rotateX?: number;
  perspective?: number;
  scale?: number;
}

interface SpanEntry {
  char: string;
  unit: number;
  isSpace: boolean;
}
interface WordGroup {
  type: 'word' | 'space';
  spans: (SpanEntry & { idx: number })[];
}

export default function ScrollRevealText({
  text,
  preset = 'Default',
  font = { fontFamily: "'General Sans', system-ui, sans-serif", fontWeight: 600, fontSize: 40, lineHeight: '1.4em', letterSpacing: '-0.01em' },
  colorHidden = 'rgba(21,21,26,0.2)', // RAAYDR Ink at low opacity
  colorRevealed = '#15151A', // RAAYDR Ink
  htmlTag = 'div',
  trigger = 'Scroll',
  onLoadDuration = 1.5,
  offsetStart = 80,
  offsetEnd = 20,
  style,
  splitMode: customSplitMode,
  revealDirection: customRevealDirection,
  stagger: customStagger,
  xOffset: customXOffset,
  yOffset: customYOffset,
  blur: customBlur,
  rotateX: customRotateX,
  perspective: customPerspective,
  scale: customScale
}: ScrollRevealTextProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const spanRefs = useRef<(HTMLElement | null)[]>([]);
  const lineRefs = useRef<(HTMLElement | null)[]>([]);
  const isVisible = useRef(false);
  const rafId = useRef(0);
  const scheduled = useRef(false);
  const [lineGroups, setLineGroups] = useState<number[][] | null>(null);

  const presetConfig = preset !== 'Custom' ? PRESETS[preset] : null;

  const splitMode = presetConfig?.splitMode ?? customSplitMode ?? 'Characters';
  const revealDirection = presetConfig?.revealDirection ?? customRevealDirection ?? 'Left to Right';
  const stagger = presetConfig?.stagger ?? customStagger ?? 0.2;
  const xOffset = presetConfig?.xOffset ?? customXOffset ?? 7;
  const yOffset = presetConfig?.yOffset ?? customYOffset ?? 0;
  const blur = presetConfig?.blur ?? customBlur ?? 0;
  const rotateX = presetConfig?.rotateX ?? customRotateX ?? 0;
  const perspective = presetConfig?.perspective ?? customPerspective ?? 800;
  const scale = presetConfig?.scale ?? customScale ?? 1;
  const isLinesMode = splitMode === 'Lines';

  const { allSpans, unitCount, wordGroups } = useMemo(() => {
    const tokens = String(text).split(/(\s+)/);
    const spans: SpanEntry[] = [];
    let unitIdx = 0;
    tokens.forEach((token) => {
      const isSpace = /^\s+$/.test(token);
      const chars = Array.from(token);
      if (isSpace) {
        chars.forEach((ch) => spans.push({ char: ch, unit: -1, isSpace: true }));
      } else if (splitMode === 'Words' || splitMode === 'Lines') {
        const idx = unitIdx++;
        chars.forEach((ch) => spans.push({ char: ch, unit: idx, isSpace: false }));
      } else {
        chars.forEach((ch) => spans.push({ char: ch, unit: unitIdx++, isSpace: false }));
      }
    });
    const groups: WordGroup[] = [];
    let current: WordGroup | null = null;
    spans.forEach((span, i) => {
      if (span.isSpace) {
        if (current) {
          groups.push(current);
          current = null;
        }
        groups.push({ type: 'space', spans: [{ ...span, idx: i }] });
      } else {
        if (!current) current = { type: 'word', spans: [] };
        current.spans.push({ ...span, idx: i });
      }
    });
    if (current) groups.push(current);
    if (revealDirection === 'Right to Left' && !isLinesMode) {
      const max = unitIdx - 1;
      spans.forEach((s) => {
        if (!s.isSpace) s.unit = max - s.unit;
      });
    }
    return { allSpans: spans, unitCount: unitIdx, wordGroups: groups };
  }, [text, splitMode, revealDirection, isLinesMode]);

  // Lines mode: detect line breaks after render
  useEffect(() => {
    if (!isLinesMode) {
      if (lineGroups !== null) setLineGroups(null);
      return;
    }
    const detect = () => {
      const container = containerRef.current;
      if (!container) return;
      const wordEls = container.querySelectorAll('[data-wg]');
      if (wordEls.length === 0) return;
      const positions: { gi: number; top: number }[] = [];
      wordEls.forEach((el) => {
        positions.push({ gi: parseInt((el as HTMLElement).dataset.wg || '0'), top: Math.round(el.getBoundingClientRect().top) });
      });
      const lineWordGis: number[][] = [];
      let currentLine: number[] = [];
      let lastTop = -Infinity;
      positions.forEach(({ gi, top }) => {
        if (currentLine.length > 0 && Math.abs(top - lastTop) > 3) {
          lineWordGis.push([...currentLine]);
          currentLine = [];
        }
        currentLine.push(gi);
        lastTop = top;
      });
      if (currentLine.length > 0) lineWordGis.push([...currentLine]);
      const lines = lineWordGis.map((wordGis, li) => {
        const start = wordGis[0];
        const end = li < lineWordGis.length - 1 ? lineWordGis[li + 1][0] : wordGroups.length;
        return Array.from({ length: end - start }, (_, k) => start + k);
      });
      if (revealDirection === 'Right to Left') lines.reverse();
      setLineGroups(lines);
    };
    requestAnimationFrame(() => requestAnimationFrame(detect));
  }, [text, splitMode, revealDirection, font, isLinesMode, wordGroups.length]);

  // Animation engine
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (isLinesMode && !lineGroups) return;
    const totalUnits = isLinesMode ? (lineGroups as number[][]).length : unitCount;
    if (totalUnits === 0) return;
    if (!isLinesMode) {
      spanRefs.current = spanRefs.current.slice(0, allSpans.length);
    }
    const dur = 0.7;
    const totalTime = dur + (totalUnits - 1) * stagger;

    const applyProgress = (scrollP: number) => {
      const time = scrollP * totalTime;
      if (isLinesMode) {
        lineRefs.current.forEach((el, lineIdx) => {
          if (!el) return;
          const p = totalUnits <= 1 ? scrollP : Math.max(0, Math.min(1, (time - lineIdx * stagger) / dur));
          const ty = ((1 - p) * 100).toFixed(1);
          let tf = `translateY(${ty}%)`;
          if (rotateX !== 0) tf = `perspective(${perspective}px) rotateX(${(rotateX * (1 - p)).toFixed(1)}deg) ${tf}`;
          if (scale < 1) tf += ` scale(${(scale + (1 - scale) * p).toFixed(3)})`;
          el.style.transform = tf;
          el.style.opacity = `${0.3 + p * 0.7}`;
          el.style.filter = blur > 0 ? `blur(${(blur * (1 - p)).toFixed(1)}px)` : '';
          const pct = Math.round(p * 100);
          el.style.color = `color-mix(in srgb, ${colorRevealed} ${pct}%, ${colorHidden})`;
        });
      } else {
        spanRefs.current.forEach((el, i) => {
          if (!el) return;
          const span = allSpans[i];
          if (!span || span.isSpace) return;
          const p = totalUnits <= 1 ? scrollP : Math.max(0, Math.min(1, (time - span.unit * stagger) / dur));
          el.style.opacity = `${0.3 + p * 0.7}`;
          const tx = (-xOffset + xOffset * p).toFixed(1);
          const ty = (yOffset * (1 - p)).toFixed(1);
          let tf = '';
          if (rotateX !== 0) tf = `perspective(${perspective}px) rotateX(${(rotateX * (1 - p)).toFixed(1)}deg) `;
          tf += `translateX(${tx}px) translateY(${ty}px)`;
          if (scale < 1) tf += ` scale(${(scale + (1 - scale) * p).toFixed(3)})`;
          el.style.transform = tf;
          el.style.filter = blur > 0 ? `blur(${(blur * (1 - p)).toFixed(1)}px)` : '';
          const pct = Math.round(p * 100);
          el.style.color = `color-mix(in srgb, ${colorRevealed} ${pct}%, ${colorHidden})`;
        });
      }
    };

    if (trigger === 'On Load') {
      let started = false;
      applyProgress(0);
      const startAnimation = () => {
        if (started) return;
        started = true;
        const startTime = performance.now();
        const animate = (now: number) => {
          const elapsed = (now - startTime) / 1000;
          const rawP = Math.min(1, elapsed / onLoadDuration);
          applyProgress(1 - Math.pow(1 - rawP, 3));
          if (rawP < 1) rafId.current = requestAnimationFrame(animate);
        };
        rafId.current = requestAnimationFrame(animate);
      };
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            observer.disconnect();
            startAnimation();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(container);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(rafId.current);
      };
    }

    // Scroll-based animation
    const startFrac = offsetStart / 100;
    const endFrac = offsetEnd / 100;
    const update = () => {
      const vh = window.innerHeight;
      const rect = container.getBoundingClientRect();
      const range = (startFrac - endFrac) * vh;
      let scrollP: number;
      if (isLinesMode) {
        scrollP = 1;
        if (range > 0) {
          scrollP = Math.max(0, Math.min(1, (startFrac * vh - rect.top) / range));
          if (scrollP === 0 && rect.top < vh && rect.bottom > 0) scrollP = 1;
        }
      } else {
        if (range <= 0) return;
        scrollP = Math.max(0, Math.min(1, (startFrac * vh - rect.top) / range));
      }
      applyProgress(scrollP);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (entry.isIntersecting) update();
      },
      { rootMargin: '200px' }
    );
    observer.observe(container);
    const onScroll = () => {
      if (!isVisible.current || scheduled.current) return;
      scheduled.current = true;
      rafId.current = requestAnimationFrame(() => {
        update();
        scheduled.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [allSpans, unitCount, lineGroups, isLinesMode, stagger, xOffset, yOffset, blur, rotateX, perspective, scale, trigger, onLoadDuration, offsetStart, offsetEnd, colorHidden, colorRevealed]);

  const Tag = htmlTag as ElementType;
  const containerStyle: CSSProperties = { display: 'inline-block', ...font, ...style };

  const renderWordGroup = (group: WordGroup, gi: number) => {
    if (group.type === 'word') {
      return (
        <span key={`w-${gi}`} data-wg={gi} style={{ whiteSpace: 'nowrap', display: 'inline' }}>
          {group.spans.map(({ char, idx }) => (
            <span
              key={idx}
              ref={(el) => {
                spanRefs.current[idx] = el;
              }}
              style={{ display: 'inline-block', willChange: isLinesMode ? undefined : 'transform, opacity, color, filter' }}
            >
              {char}
            </span>
          ))}
        </span>
      );
    }
    return group.spans.map(({ char, idx }) => (
      <span key={idx} style={{ display: 'inline-block' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  if (isLinesMode && lineGroups) {
    return (
      <Tag ref={containerRef} style={containerStyle}>
        {lineGroups.map((groupIndices, lineIdx) => (
          <div key={lineIdx} style={{ overflow: 'hidden', display: 'block' }}>
            <div
              ref={(el) => {
                lineRefs.current[lineIdx] = el;
              }}
              style={{ display: 'block', willChange: 'transform, opacity, filter' }}
            >
              {groupIndices.map((gi) => renderWordGroup(wordGroups[gi], gi))}
            </div>
          </div>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={containerRef} style={containerStyle}>
      {wordGroups.map((group, gi) => renderWordGroup(group, gi))}
    </Tag>
  );
}
