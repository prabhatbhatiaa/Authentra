import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ParticleField — one WebGL particle object that lives behind the whole landing
 * page and morphs as the visitor scrolls.
 *
 * Every section marks itself with `data-scene="<shape>"` plus optional
 * placement attributes (`data-x`, `data-y`, `data-scale`, `data-opacity`,
 * `data-mobile-opacity`, `data-rx`). The field interpolates between consecutive sections: the
 * particles hold a shape while its section is on screen and morph into the
 * next one during the last stretch before it arrives.
 *
 * Performance: a single `THREE.Points` draw call; all morphing, staggering and
 * shimmer happen in the vertex shader, so the CPU only updates a handful of
 * uniforms per frame. Pixel ratio is capped, rendering pauses when the tab is
 * hidden, and reduced-motion users get a still object that only follows scroll.
 */

const SHAPES = ['sphere', 'layers', 'helix', 'lattice'] as const;
type ShapeName = (typeof SHAPES)[number];

interface Stop {
  top: number;
  shape: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  /** Opacity on narrow screens, where the object sits behind the text. */
  mobileOpacity: number;
  rx: number;
}

/* ── Shape generators (all return `count` xyz triples, radius ≈ 1.6) ───── */

function rand(seed: number) {
  // Deterministic hash → [0,1) so shapes are identical between renders.
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function sphere(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const ringStart = Math.floor(count * 0.86);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (i < ringStart) {
      const k = i / (ringStart - 1);
      const yy = 1 - k * 2;
      const r = Math.sqrt(1 - yy * yy);
      const th = golden * i;
      const R = 1.45 * (1 + (rand(i) - 0.5) * 0.025);
      x = Math.cos(th) * r * R;
      y = yy * R;
      z = Math.sin(th) * r * R;
    } else {
      // A thin orbital ring around the sphere.
      const a = rand(i) * Math.PI * 2;
      const R = 2.05 + rand(i + 7) * 0.22;
      x = Math.cos(a) * R;
      y = (rand(i + 3) - 0.5) * 0.02;
      z = Math.sin(a) * R;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

function layers(count: number): Float32Array {
  // Three stacked plates: relational core, reconciler, ledger.
  const out = new Float32Array(count * 3);
  const half = 1.25;
  for (let i = 0; i < count; i++) {
    const plate = i % 3;
    const y = (plate - 1) * 0.82;
    let x: number, z: number;
    if (rand(i + 11) < 0.32) {
      // Crisp perimeter
      const t = rand(i + 5) * 4;
      const side = Math.floor(t);
      const f = (t - side) * 2 - 1;
      x = side === 0 ? f * half : side === 1 ? half : side === 2 ? -f * half : -half;
      z = side === 0 ? -half : side === 1 ? f * half : side === 2 ? half : -f * half;
    } else {
      x = (rand(i + 1) * 2 - 1) * half;
      z = (rand(i + 2) * 2 - 1) * half;
    }
    out.set([x, y + (rand(i + 9) - 0.5) * 0.015, z], i * 3);
  }
  return out;
}

function helix(count: number): Float32Array {
  // Double helix with rungs — a chain of custody.
  const out = new Float32Array(count * 3);
  const turns = 2.25;
  const height = 3.6;
  const radius = 0.85;
  const rungs = 22;
  for (let i = 0; i < count; i++) {
    const r0 = rand(i);
    let x: number, y: number, z: number;
    if (rand(i + 4) < 0.8) {
      const strand = i % 2;
      const t = r0;
      const a = t * turns * Math.PI * 2 + strand * Math.PI;
      const jitter = 0.05;
      x = Math.cos(a) * radius + (rand(i + 1) - 0.5) * jitter;
      z = Math.sin(a) * radius + (rand(i + 2) - 0.5) * jitter;
      y = (t - 0.5) * height;
    } else {
      const k = Math.floor(r0 * rungs) / (rungs - 1);
      const a = k * turns * Math.PI * 2;
      const f = rand(i + 6) * 2 - 1;
      x = Math.cos(a) * radius * f;
      z = Math.sin(a) * radius * f;
      y = (k - 0.5) * height;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

function lattice(count: number): Float32Array {
  // A 3×3×3 crystalline lattice: points sampled along every grid line.
  const out = new Float32Array(count * 3);
  const g = [-1.2, -0.4, 0.4, 1.2];
  for (let i = 0; i < count; i++) {
    const axis = i % 3;
    const a = g[Math.floor(rand(i + 1) * 4)];
    const b = g[Math.floor(rand(i + 2) * 4)];
    const t = (rand(i + 3) * 2 - 1) * 1.2;
    const p = axis === 0 ? [t, a, b] : axis === 1 ? [a, t, b] : [a, b, t];
    out.set(p, i * 3);
  }
  return out;
}

/* ── Shaders ──────────────────────────────────────────────────────────── */

const vertexShader = /* glsl */ `
  attribute vec3 aS0;
  attribute vec3 aS1;
  attribute vec3 aS2;
  attribute vec3 aS3;
  attribute float aRand;
  attribute float aSize;

  uniform float uFrom;
  uniform float uTo;
  uniform float uT;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  varying float vAlpha;
  varying float vAccent;

  vec3 shapeAt(float i) {
    if (i < 0.5) return aS0;
    if (i < 1.5) return aS1;
    if (i < 2.5) return aS2;
    return aS3;
  }

  void main() {
    // Staggered morph: each particle starts a little later than the last.
    float t = clamp(uT * 1.5 - aRand * 0.5, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 a = shapeAt(uFrom);
    vec3 b = shapeAt(uTo);
    vec3 p = mix(a, b, t);

    // Particles lift outward mid-flight, then settle — reads as "dissolve and reform".
    float flight = sin(t * 3.14159);
    p += normalize(p + vec3(0.0001)) * flight * (0.15 + aRand * 0.35);

    // Gentle idle shimmer.
    p += 0.012 * vec3(
      sin(uTime * 0.9 + aRand * 31.0),
      cos(uTime * 0.7 + aRand * 17.0),
      sin(uTime * 0.8 + aRand * 23.0)
    );

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aSize * uPixelRatio / -mv.z;

    float depth = clamp((-mv.z - 4.6) / 2.8, 0.0, 1.0);
    vAlpha = mix(1.0, 0.12, depth);
    vAccent = step(0.982, aRand);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vAccent;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, d);
    if (a < 0.02) discard;
    vec3 col = mix(uColor, uAccent, vAccent);
    gl_FragColor = vec4(col, a * vAlpha * uOpacity * mix(0.8, 1.4, vAccent));
  }
`;

/* ── Helpers ──────────────────────────────────────────────────────────── */

function cssColor(name: string): THREE.Color {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const [r, g, b] = raw.split(/\s+/).map(Number);
  return new THREE.Color(r / 255, g / 255, b / 255);
}

function readStops(): Stop[] {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'));
  let lastShape = 0;
  return nodes.map((el) => {
    const name = el.dataset.scene as ShapeName | 'none';
    const shapeIdx = SHAPES.indexOf(name as ShapeName);
    const shape = shapeIdx >= 0 ? shapeIdx : lastShape;
    lastShape = shape;
    const opacity = name === 'none' ? 0 : Number(el.dataset.opacity ?? 1);
    return {
      top: el.getBoundingClientRect().top + window.scrollY,
      shape,
      x: Number(el.dataset.x ?? 0),
      y: Number(el.dataset.y ?? 0),
      scale: Number(el.dataset.scale ?? 1),
      opacity,
      mobileOpacity: name === 'none' ? 0 : Number(el.dataset.mobileOpacity ?? opacity * 0.3),
      rx: Number(el.dataset.rx ?? 0.35),
    };
  });
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/* ── Component ────────────────────────────────────────────────────────── */

export function ParticleField({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return; // No WebGL — the page still reads fine without the object.
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.innerWidth < 768;
    const count = isSmall ? 9000 : 16000;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, 6);

    // Geometry: four shape buffers + per-particle randomness.
    const geometry = new THREE.BufferGeometry();
    const s0 = sphere(count);
    geometry.setAttribute('position', new THREE.BufferAttribute(s0, 3));
    geometry.setAttribute('aS0', new THREE.BufferAttribute(s0, 3));
    geometry.setAttribute('aS1', new THREE.BufferAttribute(layers(count), 3));
    geometry.setAttribute('aS2', new THREE.BufferAttribute(helix(count), 3));
    geometry.setAttribute('aS3', new THREE.BufferAttribute(lattice(count), 3));
    const aRand = new Float32Array(count);
    const aSize = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      aRand[i] = rand(i + 0.5);
      aSize[i] = 0.55 + rand(i + 99) * 0.9;
    }
    geometry.setAttribute('aRand', new THREE.BufferAttribute(aRand, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
    // Shapes extend past the base positions; skip frustum culling.
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);

    const uniforms = {
      uFrom: { value: 0 },
      uTo: { value: 0 },
      uT: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: isSmall ? 10 : 11.5 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uColor: { value: cssColor('--fg') },
      uAccent: { value: cssColor('--accent') },
      uOpacity: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
    });

    const applyTheme = () => {
      const dark = document.documentElement.classList.contains('dark');
      uniforms.uColor.value = cssColor('--fg');
      uniforms.uAccent.value = cssColor('--accent');
      material.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      material.needsUpdate = true;
    };
    applyTheme();

    const points = new THREE.Points(geometry, material);
    const group = new THREE.Group();
    group.add(points);
    scene.add(group);

    // ── Layout ──
    let width = 1;
    let height = 1;
    let halfW = 1;
    let halfH = 1;
    let stops: Stop[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      halfW = halfH * camera.aspect;
      stops = readStops();
    };
    resize();
    window.addEventListener('resize', resize);
    // Sections change height as fonts and data load; keep stop offsets fresh.
    const bodyObserver = new ResizeObserver(() => (stops = readStops()));
    bodyObserver.observe(document.body);

    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // ── Pointer parallax ──
    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    const onPointer = (e: PointerEvent) => {
      tmx = (e.clientX / width) * 2 - 1;
      tmy = (e.clientY / height) * 2 - 1;
    };
    if (!reduced && !isSmall) window.addEventListener('pointermove', onPointer, { passive: true });

    // ── Smoothed state ──
    const state = { x: 0, y: 0, scale: 1, opacity: 0, rx: 0.35 };
    let anchor = window.scrollY + height * 0.5;
    let spin = 0;
    let last = performance.now();
    let raf = 0;
    let running = false;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Follow the scroll anchor with frame-rate independent damping.
      const targetAnchor = window.scrollY + height * 0.5;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 10);
      anchor += (targetAnchor - anchor) * k;

      // Locate the active segment. The probe sits below the viewport centre so a
      // section's shape is fully formed by the time its top reaches the lower
      // third of the screen, and is held for the rest of that section.
      const probe = anchor + height * 0.2;
      let i = 0;
      while (i < stops.length - 1 && probe >= stops[i + 1].top) i++;
      const a = stops[i];
      const b = stops[Math.min(i + 1, stops.length - 1)];
      let t = 0;
      if (a && b && b !== a) {
        t = smooth(b.top - height * 0.45, b.top, probe);
      }

      if (a) {
        uniforms.uFrom.value = a.shape;
        uniforms.uTo.value = b.shape;
        uniforms.uT.value = t;

        const small = width < 768;
        const tx = small ? 0 : lerp(a.x, b.x, t);
        const ty = small ? lerp(a.y, b.y, t) * 0.5 + 0.28 : lerp(a.y, b.y, t);
        const ts = lerp(a.scale, b.scale, t) * (small ? 0.62 : Math.min(1, width / 1280) * 0.25 + 0.75);
        const to = small ? lerp(a.mobileOpacity, b.mobileOpacity, t) : lerp(a.opacity, b.opacity, t);
        const trx = lerp(a.rx, b.rx, t);

        const ease = reduced ? 1 : 1 - Math.exp(-dt * 6);
        state.x += (tx - state.x) * ease;
        state.y += (ty - state.y) * ease;
        state.scale += (ts - state.scale) * ease;
        state.opacity += (to - state.opacity) * ease;
        state.rx += (trx - state.rx) * ease;
      }

      if (!reduced) {
        spin += dt * 0.07;
        uniforms.uTime.value = now / 1000;
      }
      const pk = 1 - Math.exp(-dt * 3);
      mx += (tmx - mx) * pk;
      my += (tmy - my) * pk;

      group.position.set(state.x * halfW, state.y * halfH, 0);
      group.scale.setScalar(state.scale);
      group.rotation.set(state.rx + my * 0.12, spin + anchor * 0.00028 + mx * 0.25, 0);
      uniforms.uOpacity.value = state.opacity;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    // Let section layout settle (fonts, lazy content) before the first read.
    const settle = window.setTimeout(() => (stops = readStops()), 400);
    start();

    return () => {
      stop();
      window.clearTimeout(settle);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      bodyObserver.disconnect();
      themeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" className={className} />;
}
