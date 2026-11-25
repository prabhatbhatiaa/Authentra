import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ParticleField — one WebGL particle object that lives behind the whole landing
 * page and morphs as the visitor scrolls. Every scene is a miniature of what
 * Authentra does:
 *
 *   bio/crest   hero — the Biometric Vault: a fingerprint whorl that periodically
 *               aligns its ridges into a shield crest and dissolves back, swept
 *               by a scanner band (autonomous cycle, scroll hands off to the
 *               next scene through a continuous crossfade)
 *   fingerprint manifesto — a biometric whorl (W3C DID identity standard)
 *   ledger      architecture — a chain of Aptos blocks linked by hash bridges
 *   custody     lifecycle — a double helix of custody with sealed record blocks
 *   orbits      capabilities — an RBAC system: roles orbiting an authority core
 *   scan        verifier — a radar sweep with verified-asset blips
 *   vault       closing — a geodesic cage locked around a padlock
 *
 * Every section marks itself with `data-scene="<shape>"` plus optional placement
 * attributes (`data-x`, `data-y`, `data-scale`, `data-opacity`,
 * `data-mobile-opacity`, `data-rx`, `data-spin`). The field interpolates between
 * consecutive sections: the particles hold a shape while its section is on
 * screen and morph into the next one during the last stretch before it arrives.
 *
 * Interaction: the cursor carries a field that parts and brightens nearby
 * particles, and every click emits a radar ping — both resolved in the vertex
 * shader. Performance: a single `THREE.Points` draw call; all morphing,
 * staggering, shimmer, scanning and cursor response happen on the GPU. Pixel
 * ratio is capped, rendering pauses when the tab is hidden, and reduced-motion
 * users get a still shield that only follows scroll.
 */

const SHAPES = ['bio', 'crest', 'fingerprint', 'ledger', 'custody', 'orbits', 'scan', 'vault'] as const;
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
  /** Continuous rotation speed in rad/s while this stop holds. */
  spin: number;
}

/* ── Shape generators (all return `count` xyz triples, radius ≈ 1.5 - 2.8) ─── */

function rand(seed: number) {
  // Deterministic hash → [0,1) so shapes are identical between renders.
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Sample a point on the wireframe edges of an axis-aligned cube of size `s`. */
function cubeEdge(s: number, r1: number, r2: number, r3: number): [number, number, number] {
  const axis = Math.floor(r1 * 3); // 0, 1 or 2 — the coordinate that varies
  const side = Math.floor(r2 * 4); // which of the 4 parallel edges
  const a = (side & 1) === 0 ? -1 : 1;
  const b = (side & 2) === 0 ? -1 : 1;
  const h = s / 2;
  const v = (r3 * 2 - 1) * h;
  return axis === 0 ? [v, a * h, b * h] : axis === 1 ? [a * h, v, b * h] : [a * h, b * h, v];
}

/**
 * Hero pair — Dual-Consensus Custody Vault ⇄ Hypercube Block Seal.
 * Every structural element maps directly to Authentra:
 *   - Core: Faceted 3D Asset Crystal ⇄ Tesseract Block Anchor (Move resource + SHA-256 digest)
 *   - Rings: Three tilted Identity (DID), Access (RBAC) & Custody (Aptos) orbits
 *   - Nodes: Consensus validator clusters along the outer shell
 *   - Filaments: Dual-consensus sync streams bridging off-chain & on-chain layers
 *   - Ambient: Expansive 3D provenance field filling the viewport
 */
function heroPair(count: number): { bio: Float32Array; crest: Float32Array } {
  const bio = new Float32Array(count * 3);
  const crest = new Float32Array(count * 3);

  const coreEnd = Math.floor(count * 0.44);
  const ringsEnd = Math.floor(count * 0.70);
  const nodesEnd = Math.floor(count * 0.78);
  const ribbonEnd = Math.floor(count * 0.87);

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    if (i < coreEnd) {
      const idx = i;
      const t = (idx + 0.5) / coreEnd;
      const sub = idx % 10;

      // State A: Faceted 3D Octahedral Asset Crystal + Geodesic Containment Shell
      if (sub < 4) {
        // Inner faceted octahedron (Move linear asset resource)
        const face = Math.floor(rand(i + 3) * 8);
        const sx = (face & 1) ? 1 : -1;
        const sy = (face & 2) ? 1 : -1;
        const sz = (face & 4) ? 1 : -1;
        let u = rand(i + 7);
        let v = rand(i + 11);
        if (u + v > 1) {
          u = 1 - u;
          v = 1 - v;
        }
        const w = 1 - u - v;
        const S = 1.05;
        bio.set([sx * u * S, sy * v * S * 1.18, sz * w * S], i * 3);
      } else {
        // Outer geodesic identity containment sphere
        const phi = Math.acos(1 - 2 * t);
        const theta = goldenAngle * idx;
        const r = 1.38 + (rand(i + 13) - 0.5) * 0.025;
        bio.set([
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ], i * 3);
      }

      // State B: 3D Tesseract / Hypercube Block Anchor + SHA-256 Digest Nucleus
      if (sub < 4) {
        const e = cubeEdge(1.92, rand(i + 17), rand(i + 19), rand(i + 23));
        crest.set([e[0], e[1], e[2]], i * 3);
      } else if (sub < 8) {
        const e = cubeEdge(1.12, rand(i + 29), rand(i + 31), rand(i + 37));
        crest.set([e[0], e[1], e[2]], i * 3);
      } else {
        // Dense cryptographic digest nucleus at center
        const phi = Math.acos(2 * rand(i + 41) - 1);
        const theta = rand(i + 43) * Math.PI * 2;
        const r = 0.28 * Math.cbrt(rand(i + 47));
        crest.set([
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ], i * 3);
      }
    } else if (i < ringsEnd) {
      // Three tilted orbital rings: Identity (DID), Access (RBAC), Custody (Ledger)
      const ring = i % 3;
      const a = rand(i + 1) * Math.PI * 2;
      const R = (ring === 0 ? 1.72 : ring === 1 ? 2.05 : 2.38) + (rand(i + 2) - 0.5) * 0.04;
      const ox = Math.cos(a) * R;
      const oy = (rand(i + 3) - 0.5) * 0.03;
      const oz = Math.sin(a) * R;

      const tiltA = ring === 0 ? 0.52 : ring === 1 ? -0.44 : 0.24;
      const yawA = ring === 0 ? 0.48 : ring === 1 ? -0.55 : 0.92;
      const y1 = oy * Math.cos(tiltA) - oz * Math.sin(tiltA);
      const z1 = oy * Math.sin(tiltA) + oz * Math.cos(tiltA);
      const x1 = ox * Math.cos(yawA) + z1 * Math.sin(yawA);
      const z2 = -ox * Math.sin(yawA) + z1 * Math.cos(yawA);
      bio.set([x1, y1, z2], i * 3);

      // Rings align into a tighter synchronized seal around the block anchor
      const tiltB = ring === 0 ? 0.35 : ring === 1 ? -0.35 : 0.0;
      const yawB = ring === 0 ? 0.78 : ring === 1 ? -0.78 : 0.0;
      const yb1 = oy * Math.cos(tiltB) - oz * Math.sin(tiltB);
      const zb1 = oy * Math.sin(tiltB) + oz * Math.cos(tiltB);
      const xb1 = ox * Math.cos(yawB) + zb1 * Math.sin(yawB);
      const zb2 = -ox * Math.sin(yawB) + zb1 * Math.cos(yawB);
      crest.set([xb1, yb1, zb2], i * 3);
    } else if (i < nodesEnd) {
      // Validator & Merkle verification node clusters pinned around the outer shell
      const node = Math.floor(rand(i) * 12);
      const na = rand(node + 5) * Math.PI * 2;
      const nphi = Math.acos(2 * rand(node + 17) - 1);
      const shellR = 1.88 + rand(node + 29) * 0.36;
      const nx = shellR * Math.sin(nphi) * Math.cos(na) + (rand(i + 1) - 0.5) * 0.11;
      const ny = shellR * Math.sin(nphi) * Math.sin(na) + (rand(i + 2) - 0.5) * 0.11;
      const nz = shellR * Math.cos(nphi) + (rand(i + 3) - 0.5) * 0.11;
      bio.set([nx, ny, nz], i * 3);
      crest.set([nx * 1.05, ny * 1.05, nz * 1.05], i * 3);
    } else if (i < ribbonEnd) {
      // Dual-consensus sync streams (off-chain PostgreSQL ↔ on-chain Aptos Move)
      const strand = i % 2;
      const u = rand(i + 5);
      const angle = u * Math.PI * 4 + strand * Math.PI;
      const radius = 1.45 + u * 1.45 + (rand(i + 7) - 0.5) * 0.12;
      const y = (u - 0.5) * 2.2 + Math.sin(angle * 1.5) * 0.22;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      bio.set([x, y, z], i * 3);
      crest.set([x * 0.96, y * 1.06, z * 0.96], i * 3);
    } else {
      // Expansive 3D provenance field filling the hero space
      const rx = (rand(i + 13) * 2 - 1) * 4.8 - 0.35;
      const ry = (rand(i + 17) * 2 - 1) * 2.9;
      const rz = (rand(i + 19) * 2 - 1) * 2.6 - 0.3;
      bio.set([rx, ry, rz], i * 3);
      crest.set([rx * 1.04, ry * 0.96, rz], i * 3);
    }
  }

  return { bio, crest };
}

function fingerprint(count: number): Float32Array {
  // Biometric whorl: concentric ridge loops with a delta core, on a gentle dome.
  const out = new Float32Array(count * 3);
  const loopsEnd = Math.floor(count * 0.78);
  const ambientEnd = Math.floor(count * 0.9);

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (i < loopsEnd) {
      // Ridge loops — sqrt bias gives outer loops their longer circumference
      const k = Math.min(8, Math.floor(Math.sqrt(rand(i)) * 9));
      const a = rand(i + 1) * Math.PI * 2;
      const r = (0.3 + k * 0.165) * (1 + 0.075 * Math.sin(a * 3 + k * 1.4) + 0.045 * Math.sin(a * 5 - k * 0.7));
      const cx = 0.1 * Math.sin(k * 2.1);
      const cy = 0.12 - 0.03 * k;
      x = cx + Math.cos(a) * r;
      y = cy + Math.sin(a) * r * 1.08;
      z = 0.18 * Math.cos((Math.min(r, 1.8) / 1.8) * (Math.PI / 2)) + (rand(i + 2) - 0.5) * 0.05;
    } else if (i < ambientEnd) {
      const a = rand(i + 3) * Math.PI * 2;
      const phi = Math.acos(2 * rand(i + 4) - 1);
      const r = 1.95 + rand(i + 5) * 0.4;
      x = r * Math.sin(phi) * Math.cos(a);
      y = r * Math.sin(phi) * Math.sin(a);
      z = r * Math.cos(phi) * 0.6;
    } else {
      // Delta core
      const a = rand(i + 6) * Math.PI * 2;
      const phi = Math.acos(2 * rand(i + 7) - 1);
      const r = 0.22 * Math.cbrt(rand(i + 8));
      x = r * Math.sin(phi) * Math.cos(a);
      y = r * Math.sin(phi) * Math.sin(a);
      z = r * Math.cos(phi) * 0.5 + 0.16;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

function ledger(count: number): Float32Array {
  // Aptos ledger: six block frames rising along an arc, hash bridges sagging
  // between consecutive blocks, each block carrying a dense digest nucleus.
  const out = new Float32Array(count * 3);
  const blocks = 6;
  const centers: [number, number, number][] = [];
  for (let j = 0; j < blocks; j++) {
    centers.push([-1.7 + j * 0.68, 0.42 * Math.sin(j * 1.1 + 0.4), 0.3 * Math.cos(j * 1.35)]);
  }
  const edgesEnd = Math.floor(count * 0.62);
  const nucleiEnd = Math.floor(count * 0.78);
  const linksEnd = Math.floor(count * 0.92);

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (i < edgesEnd) {
      const j = Math.floor(rand(i) * blocks);
      const e = cubeEdge(0.42, rand(i + 1), rand(i + 2), rand(i + 3));
      x = centers[j][0] + e[0] + (rand(i + 4) - 0.5) * 0.02;
      y = centers[j][1] + e[1] + (rand(i + 5) - 0.5) * 0.02;
      z = centers[j][2] + e[2];
    } else if (i < nucleiEnd) {
      const j = Math.floor(rand(i) * blocks);
      const a = rand(i + 1) * Math.PI * 2;
      const phi = Math.acos(2 * rand(i + 2) - 1);
      const r = 0.14 * Math.cbrt(rand(i + 3));
      x = centers[j][0] + r * Math.sin(phi) * Math.cos(a);
      y = centers[j][1] + r * Math.sin(phi) * Math.sin(a);
      z = centers[j][2] + r * Math.cos(phi);
    } else if (i < linksEnd) {
      // Hash links, drooping slightly like cable bridges
      const j = Math.floor(rand(i) * (blocks - 1));
      const t = rand(i + 1);
      const sag = 0.18 * Math.sin(t * Math.PI);
      x = centers[j][0] * (1 - t) + centers[j + 1][0] * t + (rand(i + 2) - 0.5) * 0.02;
      y = centers[j][1] * (1 - t) + centers[j + 1][1] * t - sag;
      z = centers[j][2] * (1 - t) + centers[j + 1][2] * t;
    } else {
      x = (rand(i + 4) * 2 - 1) * 2.3;
      y = (rand(i + 5) * 2 - 1) * 1.5;
      z = (rand(i + 6) * 2 - 1) * 1.1;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

function custody(count: number): Float32Array {
  // Custody helix: dual strands of ownership with sealed record blocks as
  // rungs, wrapped by a counter-spiralling audit trace.
  const out = new Float32Array(count * 3);
  const turns = 2.4;
  const height = 3.6;
  const radius = 0.88;
  const rungCount = 10;
  const strandsEnd = Math.floor(count * 0.52);
  const rungsEnd = Math.floor(count * 0.78);
  const counterEnd = Math.floor(count * 0.9);

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (i < strandsEnd) {
      const strand = i % 2;
      const t = rand(i);
      const a = t * turns * Math.PI * 2 + strand * Math.PI;
      x = Math.cos(a) * radius + (rand(i + 1) - 0.5) * 0.05;
      z = Math.sin(a) * radius + (rand(i + 2) - 0.5) * 0.05;
      y = (t - 0.5) * height;
    } else if (i < rungsEnd) {
      // Record blocks riding the strand, rotated to face along the helix
      const k = Math.floor(rand(i) * rungCount);
      const t = k / (rungCount - 1);
      const a = t * turns * Math.PI * 2;
      const e = cubeEdge(0.17, rand(i + 1), rand(i + 2), rand(i + 3));
      const ex = e[0] + radius;
      x = ex * Math.cos(a) - e[2] * Math.sin(a);
      z = ex * Math.sin(a) + e[2] * Math.cos(a);
      y = (t - 0.5) * height + e[1];
    } else if (i < counterEnd) {
      // Counter-spiralling audit trace
      const t = rand(i + 4);
      const a = -t * turns * 1.5 * Math.PI * 2;
      const orbR = radius * 1.65 + rand(i + 5) * 0.16;
      x = Math.cos(a) * orbR;
      z = Math.sin(a) * orbR;
      y = (t - 0.5) * height;
    } else {
      const a = rand(i + 6) * Math.PI * 2;
      const phi = Math.acos(2 * rand(i + 7) - 1);
      const r = 1.7 + rand(i + 8) * 0.45;
      x = r * Math.sin(phi) * Math.cos(a);
      y = r * Math.sin(phi) * Math.sin(a);
      z = r * Math.cos(phi);
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

function ringPos(m: number, a: number): [number, number, number] {
  // Point on RBAC ring `m` (0 inner … 2 outer), each ring tilted and yawed so
  // the three orbits never share a plane.
  const R = [0.95, 1.5, 2.05][m];
  const tilt = [0.18, 0.55, 0.95][m];
  const yaw = [0, 0.7, 1.5][m];
  const ox = Math.cos(a) * R;
  const oz = Math.sin(a) * R;
  const y1 = -oz * Math.sin(tilt);
  const z1 = oz * Math.cos(tilt);
  return [ox * Math.cos(yaw) + z1 * Math.sin(yaw), y1, -ox * Math.sin(yaw) + z1 * Math.cos(yaw)];
}

function orbits(count: number): Float32Array {
  // RBAC system: an authority core, three permission rings, role hubs riding
  // the rings and grant spokes radiating from the core.
  const out = new Float32Array(count * 3);
  const coreEnd = Math.floor(count * 0.14);
  const ringsEnd = Math.floor(count * 0.52);
  const hubsEnd = Math.floor(count * 0.72);
  const spokesEnd = Math.floor(count * 0.88);
  const hubAngle = (hub: number) => Math.floor(hub / 3) * Math.PI + 0.7 * (hub % 3);

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (i < coreEnd) {
      const a = rand(i) * Math.PI * 2;
      const phi = Math.acos(2 * rand(i + 1) - 1);
      const r = 0.3 * Math.cbrt(rand(i + 2));
      x = r * Math.sin(phi) * Math.cos(a);
      y = r * Math.sin(phi) * Math.sin(a);
      z = r * Math.cos(phi);
    } else if (i < ringsEnd) {
      const p = ringPos(Math.floor(rand(i) * 3), rand(i + 1) * Math.PI * 2);
      x = p[0] + (rand(i + 2) - 0.5) * 0.03;
      y = p[1] + (rand(i + 3) - 0.5) * 0.03;
      z = p[2] + (rand(i + 4) - 0.5) * 0.03;
    } else if (i < hubsEnd) {
      const p = ringPos(Math.floor(rand(i) * 6) % 3, hubAngle(Math.floor(rand(i) * 6)));
      x = p[0] + (rand(i + 1) - 0.5) * 0.2;
      y = p[1] + (rand(i + 2) - 0.5) * 0.2;
      z = p[2] + (rand(i + 3) - 0.5) * 0.2;
    } else if (i < spokesEnd) {
      const p = ringPos(Math.floor(rand(i) * 6) % 3, hubAngle(Math.floor(rand(i) * 6)));
      const t = rand(i + 1);
      x = p[0] * t + (rand(i + 2) - 0.5) * 0.02;
      y = p[1] * t + (rand(i + 3) - 0.5) * 0.02;
      z = p[2] * t + (rand(i + 4) - 0.5) * 0.02;
    } else {
      const a = rand(i + 5) * Math.PI * 2;
      const phi = Math.acos(2 * rand(i + 6) - 1);
      const r = 2.2 + rand(i + 7) * 0.35;
      x = r * Math.sin(phi) * Math.cos(a);
      y = r * Math.sin(phi) * Math.sin(a);
      z = r * Math.cos(phi);
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

function scan(count: number): Float32Array {
  // Verification radar: concentric range rings, radial spokes, a sweep sector
  // whose leading edge sits at angle 0 (the section's spin rotates it) and
  // blips for assets already verified. Kept at low opacity behind the tool.
  const out = new Float32Array(count * 3);
  const ringsEnd = Math.floor(count * 0.48);
  const spokesEnd = Math.floor(count * 0.66);
  const sweepEnd = Math.floor(count * 0.88);

  for (let i = 0; i < count; i++) {
    let x: number, z: number;
    let y = (rand(i + 20) - 0.5) * 0.02;
    if (i < ringsEnd) {
      const R = 0.45 + (Math.floor(rand(i) * 5) + rand(i + 1) * 0.85) * 0.47;
      const a = rand(i + 2) * Math.PI * 2;
      x = Math.cos(a) * R;
      z = Math.sin(a) * R;
    } else if (i < spokesEnd) {
      const a = Math.floor(rand(i) * 12) * (Math.PI / 6);
      const R = rand(i + 1) * 2.3;
      x = Math.cos(a) * R;
      z = Math.sin(a) * R;
    } else if (i < sweepEnd) {
      const lead = rand(i + 2) < 0.42;
      const a = lead ? (rand(i + 3) - 0.5) * 0.035 : -Math.pow(rand(i + 3), 2) * 1.05;
      const R = 0.12 + rand(i + 4) * 2.2;
      x = Math.cos(a) * R;
      z = Math.sin(a) * R;
      y += (rand(i + 5) - 0.5) * 0.03;
    } else {
      // Verified-asset blips
      const blip = Math.floor(rand(i) * 8);
      const ba = rand(blip + 31) * Math.PI * 2;
      const bR = 0.7 + rand(blip + 43) * 1.4;
      x = Math.cos(ba) * bR + (rand(i + 1) - 0.5) * 0.1;
      z = Math.sin(ba) * bR + (rand(i + 2) - 0.5) * 0.1;
      y += 0.02 + (rand(i + 3) - 0.5) * 0.05;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

function vault(count: number): Float32Array {
  // Consensus vault: a geodesic icosahedral cage locked around a padlock —
  // shackle arc, descending legs, body shell and keyhole — plus a precessing
  // containment ring.
  const out = new Float32Array(count * 3);
  const phi = (1 + Math.sqrt(5)) / 2;
  const scale = 1.5 / Math.sqrt(1 + phi * phi);

  const rawVerts: [number, number, number][] = [
    [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
    [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
    [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1],
  ];
  const vertices = rawVerts.map(([vx, vy, vz]) => [vx * scale, vy * scale, vz * scale] as [number, number, number]);

  const edges: [number, number][] = [];
  const targetDist = 2 * scale;
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      const dx = vertices[i][0] - vertices[j][0];
      const dy = vertices[i][1] - vertices[j][1];
      const dz = vertices[i][2] - vertices[j][2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (Math.abs(d - targetDist) < 0.04) {
        edges.push([i, j]);
      }
    }
  }
  const edgeCount = edges.length;
  const cageEnd = Math.floor(count * 0.58);
  const shackleEnd = Math.floor(count * 0.74);
  const bodyEnd = Math.floor(count * 0.88);

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (i < cageEnd) {
      // Points distributed along the geodesic edges
      const [v0, v1] = edges[Math.floor(rand(i) * edgeCount)];
      const t = rand(i + 1);
      const jitter = (rand(i + 2) - 0.5) * 0.03;
      x = vertices[v0][0] * (1 - t) + vertices[v1][0] * t + jitter;
      y = vertices[v0][1] * (1 - t) + vertices[v1][1] * t + jitter;
      z = vertices[v0][2] * (1 - t) + vertices[v1][2] * t + jitter;
    } else if (i < shackleEnd) {
      if (rand(i + 3) < 0.68) {
        // Shackle arc
        const a = rand(i + 4) * Math.PI;
        const R = 0.52 + (rand(i + 5) - 0.5) * 0.1;
        x = Math.cos(a) * R;
        y = 0.3 + Math.sin(a) * R;
        z = (rand(i + 6) - 0.5) * 0.1;
      } else {
        // Shackle legs descending into the body
        const side = rand(i + 7) < 0.5 ? -1 : 1;
        x = side * 0.52 + (rand(i + 8) - 0.5) * 0.08;
        y = 0.3 - rand(i + 9) * 0.42;
        z = (rand(i + 10) - 0.5) * 0.1;
      }
    } else if (i < bodyEnd) {
      if (rand(i + 11) < 0.82) {
        // Lock body shell
        const e = cubeEdge(0.84, rand(i + 12), rand(i + 13), rand(i + 14));
        x = e[0];
        y = -0.42 + e[1] * 0.62;
        z = e[2] * 0.5;
      } else {
        // Keyhole plate on the front face
        const a = rand(i + 12) * Math.PI * 2;
        x = Math.cos(a) * 0.08;
        y = -0.42 + Math.sin(a) * 0.08 - (rand(i + 13) < 0.4 ? 0.1 : 0);
        z = 0.24;
      }
    } else {
      // Precessing containment ring
      const theta = rand(i + 15) * Math.PI * 2;
      const r = 2.0 + rand(i + 16) * 0.18;
      const tilt = 0.45;
      const ox = Math.cos(theta) * r;
      const oy = (rand(i + 17) - 0.5) * 0.05;
      const oz = Math.sin(theta) * r;
      x = ox;
      y = oy * Math.cos(tilt) - oz * Math.sin(tilt);
      z = oy * Math.sin(tilt) + oz * Math.cos(tilt);
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

/* ── Shaders ──────────────────────────────────────────────────────────── */

const vertexShader = /* glsl */ `
  attribute vec3 aS0;
  attribute vec3 aS1;
  attribute vec3 aS2;
  attribute vec3 aS3;
  attribute vec3 aS4;
  attribute vec3 aS5;
  attribute vec3 aS6;
  attribute vec3 aS7;
  attribute float aRand;
  attribute float aSize;

  uniform float uFrom;
  uniform float uTo;
  uniform float uT;
  uniform float uCycle;
  uniform float uChain;
  uniform float uScanY;
  uniform float uScanAmp;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uPulse;

  varying float vAlpha;
  varying float vAccent;
  varying float vGlow;

  vec3 shapeAt(float idx) {
    if (idx < 0.5) return aS0;
    if (idx < 1.5) return aS1;
    if (idx < 2.5) return aS2;
    if (idx < 3.5) return aS3;
    if (idx < 4.5) return aS4;
    if (idx < 5.5) return aS5;
    if (idx < 6.5) return aS6;
    return aS7;
  }

  float stag(float x) {
    x = clamp(x * 1.45 - aRand * 0.45, 0.0, 1.0);
    return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  }

  vec3 safeDir(vec3 v) {
    float l = length(v);
    return l > 0.0001 ? v / l : vec3(0.0);
  }

  void main() {
    // Autonomous hero cycle: Custody Vault ⇄ Tesseract Block Seal.
    float ce = stag(uCycle);
    vec3 pc = mix(aS0, aS1, ce);
    vec3 arcC = safeDir(aS0 + aS1 + vec3(sin(aRand * 6.28318), cos(aRand * 6.28318), sin(aRand * 12.5663) * 0.4));
    pc += arcC * sin(ce * 3.14159265) * (0.14 + aRand * 0.24);

    // Scroll-driven morph between section scenes (single clean morph when leaving hero).
    float se = stag(uT);
    vec3 sa = uFrom < 0.5 ? pc : shapeAt(uFrom);
    vec3 sb = shapeAt(uTo);
    vec3 p = mix(sa, sb, se);
    vec3 arcS = safeDir(sa + sb + vec3(sin(aRand * 6.28318), cos(aRand * 6.28318), sin(aRand * 12.5663) * 0.4));
    p += arcS * sin(se * 3.14159265) * (0.14 + aRand * 0.24);

    // Harmonious multi-frequency idle breathing
    float wave = sin(uTime * 0.85 + aRand * 25.13) + cos(uTime * 0.65 + aRand * 18.85);
    p += 0.012 * normalize(p + vec3(0.0001)) * wave;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    // Cursor field (screen space): subtle, localized light highlight and gentle ripple.
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 toM = ndc - uMouse;
    float md = length(toM);
    vec2 dir = md > 0.0001 ? toM / md : vec2(0.0);
    float near = exp(-md * md * 34.0);
    float band = exp(-pow(md - (1.0 - uPulse) * 1.5, 2.0) * 200.0) * uPulse;
    mv.xy += dir * near * 0.055;
    clip = projectionMatrix * mv;

    gl_Position = clip;
    gl_PointSize = clamp(uSize * aSize * (1.0 + near * 0.22) * uPixelRatio / -mv.z, 1.0, 38.0);

    float depth = clamp((-mv.z - 4.0) / 3.8, 0.0, 1.0);
    vAlpha = mix(1.0, 0.32, depth);
    vAccent = step(0.962, aRand);
    // Subtle radial harmonic pulse sweeping through 3D space
    float radial = length(p);
    float scanBand = exp(-pow(radial - (1.1 + uScanY * 0.65), 2.0) * 6.5) * uScanAmp * 0.65;
    vGlow = near * 0.38 + band * 0.7 + scanBand;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vAccent;
  varying float vGlow;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Crisp, defined focal core with a controlled luminous halo
    float core = smoothstep(0.28, 0.04, dist);
    float halo = smoothstep(0.5, 0.14, dist);
    float energy = max(vAccent, vGlow);
    float alpha = (halo * 0.55 + core * 0.92) * vAlpha * uOpacity * (1.0 + vGlow * 0.45);

    vec3 col = mix(uColor, uAccent, max(vAccent, min(vGlow, 1.0) * 0.45));
    gl_FragColor = vec4(col, alpha * mix(0.95, 1.35, energy));
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
      spin: Number(el.dataset.spin ?? 0.065),
    };
  });
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const quintic = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
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
    const count = isSmall ? 11000 : 22000;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0, 0, 5.8);

    // Geometry: the hero's two matched states plus six section scenes.
    const geometry = new THREE.BufferGeometry();
    const { bio, crest } = heroPair(count);
    geometry.setAttribute('position', new THREE.BufferAttribute(bio, 3));
    geometry.setAttribute('aS0', new THREE.BufferAttribute(bio, 3));
    geometry.setAttribute('aS1', new THREE.BufferAttribute(crest, 3));
    geometry.setAttribute('aS2', new THREE.BufferAttribute(fingerprint(count), 3));
    geometry.setAttribute('aS3', new THREE.BufferAttribute(ledger(count), 3));
    geometry.setAttribute('aS4', new THREE.BufferAttribute(custody(count), 3));
    geometry.setAttribute('aS5', new THREE.BufferAttribute(orbits(count), 3));
    geometry.setAttribute('aS6', new THREE.BufferAttribute(scan(count), 3));
    geometry.setAttribute('aS7', new THREE.BufferAttribute(vault(count), 3));
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
      uCycle: { value: 0 },
      uChain: { value: 0 },
      uScanY: { value: 3 },
      uScanAmp: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: isSmall ? 13.5 : 16.0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uColor: { value: cssColor('--fg') },
      uAccent: { value: cssColor('--accent') },
      uOpacity: { value: 0 },
      uMouse: { value: new THREE.Vector2(3, 3) },
      uPulse: { value: 0 },
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

    // ── Pointer parallax + interaction field ──
    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    const onPointer = (e: PointerEvent) => {
      tmx = (e.clientX / width) * 2 - 1;
      tmy = (e.clientY / height) * 2 - 1;
    };
    const onPress = () => {
      uniforms.uPulse.value = 1;
    };
    const interactive = !reduced && !isSmall;
    if (interactive) {
      window.addEventListener('pointermove', onPointer, { passive: true });
      window.addEventListener('pointerdown', onPress, { passive: true });
    }

    // ── Smoothed state ──
    const state = { x: 0, y: 0, scale: 1, opacity: 0, rx: 0.35 };
    let anchor = window.scrollY + height * 0.5;
    let spin = 0;
    let spinSpeed = 0.065;
    let last = performance.now();
    let raf = 0;
    let running = false;

    // ── Hero autonomous cycle (Astrolabe ⇄ Torus Lattice) + radial shimmer ──
    const CYC = { holdA: 4.5, morph: 3.2, holdB: 4.5, morphBack: 3.2 };
    const cycTotal = CYC.holdA + CYC.morph + CYC.holdB + CYC.morphBack;
    const SCAN_PERIOD = 7.5;
    const SCAN_DUR = 2.8;
    let cycleClock = 0;
    let scanClock = 1.2; // first sweep arrives shortly after load

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Follow the scroll anchor with frame-rate independent damping.
      const targetAnchor = window.scrollY + height * 0.5;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 10);
      anchor += (targetAnchor - anchor) * k;

      // Probe sits in the upper-third of the viewport (0.35 * height).
      // Section `a` holds cleanly until section `b` actually enters the bottom
      // of the viewport (b.top <= scrollY + 0.90 * height), morphing smoothly
      // as `b` rises to the upper-third (t = 1 at probe == b.top, zero snap).
      const probe = anchor - height * 0.15;
      let i = 0;
      while (i < stops.length - 1 && probe >= stops[i + 1].top) i++;
      const a = stops[i];
      const b = stops[Math.min(i + 1, stops.length - 1)];
      let t = 0;
      if (a && b && b !== a) {
        t = quintic((probe - (b.top - height * 0.55)) / (height * 0.55));
      }

      // Autonomous cycle phase: 0 = whorl, 1 = crest. Reduced motion rests on
      // the crisp crest with no sweep.
      let cycle = 1;
      let scanY = 3;
      let scanAmp = 0;
      if (!reduced) {
        cycleClock += dt;
        scanClock += dt;
        const ct = cycleClock % cycTotal;
        if (ct < CYC.holdA) cycle = 0;
        else if (ct < CYC.holdA + CYC.morph) cycle = quintic((ct - CYC.holdA) / CYC.morph);
        else if (ct < CYC.holdA + CYC.morph + CYC.holdB) cycle = 1;
        else cycle = 1 - quintic((ct - CYC.holdA - CYC.morph - CYC.holdB) / CYC.morphBack);

        const st = scanClock % SCAN_PERIOD;
        if (st < SCAN_DUR) {
          const f = st / SCAN_DUR;
          scanY = -1.55 + f * 3.1;
          scanAmp = Math.min(1, f / 0.12, (1 - f) / 0.12);
        }
        spin += dt * spinSpeed;
        uniforms.uTime.value = now / 1000;
        uniforms.uPulse.value *= Math.exp(-dt * 1.6);
      }
      uniforms.uCycle.value = cycle;
      uniforms.uScanY.value = scanY;
      uniforms.uScanAmp.value = scanAmp;

      if (a) {
        uniforms.uFrom.value = a.shape;
        uniforms.uTo.value = b.shape;
        uniforms.uT.value = t;
        // While the hero holds, particles obey the biometric cycle; scrolling
        // hands control to the scroll morph through a continuous crossfade.
        uniforms.uChain.value = a.shape === 0 ? t : 1;

        const small = width < 768;
        const tx = small ? 0 : lerp(a.x, b.x, t);
        const ty = small ? lerp(a.y, b.y, t) * 0.5 + 0.28 : lerp(a.y, b.y, t);
        const ts = lerp(a.scale, b.scale, t) * (small ? 0.62 : Math.min(1, width / 1280) * 0.25 + 0.75);
        const to = small ? lerp(a.mobileOpacity, b.mobileOpacity, t) : lerp(a.opacity, b.opacity, t);
        const trx = lerp(a.rx, b.rx, t);

        const ease = reduced ? 1 : 1 - Math.exp(-dt * 7.5);
        state.x += (tx - state.x) * ease;
        state.y += (ty - state.y) * ease;
        state.scale += (ts - state.scale) * ease;
        state.opacity += (to - state.opacity) * ease;
        state.rx += (trx - state.rx) * ease;
        spinSpeed += (lerp(a.spin, b.spin, t) - spinSpeed) * ease;
      }

      let sway = 0;
      if (!reduced) {
        // Gentle oscillation so zero-spin scenes (the hero crest) still sway.
        sway = Math.sin((now / 1000) * 0.12) * 0.1;
      }
      const pk = 1 - Math.exp(-dt * 4.5);
      mx += (tmx - mx) * pk;
      my += (tmy - my) * pk;
      uniforms.uMouse.value.set(mx, -my);

      group.position.set(state.x * halfW, state.y * halfH, 0);
      group.scale.setScalar(state.scale);
      group.rotation.set(
        state.rx + my * 0.04,
        spin + sway + anchor * 0.00022 + mx * 0.09,
        (mx - my) * 0.018
      );
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
      window.removeEventListener('pointerdown', onPress);
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
