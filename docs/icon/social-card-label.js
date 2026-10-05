/* The title label on docs/icon/social-card.png: rendered with tools/render.mjs and laid over a crop of the Tea Engine plate. */
(window.SCENES = window.SCENES || []).push({
  name: 'Tag', seed: 9, ink: '#141210', theme: { grid: null, tape: false, vig: 'rgba(0,0,0,0)', blot: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'], fib: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'], base: '#ffffff', grain: [250, 244, 230, 0] },
  build(P) {
    P.rect(300, 120, 1000, 830, { w: 6, passes: 2, rough: 0.6 });
    P.rect(326, 146, 948, 778, { w: 2, a: 0.7, passes: 1 });
    P.text('DOODLE', 800, 380, { size: 190, w: 10, align: 'center', a: 1 });
    P.text('WITH AGENTS', 800, 560, { size: 120, w: 7, align: 'center', a: 1 });
    P.line(440, 620, 1160, 614, { w: 7, c: '#8e1f1f', a: 0.9, passes: 1 });
    P.label('sketches & doodles,', 800, 715, { size: 50, align: 'center', a: 0.85 });
    P.label('drawn by your coding agent', 800, 795, { size: 50, align: 'center', a: 0.85 });
  }
});
