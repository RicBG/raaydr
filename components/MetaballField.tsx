// RAAYDR closing orb field — a metaball / "lava-lamp" evolution of the hero
// Orb. Several soft blobs drift and merge into and out of one another. Built on
// the same OGL setup as RaaydrOrb (Renderer + Triangle + fragment shader) and
// deliberately kept cheap: a small fixed blob count, one screen-filling pass,
// no post effects. It emits premultiplied colour with an alpha carved from the
// metaball field, so the section's real Canvas background shows through the
// gaps and the blobs blend seamlessly with it.

import { Mesh, Program, Renderer, Triangle, Vec3 } from "ogl";
import { useEffect, useRef } from "react";
import { createRenderGate } from "@/lib/renderGate";

interface MetaballFieldProps {
  backgroundColor?: string;
  /** Blob count. Kept in the 4-6 range for smoothness. */
  count?: number;
}

const VERT = /* glsl */ `
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export default function MetaballField({
  backgroundColor = "#F5F2EC",
  count = 5,
}: MetaballFieldProps) {
  const ctnDom = useRef<HTMLDivElement>(null);

  // Clamp to the smoothness budget and bake it into the shader as a constant
  // loop bound (GLSL ES 1.0 needs a constant loop count).
  const N = Math.max(4, Math.min(6, count));

  const frag = /* glsl */ `
    precision highp float;

    #define N ${N}

    uniform float iTime;
    uniform vec3 iResolution;
    uniform vec3 backgroundColor;
    varying vec2 vUv;

    // Palette: the hero Orb's violet/cyan family, lifted with spectrum orchid,
    // coral and amber so the field reads as the Orb evolving, not a new motif.
    vec3 palette(int i) {
      if (i == 0) return vec3(0.549, 0.478, 0.902); // violet  #8C7AE6
      if (i == 1) return vec3(0.298, 0.760, 0.913); // cyan    #4CC2E9
      if (i == 2) return vec3(0.898, 0.522, 0.675); // orchid  #E585AC
      if (i == 3) return vec3(0.937, 0.388, 0.318); // coral   #EF6351
      return vec3(0.922, 0.658, 0.227);             // amber   #EBA83A
    }

    // Deterministic per-blob drift — different frequencies and phases so they
    // never lock into a pattern, bounded so blobs stay within the frame.
    vec2 blobPos(int i, float t) {
      float f = float(i);
      float a = t * (0.10 + 0.020 * f) + f * 1.7;
      float b = t * (0.08 + 0.015 * f) + f * 2.3;
      return vec2(
        sin(a) * (0.34 + 0.05 * sin(f)),
        cos(b) * (0.26 + 0.04 * cos(f * 1.3))
      );
    }

    void main() {
      // Aspect-correct, centred coordinates.
      vec2 uv = vUv - 0.5;
      uv.x *= iResolution.x / iResolution.y;

      float field = 0.0;      // summed metaball potential
      vec3 colAccum = vec3(0.0);
      float wAccum = 0.0;

      for (int i = 0; i < N; i++) {
        float f = float(i);
        vec2 c = blobPos(i, iTime);
        float r = 0.20 + 0.055 * sin(iTime * 0.6 + f * 1.9); // gentle pulse
        vec2 d = uv - c;
        float w = (r * r) / (dot(d, d) + 1e-4);
        field += w;
        colAccum += palette(i) * w;
        wAccum += w;
      }

      vec3 blobCol = colAccum / max(wAccum, 1e-4);

      // Smooth-union threshold: where several blobs overlap the field climbs
      // past the threshold and they read as one merged mass.
      float shape = smoothstep(0.75, 1.35, field);
      // A brighter core near blob centres for a touch of depth.
      float core = smoothstep(1.6, 3.2, field);
      blobCol = mix(blobCol, blobCol + 0.18, core);

      // Premultiplied output; alpha is the shape so gaps stay transparent.
      gl_FragColor = vec4(blobCol * shape, shape);
    }
  `;

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Vec3(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          ),
        },
        backgroundColor: { value: hexToVec3(backgroundColor) },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      // Cap DPR at 1.5: the field is a soft background, so extra device pixels
      // buy nothing visible but cost real fill rate on high-density phones.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width * dpr, height * dpr);
      gl.canvas.style.width = width + "px";
      gl.canvas.style.height = height + "px";
      program.uniforms.iResolution.value.set(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height
      );
    }
    window.addEventListener("resize", resize);
    resize();

    let rafId = 0;
    let running = false;
    const update = (t: number) => {
      program.uniforms.iTime.value = t * 0.001;
      program.uniforms.backgroundColor.value = hexToVec3(backgroundColor);
      renderer.render({ scene: mesh });
      rafId = requestAnimationFrame(update);
    };

    const startRaf = () => {
      if (running) return;
      running = true;
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
      window.removeEventListener("resize", resize);
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [backgroundColor, frag]);

  return <div ref={ctnDom} style={{ width: "100%", height: "100%" }} />;
}

function hexToVec3(color: string) {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    return new Vec3(r, g, b);
  }
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    return new Vec3(
      parseInt(m[1]) / 255,
      parseInt(m[2]) / 255,
      parseInt(m[3]) / 255
    );
  }
  return new Vec3(0, 0, 0);
}
