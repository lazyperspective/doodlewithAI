/* SketchDoodle — the doodle skill, as a reusable kit.
   Everything the "Automatic Doodle", "Ink Garden" and "The House That Draws Itself" sheets grow their pages with:
   wobbly blobs, a vocabulary of ink fills and self-contained motifs, tentacles and tendrils, beaded spires, a fast
   circle packer, two growth engines (budding from a seed, and packing a region), and the small shading moves that make
   black-and-white ink read as volume (fringes, scribbles, stipple fades, puff shading).

   const D = SketchDoodle.kit(P, { ink: '#0b0b0b' });      // P is the Sketch.Page your scene's build(P) receives
   D.motif('eye', 800, 500, 60);                             // one motif
   D.fill('scales', D.blob(400, 300, 80), 400, 300, 80);     // pattern inside any closed shape
   const m = D.mass([[600, 500, 160], [800, 450, 180]]);     // a silhouette made of lobes
   D.grow({ inside: m.inside, bounds: [400, 250, 1000, 700] }); // a whole grown doodle packed into it

   Load after engine.js. Pure JavaScript; it only records ops on the page. */
(function (g) {
  'use strict';
  const S = g.Sketch, TAU = Math.PI * 2, lerp = (a, b, t) => a + (b - a) * t;

  function kit(P, o = {}) {
    const K = o.ink || P.ink || '#0b0b0b', Wh = o.paper || '#ffffff', R = (a, b) => P.r(a, b), pick = a => a[Math.floor(P.R() * a.length)];
    const D = { K, Wh, R, pick };

    /* ---------------- marks ---------------- */
    D.black = pts => P.wash(pts, '#070707', 1, { edge: 0, jit: 0, steps: 1 });           // solid ink fill
    D.white = pts => P.occlude(pts, Wh);                                                  // paper-coloured knock-out (hides what is under)
    D.tint = (pts, c, a = 0.5) => P.wash(pts, c, a, { edge: 0, jit: 0, steps: 1 });      // flat colour
    D.ol = (pts, w = 1.2, c = K, a = 0.97) => P.path(pts.concat([pts[0]]), { w, c, a, rough: 0.3, passes: 1 }); // closed outline
    D.pl = (pts, w = 1, c = K, a = 0.95) => P.path(pts, { w, c, a, rough: 0.2, passes: 1 }); // open polyline
    D.ln = (x1, y1, x2, y2, w = 0.8, c = K, a = 0.95) => P.line(x1, y1, x2, y2, { w, c, a, passes: 1, over: 0, rough: 0.2 });
    D.dot = (x, y, r, c = K, a = 1) => P.dot(x, y, r, { c, a });

    /* ---------------- shapes ---------------- */
    D.circ = (x, y, r, k = 16) => Array.from({ length: k }, (_, i) => [x + Math.cos(i * TAU / k) * r, y + Math.sin(i * TAU / k) * r]);
    D.ell = (cx, cy, rx, ry, n = 28, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i * TAU / n, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
    D.blob = (cx, cy, r, k = 9, j = 0.28) => { const pts = []; for (let i = 0; i < k; i++) { const a = i * TAU / k + R(-0.2, 0.2); pts.push([cx + Math.cos(a) * r * R(1 - j, 1 + j), cy + Math.sin(a) * r * R(1 - j, 1 + j)]); } return P.sample(pts, true, 3); };
    D.blobR = (cx, cy, rx, ry, ang = 0, k = 11, j = 0.16) => { const ca = Math.cos(ang), sa = Math.sin(ang); return P.sample(Array.from({ length: k }, (_, i) => { const a = i * TAU / k, u = Math.cos(a) * rx * R(1 - j, 1 + j), v = Math.sin(a) * ry * R(1 - j, 1 + j); return [cx + u * ca - v * sa, cy + u * sa + v * ca]; }), true, 2.5); };
    D.shrink = (pts, cx, cy, k) => pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
    D.centroid = pts => pts.reduce((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length], [0, 0]);
    D.area = poly => { let a = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
    D.offset = (poly, d) => { const n = poly.length, s = D.area(poly) > 0 ? 1 : -1; return poly.map((p, i) => { const a = poly[(i - 1 + n) % n], b = poly[(i + 1) % n]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; return [p[0] - ty * d * s, p[1] + tx * d * s]; }); };
    D.clipRect = (poly, x0, y0, x1, y1) => { let out = poly; const stage = (inside, inter) => { const res = []; for (let i = 0; i < out.length; i++) { const A = out[i], B = out[(i + 1) % out.length], ia = inside(A), ib = inside(B); if (ia) res.push(A); if (ia !== ib) res.push(inter(A, B)); } out = res; };
      stage(p => p[0] >= x0, (A, B) => [x0, A[1] + (B[1] - A[1]) * (x0 - A[0]) / (B[0] - A[0])]); if (!out.length) return out;
      stage(p => p[0] <= x1, (A, B) => [x1, A[1] + (B[1] - A[1]) * (x1 - A[0]) / (B[0] - A[0])]); if (!out.length) return out;
      stage(p => p[1] >= y0, (A, B) => [A[0] + (B[0] - A[0]) * (y0 - A[1]) / (B[1] - A[1]), y0]); if (!out.length) return out;
      stage(p => p[1] <= y1, (A, B) => [A[0] + (B[0] - A[0]) * (y1 - A[1]) / (B[1] - A[1]), y1]); return out; };
    D.ribbon = (pts, w0, w1 = 1) => { const Lf = [], Rt = []; pts.forEach((p, k) => { const q = pts[Math.min(pts.length - 1, k + 1)], o2 = pts[Math.max(0, k - 1)], tx = q[0] - o2[0], ty = q[1] - o2[1], l = Math.hypot(tx, ty) || 1, w = lerp(w0, w1, k / Math.max(1, pts.length - 1)); Lf.push([p[0] - ty / l * w, p[1] + tx / l * w]); Rt.push([p[0] + ty / l * w, p[1] - tx / l * w]); }); return { poly: Lf.concat(Rt.slice().reverse()), L: Lf, R: Rt }; };

    /* ---------------- shading: ink that reads as light and volume ---------------- */
    // a ring of dots just inside an outline
    D.dotRing = (pts, cx, cy, k = 0.84, gap = 6, r = 0.9, c = K) => { const q = D.shrink(pts, cx, cy, k), dd = []; let acc = 0; for (let i = 1; i < q.length; i++) { acc += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]); if (acc > gap) { acc = 0; dd.push([q[i][0], q[i][1], r]); } } P.dots(dd, c, 0.95); };
    // the shadow side of a rounded lump: short curved strokes inward from the rim, plus a stipple fade (light from the upper left)
    D.puffShade = (pts, cx, cy, r, light = 2.4) => { for (let i = 0; i < pts.length; i += 2) { const [x, y] = pts[i], a = Math.atan2(y - cy, x - cx), lit = Math.cos(a + light); if (lit > -0.15) continue; const L = r * 0.28 * -lit; for (let k = 0; k < 3; k++) { const s = 1.5 + k * 2.6; P.curve([[x - Math.cos(a) * s, y - Math.sin(a) * s], [x - Math.cos(a) * (s + L * 0.5) + Math.sin(a) * 1.5, y - Math.sin(a) * (s + L * 0.5) - Math.cos(a) * 1.5], [x - Math.cos(a) * (s + L), y - Math.sin(a) * (s + L)]], { w: 0.5, c: K, rough: 0.1, passes: 1 }); } } P.stipple(pts, Math.round(r * r * 0.35), { a: 0.9, r: 0.65, c: K, fade: (x, y) => Math.max(0, ((x - cx) + (y - cy)) / (r * 1.3)) }); };
    // rows of short strokes combed in from the rim on the side away from the light
    D.fringe = (pts, cx, cy, r, o2 = {}) => { const rows = o2.rows ?? 3; for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], a = Math.atan2(y - cy, x - cx), sh = -Math.cos(a - (o2.light ?? -2.4)); if (sh < -0.05) continue; for (let m = 0; m < rows; m++) { const s0 = 1 + m * r * 0.09, L = r * (0.1 + 0.16 * sh) * (1 - m * 0.25); if (L < 1) continue; P.line(x - Math.cos(a) * s0, y - Math.sin(a) * s0, x - Math.cos(a) * (s0 + L), y - Math.sin(a) * (s0 + L), { w: o2.w ?? 0.45, c: o2.c ?? K, passes: 1, over: 0, rough: 0.1 }); } } };
    // a white lump with fringe and stipple shading: rocks, clouds, foliage, crowds of heads
    D.lump = (cx, cy, r, o2 = {}) => { const pts = P.sample(Array.from({ length: 12 }, (_, i) => { const a = i * TAU / 12; return [cx + Math.cos(a) * r * R(0.8, 1.15), cy + Math.sin(a) * r * (o2.sq ?? 0.85) * R(0.8, 1.12)]; }), true, 2); D.white(pts); D.fringe(pts, cx, cy, r, o2); P.stipple(pts, Math.round(r * r * 0.14), { a: 0.9, r: 0.6, c: K, fade: (x, y) => Math.max(0, ((x - cx) * 0.7 + (y - cy)) / (r * 1.2)) }); D.ol(pts, o2.w ?? 1.4); return pts; };
    // loose looping scribble tone inside a shape (graphite-like shading without straight hatching)
    D.scribble = (poly, n, o2 = {}) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; poly.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }); for (let q = 0; q < n; q++) { let x = R(x0, x1), y = R(y0, y1); if (!S.pip(poly, x, y)) continue; let a = R(0, TAU); const pts = [[x, y]]; for (let i = 0; i < (o2.len ?? 40); i++) { a += R(0.5, 1.3); x += Math.cos(a) * (o2.r ?? 5) + (o2.dx ?? 0.4); y += Math.sin(a) * (o2.r ?? 5) + (o2.dy ?? 0.5); if (!S.pip(poly, x, y)) break; pts.push([x, y]); } if (pts.length > 2) P.path(pts, { w: o2.w ?? 0.5, c: o2.c ?? K, passes: 1, rough: 0.3, a: o2.a ?? 0.8 }); } };
    // directional hatching (with optional cross-hatch) — a thin wrapper so doodles and sketches shade the same way
    D.hatch = (pts, o2 = {}) => P.hatch(pts, Object.assign({ ang: -50, gap: 2.6, c: K, a: 0.7, w: 0.5 }, o2));
    D.ballStick = (x, y, a, L, w = 0.8, c = K) => { const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L; P.line(x, y, ex, ey, { w, c, passes: 1, over: 0, rough: 0.15 }); P.dot(ex, ey, w * 1.8 + 0.4, { c }); };

    /* ---------------- fills: a pattern inside any closed shape (pts, its centre cx, cy and radius r) ---------------- */
    const F = D.FILLS = {
      echo: (pts, cx, cy) => { for (let k = 0.86; k > 0.08; k -= 0.12) D.ol(D.shrink(pts, cx, cy, k), 0.8); },
      stipple: (pts, cx, cy, r) => P.stipple(pts, Math.round(r * r * 0.5), { a: 0.9, r: 0.8, c: K, fade: (x, y) => Math.min(1, 0.15 + Math.hypot(x - cx, y - cy) / r) }),
      bubbles: (pts, cx, cy, r) => { const B = []; for (let i = 0; i < 400 && B.length < 60; i++) { const x = cx + R(-r, r), y = cy + R(-r, r), rr = R(2, r * 0.24); if (!S.pip(pts, x, y) || Math.hypot(x - cx, y - cy) + rr > r * 0.85 || B.some(([a, b, c]) => Math.hypot(x - a, y - b) < c + rr + 1.5)) continue; B.push([x, y, rr]); } B.forEach(([x, y, rr]) => { P.circle(x, y, rr, { w: 0.9, passes: 1, c: K }); if (rr > 5) P.arc(x, y, rr * 0.6, rr * 0.6, 3.6, 4.6, { w: 0.6, passes: 1, c: K }); P.dot(x + rr * 0.3, y + rr * 0.3, Math.min(1.4, rr * 0.2), { c: K }); }); },
      night: (pts, cx, cy, r) => { D.black(pts); const d = []; for (let i = 0; i < r * 1.6; i++) { const x = cx + R(-r, r), y = cy + R(-r, r); if (S.pip(D.shrink(pts, cx, cy, 0.9), x, y)) d.push([x, y, R(0.4, 1.3)]); } P.dots(d, Wh, 0.95); },
      hatch: pts => P.hatch(pts, { ang: R(0, 180), gap: 2.4, a: 0.9, w: 0.55, c: K, cross: R(0, 1) > 0.5 ? 90 : undefined }),
      scales: (pts, cx, cy, r) => { for (let y = cy - r; y < cy + r; y += 7) for (let x = cx - r + ((y / 7) % 2 ? 4 : 0); x < cx + r; x += 8) if (S.pip(D.shrink(pts, cx, cy, 0.92), x, y)) P.arc(x, y, 4.2, 4.2, 0.1, Math.PI - 0.1, { w: 0.7, passes: 1, c: K }); },
      rays: (pts, cx, cy, r) => { for (let k = 0; k < 64; k++) { const a = k * TAU / 64; P.line(cx + Math.cos(a) * r * 0.18, cy + Math.sin(a) * r * 0.18, cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95, { w: 0.5 + (k % 2) * 0.4, c: K, passes: 1, over: 0, rough: 0.2 }); } D.white(D.blob(cx, cy, r * 0.2, 7, 0.1)); },
      eye: (pts, cx, cy, r) => { F.echo(pts, cx, cy, r); const e = r * 0.42; D.white(D.blob(cx, cy, e, 12, 0.05)); P.circle(cx, cy, e, { w: 1.4, passes: 1, c: K }); for (let k = 0; k < 40; k++) { const a = k * TAU / 40; P.line(cx + Math.cos(a) * e * 0.4, cy + Math.sin(a) * e * 0.4, cx + Math.cos(a) * e * 0.9, cy + Math.sin(a) * e * 0.9, { w: 0.5, c: K, passes: 1, over: 0 }); } D.black(D.blob(cx, cy, e * 0.38, 12, 0.02)); P.dot(cx - e * 0.14, cy - e * 0.16, e * 0.1, { c: Wh, a: 1 }); },
      maze: (pts, cx, cy, r) => { for (let y = cy - r; y < cy + r; y += 6) for (let x = cx - r; x < cx + r; x += 6) if (S.pip(D.shrink(pts, cx, cy, 0.9), x + 3, y + 3)) { if (P.R() > 0.5) P.line(x, y, x + 6, y + 6, { w: 0.8, c: K, passes: 1, over: 0, rough: 0.1 }); else P.line(x + 6, y, x, y + 6, { w: 0.8, c: K, passes: 1, over: 0, rough: 0.1 }); } },
      cells: (pts, cx, cy, r) => { const s = 9; for (let row = 0, y = cy - r; y < cy + r; y += s * 0.86, row++) for (let x = cx - r + (row % 2) * s / 2; x < cx + r; x += s) if (S.pip(D.shrink(pts, cx, cy, 0.9), x, y)) { const hx = []; for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + Math.PI / 6; hx.push([x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5]); } P.poly(hx, { w: 0.6, c: K, passes: 1, over: 0, rough: 0.1 }); if (P.R() > 0.75) D.black(hx); } },
      scribble: pts => D.scribble(pts, 40, { len: 30 }),
      puff: (pts, cx, cy, r) => D.puffShade(pts, cx, cy, r),
    };
    D.fill = (name, pts, cx, cy, r) => { (F[name] || F.echo)(pts, cx, cy, r); };

    /* ---------------- motifs: self-contained little drawings, each knocks out its own ground ---------------- */
    const M = D.MOTIFS = {
      puff: (x, y, r) => { const p = D.blobR(x, y, r, r * R(0.75, 1), R(0, TAU), 12, 0.2); D.white(p); D.puffShade(p, x, y, r); D.ol(p, 1.3); },
      ripple: (x, y, r) => { D.white(D.circ(x, y, r, 28)); const n = Math.max(3, Math.round(r / 4)); for (let k = 1; k <= n; k++) P.circle(x, y, r * k / n, { w: k === n ? 1.4 : 0.6, c: K, passes: 1, rough: 0.2 }); P.dot(x, y, Math.max(1, r * 0.07), { c: K }); },
      eye: (x, y, r) => { const p = D.blobR(x, y, r, r * 0.78, R(-0.3, 0.3), 12, 0.1); D.white(p); D.ol(p, 1.4); D.dotRing(p, x, y, 0.86, 5, 0.9); P.circle(x, y, r * 0.42, { w: 1.1, c: K, passes: 1 }); for (let k = 0; k < 28; k++) { const a = k * TAU / 28; D.ln(x + Math.cos(a) * r * 0.2, y + Math.sin(a) * r * 0.2, x + Math.cos(a) * r * 0.41, y + Math.sin(a) * r * 0.41, 0.45); } D.black(D.circ(x, y, r * 0.17, 12)); P.dot(x - r * 0.06, y - r * 0.07, r * 0.05, { c: Wh, a: 1 }); },
      pod: (x, y, r) => { const a = R(0, TAU), p = D.blobR(x, y, r, r * 0.52, a, 12, 0.06); D.white(p); D.ol(p, 1.3); D.dotRing(p, x, y, 0.8, 5.5, 1); D.black(D.blobR(x, y, r * 0.55, r * 0.2, a, 10, 0.04)); for (let k = -3; k <= 3; k++) P.dot(x + Math.cos(a) * k * r * 0.14, y + Math.sin(a) * k * r * 0.14, 1.1, { c: Wh, a: 1 }); },
      cells: (x, y, r) => { const p = D.blobR(x, y, r, r * 0.9, 0, 12, 0.14); D.white(p); D.ol(p, 1.3); for (let i = 0; i < r * 1.4; i++) { const a = R(0, TAU), d = Math.sqrt(R(0, 1)) * r * 0.72, cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d, rr = R(1.6, r * 0.17); P.circle(cx, cy, rr, { w: 0.7, c: K, passes: 1 }); P.dot(cx, cy, rr * 0.35, { c: K }); } },
      shell: (x, y, r) => { D.white(D.circ(x, y, r, 24)); const sp = []; for (let a = 0; a < 3.2 * TAU; a += 0.14) sp.push([x + Math.cos(a) * r * (1 - a / (3.4 * TAU)), y + Math.sin(a) * r * (1 - a / (3.4 * TAU))]); P.path(sp, { w: 1.1, c: K, rough: 0.15, passes: 1 }); for (let i = 3; i < sp.length - 20; i += 3) { const j = Math.min(sp.length - 1, i + 45); D.ln(sp[i][0], sp[i][1], lerp(sp[i][0], sp[j][0], 0.35), lerp(sp[i][1], sp[j][1], 0.35), 0.45); } P.stipple(D.circ(x, y, r, 20), Math.round(r * r * 0.3), { a: 0.9, r: 0.6, c: K, fade: px => Math.max(0, (px - x) / r) }); P.circle(x, y, r, { w: 1.3, c: K, passes: 1 }); },
      honey: (x, y, r) => { const p = D.blobR(x, y, r, r * 0.9, 0, 12, 0.12); D.white(p); const s = Math.max(5, r / 5); for (let row = 0, yy = y - r; yy < y + r; yy += s * 0.87, row++) for (let xx = x - r + (row % 2) * s / 2; xx < x + r; xx += s) if (S.pip(D.shrink(p, x, y, 0.88), xx, yy)) { const hx = D.circ(xx, yy, s * 0.52, 6); P.poly(hx, { w: 0.55, c: K, passes: 1, over: 0, rough: 0.1 }); if (P.R() > 0.72) D.black(hx); } D.ol(p, 1.3); },
      bands: (x, y, r) => { const a = R(0, TAU), p = D.blobR(x, y, r, r * 0.42, a, 12, 0.04); D.white(p); const ca = Math.cos(a), sa = Math.sin(a); for (let k = -6; k <= 6; k++) { const u = k * r / 7, hw = r * 0.42 * Math.sqrt(Math.max(0, 1 - Math.pow(u / r, 2))); const A = [x + ca * u - sa * hw, y + sa * u + ca * hw], B = [x + ca * u + sa * hw, y + sa * u - ca * hw]; D.ln(A[0], A[1], B[0], B[1], 0.8); if (k % 2 === 0 && k < 6) { const u2 = u + r / 7, hw2 = r * 0.42 * Math.sqrt(Math.max(0, 1 - Math.pow(u2 / r, 2))); D.black([A, B, [x + ca * u2 + sa * hw2, y + sa * u2 - ca * hw2], [x + ca * u2 - sa * hw2, y + sa * u2 + ca * hw2]]); } } D.ol(p, 1.3); },
      mushroom: (x, y, r) => { const cap = [], by = y + r * 0.1; for (let k = 0; k <= 16; k++) { const a = Math.PI + k * Math.PI / 16; cap.push([x + Math.cos(a) * r, by + Math.sin(a) * r * 0.75]); } const cp = cap.concat([[x + r, by + r * 0.08], [x - r, by + r * 0.08]]); const stem = [[x - r * 0.18, by], [x + r * 0.18, by], [x + r * 0.22, y + r], [x - r * 0.22, y + r]]; D.white(stem); D.ol(stem, 1.1); P.hatch(stem, { ang: 90, gap: 1.8, a: 0.8, w: 0.4, c: K, fade: px => Math.max(0, (px - x) / (r * 0.2)) }); D.white(cp); for (let k = 1; k < 16; k++) { const a = Math.PI + k * Math.PI / 16; D.ln(x + Math.cos(a) * r * 0.2, by + r * 0.04, x + Math.cos(a) * r * 0.95, by + Math.sin(a) * r * 0.05 + r * 0.05, 0.4); } P.stipple(cap.concat([[x + r, by], [x - r, by]]), Math.round(r * r * 0.25), { a: 0.9, r: 0.6, c: K, fade: px => Math.max(0, (px - x) / r + 0.2) }); for (let k = 0; k < 5; k++) { const a = Math.PI + (k + 0.6) * Math.PI / 5.5; P.circle(x + Math.cos(a) * r * 0.55, by + Math.sin(a) * r * 0.45, r * 0.09, { w: 0.7, c: K, passes: 1 }); } D.ol(cp, 1.3); },
      rosette: (x, y, r) => { D.white(D.circ(x, y, r, 28)); const n = Math.round(R(9, 14)); for (let k = 0; k < n; k++) { const a = k * TAU / n; D.ol(D.blobR(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.42, r * 0.17, a, 10, 0.03), 0.9); D.ln(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25, x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85, 0.4); } D.white(D.circ(x, y, r * 0.24, 16)); P.circle(x, y, r * 0.24, { w: 1, c: K, passes: 1 }); P.stipple(D.circ(x, y, r * 0.22, 14), Math.round(r * 3), { a: 0.9, r: 0.6, c: K }); },
      scales: (x, y, r) => { const p = D.blobR(x, y, r, r * 0.85, 0, 12, 0.14); D.white(p); for (let yy = y - r; yy < y + r; yy += 6) for (let xx = x - r + ((yy / 6) % 2 ? 3.5 : 0); xx < x + r; xx += 7) if (S.pip(D.shrink(p, x, y, 0.9), xx, yy)) P.arc(xx, yy, 3.6, 3.6, 0.15, Math.PI - 0.15, { w: 0.6, c: K, passes: 1 }); D.ol(p, 1.3); },
      maze: (x, y, r) => { const p = D.blobR(x, y, r, r * 0.9, 0, 12, 0.14); D.white(p); for (let yy = y - r; yy < y + r; yy += 5) for (let xx = x - r; xx < x + r; xx += 5) if (S.pip(D.shrink(p, x, y, 0.9), xx + 2.5, yy + 2.5)) { if (P.R() > 0.5) D.ln(xx, yy, xx + 5, yy + 5, 0.7); else D.ln(xx + 5, yy, xx, yy + 5, 0.7); } D.ol(p, 1.3); },
      curl: (x, y, r) => { const pts = []; for (let a = 0; a < 2.6 * TAU; a += 0.12) { const rr = r * (1 - a / (2.9 * TAU)); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr, rr]); } const L = [], Rr = []; pts.forEach(([px, py, rr], i) => { const q = pts[Math.min(pts.length - 1, i + 1)], o2 = pts[Math.max(0, i - 1)], tx = q[0] - o2[0], ty = q[1] - o2[1], l = Math.hypot(tx, ty) || 1, w = Math.max(1, rr * 0.16); L.push([px - ty / l * w, py + tx / l * w]); Rr.push([px + ty / l * w, py - tx / l * w]); }); const poly = L.concat(Rr.slice().reverse()); D.white(poly); D.ol(poly, 1.1); for (let i = 2; i < pts.length; i += 3) { D.ln(L[i][0], L[i][1], Rr[i][0], Rr[i][1], 0.5); P.dot(pts[i][0], pts[i][1], Math.max(0.6, pts[i][2] * 0.05), { c: K }); } },
      coral: (x, y, r) => { const br = (bx, by, a, len, w, d) => { const ex = bx + Math.cos(a) * len, ey = by + Math.sin(a) * len; P.line(bx, by, ex, ey, { w: w + 2, c: K, passes: 1, over: 0, rough: 0.2 }); P.line(bx, by, ex, ey, { w, c: Wh, passes: 1, over: 0, rough: 0.2 }); if (d <= 0 || len < 4) { D.white(D.circ(ex, ey, w * 0.9 + 1, 10)); P.circle(ex, ey, w * 0.9 + 1, { w: 0.9, c: K, passes: 1 }); P.dot(ex, ey, 0.8, { c: K }); return; } br(ex, ey, a - R(0.3, 0.7), len * 0.72, w * 0.72, d - 1); br(ex, ey, a + R(0.3, 0.7), len * 0.72, w * 0.72, d - 1); }; br(x, y + r * 0.8, -Math.PI / 2 + R(-0.3, 0.3), r * 0.55, Math.max(2.5, r * 0.14), 4); },
      fern: (x, y, r) => { const a0 = R(0, TAU), rib = []; for (let k = 0; k <= 20; k++) { const t2 = k / 20, a = a0 + t2 * 1.1; rib.push([x + Math.cos(a0) * (t2 - 0.5) * 2 * r + Math.cos(a + Math.PI / 2) * Math.sin(t2 * Math.PI) * r * 0.25, y + Math.sin(a0) * (t2 - 0.5) * 2 * r + Math.sin(a + Math.PI / 2) * Math.sin(t2 * Math.PI) * r * 0.25]); } P.path(rib, { w: 1.2, c: K, rough: 0.1, passes: 1 }); for (let k = 1; k < 20; k++) { const [px, py] = rib[k], q = rib[k + 1], a = Math.atan2(q[1] - py, q[0] - px), L = r * 0.34 * Math.sin(k / 20 * Math.PI); [-1, 1].forEach(sg => { const lp = P.sample([[px, py], [px + Math.cos(a + sg * 1.0) * L * 0.6 - Math.cos(a) * 1.5, py + Math.sin(a + sg * 1.0) * L * 0.6 - Math.sin(a) * 1.5], [px + Math.cos(a + sg * 0.75) * L, py + Math.sin(a + sg * 0.75) * L], [px + Math.cos(a + sg * 0.5) * L * 0.6 + Math.cos(a) * 1.5, py + Math.sin(a + sg * 0.5) * L * 0.6 + Math.sin(a) * 1.5]], true, 1.5); D.white(lp); D.ol(lp, 0.6); }); } },
      window: (x, y, r) => { const w = r * 0.62, h = r * 1.8, top = y - h / 2, bot = y + h / 2, arch = [[x - w, bot]]; for (let k = 0; k <= 16; k++) { const a = Math.PI + k * Math.PI / 16; arch.push([x + Math.cos(a) * w, top + w + Math.sin(a) * w]); } arch.push([x + w, bot]); D.white(arch); D.ol(arch, 1.4); D.black(D.shrink(arch, x, y + h * 0.05, 0.72)); D.dotRing(arch, x, y, 0.88, 5, 0.9); for (let k = 0; k < 5; k++) P.dot(x, top + w + k * h * 0.12, 1.2, { c: Wh, a: 1 }); D.white(P.sample([[x, bot - h * 0.3], [x + 4, bot - h * 0.18], [x, bot - h * 0.12], [x - 4, bot - h * 0.18]], true, 1.5)); },
      night: (x, y, r) => { const p = D.blobR(x, y, r, r * 0.9, 0, 11, 0.2); D.black(p); P.dots(Array.from({ length: Math.round(r * 1.3) }, () => { const a = R(0, TAU), d = Math.sqrt(R(0, 1)) * r * 0.8; return [x + Math.cos(a) * d, y + Math.sin(a) * d, R(0.4, 1.3)]; }), Wh, 1); D.ol(p, 1.2); },
      drips: (x, y, r) => { for (let k = -2; k <= 2; k++) { const dx = x + k * r * 0.34, L = r * R(0.6, 1.5); D.ln(dx, y - r, dx, y - r + L, 0.8); const ty = y - r + L, d = P.sample([[dx, ty - 4], [dx + 3.6, ty + 2], [dx, ty + 7], [dx - 3.6, ty + 2]], true, 1.5); D.white(d); D.ol(d, 0.9); } },
      stack: (x, y, r) => { let yy = y - r; while (yy < y + r) { const rr = R(3, r * 0.3), w = rr * R(1.2, 2); const e = D.circ(x, yy + rr, 1, 16).map(([px, py]) => [x + (px - x) * w, py + (py - yy - rr) * (rr - 1)]); D.white(e); D.ol(e, 1); if (P.R() > 0.5) P.hatch(e, { ang: 0, gap: 1.6, a: 0.8, w: 0.4, c: K }); yy += rr * 2 + 1; } },
      // a blob of any shape filled with one of the FILLS: the Automatic Doodle's cell
      cloud: (x, y, r) => D.cloud(x, y + r * 0.4, r * 2.2, r * 0.9),
      cell: (x, y, r, fill) => { const pts = D.blob(x, y, r, 9, 0.18); D.white(pts); D.fill(fill || pick(['echo', 'stipple', 'bubbles', 'night', 'hatch', 'scales', 'rays', 'eye', 'maze', 'cells']), pts, x, y, r); D.ol(pts, r > 40 ? 2 : 1.5); if (r > 26 && P.R() > 0.4) D.ol(D.shrink(pts, x, y, 1.1), 0.7); return pts; },
    };
    D.motif = (name, x, y, r, ...a) => (M[name] || M.puff)(x, y, r, ...a);
    D.BIG = ['puff', 'puff', 'eye', 'ripple', 'pod', 'cells', 'shell', 'honey', 'bands', 'mushroom', 'rosette', 'scales', 'maze', 'curl', 'coral', 'fern', 'window', 'night', 'drips', 'stack', 'puff', 'cells'];
    D.SMALL = ['puff', 'ripple', 'cells', 'eye', 'pod', 'bands', 'shell', 'night', 'puff', 'ripple'];

    /* ---------------- along a path you choose ----------------
       D.along(pts, step) resamples any centreline (a few control points are smoothed first) into evenly spaced stations:
       { x, y, s (distance from the start), t (0–1), tx, ty (unit tangent), nx, ny (unit normal, to the left) }.
       Use it to put things along a curve: suckers, windows, rivets, labels, buildings standing on its top edge. */
    D.along = (pts, step = 6, smooth = true) => { const C = smooth && pts.length < 40 ? P.sample(pts, false, 3) : pts, acc = [0]; for (let i = 1; i < C.length; i++) acc.push(acc[i - 1] + Math.hypot(C[i][0] - C[i - 1][0], C[i][1] - C[i - 1][1])); const L = acc[acc.length - 1], out = []; let j = 0;
      for (let s = 0; s <= L + 1e-6; s += step) { while (j < C.length - 2 && acc[j + 1] < s) j++; const f = (s - acc[j]) / ((acc[j + 1] - acc[j]) || 1), x = lerp(C[j][0], C[j + 1][0], f), y = lerp(C[j][1], C[j + 1][1], f), dx = C[j + 1][0] - C[j][0], dy = C[j + 1][1] - C[j][1], l = Math.hypot(dx, dy) || 1; out.push({ x, y, s, t: L ? s / L : 0, tx: dx / l, ty: dy / l, nx: -dy / l, ny: dx / l }); }
      return out; };
    // a tapered band along a chosen path: { poly, L (left edge), R (right edge), st (stations) }; w(t) or w0 → w1
    D.band = (pts, w0, w1 = w0, step = 6) => { const st = D.along(pts, step), wf = typeof w0 === 'function' ? w0 : t => lerp(w0, w1, t), L = st.map(q => [q.x + q.nx * wf(q.t), q.y + q.ny * wf(q.t)]), Rr = st.map(q => [q.x - q.nx * wf(q.t), q.y - q.ny * wf(q.t)]); return { poly: L.concat(Rr.slice().reverse()), L, R: Rr, st }; };
    /* a doodled cloud: round puffs on a flat base, white, inked, with a little shade under each puff */
    D.cloud = (x, y, w, h = w * 0.45, o2 = {}) => { const n = o2.puffs ?? Math.max(3, Math.round(w / (h * 0.62))), puffs = [];
      for (let i = 0; i < n; i++) { const u = n === 1 ? 0.5 : i / (n - 1), r = h * (0.38 + 0.42 * Math.sin(Math.PI * (0.1 + 0.8 * u))) * R(0.88, 1.08), x0 = x - w / 2 + r, x1 = x + w / 2 - r; puffs.push([lerp(x0, x1, u), y - r * 0.55, r]); }
      const inOther = (px, py, k) => puffs.some(([qx, qy, qr], m) => m !== k && Math.hypot(px - qx, py - qy) < qr - 0.1);
      // knock out the paper: each puff above the base line
      puffs.forEach(([px, py, r]) => D.white(D.circ(px, py, r, 40).map(([qx, qy]) => [qx, Math.min(qy, y)])));
      // the outline: only the arcs of each puff that are not inside another puff and above the base
      puffs.forEach(([px, py, r], k) => { let run = []; const flush = () => { if (run.length > 2) P.path(run, { w: o2.w ?? 1.3, c: K, passes: 1, rough: 0.2 }); run = []; };
        for (let q = 0; q <= 240; q++) { const a = Math.PI - 1.2 + q / 240 * (Math.PI + 2.4), qx = px + Math.cos(a) * r, qy = py + Math.sin(a) * r; if (qy > y || inOther(qx, qy, k)) flush(); else run.push([qx, qy]); } flush();
        // a little shade: a short inner arc on the side away from the light (lower right)
        if (o2.shade !== false && r > 8) P.arc(px, py, r * 0.7, r * 0.7, -0.25, 0.6, { w: 0.6, c: K, passes: 1, rough: 0.15, a: 0.7 }); });
      const xl = puffs[0][0] - Math.sqrt(Math.max(0, puffs[0][2] ** 2 - (y - puffs[0][1]) ** 2)), xr = puffs[n - 1][0] + Math.sqrt(Math.max(0, puffs[n - 1][2] ** 2 - (y - puffs[n - 1][1]) ** 2));
      P.line(xl, y, xr, y, { w: o2.w ?? 1.3, c: K, passes: 1, over: 0, rough: 0.3 });
      return puffs; };

    /* ---------------- things that wander: tentacles, tendrils, spires ---------------- */
    // a wandering path from (x, y): returns its points; stop(x, y) ends it early
    D.wander = (x, y, a, len, o2 = {}) => { const pts = [[x, y]], step = o2.step ?? 6; let curl = o2.curl ?? R(-0.06, 0.06); for (let s = 0; s < len; s += step) { a += curl + R(-(o2.jit ?? 0.05), o2.jit ?? 0.05); curl *= o2.grow ?? 1.03; x += Math.cos(a) * step; y += Math.sin(a) * step; if (o2.stop && o2.stop(x, y)) break; pts.push([x, y]); } return pts; };
    // a tapered, banded tentacle (white ribbon, ink rim, every other band filled)
    // o2.path: give the centreline yourself (a few control points) instead of letting it wander
    D.tentacle = (x0, y0, ang, len, w0, o2 = {}) => { const C = o2.path ? D.along(o2.path, 8).map(q => [q.x, q.y]) : D.wander(x0, y0, ang, len, Object.assign({ step: 8, curl: R(-0.09, 0.09), grow: 1.04 }, o2)); if (C.length < 5) return null; const rb = D.ribbon(C, w0 + 1, 1), Lf = rb.L, Rg = rb.R; D.white(rb.poly); D.ol(rb.poly, 1.4); const dark = o2.dark ?? P.R() > 0.5; for (let i = 1; i < C.length - 1; i += 2) { D.ln(Lf[i][0], Lf[i][1], Rg[i][0], Rg[i][1], 0.8); if (dark && i % 4 === 1 && i + 2 < C.length) D.black([Lf[i], Lf[i + 1], Rg[i + 1], Rg[i]]); } P.dot(C[C.length - 1][0], C[C.length - 1][1], 1.8, { c: K }); return C; };
    // five kinds of tendril along a path: 0 plain with a drop, 1 bead chain, 2 striped feeler, 3 double line ending in an eye, 4 barbed
    D.tendril = (pts, kind = 0) => { if (pts.length < 3) return; const end = pts[pts.length - 1];
      if (kind === 0) { P.path(pts, { w: 1, c: K, rough: 0.2, passes: 1 }); const d = P.sample([[end[0], end[1] - 4], [end[0] + 4, end[1] + 2], [end[0], end[1] + 8], [end[0] - 4, end[1] + 2]], true, 1.5); D.white(d); D.ol(d, 1); }
      else if (kind === 1) pts.forEach(([px, py], k) => { if (k % 2) return; const rr = 4.5 * (1 - k / pts.length) + 1.2; D.white(D.circ(px, py, rr, 10)); P.circle(px, py, rr, { w: 0.9, c: K, passes: 1 }); P.dot(px, py, rr * 0.3, { c: K }); });
      else if (kind === 2) { const rb = D.ribbon(pts, 8, 1); D.white(rb.poly); D.ol(rb.poly, 1.1); for (let k = 1; k < pts.length - 1; k += 2) { D.ln(rb.L[k][0], rb.L[k][1], rb.R[k][0], rb.R[k][1], 0.7); if (k % 4 === 1 && k + 2 < pts.length) D.black([rb.L[k], rb.L[k + 1], rb.R[k + 1], rb.R[k]]); } }
      else if (kind === 3) { P.path(pts, { w: 0.7, c: K, rough: 0.2, passes: 1 }); P.path(pts.map(([px, py]) => [px + 2.4, py + 1]), { w: 0.7, c: K, rough: 0.2, passes: 1 }); pts.forEach(([px, py], k) => { if (k % 3 === 0) P.dot(px + 1.2, py + 0.5, 1, { c: K }); }); D.white(D.circ(end[0], end[1], 6, 14)); P.circle(end[0], end[1], 6, { w: 1.1, c: K, passes: 1 }); P.circle(end[0], end[1], 2.5, { w: 0.8, c: K, passes: 1 }); }
      else { P.path(pts, { w: 1.2, c: K, rough: 0.2, passes: 1 }); for (let k = 2; k < pts.length; k += 3) { const [px, py] = pts[k], q = pts[k - 1], a2 = Math.atan2(py - q[1], px - q[0]) + Math.PI / 2; D.ln(px, py, px + Math.cos(a2) * 5, py + Math.sin(a2) * 5, 0.7); P.dot(px + Math.cos(a2) * 5.5, py + Math.sin(a2) * 5.5, 1.1, { c: K }); } } };
    // a beaded spire rising from (bx, by) to height h
    D.spire = (bx, by, h) => { const top = by - h; D.ln(bx, by, bx, top, 1.3); let yy = by - 10, k2 = 0; while (yy > top + 12) { const s = pick([0, 1, 2]); if (s === 0) { D.white(D.circ(bx, yy, 5.5, 12)); P.circle(bx, yy, 5.5, { w: 1, c: K, passes: 1 }); P.dot(bx, yy, 1.8, { c: K }); } else if (s === 1) { const d = [[bx, yy - 7], [bx + 5, yy], [bx, yy + 7], [bx - 5, yy]]; D.white(d); P.poly(d, { w: 1, c: K, passes: 1, over: 0 }); if (k2 % 2) D.black(D.shrink(d, bx, yy, 0.5)); } else { P.rect(bx - 3.5, yy - 5, 7, 10, { w: 0.9, c: K, passes: 1, over: 0 }); D.ln(bx - 3.5, yy, bx + 3.5, yy, 0.6); } yy -= 15; k2++; } const tip = [[bx, top - 18], [bx + 6, top], [bx, top + 4], [bx - 6, top]]; D.white(tip); P.poly(tip, { w: 1.1, c: K, passes: 1, over: 0 }); P.dot(bx, top - 5, 1.4, { c: K }); };

    /* ---------------- packing: circles that must not overlap, on a grid for speed ---------------- */
    D.packer = (cell = 40) => { const grid = new Map(), key = (i, j) => i * 100003 + j, all = [];
      const add = (x, y, r) => { all.push([x, y, r]); const i0 = Math.floor((x - r) / cell), i1 = Math.floor((x + r) / cell), j0 = Math.floor((y - r) / cell), j1 = Math.floor((y + r) / cell); for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const k = key(i, j); if (!grid.has(k)) grid.set(k, []); grid.get(k).push([x, y, r]); } };
      const free = (x, y, r, pad = 2, reach = 80) => { const i0 = Math.floor((x - r - reach) / cell), i1 = Math.floor((x + r + reach) / cell), j0 = Math.floor((y - r - reach) / cell), j1 = Math.floor((y + r + reach) / cell); for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const L = grid.get(key(i, j)); if (L) for (const [a, b, c] of L) if (Math.hypot(x - a, y - b) < c + r + pad) return false; } return true; };
      return { add, free, all }; };

    /* ---------------- growth engine 1: budding — one seed shape, children bud off parents until the page is full ----------------
       opts: seed [x, y, r], first (fill of the seed), bounds [x0, y0, x1, y1], fills (list), tentacles (0–1 chance), gaps (fill leftovers) */
    D.bud = (opts = {}) => { const B = opts.bounds || [70, 60, 1530, 940], pk = D.packer(), fills = opts.fills || ['echo', 'stipple', 'bubbles', 'night', 'hatch', 'scales', 'rays', 'eye', 'maze', 'cells', 'echo', 'bubbles', 'night', 'stipple'], tc = opts.tentacles ?? 0.2;
      const inB = (x, y, r) => x - r > B[0] && x + r < B[2] && y - r > B[1] && y + r < B[3], ok = opts.inside || (() => true), free = (x, y, r, pad = 3) => inB(x, y, r) && ok(x, y, r) && pk.free(x, y, r, pad, 200);
      const place = (x, y, r, f) => { M.cell(x, y, r, f || pick(fills)); pk.add(x, y, r * 1.2); };
      const tent = (x, y, a, len, w) => { const C = D.tentacle(x, y, a, len, w, { stop: (px, py) => !inB(px, py, 0) }); if (C) C.forEach((p, i) => { if (i % 3 === 0) pk.add(p[0], p[1], w * (1 - i / C.length) + 3); }); };
      const [sx, sy, sr] = opts.seed || [800, 500, 110]; place(sx, sy, sr, opts.first || 'eye');
      const queue = [[sx, sy, sr]]; let guard = 0;
      while (queue.length && guard++ < (opts.limit ?? 900)) { const [px, py, pr] = queue.shift(); for (let k = 0; k < 40; k++) { const a = R(0, TAU), r = Math.max(9, pr * R(0.35, 0.85)), d = pr * 1.2 + r * 1.2 + R(2, 5), x = px + Math.cos(a) * d, y = py + Math.sin(a) * d; if (!free(x, y, r)) continue; place(x, y, r); if (r > 14) queue.push([x, y, r]); if (P.R() < tc && r > 16) tent(x + Math.cos(a) * r, y + Math.sin(a) * r, a + R(-0.6, 0.6), R(90, 260), R(6, 12)); } }
      (opts.second ?? [70, 52, 38, 28, 20, 14, 10]).forEach(r0 => { for (let i = 0; i < 900; i++) { const r = r0 * R(0.85, 1.15), x = R(B[0] + 10, B[2] - 10), y = R(B[1] + 10, B[3] - 10); if (!free(x, y, r * 1.2)) continue; place(x, y, r); if (r > 22 && P.R() < tc) tent(x + r, y, R(0, TAU), R(80, 200), R(5, 10)); } });
      if (opts.gaps !== false) for (let i = 0; i < 2500; i++) { const x = R(B[0] + 5, B[2] - 5), y = R(B[1] + 5, B[3] - 5), r = R(2, 7); if (!free(x, y, r, 2)) continue; if (P.R() > 0.4) P.circle(x, y, r, { w: 0.8, passes: 1, c: K }); else P.dot(x, y, r * 0.5, { c: K }); pk.add(x, y, r); }
      return pk; };

    /* ---------------- growth engine 2: packing a region — motifs largest first into any shape, dark zones, escaping tendrils ----------------
       opts: inside(x, y, pad) → true inside the mass; bounds; dark(x, y) → true in solid-black zones (draw them first with D.black);
             schedule [[r, tries], …]; big / small motif lists; edge(x, y) → 0–1 closeness to the rim, for tendrils; haze (stipple) */
    D.grow = (opts = {}) => { const B = opts.bounds || [80, 70, 1520, 930], pk = opts.packer || D.packer(), inside = opts.inside || (() => true), dark = opts.dark || (() => false), big = opts.big || D.BIG, small = opts.small || D.SMALL;
      // inside(x, y, pad): by default pad = 0.35·r, so big motifs may spill a little over the rim (organic). fit: true asks
      // inside(x, y, 1.1·r) instead, so every motif stays wholly inside the shape.
      const pad = r => opts.fit ? r * 1.1 : r * 0.35;
      (opts.schedule || [[58, 80], [46, 200], [36, 400], [28, 700], [21, 1100], [16, 1700], [12, 2600], [9, 3600], [6, 5000], [4, 6000], [2.6, 7000]]).forEach(([r0, tries]) => {
        for (let i = 0; i < tries * 14; i++) { const r = r0 * R(0.8, 1.2), x = R(B[0], B[2]), y = R(B[1], B[3]); if (!inside(x, y, pad(r)) || !pk.free(x, y, r)) continue; pk.add(x, y, r);
          if (r0 <= 6 || (r0 <= 9 && P.R() > 0.6)) { if (dark(x, y)) { if (P.R() > 0.4) P.dot(x, y, r * 0.45, { c: Wh, a: 1 }); else { D.white(D.circ(x, y, r, 10)); P.circle(x, y, r, { w: 0.8, c: K, passes: 1 }); P.dot(x, y, r * 0.3, { c: K }); } } else { if (P.R() > 0.5) P.circle(x, y, r, { w: 0.8, c: K, passes: 1 }); else P.dot(x, y, r * 0.5, { c: K }); } continue; }
          let kind = r0 >= 12 ? pick(big) : pick(small); for (let t = 0; t < 8 && dark(x, y) && ['drips', 'night', 'fern', 'coral'].includes(kind); t++) kind = pick(big); D.motif(kind, x, y, r); if (r > 24 && !opts.fit && P.R() > 0.55) D.ol(D.circ(x, y, r * 1.08, 24), 0.5); } });
      if (opts.haze !== false) { const d2 = [], w2 = []; for (let i = 0; i < 26000 && d2.length < 5200; i++) { const x = R(B[0] - 10, B[2] + 10), y = R(B[1] - 10, B[3] + 10); if (!inside(x, y, -6) || !pk.free(x, y, 0.6, 0.3)) continue; (dark(x, y) ? w2 : d2).push([x, y, R(0.35, 0.9)]); } P.dots(d2, K, 0.85); P.dots(w2, Wh, 1); }
      return pk; };

    // a ready-made silhouette: the union of wobbly lobes; returns { inside(x, y, pad), field(x, y), lobes }
    D.mass = (lobes, wob = 1) => { const field = (x, y) => { let m = -1e9; for (const [cx, cy, r] of lobes) m = Math.max(m, r - Math.hypot(x - cx, y - cy)); return m + wob * (18 * Math.sin(x * 0.021 + y * 0.013) + 12 * Math.sin(x * 0.047 - y * 0.031)); }; return { lobes, field, inside: (x, y, pad = 0) => field(x, y) > pad }; };

    return D;
  }

  g.SketchDoodle = { kit };
})(window);
