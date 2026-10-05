/* A new 3D drawing: solids are built as faces, then render() draws them through a camera with hidden surfaces removed
   and every face hatched by how much light it gets. Copy to scenes/<name>.js, render it with node tools/render.mjs <name>,
   and add the name to scenes/manifest.js once it is good. */
(window.SCENES = window.SCENES || []).push({
  name: 'My 3D Drawing', seed: 7, ink: '#15151a', theme: 'ink',
  note: 'A tower of blocks and a wheel, drawn in true perspective and hatched by the light.',
  build(P) {
    const D = Sketch.D3, V = Sketch.V3, INK = '#15151a';
    // world units are yours; z is up. The camera looks from eye to target; f is the lens (bigger = flatter)
    const cam = D.camera({ eye: [-560, -720, 460], target: [10, 0, 70], f: 2600 });
    const faces = [];
    faces.push(...D.extrude([[-120, -120], [120, -120], [120, 120], [-120, 120]], 0, 12, { bottom: true }));   // a plinth
    faces.push(...D.extrude([[-50, -50], [50, -50], [50, 50], [-50, 50]], 12, 160));                            // a block
    faces.push(...D.shift(D.cylinder(0, 0, 30, 0, 50, 28), 0, 0, 160));                                          // a drum on top
    faces.push(...D.place(D.gearMesh(0, 0, 70, 18, 0, 14), { t: [150, -40, 12] }));                              // a gear lying beside it
    const light = V.norm([-0.5, -0.6, 0.8]);
    D.render(P, faces, cam, { light, ink: INK, hatchMin: 0.3, gap: 6 });   // only faces turned from the light get hatched
    // try { rich: true } for layered engraving, or { rich: true, style: 'stipple' | 'contour' | 'spot' | 'wash' | 'scribble' | 'engrave' }
    D.label3(P, 'THE DRUM', [20, -20, 200], cam, 90, -50);
    P.text('MY 3D DRAWING', 100, 120, { size: 28 });
  }
});
