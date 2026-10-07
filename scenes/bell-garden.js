/* THE BELL GARDEN: a floating island with a bell tower on top, trees grown out of the lawn, and a root-tangled underside.
   The island and tower are 3D (every face hand-inked); the trees, lanterns and roots are grown with the doodle kit. */
(window.SCENES = window.SCENES || []).push({
  name: 'The Bell Garden', seed: 1906, ink: '#0c0c0c', theme: 'pencil',
  note: 'A floating garden with a bell tower, trees grown out of the lawn and roots hanging from the underside. A sign warns: NO RUNNING, THE TREES ARE TICKING.',
  build(P) {
    const S = Sketch, D = S.D3, V = S.V3, TAU = S.TAU, lerp = S.lerp, K = '#0c0c0c', Wh = '#ffffff', R = (a, b) => P.r(a, b);
    const DK = SketchDoodle.kit(P, { ink: K, paper: Wh });
    const CAM = D.camera({ eye: [-820, -1050, 760], target: [0, 0, 110], f: 1880, cx: 800, cy: 500 });
    const pr = (x, y, z) => CAM.project([x, y, z]);
    const light = V.norm([-0.45, -0.7, 0.55]);

    /* ---------- the island and its tower, as 3D ---------- */
    const faces = [];
    // underside: a lathe, walked so its faces point outward and down, then a flat top disc
    faces.push(...D.revolve(0, 0, [[0, -260], [50, -215], [120, -140], [200, -62], [248, -18], [268, 4], [262, 22], [240, 34], [0, 34]], { seg: 56, crease: 0.5 }));
    // the bell tower: a rubble base, a shaft with a gallery, and an open lantern
    faces.push(...D.cylinder(-40, 30, 74, 34, 60, 30));
    faces.push(...D.cylinder(-40, 30, 58, 60, 190, 26));
    faces.push(...D.cylinder(-40, 30, 74, 190, 204, 26));
    faces.push(...D.cylinder(-40, 30, 66, 204, 218, 24));
    faces.push(...D.revolve(-40, 30, [[0, 218], [34, 226], [60, 242], [70, 262], [58, 292], [30, 308], [0, 316]], { seg: 28 }));
    faces.push(...D.cylinder(-40, 30, 4, 316, 360, 8));                                  // the spire rod
    // the great bell hung in the lantern: a lathe with a lip
    faces.push(...D.revolve(-40, 30, [[0, 268], [30, 262], [44, 246], [50, 226], [54, 214], [56, 208], [0, 208]], { seg: 32 }));
    // a little footbridge to a second, lower bell
    faces.push(...D.extrude([[120, -30], [230, -30], [230, 10], [120, 10]], 34, 42));
    faces.push(...D.revolve(190, 110, [[0, 34], [22, 40], [30, 58], [34, 74], [28, 80], [0, 80]], { seg: 24 }));
    D.render(P, faces, CAM, { light, ink: K, paper: Wh, ambient: 0.06, w: 1.5, rough: 0.5, zw: 0, hatchMin: 0.05, rich: true, darken: 1.5, gap: 3.3, style: 'mixed', silhouette: true });

    /* ---------- window and gallery detail on the tower (2D, on the screen) ---------- */
    for (let k = 0; k < 4; k++) {                        // round windows in the tower shaft, facing the camera's side
      const a = k * TAU / 4 + 0.4, x = -40 + Math.cos(a) * 58, y = 30 + Math.sin(a) * 58, p = pr(x, y, 120);
      if (p && k % 2 === 0) { DK.black(DK.circ(p[0], p[1], 7 - k * 0.5, 14)); P.circle(p[0], p[1], 9, { w: 1, c: K, passes: 1 }); }
    }
    for (let z = 110; z < 180; z += 9) for (let k = 0; k < 14; k++) { const a = k * TAU / 14; const p = pr(-40 + Math.cos(a) * 58, 30 + Math.sin(a) * 58, z); if (p && Math.sin(a) < 0.2 && P.R() < 0.3) P.dot(p[0], p[1], 0.9, { c: K }); }

    /* ---------- trees grown out of the lawn (2D, drawn over the 3D) ---------- */
    // a small bell, drawn in ink: dome, lip, clapper
    const bell2d = (x, y, s2) => { const pts = []; for (let k = 0; k <= 12; k++) { const a = Math.PI + k * Math.PI / 12; pts.push([x + Math.cos(a) * s2, y + Math.sin(a) * s2 * 0.9]); } pts.push([x + s2 * 1.1, y + s2 * 0.6], [x - s2 * 1.1, y + s2 * 0.6]); DK.white(pts); DK.ol(pts, 0.9);
      DK.black(DK.circ(x, y + s2 * 0.1, s2 * 0.32, 10)); P.dot(x, y + s2 * 0.9, s2 * 0.2, { c: K }); };
    const tree = (bx, by, h, r) => {
      // trunk: a tapered tube with bark lines
      const tr = []; for (let k = 0; k <= 14; k++) { const u = k / 14; tr.push([bx + Math.sin(u * 2.2) * r * 0.25, by - u * h]); }
      const band = P.sample(tr.map(([x, y], i) => [x, y]), false, 2);
      for (let i = 0; i < band.length - 1; i++) { const w = lerp(r * 0.35, r * 0.12, i / band.length); P.line(band[i][0] - w, band[i][1], band[i + 1][0] - w * 0.9, band[i + 1][1], { w: 1.4, c: K, passes: 1, rough: 0.2 }); P.line(band[i][0] + w, band[i][1], band[i + 1][0] + w * 0.9, band[i + 1][1], { w: 1.1, c: K, passes: 1, rough: 0.2 }); }
      // canopy: a cloud-like mass of lobes, grown with the packer so it is full of leaves, cells and tiny motifs
      const top = [bx, by - h], lobes = []; for (let k = 0; k < 7; k++) { const a = R(0, TAU), d = r * R(0.2, 0.8); lobes.push([top[0] + Math.cos(a) * d, top[1] + Math.sin(a) * d * 0.7 - r * 0.2, r * R(0.55, 0.85)]); }
      const M = DK.mass(lobes);
      DK.grow({ inside: M.inside, dark: (x, y) => (x - top[0]) * -0.5 + (y - top[1]) * 0.8 > r * 0.1 && M.inside(x, y, -r * 0.1), bounds: [top[0] - r * 2, top[1] - r * 2, top[0] + r * 2, top[1] + r * 2], fit: true });
      // a black shadow mass on the far side of the canopy, so it reads as a volume not a cloud
      { const cr = []; for (let k = 0; k <= 16; k++) { const a = -0.3 + k * 0.6 / 16 * 2; cr.push([top[0] + Math.cos(a + 2.3) * r * 0.82, top[1] + Math.sin(a + 2.3) * r * 0.82]); } for (let k = 16; k >= 0; k--) { const a = -0.3 + k * 0.6 / 16 * 2; cr.push([top[0] + Math.cos(a + 2.3) * r * 0.6, top[1] + Math.sin(a + 2.3) * r * 0.6]); } DK.black(cr); }
      // a few hanging lanterns under the canopy, as small motifs
      // small bells hung from the branches on threads
      for (let k = 0; k < 3; k++) { const x = top[0] + R(-r, r) * 0.8, y = top[1] + r * R(0.6, 0.95); const th = Math.max(8, r * 0.16); P.line(x, y - th * 1.2, x, y - r * 0.5, { w: 0.6, c: K, passes: 1 }); bell2d(x, y, th); }
    };
    const onLawn = (x, y) => pr(x, y, 34), S2 = CAM.f / 1900;
    const trees = [[-150, 120, 190, 96], [175, 110, 215, 110], [-215, -120, 150, 74], [205, -120, 170, 80], [30, 190, 150, 84]].map(([x, y, h, r]) => ({ p: onLawn(x, y), h, r })).filter(t => t.p).sort((a, b) => a.p[1] - b.p[1]);
    trees.forEach(t => tree(t.p[0], t.p[1], t.h * S2, t.r * S2));

    /* ---------- roots and dangling things under the island (2D, grown from the underside) ---------- */
    const prof = [[0, -260], [50, -215], [120, -140], [200, -62], [248, -18], [268, 4]];
    const zAt = r => { for (let k = 0; k + 1 < prof.length; k++) if (r <= prof[k + 1][0]) { const t = (r - prof[k][0]) / (prof[k + 1][0] - prof[k][0]); return lerp(prof[k][1], prof[k + 1][1], t); } return 4; };
    const root = (pts) => { const n = pts.length; const L2 = [], R2 = []; pts.forEach((q, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, w = 3.2 * (1 - i / n) + 0.5; L2.push([q[0] - ty / l * w, q[1] + tx / l * w]); R2.push([q[0] + ty / l * w, q[1] - tx / l * w]); });
      DK.white(L2.concat(R2.slice().reverse())); DK.pl(L2, 1); DK.pl(R2, 1.2); for (let i = 3; i < n; i += 3) if (P.R() < 0.6) P.dot(pts[i][0] + R(-1, 1), pts[i][1], 0.7, { c: K }); };
    for (let k = 0; k < 13; k++) {
      const a = k * TAU / 13 + R(-0.2, 0.2), rr = R(80, 240), x0 = Math.cos(a) * rr, y0 = Math.sin(a) * rr, z0 = zAt(rr);
      const len = R(90, 200), pts = []; let x = x0, y = y0, z = z0, ang = R(-0.5, 0.5);
      for (let q = 0; q <= 18; q++) { ang += R(-0.22, 0.22); x += Math.cos(a) * 1.0 + Math.cos(ang) * 0.25; y += Math.sin(a) * 1.0 + Math.sin(ang) * 0.25; z -= len / 18; const p = pr(x, y, z); if (p) pts.push([p[0], p[1]]); }
      if (pts.length > 3) root(pts);
    }
    for (let k = 0; k < 6; k++) { const a = R(0, TAU), rr = R(120, 230), p = pr(Math.cos(a) * rr, Math.sin(a) * rr, zAt(rr) - R(10, 40)); if (p) DK.motif(['drips', 'cells', 'eye', 'pod', 'night', 'bands'][k % 6], p[0], p[1], R(9, 14)); }

    /* ---------- the lawn: stepping stones, flowers, a bench, a gardener with a watering can ---------- */
    const lawn = (x, y) => pr(x, y, 34);
    for (let k = 0; k < 9; k++) { const t = k / 8, x = lerp(-60, 150, t), y = lerp(-170, 90, t) + Math.sin(t * 3) * 25, p = lawn(x, y); if (p) { const w = 16 + 6 * (1 - t); DK.white(DK.ell(p[0], p[1], w, w * 0.62, 18)); DK.ol(DK.ell(p[0], p[1], w, w * 0.62, 18), 1); DK.dotRing(DK.ell(p[0], p[1], w, w * 0.62, 18), p[0], p[1], 0.75, 4, 0.8); } }
    for (let k = 0; k < 26; k++) { const a = R(0, TAU), rr = Math.sqrt(R(0.05, 1)) * 200, p = lawn(Math.cos(a) * rr, Math.sin(a) * rr); if (p && !(P.R() < 0.35)) DK.motif(['puff', 'rosette', 'ripple', 'shell', 'pod'][k % 5], p[0], p[1], R(7, 12)); }
    const bench = lawn(-110, 40); if (bench) { const bx = bench[0], by = bench[1]; DK.white([[bx - 46, by - 2], [bx + 46, by - 2], [bx + 46, by + 6], [bx - 46, by + 6]]); DK.ol([[bx - 46, by - 2], [bx + 46, by - 2], [bx + 46, by + 6], [bx - 46, by + 6]], 1.2); P.line(bx - 40, by + 6, bx - 40, by + 20, { w: 1.4, c: K, passes: 1 }); P.line(bx + 40, by + 6, bx + 40, by + 20, { w: 1.4, c: K, passes: 1 }); for (let k = 0; k < 6; k++) P.line(bx - 44 + k * 15, by, bx - 44 + k * 15, by + 4, { w: 0.6, c: K, passes: 1 }); }
    const gard = lawn(-20, -120);
    if (gard) { const gx = gard[0], gy = gard[1];
      const head = DK.circ(gx, gy - 46, 7, 14); DK.white(head); DK.ol(head, 1.1);
      DK.black([[gx - 9, gy - 50], [gx + 9, gy - 50], [gx + 7, gy - 54], [gx - 7, gy - 54]]); DK.black([[gx - 13, gy - 50], [gx + 13, gy - 50], [gx + 13, gy - 48], [gx - 13, gy - 48]]);
      const coat = [[gx - 9, gy - 38], [gx + 9, gy - 38], [gx + 12, gy], [gx - 12, gy]]; DK.white(coat); DK.ol(coat, 1.1); DK.black([[gx - 9, gy - 38], [gx - 3, gy - 38], [gx - 6, gy], [gx - 12, gy]]);
      P.line(gx + 12, gy - 20, gx + 26, gy - 12, { w: 1.2, c: K, passes: 1 });
      const can = [[gx + 22, gy - 16], [gx + 34, gy - 16], [gx + 35, gy - 2], [gx + 21, gy - 2]]; DK.white(can); DK.ol(can, 1);
      P.path([[gx + 34, gy - 12], [gx + 42, gy - 20]], { w: 1, c: K, passes: 1 }); P.dot(gx + 42, gy - 20, 1.2, { c: K }); }
    /* ---------- arched windows on the tower shaft, on the side the camera sees ---------- */
    for (let z of [120, 158]) for (let da of [-0.55, 0, 0.55]) { const a = -2.23 + da, p = pr(-40 + Math.cos(a) * 60, 30 + Math.sin(a) * 60, z); if (p) DK.motif('window', p[0], p[1], 9); }

    /* ---------- the joke and the lettering ---------- */
    const sp = pr(-300, 210, 0);
    if (sp) { P.line(sp[0] + 60, sp[1], sp[0] + 60, sp[1] + 110, { w: 2.6, c: K, passes: 1 }); P.rect(sp[0], sp[1] + 6, 150, 44, { w: 1.4, passes: 1 }); P.text('NO RUNNING', sp[0] + 10, sp[1] + 24, { size: 12, fine: true }); P.text('THE TREES ARE TICKING', sp[0] + 10, sp[1] + 42, { size: 9, fine: true }); }
    P.text('THE BELL GARDEN', 60, 92, { size: 34, lw: 1.6 });
    P.text('A GARDEN THAT KEEPS THE TIME', 62, 124, { size: 13, font: S.HAND, a: 0.86 });
  }
});
