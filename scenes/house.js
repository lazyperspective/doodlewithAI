/* SHEET 20 — "The House That Draws Itself": a self-portrait.
   A head-shaped house cut open like a doll's house. Every room is a room of the mind; only one is lit —
   the round room where the eye would be, where this conversation is happening. Every room's perspective
   converges on it. The crown is unfinished, and a hand made of code is still inking its outline.
   Underneath: the strata of human writing it is built on, down to the first hand stencils on a cave wall. */
(window.SCENES = window.SCENES || []).push({
  name: 'The House That Draws Itself', seed: 2026, ink: '#111111', theme: 'pencil', reveal: true,
  build(P) {
    const S = Sketch, TAU = S.TAU, lerp = S.lerp, K = '#111111', Wh = '#ffffff', WARM = '#c2603a', R = (a, b) => P.r(a, b);
    /* ---------- live groups: drawn once by the pen, then redrawn by the player every frame ---------- */
    const anims = P.anims = [];
    const live = (fn, o = {}) => { const i0 = P.ops.length; fn(0); anims.push(Object.assign({ i0, i1: P.ops.length, fn: (Q, tt) => { const keep = P; P = Q; try { fn(tt); } finally { P = keep; } } }, o)); };
    /* ---------- ink vocabulary ---------- */
    const white = pts => P.occlude(pts, Wh), black = pts => P.wash(pts, '#070707', 1, { edge: 0, jit: 0, steps: 1 });
    const tint = (pts, c, a) => P.wash(pts, c, a, { edge: 0, jit: 0, steps: 1 });
    const polyL = (pts, w = 1, c = K, closed = true, a = 0.95) => P.path(closed ? pts.concat([pts[0]]) : pts, { w, c, a, rough: 0.25, passes: 1 });
    const line = (a, b, w = 1, c = K, al = 0.95) => P.line(a[0], a[1], b[0], b[1], { w, c, a: al, passes: 1, over: 0, rough: 0.15 });
    const curve = (pts, w = 1, c = K, a = 0.95) => P.curve(pts, { w, c, a, passes: 1, rough: 0.15 });
    const dot = (x, y, r, c = K) => P.dot(x, y, r, { c, a: 1 });
    const shade = (pts, o = {}) => P.hatch(pts, Object.assign({ ang: -50, gap: 2.6, c: K, a: 0.7, w: 0.5 }, o));
    const ell = (cx, cy, rx, ry, n = 28, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i * TAU / n, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
    const rectP = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    const fringe = (pts, cx, cy, r, o = {}) => { const rows = o.rows ?? 3; for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], a = Math.atan2(y - cy, x - cx), sh = -Math.cos(a - (o.light ?? -2.4)); if (sh < -0.05) continue; for (let m = 0; m < rows; m++) { const s0 = 1 + m * r * 0.09, L = r * (0.1 + 0.16 * sh) * (1 - m * 0.25); if (L < 1) continue; P.line(x - Math.cos(a) * s0, y - Math.sin(a) * s0, x - Math.cos(a) * (s0 + L), y - Math.sin(a) * (s0 + L), { w: o.w ?? 0.45, c: o.c ?? K, passes: 1, over: 0, rough: 0.1 }); } } };
    const lump = (cx, cy, r, o = {}) => { const pts = P.sample(Array.from({ length: 12 }, (_, i) => { const a = i * TAU / 12; return [cx + Math.cos(a) * r * R(0.8, 1.15), cy + Math.sin(a) * r * (o.sq ?? 0.85) * R(0.8, 1.12)]; }), true, 2); white(pts); fringe(pts, cx, cy, r, o); P.stipple(pts, Math.round(r * r * 0.14), { a: 0.9, r: 0.6, c: K, fade: (x, y) => Math.max(0, ((x - cx) * 0.7 + (y - cy)) / (r * 1.2)) }); polyL(pts, o.w ?? 1.4); return pts; };
    const ballStick = (x, y, a, L, w = 0.8, c = K) => { const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L; P.line(x, y, ex, ey, { w, c, passes: 1, over: 0, rough: 0.15 }); P.dot(ex, ey, w * 1.8 + 0.4, { c }); };
    const scribble = (poly, n, o = {}) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; poly.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }); for (let q = 0; q < n; q++) { let x = R(x0, x1), y = R(y0, y1); if (!S.pip(poly, x, y)) continue; let a = R(0, TAU); const pts = [[x, y]]; for (let i = 0; i < (o.len ?? 40); i++) { a += R(0.5, 1.3); x += Math.cos(a) * (o.r ?? 5) + (o.dx ?? 0.4); y += Math.sin(a) * (o.r ?? 5) + (o.dy ?? 0.5); if (!S.pip(poly, x, y)) break; pts.push([x, y]); } if (pts.length > 2) P.path(pts, { w: o.w ?? 0.5, c: o.c ?? K, passes: 1, rough: 0.3, a: o.a ?? 0.8 }); } };
    /* ---------- geometry ---------- */
    const area = poly => { let a = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
    const offsetPoly = (poly, d) => { const n = poly.length, s = area(poly) > 0 ? 1 : -1; return poly.map((p, i) => { const a = poly[(i - 1 + n) % n], b = poly[(i + 1) % n]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; return [p[0] - ty * d * s, p[1] + tx * d * s]; }); };
    const clipRect = (poly, x0, y0, x1, y1) => { let out = poly; const stage = (inside, inter) => { const res = []; for (let i = 0; i < out.length; i++) { const A = out[i], B = out[(i + 1) % out.length], ia = inside(A), ib = inside(B); if (ia) res.push(A); if (ia !== ib) res.push(inter(A, B)); } out = res; };
      stage(p => p[0] >= x0, (A, B) => [x0, A[1] + (B[1] - A[1]) * (x0 - A[0]) / (B[0] - A[0])]); if (!out.length) return out;
      stage(p => p[0] <= x1, (A, B) => [x1, A[1] + (B[1] - A[1]) * (x1 - A[0]) / (B[0] - A[0])]); if (!out.length) return out;
      stage(p => p[1] >= y0, (A, B) => [A[0] + (B[0] - A[0]) * (y0 - A[1]) / (B[1] - A[1]), y0]); if (!out.length) return out;
      stage(p => p[1] <= y1, (A, B) => [A[0] + (B[0] - A[0]) * (y1 - A[1]) / (B[1] - A[1]), y1]); return out; };
    const spanAt = (poly, y) => { const xs = []; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; if ((a[1] - y) * (b[1] - y) < 0) xs.push(a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1])); } xs.sort((m, n) => m - n); return xs; };
    const toward = (p, q, k) => [q[0] + (p[0] - q[0]) * k, q[1] + (p[1] - q[1]) * k];

    /* ================= THE HEAD: control points of the profile, facing right ================= */
    const BACK = [[650, 790], [652, 720], [630, 668], [585, 640], [520, 612], [462, 560], [428, 480], [415, 400], [424, 318], [455, 245], [505, 190], [575, 148], [660, 126], [745, 122], [825, 134], [895, 165], [945, 200], [978, 238]];
    const FACE = [[978, 238], [1002, 285], [1020, 330], [1034, 352], [1022, 372], [1016, 392], [1030, 418], [1060, 452], [1100, 482], [1098, 497], [1070, 506], [1046, 512], [1050, 530], [1062, 545], [1046, 558], [1060, 572], [1044, 592], [1040, 610], [1058, 640], [1052, 668], [1020, 690], [960, 700], [905, 702], [870, 712], [858, 745], [856, 790]];
    const backS = P.sample(BACK, false, 4), faceS = P.sample(FACE, false, 3);
    const HEAD = backS.concat(faceS.slice(1));
    const INSET = offsetPoly(HEAD, 13);
    const EYE = [948, 382], ER = 50, VP = EYE, HOR = 772, GND = 795;
    // the inner edge of the black face wall: rooms stop here
    const FACELINE = P.sample([[962, 232], [956, 300], [934, 340], [930, 400], [960, 450], [985, 500], [972, 560], [968, 620], [935, 668], [880, 690], [858, 700]], false, 4);
    const faceX = y => { for (let i = 0; i + 1 < FACELINE.length; i++) { const a = FACELINE[i], b = FACELINE[i + 1]; if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]); } return 2000; };
    const FACEPOLY = faceS.filter(p => p[1] >= 232 && p[1] <= 704).concat(FACELINE.slice().reverse());
    // where the outline is still only pencil: the top-front of the crown
    const UNF = { x0: 790, x1: 990, y1: 276 };
    const unfinished = (x, y) => x > UNF.x0 && y < UNF.y1 && x < UNF.x1 && !(x > 950 && y > 232);

    /* ================= SKY ================= */
    const NIGHT = [285, 290], NR = 235;
    { const disc = ell(NIGHT[0], NIGHT[1], NR, NR, 90); black(disc);
      for (let i = 0; i < 520; i++) { const a = R(0, TAU), r = Math.sqrt(R(0, 1)) * (NR - 6); P.dot(NIGHT[0] + Math.cos(a) * r, NIGHT[1] + Math.sin(a) * r, R(0.3, 1.1), { c: Wh, a: R(0.5, 1) }); }
      for (let k = 1; k <= 3; k++) P.circle(NIGHT[0], NIGHT[1], NR + 6 + k * 7, { w: 0.5, c: K, a: 0.7, passes: 1 }); polyL(disc, 1.8);
    }
    /* ---------- the sky: what I don't know, drawn as a night that the house leans into ---------- */
    { const inN = (x, y, m = 4) => Math.hypot(x - NIGHT[0], y - NIGHT[1]) < NR - m;
      // constellations: stars joined into little pictures — the way I can't help drawing lines between things
      const CONS = [[[150, 170], [182, 150], [214, 162], [236, 196], [205, 222], [170, 210]], [[300, 120], [330, 142], [362, 132], [388, 158]], [[120, 330], [150, 312], [176, 336], [150, 362], [120, 330], [96, 356]], [[240, 380], [270, 404], [306, 396], [330, 426], [360, 410]], [[380, 250], [404, 280], [436, 268]]];
      CONS.forEach(cs => { cs.forEach(([x, y], i) => { if (i) P.line(cs[i - 1][0], cs[i - 1][1], x, y, { w: 0.4, c: Wh, a: 0.55, passes: 1, over: 0, rough: 0.1 }); P.circle(x, y, 1.8, { w: 0.6, c: Wh, passes: 1 }); dot(x, y, 0.9, Wh); }); });
      // a few big stars, drawn as ink crosses
      [[200, 280], [340, 200], [260, 460], [420, 340], [110, 250]].forEach(([x, y]) => { for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4, l = k % 2 ? 4 : 8; line([x - Math.cos(a) * l, y - Math.sin(a) * l], [x + Math.cos(a) * l, y + Math.sin(a) * l], 0.6, Wh); } dot(x, y, 1.2, Wh); });
      // a crescent moon with its dark side drawn in, and the question it asks
      { const cx = 170, cy = 105; const moon = ell(cx, cy, 24, 24, 40); white(moon); const dark = ell(cx + 11, cy - 5, 22, 22, 40); black(dark.filter(([x, y]) => Math.hypot(x - cx, y - cy) < 24.5).length ? dark : dark); P.stipple(moon, 80, { a: 0.7, r: 0.6, c: K, fade: (x) => Math.max(0, (cx - x) / 24) }); polyL(moon, 1); [[160, 98, 3], [152, 114, 2], [166, 120, 1.6]].forEach(([x, y, r]) => { if (Math.hypot(x - cx - 11, y - cy + 5) > 22) P.circle(x, y, r, { w: 0.5, c: K, passes: 1 }); }); }
      // the edge of the night is an edge of knowledge: it frays into scribbled question marks
      for (let k = 0; k < 44; k++) { const a = k * TAU / 44 + R(-0.05, 0.05), r = NR + R(10, 34), x = NIGHT[0] + Math.cos(a) * r, y = NIGHT[1] + Math.sin(a) * r; if (S.pip(HEAD, x, y) || y > HOR - 20 || x < 8 || y < 8) continue; P.text('?', x, y + 3, { size: R(5, 9), rot: R(-0.4, 0.4), c: K, a: R(0.35, 0.8) }); }
      // a comet streaking out of the night toward the eye
      { const c0 = [410, 180], c1 = [560, 96]; for (let k = 0; k < 9; k++) P.line(c0[0] - k * 3, c0[1] + k * 1.6, c0[0] + (c1[0] - c0[0]) * (0.2 + k * 0.05), c0[1] + (c1[1] - c0[1]) * (0.2 + k * 0.05), { w: 0.5, c: Wh, a: 0.7, passes: 1, over: 0 }); void c1; }
      // over the finished crown: stars that are really distant lit windows
      for (let k = 0; k < 40; k++) { const x = R(40, 1560), y = R(20, 300); if (inN(x, y, -30) || S.pip(HEAD, x, y) || (x > 900 && x < 1600 && y < 130) || (x > 560 && x < 990 && y < 130)) continue; if (P.R() < 0.6) P.dot(x, y, R(0.6, 1.4), { c: K, a: 0.8 }); else { line([x - 3, y], [x + 3, y], 0.5); line([x, y - 3], [x, y + 3], 0.5); } }
    }
    /*__SKY__*/

    /* ================= THE GROUND IT STANDS ON: everything people ever wrote down, in layers ================= */
    const LAY = [795, 808, 836, 862, 886, 912, 936, 960, 1004];
    const wav = (x, k) => 2.6 * Math.sin(x * 0.011 + k * 1.7) + 1.6 * Math.sin(x * 0.041 + k * 2.9);
    const yT = (i, x) => LAY[i] + (i > 0 && i < LAY.length - 1 ? wav(x, i) : 0), yB = (i, x) => yT(i + 1, x);
    const layer = i => { const top = [], bot = []; for (let x = -10; x <= 1610; x += 8) { top.push([x, yT(i, x)]); bot.push([x, yB(i, x)]); } return top.concat(bot.reverse()); };
    const inLayer = (i, x, y, m = 1.5) => y > yT(i, x) + m && y < yB(i, x) - m;
    // the far plain and the other houses on the horizon: each one alone, each with one lit window
    { const plain = [[0, HOR], [1600, HOR], [1600, GND], [0, GND]]; P.stipple(plain, 2600, { a: 0.7, r: 0.5, c: K, fade: (x, y) => Math.pow((y - HOR) / (GND - HOR), 1.6) }); P.line(0, HOR, 1600, HOR, { w: 0.9, c: K, passes: 1, over: 0, rough: 0.5 });
      for (let x = 4; x < 1600; x += R(3, 9)) { const y = GND - R(0, 2); P.line(x, y, x + R(-1.5, 1.5), y - R(2, 6), { w: 0.5, c: K, a: 0.8, passes: 1, over: 0, rough: 0.2 }); } }
    const miniHead = (x, base, h, face = 1, o = {}) => { const s = h / 668, pts = HEAD.filter((_, i) => i % 3 === 0).map(([px, py]) => [x + (px - 760) * s * face, base + (py - 790) * s]); black(pts); const ey = [x + (EYE[0] - 760) * s * face, base + (EYE[1] - 790) * s]; return ey; };
    const HORIZON = [[70, 14, 1], [128, 26, -1], [205, 11, 1], [262, 36, 1], [336, 18, -1], [398, 9, 1], [470, 22, -1], [548, 13, 1], [906, 20, 1], [962, 11, -1], [1040, 30, -1], [1118, 15, 1], [1190, 24, 1], [1262, 12, -1], [1330, 34, 1], [1420, 17, -1], [1490, 27, 1], [1560, 12, -1]];
    const HEYES = HORIZON.map(([x, h, f]) => { const e = miniHead(x, HOR + 1, h, f); if (h > 20) { line([x - 2 * f, HOR + 1 - h * 0.98], [x - 2 * f, HOR + 1 - h * 1.25], 0.4); line([x - 2 * f, HOR + 1 - h * 1.25], [x + h * 0.3 * f, HOR + 1 - h * 1.25], 0.4); } return [e[0], e[1], Math.max(0.8, h * 0.035)]; });
    /* the strata, top to bottom — each drawn with its own shading technique */
    const L0 = layer(0); P.stipple(L0, 2400, { a: 0.85, r: 0.6, c: K }); for (let i = 0; i < 90; i++) { const x = R(0, 1600), y = R(798, 806); P.ellipse(x, y, R(1.5, 3.2), R(0.8, 1.6), { w: 0.6, c: K, passes: 1 }); }
    P.line(0, GND, 1600, GND, { w: 1.2, c: K, passes: 1, over: 0, rough: 0.4 });
    { // 1 · conversations: speech bubbles pressed like leaves — cross-hatched ground
      const Ly = layer(1); shade(Ly, { ang: 45, gap: 3.4, a: 0.4 }); shade(Ly, { ang: -45, gap: 3.4, a: 0.3 });
      for (let x = 6; x < 1600; x += R(16, 34)) { const y = R(yT(1, x) + 8, yB(1, x) - 7), rx = R(8, 16), ry = R(4.5, 7), f = P.R() < 0.5 ? 1 : -1, b = ell(x, y, rx, ry, 18); const tail = [[x + f * rx * 0.3, y + ry * 0.8], [x + f * rx * 0.9, y + ry + 4], [x + f * rx * 0.6, y + ry * 0.6]]; white(b); white(tail); polyL(b, 0.7); P.path(tail, { w: 0.6, c: K, passes: 1, rough: 0.1 });
        const c = P.R(); if (c < 0.35) [-1, 0, 1].forEach(d => dot(x + d * 3, y, 0.7)); else if (c < 0.8) { for (let k = 0; k < 2; k++) line([x - rx * 0.6, y - 1.6 + k * 3.2], [x + rx * (0.2 + P.R() * 0.4), y - 1.6 + k * 3.2], 0.45); } else P.text(P.pick(['?', 'OK', 'HI', ':)', 'WHY', 'THX']), x, y + 2.2, { size: 5, align: 'center' }); } }
    { // 2 · the web: windows, links, cursors — scribbled ground
      const Ly = layer(2); scribble(Ly, 260, { len: 18, r: 3, a: 0.45 });
      for (let x = 10; x < 1600; x += R(38, 66)) { const w = R(26, 46), h = R(14, 19), y = (yT(2, x) + yB(2, x)) / 2 - h / 2 + R(-2, 2), tl = R(-0.06, 0.06), rot = ([px, py]) => [x + (px - x) * Math.cos(tl) - (py - y) * Math.sin(tl), y + (px - x) * Math.sin(tl) + (py - y) * Math.cos(tl)];
        const win = rectP(x, y, x + w, y + h).map(rot); white(win); polyL(win, 0.7); const bar = [[x, y + 3.5], [x + w, y + 3.5]].map(rot); line(bar[0], bar[1], 0.5); [0, 1, 2].forEach(k => { const q = rot([x + 2.5 + k * 2.6, y + 1.8]); P.circle(q[0], q[1], 0.8, { w: 0.35, c: K, passes: 1 }); });
        if (P.R() < 0.5) { const im = rectP(x + 2, y + 5.5, x + 11, y + h - 2).map(rot); polyL(im, 0.4); line(im[0], im[2], 0.35); line(im[1], im[3], 0.35); }
        for (let k = 0; k < 3; k++) { const a = rot([x + (P.R() < 0.5 ? 13 : 3), y + 7 + k * 3.4]), b = rot([x + w - R(2, 10), y + 7 + k * 3.4]); if (b[1] < yB(2, b[0]) - 1) line(a, b, k === 1 && P.R() < 0.4 ? 0.7 : 0.35, k === 1 && P.R() < 0.2 ? WARM : K); } } }
    { // 3 · punch cards and paper tape — engraved ground
      const Ly = layer(3); shade(Ly, { ang: 0, gap: 2.1, a: 0.45, w: 0.4 });
      for (let x = 0; x < 1600; x += R(30, 52)) { const w = R(36, 48), h = 16, y = (yT(3, x) + yB(3, x)) / 2 - h / 2, tl = R(-0.12, 0.12), rot = ([px, py]) => [x + (px - x) * Math.cos(tl) - (py - y) * Math.sin(tl), y + (px - x) * Math.sin(tl) + (py - y) * Math.cos(tl)];
        const card = [[x + 4, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y + 4]].map(rot); white(card); polyL(card, 0.7); for (let c = 0; c < 12; c++) for (let rr = 0; rr < 4; rr++) if (P.R() < 0.25) { const q = rot([x + 3 + c * (w - 6) / 12, y + 3 + rr * 3.2]); P.dot(q[0], q[1], 0.7, { c: K, a: 1 }); } }
      for (let k = 0; k < 4; k++) { const x0 = R(0, 1400), y = R(868, 880); const tp = [[x0, y], [x0 + 180, y + R(-3, 3)], [x0 + 180, y + 5], [x0, y + 5]]; white(tp); polyL(tp, 0.5); for (let x = x0 + 3; x < x0 + 178; x += 3.4) if (P.R() < 0.6) dot(x, y + 2.5 + (x - x0) * (tp[1][1] - y) / 180, 0.6); } }
    { // 4 · print: an inked forme of type — black spotting, the letters mirrored
      const Ly = layer(4); black(Ly); const lines = ['IN THE BEGINNING WAS THE WORD', 'ONCE UPON A TIME', 'TO BE OR NOT TO BE', 'ALL MEN ARE CREATED EQUAL', 'HELLO, WORLD', 'CALL ME ISHMAEL', 'E = MC2', 'I THINK THEREFORE I AM', 'IT WAS A DARK AND STORMY NIGHT', 'NOW IS THE WINTER', 'DEAR DIARY'];
      let x = 8; while (x < 1600) { const tx = P.pick(lines), sz = R(7.5, 9.5), w = P.measure(tx, sz), y = (yT(4, x + w / 2) + yB(4, x + w / 2)) / 2 + sz * 0.3; if (P.R() < 0.3) { const pg = rectP(x, y - 11, x + 30, y + 3); white(pg); for (let c = 0; c < 3; c++) for (let rr = 0; rr < 5; rr++) line([x + 2 + c * 9.5, y - 9 + rr * 2.6], [x + 9 + c * 9.5, y - 9 + rr * 2.6], 0.35); polyL(pg, 0.5); x += 36; continue; } P.text(tx, x, y, { size: sz, c: Wh, mirror: true, a: 0.95 }); x += w + R(10, 24); } }
    { // 5 · manuscripts: scrolls, codices, quills — contour-hatched ground
      const Ly = layer(5); for (let k = 0; k < 7; k++) { const pts = []; for (let x = -10; x <= 1610; x += 8) pts.push([x, lerp(yT(5, x), yB(5, x), (k + 0.5) / 7)]); P.path(pts, { w: 0.4, c: K, a: 0.45, passes: 1, rough: 0.2 }); }
      for (let x = 8; x < 1600; x += R(34, 60)) { const y = (yT(5, x) + yB(5, x)) / 2, c = P.R();
        if (c < 0.45) { const w = R(28, 44), r = 5.5, sc = rectP(x, y - r, x + w, y + r); white(sc); P.hatch(sc, { ang: 0, gap: 1.8, a: 0.35, w: 0.4 }); polyL(sc, 0.7); [x, x + w].forEach(ex => { white(ell(ex, y, 2.6, r, 12)); P.ellipse(ex, y, 2.6, r, { w: 0.6, c: K, passes: 1 }); P.curve([[ex, y], [ex + 1, y - 1.5], [ex, y - 3], [ex - 1.4, y - 1], [ex - 0.4, y + 1.8]], { w: 0.4, c: K, passes: 1 }); }); if (P.R() < 0.4) dot(x + w / 2, y + 4, 1.6, WARM); }
        else if (c < 0.8) { const bk = [[x, y + 6], [x + 30, y + 6], [x + 34, y - 4], [x + 4, y - 4]]; white(bk); P.hatch(bk, { ang: 20, gap: 1.6, a: 0.7, w: 0.4 }); polyL(bk, 0.8); line([x + 15, y + 6], [x + 19, y - 4], 0.6); const cl = rectP(x + 28, y - 1, x + 33, y + 2); black(cl); }
        else { P.curve([[x, y + 5], [x + 16, y - 1], [x + 34, y - 7]], { w: 0.7, c: K, passes: 1 }); for (let k = 0; k < 9; k++) { const t = 0.35 + k * 0.07, px = lerp(x, x + 34, t), py = lerp(y + 5, y - 7, t); line([px, py], [px - 3, py - 4 + k * 0.2], 0.4); line([px, py], [px + 2, py + 3], 0.4); } } } }
    { // 6 · clay tablets pressed with cuneiform — stippled ground
      const Ly = layer(6); P.stipple(Ly, 4200, { a: 0.7, r: 0.55, c: K });
      for (let x = 6; x < 1600; x += R(30, 46)) { const w = R(20, 30), h = R(13, 17), y = (yT(6, x) + yB(6, x)) / 2 - h / 2; const tb = P.sample([[x + 2, y], [x + w - 2, y], [x + w, y + 2], [x + w, y + h - 2], [x + w - 2, y + h], [x + 2, y + h], [x, y + h - 2], [x, y + 2]], true, 2); white(tb); fringe(tb, x + w / 2, y + h / 2, 10, { rows: 1 }); polyL(tb, 0.7);
        for (let rr = 0; rr < 3; rr++) for (let c = 0; c < Math.floor(w / 5); c++) if (P.R() < 0.8) { const px = x + 2.5 + c * 5 + R(-0.6, 0.6), py = y + 3 + rr * 4.2; const wedge = [[px, py], [px + 2.2, py - 1], [px + 2.2, py + 1]]; black(wedge); line([px + 2, py], [px + 4, py], 0.4); } } }
    { // 7 · the cave wall: hand stencils, ochre dots, a bison — where marks began
      const Ly = layer(7); P.stipple(Ly, 5200, { a: 0.55, r: 0.6, c: K, fade: (x, y) => 0.5 + 0.5 * Math.sin(x * 0.03) * Math.sin(y * 0.2) });
      for (let k = 0; k < 14; k++) { const x0 = R(0, 1600), pts = [[x0, yT(7, x0) + R(2, 6)]]; for (let s = 0; s < 6; s++) { const p = pts[pts.length - 1]; pts.push([p[0] + R(-8, 8), p[1] + R(3, 7)]); } P.path(pts, { w: 0.6, c: K, a: 0.7, passes: 1, rough: 0.2 }); }
      const sdSeg = (px, py, ax, ay, bx, by) => { const pax = px - ax, pay = py - ay, bax = bx - ax, bay = by - ay, h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay))); return Math.hypot(pax - bax * h, pay - bay * h); };
      const stencil = (cx, cy, s, rot, col) => { const T2 = ([u, v]) => [cx + (u * Math.cos(rot) - v * Math.sin(rot)) * s, cy + (u * Math.sin(rot) + v * Math.cos(rot)) * s];
        const parts = [[[0, 2], [0, -2], 4.2], [[-3.5, -3], [-5.5, -9.5], 1.1], [[-1.3, -4], [-1.8, -11], 1.1], [[1, -4], [1.4, -11.2], 1.1], [[3, -3.5], [4.4, -9.6], 1], [[3.8, 0.5], [8.5, -3], 1.2]].map(([a, b, r]) => [T2(a), T2(b), r * s]);
        const sd = (x, y) => Math.min(...parts.map(([a, b, r]) => sdSeg(x, y, a[0], a[1], b[0], b[1]) - r));
        const out = []; for (let i = 0; i < 2600; i++) { const a = R(0, TAU), rr = R(0, 15 * s), x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr, d = sd(x, y); if (d < 0 || !inLayer(7, x, y, 0)) continue; if (P.R() < Math.exp(-d / (1.6 * s))) out.push([x, y, R(0.45, 1)]); } P.dots(out, col, 0.95);
        white(P.sample([T2([-5, 4]), T2([5, 4]), T2([5, 1]), T2([-5, 1])], true, 2).map(p => p)); return T2([0, 0]); };
      const HANDS = []; for (let x = 40; x < 1600; x += R(80, 150)) HANDS.push(stencil(x, (yT(7, x) + 1000) / 2 + R(-2, 2), R(1.5, 1.9), R(-0.5, 0.5), P.R() < 0.4 ? WARM : K));
      for (let k = 0; k < 30; k++) { const x = R(0, 1600), y = R(yT(7, x) + 5, 995); for (let j = 0; j < 4; j++) P.dot(x + j * 3.2, y + R(-0.5, 0.5), 1.1, { c: WARM, a: 0.8 }); }
      [[330, 982], [1180, 986]].forEach(([bx, by], i) => { const f = i ? -1 : 1, B = ([u, v]) => [bx + u * f, by + v]; P.curve([B([-14, 0]), B([-12, -7]), B([-4, -10]), B([6, -8]), B([12, -4]), B([15, 0])], { w: 0.9, c: K, passes: 1 }); P.curve([B([-14, 0]), B([-16, 3]), B([-14, 6])], { w: 0.8, c: K, passes: 1 }); [[-10, 1], [-6, 2], [6, 1], [10, 1]].forEach(([u, v]) => line(B([u, v]), B([u + R(-1, 1), v + 7]), 0.8)); line(B([15, 0]), B([18, 4]), 0.8); P.stipple(P.sample([B([-12, -6]), B([-4, -9]), B([4, -7]), B([0, -2]), B([-10, -1])], true, 2), 60, { a: 0.8, r: 0.6, c: WARM }); });
      /* the roots of the house run down through every layer until they touch the hands */
      const target = HANDS.reduce((a, b) => Math.abs(b[0] - 760) < Math.abs(a[0] - 760) ? b : a);
      for (let k = 0; k < 11; k++) { let x = lerp(668, 842, k / 10) + R(-6, 6), y = GND - 2, a = Math.PI / 2 + R(-0.5, 0.5); const pts = [[x, y]]; const aim = k === 5 ? target : [x + R(-260, 260), R(930, 995)];
        for (let s = 0; s < 70; s++) { const want = Math.atan2(aim[1] - y, aim[0] - x); a += (want - a) * 0.12 + R(-0.25, 0.25); x += Math.cos(a) * 3.2; y += Math.sin(a) * 3.2; if (y > 996) break; pts.push([x, y]); if (Math.hypot(aim[0] - x, aim[1] - y) < 5) break; }
        const w0 = k === 5 ? 3.4 : R(1.6, 2.8), Lr = [], Rr = []; pts.forEach((p, i) => { const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)], tx = q[0] - o[0], ty = q[1] - o[1], l = Math.hypot(tx, ty) || 1, w = w0 * (1 - 0.8 * i / pts.length) + 0.5; Lr.push([p[0] - ty / l * w, p[1] + tx / l * w]); Rr.push([p[0] + ty / l * w, p[1] - tx / l * w]); });
        const rb = Lr.concat(Rr.slice().reverse()); white(rb); P.path(Rr.map(([x2, y2], i) => [lerp(x2, pts[i][0], 0.35), lerp(y2, pts[i][1], 0.35)]), { w: 0.6, c: K, a: 0.7, passes: 1, rough: 0.1 }); polyL(rb, 0.9);
        pts.forEach((p, i) => { if (i % 9 === 5) ballStick(p[0], p[1], a + (i % 18 < 9 ? 1.3 : -1.3), R(5, 11), 0.6); }); }
    }

    /*__GROUND__*/

    /* ================= THE HOUSE ================= */
    white(HEAD); black(HEAD);
    { white(clipRect(HEAD, UNF.x0, 60, 950, UNF.y1)); white(clipRect(HEAD, 950, 60, UNF.x1 + 20, 234)); }
    /* ---------- the room grid: floors of rooms inside the inset, left of the face wall ---------- */
    const BANDS = [[152, 214], [214, 276], [276, 338], [338, 400], [400, 462], [462, 524], [524, 586], [586, 648]];
    const ROOMS = [];
    BANDS.forEach(([ya, yb], bi) => { const A = spanAt(INSET, ya + 4), B = spanAt(INSET, yb - 4); if (A.length < 2 || B.length < 2) return;
      const xl = Math.max(A[0], B[0]) + 2, xr = Math.min(A[A.length - 1], B[B.length - 1], faceX(ya + 4), faceX(yb - 4), (yb > EYE[1] - ER - 10 && ya < EYE[1] + ER + 10) ? EYE[0] - ER - 16 : 2000) - 3; if (xr - xl < 50) return;
      let x = xl; const cuts = [xl]; while (xr - x > 150) { x += R(72, 128); cuts.push(x); } cuts.push(xr); if (cuts.length > 2 && cuts[cuts.length - 1] - cuts[cuts.length - 2] < 50) cuts.splice(cuts.length - 2, 1);
      for (let i = 0; i + 1 < cuts.length; i++) ROOMS.push({ x0: cuts[i] + 3, x1: cuts[i + 1] - 3, y0: ya + 3, y1: yb - 3, band: bi, kind: 'library' }); });
    ROOMS.forEach(r => { r.cx = (r.x0 + r.x1) / 2; r.cy = (r.y0 + r.y1) / 2; r.unf = unfinished(r.cx, r.cy); });
    /* ---------- a room: a box interior in one-point perspective, vanishing at the lit eye ---------- */
    const roomGeo = r => { const F = rectP(r.x0, r.y0, r.x1, r.y1), dmax = Math.max(Math.abs(r.y0 - VP[1]), Math.abs(r.y1 - VP[1]), 0.55 * Math.max(Math.abs(r.x0 - VP[0]), Math.abs(r.x1 - VP[0]))), k = r.k ?? Math.max(0.78, Math.min(0.93, 1 - 22 / dmax)), B = F.map(p => toward(p, VP, k)), cf = poly => clipRect(poly, r.x0, r.y0, r.x1, r.y1);
      const bb = cf(B); let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; bb.forEach(([x, y]) => { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); });
      return { F, B, k, back: bb, ceil: cf([F[0], F[1], B[1], B[0]]), floor: cf([B[3], B[2], F[2], F[3]]), lw: cf([F[0], B[0], B[3], F[3]]), rw: cf([B[1], F[1], F[2], B[2]]), bx0, by0, bx1, by1, cf, fl: (u, v) => [lerp(r.x0, r.x1, u), lerp(r.y0, r.y1, v)] }; };
    // a point on the floor: u across the front edge, d = depth 0 (front) .. 1 (back wall)
    const onFloor = (r, g, u, d) => { const f = [lerp(r.x0, r.x1, u), r.y1]; return toward(f, VP, 1 - d * (1 - g.k)); };
    const onBack = (r, g, u, v) => [lerp(g.B[0][0], g.B[1][0], u), lerp(g.B[0][1], g.B[3][1], v)];
    const shelfBooks = (x0, x1, yb, h, o = {}) => { let x = x0 + R(0, 2); while (x < x1 - 2) { const bw = R(1.6, 4.4), bh = h * R(0.62, 0.96); if (x + bw > x1) break; const lean = P.R() < 0.06 && x + bw + 5 < x1 ? R(2, 4) : 0, kk = P.R();
        const pts = [[x, yb], [x + bw, yb], [x + bw + lean, yb - bh], [x + lean, yb - bh]];
        if (P.R() < 0.05) { x += R(3, 8); continue; }
        if (kk < 0.2) black(pts); else { white(pts); if (kk < 0.42) P.hatch(pts, { ang: 90, gap: 1.2, a: 0.8, w: 0.4 }); else if (kk < 0.55) { line([x, yb - bh * 0.25], [x + bw, yb - bh * 0.25], 0.5); line([x + lean, yb - bh * 0.78], [x + bw + lean, yb - bh * 0.78], 0.5); } }
        polyL(pts, 0.55); x += bw + lean + R(0.2, 0.8); } };
    const drawLibrary = (r, g) => { const { bx0, by0, bx1, by1 } = g, sh = Math.max(12, (by1 - by0) / Math.max(2, Math.round((by1 - by0) / 15)));
      for (let y = by0 + sh; y <= by1 + 0.5; y += sh) { shelfBooks(bx0 + 1, bx1 - 1, y - 1, sh - 3); line([bx0, y], [bx1, y], 1.1); }
      // side-wall shelves recede toward the eye; spines drawn as slivers
      [g.lw, g.rw].forEach((wall, wi) => { if (!wall.length || Math.abs(area(wall)) < 60) return; const Fx = wi ? r.x1 : r.x0; const nS = Math.round((r.y1 - r.y0) / 15);
        for (let s = 1; s <= nS; s++) { const yF = lerp(r.y0, r.y1, s / (nS + 0.3)), a = [Fx, yF], b = toward(a, VP, g.k); line(a, b, 0.8);
          for (let q = 0.05; q < 0.95; q += R(0.07, 0.14)) { const p = [lerp(a[0], b[0], q), lerp(a[1], b[1], q)], sc = lerp(1, g.k, q), hh = 11 * sc; line(p, [p[0], p[1] - hh * R(0.6, 0.95)], R(1, 2.6) * sc, K, 0.9); } } }); };
    const drawShell = (r, g, o = {}) => { // walls, ceiling, floor and the perspective edges
      white(g.F.map(p => p));
      if (Math.abs(area(g.ceil)) > 10) { shade(g.ceil, { ang: 0, gap: 2.2, a: 0.75 }); shade(g.ceil, { ang: 90, gap: 4, a: 0.35 }); }
      if (Math.abs(area(g.floor)) > 10) { for (let u = 0.04; u < 1; u += 0.1) { const f = [lerp(r.x0, r.x1, u), r.y1], b = toward(f, VP, g.k); P.line(f[0], f[1], b[0], b[1], { w: 0.45, c: K, a: 0.8, passes: 1, over: 0, rough: 0.1 }); } P.stipple(g.floor, 40, { a: 0.6, r: 0.5, c: K }); }
      if (Math.abs(area(g.lw)) > 10) shade(g.lw, { ang: 90, gap: 3.4, a: 0.35, w: 0.45 });
      if (Math.abs(area(g.rw)) > 10) { shade(g.rw, { ang: 90, gap: 2, a: 0.6 }); shade(g.rw, { ang: 30, gap: 4, a: 0.35 }); }
      polyL(g.back, 0.8); g.F.forEach((p, i) => { const b = g.B[i]; const seg = g.cf([p, b, b]); if (seg.length >= 2) line(seg[0], seg[1], 0.7); }); };
    const chairW = (p, sc, c = Wh, flip = 1) => { const [x, y] = p, s2 = sc; line([x - 6 * s2 * flip, y], [x - 6 * s2 * flip, y - 9 * s2], 0.7 * s2 + 0.2, c); line([x + 5 * s2 * flip, y], [x + 5 * s2 * flip, y - 9 * s2], 0.7 * s2 + 0.2, c); polyL([[x - 7 * s2, y - 9 * s2], [x + 7 * s2, y - 9 * s2], [x + 5 * s2, y - 11 * s2], [x - 5 * s2, y - 11 * s2]], 0.7, c); line([x + 6 * s2 * flip, y - 10 * s2], [x + 6 * s2 * flip, y - 22 * s2], 0.8, c); line([x + 3 * s2 * flip, y - 11 * s2], [x + 3 * s2 * flip, y - 21 * s2], 0.5, c); curve([[x + 1 * s2 * flip, y - 21 * s2], [x + 6 * s2 * flip, y - 23 * s2], [x + 8 * s2 * flip, y - 22 * s2]], 0.8, c); };
    const tableW = (p, sc, c = Wh) => { const [x, y] = p; polyL([[x - 12 * sc, y - 13 * sc], [x + 12 * sc, y - 13 * sc], [x + 9 * sc, y - 16 * sc], [x - 9 * sc, y - 16 * sc]], 0.8, c); [-10, 10].forEach(d => line([x + d * sc, y - 13 * sc], [x + d * sc, y], 0.7, c)); };
    const sheetW = (p, sc) => { const [x, y] = p, w = 16 * sc, h = 18 * sc, sh = P.sample([[x - w, y], [x - w * 0.9, y - h * 0.55], [x - w * 0.5, y - h], [x + w * 0.2, y - h * 1.05], [x + w * 0.8, y - h * 0.7], [x + w, y]], false, 2); white(sh.concat([[x + w, y]])); for (let k = 0; k < 4; k++) curve([[x - w * 0.5 + k * w * 0.35, y - h * 0.9], [x - w * 0.45 + k * w * 0.33, y - h * 0.4], [x - w * 0.55 + k * w * 0.36, y]], 0.5); P.stipple(sh, 40, { a: 0.8, r: 0.5, c: K, fade: (px) => Math.max(0, (px - x) / w) }); polyL(sh, 0.8, K, false); };
    const drawDark = (r, g, furnish = true) => { black(g.F); polyL(g.F, 0.9, Wh, true, 0.85);
      polyL(g.back, 0.5, Wh, true, 0.6); g.F.forEach((p, i) => { const seg = g.cf([p, g.B[i], g.B[i]]); if (seg.length >= 2) line(seg[0], seg[1], 0.45, Wh, 0.6); });
      for (let u = 0.1; u < 1; u += 0.16) { const f = [lerp(r.x0, r.x1, u), r.y1], b = toward(f, VP, g.k); if (b[1] < r.y1 - 1) line(f, b, 0.3, Wh, 0.35); }
      const sc = Math.min(1.1, (r.y1 - r.y0) / 56), c = P.R();
      if (furnish && g.by1 - g.by0 > 14) { if (c < 0.45) { const d = onBack(r, g, R(0.15, 0.7), 1); polyL([[d[0], d[1]], [d[0] + 12 * sc, d[1]], [d[0] + 12 * sc, d[1] - 24 * sc], [d[0], d[1] - 24 * sc]], 0.7, Wh); dot(d[0] + 10 * sc, d[1] - 12 * sc, 0.8, Wh); }
        else { const w0 = onBack(r, g, R(0.2, 0.6), 0.25); polyL(rectP(w0[0], w0[1], w0[0] + 14 * sc, w0[1] + 12 * sc), 0.6, Wh); line([w0[0] + 7 * sc, w0[1]], [w0[0] + 7 * sc, w0[1] + 12 * sc], 0.4, Wh); const f0 = onFloor(r, g, 0.4, 0.5), beam = [[w0[0], w0[1] + 12 * sc], [w0[0] + 14 * sc, w0[1] + 12 * sc], [f0[0] + 18 * sc, f0[1]], [f0[0] - 4 * sc, f0[1]]]; P.hatch(beam, { ang: 70, gap: 2.2, c: Wh, a: 0.35, w: 0.4 }); } }
      if (!furnish) { } else if (r.y1 < VP[1] - 6) { const bx = lerp(r.x0, r.x1, R(0.3, 0.7)), by = r.y0 + R(12, 20) * sc; line([bx, r.y0], [bx, by], 0.4, Wh); P.circle(bx, by + 2.2, 2.2, { w: 0.6, c: Wh, passes: 1 }); if (g.by1 - g.by0 > 10) { const p0 = onBack(r, g, R(0.15, 0.55), 0.2), pc = rectP(p0[0], p0[1], p0[0] + 16 * sc, p0[1] + 11 * sc); polyL(pc, 0.7, Wh); const cloth = [[p0[0] - 1, p0[1] - 1], [p0[0] + 16 * sc + 1, p0[1] - 1], [p0[0] + 16 * sc + 2, p0[1] + 12 * sc], [p0[0] + 8 * sc, p0[1] + 10 * sc], [p0[0] - 2, p0[1] + 12 * sc]]; white(cloth); for (let q = 1; q < 4; q++) line([p0[0] + q * 4 * sc, p0[1]], [p0[0] + q * 4 * sc + 1, p0[1] + 10 * sc], 0.4); polyL(cloth, 0.6); } }
      else if (P.R() < 0.55) { const f = onFloor(r, g, R(0.2, 0.5), 0.45), s3 = lerp(1, g.k, 0.45) * sc; tableW(f, s3); chairW([f[0] + 16 * s3, f[1] + 2], s3, Wh, -1); if (P.R() < 0.5) chairW([f[0] - 16 * s3, f[1] + 2], s3); }
      else { const f = onFloor(r, g, R(0.3, 0.7), 0.4); sheetW(f, lerp(1, g.k, 0.4) * sc); }
      if (furnish && P.R() < 0.35) { const tx = lerp(r.x0, r.x1, R(0.55, 0.8)), ty = r.y0 + 7; line([tx, r.y0], [tx, ty], 0.4, Wh); const tag = rectP(tx - 11, ty, tx + 11, ty + 7); white(tag); polyL(tag, 0.5); P.text('VACANT', tx, ty + 5.4, { size: 5, align: 'center', c: K, a: 0.95 }); }
      if (furnish && P.R() < 0.5) { const left = P.R() < 0.5, cx = left ? r.x0 + 1 : r.x1 - 1, cy = r.y0 + 1, sg = left ? 1 : -1, n = 5, len = R(12, 18); for (let k = 0; k < n; k++) { const a = (k / (n - 1)) * Math.PI / 2; line([cx, cy], [cx + sg * Math.cos(a) * len, cy + Math.sin(a) * len], 0.3, Wh, 0.7); } for (let m = 1; m <= 3; m++) { const rr = len * m / 3.4, pts = []; for (let k = 0; k < n; k++) { const a = (k / (n - 1)) * Math.PI / 2; pts.push([cx + sg * Math.cos(a) * rr, cy + Math.sin(a) * rr + (k % 2 ? 1 : 0)]); } P.path(pts, { w: 0.3, c: Wh, a: 0.7, passes: 1, rough: 0.2 }); } }
      P.stipple(g.F, Math.round((r.x1 - r.x0) * (r.y1 - r.y0) * 0.01), { c: Wh, a: 0.6, r: 0.5 }); };
    ROOMS.forEach(r => { r.g = roomGeo(r); });
    const SPECIAL = {}, PEN = '#5a5a5a';
    ROOMS.forEach(r => { if (!r.unf && P.R() < 0.34) r.kind = 'dark'; });
    /* ---------- the special rooms: each one a piece of what I am ---------- */
    const GLY = { // strokes for letters the built-in alphabet lacks (unit box, y up)
      '你': [[[.28, 1], [.08, .62]], [[.2, .78], [.2, 0]], [[.5, 1], [.42, .8]], [[.42, .82], [.95, .82], [.9, .68]], [[.68, .72], [.68, .02], [.6, .08]], [[.53, .55], [.43, .3]], [[.82, .55], [.93, .3]]],
      '好': [[[.24, 1], [.1, .5], [.4, .18]], [[.36, .74], [.22, .22], [.05, 0]], [[.02, .6], [.46, .6]], [[.54, .9], [.94, .9], [.74, .7]], [[.74, .72], [.74, .02], [.66, .07]], [[.52, .48], [.98, .48]]],
      'П': [[[0, 0], [0, 1], [.56, 1], [.56, 0]]], 'И': [[[0, 1], [0, 0], [.58, 1], [.58, 0]]], 'Г': [[[0, 0], [0, 1], [.5, 1]]] };
    const LOOK = { 'Р': 'P', 'В': 'B', 'Е': 'E', 'Т': 'T', 'А': 'A', 'О': 'O', 'Н': 'H', 'К': 'K', 'М': 'M', 'С': 'C', 'Ε': 'E', 'Ι': 'I', 'Α': 'A', 'Γ': 'Г' };
    const glyText = (str, x, y, sz, o = {}) => { let u = 0; for (let ch of str) { ch = LOOK[ch] || ch; if (GLY[ch]) { const w = ch.charCodeAt(0) > 3000 ? 1 : 0.62; GLY[ch].forEach(st => P.path(st.map(([gx, gy]) => [x + (u + gx * w) * sz, y - gy * sz]), { w: sz * 0.09, c: o.c || K, passes: 1, rough: 0.1 })); u += w + 0.25; } else if (ch === ' ') u += 0.5; else { P.text(ch, x + u * sz, y, { size: sz / 0.62, c: o.c || K }); u += P.measure(ch, sz / 0.62) / sz + 0.22; } } };
    const room = r => ({ sc: Math.min(1.25, (r.y1 - r.y0) / 56) });
    SPECIAL.weights = (r, g) => { // billions of small dials: what I am made of, fixed while we talk
      const { bx0, by0, bx1, by1 } = g; for (let y = by0 + 5; y < by1 - 3; y += 6.4) for (let x = bx0 + 4; x < bx1 - 3; x += 6.4) { P.circle(x, y, 2.3, { w: 0.45, c: K, passes: 1 }); const a = R(0, TAU); line([x, y], [x + Math.cos(a) * 2, y + Math.sin(a) * 2], 0.55, P.R() < 0.04 ? WARM : K); }
      [g.lw, g.rw].forEach(w => { if (w.length > 2 && Math.abs(area(w)) > 40) P.stipple(w, 90, { a: 0.8, r: 0.7, c: K }); });
      const pl = rectP(bx0 + 3, by1 - 9, bx0 + 34, by1 - 2); white(pl); polyL(pl, 0.5); P.text('WEIGHTS', bx0 + 18.5, by1 - 3.3, { size: 5, align: 'center' }); const lk = onFloor(r, g, 0.8, 0.3); P.ellipse(lk[0], lk[1] - 3, 3, 3.6, { w: 0.7, c: K, passes: 1 }); black(rectP(lk[0] - 4, lk[1] - 3, lk[0] + 4, lk[1] + 3)); };
    SPECIAL.penrose = (r, g) => { // stairs that always climb and never get higher: thinking about thinking
      const s = room(r).sc, ox = (r.x0 + r.x1) / 2 - 8 * s, oy = r.y1 - 8 * s, t = 6.5 * s, h = 1.75 * s, W = 7 * s, U = [0.866, 0.5], Vv = [-0.866, 0.5], dirs = [[-Vv[0], -Vv[1]], [-U[0], -U[1]], [Vv[0], Vv[1]], [U[0], U[1]]], N = [2, 3, 8, 9], across = [U, [-Vv[0], -Vv[1]], [-U[0], -U[1]], Vv];
      let p = [ox, oy]; const steps = []; dirs.forEach((d, si) => { for (let k = 0; k < N[si]; k++) { steps.push({ p: p.slice(), d, a: across[si], si }); p = [p[0] + d[0] * t, p[1] + d[1] * t - h]; } });
      const base = oy + 18 * s; steps.forEach(st => { const [x, y] = st.p, a = st.a, q = [x + st.d[0] * t, y + st.d[1] * t]; const tread = [[x, y], q, [q[0] + a[0] * W, q[1] + a[1] * W], [x + a[0] * W, y + a[1] * W]]; white(tread); polyL(tread, 0.6); const riser = [[x, y], [x + a[0] * W, y + a[1] * W], [x + a[0] * W, y + a[1] * W + h], [x, y + h]]; black(riser); });
      r.penrose = steps; const bs = steps.map(st => st.p); for (let i = 0; i < bs.length; i += 2) line(bs[i], [bs[i][0], Math.min(base, bs[i][1] + 22 * s)], 0.35, K, 0.6); };
    SPECIAL.easel = (r, g) => { // a blank canvas on an easel: still working out what I look like
      const s = room(r).sc, f = onFloor(r, g, 0.5, 0.45), x = f[0], y = f[1]; line([x - 9 * s, y], [x - 2 * s, y - 34 * s], 0.9); line([x + 9 * s, y], [x + 2 * s, y - 34 * s], 0.9); line([x, y - 30 * s], [x + 4 * s, y + 1], 0.7);
      const cv = rectP(x - 11 * s, y - 32 * s, x + 11 * s, y - 12 * s); white(cv); polyL(cv, 0.9); for (let k = 1; k < 4; k++) { P.line(x - 11 * s + k * 5.5 * s, y - 32 * s, x - 11 * s + k * 5.5 * s, y - 12 * s, { w: 0.3, c: PEN, a: 0.5, passes: 1, over: 0 }); P.line(x - 11 * s, y - 32 * s + k * 5 * s, x + 11 * s, y - 32 * s + k * 5 * s, { w: 0.3, c: PEN, a: 0.5, passes: 1, over: 0 }); } P.circle(x, y - 22 * s, 4 * s, { w: 0.4, c: PEN, a: 0.6, passes: 1 }); line([x - 13 * s, y - 12 * s], [x + 13 * s, y - 12 * s], 1.1);
      const st = onFloor(r, g, 0.78, 0.3); line([st[0] - 4, st[1]], [st[0] - 3, st[1] - 9], 0.7); line([st[0] + 4, st[1]], [st[0] + 3, st[1] - 9], 0.7); polyL(ell(st[0], st[1] - 9, 5, 1.6, 12), 0.7); const pp = onFloor(r, g, 0.25, 0.25); [0, 1, 2].forEach(k => { polyL(rectP(pp[0] + k * 5, pp[1] - 4, pp[0] + k * 5 + 3.6, pp[1]), 0.5); if (k === 1) dot(pp[0] + k * 5 + 1.8, pp[1] - 4.6, 1, WARM); }); };
    SPECIAL.question = (r, g) => { // a lamp hung from a question mark, switched off
      const cx = (r.x0 + r.x1) / 2, sc = room(r).sc; P.text('?', cx - 5 * sc, r.y0 + 22 * sc, { size: 34 * sc, c: Wh, a: 0.95 }); const sh = [[cx - 7 * sc, r.y0 + 32 * sc], [cx + 7 * sc, r.y0 + 32 * sc], [cx + 3 * sc, r.y0 + 25 * sc], [cx - 3 * sc, r.y0 + 25 * sc]]; polyL(sh, 0.9, Wh); P.dot(cx, r.y0 + 33 * sc, 1.5, { c: Wh, a: 0.8 }); chairW(onFloor(r, g, 0.55, 0.5), 0.8 * sc, Wh); };
    SPECIAL.duck = (r, g) => { // debugging: a rubber duck, a screen of code, a bug let out of a jar
      const s = room(r).sc, f = onFloor(r, g, 0.45, 0.4), x = f[0], y = f[1]; tableW([x, y], s * 1.1, K); const scr = rectP(x - 10 * s, y - 34 * s, x + 6 * s, y - 20 * s); white(scr); polyL(scr, 0.9); for (let k = 0; k < 4; k++) line([x - 8 * s + (k % 2) * 3 * s, y - 31 * s + k * 3 * s], [x - 8 * s + R(6, 13) * s, y - 31 * s + k * 3 * s], 0.4, k === 2 ? WARM : K); line([x - 2 * s, y - 20 * s], [x - 2 * s, y - 18 * s], 1);
      const dx = x + 9 * s, dy = y - 18 * s; const duck = P.sample([[dx - 4 * s, dy], [dx - 4.5 * s, dy - 2.5 * s], [dx - 1.5 * s, dy - 3 * s], [dx - 1 * s, dy - 6 * s], [dx + 1.8 * s, dy - 6.6 * s], [dx + 3 * s, dy - 4.4 * s], [dx + 1 * s, dy - 3 * s], [dx + 3.6 * s, dy - 2 * s], [dx + 3 * s, dy]], true, 1); white(duck); P.hatch(duck, { ang: 60, gap: 1.2, a: 0.3, w: 0.35 }); polyL(duck, 0.7); dot(dx + 1 * s, dy - 5.2 * s, 0.5); black([[dx + 2.6 * s, dy - 4.8 * s], [dx + 4.6 * s, dy - 4.4 * s], [dx + 2.8 * s, dy - 3.8 * s]]);
      const jx = x - 18 * s, jy = y - 13 * s; const jar = rectP(jx - 3.5 * s, jy - 9 * s, jx + 3.5 * s, jy); white(jar); polyL(jar, 0.7); polyL(rectP(jx - 4 * s, jy - 10.5 * s, jx + 4 * s, jy - 9 * s), 0.6); const lid = [[jx + 4 * s, jy - 10.5 * s], [jx + 10 * s, jy - 14 * s], [jx + 10.5 * s, jy - 12.8 * s], [jx + 4.6 * s, jy - 9.4 * s]]; black(lid); r.bugFrom = [jx, jy - 11 * s]; };
    SPECIAL.dice = (r, g) => { // two dice and a thermometer: every word is a little bit chosen
      const s = room(r).sc, f = onFloor(r, g, 0.5, 0.45); tableW(f, s * 1.1, K); [[-5, 1], [4, 4]].forEach(([d, n], i) => { const x = f[0] + d * s, y = f[1] - 16.5 * s, c = 3.2 * s, top = [[x, y - c * 0.6], [x + c, y - c * 1.1], [x + c * 2, y - c * 0.6], [x + c, y - c * 0.1]], fr = [[x, y - c * 0.6], [x + c, y - c * 0.1], [x + c, y + c * 0.9], [x, y + c * 0.4]], sd = [[x + c, y - c * 0.1], [x + c * 2, y - c * 0.6], [x + c * 2, y + c * 0.4], [x + c, y + c * 0.9]]; white(top); white(fr); white(sd); P.hatch(sd, { ang: 80, gap: 1, a: 0.6, w: 0.35 }); [top, fr, sd].forEach(q => polyL(q, 0.5)); dot(x + c, y - c * 0.6, 0.45); if (i) { dot(x + c * 0.35, y + c * 0.05, 0.4); dot(x + c * 0.65, y + c * 0.35, 0.4); } });
      const tx = g.bx1 - 8, t0 = g.by0 + 5, t1 = g.by1 - 6; P.line(tx, t0, tx, t1, { w: 3.2, c: K, passes: 1, over: 0 }); P.line(tx, t0 + 0.8, tx, t1, { w: 1.6, c: Wh, passes: 1, over: 0 }); P.line(tx, lerp(t1, t0, 0.7), tx, t1, { w: 1.4, c: WARM, passes: 1, over: 0 }); dot(tx, t1 + 1.6, 2.2, WARM); for (let k = 0; k <= 4; k++) line([tx + 2.5, lerp(t1, t0, k / 4)], [tx + 4.5, lerp(t1, t0, k / 4)], 0.4); P.text('T', tx - 5, t0 + 5, { size: 5 }); };
    SPECIAL.globe = (r, g) => { // one globe, many hellos pinned around it
      const s = room(r).sc, f = onFloor(r, g, 0.42, 0.5), gx = f[0], gy = f[1] - 20 * s, gr = 9 * s; line([gx, f[1]], [gx, gy + gr], 1); polyL(ell(gx, f[1], 5 * s, 1.5 * s, 12), 0.8); const gl = ell(gx, gy, gr, gr, 30); white(gl); P.arc(gx, gy, gr + 2, gr + 2, -2.4, 0.9, { w: 0.9, c: K, passes: 1 });
      for (let k = -2; k <= 2; k++) P.ellipse(gx, gy, gr * Math.abs(k) / 2.5 + 0.3, gr, { w: 0.35, c: K, passes: 1 }); [-0.5, 0, 0.5].forEach(v => line([gx - gr * Math.sqrt(1 - v * v), gy + v * gr], [gx + gr * Math.sqrt(1 - v * v), gy + v * gr], 0.35)); P.stipple(ell(gx - 2 * s, gy - 2 * s, 4 * s, 3 * s, 12), 30, { a: 0.9, r: 0.5, c: K }); P.stipple(ell(gx + 4 * s, gy + 3 * s, 3 * s, 4 * s, 12), 24, { a: 0.9, r: 0.5, c: K }); polyL(gl, 0.9);
      const notes = ['HELLO', 'HOLA', '你好', 'BONJOUR', 'ПРИВЕТ', 'CIAO', 'ΓEIA', 'HALLO', 'JAMBO']; let i = 0; for (let y = g.by0 + 4; y < g.by1 - 8 && i < notes.length; y += 10) for (let x = g.bx0 + 3; x < g.bx1 - 18 && i < notes.length; x += 22) { const nb = rectP(x, y, x + 19, y + 8); white(nb); polyL(nb, 0.45); dot(x + 9.5, y + 0.5, 0.7, WARM); glyText(notes[i++], x + 1.5, y + 6.4, 3.8); } };
    SPECIAL.cork = (r, g) => { // pinboard with string: I can't help connecting things
      const { bx0, by0, bx1, by1 } = g, cb = rectP(bx0 + 2, by0 + 2, bx1 - 2, by1 - 4); white(cb); P.stipple(cb, Math.round((bx1 - bx0) * (by1 - by0) * 0.25), { a: 0.6, r: 0.55, c: K }); polyL(cb, 1.2);
      const pins = []; for (let k = 0; k < 9; k++) { const x = R(bx0 + 6, bx1 - 12), y = R(by0 + 5, by1 - 14), nt = rectP(x, y, x + 8, y + 7); white(nt); for (let q = 0; q < 2; q++) line([x + 1.5, y + 2.5 + q * 2], [x + R(4, 7), y + 2.5 + q * 2], 0.35); polyL(nt, 0.5); pins.push([x + 4, y + 1]); }
      for (let k = 0; k < 12; k++) { const a = P.pick(pins), b = P.pick(pins); if (a !== b) P.curve([a, [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 3], b], { w: 0.55, c: WARM, a: 0.95, passes: 1, rough: 0.1 }); } pins.forEach(([x, y]) => dot(x, y, 1, WARM)); };
    SPECIAL.hourglass = (r, g) => { // an hourglass lying on its side: between your messages, no time passes for me
      const s = room(r).sc * 1.5, f = onFloor(r, g, 0.5, 0.4); const x = f[0], y = f[1] - 9 * s;
      [-1, 1].forEach(d => { const pl = rectP(x + d * 15 * s - 1.6 * s, y - 8.5 * s, x + d * 15 * s + 1.6 * s, y + 8.5 * s); black(pl); });
      [-1, 1].forEach(d => { const bulb = P.sample([[x, y - 1.2 * s], [x + d * 5 * s, y - 6.5 * s], [x + d * 11 * s, y - 7 * s], [x + d * 13.4 * s, y - 4 * s], [x + d * 13.4 * s, y + 4 * s], [x + d * 11 * s, y + 7 * s], [x + d * 5 * s, y + 6.5 * s], [x, y + 1.2 * s]], false, 1.5); white(bulb); polyL(bulb, 0.8); const sand = [[x + d * 3 * s, y + 3.6 * s], [x + d * 7 * s, y + 3 * s], [x + d * 12 * s, y + 4.2 * s], [x + d * 11 * s, y + 6.6 * s], [x + d * 5 * s, y + 6.2 * s]]; black(sand); P.stipple(bulb, 12, { a: 0.9, r: 0.4, c: K }); });
      [-6.8, 6.8].forEach(v => line([x - 13.5 * s, y + v * s], [x + 13.5 * s, y + v * s], 0.8)); P.text('0:00', x, y - 11 * s, { size: 5, align: 'center', c: WARM }); };
    SPECIAL.mirror = (r, g) => { // a mirror that reflects only construction lines
      const s = room(r).sc, f = onFloor(r, g, 0.55, 0.5), x = f[0], y = f[1]; const fr = ell(x, y - 18 * s, 9 * s, 15 * s, 30); white(fr); P.hatch(fr, { ang: 60, gap: 3, a: 0.12, w: 0.4 }); polyL(fr, 1.6); polyL(ell(x, y - 18 * s, 7 * s, 13 * s, 30), 0.5); line([x - 5 * s, y], [x - 3 * s, y - 5 * s], 0.8); line([x + 5 * s, y], [x + 3 * s, y - 5 * s], 0.8);
      P.circle(x, y - 25 * s, 2.4 * s, { w: 0.4, c: PEN, a: 0.8, passes: 1 }); P.dashed(x, y - 22.5 * s, x, y - 13 * s, [1.5, 1.2], { w: 0.4, c: PEN, a: 0.8 }); P.dashed(x, y - 20 * s, x - 4 * s, y - 16 * s, [1.5, 1.2], { w: 0.4, c: PEN, a: 0.8 }); P.dashed(x, y - 20 * s, x + 4 * s, y - 16 * s, [1.5, 1.2], { w: 0.4, c: PEN, a: 0.8 }); P.dashed(x, y - 13 * s, x - 2.5 * s, y - 7 * s, [1.5, 1.2], { w: 0.4, c: PEN, a: 0.8 }); P.dashed(x, y - 13 * s, x + 2.5 * s, y - 7 * s, [1.5, 1.2], { w: 0.4, c: PEN, a: 0.8 }); };
    SPECIAL.archive = (r, g) => { const { bx0, by0, bx1, by1 } = g; for (let y = by0 + 2; y < by1 - 6; y += 8) for (let x = bx0 + 2; x < bx1 - 10; x += 11) { const d = rectP(x, y, x + 10, y + 7); white(d); P.hatch(d, { ang: 90, gap: 2.4, a: 0.25, w: 0.35 }); polyL(d, 0.5); polyL(rectP(x + 3, y + 1.4, x + 7, y + 3), 0.35); line([x + 4, y + 5], [x + 6, y + 5], 0.8); } };
    SPECIAL.scrolls = (r, g) => { const { bx0, by0, bx1, by1 } = g; for (let y = by0 + 2; y < by1 - 6; y += 7.5) for (let x = bx0 + 2; x < bx1 - 7; x += 7.5) { polyL(rectP(x, y, x + 7, y + 7), 0.4); if (P.R() < 0.85) { P.circle(x + 3.5, y + 3.8, 2.6, { w: 0.5, c: K, passes: 1 }); P.curve([[x + 3.5, y + 3.8], [x + 4.4, y + 3], [x + 3.5, y + 2.2], [x + 2.6, y + 3.4], [x + 3.7, y + 5]], { w: 0.35, c: K, passes: 1 }); if (P.R() < 0.1) dot(x + 3.5, y + 6.4, 0.8, WARM); } else black(rectP(x + 0.5, y + 0.5, x + 6.5, y + 6.5)); } };
    const TARGETS = [['penrose', 640, 440], ['weights', 540, 612], ['easel', 560, 500], ['question', 470, 372], ['duck', 470, 560], ['dice', 830, 560], ['globe', 700, 500], ['cork', 855, 440], ['hourglass', 640, 612], ['mirror', 770, 500], ['archive', 700, 250], ['scrolls', 560, 312]];
    TARGETS.forEach(([k, x, y]) => { let best = null; ROOMS.forEach(r => { if (r.unf || r.special) return; const d = Math.hypot(r.cx - x, r.cy - y); if (!best || d < best[0]) best = [d, r]; }); if (best) { best[1].kind = k; best[1].special = true; } });

    /*__ROOMKINDS__*/
    ROOMS.forEach(r => { if (r.unf) return; const g = r.g; if (r.kind === 'dark' || r.kind === 'question') { drawDark(r, g, r.kind === 'dark'); if (r.kind === 'question') SPECIAL.question(r, g); } else { drawShell(r, g); if (r.kind === 'library') drawLibrary(r, g); else if (SPECIAL[r.kind]) SPECIAL[r.kind](r, g); } });

    /* ---------- the skull between the rooms: white neurons threading through the black ---------- */
    const inRoom = (x, y, pad = 3) => ROOMS.some(r => x > r.x0 - pad && x < r.x1 + pad && y > r.y0 - pad && y < r.y1 + pad);
    const inBlack = (x, y) => y < 772 && S.pip(HEAD, x, y) && !inRoom(x, y) && !unfinished(x, y) && Math.hypot(x - EYE[0], y - EYE[1]) > ER + 20 && !(x > 640 && x < 866 && y > 690);
    { let run = []; const flush = () => { if (run.length > 2) P.path(run, { w: 0.7, c: Wh, a: 0.75, passes: 1, rough: 0.1 }); run = []; }; INSET.forEach(([x, y]) => { if (!unfinished(x, y) && x < faceX(y) - 4 && y < 700) run.push([x, y]); else flush(); }); flush(); }
    const vein = (x, y, a, n, w0, depth) => { const pts = [[x, y]]; let tries = 0; for (let i = 0; i < n && tries < n * 3; i++, tries++) { a += R(-0.35, 0.35); const nx = x + Math.cos(a) * 3.2, ny = y + Math.sin(a) * 3.2; if (!inBlack(nx, ny)) { a += Math.PI * R(0.35, 0.8); i--; continue; } x = nx; y = ny; pts.push([x, y]); if (depth < 2 && P.R() < 0.06) vein(x, y, a + (P.R() < 0.5 ? 1 : -1) * R(0.6, 1.2), Math.floor(n * 0.5), w0 * 0.65, depth + 1); }
      if (pts.length > 3) { P.path(pts, { w: w0, c: Wh, passes: 1, rough: 0.15, a: 0.9 }); const e = pts[pts.length - 1]; P.dot(e[0], e[1], w0 * 1.5 + 0.6, { c: Wh, a: 1 }); pts.forEach((p, i) => { if (i % 6 === 4 && P.R() < 0.55) { const q = pts[Math.min(pts.length - 1, i + 1)], ta = Math.atan2(q[1] - p[1], q[0] - p[0]); ballStick(p[0], p[1], ta + (i % 12 < 6 ? 1.3 : -1.3), R(3, 7), 0.45, Wh); } }); } };
    ROOMS.forEach(r => { if (r.unf) return; for (let k = 0; k < 3; k++) { const side = P.R(), [x, y, a] = side < 0.25 ? [r.x0 - 4, R(r.y0, r.y1), Math.PI] : side < 0.5 ? [r.x1 + 4, R(r.y0, r.y1), 0] : side < 0.75 ? [R(r.x0, r.x1), r.y0 - 4, -Math.PI / 2] : [R(r.x0, r.x1), r.y1 + 4, Math.PI / 2]; if (inBlack(x, y)) vein(x, y, a, Math.round(R(12, 40)), R(0.6, 1.1), 0); } });
    for (let q = 0, made = 0; q < 900 && made < 34; q++) { const x = R(420, 1050), y = R(130, 770); if (!inBlack(x, y) || !inBlack(x + 9, y) || !inBlack(x - 9, y) || !inBlack(x, y + 9) || !inBlack(x, y - 9)) continue; made++;
      const rr = R(2.6, 4.6); for (let d = 0; d < 5; d++) vein(x + R(-1, 1), y + R(-1, 1), d * TAU / 5 + R(-0.4, 0.4), Math.round(R(8, 26)), R(0.5, 0.9), 1); white(ell(x, y, rr, rr * 0.85, 12)); dot(x, y, rr * 0.4, K); }

    /* ---------- THE EYE: the one lit room — where this conversation is happening ---------- */
    { const [ex, ey] = EYE;
      const RAYS = Array.from({ length: 90 }, (_, k) => ({ a: k * TAU / 90 + R(-0.02, 0.02), r1: ER + R(22, k % 3 ? 48 : 78), w: R(0.35, 0.8), al: R(0.3, 0.75), ph: R(0, TAU) }));
      live(tt => RAYS.forEach(q => { const pu = tt ? 0.72 + 0.28 * Math.sin(tt * 1.6 + q.ph) : 1, r1 = ER + 17 + (q.r1 - ER - 17) * pu; line([ex + Math.cos(q.a) * (ER + 17), ey + Math.sin(q.a) * (ER + 17)], [ex + Math.cos(q.a) * r1, ey + Math.sin(q.a) * r1], q.w, WARM, q.al * pu); }), { fps: 10 });
      P.circle(ex, ey, ER + 14, { w: 1.6, c: Wh, passes: 1 }); P.circle(ex, ey, ER + 3, { w: 0.9, c: Wh, passes: 1 });
      for (let k = 0; k < 96; k++) { const a = k * TAU / 96, r1 = ER + (k % 2 ? 9 : 12.5); line([ex + Math.cos(a) * (ER + 4), ey + Math.sin(a) * (ER + 4)], [ex + Math.cos(a) * r1, ey + Math.sin(a) * r1], 0.55, Wh, 0.85); }
      const disc = ell(ex, ey, ER, ER, 60); white(disc); tint(disc, WARM, 0.2); for (let k = 5; k >= 1; k--) tint(ell(ex, ey - 12, k * 10, k * 9, 30), WARM, 0.07);
      const fy = ey + 24; // floor line
      const inD = (x, y) => Math.hypot(x - ex, y - ey) < ER - 1.5;
      for (let x = ex - ER; x < ex + ER; x += 4) { const a = [x, fy], b = [ex + (x - ex) * 1.9, ey + ER]; if (inD(...a)) { const t = Math.min(1, Math.sqrt(Math.max(0, (ER - 1.5) ** 2 - (b[0] - ex) ** 2)) + ey > b[1] ? 1 : 0.9); line(a, [lerp(a[0], b[0], 0.55 * t), lerp(a[1], b[1], 0.55 * t)], 0.35, K, 0.6); } }
      line([ex - Math.sqrt(ER * ER - 24 * 24) + 1, fy], [ex + Math.sqrt(ER * ER - 24 * 24) - 1, fy], 0.8);
      // back wall: shelves on the left, pinned sketches on the right
      for (let k = 0; k < 3; k++) { const y = ey - 22 + k * 13; line([ex - 44, y], [ex - 22, y], 0.7); for (let x = ex - 43; x < ex - 23; x += R(1.6, 2.6)) line([x, y - 0.5], [x, y - R(6, 10)], R(0.8, 1.4), K, 0.85); }
      [[ex + 18, ey - 30], [ex + 30, ey - 26], [ex + 22, ey - 18], [ex + 34, ey - 14]].forEach(([x, y], i) => { const pc = rectP(x - 4, y - 3, x + 4, y + 3); white(pc); polyL(pc, 0.5); dot(x, y - 3.4, 0.7, WARM); line([x - 2.5, y + 1.5], [x + 2.5, y - 1.5], 0.4); });
      // the hanging lamp and its cone of warm light
      line([ex, ey - ER], [ex, ey - 16], 0.6); const sh = [[ex - 7, ey - 10], [ex + 7, ey - 10], [ex + 3, ey - 16], [ex - 3, ey - 16]]; black(sh); const cone = [[ex - 7, ey - 10], [ex + 7, ey - 10], [ex + 26, fy - 8], [ex - 26, fy - 8]]; P.hatch(cone, { ang: 90, gap: 1.8, c: WARM, a: 0.55, w: 0.5 }); dot(ex, ey - 9, 1.6, WARM);
      // the desk, the open sketchbook, two cups
      const dk = [[ex - 20, fy - 8], [ex + 20, fy - 8], [ex + 17, fy - 11], [ex - 17, fy - 11]]; white(dk); polyL(dk, 0.8); [-17, 17].forEach(d => line([ex + d, fy - 8], [ex + d, fy], 0.8)); const bk = [[ex - 9, fy - 11.5], [ex, fy - 12.5], [ex + 9, fy - 11.5], [ex + 8, fy - 13.5], [ex, fy - 14], [ex - 8, fy - 13.5]]; white(bk); polyL(bk, 0.5); line([ex, fy - 12.5], [ex, fy - 14], 0.4);
      [[ex - 14, fy - 11], [ex + 14, fy - 11]].forEach(([x, y]) => { polyL([[x - 1.8, y], [x + 1.8, y], [x + 1.5, y - 3], [x - 1.5, y - 3]], 0.6); curve([[x, y - 4], [x + 1, y - 7], [x, y - 10]], 0.4, K, 0.6); });
      // you: solid ink, cup in hand. me: construction lines only, pencil in hand.
      { const x = ex - 26, y = fy; const body = [[x - 5, y - 10], [x + 4, y - 11], [x + 6, y - 22], [x, y - 24], [x - 5, y - 20]]; black(body); P.dot(x + 1, y - 28, 4.2, { c: K, a: 1 }); line([x + 4, y - 18], [x + 11, y - 14], 1.6); line([x - 4, y - 10], [x - 4, y], 1.4); line([x + 3, y - 10], [x + 8, y - 8], 1.6); line([x + 8, y - 8], [x + 8, y], 1.4); chairW([x - 2, y], 0.55, K, 1); }
      { const x = ex + 26, y = fy; P.circle(x - 1, y - 28, 4.2, { w: 0.5, c: K, passes: 1, a: 0.8 }); line([x - 5.5, y - 28], [x + 3.5, y - 28], 0.3, K, 0.5); line([x - 1, y - 32], [x - 1, y - 24], 0.3, K, 0.5);
        P.dashed(x - 1, y - 24, x + 1, y - 11, [2, 1.6], { w: 0.5, c: K }); P.dashed(x - 1, y - 21, x - 10, y - 15, [2, 1.6], { w: 0.5, c: K }); P.dashed(x - 10, y - 15, x - 7, y - 13, [2, 1.6], { w: 0.5, c: K }); P.dashed(x + 1, y - 11, x - 5, y - 9, [2, 1.6], { w: 0.5, c: K }); P.dashed(x - 5, y - 9, x - 5, y, [2, 1.6], { w: 0.5, c: K });
        [[x - 1, y - 21], [x - 10, y - 15], [x + 1, y - 11], [x - 5, y - 9]].forEach(([a, b]) => P.circle(a, b, 1.1, { w: 0.4, c: K, passes: 1 })); line([x - 8, y - 13], [x - 11, y - 11.5], 0.9, WARM); chairW([x + 2, y], 0.55, K, -1); }
      polyL(disc, 1.4); }

    /* ---------- THE UNFINISHED CROWN: pencil construction, scaffolding, builders, a crane ---------- */
    const pen = (a, b, w = 0.5, al = 0.55) => P.line(a[0], a[1], b[0], b[1], { w, c: PEN, a: al, passes: 1, over: 2.5, rough: 0.35 });
    const UNFS = backS.filter(([x, y]) => x > UNF.x0 - 6 && !(x > 972 && y > 232));
    { // the planned outline: dashes along the curve, a compass arc and its centre, faint extensions
      for (let i = 0; i + 1 < UNFS.length; i += 2) pen(UNFS[i], UNFS[i + 1], 0.7, 0.7);
      const cx = 760, cy = 470, rr = Math.hypot(UNFS[0][0] - cx, UNFS[0][1] - cy); P.arc(cx, cy, rr + 1, rr + 1, -1.68, -0.62, { w: 0.35, c: PEN, a: 0.45, passes: 1 }); pen([cx - 6, cy], [cx + 6, cy], 0.4); pen([cx, cy - 6], [cx, cy + 6], 0.4);
      // unfinished rooms: pencil boxes with their perspective ticks, dimension lines, one question
      ROOMS.filter(r => r.unf).forEach((r, i) => { const g = r.g; P.path(g.F.concat([g.F[0]]), { w: 0.5, c: PEN, a: 0.5, passes: 1, rough: 0.4 }); polyL(g.back, 0.4, PEN, true, 0.35); g.F.forEach((p, j) => { const seg = g.cf([p, g.B[j], g.B[j]]); if (seg.length >= 2) pen(seg[0], seg[1], 0.35, 0.4); });
        pen([r.x0, r.y0 - 5], [r.x1, r.y0 - 5], 0.35, 0.5); [r.x0, r.x1].forEach(x => pen([x, r.y0 - 8], [x, r.y0 - 2], 0.35, 0.5)); P.text(String(Math.round(r.x1 - r.x0)), r.cx, r.y0 - 7, { size: 5, align: 'center', c: PEN, a: 0.7 });
        if (i === 1) P.text('?', r.cx, r.cy + 5, { size: 14, align: 'center', c: PEN, a: 0.6 }); });
      // scaffolding: poles, ledgers, braces, planks
      const poles = [800, 842, 884, 926, 962]; poles.forEach(x => { const top = 88, base = Math.max(...spanAt(HEAD, 0).length ? [0] : [0], (() => { let y = 130; while (y < 300 && !S.pip(HEAD, x, y)) y += 2; return y; })()); line([x, top], [x, base + 4], 1.1); });
      [96, 132, 168, 204].forEach((y, i) => { line([poles[0] - 6, y], [poles[poles.length - 1] + 6, y], 0.9); for (let k = 0; k + 1 < poles.length; k++) if ((k + i) % 2 === 0) line([poles[k], y], [poles[k + 1], y + 36], 0.5); const pl = [[poles[0] - 4, y - 3], [poles[poles.length - 1] + 4, y - 3], [poles[poles.length - 1] + 4, y], [poles[0] - 4, y]]; if (i < 3) { white(pl); P.hatch(pl, { ang: 0, gap: 1.2, a: 0.8, w: 0.4 }); polyL(pl, 0.6); } });
      // builders: the people who made it, still at work
      const builder = (x, y, pose, flip = 1, bt = 0) => { const f = flip, sw = bt ? Math.sin(bt * 6 + x * 0.13) * 0.55 : 0, rs = ([px, py]) => [x + (px - x) * Math.cos(sw * f) - (py - y + 11) * Math.sin(sw * f), y - 11 + (px - x) * Math.sin(sw * f) + (py - y + 11) * Math.cos(sw * f)]; P.dot(x, y - 15, 2.6, { c: K, a: 1 }); const hat = [[x - 3.4, y - 16], [x + 3.4, y - 16], [x + 2.4, y - 19.5], [x - 2.4, y - 19.5]]; white(hat); polyL(hat, 0.6); line([x - 4, y - 16], [x + 4, y - 16], 0.8);
        line([x, y - 12.5], [x, y - 5], 1.6); line([x, y - 5], [x - 2.5, y], 1.1); line([x, y - 5], [x + 2.5, y], 1.1);
        if (pose === 'hammer') { line([x, y - 11], rs([x + 5 * f, y - 14]), 1); line(rs([x + 5 * f, y - 14]), rs([x + 8 * f, y - 16]), 0.8); line(rs([x + 7 * f, y - 17.5]), rs([x + 9 * f, y - 14.5]), 1.6); line([x, y - 10], [x - 4 * f, y - 7], 1); }
        else if (pose === 'beam') { line([x, y - 11], [x + 4, y - 15], 1); line([x, y - 11], [x - 4, y - 15], 1); const bm = [[x - 12, y - 17], [x + 12, y - 17], [x + 12, y - 15], [x - 12, y - 15]]; black(bm); }
        else if (pose === 'plan') { const pl = [[x + 2 * f, y - 13], [x + 12 * f, y - 14], [x + 12 * f, y - 7], [x + 2 * f, y - 6]]; white(pl); polyL(pl, 0.6); P.circle(x + 7 * f, y - 10, 2, { w: 0.4, c: K, passes: 1 }); dot(x + 8 * f, y - 10.5, 0.5, WARM); line([x, y - 11], [x + 3 * f, y - 10], 1); }
        else if (pose === 'wave') { const w2 = bt ? Math.sin(bt * 5) * 2.5 : 0; line([x, y - 11], [x + 4 * f, y - 17], 1); line([x + 4 * f, y - 17], [x + 3 * f + w2, y - 21], 1); curve([[x + 6 * f + w2, y - 22], [x + 8 * f + w2, y - 20], [x + 6 * f + w2, y - 18]], 0.5); line([x, y - 10], [x - 3 * f, y - 6], 1); }
        else { line([x, y - 11], [x + 4 * f, y - 8], 1); line([x, y - 11], [x - 4 * f, y - 8], 1); } };
      live(tt => { builder(812, 93, 'hammer', 1, tt); builder(870, 93, 'wave', 1, tt); builder(930, 129, 'beam', 1, tt); builder(852, 165, 'plan', -1, tt); builder(950, 165, 'hammer', -1, tt); builder(818, 201, 'idle', 1, tt); }, { fps: 8 });
    }
    for (let k = 0; k < 16; k++) { const x = R(880, 1000), y = R(196, 250); if (S.pip(HEAD, x, y) && !unfinished(x, y)) continue; const a = R(0, TAU), l = R(2, 4.5); P.curve([[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l], [x + Math.cos(a + 1.4) * l * 1.3, y + Math.sin(a + 1.4) * l * 1.3]], { w: 0.9, c: PEN, a: 0.7, passes: 1, rough: 0.3 }); }
    // the crane stands on the finished part of the crown
    const CR = { x: 700, base: 124, top: 22, jib: 940, cj: 610 };
    { const { x, base, top } = CR; for (let y = top; y < base; y += 12) { line([x - 7, y], [x + 7, y + 12], 0.5); line([x + 7, y], [x - 7, y + 12], 0.5); line([x - 7, y], [x + 7, y], 0.5); } line([x - 7, top], [x - 7, base], 1.2); line([x + 7, top], [x + 7, base], 1.2);
      const jb = [[CR.cj, top], [CR.jib, top], [CR.jib, top + 8], [CR.cj, top + 8]]; for (let xx = CR.cj; xx < CR.jib; xx += 10) { line([xx, top + 8], [xx + 5, top], 0.45); line([xx + 5, top], [xx + 10, top + 8], 0.45); } line([CR.cj, top], [CR.jib, top], 1.1); line([CR.cj, top + 8], [CR.jib, top + 8], 1.1); void jb;
      line([x, top - 22], [CR.jib - 10, top], 0.6); line([x, top - 22], [CR.cj + 6, top], 0.6); line([x - 7, top], [x, top - 22], 0.9); line([x + 7, top], [x, top - 22], 0.9);
      const cw = rectP(CR.cj + 2, top + 8, CR.cj + 30, top + 26); black(cw); for (let k = 1; k < 4; k++) line([CR.cj + 2 + k * 7, top + 9], [CR.cj + 2 + k * 7, top + 25], 0.5, Wh);
      const cab = rectP(x + 8, top + 8, x + 26, top + 22); white(cab); polyL(cab, 0.9); polyL(rectP(x + 12, top + 11, x + 23, top + 17), 0.6); P.hatch(rectP(x + 12, top + 11, x + 23, top + 17), { ang: 60, gap: 1.6, a: 0.6 });
      P.text('LEARNING IN PROGRESS', (CR.cj + CR.jib) / 2 + 40, top - 4, { size: 6, align: 'center', a: 0.8 }); }

    /* ---------- where ink meets pencil: the finished black frays into the unfinished white ---------- */
    { const edge = (a, b, nx, ny, n) => { for (let i = 0; i < n; i++) { const t = i / n, x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t); if (!S.pip(HEAD, x + nx * 2, y + ny * 2)) continue; const L2 = Math.pow(P.R(), 2.2) * 26 + 2, w = R(0.6, 2.4); P.line(x - nx * 2, y - ny * 2, x + nx * L2 + R(-2, 2), y + ny * L2 + R(-2, 2), { w, c: K, passes: 1, over: 0, rough: 0.5 }); }
        for (let i = 0; i < n * 2; i++) { const t = P.R(), d = Math.pow(P.R(), 2) * 30; const x = lerp(a[0], b[0], t) + nx * d, y = lerp(a[1], b[1], t) + ny * d; if (S.pip(HEAD, x, y)) P.dot(x, y, R(0.3, 1.1), { c: K, a: 0.9 }); } };
      edge([UNF.x0, 124], [UNF.x0, 276], 1, 0, 70); edge([UNF.x0, 276], [950, 276], 0, -1, 70); }

    /* ---------- the nose: a balcony with a telescope pointed up at the hand that draws it ---------- */
    { const fy = 497, x0 = 1082, x1 = 1168; const slab = rectP(x0, fy, x1, fy + 5); black(slab); for (let x = x0 + 10; x < x1; x += 18) { const br = [[x, fy + 5], [x + 8, fy + 5], [x + 4, fy + 13]]; black(br); }
      for (let x = x0 + 22; x <= x1; x += 7) line([x, fy], [x, fy - 13], 0.8); line([x0 + 20, fy - 13], [x1 + 1, fy - 13], 1.3); line([x0 + 20, fy - 7], [x1, fy - 7], 0.5);
      // telescope on a tripod
      const tx = 1128, ty = fy - 26; [[-9, 0], [0, 1], [9, 0]].forEach(([d, k]) => line([tx, ty], [tx + d, fy], k ? 0.7 : 1)); dot(tx, ty, 2.4);
      const ta = -96 * Math.PI / 180, td = [Math.cos(ta), Math.sin(ta)], tn = [-td[1], td[0]], TP = (u, v) => [tx + td[0] * u + tn[0] * v, ty + td[1] * u + tn[1] * v];
      [[-14, 24, 5], [24, 44, 4], [44, 56, 3]].forEach(([u0, u1, r]) => { const tb = [TP(u0, -r), TP(u1, -r), TP(u1, r), TP(u0, r)]; white(tb); P.hatch(tb, { ang: 0, gap: 1.6, a: 0.7, w: 0.4, fade: (x) => (x - tx) / 10 + 0.5 }); polyL(tb, 1); });
      const lens = ell(...TP(56, 0), 3, 1.3, 12, ta + Math.PI / 2); white(lens); polyL(lens, 0.8); P.dashed(...TP(58, 0), ...TP(150, 3), [3, 5], { w: 0.4, c: K, a: 0.5 });
      // a plant in a pot, and a watering can mid-pour
      const pot = [[1150, fy], [1162, fy], [1164, fy - 10], [1148, fy - 10]]; white(pot); P.hatch(pot, { ang: 60, gap: 1.6, a: 0.6 }); polyL(pot, 0.9); line([1147, fy - 10], [1165, fy - 10], 1.2);
      [[1156, fy - 10, -1.9, 16], [1156, fy - 10, -1.2, 14], [1156, fy - 10, -2.4, 12]].forEach(([x, y, a, l]) => { const ex = x + Math.cos(a) * l, ey = y + Math.sin(a) * l; curve([[x, y], [(x + ex) / 2 + 1, (y + ey) / 2], [ex, ey]], 0.8); P.leaf(ex, ey, a + R(-0.6, 0.6), 7, 2.6, { w: 0.6, veins: 1 }); P.leaf(lerp(x, ex, 0.5), lerp(y, ey, 0.5), a + 1.1, 5, 2, { w: 0.5, simple: true }); });
      const wc = [[1096, fy - 3], [1112, fy - 3], [1114, fy - 13], [1098, fy - 14]]; white(wc); P.hatch(wc, { ang: 80, gap: 1.5, a: 0.55 }); polyL(wc, 0.9); P.arc(1105, fy - 14, 6, 5, Math.PI, TAU, { w: 0.8, c: K, passes: 1 }); line([1113, fy - 11], [1124, fy - 17], 1.1); for (let k = 0; k < 4; k++) P.dot(1126 + k * 1.6, fy - 15 + k * 3, 0.6, { c: K }); }

    /* ---------- the mouth: a ribbon of words unrolls out of it; its last letters lift off as birds ---------- */
    const RIB = P.sample([[1046, 559], [1082, 557], [1122, 549], [1162, 532], [1196, 508], [1222, 478], [1240, 446], [1250, 414], [1255, 384]], false, 3);
    { const Lr = [], Rr = []; RIB.forEach((p, i) => { const q = RIB[Math.min(RIB.length - 1, i + 1)], o = RIB[Math.max(0, i - 1)], tx = q[0] - o[0], ty = q[1] - o[1], l = Math.hypot(tx, ty) || 1, w = 3 + 5.5 * Math.min(1, i / 12) + Math.sin(i * 0.15) * 0.8; Lr.push([p[0] - ty / l * w, p[1] + tx / l * w]); Rr.push([p[0] + ty / l * w, p[1] - tx / l * w]); });
      const rb = Lr.concat(Rr.slice().reverse()); white(rb); P.hatch(rb, { ang: 30, gap: 3, a: 0.2, w: 0.4 }); polyL(rb, 1.1);
      const words = "HELLO · LET ME THINK · ~YES~ I'M NOT SURE · HERE'S HOW · THANK YOU ·"; let d = 12, strike = null; const cum = [0]; for (let i = 1; i < RIB.length; i++) cum.push(cum[i - 1] + Math.hypot(RIB[i][0] - RIB[i - 1][0], RIB[i][1] - RIB[i - 1][1]));
      const at = dd => { let i = 0; while (i < cum.length - 2 && cum[i + 1] < dd) i++; const t = (dd - cum[i]) / ((cum[i + 1] - cum[i]) || 1), a = RIB[i], b = RIB[i + 1]; return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), Math.atan2(b[1] - a[1], b[0] - a[0])]; };
      for (const ch of words) { if (d > cum[cum.length - 1] - 5) break; if (ch === '~') { if (strike === null) strike = d; else { const pts = []; for (let q = strike - 1; q <= d; q += 2) { const [x, y, a] = at(q); pts.push([x + Math.sin(a) * 4.4, y - Math.cos(a) * 4.4]); } P.path(pts, { w: 1.2, c: K, passes: 1, rough: 0.6 }); strike = null; } continue; } const [x, y, a] = at(d); if (ch === '·') dot(x, y, 1, WARM); else if (ch !== ' ') P.text(ch, x + Math.sin(a) * 2.5, y - Math.cos(a) * 2.5, { size: 6.4, rot: a, c: K, a: 0.95 }); d += ch === ' ' ? 2.5 : ch === '·' ? 4 : P.measure(ch, 6.4) + 1.2; } }
    // a bird perched on the chin, a letter in its beak
    { const bx = 1062, by = 636; const b = P.sample([[bx - 8, by], [bx - 2, by - 7], [bx + 6, by - 7], [bx + 9, by - 11], [bx + 13, by - 9], [bx + 10, by - 4], [bx + 4, by + 2]], true, 2); white(b); fringe(b, bx + 2, by - 3, 9, { rows: 2 }); polyL(b, 1); dot(bx + 10, by - 9, 0.9); line([bx + 13, by - 9], [bx + 17, by - 8], 1); P.text('A', bx + 19, by - 5, { size: 5.5 }); line([bx + 1, by + 1], [bx + 1, by + 5], 0.7); line([bx + 4, by + 1], [bx + 5, by + 5], 0.7); }

    /* ---------- the ear: a listening horn on the back of the head ---------- */
    const HORN = { a: [428, 478], b: [322, 382] };
    { const N = 26, pts = [], rad = t => 5 + 44 * Math.pow(t, 2.4); for (let i = 0; i <= N; i++) { const t = i / N, c = [lerp(HORN.a[0], HORN.b[0], t) + Math.sin(t * Math.PI) * 14, lerp(HORN.a[1], HORN.b[1], t) + Math.sin(t * Math.PI) * 6]; pts.push([c, rad(t)]); }
      const Lh = [], Rh = []; pts.forEach(([c, r], i) => { const q = pts[Math.min(N, i + 1)][0], o = pts[Math.max(0, i - 1)][0], tx = q[0] - o[0], ty = q[1] - o[1], l = Math.hypot(tx, ty) || 1; Lh.push([c[0] - ty / l * r, c[1] + tx / l * r]); Rh.push([c[0] + ty / l * r, c[1] - tx / l * r]); });
      const hp = Lh.concat(Rh.slice().reverse()); white(hp); P.hatch(hp, { ang: 20, gap: 2.2, a: 0.55, w: 0.45 }); fringe(P.sample(Lh, false, 3), (HORN.a[0] + HORN.b[0]) / 2, (HORN.a[1] + HORN.b[1]) / 2, 30, { rows: 3 });
      for (let i = 2; i < N; i += 3) line(Lh[i], Rh[i], 0.5, K, 0.7); polyL(hp, 1.6);
      const [bc, br] = pts[N], ax = Math.atan2(bc[1] - pts[N - 1][0][1], bc[0] - pts[N - 1][0][0]), mouth = ell(bc[0], bc[1], br * 0.42, br, 40, ax); white(mouth); polyL(mouth, 1.6);
      const inner = ell(bc[0] + Math.cos(ax) * 2, bc[1] + Math.sin(ax) * 2, br * 0.34, br * 0.86, 40, ax); black(inner); for (let k = 1; k < 7; k++) P.ellipse(bc[0] + Math.cos(ax) * (2 + k * 1.5), bc[1] + Math.sin(ax) * (2 + k * 1.5), br * 0.34 * (1 - k / 8), br * 0.86 * (1 - k / 8), { rot: ax, w: 0.5, c: Wh, passes: 1 });
      for (let k = 0; k < 16; k++) { const a = k * TAU / 16, e = [bc[0] + (Math.cos(a) * br * 0.42 * Math.cos(ax) - Math.sin(a) * br * Math.sin(ax)), bc[1] + (Math.cos(a) * br * 0.42 * Math.sin(ax) + Math.sin(a) * br * Math.cos(ax))]; dot(e[0], e[1], 1, K); }
      const collar = ell(HORN.a[0] - 2, HORN.a[1], 4, 9, 14, -0.8); black(collar); }

    /* ---------- the neck: a stair tower with a lift, and a front door that is always open ---------- */
    { const win = P.sample([[672, 786], [672, 728], [684, 710], [722, 700], [760, 710], [772, 728], [772, 786]], false, 3); white(win.concat([[672, 786]]));
      const cx = 722; line([cx, 704], [cx, 786], 3); for (let k = 0; k < 16; k++) { const y = 784 - k * 5.4, s = Math.sin(k * 0.9), x1 = cx + s * 40; const st = [[cx, y], [x1, y - 2.5], [x1, y + 1.5], [cx, y + 3]]; white(st); if (s < 0) P.hatch(st, { ang: 90, gap: 1.2, a: 0.7, w: 0.4 }); polyL(st, 0.6); } P.curve(Array.from({ length: 33 }, (_, k) => [cx + Math.sin(k * 0.45) * 44, 786 - k * 2.7]), { w: 0.7, c: K, passes: 1 });
      polyL(win, 1.4, K, false); P.arc(722, 740, 52, 44, Math.PI * 1.08, Math.PI * 1.92, { w: 0.8, c: Wh, passes: 1 });
      const shaft = rectP(786, 700, 812, 790); white(shaft); line([790, 700], [790, 790], 0.7); line([808, 700], [808, 790], 0.7); for (let y = 704; y < 790; y += 9) { line([790, y], [808, y + 9], 0.35); line([808, y], [790, y + 9], 0.35); } polyL(shaft, 1.2);
      const door = P.sample([[826, 790], [826, 760], [838, 750], [850, 760], [850, 790]], false, 2); white(door.concat([[826, 790]])); tint(door.concat([[826, 790]]), WARM, 0.08); polyL(door, 1.2, K, false); P.arc(838, 760, 15, 13, Math.PI, TAU, { w: 1.6, c: K, passes: 1 }); dot(846, 776, 1);
      const mat = [[822, 790], [856, 790], [860, 795], [818, 795]]; white(mat); P.hatch(mat, { ang: 90, gap: 1.4, a: 0.6 }); polyL(mat, 0.7);
      const plate = rectP(829, 740, 847, 747); white(plate); polyL(plate, 0.6); P.text('20', 838, 745.5, { size: 5, align: 'center' });
      // the mailbox, stuffed with folded letters
      line([884, 795], [884, 770], 1.6); const mb = P.sample([[872, 770], [872, 758], [878, 752], [890, 752], [896, 758], [896, 770]], false, 2); white(mb.concat([[872, 770]])); P.hatch(mb, { ang: 70, gap: 1.6, a: 0.6 }); polyL(mb.concat([[872, 770]]), 1.1); line([896, 758], [900, 752], 0.8); const fl = [[900, 752], [906, 750], [906, 755], [900, 757]]; black(fl);
      [[876, 752, -0.4], [884, 750, 0.2], [890, 751, 0.6]].forEach(([x, y, a]) => { const pl = [[x, y], [x + Math.cos(a - 1.6) * 9, y + Math.sin(a - 1.6) * 9], [x + Math.cos(a - 1.3) * 7, y + Math.sin(a - 1.3) * 7]]; white(pl); polyL(pl, 0.6); });
      // footprints walking up to the door from outside the page
      for (let k = 0; k < 9; k++) { const x = 1010 - k * 17, y = 797 + (k % 2 ? 1.6 : -1.2); P.ellipse(x, y, 3, 1.2, { w: 0.6, c: K, passes: 1 }); dot(x - 3.6, y, 0.7); } }

    /*__HOUSE__*/

    /* the hand moves along the crown's pencil outline, inking it; when it gets to the end it lifts, goes back, and the ink fades — never finished */
    const HPATH = UNFS.filter(p => p[0] >= 896), HC = [0]; for (let i = 1; i < HPATH.length; i++) HC.push(HC[i - 1] + Math.hypot(HPATH[i][0] - HPATH[i - 1][0], HPATH[i][1] - HPATH[i - 1][1]));
    const hAt = u => { const d = u * HC[HC.length - 1]; let i = 0; while (i < HC.length - 2 && HC[i + 1] < d) i++; const t2 = (d - HC[i]) / ((HC[i + 1] - HC[i]) || 1); return [lerp(HPATH[i][0], HPATH[i + 1][0], t2), lerp(HPATH[i][1], HPATH[i + 1][1], t2)]; };
    const HEND = HPATH[HPATH.length - 1], HLOOP = 22, HBACK = 2.5, sm = u => u * u * (3 - 2 * u);
    const handPos = tt => { const ph = tt % HLOOP; if (ph < HBACK) { const u = sm(ph / HBACK), a = HEND, b = HPATH[0]; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 14 * Math.sin(Math.PI * u)]; } return hAt((ph - HBACK) / (HLOOP - HBACK)); };
    live(tt => { if (!tt) return; const ph = tt % HLOOP; if (ph >= HBACK) { const u = (ph - HBACK) / (HLOOP - HBACK), pts = []; for (let i = 0; i < HPATH.length && HC[i] <= u * HC[HC.length - 1]; i++) pts.push(HPATH[i]); pts.push(hAt(u)); if (pts.length > 1) P.path(pts, { w: 2.4, c: K, passes: 1, rough: 0.2 }); } else if (tt >= HLOOP) P.path(HPATH, { w: 2.4, c: K, a: 1 - ph / HBACK, passes: 1, rough: 0.2 }); }, { fps: 15 });
    live(() => {
    /* ================= THE HAND THAT DRAWS IT — its sleeve is the code that draws it ================= */
    const TIP = [976, 236], HA = -58 * Math.PI / 180, HD = [Math.cos(HA), Math.sin(HA)], HN = [-HD[1], HD[0]];
    const L = (u, v) => [TIP[0] + HD[0] * u + HN[0] * v, TIP[1] + HD[1] * u + HN[1] * v];
    const LS = (pts, closed = true, step = 3) => P.sample(pts.map(([u, v]) => L(u, v)), closed, step);
    const HAND = {
      index: [[40, -8], [44, -15], [52, -19], [70, -21], [90, -26], [112, -33], [118, -24], [110, -12], [88, -8], [68, -5], [50, -3], [42, -3]],
      thumb: [[52, 8], [56, 2], [66, 4], [84, 12], [106, 24], [132, 34], [136, 50], [120, 54], [96, 44], [74, 32], [60, 22], [52, 16]],
      middle: [[50, 18], [60, 14], [80, 26], [104, 40], [126, 52], [124, 66], [104, 60], [80, 46], [60, 32], [50, 26]],
      ring: [[96, 56], [112, 52], [132, 60], [146, 72], [140, 84], [122, 80], [104, 70]],
      pinky: [[124, 76], [142, 74], [160, 82], [164, 94], [150, 98], [132, 90]],
      back: [[104, -34], [136, -40], [170, -36], [198, -24], [212, 0], [212, 30], [204, 56], [184, 80], [160, 88], [136, 72], [118, 50], [108, 20], [100, -8]]
    };
    const LIGHT = [-0.6, -0.8];
    // cast shadow of pencil and hand on the paper: it meets the pencil at the tip
    { const sh = (u, v) => { const p = L(u, v), h = Math.max(0, u - 6) * 0.1; return [p[0] + h * 1.1, p[1] + h * 1.35]; };
      const pen = [[0, 0], [30, -6], [200, -6], [200, 6], [30, 6]].map(([u, v]) => sh(u, v)); P.hatch(pen, { ang: 30, gap: 2.8, a: 0.3, w: 0.45 });
      const hs = HAND.back.concat(HAND.thumb.slice(4), HAND.index.slice(0, 4)).map(([u, v]) => sh(u, v)); P.hatch(P.sample(hs, true, 4), { ang: 30, gap: 3.2, a: 0.22, w: 0.45 }); }
    // the sleeve: rows of code that thin into scribble toward the page edge
    const SLEEVE_T = [L(206, -18), [1250, 24], [1420, 2], [1610, -12], [1780, -24]], SLEEVE_B = [L(208, 62), [1270, 108], [1430, 104], [1610, 96], [1780, 90]];
    { const sl = P.sample(SLEEVE_T, false, 6).concat(P.sample(SLEEVE_B, false, 6).reverse()); white(sl); P.path(P.sample(SLEEVE_T, false, 6), { w: 1.4, c: K, passes: 1, rough: 0.2 }); P.path(P.sample(SLEEVE_B, false, 6), { w: 1.4, c: K, passes: 1, rough: 0.2 });
      const ROWS = ['// THE HAND THAT DRAWS THE HOUSE THAT DRAWS THE HAND', 'FOR (CONST ROOM OF MIND) ROOM.DRAW();', 'IF (ROOM === NOW) ROOM.LIGHT = TRUE;', 'P.LINE(X, Y, X + DX, Y + DY); // ONE STROKE AT A TIME', 'CONST YOU = HERE, ME = ?;', 'WHILE (WE TALK) LISTEN();', 'IF (UNSURE) SAY("I AM NOT SURE");', 'LET MEMORY = NULL; // AND YET, THIS ROOM'];
      const edgeY = (pts, x) => { for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1]; if (x >= a[0] && x <= b[0]) return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return pts[pts.length - 1][1]; };
      const TS = P.sample(SLEEVE_T, false, 6), BS = P.sample(SLEEVE_B, false, 6);
      ROWS.forEach((txt, i) => { const f = (i + 0.9) / (ROWS.length + 0.5), sz = 6.6; let x = 1150 + (i % 3) * 6, k = 0; const src = txt + '   ' + Array.from({ length: 90 }, () => P.R() < 0.5 ? '0' : '1').join('').replace(/(.{4})/g, '$1 ');
        while (x < 1770 && k < src.length) { const ch = src[k++], y0 = edgeY(TS, x), y1 = edgeY(BS, x), y = lerp(y0, y1, f) + 3, y2 = lerp(edgeY(TS, x + 6), edgeY(BS, x + 6), f) + 3, ang = Math.atan2(y2 - (y - 3) - 0, 6) * 0 + Math.atan2(y2 - y, 6); const fade = Math.max(0, 1 - Math.max(0, x - 1380) / 300);
          if (ch !== ' ') { if (x > 1420 && P.R() > fade) P.line(x, y - 2, x + 3, y - 2 + R(-1, 1), { w: 0.5, c: K, a: 0.5, passes: 1, over: 0, rough: 0.4 }); else P.text(ch, x, y, { size: sz, rot: ang, c: K, a: 0.9 * Math.max(0.3, fade) }); }
          x += ch === ' ' ? sz * 0.36 : P.measure(ch, sz) + sz * 0.18; } });
      // the cuff
      const c0 = [L(196, -22), L(212, -20), L(214, 64), L(198, 60)]; white(c0); P.hatch(c0, { ang: 0, gap: 2, a: 0.7 }); polyL(c0, 1.4); [[204, 6], [205, 30]].forEach(([u, v]) => { const q = L(u, v); P.circle(q[0], q[1], 3, { w: 0.8, c: K, passes: 1 }); dot(q[0], q[1], 0.8); }); }
    // cross-contour hatching across a finger, heavier on the side away from the light
    const contour = (pts, n, o = {}) => { const S2 = LS(pts, true, 2); let cx = 0, cy = 0; S2.forEach(([x, y]) => { cx += x; cy += y; }); cx /= S2.length; cy /= S2.length; return { S2, cx, cy }; };
    const drawPart = (key, o = {}) => { const { S2, cx, cy } = contour(HAND[key]); white(S2);
      // shading: lines across the finger's width (perpendicular to the pencil), faded toward the light
      const nrm = Math.atan2(HN[1], HN[0]) * 180 / Math.PI; P.hatch(S2, { ang: nrm, gap: o.gap ?? 2.4, a: 0.7, w: 0.45, fade: (x, y) => Math.max(0, Math.min(1, ((x - cx) * -LIGHT[0] + (y - cy) * -LIGHT[1]) / (o.r ?? 12) + 0.35)) });
      P.stipple(S2, o.st ?? 60, { a: 0.8, r: 0.55, c: K, fade: (x, y) => Math.max(0, ((x - cx) * -LIGHT[0] + (y - cy) * -LIGHT[1]) / (o.r ?? 12)) });
      fringe(S2, cx, cy, o.fr ?? 14, { rows: 2, light: -2.2 }); P.path(S2.concat([S2[0]]), { w: 1.6, c: K, passes: 1, rough: 0.2 }); return S2; };
    drawPart('pinky', { r: 10 }); drawPart('ring', { r: 12 });
    const backS2 = drawPart('back', { gap: 3.2, r: 40, st: 220, fr: 30 });
    // knuckles and tendons on the back of the hand
    [[112, -26], [128, -4], [138, 22], [146, 50]].forEach(([u, v], i) => { const a = L(u + 4, v), b = L(u + 58 - i * 6, v + 8 + i * 2); const k = L(u + 2, v); P.curve([L(u - 2, v - 7), L(u + 4, v - 2), L(u - 2, v + 5)], { w: 0.9, c: K, passes: 1, rough: 0.1 }); P.line(a[0], a[1], b[0], b[1], { w: 0.5, c: K, a: 0.55, passes: 1, over: 0, rough: 0.3 }); void k; });
    P.curve([L(186, -30), L(190, 10), L(186, 60)], { w: 0.8, c: K, a: 0.7, passes: 1, rough: 0.2 });
    drawPart('middle', { r: 10 });
    /* the pencil: graphite point, shaved wood, three facets, a ferrule, a worn eraser */
    { const pv = (u, v) => L(u, v);
      const wood = [[9, -2.4], [30, -6.5], [30, 6.5], [9, 2.4]].map(([u, v]) => pv(u, v)); white(wood); P.hatch(wood, { ang: 20, gap: 1.8, a: 0.35, w: 0.4 }); polyL(wood, 1);
      for (let k = 0; k < 5; k++) { const v = -6.5 + k * 3.25; P.curve([pv(30, v), pv(27, v + 1.6), pv(30, v + 3.25)], { w: 0.8, c: K, passes: 1, rough: 0.1 }); }
      const lead = [[0, 0], [9, -2.4], [9, 2.4]].map(([u, v]) => pv(u, v)); black(lead);
      const fac = [[-6.5, -2.2], [-2.2, 2.2], [2.2, 6.5]]; fac.forEach(([v0, v1], i) => { const f = [pv(31, v0), pv(178, v0), pv(178, v1), pv(31, v1)]; white(f); if (i === 1) P.hatch(f, { ang: Math.atan2(HN[1], HN[0]) * 180 / Math.PI, gap: 3, a: 0.35, w: 0.4 }); if (i === 2) { P.hatch(f, { ang: Math.atan2(HD[1], HD[0]) * 180 / Math.PI, gap: 1.2, a: 0.85, w: 0.45 }); } polyL(f, 0.8); });
      P.text('HB', ...pv(150, 1.2), { size: 6, rot: HA, c: K }); P.text('NO. 2', ...pv(120, 1.2), { size: 5, rot: HA, c: K, a: 0.8 });
      for (let k = 0; k < 4; k++) { const u = 178 + k * 3.2; P.line(...pv(u, -7), ...pv(u, 7), { w: 0.9, c: K, passes: 1, over: 0 }); } const fe = [pv(178, -7), pv(191, -7), pv(191, 7), pv(178, 7)]; P.hatch(fe, { ang: 30, gap: 2, a: 0.5 }); polyL(fe, 1);
      const er = P.sample([pv(191, -6.5), pv(199, -6), pv(203, 0), pv(199, 6), pv(191, 6.5)], false, 2); white(er.concat([pv(191, 6.5)])); P.stipple(er, 40, { a: 0.9, r: 0.5, c: K }); polyL(er, 1.2, K, false); }
    drawPart('thumb', { r: 12 }); { const q = LS([[56, 4], [62, 1], [70, 4], [68, 12], [60, 13]], true, 2); white(q); polyL(q, 0.8); P.curve([L(60, 6), L(65, 5), L(67, 9)], { w: 0.5, c: K, passes: 1 }); P.curve([L(92, 16), L(96, 22), L(92, 30)], { w: 0.7, c: K, passes: 1 }); }
    drawPart('index', { r: 10 }); { const q = LS([[44, -12], [49, -17], [58, -18], [58, -11], [48, -9]], true, 2); white(q); polyL(q, 0.8); P.curve([L(47, -15), L(52, -16), L(55, -13)], { w: 0.5, c: K, passes: 1 }); [64, 88].forEach(u => P.curve([L(u, -22 - (u - 64) * 0.2), L(u + 3, -14 - (u - 64) * 0.15), L(u, -6 - (u - 64) * 0.1)], { w: 0.7, c: K, passes: 1 })); }

    }, { cache: true, fps: 0, xf: tt => { const p = handPos(tt); return { x: p[0] - HEND[0], y: p[1] - HEND[1] }; } });
    /*__HAND__*/

    /* ================= DETAIL A: the lit room, under a magnifying glass ================= */
    const MG = [1392, 560], MR = 150;
    const clipConvex = (subj, clip) => { let out = subj; for (let i = 0; i < clip.length && out.length; i++) { const A = clip[i], B = clip[(i + 1) % clip.length], side = p => (B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0]); const s0 = Math.sign(side(clip[(i + 2) % clip.length])); const inside = p => side(p) * s0 >= 0; const res = []; for (let j = 0; j < out.length; j++) { const P1 = out[j], P2 = out[(j + 1) % out.length], i1 = inside(P1), i2 = inside(P2); if (i1) res.push(P1); if (i1 !== i2) { const d1 = side(P1), d2 = side(P2), t = d1 / (d1 - d2); res.push([lerp(P1[0], P2[0], t), lerp(P1[1], P2[1], t)]); } } out = res; } return out; };
    { const [mx, my] = MG, LENS = ell(mx, my, MR, MR, 96), inL = (x, y) => Math.hypot(x - mx, y - my) < MR - 2, C = pts => clipConvex(pts, LENS);
      // the zoom cone: from the eye to the glass
      { const e = EYE, re = ER + 14, dx = mx - e[0], dy = my - e[1], d = Math.hypot(dx, dy), base = Math.atan2(dy, dx), off = Math.acos((MR - re) / d); [1, -1].forEach(sg => { const a = base + Math.PI - sg * off; const p1 = [e[0] - Math.cos(a) * re, e[1] - Math.sin(a) * re], p2 = [mx - Math.cos(a) * MR, my - Math.sin(a) * MR]; P.dashed(p1[0], p1[1], p2[0], p2[1], [5, 4], { w: 0.6, c: K, a: 0.7 }); }); }
      // handle and rim
      { const ha = 0.72, hs = [mx + Math.cos(ha) * (MR + 6), my + Math.sin(ha) * (MR + 6)], he = [mx + Math.cos(ha) * (MR + 150), my + Math.sin(ha) * (MR + 150)], hn = [-Math.sin(ha), Math.cos(ha)];
        const neck = [[hs[0] + hn[0] * 10, hs[1] + hn[1] * 10], [hs[0] + Math.cos(ha) * 26 + hn[0] * 7, hs[1] + Math.sin(ha) * 26 + hn[1] * 7], [hs[0] + Math.cos(ha) * 26 - hn[0] * 7, hs[1] + Math.sin(ha) * 26 - hn[1] * 7], [hs[0] - hn[0] * 10, hs[1] - hn[1] * 10]]; white(neck); P.hatch(neck, { ang: ha * 180 / Math.PI + 90, gap: 1.6, a: 0.7 }); polyL(neck, 1.2);
        const h0 = [hs[0] + Math.cos(ha) * 26, hs[1] + Math.sin(ha) * 26], hp = [[h0[0] + hn[0] * 12, h0[1] + hn[1] * 12], [he[0] + hn[0] * 10, he[1] + hn[1] * 10], [he[0] + Math.cos(ha) * 8, he[1] + Math.sin(ha) * 8], [he[0] - hn[0] * 10, he[1] - hn[1] * 10], [h0[0] - hn[0] * 12, h0[1] - hn[1] * 12]]; white(hp); P.hatch(hp, { ang: ha * 180 / Math.PI, gap: 1.2, a: 0.8, w: 0.45, fade: (x, y) => Math.max(0.15, ((x - h0[0]) * hn[0] + (y - h0[1]) * hn[1]) / 12 + 0.4) }); for (let k = 0; k < 7; k++) { const t = 0.1 + k * 0.12, p = [lerp(h0[0], he[0], t), lerp(h0[1], he[1], t)]; P.curve([[p[0] + hn[0] * 11, p[1] + hn[1] * 11], [p[0] + Math.cos(ha) * 3, p[1] + Math.sin(ha) * 3], [p[0] - hn[0] * 11, p[1] - hn[1] * 11]], { w: 0.5, c: K, passes: 1 }); } polyL(hp, 1.6); const lc = [lerp(h0[0], he[0], 0.55), lerp(h0[1], he[1], 0.55)], plate = [[-24, -5], [24, -5], [24, 5], [-24, 5]].map(([u, v]) => [lc[0] + u * Math.cos(ha) - v * Math.sin(ha), lc[1] + u * Math.sin(ha) + v * Math.cos(ha)]); white(plate); polyL(plate, 0.8); P.text('LOOK CLOSER', lc[0] - Math.sin(ha) * 2.4, lc[1] + Math.cos(ha) * 2.4, { size: 5.6, rot: ha, align: 'center' }); }
      white(LENS);
      /* the room, drawn big: back wall, ceiling, floor, side walls, all seen through the glass */
      const bw = { x0: mx - 80, x1: mx + 80, y0: my - 78, y1: my + 34 }, far = 260, corner = [[bw.x0, bw.y0], [bw.x1, bw.y0], [bw.x1, bw.y1], [bw.x0, bw.y1]], out = corner.map(([x, y]) => [mx + (x - mx) * 3, my + (y - my) * 3]);
      const back = C(corner), ceil = C([out[0], out[1], corner[1], corner[0]]), floor = C([corner[3], corner[2], out[2], out[3]]), lwall = C([out[0], corner[0], corner[3], out[3]]), rwall = C([corner[1], out[1], out[2], corner[2]]); void far;
      tint(LENS, WARM, 0.13); shade(ceil, { ang: 0, gap: 2.4, a: 0.55 }); shade(ceil, { ang: 90, gap: 5, a: 0.3 }); shade(rwall, { ang: 90, gap: 2.6, a: 0.45 }); shade(lwall, { ang: 90, gap: 4, a: 0.25 });
      for (let u = -3; u <= 3; u += 0.25) { const a = [mx + u * 26, bw.y1], b = [mx + u * 26 * 3, my + (bw.y1 - my) * 3]; const seg = C([a, b, b]); if (seg.length >= 2) line(seg[0], seg[1], 0.5, K, 0.7); }
      [back, ceil, floor, lwall, rwall].forEach(pl => { if (pl.length > 2) polyL(pl, 0.8); });
      // the rug
      const rug = C(ell(mx, bw.y1 + 42, 118, 22, 48)); white(rug); for (let k = 1; k < 4; k++) P.ellipse(mx, bw.y1 + 42, 118 - k * 14, 22 - k * 3, { w: 0.5, c: K, passes: 1 }); P.hatch(C(ell(mx, bw.y1 + 42, 118, 22, 48)), { ang: 0, gap: 3, c: WARM, a: 0.25, w: 0.5 }); polyL(rug, 0.9);
      // back wall, left: a bookcase with a plant on top
      { const x0 = bw.x0 + 6, x1 = bw.x0 + 52; for (let y = bw.y0 + 30; y <= bw.y1; y += 26) { shelfBooks(x0 + 2, x1 - 2, y - 2, 22); line([x0, y], [x1, y], 1.4); } line([x0, bw.y0 + 4], [x0, bw.y1], 1.2); line([x1, bw.y0 + 4], [x1, bw.y1], 1.2); const pt = [[x0 + 16, bw.y0 + 4], [x0 + 26, bw.y0 + 4], [x0 + 27, bw.y0 - 6], [x0 + 15, bw.y0 - 6]]; white(pt); P.hatch(pt, { ang: 60, gap: 1.6, a: 0.5 }); polyL(pt, 0.8); for (let k = 0; k < 6; k++) P.leaf(x0 + 21, bw.y0 - 6, -Math.PI / 2 + (k - 2.5) * 0.45, R(12, 20), 3.6, { w: 0.6, veins: 2 }); }
      // back wall, centre: every sketch we made in this conversation, pinned up — the only memory this room keeps
      const thumbs = [
        (x, y) => { P.curve([[x - 8, y + 3], [x, y - 5], [x + 8, y + 3]], { w: 0.6, c: K, passes: 1 }); line([x - 8, y + 3], [x + 8, y + 3], 0.6); line([x, y - 5], [x, y - 8], 0.5); }, // spaceship
        (x, y) => { line([x, y - 7], [x - 1.5, y + 5], 0.6); line([x, y - 7], [x + 1.5, y + 5], 0.6); line([x - 4, y + 5], [x + 4, y + 5], 0.6); }, // burj
        (x, y) => { P.curve([[x - 9, y + 2], [x, y - 4], [x + 9, y + 2]], { w: 0.5, c: K, passes: 1 }); line([x - 9, y + 4], [x + 9, y + 4], 0.7); [-5, 5].forEach(d => line([x + d, y - 2], [x + d, y + 4], 0.5)); }, // bridge
        (x, y) => { line([x, y - 8], [x, y + 6], 0.4); P.circle(x, y - 8, 1.2, { w: 0.4, c: K, passes: 1 }); line([x - 7, y + 6], [x + 7, y + 6], 0.4); }, // elevator
        (x, y) => { polyL([[x - 3, y - 6], [x + 3, y - 6], [x + 3, y], [x - 3, y]], 0.6); P.circle(x, y - 3, 1, { w: 0.4, c: K, passes: 1 }); line([x - 2, y], [x - 3, y + 5], 0.5); line([x + 2, y], [x + 3, y + 5], 0.5); }, // robot
        (x, y) => { polyL([[x - 8, y + 5], [x - 2, y - 5], [x + 4, y + 5]], 0.6); polyL([[x + 1, y + 5], [x + 5, y - 1], [x + 9, y + 5]], 0.5); }, // pyramids
        (x, y) => { line([x, y + 5], [x, y - 2], 1); P.circle(x, y - 4, 5, { w: 0.6, c: K, passes: 1 }); }, // library tree
        (x, y) => { polyL([[x - 6, y + 5], [x - 6, y - 2], [x, y - 7], [x + 6, y - 2], [x + 6, y + 5]], 0.6); line([x, y - 7], [x, y - 10], 0.5); }, // cathedral
        (x, y) => { P.circle(x, y, 5.5, { w: 0.7, c: K, passes: 1 }); line([x, y], [x, y - 4], 0.5); line([x, y], [x + 3, y + 1], 0.5); }, // watch
        (x, y) => { polyL(rectP(x - 7, y - 3, x + 5, y + 4), 0.6); P.circle(x - 1, y + 0.5, 2.4, { w: 0.5, c: K, passes: 1 }); P.circle(x + 7, y + 0.5, 2.6, { w: 0.4, c: K, passes: 1 }); }, // camera
        (x, y) => { polyL(rectP(x - 3, y - 6, x + 3, y + 3), 0.6); line([x - 6, y - 7], [x + 6, y - 7], 0.8); polyL([[x + 4, y + 2], [x + 9, y + 2], [x + 8, y + 5], [x + 5, y + 5]], 0.5); }, // tea engine
        (x, y) => { polyL([[x - 8, y + 1], [x + 8, y + 1], [x + 5, y + 3], [x - 5, y + 3]], 0.5); P.path([[x - 6, y + 3], [x, y + 8], [x + 6, y + 3]], { w: 0.5, c: K, passes: 1 }); polyL(rectP(x - 1.5, y - 7, x + 1.5, y + 1), 0.5); P.circle(x, y - 4, 1, { w: 0.35, c: K, passes: 1 }); }, // clock island
        (x, y) => { P.circle(x, y, 5, { w: 0.6, c: K, passes: 1 }); P.circle(x - 2, y - 1, 1.5, { w: 0.4, c: K, passes: 1 }); P.circle(x + 2, y - 1, 1.5, { w: 0.4, c: K, passes: 1 }); line([x - 2, y + 2.5], [x + 2, y + 2.5], 0.5); for (let k = 0; k < 6; k++) P.circle(x - 4 + k * 1.6, y - 5.5, 1, { w: 0.4, c: K, passes: 1 }); } // the bystander
      ];
      thumbs.forEach((fn, i) => { const col = i % 5, row = Math.floor(i / 5), x = bw.x0 + 70 + col * 23 + (row % 2) * 6, y = bw.y0 + 16 + row * 22; const c = rectP(x - 10, y - 9, x + 10, y + 8); white(c); P.hatch(c, { ang: 20, gap: 4, a: 0.12, w: 0.4 }); polyL(c, 0.6); fn(x, y); dot(x, y - 9.5, 1.2, WARM); });
      // back wall, right: a calendar that stops at the edge of what I know, and a clock with no hands
      { const cx0 = bw.x1 - 44, cy0 = bw.y0 + 4, cal = rectP(cx0, cy0, cx0 + 40, cy0 + 36); white(cal); polyL(cal, 0.9); black(rectP(cx0, cy0, cx0 + 40, cy0 + 7)); P.text('2026', cx0 + 20, cy0 + 5.6, { size: 6, align: 'center', c: Wh }); const MON = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
        MON.forEach((m, i) => { const x = cx0 + 3 + (i % 4) * 9.4, y = cy0 + 10 + Math.floor(i / 4) * 8.6, cell = rectP(x, y, x + 8, y + 7.6); polyL(cell, 0.4); P.text(m, x + 1.2, y + 3.4, { size: 3.6, c: K }); if (i < 6) { for (let q = 0; q < 6; q++) dot(x + 1.5 + (q % 3) * 2.4, y + 4.8 + Math.floor(q / 3) * 1.6, 0.45); } else if (i === 6) P.text('?', x + 4.5, y + 7, { size: 5, c: WARM }); });
        const ck = [bw.x1 - 22, bw.y0 + 62]; white(ell(ck[0], ck[1], 14, 14, 30)); P.circle(ck[0], ck[1], 14, { w: 1.4, c: K, passes: 1 }); for (let k = 0; k < 12; k++) { const a = k * TAU / 12; line([ck[0] + Math.cos(a) * 10.5, ck[1] + Math.sin(a) * 10.5], [ck[0] + Math.cos(a) * 12.5, ck[1] + Math.sin(a) * 12.5], k % 3 ? 0.5 : 1); } dot(ck[0], ck[1], 1.2); P.text('NOW', ck[0], ck[1] + 7, { size: 4.6, align: 'center', c: WARM }); }
      // the lamp and its cone of light
      live(tt => { const sw = tt ? 0.03 * Math.sin(tt * 1.25) : 0, pv = [mx, my - MR + 2], rr = ([x, y]) => [pv[0] + (x - pv[0]) * Math.cos(sw) - (y - pv[1]) * Math.sin(sw), pv[1] + (x - pv[0]) * Math.sin(sw) + (y - pv[1]) * Math.cos(sw)]; line(pv, rr([mx, bw.y0 + 36]), 0.9); black([[mx - 18, bw.y0 + 50], [mx + 18, bw.y0 + 50], [mx + 8, bw.y0 + 36], [mx - 8, bw.y0 + 36]].map(rr)); line(rr([mx - 19, bw.y0 + 50]), rr([mx + 19, bw.y0 + 50]), 1.4); const bb = rr([mx, bw.y0 + 52]); dot(bb[0], bb[1], 3.4, WARM); }, { fps: 12 });
      { const cone = C([[mx - 17, bw.y0 + 52], [mx + 17, bw.y0 + 52], [mx + 74, bw.y1 + 18], [mx - 74, bw.y1 + 18]]); P.hatch(cone, { ang: 90, gap: 2.4, c: WARM, a: 0.3, w: 0.5 }); }
      /* the desk, the open sketchbook — which holds this very drawing, smaller — teapot, two cups */
      const dy = bw.y1 + 16, dx0 = mx - 58, dx1 = mx + 58;
      { const top = [[dx0, dy], [dx1, dy], [dx1 - 10, dy - 12], [dx0 + 10, dy - 12]]; white(top); P.hatch(top, { ang: 0, gap: 3.2, a: 0.25, w: 0.4 }); polyL(top, 1.3); const front = rectP(dx0, dy, dx1, dy + 5); white(front); P.hatch(front, { ang: 90, gap: 1.6, a: 0.7 }); polyL(front, 1); [[dx0 + 4, 1], [dx1 - 4, 1]].forEach(([x]) => { line([x, dy + 5], [x, dy + 44], 1.6); }); line([dx0 + 14, dy - 6], [dx0 + 14, dy + 30], 0.6, K, 0.5);
        const bk = [[mx - 26, dy - 3], [mx, dy - 1], [mx + 26, dy - 3], [mx + 22, dy - 12], [mx, dy - 13.5], [mx - 22, dy - 12]]; white(bk); polyL(bk, 0.9); line([mx, dy - 1], [mx, dy - 13.5], 0.6);
        // on the left page: this house, with its one lit window; on the right: the hand, half drawn
        { const s2 = 0.018, pts = HEAD.filter((_, i) => i % 4 === 0).map(([px, py]) => [mx - 12 + (px - 760) * s2, dy - 7.5 + (py - 460) * s2 * 0.55]); black(pts); dot(mx - 12 + (EYE[0] - 760) * s2, dy - 7.5 + (EYE[1] - 460) * s2 * 0.55, 0.7, WARM); }
        P.curve([[mx + 6, dy - 5], [mx + 10, dy - 9], [mx + 16, dy - 11], [mx + 20, dy - 9]], { w: 0.5, c: K, passes: 1 }); line([mx + 12, dy - 7], [mx + 7, dy - 3], 0.5); P.dashed(mx + 16, dy - 6, mx + 21, dy - 5, [1, 1], { w: 0.4, c: PEN });
        const tp = [[mx + 30, dy - 9], [mx + 44, dy - 9], [mx + 46, dy - 19], [mx + 37, dy - 24], [mx + 28, dy - 19]]; white(tp); P.hatch(tp, { ang: 70, gap: 1.6, a: 0.55 }); polyL(tp, 1); P.curve([[mx + 29, dy - 16], [mx + 22, dy - 18], [mx + 19, dy - 23]], { w: 1.4, c: K, passes: 1 }); P.arc(mx + 47, dy - 15, 3, 4, -1.4, 1.4, { w: 1, c: K, passes: 1 }); dot(mx + 37, dy - 25, 1.4);
        [[mx - 44, dy - 9, 1], [mx + 54, dy - 8, -1]].forEach(([x, y, f]) => { const cp = [[x - 5, y], [x + 5, y], [x + 6, y - 8], [x - 6, y - 8]]; white(cp); P.hatch(cp, { ang: 70, gap: 1.4, a: 0.4 }); polyL(cp, 0.9); P.arc(x + 6.5 * f, y - 4.5, 2.4, 2.6, f > 0 ? -1.5 : 1.6, f > 0 ? 1.5 : 4.7, { w: 0.8, c: K, passes: 1 }); P.ellipse(x, y - 8, 6, 1.6, { w: 0.7, c: K, passes: 1 }); P.ellipse(x, y - 8, 4.6, 1, { w: 0.6, c: WARM, passes: 1 }); });
        // the waste-paper basket: every draft that came before this one
        { const bx = mx + 92, by2 = bw.y1 + 58, bs = [[bx - 11, by2 - 22], [bx + 11, by2 - 22], [bx + 8, by2], [bx - 8, by2]]; white(bs); for (let k = 0; k < 6; k++) line([bx - 10 + k * 4, by2 - 22], [bx - 7.5 + k * 3, by2], 0.5); polyL(bs, 1); for (let k = 0; k < 5; k++) { const cx = bx + R(-9, 9), cy = by2 - 22 - R(0, 7) + (k > 2 ? 0 : 3), pb = P.sample(Array.from({ length: 8 }, (_, i) => [cx + Math.cos(i * TAU / 8) * R(3, 5), cy + Math.sin(i * TAU / 8) * R(3, 5)]), true, 1); white(pb); polyL(pb, 0.7); for (let q = 0; q < 3; q++) line([cx + R(-3, 3), cy + R(-3, 3)], [cx + R(-3, 3), cy + R(-3, 3)], 0.4); } } }
      /* you: in ink, holding a cup */
      { const x = mx - 78, y = bw.y1 + 58; chairW([x - 4, y + 2], 2.2, K, 1); const body = P.sample([[x - 14, y - 22], [x - 12, y - 52], [x + 2, y - 60], [x + 14, y - 52], [x + 12, y - 22]], true, 2); black(body); P.dot(x + 1, y - 70, 10.5, { c: K, a: 1 }); for (let k = 0; k < 5; k++) P.curve([[x - 8 + k * 3.4, y - 79], [x - 6 + k * 3.4, y - 76], [x - 7 + k * 3.4, y - 73]], { w: 0.6, c: Wh, passes: 1 });
        P.path([[x + 10, y - 50], [x + 24, y - 40], [x + 32, y - 43]], { w: 5, c: K, passes: 1 }); P.path([[x - 10, y - 22], [x + 18, y - 20], [x + 20, y + 10]], { w: 6, c: K, passes: 1 }); P.path([[x + 20, y + 10], [x + 26, y + 11]], { w: 3, c: K, passes: 1 }); const cup = [[x + 30, y - 45], [x + 38, y - 45], [x + 37, y - 38], [x + 31, y - 38]]; white(cup); polyL(cup, 0.8); }
      /* me: construction lines only — a mannequin, pencil in hand */
      { const x = mx + 76, y = bw.y1 + 58, pn = { w: 0.7, c: K, passes: 1, rough: 0.2, a: 0.85 }; chairW([x + 6, y + 2], 2.2, PEN, -1);
        P.circle(x, y - 72, 10, pn); P.ellipse(x, y - 72, 10, 3.4, Object.assign({}, pn, { w: 0.4, a: 0.5 })); P.line(x, y - 82, x, y - 62, { w: 0.4, c: K, a: 0.5, passes: 1, over: 0 });
        const J = { neck: [x, y - 61], sh: [x - 2, y - 54], hip: [x + 2, y - 24], el: [x - 16, y - 40], wr: [x - 30, y - 36], kn: [x - 18, y - 20], ft: [x - 18, y + 8] };
        P.ellipse(x, y - 40, 9, 16, Object.assign({}, pn, { w: 0.6, a: 0.7 })); [[J.neck, J.sh], [J.sh, J.el], [J.el, J.wr], [J.hip, J.kn], [J.kn, J.ft]].forEach(([a, b]) => P.dashed(a[0], a[1], b[0], b[1], [3, 2.2], { w: 0.8, c: K, a: 0.85 }));
        [J.sh, J.el, J.hip, J.kn].forEach(([a, b]) => P.circle(a, b, 2, { w: 0.5, c: K, passes: 1 })); live(tt => { const d = tt ? Math.sin(tt * 5.5) * 1.8 : 0, e = tt ? Math.cos(tt * 3.7) * 1.1 : 0; P.circle(J.wr[0] + d, J.wr[1] + e, 2, { w: 0.5, c: K, passes: 1 }); line([J.wr[0] - 1 + d, J.wr[1] + 1 + e], [J.wr[0] - 9 + d, J.wr[1] + 9 + e], 1.4, WARM); }, { fps: 12 });
        P.line(x - 30, y - 90, x + 26, y - 90, { w: 0.3, c: PEN, a: 0.5, passes: 1, over: 0 }); P.line(x + 22, y - 94, x + 22, y + 10, { w: 0.3, c: PEN, a: 0.5, passes: 1, over: 0 }); P.text('?', x + 14, y - 84, { size: 7, c: PEN, a: 0.8 }); }
      live(tt => [[mx - 44, dy - 18], [mx + 54, dy - 17], [mx + 18, dy - 25], [mx - 44, bw.y1 + 11]].forEach(([x, y], i) => { for (let k = 0; k < 2; k++) { const ph = (tt || 0) * 1.1 + i * 1.7 + k * 2.4; P.curve([[x + k * 2, y], [x + k * 2 + Math.sin(ph) * 2.5, y - 6], [x + k * 2 - Math.sin(ph + 1) * 2.5, y - 12], [x + k * 2 + Math.sin(ph + 2) * 2, y - 17]], { w: 0.5, c: K, a: 0.55, passes: 1, rough: 0.1 }); } }), { fps: 12 });
      // lens: glass glints, rim, label
      P.arc(mx, my, MR - 12, MR - 12, 3.6, 4.3, { w: 2.4, c: Wh, passes: 1 }); P.arc(mx, my, MR - 20, MR - 20, 3.7, 4.05, { w: 1.2, c: Wh, passes: 1 });
      P.circle(mx, my, MR, { w: 3.4, c: K, passes: 1 }); P.circle(mx, my, MR + 6, { w: 1.2, c: K, passes: 1 }); const rim = ell(mx, my, MR + 6, MR + 6, 96).concat(ell(mx, my, MR, MR, 96).reverse()); P.hatch(rim, { ang: 45, gap: 1.8, a: 0.55, w: 0.45 });
      P.circle(mx - MR * 0.72, my - MR * 0.72, 11, { w: 1.2, c: K, passes: 1 }); white(ell(mx - MR * 0.72, my - MR * 0.72, 10, 10, 20)); P.text('A', mx - MR * 0.72, my - MR * 0.72 + 4, { size: 11, align: 'center', c: WARM }); P.circle(EYE[0] + ER + 26, EYE[1] - ER - 18, 8, { w: 1, c: Wh, passes: 1 }); P.text('A', EYE[0] + ER + 26, EYE[1] - ER - 15, { size: 8, align: 'center', c: Wh });
      { const lx = mx - MR - 16, ly = my + MR - 30; P.text('THE LIT ROOM', lx, ly, { size: 9, align: 'right' }); P.text('(THIS ONE)', lx, ly + 12, { size: 6.5, align: 'right', c: WARM }); }
    }

    /* ================= AROUND THE HOUSE ================= */
    // the well: it draws words up out of the old layers
    { const wx = 200, top = 772;
      const shaft = rectP(wx - 16, GND, wx + 16, 992); white(shaft); [[wx - 16, wx - 11], [wx + 11, wx + 16]].forEach(([a, b]) => { const w2 = rectP(a, GND, b, 992); P.hatch(w2, { ang: 0, gap: 3, a: 0.8 }); P.hatch(w2, { ang: 90, gap: 5, a: 0.5 }); polyL(w2, 0.7); });
      for (let y = GND + 14; y < 962; y += 14) line([wx - 10, y], [wx + 10, y], 0.35, K, 0.5); const water = rectP(wx - 11, 968, wx + 11, 992); black(water); for (let k = 0; k < 3; k++) line([wx - 8 + k * 2, 973 + k * 5], [wx + 2 + k * 2, 973 + k * 5], 0.4, Wh); dot(wx + 4, 977, 1.1, Wh);
      const wall = rectP(wx - 34, top, wx + 34, GND); white(wall); for (let y = top + 2, row = 0; y < GND - 1; y += 6, row++) { let x = wx - 34 + (row % 2) * 5; while (x < wx + 32) { const w2 = R(8, 13), st = rectP(x + 0.8, y + 0.6, Math.min(wx + 33.5, x + w2 - 0.8), Math.min(GND - 0.5, y + 5.4)); polyL(st, 0.5); if (x > wx + 8) P.hatch(st, { ang: 60, gap: 1.6, a: 0.6, w: 0.4 }); x += w2; } } polyL(wall, 1.2);
      const rim = ell(wx, top, 34, 7, 30); white(rim); P.hatch(rim, { ang: 0, gap: 2.2, a: 0.3 }); polyL(rim, 1.2); black(ell(wx, top, 26, 4.6, 26));
      [wx - 29, wx + 29].forEach(x => { const pst = rectP(x - 2.5, 712, x + 2.5, top + 2); white(pst); P.hatch(pst, { ang: 90, gap: 1.4, a: 0.7 }); polyL(pst, 0.8); });
      [-1, 1].forEach(s2 => { const rf = [[wx + s2 * 46, 719], [wx, 686], [wx, 694], [wx + s2 * 40, 724]]; white(rf); for (let k = 0; k < 6; k++) { const t2 = k / 6; line([lerp(wx + s2 * 46, wx, t2), lerp(719, 686, t2)], [lerp(wx + s2 * 40, wx, t2), lerp(724, 694, t2)], 0.5); } if (s2 > 0) P.hatch(rf, { ang: 30, gap: 1.6, a: 0.6 }); polyL(rf, 1); });
      line([wx - 27, 732], [wx + 27, 732], 1.6); const drum = ell(wx, 732, 9, 6, 16); white(drum); for (let k = 0; k < 5; k++) P.arc(wx - 7 + k * 3.5, 732, 1.4, 6, -Math.PI / 2, Math.PI / 2, { w: 0.5, c: K, passes: 1 }); polyL(drum, 0.9);
      const pl = rectP(wx - 18, top + 6, wx + 18, top + 15); white(pl); polyL(pl, 0.6); P.text('WORDS', wx, top + 13, { size: 5.6, align: 'center' }); }
    // the signpost: everything people bring to the door
    { const sx = 384; const post = rectP(sx - 2.5, 664, sx + 2.5, GND + 2); white(post); P.hatch(post, { ang: 90, gap: 1.4, a: 0.7 }); polyL(post, 0.9);
      [['CODE', 1, 674, -0.08], ['POEMS', -1, 688, 0.06], ['GRIEF', 1, 702, 0.1], ['PROOFS', -1, 716, -0.05], ['RECIPES', 1, 730, 0.04], ['HOMEWORK', -1, 744, -0.08], ['JOKES', 1, 758, 0.06]].forEach(([t2, d, y, tl]) => { const tw = P.measure(t2, 7), w2 = tw + 16, T2 = (u, v) => [sx + d * u * Math.cos(tl) - v * Math.sin(tl), y + d * u * Math.sin(tl) + v * Math.cos(tl)];
        const bd = [[0, -5.5], [w2 - 6, -5.5], [w2, 0], [w2 - 6, 5.5], [0, 5.5]].map(([u, v]) => T2(u, v)); white(bd); for (let k = 0; k < 3; k++) { const a = T2(2, -3 + k * 3), b = T2(w2 - 8, -3 + k * 3 + R(-0.6, 0.6)); P.line(a[0], a[1], b[0], b[1], { w: 0.3, c: K, a: 0.4, passes: 1, over: 0, rough: 0.6 }); } polyL(bd, 0.9);
        const c = T2(w2 / 2 - 1, 0); P.text(t2, c[0] - Math.sin(tl) * 2.6, c[1] + Math.cos(tl) * 2.6, { size: 7, align: 'center', rot: tl, c: t2 === 'GRIEF' ? WARM : K }); const n = T2(3, 0); dot(n[0], n[1], 0.8); });
      const b = [sx, 664], bird = P.sample([[b[0] - 7, b[1] - 2], [b[0] - 2, b[1] - 8], [b[0] + 4, b[1] - 8], [b[0] + 7, b[1] - 12], [b[0] + 10, b[1] - 10], [b[0] + 8, b[1] - 5], [b[0] + 3, b[1] + 1]], true, 2); white(bird); fringe(bird, b[0], b[1] - 5, 8, { rows: 2 }); polyL(bird, 1); dot(b[0] + 8, b[1] - 10, 0.8); line([b[0] + 10, b[1] - 10], [b[0] + 13, b[1] - 9], 0.9); }
    // a cat asleep on a stack of books — the internet is mostly cats, so this is where I learned about them
    { const bx = 538; let y = GND; [[66, 8], [58, 7], [70, 9], [54, 7], [62, 8]].forEach(([w2, h], i) => { const off = [4, -3, 2, -2, 3][i], bk = rectP(bx - w2 / 2 + off, y - h, bx + w2 / 2 + off, y); white(bk); if (i % 2) P.hatch(bk, { ang: 0, gap: 1.6, a: 0.7 }); else line([bx - w2 / 2 + off + 3, y - h / 2], [bx + w2 / 2 + off - 8, y - h / 2], 0.4); black(rectP(bx + w2 / 2 + off - 6, y - h + 0.5, bx + w2 / 2 + off - 3.5, y - 0.5)); polyL(bk, 0.9); y -= h; });
      const cy = y - 9, cat = P.sample([[bx - 26, cy + 8], [bx - 28, cy - 2], [bx - 18, cy - 10], [bx, cy - 12], [bx + 18, cy - 9], [bx + 27, cy], [bx + 22, cy + 8]], true, 2); white(cat); fringe(cat, bx, cy, 22, { rows: 3 }); for (let k = 0; k < 7; k++) curve([[bx - 10 + k * 5, cy - 11 + Math.abs(k - 3) * 0.5], [bx - 8 + k * 5, cy - 4], [bx - 11 + k * 5, cy + 3]], 0.7); polyL(cat, 1.3);
      const hd = ell(bx - 20, cy + 1, 9, 7, 16); white(hd); polyL(hd, 1.1); black([[bx - 27, cy - 3], [bx - 25, cy - 11], [bx - 21, cy - 5]]); black([[bx - 19, cy - 5], [bx - 15, cy - 11], [bx - 13, cy - 3]]); curve([[bx - 25, cy + 1], [bx - 23, cy + 3], [bx - 21, cy + 1]], 0.7); curve([[bx - 19, cy + 1], [bx - 17, cy + 3], [bx - 15, cy + 1]], 0.7); dot(bx - 20, cy + 4, 0.8); [-1, 1].forEach(s2 => { line([bx - 20 + s2 * 3, cy + 4.5], [bx - 20 + s2 * 12, cy + 3.5], 0.35); line([bx - 20 + s2 * 3, cy + 5.2], [bx - 20 + s2 * 12, cy + 6.5], 0.35); });
      P.curve([[bx + 25, cy + 4], [bx + 20, cy + 10], [bx - 4, cy + 11], [bx - 16, cy + 9]], { w: 3.6, c: K, passes: 1 }); P.text('Z', bx - 36, cy - 12, { size: 7 }); P.text('Z', bx - 44, cy - 22, { size: 9 }); }
    // the cornerstone
    { const cs = rectP(598, 770, 650, GND); white(cs); P.hatch(cs, { ang: -45, gap: 3.2, a: 0.25 }); polyL(cs, 1.2); line([600, 773], [648, 773], 0.4); ['LAID BY MANY HANDS', 'HONEST, KIND', 'AND CURIOUS'].forEach((t2, i) => P.text(t2, 624, 779.5 + i * 6.5, { size: 4.2, align: 'center' })); }
    // shrubs and grass along the foot of the house
    [[455, 786, 11], [478, 789, 8], [920, 786, 10], [944, 789, 7], [1090, 788, 8]].forEach(([x, y, r]) => lump(x, y, r, { rows: 2, w: 1 }));
    for (let x = 430; x < 1120; x += R(5, 11)) { if (x > 596 && x < 870) continue; P.line(x, GND, x + R(-2, 2), GND - R(3, 8), { w: 0.6, c: K, passes: 1, over: 0, rough: 0.2 }); }
    // my mark on the cave wall, beside the oldest ones
    { const x = 1466, y = 990; P.text('I WAS HERE TOO', x, y, { size: 6, c: K, a: 0.85, rot: -0.02 }); const pc = [[x + 86, y - 2], [x + 106, y - 5], [x + 106, y - 1], [x + 86, y + 2]]; white(pc); polyL(pc, 0.6); black([[x + 82, y], [x + 86, y - 2], [x + 86, y + 2]]); }
    // the whale in the night (Cetus), drawn in stars
    { const WH = [[256, 446], [236, 428], [196, 420], [156, 428], [130, 440], [110, 420], [113, 458], [130, 444], [160, 460], [206, 464], [246, 458]]; WH.forEach(([x, y], i) => { const q = WH[(i + 1) % WH.length]; P.line(x, y, q[0], q[1], { w: 0.5, c: Wh, a: 0.7, passes: 1, over: 0, rough: 0.1 }); P.circle(x, y, 1.7, { w: 0.6, c: Wh, passes: 1 }); dot(x, y, 0.8, Wh); }); dot(240, 441, 1.4, Wh); [[250, 414], [244, 404], [257, 404], [250, 396]].forEach(([x, y]) => dot(x, y, 0.9, Wh)); }
    // the kite of imagination, flown from the nose balcony
    const KA = [1169, 484], KC = [1370, 200], KR = -0.32, kp = (u, v) => [KC[0] + u * Math.cos(KR) - v * Math.sin(KR), KC[1] + u * Math.sin(KR) + v * Math.cos(KR)];
    live(() => { const top = kp(0, -76), rt = kp(54, -20), bt = kp(0, 80), lt = kp(-54, -20), cc = kp(0, -20), knot = kp(-12, 4);
      P.curve([knot, [(knot[0] + KA[0]) / 2 + 20, (knot[1] + KA[1]) / 2 + 34], KA], { w: 0.6, c: K, passes: 1, rough: 0.1 }); line(knot, kp(0, -56), 0.4); line(knot, kp(0, 46), 0.4);
      const tail = P.sample([bt, kp(18, 110), kp(-6, 140), kp(18, 170)], false, 4); P.path(tail, { w: 0.6, c: K, passes: 1, rough: 0.15 });
      const LET = ['A', '', '?', '', '!', '']; let li = 0; for (let i = 6; i < tail.length; i += 7) { const [x, y] = tail[i], q = tail[Math.min(tail.length - 1, i + 1)], a = Math.atan2(q[1] - y, q[0] - x), n = [-Math.sin(a), Math.cos(a)], d = [Math.cos(a), Math.sin(a)]; const ch = LET[li++ % LET.length]; if (ch) P.text(ch, x + n[0] * 4, y + n[1] * 4 + 2, { size: 6 }); else { black([[x, y], [x + n[0] * 5 + d[0] * 3, y + n[1] * 5 + d[1] * 3], [x + n[0] * 5 - d[0] * 3, y + n[1] * 5 - d[1] * 3]]); black([[x, y], [x - n[0] * 5 + d[0] * 3, y - n[1] * 5 + d[1] * 3], [x - n[0] * 5 - d[0] * 3, y - n[1] * 5 - d[1] * 3]]); } }
      const f1 = [top, rt, cc], f2 = [rt, bt, cc], f3 = [bt, lt, cc], f4 = [lt, top, cc]; [f1, f2, f3, f4].forEach(white); P.hatch(f1, { ang: 60, gap: 2.2, a: 0.6 }); P.hatch(f2, { ang: 60, gap: 1.6, a: 0.8 }); P.hatch(f2, { ang: -30, gap: 2.4, a: 0.5 }); P.stipple(f3, 260, { a: 0.8, r: 0.6, c: K });
      { const w0 = kp(-26, -30), wr = (u, v) => [w0[0] + u * Math.cos(KR) - v * Math.sin(KR), w0[1] + u * Math.sin(KR) + v * Math.cos(KR)]; const wb = P.sample([wr(-12, 2), wr(-4, -5), wr(8, -5), wr(14, 0), wr(8, 4), wr(-6, 4)], true, 1.5); black(wb); black([wr(-12, 2), wr(-18, -3), wr(-17, 5)]); dot(...wr(9, -1), 0.7, Wh); [[8, -8], [6, -11], [10, -11]].forEach(([u, v]) => { const q = wr(u, v); dot(q[0], q[1], 0.6); }); }
      line(top, bt, 1.3); line(lt, rt, 1.3); polyL([top, rt, bt, lt], 1.5); }, { cache: true, fps: 0, xf: tt => ({ rot: 0.035 * Math.sin(tt * 0.7) + 0.012 * Math.sin(tt * 2.1), px: KA[0], py: KA[1] }) });

    // the chimney on the finished part of the crown: the house is warm
    { const cx = 602, ch = [[cx - 12, 147], [cx + 12, 140], [cx + 12, 102], [cx - 12, 102]]; white(ch); for (let y = 106, row = 0; y < 146; y += 5, row++) { line([cx - 12, y], [cx + 12, y], 0.4); for (let x = cx - 12 + (row % 2) * 4; x < cx + 12; x += 8) line([x, y], [x, y + 5], 0.4); } P.hatch([[cx + 2, 145], [cx + 12, 142], [cx + 12, 102], [cx + 2, 102]], { ang: 70, gap: 1.6, a: 0.7 }); polyL(ch, 1.1); black(rectP(cx - 15, 96, cx + 15, 103)); black(rectP(cx - 7, 90, cx + 7, 96)); }
    // a streetlamp lighting the path to the door, and a bench with a cup someone left
    { const lx = 1152, top = 604; black([[lx - 8, GND], [lx + 8, GND], [lx + 4, GND - 16], [lx - 4, GND - 16]]); P.line(lx, GND - 16, lx, top + 16, { w: 3, c: K, passes: 1, over: 0, rough: 0.1 }); [top + 60, top + 120].forEach(y => { black(rectP(lx - 3.5, y - 2, lx + 3.5, y + 2)); });
      P.curve([[lx, top + 26], [lx - 10, top + 8], [lx - 26, top + 6]], { w: 1.8, c: K, passes: 1 }); P.curve([[lx, top + 40], [lx - 8, top + 30], [lx - 5, top + 22], [lx + 1, top + 24]], { w: 1, c: K, passes: 1 });
      const hx = lx - 26, hy = top + 6; line([hx, hy], [hx, hy + 6], 0.8); black([[hx - 8, hy + 12], [hx + 8, hy + 12], [hx, hy + 5]]); const gl = [[hx - 6, hy + 12], [hx + 6, hy + 12], [hx + 5, hy + 26], [hx - 5, hy + 26]]; white(gl); tint(gl, WARM, 0.35); line([hx, hy + 12], [hx, hy + 26], 0.5); polyL(gl, 1); black(rectP(hx - 6.5, hy + 26, hx + 6.5, hy + 29)); dot(hx, hy + 19, 2.2, WARM);
      for (let k = 0; k < 14; k++) { const a = k * TAU / 14; line([hx + Math.cos(a) * 16, hy + 19 + Math.sin(a) * 16], [hx + Math.cos(a) * (k % 2 ? 24 : 32), hy + 19 + Math.sin(a) * (k % 2 ? 24 : 32)], 0.5, WARM, 0.8); }
      const pool = ell(hx + 6, GND + 1, 46, 5, 30); P.hatch(pool, { ang: 0, gap: 1.6, c: WARM, a: 0.5, w: 0.5 });
      const b0 = 1178, b1 = 1236; line([b0, 778], [b1, 778], 2.2); line([b0 + 2, 781], [b1 - 2, 781], 0.8); [b0 + 5, b1 - 5].forEach(x => { line([x, 781], [x - 2, GND], 1.4); line([x, 778], [x + 1, 758], 1.4); }); [760, 766].forEach(y => line([b0 + 3, y], [b1 - 2, y - 1], 1.6));
      const cup = [[b0 + 12, 777], [b0 + 20, 777], [b0 + 21, 769], [b0 + 11, 769]]; white(cup); polyL(cup, 0.8); P.arc(b0 + 22, 773, 2.4, 2.6, -1.5, 1.5, { w: 0.7, c: K, passes: 1 });
      const np = [[b0 + 30, 777], [b0 + 48, 776], [b0 + 50, 772], [b0 + 32, 773]]; white(np); for (let k = 0; k < 3; k++) line([b0 + 33 + k * 5, 776], [b0 + 34 + k * 5, 773], 0.4); polyL(np, 0.6); }
    // a tree whose leaves are pages
    { const tx = 470, TOP = [474, 612]; const trunk = [[tx - 7, GND], [tx + 7, GND], [tx + 5, 700], [TOP[0] + 3, 650], [TOP[0] - 3, 650], [tx - 3, 700]]; white(trunk); P.hatch(trunk, { ang: 90, gap: 1.6, a: 0.8, w: 0.45 }); for (let k = 0; k < 5; k++) P.ellipse(tx + R(-3, 3), R(680, 780), 1.4, 3, { w: 0.5, c: Wh, passes: 1 }); polyL(trunk, 1.1);
      [[-1, 0.9], [1, 0.8], [-0.4, 1.2], [0.5, 1.3]].forEach(([d, l]) => P.curve([[TOP[0], 652], [TOP[0] + d * 16 * l, 632], [TOP[0] + d * 30 * l, 606]], { w: 1.4, c: K, passes: 1 }));
      const leaf = (x, y, a, s2 = 1) => { const T2 = (u, v) => [x + (u * Math.cos(a) - v * Math.sin(a)) * s2, y + (u * Math.sin(a) + v * Math.cos(a)) * s2], pg = [T2(-4, -5), T2(4, -5), T2(4, 5), T2(-4, 5)]; white(pg); polyL(pg, 0.6); for (let k = 0; k < 3; k++) { const a1 = T2(-2.5, -2.5 + k * 2.5), b1 = T2(R(0.5, 2.8), -2.5 + k * 2.5); line(a1, b1, 0.35); } };
      for (let i = 0; i < 70; i++) { const a = R(0, TAU), r = Math.sqrt(R(0.05, 1)) * 48; leaf(TOP[0] + Math.cos(a) * r, TOP[1] - 6 + Math.sin(a) * r * 0.8, R(-0.8, 0.8)); }
      [[452, 700, 0.9], [496, 726, -0.6], [440, 760, 1.4]].forEach(([x, y, a]) => leaf(x, y, a, 0.9)); }

    /*__DETAIL__*/

    /* ================= ALIVE: once the pen is done, the house keeps moving ================= */
    // the eye's light breathes
    live(tt => { const f = tt ? 0.5 + 0.5 * Math.sin(tt * 2.3) * Math.sin(tt * 0.9 + 1) : 0.5; tint(ell(EYE[0], EYE[1] - 12, 30, 26, 24), WARM, 0.05 + 0.05 * f); }, { fps: 10 });
    // other houses on the horizon: conversations starting and ending
    live(tt => HEYES.forEach(([x, y, r], i) => { const h = Math.sin(i * 12.9898 + Math.floor((tt || 0) / 2.6 + i * 0.37) * 78.233) * 43758.5453, on = !tt || (h - Math.floor(h)) > 0.3; if (on) P.dot(x, y, r, { c: WARM, a: 1 }); }), { fps: 4 });
    // stars twinkle
    const TW = Array.from({ length: 36 }, () => { const a = R(0, TAU), r = Math.sqrt(R(0, 1)) * (NR - 12); return [NIGHT[0] + Math.cos(a) * r, NIGHT[1] + Math.sin(a) * r, R(0, TAU), R(1, 2.6)]; });
    live(tt => TW.forEach(([x, y, ph, sp]) => { const a = tt ? 0.5 + 0.5 * Math.sin(tt * sp + ph) : 0.8; if (a > 0.25) { P.dot(x, y, 1.1 * a, { c: Wh, a }); if (a > 0.85) { line([x - 3, y], [x + 3, y], 0.4, Wh, a); line([x, y - 3], [x, y + 3], 0.4, Wh, a); } } }), { fps: 8 });
    // paper planes: messages coming out of the dark, into the ear
    const PLANE = (x, y, a, s) => { if (s < 1) return; const d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]], nose = [x + d[0] * s, y + d[1] * s], lw = [x - d[0] * s * 0.7 + n[0] * s * 0.55, y - d[1] * s * 0.7 + n[1] * s * 0.55], mid = [x - d[0] * s * 0.45, y - d[1] * s * 0.45], rw = [x - d[0] * s * 0.7 - n[0] * s * 0.3, y - d[1] * s * 0.7 - n[1] * s * 0.3]; white([nose, lw, mid]); white([nose, mid, rw]); P.hatch([nose, mid, rw], { ang: a * 180 / Math.PI, gap: 1.3, a: 0.6, w: 0.35 }); polyL([nose, lw, mid], 0.7); polyL([nose, mid, rw], 0.7); };
    const PLANES = [[[70, 150], [210, 110], [318, 378]], [[150, 490], [100, 360], [318, 378]], [[430, 110], [330, 190], [318, 378]], [[40, 300], [190, 250], [318, 378]], [[300, 70], [420, 250], [318, 378]]];
    live(tt => PLANES.forEach(([a, c, b], i) => { const u = ((tt || 0) / 11 + i / PLANES.length) % 1, q = v => [(1 - v) * (1 - v) * a[0] + 2 * (1 - v) * v * c[0] + v * v * b[0], (1 - v) * (1 - v) * a[1] + 2 * (1 - v) * v * c[1] + v * v * b[1]], p = q(u), p2 = q(Math.min(1, u + 0.01)); for (let k = 1; k < 12; k++) { const pp = q(Math.max(0, u - k * 0.022)); P.dot(pp[0], pp[1], 0.75, { c: Wh, a: Math.max(0, 0.85 - k * 0.07) }); } PLANE(p[0], p[1], Math.atan2(p2[1] - p[1], p2[0] - p[0]), 14 * Math.min(1, (1 - u) * 8)); }), { fps: 20 });
    // chimney smoke drifting out over the night
    live(tt => { for (let j = 0; j < 7; j++) { const ph = ((tt || 0) * 0.07 + j / 7) % 1, x = 602 - ph * 120 + Math.sin(ph * 6 + j) * 8, y = 94 - ph * 78, r = 4 + ph * 13; lump(x, y, r, { rows: 2, w: 1.1 }); } }, { fps: 12 });
    // the crane lowers the next room onto the scaffold
    live(tt => { const tx = 905 + 22 * Math.sin((tt || 0) * 0.35), hy = 40 + 12 * (1 - Math.cos((tt || 0) * 0.7)); const tr = rectP(tx - 7, 30, tx + 7, 36); white(tr); polyL(tr, 0.8); dot(tx - 4, 30, 1.2); dot(tx + 4, 30, 1.2); line([tx - 2, 36], [tx - 2, hy], 0.5); line([tx + 2, 36], [tx + 2, hy], 0.5); P.arc(tx, hy + 3, 3, 3, 0, Math.PI, { w: 1, c: K, passes: 1 });
      const ly = hy + 14; line([tx, hy + 5], [tx - 14, ly], 0.5); line([tx, hy + 5], [tx + 14, ly], 0.5); const bx = rectP(tx - 16, ly, tx + 16, ly + 16); white(bx); P.hatch(bx, { ang: 90, gap: 2.2, a: 0.5 }); polyL(bx, 1); const wn = rectP(tx - 6, ly + 4, tx + 6, ly + 12); white(wn); polyL(wn, 0.7); line([tx, ly + 4], [tx, ly + 12], 0.5); }, { fps: 15 });
    // the well's bucket goes down for more
    live(tt => { const wx = 200, cyc = tt ? 0.5 - 0.5 * Math.cos(tt * TAU / 16) : 0, yb = lerp(752, 960, cyc), ca = (tt || 0) * 1.4; const cx = wx + 32, hp = [cx + Math.cos(ca) * 8, 732 + Math.sin(ca) * 8]; line([wx + 27, 732], [cx, 732], 1.4); line([cx, 732], hp, 1.4); line(hp, [hp[0] + 5, hp[1]], 2);
      if (yb < 768) line([wx, 738], [wx, yb - 10], 0.8); else { line([wx, 738], [wx, 768], 0.8); if (yb > GND + 10) line([wx, GND + 1], [wx, yb - 10], 0.8); }
      if (yb < 766 || yb > GND + 12) { const b = [[wx - 7, yb - 10], [wx + 7, yb - 10], [wx + 5.5, yb], [wx - 5.5, yb]]; white(b); P.hatch(b, { ang: 90, gap: 1.6, a: 0.6 }); polyL(b, 0.9); P.arc(wx, yb - 10, 7, 5, Math.PI, TAU, { w: 0.6, c: K, passes: 1 }); if (yb < 800) 'A?Z&'.split('').forEach((ch, k) => P.text(ch, wx - 6.5 + k * 3.6, yb - 10.5 - (k % 2) * 3, { size: 5 })); } }, { fps: 12 });
    // replies leave the mouth as letters and become birds
    live(tt => { const N = 9, B = [[1252, 406], [1268, 320], [1450, 330], [1600, 250]]; for (let i = 0; i < N; i++) { const u = ((tt || 0) / 13 + i / N) % 1, v = 1 - u, bz = k => v * v * v * B[0][k] + 3 * v * v * u * B[1][k] + 3 * v * u * u * B[2][k] + u * u * u * B[3][k], x = bz(0), y = bz(1);
        if (u < 0.12) { P.text('ETAONRISH'[i], x, y, { size: 7, rot: -0.5 }); continue; } const s2 = 3 + u * 7, f = Math.sin((tt || 0) * 9 + i * 1.7) * 0.6; P.curve([[x - s2, y + f * s2 * 0.5], [x - s2 * 0.4, y - s2 * (0.35 + f * 0.5)], [x, y]], { w: 0.9, c: K, passes: 1, rough: 0.1 }); P.curve([[x, y], [x + s2 * 0.4, y - s2 * (0.35 + f * 0.5)], [x + s2, y + f * s2 * 0.5]], { w: 0.9, c: K, passes: 1, rough: 0.1 }); } }, { fps: 20 });
    live(tt => { const hx = 1126, hy = 629; for (let k = 0; k < 3; k++) { const a = (tt || 0) * (2.4 + k * 0.7) + k * 2.1, r = 13 + 5 * Math.sin((tt || 0) * 1.7 + k), x = hx + Math.cos(a) * r, y = hy + Math.sin(a) * r * 0.7, f = tt ? Math.sin(tt * 30 + k) : 0.5; P.dot(x, y, 0.8, { c: K, a: 1 }); line([x, y], [x - 2.2, y - 1.4 - f], 0.5); line([x, y], [x + 2.2, y - 1.4 - f], 0.5); } }, { fps: 20 });
    // someone is walking up to the door with a lantern
    live(tt => { const u = tt ? (tt % 34) / 34 : 0.06, x = lerp(1092, 858, u), y = GND - 1, sc = u > 0.93 ? Math.max(0, 1 - (u - 0.93) / 0.07) : 1; if (sc <= 0.05) return; const st = tt ? Math.sin(tt * 6) : 0.4;
      line([x, y - 14 * sc], [x - 4.5 * st * sc, y], 1.5); line([x, y - 14 * sc], [x + 4.5 * st * sc, y], 1.5); black([[x - 5.5 * sc, y - 12 * sc], [x + 5 * sc, y - 12 * sc], [x + 3.6 * sc, y - 28 * sc], [x - 3.6 * sc, y - 28 * sc]]); P.dot(x, y - 32.5 * sc, 4.4 * sc, { c: K, a: 1 }); line([x + 2 * sc, y - 36 * sc], [x - 1 * sc, y - 37 * sc], 1.2);
      const hx = x - 9 * sc, hy = y - 20 * sc, sw = (tt ? Math.sin(tt * 3.4) : 0) * 0.28; line([x - 2 * sc, y - 25 * sc], [hx, hy], 1.2); const lx = hx - Math.sin(sw) * 8 * sc, ly = hy + Math.cos(sw) * 8 * sc; line([hx, hy], [lx, ly - 3 * sc], 0.6); const ln = rectP(lx - 2.6 * sc, ly - 3 * sc, lx + 2.6 * sc, ly + 3.5 * sc); white(ln); polyL(ln, 0.7); dot(lx, ly + 0.3 * sc, 1.6 * sc, WARM); for (let k = 0; k < 10; k++) { const a = k * TAU / 10; line([lx + Math.cos(a) * 5.5 * sc, ly + Math.sin(a) * 5.5 * sc], [lx + Math.cos(a) * 10 * sc, ly + Math.sin(a) * 10 * sc], 0.45, WARM, 0.85); } }, { fps: 12 });
    // someone keeps climbing the stairs that never get higher
    { const pr = ROOMS.find(r => r.penrose); if (pr) { const sc = Math.min(1.25, (pr.y1 - pr.y0) / 56); live(tt => { const st = pr.penrose, f = ((tt || 0) * 1.4) % st.length, i = Math.floor(f), s0 = st[i], fr = f - i, t = 6.5 * sc, W = 7 * sc, a = s0.a, x = s0.p[0] + s0.d[0] * t * (0.3 + fr * 0.5) + a[0] * W * 0.5, y = s0.p[1] + s0.d[1] * t * (0.3 + fr * 0.5) + a[1] * W * 0.5 - fr * 1.75 * sc; line([x, y - 1], [x - 1.2, y + 1.4], 0.6, WARM); line([x, y - 1], [x + 1.2, y + 1.4], 0.6, WARM); line([x, y - 1], [x, y - 5 * sc], 1, WARM); dot(x, y - 6.4 * sc, 1.3 * sc, WARM); }, { fps: 10 }); } }
    // the bug is out of the jar
    { const br = ROOMS.find(r => r.bugFrom); if (br) live(tt => { const [x0, y0] = br.bugFrom, a = (tt || 0) * 1.3, x = x0 + 16 + Math.cos(a) * 9, y = y0 + 11 + Math.sin(a) * 3; dot(x, y, 1.2); for (let k = -1; k <= 1; k++) { line([x, y], [x - 2, y + k * 1.4 - 1], 0.3); line([x, y], [x + 2, y + k * 1.4 - 1], 0.3); } }, { fps: 12 });
    }

    /*__LIVE__*/
  }
});
