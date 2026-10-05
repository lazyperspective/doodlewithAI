#!/usr/bin/env node
/* Render a drawing so you (or your agent) can look at it.

   node tools/render.mjs <scene> [options]
     <scene>            a name in scenes/ (e.g. doodle-kit) or a path to a .js file
     --out <file>       output path (default: renders/<scene>.png, or .mp4 with --video)
     --width <px>       image width (default 1600; the sheet is 1600x1000 units)
     --stages <n>       also write a contact sheet of the drawing at n stages of the pen (renders/<scene>-stages.png)
     --video            write the pen drawing it as an MP4 (needs ffmpeg on PATH); --seconds <s> (default 12), --fps <n> (default 30)
     --at <0..1>        render the drawing partly done
     --time <s>         for drawings with animated parts: the clock for those parts (default 0)
     --crop x0,y0,x1,y1 render only this part of the sheet (sheet units, 1600 x 1000), at --width for the whole sheet:
                        --width 4800 --crop 600,300,1000,550 is a 3x close-up of that box

   Needs Playwright: npm install (then, once, npx playwright install chromium). Uses no server: the pages open from disk. */
import { launch } from './browser.mjs';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2), VAL = ['out', 'width', 'stages', 'seconds', 'fps', 'at', 'time', 'crop'], o = {}; let scene = null;
for (let i = 0; i < args.length; i++) { const a = args[i]; if (a.startsWith('--')) { const k = a.slice(2); if (VAL.includes(k)) o[k] = args[++i]; else o[k] = true; } else if (!scene) scene = a; }
const opt = (k, d) => o[k] ?? d;
if (!scene) { console.log('usage: node tools/render.mjs <scene> [--out file] [--width px] [--stages n] [--video] [--at 0..1] [--time s]'); process.exit(1); }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..'), name = basename(scene).replace(/\.js$/, '');
const sceneArg = scene.endsWith('.js') ? pathToFileURL(resolve(scene)).href : scene;
const width = +opt('width', 1600), scale = width / 1600, video = !!opt('video', false);
const out = resolve(opt('out', `renders/${name}${video ? '.mp4' : '.png'}`)); mkdirSync(dirname(out), { recursive: true });

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: scale });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text()); });
await page.goto(pathToFileURL(resolve(root, 'sheet.html')).href + '?render&scene=' + encodeURIComponent(sceneArg));
try { await page.waitForFunction(() => window.__sketch && window.__sketch.player, null, { timeout: 60000 }); }
catch { console.error('the drawing did not load:\n  ' + (errors.join('\n  ') || 'no error reported')); await browser.close(); process.exit(2); }
const stats = await page.evaluate(() => window.__sketch.stats());
const crop = opt('crop', null)?.split(',').map(Number);
const shot = async file => { await page.waitForTimeout(30); if (crop) { const b = await page.locator('#stage').boundingBox(), k = b.width / 1600; await page.screenshot({ path: file, clip: { x: b.x + crop[0] * k, y: b.y + crop[1] * k, width: (crop[2] - crop[0]) * k, height: (crop[3] - crop[1]) * k } }); } else await page.locator('#stage').screenshot({ path: file }); };
const time = +opt('time', 0);

if (video) {
  const secs = +opt('seconds', 12), fps = +opt('fps', 30), n = Math.round(secs * fps), dir = out + '.frames'; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  for (let i = 0; i <= n; i++) { await page.evaluate(f => window.__sketch.at(f), Math.pow(i / n, 0.9)); await shot(`${dir}/f_${String(i).padStart(5, '0')}.png`); }
  for (let i = 0; i < fps * 2; i++) { await page.evaluate(t => window.__sketch.clock(t), i / fps); await shot(`${dir}/f_${String(n + 1 + i).padStart(5, '0')}.png`); }
  const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', `${dir}/f_%05d.png`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2', out]);
  if (ff.error || ff.status) console.log(`ffmpeg not available: the frames are in ${dir}`); else rmSync(dir, { recursive: true, force: true });
} else {
  const at = +opt('at', 1); await page.evaluate(f => window.__sketch.at(f), at); if (time) await page.evaluate(t => window.__sketch.clock(t), time); await shot(out);
  const stages = +opt('stages', 0);
  if (stages > 1) { const files = []; for (let i = 1; i <= stages; i++) { const f = `${out}.stage${i}.png`; await page.evaluate(v => window.__sketch.at(v), i / stages); await shot(f); files.push(f); }
    const sheet = out.replace(/\.png$/, '') + '-stages.png';
    const html = `<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${stages <= 4 ? 2 : Math.min(4, stages)},1fr);gap:4px">${files.map(f => `<img style="width:100%" src="data:image/png;base64,${readFileSync(f).toString('base64')}">`).join('')}</body>`;
    const p2 = await browser.newPage({ viewport: { width: 2400, height: 10 } }); await p2.setContent(html); await p2.waitForTimeout(200); await p2.screenshot({ path: sheet, fullPage: true }); files.forEach(f => rmSync(f)); console.log('stages →', sheet); }
}
await browser.close();
console.log(`${stats.name}: ${stats.ops} strokes → ${out}`);
if (stats.sections && stats.sections.length) { if (stats.before) console.log(`  ${String(stats.before).padStart(7)}  (before the first P.section)`); for (const s2 of stats.sections) console.log(`  ${String(s2.ops).padStart(7)}  ${s2.name}`); }
if (stats.missing) console.log(`  note: the alphabet has no ${JSON.stringify(stats.missing)}; those letters were drawn as "?"`);
if (stats.ops > 30000) console.log(`  note: over ${stats.ops > 60000 ? '60 000' : '30 000'} strokes; the pen will take a while and the page will be slow to replay. Use P.dots and fade instead of many single marks.${stats.ops > 60000 ? '' : ' (Fine for the dense ink style, which goes up to 60 000.)'}`);
if (errors.length) { console.log('errors in the page:\n  ' + errors.join('\n  ')); process.exit(3); }
