# Drawing with this repo — a guide for coding agents

You are going to make a hand-drawn picture in plain JavaScript. Every mark you make is recorded as a stroke, and the
viewer replays the strokes with a pencil, so the drawing is *drawn* in front of the person who asked for it. Nothing
here needs a build step or a library; the only dependency is Playwright, for rendering so you can see your work.

## The loop: write, render, look, fix

1. Copy `scenes/_template.js` (2D) or `scenes/_template-3d.js` (3D) to `scenes/<name>.js`. Give it a `name`, a `seed`,
   a paper `theme`, and a one-sentence `note`.
2. Render it: `node tools/render.mjs <name>` → `renders/<name>.png`. **Open the PNG and look at it.** Every plate in
   `scenes/` was made by doing this many times; a drawing is never right the first time.
3. Fix what is wrong, render again. For close inspection use `--width 3200` and crop, for the order the pen draws in
   use `--stages 4`, for the finished video use `--video`.
4. When it is good, add `'<name>'` to `scenes/manifest.js` so it appears in the book (`index.html`).

Setup once: `npm install`, then `npx playwright install chromium` (skip if a Chromium is already available: set
`CHROMIUM_PATH=/path/to/chrome`). `ffmpeg` on the PATH is only needed for `--video`.

`node tools/render.mjs` exits non-zero and prints the error if the scene throws. Fix errors before judging the picture.

## A scene file

```js
(window.SCENES = window.SCENES || []).push({
  name: 'Lighthouse', seed: 12, ink: '#1a1612', theme: 'pencil',
  note: 'A lighthouse on a rock in a gale, with a cutaway of the lamp room.',
  build(P, n, total) {          // P: a Sketch.Page. n, total: this plate's number in the book (for P.frame)
    // ... draw with P ...
  }
});
```

* The sheet is **1600 × 1000 units**, origin top-left, y down. The viewer scales it to any screen.
* `seed` makes the hand repeatable: the same seed gives the same wobble every time. Use `P.r(a, b)` (random in
  [a, b)), `P.ri(a, b)`, `P.pick(arr)`, `P.R()` for every random choice, never `Math.random()`, or the drawing will
  change on every load.
* Order matters twice: later strokes cover earlier ones, **and** the pen draws them in that order. Build the
  drawing the way an illustrator would: construction lines, big shapes, details, tone, notes.
* Optional fields: `reveal: true` (render the finished page up front and let the pen uncover it — use it for 3D
  scenes where hidden strokes would otherwise flash), `P.anims` for parts that keep moving after the pen is done
  (see *Animation*).

## Paper themes

`theme` is one of these names, or an object overriding any of their fields
(`{ base, blot, grid, fib, vig, tape, blend, grain }`):

| theme | looks like | good for |
|---|---|---|
| `cream` | cream cartridge paper, faint blue grid, tape at the corners | technical sheets, plans |
| `pencil` | warm off-white, no grid | doodles, pencil studies, ink drawings |
| `kraft` | brown kraft paper | heavy black ink with white highlights |
| `mint` | mint graph paper | diagrams, diaries, engineering |
| `pcb` | pale paper with a fine blue grid | circuit/board-layout looks |
| `cyan` | cyanotype: white line on Prussian blue (draw with a light ink colour) | blueprints, engraved white-line work |
| `sepia` | aged sepia paper | architecture, ink and wash |
| `ink` | white with a fine grey grid | black ink + one accent colour |
| `archive` | old archive paper | exploded views, catalogues |
| `bluepen` | yellowed paper for ballpoint | blue biro sketches |

## The 2D API (`src/engine.js`, global `Sketch`)

Every method returns the page, so calls chain. Options `o` are all optional. Common options:
`w` stroke width (default 1.3), `c` colour (default the scene's ink), `a` opacity, `rough` wobble (0 = ruled,
1 = loose), `passes` how many times the pen goes over a line (2 looks sketchy), `over` overshoot at the ends.

**Lines**
| call | draws |
|---|---|
| `P.line(x1, y1, x2, y2, o)` | a pencil line with wobble, pressure and overshoot |
| `P.pl(pts, o)` / `P.poly(pts, o)` | an open / closed polyline from straight segments |
| `P.rect(x, y, w, h, o)`, `P.rrect(x, y, w, h, r, o)` | rectangles, rounded rectangles |
| `P.path(pts, o)` | one freehand stroke through dense points (`o.closed` to close it) |
| `P.curve(pts, o)` | a smooth Catmull-Rom curve through a few control points |
| `P.ellipse(cx, cy, rx, ry, o)`, `P.circle(x, y, r, o)`, `P.arc(cx, cy, rx, ry, from, to, o)` | ellipses (`o.rot`) |
| `P.dashed(x1, y1, x2, y2, [dash, gap], o)` | dashed line |
| `P.guide(x1, y1, x2, y2, o)` | faint construction line that runs past its ends |
| `P.dot(x, y, r, o)`, `P.dots([[x, y, r], …], colour, alpha)` | dots; `dots` is one stroke for thousands of dots |
| `P.sample(pts, closed, step)` | the smoothed points of a curve (to fill or hatch the shape you just drew) |

**Tone**
| call | draws |
|---|---|
| `P.hatch(poly, { ang, gap, cross, fade, piece, w, a })` | parallel strokes clipped to a polygon. `ang` in degrees (default −50), `gap` spacing, `cross: 90` adds a cross-hatch, `fade(x, y) → 0..1` thins it out, `piece` breaks lines into short flicks |
| `P.stipple(poly, n, { r, a, fade })` | n dots inside a polygon, thinned by `fade(x, y)` |
| `P.wash(poly, colour, alpha, { grad, edge, jit })` | watercolour/marker fill. `grad: { x0, y0, x1, y1, c0, a0, c1, a1 }` for a linear gradient (add `r0, r1` for radial) |
| `P.occlude(poly, colour)` | an opaque patch that hides what is under it — draw a background shape, occlude, then draw in front |
| `P.erase(poly)` | cut back to bare paper |

**Lettering** — the engine has its own single-stroke alphabet, so text is drawn by the pen too.
| call | draws |
|---|---|
| `P.text(str, x, y, { size, align, rot, c, a, ls, font })` | architect's capitals (`align: 'left'|'center'|'right'`, `fine: true` for tiny clean lettering) |
| `P.label(str, x, y, o)` | handwritten lettering |
| `P.note(str, x, y, tx, ty, o)` | a note with a curved leader line and arrowhead pointing at (tx, ty) |
| `P.dim(x1, y1, x2, y2, label, offset, o)` | an architectural dimension line |
| `P.measure(str, size)` | width of a string, for layout |

**Motifs and furniture**
| call | draws |
|---|---|
| `P.cloud(cx, cy, w, h, { fill, hi, shade })` | a scalloped cumulus with inner lobes and hatched shade |
| `P.cloudTube(path, r0, r1, o)` | a rope of cloud lobes along a path (smoke, fog, steam) |
| `P.scallop(pts, { r, closed })` | a bumpy cumulus outline along any line |
| `P.leaf(x, y, ang, len, w, o)` | a botanical leaf with midrib and veins |
| `P.strands(pts, h0, h1, n, o)` | engraved grain lines along a path: bark, branches, rope, muscle |
| `P.bus(pts, n, gap, { colors, pads })` | a bundle of parallel traces with 45° corners (circuit boards, wiring) |
| `P.ruler(…)`, `P.arcTicks(…)` | tick scales, straight and curved |
| `P.frame(title, subtitle, n, total, o)` | a drawing-office border and title block |
| `P.xf(scale, cx, cy, tx, ty)` … `P.xfEnd()` | draw a detail scaled around (cx, cy) and moved to (tx, ty) — for insets and magnified details |

`Sketch` also exports `lerp`, `pip(poly, x, y)` (point in polygon), `catmull`, `rng(seed)`, `TAU`.

## The doodle kit (`src/doodle.js`, `SketchDoodle.kit(P)`)

The engine for grown, packed, black-and-white doodles (the *Automatic Doodle*, *Ink Garden* and *Doodle Kit* plates).

```js
const D = SketchDoodle.kit(P, { ink: '#0b0b0b' });
D.motif('eye', 800, 500, 60);                      // one of 20 motifs at (x, y), radius r
D.fill('scales', D.blob(400, 300, 80), 400, 300, 80); // a pattern inside any closed shape
const mass = D.mass([[600, 500, 160], [800, 450, 180], [1000, 520, 150]]); // a silhouette made of lobes
D.grow({ inside: mass.inside, bounds: [300, 250, 1300, 750] });            // pack motifs into it, largest first
```

* **Motifs** (`D.MOTIFS`): `puff ripple eye pod cells shell honey bands mushroom rosette scales maze curl coral fern
  window night drips stack cell`. Each knocks out its own ground, so motifs can overlap dark areas.
* **Fills** (`D.FILLS`) for any shape: `echo stipple bubbles night hatch scales rays eye maze cells scribble puff`.
* **Growth**: `D.grow({ inside, dark, bounds, schedule, big, small })` packs a region (Ink Garden);
  `D.bud({ seed: [x, y, r], bounds, fills, tentacles })` buds shapes off a seed until the page is full (Automatic
  Doodle). Both return a packer whose `free(x, y, r)` tells you where there is still room.
* **Things that wander**: `D.wander(x, y, angle, length, { stop })` → points; `D.tendril(points, kind 0–4)`,
  `D.tentacle(x, y, angle, length, width)`, `D.spire(x, y, height)`.
* **Shading moves**: `D.puffShade`, `D.fringe` (strokes combed in from the rim on the shadow side), `D.lump` (a shaded
  white lump: rocks, foliage, crowds), `D.scribble(poly, n)` (looping graphite tone), `D.dotRing`, `D.black`,
  `D.white`, `D.hatch`.
* **Geometry**: `D.blob`, `D.blobR`, `D.circ`, `D.ell`, `D.shrink`, `D.offset`, `D.clipRect`, `D.ribbon`, `D.packer()`.

## The toolbox (`src/kit.js`, `SketchKit`)

Noise (`noise`, `fbm`), colour (`mix`, `shade`), shapes (`rect`, `ell`, `rot`, `blob`, `ribbon`), polygon `clip`,
`voronoi`, `gridVoronoi`, `jigsaw` (cells with interlocking walls), `poisson` packing, `contours` (marching squares),
and `SketchKit.kit(P, ink)` with colour helpers: `fill`, `lin` / `rad` (gradients), `glow`, `wc` (watercolour with
blooms, granulation and a pooled edge), `hatch`, `stip`, `leaf`, `mul` / `scr` (multiply / screen), and `L.blend(P,
'multiply' | 'screen' | 'lighter', () => { … })` to draw a group with a blend mode.

## 3D (`src/engine3d.js`, `Sketch.D3`)

Build solids as faces, then `D.render(P, faces, cam, o)` sorts them back to front, drops hidden faces, hatches each
face by how much light it gets and inks its hard edges. z is up.

```js
const D = Sketch.D3, V = Sketch.V3;
const cam = D.camera({ eye: [-560, -720, 460], target: [0, 0, 70], f: 2600 });
const faces = [...D.extrude(squarePts, 0, 160), ...D.cylinder(0, 0, 30, 160, 210, 28)];
D.render(P, faces, cam, { light: V.norm([-0.5, -0.6, 0.8]), hatchMin: 0.3 });
```

* Solids: `extrude(pts, z0, z1)`, `cylinder(cx, cy, r, z0, z1, seg)`, `ringSolid(…)`, `gearMesh(cx, cy, r, teeth,
  z0, z1)`, `bodyOfBar(a, b, w0, w1, z0, z1)`, `revolve(cx, cy, [[r, z], …])` (lathe), `poly3(verts, insidePoint)`.
  Move them with `place(faces, { rz, t: [dx, dy, dz] })` or `shift(faces, dx, dy, dz)`.
* Per-face fields: `c` (a colour wash), `tone` (force a darkness 0–1), `ghost` (outline only), `noHatch`, `layer`.
* Render options: `light`, `ink`, `paper` (occlusion colour — match your theme), `rich: true` (layered engraving),
  `style: 'stipple' | 'contour' | 'crosscontour' | 'engrave' | 'flick' | 'spot' | 'wash' | 'brushed' | 'scribble' |
  'mixed'` (with `rich`), `fog: [near, far]`, `gap`, `hatchMin`, `w`.
* Also: `polyline3`, `dashed3`, `label3(P, text, point, cam, dx, dy)`, `helix`, `knurl`, `onFloor(point, lightDir)` for
  cast shadows.

## Animation

Parts of a plate can keep moving after the pen finishes (smoke, a ticking clock, a blinking light). Record which
strokes belong to a moving part and give a function that redraws it at time `t`:

```js
const anims = P.anims = [];
const live = (fn, o = {}) => { const i0 = P.ops.length; fn(0); anims.push(Object.assign({ i0, i1: P.ops.length,
  fn: (Q, t) => { const keep = P; P = Q; try { fn(t); } finally { P = keep; } } }, o)); };
// (build's P parameter is swapped for a fresh page while fn redraws, so draw through P as usual)
live(t => P.circle(800, 500 + Math.sin(t * 2) * 10, 20), { fps: 24 });
```

The pen draws the `t = 0` version; afterwards the player redraws only those strokes every frame. See
`scenes/house.js` for a plate built this way. Render a moment with `node tools/render.mjs <name> --time 3.5`.

## What makes it look hand-made — the rules every plate follows

1. **Plan, then ink.** Start with faint `guide` lines (horizon, centre lines, a grid, vanishing lines). They stay
   visible and make the drawing look constructed.
2. **Line weight carries the drawing.** Silhouettes 1.8–2.6, interior edges 1–1.3, details 0.5–0.8, hatching
   0.4–0.55. A drawing with one line weight looks like a diagram.
3. **Shade from one light.** Pick a light direction (the plates use upper left) and keep it. Hatch the sides turned
   away, at one angle per surface; cross-hatch only the darkest areas; leave the lit sides white.
4. **Tone with texture, not grey.** Hatching, stipple, scribble and fringe read as drawing; flat grey fills read as
   software. Use washes for colour, under the line work, at 0.2–0.5 opacity.
5. **One accent colour.** Black or sepia ink plus one colour (red for live parts, gold for light, blue for water) is
   stronger than a full palette. Colour washes go first, lines on top.
6. **Density is a choice.** Leave rest areas; put the dense detail where you want the eye to go. Small things repay
   zooming: a label, a tiny figure, a joke.
7. **Write on it.** Notes with leader lines, a title, a scale bar, a dimension or two. It is a sketchbook page.
8. **Overlap honestly.** Draw back to front and `occlude` what is behind before drawing what is in front. In 3D, let
   `D.render` do it.
9. **Keep the stroke count sane.** 2 000–20 000 strokes is the useful range; `render.mjs` prints the count. Use
   `P.dots` for many dots, and `fade` on hatching/stipple instead of drawing then hiding.
10. **Look at every render.** Check: is the subject readable at a glance? Is anything cut off or overlapping? Is the
    tone consistent with the light? Are there accidental hard rectangles or straight edges where there should be
    none? Then zoom in (`--width 3200`) and check the detail.

## Recipes from the plates — open these files for patterns

| want | look at |
|---|---|
| technical multi-view sheet, title block, insets, schematics | `scenes/spaceship.js`, `scenes/robot.js` |
| worm's-eye perspective, heavy ink on kraft, white highlights | `scenes/burj.js`, `scenes/pyramids.js` |
| ballpoint sketch, fog as cloud ropes | `scenes/bridge.js` |
| graph-paper diary with diagrams | `scenes/elevator.js` |
| cyanotype white-line engraving | `scenes/library.js` |
| sepia section drawings with wash | `scenes/cathedral.js` |
| mechanism in plan, then in exploded 3D | `scenes/watch.js`, `scenes/watch3d.js`, `scenes/camera3d.js` |
| cinematic 3D interior with light shafts and fog | `scenes/nave3d.js`, `scenes/rotunda3d.js` |
| abstract 3D ink sculpture | `scenes/doodle3d.js` |
| grown doodles | `scenes/automatic.js`, `scenes/inkgarden.js`, `scenes/doodle-kit.js` |
| ink illustration with a story, 3D masses drawn as ink | `scenes/junkcathedral.js`, `scenes/clockisland.js` |
| a whole illustrated world with animated parts | `scenes/house.js` |

## Files

```
index.html          the sketchbook: every plate in scenes/manifest.js, flip through, watch each one drawn
sheet.html          one sheet at a time (?scene=<name> to open one drawing; ?render is what the tools use)
src/engine.js       the 2D engine: strokes, tone, lettering, motifs        → window.Sketch
src/engine3d.js     the 3D layer                                            → Sketch.D3, Sketch.V3
src/kit.js          the toolbox: noise, cells, colour, watercolour          → window.SketchKit
src/doodle.js       the doodle kit                                          → window.SketchDoodle
src/sheet.js        the player for sheet.html (pen replay, paper themes, render hooks)
src/book.js         the player for index.html (the flip-through book)
src/load.js         loads the scenes, then the player
scenes/             one file per drawing; manifest.js lists the ones the book shows
tools/render.mjs    render a drawing to PNG / stages / MP4
tools/gallery.mjs   render every drawing to docs/images/
```
