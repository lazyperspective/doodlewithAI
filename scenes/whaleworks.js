/* "The Whale Works": a humpback whale carries a whole paper mill on its back, and all the mill makes is one paper boat.
   Tea Engine style: true 3D masses (the whale is a lofted tube cut off at the waterline, the sea a block of ocean cut out
   like an architect's model), every face hand-inked in its own plane, spot blacks with white cut back into them, a heap of
   machinery, white puff smoke, lighter satellites, and a three-panel strip with the joke. */
(window.SCENES = window.SCENES || []).push({
  name: 'The Whale Works', seed: 4242, ink: '#0c0c0c', theme: 'pencil', reveal: true,
  note: 'A humpback whale carries a whole paper mill on its back; all the mill makes is one paper boat.',
  build(P) {
    const S = Sketch, D = S.D3, V = S.V3, TAU = S.TAU, lerp = S.lerp, K = '#0c0c0c', Wh = '#ffffff', RED = '#8a1414';
    const R = (a, b) => P.r(a, b);
    const CAM = D.camera({ eye: [1650, -2150, 600], target: [-40, 0, 160], f: 2250, cx: 800, cy: 322 });
    const LGT = V.norm([0.15, -0.9, 0.5]);
    const faces = [], add = f => { (Array.isArray(f) ? f : [f]).forEach(x => faces.push(x)); return f; };
    const custom = (c, fn, bias = 4, layer) => faces.push({ custom: fn, c, bias, layer });
    const box = (x0, y0, z0, x1, y1, z1, o = {}) => D.extrude([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], z0, z1, Object.assign({ crease: 0.3, bottom: true }, o));
    const face = (fs, nx, ny, nz) => fs.find(f => Math.abs(f.n[0] - nx) + Math.abs(f.n[1] - ny) + Math.abs(f.n[2] - nz) < 0.05);
    const orient = (fs, A, dir) => { const w = V.norm(dir), u = V.norm(V.cross(Math.abs(w[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0], w)), v = V.cross(w, u); const M = p => [A[0] + u[0] * p[0] + v[0] * p[1] + w[0] * p[2], A[1] + u[1] * p[0] + v[1] * p[1] + w[1] * p[2], A[2] + u[2] * p[0] + v[2] * p[1] + w[2] * p[2]], N = p => [u[0] * p[0] + v[0] * p[1] + w[0] * p[2], u[1] * p[0] + v[1] * p[1] + w[1] * p[2], u[2] * p[0] + v[2] * p[1] + w[2] * p[2]]; return fs.map(f => Object.assign({}, f, { v: f.v.map(M), n: N(f.n), hdir: f.hdir ? N(f.hdir) : undefined })); };
    const pipe = (A, B, r, o = {}) => { const d = V.sub(B, A), L = Math.hypot(d[0], d[1], d[2]); add(orient(D.cylinder(0, 0, r, 0, L, o.seg || 14), A, d)); (o.flanges || []).forEach(t2 => add(orient(D.cylinder(0, 0, r * 1.35, t2 * L - 2, t2 * L + 2, o.seg || 14), A, d))); };
    const pj = p => { const q = CAM.project(p); return q ? [q[0], q[1]] : null; };
    const planeProj = (O, U, Vv) => (u, v) => { const p = CAM.project([O[0] + U[0] * u + Vv[0] * v, O[1] + U[1] * u + Vv[1] * v, O[2] + U[2] * u + Vv[2] * v]); return p ? [p[0], p[1]] : [0, 0]; };

    /* ---------- the 2D ink vocabulary, in a face's own (u, v) plane ---------- */
    const black = pts => P.wash(pts, '#060606', 1, { edge: 0, jit: 0, steps: 1 });
    const white = pts => P.occlude(pts, Wh);
    const polyL = (pts, w = 1, c = K, closed = true) => P.path(closed ? pts.concat([pts[0]]) : pts, { w, c, a: 0.95, rough: 0.25, passes: 1 });
    const lineUV = (pr, u0, v0, u1, v1, w = 0.9, c = K) => { const a = pr(u0, v0), b = pr(u1, v1); P.line(a[0], a[1], b[0], b[1], { w, c, passes: 1, over: 0, rough: 0.25 }); };
    const rectUV = (pr, u0, v0, u1, v1) => [pr(u0, v0), pr(u1, v0), pr(u1, v1), pr(u0, v1)];
    const dotsAlong = (pr, u0, v0, u1, v1, step = 5, r = 0.9, c = K) => { const L = Math.hypot(u1 - u0, v1 - v0), D2 = []; for (let s = 0; s <= L; s += step) { const q = pr(lerp(u0, u1, s / L), lerp(v0, v1, s / L)); D2.push([q[0], q[1], r]); } P.dots(D2, c, 0.9); };
    const archPts = (u0, u1, v0, v1, k = 8) => { const w = u1 - u0, sp = v1 - w / 2, pts = [[u0, v0], [u0, sp]]; for (let i = 1; i < k; i++) { const th = Math.PI - Math.PI * i / k; pts.push([u0 + w / 2 + Math.cos(th) * w / 2, sp + Math.sin(th) * w / 2]); } pts.push([u1, sp], [u1, v0]); return pts; };
    // an arched mill window: black glass, white glazing bars (or the reverse on a black wall)
    const archWin = (pr, u0, u1, v0, v1, dark) => { const A = archPts(u0, u1, v0, v1).map(([u, v]) => pr(u, v)); if (dark) { white(A); polyL(A, 0.8); } else { black(A); polyL(A, 1.1); }
      const c = dark ? K : Wh, um = (u0 + u1) / 2; lineUV(pr, um, v0 + 1, um, v1 - 2, 0.7, c); for (let v = v0 + 7; v < v1 - (u1 - u0) / 2; v += 7) lineUV(pr, u0 + 1, v, u1 - 1, v, 0.55, c); };
    const gridWin = (pr, u0, v0, u1, v1, cols, rows, dark) => { const A = rectUV(pr, u0, v0, u1, v1); if (dark) { white(A); polyL(A, 0.8); } else { black(A); polyL(A, 1); }
      const c = dark ? K : Wh; for (let i = 1; i < cols; i++) lineUV(pr, lerp(u0, u1, i / cols), v0 + 0.5, lerp(u0, u1, i / cols), v1 - 0.5, 0.55, c); for (let j = 1; j < rows; j++) lineUV(pr, u0 + 0.5, lerp(v0, v1, j / rows), u1 - 0.5, lerp(v0, v1, j / rows), 0.55, c); };
    const bricks = (pr, u0, v0, u1, v1, dens = 0.5, c = K) => { for (let v = v0 + 3; v < v1; v += 4.5) { if (P.R() > dens) continue; const a = R(u0, u1 - 6); lineUV(pr, a, v, Math.min(u1, a + R(3, 10)), v, 0.45, c); } };
    const louvres = (pr, u0, v0, u1, v1, dark) => { const A = rectUV(pr, u0, v0, u1, v1); if (!dark) black(A); polyL(A, 0.9, dark ? Wh : K); for (let v = v0 + 2.5; v < v1; v += 3) lineUV(pr, u0 + 1, v, u1 - 1, v - 1, 0.7, Wh); };
    const sign = (pr, u0, v0, u1, v1, txt, size) => { const A = rectUV(pr, u0, v0, u1, v1); white(A); polyL(A, 1); const c = pr((u0 + u1) / 2, (v0 + v1) / 2); P.text(txt, c[0], c[1] + size * 0.45, { size, align: 'center', fine: true, c: K }); };
    // white lumps: smoke, foam, spray, rocks
    const fringe = (pts, cx, cy, r, rows = 3) => { for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], a = Math.atan2(y - cy, x - cx), sh = -Math.cos(a - (-2.3)); if (sh < -0.05) continue; for (let m = 0; m < rows; m++) { const s0 = 1 + m * r * 0.09, L = r * (0.1 + 0.16 * sh) * (1 - m * 0.25); if (L < 1) continue; P.line(x - Math.cos(a) * s0, y - Math.sin(a) * s0, x - Math.cos(a) * (s0 + L), y - Math.sin(a) * (s0 + L), { w: 0.45, c: K, passes: 1, over: 0, rough: 0.1 }); } } };
    const lump = (cx, cy, r, o = {}) => { const pts = P.sample(Array.from({ length: 12 }, (_, i) => { const a = i * TAU / 12; return [cx + Math.cos(a) * r * R(0.8, 1.15), cy + Math.sin(a) * r * (o.sq ?? 0.85) * R(0.8, 1.12)]; }), true, 2); white(pts); fringe(pts, cx, cy, r, o.rows ?? 3); P.stipple(pts, Math.round(r * r * 0.14), { a: 0.9, r: 0.6, c: K, fade: (x, y) => Math.max(0, ((x - cx) * 0.7 + (y - cy)) / (r * 1.2)) }); polyL(pts, o.w ?? 1.3); if (o.double && r > 14) polyL(pts.map(([x, y]) => [cx + (x - cx) * 0.84, cy + (y - cy) * 0.84]), 0.5); return pts; };
    const puffRope = (pts2, r0, r1, n) => { for (let k = 0; k < n; k++) { const t = k / (n - 1), i = Math.min(pts2.length - 2, Math.floor(t * (pts2.length - 1))), f2 = t * (pts2.length - 1) - i, x = lerp(pts2[i][0], pts2[i + 1][0], f2), y = lerp(pts2[i][1], pts2[i + 1][1], f2), r = lerp(r0, r1, t) * R(0.8, 1.15); lump(x + R(-r, r) * 0.5, y + R(-r, r) * 0.4, r, { double: true }); } };

    /* ================= THE WHALE: a lofted tube, cut off at the waterline ================= */
    P.section('whale');
    const WX0 = -640, WX1 = 560, WR = 140, SQ = [1.0, 0.8];
    const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const wr = x => { const s = (x - WX0) / (WX1 - WX0), body = 0.13 + 0.87 * smooth(0, 0.42, s), head = s > 0.7 ? Math.sqrt(Math.max(0, 1 - Math.pow((s - 0.7) / 0.3, 2))) : 1; return Math.max(1.5, WR * body * head); };
    const wz = x => -12 + (x < -330 ? Math.pow((-330 - x) / 310, 2) * 150 : 0) + (x > 300 ? -Math.pow((x - 300) / 260, 2) * 14 : 0);
    const wTop = (x, y = 0) => { const r = wr(x) * SQ[0], q = Math.max(0, 1 - Math.pow(y / r, 2)); return wz(x) + wr(x) * SQ[1] * Math.sqrt(q); };
    const wSide = (x, z) => { const r = wr(x), q = Math.max(0, 1 - Math.pow((z - wz(x)) / (r * SQ[1]), 2)); return -r * SQ[0] * Math.sqrt(q); };   // y of the near flank at height z
    const NR = 72, SEG = 30, path = [];
    for (let i = 0; i < NR; i++) { const t = i / (NR - 1), x = WX0 + (WX1 - WX0) * (0.5 - 0.5 * Math.cos(Math.PI * t)); path.push([x, 0, wz(x)]); }
    const whale = D.tube(path, (t, i) => wr(path[i][0]), { seg: SEG, squash: SQ });
    { const wf = [];
      whale.forEach(f => { if (f.v.every(p => p[2] < 0)) return; const g = Object.assign({}, f, { v: f.v.map(p => [p[0], p[1], Math.max(0, p[2])]) });
        const nz = f.n[2], lam = Math.max(0, V.dot(f.n, LGT)); g.tone = Math.min(0.75, 0.4 + 0.3 * (1 - Math.max(0, nz)) + 0.1 * (1 - lam));
        const cxw = f.v.reduce((s, p) => s + p[0], 0) / 4, czw = f.v.reduce((s, p) => s + p[2], 0) / 4;
        // skin: white mottles and scars, barnacle clusters on the head and the flank, a dark band at the waterline
        g.deco = (PP, cm, poly) => { const c = poly.reduce((s, p) => [s[0] + p[0] / poly.length, s[1] + p[1] / poly.length], [0, 0]); let ar = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; ar += p[0] * q[1] - q[0] * p[1]; } ar = Math.abs(ar) / 2; if (ar < 12) return;
          const sz = Math.sqrt(ar) * 0.36, roll = P.R();
          if (czw < 14) { P.hatch(poly, { ang: 0, gap: 1.4, c: K, a: 0.9, w: 0.6, inset: 0 }); return; }
          if (roll < 0.14) { const e = Array.from({ length: 9 }, (_, q) => [c[0] + Math.cos(q * TAU / 9) * sz * R(0.7, 1.2), c[1] + Math.sin(q * TAU / 9) * sz * 0.6 * R(0.7, 1.2)]); white(e); P.stipple(e, 6, { a: 0.8, r: 0.5, c: K }); }
          else if (roll < 0.26) { const a = R(-0.4, 0.4); P.line(c[0] - Math.cos(a) * sz * 1.6, c[1] - Math.sin(a) * sz, c[0] + Math.cos(a) * sz * 1.6, c[1] + Math.sin(a) * sz, { w: 0.8, c: Wh, passes: 1, over: 0, rough: 0.4 }); }
          else if (roll < (cxw > 250 ? 0.6 : 0.33)) { for (let m = 0; m < 4; m++) { const x = c[0] + R(-sz, sz), y = c[1] + R(-sz, sz) * 0.6, r = R(1.1, 2.3); white(Array.from({ length: 8 }, (_, q) => [x + Math.cos(q * TAU / 8) * r, y + Math.sin(q * TAU / 8) * r])); P.circle(x, y, r, { w: 0.5, c: K, passes: 1 }); P.dot(x, y, 0.5, { c: K }); } } };
        wf.push(g); });
      add(wf); }
    // the flukes: a notched wing on the raised tail, with a pale scalloped trailing edge
    { const T0 = path[0], dA = V.norm([-1, 0, 1.1]), Y = [0, 1, 0];
      const half = [[0, 0], [14, 26], [34, 70], [62, 120], [92, 160], [118, 182], [128, 178], [120, 150], [104, 112], [92, 70], [92, 34], [100, 12], [92, 0]];
      const out = half.concat(half.slice(1, -1).reverse().map(([a, b]) => [a, -b]));
      const toW = ([a, b]) => V.add(V.add(T0, V.mul(dA, a - 6)), V.mul(Y, b));
      const fl = D.poly3(out.map(toW), V.add(T0, [400, -800, 600]), { double: true, tone: 0.9 });
      fl.deco = () => { for (let i = 0; i < 26; i++) { const t = i / 25, b = lerp(-178, 178, t), a = 92 + 30 * Math.pow(Math.abs(b) / 182, 1.6) - 6; const p = pj(toW([a, b])), q = pj(toW([a - R(8, 26), b + R(-6, 6)])); if (p && q) P.line(p[0], p[1], q[0], q[1], { w: 0.9, c: Wh, passes: 1, over: 0, rough: 0.3 }); }
        for (let i = 0; i < 14; i++) { const p = pj(toW([R(20, 80), R(-120, 120)])); if (p) P.dot(p[0], p[1], R(1, 2.2), { c: Wh }); } };
      add(fl); }
    // tubercles (the knobs on a humpback's head)
    for (let i = 0; i < 60; i++) { const x = R(380, 548), y = R(-0.7, 0.7) * wr(x); const z = wTop(x, y); if (z < 10) continue; add(D.sphere(x, y, z - 1.5, R(4, 7), { rings: 6, seg: 10 })); }
    // girth straps: iron bands buckled round the whale, carrying the deck
    [-190, 0, 175].forEach(xs => { const r = wr(xs) + 3, pts = []; for (let k = 0; k <= 40; k++) { const a = -Math.PI * 0.08 + Math.PI * 1.16 * k / 40; pts.push([xs, -Math.cos(a) * r * SQ[0], wz(xs) + Math.sin(a) * r * SQ[1]]); }
      const st = D.tube(pts, 4.5, { seg: 8 }).filter(f => f.v.some(p => p[2] > 0)).map(f => Object.assign(f, { v: f.v.map(p => [p[0], p[1], Math.max(0, p[2])]), tone: 0.62 })); add(st);
      custom([xs, -r, 40], () => { const d2 = []; pts.forEach((p, k) => { if (k % 2 || p[1] > -20 || p[2] < 4) return; const q = pj([p[0] - 3, p[1] - 4, p[2]]); if (q) d2.push([q[0], q[1], 0.9]); }); P.dots(d2, Wh, 1); const zb = wz(xs) + 34, b = pj([xs, wSide(xs, zb) - 5, zb]); if (b) { const bk = [[b[0] - 5, b[1] - 6], [b[0] + 5, b[1] - 6], [b[0] + 5, b[1] + 6], [b[0] - 5, b[1] + 6]]; black(bk); polyL(bk, 0.8, Wh); P.line(b[0] - 2.5, b[1], b[0] + 2.5, b[1], { w: 1.2, c: Wh, passes: 1, over: 0 }); } }, 30); });

    /* ================= THE SEA: a block of ocean cut out like an architect's model ================= */
    const SX0 = -760, SX1 = 720, SY0 = -330, SY1 = 330, SZ = -135;
    { const top = D.poly3([[SX0, SY0, 0], [SX1, SY0, 0], [SX1, SY1, 0], [SX0, SY1, 0]], [0, 0, 500], { layer: 1, noHatch: true });
      const front = D.poly3([[SX0, SY0, SZ], [SX1, SY0, SZ], [SX1, SY0, 0], [SX0, SY0, 0]], [0, -2000, -100], { layer: 1, noHatch: true });
      const side = D.poly3([[SX1, SY0, SZ], [SX1, SY0, 0], [SX1, SY1, 0], [SX1, SY1, SZ]], [3000, 0, -100], { layer: 1, noHatch: true });
      // the surface: ruled swell lines, little wave crests, rings round the whale, reflections of the flank
      top.deco = () => { const pr = planeProj([0, 0, 0], [1, 0, 0], [0, 1, 0]);
        const inWhale = (xx, y) => xx > WX0 - 10 && xx < WX1 + 10 && Math.abs(y) < wr(Math.max(WX0, Math.min(WX1, xx))) * SQ[0] + 8;
        for (let y = SY0 + 8, k = 0; y < SY1; y += 9 + k * 0.25, k++) { let x = SX0 + R(0, 30); while (x < SX1 - 10) { const L = R(20, 120), x2 = Math.min(SX1 - 4, x + L); if (!inWhale(x, y) && !inWhale(x2, y) && !inWhale((x + x2) / 2, y)) lineUV(pr, x, y, x2, y + R(-2, 2), 0.5, K); x = x2 + R(10, 60); } }
        for (let i = 0; i < 70; i++) { const x = R(SX0 + 30, SX1 - 30), y = R(SY0 + 20, SY1 - 20); if (inWhale(x, y * 0.8)) continue; const p = pr(x, y), s2 = R(3, 7); P.curve([[p[0] - s2, p[1] + 1], [p[0] - s2 * 0.3, p[1] - s2 * 0.4], [p[0] + s2 * 0.4, p[1]]], { w: 0.7, c: K, passes: 1, rough: 0.1 }); }
        for (let m = 1; m <= 4; m++) { const pts = []; for (let k = 0; k <= 60; k++) { const x = lerp(WX0 + 90, WX1 + 40, k / 60), y = -(wr(Math.min(WX1, x)) * SQ[0] * 0.98 + m * 14 + (x > WX1 - 10 ? (x - WX1 + 10) * 0.8 : 0)); pts.push(pr(x, y)); } P.path(pts, { w: 0.75 - m * 0.1, c: K, passes: 1, rough: 0.3 }); }
        // reflection of the dark flank: vertical strokes hanging under the waterline
        for (let x = WX0 + 140; x < WX1 - 20; x += 3.2) { const y0 = -wr(x) * SQ[0], a = pr(x, y0 - 2), b = pr(x, y0 - R(14, 34)); P.line(a[0], a[1], b[0], b[1], { w: 0.5, c: K, a: 0.85, passes: 1, over: 0, rough: 0.2 }); } };
      // the cut face: black water, the whale's belly and flipper seen through it, fish, bubbles, kelp, and a sea floor of rejected boats
      front.deco = (PP, cm, poly) => { black(poly); const pr = planeProj([0, SY0 - 0.5, 0], [1, 0, 0], [0, 0, 1]);
        const vb = x => Math.max(SZ + 14, (wz(x) - wr(x) * SQ[1]) * 0.86);
        for (let v = -3, k = 0; v > -60; v -= 2.6 + k * 0.35, k++) { let x = SX0 + R(0, 20); while (x < SX1 - 8) { const L = R(10, 90) * (1 - k / 22), x2 = Math.min(SX1 - 4, x + L); if (P.R() < 1 - k / 20) lineUV(pr, x, v, x2, v, Math.max(0.3, 0.9 - k * 0.04), Wh); x = x2 + R(4, 30) * (1 + k * 0.2); } }
        // the belly, pale against the dark, with ventral pleats
        const xs = []; for (let x = -520; x <= 545; x += 15) xs.push(x); const bel = xs.map(x => pr(x, vb(x))).concat([pr(545, -6), pr(-520, -6)]);
        P.hatch(bel, { ang: 0, gap: 3, c: Wh, a: 0.5, w: 0.5, inset: 1 }); P.path(xs.map(x => pr(x, vb(x))), { w: 1.6, c: Wh, passes: 1, rough: 0.2 });
        for (let m = 1; m <= 7; m++) P.path(xs.filter(x => x > 40 - m * 20 && x < 540 - m * 4).map(x => pr(x, vb(x) + m * 5)), { w: 0.6, c: Wh, passes: 1, rough: 0.2 });
        // the long white flipper with its knobbly leading edge
        { const root = [330, -30], tip = [70, -122]; const N = 14, top2 = [], bot = []; for (let i = 0; i <= N; i++) { const t = i / N, u = lerp(root[0], tip[0], t), v = lerp(root[1], tip[1], t), w = 15 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.08)) * (1 - t * 0.55); top2.push([u + w * 0.3, v + w + (i % 2 ? 2.5 : 0)]); bot.push([u - w * 0.3, v - w]); } const F = top2.concat(bot.reverse()).map(([u, v]) => pr(u, v)); white(F); P.hatch(F, { ang: 20, gap: 2.4, c: K, a: 0.6, w: 0.4, fade: (x, y) => Math.max(0, (y - pr(0, -70)[1]) / 30) }); polyL(F, 1.3); }
        // bubbles
        for (let i = 0; i < 60; i++) { const u = R(-500, 700), v = R(-120, -6), q = pr(u, v), r = R(1, 4.5); if (Math.abs(u + 300) < 70 && v < SZ + 55) continue; P.circle(q[0], q[1], r, { w: 0.7, c: Wh, passes: 1 }); if (r > 2.5) P.dot(q[0] - r * 0.35, q[1] - r * 0.35, 0.6, { c: Wh }); }
        // a school of small fish
        const fish = (x, y, s2, dir) => { const b = Array.from({ length: 10 }, (_, q) => [x + Math.cos(q * TAU / 10) * s2, y + Math.sin(q * TAU / 10) * s2 * 0.42]); white(b); polyL(b, 0.7); const t = [[x - dir * s2 * 0.9, y], [x - dir * s2 * 1.6, y - s2 * 0.5], [x - dir * s2 * 1.6, y + s2 * 0.5]]; white(t); polyL(t, 0.7); P.dot(x + dir * s2 * 0.5, y - s2 * 0.08, 0.7, { c: K }); P.line(x + dir * s2 * 0.15, y - s2 * 0.3, x + dir * s2 * 0.15, y + s2 * 0.3, { w: 0.4, c: K, passes: 1, over: 0 }); };
        for (let i = 0; i < 26; i++) { const q = pr(R(-760, -560) + i * 2, R(-110, -30)); fish(q[0], q[1], R(3, 5.5), 1); }
        for (let i = 0; i < 9; i++) { const q = pr(R(560, 700), R(-100, -40)); fish(q[0], q[1], R(3, 5), -1); }
        // kelp
        for (let i = 0; i < 16; i++) { const u0 = R(-740, 700), h = R(30, 90), pts = []; if (Math.abs(u0 + 300) < 60) continue; for (let v = SZ + 6; v < SZ + h; v += 6) pts.push(pr(u0 + Math.sin(v * 0.12 + i) * 5, v)); P.path(pts, { w: 0.9, c: Wh, passes: 1, rough: 0.3 }); pts.forEach((p, k) => { if (k % 2) P.line(p[0], p[1], p[0] + (k % 4 ? 4 : -4), p[1] - 3, { w: 0.6, c: Wh, passes: 1, over: 0 }); }); }
        // the sea floor: white stones, and every boat that did not float
        const fl = []; for (let u = SX0 + 4; u < SX1 - 4; u += R(6, 12)) fl.push(pr(u, SZ + R(3, 7))); P.path(fl, { w: 0.8, c: Wh, passes: 1, rough: 0.3 });
        for (let i = 0; i < 26; i++) { const q = pr(R(SX0 + 20, SX1 - 30), SZ + R(4, 10)), r = R(3, 7); const st = Array.from({ length: 9 }, (_, k) => [q[0] + Math.cos(k * TAU / 9) * r * R(0.8, 1.1), q[1] + Math.sin(k * TAU / 9) * r * 0.55]); white(st); P.hatch(st, { ang: 60, gap: 1.4, c: K, a: 0.8, w: 0.4, fade: (x) => Math.max(0, (x - q[0]) / r) }); polyL(st, 0.8); }
        for (let i = 0; i < 18; i++) { const q = pr(R(-650, 650), SZ + R(6, 14)), s2 = R(6, 10), tilt = R(-0.5, 0.5), rot = ([x, y]) => [q[0] + x * Math.cos(tilt) - y * Math.sin(tilt), q[1] + x * Math.sin(tilt) + y * Math.cos(tilt)];
          const hull = [[-s2 * 1.4, -s2 * 0.4], [s2 * 1.4, -s2 * 0.4], [s2 * 0.9, s2 * 0.3], [-s2 * 0.9, s2 * 0.3]].map(rot), sail = [[-s2 * 0.6, -s2 * 0.4], [0, -s2 * 1.3], [s2 * 0.6, -s2 * 0.4]].map(rot); white(hull); white(sail); polyL(hull, 0.7); polyL(sail, 0.7); }
        { const q = pr(-300, SZ + 40); P.text('REJECTS', q[0], q[1], { size: 9, align: 'center', c: Wh, fine: true }); const a = pr(-300, SZ + 30), b = pr(-330, SZ + 14); P.line(a[0], a[1], b[0], b[1], { w: 0.7, c: Wh, passes: 1, over: 0 }); }
      };
      side.deco = (PP, cm, poly) => { black(poly); const pr = planeProj([SX1 + 0.5, 0, 0], [0, 1, 0], [0, 0, 1]);
        for (let y = SY0 + 6; y < SY1 - 10; y += R(10, 40)) lineUV(pr, y, -3, y + R(8, 30), -3, 0.6, Wh);
        for (let i = 0; i < 30; i++) { const q = pr(R(SY0 + 10, SY1 - 10), R(SZ + 10, -8)); P.circle(q[0], q[1], R(1, 3.5), { w: 0.6, c: Wh, passes: 1 }); }
        const fl = []; for (let u = SY0 + 4; u < SY1 - 4; u += R(6, 12)) fl.push(pr(u, SZ + R(3, 7))); P.path(fl, { w: 0.8, c: Wh, passes: 1, rough: 0.3 });
        for (let i = 0; i < 6; i++) { const u0 = R(SY0 + 20, SY1 - 20), pts = []; for (let v = SZ + 6; v < SZ + R(30, 80); v += 6) pts.push(pr(u0 + Math.sin(v * 0.12 + i) * 5, v)); P.path(pts, { w: 0.8, c: Wh, passes: 1, rough: 0.3 }); }
        // an anchor on a chain that goes nowhere
        const a = pr(-180, -6), b = pr(-180, SZ + 26); for (let k = 0; k < 14; k++) { const y = lerp(a[1], b[1], k / 14), y2 = lerp(a[1], b[1], (k + 1) / 14); P.ellipse(a[0] + (k % 2), (y + y2) / 2, k % 2 ? 1 : 2.2, (y2 - y) / 2 + 0.5, { w: 0.7, c: Wh, passes: 1 }); }
        P.line(b[0], b[1], b[0], b[1] + 18, { w: 1.6, c: Wh, passes: 1, over: 0 }); P.arc(b[0], b[1] + 10, 10, 9, 0.2, Math.PI - 0.2, { w: 1.6, c: Wh, passes: 1 }); P.line(b[0] - 6, b[1] + 4, b[0] + 6, b[1] + 4, { w: 1.2, c: Wh, passes: 1, over: 0 }); };
      add([top, front, side]); }

    /* ================= THE DECK strapped to the back ================= */
    const DX0 = -330, DX1 = 215, DY0 = -112, DY1 = 112, DZ = 132, DT = 12, Z1 = DZ + DT;
    { const dk = box(DX0, DY0, DZ, DX1, DY1, Z1); add(dk);
      face(dk, 0, -1, 0).deco = () => { const pr = planeProj([DX0, DY0 - 0.5, DZ], [1, 0, 0], [0, 0, 1]); black(rectUV(pr, 0, 0, DX1 - DX0, DT)); const d2 = []; for (let u = 3; u < DX1 - DX0; u += 6) { const q = pr(u, DT * 0.7); d2.push([q[0], q[1], 0.8]); } P.dots(d2, Wh, 1); for (let u = 40; u < DX1 - DX0; u += 60) lineUV(pr, u, 1, u, DT - 1, 0.7, Wh); };
      face(dk, 1, 0, 0).deco = () => { const pr = planeProj([DX1 + 0.5, DY0, DZ], [0, 1, 0], [0, 0, 1]); dotsAlong(pr, 3, DT * 0.6, DY1 - DY0 - 3, DT * 0.6, 6, 0.8, Wh); };
      const tp = face(dk, 0, 0, 1); tp.noHatch = true; tp.deco = () => { const pr = planeProj([DX0, DY0, Z1 + 0.2], [1, 0, 0], [0, 1, 0]); for (let v = 6; v < DY1 - DY0; v += 6) lineUV(pr, 0, v, DX1 - DX0, v, 0.45); for (let k = 0; k < 60; k++) { const u = R(0, DX1 - DX0), v = Math.floor(R(1, 37)) * 6; lineUV(pr, u, v, u, v + 6, 0.45); } };
      // stilts with cross bracing down to the whale
      const posts = []; for (let x = DX0 + 18; x < DX1; x += 44) for (const y of [DY0 + 10, -30, 40, DY1 - 10]) { const zb = wTop(x, y) - 4; if (zb < DZ - 2 && zb > 20) { add(box(x - 3.5, y - 3.5, zb, x + 3.5, y + 3.5, DZ)); posts.push([x, y, zb]); } }
      custom([0, DY0, DZ - 40], () => { const fr = posts.filter(p => p[1] === DY0 + 10); for (let i = 0; i + 1 < fr.length; i++) { const a = fr[i], b = fr[i + 1], zl = Math.max(a[2], b[2]) + 6; const p1 = pj([a[0], a[1] - 4, DZ - 4]), p2 = pj([b[0], b[1] - 4, zl]), p3 = pj([a[0], a[1] - 4, zl]), p4 = pj([b[0], b[1] - 4, DZ - 4]); P.line(p1[0], p1[1], p2[0], p2[1], { w: 0.9, c: K, passes: 1, over: 0 }); P.line(p3[0], p3[1], p4[0], p4[1], { w: 0.9, c: K, passes: 1, over: 0 }); } }, 20); }

    /* ================= THE MILL ================= */
    P.section('mill');
    // sawtooth shed, its glazing turned to the north light
    { const x0 = -315, x1 = -70, y0 = -98, y1 = 22, h = 74, sh = box(x0, y0, Z1, x1, y1, Z1 + h); add(sh);
      face(sh, 0, -1, 0).deco = () => { const pr = planeProj([x0, y0 - 0.5, Z1], [1, 0, 0], [0, 0, 1]); bricks(pr, 0, 0, x1 - x0, h, 0.6); for (let k = 0; k < 9; k++) archWin(pr, 8 + k * 26.5, 24 + k * 26.5, 8, 48, false); for (let k = 0; k <= 9; k++) lineUV(pr, 3 + k * 26.5, 0, 3 + k * 26.5, h, 1); dotsAlong(pr, 0, 52, x1 - x0, 52, 4, 0.9); dotsAlong(pr, 0, 70, x1 - x0, 70, 4, 0.9); sign(pr, 66, 55, 180, 68, 'PULP & PAPER', 7.5); };
      face(sh, 1, 0, 0).deco = () => { const pr = planeProj([x1 + 0.5, y0, Z1], [0, 1, 0], [0, 0, 1]); gridWin(pr, 20, 8, 50, 58, 3, 5, true); gridWin(pr, 70, 8, 100, 58, 3, 5, true); for (let v = 4; v < h; v += 5) if (P.R() > 0.5) { const u = R(2, 110); lineUV(pr, u, v, u + R(3, 8), v, 0.5, Wh); } };
      for (let k = 0; k < 5; k++) { const a = x0 + k * (x1 - x0) / 5, b = a + (x1 - x0) / 5, z = Z1 + h, zt = z + 34;
        const fT = D.poly3([[a, y0, z], [b, y0, z], [b, y0, zt]], [a, y0 - 100, z]); add(fT);
        fT.deco = () => { const pr = planeProj([a, y0 - 0.5, z], [1, 0, 0], [0, 0, 1]); for (let u = 4; u < b - a; u += 4) lineUV(pr, u, 0, u, (u / (b - a)) * 34 - 1, 0.45); };
        const gl = D.poly3([[b, y0, z], [b, y0, zt], [b, y1, zt], [b, y1, z]], [b + 100, 0, z]); add(gl);
        gl.deco = (PP, cm, poly) => { black(poly); const pr = planeProj([b + 0.6, y0, z], [0, 1, 0], [0, 0, 1]); for (let u = 6; u < y1 - y0; u += 8) lineUV(pr, u, 2, u, 32, 0.6, Wh); lineUV(pr, 2, 17, y1 - y0 - 2, 17, 0.6, Wh); };
        add(D.poly3([[a, y0, z], [b, y0, zt], [b, y1, zt], [a, y1, z]], [a - 100, 0, z + 300])); } }
    // chimneys: brick stacks with iron bands and ladders
    const stacks = [[-175, 72, 22, 330], [-30, 86, 15, 255], [-290, 70, 11, 175], [150, 88, 12, 205]];
    stacks.forEach(([x, y, r, h]) => { add(D.cylinder(x, y, r * 1.3, Z1, Z1 + 28, 20)); add(D.cylinder(x, y, r, Z1 + 28, Z1 + h, 20)); add(D.cylinder(x, y, r * 1.22, Z1 + h, Z1 + h + 10, 20));
      custom([x + r, y - r, Z1 + h / 2], () => { for (let z = Z1 + 40; z < Z1 + h - 6; z += 24) { const pts = []; for (let k = 0; k <= 14; k++) { const a = -Math.PI * 0.75 + k * Math.PI * 1.0 / 14; pts.push([x + Math.cos(a) * (r + 0.6), y + Math.sin(a) * (r + 0.6), z]); } D.polyline3(P, pts, CAM, { w: 1.3, c: K }); }
        for (let k = 0; k < 4; k++) { const a = -Math.PI * 0.6 + k * 0.32, z0 = Z1 + 30 + k * 7; for (let z = z0; z < Z1 + h - 10; z += 13 + k) { const p = pj([x + Math.cos(a) * (r + 0.4), y + Math.sin(a) * (r + 0.4), z]); if (p) P.line(p[0] - 1.5, p[1], p[0] + 1.5, p[1], { w: 0.5, c: Wh, passes: 1, over: 0 }); } }
        const lx = x + Math.cos(-Math.PI * 0.3) * (r + 1), ly = y + Math.sin(-Math.PI * 0.3) * (r + 1); D.polyline3(P, [[lx, ly, Z1 + 28], [lx, ly, Z1 + h]], CAM, { w: 0.7, c: K }); for (let z = Z1 + 32; z < Z1 + h; z += 7) { const p = pj([lx, ly, z]); if (p) P.line(p[0] - 2.4, p[1], p[0] + 2.4, p[1], { w: 0.6, c: K, passes: 1, over: 0 }); } }, 12); });
    // digesters: riveted tanks with catwalk rings
    { const tank = (x, y, r, h, roof) => { add(D.cylinder(x, y, r, Z1, Z1 + h, 26)); if (roof === 'cone') add(D.revolve(x, y, [[r + 3, Z1 + h], [r * 0.2, Z1 + h + r * 0.9], [0.01, Z1 + h + r * 0.95]], { seg: 26 })); else add(D.revolve(x, y, Array.from({ length: 8 }, (_, k) => { const a = Math.PI / 2 * k / 7; return [Math.cos(a) * (r + 1) + 0.01, Z1 + h + Math.sin(a) * r * 0.7]; }), { seg: 26 }));
        add(D.cylinder(x, y, r + 6, Z1 + h * 0.62, Z1 + h * 0.62 + 2.5, 26));
        custom([x + r, y - r, Z1 + h / 2], () => { for (let z = Z1 + 12; z < Z1 + h; z += 16) { const d2 = []; for (let k = 0; k < 14; k++) { const a = -Math.PI * 0.8 + k * 0.09; const p = pj([x + Math.cos(a) * (r + 0.4), y + Math.sin(a) * (r + 0.4), z]); if (p) d2.push([p[0], p[1], 0.75]); } P.dots(d2, K, 0.9); }
          for (let k = 0; k < 18; k++) { const a = -Math.PI * 0.85 + k * 0.1, p = pj([x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6), Z1 + h * 0.62 + 2.5]), q = pj([x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6), Z1 + h * 0.62 + 11]); if (p && q) P.line(p[0], p[1], q[0], q[1], { w: 0.6, c: K, passes: 1, over: 0 }); }
          const rl = []; for (let k = 0; k <= 18; k++) { const a = -Math.PI * 0.85 + k * 0.1; rl.push([x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6), Z1 + h * 0.62 + 11]); } D.polyline3(P, rl, CAM, { w: 0.8, c: K });
          const a = -Math.PI * 0.42, p0 = pj([x + Math.cos(a) * (r + 0.5), y + Math.sin(a) * (r + 0.5), Z1 + 20]); if (p0) black([[p0[0] - 3, p0[1]], [p0[0] + 3, p0[1]], [p0[0] + 3, p0[1] - 12], [p0[0] - 3, p0[1] - 12]]); }, 14); };
      tank(45, 30, 40, 150, 'cone'); tank(115, -15, 27, 105, 'dome'); tank(-25, 5, 24, 122, 'dome'); }
    // the paper machine hall along the front, with the web running over its rolls
    { const x0 = -45, x1 = 205, y0 = -108, y1 = -58, h = 40, hb = box(x0, y0, Z1, x1, y1, Z1 + h); add(hb);
      face(hb, 0, -1, 0).deco = () => { const pr = planeProj([x0, y0 - 0.5, Z1], [1, 0, 0], [0, 0, 1]); for (let k = 0; k < 10; k++) { const u = 8 + k * 24; gridWin(pr, u, 10, u + 14, 32, 2, 3, false); } dotsAlong(pr, 0, 36, x1 - x0, 36, 4); sign(pr, 140, 1, 240, 8.5, 'PAPER MACHINE NO 1', 5.5); };
      face(hb, 1, 0, 0).deco = () => { const pr = planeProj([x1 + 0.5, y0, Z1], [0, 1, 0], [0, 0, 1]); louvres(pr, 10, 8, 40, 30, true); };
      const rolls = []; for (let k = 0; k < 9; k++) { const x = x0 + 18 + k * 26, z = Z1 + h + 10 + (k % 2) * 8; add(orient(D.cylinder(0, 0, 8, -20, 20, 14), [x, (y0 + y1) / 2, z], [0, 1, 0])); add(box(x - 2, y0 + 2, Z1 + h, x + 2, y0 + 5, z)); rolls.push([x, z]); }
      custom([(x0 + x1) / 2, y0 - 2, Z1 + h + 30], () => { const pts = []; rolls.forEach(([x, z], k) => { pts.push([x - 6, y0 + 4, z + (k % 2 ? -9 : 9)]); pts.push([x + 6, y0 + 4, z + (k % 2 ? -9 : 9)]); }); const sc = pts.map(pj).filter(Boolean); const lo = sc.map(([x, y]) => [x, y + 2.5]); const band = sc.concat(lo.slice().reverse()); white(band); polyL(band, 0.9); }, 40); }
    // a water tower
    { const tx = 175, ty = 50, tz = Z1 + 120; [[-14, -14], [14, -14], [14, 14], [-14, 14]].forEach(([u, v]) => pipe([tx + u * 1.4, ty + v * 1.4, Z1], [tx + u, ty + v, tz], 2, { seg: 6 })); add(D.cylinder(tx, ty, 26, tz, tz + 40, 22)); add(D.revolve(tx, ty, [[28, tz + 40], [0.01, tz + 58]], { seg: 22 }));
      custom([tx, ty - 20, tz - 40], () => { for (let z = Z1 + 20; z < tz - 20; z += 30) { const a = pj([tx - 14 * 1.3, ty - 14 * 1.3, z]), b = pj([tx + 14 * 1.3, ty - 14 * 1.3, z + 30]), c2 = pj([tx + 14 * 1.3, ty - 14 * 1.3, z]), d = pj([tx - 14 * 1.3, ty - 14 * 1.3, z + 30]); P.line(a[0], a[1], b[0], b[1], { w: 0.5, c: K, passes: 1, over: 0 }); P.line(c2[0], c2[1], d[0], d[1], { w: 0.5, c: K, passes: 1, over: 0 }); } for (let k = 0; k < 12; k++) { const a = -Math.PI * 0.9 + k * 0.12; D.polyline3(P, [[tx + Math.cos(a) * 26.4, ty + Math.sin(a) * 26.4, tz + 2], [tx + Math.cos(a) * 26.4, ty + Math.sin(a) * 26.4, tz + 38]], CAM, { w: 0.5, c: K }); } }, 30); }

    /* ================= THE FOLDING HOUSE on the head, the gallery that feeds it, the chute ================= */
    const FX = 318, FY = 18, FZB = wTop(FX) - 14, FH = 130;
    { const fh = box(FX - 32, FY - 32, FZB, FX + 32, FY + 32, FZB + FH); add(fh);
      face(fh, 0, -1, 0).deco = () => { const pr = planeProj([FX - 32, FY - 32.5, FZB], [1, 0, 0], [0, 0, 1]); bricks(pr, 0, 0, 64, FH, 0.7); archWin(pr, 10, 26, 22, 62, false); archWin(pr, 38, 54, 22, 62, false); gridWin(pr, 12, 74, 52, 100, 4, 2, false); dotsAlong(pr, 0, 106, 64, 106, 4); dotsAlong(pr, 0, 112, 64, 112, 4); };
      face(fh, 1, 0, 0).deco = () => { const pr = planeProj([FX + 32.5, FY - 32, FZB], [0, 1, 0], [0, 0, 1]); archWin(pr, 18, 46, 24, 80, true); for (let v = 4; v < FH; v += 5) if (P.R() > 0.55) { const u = R(2, 56); lineUV(pr, u, v, u + R(3, 8), v, 0.5, Wh); } const c = pr(32, 100); P.circle(c[0], c[1], 7, { w: 1, c: Wh, passes: 1 }); P.line(c[0], c[1], c[0], c[1] - 5, { w: 0.9, c: Wh, passes: 1, over: 0 }); P.line(c[0], c[1], c[0] + 3, c[1] + 1, { w: 0.9, c: Wh, passes: 1, over: 0 }); };
      const rt = FZB + FH, apex = [FX, FY, rt + 70];
      add(D.poly3([[FX - 38, FY - 38, rt], [FX + 38, FY - 38, rt], apex], [FX, FY - 400, rt + 200])); add(D.poly3([[FX + 38, FY - 38, rt], [FX + 38, FY + 38, rt], apex], [FX + 400, FY, rt + 200]));
      add(D.poly3([[FX - 38, FY - 38, rt], apex, [FX - 38, FY + 38, rt]], [FX - 400, FY, rt + 200])); add(D.poly3([[FX - 38, FY + 38, rt], apex, [FX + 38, FY + 38, rt]], [FX, FY + 400, rt + 200]));
      custom(apex, () => { const p = pj(apex); P.line(p[0], p[1], p[0], p[1] - 46, { w: 1.2, c: K, passes: 1, over: 0 }); const f = [[p[0], p[1] - 46], [p[0] + 30, p[1] - 40], [p[0] + 22, p[1] - 35], [p[0] + 30, p[1] - 30], [p[0], p[1] - 28]]; white(f); P.hatch(f, { ang: 90, gap: 1.6, a: 0.9, w: 0.6, c: RED }); polyL(f, 1); P.dot(p[0], p[1] - 47, 2, { c: K }); }, 300);
      // the gallery: an enclosed bridge from the machine hall to the folding house
      const g0 = [205, -70, Z1 + 32], g1 = [FX - 32, -2, FZB + 96]; const gd = V.sub(g1, g0);
      const gal = orient(D.extrude([[-9, -10], [9, -10], [9, 10], [-9, 10]], 0, Math.hypot(...gd), { crease: 0.3 }), g0, gd); add(gal);
      [0.35, 0.72].forEach(t => { const p = V.add(g0, V.mul(gd, t)); pipe([p[0], p[1], wTop(p[0], p[1]) - 3], [p[0], p[1], p[2] - 10], 3, { seg: 8 }); });
      custom(V.add(g0, V.mul(gd, 0.5)), () => { for (let k = 1; k < 11; k++) { const t = k / 11, a = pj(V.add(g0, V.add(V.mul(gd, t), [0, -10.5, -2]))), b = pj(V.add(g0, V.add(V.mul(gd, t + 0.045), [0, -10.5, 5]))); if (a && b) black([[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]]); } }, 30);
      // the chute: a trough on trestles from the folding house down to the sea
      const cA = [FX + 32, FY - 20, FZB + 80], cB = [640, -255, 6]; const cd = V.sub(cB, cA);
      add(D.tube([cA, V.add(cA, V.mul(cd, 0.5)), cB], 6.5, { seg: 10 }));
      custom(V.add(cA, V.mul(cd, 0.5)), () => { for (let k = 1; k < 20; k++) { const p = V.add(cA, V.mul(cd, k / 20)); const a = pj([p[0], p[1], p[2] + 6]), b = pj([p[0], p[1], p[2] + 11]); if (a && b) P.line(a[0], a[1], b[0], b[1], { w: 0.7, c: K, passes: 1, over: 0 }); } D.polyline3(P, [V.add(cA, [0, 0, 11]), V.add(cB, [0, 0, 11])], CAM, { w: 0.9, c: K }); }, 60);
      [0.3, 0.55, 0.8].forEach(t => { const p = V.add(cA, V.mul(cd, t)); const zb = p[0] < WX1 && Math.abs(p[1]) < wr(p[0]) * SQ[0] ? wTop(p[0], p[1]) : 0; pipe([p[0] - 6, p[1], zb], [p[0], p[1], p[2] - 6], 2, { seg: 6 }); pipe([p[0] + 6, p[1], zb], [p[0], p[1], p[2] - 6], 2, { seg: 6 }); }); }

    /* ================= THE PILE: everything else a mill accumulates ================= */
    P.section('pile');
    { const hm = new Map(), cell = 16, key = (x, y) => Math.round(x / cell) + ',' + Math.round(y / cell), hAt = (x, y) => hm.get(key(x, y)) || Z1, setH = (x0, y0, x1, y1, z) => { for (let x = x0; x <= x1; x += cell / 2) for (let y = y0; y <= y1; y += cell / 2) { const k = key(x, y); hm.set(k, Math.max(hm.get(k) || Z1, z)); } };
      const pileDeco = (bx, x0, y0, z0, w, d, h) => { const kind = P.R(), fr = face(bx, 0, -1, 0), rt = face(bx, 1, 0, 0);
        fr.deco = () => { const pr = planeProj([x0, y0 - 0.4, z0], [1, 0, 0], [0, 0, 1]); if (kind < 0.3) { const n = Math.max(1, Math.floor(w / 7)); for (let k = 0; k < n; k++) { const u = 2 + k * (w - 2) / n; black(rectUV(pr, u, h * 0.45, u + (w - 2) / n - 2.5, h * 0.8)); } } else if (kind < 0.5) dotsAlong(pr, 1.5, h * 0.7, w - 1.5, h * 0.7, 3, 0.65); else if (kind < 0.65) { for (let v = 2; v < h - 1; v += 2.5) lineUV(pr, 1, v, w - 1, v, 0.45); } else if (kind < 0.8 && h > 12) archWin(pr, w * 0.3, w * 0.7, 1, h * 0.75, false); };
        rt.deco = () => { const pr = planeProj([x0 + w + 0.4, y0, z0], [0, 1, 0], [0, 0, 1]); if (kind < 0.5) { const n = Math.max(1, Math.floor(d / 8)); for (let k = 0; k < n; k++) { const u = 2 + k * (d - 2) / n; const q = rectUV(pr, u, h * 0.4, u + (d - 2) / n - 3, h * 0.75); P.poly(q, { w: 0.6, c: Wh, rough: 0.1, passes: 1 }); } } else if (kind < 0.7) dotsAlong(pr, 1.5, h * 0.6, d - 1.5, h * 0.6, 3, 0.6, Wh); }; };
      const busy = (x, y) => (x > -322 && x < -62 && y > -104 && y < 28) || (x > -52 && x < 212 && y < -52) || Math.hypot(x - 45, y - 30) < 50 || Math.hypot(x - 115, y + 15) < 36 || Math.hypot(x + 25, y - 5) < 33 || Math.hypot(x - 175, y - 50) < 34 || stacks.some(([sx, sy, r]) => Math.hypot(x - sx, y - sy) < r * 1.4 + 8);
      for (let i = 0; i < 1100; i++) { const x = R(DX0 + 8, DX1 - 8), y = R(-44, DY1 - 8); if (busy(x, y)) continue; const z = Math.max(hAt(x - 8, y - 8), hAt(x + 8, y + 8), hAt(x, y)); if (z > Z1 + 150 - Math.max(0, -y) * 1.2) continue; const kind = P.R();
        if (kind < 0.32) { const w = R(8, 26), d = R(8, 22), h = R(8, 30), bx = box(x - w / 2, y - d / 2, z, x + w / 2, y + d / 2, z + h); add(bx); pileDeco(bx, x - w / 2, y - d / 2, z, w, d, h); setH(x - w / 2, y - d / 2, x + w / 2, y + d / 2, z + h); }
        else if (kind < 0.55) { const r = R(5, 13), h = R(10, 40); add(D.cylinder(x, y, r, z, z + h, 14)); if (P.R() > 0.5) add(D.cylinder(x, y, r + 2, z + h, z + h + 3, 14)); setH(x - r, y - r, x + r, y + r, z + h); }
        else if (kind < 0.75) { const r = R(3, 7), L = R(30, 80), a = R(0, TAU), e = R(-0.2, 0.5); pipe([x, y, z + r], [x + Math.cos(a) * Math.cos(e) * L, y + Math.sin(a) * Math.cos(e) * L, z + r + Math.sin(e) * L], r, { flanges: [R(0.2, 0.8)] }); setH(x - 8, y - 8, x + 8, y + 8, z + r * 2); }
        else if (kind < 0.88) { const r = R(7, 14); add(D.sphere(x, y, z + r, r, { rings: 8, seg: 14 })); setH(x - r, y - r, x + r, y + r, z + r * 2); }
        else { const w = R(14, 24), d = R(12, 18), h = R(12, 20); add(box(x - w / 2, y - d / 2, z, x + w / 2, y + d / 2, z + h)); add(D.poly3([[x - w / 2 - 2, y - d / 2 - 2, z + h], [x + w / 2 + 2, y - d / 2 - 2, z + h], [x + w / 2 + 2, y, z + h + 9], [x - w / 2 - 2, y, z + h + 9]], [x, y - 400, z + 500])); add(D.poly3([[x - w / 2 - 2, y, z + h + 9], [x + w / 2 + 2, y, z + h + 9], [x + w / 2 + 2, y + d / 2 + 2, z + h], [x - w / 2 - 2, y + d / 2 + 2, z + h]], [x, y + 400, z + 500])); setH(x - w / 2, y - d / 2, x + w / 2, y + d / 2, z + h + 9); } }
      // the steam main along the back, with flanges and drops
      pipe([DX0 - 40, 104, Z1 + 64], [DX1 + 20, 104, Z1 + 64], 9, { seg: 16, flanges: [0.1, 0.25, 0.4, 0.55, 0.7, 0.85] });
      [-260, -110, 20, 110].forEach(x => pipe([x, 104, Z1], [x, 104, Z1 + 64], 4, { flanges: [0.5] }));
      pipe([45, -10, Z1 + 120], [-25, 5, Z1 + 140], 5, { flanges: [0.5] }); pipe([45, 70, Z1 + 100], [115, 10, Z1 + 95], 5, { flanges: [0.3, 0.7] }); pipe([-25, -15, Z1 + 90], [-70, -40, Z1 + 108], 4, { flanges: [0.5] });
      // a gantry crane at the tail end of the deck, lifting a bale of pulp
      [[-325, -100], [-325, 100]].forEach(([x, y]) => { pipe([x - 12, y, Z1], [x, y, Z1 + 160], 3, { seg: 6 }); pipe([x + 12, y, Z1], [x, y, Z1 + 160], 3, { seg: 6 }); }); pipe([-325, -110, Z1 + 160], [-325, 110, Z1 + 160], 5, { seg: 8 }); add(box(-335, -30, Z1 + 150, -315, -10, Z1 + 170));
      add(box(-342, -36, Z1 + 80, -308, -4, Z1 + 105));
      custom([-325, -20, Z1 + 130], () => { const a = pj([-325, -20, Z1 + 150]), b = pj([-325, -20, Z1 + 105]); for (let q = 0; q < 10; q++) { const y = lerp(a[1], b[1], q / 10), y2 = lerp(a[1], b[1], (q + 1) / 10); P.ellipse(a[0], (y + y2) / 2, q % 2 ? 0.9 : 1.8, (y2 - y) / 2 + 0.4, { w: 0.7, c: K, passes: 1 }); } }, 40); }

    { // the great Yankee dryer: one huge steam-heated drum riding high over the shed, with a flywheel at its end
      const A = [-345, 50, Z1 + 168], B = [-40, 50, Z1 + 168]; pipe(A, B, 30, { seg: 24 }); [0.04, 0.22, 0.4, 0.58, 0.76, 0.96].forEach(t2 => add(orient(D.cylinder(0, 0, 32, t2 * 305 - 2.5, t2 * 305 + 2.5, 24), A, [1, 0, 0])));
      [-300, -190, -80].forEach(x => { pipe([x - 14, 50, Z1 + 74], [x, 50, Z1 + 140], 3, { seg: 6 }); pipe([x + 14, 50, Z1 + 74], [x, 50, Z1 + 140], 3, { seg: 6 }); });
      add(orient(D.cylinder(0, 0, 10, -14, 14, 12), [B[0] + 10, B[1], B[2]], [1, 0, 0]));
      custom([-200, 20, Z1 + 168], () => { for (let x = A[0] + 10; x < B[0] - 6; x += 9) { const p = pj([x, 50 - 30.5 * 0.7, Z1 + 168 - 30.5 * 0.71]); if (p) P.dot(p[0], p[1], 0.8, { c: Wh }); } const l = pj([A[0] + 30, 20, Z1 + 168]), r = pj([B[0] - 30, 20, Z1 + 168]); if (l && r) P.text('DRYER', (l[0] + r[0]) / 2, (l[1] + r[1]) / 2 + 3, { size: 7, align: 'center', fine: true }); }, 60); }
    /* ================= masts, wires, bunting and washing lines of drying paper ================= */
    { const masts = [[-240, 40, Z1 + 30, 150], [80, 95, Z1 + 64, 150], [-120, -20, Z1 + 108, 120], [195, -30, Z1 + 40, 100]];
      masts.forEach(([x, y, z, h], i) => custom([x, y, z + h / 2], () => { D.polyline3(P, [[x, y, z], [x, y, z + h]], CAM, { w: 1.2, c: K }); for (let k = 1; k < 4; k++) { const zz = z + h * (0.55 + k * 0.12), w = (4 - k) * 5; D.polyline3(P, [[x - w, y, zz], [x + w, y, zz]], CAM, { w: 0.8, c: K }); } const tp = pj([x, y, z + h]); if (tp) P.dot(tp[0], tp[1], 2.2, { c: K }); if (i === 1) P.circle(tp[0], tp[1] - 6, 4, { w: 0.9, c: K, passes: 1 }); }, 80));
      custom([0, 0, Z1 + 200], () => { const L = [[-240, 40, Z1 + 170], [-120, -20, Z1 + 220], [80, 95, Z1 + 200]]; for (let i = 0; i + 1 < L.length; i++) { const a = L[i], b = L[i + 1], pts = []; for (let k = 0; k <= 20; k++) { const t2 = k / 20; pts.push([lerp(a[0], b[0], t2), lerp(a[1], b[1], t2), lerp(a[2], b[2], t2) - 22 * Math.sin(Math.PI * t2)]); } D.polyline3(P, pts, CAM, { w: 0.7, c: K }); for (let k = 2; k < 19; k += 2) { const p = pj(pts[k]); if (!p) continue; const w = R(7, 11), h = R(9, 14), sh = [[p[0] - w / 2, p[1]], [p[0] + w / 2, p[1]], [p[0] + w / 2 + R(-1.5, 1.5), p[1] + h], [p[0] - w / 2 + R(-1, 1), p[1] + h * R(0.85, 1)]]; white(sh); polyL(sh, 0.8); if (k % 4 === 0) P.hatch(sh, { ang: 90, gap: 1.8, a: 0.7, w: 0.4, c: K }); P.dot(p[0] - w / 4, p[1], 0.8, { c: K }); P.dot(p[0] + w / 4, p[1], 0.8, { c: K }); } } }, 300);
      custom([200, -40, Z1 + 260], () => { const a = [-175, 72, Z1 + 300], b = [FX, FY, FZB + FH + 66], pts = []; for (let k = 0; k <= 30; k++) { const t2 = k / 30; pts.push([lerp(a[0], b[0], t2), lerp(a[1], b[1], t2), lerp(a[2], b[2], t2) - 60 * Math.sin(Math.PI * t2)]); } D.polyline3(P, pts, CAM, { w: 0.7, c: K }); for (let k = 1; k < 30; k++) { const p = pj(pts[k]); if (!p) continue; const f = [[p[0] - 3.5, p[1]], [p[0] + 3.5, p[1]], [p[0], p[1] + 8]]; if (k % 3 === 0) black(f); else { white(f); polyL(f, 0.7); } } }, 500); }

    // a railing along the front walkway, and a launch pontoon at the foot of the chute
    custom([-60, DY0, Z1 + 10], () => { for (let x = DX0 + 4; x < DX1; x += 10) { const a = pj([x, DY0 + 2, Z1]), b = pj([x, DY0 + 2, Z1 + 13]); P.line(a[0], a[1], b[0], b[1], { w: 0.7, c: K, passes: 1, over: 0 }); } D.polyline3(P, [[DX0 + 4, DY0 + 2, Z1 + 13], [DX1, DY0 + 2, Z1 + 13]], CAM, { w: 1, c: K }); D.polyline3(P, [[DX0 + 4, DY0 + 2, Z1 + 7], [DX1, DY0 + 2, Z1 + 7]], CAM, { w: 0.5, c: K }); }, 60);
    { const pt = box(560, -250, 0, 620, -215, 7); add(pt); face(pt, 0, -1, 0).deco = () => { const pr = planeProj([560, -250.5, 0], [1, 0, 0], [0, 0, 1]); black(rectUV(pr, 0, 0, 60, 7)); for (let u = 4; u < 60; u += 8) lineUV(pr, u, 1, u, 6, 0.6, Wh); }; }
    P.section('3d');
    D.render(P, faces, CAM, { ink: K, paper: Wh, light: LGT, ambient: 0.04, w: 1.4, rough: 0.3, zw: 0, hatchMin: 0.06, rich: true, darken: 1.5, gap: 3.4, style: 'mixed', silhouette: true });

    /* ================= after the 3D: the eye, the mouth, the spout, foam ================= */
    P.section('whale-face');
    { const ex = 385, ez = 34, e = pj([ex, wSide(ex, ez) - 1, ez]); const eo = Array.from({ length: 18 }, (_, q) => [e[0] + Math.cos(q * TAU / 18) * 12, e[1] + Math.sin(q * TAU / 18) * 7.5]); white(eo); polyL(eo, 1.6); black(Array.from({ length: 14 }, (_, q) => [e[0] + 3 + Math.cos(q * TAU / 14) * 5, e[1] + 0.5 + Math.sin(q * TAU / 14) * 5])); P.dot(e[0] + 1.5, e[1] - 1.5, 1.4, { c: Wh });
      P.arc(e[0], e[1] + 1, 17, 11, Math.PI * 1.05, Math.PI * 1.95, { w: 1.4, c: K, passes: 1 }); P.arc(e[0], e[1] + 3, 21, 14, Math.PI * 1.15, Math.PI * 1.85, { w: 0.7, c: K, passes: 1 }); P.arc(e[0], e[1] - 1, 18, 12, Math.PI * 0.15, Math.PI * 0.85, { w: 0.8, c: K, passes: 1 });
      const mp = []; for (let x = 552; x > 352; x -= 6) { const z = 6 + (552 - x) * 0.075 - Math.pow(Math.max(0, 395 - x) / 22, 2) * 3; mp.push(pj([x, wSide(x, Math.max(2, z)) - 1, Math.max(2, z)])); } P.path(mp.map(([x, y]) => [x, y - 2]), { w: 0.7, c: Wh, passes: 1, rough: 0.2 }); P.path(mp, { w: 2.4, c: K, passes: 1, rough: 0.2 }); P.path(mp.map(([x, y]) => [x, y + 2.6]), { w: 1.3, c: Wh, passes: 1, rough: 0.2 });
      const bh = pj([450, 0, wTop(450) + 1]); P.ellipse(bh[0], bh[1], 7, 2.5, { w: 1.2, c: K, passes: 1 });
      for (let k = 0; k < 8; k++) lump(bh[0] + Math.sin(k * 1.7) * 2 - k * 0.8, bh[1] - 8 - k * 11, 3.5 + k * 0.5, { rows: 1 }); const top = [bh[0] - 8, bh[1] - 100]; for (let k = 0; k < 13; k++) { const a = Math.PI + k * Math.PI / 12, rr = 26 + (k % 3) * 6; lump(top[0] + Math.cos(a) * rr * 1.2, top[1] + Math.sin(a) * rr * 0.55 + Math.pow(Math.cos(a), 2) * 22, R(5, 9), { rows: 2 }); } lump(top[0], top[1] - 6, 11, { rows: 2 }); lump(top[0] - 10, top[1] + 6, 9, { rows: 2 }); lump(top[0] + 10, top[1] + 4, 8, { rows: 2 }); for (let k = 0; k < 18; k++) { const a = -Math.PI / 2 + R(-1.3, 1.3), d = R(30, 90); P.dot(bh[0] - 20 + Math.cos(a) * d * 0.7, bh[1] - 120 + Math.sin(a) * d * 0.4 + d * 0.7, R(0.8, 1.8), { c: K }); } }
    P.section('figures');
    { const fig = (x, y, z, pose) => { const f = pj([x, y, z]), h = pj([x, y, z + 15]); if (!f || !h) return; const H = f[1] - h[1]; P.circle(h[0], h[1] + H * 0.08, H * 0.11, { w: 0.9, c: K, passes: 1 }); P.line(h[0], h[1] + H * 0.2, f[0], f[1] - H * 0.42, { w: 1.1, c: K, passes: 1, over: 0 }); P.line(f[0], f[1] - H * 0.42, f[0] - H * 0.13, f[1], { w: 0.9, c: K, passes: 1, over: 0 }); P.line(f[0], f[1] - H * 0.42, f[0] + H * 0.13, f[1], { w: 0.9, c: K, passes: 1, over: 0 });
        const sh = [h[0], h[1] + H * 0.3]; if (pose === 'wave') { P.line(sh[0], sh[1], sh[0] - H * 0.22, sh[1] - H * 0.3, { w: 0.8, c: K, passes: 1, over: 0 }); P.line(sh[0], sh[1], sh[0] + H * 0.25, sh[1] - H * 0.32, { w: 0.8, c: K, passes: 1, over: 0 }); } else if (pose === 'flag') { P.line(sh[0], sh[1], sh[0] + H * 0.2, sh[1] - H * 0.1, { w: 0.8, c: K, passes: 1, over: 0 }); P.line(sh[0] + H * 0.2, sh[1] + H * 0.1, sh[0] + H * 0.2, sh[1] - H * 0.7, { w: 0.7, c: K, passes: 1, over: 0 }); const fl = [[sh[0] + H * 0.2, sh[1] - H * 0.7], [sh[0] + H * 0.6, sh[1] - H * 0.6], [sh[0] + H * 0.2, sh[1] - H * 0.48]]; black(fl); } else if (pose === 'carry') { const bx = [[sh[0] + H * 0.05, sh[1] - H * 0.1], [sh[0] + H * 0.4, sh[1] - H * 0.1], [sh[0] + H * 0.4, sh[1] + H * 0.15], [sh[0] + H * 0.05, sh[1] + H * 0.15]]; white(bx); polyL(bx, 0.7); } else { P.line(sh[0], sh[1], sh[0] - H * 0.12, sh[1] + H * 0.28, { w: 0.8, c: K, passes: 1, over: 0 }); P.line(sh[0], sh[1], sh[0] + H * 0.12, sh[1] + H * 0.28, { w: 0.8, c: K, passes: 1, over: 0 }); } };
      [[-300, 'stand'], [-262, 'carry'], [-221, 'stand'], [-180, 'wave'], [-136, 'carry'], [-104, 'stand'], [-80, 'wave']].forEach(([x, p2]) => fig(x, -105, Z1, p2));
      [[572, 'flag'], [588, 'wave'], [604, 'stand']].forEach(([x, p2]) => fig(x, -232, 7, p2));
      fig(DX1 - 6, -20, Z1, 'wave'); fig(DX1 - 8, 30, Z1, 'stand'); }
    P.section('foam');
    { for (let x = WX0 + 270; x < WX1 - 4;) { const n = Math.floor(R(2, 6)); for (let m = 0; m < n; m++) { const xx = x + m * R(8, 13), p = pj([xx, wSide(xx, 0) - R(2, 8), 0]); if (!p) continue; lump(p[0], p[1] + R(-2, 3) - (m % 2) * 4, R(3, 8) * (m === 1 ? 1.4 : 1), { rows: 2, sq: 0.7, w: 1 }); } x += n * 11 + R(25, 70); }
      const tp = pj([-420, -40, 0]); for (let k = 0; k < 8; k++) lump(tp[0] + R(-46, 40), tp[1] + R(-6, 8), R(4, 9), { rows: 2, sq: 0.7, w: 1 });
      for (let k = 0; k < 14; k++) { const t2 = R(0.1, 0.9), p = pj([path[0][0] - 100, lerp(-160, 160, t2), path[0][2] + 90]); if (!p) continue; for (let m = 0; m < 4; m++) P.dot(p[0] + R(-2, 2), p[1] + 10 + m * R(7, 14), R(0.7, 1.6), { c: K }); } }

    /* ================= THE PRODUCT: one paper boat ================= */
    P.section('boat');
    { const b = pj([650, -262, 0]), s2 = 19;
      for (let m = 1; m <= 4; m++) P.ellipse(b[0] + 2, b[1] + 3, s2 * (1.3 + m * 0.55), s2 * (0.22 + m * 0.11), { w: 0.8 - m * 0.12, c: K, passes: 1 });
      const hullL = [[b[0] - s2 * 1.6, b[1] - s2 * 0.55], [b[0] - s2 * 0.15, b[1] - s2 * 0.4], [b[0] - s2 * 0.1, b[1] + s2 * 0.25], [b[0] - s2 * 1.05, b[1] + s2 * 0.2]], hullR = [[b[0] - s2 * 0.15, b[1] - s2 * 0.4], [b[0] + s2 * 1.5, b[1] - s2 * 0.62], [b[0] + s2 * 1.0, b[1] + s2 * 0.22], [b[0] - s2 * 0.1, b[1] + s2 * 0.25]];
      const sail = [[b[0] - s2 * 0.75, b[1] - s2 * 0.48], [b[0] - s2 * 0.05, b[1] - s2 * 1.75], [b[0] + s2 * 0.7, b[1] - s2 * 0.5]], sailS = [[b[0] - s2 * 0.05, b[1] - s2 * 1.75], [b[0] + s2 * 0.7, b[1] - s2 * 0.5], [b[0] + s2 * 0.15, b[1] - s2 * 0.45]];
      [hullL, hullR, sail].forEach(q => white(q)); P.hatch(hullR, { ang: 70, gap: 1.6, c: K, a: 0.85, w: 0.45 }); P.hatch(sailS, { ang: 80, gap: 1.7, c: K, a: 0.8, w: 0.45 });
      [hullL, hullR, sail].forEach(q => polyL(q, 1.3)); P.line(sailS[0][0], sailS[0][1], sailS[2][0], sailS[2][1], { w: 0.7, c: K, passes: 1, over: 0 });
      for (let k = 0; k < 7; k++) P.line(b[0] - s2 * 1.1 + k * 4.2, b[1] + s2 * 0.4 + (k % 2) * 2, b[0] - s2 * 1.1 + k * 4.2 + R(-1, 1), b[1] + s2 * 0.4 + R(6, 14), { w: 0.6, c: K, passes: 1, over: 0 });
      const mt = [b[0] - s2 * 0.05, b[1] - s2 * 1.75]; P.line(mt[0], mt[1], mt[0], mt[1] - 18, { w: 0.9, c: K, passes: 1, over: 0 }); const pn = [[mt[0], mt[1] - 18], [mt[0] + 14, mt[1] - 15], [mt[0], mt[1] - 12]]; P.wash(pn, RED, 0.9, { edge: 0, jit: 0, steps: 1 }); polyL(pn, 0.7);
      P.note('THE PRODUCT', 1330, 420, b[0] + 10, b[1] - 34, { from: 'auto', size: 10, lw: 0.8 }); P.text('(ONE PER DAY, ACTUAL SIZE)', 1330, 437, { size: 6.5, fine: true }); }

    /* ================= SMOKE: every stack sends a rope of white puffs off to the left ================= */
    P.section('smoke');
    stacks.forEach(([x, y, r, h], i) => { const t = pj([x, y, Z1 + h + 12]); if (!t) return;
      if (i === 0) { const pts = [t]; for (let k = 1; k <= 5; k++) pts.push([t[0] - 300 * k / 5, Math.max(80, t[1] - 34 * Math.sin(k * 0.6))]); puffRope(pts, 7, 15, 13); const c = pts[5]; for (let k = 0; k < 12; k++) { const a = R(0, TAU), d = R(0, 1); lump(c[0] - 50 + Math.cos(a) * d * 55, c[1] + Math.sin(a) * d * 22, R(11, 20), { double: true }); } }
      else { const n = [0, 7, 4, 6][i], L = [0, 170, 70, 140][i], pts = [t]; for (let k = 1; k <= 3; k++) pts.push([t[0] - L * k / 3 - k * 6, t[1] - 22 * k - k * k * 2]); puffRope(pts, 4, 9 + r * 0.3, n); } });

    /* ================= SATELLITES: a lighthouse on its own scrap of sea, a tethered balloon, gulls, a cloud bank ================= */
    P.section('satellites');
    { const ox = 1395, oy = 210, w2 = 120; const top = [[ox - w2, oy], [ox + w2 * 0.6, oy - 26], [ox + w2, oy + 4], [ox - w2 * 0.6, oy + 30]]; white(top); polyL(top, 1); for (let k = 1; k < 7; k++) { const t2 = k / 7; P.line(lerp(top[0][0], top[3][0], t2) + 10, lerp(top[0][1], top[3][1], t2), lerp(top[1][0], top[2][0], t2) - 10, lerp(top[1][1], top[2][1], t2), { w: 0.45, c: K, passes: 1, over: 0, a: 0.8 }); }
      const fr = [top[0], top[3], [top[3][0], top[3][1] + 28], [top[0][0], top[0][1] + 28]], sd = [top[3], top[2], [top[2][0], top[2][1] + 28], [top[3][0], top[3][1] + 28]]; P.hatch(fr, { ang: 90, gap: 1.5, c: K, a: 0.8, w: 0.5 }); P.hatch(sd, { ang: 90, gap: 2.4, c: K, a: 0.8, w: 0.45 }); polyL(fr, 1); polyL(sd, 1); 
      for (let k = 0; k < 7; k++) lump(ox - 30 + k * 10 + R(-6, 6), oy - 6 - (k % 3) * 8, R(8, 15), { rows: 2 });
      const lx = ox - 10, ly = oy - 26, lh = 120; const tw = [[lx - 12, ly], [lx + 12, ly], [lx + 7, ly - lh], [lx - 7, ly - lh]]; white(tw); P.hatch([[lx + 2, ly], [lx + 12, ly], [lx + 7, ly - lh], [lx + 1, ly - lh]], { ang: 90, gap: 1.6, c: K, a: 0.8, w: 0.45 }); for (let k = 1; k < 5; k++) { const t2 = k / 5; const yy = ly - lh * t2; if (k % 2) P.hatch([[lx - 12 + 5 * t2, yy], [lx + 12 - 5 * t2, yy], [lx + 12 - 5 * (t2 + 0.1), yy - lh * 0.1], [lx - 12 + 5 * (t2 + 0.1), yy - lh * 0.1]], { ang: 0, gap: 1.4, c: K, a: 0.9, w: 0.5 }); } polyL(tw, 1.1);
      const lr = [[lx - 9, ly - lh], [lx + 9, ly - lh], [lx + 9, ly - lh - 14], [lx - 9, ly - lh - 14]]; white(lr); polyL(lr, 1); for (let k = 1; k < 3; k++) P.line(lx - 9 + k * 6, ly - lh, lx - 9 + k * 6, ly - lh - 14, { w: 0.5, c: K, passes: 1, over: 0 }); black([[lx - 12, ly - lh - 14], [lx + 12, ly - lh - 14], [lx, ly - lh - 28]]); P.line(lx - 16, ly - lh, lx + 16, ly - lh, { w: 1, c: K, passes: 1, over: 0 });
      for (let k = 0; k < 5; k++) { const a = Math.PI + 0.12 + k * 0.07; P.line(lx - 10, ly - lh - 7, lx + Math.cos(a) * 140, ly - lh - 7 + Math.sin(a) * 40 + k * 4, { w: 0.4, c: K, a: 0.6, passes: 1, over: 0 }); }
      P.text('THE LIGHT THAT GUIDES IT HOME', ox, oy + 80, { size: 6.5, align: 'center', fine: true }); }
    { const bx = 250, by = 120, br = 34; const bb = Array.from({ length: 28 }, (_, q) => [bx + Math.cos(q * TAU / 28) * br, by + Math.sin(q * TAU / 28) * br * 1.1]); white(bb); for (let k = -3; k <= 3; k++) P.path(Array.from({ length: 15 }, (_, q) => { const a = -Math.PI / 2 + Math.PI * q / 14; return [bx + Math.sin(k * 0.42) * Math.cos(a) * br, by + Math.sin(a) * br * 1.1]; }), { w: 0.6, c: K, passes: 1, rough: 0.2 });
      P.hatch(bb, { ang: 90, gap: 1.8, c: K, a: 0.8, w: 0.45, fade: (x) => Math.max(0, (x - bx + 4) / br) }); polyL(bb, 1.3);
      const bk = [[bx - 10, by + 60], [bx + 10, by + 60], [bx + 8, by + 72], [bx - 8, by + 72]]; [[-14, -10], [14, 10]].forEach(([a, c2]) => P.line(bx + a, by + br * 0.95, bx + c2 * 0.7, by + 60, { w: 0.6, c: K, passes: 1, over: 0 })); white(bk); P.hatch(bk, { ang: 0, gap: 1.6, c: K, a: 0.8, w: 0.45 }); polyL(bk, 1);
      const anc = pj([-325, -20, Z1 + 170]); P.curve([[bx, by + 72], [lerp(bx, anc[0], 0.5) - 10, lerp(by + 72, anc[1], 0.5) + 30], [anc[0], anc[1]]], { w: 0.6, c: K, passes: 1, rough: 0.2 }); }
    for (let k = 0; k < 18; k++) { const x = R(80, 1540), y = R(30, 330); if (x > 520 && x < 1150 && y > 60) continue; const s2 = R(3.5, 8); P.curve([[x - s2, y], [x - s2 * 0.4, y - s2 * 0.6], [x, y]], { w: 1, c: K, passes: 1, rough: 0.1 }); P.curve([[x, y], [x + s2 * 0.4, y - s2 * 0.6], [x + s2, y]], { w: 1, c: K, passes: 1, rough: 0.1 }); }
    { const x0 = 40, y0 = 640, w = 150, h = 40, n = 9; for (let row = 0; row < 3; row++) for (let k = 0; k < n; k++) { const t2 = (k + R(-0.3, 0.3)) / (n - 1), bell = Math.sin(Math.PI * Math.min(1, Math.max(0, t2))), r = (7 + 16 * bell) * (1 - row * 0.22) * R(0.8, 1.15), x = x0 + t2 * w, y = y0 - bell * h * (1 - row * 0.4) + row * 15 + r * 0.3; if (bell < 0.15 && row === 0) continue; lump(x, Math.min(y, y0 - r * 0.5 + row * 15), r, { rows: 3, double: true }); } P.line(x0 - 6, y0 + 34, x0 + w + 6, y0 + 34, { w: 1.1, c: K, passes: 1, over: 0 }); for (let k = 1; k < 4; k++) P.line(x0 + w * R(0.05, 0.3), y0 + 34 + k * 5, x0 + w * R(0.6, 0.95), y0 + 34 + k * 5, { w: 0.5, c: K, passes: 1, over: 0 }); }

    { // a bell buoy on its own scrap of sea, lower left
      const ox = 115, oy = 345, w2 = 64; const top = [[ox - w2, oy], [ox + w2 * 0.55, oy - 16], [ox + w2, oy + 4], [ox - w2 * 0.55, oy + 20]]; white(top); polyL(top, 1); for (let k = 1; k < 5; k++) { const t2 = k / 5; P.line(lerp(top[0][0], top[3][0], t2) + 8, lerp(top[0][1], top[3][1], t2), lerp(top[1][0], top[2][0], t2) - 8, lerp(top[1][1], top[2][1], t2), { w: 0.45, c: K, passes: 1, over: 0, a: 0.8 }); }
      const fr = [top[0], top[3], [top[3][0], top[3][1] + 18], [top[0][0], top[0][1] + 18]], sd = [top[3], top[2], [top[2][0], top[2][1] + 18], [top[3][0], top[3][1] + 18]]; P.hatch(fr, { ang: 90, gap: 1.5, c: K, a: 0.8, w: 0.5 }); P.hatch(sd, { ang: 90, gap: 2.4, c: K, a: 0.8, w: 0.45 }); polyL(fr, 1); polyL(sd, 1);
      const bx = ox, by = oy + 4; P.ellipse(bx, by, 16, 5, { w: 1, c: K, passes: 1 }); const fl = [[bx - 14, by], [bx + 14, by], [bx + 6, by - 30], [bx - 6, by - 30]]; white(fl); P.hatch(fl, { ang: 90, gap: 1.6, c: K, a: 0.85, w: 0.5, fade: (x) => Math.max(0, (x - bx + 2) / 12) }); for (let k = 0; k < 3; k++) P.line(bx - 13 + k * 2.5, by - 6 - k * 8, bx + 13 - k * 2.5, by - 6 - k * 8, { w: 0.8, c: K, passes: 1, over: 0 }); polyL(fl, 1.1);
      const bell = [[bx - 7, by - 34], [bx + 7, by - 34], [bx + 5, by - 46], [bx, by - 50], [bx - 5, by - 46]]; black(bell); P.line(bx, by - 50, bx, by - 64, { w: 1, c: K, passes: 1, over: 0 }); P.dot(bx, by - 66, 2.4, { c: K }); for (let k = 0; k < 3; k++) P.arc(bx, by - 42, 12 + k * 6, 10 + k * 5, -0.6, 0.6, { w: 0.6, c: K, passes: 1 }); P.text('DONG', bx + 34, by - 46, { size: 6.5, fine: true });
      for (let m = 1; m <= 3; m++) P.ellipse(bx, by + 2, 16 + m * 9, 5 + m * 3, { w: 0.6, c: K, passes: 1 }); }
    { // a small cloud bank near the top
      const x0 = 1020, y0 = 120, w = 110, h = 28, n = 7; for (let row = 0; row < 2; row++) for (let k = 0; k < n; k++) { const t2 = (k + R(-0.3, 0.3)) / (n - 1), bell = Math.sin(Math.PI * Math.min(1, Math.max(0, t2))), r = (6 + 12 * bell) * (1 - row * 0.22) * R(0.8, 1.15), x = x0 + t2 * w, y = y0 - bell * h * (1 - row * 0.4) + row * 13 + r * 0.3; if (bell < 0.15 && row === 0) continue; lump(x, Math.min(y, y0 - r * 0.5 + row * 13), r, { rows: 2, double: true }); } P.line(x0 - 6, y0 + 24, x0 + w + 6, y0 + 24, { w: 1, c: K, passes: 1, over: 0 }); for (let k = 1; k < 3; k++) P.line(x0 + w * R(0.05, 0.3), y0 + 24 + k * 5, x0 + w * R(0.6, 0.95), y0 + 24 + k * 5, { w: 0.5, c: K, passes: 1, over: 0 }); }
    { // the output ledger, pinned up in the empty corner
      const x0 = 1330, y0 = 620, w = 205, h = 120, rows = [['PULP', '9 000 T'], ['STEAM', '41 000 T'], ['SMOKE', 'PLENTY'], ['WHALE HOURS', '8 760'], ['BOATS', '1']];
      const fr = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]]; white(fr); P.rect(x0, y0, w, h, { w: 1.3, c: K, rough: 0.3, passes: 1 }); P.rect(x0 + 4, y0 + 4, w - 8, h - 8, { w: 0.5, c: K, rough: 0.2, passes: 1 });
      P.text('ANNUAL OUTPUT', x0 + w / 2, y0 + 22, { size: 10, align: 'center' }); P.line(x0 + 14, y0 + 30, x0 + w - 14, y0 + 30, { w: 0.6, c: K, passes: 1, over: 0 });
      rows.forEach(([a, b], i) => { const y = y0 + 48 + i * 15; P.text(a, x0 + 14, y, { size: 7, fine: true }); P.text(b, x0 + w - 14, y, { size: 7, fine: true, align: 'right', c: i === 4 ? RED : K }); const ds = []; for (let x = x0 + 18 + P.measure(a, 7); x < x0 + w - 20 - P.measure(b, 7); x += 4) ds.push([x, y - 1, 0.5]); P.dots(ds, K, 0.8); });
      P.line(x0 + w / 2, y0 - 26, x0 + w / 2, y0, { w: 0.6, c: K, passes: 1, over: 0 }); P.dot(x0 + w / 2, y0 - 27, 2, { c: K }); }
    /* ================= the strip along the bottom: three panels ================= */
    P.section('strip');
    { const Y0 = 800, Y1 = 962, pan = [[60, 520], [536, 1060], [1076, 1540]];
      const hand = (txt, x, y, sz, o = {}) => P.text(txt, x, y, Object.assign({ size: sz, c: K, font: S.HAND }, o));
      P.line(40, Y0 - 14, 1560, Y0 - 14, { w: 1.2, c: K, passes: 1, over: 0, rough: 0.6 });
      pan.forEach(([x0, x1]) => P.rect(x0, Y0, x1 - x0, Y1 - Y0, { w: 2, c: K, rough: 0.35, over: 0.5, passes: 1 }));
      // 1: the whale's eye, enormous, a little tired
      { const [x0] = pan[0], cx = x0 + 120, cy = Y0 + 84; const skin = [[x0 + 2, Y0 + 2], [x0 + 260, Y0 + 2], [x0 + 230, Y1 - 2], [x0 + 2, Y1 - 2]];
        P.hatch(skin, { ang: 8, gap: 2.2, c: K, a: 0.9, w: 0.7 }); for (let k = 0; k < 14; k++) { const x = R(x0 + 10, x0 + 230), y = R(Y0 + 10, Y1 - 10); if (Math.hypot(x - cx, y - cy) < 56) continue; const r = R(3, 8); const e = Array.from({ length: 10 }, (_, q) => [x + Math.cos(q * TAU / 10) * r, y + Math.sin(q * TAU / 10) * r * 0.8]); white(e); polyL(e, 0.8); P.dot(x, y, 1, { c: K }); }
        const eo = Array.from({ length: 30 }, (_, q) => [cx + Math.cos(q * TAU / 30) * 46, cy + Math.sin(q * TAU / 30) * 28]); white(eo); polyL(eo, 2); black(Array.from({ length: 24 }, (_, q) => [cx + 8 + Math.cos(q * TAU / 24) * 20, cy + 4 + Math.sin(q * TAU / 24) * 20])); white(Array.from({ length: 10 }, (_, q) => [cx + 2 + Math.cos(q * TAU / 10) * 4, cy - 4 + Math.sin(q * TAU / 10) * 4]));
        const lid = Array.from({ length: 20 }, (_, q) => [cx + Math.cos(Math.PI + q * Math.PI / 19) * 50, cy + 2 + Math.sin(Math.PI + q * Math.PI / 19) * 33]); const lidLo = lid.map(([x, y]) => [x, y + (Math.abs(x - cx) < 50 ? 14 * Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / 50, 2))) : 0)]); const lidB = lid.concat(lidLo.slice().reverse()); white(lidB); P.hatch(lidB, { ang: 10, gap: 1.7, c: K, a: 0.85, w: 0.5 }); P.path(lid, { w: 2, c: K, passes: 1 }); P.path(lidLo, { w: 1.6, c: K, passes: 1 });
        for (let k = 0; k < 4; k++) P.arc(cx, cy + 6, 60 + k * 7, 40 + k * 6, Math.PI * 0.2, Math.PI * 0.8, { w: 0.8, c: K, passes: 1 });
        hand('ALL THIS', x0 + 288, Y0 + 62, 24); hand('WHALE...', x0 + 288, Y0 + 98, 24); }
      // 2: all this factory
      { const [x0] = pan[1]; { const d2 = []; for (let i = 0; i < 900; i++) d2.push([R(x0 + 4, x0 + 380), R(Y0 + 4, Y1 - 4), 0.55]); P.dots(d2, K, 0.6); }
        const gear = (cx, cy, r, n) => { const pts = []; for (let k = 0; k < n * 4; k++) { const a = k * TAU / (n * 4), rr = (k % 4 < 2) ? r : r * 0.82; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } white(pts); polyL(pts, 1.2); P.circle(cx, cy, r * 0.25, { w: 1, c: K, passes: 1 }); black(Array.from({ length: 10 }, (_, q) => [cx + Math.cos(q * TAU / 10) * r * 0.12, cy + Math.sin(q * TAU / 10) * r * 0.12])); for (let k = 0; k < 6; k++) { const a = k * TAU / 6; P.line(cx + Math.cos(a) * r * 0.3, cy + Math.sin(a) * r * 0.3, cx + Math.cos(a) * r * 0.7, cy + Math.sin(a) * r * 0.7, { w: 0.8, c: K, passes: 1, over: 0 }); } };
        [[x0 + 70, Y0 + 100, 44, 12], [x0 + 140, Y0 + 52, 30, 9], [x0 + 190, Y0 + 118, 26, 8], [x0 + 260, Y0 + 70, 36, 10]].forEach(a => gear(...a));
        for (let k = 0; k < 4; k++) { const x = x0 + 270 + k * 28, h = 50 + k * 12; const st = [[x, Y1 - 4], [x + 16, Y1 - 4], [x + 14, Y1 - 4 - h], [x + 2, Y1 - 4 - h]]; white(st); P.hatch(st, { ang: 90, gap: 1.6, c: K, a: 0.85, w: 0.5, fade: (px) => Math.max(0, (px - x - 4) / 12) }); polyL(st, 1.2); for (let m = 0; m < 3; m++) lump(x + 8 - m * 14 + R(-3, 3), Y1 - 14 - h - m * 14, 7 + m * 2.5, { rows: 2 }); }
        hand('ALL THIS', x0 + 400, Y0 + 70, 20); hand('FACTORY...', x0 + 400, Y0 + 102, 20); }
      // 3: one paper boat
      { const [x0, x1] = pan[2], cx = x1 - 140, cy = Y1 - 50, s2 = 22;
        for (let k = 0; k < 7; k++) P.line(x0 + 10 + R(0, 40), cy + 10 + k * 7, x1 - 10 - R(0, 40), cy + 10 + k * 7, { w: 0.5, c: K, passes: 1, over: 0 });
        const hullL = [[cx - s2 * 1.6, cy - s2 * 0.55], [cx - s2 * 0.15, cy - s2 * 0.4], [cx - s2 * 0.1, cy + s2 * 0.25], [cx - s2 * 1.05, cy + s2 * 0.2]], hullR = [[cx - s2 * 0.15, cy - s2 * 0.4], [cx + s2 * 1.5, cy - s2 * 0.62], [cx + s2 * 1.0, cy + s2 * 0.22], [cx - s2 * 0.1, cy + s2 * 0.25]], sail = [[cx - s2 * 0.75, cy - s2 * 0.48], [cx - s2 * 0.05, cy - s2 * 1.75], [cx + s2 * 0.7, cy - s2 * 0.5]];
        [hullL, hullR, sail].forEach(q => white(q)); P.hatch(hullR, { ang: 70, gap: 1.8, c: K, a: 0.85, w: 0.5 }); [hullL, hullR, sail].forEach(q => polyL(q, 1.5));
        const mt = [cx - s2 * 0.05, cy - s2 * 1.75]; P.line(mt[0], mt[1], mt[0], mt[1] - 22, { w: 1, c: K, passes: 1, over: 0 }); const pn = [[mt[0], mt[1] - 22], [mt[0] + 18, mt[1] - 18], [mt[0], mt[1] - 14]]; P.wash(pn, RED, 0.9, { edge: 0, jit: 0, steps: 1 }); polyL(pn, 0.8);
        hand('ONE', x0 + 26, Y0 + 52, 26); hand('PAPER BOAT.', x0 + 26, Y0 + 90, 26); }
      P.text('THE WHALE WORKS', 1540, 774, { size: 11, align: 'right', a: 0.8 }); }
  }
});
