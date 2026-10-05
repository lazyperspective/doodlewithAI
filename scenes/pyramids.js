/* SHEET 6 — GIZA: BUILT TO TALK TO THE STARS
   Worm's-eye view from the desert floor at the corner of the Great Pyramid (kraft, black pen + slate wash + white pen),
   with an archaeologist-astronomer's notebook laid over it: sun-path construction, Orion alignment, orthographic inset,
   hieroglyph border. Everything is real 3-D geometry pushed through a pinhole camera (Sketch.cam maths). */
(window.SCENES = window.SCENES || []).push({
  name: 'Pyramids', seed: 67, ink: '#18181c', theme: 'kraft',
  build(P, n, t) {
    const S = Sketch, TAU = S.TAU, lerp = S.lerp;
    const GRN = '#2f8a4c', INK = '#18181c', SLATE = '#4a4d59', BLUE = '#1c3f94', RED = '#c0392b', WHITE = '#fff', GB = '#6f92dc';
    const FX0 = 60, FY0 = 60, FX1 = 1540, FY1 = 940;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    /* ================= camera (same maths as Sketch.cam, plus near-plane clipping) ================= */
    const rdK = 115.2 * Math.SQRT2, HK = 146.6;
    const CP = [2, 1.7, -rdK - 8], YAW = 0.22, PIT = 0.5, FL = 600, CX0 = 800, CY0 = 500;
    const cyw = Math.cos(YAW), syw = Math.sin(YAW), cpi = Math.cos(PIT), spi = Math.sin(PIT);
    const toC = p => {
      const x = p[0] - CP[0], y = p[1] - CP[1], z = p[2] - CP[2];
      const x1 = x * cyw - z * syw, z1 = x * syw + z * cyw;
      return [x1, y * cpi - z1 * spi, y * spi + z1 * cpi];
    };
    const scr = c => [CX0 + FL * c[0] / c[2], CY0 - FL * c[1] / c[2], c[2]];
    const pj = p => { const c = toC(p); return c[2] < 0.4 ? null : scr(c); };
    const HZ = CY0 + FL * Math.tan(PIT);
    const dw = (z, b = 1) => b * (0.42 + 1.05 * Math.min(1, 55 / Math.max(z, 1)));

    const clipRect = poly => {
      let out = poly;
      for (const [ax, val, sg] of [[0, FX0, 1], [0, FX1, -1], [1, FY0, 1], [1, FY1, -1]]) {
        const inp = out; out = []; if (!inp.length) break;
        for (let i = 0; i < inp.length; i++) {
          const a = inp[i], b = inp[(i + 1) % inp.length], da = sg * (a[ax] - val), db = sg * (b[ax] - val);
          if (da >= 0) out.push(a);
          if ((da >= 0) !== (db >= 0)) { const k = da / (da - db); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
        }
      }
      return out;
    };
    const poly3 = pts => {
      const cs = pts.map(toC), zn = 0.6, out = [];
      for (let i = 0; i < cs.length; i++) {
        const a = cs[i], b = cs[(i + 1) % cs.length], ai = a[2] >= zn, bi = b[2] >= zn;
        if (ai) out.push(a);
        if (ai !== bi) { const k = (zn - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, zn]); }
      }
      return clipRect(out.map(c => { const s = scr(c); return [s[0], s[1]]; }));
    };
    const lb = (x0, y0, x1, y1) => {           // Liang-Barsky clip of a 2-D segment to the drawing frame
      let t0 = 0, t1 = 1; const dx = x1 - x0, dy = y1 - y0;
      for (const [p, q] of [[-dx, x0 - FX0], [dx, FX1 - x0], [-dy, y0 - FY0], [dy, FY1 - y0]]) {
        if (p === 0) { if (q < 0) return null; }
        else { const r = q / p; if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; } }
      }
      return [x0 + dx * t0, y0 + dy * t0, x0 + dx * t1, y0 + dy * t1];
    };
    /* draw a 3-D segment: returns screen [x0,y0,x1,y1,depth] or null. width auto-scales with depth */
    const seg = (p, q, o = {}) => {
      let a = toC(p), b = toC(q); const zn = 0.6;
      if (a[2] < zn && b[2] < zn) return null;
      if (a[2] < zn) { const k = (zn - a[2]) / (b[2] - a[2]); a = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, zn]; }
      else if (b[2] < zn) { const k = (zn - b[2]) / (a[2] - b[2]); b = [b[0] + (a[0] - b[0]) * k, b[1] + (a[1] - b[1]) * k, zn]; }
      const A = scr(a), B = scr(b), r = lb(A[0], A[1], B[0], B[1]); if (!r) return null;
      const z = Math.min(a[2], b[2]) * 0.4 + Math.max(a[2], b[2]) * 0.6;
      if (!o.quiet) P.line(r[0], r[1], r[2], r[3], Object.assign({ w: dw(z, o.wb ?? 1) }, o));
      return [r[0], r[1], r[2], r[3], z];
    };
    const seg2 = (x0, y0, x1, y1, o) => { const r = lb(x0, y0, x1, y1); if (r) P.line(r[0], r[1], r[2], r[3], o); return r; };
    /* splice an erase op *before* the ops recorded since `i0` (so an outline drawn first is not erased by its own footprint) */
    const eraseUnder = (i0, poly) => { P.ops.splice(i0, 0, { k: 'e', poly }); };
    const inPoly = (poly, x, y) => S.pip(poly, x, y);
    const ptAlong = (pts, u) => { const k = pts.length - 1, f = clamp(u, 0, 1) * k, i = Math.min(k - 1, Math.floor(f)); return S.lerpP(pts[i], pts[i + 1], f - i); };

    /* ================= pyramids ================= */
    const mkPyr = (cx, cz, half, H) => ({ cx, cz, half, H, rd: half * Math.SQRT2, W: half * 2 });
    const KHU = mkPyr(0, 0, 115.2, 146.6), KHA = mkPyr(440, 300, 107.7, 143.5), MEN = mkPyr(790, 400, 51.5, 65);
    const DL = [-Math.SQRT1_2, 0, Math.SQRT1_2], DR = [Math.SQRT1_2, 0, Math.SQRT1_2];
    const NL = [-Math.SQRT1_2, 0, -Math.SQRT1_2], NR = [Math.SQRT1_2, 0, -Math.SQRT1_2];
    /* faces: -1 front-left, 1 front-right, 2 back-left, 3 back-right; each = corner it grows from, run direction, outward normal, sunlit? */
    const FACES = { '-1': { c: 'N', d: DL, n: NL, lit: true }, '1': { c: 'N', d: DR, n: NR, lit: false }, '2': { c: 'L', d: DR, n: [-Math.SQRT1_2, 0, Math.SQRT1_2], lit: true }, '3': { c: 'R', d: [-Math.SQRT1_2, 0, Math.SQRT1_2], n: [Math.SQRT1_2, 0, Math.SQRT1_2], lit: false } };
    const Ecor = (py, h, c = 'N') => { const k = py.rd * (1 - h / py.H); return c === 'N' ? [py.cx, h, py.cz - k] : c === 'L' ? [py.cx - k, h, py.cz] : c === 'R' ? [py.cx + k, h, py.cz] : [py.cx, h, py.cz + k]; };
    const facePt = (py, side, h, u, o = 0) => { const F = FACES[side], e = Ecor(py, h, F.c); return [e[0] + F.d[0] * u + F.n[0] * o, h, e[2] + F.d[2] * u + F.n[2] * o]; };
    const faceVisible = (py, side) => { const F = FACES[side], f = facePt(py, side, 0, py.W / 2); return ((CP[0] - f[0]) * F.n[0] + (CP[2] - f[2]) * F.n[2]) > 0; };
    const rowLen = (py, h) => py.W * (1 - h / py.H);
    const apex = py => [py.cx, py.H, py.cz];
    const hull = pts => { const P2 = pts.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]), cr = (o, a2, b2) => (a2[0] - o[0]) * (b2[1] - o[1]) - (a2[1] - o[1]) * (b2[0] - o[0]); const lo = [], up = [];
      for (const q of P2) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
      for (const q of P2.slice().reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
      lo.pop(); up.pop(); return lo.concat(up); };
    const silOf = py => clipRect(hull([apex(py), [py.cx - py.rd, 0, py.cz], [py.cx, 0, py.cz - py.rd], [py.cx + py.rd, 0, py.cz], [py.cx, 0, py.cz + py.rd]].map(pj).filter(v => v).map(v => [v[0], v[1]])));
    const SIL = { khu: silOf(KHU), kha: silOf(KHA), men: silOf(MEN) };
    const A0 = pj(apex(KHU)), N0 = pj([0, 0, -rdK]);

    /* ================= 1. SKY: slate wash + dense black pen hatch, kraft-coloured clouds and contrails left clear ================= */
    P.wash([[FX0, FY0], [FX1, FY0], [FX1, HZ], [FX0, HZ]], SLATE, 0.5, { grad: { x0: 0, y0: FY0, x1: 0, y1: HZ, c0: '#1f222c', c1: '#6f717b', a0: 0.9, a1: 0.42 }, edge: 0, jit: 0.4, steps: 4 });
    const clouds = [   // [cx, cy, w, h]: kraft "holes" in the hatch that get a drawn cloud
      [172, 522, 210, 64], [1440, 662, 176, 56], [846, 296, 130, 38], [1000, 560, 0, 0]].filter(c => c[2]);
    const streaks = [ // contrail-like wind streaks (cloud tubes): pts, r0, r1
      { p: [[580, 196], [700, 182], [860, 200], [1040, 178], [1190, 184]], r0: 4, r1: 10 },
      { p: [[1545, 590], [1450, 574], [1360, 594], [1260, 580]], r0: 9, r1: 4 }];
    const bandPoly = (pts, r0, r1, pad = 3) => {
      const s = S.catmull(pts, false, 6), L = [], R = [];
      for (let i = 0; i < s.length; i++) {
        const a = s[Math.max(0, i - 1)], b = s[Math.min(s.length - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        const r = lerp(r0, r1, i / (s.length - 1)) + pad; L.push([s[i][0] - ty * r, s[i][1] + tx * r]); R.push([s[i][0] + ty * r, s[i][1] - tx * r]);
      }
      return L.concat(R.reverse());
    };
    const streakPolys = streaks.map(s => bandPoly(s.p, s.r0, s.r1, 6));
    const skyD = (x, y) => {
      if (y > HZ - 3) return 0;
      if (inPoly(SIL.khu, x, y) || inPoly(SIL.kha, x, y) || inPoly(SIL.men, x, y)) return 0;
      for (const c of clouds) { const dx = (x - c[0]) / (c[2] / 2 + 12), dy = (y - c[1]) / (c[3] / 2 + 12); if (dx * dx + dy * dy < 1) return 0; }
      for (const sp of streakPolys) if (inPoly(sp, x, y)) return 0;
      const top = clamp((HZ - y) / 460, 0.28, 1);
      return clamp(0.34 + 0.6 * top + 0.32 * P.nz(x / 85 + y / 120 + 5) - 0.18 * (1 - top), 0, 1);
    };
    P.hatch([[FX0, FY0], [FX1, FY0], [FX1, HZ], [FX0, HZ]], { ang: -58, gap: 4.4, a: 0.72, w: 0.68, c: INK, fade: skyD, piece: 54, jit: 0.3 });
    P.hatch([[FX0, FY0], [FX1, FY0], [FX1, HZ - 200], [FX0, HZ - 200]], { ang: 24, gap: 9, a: 0.45, w: 0.55, c: INK, fade: (x, y) => skyD(x, y) * clamp((520 - y) / 430, 0, 1), piece: 56, jit: 0.4 });

    P.hatch([[FX0, FY0], [FX1, FY0], [FX1, HZ - 260], [FX0, HZ - 260]], { ang: -76, gap: 7, a: 0.5, w: 0.6, c: INK, fade: (x, y) => skyD(x, y) * clamp(0.5 + 0.9 * P.nz(x / 60 + y / 80 + 21), 0, 1) * clamp((470 - y) / 300, 0.1, 1), piece: 30, jit: 0.5 });
    /* light-toned puffs / contrails drawn over the cleared holes: black pen, slate hatch shading, white glints */
    const fillUnder = (i0, poly, col, a) => { P.wash(poly, col, a, { edge: 0, jit: 0.5, steps: 2 }); const w = P.ops.pop(); P.ops.splice(i0, 0, { k: 'e', poly }, w); };
    const puff = (cx, cy, w, h, o = {}) => { const i0 = P.ops.length, out = P.cloud(cx, cy, w, h, Object.assign({ c: INK, w: 1.15, a: 0.92, hi: WHITE, lobes: 12, inner: 4, gap: 3.4 }, o)); fillUnder(i0, out, o.fill || '#d7b880', o.fillA ?? 0.5); return out; };
    const tube = (pts, r0, r1, o = {}) => { const i0 = P.ops.length; P.cloudTube(pts, r0, r1, Object.assign({ c: INK, a: 0.9, w: 1 }, o)); fillUnder(i0, bandPoly(pts, r0, r1, 1), o.fill || '#d7b880', o.fillA ?? 0.4); };
    clouds.forEach(c => { puff(c[0], c[1], c[2], c[3]); puff(c[0] - c[2] * 0.28, c[1] + c[3] * 0.25, c[2] * 0.5, c[3] * 0.6, { lobes: 9, inner: 2, shade: false }); puff(c[0] + c[2] * 0.3, c[1] + c[3] * 0.2, c[2] * 0.45, c[3] * 0.55, { lobes: 9, inner: 2, shade: false }); });
    streaks.forEach(st => tube(st.p, st.r0, st.r1, { rib: 1 }));

    /* ================= 2. GROUND: erase sky tone below the horizon, warm sand + haze ================= */
    const groundPoly = [[FX0 - 5, HZ], [FX1 + 5, HZ], [FX1 + 5, FY1 + 5], [FX0 - 5, FY1 + 5]];
    P.erase(groundPoly);
    P.wash([[FX0, HZ - 26], [FX1, HZ - 26], [FX1, HZ + 6], [FX0, HZ + 6]], '#ecd29c', 0.5, { grad: { x0: 0, y0: HZ - 26, x1: 0, y1: HZ + 6, c0: '#e6c88e', c1: '#e6c88e', a0: 0, a1: 0.55 }, edge: 0, jit: 0.3, steps: 3 });
    P.wash([[FX0, HZ + 4], [FX1, HZ + 4], [FX1, FY1], [FX0, FY1]], '#d8b674', 0.4, { grad: { x0: 0, y0: HZ, x1: 0, y1: FY1, c0: '#e4c688', c1: '#8a6535', a0: 0.42, a1: 0.5 }, edge: 0, jit: 0.4, steps: 3 });
    P.line(FX0, HZ, FX1, HZ, { w: 1.1, a: 0.85, rough: 0.5 });

    /* ================= pyramid faces ================= */
    const courseHeights = (py, c0, c1) => { const hs = [0]; let h = 0; while (h < py.H - 0.4) { h += lerp(c0, c1, h / py.H) * P.r(0.9, 1.1); hs.push(Math.min(h, py.H)); } return hs; };
    /* one face: kraft or slate, courses + staggered blocks (only where they are big enough to resolve), white pen glints */
    const faceDraw = (py, side, o) => {
      const hs = o.hs, lit = FACES[side].lit;
      const A = apex(py), Lc = facePt(py, side, 0, py.W), N = facePt(py, side, 0, 0);
      const face = poly3([A, Lc, N]);
      if (face.length < 3) return face;
      if (lit) {
        P.wash(face, '#e2c088', 0.30, { grad: { x0: 0, y0: 60, x1: 0, y1: 800, c0: '#f0d7a0', c1: '#a37a45', a0: 0.36, a1: 0.16 }, edge: 0, jit: 0.4, steps: 3 });
      } else {
        P.wash(face, SLATE, 0.6, { grad: { x0: 0, y0: 200, x1: 0, y1: 800, c0: '#3c3f4b', c1: '#5d606b', a0: 0.72, a1: 0.5 }, edge: 0, jit: 0.4, steps: 4 });
      }
      let prevY = 1e9, prevDrawn = false;
      const lw = lit ? 1 : 0.85;
      for (let j = 1; j < hs.length; j++) {
        const h = hs[j], h0 = hs[j - 1], e = pj(Ecor(py, h)); if (!e) { prevDrawn = false; continue; }
        const sy = e[1], drawn = (prevY - sy) > o.minRow || j === hs.length - 1;
        if (!drawn) { prevDrawn = false; continue; }
        prevY = sy;
        const p0 = facePt(py, side, h, 0, 0), p1 = facePt(py, side, h, rowLen(py, h), 0);
        seg(p0, p1, { w: dw(e[2], 0.85 * lw), a: lit ? 0.8 : 0.7, rough: 0.5, passes: 1, over: 0.3, c: INK });
        if (lit && P.r() < 0.5) { const q = P.r(0.02, 0.9), l = P.r(0.03, 0.1); seg(facePt(py, side, h, rowLen(py, h) * q, 0), facePt(py, side, h, rowLen(py, h) * (q + l), 0), { w: 0.8, a: 0.75, c: WHITE, passes: 1, over: 0, rough: 0.3, wb: 1 }); }
        const dp = prevDrawn; prevDrawn = true;
        if (!dp && j > 1) continue;
        /* staggered joints along the fall line of this course (h0..h) */
        const Lr = rowLen(py, h0); let u = P.r(0, 1.4) + (j % 2 ? 0.7 : 0), lastX = -1e9;
        while (u < Lr - 0.5) {
          const uu = u, u2 = u - (py.half / py.H) * (h - h0);
          u += P.r(o.bw0, o.bw1);
          if (u2 < 0.05) continue;
          const a = pj(facePt(py, side, h0, uu, 0)), b = pj(facePt(py, side, h, u2, 0));
          if (!a || !b) continue;
          if (a[0] < FX0 - 40 || a[0] > FX1 + 40 || a[1] < FY0 - 30 || a[1] > FY1 + 30) continue;
          if (Math.hypot(a[0] - b[0], a[1] - b[1]) < o.minJoint) continue;
          if (Math.abs(a[0] - lastX) < o.minDx) continue;
          lastX = a[0];
          if (P.r() < 0.08) continue;
          seg2(a[0], a[1], b[0] + P.r(-0.5, 0.5), b[1], { w: dw(a[2], 0.6 * lw), a: lit ? 0.62 : 0.5, passes: 1, over: 0, rough: 0.3, c: INK });
        }
      }
      return face;
    };

    /* ---------- Menkaure & Khafre (far, right) ---------- */
    const farPyr = (py, o) => {
      const sil = silOf(py);
      if (sil.length < 3) return;
      P.erase(sil);
      P.wash(sil, '#e9d0a0', 0.5, { edge: 0, jit: 0.3, steps: 2 });
      const hs = courseHeights(py, o.c0, o.c1);
      for (const side of [-1, 1, 2, 3]) { if (!faceVisible(py, side)) continue;
        const fc = faceDraw(py, side, { hs, minRow: 1.6, minJoint: 5, minDx: 4, bw0: o.bw0, bw1: o.bw1 });
        if (fc.length < 3) continue;
        if (!FACES[side].lit) { P.hatch(fc, { ang: 62, gap: 2.4, a: 0.62, w: 0.5, c: INK, piece: 12, fade: () => 0.9 }); P.hatch(fc, { ang: -20, gap: 3.4, a: 0.45, w: 0.45, c: INK, piece: 12, fade: () => 0.65 }); }
        else P.hatch(fc, { ang: -58, gap: 6, a: 0.28, w: 0.45, c: INK, piece: 12, fade: () => 0.5 }); }
      P.poly(sil, { w: 1.3, a: 0.9, rough: 0.4, passes: 1 });
    };
    farPyr(MEN, { c0: 1.0, c1: 0.5, bw0: 1.2, bw1: 2 });
    farPyr(KHA, { c0: 1.3, c1: 0.6, bw0: 1.3, bw1: 2.2 });

    /* ---------- the Great Pyramid, the hero corner ---------- */
    /* ================= 2b. HORIZON FRIEZE + STORM BAND (behind the Great Pyramid) ================= */
    /* ---- ground helper: screen point below the horizon -> world point on the desert floor ---- */
    const ground = (sx, sy) => {
      const dx = (sx - CX0) / FL, dy = -(sy - CY0) / FL;
      const y = dy * cpi + spi, z1 = -dy * spi + cpi;                 // camera-frame ray (x1=dx,y2=dy,z2=1)
      const k = -CP[1] / y; const x = dx * cyw + z1 * syw, z = -dx * syw + z1 * cyw;
      return [CP[0] + k * x, 0, CP[2] + k * z];
    };
    const depthOf = p => toC(p)[2];

    /* worker figure: foot (x,y), height in px */
    const figure = (x, y, h, o = {}) => {
      if (h < 5) { P.dot(x, y - h * 0.5, Math.max(0.6, h * 0.12), { c: INK, a: 0.85 }); return; }
      const d = o.dir ?? 1, lw = clamp(h * 0.05, 0.6, 1.6), pose = o.pose || 'walk', sw = h * 0.18, c = o.c || INK;
      const hipY = y - h * 0.48, neckY = y - h * 0.82, hx = x, po = { w: lw, a: 0.9, passes: 1, over: 0, rough: 0.25, c };
      P.circle(hx + d * h * 0.02, y - h * 0.91, h * 0.075, { w: lw, passes: 1, rough: 0.2, c });
      P.line(hx, neckY, hx - d * h * 0.02, hipY, po);
      const st = o.step ?? P.r(-1, 1);
      P.line(hx, hipY, hx + d * sw * st, y, po); P.line(hx, hipY, hx - d * sw * st * 0.8, y - h * 0.02, po);
      if (pose === 'pull') { P.line(hx, neckY + h * 0.04, hx + d * h * 0.3, neckY + h * 0.2, po); P.line(hx, neckY + h * 0.06, hx + d * h * 0.26, neckY + h * 0.26, po); }
      else if (pose === 'carry') { P.line(hx, neckY + h * 0.04, hx + d * h * 0.14, neckY - h * 0.08, po); P.line(hx, neckY + h * 0.06, hx - d * h * 0.12, neckY - h * 0.06, po); }
      else { P.line(hx, neckY + h * 0.04, hx + d * h * 0.1, hipY, po); P.line(hx, neckY + h * 0.04, hx - d * h * 0.1, hipY + h * 0.02, po); }
      if (h > 12) { const lc = [[hx - h * 0.09, hipY - h * 0.02], [hx + h * 0.09, hipY - h * 0.02], [hx + h * 0.11, hipY + h * 0.14], [hx - h * 0.11, hipY + h * 0.14]]; P.wash(lc, '#efe3c6', 0.85, { edge: 0, jit: 0.15, steps: 2 }); }
    };
    const fig3 = (p, o = {}) => { const v = pj(p); if (!v || v[0] < FX0 || v[0] > FX1 || v[1] < FY0 || v[1] > FY1) return; figure(v[0], v[1], 1.7 * FL / v[2], o); };
    const gp = (x, z) => pj([x, 0, z]);
    const pxm = (sx, sy) => FL / toC(ground(sx, sy))[2];
    /* dark camel silhouette; s = px per model unit (a camel stands ~66 units) */
    const camel = (x, y, s, dir, o = {}) => {
      const T = (px, py) => [x + px * s * dir, y + py * s];
      const body = [[-34, -30], [-30, -38], [-18, -46], [-8, -40], [0, -32], [14, -31], [24, -33], [32, -46], [40, -60], [50, -66], [58, -62], [57, -56], [48, -54], [40, -48], [36, -36], [32, -22]];
      const pts = body.map(pp => T(...pp)), lw = clamp(s * 2.2, 0.7, 1.6);
      const legs = [[[28, -22], [26, -11], [28, 0]], [[20, -20], [18, -10], [20, 0]], [[-28, -21], [-33, -10], [-30, 0]], [[-18, -19], [-20, -9], [-18, 0]]];
      const sil = S.catmull(pts.concat([T(30, -20), T(0, -17), T(-30, -20)]), true, 3);
      P.wash(sil, INK, o.a ?? 0.8, { edge: 0.6, jit: 0.3, steps: 2 });
      P.curve(pts, { w: lw, rough: 0.3, passes: 1, closed: false });
      legs.forEach(l => P.curve(l.map(pp => T(...pp)), { w: lw * 1.3, rough: 0.25, passes: 1 }));
      P.curve([T(-34, -30), T(-36, -22), T(-32, -14)], { w: lw, rough: 0.2, passes: 1 });
      if (s > 0.45) { P.arc(...T(-11, -44), 8 * s, 4 * s, Math.PI * 1.1, Math.PI * 1.9, { w: 0.9, a: 0.9, c: WHITE, passes: 1, rough: 0.2 }); P.line(...T(38, -56), ...T(46, -63), { w: 0.8, a: 0.8, c: WHITE, passes: 1, over: 0, rough: 0.2 }); }
      if (o.rider) { const h = T(-11, -74), b2 = T(-11, -50); P.circle(h[0], h[1], 4 * s, { w: lw, passes: 1, c: INK }); P.wash(S.catmull([T(-17, -50), T(-16, -72), T(-6, -72), T(-5, -50)], true, 2), INK, 0.85, { edge: 0, steps: 2, jit: 0.2 }); }
      if (o.load) { P.wash([T(-24, -44), T(-4, -46), T(-2, -30), T(-24, -28)], '#8c6a3c', 0.8, { edge: 0.4, jit: 0.3, steps: 2 }); P.poly([T(-24, -44), T(-4, -46), T(-2, -30), T(-24, -28)], { w: 0.8, a: 0.9, passes: 1, over: 0, rough: 0.2 }); }
    };
    /* extruded side-profile silhouette standing on the sand: prof = [[s,height],...] along axis d, centred at world C */
    const profile3 = (Cw, d, prof, len0) => prof.map(([sv, hv]) => pj([Cw[0] + d[0] * (sv - len0), hv, Cw[2] + d[2] * (sv - len0)]));
    /* wind-scoured sand ripples, stipple and streaks on the desert floor */
    { const gpoly = [[FX0, HZ + 3], [FX1, HZ + 3], [FX1, FY1], [FX0, FY1]];
      for (let k = 0; k < 32; k++) { const y = HZ + 3 + Math.pow(k / 32, 1.8) * (FY1 - HZ - 3), dens = 0.35 + 0.65 * (k / 32);
        let x = FX0 + P.r(0, 200); while (x < FX1) { const l = P.r(30, 150) * (0.6 + dens), yy = y + P.r(-1, 1);
          P.curve([[x, yy], [x + l * 0.4, yy - P.r(0, 1.6) * dens], [x + l * 0.75, yy + P.r(-1, 1)], [x + l, yy - P.r(0, 1.2)]], { w: 0.45 + dens * 0.35, a: 0.28 + 0.2 * dens, rough: 0.4, passes: 1 });
          x += l + P.r(20, 160); } }
      P.stipple(gpoly, 900, { r: 0.9, a: 0.5, fade: (x, y) => 0.15 + 0.85 * (y - HZ) / (FY1 - HZ) }); }
    /* sandstorm ropes, blue ballpoint (band 1: rolling across the plateau behind the corner) */
    const stormTube = (pts, r0, r1, o = {}) => {
      const i0 = P.ops.length; P.cloudTube(pts, r0, r1, Object.assign({ c: BLUE, a: 0.9, w: 1.05 }, o));
      fillUnder(i0, bandPoly(pts, r0, r1, 2), '#e4c790', o.fillA ?? 0.5);
    };
    stormTube([[1560, 818], [1470, 806], [1380, 824], [1290, 810], [1200, 826], [1120, 812]], 9, 14);
    stormTube([[1560, 846], [1440, 838], [1330, 852], [1210, 842], [1090, 856], [980, 846]], 6, 10);
    
    [[1500, 806, 110, 50], [1360, 810, 96, 44], [1210, 812, 92, 42], [1070, 814, 90, 38]].forEach(([cx, cy, w, h]) => {
      const i0 = P.ops.length, out = P.cloud(cx, cy, w, h, { c: BLUE, w: 1.1, a: 0.9, hi: WHITE, lobes: 11, inner: 3, gap: 3.4 });
      fillUnder(i0, out, '#e4c790', 0.55);
    });
    /* Great Sphinx, temple, workers' village, caravan on the horizon */
    { const dS = [-0.96, 0, 0.27], dl = Math.hypot(dS[0], dS[2]); dS[0] /= dl; dS[2] /= dl;
      const C0 = [262, 0, 36];
      const prof = [[0, 0], [2, 4], [8, 7], [16, 8.6], [30, 8.4], [42, 8.6], [48, 10], [52, 15], [55, 19.5], [59, 21], [63, 19], [64.5, 15], [65, 11.5], [66.5, 10], [68, 8], [73, 3.8], [73.5, 1.6], [72, 0]];
      const pr3 = profile3(C0, dS, prof, 36), inSc = pr3.every(v => v);
      if (inSc) {
        P.erase(pr3.map(v => [v[0], v[1]]));
        P.wash(pr3.map(v => [v[0], v[1]]), '#8a6a3c', 0.85, { edge: 0, jit: 0.3, steps: 3 });
        P.hatch(pr3.map(v => [v[0], v[1]]), { ang: -60, gap: 2.3, a: 0.55, w: 0.5, c: INK, piece: 8, fade: (x, y) => 0.25 + 0.75 * clamp((y - pr3[10][1]) / 45, 0, 1) });
        P.poly(pr3.map(v => [v[0], v[1]]), { w: 1.3, a: 0.95, passes: 1, over: 0, rough: 0.3 });
        const head = profile3(C0, dS, [[52, 15], [55, 19.5], [59, 21], [63, 19], [64.5, 15], [65, 11.5], [66.5, 10], [62, 8.6], [52, 9.5]], 36);
        if (head.every(v => v)) { const hp = head.map(v => [v[0], v[1]]); P.wash(hp, '#ecd8a8', 0.92, { edge: 0, steps: 2, jit: 0.15 }); P.poly(hp, { w: 1.1, a: 0.95, passes: 1, over: 0, rough: 0.2 });
          const nem = profile3(C0, dS, [[52, 15], [55, 19.5], [59, 21], [60.5, 17], [58, 9.6], [52, 9.5]], 36).map(v => [v[0], v[1]]); P.hatch(nem, { ang: 80, gap: 1.6, a: 0.85, w: 0.55, c: INK, inset: 0.1, ragged: 0.2 });
          const eye = profile3(C0, dS, [[63.2, 15.6]], 36)[0]; P.dot(eye[0], eye[1], 1.1, { c: INK, a: 0.95 }); }
        const bk = pr3.slice(2, 7); P.path(bk.map(v => [v[0], v[1] - 1.5]), { w: 1, a: 0.9, c: WHITE, rough: 0.3 });
        P.line(pr3[16][0] - 4, pr3[16][1] - 3, pr3[16][0] + 5, pr3[16][1] - 5, { w: 0.8, a: 0.8, c: WHITE, passes: 1, over: 0, rough: 0.2 });
      }
      // sphinx temple + valley temple: dressed megalithic blocks
      const tb = (cx, cz, w, d, h) => { const c = [[cx - w, cz - d], [cx + w, cz - d], [cx + w, cz + d], [cx - w, cz + d]];
        const base = c.map(q => pj([q[0], 0, q[1]])), top = c.map(q => pj([q[0], h, q[1]])); if (base.some(v => !v) || top.some(v => !v)) return;
        const front = [base[0], base[1], top[1], top[0]].map(v => [v[0], v[1]]), side = [base[1], base[2], top[2], top[1]].map(v => [v[0], v[1]]), roof = [top[0], top[1], top[2], top[3]].map(v => [v[0], v[1]]);
        P.erase(front.concat(side.slice(1), roof.slice(2)));
        P.wash(roof, '#f0dcb0', 0.8, { edge: 0, jit: 0.2, steps: 2 }); P.wash(front, '#d9b678', 0.75, { edge: 0, jit: 0.2, steps: 2 }); P.wash(side, '#7c6644', 0.7, { edge: 0, jit: 0.2, steps: 2 });
        P.hatch(side, { ang: 70, gap: 2.2, a: 0.6, w: 0.5, c: INK, piece: 8 });
        for (const pg of [front, side, roof]) P.poly(pg, { w: 1, a: 0.9, passes: 1, over: 0, rough: 0.25 });
        const nJ = Math.max(2, Math.round(h * 0.5)); for (let k = 1; k < nJ; k++) { const y0 = lerp(front[0][1], front[3][1], k / nJ), y1 = lerp(front[1][1], front[2][1], k / nJ); P.line(front[0][0], y0, front[1][0], y1, { w: 0.5, a: 0.55, passes: 1, over: 0, rough: 0.2 }); } };
      tb(262, 0, 7, 5, 6); tb(290, 44, 9, 6, 7);
      // village huts on the horizon: reed-thatch boxes in rows
      for (let r = 0; r < 2; r++) for (let k = 0; k < 6; k++) { const q = gp(372 + k * 7.5, 96 + r * 12), q2 = gp(372 + k * 7.5 + 4.5, 96 + r * 12), hgt = 3.5; if (!q || !q2) continue;
        const wpx = Math.abs(q2[0] - q[0]) + 6, hh = hgt * FL / q[2], x0 = q[0], y0 = q[1];
        P.wash([[x0, y0], [x0 + wpx, y0], [x0 + wpx, y0 - hh * 0.6], [x0 + wpx / 2, y0 - hh], [x0, y0 - hh * 0.6]], '#e2c48a', 0.85, { edge: 0, jit: 0.15, steps: 2 });
        P.pl([[x0, y0], [x0, y0 - hh * 0.6], [x0 + wpx / 2, y0 - hh], [x0 + wpx, y0 - hh * 0.6], [x0 + wpx, y0]], { w: 0.8, a: 0.9, passes: 1, over: 0, rough: 0.2 });
        P.hatch([[x0 + wpx / 2, y0 - hh], [x0 + wpx, y0 - hh * 0.6], [x0 + wpx, y0], [x0 + wpx / 2, y0]], { ang: 70, gap: 1.6, a: 0.6, w: 0.4, c: INK }); }
    }
    { // caravan of camels crossing the foreground-right, dark against the pale dust
      const cs = [[1336, 898], [1418, 902], [1500, 906]];
      cs.forEach(([sx, sy], i) => { const s = pxm(sx, sy) * 2.0 / 66; camel(sx, sy, s, -1, { rider: i === 0, load: i % 2 === 1 }); });
      for (let i = 0; i + 1 < cs.length; i++) { const s1 = pxm(cs[i][0], cs[i][1]) * 2.0 / 66; P.curve([[cs[i][0] + 34 * s1, cs[i][1] - 30 * s1], [(cs[i][0] + cs[i + 1][0]) / 2 + 40 * s1, cs[i][1] - 20 * s1], [cs[i + 1][0] - 48 * s1, cs[i + 1][1] - 34 * s1]], { w: 0.6, a: 0.7, rough: 0.5, passes: 1 }); }
    }

    P.erase(SIL.khu);
    const hsK = courseHeights(KHU, 1.3, 0.5);
    const faceL = faceDraw(KHU, -1, { hs: hsK, minRow: 1.3, minJoint: 3.6, minDx: 4, bw0: 1.0, bw1: 1.9 });
    const faceR = faceDraw(KHU, 1, { hs: hsK, minRow: 1.3, minJoint: 3.6, minDx: 4, bw0: 1.0, bw1: 1.9 });


    /* ================= 3. HERO SHADING + BLOCK DETAIL ================= */
    // shaded (right) face: slate wash is down; now the black-pen crosshatch, darkest low and near the corner
    const shadeF = (x, y) => clamp(0.42 + 0.55 * clamp((y - 360) / 520, 0, 1) + 0.25 * P.nz(x / 60 + y / 45 + 9), 0, 1);
    if (faceR.length > 2) {
      P.hatch(faceR, { ang: 66, gap: 2.8, a: 0.62, w: 0.55, c: INK, piece: 30, fade: shadeF, jit: 0.3 });
      P.hatch(faceR, { ang: -28, gap: 5, a: 0.5, w: 0.5, c: INK, piece: 34, fade: (x, y) => shadeF(x, y) * 0.8, jit: 0.3 });
    }
    if (faceL.length > 2) {
      // lit face: sparse "tooth" hatch that thickens towards the distance (upper left) and under the lowest courses
      P.hatch(faceL, { ang: -62, gap: 5.5, a: 0.36, w: 0.5, c: INK, piece: 20, fade: (x, y) => clamp(0.12 + (400 - x) / 700 + (500 - y) / 900, 0.05, 0.85) * 0.8, jit: 0.4 });
    }
    // pyramid outline, corner arris, white pen glints down the sunlit edge
    const outline = (a, b, w) => seg(a, b, { w: 0, a: 0.95, rough: 0.5, passes: 2, over: 1, wb: 1, quiet: false });
    const AP = apex(KHU), NC = [0, 0, -rdK], LC = [-rdK, 0, 0], RC = [rdK, 0, 0];
    seg(AP, NC, { w: 2.6, a: 0.95, rough: 0.6, passes: 2, over: 1 });
    seg(AP, LC, { w: 1.7, a: 0.95, rough: 0.6, passes: 2, over: 1 });
    seg(AP, RC, { w: 1.7, a: 0.95, rough: 0.6, passes: 2, over: 1 });
    seg(LC, NC, { w: 1.6, a: 0.9, rough: 0.6, passes: 2, over: 1 });
    seg(NC, RC, { w: 1.6, a: 0.9, rough: 0.6, passes: 2, over: 1 });
    for (let k = 0; k < 40; k++) {
      const h0 = P.r(0, HK - 12), h1 = h0 + P.r(3, 16), uo = P.r(0.12, 0.4);
      seg(facePt(KHU, -1, h0, uo, 0), facePt(KHU, -1, Math.min(h1, HK - 1), uo, 0), { w: 1.1, a: 0.9, c: WHITE, passes: 1, over: 0, rough: 0.3, wb: 1 });
    }
    /* big blocks at the foot of the corner: every stone individually chipped, cracked, glinted */
    const blockQuad = (py, side, h0, h1, u0, u1) => {
      const d = (py.half / py.H) * (h1 - h0);
      return [facePt(py, side, h0, u0), facePt(py, side, h0, u1), facePt(py, side, h1, Math.max(0.02, u1 - d)), facePt(py, side, h1, Math.max(0.02, u0 - d))];
    };
    const blockDetail = (side, h0, h1, u0, u1) => {
      const q3 = blockQuad(KHU, side, h0, h1, u0, u1), q = q3.map(pj); if (q.some(v => !v)) return;
      const wPx = Math.hypot(q[0][0] - q[1][0], q[0][1] - q[1][1]), hPx = Math.hypot(q[0][0] - q[3][0], q[0][1] - q[3][1]);
      if (wPx < 10 || hPx < 4.5) return;
      if (q.filter(v => v[0] > FX0 && v[0] < FX1 && v[1] > FY0 && v[1] < FY1).length < 2) return;
      const lit = FACES[side].lit, z = q[0][2];
      const at = (a, b, k) => [lerp(q[a][0], q[b][0], k), lerp(q[a][1], q[b][1], k)];
      const seg3 = (p0, p1, o) => { const r = lb(p0[0], p0[1], p1[0], p1[1]); if (r) P.line(r[0], r[1], r[2], r[3], Object.assign({ passes: 1, over: 0, rough: 0.35 }, o)); };
      const R = P.r();
      // bedding plane of the limestone: a faint strata line across the block
      if (R < 0.7) { const t = P.r(0.3, 0.65), a0 = at(0, 3, t), b0 = at(1, 2, t), k0 = P.r(0.05, 0.25), k1 = P.r(0.7, 0.95); seg3([lerp(a0[0], b0[0], k0), lerp(a0[1], b0[1], k0)], [lerp(a0[0], b0[0], k1), lerp(a0[1], b0[1], k1)], { w: 0.4, a: lit ? 0.4 : 0.35, c: lit ? INK : '#cfc7b3' }); }
      // pitting / speckle
      if (P.r() < 0.8) { const pts = []; for (let i = 0; i < Math.min(9, 2 + wPx / 12); i++) { const uu = P.r(0.1, 0.9), vv = P.r(0.15, 0.9), a0 = at(0, 3, vv), b0 = at(1, 2, vv); pts.push([lerp(a0[0], b0[0], uu), lerp(a0[1], b0[1], uu), P.r(0.4, 0.95)]); } P.dots(pts, lit ? INK : '#d8d0bc', lit ? 0.6 : 0.5); }
      // shaded underside of the stone
      if (hPx > 11 && P.r() < 0.9) { const sh = clipRect([at(0, 3, 0.66), at(1, 2, 0.66), q[1], q[0]]); if (sh.length > 2) P.hatch(sh, { ang: lit ? -8 : 12, gap: lit ? 3.6 : 3, a: lit ? 0.42 : 0.5, w: 0.5, c: INK, piece: 16, fade: () => 0.85, jit: 0.4 }); }
      // sun glint on the upper arris
      if (lit && P.r() < 0.5) { const a0 = at(3, 2, P.r(0.05, 0.3)), b0 = at(3, 2, P.r(0.45, 0.9)); seg3([a0[0], a0[1] + 1.8], [b0[0], b0[1] + 1.8], { w: 1, a: 0.9, c: WHITE, rough: 0.3 }); }
      // chipped corner
      if (wPx > 26 && hPx > 12) for (let c = 0; c < 4; c++) if (P.r() < 0.16) {
        const v = q[c], o2 = q[(c + 1) % 4], o3 = q[(c + 3) % 4], s1 = P.r(0.06, 0.14), s2 = P.r(0.06, 0.15);
        const A1 = [lerp(v[0], o2[0], s1), lerp(v[1], o2[1], s1)], B1 = [lerp(v[0], o3[0], s2), lerp(v[1], o3[1], s2)];
        const M1 = [(A1[0] + B1[0]) / 2 + (A1[0] + B1[0] - 2 * v[0]) * 0.1 + P.r(-1.5, 1.5), (A1[1] + B1[1]) / 2 + (A1[1] + B1[1] - 2 * v[1]) * 0.1 + P.r(-1.5, 1.5)];
        const chip = [v, A1, M1, B1]; if (chip.some(pp => pp[0] < FX0 || pp[0] > FX1 || pp[1] < FY0 || pp[1] > FY1)) continue;
        P.poly(chip, { w: 0.8, a: 0.85, passes: 1, over: 0, rough: 0.4, c: INK }); P.hatch(chip, { ang: 50, gap: 1.7, a: 0.7, w: 0.5, c: INK, inset: 0.2, ragged: 0.3 }); }
      // hair-line crack
      if (wPx > 22 && P.r() < 0.16) { const t0 = P.r(0.2, 0.8), a = at(3, 2, t0), b = at(0, 1, clamp(t0 + P.r(-0.2, 0.2), 0.05, 0.95));
        P.curve([a, [lerp(a[0], b[0], 0.35) + P.r(-4, 4), lerp(a[1], b[1], 0.35)], [lerp(a[0], b[0], 0.7) + P.r(-4, 4), lerp(a[1], b[1], 0.7)], [lerp(a[0], b[0], P.r(0.85, 1)), lerp(a[1], b[1], P.r(0.85, 1))]], { w: 0.6, a: 0.7, rough: 0.6, passes: 1, c: INK }); }
    };
    for (const side of [-1, 1]) {
      const lim = FACES[side].lit ? 26 : 11, hs2 = hsK.filter(h => h < lim);
      for (let j = 1; j < hs2.length; j++) {
        const h0 = hs2[j - 1], h1 = hs2[j]; let u = P.r(0, 2) + (j % 2 ? 1.3 : 0);
        while (u < rowLen(KHU, h0) - 2) { const w = P.r(1.5, 3.3); blockDetail(side, h0, h1, u, u + w); u += w; }
      }
    }
    // wind-scoured weathering streaks running down the face
    for (let k = 0; k < 44; k++) {
      const side = P.r() < 0.6 ? -1 : 1, h0 = P.r(6, 120), u0 = P.r(2, rowLen(KHU, h0) - 4);
      const pts = []; for (let i = 0; i < 5; i++) { const hh = h0 - i * P.r(1, 3), uu = u0 - (KHU.half / KHU.H) * (hh - h0) + P.r(-0.5, 0.5); pts.push(pj(facePt(KHU, side, Math.max(0.2, hh), Math.max(0.1, uu), 0))); }
      if (pts.some(v => !v || v[0] < FX0 || v[0] > FX1 || v[1] < FY0 || v[1] > FY1)) continue;
      P.curve(pts.map(v => [v[0], v[1]]), { w: 0.5, a: side < 0 ? 0.6 : 0.45, rough: 0.7, passes: 1, c: side < 0 ? INK : '#c9c9d0' });
    }
    // capstone platform + a surveyor's pole (the cap stone went missing in antiquity)
    { const a = pj(AP); if (a) { const pl = [pj([-4, HK - 1.4, -4]), pj([4, HK - 1.4, -4]), pj([4, HK - 1.4, 4]), pj([-4, HK - 1.4, 4])].map(v => [v[0], v[1]]);
        P.poly(pl, { w: 1.2, a: 0.9, rough: 0.2, passes: 1 }); const top = pj([0, HK + 12, 0]); if (top) { P.line(a[0], a[1], top[0], top[1], { w: 1.2, passes: 1, over: 0 }); P.curve([[top[0], top[1]], [top[0] + 10, top[1] + 2], [top[0] + 19, top[1] + 1], [top[0] + 12, top[1] + 5]], { w: 0.9, a: 0.9, rough: 0.3, passes: 1 }); } } }


    /* ================= 4. SCAFFOLDING: gantries, ramps, sledges, workers, ropes ================= */
    const lit3 = (x, y) => inPoly(faceL, x, y);
    const SC = { hi: 0.5 };
    const sc = (p, q, o = {}) => {
      const r = seg(p, q, Object.assign({ c: INK, passes: 1, over: 0, rough: 0.4, a: 0.88 }, o));
      if (r && o.hi && !lit3((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) && P.r() < o.hi) P.line(r[0] + 1.4, r[1] + 0.4, r[2] + 1.4, r[3] + 0.4, { w: 0.75, a: 0.6, c: WHITE, passes: 1, over: 0, rough: 0.25 });
      return r;
    };
    const add3 = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    const rope = (p, q, sag, o = {}) => {
      const pts = []; for (let i = 0; i <= 10; i++) { const k = i / 10, v = pj([lerp(p[0], q[0], k), lerp(p[1], q[1], k) - sag * 4 * k * (1 - k), lerp(p[2], q[2], k)]); if (v && v[0] > FX0 && v[0] < FX1 && v[1] > FY0 && v[1] < FY1) pts.push([v[0], v[1]]); }
      if (pts.length > 2) P.curve(pts, Object.assign({ w: 0.7, a: 0.85, rough: 0.35, passes: 1 }, o));
    };
    const deckPoly = (pts, o = {}) => {
      const c = poly3(pts); if (c.length < 3) return;
      P.wash(c, SLATE, o.a ?? 0.5, { edge: 0, jit: 0.5, steps: 3 });
      P.hatch(c, { ang: o.ang ?? 20, gap: o.gap ?? 3, a: 0.4, w: 0.5, c: INK, piece: 18, fade: () => 0.7 });
      const n2 = c.length; for (let i = 0; i < n2; i++) { const a = c[i], b = c[(i + 1) % n2]; P.line(a[0], a[1], b[0], b[1], { w: 1.1, a: 0.85, passes: 1, over: 0, rough: 0.35 }); }
    };
    /* tapering square timber lattice tower */
    const tower = (O, a, b, h, w0, w1, step, o = {}) => {
      const W = y => lerp(w0, w1, y / h), K = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
      const C = (k, y) => [O[0] + (a[0] * K[k][0] + b[0] * K[k][1]) * W(y), y, O[2] + (a[2] * K[k][0] + b[2] * K[k][1]) * W(y)];
      const nL = Math.round(h / step);
      for (let i = 0; i <= nL; i++) { const y = i * step; for (let k = 0; k < 4; k++) sc(C(k, y), C((k + 1) % 4, y), { wb: 0.8, a: 0.8 }); }
      for (let i = 0; i < nL; i++) { const y0 = i * step, y1 = (i + 1) * step;
        for (let k = 0; k < 4; k++) { const k2 = (k + 1) % 4; sc(C(k, y0), C(k2, y1), { wb: 0.7, a: 0.78 }); if (i % 2 === 0) sc(C(k2, y0), C(k, y1), { wb: 0.7, a: 0.78 }); } }
      for (let k = 0; k < 4; k++) sc(C(k, 0), C(k, h), { wb: 1.35, a: 0.95, passes: 2, over: 0.5, hi: 0.9 });
      for (let d = o.deck0 ?? 3; d <= nL; d += o.deckEvery ?? 4) { const y = d * step, w = W(y) + 2.4;
        deckPoly([add3(add3([O[0], y, O[2]], a, w), b, w), add3(add3([O[0], y, O[2]], a, w), b, -w), add3(add3([O[0], y, O[2]], a, -w), b, -w), add3(add3([O[0], y, O[2]], a, -w), b, w)], { a: 0.4 }); }
      // masthead sheave and hoist ropes
      if (o.head) { const top = [O[0], h + 3, O[2]]; sc(C(0, h), top, { wb: 1 }); sc(C(2, h), top, { wb: 1 }); }
    };
    const towers = [
      { side: -1, u: 58, o: 8, h: 98, w0: 1.7, w1: 0.9 },
      { side: -1, u: 116, o: 9, h: 82, w0: 1.6, w1: 0.9 },
      { side: 1, u: 20, o: 6, h: 112, w0: 1.9, w1: 1 },
      { side: 1, u: 58, o: 8, h: 96, w0: 1.7, w1: 0.9 }];
    /* ramps: a strip climbing the face, propped on posts, planked, roped */
    const ramp = (side, uA, hA, uB, hB, wd, o = {}) => {
      const N = 46, inn = [], out = [];
      for (let i = 0; i <= N; i++) { const t = i / N, h = lerp(hA, hB, t), u = lerp(uA, uB, t); inn.push(facePt(KHU, side, h, u, 0.3)); out.push(facePt(KHU, side, h, u, wd)); }
      const strip = []; for (let i = 0; i <= N; i += 2) strip.push(inn[i]); for (let i = N; i >= 0; i -= 2) strip.push(out[i]);
      deckPoly(strip, { a: 0.38, ang: 8, gap: 3.4 });
      for (let i = 0; i <= N; i++) sc(inn[i], out[i], { wb: 0.5, a: 0.5 });
      for (let i = 0; i < N; i++) { sc(out[i], out[i + 1], { wb: 1.1, a: 0.9 }); sc(add3(out[i], [0, 1, 0], 1.1), add3(out[i + 1], [0, 1, 0], 1.1), { wb: 0.7, a: 0.7 }); }
      // propping posts + cross-bracing under the outer edge
      const PS = 4; let prev = null;
      for (let i = 0; i <= N; i += PS) {
        const o3 = out[i], g = [o3[0], 0, o3[2]];
        sc(g, o3, { wb: 1.0, a: 0.9, hi: 0.7 });
        if (i % 4 === 0) sc(o3, add3(o3, [0, 1, 0], 1.1), { wb: 0.7, a: 0.7 });
        if (prev) { sc([prev[0][0], prev[0][1] * 0.5, prev[0][2]], [o3[0], o3[1] * 0.5, o3[2]], { wb: 0.7, a: 0.7 }); sc([prev[0][0], prev[1][1] * 0.0, prev[0][2]], [o3[0], o3[1] * 0.5, o3[2]], { wb: 0.6, a: 0.6 }); sc([prev[0][0], prev[1][1], prev[0][2]], [o3[0], 0, o3[2]], { wb: 0.6, a: 0.6 }); }
        prev = [g, o3];
      }
      // ties back to the face
      for (let i = 0; i <= N; i += 4) { const h = lerp(hA, hB, i / N); sc(out[i], [inn[i][0], Math.max(0, inn[i][1] - 2), inn[i][2]], { wb: 0.55, a: 0.55 }); }
    };
    for (const t2 of towers) {
      const O = facePt(KHU, t2.side, 0, t2.u, t2.o), a = t2.side < 0 ? DL : DR, b = t2.side < 0 ? NL : NR;
      tower(O, a, b, t2.h, t2.w0, t2.w1, 3.4, { head: true, deckEvery: 7, deck0: 5 });
    }
    ramp(-1, 112, 1, 15, 30, 4.5);
    // corner landing wrapped round the arris
    { const h = 30, w = 4.5, e = Ecor(KHU, h); const corner = [e[0], h, e[2] - w * Math.SQRT2];
      deckPoly([facePt(KHU, -1, h, 15, 0.3), facePt(KHU, -1, h, 15, w), corner, facePt(KHU, 1, h, 15, w), facePt(KHU, 1, h, 15, 0.3), e], { a: 0.55 });
      for (let k = 0; k < 8; k++) sc(facePt(KHU, -1, h, 15, 0.3 + k * 0.85), facePt(KHU, 1, h, 15, 0.3 + k * 0.85), { wb: 0.5, a: 0.5 });
      sc([corner[0], 0, corner[2]], corner, { wb: 1.4, a: 0.95, hi: 0.8 }); sc(corner, add3(corner, [0, 6, 0], 1), { wb: 1, a: 0.9 }); }
    ramp(1, 15, 30, 96, 54, 4.5);
    // hoist ropes strung tower to face
    for (let k = 0; k < 16; k++) { const t2 = towers[k % towers.length], h = P.r(20, 70), O = facePt(KHU, t2.side, h, t2.u, t2.o); const q = facePt(KHU, t2.side, P.r(20, 90), P.r(10, 120), 0.5); rope([O[0], h, O[2]], q, P.r(1, 4), { w: 0.75, a: 0.9, c: t2.side > 0 ? '#efe6cf' : INK }); }
    /* sledges, each with a dressed block, hauled up the left ramp by a team on ropes */
    const deckPt = (t, lat, up = 0) => { const h = lerp(1, 30, t), u = lerp(112, 15, t); return facePt(KHU, -1, h + up, u, 0.3 + lat); };
    const haul = (t0) => {
      const P0 = deckPt(t0, 3.6), P1 = deckPt(t0 + 0.006, 3.6), dir = [P1[0] - P0[0], P1[1] - P0[1], P1[2] - P0[2]], dl = Math.hypot(...dir), dn = dir.map(v => v / dl);
      const side3 = [-dn[2], 0, dn[0]], sl = Math.hypot(side3[0], side3[2]), sd = [side3[0] / sl, 0, side3[2] / sl];
      const bx = (l, w, hh) => add3(add3(add3(P0, dn, l), sd, w), [0, 1, 0], hh);
      const pts = []; for (const l of [-1.6, 1.6]) for (const w of [-1, 1]) for (const hh of [0.2, 2]) pts.push(bx(l, w, hh));
      const E2 = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      for (const [i, j] of E2) sc(pts[i], pts[j], { wb: 0.9, a: 0.9 });
      const top = [pts[1], pts[3], pts[7], pts[5]]; const topc = poly3(top); if (topc.length > 2) P.wash(topc, '#efe0b8', 0.6, { edge: 0, jit: 0.3, steps: 2 });
      sc(bx(-1.6, -1.1, 0), bx(1.9, -1.1, 0), { wb: 1.2 }); sc(bx(-1.6, 1.1, 0), bx(1.9, 1.1, 0), { wb: 1.2 });
      const front = bx(1.9, 0, 0.3);
      for (let k = 0; k < 8; k++) { const l = 4 + Math.floor(k / 2) * 2.2, lat = (k % 2 ? 1.1 : -1.1), w2 = add3(add3(P0, dn, l + 1.6), sd, lat); const foot = [w2[0], w2[1], w2[2]];
        rope(front, add3(foot, [0, 1.2, 0], 1), 0.35, { w: 0.6, a: 0.85 }); fig3(foot, { pose: 'pull', dir: 1, step: (k % 3) - 1 }); }
    };
    [0.22, 0.42, 0.62, 0.8].forEach(haul);
    /* open timber cages clamped to the faces (like the box gantries of ref. A), plus a crane at the capstone */
    const cage = (C, y0, w, hg, ax, o = {}) => {
      const a = ax[0], b = ax[1], K = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
      const V = (k, y) => [C[0] + (a[0] * K[k][0] + b[0] * K[k][1]) * w, y, C[2] + (a[2] * K[k][0] + b[2] * K[k][1]) * w];
      deckPoly([V(0, y0), V(1, y0), V(2, y0), V(3, y0)], { a: 0.42, ang: 50, gap: 4 });
      for (let k = 0; k < 4; k++) { const k2 = (k + 1) % 4; sc(V(k, y0), V(k, y0 + hg), { wb: 1.3, a: 0.95, hi: 0.9 }); sc(V(k, y0 + hg), V(k2, y0 + hg), { wb: 1, a: 0.9 }); sc(V(k, y0 + hg * 0.5), V(k2, y0 + hg * 0.5), { wb: 0.6, a: 0.7 }); sc(V(k, y0), V(k2, y0 + hg), { wb: 0.7, a: 0.8 }); sc(V(k2, y0), V(k, y0 + hg), { wb: 0.7, a: 0.8 }); }
      for (let i = 1; i < 7; i++) { const f = i / 7; sc(add3(V(0, y0), [V(1, y0)[0] - V(0, y0)[0], 0, V(1, y0)[2] - V(0, y0)[2]], f), add3(V(3, y0), [V(2, y0)[0] - V(3, y0)[0], 0, V(2, y0)[2] - V(3, y0)[2]], f), { wb: 0.45, a: 0.5 }); }
    };
    [[1, 26, 3.6, 12, 3.4], [1, 26, 3.6, 27, 3.2], [1, 26, 3.6, 42, 3], [-1, 78, 3.4, 18, 3], [1, 72, 3.4, 30, 3]].forEach(([side, u, o, h, w]) => {
      const C = facePt(KHU, side, 0, u, o), ax = side < 0 ? [DL, NL] : [DR, NR];
      cage([C[0], 0, C[2]], h, w, 6.4, ax);
    });
    { const t0 = [0, HK, 0], t1 = [0, HK + 15, 0], jib = [-9, HK + 13, -5]; sc(t0, t1, { wb: 1.6, a: 0.95, passes: 2 }); sc(t1, jib, { wb: 1.2, a: 0.95 }); sc(t1, [0, HK + 13, -12], { wb: 0.8, a: 0.9 }); sc([0, HK + 8, 0], jib, { wb: 0.6, a: 0.8 }); rope(jib, [-9, HK + 1, -5], 0, { w: 0.9, a: 0.95 }); }

    /* ================= 5. FOREGROUND: the crew at the foot of the arris ================= */
    const figureL = (x, y, h, o = {}) => {
      const d = o.dir ?? 1, st = o.step ?? 0, pose = o.pose || 'pull', th = clamp(h * 0.075, 1.2, 6.5);
      const limb = (x0, y0, x1, y1, t = th) => {
        P.line(x0, y0, x1, y1, { w: t, c: '#ecd9b0', a: 0.97, passes: 1, over: 0, rough: 0.1 });
        P.line(x0 + t * 0.55, y0, x1 + t * 0.55, y1, { w: 0.85, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.15 });
        P.line(x0 - t * 0.45, y0, x1 - t * 0.45, y1, { w: 0.7, c: WHITE, a: 0.85, passes: 1, over: 0, rough: 0.15 });
      };
      const hip = [x - d * h * 0.02, y - h * 0.5], neck = [x + d * h * 0.03, y - h * 0.83], sw = h * 0.2;
      limb(hip[0], hip[1], x + d * sw * (0.6 + st * 0.4), y, th * 1.05); limb(hip[0], hip[1], x - d * sw * (0.6 - st * 0.4), y - h * 0.015, th * 1.05);
      limb(hip[0], hip[1], neck[0], neck[1], th * 1.6);
      if (pose === 'pull') { limb(neck[0], neck[1] + h * 0.04, x + d * h * 0.32, y - h * 0.62, th * 0.85); limb(neck[0], neck[1] + h * 0.06, x + d * h * 0.28, y - h * 0.56, th * 0.85); }
      else if (pose === 'push') { limb(neck[0], neck[1] + h * 0.04, x + d * h * 0.3, y - h * 0.78, th * 0.85); limb(neck[0], neck[1] + h * 0.06, x + d * h * 0.28, y - h * 0.7, th * 0.85); }
      else { limb(neck[0], neck[1] + h * 0.05, x + d * h * 0.06, y - h * 0.52, th * 0.85); limb(neck[0], neck[1] + h * 0.05, x - d * h * 0.06, y - h * 0.5, th * 0.85); }
      const lc = [[hip[0] - h * 0.1, hip[1] - h * 0.03], [hip[0] + h * 0.1, hip[1] - h * 0.03], [hip[0] + h * 0.12, hip[1] + h * 0.16], [hip[0] - h * 0.12, hip[1] + h * 0.16]];
      P.wash(lc, '#fbf3df', 0.95, { edge: 0, jit: 0.2, steps: 2 }); P.poly(lc, { w: 0.8, a: 0.85, passes: 1, over: 0, rough: 0.2 });
      const hc = [neck[0] + d * h * 0.02, neck[1] - h * 0.075];
      P.wash(S.catmull([[hc[0] - h * 0.07, hc[1]], [hc[0], hc[1] - h * 0.075], [hc[0] + h * 0.07, hc[1]], [hc[0], hc[1] + h * 0.075]], true, 2), '#ecd9b0', 0.97, { edge: 0, steps: 2, jit: 0.1 });
      P.circle(hc[0], hc[1], h * 0.075, { w: 1, a: 0.9, passes: 1, rough: 0.15 });
      P.wash(S.catmull([[hc[0] - h * 0.08, hc[1] - h * 0.02], [hc[0], hc[1] - h * 0.1], [hc[0] + h * 0.08, hc[1] - h * 0.02], [hc[0] + h * 0.09, hc[1] + h * 0.02], [hc[0] - h * 0.09, hc[1] + h * 0.02]], true, 2), INK, 0.9, { edge: 0, steps: 2, jit: 0.1 });   // wig
      return { hand: [x + d * h * 0.31, y - h * 0.6] };
    };
    const box3 = (G, l, w, hh, dl, dn, ink = {}) => {   // a dressed block at ground point G, l along dl, w along dn
      const pts = []; for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c of [0, 1]) pts.push([G[0] + dl[0] * a * l / 2 + dn[0] * b * w / 2, c * hh, G[2] + dl[2] * a * l / 2 + dn[2] * b * w / 2]);
      const idx = (a, b, c) => (a < 0 ? 0 : 4) + (b < 0 ? 0 : 2) + c;
      const top = poly3([pts[idx(-1, -1, 1)], pts[idx(1, -1, 1)], pts[idx(1, 1, 1)], pts[idx(-1, 1, 1)]]);
      const fr = poly3([pts[idx(-1, -1, 0)], pts[idx(1, -1, 0)], pts[idx(1, -1, 1)], pts[idx(-1, -1, 1)]]);
      const sd = poly3([pts[idx(-1, -1, 0)], pts[idx(-1, 1, 0)], pts[idx(-1, 1, 1)], pts[idx(-1, -1, 1)]]);
      const sd2 = poly3([pts[idx(1, -1, 0)], pts[idx(1, 1, 0)], pts[idx(1, 1, 1)], pts[idx(1, -1, 1)]]);
      if (top.length > 2) P.wash(top, '#f3e6c4', 0.9, { edge: 0, steps: 2, jit: 0.3 });
      if (fr.length > 2) { P.wash(fr, '#cdb07a', 0.85, { edge: 0, steps: 2, jit: 0.3 }); }
      if (sd2.length > 2) { P.wash(sd2, '#5b5040', 0.85, { edge: 0, steps: 2, jit: 0.3 }); P.hatch(sd2, { ang: 75, gap: 2, a: 0.6, w: 0.5, c: INK, piece: 10 }); }
      if (sd.length > 2) P.wash(sd, '#a48a5c', 0.8, { edge: 0, steps: 2, jit: 0.3 });
      for (const [i, j] of [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) seg(pts[i], pts[j], { w: 1.5, a: 0.95, passes: 1, over: 0, rough: 0.3 });
      // dressed-stone chisel marks on the top
      if (top.length > 2) P.stipple(top, 20, { r: 0.9, a: 0.6, c: INK });
    };
    { const G1 = ground(948, 921), dl = DR, dn = NR;
      // sledge runners + block
      const runL = add3(G1, dn, -0.8), runR = add3(G1, dn, 0.8);
      seg(add3(runL, dl, -1.9), add3(runL, dl, 3.2), { w: 2.4, a: 0.95, passes: 1, rough: 0.3 }); seg(add3(runR, dl, -1.9), add3(runR, dl, 3.2), { w: 2.4, a: 0.95, passes: 1, rough: 0.3 });
      box3(G1, 2.5, 1.5, 1.35, dl, dn);
      const front = add3(add3(G1, dl, 3.1), [0, 0.5, 0], 1), crew = [];
      for (let k = 0; k < 6; k++) { const w3 = add3(add3(G1, dl, 5 + Math.floor(k / 2) * 2.5), dn, k % 2 ? 1.5 : -1.3), v = pj(w3); if (v) crew.push({ v, w3, k }); }
      // second block, levered up by a small crew (pole, fulcrum stone, two men leaning)
      const G3 = add3(add3(G1, dl, 15.5), dn, -1.2);
      box3(G3, 2.3, 1.4, 1.25, dl, dn);
      const lp0 = add3(add3(G3, dl, -0.6), [0, 0.3, 0], 1), lp1 = add3(add3(add3(G3, dl, -5.4), dn, 0.2), [0, 1.55, 0], 1);
      seg(lp0, lp1, { w: 3.2, a: 0.95, passes: 1, over: 0, rough: 0.2 }); seg(lp0, lp1, { w: 0.9, a: 0.9, c: WHITE, passes: 1, over: 0, rough: 0.1 });
      seg(add3(G3, dl, -2.6), add3(add3(G3, dl, -2.6), [0, 0.55, 0], 1), { w: 3.2, a: 0.95, passes: 1 });
      for (let k = 0; k < 2; k++) { const w3 = add3(add3(G3, dl, -4.5 - k * 1.15), dn, k ? 0.9 : -0.5), v = pj(w3); if (v) crew.push({ v, w3, k: 10 + k, lever: true }); }
      crew.sort((p1, p2) => p2.v[2] - p1.v[2]);
      for (const c of crew) { const h = 1.72 * FL / c.v[2];
        if (c.lever) figureL(c.v[0], c.v[1], h, { pose: 'push', dir: 1, step: 0.3 });
        else { figureL(c.v[0], c.v[1], h, { pose: 'pull', dir: 1, step: [-1, 1, 0, -0.5][c.k % 4] }); const hnd = add3(c.w3, dl, 0.55); rope(front, add3(hnd, [0, 1.05, 0], 1), 0.3, { w: 1.2, a: 0.92, c: '#efe3c2' }); } }
      // wet-sand pourer well ahead of the runners
      { const w3 = add3(G1, dl, 21.5), v = pj(w3); if (v) figureL(v[0], v[1], 1.7 * FL / v[2], { pose: 'carry', dir: 1, step: 0.3 }); }
    }

    /* ================= 6. CONSTRUCTION-GEOMETRY OVERLAY (sun paths, concentric circles, sight lines) ================= */
    const ORT = { x0: 60, y0: 62, x1: 566, y1: 346 }, ORI = { x0: 1236, y0: 62, x1: 1540, y1: 300 }, KIT = { x0: 60, y0: 354, x1: 346, y1: 442 };
    const inRect = (r, x, y, m = 0) => x > r.x0 - m && x < r.x1 + m && y > r.y0 - m && y < r.y1 + m;
    const skyOK = (x, y) => x > FX0 + 3 && x < FX1 - 3 && y > FY0 + 3 && y < HZ - 2 && !inRect(ORT, x, y, 4) && !inRect(ORI, x, y, 4) && !inPoly(SIL.khu, x, y) && !inPoly(SIL.kha, x, y) && !inPoly(SIL.men, x, y);
    const skyArc = (cx, cy, r, a0, a1, o = {}) => {
      const step = 3 / r, run = []; let cur = [];
      for (let a = a0; a <= a1; a += step) { const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (skyOK(x, y)) cur.push([x, y]); else { if (cur.length > 3) run.push(cur); cur = []; } }
      if (cur.length > 3) run.push(cur);
      for (const pts of run) P.path(pts, { w: o.w ?? 0.8, a: o.a ?? 0.8, c: o.c || WHITE, rough: 0.7, passes: o.passes ?? 1 });
      if (o.ticks) for (let a = a0, k = 0; a <= a1; a += o.ticks, k++) { const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (!skyOK(x, y)) continue; const l = k % (o.major || 5) === 0 ? 9 : 4.5; P.line(x, y, x + Math.cos(a) * l * (o.side ?? 1), y + Math.sin(a) * l * (o.side ?? 1), { w: 0.7, a: o.a ?? 0.8, c: o.c || WHITE, passes: 1, over: 0, rough: 0.15 }); }
      return run;
    };
    const A2 = pj(apex(KHU));
    // concentric construction circles about the apex, a dark and a white pen pass each (ref. B look)
    [34, 66, 104, 150, 205, 268, 340, 420].forEach((r, i) => { skyArc(A2[0], A2[1], r, 0, TAU, { w: 0.75, a: 0.6, c: WHITE, passes: 2 }); skyArc(A2[0], A2[1], r + 2.2, P.r(0, 1), TAU, { w: 0.55, a: 0.55, c: INK }); });
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + 0.2; skyArc(A2[0], A2[1], 0, 0, 0); const r0 = 30, r1 = k % 2 ? 300 : 460; const x0 = A2[0] + Math.cos(a) * r0, y0 = A2[1] + Math.sin(a) * r0; const pts = []; for (let d = r0; d < r1; d += 4) { const x = A2[0] + Math.cos(a) * d, y = A2[1] + Math.sin(a) * d; if (skyOK(x, y)) pts.push([x, y]); else if (pts.length > 2) break; } if (pts.length > 3) P.path(pts, { w: 0.5, a: 0.4, c: WHITE, rough: 0.6 }); }
    // the three sun paths (summer solstice, equinox, winter solstice), hour ticks
    const SCX = 800, SCY = 1350, sunR = [1125, 1035, 945];
    sunR.forEach((r, i) => { skyArc(SCX, SCY, r, Math.PI + 0.1, TAU - 0.1, { w: 1.0, a: 0.9, c: WHITE, passes: 2, ticks: 0.052 * 1000 / r * (r / 1000), major: 4, side: -1 }); skyArc(SCX, SCY, r + 2.6, Math.PI + 0.1, TAU - 0.1, { w: 0.6, a: 0.7, c: INK }); });
    const sun = (x, y, r) => { P.circle(x, y, r, { w: 1.2, a: 0.95, c: WHITE, passes: 1 }); P.dot(x, y, r * 0.35, { c: WHITE, a: 0.9 }); for (let k = 0; k < 14; k++) { const a = k * TAU / 14; P.line(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35, x + Math.cos(a) * r * (k % 2 ? 1.75 : 2.15), y + Math.sin(a) * r * (k % 2 ? 1.75 : 2.15), { w: 0.9, a: 0.9, c: WHITE, passes: 1, over: 0, rough: 0.2 }); } };
    sunR.forEach((r, i) => { const x = SCX + 60 + i * 20, y = SCY - Math.sqrt(r * r - (x - SCX) * (x - SCX)); if (skyOK(x, y) && i !== 2) sun(x, y, 7); });

    /* white-pen lettering with a dark under-stroke so it reads on the hatched sky */
    const TW = (str, x, y, o = {}) => { P.text(str, x + 0.9, y + 0.9, Object.assign({ c: INK, a: 0.55 }, o)); P.text(str, x, y, Object.assign({ c: WHITE, a: 0.95 }, o)); };
    const leaderW = (x0, y0, tx, ty, o = {}) => { P.curve([[x0, y0], [lerp(x0, tx, 0.5) + P.r(-6, 6), lerp(y0, ty, 0.5) + P.r(-6, 6)], [tx, ty]], { w: 0.8, a: 0.9, c: o.c || WHITE, rough: 0.5, passes: 1 }); const an = Math.atan2(ty - y0, tx - x0); for (const s2 of [-1, 1]) P.line(tx, ty, tx - Math.cos(an + s2 * 0.4) * 8, ty - Math.sin(an + s2 * 0.4) * 8, { w: 0.9, a: 0.95, c: o.c || WHITE, passes: 1, over: 0, rough: 0.2 }); };
    const noteW = (str, x, y, tx, ty, o = {}) => { TW(str, x, y, o); const w = P.measure(str, o.size ?? 15); const sx = o.align === 'right' ? x - w - 6 : o.align === 'center' ? x : x - 6; leaderW(o.from === 'end' ? x + w + 4 : sx, y - (o.size ?? 15) * 0.3, tx, ty); };

    TW('BUILT TO TALK TO THE STARS', 836, 122, { size: 36, align: 'center', ls: 1 });
    TW("FIELD NOTEBOOK OF AN ARCHAEOLOGIST-ASTRONOMER  -  GIZA PLATEAU", 836, 152, { size: 13, align: 'center', a: 0.9 });

    /* ================= 7. INSETS ================= */
    const CREAM = '#eadbb8';
    const panel = (r, col, a = 0.94) => { const poly = [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1]]; P.erase(poly); P.wash(poly, col, a, { edge: 0, jit: 0.4, steps: 4 }); return poly; };
    const rules = (r, c = INK) => { P.rect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0, { w: 1.5, a: 0.9, c, rough: 0.3, over: 1.5, passes: 1 }); P.rect(r.x0 + 4, r.y0 + 4, r.x1 - r.x0 - 8, r.y1 - r.y0 - 8, { w: 0.6, a: 0.65, c, rough: 0.3, over: 1, passes: 1 }); };
    const TX = (str, x, y, o = {}) => P.text(str, x, y, Object.assign({ size: 11, a: 0.88 }, o));
    const gl = (x0, y0, x1, y1, o = {}) => P.line(x0, y0, x1, y1, Object.assign({ w: 0.8, a: 0.72, c: GB, rough: 0.3, passes: 1, over: 4 }, o));

    /* ---- 7a. ORTHOGRAPHIC PANEL: plan, elevation, section with the passage network as red/green trace bundles ---- */
    { panel(ORT, CREAM); rules(ORT);
      const m1 = 0.469, cxE = 138, baseY = 300;                       // plan + elevation scale (px per metre) and axis
      const s2 = 0.95, cxS = 442;                                      // section scale (chambers drawn 2x)
      TX('ORTHOGRAPHIC  -  KHUFU  -  1 : 2130  (SECTION 1 : 1050)', 74, 84, { size: 11, a: 0.85 });
      // blue construction guides (drawn first, under the pencil)
      for (const x of [cxE - 54, cxE, cxE + 54]) gl(x, 104, x, 340);
      for (const y of [baseY, baseY - 68.7]) gl(74, y, 552, y);
      gl(cxS, 150, cxS, 340, { a: 0.5 }); gl(cxS - 110, 150, cxS - 110, 340, { a: 0.5 }); gl(cxS + 110, 150, cxS + 110, 340, { a: 0.5 });
      gl(cxE, 96, cxS, 96, { a: 0.4 }); gl(74, 210, 552, 210, { a: 0.35 });
      for (const [x, y] of [[cxE - 54, baseY], [cxE + 54, baseY], [cxE, baseY - 68.7], [cxS - 110, baseY], [cxS + 110, baseY], [cxS, baseY - 139.3]]) { P.line(x - 5, y, x + 5, y, { w: 0.9, a: 0.85, c: GB, passes: 1, over: 0 }); P.line(x, y - 5, x, y + 5, { w: 0.9, a: 0.85, c: GB, passes: 1, over: 0 }); }
      // PLAN (top-left), compass-aligned, four faces in different tones
      { const cx = cxE, cy = 160, h = 54; TX('PLAN', 74, 101, { size: 12 });
        const tri = [[[cx - h, cy - h], [cx + h, cy - h], [cx, cy]], [[cx - h, cy + h], [cx + h, cy + h], [cx, cy]], [[cx + h, cy - h], [cx + h, cy + h], [cx, cy]], [[cx - h, cy - h], [cx - h, cy + h], [cx, cy]]];
        [['#f3e6c6', 0.5], ['#8a7a5a', 0.5], ['#a99674', 0.5], ['#e2cf9f', 0.5]].forEach(([c, a], i) => P.wash(tri[i], c, 0.55, { edge: 0, jit: 0.3, steps: 2 }));
        P.hatch(tri[1], { ang: 15, gap: 2.2, a: 0.55, w: 0.45, piece: 20 }); P.hatch(tri[2], { ang: 80, gap: 2.6, a: 0.5, w: 0.45, piece: 20 }); P.hatch(tri[3], { ang: -60, gap: 5, a: 0.3, w: 0.4, piece: 20 });
        P.rect(cx - h, cy - h, h * 2, h * 2, { w: 1.4, a: 0.9, rough: 0.25, passes: 1 });
        P.line(cx - h, cy - h, cx + h, cy + h, { w: 0.8, a: 0.75, passes: 1, over: 0 }); P.line(cx + h, cy - h, cx - h, cy + h, { w: 0.8, a: 0.75, passes: 1, over: 0 });
        for (let i = 1; i < 6; i++) { const q = h - i * 9; P.rect(cx - q, cy - q, q * 2, q * 2, { w: 0.4, a: 0.4, rough: 0.15, passes: 1, over: 0 }); }
        // N arrow, section cut markers
        P.line(cx + h + 12, cy + 18, cx + h + 12, cy - 22, { w: 1, passes: 1, over: 0, a: 0.85 }); P.pl([[cx + h + 8, cy - 14], [cx + h + 12, cy - 24], [cx + h + 16, cy - 14]], { w: 1, a: 0.85 }); TX('N', cx + h + 8, cy - 28, { size: 11 });
        for (const sx of [cx - h - 12, cx + h + 3]) { P.line(sx, cy - 6, sx, cy + 6, { w: 0.9, a: 0.85, passes: 1, over: 0 }); P.pl([[sx - 4, cy + 3], [sx, cy - 3], [sx + 4, cy + 3]], { w: 0.9, a: 0.85, over: 0 }); }
        TX('A', cx - h - 22, cy + 4, { size: 11 }); TX('A', cx + h + 10, cy + 4, { size: 11 }); }
      // ELEVATION (below the plan, same width via the guides)
      { const ap = [cxE, baseY - 68.7], L = [cxE - 54, baseY], R = [cxE + 54, baseY];
        TX('ELEVATION', 74, 226, { size: 12 });
        for (let y = ap[1] + 2; y < baseY; y += 2.2) { const f = (y - ap[1]) / 68.7; P.line(cxE - 54 * f + 0.5, y, cxE + 54 * f - 0.5, y, { w: 0.35, a: 0.5, passes: 1, over: 0, rough: 0.15 }); }
        P.wash([ap, [cxE, baseY], L], '#f0e0b8', 0.55, { edge: 0, jit: 0.3, steps: 2 }); P.wash([ap, R, [cxE, baseY]], '#8f7d5b', 0.6, { edge: 0, jit: 0.3, steps: 2 });
        P.hatch([ap, R, [cxE, baseY]], { ang: 70, gap: 2.2, a: 0.5, w: 0.45, piece: 20 }); P.poly([ap, R, L], { w: 1.4, a: 0.92, rough: 0.2, passes: 1 }); P.line(ap[0], ap[1], cxE, baseY, { w: 1, a: 0.85, passes: 1, over: 0 });
        P.arc(L[0], L[1], 22, 22, -0.9, 0, { w: 0.9, a: 0.85, passes: 1 }); TX("51 50'", L[0] + 24, baseY - 6, { size: 10 });
        P.line(L[0] - 4, baseY, R[0] + 4, baseY, { w: 1.6, a: 0.9, passes: 1, over: 1 });
        P.dim(L[0], baseY + 6, R[0], baseY + 6, '230.4', 8, { size: 10 }); }
      // SECTION A-A: masonry, bedrock, passages as PCB-style red/green trace bundles
      { const T = (x, y) => [cxS + x * s2, baseY - y * s2], ap = T(0, 146.6), L = T(-115.2, 0), R = T(115.2, 0);
        TX('SECTION A-A  (N - S)', 340, 100, { size: 12 });
        P.wash([ap, R, L], '#e9d6a6', 0.6, { edge: 0, jit: 0.3, steps: 2 });
        for (let y = 2; y < 146; y += 2.6) { const a = T(-115.2 * (1 - y / 146.6) + 0.5, y), b = T(115.2 * (1 - y / 146.6) - 0.5, y); P.line(a[0], a[1], b[0], b[1], { w: 0.35, a: 0.45, passes: 1, over: 0, rough: 0.12 }); }
        P.poly([ap, R, L], { w: 1.5, a: 0.92, rough: 0.2, passes: 1 }); P.line(L[0] - 10, baseY, R[0] + 10, baseY, { w: 1.6, a: 0.9, passes: 1, over: 1 });
        for (let x = L[0] - 8; x < R[0] + 10; x += 6.5) P.line(x, baseY + 1.5, x - 5, baseY + 8 + P.r(0, 3), { w: 0.45, a: 0.5, passes: 1, over: 0, rough: 0.2 });
        const chamber = (x0, y0, x1, y1, tone = 0.3) => { const a = T(x0, y0), b = T(x1, y1), poly = [[a[0], b[1]], [b[0], b[1]], [b[0], a[1]], [a[0], a[1]]]; P.erase(poly); P.wash(poly, '#3a3428', 0.6, { edge: 0, jit: 0.2, steps: 2 }); P.hatch(poly, { ang: 40, gap: 1.8, a: 0.55, w: 0.4, inset: 0.3 }); P.poly(poly, { w: 1, a: 0.9, passes: 1, over: 0, rough: 0.15 }); return poly; };
        // passage geometry (metres), drawn as trace bundles
        const E = T(-101.8, 17), Jn = T(-76, 4), G0 = T(-42, 21), G1p = T(-1.5, 41.5), Q0 = T(-2.9, 21.5), Sd = T(-6, -30);
        const bus = (pts, n, gap, cols, o = {}) => { P.bus(pts, n, gap, Object.assign({ colors: cols, w: 1.5, a: 0.95, pads: 1.6 }, o)); };
        chamber(-8, -33, 14, -27); chamber(-2.9, 21, 2.9, 26); chamber(-5.3, 40, 5.3, 46.5);
        for (let k = 0; k < 5; k++) { const a = T(-5, 46.5 + k * 1.6), b = T(5, 46.5 + k * 1.6); P.rect(a[0], a[1] - 1.4, b[0] - a[0], 1.4, { w: 0.5, a: 0.7, passes: 1, over: 0, rough: 0.1 }); }
        P.pl([T(-5.3, 55), T(0, 60), T(5.3, 55)], { w: 0.9, a: 0.85, over: 0 });
        bus([E, Jn, Sd, T(6, -30)], 2, 2.4, [GRN, RED], { chamfer: 5 });
        bus([Jn, G0, G1p, T(-1.5, 43.5)], 3, 2.2, [RED, GRN, RED], { chamfer: 4 });
        bus([G0, Q0], 2, 2.2, [GRN, RED], { chamfer: 3 });
        // ventilation shafts: the south one is the star-sight, in strong red
        bus([T(5.3, 44), T(47.3, 86.3)], 1, 1, [RED], { w: 1.8 }); bus([T(-5.3, 44), T(-55.9, 75.6)], 1, 1, [GRN], { w: 1.4 });
        bus([T(2.9, 24), T(24, 45)], 1, 1, [RED], { w: 1.1 }); bus([T(-2.9, 24), T(-22, 40)], 1, 1, [GRN], { w: 1.1 });
        const ex = T(47.3, 86.3); P.pl([[ex[0] + 2, ex[1] - 4], [ex[0] + 12, ex[1] - 12], [ex[0] + 10, ex[1] - 2]], { w: 1.4, a: 0.95, c: RED, over: 0 });
        P.arc(T(5.3, 44)[0], T(5.3, 44)[1], 30, 30, -Math.PI / 4, 0, { w: 0.9, a: 0.9, c: RED, passes: 1 }); TX('45', T(5.3, 44)[0] + 33, T(5.3, 44)[1] - 6, { size: 10, c: RED });
        P.line(T(5.3, 44)[0], T(5.3, 44)[1], T(5.3, 44)[0] + 46, T(5.3, 44)[1], { w: 0.6, a: 0.8, c: RED, passes: 1, over: 0 });
        P.dashed(cxS, baseY - 146.6 * s2 - 10, cxS, baseY + 34, [14, 4, 3, 4], { w: 0.6, a: 0.6 });
        // callouts (small, single-stroke)
        TX("KING'S CH.", T(12, 56)[0], T(12, 56)[1], { size: 10 }); TX("QUEEN'S", T(6, 20)[0], T(6, 12)[1], { size: 10 });
        TX('GRAND GALLERY', T(-92, 44)[0], T(-92, 44)[1], { size: 10 }); P.line(T(-60, 42)[0] + 4, T(-60, 40)[1] - 2, T(-34, 32)[0], T(-34, 32)[1] - 2, { w: 0.6, a: 0.7, passes: 1, over: 0 });
        TX('ENTRANCE', T(-112, 25)[0], T(-112, 25)[1], { size: 10 }); TX('DESCENDING', T(-96, -8)[0], T(-96, -8)[1], { size: 10 }); TX('SUBTERRANEAN', T(16, -29)[0], T(16, -29)[1] + 3, { size: 10 });
      }
      // site map + tonal swatches + pen samples
      { const x0 = 226, y0 = 108; TX('SITE', x0, 100, { size: 12 });
        const sq = (cx, cy, s, fill) => { P.rect(cx - s / 2, cy - s / 2, s, s, { w: 1, a: 0.9, rough: 0.2, passes: 1 }); P.line(cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2, { w: 0.4, a: 0.6, passes: 1, over: 0 }); P.line(cx + s / 2, cy - s / 2, cx - s / 2, cy + s / 2, { w: 0.4, a: 0.6, passes: 1, over: 0 }); P.wash([[cx - s / 2, cy - s / 2], [cx + s / 2, cy - s / 2], [cx + s / 2, cy + s / 2], [cx - s / 2, cy + s / 2]], fill, 0.4, { edge: 0, steps: 2, jit: 0.2 }); };
        sq(x0 + 78, y0 + 22, 22, '#d9b878'); sq(x0 + 52, y0 + 46, 20, '#d9b878'); sq(x0 + 28, y0 + 66, 10, '#d9b878');
        [[x0 + 92, y0 + 34], [x0 + 92, y0 + 44], [x0 + 92, y0 + 54]].forEach(([x, y]) => sq(x, y, 6, '#d9b878'));
        P.rect(x0 + 60, y0 + 6, 3, 14, { w: 0.6, a: 0.8, passes: 1 }); P.rect(x0 + 92, y0 + 10, 3, 16, { w: 0.6, a: 0.8, passes: 1 });
        for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) P.rect(x0 + 100 + k * 4, y0 + 4 + r * 4, 3, 2.4, { w: 0.4, a: 0.7, passes: 1, over: 0 });
        P.dashed(x0 + 14, y0 + 78, x0 + 96, y0 + 8, [8, 3, 2, 3], { w: 0.5, a: 0.6 });
        P.poly([[x0 + 4, y0 + 40], [x0 + 12, y0 + 38], [x0 + 15, y0 + 42], [x0 + 4, y0 + 44]], { w: 0.8, a: 0.9, passes: 1, over: 0 }); TX('SPHINX', x0 - 2, y0 + 54, { size: 8 });
        TX('KHUFU', x0 + 52, y0 + 6, { size: 8 }); TX('KHAFRE', x0 + 26, y0 + 40, { size: 8 }); TX('MENKAURE', x0 - 2, y0 + 80, { size: 8 });
        P.circle(x0 + 118, y0 + 76, 7, { w: 0.8, a: 0.85, passes: 1 }); P.line(x0 + 118, y0 + 82, x0 + 118, y0 + 68, { w: 0.9, a: 0.85, passes: 1, over: 0 }); P.pl([[x0 + 115, y0 + 71], [x0 + 118, y0 + 66], [x0 + 121, y0 + 71]], { w: 0.9, a: 0.85, over: 0 }); }
      { const x0 = 74, y0 = 331; TX('TONE', x0, y0 - 2, { size: 8, a: 0.7 });
        for (let i = 0; i < 5; i++) { const rx = x0 + 26 + i * 26, poly = [[rx, y0 - 10], [rx + 22, y0 - 10], [rx + 22, y0 + 4], [rx, y0 + 4]]; P.rect(rx, y0 - 10, 22, 14, { w: 0.8, a: 0.85, passes: 1, over: 0, rough: 0.2 });
          if (i) P.hatch(poly, { ang: 40, gap: [0, 5, 3.4, 2.2, 1.5][i], a: 0.55, w: 0.45, inset: 0.3, cross: i > 2 ? 80 : undefined }); if (i === 4) P.wash(poly, SLATE, 0.45, { edge: 0, steps: 2, jit: 0.1 }); }
        [0.5, 0.9, 1.5].forEach((w, i) => P.line(x0 + 166, y0 - 8 + i * 5, x0 + 200, y0 - 8 + i * 5, { w, a: 0.9, passes: 1, over: 0, rough: 0.15 })); TX('PEN 0.3-0.6-1.2', x0 + 206, y0 + 2, { size: 8, a: 0.7 }); }
    }


    /* ---- 7b. ORION INSET: night sky, the belt aligned with the three pyramids ---- */
    const ALN = [1352, 160];
    { panel(ORI, '#1d2029', 0.95); rules(ORI, WHITE);
      P.text('ORION  -  THE BELT', 1250, 86, { size: 11, c: WHITE, a: 0.9 });
      const stars = []; for (let i = 0; i < 170; i++) { const x = P.r(ORI.x0 + 8, ORI.x1 - 8), y = P.r(ORI.y0 + 26, 214); stars.push([x, y, P.r(0.35, 1.1)]); }
      P.dots(stars, '#f4ecd6', 0.75);
      // faint milky-way band
      P.stipple([[ORI.x0 + 8, 214], [ORI.x0 + 8, 176], [ORI.x1 - 8, 100], [ORI.x1 - 8, 150]], 260, { r: 0.7, a: 0.4, c: '#e8e0c8' });
      const St = { bet: [1322, 112, 3.4, '#ffb489'], bel: [1446, 116, 2.8, '#dfe8ff'], mei: [1384, 104, 1.6, '#fff'], aln: [ALN[0], ALN[1], 3, '#dfe8ff'], alm: [1386, 147, 3.4, '#fff'], min: [1420, 134, 2.6, '#dfe8ff'], sai: [1338, 204, 2.6, '#dfe8ff'], rig: [1452, 196, 3.8, '#cfe0ff'] };
      const link = (a, b, al = 0.55) => P.line(St[a][0], St[a][1], St[b][0], St[b][1], { w: 0.7, a: al, c: WHITE, passes: 1, over: 0, rough: 0.3 });
      link('bet', 'mei'); link('mei', 'bel'); link('bet', 'aln'); link('bel', 'min'); link('aln', 'alm'); link('alm', 'min'); link('aln', 'sai'); link('min', 'rig');
      P.dashed(1386, 156, 1388, 194, [3, 3], { w: 0.6, a: 0.6, c: WHITE }); [[1388, 166], [1388, 176], [1389, 186]].forEach(([x, y]) => P.dot(x, y, 1, { c: '#fff', a: 0.9 }));
      P.curve([[1446, 116], [1470, 122], [1488, 140], [1490, 164], [1478, 186]], { w: 0.6, a: 0.45, c: WHITE, rough: 0.5, passes: 1 });
      for (const k of Object.keys(St)) { const [x, y, r, c] = St[k]; P.dot(x, y, r * 0.75, { c, a: 0.95 }); P.circle(x, y, r * 1.6, { w: 0.5, a: 0.5, c: WHITE, passes: 1, rough: 0.1 }); for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2; P.line(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5, x + Math.cos(a) * r * 3.6, y + Math.sin(a) * r * 3.6, { w: 0.6, a: 0.7, c, passes: 1, over: 0, rough: 0.1 }); } }
      P.text('BETELGEUSE', 1288, 98, { size: 8, c: WHITE, a: 0.75 }); P.text('RIGEL', 1462, 202, { size: 8, c: WHITE, a: 0.75 }); P.text('ALNITAK', 1298, 176, { size: 9, c: WHITE, a: 0.95 }); P.text('ALNILAM', 1360, 130, { size: 9, c: WHITE, a: 0.95 }); P.text('MINTAKA', 1430, 152, { size: 9, c: WHITE, a: 0.95 });
      // ground plan of the three pyramids, in line with the stars
      P.line(ORI.x0 + 6, 222, ORI.x1 - 6, 222, { w: 0.7, a: 0.7, c: WHITE, passes: 1, over: 0, rough: 0.2 });
      const sqW = (cx, cy, sz) => { P.rect(cx - sz / 2, cy - sz / 2, sz, sz, { w: 1, a: 0.95, c: WHITE, passes: 1, rough: 0.2, over: 0 }); P.line(cx - sz / 2, cy - sz / 2, cx + sz / 2, cy + sz / 2, { w: 0.5, a: 0.7, c: WHITE, passes: 1, over: 0 }); P.line(cx + sz / 2, cy - sz / 2, cx - sz / 2, cy + sz / 2, { w: 0.5, a: 0.7, c: WHITE, passes: 1, over: 0 }); };
      sqW(1352, 258, 34); sqW(1388, 248, 31); sqW(1422, 240, 15);
      [[ALN[0], 258 - 17, ALN[1] + 8], [1386, 248 - 15, 147 + 8], [1420, 240 - 8, 134 + 8]].forEach(([x, y, y2]) => P.dashed(x, y, x, y2, [5, 4], { w: 0.6, a: 0.7, c: WHITE }));
      P.text('KHUFU', 1316, 288, { size: 8, c: WHITE, a: 0.85 }); P.text('KHAFRE', 1372, 288, { size: 8, c: WHITE, a: 0.85 }); P.text('MENKAURE', 1418, 288, { size: 8, c: WHITE, a: 0.85 });
      P.text('PYRAMIDS = BELT STARS', 1246, 236, { size: 8, c: WHITE, a: 0.7 });
    }

    /* ---- 7c. THE FIELD KIT: royal cubit rod, plumb line, set-square, merkhet ---- */
    { panel(KIT, CREAM); rules(KIT);
      const cy = 372;
      // royal cubit: 28 digits, 7 palms
      P.wash([[70, cy - 7], [336, cy - 7], [336, cy + 7], [70, cy + 7]], '#c8a565', 0.85, { edge: 0, jit: 0.3, steps: 2 });
      P.rect(70, cy - 7, 266, 14, { w: 1.2, a: 0.9, passes: 1, rough: 0.2 });
      P.ruler(70, cy + 7, 336, cy + 7, 266 / 28, 4, { len: -7, side: 1, a: 0.85 }); P.ruler(70, cy - 7, 336, cy - 7, 266 / 7, 1, { len: 6, side: -1, a: 0.85 });
      for (let k = 0; k < 7; k++) P.text(String(k + 1), 70 + k * 38 + 15, cy + 3, { size: 8, a: 0.75 });
      P.text('ROYAL CUBIT  -  52.4 CM  -  28 DIGITS', 72, 394, { size: 10, a: 0.9 });
      // plumb line hanging from a crossbar (A-frame)
      P.pl([[84, 430], [98, 402], [112, 430]], { w: 1.1, a: 0.9 }); P.line(90, 416, 106, 416, { w: 0.8, a: 0.8, passes: 1, over: 0 }); P.line(98, 402, 98, 420, { w: 0.6, a: 0.85, passes: 1, over: 0 });
      P.poly([[95, 420], [101, 420], [98, 430]], { w: 0.9, a: 0.9, passes: 1, over: 0 }); P.wash([[95, 420], [101, 420], [98, 430]], INK, 0.7, { edge: 0, steps: 2, jit: 0.1 });
      P.text('PLUMB', 116, 432, { size: 9, a: 0.85 });
      // set-square with 3-4-5 knots
      P.poly([[168, 432], [168, 400], [222, 432]], { w: 1.3, a: 0.9, rough: 0.2, passes: 1 }); P.poly([[174, 427], [174, 411], [200, 427]], { w: 0.7, a: 0.7, rough: 0.15, passes: 1, over: 0 });
      P.hatch([[168, 432], [168, 400], [222, 432], [200, 427], [174, 411], [174, 427]], { ang: 60, gap: 3, a: 0.4, w: 0.4 });
      P.text('3 : 4 : 5', 172, 441, { size: 8, a: 0.8 });
      // merkhet: palm-rib sight + plumb, used to line up stars
      P.line(250, 434, 262, 398, { w: 1.6, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.line(258, 398, 272, 404, { w: 1.2, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.circle(266, 402, 2.4, { w: 0.8, passes: 1 });
      P.line(272, 404, 276, 426, { w: 0.5, a: 0.8, passes: 1, over: 0 }); P.dot(276, 428, 2, { c: INK, a: 0.85 });
      P.text('MERKHET', 282, 420, { size: 9, a: 0.9 }); P.text('SIGHT ON', 286, 432, { size: 8, a: 0.75 });
    }

    /* ---- 7d. RED SIGHT-LINE from the King's Chamber to Alnitak, with ticks and angle scale ---- */
    { const KC = pj([0, 43, 0]), T2 = ALN, ang = Math.atan2(T2[1] - KC[1], T2[0] - KC[0]), L = Math.hypot(T2[0] - KC[0], T2[1] - KC[1]);
      const pt = f => [KC[0] + (T2[0] - KC[0]) * f, KC[1] + (T2[1] - KC[1]) * f];
      const c1 = pt(0.2), c2 = pt(0.965);
      // ghost of the chamber inside the stone (dashed red box)
      const bx = [pj([-5.3, 40, -3]), pj([5.3, 40, -3]), pj([5.3, 46, -3]), pj([-5.3, 46, -3])].map(v => [v[0], v[1]]); P.poly(bx, { w: 1.3, a: 0.9, c: RED, passes: 1, over: 0, rough: 0.2 });
      P.dashed(KC[0], KC[1], c1[0], c1[1], [7, 5], { w: 1.8, a: 0.95, c: RED });
      P.line(c1[0], c1[1], c2[0], c2[1], { w: 2.2, a: 0.97, c: RED, passes: 2, rough: 0.35, over: 0 });
      P.line(c1[0] - 1.4, c1[1] - 1.4, c2[0] - 1.4, c2[1] - 1.4, { w: 0.7, a: 0.6, c: WHITE, passes: 1, over: 0, rough: 0.2 });
      P.ruler(c1[0], c1[1], c2[0], c2[1], 22, 5, { c: RED, len: 6, side: -1, a: 0.9 });
      for (let k = 1; k < 3; k++) P.circle(T2[0], T2[1], 9 + k * 5, { w: 1.1, a: 0.95, c: RED, passes: 1, rough: 0.3 });
      const ah = 11; for (const s2 of [-1, 1]) P.line(c2[0], c2[1], c2[0] - Math.cos(ang + s2 * 0.4) * ah, c2[1] - Math.sin(ang + s2 * 0.4) * ah, { w: 1.6, a: 0.95, c: RED, passes: 1, over: 0, rough: 0.15 });
      P.dashed(KC[0] - 6, KC[1], KC[0] + 130, KC[1], [8, 4], { w: 0.9, a: 0.85, c: RED });
      P.arcTicks(KC[0], KC[1], 96, ang, 0, Math.PI / 36, 3, { c: RED, len: 6, w: 1, a: 0.95 });
      P.arcTicks(KC[0], KC[1], 106, ang, 0, Math.PI / 12, 1, { c: WHITE, len: 5, w: 0.7, a: 0.85 });
      P.dot(KC[0], KC[1], 3.2, { c: RED, a: 1 }); P.circle(KC[0], KC[1], 7, { w: 1.2, a: 0.95, c: RED, passes: 1 });
      const deg = Math.round(-ang * 180 / Math.PI);
      TW(deg + ' DEG ON THE SHEET  (45 DEG TRUE)', KC[0] + 118, KC[1] - 8, { size: 12, a: 0.95 });
      TW("KING'S CHAMBER", KC[0] - 108, KC[1] + 24, { size: 13 }); P.line(KC[0] - 108, KC[1] + 29, KC[0] - 4, KC[1] + 29, { w: 1.6, a: 0.95, c: RED, passes: 1, over: 0, rough: 0.2 });
      const mid = pt(0.6); TW('SOUTH SHAFT  -  SIGHT LINE TO ALNITAK', mid[0] + 8, mid[1] + 34, { size: 13, rot: ang, a: 0.98 });
    }


    /* ================= 8. BOAT PIT cutaway vignette + storm ropes in the foreground ================= */
    const BOAT = { x0: 486, y0: 846, x1: 818, y1: 938 };
    { panel(BOAT, CREAM); rules(BOAT);
      const sy = 868;
      P.text('BOAT PIT 2  -  THE SOLAR BARQUE', 498, 862, { size: 10, a: 0.9 });
      P.line(492, sy + 2, 812, sy + 2, { w: 1.4, a: 0.9, passes: 1, over: 1 });
      for (let x = 494; x < 810; x += 7) P.line(x, sy + 3, x - 4, sy + 8 + P.r(0, 3), { w: 0.4, a: 0.5, passes: 1, over: 0, rough: 0.2 });
      const pit = [[510, sy + 2], [800, sy + 2], [800, 928], [510, 928]]; P.erase(pit); P.wash(pit, '#c9ab72', 0.5, { edge: 0, jit: 0.3, steps: 2 });
      P.hatch([[510, sy + 2], [518, sy + 2], [518, 928], [510, 928]], { ang: 80, gap: 2, a: 0.6, w: 0.5 }); P.hatch([[792, sy + 2], [800, sy + 2], [800, 928], [792, 928]], { ang: 80, gap: 2, a: 0.6, w: 0.5 });
      P.rect(510, sy + 2, 290, 60, { w: 1.3, a: 0.9, passes: 1, over: 0, rough: 0.25 });
      // limestone roof slabs over the western half
      for (let k = 0; k < 6; k++) { const x = 510 + k * 25, poly = [[x, sy - 6], [x + 25, sy - 6], [x + 25, sy + 2], [x, sy + 2]]; P.wash(poly, '#d9bd86', 0.85, { edge: 0, steps: 2, jit: 0.2 }); P.poly(poly, { w: 0.9, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.line(x + 4, sy - 3, x + 20, sy - 3, { w: 0.9, a: 0.85, c: WHITE, passes: 1, over: 0 }); }
      // hull of the barque: gunwale, keel, planks, papyrus-stem prow and stern
      const gun = S.catmull([[532, 880], [548, 893], [590, 899], [660, 901], [724, 899], [752, 891], [768, 874], [778, 862]], false, 3), keel = S.catmull([[548, 899], [568, 909], [624, 914], [700, 914], [742, 906], [764, 886]], false, 3);
      const hullPoly = gun.concat(keel.slice().reverse()); P.wash(hullPoly, '#b8935a', 0.85, { edge: 0, steps: 2, jit: 0.3 });
      P.path(gun, { w: 1.6, a: 0.95, rough: 0.3 }); P.path(keel, { w: 1.3, a: 0.9, rough: 0.3 });
      for (let k = 1; k < 5; k++) { const pl = gun.map((g, i) => { const kk = keel[Math.min(keel.length - 1, Math.round(i * (keel.length - 1) / (gun.length - 1)))]; return [lerp(g[0], kk[0], k / 5), lerp(g[1], kk[1], k / 5)]; }); P.path(pl.slice(2, pl.length - 2), { w: 0.55, a: 0.7, rough: 0.3 }); }
      P.hatch(hullPoly, { ang: 55, gap: 2.4, a: 0.35, w: 0.4, fade: (x, y) => clamp((y - 890) / 25, 0.15, 0.9), piece: 10 });
      P.curve([[532, 880], [526, 872], [530, 864], [538, 862]], { w: 1.4, a: 0.95, rough: 0.2, passes: 1 }); P.curve([[778, 862], [786, 856], [794, 858], [796, 866]], { w: 1.4, a: 0.95, rough: 0.2, passes: 1 });
      for (let k = 0; k < 9; k++) P.line(548 + k * 26, 900, 548 + k * 26, 913 - Math.abs(k - 4) * 0.8, { w: 0.5, a: 0.55, passes: 1, over: 0, rough: 0.2 });   // rib lashings
      // cabin + poles + steering oars + mooring ropes
      P.poly([[628, 881], [690, 881], [690, 898], [628, 898]], { w: 1.1, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.pl([[624, 881], [659, 869], [694, 881]], { w: 1.1, a: 0.9, over: 0 }); P.wash([[628, 881], [690, 881], [690, 898], [628, 898]], '#efe0b8', 0.7, { edge: 0, steps: 2, jit: 0.2 });
      for (const x of [634, 646, 660, 674, 684]) P.line(x, 881, x, 898, { w: 0.5, a: 0.7, passes: 1, over: 0 });
      P.line(546, 888, 520, 918, { w: 1.8, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.line(552, 890, 528, 924, { w: 1.4, a: 0.8, passes: 1, over: 0, rough: 0.2 });
      P.curve([[770, 872], [780, 882], [790, 890]], { w: 0.7, a: 0.8, rough: 0.4, passes: 1 });
      P.text('CEDAR  43.6 M  1224 PIECES', 590, 926, { size: 9, a: 0.9 }); P.ruler(660, 934, 780, 934, 12, 5, { len: 4, a: 0.7 }); P.text('10 M', 785, 936, { size: 8, a: 0.7 });
    }
    // sandstorm ropes: blue ballpoint scalloped tubes hugging the base of the whole scene, overlapping puffs at the corners
    stormTube([[1548, 918], [1440, 906], [1330, 924], [1230, 910], [1130, 928], [1010, 914]], 12, 6, { fillA: 0.55 });
    stormTube([[60, 900], [140, 888], [240, 906], [340, 890], [430, 908]], 6, 13, { fillA: 0.55 });
    [[150, 918, 250, 92], [340, 928, 150, 56], [1470, 924, 210, 74]].forEach(([cx, cy, w, h]) => { const i0 = P.ops.length, out = P.cloud(cx, cy, w, h, { c: BLUE, w: 1.15, a: 0.92, hi: WHITE, lobes: 13, inner: 4, gap: 3.4 }); fillUnder(i0, out, '#e4c790', 0.55); });

    /* ================= 9. NOTES (hand-lettered, small single-stroke caps) ================= */
    /* cream label tags for notes on the busy hero, white pen notes on the dark sky */
    const tag = (str, x, y, tx, ty, o = {}) => { const sz = o.size ?? 13, w = P.measure(str, sz) + 14, poly = [[x - 6, y - sz - 2], [x + w - 6, y - sz - 2], [x + w - 6, y + 6], [x - 6, y + 6]];
      P.erase(poly); P.wash(poly, CREAM, 0.94, { edge: 0, jit: 0.3, steps: 3 }); P.rect(x - 6, y - sz - 2, w, sz + 8, { w: 0.9, a: 0.85, passes: 1, over: 0, rough: 0.2 });
      P.text(str, x, y, { size: sz, a: 0.92 }); const sx = o.from === 'end' ? x + w - 6 : x - 6, sy = y - sz * 0.3;
      P.curve([[sx, sy], [lerp(sx, tx, 0.5) + P.r(-5, 5), lerp(sy, ty, 0.5) + P.r(-5, 5)], [tx, ty]], { w: 0.8, a: 0.85, rough: 0.5, passes: 1, c: INK }); const an = Math.atan2(ty - sy, tx - sx); for (const s2 of [-1, 1]) P.line(tx, ty, tx - Math.cos(an + s2 * 0.4) * 7, ty - Math.sin(an + s2 * 0.4) * 7, { w: 0.9, a: 0.9, passes: 1, over: 0, rough: 0.2 }); };
    noteW('APEX  146.6 M', 742, 356, 698, 372, { size: 15 });
    TW('SHEAR-LEG GANTRY', 1178, 640, { size: 14, rot: -1.83 });
    noteW('SLEDGE CREW  -  WET SAND HALVES THE DRAG', 640, 808, 906, 848, { size: 13, from: 'end' });
    noteW('KHAFRE  143.5 M', 1216, 604, 1180, 640, { size: 14 });
    noteW('MENKAURE  65 M', 1400, 736, 1380, 762, { size: 14 });
    tag('CORNER ARRIS  51 DEG 50 MIN', 112, 790, 470, 776, { size: 13, from: 'end' });
    tag('COURSE 1.4 M AT THE FOOT', 112, 826, 300, 800, { size: 12, from: 'end' });
    tag('TIMBER RAMP 1 : 4', 96, 620, 150, 652, { size: 12 });
    TW('SAND-STORM FRONT', 1020, 906, { size: 13, c: '#dfe8ff' });
    noteW('GREAT SPHINX  73 M', 1226, 748, 1262, 772, { size: 13 });
    noteW("WORKERS' VILLAGE", 1408, 792, 1440, 822, { size: 12 });
    // sun-path labels along the arcs, right-hand column
    [['SUMMER SOLSTICE  JUN 21', 0, 1262], ['EQUINOX  MAR - SEP', 1, 1290], ['WINTER SOLSTICE  DEC 21', 2, 1318]].forEach(([str, i, x]) => {
      const r = sunR[i], dx = x - SCX, y = SCY - Math.sqrt(r * r - dx * dx), sl = Math.atan2(dx, Math.sqrt(r * r - dx * dx));
      TW(str, x, y - 8, { size: 12, rot: sl, a: 0.95 }); });

    /* ================= 10. HIEROGLYPH-STYLE PICTOGRAM BORDER + SIGNATURE ================= */
    P.erase([[0, 0], [1600, 0], [1600, 58], [0, 58]]); P.erase([[0, 942], [1600, 942], [1600, 1000], [0, 1000]]); P.erase([[0, 0], [58, 0], [58, 1000], [0, 1000]]); P.erase([[1542, 0], [1600, 0], [1600, 1000], [1542, 1000]]);
    P.rect(22, 22, 1556, 956, { w: 1.7, a: 0.9, rough: 0.35, over: 2, passes: 1 });
    P.rect(58, 58, 1484, 884, { w: 1.4, a: 0.9, rough: 0.3, over: 2, passes: 1 });
    P.rect(62, 62, 1476, 876, { w: 0.5, a: 0.55, rough: 0.25, over: 1, passes: 1 });
    P.ruler(64, 60, 1536, 60, 12, 5, { len: 4, side: -1, a: 0.7 }); P.ruler(64, 940, 1536, 940, 12, 5, { len: 4, side: 1, a: 0.7 });
    const G_ = {
      eye: [['c', [[-1, 0], [-0.5, -0.5], [0.2, -0.6], [0.9, 0]]], ['c', [[-1, 0], [-0.4, 0.35], [0.3, 0.4], [0.9, 0]]], ['o', 0.05, -0.02, 0.27], ['d', 0.05, -0.02], ['c', [[-0.9, -0.85], [-0.2, -1], [0.8, -0.8]]], ['c', [[0.2, 0.4], [0.35, 0.85], [0.7, 1]]], ['c', [[-0.2, 0.38], [-0.3, 0.7], [-0.7, 0.75]]]],
      bird: [['c', [[-0.9, 0.4], [-0.6, -0.1], [0.1, -0.35], [0.7, -0.1], [0.9, 0.4], [0.2, 0.55], [-0.9, 0.4]]], ['o', 0.75, -0.45, 0.22], ['p', [[0.96, -0.45], [1.18, -0.36]]], ['p', [[-0.1, 0.55], [-0.1, 1]]], ['p', [[0.3, 0.55], [0.3, 1]]], ['p', [[-0.9, 0.4], [-1.1, 0.05]]], ['d', 0.8, -0.5]],
      wave: [['p', [[-1, -0.6], [-0.6, -0.8], [-0.2, -0.6], [0.2, -0.8], [0.6, -0.6], [1, -0.8]]], ['p', [[-1, 0], [-0.6, -0.2], [-0.2, 0], [0.2, -0.2], [0.6, 0], [1, -0.2]]], ['p', [[-1, 0.6], [-0.6, 0.4], [-0.2, 0.6], [0.2, 0.4], [0.6, 0.6], [1, 0.4]]]],
      ankh: [['o', 0, -0.52, 0.4], ['p', [[0, -0.12], [0, 1]]], ['p', [[-0.62, 0.22], [0.62, 0.22]]]],
      sun: [['o', 0, 0, 0.42], ['d', 0, 0], ['p', [[0, -0.62], [0, -1]]], ['p', [[0, 0.62], [0, 1]]], ['p', [[-0.62, 0], [-1, 0]]], ['p', [[0.62, 0], [1, 0]]], ['p', [[-0.44, -0.44], [-0.72, -0.72]]], ['p', [[0.44, -0.44], [0.72, -0.72]]], ['p', [[-0.44, 0.44], [-0.72, 0.72]]], ['p', [[0.44, 0.44], [0.72, 0.72]]]],
      reed: [['c', [[0, 1], [-0.1, 0.2], [0.1, -0.5], [0, -1]]], ['c', [[0, 1], [0.2, 0.3], [0.32, -0.3], [0.24, -0.8]]], ['c', [[0, 1], [-0.3, 0.4], [-0.4, -0.1], [-0.3, -0.6]]]],
      star: [['p', [[0, -1], [0.24, -0.3], [0.95, -0.3], [0.38, 0.12], [0.6, 0.85], [0, 0.42], [-0.6, 0.85], [-0.38, 0.12], [-0.95, -0.3], [-0.24, -0.3], [0, -1]]]],
      djed: [['p', [[0, -1], [0, 1]]], ['p', [[-0.5, -0.75], [0.5, -0.75]]], ['p', [[-0.42, -0.45], [0.42, -0.45]]], ['p', [[-0.34, -0.15], [0.34, -0.15]]], ['p', [[-0.6, 0.85], [0.6, 0.85]]], ['c', [[-0.55, -0.98], [0, -1.15], [0.55, -0.98]]]],
      snake: [['c', [[-1, 0.5], [-0.6, -0.2], [-0.1, 0.4], [0.4, -0.3], [0.9, 0.1]]], ['o', 0.95, 0.05, 0.13], ['p', [[1.08, 0.05], [1.3, 0.1]]]],
      feather: [['c', [[0, -1], [0.45, -0.3], [0.35, 0.6], [0, 1]]], ['c', [[0, -1], [-0.45, -0.3], [-0.35, 0.6], [0, 1]]], ['p', [[0, -1], [0, 1]]], ['p', [[0, -0.4], [0.35, -0.1]]], ['p', [[0, 0.1], [0.32, 0.4]]], ['p', [[0, -0.4], [-0.35, -0.1]]], ['p', [[0, 0.1], [-0.32, 0.4]]]],
      pyr: [['p', [[-1, 0.85], [0, -0.6], [1, 0.85], [-1, 0.85]]], ['o', 0, -0.9, 0.18], ['p', [[-0.5, 0.15], [0.5, 0.15]]], ['p', [[-0.75, 0.5], [0.75, 0.5]]]],
      was: [['p', [[0, -0.6], [0, 1]]], ['c', [[-0.45, -1], [0, -0.85], [0.3, -0.6], [0, -0.5]]], ['p', [[-0.35, 1], [0, 0.75], [0.35, 1]]]],
      owl: [['c', [[-0.7, 0.9], [-0.7, -0.1], [-0.4, -0.7], [0, -0.85], [0.4, -0.7], [0.7, -0.1], [0.7, 0.9]]], ['o', -0.28, -0.3, 0.17], ['o', 0.28, -0.3, 0.17], ['p', [[0, -0.15], [0.08, 0.05], [-0.08, 0.05], [0, -0.15]]], ['p', [[-0.3, 0.3], [0.3, 0.3]]], ['p', [[-0.3, 0.55], [0.3, 0.55]]]],
      lotus: [['c', [[0, 0.9], [-0.4, 0.3], [-0.2, -0.6], [0, -0.9]]], ['c', [[0, 0.9], [0.4, 0.3], [0.2, -0.6], [0, -0.9]]], ['c', [[0, 0.9], [-0.9, 0.4], [-0.95, -0.2], [-0.65, -0.45]]], ['c', [[0, 0.9], [0.9, 0.4], [0.95, -0.2], [0.65, -0.45]]]],
      house: [['p', [[-0.9, 0.8], [-0.9, -0.5], [0.9, -0.5], [0.9, 0.8], [-0.9, 0.8]]], ['p', [[-0.5, 0.8], [-0.5, 0.1], [0.5, 0.1], [0.5, 0.8]]], ['p', [[-1, -0.5], [0, -0.95], [1, -0.5]]]]
    };
    const GK = Object.keys(G_);
    const glyph = (k, cx, cy, s, o = {}) => {
      const T = (u, v) => [cx + u * s, cy + v * s];
      for (const st of G_[k]) {
        if (st[0] === 'c') P.curve(st[1].map(q => T(q[0], q[1])), { w: 0.95, a: 0.88, rough: 0.35, passes: 1, c: o.c });
        else if (st[0] === 'p') P.pl(st[1].map(q => T(q[0], q[1])), { w: 0.95, a: 0.88, rough: 0.3, passes: 1, over: 0, c: o.c });
        else if (st[0] === 'o') { const q = T(st[1], st[2]); P.circle(q[0], q[1], st[3] * s, { w: 0.9, a: 0.88, passes: 1, rough: 0.25, c: o.c }); }
        else { const q = T(st[1], st[2]); P.dot(q[0], q[1], s * 0.11, { c: o.c || INK, a: 0.9 }); }
      }
    };
    { let last = -1; const pickG = () => { let k; do { k = Math.floor(P.r(GK.length)); } while (k === last); last = k; return GK[k]; };
      const S0 = 8.6, stepG = 33;
      for (let x = 78, i = 0; x < 1530; x += stepG, i++) { glyph(pickG(), x, 40, S0); if (!(x > 1340)) glyph(pickG(), x, 960, S0); else if (x < 1345) glyph(pickG(), x, 960, S0); }
      for (let y = 100, i = 0; y < 910; y += stepG, i++) { glyph(pickG(), 40, y, S0); glyph(pickG(), 1560, y, S0); }
      // corner cartouches
      for (const [x, y] of [[40, 40], [1560, 40], [40, 960], [1560, 960]]) { P.circle(x, y, 13.5, { w: 1.2, a: 0.9, passes: 1, rough: 0.25 }); glyph('sun', x, y, 7.5); }
      // little rope-knot separators every 8 cells
      for (let x = 78 + stepG * 4; x < 1500; x += stepG * 8) { P.line(x + 16, 30, x + 16, 50, { w: 0.7, a: 0.7, passes: 1, over: 0 }); }
    }
    P.text('SHEET 6/6 \u2013 GIZA', 1528, 966, { size: 11, align: 'right', a: 0.9 });

  }
});
