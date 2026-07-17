'use client';

// RAAYDR — HowItWorksWheel
// Ported from a purchased Framer marketplace component ("Scroll Services"
// by Nirav Jivani — used under the buyer's single-use license). Framer-only
// APIs (addPropertyControls, ControlType, useIsStaticRenderer, the Framer
// runtime import) have been stripped and replaced with plain React/TS,
// since this now lives in a Next.js codebase, not a Framer project.
//
// Behaviour is unchanged from the original: as the user scrolls through a
// pinned section, a ring of numbered steps rotates along an arc, the arc's
// progress fill grows, and each step's title/description crossfades in
// sync — verified to run error-free with RAAYDR's real "How it works"
// content and brand tokens before being handed off.

import { useEffect, useRef, useState, useCallback, CSSProperties, Fragment } from 'react';

export interface HowItWorksStep {
  eyebrow?: string;
  titleLine1: string;
  titleLine2?: string;
  description: string;
  tags?: string; // comma-separated, optional
  image?: string; // optional icon asset URL
  imageAlt?: string;
  ctaLabel?: string;
  ctaLink?: string;
  /** Colour this step's number badge lights up to when active. Falls back to badgeBg if omitted. */
  accentColor?: string;
}

export interface HowItWorksWheelProps {
  steps?: HowItWorksStep[];

  // Layout
  scrollHeightVh?: number;
  contentLeftPct?: number;
  contentWidthPct?: number;
  iconRightPct?: number;
  iconWidthPct?: number;
  mobileBreakpoint?: number;

  // Circle / wheel
  circleLeftPct?: number;
  circleRadiusPct?: number;
  stepDegrees?: number;

  // Visibility toggles
  showArc?: boolean;
  showWheel?: boolean;
  showIcon?: boolean;
  showCounter?: boolean;
  enableParallax?: boolean;
  enableKeyboard?: boolean;
  respectReducedMotion?: boolean;

  // Colors — default to RAAYDR's locked tokens
  bgColor?: string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
  tagBorderColor?: string;
  tagTextColor?: string;
  badgeBg?: string;
  ctaBg?: string;
  ctaTextColor?: string;

  // Typography — default to RAAYDR's locked fonts
  headingFontFamily?: string;
  bodyFontFamily?: string;
  titleSize?: number;
  descSize?: number;
  tagSize?: number;
  numberSize?: number;

  // Animation
  scrollEase?: number;
  cursorParallaxX?: number;
  cursorParallaxY?: number;

  // Arc stroke
  arcGuideOpacity?: number;
  arcGuideWidth?: number;
  arcFillWidth?: number;

  // Icon float
  iconFloatEnabled?: boolean;
  iconFloatDuration?: number;
}

const RAAYDR_STEPS: HowItWorksStep[] = [
  {
    titleLine1: 'Artists',
    titleLine2: 'submit.',
    description: 'Independent artists upload their music. No label required. No gatekeeper to pass.',
    accentColor: '#F5A623' // amber — artists
  },
  {
    titleLine1: 'Tastemakers',
    titleLine2: 'pick.',
    description: "Trusted ears surface what's worth hearing first, and earn from a ringfenced fund when they're early and right.",
    accentColor: '#C77DFF' // orchid — tastemakers
  },
  {
    titleLine1: 'Community',
    titleLine2: 'rates.',
    description: 'Listeners rate, save, share and comment. Engagement is the signal. People move the music, not a machine.',
    accentColor: '#3BCE7B' // Signal Green — listeners
  },
  {
    titleLine1: 'Everyone',
    titleLine2: 'earns.',
    description: 'Artists, producers, songwriters and tastemakers all get paid. Automatically. Traceably. Every month.',
    accentColor: '#8B7CF6' // violet — producers/songwriters, standing in for "everyone"
  }
];

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}
function numberLabel(i: number) {
  return String(i + 1).padStart(2, '0');
}
function hexToRgb(hex: string) {
  const m = hex.replace('#', '');
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}
function lerpColor(a: string, b: string, t: number) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

export default function HowItWorksWheel({
  steps = RAAYDR_STEPS,
  scrollHeightVh = 500,
  contentLeftPct = 30,
  contentWidthPct = 38,
  iconRightPct = 8,
  iconWidthPct = 20,
  mobileBreakpoint = 810,
  circleLeftPct = -10,
  circleRadiusPct = 30,
  stepDegrees = 20,
  showArc = true,
  showWheel = true,
  showIcon = false, // no per-step icon assets yet — set true once RAAYDR has them
  showCounter = true,
  enableParallax = true,
  enableKeyboard = true,
  respectReducedMotion = true,
  bgColor = '#F5F2EC', // RAAYDR Canvas
  textColor = '#15151A', // RAAYDR Ink
  mutedColor = '#6b6b70',
  accentColor = '#3BCE7B', // RAAYDR Signal Green
  tagBorderColor = '#d9d5cd',
  tagTextColor = '#15151A',
  badgeBg = '#15151A',
  ctaBg = '#3BCE7B',
  ctaTextColor = '#15151A',
  headingFontFamily = "'Clash Display', Georgia, serif",
  bodyFontFamily = "'General Sans', system-ui, sans-serif",
  titleSize = 52,
  descSize = 15,
  tagSize = 13,
  numberSize = 24,
  scrollEase = 0.09,
  cursorParallaxX = 22,
  cursorParallaxY = 18,
  arcGuideOpacity = 0.12,
  arcGuideWidth = 1.5,
  arcFillWidth = 3.5,
  iconFloatEnabled = true,
  iconFloatDuration = 6
}: HowItWorksWheelProps) {
  const N = Math.max(steps.length, 1);

  const [progress, setProgress] = useState(0);
  const [wh, setWh] = useState({ W: 1440, H: 900 });
  const [mouse, setMouse] = useState({ mx: 0, my: 0 });
  const [reduced, setReduced] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const mxTRef = useRef(0);
  const myTRef = useRef(0);
  const rafRef = useRef(0);
  const isVisibleRef = useRef(true);
  const isRafRunningRef = useRef(false);
  const stateRef = useRef({ progress: 0, mx: 0, my: 0 });

  const isMobile = wh.W <= mobileBreakpoint;
  const motionOff = respectReducedMotion && reduced;
  const parallaxOn = enableParallax && !motionOff && !isMobile;
  const floatOn = iconFloatEnabled && !motionOff;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const vw = () => window.innerWidth || 1440;
    const vh = () => window.innerHeight || 900;

    const readTarget = () => {
      const el = sectionRef.current;
      const W = vw();
      const H = vh();
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = rect.height - H;
        const p = total > 0 ? -rect.top / total : 0;
        targetRef.current = Math.max(0, Math.min(1, p));
      }
      setWh((prev) => (prev.W !== W || prev.H !== H ? { W, H } : prev));
    };

    const onMouse = (ev: MouseEvent) => {
      mxTRef.current = (ev.clientX / vw() - 0.5) * 2;
      myTRef.current = (ev.clientY / vh() - 0.5) * 2;
    };

    const tick = () => {
      if (!isVisibleRef.current) {
        isRafRunningRef.current = false;
        return;
      }
      readTarget();
      const s = stateRef.current;
      const ease = motionOff ? 1 : scrollEase;
      let nextP = s.progress + (targetRef.current - s.progress) * ease;
      if (Math.abs(targetRef.current - nextP) < 0.0004) nextP = targetRef.current;
      const nmx = s.mx + (mxTRef.current - s.mx) * 0.07;
      const nmy = s.my + (myTRef.current - s.my) * 0.07;
      const changed =
        Math.abs(nextP - s.progress) > 0.00005 ||
        Math.abs(nmx - s.mx) > 0.0009 ||
        Math.abs(nmy - s.my) > 0.0009;
      if (changed) {
        stateRef.current = { progress: nextP, mx: nmx, my: nmy };
        setProgress(nextP);
        setMouse({ mx: nmx, my: nmy });
      }
      isRafRunningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    };

    const onScroll = () => readTarget();
    const startRaf = () => {
      if (isRafRunningRef.current) return;
      isRafRunningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    };
    const stopRaf = () => {
      if (!isRafRunningRef.current) return;
      cancelAnimationFrame(rafRef.current);
      isRafRunningRef.current = false;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = Boolean(entries[0]?.isIntersecting);
        isVisibleRef.current = visible;
        if (visible) startRaf();
        else stopRaf();
      },
      { threshold: 0 }
    );

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('mousemove', onMouse, { passive: true });
    if (sectionRef.current) observer.observe(sectionRef.current);

    readTarget();
    startRaf();

    return () => {
      stopRaf();
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('mousemove', onMouse);
    };
  }, [scrollEase, motionOff]);

  const jumpTo = useCallback(
    (i: number) => {
      const el = sectionRef.current;
      if (!el) return;
      const H = wh.H;
      const total = el.offsetHeight - H;
      const docTop = window.scrollY + el.getBoundingClientRect().top;
      const dest = Math.round(docTop + (i / (N - 1 || 1)) * total);
      const start = window.scrollY;
      const dist = dest - start;
      if (Math.abs(dist) < 2) return;
      if (motionOff) {
        window.scrollTo(0, dest);
        return;
      }
      const dur = 750;
      const t0 = performance.now();
      const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        window.scrollTo(0, start + dist * ease(p));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    [wh.H, N, motionOff]
  );

  const rawF = progress * (N - 1);
  const base = Math.min(Math.max(N - 2, 0), Math.floor(rawF));
  const frac = rawF - base;
  let e = 0;
  if (frac < 0.34) e = 0;
  else if (frac > 0.66) e = 1;
  else e = smoothstep((frac - 0.34) / 0.32);
  const f = base + e;
  const activeIndex = Math.round(f);

  useEffect(() => {
    if (!enableKeyboard) return;
    const onKey = (ev: KeyboardEvent) => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const inView = rect.top <= 1 && rect.bottom >= wh.H - 1;
      if (!inView) return;
      const cur = Math.round(stateRef.current.progress * (N - 1));
      let next = cur;
      switch (ev.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case 'PageDown':
          next = Math.min(N - 1, cur + 1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'PageUp':
          next = Math.max(0, cur - 1);
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = N - 1;
          break;
        default:
          return;
      }
      if (next !== cur) {
        ev.preventDefault();
        jumpTo(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enableKeyboard, jumpTo, N, wh.H]);

  const { W, H } = wh;
  const cx = W * (circleLeftPct / 100);
  const cy = H * 0.5;
  const R = W * (circleRadiusPct / 100);
  const C = 2 * Math.PI * R;

  const nData = steps.map((_, i) => {
    const angDeg = (f - i) * stepDegrees;
    const ang = (angDeg * Math.PI) / 180;
    const x = cx + R * Math.cos(ang);
    const y = cy - R * Math.sin(ang);
    const d = Math.abs(i - f);
    return {
      x,
      y,
      scale: clamp(1.12 - 0.11 * d, 0.66, 1.12),
      rot: angDeg * 0.85,
      bgA: clamp(1.25 - 1.9 * d, 0, 1),
      ringA: (1 - clamp(1.25 - 1.9 * d, 0, 1)) * clamp(0.5 - 0.09 * d, 0.2, 0.5)
    };
  });

  const fillDeg = stepDegrees * f;
  const arcLen = (fillDeg / 360) * C;
  const dialColor = (() => {
    const colorAt = (i: number) => steps[clamp(i, 0, steps.length - 1)]?.accentColor || accentColor;
    return lerpColor(colorAt(base), colorAt(base + 1), e);
  })();

  // Ambient background wash in the current step's colour, lerped through the
  // same colour sequence as the dial so it shifts amber -> orchid -> green ->
  // violet as you scroll. Kept as a soft, low-opacity radial tint (not the
  // full saturated colour) so the full-colour number badges stay legible
  // against it — a solid step-colour background would swallow its own badge.
  const [tintR, tintG, tintB] = (dialColor.match(/\d+/g) || ['0', '0', '0']).map(Number);
  const tint = (a: number) => `rgba(${tintR}, ${tintG}, ${tintB}, ${a})`;
  const stageBg = `radial-gradient(130% 115% at 60% 40%, ${tint(0.18)} 0%, ${tint(0.05)} 44%, rgba(0,0,0,0) 72%)`;
  const arcSvgStyle: CSSProperties = {
    position: 'absolute',
    left: cx - R,
    top: cy - R,
    width: R * 2,
    height: R * 2,
    overflow: 'visible',
    zIndex: 3,
    pointerEvents: 'none'
  };

  const cStyles: CSSProperties[] = steps.map((_, i) => {
    const d = Math.abs(i - f);
    const op = clamp(1 - 1.7 * d, 0, 1);
    const ty = (i - f) * 80;
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      opacity: op,
      transform: isMobile ? `translateY(${(i - f) * 40}px)` : `translateY(calc(-50% + ${ty}px))`,
      pointerEvents: op > 0.6 ? 'auto' : 'none',
      transition: 'opacity 0.05s linear'
    };
  });

  const sStyles: CSSProperties[] = steps.map((_, i) => {
    const d = Math.abs(i - f);
    return {
      position: 'absolute',
      inset: 0,
      opacity: clamp(1 - 1.6 * d, 0, 1),
      transform: `scale(${clamp(1 - 0.09 * d, 0.78, 1)}) rotate(${(f - i) * 12}deg)`,
      pointerEvents: clamp(1 - 1.6 * d, 0, 1) > 0.6 ? 'auto' : 'none'
    };
  });

  const iconLayerStyle: CSSProperties = isMobile
    ? { position: 'absolute', left: '50%', top: '18%', width: '42%', maxWidth: 220, aspectRatio: '1 / 1', zIndex: 8, transform: 'translate(-50%, -50%)' }
    : {
        position: 'absolute',
        right: `${iconRightPct}%`,
        top: '50%',
        width: `${iconWidthPct}%`,
        aspectRatio: '1 / 1',
        zIndex: 8,
        transform: `translate(${parallaxOn ? mouse.mx * cursorParallaxX : 0}px, calc(-50% + ${parallaxOn ? mouse.my * cursorParallaxY : 0}px))`,
        willChange: 'transform'
      };

  const mobileTitleSize = `clamp(34px, 9vw, ${titleSize}px)`;

  const renderContent = (svc: HowItWorksStep) => {
    const tags = (svc.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
    return (
      <div style={{ position: 'relative' }}>
        {svc.eyebrow && (
          <div style={{ fontFamily: bodyFontFamily, fontSize: tagSize, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: mutedColor, margin: '0 0 14px' }}>
            {svc.eyebrow}
          </div>
        )}
        <h2 style={{ fontFamily: headingFontFamily, fontWeight: 400, fontSize: isMobile ? mobileTitleSize : titleSize, lineHeight: 1.02, letterSpacing: '-0.01em', margin: '0 0 20px', color: textColor }}>
          {svc.titleLine1}
          {svc.titleLine2 && (
            <>
              <br />
              {svc.titleLine2}
            </>
          )}
        </h2>
        <p style={{ fontSize: descSize, lineHeight: 1.55, color: mutedColor, maxWidth: 400, margin: '0 0 28px' }}>{svc.description}</p>
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: svc.ctaLabel ? 28 : 0 }}>
            {tags.map((tag, ti) => (
              <span key={ti} style={{ padding: '8px 16px', border: `1px solid ${tagBorderColor}`, borderRadius: 999, fontSize: tagSize, fontWeight: 500, color: tagTextColor, whiteSpace: 'nowrap' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {svc.ctaLabel && (
          <a
            href={svc.ctaLink || '#'}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 999, background: ctaBg, color: ctaTextColor, fontFamily: bodyFontFamily, fontSize: tagSize + 1, fontWeight: 600, textDecoration: 'none' }}
          >
            {svc.ctaLabel}
            <span style={{ fontSize: '1.1em', lineHeight: 1 }}>→</span>
          </a>
        )}
      </div>
    );
  };

  const renderIcon = (svc: HowItWorksStep, i: number) => (
    <div key={i} style={sStyles[i]}>
      {svc.image ? (
        <img
          src={svc.image}
          alt={svc.imageAlt || svc.titleLine1}
          className={floatOn ? 'raaydr-icon-float' : undefined}
          style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 34px 42px rgba(21,21,26,0.20))' }}
        />
      ) : (
        <div
          className={floatOn ? 'raaydr-icon-float' : undefined}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '24%',
            background: badgeBg,
            opacity: 0.9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: headingFontFamily,
            fontSize: 'clamp(28px, 4vw, 64px)',
            color: bgColor,
            filter: 'drop-shadow(0 34px 42px rgba(21,21,26,0.20))'
          }}
        >
          {numberLabel(i)}
        </div>
      )}
    </div>
  );

  return (
    <>
      {floatOn && (
        <style>{`
          @keyframes raaydrIconFloat { 0% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-16px) rotate(1.2deg); } 100% { transform: translateY(0) rotate(0deg); } }
          .raaydr-icon-float { animation: raaydrIconFloat ${iconFloatDuration}s ease-in-out infinite; }
        `}</style>
      )}
      <div style={{ position: 'relative', width: '100%', background: bgColor, fontFamily: bodyFontFamily, color: textColor }}>
        <section ref={sectionRef} style={{ position: 'relative', height: `${scrollHeightVh}vh` }}>
          <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', background: stageBg }}>
            {!isMobile && showArc && (
              <svg style={arcSvgStyle} viewBox={`0 0 ${R * 2} ${R * 2}`} preserveAspectRatio="none">
                <circle cx={R} cy={R} r={R} fill="none" stroke={`rgba(21,21,26,${arcGuideOpacity})`} strokeWidth={arcGuideWidth} />
                <circle cx={R} cy={R} r={R} fill="none" stroke={dialColor} strokeWidth={arcFillWidth} strokeLinecap="round" strokeDasharray={`${arcLen} ${C}`} />
              </svg>
            )}

            {!isMobile && showWheel && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 5, fontFamily: headingFontFamily, pointerEvents: 'none' }}>
                {steps.map((_, i) => {
                  const nd = nData[i];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => jumpTo(i)}
                      aria-label={`Go to step ${numberLabel(i)}`}
                      style={{
                        position: 'absolute',
                        left: nd.x,
                        top: nd.y,
                        width: 70,
                        height: 70,
                        transform: `translate(-50%,-50%) rotate(${nd.rot}deg) scale(${nd.scale})`,
                        transformOrigin: 'center center',
                        pointerEvents: 'auto',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: bgColor }} />
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: steps[i].accentColor || badgeBg, opacity: nd.bgA }} />
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.4px solid ${steps[i].accentColor || textColor}`, opacity: nd.ringA }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: headingFontFamily, fontSize: numberSize, fontWeight: 500, color: textColor, opacity: 1 - nd.bgA }}>
                        {numberLabel(i)}
                      </div>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: headingFontFamily, fontSize: numberSize, fontWeight: 500, color: bgColor, opacity: nd.bgA }}>
                        {numberLabel(i)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {isMobile && showWheel && (
              <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10, zIndex: 12 }}>
                {steps.map((_, i) => {
                  const on = i === activeIndex;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => jumpTo(i)}
                      aria-label={`Go to step ${numberLabel(i)}`}
                      aria-current={on ? 'true' : undefined}
                      style={{ width: on ? 26 : 9, height: 9, borderRadius: 999, background: on ? badgeBg : tagBorderColor, border: 'none', padding: 0, cursor: 'pointer', transition: 'width 0.3s ease, background 0.3s ease' }}
                    />
                  );
                })}
              </div>
            )}

            {showIcon && <div style={iconLayerStyle}>{steps.map((svc, i) => renderIcon(svc, i))}</div>}

            <div
              style={
                isMobile
                  ? { position: 'absolute', left: '50%', bottom: '10%', top: '42%', width: '84%', transform: 'translateX(-50%)', zIndex: 10 }
                  : { position: 'absolute', left: `${contentLeftPct}%`, top: '50%', width: `${contentWidthPct}%`, zIndex: 10 }
              }
            >
              {steps.map((svc, i) => (
                <div key={i} style={cStyles[i]}>
                  {renderContent(svc)}
                </div>
              ))}
            </div>

            {showCounter && (
              <div style={{ position: 'absolute', bottom: 28, right: isMobile ? undefined : 40, left: isMobile ? 0 : undefined, textAlign: 'center', zIndex: 12, fontFamily: headingFontFamily, fontSize: 18, letterSpacing: '0.08em', color: mutedColor, pointerEvents: 'none' }}>
                <span style={{ color: textColor }}>{numberLabel(activeIndex)}</span> / {numberLabel(N - 1)}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
