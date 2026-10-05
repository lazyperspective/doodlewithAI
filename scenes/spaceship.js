/* SHEET 1 — ISV ARGO-7, a lived-in generation ship. Soft-pencil orthographic multi-view (style D)
   + a power/data schematic inset (style C), an orbit construction inset (style B) and scalloped
   steam / exhaust tubes in blue ballpoint (style E). */
(window.SCENES = window.SCENES || []).push({
  name: 'Spaceship', seed: 11, ink: '#34353b', theme: 'pencil',
  build(P, n, t) {
    const S = Sketch, TAU = S.TAU, lerp = S.lerp, HAND = S.HAND, PI = Math.PI;
    const BLUE = '#5f86d8', RED = '#c23b2c', GRN = '#1f7a4d', OCH = '#c58d24', NAVY = '#1c3f94', GRAPH = '#3d3e45';
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const AXe = 184, AXp = 482, CX = 1250, F = 112;

    /* ------------------------------------------------------------- tiny drawing helpers */
    const L = (x1, y1, x2, y2, w = 0.9, a = 0.85, o) => P.line(x1, y1, x2, y2, Object.assign({ w, a, passes: 1, over: 0.3, rough: 0.4 }, o));
    const R = (x, y, w, h, lw = 0.9, a = 0.85, o) => P.rect(x, y, w, h, Object.assign({ w: lw, a, passes: 1, over: 0.3, rough: 0.35 }, o));
    const RR = (x, y, w, h, r, lw = 0.9, a = 0.85, o) => P.rrect(x, y, w, h, r, Object.assign({ w: lw, a, passes: 1, rough: 0.3 }, o));
    const C = (x, y, r, lw = 0.9, a = 0.85, o) => P.circle(x, y, r, Object.assign({ w: lw, a, passes: 1, rough: 0.3 }, o));
    const PL = (pts, lw = 0.9, a = 0.85, o) => P.pl(pts, Object.assign({ w: lw, a, passes: 1, rough: 0.35 }, o));
    const PG = (pts, lw = 0.9, a = 0.85, o) => P.poly(pts, Object.assign({ w: lw, a, passes: 1, rough: 0.35 }, o));
    const CV = (pts, lw = 0.9, a = 0.85, o) => P.curve(pts, Object.assign({ w: lw, a, rough: 0.4 }, o));
    const rect4 = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const rrPoly = (x, y, w, h, r) => {
      const p = [], c = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
      for (const [cx, cy, a0] of c) for (let k = 0; k <= 4; k++) { const a = (a0 + k * 22.5) * PI / 180; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      return p;
    };
    const ring = (cx, cy, r0, r1, k = 40) => { const p = []; for (let a = 0; a <= k; a++) p.push([cx + Math.cos(a * TAU / k) * r1, cy + Math.sin(a * TAU / k) * r1]); for (let a = k; a >= 0; a--) p.push([cx + Math.cos(a * TAU / k) * r0, cy + Math.sin(a * TAU / k) * r0]); return p; };
    const disc = (cx, cy, r, k = 32) => { const p = []; for (let a = 0; a < k; a++) p.push([cx + Math.cos(a * TAU / k) * r, cy + Math.sin(a * TAU / k) * r]); return p; };
    const mirY = (pts, ay) => pts.map(([x, y]) => [x, 2 * ay - y]);
    const smudge = (poly, y0, y1, a0, a1, c) => P.wash(poly, c || GRAPH, Math.max(a0, a1), { edge: 0, jit: 1.2, steps: 4, grad: { x0: 0, y0, x1: 0, y1, c0: c || GRAPH, c1: c || GRAPH, a0, a1 } });
    const smudgeX = (poly, x0, x1, a0, a1, c) => P.wash(poly, c || GRAPH, Math.max(a0, a1), { edge: 0, jit: 1.2, steps: 4, grad: { x0, y0: 0, x1, y1: 0, c0: c || GRAPH, c1: c || GRAPH, a0, a1 } });
    const tint = (poly, c, a, o) => P.wash(poly, c, a, Object.assign({ edge: 0, jit: 0.5, steps: 3 }, o));
    const hat = (poly, ang, gap, a, fade, o) => P.hatch(poly, Object.assign({ ang, gap, a, w: 0.55, fade, piece: 11, inset: 0.6 }, o));
    const rivets = (x0, x1, y, step, a = 0.7, r = 0.7) => { const d = []; for (let x = x0; x <= x1; x += step) d.push([x + P.r(-0.4, 0.4), y + P.r(-0.3, 0.3), r]); P.dots(d, null, a); };
    const rivetsV = (x, y0, y1, step, a = 0.7, r = 0.7) => { const d = []; for (let y = y0; y <= y1; y += step) d.push([x + P.r(-0.3, 0.3), y + P.r(-0.4, 0.4), r]); P.dots(d, null, a); };
    const tx = (s, x, y, size = 11, o) => P.text(s, x, y, Object.assign({ size, a: 0.8 }, o));
    const hw = (s, x, y, size = 15, o) => P.label(s, x, y, Object.assign({ size, a: 0.85 }, o));
    const cross = (x, y, s, w = 0.7, a = 0.7, c) => { L(x - s, y, x + s, y, w, a, { over: 0, c }); L(x, y - s, x, y + s, w, a, { over: 0, c }); };
    const arrowHead = (x, y, ang, s = 6, w = 0.9, c) => { for (const q of [-1, 1]) L(x, y, x - Math.cos(ang + q * 0.42) * s, y - Math.sin(ang + q * 0.42) * s, w, 0.85, { over: 0, c, rough: 0.2 }); };
    /* a lettered plate: erase whatever is behind, box it, write */
    const plate = (s, x, y, size, o = {}) => { const w = P.measure(s, size) + 8, h = size * 0.62 + 7; P.erase(rect4(x - 3, y - h + 3, w + 2, h + 2)); R(x - 4, y - h + 3, w, h, 0.7, 0.75); P.text(s, x, y, { size, a: o.a ?? 0.85, c: o.c }); };

    /* ------------------------------------------------------------- crew, cat, plants, furniture */
    const person = (x, fy, s, pose, d, o = {}) => {
      const w = 0.95, uni = o.uni || '#4b6fb8';
      const head = (hx, hy, r) => {
        P.erase(disc(hx, hy, r + 0.6, 10)); C(hx, hy, r, w, 0.9);
        P.arc(hx, hy, r, r, d > 0 ? PI * 0.7 : PI * 1.3, d > 0 ? PI * 1.8 : PI * 2.4, { w: 1.7, a: 0.9, passes: 1, rough: 0.2 });
      };
      if (pose === 'stand') {
        const sh = fy - 25.5 * s, hip = fy - 14 * s, tor = [[x - 3.3 * s, sh], [x + 3.3 * s, sh], [x + 2.7 * s, hip], [x - 2.7 * s, hip]];
        P.erase(tor); PG(tor, w, 0.9, { rough: 0.2 }); tint(tor, uni, 0.55, { steps: 2, jit: 0.2 });
        L(x - 1.4 * s, hip, x - 3 * s, fy, w, 0.9, { over: 0, rough: 0.2 }); L(x + 1.4 * s, hip, x + 3.5 * s, fy, w, 0.9, { over: 0, rough: 0.2 });
        L(x + 3.5 * s, fy, x + 3.5 * s + d * 3.5 * s, fy, w, 0.9, { over: 0, rough: 0.2 }); L(x - 3 * s, fy, x - 3 * s + d * 3.5 * s, fy, w, 0.9, { over: 0, rough: 0.2 });
        head(x + d * 0.6 * s, fy - 30.2 * s, 3.5 * s);
        const arm = o.arm || 'fwd';
        if (arm === 'up') PL([[x, sh + 1], [x + d * 5 * s, sh - 3 * s], [x + d * 7 * s, sh - 10 * s]], w, 0.9, { over: 0 });
        else if (arm === 'hold') PL([[x, sh + 1], [x + d * 3 * s, sh + 7 * s], [x + d * 8 * s, sh + 5 * s]], w, 0.9, { over: 0 });
        else PL([[x, sh + 1], [x + d * 2 * s, sh + 8 * s], [x + d * 5 * s, sh + 11 * s]], w, 0.9, { over: 0 });
        L(x, sh + 3, x - d * 2 * s, sh + 10 * s, w, 0.8, { over: 0 });
      } else if (pose === 'sit') {
        const hy = fy - 9 * s, sh = fy - 21 * s, tor = [[x - 3.3 * s, sh], [x + 3 * s, sh], [x + 2.6 * s, hy], [x - 3 * s, hy]];
        P.erase(tor); PG(tor, w, 0.9, { rough: 0.2 }); tint(tor, uni, 0.55, { steps: 2, jit: 0.2 });
        PL([[x, hy], [x + d * 9 * s, hy - 0.5 * s], [x + d * 9.5 * s, fy], [x + d * 13 * s, fy]], w, 0.9, { over: 0, rough: 0.2 });
        head(x + d * 0.5 * s, fy - 25.6 * s, 3.5 * s);
        PL([[x, sh + 1], [x + d * 5 * s, sh + 6 * s], [x + d * (o.reach || 11) * s, sh + 5 * s]], w, 0.9, { over: 0 });
      } else if (pose === 'lie') { /* fy = mattress surface, x = pillow end */
        const len = 27 * s;
        RR(x - 1, fy - 3.4 * s, 8 * s, 3.4 * s, 1.4, 0.8, 0.85);
        head(x + 3.4 * s, fy - 6.4 * s, 3.2 * s);
        const bl = [[x + 8 * s, fy], [x + 10 * s, fy - 5.5 * s], [x + 16 * s, fy - 7.3 * s], [x + 22 * s, fy - 5 * s], [x + len, fy - 2 * s], [x + len, fy]];
        P.erase(bl); PG(bl, 0.9, 0.9, { rough: 0.3 }); tint(bl, uni, 0.42, { steps: 2 });
        P.hatch(bl, { ang: 70, gap: 2.4, a: 0.42, w: 0.5, piece: 6 });
        for (let k = 0; k < 3; k++) CV([[x + 11 * s + k * 5 * s, fy - 4.6 * s], [x + 13 * s + k * 5 * s, fy - 2.4 * s], [x + 15 * s + k * 5 * s, fy - 0.6 * s]], 0.5, 0.5);
      }
    };
    const cat = (x, y, s, o = {}) => { /* curled sleeping ship-cat; (x,y) = bottom-centre */
      const body = S.catmull([[x - 9 * s, y - 2 * s], [x - 6 * s, y - 6.5 * s], [x, y - 8 * s], [x + 7 * s, y - 6 * s], [x + 10 * s, y - 2 * s], [x + 6 * s, y], [x - 5 * s, y]], true, 2);
      P.erase(body); P.path(body, { closed: true, w: 1.1, rough: 0.25, a: 0.95 });
      P.hatch(body, { ang: 60, gap: 1.8, a: 0.55, w: 0.5, piece: 5, ragged: 0.6 });
      const hd = [x - 10 * s, y - 5.4 * s];
      C(hd[0], hd[1], 3.6 * s, 1, 0.95, { rough: 0.2 });
      PL([[hd[0] - 3 * s, hd[1] - 2 * s], [hd[0] - 3.2 * s, hd[1] - 6 * s], [hd[0] - 0.4 * s, hd[1] - 3.4 * s]], 0.9, 0.9, { over: 0 });
      PL([[hd[0] + 0.6 * s, hd[1] - 3.4 * s], [hd[0] + 2.8 * s, hd[1] - 6.6 * s], [hd[0] + 3.6 * s, hd[1] - 1.4 * s]], 0.9, 0.9, { over: 0 });
      P.arc(hd[0] - 1.2 * s, hd[1] - 0.2 * s, 1.1 * s, 1 * s, 0.1, PI - 0.1, { w: 0.6, a: 0.9, passes: 1 }); P.arc(hd[0] + 1.6 * s, hd[1] - 0.2 * s, 1.1 * s, 1 * s, 0.1, PI - 0.1, { w: 0.6, a: 0.9, passes: 1 });
      CV([[x + 9 * s, y - 2 * s], [x + 11 * s, y + 0.2 * s], [x + 4 * s, y + 1.4 * s], [x - 5 * s, y + 0.8 * s]], 1.1, 0.9, { rough: 0.2 });
      for (let k = 0; k < 4; k++) L(x - 2 * s + k * 3.4 * s, y - 8 * s, x - 1 * s + k * 3.4 * s, y - 5 * s, 0.6, 0.8, { over: 0 });
      if (!o.nozz) { tx('z', x + 10 * s, y - 10 * s, 8 * s + 1, { a: 0.7 }); tx('z', x + 14 * s, y - 15 * s, 6 * s + 1, { a: 0.6 }); }
    };
    const ladder = (x, y0, y1, wd = 8, step = 4.2, lw = 0.8) => { L(x, y0, x, y1, lw, 0.9, { over: 0 }); L(x + wd, y0, x + wd, y1, lw, 0.9, { over: 0 }); for (let y = y0 + 2; y < y1; y += step) L(x, y, x + wd, y, lw * 0.75, 0.8, { over: 0, rough: 0.2 }); };
    const plant = (x, y, h, k = 0) => {
      L(x, y, x + P.r(-1, 1), y - h, 0.7, 0.85, { over: 0, rough: 0.2 });
      const nl = 2 + (k % 3);
      for (let i = 0; i < nl; i++) { const yy = y - h * (0.35 + i * 0.22), dx = (i % 2 ? 1 : -1) * (3.4 + P.r(0, 2.4)); CV([[x, yy], [x + dx * 0.5, yy - 2.6], [x + dx, yy - 1.2]], 0.7, 0.85, { rough: 0.2 }); }
      CV([[x - 2.2, y - h - 0.6], [x, y - h - 3.4], [x + 2.2, y - h - 0.4]], 0.7, 0.85, { rough: 0.2 });
      if (k % 4 === 0) P.dot(x + P.r(-2, 2), y - h * 0.6, 1.5, { c: RED, a: 0.85 });
    };
    const crate = (x, y, w, h, tag, lw = 0.9) => {
      R(x, y, w, h, lw, 0.9); L(x, y, x + w, y + h, 0.45, 0.5, { over: 0, rough: 0.2 }); L(x + w, y, x, y + h, 0.45, 0.4, { over: 0, rough: 0.2 });
      R(x + 1.6, y + 1.6, w - 3.2, h - 3.2, 0.4, 0.4, { rough: 0.2 });
      if (tag && h > 9 && w > 15) { P.erase(rect4(x + w / 2 - P.measure(tag, 8) / 2 - 2, y + h / 2 - 4.4, P.measure(tag, 8) + 4, 8.8)); tx(tag, x + w / 2 - P.measure(tag, 8) / 2, y + h / 2 + 2.6, 8, { a: 0.85 }); }
    };
    const drum = (x, y, w, h) => {
      const b = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; P.erase(b);
      L(x, y, x, y + h, 0.9, 0.9, { over: 0 }); L(x + w, y, x + w, y + h, 0.9, 0.9, { over: 0 });
      P.ellipse(x + w / 2, y, w / 2, 2.4, { w: 0.8, a: 0.9, passes: 1 }); P.arc(x + w / 2, y + h, w / 2, 2.4, 0, PI, { w: 0.9, a: 0.9, passes: 1 });
      P.arc(x + w / 2, y + h * 0.35, w / 2, 2.2, 0, PI, { w: 0.6, a: 0.7, passes: 1 }); P.arc(x + w / 2, y + h * 0.7, w / 2, 2.2, 0, PI, { w: 0.6, a: 0.7, passes: 1 });
      P.hatch(b, { ang: 80, gap: 2.2, a: 0.42, w: 0.5, piece: 6, fade: (px) => (px - x) / w * 0.9 + 0.1 });
    };
    /* a thin scalloped steam wisp used in the galley etc. */
    const wisp = (pts, r0, r1, c) => P.cloudTube(pts, r0, r1, { w: 0.7, c, a: 0.9, shade: false, rib: 2 });
    /* section arrow marker  ⤶  */
    const marker = (x, y, num, dir = 1) => {
      L(x, y - 9, x, y + 9, 1.8, 0.9, { over: 0, rough: 0.2, passes: 1 });
      L(x, y, x - 17, y, 1.2, 0.9, { over: 0, rough: 0.2 }); arrowHead(x - 17, y, PI, 6, 1.1);
      for (let k = 0; k < 3; k++) L(x + 4 + k * 3, y - 3 + k * 0.5, x + 4 + k * 3, y + 3, 0.7, 0.7, { over: 0, rough: 0.1 });
      tx(String(num), x - 6, y + (dir > 0 ? 17 : -8), 11, { a: 0.85 });
    };
    /* pale blue construction box with over-run corners */
    const gbox = (x0, y0, x1, y1, ex = 14, ey = 8) => {
      const o = { c: BLUE, w: 0.9, a: 0.6, rough: 0.7, passes: 1, over: 2 };
      P.line(x0 - ex, y0, x1 + ex, y0, o); P.line(x0 - ex, y1, x1 + ex, y1, o);
      P.line(x0, y0 - ey, x0, y1 + ey, o); P.line(x1, y0 - ey, x1, y1 + ey, o);
    };
    const cl = (x1, y1, x2, y2, dash = [28, 5, 3, 5]) => P.dashed(x1, y1, x2, y2, dash, { w: 0.7, a: 0.55, rough: 0.4 });

    /* ------------------------------------------------------------- sheet frame, guides, title block */
    P.rect(26, 26, 1548, 948, { w: 1.7, a: 0.85, rough: 0.35, over: 2, passes: 1 });
    P.rect(38, 38, 1524, 924, { w: 0.8, a: 0.7, rough: 0.35, over: 2, passes: 1 });
    for (const [x, y, x2, y2] of [[800, 26, 800, 38], [800, 962, 800, 974], [26, 500, 38, 500], [1562, 500, 1574, 500]]) L(x, y, x2, y2, 1.2, 0.85, { over: 0, rough: 0.2 });

    // construction boxes (pale blue) and the extended axes
    gbox(66, 58, 1006, 312); gbox(66, 366, 1006, 598);
    gbox(1096, 58, 1404, 312); gbox(1096, 366, 1404, 598);
    cl(48, AXe, 1016, AXe); cl(48, AXp, 1016, AXp); cl(CX, 50, CX, 320); cl(CX, 358, CX, 606); cl(1084, AXe, 1416, AXe); cl(1084, AXp, 1416, AXp);
    // projection lines (elevation -> plan, elevation -> front, plan -> rear)
    [142, 222, 300, 440, 598, 776, 946, 996].forEach(x => P.guide(x, 60, x, 598, { c: BLUE, a: 0.34, w: 0.6 }));
    [-112, -98, -92, -64, 64, 112].forEach(z => P.guide(1000, AXe + z, 1420, AXe + z, { c: BLUE, a: 0.3, w: 0.6 }));
    [-110, -64, 64, 110].forEach(z => P.guide(1000, AXp + z, 1420, AXp + z, { c: BLUE, a: 0.3, w: 0.6 }));

    /* ------------------------------------------------------------- hull profile */
    const prof = [[222, 57], [262, 61], [300, 63], [330, 64], [780, 64], [830, 61], [872, 52], [910, 40], [946, 27]];
    const profS = S.catmull(prof, false, 4);
    const rTab = {};
    for (let i = 0; i + 1 < profS.length; i++) { const a = profS[i], b = profS[i + 1]; for (let x = Math.ceil(a[0]); x < b[0]; x++) rTab[x] = lerp(a[1], b[1], (x - a[0]) / Math.max(1e-6, b[0] - a[0])); }
    const rAt = x => rTab[clamp(Math.round(x), 222, 945)];
    const hullPoly = ay => profS.map(([x, r]) => [x, ay - r]).concat(profS.slice().reverse().map(([x, r]) => [x, ay + r]));
    const hullE = hullPoly(AXe), hullP = hullPoly(AXp);

    /* ------------------------------------------------------------- main engine bell (used in both views) */
    const bellS = S.catmull([[222, 22], [206, 25], [188, 31], [166, 38], [142, 45]], false, 4);
    const bell = ay => {
      const top = bellS.map(([x, r]) => [x, ay - r]), bot = bellS.map(([x, r]) => [x, ay + r]), poly = top.concat(bot.slice().reverse());
      smudgeX(poly, 222, 142, 0.18, 0.42);
      for (let i = -5; i <= 5; i++) P.path(bellS.map(([x, r]) => [x, ay + r * i / 5.6]), { w: 0.5, a: 0.55, rough: 0.3 });
      hat(poly, 82, 2.6, 0.5, (x, y) => 0.25 + Math.abs(y - ay) / 45 * 0.75, { piece: 9 });
      [206, 188, 170, 154].forEach(x => { const r = rAt2(x); L(x, ay - r, x, ay + r, 0.9, 0.8, { over: 0, rough: 0.2 }); rivetsV(x + 2, ay - r + 3, ay + r - 3, 5, 0.6, 0.6); });
      P.path(top, { w: 1.9, rough: 0.5 }); P.path(bot, { w: 1.9, rough: 0.5 });
      P.ellipse(142, ay, 6, 45, { w: 1.8, rough: 0.4 }); P.ellipse(144.5, ay, 3.6, 40.5, { w: 0.8, a: 0.75, passes: 1 });
      P.hatch(S.catmull([[142, ay - 44], [136, ay], [142, ay + 44], [148, ay]], true, 4), { ang: 75, gap: 1.8, a: 0.7, w: 0.5, piece: 8, inset: 0.2 });
      R(222, ay - 28, 8, 56, 1.3, 0.9); R(230, ay - 25, 3, 50, 0.7, 0.7);
    };
    const rAt2 = x => { let r = 45; for (let i = 0; i + 1 < bellS.length; i++) { const a = bellS[i], b = bellS[i + 1]; if (x >= b[0] && x <= a[0]) r = lerp(b[1], a[1], (x - b[0]) / (a[0] - b[0])); } return r; };
    /* RCS stubs on the aft face */
    const stubs = ay => { for (const s of [-1, 1]) for (const dx of [0]) { const z = ay + s * 51, q = [[222, z - 3.4], [211, z - 6], [211, z + 6], [222, z + 3.4]]; PG(q, 0.9, 0.9, { rough: 0.2 }); tint(q, GRAPH, 0.3, { steps: 2 }); L(211, z, 222, z, 0.5, 0.6, { over: 0 }); } };

    /* =============================================================
       SIDE ELEVATION  (nose to the right, axis y = 184)
       ============================================================= */
    const Z = z => AXe + z;

    // --- radiator fins (dorsal + ventral): drawn first so the hull hides their roots
    const finPoly = (ay, s) => [[296, ay + s * 60], [322, ay + s * F], [408, ay + s * F], [440, ay + s * 62]];
    const fin = (ay, s, tag) => {
      const q = finPoly(ay, s);
      smudge(q, ay + s * 60, ay + s * F, 0.05, 0.28);
      hat(q, s < 0 ? 62 : -62, 3.4, 0.5, (x, y) => 0.3 + 0.5 * Math.abs(y - ay) / 110 + (x > 380 ? 0.25 : 0), { piece: 10, cross: 50 });
      for (let k = 0; k <= 8; k++) { const xb = lerp(304, 434, k / 8), xt = lerp(324, 406, k / 8); L(xb, ay + s * 62, xt, ay + s * (F - 5), 0.7, 0.75, { over: 0, rough: 0.3 }); }
      L(322, ay + s * (F - 5), 408, ay + s * (F - 5), 1.2, 0.85); L(306, ay + s * 78, 430, ay + s * 78, 0.7, 0.7);
      PG(q, 1.8, 0.92, { rough: 0.7, passes: 2 });
      rivets(326, 404, ay + s * (F - 2), 5, 0.6, 0.6);
    };
    fin(AXe, -1); fin(AXe, 1);
    // dorsal-fin decor: name plate, port-of-call stickers, scorch + patch
    plate('ARGO-7', 331, Z(-83), 15);
    [[347, Z(-100), 'S'], [372, Z(-100), 'M'], [397, Z(-100), 'T']].forEach(([x, y, k]) => {
      P.erase(disc(x, y, 8.5, 12)); C(x, y, 7.5, 1, 0.9); C(x, y, 5.6, 0.6, 0.7);
      if (k === 'S') { for (let a = 0; a < 5; a++) { const an = -PI / 2 + a * TAU / 5; L(x, y, x + Math.cos(an) * 4.4, y + Math.sin(an) * 4.4, 0.6, 0.8, { over: 0 }); } }
      if (k === 'M') { P.arc(x, y, 3.6, 3.6, 0.8, 5.5, { w: 0.9, a: 0.85, passes: 1 }); }
      if (k === 'T') { C(x, y, 2.4, 0.7, 0.9); P.ellipse(x, y, 5, 1.4, { w: 0.6, a: 0.85, rot: -0.3, passes: 1 }); }
    });
    { const sc = S.catmull([[380, Z(-72)], [392, Z(-76)], [402, Z(-70)], [398, Z(-66)], [384, Z(-66)]], true, 3); P.hatch(sc, { ang: 30, gap: 1.6, a: 0.6, w: 0.5, piece: 5 }); tint(sc, GRAPH, 0.4, { steps: 3 }); }
    // ventral-fin decor: red hazard stripe near tip, patch, name
    { const band = [[318, Z(104)], [412, Z(104)], [408, Z(112)], [322, Z(112)]]; P.erase(band); tint(band, RED, 0.45, { steps: 3, jit: 0.4 });
      for (let x = 322; x < 410; x += 9) L(x, Z(104), x - 5, Z(112), 0.7, 0.85, { over: 0, rough: 0.2 }); R(318, Z(104), 94, 8, 0.6, 0.6, { rough: 0.2 }); }
    { const px = 348, py = Z(80); P.erase(rect4(px, py, 26, 16)); R(px, py, 26, 16, 1, 0.9); L(px, py, px + 26, py + 16, 0.6, 0.7, { over: 0 }); L(px + 26, py, px, py + 16, 0.6, 0.7, { over: 0 });
      rivets(px + 2, px + 24, py + 2, 4, 0.8); rivets(px + 2, px + 24, py + 14, 4, 0.8); tx('REV C', px + 2, py + 40, 9, { a: 0.7 }); }

    // --- hull: occlude what is behind, outline, shading
    P.erase(hullE);
    bell(AXe); stubs(AXe);
    P.path(hullE, { closed: true, w: 2.3, rough: 0.9, passes: 2 });
    smudge(hullE, AXe - 60, AXe + 64, 0.03, 0.44);
    hat(hullE, -60, 3, 0.58, (x, y) => clamp((y - AXe) / 64 * 0.95 + 0.4, 0, 1), { piece: 11 });
    P.path(profS.map(([x, r]) => [x, AXe + r - 3.5]), { w: 6, a: 0.13, rough: 1.4, passes: 2 }); P.path(profS.map(([x, r]) => [x, AXe + r - 9]), { w: 5, a: 0.07, rough: 1.4, passes: 1 });
    hat(hullE, 28, 3.4, 0.42, (x, y) => clamp((y - AXe - 22) / 38, 0, 1) * 0.9, { piece: 10 });
    for (let k = 0; k < 26; k++) { const y = AXe + P.r(-8, 60); L(P.r(230, 700), y, P.r(700, 940), y + P.r(-2, 2), P.r(4, 8), 0.05, { rough: 1.5, over: 0, c: GRAPH }); }
    // transverse frames (ring seams) + rivet rows
    [226, 262, 300, 322, 430, 440, 578, 598, 776, 796, 914].forEach((x, i) => { const r = rAt(x); L(x, AXe - r + 1, x, AXe + r - 1, i % 3 === 2 ? 1.1 : 0.75, 0.75, { over: 0, rough: 0.3 }); });
    [-61, -49, 49, 61].forEach(z => rivets(232, 906, Z(z) + (z < 0 ? 0.5 : -0.5) * 0, 6, 0.6, 0.6));
    // --- cable run along the belly with clips, and a coolant line along the spine
    { const ys = Z(55), cab = []; for (let x = 232; x <= 906; x += 8) cab.push([x, ys + 1.6 * Math.sin(x / 19) + (x > 800 ? -(x - 800) * 0.055 : 0)]);
      P.path(cab, { w: 1.1, a: 0.85, rough: 0.3 }); P.path(cab.map(([x, y]) => [x, y + 3.2]), { w: 0.8, a: 0.7, rough: 0.3 });
      for (let x = 250; x < 906; x += 46) { L(x, ys - 3, x, ys + 7, 1.2, 0.85, { over: 0, rough: 0.1 }); } }

    // near radiator wing seen edge-on (the cutaway will bite a piece out of it)
    { R(300, AXe - 2.6, 140, 5.2, 1.2, 0.92, { rough: 0.2 }); P.hatch(rect4(300, AXe - 2.6, 140, 5.2), { ang: 30, gap: 1.5, a: 0.6, w: 0.5, piece: 5, inset: 0.1 }); [312, 372, 432].forEach(x => R(x - 3, AXe - 4.4, 6, 8.8, 0.7, 0.9, { rough: 0.1 })); }
    // exhaust plume (style E, blue ballpoint scalloped tube) and RCS puffs
    [[[138, AXe - 26], [116, AXe - 32], [92, AXe - 38], [68, AXe - 36]], [[138, AXe], [112, AXe - 3], [88, AXe + 3], [62, AXe + 9]], [[138, AXe + 26], [116, AXe + 33], [94, AXe + 43], [70, AXe + 52]]].forEach(pp => P.cloudTube(pp, 14, 8, { c: NAVY, w: 1, a: 0.88, rib: 1 }));
    [-1, 1].forEach(sg => P.cloud(931 + 6, AXe + sg * 56, 18, 12, { c: NAVY, lobes: 7, inner: 1, shade: false, r: 3.6, w: 0.8, a: 0.85 }));

    // --- cutaway windows (interior work happens later); exterior details that sit outside windows:
    // vent stacks with steam tubes (style E, blue ballpoint)
    { const vx = 433; R(vx - 3, Z(-76), 6, 12, 0.9, 0.85); L(vx - 5, Z(-77), vx + 5, Z(-77), 1.3, 0.9, { over: 0 }); L(vx - 2, Z(-76), vx - 2, Z(-64), 0.5, 0.6, { over: 0 });
      P.cloudTube([[vx, Z(-80)], [vx + 2, Z(-96)], [vx + 16, Z(-108)], [vx + 42, Z(-112)]], 5, 13, { c: NAVY, w: 0.95, a: 0.85, rib: 1 });
      [470, 560].forEach((x, i) => { R(x - 4, Z(64), 8, 8, 0.9, 0.85); L(x - 6, Z(72), x + 6, Z(72), 1.3, 0.9, { over: 0 });
        P.cloudTube([[x, Z(75)], [x + (i ? -2 : 2), Z(90)], [x + (i ? 16 : 14), Z(102)], [x + (i ? 44 : 42), Z(108)]], 4.5, 12, { c: NAVY, w: 0.95, a: 0.85, rib: 1 }); }); }


    /* ---- cutaway machinery ---- */
    const ringPoly = (outer, inner) => outer.concat([outer[0]], [inner[0]], inner.slice().reverse());
    const shrink = (poly, k) => { let cx = 0, cy = 0; poly.forEach(p => { cx += p[0]; cy += p[1]; }); cx /= poly.length; cy /= poly.length; return poly.map(p => [cx + (p[0] - cx) * k, cy + (p[1] - cy) * k]); };
    const cutWin = (outer, inner, a = 0.42) => {
      P.erase(outer);
      tint(inner, '#e6d7ac', a, { steps: 2, jit: 0.3 });
      P.hatch(ringPoly(outer, inner), { ang: 45, gap: 1.7, a: 0.75, w: 0.55, piece: 6, inset: 0.1, ragged: 0.3 });
      P.path(outer, { closed: true, w: 1.8, rough: 0.4, passes: 1 }); P.path(inner, { closed: true, w: 0.8, a: 0.7, rough: 0.3, passes: 1 });
    };
    const rectWin = (x, y, w, h, r = 6) => { const o = rrPoly(x, y, w, h, r), i = rrPoly(x + 3, y + 3, w - 6, h - 6, Math.max(2, r - 2)); cutWin(o, i); return i; };
    const slab = (x, y, w, h, a = 0.75) => { R(x, y, w, h, 0.9, 0.9, { rough: 0.2 }); P.hatch(rect4(x, y, w, h), { ang: 45, gap: 1.8, a, w: 0.5, piece: 6, inset: 0.2, ragged: 0.3 }); };

    /* ---- exterior ornaments that live on the shell (drawn before the windows cut into it) ---- */
    // comms mast + yagi arms + dish + whip
    { const mx = 520; L(mx, Z(-64), mx, Z(-110), 1.3, 0.9, { over: 0 }); L(mx - 3, Z(-64), mx - 3, Z(-100), 0.5, 0.5, { over: 0 });
      R(mx - 9, Z(-68), 18, 4, 0.9, 0.9); [[-100, 13], [-92, 10], [-84, 7]].forEach(([z, h]) => { L(mx - h, Z(z), mx + h, Z(z), 1, 0.9, { over: 0, rough: 0.2 }); rivets(mx - h + 2, mx + h - 2, Z(z), 4, 0.6, 0.5); });
      P.arc(mx + 14, Z(-76), 12, 9, -1.15, 1.15, { w: 1.3, a: 0.9, passes: 1 }); L(mx + 4, Z(-76), mx + 14, Z(-76), 0.7, 0.8, { over: 0 }); L(mx + 4, Z(-84), mx + 4, Z(-68), 0.6, 0.6, { over: 0 });
      C(mx, Z(-110), 2.5, 0.9, 0.9); for (let a = 0; a < 8; a++) L(mx + Math.cos(a * PI / 4) * 4.5, Z(-110) + Math.sin(a * PI / 4) * 4.5, mx + Math.cos(a * PI / 4) * 7.5, Z(-110) + Math.sin(a * PI / 4) * 7.5, 0.5, 0.6, { over: 0 });
      const wx = 560; L(wx, Z(-64), wx, Z(-102), 0.9, 0.9, { over: 0 }); P.dot(wx, Z(-103), 1.6, { a: 0.9 }); L(wx - 3, Z(-70), wx + 3, Z(-70), 0.7, 0.8, { over: 0 });
      // stays
      L(mx, Z(-104), 484, Z(-64), 0.4, 0.5, { over: 0 }); L(mx, Z(-104), 556, Z(-64), 0.4, 0.5, { over: 0 });
    }
    // RCS quads on the nose cone, both flanks
    [-1, 1].forEach(s => { const x = 926, r = rAt(x); const b = [[x - 12, AXe + s * (r - 1)], [x + 10, AXe + s * (r - 1)], [x + 10, AXe + s * (r + 6)], [x - 12, AXe + s * (r + 6)]]; P.erase(b); PG(b, 1, 0.9, { rough: 0.2 }); tint(b, GRAPH, 0.25, { steps: 2 });
      for (let k = 0; k < 3; k++) { const xx = x - 8 + k * 8; L(xx, AXe + s * (r + 6), xx + 2, AXe + s * (r + 10), 0.9, 0.85, { over: 0, rough: 0.1 }); L(xx + 4.5, AXe + s * (r + 6), xx + 2, AXe + s * (r + 10), 0.9, 0.85, { over: 0, rough: 0.1 }); } });
    // nose-cone panel lines & sensor windows
    { const x0 = 916; for (let k = 0; k < 4; k++) { const z = -26 + k * 17, r = rAt(x0); if (Math.abs(z) < r - 6) CV([[x0, AXe + z], [x0 + 14, AXe + z * 0.86], [944, AXe + z * 0.42]], 0.6, 0.6, { rough: 0.2 }); } }
    // ventral sensor pod, star tracker
    { const px = 866; R(px, Z(51), 32, 7, 0.9, 0.9); RR(px + 4, Z(58), 24, 5, 2, 0.9, 0.9); C(px + 16, Z(62), 3.4, 0.8, 0.9); L(px, Z(51), px + 4, Z(58), 0.6, 0.7, { over: 0 }); L(px + 32, Z(51), px + 28, Z(58), 0.6, 0.7, { over: 0 }); }
    // lifeboat cradled under the habitat
    { const lb = S.catmull([[620, Z(63)], [626, Z(84)], [660, Z(98)], [716, Z(99)], [744, Z(90)], [750, Z(74)], [742, Z(63)]], false, 4);
      const poly = lb.concat([[620, Z(63)]]);
      [640, 690, 732].forEach(x => { const q = [[x - 4, Z(62)], [x + 4, Z(62)], [x + 6, Z(88)], [x - 6, Z(88)]]; PG(q, 0.9, 0.85, { rough: 0.2 }); L(x, Z(64), x, Z(86), 0.5, 0.6, { over: 0 }); });
      P.erase(poly); smudge(poly, Z(63), Z(99), 0.04, 0.3); hat(poly, -55, 2.8, 0.5, (x, y) => clamp((y - Z(64)) / 30 + 0.2, 0, 1), { piece: 9 });
      P.path(lb, { w: 1.7, rough: 0.5, passes: 1 }); L(620, Z(63), 742, Z(63), 1.6, 0.9);
      for (let k = 0; k < 4; k++) { RR(652 + k * 17, Z(72), 11, 8, 3, 0.8, 0.85); tint(rect4(653 + k * 17, Z(73), 9, 6), OCH, 0.5, { steps: 2, jit: 0.3 }); }
      tint(S.catmull([[624, Z(83)], [664, Z(94)], [716, Z(95)], [744, Z(88)], [740, Z(85)], [712, Z(90)], [664, Z(88)], [628, Z(80)]], true, 4), RED, 0.4, { steps: 3 });
      L(744, Z(80), 764, Z(80), 0.8, 0.8); L(764, Z(76), 764, Z(84), 0.8, 0.8);
    }

    /* ---- the cutaway windows and everything living inside them ---- */
    // (1) LH2 tank bay
    { const wi = rectWin(234, Z(-44), 58, 88, 7); void wi;
      [[255, Z(-20), 19], [255, Z(23), 18]].forEach(([cx, cy, r], k) => {
        L(cx - r * 0.6, cy + r * 0.8, cx - r * 0.9, k ? Z(42) : Z(4), 0.9, 0.85, { over: 0 }); L(cx + r * 0.6, cy + r * 0.8, cx + r * 0.9, k ? Z(42) : Z(4), 0.9, 0.85, { over: 0 });
        P.erase(disc(cx, cy, r, 18)); C(cx, cy, r, 1.5, 0.95, { passes: 2 }); P.ellipse(cx, cy, r * 0.36, r, { w: 0.6, a: 0.6, passes: 1 }); P.ellipse(cx, cy, r, r * 0.28, { w: 0.6, a: 0.6, from: 0, to: PI, passes: 1 });
        P.hatch(disc(cx, cy, r, 20), { ang: -50, gap: 2.4, a: 0.55, w: 0.5, piece: 7, fade: (x, y) => clamp(((x - cx) * 0.6 + (y - cy) * 0.7) / r + 0.5, 0, 1), inset: 0.5 });
        P.stipple(disc(cx - r * 0.3, cy - r * 0.35, r * 0.5, 12), 22, { a: 0.5, r: 0.7 });
        P.arc(cx, cy, r * 0.94, r * 0.94, PI * 1.12, PI * 1.55, { w: 1.6, a: 0.16, passes: 1, c: '#fff' });
        for (const dy of [-0.32, 0.36]) CV([[cx - r * 0.97, cy + r * dy], [cx, cy + r * dy + 3], [cx + r * 0.97, cy + r * dy]], 0.8, 0.85, { rough: 0.2 });
      });
      L(281, Z(-38), 281, Z(38), 1, 0.9, { over: 0 }); L(285, Z(-38), 285, Z(38), 0.7, 0.7, { over: 0 });
      [[-20], [23]].forEach(([z]) => L(274, Z(z), 281, Z(z), 0.9, 0.9, { over: 0 }));
      [-24, 8].forEach(z => { C(283, Z(z), 3.6, 0.9, 0.9); cross(283, Z(z), 3.6, 0.5, 0.7); });
      plate('LH2 BAY', 240, Z(-52), 8.5);
    }
    // (2) reactor bay
    { rectWin(324, Z(-46), 94, 92, 7);
      P.hatch(rect4(326, Z(-44), 90, 88), { ang: 0, gap: 6, a: 0.12, w: 0.4, piece: 20 });
      slab(326, Z(33), 90, 3.5, 0.7); for (let x = 328; x < 414; x += 4) L(x, Z(36.5), x + 1, Z(41), 0.5, 0.6, { over: 0, rough: 0.1 });
      // vessel + pedestal
      PG([[360, Z(24)], [398, Z(24)], [404, Z(33)], [354, Z(33)]], 1, 0.9, { rough: 0.2 });
      P.erase(rrPoly(352, Z(-28), 54, 52, 10)); RR(352, Z(-28), 54, 52, 10, 1.7, 0.95);
      hat(rrPoly(352, Z(-28), 54, 52, 10), -55, 2.6, 0.5, (x) => clamp((x - 352) / 54 * 0.8 + 0.2, 0, 1), { piece: 8 });
      for (let x = 362; x < 400; x += 9) L(x, Z(-26), x, Z(-4), 0.5, 0.6, { over: 0 });
      P.hatch(rect4(353, Z(12), 52, 11), { ang: 45, gap: 3, a: 0.75, w: 0.7, piece: 6, inset: 0.3 });
      L(352, Z(12), 406, Z(12), 0.8, 0.9); L(352, Z(-9), 406, Z(-9), 0.6, 0.7);
      { const tx0 = 379, ty0 = Z(-3); C(tx0, ty0, 7, 1, 0.9); C(tx0, ty0, 1.6, 0.7, 0.9); for (let k = 0; k < 3; k++) { const a = k * TAU / 3 - PI / 2; const fan = [[tx0 + Math.cos(a - 0.5) * 2, ty0 + Math.sin(a - 0.5) * 2], [tx0 + Math.cos(a - 0.5) * 6.2, ty0 + Math.sin(a - 0.5) * 6.2], [tx0 + Math.cos(a + 0.5) * 6.2, ty0 + Math.sin(a + 0.5) * 6.2], [tx0 + Math.cos(a + 0.5) * 2, ty0 + Math.sin(a + 0.5) * 2]]; tint(fan, RED, 0.6, { steps: 2, jit: 0.1 }); } }
      for (let k = 0; k < 4; k++) { const x = 360 + k * 11; R(x, Z(-42), 6, 14, 0.9, 0.9, { rough: 0.2 }); L(x - 1, Z(-42), x + 7, Z(-42), 1.2, 0.9, { over: 0 }); }
      // coolant pipes into the radiator fins
      [340, 396].forEach(x => { P.erase(rect4(x - 3.5, Z(-79), 7, 52)); P.erase(rect4(x - 3.5, Z(28), 7, 52)); L(x - 2.4, Z(-79), x - 2.4, Z(-28), 0.9, 0.9, { over: 0 }); L(x + 2.4, Z(-79), x + 2.4, Z(-28), 0.9, 0.9, { over: 0 });
        L(x - 2.4, Z(30), x - 2.4, Z(79), 0.9, 0.9, { over: 0 }); L(x + 2.4, Z(30), x + 2.4, Z(79), 0.9, 0.9, { over: 0 });
        [-64, -46, -31, 45, 62].forEach(z => R(x - 4, Z(z) - 1.2, 8, 2.4, 0.7, 0.9, { rough: 0.1 }));
        L(x - 2.4, Z(-28), x + 2.4, Z(-28), 0.7, 0.8, { over: 0 }); });
      // heat-exchanger zig-zag & gauges
      PL([[331, Z(-33)], [345, Z(-30)], [331, Z(-26)], [345, Z(-22)], [331, Z(-18)], [345, Z(-14)], [331, Z(-10)], [345, Z(-6)]], 0.9, 0.9, { over: 0, rough: 0.2 });
      [[397, -36], [409, -36], [409, -24]].forEach(([x, z]) => { C(x, Z(z), 3.4, 0.8, 0.9); L(x, Z(z), x + 2, Z(z) - 2, 0.6, 0.9, { over: 0 }); });
      L(348, Z(-30), 348, Z(24), 0.7, 0.8, { over: 0 }); L(409, Z(-16), 409, Z(30), 0.7, 0.8, { over: 0 });
      // catwalk rail + engineer
      L(328, Z(21), 348, Z(21), 0.8, 0.9, { over: 0 }); [330, 338, 346].forEach(x => L(x, Z(21), x, Z(33), 0.7, 0.8, { over: 0 }));
      person(338, Z(33), 0.72, 'stand', 1, { arm: 'hold', uni: '#c2523a' });
      plate('R-1', 366, Z(-52), 8.5);
    }
    // (3) cargo hold
    { rectWin(448, Z(-46), 126, 92, 7);
      slab(451, Z(38), 120, 5, 0.7); for (let x = 452; x < 570; x += 4) L(x, Z(43), x + 1, Z(45), 0.4, 0.5, { over: 0, rough: 0.1 });
      // crane rail, trolley, cable, hanging crate
      R(452, Z(-40), 118, 4, 1, 0.9); for (let x = 456; x < 568; x += 8) L(x, Z(-36), x + 3, Z(-33), 0.4, 0.5, { over: 0 });
      R(463, Z(-36), 14, 7, 0.9, 0.9); C(467, Z(-30), 1.5, 0.6, 0.9); C(473, Z(-30), 1.5, 0.6, 0.9); L(470, Z(-29), 470, Z(-23), 0.7, 0.9, { over: 0 }); C(470, Z(-21.5), 1.8, 0.8, 0.9);
      L(470, Z(-20), 461, Z(-13), 0.6, 0.85, { over: 0 }); L(470, Z(-20), 479, Z(-13), 0.6, 0.85, { over: 0 });
      crate(460, Z(-13), 20, 14, '07');
      crate(452, Z(24), 32, 14, 'A3'); crate(457, Z(11), 24, 13, 'A2');
      L(486, Z(-20), 486, Z(38), 0.6, 0.6, { over: 0 });
      person(500, Z(38), 0.92, 'stand', 1, { arm: 'up', uni: '#4b6fb8' });
      [516, 532, 548].forEach(x => drum(x, Z(16), 14, 22));
      crate(516, Z(4), 46, 11, 'H2O');
      for (let k = 0; k < 6; k++) L(516 + k * 9, Z(-22), 522 + k * 9, Z(2), 0.4, 0.55, { over: 0, rough: 0.2 });
      L(516, Z(-22), 560, Z(-22), 0.7, 0.8, { over: 0 }); L(516, Z(-8), 560, Z(-8), 0.7, 0.8, { over: 0 });
      [[518, 9, 12], [532, 8, 8], [546, 11, 10]].forEach(([x, w, h]) => R(x, Z(-8) - h, w, h, 0.7, 0.85, { rough: 0.2 }));
      [[520, 10, 8], [536, 12, 8], [552, 6, 9]].forEach(([x, w, h]) => R(x, Z(-22) - h, w, h, 0.6, 0.8, { rough: 0.2 }));
      ladder(563, Z(-36), Z(38), 8, 4.4, 0.8);
    }
    // (4) habitat: mess deck above, bunks below, ladder between decks and up to the garden
    { rectWin(604, Z(-46), 166, 92, 7);
      slab(606, Z(-0.5), 106, 3.6, 0.7); slab(722, Z(-0.5), 46, 3.6, 0.7); slab(607, Z(42), 160, 3.6, 0.7);
      // galley counter, stove, hanging pots
      R(608, Z(-13), 40, 12.5, 0.9, 0.9); L(608, Z(-13), 648, Z(-13), 1.6, 0.9, { over: 0 }); [621, 634].forEach(x => { L(x, Z(-12), x, Z(-1), 0.6, 0.8, { over: 0 }); P.dot(x + 2, Z(-7), 0.9, { a: 0.9 }); });
      R(608, Z(-44), 26, 11, 0.9, 0.9); L(621, Z(-44), 621, Z(-33), 0.6, 0.8, { over: 0 }); P.dot(619, Z(-38), 0.9, { a: 0.9 }); P.dot(623, Z(-38), 0.9, { a: 0.9 });
      L(636, Z(-40), 646, Z(-40), 0.8, 0.9, { over: 0 }); [[638, 6], [644, 5]].forEach(([x, h]) => { L(x, Z(-40), x, Z(-40 + 3), 0.5, 0.8, { over: 0 }); PG([[x - 2.6, Z(-37)], [x + 2.6, Z(-37)], [x + 2.2, Z(-37 + h)], [x - 2.2, Z(-37 + h)]], 0.7, 0.9, { rough: 0.1 }); });
      R(638, Z(-17), 14, 4, 0.8, 0.9); PG([[640, Z(-17)], [650, Z(-17)], [649, Z(-24)], [641, Z(-24)]], 0.8, 0.9, { rough: 0.1 }); L(651, Z(-21), 655, Z(-23), 0.7, 0.9, { over: 0 });
      wisp([[645, Z(-26)], [646, Z(-31)], [650, Z(-35)], [649, Z(-40)]], 1.8, 3.4, NAVY);
      person(654, Z(-0.5), 0.82, 'stand', -1, { arm: 'hold', uni: '#c2523a' });
      // table, stools, diners
      L(668, Z(-13), 694, Z(-13), 1.4, 0.9, { over: 0 }); L(670, Z(-13), 670, Z(-0.5), 0.8, 0.9, { over: 0 }); L(692, Z(-13), 692, Z(-0.5), 0.8, 0.9, { over: 0 });
      [662, 700].forEach(x => { L(x - 4, Z(-4), x + 4, Z(-4), 1.1, 0.9, { over: 0 }); L(x, Z(-4), x, Z(-0.5), 0.8, 0.9, { over: 0 }); });
      RR(676, Z(-18), 6, 5, 1.5, 0.7, 0.9); RR(684, Z(-17), 5, 4, 1.5, 0.7, 0.9);
      person(662, Z(-0.5) - 0, 0.78, 'sit', 1, { uni: '#4b6fb8', reach: 9 });
      person(700, Z(-0.5), 0.78, 'sit', -1, { uni: '#5a7a4a', reach: 9 });
      // wardroom
      [[730, 16], [752, 16]].forEach(([x, w]) => { R(x, Z(-42), w, 10, 0.8, 0.9, { rough: 0.2 }); CV([[x + 2, Z(-34)], [x + 5, Z(-38)], [x + 8, Z(-35)], [x + 11, Z(-39)], [x + 14, Z(-36)]], 0.5, 0.7, { rough: 0.1 }); });
      C(748, Z(-20), 9, 1.2, 0.9); C(748, Z(-20), 6.6, 0.6, 0.7); P.dots([[745, Z(-22), 0.6], [750, Z(-18), 0.7], [751, Z(-23), 0.6], [746, Z(-17), 0.5], [749, Z(-25), 0.5]], null, 0.9); P.arc(748, Z(-20), 6.6, 6.6, PI * 1.1, PI * 1.6, { w: 1.6, a: 0.14, c: '#fff', passes: 1 });
      R(730, Z(-8), 36, 7.5, 0.8, 0.9); L(730, Z(-8), 766, Z(-8), 1.3, 0.9, { over: 0 }); plant(760, Z(-8), 9, 1);
      // ladder + hatch hole through the mess-deck slab
      P.erase(rect4(713, Z(-1.5), 10, 6)); ladder(714, Z(-44), Z(42), 8, 4.2, 0.85);
      // bunks
      [608, 638, 668].forEach((x, i) => {
        L(x, Z(6), x, Z(42), 0.9, 0.9, { over: 0 }); L(x + 28, Z(6), x + 28, Z(42), 0.9, 0.9, { over: 0 });
        [Z(14), Z(28)].forEach(y => { R(x, y, 28, 3.8, 0.8, 0.9, { rough: 0.15 }); P.hatch(rect4(x, y, 28, 3.8), { ang: 45, gap: 1.6, a: 0.6, w: 0.5, piece: 5, inset: 0.1 }); });
        R(x + 2, Z(33.5), 24, 7.5, 0.7, 0.9, { rough: 0.15 }); P.dots([[x + 10, Z(37.5), 0.8], [x + 18, Z(37.5), 0.8]], null, 0.9);
      });
      person(610, Z(28), 0.78, 'lie', 1, { uni: '#4b6fb8' });
      person(671, Z(14), 0.78, 'lie', 1, { uni: '#5a7a4a' });
      cat(655, Z(14), 0.9);
      R(640, Z(9.6), 5, 4.2, 0.5, 0.8, { rough: 0.1 }); L(613, Z(6), 613, Z(12), 0.5, 0.6, { over: 0 });
      // lockers + med bay
      [[696, 6], [702, 6]].forEach(([x]) => { R(x, Z(8), 6, 34, 0.8, 0.9, { rough: 0.15 }); P.dot(x + 4.6, Z(24), 0.8, { a: 0.9 }); });
      R(730, Z(33), 30, 4, 0.9, 0.9); L(732, Z(37), 732, Z(42), 0.7, 0.8, { over: 0 }); L(758, Z(37), 758, Z(42), 0.7, 0.8, { over: 0 });
      C(748, Z(14), 7, 1, 0.9); L(748, Z(10.5), 748, Z(17.5), 1.6, 0.95, { c: RED, over: 0 }); L(744.5, Z(14), 751.5, Z(14), 1.6, 0.95, { c: RED, over: 0 });
      L(764, Z(6), 764, Z(33), 0.8, 0.9, { over: 0 }); P.ellipse(764, Z(10), 3.4, 4.6, { w: 0.7, a: 0.9, passes: 1 });
    }
    // (5) hydroponic dome (garden) sitting on the habitat roof
    { const dome = S.catmull([[612, Z(-64)], [620, Z(-80)], [640, Z(-92)], [672, Z(-98)], [704, Z(-92)], [724, Z(-80)], [732, Z(-64)]], false, 4);
      const domeTop = x => { let best = dome[0]; for (const p of dome) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p; return best[1]; };
      const gp = dome.concat([[728, Z(-50)], [616, Z(-50)]]);
      P.erase(gp);
      tint(gp, '#bcd7ee', 0.3, { steps: 2, jit: 0.3 });
      P.path(dome, { w: 1.9, rough: 0.5 }); P.path(dome.map(([x, y]) => [x + (x < 672 ? 2.5 : -2.5), y + 3]), { w: 0.7, a: 0.6, rough: 0.3 });
      L(616, Z(-64), 616, Z(-50), 1.5, 0.9, { over: 0 }); L(728, Z(-64), 728, Z(-50), 1.5, 0.9, { over: 0 }); L(620, Z(-64), 620, Z(-50), 0.6, 0.6, { over: 0 }); L(724, Z(-64), 724, Z(-50), 0.6, 0.6, { over: 0 });
      P.hatch([[612, Z(-66)], [620, Z(-66)], [620, Z(-50)], [612, Z(-50)]], { ang: 45, gap: 1.7, a: 0.7, w: 0.5, piece: 5, inset: 0.1 }); P.hatch([[724, Z(-66)], [732, Z(-66)], [732, Z(-50)], [724, Z(-50)]], { ang: 45, gap: 1.7, a: 0.7, w: 0.5, piece: 5, inset: 0.1 });
      slab(618, Z(-51.5), 108, 3.6, 0.7);
      for (const x of [632, 652, 672, 692, 712]) L(x, Z(-52), x, domeTop(x) + 1.5, 0.5, 0.4, { over: 0 });
      CV(dome.filter(p => p[0] > 626 && p[0] < 718).map(([x, y]) => [x, y + 14]), 0.5, 0.4, { rough: 0.2 });
      // left rack: two trays with plants, light bar, drip line
      [[Z(-58), 7], [Z(-72), 4]].forEach(([y, h], k) => { R(622, y, 34, h, 0.8, 0.9, { rough: 0.15 }); P.hatch(rect4(622, y, 34, h), { ang: 40, gap: 1.5, a: 0.6, w: 0.5, piece: 5, inset: 0.1 }); for (let x = 626; x < 656; x += 7) plant(x + P.r(-1, 1), y, 6 + P.r(0, 3), x + k);
        L(624, y + h, 624, Z(-51), 0.6, 0.8, { over: 0 }); L(654, y + h, 654, Z(-51), 0.6, 0.8, { over: 0 }); });
      L(624, Z(-80), 654, Z(-80), 1.8, 0.9, { over: 0 }); for (let x = 628; x < 654; x += 6) P.dashed(x, Z(-79), x + (x - 640) * 0.15, Z(-73.5), [1.5, 1.4], { w: 0.4, a: 0.5 });
      P.dashed(657, Z(-62), 657, Z(-51), [1.2, 2], { w: 0.5, a: 0.6 }); L(656, Z(-62), 660, Z(-62), 0.6, 0.7, { over: 0 });
      // central tomato vines on stakes + hanging lamp
      [664, 672, 680].forEach((x, i) => { L(x, Z(-51), x, Z(-82 + i * 2), 0.5, 0.6, { over: 0, rough: 0.2 }); for (let k = 0; k < 4; k++) { const yy = Z(-56 - k * 6.5); CV([[x, yy], [x + (k % 2 ? 4 : -4), yy - 2.4], [x + (k % 2 ? 6.5 : -6.5), yy + 0.4]], 0.7, 0.85, { rough: 0.2 }); if (k % 2 === i % 2) P.dot(x + (k % 2 ? 3 : -3), yy + 2.4, 1.6, { c: RED, a: 0.9 }); } });
      L(672, Z(-98) + 2, 672, Z(-90), 0.6, 0.8, { over: 0 }); R(662, Z(-90), 20, 3.4, 0.8, 0.9); P.dots([[665, Z(-88.3), 0.8], [669, Z(-88.3), 0.8], [673, Z(-88.3), 0.8], [677, Z(-88.3), 0.8]], null, 0.9);
      // gardener + watering can, pots, hanging baskets, ladder head
      person(692, Z(-51.5), 0.72, 'stand', -1, { arm: 'hold', uni: '#5a7a4a' });
      PG([[679, Z(-66)], [685, Z(-66)], [684, Z(-61)], [680, Z(-61)]], 0.6, 0.85, { rough: 0.1 }); L(679, Z(-64), 675, Z(-66), 0.6, 0.85, { over: 0 });
      [[701, 8], [709, 6]].forEach(([x, w]) => { PG([[x, Z(-51.5)], [x + w, Z(-51.5)], [x + w - 1, Z(-57)], [x + 1, Z(-57)]], 0.7, 0.9, { rough: 0.1 }); plant(x + w / 2, Z(-57), 7, x); });
      [[698, Z(-82)], [706, Z(-80)]].forEach(([x, y]) => { L(x, y - 6, x, y, 0.4, 0.6, { over: 0 }); P.arc(x, y, 3.4, 2.8, 0, PI, { w: 0.8, a: 0.9, passes: 1 }); CV([[x - 2, y + 2], [x - 3, y + 6], [x - 2, y + 9]], 0.6, 0.8, { rough: 0.1 }); CV([[x + 2, y + 2], [x + 3.4, y + 5], [x + 2.4, y + 8]], 0.6, 0.8, { rough: 0.1 }); });
      ladder(714, Z(-72), Z(-51.5), 8, 4.2, 0.8); R(711, Z(-52.6), 14, 1.6, 0.6, 0.8);
    }
    // (6) bridge blister + bridge interior
    { const blister = S.catmull([[794, Z(-64)], [802, Z(-80)], [820, Z(-91)], [856, Z(-95)], [886, Z(-84)], [903, Z(-62)], [912, Z(-40)]], false, 4);
      const bp = blister.concat([[912, Z(-38)], [794, Z(-62)]]);
      P.erase(bp); P.path(blister, { w: 2.2, rough: 0.7, passes: 2 });
      smudge(bp, Z(-95), Z(-60), 0.02, 0.25); hat(bp, -58, 3, 0.4, (x, y) => clamp((y - Z(-92)) / 30, 0.05, 0.8), { piece: 9 });
      // forward glazing band + struts
      CV([[888, Z(-82)], [900, Z(-64)], [908, Z(-47)]], 1.1, 0.9, { rough: 0.2 }); CV([[880, Z(-80)], [893, Z(-61)], [903, Z(-44)]], 0.7, 0.8, { rough: 0.2 });
      [[883, -81, 894, -62], [890, -74, 899, -60], [896, -66, 904, -52]].forEach(([a, b, c, d]) => L(a, Z(b), c, Z(d), 0.6, 0.7, { over: 0 }));
      const bo = [[806, Z(-62)], [816, Z(-80)], [834, Z(-88)], [862, Z(-89)], [884, Z(-77)], [896, Z(-58)], [902, Z(-38)], [902, Z(28)], [880, Z(33)], [840, Z(38)], [806, Z(38)]];
      const bi = shrink(bo, 0.93);
      cutWin(bo, bi, 0.4);
      // crawl space below the bridge deck
      slab(809, Z(8), 90, 3.2, 0.7);
      R(812, Z(13), 14, 22, 0.8, 0.9, { rough: 0.15 }); for (let yy = 16; yy < 34; yy += 4) P.dots([[816, Z(yy), 0.6], [820, Z(yy), 0.6], [824, Z(yy), 0.6]], null, 0.9);
      L(830, Z(14), 892, Z(14), 0.6, 0.7, { over: 0 }); L(830, Z(18), 892, Z(18), 0.6, 0.7, { over: 0 }); L(830, Z(28), 890, Z(28), 1.2, 0.85, { over: 0 });
      C(872, Z(22), 4.2, 0.9, 0.9); cross(872, Z(22), 4, 0.5, 0.8);
      P.erase(rect4(841, Z(7), 10, 5)); ladder(842, Z(8), Z(35), 8, 4.2, 0.8);
      // consoles, chairs, crew
      const con = [[870, Z(-13)], [886, Z(-19)], [896, Z(-17)], [896, Z(8)], [870, Z(8)]];
      PG(con, 1, 0.9, { rough: 0.2 }); hat(con, 50, 2.6, 0.5, (x) => clamp((x - 870) / 26, 0.1, 1), { piece: 6 });
      PG([[872, Z(-15)], [885, Z(-21)], [885, Z(-29)], [872, Z(-24)]], 0.9, 0.9, { rough: 0.2 }); tint([[873, Z(-16)], [884, Z(-21)], [884, Z(-28)], [873, Z(-24)]], '#7fbf9a', 0.45, { steps: 2, jit: 0.2 });
      CV([[875, Z(-19)], [878, Z(-22)], [881, Z(-21)], [883, Z(-25)]], 0.5, 0.8, { rough: 0.1 });
      [[850, Z(-1.5)], [826, Z(-1.5)]].forEach(([x, y], i) => { L(x, y, x + 14, y, 1.3, 0.9, { over: 0 }); R(x - 2, y - 17, 3, 17, 0.7, 0.9, { rough: 0.1 }); L(x + 7, y, x + 7, i ? Z(2) : Z(8), 0.9, 0.9, { over: 0 }); });
      slab(818, Z(2), 30, 6, 0.6);
      person(858, Z(8), 0.98, 'sit', 1, { uni: '#4b6fb8', reach: 10 });
      person(834, Z(2), 0.98, 'sit', 1, { uni: '#c2523a', reach: 6 });
      person(819, Z(8), 0.9, 'stand', -1, { arm: 'up', uni: '#5a7a4a' });
      R(808, Z(-48), 8, 34, 0.7, 0.85, { rough: 0.15 }); C(812, Z(-38), 2.6, 0.5, 0.8); C(812, Z(-30), 2, 0.5, 0.8); P.dots([[811, Z(-44), 0.6], [813, Z(-22), 0.6], [810, Z(-26), 0.5]], null, 0.9);
      R(826, Z(-80), 36, 6, 0.8, 0.9, { rough: 0.15 }); for (let x = 829; x < 861; x += 4) P.dots([[x, Z(-77), 0.7]], null, 0.9);
      L(822, Z(-72), 842, Z(-72), 0.4, 0.5, { over: 0 });
      // interior structure lines
      L(806, Z(-40), 806, Z(38), 0.5, 0.5, { over: 0 });
    }
    // exterior ornaments on nose: docking collar + probe
    { const x0 = 946, x1 = 976; P.erase(rect4(x0 - 1, AXe - 27, 32, 54)); R(x0, AXe - 27, 30, 54, 1.7, 0.95, { rough: 0.4 });
      P.hatch(rect4(x0, AXe - 27, 30, 54), { ang: -60, gap: 2.8, a: 0.5, w: 0.5, piece: 9, fade: (x, y) => clamp((y - AXe) / 27 * 0.9 + 0.4, 0, 1) });
      for (let k = 1; k < 4; k++) L(x0 + k * 7.5, AXe - 26, x0 + k * 7.5, AXe + 26, 0.6, 0.7, { over: 0 });
      [-1, 1].forEach(s => [954, 966].forEach(x => { R(x, AXe + s * 27 - (s < 0 ? 5 : 0), 6, 5, 0.9, 0.9, { rough: 0.1 }); }));
      L(x1 + 2, AXe, x1 + 14, AXe, 1.4, 0.95, { over: 0, rough: 0.2 }); PG([[x1 + 14, AXe - 3], [x1 + 22, AXe - 1], [x1 + 22, AXe + 1], [x1 + 14, AXe + 3]], 0.9, 0.9, { rough: 0.1 }); P.dot(x1 + 23, AXe, 1.4, { c: RED, a: 0.9 });
      RR(x1, AXe - 6, 3, 12, 1, 0.9, 0.9);
    }


    /* ---- small stickers, patches, scorch, dents, weld beads (used on plan/front/elevation skins) ---- */
    const sticker = (x, y, kind, r = 8) => {
      P.erase(disc(x, y, r + 1, 14)); C(x, y, r, 1, 0.9); C(x, y, r - 1.9, 0.5, 0.65, { rough: 0.2 });
      if (kind === 0) { P.arc(x, y, r * 0.5, r * 0.5, 0.9, 5.4, { w: 1.1, a: 0.9, passes: 1 }); P.arc(x + r * 0.2, y, r * 0.45, r * 0.45, 1.3, 5.0, { w: 0.9, a: 0.85, passes: 1 }); }
      if (kind === 1) for (let a = 0; a < 5; a++) { const an = -PI / 2 + a * TAU / 5; L(x, y, x + Math.cos(an) * r * 0.6, y + Math.sin(an) * r * 0.6, 0.7, 0.85, { over: 0 }); }
      if (kind === 2) { C(x, y, r * 0.32, 0.8, 0.9, { rough: 0.1 }); P.ellipse(x, y, r * 0.66, r * 0.16, { w: 0.7, a: 0.9, rot: -0.35, passes: 1 }); }
      if (kind === 3) { C(x, y, r * 0.42, 0.8, 0.9, { rough: 0.1 }); tint(disc(x, y, r * 0.42, 8), RED, 0.5, { steps: 2, jit: 0.1 }); L(x - r * 0.7, y + r * 0.1, x + r * 0.7, y + r * 0.1, 0.5, 0.7, { over: 0 }); }
      if (kind === 4) for (let k = -1; k <= 1; k++) CV([[x - r * 0.6, y + k * r * 0.32], [x - r * 0.2, y + k * r * 0.32 - 1.6], [x + r * 0.2, y + k * r * 0.32 + 1.6], [x + r * 0.6, y + k * r * 0.32]], 0.7, 0.85, { rough: 0.1 });
      if (kind === 5) { PL([[x, y - r * 0.6], [x + r * 0.25, y + r * 0.2], [x - r * 0.25, y + r * 0.2], [x, y - r * 0.6]], 0.8, 0.9, { over: 0, rough: 0.1 }); L(x - r * 0.25, y + r * 0.2, x - r * 0.45, y + r * 0.55, 0.7, 0.85, { over: 0 }); L(x + r * 0.25, y + r * 0.2, x + r * 0.45, y + r * 0.55, 0.7, 0.85, { over: 0 }); }
      tint(disc(x, y, r - 0.6, 12), [OCH, BLUE, RED, OCH, BLUE, OCH][kind % 6], 0.16, { steps: 2, jit: 0.2 });
    };
    const scorch = (cx, cy, rx, ry, a = 0.6) => {
      const pts = []; for (let k = 0; k < 9; k++) { const an = k * TAU / 9, rr = P.r(0.7, 1.15); pts.push([cx + Math.cos(an) * rx * rr, cy + Math.sin(an) * ry * rr]); }
      const poly = S.catmull(pts, true, 3); tint(poly, GRAPH, a * 0.55, { steps: 3, jit: 1 });
      P.hatch(poly, { ang: P.r(20, 70), gap: 1.6, a, w: 0.5, piece: 6, ragged: 1.6, fade: (x, y) => clamp(1.15 - Math.hypot((x - cx) / rx, (y - cy) / ry), 0.15, 1) });
      P.hatch(poly, { ang: P.r(-60, -20), gap: 2.2, a: a * 0.7, w: 0.45, piece: 5, ragged: 1.6, fade: (x, y) => clamp(1 - Math.hypot((x - cx) / rx, (y - cy) / ry), 0, 0.9) });
    };
    const dent = (x, y, r) => { P.ellipse(x, y, r, r * 0.8, { w: 0.9, a: 0.85, passes: 1, rough: 0.2 }); P.hatch(disc(x, y, r * 0.8, 8), { ang: -40, gap: 1.4, a: 0.6, w: 0.45, piece: 4, fade: (px, py) => clamp(((px - x) + (py - y)) / r * 0.5 + 0.5, 0, 1) }); P.arc(x, y, r * 1.5, r * 1.3, 4, 5.6, { w: 0.5, a: 0.5, passes: 1 }); };
    const patchPlate = (x, y, w, h, tag) => { P.erase(rect4(x, y, w, h)); R(x, y, w, h, 1, 0.9); R(x + 1.8, y + 1.8, w - 3.6, h - 3.6, 0.4, 0.45, { rough: 0.2 }); L(x + 1.8, y + 1.8, x + w - 1.8, y + h - 1.8, 0.5, 0.6, { over: 0 }); L(x + w - 1.8, y + 1.8, x + 1.8, y + h - 1.8, 0.5, 0.6, { over: 0 }); rivets(x + 3, x + w - 3, y + 1, 4, 0.8, 0.6); rivets(x + 3, x + w - 3, y + h - 1, 4, 0.8, 0.6); rivetsV(x + 1, y + 4, y + h - 4, 4, 0.8, 0.6); rivetsV(x + w - 1, y + 4, y + h - 4, 4, 0.8, 0.6); if (tag) tx(tag, x + 2, y + h + 9, 8.5, { a: 0.7 }); };
    const weld = (x0, y0, x1, y1) => P.scallop([[x0, y0], [x1, y1]], { r: 1.8, bulge: 0.9, w: 0.6, a: 0.75 });

    /* =============================================================
       PLAN VIEW  (same x stations as the elevation, axis y = 482)
       ============================================================= */
    fin(AXp, -1); fin(AXp, 1);
    // wing decor: stickers + hazard bands + tip lights
    [[338, 'A'], [380, 'B']].forEach(([x], i) => sticker(x + 10, AXp - 94 + i * 2, [2, 0][i], 7.5));
    { const band = [[318, AXp + 104], [412, AXp + 104], [408, AXp + 112], [322, AXp + 112]]; P.erase(band); tint(band, RED, 0.45, { steps: 3, jit: 0.4 }); for (let x = 322; x < 410; x += 9) L(x, AXp + 104, x - 5, AXp + 112, 0.7, 0.85, { over: 0, rough: 0.2 }); R(318, AXp + 104, 94, 8, 0.6, 0.6, { rough: 0.2 });
      plate('RAD-2', 336, AXp - 76, 13); scorch(392, AXp - 70, 14, 7, 0.55); patchPlate(352, AXp + 78, 22, 14, 'P-77'); }
    [[322, -F], [408, -F], [322, F], [408, F]].forEach(([x, z]) => { P.dot(x, AXp + z - Math.sign(z) * 2, 1.8, { c: RED, a: 0.9 }); });
    P.erase(hullP);
    bell(AXp); stubs(AXp);
    P.path(hullP, { closed: true, w: 2.3, rough: 0.9, passes: 2 });
    smudge(hullP, AXp - 62, AXp + 64, 0.02, 0.44);
    hat(hullP, -60, 3, 0.58, (x, y) => clamp((y - AXp) / 64 * 0.95 + 0.4, 0, 1), { piece: 11 });
    P.path(profS.map(([x, r]) => [x, AXp + r - 3.5]), { w: 6, a: 0.13, rough: 1.4, passes: 2 }); P.path(profS.map(([x, r]) => [x, AXp + r - 9]), { w: 5, a: 0.07, rough: 1.4, passes: 1 });
    hat(hullP, 28, 3.4, 0.42, (x, y) => clamp((y - AXp - 20) / 40, 0, 1) * 0.9, { piece: 10 });
    for (let k = 0; k < 26; k++) { const y = AXp + P.r(-8, 60); L(P.r(230, 700), y, P.r(700, 940), y + P.r(-2, 2), P.r(4, 8), 0.05, { rough: 1.5, over: 0, c: GRAPH }); }
    [226, 262, 300, 322, 430, 440, 578, 598, 776, 796, 914].forEach((x, i) => { const r = rAt(x); L(x, AXp - r + 1, x, AXp + r - 1, i % 3 === 2 ? 1.1 : 0.75, 0.75, { over: 0, rough: 0.3 }); });
    // long seams & rivet rows
    [[-38, 232, 906], [38, 232, 906]].forEach(([d, a, b]) => { const pts = []; for (let x = a; x <= b; x += 12) { const r = rAt(x); pts.push([x, AXp + Math.sign(d) * Math.min(Math.abs(d), r - 5)]); } P.path(pts, { w: 0.6, a: 0.6, rough: 0.3 }); });
    [-61, -50, 50, 61].forEach(z => { const d = []; for (let x = 232; x <= 906; x += 6) { const r = rAt(x); const y = AXp + Math.sign(z) * Math.min(Math.abs(z), r - 3.5); d.push([x, y, 0.6]); } P.dots(d, null, 0.6); });
    // dorsal fin edge-on, cargo hatches, mast farm
    R(298, AXp - 2.5, 142, 5, 1.1, 0.9, { rough: 0.2 }); P.hatch(rect4(298, AXp - 2.5, 142, 5), { ang: 30, gap: 1.5, a: 0.6, w: 0.5, piece: 5, inset: 0.1 }); [312, 380, 430].forEach(x => R(x - 3, AXp - 4.5, 6, 9, 0.7, 0.9, { rough: 0.1 }));
    { const x0 = 448, x1 = 506, y0 = AXp - 40, y1 = AXp + 40;
      P.erase(rect4(x0, y0, x1 - x0, y1 - y0)); R(x0, y0, x1 - x0, y1 - y0, 1.4, 0.95, { rough: 0.3 }); R(x0 + 3, y0 + 3, x1 - x0 - 6, 34, 0.7, 0.8, { rough: 0.2 }); R(x0 + 3, AXp + 3, x1 - x0 - 6, 34, 0.7, 0.8, { rough: 0.2 });
      L(x0 + 3, AXp, x1 - 3, AXp, 1.1, 0.9, { over: 0 }); for (let x = x0 + 12; x < x1 - 6; x += 11) { L(x, y0 + 3, x, AXp - 3, 0.5, 0.6, { over: 0 }); L(x, AXp + 3, x, y1 - 3, 0.5, 0.6, { over: 0 }); }
      [x0 + 8, x0 + 28, x1 - 8].forEach(x => { R(x - 3, y0 - 2, 6, 5, 0.8, 0.9, { rough: 0.1 }); R(x - 3, y1 - 3, 6, 5, 0.8, 0.9, { rough: 0.1 }); });
      [x0 + 10, x0 + 30, x0 + 46].forEach(x => R(x - 2, AXp - 3, 4, 6, 0.7, 0.9, { rough: 0.1 }));
      for (const s of [-1, 1]) { const yy = AXp + s * 37; for (let x = x0 + 4; x < x1 - 8; x += 8) L(x, yy - s * 3, x + 4, yy + s * 3, 0.9, 0.8, { over: 0, rough: 0.1 }); }
      P.hatch(rect4(x0 + 3, AXp + 3, x1 - x0 - 6, 34), { ang: -55, gap: 3, a: 0.4, w: 0.5, piece: 8, fade: () => 0.7 });
      P.dashed(x0 + 4, AXp - 14, x1 + 62, AXp - 14, [7, 3], { w: 0.5, a: 0.5 }); P.dashed(x0 + 4, AXp + 14, x1 + 62, AXp + 14, [7, 3], { w: 0.5, a: 0.5 });
      tx('CARGO', x0 + 8, y0 - 8, 10, { a: 0.75 }); }
    // mast top view + dish, whip, EVA hatch
    { const mx = 520; R(mx - 9, AXp - 9, 18, 18, 0.9, 0.9); C(mx, AXp, 4, 1, 0.95); L(mx - 13, AXp, mx + 13, AXp, 1, 0.9, { over: 0 }); L(mx, AXp - 13, mx, AXp + 13, 1, 0.9, { over: 0 }); L(mx - 10, AXp - 10, mx + 10, AXp + 10, 0.4, 0.5, { over: 0 }); L(mx + 10, AXp - 10, mx - 10, AXp + 10, 0.4, 0.5, { over: 0 });
      C(mx + 26, AXp + 12, 11, 1.2, 0.9); C(mx + 26, AXp + 12, 6.5, 0.7, 0.8); C(mx + 26, AXp + 12, 1.6, 0.8, 0.9); P.hatch(disc(mx + 26, AXp + 12, 10, 14), { ang: -50, gap: 2.2, a: 0.5, w: 0.5, piece: 5, fade: (x, y) => clamp(((x - mx - 26) + (y - AXp - 12)) / 14 + 0.5, 0, 1) }); L(mx + 26, AXp + 12, mx + 26, AXp + 3, 0.7, 0.8, { over: 0 });
      C(560, AXp, 2.4, 0.9, 0.9); C(560, AXp, 5.4, 0.5, 0.6, { rough: 0.2 }); L(514, AXp + 34, 560, AXp + 34, 0.5, 0.5, { over: 0 });
      C(588, AXp - 34, 11, 1.4, 0.95); C(588, AXp - 34, 7.6, 0.8, 0.9); C(588, AXp - 34, 2, 0.9, 0.95); for (let a = 0; a < 8; a++) L(588 + Math.cos(a * PI / 4) * 2, AXp - 34 + Math.sin(a * PI / 4) * 2, 588 + Math.cos(a * PI / 4) * 7.6, AXp - 34 + Math.sin(a * PI / 4) * 7.6, 0.6, 0.85, { over: 0, rough: 0.1 });
      P.dots(Array.from({ length: 10 }, (_, a) => [588 + Math.cos(a * TAU / 10) * 9.5, AXp - 34 + Math.sin(a * TAU / 10) * 9.5, 0.7]), null, 0.9); }
    // vent stacks (top) and hidden ventral vents
    C(433, AXp, 3.2, 1, 0.95); C(433, AXp, 5.4, 0.6, 0.6, { rough: 0.2 });
    [470, 560].forEach(x => P.dashed(x - 4, AXp - 4, x + 4, AXp - 4, [2, 2], { w: 0.5, a: 0.6 })); [470, 560].forEach(x => { P.circle(x, AXp + 20, 4, { w: 0.6, a: 0.55, passes: 1 }); });
    // dome from above
    { const cx = 672, cy = AXp; P.erase(S.catmull([[612, cy], [620, cy - 26], [640, cy - 38], [672, cy - 40], [704, cy - 38], [724, cy - 26], [732, cy], [724, cy + 26], [704, cy + 38], [672, cy + 40], [640, cy + 38], [620, cy + 26]], true, 5));
      P.ellipse(cx, cy, 60, 40, { w: 1.8, a: 0.95, passes: 2 }); P.ellipse(cx, cy, 56, 36.2, { w: 0.7, a: 0.65, passes: 1 });
      tint(S.catmull([[616, cy], [626, cy - 25], [648, cy - 35], [672, cy - 36], [696, cy - 35], [718, cy - 25], [728, cy], [718, cy + 25], [696, cy + 35], [672, cy + 36], [648, cy + 35], [626, cy + 25]], true, 5), '#7fb37a', 0.26, { steps: 3, jit: 0.4 });
      for (let k = -2; k <= 2; k++) P.ellipse(cx, cy, 56, 36.2 * Math.abs(k) / 2.6 + 0.01, { w: 0.5, a: 0.45, passes: 1 });
      for (let k = -3; k <= 3; k++) { const dx = k * 16; CV([[cx + dx * 0.98, cy - Math.sqrt(Math.max(0, 1 - (dx / 58) ** 2)) * 36], [cx + dx * 1.02, cy], [cx + dx * 0.98, cy + Math.sqrt(Math.max(0, 1 - (dx / 58) ** 2)) * 36]], 0.5, 0.45, { rough: 0.2 }); }
      // crop rows seen through the glass
      for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 9; c2++) { const px = 630 + c2 * 9 + (r % 2) * 4, py = cy - 22 + r * 14; if (Math.hypot((px - cx) / 56, (py - cy) / 36) < 0.86) { P.circle(px, py, 2.4 + P.r(0, 1), { w: 0.6, a: 0.7, passes: 1, rough: 0.1 }); P.hatch(disc(px, py, 2.2, 6), { ang: 60, gap: 1.1, a: 0.5, w: 0.4, piece: 3 }); } }
      L(cx - 6, cy - 34, cx - 6, cy + 34, 1.6, 0.13, { c: '#fff', over: 0, passes: 1 });
      C(716, cy, 6, 1, 0.9); C(716, cy, 3.6, 0.6, 0.8); }
    // bridge blister from above
    { const cy = AXp, up = S.catmull([[794, cy - 30], [812, cy - 36], [848, cy - 36], [878, cy - 30], [900, cy - 20], [913, cy - 8]], false, 4), dn = mirY(up, cy).reverse(), poly = up.concat(dn);
      P.erase(poly); P.path(poly, { closed: true, w: 2, rough: 0.6, passes: 2 }); smudge(poly, cy - 36, cy + 36, 0.03, 0.3); hat(poly, -58, 3, 0.45, (x, y) => clamp((y - cy) / 36 * 0.8 + 0.4, 0.05, 1), { piece: 9 });
      L(800, cy, 908, cy, 0.7, 0.8, { over: 0 }); L(830, cy - 33, 830, cy + 33, 0.6, 0.7, { over: 0 }); L(858, cy - 34, 858, cy + 34, 0.6, 0.7, { over: 0 });
      for (let k = 0; k < 3; k++) { const x = 870 + k * 11, w = 32 - k * 12; const pts = [[x, cy - w * 0.75], [x + 6, cy - w * 0.62], [x + 6, cy + w * 0.62], [x, cy + w * 0.75]]; PG(pts, 0.7, 0.85, { rough: 0.1 }); tint(pts, BLUE, 0.3, { steps: 2, jit: 0.2 }); }
      P.dots(Array.from({ length: 8 }, (_, k) => [806 + (k % 4) * 5, cy - 26 + Math.floor(k / 4) * 5, 0.7]), null, 0.8); for (let x = 806; x < 826; x += 3) L(x, cy + 8, x, cy + 24, 0.4, 0.5, { over: 0 }); }
    // nose collar + probe, RCS quads on the flanks, hidden lifeboat / sensor pod
    { const x0 = 946; P.erase(rect4(x0 - 1, AXp - 27, 32, 54)); R(x0, AXp - 27, 30, 54, 1.7, 0.95, { rough: 0.4 }); P.hatch(rect4(x0, AXp - 27, 30, 54), { ang: -60, gap: 2.8, a: 0.5, w: 0.5, piece: 9, fade: (x, y) => clamp((y - AXp) / 27 * 0.9 + 0.4, 0, 1) });
      for (let k = 1; k < 4; k++) L(x0 + k * 7.5, AXp - 26, x0 + k * 7.5, AXp + 26, 0.6, 0.7, { over: 0 });
      [-1, 1].forEach(s => [954, 966].forEach(x => R(x, AXp + s * 27 - (s < 0 ? 5 : 0), 6, 5, 0.9, 0.9, { rough: 0.1 })));
      L(978, AXp, 990, AXp, 1.4, 0.95, { over: 0 }); PG([[990, AXp - 3], [998, AXp - 1], [998, AXp + 1], [990, AXp + 3]], 0.9, 0.9, { rough: 0.1 }); P.dot(999, AXp, 1.4, { c: RED, a: 0.9 }); }
    [-1, 1].forEach(s => { const x = 926, r = rAt(x); const b = [[x - 12, AXp + s * (r - 1)], [x + 10, AXp + s * (r - 1)], [x + 10, AXp + s * (r + 6)], [x - 12, AXp + s * (r + 6)]]; P.erase(b); PG(b, 1, 0.9, { rough: 0.2 }); tint(b, GRAPH, 0.25, { steps: 2 });
      for (let k = 0; k < 3; k++) { const xx = x - 8 + k * 8; L(xx, AXp + s * (r + 6), xx + 2, AXp + s * (r + 10), 0.9, 0.85, { over: 0, rough: 0.1 }); L(xx + 4.5, AXp + s * (r + 6), xx + 2, AXp + s * (r + 10), 0.9, 0.85, { over: 0, rough: 0.1 }); } });
    P.dashed(620, AXp - 24, 750, AXp - 24, [6, 3], { w: 0.6, a: 0.6 }); P.dashed(620, AXp + 24, 750, AXp + 24, [6, 3], { w: 0.6, a: 0.6 }); P.dashed(620, AXp - 24, 620, AXp + 24, [4, 3], { w: 0.6, a: 0.6 }); P.dashed(750, AXp - 12, 750, AXp + 12, [4, 3], { w: 0.6, a: 0.6 }); P.dashed(750, AXp - 12, 742, AXp - 24, [4, 3], { w: 0.6, a: 0.6 }); P.dashed(750, AXp + 12, 742, AXp + 24, [4, 3], { w: 0.6, a: 0.6 });
    P.dashed(866, AXp - 9, 898, AXp - 9, [5, 3], { w: 0.5, a: 0.55 }); P.dashed(866, AXp + 9, 898, AXp + 9, [5, 3], { w: 0.5, a: 0.55 });
    // skin story: port-of-call stickers, scars, patches, welds, panel numbers
    [0, 1, 2, 3, 4, 5].forEach((k, i) => sticker(620 + i * 22, AXp - 54, k, 8));
    [4, 2, 5, 0].forEach((k, i) => sticker(630 + i * 24, AXp + 54, k, 8));
    scorch(258, AXp - 42, 26, 12, 0.6); scorch(940, AXp + 14, 11, 8, 0.5); scorch(790, AXp + 44, 18, 8, 0.45); scorch(345, AXp + 40, 16, 8, 0.4);
    dent(400, AXp - 46, 4); dent(412, AXp - 40, 2.6); dent(610, AXp + 38, 3.4); dent(830, AXp - 48, 3); dent(846, AXp + 40, 2.4); dent(236, AXp + 20, 3);
    patchPlate(538, AXp + 30, 20, 14, 'P-66'); patchPlate(272, AXp + 26, 22, 14, 'P-31'); patchPlate(858, AXp + 46, 16, 11, 'P-12');
    weld(300, AXp - 30, 322, AXp - 30); weld(440, AXp + 30, 448, AXp + 30); weld(860, AXp + 28, 906, AXp + 24); weld(578, AXp - 16, 598, AXp - 16);
    [['P-101', 328, -52], ['P-102', 336, 54], ['P-103', 452, 54], ['P-104', 546, -53], ['P-105', 722, 54], ['P-106', 810, 54]].forEach(([s, x, dy]) => { if (dy < 0) tx(s, x, AXp + dy - 0, 9.5, { a: 0.7 }); else tx(s, x, AXp + dy + 3, 9.5, { a: 0.7 }); });


    /* =============================================================
       FRONT & REAR VIEWS  (x = 1250)
       ============================================================= */
    // four edge-on radiator slabs of the cruciform
    const cruciform = (cx, cy) => {
      for (let k = 0; k < 4; k++) {
        const a = k * PI / 2, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux, d0 = 60, d1 = F, hw2 = 2.6;
        const q = [[cx + ux * d0 + nx * hw2, cy + uy * d0 + ny * hw2], [cx + ux * d1 + nx * hw2, cy + uy * d1 + ny * hw2], [cx + ux * d1 - nx * hw2, cy + uy * d1 - ny * hw2], [cx + ux * d0 - nx * hw2, cy + uy * d0 - ny * hw2]];
        P.erase(q); PG(q, 1.4, 0.92, { rough: 0.25 }); P.hatch(q, { ang: 40 + k * 20, gap: 1.6, a: 0.55, w: 0.5, piece: 5, inset: 0.1 });
        for (let d = d0 + 6; d < d1 - 4; d += 6) L(cx + ux * d + nx * 4.5, cy + uy * d + ny * 4.5, cx + ux * d - nx * 4.5, cy + uy * d - ny * 4.5, 0.55, 0.6, { over: 0, rough: 0.1 });
        const cap = [[cx + ux * d1 + nx * 7, cy + uy * d1 + ny * 7], [cx + ux * (d1 + 3.5) + nx * 7, cy + uy * (d1 + 3.5) + ny * 7], [cx + ux * (d1 + 3.5) - nx * 7, cy + uy * (d1 + 3.5) - ny * 7], [cx + ux * d1 - nx * 7, cy + uy * d1 - ny * 7]];
        PG(cap, 1, 0.9, { rough: 0.1 }); P.dot(cx + ux * (d1 + 6.5), cy + uy * (d1 + 6.5), 1.6, { c: k % 2 ? GRN : RED, a: 0.95 });
      }
    };
    const mastFront = (cx, cy) => {
      L(cx, cy - 64, cx, cy - 110, 1.3, 0.9, { over: 0 }); [[-100, 13], [-92, 10], [-84, 7]].forEach(([z, h]) => L(cx - h, cy + z, cx + h, cy + z, 1, 0.9, { over: 0, rough: 0.2 }));
      C(cx + 3, cy - 76, 9, 1.1, 0.9); C(cx + 3, cy - 76, 5.4, 0.6, 0.7); C(cx + 3, cy - 76, 1.4, 0.8, 0.9); L(cx, cy - 66, cx + 3, cy - 68, 0.7, 0.8, { over: 0 });
      C(cx, cy - 110, 2.4, 0.9, 0.9);
    };
    const lifeboatEnd = (cx, cy) => {
      const lb = S.catmull([[cx - 22, cy + 60], [cx - 25, cy + 82], [cx - 12, cy + 97], [cx, cy + 99], [cx + 12, cy + 97], [cx + 25, cy + 82], [cx + 22, cy + 60]], false, 4); P.erase(lb.concat([[cx - 22, cy + 60]]));
      P.path(lb, { w: 1.6, rough: 0.5 }); hat(lb.concat([[cx - 22, cy + 60]]), -55, 2.8, 0.5, (x, y) => clamp((y - cy - 60) / 36 + 0.3, 0, 1), { piece: 8 });
      [-16, 16].forEach(dx => { L(cx + dx, cy + 62, cx + dx, cy + 74, 1.6, 0.9, { over: 0 }); }); C(cx, cy + 82, 5, 0.9, 0.9); C(cx, cy + 82, 2.6, 0.6, 0.8); tint(disc(cx, cy + 82, 4.8, 10), OCH, 0.5, { steps: 2, jit: 0.1 });
    };
    const domeEnd = (cx, cy) => {
      const d = S.catmull([[cx - 40, cy - 60], [cx - 36, cy - 80], [cx - 20, cy - 94], [cx, cy - 98], [cx + 20, cy - 94], [cx + 36, cy - 80], [cx + 40, cy - 60]], false, 4); const poly = d.concat([[cx + 40, cy - 56], [cx - 40, cy - 56]]);
      P.erase(poly); tint(poly, '#bcd7ee', 0.28, { steps: 2 }); P.path(d, { w: 1.7, rough: 0.5 }); CV([[cx - 34, cy - 70], [cx, cy - 92], [cx + 34, cy - 70]], 0.5, 0.5, { rough: 0.2 });
      for (const k of [-24, -8, 8, 24]) L(cx + k, cy - 60, cx + k * 0.9, cy - 90 - (1 - Math.abs(k) / 30) * 4, 0.5, 0.45, { over: 0 });
      for (let i = 0; i < 6; i++) plant(cx - 30 + i * 12, cy - 60, 8 + (i % 3) * 3, i);
    };
    const bridgeEnd = (cx, cy, front) => {
      const b = S.catmull([[cx - 33, cy - 50], [cx - 31, cy - 76], [cx - 18, cy - 91], [cx, cy - 95], [cx + 18, cy - 91], [cx + 31, cy - 76], [cx + 33, cy - 50]], false, 4), poly = b.concat([[cx + 33, cy - 44], [cx - 33, cy - 44]]);
      P.erase(poly); P.path(b, { w: 1.9, rough: 0.5, passes: 2 }); smudge(poly, cy - 95, cy - 50, 0.02, 0.28); hat(poly, -58, 3, 0.45, (x, y) => clamp((y - cy + 92) / 40 + 0.05, 0.05, 0.85), { piece: 8 });
      if (front) {
        const g = S.catmull([[cx - 26, cy - 72], [cx - 14, cy - 84], [cx, cy - 87], [cx + 14, cy - 84], [cx + 26, cy - 72], [cx + 24, cy - 62], [cx, cy - 66], [cx - 24, cy - 62]], true, 3);
        P.erase(g); P.path(g, { closed: true, w: 1.2, rough: 0.3, a: 0.9 }); tint(g, '#7fb3d8', 0.45, { steps: 3, jit: 0.4 });
        [-12, 0, 12].forEach(dx => L(cx + dx, cy - 85 + Math.abs(dx) * 0.25, cx + dx * 1.08, cy - 65, 0.9, 0.9, { over: 0, rough: 0.2 }));
        [[-19, -71], [-6, -73], [7, -73], [19, -71]].forEach(([dx, dz]) => { C(cx + dx, cy + dz, 2.1, 0.7, 0.85, { rough: 0.1 }); L(cx + dx, cy + dz + 2, cx + dx, cy + dz + 5, 0.7, 0.8, { over: 0 }); });
        L(cx - 22, cy - 80, cx + 6, cy - 88, 1.6, 0.1, { c: '#fff', over: 0 });
      } else { for (let k = -2; k <= 2; k++) L(cx + k * 10, cy - 92 + Math.abs(k) * 2.4, cx + k * 11, cy - 46, 0.5, 0.5, { over: 0 }); P.dashed(cx - 30, cy - 70, cx + 30, cy - 70, [5, 3], { w: 0.5, a: 0.5 }); }
    };

    // ---------- FRONT (looking at the nose)
    { const cx = CX, cy = AXe;
      cruciform(cx, cy); lifeboatEnd(cx, cy); domeEnd(cx, cy); mastFront(cx, cy);
      P.erase(disc(cx, cy, 64.5, 40));
      C(cx, cy, 64, 2.2, 0.95, { passes: 2, rough: 0.8 }); [61, 52, 40].forEach((r, i) => C(cx, cy, r, i === 1 ? 1.1 : 0.8, 0.8, { rough: 0.4 }));
      const dsk = disc(cx, cy, 64, 40); smudge(dsk, cy - 62, cy + 64, 0.03, 0.34);
      hat(dsk, -58, 3, 0.5, (x, y) => clamp((y - cy) / 64 * 0.95 + 0.38, 0, 1), { piece: 10 }); hat(dsk, 30, 3.4, 0.4, (x, y) => clamp((y - cy - 16) / 40, 0, 1) * 0.9, { piece: 9 });
      for (let a = 0; a < 20; a++) { const an = a * TAU / 20 + 0.08; L(cx + Math.cos(an) * 29, cy + Math.sin(an) * 29, cx + Math.cos(an) * 61, cy + Math.sin(an) * 61, 0.5, 0.5, { over: 0, rough: 0.2 }); }
      [58, 46, 34].forEach((r, i) => P.dots(Array.from({ length: 28 - i * 4 }, (_, a) => [cx + Math.cos(a * TAU / (28 - i * 4)) * r, cy + Math.sin(a * TAU / (28 - i * 4)) * r, 0.6]), null, 0.65));
      // nose ring: dock collar
      P.erase(disc(cx, cy, 27.5, 24)); C(cx, cy, 27, 1.7, 0.95, { passes: 2 }); C(cx, cy, 23.5, 0.8, 0.8); C(cx, cy, 15, 1, 0.9); C(cx, cy, 8, 0.8, 0.85);
      for (let a = 0; a < 8; a++) { const an = a * PI / 4 + PI / 8; L(cx + Math.cos(an) * 15, cy + Math.sin(an) * 15, cx + Math.cos(an) * 8, cy + Math.sin(an) * 8, 0.6, 0.8, { over: 0, rough: 0.1 }); const bx = cx + Math.cos(an - PI / 8) * 25.5, by = cy + Math.sin(an - PI / 8) * 25.5; R(bx - 2.4, by - 2.4, 4.8, 4.8, 0.7, 0.9, { rough: 0.1 }); }
      P.hatch(ring(cx, cy, 15.5, 23, 24), { ang: 30, gap: 2, a: 0.5, w: 0.5, piece: 6, fade: (x, y) => clamp((y - cy) / 23 * 0.7 + 0.5, 0, 1) });
      P.hatch(disc(cx, cy, 7.5, 12), { ang: -50, gap: 1.4, a: 0.7, w: 0.5, piece: 4 }); P.dot(cx, cy, 2, { c: RED, a: 0.9 });
      bridgeEnd(cx, cy, true);
      // RCS quads on the cone at the four compass points
      [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => { const px = cx + dx * 37, py = cy + dy * 37; const w = dx ? 8 : 14, h = dx ? 14 : 8; P.erase(rect4(px - w / 2, py - h / 2, w, h)); R(px - w / 2, py - h / 2, w, h, 1, 0.92, { rough: 0.15 }); tint(rect4(px - w / 2, py - h / 2, w, h), GRAPH, 0.3, { steps: 2 }); P.dots([[px - dy * 3.2 - dx * 0, py - dx * 3.2, 1.1], [px + dy * 3.2, py + dx * 3.2, 1.1]], null, 0.9); });
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([dx, dy], i) => { const px = cx + dx * 45, py = cy + dy * 45; C(px, py, 3, 0.9, 0.9); cross(px, py, 3, 0.5, 0.7); });
      sticker(cx - 46, cy + 22, 2, 7); sticker(cx + 44, cy + 24, 0, 7); scorch(cx + 30, cy + 44, 12, 7, 0.5); dent(cx - 20, cy + 46, 3); dent(cx + 12, cy - 47, 2.4);
      patchPlate(cx - 50, cy + 30, 16, 11, null);
    }
    // ---------- REAR (looking at the engines)
    const nozzleFace = (cx, cy, Rr, big) => {
      const u = Rr / 45;
      P.erase(disc(cx, cy, Rr + 1, 40)); C(cx, cy, Rr, big ? 2 : 1.8, 0.95, { passes: 2 }); C(cx, cy, Rr - 2.2 * u, 0.8, 0.8); C(cx, cy, 34 * u, 0.7, 0.75); C(cx, cy, 22 * u, 1, 0.9); 
      const nv = big ? 22 : 16;
      for (let i = 0; i < nv; i++) {
        const a0 = i * TAU / nv, pts = [], pts2 = [];
        for (let k = 0; k <= 6; k++) { const rr = (11 + 30 * k / 6) * u, aa = a0 + 0.95 * k / 6; pts.push([cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr]); pts2.push([cx + Math.cos(aa + 0.11) * rr, cy + Math.sin(aa + 0.11) * rr]); }
        const vane = pts.concat(pts2.reverse()); P.path(pts, { w: big ? 0.9 : 0.7, a: 0.85, rough: 0.15 }); P.path(vane.slice(7), { w: big ? 0.6 : 0.5, a: 0.55, rough: 0.15 });
        P.hatch(vane, { ang: (a0 * 180 / PI) % 180 + 20, gap: big ? 1.4 : 1.7, a: 0.6, w: 0.45, piece: 4, inset: 0.15, ragged: 0.3 });
      }
      P.hatch(disc(cx, cy, 11 * u, 16), { ang: -45, gap: big ? 1.5 : 1.8, a: 0.75, w: 0.5, piece: 5 }); C(cx, cy, 11 * u, 1.1, 0.9); C(cx, cy, 4.4 * u, 0.9, 0.9); P.dot(cx, cy, 1.6 * u, { a: 0.9 });
      P.hatch(ring(cx, cy, 34 * u, Rr - 2.2 * u, 36), { ang: 20, gap: big ? 2.2 : 2.6, a: 0.45, w: 0.5, piece: 7, fade: (x, y) => clamp((y - cy) / Rr * 0.6 + 0.6, 0.1, 1) });
      P.dots(Array.from({ length: big ? 30 : 20 }, (_, a) => [cx + Math.cos(a * TAU / (big ? 30 : 20)) * (Rr - 0.9 * u), cy + Math.sin(a * TAU / (big ? 30 : 20)) * (Rr - 0.9 * u), big ? 1.2 : 0.8]), null, 0.75);
    };
    { const cx = CX, cy = AXp;
      bridgeEnd(cx, cy, false); domeEnd(cx, cy); mastFront(cx, cy); lifeboatEnd(cx, cy);
      P.erase(disc(cx, cy, 64.5, 40));
      C(cx, cy, 64, 2.2, 0.95, { passes: 2, rough: 0.8 }); const dsk = disc(cx, cy, 64, 40); smudge(dsk, cy - 62, cy + 64, 0.03, 0.32);
      hat(dsk, -58, 3, 0.5, (x, y) => clamp((y - cy) / 64 * 0.95 + 0.38, 0, 1), { piece: 10 });
      C(cx, cy, 57, 1.4, 0.9); C(cx, cy, 55.4, 0.6, 0.6);
      P.dots(Array.from({ length: 36 }, (_, a) => [cx + Math.cos(a * TAU / 36) * 60.5, cy + Math.sin(a * TAU / 36) * 60.5, 0.6]), null, 0.6);
      // RCS ring on the aft face
      for (let a = 0; a < 8; a++) { const an = a * PI / 4 + PI / 8, px = cx + Math.cos(an) * 51, py = cy + Math.sin(an) * 51; C(px, py, 3.6, 1, 0.9); C(px, py, 1.7, 0.7, 0.9); P.dot(px, py, 0.7, { a: 0.9 }); }
      P.dots(Array.from({ length: 24 }, (_, a) => [cx + Math.cos(a * TAU / 24 + 0.06) * 47.5, cy + Math.sin(a * TAU / 24 + 0.06) * 47.5, 0.7]), null, 0.7);
      nozzleFace(cx, cy, 45, false);
      cruciform(cx, cy);
      sticker(cx - 47, cy + 32, 4, 6.5); scorch(cx + 42, cy + 34, 13, 8, 0.55); scorch(cx - 30, cy - 47, 10, 6, 0.4);
    }


    /* =============================================================
       SECTION MARKERS + SIX STATION CUTS
       ============================================================= */
    const stations = [262, 370, 510, 632, 680, 850];
    stations.forEach((x, i) => { P.guide(x, 58, x, 598, { c: BLUE, a: 0.22, w: 0.6 }); marker(x, 338, i + 1, 1); marker(x, 618, i + 1, 1); });
    const secY = 690, secX = [112, 204, 296, 388, 480, 572], SR = 40;
    const secBase = (cx, cy, R0 = SR) => {
      P.erase(disc(cx, cy, R0 + 1, 40)); tint(disc(cx, cy, R0 - 4, 30), '#e6d7ac', 0.4, { steps: 2, jit: 0.3 });
      C(cx, cy, R0, 1.7, 0.95, { passes: 2 }); C(cx, cy, R0 - 4.5, 0.8, 0.8, { rough: 0.2 });
      P.hatch(ring(cx, cy, R0 - 4.5, R0, 40), { ang: 45, gap: 1.6, a: 0.75, w: 0.55, piece: 6, inset: 0.1 });
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => L(cx + dx * (R0 + 4), cy + dy * (R0 + 4), cx + dx * (R0 + 9), cy + dy * (R0 + 9), 0.8, 0.7, { over: 0, rough: 0.1 }));
    };
    const chordX = (R0, dy) => Math.sqrt(Math.max(0, (R0 - 5) ** 2 - dy * dy));
    const deck = (cx, cy, dy, R0 = SR) => { const c = chordX(R0, dy); slab(cx - c, cy + dy - 1.4, 2 * c, 2.8, 0.7); };
    const secLabel = (cx, i, cap) => { C(cx - SR + 3, 690 - SR - 3 + 0, 0.01, 0.1, 0); tx('SEC ' + (i + 1) + '-' + (i + 1), cx - P.measure('SEC 1-1', 11) / 2, 761, 11, { a: 0.85 }); tx(cap, cx - P.measure(cap, 8.5) / 2, 772, 8.5, { a: 0.7 }); };
    const head2 = (x, y, r = 2.4) => { P.erase(disc(x, y, r + 0.5, 8)); C(x, y, r, 0.8, 0.9, { rough: 0.1 }); P.arc(x, y, r, r, PI, TAU, { w: 1.4, a: 0.9, passes: 1, rough: 0.1 }); };
    const cx0 = secX, cy0 = secY;
    // 1 - LH2 tank bay
    { const cx = cx0[0], cy = cy0; secBase(cx, cy);
      for (let a = 0; a < 8; a++) { const an = a * PI / 4 + PI / 8; L(cx + Math.cos(an) * 20, cy + Math.sin(an) * 20, cx + Math.cos(an) * 33.5, cy + Math.sin(an) * 33.5, 0.9, 0.85, { over: 0, rough: 0.2 }); }
      P.erase(disc(cx, cy, 20, 20)); C(cx, cy, 20, 1.6, 0.95, { passes: 2 }); C(cx, cy, 16.5, 0.6, 0.7); P.ellipse(cx, cy, 6, 20, { w: 0.5, a: 0.5, passes: 1 }); P.ellipse(cx, cy, 20, 6, { w: 0.5, a: 0.5, passes: 1 });
      P.hatch(disc(cx, cy, 20, 20), { ang: -50, gap: 2, a: 0.55, w: 0.5, piece: 6, fade: (x, y) => clamp(((x - cx) * 0.6 + (y - cy) * 0.7) / 20 + 0.5, 0, 1) }); P.stipple(disc(cx - 5, cy - 6, 10, 10), 18, { a: 0.5, r: 0.6 });
      C(cx, cy, 3, 0.8, 0.9); [[-30, -18], [30, -18], [-30, 18], [30, 18]].forEach(([dx, dy]) => { C(cx + dx * 0.9, cy + dy * 0.9, 2.2, 0.7, 0.85); });
      secLabel(cx, 0, 'LH2 TANK BAY'); }
    // 2 - reactor bay with cruciform radiators
    { const cx = cx0[1], cy = cy0;
      [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => { const l = dx ? 6 : 8; const q = dx ? [[cx + dx * SR, cy - 2.4], [cx + dx * (SR + l), cy - 2.4], [cx + dx * (SR + l), cy + 2.4], [cx + dx * SR, cy + 2.4]] : [[cx - 2.4, cy + dy * SR], [cx - 2.4, cy + dy * (SR + l)], [cx + 2.4, cy + dy * (SR + l)], [cx + 2.4, cy + dy * SR]]; PL([q[0], q[1], q[2], q[3]], 1, 0.9, { over: 0 }); const bx = q[1][0], by = q[1][1]; L(bx - 3, by - 1, bx + 3, by + 1, 0.6, 0.8, { over: 0 }); });
      secBase(cx, cy);
      P.erase(disc(cx, cy, 21, 20)); C(cx, cy, 21, 1.6, 0.95, { passes: 2 }); C(cx, cy, 18, 0.6, 0.7); P.hatch(ring(cx, cy, 16, 21, 24), { ang: 20, gap: 1.4, a: 0.7, w: 0.5, piece: 5, inset: 0.1 });
      for (let r = 0; r <= 2; r++) for (let q = -2 - (r ? 0 : 0); q <= 2; q++) { const px = cx + q * 5.8 + (r % 2 ? 2.9 : 0), py = cy + (r - 1) * 5; if (Math.hypot(px - cx, py - cy) < 15) C(px, py, 1.7, 0.6, 0.85, { rough: 0.1 }); }
      for (let a = 0; a < 6; a++) { const an = a * PI / 3 + PI / 6, px = cx + Math.cos(an) * 12.4, py = cy + Math.sin(an) * 12.4; C(px, py, 2.6, 0.7, 0.9, { rough: 0.1 }); cross(px, py, 2.6, 0.5, 0.7); }
      [[0, -1], [0, 1]].forEach(([dx, dy]) => { L(cx - 2.4, cy + dy * 21, cx - 2.4, cy + dy * 35, 0.8, 0.9, { over: 0 }); L(cx + 2.4, cy + dy * 21, cx + 2.4, cy + dy * 35, 0.8, 0.9, { over: 0 }); });
      { const a0 = cx + 17, b0 = cy + 24; for (let k = 0; k < 3; k++) { const a = k * TAU / 3 - PI / 2; tint([[a0 + Math.cos(a - 0.5) * 1.2, b0 + Math.sin(a - 0.5) * 1.2], [a0 + Math.cos(a - 0.5) * 3.8, b0 + Math.sin(a - 0.5) * 3.8], [a0 + Math.cos(a + 0.5) * 3.8, b0 + Math.sin(a + 0.5) * 3.8], [a0 + Math.cos(a + 0.5) * 1.2, b0 + Math.sin(a + 0.5) * 1.2]], RED, 0.7, { steps: 2, jit: 0.05 }); } C(a0, b0, 4.4, 0.6, 0.85, { rough: 0.1 }); }
      secLabel(cx, 1, 'REACTOR R-1'); }
    // 3 - cargo hold
    { const cx = cx0[2], cy = cy0; secBase(cx, cy);
      deck(cx, cy, 22); L(cx - chordX(SR, -24), cy - 24, cx + chordX(SR, -24), cy - 24, 1.2, 0.9, { over: 0 }); R(cx - 4, cy - 24, 8, 4, 0.7, 0.9, { rough: 0.1 }); L(cx, cy - 20, cx, cy - 14, 0.6, 0.9, { over: 0 });
      crate(cx - 5, cy - 14, 10, 8, null, 0.7); crate(cx - 31, cy + 10, 22, 12, 'A3', 0.8); crate(cx - 28, cy - 1, 16, 11, 'A2', 0.8); drum(cx + 10, cy + 6, 10, 16); drum(cx + 21, cy + 6, 10, 16);
      person(cx - 1, cy + 22, 0.62, 'stand', 1, { arm: 'up', uni: '#4b6fb8' }); ladder(cx + 26, cy - 14, cy + 20, 5, 4, 0.6);
      secLabel(cx, 2, 'CARGO HOLD'); }
    // 4 - mess deck + bunk deck (+ lifeboat under)
    { const cx = cx0[3], cy = cy0;
      { const lb = S.catmull([[cx - 24, cy + 38], [cx - 25, cy + 44], [cx - 14, cy + 50], [cx, cy + 51], [cx + 14, cy + 50], [cx + 25, cy + 44], [cx + 24, cy + 38]], false, 3); P.erase(lb.concat([[cx - 24, cy + 38]])); P.path(lb, { w: 1.5, rough: 0.4 }); hat(lb.concat([[cx - 24, cy + 38]]), -55, 2.6, 0.5, (x, y) => clamp((y - cy - 38) / 20 + 0.4, 0, 1), { piece: 6 }); C(cx, cy + 45, 3, 0.8, 0.9); tint(disc(cx, cy + 45, 2.8, 8), OCH, 0.5, { steps: 2, jit: 0.1 }); L(cx - 16, cy + 38, cx - 16, cy + 44, 1.4, 0.9, { over: 0 }); L(cx + 16, cy + 38, cx + 16, cy + 44, 1.4, 0.9, { over: 0 }); }
      secBase(cx, cy);
      deck(cx, cy, 0); deck(cx, cy, 30);
      L(cx - 31, cy - 12, cx - 12, cy - 12, 1.3, 0.9, { over: 0 }); R(cx - 31, cy - 11, 19, 10, 0.7, 0.9, { rough: 0.1 }); L(cx - 22, cy - 11, cx - 22, cy - 2, 0.5, 0.7, { over: 0 });
      L(cx - 8, cy - 10, cx + 8, cy - 10, 1.2, 0.9, { over: 0 }); L(cx, cy - 10, cx, cy - 1.5, 0.8, 0.9, { over: 0 }); RR(cx - 5, cy - 14, 3.4, 4, 1, 0.6, 0.9); wisp([[cx + 3, cy - 12], [cx + 4, cy - 18], [cx + 8, cy - 22]], 1.2, 2.4, NAVY);
      [cx - 15, cx + 15].forEach((x, i) => { head2(x, cy - 15, 2.6); PL([[x, cy - 12], [x, cy - 5]], 1.2, 0.9, { over: 0 }); L(x - 3, cy - 1.5, x + 3, cy - 1.5, 1, 0.9, { over: 0 }); });
      [[-1, 1], [1, 1]].forEach(([sx]) => { const bx = sx < 0 ? cx - 33 : cx + 14; [cy + 8, cy + 19].forEach(y => { R(bx, y, 19, 2.6, 0.7, 0.9, { rough: 0.1 }); }); L(bx, cy + 3, bx, cy + 28, 0.7, 0.9, { over: 0 }); L(bx + 19, cy + 3, bx + 19, cy + 28, 0.7, 0.9, { over: 0 }); });
      head2(cx - 30, cy + 15.5, 2.3); L(cx - 27, cy + 17, cx - 15, cy + 17, 2, 0.5, { over: 0 }); head2(cx + 30, cy + 5.6, 2.3); L(cx + 27, cy + 7, cx + 17, cy + 7, 2, 0.5, { over: 0 });
      cat(cx + 27, cy + 8.6, 0.42, { nozz: true });
      ladder(cx - 4, cy - 12, cy + 30, 8, 4, 0.6);
      secLabel(cx, 3, 'MESS + BUNKS'); }
    // 5 - hydroponic dome
    { const cx = cx0[4], cy = cy0;
      const dome = S.catmull([[cx - 25, cy - 31], [cx - 22, cy - 44], [cx - 10, cy - 52], [cx, cy - 54], [cx + 10, cy - 52], [cx + 22, cy - 44], [cx + 25, cy - 31]], false, 3);
      P.erase(dome.concat([[cx + 25, cy - 28], [cx - 25, cy - 28]])); tint(dome.concat([[cx + 25, cy - 30], [cx - 25, cy - 30]]), '#bcd7ee', 0.3, { steps: 2 }); P.path(dome, { w: 1.6, rough: 0.4 });
      for (let k = -2; k <= 2; k++) L(cx + k * 8, cy - 32, cx + k * 7.4, cy - 52 + Math.abs(k) * 4, 0.4, 0.4, { over: 0 });
      secBase(cx, cy - 0); L(cx - 25, cy - 31, cx + 25, cy - 31, 0.6, 0.4, { over: 0 });
      P.erase(rect4(cx - 24, cy - 34, 48, 6)); slab(cx - 24, cy - 33, 48, 3, 0.7); [-16, -6, 6, 16].forEach((dx, i) => plant(cx + dx, cy - 33, 7 + (i % 2) * 3, i)); person(cx + 20, cy - 33, 0.5, 'stand', -1, { arm: 'hold', uni: '#5a7a4a' }); L(cx - 10, cy - 50, cx + 10, cy - 50, 1.4, 0.7, { over: 0 });
      deck(cx, cy, 0); deck(cx, cy, 28);
      R(cx - 32, cy + 6, 14, 20, 0.7, 0.9, { rough: 0.1 }); R(cx + 18, cy + 6, 14, 20, 0.7, 0.9, { rough: 0.1 }); for (let yy = cy + 9; yy < cy + 25; yy += 4) { P.dots([[cx - 28, yy, 0.6], [cx - 24, yy, 0.6], [cx + 22, yy, 0.6], [cx + 26, yy, 0.6]], null, 0.9); }
      ladder(cx - 4, cy - 30, cy + 28, 8, 4, 0.6); C(cx + 4, cy - 12, 4.4, 0.7, 0.9); cross(cx + 4, cy - 12, 4.4, 0.5, 0.7);
      secLabel(cx, 4, 'GARDEN DOME'); }
    // 6 - bridge
    { const cx = cx0[5], cy = cy0;
      const bl = S.catmull([[cx - 21, cy - 36], [cx - 19, cy - 46], [cx - 9, cy - 53], [cx, cy - 55], [cx + 9, cy - 53], [cx + 19, cy - 46], [cx + 21, cy - 36]], false, 3);
      P.erase(bl.concat([[cx + 21, cy - 32], [cx - 21, cy - 32]])); P.path(bl, { w: 1.7, rough: 0.4 }); tint(bl.concat([[cx + 21, cy - 34], [cx - 21, cy - 34]]), BLUE, 0.22, { steps: 2 }); L(cx - 8, cy - 52, cx - 8, cy - 38, 0.5, 0.6, { over: 0 }); L(cx + 8, cy - 52, cx + 8, cy - 38, 0.5, 0.6, { over: 0 });
      secBase(cx, cy); P.erase(rect4(cx - 21, cy - 36, 42, 8)); tint(rect4(cx - 21, cy - 36, 42, 8), '#e6d7ac', 0.4, { steps: 2 });
      deck(cx, cy, 10); RR(cx - 9, cy - 8, 18, 8, 3, 0.8, 0.9); L(cx - 9, cy - 20, cx - 9, cy - 4, 1, 0.9, { over: 0 }); L(cx + 9, cy - 20, cx + 9, cy - 4, 1, 0.9, { over: 0 });
      head2(cx, cy - 16, 3); L(cx, cy - 13, cx, cy - 7, 2.2, 0.8, { over: 0, c: '#c2523a' }); L(cx - 5, cy - 11, cx - 9, cy - 4, 1, 0.9, { over: 0 }); L(cx + 5, cy - 11, cx + 9, cy - 4, 1, 0.9, { over: 0 });
      [[-27, -1], [27, 1]].forEach(([dx]) => { const q = [[cx + dx - 6, cy - 8], [cx + dx + 6, cy - 8], [cx + dx + 6, cy + 10], [cx + dx - 6, cy + 10]]; PG(q, 0.8, 0.9, { rough: 0.1 }); tint([[cx + dx - 4.6, cy - 6.6], [cx + dx + 4.6, cy - 6.6], [cx + dx + 4.6, cy - 1], [cx + dx - 4.6, cy - 1]], '#7fbf9a', 0.45, { steps: 2, jit: 0.1 }); });
      R(cx - 14, cy - 27, 28, 5, 0.7, 0.9, { rough: 0.1 }); P.dots(Array.from({ length: 6 }, (_, k) => [cx - 11 + k * 4.4, cy - 24.5, 0.6]), null, 0.9);
      L(cx - 28, cy + 24, cx + 28, cy + 24, 1, 0.8, { over: 0 }); L(cx - 26, cy + 28, cx + 26, cy + 28, 0.6, 0.7, { over: 0 }); C(cx - 14, cy + 19, 3, 0.7, 0.9); cross(cx - 14, cy + 19, 3, 0.5, 0.7); R(cx + 8, cy + 14, 14, 8, 0.6, 0.8, { rough: 0.1 });
      secLabel(cx, 5, 'BRIDGE'); }
    // circled sheet numbers over each cut
    secX.forEach((x, i) => { C(x - SR - 2, secY - SR - 10, 6.4, 1, 0.9, { rough: 0.15 }); P.text(String(i + 1), x - SR - 2 - 2.6, secY - SR - 10 + 3.3, { size: 10, a: 0.9 }); });


    /* =============================================================
       CIRCLED DETAILS + LEADERS
       ============================================================= */
    const outerTan = (x1, y1, r1, x2, y2, r2) => { const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx), b = Math.acos(clamp((r1 - r2) / d, -1, 1)); return [1, -1].map(sg => { const tt = a + sg * b; return [[x1 + r1 * Math.cos(tt), y1 + r1 * Math.sin(tt)], [x2 + r2 * Math.cos(tt), y2 + r2 * Math.sin(tt)]]; }); };
    const zoomLines = (x1, y1, r1, x2, y2, r2, a = 0.65) => outerTan(x1, y1, r1, x2, y2, r2).forEach(([p1, p2]) => L(p1[0], p1[1], p2[0], p2[1], 0.8, a, { over: 0, rough: 0.5, passes: 1 }));
    // (A) engine nozzle seen from astern — big detail, turbine vanes
    { const dx = 1180, dy = 785, Rr = 92;
      zoomLines(CX, AXp, 46, dx, dy, Rr + 7, 0.6);
      P.erase(disc(dx, dy, Rr + 8, 48)); C(dx, dy, Rr + 6.5, 2, 0.95, { passes: 2, rough: 0.9 }); C(dx, dy, Rr + 3.6, 0.7, 0.7);
      P.dots(Array.from({ length: 44 }, (_, a) => [dx + Math.cos(a * TAU / 44) * (Rr + 5), dy + Math.sin(a * TAU / 44) * (Rr + 5), 0.9]), null, 0.8);
      nozzleFace(dx, dy, Rr, true);
      for (let a = 0; a < 24; a++) { const an = a * TAU / 24; L(dx + Math.cos(an) * (Rr - 12), dy + Math.sin(an) * (Rr - 12), dx + Math.cos(an) * (Rr - 3.6), dy + Math.sin(an) * (Rr - 3.6), 0.7, 0.7, { over: 0, rough: 0.1 }); }
      P.hatch(ring(dx, dy, Rr + 0.5, Rr + 6, 48), { ang: 30, gap: 1.8, a: 0.5, w: 0.5, piece: 6, fade: (x, y) => clamp((y - dy) / Rr * 0.6 + 0.5, 0.1, 1) });
      hw('DETAIL A', dx - 92, 908, 17); tx('NOZZLE, SEEN FROM ASTERN', dx - 92, 922, 10, { a: 0.75 }); P.note('22 TURBINE VANES', 1284, 846, 1246, 826, { size: 10.5 });
      P.note('THROAT', 1288, 775, dx + 26, dy - 4, { size: 11 });
    }
    // (C) reactor core, a magnified circle up in the corner of the elevation
    { const dx = 170, dy = 97, Rr = 34;
      zoomLines(371, Z(-3), 36, dx, dy, Rr + 3, 0.32); C(371, Z(-3), 36, 0.7, 0.5, { rough: 0.5 });
      P.erase(disc(dx, dy, Rr + 4, 32)); C(dx, dy, Rr + 3, 1.7, 0.95, { passes: 2 }); C(dx, dy, Rr - 4, 0.7, 0.8);
      P.hatch(ring(dx, dy, Rr - 4, Rr + 3, 32), { ang: 45, gap: 1.5, a: 0.75, w: 0.5, piece: 5, inset: 0.1 });
      for (let r = -4; r <= 4; r++) for (let q = -4; q <= 4; q++) { const px = dx + q * 5.6 + (r % 2 ? 2.8 : 0), py = dy + r * 4.85; if (Math.hypot(px - dx, py - dy) < Rr - 8) { const ctl = (r * 3 + q * 5 + 40) % 7 === 0; C(px, py, ctl ? 2.4 : 1.7, 0.6, 0.85, { rough: 0.1 }); if (ctl) cross(px, py, 2.4, 0.4, 0.7); else if ((r + q) % 2) P.dot(px, py, 0.7, { a: 0.7 }); } }
      P.hatch(disc(dx, dy, Rr - 6, 24), { ang: -55, gap: 2.4, a: 0.3, w: 0.45, piece: 6, fade: (x, y) => clamp(((x - dx) + (y - dy)) / 40 + 0.4, 0, 1) });
      hw('DETAIL C', 212, 88, 12); tx('REACTOR CORE', 212, 101, 9, { a: 0.75 }); }
    // (D) docking clamp, magnified circle over the nose
    { const dx = 972, dy = 96, Rr = 32, nx = 961, ny = AXe;
      zoomLines(nx, ny, 28, dx, dy, Rr + 3, 0.5); C(nx, ny, 28, 0.7, 0.5, { rough: 0.5 });
      P.erase(disc(dx, dy, Rr + 4, 32)); C(dx, dy, Rr + 3, 1.7, 0.95, { passes: 2 }); C(dx, dy, Rr - 5, 0.8, 0.85); C(dx, dy, 12, 1, 0.9); C(dx, dy, 5, 0.9, 0.9);
      for (let a = 0; a < 8; a++) { const an = a * PI / 4; const c1 = Math.cos(an), s1 = Math.sin(an); const q = [[dx + c1 * 15 - s1 * 3.4, dy + s1 * 15 + c1 * 3.4], [dx + c1 * 27 - s1 * 3.4, dy + s1 * 27 + c1 * 3.4], [dx + c1 * 27 + s1 * 3.4, dy + s1 * 27 - c1 * 3.4], [dx + c1 * 15 + s1 * 3.4, dy + s1 * 15 - c1 * 3.4]]; P.erase(q); PG(q, 0.9, 0.9, { rough: 0.1 }); P.hatch(q, { ang: 30 + a * 20, gap: 1.4, a: 0.6, w: 0.45, piece: 4 }); C(dx + c1 * 15.5, dy + s1 * 15.5, 1.5, 0.6, 0.9, { rough: 0.05 });
        L(dx + c1 * 12, dy + s1 * 12, dx + c1 * 5, dy + s1 * 5, 0.5, 0.7, { over: 0, rough: 0.1 }); }
      P.hatch(disc(dx, dy, 4.6, 8), { ang: 40, gap: 1.2, a: 0.7, w: 0.45, piece: 3 }); P.dot(dx, dy, 1.4, { c: RED, a: 0.9 });
      P.dots(Array.from({ length: 24 }, (_, a) => [dx + Math.cos(a * TAU / 24) * (Rr - 1.4), dy + Math.sin(a * TAU / 24) * (Rr - 1.4), 0.7]), null, 0.75);
      hw('DETAIL D', 890, 78, 12); tx('DOCK CLAMP', 890, 91, 9, { a: 0.75 }); }


    /* =============================================================
       INSET C  —  fuel / power / data schematic (hand-inked PCB look, red + green trace bundles)
       ============================================================= */
    const chamf = (pts, d) => { const out = [pts[0]]; for (let i = 1; i + 1 < pts.length; i++) { const a = pts[i - 1], b = pts[i], c = pts[i + 1], l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]), d1 = Math.min(d, l1 / 2), d2 = Math.min(d, l2 / 2); out.push([b[0] + (a[0] - b[0]) / l1 * d1, b[1] + (a[1] - b[1]) / l1 * d1], [b[0] + (c[0] - b[0]) / l2 * d2, b[1] + (c[1] - b[1]) / l2 * d2]); } out.push(pts[pts.length - 1]); return out; };
    const offs = (pts, o) => { const m = pts.length; return pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], c = pts[Math.min(m - 1, i + 1)]; let t1x = p[0] - a[0], t1y = p[1] - a[1], t2x = c[0] - p[0], t2y = c[1] - p[1]; const l1 = Math.hypot(t1x, t1y) || 1, l2 = Math.hypot(t2x, t2y) || 1; t1x /= l1; t1y /= l1; t2x /= l2; t2y /= l2; if (i === 0) { t1x = t2x; t1y = t2y; } if (i === m - 1) { t2x = t1x; t2y = t1y; } let nx = -(t1y + t2y), ny = t1x + t2x; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl; const dt = nx * (-t1y) + ny * t1x; return [p[0] + nx * o / Math.max(0.5, dt), p[1] + ny * o / Math.max(0.5, dt)]; }); };
    const traces = (A, B, mid, gap, col, o = {}) => { const cp = chamf(mid, o.ch ?? 8), n = A.length; for (let k = 0; k < n; k++) { const lane = offs(cp, (k - (n - 1) / 2) * gap); P.pl([A[k]].concat(lane, [B[k]]), { w: o.w ?? 1.3, c: col, a: 0.95, rough: 0.3, over: 0, passes: 1 }); if (o.pads) { C(A[k][0], A[k][1], o.pads, 0.9, 0.95, { c: col, rough: 0.1 }); C(B[k][0], B[k][1], o.pads, 0.9, 0.95, { c: col, rough: 0.1 }); } } };
    const pinsOf = (x, y, w, h, side, n, from = 0.5) => { const out = []; for (let i = 0; i < n; i++) { const f = (i + from) / n; if (side === 'R') out.push([x + w, y + f * h]); if (side === 'L') out.push([x, y + f * h]); if (side === 'T') out.push([x + f * w, y]); if (side === 'B') out.push([x + f * w, y + h]); } return out; };
    const drawPins = (x, y, w, h, side, n, from = 0.5, len = 4.5) => pinsOf(x, y, w, h, side, n, from).map(([px, py]) => { const dx = side === 'R' ? len : side === 'L' ? -len : 0, dy = side === 'B' ? len : side === 'T' ? -len : 0; L(px, py, px + dx, py + dy, 1, 0.9, { over: 0, rough: 0.1 }); return [px + dx, py + dy]; });
    const bigChip = (x, y, w, h) => {
      P.erase(rect4(x - 1, y - 1, w + 2, h + 2)); R(x, y, w, h, 1.9, 0.95, { rough: 0.3, over: 1 }); R(x + 4, y + 4, w - 8, h - 8, 0.8, 0.8, { rough: 0.2 });
      P.hatch(ringPoly(rect4(x, y, w, h), rect4(x + 4, y + 4, w - 8, h - 8)), { ang: 45, gap: 1.6, a: 0.8, w: 0.55, piece: 6, inset: 0.1 });
      R(x + 12, y + 12, w - 24, h - 24, 1.3, 0.95, { rough: 0.25 }); P.hatch(rect4(x + 12, y + 12, w - 24, h - 24), { ang: -45, gap: 1.8, a: 0.55, w: 0.5, piece: 8, inset: 0.2 });
      const cx = x + w / 2, cy = y + h / 2, q = 12; R(cx - q, cy - q, 2 * q, 2 * q, 1.1, 0.95, { rough: 0.2 }); P.erase(rect4(cx - q + 1, cy - q + 1, 2 * q - 2, 2 * q - 2));
      for (let a = 0; a < 20; a++) { const an = a * TAU / 20, ex = Math.cos(an), ey = Math.sin(an), t0 = 3.5, t1 = q / Math.max(Math.abs(ex), Math.abs(ey)); L(cx + ex * t0, cy + ey * t0, cx + ex * Math.min(t1, q * 1.4), cy + ey * Math.min(t1, q * 1.4), 0.5, 0.7, { over: 0, rough: 0.1 }); }
      R(cx - 4, cy - 4, 8, 8, 0.9, 0.95, { rough: 0.1 }); P.hatch(rect4(cx - 4, cy - 4, 8, 8), { ang: 60, gap: 1.2, a: 0.7, w: 0.45, piece: 3 }); L(x + 1, y + 8, x + 8, y + 1, 1.4, 0.9, { over: 0 });
    };
    const smallChip = (x, y, w, h, side) => { P.erase(rect4(x - 1, y - 1, w + 2, h + 2)); R(x, y, w, h, 1.5, 0.95, { rough: 0.2 }); P.hatch(rect4(x, y, w, h), { ang: 55, gap: 1.7, a: 0.7, w: 0.55, piece: 7, inset: 0.4, cross: 60 }); L(x + 1.2, y + 1.2, x + 6, y + 1.2, 1.2, 0.9, { over: 0 }); };
    const resistor = (x, y, w = 18) => { RR(x, y, w, 6, 2.5, 0.9, 0.9, { rough: 0.1 }); [0.28, 0.42, 0.72].forEach(f => L(x + w * f, y + 0.6, x + w * f, y + 5.4, 0.9, 0.7, { over: 0, rough: 0.05 })); L(x - 5, y + 3, x, y + 3, 0.8, 0.9, { over: 0 }); L(x + w, y + 3, x + w + 5, y + 3, 0.8, 0.9, { over: 0 }); };
    const capacitor = (x, y, r) => { P.erase(disc(x, y, r + 0.5, 14)); C(x, y, r, 1.3, 0.95, { rough: 0.15 }); C(x, y, r - 2.4, 0.6, 0.7, { rough: 0.1 }); L(x - r * 0.5, y, x + r * 0.5, y, 0.9, 0.9, { over: 0 }); L(x, y - r * 0.5, x, y + r * 0.5, 0.9, 0.9, { over: 0 }); P.hatch(disc(x, y, r - 0.6, 12), { ang: 55, gap: 2, a: 0.32, w: 0.45, piece: 5, fade: (px, py) => clamp(((px - x) + (py - y)) / (r * 2) + 0.5, 0, 1) }); };
    const xmark = (x, y, lx, ly) => { L(x - 3, y - 3, x + 3, y + 3, 0.9, 0.9, { c: RED, over: 0, rough: 0.1 }); L(x + 3, y - 3, x - 3, y + 3, 0.9, 0.9, { c: RED, over: 0, rough: 0.1 }); PL([[x + 3, y - 3], [x + 8, y - 8], [lx, ly]], 0.7, 0.9, { c: RED, over: 0 }); C(lx, ly, 1.6, 0.7, 0.9, { c: RED, rough: 0.05 }); };
    { const fx = 64, fy = 782, fw = 552, fh = 173;
      // blue underdrawing
      C(462, 866, 62, 0.8, 0.28, { c: BLUE, rough: 1.2 }); C(462, 866, 74, 0.7, 0.2, { c: BLUE, rough: 1.2 }); C(263, 866, 58, 0.7, 0.22, { c: BLUE, rough: 1.2 });
      [[70, 950, 250, 800], [330, 790, 610, 950], [80, 830, 300, 950], [400, 950, 610, 812]].forEach(([a, b, c2, d]) => L(a, b, c2, d, 0.8, 0.26, { c: BLUE, over: 6, rough: 0.9 }));
      L(64, 866, 616, 866, 0.6, 0.24, { c: BLUE, over: 4, rough: 0.6 }); L(263, 788, 263, 944, 0.6, 0.24, { c: BLUE, over: 3, rough: 0.6 }); L(462, 788, 462, 944, 0.6, 0.24, { c: BLUE, over: 3, rough: 0.6 });
      P.rrect(fx, fy, fw, fh, 9, { w: 1.7, a: 0.9, passes: 1, rough: 0.35 }); P.rrect(fx + 5, fy + 5, fw - 10, fh - 10, 7, { w: 0.7, a: 0.55, passes: 1, rough: 0.3 });
      [[78, 797], [602, 797], [78, 940], [602, 940]].forEach(([x, y]) => { C(x, y, 5.5, 1.1, 0.9, { rough: 0.15 }); C(x, y, 3, 0.7, 0.8, { rough: 0.1 }); });
      P.ruler(96, 787, 584, 787, 6, 5, { side: 1, len: 5, a: 0.55 });
      tx('FUEL / POWER / DATA', 96, 806, 10.5, { a: 0.8 });
      // tanks, pumps, fuel lines (graphite)
      [[100, 846], [100, 897]].forEach(([x, y], k) => { P.erase(disc(x, y, 15.5, 16)); C(x, y, 15, 1.4, 0.95, { passes: 2 }); P.ellipse(x, y, 5, 15, { w: 0.5, a: 0.5, passes: 1 }); P.ellipse(x, y, 15, 4.6, { w: 0.5, a: 0.5, passes: 1 });
        P.hatch(disc(x, y, 14, 16), { ang: -50, gap: 2, a: 0.55, w: 0.5, piece: 6, fade: (px, py) => clamp(((px - x) * 0.6 + (py - y) * 0.7) / 15 + 0.5, 0, 1) }); P.stipple(disc(x - 4, y - 5, 7, 8), 12, { a: 0.5, r: 0.6 }); });
      tx('LH2', 91, 875, 9, { a: 0.8 });
      [[140, 832], [140, 886]].forEach(([x, y]) => { smallChip(x, y, 34, 24); });
      [[115, 846, 140, 844], [115, 897, 140, 898]].forEach(([a, b, c2, d]) => { L(a, b - 2, c2, d - 2, 1.4, 0.9, { over: 0 }); L(a, b + 2, c2, d + 2, 1.4, 0.9, { over: 0 }); });
      const pA1 = drawPins(140, 832, 34, 24, 'R', 4), pA2 = drawPins(140, 886, 34, 24, 'R', 4);
      bigChip(226, 832, 74, 68); bigChip(424, 832, 74, 68);
      const rL = drawPins(226, 832, 74, 68, 'L', 8, 0.5), rR = drawPins(226, 832, 74, 68, 'R', 8, 0.5), rT = drawPins(226, 832, 74, 68, 'T', 8, 0.5), rB = drawPins(226, 832, 74, 68, 'B', 8, 0.5);
      const bL = drawPins(424, 832, 74, 68, 'L', 8, 0.5), bR = drawPins(424, 832, 74, 68, 'R', 8, 0.5), bT = drawPins(424, 832, 74, 68, 'T', 8, 0.5), bB = drawPins(424, 832, 74, 68, 'B', 8, 0.5);
      // fuel: ink traces pump -> reactor
      [pA1, pA2].forEach((pa, j) => pa.forEach((p, i) => { const q = rL[j * 4 + i]; P.pl([p, [p[0] + 8, p[1]], [q[0] - 8, q[1]], q], { w: 1.3, a: 0.9, rough: 0.3, over: 0, passes: 1 }); C(p[0], p[1], 1.4, 0.7, 0.9, { rough: 0.05 }); C(q[0], q[1], 1.4, 0.7, 0.9, { rough: 0.05 }); }));
      // red power bus reactor -> computer
      traces(rR, bL, [[rR[0][0] + 6, 866], [340, 866], [354, 846], [386, 846], [400, 866], [bL[0][0] - 6, 866]], 3.6, RED, { ch: 9, pads: 1.6 });
      // green data bus over the top
      traces(rT, bT.slice().reverse(), [[263, rT[0][1] - 6], [263, 812], [461, 812], [461, bT[0][1] - 6]], 3.2, GRN, { ch: 9, pads: 1.6 });
      // sensor lines straight down to the green rail
      rB.slice(0, 4).concat(bB.slice(0, 4)).forEach(p => { L(p[0], p[1], p[0], 947, 1.2, 0.95, { c: GRN, over: 0 }); P.dot(p[0], 913, 1.3, { c: GRN, a: 0.95 }); });
      // right side: computer -> life support / engine controller (green), power taps (red)
      smallChip(548, 826, 52, 30); smallChip(548, 868, 52, 30); smallChip(548, 910, 52, 24);
      const lsP = drawPins(548, 826, 52, 30, 'L', 4, 0.5), enP = drawPins(548, 868, 52, 30, 'L', 4, 0.5), gdP = drawPins(548, 910, 52, 24, 'L', 4, 0.5);
      traces(bR.slice(0, 4), lsP, [[bR[0][0] + 6, 851], [522, 851], [530, 841], [lsP[0][0] - 6, 841]], 3.2, GRN, { ch: 6, pads: 1.5 });
      traces(bR.slice(4, 8), enP, [[bR[4][0] + 6, 880], [522, 880], [530, 883], [enP[0][0] - 6, 883]], 3.2, GRN, { ch: 6, pads: 1.5 });
      // power rail + capacitor bank
      L(236, 913, 526, 913, 1.5, 0.95, { c: RED, over: 0, rough: 0.3 }); L(244, 947, 470, 947, 1.5, 0.95, { c: GRN, over: 0, rough: 0.3 });
      rB.slice(4).forEach(p => L(p[0], p[1], p[0], 913, 1.2, 0.95, { c: RED, over: 0 })); bB.slice(4).forEach(p => L(p[0], p[1], p[0], 913, 1.2, 0.95, { c: RED, over: 0 }));
      [270, 306, 342, 378, 414].forEach((x, i) => { capacitor(x, 930, 8.6); L(x, 913, x, 921.4, 1, 0.95, { c: RED, over: 0 }); L(x, 938.6, x, 947, 1, 0.95, { c: GRN, over: 0 }); P.dot(x, 913, 1.5, { c: RED, a: 0.95 }); P.dot(x, 947, 1.5, { c: GRN, a: 0.95 }); });
      L(526, 913, 536, 913, 1.5, 0.95, { c: RED, over: 0 }); L(536, 913, 536, 929, 1.4, 0.95, { c: RED, over: 0 }); gdP.forEach(q => { L(536, q[1], q[0], q[1], 1.2, 0.95, { c: RED, over: 0 }); C(q[0], q[1], 1.3, 0.7, 0.9, { c: RED, rough: 0.05 }); });
      // resistors, diodes, SMD dust, hatch patches, red x marks
      [[492, 804], [516, 804], [540, 804]].forEach(([x, y]) => resistor(x, y, 14)); L(566, 807, 596, 807, 1, 0.9, { c: RED, over: 0 }); xmark(560, 800, 574, 792);
      for (let r = 0; r < 3; r++) for (let c2 = 0; c2 < 6; c2++) R(314 + c2 * 14, 902 + r * 0 + (r * 0), 5, 2.4, 0.6, 0.85, { rough: 0.05, over: 0 });
      for (let c2 = 0; c2 < 5; c2++) { R(330 + c2 * 14, 884, 3, 6, 0.6, 0.85, { rough: 0.05, over: 0 }); R(330 + c2 * 14, 892, 3, 6, 0.6, 0.85, { rough: 0.05, over: 0 }); }
      P.hatch([[316, 806], [352, 796], [364, 820], [326, 826]], { ang: 40, gap: 4, a: 0.6, w: 0.5, piece: 40, cross: 90, inset: 0 });
      P.hatch(S.catmull([[520, 936], [546, 938], [548, 950], [522, 950]], true, 3), { ang: 40, gap: 3, a: 0.6, w: 0.5, piece: 30, cross: 90, inset: 0 });
      xmark(200, 930, 210, 918); xmark(320, 940, 330, 928);
      PL([[290, 898], [298, 898], [298, 906]], 0.9, 0.9, { over: 0 }); PG([[294, 917], [301, 917], [297.5, 923]], 0.8, 0.9, { over: 0, rough: 0.05 });
      // spiral inductors (like the PCB reference)
      [[170, 934, 9], [200, 908, 6]].forEach(([x, y, r]) => { const sp = []; for (let a = 0; a < 3.4 * TAU; a += 0.35) { const rr = 1.5 + (r - 1.5) * a / (3.4 * TAU); sp.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } P.path(sp, { w: 0.9, a: 0.9, rough: 0.1 }); });
      tx('LS', 550, 822, 9, { a: 0.8 }); tx('ENG', 550, 864, 9, { a: 0.8 }); tx('GDN', 550, 906, 9, { a: 0.8 });
    }


    /* =============================================================
       INSET B  —  orbit construction with red burn path (graph-paper look)
       ============================================================= */
    { const bx = 640, by = 645, bw = 370, bh = 185, pcx = 772, pcy = 742, PR = 28;
      const inB = (x, y) => x > bx + 8 && x < bx + bw - 8 && y > by + 8 && y < by + bh - 8;
      const clipCircle = (cx, cy, r, o) => { let run = []; for (let a = 0; a <= TAU + 0.03; a += 0.022) { const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (inB(x, y)) run.push([x, y]); else { if (run.length > 3) P.path(run, o); run = []; } } if (run.length > 3) P.path(run, o); };
      // graph paper
      for (let x = bx + 20; x < bx + bw - 5; x += 10) P.guide(x, by + 6, x, by + bh - 6, { c: '#3f8f8f', a: (x - bx) % 50 === 0 ? 0.3 : 0.13, w: 0.45, over: 0 });
      for (let y = by + 20; y < by + bh - 5; y += 10) P.guide(bx + 6, y, bx + bw - 6, y, { c: '#3f8f8f', a: (y - by) % 50 === 0 ? 0.3 : 0.13, w: 0.45, over: 0 });
      P.rect(bx, by, bw, bh, { w: 1.6, a: 0.9, passes: 1, rough: 0.35, over: 1 }); P.rect(bx + 4, by + 4, bw - 8, bh - 8, { w: 0.6, a: 0.55, passes: 1, rough: 0.3, over: 1 });
      // construction: overlapping wobbly orbits, arcs and axes
      [[46, 1.1, 0.75], [58, 0.7, 0.5], [70, 0.9, 0.7], [84, 0.7, 0.5], [96, 1.2, 0.8], [112, 0.7, 0.5], [128, 1.1, 0.75], [146, 0.7, 0.5], [166, 1.2, 0.8], [190, 0.7, 0.5]].forEach(([r, w, a], i) => { for (let k = 0; k < (i % 3 === 0 ? 3 : 2); k++) clipCircle(pcx + P.r(-3, 3), pcy + P.r(-3, 3), r + P.r(-1.5, 1.5), { w: w * (k ? 0.7 : 1), a: a * (k ? 0.6 : 1), rough: 0.9 }); });
      clipCircle(pcx + 40, pcy - 18, 150, { w: 0.6, a: 0.4, rough: 0.9 }); clipCircle(pcx - 60, pcy + 30, 130, { w: 0.6, a: 0.35, rough: 0.9 });
      P.arcTicks(pcx, pcy, 76, 0, TAU - 0.01, PI / 60, 5, { len: 5, a: 0.55 });
      L(bx + 10, pcy + 42, bx + bw - 10, pcy - 40, 0.7, 0.45, { over: 0 }); L(pcx - 30, by + 8, pcx + 30, by + bh - 8, 0.6, 0.35, { over: 4 });
      P.ruler(pcx - 6, by + 70, pcx + 120, by + 24, 6.5, 5, { len: 5, a: 0.5 });
      // planet + ring (back half, planet, front half)
      const ellPoly = (rx, ry, rot) => Array.from({ length: 48 }, (_, k) => { const a = k * TAU / 48, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [pcx + x * Math.cos(rot) - y * Math.sin(rot), pcy + x * Math.sin(rot) + y * Math.cos(rot)]; });
      const rot = -0.3;
      [[64, 17], [58, 15.2], [52, 13.6], [47, 12.2], [42.5, 11]].forEach(([rx, ry], i) => P.arc(pcx, pcy, rx, ry, PI, TAU, { rot, w: i === 0 ? 1.3 : 0.7, a: i === 0 ? 0.9 : 0.6, passes: 1, rough: 0.3 }));
      P.hatch(ringPoly(ellPoly(64, 17, rot), ellPoly(54, 14.2, rot)), { ang: -20, gap: 1.6, a: 0.6, w: 0.5, piece: 5, inset: 0.1 });
      P.erase(disc(pcx, pcy, PR + 1.5, 32)); C(pcx, pcy, PR, 1.8, 0.95, { passes: 2 });
      const pd = disc(pcx, pcy, PR, 32);
      P.hatch(pd, { ang: -48, gap: 1.8, a: 0.6, w: 0.5, piece: 8, fade: (x, y) => clamp(((x - pcx) * 0.7 + (y - pcy) * 0.6) / PR * 0.5 + 0.55, 0.15, 1), cross: 50 });
      [-19, -11, -3, 6, 15, 22].forEach((dy, i) => { const w = Math.sqrt(Math.max(0, PR * PR - dy * dy)); CV([[pcx - w, pcy + dy], [pcx, pcy + dy + 3], [pcx + w, pcy + dy]], i % 2 ? 1.4 : 0.6, 0.85, { rough: 0.3 }); });
      P.hatch([[pcx - 28, pcy - 3], [pcx + 28, pcy - 3], [pcx + 26, pcy + 6], [pcx - 26, pcy + 6]].map(q => q), { ang: 0, gap: 1.3, a: 0.5, w: 0.5, piece: 6 });
      [[64, 17], [58, 15.2], [52, 13.6], [47, 12.2], [42.5, 11]].forEach(([rx, ry], i) => P.arc(pcx, pcy, rx, ry, 0, PI, { rot, w: i === 0 ? 1.4 : 0.7, a: i === 0 ? 0.92 : 0.6, passes: 1, rough: 0.3 }));
      P.hatch(ringPoly(ellPoly(64, 17, rot), ellPoly(54, 14.2, rot)).filter((q, i) => true), { ang: 25, gap: 1.5, a: 0.5, w: 0.5, piece: 5, inset: 0.1, fade: (x, y) => (y > pcy + Math.tan(rot) * (x - pcx) ? 1 : 0.1) });
      // moons with crescent shading
      [[bx + 34, by + 62, 7.5], [pcx + 98, pcy - 40, 8], [pcx + 66, pcy + 62, 5.5], [pcx - 100, pcy + 34, 4.6]].forEach(([x, y, r], i) => { P.erase(disc(x, y, r + 0.5, 14)); C(x, y, r, 1.3, 0.95, { rough: 0.15 }); P.hatch(disc(x, y, r, 14), { ang: 50, gap: 1.3, a: 0.75, w: 0.5, piece: 4, fade: (px, py) => clamp(((px - x) * 0.9 + (py - y) * 0.5) / r * 0.7 + 0.35, 0, 1), inset: 0.15 }); C(x, y, r + 4.5, 0.5, 0.5, { rough: 0.3 }); });
      // planned course (graphite dashes) and the actual red burn path
      const plan = S.catmull([[bx + bw - 12, by + 60], [pcx + 150, pcy - 40], [pcx + 100, pcy + 40], [pcx + 30, pcy + 78], [pcx - 50, pcy + 66], [pcx - 82, pcy + 10]], false, 5);
      for (let i = 0; i + 1 < plan.length; i += 3) if ((i / 3) % 2 === 0 && plan[i + 2]) { const a = plan[i], b2 = plan[Math.min(plan.length - 1, i + 2)]; if (inB(a[0], a[1]) && inB(b2[0], b2[1])) L(a[0], a[1], b2[0], b2[1], 0.7, 0.55, { over: 0, rough: 0.3 }); }
      const path = S.catmull([[bx + bw - 14, by + 12], [pcx + 205, pcy - 70], [pcx + 165, pcy - 6], [pcx + 118, pcy + 44], [pcx + 60, pcy + 72], [pcx - 6, pcy + 78], [pcx - 58, pcy + 62], [pcx - 84, pcy + 24], [pcx - 88, pcy - 10]], false, 4);
      P.path(path, { w: 1.5, a: 0.95, c: RED, rough: 0.35, passes: 1 });
      let acc = 0; for (let i = 1; i < path.length; i++) { acc += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); if (acc > 20) { acc = 0; const a = path[i - 1], b2 = path[i], dxx = b2[0] - a[0], dyy = b2[1] - a[1], l = Math.hypot(dxx, dyy) || 1; L(b2[0] - dyy / l * 3.4, b2[1] + dxx / l * 3.4, b2[0] + dyy / l * 3.4, b2[1] - dxx / l * 3.4, 0.8, 0.9, { c: RED, over: 0, rough: 0.1 }); } }
      { const e = path[path.length - 1], q = path[path.length - 2]; arrowHead(e[0], e[1], Math.atan2(e[1] - q[1], e[0] - q[0]), 8, 1.4, RED); }
      [[pcx - 58, pcy + 62, 'BURN 2'], [pcx + 165, pcy - 6, 'BURN 1']].forEach(([x, y]) => { C(x, y, 7.5, 1.1, 0.95, { c: RED, rough: 0.2 }); C(x, y, 13, 0.8, 0.85, { c: RED, rough: 0.3 }); C(x, y, 1.6, 0.8, 0.95, { c: RED, rough: 0.1 }); L(x - 4, y - 2, x + 4, y - 2, 1, 0.95, { c: RED, over: 0 }); L(x - 4, y + 2, x + 4, y + 2, 1, 0.95, { c: RED, over: 0 }); });
      // scale, stars, patches, labels
      [[bx + 300, by + 30, 5], [bx + 62, by + 150, 4], [bx + 340, by + 150, 6]].forEach(([x, y, r]) => { cross(x, y, r, 0.8, 0.8); L(x - r * 0.6, y - r * 0.6, x + r * 0.6, y + r * 0.6, 0.5, 0.6, { over: 0 }); L(x + r * 0.6, y - r * 0.6, x - r * 0.6, y + r * 0.6, 0.5, 0.6, { over: 0 }); });
      P.hatch([[bx + 316, by + 104], [bx + 358, by + 98], [bx + 362, by + 130], [bx + 322, by + 138]], { ang: 42, gap: 2.2, a: 0.45, w: 0.5, piece: 60, cross: 90, inset: 0 });
      P.hatch([[bx + 10, by + 132], [bx + 34, by + 126], [bx + 46, by + 170], [bx + 20, by + 174]], { ang: 46, gap: 2.2, a: 0.45, w: 0.5, piece: 60, cross: 90, inset: 0 });
      plate('TRANSFER ORBIT', bx + 60, by + 25, 12); tx('SATURN - TITAN - ARGO-7', bx + 62, by + 41, 8.5, { a: 0.75 });
      plate('BURN 2', pcx - 98, pcy + 52, 10); plate('BURN 1', pcx + 176, pcy + 26, 10); plate('DV 410 M/S', bx + 14, by + bh - 12, 9.5);
      plate('TITAN', pcx + 106, pcy - 52, 9);
    }


    /* =============================================================
       LEGEND: tonal swatches, pen key  /  TITLE BLOCK  /  CREW NOTES
       ============================================================= */
    { const lx = 1372, ly = 648;
      tx('TONE KEY', lx + 2, ly + 8, 10, { a: 0.8 });
      const gaps = [0, 6, 3.6, 2.4, 1.6];
      gaps.forEach((g, i) => { const x = lx + i * 36, y = ly + 16, w = 34, h = 34; R(x, y, w, h, 1, 0.9, { rough: 0.3 }); if (g) { P.hatch(rect4(x, y, w, h), { ang: -55, gap: g, a: 0.5 + i * 0.06, w: 0.55, piece: 8, inset: 0.6, cross: i > 2 ? 60 : undefined }); if (i > 1) smudge(rect4(x, y, w, h), y, y + h, 0.05 * i, 0.12 * i); } });
      // pen key
      tx('PEN KEY', lx + 2, ly + 68, 10, { a: 0.8 });
      const kk = [['OUTLINE', 2.3, 0.95, null], ['DETAIL', 1, 0.9, null], ['HIDDEN', 0.8, 0.8, [6, 3]], ['CENTRE', 0.7, 0.7, [18, 4, 3, 4]], ['CONSTRUCTION', 0.9, 0.6, 'b']];
      kk.forEach(([lab, w, a, d], i) => { const y = ly + 82 + i * 12; if (d === 'b') L(lx + 2, y - 3, lx + 52, y - 3, w, a, { c: BLUE, rough: 0.7 }); else if (d) P.dashed(lx + 2, y - 3, lx + 52, y - 3, d, { w, a, rough: 0.4 }); else L(lx + 2, y - 3, lx + 52, y - 3, w, a, { rough: 0.6, passes: 1, over: 0 }); tx(lab, lx + 62, y, 9, { a: 0.8 }); });
      // section arrow key
      marker(lx + 158, ly + 92, 'N', 1); tx('CUT', lx + 148, ly + 122, 9, { a: 0.8 });
      // title block: boxes left mostly empty
      const bx = 1372, by = 806, bw = 176, bh = 148;
      P.erase(rect4(bx - 2, by - 2, bw + 4, bh + 4));
      R(bx, by, bw, bh, 1.6, 0.92, { rough: 0.3, over: 2 }); R(bx + 3, by + 3, bw - 6, bh - 6, 0.6, 0.5, { rough: 0.25 });
      L(bx, by + 60, bx + bw, by + 60, 1, 0.85, { over: 0 }); L(bx, by + 100, bx + bw, by + 100, 1, 0.85, { over: 0 }); L(bx + 92, by + 60, bx + 92, by + bh, 1, 0.85, { over: 0 }); L(bx, by + 124, bx + bw, by + 124, 0.7, 0.75, { over: 0 });
      L(bx + 30, by + 100, bx + 30, by + 124, 0.7, 0.7, { over: 0 });
      hw('ARGO-7', bx + 10, by + 34, 25, { a: 0.9 }); tx('GENERATION SHIP  -  ISV', bx + 10, by + 51, 10, { a: 0.75 });
      tx('DRAWN', bx + 8, by + 72, 8, { a: 0.6 }); tx('CHECKED', bx + 100, by + 72, 8, { a: 0.6 }); tx('DATE', bx + 8, by + 112, 8, { a: 0.6 }); tx('REV', bx + 100, by + 112, 8, { a: 0.6 });
      tx('SCALE 1:400', bx + 100, by + 140, 9, { a: 0.8 }); tx('SHEET', bx + 8, by + 140, 8, { a: 0.6 }); hw(n + ' / ' + t, bx + 44, by + 140, 14, { a: 0.9 });
      // handwritten initials in the DRAWN box
      P.curve([[bx + 18, by + 88], [bx + 26, by + 82], [bx + 30, by + 92], [bx + 40, by + 84], [bx + 52, by + 90], [bx + 62, by + 82]], { w: 1, a: 0.8, rough: 0.5 });
    }
    // sticky note, crew notes, coffee ring
    { const ox = 654, oy = 862, th = -0.05, ct = Math.cos(th), st = Math.sin(th), pt = (dx, dy) => [ox + dx * ct - dy * st, oy + dx * st + dy * ct];
      const q = [pt(0, 0), pt(112, 0), pt(112, 82), pt(0, 82)]; const shadow = [pt(4, 4), pt(116, 4), pt(116, 87), pt(4, 87)];
      tint(shadow, GRAPH, 0.16, { steps: 2, jit: 0.8 }); P.erase(q); tint(q, '#e8c94a', 0.55, { steps: 3, jit: 0.6 }); PG(q, 1, 0.75, { rough: 0.5 });
      PG([pt(112, 66), pt(112, 82), pt(96, 82)], 0.7, 0.7, { rough: 0.3, over: 0 }); tint([pt(112, 66), pt(112, 82), pt(96, 82)], GRAPH, 0.22, { steps: 2 });
      L(pt(0, 14)[0], pt(0, 14)[1], pt(112, 14)[0], pt(112, 14)[1], 0.5, 0.45, { over: 0 });
      [['REMEMBER:', 30, 11.5, 0.9], ['FEED SPUTNIK', 45, 13, 0.9], ['BEFORE BURN 2 !!', 60, 10.5, 0.9], ['- M.', 75, 12, 0.8]].forEach(([str, dy, size, a], i) => { const p0 = pt(8, dy); P.text(str, p0[0], p0[1], { size, rot: th, a, font: HAND }); });
      const p1 = pt(56, 8); C(p1[0], p1[1], 3.4, 1, 0.8, { rough: 0.1 }); const nt = [];
      // notes
      const NX = 792; hw('CREW LOG', NX, 862, 13, { a: 0.9 }); L(NX, 866, NX + 62, 866, 0.8, 0.6, { over: 0 });
      [['CAPT: BURN 2 AT 0400 SHIP TIME', 1], ['GALLEY OUT OF COFFEE (AGAIN)', 0], ['GARDEN: TOMATOES 14 / 20 RIPE', 1], ['BUNK 4 IS SPUTNIK\u2019S - DO NOT MOVE', 0], ['EVA LOCK 2 SEAL: CHECK MONDAY', 0]].forEach(([str, tick], i) => { const y = 884 + i * 15.5; R(NX, y - 8, 8, 8, 0.8, 0.85, { rough: 0.2, over: 0 }); if (tick) { PL([[NX + 1.5, y - 4], [NX + 3.6, y - 1.6], [NX + 9.5, y - 10]], 1.3, 0.9, { over: 0, c: '#1c3f94' }); } P.text(str, NX + 14, y, { size: 10.5, a: 0.85, font: HAND }); });
      // coffee ring
      const kx = 982, ky = 934; [[18, 2.4, 0.32], [17.3, 1, 0.42], [16.2, 0.8, 0.26]].forEach(([r, w, a], i) => P.ellipse(kx + i * 0.6, ky, r, r * 0.97, { w, a, c: '#7b4f24', passes: 1, rough: 1.1, from: i * 0.4, to: i * 0.4 + TAU * 0.93 }));
      P.dots([[kx + 21, ky - 10, 1.6], [kx + 23, ky - 4, 1], [kx - 3, ky + 21, 1.2], [kx + 19, ky + 12, 0.9], [kx - 12, ky - 20, 0.9]], '#7b4f24', 0.3);
      tint(disc(kx, ky, 17, 20), '#7b4f24', 0.06, { steps: 2, edge: 0, jit: 1.5 });
    }
    // revision cloud round the patched fin + delta-C tag
    P.scallop([[340, Z(72)], [386, Z(72)], [386, Z(101)], [340, Z(101)]], { closed: true, r: 4.5, w: 1, c: RED, a: 0.85 });
    PL([[400, Z(96)], [410, Z(78)], [420, Z(96)], [400, Z(96)]], 0.9, 0.85, { c: RED, over: 0 }); tx('C', 406.5, Z(93), 9, { c: RED, a: 0.9 });


    /* =============================================================
       VIEW TITLES, CALLOUT NOTES, SCALE BAR, SHIP DATA, SPUTNIK, REVISIONS
       ============================================================= */
    hw('SIDE ELEVATION', 72, 306, 13, { a: 0.85 }); hw('PLAN', 72, 590, 13, { a: 0.85 }); tx('FROM ABOVE', 116, 590, 9, { a: 0.6 });
    hw('FRONT', 1104, 80, 13, { a: 0.85 }); tx('LOOKING AFT', 1152, 80, 9, { a: 0.6 }); hw('REAR', 1104, 388, 13, { a: 0.85 }); tx('LOOKING FORWARD', 1146, 388, 9, { a: 0.6 });
    P.note('COMMS MAST', 578, 68, 524, 84, { size: 12 });
    P.note('HYDROPONICS', 664, 74, 706, 96, { size: 12, from: 'end' });
    P.note('BRIDGE', 800, 68, 846, 96, { size: 12, from: 'end' });
    P.note('RADIATOR FIN', 150, 292, 309, 270, { size: 11, from: 'end' });
    P.note('MAIN ENGINE', 72, 264, 158, 226, { size: 11, from: 'end' });
    P.note('EXHAUST', 72, 122, 104, 158, { size: 11, from: 'end' });
    P.note('STEAM VENTS', 608, 308, 594, 290, { size: 10 });
    P.note('LIFEBOAT "MILLIE"', 772, 296, 748, 279, { size: 10.5 });
    P.note('PORTS OF CALL', 706, 580, 662, 542, { size: 10.5 });
    plate('CARGO HOLD 2', 470, Z(-52), 8.5); plate('SPUTNIK', 634, Z(60), 8.5); L(655, Z(48) - 14, 655, Z(19), 0.7, 0.85, { over: 0 }); arrowHead(655, Z(19), -PI / 2, 5, 0.8);
    // scale bar
    P.ruler(866, 296, 986, 296, 10, 5, { side: -1, len: 6, a: 0.7 }); tx('0', 863, 306, 8, { a: 0.7 }); tx('12 M', 966, 306, 8, { a: 0.7 }); tx('SCALE 1 : 400', 870, 283, 9.5, { a: 0.75 });
    // ship data (top right)
    { const dx = 1424, dy = 66; hw('SHIP DATA', dx, dy + 12, 13, { a: 0.9 }); L(dx, dy + 16, dx + 72, dy + 16, 0.8, 0.6, { over: 0 });
      [['L.O.A.', '341 M'], ['SPAN', '90 M'], ['HULL DIA.', '51 M'], ['DRY MASS', '9.8 KT'], ['CREW', '24 + CAT'], ['TRIP', '11 YR']].forEach(([a, b], i) => { const y = dy + 34 + i * 17; tx(a, dx, y, 9.5, { a: 0.8 }); tx(b, dx + 118 - P.measure(b, 9.5), y, 9.5, { a: 0.9 }); P.dashed(dx + P.measure(a, 9.5) + 4, y - 2, dx + 118 - P.measure(b, 9.5) - 4, y - 2, [1, 3], { w: 0.5, a: 0.5 }); });
      // sleeping SPUTNIK, ship's cat, drawn big
      cat(1476, 268, 2.4); tx('SPUTNIK - 7 YRS', 1434, 292, 9.5, { a: 0.8 }); tx('SHIP CAT, ALWAYS ASLEEP', 1424, 304, 8, { a: 0.65 });
      // revision table
      const ry = 340; R(1428, ry, 122, 84, 1, 0.85, { rough: 0.3 }); L(1428, ry + 16, 1550, ry + 16, 0.8, 0.8, { over: 0 }); L(1452, ry, 1452, ry + 84, 0.8, 0.8, { over: 0 });
      tx('REV', 1432, ry + 12, 8.5, { a: 0.7 }); tx('NOTE', 1470, ry + 12, 8.5, { a: 0.7 });
      [['A', 'FIRST ISSUE'], ['B', 'GARDEN ADDED'], ['C', 'FINS PATCHED'], ['', '']].forEach(([a, b], i) => { const y = ry + 16 + (i + 1) * 17; L(1428, ry + 16 + i * 17 + 17, 1550, ry + 16 + i * 17 + 17, 0.5, 0.5, { over: 0 }); tx(a, 1437, y - 4, 9, { a: 0.85 }); tx(b, 1458, y - 4, 8.5, { a: 0.8 }); });
    }



    // hidden detail under the plan skin: LH2 tanks, reactor vessel, bridge consoles, crane rails
    { P.circle(255, AXp, 19, { w: 0.6, a: 0.55, passes: 1 }); P.circle(255, AXp, 15, { w: 0.5, a: 0.4, passes: 1 });
      P.dashed(352, AXp - 27, 406, AXp - 27, [5, 3], { w: 0.55, a: 0.6 }); P.dashed(352, AXp + 27, 406, AXp + 27, [5, 3], { w: 0.55, a: 0.6 }); P.dashed(352, AXp - 27, 352, AXp + 27, [4, 3], { w: 0.55, a: 0.6 }); P.dashed(406, AXp - 27, 406, AXp + 27, [4, 3], { w: 0.55, a: 0.6 });
      P.circle(379, AXp, 10, { w: 0.5, a: 0.5, passes: 1 });
      P.dashed(870, AXp - 14, 896, AXp - 14, [4, 3], { w: 0.5, a: 0.55 }); P.dashed(870, AXp + 14, 896, AXp + 14, [4, 3], { w: 0.5, a: 0.55 }); P.dashed(870, AXp - 14, 870, AXp + 14, [3, 3], { w: 0.5, a: 0.55 }); P.dashed(896, AXp - 14, 896, AXp + 14, [3, 3], { w: 0.5, a: 0.55 });
    }

    // skin story on the elevation: EVA hatch, stickers in the frame gaps, scars and patches
    { C(588, Z(0), 9, 1.4, 0.95); C(588, Z(0), 6.4, 0.7, 0.85); C(588, Z(0), 1.8, 0.9, 0.95); for (let a = 0; a < 6; a++) L(588 + Math.cos(a * PI / 3) * 2, Z(0) + Math.sin(a * PI / 3) * 2, 588 + Math.cos(a * PI / 3) * 6.4, Z(0) + Math.sin(a * PI / 3) * 6.4, 0.6, 0.85, { over: 0, rough: 0.1 });
      [-24, -6, 12, 30].forEach((z, i) => sticker(786, Z(z), [0, 4, 2, 5][i], 5.6));
      scorch(262, Z(57), 24, 3.6, 0.55); scorch(880, Z(-46), 10, 3, 0.4); dent(345, Z(-56), 2.2); dent(470, Z(56), 2.4); dent(560, Z(-56), 2); dent(300, Z(55), 2.6);
      patchPlate(432, Z(-24), 8, 12, null); weld(430, Z(30), 440, Z(30)); weld(776, Z(-56), 796, Z(-56)); }
    // pre-burn checklist (crew handwriting)
    { const cx = 1428, cy = 462; hw('PRE-BURN CHECK', cx, cy, 12, { a: 0.9 }); L(cx, cy + 4, cx + 96, cy + 4, 0.8, 0.6, { over: 0 });
      [['FUEL LINES PURGED', 1], ['RADIATORS OUT', 1], ['CAT IN BUNK', 1], ['GARDEN LIGHTS DIM', 0], ['LOOSE MUGS STOWED', 0]].forEach(([str, tk], i) => { const y = cy + 20 + i * 15; R(cx, y - 8, 8, 8, 0.8, 0.85, { rough: 0.2, over: 0 }); if (tk) PL([[cx + 1.5, y - 4], [cx + 3.6, y - 1.6], [cx + 9.5, y - 10]], 1.3, 0.9, { over: 0, c: NAVY }); P.text(str, cx + 13, y, { size: 9.5, a: 0.85, font: HAND }); }); }

    /*@@ELEV_INTERIOR@@*/
    /*@@END@@*/
  }
});
