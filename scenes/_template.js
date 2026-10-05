/* A new drawing. Copy this file to scenes/<your-name>.js, add '<your-name>' to scenes/manifest.js, then:
     node tools/render.mjs <your-name>            → renders/<your-name>.png   (look at it, fix it, render again)
     node tools/render.mjs <your-name> --stages 4 → how the pen builds it up
   The sheet is 1600 x 1000 units; (0, 0) is the top left. Everything is drawn through P, a Sketch.Page.
   Read AGENTS.md for the API, the styles and the rules that make a drawing look hand-made. */
(window.SCENES = window.SCENES || []).push({
  name: 'My Drawing',           // shown in the book and the viewer
  seed: 1,                      // change it to get a different hand on the same drawing
  ink: '#1a1612',               // default ink colour
  theme: 'pencil',              // paper: cream, pencil, kraft, mint, pcb, cyan, sepia, ink, archive, bluepen
  note: 'One sentence for the caption.',
  build(P) {
    const K = '#1a1612';
    // construction lines first, faint: the drawing should look planned
    P.guide(200, 760, 1400, 760);
    // the subject: outlines with a little wobble and overshoot
    P.rect(560, 420, 480, 340, { w: 2.2 });
    P.poly([[540, 420], [800, 230], [1060, 420]], { w: 2.2 });
    // tone: hatch the side away from the light (light from the upper left)
    P.hatch([[800, 230], [1060, 420], [1040, 420]], { ang: -50, gap: 3, a: 0.6 });
    P.hatch([[900, 420], [1040, 420], [1040, 760], [900, 760]], { ang: -50, gap: 3.2, a: 0.55, cross: 90 });
    // a wash of colour under the lines
    P.wash([[560, 760], [1040, 760], [1040, 790], [560, 790]], '#8a7a5a', 0.25);
    // notes in the margin, like a real sketchbook
    P.note('THE DOOR FACES THE ROAD', 700, 860, 720, 760);
    P.text('MY DRAWING', 100, 120, { size: 30 });
    P.label('a first try', 104, 156, { size: 16, a: 0.7 });
  }
});
