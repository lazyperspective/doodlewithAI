/* SHEET 8 — A Gothic cathedral in longitudinal section, with a transverse section and details. Sepia ink & wash. */
(window.SCENES = window.SCENES || []).push({
  name: 'Cathedral', seed: 83, ink: '#3a2a1c', theme: 'sepia',
  build(P, n, t) {
    const S = Sketch, TAU = S.TAU, lerp = S.lerp;
    const INK = '#3a2a1c', DARK = '#4d3826', STONE = '#d9c39c', SHADE = '#a88b63', TIMBER = '#b98543', LEAD = '#7a7064', GLASS = '#e8c982';
    const SC = 8.4, X = m => 70 + m * SC, Y = h => 762 - h * SC;          // metres → sheet space (longitudinal section)
    const R = (a, b) => P.r(a, b);
    P.frame('CATHEDRAL OF ST. AUBERT', 'SECTIONS AND DETAILS', n, t, { scale: 'SCALE 1:120  (10 M BAR)', note: 'sepia ink and wash on laid paper' });

    /* ---- helpers ---- */
    const pointed = (x0, x1, ys, rise, k = 1) => {                        // two-centred pointed arch, returns outline samples
      const w = x1 - x0, Rr = (w * w / 4 + rise * rise) / w, pts = [];
      const cxL = x0 + Rr, cxR = x1 - Rr, ta = Math.atan2(rise, (x0 + x1) / 2 - cxL);
      for (let i = 0; i <= 14; i++) { const th = Math.PI + (ta - Math.PI) * i / 14; pts.push([cxL + Rr * Math.cos(th), ys - Rr * Math.sin(th)]); }
      for (let i = 13; i >= 0; i--) { const th = Math.PI + (ta - Math.PI) * i / 14; pts.push([2 * (x0 + x1) / 2 - (cxL + Rr * Math.cos(th)), ys - Rr * Math.sin(th)]); }
      return pts;
    };
    const arcLine = (x0, x1, ys, rise, o = {}) => P.path(pointed(x0, x1, ys, rise), Object.assign({ w: 1, c: INK, a: 0.9, rough: 0.35, passes: 1 }, o));
    const poche = (poly, a = 0.78) => { P.wash(poly, '#4a3524', a, { edge: 0, jit: 0.4, steps: 2 }); P.hatch(poly, { ang: 45, gap: 2.2, a: 0.5, w: 0.5, c: INK, ragged: 0.4, inset: 0.4 }); };
    const tone = (poly, c, a) => P.wash(poly, c, a, { edge: 0.4, jit: 0.5, steps: 3 });
    const rectp = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    const disc = (x, y, r, c, a = 0.9) => P.wash(Array.from({ length: 12 }, (_, i) => [x + Math.cos(i * TAU / 12) * r, y + Math.sin(i * TAU / 12) * r]), c, a, { edge: 0, jit: 0.15, steps: 1 });

    /* ---- paper-tone sky behind the section and the ground ---- */
    P.wash(rectp(48, 48, 1552, 866), '#efd9a8', 0.4, { grad: { x0: 0, y0: 48, x1: 0, y1: 866, c0: '#e9c98f', c1: '#f4ead2', a0: 0.5, a1: 0.05 }, edge: 0, jit: 0.4, steps: 3 });
    const bay = [3.0, 11.4, 19.8, 28.2, 36.6, 45.0], choir = [57.0, 65.4, 73.8, 82.2];

    /* ================= 1. earth, foundations, ground line ================= */
    { const g0 = Y(0), earth = rectp(52, g0, 918, 862);
      P.wash(earth, '#b39a72', 0.32, { grad: { x0: 0, y0: g0, x1: 0, y1: 862, c0: '#b39a72', c1: '#8b7350', a0: 0.28, a1: 0.42 }, edge: 0, jit: 0.4, steps: 2 });
      P.hatch(earth, { ang: 68, gap: 4.4, a: 0.32, w: 0.5, c: INK, ragged: 2, piece: 14, fade: (x, y) => 0.4 + (y - g0) / 260 });
      P.stipple(earth, 900, { a: 0.45, r: 1.1, c: INK });
      for (let k = 0; k < 4; k++) { const yy = g0 + 40 + k * 30, pts = []; for (let x = 52; x <= 918; x += 34) pts.push([x, yy + Math.sin(x * 0.03 + k) * 5]); P.curve(pts, { w: 0.5, c: INK, a: 0.3, rough: 1, passes: 1 }); }
      // water table
      { const pts = []; for (let x = 52; x <= 918; x += 24) pts.push([x, 838 + Math.sin(x * 0.05) * 2.4]); P.curve(pts, { w: 0.7, c: '#4a6a80', a: 0.6, rough: 0.7, passes: 1 }); for (let x = 70; x < 900; x += 60) P.line(x, 846, x + 18, 846, { w: 0.4, c: '#4a6a80', a: 0.5, passes: 1, over: 0 }); P.text('WATER TABLE', 84, 858, { size: 8, c: '#4a6a80', a: 0.85 }); }
      P.line(52, g0, X(0) - 4, g0, { w: 1.6, c: INK, a: 0.95, rough: 0.7, passes: 2 }); P.line(X(92) + 6, g0, 918, g0, { w: 1.6, c: INK, a: 0.95, rough: 0.7, passes: 2 });
      for (let x = 56; x < X(0) - 8; x += 6 + R(0, 5)) P.curve([[x, g0], [x + R(-1, 1), g0 - R(3, 9)], [x + R(-3, 3), g0 - R(6, 13)]], { w: 0.5, c: INK, a: 0.7, rough: 0.3, passes: 1 });
    }

    /* ================= 2. the crypt under the choir ================= */
    { const cy0 = -5.2, cy1 = 1.5, x0 = X(56.5), x1 = X(90);
      // massive walls around the void, then the void itself
      poche(rectp(X(55.2), Y(cy1 + 1.3), X(56.5), Y(cy0 - 1.2)), 0.7); poche(rectp(x1, Y(cy1 + 1.3), X(92.4), Y(cy0 - 1.2)), 0.7); poche(rectp(x0, Y(cy0 - 0.2), x1, Y(cy0 - 1.2)), 0.7);
      P.erase(rectp(x0, Y(cy1 + 0.3), x1, Y(cy0)));
      P.wash(rectp(x0, Y(cy1 + 0.3), x1, Y(cy0)), SHADE, 0.32, { grad: { x0: 0, y0: Y(cy1), x1: 0, y1: Y(cy0), c0: '#8b7350', c1: '#d9c39c', a0: 0.5, a1: 0.25 }, edge: 0, jit: 0.2, steps: 2 });
      // columns with bases & capitals, semicircular groin arches between them, vault webs cut at the crown
      const colM = [56.5, 62.3, 68.1, 73.9, 79.7, 85.5, 90]; const sp = -1.6;
      colM.forEach((m, i) => { const cx = X(m); if (i && i < colM.length - 1) { const cw = 0.95 * SC / 2; poche(rectp(cx - cw, Y(sp), cx + cw, Y(cy0)), 0.7); P.rect(cx - cw - 2.4, Y(sp + 0.5), cw * 2 + 4.8, 0.5 * SC, { w: 0.9, c: INK, rough: 0.2, over: 0, passes: 1 }); P.rect(cx - cw - 3, Y(cy0 + 0.6), cw * 2 + 6, 0.6 * SC, { w: 0.9, c: INK, rough: 0.2, over: 0, passes: 1 }); }
        if (i + 1 < colM.length) { const a0 = X(m) + (i ? 0.5 * SC : 0), a1 = X(colM[i + 1]) - (i + 1 < colM.length - 1 ? 0.5 * SC : 0); const rise = (a1 - a0) / 2; const pts = []; for (let k = 0; k <= 16; k++) { const th = Math.PI * (1 - k / 16); pts.push([(a0 + a1) / 2 + Math.cos(th) * rise, Y(sp) - Math.sin(th) * rise * 0.72]); } P.path(pts, { w: 1.6, c: INK, a: 0.95, rough: 0.3, passes: 1 }); P.path(pts.map(([x, y]) => [x, y - 5]), { w: 0.8, c: INK, a: 0.7, rough: 0.3, passes: 1 }); for (let k = 1; k < 16; k += 2) P.line(pts[k][0], pts[k][1], pts[k][0], pts[k][1] - 5, { w: 0.4, c: INK, a: 0.6, passes: 1, over: 0 }); P.hatch([...pts, [pts[pts.length - 1][0], Y(sp) - 60], [pts[0][0], Y(sp) - 60]], { ang: 60, gap: 2.4, a: 0.25, w: 0.4, c: INK }); } });
      // altar, reliquary shrine, lamps, tombs, and the stair down from the crossing
      const altar = X(72.6); P.rect(altar - 16, Y(cy0 + 1.2), 32, 1.2 * SC, { w: 1.2, c: INK, rough: 0.2, over: 0, passes: 1 }); P.line(altar - 20, Y(cy0 + 1.2), altar + 20, Y(cy0 + 1.2), { w: 1.6, c: INK, passes: 1, over: 0 }); P.hatch(rectp(altar - 16, Y(cy0 + 1.2), altar + 16, Y(cy0)), { ang: 50, gap: 2.4, a: 0.4, w: 0.4, c: INK }); P.rect(altar - 5, Y(cy0 + 2.4), 10, 1.2 * SC, { w: 0.9, c: INK, over: 0, passes: 1 }); P.arc(altar, Y(cy0 + 2.4), 5, 3.2, Math.PI, TAU, { w: 0.9, c: INK, passes: 1 }); P.line(altar, Y(cy0 + 3.4) - 3, altar, Y(cy0 + 3.4) - 8, { w: 0.6, c: INK, passes: 1, over: 0 }); P.line(altar - 2.4, Y(cy0 + 3.4) - 5.6, altar + 2.4, Y(cy0 + 3.4) - 5.6, { w: 0.6, c: INK, passes: 1, over: 0 });
      [X(65.2), X(76.8), X(88)].forEach((lx, i) => { P.line(lx, Y(sp) + 0, lx, Y(sp) + 10, { w: 0.5, c: INK, passes: 1, over: 0 }); P.ellipse(lx, Y(sp) + 14, 3, 4, { w: 0.8, c: INK, passes: 1 }); tone([[lx - 3, Y(sp) + 11], [lx + 3, Y(sp) + 11], [lx, Y(sp) + 18]], '#f0d489', 0.75); P.circle(lx, Y(sp) + 14, 8, { w: 0.4, c: '#c99a3a', a: 0.6, passes: 1 }); });
      [[X(60.2), 1], [X(82.2), 0], [X(76.6), 0]].forEach(([tx, kind], i) => { if (i === 2) return; const w2 = 46, h2 = 1.3 * SC; P.rect(tx - w2 / 2, Y(cy0) - h2, w2, h2, { w: 1, c: INK, rough: 0.2, over: 0, passes: 1 }); P.line(tx - w2 / 2 + 4, Y(cy0) - h2 - 3, tx + w2 / 2 - 4, Y(cy0) - h2 - 3, { w: 1, c: INK, passes: 1, over: 0 }); P.ellipse(tx, Y(cy0) - h2 - 6, 7, 3, { w: 0.6, c: INK, passes: 1 }); for (let q = -2; q <= 2; q++) P.line(tx + q * 8, Y(cy0) - h2 + 2, tx + q * 8, Y(cy0) - 2, { w: 0.4, c: INK, a: 0.6, passes: 1, over: 0 }); });
      { const sx0 = X(46.4), sw = 8.4, sd = 43.7 / 8; P.erase([[sx0, Y(0) + 1], [X(55.3), Y(0) + 1], [X(55.3), Y(cy0)], [sx0 + 8 * sw, Y(cy0)]]); P.erase(rectp(X(55.2), Y(cy0 + 3.2), X(56.6), Y(cy0)));
        const stepPts = [[sx0, Y(0)]]; for (let k = 0; k < 8; k++) { stepPts.push([sx0 + k * sw, Y(0) + (k + 1) * sd], [sx0 + (k + 1) * sw, Y(0) + (k + 1) * sd]); }
        P.pl(stepPts, { w: 1.2, c: INK, a: 0.95, rough: 0.2, over: 0, passes: 1 }); P.line(sx0, Y(0), sx0 + 8 * sw, Y(cy0), { w: 0.5, c: INK, a: 0.5, passes: 1, over: 0 }); P.line(X(55.3), Y(0), X(55.3), Y(cy0), { w: 1.6, c: INK, passes: 1, over: 0 }); P.line(sx0, Y(0), sx0, Y(0) + 8, { w: 1.6, c: INK, passes: 1, over: 0 });
        P.hatch([[sx0, Y(0) + 1], [X(55.3), Y(0) + 1], [X(55.3), Y(cy0)], [sx0 + 8 * sw, Y(cy0)]], { ang: 30, gap: 4, a: 0.12, w: 0.4, c: INK }); P.arc(X(55.9), Y(cy0 + 3.2), 0.6 * SC, 0.5 * SC, Math.PI, TAU, { w: 0.8, c: INK, passes: 1 }); P.text('TO CRYPT', X(50.6), Y(0) + 20, { size: 6.4, c: INK, a: 0.85, rot: 0.6 }); }
      P.text('CRYPT', X(74), Y(cy0) + 20, { size: 10, c: INK, align: 'center', font: S.HAND }); P.text('ST. AUBERT\'S SHRINE', altar, Y(cy0 + 5.2) - 8, { size: 6.4, c: INK, align: 'center', a: 0.9 });
      // crypt vault soffit outline above (thick slab poché below the choir floor)
      poche(rectp(x0, Y(cy1 + 0.3), x1, Y(3.0)), 0.75);
    }
    // solid foundation footings under the nave piers
    [...bay, ...choir].forEach(m => { if (m > 55) return; const cx = X(m); poche([[cx - 10, Y(0)], [cx + 10, Y(0)], [cx + 15, Y(-3.4)], [cx - 15, Y(-3.4)]], 0.5); P.rect(cx - 15, Y(-3.4), 30, 0.5 * SC, { w: 0.8, c: INK, rough: 0.3, over: 0, passes: 1 }); });

    /* ================= 3. floors, steps to the choir ================= */
    P.line(X(3), Y(0), X(56), Y(0), { w: 2, c: INK, a: 0.98, rough: 0.5, passes: 2 }); P.rect(X(3), Y(0), X(56) - X(3), 0.35 * SC, { w: 0.8, c: INK, rough: 0.3, over: 0, passes: 1 });
    for (let k = 0; k < 6; k++) { const sx = X(53.6) + k * 5.6, sy = Y(0.5 * (k + 1)); P.line(sx, Y(0.5 * k), sx, sy, { w: 1, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.line(sx, sy, sx + 5.6, sy, { w: 1.2, c: INK, a: 0.95, passes: 1, over: 0, rough: 0.2 }); } P.line(X(57.2), Y(3), X(92), Y(3), { w: 2, c: INK, a: 0.98, rough: 0.5, passes: 2 });


    /* ================= 4. the nave and choir bays, seen along the north wall ================= */
    const sine = (xa, ya, xb, yb, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [lerp(xa, xb, t), lerp(ya, yb, Math.sin(t * Math.PI / 2))]; });
    const pierElev = (m, dz, big = false, pm = 0.8) => {
      const x = X(m), pw = (big ? 1.6 : pm) * SC, H = h => Y(h + dz), top = big ? 33 : 12.5;
      tone(rectp(x - pw, H(0), x + pw, H(top)), STONE, 0.7);
      P.hatch(rectp(x, H(0.6), x + pw, H(top)), { ang: 84, gap: 1.7, a: 0.5, w: 0.45, c: INK, inset: 0.3 });
      [-0.55, 0, 0.55].forEach(f => P.line(x + pw * f, H(1.0), x + pw * f, H(top - 0.4), { w: f ? 0.7 : 1, c: INK, a: 0.85, rough: 0.2, passes: 1, over: 0 }));
      P.line(x - pw, H(0), x - pw, H(top), { w: 1.3, c: INK, a: 0.95, rough: 0.25, passes: 1, over: 0.3 }); P.line(x + pw, H(0), x + pw, H(top), { w: 1.3, c: INK, a: 0.95, rough: 0.25, passes: 1, over: 0.3 });
      P.rect(x - pw - 2.4, H(1.0), pw * 2 + 4.8, 1.0 * SC, { w: 1, c: INK, rough: 0.2, over: 0, passes: 1 }); P.line(x - pw - 1.4, H(0.5), x + pw + 1.4, H(0.5), { w: 0.6, c: INK, a: 0.7, passes: 1, over: 0 });
      if (!big) {
        P.poly([[x - pw - 2, H(12.5 - 0.6)], [x + pw + 2, H(12.5 - 0.6)], [x + pw + 3, H(12.5 + 0.7)], [x - pw - 3, H(12.5 + 0.7)]], { w: 1, c: INK, rough: 0.2, over: 0, passes: 1 }); P.line(x - pw - 2.4, H(12.5), x + pw + 2.4, H(12.5), { w: 0.6, c: INK, a: 0.8, passes: 1, over: 0 });
        const sw = 0.3 * SC; tone(rectp(x - sw, H(13.2), x + sw, H(29)), STONE, 0.7); P.line(x - sw, H(13.2), x - sw, H(29), { w: 1, c: INK, a: 0.95, rough: 0.2, passes: 1, over: 0 }); P.line(x + sw, H(13.2), x + sw, H(29), { w: 1, c: INK, a: 0.95, rough: 0.2, passes: 1, over: 0 }); P.hatch(rectp(x, H(13.2), x + sw, H(29)), { ang: 84, gap: 1.6, a: 0.5, w: 0.4, c: INK, inset: 0.2 });
        [17.6, 21.6].forEach(h => { P.rect(x - sw - 1.6, H(h) - 2, sw * 2 + 3.2, 3.6, { w: 0.8, c: INK, rough: 0.15, over: 0, passes: 1 }); });
        P.poly([[x - sw - 1, H(28.1)], [x + sw + 1, H(28.1)], [x + 0.75 * SC, H(29.0)], [x - 0.75 * SC, H(29.0)]], { w: 1, c: INK, rough: 0.2, over: 0, passes: 1 }); tone([[x - sw - 1, H(28.1)], [x + sw + 1, H(28.1)], [x + 0.75 * SC, H(29)], [x - 0.75 * SC, H(29)]], STONE, 0.5);
      }
    };
    const bayElev = (m0, m1, dz) => {
      const xa = X(m0), xb = X(m1), pw = 0.8 * SC, xm = (xa + xb) / 2, H = h => Y(h + dz), ia = xa + pw, ib = xb - pw;
      // the far (north) wall face and its coursing
      tone(rectp(ia, H(0), ib, H(39.5)), STONE, 0.5);
      P.hatch(rectp(ia, H(17.5), ib, H(12.5)), { ang: 0, gap: 4.3, a: 0.3, w: 0.45, c: INK, ragged: 3, inset: 0 });
      P.hatch(rectp(ia, H(39.5), ib, H(34.8)), { ang: 0, gap: 4.3, a: 0.28, w: 0.45, c: INK, ragged: 3, inset: 0 });
      // arcade arch opening onto the aisle
      const arch = pointed(ia, ib, H(12.5), 5.0 * SC), open = [[ia, H(0)], ...arch, [ib, H(0)]];
      P.erase(open); tone(open, SHADE, 0.4); P.hatch(open, { ang: 90, gap: 5, a: 0.18, w: 0.4, c: INK });
      { const wd = 1.3 * SC, wa = xm - wd, wb = xm + wd, win = [[wa, H(4.2)], [wa, H(8.6)], ...pointed(wa, wb, H(8.6), 2.6 * SC).slice(1, -1), [wb, H(8.6)], [wb, H(4.2)]]; P.wash(win, GLASS, 0.55, { edge: 0.4, jit: 0.2, steps: 2 }); P.path(win.concat([win[0]]), { w: 0.9, c: INK, a: 0.85, rough: 0.2, passes: 1 }); P.line(xm, H(4.2), xm, H(11.2), { w: 0.6, c: INK, a: 0.8, passes: 1, over: 0 }); P.hatch(win, { ang: 45, gap: 2.4, a: 0.25, w: 0.35, c: INK }); }
      [0, 0.35, 0.7].forEach((d, k) => P.path(pointed(ia - d * SC, ib + d * SC, H(12.5), 5.0 * SC + d * SC * 1.2), { w: k ? 0.8 : 1.5, c: INK, a: 0.92, rough: 0.3, passes: 1 }));
      { const a1 = pointed(ia, ib, H(12.5), 5.0 * SC), a2 = pointed(ia - 0.7 * SC, ib + 0.7 * SC, H(12.5), 5.0 * SC + 0.84 * SC); for (let i = 1; i < a1.length - 1; i += 2) P.line(a1[i][0], a1[i][1], a2[i][0], a2[i][1], { w: 0.4, c: INK, a: 0.6, passes: 1, over: 0 }); }
      // triforium
      tone(rectp(ia, H(17.6), ib, H(21.6)), STONE, 0.45); P.line(ia, H(17.6), ib, H(17.6), { w: 1.3, c: INK, a: 0.9, rough: 0.25, passes: 1, over: 0.2 }); P.line(ia, H(17.9), ib, H(17.9), { w: 0.6, c: INK, a: 0.7, passes: 1, over: 0 }); P.line(ia, H(21.6), ib, H(21.6), { w: 1.3, c: INK, a: 0.9, rough: 0.25, passes: 1, over: 0.2 });
      { const w4 = (ib - ia) / 4; for (let k = 0; k < 4; k++) { const x0 = ia + k * w4 + 1.6, x1 = ia + (k + 1) * w4 - 1.6, ar = pointed(x0, x1, H(19.7), 1.5 * SC), op = [[x0, H(18.0)], ...ar, [x1, H(18.0)]]; tone(op, DARK, 0.45); P.path(ar, { w: 0.9, c: INK, a: 0.92, rough: 0.2, passes: 1 }); P.line(x0, H(18.0), x0, H(19.7), { w: 0.8, c: INK, a: 0.9, passes: 1, over: 0 }); P.line(x1, H(18.0), x1, H(19.7), { w: 0.8, c: INK, a: 0.9, passes: 1, over: 0 }); P.line(x0 - 1.4, H(18.0), x1 + 1.4, H(18.0), { w: 0.5, c: INK, a: 0.7, passes: 1, over: 0 }); P.circle((x0 + x1) / 2, H(20.9) - 0.5, 1.7, { w: 0.5, c: INK, a: 0.75, passes: 1 }); } }
      // clerestory window with leaded glass and tracery
      { const wa = ia + 5.4, wb = ib - 5.4, ys = H(28.4), rise = 5.0 * SC, win = [[wa, H(22.0)], [wa, ys], ...pointed(wa, wb, ys, rise).slice(1, -1), [wb, ys], [wb, H(22.0)]];
        P.erase(win); P.wash(win, GLASS, 0.62, { grad: { x0: 0, y0: H(33.4), x1: 0, y1: H(22), c0: '#f3dca0', c1: '#c99b52', a0: 0.75, a1: 0.5 }, edge: 0.4, jit: 0.2, steps: 2 });
        P.hatch(win, { ang: 45, gap: 3.0, a: 0.3, w: 0.35, c: INK, inset: 0.3 }); P.hatch(win, { ang: -45, gap: 3.0, a: 0.3, w: 0.35, c: INK, inset: 0.3 });
        P.path(win.concat([win[0]]), { w: 1.4, c: INK, a: 0.95, rough: 0.25, passes: 1 }); P.path(pointed(wa - 2.6, wb + 2.6, ys, rise + 2.8), { w: 0.7, c: INK, a: 0.75, rough: 0.25, passes: 1 });
        P.line(xm, H(22.0), xm, ys - 3 * SC, { w: 1.2, c: INK, a: 0.95, passes: 1, over: 0, rough: 0.15 });
        [[wa, xm], [xm, wb]].forEach(([a, b]) => { P.path(pointed(a + 1.6, b - 1.6, ys, 2.5 * SC), { w: 1, c: INK, a: 0.92, rough: 0.2, passes: 1 }); P.line(a + 1.6, ys, a + 1.6, H(22.0), { w: 0.9, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.15 }); P.line(b - 1.6, ys, b - 1.6, H(22.0), { w: 0.9, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.15 }); });
        P.line(wa, H(25.2), wb, H(25.2), { w: 0.9, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.15 });
        const oc = [xm, H(31.4)]; P.circle(oc[0], oc[1], 1.25 * SC, { w: 1, c: INK, a: 0.95, passes: 1 }); for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2 + Math.PI / 4; P.circle(oc[0] + Math.cos(a) * 0.55 * SC, oc[1] + Math.sin(a) * 0.55 * SC, 0.5 * SC, { w: 0.7, c: INK, a: 0.9, passes: 1 }); } P.circle(oc[0], oc[1], 0.16 * SC, { w: 0.6, c: INK, passes: 1 }); }
      // wall rib and the vault: diagonal ribs projected, bosses, webs
      [0, 0.32].forEach((d, k) => P.path(pointed(xa + 0.3 * SC + d * SC, xb - 0.3 * SC - d * SC, H(29.0), 5.6 * SC - d * SC), { w: k ? 0.7 : 1.4, c: INK, a: 0.9, rough: 0.3, passes: 1 }));
      { const web = [...pointed(xa + 0.3 * SC, xb - 0.3 * SC, H(29.0), 5.6 * SC), [xb - 0.3 * SC, H(37.8)], [xa + 0.3 * SC, H(37.8)]]; tone(web, SHADE, 0.28); P.hatch(web, { ang: -72, gap: 3.4, a: 0.32, w: 0.4, c: INK, inset: 0.3 }); }
      [[xa + 0.3 * SC, xm], [xb - 0.3 * SC, xm]].forEach(([x0, x1]) => { [0, 3].forEach((off, k) => P.path(sine(x0, H(29.0) - off * 0, x1, H(38) - off * 0.0).map(([x, y]) => [x, y + off]), { w: k ? 0.8 : 1.5, c: INK, a: 0.92, rough: 0.25, passes: 1 })); });
      P.circle(xm, H(38), 0.6 * SC, { w: 1, c: INK, a: 0.95, passes: 1 }); P.circle(xm, H(38), 0.35 * SC, { w: 0.7, c: INK, a: 0.85, passes: 1 }); for (let q = 0; q < 6; q++) { const a = q * TAU / 6; P.line(xm + Math.cos(a) * 0.35 * SC, H(38) + Math.sin(a) * 0.35 * SC, xm + Math.cos(a) * 0.6 * SC, H(38) + Math.sin(a) * 0.6 * SC, { w: 0.5, c: INK, a: 0.8, passes: 1, over: 0 }); } P.dot(xm, H(38), 1.1, { c: INK });
    };
    // the wall above the vault (roof space) is drawn with the bays; the piers overlay them
    const naveBays = () => { for (let i = 0; i + 1 < bay.length; i++) bayElev(bay[i], bay[i + 1], 0); bay.forEach((m, i) => { if (i < bay.length - 1) pierElev(m, 0); }); };
    naveBays();
    for (let i = 0; i + 1 < choir.length; i++) bayElev(choir[i], choir[i + 1], 3.0); choir.forEach((m, i) => { if (i > 0 && i < choir.length - 1) pierElev(m, 3.0); });
    // cut ridge of the vault along the axis: a strip of poché with bosses
    [[3, 45, 0], [57, 82.2, 3.0]].forEach(([m0, m1, dz]) => { poche(rectp(X(m0), Y(38.55 + dz), X(m1), Y(37.75 + dz)), 0.85); });
    // west wall in section, with the portal and rose window cut through it
    { poche(rectp(X(0), Y(50), X(3), Y(-3.4)), 0.82); P.erase(rectp(X(0) - 1, Y(10.4), X(3) + 0.5, Y(0.05))); P.erase(rectp(X(0) - 1, Y(30.5), X(3) + 0.5, Y(19.5)));
      P.line(X(0), Y(10.4), X(3), Y(10.4), { w: 1.6, c: INK, passes: 1, over: 0.3 }); P.line(X(0), Y(0.05), X(3), Y(0.05), { w: 1.6, c: INK, passes: 1, over: 0.3 });
      P.line(X(1.4), Y(0.05), X(1.4), Y(8.6), { w: 3, c: INK, a: 0.95, passes: 1, over: 0 }); P.line(X(1.9), Y(0.05), X(1.9), Y(8.6), { w: 2, c: INK, a: 0.85, passes: 1, over: 0 }); P.rect(X(1.4) - 1, Y(9.3), 5.6, 0.9 * SC, { w: 0.9, c: INK, over: 0, passes: 1 });
      P.line(X(0), Y(30.5), X(3), Y(30.5), { w: 1.6, c: INK, passes: 1, over: 0.3 }); P.line(X(0), Y(19.5), X(3), Y(19.5), { w: 1.6, c: INK, passes: 1, over: 0.3 });
      [22.2, 25, 27.8].forEach(h => poche(rectp(X(1.1), Y(h + 0.28), X(2.2), Y(h - 0.28)), 0.85));
      P.wash(rectp(X(0), Y(30.5), X(3), Y(19.5)), GLASS, 0.3, { edge: 0, jit: 0.2, steps: 2 });
      tone([[X(0), Y(50)], [X(3), Y(50)], [X(1.5), Y(53)]], STONE, 0.0);
      P.line(X(1.5), Y(50), X(1.5), Y(54.4), { w: 1.2, c: INK, passes: 1, over: 0 }); P.line(X(1.5) - 3.6, Y(53.2), X(1.5) + 3.6, Y(53.2), { w: 1, c: INK, passes: 1, over: 0 }); }


    /* ================= 5. roof timbers over nave and choir ================= */
    const roofSpan = (m0, m1, dz) => {
      const x0 = X(m0), x1 = X(m1), pl = 39.5 + dz, rd = 52 + dz;
      P.wash(rectp(x0, Y(pl), x1, Y(rd)), TIMBER, 0.2, { edge: 0, jit: 0.3, steps: 2 });
      for (let x = x0 + 2; x < x1; x += 4.4 + R(-0.4, 0.4)) P.line(x, Y(pl) - 1, x + R(-0.6, 0.6), Y(rd) + 1, { w: 0.5, c: INK, a: 0.5, rough: 0.35, passes: 1, over: 0 });
      [43.2, 49.4].forEach(h => { P.line(x0, Y(h + dz), x1, Y(h + dz), { w: 1.1, c: INK, a: 0.85, rough: 0.35, passes: 1, over: 0 }); P.line(x0, Y(h + dz) + 3, x1, Y(h + dz) + 3, { w: 0.6, c: INK, a: 0.6, rough: 0.35, passes: 1, over: 0 }); });
      poche(rectp(x0, Y(pl), x1, Y(pl - 0.45)), 0.85); poche(rectp(x0, Y(rd), x1, Y(rd - 0.6)), 0.85); poche(rectp(x0, Y(46.9 + dz), x1, Y(46.2 + dz)), 0.85);
      for (let m = m0 + 1; m < m1; m += 4.2) { const x = X(m);
        poche(rectp(x - 0.2 * SC, Y(pl + 0.1), x + 0.2 * SC, Y(rd - 0.5)), 0.85); poche(rectp(x - 0.3 * SC, Y(pl - 0.45), x + 0.3 * SC, Y(pl - 1.05)), 0.85);
        [-1, 1].forEach(sg => { P.line(x, Y(pl + 1.2), x + sg * 2.1 * SC, Y(46.2 + dz), { w: 2.4, c: INK, a: 0.9, rough: 0.2, passes: 1, over: 0 }); P.line(x + sg * 2.1 * SC, Y(46.2 + dz), x + sg * 2.1 * SC, Y(46.2 + dz) + 5, { w: 0.5, c: INK, a: 0.6, passes: 1, over: 0 }); });
        P.rect(x - 4, Y(pl + 1.6), 8, 3, { w: 0.6, c: INK, a: 0.9, over: 0, passes: 1 }); P.line(x - 3, Y(50.6 + dz), x + 3, Y(50.6 + dz), { w: 1.4, c: INK, a: 0.9, passes: 1, over: 0 }); }
    };
    roofSpan(3.0, 45.0, 0); roofSpan(57.0, 89.8, 3.0);

    /* ================= 6. the crossing tower: arches, lantern vault, ringing chamber, bells, spire ================= */
    { const xw = X(45), xe = X(57), xm = (xw + xe) / 2, tw = 2.0 * SC;
      // north crossing arch, with the transept end wall and its rose window seen through it
      const arch = pointed(xw + 1.6 * SC * 0.5, xe - 1.6 * SC * 0.5, Y(24), 8.6 * SC), open = [[xw + 1.6 * SC * 0.5, Y(0)], ...arch, [xe - 1.6 * SC * 0.5, Y(0)]];
      tone(rectp(xw, Y(0), xe, Y(70)), STONE, 0.5); P.hatch(rectp(xw, Y(70), xe, Y(34)), { ang: 0, gap: 4.3, a: 0.26, w: 0.45, c: INK, ragged: 3 });
      P.erase(open); tone(open, SHADE, 0.32);
      { const cx = xm, cy = Y(27.2), rr = 3.9 * SC; P.wash(Array.from({ length: 30 }, (_, i) => [cx + Math.cos(i * TAU / 30) * rr, cy + Math.sin(i * TAU / 30) * rr]), GLASS, 0.6, { edge: 0.3, jit: 0.2, steps: 2 }); [1, 0.86, 0.34, 0.16].forEach((k, i) => P.circle(cx, cy, rr * k, { w: i ? 0.8 : 1.6, c: INK, a: 0.95, passes: 1 })); for (let q = 0; q < 12; q++) { const a = q * TAU / 12; P.line(cx + Math.cos(a) * rr * 0.16, cy + Math.sin(a) * rr * 0.16, cx + Math.cos(a) * rr * 0.86, cy + Math.sin(a) * rr * 0.86, { w: 0.8, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.15 }); const a2 = a + TAU / 24; P.circle(cx + Math.cos(a2) * rr * 0.6, cy + Math.sin(a2) * rr * 0.6, rr * 0.13, { w: 0.6, c: INK, a: 0.85, passes: 1 }); P.arc(cx + Math.cos(a) * rr * 0.6, cy + Math.sin(a) * rr * 0.6, rr * 0.13, rr * 0.13, a + 2.4, a + 6.0, { w: 0.6, c: INK, a: 0.8, passes: 1 }); } P.hatch(Array.from({ length: 30 }, (_, i) => [cx + Math.cos(i * TAU / 30) * rr, cy + Math.sin(i * TAU / 30) * rr]), { ang: 45, gap: 3, a: 0.22, w: 0.35, c: INK }); P.rect(cx - 30, Y(0) - 0.1 * SC - 34, 60, 34, { w: 0.01, c: INK, a: 0, passes: 1 }); for (let k = -2; k <= 2; k++) { const lx = cx + k * 14; P.path(pointed(lx - 5.5, lx + 5.5, Y(10), 3.6 * SC), { w: 0.8, c: INK, a: 0.8, rough: 0.2, passes: 1 }); P.line(lx - 5.5, Y(10), lx - 5.5, Y(2), { w: 0.7, c: INK, a: 0.8, passes: 1, over: 0 }); P.line(lx + 5.5, Y(10), lx + 5.5, Y(2), { w: 0.7, c: INK, a: 0.8, passes: 1, over: 0 }); } }
      [0, 0.35, 0.7].forEach((d, k) => P.path(pointed(xw + 0.8 * SC - d * SC, xe - 0.8 * SC + d * SC, Y(24), 8.6 * SC + d * SC * 1.2), { w: k ? 0.8 : 1.6, c: INK, a: 0.92, rough: 0.3, passes: 1 }));
      // the west and east tower walls, cut through above the crossing arches (poché) — and the crossing piers
      poche(rectp(xw, Y(36), xw + tw, Y(70)), 0.82); poche(rectp(xe - tw, Y(36), xe, Y(70)), 0.82); P.line(xw, Y(70), xe, Y(70), { w: 1.6, c: INK, a: 0.9, rough: 0.3, passes: 1, over: 0.3 });
      pierElev(45.0, 0, true); pierElev(57.0, 0, true);
      // lantern vault with the bell hole; ribs beneath it
      const lv = Y(44.0), hole = 1.3 * SC; poche(rectp(xw + tw, lv, xm - hole, lv + 0.75 * SC), 0.85); poche(rectp(xm + hole, lv, xe - tw, lv + 0.75 * SC), 0.85);
      for (let k = 0; k < 7; k++) { const t2 = k / 6; P.path(sine(xw + tw + 2, Y(35.5), lerp(xw + tw + 4, xm - hole, t2 * 0.9 + 0.1), lv + 0.75 * SC).map(([x, y]) => [x, y]), { w: 0.9, c: INK, a: 0.8, rough: 0.3, passes: 1 }); }
      // ringing chamber: joists, ringers and hanging ropes with woollen sallies
      const rf = Y(47.6); poche(rectp(xw + tw, rf, xe - tw, rf + 0.35 * SC), 0.85); for (let x = xw + tw + 5; x < xe - tw - 3; x += 7) poche(rectp(x - 1.6, rf + 0.35 * SC, x + 1.6, rf + 1.15 * SC), 0.8);
      [-3.0, -1.0, 1.0, 3.0].forEach((d, i) => { const rx = xm + d * SC * 0.85, fy = rf; P.line(rx, Y(56.4), rx, fy - 24, { w: 0.8, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.ellipse(rx, fy - 30, 1.6, 4.4, { w: 0.6, c: '#a04030', a: 0.95, passes: 1 }); disc(rx, fy - 30, 2, '#a04030', 0.7); const fx = rx + 5; const T2 = [[fx, fy], [fx, fy - 7]]; P.line(fx, fy, fx, fy - 8, { w: 1.6, c: INK, passes: 1, over: 0 }); P.circle(fx, fy - 12, 2.2, { w: 0.8, c: INK, passes: 1 }); disc(fx, fy - 12, 2, INK, 0.8); P.line(fx, fy - 8, fx - 3.6, fy - 21, { w: 1.2, c: INK, passes: 1, over: 0 }); P.line(fx, fy - 8, fx + 2.6, fy - 20, { w: 1.2, c: INK, passes: 1, over: 0 }); P.line(fx - 1, fy, fx - 1.8, fy + 0.01, { w: 1, c: INK, passes: 1, over: 0 }); });
      [-2.6, 1.8].forEach(d => { const wx = xm + d * SC, wy = Y(52.4); P.path(pointed(wx - 6, wx + 6, wy, 2.6 * SC), { w: 1, c: INK, a: 0.9, rough: 0.2, passes: 1 }); P.line(wx - 6, wy, wx - 6, wy + 30, { w: 1, c: INK, a: 0.9, passes: 1, over: 0 }); P.line(wx + 6, wy, wx + 6, wy + 30, { w: 1, c: INK, a: 0.9, passes: 1, over: 0 }); tone([[wx - 6, wy + 30], [wx - 6, wy], ...pointed(wx - 6, wx + 6, wy, 2.6 * SC).slice(1, -1), [wx + 6, wy], [wx + 6, wy + 30]], GLASS, 0.55); });
      // bell chamber: floor beams, the great oak frame, three bells with wheels, louvred openings behind
      const bf = Y(56.4); poche(rectp(xw + tw, bf, xe - tw, bf + 0.5 * SC), 0.85); for (let x = xw + tw + 4; x < xe - tw - 2; x += 9) poche(rectp(x - 3, bf + 0.5 * SC, x + 3, bf + 1.5 * SC), 0.8); P.rect(xm - 4, bf - 1, 8, 6, { w: 0.01, c: INK, a: 0, passes: 1 });
      for (let k = 0; k < 3; k++) { const lx = xm - 27 + k * 27, lw = 8.3; const op = [[lx - lw, Y(57.6)], [lx - lw, Y(64.6)], ...pointed(lx - lw, lx + lw, Y(64.6), 2.8 * SC).slice(1, -1), [lx + lw, Y(64.6)], [lx + lw, Y(57.6)]]; P.erase(op); P.wash(op, '#a9865a', 0.28, { edge: 0.3, jit: 0.2, steps: 2 }); for (let y = Y(64.8); y < Y(57.7); y += 3.3) P.line(lx - lw + 1, y, lx + lw - 1, y + 2.2, { w: 0.7, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.15 }); P.path(op.concat([op[0]]), { w: 1.4, c: INK, a: 0.95, rough: 0.2, passes: 1 }); P.line(lx, Y(57.6), lx, Y(64.6) - 2.8 * SC, { w: 0.01, c: INK, a: 0, passes: 1 }); }
      // oak frame: sills, uprights, braces, headstocks
      poche(rectp(xw + tw + 3, Y(57.3), xe - tw - 3, Y(56.6)), 0.85); poche(rectp(xw + tw + 3, Y(66.0), xe - tw - 3, Y(65.3)), 0.85);
      [-1, 0, 1, 2].forEach(i => { const ux = xm - 40.5 + (i + 1) * 27; poche(rectp(ux - 2.2, Y(65.3), ux + 2.2, Y(57.3)), 0.85); });
      for (let k = 0; k < 3; k++) { const lx = xm - 27 + k * 27, ux = lx - 13.5; [[ux + 2.2, Y(57.3), lx + 13.5 - 2.2, Y(65.3)], [lx + 13.5 - 2.2, Y(57.3), ux + 2.2, Y(65.3)]].forEach(([a, b, c, d]) => P.line(a, b, c, d, { w: 1.5, c: INK, a: 0.7, passes: 1, over: 0, rough: 0.25 })); }
      const bells = [[xm - 27, 6.6, 1.1], [xm, 8.0, 1.2], [xm + 27, 5.6, 0.95]];
      bells.forEach(([bx, mw, sc]) => { const top = Y(64.6), bot = Y(58.4);
        const prof = [[bx - 1.2, top], [bx - 1.6, top + 6], [bx - mw * 0.55, top + 12], [bx - mw * 0.64, top + 24], [bx - mw * 0.86, top + 40], [bx - mw, bot - 1], [bx - mw, bot], [bx + mw, bot], [bx + mw, bot - 1], [bx + mw * 0.86, top + 40], [bx + mw * 0.64, top + 24], [bx + mw * 0.55, top + 12], [bx + 1.6, top + 6], [bx + 1.2, top]];
        const inner = [[bx - mw * 0.78, bot - 1], [bx - mw * 0.55, top + 34], [bx - mw * 0.4, top + 20], [bx - mw * 0.3, top + 12], [bx + mw * 0.3, top + 12], [bx + mw * 0.4, top + 20], [bx + mw * 0.55, top + 34], [bx + mw * 0.78, bot - 1]];
        tone(prof, '#8a6a3a', 0.55); poche(prof, 0.45); P.curve(prof, { closed: true, w: 1.6, c: INK, a: 0.98, rough: 0.2, passes: 1 }); P.wash([...inner, [bx + mw * 0.78, bot], [bx - mw * 0.78, bot]], '#f4ead0', 0.85, { edge: 0, jit: 0.2, steps: 1 }); P.path(inner, { w: 0.9, c: INK, a: 0.9, rough: 0.2, passes: 1 });
        P.line(bx, top + 14, bx, bot - 4, { w: 1.2, c: INK, a: 0.95, passes: 1, over: 0, rough: 0.15 }); P.circle(bx, bot - 3, 2, { w: 0.9, c: INK, passes: 1 }); disc(bx, bot - 3, 1.8, INK, 0.9);
        [0.5, 0.7].forEach(f => P.line(bx - mw * (0.66 + f * 0.2), lerp(top + 24, bot - 4, f * 0.5), bx + mw * (0.66 + f * 0.2), lerp(top + 24, bot - 4, f * 0.5), { w: 0.7, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.1 }));
        poche(rectp(bx - 9, top - 4, bx + 9, top), 0.85); P.circle(bx - 9, top - 2, 1.4, { w: 0.6, c: INK, passes: 1 }); P.circle(bx + 9, top - 2, 1.4, { w: 0.6, c: INK, passes: 1 });
        P.circle(bx + 12, top + 2, 8 * sc, { w: 1.2, c: INK, a: 0.95, passes: 1 }); P.circle(bx + 12, top + 2, 6.4 * sc, { w: 0.6, c: INK, a: 0.8, passes: 1 }); for (let q = 0; q < 6; q++) { const a = q * TAU / 6; P.line(bx + 12, top + 2, bx + 12 + Math.cos(a) * 6.4 * sc, top + 2 + Math.sin(a) * 6.4 * sc, { w: 0.5, c: INK, a: 0.75, passes: 1, over: 0 }); }
      });
      // tower parapet, blind arcade, corner pinnacles
      P.line(xw, Y(68.4), xe, Y(68.4), { w: 1.2, c: INK, a: 0.9, passes: 1, over: 0 }); for (let k = 0; k < 16; k++) { const ax = xw + 4 + k * ((xe - xw - 8) / 15); P.path(pointed(ax - 3.4, ax + 3.4, Y(67.6), 1.2 * SC), { w: 0.6, c: INK, a: 0.8, rough: 0.15, passes: 1 }); P.line(ax - 3.4, Y(67.6), ax - 3.4, Y(66.8), { w: 0.5, c: INK, a: 0.7, passes: 1, over: 0 }); }
      for (let k = 0; k < 12; k++) { const mx = xw + 3 + k * ((xe - xw - 6 - 6) / 11); P.rect(mx, Y(71.2), 6, 1.3 * SC, { w: 0.8, c: INK, a: 0.9, rough: 0.15, over: 0, passes: 1 }); tone(rectp(mx, Y(71.2), mx + 6, Y(70)), STONE, 0.5); }
      [xw - 2, xe - 2].forEach(px => { poche(rectp(px, Y(76), px + 5, Y(70)), 0.6); P.poly([[px - 1, Y(76)], [px + 6, Y(76)], [px + 2.5, Y(81)]], { w: 1, c: INK, rough: 0.2, over: 0, passes: 1 }); P.line(px + 2.5, Y(81), px + 2.5, Y(82.8), { w: 0.8, c: INK, passes: 1, over: 0 }); for (let k = 0; k < 4; k++) { P.curve([[px - 1 + k * 0.6, Y(76) - k * 4], [px - 3.6, Y(76.4) - k * 4], [px - 2.6, Y(76.9) - k * 4 - 2]], { w: 0.6, c: INK, rough: 0.1, passes: 1 }); P.curve([[px + 6 - k * 0.6, Y(76) - k * 4], [px + 8.6, Y(76.4) - k * 4], [px + 7.6, Y(76.9) - k * 4 - 2]], { w: 0.6, c: INK, rough: 0.1, passes: 1 }); } });
      // the spire in section: lead shell, king-post mast, tie beams with braces, crockets, cross
      { const base = Y(71.2), tip = Y(83.4), hb = 4.5 * SC, sh = [[xm - hb, base], [xm + hb, base], [xm + 1.2, tip], [xm - 1.2, tip]];
        const shell = (sg) => Array.from({ length: 22 }, (_, i) => { const t2 = i / 21; return [xm + sg * (hb * (1 - t2) + 1.2 * t2 * 0.9 - Math.sin(t2 * Math.PI) * 2.6 * -0.3 * 0), lerp(base, tip, t2)]; });
        const L1 = shell(-1), R1 = shell(1); P.path(L1, { w: 1.8, c: INK, a: 0.98, rough: 0.25, passes: 1 }); P.path(R1, { w: 1.8, c: INK, a: 0.98, rough: 0.25, passes: 1 });
        const inL = L1.map(([x, y], i) => [x + 5 * (1 - i / 21) + 1.2, y]), inR = R1.map(([x, y], i) => [x - 5 * (1 - i / 21) - 1.2, y]); P.path(inL, { w: 0.8, c: INK, a: 0.8, rough: 0.25, passes: 1 }); P.path(inR, { w: 0.8, c: INK, a: 0.8, rough: 0.25, passes: 1 });
        P.wash([...L1, ...R1.slice().reverse()], LEAD, 0.34, { edge: 0.3, jit: 0.3, steps: 2 }); P.hatch([...L1, ...R1.slice().reverse()], { ang: 82, gap: 2.6, a: 0.28, w: 0.4, c: INK, inset: 0.3 });
        poche(rectp(xm - 1.3, base, xm + 1.3, tip + 4), 0.85);
        for (let k = 0; k < 6; k++) { const yy = lerp(base, tip, (k + 0.6) / 6.3), hw = lerp(hb - 5, 2.4, (k + 0.6) / 6.3) ; poche(rectp(xm - hw, yy - 1.2, xm + hw, yy + 1.2), 0.85); if (k < 5) { const y2 = lerp(base, tip, (k + 1.6) / 6.3), hw2 = lerp(hb - 5, 2.4, (k + 1.6) / 6.3); P.line(xm - hw, yy, xm - hw2 * 0.4, y2, { w: 0.9, c: INK, a: 0.8, passes: 1, over: 0, rough: 0.2 }); P.line(xm + hw, yy, xm + hw2 * 0.4, y2, { w: 0.9, c: INK, a: 0.8, passes: 1, over: 0, rough: 0.2 }); P.line(xm - hw * 0.5, yy, xm + hw2 * 0.6, y2, { w: 0.6, c: INK, a: 0.6, passes: 1, over: 0, rough: 0.2 }); P.line(xm + hw * 0.5, yy, xm - hw2 * 0.6, y2, { w: 0.6, c: INK, a: 0.6, passes: 1, over: 0, rough: 0.2 }); } }
        for (let k = 1; k < 12; k++) { const t2 = k / 12, yy = lerp(base, tip, t2), xx = hb * (1 - t2) + 1.2 * t2; [-1, 1].forEach(sg => P.curve([[xm + sg * (xx - 1), yy], [xm + sg * (xx + 3.6), yy - 1], [xm + sg * (xx + 3), yy - 4.4]], { w: 0.8, c: INK, a: 0.9, rough: 0.1, passes: 1 })); }
        P.circle(xm, tip - 3.5, 2.4, { w: 1.1, c: INK, passes: 1 }); disc(xm, tip - 3.5, 2.2, INK, 0.9); P.line(xm, tip - 5, xm, tip - 22, { w: 1, c: INK, passes: 1, over: 0 }); P.line(xm - 4, tip - 15, xm + 4, tip - 15, { w: 1, c: INK, passes: 1, over: 0 }); P.curve([[xm, tip - 20], [xm + 7, tip - 20], [xm + 9, tip - 17], [xm + 6, tip - 15]], { w: 0.8, c: INK, rough: 0.1, passes: 1 }); P.poly([[xm + 9, tip - 21], [xm + 15, tip - 20], [xm + 9, tip - 18.6]], { w: 0.6, c: INK, over: 0, passes: 1 });
      }
    }
    // the roof ridge line and eaves either side of the tower, and the east end


    /* ================= 7. the apse (compressed bays), end wall, choir fittings, rood screen ================= */
    const apseM = [82.2, 85.3, 87.5, 89.1]; const APSE_END = 89.1;
    for (let i = 0; i + 1 < apseM.length; i++) {
      const m0 = apseM[i], m1 = apseM[i + 1], dz = 3.0, xa = X(m0), xb = X(m1), H = h => Y(h + dz), pm = 0.42, ia = xa + pm * SC, ib = xb - pm * SC, xm = (xa + xb) / 2, wpx = ib - ia;
      tone(rectp(ia, H(0), ib, H(39.5)), STONE, 0.5);
      const arch = pointed(ia, ib, H(12.5), Math.min(5 * SC, wpx * 1.3)), open = [[ia, H(0)], ...arch, [ib, H(0)]]; P.erase(open); tone(open, SHADE, 0.42); P.path(arch, { w: 1.4, c: INK, a: 0.92, rough: 0.3, passes: 1 });
      P.line(ia, H(17.6), ib, H(17.6), { w: 1.2, c: INK, a: 0.9, passes: 1, over: 0.2 }); P.line(ia, H(21.6), ib, H(21.6), { w: 1.2, c: INK, a: 0.9, passes: 1, over: 0.2 });
      tone(rectp(ia, H(17.6), ib, H(21.6)), DARK, 0.3); for (let k = 0; k < 2; k++) { const x0 = ia + k * wpx / 2 + 1, x1 = ia + (k + 1) * wpx / 2 - 1; if (x1 - x0 > 3) P.path(pointed(x0, x1, H(19.7), Math.min(1.5 * SC, (x1 - x0) * 1.2)), { w: 0.8, c: INK, a: 0.9, rough: 0.2, passes: 1 }); }
      const wa = ia + Math.max(1.6, wpx * 0.16), wb = ib - Math.max(1.6, wpx * 0.16), win = [[wa, H(22.0)], [wa, H(28.4)], ...pointed(wa, wb, H(28.4), Math.min(5 * SC, (wb - wa) * 1.7)).slice(1, -1), [wb, H(28.4)], [wb, H(22.0)]];
      P.erase(win); P.wash(win, GLASS, 0.62, { grad: { x0: 0, y0: H(33.4), x1: 0, y1: H(22), c0: '#f3dca0', c1: '#c99b52', a0: 0.75, a1: 0.5 }, edge: 0.4, jit: 0.2, steps: 2 }); P.hatch(win, { ang: 45, gap: 3, a: 0.3, w: 0.35, c: INK }); P.hatch(win, { ang: -45, gap: 3, a: 0.3, w: 0.35, c: INK }); P.path(win.concat([win[0]]), { w: 1.3, c: INK, a: 0.95, rough: 0.25, passes: 1 }); P.line(xm, H(22), xm, H(30), { w: 0.9, c: INK, a: 0.9, passes: 1, over: 0 });
      P.path(pointed(xa + 0.3 * SC * 0.6, xb - 0.3 * SC * 0.6, H(29.0), Math.min(5.6 * SC, (xb - xa) * 1.7)), { w: 1.2, c: INK, a: 0.9, rough: 0.3, passes: 1 });
      [xa, xb].forEach(x => { });
      const apex = [X(APSE_END - 0.4), Y(41.0)]; P.path(sine(xa + 2, H(29.0), apex[0], apex[1], 14), { w: 1.6, c: INK, a: 0.92, rough: 0.25, passes: 1 }); P.path(sine(xa + 2, H(29.0) + 3, apex[0], apex[1] + 3, 14), { w: 0.8, c: INK, a: 0.75, rough: 0.25, passes: 1 });
    }
    apseM.forEach((m, i) => { if (i > 0) pierElev(m, 3.0, false, 0.42); });
    poche(rectp(X(82.2), Y(41.55), X(APSE_END), Y(40.75)), 0.85);
    { const apex = [X(APSE_END - 0.4), Y(41.0)]; P.circle(apex[0], apex[1], 0.6 * SC, { w: 1, c: INK, a: 0.95, passes: 1 }); P.circle(apex[0], apex[1], 0.3 * SC, { w: 0.7, c: INK, a: 0.8, passes: 1 }); }
    // end wall with the great east window cut through it
    { const xa = X(APSE_END), xb = X(92.4); poche(rectp(xa, Y(60), xb, Y(-6.4)), 0.82); P.erase(rectp(xa - 0.5, Y(50), xb + 0.5, Y(27))); P.line(xa, Y(50), xb, Y(50), { w: 1.6, c: INK, passes: 1, over: 0.3 }); P.line(xa, Y(27), xb, Y(27), { w: 1.6, c: INK, passes: 1, over: 0.3 });
      [29.6, 33.2, 36.8, 40.4, 44, 47.4].forEach(h => poche(rectp(xa + 0.3 * SC, Y(h + 0.22), xb - 0.5 * SC, Y(h - 0.22)), 0.85)); P.wash(rectp(xa, Y(50), xb, Y(27)), GLASS, 0.3, { edge: 0, jit: 0.2, steps: 2 });
      P.line((xa + xb) / 2 - 4, Y(60), (xa + xb) / 2 - 4, Y(63.4), { w: 1.2, c: INK, passes: 1, over: 0 }); P.line((xa + xb) / 2 - 7.2, Y(62.2), (xa + xb) / 2 - 0.8, Y(62.2), { w: 1, c: INK, passes: 1, over: 0 }); }
    poche(rectp(X(89.4), Y(3.0), X(92.4), Y(-5.4)), 0.0);
    // rood screen at the choir step, with the crucifix, Mary and John
    { const rx = X(57.9), H = h => Y(h); poche(rectp(rx - 2, H(3.0), rx + 2, H(4.0)), 0.8);
      for (let k = 0; k < 5; k++) { const x0 = rx - 21 + k * 8.4; P.path(pointed(x0 + 0.8, x0 + 7.6, H(6.4), 1.6 * SC), { w: 0.9, c: INK, a: 0.9, rough: 0.2, passes: 1 }); P.line(x0 + 0.8, H(4), x0 + 0.8, H(6.4), { w: 0.8, c: INK, a: 0.9, passes: 1, over: 0 }); } P.line(rx - 24, H(6.6), rx + 24, H(6.6), { w: 1.6, c: INK, a: 0.95, passes: 1, over: 0.2 }); poche(rectp(rx - 24, H(7.0), rx + 24, H(6.6)), 0.85);
      P.line(rx, H(7.0), rx, H(13.4), { w: 1.6, c: INK, a: 0.95, passes: 1, over: 0 }); P.line(rx - 8, H(11.2), rx + 8, H(11.2), { w: 1.6, c: INK, a: 0.95, passes: 1, over: 0 }); P.circle(rx, H(13.6), 1.6, { w: 0.8, c: INK, passes: 1 }); P.line(rx, H(11.2), rx - 5, H(9.8), { w: 0.7, c: INK, passes: 1, over: 0 }); P.line(rx, H(11.2), rx + 5, H(9.8), { w: 0.7, c: INK, passes: 1, over: 0 });
      [-16, 16].forEach(dx => { P.poly([[rx + dx - 2.4, H(7.0)], [rx + dx + 2.4, H(7.0)], [rx + dx + 1.4, H(9.8)], [rx + dx - 1.4, H(9.8)]], { w: 0.8, c: INK, rough: 0.15, over: 0, passes: 1 }); P.circle(rx + dx, H(10.5), 1.6, { w: 0.8, c: INK, passes: 1 }); }); }
    // choir stalls with canopied gables, bishop's throne, high altar with retable and rails
    { const dz = 3.0, H = h => Y(h + dz);
      for (let k = 0; k < 12; k++) { const x0 = X(59.6) + k * 14.7; P.poly([[x0, H(0)], [x0 + 14.7, H(0)], [x0 + 14.7, H(4.0)], [x0, H(4.0)]], { w: 0.9, c: INK, rough: 0.15, over: 0, passes: 1 }); tone(rectp(x0, H(0), x0 + 14.7, H(4.0)), TIMBER, 0.32); P.poly([[x0, H(4.0)], [x0 + 7.35, H(6.2)], [x0 + 14.7, H(4.0)]], { w: 1, c: INK, rough: 0.15, over: 0, passes: 1 }); P.line(x0 + 7.35, H(6.2), x0 + 7.35, H(7.2), { w: 0.8, c: INK, passes: 1, over: 0 }); P.circle(x0 + 7.35, H(7.5), 1, { w: 0.5, c: INK, passes: 1 }); P.path(pointed(x0 + 2.2, x0 + 12.5, H(2.9), 1.0 * SC), { w: 0.7, c: INK, a: 0.85, rough: 0.15, passes: 1 }); P.hatch(rectp(x0 + 2, H(0.4), x0 + 12.7, H(2.9)), { ang: 80, gap: 1.6, a: 0.3, w: 0.35, c: INK }); }
      const ax = X(86.2); P.rect(ax - 20, H(0), 40, 1.1 * SC, { w: 1.3, c: INK, rough: 0.2, over: 0, passes: 1 }); tone(rectp(ax - 20, H(0), ax + 20, H(1.1)), STONE, 0.6); P.line(ax - 24, H(1.1), ax + 24, H(1.1), { w: 2, c: INK, passes: 1, over: 0 });
      P.rect(ax - 26, H(1.1), 52, 0.01 + 6.4 * SC, { w: 1, c: INK, rough: 0.2, over: 0, passes: 1 }); tone(rectp(ax - 26, H(1.1), ax + 26, H(7.5)), '#c9a25a', 0.36); for (let k = 0; k < 5; k++) { const x0 = ax - 22 + k * 9; P.path(pointed(x0 + 1, x0 + 8, H(5.2), 1.6 * SC), { w: 0.8, c: INK, a: 0.9, rough: 0.15, passes: 1 }); P.line(x0 + 1, H(2.2), x0 + 1, H(5.2), { w: 0.7, c: INK, a: 0.85, passes: 1, over: 0 }); P.circle(x0 + 4.5, H(3.6), 1.6, { w: 0.6, c: INK, passes: 1 }); P.line(x0 + 4.5, H(2.2), x0 + 4.5, H(3.0), { w: 0.6, c: INK, passes: 1, over: 0 }); }
      P.poly([[ax - 26, H(7.5)], [ax, H(9.6)], [ax + 26, H(7.5)]], { w: 1.1, c: INK, rough: 0.2, over: 0, passes: 1 }); P.line(ax, H(9.6), ax, H(10.8), { w: 0.8, c: INK, passes: 1, over: 0 }); P.line(ax - 2.4, H(10.4), ax + 2.4, H(10.4), { w: 0.7, c: INK, passes: 1, over: 0 });
      [-30, 30].forEach(d => { P.line(ax + d, H(0), ax + d, H(2.4), { w: 1, c: INK, passes: 1, over: 0 }); P.rect(ax + d - 1.6, H(2.4), 3.2, 4, { w: 0.6, c: INK, over: 0, passes: 1 }); P.line(ax + d, H(2.4) - 4, ax + d, H(2.4) - 9, { w: 0.6, c: INK, passes: 1, over: 0 }); tone([[ax + d - 1, H(2.4) - 9], [ax + d + 1, H(2.4) - 9], [ax + d, H(2.4) - 13]], '#f0d489', 0.9); });
      for (let k = 0; k < 9; k++) P.line(ax - 42 + k * 5.2, H(0), ax - 42 + k * 5.2, H(1.4), { w: 0.7, c: INK, a: 0.85, passes: 1, over: 0 }); P.line(ax - 44, H(1.4), ax - 0, H(1.4) + 0, { w: 0.9, c: INK, passes: 1, over: 0 });
      P.line(ax, H(29.5), ax, H(33), { w: 0.6, c: INK, passes: 1, over: 0 }); P.circle(ax, H(33.6), 2.6, { w: 0.9, c: INK, passes: 1 }); tone([[ax - 1.6, H(33.6) + 0.5], [ax + 1.6, H(33.6) + 0.5], [ax, H(33.6) + 4.4]], '#f0d489', 0.9); }
    // nave fittings: font & cover, corona chandelier, pulpit with sounding board, banners
    { const fx = X(7.2), H = h => Y(h); P.path([[fx - 8, H(0)], [fx - 5, H(0.9)], [fx - 3, H(1.0)], [fx - 3.4, H(2.4)], [fx - 10, H(2.6)], [fx - 11, H(3.4)], [fx + 11, H(3.4)], [fx + 10, H(2.6)], [fx + 3.4, H(2.4)], [fx + 3, H(1.0)], [fx + 5, H(0.9)], [fx + 8, H(0)]], { w: 1.1, c: INK, rough: 0.15, passes: 1 }); P.line(fx, H(3.4), fx, H(6.8), { w: 0.6, c: INK, passes: 1, over: 0 }); P.path([[fx - 9, H(3.4)], [fx - 5, H(5.2)], [fx, H(6.8)], [fx + 5, H(5.2)], [fx + 9, H(3.4)]], { w: 0.9, c: INK, rough: 0.15, passes: 1 }); P.line(fx, H(6.8), fx, H(22), { w: 0.3, c: INK, a: 0.5, passes: 1, over: 0, rough: 0.15 });
      const cx = X(24), cy = Y(22); P.line(cx, Y(29.2), cx, cy - 4, { w: 0.6, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.15 }); P.ellipse(cx, cy, 20, 4.6, { w: 1.2, c: INK, a: 0.95, passes: 1 }); P.ellipse(cx, cy, 15, 3.2, { w: 0.6, c: INK, a: 0.7, passes: 1 }); for (let k = 0; k < 12; k++) { const a = k * TAU / 12, px = cx + Math.cos(a) * 17.5, py = cy + Math.sin(a) * 3.9; P.line(px, py, px, py - 5, { w: 0.7, c: INK, passes: 1, over: 0 }); tone([[px - 0.9, py - 5], [px + 0.9, py - 5], [px, py - 8.4]], '#f0d489', 0.9); } P.line(cx - 20, cy, cx, Y(29.2), { w: 0.4, c: INK, a: 0.6, passes: 1, over: 0 }); P.line(cx + 20, cy, cx, Y(29.2), { w: 0.4, c: INK, a: 0.6, passes: 1, over: 0 }); P.curve([[cx - 8, cy + 2], [cx, cy + 9], [cx + 8, cy + 2]], { w: 0.6, c: INK, a: 0.75, rough: 0.2, passes: 1 });
      const px2 = X(28.2) + 8; P.line(px2, H(0), px2, H(2.6), { w: 1.6, c: INK, passes: 1, over: 0 }); P.path([[px2 - 7, H(2.6)], [px2 - 8.6, H(4.4)], [px2 + 8.6, H(4.4)], [px2 + 7, H(2.6)]], { w: 1, c: INK, rough: 0.15, passes: 1 }); tone([[px2 - 7, H(2.6)], [px2 - 8.6, H(4.4)], [px2 + 8.6, H(4.4)], [px2 + 7, H(2.6)]], TIMBER, 0.35); for (let k = -2; k <= 2; k++) P.line(px2 + k * 3, H(2.8), px2 + k * 3.2, H(4.3), { w: 0.4, c: INK, a: 0.7, passes: 1, over: 0 }); P.line(px2 - 9, H(8.4), px2 + 9, H(8.4), { w: 1.3, c: INK, passes: 1, over: 0 }); P.line(px2, H(4.4), px2, H(8.4), { w: 0.6, c: INK, a: 0.7, passes: 1, over: 0 }); P.path([[px2 - 9, H(8.4)], [px2, H(9.6)], [px2 + 9, H(8.4)]], { w: 0.9, c: INK, rough: 0.15, passes: 1 });
      [X(11.4), X(36.6)].forEach((bx, i) => { const by = H(19.2); P.line(bx, by - 2, bx, by + 2, { w: 0.5, c: INK, passes: 1, over: 0 }); P.poly([[bx - 3.6, by + 2], [bx + 3.6, by + 2], [bx + 3.6, by + 24], [bx, by + 28], [bx - 3.6, by + 24]], { w: 0.8, c: INK, rough: 0.15, over: 0, passes: 1 }); tone([[bx - 3.6, by + 2], [bx + 3.6, by + 2], [bx + 3.6, by + 24], [bx, by + 28], [bx - 3.6, by + 24]], i ? '#9a4a3a' : '#5a6a8a', 0.5); P.line(bx, by + 6, bx, by + 22, { w: 0.5, c: INK, a: 0.6, passes: 1, over: 0 }); P.line(bx - 2.4, by + 12, bx + 2.4, by + 12, { w: 0.5, c: INK, a: 0.6, passes: 1, over: 0 }); }); }


    /* ================= 8. TRANSVERSE SECTION through the nave: vault, roof truss, aisles, flying buttresses ================= */
    { const K = 9.3, CX = 1236, G = 782, TX = m => CX + m * K, TY = h => G - h * K, both = f => { f(1); f(-1); };
      const mirr = pts => pts.map(([x, y]) => [2 * CX - x, y]);
      // ground and earth
      const earth = rectp(944, G, 1528, 862); P.wash(earth, '#b39a72', 0.32, { grad: { x0: 0, y0: G, x1: 0, y1: 862, c0: '#b39a72', c1: '#8b7350', a0: 0.28, a1: 0.42 }, edge: 0, jit: 0.4, steps: 2 }); P.hatch(earth, { ang: 68, gap: 4.4, a: 0.3, w: 0.5, c: INK, ragged: 2, piece: 14, fade: (x, y) => 0.4 + (y - G) / 200 }); P.stipple(earth, 420, { a: 0.45, r: 1.1, c: INK });
      P.line(944, G, 1528, G, { w: 1.8, c: INK, a: 0.95, rough: 0.6, passes: 2 });
      // interior backdrop: the far end of the church (crossing arch, big glowing east window) seen down the nave
      { const bw = 6.7 * K, top = TY(37.6); const open = [[CX - bw, TY(0)], [CX - bw, TY(29)], ...pointed(CX - bw, CX + bw, TY(29), 8.6 * K).slice(1, -1), [CX + bw, TY(29)], [CX + bw, TY(0)]];
        P.wash(open, '#f6ecd0', 0.7, { grad: { x0: 0, y0: TY(38), x1: 0, y1: TY(0), c0: '#f7e3a8', c1: '#efe3c0', a0: 0.75, a1: 0.5 }, edge: 0, jit: 0.3, steps: 2 });
        const wx0 = CX - 3.6 * K, wx1 = CX + 3.6 * K, win = [[wx0, TY(14)], [wx0, TY(27)], ...pointed(wx0, wx1, TY(27), 6.8 * K).slice(1, -1), [wx1, TY(27)], [wx1, TY(14)]];
        P.wash(win, GLASS, 0.72, { grad: { x0: 0, y0: TY(34), x1: 0, y1: TY(14), c0: '#f8e6a8', c1: '#d9a54e', a0: 0.85, a1: 0.6 }, edge: 0.3, jit: 0.2, steps: 2 }); P.hatch(win, { ang: 45, gap: 3.4, a: 0.28, w: 0.35, c: INK }); P.hatch(win, { ang: -45, gap: 3.4, a: 0.28, w: 0.35, c: INK });
        P.path(win.concat([win[0]]), { w: 1.3, c: INK, a: 0.92, rough: 0.25, passes: 1 }); for (let k = -2; k <= 2; k++) P.line(CX + k * 1.44 * K, TY(14), CX + k * 1.44 * K, TY(k % 2 ? 26 : 30 - Math.abs(k)), { w: 0.8, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.15 }); [20, 24].forEach(h => P.line(wx0, TY(h), wx1, TY(h), { w: 0.6, c: INK, a: 0.7, passes: 1, over: 0 }));
        for (let q = 0; q < 6; q++) { const a = q * TAU / 6 + 0.5; P.circle(CX + Math.cos(a) * 1.9 * K, TY(31.6) + Math.sin(a) * 1.9 * K, 0.7 * K, { w: 0.7, c: INK, a: 0.85, passes: 1 }); } P.circle(CX, TY(31.6), 3.2 * K, { w: 1, c: INK, a: 0.9, passes: 1 });
        // arcade of the choir behind the rood screen, and the screen itself
        for (let k = -3; k <= 3; k++) { const ax2 = CX + k * 1.7 * K; P.path(pointed(ax2 - 0.85 * K, ax2 + 0.85 * K, TY(5.2), 1.3 * K), { w: 0.8, c: INK, a: 0.85, rough: 0.2, passes: 1 }); P.line(ax2 - 0.85 * K, TY(5.2), ax2 - 0.85 * K, TY(3), { w: 0.7, c: INK, a: 0.85, passes: 1, over: 0 }); P.line(ax2 + 0.85 * K, TY(5.2), ax2 + 0.85 * K, TY(3), { w: 0.7, c: INK, a: 0.85, passes: 1, over: 0 }); }
        P.line(CX - bw, TY(6.8), CX + bw, TY(6.8), { w: 1.2, c: INK, a: 0.85, passes: 1, over: 0 }); P.line(CX, TY(6.8), CX, TY(10.8), { w: 1.2, c: INK, passes: 1, over: 0 }); P.line(CX - 2.4, TY(9.4), CX + 2.4, TY(9.4), { w: 1.2, c: INK, passes: 1, over: 0 }); P.path(open.concat([open[0]]), { w: 1.2, c: INK, a: 0.85, rough: 0.3, passes: 1 }); }
      // light shafts from the clerestory windows falling across the nave
      [[-1, 0.0], [1, 0.0]].forEach(([sg]) => { const a = [TX(sg * 6.7), TY(32.4)], b = [TX(sg * 6.7), TY(24.4)], c = [TX(-sg * 1.4), TY(0)], d = [TX(sg * 1.0 - sg * 4.2), TY(0)]; const beam = [a, b, [TX(-sg * 0.6), TY(0)], [TX(-sg * 4.8), TY(0)]]; P.wash(beam, '#f6d67a', 0.16, { edge: 0, jit: 0.4, steps: 3 }); P.hatch(beam, { ang: sg > 0 ? -58 : 58, gap: 4.2, a: 0.2, w: 0.4, c: '#b8862a', piece: 16, fade: () => 0.8 }); void c; void d; });
      // nave vault: crown, ribs, boss; aisle vaults; each cut with poché
      both(sg => {
        const px = TX(sg * 6.7);
        // vault web (0.6 m thick), springing at 29, crown at 38, pointed arch
        const outer = pointed(TX(-6.7), TX(6.7), TY(29), 9.0 * K), n2 = outer.length, half = sg > 0 ? outer.slice(Math.floor(n2 / 2)) : outer.slice(0, Math.ceil(n2 / 2));
        void half;
      });
      { const o1 = pointed(TX(-6.7), TX(6.7), TY(29), 9.0 * K), o2 = pointed(TX(-7.3), TX(7.3), TY(29) + 0, 9.3 * K); poche([...o1, ...o2.slice().reverse()], 0.85); P.path(o1, { w: 1.6, c: INK, a: 0.95, rough: 0.3, passes: 1 }); P.path(o2, { w: 1.1, c: INK, a: 0.9, rough: 0.3, passes: 1 });
        P.circle(CX, TY(38), 0.7 * K, { w: 1.2, c: INK, a: 0.95, passes: 1 }); disc(CX, TY(38), 0.6 * K, INK, 0.85); for (let q = 0; q < 6; q++) { const a = q * TAU / 6; P.line(CX + Math.cos(a) * 0.7 * K, TY(38) + Math.sin(a) * 0.7 * K, CX + Math.cos(a) * 1.0 * K, TY(38) + Math.sin(a) * 1.0 * K, { w: 0.6, c: INK, a: 0.85, passes: 1, over: 0 }); }
        // rubble haunching above the springing on each side
        both(sg => { const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([TX(sg * (7.3 - t * 3.4)), TY(29 + 4.4 * t * t)]); } const poly = [[TX(sg * 8.3), TY(29)], [TX(sg * 8.3), TY(33.6)], ...pts.slice().reverse().map(p => [p[0], p[1] - 0]), [TX(sg * 7.3), TY(29)]]; P.wash([[TX(sg * 7.4), TY(29.0)], [TX(sg * 8.2), TY(29.0)], [TX(sg * 8.2), TY(33.5)], [TX(sg * 4.6), TY(33.5)]], '#8b7350', 0.4, { edge: 0, jit: 0.3, steps: 2 }); P.stipple([[TX(sg * 7.4), TY(29.0)], [TX(sg * 8.2), TY(29.0)], [TX(sg * 8.2), TY(33.5)], [TX(sg * 4.6), TY(33.5)]], 60, { a: 0.5, r: 1, c: INK }); void poly; });
        P.line(TX(-8.2), TY(33.6), TX(8.2), TY(33.6), { w: 0.6, c: INK, a: 0.5, passes: 1, over: 0 });
        // transverse ribs in elevation beyond (dashed) and the ridge of the vault
        P.path(pointed(TX(-6.7) + 4, TX(6.7) - 4, TY(29), 8.6 * K), { w: 0.6, c: INK, a: 0.5, rough: 0.3, passes: 1 }); }
      // nave arcade piers + high walls (cut solid), aisle vaults, aisle roofs, walls, buttress piers
      both(sg => {
        const S = pts => sg > 0 ? pts : mirr(pts);
        // nave wall/pier (cut): from 6.7 to 8.3 to height 29, then thinner wall to the roof plate
        poche(S([[TX(6.7), TY(0)], [TX(8.3), TY(0)], [TX(8.3), TY(34.4)], [TX(8.0), TY(34.4)], [TX(8.0), TY(39.5)], [TX(7.2), TY(39.5)], [TX(7.2), TY(34.4)], [TX(6.7), TY(34.4)]]), 0.82);
        // shafts on the nave face
        [0.5, 1.4].forEach(d => P.line(sg > 0 ? TX(6.7 - d * 0.0) - 0.0 : TX(-6.7), TY(1), sg > 0 ? TX(6.7) : TX(-6.7), TY(29), { w: 0.01, c: INK, a: 0, passes: 1 }));
        [[TX(6.7), 12.5], [TX(6.7), 29]].forEach(([x, h]) => { const xx = sg > 0 ? x : 2 * CX - x; P.rect(xx - 4, TY(h) - 2, 8, 5, { w: 0.9, c: INK, a: 0.95, rough: 0.15, over: 0, passes: 1 }); });
        // aisle wall (cut) with buttress pier mass
        poche(S([[TX(13.8), TY(0)], [TX(22.4), TY(0)], [TX(22.4), TY(8.4)], [TX(21.6), TY(8.4)], [TX(21.6), TY(19.4)], [TX(17.0), TY(19.4)], [TX(17.0), TY(19.6)], [TX(15.2), TY(19.6)], [TX(15.2), TY(20.6)], [TX(13.8), TY(20.6)]]), 0.82);
        // buttress pier above aisle roof
        poche(S([[TX(17.0), TY(19.4)], [TX(21.6), TY(19.4)], [TX(21.6), TY(27.2)], [TX(21.0), TY(27.2)], [TX(21.0), TY(35.6)], [TX(20.4), TY(35.6)], [TX(20.4), TY(40.0)], [TX(17.6), TY(40.0)], [TX(17.6), TY(35.6)], [TX(17.0), TY(35.6)]]), 0.82);
        // set-off weatherings
        [[TX(22.4), 8.4, TX(21.6)], [TX(21.6), 27.2, TX(21.0)], [TX(21.0), 35.6, TX(20.4)]].forEach(([xa, h, xb]) => { const A = sg > 0 ? xa : 2 * CX - xa, B = sg > 0 ? xb : 2 * CX - xb; P.line(A, TY(h), B, TY(h + 0.5), { w: 1.3, c: INK, passes: 1, over: 0.2 }); });
        // pinnacle: octagonal spire with crockets, niche & statue, finial
        { const bx = sg > 0 ? TX(19.0) : 2 * CX - TX(19.0), by = TY(40.0), hw = 1.6 * K;
          P.poly([[bx - hw, by], [bx + hw, by], [bx + 0.4, TY(48.6)], [bx - 0.4, TY(48.6)]], { w: 1.2, c: INK, rough: 0.2, over: 0, passes: 1 }); tone([[bx - hw, by], [bx + hw, by], [bx + 0.4, TY(48.6)], [bx - 0.4, TY(48.6)]], STONE, 0.55); P.hatch([[bx, by], [bx + hw, by], [bx + 0.4, TY(48.6)], [bx, TY(48.6)]], { ang: 84, gap: 1.8, a: 0.4, w: 0.4, c: INK });
          for (let k = 1; k < 9; k++) { const t2 = k / 9, yy = lerp(by, TY(48.6), t2), xx = lerp(hw, 0.4, t2); [-1, 1].forEach(q => P.curve([[bx + q * xx, yy], [bx + q * (xx + 2.6), yy - 1], [bx + q * (xx + 2), yy - 4]], { w: 0.7, c: INK, a: 0.9, rough: 0.1, passes: 1 })); }
          P.circle(bx, TY(48.6) - 1.4, 1.6, { w: 0.9, c: INK, passes: 1 }); P.line(bx, TY(48.6) - 3, bx, TY(48.6) - 9, { w: 0.8, c: INK, passes: 1, over: 0 }); P.line(bx - 3, TY(48.6) - 6.6, bx + 3, TY(48.6) - 6.6, { w: 0.8, c: INK, passes: 1, over: 0 });
          const nb = [[bx - 1.7 * K, TY(35.6)], [bx - 1.7 * K, TY(38.6)], ...pointed(bx - 1.7 * K, bx + 1.7 * K, TY(38.6), 1.2 * K).slice(1, -1), [bx + 1.7 * K, TY(38.6)], [bx + 1.7 * K, TY(35.6)]]; tone(nb, '#f4ead0', 0.9); P.path(nb.concat([nb[0]]), { w: 0.8, c: INK, a: 0.9, rough: 0.15, passes: 1 }); P.circle(bx, TY(37.6) - 2, 1.5, { w: 0.7, c: INK, passes: 1 }); P.poly([[bx - 1.6, TY(37.6)], [bx + 1.6, TY(37.6)], [bx + 1.2, TY(35.7)], [bx - 1.2, TY(35.7)]], { w: 0.7, c: INK, rough: 0.1, over: 0, passes: 1 }); }
        // aisle vault (pointed, poché web) with a boss
        { const a1 = pointed(TX(sg > 0 ? 8.3 : -13.8), TX(sg > 0 ? 13.8 : -8.3), TY(10.0), 6.4 * K), a2 = pointed(TX(sg > 0 ? 8.3 : -13.8) - 0, TX(sg > 0 ? 13.8 : -8.3), TY(10.0) - 5, 6.4 * K + 0); poche([...a1, ...a2.slice().reverse()].map(([x, y], i) => [x, i < a1.length ? y : y + 5]), 0.85); P.path(a1, { w: 1.4, c: INK, a: 0.95, rough: 0.3, passes: 1 }); const bxm = TX(sg * 11.05); P.circle(bxm, TY(16.4), 0.4 * K, { w: 0.9, c: INK, passes: 1 }); disc(bxm, TY(16.4), 0.35 * K, INK, 0.8);
          // rubble haunches, bare timbers for the lean-to roof, and cross-section of rafters & wall-plate
          const rs = [TX(sg * 8.3), TY(22.7)], re = [TX(sg * 14.4), TY(19.9)]; P.line(rs[0], rs[1], re[0], re[1], { w: 2.4, c: INK, a: 0.95, passes: 1, over: 0, rough: 0.2 }); P.line(rs[0], rs[1] + 4, re[0], re[1] + 4, { w: 1.2, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.2 }); for (let k = 1; k < 7; k++) { const t2 = k / 7; P.line(lerp(rs[0], re[0], t2), lerp(rs[1], re[1], t2), lerp(rs[0], re[0], t2), lerp(rs[1], re[1], t2) + 4, { w: 0.5, c: INK, a: 0.7, passes: 1, over: 0 }); } P.wash([[rs[0], rs[1]], [re[0], re[1]], [re[0], TY(16.8)], [rs[0], TY(19.4)]], TIMBER, 0.18, { edge: 0, jit: 0.3, steps: 2 });
          const tb = [TX(sg * 8.3), TY(20.2)]; P.line(tb[0], tb[1], TX(sg * 14.4), TY(17.4), { w: 1.2, c: INK, a: 0.85, passes: 1, over: 0 }); P.line(TX(sg * 11.4), TY(18.8), TX(sg * 11.4), TY(21.2), { w: 0.9, c: INK, passes: 1, over: 0 }); }
      });
      // the two flying buttresses per side: intrados arcs, thick extrados, water channel, pierced spandrel, gargoyle
      both(sg => {
        const fly = (xp, yp, xw, yw, thick, o) => {
          const A = [TX(sg * xp), TY(yp)], B = [TX(sg * xw), TY(yw)], mid = [lerp(A[0], B[0], 0.5), lerp(A[1], B[1], 0.5) + (o.sag ?? 3.2 * K)];
          const intra = S.catmull([A, [lerp(A[0], B[0], 0.25), lerp(A[1], B[1], 0.25) + (o.sag ?? 3.2 * K) * 0.68], mid, [lerp(A[0], B[0], 0.75), lerp(A[1], B[1], 0.75) + (o.sag ?? 3.2 * K) * 0.26], B], false, 5);
          const ext = [[A[0], A[1] - thick], [B[0], B[1] - thick * 0.9]];
          const poly = [...intra, [B[0], B[1] - thick * 0.9], [A[0], A[1] - thick]];
          poche(poly, 0.82); P.path(intra, { w: 1.6, c: INK, a: 0.98, rough: 0.25, passes: 1 }); P.line(ext[0][0], ext[0][1], ext[1][0], ext[1][1], { w: 1.6, c: INK, a: 0.95, passes: 1, over: 0, rough: 0.2 });
          // coping and channel
          P.line(ext[0][0], ext[0][1] - 3, ext[1][0], ext[1][1] - 3, { w: 1.1, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.line(ext[0][0], ext[0][1] - 1.4, ext[1][0], ext[1][1] - 1.4, { w: 0.5, c: '#4a6a80', a: 0.9, passes: 1, over: 0 });
          // water arrows down the channel
          for (let k = 1; k < 4; k++) { const t2 = k / 4, px = lerp(ext[0][0], ext[1][0], t2), py = lerp(ext[0][1], ext[1][1], t2) - 2.2; P.line(px - sg * 5, py + sg * 0, px + sg * 3, py + 0, { w: 0.01, c: '#4a6a80', a: 0, passes: 1 }); }
          // gargoyle at the outer end spouting water to the ground
          const gx = A[0] + sg * 0, gy = A[1] - thick - 1; void gx; void gy;
        };
        fly(17.0, 26.0, 8.3, 28.6, 1.55 * K, { sag: 2.2 * K });
        fly(17.0, 33.2, 8.3, 36.0, 1.3 * K, { sag: 1.6 * K });
        // landing corbels on the nave wall, and the pierced spandrels (drawn as small quatrefoils on a light wash)
        [[28.6, 26.0], [36.0, 33.2]].forEach(([hw, hp]) => { const yy = TY((hw + hp) / 2 + 0.6), xx = TX(sg * 12.65); P.circle(xx, yy + 5, 3.2, { w: 0.01, c: INK, a: 0, passes: 1 }); });
        // gargoyles: a grotesque head with open mouth at each pinnacle
        const gy2 = TY(38.0), gx2 = TX(sg * 22.0); P.poly([[gx2 - sg * 0, gy2 - 5], [gx2 + sg * 14, gy2 - 1], [gx2 + sg * 15, gy2 + 3], [gx2 + sg * 6, gy2 + 6], [gx2, gy2 + 4]], { w: 1, c: INK, rough: 0.2, over: 0, passes: 1 }); tone([[gx2, gy2 - 5], [gx2 + sg * 14, gy2 - 1], [gx2 + sg * 15, gy2 + 3], [gx2 + sg * 6, gy2 + 6], [gx2, gy2 + 4]], STONE, 0.6); P.circle(gx2 + sg * 10, gy2, 1.1, { w: 0.6, c: INK, passes: 1 }); P.dot(gx2 + sg * 10, gy2, 0.6, { c: INK }); P.line(gx2 + sg * 15, gy2 + 3, gx2 + sg * 14, gy2 + 22, { w: 0.6, c: '#4a6a80', a: 0.9, passes: 1, over: 0, rough: 0.5 }); P.line(gx2 + sg * 15.6, gy2 + 3, gx2 + sg * 15, gy2 + 26, { w: 0.4, c: '#4a6a80', a: 0.7, passes: 1, over: 0, rough: 0.5 });
      });
      // roof: wall plates, king-post truss cut in section, rafters, lead
      { const wp = [TX(-8.9), TY(39.5)], wq = [TX(8.9), TY(39.5)], rid = [CX, TY(52.4)]; both(sg => { const A = [TX(sg * 8.9), TY(39.5)]; poche([[A[0] - 6, A[1]], [A[0] + 6, A[1]], [A[0] + 6, A[1] + 7], [A[0] - 6, A[1] + 7]].map(([x, y]) => [x, y]), 0.85); P.line(A[0] + sg * 4, A[1] + 1, rid[0], rid[1], { w: 3, c: INK, a: 0.95, passes: 1, over: 0, rough: 0.15 }); P.line(A[0] + sg * 4, A[1] - 2, rid[0], rid[1] - 2, { w: 1.2, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.15 }); });
        // tie beam, king post, collar, struts, purlins
        poche(rectp(TX(-8.6), TY(40.6) - 2.6, TX(8.6), TY(40.6) + 2.6), 0.85); poche(rectp(CX - 2.6, TY(51.6), CX + 2.6, TY(40.6)), 0.85); poche(rectp(TX(-4.6), TY(46.6) - 2, TX(4.6), TY(46.6) + 2), 0.85);
        both(sg => { P.line(CX, TY(46.6), TX(sg * 6.2), TY(40.6), { w: 3, c: INK, a: 0.92, passes: 1, over: 0, rough: 0.15 }); P.line(CX + sg * 0, TY(44.3), TX(sg * 3.7), TY(43.5) , { w: 0.01, c: INK, a: 0, passes: 1 }); P.line(TX(sg * 3.4), TY(46.6), TX(sg * 5.4), TY(43.4), { w: 2.4, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.15 }); const pu = [TX(sg * 3.8), TY(47.6)]; P.rect(pu[0] - 4, pu[1] - 4, 8, 8, { w: 1, c: INK, a: 0.95, rough: 0.15, over: 0, passes: 1 }); P.line(pu[0] - 4, pu[1] - 4, pu[0] + 4, pu[1] + 4, { w: 0.5, c: INK, a: 0.6, passes: 1, over: 0 }); P.line(pu[0] - 4, pu[1] + 4, pu[0] + 4, pu[1] - 4, { w: 0.5, c: INK, a: 0.6, passes: 1, over: 0 }); });
        P.line(CX, TY(51.6), CX, TY(53.4), { w: 0.01, c: INK, a: 0, passes: 1 }); P.rect(CX - 5, rid[1] - 6, 10, 6, { w: 1.1, c: INK, a: 0.95, rough: 0.15, over: 0, passes: 1 });
        // lead roof, rolls and cresting
        both(sg => { const A = [TX(sg * 9.6), TY(39.2)], B = [CX, TY(52.8)]; P.line(A[0], A[1], B[0], B[1], { w: 2, c: INK, a: 0.95, passes: 1, over: 0, rough: 0.2 }); for (let k = 1; k < 12; k++) { const t2 = k / 12; P.line(lerp(A[0], B[0], t2), lerp(A[1], B[1], t2) - 1.5, lerp(A[0], B[0], t2) + sg * 0, lerp(A[1], B[1], t2) - 4.5, { w: 0.4, c: INK, a: 0.6, passes: 1, over: 0 }); } });
        P.wash([[TX(-9.6), TY(39.2)], [CX, TY(52.8)], [TX(9.6), TY(39.2)]], LEAD, 0.24, { edge: 0.2, jit: 0.3, steps: 2 }); }
      // foundations: stepped footings with rubble and piles below the piers and buttress
      both(sg => { const S2 = pts => sg > 0 ? pts : mirr(pts); poche(S2([[TX(6.7), TY(0)], [TX(8.3), TY(0)], [TX(9.6), TY(-2.4)], [TX(9.6), TY(-5.6)], [TX(5.4), TY(-5.6)], [TX(5.4), TY(-2.4)]]), 0.55); poche(S2([[TX(13.8), TY(0)], [TX(22.4), TY(0)], [TX(23.6), TY(-2.8)], [TX(23.6), TY(-6.4)], [TX(12.6), TY(-6.4)], [TX(12.6), TY(-2.8)]]), 0.55); [[7.2, 9.0], [12.8, 14.6], [17.6, 19.4], [21.8, 23.4]].forEach(([a, b]) => { for (let q = 0; q < 3; q++) { const x = TX(sg * (a + (b - a) * q / 2)); P.line(x, TY(-6.4), x, TY(-6.4) + 24, { w: 1.6, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.poly([[x - 2, TY(-6.4) + 24], [x + 2, TY(-6.4) + 24], [x, TY(-6.4) + 30]], { w: 0.7, c: INK, over: 0, passes: 1 }); } }); });
      // floor and pilgrims: a procession with a processional cross, a dog, kneeling penitent
      P.rect(TX(-13.8), TY(0), 27.6 * K, 0.3 * K, { w: 0.8, c: INK, rough: 0.3, over: 0, passes: 1 }); for (let x = TX(-13.6); x < TX(13.6); x += 12) P.line(x, TY(0), x, TY(0) + 2.8, { w: 0.4, c: INK, a: 0.6, passes: 1, over: 0 });
      const person = (x, y, sc, c = INK) => { P.circle(x, y - 15.6 * sc, 2 * sc, { w: 0.9, c, passes: 1 }); disc(x, y - 15.6 * sc, 1.9 * sc, c, 0.85); P.poly([[x - 2.4 * sc, y - 13.4 * sc], [x + 2.4 * sc, y - 13.4 * sc], [x + 3.6 * sc, y], [x - 3.6 * sc, y]], { w: 0.8, c, rough: 0.15, over: 0, passes: 1 }); tone([[x - 2.4 * sc, y - 13.4 * sc], [x + 2.4 * sc, y - 13.4 * sc], [x + 3.6 * sc, y], [x - 3.6 * sc, y]], c, 0.5); };
      [[-4.6, 1.0], [-3.2, 0.95], [-1.9, 1.05], [0.6, 1.0], [2.0, 0.9], [3.4, 1.0], [5.0, 0.95]].forEach(([m, sc]) => person(TX(m), TY(0), sc));
      { const cx0 = TX(-0.4); person(cx0, TY(0), 1.05); P.line(cx0 + 5, TY(0), cx0 + 5, TY(0) - 44, { w: 0.9, c: INK, passes: 1, over: 0 }); P.line(cx0 + 1, TY(0) - 36, cx0 + 9, TY(0) - 36, { w: 0.9, c: INK, passes: 1, over: 0 }); P.circle(cx0 + 5, TY(0) - 46, 1.4, { w: 0.7, c: INK, passes: 1 }); }
      { const dx = TX(6.4), dy = TY(0); P.ellipse(dx, dy - 5, 6, 3, { w: 0.9, c: INK, passes: 1 }); disc(dx, dy - 5, 5.6, INK, 0.5); P.circle(dx + 7, dy - 8, 2.2, { w: 0.8, c: INK, passes: 1 }); P.line(dx - 5, dy - 3, dx - 5, dy, { w: 0.8, c: INK, passes: 1, over: 0 }); P.line(dx + 4, dy - 3, dx + 4, dy, { w: 0.8, c: INK, passes: 1, over: 0 }); P.curve([[dx - 6, dy - 6], [dx - 10, dy - 12], [dx - 8, dy - 14]], { w: 0.7, c: INK, rough: 0.1, passes: 1 }); }
      // dimensions and callouts
      P.dim(TX(-7.5), TY(0) + 50, TX(7.5), TY(0) + 50, 'NAVE 15 M', 0, { size: 11 }); P.dim(TX(-22.4), TY(0) + 74, TX(22.4), TY(0) + 74, 'OVERALL 45 M', 0, { size: 11 });
      P.dim(TX(24.2), TY(0), TX(24.2), TY(52.4), 'RIDGE 52 M', 14, { size: 11 }); P.dim(TX(-24.2), TY(0), TX(-24.2), TY(38), 'VAULT 38 M', -14, { size: 11 });
      }


    /* ================= 9. plates: arch forms, mason's tools, rib-vault plan, pier plan, tracery, mouldings ================= */
    const plate = (x0, y0, x1, y1, title) => { P.rect(x0, y0, x1 - x0, y1 - y0, { w: 1.1, c: INK, a: 0.9, rough: 0.4, over: 1, passes: 1 }); P.rect(x0 + 3, y0 + 3, x1 - x0 - 6, y1 - y0 - 6, { w: 0.4, c: INK, a: 0.55, rough: 0.3, over: 0, passes: 1 }); P.text(title, (x0 + x1) / 2, y0 + 15, { size: 9.4, c: INK, align: 'center', font: S.HAND, a: 0.95 }); P.line(x0 + 10, y0 + 20, x1 - 10, y0 + 20, { w: 0.4, c: INK, a: 0.6, passes: 1, over: 0, rough: 0.3 }); };
    const cross = (x, y, r = 2.4) => { P.line(x - r, y, x + r, y, { w: 0.5, c: '#a04030', a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(x, y - r, x, y + r, { w: 0.5, c: '#a04030', a: 0.95, passes: 1, over: 0, rough: 0.1 }); };
    // ---- ARCH FORMS ----
    plate(62, 62, 432, 208, 'FORMS OF THE GOTHIC ARCH');
    [['LANCET', 0.68], ['EQUILATERAL', 1.0], ['DROP', 1.36], ['FOUR-CENTRED', 0]].forEach(([nm, k], i) => {
      const x0 = 74 + i * 89, w = 72, ys = 168;
      if (k) { const R0 = w * k, cL = x0 + R0, cR = x0 + w - R0, apexY = ys - Math.sqrt(R0 * R0 - (((x0 + w / 2) - cL) ** 2)), pts = [];
        // draw with the shared helper instead (same geometry)
        const rise = Math.sqrt(R0 * R0 - (R0 - w / 2) ** 2); P.path(pointed(x0, x0 + w, ys, rise), { w: 1.3, c: INK, a: 0.95, rough: 0.2, passes: 1 });
        P.line(x0, ys, x0 + w, ys, { w: 0.9, c: INK, passes: 1, over: 0 }); P.line(x0, ys, x0, ys + 8, { w: 0.6, c: INK, passes: 1, over: 0 }); P.line(x0 + w, ys, x0 + w, ys + 8, { w: 0.6, c: INK, passes: 1, over: 0 });
        cross(x0 + R0, ys); cross(x0 + w - R0, ys); P.dashed(x0 + R0, ys, x0 + w / 2, ys - rise, [3, 3], { w: 0.4, c: '#a04030', a: 0.7 }); P.dashed(x0 + w - R0, ys, x0 + w / 2, ys - rise, [3, 3], { w: 0.4, c: '#a04030', a: 0.7 });
        P.wash([[x0, ys], ...pointed(x0, x0 + w, ys, rise), [x0 + w, ys]], STONE, 0.22, { edge: 0, jit: 0.3, steps: 1 }); }
      else { const rise = 26; const c1 = w * 0.26, pts = [[x0, ys], [x0, ys - 16]]; for (let q = 1; q <= 5; q++) { const th = q / 5 * Math.PI / 2; pts.push([x0 + c1 - c1 * Math.cos(th), ys - 16 - c1 * Math.sin(th)]); } for (let q = 1; q <= 8; q++) { const t2 = q / 8; pts.push([lerp(x0 + c1, x0 + w / 2, t2), lerp(ys - 16 - c1, ys - 16 - c1 - 12, Math.sin(t2 * Math.PI / 2))]); } const half = pts.slice(); const other = half.map(([x, y]) => [2 * (x0 + w / 2) - x, y]).reverse(); P.path([...half, ...other.slice(1)], { w: 1.3, c: INK, a: 0.95, rough: 0.2, passes: 1 }); P.line(x0, ys, x0 + w, ys, { w: 0.9, c: INK, passes: 1, over: 0 }); [[x0 + c1, ys - 16], [x0 + w - c1, ys - 16], [x0 + w * 0.5 - 12, ys - 4], [x0 + w * 0.5 + 12, ys - 4]].forEach(([cx, cy]) => cross(cx, cy)); void rise; }
      P.text(nm, x0 + w / 2, 196, { size: 7.6, c: INK, align: 'center', a: 0.95 });
    });
    // ---- MASON'S TOOLS ----
    plate(62, 216, 432, 330, "THE MASTER MASON'S KIT");
    { const y = 300;
      // compasses
      P.line(90, y, 108, y - 62, { w: 1.4, c: INK, passes: 1, over: 0 }); P.line(126, y, 108, y - 62, { w: 1.4, c: INK, passes: 1, over: 0 }); P.circle(108, y - 64, 3.4, { w: 1, c: INK, passes: 1 }); P.arc(108, y - 30, 24, 24, 0.4, 1.6, { w: 0.5, c: INK, a: 0.7, passes: 1 }); P.line(90, y, 88, y + 5, { w: 0.8, c: INK, passes: 1, over: 0 });
      // set square and 3-4-5
      P.pl([[150, y], [150, y - 56], [210, y]], { w: 1.3, c: INK, closed: true, rough: 0.2, over: 0 }); P.pl([[158, y - 8], [158, y - 38], [186, y - 8]], { w: 0.7, c: INK, closed: true, rough: 0.2, over: 0, a: 0.8 }); for (let k = 1; k < 10; k++) P.line(150, y - k * 5.6, 154, y - k * 5.6, { w: 0.4, c: INK, passes: 1, over: 0 }); P.text('3', 141, y - 30, { size: 8, c: INK }); P.text('4', 180, y + 12, { size: 8, c: INK }); P.text('5', 188, y - 34, { size: 8, c: INK });
      // plumb line with bob
      P.line(238, y - 70, 238, y - 20, { w: 0.6, c: INK, passes: 1, over: 0 }); P.poly([[233, y - 20], [243, y - 20], [238, y]], { w: 1, c: INK, rough: 0.1, over: 0, passes: 1 }); disc(238, y - 14, 4, INK, 0.5); P.line(230, y - 70, 246, y - 70, { w: 1, c: INK, passes: 1, over: 0 });
      // mallet and chisel
      P.rect(268, y - 28, 34, 15, { w: 1.2, c: INK, rough: 0.2, over: 0, passes: 1 }); tone(rectp(268, y - 28, 302, y - 13), TIMBER, 0.5); P.line(285, y - 13, 285, y + 8, { w: 3, c: INK, a: 0.9, passes: 1, over: 0 }); P.line(318, y - 60, 340, y - 6, { w: 3, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.2 }); P.poly([[336, y - 12], [344, y - 12], [341, y + 2]], { w: 0.8, c: INK, rough: 0.1, over: 0, passes: 1 });
      // trammel & straight edge & string line
      P.line(368, y - 30, 420, y - 30, { w: 1.6, c: INK, passes: 1, over: 0, rough: 0.2 }); for (let k = 0; k < 14; k++) P.line(370 + k * 3.7, y - 30, 370 + k * 3.7, y - 30 + (k % 5 ? 3 : 6), { w: 0.4, c: INK, a: 0.8, passes: 1, over: 0 }); P.text('CUBIT', 394, y - 38, { size: 7, c: INK, align: 'center', a: 0.9 });
      P.curve([[366, y - 4], [386, y - 12], [406, y - 2], [422, y - 10]], { w: 0.6, c: INK, a: 0.9, rough: 0.3, passes: 1 }); P.circle(366, y - 4, 2, { w: 0.7, c: INK, passes: 1 }); P.circle(422, y - 10, 2, { w: 0.7, c: INK, passes: 1 }); P.text('LINE', 394, y + 10, { size: 7, c: INK, align: 'center', a: 0.9 }); }
    // ---- RIB VAULT PLAN ----
    plate(554, 62, 838, 262, 'RIB VAULT  -  PLAN OF ONE BAY');
    { const x0 = 590, y0 = 98, x1 = 802, y1 = 240, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      P.rect(x0, y0, x1 - x0, y1 - y0, { w: 1.6, c: INK, a: 0.95, rough: 0.3, over: 0, passes: 1 }); P.rect(x0 + 8, y0 + 8, x1 - x0 - 16, y1 - y0 - 16, { w: 0.6, c: INK, a: 0.7, rough: 0.3, over: 0, passes: 1 });
      // webs shaded, diagonal, transverse & wall ribs, tiercerons, liernes, bosses
      [[[x0, y0], [x1, y0], [mx, my]], [[x0, y1], [x1, y1], [mx, my]]].forEach(tri => P.hatch(tri, { ang: 0, gap: 3, a: 0.28, w: 0.4, c: INK, ragged: 2 })); [[[x0, y0], [x0, y1], [mx, my]], [[x1, y0], [x1, y1], [mx, my]]].forEach(tri => P.hatch(tri, { ang: 90, gap: 3, a: 0.28, w: 0.4, c: INK, ragged: 2 }));
      P.line(x0, y0, x1, y1, { w: 2.4, c: INK, a: 0.95, passes: 1, over: 0, rough: 0.2 }); P.line(x1, y0, x0, y1, { w: 2.4, c: INK, a: 0.95, passes: 1, over: 0, rough: 0.2 }); P.line(mx, y0, mx, y1, { w: 1.6, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.line(x0, my, x1, my, { w: 1.6, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 });
      [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]].forEach(([u, v]) => { const px = lerp(x0, x1, u), py = lerp(y0, y1, v); P.line(px, py, mx, my, { w: 0.01, c: INK, a: 0, passes: 1 }); }); [[mx, y0], [mx, y1], [x0, my], [x1, my]].forEach(([tx, ty], i) => { [-1, 1].forEach(sg => { const ex = i < 2 ? mx + sg * 46 : tx + (tx < mx ? 30 : -30), ey = i < 2 ? ty + (ty < my ? 26 : -26) : my + sg * 30; P.line(tx, ty, ex, ey, { w: 1.0, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.2 }); P.line(ex, ey, mx, my, { w: 0.01, c: INK, a: 0, passes: 1 }); }); });
      [[mx - 46, y0 + 26], [mx + 46, y0 + 26], [mx - 46, y1 - 26], [mx + 46, y1 - 26]].forEach(([bx, by]) => { P.circle(bx, by, 3.4, { w: 0.9, c: INK, passes: 1 }); disc(bx, by, 3, INK, 0.7); }); P.line(mx - 46, y0 + 26, mx + 46, y0 + 26, { w: 0.6, c: INK, a: 0.85, passes: 1, over: 0 }); P.line(mx - 46, y1 - 26, mx + 46, y1 - 26, { w: 0.6, c: INK, a: 0.85, passes: 1, over: 0 });
      P.circle(mx, my, 7, { w: 1.3, c: INK, passes: 1 }); P.circle(mx, my, 4, { w: 0.8, c: INK, passes: 1 }); disc(mx, my, 3.4, INK, 0.7); for (let q = 0; q < 8; q++) { const a = q * TAU / 8; P.line(mx + Math.cos(a) * 4, my + Math.sin(a) * 4, mx + Math.cos(a) * 7, my + Math.sin(a) * 7, { w: 0.5, c: INK, a: 0.8, passes: 1, over: 0 }); }
      [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [mx, y0], [mx, y1], [x0, my], [x1, my]].forEach(([px, py]) => { P.circle(px, py, 5.4, { w: 1, c: INK, a: 0.95, passes: 1 }); disc(px, py, 4.6, INK, 0.75); });
      P.text('DIAGONAL RIBS', mx, y0 + 48, { size: 6.6, c: INK, align: 'center', a: 0.85, rot: 0.6 }); P.text('LIERNES', mx, y0 + 17, { size: 6.6, c: INK, align: 'center', a: 0.85 }); P.text('BOSS', mx + 16, my - 12, { size: 6.6, c: INK, a: 0.85 });
      P.dim(x0, y1 + 12, x1, y1 + 12, '8.4 M', 4, { size: 8 }); }
    // ---- COMPOUND PIER PLAN ----
    plate(944, 62, 1114, 262, 'PIER: HORIZONTAL SECTION');
    { const cx = 1029, cy = 158; const shafts = [[0, -1, 13], [1, 0, 13], [0, 1, 13], [-1, 0, 13], [0.72, -0.72, 8], [0.72, 0.72, 8], [-0.72, 0.72, 8], [-0.72, -0.72, 8]];
      P.circle(cx, cy, 26, { w: 1.5, c: INK, passes: 2 }); shafts.forEach(([dx, dy, r]) => P.circle(cx + dx * 33, cy + dy * 33, r, { w: 1.2, c: INK, a: 0.95, passes: 1 }));
      const all = [{ x: cx, y: cy, r: 26 }, ...shafts.map(([dx, dy, r]) => ({ x: cx + dx * 33, y: cy + dy * 33, r }))]; all.forEach(c => { const poly = Array.from({ length: 20 }, (_, i) => [c.x + Math.cos(i * TAU / 20) * c.r, c.y + Math.sin(i * TAU / 20) * c.r]); P.wash(poly, '#4a3524', 0.7, { edge: 0, jit: 0.3, steps: 1 }); P.hatch(poly, { ang: 45, gap: 2.2, a: 0.5, w: 0.45, c: INK, inset: 0.4 }); });
      P.circle(cx, cy, 26, { w: 1.5, c: INK, passes: 1 }); P.dashed(cx - 60, cy, cx + 60, cy, [12, 3, 2, 3], { w: 0.5, c: INK, a: 0.6 }); P.dashed(cx, cy - 60, cx, cy + 60, [12, 3, 2, 3], { w: 0.5, c: INK, a: 0.6 });
      P.dim(cx - 46, cy + 78, cx + 46, cy + 78, '1.6 M', 0, { size: 8 }); P.text('CORE + 8 SHAFTS', cx, 250, { size: 7.4, c: INK, align: 'center', a: 0.9 }); }
    // ---- TRACERY CONSTRUCTION ----
    plate(1122, 62, 1332, 262, 'TRACERY: COMPASS CONSTRUCTION');
    { const x0 = 1150, x1 = 1304, xm = (x0 + x1) / 2, ys = 206, top = 96, w = x1 - x0, rise = 70;
      P.path(pointed(x0, x1, ys - 60, rise), { w: 1.6, c: INK, a: 0.95, rough: 0.2, passes: 1 }); P.line(x0, ys - 60, x0, ys, { w: 1.4, c: INK, passes: 1, over: 0, rough: 0.2 }); P.line(x1, ys - 60, x1, ys, { w: 1.4, c: INK, passes: 1, over: 0, rough: 0.2 }); P.line(x0, ys, x1, ys, { w: 1.4, c: INK, passes: 1, over: 0, rough: 0.2 });
      [[x0, xm - 3], [xm + 3, x1]].forEach(([a, b]) => { const ww = b - a; P.path(pointed(a + 8, b - 8, ys - 60, ww * 0.62), { w: 1.1, c: INK, a: 0.9, rough: 0.2, passes: 1 }); P.line(a + 8, ys - 60, a + 8, ys, { w: 0.9, c: INK, passes: 1, over: 0 }); P.line(b - 8, ys - 60, b - 8, ys, { w: 0.9, c: INK, passes: 1, over: 0 }); P.path(pointed(a + 14, b - 14, ys - 60, ww * 0.5), { w: 0.6, c: INK, a: 0.75, rough: 0.2, passes: 1 }); });
      P.line(xm, ys, xm, ys - 96, { w: 1.4, c: INK, a: 0.95, passes: 1, over: 0, rough: 0.2 }); const oc = [xm, ys - 118]; P.circle(oc[0], oc[1], 22, { w: 1.4, c: INK, passes: 1 }); P.circle(oc[0], oc[1], 8, { w: 0.9, c: INK, passes: 1 }); for (let q = 0; q < 6; q++) { const a = q * TAU / 6 + Math.PI / 6; P.circle(oc[0] + Math.cos(a) * 14.6, oc[1] + Math.sin(a) * 14.6, 6.4, { w: 0.9, c: INK, a: 0.9, passes: 1 }); P.line(oc[0] + Math.cos(a) * 8, oc[1] + Math.sin(a) * 8, oc[0] + Math.cos(a) * 22, oc[1] + Math.sin(a) * 22, { w: 0.6, c: INK, a: 0.7, passes: 1, over: 0 }); }
      // compass arcs for construction in red hairlines
      cross(x0, ys - 60); cross(x1, ys - 60); cross(xm - 3 - (xm - x0 - 3) / 2, ys - 60); cross(xm + 3 + (x1 - xm - 3) / 2, ys - 60); P.dashed(x0, ys - 60, xm, ys - 60 - rise, [3, 3], { w: 0.4, c: '#a04030', a: 0.7 }); P.dashed(x1, ys - 60, xm, ys - 60 - rise, [3, 3], { w: 0.4, c: '#a04030', a: 0.7 });
      P.wash(pointed(x0, x1, ys - 60, rise).concat([[x1, ys], [x0, ys]]), GLASS, 0.3, { edge: 0, jit: 0.3, steps: 1 }); P.text('RED = CENTRES OF THE COMPASS', xm, 250, { size: 6.8, c: '#a04030', align: 'center', a: 0.9 }); }
    // ---- RIB MOULDINGS ----
    plate(1340, 62, 1548, 262, 'MOULDINGS  (FULL SIZE)');
    { const prof = (cx, cy, k, type) => {
        const D = [];
        if (type === 0) D.push([cx - 12 * k, cy], [cx - 12 * k, cy + 6 * k], [cx - 4 * k, cy + 10 * k], [cx, cy + 22 * k], [cx + 4 * k, cy + 10 * k], [cx + 12 * k, cy + 6 * k], [cx + 12 * k, cy]);
        else if (type === 1) { D.push([cx - 15 * k, cy], [cx - 15 * k, cy + 5 * k], [cx - 8 * k, cy + 6 * k]); for (let q = 0; q <= 6; q++) { const th = Math.PI - q * Math.PI / 6 * 0 - q * 0; void th; } D.push([cx - 7 * k, cy + 12 * k], [cx - 3 * k, cy + 16 * k], [cx, cy + 25 * k], [cx + 3 * k, cy + 16 * k], [cx + 7 * k, cy + 12 * k], [cx + 8 * k, cy + 6 * k], [cx + 15 * k, cy + 5 * k], [cx + 15 * k, cy]); }
        else D.push([cx - 14 * k, cy], [cx - 14 * k, cy + 8 * k], [cx - 6 * k, cy + 8 * k], [cx - 6 * k, cy + 14 * k], [cx - 2 * k, cy + 20 * k], [cx + 2 * k, cy + 20 * k], [cx + 6 * k, cy + 14 * k], [cx + 6 * k, cy + 8 * k], [cx + 14 * k, cy + 8 * k], [cx + 14 * k, cy]);
        const poly = D.concat([D[0]]); P.wash(poly, '#4a3524', 0.7, { edge: 0, jit: 0.3, steps: 1 }); P.hatch(poly, { ang: 45, gap: 2, a: 0.55, w: 0.45, c: INK, inset: 0.3 }); P.curve(D, { w: 1.4, c: INK, a: 0.95, rough: 0.2, passes: 1 }); P.line(D[0][0], D[0][1], D[D.length - 1][0], D[D.length - 1][1], { w: 1.4, c: INK, passes: 1, over: 0 }); };
      prof(1385, 112, 2.4, 0); P.text('WALL RIB', 1385, 186, { size: 7.4, c: INK, align: 'center', a: 0.9 }); prof(1445, 112, 2.2, 1); P.text('DIAGONAL RIB', 1462, 186, { size: 7.4, c: INK, align: 'center', a: 0.9 }); prof(1512, 112, 1.9, 2); P.text('TRANSVERSE', 1512, 186, { size: 7.4, c: INK, align: 'center', a: 0.9 });
      // moulded base of a pier (attic profile)
      const bx = 1444, by = 228; P.pl([[bx - 44, by + 16], [bx - 44, by + 8], [bx - 38, by + 8], [bx - 38, by + 4], [bx - 34, by], [bx - 20, by], [bx - 16, by + 4], [bx - 16, by + 8], [bx + 16, by + 8], [bx + 16, by + 4], [bx + 20, by], [bx + 34, by], [bx + 38, by + 4], [bx + 38, by + 8], [bx + 44, by + 8], [bx + 44, by + 16], [bx - 44, by + 16]], { w: 1.1, c: INK, a: 0.9, rough: 0.2, over: 0 }); P.text('PIER BASE', bx, 252, { size: 7, c: INK, align: 'center', a: 0.9 }); }

    /* ---- notes with leaders on the two sections (each on a cleared label plate) ---- */
    const tag = (str, x, y, tx, ty, o = {}) => { const w = P.measure(str, o.size || 9.6); P.erase(rectp(x - 4, y - 10, x + w + 4, y + 4)); P.note(str, x, y, tx, ty, o); };
    tag('NAVE VAULT: RIBS + LIERNES', 90, 590 - 0, 120, 476, { size: 9.6, c: INK });
    
    tag('OAK KING-POST TRUSSES', 120, 356, 180, 376, { size: 9.6, c: INK });
    tag('CLERESTORY / TRIFORIUM / ARCADE', 96, 560, 116, 520, { size: 9.6, c: INK });
    tag('CROSSING TOWER 68 M', 330, 286, 452, 302, { size: 9.6, c: INK }); tag('LEAD SPIRE ON OAK FRAME', 330, 100, 452, 128 + 0, { size: 9.6, c: INK });
    tag('CHOIR STALLS', 640, 600, 606, 640, { size: 9.6, c: INK });
    tag('HIGH ALTAR + RETABLE', 700, 604, 752, 660, { size: 9.6, c: INK });
    tag('CRYPT: GROINED BAYS', 570, 830, 600, 800, { size: 9.6, c: INK });
    tag('TRANSEPT ROSE', 462, 596, 500, 550, { size: 9.6, c: INK });
    tag('CORONA OF LAMPS', 176, 640, 252, 542, { size: 9.6, c: INK });
    tag('STONE FONT', 84, 780, 126, 738, { size: 9.6, c: INK });
    tag('UPPER FLYER: VAULT THRUST', 1440, 388, 1416, 424, { size: 9.6, c: INK });
    tag('LOWER FLYER: WIND ON ROOF', 1440, 488, 1408, 498, { size: 9.6, c: INK });
    tag('AISLE VAULT', 968, 580, 1112, 620, { size: 9.6, c: INK });
    tag('KING-POST TRUSS', 1010, 318, 1220, 352, { size: 9.6, c: INK });
    tag('CROCKETED PINNACLE', 946, 336, 1044, 362, { size: 9.6, c: INK });
    tag('PILES + STEPPED FOOTINGS', 950, 830, 1030, 820, { size: 9.6, c: INK });
    P.text('SECTION A-A  (LONGITUDINAL, LOOKING NORTH)', 60, 44 + 12, { size: 12, c: INK, font: S.HAND }); P.text('SECTION B-B  (TRANSVERSE, LOOKING EAST)', 946, 286, { size: 11, c: INK, font: S.HAND });
    P.dim(X(3), Y(0) + 96, X(45), Y(0) + 96, 'NAVE  5 BAYS  =  42 M', 0, { size: 9 }); P.dim(X(57), Y(0) + 100, X(89.1), Y(0) + 100, 'CHOIR  =  32 M', 0, { size: 9 });
    P.ruler(70, 872, 70 + 10 * SC * 1, 872, SC, 5, { side: -1, len: 6 }); P.text('0', 66, 890, { size: 7, c: INK }); P.text('10 M', 70 + 10 * SC * 0.9, 890, { size: 7, c: INK });

    /*__SECTIONS__*/
  }
});
