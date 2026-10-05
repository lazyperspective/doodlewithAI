#!/usr/bin/env node
/* Render every drawing in scenes/manifest.js to docs/images/<name>.jpg (and a contact sheet, docs/images/gallery.jpg).
   node tools/gallery.mjs [--width 1200] */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..'), args = process.argv.slice(2), wi = args.indexOf('--width'), width = wi >= 0 ? +args[wi + 1] : 1200;
const names = [...readFileSync(resolve(root, 'scenes/manifest.js'), 'utf8').replace(/\/\/.*$/gm, '').matchAll(/'([\w-]+)'/g)].map(m => m[1]);
const out = resolve(root, 'docs/images'); mkdirSync(out, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: width / 1600 });
for (const n of names) {
  await page.goto(pathToFileURL(resolve(root, 'sheet.html')).href + '?render&scene=' + n);
  await page.waitForFunction(() => window.__sketch && window.__sketch.player, null, { timeout: 120000 });
  await page.evaluate(() => window.__sketch.at(1)); await page.waitForTimeout(50);
  await page.locator('#stage').screenshot({ path: `${out}/${n}.jpg`, type: 'jpeg', quality: 86 }); console.log('  ' + n);
}
const sheet = await browser.newPage({ viewport: { width: 1600, height: 10 } });
await sheet.setContent(`<body style="margin:0;background:#1a1816;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px">${names.map(n => `<img style="width:100%;display:block" src="data:image/jpeg;base64,${readFileSync(`${out}/${n}.jpg`).toString('base64')}">`).join('')}</body>`);
await sheet.waitForTimeout(400); await sheet.screenshot({ path: `${out}/gallery.jpg`, type: 'jpeg', quality: 84, fullPage: true });
await browser.close(); console.log(`${names.length} drawings → docs/images/`);
