/* SHEET 15 — Automatic doodle. Grown from one random squiggle: organic cells, tentacles and pods,
   each filled with its own ink pattern. Black ink only. Pure JavaScript, 2D. */
(window.SCENES = window.SCENES || []).push({
  name: 'Automatic Doodle', seed: 404, ink: '#0d0d0d', theme: 'pencil',
  build(P, n, t) {
    const S = Sketch, TAU = S.TAU, lerp = S.lerp, INK = '#0d0d0d', R = (a, b) => P.r(a, b);
    const shapes = [];                                             // [cx, cy, r] of placed shapes, for packing
    const free = (x, y, r, pad = 3) => x - r > 70 && x + r < 1530 && y - r > 60 && y + r < 940 && shapes.every(([a, b, c]) => Math.hypot(x - a, y - b) > c + r + pad);
    const blob = (cx, cy, r, k = 9, j = 0.28) => { const pts = []; for (let i = 0; i < k; i++) { const a = i * TAU / k + R(-0.2, 0.2); pts.push([cx + Math.cos(a) * r * R(1 - j, 1 + j), cy + Math.sin(a) * r * R(1 - j, 1 + j)]); } return P.sample(pts, true, 3); };
    const rimOff = 1.2;
    const shrink = (pts, cx, cy, k) => pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
    const ol = (pts, w = 1.6) => P.path(pts.concat([pts[0]]), { w, c: INK, a: 0.97, rough: 0.35, passes: 1 });
    const black = pts => P.wash(pts, '#070707', 1, { edge: 0, jit: 0, steps: 1 });
    const white = pts => P.occlude(pts, '#ffffff');
    const centroid = pts => pts.reduce((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length], [0, 0]);

    /* ------------- the pattern vocabulary ------------- */
    const FILL = {
      echo: (pts, cx, cy) => { for (let k = 0.86; k > 0.08; k -= 0.12) ol(shrink(pts, cx, cy, k), 0.8); },
      stipple: (pts, cx, cy, r) => P.stipple(pts, Math.round(r * r * 0.5), { a: 0.9, r: 0.8, c: INK, fade: (x, y) => Math.min(1, 0.15 + Math.hypot(x - cx, y - cy) / r) }),
      bubbles: (pts, cx, cy, r) => { const B = []; for (let i = 0; i < 400 && B.length < 60; i++) { const x = cx + R(-r, r), y = cy + R(-r, r), rr = R(2, r * 0.24); if (!S.pip(pts, x, y) || Math.hypot(x - cx, y - cy) + rr > r * 0.85 || B.some(([a, b, c]) => Math.hypot(x - a, y - b) < c + rr + 1.5)) continue; B.push([x, y, rr]); } B.forEach(([x, y, rr]) => { P.circle(x, y, rr, { w: 0.9, passes: 1, c: INK }); if (rr > 5) P.arc(x, y, rr * 0.6, rr * 0.6, 3.6, 4.6, { w: 0.6, passes: 1, c: INK }); P.dot(x + rr * 0.3, y + rr * 0.3, Math.min(1.4, rr * 0.2), { c: INK }); }); },
      night: (pts, cx, cy, r) => { black(pts); const d = []; for (let i = 0; i < r * 1.6; i++) { const x = cx + R(-r, r), y = cy + R(-r, r); if (S.pip(shrink(pts, cx, cy, 0.9), x, y)) d.push([x, y, R(0.4, 1.3)]); } P.dots(d, '#ffffff', 0.95); },
      hatch: (pts, cx, cy) => P.hatch(pts, { ang: R(0, 180), gap: 2.4, a: 0.9, w: 0.55, c: INK, cross: R(0, 1) > 0.5 ? 90 : undefined }),
      scales: (pts, cx, cy, r) => { for (let y = cy - r; y < cy + r; y += 7) for (let x = cx - r + ((y / 7) % 2 ? 4 : 0); x < cx + r; x += 8) if (S.pip(shrink(pts, cx, cy, 0.92), x, y)) P.arc(x, y, 4.2, 4.2, 0.1, Math.PI - 0.1, { w: 0.7, passes: 1, c: INK }); },
      rays: (pts, cx, cy, r) => { for (let k = 0; k < 64; k++) { const a = k * TAU / 64; P.line(cx + Math.cos(a) * r * 0.18, cy + Math.sin(a) * r * 0.18, cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95, { w: 0.5 + (k % 2) * 0.4, c: INK, passes: 1, over: 0, rough: 0.2 }); } white(blob(cx, cy, r * 0.2, 7, 0.1)); },
      eye: (pts, cx, cy, r) => { FILL.echo(pts, cx, cy, r); const e = r * 0.42; white(blob(cx, cy, e, 12, 0.05)); P.circle(cx, cy, e, { w: 1.4, passes: 1, c: INK }); for (let k = 0; k < 40; k++) { const a = k * TAU / 40; P.line(cx + Math.cos(a) * e * 0.4, cy + Math.sin(a) * e * 0.4, cx + Math.cos(a) * e * 0.9, cy + Math.sin(a) * e * 0.9, { w: 0.5, c: INK, passes: 1, over: 0 }); } black(blob(cx, cy, e * 0.38, 12, 0.02)); P.dot(cx - e * 0.14, cy - e * 0.16, e * 0.1, { c: '#ffffff', a: 1 }); },
      maze: (pts, cx, cy, r) => { for (let y = cy - r; y < cy + r; y += 6) for (let x = cx - r; x < cx + r; x += 6) if (S.pip(shrink(pts, cx, cy, 0.9), x + 3, y + 3)) { if (P.R() > 0.5) P.line(x, y, x + 6, y + 6, { w: 0.8, c: INK, passes: 1, over: 0, rough: 0.1 }); else P.line(x + 6, y, x, y + 6, { w: 0.8, c: INK, passes: 1, over: 0, rough: 0.1 }); } },
      cells: (pts, cx, cy, r) => { const s = 9; for (let row = 0, y = cy - r; y < cy + r; y += s * 0.86, row++) for (let x = cx - r + (row % 2) * s / 2; x < cx + r; x += s) if (S.pip(shrink(pts, cx, cy, 0.9), x, y)) { const hx = []; for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + Math.PI / 6; hx.push([x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5]); } P.poly(hx, { w: 0.6, c: INK, passes: 1, over: 0, rough: 0.1 }); if (P.R() > 0.75) black(hx); } },
    };
    const KINDS = ['echo', 'stipple', 'bubbles', 'night', 'hatch', 'scales', 'rays', 'eye', 'maze', 'cells', 'echo', 'bubbles', 'night', 'stipple'];

    /* ------------- a tentacle: tapered ribbon along a wandering path, banded like a caterpillar ------------- */
    const tentacle = (x0, y0, ang, len, w0) => {
      const C = [[x0, y0]]; let a = ang, x = x0, y = y0, curl = R(-0.09, 0.09);
      for (let i = 0; i < len / 8; i++) { a += curl + R(-0.05, 0.05); curl *= 1.04; x += Math.cos(a) * 8; y += Math.sin(a) * 8; if (x < 70 || x > 1530 || y < 60 || y > 940) break; C.push([x, y]); }
      if (C.length < 5) return;
      const Lft = [], Rgt = []; C.forEach((p, i) => { const q = C[Math.min(C.length - 1, i + 1)], o = C[Math.max(0, i - 1)], tx = q[0] - o[0], ty = q[1] - o[1], l = Math.hypot(tx, ty) || 1, w = w0 * (1 - i / C.length) + 1; Lft.push([p[0] - ty / l * w, p[1] + tx / l * w]); Rgt.push([p[0] + ty / l * w, p[1] - tx / l * w]); });
      const poly = Lft.concat(Rgt.slice().reverse()); white(poly); ol(poly, 1.4);
      const dark = P.R() > 0.5;
      for (let i = 1; i < C.length - 1; i += 2) { P.line(Lft[i][0], Lft[i][1], Rgt[i][0], Rgt[i][1], { w: 0.8, c: INK, passes: 1, over: 0, rough: 0.2 }); if (dark && i % 4 === 1 && i + 2 < C.length) black([Lft[i], Lft[i + 1], Rgt[i + 1], Rgt[i]]); }
      P.dot(C[C.length - 1][0], C[C.length - 1][1], 1.8, { c: INK });
      C.forEach((p, i) => { if (i % 3 === 0) shapes.push([p[0], p[1], w0 * (1 - i / C.length) + 3]); });
    };

    /* ------------- grow: seed squiggle, then shapes budding off shapes ------------- */
    const place = (cx, cy, r, forced) => { const pts = blob(cx, cy, r, 9, 0.18); white(pts); const kind = forced || KINDS[Math.floor(P.R() * KINDS.length)]; FILL[kind](pts, cx, cy, r); ol(pts, r > 40 ? 2 : 1.5); if (r > 26 && P.R() > 0.4) ol(shrink(pts, cx, cy, 1.1), 0.7); shapes.push([cx, cy, r * 1.2]); return pts; };
    // the seed: one big eye, off-centre, as the automatic drawing's first mark
    const seed = [720, 470, 118]; place(720, 470, 118, 'eye');
    const queue = [seed];
    let guard = 0;
    while (queue.length && guard++ < 900) {
      const [px, py, pr] = queue.shift();
      for (let k = 0; k < 40; k++) {
        const a = R(0, TAU), r = Math.max(9, pr * R(0.35, 0.85)), d = pr * 1.2 + r * 1.2 + R(2, 5), x = px + Math.cos(a) * d, y = py + Math.sin(a) * d;
        if (!free(x, y, r)) continue;
        // a short stalk joining child to parent
        place(x, y, r); if (r > 14) queue.push([x, y, r]);
        if (P.R() > 0.8 && r > 16) tentacle(x + Math.cos(a) * r, y + Math.sin(a) * r, a + R(-0.6, 0.6), R(90, 260), R(6, 12));
      }
    }
    // second growth: new colonies seeded wherever there is still room, largest first
    [70, 52, 38, 28, 20, 14, 10].forEach(r0 => { for (let i = 0; i < 900; i++) { const r = r0 * R(0.85, 1.15), x = R(80, 1520), y = R(70, 930); if (!free(x, y, r * 1.2)) continue; place(x, y, r); if (r > 22 && P.R() > 0.75) tentacle(x + r, y, R(0, TAU), R(80, 200), R(5, 10)); } });
    // fill the leftover gaps with tiny bubbles and dots so the page feels grown, not placed
    for (let i = 0; i < 2500; i++) { const x = R(75, 1525), y = R(65, 935), r = R(2, 7); if (!free(x, y, r, 2)) continue; if (P.R() > 0.4) P.circle(x, y, r, { w: 0.8, passes: 1, c: INK }); else P.dot(x, y, r * 0.5, { c: INK }); shapes.push([x, y, r]); }
    P.text('AUTOMATIC DRAWING  -  STARTED FROM ONE EYE', 1520, 958, { size: 8, align: 'right', a: 0.6 });
  }
});
