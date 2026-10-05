/* 3D layer for the sketch engine: perspective camera, extruded solids, painter's-algorithm hidden surfaces,
   light-driven pen hatching and hard-edge inking. Everything still ends up as hand-drawn strokes. */
(function (g) {
  'use strict';
  const TAU = Math.PI * 2;
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

  function camera(o) {
    const eye = o.eye, tg = o.target || [0, 0, 0], up = o.up || [0, 0, 1], f = o.f || 1200, cx = o.cx ?? 800, cy = o.cy ?? 500;
    const fw = norm(sub(tg, eye)), rt = norm(cross(fw, up)), uv = cross(rt, fw);
    const project = p => { const d = sub(p, eye), z = dot(d, fw); if (z < 5) return null; return [cx + f * dot(d, rt) / z, cy - f * dot(d, uv) / z, z]; };
    return { eye, fw, rt, uv, project, f };
  }

  /* ---------------- mesh builders: every face = { v:[[x,y,z]…], n:[nx,ny,nz], hard:[bool per edge], c?, ghost?, all? } ---------------- */
  const area = pts => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
  function extrude(pts, z0, z1, o = {}) {
    const faces = [], n = pts.length, ccw = area(pts) > 0, sg = ccw ? 1 : -1, EN = [];
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; EN.push([sg * dy / l, -sg * dx / l, 0]); }
    if (o.top !== false) faces.push({ v: pts.map(p => [p[0], p[1], z1]), n: [0, 0, 1], hard: pts.map(() => true), all: true, c: o.topColor, ghost: o.ghost });
    if (o.bottom) faces.push({ v: pts.map(p => [p[0], p[1], z0]).reverse(), n: [0, 0, -1], hard: pts.map(() => true), all: true, ghost: o.ghost });
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], nn = EN[i], nx = EN[(i + 1) % n], pv = EN[(i + n - 1) % n];
      const hr = Math.acos(Math.max(-1, Math.min(1, dot(nn, nx)))) > (o.crease ?? 0.5), hl = Math.acos(Math.max(-1, Math.min(1, dot(nn, pv)))) > (o.crease ?? 0.5);
      faces.push({ v: [[p[0], p[1], z0], [q[0], q[1], z0], [q[0], q[1], z1], [p[0], p[1], z1]], n: nn, hard: [!!o.bottomEdge, hr, true, hl], c: o.sideColor, ghost: o.ghost, hdir: [0, 0, 1] });
    }
    return faces;
  }
  const circlePts = (cx, cy, r, seg = 28, a0 = 0) => Array.from({ length: seg }, (_, i) => [cx + Math.cos(a0 + i * TAU / seg) * r, cy + Math.sin(a0 + i * TAU / seg) * r]);
  const cylinder = (cx, cy, r, z0, z1, seg = 24, o = {}) => extrude(circlePts(cx, cy, r, seg), z0, z1, Object.assign({ crease: 3 }, o));
  /* annulus solid: top as ring segments (so there is a real hole), inner + outer walls */
  function ringSolid(cx, cy, r0, r1, z0, z1, seg = 32, o = {}) {
    const faces = [], a0 = o.a0 ?? 0, a1 = o.a1 ?? TAU, full = Math.abs(a1 - a0 - TAU) < 1e-6;
    const P0 = i => [cx + Math.cos(a0 + (a1 - a0) * i / seg) * r0, cy + Math.sin(a0 + (a1 - a0) * i / seg) * r0], P1 = i => [cx + Math.cos(a0 + (a1 - a0) * i / seg) * r1, cy + Math.sin(a0 + (a1 - a0) * i / seg) * r1];
    for (let i = 0; i < seg; i++) {
      const a = P0(i), b = P0(i + 1), c = P1(i + 1), d = P1(i), am = a0 + (a1 - a0) * (i + 0.5) / seg, nx = Math.cos(am), ny = Math.sin(am);
      faces.push({ v: [[a[0], a[1], z1], [d[0], d[1], z1], [c[0], c[1], z1], [b[0], b[1], z1]], n: [0, 0, 1], hard: [false, true, false, true], c: o.topColor, ghost: o.ghost });
      faces.push({ v: [[d[0], d[1], z0], [c[0], c[1], z0], [c[0], c[1], z1], [d[0], d[1], z1]], n: [nx, ny, 0], hard: [false, i === seg - 1 && !full, true, i === 0 && !full], c: o.sideColor, ghost: o.ghost });
      if (!o.openInner) faces.push({ v: [[b[0], b[1], z0], [a[0], a[1], z0], [a[0], a[1], z1], [b[0], b[1], z1]], n: [-nx, -ny, 0], hard: [false, i === 0 && !full, true, i === seg - 1 && !full], c: o.sideColor, ghost: o.ghost });
    }
    if (!full) { [[a0, -1], [a1, 1]].forEach(([ang, sg]) => { const p0 = [cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0], p1 = [cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1]; faces.push({ v: [[p0[0], p0[1], z0], [p1[0], p1[1], z0], [p1[0], p1[1], z1], [p0[0], p0[1], z1]], n: [-Math.sin(ang) * sg, Math.cos(ang) * sg, 0], hard: [true, true, true, true], c: o.sideColor }); }); }
    return faces;
  }
  /* toothed wheel: top face polygon + side walls; teeth simplified to a sawtooth-free trapezoid profile */
  function gearMesh(cx, cy, r, z, z0, z1, rot = 0, o = {}) {
    const pts = [], p = TAU / z, r0 = r * (o.root ?? 0.86);
    for (let i = 0; i < z; i++) { const a = rot + i * p; [[-0.32, r0], [-0.14, r], [0.14, r], [0.32, r0]].forEach(([f, rr]) => pts.push([cx + Math.cos(a + f * p) * rr, cy + Math.sin(a + f * p) * rr])); }
    return extrude(pts, z0, z1, Object.assign({ crease: 0.55 }, o));
  }
  function bodyOfBar(a, b, w0, w1, z0, z1, o = {}) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; return extrude([[a[0] + nx * w0, a[1] + ny * w0], [b[0] + nx * w1, b[1] + ny * w1], [b[0] - nx * w1, b[1] - ny * w1], [a[0] - nx * w0, a[1] - ny * w0]], z0, z1, o); }
  /* transform every face: rotate about z, then translate */
  function place(faces, o = {}) {
    const ca = Math.cos(o.rz || 0), sa = Math.sin(o.rz || 0), t = o.t || [0, 0, 0], ox = o.ox || 0, oy = o.oy || 0, R = p => { const x = p[0] - ox, y = p[1] - oy; return [x * ca - y * sa + ox + t[0], x * sa + y * ca + oy + t[1], p[2] + t[2]]; }, RN = n => [n[0] * ca - n[1] * sa, n[0] * sa + n[1] * ca, n[2]];
    return faces.map(f => Object.assign({}, f, { v: f.v.map(R), n: RN(f.n) }));
  }
  const shift = (faces, dx, dy, dz) => place(faces, { t: [dx, dy, dz] });

  /* ---------------- renderer ---------------- */
  function render(P, faces, cam, o = {}) {
    const L = norm(o.light || [-0.55, -0.5, 0.75]), paper = o.paper || '#ffffff', ink = o.ink, amb = o.ambient ?? 0.2, thr = o.hatchFrom ?? 0.9;
    const items = [];
    for (const f of faces) {
      if (f.custom) { const cc = f.c, d0 = Math.hypot(cam.eye[0] - cc[0], cam.eye[1] - cc[1], cam.eye[2] - cc[2]) - (f.bias || 0) - (o.zw ?? 3.5) * cc[2]; items.push({ custom: f.custom, d: d0 }); continue; }
      const c = [0, 0, 0]; f.v.forEach(v => { c[0] += v[0]; c[1] += v[1]; c[2] += v[2]; }); c[0] /= f.v.length; c[1] /= f.v.length; c[2] /= f.v.length;
      if (!f.ghost && dot(f.n, sub(cam.eye, c)) <= 0.001 && !f.double) continue;
      const pr = f.v.map(cam.project); if (pr.some(q => !q)) continue;
      const d = Math.hypot(cam.eye[0] - c[0], cam.eye[1] - c[1], cam.eye[2] - c[2]) - (f.bias || 0) - (o.zw ?? 3.5) * c[2];
      items.push({ f, pr, d, c });
    }
    items.sort((a, b) => ((a.f ? a.f.layer ?? 2 : 2) - (b.f ? b.f.layer ?? 2 : 2)) || (b.d - a.d));
    for (const it of items) {
      if (it.custom) { it.custom(P, cam); continue; }
      const { f, pr } = it, poly = pr.map(q => [q[0], q[1]]);
      const fk = o.fog ? Math.max(0, Math.min(1, (it.d - o.fog[0]) / (o.fog[1] - o.fog[0]))) : 0, fa = 1 - 0.68 * fk, fw = 1 - 0.45 * fk;
      if (!f.ghost) {
        P.occlude(poly, paper);
        if (f.c) P.wash(poly, f.c, (f.ca ?? 0.55) * (1 - 0.35 * fk), { edge: 0, jit: 0.2, steps: 1 });
        const lam = Math.max(0, dot(f.n, L)), tone = Math.min(1, amb + (1 - amb) * lam), dark = f.tone !== undefined ? f.tone : 1 - tone;
        if (dark > (o.hatchMin ?? 0.1) && !f.noHatch) {
          const az = Math.atan2(f.n[1], f.n[0]); let ang = f.n[2] > 0.9 ? -48 : f.n[2] < -0.9 ? 60 : 62 + Math.sin(az) * 26;
          if (f.hdir && Math.abs(dot(f.hdir, f.n)) < 0.7) { const q0 = cam.project(it.c), q1 = cam.project(add(it.c, mul(f.hdir, 10))); if (q0 && q1) ang = Math.atan2(q1[1] - q0[1], q1[0] - q0[0]) * 180 / Math.PI; }
          let area2 = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; area2 += p[0] * q[1] - q[0] * p[1]; } area2 = Math.abs(area2) / 2;
          const MODE = o.style || (typeof window !== 'undefined' && window.__SHADE) || 'layered';
          if (o.rich && MODE !== 'layered') {
            const d = Math.min(1, dark * (o.darken ?? 1.25)), g0 = o.gap ?? 4, A = fa;
            const inPoly = (x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
            let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; poly.forEach(([x, y]) => { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); });
            const rnd = (n, fn) => { let tries = 0, k = 0; while (k < n && tries++ < n * 20) { const x = bx0 + P.R() * (bx1 - bx0), y = by0 + P.R() * (by1 - by0); if (inPoly(x, y)) { fn(x, y); k++; } } };
            if (MODE === 'contour') { if (area2 > 2) P.hatch(poly, { ang, gap: Math.max(1.1, 6.5 - d * 5.2), a: 0.85 * A, w: 0.55, c: ink, inset: 0.3, ragged: 0.3 }); }
            else if (MODE === 'crosscontour') { if (area2 > 2) P.hatch(poly, { ang: ang + 90, gap: Math.max(1.1, 6.5 - d * 5.2), a: 0.85 * A, w: 0.55, c: ink, inset: 0.3, ragged: 0.3 }); }
            else if (MODE === 'stipple') { if (area2 > 2) P.stipple(poly, Math.min(900, Math.round(area2 * Math.pow(d, 1.4) * 0.28)), { a: 0.9, r: 0.8, c: ink }); }
            else if (MODE === 'engrave') { if (area2 > 2) P.hatch(poly, { ang: ang + 90, gap: 2.6, a: 0.95 * A, w: 0.12 + d * 1.75, c: ink, inset: 0.3, ragged: 0.1 }); }
            else if (MODE === 'flick') { if (area2 > 2) { P.hatch(poly, { ang, gap: Math.max(1.6, 5.5 - d * 3.6), a: 0.85 * A, w: 0.55, c: ink, inset: 0.4, piece: 3 + d * 5, fade: () => 0.62 }); if (d > 0.4) P.stipple(poly, Math.min(300, Math.round(area2 * d * 0.03)), { a: 0.9, r: 0.7, c: ink }); } }
            else if (MODE === 'spot') { if (d > 0.62) P.wash(poly, '#111111', 0.96 * A, { edge: 0, jit: 0.1, steps: 1 }); else if (area2 > 2 && d > 0.15) P.hatch(poly, { ang, gap: Math.max(1.6, 6 - d * 5), a: 0.8 * A, w: 0.5, c: ink, inset: 0.3 }); }
            else if (MODE === 'wash') { const lv = d > 0.7 ? 0.62 : d > 0.4 ? 0.36 : d > 0.18 ? 0.16 : 0; if (lv) P.wash(poly, '#3a3a3a', lv * A, { edge: 0, jit: 0.1, steps: 1 }); }
            else if (MODE === 'brushed') { if (area2 > 2) { P.hatch(poly, { ang, gap: Math.max(1.2, 3.4 - d * 1.8), a: 0.85 * A, w: 0.45, c: ink, inset: 0.4, piece: 8, fade: () => Math.min(1, d * 1.15 + 0.05) }); } }
            else if (MODE === 'scribble') { if (area2 > 4) rnd(Math.min(260, Math.round(area2 * Math.pow(d, 1.3) * 0.045)), (x, y) => { const r = 1 + P.R() * 1.5, pts = []; for (let k = 0; k <= 9; k++) { const t = k * Math.PI * 2 / 8; pts.push([x + Math.cos(t) * r + k * 0.15, y + Math.sin(t) * r]); } P.path(pts, { w: 0.4, c: ink, a: 0.75, rough: 0.2, passes: 1 }); }); }
            else if (MODE === 'mixed') { if (area2 > 2) { if (d > 0.78) P.wash(poly, '#111111', 0.92 * A, { edge: 0, jit: 0.1, steps: 1 }); else P.hatch(poly, { ang: ang + 90, gap: 2.4, a: 0.95 * A, w: 0.12 + d * 1.6, c: ink, inset: 0.3, ragged: 0.1 }); if (d > 0.3 && d <= 0.78) P.stipple(poly, Math.min(200, Math.round(area2 * d * 0.03)), { a: 0.85, r: 0.7, c: ink }); } }
          } else if (o.rich) {
            // layered engraving: tone is built from up to four hatch directions plus stipple in the deepest shadow
            const d = Math.min(1, dark * (o.darken ?? 1.25)), g0 = o.gap ?? 4;
            if (area2 > 2) P.hatch(poly, { ang, gap: Math.max(1.1, g0 - d * 2.6), a: Math.min(0.85, 0.35 + d * 0.55) * fa, w: 0.5, c: ink, inset: 0.3, ragged: 0.35, jit: 0.12 });
            if (d > 0.42 && area2 > 6) P.hatch(poly, { ang: ang + 55, gap: Math.max(1.3, g0 - d * 2.4), a: Math.min(0.8, 0.25 + d * 0.5) * fa, w: 0.45, c: ink, inset: 0.4, ragged: 0.4, jit: 0.15 });
            if (d > 0.66 && area2 > 10) P.hatch(poly, { ang: ang - 42, gap: Math.max(1.2, 3.2 - d * 1.8), a: 0.62 * fa, w: 0.45, c: ink, inset: 0.4, ragged: 0.3 });
            if (d > 0.82 && area2 > 14) P.hatch(poly, { ang: ang + 90, gap: 1.5, a: 0.6 * fa, w: 0.45, c: ink, inset: 0.5, ragged: 0.3 });
            if (d > 0.3 && area2 > 16 && o.stipple !== false) P.stipple(poly, Math.min(260, Math.round(area2 * d * d * 0.05)), { a: 0.7, r: 0.8, c: ink });
            // a heavier line along the edge that faces away from the light
            if (d > 0.5 && !f.ghost) { for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; if (f.hard && f.hard[i] && b[1] - a[1] > 0 === (o.shadowSide ?? true)) P.line(a[0], a[1], b[0], b[1], { w: 1.8 * fw, c: ink, a: 0.6, rough: 0.2, over: 0, passes: 1 }); } }
          } else {
          if (area2 > 3) P.hatch(poly, { ang, gap: Math.max(1.3, (o.gap ?? 5.6) - dark * 4.4 + (f.n[2] > 0.9 ? 0.8 : 0)) * (1 + 0.5 * fk), a: Math.min(0.78, 0.3 + dark * 0.6) * fa, w: 0.5, c: ink, inset: 0.3, ragged: 0.4, jit: 0.15, cross: dark > 0.72 && area2 > 60 ? 42 : undefined });
          if (o.deep && dark > 0.84 && area2 > 30) P.hatch(poly, { ang: ang - 38, gap: Math.max(1.2, 2.2 - (dark - 0.84) * 4), a: 0.55, w: 0.45, c: ink, inset: 0.4, ragged: 0.3 });
          }
        }
      }
      if (f.noEdge) { }
      else if (f.all) { const p2 = poly.concat([poly[0]]); P.path(p2, { rough: o.rough ?? 0.4, w: (o.w ?? 1.25) * fw, c: ink, a: 0.97 * fa, passes: 1 }); }
      else for (let i = 0; i < poly.length; i++) if (f.hard[i]) { const a = poly[i], b = poly[(i + 1) % poly.length]; P.line(a[0], a[1], b[0], b[1], { w: (o.w ?? 1.25) * fw, c: ink, a: 0.97 * fa, rough: o.rough ?? 0.35, over: 0.4, passes: 1 }); }
      if (f.deco) f.deco(P, cam, poly);
    }
    return items.length;
  }
  /* space polyline (axles, springs) drawn through the camera */
  function polyline3(P, pts, cam, o = {}) { const q = pts.map(cam.project); let run = []; const out = []; q.forEach(p => { if (p) run.push([p[0], p[1]]); else { if (run.length > 1) out.push(run); run = []; } }); if (run.length > 1) out.push(run); out.forEach(r => P.path(r, Object.assign({ rough: 0.3, passes: 1 }, o))); }
  function dashed3(P, a, b, cam, pat, o = {}) { const pa = cam.project(a), pb = cam.project(b); if (pa && pb) P.dashed(pa[0], pa[1], pb[0], pb[1], pat || [8, 4], o); }
  function label3(P, txt, at, cam, dx, dy, o = {}) { const p = cam.project(at); if (!p) return; P.note(txt, p[0] + dx, p[1] + dy, p[0], p[1], o); }

  /* lathe: revolve a profile [[r, z], ...] about the vertical axis through (cx, cy). Faces point outward
     (or inward where the profile runs back down, e.g. a lens bore). o.seg segments, o.a0..a1 for partial cut-aways. */
  function revolve(cx, cy, prof, o = {}) {
    const seg = o.seg ?? 36, a0 = o.a0 ?? 0, a1 = o.a1 ?? TAU, full = Math.abs(a1 - a0 - TAU) < 1e-6, faces = [];
    for (let j = 0; j + 1 < prof.length; j++) {
      const [r0, z0] = prof[j], [r1, z1] = prof[j + 1], dr = r1 - r0, dz = z1 - z0, L = Math.hypot(dr, dz) || 1;
      const nr = dz / L, nz = -dr / L;                                   // outward normal in (r,z) for a profile walked bottom->top on the outside
      const sharpPrev = j > 0 && (() => { const [pr, pz] = prof[j - 1]; const a = Math.atan2(z0 - pz, r0 - pr), b = Math.atan2(dz, dr); return Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a))) > (o.crease ?? 0.45); })();
      for (let i = 0; i < seg; i++) {
        const t0 = a0 + (a1 - a0) * i / seg, t1 = a0 + (a1 - a0) * (i + 1) / seg, tm = (t0 + t1) / 2;
        const P = (r, z, t) => [cx + Math.cos(t) * r, cy + Math.sin(t) * r, z];
        const v = [P(r0, z0, t0), P(r0, z0, t1), P(r1, z1, t1), P(r1, z1, t0)];
        faces.push({ v, hdir: [0, 0, 1], tone: nr < -0.3 && o.darkBore !== false ? 0.88 : undefined, n: norm([Math.cos(tm) * nr, Math.sin(tm) * nr, nz]), hard: [sharpPrev || j === 0, !full && i === seg - 1, j === prof.length - 2, !full && i === 0], c: o.color, ghost: o.ghost, double: o.double });
      }
    }
    if (!full) [[a0, -1], [a1, 1]].forEach(([t, sg]) => { const v = prof.map(([r, z]) => [cx + Math.cos(t) * r, cy + Math.sin(t) * r, z]); if (!o.tube) v.push([cx, cy, prof[prof.length - 1][1]], [cx, cy, prof[0][1]]); faces.push({ v: sg > 0 ? v : v.slice().reverse(), n: [-Math.sin(t) * sg, Math.cos(t) * sg, 0], hard: v.map(() => true), tone: o.cutTone ?? 0.62, cut: true }); });
    return faces;
  }
  /* knurl / grip ridges on a cylinder, as short vertical strokes (drawn through the camera, only on the visible side) */
  function knurl(P, cam, cx, cy, r, z0, z1, n, o = {}) { const eye = cam.eye; for (let i = 0; i < n; i++) { const a = i * TAU / n, nx = Math.cos(a), ny = Math.sin(a), px = cx + nx * r, py = cy + ny * r; if ((eye[0] - px) * nx + (eye[1] - py) * ny <= 0) continue; const p0 = cam.project([px, py, z0]), p1 = cam.project([px, py, z1]); if (p0 && p1) P.line(p0[0], p0[1], p1[0], p1[1], Object.assign({ w: 0.55, a: 0.8, passes: 1, over: 0, rough: 0.15 }, o)); } }
  /* coil spring along z as a helix polyline */
  function helix(cx, cy, r, z0, z1, turns, k = 14) { const pts = []; for (let i = 0; i <= turns * k; i++) { const t = i / (turns * k), a = t * turns * TAU; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, lerp3(z0, z1, t)]); } return pts; }
  const lerp3 = (a, b, t) => a + (b - a) * t;
  /* polygon with a normal oriented toward `inside` */
  function poly3(v, inside, o = {}) {
    let n = norm(cross(sub(v[1], v[0]), sub(v[2], v[0]))), c = [0, 0, 0]; v.forEach(q => { c[0] += q[0] / v.length; c[1] += q[1] / v.length; c[2] += q[2] / v.length; });
    let vv = v; if (dot(n, sub(inside, c)) < 0) { n = mul(n, -1); vv = v.slice().reverse(); }
    return Object.assign({ v: vv, n, hard: vv.map(() => true) }, o);
  }
  /* project a point along light direction onto the plane z = gz */
  const onFloor = (p, Ld, gz = 0) => { const t = (p[2] - gz) / -Ld[2]; return [p[0] + Ld[0] * t, p[1] + Ld[1] * t, gz]; };
  g.Sketch.V3 = { add, sub, mul, dot, cross, norm };
  g.Sketch.D3 = { camera, extrude, cylinder, ringSolid, gearMesh, bodyOfBar, circlePts, place, shift, render, poly3, onFloor, revolve, knurl, helix, polyline3, dashed3, label3 };
})(window);
