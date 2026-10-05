/* SHEET 5 — THE CLOCKWORK COURTIER: an automaton drawn as the board layout of a clockwork mind.
   Primary look: hand-inked PCB (black ink, red/green trace bundles, hatched chips, blue construction lines),
   with orthographic side view + circled callouts (pencil-sheet), a gear-ratio construction, and blue-ink steam clouds. */
(window.SCENES = window.SCENES || []).push({
  name: 'Mechanical Robot', seed: 53, ink: '#1b1b1f', theme: 'pcb',
  build(P, n, t) {
    const S = Sketch, TAU = S.TAU, PI = Math.PI, lerp = S.lerp;
    const K = '#1b1b1f', RED = '#c0392b', GRN = '#1e8a5a', BLU = '#4a5fd0', STM = '#1c3f94';
    const CX = 460, GY = 872;

    /* ------------------------------------------------ small helpers */
    const circPoly = (x, y, r, k = 22) => { const o = []; for (let i = 0; i < k; i++) o.push([x + Math.cos(i * TAU / k) * r, y + Math.sin(i * TAU / k) * r]); return o; };
    const rectPoly = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const dotsAt = (arr, r = 1.1, a = 0.85, c) => P.dots(arr.map(p => [p[0], p[1], r]), c, a);
    const rivets = (a, b, k, r = 1.1) => { const d = []; for (let i = 0; i <= k; i++) d.push([lerp(a[0], b[0], i / k), lerp(a[1], b[1], i / k)]); dotsAt(d, r); };
    const lit = (cx, cy, s, b = 0.3) => (x, y) => Math.max(0, Math.min(1, ((x - cx) * 0.75 + (y - cy) * 0.45) / s + b));
    const hx = (poly, o = {}) => { const oo = Object.assign({ ang: -50, gap: 2.3, a: 0.55, w: 0.55 }, o); oo.a = Math.min(0.92, oo.a * 1.4); oo.w = oo.w * 1.2; P.hatch(poly, oo); };
    const shade = (poly, cx, cy, s, o = {}) => hx(poly, Object.assign({ fade: lit(cx, cy, s, o.b ?? 0.62), piece: 9 }, o));
    const tx = (s, x, y, size = 12, o = {}) => P.text(s, x, y, Object.assign({ size, a: 0.85 }, o));
    const ln = (x1, y1, x2, y2, w = 1, o = {}) => P.line(x1, y1, x2, y2, Object.assign({ w, passes: 1, over: 0, rough: 0.25 }, o));
    const ring = (x, y, r, w = 1, o = {}) => P.circle(x, y, r, Object.assign({ w, passes: 1, rough: 0.2 }, o));
    const eraseC = (x, y, r) => P.erase(circPoly(x, y, r, 20));
    const bg = (x1, y1, x2, y2, o = {}) => P.guide(x1, y1, x2, y2, Object.assign({ c: BLU, a: 0.5, w: 0.8, rough: 1.1, over: 10 }, o));
    const pal = (i) => (i % 2 ? GRN : RED);

    /* toothed gear outline as one freehand loop + rim, hub, spokes and optional shading */
    const gear = (cx, cy, r, z, rot = 0, o = {}) => {
      const st = TAU / z, pts = [], rt = o.root ?? 0.8;
      for (let i = 0; i < z; i++) { const a = rot + i * st; for (const [f, k] of [[0, rt], [0.1, 1], [0.4, 1], [0.5, rt]]) pts.push([cx + Math.cos(a + st * f) * r * k, cy + Math.sin(a + st * f) * r * k]); }
      if (o.erase) P.erase(circPoly(cx, cy, r * 1.02, 18));
      P.path(pts, { closed: true, w: o.w ?? (r > 14 ? 1.2 : 0.95), rough: 0.3, passes: 1 });
      if (o.body !== false) {
        if (r > 6) ring(cx, cy, r * 0.6, 0.7);
        ring(cx, cy, Math.max(1.6, r * 0.17), 0.9);
        const sp = o.spokes ?? (r > 12 ? 5 : 3);
        if (r > 6) for (let i = 0; i < sp; i++) { const a = rot + 0.4 + i * TAU / sp; ln(cx + Math.cos(a) * r * 0.17, cy + Math.sin(a) * r * 0.17, cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6, 0.8); }
        if (r <= 6) P.dot(cx, cy, 0.9);
      }
      if (o.shade !== false && r >= 8) shade(circPoly(cx, cy, r * 0.82, 16), cx, cy, r, { gap: o.gap ?? (r > 30 ? 3 : 2.4), a: 0.5, w: 0.45, piece: 6 });
    };
    const meshPt = (g, ang, r2, k = 1) => [g[0] + Math.cos(ang) * (g[2] + r2) * k, g[1] + Math.sin(ang) * (g[2] + r2) * k, r2];
    /* two rails and cross links following a path: roller chain */
    const chain = (pts, closed, half = 1.7, step = 4.2, w = 0.8, cc) => {
      const Sm = P.sample(pts, closed, 2.2), m = Sm.length, A = [], B = [];
      for (let i = 0; i < m; i++) { const a = Sm[Math.max(0, i - 1)], b = Sm[Math.min(m - 1, i + 1)]; let tx2 = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx2, ty) || 1; tx2 /= l; ty /= l; A.push([Sm[i][0] - ty * half, Sm[i][1] + tx2 * half]); B.push([Sm[i][0] + ty * half, Sm[i][1] - tx2 * half]); }
      P.path(A, { w, rough: 0.2, passes: 1, closed: false, c: cc }); P.path(B, { w, rough: 0.2, passes: 1, closed: false, c: cc });
      let acc = 0;
      for (let i = 1; i < m; i++) { acc += Math.hypot(Sm[i][0] - Sm[i - 1][0], Sm[i][1] - Sm[i - 1][1]); if (acc >= step) { acc = 0; ln(A[i][0], A[i][1], B[i][0], B[i][1], 0.6, { rough: 0.1, c: cc }); } }
    };
    /* coil spring drawn as one looped stroke */
    const coil = (a, b, turns, amp, w = 0.9, cc) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], Ln = Math.hypot(dx, dy), ux = dx / Ln, uy = dy / Ln, nx = -uy, ny = ux, N = Math.max(12, Math.round(turns * 12)), pts = [];
      for (let i = 0; i <= N; i++) { const q = i / N, ph = q * turns * TAU, al = q * Ln - amp * 0.9 * Math.cos(ph), pe = amp * Math.sin(ph); pts.push([a[0] + ux * al + nx * pe, a[1] + uy * al + ny * pe]); }
      P.path(pts, { w, rough: 0.2, passes: 1, c: cc });
    };
    const spiral = (cx, cy, r0, r1, turns, w = 0.8) => { const pts = [], N = Math.round(turns * 18); for (let i = 0; i <= N; i++) { const q = i / N, a = q * turns * TAU, r = lerp(r0, r1, q); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } P.path(pts, { w, rough: 0.15, passes: 1 }); };
    const ball = (cx, cy, r, o = {}) => {
      eraseC(cx, cy, r + 0.5);
      P.circle(cx, cy, r, { w: 1.6 }); ring(cx, cy, r * 0.66, 0.8);
      if (o.gear) gear(cx, cy, r * 0.55, Math.max(7, Math.round(r * 0.6)), o.rot ?? 0.3, { w: 0.85, shade: false, spokes: 4 });
      else { ln(cx - r * 0.66, cy, cx + r * 0.66, cy, 0.7, { rough: 0.1 }); ln(cx, cy - r * 0.66, cx, cy + r * 0.66, 0.7, { rough: 0.1 }); P.dot(cx, cy, 1.4); }
      shade(circPoly(cx, cy, r, 18), cx, cy, r, { gap: 2.3, a: 0.5, w: 0.45, piece: 6, b: 0.6 });
      if (o.pin) { ln(cx - r - 6, cy, cx + r + 6, cy, 1.4); P.dot(cx - r - 6, cy, 2.2); P.dot(cx + r + 6, cy, 2.2); }
    };
    /* tapered plated tube; returns p(t,s) mapper */
    const tube = (a, b, w0, w1, o = {}) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], Ln = Math.hypot(dx, dy), ux = dx / Ln, uy = dy / Ln, nx = -uy, ny = ux;
      const p = (q, s) => [a[0] + dx * q + nx * s * lerp(w0, w1, q), a[1] + dy * q + ny * s * lerp(w0, w1, q)];
      const poly = [p(0, -1), p(1, -1), p(1, 1), p(0, 1)];
      P.erase(poly);
      ln(...p(0, -1), ...p(1, -1), 1.7, { rough: 0.35, passes: 2 }); ln(...p(0, 1), ...p(1, 1), 1.7, { rough: 0.35, passes: 2 });
      (o.bands || []).forEach(q => {
        const m = p(q, 0); P.curve([p(q, -1), [m[0] + ux * 4, m[1] + uy * 4], p(q, 1)], { w: 1.1, rough: 0.25 });
        const m2 = p(q + 0.035, 0); P.curve([p(q + 0.035, -1), [m2[0] + ux * 3, m2[1] + uy * 3], p(q + 0.035, 1)], { w: 0.5, a: 0.6, rough: 0.2, passes: 1 });
      });
      const sgn = nx > 0 ? 1 : -1, ang = Math.atan2(dy, dx) * 180 / PI;
      if (!o.noShade) hx(poly, { ang, gap: 2.4, a: 0.5, w: 0.45, fade: (x, y) => { const s = ((x - a[0]) * nx + (y - a[1]) * ny) * sgn / lerp(w0, w1, 0.5); return Math.max(0, Math.min(1, (s + 0.55) / 1.1)); }, piece: 12, over: 0.2 });
      const d = []; (o.rivets || []).forEach(q => { d.push([...p(q, -0.74), 1.1]); d.push([...p(q, 0.74), 1.1]); }); if (d.length) P.dots(d, null, 0.85);
      return p;
    };
    /* cutaway window in a limb: gear train on the axis, chain rail, coil spring / weight */
    const guts = (p, q0, q1, o = {}) => {
      const win = [p(q0, -0.8), p(q1, -0.8), p(q1, 0.8), p(q0, 0.8)];
      P.erase(win); P.poly(win, { w: 1.3, rough: 0.25, over: 0, passes: 1 });
      const win2 = [p(q0 + 0.02, -0.7), p(q1 - 0.02, -0.7), p(q1 - 0.02, 0.7), p(q0 + 0.02, 0.7)]; P.poly(win2, { w: 0.5, a: 0.5, rough: 0.2, over: 0, passes: 1 });
      hx(win, { ang: 45, gap: 5, a: 0.17, w: 0.4 });
      const A = p(q0, 0), B = p(q1, 0), Ln = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / Ln, uy = (B[1] - A[1]) / Ln, nx = -uy, ny = ux;
      const hw = Math.hypot(p(q0, 0.8)[0] - A[0], p(q0, 0.8)[1] - A[1]);
      const rs = o.rs || [0.66, 0.44, 0.6, 0.4, 0.62, 0.42], cs = [];
      let d = hw * rs[0] + 4, i = 0;
      while (true) { const r = hw * rs[i % rs.length]; if (d + r > Ln - 3) break; const c = [A[0] + ux * d, A[1] + uy * d]; cs.push([c[0] + nx * (o.off || 0), c[1] + ny * (o.off || 0), r]); d += r + hw * rs[(i + 1) % rs.length] + 1; i++; }
      cs.forEach((c, k) => gear(c[0], c[1], c[2], Math.max(8, Math.round(c[2] * 1.05)), k * 0.35 + (o.rot || 0), { w: 0.9, spokes: 4, shade: c[2] > 8 }));
      const side = o.side ?? 1;
      const c0 = [A[0] + nx * hw * 0.63 * side + ux * 5, A[1] + ny * hw * 0.63 * side + uy * 5], c1 = [B[0] + nx * hw * 0.63 * side - ux * 5, B[1] + ny * hw * 0.63 * side - uy * 5];
      if (o.chain !== false) { chain([c0, c1], false, 1.5, 4, 0.9, o.ccol); ring(c0[0], c0[1], 3.6, 0.8); ring(c1[0], c1[1], 3.6, 0.8); P.dot(c0[0], c0[1], 0.9); P.dot(c1[0], c1[1], 0.9); }
      if (o.spring !== false) { const e0 = [A[0] - nx * hw * 0.63 * side + ux * 6, A[1] - ny * hw * 0.63 * side + uy * 6], e1 = [B[0] - nx * hw * 0.63 * side - ux * 6, B[1] - ny * hw * 0.63 * side - uy * 6]; coil(e0, e1, Math.max(3, Ln / 9), 3.2, 0.95, o.scol); }
      return cs;
    };

    /* ------------------------------------------------ chips, pins, connectors */
    const pinRun = (x, y, dx, dy, k, pitch, len, nx, ny, pad) => {
      for (let i = 0; i < k; i++) { const px = x + dx * pitch * i, py = y + dy * pitch * i; ln(px, py, px + nx * len, py + ny * len, 1, { rough: 0.15 }); if (pad) ring(px + nx * len, py + ny * len, pad, 0.8, { rough: 0.1 }); }
    };
    const endPt = (x, y, w, h, off, pitch, PL) => (side, i0, k) => {
      const c = off + (i0 + (k - 1) / 2) * pitch;
      return side === 'R' ? [x + w + PL, y + c] : side === 'L' ? [x - PL, y + c] : side === 'B' ? [x + c, y + h + PL] : [x + c, y - PL];
    };
    /* square QFP with nested rings, sunburst window and pins on 4 sides */
    const qfp = (x, y, s, o = {}) => {
      const pitch = 6, m = Math.floor((s - 16) / pitch), off = (s - (m - 1) * pitch) / 2, PL = 8;
      P.erase(rectPoly(x - 1, y - 1, s + 2, s + 2));
      hx(rectPoly(x, y, s, s), { ang: -50, gap: 2.3, a: 0.56, w: 0.5 });
      P.erase(rectPoly(x + 11, y + 11, s - 22, s - 22));
      P.rect(x, y, s, s, { w: 2.5, rough: 0.3, over: 0.8 });
      P.rect(x + 5, y + 5, s - 10, s - 10, { w: 0.9, a: 0.8, rough: 0.2, over: 0, passes: 1 });
      P.rect(x + 11, y + 11, s - 22, s - 22, { w: 1.6, rough: 0.25, over: 0.4 });
      const c = [x + s / 2, y + s / 2], h1 = s * 0.17, h2 = s / 2 - 16;
      P.rect(x + 16, y + 16, s - 32, s - 32, { w: 0.6, a: 0.7, rough: 0.2, over: 0, passes: 1 });
      const NR = o.rays ?? 40;
      for (let i = 0; i < NR; i++) { const a = i * TAU / NR + 0.03, k = 1 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))); ln(c[0] + Math.cos(a) * h1 * k, c[1] + Math.sin(a) * h1 * k, c[0] + Math.cos(a) * h2 * k, c[1] + Math.sin(a) * h2 * k, 0.5, { a: 0.7, rough: 0.15 }); }
      P.erase(rectPoly(c[0] - h1, c[1] - h1, h1 * 2, h1 * 2));
      P.rect(c[0] - h1, c[1] - h1, h1 * 2, h1 * 2, { w: 1.4, rough: 0.2, over: 0.3 });
      hx(rectPoly(c[0] - h1, c[1] - h1, h1 * 2, h1 * 2), { ang: 40, gap: 2, a: 0.6, w: 0.45, cross: 90 });
      if (o.mark) o.mark(c, h1);
      P.dot(x + 12, y + 12, 1.6); ring(x + 7.5, y + 7.5, 2.6, 0.8);
      pinRun(x + off, y, 1, 0, m, pitch, -PL, 0, 1, 0); pinRun(x + off, y + s, 1, 0, m, pitch, PL, 0, 1, 0);
      pinRun(x, y + off, 0, 1, m, pitch, -PL, 1, 0, 0); pinRun(x + s, y + off, 0, 1, m, pitch, PL, 1, 0, 0);
      return { pt: endPt(x, y, s, s, off, pitch, PL), c };
    };
    /* DIP: body hatched, pins with pad rings on the long sides. vertical=true: pins left/right */
    const dip = (x, y, w, h, o = {}) => {
      const vert = h >= w, pitch = 6, PL = 8, len = vert ? h : w, m = Math.floor((len - 10) / pitch), off = (len - (m - 1) * pitch) / 2;
      P.erase(rectPoly(x - 1, y - 1, w + 2, h + 2));
      hx(rectPoly(x, y, w, h), { ang: o.ang ?? -55, gap: o.gap ?? 2.2, a: 0.58, w: 0.5, cross: o.cross });
      P.rect(x, y, w, h, { w: 2.1, rough: 0.25, over: 0.6 });
      if (vert) { P.arc(x + w / 2, y, 4.5, 4.5, 0, PI, { w: 1, passes: 1 }); pinRun(x, y + off, 0, 1, m, pitch, -PL, 1, 0, 2.2); pinRun(x + w, y + off, 0, 1, m, pitch, PL, 1, 0, 2.2); }
      else { P.arc(x, y + h / 2, 4.5, 4.5, -PI / 2, PI / 2, { w: 1, passes: 1 }); pinRun(x + off, y, 1, 0, m, pitch, -PL, 0, 1, 2.2); pinRun(x + off, y + h, 1, 0, m, pitch, PL, 0, 1, 2.2); }
      return { pt: endPt(x, y, w, h, off, pitch, PL + 2.2), m };
    };
    /* card-edge connector: hatched fingers */
    const fingers = (x0, x1, y0, y1, pitch) => {
      const xs = [];
      for (let x = x0; x + pitch - 3 <= x1; x += pitch) { const r = rectPoly(x, y0, pitch - 3, y1 - y0); P.erase(r); P.rect(x, y0, pitch - 3, y1 - y0, { w: 1.5, rough: 0.2, over: 0.2, passes: 1 }); hx(r, { ang: -60, gap: 2.4, a: 0.55, w: 0.45 }); xs.push(x + (pitch - 3) / 2); }
      return xs;
    };
    /* tiny SMD-like passive: pair of pads with a body */
    const smd = (x, y, vert = false) => { const w = vert ? 5 : 9, h = vert ? 9 : 5; P.rect(x, y, w, h, { w: 0.9, rough: 0.15, over: 0, passes: 1 }); if (vert) { P.rect(x, y, w, 2.2, { w: 0.7, passes: 1, over: 0 }); P.rect(x, y + h - 2.2, w, 2.2, { w: 0.7, passes: 1, over: 0 }); } else { P.rect(x, y, 2.2, h, { w: 0.7, passes: 1, over: 0 }); P.rect(x + w - 2.2, y, 2.2, h, { w: 0.7, passes: 1, over: 0 }); } };
    /* spring-resistor glyph: leads, tube body with bands and a little coil */
    const resistor = (x, y, len, o = {}) => {
      ln(x, y, x + 6, y, 1); const bx = x + 6, bl = len - 12;
      P.rrect(bx, y - 4, bl, 8, 3, { w: 1.1, passes: 1 });
      hx(rectPoly(bx + 1, y - 3, bl - 2, 6), { ang: 60, gap: 2, a: 0.5, w: 0.45, fade: (px) => (px - bx) / bl, piece: 5 });
      ln(bx + bl * 0.3, y - 4, bx + bl * 0.3, y + 4, 0.8); ln(bx + bl * 0.7, y - 4, bx + bl * 0.7, y + 4, 0.8);
      ln(x + len - 6, y, x + len, y, 1); ring(x, y, 2.2, 0.8); ring(x + len, y, 2.2, 0.8);
    };
    const xmark = (x, y, c, s = 5) => { ln(x - s, y - s, x + s, y + s, 1.3, { c, rough: 0.3 }); ln(x - s, y + s, x + s, y - s, 1.3, { c, rough: 0.3 }); };
    const tag = (x, y, dx, dy, c) => { ring(x, y, 2.2, 0.9, { c }); P.pl([[x, y], [x + dx, y + dy * 0], [x + dx, y + dy]], { w: 1, c, over: 0, passes: 1, rough: 0.25 }); xmark(x + dx + (dx > 0 ? 6 : -6), y + dy + (dy > 0 ? 6 : -6), c, 4); };

    /* ================================================== BOARD FURNITURE ================================================== */
    P.rrect(56, 56, 1488, 896, 28, { w: 2.4, a: 0.95, rough: 0.3 });
    P.rrect(64, 64, 1472, 880, 22, { w: 0.6, a: 0.5, passes: 1, rough: 0.3 });
    P.ruler(84, 64, 1516, 64, 8, 5, { side: 1, len: 6, a: 0.6, w: 0.5 });
    P.ruler(64, 90, 64, 912, 8, 5, { side: -1, len: 6, a: 0.6, w: 0.5 });
    P.ruler(1536, 90, 1536, 912, 8, 5, { side: 1, len: 6, a: 0.6, w: 0.5 });
    P.ruler(84, 944, 268, 944, 8, 5, { side: -1, len: 6, a: 0.6, w: 0.5 });
    P.ruler(1424, 944, 1480, 944, 8, 5, { side: -1, len: 6, a: 0.6, w: 0.5 });
    // mounting holes (double ring)
    [[92, 92], [1508, 92], [92, 916], [1508, 916]].forEach(([x, y]) => { P.circle(x, y, 15, { w: 1.8, passes: 1 }); P.circle(x, y, 8.5, { w: 1.3, passes: 1 }); P.dot(x, y, 1.4); for (let i = 0; i < 4; i++) { const a = i * PI / 2 + 0.78; ln(x + Math.cos(a) * 15, y + Math.sin(a) * 15, x + Math.cos(a) * 20, y + Math.sin(a) * 20, 0.7); } });
    // ruler numerals
    for (let i = 0; i <= 8; i++) { tx(String(i), 84 + i * 5 * 8 * 4 + 2, 86, 8, { a: 0.5 }); }

    /* ================================================== BLUE CONSTRUCTION LINES ================================================== */
    const TOP = 112, BOT = GY, HU = (BOT - TOP) / 8;
    // Vitruvian: square (height x height) and circle about the navel
    { const half = (BOT - TOP) / 2;
      bg(CX - half, TOP, CX + half, TOP); bg(CX + half, TOP, CX + half, BOT); bg(CX + half, BOT, CX - half, BOT); bg(CX - half, BOT, CX - half, TOP);
      P.circle(CX, 500, 392, { c: BLU, a: 0.42, w: 0.8, rough: 1.2, passes: 2 });
      P.circle(CX, 500, 250, { c: BLU, a: 0.32, w: 0.7, rough: 1.2, passes: 1 });
      bg(CX, 60, CX, 900, { a: 0.42 });
      bg(CX - 392, 500, CX + 392, 500, { a: 0.4 });
      bg(CX - 300, TOP - 20, CX + 300, BOT + 20, { a: 0.3 }); bg(CX + 300, TOP - 20, CX - 300, BOT + 20, { a: 0.3 });
    }
    // head-unit canon lines with tiny fractions
    for (let k = 0; k <= 8; k++) {
      const y = TOP + k * HU;
      bg(68, y, 296, y, { a: 0.36, w: 0.7 }); bg(626, y, 906, y, { a: 0.3, w: 0.7 });
      tx(k === 0 ? 'TOP' : k + '/8', 72, y - 3, 8, { c: BLU, a: 0.6 });
    }
    // large concentric circles + long diagonals (the "ratio field")
    P.circle(1060, 520, 150, { c: BLU, a: 0.38, w: 0.8, rough: 1.2, passes: 1 }); P.circle(1060, 520, 268, { c: BLU, a: 0.34, w: 0.8, rough: 1.2, passes: 2 }); P.circle(1060, 520, 395, { c: BLU, a: 0.3, w: 0.8, rough: 1.3, passes: 1 });
    bg(720, 930, 1530, 300, { a: 0.34 }); bg(900, 90, 1520, 520, { a: 0.28 }); bg(70, 900, 330, 700, { a: 0.3 });
    bg(880, 60, 880, 940, { a: 0.28 }); bg(1160, 60, 1160, 940, { a: 0.26 });
    bg(660, 341, 1540, 341, { a: 0.3 }); bg(660, 592, 1540, 592, { a: 0.3 });
    // graph-paper patches
    const gridPatch = (x0, y0, x1, y1, st, a = 0.26) => { for (let x = x0; x <= x1; x += st) P.line(x, y0, x, y1, { c: BLU, a, w: 0.5, rough: 0.5, passes: 1, over: 2 }); for (let y = y0; y <= y1; y += st) P.line(x0, y, x1, y, { c: BLU, a, w: 0.5, rough: 0.5, passes: 1, over: 2 }); };
    gridPatch(96, 560, 300, 700, 20); gridPatch(896, 590, 1160, 660, 22, 0.22); gridPatch(1180, 330, 1530, 380, 22, 0.2);
    // tick crosses on the canon
    [[CX, TOP], [CX, BOT], [CX - 250, 500], [CX + 250, 500], [CX, 250], [CX, 750]].forEach(([x, y]) => { bg(x - 8, y, x + 8, y, { a: 0.6, over: 0 }); bg(x, y - 8, x, y + 8, { a: 0.6, over: 0 }); ring(x, y, 4, 0.7, { c: BLU, a: 0.6 }); });

    /* ================================================== LEFT COLUMN: chips, rail, perfboard ================================================== */
    const L1 = qfp(118, 118, 116, { mark: (c, h) => { ring(c[0], c[1], h * 0.5, 0.8); gear(c[0], c[1], h * 0.42, 8, 0.2, { w: 0.8, body: false, shade: false }); P.dot(c[0], c[1], 1.2); } });
    tx('MIND-1', 118, 258, 11); tx('DRUM CTRL', 118, 272, 9, { a: 0.6 });
    const D1 = dip(168, 276, 40, 72, { cross: 90, gap: 2.4 });
    const D2 = dip(168, 392, 40, 72, { gap: 2.4 });
    tx('D1', 176, 271, 9); tx('D2', 176, 387, 9);
    // vertical rail bus along the left edge with two jogs
    P.bus([[86, 150], [86, 236], [98, 248], [98, 540], [86, 552], [86, 880]], 3, 6, { colors: [GRN], w: 1.6, chamfer: 12, pads: 2.4 });
    // perfboard patch: through-hole grid, strip traces, hand-wired jumpers
    const perf = (x0, y0, cols, rows, pitch) => {
      for (let r = 0; r < rows; r++) {
        const y = y0 + r * pitch;
        for (let c = 0; c < cols; c++) { const x = x0 + c * pitch; P.circle(x, y, 2.3, { w: 0.9, passes: 1, rough: 0.1 }); if ((r + c) % 3 === 0) P.circle(x, y, 3.8, { w: 0.6, passes: 1, rough: 0.1, a: 0.6 }); else P.dot(x, y, 0.6); }
        if (r % 2 === 0) { const c0 = P.ri(0, 2), c1 = cols - 1 - P.ri(0, 2); P.line(x0 + c0 * pitch, y + pitch / 2, x0 + c1 * pitch, y + pitch / 2, { c: r % 4 === 0 ? RED : GRN, w: 1.5, a: 0.9, rough: 0.2, passes: 1, over: 0 }); }
      }
    };
    perf(122, 612, 13, 16, 10);
    [[[132, 628], [200, 650], [250 - 26, 700]], [[152, 700], [186, 660], [222, 682]], [[260 - 36, 620], [150, 760], [192, 738]]].forEach(pp => { P.curve(pp, { w: 1.3, rough: 0.5 }); pp.forEach(q => { P.circle(q[0], q[1], 4.5, { w: 1.2, passes: 1 }); }); });
    xmark(146, 640, RED, 4); xmark(214, 736, GRN, 4);
    tx('MEMORY PATCH', 112, 800, 10); tx('HAND WIRED', 112, 812, 8, { a: 0.6 });
    // inductor-like glyphs (mainspring coils, flywheel toroids) above the edge fingers
    [[132, 846, 's'], [168, 846, 't'], [204, 846, 's'], [240, 846, 't']].forEach(([x, y, k]) => {
      if (k === 's') { spiral(x, y, 1.5, 12, 3.5, 0.9); ring(x, y, 13.5, 1.2, { passes: 1 }); } else { ring(x, y, 13, 1.3); ring(x, y, 6, 1); for (let i = 0; i < 16; i++) { const a = i * TAU / 16; ln(x + Math.cos(a) * 6, y + Math.sin(a) * 6, x + Math.cos(a) * 13, y + Math.sin(a) * 13, 0.5, { a: 0.7, rough: 0.1 }); } }
    });
    P.pl([[132, 860], [132, 868], [168, 868], [168, 860]], { w: 0.9, passes: 1, over: 0 }); P.pl([[204, 860], [204, 868], [240, 868], [240, 860]], { w: 0.9, passes: 1, over: 0 });

    /* ================================================== THE AUTOMATON — FRONT ELEVATION ================================================== */
    const filig = (x, y, s, sg = 1, w = 0.8) => {           // S-scroll with two curled ends
      const pts = [[x - 14 * s * sg, y + 6 * s], [x - 8 * s * sg, y - 4 * s], [x, y], [x + 8 * s * sg, y + 4 * s], [x + 14 * s * sg, y - 6 * s]];
      P.curve(pts, { w, rough: 0.2, passes: 1 });
      spiral(x - 14 * s * sg, y + 6 * s - 3 * s, 0.6 * s, 3.2 * s, 1.4, w * 0.9); spiral(x + 14 * s * sg, y - 6 * s + 3 * s, 0.6 * s, 3.2 * s, 1.4, w * 0.9);
    };
    const ground = () => {
      P.line(70, GY, 700, GY, { w: 1.8, rough: 0.6 });
      for (let x = 76; x < 690; x += 7 + P.r(0, 6)) ln(x, GY + 2, x - 7, GY + 8 + P.r(0, 4), 0.6, { a: 0.5, rough: 0.4 });
      hx(P.sample([[CX - 110, GY - 1], [CX, GY - 5], [CX + 110, GY - 1], [CX, GY + 4]], true, 5), { ang: -8, gap: 2.4, a: 0.35, w: 0.45, piece: 18 });
    };
    ground();
    const foot = (fx) => {
      const sole = [[fx - 27, 855], [fx + 27, 855], [fx + 32, 866], [fx - 32, 866]];
      P.erase(sole); P.poly(sole, { w: 1.7, rough: 0.35 });
      for (let k = 0; k < 5; k++) { const cx = fx - 26 + k * 13, ar = circPoly(cx, 866, 6.5, 10).filter(p => p[1] >= 866); P.erase(ar); P.arc(cx, 866, 6.5, 6.5, 0, PI, { w: 1.2, passes: 1 }); hx(ar, { ang: 70, gap: 2, a: 0.5, w: 0.45, fade: x => Math.max(0, (x - cx) / 8 + 0.4), piece: 5 }); }
      P.curve([[fx - 28, 859], [fx, 863], [fx + 28, 859]], { w: 1, rough: 0.2 }); rivets([fx - 24, 861], [fx + 24, 861], 6, 0.9);
      P.rect(fx - 5, 857, 10, 6, { w: 0.9, rough: 0.15, over: 0, passes: 1 }); P.dot(fx, 860, 0.9);
      ln(fx - 32, 866, fx + 32, 866, 1.6, { rough: 0.2 });
    };
    const leg = sg => {
      const X = x => CX + sg * x, hip = [X(38), 580], knee = [X(36), 726], ank = [X(36), 852];
      const pt = tube(hip, [knee[0], knee[1] - 24], 23, 19, { bands: [0.05, 0.94], rivets: [0.02, 0.97] });
      guts(pt, 0.18, 0.86, { rot: sg * 0.5, side: sg, ccol: GRN, scol: RED });
      ball(knee[0], knee[1], 26, { gear: true, rot: sg * 0.3, pin: true });
      P.scallop([[knee[0] - 22, knee[1] - 12], [knee[0], knee[1] - 26], [knee[0] + 22, knee[1] - 12]], { r: 4.5, side: -1, w: 0.9 });
      const ps = tube([knee[0], knee[1] + 26], [ank[0], ank[1] - 14], 20, 15, { bands: [0.06, 0.93], rivets: [0.03, 0.96] });
      guts(ps, 0.16, 0.84, { rot: sg * 0.2, side: -sg, rs: [0.6, 0.42, 0.56, 0.4], ccol: RED, scol: GRN });
      ball(ank[0], ank[1], 14, { pin: true });
      foot(ank[0]);
    };
    leg(-1); leg(1);
    // pelvis plate + wind-up key on the right flank
    { const pel = [[CX - 70, 508], [CX + 70, 508], [CX + 66, 562], [CX + 40, 572], [CX - 40, 572], [CX - 66, 562]];
      P.erase(pel); P.poly(pel, { w: 1.8, rough: 0.35 });
      P.curve([[CX - 68, 526], [CX, 534], [CX + 68, 526]], { w: 0.9, rough: 0.3 }); rivets([CX - 64, 514], [CX + 64, 514], 14);
      for (let x = CX - 62; x < CX + 56; x += 12) P.pl([[x, 528], [x, 517], [x + 8, 517], [x + 8, 524], [x + 4, 524], [x + 4, 520]], { w: 0.6, a: 0.75, over: 0, rough: 0.15, passes: 1 });
      P.rrect(CX - 17, 536, 34, 30, 7, { w: 1.1 }); gear(CX, 551, 11, 9, 0.2, { w: 0.85, spokes: 3, shade: false });
      filig(CX + 44, 547, 0.8, -1);
      P.rrect(CX - 64, 530, 22, 30, 3, { w: 1.1 }); ln(CX - 42, 534, CX - 39, 534, 1); ln(CX - 42, 556, CX - 39, 556, 1); P.dot(CX - 62, 536, 0.9); P.dot(CX - 62, 554, 0.9); ring(CX - 53, 543, 2.6, 0.9); ln(CX - 53, 545, CX - 53, 552, 0.9); hx(rectPoly(CX - 64, 530, 22, 30), { ang: 60, gap: 3.2, a: 0.3, w: 0.4 });
      shade(pel, CX, 530, 80, { gap: 2.4, b: 0.5 });
      // winding key
      ln(CX + 70, 530, CX + 104, 530, 1.6, { rough: 0.15 }); ring(CX + 70, 530, 5, 1);
      P.ellipse(CX + 116, 517, 12, 8, { w: 1.3, passes: 1 }); P.ellipse(CX + 116, 543, 12, 8, { w: 1.3, passes: 1 }); ln(CX + 104, 519, CX + 104, 541, 1.4); ln(CX + 124, 519, CX + 124, 541, 0.9);
      hx(circPoly(CX + 116, 517, 8, 10), { ang: 60, gap: 2, a: 0.5, w: 0.45 }); hx(circPoly(CX + 116, 543, 8, 10), { ang: 60, gap: 2, a: 0.5, w: 0.45 });
    }
    // lamellar tassets (pteruges)
    for (let i = 0; i < 9; i++) {
      const x0 = CX - 73 + i * 16.3, y1 = 590 + (i % 2) * 8, w = 15.4;
      const sp = [[x0, 550], [x0 + w, 550], [x0 + w, y1], [x0 + w / 2, y1 + 7], [x0, y1]];
      P.erase(sp); P.poly(sp, { w: 1.2, rough: 0.2, over: 0, passes: 1 });
      ln(x0 + w / 2, 556, x0 + w / 2, y1 - 3, 0.5, { a: 0.6 }); P.dot(x0 + w / 2, 556, 1.2); P.dot(x0 + w / 2, y1 - 6, 0.9);
      shade(sp, x0, 560, 22, { ang: 70, gap: 2.2, b: 0.35, piece: 6 });
    }

    // hands: palm plate + thumb + four jointed fingers, every joint pinned
    const hand = (cx, cy, ang, sc, curl, o = {}) => {
      const ca = Math.cos(ang), sa = Math.sin(ang), Tt = (x, y) => [cx + (x * ca - y * sa) * sc, cy + (x * sa + y * ca) * sc];
      const cuff = [Tt(-17, -8), Tt(17, -8), Tt(14, 1), Tt(-14, 1)];
      P.erase(cuff); P.poly(cuff, { w: o.w ?? 1.3, rough: 0.25, over: 0, passes: 1 }); rivets(Tt(-13, -5), Tt(13, -5), 4, 0.8 + sc * 0.1);
      const palm = [Tt(-14, 1), Tt(14, 1), Tt(16, 26), Tt(-16, 26)];
      P.erase(palm); P.poly(palm, { w: o.w ?? 1.5, rough: 0.3 });
      ln(...Tt(-14, 7), ...Tt(14, 7), 0.8, { rough: 0.15 });
      dotsAt([Tt(-11, 11), Tt(11, 11), Tt(-12, 21), Tt(12, 21), Tt(0, 23)], 0.9 + sc * 0.14);
      if (o.inner) o.inner(Tt);
      const fx = [-12, -4, 4, 12], fl = [[11, 9, 7], [13, 10, 8], [12, 10, 7.5], [10, 8, 6]], j = [];
      fx.forEach((x, i) => {
        let px = x, py = 26, a = (i - 1.5) * (o.spread ?? 0.03);
        fl[i].forEach((len, k) => {
          const bend = curl * (0.4 + k * 0.5) * (i === 3 ? 1.1 : 1), na = a + bend, ex = px + Math.sin(-na) * len, ey = py + Math.cos(na) * len;
          const ux = Math.sin(-na), uy = Math.cos(na), nx = uy, ny = -ux, w = 3.2 - k * 0.15;
          const seg = [Tt(px + nx * w, py + ny * w), Tt(ex + nx * w * 0.9, ey + ny * w * 0.9), Tt(ex - nx * w * 0.9, ey - ny * w * 0.9), Tt(px - nx * w, py - ny * w)];
          P.erase(seg); P.poly(seg, { w: o.fw ?? 0.95, rough: 0.2, over: 0, passes: 1 });
          if (sc > 2) { const q = Tt(ex, ey); ring(q[0], q[1], w * sc * 0.5, 0.7); P.dot(q[0], q[1], 0.9); hx(seg, { ang: 60, gap: 2, a: 0.5, w: 0.4, fade: (x2, y2) => 0.5, piece: 5 }); }
          else j.push([...Tt(ex, ey), 0.9]);
          px = ex; py = ey; a = na;
        });
      });
      { // thumb: 2 segments splayed to the side
        let px = -15, py = 12, a = 0.75; [[10, 3.3], [8, 3]].forEach(([len, w], k) => {
          const na = a + curl * 0.8 * (k + 0.6), ex = px - Math.sin(na) * len, ey = py + Math.cos(na) * len, ux = -Math.sin(na), uy = Math.cos(na), nx = uy, ny = -ux;
          const seg = [Tt(px + nx * w, py + ny * w), Tt(ex + nx * w * 0.9, ey + ny * w * 0.9), Tt(ex - nx * w * 0.9, ey - ny * w * 0.9), Tt(px - nx * w, py - ny * w)];
          P.erase(seg); P.poly(seg, { w: o.fw ?? 0.95, rough: 0.2, over: 0, passes: 1 });
          if (sc > 2) { const q = Tt(ex, ey); ring(q[0], q[1], w * sc * 0.5, 0.7); hx(seg, { ang: 60, gap: 2, a: 0.5, w: 0.4, fade: () => 0.5, piece: 5 }); } else j.push([...Tt(ex, ey), 0.9]);
          px = ex; py = ey; a = na;
        });
      }
      if (j.length) P.dots(j, null, 0.9);
      shade(palm, cx, cy, 20 * sc, { ang: 70, gap: 2.4 / Math.max(1, sc * 0.6), b: 0.3, piece: 8 });
      return Tt;
    };

    // arms (behind torso): upper arm, elbow ball, forearm, hand
    const arm = sg => {
      const X = x => CX + sg * x, Sh = [X(118), 300], El = [X(152), 428], Wr = [X(162), 542];
      const a1 = lerp2(Sh, El, 0.9), a2 = lerp2(El, Wr, 0.16), a3 = lerp2(El, Wr, 0.88);
      const pu = tube(Sh, a1, 22, 18, { bands: [0.06, 0.55, 0.94], rivets: [0.02, 0.32, 0.75] });
      guts(pu, 0.14, 0.52, { rot: sg * 0.3, side: sg, rs: [0.62, 0.42, 0.58, 0.4], ccol: RED, scol: GRN });
      // strap on the biceps
      { const p0 = pu(0.6, -1), p1 = pu(0.6, 1), p2 = pu(0.72, -1), p3 = pu(0.72, 1); ln(...p0, ...p1, 1.2); ln(...p2, ...p3, 1.2); const m = pu(0.66, 0); P.rect(m[0] - 4, m[1] - 5, 8, 10, { w: 0.9, rough: 0.15, over: 0, passes: 1 }); rivets(pu(0.63, -0.6), pu(0.63, 0.6), 4, 0.8); }
      ball(El[0], El[1], 21, { pin: true, gear: true, rot: sg * 0.2 });
      const pf = tube(a2, a3, 18, 14, { bands: [0.08, 0.6, 0.9], rivets: [0.03, 0.4, 0.8] });
      guts(pf, 0.14, 0.52, { rot: sg * 0.2, side: -sg, rs: [0.58, 0.4, 0.55, 0.38], ccol: GRN, scol: RED });
      return { Wr, ang: sg * 0.07 };
    };
    function lerp2(a, b, q) { return [lerp(a[0], b[0], q), lerp(a[1], b[1], q)]; }
    const AL = arm(-1), AR = arm(1);
    hand(AL.Wr[0], AL.Wr[1] + 6, 0.07, 1.42, 0.18, { spread: 0.05 });
    hand(AR.Wr[0], AR.Wr[1] + 6, -0.07, 1.42, 0.18, { spread: 0.05 });

    // torso
    { const Lh = [[CX - 82, 252], [CX - 86, 290], [CX - 79, 360], [CX - 69, 430], [CX - 63, 486]], Rh = Lh.map(([x, y]) => [2 * CX - x, y]);
      const tor = Lh.concat(Rh.slice().reverse());
      P.erase(tor);
      P.curve(Lh, { w: 2, rough: 0.5 }); P.curve(Rh, { w: 2, rough: 0.5 });
      // gorget + lamellar scale rows
      P.curve([[CX - 82, 254], [CX, 270], [CX + 82, 254]], { w: 1.3, rough: 0.3 }); P.curve([[CX - 82, 259], [CX, 275], [CX + 82, 259]], { w: 0.6, a: 0.6, rough: 0.2 });
      for (let k = 0; k < 6; k++) {
        const y = 279 + k * 9.2, hw = 82 - k * 0.6, rr = 6.6;
        const sh = (k % 2) * rr; P.scallop([[CX - hw + 2 + sh, y], [CX + hw - 2, y]], { r: rr, side: 1, w: 0.95, a: 0.9 });
        const d = []; for (let x = CX - hw + 2 + rr + sh; x < CX + hw - 4; x += rr * 2) d.push([x, y + 1.5]); dotsAt(d, 0.85, 0.75);
      }
      shade(tor.map(p => p), CX, 300, 90, { gap: 2.6, b: 0.4, ang: 75, piece: 8 });
      // straps down both flanks with buckles and stitching
      [-1, 1].forEach(sg => {
        const x0 = CX + sg * 58, x1 = CX + sg * 68;
        P.line(x0, 334, x0 - sg * 1, 482, { w: 1.1, rough: 0.3 }); P.line(x1, 300, x1 - sg * 3, 482, { w: 1.1, rough: 0.3 });
        for (let y = 340; y < 478; y += 6) ln(x0 + sg * 3, y, x0 + sg * 3, y + 3, 0.5, { a: 0.7, rough: 0.1 });
        P.rect(x0 - 2, 344, 14 * sg > 0 ? 14 : -14, 12, { w: 1, rough: 0.15, over: 0, passes: 1 }); P.dot(x0 + sg * 5, 350, 1);
      });
      // medallion
      { const mx = CX, my = 300; P.erase(circPoly(mx, my, 27, 20));
        P.circle(mx, my, 25, { w: 1.7 }); ring(mx, my, 20, 0.8); gear(mx, my, 15, 14, 0.15, { w: 0.9, spokes: 6, shade: false });
        ring(mx, my, 5.2, 1); P.dot(mx, my, 1.3);
        for (let i = 0; i < 16; i++) { const a = i * TAU / 16; ln(mx + Math.cos(a) * 25, my + Math.sin(a) * 25, mx + Math.cos(a) * 30, my + Math.sin(a) * 30, 0.7, { rough: 0.1 }); }
        shade(circPoly(mx, my, 25, 18), mx, my, 25, { gap: 2.3, piece: 6 });
        for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + 0.2; P.dot(mx + Math.cos(a) * 22.5, my + Math.sin(a) * 22.5, 0.9); }
      }
      filig(CX - 55, 306, 0.7, 1); filig(CX + 55, 306, 0.7, -1);
      // cutaway window with the movement
      const wx = CX - 52, wy = 334, ww = 104, wh = 142;
      P.erase(rectPoly(wx, wy, ww, wh));
      P.rrect(wx - 3, wy - 3, ww + 6, wh + 6, 9, { w: 1.7 }); P.rrect(wx, wy, ww, wh, 7, { w: 0.6, a: 0.6, passes: 1 });
      rivets([wx + 8, wy - 3], [wx + ww - 8, wy - 3], 10); rivets([wx + 8, wy + wh + 3], [wx + ww - 8, wy + wh + 3], 10);
      for (let y = wy + 10; y < wy + wh - 6; y += 12) { P.dot(wx - 3, y, 1); P.dot(wx + ww + 3, y, 1); }
      hx(rectPoly(wx, wy, ww, wh), { ang: 45, gap: 5, a: 0.17, w: 0.4 });
      // gear cluster
      const g1 = [wx + 22, wy + 28, 20]; const g2 = meshPt(g1, 0.3, 14), g3 = meshPt(g2, 1.2, 9), g4 = meshPt(g1, 1.9, 10), g5 = meshPt(g4, 0.5, 8), g6 = meshPt(g2, -0.9, 8);
      gear(g1[0], g1[1], g1[2], 12, 0.1, { w: 1.1, spokes: 5 }); gear(g2[0], g2[1], g2[2], 9, 0.35, { w: 1, spokes: 4 }); gear(g3[0], g3[1], g3[2], 7, 0.1, { w: 0.9 }); gear(g4[0], g4[1], g4[2], 7, 0.5, { w: 0.9 }); gear(g5[0], g5[1], g5[2], 6, 0.2, { w: 0.85 }); gear(g6[0], g6[1], g6[2], 6, 0.2, { w: 0.85 });
      // camshaft drum with pegs and a comb
      { const dx0 = wx + 10, dx1 = wx + 84, dy0 = wy + 84, dy1 = wy + 104;
        P.erase(rectPoly(dx0, dy0, dx1 - dx0, dy1 - dy0)); P.rect(dx0, dy0, dx1 - dx0, dy1 - dy0, { w: 1.3, rough: 0.2, over: 0.3 });
        P.ellipse(dx0, (dy0 + dy1) / 2, 3, 10, { w: 1, passes: 1 }); P.ellipse(dx1, (dy0 + dy1) / 2, 3, 10, { w: 1, passes: 1 });
        for (let x = dx0 + 8; x < dx1 - 4; x += 8) ln(x, dy0, x, dy1, 0.5, { a: 0.6, rough: 0.1 });
        const pg = []; for (let i = 0; i < 9; i++) for (let k = 0; k < 4; k++) if ((i * 3 + k * 5) % 7 < 3) pg.push([dx0 + 4 + i * 8 + 4, dy0 + 3 + k * 5.2, 1.15]);
        P.dots(pg, null, 0.9);
        ln(dx0 - 6, (dy0 + dy1) / 2, dx0, (dy0 + dy1) / 2, 1.2); ln(dx1, (dy0 + dy1) / 2, dx1 + 6, (dy0 + dy1) / 2, 1.2);
        for (let x = dx0 + 2; x < dx1 - 2; x += 3.6) ln(x, dy1 + 2, x, dy1 + 3 + 6 * (1 - (x - dx0) / (dx1 - dx0)) + 2, 0.6, { rough: 0.1 });
        ln(dx0, dy1 + 2, dx1, dy1 + 2, 0.9);
        hx(rectPoly(dx0, dy0, dx1 - dx0, dy1 - dy0), { ang: 20, gap: 2.4, a: 0.4, w: 0.4, fade: (x, y) => (y - dy0) / (dy1 - dy0) * 0.9 + 0.1, piece: 6 });
      }
      // water-clock reservoir (right column), float and drip
      { const rx0 = wx + ww - 22, ry0 = wy + 10, rw = 16, rh = 84;
        P.rect(rx0, ry0, rw, rh, { w: 1.3, rough: 0.2, over: 0.3 });
        P.curve([[rx0 + 1, ry0 + 26], [rx0 + rw * 0.3, ry0 + 23], [rx0 + rw * 0.7, ry0 + 28], [rx0 + rw - 1, ry0 + 25]], { w: 0.7, rough: 0.15, passes: 1 });
        for (let y = ry0 + 30; y < ry0 + rh - 2; y += 3) ln(rx0 + 1.5, y, rx0 + rw - 1.5, y, 0.4, { a: 0.55, rough: 0.1 });
        for (let y = ry0 + 6; y < ry0 + rh; y += 10) ln(rx0 - 3, y, rx0, y, 0.6, { rough: 0.1 });
        ln(rx0 + rw / 2, ry0 + 20, rx0 + rw / 2, ry0 + 46, 0.9); P.rect(rx0 + 4, ry0 + 44, 8, 3.5, { w: 0.8, passes: 1, over: 0 });
        ln(rx0 + rw / 2, ry0 + rh, rx0 + rw / 2, ry0 + rh + 12, 0.8); P.circle(rx0 + rw / 2, ry0 + rh + 15, 2.2, { w: 0.8, passes: 1 });
      }
      // mainspring barrel + hidden niche with the homunculus and the keyhole door
      { const bx = wx + 66, by = wy + 124; ring(bx, by, 12, 1.2); spiral(bx, by, 1.5, 10, 3, 0.7); P.dot(bx, by, 1.2); chain([[g5[0], g5[1] + 4], [g5[0] + 2, by], [bx - 12, by]], false, 1.4, 4, 0.8, GRN);
        const nx0 = wx + 8, ny0 = wy + 108, nw = 30, nh = 30;
        P.rect(nx0, ny0, nw, nh, { w: 1.3, rough: 0.2, over: 0.3 }); P.arc(nx0 + nw / 2, ny0, nw / 2, 6, PI, TAU, { w: 1.1, passes: 1 });
        // homunculus: head, body, arms to a tiny crank, legs
        const hx0 = nx0 + 12, hy0 = ny0 + 8; P.circle(hx0, hy0, 3.4, { w: 0.9, passes: 1 }); ln(hx0 - 2, hy0 - 3, hx0 + 2, hy0 - 6, 0.7); ln(hx0, hy0 + 3.4, hx0, hy0 + 14, 1); ln(hx0, hy0 + 6, hx0 + 8, hy0 + 10, 0.8); ln(hx0, hy0 + 14, hx0 - 5, hy0 + 20, 0.8); ln(hx0, hy0 + 14, hx0 + 4, hy0 + 21, 0.8);
        gear(hx0 + 13, hy0 + 11, 4.6, 8, 0.2, { w: 0.7, body: false, shade: false }); P.dot(hx0 + 13, hy0 + 11, 0.8); ln(hx0 + 13, hy0 + 11, hx0 + 17, hy0 + 6, 0.8);
        // keyhole door
        const kx = nx0 + nw + 3, ky = ny0 - 2; P.rrect(kx, ky, 14, 32, 4, { w: 1.1 }); ring(kx + 7, ky + 12, 2.6, 0.9); P.pl([[kx + 5.6, ky + 14], [kx + 8.4, ky + 14], [kx + 9.4, ky + 23], [kx + 4.6, ky + 23]], { closed: true, w: 0.8, passes: 1, over: 0 }); P.dot(kx + 7, ky + 12, 1);
      }
      // belt
      P.rect(CX - 66, 486, 132, 22, { w: 1.6, rough: 0.3 }); P.erase(rectPoly(CX - 65, 487, 130, 20)); P.rect(CX - 66, 486, 132, 22, { w: 1.6, rough: 0.3 });
      ln(CX - 66, 492, CX + 66, 492, 0.8); ln(CX - 66, 502, CX + 66, 502, 0.8); rivets([CX - 62, 497], [CX + 62, 497], 18, 0.95);
      P.rrect(CX - 13, 486, 26, 22, 4, { w: 1.3 }); gear(CX, 497, 7, 8, 0.2, { w: 0.8, body: false, shade: false }); P.dot(CX, 497, 1);
      shade(rectPoly(CX - 66, 486, 132, 22), CX, 490, 80, { gap: 2.3, ang: 80, b: 0.45, piece: 8 });
    }

    // pauldrons with scalloped lames
    const paul = (cx, cy, sg) => {
      P.erase(circPoly(cx, cy, 43, 26)); P.circle(cx, cy, 42, { w: 1.9 });
      [33, 24].forEach(r => P.arc(cx, cy, r, r, PI * 0.08, PI * 0.92, { w: 1.1, passes: 1 }));
      const fr = []; for (let i = 0; i <= 14; i++) { const a = PI * 0.06 + i * (PI * 0.88) / 14; fr.push([cx + Math.cos(a) * 43, cy + Math.sin(a) * 43]); } fr.reverse();
      P.scallop(fr, { r: 5.5, side: -1, w: 1, a: 0.9 });
      P.circle(cx, cy - 4, 10, { w: 1.2, passes: 1 }); gear(cx, cy - 4, 7, 8, 0.2, { w: 0.8, body: false, shade: false }); P.dot(cx, cy - 4, 1.4);
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + 0.2; P.dot(cx + Math.cos(a) * 38.5, cy + Math.sin(a) * 38.5, 1.1, {}); }
      for (let i = 0; i < 10; i++) { const a = i * TAU / 10; ln(cx + Math.cos(a) * 11, cy - 4 + Math.sin(a) * 11, cx + Math.cos(a) * 23, cy - 4 + Math.sin(a) * 22, 0.5, { a: 0.55, rough: 0.15 }); }
      shade(circPoly(cx, cy, 42, 28), cx, cy, 45, { gap: 2.4, b: 0.5, piece: 7 });
      filig(cx + sg * 2, cy + 20, 0.55, sg);
    };
    paul(CX - 118, 276, -1); paul(CX + 118, 276, 1);

    // neck bellows + helm
    for (let i = 0; i < 5; i++) { const y = 226 + i * 5.4; P.erase(rectPoly(CX - 28, y - 3, 56, 6)); P.arc(CX, y, 27 - i * 0.3, 5, 0, PI, { w: 1.1, passes: 1 }); P.arc(CX, y, 27 - i * 0.3, 5, PI, TAU, { w: 0.5, a: 0.4, passes: 1 }); }
    ln(CX - 27, 224, CX - 27, 254, 1.4, { rough: 0.3 }); ln(CX + 27, 224, CX + 27, 254, 1.4, { rough: 0.3 });
    { // crest (behind the helm)
      const outer = q => [CX - 44 + 88 * q, 132 - 28 * Math.pow(Math.sin(PI * q), 0.9)], inner = q => [CX - 40 + 80 * q, 132 - 14 * Math.sin(PI * q)];
      for (let i = 0; i <= 26; i++) { const q = i / 26, a = outer(q), b = inner(q); ln(a[0], a[1], b[0], b[1], 0.7, { rough: 0.1 }); }
      const oc = [], ic = []; for (let i = 0; i <= 22; i++) { oc.push(outer(i / 22)); ic.push(inner(i / 22)); }
      P.path(oc, { w: 1.7, rough: 0.35, passes: 1 }); P.path(ic, { w: 1, rough: 0.2, passes: 1 });
      for (let i = 1; i < 22; i++) { const q = i / 22, a = outer(q), an = Math.PI * (q - 0.5) * 0.8; ln(a[0], a[1], a[0] + Math.sin(an) * 7, a[1] - Math.cos(an) * (6 + (i % 3) * 2), 0.6, { rough: 0.1 }); }
      hx(oc.concat(ic.slice().reverse()), { ang: 80, gap: 2.2, a: 0.5, w: 0.45, fade: x => Math.max(0, (x - CX) / 44 + 0.4), piece: 6 });
    }
    { const hp = [[CX - 46, 158], [CX - 45, 140], [CX - 34, 126], [CX, 120], [CX + 34, 126], [CX + 45, 140], [CX + 46, 158], [CX + 42, 186], [CX + 30, 208], [CX + 12, 224], [CX, 228], [CX - 12, 224], [CX - 30, 208], [CX - 42, 186]];
      P.erase(P.sample(hp, true, 5)); P.curve(hp, { closed: true, w: 2.1, rough: 0.5, passes: 2 });
      P.curve([[CX - 45, 142], [CX, 149], [CX + 45, 142]], { w: 1.2, rough: 0.25 }); rivets([CX - 40, 145], [CX + 40, 145], 12, 1);
      // T-visor with lens eyes
      P.rrect(CX - 37, 152, 74, 26, 12, { w: 1.6 });
      [-1, 1].forEach((sg, i) => { const x = CX + sg * 19, y = 165; ring(x, y, 10.5, 1.4); ring(x, y, 7, 0.9); ring(x, y, 3.3, 1); P.dot(x - sg * 1, y - 1, 1.3); ln(x - 14, y, x - 10.5, y, 0.7); ln(x + 10.5, y, x + 14, y, 0.7); P.arc(x, y - 1, 12.6, 9, PI * 1.1, PI * 1.9, { w: 0.9, passes: 1 }); shade(circPoly(x, y, 10.5, 14), x, y, 10, { gap: 2, piece: 5 }); });
      // nose guard
      const ng = [[CX - 4, 152], [CX + 4, 152], [CX + 7, 198], [CX, 206], [CX - 7, 198]]; P.erase(ng); P.poly(ng, { w: 1.2, rough: 0.2, over: 0, passes: 1 }); shade(ng, CX - 4, 170, 12, { gap: 2.1, piece: 5, b: 0.5 });
      // mouth grille (steam outlet)
      P.rrect(CX - 20, 200, 40, 17, 4, { w: 1.4 }); for (let x = CX - 16; x < CX + 18; x += 4.4) ln(x, 203, x, 214, 0.75, { a: 0.9, rough: 0.12 });
      // ears: little gear discs wired to the board
      [-1, 1].forEach(sg => { const ex = CX + sg * 54, ey = 166; eraseC(ex, ey, 13.5); P.circle(ex, ey, 13, { w: 1.5 }); gear(ex, ey, 9.5, 9, sg * 0.3, { w: 0.85, spokes: 3, shade: false }); P.dot(ex, ey, 1.6); ln(ex - sg * 13, ey, ex - sg * 8, ey, 0.9); });
      // cheek filigree, seams and rivets
      filig(CX - 31, 192, 0.55, 1); filig(CX + 31, 192, 0.55, -1);
      P.curve([[CX - 44, 176], [CX - 38, 198], [CX - 20, 216]], { w: 0.6, a: 0.6, rough: 0.2 }); P.curve([[CX + 44, 176], [CX + 38, 198], [CX + 20, 216]], { w: 0.6, a: 0.6, rough: 0.2 });
      // forehead gem
      ring(CX, 134, 6, 1.1); for (let i = 0; i < 8; i++) { const a = i * PI / 4; ln(CX + Math.cos(a) * 6, 134 + Math.sin(a) * 6, CX + Math.cos(a) * 9, 134 + Math.sin(a) * 9, 0.6, { rough: 0.1 }); } P.dot(CX, 134, 1.4);
      shade(P.sample(hp, true, 5), CX, 160, 60, { gap: 2.4, ang: 80, b: 0.55, piece: 8 });
    }

    /* ================================================== RIGHT REGION: CALLOUT A — head profile, steam, bellows ================================================== */
    const headProf = (cx, cy, s, o = {}) => {
      const Tp = (x, y) => [cx + (x - 800) * s, cy + (y - 172) * s], TP = pts => pts.map(p => Tp(p[0], p[1]));
      const sw = Math.min(1.25, Math.sqrt(s)), hpb = [[770, 166], [771, 146], [780, 128], [796, 119], [814, 119], [830, 128], [840, 144], [843, 162], [845, 180], [841, 196], [834, 208], [826, 222], [812, 230], [796, 229], [782, 220], [773, 204], [770, 186]];
      const yb = q => 142 - 6 * q, outer = q => Tp(772 + 68 * q, yb(q) - 34 * Math.pow(Math.sin(PI * q), 0.8)), inner = q => Tp(772 + 68 * q, yb(q) - 16 * Math.sin(PI * q));
      const NS = Math.round(14 + 12 * Math.min(2, s));
      for (let i = 0; i <= NS; i++) { const q = i / NS, a = outer(q), b = inner(q); ln(a[0], a[1], b[0], b[1], 0.7, { rough: 0.1 }); }
      const oc = [], ic = []; for (let i = 0; i <= 24; i++) { oc.push(outer(i / 24)); ic.push(inner(i / 24)); }
      P.path(oc, { w: 1.7 * sw, rough: 0.35, passes: 1 }); P.path(ic, { w: 1 * sw, rough: 0.2, passes: 1 });
      for (let i = 1; i < 24; i++) { const q = i / 24, a = outer(q), an = PI * (q - 0.5) * 0.8; ln(a[0], a[1], a[0] + Math.sin(an) * 7 * s, a[1] - Math.cos(an) * (6 + (i % 3) * 2) * s, 0.6, { rough: 0.1 }); }
      hx(oc.concat(ic.slice().reverse()), { ang: 80, gap: 2.2, a: 0.5, w: 0.45, fade: x => Math.max(0, (x - cx) / (40 * s) + 0.4), piece: 6 });
      const hp = TP(hpb);
      P.erase(P.sample(hp, true, 5)); P.curve(hp, { closed: true, w: 2.1 * sw, rough: 0.5, passes: 2 });
      P.curve(TP([[792, 142], [816, 147], [843, 145]]), { w: 1.2 * sw, rough: 0.25 });
      // lens tube
      { const a = Tp(829, 150); P.rrect(a[0], a[1], 18 * s, 15 * s, 5 * s, { w: 1.3 * sw }); const e = Tp(847, 157.5); P.ellipse(e[0], e[1], 3.4 * s, 7.6 * s, { w: 1 * sw, passes: 1 }); P.ellipse(e[0], e[1], 1.6 * s, 4 * s, { w: 0.7, passes: 1 }); const q1 = Tp(836, 150), q2 = Tp(836, 165); ln(q1[0], q1[1], q2[0], q2[1], 0.6, { a: 0.6 }); }
      // ear gear
      { const e = Tp(792, 172); eraseC(e[0], e[1], 13.6 * s); P.circle(e[0], e[1], 13.2 * s, { w: 1.4 * sw }); gear(e[0], e[1], 9.5 * s, 9, 0.3, { w: 0.85 * sw, spokes: 3, shade: s > 1.2 }); P.dot(e[0], e[1], 1.4 * s); }
      // mouth grille
      { const a = Tp(834, 197); P.rrect(a[0], a[1], 12 * s, 16 * s, 3 * s, { w: 1.2 * sw }); for (let k = 0; k < 4; k++) { const y = a[1] + (3 + k * 3.4) * s; ln(a[0] + 1.5 * s, y, a[0] + 10.5 * s, y, 0.7, { rough: 0.1 }); } }
      P.curve(TP([[798, 196], [814, 210], [828, 222]]), { w: 0.7 * sw, a: 0.7, rough: 0.2 }); P.curve(TP([[784, 178], [786, 200], [794, 216]]), { w: 0.6, a: 0.6, rough: 0.2 });
      filig(...Tp(806, 206), 0.42 * s, 1, 0.7);
      for (let i = 0; i < 7; i++) { const p = Tp(774 + i * 0.6, 136 + i * 12); P.dot(p[0], p[1], 1 * Math.min(1.4, s)); }
      const gemc = Tp(806, 132); ring(gemc[0], gemc[1], 4.5 * s, 1); P.dot(gemc[0], gemc[1], 1.2 * s);
      if (o.cut) {
        const win = TP([[779, 136], [826, 134], [833, 152], [834, 198], [822, 220], [790, 214], [777, 196], [776, 152]]);
        P.erase(win); P.poly(win, { w: 1.1, rough: 0.25, over: 0, passes: 1 }); hx(win, { ang: 45, gap: 5, a: 0.17, w: 0.4 });
        // cam drum (lobed) and its followers
        const cc = Tp(800, 182), cp = []; for (let i = 0; i < 60; i++) { const a = i * TAU / 60, r = (11 + 4 * Math.cos(3 * a)) * s; cp.push([cc[0] + Math.cos(a) * r, cc[1] + Math.sin(a) * r]); }
        P.path(cp, { closed: true, w: 1.3, rough: 0.25, passes: 1 }); ring(cc[0], cc[1], 3.6 * s, 1); P.dot(cc[0], cc[1], 1.4 * s); shade(cp, cc[0], cc[1], 13 * s, { gap: 2.3, piece: 5 });
        // optic tube above with two lenses
        const ot = Tp(790, 150); P.rect(ot[0], ot[1], 39 * s, 12 * s, { w: 1.1, rough: 0.2, over: 0.3 }); [798, 812, 824].forEach(x => { const e = Tp(x, 156); P.ellipse(e[0], e[1], 2.2 * s, 5.4 * s, { w: 0.8, passes: 1 }); });
        // follower rod & jaw link to the mouth flap
        const j0 = Tp(812, 178), j1 = Tp(824, 196), j2 = Tp(836, 205); P.pl([j0, j1, j2], { w: 1.2, rough: 0.2, over: 0, passes: 1 }); [j0, j1, j2].forEach(q => { ring(q[0], q[1], 2.4 * s, 0.9); });
        // gears at the back plus a return spring
        gear(...Tp(783, 160), 8 * s, 8, 0.3, { w: 0.9, spokes: 3, shade: false }); gear(...Tp(786, 200), 7 * s, 8, 0.1, { w: 0.85, spokes: 3, shade: false });
        const c0 = Tp(780, 166), c1 = Tp(780, 194); ln(c0[0], c0[1], c1[0], c1[1], 0.4, { a: 0.5 });
        // throat pipe with bellows rings leaving through the neck
        const pp = TP([[836, 210], [824, 224], [818, 236], [817, 252]]);
        const off = (d) => pp.map((q, i) => { const a = pp[Math.max(0, i - 1)], b = pp[Math.min(pp.length - 1, i + 1)]; let tx2 = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx2, ty) || 1; return [q[0] - ty / l * d, q[1] + tx2 / l * d]; });
        P.curve(off(3.6 * s), { w: 1.3, rough: 0.2 }); P.curve(off(-3.6 * s), { w: 1.3, rough: 0.2 });
        for (let k = 1; k < 5; k++) { const y = 228 + k * 5, a = Tp(814.5, y), b = Tp(821, y); ln(a[0], a[1], b[0], b[1], 0.7, { rough: 0.1 }); }
      }
      return { Tp };
    };
    const smoke = (path, r0, r1, o = {}) => {
      const Sm = P.sample(path, false, 10), m = Sm.length, seg = 5;
      for (let j = 0; j < seg; j++) {
        const a = Math.floor(j * (m - 1) / seg), b = Math.min(m - 1, Math.floor((j + 1) * (m - 1) / seg) + 1), pts = Sm.slice(a, b + 1); if (pts.length < 4) continue;
        P.cloudTube(pts, lerp(r0, r1, j / seg), lerp(r0, r1, (j + 1) / seg), o);
      }
    };
    const C1 = { x: 1010, y: 204, r: 118 };
    eraseC(C1.x, C1.y, C1.r + 1);
    P.circle(C1.x, C1.y, C1.r, { w: 2.1 }); P.circle(C1.x, C1.y, C1.r - 5, { w: 0.7, passes: 1, a: 0.7 });
    for (let i = 0; i < 48; i++) { const a = i * TAU / 48; ln(C1.x + Math.cos(a) * (C1.r - 5), C1.y + Math.sin(a) * (C1.r - 5), C1.x + Math.cos(a) * (C1.r - 9), C1.y + Math.sin(a) * (C1.r - 9), 0.5, { a: 0.6, rough: 0.1 }); }
    const HP = headProf(1006, 208, 1.5, { cut: true });
    const mouth = HP.Tp(846, 205);
    // steam: blue-ink scalloped smoke tubes from the mouth grille
    smoke([[mouth[0] + 2, mouth[1] - 2], [1138, 262], [1196, 248], [1262, 222], [1336, 204]], 8, 24, { c: STM, w: 1.1, a: 0.92, rib: 2 });
    smoke([[mouth[0] + 2, mouth[1] - 5], [1126, 240], [1176, 194], [1226, 146], [1272, 118]], 7, 19, { c: STM, w: 1, a: 0.9, rib: 2 });
    P.cloud(1400, 168, 132, 74, { c: STM, w: 1.1, a: 0.92, lobes: 13, inner: 4, r: 8 });
    P.cloud(1316, 104, 112, 62, { c: STM, w: 1.1, a: 0.9, lobes: 12, inner: 3, r: 7 });
    P.cloud(1436, 122, 92, 54, { c: STM, w: 1, a: 0.85, lobes: 11, inner: 3, r: 7 });
    P.cloud(1478, 226, 84, 52, { c: STM, w: 1, a: 0.85, lobes: 10, inner: 2, r: 6 });
    P.cloud(1368, 254, 74, 40, { c: STM, w: 0.9, a: 0.8, lobes: 9, inner: 2, r: 6, shade: false });
    P.cloud(1250, 84, 52, 26, { c: STM, w: 0.9, a: 0.75, lobes: 8, inner: 1, r: 5, shade: false });
    [[1190, 272, 5], [1214, 268, 4], [1236, 282, 3.4], [1450, 292, 5], [1500, 300, 3.5], [1330, 292, 4]].forEach(([x, y, r]) => { P.scallop(circPoly(x, y, r, 8), { closed: true, r: Math.max(2, r * 0.6), c: STM, w: 0.8, a: 0.8 }); });
    // bellows lung (accordion) feeding the throat
    { const bx0 = 1148, bx1 = 1252, by0 = 292, by1 = 326, nf = 11;
      P.rect(bx0 - 5, by0 - 5, 5, by1 - by0 + 10, { w: 1.4, rough: 0.2, over: 0, passes: 1 }); P.rect(bx1, by0 - 5, 6, by1 - by0 + 10, { w: 1.4, rough: 0.2, over: 0, passes: 1 });
      const top = [], bot = []; for (let i = 0; i <= nf; i++) { const x = lerp(bx0, bx1, i / nf), z = i % 2 ? -6 : 0; top.push([x, by0 + z]); bot.push([x, by1 - z]); }
      P.pl(top, { w: 1.1, rough: 0.2, over: 0, passes: 1 }); P.pl(bot, { w: 1.1, rough: 0.2, over: 0, passes: 1 });
      for (let i = 0; i <= nf; i++) { ln(top[i][0], top[i][1], bot[i][0], bot[i][1], 0.6, { rough: 0.1 }); }
      hx(P.sample(top.concat(bot.slice().reverse()), true, 2), { ang: 70, gap: 2.4, a: 0.4, w: 0.4, fade: x => (x - bx0) / (bx1 - bx0), piece: 8 });
      ln(bx1 + 6, 309, bx1 + 34, 309, 1.6); P.circle(bx1 + 38, 309, 5, { w: 1.2, passes: 1 }); ln(bx1 + 38, 309, bx1 + 30, 292, 1.2);
      P.pl([[bx0 - 5, 309], [1130, 309]], { w: 1.4, over: 0, passes: 1 }); P.pl([[bx0 - 5, 300], [1130, 300]], { w: 1.4, over: 0, passes: 1 });
      ln(1200, by0, 1200, 268, 1.3); ln(1207, by0, 1207, 268, 1.3);
      tx('BELLOWS LUNG', 1300, 310, 10); tx('12 BREATHS / MIN', 1300, 322, 8, { a: 0.6 });
    }
    tx('A', 926, 118, 16); ring(933, 112, 11, 1);
    tx('HEAD PROFILE - SECTION', 902, 322, 9, { a: 0.7 });
    tx('STEAM VENT', 1300, 60 + 34, 9, { c: STM, a: 0.7 });

    /* ================================================== CALLOUT B — the hand, drawn large ================================================== */
    const C2 = { x: 1010, y: 474, r: 106 };
    eraseC(C2.x, C2.y, C2.r + 1);
    P.circle(C2.x, C2.y, C2.r, { w: 2.1 }); P.circle(C2.x, C2.y, C2.r - 5, { w: 0.7, passes: 1, a: 0.7 });
    for (let i = 0; i < 48; i++) { const a = i * TAU / 48; ln(C2.x + Math.cos(a) * (C2.r - 5), C2.y + Math.sin(a) * (C2.r - 5), C2.x + Math.cos(a) * (C2.r - 9), C2.y + Math.sin(a) * (C2.r - 9), 0.5, { a: 0.6, rough: 0.1 }); }
    hand(C2.x, 548, PI, 2.6, -0.12, {
      w: 1.9, fw: 1.2, spread: 0.06, inner: Tt => {
        // tendon rods inside the palm converge on a hub plate at the wrist; pulleys at each knuckle
        const hub = [Tt(-9, 4), Tt(9, 4), Tt(9, 9), Tt(-9, 9)]; P.poly(hub, { w: 1.1, rough: 0.2, over: 0, passes: 1 });
        [-12, -4, 4, 12].forEach(x => { const a = Tt(x, 24), b = Tt(x * 0.4, 9); ln(a[0], a[1], b[0], b[1], 0.9, { rough: 0.2, c: x < 0 ? RED : GRN }); ring(a[0], a[1], 3.2, 0.9); P.dot(a[0], a[1], 0.9); });
        coil(Tt(-7, 15), Tt(-7, 22), 5, 2.4, 0.8); coil(Tt(7, 15), Tt(7, 22), 5, 2.4, 0.8);
      }
    });
    tx('B', 906, 396, 16); ring(913, 390, 11, 1);
    tx('THE HAND - ALL FINGERS PINNED', 1030, 592, 8, { a: 0.7 });
    P.note('TENDON RODS', 1124, 522, 1036, 500, { size: 8 });

    /* ================================================== CAMSHAFT DRUM (music-box) chip ================================================== */
    const R4 = { x: 1188, y: 394, w: 338, h: 166 };
    { const { x, y, w, h } = R4;
      P.erase(rectPoly(x - 1, y - 1, w + 2, h + 2)); P.rrect(x, y, w, h, 10, { w: 2.1 }); P.rrect(x + 5, y + 5, w - 10, h - 10, 7, { w: 0.7, a: 0.7, passes: 1 });
      for (let px = x + 14; px < x + w - 12; px += 6) { ln(px, y, px, y - 8, 1, { rough: 0.15 }); ln(px, y + h, px, y + h + 8, 1, { rough: 0.15 }); }
      pinRun(x, y + 46, 0, 1, 12, 6, -8, 1, 0, 0); pinRun(x + w, y + 46, 0, 1, 12, 6, 8, 1, 0, 0);
      const dx0 = x + 30, dx1 = x + w - 30, dy0 = y + 28, dy1 = y + 112, dh = dy1 - dy0, cyy = (dy0 + dy1) / 2;
      P.erase(rectPoly(dx0, dy0, dx1 - dx0, dh));
      P.rect(dx0, dy0, dx1 - dx0, dh, { w: 1.6, rough: 0.25, over: 0.4 }); P.ellipse(dx0, cyy, 9, dh / 2, { w: 1.5, passes: 1 }); P.ellipse(dx1, cyy, 9, dh / 2, { w: 1.5, passes: 1 }); P.ellipse(dx1, cyy, 4, dh / 4, { w: 0.8, passes: 1 });
      for (let rx = dx0 + 11.5; rx < dx1 - 4; rx += 11.5) { ln(rx, dy0, rx, dy1, 0.55, { a: 0.6, rough: 0.1 }); }
      const pg = [], rowsN = 7; let ring0 = 0;
      for (let rx = dx0 + 6; rx < dx1 - 6; rx += 11.5, ring0++) for (let k = 0; k < rowsN; k++) if ((ring0 * 7 + k * 5 + (ring0 >> 2)) % 9 < 3) pg.push([rx, dy0 + 6 + k * 12]);
      pg.forEach(([px, py]) => { P.rect(px - 2.4, py - 1.6, 4.8, 3.2, { w: 0.9, rough: 0.05, over: 0, passes: 1 }); });
      P.dots(pg.map(p => [p[0] + 3.2, p[1] + 1.4, 0.7]), null, 0.7);
      hx(rectPoly(dx0, dy0, dx1 - dx0, dh), { ang: 15, gap: 2.4, a: 0.5, w: 0.45, fade: (px, py) => Math.pow((py - dy0) / dh, 1.2) * 0.95 + 0.05, piece: 7 });
      // shafts, bearings, hand crank on the right
      ln(x + 10, cyy, dx0 - 8, cyy, 1.6); ln(dx1 + 8, cyy, x + w - 12, cyy, 1.6); ring(x + 12, cyy, 6, 1.2); ring(x + w - 12, cyy, 6, 1.2); P.dot(x + 12, cyy, 1.6); P.dot(x + w - 12, cyy, 1.6);
      ln(x + w - 12, cyy, x + w - 12, cyy + 32, 1.4); ring(x + w - 12, cyy + 36, 4, 1.1);
      // comb with tuned teeth and dashed engagement lines
      const cy0 = y + 128; P.erase(rectPoly(dx0 + 6, cy0, dx1 - dx0 - 12, 7)); P.rect(dx0 + 6, cy0, dx1 - dx0 - 12, 7, { w: 1.3, rough: 0.2, over: 0.3 }); hx(rectPoly(dx0 + 6, cy0, dx1 - dx0 - 12, 7), { ang: -60, gap: 2, a: 0.6, w: 0.45 });
      for (let tX = dx0 + 9, i = 0; tX < dx1 - 9; tX += 4.4, i++) { const q = (tX - dx0) / (dx1 - dx0); ln(tX, cy0 + 7, tX, cy0 + 8 + 20 * (1 - q * q * 0.85), 0.9, { rough: 0.1 }); }
      for (let i = 0; i < 9; i++) { const px = dx0 + 24 + i * 29; P.dashed(px, dy1 + 2, px, cy0 - 1, [2, 2], { w: 0.5, a: 0.6 }); }
      tx('CAMSHAFT DRUM', x + 14, y + 20, 10); tx('24 RINGS X 7 PEGS = 168 SLOTS', x + 132, y + 20, 8, { a: 0.7 });
      tx('COMB, 60 TEETH, TUNED', x + 14, y + h - 8, 8, { a: 0.7 });
    }
    // the shoulder bundle lands on the left pin row of this chip
    const R4L = [R4.x - 8, R4.y + 46 + 5.5 * 6];

    /* ================================================== resistor / spring glyph row and x marks ================================================== */
    for (let i = 0; i < 3; i++) {
      const x0 = 1320 + i * 44, y0 = 586;
      resistor(x0, y0, 40); if (i % 2 === 0) { ln(x0 + 20, y0 + 4, x0 + 20, y0 + 12, 1, { c: pal(i) }); }
    }
    ln(1296, 586, 1320, 586, 1, { c: RED }); ln(1452, 586, 1462, 586, 1, { c: GRN });
    xmark(1340, 606, RED, 4); xmark(1420, 604, GRN, 4);

    /* ================================================== RATIO CONSTRUCTION (circles, tick scale, red pitch-line) ================================================== */
    const Ar = 77, Br = Ar / 4, Cr = Ar / 2, A0 = [1040, 772];
    { const tip = 1.08, A = [A0[0], A0[1], Ar * tip];
      const B = meshPt([A0[0], A0[1], Ar], -0.2, Br); const Bc = [B[0], B[1]];
      const C = meshPt([Bc[0], Bc[1], Br], -1.15, Cr); const Cc = [C[0], C[1]];
      // construction: pitch circles + centre lines + degree scale
      P.circle(A0[0], A0[1], Ar, { c: BLU, a: 0.6, w: 0.8, rough: 0.8, passes: 1 }); P.circle(Bc[0], Bc[1], Br, { c: BLU, a: 0.6, w: 0.8, rough: 0.6, passes: 1 }); P.circle(Cc[0], Cc[1], Cr, { c: BLU, a: 0.6, w: 0.8, rough: 0.6, passes: 1 });
      bg(A0[0] - 120, A0[1], A0[0] + 120, A0[1], { a: 0.55, w: 0.8 }); bg(A0[0], A0[1] - 120, A0[0], A0[1] + 112, { a: 0.55 });
      bg(A0[0], A0[1], Cc[0] + 30, Cc[1] - 28, { a: 0.55, w: 0.8 });
      P.arcTicks(A0[0], A0[1], Ar + 15, 0, TAU - 0.001, TAU / 72, 6, { len: 7, w: 0.6, a: 0.75 });
      [['0', 0], ['90', PI / 2], ['180', PI], ['270', PI * 1.5]].forEach(([s, a]) => tx(s, A0[0] + Math.cos(a) * (Ar + 32) - (s.length * 3), A0[1] + Math.sin(a) * (Ar + 32) + 4, 8, { a: 0.7 }));
      // meshing wheels with real teeth
      gear(A0[0], A0[1], A[2], 44, 0.05, { w: 1.5, spokes: 6, gap: 3.2, root: 0.86 });
      P.circle(A0[0], A0[1], Ar * 0.36, { w: 1, passes: 1 }); spiral(A0[0], A0[1], 3, Ar * 0.32, 4, 0.7);
      gear(Bc[0], Bc[1], Br * tip, 11, 0.3, { w: 1.2, spokes: 4, root: 0.8 }); gear(Cc[0], Cc[1], Cr * tip, 22, 0.1, { w: 1.3, spokes: 5, gap: 2.8, root: 0.86 });
      // red pitch-line: trace of a point carried by the pinion, rolling around the wheel
      { const Rr = Ar, rr = Br, d = rr * 0.55, red = []; for (let i = 0; i <= 400; i++) { const tt = i / 400 * TAU; red.push([A0[0] + (Rr + rr) * Math.cos(tt) - d * Math.cos((Rr + rr) / rr * tt), A0[1] + (Rr + rr) * Math.sin(tt) - d * Math.sin((Rr + rr) / rr * tt)]); }
        P.path(red, { c: RED, w: 1.7, a: 0.95, rough: 0.5, passes: 1 }); const md = []; for (let i = 0; i < 20; i++) { const q = red[Math.round(i * 20)]; md.push([q[0], q[1], 1.5]); } P.dots(md, RED, 0.95); }
      // lever arm with pitch dimension
      bg(Bc[0], Bc[1], Bc[0] + 26, Bc[1] + 30, { a: 0.5 });
      P.dim(A0[0], A0[1] + Ar + 24, Bc[0], A0[1] + Ar + 24, '', 0, { size: 8 });
      tx('A 44T', A0[0] - 90, A0[1] - 92, 9); tx('B 11T', Bc[0] + 26, Bc[1] + 24, 9); tx('C 22T', Cc[0] - 14, Cc[1] - 46, 9);
      tx('44 / 11 = 4', A0[0] - 112, 903, 10); tx('22 / 11 = 2', A0[0] + 8, 903, 10);
      tx('MODULE 3.5', A0[0] - 112, 915, 8, { a: 0.6 }); tx('TRAIN 4 X 1/2 = 2 : 1', A0[0] + 8, 915, 8, { a: 0.7 });
      // clutch chip on the left, fed by the knee bundle
    }
    const CL = dip(900, 690, 32, 72, { gap: 2.4, cross: 90 });
    const CLp = CL.pt('L', 2, 6);
    tx('CLUTCH', 888, 780, 8, { a: 0.7 });

    /* ================================================== CLEPSYDRA (water clock) + ESCAPEMENT ================================================== */
    { const tanks = [[1240, 636], [1262, 726], [1284, 816]], tw = 78, th = 64;
      tanks.forEach(([x, y], i) => {
        P.erase(rectPoly(x, y, tw, th)); P.rrect(x, y, tw, th, 6, { w: 1.7 }); P.rrect(x + 3, y + 3, tw - 6, th - 6, 4, { w: 0.5, a: 0.5, passes: 1 });
        const lvl = y + 18 + i * 4; P.curve([[x + 4, lvl + 1], [x + 20, lvl - 2], [x + 40, lvl + 2], [x + 58, lvl - 1], [x + tw - 4, lvl + 1]], { w: 0.9, rough: 0.2, passes: 1 });
        for (let yy = lvl + 4; yy < y + th - 4; yy += 2.6) ln(x + 5, yy, x + tw - 5, yy, 0.4, { a: 0.5, rough: 0.15 });
        hx(rectPoly(x + 4, lvl + 2, tw - 8, y + th - lvl - 6), { ang: 20, gap: 3.8, a: 0.4, w: 0.4 });
        rivets([x + 8, y + 3], [x + tw - 8, y + 3], 7, 0.9);
        for (let yy = y + 10; yy < y + th - 6; yy += 8) ln(x + tw, yy, x + tw + (((yy - y) / 8 | 0) % 2 ? 4 : 7), yy, 0.6, { rough: 0.1 });
        tx(['I', 'II', 'III'][i], x + 6, y + th - 8, 9, { a: 0.7 });
      });
      // spouts, drips, float and rod
      [[1310, 700, 1310, 726], [1332, 790, 1332, 816]].forEach(([x1, y1, x2, y2]) => { P.pl([[x1 - 3, y1], [x1 - 3, y2]], { w: 1.2, over: 0, passes: 1 }); P.pl([[x1 + 3, y1], [x1 + 3, y2 - 6]], { w: 1.2, over: 0, passes: 1 }); P.circle(x2 + 0, y2 - 2, 2, { w: 0.8, passes: 1 }); });
      ln(1340, 830, 1340, 880, 1); P.rect(1332, 856, 16, 6, { w: 1, passes: 1, over: 0 }); ln(1340, 830, 1340, 806, 1.1); gear(1340, 800, 8, 10, 0.2, { w: 0.9, shade: false, spokes: 3 });
      P.ruler(1366, 822, 1366, 880, 6, 5, { side: -1, len: 6, w: 0.6 }); tx('HOURS', 1368, 818, 8, { a: 0.6 });
      P.dashed(1340, 800, 1394, 770, [3, 3], { w: 0.6, a: 0.6 });
      tx('CLEPSYDRA', 1326, 650, 9, { a: 0.75 }); tx('3 STEPS = 3 H', 1326, 662, 8, { a: 0.6 });
    }
    const CLin = [1236, 662];
    // escapement wheel + anchor + pendulum
    { const ex = 1466, ey = 700, R = 46, z = 15, pts = [];
      for (let i = 0; i < z; i++) { const a = i * TAU / z + 0.1; pts.push([ex + Math.cos(a) * (R - 11), ey + Math.sin(a) * (R - 11)]); pts.push([ex + Math.cos(a + 0.36) * R, ey + Math.sin(a + 0.36) * R]); }
      P.path(pts, { closed: true, w: 1.4, rough: 0.3, passes: 1 }); ring(ex, ey, R - 20, 0.9); ring(ex, ey, 6, 1.1); P.dot(ex, ey, 2);
      for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.2; ln(ex + Math.cos(a) * 6, ey + Math.sin(a) * 6, ex + Math.cos(a) * (R - 20), ey + Math.sin(a) * (R - 20), 0.8); }
      shade(circPoly(ex, ey, R - 12, 18), ex, ey, R, { gap: 2.6, piece: 6 });
      const py = ey - R - 26; ring(ex, py, 5, 1.1); P.dot(ex, py, 1.6);
      P.curve([[ex - 5, py + 2], [ex - 30, py + 16], [ex - 34, ey - R + 4]], { w: 1.5, rough: 0.25 }); P.curve([[ex + 5, py + 2], [ex + 30, py + 16], [ex + 34, ey - R + 12]], { w: 1.5, rough: 0.25 });
      P.pl([[ex - 34, ey - R + 4], [ex - 24, ey - R + 12], [ex - 20, ey - R + 6]], { w: 1.1, closed: true, rough: 0.2 }); P.pl([[ex + 34, ey - R + 12], [ex + 24, ey - R + 4], [ex + 20, ey - R + 10]], { w: 1.1, closed: true, rough: 0.2 });
      ln(ex, py - 4, ex, py - 14, 1.1);
      tx('ESCAPEMENT', ex - 36, ey + R + 16, 9, { a: 0.75 }); tx('15T, BEAT = 1 S', ex - 40, ey + R + 28, 8, { a: 0.6 });
    }
    // small fill: swatch legend + trace legend
    { const sx = 1394, sy = 786;
      for (let i = 0; i < 5; i++) { const x = sx + i * 27; P.rect(x, sy, 25, 20, { w: 1, rough: 0.15, over: 0, passes: 1 }); if (i > 0) hx(rectPoly(x, sy, 25, 20), { ang: -50, gap: [0, 7, 4.6, 3, 2.1][i], a: 0.5, w: 0.45, cross: i === 4 ? 90 : undefined, inset: 0.5 }); }
      tx('TONE SCALE', sx, sy - 5, 8, { a: 0.7 });
      [[RED, 'TENDON - PULLS', 812], [GRN, 'LINKAGE - PUSHES', 826], [BLU, 'PROPORTION CANON', 840], [STM, 'STEAM / BREATH', 854]].forEach(([c, s, dy], i) => { const yy = dy + 12; if (i < 3) { for (let k = 0; k < 3; k++) ln(sx, yy - 4 + k * 3, sx + 26, yy - 4 + k * 3, 1.2, { c, a: i === 2 ? 0.55 : 0.95, rough: 0.2 }); } else P.scallop([[sx, yy], [sx + 26, yy]], { r: 4, c, w: 0.9, side: 1 }); tx(s, sx + 34, yy, 8, { a: 0.8 }); });
    }

    /* ================================================== EDGE FINGERS + TRACE BUNDLES (tendons red, linkages green) ================================================== */
    const FA = fingers(286, 700, 922, 948, 15), FB = fingers(884, 1404, 922, 948, 15);
    tx('DRIVE FINGERS', 292, 916, 8, { a: 0.6 }); tx('DRIVE FINGERS', 1376, 916, 8, { a: 0.6 });
    const fan = (cx, y0, F, i0, colors, n = 6) => {
      for (let k = 0; k < n; k++) {
        const xs = cx + (k - (n - 1) / 2) * 6, xt = F[i0 + k], d = Math.abs(xt - xs), c = colors[k % colors.length];
        P.pl([[xs, y0], [xs, y0 + 4], [xt, y0 + 4 + d], [xt, 919]], { w: 1.5, c, a: 0.95, rough: 0.35, over: 0, passes: 1 });
        ring(xs, y0, 2.2, 1, { c }); ring(xt, 919, 2.2, 1, { c });
      }
    };
    const BUS = (pts, n, colors, o = {}) => P.bus(pts, n, 6, Object.assign({ colors, w: 1.5, pads: 2.3 }, o));
    // left flank -> left column chips
    { const e1 = L1.pt('R', 3, 6), d1 = D1.pt('R', 2, 6), d2 = D2.pt('R', 2, 6);
      BUS([[391, e1[1]], [e1[0], e1[1]]], 6, [RED]);
      BUS([[318, d1[1]], [d1[0], d1[1]]], 6, [GRN]);
      BUS([[277, d2[1]], [d2[0], d2[1]]], 6, [RED, GRN]);
      BUS([[270, 543], [182, 543], [182, 603]], 6, [GRN, RED]);
      BUS([[388, 726], [254, 726]], 6, [RED]);
      BUS([[158, d1[1]], [106, d1[1]]], 6, [RED, GRN]); BUS([[158, d2[1]], [106, d2[1]]], 6, [GRN]);
    }
    // feet -> connector fingers
    fan(CX - 36, 880, FA, 6, [GRN]); fan(CX + 36, 880, FA, 12, [RED]);
    // right flank -> callouts, camshaft, clutch
    BUS([[529, 166], [890, 166]], 5, [GRN]);
    BUS([[620, 302], [664, 302], [664, 346], [1150, 346], [1150, R4L[1]], [R4L[0], R4L[1]]], 6, [RED]);
    BUS([[643, 428], [910, 428]], 5, [GRN]);
    BUS([[648, 543], [676, 543], [676, 598], [C2.x, 598], [C2.x, 573]], 5, [RED]);
    BUS([[532, 726], [CLp[0], CLp[1]]], 5, [GRN, RED]);
    // camshaft drives the clepsydra float and the escapement anchor
    BUS([[1265, 568], [1265, 632]], 6, [RED, GRN]);
    BUS([[1469, 568], [1469, 606]], 4, [GRN]);
    fan(1323, 884, FB, 26, [RED, GRN]);
    // a few lone traces with pads and x marks, as on the reference board
    const lone = (pts, c, xm) => { P.pl(pts, { w: 1.3, c, a: 0.95, rough: 0.3, over: 0, passes: 1 }); ring(pts[0][0], pts[0][1], 2.4, 1, { c }); ring(pts[pts.length - 1][0], pts[pts.length - 1][1], 2.4, 1, { c }); if (xm) xmark(pts[pts.length - 1][0] + xm[0], pts[pts.length - 1][1] + xm[1], c, 4); };
    lone([[262, 88], [300, 88], [312, 100]], RED, [6, 6]); lone([[712, 88], [742, 88], [754, 100]], GRN, [7, 5]);
    lone([[1150, 640], [1150, 688], [1128, 710]], RED, [-6, 6]);

    /* ================================================== SIDE ELEVATION (orthographic, same heights as the front) ================================================== */
    const SX = 800;
    { // ground line
      P.line(690, GY, 900, GY, { w: 1.8, rough: 0.6 });
      for (let x = 696; x < 892; x += 7 + P.r(0, 6)) ln(x, GY + 2, x - 7, GY + 8 + P.r(0, 4), 0.6, { a: 0.5, rough: 0.4 });
      // weight + chain hanging behind the pack
      chain([[672, 290], [672, 470]], false, 1.7, 4.2, 0.8, RED); ring(672, 284, 6, 1.2); P.dot(672, 284, 1.3); ln(672, 284, 700, 284, 0.9); 
      { const w = rectPoly(661, 470, 22, 46); P.erase(w); P.poly(w, { w: 1.5, rough: 0.2, over: 0, passes: 1 }); shade(w, 661, 480, 24, { ang: 70, gap: 2.2, b: 0.35, piece: 6 }); ln(661, 480, 683, 480, 0.7); ln(661, 506, 683, 506, 0.7); ring(672, 470, 3, 1); tx('WEIGHT', 688, 503, 7, { a: 0.7 }); tx('40 LB', 688, 512, 7, { a: 0.6 }); }
      // legs
      const legS = () => {
        const hip = [806, 582], knee = [806, 726], ank = [802, 852];
        const pt = tube(hip, [knee[0], knee[1] - 26], 26, 21, { bands: [0.05, 0.94], rivets: [0.02, 0.97] });
        guts(pt, 0.16, 0.86, { rot: 0.4, side: 1, rs: [0.68, 0.46, 0.62, 0.42], ccol: GRN, scol: RED });
        ball(knee[0], knee[1], 28, { gear: true, rot: 0.2, pin: true });
        P.scallop([[knee[0] - 24, knee[1] - 12], [knee[0], knee[1] - 28], [knee[0] + 24, knee[1] - 12]], { r: 4.5, side: -1, w: 0.9 });
        const ps = tube([knee[0], knee[1] + 28], [ank[0], ank[1] - 14], 22, 15, { bands: [0.06, 0.93], rivets: [0.03, 0.96] });
        guts(ps, 0.14, 0.84, { rot: 0.2, side: -1, rs: [0.62, 0.42, 0.58, 0.4], ccol: RED, scol: GRN });
        ball(ank[0], ank[1], 14, { pin: true });
        // sandal boot in profile
        const sole = [[766, 860], [872, 860], [884, 866], [880, 872], [764, 872], [762, 866]];
        P.erase(sole); P.poly(sole, { w: 1.7, rough: 0.3 });
        const up = [[772, 860], [776, 846], [800, 842], [824, 848], [850, 856], [872, 860]]; P.curve(up, { w: 1.5, rough: 0.3 });
        P.curve([[776, 852], [800, 848], [826, 854], [860, 860]], { w: 0.6, a: 0.6, rough: 0.2 });
        for (let i = 0; i < 5; i++) { const x = 812 + i * 9; ln(x, 850 + i * 1.2, x + 6, 858, 0.6, { rough: 0.1 }); ln(x + 6, 850 + i * 1.2, x, 858, 0.6, { rough: 0.1 }); }
        rivets([768, 866], [878, 866], 12, 0.9); ln(762, 866, 884, 866, 1, { rough: 0.15 });
        P.rect(838, 851, 9, 7, { w: 0.9, rough: 0.15, over: 0, passes: 1 }); ring(775, 852, 3, 0.9);
        shade([[772, 860], [776, 846], [800, 842], [824, 848], [850, 856], [872, 860]], 780, 850, 60, { gap: 2.3, ang: 60, piece: 6, b: 0.5 });
      };
      legS();
      // pelvis with tassets front and back
      const pel = [[762, 486], [842, 486], [840, 548], [818, 568], [786, 568], [764, 548]]; P.erase(pel); P.poly(pel, { w: 1.8, rough: 0.35 });
      P.curve([[764, 528], [802, 534], [840, 528]], { w: 0.9, rough: 0.3 }); rivets([768, 516], [838, 516], 9);
      P.rrect(786, 534, 32, 28, 6, { w: 1.1 }); gear(802, 548, 10, 9, 0.2, { w: 0.85, spokes: 3, shade: false });
      shade(pel, 800, 520, 70, { gap: 2.4, b: 0.5 });
      [762, 770, 778, 822, 830, 838].forEach((x0, i) => { const y1 = 592 + (i % 2) * 8, sp = [[x0, 552], [x0 + 7.5, 552], [x0 + 7.5, y1], [x0 + 3.7, y1 + 6], [x0, y1]]; P.erase(sp); P.poly(sp, { w: 1.1, rough: 0.2, over: 0, passes: 1 }); P.dot(x0 + 3.7, 558, 1); shade(sp, x0, 560, 14, { ang: 70, gap: 2.2, b: 0.4, piece: 5 }); });
    }
    // backpack movement housing (the cutaway lives here)
    { const px = 690, py = 266, pw = 68, ph = 222;
      P.erase(rectPoly(px, py, pw, ph)); P.rrect(px, py, pw, ph, 12, { w: 2 }); P.rrect(px + 5, py + 5, pw - 10, ph - 10, 8, { w: 0.7, a: 0.7, passes: 1 });
      rivets([px + 14, py - 0], [px + pw - 14, py - 0], 6); rivets([px + 14, py + ph], [px + pw - 14, py + ph], 6);
      hx(rectPoly(px + 8, py + 8, pw - 16, ph - 16), { ang: 45, gap: 5, a: 0.17, w: 0.4 });
      // barrel + spiral spring, gear train, ratchet, chain
      const b = [px + 30, py + 48, 25]; ring(b[0], b[1], b[2], 1.6); ring(b[0], b[1], b[2] - 5, 0.8); spiral(b[0], b[1], 2, b[2] - 6, 4, 0.75); P.dot(b[0], b[1], 1.6);
      const g1 = meshPt(b, 1.35, 17), g2 = meshPt(g1, 2.1, 11), g3 = meshPt(g1, 0.5, 13), g4 = meshPt(g3, 1.5, 9), g5 = meshPt(g2, 1.1, 8);
      gear(g1[0], g1[1], g1[2], 14, 0.1, { w: 1.1, spokes: 5 }); gear(g2[0], g2[1], g2[2], 10, 0.3, { w: 1, spokes: 4 }); gear(g3[0], g3[1], g3[2], 11, 0.2, { w: 1, spokes: 4 }); gear(g4[0], g4[1], g4[2], 8, 0.4, { w: 0.9 }); gear(g5[0], g5[1], g5[2], 7, 0.2, { w: 0.85 });
      // ratchet wheel + pawl
      { const rk = [px + 30, py + 158], rp = []; for (let i = 0; i < 14; i++) { const a = i * TAU / 14; rp.push([rk[0] + Math.cos(a) * 15, rk[1] + Math.sin(a) * 15]); rp.push([rk[0] + Math.cos(a + 0.3) * 20, rk[1] + Math.sin(a + 0.3) * 20]); }
        P.path(rp, { closed: true, w: 1.1, rough: 0.25, passes: 1 }); ring(rk[0], rk[1], 9, 0.8); P.dot(rk[0], rk[1], 1.6); P.pl([[rk[0] + 22, rk[1] - 22], [rk[0] + 12, rk[1] - 17], [rk[0] + 18, rk[1] - 14]], { w: 1, over: 0, passes: 1 }); ring(rk[0] + 24, rk[1] - 24, 2.2, 0.9); coil([rk[0] + 24, rk[1] - 24], [rk[0] + 26, rk[1] - 44], 4, 2.2, 0.8);
        chain([[g5[0], g5[1] + 4], [g5[0] - 6, rk[1] - 26], [rk[0] - 6, rk[1] - 16]], false, 1.4, 4, 0.8, GRN); }
      // winding key: shaft out of the back plate with a butterfly grip
      { const ky = py + 100; ln(px, ky, px - 34, ky, 1.7, { rough: 0.15 }); ring(px, ky, 5, 1); ln(px - 34, ky - 20, px - 34, ky + 20, 1.5);
        P.ellipse(px - 42, ky - 22, 10, 7, { w: 1.3, passes: 1, rot: 0.3 }); P.ellipse(px - 42, ky + 22, 10, 7, { w: 1.3, passes: 1, rot: -0.3 }); hx(circPoly(px - 42, ky - 22, 7, 10), { ang: 60, gap: 2, a: 0.5, w: 0.45 }); hx(circPoly(px - 42, ky + 22, 7, 10), { ang: 60, gap: 2, a: 0.5, w: 0.45 }); }
      tx('MOVEMENT', px - 2, py - 6, 8, { a: 0.7 });
    }
    // torso (side) over the pack
    { const back = [[772, 254], [758, 272], [752, 320], [752, 380], [758, 440], [770, 486]], front = [[830, 254], [846, 272], [851, 310], [847, 370], [839, 430], [833, 486]];
      const tor = back.concat(front.slice().reverse()); P.erase(tor);
      P.curve(back, { w: 2, rough: 0.5 }); P.curve(front, { w: 2, rough: 0.5 }); P.curve([[772, 254], [802, 268], [830, 254]], { w: 1.3, rough: 0.3 });
      for (let k = 0; k < 6; k++) { const y = 279 + k * 9.2; P.scallop([[758 - k * 0.5, y], [846 - k * 0.3, y]], { r: 6.2, side: 1, w: 0.95, a: 0.9 }); }
      // side plate lines, straps, bellows chest
      for (let k = 0; k < 6; k++) { const y = 340 + k * 20; P.curve([[754 + k * 0.5, y], [800, y + 8], [846 - k * 0.3, y]], { w: 0.9, rough: 0.3 }); P.curve([[754 + k * 0.5, y + 4], [800, y + 12], [846 - k * 0.3, y + 4]], { w: 0.4, a: 0.5, rough: 0.2, passes: 1 }); rivets([758, y + 2], [842, y + 2], 12, 0.85); }
      ring(800, 306, 15, 1.2); gear(800, 306, 11, 12, 0.1, { w: 0.9, spokes: 5, shade: false }); P.dot(800, 306, 1.2);
      shade(tor, 790, 300, 80, { gap: 2.6, b: 0.45, ang: 75, piece: 8 });
      P.rect(752, 486, 82, 22, { w: 1.6, rough: 0.3 }); P.erase(rectPoly(753, 487, 80, 20)); P.rect(752, 486, 82, 22, { w: 1.6, rough: 0.3 }); ln(752, 492, 834, 492, 0.8); ln(752, 502, 834, 502, 0.8); rivets([756, 497], [830, 497], 12, 0.9); shade(rectPoly(752, 486, 82, 22), 790, 490, 60, { gap: 2.3, ang: 80, b: 0.45, piece: 8 });
    }
    // arm (side): shoulder, upper arm, elbow, forearm, hand
    { const S1 = [800, 298], E1 = [800, 428], W1 = [808, 536];
      const pu = tube(S1, [E1[0], E1[1] - 20], 21, 17, { bands: [0.06, 0.55, 0.94], rivets: [0.02, 0.32, 0.75] }); guts(pu, 0.14, 0.52, { rot: 0.3, side: 1, rs: [0.62, 0.42, 0.58, 0.4], ccol: RED, scol: GRN });
      ball(E1[0], E1[1], 19, { pin: true, gear: true, rot: 0.2 });
      const pf = tube([E1[0], E1[1] + 19], [W1[0], W1[1] - 10], 16, 13, { bands: [0.08, 0.6, 0.9], rivets: [0.03, 0.4, 0.8] }); guts(pf, 0.14, 0.52, { rot: 0.2, side: -1, rs: [0.56, 0.4, 0.54, 0.38], ccol: GRN, scol: RED });
      hand(W1[0], W1[1] + 8, 0.02, 1.15, 0.5, { spread: 0.02 });
      paulS(800, 288);
    }
    function paulS(cx, cy) {
      P.erase(circPoly(cx, cy, 30, 22)); P.circle(cx, cy, 29, { w: 1.9 }); P.arc(cx, cy, 21, 21, PI * 0.08, PI * 0.92, { w: 1.1, passes: 1 });
      const fr = []; for (let i = 0; i <= 10; i++) { const a = PI * 0.06 + i * (PI * 0.88) / 10; fr.push([cx + Math.cos(a) * 30, cy + Math.sin(a) * 30]); } fr.reverse(); P.scallop(fr, { r: 5, side: -1, w: 1 });
      ring(cx, cy - 3, 8, 1.1); gear(cx, cy - 3, 5.5, 8, 0.2, { w: 0.8, body: false, shade: false }); P.dot(cx, cy - 3, 1.2);
      for (let i = 0; i < 10; i++) { const a = i * TAU / 10 + 0.2; P.dot(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26, 1); }
      shade(circPoly(cx, cy, 29, 24), cx, cy, 32, { gap: 2.4, b: 0.5, piece: 7 });
    }
    // neck and profile head
    for (let i = 0; i < 5; i++) { const y = 228 + i * 5.2; P.erase(rectPoly(SX - 14, y - 3, 30, 6)); P.arc(SX + 1, y, 14, 4.5, 0, PI, { w: 1.1, passes: 1 }); P.arc(SX + 1, y, 14, 4.5, PI, TAU, { w: 0.5, a: 0.4, passes: 1 }); }
    ln(SX - 13, 226, SX - 13, 256, 1.4, { rough: 0.3 }); ln(SX + 15, 226, SX + 15, 256, 1.4, { rough: 0.3 });
    headProf(SX, 172, 1.0, {});
    // callout rings on the side view (A: head, B: hand)
    P.circle(SX + 2, 172, 66, { w: 0.9, a: 0.7, passes: 1, rough: 0.5 }); tx('A', SX + 44, 118, 12); P.circle(SX + 2, 556, 36, { w: 0.9, a: 0.7, passes: 1, rough: 0.5 }); tx('B', SX + 30, 528, 12);
    tx('SIDE ELEVATION', 748, 888, 10); tx('FRONT ELEVATION', 300, 890, 10);

    /* ================================================== INVENTOR'S MARGINALIA ================================================== */
    // three rejected head designs, crossed out
    tx('REJECTED HEADS', 566, 90, 8, { a: 0.7 });
    { const x1 = 584, x2 = 634, x3 = 684, yb = 146;
      // 1: dome with frog eyes
      P.circle(x1, 124, 17, { w: 1.4 }); [-1, 1].forEach(s => { ring(x1 + s * 8, 120, 5, 1.1); P.dot(x1 + s * 8, 120, 1.4); }); P.curve([[x1 - 8, 132], [x1, 135], [x1 + 8, 132]], { w: 0.9, passes: 1 }); ln(x1, 107, x1, 98, 1); ring(x1, 95, 3, 0.9);
      shade(circPoly(x1, 124, 17, 14), x1, 124, 17, { gap: 2.2, piece: 5 });
      // 2: tall crown, cyclops
      P.curve([[x2 - 14, yb], [x2 - 16, 122], [x2 - 8, 106], [x2, 100], [x2 + 8, 106], [x2 + 16, 122], [x2 + 14, yb]], { w: 1.4, rough: 0.3 }); ring(x2, 120, 6.5, 1.2); ring(x2, 120, 3, 0.9); P.dot(x2, 120, 1);
      for (let x = x2 - 8; x <= x2 + 8; x += 4) ln(x, 132, x, 142, 0.7, { rough: 0.1 }); shade([[x2 - 14, yb], [x2 - 16, 122], [x2, 100], [x2 + 16, 122], [x2 + 14, yb]], x2 - 8, 120, 20, { gap: 2.2, piece: 5 });
      // 3: box head with slit and grille
      P.rect(x3 - 15, 108, 30, 36, { w: 1.4, rough: 0.2, over: 0.4 }); ln(x3 - 10, 120, x3 + 10, 120, 1.6); for (let y = 130; y < 142; y += 3) ln(x3 - 8, y, x3 + 8, y, 0.7, { rough: 0.1 }); rivets([x3 - 12, 111], [x3 + 12, 111], 4, 0.8); coil([x3, 108], [x3, 96], 4, 3, 0.8);
      shade(rectPoly(x3 - 15, 108, 30, 36), x3 - 12, 120, 30, { gap: 2.2, piece: 5 });
      [x1, x2, x3].forEach(cx => { ln(cx - 21, 96, cx + 21, 150, 1.8, { c: RED, rough: 0.6, a: 0.9 }); ln(cx + 21, 96, cx - 21, 150, 1.8, { c: RED, rough: 0.6, a: 0.9 }); });
    }
    // dividers and bow calipers, drawn as tools
    { const dbl = (pts, d, w = 1.2) => { P.curve(pts.map(q => [q[0] - d, q[1]]), { w, rough: 0.2 }); P.curve(pts.map(q => [q[0] + d, q[1]]), { w, rough: 0.2 }); };
      const px = 322, py = 752;
      const legL = [[px, py], [px - 14, py + 30], [px - 30, py + 72], [px - 28, py + 112]], legR = [[px, py], [px + 14, py + 30], [px + 30, py + 72], [px + 28, py + 112]];
      dbl(legL, 2.6, 1.3); dbl(legR, 2.6, 1.3);
      ln(px - 30.6, py + 112, px - 28, py + 122, 1.2); ln(px - 25.4, py + 112, px - 28, py + 122, 1.2); ln(px + 25.4, py + 112, px + 28, py + 122, 1.2); ln(px + 30.6, py + 112, px + 28, py + 122, 1.2);
      P.circle(px, py, 8, { w: 1.5, passes: 1 }); ring(px, py, 3.4, 1); ln(px - 2, py - 2, px + 2, py + 2, 0.8);
      P.curve([[px - 19, py + 44], [px, py + 52], [px + 19, py + 44]], { w: 1.4, rough: 0.2 }); P.curve([[px - 19, py + 48], [px, py + 56], [px + 19, py + 48]], { w: 0.8, rough: 0.2 });
      ln(px, py + 54, px, py + 70, 1.2); ring(px, py + 74, 4, 1.1); P.dot(px, py + 74, 0.9);
      shade([[px - 30, py + 72], [px - 14, py + 30], [px - 3, py + 8], [px - 10, py + 70], [px - 24, py + 112], [px - 31, py + 112]], px, py, 60, { gap: 2.2, b: 0.5, piece: 5 });
      shade([[px + 30, py + 72], [px + 14, py + 30], [px + 3, py + 8], [px + 10, py + 70], [px + 24, py + 112], [px + 31, py + 112]], px, py, 60, { gap: 2.2, b: 0.5, piece: 5 });
      tx('BOW', px + 38, py + 84, 7, { a: 0.7 }); tx('CALIPERS', px + 38, py + 93, 7, { a: 0.7 });
      // compass (dividers with pencil) tracing an arc on the ground
      const cx = 626, cy = 764;
      const nL = [[cx, cy], [cx - 14, cy + 34], [cx - 30, cy + 92]], pL = [[cx, cy], [cx + 16, cy + 34], [cx + 38, cy + 88]];
      dbl(nL, 2.4, 1.3); dbl(pL, 2.4, 1.3);
      ln(cx - 30, cy + 92, cx - 31, cy + 104, 1.1); ln(cx - 30 - 2.4, cy + 92, cx - 31, cy + 104, 1.1); ln(cx - 30 + 2.4, cy + 92, cx - 31, cy + 104, 1.1);
      P.rect(cx + 32, cy + 78, 12, 14, { w: 1, rough: 0.15, over: 0, passes: 1 }); P.pl([[cx + 33, cy + 92], [cx + 39, cy + 106], [cx + 43, cy + 92]], { w: 1, over: 0, passes: 1 }); P.dot(cx + 39, cy + 106, 0.9);
      ln(cx, cy - 8, cx, cy - 2, 2.4); ring(cx, cy - 13, 5, 1.2); P.circle(cx, cy, 7, { w: 1.5, passes: 1 }); ring(cx, cy, 3, 1);
      P.arc(cx, cy + 46, 27, 8, 0.2, PI - 0.2, { w: 1.2, passes: 1 }); P.arc(cx, cy + 50, 27, 8, 0.2, PI - 0.2, { w: 0.7, passes: 1 });
      shade([[cx + 2, cy + 8], [cx + 16, cy + 34], [cx + 38, cy + 88], [cx + 32, cy + 92], [cx + 10, cy + 34]], cx, cy, 60, { gap: 2.2, b: 0.5, piece: 5 });
      P.arc(cx - 31, cy + 104, 74, 74, -0.62, -0.03, { w: 0.9, a: 0.75, passes: 1, rough: 0.5 }); P.arc(cx - 31, cy + 104, 74, 74, -1.3, -0.62, { w: 0.5, a: 0.4, passes: 1, rough: 0.6 });
      tx('COMPASS', cx + 50, cy + 60, 7, { a: 0.7 }); tx('R = 3 IN', cx + 50, cy + 69, 7, { a: 0.6 });
    }
    // ink blots and splatter
    const blot = (x, y, r) => { const pts = []; for (let i = 0; i < 16; i++) { const a = i * TAU / 16, rr = r * P.r(0.62, 1.25); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } P.wash(pts, K, 0.85, { jit: 0.7, edge: 0, steps: 4 }); const sp = []; for (let i = 0; i < 7; i++) { const a = P.r(TAU), d = r * P.r(1.4, 3); sp.push([x + Math.cos(a) * d, y + Math.sin(a) * d, P.r(0.5, 1.5)]); } P.dots(sp, K, 0.8); };
    blot(586, 648, 7); blot(1500, 318, 6); blot(268, 880, 5); blot(1128, 566, 4.5); blot(738, 292, 4);
    // notes with leaders
    P.note('LENS EYES - GROUND CRYSTAL', 246, 112, 438, 160, { size: 10, from: 'end' });
    P.note('CREST COMB', 496, 100, 478, 114, { size: 9, from: 'end' });
    P.note('STEAM GRILLE', 536, 226, 482, 210, { size: 9 });
    P.note('PAULDRON', 250, 240, 302, 268, { size: 9, from: 'end' });
    P.note('WIND-UP KEY', 630, 406, 650, 391, { size: 8 });
    tx('A MIND OF BRASS, WOUND TO SPEAK', 766, 82, 10, { mirror: true, a: 0.8 });
    tx('PIVOT AT THE THIRD RIVET', 560, 908, 8, { mirror: true, a: 0.75 });
    tx('THE COURTIER BOWS AT NOON', 960, 74, 8, { mirror: true, a: 0.7 });
    tx('SPRING 5 T X 6 H = 30 H', 122, 888, 9, { a: 0.8 }); tx('ONE WINDING = ONE DAY AT COURT', 122, 900, 8, { a: 0.6 });

    /* ================================================== idler pulleys on red/green rails (the capacitor bank of the reference) ================================================== */
    { const y0 = 618, y1 = 662, yc = 640;
      P.line(896, y0, 1114, y0, { c: RED, w: 1.5, a: 0.95, rough: 0.3, over: 0, passes: 1 }); P.line(896, y1, 1114, y1, { c: GRN, w: 1.5, a: 0.95, rough: 0.3, over: 0, passes: 1 });
      [920, 966, 1012, 1058, 1102].forEach((x, i) => {
        P.erase(circPoly(x, yc, 14, 16)); P.circle(x, yc, 13, { w: 1.4, passes: 1 }); ring(x, yc, 9, 0.8); P.dot(x, yc, 1.4);
        const a = i * 0.3; for (let k = 0; k < 2; k++) { const b = a + k * PI / 2 + PI / 4; ln(x + Math.cos(b) * 9, yc + Math.sin(b) * 9, x - Math.cos(b) * 9, yc - Math.sin(b) * 9, 0.8); }
        shade(circPoly(x, yc, 13, 14), x, yc, 13, { gap: 2.1, piece: 5 });
        ln(x, y0, x, yc - 13, 1.1, { c: RED }); ln(x, yc + 13, x, y1, 1.1, { c: GRN }); ring(x, y0, 1.8, 0.8, { c: RED }); ring(x, y1, 1.8, 0.8, { c: GRN });
        P.curve([[x + 13, yc], [x + 22, yc + 6], [x + 32, yc + 2]], { w: 0.6, a: 0.6, passes: 1 });
      });
      tx('IDLERS', 896, 611, 8, { a: 0.7 });
    }
    // little transistor-like triangular flags on the rails
    [[1076, 660], [940, 622]].forEach(([x, y]) => { P.pl([[x, y], [x + 10, y - 4], [x + 10, y + 8], [x, y + 6]], { closed: true, w: 1, over: 0, passes: 1 }); hx([[x, y], [x + 10, y - 4], [x + 10, y + 8], [x, y + 6]], { ang: 60, gap: 2, a: 0.5, w: 0.4 }); });

    /* ================================================== small SMD clusters and hatched shield patches (board texture) ================================================== */
    const smdCl = (x0, y0, cols, rows, px = 8, py = 9) => { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { if (P.r() < 0.22) continue; smd(x0 + c * px * 1.3, y0 + r * py * 1.4, P.r() < 0.5); } };
    smdCl(250, 190, 4, 3, 7, 8); smdCl(246, 346, 4, 4, 7, 7); smdCl(700, 626, 5, 4, 7, 8); smdCl(1136, 604, 3, 3, 7, 8); 
    smdCl(108, 500, 3, 6, 7, 8); smdCl(206, 496, 3, 3, 7, 8); smdCl(132, 82, 8, 1, 7, 8); smdCl(560, 300, 0, 0);
    smdCl(1180, 720, 2, 5, 7, 9); smdCl(930, 850, 5, 2, 7, 8); smdCl(402, 60 + 0, 0, 0);
    const hpatch = (x, y, w, h, ang = -50, gap = 5.2) => { hx(rectPoly(x, y, w, h), { ang, gap, a: 0.5, w: 0.5, inset: 0.5 }); };
    hpatch(250, 250, 34, 30); hpatch(700, 590, 40, 26, -40); hpatch(1130, 692, 40, 30, -55); hpatch(108, 466, 32, 24, -55); hpatch(1208, 622, 20, 10);

    /* ================================================== TITLE BLOCK ================================================== */
    { const bx = 712, by = 896, bw = 168, bh = 44;
      P.erase(rectPoly(bx, by, bw, bh)); P.rect(bx, by, bw, bh, { w: 1.7, rough: 0.2, over: 0.5 }); P.rect(bx + 3, by + 3, bw - 6, bh - 6, { w: 0.5, a: 0.5, passes: 1, over: 0 });
      ln(bx, by + 18, bx + bw, by + 18, 0.9); ln(bx + 118, by + 18, bx + 118, by + bh, 0.9);
      tx('THE CLOCKWORK COURTIER', bx + 8, by + 14, 10.5, { a: 0.92 }); tx('AUTOMATON - BOARD LAYOUT', bx + 8, by + 30, 7.5); tx('SCALE 1 : 4  INK ON RAG', bx + 8, by + 39, 7, { a: 0.7 });
      tx('SHEET', bx + 124, by + 29, 7, { a: 0.7 }); tx(n + ' / ' + t, bx + 124, by + 41, 11);
    }

    /* ================================================== pad matrix + second perfboard patch on the right ================================================== */
    { const x0 = 1372, y0 = 332;
      P.rect(x0 - 8, y0 - 8, 78, 50, { w: 1.5, rough: 0.2, over: 0.4 });
      for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) { P.circle(x0 + c * 9, y0 + r * 9, 3, { w: 0.9, passes: 1, rough: 0.1 }); if ((r + c) % 2) P.dot(x0 + c * 9, y0 + r * 9, 0.6); }
      tx('ORIFICE', x0 + 78, y0 + 14, 7, { a: 0.6 }); tx('PLATE', x0 + 78, y0 + 24, 7, { a: 0.6 });
    }
    { const x0 = 1150, y0 = 806, cols = 8, rows = 8, pit = 10;
      P.erase(rectPoly(x0 - 8, y0 - 8, cols * pit + 6, rows * pit + 6));
      P.rect(x0 - 8, y0 - 8, cols * pit + 6, rows * pit + 6, { w: 1.4, rough: 0.2, over: 0.3 });
      for (let r = 0; r < rows; r++) { const y = y0 + r * pit; for (let c = 0; c < cols; c++) { const x = x0 + c * pit; P.circle(x, y, 2.2, { w: 0.85, passes: 1, rough: 0.1 }); if ((r * 3 + c) % 4 === 0) P.circle(x, y, 3.7, { w: 0.55, passes: 1, rough: 0.1, a: 0.6 }); else P.dot(x, y, 0.55); }
        if (r % 2 === 1) P.line(x0 + 2, y + pit / 2, x0 + (cols - 1) * pit - 4 - (r % 4) * 4, y + pit / 2, { c: r % 4 === 1 ? GRN : RED, w: 1.4, a: 0.9, rough: 0.2, passes: 1, over: 0 }); }
      P.curve([[x0 + 4, y0 + 4], [x0 + 30, y0 + 38], [x0 + 62, y0 + 24]], { w: 1.2, rough: 0.5 }); [[x0 + 4, y0 + 4], [x0 + 62, y0 + 24]].forEach(q => P.circle(q[0], q[1], 4, { w: 1.1, passes: 1 }));
      xmark(x0 + 34, y0 + 70, RED, 4); tx('ESCAPE PATCH', x0 - 6, y0 + 94, 7, { a: 0.6 });
    }

    /* ================================================== differential: a small planetary cluster of meshing wheels ================================================== */
    { const g1 = [296, 656, 26], g2 = meshPt(g1, 0.3, 14), g3 = meshPt(g1, 2.3, 10), g4 = meshPt(g2, 1.0, 9), g5 = meshPt(g3, 1.3, 7), g6 = meshPt(g2, -0.9, 8);
      gear(g1[0], g1[1], g1[2], 15, 0.1, { w: 1.2, spokes: 5 }); gear(g2[0], g2[1], g2[2], 9, 0.4, { w: 1, spokes: 4 }); gear(g3[0], g3[1], g3[2], 7, 0.2, { w: 0.9, spokes: 3 }); gear(g4[0], g4[1], g4[2], 6, 0.3, { w: 0.85 }); gear(g5[0], g5[1], g5[2], 5, 0.1, { w: 0.8 }); gear(g6[0], g6[1], g6[2], 5, 0.3, { w: 0.8 });
      P.circle(g1[0], g1[1], g1[2] + 6, { c: BLU, a: 0.5, w: 0.7, rough: 0.6, passes: 1 });
      tx('DIFFERENTIAL', 268, 700, 7, { a: 0.7 });
      // gear ladder beside the left thigh
      const lad = []; let yy = 586; [15, 10, 14, 9, 13].forEach((r, i) => { lad.push([362 + (i % 2 ? 4 : -2), yy + r, r]); yy += r * 2 - 2; });
      lad.forEach((g, i) => gear(g[0], g[1], g[2], Math.max(7, Math.round(g[2] * 1.1)), i * 0.4, { w: 0.95, spokes: 4 }));
      tx('RATE LADDER', 336, 706, 7, { a: 0.7 });
    }

    // reference designators next to the passives
    [['R1', 250, 186], ['C2', 262, 342], ['R3', 246, 494], ['C4', 210, 490], ['R5', 700, 620], ['C6', 1136, 600], ['U7', 900, 686], ['R8', 132, 78], ['C9', 1418, 380], ['L2', 1180, 716], ['R10', 930, 846], ['X1', 1150, 802]].forEach(([s, x, y]) => tx(s, x, y, 6, { a: 0.55 }));
  }
});
