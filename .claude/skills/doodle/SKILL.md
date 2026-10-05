---
name: doodle
description: Make a hand-drawn sketch or doodle with this repo's stroke-by-stroke JavaScript drawing engine. Use when the user asks for a drawing, sketch, doodle, illustration, plate, technical sheet, blueprint, ink drawing, a "dense ink" drawing or any picture made in this repository, or wants to change an existing drawing in scenes/.
---

# Drawing a sketch or doodle

Read `AGENTS.md` in the repository root first: it has the API, the paper themes and the rules that make a drawing
look hand-made. Then follow this loop and do not skip the looking.

0. **If the user asks for "dense ink"** (or the style of Tea Engine, Clock Island or The Whale Works), or a weird,
   dense, shaded-all-over ink drawing, read the *Dense ink* section of `AGENTS.md` and follow its recipe and its order of work.
   For **"engraving"** or a print-like night scene, read the *Shading* section and start from `scenes/observatory.js`.
1. **Pick the closest plate** in the recipes table of `AGENTS.md` and read its scene file for the patterns it uses
   (the compact ones, `lighthouse.js`, `typewriter.js`, `octopolis.js`, are the quickest to learn from).
2. **Start the drawing**: copy `scenes/_template.js` (or `scenes/_template-3d.js`, or `scenes/doodle-kit.js` for a
   grown doodle) to `scenes/<name>.js`. Choose a `theme` that suits the subject and one accent colour.
3. **Block it in**, one `P.section('…')` per part, then render: `node tools/render.mjs <name>`. Read
   `renders/<name>.png` and the output (errors, missing letters, strokes per section).
4. **Critique the render against the rules** in `AGENTS.md` (readable at a glance, one light direction, line weights,
   no accidental hard edges, nothing cut off, density where the eye should go, notes on the page). Write down what is
   wrong before changing anything.
5. **Refine and re-render**, several rounds. Add detail where it repays zooming in; check it with `--width 3200`.
   Check the pen order with `--stages 4`: the drawing should build up the way an illustrator would draw it.
6. **Finish**: add the name to `scenes/manifest.js`, run `node tools/render.mjs <name> --video` if the user wants to
   watch it being drawn, and show the user the PNG (and video).

If the render command fails, read its error output; it prints exceptions thrown by the scene.
