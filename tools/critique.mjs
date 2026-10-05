#!/usr/bin/env node
/* Look at a render the way a teacher squints at a drawing: blur it, then check the big picture. Writes a blurred
   thumbnail next to the PNG and prints what looks wrong.

   node tools/critique.mjs renders/<name>.png */
import { launch } from './browser.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const file = resolve(process.argv[2]), browser = await launch(), page = await browser.newPage();
await page.setContent('<canvas id="c"></canvas>');
const r = await page.evaluate(async src => {
  const img = new Image(); img.src = src; await img.decode();
  const W = 64, H = Math.round(64 * img.height / img.width), c = document.getElementById('c'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.filter = 'blur(1.2px)'; x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, v = []; for (let i = 0; i < W * H; i++) v.push(1 - (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255);
  const paper = Math.min(...v); const ink = v.map(q => Math.max(0, (q - paper) / (1 - paper)));
  const at = (i, j) => ink[j * W + i], mean = a => a.reduce((s, q) => s + q, 0) / a.length;
  const q = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b]) => { const cells = []; for (let j = b * H / 2; j < (b + 1) * H / 2; j++) for (let i = a * W / 2; i < (a + 1) * W / 2; i++) cells.push(at(i | 0, j | 0)); return mean(cells); });
  const mid = ink.filter(t => t > 0.25 && t < 0.6).length / ink.length, white = ink.filter(t => t < 0.12).length / ink.length, dark = ink.filter(t => t > 0.6).length / ink.length;
  // focal point: where the local contrast is highest
  let best = 0, fx = 0, fy = 0; for (let j = 2; j < H - 2; j++) for (let i = 2; i < W - 2; i++) { let mx = 0, mn = 1; for (let b = -2; b <= 2; b++) for (let a = -2; a <= 2; a++) { const t = at(i + a, j + b); mx = Math.max(mx, t); mn = Math.min(mn, t); } if (mx - mn > best) { best = mx - mn; fx = i / W; fy = j / H; } }
  const y2 = document.createElement('canvas'); y2.width = img.width / 4; y2.height = img.height / 4; const z = y2.getContext('2d'); z.filter = 'blur(6px)'; z.drawImage(img, 0, 0, y2.width, y2.height);
  return { quads: q, mid, white, dark, focal: [fx, fy, best], thumb: y2.toDataURL('image/png'), coverage: mean(ink) };
}, 'data:image/png;base64,' + readFileSync(file).toString('base64'));
await browser.close();
const { writeFileSync } = await import('node:fs'); writeFileSync(file.replace(/\.png$/, '') + '-squint.png', Buffer.from(r.thumb.split(',')[1], 'base64'));
const pc = x => Math.round(x * 100) + '%', names = ['top left', 'top right', 'bottom left', 'bottom right'];
console.log(`ink coverage ${pc(r.coverage)}  ·  bare paper ${pc(r.white)}  ·  mid-grey ${pc(r.mid)}  ·  near-black ${pc(r.dark)}`);
console.log(`quarters: ${r.quads.map((v, i) => names[i] + ' ' + pc(v)).join(', ')}`);
console.log(`focal point (strongest contrast) at ${pc(r.focal[0])} across, ${pc(r.focal[1])} down`);
const notes = [];
const qmax = Math.max(...r.quads), qmin = Math.min(...r.quads);
if (qmin < qmax * 0.25) notes.push(`the ${names[r.quads.indexOf(qmin)]} quarter is nearly empty: fill it, or make the emptiness clearly deliberate`);
if (r.mid > 0.45) notes.push('a lot of the page is mid-grey: push some areas to clean white and others to solid black');
if (r.dark < 0.02 && r.coverage > 0.15) notes.push('there is almost no deep black: add spot blacks in openings, undersides and crevices');
if (r.white < 0.12) notes.push('almost no bare paper is left: leave rest areas so the dense parts read');
if (r.focal[2] < 0.5) notes.push('no clear focal point: put the strongest dark-against-light where you want the eye to go');
const [fx, fy] = r.focal; if (Math.abs(fx - 0.5) < 0.06 && Math.abs(fy - 0.5) < 0.06) notes.push('the focal point is dead centre: shifting it toward a third often reads better');
console.log(notes.length ? notes.map(n => '  - ' + n).join('\n') : '  nothing obvious: now look at it at full size');
console.log('squint view →', file.replace(/\.png$/, '') + '-squint.png');
