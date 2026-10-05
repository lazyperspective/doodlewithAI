/* SketchKit — the toolbox on top of the engine: noise, colour mixing, shapes, polygon clipping, Voronoi cells, jigsaw
   walls, Poisson packing, contour lines, and an ink kit bound to a page (fills, gradients, watercolour with blooms and
   granulation, hatching, stipple, leaves). Load after engine.js. Everything here only records ops on a Sketch.Page. */
(function (g) {
  'use strict';
  const S = g.Sketch, TAU = Math.PI * 2, lerp = S.lerp, L = g.SketchKit = {};
  L.TAU = TAU; L.lerp = lerp;
  /* a stable hash of an integer: the same random number every time, for anything that must not change between redraws */
  L.hash = (i, s = 0) => { let h = Math.imul((i | 0) + 0x9E3779B9, 0x85EBCA6B) ^ Math.imul(s | 0, 0xC2B2AE35); h ^= h >>> 15; h = Math.imul(h, 0x2C1B3C6D); h ^= h >>> 12; return (h >>> 0) / 4294967296; };
  L.rng = seed => { let a = seed | 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const hash = (x, y, s) => { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 144665)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  L.noise = (x, y, s = 0) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return lerp(lerp(hash(xi, yi, s), hash(xi + 1, yi, s), u), lerp(hash(xi, yi + 1, s), hash(xi + 1, yi + 1, s), u), v); };
  L.fbm = (x, y, oct = 4, s = 0) => { let v = 0, amp = 0.5, f = 1, n = 0; for (let i = 0; i < oct; i++) { v += amp * L.noise(x * f, y * f, s + i * 17); n += amp; f *= 2; amp *= 0.5; } return v / n; };
  /* colour */
  const rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const hex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  L.mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => lerp(v, B[i], t))); };
  L.shade = (a, k) => k < 0 ? L.mix(a, '#000000', -k) : L.mix(a, '#ffffff', k);
  /* shapes */
  L.rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  L.ell = (cx, cy, rx, ry, n = 32, rot = 0, a0 = 0, a1 = TAU) => { const out = [], cr = Math.cos(rot), sr = Math.sin(rot), full = Math.abs(a1 - a0 - TAU) < 1e-9; for (let i = 0; i < (full ? n : n + 1); i++) { const a = a0 + (a1 - a0) * i / n, x = Math.cos(a) * rx, y = Math.sin(a) * ry; out.push([cx + x * cr - y * sr, cy + x * sr + y * cr]); } return out; };
  L.rot = (pts, cx, cy, th) => { const c = Math.cos(th), s = Math.sin(th); return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };
  L.move = (pts, dx, dy, k = 1) => pts.map(([x, y]) => [dx + x * k, dy + y * k]);
  L.blob = (cx, cy, r, n, jit, R, sq = 1) => Array.from({ length: n }, (_, i) => { const a = i * TAU / n, rr = r * (1 + (R() - 0.5) * 2 * jit); return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sq]; });
  L.bbox = pts => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pts.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }); return [x0, y0, x1, y1]; };
  L.area = poly => { let a = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
  L.centroid = poly => { let x = 0, y = 0; poly.forEach(p => { x += p[0]; y += p[1]; }); return [x / poly.length, y / poly.length]; };
  L.pip = S.pip;
  L.ribbon = (pts, w0, w1 = w0) => { const Lf = [], Rt = [], n = pts.length; pts.forEach((p, i) => { const q = pts[Math.min(n - 1, i + 1)], o = pts[Math.max(0, i - 1)], tx = q[0] - o[0], ty = q[1] - o[1], l = Math.hypot(tx, ty) || 1, w = lerp(w0, w1, n > 1 ? i / (n - 1) : 0); Lf.push([p[0] - ty / l * w, p[1] + tx / l * w]); Rt.push([p[0] + ty / l * w, p[1] - tx / l * w]); }); return Lf.concat(Rt.reverse()); };
  L.shrink = (poly, k) => { const [cx, cy] = L.centroid(poly); return poly.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]); };
  /* Sutherland–Hodgman against a convex clip polygon */
  L.clip = (subj, clip) => { let out = subj; const s0 = Math.sign(L.area(clip)) || 1; for (let i = 0; i < clip.length && out.length; i++) { const A = clip[i], B = clip[(i + 1) % clip.length], side = p => ((B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0])) * s0; const res = []; for (let j = 0; j < out.length; j++) { const P1 = out[j], P2 = out[(j + 1) % out.length], d1 = side(P1), d2 = side(P2); if (d1 >= 0) res.push(P1); if ((d1 >= 0) !== (d2 >= 0)) { const t = d1 / (d1 - d2); res.push([lerp(P1[0], P2[0], t), lerp(P1[1], P2[1], t)]); } } out = res; } return out; };
  /* Voronoi cells of seeds inside a convex bound (half-plane clipping; fine for a few hundred seeds) */
  L.voronoi = (seeds, bound) => seeds.map((s, i) => { let cell = bound.slice(); const near = seeds.map((q, j) => [j, (q[0] - s[0]) ** 2 + (q[1] - s[1]) ** 2]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]).slice(0, 24);
    for (const [j] of near) { const q = seeds[j], mx = (s[0] + q[0]) / 2, my = (s[1] + q[1]) / 2, nx = q[0] - s[0], ny = q[1] - s[1]; const res = []; for (let k = 0; k < cell.length; k++) { const P1 = cell[k], P2 = cell[(k + 1) % cell.length], d1 = (P1[0] - mx) * nx + (P1[1] - my) * ny, d2 = (P2[0] - mx) * nx + (P2[1] - my) * ny; if (d1 <= 0) res.push(P1); if ((d1 <= 0) !== (d2 <= 0)) { const t = d1 / (d1 - d2); res.push([lerp(P1[0], P2[0], t), lerp(P1[1], P2[1], t)]); } } cell = res; if (!cell.length) break; }
    return cell; });
  /* Poisson-disc sampling inside a test function over a box */
  L.poisson = (box, r, R, inside = () => true, max = 20000) => { const cs = r / Math.SQRT2, gw = Math.ceil((box[2] - box[0]) / cs), gh = Math.ceil((box[3] - box[1]) / cs), grid = new Int32Array(gw * gh).fill(-1), pts = [], act = [];
    const put = p => { pts.push(p); act.push(p); grid[Math.floor((p[1] - box[1]) / cs) * gw + Math.floor((p[0] - box[0]) / cs)] = pts.length - 1; };
    const ok = p => { if (p[0] < box[0] || p[0] >= box[2] || p[1] < box[1] || p[1] >= box[3] || !inside(p)) return false; const gx = Math.floor((p[0] - box[0]) / cs), gy = Math.floor((p[1] - box[1]) / cs); for (let y = Math.max(0, gy - 2); y <= Math.min(gh - 1, gy + 2); y++) for (let x = Math.max(0, gx - 2); x <= Math.min(gw - 1, gx + 2); x++) { const i = grid[y * gw + x]; if (i >= 0 && (pts[i][0] - p[0]) ** 2 + (pts[i][1] - p[1]) ** 2 < r * r) return false; } return true; };
    for (let t = 0; t < 60 && !pts.length; t++) { const p = [lerp(box[0], box[2], R()), lerp(box[1], box[3], R())]; if (ok(p)) put(p); }
    while (act.length && pts.length < max) { const i = Math.floor(R() * act.length), b = act[i]; let found = false; for (let k = 0; k < 20; k++) { const a = R() * TAU, d = r * (1 + R()), p = [b[0] + Math.cos(a) * d, b[1] + Math.sin(a) * d]; if (ok(p)) { put(p); found = true; break; } } if (!found) act.splice(i, 1); }
    return pts; };
  /* keep the part of a polygon on s's side of the bisector between s and q */
  const halfClip = (cell, s, q) => { const mx = (s[0] + q[0]) / 2, my = (s[1] + q[1]) / 2, nx = q[0] - s[0], ny = q[1] - s[1], res = []; for (let k = 0; k < cell.length; k++) { const P1 = cell[k], P2 = cell[(k + 1) % cell.length], d1 = (P1[0] - mx) * nx + (P1[1] - my) * ny, d2 = (P2[0] - mx) * nx + (P2[1] - my) * ny; if (d1 <= 0) res.push(P1); if ((d1 <= 0) !== (d2 <= 0)) { const t = d1 / (d1 - d2); res.push([lerp(P1[0], P2[0], t), lerp(P1[1], P2[1], t)]); } } return res; };
  /* Voronoi cells of a jittered grid: fast, because every cell only looks at its 24 grid neighbours */
  L.gridVoronoi = (x0, y0, x1, y1, cs, jit = 0.9, seed = 1, keep = null, adjust = null) => { const R = L.rng(seed), nx = Math.ceil((x1 - x0) / cs) + 4, ny = Math.ceil((y1 - y0) / cs) + 4, seeds = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) seeds.push([x0 + (i - 1.5 + (R() - 0.5) * jit) * cs, y0 + (j - 1.5 + (R() - 0.5) * jit) * cs, R()]);
    if (adjust) adjust(seeds);
    const cells = []; for (let j = 2; j < ny - 2; j++) for (let i = 2; i < nx - 2; i++) { const s = seeds[j * nx + i]; if (keep && !keep(s)) continue; let cell = [[s[0] - 3 * cs, s[1] - 3 * cs], [s[0] + 3 * cs, s[1] - 3 * cs], [s[0] + 3 * cs, s[1] + 3 * cs], [s[0] - 3 * cs, s[1] + 3 * cs]];
      for (let dj = -2; dj <= 2 && cell.length; dj++) for (let di = -2; di <= 2 && cell.length; di++) { if (!di && !dj) continue; cell = halfClip(cell, s, seeds[(j + dj) * nx + i + di]); }
      if (cell.length > 2) cells.push({ seed: s, poly: cell, i, j, r: s[2] }); }
    return cells; };
  /* jigsaw walls: every shared edge becomes the same wavy line for both cells */
  const hk = (x, y) => Math.round(x * 20) + ',' + Math.round(y * 20);
  L.jigsaw = (cells, amp = 0.14, seed = 1, step = 0) => { const edges = new Map(), wav = (a, b) => { const key = hk(...a) < hk(...b) ? hk(...a) + '|' + hk(...b) : hk(...b) + '|' + hk(...a); let e = edges.get(key);
      if (!e) { const [p, q] = hk(...a) < hk(...b) ? [a, b] : [b, a], len = Math.hypot(q[0] - p[0], q[1] - p[1]), h = L.rng(Math.abs(Math.round(p[0] * 7 + p[1] * 13 + q[0] * 17 + q[1] * 29)) + seed), n = len < 1e-6 ? 1 : 1 + Math.floor(h() * 3), A = len * amp * (0.6 + h() * 0.7) * (h() < 0.5 ? -1 : 1), nx = -(q[1] - p[1]) / (len || 1), ny = (q[0] - p[0]) / (len || 1), m = Math.max(2, Math.ceil(len / (step || Math.max(2, len / 16)))), pts = [];
        for (let i = 0; i <= m; i++) { const t = i / m, o = A * Math.sin(Math.PI * n * t) * Math.sin(Math.PI * t); pts.push([lerp(p[0], q[0], t) + nx * o, lerp(p[1], q[1], t) + ny * o]); } e = { pts, fwd: p }; edges.set(key, e); }
      return hk(...e.fwd) === hk(...a) ? e.pts : e.pts.slice().reverse(); };
    const polys = cells.map(c => { const out = []; for (let i = 0; i < c.poly.length; i++) { const seg = wav(c.poly[i], c.poly[(i + 1) % c.poly.length]); for (let j = 0; j < seg.length - 1; j++) out.push(seg[j]); } return out; });
    return { polys, edges: [...edges.values()].map(e => e.pts) }; };
  /* a segment clipped to a circle */
  L.clipSeg = (a, b, C, r) => { const dx = b[0] - a[0], dy = b[1] - a[1], fx = a[0] - C[0], fy = a[1] - C[1], A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), Cc = fx * fx + fy * fy - r * r, D = B * B - 4 * A * Cc; if (D < 0 || A < 1e-12) return null; const s = Math.sqrt(D), t0 = Math.max(0, (-B - s) / (2 * A)), t1 = Math.min(1, (-B + s) / (2 * A)); if (t0 >= t1) return null; return [[a[0] + dx * t0, a[1] + dy * t0], [a[0] + dx * t1, a[1] + dy * t1]]; };
  /* marching squares: iso-lines of f over a grid, stitched into polylines */
  L.contours = (f, x0, y0, x1, y1, st, levels) => { const nx = Math.ceil((x1 - x0) / st) + 1, ny = Math.ceil((y1 - y0) / st) + 1, v = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) v[j * nx + i] = f(x0 + i * st, y0 + j * st);
    return levels.map(lv => { const segs = [], ip = (a, b, va, vb) => { const t = (lv - va) / (vb - va); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; };
      for (let j = 0; j + 1 < ny; j++) for (let i = 0; i + 1 < nx; i++) { const p = [[x0 + i * st, y0 + j * st], [x0 + (i + 1) * st, y0 + j * st], [x0 + (i + 1) * st, y0 + (j + 1) * st], [x0 + i * st, y0 + (j + 1) * st]], q = [v[j * nx + i], v[j * nx + i + 1], v[(j + 1) * nx + i + 1], v[(j + 1) * nx + i]], e = [];
        for (let s2 = 0; s2 < 4; s2++) { const a = q[s2], b = q[(s2 + 1) % 4]; if ((a < lv) !== (b < lv)) e.push(ip(p[s2], p[(s2 + 1) % 4], a, b)); } if (e.length === 2) segs.push(e); else if (e.length === 4) { segs.push([e[0], e[1]]); segs.push([e[2], e[3]]); } }
      const key = p => Math.round(p[0] * 10) + ',' + Math.round(p[1] * 10), ends = new Map(), used = new Array(segs.length).fill(false); segs.forEach((sg, i) => sg.forEach(p => { const kk = key(p); (ends.get(kk) || ends.set(kk, []).get(kk)).push(i); }));
      const lines = []; for (let i = 0; i < segs.length; i++) { if (used[i]) continue; used[i] = true; const line = [segs[i][0], segs[i][1]]; for (let dir = 0; dir < 2; dir++) { let grow = true; while (grow) { grow = false; const tip = dir ? line[0] : line[line.length - 1]; for (const j of ends.get(key(tip)) || []) { if (used[j]) continue; used[j] = true; const nxt = key(segs[j][0]) === key(tip) ? segs[j][1] : segs[j][0]; if (dir) line.unshift(nxt); else line.push(nxt); grow = true; break; } } } lines.push(line); }
      return lines; }); };
  /* iso-regions: the closed contour loops of f at level lv (f must fall below lv at the box edges); fill or ink each loop */
  L.regions = (f, x0, y0, x1, y1, st, lv) => { const out = L.contours((x, y) => (x <= x0 + st * 0.5 || y <= y0 + st * 0.5 || x >= x1 - st * 0.5 || y >= y1 - st * 0.5) ? -1e9 : f(x, y), x0, y0, x1, y1, st, Array.isArray(lv) ? lv : [lv]).map(ls => ls.filter(l => l.length > 3)); return Array.isArray(lv) ? out : out[0]; };
  L.blend = (P, mode, fn) => { const i0 = P.ops.length; fn(); for (let i = i0; i < P.ops.length; i++) P.ops[i].blend = mode; };
  /* ink kit bound to a page */
  L.convex = poly => { const n = poly.length; let sg = 0; for (let i = 0; i < n; i++) { const a = poly[i], b = poly[(i + 1) % n], c = poly[(i + 2) % n], cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]); if (Math.abs(cr) < 1e-9) continue; const s = Math.sign(cr); if (sg && s !== sg) return false; sg = s; } return true; };
  L.kit = (P, K = '#1a1410', ko = {}) => {
    const RO = ko.rough ?? 0.2, OV = ko.over ?? 0;
    const k = {
      K,
      fill: (poly, c, a = 1) => P.wash(poly, c, a, { edge: 0, jit: 0, steps: 1 }),
      lin: (poly, c0, a0, c1, a1, x0, y0, x1, y1) => P.wash(poly, c0, 1, { edge: 0, jit: 0, steps: 1, grad: { x0, y0, x1, y1, c0, a0, c1, a1 } }),
      rad: (poly, cx, cy, r, c0, a0, c1, a1, r0 = 0) => P.wash(poly, c0, 1, { edge: 0, jit: 0, steps: 1, grad: { x0: cx, y0: cy, x1: cx + r, y1: cy, r0, r1: r, c0, a0, c1, a1 } }),
      glow: (cx, cy, r, c, a = 0.6, mode = 'lighter') => L.blend(P, mode, () => k.rad(L.ell(cx, cy, r, r, 28), cx, cy, r, c, a, c, 0)),
      ink: (pts, w = 1, c = K, a = 0.95, closed = false) => P.path(closed ? pts.concat([pts[0]]) : pts, { w, c, a, rough: RO, passes: 1 }),
      line: (a, b, w = 1, c = K, al = 0.95) => P.line(a[0], a[1], b[0], b[1], { w, c, a: al, passes: 1, over: OV, rough: RO }),
      curve: (pts, w = 1, c = K, a = 0.95) => P.curve(pts, { w, c, a, passes: 1, rough: RO }),
      outline: (poly, w = 1, c = K, a = 0.95) => P.path(poly.concat([poly[0]]), { w, c, a, rough: RO, passes: 1 }),
      hatch: (poly, ang, gap, c = K, a = 0.6, w = 0.45, o = {}) => P.hatch(poly, Object.assign({ ang, gap, c, a, w }, o)),
      stip: (poly, n, c = K, a = 0.8, r = 0.6, fade) => P.stipple(poly, n, { c, a, r, fade }),
      dot: (x, y, r, c = K, a = 1) => P.dot(x, y, r, { c, a }),
      dots: (arr, c = K, a = 1) => P.dots(arr, c, a),
      circle: (x, y, r, w = 1, c = K, a = 0.95) => P.circle(x, y, r, { w, c, a, passes: 1 }),
      text: (s, x, y, sz, c = K, o = {}) => P.text(s, x, y, Object.assign({ size: sz, c }, o)),
      /* a filled leaf with a lit side, midrib and outline */
      leaf: (x, y, ang, len, wid, col, o = {}) => {
        const ca = Math.cos(ang), sa = Math.sin(ang), T = (u, v) => [x + ca * u - sa * v, y + sa * u + ca * v], n = o.n ?? 8, Lp = [], Rp = [];
        for (let i = 0; i <= n; i++) { const u = len * i / n, v = wid * Math.pow(Math.sin(Math.PI * i / n), o.round ?? 0.75); Lp.push(T(u, -v)); Rp.push(T(u, v)); }
        const poly = Lp.concat(Rp.reverse().slice(1, -1)); k.fill(poly, col, o.a ?? 1);
        if (o.lit !== false) k.lin(poly, '#ffffff', o.la ?? 0.22, col, 0, ...T(len * 0.3, -wid), ...T(len * 0.5, wid));
        if (o.vein !== false) k.line(T(0, 0), T(len * 0.85, 0), o.vw ?? 0.25, o.vc || L.shade(col, -0.4), 0.8);
        if (o.ol !== false) k.outline(poly, o.ow ?? 0.3, o.oc || L.shade(col, -0.5), 0.8);
        return poly;
      },
      /* washes that sit on top of what is already there */
      mul: (poly, c, a = 0.5) => L.blend(P, 'multiply', () => k.fill(poly, c, a)),
      scr: (poly, c, a = 0.5) => L.blend(P, 'screen', () => k.fill(poly, c, a)),
      /* watercolour: a flat wash, pigment blooms that stay inside the shape, granulation in noisy patches, a pooled darker edge */
      wc: (poly, col, o = {}) => {
        const a = o.a ?? 1; k.fill(poly, col, a);
        const [x0, y0, x1, y1] = L.bbox(poly), w = x1 - x0, h = y1 - y0, cv = L.convex(poly), m = Math.min(w, h);
        const nb = o.blooms ?? Math.max(1, Math.min(14, Math.round(w * h / 3000)));
        for (let i = 0; i < nb; i++) {
          const cx = lerp(x0, x1, P.R()), cy = lerp(y0, y1, P.R()), r = m * (0.18 + P.R() * 0.45);
          let b = L.blob(cx, cy, r, 12, 0.3, P.R, h < w ? 0.7 : 1.3);
          if (cv) b = L.clip(b, poly); else if (!b.every(p => L.pip(poly, p[0], p[1]))) continue;
          if (b.length > 2) k.fill(b, L.shade(col, P.R() < 0.55 ? -(o.dk ?? 0.13) : (o.lt ?? 0.11)), (o.ba ?? 0.3) * a);
        }
        const gn = o.gran ?? 0.012;
        if (gn > 0) { const s0 = Math.floor(P.R() * 1000), sc = o.gs ?? 30; k.stip(poly, Math.round(w * h * gn), o.gc || L.shade(col, -0.4), (o.ga ?? 0.3) * a, o.gr ?? 0.5, (x, y) => L.fbm(x / sc, y / sc, 3, s0) * 1.8 - 0.5); }
        if (o.edge !== 0) k.outline(poly, o.edge ?? 1.3, L.shade(col, -0.3), (o.ea ?? 0.3) * a);
      }
    };
    return k;
  };

  /* ---------------- textures: surfaces built from noise and contour lines ---------------- */
  // each takes the page, a polygon and options; everything is clipped to the polygon
  const bb = poly => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; poly.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }); return [x0, y0, x1, y1]; };
  L.tex = {
    // dry-stone wall: irregular rounded stones in courses, each shaded on its lower right
    stone(P, poly, o = {}) { const [x0, y0, x1, y1] = bb(poly), h = o.size ?? 16, c = o.c || P.ink, R = (a, b) => P.r(a, b);
      P.clip(poly, () => { for (let y = y0; y < y1 + h; y += h * R(0.8, 1.1)) { let x = x0 - R(0, h); while (x < x1) { const w = h * R(1.1, 2.2), hh = h * R(0.75, 0.95), cx = x + w / 2, cy = y + hh / 2, pts = [];
        for (let k = 0; k < 14; k++) { const a = k * TAU / 14, sx = Math.cos(a), sy = Math.sin(a), f = Math.pow(Math.abs(sx) ** 3 + Math.abs(sy) ** 3, -1 / 3) * R(0.92, 1.04); pts.push([cx + sx * f * w * 0.46, cy + sy * f * hh * 0.46]); }
        P.occlude(pts, o.paper || '#ffffff'); P.path(pts.concat([pts[0]]), { w: 0.9, c, rough: 0.4, passes: 1 }); P.hatch(pts, { ang: -40, gap: 1.8, w: 0.45, a: 0.8, c, fade: (px, py) => Math.max(0, ((px - cx) / w + (py - cy) / hh) * 1.6) }); x += w + R(0.5, 2); } } }); },
    // water: wavering horizontal ripple lines, closer and shorter toward the bottom, broken where light glints
    ripples(P, poly, o = {}) { const [x0, y0, x1, y1] = bb(poly), c = o.c || P.ink, R = (a, b) => P.r(a, b);
      P.clip(poly, () => { for (let y = y0, k = 0; y < y1; k++) { const t = (y - y0) / Math.max(1, y1 - y0), gap = (o.gap ?? 7) * (1.4 - t * 0.9); for (let x = x0 + R(-20, 0); x < x1;) { const L2 = R(8, 40) * (1.3 - t * 0.6), line = []; for (let u = 0; u <= L2; u += 3) line.push([x + u, y + Math.sin((x + u) * 0.09 + k) * 1.3]); P.path(line, { w: 0.6, c, a: 0.85, rough: 0.2, passes: 1 }); x += L2 + R(4, 18) * (1 - t * 0.6); } y += gap; } }); },
    // fur: short curved strokes along a direction, in overlapping tufts, denser on the shadow side
    fur(P, poly, o = {}) { const [x0, y0, x1, y1] = bb(poly), c = o.c || P.ink, ang = o.ang ?? Math.PI / 2, len = o.len ?? 9, R = (a, b) => P.r(a, b), n = Math.round((x1 - x0) * (y1 - y0) / (len * len) * (o.density ?? 2.2));
      P.clip(poly, () => { for (let i = 0; i < n; i++) { const x = R(x0, x1), y = R(y0, y1); if (!S.pip(poly, x, y)) continue; if (o.fade && P.R() > o.fade(x, y)) continue; const a = ang + R(-0.3, 0.3), l = len * R(0.6, 1.2), b = R(-0.4, 0.4); P.curve([[x, y], [x + Math.cos(a + b * 0.5) * l * 0.5, y + Math.sin(a + b * 0.5) * l * 0.5], [x + Math.cos(a + b) * l, y + Math.sin(a + b) * l]], { w: 0.55, c, a: 0.85, rough: 0.1, passes: 1 }); } }); },
    // cloth: fold lines from pinch points, each fold shaded on one side with short hatching
    folds(P, poly, o = {}) { const [x0, y0, x1, y1] = bb(poly), c = o.c || P.ink, n = o.count ?? 7, R = (a, b) => P.r(a, b), pin = o.from || [(x0 + x1) / 2, y0];
      P.clip(poly, () => { for (let k = 0; k < n; k++) { const ex = lerp(x0, x1, (k + 0.5) / n) + R(-10, 10), ey = y1 + 5, mid = [lerp(pin[0], ex, 0.5) + R(-15, 15), lerp(pin[1], ey, 0.5)], line = P.sample([pin, mid, [ex, ey]], false, 4); P.path(line, { w: 0.9, c, rough: 0.3, passes: 1 });
        const side = line.map(([x, y], i) => [x + 3 + i * 0.25, y]); P.hatch(line.concat(side.slice().reverse()), { ang: -60, gap: 2, w: 0.45, a: 0.75, c }); } }); },
  };

  /* ---------------- live kit: ready-made moving parts for the pen-drawing videos ---------------- */
  // draw(P, t) draws the part; these wrap it in P.live with the right motion
  L.liveKit = {
    spin: (P, x, y, draw, speed = 0.6) => P.live(Q => draw(Q), { cache: true, fps: 0, xf: t => ({ rot: t * speed, px: x, py: y }) }),
    bob: (P, draw, amp = 3, speed = 1.3) => P.live(Q => draw(Q), { cache: true, fps: 0, xf: t => ({ y: Math.sin(t * speed * TAU) * amp, x: 0 }) }),
    drift: (P, draw, o = {}) => P.live((Q, t) => draw(Q, t), { fps: o.fps ?? 12 }),
    blink: (P, x, y, r, o = {}) => P.live((Q, t) => { const ph = (t * (o.rate ?? 0.25)) % 1, shut = ph > 0.95 ? Math.sin((ph - 0.95) / 0.05 * Math.PI) : 0, h = r * 0.55 * (1 - shut);
      const al = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; al.push([x + Math.cos(a) * r, y + Math.sin(a) * Math.max(0.3, h)]); } Q.occlude(al, '#ffffff'); Q.path(al.concat([al[0]]), { w: 1, passes: 1, rough: 0.2 }); if (h > r * 0.2) Q.dot(x, y, Math.min(h, r * 0.38)); }, { fps: 20 }),
  };
})(window);
