#!/usr/bin/env node
/* Export a drawing as SVG: every stroke stays a vector, so it can be printed at any size or sent to a pen plotter.

   node tools/export-svg.mjs <scene> [--out file.svg] [--plotter]
     --plotter   strokes only, as single-width polylines (no fills, no knock-outs): what a pen plotter can draw */
import { launch } from './browser.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const args = process.argv.slice(2), scene = args.find(a => !a.startsWith('--')), plotter = args.includes('--plotter');
const oi = args.indexOf('--out'), root = resolve(dirname(fileURLToPath(import.meta.url)), '..'), name = basename(scene).replace(/\.js$/, '');
const out = resolve(oi >= 0 ? args[oi + 1] : `renders/${name}${plotter ? '-plotter' : ''}.svg`); mkdirSync(dirname(out), { recursive: true });
const sceneArg = pathToFileURL(scene.endsWith('.js') ? resolve(scene) : resolve(root, 'scenes', scene + '.js')).href;
const browser = await launch(), page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(pathToFileURL(resolve(root, 'sheet.html')).href + '?render&scene=' + encodeURIComponent(sceneArg));
await page.waitForFunction(() => window.__sketch && window.__sketch.player, null, { timeout: 60000 });
const svg = await page.evaluate(plotter => {
  const p = window.__sketch.player, ops = p.ops, f1 = v => Math.round(v * 10) / 10, out = [], defs = [], clips = new Map();
  const col = (c, a) => { const m = String(c).match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i); return [c, a]; };
  const clipId = poly => { if (!clips.has(poly)) { const id = 'c' + clips.size; clips.set(poly, id); defs.push(`<clipPath id="${id}"><path d="M${poly.map(q => f1(q[0]) + ' ' + f1(q[1])).join('L')}Z"/></clipPath>`); } return clips.get(poly); };
  for (const op of ops) {
    const cl = op.clip ? ` clip-path="url(#${clipId(op.clip)})"` : '';
    if (op.k === 's' && plotter && /^#f{3,6}$/i.test(op.c)) continue;
    if (op.k === 's') { const w = op.p.reduce((a, q) => a + q[2], 0) / op.p.length * 1.36; out.push(`<polyline points="${op.p.map(q => f1(q[0]) + ',' + f1(q[1])).join(' ')}" fill="none" stroke="${plotter ? '#000' : op.c}" stroke-width="${plotter ? 0.5 : f1(w)}" stroke-linecap="round" stroke-linejoin="round"${plotter ? '' : ` stroke-opacity="${f1(op.a)}"`}${cl}/>`); }
    else if (plotter) continue;
    else if (op.k === 'd') out.push(`<circle cx="${f1(op.x)}" cy="${f1(op.y)}" r="${f1(op.r)}" fill="${op.c}" fill-opacity="${f1(op.a)}"${cl}/>`);
    else if (op.k === 'D') out.push(`<g fill="${op.c}" fill-opacity="${f1(op.a)}"${cl}>${op.p.map(q => `<circle cx="${f1(q[0])}" cy="${f1(q[1])}" r="${f1(q[2])}"/>`).join('')}</g>`);
    else if (op.k === 'f') out.push(`<path d="M${op.poly.map(q => f1(q[0]) + ' ' + f1(q[1])).join('L')}Z" fill="${op.c}" fill-opacity="${f1(op.a)}"${cl}/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000"><defs>${defs.join('')}</defs>${plotter ? '' : '<rect width="1600" height="1000" fill="#ffffff"/>'}${out.join('\n')}</svg>`;
}, plotter);
writeFileSync(out, svg); await browser.close();
console.log(`${name}: ${svg.length >> 10} KB → ${out}`);
