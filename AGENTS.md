# Drawing with this repo — a guide for coding agents

You are going to make a hand-drawn picture in plain JavaScript. Every mark you make is recorded as a stroke, and the
viewer replays the strokes with a pencil, so the drawing is *drawn* in front of the person who asked for it. Nothing
here needs a build step or a library; the only dependency is Playwright, for rendering so you can see your work.

## The loop: write, render, look, fix

1. Copy `scenes/_template.js` (2D) or `scenes/_template-3d.js` (3D) to `scenes/<name>.js`. Give it a `name`, a `seed`,
   a paper `theme`, and a one-sentence `note`.
2. Render it: `node tools/render.mjs <name>` → `renders/<name>.png`. **Open the PNG and look at it.** Every plate in
   `scenes/` was made by doing this many times; a drawing is never right the first time.
3. Fix what is wrong, render again. Close-ups: `--width 4800 --crop x0,y0,x1,y1` (a box in sheet units, here at 3×).
   The order the pen draws in: `--stages 4`. The finished video: `--video` (needs `ffmpeg`).
4. When it is good, add `'<name>'` to `scenes/manifest.js` so it appears in the book (`index.html`).

Setup once: `npm install`. The tools use Playwright's Chromium if it is installed, otherwise any Chrome, Chromium or
Edge on the machine; if they find none they tell you to run `npx playwright install chromium`.

What `render.mjs` prints is part of the feedback: it exits non-zero with the error if the scene throws, warns about
letters the alphabet cannot draw, and gives the stroke count, broken down by `P.section` if you use them.

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
* **Start each part with `P.section('name')`.** All randomness comes from one stream, so without sections an edit
  near the top reshuffles everything drawn after it. `P.section('sky')` gives the following strokes their own stream
  (seeded from the scene seed and the name) and labels them in the stroke counts.
* Order matters twice: later strokes cover earlier ones, **and** the pen draws them in that order. Build the
  drawing the way an illustrator would: construction lines, big shapes, details, tone, notes.
* Optional fields: `reveal: true` (render the finished page up front and let the pen uncover it), `P.anims` for
  parts that keep moving after the pen is done (see *Animation*). Use `reveal` whenever layer order and drawing
  order disagree: when something in front is drawn after what it hides (3D scenes, a head drawn over its tentacles),
  plain replay would show the hidden strokes for a moment; with `reveal` the pen only uncovers what is visible.
* `build(P, n, total)`: `n` and `total` are the plate's number and the plate count (both 1 when rendered alone).

## Paper themes

`theme` is one of these names, or an object whose fields override the `cream` theme (`{ base, blot, grid, fib,
vig, tape, blend, grain }`). Ballpoint paper with a graph grid, for example: `{ base: '#efe6d0', tape: false, grid: {
minor: 10, major: 50, mc: 'rgba(60,90,160,0.12)', Mc: 'rgba(60,90,160,0.25)' } }`.

| theme | base | ink blend | grid | looks like / good for |
|---|---|---|---|---|
| `cream` | `#f2ead8` | multiply | faint blue | cream cartridge paper, tape at the corners: technical sheets, plans |
| `pencil` | `#f3efe2` | multiply | — | warm off-white: doodles, pencil studies, ink drawings |
| `kraft` | `#b68b56` | normal | — | brown kraft: heavy black ink with white highlights |
| `mint` | `#edf4f0` | multiply | mint graph | diagrams, diaries, engineering |
| `pcb` | `#eeefe9` | multiply | fine blue | circuit / board-layout looks |
| `cyan` | `#e9e3d0` | normal (with a glow) | — | for white-line work on a blue ground *you paint yourself* (see `library.js`) |
| `sepia` | `#efe3c6` | multiply | — | aged paper: architecture, ink and wash |
| `ink` | `#f4f0e4` | multiply | fine grey | black ink + one accent colour |
| `archive` | `#f1e9d2` | multiply | — | old archive paper: exploded views, catalogues |
| `bluepen` | `#efe6d0` | multiply | — | yellowed paper for blue ballpoint |
| `riso` | `#f3eee2` | multiply | — | a two-ink risograph print: black prints blue, every other colour pink, slightly out of register |

**Knock-outs and the ink blend.** The ink is drawn on its own layer and laid on the paper. With `multiply` (most
themes) white ink is invisible, so to hide what is behind something (`P.occlude`, `D.white`, the 3D `paper`
option) use **`#ffffff`**: the paper and its grid show through, the strokes behind disappear. With `normal` (`kraft`,
`cyan`) white is opaque white, so occlude with the theme's base colour instead, and white ink really is white —
that is how kraft drawings get their gouache highlights.

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
| `P.hatch(poly, { ang, gap, cross, fade, piece, w, a, inset, jit, ragged, rough })` | parallel strokes clipped to a polygon. `ang` in **degrees** (default −50; everything else in the engine is radians), `gap` spacing, `cross: 90` adds a cross-hatch, `fade(x, y) → 0..1` thins it out, `piece` breaks lines into short flicks (kept or dropped by their midpoint, so they can overrun a mask by up to `piece`), `inset` keeps strokes off the edge, `jit` varies the spacing, `ragged` varies the line ends |
| `P.stipple(poly, n, { r, a, fade })` | n dots inside a polygon, thinned by `fade(x, y)` |
| `P.wash(poly, colour, alpha, { grad, edge, jit, steps })` | watercolour/marker fill, laid in `steps` passes (5) as the pen draws; `steps: 1` lays it in one go, for solid spot blacks. **`edge` defaults to 1, a darker pooled rim — pass `edge: 0` for a wash with no outline.** `jit` wobbles the boundary (0 = exact). `grad: { x0, y0, x1, y1, c0, a0, c1, a1 }` for a linear gradient (add `r0, r1` for radial) |
| `P.occlude(poly, colour)` | an opaque patch that hides what is under it — draw a background shape, occlude, then draw in front (colour: see *Knock-outs*) |
| `P.backfill(i0, poly, colour)` | an opaque patch *under* the strokes drawn since `i0 = P.ops.length` — for "fill behind what I just drew" (an opaque cloud on kraft) |
| `P.erase(poly)` | cut the ink layer back to bare paper. Nothing clips strokes to a region: to trim overruns at a picture's border, erase the outside afterwards |

**Lettering** — the engine has its own single-stroke alphabet, so text is drawn by the pen too.
| call | draws |
|---|---|
| `P.text(str, x, y, { size, align, rot, c, a, ls, lw, fine, halo })` | architect's capitals, **upper case only** (`align: 'left'|'center'|'right'`, `ls` letter spacing, `lw` stroke width, `fine: true` for small clean lettering, `halo: '#1a1410'` draws a wider dark copy under light lettering so it reads on a dark ground) |
| `P.label(str, x, y, o)` | handwritten lettering (also upper case); the same as `P.text(str, x, y, { font: Sketch.HAND })` |
| `P.note(str, x, y, tx, ty, { from, c, lc, lw, head, size })` | a note with a curved leader and arrowhead pointing at (tx, ty). The leader starts at the left end of the text unless `from: 'end'` (right end) or `from: 'auto'` (whichever end is nearer the target) — use `auto`, or the leader can cross the words. `lc` leader colour (defaults to `c`), `head` arrowhead size |
| `P.dim(x1, y1, x2, y2, label, offset, o)` | an architectural dimension line |
| `P.measure(str, size)` | width of a string, for layout |

The alphabet: `A–Z 0–9 . , : ; - – / \ ( ) ’ " ° + = × % ? ! & < > _ | # *`, plus `— ' ‘ “ ” · …` drawn as their nearest
cousin. Anything else is drawn as `?` and `render.mjs` warns you. Keep text 6 units or larger; below that it stops
reading even when zoomed.

**Motifs and furniture**
| call | draws |
|---|---|
| `P.cloud(cx, cy, w, h, { c, w, a, fill, hi, shade, lobes, inner, r, gap, ang })` | a scalloped engraved cumulus with inner lobes and hatched shade; returns its outline (for `backfill`). For a simple round doodle cloud use `D.cloud` |
| `P.cloudTube(path, r0, r1, o)` | a rope of cloud lobes along a path (smoke, fog, steam) |
| `P.scallop(pts, { r, closed })` | a bumpy cumulus outline along any line |
| `P.leaf(x, y, ang, len, w, o)` | a botanical leaf with midrib and veins |
| `P.strands(pts, h0, h1, n, o)` | engraved grain lines along a path: bark, branches, rope, muscle |
| `P.bus(pts, n, gap, { colors, pads })` | a bundle of parallel traces with 45° corners (circuit boards, wiring) |
| `P.ruler(…)`, `P.arcTicks(…)` | tick scales, straight and curved |
| `P.frame(title, subtitle, n, total, { note, scale })` | a drawing-office border with a title block bottom right (x 1150–1562, y 866–962). Keep the title under ~22 characters and the subtitle under ~26, and keep your drawing inside x 50–1550, y 50–860 and clear of the block |
| `P.xf(scale, cx, cy, tx, ty)` … `P.xfEnd()` | draw a detail scaled around (cx, cy) and moved to (tx, ty) — for insets and magnified details |

`Sketch` also exports `lerp`, `pip(poly, x, y)` (point in polygon), `catmull`, `rng(seed)`, `TAU`.

**Newer tools** (see `scenes/_features.js` for each in use):

| call | does |
|---|---|
| `P.flow(poly, { field, gap, len, fade, w, a })` | evenly spaced strokes that follow a field inside a shape: `'contour'` (rings), `'along'` (parallel to the nearest edge), `'radial'`, an angle in degrees, or `(x, y) => radians`. The best way to shade a curved form |
| `P.clip(poly, () => { … })` | everything drawn inside the function is clipped to `poly` |
| `P.isolate(tag, fn, true)` | draw `fn` with its own random stream, so editing it does not change the randomness of what comes after |
| `P.live(fn, { fps, cache, xf })` | a moving part, `fn(Q, t)`; see also `SketchKit.liveKit.spin / bob / blink / drift` |
| `P.text(s, x, y, { case: 'mixed' })` | lower case as written (default: upper case); kerning is automatic |
| `SketchKit.tex.stone / ripples / fur / folds(P, poly, o)` | surface textures, clipped to `poly` |
| `D.fill('bricks' \| 'slate' \| 'rivets' \| 'grain' \| 'flow', …)`, `D.motif('gear' \| 'chain' \| 'ivy' \| 'rope', …)` | new fills and motifs |
| `Sketch.STYLES[name]` | presets (`dense-ink`, `technical`, `ballpoint`, `kraft`, `riso`): `.scene` (theme, ink), `.render3d` (options for `D.render`), `.line` |

Tools: `node tools/render.mjs <name> --theme riso` (any drawing as a two-ink riso print), `node tools/export-svg.mjs
<name> [--plotter]`, `node tools/critique.mjs renders/<name>.png` (run it after each render: it reports empty
quarters, too much mid-grey, missing blacks and the focal point).

## Shading (`src/shading.js`): engraving and printmaking

Every call takes a **tone**: a number from 0 (paper) to 1 (solid ink), or a function `(x, y) => 0..1`, so one call
shades a whole gradient. `Sketch.ballTone(cx, cy, r, lx, ly)` is the tone of a ball lit from `(lx, ly)`; write your
own for other forms (a cylinder: darker toward one side; a wall: darker toward the ground).

| call | look |
|---|---|
| `P.engrave(poly, tone, { ang, gap, cross, crossFrom, wave })` | **copper engraving**: parallel lines that swell in the darks and break off in the lights; a second set crosses at `cross`° in the darks. `wave: [amp, wavelength]` for banknote lines. The best all-round shading |
| `P.woodEngrave(poly, tone, { ang, gap })` | **wood engraving**: a black block with white lines cut in. Great for night water and dark skies |
| `P.stippleW(poly, tone, n, { r, iters })` | evenly spaced stipple that follows the tone (weighted Voronoi). Returns the points. A moon, a face, smoke |
| `P.flowTone(poly, tone, { field, gapMin, gapMax })` | lines along a field that crowd in the shadows and open in the light |
| `P.tone(poly, tone, { ang, w })` | ordinary hatching, but you give the darkness and it picks spacing and cross-hatching |
| `P.tsp(points, { w })` | joins `stippleW` points (`{ draw: false }`) into one unbroken line; only works dense and small |
| `P.woodcut(poly, tone, { field, gap })`, `P.mezzotint`, `P.aquatint(…, { levels })`, `P.scumble`, `P.drypoint(points)`, `P.feather(poly)` | textures for parts of a picture: woodcut rocks and pines, a mezzotint night sky (best near black), aquatint flat steps, scribbled tone, a burred line, ink bleed round a black shape |

**3D**: `D.render(P, faces, cam, { style: 'engraving' })` (or `'wood-engraving'`) shades every face with swelling
lines whose width follows a smooth tone across curved surfaces. Options: `engraveGap` (2.7), `crossAng` (32),
`engraveGamma` (0.7; lower is darker), `solidFrom` (0.8; faces darker than this print solid), `depthWeight` (0–1:
nearer outlines heavier).

**The engraving style**, when someone asks for it: `scenes/observatory.js` is the example. Use a black night or a
dark ground for contrast, one bright focal shape (the moon), 3D in `style: 'engraving'`, the sea in `woodEngrave`,
the sky in `mezzotint`, foreground masses in `woodcut`, and bold outlines. Put the picture in a frame with a
lettered title and key, like a museum print.

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
* **Growth**: `D.grow({ inside, dark, bounds, schedule, big, small, fit, packer, haze })` packs a region (Ink Garden).
  `inside(x, y, pad)` must say whether the point is inside your shape by at least `pad`; `pad` is `0.35·r`, so big
  motifs spill a little over the rim (organic) — pass **`fit: true`** to keep every motif wholly inside. Pass your
  own `packer` (`D.packer()`, with circles already `add`ed) to keep areas clear, e.g. the eyes of a face. `haze:
  false` turns off the stipple dust it adds between motifs. `D.bud({ seed: [x, y, r], bounds, fills, tentacles,
  inside })` buds shapes off a seed until the region is full (Automatic Doodle). Both return a packer whose `free(x,
  y, r)` tells you where there is still room.
* **Along a path you choose**: `D.along(pts, step)` → evenly spaced stations `{ x, y, s, t, tx, ty, nx, ny }` (arc
  length, 0–1 position, tangent, normal) to place things along a curve; `D.band(pts, w0, w1 | w(t))` → a tapered band
  `{ poly, L, R, st }` with its two edges, for tentacles, roads, rivers, ribbons; `D.tentacle(…, { path })` follows
  your centreline instead of wandering.
* **Things that wander**: `D.wander(x, y, angle, length, { stop })` → points; `D.tendril(points, kind 0–4)`,
  `D.tentacle(x, y, angle, length, width)`, `D.spire(x, y, height)`.
* **Clouds**: `D.cloud(x, baseY, width, height)` — a white doodled cumulus of round puffs on a flat base (also the
  `cloud` motif). `D.lump` makes rocks and foliage, not clouds.
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
  z0, z1)`, `bodyOfBar(a, b, w0, w1, z0, z1)`, `revolve(cx, cy, [[r, z], …])` (lathe), `poly3(verts, toward)`.
* **Organic solids**: `tube(path3, r | r(t, i), { seg, caps, squash: [sx, sy], hdir: 'along' })` lofts rings along
  any 3D path: bodies, necks, tentacles, bent pipes, horns, and a snail shell (a path on a logarithmic spiral with
  `r = t => r0 * Math.exp(k * t)`). `sphere(cx, cy, cz, r, { sz })` is a ball, or an egg with `sz`. These have no
  hard edges, so render with **`silhouette: true`**: every edge between a face turned to the camera and one turned
  away is then inked, which outlines smooth lathes, cylinders, tubes and spheres.
  Move them with `place(faces, { rz, t: [dx, dy, dz] })` or `shift(faces, dx, dy, dz)`.
* **A face** is `{ v: [[x, y, z], …], n: [nx, ny, nz], hard: [bool per edge] }` — vertices counter-clockwise seen
  from outside, the outward normal, and which edges get inked. `all: true` inks every edge; `poly3(verts, toward)`
  builds one for you with the normal pointing **toward** the point `toward`, so pass a point outside the solid, in
  front of the face. Optional: `c` (a colour wash), `ca` (its opacity),
  `tone` (force a darkness 0–1), `ghost` (outline only, never hidden), `double` (visible from both sides), `noHatch`,
  `noEdge`, `hdir` (a 3D direction the hatching should follow), `layer` (draw order group, default 2), `bias`, `deco:
  (P, cam, poly2d, face) => …` (draw extra detail on the face after it is shaded). **Read the corners from the
  `face` argument**, not from a variable you captured when you built it: `place` and `shift` return copies, so a
  captured face still has its old, unmoved corners.
* **Custom items in the depth sort**: `{ custom: (P, cam) => { … }, c: [x, y, z], bias }` — a function drawn at the
  depth of point `c`, for springs, screws, labels and guide lines that must sit between solids. It takes a `layer`
  too.
* **Draw order** is back to front by `distance − bias − zw·z` (`zw` defaults to 3.5), so higher parts always draw
  over lower ones — good for exploded views. A positive `bias` brings an item forward, a large one (1e6) puts it
  on top.
* Solid options: `extrude(pts, z0, z1, { top, bottom, crease, bottomEdge, topColor, sideColor, ghost })` (`top:
  false` leaves it open, `crease` is the angle in radians above which an edge between sides is inked);
  `ringSolid(cx, cy, r0, r1, z0, z1, seg, { a0, a1, openInner })` for partial rings; `revolve(cx, cy, prof, { seg,
  a0, a1, tube, darkBore })` for lathe shapes and cut-aways; `helix(cx, cy, r, z0, z1, turns)` → points for springs.
* Render options: `light`, `ink`, `paper` (occlusion colour — see *Knock-outs*), `ambient` (0.2), `hatchMin` (faces
  lighter than this get no hatching), `gap` (hatch spacing; smaller is darker), `w` (edge width), `rough`,
  `silhouette`, `contactShadow` (e.g. 6: each part casts a short hatched shadow onto the parts behind it), `rich: true` (layered engraving; with it, `darken` scales every face's darkness, 1.25 by default, and `stipple: false` turns off its stipple), `style: 'stipple' |
  'contour' | 'crosscontour' | 'engrave' | 'flick' | 'spot' | 'wash' | 'brushed' | 'scribble' | 'mixed'` (with
  `rich`), `fog: [near, far]`, `zw`, `shadowSide`.
* Also: `polyline3`, `dashed3`, `label3(P, text, point, cam, dx, dy)`, `knurl`, `onFloor(point, lightDir, z)` for cast
  shadows. Faces with a vertex behind the camera are skipped silently — if a part vanishes, move the camera back.
* `D.render` draws everything when you call it, so its strokes count under whichever `P.section` was opened last:
  open a section such as `P.section('3d')` just before it. Any `P.r`/`P.R` call inside a `deco` or `custom`
  function takes numbers from the page's one random stream, so changing one shifts the randomness of everything drawn
  after it; that is normal, and the drawing stays the same from run to run.
* A `deco` draws during its face's turn in the depth sort, so faces drawn later cover it: keep a deco inside its
  face. Detail that must cross many small faces (spots across a tube, a stripe round a body) goes in a `custom` item
  with a small `bias`, or on a few large faces.
* `tone: 0–1` fixes a face's darkness whatever the light, and `noHatch: true` leaves it white. Use them to keep a soft
  body or a big plane (a sea, a floor) from going patchy.
* **A waterline or ground under a 3D object**: keep the object's vertices at z ≥ 0 (clamp them) and drop the faces
  that end up flat on z = 0; draw the water or ground as large faces in `layer: 1`, so they are drawn before
  everything in the default layer 2. Large faces sort badly against small ones by distance alone, and layers fix it.

**Exploded views** (see `scenes/typewriter.js`, `scenes/camera3d.js`): explode along one axis and keep a low camera
pitch; the gap between layers must be larger than the layer's depth × tan(pitch), or upper parts hide lower ones. Or
offset layers sideways. Draw dashed assembly lines between parts, number every part, and put the callouts in two
columns at the sheet's sides with leaders, so labels never sit on the drawing.

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
9. **Keep the stroke count sane.** 2 000–25 000 strokes is the useful range; `render.mjs` prints the count per
   `P.section`. Use `P.dots` for many dots, and `fade` on hatching/stipple instead of drawing then hiding.
10. **Look at every render.** Check: is the subject readable at a glance? Is anything cut off or overlapping? Is the
    tone consistent with the light? Are there accidental hard rectangles or straight edges where there should be
    none (a wash's default edge, an occlude box, a knock-out larger than its shape)? Then zoom in (`--width 4800
    --crop …`) and check the detail: lettering, small parts, where strokes meet.

## Dense ink (the style of *Tea Engine*, *Clock Island*, *The Whale Works*)

When someone asks for **"dense ink"** (or "in dense ink", "dense ink style"), names one of those plates, or asks for a
drawing that is weird, detailed, packed and shaded all over, they mean the look of `scenes/junkcathedral.js` and `scenes/clockisland.js`.
It bends some of the rules above, so follow this recipe instead where they differ. `scenes/whaleworks.js` was made by an agent
from this recipe and one prompt; read it alongside the two plates.

* **One absurd idea, told straight.** An ordinary thing pushed until it is ridiculous: a cathedral crowned by a heap
  of machinery whose only job is one cup of tea; islands that float on tangled roots. Draw it as seriously as an
  architect would. Add a small joke that rewards a close look: a caption, a comic strip, a tiny sign.
* **Ink on warm paper.** `theme: 'pencil'`, ink `#0c0c0c`, white `#ffffff` for knock-outs. Black only, or one tiny
  accent (the tea, a red pipe, a red eye) used in three or four places at most.
* **Build it in 3D, then draw on every face.** Use real solids (`D.extrude`, `D.cylinder`, `D.revolve`) and one
  camera with some perspective, so the masses overlap and sit correctly. Then give every visible face a `deco` that
  draws hand-inked detail in the face's own plane: map `(u, v)` on the face to the screen through `cam.project`
  (see `planeProj` in either file) and draw windows, Gothic lancets, planks, bricks, rivets, vents and dotted rows in
  `(u, v)`. Bare 3D shading alone looks like a render, and the hand-drawn layer on top is what makes it read as a drawing.
* **Three values, and a lot of black.** Solid spot blacks (`P.wash(poly, '#060606', 1, { edge: 0, jit: 0, steps: 1
  })`) for openings, shadow sides of deep recesses, undersides and windows; dense parallel hatching for the
  half-tones; clean white on the lit faces. Then cut white back into the blacks: white tracery in a black window,
  white lines on a black wall, white rocks against a black mass.
* **Pile it up.** The main subject is an *accumulation*: dozens of small parts of different kinds (tanks, pipes with
  flanges, domes, chimneys, gears, antennas, ladders, balconies, cables) stacked and crossing each other, with no two
  the same size. Build it with a loop and a seeded random, not by hand, and include a few big parts to anchor it.
* **White puff clusters.** Rocks, smoke, clouds and foam are clumps of white lumps, each knocked out, outlined, and
  shaded with short strokes combed in from the rim on the shadow side, plus a little stipple (the doodle kit's
  `lump`, `cloud` and `puffShade`, or `cloudCluster`/`puffs2D` in `junkcathedral.js`). Use them to break up straight edges and to
  fill gaps in the pile.
* **Fill the page, but not evenly.** The main subject takes 55–70 % of the width, with satellites placed around it:
  a second tower or island, an airship or balloon on a cable, a crane, flying cups, birds, bubbles, a jellyfish, a
  floating eye. The satellites are drawn lighter (outline, a little hatching) so the centre stays the darkest and
  densest place on the sheet. Nothing should look unfinished, and no quarter of the page should be empty.
* **Pack the insides.** Hollow or cut-open parts (the underside of an island, an arched doorway, a tank) are filled
  edge to edge: a black mass with white doodle motifs, roots, pods and eyes grown into it (paint the black first, then the doodle kit's
  `grow({ inside, dark: () => true })` and `fill`; call it something other than `D` when the file also uses `Sketch.D3`), or a stack of white puffs.
* **Scale and life.** Tiny stick figures, stairs, ladders, chains, washing lines, hanging lamps and a flag or two
  show how big it is. Ground it with ruled ground lines, a cast shadow and a scatter of pebbles.
* **Values to start from.** The Tea Engine renders its 3D with `{ ink: '#0c0c0c', paper: '#ffffff', light: [-0.2,
  -0.8, 0.45], ambient: 0.04, w: 1.4, rough: 0.3, zw: 0, hatchMin: 0.06, rich: true, darken: 1.5, gap: 3.4, style:
  'mixed', silhouette: true }` (*mixed*: near-black faces become a solid black wash, the others dense hatching with a
  little stipple). Clock Island uses `style: 'layered'`, `darken: 1.6`, `gap: 3.2`. With *mixed* and `darken: 1.5`, any face
  turned more than about 70° from the light becomes solid black and lit tops are hatched heavily; use `tone` on the
  faces you want lighter. Start from one of these and move
  the light, not the other numbers: a light from the front and above gives white faces towards the viewer and black
  sides, which is what this style wants.
* **Creatures and soft things** are `D.tube` and `D.sphere` (a snail's body and shell, a whale, a tentacle, a
  balloon), with the same deco treatment as buildings: scales, plates, bumps, rivets, white growth lines.
* **Pen order.** The 3D renderer draws back to front, not in an illustrator's order, and that is fine for this style.
  But draw spot blacks *with* the part they belong to (in its `deco`), not as one big shape at the start, or the
  replay opens with a black blob.
* **Budget.** These plates are 40 000–55 000 strokes; that is the one place to go past the usual limit, so ignore
  the render tool's 30 000-stroke note, and keep under 60 000. Use `P.dots`
  for dots, and spend the strokes on the centre.

Work in this order, rendering after each step: the 3D masses with plain shading; the deco on every face; the spot
blacks and white cut-backs; the pile; the puffs; the satellites; the figures, joke and title. Then zoom in with
`--width 4800 --crop …`: at that size every face should still have something to look at.

## Recipes from the plates — open these files for patterns

The big plates are dense (50–120 KB, long lines): read them in parts, or search them for the helper you want.
The three marked compact were each made by an agent from a single prompt with this guide, and are the easiest to
learn from.

| want | look at |
|---|---|
| technical multi-view sheet, title block, insets, schematics | `scenes/spaceship.js`, `scenes/robot.js` |
| **ink on kraft with white highlights, a storm, a section sheet** (compact, a good first read) | `scenes/lighthouse.js` |
| **exploded 3D technical drawing with numbered callouts** (compact) | `scenes/typewriter.js` |
| **a figurative doodle: a creature that turns into a city** (compact) | `scenes/octopolis.js` |
| worm's-eye perspective, heavy ink on kraft, white highlights | `scenes/burj.js`, `scenes/pyramids.js` |
| ballpoint sketch, fog as cloud ropes | `scenes/bridge.js` |
| graph-paper diary with diagrams | `scenes/elevator.js` |
| cyanotype white-line engraving | `scenes/library.js` |
| sepia section drawings with wash | `scenes/cathedral.js` |
| mechanism in plan, then in exploded 3D | `scenes/watch.js`, `scenes/watch3d.js`, `scenes/camera3d.js` |
| cinematic 3D interior with light shafts and fog | `scenes/nave3d.js`, `scenes/rotunda3d.js` |
| abstract 3D ink sculpture | `scenes/doodle3d.js` |
| grown doodles | `scenes/automatic.js`, `scenes/inkgarden.js`, `scenes/doodle-kit.js` |
| **engraving**: a night print with a 3D engraved centrepiece, stippled moon and wood-engraved sea | `scenes/observatory.js` |
| **dense ink**: a weird story, 3D masses covered in hand-inked detail (see the section above) | `scenes/junkcathedral.js`, `scenes/clockisland.js` |
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
