/* SHEET 7 — THE LIBRARY TREE (original). Cyanotype: white engraved line-work on brush-edged Prussian blue. */
(window.SCENES = window.SCENES || []).push({
  name: 'Library Tree', seed: 71, ink: '#eaf5ff', theme: 'cyan',
  build(P, n, t) {
    const S = Sketch, TAU = S.TAU, lerp = S.lerp, lp = S.lerpP;
    const BLUE = '#0f3268', W = '#eaf5ff', MID = '#a9d0f5', DIM = '#6fa3dd', LIGHT = '#3f79c2';
    const GY = 826;                                   // ground line
    const R = (a, b) => P.r(a, b);
    const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const glow = (x, y, r, a = 0.5, steps = 6) => { for (let i = steps; i >= 1; i--) { const rr = r * i / steps; const pts = []; for (let k = 0; k < 20; k++) pts.push([x + Math.cos(k * TAU / 20) * rr, y + Math.sin(k * TAU / 20) * rr]); P.wash(pts, '#dff0ff', a / steps * 1.4, { edge: 0, jit: 0, steps: 1 }); } };
    const blob = (cx, cy, rx, ry, k = 12, j = 0.15) => { const pts = []; for (let i = 0; i < k; i++) { const a = i * TAU / k; const r = 1 + R(-j, j); pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); } return P.sample(pts, true, 6); };

    /* ================= 1. the brushed field of Prussian blue ================= */
    { const edge = [];
      for (let x = 30; x <= 1570; x += 14) edge.push([x, 30 + R(-5, 5)]);
      for (let y = 30; y <= 970; y += 14) edge.push([1570 + R(-5, 5), y]);
      for (let x = 1570; x >= 30; x -= 14) edge.push([x, 970 + R(-5, 5)]);
      for (let y = 970; y >= 30; y -= 14) edge.push([30 + R(-5, 5), y]);
      P.wash(edge, BLUE, 1, { edge: 0, jit: 2, steps: 1 });
      // uneven exposure: lighter breath in the middle, darker toward the brushed edges
      for (let i = 0; i < 9; i++) P.wash(blob(800, 420, 760 - i * 70, 470 - i * 42, 18, 0.05), '#2a62ad', 0.055, { edge: 0, jit: 4, steps: 1 });
      for (let i = 0; i < 30; i++) P.wash(blob(R(60, 1540), R(60, 940), R(60, 220), R(30, 90), 10, 0.3), i % 2 ? '#1c4a8f' : '#0b2857', 0.09, { edge: 0, jit: 3, steps: 1 });
      // bristle streaks where the brush ran off the sheet
      for (let i = 0; i < 90; i++) { const side = i % 4, o = R(-3, 9); let a, b; if (side === 0) { a = [R(40, 1560), 30 + o]; b = [a[0] + R(-4, 4), 30 + o + R(6, 26)]; } else if (side === 1) { a = [1570 - o, R(40, 960)]; b = [1570 - o - R(6, 26), a[1] + R(-4, 4)]; } else if (side === 2) { a = [R(40, 1560), 970 - o]; b = [a[0] + R(-4, 4), 970 - o - R(6, 26)]; } else { a = [30 + o, R(40, 960)]; b = [30 + o + R(6, 26), a[1] + R(-4, 4)]; } P.line(a[0], a[1], b[0], b[1], { w: 0.7, a: 0.35, c: '#2a62ad', passes: 1, over: 0, rough: 0.5 }); }
      // pencilled registration line just inside the brush edge
      P.rect(48, 48, 1504, 904, { w: 0.6, a: 0.28, c: MID, rough: 0.5, passes: 1 });
    }

    /* ================= 2. night sky ================= */
    { const stars = [];
      for (let i = 0; i < 260; i++) { const x = R(58, 1542), y = R(58, 560); if (Math.hypot(x - 800, y - 260) < 300 && y > 100 && R(0, 1) > 0.15) continue; stars.push([x, y, R(0.5, 1.5)]); }
      P.dots(stars, W, 0.8);
      for (let i = 0; i < 26; i++) { const x = R(70, 1530), y = R(62, 480); if (Math.hypot(x - 800, y - 260) < 320 && y > 100) continue; const s = R(3, 7); P.line(x - s, y, x + s, y, { w: 0.6, a: 0.85, c: W, passes: 1, over: 0, rough: 0.1 }); P.line(x, y - s, x, y + s, { w: 0.6, a: 0.85, c: W, passes: 1, over: 0, rough: 0.1 }); P.line(x - s * 0.4, y - s * 0.4, x + s * 0.4, y + s * 0.4, { w: 0.4, a: 0.6, c: W, passes: 1, over: 0 }); P.line(x + s * 0.4, y - s * 0.4, x - s * 0.4, y + s * 0.4, { w: 0.4, a: 0.6, c: W, passes: 1, over: 0 }); }
      // constellations shaped like an open book, a quill and a key
      const con = (pts, closed) => { pts.forEach(([x, y], i) => { P.circle(x, y, 2.4, { w: 0.7, c: W, passes: 1, rough: 0.1 }); if (i) P.line(pts[i - 1][0], pts[i - 1][1], x, y, { w: 0.4, a: 0.5, c: MID, passes: 1, over: -3, rough: 0.2 }); }); if (closed) P.line(pts[pts.length - 1][0], pts[pts.length - 1][1], pts[0][0], pts[0][1], { w: 0.4, a: 0.5, c: MID, passes: 1, over: -3 }); };
      con([[150, 258], [186, 246], [214, 262], [246, 244], [280, 256], [252, 290], [214, 302], [176, 292]], true); P.text('LIBER', 168, 326, { size: 11, c: MID, a: 0.75 });
      con([[1360, 92], [1396, 118], [1420, 150], [1456, 176], [1490, 190]]); P.text('CALAMUS', 1400, 214, { size: 11, c: MID, a: 0.75 });
      con([[1330, 300], [1362, 310], [1390, 330], [1418, 322], [1446, 344], [1470, 340]]);
      // moon with its phases
      const mx = 150, my = 128, mr = 46;
      glow(mx, my, mr * 1.9, 0.3, 8);
      P.wash(P.sample(Array.from({ length: 24 }, (_, i) => [mx + Math.cos(i * TAU / 24) * mr, my + Math.sin(i * TAU / 24) * mr]), true, 4), '#dcecff', 0.9, { edge: 0, jit: 0.4, steps: 3 });
      P.circle(mx, my, mr, { w: 1.4, c: W, a: 0.95 });
      [[-14, -12, 9], [12, 6, 7], [-8, 18, 6], [18, -16, 5], [-24, 6, 5], [2, -26, 4]].forEach(([dx, dy, r]) => { P.circle(mx + dx, my + dy, r, { w: 0.9, c: BLUE, a: 0.75, passes: 1 }); P.hatch(Array.from({ length: 12 }, (_, i) => [mx + dx + Math.cos(i * TAU / 12) * r, my + dy + Math.sin(i * TAU / 12) * r]), { ang: -40, gap: 1.6, a: 0.55, c: BLUE, w: 0.5 }); });
      P.hatch(Array.from({ length: 30 }, (_, i) => [mx + Math.cos(i * TAU / 30) * mr, my + Math.sin(i * TAU / 30) * mr]), { ang: 50, gap: 2, a: 0.5, c: BLUE, w: 0.55, fade: x => Math.max(0, (mx + 14 - x) / 50), piece: 8 });
      for (let i = 0; i < 6; i++) { const cx = 66 + i * 34, cy = 208, r = 11; P.circle(cx, cy, r, { w: 0.8, c: W, passes: 1 }); const ph = i / 5; const lit = []; for (let a = -Math.PI / 2; a <= Math.PI / 2; a += 0.2) lit.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); for (let a = Math.PI / 2; a >= -Math.PI / 2; a -= 0.2) lit.push([cx + Math.cos(a) * r * (1 - 2 * ph), cy + Math.sin(a) * r]); P.wash(lit, '#dcecff', 0.85, { edge: 0, jit: 0.2, steps: 2 }); }
      // owls, bats with tiny scrolls, fireflies
      const bat = (x, y, s, a) => { P.curve([[x - 16 * s, y - 2 * s], [x - 9 * s, y - 8 * s], [x - 3 * s, y - 2 * s], [x, y + 1 * s], [x + 3 * s, y - 2 * s], [x + 9 * s, y - 8 * s], [x + 16 * s, y - 2 * s]], { w: 1.1 * s + 0.3, c: W, a, rough: 0.2 }); P.curve([[x - 16 * s, y - 2 * s], [x - 9 * s, y + 3 * s], [x - 3 * s, y + 1 * s]], { w: 0.6, c: W, a: a * 0.7, rough: 0.2, passes: 1 }); P.curve([[x + 16 * s, y - 2 * s], [x + 9 * s, y + 3 * s], [x + 3 * s, y + 1 * s]], { w: 0.6, c: W, a: a * 0.7, rough: 0.2, passes: 1 }); P.wash([[x - 3 * s, y - 2 * s], [x + 3 * s, y - 2 * s], [x, y + 5 * s]], W, 0.8, { edge: 0, steps: 2, jit: 0.1 }); };
      [[330, 118, 1.2], [372, 92, 0.9], [420, 132, 0.7], [1240, 118, 1.1], [1284, 98, 0.8], [1180, 84, 0.7], [640, 70, 0.7], [980, 64, 0.8]].forEach(([x, y, s]) => bat(x, y, s, 0.85));
      P.line(372 - 4, 92 + 8, 372 - 4, 92 + 20, { w: 0.6, c: MID, a: 0.8, passes: 1, over: 0 }); P.rect(372 - 7, 92 + 20, 6, 10, { w: 0.7, c: W, a: 0.9, passes: 1 });
      for (let i = 0; i < 46; i++) { const x = R(70, 1530), y = R(300, 800); if (P.R() > 0.55) continue; glow(x, y, R(4, 8), 0.5, 3); P.dot(x, y, 1.2, { c: '#fff', a: 1 }); }
    }

    /* ================= 3. ground, soil strata, grass ================= */
    { P.wash([[30, GY], [1570, GY], [1570, 970], [30, 970]], '#0a2557', 0.55, { edge: 0, jit: 2, steps: 1 });
      const g = []; for (let x = 30; x <= 1570; x += 20) g.push([x, GY + Math.sin(x * 0.011) * 5 + Math.sin(x * 0.037) * 2.5 + (Math.abs(x - 800) < 160 ? -6 * Math.cos((x - 800) / 160 * 1.57) : 0)]);
      P.curve(g, { w: 2, c: W, a: 0.95, rough: 0.8, passes: 2 });
      P.curve(g.map(([x, y]) => [x, y + 6]), { w: 0.7, c: MID, a: 0.55, rough: 1, passes: 1 });
      for (let k = 0; k < 6; k++) { const yy = GY + 26 + k * 20; const pts = []; for (let x = 40; x <= 1560; x += 40) pts.push([x, yy + Math.sin(x * 0.02 + k) * 5 + R(-1.5, 1.5)]); P.curve(pts, { w: 0.5, c: DIM, a: 0.28, rough: 1.2, passes: 1 }); }
      P.stipple([[34, GY + 8], [1566, GY + 8], [1566, 966], [34, 966]], 1700, { a: 0.4, r: 1.0, c: MID, fade: (x, y) => 0.35 + (y - GY) / 300 });
      // grass tufts along the horizon
      for (let x = 44; x < 1560; x += 5 + R(0, 6)) { if (Math.abs(x - 800) < 120) continue; const gy = g[Math.round((x - 30) / 20)] ? g[Math.min(g.length - 1, Math.round((x - 30) / 20))][1] : GY, h = R(6, 20); const c = R(-0.5, 0.5); P.curve([[x, gy + 1], [x + c * 4, gy - h * 0.6], [x + c * 10, gy - h]], { w: 0.7, c: W, a: R(0.5, 0.9), rough: 0.3, passes: 1 }); }
      // pebbles and toadstools
      for (let i = 0; i < 26; i++) { const x = R(60, 1540); if (Math.abs(x - 800) < 140) continue; const gy = GY + Math.sin(x * 0.011) * 5 + 10 + R(0, 12), r = R(2, 6); P.ellipse(x, gy, r * 1.4, r, { w: 0.8, c: W, a: 0.7, passes: 1 }); P.hatch(P.sample([[x - r * 1.4, gy], [x, gy - r], [x + r * 1.4, gy], [x, gy + r]], true, 2), { ang: -40, gap: 1.6, a: 0.5, w: 0.4, c: W }); }
      [[250, GY - 2], [520, GY - 1], [1080, GY - 2], [1330, GY - 1]].forEach(([x, y], i) => { const s = 1 + (i % 2) * 0.5; P.line(x, y, x, y - 12 * s, { w: 1.4, c: W, passes: 1, over: 0 }); P.arc(x, y - 12 * s, 10 * s, 6 * s, Math.PI, TAU, { w: 1.2, c: W, a: 0.95 }); P.line(x - 10 * s, y - 12 * s, x + 10 * s, y - 12 * s, { w: 0.8, c: W, passes: 1, over: 0 }); [-5, 0, 5].forEach(d => P.dot(x + d * s, y - 16 * s, 1.1, { c: W })); P.wash(P.sample([[x - 10 * s, y - 12 * s], [x, y - 18 * s], [x + 10 * s, y - 12 * s]], true, 3), '#dcecff', 0.35, { edge: 0, steps: 2, jit: 0.3 }); });
    }

    /* ================= 4. the tree: roots, trunk, five limbs, recursive twigs, leaves & book-fruit ================= */
    const LIMBS = [
      { p: [[772, 490], [700, 452], [620, 392], [540, 358], [452, 322], [372, 300], [292, 262], [226, 246], [176, 214]], h: [28, 4] },
      { p: [[786, 478], [750, 420], [716, 340], [690, 270], [652, 214], [622, 176], [590, 150]], h: [24, 4] },
      { p: [[800, 470], [806, 400], [792, 330], [806, 260], [796, 200], [806, 150]], h: [26, 5] },
      { p: [[814, 478], [850, 420], [890, 350], [944, 290], [986, 240], [1036, 198], [1082, 160]], h: [24, 4] },
      { p: [[830, 492], [900, 452], [980, 416], [1060, 372], [1150, 344], [1236, 300], [1320, 278], [1404, 250]], h: [28, 4] },
    ];
    const tips = [], fruits = [];
    const ROOTS = [[[724, 826], [690, 850], [610, 880], [520, 918], [440, 948]], [[744, 830], [720, 880], [690, 930], [660, 962]], [[780, 832], [770, 890], [762, 940]], [[820, 832], [832, 890], [850, 940]], [[856, 830], [890, 860], [980, 890], [1080, 920], [1170, 950]], [[878, 826], [930, 850], [1010, 868], [1120, 880], [1230, 905]]];
    ROOTS.forEach((r, i) => P.strands(r, t => lerp(26 - (i % 3) * 3, 2.5, t), 0, Math.round(11 - (i % 3) * 2), { shadow: 1, w: 1.15, runMin: 5, runMax: 20 }));
    // feeder roots hairs
    ROOTS.forEach(r => { const S2 = P.sample(r, false, 14); for (let i = 3; i < S2.length; i++) { for (let k = 0; k < 2; k++) { const a = R(0.4, 2.7) + (k ? Math.PI : 0), l = R(8, 26); P.curve([S2[i], [S2[i][0] + Math.cos(a) * l * 0.5 + R(-3, 3), S2[i][1] + Math.abs(Math.sin(a)) * l * 0.5], [S2[i][0] + Math.cos(a) * l, S2[i][1] + Math.abs(Math.sin(a)) * l]], { w: 0.5, c: W, a: 0.6, rough: 0.5, passes: 1 }); } } });
    // trunk
    const TRUNK = [[800, 834], [800, 740], [800, 620], [800, 520], [800, 468]];
    P.strands(TRUNK, t => 52 + 60 * Math.pow(1 - t, 2.6), 0, 34, { shadow: 1, w: 1.5, runMin: 8, runMax: 44, gap: 8 });
    // bark plates: short cross-grain arcs, knots with growth rings, moss stipple on the shady side
    for (let i = 0; i < 170; i++) { const y = R(490, 815), hw = 52 + 60 * Math.pow(1 - (834 - y) / 366, 2.6), x = 800 + R(-0.92, 0.92) * hw, l = R(5, 15); P.curve([[x - l / 2, y + R(-1, 1)], [x, y + R(1, 3)], [x + l / 2, y + R(-1, 1)]], { w: 0.5, c: W, a: R(0.35, 0.7), rough: 0.4, passes: 1 }); }
    [[770, 700, 13, 19], [838, 610, 11, 15], [764, 560, 8, 11], [846, 760, 12, 17]].forEach(([x, y, rx, ry]) => { for (let k = 0; k < 5; k++) P.ellipse(x, y, rx - k * 2.3, ry - k * 3.2, { w: 0.8 - k * 0.08, c: W, a: 0.85 - k * 0.12, passes: 1, rough: 0.35 }); P.hatch(P.sample([[x - rx, y], [x, y - ry], [x + rx, y], [x, y + ry]], true, 3), { ang: 80, gap: 1.6, a: 0.5, w: 0.4, c: W }); });
    P.stipple([[712, 620], [760, 470], [770, 820], [704, 820]], 220, { a: 0.55, r: 1.1, c: '#cfe8ff' });
    // ivy climbing the trunk, leaf by leaf
    { const ivy = [[706, 818], [724, 772], [716, 720], [736, 668], [730, 610], [748, 560], [756, 520]];
      P.curve(ivy, { w: 1.1, c: W, a: 0.9, rough: 0.6 });
      const iv = P.sample(ivy, false, 12); iv.forEach((q, i) => { for (const sg of [-1, 1]) if (P.R() > 0.15) P.leaf(q[0], q[1], (sg > 0 ? -0.3 : Math.PI + 0.3) + R(-0.6, 0.6), R(11, 16), R(4, 6), { w: 0.7, a: 0.85, veins: 2 }); }); }
    // limbs and their twigs
    const tangentAt = (pts, tt) => { const S2 = P.sample(pts, false, 6), i = Math.max(1, Math.min(S2.length - 2, Math.round(tt * (S2.length - 1)))); return { p: S2[i], a: Math.atan2(S2[i + 1][1] - S2[i - 1][1], S2[i + 1][0] - S2[i - 1][0]) }; };
    const twig = (x, y, a, len, hw, d, al) => {
      const inCrown = (px, py) => Math.pow((px - 800) / 650, 2) + Math.pow((py - 275) / 205, 2) < 1;
      if (!inCrown(x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5)) len *= 0.35;
      if (len < 10) return;
      const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len, bend = R(-0.2, 0.2) * len, mx = (x + ex) / 2 - Math.sin(a) * bend, my = (y + ey) / 2 + Math.cos(a) * bend;
      if (hw > 2.6) P.strands([[x, y], [mx, my], [ex, ey]], hw, hw * 0.68, Math.max(1, Math.round(hw * 0.7)), { w: 1.05, a: al, runMin: 4, runMax: 14 });
      else P.curve([[x, y], [mx, my], [ex, ey]], { w: Math.max(0.55, hw * 0.55), c: W, a: al, rough: 0.3, passes: 1 });
      if (d <= 0 || len < 20) { tips.push([ex, ey, a, al]); return; }
      const kids = d > 2 && P.R() > 0.7 ? 3 : 2;
      for (let k = 0; k < kids; k++) { const off = kids === 3 ? (k - 1) * 0.6 : (k ? 1 : -1) * R(0.35, 0.75); twig(ex, ey, a + off + R(-0.12, 0.12), len * R(0.62, 0.78), hw * 0.66, d - 1, al * 0.97); }
    };
    LIMBS.forEach((L, li) => {
      // soft mass of foliage behind the limb, drawn first so the line-work sits on top
      for (let j = 0; j < 7; j++) { const q = tangentAt(L.p, 0.35 + j * 0.1); P.wash(blob(q.p[0] + R(-40, 40), q.p[1] + R(-60, 20), R(70, 120), R(50, 80), 12, 0.22), LIGHT, 0.16, { edge: 0, jit: 3, steps: 1 }); }
    });
    LIMBS.forEach((L, li) => {
      P.strands(L.p, t => lerp(L.h[0], L.h[1], Math.pow(t, 0.62)), 0, Math.round(L.h[0] * 0.85), { shadow: 1, w: 1.35, runMin: 8, runMax: 36, gap: 8 });
      const nT = 8;
      for (let j = 0; j < nT; j++) {
        const tt = 0.2 + j * 0.075 + R(0, 0.03), q = tangentAt(L.p, Math.min(0.97, tt)), hwHere = lerp(L.h[0], L.h[1], Math.pow(tt, 0.62));
        for (const sg of [-1, 1]) { if (P.R() > 0.72) continue; twig(q.p[0], q.p[1], q.a + sg * R(0.55, 1.0), R(56, 100) * (1 - tt * 0.3), Math.max(3, hwHere * 0.5), 3, 0.92); }
      }
      twig(L.p[L.p.length - 1][0], L.p[L.p.length - 1][1], Math.atan2(L.p[L.p.length - 1][1] - L.p[L.p.length - 2][1], L.p[L.p.length - 1][0] - L.p[L.p.length - 2][0]), 60, L.h[1] * 1.1, 3, 0.95);
      // knots and burrs
      for (let k = 0; k < 4; k++) { const q = tangentAt(L.p, R(0.15, 0.7)); for (let r = 0; r < 4; r++) P.ellipse(q.p[0] + R(-3, 3), q.p[1] + R(-3, 3), 7 - r * 1.5, 5 - r, { w: 0.7, c: W, a: 0.7, passes: 1, rot: q.a }); }
    });
    // leaves and hanging book-fruit on the tips
    tips.forEach(([x, y, a, al], i) => {
      if (P.R() > 0.62) return;
      const cnt = 2 + (P.R() > 0.6 ? 1 : 0);
      for (let k = 0; k < cnt; k++) { const ang = a + (k - (cnt - 1) / 2) * R(0.7, 1.1) + R(-0.2, 0.2), len = R(14, 26); P.leaf(x, y, ang, len, len * R(0.3, 0.4), { w: 0.75, a: al * R(0.6, 0.95), simple: P.R() > 0.38, veins: 3 }); }
      if (P.R() > 0.93) fruits.push([x, y]);
    });
    fruits.forEach(([x, y]) => { const l = R(10, 20); P.curve([[x, y], [x + R(-2, 2), y + l * 0.5], [x + R(-3, 3), y + l]], { w: 0.6, c: W, a: 0.85, rough: 0.2, passes: 1 }); const bx = x + R(-3, 3), by = y + l, ba = R(-0.25, 0.25), cs = Math.cos(ba), sn = Math.sin(ba), pt = (u, v) => [bx + u * cs - v * sn, by + u * sn + v * cs]; P.poly([pt(-5, 0), pt(5, 0), pt(5, 14), pt(-5, 14)], { w: 0.8, c: W, a: 0.95, rough: 0.15, over: 0, passes: 1 }); P.line(...pt(-3, 1), ...pt(-3, 13), { w: 0.6, c: W, passes: 1, over: 0, a: 0.8 }); for (let q = 3; q < 13; q += 3) P.line(...pt(-1, q), ...pt(4, q), { w: 0.3, c: W, a: 0.5, passes: 1, over: 0 }); P.wash([pt(-5, 0), pt(5, 0), pt(5, 14), pt(-5, 14)], '#cfe6ff', 0.4, { edge: 0, steps: 2, jit: 0.2 }); });


    /* ================= 5. helpers for lit interiors (drawn in navy on pale blue: the rooms glow like exposed paper) ================= */
    const NAVY = '#0d2c5c', PALE = '#c4defa', PALE2 = '#9cc6f0';
    const disc = (x, y, r, c, a = 0.9) => P.wash(Array.from({ length: 12 }, (_, i) => [x + Math.cos(i * TAU / 12) * r, y + Math.sin(i * TAU / 12) * r]), c, a, { edge: 0, jit: 0.15, steps: 1 });
    const fillPoly = (pts, c, a = 0.9) => P.wash(pts, c, a, { edge: 0, jit: 0.15, steps: 1 });
    const book = (x, y, w, h, c, tilt = 0) => { const dx = Math.sin(tilt) * h; P.path([[x, y], [x + dx, y - h], [x + dx + w, y - h], [x + w, y]], { rough: 0.15, w: 0.65, c, a: 0.9, passes: 1 }); if (P.R() > 0.7) P.line(x + dx * 0.7, y - h * 0.7, x + dx * 0.7 + w, y - h * 0.7, { w: 0.35, c, a: 0.7, passes: 1, over: 0 }); if (P.R() > 0.86) fillPoly([[x, y], [x + dx, y - h], [x + dx + w, y - h], [x + w, y]], c, 0.55); };
    const bookRow = (x0, x1, y, hMin, hMax, c) => { let x = x0; while (x < x1 - 3) { const w = R(2.2, 4.6), h = R(hMin, hMax), tilt = P.R() > 0.93 ? R(-0.3, 0.3) : 0; book(x, y, Math.min(w, x1 - x), h, c, tilt); x += w + 0.5 + (P.R() > 0.92 ? R(3, 8) : 0); } };
    const shelfUnit = (x0, y0, x1, y1, rows, c) => { P.rect(x0, y0, x1 - x0, y1 - y0, { w: 1, c, a: 0.95, rough: 0.2, over: 0.5, passes: 1 }); const rh = (y1 - y0) / rows; for (let r = 0; r < rows; r++) { const yy = y0 + (r + 1) * rh; P.line(x0, yy, x1, yy, { w: 0.9, c, a: 0.95, rough: 0.15, passes: 1, over: 0 }); bookRow(x0 + 1.5, x1 - 1.5, yy - 0.5, rh * 0.5, rh * 0.86, c); } };
    const person = (x, y, s, pose, c = NAVY) => {
      const hd = (hx, hy, r) => { P.circle(hx, hy, r, { w: 0.9, c, a: 0.95, passes: 1 }); disc(hx, hy, r, c, 0.92); };
      if (pose === 'sit') { fillPoly([[x - 2 * s, y - 9 * s], [x + 2 * s, y - 9 * s], [x + 2.4 * s, y - 17 * s], [x - 1.4 * s, y - 17 * s]], c); P.line(x, y - 9 * s, x + 8 * s, y - 9 * s, { w: 1.6 * s, c, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(x + 8 * s, y - 9 * s, x + 8 * s, y - 1 * s, { w: 1.4 * s, c, a: 0.95, passes: 1, over: 0, rough: 0.1 }); hd(x + 0.5 * s, y - 20 * s, 2.7 * s); P.line(x + 1 * s, y - 14 * s, x + 6 * s, y - 12 * s, { w: 1.1 * s, c, a: 0.95, passes: 1, over: 0, rough: 0.1 }); fillPoly([[x + 5 * s, y - 15 * s], [x + 10 * s, y - 13 * s], [x + 9 * s, y - 9.5 * s], [x + 4 * s, y - 11 * s]], c, 0.8); }
      else if (pose === 'climb') { fillPoly([[x - 1.6 * s, y - 8 * s], [x + 1.6 * s, y - 8 * s], [x + 2 * s, y - 17 * s], [x - 1.6 * s, y - 17 * s]], c); hd(x, y - 20 * s, 2.6 * s); P.line(x - 1 * s, y - 8 * s, x - 3 * s, y, { w: 1.3 * s, c, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(x + 1 * s, y - 8 * s, x + 3 * s, y - 3 * s, { w: 1.3 * s, c, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(x, y - 16 * s, x + 4 * s, y - 24 * s, { w: 1.1 * s, c, a: 0.95, passes: 1, over: 0, rough: 0.1 }); }
      else { fillPoly([[x - 2 * s, y - 9 * s], [x + 2 * s, y - 9 * s], [x + 2.3 * s, y - 18 * s], [x - 2.3 * s, y - 18 * s]], c); hd(x, y - 21 * s, 2.7 * s); P.line(x - 1 * s, y - 9 * s, x - 1.6 * s, y, { w: 1.4 * s, c, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(x + 1 * s, y - 9 * s, x + 1.6 * s, y, { w: 1.4 * s, c, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(x + 2 * s, y - 16 * s, x + 6 * s, y - 13 * s, { w: 1.1 * s, c, a: 0.95, passes: 1, over: 0, rough: 0.1 }); if (pose === 'read') fillPoly([[x + 5 * s, y - 16 * s], [x + 9 * s, y - 14 * s], [x + 8 * s, y - 10 * s], [x + 4 * s, y - 12 * s]], c, 0.8); }
    };
    const lantern = (x, y, s, chain = 0, halo = true) => { if (chain) P.line(x, y - chain, x, y - 3 * s, { w: 0.6, c: W, a: 0.85, passes: 1, over: 0, rough: 0.15 }); if (halo) glow(x, y + 3 * s, 15 * s, 0.55, 5); P.line(x - 2 * s, y - 3 * s, x + 2 * s, y - 3 * s, { w: 1, c: W, passes: 1, over: 0, rough: 0.1 }); P.poly([[x - 3.4 * s, y - 2 * s], [x + 3.4 * s, y - 2 * s], [x + 3 * s, y + 6 * s], [x - 3 * s, y + 6 * s]], { w: 0.9, c: W, a: 0.95, rough: 0.1, over: 0, passes: 1 }); fillPoly([[x - 3 * s, y - 1.5 * s], [x + 3 * s, y - 1.5 * s], [x + 2.7 * s, y + 5.6 * s], [x - 2.7 * s, y + 5.6 * s]], '#fffbe2', 0.95); P.line(x - 3.6 * s, y + 6 * s, x + 3.6 * s, y + 6 * s, { w: 1, c: W, passes: 1, over: 0, rough: 0.1 }); P.line(x, y - 1.5 * s, x, y + 5.6 * s, { w: 0.4, c: '#7aa9de', a: 0.8, passes: 1, over: 0 }); };
    const smoke = (x, y, len, r0 = 4, r1 = 9) => { P.cloudTube([[x, y], [x + 8, y - len * 0.33], [x - 6, y - len * 0.66], [x + 7, y - len]], r0, r1, { c: W, a: 0.85, w: 0.7, shade: false, rib: 1 }); };
    const bridge = (a, b, sag, planks = 0) => { const N = 20, up = [], dn = []; for (let i = 0; i <= N; i++) { const t = i / N, x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t) + sag * 4 * t * (1 - t); up.push([x, y - 7]); dn.push([x, y]); } P.curve(dn, { w: 1.1, c: W, a: 0.95, rough: 0.3, passes: 1 }); P.curve(up, { w: 0.8, c: W, a: 0.85, rough: 0.3, passes: 1 }); for (let i = 0; i <= N; i += 1) { P.line(up[i][0], up[i][1], dn[i][0], dn[i][1], { w: 0.5, c: W, a: 0.7, passes: 1, over: 0, rough: 0.1 }); if (i < N) P.line(dn[i][0], dn[i][1], dn[i + 1][0], dn[i + 1][1] + 1.5, { w: 1.5, c: W, a: 0.5, passes: 1, over: 0, rough: 0.1 }); } if (planks) for (let i = 1; i < N; i += 2) lantern(dn[i][0], dn[i][1] + 2, 0.7, 0, false); };
    const shingles = (cx, cy, rx, ry, a0, a1, rows, c = W) => { for (let r = 0; r < rows; r++) { const f = 1 - r / rows * 0.55, n = Math.floor((a1 - a0) * rx * f / 7); for (let i = 0; i < n; i++) { const a = a0 + (i + 0.5 + (r % 2) * 0.5) / n * (a1 - a0), x = cx + Math.cos(a) * rx * f, y = cy + Math.sin(a) * ry * f; P.arc(x, y, 4.2, 4.2, a + 0.15, a + Math.PI - 0.15, { w: 0.6, c, a: 0.85, passes: 1, rough: 0.15 }); } } };

    /* ---- the eight reading pods: outer shell in white line-work, window onto a lit, navy-drawn interior ---- */
    const INTERIOR = {};
    INTERIOR.POETRY = (x0, y0, x1, y1) => {
      const w = x1 - x0, h = y1 - y0, fl = y1 - 4;
      shelfUnit(x0 + 2, y0 + 3, x0 + w * 0.38, fl, 6, NAVY);
      shelfUnit(x1 - w * 0.22, y0 + 8, x1 - 2, fl - 14, 4, NAVY);
      P.line(x1 - w * 0.22 - 5, y0 + 4, x1 - w * 0.22 + 3, fl, { w: 1, c: NAVY, passes: 1, over: 0, rough: 0.15 }); P.line(x1 - w * 0.22 - 1, y0 + 4, x1 - w * 0.22 + 7, fl, { w: 1, c: NAVY, passes: 1, over: 0, rough: 0.15 });
      for (let i = 0; i < 6; i++) P.line(x1 - w * 0.22 - 4 + i * 1.3, y0 + 10 + i * 9, x1 - w * 0.22 + i * 1.3 + 0.5, y0 + 10 + i * 9, { w: 0.8, c: NAVY, passes: 1, over: 0, rough: 0.1 });
      P.path([[x0 + w * 0.42, fl], [x0 + w * 0.42, fl - 16], [x0 + w * 0.5, fl - 18], [x0 + w * 0.6, fl - 14], [x0 + w * 0.6, fl]], { w: 1, c: NAVY, rough: 0.2, passes: 1 }); fillPoly([[x0 + w * 0.42, fl], [x0 + w * 0.42, fl - 16], [x0 + w * 0.5, fl - 18], [x0 + w * 0.6, fl - 14], [x0 + w * 0.6, fl]], NAVY, 0.25);
      person(x0 + w * 0.5, fl - 3, 1.05, 'sit'); P.rect(x0 + w * 0.63, fl - 10, 6, 10, { w: 0.8, c: NAVY, passes: 1, over: 0 }); P.circle(x0 + w * 0.66, fl - 12, 1.6, { w: 0.6, c: NAVY, passes: 1 }); P.line(x0 + w * 0.66, fl - 12, x0 + w * 0.7, fl - 21, { w: 0.6, c: NAVY, passes: 1, over: 0 });
      for (let i = 0; i < 5; i++) { const px = x0 + w * (0.45 + i * 0.05), py = y0 + 12 + R(-2, 8); P.poly([[px, py], [px + 5, py - 1], [px + 5.5, py + 4], [px + 0.5, py + 5]], { w: 0.5, c: NAVY, a: 0.8, rough: 0.1, over: 0, passes: 1 }); }
      for (let i = 0; i < 4; i++) book(x0 + w * 0.4 + i * 1.5, fl - i * 3.5, 12, 3.2, NAVY);
    };
    INTERIOR.MAPS = (x0, y0, x1, y1) => {
      const w = x1 - x0, h = y1 - y0, fl = y1 - 4;
      // pinned map with a dotted route on the back wall
      fillPoly([[x0 + 4, y0 + 4], [x0 + w * 0.5, y0 + 2], [x0 + w * 0.52, y0 + 22], [x0 + 5, y0 + 24]], NAVY, 0.12); P.poly([[x0 + 4, y0 + 4], [x0 + w * 0.5, y0 + 2], [x0 + w * 0.52, y0 + 22], [x0 + 5, y0 + 24]], { w: 0.8, c: NAVY, rough: 0.2, over: 0, passes: 1 });
      P.curve([[x0 + 8, y0 + 18], [x0 + 16, y0 + 10], [x0 + 26, y0 + 14], [x0 + 34, y0 + 7], [x0 + 42, y0 + 12]], { w: 0.8, c: NAVY, rough: 0.5, passes: 1 }); P.dashed(x0 + 10, y0 + 20, x0 + 44, y0 + 10, [2, 2], { w: 0.6, c: NAVY });
      // rolled maps in a rack
      for (let r = 0; r < 3; r++) for (let c2 = 0; c2 < 5; c2++) { const cx2 = x1 - 34 + c2 * 6.4 + (r % 2) * 3, cy2 = y0 + 8 + r * 7; P.circle(cx2, cy2, 3, { w: 0.6, c: NAVY, passes: 1, rough: 0.1 }); P.circle(cx2, cy2, 1.2, { w: 0.4, c: NAVY, a: 0.7, passes: 1 }); }
      P.rect(x1 - 38, y0 + 2, 36, 26, { w: 0.8, c: NAVY, rough: 0.2, over: 0, passes: 1 });
      // table with unrolled chart, globe on a stand, compass rose
      fillPoly([[x0 + w * 0.12, fl - 22], [x0 + w * 0.62, fl - 24], [x0 + w * 0.68, fl - 16], [x0 + w * 0.06, fl - 14]], '#f4faff', 0.9); P.poly([[x0 + w * 0.12, fl - 22], [x0 + w * 0.62, fl - 24], [x0 + w * 0.68, fl - 16], [x0 + w * 0.06, fl - 14]], { w: 0.9, c: NAVY, rough: 0.2, over: 0, passes: 1 });
      P.curve([[x0 + w * 0.14, fl - 19], [x0 + w * 0.24, fl - 22], [x0 + w * 0.3, fl - 18], [x0 + w * 0.4, fl - 21], [x0 + w * 0.5, fl - 19]], { w: 0.6, c: NAVY, rough: 0.5, passes: 1 }); P.hatch([[x0 + w * 0.15, fl - 18], [x0 + w * 0.3, fl - 19], [x0 + w * 0.28, fl - 15], [x0 + w * 0.12, fl - 15]], { ang: 60, gap: 1.6, a: 0.6, w: 0.35, c: NAVY });
      [[-1, -0.8], [1, 0.8]].forEach(() => {}); for (let k = 0; k < 4; k++) P.line(x0 + w * 0.55 + Math.cos(k * 1.57) * 0, fl - 19, x0 + w * 0.55 + Math.cos(k * 1.57) * 5, fl - 19 + Math.sin(k * 1.57) * 3, { w: 0.5, c: NAVY, passes: 1, over: 0 });
      [[fl - 14, 0.1], [fl - 14, 0.62]].forEach(([yy, f]) => { P.line(x0 + w * f + 2, yy, x0 + w * f + 2, fl, { w: 1.2, c: NAVY, passes: 1, over: 0, rough: 0.1 }); });
      P.circle(x0 + w * 0.8, fl - 22, 8, { w: 1, c: NAVY, a: 0.95 }); P.ellipse(x0 + w * 0.8, fl - 22, 8, 2.6, { w: 0.5, c: NAVY, a: 0.7, passes: 1 }); P.arc(x0 + w * 0.8, fl - 22, 3, 8, -1.5, 1.5, { w: 0.5, c: NAVY, a: 0.7, passes: 1 }); fillPoly(Array.from({ length: 12 }, (_, i) => [x0 + w * 0.8 + Math.cos(i * TAU / 12) * 8, fl - 22 + Math.sin(i * TAU / 12) * 8]), NAVY, 0.16); P.line(x0 + w * 0.8, fl - 14, x0 + w * 0.8, fl - 4, { w: 1.1, c: NAVY, passes: 1, over: 0 }); P.line(x0 + w * 0.8 - 5, fl - 4, x0 + w * 0.8 + 5, fl - 4, { w: 1.1, c: NAVY, passes: 1, over: 0 });
      person(x0 + w * 0.38, fl - 3, 1, 'stand');
    };
    INTERIOR.ASTRO = (x0, y0, x1, y1) => {
      const w = x1 - x0, h = y1 - y0, fl = y1 - 4, cx = (x0 + x1) / 2;
      // dome ribs and the slit
      for (let i = -3; i <= 3; i++) P.curve([[cx + i * w * 0.15, fl - 4], [cx + i * w * 0.14, y0 + h * 0.4], [cx + i * w * 0.06, y0 + 4]], { w: 0.6, c: NAVY, a: 0.7, rough: 0.3, passes: 1 });
      for (let k = 1; k < 4; k++) P.arc(cx, y0 + h * 0.85, w * 0.5, h * 0.5 * (1 - k * 0.1), Math.PI * 1.1, Math.PI * 1.9, { w: 0.4, c: NAVY, a: 0.5, passes: 1 });
      fillPoly([[cx - 5, y0 + 2], [cx + 5, y0 + 2], [cx + 8, y0 + h * 0.5], [cx - 8, y0 + h * 0.5]], '#e8f3ff', 0.95); P.dots(Array.from({ length: 12 }, () => [cx + R(-6, 6), y0 + R(3, h * 0.45), 0.7]), NAVY, 0.9);
      // telescope on its mount
      P.line(cx - w * 0.28, fl - 8, cx + w * 0.14, y0 + h * 0.18, { w: 4.2, c: NAVY, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(cx - w * 0.28, fl - 8, cx + w * 0.14, y0 + h * 0.18, { w: 1.4, c: PALE, a: 0.9, passes: 1, over: 0, rough: 0.1 }); P.circle(cx + w * 0.14, y0 + h * 0.18, 3.4, { w: 0.9, c: NAVY, passes: 1 });
      P.line(cx - w * 0.16, fl - 4, cx - w * 0.16, fl - 24, { w: 1.6, c: NAVY, passes: 1, over: 0 }); P.line(cx - w * 0.22, fl - 4, cx - w * 0.16, fl - 24, { w: 1, c: NAVY, passes: 1, over: 0 }); P.line(cx - w * 0.1, fl - 4, cx - w * 0.16, fl - 24, { w: 1, c: NAVY, passes: 1, over: 0 });
      person(cx - w * 0.36, fl - 3, 1, 'stand');
      // armillary sphere on the right
      const ax = cx + w * 0.3, ay = fl - 20; P.circle(ax, ay, 9, { w: 0.9, c: NAVY }); P.ellipse(ax, ay, 9, 3, { w: 0.6, c: NAVY, a: 0.85, passes: 1 }); P.ellipse(ax, ay, 3, 9, { w: 0.6, c: NAVY, a: 0.85, passes: 1 }); P.ellipse(ax, ay, 9, 5, { w: 0.6, c: NAVY, a: 0.85, passes: 1, rot: 0.7 }); disc(ax, ay, 2.2, NAVY, 0.9); P.line(ax, ay + 9, ax, fl - 3, { w: 1.2, c: NAVY, passes: 1, over: 0 }); P.line(ax - 5, fl - 3, ax + 5, fl - 3, { w: 1.2, c: NAVY, passes: 1, over: 0 });
      // star chart on the wall
      P.circle(x0 + w * 0.18, y0 + h * 0.34, 8, { w: 0.6, c: NAVY, a: 0.8, passes: 1 }); P.dots(Array.from({ length: 10 }, () => { const a = R(0, TAU), r = R(0, 7); return [x0 + w * 0.18 + Math.cos(a) * r, y0 + h * 0.34 + Math.sin(a) * r, 0.6]; }), NAVY, 0.9);
    };
    INTERIOR.HERB = (x0, y0, x1, y1) => {
      const w = x1 - x0, h = y1 - y0, fl = y1 - 4;
      // pressed-plant frames
      for (let r = 0; r < 2; r++) for (let c2 = 0; c2 < 4; c2++) { const fx = x0 + 4 + c2 * (w * 0.18), fy = y0 + 4 + r * 16; P.rect(fx, fy, w * 0.15, 13, { w: 0.7, c: NAVY, rough: 0.15, over: 0, passes: 1 }); P.curve([[fx + w * 0.075, fy + 12], [fx + w * 0.075 + R(-1, 1), fy + 6], [fx + w * 0.075, fy + 2]], { w: 0.5, c: NAVY, rough: 0.2, passes: 1 }); for (let l = 0; l < 3; l++) { P.leaf(fx + w * 0.075, fy + 10 - l * 3, -1.2 - R(0, 0.4), 4, 1.6, { c: NAVY, w: 0.5, simple: true, a: 0.85 }); P.leaf(fx + w * 0.075, fy + 9 - l * 3, -1.9 + R(0, 0.4), 4, 1.6, { c: NAVY, w: 0.5, simple: true, a: 0.85 }); } }
      // hanging herb bundles
      for (let i = 0; i < 4; i++) { const bx = x0 + w * (0.15 + i * 0.2) + R(-2, 2), by = y0 + h * 0.5; P.line(bx, y0 + h * 0.42, bx, by, { w: 0.5, c: NAVY, passes: 1, over: 0 }); for (let k = 0; k < 6; k++) P.line(bx, by, bx + R(-4, 4), by + R(6, 12), { w: 0.6, c: NAVY, a: 0.9, passes: 1, over: 0, rough: 0.2 }); }
      P.line(x0 + 2, y0 + h * 0.42, x1 - 2, y0 + h * 0.42, { w: 0.9, c: NAVY, passes: 1, over: 0, rough: 0.15 });
      // workbench, microscope, jars, ferns
      P.line(x0 + 4, fl - 14, x1 - 4, fl - 14, { w: 1.6, c: NAVY, passes: 1, over: 0, rough: 0.1 }); [0.1, 0.5, 0.9].forEach(f => P.line(x0 + w * f, fl - 14, x0 + w * f, fl, { w: 1.3, c: NAVY, passes: 1, over: 0, rough: 0.1 }));
      P.path([[x0 + w * 0.3, fl - 15], [x0 + w * 0.3, fl - 22], [x0 + w * 0.34, fl - 30], [x0 + w * 0.38, fl - 22]], { w: 1.1, c: NAVY, rough: 0.15, passes: 1 }); P.line(x0 + w * 0.28, fl - 15, x0 + w * 0.4, fl - 15, { w: 1.3, c: NAVY, passes: 1, over: 0 }); P.circle(x0 + w * 0.34, fl - 24, 2, { w: 0.8, c: NAVY, passes: 1 });
      for (let i = 0; i < 4; i++) { const jx = x0 + w * (0.5 + i * 0.09); P.rect(jx, fl - 22, 5, 7.5, { w: 0.7, c: NAVY, rough: 0.1, over: 0, passes: 1 }); P.rect(jx + 0.6, fl - 24, 3.8, 2, { w: 0.6, c: NAVY, rough: 0.1, over: 0, passes: 1 }); fillPoly([[jx + 0.6, fl - 19], [jx + 4.4, fl - 19], [jx + 4.4, fl - 15.5], [jx + 0.6, fl - 15.5]], NAVY, 0.3); }
      for (let f = 0; f < 2; f++) { const fx = f ? x1 - 9 : x0 + 9; P.path([[fx - 4, fl], [fx - 5, fl - 6], [fx + 5, fl - 6], [fx + 4, fl]], { w: 0.8, c: NAVY, rough: 0.1, passes: 1 }); for (let k = 0; k < 7; k++) { const an = -Math.PI / 2 + (k - 3) * 0.32; P.curve([[fx, fl - 6], [fx + Math.cos(an) * 8, fl - 6 + Math.sin(an) * 9 - 2], [fx + Math.cos(an) * 14, fl - 6 + Math.sin(an) * 12 + 4]], { w: 0.6, c: NAVY, rough: 0.2, passes: 1 }); } }
      person(x0 + w * 0.44, fl - 3, 0.95, 'stand');
    };
    INTERIOR.MUSIC = (x0, y0, x1, y1) => {
      const w = x1 - x0, h = y1 - y0, fl = y1 - 4;
      // organ of reed pipes
      for (let i = 0; i < 9; i++) { const px = x0 + 3 + i * 4.6, ph = 12 + Math.abs(4 - i) * -2.6 + 14 + (i % 2) * 2 + i * 0.6; P.rect(px, fl - ph - 6, 3.4, ph, { w: 0.7, c: NAVY, rough: 0.1, over: 0, passes: 1 }); P.arc(px + 1.7, fl - 6 - ph, 1.7, 1, Math.PI, TAU, { w: 0.5, c: NAVY, passes: 1 }); fillPoly([[px + 1.8, fl - ph - 6], [px + 3.4, fl - ph - 6], [px + 3.4, fl - 6], [px + 1.8, fl - 6]], NAVY, 0.25); }
      P.rect(x0 + 2, fl - 6, 44, 6, { w: 1, c: NAVY, rough: 0.15, over: 0, passes: 1 }); for (let k = 0; k < 12; k++) P.line(x0 + 4 + k * 3.5, fl - 6, x0 + 4 + k * 3.5, fl - 1, { w: 0.5, c: NAVY, passes: 1, over: 0 });
      // cello and its player
      const cx = x0 + w * 0.62; P.ellipse(cx, fl - 14, 7, 10, { w: 1.1, c: NAVY }); P.ellipse(cx, fl - 27, 5, 6, { w: 1, c: NAVY, passes: 1 }); P.line(cx, fl - 33, cx, fl - 46, { w: 1.4, c: NAVY, passes: 1, over: 0 }); P.line(cx, fl - 4, cx, fl + 1, { w: 0.9, c: NAVY, passes: 1, over: 0 }); P.line(cx - 2, fl - 20, cx - 2, fl - 10, { w: 0.4, c: NAVY, a: 0.8, passes: 1, over: 0 }); P.line(cx + 2, fl - 20, cx + 2, fl - 10, { w: 0.4, c: NAVY, a: 0.8, passes: 1, over: 0 });
      person(cx + 14, fl - 3, 1, 'sit'); P.line(cx + 11, fl - 22, cx - 6, fl - 18, { w: 0.9, c: NAVY, passes: 1, over: 0 });
      // the bird choir on a perch, with sheet music
      P.line(x0 + w * 0.45, y0 + 14, x1 - 4, y0 + 14, { w: 1.1, c: NAVY, passes: 1, over: 0, rough: 0.3 });
      for (let i = 0; i < 5; i++) { const bx = x0 + w * 0.5 + i * 8.5, by = y0 + 13; P.ellipse(bx, by - 4, 3.4, 4.4, { w: 0.9, c: NAVY, passes: 1 }); P.circle(bx + 1, by - 9, 2, { w: 0.8, c: NAVY, passes: 1 }); P.line(bx + 3, by - 9, bx + 5.5, by - 8.5, { w: 0.7, c: NAVY, passes: 1, over: 0 }); disc(bx, by - 4, 3.2, NAVY, 0.35); if (i % 2 === 0) P.ellipse(bx + 6.5, by - 14, 1.4, 1, { w: 0.6, c: NAVY, passes: 1, rot: -0.3 }); }
      for (let i = 0; i < 3; i++) { const sx = x0 + w * 0.5 + i * 14, sy = y0 + 22; P.rect(sx, sy, 11, 8, { w: 0.5, c: NAVY, a: 0.85, over: 0, passes: 1 }); for (let k = 1; k < 4; k++) P.line(sx + 1, sy + k * 2, sx + 10, sy + k * 2, { w: 0.3, c: NAVY, a: 0.7, passes: 1, over: 0 }); [[3, 2], [6, 4], [8, 3]].forEach(([dx, dy]) => P.dot(sx + dx, sy + dy, 0.9, { c: NAVY })); }
    };
    INTERIOR.KIDS = (x0, y0, x1, y1) => {
      const w = x1 - x0, h = y1 - y0, fl = y1 - 3;
      shelfUnit(x0 + 2, fl - 20, x0 + w * 0.5, fl, 2, NAVY);
      for (let i = 0; i < 7; i++) { const bx = x0 + w * 0.08 + i * 6; const k = i % 3; if (k === 0) P.rect(bx, fl - 30 - R(0, 2), 5, 5, { w: 0.7, c: NAVY, passes: 1, over: 0 }); else if (k === 1) P.poly([[bx, fl - 25], [bx + 5, fl - 25], [bx + 2.5, fl - 31]], { w: 0.7, c: NAVY, passes: 1, over: 0 }); else P.circle(bx + 2.5, fl - 28, 2.6, { w: 0.7, c: NAVY, passes: 1 }); }
      P.path([[x1 - 28, fl - 1], [x1 - 26, fl - 18], [x1 - 6, fl - 18], [x1 - 4, fl - 1]], { w: 1, c: NAVY, rough: 0.2, passes: 1 }); P.arc(x1 - 15, fl - 18, 11, 6, Math.PI, TAU, { w: 1, c: NAVY, passes: 1 }); fillPoly([[x1 - 26, fl - 18], [x1 - 4, fl - 18], [x1 - 4, fl - 1], [x1 - 28, fl - 1]], NAVY, 0.25);
      person(x0 + w * 0.6, fl, 0.62, 'sit'); P.poly([[x0 + w * 0.3, fl - 2], [x0 + w * 0.42, fl - 4], [x0 + w * 0.44, fl - 1], [x0 + w * 0.32, fl + 1]], { w: 0.7, c: NAVY, passes: 1, over: 0 });
    };
    INTERIOR.SILENCE = (x0, y0, x1, y1) => {
      const w = x1 - x0, h = y1 - y0, fl = y1 - 3;
      P.path([[x0 + w * 0.3, fl], [x0 + w * 0.3, fl - 16], [x0 + w * 0.38, fl - 26], [x0 + w * 0.5, fl - 26], [x0 + w * 0.56, fl - 16], [x0 + w * 0.56, fl]], { w: 1, c: NAVY, rough: 0.2, passes: 1 }); fillPoly([[x0 + w * 0.3, fl], [x0 + w * 0.3, fl - 16], [x0 + w * 0.38, fl - 26], [x0 + w * 0.5, fl - 26], [x0 + w * 0.56, fl - 16], [x0 + w * 0.56, fl]], NAVY, 0.22);
      P.line(x0 + w * 0.72, fl, x0 + w * 0.72, fl - 10, { w: 1.4, c: NAVY, passes: 1, over: 0 }); lantern(x0 + w * 0.72, fl - 14, 0.5, 0, false);
      P.line(x0 + 3, y0 + 10, x1 - 3, y0 + 10, { w: 1, c: NAVY, passes: 1, over: 0 }); P.ellipse(x0 + w * 0.6, y0 + 6, 3.4, 4.2, { w: 0.9, c: NAVY }); disc(x0 + w * 0.6, y0 + 6, 3.4, NAVY, 0.4); P.line(x0 + w * 0.6 - 2, y0 + 3, x0 + w * 0.6 - 1, y0 + 6, { w: 0.5, c: PALE, passes: 1, over: 0 });
      P.text('SHH', x0 + w * 0.2, y0 + 8, { size: 8, c: NAVY, a: 0.95 });
    };

    const pod = (cx, cy, rx, ry, kind, name, o = {}) => {
      const ring = (k) => Array.from({ length: 40 }, (_, i) => [cx + Math.cos(i * TAU / 40) * rx * k, cy + Math.sin(i * TAU / 40) * ry * k]);
      // ropes/branch stubs first, then the opaque body hides whatever is behind
      if (o.ropes) o.ropes.forEach(([ax, ay]) => { P.line(cx + (ax - cx) * 0.55, cy - ry * 0.85, ax, ay, { w: 0.9, c: W, a: 0.95, passes: 1, over: 0, rough: 0.2 }); });
      P.occlude(ring(1.08), BLUE);
      P.wash(ring(1), '#2a62ad', 0.5, { edge: 0, jit: 0.3, steps: 1 });
      // outer shell: staves, hoops and growth rings
      for (let k = 0; k < 4; k++) P.ellipse(cx, cy, rx * (1 - k * 0.06), ry * (1 - k * 0.06), { w: k ? 0.6 : 2, c: W, a: k ? 0.6 : 0.98, passes: k ? 1 : 2, rough: 0.5 });
      for (let i = 0; i < 46; i++) { const a = i * TAU / 46 + R(-0.02, 0.02); P.line(cx + Math.cos(a) * rx * 0.82, cy + Math.sin(a) * ry * 0.82, cx + Math.cos(a) * rx * 0.95, cy + Math.sin(a) * ry * 0.95, { w: 0.55, c: W, a: 0.6, passes: 1, over: 0, rough: 0.2 }); }
      P.hatch(ring(1), { ang: -50, gap: 2.2, a: 0.4, w: 0.45, c: W, fade: (x, y) => Math.max(0, ((x - cx) / rx + (y - cy) / ry) * 0.6 + 0.2), piece: 8 });
      // leaf-shingle roof on the top of the shell
      shingles(cx, cy - ry * 0.02, rx * 0.98, ry * 0.98, Math.PI * 1.08, Math.PI * 1.92, 2, W);
      // the window: a lit interior, drawn in navy line on pale paper
      const wr = 0.78, win = ring(wr);
      P.wash(win, PALE, 1, { edge: 0, jit: 0, steps: 1 });
      P.wash(win, '#ffffff', 0.55, { edge: 0, jit: 0, steps: 1, grad: { x0: cx - rx * 0.5, y0: cy - ry * 0.5, x1: cx + rx * 0.6, y1: cy + ry * 0.6, c0: '#ffffff', c1: PALE2, a0: 0.75, a1: 0.1 } });
      const x0 = cx - rx * 0.57, x1 = cx + rx * 0.57, y0 = cy - ry * 0.53, y1 = cy + ry * 0.53;
      INTERIOR[kind](x0, y0, x1, y1);
      lantern(cx, y0 - 3, 0.62, 5, false);
      P.ellipse(cx, cy, rx * wr, ry * wr, { w: 1.7, c: W, a: 0.98, passes: 2 }); P.ellipse(cx, cy, rx * (wr - 0.02), ry * (wr - 0.02), { w: 0.6, c: NAVY, a: 0.8, passes: 1 });
      // window cross-bar shadows, sill
      P.line(cx - rx * wr * 0.9, cy + ry * wr * 0.62, cx + rx * wr * 0.9, cy + ry * wr * 0.62, { w: 0.7, c: NAVY, a: 0.5, passes: 1, over: 0 });
      // stub balcony + hanging lanterns + name plaque
      P.line(cx - rx * 0.8, cy + ry * 0.62, cx + rx * 0.8, cy + ry * 0.62, { w: 0.01, c: W, a: 0, passes: 1 });
      lantern(cx - rx * 0.86, cy + ry * 0.42, 0.7, 10); lantern(cx + rx * 0.86, cy + ry * 0.42, 0.7, 10);
      const py = cy + ry + 10, pw = P.measure(name, 10) + 10; P.rect(cx - pw / 2, py - 9, pw, 13, { w: 0.9, c: W, a: 0.95, rough: 0.2, over: 0, passes: 1 }); P.line(cx - pw / 2 + 3, cy + ry - 1, cx - pw / 2 + 3, py - 9, { w: 0.5, c: W, passes: 1, over: 0 }); P.line(cx + pw / 2 - 3, cy + ry - 1, cx + pw / 2 - 3, py - 9, { w: 0.5, c: W, passes: 1, over: 0 }); P.text(name, cx, py, { size: 10, c: W, align: 'center', a: 0.95 });
      if (o.chimney) { const chx = cx + rx * 0.5, chy = cy - ry * 0.92; P.poly([[chx - 4, chy], [chx + 4, chy], [chx + 4, chy - 12], [chx - 4, chy - 12]], { w: 1, c: W, rough: 0.15, over: 0, passes: 1 }); smoke(chx, chy - 12, 44); }
      if (o.flag) { const fx = cx - rx * 0.4, fy = cy - ry * 0.97; P.line(fx, fy, fx, fy - 26, { w: 1, c: W, passes: 1, over: 0 }); P.poly([[fx, fy - 26], [fx + 16, fy - 22], [fx, fy - 17]], { w: 0.8, c: W, rough: 0.15, over: 0, passes: 1 }); P.rect(fx + 3, fy - 24, 6, 4, { w: 0.5, c: W, a: 0.9, over: 0, passes: 1 }); }
    };
    const PODS = [
      ['POETRY', 'POETRY ROOM', 372, 372, 92, 70, { ropes: [[352, 314], [396, 310]], chimney: true }],
      ['MAPS', 'CARTOGRAPHY', 598, 306, 84, 64, { ropes: [[582, 262], [626, 258]], flag: true }],
      ['ASTRO', 'OBSERVATORY', 808, 236, 84, 64, { ropes: [] }],
      ['HERB', 'HERBARIUM', 1010, 306, 84, 64, { ropes: [[992, 262], [1030, 256]], chimney: true }],
      ['MUSIC', 'CONSORT', 1206, 402, 90, 68, { ropes: [[1186, 350], [1230, 344]], flag: true }],
      ['KIDS', 'LITTLE READERS', 528, 470, 60, 46, { ropes: [[516, 434], [544, 430]] }],
      ['SILENCE', 'SILENCE', 1360, 344, 54, 42, { ropes: [[1346, 310], [1372, 308]] }],
    ];
    PODS.forEach(([k, nm, cx, cy, rx, ry, o]) => pod(cx, cy, rx, ry, k, nm, o));

    /* ================= 6. magnified plates: the same rooms, drawn large inside loupe rings ================= */
    const EXTRA = {
      POETRY: (cx, cy, rx, ry) => {
        const x0 = cx - rx * 0.53, y0 = cy - ry * 0.5, w = rx * 1.06, fl = cy + ry * 0.5 - 4;
        for (let i = 0; i < 3; i++) { const px = cx - 6 + i * 9, top = y0 + 3 + i * 1.5; P.line(px, top - 2, px, top + 6 + i * 3, { w: 0.4, c: NAVY, a: 0.8, passes: 1, over: 0 }); const q = top + 6 + i * 3; P.poly([[px, q], [px + 3, q + 4], [px, q + 9], [px - 3, q + 4]], { w: 0.5, c: NAVY, rough: 0.1, over: 0, passes: 1 }); P.line(px, q, px, q + 9, { w: 0.3, c: NAVY, a: 0.7, passes: 1, over: 0 }); P.line(px - 3, q + 4, px + 3, q + 4, { w: 0.3, c: NAVY, a: 0.6, passes: 1, over: 0 }); }
        // cat curled in the reader's lap-side cushion
        const kx = x0 + w * 0.72, ky = fl - 5; P.ellipse(kx, ky, 6, 3.4, { w: 0.8, c: NAVY, passes: 1 }); disc(kx, ky, 5.8, NAVY, 0.7); P.circle(kx - 5, ky - 1.5, 2.4, { w: 0.7, c: NAVY, passes: 1 }); P.line(kx - 6.4, ky - 3.5, kx - 6, ky - 5.2, { w: 0.6, c: NAVY, passes: 1, over: 0 }); P.line(kx - 4, ky - 3.6, kx - 3.6, ky - 5.2, { w: 0.6, c: NAVY, passes: 1, over: 0 }); P.curve([[kx + 5, ky + 1], [kx + 8, ky + 2], [kx + 5, ky + 4], [kx - 2, ky + 3.4]], { w: 0.8, c: NAVY, rough: 0.2, passes: 1 });
        // teacup and its steam
        const tx2 = x0 + w * 0.7, ty2 = fl - 11; P.path([[tx2 - 3, ty2 - 3], [tx2 - 2.4, ty2 + 1], [tx2 + 2.4, ty2 + 1], [tx2 + 3, ty2 - 3]], { w: 0.7, c: NAVY, rough: 0.1, passes: 1 }); P.arc(tx2 + 3, ty2 - 1, 1.6, 1.6, -1.5, 1.5, { w: 0.5, c: NAVY, passes: 1 }); P.curve([[tx2 - 1, ty2 - 5], [tx2 + 1, ty2 - 8], [tx2 - 1, ty2 - 11]], { w: 0.4, c: NAVY, a: 0.7, rough: 0.2, passes: 1 });
        for (let i = 0; i < 26; i++) P.dot(x0 + R(0, w), cy + R(-ry * 0.5, ry * 0.5), 0.45, { c: '#ffffff', a: 0.95 });
        // a tapestry-like rug
        P.poly([[x0 + w * 0.25, fl + 1], [x0 + w * 0.75, fl + 1], [x0 + w * 0.72, fl - 1.5], [x0 + w * 0.28, fl - 1.5]], { w: 0.5, c: NAVY, a: 0.8, over: 0, passes: 1 });
      },
      MAPS: (cx, cy, rx, ry) => {
        const x0 = cx - rx * 0.53, w = rx * 1.06, fl = cy + ry * 0.5 - 4;
        // ship in a bottle on the map table
        const bx = x0 + w * 0.36, by = fl - 25; P.path([[bx - 6, by], [bx - 6, by - 5], [bx - 2, by - 8], [bx - 2, by - 11], [bx + 2, by - 11], [bx + 2, by - 8], [bx + 6, by - 5], [bx + 6, by]], { w: 0.6, c: NAVY, rough: 0.1, passes: 1 }); P.line(bx - 3, by - 2, bx + 3, by - 2, { w: 0.5, c: NAVY, passes: 1, over: 0 }); P.line(bx, by - 2, bx, by - 6, { w: 0.4, c: NAVY, passes: 1, over: 0 }); P.poly([[bx, by - 6], [bx + 3, by - 3], [bx, by - 3]], { w: 0.3, c: NAVY, over: 0, passes: 1 });
        // pins & thread on the wall chart
        for (let i = 0; i < 5; i++) P.dot(x0 + 8 + i * 8 + R(-2, 2), cy - ry * 0.5 + R(6, 20), 0.9, { c: NAVY });
        P.curve([[x0 + 9, cy - ry * 0.5 + 16], [x0 + 20, cy - ry * 0.5 + 9], [x0 + 32, cy - ry * 0.5 + 20], [x0 + 44, cy - ry * 0.5 + 8]], { w: 0.3, c: NAVY, a: 0.8, rough: 0.2, passes: 1 });
        // compasses/dividers
        P.line(x0 + w * 0.5, fl - 24.5, x0 + w * 0.53, fl - 30, { w: 0.5, c: NAVY, passes: 1, over: 0 }); P.line(x0 + w * 0.56, fl - 24.5, x0 + w * 0.53, fl - 30, { w: 0.5, c: NAVY, passes: 1, over: 0 });
      },
      MUSIC: (cx, cy, rx, ry) => {
        const x0 = cx - rx * 0.53, w = rx * 1.06, y0 = cy - ry * 0.5;
        for (let i = 0; i < 7; i++) { const nx = x0 + R(3, w - 3), ny = y0 + R(24, 52); P.ellipse(nx, ny, 1.9, 1.3, { w: 0.6, c: NAVY, a: 0.9, passes: 1, rot: -0.4 }); disc(nx, ny, 1.7, NAVY, 0.85); P.line(nx + 1.6, ny - 0.4, nx + 1.6, ny - 7, { w: 0.5, c: NAVY, passes: 1, over: 0 }); if (i % 2) P.curve([[nx + 1.6, ny - 7], [nx + 4, ny - 6], [nx + 4.5, ny - 3.5]], { w: 0.5, c: NAVY, rough: 0.1, passes: 1 }); }
        for (let i = 0; i < 4; i++) { const mx = x0 + R(6, w - 6), my = y0 + R(22, 46); P.curve([[mx - 3, my - 1], [mx - 1, my - 3], [mx, my]], { w: 0.5, c: NAVY, rough: 0.1, passes: 1 }); P.curve([[mx, my], [mx + 1, my - 3], [mx + 3, my - 1]], { w: 0.5, c: NAVY, rough: 0.1, passes: 1 }); }
      },
    };
    const loupe = (cx, cy, rx, ry, sc, tx, ty, roman, ang) => {
      const Rx = rx * sc + 18, Ry = ry * sc + 18;
      P.ellipse(tx, ty, Rx, Ry, { w: 1.5, c: W, a: 0.95, passes: 2 }); P.ellipse(tx, ty, Rx + 7, Ry + 7, { w: 0.6, c: MID, a: 0.7, passes: 1 });
      for (let i = 0; i < 120; i++) { const a = i * TAU / 120, l = i % 5 === 0 ? 7 : 3.5; P.line(tx + Math.cos(a) * (Rx + 1), ty + Math.sin(a) * (Ry + 1), tx + Math.cos(a) * (Rx + 1 + l), ty + Math.sin(a) * (Ry + 1 + l * Ry / Rx), { w: 0.5, c: MID, a: 0.7, passes: 1, over: 0, rough: 0.1 }); }
      P.ellipse(cx, cy, rx + 9, ry + 9, { w: 0.8, c: MID, a: 0.85, passes: 1 });
      // tangent leaders from the pod ring to the loupe ring
      [-0.32, 0.32].forEach(d => { const a1 = ang + d; P.dashed(cx + Math.cos(a1) * (rx + 9), cy + Math.sin(a1) * (ry + 9), tx + Math.cos(ang + d * 0.45 + Math.PI) * Rx * 0.98, ty + Math.sin(ang + d * 0.45 + Math.PI) * Ry * 0.98, [6, 5], { w: 0.6, c: MID, a: 0.75 }); });
      const bx = tx - Rx * 0.72, by = ty - Ry * 0.72; P.circle(bx, by, 11, { w: 1, c: W, a: 0.95 }); P.occlude(Array.from({ length: 12 }, (_, i) => [bx + Math.cos(i * TAU / 12) * 10, by + Math.sin(i * TAU / 12) * 10]), BLUE); P.circle(bx, by, 10, { w: 0.6, c: MID, passes: 1 }); P.text(roman, bx, by + 4, { size: 12, c: W, align: 'center', font: S.HAND });
    };
    const zoom = (idx, sc, tx, ty, roman, ang) => { const [k, nm, cx, cy, rx, ry, o] = PODS[idx]; loupe(cx, cy, rx, ry, sc, tx, ty, roman, ang); P.xf(sc, cx, cy, tx, ty); pod(cx, cy, rx, ry, k, nm, { chimney: o.chimney, flag: o.flag }); if (EXTRA[k]) EXTRA[k](cx, cy, rx, ry); P.xfEnd(); };
    zoom(0, 2.1, 262, 642, 'I', 2.4);
    zoom(1, 1.22, 586, 704, 'II', 1.9);
    zoom(4, 1.28, 990, 706, 'III', 1.2);


    /* ================= 7. bridges, tags, the great stair in the trunk, book-lifts ================= */
    [[[452, 396], [498, 448], 14], [[462, 346], [516, 318], 10], [[678, 300], [726, 262], 10], [[892, 250], [930, 290], 10], [[1092, 322], [1122, 372], 12], [[1296, 396], [1310, 366], 6], [[588, 484], [748, 526], 22], [[1116, 424], [862, 560], 34]].forEach(([a, b, sag]) => bridge(a, b, sag, 1));
    // numbered room tags
    [[1, 372, 372, 92, 70], [2, 598, 306, 84, 64], [3, 808, 236, 84, 64], [4, 1010, 306, 84, 64], [5, 1206, 402, 90, 68], [6, 528, 470, 60, 46], [7, 1360, 344, 54, 42]].forEach(([nn, cx, cy, rx, ry]) => { const x = cx - rx * 0.86, y = cy - ry * 0.86; P.occlude(Array.from({ length: 12 }, (_, i) => [x + Math.cos(i * TAU / 12) * 9, y + Math.sin(i * TAU / 12) * 9]), BLUE); P.circle(x, y, 9, { w: 1, c: W, a: 0.95, passes: 1 }); P.text(String(nn), x, y + 4, { size: 11, c: W, align: 'center', font: S.HAND }); });
    // ---- the great spiral stair cut open in the trunk ----
    { const tx0 = 758, tx1 = 842, ty0 = 520, ty1 = 812, cx = 800;
      const arch = []; arch.push([tx0, ty1]); arch.push([tx0, ty0 + 30]); for (let a = Math.PI; a <= TAU; a += 0.2) arch.push([cx + Math.cos(a) * 42, ty0 + 30 + Math.sin(a) * 30]); arch.push([tx1, ty1]);
      P.occlude(arch, BLUE); P.wash(arch, PALE, 1, { edge: 0, jit: 0, steps: 1 }); P.wash(arch, '#ffffff', 0.4, { edge: 0, steps: 1, jit: 0, grad: { x0: 0, y0: ty0, x1: 0, y1: ty1, c0: '#ffffff', c1: PALE2, a0: 0.8, a1: 0.05 } });
      // bookcases curving away on both walls
      for (const side of [-1, 1]) { const xa = side < 0 ? tx0 + 3 : tx1 - 21, xb = xa + 18; for (let y = ty0 + 40; y < ty1 - 6; y += 22) { P.line(xa, y, xb, y, { w: 0.8, c: NAVY, a: 0.95, passes: 1, over: 0, rough: 0.15 }); bookRow(xa + 0.5, xb - 0.5, y - 0.5, 8, 17, NAVY); } P.line(side < 0 ? xb : xa, ty0 + 24, side < 0 ? xb : xa, ty1 - 4, { w: 0.9, c: NAVY, a: 0.9, passes: 1, over: 0, rough: 0.2 }); }
      // central column with bands
      P.rect(cx - 6, ty0 + 8, 12, ty1 - ty0 - 8, { w: 1, c: NAVY, a: 0.95, rough: 0.15, over: 0, passes: 1 }); for (let y = ty0 + 16; y < ty1; y += 9) P.line(cx - 6, y, cx + 6, y + 1, { w: 0.4, c: NAVY, a: 0.5, passes: 1, over: 0 }); fillPoly([[cx + 1, ty0 + 8], [cx + 6, ty0 + 8], [cx + 6, ty1], [cx + 1, ty1]], NAVY, 0.28);
      // helical treads, rail and balusters
      const N = 30, helix = (i, r) => { const ph = i * 0.62, y = ty1 - 8 - i * (ty1 - ty0 - 30) / N; return [cx + Math.sin(ph) * r, y + Math.cos(ph) * 3.2, Math.cos(ph)]; };
      const rail = [], railB = []; for (let i = 0; i <= N; i++) { const q = helix(i, 32); (q[2] > 0 ? rail : railB).push([q[0], q[1] - 12]); }
      for (let i = 0; i < N; i++) { const q = helix(i, 32), q2 = helix(i, 8); const front = q[2] > 0; P.line(q2[0], q2[1], q[0], q[1], { w: front ? 1.8 : 1, c: NAVY, a: front ? 0.95 : 0.55, passes: 1, over: 0, rough: 0.1 }); if (front) { P.line(q[0], q[1], q[0], q[1] - 12, { w: 0.5, c: NAVY, a: 0.8, passes: 1, over: 0 }); fillPoly([[q2[0], q2[1]], [q[0], q[1]], [q[0], q[1] + 2], [q2[0], q2[1] + 2]], NAVY, 0.5); } }
      const pathFront = [], pathBack = []; for (let i = 0; i <= N * 4; i++) { const q = helix(i / 4, 32); [q[2] > 0 ? pathFront : pathBack].forEach(A => A.push([q[0], q[1] - 12])); }
      let seg = []; for (let i = 0; i <= N * 4; i++) { const q = helix(i / 4, 32), f = q[2] > 0; if (f) seg.push([q[0], q[1] - 12]); else { if (seg.length > 2) P.curve(seg, { w: 0.9, c: NAVY, a: 0.95, rough: 0.2, passes: 1 }); seg = []; } } if (seg.length > 2) P.curve(seg, { w: 0.9, c: NAVY, a: 0.95, rough: 0.2, passes: 1 });
      // lanterns down the column
      [ty0 + 60, ty0 + 130, ty0 + 200, ty0 + 270].forEach((y, i) => { const lx = cx + (i % 2 ? 22 : -22); P.line(lx, y - 12, lx, y - 2, { w: 0.5, c: NAVY, passes: 1, over: 0 }); P.poly([[lx - 2.6, y - 2], [lx + 2.6, y - 2], [lx + 2.2, y + 5], [lx - 2.2, y + 5]], { w: 0.8, c: NAVY, rough: 0.1, over: 0, passes: 1 }); fillPoly([[lx - 2, y - 1.5], [lx + 2, y - 1.5], [lx + 1.8, y + 4.5], [lx - 1.8, y + 4.5]], '#ffffff', 0.95); });
      // climbers, a reader on a landing, an elevator basket
      [[18, 0.62, 'climb'], [86, 0.6, 'stand'], [150, 0.62, 'read'], [214, 0.6, 'climb'], [262, 0.62, 'stand']].forEach(([dy, sc, pose], i) => { const q = helix(N * (1 - dy / 292) * 0.98, 30); person(q[0], q[1] - 1, sc * 1.05, pose); });
      P.line(cx + 26, ty0 + 40, cx + 26, ty0 + 150, { w: 0.6, c: NAVY, a: 0.9, passes: 1, over: 0 }); P.poly([[cx + 21, ty0 + 150], [cx + 31, ty0 + 150], [cx + 29, ty0 + 162], [cx + 23, ty0 + 162]], { w: 0.8, c: NAVY, rough: 0.1, over: 0, passes: 1 }); for (let k = 0; k < 3; k++) book(cx + 22 + k * 3, ty0 + 150, 2.6, 6 + k, NAVY);
      // door at the foot, welcome mat, skylight of leaves at the top
      P.arc(cx, ty1 - 18, 9, 9, Math.PI, TAU, { w: 1.2, c: NAVY, passes: 1 }); P.line(cx - 9, ty1 - 18, cx - 9, ty1, { w: 1.2, c: NAVY, passes: 1, over: 0 }); P.line(cx + 9, ty1 - 18, cx + 9, ty1, { w: 1.2, c: NAVY, passes: 1, over: 0 }); fillPoly([[cx - 9, ty1], [cx - 9, ty1 - 18], [cx, ty1 - 27], [cx + 9, ty1 - 18], [cx + 9, ty1]], NAVY, 0.15);
      for (let k = 0; k < 8; k++) P.leaf(cx + R(-30, 30), ty0 + R(6, 24), R(0, TAU), R(7, 12), 3, { c: NAVY, w: 0.6, simple: true, a: 0.9 });
      // arch frame
      P.path(arch.concat([arch[0]]), { w: 2, c: W, a: 0.98, rough: 0.5, passes: 2 }); P.path(arch.map(([x, y]) => [x + (x < cx ? -4 : 4), y - 3]), { w: 0.6, c: MID, a: 0.7, rough: 0.6, passes: 1 });
      P.rect(tx0 - 7, ty1, tx1 - tx0 + 14, 4, { w: 1.2, c: W, a: 0.95, rough: 0.3, over: 0, passes: 1 });
    }


    /* ================= 8. THE SQUIRREL POST OFFICE: a burl on the trunk, and its magnified plate ================= */
    const squirrel = (x, y, s, dir, pose, c = NAVY) => {
      const T = (u, v) => [x + u * s * dir, y + v * s];
      const dot2 = (u, v, r, a = 0.95) => { const q = T(u, v); disc(q[0], q[1], r * s, c, a); };
      const ell = (u, v, rx, ry, rr = 0, o = {}) => { const q = T(u, v); P.ellipse(q[0], q[1], rx * s, ry * s, Object.assign({ w: 0.9, c, a: 0.95, passes: 1, rot: rr * dir }, o)); };
      const ln = (u1, v1, u2, v2, w = 0.7, a = 0.95) => { const p1 = T(u1, v1), p2 = T(u2, v2); P.line(p1[0], p1[1], p2[0], p2[1], { w, c, a, passes: 1, over: 0, rough: 0.15 }); };
      let tail, hwF;
      if (pose === 'sleep') { tail = [T(-8, -4), T(-13, -8), T(-11, -15), T(-3, -18), T(6, -15), T(11, -9)]; hwF = t => (2.6 + 3.2 * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.1))) * s; }
      else if (pose === 'run') { tail = [T(-8, -8), T(-15, -12), T(-20, -20), T(-19, -29), T(-12, -34), T(-5, -32)]; hwF = t => (2.6 + 4.6 * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.1))) * s; }
      else { tail = [T(-4, -5), T(-11, -8), T(-16, -16), T(-17, -26), T(-13, -35), T(-6, -40), T(0, -38)]; hwF = t => (2.8 + 5 * Math.sin(Math.PI * Math.min(1, t * 0.88 + 0.12))) * s; }
      P.strands(tail, hwF, 0, 7, { shadow: 1, c, w: 0.8, a: 0.9, runMin: 5, runMax: 14, gap: 2, step: 3 });
      { const TS = P.sample(tail, false, 4); for (let i = 3; i < TS.length - 1; i += 2) { const q = TS[i], q2 = TS[i + 1], a2 = Math.atan2(q2[1] - q[1], q2[0] - q[0]) + Math.PI / 2, ww = hwF(i / TS.length); const sg = i % 4 ? 1 : -1; P.line(q[0] + Math.cos(a2) * ww * sg, q[1] + Math.sin(a2) * ww * sg, q[0] + Math.cos(a2) * (ww + 2.4 * s) * sg + Math.cos(a2 - 1.2 * sg) * 1.2 * s, q[1] + Math.sin(a2) * (ww + 2.4 * s) * sg + Math.sin(a2 - 1.2 * sg) * 1.2 * s, { w: 0.4, c, a: 0.75, passes: 1, over: 0, rough: 0.15 }); } }
      if (pose === 'sit') {
        ell(0, -11, 5.4, 8.6, 0.12); disc(...T(0, -11), 5 * s, c, 0.08);
        ell(3.6, -23.5, 4.9, 4.5, 0); ln(1.8, -27.6, 1.0, -32.6, 1); ln(5.2, -27.8, 6.4, -32.4, 1); ln(1.8, -27.6, 3, -29, 0.7); dot2(5.4, -23.9, 0.9); dot2(8.4, -23, 0.8);
        ln(8, -22, 12.5, -21.5, 0.35, 0.8); ln(8, -21.6, 12.2, -19.8, 0.35, 0.8); ln(7.8, -22.6, 12, -23.8, 0.35, 0.8);
        ln(3, -15, 8, -17, 1.2); ln(3, -14, 7.4, -13.2, 1.2); ell(-1, -1.6, 5, 2, 0); ell(4.4, -1.4, 3, 1.4, 0);
        P.hatch(P.sample([T(0, -18), T(4.6, -11), T(2, -3), T(-2, -10)], true, 2), { ang: -60, gap: 1.3, a: 0.5, w: 0.35, c });
      } else if (pose === 'sleep') {
        ell(0, -5, 9, 5, 0); disc(...T(0, -5), 6 * s, c, 0.1); ell(7.6, -7, 3.6, 3.4, 0); ln(9.6, -11, 9.4, -14.6, 0.8); ln(6.4, -10.4, 5.6, -13.6, 0.8); P.arc(...T(8.6, -7.4), 1.2 * s, 0.8 * s, 0.2, 2.9, { w: 0.5, c, passes: 1 }); dot2(11.2, -6.4, 0.6);
        P.hatch(P.sample([T(-6, -5), T(0, -9), T(6, -5), T(0, -1)], true, 2), { ang: -55, gap: 1.3, a: 0.5, w: 0.35, c });
      } else {
        ell(0, -8, 8.4, 4.2, -0.15); disc(...T(0, -8), 6 * s, c, 0.1); ell(9.6, -11, 3.6, 3.4, 0); ln(9.6, -14.4, 9.2, -18, 0.8); ln(12, -14, 13.4, -17.4, 0.8); dot2(11.4, -11.4, 0.7); dot2(13, -10.4, 0.6);
        ln(5, -5, 8, 0, 1.1); ln(-5, -5, -8, 0, 1.1); ln(6, -6, 11, -3, 1); ln(-4, -6, -10, -4, 1);
      }
    };
    const envelope = (x, y, w, h, tilt, c = NAVY, stamp = true) => { const ca = Math.cos(tilt), sa = Math.sin(tilt), T = (u, v) => [x + u * ca - v * sa, y + u * sa + v * ca]; P.poly([T(-w / 2, -h / 2), T(w / 2, -h / 2), T(w / 2, h / 2), T(-w / 2, h / 2)], { w: 0.6, c, a: 0.95, rough: 0.1, over: 0, passes: 1 }); P.pl([T(-w / 2, -h / 2), T(0, h * 0.08), T(w / 2, -h / 2)], { w: 0.45, c, a: 0.8, over: 0, rough: 0.1 }); if (stamp) { P.rect(...T(w / 2 - 3.4, -h / 2 + 0.6), 2.4, 2.4, { w: 0.35, c, a: 0.9, over: 0, passes: 1 }); } };

    // the burl on the trunk
    { const bx = 904, by = 590, brx = 46, bry = 34, ring = k => Array.from({ length: 30 }, (_, i) => [bx + Math.cos(i * TAU / 30) * brx * k * (1 + Math.sin(i * 3) * 0.04), by + Math.sin(i * TAU / 30) * bry * k]);
      P.occlude(ring(1.06), BLUE); P.wash(ring(1), '#2a62ad', 0.5, { edge: 0, jit: 0.3, steps: 1 });
      for (let k = 0; k < 6; k++) P.path(ring(1 - k * 0.15).concat([ring(1 - k * 0.15)[0]]), { w: k ? 0.6 : 1.8, c: W, a: k ? 0.7 : 0.98, rough: 0.7, passes: k ? 1 : 2 });
      P.hatch(ring(1), { ang: -50, gap: 2.2, a: 0.35, w: 0.45, c: W, fade: (x, y) => Math.max(0, ((x - bx) / brx + (y - by) / bry) * 0.6 + 0.2), piece: 8 });
      // round door with a lit interior
      P.wash(Array.from({ length: 20 }, (_, i) => [bx - 6 + Math.cos(i * TAU / 20) * 15, by + 3 + Math.sin(i * TAU / 20) * 15]), PALE, 1, { edge: 0, jit: 0, steps: 1 });
      squirrel(bx - 8, by + 14, 0.55, 1, 'sit'); P.circle(bx - 6, by + 3, 15, { w: 1.6, c: W, a: 0.98, passes: 2 }); P.circle(bx - 6, by + 3, 12, { w: 0.5, c: NAVY, a: 0.7, passes: 1 });
      P.text('POST', bx + 14, by - 12, { size: 8, c: W, a: 0.95 });
      // letter chute to a big acorn mail-box at the roots
      P.line(bx + 14, by + 30, bx + 22, GY - 16, { w: 1, c: W, a: 0.9, passes: 1, over: 0, rough: 0.3 }); P.line(bx + 20, by + 32, bx + 28, GY - 16, { w: 1, c: W, a: 0.9, passes: 1, over: 0, rough: 0.3 });
      const ax = bx + 42, ay = GY - 20; P.line(ax - 20, GY - 1, ax - 20, ay + 4, { w: 1.4, c: W, passes: 1, over: 0 }); P.ellipse(ax, ay + 6, 11, 14, { w: 1.5, c: W, a: 0.98 }); P.arc(ax, ay - 2, 13, 8, Math.PI, TAU, { w: 1.5, c: W, a: 0.98 }); P.line(ax - 13, ay - 2, ax + 13, ay - 2, { w: 1.1, c: W, passes: 1, over: 0 }); for (let i = -10; i <= 10; i += 4) P.line(ax + i, ay - 3, ax + i * 0.7, ay - 8, { w: 0.4, c: W, a: 0.6, passes: 1, over: 0 }); P.line(ax, ay - 10, ax + 2, ay - 15, { w: 1.2, c: W, passes: 1, over: 0 }); P.line(ax - 6, ay + 4, ax + 6, ay + 4, { w: 1, c: W, passes: 1, over: 0 }); P.rect(ax - 5, ay + 2.5, 10, 3, { w: 0.5, c: W, over: 0, passes: 1 }); P.line(ax - 20, ay + 6, ax - 11, ay + 6, { w: 0.9, c: W, passes: 1, over: 0 }); P.line(ax - 20, ay + 1, ax - 20, ay + 4, { w: 0.9, c: W, passes: 1, over: 0 });
      P.hatch(P.sample([[ax - 11, ay + 6], [ax, ay - 8], [ax + 11, ay + 6], [ax, ay + 20]], true, 3), { ang: 70, gap: 1.6, a: 0.5, w: 0.4, c: W, fade: x => Math.max(0, (x - ax + 5) / 16) });
      P.text('MAIL', ax, ay + 32 - 6, { size: 8, c: W, align: 'center', a: 0.9 });
      // zip-lines with letter baskets to the pods
      [[bx + 20, by - 30, 1010, 372, 12], [bx + 30, by - 20, 1196, 452, 22], [bx - 30, by - 30, 760, 520, 8]].forEach(([x1, y1, x2, y2, sag], i) => { const pts = []; for (let k = 0; k <= 24; k++) { const t2 = k / 24; pts.push([lerp(x1, x2, t2), lerp(y1, y2, t2) + sag * 4 * t2 * (1 - t2)]); } P.curve(pts, { w: 0.8, c: W, a: 0.95, rough: 0.2, passes: 1 }); const q = pts[8 + i * 4]; P.circle(q[0], q[1], 2.4, { w: 0.8, c: W, passes: 1 }); P.line(q[0], q[1] + 2, q[0], q[1] + 8, { w: 0.5, c: W, passes: 1, over: 0 }); P.occlude([[q[0] - 5, q[1] + 8], [q[0] + 5, q[1] + 8], [q[0] + 4, q[1] + 15], [q[0] - 4, q[1] + 15]], BLUE); P.poly([[q[0] - 5, q[1] + 8], [q[0] + 5, q[1] + 8], [q[0] + 4, q[1] + 15], [q[0] - 4, q[1] + 15]], { w: 0.7, c: W, rough: 0.1, over: 0, passes: 1 }); envelope(q[0], q[1] + 7, 6, 3.6, R(-0.4, 0.4), W, false); });
    }
    loupe(904, 590, 46, 34, 4.0, 1340, 635, 'IV', -0.15);
    { const ox = 1340, oy = 635;
      const ell = (k) => Array.from({ length: 48 }, (_, i) => [ox + Math.cos(i * TAU / 48) * 190 * k, oy + Math.sin(i * TAU / 48) * 140 * k]);
      P.occlude(ell(1.02), BLUE); P.wash(ell(1), '#2a62ad', 0.5, { edge: 0, jit: 0.3, steps: 1 });
      for (let k = 0; k < 4; k++) P.ellipse(ox, oy, 190 * (1 - k * 0.028), 140 * (1 - k * 0.028), { w: k ? 0.6 : 2, c: W, a: k ? 0.6 : 0.98, passes: k ? 1 : 2, rough: 0.5 });
      for (let i = 0; i < 150; i++) { const a = i * TAU / 150; P.line(ox + Math.cos(a) * 172, oy + Math.sin(a) * 127, ox + Math.cos(a) * 186, oy + Math.sin(a) * 137, { w: 0.5, c: W, a: 0.6, passes: 1, over: 0, rough: 0.2 }); }
      P.wash(Array.from({ length: 48 }, (_, i) => [ox + Math.cos(i * TAU / 48) * 170, oy + Math.sin(i * TAU / 48) * 125]), PALE, 1, { edge: 0, jit: 0, steps: 1 });
      P.wash(Array.from({ length: 48 }, (_, i) => [ox + Math.cos(i * TAU / 48) * 170, oy + Math.sin(i * TAU / 48) * 125]), '#ffffff', 0.5, { edge: 0, jit: 0, steps: 1, grad: { x0: ox - 100, y0: oy - 100, x1: ox + 120, y1: oy + 120, c0: '#ffffff', c1: PALE2, a0: 0.8, a1: 0.1 } });
      // banner
      P.poly([[ox - 62, oy - 114], [ox + 62, oy - 114], [ox + 56, oy - 100], [ox - 56, oy - 100]], { w: 1, c: NAVY, rough: 0.2, over: 0, passes: 1 }); P.text('SQUIRREL & CO. POST', ox, oy - 104, { size: 9.4, c: NAVY, align: 'center', font: S.HAND });
      // pigeonhole wall
      const wx0 = ox - 106, wy0 = oy - 80, cols = 9, rows = 6, cw = 14.4, ch = 14.6;
      P.rect(wx0 - 4, wy0 - 12, cols * cw + 8, rows * ch + 16, { w: 1.6, c: NAVY, a: 0.98, rough: 0.2, over: 0, passes: 1 }); P.rect(wx0 - 1.5, wy0 - 9.5, cols * cw + 3, rows * ch + 11, { w: 0.5, c: NAVY, a: 0.7, rough: 0.2, over: 0, passes: 1 });
      const tags = ['ELM', 'OAK', 'ASH', 'FIR', 'YEW', 'BOX', 'FIG', 'PEA', 'BAY'];
      for (let c2 = 0; c2 < cols; c2++) P.text(tags[c2], wx0 + c2 * cw + cw / 2, wy0 - 3, { size: 6, c: NAVY, align: 'center', a: 0.9 });
      for (let r = 0; r < rows; r++) for (let c2 = 0; c2 < cols; c2++) {
        const x = wx0 + c2 * cw, y = wy0 + r * ch; P.path([[x, y + ch], [x, y], [x + cw, y], [x + cw, y + ch]], { w: 0.7, c: NAVY, a: 0.95, rough: 0.12, passes: 1 });
        const q = P.R(); if (q > 0.72) continue;
        if (q > 0.3) { envelope(x + cw / 2 + R(-1, 1), y + ch - 4 - R(0, 2), 9, 5.4, R(-0.18, 0.18), NAVY); if (q > 0.5) envelope(x + cw / 2 + R(-2, 2), y + ch - 8, 8, 4.8, R(-0.25, 0.25), NAVY, false); }
        else if (q > 0.16) { P.rect(x + 2.4, y + ch - 8.4, cw - 4.8, 7.4, { w: 0.5, c: NAVY, a: 0.9, over: 0, passes: 1 }); P.line(x + 2.4, y + ch - 5, x + cw - 2.4, y + ch - 5, { w: 0.35, c: NAVY, a: 0.7, passes: 1, over: 0 }); P.line(x + cw / 2, y + ch - 8.4, x + cw / 2, y + ch - 1, { w: 0.35, c: NAVY, a: 0.7, passes: 1, over: 0 }); }
        else { P.curve([[x + 3, y + ch - 2], [x + cw / 2, y + ch - 12], [x + cw - 3, y + ch - 2]], { w: 0.6, c: NAVY, rough: 0.2, passes: 1 }); }
      }
      // ladder on a rail and a climbing clerk
      const lx0 = wx0 + 46, ly0 = wy0 + rows * ch + 4, lx1 = wx0 + 66, ly1 = wy0 - 6; P.line(lx0, ly0, lx1, ly1, { w: 1.4, c: NAVY, passes: 1, over: 0, rough: 0.15 }); P.line(lx0 + 8, ly0, lx1 + 8, ly1, { w: 1.4, c: NAVY, passes: 1, over: 0, rough: 0.15 }); for (let k = 0; k <= 9; k++) P.line(lerp(lx0, lx1, k / 9), lerp(ly0, ly1, k / 9), lerp(lx0, lx1, k / 9) + 8, lerp(ly0, ly1, k / 9), { w: 0.8, c: NAVY, passes: 1, over: 0, rough: 0.1 });
      squirrel(lerp(lx0, lx1, 0.55) + 4, lerp(ly0, ly1, 0.55) + 2, 0.8, 1, 'sit');
      P.line(wx0 - 4, wy0 - 10, ox + 20, wy0 - 10, { w: 0.9, c: NAVY, a: 0.9, passes: 1, over: 0, rough: 0.2 });
      // counter, clerk, and everything on it
      const cx0 = ox + 20, cx1 = ox + 152, cy = oy + 26;
      P.rect(cx0, cy, cx1 - cx0, 38, { w: 1.5, c: NAVY, a: 0.98, rough: 0.2, over: 0, passes: 1 }); P.line(cx0 - 4, cy, cx1 + 4, cy, { w: 2.4, c: NAVY, a: 0.98, passes: 1, over: 0, rough: 0.15 });
      for (let x = cx0 + 8; x < cx1; x += 16) { P.rect(x, cy + 6, 12, 26, { w: 0.6, c: NAVY, a: 0.85, rough: 0.12, over: 0, passes: 1 }); }
      P.hatch([[cx0, cy], [cx1, cy], [cx1, cy + 38], [cx0, cy + 38]], { ang: 80, gap: 2.2, a: 0.35, w: 0.4, c: NAVY, fade: () => 0.35, piece: 10 });
      squirrel(ox + 72, cy, 1.45, -1, 'sit');
      // wall behind: clock with an acorn hand, wanted poster, tubes and capsules, round window
      P.circle(ox + 108, oy - 66, 14, { w: 1.4, c: NAVY }); P.circle(ox + 108, oy - 66, 11.5, { w: 0.5, c: NAVY, a: 0.7, passes: 1 }); for (let i = 0; i < 12; i++) { const a = i * TAU / 12; P.line(ox + 108 + Math.cos(a) * 9.5, oy - 66 + Math.sin(a) * 9.5, ox + 108 + Math.cos(a) * 11, oy - 66 + Math.sin(a) * 11, { w: 0.5, c: NAVY, passes: 1, over: 0 }); } P.line(ox + 108, oy - 66, ox + 108, oy - 75, { w: 0.9, c: NAVY, passes: 1, over: 0 }); P.line(ox + 108, oy - 66, ox + 114, oy - 62, { w: 0.9, c: NAVY, passes: 1, over: 0 }); P.ellipse(ox + 114.6, oy - 61.4, 1.4, 1.9, { w: 0.6, c: NAVY, passes: 1, rot: 0.6 });
      P.rect(ox + 132, oy - 82, 18, 24, { w: 0.9, c: NAVY, rough: 0.2, over: 0, passes: 1 }); P.text('LOST', ox + 141, oy - 74, { size: 5.6, c: NAVY, align: 'center' }); P.text('ONE ACORN', ox + 141, oy - 67, { size: 4.4, c: NAVY, align: 'center', a: 0.9 }); P.ellipse(ox + 141, oy - 61, 2.4, 3, { w: 0.5, c: NAVY, passes: 1 });
      P.curve([[ox + 20, oy - 96], [ox + 60, oy - 92], [ox + 100, oy - 98], [ox + 150, oy - 88]], { w: 1.6, c: NAVY, a: 0.95, rough: 0.4, passes: 1 }); P.curve([[ox + 20, oy - 91], [ox + 60, oy - 87], [ox + 100, oy - 93], [ox + 150, oy - 83]], { w: 1, c: NAVY, a: 0.8, rough: 0.4, passes: 1 });
      [0.28, 0.66].forEach(f => { const q = [lerp(ox + 20, ox + 150, f), lerp(oy - 94, oy - 85, f) - 2]; P.poly([[q[0] - 6, q[1] - 2], [q[0] + 6, q[1] - 2], [q[0] + 6, q[1] + 3.6], [q[0] - 6, q[1] + 3.6]], { w: 0.7, c: NAVY, rough: 0.1, over: 0, passes: 1 }); fillPoly([[q[0] - 5, q[1] - 1], [q[0] + 5, q[1] - 1], [q[0] + 5, q[1] + 2.6], [q[0] - 5, q[1] + 2.6]], NAVY, 0.4); });
      // scale, ledger, stamp & pad, bell, candle, twine
      const sx = ox + 122, sy = cy; P.line(sx, sy, sx, sy - 22, { w: 1.2, c: NAVY, passes: 1, over: 0 }); P.line(sx - 14, sy - 20, sx + 14, sy - 20, { w: 1.1, c: NAVY, passes: 1, over: 0 }); [-14, 14].forEach(d => { P.line(sx + d, sy - 20, sx + d - 5, sy - 10, { w: 0.4, c: NAVY, passes: 1, over: 0 }); P.line(sx + d, sy - 20, sx + d + 5, sy - 10, { w: 0.4, c: NAVY, passes: 1, over: 0 }); P.arc(sx + d, sy - 10, 6, 3, 0, Math.PI, { w: 0.9, c: NAVY, passes: 1 }); }); P.ellipse(sx - 14, sy - 12, 2, 1.4, { w: 0.5, c: NAVY, passes: 1 }); P.line(sx - 6, sy, sx + 6, sy, { w: 1.6, c: NAVY, passes: 1, over: 0 });
      P.poly([[ox + 26, cy - 1], [ox + 44, cy - 2], [ox + 46, cy - 5], [ox + 28, cy - 4]], { w: 0.7, c: NAVY, rough: 0.1, over: 0, passes: 1 }); P.line(ox + 36, cy - 4, ox + 36, cy - 2, { w: 0.5, c: NAVY, passes: 1, over: 0 }); P.rect(ox + 48, cy - 5, 10, 5, { w: 0.8, c: NAVY, rough: 0.1, over: 0, passes: 1 }); fillPoly([[ox + 48, cy - 5], [ox + 58, cy - 5], [ox + 58, cy], [ox + 48, cy]], NAVY, 0.4); P.rect(ox + 51, cy - 13, 4, 8, { w: 0.8, c: NAVY, rough: 0.1, over: 0, passes: 1 }); P.circle(ox + 53, cy - 15, 2.4, { w: 0.8, c: NAVY, passes: 1 });
      P.arc(ox + 94, cy - 2, 5, 6, Math.PI, TAU, { w: 1, c: NAVY, passes: 1 }); P.line(ox + 89, cy - 2, ox + 99, cy - 2, { w: 1, c: NAVY, passes: 1, over: 0 }); P.dot(ox + 94, cy - 9, 1, { c: NAVY });
      P.rect(ox + 66, cy - 8, 3.6, 8, { w: 0.7, c: NAVY, over: 0, passes: 1 }); P.curve([[ox + 67.8, cy - 8], [ox + 69, cy - 11], [ox + 67.8, cy - 13.5]], { w: 0.6, c: NAVY, passes: 1, rough: 0.1 }); P.circle(ox + 78, cy - 3, 3.4, { w: 0.7, c: NAVY, passes: 1 }); P.circle(ox + 78, cy - 3, 1.2, { w: 0.5, c: NAVY, passes: 1 });
      envelope(ox + 138, cy - 3, 11, 6.6, -0.14, NAVY); envelope(ox + 144, cy - 8, 10, 6, 0.1, NAVY);
      // sign hanging over the counter
      P.line(ox + 40, oy - 52, ox + 40, oy - 30, { w: 0.5, c: NAVY, passes: 1, over: 0 }); P.line(ox + 96, oy - 52, ox + 96, oy - 30, { w: 0.5, c: NAVY, passes: 1, over: 0 }); P.rect(ox + 32, oy - 32, 72, 14, { w: 0.9, c: NAVY, rough: 0.15, over: 0, passes: 1 }); P.text('POSTAGE: ONE ACORN', ox + 68, oy - 22, { size: 7.4, c: NAVY, align: 'center' });
      // the floor: sacks of undelivered letters, a sleeping clerk, a barrow, a little sorter
      P.line(ox - 158, oy + 66, ox + 160, oy + 66, { w: 1.2, c: NAVY, a: 0.95, rough: 0.3, passes: 1 }); for (let k = 0; k < 20; k++) P.line(ox - 150 + k * 16, oy + 66, ox - 158 + k * 16, oy + 92, { w: 0.4, c: NAVY, a: 0.35, passes: 1, over: 0, rough: 0.3 });
      [[-118, 1.0], [-92, 0.85], [-48, 1.15], [8, 0.9]].forEach(([dx, sc], i) => { const x = ox + dx, y = oy + 78, w2 = 20 * sc, h2 = 26 * sc; const body = [[x - w2 / 2, y], [x - w2 / 2 - 2, y - h2 * 0.6], [x - w2 * 0.3, y - h2], [x + w2 * 0.3, y - h2], [x + w2 / 2 + 2, y - h2 * 0.6], [x + w2 / 2, y]]; fillPoly(body, '#f4faff', 0.85); P.curve(body, { closed: true, w: 1, c: NAVY, a: 0.95, rough: 0.25, passes: 1 }); P.line(x - w2 * 0.3, y - h2 + 4, x + w2 * 0.3, y - h2 + 4, { w: 0.6, c: NAVY, passes: 1, over: 0 }); P.curve([[x - w2 * 0.28, y - h2 + 5], [x, y - h2 + 9], [x + w2 * 0.28, y - h2 + 5]], { w: 0.5, c: NAVY, rough: 0.1, passes: 1 }); P.text(['A-F', 'G-M', 'N-S', 'T-Z'][i], x, y - h2 * 0.4, { size: 7 * sc, c: NAVY, align: 'center', a: 0.9 }); for (let k = 0; k < 3; k++) envelope(x + R(-5, 5), y - h2 - 1 + R(-1, 2), 7, 4, R(-0.6, 0.6), NAVY, false); P.hatch(body, { ang: 55, gap: 1.8, a: 0.4, w: 0.35, c: NAVY, fade: xx => Math.max(0, (xx - x) / w2 + 0.4), piece: 6 }); });
      squirrel(ox - 48, oy + 47, 0.95, 1, 'sleep'); squirrel(ox + 36, oy + 84, 1.05, -1, 'run'); squirrel(ox - 118, oy + 50, 0.85, 1, 'sit');
      // barrow
      { const x = ox + 92, y = oy + 78; P.poly([[x - 18, y - 16], [x + 14, y - 16], [x + 10, y - 4], [x - 14, y - 4]], { w: 1.1, c: NAVY, rough: 0.15, over: 0, passes: 1 }); P.circle(x + 18, y - 3, 6, { w: 1, c: NAVY, passes: 1 }); P.circle(x + 18, y - 3, 1.4, { w: 0.6, c: NAVY, passes: 1 }); P.line(x - 18, y - 16, x - 34, y - 22, { w: 1.1, c: NAVY, passes: 1, over: 0 }); P.line(x - 14, y - 4, x - 22, y + 0, { w: 1, c: NAVY, passes: 1, over: 0 }); for (let k = 0; k < 6; k++) envelope(x - 12 + k * 4.4, y - 18 - R(0, 3), 7, 4.2, R(-0.5, 0.5), NAVY, false); }
      // pneumatic tube from the ceiling to the counter, with a capsule in it
      P.path([[ox + 150, oy - 66], [ox + 150, oy - 8]], { w: 1.2, c: NAVY, passes: 1, rough: 0.1 }); P.path([[ox + 155, oy - 66], [ox + 155, oy - 8]], { w: 1.2, c: NAVY, passes: 1, rough: 0.1 }); for (let y = oy - 60; y < oy - 10; y += 14) P.line(ox + 148, y, ox + 157, y, { w: 0.9, c: NAVY, passes: 1, over: 0 });
      P.rrect(ox + 150.6, oy - 40, 4, 10, 2, { w: 0.6, c: NAVY, passes: 1, over: 0 }); P.rrect(ox + 148, oy - 10, 9, 4, 1.5, { w: 0.9, c: NAVY, passes: 1, over: 0 });
      // dust motes and lamp-glow
      for (let i = 0; i < 50; i++) { const a = R(0, TAU), r = Math.sqrt(R(0, 1)) * 160; P.dot(ox + Math.cos(a) * r, oy + Math.sin(a) * r * 0.72, 0.5, { c: '#ffffff', a: 0.95 }); }
      // outer ring
      P.ellipse(ox, oy, 172, 127, { w: 1.6, c: W, a: 0.95, passes: 2 });
      P.text('SQUIRREL POST OFFICE, SECTION', ox, oy + 162, { size: 12, c: W, align: 'center', font: S.HAND, a: 0.95 });
    }


    /* ================= 9. THE SEED ARCHIVE under the roots: vault hall, cart tunnel, germination lab ================= */
    const mole = (x, y, s, dir) => {
      const T = (u, v) => [x + u * s * dir, y + v * s];
      const body = [T(-9, 0), T(-10, -9), T(-6, -17), T(2, -19), T(9, -14), T(11, -6), T(9, 0)];
      fillPoly(body, NAVY, 0.9); P.curve(body, { closed: true, w: 0.9, c: NAVY, a: 0.98, rough: 0.2, passes: 1 });
      P.poly([T(9, -14), T(17, -11), T(9, -9)], { w: 0.8, c: NAVY, rough: 0.1, over: 0, passes: 1 }); fillPoly([T(9, -14), T(17, -11), T(9, -9)], NAVY, 0.9); disc(...T(17, -11), 1 * s, '#e8f4ff', 0.95);
      const e1 = T(6, -13.4); P.circle(e1[0], e1[1], 2.4 * s, { w: 0.6, c: '#e8f4ff', a: 0.95, passes: 1 }); P.circle(e1[0] + 4.6 * s * dir, e1[1] + 0.4 * s, 2.4 * s, { w: 0.6, c: '#e8f4ff', a: 0.95, passes: 1 }); P.line(e1[0] + 2.4 * s * dir, e1[1], e1[0] + 2.2 * s * dir + 0.1, e1[1], { w: 0.6, c: '#e8f4ff', passes: 1, over: 0 });
      for (let k = 0; k < 3; k++) P.line(...T(9 + k * 1.4, -4 + k * 2), ...T(13 + k * 1.6, -2 + k * 2.4), { w: 0.9, c: NAVY, a: 0.95, passes: 1, over: 0, rough: 0.1 });
      P.line(...T(-6, 0), ...T(-8, 3), { w: 1.2, c: NAVY, passes: 1, over: 0 }); P.line(...T(4, 0), ...T(6, 3), { w: 1.2, c: NAVY, passes: 1, over: 0 });
    };
    const drawer = (x, y, w, h, seed) => { P.path([[x, y + h], [x, y], [x + w, y], [x + w, y + h]], { w: 0.6, c: NAVY, a: 0.95, rough: 0.1, passes: 1 }); P.line(x, y + h, x + w, y + h, { w: 0.8, c: NAVY, passes: 1, over: 0, rough: 0.1 }); P.rect(x + w * 0.22, y + h * 0.16, w * 0.56, h * 0.36, { w: 0.35, c: NAVY, a: 0.8, over: 0, passes: 1 }); const kx = x + w / 2, ky = y + h * 0.72; P.circle(kx, ky, 0.9, { w: 0.5, c: NAVY, passes: 1 }); if (seed % 3 === 0) P.dot(kx, y + h * 0.34, 0.7, { c: NAVY }); else if (seed % 3 === 1) P.ellipse(kx, y + h * 0.34, 1.3, 0.7, { w: 0.35, c: NAVY, passes: 1 }); else { P.dot(kx - 1, y + h * 0.34, 0.6, { c: NAVY }); P.dot(kx + 1, y + h * 0.34, 0.6, { c: NAVY }); } };
    const hall = (pts, cavity) => { P.occlude(pts, BLUE); P.wash(pts, PALE, 1, { edge: 0, jit: 0, steps: 1 }); const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); P.wash(pts, '#ffffff', 0.5, { edge: 0, jit: 0, steps: 1, grad: { x0: 0, y0: Math.min(...ys), x1: 0, y1: Math.max(...ys), c0: '#ffffff', c1: PALE2, a0: 0.75, a1: 0.15 } }); };
    const seedIcon = (x, y, k, c = NAVY) => { if (k === 0) { P.ellipse(x, y, 2.4, 1.4, { w: 0.5, c, passes: 1 }); P.line(x - 1.6, y, x + 1.6, y, { w: 0.3, c, passes: 1, over: 0 }); } else if (k === 1) { P.ellipse(x, y, 1.8, 2.6, { w: 0.5, c, passes: 1 }); P.ellipse(x, y, 1, 1.6, { w: 0.3, c, a: 0.7, passes: 1 }); } else if (k === 2) { P.poly([[x, y - 3], [x + 1.8, y + 1.6], [x - 1.8, y + 1.6]], { w: 0.5, c, over: 0, passes: 1 }); } else { P.circle(x, y, 1.6, { w: 0.5, c, passes: 1 }); P.dot(x, y, 0.6, { c }); } };

    // ---- left hall: the vault of drawers ----
    { const hallL = [[58, 957], [58, 890], [76, 866], [110, 852], [250, 846], [390, 852], [424, 866], [440, 890], [440, 957]];
      hall(hallL);
      // barrel-vault ribs
      for (let i = 0; i < 9; i++) { const x = 90 + i * 40; P.curve([[x, 853 - Math.abs(i - 4) * -1.2], [x + 2, 858], [x + 6, 866]], { w: 0.5, c: NAVY, a: 0.55, rough: 0.3, passes: 1 }); }
      // wall of drawers, three tiers, with ladder on a rail and a reading shelf
      for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 15; c2++) drawer(118 + c2 * 20.6, 861 + r * 21, 19.4, 20, r * 5 + c2);
      P.line(112, 860, 440, 860, { w: 1, c: NAVY, a: 0.9, passes: 1, over: 0, rough: 0.15 }); P.line(112, 946, 424, 946, { w: 1.6, c: NAVY, a: 0.95, passes: 1, over: 0, rough: 0.15 });
      P.line(300, 856, 316, 946, { w: 1.4, c: NAVY, passes: 1, over: 0 }); P.line(310, 856, 326, 946, { w: 1.4, c: NAVY, passes: 1, over: 0 }); for (let k = 0; k < 9; k++) P.line(300 + k * 1.75, 856 + k * 11.2, 310 + k * 1.75, 856 + k * 11.2, { w: 0.8, c: NAVY, passes: 1, over: 0 });
      mole(310, 946, 1.5, -1); P.line(322, 928, 331, 918, { w: 0.9, c: NAVY, passes: 1, over: 0 }); P.circle(334, 914, 4, { w: 0.8, c: NAVY, passes: 1 }); disc(334, 914, 3.4, '#ffffff', 0.9); glow(334, 914, 20, 0.6, 5);
      // vault door
      P.occlude(Array.from({ length: 20 }, (_, i) => [86 + Math.cos(i * TAU / 20) * 33, 906 + Math.sin(i * TAU / 20) * 33]), BLUE);
      P.circle(86, 906, 33, { w: 2, c: W, a: 0.98, passes: 2 }); P.circle(86, 906, 28, { w: 0.9, c: W, a: 0.8, passes: 1 }); P.circle(86, 906, 10, { w: 1.4, c: W, a: 0.95, passes: 1 }); for (let i = 0; i < 12; i++) { const a = i * TAU / 12; P.dot(86 + Math.cos(a) * 30.6, 906 + Math.sin(a) * 30.6, 1.1, { c: W }); } for (let i = 0; i < 6; i++) { const a = i * TAU / 6; P.line(86 + Math.cos(a) * 10, 906 + Math.sin(a) * 10, 86 + Math.cos(a) * 25, 906 + Math.sin(a) * 25, { w: 1.4, c: W, a: 0.95, passes: 1, over: 0 }); P.circle(86 + Math.cos(a) * 25, 906 + Math.sin(a) * 25, 2.2, { w: 0.9, c: W, passes: 1 }); }
      P.hatch(Array.from({ length: 20 }, (_, i) => [86 + Math.cos(i * TAU / 20) * 33, 906 + Math.sin(i * TAU / 20) * 33]), { ang: -50, gap: 2.2, a: 0.35, w: 0.4, c: W, fade: x => Math.max(0, (x - 76) / 40) });
      P.text('GERMINAL VAULT', 250, 842, { size: 8.4, c: W, align: 'center', a: 0.95 });
      P.path(hallL.concat([hallL[0]]), { w: 2, c: W, a: 0.98, rough: 0.5, passes: 2 });
    }
    // ---- right hall: germination laboratory ----
    { const hallR = [[1236, 957], [1236, 890], [1254, 866], [1290, 852], [1390, 846], [1490, 852], [1524, 866], [1540, 890], [1540, 957]];
      hall(hallR);
      // shelves of seed jars with contents
      [868, 892].forEach((y, i) => { P.line(1250, y + 14, 1360, y + 14, { w: 1.2, c: NAVY, passes: 1, over: 0, rough: 0.15 }); for (let k = 0; k < 6; k++) { const x = 1256 + k * 17.5; P.rect(x, y, 13, 14, { w: 0.7, c: NAVY, rough: 0.1, over: 0, passes: 1 }); P.rect(x + 1.5, y - 2.4, 10, 2.4, { w: 0.6, c: NAVY, rough: 0.1, over: 0, passes: 1 }); fillPoly([[x + 0.6, y + 5], [x + 12.4, y + 5], [x + 12.4, y + 13.4], [x + 0.6, y + 13.4]], NAVY, 0.22); for (let q = 0; q < 4; q++) seedIcon(x + 3 + (q % 2) * 6, y + 7 + Math.floor(q / 2) * 4.4, (k + q) % 4); } });
      // potted seedlings of increasing age
      for (let k = 0; k < 9; k++) { const x = 1262 + k * 27, y = 943; P.path([[x - 6, y - 13], [x - 4.6, y], [x + 4.6, y], [x + 6, y - 13]], { w: 0.9, c: NAVY, rough: 0.12, passes: 1 }); P.line(x - 7, y - 13, x + 7, y - 13, { w: 0.9, c: NAVY, passes: 1, over: 0 }); fillPoly([[x - 6, y - 13], [x + 6, y - 13], [x + 4.6, y], [x - 4.6, y]], NAVY, 0.16); const h = 5 + k * 3.2; P.curve([[x, y - 13], [x + R(-1, 1), y - 13 - h * 0.5], [x + R(-1.5, 1.5), y - 13 - h]], { w: 0.8, c: NAVY, rough: 0.2, passes: 1 }); const nl = Math.min(6, 1 + Math.floor(k * 0.7)); for (let l = 0; l < nl; l++) { const ly = y - 13 - h * (0.25 + l * 0.14), sg = l % 2 ? 1 : -1; P.leaf(x, ly, sg > 0 ? -0.5 : Math.PI + 0.5, 3.4 + k * 0.5, 1.8 + k * 0.2, { c: NAVY, w: 0.5, simple: k < 3, a: 0.9, veins: 1 }); } }
      P.line(1246, 944, 1532, 944, { w: 1.6, c: NAVY, a: 0.95, passes: 1, over: 0, rough: 0.15 });
      // glass jar with a bean showing root & shoot, microscope, hanging grow-lamps with glow
      { const jx = 1392, jy = 868; P.path([[jx - 12, jy], [jx - 12, jy + 34], [jx + 12, jy + 34], [jx + 12, jy]], { w: 1, c: NAVY, rough: 0.12, passes: 1 }); P.ellipse(jx, jy, 12, 3, { w: 0.8, c: NAVY, passes: 1 }); P.ellipse(jx - 3, jy + 8, 3.6, 2.4, { w: 0.8, c: NAVY, passes: 1, rot: 0.4 }); disc(jx - 3, jy + 8, 3.4, NAVY, 0.6); P.curve([[jx - 5, jy + 9], [jx - 8, jy + 18], [jx - 5, jy + 28], [jx - 6, jy + 33]], { w: 0.7, c: NAVY, rough: 0.3, passes: 1 }); for (let k = 0; k < 7; k++) P.line(jx - 6, jy + 13 + k * 3, jx - 6 + R(-5, 5), jy + 15 + k * 3, { w: 0.4, c: NAVY, a: 0.8, passes: 1, over: 0, rough: 0.2 }); P.curve([[jx - 2, jy + 7], [jx + 2, jy - 2], [jx + 1, jy - 10]], { w: 0.8, c: NAVY, rough: 0.2, passes: 1 }); P.leaf(jx + 1, jy - 10, -0.4, 6, 2.4, { c: NAVY, w: 0.5, a: 0.9, veins: 2 }); P.leaf(jx + 1, jy - 9, Math.PI + 0.4, 6, 2.4, { c: NAVY, w: 0.5, a: 0.9, veins: 2 }); }
      [[1440, 850], [1500, 850]].forEach(([x, y]) => { P.line(x, 846, x, y + 4, { w: 0.6, c: NAVY, passes: 1, over: 0 }); P.arc(x, y + 8, 9, 6, Math.PI, TAU, { w: 1, c: NAVY, passes: 1 }); P.line(x - 9, y + 8, x + 9, y + 8, { w: 1, c: NAVY, passes: 1, over: 0 }); glow(x, y + 16, 22, 0.55, 6); for (let k = -1; k <= 1; k++) P.line(x + k * 4, y + 9, x + k * 8, y + 30, { w: 0.35, c: '#ffffff', a: 0.9, passes: 1, over: 0 }); });
      { const mx2 = 1470, my2 = 942; P.line(mx2 - 10, my2, mx2 + 10, my2, { w: 1.6, c: NAVY, passes: 1, over: 0 }); P.path([[mx2 - 5, my2], [mx2 - 5, my2 - 8], [mx2 - 3, my2 - 20], [mx2 + 3, my2 - 26], [mx2 + 7, my2 - 20], [mx2 + 5, my2 - 10]], { w: 1.2, c: NAVY, rough: 0.12, passes: 1 }); P.line(mx2 + 3, my2 - 26, mx2 - 2, my2 - 32, { w: 2.4, c: NAVY, passes: 1, over: 0 }); P.circle(mx2 + 1, my2 - 8, 3, { w: 0.8, c: NAVY, passes: 1 }); }
      mole(1503, 944, 1.15, -1); P.text('GERMINATION LAB', 1388, 842, { size: 8.4, c: W, align: 'center', a: 0.95 });
      P.path(hallR.concat([hallR[0]]), { w: 2, c: W, a: 0.98, rough: 0.5, passes: 2 });
    }
    // ---- the cart tunnel that runs beneath the roots, joining vault, stair and lab ----
    { const tun = [[440, 936], [440, 896], [520, 892], [700, 890], [770, 886], [830, 886], [900, 890], [1080, 892], [1236, 896], [1236, 936]];
      hall(tun);
      for (let x = 470; x < 1236; x += 44) { P.curve([[x, 896 + Math.sin(x) * 0], [x + 3, 902], [x + 8, 912]], { w: 0.4, c: NAVY, a: 0.5, rough: 0.3, passes: 1 }); }
      // rails, ties, and a cart of seed jars
      P.line(440, 930, 1236, 930, { w: 1.4, c: NAVY, a: 0.95, passes: 1, over: 0, rough: 0.3 }); P.line(440, 934, 1236, 934, { w: 0.8, c: NAVY, a: 0.7, passes: 1, over: 0, rough: 0.3 }); for (let x = 446; x < 1236; x += 9) P.line(x, 930, x - 2, 935, { w: 0.9, c: NAVY, a: 0.7, passes: 1, over: 0, rough: 0.1 });
      { const cx = 930, cy = 928; P.poly([[cx - 26, cy - 22], [cx + 26, cy - 22], [cx + 20, cy - 4], [cx - 20, cy - 4]], { w: 1.3, c: NAVY, rough: 0.15, over: 0, passes: 1 }); P.circle(cx - 14, cy - 1, 4, { w: 1, c: NAVY, passes: 1 }); P.circle(cx + 14, cy - 1, 4, { w: 1, c: NAVY, passes: 1 }); P.circle(cx - 14, cy - 1, 1, { w: 0.6, c: NAVY, passes: 1 }); P.circle(cx + 14, cy - 1, 1, { w: 0.6, c: NAVY, passes: 1 }); for (let k = 0; k < 5; k++) { const jx = cx - 22 + k * 10; P.rect(jx, cy - 34, 7, 12, { w: 0.7, c: NAVY, rough: 0.1, over: 0, passes: 1 }); fillPoly([[jx, cy - 28], [jx + 7, cy - 28], [jx + 7, cy - 22], [jx, cy - 22]], NAVY, 0.3); P.rect(jx + 1, cy - 36, 5, 2, { w: 0.5, c: NAVY, over: 0, passes: 1 }); } P.line(cx + 26, cy - 22, cx + 36, cy - 16, { w: 0.9, c: NAVY, passes: 1, over: 0 }); P.line(cx - 26, cy - 22, cx - 34, cy - 16, { w: 0.9, c: NAVY, passes: 1, over: 0 }); }
      // lanterns hanging from the ceiling, earthworm porter, dangling roots
      [520, 620, 700, 900, 1020, 1120, 1190].forEach(x => { lantern(x, 906, 0.62, 12, false); P.line(x, 892, x, 894, { w: 0.4, c: NAVY, passes: 1, over: 0 }); });
      { const wx = 600, wy = 922; const w2 = []; for (let k = 0; k <= 12; k++) w2.push([wx + k * 4.6, wy - Math.sin(k * 0.7) * 3 - k * 0.1]); P.curve(w2, { w: 2.6, c: NAVY, a: 0.9, rough: 0.2, passes: 1 }); P.line(w2[8][0] - 1, w2[8][1] - 2, w2[8][0] + 1, w2[8][1] + 2, { w: 0.7, c: '#e8f4ff', passes: 1, over: 0 }); P.rect(w2[6][0] - 5, w2[6][1] - 9, 9, 7, { w: 0.8, c: NAVY, over: 0, passes: 1 }); P.dot(w2[12][0] + 1.4, w2[12][1] - 0.6, 0.7, { c: '#e8f4ff' }); }
      for (let k = 0; k < 7; k++) { const x = R(480, 1200); if (Math.abs(x - 800) < 70) continue; const hh = R(8, 20); P.curve([[x, 890], [x + R(-3, 3), 890 + hh * 0.6], [x + R(-5, 5), 890 + hh]], { w: 0.5, c: NAVY, a: 0.7, rough: 0.4, passes: 1 }); for (let q = 0; q < 3; q++) P.line(x + R(-2, 2), 890 + hh * (0.3 + q * 0.2), x + R(-6, 6), 890 + hh * (0.4 + q * 0.2) + 2, { w: 0.3, c: NAVY, a: 0.6, passes: 1, over: 0 }); }
      // the shaft up to the stair door
      P.occlude([[788, 886], [812, 886], [812, 830], [788, 830]], BLUE); P.wash([[788, 886], [812, 886], [812, 830], [788, 830]], PALE, 1, { edge: 0, jit: 0, steps: 1 }); P.line(788, 830, 788, 886, { w: 1.4, c: W, passes: 1, over: 0 }); P.line(812, 830, 812, 886, { w: 1.4, c: W, passes: 1, over: 0 }); for (let y = 836; y < 886; y += 7) P.line(790, y, 810, y, { w: 0.6, c: NAVY, a: 0.7, passes: 1, over: 0 }); P.line(790, 890, 810, 890, { w: 0.01, c: NAVY, a: 0, passes: 1 });
      P.text('TO THE GREAT STAIR', 800, 958, { size: 8, c: W, align: 'center', a: 0.9 }); P.text('MIND THE WORM', 640, 958, { size: 7.4, c: W, align: 'center', a: 0.85 });
      P.path(tun.concat([tun[0]]), { w: 1.6, c: W, a: 0.95, rough: 0.5, passes: 2 });
    }


    /* ================= 10. title cartouche, index of rooms, specimens, small creatures and notes ================= */
    const panel = (x0, y0, x1, y1, fill = true) => { const poly = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; P.occlude(poly, BLUE); P.wash(poly, '#1a4a8e', 0.5, { edge: 0, jit: 0, steps: 1 }); P.rect(x0, y0, x1 - x0, y1 - y0, { w: 1.6, c: W, a: 0.98, rough: 0.4, passes: 2, over: 1 }); P.rect(x0 + 4, y0 + 4, x1 - x0 - 8, y1 - y0 - 8, { w: 0.5, c: MID, a: 0.75, rough: 0.3, passes: 1, over: 0 }); [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].forEach(([x, y, sx, sy]) => { P.leaf(x + sx * 5, y + sy * 5, Math.atan2(sy, sx), 15, 4.4, { w: 0.7, a: 0.9, veins: 2 }); P.circle(x + sx * 4, y + sy * 4, 2.2, { w: 0.8, c: W, passes: 1 }); }); };
    // title
    panel(1268, 58, 1548, 150);
    P.text('ARBOR BIBLIOTHECA', 1408, 100, { size: 24, c: W, align: 'center', font: S.HAND, a: 0.98, ls: 1 });
    P.line(1300, 110, 1516, 110, { w: 0.8, c: MID, a: 0.85, passes: 1, over: 0, rough: 0.3 }); P.text('THE LIBRARY TREE', 1408, 128, { size: 13, c: MID, align: 'center', a: 0.95, ls: 2 });
    P.text('PLATE VII', 1408, 78, { size: 10, c: MID, align: 'center', a: 0.9, ls: 3 }); P.text('CYANOTYPE  -  MMXXVI', 1408, 142, { size: 8, c: MID, align: 'center', a: 0.8 });
    // emblem: an open book sprouting a leaf, left of the title
    { const ex = 1298, ey = 118; P.curve([[ex - 12, ey + 6], [ex - 6, ey + 1], [ex, ey + 5]], { w: 0.9, c: W, rough: 0.1, passes: 1 }); P.curve([[ex + 12, ey + 6], [ex + 6, ey + 1], [ex, ey + 5]], { w: 0.9, c: W, rough: 0.1, passes: 1 }); P.line(ex - 12, ey + 6, ex - 12, ey + 12, { w: 0.7, c: W, passes: 1, over: 0 }); P.line(ex + 12, ey + 6, ex + 12, ey + 12, { w: 0.7, c: W, passes: 1, over: 0 }); P.line(ex - 12, ey + 12, ex, ey + 9, { w: 0.7, c: W, passes: 1, over: 0 }); P.line(ex + 12, ey + 12, ex, ey + 9, { w: 0.7, c: W, passes: 1, over: 0 }); P.curve([[ex, ey + 5], [ex + 1, ey - 5], [ex - 1, ey - 12]], { w: 0.8, c: W, rough: 0.2, passes: 1 }); P.leaf(ex - 1, ey - 12, -1.0, 12, 4.5, { w: 0.7, a: 0.95, veins: 3 }); P.leaf(ex, ey - 6, Math.PI + 0.7, 9, 3.6, { w: 0.7, a: 0.9, veins: 2 }); }
    // index of rooms
    panel(58, 238, 268, 400);
    P.text('INDEX OF ROOMS', 163, 260, { size: 12, c: W, align: 'center', font: S.HAND, a: 0.98 }); P.line(78, 267, 248, 267, { w: 0.6, c: MID, a: 0.8, passes: 1, over: 0, rough: 0.3 });
    ['POETRY ROOM', 'CARTOGRAPHY', 'OBSERVATORY', 'HERBARIUM', 'CONSORT HALL', 'LITTLE READERS', 'SILENCE'].forEach((nm, i) => { const y = 284 + i * 15; P.circle(80, y - 3.5, 6, { w: 0.7, c: W, passes: 1 }); P.text(String(i + 1), 80, y - 0.5, { size: 7.5, c: W, align: 'center' }); P.text(nm, 94, y, { size: 8.6, c: W, a: 0.95 }); P.dashed(94 + P.measure(nm, 8.6) + 4, y - 2, 246, y - 2, [1.5, 2.5], { w: 0.4, c: MID, a: 0.6 }); });
    P.text('PLATES I-IV: ROOMS MAGNIFIED', 163, 392, { size: 7, c: MID, align: 'center', a: 0.85 });
    // specimens
    panel(1270, 160, 1398, 250); P.text('FOLIUM LIBRI', 1334, 176, { size: 8.4, c: W, align: 'center', a: 0.95 });
    { const lx = 1284, ly = 220; P.leaf(lx, ly, -0.35, 92, 22, { w: 1.1, a: 0.98, veins: 6 }); const m = [lx + 92 * Math.cos(-0.35), ly + 92 * Math.sin(-0.35)]; for (let k = 0; k < 14; k++) { const t2 = k / 14, px = lx + 92 * t2 * Math.cos(-0.35), py = ly + 92 * t2 * Math.sin(-0.35); P.line(px, py, px + 6 * Math.cos(-1.4), py + 6 * Math.sin(-1.4) * 1, { w: 0.3, c: MID, a: 0.6, passes: 1, over: 0 }); } P.line(lx, ly, lx - 8, ly + 8, { w: 1, c: W, passes: 1, over: 0 }); P.text('PAGE-SHAPED,', 1334, 242, { size: 6.6, c: MID, align: 'center', a: 0.9 }); void m; }
    panel(1402, 160, 1546, 250); P.text('SEMEN & FRUCTUS', 1474, 176, { size: 8.4, c: W, align: 'center', a: 0.95 });
    { const sx = 1430, sy = 218; P.ellipse(sx, sy, 13, 18, { w: 1.2, c: W, a: 0.98 }); P.ellipse(sx, sy, 8, 12, { w: 0.6, c: MID, a: 0.8, passes: 1 }); P.curve([[sx, sy - 10], [sx + 2, sy], [sx, sy + 10]], { w: 0.6, c: W, rough: 0.2, passes: 1 }); P.dot(sx - 3, sy - 2, 1.6, { c: W }); P.text('SEED', sx, sy + 32, { size: 6.4, c: MID, align: 'center' });
      P.line(sx + 20, sy - 6, sx + 26, sy - 6, { w: 0.4, c: MID, a: 0.7, passes: 1, over: 0 });
      const bx = 1494, by = 232; P.line(bx, by - 46, bx, by - 30, { w: 0.8, c: W, passes: 1, over: 0 }); P.poly([[bx - 14, by - 30], [bx + 14, by - 30], [bx + 14, by + 4], [bx - 14, by + 4]], { w: 1.2, c: W, rough: 0.2, over: 0, passes: 1 }); P.line(bx - 10, by - 29, bx - 10, by + 3, { w: 0.7, c: W, passes: 1, over: 0 }); for (let q = 0; q < 6; q++) P.line(bx - 6, by - 24 + q * 5, bx + 11, by - 24 + q * 5, { w: 0.4, c: MID, a: 0.75, passes: 1, over: 0 }); P.line(bx - 14, by + 4, bx - 16, by + 7, { w: 0.6, c: W, passes: 1, over: 0 }); for (let q = 0; q < 4; q++) P.line(bx - 13 + q * 0.6, by + 5 - q, bx + 13 + q * 0.6, by + 5 - q, { w: 0.25, c: MID, a: 0.6, passes: 1, over: 0 }); P.text('BOOK-FRUIT', bx, by + 20, { size: 6.4, c: MID, align: 'center' }); }
    // creatures
    const owl = (x, y, sc) => { const T = (u, v) => [x + u * sc, y + v * sc]; P.occlude(Array.from({ length: 16 }, (_, i) => [x + Math.cos(i * TAU / 16) * 17 * sc, y - 10 * sc + Math.sin(i * TAU / 16) * 22 * sc]), BLUE); P.ellipse(...T(0, -8), 12 * sc, 17 * sc, { w: 1.3, c: W, a: 0.98 }); P.poly([T(-9, -22), T(-6, -30), T(-2, -23)], { w: 1, c: W, rough: 0.1, over: 0, passes: 1 }); P.poly([T(9, -22), T(6, -30), T(2, -23)], { w: 1, c: W, rough: 0.1, over: 0, passes: 1 }); [[-5, -14], [5, -14]].forEach(([u, v]) => { P.circle(...T(u, v), 4.6 * sc, { w: 1, c: W, passes: 1 }); P.circle(...T(u, v), 2.2 * sc, { w: 0.8, c: W, passes: 1 }); disc(...T(u, v), 1.3 * sc, W, 0.95); }); P.poly([T(-2, -10), T(2, -10), T(0, -6)], { w: 0.8, c: W, over: 0, passes: 1 }); for (let k = 0; k < 5; k++) P.curve([T(-7 + k * 3.5, -3), T(-7 + k * 3.5, 0), T(-6 + k * 3.5, 3)], { w: 0.5, c: W, a: 0.8, rough: 0.1, passes: 1 }); for (let k = 0; k < 3; k++) P.curve([T(-8 + k * 3, 4), T(-7 + k * 3, 7), T(-8 + k * 3, 10)], { w: 0.4, c: W, a: 0.6, rough: 0.1, passes: 1 }); P.line(...T(-6, 9), ...T(-7, 13), { w: 1, c: W, passes: 1, over: 0 }); P.line(...T(6, 9), ...T(7, 13), { w: 1, c: W, passes: 1, over: 0 }); P.line(...T(-10, -14), ...T(10, -14), { w: 0.01, c: W, a: 0, passes: 1 }); P.line(...T(-4, -14), ...T(4, -14), { w: 0.7, c: W, passes: 1, over: 0 }); P.hatch(P.sample([T(0, -25), T(11, -8), T(0, 8), T(-11, -8)], true, 3), { ang: 70, gap: 1.8, a: 0.5, w: 0.4, c: W, fade: xx => Math.max(0, (xx - x) / (12 * sc) + 0.3) }); };
    owl(704, 186, 1.05);
    // bookworm on an open book at the roots
    { const bx = 640, by = 823; P.curve([[bx - 22, by], [bx - 10, by - 6], [bx, by - 1], [bx + 10, by - 6], [bx + 22, by]], { w: 1, c: W, rough: 0.1, passes: 1 }); P.curve([[bx - 22, by], [bx - 10, by - 2], [bx, by + 2]], { w: 0.8, c: W, rough: 0.1, passes: 1 }); P.curve([[bx + 22, by], [bx + 10, by - 2], [bx, by + 2]], { w: 0.8, c: W, rough: 0.1, passes: 1 }); P.line(bx, by - 1, bx, by + 2, { w: 0.6, c: W, passes: 1, over: 0 }); for (let q = 0; q < 4; q++) { P.line(bx - 18 + q * 2, by - 2 - q * 0.5, bx - 3, by - 3 - q * 0.6, { w: 0.25, c: MID, a: 0.65, passes: 1, over: 0 }); P.line(bx + 18 - q * 2, by - 2 - q * 0.5, bx + 3, by - 3 - q * 0.6, { w: 0.25, c: MID, a: 0.65, passes: 1, over: 0 }); }
      for (let k = 0; k < 6; k++) { const cx = bx + 6 + k * 5, cy = by - 9 - Math.sin(k * 0.9) * 4; P.circle(cx, cy, 3.4, { w: 0.9, c: W, passes: 1 }); disc(cx, cy, 3, W, 0.25); P.line(cx, cy + 3, cx + 0.4, cy + 5.5, { w: 0.5, c: W, passes: 1, over: 0 }); } P.circle(bx + 37, by - 12.5, 4, { w: 1, c: W, passes: 1 }); P.dot(bx + 38.4, by - 13.4, 0.8, { c: W }); P.line(bx + 39, by - 16, bx + 41, by - 20, { w: 0.6, c: W, passes: 1, over: 0 }); P.circle(bx + 41.4, by - 20.4, 0.8, { w: 0.5, c: W, passes: 1 }); }
    // snail with a tiny book on its shell, climbing the trunk (snail mail)
    { const sx = 746, sy = 640; P.curve([[sx - 6, sy + 18], [sx - 2, sy + 4], [sx, sy - 8]], { w: 1.8, c: W, a: 0.9, rough: 0.2, passes: 1 }); P.line(sx - 1, sy - 8, sx - 4, sy - 14, { w: 0.6, c: W, passes: 1, over: 0 }); P.line(sx + 2, sy - 8, sx + 5, sy - 13, { w: 0.6, c: W, passes: 1, over: 0 }); P.circle(sx + 5, sy - 13.6, 0.9, { w: 0.5, c: W, passes: 1 }); P.circle(sx - 4, sy - 14.6, 0.9, { w: 0.5, c: W, passes: 1 }); P.circle(sx + 9, sy + 4, 8, { w: 1.1, c: W }); { const sp = []; for (let a = 0; a < 3.6 * TAU; a += 0.3) sp.push([sx + 9 + Math.cos(a) * (0.6 + a * 0.36), sy + 4 + Math.sin(a) * (0.6 + a * 0.36)]); P.path(sp, { w: 0.5, c: W, a: 0.85, rough: 0.1, passes: 1 }); } P.poly([[sx + 6, sy - 5], [sx + 14, sy - 6], [sx + 14, sy - 1], [sx + 6, sy]], { w: 0.7, c: W, rough: 0.1, over: 0, passes: 1 }); P.line(sx + 6, sy - 2.5, sx + 14, sy - 3.5, { w: 0.3, c: W, passes: 1, over: 0 }); }
    // a mouse reading beneath the tunnel lantern, and fireflies gathered as reading lights
    { const mx = 1120, my = 921; P.ellipse(mx, my - 4, 5, 3.4, { w: 0.9, c: NAVY, passes: 1 }); disc(mx, my - 4, 4.6, NAVY, 0.55); P.circle(mx + 5, my - 6, 2.4, { w: 0.8, c: NAVY, passes: 1 }); P.circle(mx + 4.4, my - 8.6, 1.4, { w: 0.6, c: NAVY, passes: 1 }); P.curve([[mx - 5, my - 3], [mx - 10, my - 2], [mx - 13, my - 5]], { w: 0.6, c: NAVY, rough: 0.1, passes: 1 }); P.poly([[mx + 4, my - 4], [mx + 9, my - 5.5], [mx + 9, my - 1], [mx + 4, my - 0.4]], { w: 0.6, c: NAVY, over: 0, passes: 1 }); }
    // notes with leaders (engraver's marginalia)
    const bf = fruits.reduce((b, f) => (Math.hypot(f[0] - 640, f[1] - 130) < Math.hypot(b[0] - 640, b[1] - 130) ? f : b), fruits[0] || [640, 130]);
    P.note('BOOK-FRUIT, RIPE IN OCTOBER', 380, 72, bf[0], bf[1] + 16, { size: 12, c: W });
    P.note('OWL: HEAD LIBRARIAN', 690, 146, 704, 170, { size: 11, c: W });
    P.note('BOOKWORM (HARMLESS)', 558, 862 - 20, 668, 812, { size: 10, c: W, a: 0.95 });
    P.note('SNAIL MAIL (SLOW)', 618, 606, 742, 636, { size: 10, c: W });
    P.note('LANTERN BUNTING', 470, 566, 610, 508, { size: 10, c: W });
    P.note('THE GREAT STAIR - 1,214 STEPS', 640, 520, 758, 560, { size: 10, c: W });
    P.note('ZIP-LINE LETTER BASKETS', 1010, 470, 1000, 500, { size: 10, c: W });
    P.text('ROOTS: SEED ARCHIVE, 4 LEVELS DEEP', 800, 968 - 3, { size: 8, c: MID, align: 'center', a: 0.8 });

    /*__SECTIONS__*/
  }
});
