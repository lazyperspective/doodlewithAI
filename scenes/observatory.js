/* The Lunar Observatory: a towering observatory on a sea cliff under a huge full moon, drawn as a print with every
   shading technique in src/shading.js: mezzotint sky, weighted-Voronoi moon, wood-engraved sea, engraved cliff,
   the brass telescope and its tower in 3D 'engraving', a woodcut foreground of rocks and a pine. */
(window.SCENES = window.SCENES || []).push({
  name: 'The Lunar Observatory', seed: 41, ink: '#0c0b0a', reveal: true,
  theme: { base: '#f3efe2', blot: ['rgba(200,180,130,0.10)', 'rgba(255,255,255,0.16)'], grid: null, fib: ['rgba(110,96,64,0.06)', 'rgba(255,255,255,0.35)'], vig: 'rgba(120,100,60,0.16)', tape: false, blend: 'multiply', grain: [250, 246, 234, 24] },
  note: 'A towering observatory on a sea cliff at night, its giant brass telescope aimed at the full moon; it is closed for clouds.',
  build(P) {
    const S = Sketch, D = S.D3, V = S.V3, K = SketchKit, TAU = Math.PI * 2, INK = '#0c0b0a', WHITE = '#ffffff';
    const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const lerp = (a, b, t) => a + (b - a) * t, gs = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
    const circ = (x, y, r, n = 72, ry = r, a0 = 0) => Array.from({ length: n }, (_, k) => [x + Math.cos(a0 + k * TAU / n) * r, y + Math.sin(a0 + k * TAU / n) * ry]);
    const hash = (x, y, s = 0) => { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 144665)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const vn = (x, y, s = 0) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      return lerp(lerp(hash(xi, yi, s), hash(xi + 1, yi, s), u), lerp(hash(xi, yi + 1, s), hash(xi + 1, yi + 1, s), u), v); };
    const fbm = (x, y, s = 0, o = 4) => { let a = 0, w = 0.5, f = 1; for (let i = 0; i < o; i++) { a += w * vn(x * f, y * f, s + i * 17); w *= 0.5; f *= 2.03; } return a / (1 - Math.pow(0.5, o)); };

    // the print: an image box inside a plate mark, a caption below
    const X0 = 64, Y0 = 44, X1 = 1536, Y1 = 872, BOX = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]];
    const HZ = 594;                                   // the horizon (the camera's eye level)
    const M = { x: 1066, y: 300, r: 252 };            // the moon
    const clipBox = poly => K.clip(poly, BOX);         // fills are drawn in their own colour when the pen uncovers the page, so keep them inside the box
    const solid = (poly, c = INK, a = 1) => { const q = clipBox(poly); if (q.length > 2) P.wash(q, c, a, { edge: 0, jit: 0, steps: 1 }); };
    const white = poly => { const q = clipBox(poly); if (q.length > 2) P.occlude(q, WHITE); };
    const outline = (poly, w = 1.5, o = {}) => P.path(poly.concat([poly[0], poly[1]]), Object.assign({ w, rough: 0.3, passes: 1 }, o));
    const jag = (pts, amp, step = 6, s = 0) => { const out = []; for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step)), nx = -(b[1] - a[1]) / (L || 1), ny = (b[0] - a[0]) / (L || 1);
      for (let k = 0; k < n; k++) { const t = k / n, e = (fbm((a[0] + (b[0] - a[0]) * t) / 23, (a[1] + (b[1] - a[1]) * t) / 23, s) - 0.5) * 2 * amp; out.push([a[0] + (b[0] - a[0]) * t + nx * e, a[1] + (b[1] - a[1]) * t + ny * e]); } } out.push(pts[pts.length - 1]); return out; };
    // a stroke whose width runs from w0 to w1: branches, posts, tails
    const taper = (pts, w0, w1, c = INK, a = 1) => { const n = pts.length; P.push({ k: 's', c, a, p: pts.map((q, i) => [q[0], q[1], lerp(w0, w1, i / Math.max(1, n - 1))]) }); };
    // a line with a white halo, so it reads on the black sky and on lit stone alike
    const haloLine = (pts, w = 0.8, hw = 2.6) => { P.push({ k: 's', c: WHITE, a: 1, p: pts.map(q => [q[0], q[1], hw]) }); P.push({ k: 's', c: INK, a: 1, p: pts.map(q => [q[0], q[1], w]) }); };

    // weighted Voronoi stippling, as P.stippleW (tone-weighted samples relaxed by Lloyd's algorithm on a weighted grid),
    // but with typed-array buckets so a whole moon (20 000 dots, fine cells, many iterations) builds in a few seconds
    const stippleFast = (poly, T, n, o = {}) => {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      const A = Math.abs(K.area(poly)), cell = o.cell ?? 0.5, gm = o.gamma ?? 1, px = new Float64Array(n), py = new Float64Array(n); let m = 0;
      for (let t = 0; t < n * 80 && m < n; t++) { const x = P.r(x0, x1), y = P.r(y0, y1); if (S.pip(poly, x, y) && P.R() < Math.pow(T(x, y), gm)) { px[m] = x; py[m] = y; m++; } }
      const cx = [], cy = [], cw = []; for (let y = y0 + cell / 2; y < y1; y += cell) for (let x = x0 + cell / 2; x < x1; x += cell) { if (!S.pip(poly, x, y)) continue; const w = Math.pow(T(x, y), gm); if (w > 0.002) { cx.push(x); cy.push(y); cw.push(w); } }
      const NC = cx.length, sp = Math.sqrt(A / m) * 1.2, gw = Math.ceil((x1 - x0) / sp) + 1, gh = Math.ceil((y1 - y0) / sp) + 1, head = new Int32Array(gw * gh), next = new Int32Array(m), sx = new Float64Array(m), sy = new Float64Array(m), sw = new Float64Array(m);
      for (let it = 0; it < (o.iters ?? 16); it++) {
        head.fill(-1); for (let i = 0; i < m; i++) { const g = Math.min(gh - 1, Math.max(0, Math.floor((py[i] - y0) / sp))) * gw + Math.min(gw - 1, Math.max(0, Math.floor((px[i] - x0) / sp))); next[i] = head[g]; head[g] = i; }
        sx.fill(0); sy.fill(0); sw.fill(0);
        for (let c = 0; c < NC; c++) { const x = cx[c], y = cy[c], gx = Math.floor((x - x0) / sp), gy = Math.floor((y - y0) / sp); let best = -1, bd = 1e18;
          for (let r = 0; r < 40; r++) { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue; const X = gx + i, Y = gy + j; if (X < 0 || Y < 0 || X >= gw || Y >= gh) continue;
              for (let k = head[Y * gw + X]; k >= 0; k = next[k]) { const d = (px[k] - x) ** 2 + (py[k] - y) ** 2; if (d < bd) { bd = d; best = k; } } }
            if (best >= 0 && bd <= (r * sp) ** 2) break; }
          if (best >= 0) { sx[best] += x * cw[c]; sy[best] += y * cw[c]; sw[best] += cw[c]; } }
        for (let i = 0; i < m; i++) if (sw[i] > 0) { px[i] = sx[i] / sw[i]; py[i] = sy[i] / sw[i]; }
      }
      const pts = []; for (let i = 0; i < m; i++) pts.push([px[i], py[i]]); return pts;
    };

    const cam = D.camera({ eye: [-520, -2250, -130], target: [90, 0, 250], f: 1520, cx: 520, cy: 345 });
    const pj2 = p => { const q = cam.project(p); return [q[0], q[1]]; };
    const L = V.norm([0.66, -0.42, 0.62]);            // moonlight from the right, in front, above
    const toEye = V.norm([cam.eye[0], cam.eye[1], 0]);

    /* ---------------- sky: mezzotint, black at the top, a little burnished round the moon ---------------- */
    P.section('sky');
    const skyT = (x, y) => {
      const d = Math.hypot(x - M.x, y - M.y);
      if (d < M.r + 0.3) return 0;
      const glow = Math.exp(-(d - M.r) / 4.5) * 0.4 + Math.exp(-(d - M.r) / 130) * 0.13;
      const haze = Math.exp(-(HZ - y) / 3) * 0.3;
      return clamp(1.0 - glow - haze + (Y0 + 120 - y) / 3000 - 0.2 * Math.pow(sstep(HZ - 330, HZ, y), 1.4) * sstep(820, 380, x));
    };
    P.mezzotint([[X0 - 3, Y0 - 3], [X1 + 3, Y0 - 3], [X1 + 3, HZ + 2], [X0 - 3, HZ + 2]], skyT);
    const stars = [];
    for (let i = 0; i < 1100; i++) { const x = P.r(X0, X1), y = P.r(Y0, HZ - 24), t = skyT(x, y); if (t < 0.86 || P.R() > (t - 0.84) * 6) continue; stars.push([x, y, P.r(0.3, 0.8) * (P.R() < 0.05 ? 1.9 : 1)]); }
    P.dots(stars, WHITE, 1);
    stars.filter(s => s[2] > 1.1).forEach(([x, y, r]) => { const l = r * 4.8; P.push({ k: 's', c: WHITE, a: 1, p: [[x - l, y, 0.1], [x, y, 0.8], [x + l, y, 0.1]] }); P.push({ k: 's', c: WHITE, a: 1, p: [[x, y - l, 0.1], [x, y, 0.8], [x, y + l, 0.1]] }); });

    /* the Milky Way: white scumble haze and star dust in the dark upper left, away from the moon */
    P.section('milkyway');
    { const mw = t => [lerp(X0 - 40, 700, t), lerp(560, Y0 - 60, t) + Math.sin(t * 3.1) * 30], band = [];
      for (let k = 0; k <= 20; k++) { const [x, y] = mw(k / 20), w = 46 + 30 * Math.sin(k / 20 * Math.PI); band.push([x - w * 0.5, y - w * 0.8]); }
      for (let k = 20; k >= 0; k--) { const [x, y] = mw(k / 20), w = 46 + 30 * Math.sin(k / 20 * Math.PI); band.push([x + w * 0.5, y + w * 0.8]); }
      const mwT = (x, y) => { let best = 1e9, bt = 0; for (let k = 0; k <= 40; k++) { const [px, py] = mw(k / 40), d = Math.hypot(x - px, y - py); if (d < best) { best = d; bt = k / 40; } }
        const lane = Math.exp(-(((best - 10 + 18 * (fbm(bt * 6, 1, 95) - 0.5)) / 6) ** 2)) * 0.7;
        return clamp((Math.exp(-((best / 40) ** 2)) * (0.35 + 0.65 * fbm(x / 26, y / 26, 96)) * (1 - lane)) * sstep(0, 0.15, bt) * sstep(1, 0.75, bt)); };
      P.scumble(band, mwT, { r: 0.95, w: 0.22, density: 0.9, c: WHITE, a: 0.42 });
      const dust = []; for (let i = 0; i < 2600; i++) { const x = P.r(X0, 760), y = P.r(Y0, 600), t = mwT(x, y); if (P.R() < t * 0.9) dust.push([x, y, P.r(0.25, 0.6)]); } P.dots(dust, WHITE, 0.95); }

    /* ---------------- the moon: weighted Voronoi stipple ---------------- */
    P.section('moon');
    // maria as unions of soft ellipses (moon coordinates -1..1, north up), edges broken by low-frequency noise
    const maria = [[-0.32, -0.44, 0.3, 0.25, 0.2], [-0.52, -0.26, 0.2, 0.17, 0], [0.2, -0.37, 0.17, 0.16, 0], [0.38, -0.08, 0.22, 0.17, 0.5], [0.12, -0.2, 0.13, 0.11, 0], [0.72, -0.3, 0.1, 0.08, 0],
      [0.6, 0.12, 0.11, 0.18, -0.3], [0.38, 0.3, 0.085, 0.085, 0], [-0.15, 0.38, 0.19, 0.13, 0], [-0.62, 0.0, 0.24, 0.42, 0.25], [-0.4, 0.17, 0.2, 0.16, 0], [0.0, -0.68, 0.42, 0.06, 0.05],
      [-0.48, 0.42, 0.09, 0.08, 0], [0.04, -0.16, 0.1, 0.08, 0], [-0.25, 0.08, 0.14, 0.1, 0], [0.28, -0.24, 0.1, 0.08, 0]];
    const craters = [[-0.1, 0.72, 0.04, 2], [-0.3, -0.04, 0.045, 2], [-0.56, -0.1, 0.026, 2], [-0.69, -0.33, 0.024, 2], [-0.12, -0.7, 0.04, 0], [0.56, 0.6, 0.05, 0], [-0.38, 0.62, 0.058, 0], [0.18, 0.56, 0.045, 0],
      [0.6, -0.56, 0.034, 0], [-0.74, 0.36, 0.05, 0], [0.05, 0.42, 0.034, 0], [0.42, 0.45, 0.04, 0], [-0.05, 0.85, 0.05, 0], [0.3, 0.75, 0.04, 0], [0.75, 0.1, 0.03, 0], [-0.82, -0.2, 0.03, 0]];
    for (let i = 0; i < 40; i++) { const a = P.r(TAU), rr = Math.sqrt(P.R()) * 0.9; craters.push([Math.cos(a) * rr, Math.sin(a) * rr, P.r(0.014, 0.03), 0]); }
    const mareAt = (u, v) => { let m = 0; const w = (fbm(u * 2.4, v * 2.4, 3) - 0.5) * 0.45 + (fbm(u * 6, v * 6, 4) - 0.5) * 0.05;
      for (const [mx, my, rx, ry, rot] of maria) { const c = Math.cos(rot), s = Math.sin(rot), du = (u - mx) * c + (v - my) * s, dv = -(u - mx) * s + (v - my) * c;
        m = Math.max(m, 1 - sstep(0.76, 1.0, Math.hypot(du / rx, dv / ry) + w)); } return m; };
    const moonT = (x, y) => {
      const u = (x - M.x) / M.r, v = (y - M.y) / M.r, d2 = u * u + v * v; if (d2 >= 1) return 0;
      const nz = Math.sqrt(1 - d2);
      let t = 0.035 + Math.pow(1 - nz, 2.4) * 0.34 + (u * 0.5 + v * 0.3 + 0.5) * 0.04 + (fbm(u * 4, v * 4, 8) - 0.5) * 0.07;
      t += mareAt(u, v) * (0.34 + 0.05 * fbm(u * 5, v * 5, 5));
      for (const [cxr, cyr, cr, kind] of craters) { const du = u - cxr, dv = v - cyr, q = Math.hypot(du, dv) / cr;
        if (kind === 2) { t -= 0.3 * Math.exp(-q * q * 0.5); continue; }
        if (q < 1.25) { if (q > 0.84) t -= 0.12; else if (kind < 0) t += 0.24; else t += (du * 0.7 + dv * 0.7) / cr < -0.3 ? 0.1 : -0.04; } }
      for (const [rx0, ry0, nr, k] of [[-0.1, 0.72, 9, 0.16], [-0.3, -0.04, 7, 0.08]]) { const tu = u - rx0, tv = v - ry0, ta = Math.atan2(tv, tu), td = Math.hypot(tu, tv);
        t -= k * Math.pow(Math.max(0, Math.sin(ta * nr + rx0 * 9) * Math.sin(ta * (nr + 4) + 1)), 2) * Math.exp(-td * 1.7); }
      return clamp(t + (fbm(u * 14, v * 14, 9) - 0.5) * 0.035);
    };
    P.isolate('moon-stipple', () => { const pts = stippleFast(circ(M.x, M.y, M.r, 200), moonT, 21000, { cell: 0.5, iters: 18 }); P.dots(pts.map(([x, y]) => [x, y, 0.4 + 0.62 * moonT(x, y)]), INK, 0.95); }, true);

    /* the moon's halo: white flow lines in rings, crowded at the rim and opening out into the dark */
    P.section('halo');
    { const ring = circ(M.x, M.y, M.r + 80, 160).concat([[M.x + M.r + 80, M.y]]).concat(circ(M.x, M.y, M.r + 2, 160).reverse()).concat([[M.x + M.r + 2, M.y]]);
      P.flowTone(ring, (x, y) => { const d = Math.hypot(x - M.x, y - M.y) - M.r, an = Math.atan2(y - M.y, x - M.x); return y > HZ - 2 ? 0 : clamp(0.5 * Math.exp(-d / 22) * sstep(0.4, 0.66, fbm(Math.cos(an) * 3 + 9, Math.sin(an) * 3 + d / 40, 97))); }, { field: 'contour', gapMin: 3.6, gapMax: 20, w: 0.38, c: WHITE, a: 0.75 }); }

    /* the one cloud in the sky, parked in front of the telescope: scumbled, with a silver lining */
    P.section('cloud');
    const CL = { x: 1124, y: 160 }, lobes = [[-40, 4, 15], [-22, -6, 19], [2, -12, 24], [26, -4, 19], [44, 4, 13]];
    const cTop = []; for (let x = CL.x - 54; x <= CL.x + 56; x += 1.5) { let y = CL.y + 9; for (const [lx, ly, r] of lobes) { const dx = x - CL.x - lx; if (Math.abs(dx) < r) y = Math.min(y, CL.y + ly - Math.sqrt(r * r - dx * dx)); } cTop.push([x, Math.min(y, CL.y + 9)]); }
    const cloudPoly = cTop.concat([[CL.x + 50, CL.y + 12], [CL.x + 20, CL.y + 14], [CL.x - 20, CL.y + 14], [CL.x - 50, CL.y + 12]]);
    white(cloudPoly);
    const cTopY = x => { const i = Math.round((x - CL.x + 54) / 1.5); return (cTop[Math.max(0, Math.min(cTop.length - 1, i))] || [0, CL.y])[1]; };
    const cloudT = (x, y) => clamp(0.03 + Math.pow(sstep(cTopY(x) + 3, CL.y + 13, y), 1.6) * 0.8 + (fbm(x / 8, y / 8, 81) - 0.5) * 0.2);
    P.tsp(P.stippleW(cloudPoly, cloudT, 520, { draw: false, iters: 10, cell: 0.5 }), { w: 0.36, a: 0.9 });
    // inner lobe lines, and the outline
    lobes.slice(1, 4).forEach(([lx, ly, r]) => P.arc(CL.x + lx, CL.y + ly, r * 0.92, r * 0.92, Math.PI * 1.05, Math.PI * 1.55, { w: 0.5, rough: 0.1, passes: 1 }));
    P.path(cTop, { w: 1.1, rough: 0.15, passes: 1 }); P.path([[CL.x - 50, CL.y + 12], [CL.x - 20, CL.y + 14], [CL.x + 20, CL.y + 14], [CL.x + 50, CL.y + 12]], { w: 0.7, rough: 0.2, passes: 1 });

    // three gulls crossing the moon
    [[905, 452, 7, 0.2], [930, 470, 5.5, -0.1], [957, 446, 6.5, 0.15]].forEach(([x, y, s, t]) => { const L2 = [[x - s, y - s * 0.35 + t * s], [x - s * 0.45, y - s * 0.55], [x, y]], R2 = [[x, y], [x + s * 0.5, y - s * 0.6], [x + s * 1.05, y - s * 0.3 - t * s]];
      [L2, R2].forEach(w => { const sm = P.sample(w, false, 1.5); P.push({ k: 's', c: INK, a: 1, p: sm.map((q, i) => [q[0], q[1], 0.35 + 0.9 * Math.sin(Math.PI * (i / (sm.length - 1)) * 0.5 + (w === L2 ? Math.PI / 2 : 0))]) }); }); });

    /* ---------------- the sea: wood engraving, white lines cut in a black block, the moon's path in the lights ---------------- */
    P.section('sea');
    const seaBot = Y1, seaPoly = [[X0, HZ], [X1, HZ], [X1, seaBot], [X0, seaBot]];
    const seaT = (x, y) => {
      const s = clamp((y - HZ) / (seaBot - HZ)), pw = 22 + s * 230, dx = (x - M.x) / pw;
      const path = Math.exp(-dx * dx * (1 + 0.4 * Math.sin(y * 0.7))) * (0.5 + 0.5 * fbm(x / (8 + s * 30), y / (1.4 + s * 5), 11));
      const glit = path * sstep(0.35, 0.72, fbm(x / (4 + s * 16), y / (1 + s * 3), 12));
      return clamp(0.88 + s * 0.08 - path * 0.5 - glit * 0.65 - Math.exp(-(y - HZ) / 7) * 0.3);
    };
    solid(seaPoly);
    for (let y = HZ; y < seaBot;) {
      const s = (y - HZ) / (seaBot - HZ), gap = 1.4 + s * 3.4, y2 = Math.min(seaBot, y + gap * 5);
      P.engrave([[X0, y], [X1, y], [X1, y2], [X0, y2]], (x, yy) => 1 - seaT(x, yy), { ang: 0, gap, cross: false, c: WHITE, wave: [0.25 + s * 1.5, 10 + s * 44], minW: 0.12 });
      y = y2;
    }
    // a far headland on the right, in aquatint
    const head = jag([[1290, HZ + 1], [1330, HZ - 7], [1395, HZ - 14], [1450, HZ - 25], [1500, HZ - 21], [X1, HZ - 29], [X1, HZ + 1]], 2.5, 5, 41);
    white(head); P.aquatint(clipBox(head), (x, y) => clamp(0.5 + (y - HZ + 30) / 70), { levels: 3 });

    /* a meteor over the empty side of the sky */
    P.section('meteor');
    { const m0 = [196, 150], m1 = [312, 96], n = 30, pts = []; for (let k = 0; k <= n; k++) { const t = k / n; pts.push([lerp(m0[0], m1[0], t), lerp(m0[1], m1[1], t), 0.08 + Math.pow(t, 2.2) * 1.5]); } P.push({ k: 's', c: WHITE, a: 1, p: pts });
      P.dots([[m1[0], m1[1], 1.4]], WHITE, 1); }

    /* ---------------- the 3D observatory ---------------- */
    const faces = [], add = fs => { for (const f of fs) faces.push(f); return fs; };
    const xform = (fs, O, e1, e2, e3) => fs.map(f => Object.assign({}, f, { v: f.v.map(([x, y, z]) => V.add(O, V.add(V.mul(e1, x), V.add(V.mul(e2, y), V.mul(e3, z))))),
      n: V.norm(V.add(V.mul(e1, f.n[0]), V.add(V.mul(e2, f.n[1]), V.mul(e3, f.n[2])))), hdir: f.hdir ? V.add(V.mul(e1, f.hdir[0]), V.add(V.mul(e2, f.hdir[1]), V.mul(e3, f.hdir[2]))) : undefined }));
    const lit = f => V.dot(f.n, L);
    // (u, v) on a quad face (v0 v1 along the bottom, v3 v2 along the top) to the screen
    const quadAt = (f, u, v) => { const [a, b, c, d] = f.v, lo = V.add(a, V.mul(V.sub(b, a), u)), hi = V.add(d, V.mul(V.sub(c, d), u)); return pj2(V.add(lo, V.mul(V.sub(hi, lo), v))); };
    const zOf = f => [Math.min(...f.v.map(q => q[2])), Math.max(...f.v.map(q => q[2]))];
    // a window in a wall face: black where the wall is lit, glowing white with black bars where it is in shade
    const windowOn = (f, z0, z1, o = {}) => {
      const [fz0, fz1] = zOf(f), v0 = (z0 - fz0) / (fz1 - fz0), v1 = (z1 - fz0) / (fz1 - fz0), u0 = o.u0 ?? 0.24, u1 = o.u1 ?? 0.76, arch = o.arch ?? 0.5;
      const fw = Math.hypot(...V.sub(f.v[1], f.v[0])), vs = v1 - (u1 - u0) * arch * fw / (fz1 - fz0);
      const pts = [quadAt(f, u0, v0), quadAt(f, u1, v0), quadAt(f, u1, vs)];
      for (let k = 1; k < 8; k++) { const a = k / 8 * Math.PI; pts.push(quadAt(f, (u0 + u1) / 2 + Math.cos(a) * (u1 - u0) / 2, vs + Math.sin(a) * (v1 - vs))); } pts.push(quadAt(f, u0, vs));
      const glow = lit(f) < (o.glowBelow ?? 0.15);
      if (glow) { P.occlude(pts, WHITE); P.path(pts.concat([pts[0]]), { w: 0.9, rough: 0.1, passes: 1 }); const m0 = quadAt(f, 0.5, v0), m1 = quadAt(f, 0.5, v1); P.line(m0[0], m0[1], m1[0], m1[1], { w: 0.7, rough: 0.1, passes: 1, over: 0 });
        const t0 = quadAt(f, u0, (v0 + vs) / 2), t1 = quadAt(f, u1, (v0 + vs) / 2); P.line(t0[0], t0[1], t1[0], t1[1], { w: 0.6, rough: 0.1, passes: 1, over: 0 }); }
      else { P.wash(pts, INK, 1, { edge: 0, jit: 0, steps: 1 }); const m0 = quadAt(f, 0.5, v0 + 0.02), m1 = quadAt(f, 0.5, (vs + v1) / 2); P.line(m0[0], m0[1], m1[0], m1[1], { w: 0.5, c: WHITE, rough: 0.1, passes: 1, over: 0, a: 0.9 }); }
      const s0 = quadAt(f, u0 - 0.06, v0 - 0.01), s1 = quadAt(f, u1 + 0.06, v0 - 0.01); P.line(s0[0], s0[1], s1[0], s1[1], { w: 1.1, rough: 0.1, passes: 1, over: 0 });
    };
    const course = (f, z, w = 0.8) => { const [fz0, fz1] = zOf(f); if (z <= fz0 || z >= fz1) return; const v = (z - fz0) / (fz1 - fz0), a = quadAt(f, 0.0, v), b = quadAt(f, 1.0, v); P.line(a[0], a[1], b[0], b[1], { w, rough: 0.1, passes: 1, over: 0, a: 0.9 }); };
    const drum = (cx, cy, r, z0, z1, seg, o = {}) => { const fs = D.cylinder(cx, cy, r, z0, z1, seg); let i = 0;
      for (const f of fs) { if (f.n[2] > 0.5) continue; const k = i++; f.deco = (P2, c2, poly, face) => { (o.courses || []).forEach(z => course(face, z, 0.7)); if (o.rust) for (let z = z0 + o.rust; z < z1 - 2; z += o.rust) course(face, z, 0.4);
        if (o.win && k % o.win.every === (o.win.phase ?? 0)) windowOn(face, o.win.z0, o.win.z1, o.win); }; }
      return add(fs); };
    const dome = (cx, cy, z, r, seg, o = {}) => { const fs = D.sphere(cx, cy, z, r, { seg, rings: o.rings ?? 10, sz: o.sz ?? 1 }).filter(f => f.v.every(v => v[2] >= z - 0.1)); let i = 0;
      fs.forEach(f => { const k = i++ % seg; f.deco = (P2, c2, poly, face) => {
        const az = Math.atan2(face.v[0][1] + face.v[1][1] - 2 * cy, face.v[0][0] + face.v[1][0] - 2 * cx), da = Math.atan2(Math.sin(az - (o.slit ?? 99)), Math.cos(az - (o.slit ?? 99)));
        if (o.slit !== undefined && Math.abs(da) < (o.slitW ?? 0.16) && face.v[0][2] < z + r * 0.93) { P.wash([quadAt(face, 0.04, 0), quadAt(face, 0.96, 0), quadAt(face, 0.96, 1), quadAt(face, 0.04, 1)], INK, 1, { edge: 0, jit: 0, steps: 1 }); return; }
        if (k % (o.rib ?? 3) === 0) { const a = quadAt(face, 0.1, 0), b = quadAt(face, 0.1, 1); P.line(a[0], a[1], b[0], b[1], { w: 0.9, rough: 0.1, passes: 1, over: 0 }); } }; });
      return add(fs); };
    // a gallery railing round a ring, as a custom item on the near side
    const railing = (cx, cy, r, z, h = 22, n = 40) => add([{ c: [cx + toEye[0] * r, cy + toEye[1] * r, z + h / 2], bias: 2, custom: () => {
      const pts = [], posts = []; for (let k = 0; k <= n; k++) { const a = k / n * TAU, nx = Math.cos(a), ny = Math.sin(a); if (nx * toEye[0] + ny * toEye[1] < -0.05) { if (pts.length > 1) { haloLine(pts, 0.8, 2.4); } pts.length = 0; continue; }
        const p0 = pj2([cx + nx * r, cy + ny * r, z]), p1 = pj2([cx + nx * r, cy + ny * r, z + h]); pts.push(p1); posts.push([p0, p1]); }
      if (pts.length > 1) haloLine(pts, 0.8, 2.4); posts.forEach(([a, b]) => haloLine([a, b], 0.55, 1.8)); } }]);

    /* main tower: plinth, three drums with galleries, the dome */
    const plinth = add(D.extrude(D.circlePts(0, 0, 150, 8, Math.PI / 8), 0, 60));
    plinth.forEach(f => { if (f.n[2] > 0.5) return; f.deco = (P2, c2, poly, face) => { for (let z = 12; z < 60; z += 12) course(face, z, 0.5); if (face.n[1] < -0.9) windowOn(face, 0, 46, { u0: 0.38, u1: 0.62, glowBelow: 2 }); }; });
    drum(0, 0, 106, 60, 260, 32, { courses: [110, 246], win: { every: 4, phase: 1, z0: 128, z1: 222, u0: 0.2, u1: 0.8 } });
    add(D.ringSolid(0, 0, 100, 136, 260, 272, 32)); railing(0, 0, 134, 272);
    drum(0, 0, 88, 272, 430, 28, { courses: [414], win: { every: 3, z0: 300, z1: 384, u0: 0.18, u1: 0.82 } });
    add(D.ringSolid(0, 0, 82, 110, 430, 440, 28)); railing(0, 0, 108, 440, 18);
    drum(0, 0, 72, 440, 560, 24, { courses: [548], win: { every: 2, z0: 466, z1: 532, u0: 0.3, u1: 0.7 } });
    add(D.ringSolid(0, 0, 68, 86, 560, 570, 24));
    drum(0, 0, 64, 570, 600, 24, { win: { every: 2, phase: 1, z0: 576, z1: 594, u0: 0.3, u1: 0.7, arch: 0.5 } });
    dome(0, 0, 600, 68, 24, { slit: -0.35, slitW: 0.14, rib: 2 });
    add(D.cylinder(0, 0, 13, 666, 690, 10));
    add(D.revolve(0, 0, [[18, 688], [19, 694], [7, 706], [2.2, 724], [3.6, 727], [0.01, 732]], { seg: 10 }));
    // the moon-phase dial on the second drum
    { const a = Math.atan2(toEye[1], toEye[0]) + 0.12, C = [Math.cos(a) * 90, Math.sin(a) * 90, 345], e1 = [-Math.sin(a), Math.cos(a), 0], e2 = [0, 0, 1];
      const at2 = (r, t, dy = 0) => pj2(V.add(C, V.add(V.mul(e1, Math.cos(t) * r), V.mul(e2, dy + Math.sin(t) * r))));
      add([{ c: C, bias: 3, custom: () => { const ring = (r, n = 40) => Array.from({ length: n }, (_, k) => at2(r, k / n * TAU));
        const o = ring(30); P.occlude(o, WHITE); outline(o, 1.3, { rough: 0.1 }); outline(ring(25), 0.6, { rough: 0.1 });
        for (let k = 0; k < 28; k++) { const t = k / 28 * TAU, p = at2(25, t), q = at2(k % 7 ? 22 : 19, t); P.line(p[0], p[1], q[0], q[1], { w: 0.45, rough: 0, passes: 1, over: 0 }); }
        outline(Array.from({ length: 20 }, (_, k) => at2(8, k / 20 * TAU, 6)), 0.7, { rough: 0 });
        P.wash(Array.from({ length: 11 }, (_, k) => { const t = -Math.PI / 2 + k / 10 * Math.PI, p = at2(8, Math.PI - t, 6); return p; }), INK, 1, { edge: 0, jit: 0, steps: 1 });
        const h0 = pj2(C), h1 = pj2(V.add(C, V.mul(e1, 16))), h2 = pj2(V.add(C, V.add(V.mul(e1, -6), V.mul(e2, -18)))); P.line(h0[0], h0[1], h1[0], h1[1], { w: 1.1, rough: 0, passes: 1, over: 0 }); P.line(h0[0], h0[1], h2[0], h2[1], { w: 0.8, rough: 0, passes: 1, over: 0 }); } }]); }

    /* left turret and an iron lattice mast with a crow's-nest dome, joined to the tower by a truss bridge */
    drum(-262, 92, 52, 0, 236, 18, { courses: [100, 222], win: { every: 3, z0: 132, z1: 196 } });
    add(D.ringSolid(-262, 92, 48, 68, 236, 246, 18)); railing(-262, 92, 66, 246, 16, 24);
    drum(-262, 92, 42, 246, 272, 18);
    dome(-262, 92, 272, 46, 18, { rib: 3 });
    const MS = [-170, 230], mastTop = 500;
    drum(MS[0], MS[1], 30, mastTop, mastTop + 44, 14, { win: { every: 2, z0: mastTop + 10, z1: mastTop + 34 } });
    add(D.ringSolid(MS[0], MS[1], 26, 42, mastTop, mastTop + 6, 14));
    dome(MS[0], MS[1], mastTop + 44, 32, 14, { rib: 2, slit: 0.2, slitW: 0.25 });
    add([{ c: [MS[0], MS[1], 260], custom: () => {
      const leg = k => { const a = Math.PI / 4 + k * Math.PI / 2; return z => { const r = lerp(46, 20, z / mastTop); return [MS[0] + Math.cos(a) * r, MS[1] + Math.sin(a) * r, z]; }; };
      for (let k = 0; k < 4; k++) haloLine([0, mastTop].map(z => pj2(leg(k)(z))), 1.1, 3);
      for (let z = 0; z < mastTop - 10; z += 50) for (let k = 0; k < 4; k++) { const A = leg(k), B = leg((k + 1) % 4); haloLine([pj2(A(z)), pj2(B(z + 50))], 0.5, 1.8); haloLine([pj2(B(z)), pj2(A(z + 50))], 0.5, 1.8); haloLine([pj2(A(z + 50)), pj2(B(z + 50))], 0.6, 2); }
      // truss bridge to the tower's upper gallery
      const b0 = [MS[0] + 30, MS[1] - 30, 440], b1 = [-58, 90, 440], bp = t => V.add(b0, V.mul(V.sub(b1, b0), t));
      haloLine([pj2(bp(0)), pj2(bp(1))], 0.9, 2.6); haloLine([pj2(V.add(bp(0), [0, 0, 20])), pj2(V.add(bp(1), [0, 0, 20]))], 0.8, 2.4);
      for (let k = 0; k <= 6; k++) { haloLine([pj2(bp(k / 6)), pj2(V.add(bp(k / 6), [0, 0, 20]))], 0.5, 1.7); if (k < 6) haloLine([pj2(bp(k % 2 ? k / 6 : (k + 1) / 6)), pj2(V.add(bp(k % 2 ? (k + 1) / 6 : k / 6), [0, 0, 20]))], 0.4, 1.5); }
    } }]);

    /* engine house with a chimney, behind on the right; a pipe to the telescope's drive */
    const eh = add(D.extrude([[120, 170], [300, 170], [300, 290], [120, 290]], 0, 150));
    eh.forEach(f => { if (Math.abs(f.n[2]) > 0.5) return; f.deco = (P2, c2, poly, face) => { for (let z = 20; z < 150; z += 15) course(face, z, 0.35); if (Math.hypot(...V.sub(face.v[1], face.v[0])) > 100) [0.2, 0.42, 0.64].forEach(u => windowOn(face, 60, 118, { u0: u, u1: u + 0.12 })); }; });
    add(D.extrude([[128, 178], [292, 178], [292, 282], [128, 282]], 150, 164));
    drum(250, 230, 17, 164, 360, 12, { courses: [348] }); add(D.ringSolid(250, 230, 15, 22, 360, 372, 12));
    add(D.tube([[230, 170, 40], [260, 60, 40], [330, 0, 50], [372, -30, 60]], 9, { seg: 10 }));

    /* the great telescope on its terrace: pier, azimuth gear, fork, trunnions, declination wheel, the stepped brass tube */
    const PV = [430, -60, 268], dir = V.norm([0.85, 0.35, 0.4]), az = Math.atan2(dir[1], dir[0]), ph = [-Math.sin(az), Math.cos(az), 0], uh = [Math.cos(az), Math.sin(az), 0];
    const wv = V.cross(dir, ph), at = t => V.add(PV, V.mul(dir, t)), RT = 58;
    const terrace = add(D.extrude(D.circlePts(430, -60, 176, 10, 0.2), 0, 44));
    terrace.forEach(f => { if (f.n[2] > 0.5) return; f.deco = (P2, c2, poly, face) => { for (let z = 11; z < 44; z += 11) course(face, z, 0.45); }; });
    railing(430, -60, 172, 44, 20, 50);
    add(D.cylinder(430, -60, 96, 44, 70, 28));
    add(D.gearMesh(430, -60, 124, 72, 70, 84, 0));
    add(D.cylinder(430, -60, 72, 84, 122, 24));
    for (const sg of [-1, 1]) { const c = V.add(PV, V.mul(ph, sg * (RT + 30))); add(D.bodyOfBar([c[0] - uh[0] * 46, c[1] - uh[1] * 46], [c[0] + uh[0] * 46, c[1] + uh[1] * 46], 14, 14, 122, PV[2] + 24)); }
    add(D.tube([V.add(PV, V.mul(ph, -(RT + 70))), V.add(PV, V.mul(ph, RT + 50))], 18, { seg: 14, caps: true }));
    // the declination wheel: rim, spokes and hub, on the near side, turning about the trunnions
    { const wf = [...D.ringSolid(0, 0, 98, 114, 0, 10, 48), ...D.cylinder(0, 0, 24, 0, 16, 16)]; for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + 0.3; wf.push(...D.bodyOfBar([Math.cos(a) * 20, Math.sin(a) * 20], [Math.cos(a) * 100, Math.sin(a) * 100], 6, 4, 2, 8)); }
      wf.forEach(f => { if (Math.abs(f.n[2]) < 0.5 && Math.hypot(f.v[0][0], f.v[0][1]) > 110) f.deco = (P2, c2, poly, face) => { const p = quadAt(face, 0.5, 0), q = quadAt(face, 0.5, 1); P.line(p[0], p[1], q[0], q[1], { w: 0.5, rough: 0, passes: 1, over: 0 }); }; });
      add(xform(wf, V.add(PV, V.mul(ph, -(RT + 52))), uh, [0, 0, 1], V.mul(ph, -1))); }
    // the tube as one lathe: eyepiece plate, breech, bands, the objective cell and a flared dew cap
    const prof = [[0.01, -356], [26, -356], [30, -350], [30, -338], [36, -338], [36, -242], [RT + 9, -242], [RT + 9, -228], [RT, -228]];
    const band = (t, r) => prof.push([r, t - 7], [r + 7, t - 7], [r + 7, t + 7], [r, t + 7]);
    band(-90, RT); band(50, RT); band(190, RT);
    prof.push([RT, 322], [RT + 9, 322], [RT + 9, 338], [RT + 5, 338]); band(465, RT + 5);
    prof.push([RT + 5, 592], [RT + 15, 592], [RT + 15, 608], [RT + 12, 608], [RT + 15, 660], [RT + 19, 700], [RT + 24, 718], [RT + 26, 724], [RT + 19, 724]);
    const lathe = (pr, O, seg = 32) => xform(D.revolve(0, 0, pr, { seg, crease: 0.3 }), O, ph, wv, dir);
    add(lathe(prof, PV));
    const fo = V.mul(wv, RT + 30);
    add(lathe([[0.01, -172], [10, -172], [12, -164], [12, 280], [17, 290], [17, 316], [14, 318]], V.add(PV, fo), 14));
    [-90, 190].forEach(t => add(D.tube([V.add(at(t), V.mul(wv, RT - 2)), V.add(at(t), V.mul(wv, RT + 20))], 5, { seg: 8 })));
    add(D.tube([V.add(at(-300), V.mul(wv, 30)), V.add(at(-300), V.mul(wv, 76))], 10, { seg: 10, caps: true }));
    add(D.tube([V.add(at(-300), V.mul(wv, 76)), V.add(V.add(at(-300), V.mul(wv, 76)), V.mul(ph, -30))], 8, { seg: 10, caps: true }));
    add(D.tube([V.add(at(-170), V.mul(wv, -RT)), V.add(at(-170), V.mul(wv, -RT - 76))], 6, { seg: 8 }));
    { const Q = V.add(at(-170), V.mul(wv, -RT - 104)); add(D.sphere(Q[0], Q[1], Q[2], 32, { seg: 20, rings: 12 })); }
    // the observer's ladder up to the eyepiece
    add([{ c: V.add(at(-300), [0, -40, -60]), bias: 40, custom: () => {
      const e = at(-300), foot0 = [e[0] - 90, e[1] - 40, 44], foot1 = [e[0] - 90 + ph[0] * 26, e[1] - 40 + ph[1] * 26, 44], top0 = V.add(e, V.add(V.mul(ph, -14), [0, 0, -10])), top1 = V.add(e, V.add(V.mul(ph, 12), [0, 0, -10]));
      haloLine([pj2(foot0), pj2(top0)], 0.9, 2.6); haloLine([pj2(foot1), pj2(top1)], 0.9, 2.6);
      for (let k = 1; k < 9; k++) { const t = k / 9; haloLine([pj2(V.add(foot0, V.mul(V.sub(top0, foot0), t))), pj2(V.add(foot1, V.mul(V.sub(top1, foot1), t)))], 0.6, 1.8); } } }]);

    P.section('3d');
    D.render(P, faces, cam, { style: 'engraving', light: L, ambient: 0.16, w: 1.45, rough: 0.25, zw: 0, silhouette: true, engraveGap: 2.6, crossAng: 32, darken: 1.15, depthWeight: 0.6, paper: WHITE, ink: INK, solidFrom: 0.86 });

    /* ---------------- the cliff: Voronoi rock facets, each engraved at its own angle, drawn over the foot of the buildings ---------------- */
    P.section('cliff');
    const xr = 948, seaY = 748;
    const lipY = x => 504 + (fbm(x / 70, 1, 51) - 0.5) * 22 - gs(x, 300, 60) * 8 + Math.max(0, x - 860) * 0.12 + sstep(214, 186, x) * 34 + sstep(120, 96, x) * 18;
    const topEdge = jag(Array.from({ length: 60 }, (_, i) => { const x = X0 + (xr - X0) * i / 59; return [x, lipY(x)]; }), 2.5, 6, 52);
    const rface = jag([[xr, lipY(xr)], [956, 548], [950, 592], [978, 626], [972, 672], [1002, 706], [1024, seaY + 4]], 3, 6, 71);
    const cliffAll = clipBox(topEdge.concat(rface).concat([[X0, seaY + 4]]));
    white(cliffAll);
    const ky = 0.62, seeds = [];
    for (let y = 470; y < seaY + 50; y += 15) for (let x = X0 - 40; x < xr + 140; x += 15) { const p = 0.03 + 0.14 * sstep(0.35, 0.7, fbm(x / 90, y / 70, 33)); if (hash(x, y, 34) < p) seeds.push([x + P.r(-6, 6), (y + P.r(-6, 6)) * ky]); }
    const cells = K.voronoi(seeds, [[X0 - 80, 430 * ky], [xr + 220, 430 * ky], [xr + 220, (seaY + 90) * ky], [X0 - 80, (seaY + 90) * ky]]).map(c => c.map(([x, y]) => [x, y / ky]));
    const hgt = (x, y) => fbm(x / 34, y / 22, 22) + 0.4 * fbm(x / 9, y / 7, 23), bump = (x, y) => (hgt(x - 1.6, y + 1.2) - hgt(x + 1.6, y - 1.2)) * 2.2 + (fbm(x / 60, y / 40, 24) - 0.5) * 0.25;
    const ledges = []; for (let k = 0; k < 9; k++) { const x0 = P.r(X0, 860), y = P.r(545, 735); ledges.push({ x0, x1: x0 + P.r(90, 320), y, s: P.r(0, 9) }); }
    const ledgeAt = (x, y) => { let t = 0; for (const l of ledges) { if (x < l.x0 || x > l.x1) continue; const e = Math.min(x - l.x0, l.x1 - x) / 30, ly = l.y + Math.sin(x / 37 + l.s) * 5, d = y - ly; if (d > 0 && d < 13) t += 0.45 * (1 - d / 13) * Math.min(1, e); else if (d < 0 && d > -5) t -= 0.35 * Math.min(1, e); } return t; };
    const rockCells = [];
    const segDist = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1, t = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2); return Math.hypot(a[0] + dx * t - p[0], a[1] + dy * t - p[1]); };
    const onRim = p => { for (let i = 0; i < cliffAll.length; i++) if (segDist(p, cliffAll[i], cliffAll[(i + 1) % cliffAll.length]) < 0.6) return true; return false; };
    // an interior edge is broken up the same way whichever cell walks it: the displacement is set by the edge's canonical direction
    const jagEdge = (a, b) => { const key = (p) => Math.round(p[0] * 4) * 100003 + Math.round(p[1] * 4), flip = key(a) > key(b), A = flip ? b : a, B = flip ? a : b, L = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.max(1, Math.round(L / 5)), nx = -(B[1] - A[1]) / (L || 1), ny = (B[0] - A[0]) / (L || 1), out = [];
      for (let k = 1; k < n; k++) { const t = k / n, x = lerp(A[0], B[0], t), y = lerp(A[1], B[1], t), e = (fbm(x / 13, y / 13, 57) - 0.5) * 2 * Math.min(5, L * 0.12) * Math.sin(Math.PI * t); out.push([x + nx * e, y + ny * e]); } return flip ? out.reverse() : out; };
    cells.forEach(c => {
      let piece = K.clip(cliffAll, c); if (piece.length < 3 || Math.abs(K.area(piece)) < 25) return;
      const jp = []; for (let i = 0; i < piece.length; i++) { const a = piece[i], b = piece[(i + 1) % piece.length]; jp.push(a); if (!onRim([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2])) jp.push(...jagEdge(a, b)); } piece = jp;
      const [cx, cy] = K.centroid(piece), face = clamp((fbm(cx / 110, cy / 80, 35) - 0.5) * 2.6 + (cx - 640) / 420 + P.r(-0.25, 0.25), -1, 1), up = P.r(0, 0.4) + (cy < 530 ? 0.4 : 0), ga = P.r(TAU), gk = P.r(0.1, 0.3);
      const lam = clamp(0.18 + 0.42 * face + 0.2 * up - (cy - 520) / 520, 0.08, 1);
      const T = (x, y) => clamp(1.0 - lam + ((x - cx) * Math.cos(ga) + (y - cy) * Math.sin(ga)) / 40 * gk + (y - 560) / 900 + bump(x, y) * 0.7 + ledgeAt(x, y) - sstep(6, 0, y - lipY(x)) * 0.7 - sstep(16, 0, y - lipY(x)) * 0.35 * sstep(300, 800, x));
      rockCells.push({ piece, cx, cy, lam, T, ang: 90 - face * 12 + P.r(-5, 5) });
    });
    rockCells.forEach(r => { if (r.lam < 0.04 && r.cy > 545) solid(r.piece); else P.engrave(r.piece, r.T, { ang: r.ang, gap: 2.5, cross: 38, crossFrom: 0.55 }); });
    rockCells.forEach(r => { let run = []; const flush = () => { if (run.length > 4) { const a = run[0], b = run[run.length - 1]; if (Math.abs(b[1] - a[1]) > Math.abs(b[0] - a[0]) * 0.8 && P.R() < 0.6) P.path(run, { w: lerp(1.5, 0.45, r.lam), rough: 0.3, passes: 1 }); } run = []; };
      r.piece.forEach(p => { if (onRim(p) || p[1] < lipY(p[0]) + 5) flush(); else run.push(p); }); flush(); });
    ledges.forEach(l => { const pts = []; for (let x = l.x0 + 8; x < l.x1 - 8; x += 4) pts.push([x, l.y + Math.sin(x / 37 + l.s) * 5]); if (pts.length > 2) P.path(pts, { w: 1.1, rough: 0.3, passes: 1 }); });
    // a sea cave at the foot
    solid(jag([[560, seaY + 3], [566, 712], [588, 690], [618, 686], [642, 702], [652, seaY + 3]], 2, 5, 77));
    // grass and thrift along the lip
    for (let x = X0 + 4; x < xr; x += P.r(3, 9)) { if (fbm(x / 40, 7, 78) < 0.45) continue; const y = lipY(x) + 1, h = P.r(3, 9); taper([[x, y], [x + P.r(-2, 2), y - h * 0.6], [x + P.r(-3, 3), y - h]], 0.9, 0.15); }
    outline(cliffAll, 1.9);
    // talus: fallen blocks along the foot, dark with moonlit tops
    for (let x = 240; x < 1010; x += P.r(18, 46)) { if (x > 552 && x < 660) continue; const w = P.r(10, 26), h = P.r(7, 16), y = seaY + 2, blk = jag([[x - w / 2, y], [x - w * 0.42, y - h * 0.7], [x - w * 0.1, y - h], [x + w * 0.35, y - h * 0.85], [x + w / 2, y]], 1, 3, x);
      white(blk); P.engrave(blk, (px, py) => clamp(0.9 - sstep(y - h * 0.55, y - h, py) * 0.75 * sstep(x - w * 0.3, x + w * 0.3, px)), { ang: 80, gap: 2.2, cross: 40 }); outline(blk, 1, { rough: 0.2 }); }
    // the zigzag stair down the moonlit face to the jetty, with its rail
    const stair = [[912, 516], [968, 560], [940, 600], [990, 646], [962, 690], [1010, 742]];
    for (let i = 0; i + 1 < stair.length; i++) { const [a, b] = [stair[i], stair[i + 1]], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4);
      white([[a[0], a[1]], [b[0], b[1]], [b[0], b[1] + 5], [a[0], a[1] + 5]]); solid([[a[0], a[1] + 5], [b[0], b[1] + 5], [b[0], b[1] + 8], [a[0], a[1] + 8]]);
      for (let k = 1; k < n; k++) { const x = lerp(a[0], b[0], k / n), y = lerp(a[1], b[1], k / n); P.line(x, y, x, y + 5, { w: 0.45, rough: 0, passes: 1, over: 0 }); }
      P.line(a[0], a[1], b[0], b[1], { w: 0.6, rough: 0.1, passes: 1, over: 0 });
      haloLine([[a[0], a[1] - 9], [b[0], b[1] - 9]], 0.6, 1.8); for (let k = 0; k <= n; k += 3) { const x = lerp(a[0], b[0], k / n), y = lerp(a[1], b[1], k / n); P.line(x, y, x, y - 9, { w: 0.45, rough: 0, passes: 1, over: 0 }); } }

    /* ---------------- the shore: foam at the foot of the cliff, the jetty and a boat ---------------- */
    P.section('shore');
    const foam = [];
    for (let x = X0; x < 1030; x += P.r(10, 34)) { if (fbm(x / 60, 5, 80) < 0.48) continue; const n = Math.round(P.r(2, 8) * (0.4 + fbm(x / 80, 2, 79))), y0 = seaY + 3 + P.r(-2, 3);
      for (let k = 0; k < n; k++) { const r = P.r(1.2, 3.4) * (k ? 0.8 : 1.15); foam.push([x + P.r(-9, 9), y0 + P.r(-3, 3) - (k % 3 === 0 ? P.r(0, 5) : 0), r]); } }
    foam.forEach(([x, y, r]) => white(circ(x, y, r, 12, r * 0.7)));
    foam.forEach(([x, y, r]) => { if (r > 2.6) P.arc(x, y, r, r * 0.7, 0.3, Math.PI - 0.3, { w: 0.35, rough: 0.1, passes: 1, a: 0.8 }); });
    for (let k = 0; k < 120; k++) { const x = P.r(X0, 1020), y = seaY + P.r(4, 26), l = P.r(6, 30); P.push({ k: 's', c: WHITE, a: 0.9, p: [[x, y, 0.1], [x + l * 0.4, y + P.r(-0.4, 0.4), P.r(0.5, 1.1)], [x + l, y, 0.1]] }); }
    [[300, 745], [700, 742], [980, 738]].forEach(([sx, sy]) => { const sp = []; for (let k = 0; k < 140; k++) { const a = -Math.PI / 2 + P.r(-0.9, 0.9), d = Math.pow(P.R(), 0.7) * 26; sp.push([sx + Math.cos(a) * d, sy + Math.sin(a) * d * 0.9, P.r(0.3, 0.9) * (1 - d / 34)]); } P.dots(sp, WHITE, 1); });
    const JY = 758; [1004, 1022, 1040, 1058, 1076].forEach(x => solid([[x - 1.6, JY - 2], [x + 1.6, JY - 2], [x + 1.6, JY + 12], [x - 1.6, JY + 12]]));
    white([[996, JY - 5], [1084, JY - 5], [1084, JY - 1], [996, JY - 1]]); P.rect(996, JY - 5, 88, 4, { w: 0.7, rough: 0.1, passes: 1, over: 0 });
    haloLine([[1080, JY - 5], [1080, JY - 28]], 1, 2.6); white(circ(1080, JY - 31, 3.4, 12)); outline(circ(1080, JY - 31, 3.4, 12), 0.8, { rough: 0 });
    const lampGlow = []; for (let k = 0; k < 160; k++) { const a = P.r(TAU), d = Math.pow(P.R(), 0.6) * 18; lampGlow.push([1080 + Math.cos(a) * d, JY - 31 + Math.sin(a) * d * 0.8, P.r(0.3, 0.7)]); } P.dots(lampGlow, WHITE, 0.9);
    { const a = [900, 512], b = [1080, JY - 26], pts = []; for (let k = 0; k <= 24; k++) { const t = k / 24; pts.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t) + Math.sin(t * Math.PI) * 34]); } P.drypoint(pts, { w: 0.55, side: 1, burr: 0.6 }); haloLine([[a[0], a[1]], [a[0], a[1] - 30]], 1.1, 2.8); }
    for (let k = 0; k < 9; k++) { const y = JY + 4 + k * 3.2, w = 2 + k * 0.9, x = 1080 + Math.sin(k * 2.1) * 1.5; P.push({ k: 's', c: WHITE, a: 1, p: [[x - w, y, 0.2], [x, y, 0.9 - k * 0.06], [x + w, y, 0.2]] }); }
    const boat = [[1100, 770], [1150, 770], [1142, 778], [1108, 778]]; white(boat); outline(boat, 1, { rough: 0.1 }); P.line(1104, 773, 1146, 773, { w: 0.5, rough: 0, passes: 1, over: 0 });
    P.drypoint(P.sample([[1084, JY - 3], [1092, 768], [1101, 771]], false, 3), { w: 0.5, side: -1, burr: 0.7 });

    /* ---------------- figures and jokes ---------------- */
    P.section('figures');
    // a tiny standing figure: x, y = feet; h = height; face +1 right / -1 left. Drawn black over a white halo.
    const figure = (x, y, h, o = {}) => { const f = o.face ?? 1, hd = h * 0.13, sh = y - h * 0.82, hip = y - h * 0.45;
      const body = [[x - h * 0.12, hip], [x - h * 0.1, sh], [x + h * 0.1, sh], [x + h * 0.14, hip + (o.coat ? h * 0.18 : 0)], [x - h * 0.16, hip + (o.coat ? h * 0.18 : 0)]];
      const shape = () => { P.wash(body, INK, 1, { edge: 0, jit: 0, steps: 1 }); P.wash(circ(x + f * h * 0.02, sh - hd * 1.05, hd, 12), INK, 1, { edge: 0, jit: 0, steps: 1 }); taper([[x - h * 0.05, hip], [x - h * 0.07, y]], h * 0.07, h * 0.05); taper([[x + h * 0.05, hip], [x + h * 0.08, y]], h * 0.07, h * 0.05);
        if (o.hat) P.wash([[x - hd * 1.4 + f, sh - hd * 1.7], [x + hd * 1.4 + f, sh - hd * 1.7], [x + hd * 0.9 + f, sh - hd * 1.9], [x + hd * 0.9 + f, sh - hd * 3.4], [x - hd * 0.9 + f, sh - hd * 3.4], [x - hd * 0.9 + f, sh - hd * 1.9]], INK, 1, { edge: 0, jit: 0, steps: 1 });
        if (o.arm) taper([[x + f * h * 0.06, sh + h * 0.05], ...o.arm(x, sh)], h * 0.06, h * 0.045);
        if (o.skirt) P.wash([[x - h * 0.1, sh + h * 0.2], [x + h * 0.1, sh + h * 0.2], [x + h * 0.22, y - h * 0.02], [x - h * 0.22, y - h * 0.02]], INK, 1, { edge: 0, jit: 0, steps: 1 }); };
      const i0 = P.ops.length; shape(); const mine = P.ops.splice(i0);
      mine.forEach(op => { if (op.k === 'f') P.push({ k: 's', c: WHITE, a: 1, p: op.poly.concat([op.poly[0]]).map(q => [q[0], q[1], 2.4]) }); else if (op.k === 's') P.push(Object.assign({}, op, { c: WHITE, p: op.p.map(q => [q[0], q[1], q[2] + 2.4]) })); });
      mine.forEach(op => P.push(op)); };
    // the astronomer on the first gallery, his back to the moon, spying on the visitors through a little glass
    { const ga = Math.atan2(toEye[1], toEye[0]) - 0.75, p = pj2([Math.cos(ga) * 122, Math.sin(ga) * 122, 272]);
      figure(p[0], p[1], 15, { face: -1, coat: true, arm: (x, sh) => [[x - 5, sh + 1.5], [x - 9, sh + 3.5]] }); haloLine([[p[0] - 7, p[1] - 12.4], [p[0] - 13, p[1] - 9.8]], 1.6, 3.6); }
    // a pennant on the spire and a crescent weathervane; one on the crow's nest
    const pennant = (p, l, h, s) => { const pts = [[p[0], p[1]], [p[0] + l * 0.5, p[1] + h * 0.35 + Math.sin(s) * 2], [p[0] + l, p[1] + h * 0.5], [p[0] + l * 0.5, p[1] + h * 0.75], [p[0], p[1] + h]]; white(pts); outline(pts, 0.8, { rough: 0.15 }); solid(P.sample([[p[0] + l * 0.55, p[1] + h * 0.4], [p[0] + l * 0.85, p[1] + h * 0.5], [p[0] + l * 0.55, p[1] + h * 0.62]], true, 2)); };
    { const s0 = pj2([MS[0], MS[1], mastTop + 74]), s1 = pj2([MS[0], MS[1], mastTop + 104]); haloLine([s0, s1], 0.8, 2.4); pennant(pj2([MS[0], MS[1], mastTop + 102]), 18, 7, 2); }
    // a figure climbing the ladder to the eyepiece, and one with a lantern on the stair
    { const e = at(-300), f0 = pj2([e[0] - 90 + ph[0] * 13, e[1] - 40 + ph[1] * 13, 44]), f1 = pj2(V.add(e, [0, 0, -10])), p = [lerp(f0[0], f1[0], 0.55), lerp(f0[1], f1[1], 0.55)]; figure(p[0] + 3, p[1] + 6, 14, { face: 1, coat: true, arm: (x, sh) => [[x + 4, sh - 3], [x + 5, sh - 6]] }); }
    { const p = [952, 597]; figure(p[0], p[1], 12, { face: -1 }); white(circ(p[0] - 5, p[1] - 6, 1.8, 8)); outline(circ(p[0] - 5, p[1] - 6, 1.8, 8), 0.5, { rough: 0 }); const lg = []; for (let k = 0; k < 60; k++) { const a = P.r(TAU), d = Math.pow(P.R(), 0.6) * 10; lg.push([p[0] - 5 + Math.cos(a) * d, p[1] - 6 + Math.sin(a) * d, P.r(0.25, 0.5)]); } P.dots(lg, WHITE, 0.85); }
    { const d = pj2([Math.cos(-Math.PI / 2) * 0 + 0, -150, 22]), gl = []; for (let k = 0; k < 120; k++) { const a = P.r(-Math.PI, 0.2), r = Math.pow(P.R(), 0.7) * 16; gl.push([d[0] + Math.cos(a) * r * 1.2, d[1] + Math.sin(a) * r * 0.6 + 8, P.r(0.25, 0.55)]); } P.dots(gl, WHITE, 0.8); }
    // the cat on the telescope, the only one looking at the moon
    { const c = pj2(V.add(at(470), V.mul(wv, RT + 8)));
      const body = circ(c[0], c[1] - 4.2, 5.4, 16, 3.6).map(([x, y]) => [x, Math.min(y, c[1] + 0.5)]), head = circ(c[0] + 5.2, c[1] - 9.5, 2.9, 12), ears = [[c[0] + 3.3, c[1] - 11], [c[0] + 3.9, c[1] - 14.6], [c[0] + 5.2, c[1] - 12], [c[0] + 6.5, c[1] - 14.6], [c[0] + 7.2, c[1] - 10.8]];
      [body, head, ears].forEach(q => solid(q)); taper(P.sample([[c[0] - 5, c[1] - 2], [c[0] - 10, c[1] - 4], [c[0] - 11, c[1] - 10], [c[0] - 8.5, c[1] - 13]], false, 2), 1.6, 0.7); }

    /* ---------------- foreground: a black woodcut ridge, rim-lit by the moon ---------------- */
    P.section('foreground');
    const ridgeTop = x => 852 - 96 * gs(x, 170, 150) - 40 * gs(x, 520, 110) - 34 * gs(x, 1050, 130) - 128 * gs(x, 1500, 110) + (fbm(x / 40, 3, 61) - 0.5) * 16;
    const ridgePts = jag(Array.from({ length: 70 }, (_, i) => { const x = X0 + (X1 - X0) * i / 69; return [x, ridgeTop(x)]; }), 3, 6, 62);
    const ridge = clipBox(ridgePts.concat([[X1, Y1], [X0, Y1]]));
    const slope = x => (ridgeTop(x + 3) - ridgeTop(x - 3)) / 6;
    const ridgeT = (x, y) => { const d = y - ridgeTop(x), s = slope(x), rim = Math.exp(-d / 7) * clamp(0.55 - s * 2.8 + (x - 300) / 2200), inner = Math.exp(-Math.abs(fbm(x / 70, y / 30, 63) - 0.5) * 20) * 0.55 * clamp((x - 200) / 900) * clamp(1 - d / 90);
      return clamp(0.98 - rim * 1.1 - inner + (fbm(x / 9, y / 9, 64) - 0.5) * 0.12); };
    P.woodcut(ridge, ridgeT, { field: (x, y) => Math.atan(slope(x)) + (fbm(x / 60, y / 40, 65) - 0.5) * 0.9, gap: 5 });
    P.feather(ridgePts.slice().reverse(), { len: 2.2, density: 0.3 });
    P.path(ridgePts, { w: 1.4, rough: 0.3, passes: 1 });
    // boulders on the ridge, cut with gouges that follow their form, lit from the moon on the upper right
    const boulder = (cx, cy, rx, ry, s) => { const pts = []; for (let k = 0; k < 40; k++) { const a = k / 40 * TAU, rr = 1 + (fbm(Math.cos(a) * 1.6 + s, Math.sin(a) * 1.6, s) - 0.5) * 0.5; pts.push([cx + Math.cos(a) * rx * rr, Math.min(cy + ry * 0.55, cy + Math.sin(a) * ry * rr)]); }
      const poly = clipBox(jag(pts, 1.5, 4, s)); if (poly.length < 3) return;
      P.woodcut(poly, (x, y) => { const dx = (x - cx) / rx, dy = (y - cy) / ry, rr = Math.hypot(dx, dy), lit = clamp((dx * 0.5 - dy * 0.86) * 1.5 - 0.55 + (fbm(x / 14, y / 10, s + 1) - 0.5) * 0.5) * sstep(0.55, 0.95, rr); return clamp(0.97 - lit * 0.9); },
        { field: (x, y) => Math.atan2((y - cy) / ry, (x - cx) / rx) + Math.PI / 2 + (fbm(x / 30, y / 30, s + 2) - 0.5) * 0.8, gap: 4.6 });
      for (let k = 0; k < 2; k++) { const a0 = P.r(-1.6, -0.5), p0 = [cx + Math.cos(a0) * rx * 0.9, cy + Math.sin(a0) * ry * 0.9], p1 = [lerp(p0[0], cx, P.r(0.3, 0.5)), lerp(p0[1], cy + ry * 0.3, P.r(0.3, 0.5))]; const cr = jag([p0, p1], 2, 4, s + k * 7); P.push({ k: 's', c: WHITE, a: 1, p: cr.map((q, i) => [q[0], q[1], 1.3 * (1 - i / cr.length) + 0.1]) }); }
      P.feather(poly, { len: 2, density: 0.25 }); outline(poly, 1.3, { rough: 0.25 }); };
    [[120, 790, 80, 70, 501], [210, 800, 70, 52, 502], [70, 740, 52, 64, 503], [320, 832, 62, 34, 504], [1530, 760, 56, 74, 505], [1300, 846, 54, 30, 506], [700, 856, 50, 22, 507]].forEach(b => boulder(...b));
    // grass blades against the moon's path
    for (let x = 880; x < 1200; x += P.r(2, 7)) { if (fbm(x / 30, 9, 98) < 0.42) continue; const y = ridgeTop(x) + 2, h = P.r(5, 16) * (0.5 + fbm(x / 20, 3, 99)), lean = P.r(-4, 4) + 2;
      const bl = [[x, y], [x + lean * 0.4, y - h * 0.55], [x + lean, y - h]]; P.push({ k: 's', c: WHITE, a: 1, p: bl.map((q, i) => [q[0], q[1], 2.2 - i * 0.5]) }); taper(bl, 1.1, 0.15); }
    // the visitors at the signpost, silhouetted against the moon's path
    const SG = { x: 1006, y: ridgeTop(1006) + 2 };
    figure(SG.x + 52, ridgeTop(SG.x + 52) + 3, 42, { hat: true, face: -1, arm: (x, sh) => [[x - 6, sh + 8], [x - 11, sh + 6]] });
    figure(SG.x + 77, ridgeTop(SG.x + 77) + 3, 38, { skirt: true, face: -1 });
    { const lx = SG.x + 92, ly = ridgeTop(SG.x + 92) - 24; haloLine([[SG.x + 84, ly + 8], [lx, ly + 2], [lx, ly - 4]], 0.9, 2.4); white(circ(lx, ly - 7, 3.2, 12)); outline(circ(lx, ly - 7, 3.2, 12), 0.8, { rough: 0 }); const lg = []; for (let k = 0; k < 90; k++) { const a = P.r(TAU), d = Math.pow(P.R(), 0.6) * 14; lg.push([lx + Math.cos(a) * d, ly - 7 + Math.sin(a) * d, P.r(0.3, 0.6)]); } P.dots(lg, WHITE, 0.9); }
    haloLine([[SG.x, SG.y + 10], [SG.x, SG.y - 46]], 2.4, 5);
    const arrow = [[SG.x - 44, SG.y - 40], [SG.x + 30, SG.y - 40], [SG.x + 30, SG.y - 29], [SG.x - 44, SG.y - 29], [SG.x - 52, SG.y - 34.5]]; white(arrow); outline(arrow, 1.1, { rough: 0.1 });
    P.text('OBSERVATORY', SG.x - 41, SG.y - 31.5, { size: 8.5, fine: true, ls: 0.6 });
    const board = [[SG.x - 46, SG.y - 24], [SG.x + 44, SG.y - 24], [SG.x + 44, SG.y - 9], [SG.x - 46, SG.y - 9]]; white(board); outline(board, 1.1, { rough: 0.1 });
    haloLine([[SG.x - 40, SG.y - 29], [SG.x - 40, SG.y - 24]], 0.5, 1.4); haloLine([[SG.x + 38, SG.y - 29], [SG.x + 38, SG.y - 24]], 0.5, 1.4);
    P.text('CLOSED FOR CLOUDS', SG.x - 1, SG.y - 13.2, { size: 8, fine: true, align: 'center', ls: 0.4 });

    // two small pines on the left rock, in woodcut
    const smallPine = (bx, by, h, lean, s) => { const top = [bx + lean, by - h], tp = P.sample([[bx, by + 6], [bx + lean * 0.4, by - h * 0.5], top], false, 6);
      taper(tp, h * 0.07, h * 0.02);
      for (let k = 0; k < 5; k++) { const t = 0.3 + k * 0.16, p = tp[Math.min(tp.length - 1, Math.round(t * (tp.length - 1)))], rx = h * (0.3 - k * 0.045) * (1 + hash(k, s) * 0.3), ry = h * 0.07, cx = p[0] + (k % 2 ? 1 : -1) * rx * 0.25, cy = p[1];
        const pad = []; for (let j = 0; j <= 24; j++) { const a = Math.PI + j / 24 * Math.PI, bump = 1 + 0.25 * Math.abs(Math.sin(j * 1.3 + s)); pad.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry * 1.6 * bump]); } pad.push([cx + rx * 0.7, cy + ry * 0.6], [cx - rx * 0.7, cy + ry * 0.6]);
        const pp = jag(pad, 1.2, 4, s + k); P.woodcut(pp, (x, y) => clamp(0.92 - 0.7 * Math.exp(-(y - (cy - ry * 1.4)) / 2.4) * sstep(cx - rx * 0.4, cx + rx, x) + (fbm(x / 4, y / 4, s + k) - 0.5) * 0.4), { field: (x, y) => -Math.PI / 2 + (x - cx) / rx * 0.9, gap: 3 }); P.feather(pp, { len: 2.4, density: 0.5 }); } };
    smallPine(1392, ridgeTop(1392) + 6, 150, 10, 900);

    /* ---------------- a black pine leaning in from the right, over the moon's rim ---------------- */
    P.section('pine');
    const trunk = P.sample([[1508, Y1 + 4], [1496, 790], [1476, 716], [1458, 650], [1434, 584], [1406, 520], [1384, 470], [1370, 430]], false, 8);
    const tl = [], trr = []; trunk.forEach((p, i) => { const q = trunk[Math.min(trunk.length - 1, i + 1)], o = trunk[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1, w = lerp(24, 7, i / (trunk.length - 1)); tl.push([p[0] - dy / l * w, p[1] + dx / l * w]); trr.push([p[0] + dy / l * w, p[1] - dx / l * w]); });
    const trunkPoly = tl.concat(trr.slice().reverse());
    const pads = [[1372, 414, 74, 25], [1290, 462, 100, 28], [1200, 510, 70, 21], [1456, 494, 66, 24], [1330, 554, 88, 26], [1250, 610, 64, 20], [1484, 640, 52, 21], [1420, 446, 40, 16]];
    const branches = [[[1376, 446], [1330, 466], [1290, 470]], [[1404, 520], [1350, 508], [1270, 512], [1214, 518]], [[1430, 580], [1380, 566], [1334, 562]], [[1458, 650], [1410, 632], [1300, 616], [1260, 612]], [[1428, 570], [1446, 508]], [[1482, 724], [1480, 652]]];
    branches.forEach((b, i) => taper(P.sample(b.map((q, k) => k && k < b.length - 1 ? [q[0], q[1] + (k % 2 ? -7 : 6)] : q), false, 3), 7, 2.6));
    P.woodcut(clipBox(trunkPoly), (x, y) => { const k = trunk.reduce((b, q, i) => Math.abs(q[1] - y) < Math.abs(trunk[b][1] - y) ? i : b, 0), u = (x - trunk[k][0]) / lerp(24, 7, k / (trunk.length - 1));
      return clamp(0.98 - sstep(-0.6, -0.9, u) * 0.38 + (fbm(x / 7, y / 34, 71) - 0.5) * 0.5); }, { field: -1.85, gap: 3.4 });
    outline(clipBox(trunkPoly), 1.2);
    pads.forEach(([cx, cy, rx, ry], i) => {
      const nb = Math.max(4, Math.round(rx / 13)), top = []; for (let k = 0; k <= nb * 6; k++) { const t = k / (nb * 6), x = cx - rx + 2 * rx * t, bump = Math.abs(Math.sin(t * nb * Math.PI)) * ry * 0.42 * (0.7 + 0.5 * hash(Math.floor(t * nb), i, 5)), arc = Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)); top.push([x, cy - arc * ry * 0.7 - bump * arc]); }
      const bot = []; for (let k = 12; k >= 0; k--) { const x = cx - rx + 2 * rx * k / 12; bot.push([x, cy + ry * 0.5 * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)) + (hash(k, i, 6) - 0.5) * 3]); }
      const pad = clipBox(jag(top.concat(bot), 1.6, 4, 700 + i)), topY = x => { const t = clamp((x - cx + rx) / (2 * rx)); return top[Math.round(t * (top.length - 1))][1]; };
      P.woodcut(pad, (x, y) => clamp(0.9 - 0.75 * Math.exp(-(y - topY(x)) / 2.6) * clamp((cx + rx * 0.6 - x) / rx) + (fbm(x / 5, y / 4, 720 + i) - 0.5) * 0.45), { field: (x, y) => -Math.PI / 2 + (x - cx) / rx * 0.9, gap: 3.4 });
      P.feather(pad, { len: 3, density: 0.55 });
    });

    /* ---------------- key letters, as on an old plate ---------------- */
    P.section('key');
    const keyL = (ch, x, y, light) => P.text(ch, x, y, { size: 12, fine: true, c: light ? WHITE : INK, halo: light ? INK : WHITE, haloW: 3.4, lw: 1 });
    { const t = pj2(V.add(at(150), V.mul(wv, RT + 46))); keyL('A', t[0] - 4, t[1] - 4, true); }
    keyL('B', CL.x + 58, CL.y + 2, false);
    { const ga = Math.atan2(toEye[1], toEye[0]) - 0.75, p = pj2([Math.cos(ga) * 122, Math.sin(ga) * 122, 272]); keyL('C', p[0] - 10, p[1] - 30, true); }
    { const c = pj2(V.add(at(470), V.mul(wv, RT + 8))); keyL('D', c[0] - 4, c[1] - 20, false); }
    keyL('E', SG.x + 100, ridgeTop(SG.x + 100) - 36, true);

    /* ---------------- the print: trim, plate mark, caption ---------------- */
    P.section('frame');
    P.erase([[0, 0], [1600, 0], [1600, Y0], [0, Y0]]); P.erase([[0, Y1], [1600, Y1], [1600, 1000], [0, 1000]]);
    P.erase([[0, 0], [X0, 0], [X0, 1000], [0, 1000]]); P.erase([[X1, 0], [1600, 0], [1600, 1000], [X1, 1000]]);
    const rule = (q, w) => { const pts = []; for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 8); for (let k = 0; k < n; k++) pts.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); } P.path(pts, { w, rough: 0.12, passes: 1, closed: true }); };
    rule(BOX, 2.0); rule([[X0 - 9, Y0 - 9], [X1 + 9, Y0 - 9], [X1 + 9, Y1 + 9], [X0 - 9, Y1 + 9]], 0.55);
    P.text('THE LUNAR OBSERVATORY', 800, 926, { size: 22, align: 'center', ls: 7 });
    P.text('A. The Great Refractor.    B. The Cloud.    C. The Astronomer.    D. The Observer.    E. Visitors.', 800, 952, { size: 9.5, align: 'center', case: 'mixed', fine: true, ls: 0.3 });
    P.text('Drawn on the night of the full moon, the observatory being closed for clouds.', 800, 972, { size: 8.5, align: 'center', case: 'mixed', fine: true });
    P.text('Drawn and engraved by the pen', X0 - 9, 896, { size: 7.5, case: 'mixed', fine: true });
    P.text('Plate I', X1 + 9, 896, { size: 7.5, case: 'mixed', fine: true, align: 'right' });
  }
});
