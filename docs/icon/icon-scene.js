/* The repo icon, drawn with the engine itself: a doodled eye on paper, its outline still being finished by a pencil.
   Render: node tools/render.mjs docs/icon/icon-scene.js --out docs/icon/icon-sheet.png --width 2560, then crop the
   centre 1000 × 1000 square (x 300–1300). */
(window.SCENES = window.SCENES || []).push({
  name: 'Icon', seed: 2121, ink: '#141210', theme: { grid: null, tape: false, vig: 'rgba(0,0,0,0)', blot: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'], base: '#f3ead6', grain: [250, 244, 230, 30] },
  build(P) {
    const D = SketchDoodle.kit(P, { ink: '#141210', paper: '#ffffff' }), K = '#141210', R = D.R, TAU = Math.PI * 2;
    const cx = 740, cy = 560, r = 270;
    // the doodle: a big eye cell, ringed with smaller cells and bubbles
    const ring = []; for (let i = 0; i < 9; i++) { const a = -2.3 + i * 0.52, rr = R(42, 62), d = r + rr + 14; ring.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d, rr]); }
    const outline = D.blob(cx, cy, r, 12, 0.07);
    D.white(outline);
    // iris rays, pupil and highlight
    const e = r * 0.56; D.white(D.circ(cx, cy, e, 48)); for (let k = 0; k < 64; k++) { const a = k * TAU / 64; D.ln(cx + Math.cos(a) * e * 0.42, cy + Math.sin(a) * e * 0.42, cx + Math.cos(a) * e * 0.94, cy + Math.sin(a) * e * 0.94, 1.6); }
    P.circle(cx, cy, e, { w: 6, c: K, passes: 1, rough: 0.2 });
    D.black(D.circ(cx, cy, e * 0.38, 40)); P.dot(cx - e * 0.15, cy - e * 0.17, e * 0.11, { c: '#ffffff', a: 1 }); P.dot(cx + e * 0.12, cy + e * 0.1, e * 0.04, { c: '#ffffff', a: 1 });
    // echo rings between iris and rim
    for (let k = 0.93; k > 0.64; k -= 0.09) D.ol(D.shrink(outline, cx, cy, k), 2.2);
    D.dotRing(outline, cx, cy, 0.97, 14, 3);
    // the outline, drawn heavy, left open where the pencil is still drawing it
    const open = outline.slice(0, Math.floor(outline.length * 0.86)); P.path(open, { w: 13, c: K, a: 1, rough: 0.25, passes: 1 });
    // a few satellite cells
    ring.slice(0, 6).forEach(([x, y, rr], i) => { if (y > 880 || x > 1180 || x < 380 || y < 90) return; D.motif(['night', 'cells', 'ripple', 'scales', 'night', 'pod'][i], x, y, rr); });
    for (let i = 0; i < 14; i++) { const a = R(-2.9, -0.9), d = r + R(130, 190), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; if (x < 330 || x > 1270 || y < 40 || y > 960) continue; P.circle(x, y, R(6, 14), { w: 3, c: K, passes: 1 }); }
    // the pencil, its tip where the outline stops
    const tip = outline[Math.floor(outline.length * 0.86)], ang = -0.75, ca = Math.cos(ang), sa = Math.sin(ang), T = (u, v) => [tip[0] + ca * u - sa * v, tip[1] + sa * u + ca * v];
    const hw = 30, L0 = 56, L1 = 110, L2 = 300;
    D.tint([T(L0, -hw), T(L2, -hw), T(L2, hw), T(L0, hw)], '#e2a33b', 1); D.tint([T(L0, -hw), T(L2, -hw), T(L2, -hw * 0.3), T(L0, -hw * 0.3)], '#f2c45e', 1); D.tint([T(L0, hw * 0.35), T(L2, hw * 0.35), T(L2, hw), T(L0, hw)], '#b8781f', 1);
    D.tint([T(0, 0), T(L0, -hw), T(L0, hw)], '#e8c99a', 1); D.tint([T(0, 0), T(20, -hw * 0.33), T(20, hw * 0.33)], K, 1);
    D.tint([T(L2, -hw), T(L2 + 46, -hw), T(L2 + 46, hw), T(L2, hw)], '#9aa0a8', 1); D.tint([T(L2 + 46, -hw), T(L2 + 110, -hw), T(L2 + 110, hw), T(L2 + 46, hw)], '#d9675a', 1);
    [[T(0, 0), T(L0, -hw)], [T(0, 0), T(L0, hw)], [T(L0, -hw), T(L2 + 110, -hw)], [T(L0, hw), T(L2 + 110, hw)], [T(L0, -hw), T(L0, hw)], [T(L2, -hw), T(L2, hw)], [T(L2 + 46, -hw), T(L2 + 46, hw)], [T(L2 + 110, -hw), T(L2 + 110, hw)]].forEach(([a, b]) => P.line(a[0], a[1], b[0], b[1], { w: 6, c: K, passes: 1, over: 0, rough: 0.2 }));
    for (let i = 1; i < 4; i++) P.line(...T(L2 + i * 11.5, -hw), ...T(L2 + i * 11.5, hw), { w: 2.5, c: K, passes: 1, over: 0, rough: 0.1 });
    P.hatch([T(L0 + 10, hw * 0.35), T(L2 - 6, hw * 0.35), T(L2 - 6, hw - 4), T(L0 + 10, hw - 4)], { ang: ang * 180 / Math.PI + 60, gap: 7, w: 2, a: 0.7, c: K });
  }
});
