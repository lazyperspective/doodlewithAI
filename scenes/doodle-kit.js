/* A small showcase of the doodle kit (src/doodle.js): a grown ink mass with dark zones, tendrils escaping it, a budded
   colony in the corner, and a legend of every motif along the bottom. Use it as a starting point for your own doodles. */
(window.SCENES = window.SCENES || []).push({
  name: 'Doodle Kit', seed: 31, ink: '#0b0b0b', theme: 'pencil',
  note: 'Everything in src/doodle.js on one page: a grown mass, dark zones, tendrils, a budded colony and the motif legend.',
  build(P) {
    const D = SketchDoodle.kit(P, { ink: '#0b0b0b' }), R = D.R;
    // 1. the silhouette of the main mass: lobes along a wandering spine
    const lobes = []; { let x = 330, y = 480; for (let i = 0; i < 11; i++) { lobes.push([x, y, R(110, 165)]); x += R(55, 95); y += R(-70, 70); y = Math.max(330, Math.min(600, y)); } }
    const mass = D.mass(lobes);
    // 2. a few solid-black zones inside it, drawn first so motifs sit on top
    const darks = lobes.filter((_, i) => i % 3 === 1).map(([x, y, r]) => D.blobR(x, y, r * 0.7, r * 0.6, R(0, 6.3), 13, 0.18)); darks.forEach(D.black);
    const dark = (x, y) => darks.some(p => Sketch.pip(p, x, y));
    // 3. grow motifs into it, largest first
    const pk = D.grow({ inside: mass.inside, dark, bounds: [150, 150, 1330, 790] });
    // 4. tendrils escaping from the rim
    for (let i = 0, n = 0; i < 20000 && n < 40; i++) { const x = R(150, 1330), y = R(150, 790), f = mass.field(x, y); if (f < 0 || f > 8) continue; const a = Math.atan2(y - 470, x - 740) + R(-0.5, 0.5); D.tendril(D.wander(x, y, a, R(40, 150), { stop: (px, py) => mass.inside(px, py, 4) || px < 60 || px > 1540 || py < 60 || py > 800 }), n++ % 5); }
    // 5. a budded colony in the top-right corner, grown from one eye
    D.bud({ seed: [1430, 160, 46], bounds: [1300, 60, 1550, 330], second: [26, 18, 12], tentacles: 0.15, inside: (x, y, r) => !pk.all.some(([a, b, c]) => Math.hypot(x - a, y - b) < c + r) });
    // 6. the legend: every motif, labelled
    const names = Object.keys(D.MOTIFS).filter(n => n !== 'cell'); names.forEach((n, i) => { const x = 95 + i * 78, y = 880; D.motif(n, x, y, 26); P.text(n, x, 935, { size: 9, align: 'center', a: 0.7 }); });
    P.text('THE DOODLE KIT  -  SRC/DOODLE.JS', 1540, 975, { size: 9, align: 'right', a: 0.6 });
  }
});
