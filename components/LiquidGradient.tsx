"use client";

// RAAYDR closing "liquid gradient" — a flowing, mouse-reactive gradient field
// that backs the "Join the first wave" section. Ported from a Framer/three.js
// component to OGL (the project's only WebGL dependency — see MetaballField),
// keeping the original GLSL verbatim so the look is unchanged; only the harness
// (three's Renderer/Camera/Plane + Texture) is swapped for OGL's
// Renderer + Triangle + Texture, and a full-screen triangle replaces the
// camera+plane so no projection maths are needed.
//
// Perf: this is a heavier fragment shader than the hero Orb (up to 12 animated
// gradient centres), so — exactly like MetaballField — it is mounted through
// LazyMount (single GL context at the foot of the page) and its render loop is
// gated to on-screen + visible-tab via createRenderGate. Desktop/motion-only;
// FirstWave renders a static gradient under reduced motion and on mobile.
//
// The interactive touch ripple is preserved: pointer movement paints velocity
// into a small 64×64 canvas texture that the shader samples to distort the UVs.

import { Mesh, Program, Renderer, Texture, Triangle, Vec2, Vec3 } from "ogl";
import { useEffect, useRef } from "react";
import { createRenderGate } from "@/lib/renderGate";

interface LiquidGradientProps {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  color5?: string;
  color6?: string;
  /** The base colour the gradient emerges from — RAAYDR's cream Canvas so the
   *  field sits on the section background rather than a dark navy. */
  backgroundColor?: string;
  animationSpeed?: number;
  gradientIntensity?: number;
  gradientSize?: number;
  gradientCount?: number;
  touchStrength?: number;
  grainIntensity?: number;
  color1Weight?: number;
  color2Weight?: number;
}

// Small velocity-trail texture painted by pointer movement — sampled by the
// shader to push the UVs around for the "liquid" reaction. Logic unchanged from
// the original; only the GPU texture is an OGL Texture instead of THREE.Texture.
class TouchTexture {
  size = 64;
  width = 64;
  height = 64;
  maxAge = 64;
  radius = 0.25 * 64;
  speed = 1 / 64;
  trail: {
    x: number;
    y: number;
    age: number;
    force: number;
    vx: number;
    vy: number;
  }[] = [];
  last: { x: number; y: number } | null = null;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: Texture;

  constructor(gl: Renderer["gl"]) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.texture = new Texture(gl, {
      image: this.canvas,
      generateMipmaps: false,
      flipY: false,
    });
  }

  update() {
    this.clear();
    const speed = this.speed;
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i];
      const f = point.force * speed * (1 - point.age / this.maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1);
      } else {
        this.drawPoint(point);
      }
    }
    this.texture.image = this.canvas;
    this.texture.needsUpdate = true;
  }

  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  addTouch(point: { x: number; y: number }) {
    let force = 0;
    let vx = 0;
    let vy = 0;
    const last = this.last;
    if (last) {
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / d;
      vy = dy / d;
      force = Math.min(dd * 20000, 2.0);
    }
    this.last = { x: point.x, y: point.y };
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
  }

  drawPoint(point: {
    x: number;
    y: number;
    age: number;
    force: number;
    vx: number;
    vy: number;
  }) {
    const pos = { x: point.x * this.width, y: (1 - point.y) * this.height };
    let intensity = 1;
    if (point.age < this.maxAge * 0.3) {
      intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2));
    } else {
      const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7);
      intensity = -t * (t - 2);
    }
    intensity *= point.force;

    const radius = this.radius;
    const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`;
    const offset = this.size * 5;
    this.ctx.shadowOffsetX = offset;
    this.ctx.shadowOffsetY = offset;
    this.ctx.shadowBlur = radius * 1;
    this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;

    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255,0,0,1)";
    this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

const VERT = /* glsl */ `
  precision highp float;
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Fragment shader kept verbatim from the source component (only a leading
// precision qualifier added, which OGL does not inject for us).
const FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;
  uniform vec3 uColor6;
  uniform float uSpeed;
  uniform float uIntensity;
  uniform sampler2D uTouchTexture;
  uniform float uGrainIntensity;
  uniform vec3 uDarkNavy;
  uniform float uGradientSize;
  uniform float uGradientCount;
  uniform float uColor1Weight;
  uniform float uColor2Weight;
  uniform float uTouchStrength;

  varying vec2 vUv;

  #define PI 3.14159265359

  float grain(vec2 uv, float time) {
    vec2 grainUv = uv * uResolution * 0.5;
    float grainValue = fract(sin(dot(grainUv + time, vec2(12.9898, 78.233))) * 43758.5453);
    return grainValue * 2.0 - 1.0;
  }

  vec3 getGradientColor(vec2 uv, float time) {
    float gradientRadius = uGradientSize;

    vec2 center1 = vec2(0.5 + sin(time * uSpeed * 0.4) * 0.4, 0.5 + cos(time * uSpeed * 0.5) * 0.4);
    vec2 center2 = vec2(0.5 + cos(time * uSpeed * 0.6) * 0.5, 0.5 + sin(time * uSpeed * 0.45) * 0.5);
    vec2 center3 = vec2(0.5 + sin(time * uSpeed * 0.35) * 0.45, 0.5 + cos(time * uSpeed * 0.55) * 0.45);
    vec2 center4 = vec2(0.5 + cos(time * uSpeed * 0.5) * 0.4, 0.5 + sin(time * uSpeed * 0.4) * 0.4);
    vec2 center5 = vec2(0.5 + sin(time * uSpeed * 0.7) * 0.35, 0.5 + cos(time * uSpeed * 0.6) * 0.35);
    vec2 center6 = vec2(0.5 + cos(time * uSpeed * 0.45) * 0.5, 0.5 + sin(time * uSpeed * 0.65) * 0.5);
    vec2 center7 = vec2(0.5 + sin(time * uSpeed * 0.55) * 0.38, 0.5 + cos(time * uSpeed * 0.48) * 0.42);
    vec2 center8 = vec2(0.5 + cos(time * uSpeed * 0.65) * 0.36, 0.5 + sin(time * uSpeed * 0.52) * 0.44);
    vec2 center9 = vec2(0.5 + sin(time * uSpeed * 0.42) * 0.41, 0.5 + cos(time * uSpeed * 0.58) * 0.39);
    vec2 center10 = vec2(0.5 + cos(time * uSpeed * 0.48) * 0.37, 0.5 + sin(time * uSpeed * 0.62) * 0.43);
    vec2 center11 = vec2(0.5 + sin(time * uSpeed * 0.68) * 0.33, 0.5 + cos(time * uSpeed * 0.44) * 0.46);
    vec2 center12 = vec2(0.5 + cos(time * uSpeed * 0.38) * 0.39, 0.5 + sin(time * uSpeed * 0.56) * 0.41);

    float dist1 = length(uv - center1);
    float dist2 = length(uv - center2);
    float dist3 = length(uv - center3);
    float dist4 = length(uv - center4);
    float dist5 = length(uv - center5);
    float dist6 = length(uv - center6);
    float dist7 = length(uv - center7);
    float dist8 = length(uv - center8);
    float dist9 = length(uv - center9);
    float dist10 = length(uv - center10);
    float dist11 = length(uv - center11);
    float dist12 = length(uv - center12);

    float influence1 = 1.0 - smoothstep(0.0, gradientRadius, dist1);
    float influence2 = 1.0 - smoothstep(0.0, gradientRadius, dist2);
    float influence3 = 1.0 - smoothstep(0.0, gradientRadius, dist3);
    float influence4 = 1.0 - smoothstep(0.0, gradientRadius, dist4);
    float influence5 = 1.0 - smoothstep(0.0, gradientRadius, dist5);
    float influence6 = 1.0 - smoothstep(0.0, gradientRadius, dist6);
    float influence7 = 1.0 - smoothstep(0.0, gradientRadius, dist7);
    float influence8 = 1.0 - smoothstep(0.0, gradientRadius, dist8);
    float influence9 = 1.0 - smoothstep(0.0, gradientRadius, dist9);
    float influence10 = 1.0 - smoothstep(0.0, gradientRadius, dist10);
    float influence11 = 1.0 - smoothstep(0.0, gradientRadius, dist11);
    float influence12 = 1.0 - smoothstep(0.0, gradientRadius, dist12);

    vec2 rotatedUv1 = uv - 0.5;
    float angle1 = time * uSpeed * 0.15;
    rotatedUv1 = vec2(
      rotatedUv1.x * cos(angle1) - rotatedUv1.y * sin(angle1),
      rotatedUv1.x * sin(angle1) + rotatedUv1.y * cos(angle1)
    );
    rotatedUv1 += 0.5;

    vec2 rotatedUv2 = uv - 0.5;
    float angle2 = -time * uSpeed * 0.12;
    rotatedUv2 = vec2(
      rotatedUv2.x * cos(angle2) - rotatedUv2.y * sin(angle2),
      rotatedUv2.x * sin(angle2) + rotatedUv2.y * cos(angle2)
    );
    rotatedUv2 += 0.5;

    float radialGradient1 = length(rotatedUv1 - 0.5);
    float radialGradient2 = length(rotatedUv2 - 0.5);
    float radialInfluence1 = 1.0 - smoothstep(0.0, 0.8, radialGradient1);
    float radialInfluence2 = 1.0 - smoothstep(0.0, 0.8, radialGradient2);

    vec3 color = vec3(0.0);
    color += uColor1 * influence1 * (0.55 + 0.45 * sin(time * uSpeed)) * uColor1Weight;
    color += uColor2 * influence2 * (0.55 + 0.45 * cos(time * uSpeed * 1.2)) * uColor2Weight;
    color += uColor3 * influence3 * (0.55 + 0.45 * sin(time * uSpeed * 0.8)) * uColor1Weight;
    color += uColor4 * influence4 * (0.55 + 0.45 * cos(time * uSpeed * 1.3)) * uColor2Weight;
    color += uColor5 * influence5 * (0.55 + 0.45 * sin(time * uSpeed * 1.1)) * uColor1Weight;
    color += uColor6 * influence6 * (0.55 + 0.45 * cos(time * uSpeed * 0.9)) * uColor2Weight;

    if (uGradientCount > 6.0) {
      color += uColor1 * influence7 * (0.55 + 0.45 * sin(time * uSpeed * 1.4)) * uColor1Weight;
      color += uColor2 * influence8 * (0.55 + 0.45 * cos(time * uSpeed * 1.5)) * uColor2Weight;
      color += uColor3 * influence9 * (0.55 + 0.45 * sin(time * uSpeed * 1.6)) * uColor1Weight;
      color += uColor4 * influence10 * (0.55 + 0.45 * cos(time * uSpeed * 1.7)) * uColor2Weight;
    }
    if (uGradientCount > 10.0) {
      color += uColor5 * influence11 * (0.55 + 0.45 * sin(time * uSpeed * 1.8)) * uColor1Weight;
      color += uColor6 * influence12 * (0.55 + 0.45 * cos(time * uSpeed * 1.9)) * uColor2Weight;
    }

    color += mix(uColor1, uColor3, radialInfluence1) * 0.45 * uColor1Weight;
    color += mix(uColor2, uColor4, radialInfluence2) * 0.4 * uColor2Weight;

    color = clamp(color, vec3(0.0), vec3(1.0)) * uIntensity;

    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luminance), color, 1.35);
    color = pow(color, vec3(0.92));

    float brightness1 = length(color);
    float mixFactor1 = max(brightness1 * 1.2, 0.15);
    color = mix(uDarkNavy, color, mixFactor1);

    float maxBrightness = 1.0;
    float brightness = length(color);
    if (brightness > maxBrightness) {
      color = color * (maxBrightness / brightness);
    }

    return color;
  }

  void main() {
    vec2 uv = vUv;

    vec4 touchTex = texture2D(uTouchTexture, uv);
    float vx = -(touchTex.r * 2.0 - 1.0);
    float vy = -(touchTex.g * 2.0 - 1.0);
    float intensity = touchTex.b;
    uv.x += vx * 0.8 * intensity * uTouchStrength;
    uv.y += vy * 0.8 * intensity * uTouchStrength;

    vec2 center = vec2(0.5);
    float dist = length(uv - center);
    float ripple = sin(dist * 20.0 - uTime * 3.0) * 0.04 * intensity * uTouchStrength;
    float wave = sin(dist * 15.0 - uTime * 2.0) * 0.03 * intensity * uTouchStrength;
    uv += vec2(ripple + wave);

    vec3 color = getGradientColor(uv, uTime);

    float grainValue = grain(uv, uTime);
    color += grainValue * uGrainIntensity;

    float timeShift = uTime * 0.5;
    color.r += sin(timeShift) * 0.02;
    color.g += cos(timeShift * 1.4) * 0.02;
    color.b += sin(timeShift * 1.2) * 0.02;

    color = clamp(color, vec3(0.0), vec3(1.0));

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function LiquidGradient({
  // Tuned to the hero Orb's own colours so the closing field echoes it:
  // fuchsia at the top, pink/lavender on the sides, amber-gold at the foot —
  // no cyan (the Orb shows none). Warm magenta family dominant, amber an
  // accent, violet bridging to the rest of the site.
  color1 = "#DB5AD6", // fuchsia (Orb top)
  color2 = "#B98BF0", // lavender / violet
  color3 = "#EC7FB5", // rose pink
  color4 = "#C266DA", // magenta-violet
  color5 = "#F0A63C", // amber / gold (Orb foot)
  color6 = "#F0A0C4", // soft pink
  backgroundColor = "#F5F2EC", // cream Canvas token
  animationSpeed = 1.1,
  gradientIntensity = 1.15,
  gradientSize = 0.5,
  gradientCount = 12,
  touchStrength = 1.0,
  grainIntensity = 0.04,
  color1Weight = 1.0,
  color2Weight = 1.1,
}: LiquidGradientProps) {
  const ctnDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    // Cap DPR at 1.25: this 12-centre shader is fill-rate hungry and a soft
    // full-bleed gradient gains nothing visible from extra device pixels, so
    // the lower cap buys real headroom on weaker GPUs. antialias is off for the
    // same reason — there are no hard edges in a blurred gradient to alias.
    const renderer = new Renderer({
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 1.25),
      powerPreference: "high-performance",
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const touch = new TouchTexture(gl);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2(1, 1) },
        uColor1: { value: hexToVec3(color1) },
        uColor2: { value: hexToVec3(color2) },
        uColor3: { value: hexToVec3(color3) },
        uColor4: { value: hexToVec3(color4) },
        uColor5: { value: hexToVec3(color5) },
        uColor6: { value: hexToVec3(color6) },
        uSpeed: { value: animationSpeed },
        uIntensity: { value: gradientIntensity },
        uTouchTexture: { value: touch.texture },
        uGrainIntensity: { value: grainIntensity },
        uDarkNavy: { value: hexToVec3(backgroundColor) },
        uGradientSize: { value: gradientSize },
        uGradientCount: { value: gradientCount },
        uColor1Weight: { value: color1Weight },
        uColor2Weight: { value: color2Weight },
        uTouchStrength: { value: touchStrength },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // Pointer → touch trail. The field layer is pointer-events:none (so the
    // form stays clickable), so we listen on the window and map into the
    // canvas box, only registering movement that falls within it.
    const onPointer = (clientX: number, clientY: number) => {
      const rect = gl.canvas.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      touch.addTouch({ x, y });
    };
    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length) onPointer(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    let rafId = 0;
    let running = false;
    let lastTime = 0;
    const update = (t: number) => {
      const delta = Math.min((t - lastTime) * 0.001, 0.1);
      lastTime = t;
      program.uniforms.uTime.value += delta;
      touch.update();
      renderer.render({ scene: mesh });
      rafId = requestAnimationFrame(update);
    };

    // Only render while on-screen and the tab is visible (see MetaballField /
    // the hero Orb) — otherwise a heavy shader keeps drawing off-screen.
    const startRaf = () => {
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(update);
    };
    const stopRaf = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    };
    const releaseGate = createRenderGate(container, startRaf, stopRaf);

    return () => {
      releaseGate();
      stopRaf();
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      geometry.remove();
      program.remove();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    color1,
    color2,
    color3,
    color4,
    color5,
    color6,
    backgroundColor,
    animationSpeed,
    gradientIntensity,
    gradientSize,
    gradientCount,
    touchStrength,
    grainIntensity,
    color1Weight,
    color2Weight,
  ]);

  return <div ref={ctnDom} style={{ width: "100%", height: "100%" }} />;
}

function hexToVec3(color: string) {
  if (color.startsWith("#")) {
    return new Vec3(
      parseInt(color.slice(1, 3), 16) / 255,
      parseInt(color.slice(3, 5), 16) / 255,
      parseInt(color.slice(5, 7), 16) / 255
    );
  }
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    return new Vec3(
      parseInt(m[1]) / 255,
      parseInt(m[2]) / 255,
      parseInt(m[3]) / 255
    );
  }
  return new Vec3(0.545, 0.361, 0.965);
}
