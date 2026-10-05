/* SHEET 4 — SPACE ELEVATOR: a traveller's diary up the ribbon.
   Mint graph paper, graphite construction circles (ref. B), red computed ascent spiral,
   plus inset vignettes in the other four hands: A worm's-eye, C bus schematic, E storm scallops. */
(window.SCENES = window.SCENES || []).push({
  name: 'Space Elevator', seed: 41, ink: '#2a2d33', theme: 'mint',
  build(P, n, t) {
    const S = Sketch, TAU = S.TAU, PI = Math.PI, lerp = S.lerp;
    const INK = '#2a2d33', RED = '#d93a2b', GRN = '#1b8a5a', BLU = '#2a4a9c', TAN = '#b98a52', SLATE = '#3f4452', BLK = '#15171c';
    const dg = a => a * PI / 180;
    const X0 = 46, X1 = 1554, Y0 = 46, Y1 = 958;
    const E = [790, 512], RE = 120;
    const altR = alt => RE + 220 * Math.log10(1 + alt / 300) / Math.log10(1 + 35786 / 300);
    const pol = (r, a, c = E) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const T = (s, x, y, size = 11, o = {}) => P.text(s, x, y, Object.assign({ size, a: 0.85 }, o));

    function clipSeg(x1, y1, x2, y2, b) {
      let t0 = 0, t1 = 1; const dx = x2 - x1, dy = y2 - y1;
      const p = [-dx, dx, -dy, dy], q = [x1 - b[0], b[2] - x1, y1 - b[1], b[3] - y1];
      for (let i = 0; i < 4; i++) {
        if (p[i] === 0) { if (q[i] < 0) return null; }
        else { const r = q[i] / p[i]; if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; } }
      }
      return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy];
    }
    const BOX = [X0, Y0, X1, Y1];
    const L = (x1, y1, x2, y2, o) => { const c = clipSeg(x1, y1, x2, y2, BOX); if (c) P.line(c[0], c[1], c[2], c[3], o); };
    /* segment clipped to a circle */
    function clipCirc(x1, y1, x2, y2, cx, cy, r) {
      const dx = x2 - x1, dy = y2 - y1, fx = x1 - cx, fy = y1 - cy;
      const a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - r * r;
      if (a < 1e-9) return null;
      const d = b * b - 4 * a * c; if (d <= 0) { return c <= 0 ? [x1, y1, x2, y2] : null; }
      const s = Math.sqrt(d); let t0 = (-b - s) / (2 * a), t1 = (-b + s) / (2 * a);
      t0 = Math.max(0, t0); t1 = Math.min(1, t1); if (t1 <= t0) return null;
      return [x1 + dx * t0, y1 + dy * t0, x1 + dx * t1, y1 + dy * t1];
    }
    function clipPoly(poly, cx, cy, r) {
      const N = 56, cp = []; for (let i = 0; i < N; i++) { const a = i / N * TAU; cp.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
      let out = poly;
      for (let i = 0; i < N && out.length; i++) {
        const a = cp[i], b = cp[(i + 1) % N], inp = out; out = [];
        const side = p => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
        for (let j = 0; j < inp.length; j++) {
          const p = inp[j], q = inp[(j + 1) % inp.length], sp = side(p), sq = side(q);
          if (sp >= 0) out.push(p);
          if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
        }
      }
      return out;
    }
    const fit = (str, maxW, size) => Math.min(size, size * maxW / Math.max(1, P.measure(str, size)));
    /* pencil circle, clipped to the sheet */
    function pcirc(cx, cy, r, o = {}) {
      const N = Math.max(60, Math.ceil(TAU * r / 5)), st = P.r(TAU); let rs = null;
      for (let i = 0; i <= N; i++) {
        const a = st + TAU * i / N, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a), ins = x > X0 && x < X1 && y > Y0 && y < Y1;
        if (ins && rs === null) rs = a;
        if ((!ins || i === N) && rs !== null) {
          const a1 = ins ? a : st + TAU * (i - 1) / N;
          if (a1 - rs > 0.04) P.arc(cx, cy, r, r, rs, a1, o);
          rs = null;
        }
      }
    }
    const tri = (x, y, ang, s, c = RED) => {
      const p = [[x + Math.cos(ang) * s, y + Math.sin(ang) * s], [x + Math.cos(ang + 2.6) * s * 0.75, y + Math.sin(ang + 2.6) * s * 0.75], [x + Math.cos(ang - 2.6) * s * 0.75, y + Math.sin(ang - 2.6) * s * 0.75]];
      P.wash(p, c, 0.9, { edge: 0, jit: 0.25, steps: 2 });
      P.poly(p, { w: 1, c, a: 0.95, passes: 1, over: 0, rough: 0.2 });
    };
    /* a knocked-out label card */
    function card(x, y, txt, size = 12, o = {}) {
      const w = P.measure(txt, size) + 16, h = size * 0.62 + 10;
      P.erase([[x - 3, y - h + 2], [x + w + 3, y - h + 2], [x + w + 3, y + 6], [x - 3, y + 6]]);
      P.rect(x, y - h + 5, w, h, { w: 0.9, a: 0.85, rough: 0.25, over: 1, passes: 1, c: o.c });
      T(txt, x + 8, y, size, { a: 0.9, c: o.tc });
      return w;
    }
    const tag = (txt, x, y, size = 9, o = {}) => {
      const w = P.measure(txt, size);
      P.erase([[x - 3, y - size * 0.62 - 3], [x + w + 3, y - size * 0.62 - 3], [x + w + 3, y + 4], [x - 3, y + 4]]);
      T(txt, x, y, size, o);
    };
    function inset(x, y, w, h, title) {
      P.erase([[x - 4, y - 4], [x + w + 4, y - 4], [x + w + 4, y + h + 4], [x - 4, y + h + 4]]);
      P.rect(x, y, w, h, { w: 1.4, a: 0.9, rough: 0.3, over: 1.5, passes: 1 });
      P.rect(x + 3, y + 3, w - 6, h - 6, { w: 0.6, a: 0.65, rough: 0.25, over: 1, passes: 1 });
      const tw = P.measure(title, 9.5) + 12;
      P.erase([[x + 8, y - 1], [x + 8 + tw, y - 1], [x + 8 + tw, y + 15], [x + 8, y + 15]]);
      P.rect(x + 8, y + 2, tw, 12, { w: 0.7, a: 0.8, rough: 0.2, passes: 1, over: 0 });
      T(title, x + 14, y + 11.5, 9.5, { a: 0.9 });
    }

    /* ====================================================== SHEET FURNITURE */
    P.rect(30, 30, 1540, 940, { w: 1.7, a: 0.85, rough: 0.3, over: 2, passes: 1 });
    P.rect(40, 40, 1520, 920, { w: 0.8, a: 0.7, rough: 0.3, over: 2, passes: 1 });
    P.ruler(62, 47, 1538, 47, 8, 5, { len: 5, a: 0.45, w: 0.5 });
    P.ruler(62, 953, 1538, 953, 8, 5, { len: 5, a: 0.45, w: 0.5, side: -1 });
    P.ruler(47, 62, 47, 938, 8, 5, { len: 5, a: 0.4, w: 0.5 });
    P.ruler(1553, 62, 1553, 938, 8, 5, { len: 5, a: 0.4, w: 0.5, side: -1 });
    for (const [x, y, x2, y2] of [[800, 30, 800, 40], [800, 960, 800, 970], [30, 500, 40, 500], [1560, 500, 1570, 500]]) P.line(x, y, x2, y2, { w: 1.1, rough: 0.2, passes: 1, over: 0 });

    /* ====================================================== CONSTRUCTION (ref. B) */
    // eccentric pencil circles
    for (let i = 0; i < 54; i++) {
      const r = P.r(150, 640), c = [E[0] + P.r(-90, 90), E[1] + P.r(-80, 80)];
      pcirc(c[0], c[1], r, { w: P.r(0.5, 1.05), a: P.r(0.16, 0.62), passes: P.pick([1, 2]), rough: P.r(0.5, 1.1) });
    }
    // huge far arcs sweeping the margins
    for (let i = 0; i < 9; i++) {
      const a = P.r(TAU), d = P.r(650, 900), r = P.r(520, 1000);
      pcirc(E[0] + Math.cos(a) * d * 0.6, E[1] + Math.sin(a) * d * 0.5, r, { w: P.r(0.5, 0.8), a: P.r(0.14, 0.32), passes: 1 });
    }
    // orbit shells (bold, double-passed, slightly off centre)
    const SHELLS = [[133, 100], [158, 408], [214, 2000], [272, 8000], [314, 20200], [340, 35786], [406, 150000]];
    for (const [r] of SHELLS) {
      pcirc(E[0], E[1], r, { w: 1.15, a: 0.72, rough: 0.7 });
      pcirc(E[0] + P.r(-3, 3), E[1] + P.r(-3, 3), r + P.r(-2, 2), { w: 0.85, a: 0.5, passes: 1 });
      pcirc(E[0] + P.r(-7, 7), E[1] + P.r(-7, 7), r + P.r(-5, 5), { w: 0.6, a: 0.3, passes: 1 });
    }
    // atmosphere shells hugging the limb
    [RE + 7, RE + 15, RE + 22].forEach((r, i) => pcirc(E[0] + P.r(-1, 1), E[1] + P.r(-1, 1), r, { w: 0.6, a: 0.5 - i * 0.1, passes: 1 }));
    pcirc(E[0], E[1], 352, { w: 0.6, a: 0.35, passes: 1 }); // graveyard
    pcirc(E[0], E[1], 448, { w: 0.9, a: 0.5 }); pcirc(E[0], E[1], 468, { w: 0.6, a: 0.28, passes: 1 });
    // tangents, chords, sweeps
    for (let i = 0; i < 22; i++) {
      const c = i % 3 ? E : [E[0] + P.r(-60, 60), E[1] + P.r(-60, 60)], r = P.pick([133, 158, 214, 272, 314, 340, 406, 448, P.r(150, 500)]);
      const a = P.r(TAU), px = c[0] + r * Math.cos(a), py = c[1] + r * Math.sin(a), ta = a + PI / 2, len = P.r(200, 700);
      L(px - Math.cos(ta) * len * P.r(0.4, 1), py - Math.sin(ta) * len * P.r(0.4, 1), px + Math.cos(ta) * len, py + Math.sin(ta) * len, { w: P.r(0.45, 0.85), a: P.r(0.2, 0.5), passes: P.pick([1, 2]), over: P.r(3, 12), rough: 0.5 });
    }
    for (let i = 0; i < 14; i++) {
      const a1 = P.r(TAU), a2 = a1 + P.r(0.8, 3.2), r1 = P.pick([214, 272, 340, 406, 448]), r2 = P.pick([214, 272, 340, 406, 448]);
      const p1 = pol(r1, a1), p2 = pol(r2, a2);
      L(p1[0] + (p1[0] - p2[0]) * 0.12, p1[1] + (p1[1] - p2[1]) * 0.12, p2[0] + (p2[0] - p1[0]) * 0.1, p2[1] + (p2[1] - p1[1]) * 0.1, { w: P.r(0.4, 0.7), a: P.r(0.2, 0.42), passes: 1, over: 6, rough: 0.5 });
    }
    // radial spokes and centre lines
    for (let a = 0; a < 360; a += 15) {
      const p1 = pol(RE + 6, dg(a)), p2 = pol(P.r(430, 500), dg(a));
      L(p1[0], p1[1], p2[0], p2[1], { w: a % 45 === 0 ? 0.6 : 0.4, a: a % 45 === 0 ? 0.32 : 0.2, passes: 1, over: 3, rough: 0.4 });
    }
    P.dashed(60, E[1], 1540, E[1], [30, 5, 5, 5], { w: 0.6, a: 0.5 });
    P.dashed(E[0], 60, E[0], 950, [30, 5, 5, 5], { w: 0.6, a: 0.5 });
    { const p1 = pol(520, dg(-74)), p2 = pol(520, dg(106)); P.dashed(p1[0], p1[1], p2[0], p2[1], [40, 5, 5, 5], { w: 0.7, a: 0.45 }); }
    for (const [ang, len] of [[-24, 760], [14, 800], [-160, 700]]) {
      const c = pol(0, 0), a = dg(ang);
      L(E[0] - Math.cos(a) * len, E[1] - Math.sin(a) * len + 40, E[0] + Math.cos(a) * len, E[1] + Math.sin(a) * len + 40, { w: 0.5, a: 0.3, passes: 1, over: 12 });
    }

    /* --- tick-scaled arcs with numbers --- */
    P.arcTicks(E[0], E[1], 150, dg(-24), dg(34), dg(2), 5, { len: 6, a: 0.7 });
    P.arcTicks(E[0], E[1], 214, dg(112), dg(178), dg(1.5), 4, { len: 6, a: 0.7, side: -1 });
    P.arcTicks(E[0], E[1], 272, dg(196), dg(254), dg(2), 5, { len: 6, a: 0.7 });
    P.arcTicks(E[0], E[1], 340, dg(-52), dg(28), dg(1), 5, { len: 7, a: 0.75 });
    P.arcTicks(E[0], E[1], 406, dg(34), dg(104), dg(2), 5, { len: 6, a: 0.65 });
    P.arcTicks(E[0], E[1], 448, dg(60), dg(150), dg(3), 5, { len: 6, a: 0.6, side: -1 });
    const arcNums = (r, a0, a1, step, dy, size = 8, side = 1) => {
      for (let a = a0; a <= a1 + 0.01; a += step) {
        const th = dg(a), up = Math.sin(th) < 0, p = pol(r + side * dy, th);
        T(String(Math.round(((a % 360) + 360) % 360)), p[0], p[1], size, { align: 'center', rot: up ? th + PI / 2 : th - PI / 2, a: 0.6 });
      }
    };
    arcNums(150, -20, 30, 10, 15); arcNums(214, 120, 170, 10, 15, 8, -1); arcNums(272, 200, 250, 10, 15);
    arcNums(406, 40, 100, 10, 15); arcNums(340, -50, 20, 10, 15); arcNums(448, 70, 140, 10, 15, 8, -1);

    /* --- stars, dust and tiny crosses --- */
    { const D = [];
      for (let i = 0; i < 260; i++) { const x = P.r(52, 1548), y = P.r(52, 956); D.push([x, y, P.r(0.4, 1.1)]); }
      P.dots(D, INK, 0.45);
      for (let i = 0; i < 26; i++) { const x = P.r(60, 1540), y = P.r(60, 950), s = P.r(2, 4.2); L(x - s, y, x + s, y, { w: 0.55, a: 0.55, passes: 1, over: 0, rough: 0.1 }); L(x, y - s, x, y + s, { w: 0.55, a: 0.55, passes: 1, over: 0, rough: 0.1 }); }
    }

    const arcBand = (r0, r1, a0, a1, o = {}) => {
      const A = [], B = [], k = Math.max(6, Math.round((a1 - a0) / 3));
      for (let i = 0; i <= k; i++) { const a = dg(a0 + (a1 - a0) * i / k); A.push(pol(r1, a)); B.push(pol(r0, a)); }
      const poly = A.concat(B.reverse());
      P.hatch(poly, { ang: o.ang ?? -38, gap: o.gap ?? 2.6, a: o.a ?? 0.42, w: 0.5, piece: 26, fade: () => 0.85, inset: 1, ragged: 2 });
      P.pl(A.slice().concat([]), { w: 0.5, a: 0.4, passes: 1, over: 0, rough: 0.6 });
    };
    arcBand(234, 252, 118, 170); arcBand(378, 392, 196, 252, { ang: 20 }); arcBand(286, 298, -70, -18, { ang: 62 }); arcBand(346, 358, 96, 140, { ang: 10 });

    /* ====================================================== EARTH — hatch-modelled sphere */
    (function earth() {
      const ROLL = dg(-16), LON0 = 18, TILT = 24;
      const proj = (lat, lon) => {
        const f = dg(lat), l = dg(lon - LON0), f0 = dg(TILT);
        const x = Math.cos(f) * Math.sin(l), y = Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(l);
        const z = Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(l);
        const sx = RE * x, sy = -RE * y;
        return [E[0] + sx * Math.cos(ROLL) - sy * Math.sin(ROLL), E[1] + sx * Math.sin(ROLL) + sy * Math.cos(ROLL), z];
      };
      const dark = (x, y) => clamp(0.5 + 0.62 * (((x - E[0]) + (y - E[1])) / RE) * 0.72, 0, 1);
      const disc = []; for (let i = 0; i < 90; i++) { const a = i / 90 * TAU; disc.push([E[0] + (RE - 0.5) * Math.cos(a), E[1] + (RE - 0.5) * Math.sin(a)]); }
      // ocean tone
      P.hatch(disc, { ang: -58, gap: 2.1, a: 0.6, w: 0.5, fade: (x, y) => 0.3 + 0.7 * Math.pow(dark(x, y), 1.0), piece: 8, inset: 1 });
      P.hatch(disc, { ang: 34, gap: 2.5, a: 0.5, w: 0.5, fade: (x, y) => Math.max(0, dark(x, y) - 0.4) * 1.7, piece: 8, inset: 1 });
      P.hatch(disc, { ang: -58, gap: 3.2, a: 0.55, w: 0.5, fade: (x, y) => { const q = Math.hypot(x - E[0], y - E[1]) / RE; return Math.max(0, q - 0.8) * 4; }, piece: 8, inset: 0 });
      // land
      const LAND = [
        [[35, -6], [37, 10], [31, 32], [22, 37], [12, 44], [11, 51], [0, 42], [-10, 40], [-25, 35], [-34, 20], [-30, 17], [-17, 12], [-5, 10], [4, 9], [5, -2], [5, -8], [15, -17], [21, -17], [28, -10]],
        [[36, -9], [43, -9], [48, -5], [51, 2], [55, 8], [58, 5], [62, 5], [70, 20], [70, 30], [60, 30], [55, 28], [46, 30], [41, 28], [38, 24], [37, 15], [44, 9], [43, 3], [36, -6]],
        [[70, 30], [72, 80], [72, 130], [65, 175], [50, 140], [35, 130], [22, 120], [10, 105], [8, 98], [20, 90], [22, 70], [25, 57], [30, 48], [36, 36], [41, 28], [46, 30], [55, 28], [60, 30]],
        [[10, -72], [10, -62], [0, -50], [-8, -35], [-23, -42], [-35, -57], [-55, -68], [-45, -75], [-18, -71], [-5, -81], [8, -77]],
        [[70, -160], [72, -120], [70, -90], [60, -65], [45, -60], [30, -80], [25, -97], [18, -95], [9, -80], [20, -105], [35, -121], [50, -128], [60, -140]],
        [[-12, 114], [-12, 136], [-20, 148], [-38, 146], [-35, 116]]
      ];
      for (const poly of LAND) {
        const ptsL = [];
        for (let i = 0; i < poly.length; i++) {
          const a = poly[i], b = poly[(i + 1) % poly.length], k = Math.max(1, Math.ceil(Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])) / 4));
          for (let j = 0; j < k; j++) ptsL.push(proj(lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)));
        }
        if (!ptsL.some(p => p[2] > 0.05)) continue;
        const q = ptsL.map(p => {
          if (p[2] > 0) return [p[0], p[1]];
          const dx = p[0] - E[0], dy = p[1] - E[1], l = Math.hypot(dx, dy) || 1; return [E[0] + dx / l * (RE - 1.5), E[1] + dy / l * (RE - 1.5)];
        });
        P.hatch(q, { ang: 16, gap: 1.8, a: 0.8, w: 0.55, fade: (x, y) => 0.8 + 0.2 * dark(x, y), piece: 10, inset: 0.5, ragged: 0.5 });
        P.hatch(q, { ang: -70, gap: 2.4, a: 0.55, w: 0.5, fade: (x, y) => 0.25 + dark(x, y) * 0.75, piece: 10, inset: 0.5 });
        P.pl(q, { closed: true, w: 0.7, a: 0.6, rough: 0.6, passes: 1, over: 0 });
      }
      // Saturn-style tonal bands parallel to the equator
      for (const [la, lb, ga] of [[-14, -6, 1.5], [8, 15, 1.6], [26, 32, 1.5], [-40, -33, 1.7], [46, 52, 1.7]]) {
        const A = [], B = [];
        for (let lon = LON0 - 88; lon <= LON0 + 88; lon += 4) { const p = proj(la, lon), q = proj(lb, lon); if (p[2] > 0.06 && q[2] > 0.06) { A.push([p[0], p[1]]); B.push([q[0], q[1]]); } }
        if (A.length > 4) P.hatch(A.concat(B.reverse()), { ang: -16, gap: ga, a: 0.6, w: 0.55, fade: (x, y) => 0.55 + 0.45 * dark(x, y), piece: 10, inset: 0.5 });
      }
      // terminator crescent
      { const d = [Math.cos(dg(48)), Math.sin(dg(48))], nn = [-d[1], d[0]], out = [], inn = [];
        for (let i = 0; i <= 28; i++) { const tt = dg(-92 + 184 * i / 28), c = Math.cos(tt), s = Math.sin(tt); out.push([E[0] + (RE - 1) * (d[0] * c + nn[0] * s), E[1] + (RE - 1) * (d[1] * c + nn[1] * s)]); inn.push([E[0] + (RE - 1) * (d[0] * c * 0.22 + nn[0] * s), E[1] + (RE - 1) * (d[1] * c * 0.22 + nn[1] * s)]); }
        const cres = out.concat(inn.reverse());
        P.hatch(cres, { ang: 42, gap: 1.9, a: 0.7, w: 0.6, fade: (x, y) => { const q = Math.hypot(x - E[0], y - E[1]) / RE; return clamp(dark(x, y) * 1.1 + q - 0.85, 0, 1); }, piece: 8, inset: 0 });
        P.hatch(cres, { ang: -20, gap: 2.3, a: 0.6, w: 0.55, fade: (x, y) => clamp(dark(x, y) - 0.55, 0, 1) * 2, piece: 8, inset: 0 });
      }
      // clouds: bright patches (erase) with scalloped outlines
      const patches = [];
      for (let i = 0; i < 26 && patches.length < 13; i++) {
        const a = P.r(TAU), rr = Math.sqrt(P.r()) * (RE - 14), cx = E[0] + Math.cos(a) * rr, cy = E[1] + Math.sin(a) * rr;
        if (dark(cx, cy) > 0.86) continue;
        const q = Math.hypot(cx - E[0], cy - E[1]) / RE, fs = Math.sqrt(1 - q * q * 0.9);
        const rx = P.r(9, 24) * (0.6 + 0.4 * fs), ry = P.r(3, 8) * fs + 1.5, ro = ROLL + P.r(-0.3, 0.3) + Math.sin(a) * 0.4;
        const pts = []; for (let j = 0; j < 14; j++) { const th = j / 14 * TAU, k = P.r(0.82, 1.08); const x = Math.cos(th) * rx * k, y = Math.sin(th) * ry * k; pts.push([cx + x * Math.cos(ro) - y * Math.sin(ro), cy + x * Math.sin(ro) + y * Math.cos(ro)]); }
        if (pts.some(p => Math.hypot(p[0] - E[0], p[1] - E[1]) > RE - 3)) continue;
        patches.push([pts, cx, cy, rx, ry]);
      }
      for (const [pts] of patches) P.erase(pts);
      for (const [pts, cx, cy, rx, ry] of patches) {
        const out = P.scallop(pts, { closed: true, r: 2.8, w: 0.75, a: 0.8, rough: 0.35 });
        P.hatch(out, { ang: 50, gap: 2.1, a: 0.5, w: 0.45, fade: (x, y) => clamp(dark(x, y) * 1.3 - 0.15, 0, 1), piece: 6, inset: 1 });
      }
      // banded cloud swirls along parallels
      for (const lat of [-52, -38, -18, 6, 22, 40, 58]) {
        let run = [];
        const flush = () => { if (run.length > 6) P.scallop(run, { r: 3.4, bulge: 0.9, w: 0.65, a: 0.65, rough: 0.4, side: lat < 0 ? -1 : 1 }); run = []; };
        for (let lon = LON0 - 90; lon <= LON0 + 90; lon += 3) {
          const p = proj(lat + 4 * Math.sin(lon * 0.09 + lat), lon);
          if (p[2] > 0.18 && Math.hypot(p[0] - E[0], p[1] - E[1]) < RE - 4) run.push([p[0], p[1]]); else flush();
        }
        flush();
      }
      // graticule
      for (const lat of [-60, -30, 0, 30, 60, 80]) {
        let run = [];
        const flush = () => { if (run.length > 2) P.path(run, { w: 0.45, a: 0.3, rough: 0.2 }); run = []; };
        for (let lon = LON0 - 92; lon <= LON0 + 92; lon += 4) { const p = proj(lat, lon); if (p[2] > 0) run.push([p[0], p[1]]); else flush(); }
        flush();
      }
      for (let lon = LON0 - 90; lon <= LON0 + 90; lon += 30) {
        let run = [];
        const flush = () => { if (run.length > 2) P.path(run, { w: 0.45, a: 0.3, rough: 0.2 }); run = []; };
        for (let lat = -88; lat <= 88; lat += 4) { const p = proj(lat, lon); if (p[2] > 0) run.push([p[0], p[1]]); else flush(); }
        flush();
      }
      // hurricane spiral
      { const c = proj(14, LON0 - 34); if (c[2] > 0.3) for (let arm = 0; arm < 3; arm++) { const pts = []; for (let k = 0; k <= 22; k++) { const rr = 2 + k * 0.85, a = arm * 2.09 + k * 0.28; pts.push([c[0] + rr * Math.cos(a), c[1] + rr * Math.sin(a) * 0.8]); } P.scallop(pts, { r: 2.2, w: 0.6, a: 0.7, rough: 0.3 }); } }
      // limb
      P.circle(E[0], E[1], RE, { w: 1.5, a: 0.9, rough: 0.5, passes: 2 });
      P.circle(E[0] + 0.5, E[1] + 0.5, RE - 1.5, { w: 0.7, a: 0.55, passes: 1 });
      // atmospheric halo (stipple), thicker on the lit limb
      { const D = []; for (let i = 0; i < 520; i++) { const a = P.r(TAU), d = Math.pow(P.r(), 2.2) * 22 + 2; D.push([E[0] + Math.cos(a) * (RE + d), E[1] + Math.sin(a) * (RE + d), P.r(0.35, 0.85)]); } P.dots(D, INK, 0.55); }
      // radial ticks on the limb
      for (let a = 0; a < 360; a += 5) { const p1 = pol(RE, dg(a)), p2 = pol(RE + (a % 15 === 0 ? 7 : 4), dg(a)); P.line(p1[0], p1[1], p2[0], p2[1], { w: 0.5, a: 0.55, passes: 1, over: 0, rough: 0.1 }); }
    })();

    /* ====================================================== RIBBON + STATIONS ON THE MAIN VIEW */
    const AU = dg(-55), U = [Math.cos(AU), Math.sin(AU)], NN = [-U[1], U[0]];
    const rp = (r, off = 0) => [E[0] + U[0] * r + NN[0] * off, E[1] + U[1] * r + NN[1] * off];
    const R_CW = altR(150000), R_GEO = 340;
    { // ribbon
      const rib = [rp(RE - 4, -3.4), rp(R_CW - 6, -3.4), rp(R_CW - 6, 3.4), rp(RE - 4, 3.4)];
      P.wash(rib, INK, 0.42, { edge: 0, jit: 0.3, steps: 3 });
      P.line(...rp(RE - 4, -3.4), ...rp(R_CW - 6, -3.4), { w: 1.4, a: 0.95, rough: 0.25, passes: 2 });
      P.line(...rp(RE - 4, 3.4), ...rp(R_CW - 6, 3.4), { w: 1.4, a: 0.95, rough: 0.25, passes: 2 });
      P.line(...rp(RE - 4), ...rp(R_CW - 6), { w: 0.6, a: 0.7, rough: 0.2, passes: 1 });
      for (let r = RE; r < R_CW - 8; r += 4.5) { const k = ((r - RE) / 4.5) | 0; P.line(...rp(r, -3.4), ...rp(r + 4.5, 3.4), { w: 0.45, a: 0.8, passes: 1, over: 0, rough: 0.05 }); if (k % 2) P.line(...rp(r, 3.4), ...rp(r + 4.5, -3.4), { w: 0.4, a: 0.6, passes: 1, over: 0, rough: 0.05 }); }
      // parallel altitude ruler
      P.ruler(...rp(RE, 16), ...rp(R_CW, 16), 6, 5, { len: 5, a: 0.6, side: -1 });
      for (const [r, s] of [[altR(100), '0.1'], [altR(408), '0.4'], [altR(2000), '2'], [altR(8000), '8'], [altR(20200), '20'], [altR(35786), '35.8'], [altR(150000), '150']]) {
        const p = rp(r, 30); T(s, p[0], p[1] + 3, 8.5, { align: 'center', a: 0.65, rot: AU + PI / 2 });
        const q1 = rp(r, 6), q2 = rp(r, 20); P.line(q1[0], q1[1], q2[0], q2[1], { w: 0.5, a: 0.6, passes: 1, over: 0 });
      }
      { const p = rp(altR(2000) + 12, 46); T('x1000 KM', p[0], p[1], 8.5, { align: 'center', a: 0.6, rot: AU + PI / 2 }); }
      // nodes where the ribbon pierces the shells
      for (const [r] of SHELLS) { const p = rp(r); P.circle(p[0], p[1], 4.6, { w: 0.9, a: 0.9, passes: 1, rough: 0.2 }); P.dot(p[0], p[1], 1, { a: 0.9 }); }
      // a down-car passing on the ribbon
      { const p = rp(232), q = [rp(232 - 8, -8), rp(232 - 8, 8), rp(232 + 8, 8), rp(232 + 8, -8)]; P.erase(q); P.poly(q, { w: 1.1, passes: 1, over: 0 }); P.hatch(q, { ang: 40, gap: 1.6, a: 0.6, w: 0.5, piece: 6, inset: 0.5 }); }
    }
    // GEO station glyph
    { const c = rp(R_GEO), aa = AU;
      P.erase([[c[0] - 22, c[1] - 22], [c[0] + 22, c[1] - 22], [c[0] + 22, c[1] + 22], [c[0] - 22, c[1] + 22]]);
      P.circle(c[0], c[1], 8, { w: 1.4, a: 0.95, passes: 1 }); P.circle(c[0], c[1], 3.4, { w: 1, passes: 1 });
      for (const sg of [-1, 1]) {
        const p0 = [c[0] + NN[0] * 8 * sg, c[1] + NN[1] * 8 * sg], p1 = [c[0] + NN[0] * 22 * sg, c[1] + NN[1] * 22 * sg];
        P.line(p0[0], p0[1], p1[0], p1[1], { w: 1, a: 0.9, passes: 1, over: 0 });
        const pan = [[p0[0] + U[0] * 5 + NN[0] * 2 * sg, p0[1] + U[1] * 5 + NN[1] * 2 * sg], [p0[0] - U[0] * 5 + NN[0] * 2 * sg, p0[1] - U[1] * 5 + NN[1] * 2 * sg], [p1[0] - U[0] * 5, p1[1] - U[1] * 5], [p1[0] + U[0] * 5, p1[1] + U[1] * 5]];
        P.poly(pan, { w: 0.8, a: 0.9, passes: 1, over: 0, rough: 0.15 }); P.hatch(pan, { ang: dg(-55) * 180 / PI + 90, gap: 1.6, a: 0.6, w: 0.45, piece: 6, inset: 0.4 });
      }
    }
    // counterweight rock at the tip
    { const c = rp(R_CW), pts = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, k = P.r(0.75, 1.15); pts.push([c[0] + Math.cos(a) * 13 * k, c[1] + Math.sin(a) * 9 * k]); }
      P.erase(pts); P.pl(S.catmull(pts, true, 3), { closed: true, w: 1.3, a: 0.95, rough: 0.4, passes: 1 });
      P.hatch(pts, { ang: -50, gap: 1.6, a: 0.75, w: 0.55, fade: (x, y) => 0.4 + 0.6 * clamp(((x - c[0]) + (y - c[1])) / 20 + 0.5, 0, 1), piece: 6, inset: 0.5 });
      P.hatch(pts, { ang: 30, gap: 2.2, a: 0.5, w: 0.5, fade: (x, y) => clamp(((x - c[0]) + (y - c[1])) / 12, 0, 1), piece: 6, inset: 0.5 });
      P.circle(c[0] - 3, c[1] - 1, 2.6, { w: 0.6, passes: 1 }); P.circle(c[0] + 4, c[1] + 2, 1.8, { w: 0.6, passes: 1 });
    }
    // storm at the base of the ribbon (blue scallops, ref. E)
    { for (const [off, r, w, h] of [[-32, RE + 30, 36, 16], [30, RE + 36, 30, 14]]) { const c = rp(r, off); P.erase([[c[0] - w / 2, c[1] - h / 2], [c[0] + w / 2, c[1] - h / 2], [c[0] + w / 2, c[1] + h / 2], [c[0] - w / 2, c[1] + h / 2]]); P.cloud(c[0], c[1], w, h, { c: BLU, lobes: 8, inner: 1, r: 3.6, w: 0.9, a: 0.95, gap: 2 }); }
      const c = rp(RE + 30, -32), bolt = [[c[0] - 2, c[1] + 8], [c[0] - 5, c[1] + 16], [c[0] - 1, c[1] + 17], [c[0] - 6, c[1] + 28]]; P.pl(bolt, { w: 1.4, c: BLU, a: 0.95, passes: 1, over: 0, rough: 0.15 }); }
    // detail lenses (magnifier circles) + cone lines to the inset boxes
    const lens = (c, r, corners) => {
      P.circle(c[0], c[1], r, { w: 1.2, a: 0.9, rough: 0.35 });
      for (const q of corners) {
        const dx = q[0] - c[0], dy = q[1] - c[1], d = Math.hypot(dx, dy), ba = Math.atan2(dy, dx), al = Math.acos(r / d);
        for (const sg of [-1, 1]) { const tp = pol(r, ba + sg * al, c); if (sg === (q[2] || 1)) L(tp[0], tp[1], q[0], q[1], { w: 0.6, a: 0.6, passes: 1, over: 0, rough: 0.35 }); }
      }
    };
    const cFoot = rp(RE + 2), cGeo = rp(R_GEO), cCw = rp(R_CW);
    lens(cCw, 21, [[1248, 90, -1], [1248, 264, 1]]);
    lens(cGeo, 27, [[1248, 276, -1], [1248, 482, 1]]);
    lens(cFoot, 16, [[1248, 494, -1], [1248, 722, 1]]);

    /* ====================================================== ORBIT LABELS, MOONS, SATELLITES, DEBRIS */
    const ringLabel = (txt, r, deg, size = 10) => {
      const th = dg(deg), up = Math.sin(th) < 0, p = pol(r + (up ? 4 : -4), th), w = P.measure(txt, size);
      P.erase([[p[0] - w / 2 - 3, p[1] - 9], [p[0] + w / 2 + 3, p[1] - 9], [p[0] + w / 2 + 3, p[1] + 4], [p[0] - w / 2 - 3, p[1] + 4]].map(q => { const dx = q[0] - p[0], dy = q[1] - p[1], rt = up ? th + PI / 2 : th - PI / 2; return [p[0] + dx * Math.cos(rt) - dy * Math.sin(rt), p[1] + dx * Math.sin(rt) + dy * Math.cos(rt)]; }));
      T(txt, p[0], p[1], size, { align: 'center', rot: up ? th + PI / 2 : th - PI / 2, a: 0.85 });
    };
    ringLabel('KARMAN 100 KM', 133, -98, 9.5);
    ringLabel('LEO 408 KM (ISS)', 158, -130, 9.5);
    ringLabel('2,000 KM  LOW ORBIT ENDS', 214, -152, 10);
    ringLabel('VAN ALLEN PEAK  8,000 KM', 272, 100, 10);
    ringLabel('GPS SHELL  20,200 KM', 314, 76, 10);
    ringLabel('GEOSTATIONARY  35,786 KM', 340, -82, 10.5);
    ringLabel('COUNTERWEIGHT ORBIT  150,000 KM', 406, -134, 10.5);
    ringLabel('GRAVEYARD', 352, 10, 9);

    const crescent = (cx, cy, r, ang, k = 0.5) => {
      const d = [Math.cos(ang), Math.sin(ang)], nn = [-d[1], d[0]], out = [], inn = [];
      for (let i = 0; i <= 16; i++) { const tt = dg(-90 + 180 * i / 16), c = Math.cos(tt), s = Math.sin(tt); out.push([cx + r * (d[0] * c + nn[0] * s), cy + r * (d[1] * c + nn[1] * s)]); inn.push([cx + r * (d[0] * c * k + nn[0] * s), cy + r * (d[1] * c * k + nn[1] * s)]); }
      const poly = out.concat(inn.reverse());
      P.erase(poly.map(([x, y]) => [x + (x - cx) * 0.1, y + (y - cy) * 0.1]));
      P.wash(poly, INK, 0.82, { edge: 0, jit: 0.2, steps: 3 });
      P.hatch(poly, { ang: -55, gap: 1.4, a: 0.85, w: 0.6, piece: 5, inset: 0 });
      P.circle(cx, cy, r, { w: 0.75, a: 0.75, passes: 1, rough: 0.2 });
      P.circle(cx, cy, r * 1.55, { w: 0.5, a: 0.4, passes: 1, rough: 0.3 });
    };
    crescent(...pol(340, dg(198)), 9, dg(-40));
    crescent(...pol(214, dg(-122)), 6, dg(-40));
    crescent(...pol(272, dg(84)), 7, dg(-30));
    crescent(...pol(406, dg(212)), 11, dg(-45));
    crescent(1148, 908, 17, dg(-30), 0.45);
    tag('MOON  (384,400 KM - OFF THE SHEET)', 1040, 942, 8.5, { a: 0.75 });
    const sat = (x, y, ang, s = 1) => {
      const ca = Math.cos(ang), sa = Math.sin(ang), R2 = (u, v) => [x + u * ca - v * sa, y + u * sa + v * ca];
      P.poly([R2(-3 * s, -2 * s), R2(3 * s, -2 * s), R2(3 * s, 2 * s), R2(-3 * s, 2 * s)], { w: 0.9, passes: 1, over: 0, rough: 0.1 });
      for (const sg of [-1, 1]) { const pn = [R2(sg * 4 * s, -1.6 * s), R2(sg * 11 * s, -1.6 * s), R2(sg * 11 * s, 1.6 * s), R2(sg * 4 * s, 1.6 * s)]; P.poly(pn, { w: 0.7, passes: 1, over: 0, rough: 0.1 }); P.line(...R2(sg * 7.5 * s, -1.6 * s), ...R2(sg * 7.5 * s, 1.6 * s), { w: 0.4, passes: 1, over: 0 }); }
    };
    for (const [r, d] of [[158, 24], [158, 150], [158, 262], [214, 58], [272, -18], [314, 130], [314, -62], [340, -14], [340, 95], [340, 182], [340, 258], [406, 60], [406, 170]]) { const p = pol(r, dg(d)); sat(p[0], p[1], dg(d) + PI / 2, 0.9); }
    // debris field (Kessler) along LEO
    { const D = [];
      for (let i = 0; i < 150; i++) { const a = dg(P.r(150, 204)), r = 158 + P.r(-9, 9) + Math.sin(i) * 3; const p = pol(r, a); D.push([p[0], p[1], P.r(0.4, 1.2)]); }
      P.dots(D, INK, 0.75);
      for (let i = 0; i < 18; i++) { const a = dg(P.r(150, 204)), r = 158 + P.r(-10, 10), p = pol(r, a), ta = a + P.r(-1, 1) + PI / 2; P.line(p[0], p[1], p[0] + Math.cos(ta) * 4, p[1] + Math.sin(ta) * 4, { w: 0.9, passes: 1, over: 0, rough: 0.1 }); }
      const p = pol(158, dg(178));
      P.curve([[452, 500], [520, 512], [590, 512], [p[0] - 6, p[1]]], { w: 0.6, a: 0.65, rough: 0.5 });
      card(392, 496, 'DEBRIS FIELD - KESSLER?', 9.5);
    }
    { const D = []; for (let i = 0; i < 70; i++) { const a = P.r(TAU), p = pol(352 + P.r(-2, 2), a); if (p[0] > X0 && p[0] < X1 && p[1] > Y0 && p[1] < Y1) D.push([p[0], p[1], P.r(0.5, 1.3)]); } P.dots(D, INK, 0.7); }

    /* ====================================================== THE RED ASCENT SPIRAL */
    const SPR = s => { const r = RE + 2 + 218 * s, a = dg(115 - 170 * Math.pow(s, 0.7)); return [E[0] + r * Math.cos(a), E[1] + r * Math.sin(a)]; };
    const STOPS = [[0.075, 'DAY 1 – CLEARED THE CLOUDS'], [0.18, 'DAY 2 – SKY TURNS BLACK'], [0.34, 'DAY 3 – THE ISS WAVES BACK'], [0.59, 'DAY 4 – THE BELT HUMS'], [0.77, 'DAY 5 – GPS, DOG ASLEEP'], [0.92, 'DAY 6 – ZERO-G SUPPER'], [1.0, 'DAY 7 – HOME IS A BLUE MARBLE']];
    { // daily spokes (the ribbon's orientation each day)
      STOPS.forEach(([s], i) => { const c = SPR(s), a = Math.atan2(c[1] - E[1], c[0] - E[0]), p1 = pol(RE + 3, a), p2 = pol(Math.hypot(c[0] - E[0], c[1] - E[1]) + (i === 6 ? 90 : 60), a); P.line(p1[0], p1[1], p2[0], p2[1], { w: 0.55, a: 0.5, passes: 1, over: 2, rough: 0.3, c: RED }); });
      // surface track of the foot
      const a0 = dg(115), a1 = dg(-55); P.arcTicks(E[0], E[1], RE + 26, a1, a0, dg(5), 6, { len: 4, a: 0.55, c: RED, side: 1, w: 0.7 });
      P.dashed(...pol(RE + 26, a0), ...pol(RE + 44, a0 + 0.05), [4, 3], { w: 0.5, c: RED, a: 0.7 });
    }
    { const S2 = []; for (let i = 0; i <= 160; i++) S2.push(SPR(i / 160));
      P.path(S2, { w: 2.0, c: RED, a: 0.95, rough: 0.5, passes: 2 });
      P.path(S2.map(([x, y]) => [x + 2.4, y + 1.6]), { w: 0.6, c: RED, a: 0.45, rough: 0.4, passes: 1 });
      // ticks every 1/24
      for (let i = 1; i < 24; i++) { const s = i / 24, c = SPR(s), c2 = SPR(s + 0.01), tx = c2[0] - c[0], ty = c2[1] - c[1], l = Math.hypot(tx, ty); P.line(c[0] - ty / l * 4.5, c[1] + tx / l * 4.5, c[0] + ty / l * 4.5, c[1] - tx / l * 4.5, { w: 0.9, a: 0.9, c: RED, passes: 1, over: 0, rough: 0.1 }); }
      // arrowheads
      for (const s of [0.13, 0.27, 0.47, 0.68, 0.85]) { const c = SPR(s), c2 = SPR(s + 0.012); tri(c[0], c[1], Math.atan2(c2[1] - c[1], c2[0] - c[0]), 8); }
      // launch target rings + double dash
      { const c = SPR(0); for (const r of [6, 12, 20]) P.circle(c[0], c[1], r, { w: 1, c: RED, a: 0.9, passes: 1, rough: 0.3 });
        P.line(c[0] - 26, c[1], c[0] + 26, c[1], { w: 0.6, c: RED, a: 0.7, passes: 1, over: 0 }); P.line(c[0], c[1] - 26, c[0], c[1] + 26, { w: 0.6, c: RED, a: 0.7, passes: 1, over: 0 });
        tag('T-0', c[0] - 46, c[1] + 34, 10, { c: RED }); }
      { const c = SPR(1); for (const r of [4, 9]) P.circle(c[0], c[1], r, { w: 1, c: RED, a: 0.9, passes: 1, rough: 0.3 }); }
      // numbered stops
      STOPS.forEach(([s], i) => { const c = SPR(s); P.erase([[c[0] - 9, c[1] - 9], [c[0] + 9, c[1] - 9], [c[0] + 9, c[1] + 9], [c[0] - 9, c[1] + 9]]); P.circle(c[0], c[1], 8, { w: 1.3, c: RED, a: 0.95, passes: 1, rough: 0.2 }); T(String(i + 1), c[0], c[1] + 4.2, 11, { c: RED, align: 'center', a: 0.95 }); });
    }
    // diary cards (knocked out of the rings)
    { const m = STOPS.map(([s]) => SPR(s));
      const place = [[598, 736], [852, 712], [905, 758], [1082, 552], [1072, 440], [1046, 262], [744, 238]];
      STOPS.forEach(([s, txt], i) => {
        const c = m[i], [x, y] = place[i], w = P.measure(txt, 11.5) + 16;
        const ex = x + (c[0] > x + w ? w : (c[0] < x ? 0 : w / 2)), ey = y - 9 + (c[1] > y ? 12 : 0);
        P.curve([[c[0] + (ex - c[0]) * 0.1, c[1] + (ey - c[1]) * 0.1], [lerp(c[0], ex, 0.55) + P.r(-3, 3), lerp(c[1], ey, 0.5) + P.r(-3, 3)], [ex, ey]], { w: 0.7, a: 0.7, c: RED, rough: 0.4 });
        card(x, y, txt, 11.5);
        // little doodle above each card
        const ix = x + w - 14, iy = y - 22, o1 = { w: 0.9, a: 0.9, passes: 1, over: 0, rough: 0.2 };
        P.erase([[ix - 10, iy - 9], [ix + 10, iy - 9], [ix + 10, iy + 7], [ix - 10, iy + 7]]);
        if (i === 0) P.cloud(ix, iy, 16, 9, { lobes: 6, inner: 0, r: 2.4, w: 0.8, shade: false, a: 0.9 });
        else if (i === 1) { for (const [dx, dy, l] of [[-5, -2, 3], [4, 1, 2.4], [-1, 4, 2]]) { P.line(ix + dx - l, iy + dy, ix + dx + l, iy + dy, o1); P.line(ix + dx, iy + dy - l, ix + dx, iy + dy + l, o1); } }
        else if (i === 2) sat(ix, iy, -0.4, 0.8);
        else if (i === 3) { for (const dy of [-3, 1, 5]) P.path([[ix - 9, iy + dy], [ix - 5, iy + dy - 2.5], [ix - 1, iy + dy + 2.5], [ix + 3, iy + dy - 2.5], [ix + 7, iy + dy + 1]], { w: 0.8, a: 0.9, rough: 0.2 }); }
        else if (i === 4) { T('Z', ix - 5, iy + 6, 7, { a: 0.9 }); T('Z', ix + 1, iy + 1, 9, { a: 0.9 }); }
        else if (i === 5) { P.circle(ix - 2, iy, 5, o1); P.circle(ix - 2, iy, 2.6, { w: 0.5, passes: 1 }); P.line(ix + 5, iy - 5, ix + 5, iy + 6, o1); P.line(ix + 8, iy - 5, ix + 8, iy - 1, o1); P.line(ix + 5, iy - 5, ix + 5, iy - 1, o1); }
        else { const d = []; for (let a = 0; a < 16; a++) d.push(pol(6, a * TAU / 16, [ix, iy])); P.hatch(d, { ang: -50, gap: 1.3, a: 0.7, w: 0.45, piece: 5, inset: 0, fade: (px, py) => clamp(((px - ix) + (py - iy)) / 10 + 0.5, 0, 1) }); P.circle(ix, iy, 6, o1); }
      });
      tag('SEE FIG. G', 504, 761, 9, { c: RED, a: 0.85 });
      P.dashed(520, 770, 440, 802, [5, 3], { w: 0.6, c: RED, a: 0.7 });
    }
    tag('FOOT OF RIBBON MOVES 170 DEG DURING THE CLIMB (DRAWN ONCE, TRULY 7 TURNS)', 500, 890, 9, { c: RED, a: 0.9 });
    P.curve([[720, 882], [742, 850], [770, 800], [790, 760]], { w: 0.6, c: RED, a: 0.6, rough: 0.5 });

    /* ====================================================== POSTAGE STAMP + POSTMARK (diary touch) */
    { const x = 1086, y = 54, w = 60, h = 68;
      P.erase([[x - 5, y - 5], [x + w + 5, y - 5], [x + w + 5, y + h + 5], [x - 5, y + h + 5]]);
      for (const [ax, ay, bx, by] of [[x, y, x + w, y], [x + w, y, x + w, y + h], [x + w, y + h, x, y + h], [x, y + h, x, y]]) P.dashed(ax, ay, bx, by, [2.6, 2.6], { w: 1.3, a: 0.85, rough: 0.2 });
      P.rect(x + 6, y + 6, w - 12, h - 12, { w: 0.9, a: 0.85, passes: 1, over: 0, rough: 0.2 });
      const cxs = x + w / 2, cys = y + 32;
      const disc = []; for (let i = 0; i < 30; i++) disc.push(pol(15, i / 30 * TAU, [cxs, cys]));
      P.hatch(disc, { ang: -50, gap: 1.5, a: 0.7, w: 0.5, fade: (px, py) => clamp(((px - cxs) + (py - cys)) / 22 + 0.55, 0, 1), piece: 6, inset: 0 });
      P.circle(cxs, cys, 15, { w: 1.1, passes: 1, rough: 0.2 });
      P.line(cxs, cys - 15, cxs + 10, y + 8, { w: 1.2, passes: 1, over: 0 }); P.line(cxs + 2, cys - 15, cxs + 12, y + 8, { w: 0.7, passes: 1, over: 0 });
      for (let i = 0; i < 8; i++) P.dot(P.r(x + 9, x + w - 9), P.r(y + 9, y + 22), 0.6);
      T('RIBBON POST', cxs, y + h - 20, 7.5, { align: 'center', a: 0.85 }); T('1 CR', x + w - 10, y + h - 10, 8, { align: 'right', a: 0.9 });
      const pc = [x + w + 4, y + 46];
      for (const r of [15, 11]) P.circle(pc[0], pc[1], r, { w: 0.9, a: 0.75, passes: 1, rough: 0.3 });
      for (let k = 0; k < 4; k++) P.path([[pc[0] - 15, pc[1] - 5 + k * 3.4], [pc[0] - 6, pc[1] - 7 + k * 3.4], [pc[0] + 6, pc[1] - 3 + k * 3.4], [pc[0] + 15, pc[1] - 6 + k * 3.4]], { w: 0.7, a: 0.75, rough: 0.3 });
      for (let k = 0; k < 4; k++) P.path([[x + w + 18 + k * 8, y + 42 + k * 3], [x + w + 24 + k * 8, y + 38 + k * 3]], { w: 0.5, a: 0.5 });
    }

    /* ====================================================== HEADER */
    { const txt = "A TRAVELLER'S DIARY UP THE RIBBON", w = P.measure(txt, 21);
      P.erase([[484, 58], [484 + w + 40, 58], [484 + w + 40, 100], [484, 100]]);
      T(txt, 500, 88, 21, { a: 0.92 });
      P.line(494, 98, 500 + w + 14, 97, { w: 1, a: 0.8, rough: 0.5 }); P.line(494, 103, 500 + w * 0.7, 102, { w: 0.6, a: 0.6, rough: 0.5 });
    }

    /* ====================================================== FIG. A — WORM'S EYE (style A) */
    (function worms() {
      const CX = 198, CY = 214, R = 124;
      const disc = []; for (let i = 0; i < 90; i++) { const a = i / 90 * TAU; disc.push([CX + R * Math.cos(a), CY + R * Math.sin(a)]); }
      P.erase([[CX - R - 8, CY - R - 8], [CX + R + 8, CY - R - 8], [CX + R + 8, CY + R + 8], [CX - R - 8, CY + R + 8]]);
      const cm = S.cam({ pos: [0, 0, 0], pitch: dg(52), f: 140, cx: CX, cy: 262 });
      const seg = (a, b, o) => { const p = cm(a), q = cm(b); if (!p || !q) return; const c = clipCirc(p[0], p[1], q[0], q[1], CX, CY, R - 1); if (c) P.line(c[0], c[1], c[2], c[3], Object.assign({ passes: 1, over: 0, rough: 0.35, c: BLK }, o)); };
      const quad = (a, b, c, d) => [a, b, c, d].map(cm);
      P.wash(disc, TAN, 0.92, { edge: 0, jit: 0.4 });
      P.wash(disc, SLATE, 0.3, { edge: 0, jit: 0.4 });
      P.hatch(disc, { ang: -62, gap: 1.9, a: 0.75, w: 0.55, c: BLK, fade: (x, y) => 0.7 + 0.3 * Math.min(1, Math.hypot(x - CX, y - CY - 20) / R), piece: 14, inset: 0 });
      P.hatch(disc, { ang: 26, gap: 3.4, a: 0.5, w: 0.5, c: BLK, fade: (x, y) => 0.25 + 0.6 * (y < CY ? 1 : 0.4), piece: 14, inset: 0 });
      // clouds: knock the sky out of each cloud, refill kraft, then ink the scallops
      const cloudK = (cx, cy, w, h, o = {}) => {
        const i0 = P.ops.length, out = P.cloud(cx, cy, w, h, Object.assign({ c: BLK, inner: 3, w: 1.1, gap: 2.2 }, o)), saved = P.ops.splice(i0);
        P.erase(out); P.wash(out, TAN, 0.94, { edge: 0, jit: 0.4 }); P.hatch(out, { ang: -50, gap: 2.6, a: 0.28, w: 0.45, c: BLK, fade: (x, y) => clamp(((x - cx) / w + (y - cy) / h) * 1.2 + 0.4, 0, 1), piece: 8, inset: 1 });
        for (const op of saved) P.ops.push(op); return out;
      };
      const tubeK = (path, r0, r1) => {
        const S0 = S.catmull(path, false, 4), nn = S0.length, Lp = [], Rp = [];
        for (let i = 0; i < nn; i++) { const a = S0[Math.max(0, i - 1)], b = S0[Math.min(nn - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; const rr = lerp(r0, r1, i / (nn - 1)); Lp.push([S0[i][0] - ty * rr, S0[i][1] + tx * rr]); Rp.push([S0[i][0] + ty * rr, S0[i][1] - tx * rr]); }
        const poly = Lp.concat(Rp.reverse()); P.erase(poly); P.wash(poly, TAN, 0.94, { edge: 0, jit: 0.3 }); P.cloudTube(path, r0, r1, { c: BLK, w: 0.95, gap: 2.3 });
      };
      tubeK([[74, 196], [120, 204], [170, 196], [196, 190]], 6, 2);
      tubeK([[326, 214], [286, 196], [244, 188], [214, 182]], 6, 2);
      cloudK(120, 262, 80, 42, { lobes: 12 }); cloudK(276, 254, 80, 42, { lobes: 12 }); cloudK(152, 184, 46, 24, { lobes: 9, inner: 2 });
      cloudK(258, 168, 52, 26, { lobes: 9, inner: 2 }); cloudK(200, 128, 30, 15, { lobes: 8, inner: 1 }); cloudK(140, 128, 24, 12, { lobes: 7, inner: 1 }); cloudK(262, 122, 22, 11, { lobes: 7, inner: 1 });
      // towers
      const tower = (x0, z0, hw, y1, lv) => {
        const dy = y1 / lv;
        const C = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
        for (const [sx, sz] of C) seg([x0 + sx * hw, 0, z0 + sz * hw], [x0 + sx * hw * 0.55, y1, z0 + sz * hw * 0.55], { w: 1.1 });
        for (let i = 0; i <= lv; i++) {
          const y = i * dy, k = lerp(1, 0.55, i / lv), k2 = lerp(1, 0.55, (i + 1) / lv);
          for (let c = 0; c < 4; c++) { const a = C[c], b = C[(c + 1) % 4]; seg([x0 + a[0] * hw * k, y, z0 + a[1] * hw * k], [x0 + b[0] * hw * k, y, z0 + b[1] * hw * k], { w: 0.7 }); }
          if (i < lv) for (let c = 0; c < 4; c++) { const a = C[c], b = C[(c + 1) % 4]; seg([x0 + a[0] * hw * k, y, z0 + a[1] * hw * k], [x0 + b[0] * hw * k2, y + dy, z0 + b[1] * hw * k2], { w: 0.6 }); seg([x0 + b[0] * hw * k, y, z0 + b[1] * hw * k], [x0 + a[0] * hw * k2, y + dy, z0 + a[1] * hw * k2], { w: 0.6, a: 0.75 }); }
        }
        // dark shaded flank
        for (let i = 0; i < lv; i += 2) { const k = lerp(1, 0.55, i / lv), k2 = lerp(1, 0.55, (i + 1) / lv); const q = quad([x0 + hw * k, i * dy, z0 - hw * k], [x0 + hw * k, i * dy, z0 + hw * k], [x0 + hw * k2, (i + 1) * dy, z0 + hw * k2], [x0 + hw * k2, (i + 1) * dy, z0 - hw * k2]); if (q.every(Boolean)) { const cq = clipPoly(q, CX, CY, R - 1); if (cq.length > 2) P.hatch(cq, { ang: 70, gap: 1.6, a: 0.6, w: 0.55, c: BLK, piece: 10, inset: 0.3 }); } }
      };
      tower(-24, 28, 4.5, 140, 14); tower(31, 36, 5, 112, 11); tower(-52, 78, 4, 70, 8); tower(58, 92, 4, 66, 8);
      // open floors (gantry slabs)
      const slab = (x0, x1, y, z0, z1, th) => {
        const q = quad([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]), q2 = quad([x0, y - th, z0], [x1, y - th, z0], [x1, y - th, z1], [x0, y - th, z1]);
        if (!q.every(Boolean)) return;
        const cq = clipPoly(q, CX, CY, R - 1), cf = clipPoly([q[0], q[1], q2[1], q2[0]], CX, CY, R - 1);
        if (cq.length > 2) { P.erase(cq); P.wash(cq, TAN, 0.95, { edge: 0, jit: 0.3 }); P.hatch(cq, { ang: 20, gap: 3.4, a: 0.35, w: 0.45, c: BLK, piece: 12, inset: 0.5, fade: (x, y2) => clamp(0.2 + (y2 - 160) / 200, 0, 1) }); }
        if (cf.length > 2) P.hatch(cf, { ang: 60, gap: 1.2, a: 0.85, w: 0.6, c: BLK, piece: 12, inset: 0 });
        for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4]; const c = clipCirc(a[0], a[1], b[0], b[1], CX, CY, R - 1); if (c) P.line(c[0], c[1], c[2], c[3], { w: 1, c: BLK, passes: 1, over: 0, rough: 0.3 }); }
        for (let k = 1; k < 8; k++) { const p = k / 8; seg([lerp(x0, x1, p), y, z0], [lerp(x0, x1, p), y, z1], { w: 0.45, a: 0.7 }); }
        for (let k = 1; k < 3; k++) { const p = k / 3; seg([x0, y, lerp(z0, z1, p)], [x1, y, lerp(z0, z1, p)], { w: 0.45, a: 0.7 }); }
      };
      slab(-24, -7, 44, 22, 40, 1.4); slab(7, 31, 44, 22, 40, 1.4); slab(-24, -7, 86, 24, 42, 1.2); slab(7, 31, 86, 24, 42, 1.2); slab(-60, -24, 64, 60, 96, 1.3); slab(31, 66, 74, 60, 100, 1.3);
      // ribbon
      { const xs = 3.4, zr = 32; seg([-xs, 18, zr], [-xs, 2e5, zr], { w: 1.3 }); seg([xs, 18, zr], [xs, 2e5, zr], { w: 1.3 });
        for (let y = 18; y < 900; y += 5 + y * 0.03) seg([-xs, y, zr], [xs, y + 4 + y * 0.02, zr], { w: 0.5, a: 0.8 });
        const rq = [cm([-xs, 18, zr]), cm([xs, 18, zr]), cm([xs, 4000, zr]), cm([-xs, 4000, zr])]; P.hatch(rq, { ang: 84, gap: 1.2, a: 0.75, w: 0.6, c: BLK, piece: 12, inset: 0 });
        // laser beams
        for (const bx of [-6, -2.5, 2.5, 6]) seg([bx, 3, 26], [bx * 0.3, 900, zr], { w: 0.5, a: 0.6 });
        // climber box
        const cy0 = 96, cw = 6.2, cz0 = 27, cz1 = 37, ch = 16;
        const V = [[-cw, cy0, cz0], [cw, cy0, cz0], [cw, cy0, cz1], [-cw, cy0, cz1], [-cw, cy0 + ch, cz0], [cw, cy0 + ch, cz0], [cw, cy0 + ch, cz1], [-cw, cy0 + ch, cz1]];
        const fq = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [3, 0, 4, 7]];
        const pj = V.map(cm);
        P.erase(pj); P.wash(pj, TAN, 0.9, { edge: 0, jit: 0.2, steps: 2 });
        P.hatch([pj[0], pj[1], pj[2], pj[3]], { ang: 70, gap: 1.3, a: 0.8, w: 0.6, c: BLK, piece: 8, inset: 0 });
        P.hatch([pj[1], pj[2], pj[6], pj[5]], { ang: 70, gap: 1.6, a: 0.7, w: 0.6, c: BLK, piece: 8, inset: 0 });
        for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) P.line(pj[a][0], pj[a][1], pj[b][0], pj[b][1], { w: 0.9, c: BLK, passes: 1, over: 0, rough: 0.2 });
      }
      // safety knock-out ring + sky dust
      const ring = []; const bb = R + 10; for (let i = 0; i <= 90; i++) { const a = i / 90 * TAU; ring.push([CX + R * Math.cos(a), CY + R * Math.sin(a)]); }
      ring.push([CX + R, CY]); ring.push([CX + bb, CY + 0.01]); for (let i = 90; i >= 0; i--) { const a = i / 90 * TAU; ring.push([CX + bb * Math.cos(a) * 1.0, CY + bb * Math.sin(a)]); } ring.push([CX + R, CY]);
      // a rectangle-with-hole variant (never touches other elements)
      const rh = [[CX - R - 6, CY - R - 6], [CX + R + 6, CY - R - 6], [CX + R + 6, CY + R + 6], [CX - R - 6, CY + R + 6], [CX - R - 6, CY]]; for (let i = 0; i <= 90; i++) { const a = PI - i / 90 * TAU; rh.push([CX + R * Math.cos(a), CY + R * Math.sin(a)]); } rh.push([CX - R - 6, CY]);
      P.erase(rh);
      // white highlights (erased slivers)
      for (const [xs, sg] of [[-3.4, -1], [3.4, 1]]) for (let y = 40; y < 1300; y *= 1.9) { const a = cm([xs, y, 32]), b = cm([xs, y * 1.6, 32]); if (!a || !b) continue; const w = 0.7; P.erase([[a[0] - w, a[1]], [a[0] + w, a[1]], [b[0] + w, b[1]], [b[0] - w, b[1]]]); }
      for (let i = 0; i < 40; i++) { const a = P.r(TAU), r = Math.sqrt(P.r()) * (R - 6), x = CX + Math.cos(a) * r, y = CY + Math.sin(a) * r - 24; if (Math.hypot(x - CX, y - CY) > R - 6) continue; P.erase([[x - 0.7, y - 0.7], [x + 0.7, y - 0.7], [x + 0.7, y + 0.7], [x - 0.7, y + 0.7]]); }
      P.circle(CX, CY, R + 1, { w: 1.6, a: 0.95, rough: 0.3, passes: 2 }); P.circle(CX, CY, R + 5, { w: 0.6, a: 0.6, rough: 0.3, passes: 1 });
      for (let a = 0; a < 360; a += 10) { const p1 = pol(R + 5, dg(a), [CX, CY]), p2 = pol(R + (a % 30 === 0 ? 11 : 8), dg(a), [CX, CY]); P.line(p1[0], p1[1], p2[0], p2[1], { w: 0.5, a: 0.6, passes: 1, over: 0, rough: 0.1 }); }
      T("FIG. A – WORM'S-EYE, LOOKING UP THE RIBBON", 82, 361, 9, { a: 0.85 });
    })();

    /* ====================================================== FIG. B — CLIMBER CUTAWAY */
    (function cabin() {
      inset(56, 372, 294, 196, 'FIG. B – PASSENGER CLIMBER, CUTAWAY');
      const fl = 500;
      // hull and cut wall
      P.rrect(66, 396, 222, 122, 18, { w: 1.7, a: 0.95, passes: 2 });
      P.rrect(71, 401, 212, 112, 14, { w: 0.6, a: 0.7, passes: 1 });
      P.hatch([[74, 397], [276, 397], [276, 401], [74, 401]], { ang: 45, gap: 1.3, a: 0.7, w: 0.5, piece: 6, inset: 0 });
      P.hatch([[67, 410], [71, 410], [71, 505], [67, 505]], { ang: 45, gap: 1.3, a: 0.7, w: 0.5, piece: 6, inset: 0 });
      P.hatch([[283, 410], [287, 410], [287, 505], [283, 505]], { ang: 45, gap: 1.3, a: 0.7, w: 0.5, piece: 6, inset: 0 });
      P.line(74, fl, 280, fl, { w: 1.2, passes: 2, rough: 0.3 });
      // batteries under the floor
      P.rect(76, fl + 3, 202, 12, { w: 0.9, passes: 1 });
      for (let x = 76; x < 278; x += 18) { P.line(x, fl + 3, x, fl + 15, { w: 0.6, passes: 1, over: 0, rough: 0.1 }); P.hatch([[x + 1, fl + 4], [x + 17, fl + 4], [x + 17, fl + 14], [x + 1, fl + 14]], { ang: 60, gap: 1.6, a: 0.55, w: 0.45, piece: 6, inset: 0.3 }); }
      // laser PV plate
      { const pl = [[62, 526], [292, 526], [284, 536], [70, 536]]; P.poly(pl, { w: 1.2, passes: 1 }); P.hatch(pl, { ang: 24, gap: 1.5, a: 0.7, w: 0.5, piece: 10, inset: 0 }); for (let x = 90; x < 285; x += 24) P.line(x, 526, x - 4, 536, { w: 0.4, passes: 1, over: 0, rough: 0.1 }); [[130, 518], [220, 518]].forEach(([x, y]) => P.line(x, y, x, 526, { w: 0.9, passes: 1, over: 0 })); }
      // ribbon + grippers on the right
      P.line(306, 378, 306, 560, { w: 1.2, passes: 2, rough: 0.3 }); P.line(316, 378, 316, 560, { w: 1.2, passes: 2, rough: 0.3 });
      for (let y = 380; y < 558; y += 6) { P.line(306, y, 316, y + 6, { w: 0.4, a: 0.7, passes: 1, over: 0, rough: 0.05 }); }
      P.hatch([[308, 380], [315, 380], [315, 558], [308, 558]], { ang: 85, gap: 1.2, a: 0.5, w: 0.45, inset: 0 });
      for (const y of [420, 470]) { for (const x of [299, 323]) { P.circle(x, y, 6.5, { w: 1, passes: 1, rough: 0.2 }); P.circle(x, y, 2, { w: 0.6, passes: 1 }); for (let a = 0; a < 6; a++) { const q = pol(6, a * PI / 3, [x, y]); P.line(x, y, q[0], q[1], { w: 0.4, passes: 1, over: 0, a: 0.6 }); } } P.line(288, y, 292, y, { w: 1.2, passes: 1, over: 0 }); P.line(323, y, 333, y, { w: 0.9, passes: 1, over: 0 }); P.line(288, y - 3, 288, y + 3, { w: 1, passes: 1, over: 0 }); }
      // windows
      for (let i = 0; i < 6; i++) { const x = 92 + i * 34, y = 417; P.circle(x, y, 8, { w: 1.2, passes: 1, rough: 0.2 }); P.circle(x, y, 5.8, { w: 0.6, passes: 1, rough: 0.2 });
        const d = []; for (let a = 0; a < 20; a++) { const q = pol(5.6, a * TAU / 20, [x, y]); d.push(q); } P.hatch(d, { ang: -50, gap: 1.4, a: 0.6, w: 0.45, inset: 0.3, piece: 6, fade: (px, py) => (i === 3 ? clamp(((px - x) + (py - y)) / 7 + 0.4, 0, 1) : 0.95) });
        if (i === 3) P.arc(x + 12, y + 6, 10, 10, 3.6, 5.1, { w: 0.6, passes: 1 }); }
      // ceiling duct + hanging planters (between the windows)
      P.line(74, 404, 280, 404, { w: 0.9, passes: 1, rough: 0.2 }); P.line(74, 408, 280, 408, { w: 0.5, passes: 1, rough: 0.2, a: 0.6 });
      for (let x = 82; x < 280; x += 22) P.line(x, 404, x, 408, { w: 0.5, passes: 1, over: 0, a: 0.7 });
      const planter = (x0, w) => {
        P.poly([[x0, 410], [x0 + w, 410], [x0 + w - 3, 418], [x0 + 3, 418]], { w: 1, passes: 1, over: 0 }); P.hatch([[x0 + 1, 411], [x0 + w - 1, 411], [x0 + w - 3, 417], [x0 + 3, 417]], { ang: 50, gap: 1.4, a: 0.6, w: 0.45, piece: 6, inset: 0 });
        for (let i = 0; i < 4; i++) { const sx = x0 + 3 + i * (w - 6) / 3, len = P.r(8, 12), sw = P.r(-4, 4); P.curve([[sx, 418], [sx + sw * 0.5, 418 + len * 0.5], [sx + sw, 418 + len]], { w: 0.8, a: 0.85, rough: 0.3 }); const ex = sx + sw, ey = 418 + len; P.curve([[ex, ey], [ex + 3, ey - 3], [ex + 1, ey - 6], [ex - 2, ey - 3], [ex, ey]], { w: 0.6, a: 0.8, rough: 0.2 }); }
      };
      planter(101, 16); planter(169, 16); planter(237, 16);
      // people
      const person = (x, k, hair, o = {}) => {
        const s = k, hx = x + 3 * s, hy = fl - 62 * s, hip = [x, fl - 26 * s], sh = [x + 2 * s, fl - 50 * s];
        // seat
        P.poly([[x - 12 * s, fl - 62 * s], [x - 7 * s, fl - 62 * s], [x - 6 * s, fl - 18 * s], [x - 12 * s, fl - 18 * s]], { w: 1, passes: 1, over: 0, rough: 0.2 });
        P.hatch([[x - 12 * s, fl - 62 * s], [x - 7 * s, fl - 62 * s], [x - 6 * s, fl - 18 * s], [x - 12 * s, fl - 18 * s]], { ang: 70, gap: 1.4, a: 0.65, w: 0.5, piece: 8, inset: 0 });
        P.line(x - 12 * s, fl - 20 * s, x + 12 * s, fl - 20 * s, { w: 1.1, passes: 1, over: 0, rough: 0.15 }); P.line(x - 6 * s, fl - 18 * s, x - 6 * s, fl, { w: 1, passes: 1, over: 0 });
        // legs, torso, arm, head
        const legs = [hip, [x + 16 * s, fl - 24 * s], [x + 16 * s, fl - 2]];
        P.curve([sh, [x + 1 * s, fl - 38 * s], hip], { w: 1.4, a: 0.95, rough: 0.2 }); P.curve([[x + 6 * s, fl - 50 * s], [x + 7 * s, fl - 38 * s], [x + 5 * s, fl - 28 * s]], { w: 1, a: 0.8, rough: 0.2 });
        P.pl(legs, { w: 1.3, a: 0.95, passes: 1, over: 0, rough: 0.15 }); P.pl([[x + 3 * s, fl - 20 * s], [x + 19 * s, fl - 20 * s], [x + 19 * s, fl - 2]], { w: 0.9, a: 0.85, passes: 1, over: 0, rough: 0.15 });
        P.line(x + 16 * s, fl - 1, x + 22 * s, fl - 1, { w: 1.4, passes: 1, over: 0 });
        P.pl([sh, [x + 10 * s, fl - 40 * s], [x + 15 * s, fl - 34 * s]], { w: 1.2, a: 0.9, passes: 1, over: 0, rough: 0.15 });
        P.circle(hx, hy, 6.4 * s, { w: 1.2, a: 0.95, passes: 1, rough: 0.15 }); P.line(hx - 1, hy + 6 * s, sh[0], sh[1], { w: 1, passes: 1, over: 0 });
        const cap = []; for (let a = PI; a <= TAU; a += 0.3) cap.push(pol(6.4 * s, a, [hx, hy]));
        P.hatch(cap.concat([[hx + 6.4 * s, hy - 1], [hx - 6.4 * s, hy - 1]]), { ang: hair, gap: 1.2, a: 0.85, w: 0.6, piece: 6, inset: 0 });
        P.dot(hx + 2.4 * s, hy + 0.5, 0.7); P.line(hx + 3 * s, hy + 3 * s, hx + 5 * s, hy + 3 * s, { w: 0.5, passes: 1, over: 0 });
        P.hatch([[x - 1, fl - 50 * s], [x + 6 * s, fl - 50 * s], [x + 5 * s, fl - 27 * s], [x - 2, fl - 27 * s]], { ang: 62, gap: 1.6, a: 0.6, w: 0.5, piece: 6, inset: 0 });
        P.line(sh[0] - 2, sh[1] + 2, hip[0] + 6 * s, hip[1] - 4, { w: 0.5, a: 0.7, passes: 1, over: 0 });
        if (o.hat) { P.line(hx - 9 * s, hy - 5 * s, hx + 9 * s, hy - 5 * s, { w: 1.3, passes: 1, over: 0 }); P.rect(hx - 5 * s, hy - 13 * s, 10 * s, 8 * s, { w: 1, passes: 1, over: 0 }); P.hatch([[hx - 5 * s, hy - 13 * s], [hx + 5 * s, hy - 13 * s], [hx + 5 * s, hy - 5 * s], [hx - 5 * s, hy - 5 * s]], { ang: 50, gap: 1.2, a: 0.8, w: 0.5, piece: 6, inset: 0 }); }
        if (o.book) { P.poly([[x + 12 * s, fl - 40 * s], [x + 20 * s, fl - 44 * s], [x + 22 * s, fl - 36 * s], [x + 14 * s, fl - 33 * s]], { w: 0.9, passes: 1, over: 0 }); }
      };
      person(94, 1, -40); person(128, 0.78, 30); person(164, 1, 60, { book: true }); person(230, 1, 20, { hat: true }); person(262, 0.95, -60);
      // dog under seat
      { const dx = 196, dy = fl - 8;
        P.ellipse(dx, dy, 11, 5.5, { w: 1.1, passes: 1, rough: 0.2 }); P.circle(dx + 13, dy - 5, 4.6, { w: 1, passes: 1, rough: 0.15 }); P.pl([[dx + 16, dy - 4], [dx + 21, dy - 2], [dx + 17, dy]], { w: 0.9, passes: 1, over: 0 }); P.dot(dx + 21, dy - 2, 1);
        P.pl([[dx + 11, dy - 9], [dx + 9, dy - 15], [dx + 14, dy - 10]], { w: 0.8, passes: 1, over: 0 }); P.curve([[dx - 11, dy - 1], [dx - 16, dy - 7], [dx - 14, dy - 13]], { w: 1, a: 0.9, rough: 0.2 });
        for (const lx of [-7, -3, 5, 9]) P.line(dx + lx, dy + 4, dx + lx, fl - 0.5, { w: 0.9, passes: 1, over: 0, rough: 0.1 });
        const bp = []; for (let a = 0; a < 16; a++) bp.push([dx + Math.cos(a * TAU / 16) * 10, dy + Math.sin(a * TAU / 16) * 5]);
        P.hatch(bp, { ang: 40, gap: 1.3, a: 0.75, w: 0.5, piece: 5, inset: 0 });
      }
      // labels
      T('12 PAX + 1 DOG (ORBIT)  20 T', 74, 552, 8.5, { a: 0.8 });
      T('LASER PV PLATE', 246, 552, 8.5, { a: 0.8 });
      T('RIBBON', 300, 384, 8, { a: 0.75, rot: 0, align: 'center' });
    })();

    /* ====================================================== FIG. C — BUS SCHEMATIC (style C) */
    (function bus() {
      inset(56, 582, 294, 168, 'FIG. C – CLIMBER POWER + DATA BUS');
      const chip = (x, y, w, h, np, label) => {
        P.rect(x, y, w, h, { w: 1.5, a: 0.95, passes: 1, over: 0.5, rough: 0.2 }); P.rect(x + 4, y + 4, w - 8, h - 8, { w: 0.8, passes: 1, over: 0, rough: 0.2 });
        P.rect(x + 10, y + 10, w - 20, h - 20, { w: 0.9, passes: 1, over: 0, rough: 0.2 });
        const core = [[x + 14, y + 14], [x + w - 14, y + 14], [x + w - 14, y + h - 14], [x + 14, y + h - 14]];
        P.hatch(core, { ang: 50, gap: 2.4, a: 0.7, w: 0.5, cross: 90, piece: 10, inset: 0 });
        for (let i = 0; i < np; i++) { const f = (i + 0.5) / np; for (const [ax, ay, bx, by] of [[x + f * w, y - 4, x + f * w, y], [x + f * w, y + h, x + f * w, y + h + 4], [x - 4, y + f * h, x, y + f * h], [x + w, y + f * h, x + w + 4, y + f * h]]) P.line(ax, ay, bx, by, { w: 1, a: 0.9, passes: 1, over: 0, rough: 0.05 }); }
        P.line(x, y + 8, x + 8, y, { w: 1.3, passes: 1, over: 0 });
        T(label, x + w / 2, y + h / 2 + 3, 8, { align: 'center', a: 0.8, c: BLK });
      };
      chip(72, 604, 50, 80, 9, 'PWR'); chip(284, 604, 52, 80, 9, 'DRV');
      P.bus([[126, 618], [186, 618], [186, 640], [280, 640]], 5, 3.6, { colors: [RED], pads: 1.8, w: 1.4 });
      P.bus([[126, 664], [206, 664], [206, 656], [280, 656]], 4, 3.6, { colors: [GRN], pads: 1.8, w: 1.4 });
      P.bus([[126, 634], [160, 634], [160, 626], [200, 626]], 3, 3.4, { colors: [GRN], pads: 1.6, w: 1.2 });
      // resistor string
      for (let i = 0; i < 5; i++) { const x = 150 + i * 26; P.rrect(x, 686, 18, 6, 3, { w: 0.9, passes: 1 }); P.line(x + 5, 686, x + 5, 692, { w: 0.5, passes: 1, over: 0 }); P.line(x + 12, 686, x + 12, 692, { w: 0.5, passes: 1, over: 0 }); P.line(x - 8, 689, x, 689, { w: 0.9, c: i % 2 ? GRN : RED, passes: 1, over: 0 }); P.line(x + 18, 689, x + 26, 689, { w: 0.9, c: i % 2 ? GRN : RED, passes: 1, over: 0 }); }
      // capacitors
      [[152, 716], [186, 716], [222, 716], [256, 716]].forEach(([x, y], i) => { P.circle(x, y, 9, { w: 1.2, passes: 1 }); P.circle(x, y, 6.3, { w: 0.7, passes: 1 }); P.line(x - 4, y, x + 4, y, { w: 0.8, passes: 1, over: 0 }); P.line(x, y - 4, x, y + 4, { w: 0.8, passes: 1, over: 0 }); P.line(x, y + 9, x, y + 16, { w: 1, c: i % 2 ? GRN : RED, passes: 1, over: 0 }); });
      // drop-down bundles to the edge connector
      P.bus([[80, 688], [80, 722]], 4, 4, { colors: [RED], pads: 1.6, w: 1.3 }); P.bus([[108, 688], [108, 722]], 3, 4, { colors: [GRN], pads: 1.6, w: 1.3 });
      P.bus([[300, 688], [300, 722]], 3, 4, { colors: [RED], pads: 1.6, w: 1.3 }); P.bus([[324, 688], [324, 722]], 3, 4, { colors: [GRN], pads: 1.6, w: 1.3 });
      for (const [x0, x1] of [[70, 118], [288, 336]]) for (let x = x0; x < x1; x += 8) { P.rect(x, 728, 6, 14, { w: 0.9, passes: 1, over: 0, rough: 0.1 }); P.hatch([[x + 0.5, 729], [x + 5.5, 729], [x + 5.5, 741], [x + 0.5, 741]], { ang: 55, gap: 1.5, a: 0.6, w: 0.45, piece: 6, inset: 0 }); }
      // test crosses
      [[256, 624], [176, 690]].forEach(([x, y]) => { P.line(x - 3, y - 3, x + 3, y + 3, { w: 1.1, c: RED, passes: 1, over: 0 }); P.line(x - 3, y + 3, x + 3, y - 3, { w: 1.1, c: RED, passes: 1, over: 0 }); P.curve([[x, y], [x + 8, y - 8], [x + 16, y - 6]], { w: 0.6, c: RED, rough: 0.3 }); P.circle(x + 18, y - 6, 1.6, { w: 0.7, c: RED, passes: 1 }); });
      // legend
      P.line(130, 602, 148, 602, { w: 1.6, c: RED, passes: 1, over: 0 }); T('POWER 2 MW', 152, 605, 8, { a: 0.85 }); P.line(222, 602, 240, 602, { w: 1.6, c: GRN, passes: 1, over: 0 }); T('DATA 10 GB/S', 244, 605, 8, { a: 0.85 });
    })();

    /* ====================================================== FIG. D — GEO STATION */
    (function geo() {
      inset(1252, 276, 293, 206, 'FIG. D – GEO STATION, 35,786 KM');
      const cx = 1400;
      // ribbon arriving from lower-left
      { const a = [1262, 476], b = [cx - 3, 462], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
        P.line(a[0] + nx * 3.5, a[1] + ny * 3.5, b[0] + nx * 3.5, b[1] + ny * 3.5, { w: 1.3, passes: 2 }); P.line(a[0] - nx * 3.5, a[1] - ny * 3.5, b[0] - nx * 3.5, b[1] - ny * 3.5, { w: 1.3, passes: 2 });
        for (let d = 0; d < l; d += 5) { const px = a[0] + ux * d, py = a[1] + uy * d; P.line(px + nx * 3.5, py + ny * 3.5, px + ux * 5 - nx * 3.5, py + uy * 5 - ny * 3.5, { w: 0.45, a: 0.8, passes: 1, over: 0, rough: 0.05 }); }
        P.wash([[a[0] + nx * 3.5, a[1] + ny * 3.5], [b[0] + nx * 3.5, b[1] + ny * 3.5], [b[0] - nx * 3.5, b[1] - ny * 3.5], [a[0] - nx * 3.5, a[1] - ny * 3.5]], INK, 0.35, { edge: 0, jit: 0.2, steps: 2 });
        T('RIBBON IN', 1290, 462, 8.5, { a: 0.8, rot: dg(-11) }); }
      // spine
      P.rect(cx - 6, 300, 12, 164, { w: 1.6, passes: 1, over: 0.5, rough: 0.2 }); P.hatch([[cx + 1, 301], [cx + 5, 301], [cx + 5, 463], [cx + 1, 463]], { ang: 80, gap: 1.2, a: 0.6, w: 0.5, inset: 0 });
      for (let y = 312; y < 462; y += 12) P.line(cx - 6, y, cx + 6, y, { w: 0.5, passes: 1, over: 0, a: 0.7, rough: 0.05 });
      P.pl([[cx - 8, 300], [cx - 3, 288], [cx + 3, 288], [cx + 8, 300]], { w: 1.2, passes: 1, over: 0 }); P.line(cx, 288, cx, 282, { w: 1, passes: 1, over: 0 }); P.circle(cx, 280, 2.5, { w: 0.8, passes: 1 });
      P.rect(cx - 9, 464, 18, 8, { w: 1.3, passes: 1, over: 0 });
      // habitat ring
      const RX = 82, RY = 24, RY2 = 20, RX2 = 72, cy = 388;
      { const front = [], back = []; for (let i = 0; i <= 30; i++) { const a = i / 30 * PI; front.push([cx + RX * Math.cos(a), cy + RY * Math.sin(a)]); } for (let i = 30; i >= 0; i--) { const a = i / 30 * PI; back.push([cx + RX2 * Math.cos(a), cy + RY2 * Math.sin(a) - 0]); }
        const band = front.concat(back);
        P.hatch(band, { ang: 55, gap: 1.3, a: 0.75, w: 0.5, piece: 8, inset: 0 });
        P.arc(cx, cy, RX, RY, 0, PI, { w: 1.8, passes: 1, rough: 0.25 }); P.arc(cx, cy, RX2, RY2, 0, PI, { w: 1.1, passes: 1, rough: 0.25 });
        P.arc(cx, cy, RX, RY, PI, TAU, { w: 1.1, a: 0.85, passes: 1, rough: 0.25 }); P.arc(cx, cy, RX2, RY2, PI, TAU, { w: 0.7, a: 0.6, passes: 1, rough: 0.25 });
        P.line(cx - RX, cy, cx - RX2, cy, { w: 1, passes: 1, over: 0 }); P.line(cx + RX, cy, cx + RX2, cy, { w: 1, passes: 1, over: 0 });
        for (let a = 0.12; a < PI - 0.05; a += 0.16) { const x = cx + Math.cos(a) * (RX + RX2) / 2, y = cy + Math.sin(a) * (RY + RY2) / 2; P.rrect(x - 1.5, y - 1.4, 3, 2.6, 1, { w: 0.5, passes: 1, c: BLK }); }
        for (const a of [PI * 0.5, PI * 0.06, PI * 0.94, PI * 1.5]) { const x = cx + Math.cos(a) * RX2, y = cy + Math.sin(a) * RY2; P.line(cx + (a === PI * 0.5 || a === PI * 1.5 ? 0 : Math.sign(Math.cos(a)) * 6), cy, x, y, { w: 1.1, passes: 1, over: 0, rough: 0.2 }); }
        for (const a of [PI * 0.3, PI * 0.7, PI * 1.3, PI * 1.7]) { const x = cx + Math.cos(a) * RX2, y = cy + Math.sin(a) * RY2; P.line(cx + Math.cos(a) * 6, cy + Math.sin(a) * 2, x, y, { w: 0.6, a: 0.6, passes: 1, over: 0 }); }
      }
      // solar wings
      for (const sg of [-1, 1]) {
        const x0 = cx + sg * 8; P.line(x0, 312, cx + sg * 96, 312, { w: 1.1, passes: 1, over: 0, rough: 0.2 });
        for (let i = 0; i < 4; i++) { const xa = cx + sg * (12 + i * 24), xb = cx + sg * (34 + i * 24), q = [[xa, 298], [xb, 298], [xb, 326], [xa, 326]]; P.poly(q, { w: 0.9, a: 0.9, passes: 1, over: 0, rough: 0.15 });
          for (let g = 1; g < 4; g++) P.line(lerp(xa, xb, g / 4), 298, lerp(xa, xb, g / 4), 326, { w: 0.4, a: 0.7, passes: 1, over: 0, rough: 0.05 }); for (let g = 1; g < 3; g++) P.line(xa, lerp(298, 326, g / 3), xb, lerp(298, 326, g / 3), { w: 0.4, a: 0.7, passes: 1, over: 0, rough: 0.05 });
          P.hatch(q, { ang: 30, gap: 2, a: 0.42, w: 0.4, piece: 8, inset: 0.5, fade: () => (i % 2 ? 0.9 : 0.5) }); }
      }
      // docks + ships
      for (const sg of [-1, 1]) { const xe = cx + sg * 64, y = 352; P.line(cx + sg * 6, y, xe, y, { w: 1.3, passes: 1, over: 0, rough: 0.2 }); P.line(cx + sg * 6, y + 4, xe, y + 4, { w: 0.6, passes: 1, over: 0 });
        const sx = xe + sg * 16; P.rrect(Math.min(xe, sx + sg * 14) , y - 5, 30, 10, 5, { w: 1.1, passes: 1 }); for (let k = 0; k < 3; k++) P.circle(xe + sg * (10 + k * 6), y, 1.4, { w: 0.5, passes: 1 }); P.hatch([[Math.min(xe, xe + sg * 30) + 3, y + 1], [Math.max(xe, xe + sg * 30) - 3, y + 1], [Math.max(xe, xe + sg * 30) - 4, y + 4], [Math.min(xe, xe + sg * 30) + 4, y + 4]], { ang: 40, gap: 1.3, a: 0.6, w: 0.45, piece: 6, inset: 0 });
      }
      // greenhouse (right, bottom)
      P.rrect(cx + 30, 424, 84, 26, 12, { w: 1.4, passes: 1, rough: 0.2 }); P.line(cx + 6, 437, cx + 30, 437, { w: 1.1, passes: 1, over: 0 });
      for (let x = cx + 42; x < cx + 108; x += 7) P.line(x, 426, x, 448, { w: 0.4, a: 0.55, passes: 1, over: 0, rough: 0.05 });
      for (let i = 0; i < 9; i++) { const x = cx + 40 + i * 8, h = P.r(5, 10); P.curve([[x, 449], [x + P.r(-2, 2), 449 - h * 0.5], [x + P.r(-3, 3), 449 - h]], { w: 0.7, a: 0.85, rough: 0.2 }); P.dot(x, 449 - h, 1.1, { a: 0.9 }); }
      P.hatch([[cx + 34, 442], [cx + 110, 442], [cx + 108, 449], [cx + 36, 449]], { ang: 20, gap: 1.6, a: 0.5, w: 0.45, piece: 8, inset: 0 });
      // observatory dome (left, bottom)
      P.line(cx - 6, 440, cx - 44, 440, { w: 1.1, passes: 1, over: 0 }); P.rect(cx - 74, 434, 32, 10, { w: 1.2, passes: 1, over: 0 });
      P.arc(cx - 58, 434, 15, 15, PI, TAU, { w: 1.5, passes: 1 }); P.line(cx - 58, 434, cx - 58, 419, { w: 0.6, passes: 1, over: 0 }); P.arc(cx - 58, 434, 15, 6, PI, TAU, { w: 0.5, a: 0.7, passes: 1 });
      P.line(cx - 55, 421, cx - 46, 411, { w: 1.4, passes: 1, over: 0 }); P.line(cx - 52, 424, cx - 43, 414, { w: 1.4, passes: 1, over: 0 });
      { const d = []; for (let a = PI; a <= TAU + 0.01; a += 0.25) d.push(pol(14, a, [cx - 58, 434])); P.hatch(d, { ang: 60, gap: 1.4, a: 0.7, w: 0.45, piece: 6, inset: 0, fade: (x, y) => clamp(((x - (cx - 58)) / 14) * 0.8 + 0.5, 0, 1) }); }
      // notes
      P.note('SOLAR WING', 1300, 335, 1312, 326, { size: 8.5, a: 0.85, align: 'right' });
      P.note('HABITAT RING  0.3 G', 1412, 342, cx + 44, cy - 21, { size: 8.5 });
      P.note('DOCKS 1-4', 1296, 352, 1309, 352, { size: 8.5, align: 'right' });
      P.note('GREENHOUSE', 1430, 470, cx + 60, 450, { size: 8.5 });
      P.note('OBSERVATORY', 1266, 420, cx - 62, 424, { size: 8.5 });
    })();

    /* ====================================================== FIG. E — COUNTERWEIGHT */
    (function cw() {
      inset(1252, 92, 293, 172, 'FIG. E – COUNTERWEIGHT: CAPTURED ROCK');
      const cx = 1420, cy = 182, out = [];
      for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, k = 1 + 0.14 * Math.sin(a * 3 + 1) + P.r(-0.05, 0.05); out.push([cx + Math.cos(a) * 92 * k, cy + Math.sin(a) * 42 * k - Math.cos(a) * 6]); }
      const poly = S.catmull(out, true, 5);
      const lit = (x, y) => clamp(((x - cx) / 92 + (y - cy) / 42) * 0.5 + 0.45, 0, 1);
      P.erase(poly);
      P.hatch(poly, { ang: -52, gap: 1.9, a: 0.7, w: 0.55, fade: (x, y) => 0.25 + 0.75 * lit(x, y), piece: 8, inset: 0.5 });
      P.hatch(poly, { ang: 28, gap: 2.4, a: 0.6, w: 0.5, fade: (x, y) => Math.max(0, lit(x, y) - 0.35) * 1.6, piece: 8, inset: 0.5 });
      P.pl(poly, { closed: true, w: 1.6, a: 0.95, rough: 0.45, passes: 2, over: 0 });
      // craters
      [[-40, -6, 14, 6], [-8, 12, 18, 7], [34, -12, 12, 5], [52, 12, 10, 4], [-64, 10, 8, 3.4], [12, -16, 7, 3]].forEach(([dx, dy, rx, ry]) => { P.ellipse(cx + dx, cy + dy, rx, ry, { w: 0.9, a: 0.9, passes: 1 }); P.arc(cx + dx, cy + dy, rx * 0.8, ry * 0.8, 0.3, 2.9, { w: 0.5, a: 0.8, passes: 1 }); });
      // anchor collar + ribbon
      { const a = [1258, 258], b = [cx - 78, cy + 26], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
        P.erase([[a[0] - nx * 4, a[1] - ny * 4], [a[0] + nx * 4, a[1] + ny * 4], [b[0] + nx * 4, b[1] + ny * 4], [b[0] - nx * 4, b[1] - ny * 4]]);
        P.line(a[0] + nx * 3.5, a[1] + ny * 3.5, b[0] + nx * 3.5, b[1] + ny * 3.5, { w: 1.3, passes: 2 }); P.line(a[0] - nx * 3.5, a[1] - ny * 3.5, b[0] - nx * 3.5, b[1] - ny * 3.5, { w: 1.3, passes: 2 });
        for (let d = 0; d < l; d += 5) { const px = a[0] + ux * d, py = a[1] + uy * d; P.line(px + nx * 3.5, py + ny * 3.5, px + ux * 5 - nx * 3.5, py + uy * 5 - ny * 3.5, { w: 0.45, a: 0.8, passes: 1, over: 0, rough: 0.05 }); }
        for (let k = 0; k < 3; k++) { const q = [b[0] - ux * k * 6, b[1] - uy * k * 6]; P.ellipse(q[0], q[1], 3, 8, { rot: Math.atan2(uy, ux) - PI / 2 + PI / 2, w: 1.2, a: 0.95, passes: 1 }); }
        P.circle(b[0], b[1], 5, { w: 1.3, passes: 1 }); }
      // mining rigs (derricks)
      const derrick = (x, y, h, lean) => {
        const w = 8;
        P.line(x - w, y, x - 2 + lean, y - h, { w: 1.2, passes: 1, over: 0, rough: 0.15 }); P.line(x + w, y, x + 2 + lean, y - h, { w: 1.2, passes: 1, over: 0, rough: 0.15 });
        for (let k = 0; k < 5; k++) { const f0 = k / 5, f1 = (k + 1) / 5, xa0 = lerp(x - w, x - 2 + lean, f0), xb0 = lerp(x + w, x + 2 + lean, f0), xa1 = lerp(x - w, x - 2 + lean, f1), xb1 = lerp(x + w, x + 2 + lean, f1), ya = y - h * f0, yb = y - h * f1;
          P.line(xa0, ya, xb1, yb, { w: 0.5, passes: 1, over: 0, rough: 0.05 }); P.line(xb0, ya, xa1, yb, { w: 0.5, passes: 1, over: 0, rough: 0.05 }); P.line(xa1, yb, xb1, yb, { w: 0.6, passes: 1, over: 0, rough: 0.05 }); }
        P.rect(x - 4 + lean, y - h - 4, 8, 4, { w: 0.9, passes: 1, over: 0 }); P.line(x + lean, y - h - 4, x + lean, y - h - 10, { w: 0.8, passes: 1, over: 0 }); P.circle(x + lean, y - h - 12, 2, { w: 0.7, passes: 1 });
        P.line(x, y, x, y + 10, { w: 0.9, passes: 1, over: 0 });
      };
      derrick(1378, 158, 22, 2); derrick(1444, 142, 26, -2); derrick(1488, 160, 18, 2);
      // dome + conveyor + dust
      P.arc(1470, 200, 12, 12, PI, TAU, { w: 1.4, passes: 1 }); P.line(1458, 200, 1482, 200, { w: 1.1, passes: 1, over: 0 }); P.line(1470, 200, 1470, 188, { w: 0.5, passes: 1, over: 0 });
      P.pl([[1448, 150], [1454, 178], [1462, 198]], { w: 0.8, a: 0.9, passes: 1, over: 0, rough: 0.3 });
      for (let k = 0; k < 6; k++) { const f = k / 6, x = lerp(1448, 1462, f) + (f > 0.4 ? 3 : 0), y = lerp(150, 198, f); P.circle(x + 2, y, 1.4, { w: 0.6, passes: 1 }); }
      { const D = []; for (let i = 0; i < 90; i++) { const a = P.r(-0.9, 0.5) - PI / 2, d = P.r(4, 60), x = 1444 + Math.cos(a) * d * 0.5 - i * 0.2, y = 128 - d * 0.5 + P.r(-8, 8); if (y > 98) D.push([x, y, P.r(0.3, 1)]); } P.dots(D, INK, 0.6); }
      // tug ship
      { const x = 1500, y = 236; P.rrect(x, y, 26, 10, 4, { w: 1.1, passes: 1 }); P.rect(x + 26, y + 2, 5, 6, { w: 0.9, passes: 1, over: 0 }); P.hatch([[x + 2, y + 6], [x + 24, y + 6], [x + 22, y + 9], [x + 3, y + 9]], { ang: 40, gap: 1.4, a: 0.6, w: 0.45, piece: 6, inset: 0 }); const D = []; for (let i = 0; i < 20; i++) D.push([x - 2 - i * 1.6 - P.r(0, 3), y + 5 + P.r(-i * 0.3, i * 0.3), P.r(0.3, 0.9)]); P.dots(D, INK, 0.7); }
      // stars
      { const D = []; for (let i = 0; i < 50; i++) { const x = P.r(1262, 1538), y = P.r(112, 256); if (Math.hypot((x - cx) / 100, (y - cy) / 50) > 1 && !(y > 232 && x < 1290)) D.push([x, y, P.r(0.4, 0.9)]); } P.dots(D, INK, 0.6); }
      P.note('MINING RIG', 1266, 126, 1372, 148, { size: 8.5 });
      P.note('ANCHOR COLLAR', 1274, 236, 1350, 204, { size: 8.5 });
      P.note('2 MEGATONNES', 1440, 250, 1420, 214, { size: 8.5 });
      P.note('REGOLITH PLUME', 1462, 112, 1446, 122, { size: 8.5, align: 'left' });
    })();

    /* ====================================================== FIG. F — OCEAN PLATFORM */
    (function platform() {
      inset(1252, 494, 293, 226, 'FIG. F – OCEAN PLATFORM, 0 N  92 W');
      const wl = 672, dk = 634;
      // storm cloud (blue ink, ref E) + lightning
      P.cloud(1330, 544, 118, 44, { c: BLU, lobes: 12, inner: 3, r: 4.6, w: 1.05, a: 0.95, gap: 2 });
      P.cloud(1500, 528, 62, 26, { c: BLU, lobes: 9, inner: 2, r: 3.8, w: 1, a: 0.95 });
      { const bolt = [[1318, 566], [1309, 580], [1319, 582], [1305, 604], [1321, 598], [1307, 618]];
        P.pl(bolt, { w: 1.9, c: BLU, a: 0.95, rough: 0.2, over: 0, passes: 1 }); P.pl(bolt.map(([x, y]) => [x + 2.2, y]), { w: 0.7, c: BLU, a: 0.6, rough: 0.2, over: 0, passes: 1 });
        for (let i = 0; i < 26; i++) { const x = P.r(1268, 1390), y = P.r(570, 606); P.line(x, y, x - 2, y + 6, { w: 0.5, c: BLU, a: 0.55, passes: 1, over: 0, rough: 0.05 }); } }
      // sea
      const sea = [[1256, wl], [1541, wl], [1541, 716], [1256, 716]];
      P.hatch(sea, { ang: 0, gap: 3.2, a: 0.5, w: 0.45, piece: 14, inset: 0, fade: (x, y) => 0.9 - (y - wl) / 90 });
      for (let k = 0; k < 9; k++) { const y = wl + 2 + k * 5, pts = []; for (let x = 1260; x <= 1538; x += 14) pts.push([x, y + Math.sin(x * 0.08 + k * 2) * 1.6]); P.path(pts, { w: 0.55, a: 0.5 - k * 0.03, rough: 0.3 }); }
      P.line(1256, wl, 1541, wl, { w: 1.1, a: 0.85, rough: 0.5, passes: 1 });
      // pontoons + columns
      for (const [x0, w] of [[1290, 112], [1424, 112]]) { P.rrect(x0, wl - 9, w, 20, 10, { w: 1.4, passes: 1, rough: 0.2 }); P.hatch([[x0 + 8, wl + 1], [x0 + w - 8, wl + 1], [x0 + w - 10, wl + 9], [x0 + 10, wl + 9]], { ang: 30, gap: 1.5, a: 0.6, w: 0.45, piece: 8, inset: 0 });
        for (const f of [0.18, 0.5, 0.82]) { const x = x0 + w * f; P.line(x - 5, dk + 6, x - 5, wl - 9, { w: 1.1, passes: 1, over: 0, rough: 0.15 }); P.line(x + 5, dk + 6, x + 5, wl - 9, { w: 1.1, passes: 1, over: 0, rough: 0.15 }); P.line(x - 5, dk + 6, x + 5, wl - 9, { w: 0.5, passes: 1, over: 0 }); P.line(x + 5, dk + 6, x - 5, wl - 9, { w: 0.5, passes: 1, over: 0 }); } }
      // deck
      P.rect(1284, dk, 258, 8, { w: 1.5, passes: 1, rough: 0.2 }); P.hatch([[1286, dk + 1], [1540, dk + 1], [1540, dk + 7], [1286, dk + 7]], { ang: 12, gap: 1.4, a: 0.65, w: 0.45, piece: 10, inset: 0 });
      for (let x = 1290; x < 1540; x += 10) P.line(x, dk - 4, x, dk, { w: 0.5, passes: 1, over: 0, a: 0.7 }); P.line(1284, dk - 4, 1542, dk - 4, { w: 0.6, passes: 1, over: 0 });
      // lattice tower + ribbon
      { const bx = 1436, top = 512;
        const wAt = y => lerp(6, 24, (y - top) / (dk - top));
        P.line(bx - wAt(dk), dk, bx - 6, top, { w: 1.5, passes: 1, rough: 0.2 }); P.line(bx + wAt(dk), dk, bx + 6, top, { w: 1.5, passes: 1, rough: 0.2 });
        for (let y = dk; y > top + 8; y -= 12) { const w0 = wAt(y), w1 = wAt(y - 12); P.line(bx - w0, y, bx + w1, y - 12, { w: 0.5, passes: 1, over: 0, rough: 0.05 }); P.line(bx + w0, y, bx - w1, y - 12, { w: 0.5, passes: 1, over: 0, rough: 0.05 }); P.line(bx - w0, y, bx + w0, y, { w: 0.6, passes: 1, over: 0, rough: 0.05 }); }
        P.hatch([[bx + 2, dk], [bx + wAt(dk), dk], [bx + 6, top], [bx + 2, top]], { ang: 78, gap: 1.6, a: 0.6, w: 0.45, piece: 10, inset: 0 });
        P.rect(bx - 8, top - 4, 16, 6, { w: 1, passes: 1, over: 0 });
        P.line(bx - 3.5, top - 4, bx - 3.5, 498, { w: 1.3, passes: 1, rough: 0.2 }); P.line(bx + 3.5, top - 4, bx + 3.5, 498, { w: 1.3, passes: 1, rough: 0.2 });
        for (let y = 500; y < top - 5; y += 4) P.line(bx - 3.5, y, bx + 3.5, y + 4, { w: 0.4, passes: 1, over: 0, a: 0.8 });
        // stays
        for (const dx of [-88, -50, 54, 92]) P.line(bx + Math.sign(dx) * 2, top + 8, bx + dx, dk - 4, { w: 0.45, a: 0.7, passes: 1, over: 0, rough: 0.2 }); }
      // laser array + beams
      { for (let i = 0; i < 4; i++) { const x = 1306 + i * 24; P.line(x, dk - 4, x, dk - 12, { w: 1, passes: 1, over: 0 }); P.arc(x, dk - 22, 10, 10, dg(15), dg(165), { w: 1.3, passes: 1, rough: 0.15 }); P.line(x - 9, dk - 20, x + 9, dk - 20, { w: 0.5, passes: 1, over: 0 }); P.dot(x, dk - 25, 1.2);
          P.dashed(x, dk - 28, 1433 + (i - 1.5) * 0.8, 502, [6, 4], { w: 0.5, a: 0.55 }); }
        P.erase([[1338, dk - 50], [1418, dk - 50], [1418, dk - 30], [1338, dk - 30]]); T('LASER ARRAY  4 MW', 1340, dk - 36, 8.5, { a: 0.9 }); }
      // hut + crane + tug
      P.rect(1468, dk - 20, 34, 20, { w: 1.2, passes: 1, over: 0 }); P.rect(1472, dk - 16, 6, 6, { w: 0.6, passes: 1, over: 0 }); P.rect(1482, dk - 16, 6, 6, { w: 0.6, passes: 1, over: 0 }); P.line(1495, dk - 20, 1495, dk - 32, { w: 0.9, passes: 1, over: 0 }); P.line(1490, dk - 28, 1500, dk - 28, { w: 0.6, passes: 1, over: 0 });
      P.hatch([[1469, dk - 19], [1501, dk - 19], [1501, dk - 17], [1469, dk - 17]], { ang: 20, gap: 1.2, a: 0.6, w: 0.5, inset: 0 });
      { const bx = 1522; P.line(bx - 6, dk - 4, bx - 1, dk - 52, { w: 1.2, passes: 1, over: 0 }); P.line(bx + 6, dk - 4, bx + 1, dk - 52, { w: 1.2, passes: 1, over: 0 }); P.line(bx - 6, dk - 4, bx + 1, dk - 40, { w: 0.5, passes: 1, over: 0 }); P.line(bx + 6, dk - 4, bx - 1, dk - 40, { w: 0.5, passes: 1, over: 0 });
        P.line(bx, dk - 50, bx - 46, dk - 62, { w: 1.3, passes: 1, over: 0 }); P.line(bx, dk - 50, bx + 8, dk - 44, { w: 0.9, passes: 1, over: 0 }); P.line(bx - 46, dk - 62, bx - 46, dk - 20, { w: 0.5, passes: 1, over: 0 }); P.rect(bx - 52, dk - 20, 12, 10, { w: 1, passes: 1, over: 0 }); P.hatch([[bx - 51, dk - 19], [bx - 41, dk - 19], [bx - 41, dk - 11], [bx - 51, dk - 11]], { ang: 50, gap: 1.3, a: 0.7, w: 0.5, inset: 0 }); }
      P.pl([[1266, wl + 16], [1290, wl + 16], [1286, wl + 24], [1270, wl + 24]], { closed: true, w: 1, passes: 1, over: 0 }); P.rect(1272, wl + 10, 8, 6, { w: 0.8, passes: 1, over: 0 });
      P.note('LATTICE TOWER', 1486, 560, 1450, 580, { size: 8.5, align: 'left' });
      T('TUG', 1296, wl + 24, 8, { a: 0.75 }); T('CRANE', 1500, 590, 8, { a: 0.75 });
      T('STORM: LIGHTNING TAKEN BY THE ARRAY', 1262, 710, 7.5, { a: 0.8, c: BLU });
    })();

    /* ====================================================== FIG. G — STORM AT THE FOOT (style E) */
    (function storm() {
      inset(56, 782, 384, 176, 'FIG. G – THE DOLDRUMS, WEATHER AT THE FOOT');
      const cx = 290, cy = 872;
      // cyclone arms as scalloped tubes
      for (let arm = 0; arm < 5; arm++) {
        const pts = []; const a0 = arm * TAU / 5;
        for (let k = 0; k <= 8; k++) { const f = k / 8, rr = 22 + f * 96, a = a0 + f * 2.5; pts.push([cx + rr * Math.cos(a) * 1.5, cy + rr * Math.sin(a) * 0.75]); }
        const q = pts.filter(p => p[0] > 70 && p[0] < 428 && p[1] > 808 && p[1] < 948); if (q.length > 3) P.cloudTube(q, 12, 7, { c: BLU, w: 0.95, a: 0.95, rib: 2, gap: 2.3 });
      }
      // eye wall lobes
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + 0.3, x = cx + Math.cos(a) * 30 * 1.4, y = cy + Math.sin(a) * 30 * 0.72; P.cloud(x, y, 34, 24, { c: BLU, lobes: 9, inner: 2, w: 1.1, a: 0.95, gap: 2 }); }
      P.circle(cx, cy, 11, { w: 0.9, c: BLU, a: 0.8, passes: 1 }); P.dot(cx, cy, 1.2, { c: BLU });
      // outer cumulus banks
      P.cloud(122, 826, 92, 34, { c: BLU, lobes: 12, inner: 3, w: 1.05, a: 0.9, gap: 2.2 });
      P.cloud(400, 934, 64, 26, { c: BLU, lobes: 9, inner: 2, w: 1, a: 0.9 });
      P.cloud(390, 830, 70, 28, { c: BLU, lobes: 10, inner: 2, w: 1, a: 0.9 });
      P.cloud(190, 938, 80, 26, { c: BLU, lobes: 10, inner: 2, w: 1, a: 0.9 });
      // lightning
      for (const bolt of [[[434 - 40, 850], [416, 866], [426, 868], [410, 892]], [[176, 848], [168, 862], [176, 864], [164, 884], [178, 880], [170, 900]]]) { P.pl(bolt, { w: 1.7, c: BLU, a: 0.95, rough: 0.2, over: 0, passes: 1 }); P.pl(bolt.map(([x, y]) => [x + 2, y]), { w: 0.6, c: BLU, a: 0.55, rough: 0.2, over: 0, passes: 1 }); }
      // calm zone + platform marker
      { const c = [104, 870]; for (const r of [4, 9, 15]) P.circle(c[0], c[1], r, { w: 1, c: RED, a: 0.9, passes: 1, rough: 0.3 }); P.line(c[0] - 21, c[1], c[0] + 21, c[1], { w: 0.6, c: RED, a: 0.7, passes: 1, over: 0 }); P.line(c[0], c[1] - 21, c[0], c[1] + 21, { w: 0.6, c: RED, a: 0.7, passes: 1, over: 0 });
        T('PLATFORM', 82, 916, 9, { c: RED, a: 0.95 }); T('CALM BELT', 84, 930, 8, { c: RED, a: 0.8 }); }
      T('NO CYCLONES ON THE LINE', 74, 950, 8, { c: BLU, a: 0.9 });
    })();

    /* ====================================================== TENSION MATH + TAPER CHART */
    (function maths() {
      const x0 = 1268, y0 = 736;
      // taper chart
      P.line(x0, 858, x0, y0 + 8, { w: 1, a: 0.85 }); P.line(x0, 858, x0 + 108, 858, { w: 1, a: 0.85 });
      P.line(x0 - 3, y0 + 14, x0, y0 + 6, { w: 0.9, passes: 1, over: 0 }); P.line(x0 + 3, y0 + 14, x0, y0 + 6, { w: 0.9, passes: 1, over: 0 });
      P.line(x0 + 102, 855, x0 + 110, 858, { w: 0.9, passes: 1, over: 0 }); P.line(x0 + 102, 861, x0 + 110, 858, { w: 0.9, passes: 1, over: 0 });
      const cv = []; for (let i = 0; i <= 40; i++) { const f = i / 40, r = f, y = 858 - 100 * (Math.exp(1.15 * Math.sin(f * PI * 0.5)) - 1) / (Math.exp(1.15) - 1) * 0.6 - 4; cv.push([x0 + 8 + f * 88, y]); }
      const area = cv.concat([[x0 + 96, 858], [x0 + 8, 858]]);
      P.hatch(area, { ang: -55, gap: 2.4, a: 0.45, w: 0.45, piece: 10, inset: 0.5 });
      P.path(cv, { w: 1.5, a: 0.95, rough: 0.35, passes: 2 });
      for (let i = 0; i <= 8; i++) { const x = x0 + 8 + i * 11; P.line(x, 858, x, 862, { w: 0.6, passes: 1, over: 0 }); }
      for (let i = 0; i <= 4; i++) { const y = 858 - i * 24; P.line(x0 - 3, y, x0, y, { w: 0.6, passes: 1, over: 0 }); }
      const end = cv[cv.length - 1]; P.circle(end[0], end[1], 4, { w: 1.1, c: RED, passes: 1 }); P.dashed(end[0], end[1], end[0], 858, [3, 3], { w: 0.6, c: RED, a: 0.8 });
      T('AREA A(R)', x0 + 6, y0 + 6, 8, { a: 0.85 }); T('GEO', end[0] - 8, 872, 8, { c: RED }); T('0', x0 + 4, 872, 8, { a: 0.8 });
      T('RADIUS', x0 + 46, 872, 8, { a: 0.75 });
      // scribbles
      const lines = ['T IS MAX AT GEO', 'A(R) = A0*EXP(RHO/SIGMA*PHI)', 'SIGMA 60 GPA  RHO 1300 KG/M3', 'TAPER  A(GEO)/A0 = 1.9', 'V = 200 KM/H -> 7.4 DAYS', 'M(CW) > M(RIBBON)+M(CAR)', 'OK? OK.'];
      lines.forEach((s2, i) => { T(s2, 1392, 752 + i * 17, fit(s2, 150, 9), { a: i === 6 ? 0.95 : 0.85, c: i === 6 ? RED : undefined }); });
      P.curve([[1392, 870], [1440, 866], [1490, 872], [1530, 866]], { w: 0.5, a: 0.4, rough: 0.6 });
    })();

    /* ====================================================== SWATCHES + FURNITURE (ref. B corners) */
    // tonal swatch ladder
    { const x0 = 462, y0 = 924, gaps = [0, 7, 5, 3.8, 2.8, 2.0];
      P.erase([[x0 - 6, y0 - 22], [x0 + 6 * 24 + 4, y0 - 22], [x0 + 6 * 24 + 4, y0 + 30], [x0 - 6, y0 + 30]]);
      gaps.forEach((g, i) => { const x = x0 + i * 24, q = [[x, y0], [x + 20, y0], [x + 20, y0 + 20], [x, y0 + 20]]; P.rect(x, y0, 20, 20, { w: 0.9, a: 0.85, passes: 1, over: 0.5, rough: 0.2 }); if (g) P.hatch(q, { ang: -50, gap: g, a: 0.7, w: 0.5, piece: 8, inset: 1, cross: i > 3 ? 70 : undefined }); T(String(i), x + 10, y0 + 30, 8, { align: 'center', a: 0.7 }); });
      T('TONE', x0, y0 - 6, 8.5, { a: 0.75 }); }
    // skew hatched quads in the margins (as in B)
    { const q = [[452, 776], [522, 764], [534, 836], [462, 848]]; P.hatch(q, { ang: -52, gap: 2.6, a: 0.5, w: 0.5, piece: 12, inset: 0, fade: (x, y) => clamp((x - 452) / 80 + 0.3, 0, 1) }); P.pl(q, { closed: true, w: 0.5, a: 0.35, passes: 1 }); }
    // top-left scale bar + target (as in B)
    { P.rect(74, 58, 160, 8, { w: 0.9, a: 0.8, passes: 1, over: 0, rough: 0.2 }); P.hatch([[76, 59], [154, 59], [154, 65], [76, 65]], { ang: 50, gap: 1.6, a: 0.7, w: 0.5, piece: 6, inset: 0 }); for (let i = 0; i <= 4; i++) { P.line(74 + i * 40, 66, 74 + i * 40, 71, { w: 0.6, passes: 1, over: 0 }); T(String(i * 10), 74 + i * 40, 80, 7.5, { align: 'center', a: 0.7 }); } T('x 1,000 KM', 240, 66, 8, { a: 0.75 });
      P.circle(340, 64, 9, { w: 0.9, a: 0.85, passes: 1 }); P.circle(340, 64, 3, { w: 0.7, passes: 1 }); P.line(324, 64, 356, 64, { w: 0.5, a: 0.6, passes: 1, over: 0 }); }
    // compass star, top right (as in B)
    { const cx = 1518, cy = 66; for (let a = 0; a < 4; a++) { const an = a * PI / 4 + 0.2, l = a % 2 ? 9 : 14; P.line(cx - Math.cos(an) * l, cy - Math.sin(an) * l, cx + Math.cos(an) * l, cy + Math.sin(an) * l, { w: 0.9, passes: 1, over: 0, rough: 0.15 }); } T('N', cx, cy - 18, 8, { align: 'center', a: 0.7 }); }
    // tiny title block
    { const bx = 1290, by = 884, bw = 256, bh = 72;
      P.erase([[bx - 4, by - 4], [bx + bw + 4, by - 4], [bx + bw + 4, by + bh + 4], [bx - 4, by + bh + 4]]);
      P.rect(bx, by, bw, bh, { w: 1.4, a: 0.9, passes: 1, rough: 0.25 }); P.rect(bx + 3, by + 3, bw - 6, bh - 6, { w: 0.6, a: 0.6, passes: 1, rough: 0.25, over: 0 });
      P.line(bx + 168, by, bx + 168, by + bh, { w: 0.8, passes: 1, over: 0 }); P.line(bx, by + 40, bx + 168, by + 40, { w: 0.8, passes: 1, over: 0 }); P.line(bx + 168, by + 40, bx + bw, by + 40, { w: 0.8, passes: 1, over: 0 });
      T('SPACE ELEVATOR', bx + 10, by + 28, 17, { a: 0.95 }); T('GEO RIBBON - 7 DAY ASCENT', bx + 10, by + 55, 9.5, { a: 0.85 }); T('LOG RADIAL SCALE  NOT TO SCALE', bx + 10, by + 66, 7.5, { a: 0.7 });
      T('SHEET', bx + 176, by + 16, 8, { a: 0.7 }); T(`${n} / ${t}`, bx + 176, by + 34, 15, { a: 0.9 }); T('GRAPHITE + RED', bx + 176, by + 54, 8, { a: 0.75 }); T('MINT 10 MM', bx + 176, by + 66, 8, { a: 0.7 });
      const c = [1264, 920]; for (const r of [4, 9, 15]) P.circle(c[0], c[1], r, { w: 0.9, c: RED, a: 0.9, passes: 1, rough: 0.3 }); P.dot(c[0], c[1], 1.4, { c: INK });
    }
    // small handwritten remarks
    tag('RIBBON 3 M WIDE, 0.1 MM THIN', 560, 118, 9, { a: 0.8 });
    tag('DOG NEEDS A PASSPORT?', 1088, 688, 8.5, { a: 0.8 });
    tag('EARTH TURNS 1 REV / 23 H 56 M', 396, 300, 8.5, { a: 0.8 });
  }
});
