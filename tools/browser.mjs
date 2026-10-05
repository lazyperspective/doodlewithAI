/* Find a browser to render with: Playwright's own Chromium if installed, else the Chrome / Chromium / Edge already
   on this machine, else a clear message saying how to get one. CHROMIUM_PATH=/path/to/chrome overrides everything. */
import { chromium } from 'playwright';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium', '/usr/bin/microsoft-edge',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
// any Chromium an older Playwright left behind
const cached = () => { const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, join(process.env.HOME || process.env.USERPROFILE || '', '.cache/ms-playwright'), join(process.env.HOME || '', 'Library/Caches/ms-playwright'), join(process.env.LOCALAPPDATA || '', 'ms-playwright')].filter(Boolean), out = [];
  for (const r of roots) { if (!existsSync(r)) continue; for (const d of readdirSync(r).filter(n => n.startsWith('chromium-')).sort().reverse()) for (const exe of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-win/chrome.exe']) if (existsSync(join(r, d, exe))) out.push(join(r, d, exe)); }
  return out; };

export async function launch() {
  const tries = [];
  if (process.env.CHROMIUM_PATH) tries.push({ executablePath: process.env.CHROMIUM_PATH });
  tries.push({});
  for (const p of [...cached(), ...CANDIDATES]) if (existsSync(p)) tries.push({ executablePath: p });
  let last;
  for (const t of tries) { try { return await chromium.launch(t); } catch (e) { last = e; } }
  console.error(`No browser to render with. Install one with:\n\n    npx playwright install chromium\n\nor point CHROMIUM_PATH at an existing Chrome/Chromium.\n(${String(last && last.message || last).split('\n')[0]})`);
  process.exit(4);
}
