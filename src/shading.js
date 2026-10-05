/* Shading techniques (experiment): engraving, tone-targeted hatching, variable-density flow lines, weighted Voronoi
   stippling, one-line TSP drawings, scumbling, wood engraving, woodcut, mezzotint, aquatint, drypoint and ink bleed.
   Everything is added to Sketch.Page, so a scene calls P.engrave(...), P.woodcut(...) and so on.

   `tone` is everywhere either a number 0..1 (0 = paper, 1 = solid ink) or a function (x, y) => 0..1, so one call can
   shade a whole gradient: Sketch.ballTone(cx, cy, r) is the tone of a ball lit from the upper left.

   Load after engine.js. Records ops on the page only. */
(function (g) {
  'use strict';
  const S = g.Sketch, Pg = S.Page.prototype, TAU = Math.PI * 2, pip = S.pip, lerp = S.lerp;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const toneOf = t => typeof t === 'function' ? t : () => t;
  const bbox = poly => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; };
  const area = poly => { let a = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a) / 2; };
  const hash2 = (x, y, s = 0) => { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 144665)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const vnoise = (x, y, s = 0) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return lerp(lerp(hash2(xi, yi, s), hash2(xi + 1, yi, s), u), lerp(hash2(xi, yi + 1, s), hash2(xi + 1, yi + 1, s), u), v); };
  // where a scanline at height y (in coordinates rotated by `ang`) crosses the polygon: pairs of x
  const spans = (q, y) => { const xs = []; for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); } xs.sort((m, n) => m - n); const out = []; for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]); return out; };
  const W = cov => cov / 1.36;   // a stroke of width w covers 1.36 w (the player draws half-width 0.68 w)

  /* ---------------- 1. engraving: swelling lines ----------------
     Parallel lines whose width follows the tone under them: they swell in the darks, thin to a hair and break off in
     the lights, so one set of lines carries a whole gradient (the copper engraver's line, and the banknote portrait).
     Past o.crossFrom (0.6) a second set crosses at o.cross degrees (28) and forms the engraver's lozenge net.
     o: ang (deg), gap, c, a, cross (deg, or false), crossFrom, wave: [amplitude, wavelength] for halftone lines that
     wave, minW (lines thinner than this break off). Lines sit on a shared grid, so neighbouring shapes join up. */
  Pg.engrave = function (poly, tone, o = {}) {
    const T = toneOf(tone), gap = o.gap ?? 3.2, c = o.c || this.ink, al = o.a ?? 0.96, minW = o.minW ?? 0.16, from = o.crossFrom ?? 0.6;
    const layer = (angD, cov, seed) => {
      const ang = angD * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang), q = poly.map(([x, y]) => [x * ca + y * sa, -x * sa + y * ca]);
      let y0 = 1e9, y1 = -1e9; for (const p of q) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
      const [wa, wl] = o.wave || [0, 1];
      for (let k = Math.ceil(y0 / gap); k * gap < y1; k++) {
        const yl = k * gap, ph = hash2(k, seed) * TAU;
        for (const [xa, xb] of spans(q, yl)) {
          let run = [];
          const flush = () => { if (run.length > 1) this.push({ k: 's', p: run, c, a: al }); run = []; };
          const n = Math.max(1, Math.ceil((xb - xa) / 1.4));
          for (let i = 0; i <= n; i++) {
            const xr = xa + (xb - xa) * i / n, yr = yl + (wa ? wa * Math.sin(xr / wl * TAU + ph) : 0);
            const x = xr * ca - yr * sa, y = xr * sa + yr * ca, endT = Math.min(1, Math.min(xr - xa, xb - xr) / 2.5 + 0.35);
            const w = W(cov(x, y)) * gap * endT;
            if (w < minW) { flush(); continue; }
            run.push([x, y, Math.min(w, gap * 0.8)]);
          }
          flush();
        }
      }
    };
    const a0 = o.ang ?? -40;
    if (o.cross === false) layer(a0, T, 1);
    else { layer(a0, (x, y) => Math.min(T(x, y), from), 1); layer(a0 + (o.cross ?? 28), (x, y) => { const t = T(x, y); return t > from ? (t - from) / (1 - from) * 0.8 : 0; }, 2); }
    return this;
  };

  /* ---------------- 2. tone-targeted hatching (prioritised stroke textures) ----------------
     Ask for a darkness, not a spacing: P.tone(shape, 0.4). Layers are added by priority (one direction, then a cross,
     then two diagonals) until the coverage reaches the tone. With a tone function each layer is kept only where the
     tone asks for it, and its strokes break into flicks across the threshold, the way an illustrator grades a tone.
     o: ang, w, c, a, rough, layers (max 4) */
  Pg.tone = function (poly, tone, o = {}) {
    const T = toneOf(tone), w = o.w ?? 0.6, ang = o.ang ?? -50, maxL = o.layers ?? 4, angs = [ang, ang + 90, ang + 45, ang - 45];
    if (typeof tone === 'number') {
      if (tone <= 0.02) return this;
      const n = Math.min(maxL, tone < 0.3 ? 1 : tone < 0.55 ? 2 : tone < 0.78 ? 3 : 4), cov = 1 - Math.pow(1 - tone, 1 / n), gap = 1.36 * w / cov;
      for (let k = 0; k < n; k++) this.hatch(poly, { ang: angs[k], gap, w, c: o.c, a: o.a ?? 0.92, ragged: 0.3, jit: 0.1, rough: o.rough ?? 0.35, inset: 0.5 });
      return this;
    }
    const th = [0.04, 0.32, 0.55, 0.76], cov = 0.3;
    for (let k = 0; k < maxL; k++) this.hatch(poly, { ang: angs[k], gap: 1.36 * w / cov, w, c: o.c, a: o.a ?? 0.92, ragged: 0.3, rough: o.rough ?? 0.35, inset: 0.5, piece: 7,
      fade: (x, y) => sstep(th[k], th[k] + 0.14, T(x, y)) });
    return this;
  };

  /* ---------------- 3. flow lines with variable density ----------------
     Evenly spaced streamlines (Jobard & Lefer) whose spacing follows the tone: they crowd in the darks and open out in
     the lights without breaking, and thicken a little where they crowd. field as for P.flow: 'contour', 'radial',
     degrees, or (x, y) => radians. o: gapMin, gapMax, w, c, a */
  Pg.flowTone = function (poly, tone, o = {}) {
    const T = toneOf(tone), gMin = o.gapMin ?? 1.8, gMax = o.gapMax ?? 16, [x0, y0, x1, y1] = bbox(poly), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const f = o.field ?? 'contour', field = typeof f === 'function' ? f : typeof f === 'number' ? () => f * Math.PI / 180 : f === 'radial' ? (x, y) => Math.atan2(y - cy, x - cx) : (x, y) => Math.atan2(y - cy, x - cx) + Math.PI / 2;
    const sep = (x, y) => { const t = T(x, y); return t < 0.03 ? 1e9 : gMin + (gMax - gMin) * Math.pow(1 - t, 1.6); };
    const CS = gMin * 2, G = new Map(), key = (x, y) => Math.floor(x / CS) + ',' + Math.floor(y / CS);
    const add = (x, y) => { const k = key(x, y); (G.get(k) || G.set(k, []).get(k)).push([x, y]); };
    const near = (x, y, d) => { const r = Math.ceil(d / CS), gx = Math.floor(x / CS), gy = Math.floor(y / CS); for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) { const a = G.get((gx + i) + ',' + (gy + j)); if (a) for (const q of a) if ((q[0] - x) ** 2 + (q[1] - y) ** 2 < d * d) return true; } return false; };
    return this.isolate('flowTone', () => {
      const seeds = []; for (let y = y0; y < y1; y += gMin * 1.5) for (let x = x0; x < x1; x += gMin * 1.5) seeds.push([x + this.r(-1, 1), y + this.r(-1, 1)]);
      for (let i = seeds.length - 1; i > 0; i--) { const j = Math.floor(this.R() * (i + 1)); [seeds[i], seeds[j]] = [seeds[j], seeds[i]]; }
      seeds.sort((a, b) => T(b[0], b[1]) - T(a[0], a[1]));     // darkest first: they claim their dense spacing
      for (const [sx, sy] of seeds) {
        if (!pip(poly, sx, sy)) continue; const d0 = sep(sx, sy); if (d0 > 1e8 || near(sx, sy, d0)) continue;
        const trace = sg => { const out = []; let x = sx, y = sy, prev = null; for (let k = 0; k < 600; k++) { const a = field(x, y); let dx = Math.cos(a), dy = Math.sin(a); if (prev && dx * prev[0] + dy * prev[1] < 0) { dx = -dx; dy = -dy; } prev = [dx, dy]; x += dx * gMin * 0.5 * sg; y += dy * gMin * 0.5 * sg; const d = sep(x, y); if (d > 1e8 || !pip(poly, x, y) || near(x, y, d * 0.55)) break; out.push([x, y]); } return out; };
        const line = trace(-1).reverse().concat([[sx, sy]], trace(1)); if (line.length < 4) continue;
        line.forEach(q => add(q[0], q[1]));
        const n = line.length; this.push({ k: 's', c: o.c || this.ink, a: o.a ?? 0.9, p: line.map((q, i) => { const e = Math.min(1, Math.min(i, n - 1 - i) / 4 + 0.3); return [q[0], q[1], (o.w ?? 0.5) * (0.7 + 0.8 * T(q[0], q[1])) * e]; }) });
      }
      return this;
    }, true);
  };

  /* ---------------- 4. weighted Voronoi stippling (Secord) ----------------
     n dots placed by tone, then relaxed with Lloyd's algorithm so every dot sits at the centre of its patch: evenly
     spaced yet following the tone. Returns the points (for P.tsp).
     o: iters (8), r (dot radius, or (t) => radius), gamma, c, a, draw (false to only compute) */
  Pg.stippleW = function (poly, tone, n, o = {}) {
    const T = toneOf(tone), [x0, y0, x1, y1] = bbox(poly), A = area(poly), cell = o.cell ?? Math.max(0.45, Math.sqrt(A / n) / 6), sp = Math.sqrt(A / n) * 1.5, gm = o.gamma ?? 1;
    const pts = [];
    return this.isolate('stippleW', () => {
      for (let t = 0; t < n * 60 && pts.length < n; t++) { const x = this.r(x0, x1), y = this.r(y0, y1); if (pip(poly, x, y) && this.R() < Math.pow(T(x, y), gm)) pts.push([x, y]); }
      const cells = []; for (let y = y0 + cell / 2; y < y1; y += cell) for (let x = x0 + cell / 2; x < x1; x += cell) if (pip(poly, x, y)) { const w = Math.pow(T(x, y), gm); if (w > 0.002) cells.push([x, y, w]); }
      // Lloyd relaxation on a grid of weighted cells. Points live in a bucket grid stored as typed arrays (head/next
      // linked lists), and each cell searches outward ring by ring until no closer point can exist.
      const gx0 = x0 - sp, gy0 = y0 - sp, GW = Math.ceil((x1 - x0) / sp) + 3, GH = Math.ceil((y1 - y0) / sp) + 3, head = new Int32Array(GW * GH), next = new Int32Array(pts.length);
      const cx = new Float64Array(cells.length), cy = new Float64Array(cells.length), cw = new Float64Array(cells.length); cells.forEach(([x, y, w], k) => { cx[k] = x; cy[k] = y; cw[k] = w; });
      const px = new Float64Array(pts.length), py = new Float64Array(pts.length); pts.forEach((p, i) => { px[i] = p[0]; py[i] = p[1]; });
      const sx = new Float64Array(pts.length), sy = new Float64Array(pts.length), sw = new Float64Array(pts.length);
      for (let it = 0; it < (o.iters ?? 14); it++) {
        head.fill(-1); for (let i = 0; i < pts.length; i++) { const b = Math.min(GH - 1, Math.max(0, Math.floor((py[i] - gy0) / sp))) * GW + Math.min(GW - 1, Math.max(0, Math.floor((px[i] - gx0) / sp))); next[i] = head[b]; head[b] = i; }
        sx.fill(0); sy.fill(0); sw.fill(0);
        for (let k = 0; k < cells.length; k++) { const x = cx[k], y = cy[k], bx = Math.floor((x - gx0) / sp), by = Math.floor((y - gy0) / sp); let best = -1, bd = 1e18;
          for (let r = 0; r < 6; r++) { if (best >= 0 && (r - 1) * sp > Math.sqrt(bd)) break;
            for (let j = by - r; j <= by + r; j++) { if (j < 0 || j >= GH) continue; const edge = j === by - r || j === by + r;
              for (let i = bx - r; i <= bx + r; i += edge ? 1 : 2 * r || 1) { if (i < 0 || i >= GW) continue; for (let q = head[j * GW + i]; q >= 0; q = next[q]) { const d = (px[q] - x) ** 2 + (py[q] - y) ** 2; if (d < bd) { bd = d; best = q; } } } } }
          if (best >= 0) { sx[best] += x * cw[k]; sy[best] += y * cw[k]; sw[best] += cw[k]; } }
        for (let i = 0; i < pts.length; i++) if (sw[i] > 0) { px[i] = sx[i] / sw[i]; py[i] = sy[i] / sw[i]; }
      }
      pts.forEach((p, i) => { p[0] = px[i]; p[1] = py[i]; });
      if (o.draw !== false) { const r0 = o.r ?? 0.85, rf = typeof o.r === 'function' ? o.r : t => r0 * (0.55 + 0.45 * t); this.dots(pts.map(([x, y]) => [x, y, rf(T(x, y))]), o.c, o.a ?? 0.95); }
      return pts;
    }, true);
  };

  /* ---------------- 5. TSP art: the whole tone as one unbroken line ----------------
     Join points (from P.stippleW) into a single path that never lifts: a nearest-neighbour tour, then 2-opt to
     untangle it. Made for pen plotters. o: w, c, a, passes (2-opt rounds) */
  Pg.tsp = function (pts, o = {}) {
    const n = pts.length; if (n < 3) return this;
    const bb = bbox(pts), sp = Math.sqrt((bb[2] - bb[0]) * (bb[3] - bb[1]) / n) * 1.5 || 4, G = new Map(), key = (x, y) => Math.floor(x / sp) + ',' + Math.floor(y / sp);
    pts.forEach((p, i) => { const k = key(p[0], p[1]); (G.get(k) || G.set(k, []).get(k)).push(i); });
    const used = new Uint8Array(n), tour = [0]; used[0] = 1;
    for (let s = 1; s < n; s++) { const [x, y] = pts[tour[s - 1]], gx = Math.floor(x / sp), gy = Math.floor(y / sp); let best = -1, bd = 1e18;
      for (let r = 0; best < 0 && r < 200; r++) for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) { if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue; const a = G.get((gx + i) + ',' + (gy + j)); if (a) for (const k of a) if (!used[k]) { const d = (pts[k][0] - x) ** 2 + (pts[k][1] - y) ** 2; if (d < bd) { bd = d; best = k; } } }
      if (best < 0) for (let k = 0; k < n; k++) if (!used[k]) { best = k; break; }
      used[best] = 1; tour.push(best); }
    const D = (a, b) => Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]);
    for (let pass = 0; pass < (o.passes ?? 4); pass++) { let better = false;
      for (let i = 0; i < n - 3; i++) for (let j = i + 2; j < Math.min(n - 1, i + 60); j++) { const a = tour[i], b = tour[i + 1], c = tour[j], d = tour[j + 1];
        if (D(a, c) + D(b, d) < D(a, b) + D(c, d) - 1e-6) { for (let l = i + 1, r = j; l < r; l++, r--) { const t = tour[l]; tour[l] = tour[r]; tour[r] = t; } better = true; } }
      if (!better) break; }
    this.push({ k: 's', c: o.c || this.ink, a: o.a ?? 0.92, p: tour.map(i => [pts[i][0], pts[i][1], o.w ?? 0.55]) });
    return this;
  };

  /* ---------------- 6. scumbling: tone from small overlapping circles ----------------
     o: r (loop radius), w, density, c, a. Layers pile up with the tone. */
  Pg.scumble = function (poly, tone, o = {}) {
    const T = toneOf(tone), [x0, y0, x1, y1] = bbox(poly), r = o.r ?? 2.4, w = o.w ?? 0.45, n = Math.round(area(poly) / (r * r) * (o.density ?? 0.45));
    return this.isolate('scumble', () => {
      for (let i = 0; i < n * 3; i++) { const x = this.r(x0, x1), y = this.r(y0, y1); if (!pip(poly, x, y) || this.R() > Math.pow(T(x, y), 1.6)) continue;
        const rr = r * this.r(0.6, 1.25), a0 = this.r(0, TAU), turns = this.r(1.1, 1.8), pts = [];
        for (let k = 0; k <= 14 * turns; k++) { const a = a0 + k * TAU / 14, e = rr * (0.85 + 0.25 * Math.sin(k * 1.7)); pts.push([x + Math.cos(a) * e + k * 0.12, y + Math.sin(a) * e * 0.85]); }
        this.push({ k: 's', c: o.c || this.ink, a: o.a ?? 0.85, p: pts.map(q => [q[0], q[1], w]) }); }
      return this;
    }, true);
  };

  /* ---------------- 7. wood engraving: white line on black ----------------
     The block prints black; the engraver cuts white lines. Lines widen in the lights and cross into a white grid in
     the brightest parts. Same options as P.engrave, plus paper (the colour that cuts). */
  Pg.woodEngrave = function (poly, tone, o = {}) {
    const T = toneOf(tone);
    this.wash(poly, o.c || this.ink, 1, { edge: 0, jit: 0, steps: 1 });
    return this.engrave(poly, (x, y) => 1 - T(x, y), Object.assign({ gap: 3, crossFrom: 0.55, cross: 90 }, o, { c: o.paper || '#ffffff' }));
  };

  /* ---------------- 8. woodcut / linocut ----------------
     Black block, white gouge marks: V-shaped cuts that taper to a point, following a direction field, long and wide
     in the lights, sparse in the darks; the lightest areas are cleared, leaving a few chatter ridges.
     o: field (degrees or (x, y) => radians), gap, paper */
  Pg.woodcut = function (poly, tone, o = {}) {
    const T = toneOf(tone), gap = o.gap ?? 7, [x0, y0, x1, y1] = bbox(poly), white = o.paper || '#ffffff', ink = o.c || this.ink;
    const f = o.field ?? -20, field = typeof f === 'function' ? f : () => f * Math.PI / 180;
    this.wash(poly, ink, 1, { edge: 0, jit: 0, steps: 1 });
    return this.isolate('woodcut', () => {
      this.clip(poly, () => {
        for (let y = y0 - gap; y < y1 + gap; y += gap * 0.62) for (let x = x0 - gap; x < x1 + gap; x += gap * 0.9) {
          const px = x + this.r(-0.5, 0.5) * gap, py = y + this.r(-0.3, 0.3) * gap; if (!pip(poly, px, py)) continue;
          const l = 1 - T(px, py); if (l < 0.08 || this.R() > l * 1.6) continue;
          const a = field(px, py) + this.r(-0.12, 0.12), ca = Math.cos(a), sa = Math.sin(a);
          if (l > 0.9) { // cleared: a wide scoop, and now and then a ridge the gouge missed
            const len = gap * 2.4, wd = gap * 0.95;
            this.occlude([[px - ca * len / 2 - sa * wd / 2, py - sa * len / 2 + ca * wd / 2], [px + ca * len / 2 - sa * wd / 2, py + sa * len / 2 + ca * wd / 2], [px + ca * len / 2 + sa * wd / 2, py + sa * len / 2 - ca * wd / 2], [px - ca * len / 2 + sa * wd / 2, py - sa * len / 2 - ca * wd / 2]], white);
            if (this.R() < 0.12) this.push({ k: 's', c: ink, a: 1, p: [[px - ca * len * 0.3, py - sa * len * 0.3, 0.5], [px, py, 0.9], [px + ca * len * 0.3, py + sa * len * 0.3, 0.4]] });
            continue; }
          const len = gap * lerp(0.8, 3.2, l) * this.r(0.8, 1.2), wd = gap * lerp(0.18, 0.75, l);
          // a gouge: pointed at both ends, fattest a third of the way in (the cut starts sharp and ends in a flick)
          const pts = []; for (let k = 0; k <= 10; k++) { const u = k / 10, h = wd / 2 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 0.8); pts.push([px + ca * (u - 0.5) * len - sa * h, py + sa * (u - 0.5) * len + ca * h]); }
          for (let k = 10; k >= 0; k--) { const u = k / 10, h = wd / 2 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 0.8); pts.push([px + ca * (u - 0.5) * len + sa * h, py + sa * (u - 0.5) * len - ca * h]); }
          this.occlude(pts, white);
        }
      });
      return this;
    }, true);
  };

  /* ---------------- 9. mezzotint and aquatint: tone as grain ----------------
     Mezzotint: a velvety near-black worked from dark to light, the tone a fine dense grain that thins smoothly.
     Aquatint: flat bitten tones (o.levels steps) with a clumpy, reticulated grain. o: cell (grain size), levels, c */
  const grainFill = function (poly, T, o, clumpy) {
    const cell = o.cell ?? (clumpy ? 1.15 : 1), [x0, y0, x1, y1] = bbox(poly), dots = [], lv = o.levels ?? 4, seed = (o.seed ?? 7) + (clumpy ? 100 : 0);
    for (let y = y0; y < y1; y += cell) for (let x = x0; x < x1; x += cell) {
      if (!pip(poly, x, y)) continue; let t = T(x, y); if (clumpy) t = Math.round(t * lv) / lv;
      const gx = Math.round(x / cell), gy = Math.round(y / cell);
      const nz = clumpy ? 0.55 * vnoise(x / 2.3, y / 2.3, seed) + 0.3 * vnoise(x / 0.9, y / 0.9, seed + 1) + 0.15 * hash2(gx, gy, seed) : 0.65 * hash2(gx, gy, seed) + 0.35 * vnoise(x / 1.6, y / 1.6, seed);
      if (nz < t) dots.push([x + (hash2(gx, gy, seed + 2) - 0.5) * cell * 0.5, y + (hash2(gy, gx, seed + 3) - 0.5) * cell * 0.5, cell * (clumpy ? 0.72 : 0.62)]);
    }
    this.dots(dots, o.c || this.ink, o.a ?? 0.92); return this;
  };
  Pg.mezzotint = function (poly, tone, o = {}) { return grainFill.call(this, poly, toneOf(tone), o, false); };
  Pg.aquatint = function (poly, tone, o = {}) { return grainFill.call(this, poly, toneOf(tone), o, true); };

  /* ---------------- 10. drypoint: a scratched line with a soft burr on one side ----------------
     pts: a polyline. o: w, side (1 / -1), burr (0..1), c */
  Pg.drypoint = function (pts, o = {}) {
    const res = []; for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L)); for (let j = 0; j < k; j++) res.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]); }
    res.push(pts[pts.length - 1]); const side = o.side ?? 1, burr = o.burr ?? 0.7, dots = [];
    this.path(res, { w: o.w ?? 0.7, c: o.c, a: 0.95, rough: 0.15, passes: 1 });
    this.isolate('drypoint', () => { res.forEach((q, i) => { const a = res[Math.max(0, i - 2)], b = res[Math.min(res.length - 1, i + 2)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / l * side, ny = (b[0] - a[0]) / l * side, pr = Math.sin(Math.PI * i / res.length);
      for (let k = 0; k < 2; k++) if (this.R() < burr * (0.4 + 0.6 * pr)) { const d = this.r(0.5, 2.6) * (0.6 + pr); dots.push([q[0] + nx * d, q[1] + ny * d, this.r(0.3, 0.6)]); } }); }, true);
    this.dots(dots, o.c || this.ink, 0.5); return this;
  };

  /* ---------------- 11. ink bleed: hair-fine feathering where ink meets the paper fibres ----------------
     Call after drawing a black shape. o: len (longest hair), density (0..1) */
  Pg.feather = function (poly, o = {}) {
    const len = o.len ?? 2.6, dens = o.density ?? 0.4, c = o.c || this.ink, dots = [];
    return this.isolate('feather', () => {
      let sg = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; sg += p[0] * q[1] - q[0] * p[1]; } sg = sg > 0 ? 1 : -1;
      for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.01) continue; const nx = (b[1] - a[1]) / L * sg, ny = -(b[0] - a[0]) / L * sg;
        for (let s = 0; s < L; s += 1.2) { if (this.R() > dens) continue; const x = a[0] + (b[0] - a[0]) * s / L, y = a[1] + (b[1] - a[1]) * s / L, l = this.r(0.4, 1) * len, tw = this.r(-0.6, 0.6);
          if (this.R() < 0.5) this.push({ k: 's', c, a: 0.75, p: [[x, y, 0.5], [x + (nx + tw * ny) * l * 0.5, y + (ny - tw * nx) * l * 0.5, 0.3], [x + (nx + tw * ny) * l, y + (ny - tw * nx) * l, 0.12]] });
          else dots.push([x + nx * l * 0.5, y + ny * l * 0.5, this.r(0.2, 0.45)]); } }
      if (dots.length) this.dots(dots, c, 0.7); return this;
    }, true);
  };

  /* ---------------- helpers ---------------- */
  // tone of a ball at (cx, cy), radius r, lit from (lx, ly) (unit direction toward the light, screen space)
  S.ballTone = (cx, cy, r, lx = -0.6, ly = -0.7, o = {}) => (x, y) => { const dx = (x - cx) / r, dy = (y - cy) / r, d2 = dx * dx + dy * dy; if (d2 >= 1) return o.outside ?? 0; const nz = Math.sqrt(1 - d2), lz = Math.sqrt(Math.max(0, 1 - lx * lx - ly * ly)), lam = Math.max(0, dx * lx + dy * ly + nz * lz); return clamp((o.base ?? 0.04) + (1 - lam) * (o.k ?? 0.95)); };
})(window);
