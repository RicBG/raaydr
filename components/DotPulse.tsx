"use client";

// DotPulse — a pulsing dot-field background rendered with raw WebGL. Dots are
// GPU points animated entirely in a vertex shader (no three.js, no per-frame
// CPU loop), using travelling gaussian pulse rings, selectable phase patterns,
// colour mixing and pointer interaction.
//
// Adapted from a Framer component: the Framer runtime (addPropertyControls,
// useIsStaticRenderer) is removed; it renders the canvas on the client and
// draws a single still frame under prefers-reduced-motion. dotColor/pulseColor
// must be literal colours (hex/rgba), not CSS custom properties, because they
// are parsed to RGBA for the shader.

import { useEffect, useRef, type CSSProperties } from "react";
import { createRenderGate } from "@/lib/renderGate";

type Pattern = "ripple" | "wave" | "spiral" | "breathe";

type DotPulseProps = {
  pattern?: Pattern;
  backgroundColor?: string;
  dotColor?: string;
  pulseColor?: string;
  spacing?: number;
  dotSize?: number;
  speed?: number;
  ringGap?: number;
  pulseWidth?: number;
  swell?: number;
  push?: number;
  angle?: number;
  twist?: number;
  jitter?: number;
  followPointer?: boolean;
  style?: CSSProperties;
};

const PATTERN_INDEX: Record<string, number> = {
  ripple: 0,
  wave: 1,
  spiral: 2,
  breathe: 3,
};

const VERTEX_SHADER = `
precision highp float;

attribute vec2 aPos;
attribute float aRand;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uOrigin;
uniform float uPattern;
uniform float uWavelength;
uniform float uSpeed;
uniform float uPulseWidth;
uniform float uSwell;
uniform float uPush;
uniform float uDotSize;
uniform float uAngle;
uniform float uTwist;
uniform float uJitter;
uniform float uDpr;

varying float vPulse;

float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
        mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

void main() {
    vec2 rel = aPos - uOrigin;
    float phase;
    vec2 pushDir;

    if (uPattern < 0.5) {
        // Ripple: rings expand from the origin
        phase = length(rel) / uWavelength;
        pushDir = normalize(rel + vec2(0.0001, 0.0));
    } else if (uPattern < 1.5) {
        // Wave: a flat front sweeps across in one direction
        vec2 dir = vec2(cos(uAngle), sin(uAngle));
        phase = dot(rel, dir) / uWavelength;
        pushDir = dir;
    } else if (uPattern < 2.5) {
        // Spiral: rings twist around the origin
        float a = atan(rel.y, rel.x);
        phase = length(rel) / uWavelength + (a / 6.28318530718) * uTwist;
        pushDir = normalize(rel + vec2(0.0001, 0.0));
    } else {
        // Breathe: organic patches swell in and out
        phase = vnoise(aPos / uWavelength) * 3.0;
        pushDir = vec2(cos(aRand * 6.28318530718), sin(aRand * 6.28318530718));
    }

    float t = uTime * uSpeed - phase + (aRand - 0.5) * uJitter;
    float c = fract(t) - 0.5;
    float pulse = exp(-(c * c) / (uPulseWidth * uPulseWidth));
    vPulse = pulse;

    vec2 pos = aPos + pushDir * pulse * uPush * uDpr;
    vec2 clip = (pos / uRes) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

    float size = uDotSize * uDpr * (1.0 + uSwell * pulse);
    gl_PointSize = max(size, 0.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

uniform vec4 uDotColor;
uniform vec4 uPulseColor;

varying float vPulse;

void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c) * 2.0;
    float edge = smoothstep(1.0, 0.82, r);
    vec4 col = mix(uDotColor, uPulseColor, vPulse);
    float alpha = col.a * edge;
    gl_FragColor = vec4(col.rgb * alpha, alpha);
}
`;

function parseColor(color: string): [number, number, number, number] {
  if (typeof document === "undefined") return [1, 1, 1, 1];
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [1, 1, 1, 1];
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  const a = d[3] / 255;
  return [d[0] / 255, d[1] / 255, d[2] / 255, a];
}

function compileProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  if (!vs || !fs) return null;
  gl.shaderSource(vs, VERTEX_SHADER);
  gl.compileShader(vs);
  gl.shaderSource(fs, FRAGMENT_SHADER);
  gl.compileShader(fs);
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  return program;
}

function buildGrid(
  width: number,
  height: number,
  dpr: number,
  spacing: number
): { positions: Float32Array; rands: Float32Array; count: number } {
  // Keep the dot count sane on huge canvases
  let s = Math.max(spacing, 6);
  while ((width / s) * (height / (s * 0.866)) > 60000) s *= 1.5;

  const pad = 64;
  const rowH = s * 0.866;
  const cols = Math.ceil((width + pad * 2) / s) + 1;
  const rows = Math.ceil((height + pad * 2) / rowH) + 1;
  const positions: number[] = [];
  const rands: number[] = [];
  let seed = 1234.5678;

  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let j = 0; j < rows; j++) {
    const y = -pad + j * rowH;
    const offset = (j % 2) * s * 0.5;
    for (let i = 0; i < cols; i++) {
      const x = -pad + offset + i * s;
      const nx = x + (random() - 0.5) * s * 0.3;
      const ny = y + (random() - 0.5) * s * 0.3;
      positions.push(nx * dpr, ny * dpr);
      rands.push(random());
    }
  }

  return {
    positions: new Float32Array(positions),
    rands: new Float32Array(rands),
    count: rands.length,
  };
}

export default function DotPulse({
  pattern = "ripple",
  backgroundColor = "#05060A",
  dotColor = "rgba(255, 255, 255, 0.22)",
  pulseColor = "#8DF0FF",
  spacing = 26,
  dotSize = 5,
  speed = 0.35,
  ringGap = 180,
  pulseWidth = 0.14,
  swell = 1.6,
  push = 10,
  angle = 0,
  twist = 3,
  jitter = 0.08,
  followPointer = true,
  style,
}: DotPulseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof window === "undefined") return;

    // Create the canvas per mount rather than reusing a ref'd element: cleanup
    // calls loseContext(), which permanently poisons the canvas it ran on, so a
    // reused element would hand the next mount (React StrictMode double-invokes
    // effects in dev) a dead context and render nothing. A fresh element each
    // time sidesteps that.
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    if (!gl) {
      canvas.remove();
      return;
    }

    // If the GPU context is lost (device reset, or too many live WebGL contexts
    // on the page), hide the canvas so its parent's dark background shows
    // cleanly rather than a broken buffer.
    const onContextLost = (e: Event) => {
      e.preventDefault();
      canvas.style.opacity = "0";
    };
    canvas.addEventListener("webglcontextlost", onContextLost, false);

    const program = compileProgram(gl);
    if (!program) return;
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    const randBuffer = gl.createBuffer();
    const aPos = gl.getAttribLocation(program, "aPos");
    const aRand = gl.getAttribLocation(program, "aRand");
    const uniforms = {
      uRes: gl.getUniformLocation(program, "uRes"),
      uTime: gl.getUniformLocation(program, "uTime"),
      uOrigin: gl.getUniformLocation(program, "uOrigin"),
      uPattern: gl.getUniformLocation(program, "uPattern"),
      uWavelength: gl.getUniformLocation(program, "uWavelength"),
      uSpeed: gl.getUniformLocation(program, "uSpeed"),
      uPulseWidth: gl.getUniformLocation(program, "uPulseWidth"),
      uSwell: gl.getUniformLocation(program, "uSwell"),
      uPush: gl.getUniformLocation(program, "uPush"),
      uDotSize: gl.getUniformLocation(program, "uDotSize"),
      uAngle: gl.getUniformLocation(program, "uAngle"),
      uTwist: gl.getUniformLocation(program, "uTwist"),
      uJitter: gl.getUniformLocation(program, "uJitter"),
      uDpr: gl.getUniformLocation(program, "uDpr"),
      uDotColor: gl.getUniformLocation(program, "uDotColor"),
      uPulseColor: gl.getUniformLocation(program, "uPulseColor"),
    };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let dotCount = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let widthCss = 0;
    let heightCss = 0;

    // Pulse origin eases toward the pointer target
    const origin = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let hasSized = false;

    const rebuild = () => {
      const rect = container.getBoundingClientRect();
      widthCss = Math.max(rect.width, 1);
      heightCss = Math.max(rect.height, 1);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(widthCss * dpr);
      canvas.height = Math.round(heightCss * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);

      const grid = buildGrid(widthCss, heightCss, dpr, spacing);
      dotCount = grid.count;

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, grid.positions, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, randBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, grid.rands, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(aRand);
      gl.vertexAttribPointer(aRand, 1, gl.FLOAT, false, 0, 0);

      const cx = (widthCss / 2) * dpr;
      const cy = (heightCss / 2) * dpr;
      if (!hasSized) {
        origin.x = cx;
        origin.y = cy;
        hasSized = true;
      }
      target.x = cx;
      target.y = cy;
    };

    rebuild();

    const dotRGBA = parseColor(dotColor);
    const pulseRGBA = parseColor(pulseColor);

    const draw = (time: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uniforms.uRes, canvas.width, canvas.height);
      gl.uniform1f(uniforms.uTime, time);
      gl.uniform2f(uniforms.uOrigin, origin.x, origin.y);
      gl.uniform1f(uniforms.uPattern, PATTERN_INDEX[pattern] ?? 0);
      gl.uniform1f(uniforms.uWavelength, Math.max(ringGap, 10) * dpr);
      gl.uniform1f(uniforms.uSpeed, speed);
      gl.uniform1f(uniforms.uPulseWidth, Math.max(pulseWidth, 0.02));
      gl.uniform1f(uniforms.uSwell, swell);
      gl.uniform1f(uniforms.uPush, push);
      gl.uniform1f(uniforms.uDotSize, dotSize);
      gl.uniform1f(uniforms.uAngle, (angle * Math.PI) / 180);
      gl.uniform1f(uniforms.uTwist, twist);
      gl.uniform1f(uniforms.uJitter, jitter);
      gl.uniform1f(uniforms.uDpr, dpr);
      gl.uniform4f(uniforms.uDotColor, dotRGBA[0], dotRGBA[1], dotRGBA[2], dotRGBA[3]);
      gl.uniform4f(uniforms.uPulseColor, pulseRGBA[0], pulseRGBA[1], pulseRGBA[2], pulseRGBA[3]);
      gl.drawArrays(gl.POINTS, 0, dotCount);
    };

    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (reducedMotion) {
      // Single, pleasant still frame — no animation loop
      draw(0.6 / Math.max(speed, 0.01));
      return () => {
        canvas.removeEventListener("webglcontextlost", onContextLost);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.remove();
      };
    }

    let raf = 0;
    let running = false;
    const start = performance.now();

    const loop = () => {
      origin.x += (target.x - origin.x) * 0.06;
      origin.y += (target.y - origin.y) * 0.06;
      draw((performance.now() - start) / 1000);
      raf = window.requestAnimationFrame(loop);
    };
    const startRaf = () => {
      if (running) return;
      running = true;
      raf = window.requestAnimationFrame(loop);
    };
    const stopRaf = () => {
      if (!running) return;
      running = false;
      window.cancelAnimationFrame(raf);
    };
    // Gate the loop to on-screen AND tab-visible, fully stopping the rAF when
    // off-screen. (The previous bespoke IntersectionObserver only skipped the
    // draw and kept the loop spinning at 60fps, including on background tabs.)
    const releaseGate = createRenderGate(container, startRaf, stopRaf);

    const resizeObserver = new ResizeObserver(() => rebuild());
    resizeObserver.observe(container);

    const onPointerMove = (e: PointerEvent) => {
      if (!followPointer) return;
      const rect = container.getBoundingClientRect();
      target.x = (e.clientX - rect.left) * dpr;
      target.y = (e.clientY - rect.top) * dpr;
    };
    const onPointerLeave = () => {
      target.x = (widthCss / 2) * dpr;
      target.y = (heightCss / 2) * dpr;
    };
    const usesOrigin = pattern === "ripple" || pattern === "spiral";
    if (followPointer && usesOrigin) {
      container.addEventListener("pointermove", onPointerMove);
      container.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      releaseGate();
      stopRaf();
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [
    pattern,
    dotColor,
    pulseColor,
    spacing,
    dotSize,
    speed,
    ringGap,
    pulseWidth,
    swell,
    push,
    angle,
    twist,
    jitter,
    followPointer,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor,
        ...style,
      }}
    />
  );
}
