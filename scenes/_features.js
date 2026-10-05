/* A sheet of the newer tools, one panel each: node tools/render.mjs _features */
(window.SCENES = window.SCENES || []).push({
  name: 'New tools', seed: 5, ink: '#1b1a18', theme: 'pencil',
  build(P) {
    const S = Sketch, D = SketchDoodle.kit(P, { ink: '#1b1a18' }), K = '#1b1a18', T = SketchKit.tex;
    const box = (x, y, w, h, t) => { P.rect(x, y, w, h, { w: 0.9, passes: 1, rough: 0.3 }); P.text(t, x + 6, y + h + 16, { size: 10, fine: true }); };
    const blob = (cx, cy, rx, ry) => P.sample(Array.from({ length: 10 }, (_, k) => { const a = k * S.TAU / 10; return [cx + Math.cos(a) * rx * P.r(0.85, 1.1), cy + Math.sin(a) * ry * P.r(0.85, 1.1)]; }), true, 3);
    P.text('New tools', 40, 48, { size: 24, case: 'mixed' });
    // row 1: flow hatching, three fields
    [['contour', 120], ['along', 330], ['radial', 540]].forEach(([f, x]) => { const b = blob(x, 170, 80, 70); P.flow(b, { field: f, gap: 4, w: 0.6 }); P.path(b.concat([b[0]]), { w: 1.4, passes: 1 }); P.text('flow: ' + f, x - 50, 268, { size: 10, fine: true, case: 'mixed' }); });
    // clip: hatching and a pattern held inside a hand-drawn shape
    { const b = blob(760, 170, 90, 72); P.clip(b, () => { P.hatch([[640, 80], [880, 80], [880, 260], [640, 260]], { ang: 30, gap: 3, w: 0.6, a: 0.9 }); for (let k = 0; k < 12; k++) P.circle(P.r(680, 840), P.r(110, 230), P.r(8, 22), { w: 0.9, passes: 1 }); }); P.path(b.concat([b[0]]), { w: 1.4, passes: 1 }); P.text('P.clip(shape, ...)', 700, 268, { size: 10, fine: true, case: 'mixed' }); }
    // lettering
    P.text('Lower case, kerning: AVATAR, LYTTON, Toyota', 920, 110, { size: 15, case: 'mixed' });
    P.text('The quick brown fox jumps over the lazy dog.', 920, 140, { size: 13, case: 'mixed' });
    P.text('symbols: 12º  @home  $5  [x]  & more', 920, 168, { size: 13, case: 'mixed' });
    P.label('handwritten, mixed case: hello there', 920, 200, { size: 15, case: 'mixed' });
    // row 2: new fills
    [['bricks', 110], ['slate', 280], ['rivets', 450], ['grain', 620], ['flow', 790]].forEach(([f, x]) => { const b = blob(x, 400, 70, 62); D.white(b); D.fill(f, b, x, 400, 70); D.ol(b, 1.3); P.text('fill: ' + f, x - 40, 490, { size: 10, fine: true, case: 'mixed' }); });
    // new motifs
    [['gear', 980, 400, 55], ['chain', 1130, 400, 60], ['ivy', 1290, 400, 60], ['rope', 1450, 400, 60]].forEach(([m, x, y, r]) => { D.motif(m, x, y, r); P.text('motif: ' + m, x - 40, 490, { size: 10, fine: true, case: 'mixed' }); });
    // row 3: textures
    const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    [['stone', 60], ['ripples', 330], ['fur', 600], ['folds', 870]].forEach(([t, x]) => { const r = rect(x, 540, 240, 170); if (t === 'fur') T.fur(P, r, { ang: 1.2, fade: (px, py) => 0.3 + (px - x) / 240 }); else if (t === 'folds') T.folds(P, r, { from: [x + 120, 545] }); else T[t](P, r); P.path(r.concat([r[0]]), { w: 1.1, passes: 1 }); P.text('texture: ' + t, x, 730, { size: 10, fine: true, case: 'mixed' }); });
    // even stipple vs before, contact of strokes
    { const b = blob(1300, 625, 140, 80); P.stipple(b, 900, { r: 0.9, a: 0.9 }); P.path(b.concat([b[0]]), { w: 1.3, passes: 1 }); P.text('even stipple (no clumps)', 1200, 730, { size: 10, fine: true, case: 'mixed' }); }
    // row 4: strokes up close (caps, nib, dry breaks) and a 3D block with contact shadows
    for (let k = 0; k < 9; k++) P.line(80 + k * 22, 780, 130 + k * 26, 950, { w: 1.4 + k * 0.2, passes: 1 });
    P.text('round, pooled ends; a nib that thickens across', 60, 975, { size: 10, fine: true, case: 'mixed' });
    { const D3 = S.D3, cam = D3.camera({ eye: [-500, -700, 420], target: [0, 0, 60], f: 800, cx: 820, cy: 840 });
      const F = [...D3.extrude([[-120, -80], [120, -80], [120, 80], [-120, 80]], 0, 30), ...D3.extrude([[-60, -40], [20, -40], [20, 30], [-60, 30]], 30, 120), ...D3.cylinder(70, 20, 30, 30, 150, 20), ...D3.sphere(-20, -5, 150, 30)];
      D3.render(P, F, cam, { light: S.V3.norm([-0.5, -0.6, 0.7]), silhouette: true, rich: true, style: 'mixed', darken: 1.3, gap: 3, contactShadow: 6 });
      P.text('3D: contact shadows, aligned hatching', 700, 975, { size: 10, fine: true, case: 'mixed' }); }
    // live kit: a gear that turns, an eye that blinks (static here)
    SketchKit.liveKit.spin(P, 1180, 870, Q => SketchDoodle.kit(Q, { ink: K }).motif('gear', 1180, 870, 60));
    SketchKit.liveKit.blink(P, 1380, 870, 30);
    P.text('live kit: spin, blink, bob, drift', 1150, 975, { size: 10, fine: true, case: 'mixed' });
  }
});
