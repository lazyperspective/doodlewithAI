/* SHEET 3 — Suspension bridge in fog: blue ballpoint on cream (style E) with C / B / D insets.
   THE PAINTERS WHO NEVER FINISH. */
(window.SCENES = window.SCENES || []).push({
  name: 'Bridge', seed: 37, ink: '#1c3f94', theme: 'bluepen',
  build(P, n, t) {
    const S = Sketch, TAU = S.TAU, lerp = S.lerp, PI = Math.PI;
    const INK = '#1c3f94', RED = '#c0392b', GRN = '#1e8a5a';
    const XA = 52, XB = 1548, YA = 52, YB = 958;

    /* ================================================================ camera & 3D helpers */
    const CP = [430, 115, -230];
    const cam = S.cam({ pos: CP, yaw: -0.58, pitch: 0.06, f: 1000, cx: 860, cy: 335 });
    const pr = (x, y, z) => cam([x, y, z]);
    const wd = (d, b) => b * Math.max(0.42, Math.min(1.6, 640 / d));
    const inb = q => q && q[0] > XA && q[0] < XB && q[1] > YA && q[1] < YB;
    function clip(p, q) {
      const x0 = p[0], y0 = p[1], dx = q[0] - x0, dy = q[1] - y0; let t0 = 0, t1 = 1;
      const chk = (pp, qq) => { if (pp === 0) return qq >= 0; const r = qq / pp; if (pp < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } return true; };
      if (chk(-dx, x0 - XA) && chk(dx, XB - x0) && chk(-dy, y0 - YA) && chk(dy, YB - y0)) return [[x0 + t0 * dx, y0 + t0 * dy], [x0 + t1 * dx, y0 + t1 * dy]];
      return null;
    }
    function clipPoly(poly) {
      const edges = [[0, XA, 1], [0, XB, -1], [1, YA, 1], [1, YB, -1]];
      let out = poly;
      for (const [ax, v, s] of edges) {
        const inp = out; out = [];
        for (let i = 0; i < inp.length; i++) {
          const a = inp[i], b = inp[(i + 1) % inp.length];
          const ia = (a[ax] - v) * s >= 0, ib = (b[ax] - v) * s >= 0;
          if (ia) out.push(a);
          if (ia !== ib) { const k = (v - a[ax]) / (b[ax] - a[ax]); out.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); }
        }
        if (!out.length) return out;
      }
      return out;
    }
    const l3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    function seg3(a, b) {
      const pa = pr(a[0], a[1], a[2]), pb = pr(b[0], b[1], b[2]);
      if (!pa && !pb) return null;
      if (!pa || !pb) {
        const good = pa ? a : b, bad = pa ? b : a; let lo = 0, hi = 1;
        for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2, q = l3(good, bad, m); if (pr(q[0], q[1], q[2])) lo = m; else hi = m; }
        const e = l3(good, bad, lo), pe = pr(e[0], e[1], e[2]); if (!pe) return null;
        return pa ? [pa, pe] : [pe, pb];
      }
      return [pa, pb];
    }
    function L3(a, b, o = {}) {
      const s = seg3(a, b); if (!s) return;
      const c = clip(s[0], s[1]); if (!c) return;
      const d = (s[0][2] + s[1][2]) / 2;
      P.line(c[0][0], c[0][1], c[1][0], c[1][1], Object.assign({}, o, { w: wd(d, o.w ?? 1) }));
    }
    function path3(pts, o = {}) {
      let run = [];
      const flush = () => { if (run.length > 1) { const d = run.reduce((s, q) => s + q[2], 0) / run.length; P.path(run.map(q => [q[0], q[1]]), Object.assign({}, o, { w: wd(d, o.w ?? 1) })); } run = []; };
      for (const p of pts) { const q = pr(p[0], p[1], p[2]); if (inb(q)) run.push(q); else flush(); }
      flush();
    }
    const dist = (x, y, z) => Math.hypot(x - CP[0], y - CP[1], z - CP[2]);
    /* world-space box face list. returns visible faces (front-to-back irrelevant inside one solid) */
    function solid(x0, x1, y0, y1, z0, z1, o = {}) {
      const V = (x, y, z) => [x, y, z];
      const c = { a: V(x0, y0, z0), b: V(x1, y0, z0), c2: V(x1, y0, z1), d: V(x0, y0, z1), e: V(x0, y1, z0), f: V(x1, y1, z0), g: V(x1, y1, z1), h: V(x0, y1, z1) };
      const faces = [
        [[c.a, c.b, c.f, c.e], [0, 0, -1]], [[c.d, c.c2, c.g, c.h], [0, 0, 1]],
        [[c.a, c.d, c.h, c.e], [-1, 0, 0]], [[c.b, c.c2, c.g, c.f], [1, 0, 0]],
        [[c.e, c.f, c.g, c.h], [0, 1, 0]], [[c.a, c.b, c.c2, c.d], [0, -1, 0]]];
      return drawFaces(faces, o);
    }
    function drawFaces(faces, o = {}) {
      for (const [pts, nn] of faces) {
        const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length, cz = pts.reduce((s, p) => s + p[2], 0) / pts.length;
        let nx = nn[0], ny = nn[1], nz = nn[2];
        if (nn.length === 3 && nn.custom) { /* keep */ }
        if (nx * (CP[0] - cx) + ny * (CP[1] - cy) + nz * (CP[2] - cz) <= 0) continue;
        const sp = pts.map(p => pr(p[0], p[1], p[2])); if (sp.some(q => !q)) continue;
        const cp = clipPoly(sp.map(q => [q[0], q[1]]));
        if (cp.length < 3) continue;
        if (o.erase !== false) P.erase(cp);
        const d = sp.reduce((s, q) => s + q[2], 0) / sp.length;
        for (let i = 0; i < pts.length; i++) L3(pts[i], pts[(i + 1) % pts.length], { w: o.w ?? 1, rough: o.rough ?? 0.5, over: o.over ?? 0.5, passes: o.passes ?? 1, a: o.a });
        // lee shading: faces looking towards +x are in shadow, -z half
        const shade = o.shade === undefined ? (nx > 0.5 ? 1 : (nz < -0.5 ? 0.5 : 0)) : (o.shade === false ? 0 : o.shade(nn));
        if (shade > 0 && d < 1800) P.hatch(cp, { ang: o.ang ?? 72, gap: (o.gap ?? 2.6) / shade, a: 0.55, w: 0.45, piece: 14, inset: 0.6, rough: 0.35 });
        if (o.after) o.after(pts, nn, sp);
      }
    }

    /* ================================================================ world constants */
    const T1 = 0, T2 = 760, TOP = 215, MIDY = 34, HW = 30, CXo = 33, BASE = -100;
    const cabY = z => {
      if (z >= T1 && z <= T2) { const u = (z - T1) / (T2 - T1); return MIDY + (TOP - MIDY) * Math.pow(2 * u - 1, 2); }
      if (z < T1) { const u = Math.min(1, (T1 - z) / 300); return TOP - (TOP - 6) * u - 30 * 4 * u * (1 - u) * 0.0 + 0 - 26 * 4 * u * (1 - u) * 0.55; }
      const u = Math.min(1, (z - T2) / 300); return TOP - (TOP - 6) * u - 26 * 4 * u * (1 - u) * 0.55;
    };
    const ZMIN = -320, ZMAX = 1060;

    /* ================================================================ 0 — sky, far land, sea */
    const HZ = pr(0, 115, 6000)[1];
    // sea strokes (perspective spacing)
    for (let i = 0; i < 420; i++) {
      const u = Math.pow(P.r(), 1.5), y = HZ + 4 + u * (YB - HZ - 6), sc = (y - HZ) / 300;
      const x = P.r(XA, XB), l = (6 + P.r(4, 30)) * (0.5 + sc); if (x + l > XB - 6) continue;
      P.curve([[x, y], [x + l * 0.5, y - 0.6 - sc * 0.9], [x + l, y + 0.2]], { w: 0.4 + sc * 0.45, a: 0.22 + Math.min(0.4, sc * 0.35), rough: 0.5 });
    }
    // far ridges left & right on the horizon
    const ridge = (x0, x1, h, seed, w) => {
      const pts = []; for (let x = x0; x <= x1; x += 22) { const u = (x - x0) / (x1 - x0); pts.push([x, HZ - h * Math.sin(u * PI) * (0.6 + 0.4 * Math.sin(u * 9 + seed)) - P.r(0, 3)]); }
      P.curve(pts, { w: w ?? 0.9, a: 0.75, rough: 0.9 });
      const poly = P.sample(pts, false, 8).concat([[x1, HZ], [x0, HZ]]);
      P.hatch(poly, { ang: -62, gap: 3.2, a: 0.4, w: 0.45, fade: (x, y) => Math.max(0, Math.min(1, (y - (HZ - h)) / (h * 1.05))), piece: 12 });
      return poly;
    };
    ridge(52, 470, 46, 1); ridge(230, 700, 30, 3, 0.7); ridge(1000, 1552, 40, 5); ridge(1180, 1552, 64, 2, 1.1);

    /* ================================================================ fog toolkit */
    const WIN = [ // clear "windows" left in the fog for the insets (cx, cy, rx, ry)
      { id: 'B', cx: 1358, cy: 186, rx: 186, ry: 122 }, { id: 'N', cx: 566, cy: 100, rx: 150, ry: 40 },
      { id: 'C', cx: 612, cy: 872, rx: 206, ry: 78 }, { id: 'D', cx: 1183, cy: 872, rx: 352, ry: 78 }, { id: 'W', cx: 140, cy: 872, rx: 80, ry: 78 }];
    const inWin = (x, y, m = 0) => WIN.some(w => { const dx = (x - w.cx) / (w.rx + m), dy = (y - w.cy) / (w.ry + m * 0.7); return dx * dx + dy * dy < 1; });
    const ellPoly = (cx, cy, rx, ry, k = 20) => { const o = []; for (let i = 0; i < k; i++) { const a = i * TAU / k; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
    function blob(cx, cy, r, o = {}) {
      const k = o.k ?? 8, sy = o.sy ?? 0.88, pts = [], rs = Math.max(3.2, Math.min(5.6, r / 4.2));
      for (let i = 0; i < k; i++) { const a = i * TAU / k + P.r(-0.2, 0.2), rr = r * P.r(0.84, 1.08); pts.push([cx + Math.cos(a) * rr * 1.1, cy + Math.sin(a) * rr * sy]); }
      P.erase(ellPoly(cx, cy, r * 0.98, r * sy * 0.92, 14));
      const out = P.scallop(pts, { closed: true, r: rs, w: o.w ?? 1.0, a: o.a, c: o.c, bulge: 1.05 });
      // inner cauliflower curls, facing the light (upper left)
      const ni = o.inner === false ? 0 : Math.floor(r / 7.5);
      for (let j = 0; j < ni; j++) {
        const a0 = P.r(PI * 0.9, PI * 1.5), sp = P.r(1.0, 1.9), rr = r * P.r(0.38, 0.7), ccx = cx + P.r(-0.1, 0.15) * r, ccy = cy + P.r(-0.1, 0.12) * r, q = [];
        for (let u = 0; u <= 5; u++) { const a = a0 + sp * u / 5; q.push([ccx + Math.cos(a) * rr * 1.1, ccy + Math.sin(a) * rr * sy]); }
        P.scallop(q, { r: rs * 0.82, side: -1, w: 0.62, a: 0.75, rough: 0.3, c: o.c });
      }
      P.hatch(out, { ang: o.ang ?? -58, gap: o.gap ?? 2.15, a: 0.68, w: 0.48, fade: (x, y) => { const u = ((x - cx) * 0.5 + (y - cy) * 0.86) / r; return Math.max(0, Math.min(1, u * 1.15 + 0.3)); }, piece: 14, inset: 1.0, rough: 0.4 });
    }
    function puff(cx, cy, w, h, o = {}) { // a small cauliflower cluster filling a w x h ellipse
      cx = Math.max(XA + w * 0.42, Math.min(XB - w * 0.42, cx)); cy = Math.max(YA + h * 0.42, Math.min(YB - h * 0.42, cy));
      const n = Math.max(2, Math.round(w * h / 1500)), it = [];
      for (let i = 0; i < n; i++) { const a = P.r(TAU), rr = Math.sqrt(P.r()) * 0.6; it.push([cx + Math.cos(a) * w * rr * 0.5, cy + Math.sin(a) * h * rr * 0.5, Math.min(w, h) * P.r(0.28, 0.45)]); }
      it.sort((a, b) => a[1] - b[1]); it.forEach(q => blob(q[0], q[1], q[2], o));
    }
    function mass(cx, cy, rx, ry, n, rmin, rmax, o = {}) {
      const it = [];
      for (let i = 0; i < n; i++) { const a = P.r(TAU), rr = Math.sqrt(P.r()), s = lerp(rmax, rmin, Math.pow(rr, 1.3) * 0.75 + P.r() * 0.25); it.push({ x: cx + Math.cos(a) * rx * rr, y: cy + Math.sin(a) * ry * rr, r: s }); }
      it.sort((a, b) => a.y - b.y);
      for (const q of it) { if (inWin(q.x, q.y, q.r * 0.9)) continue; blob(Math.max(XA + q.r + 5, Math.min(XB - q.r - 5, q.x)), Math.max(YA + q.r * 0.9 + 3, Math.min(YB - q.r * 0.9 - 5, q.y)), q.r, o); }
    }
    function tube(path, r0, r1, o = {}) {
      const S0 = S.catmull(path, false, 4), m = S0.length, Lp = [], Rp = [], TN = [];
      for (let i = 0; i < m; i++) {
        const a = S0[Math.max(0, i - 1)], b = S0[Math.min(m - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        const rr = lerp(r0, r1, i / (m - 1)) * 1.32; TN.push([tx, ty, rr / 1.32]);
        Lp.push([S0[i][0] - ty * rr, S0[i][1] + tx * rr]); Rp.push([S0[i][0] + ty * rr, S0[i][1] - tx * rr]);
      }
      if (o.erase !== false) P.erase(clipPoly(Lp.concat(Rp.slice().reverse())));
      P.cloudTube(path, r0, r1, { shade: false, rib: o.rib ?? 2, w: o.w ?? 1.05, a: o.a, c: o.c });
      if (o.shade !== false) { // lee-side crescent hatching, chunk by chunk
        const ch = 7;
        for (let s0 = 0; s0 + 2 < m; s0 += ch) {
          const e0 = Math.min(m - 1, s0 + ch), cen = [], edge = [];
          for (let i = s0; i <= e0; i++) { const [tx, ty, rr] = TN[i]; let nx = -ty, ny = tx; if (ny < 0) { nx = -nx; ny = -ny; } cen.push([S0[i][0], S0[i][1]]); edge.push([S0[i][0] + nx * rr * 1.05, S0[i][1] + ny * rr * 1.05]); }
          P.hatch(cen.concat(edge.reverse()), { ang: o.ang ?? -62, gap: o.gap ?? 2.1, a: 0.62, w: 0.45, piece: 9, inset: 0.4, rough: 0.35 });
        }
      }
      if (o.cap) { const e = S0[m - 1]; blob(e[0], e[1], r1 * 2.2 + 3); }
      if (o.cap0) { const e = S0[0]; blob(e[0], e[1], r0 * 1.6 + 3); }
    }
    function spiral(cx, cy, r0, r1, a0, turns, dir = 1, n = 44) {
      const o = []; for (let i = 0; i <= n; i++) { const u = i / n, a = a0 + dir * turns * TAU * u, r = lerp(r0, r1, u); o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8]); } return o;
    }
    const pathOnCable = (z0, z1, dy, wob, side = CXo, k = 14) => { // screen path following the near cable, offset above it, weaving
      const out = [], n = Math.max(3, Math.round(Math.abs(z1 - z0) / k));
      for (let i = 0; i <= n; i++) { const z = lerp(z0, z1, i / n), q = pr(side, cabY(z), z); if (!q) continue; out.push([q[0] + Math.sin(i * 0.9) * wob * 0.3, q[1] + dy + Math.sin(i * 0.9 + 1) * wob]); }
      return out;
    };

    const lampDot = (x, y, r, col) => { P.dot(x, y, r, { c: col || INK, a: 0.9 }); };
    const twinkle = (x, y, r, col, n2 = 8) => {
      for (let i = 0; i < n2; i++) { const a = i * TAU / n2 + 0.2, l0 = r * 1.5, l1 = r * (i % 2 ? 2.4 : 3.6); P.line(x + Math.cos(a) * l0, y + Math.sin(a) * l0, x + Math.cos(a) * l1, y + Math.sin(a) * l1, { w: 0.55, a: 0.8, passes: 1, over: 0, rough: 0.1, c: col }); }
      P.circle(x, y, r, { w: 0.8, passes: 1, rough: 0.15, c: col });
    };


    /* ================================================================ 0b — horizon fog + top masses (behind the bridge) */
    mass(1290, 392, 270, 14, 22, 12, 30, { sy: 0.7 });
    mass(330, 394, 300, 12, 22, 12, 28, { sy: 0.7 });
    mass(220, 108, 190, 44, 30, 16, 44);
    mass(880, 122, 230, 54, 34, 16, 46);
    mass(1470, 336, 90, 18, 8, 12, 26, { sy: 0.75 });
    { // headland with lighthouse, in front of the horizon fog
      const poly = [[1170, 470], [1215, 460], [1290, 446], [1360, 434], [1430, 430], [1548, 436], [1548, 480], [1170, 480]];
      P.erase(poly); P.curve(poly.slice(0, 6).concat([[1546, 436]]), { w: 1.2, rough: 0.9 });
      P.hatch(poly, { ang: -64, gap: 3, a: 0.45, w: 0.45, fade: (x, y) => Math.max(0.15, Math.min(1, (y - 434) / 40)), piece: 12 });
      P.stipple(poly, 70, { a: 0.5, r: 0.8 });
      [[1270, 446], [1290, 444], [1312, 441], [1500, 438], [1522, 440]].forEach(([x, y]) => { P.curve([[x - 6, y + 2], [x - 5, y - 8], [x, y - 12], [x + 5, y - 8], [x + 6, y + 2]], { w: 0.7, closed: false, rough: 0.5 }); P.line(x, y + 2, x, y - 2, { w: 0.7, passes: 1 }); });
      const lx = 1462, ly = 432;
      const tw = [[lx - 8.5, ly], [lx + 8.5, ly], [lx + 5.5, ly - 56], [lx - 5.5, ly - 56]];
      P.erase(tw); P.poly(tw, { w: 1.2, rough: 0.3 });
      [[ly - 14, ly - 26], [ly - 40, ly - 52]].forEach(([a, b]) => P.hatch([[lx - 7 + (ly - a) * 0.05, a], [lx + 7 - (ly - a) * 0.05, a], [lx + 6 - (ly - b) * 0.05, b], [lx - 6 + (ly - b) * 0.05, b]], { ang: 20, gap: 1.5, a: 0.7, w: 0.5, inset: 0.4 }));
      P.hatch([[lx + 1, ly], [lx + 8.5, ly], [lx + 5.5, ly - 56], [lx + 1, ly - 56]], { ang: 84, gap: 1.6, a: 0.55, w: 0.45, inset: 0.3 });
      P.rect(lx - 9.5, ly - 60, 19, 4, { w: 1, rough: 0.2 }); for (let x = lx - 9; x < lx + 9.5; x += 3) P.line(x, ly - 60, x, ly - 64, { w: 0.5, passes: 1, over: 0 });
      P.line(lx - 9.5, ly - 64, lx + 9.5, ly - 64, { w: 0.6, passes: 1, over: 0 });
      P.rect(lx - 4.5, ly - 74, 9, 10, { w: 0.9, rough: 0.2 }); P.arc(lx, ly - 74, 5.5, 5, PI, TAU, { w: 0.9, passes: 1, rough: 0.2 }); P.line(lx, ly - 79, lx, ly - 85, { w: 0.8, passes: 1, over: 0 });
      P.rect(lx - 1.7, ly - 12, 3.4, 6, { w: 0.6, passes: 1, rough: 0.1 }); P.rect(lx - 1.4, ly - 34, 2.8, 4, { w: 0.5, passes: 1, rough: 0.1 });
      twinkle(lx, ly - 69, 3.2, null, 12);
      P.dashed(lx - 8, ly - 69, lx - 190, ly - 78, [7, 5], { w: 0.5, a: 0.55 }); P.dashed(lx - 8, ly - 68, lx - 190, ly - 58, [7, 5], { w: 0.5, a: 0.45 });
      P.dashed(lx + 8, ly - 69, lx + 84, ly - 76, [7, 5], { w: 0.5, a: 0.45 }); P.dashed(lx + 8, ly - 68, lx + 84, ly - 60, [7, 5], { w: 0.5, a: 0.4 });
      P.rect(lx + 15, ly - 11, 17, 10, { w: 0.9, rough: 0.2 }); P.pl([[lx + 13, ly - 11], [lx + 23.5, ly - 19], [lx + 34, ly - 11]], { w: 0.9 });
      P.rect(lx + 19, ly - 8, 3.5, 4, { w: 0.5, passes: 1 }); P.hatch([[lx + 23.5, ly - 11], [lx + 32, ly - 11], [lx + 32, ly - 1], [lx + 23.5, ly - 1]], { ang: 70, gap: 1.7, a: 0.5, w: 0.4 });
      P.text('POINT LAMP  -  2 FLASH / 10 S', 1330, 500, { size: 12, a: 0.65 });
    }

    /* ================================================================ 1 — towers (far leg), deck, far cables */
    const LEGSEC = [[-100, 19, 21], [-40, 15, 17], [120, 11.5, 13], [TOP, 9, 10.5]];
    function leg(cx, cz, o = {}) {
      for (let i = 0; i + 1 < LEGSEC.length; i++) {
        const [y0, w0, d0] = LEGSEC[i], [y1, w1, d1] = LEGSEC[i + 1];
        const A = (sx, sz) => [cx + sx * w0 / 2, y0, cz + sz * d0 / 2], B = (sx, sz) => [cx + sx * w1 / 2, y1, cz + sz * d1 / 2];
        const faces = [
          [[A(-1, -1), A(1, -1), B(1, -1), B(-1, -1)], [0, 0, -1]], [[A(-1, 1), A(1, 1), B(1, 1), B(-1, 1)], [0, 0, 1]],
          [[A(-1, -1), A(-1, 1), B(-1, 1), B(-1, -1)], [-1, 0, 0]], [[A(1, -1), A(1, 1), B(1, 1), B(1, -1)], [1, 0, 0]],
          [[B(-1, -1), B(1, -1), B(1, 1), B(-1, 1)], [0, 1, 0]]];
        drawFaces(faces, Object.assign({ w: 1.15, gap: 2.4 }, o));
      }
    }
    const legDetails = (cx, cz) => {
      // horizontal setback bands + rivet rows on the visible -z and +x faces
      for (let y = -30; y < TOP - 6; y += 16) {
        const [w, d] = (() => { let ww = 9, dd = 10; for (let i = 0; i + 1 < LEGSEC.length; i++) { const a = LEGSEC[i], b = LEGSEC[i + 1]; if (y >= a[0] && y <= b[0]) { const k = (y - a[0]) / (b[0] - a[0]); ww = lerp(a[1], b[1], k); dd = lerp(a[2], b[2], k); } } return [ww, dd]; })();
        L3([cx - w / 2, y, cz - d / 2], [cx + w / 2, y, cz - d / 2], { w: 0.5, a: 0.55, passes: 1, over: 0, rough: 0.25 });
        L3([cx + w / 2, y, cz - d / 2], [cx + w / 2, y, cz + d / 2], { w: 0.5, a: 0.55, passes: 1, over: 0, rough: 0.25 });
      }
    };
    /* ---- far tower legs (x = -CXo), both towers ---- */
    [T2, T1].forEach(tz => { leg(-CXo, tz); legDetails(-CXo, tz); });

    /* ---- deck ---- */
    const zs = []; for (let z = ZMIN; z <= 1500; z += 20) zs.push(z);
    { // top surface polygon
      const nearE = [], farE = [];
      zs.forEach(z => { const a = pr(HW, 0, z), b = pr(-HW, 0, z); if (a && b) { nearE.push([a[0], a[1]]); farE.push([b[0], b[1]]); } });
      const poly = clipPoly(farE.concat(nearE.slice().reverse()));
      P.erase(poly);
      // truss fascia (near side face, y -15..0)
      const fa = [], fb = [];
      zs.forEach(z => { const a = pr(HW, 0, z), b = pr(HW, -15, z); if (a && b) { fa.push([a[0], a[1]]); fb.push([b[0], b[1]]); } });
      P.erase(clipPoly(fa.concat(fb.slice().reverse())));
      // underside far girder edge visible below the near truss? (skipped: hidden)
    }
    const deckL = (x, y, z0, z1, o) => L3([x, y, z0], [x, y, z1], o);
    deckL(HW, 0, ZMIN, 1500, { w: 1.5, rough: 0.5 }); deckL(-HW, 0, ZMIN, 1500, { w: 1.1, rough: 0.5, a: 0.8 });
    deckL(HW, -15, ZMIN, 1500, { w: 1.4, rough: 0.5 }); deckL(HW, -11, ZMIN, 1500, { w: 0.6, a: 0.55, passes: 1 });
    // sidewalk kerbs, lane marks, tram rails
    [[HW - 6], [-(HW - 6)]].forEach(([x]) => deckL(x, 0, ZMIN, 1500, { w: 0.8, a: 0.75, rough: 0.4 }));
    [[HW - 6.8], [-(HW - 6.8)]].forEach(([x]) => deckL(x, 0, ZMIN, 1500, { w: 0.45, a: 0.4, passes: 1 }));
    [-3, -2.2, 2.2, 3].forEach(x => deckL(x, 0, ZMIN, 1500, { w: 0.55, a: 0.6, passes: 1, rough: 0.3 }));
    [-9.5, -15.5, 9.5, 15.5].forEach(x => { for (let z = ZMIN; z < 1500; z += 18) { const s = seg3([x, 0, z], [x, 0, z + 8]); if (s) L3([x, 0, z], [x, 0, z + 8], { w: 0.7, a: 0.7, passes: 1, over: 0, rough: 0.2 }); } });
    // rail sleepers for tram (short ticks)
    for (let z = ZMIN; z < 1500; z += 7) L3([-3.4, 0, z], [3.4, 0, z], { w: 0.35, a: 0.35, passes: 1, over: 0, rough: 0.2 });
    // truss bracing on the near fascia, panels every 10
    for (let z = ZMIN; z < 1500; z += 10) {
      const A = [HW, 0, z], B = [HW, -15, z + 10], C = [HW, -15, z], D = [HW, 0, z + 10];
      L3(A, B, { w: 0.55, a: 0.7, passes: 1, over: 0, rough: 0.2 });
      if (z % 20 === 0) L3(C, D, { w: 0.55, a: 0.7, passes: 1, over: 0, rough: 0.2 }); else L3(A, C, { w: 0.5, a: 0.6, passes: 1, over: 0, rough: 0.2 });
    }
    // fascia lee shading
    { const fa = [], fb = [];
      for (let z = ZMIN; z <= 1500; z += 20) { const a = pr(HW, -11, z), b = pr(HW, -15, z); if (a && b) { fa.push([a[0], a[1]]); fb.push([b[0], b[1]]); } }
      P.hatch(clipPoly(fa.concat(fb.slice().reverse())), { ang: 80, gap: 1.8, a: 0.5, w: 0.4, piece: 10, inset: 0.4 });
    }
    // railings: posts + top rail, both edges
    [HW, -HW].forEach(x => { L3([x, 3.2, ZMIN], [x, 3.2, 1500], { w: 0.6, a: 0.7, rough: 0.3 }); L3([x, 1.6, ZMIN], [x, 1.6, 1500], { w: 0.35, a: 0.4, passes: 1 }); for (let z = ZMIN; z < 1500; z += 12) L3([x, 0, z], [x, 3.2, z], { w: 0.45, a: 0.6, passes: 1, over: 0, rough: 0.15 }); });

    /* ---- far cables + their suspenders ---- */
    function cable(x, o = {}) {
      const up = [], dn = [];
      for (let z = ZMIN; z <= ZMAX; z += (Math.abs(z - (T1 + T2) / 2) < 250 ? 8 : 6)) { up.push([x, cabY(z) + 1.6, z]); dn.push([x, cabY(z) - 1.6, z]); }
      path3(up, { w: o.w ?? 1.5, rough: 0.5, passes: 1 }); path3(dn, { w: (o.w ?? 1.5) * 0.85, rough: 0.5, passes: 1 });
      // strand lee ticks
      for (let z = ZMIN; z <= ZMAX; z += 5) { const y = cabY(z); L3([x, y - 1.6, z], [x, y - 2.7, z + 1.4], { w: 0.4, a: 0.45, passes: 1, over: 0, rough: 0.1 }); }
    }
    function suspenders(x, o = {}) {
      const step = o.step ?? 15;
      for (let z = ZMIN + 15; z <= ZMAX; z += step) {
        if (Math.abs(z - T1) < 9 || Math.abs(z - T2) < 9) continue;
        const cy = cabY(z), xe = x > 0 ? HW + 0.6 : -HW - 0.6;
        L3([x, cy - 1.6, z], [xe, 3.2, z], { w: 0.5, a: 0.8, passes: 1, over: 0, rough: 0.15 });
        L3([x + (x > 0 ? -0.8 : 0.8), cy - 1.4, z + 0.9], [xe + (x > 0 ? -0.5 : 0.5), 3.2, z + 0.9], { w: 0.35, a: 0.5, passes: 1, over: 0, rough: 0.15 });
        L3([x, cy - 0.8, z - 1.4], [x, cy - 3.2, z + 1.4], { w: 1.2, a: 0.85, passes: 1, over: 0, rough: 0.1 });
        L3([xe - 0.8, 3.2, z], [xe + 0.8, 3.2, z], { w: 1.2, a: 0.85, passes: 1, over: 0, rough: 0.1 });
      }
    }
    suspenders(-CXo); cable(-CXo);

    /* ---- near tower legs and portal struts ---- */
    function portal(tz, dark) {
      const yl = [64, 112, 158, 200];
      yl.forEach((y, i) => {
        const h = i === 3 ? 10 : 7;
        solid(-CXo + 4.5, CXo - 4.5, y - h / 2, y + h / 2, tz - 4, tz + 4, { w: 1, ang: 80, gap: 2.2, shade: nn => (nn[0] > 0.5 ? 1 : nn[2] < -0.5 ? 0.6 : 0) });
      });
      // X bracing in the visible (-z) plane
      for (let i = 0; i + 1 < yl.length; i++) {
        const ya = yl[i] + (i === 3 ? 5 : 3.5), yb = yl[i + 1] - (i + 1 === 3 ? 5 : 3.5), zf = tz - 4.2;
        const xa = -CXo + 4.5, xb = CXo - 4.5;
        L3([xa, ya, zf], [xb, yb, zf], { w: 0.6, a: 0.75, passes: 1, rough: 0.3 });
        L3([xb, ya, zf], [xa, yb, zf], { w: 0.6, a: 0.75, passes: 1, rough: 0.3 });
        L3([0, ya, zf], [0, yb, zf], { w: 0.4, a: 0.45, passes: 1, rough: 0.2 });
      }
    }
    // T2 portal (far), then T1 portal + near legs (later so they occlude)
    const nearLegs = [T2, T1];
    portal(T2);
    leg(CXo, T2); legDetails(CXo, T2);

    /* ================================================================ small helpers: people, lamps, birds */
    const sc0 = (x, y, z) => { const q = pr(x, y, z); return q; };
    const H_ = 1000;
    function person(x, y, h, o = {}) {
      const lw = Math.max(0.6, h * 0.06), c = o.c, lean = o.lean ?? 0.08, O = { w: lw, passes: 1, over: 0, rough: 0.12, c };
      const hip = [x, y - h * 0.46], sh = [x + lean * h, y - h * 0.8], hd = [sh[0] + lean * h * 0.35, y - h * 0.93];
      P.line(hip[0], hip[1], x - h * 0.14, y, O); P.line(hip[0], hip[1], x + h * 0.14, y, O);
      P.line(hip[0], hip[1], sh[0], sh[1], Object.assign({}, O, { w: lw * 1.9 }));
      P.circle(hd[0], hd[1], h * 0.085, { w: lw * 0.9, passes: 1, rough: 0.1, c });
      P.arc(hd[0], hd[1], h * 0.11, h * 0.1, PI * 1.02, TAU * 0.995, { w: lw * 1.5, passes: 1, rough: 0.1, c });
      P.line(hd[0] - h * 0.13, hd[1] - h * 0.005, hd[0] + h * 0.13, hd[1] - h * 0.005, Object.assign({}, O, { w: lw * 1.1 }));
      const hands = o.hands || [[0.2, -0.05], [-0.15, 0.1]];
      hands.forEach(([dx, dy]) => P.line(sh[0], sh[1] + h * 0.02, sh[0] + dx * h, sh[1] + dy * h, O));
      return { hip, sh, hd, hands: hands.map(([dx, dy]) => [sh[0] + dx * h, sh[1] + dy * h]) };
    }
    function roller(hx, hy, h, ang, o = {}) { // paint roller held at hand (hx,hy) pointing along ang
      const l = h * 0.34, ex = hx + Math.cos(ang) * l, ey = hy + Math.sin(ang) * l, nx = -Math.sin(ang), ny = Math.cos(ang);
      P.line(hx, hy, ex, ey, { w: Math.max(0.5, h * 0.04), passes: 1, over: 0, rough: 0.1 });
      const bw = h * 0.16, bh = h * 0.05;
      P.line(ex + nx * bw, ey + ny * bw, ex - nx * bw, ey - ny * bw, { w: Math.max(1.3, h * 0.11), passes: 1, over: 0, rough: 0.1, a: 0.95 });
    }
    function cradle(x, y, h, ax, ay, o = {}) { // plank under feet at (x,y), ropes up to (ax,ay)
      const lw = Math.max(0.6, h * 0.05), hw = h * 0.45;
      P.line(x - hw, y + 0.5, x + hw, y + 0.5, { w: lw * 1.9, passes: 1, over: 0, rough: 0.1 });
      P.line(x - hw, y + 0.5, ax - (o.spread ?? 1.5), ay, { w: lw * 0.75, a: 0.75, passes: 1, over: 0, rough: 0.1 });
      P.line(x + hw, y + 0.5, ax + (o.spread ?? 1.5), ay, { w: lw * 0.75, a: 0.75, passes: 1, over: 0, rough: 0.1 });
      if (o.bucket !== false) { const bx = x + hw * 0.75, by = y + 0.5; P.pl([[bx - h * 0.09, by - h * 0.13], [bx + h * 0.09, by - h * 0.13], [bx + h * 0.07, by], [bx - h * 0.07, by]], { w: lw * 0.8, passes: 1, closed: true, over: 0, rough: 0.1 }); P.arc(bx, by - h * 0.13, h * 0.09, h * 0.09, PI, TAU, { w: lw * 0.6, passes: 1, rough: 0.1 }); }
    }
    function gull(x, y, s = 1, o = {}) {
      P.curve([[x - 9 * s, y - 2 * s], [x - 4.5 * s, y - 7 * s], [x, y]], { w: 0.9 * Math.min(1.4, s + 0.2), rough: 0.15, a: 0.9 });
      P.curve([[x, y], [x + 4.5 * s, y - 7 * s], [x + 9 * s, y - 1 * s]], { w: 0.9 * Math.min(1.4, s + 0.2), rough: 0.15, a: 0.9 });
    }

    /* ================================================================ traffic, lamps, catwalk, lights */
    const VD = { car: [9, 4, 3.6], van: [11, 4.6, 5], bus: [18, 5, 6.6], truck: [20, 5, 7.6], tram: [36, 5.4, 7.8] };
    const vehs = [];
    { // deterministic traffic
      const lanes = [[6.5, -1], [12.5, -1], [19.7, -1], [-6.5, 1], [-12.5, 1], [-19.7, 1]];
      lanes.forEach(([x, dir], li) => {
        let z = -120 + P.r(0, 60);
        while (z < 1430) {
          const r = P.r(); const kind = r < 0.6 ? 'car' : r < 0.74 ? 'van' : r < 0.88 ? 'bus' : 'truck';
          vehs.push({ kind, x: x + P.r(-0.6, 0.6), z, dir });
          z += VD[kind][0] + P.r(35, 120) * (Math.abs(x) < 8 ? 1.2 : 1);
        }
      });
      [[90, 1], [340, -1], [560, 1], [980, -1], [1230, 1]].forEach(([z, d]) => vehs.push({ kind: 'tram', x: 0, z, dir: d }));
    }
    function wheel3(x, z, r) { const pts = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU; pts.push([x, 0.7 + r + r * Math.sin(a), z + r * Math.cos(a)]); } path3(pts, { w: 0.7, passes: 1, rough: 0.1 }); }
    function drawVeh(v) {
      const [len, wid, ht] = VD[v.kind], x = v.x, z = v.z, x0 = x - wid / 2, x1 = x + wid / 2, z1 = z + len;
      const d = dist(x, 3, z + len / 2); if (z < -140) return;
      const bodyH = v.kind === 'car' ? 2.1 : ht * 0.86;
      const sh = d < 950 ? (nn => (nn[0] > 0.5 ? 1 : nn[2] < -0.5 ? 0.55 : 0)) : false;
      solid(x0, x1, 0.7, bodyH + 0.7, z, z1, { w: 0.85, gap: 2.0, shade: sh, ang: 75 });
      if (v.kind === 'car') solid(x0 + 0.45, x1 - 0.45, bodyH + 0.7, ht, z + len * 0.2, z + len * 0.78, { w: 0.75, gap: 2, shade: sh });
      if (v.kind === 'van') solid(x0 + 0.2, x1 - 0.2, bodyH + 0.7, ht + 0.2, z + len * 0.05, z + len * 0.55, { w: 0.75, gap: 2, shade: sh });
      const nw = v.kind === 'tram' ? 11 : v.kind === 'bus' ? 5 : 0;
      if (nw && d < 1900) {
        const yb = ht * 0.5 + 0.7, yt = ht * 0.82 + 0.7;
        L3([x1, yb, z + 1.5], [x1, yb, z1 - 1.5], { w: 0.5, a: 0.8, passes: 1, over: 0 }); L3([x1, yt, z + 1.5], [x1, yt, z1 - 1.5], { w: 0.5, a: 0.8, passes: 1, over: 0 });
        for (let k = 0; k <= nw; k++) { const zz = z + 1.5 + (len - 3) * k / nw; L3([x1, yb, zz], [x1, yt, zz], { w: 0.5, a: 0.8, passes: 1, over: 0, rough: 0.05 }); }
      }
      if (d < 1600) { wheel3(x1, z + len * 0.2, 1.3); wheel3(x1, z + len * 0.78, 1.3); }
      // lamps on the -z face
      const lp = pr(x, 2, z - 0.1);
      if (lp) {
        const s = 1000 / lp[2];
        if (v.dir < 0) { [-1, 1].forEach(k => { const q = pr(x + k * wid * 0.33, 2.2, z - 0.1); if (q && inb(q)) { P.dot(q[0], q[1], Math.max(0.8, s * 0.42), { a: 0.9 }); if (d < 1100) twinkle(q[0], q[1], Math.max(1, s * 0.5), null, 6); } }); }
        else { [-1, 1].forEach(k => { const q = pr(x + k * wid * 0.33, 2.2, z - 0.1); if (q && inb(q)) P.dot(q[0], q[1], Math.max(0.8, s * 0.42), { c: RED, a: 0.95 }); }); }
      }
      if (v.kind === 'tram') { // pantograph + a bit of overhead wire
        L3([x, ht + 0.7, z + len * 0.6], [x, ht + 3.4, z + len * 0.6], { w: 0.8, passes: 1, over: 0 }); L3([x - 1.6, ht + 3.4, z + len * 0.6], [x + 1.6, ht + 3.4, z + len * 0.6], { w: 0.8, passes: 1, over: 0 });
      }
    }
    vehs.sort((a, b) => dist(b.x, 3, b.z + 6) - dist(a.x, 3, a.z + 6));

    function bike(x, z) {
      wheel3(x, z, 1.05); wheel3(x, z + 3.2, 1.05);
      L3([x, 1.75, z + 1.1], [x, 2.6, z + 1.6], { w: 0.6, passes: 1, over: 0 }); L3([x, 2.6, z + 1.6], [x, 1.75, z + 3.2], { w: 0.6, passes: 1, over: 0 }); L3([x, 1.75, z + 1.1], [x, 1.75, z + 3.2], { w: 0.6, passes: 1, over: 0 });
      L3([x, 3.0, z + 1.6], [x, 5.6, z + 2.2], { w: 1.1, passes: 1, over: 0 }); L3([x, 5.6, z + 2.2], [x, 3.2, z + 3.2], { w: 0.6, passes: 1, over: 0 });
      const q = pr(x, 6.6, z + 2.4); if (q) P.circle(q[0], q[1], Math.max(0.9, 1000 / q[2] * 0.55), { w: 0.7, passes: 1, rough: 0.1 });
    }

    /* ================================================================ 2 — deck furniture drawn onto the deck */
    vehs.forEach(drawVeh);
    for (let z = -100; z < 1250; z += 52) { if (P.r() < 0.55) bike(HW - 2.6 + P.r(-0.5, 0.5), z + P.r(0, 20)); }
    // lamps on both deck edges + halos
    function lamp(x, z) {
      const s = x > 0 ? -1 : 1, top = 17;
      L3([x, 3, z], [x, top, z], { w: 0.9, passes: 1, over: 0, rough: 0.1 });
      L3([x, top, z], [x + s * 7, top - 0.6, z], { w: 0.7, passes: 1, over: 0, rough: 0.1 });
      const q = pr(x + s * 7, top - 1.4, z); if (!q || !inb(q)) return; const r = Math.max(0.8, 1000 / q[2] * 0.55);
      P.dot(q[0], q[1], r, { a: 0.95 });
      if (q[2] < 1500) twinkle(q[0], q[1], r * 1.3, null, 8); else { P.line(q[0] - r * 3, q[1] + r, q[0] + r * 3, q[1] + r, { w: 0.4, a: 0.5, passes: 1, over: 0 }); }
    }
    for (let z = -130; z < 1450; z += 62) { lamp(HW - 0.4, z + 12); lamp(-HW + 0.4, z + 42); }

    /* ---- near cable, near suspenders (T2 span first, then T1 elements) ---- */
    suspenders(CXo); cable(CXo);
    portal(T1);
    tube([[88, 470], [156, 440], [230, 466], [292, 502], [352, 508]], 10, 8, { cap0: true });
    leg(CXo, T1); legDetails(CXo, T1);
    { const up = [], dn = []; for (let z = -60; z <= 40; z += 4) { up.push([CXo, cabY(z) + 1.6, z]); dn.push([CXo, cabY(z) - 1.6, z]); }
      path3(up, { w: 1.5, passes: 1 }); path3(dn, { w: 1.3, passes: 1 }); }
    // service catwalk along the near cable + inspector's route (red dashes)
    function catwalkZ(z) { return [CXo + 5.5, cabY(z) - 10.5, z]; }
    { const fl = [], rl = [];
      for (let z = T1 + 6; z <= T2 - 6; z += 8) { const p = catwalkZ(z); fl.push(p); rl.push([p[0], p[1] + 3.8, p[2]]); }
      path3(fl, { w: 1.0, rough: 0.5, passes: 1 }); path3(rl, { w: 0.6, rough: 0.4, a: 0.8, passes: 1 });
      for (let z = T1 + 6; z <= T2 - 6; z += 6) { const p = catwalkZ(z); L3([p[0] - 2, p[1] - 0.2, z], [p[0] + 2, p[1] - 0.2, z], { w: 0.35, a: 0.5, passes: 1, over: 0 }); }
      for (let z = T1 + 6; z <= T2 - 6; z += 22) { const p = catwalkZ(z); L3(p, [p[0], p[1] + 3.8, z], { w: 0.5, a: 0.8, passes: 1, over: 0 }); L3([CXo + 1.3, cabY(z) - 1.6, z], [p[0], p[1] + 3.8, z], { w: 0.4, a: 0.6, passes: 1, over: 0 }); }
      // route
      const rt = []; for (let z = T1 + 20; z <= T2 - 20; z += 10) { const p = catwalkZ(z); rt.push([p[0], p[1] + 1.2, p[2]]); }
      for (let i = 0; i + 1 < rt.length; i += 2) L3(rt[i], rt[i + 1], { w: 0.85, c: RED, a: 0.95, passes: 1, over: 0, rough: 0.1 });
    }
    // aircraft-warning / navigation lights on tower tops (red) and channel lights (green)
    [[T1, CXo], [T1, -CXo], [T2, CXo], [T2, -CXo]].forEach(([tz, tx]) => {
      L3([tx, TOP, tz], [tx, TOP + 12, tz], { w: 1.0, passes: 1, over: 0 });
      const q = pr(tx, TOP + 14, tz); if (q) twinkle(q[0], q[1], Math.max(1.4, 1000 / q[2] * 0.9), RED, 10);
    });
    { const q = pr(CXo, 62, T1 - 0), q2 = pr(-CXo, 64, T2); }
    /* ================================================================ 3 — the painters who never finish */
    { // freshly painted cable (heavier line + hatch) between the north tower and the lead cradle
      const zP = 300;
      const up = [], dn = [];
      for (let z = T1 + 6; z <= zP; z += 5) { up.push([CXo, cabY(z) + 2.7, z]); dn.push([CXo, cabY(z) - 2.7, z]); }
      path3(up, { w: 1.3, passes: 1 }); path3(dn, { w: 1.6, passes: 1 });
      for (let z = T1 + 6; z <= zP; z += 2.8) L3([CXo, cabY(z) - 2.6, z], [CXo, cabY(z) + 2.5, z + 2.0], { w: 0.45, a: 0.7, passes: 1, over: 0, rough: 0.1 });
    }
    const at = (z, dy = 0) => pr(CXo, cabY(z) + dy, z);
    const PH = 12.5;
    function crew(z, o = {}) { // painter on a cradle hung from the near cable by two ropes
      const q = at(z); if (!q) return; const h = (o.k ?? PH) * 1000 / q[2];
      const qa = at(z - 5), qb = at(z + 5), vx = (qb[0] - qa[0]) / 10, hw = h * 0.5;
      const fx = q[0] - h * 0.12, fy = q[1] + h * 0.72;
      const zl = z + (fx - hw - q[0]) / vx, zr = z + (fx + hw - q[0]) / vx, ql = at(zl), qr = at(zr);
      P.line(fx - hw, fy + 0.5, fx + hw, fy + 0.5, { w: Math.max(1, h * 0.09), passes: 1, over: 0, rough: 0.1 });
      P.line(fx - hw, fy + 0.5, ql[0], ql[1] + 2, { w: Math.max(0.55, h * 0.04), a: 0.8, passes: 1, over: 0, rough: 0.1 });
      P.line(fx + hw, fy + 0.5, qr[0], qr[1] + 2, { w: Math.max(0.55, h * 0.04), a: 0.8, passes: 1, over: 0, rough: 0.1 });
      const bx = fx + hw * 0.7; P.pl([[bx - h * 0.09, fy - h * 0.13], [bx + h * 0.09, fy - h * 0.13], [bx + h * 0.07, fy], [bx - h * 0.07, fy]], { w: Math.max(0.6, h * 0.04), passes: 1, closed: true, over: 0, rough: 0.1 });
      const pp = person(fx - h * 0.1, fy - 0.5, h, { lean: 0.14, hands: [[0.3, -0.34], [0.14, -0.26]] });
      roller(pp.hands[0][0], pp.hands[0][1], h, -PI * 0.46);
      return { q, h, fx, fy };
    }
    const crews = [40, 98, 156, 214, 278, 470, 610].map((z, i) => crew(z, { k: i < 5 ? PH : 10 }));
    { const c1 = crews[4]; if (c1) P.dots([[c1.fx + 6, c1.fy + 9, 1.0], [c1.fx + 6.5, c1.fy + 17, 0.8], [c1.fx - 5, c1.fy + 13, 0.9]], null, 0.85); }
    // north tower: two painters dangling on the +x face, riggers on the caps
    { const q = pr(CXo + 6.2, 135, T1 - 0.5), qa = pr(CXo + 5.5, TOP - 2, T1 - 3), qb = pr(CXo + 5.5, TOP - 2, T1 + 3);
      if (q && qa) { const h = 13 * 1000 / q[2]; const fx = q[0] + h * 0.75, fy = q[1] + h * 0.55;
        cradle(fx, fy, h, (qa[0] + qb[0]) / 2 + h * 0.3, qa[1] + 3, { spread: 0.45 * h });
        const pp = person(fx, fy - 0.5, h, { lean: -0.1, hands: [[-0.3, -0.2], [-0.12, -0.3]] }); roller(pp.hands[0][0], pp.hands[0][1], h, PI * 1.15);
        const q2 = pr(CXo + 6.2, 62, T1 - 5);
        if (q2) { const h2 = h * 1.05, f2x = q2[0] + h2 * 0.55, f2y = q2[1]; cradle(f2x, f2y, h2, f2x - 1, q2[1] - h2 * 3.6, { spread: h2 * 0.4 }); const p2 = person(f2x, f2y - 0.5, h2, { lean: 0.1, hands: [[-0.3, -0.05], [0.1, 0.1]] }); roller(p2.hands[0][0], p2.hands[0][1], h2, PI * 1.02); }
      }
      const cap = pr(CXo, TOP + 0.8, T1); if (cap) { const h = 13 * 1000 / cap[2]; person(cap[0] + h * 0.35, cap[1], h, { lean: 0.05, hands: [[-0.25, -0.35], [0.28, -0.1]] }); }
      const cb = pr(-CXo, TOP + 0.8, T1); if (cb) { const h = 13 * 1000 / cb[2]; person(cb[0] - h * 0.25, cb[1], h * 0.95, { lean: -0.06, hands: [[0.25, -0.3], [-0.2, -0.05]] }); }
      const t2 = pr(CXo + 5.8, 150, T2 - 0.5), t2a = pr(CXo + 5, TOP - 2, T2);
      if (t2 && t2a) { const h = 13 * 1000 / t2[2]; const fx = t2[0] + h * 0.7, fy = t2[1] + h * 0.5; cradle(fx, fy, h, t2a[0] + h * 0.3, t2a[1] + 2, { spread: 0.4 * h }); const pp = person(fx, fy - 0.4, h, { lean: -0.1, hands: [[-0.3, -0.18], [-0.12, -0.3]] }); roller(pp.hands[0][0], pp.hands[0][1], h, PI * 1.15); }
      const c2 = pr(CXo, TOP + 0.8, T2); if (c2) { const h = 13 * 1000 / c2[2]; person(c2[0] + h * 0.35, c2[1], h, { lean: 0.05, hands: [[-0.25, -0.35], [0.28, -0.1]] }); }
    }
    // pennants streaming in the wind from the tower finials (the fog moves the other way)
    [[T1, CXo, 1], [T1, -CXo, 0.9], [T2, CXo, 1], [T2, -CXo, 0.9]].forEach(([tz, tx, k]) => {
      const q = pr(tx, TOP + 12, tz), q2 = pr(tx, TOP + 9, tz); if (!q) return; const s = 1000 / q[2] * k, L = 12 * s, Hh = 4.2 * s;
      const top = [], bot = []; for (let u = 0; u <= 6; u++) { const t2 = u / 6, x = q[0] + L * t2, y = q[1] + Math.sin(t2 * 5.2 + 0.4) * Hh * 0.55 + t2 * 2.5; top.push([x, y - Hh * (1 - t2 * 0.85) * 0.5]); bot.push([x, y + Hh * (1 - t2 * 0.85) * 0.5]); }
      const poly = top.concat(bot.reverse()); P.curve(top, { w: 0.8, rough: 0.2 }); P.curve(poly.slice(7), { w: 0.8, rough: 0.2 }); P.line(top[6][0], top[6][1], poly[7][0], poly[7][1], { w: 0.7, passes: 1, over: 0 });
      P.hatch(poly, { ang: 60, gap: 1.5, a: 0.6, w: 0.4, inset: 0.2, piece: 5 });
    });
    // leg detail: rivet rows along both edges of the near north-tower leg
    { const dts = [];
      for (let y = -20; y < TOP - 8; y += 6) { let ww = 9; for (let i = 0; i + 1 < LEGSEC.length; i++) { const a = LEGSEC[i], b = LEGSEC[i + 1]; if (y >= a[0] && y <= b[0]) { const k = (y - a[0]) / (b[0] - a[0]); ww = lerp(a[1], b[1], k); } }
        [[CXo - ww / 2 + 0.7], [CXo + ww / 2 - 0.7]].forEach(([x]) => { const q = pr(x, y, T1 - 5.2); if (q) dts.push([q[0], q[1], 0.75]); }); }
      P.dots(dts, null, 0.75); }
    // inspectors on the catwalk with lanterns
    [[336, 1.0], [640, 0.8]].forEach(([z, k]) => {
      const p = catwalkZ(z), q = pr(p[0], p[1] + 0.4, z); if (!q) return; const h = 12.5 * 1000 / q[2];
      person(q[0], q[1], h, { lean: 0.05, hands: [[0.34, 0.1], [-0.18, 0.0]] });
      const lx = q[0] + h * 0.34, ly = q[1] - h * 0.8 + h * 0.1;
      P.circle(lx, ly + h * 0.06, h * 0.07, { w: 0.6, passes: 1, rough: 0.1 }); twinkle(lx, ly + h * 0.06, Math.max(1.2, h * 0.09), null, 8);
    });
    // deck crew: two riggers with a cone on the near sidewalk
    { const q = pr(HW - 3, 0, 60), q2 = pr(HW - 3, 0, 68); if (q) { const h = 9 * 1000 / q[2]; person(q[0], q[1], h, { lean: 0.06 }); if (q2) person(q2[0], q2[1], h * 0.95, { lean: -0.06, hands: [[-0.3, 0.05], [0.2, 0.1]] }); } }

    /* ================================================================ 4 — fog in front: bank, knot, ropes */
    const kq = pr(CXo, cabY(385), 385), KX = kq[0] - 20, KY = kq[1] + 26;
    mass(1060, 592, 250, 22, 30, 12, 30, { sy: 0.72 });
    mass(1420, 570, 150, 18, 14, 12, 28, { sy: 0.72 });
    tube(pathOnCable(372, 26, -26, 9), 10, 7, { cap: true });
    tube(pathOnCable(396, 738, -23, 8), 10, 7, {});
    tube([[KX + 10, KY - 40], [KX - 26, KY - 120], [KX + 26, KY - 200], [KX + 6, KY - 280], [KX + 70, KY - 350]], 11, 7, { cap: true });
    tube([[KX + 50, KY + 30], [KX + 130, KY + 100], [KX + 250, KY + 140]].concat(spiral(KX + 300, KY + 110, 44, 8, Math.PI * 0.55, 1.6, -1, 40)), 10, 6, { cap: true });
    tube([[KX - 50, KY + 40], [KX - 130, KY + 100], [KX - 200, KY + 130]].concat(spiral(KX - 250, KY + 100, 42, 8, Math.PI * 0.45, 1.6, 1, 40)), 10, 6, { cap: true });
    // rope A carries on over the north tower head and away to the left mass, wrapping the cap
    tube([[412, 190], [372, 178], [326, 190], [270, 216], [190, 240], [118, 262], [88, 302]], 10, 8, { cap: true });
    // ring of fog round the south tower head, with a tail towards the polar window
    tube(spiral(1055, 322, 28, 20, PI * 0.2, 1.25, 1, 34).concat([[1092, 294], [1140, 274], [1178, 262]]), 7, 6, { cap: true });
    // a rope garland under the note window joining the two sky masses
    tube([[430, 150], [486, 168], [566, 176], [650, 168], [712, 146]], 9, 8, { cap: true });
    mass(150, 592, 100, 34, 16, 13, 28, { sy: 0.75 });
    mass(1232, 320, 60, 16, 7, 12, 24, { sy: 0.75 });
    // the knot itself (front)
    [[KX - 20, KY - 20, 32], [KX + 34, KY - 12, 30], [KX + 4, KY - 44, 26], [KX - 44, KY + 14, 24], [KX + 60, KY + 16, 24], [KX - 8, KY + 20, 34], [KX + 26, KY + 30, 26], [KX - 60, KY - 8, 20]].forEach(([x, y, r]) => blob(x, y, r));
    // weave, second piece (emerges to the right of the north tower's near leg)
    tube([[394, 512], [440, 472], [500, 458], [548, 490], [530, 532], [486, 524]], 9, 6, { cap: true });

    /* ================================================================ 5 — sea life: ferry, tug, buoys, gulls, banks */
    const RR = (x, y, s, d, x0, y0, x1, y1, o = {}) => { const a = x + x0 * s * d, b = x + x1 * s * d; P.rect(Math.min(a, b), y + y0 * s, Math.abs(b - a), (y1 - y0) * s, Object.assign({ w: 0.95, rough: 0.25, passes: 1, over: 0.3 }, o)); };
    function winRow(x, y, s, d, x0, x1, yy, step, r = 0.85) { const dts = []; for (let lx = x0; lx <= x1; lx += step) dts.push([x + lx * s * d, y + yy * s, r]); P.dots(dts, null, 0.85); }
    function ferry(x, y, s, d) {
      const X = a => x + a * s * d, Y = b => y + b * s;
      P.erase([[X(-76), Y(-56)], [X(76), Y(-56)], [X(76), Y(5)], [X(-62), Y(5)], [X(-76), Y(-10)]]);
      const hull = [[-72, -10], [70, -10], [64, 3], [-58, 3]].map(([a, b]) => [X(a), Y(b)]);
      P.poly(hull, { w: 1.3, rough: 0.3, passes: 1 });
      P.hatch(hull, { ang: -30, gap: 1.8, a: 0.6, w: 0.45, fade: (px, py) => (py > Y(-5) ? 1 : 0.3), piece: 8 });
      RR(x, y, s, d, -58, -19, 56, -10); winRow(x, y, s, d, -52, 50, -14.5, 5.4);
      RR(x, y, s, d, -44, -28, 40, -19); winRow(x, y, s, d, -38, 34, -23.5, 5.4);
      RR(x, y, s, d, -14, -36, 14, -28); winRow(x, y, s, d, -10, 10, -32, 4);
      [[18, 27], [31, 40]].forEach(([a, b]) => { RR(x, y, s, d, a, -47, b, -28); P.hatch([[X(a), Y(-47)], [X(b), Y(-47)], [X(b), Y(-42)], [X(a), Y(-42)]], { ang: 20, gap: 1.4, a: 0.7, w: 0.45, inset: 0.2 }); });
      P.line(X(0), Y(-36), X(0), Y(-58), { w: 0.8, passes: 1, over: 0 }); P.line(X(-6), Y(-52), X(6), Y(-52), { w: 0.7, passes: 1, over: 0 });
      P.line(X(0), Y(-58), X(-52), Y(-30), { w: 0.4, a: 0.5, passes: 1, over: 0 }); P.line(X(0), Y(-58), X(60), Y(-26), { w: 0.4, a: 0.5, passes: 1, over: 0 });
      twinkle(X(0), Y(-60), 1.6 * s, null, 6); twinkle(X(-70), Y(-12), 1.3 * s, GRN, 6); twinkle(X(66), Y(-12), 1.3 * s, RED, 6);
      for (let k = 0; k < 4; k++) P.arc(X(-30 + k * 12), Y(-28), 4.5 * s, 2.2 * s, PI, TAU, { w: 0.6, passes: 1, rough: 0.1 });
      // wake and bow wave
      const sd = d;
      for (let k = 0; k < 4; k++) { P.curve([[X(66 + k * 3), Y(2)], [X(100 + k * 22), Y(4 + k * 3.2)], [X(150 + k * 30), Y(5 + k * 5.6)]], { w: 0.7 - k * 0.08, a: 0.7 - k * 0.12, rough: 0.5 }); P.curve([[X(66 + k * 3), Y(2.5)], [X(100 + k * 20), Y(1 - k * 0.3)], [X(150 + k * 30), Y(-1 - k * 0.9)]], { w: 0.5, a: 0.35, rough: 0.5 }); }
      P.curve([[X(-72), Y(-1)], [X(-84), Y(2)], [X(-98), Y(5)]], { w: 0.7, a: 0.7, rough: 0.4 }); P.curve([[X(-62), Y(3)], [X(-78), Y(6)], [X(-92), Y(9)]], { w: 0.6, a: 0.6, rough: 0.4 });
    }
    function tug(x, y, s, d) {
      const X = a => x + a * s * d, Y = b => y + b * s;
      P.erase([[X(-40), Y(-52)], [X(40), Y(-52)], [X(40), Y(5)], [X(-32), Y(5)], [X(-42), Y(-6)]]);
      const hull = [[-40, -8], [38, -8], [32, 3], [-30, 3]].map(([a, b]) => [X(a), Y(b)]);
      P.poly(hull, { w: 1.3, rough: 0.3, passes: 1 }); P.hatch(hull, { ang: -30, gap: 1.6, a: 0.65, w: 0.45, piece: 8 });
      RR(x, y, s, d, -10, -22, 24, -8); winRow(x, y, s, d, -6, 20, -15, 4.5); RR(x, y, s, d, -4, -32, 14, -22); winRow(x, y, s, d, 0, 10, -27, 3.6);
      RR(x, y, s, d, 24, -40, 32, -22); P.hatch([[X(24), Y(-40)], [X(32), Y(-40)], [X(32), Y(-34)], [X(24), Y(-34)]], { ang: 20, gap: 1.3, a: 0.75, w: 0.45, inset: 0.2 });
      for (let k = 0; k < 3; k++) P.circle(X(-36 + k * 6), Y(-5), 1.8 * s, { w: 0.7, passes: 1, rough: 0.1 });
      twinkle(X(-2), Y(-34), 1.4 * s, RED, 6);
      for (let k = 0; k < 3; k++) P.curve([[X(34 + k * 3), Y(2)], [X(60 + k * 14), Y(4 + k * 2.5)], [X(96 + k * 22), Y(5 + k * 5)]], { w: 0.65 - k * 0.1, a: 0.65 - k * 0.15, rough: 0.5 });
      P.curve([[X(-40), Y(-1)], [X(-52), Y(3)], [X(-64), Y(6)]], { w: 0.7, a: 0.7, rough: 0.4 });
    }
    function buoy(x, y, col) {
      P.erase(ellPoly(x, y - 6, 8, 12, 10));
      P.pl([[x - 5, y], [x + 5, y], [x + 3, y - 9], [x - 3, y - 9]], { w: 1, closed: true, rough: 0.1, passes: 1 }); P.line(x, y - 9, x, y - 16, { w: 0.8, passes: 1, over: 0 });
      P.hatch([[x - 5, y], [x + 5, y], [x + 3, y - 9], [x - 3, y - 9]], { ang: 30, gap: 1.5, a: 0.7, w: 0.45, inset: 0.2 });
      twinkle(x, y - 18, 1.6, col, 8);
      P.curve([[x - 12, y + 2], [x, y + 4], [x + 12, y + 2]], { w: 0.6, a: 0.6, rough: 0.4 }); P.curve([[x - 8, y + 5], [x, y + 7], [x + 8, y + 5]], { w: 0.5, a: 0.4, rough: 0.4 });
    }
    mass(1010, 736, 90, 14, 8, 12, 24, { sy: 0.72 });
    mass(1500, 690, 60, 20, 6, 12, 24, { sy: 0.72 });
    mass(300, 918, 120, 22, 16, 13, 28, { sy: 0.75 });
    mass(160, 742, 80, 16, 8, 12, 24, { sy: 0.72 });
    ferry(720, 740, 0.95, -1);
    tube([[701, 693], [694, 664], [676, 642], [656, 636], [640, 650]], 6, 5, { cap: true });
    tug(1412, 742, 0.95, -1);
    tube([[1388, 700], [1366, 672], [1330, 654], [1296, 662], [1282, 690], [1300, 714]], 8, 6, { cap: true });
    function sail(x, y, s, d = 1) {
      const X = a => x + a * s * d, Y = b => y + b * s;
      P.erase([[X(-16), Y(-34)], [X(16), Y(-34)], [X(16), Y(4)], [X(-16), Y(4)]]);
      P.pl([[X(-14), Y(-1)], [X(16), Y(-1)], [X(11), Y(3)], [X(-10), Y(3)]], { w: 0.9, closed: true, rough: 0.1, passes: 1 });
      P.line(X(0), Y(-1), X(0), Y(-32), { w: 0.7, passes: 1, over: 0 });
      P.pl([[X(1.5), Y(-31)], [X(1.5), Y(-4)], [X(15), Y(-4)]], { w: 0.7, closed: true, rough: 0.1, passes: 1 });
      P.pl([[X(-1.5), Y(-25)], [X(-1.5), Y(-4)], [X(-11), Y(-4)]], { w: 0.7, closed: true, rough: 0.1, passes: 1 });
      P.hatch([[X(1.5), Y(-31)], [X(1.5), Y(-4)], [X(15), Y(-4)]].map(p => p), { ang: 80, gap: 1.5, a: 0.6, w: 0.4, inset: 0.3 });
      P.curve([[X(-16), Y(5)], [X(0), Y(6.5)], [X(18), Y(5)]], { w: 0.5, a: 0.5, rough: 0.3 });
    }
    sail(486, 442, 0.7); sail(590, 452, 0.55, -1); sail(700, 446, 0.5);
    buoy(940, 698, GRN); buoy(1200, 745, RED); buoy(500, 780, GRN);
    // gulls: a wheeling flock in the clear sky, a few low over the water and on the lighthouse
    [[530, 206, 1.15], [566, 230, 1], [604, 204, 1.2], [644, 250, 0.9], [676, 214, 1.05], [716, 262, 0.85], [752, 226, 1], [628, 292, 0.8], [572, 272, 0.95], [700, 200, 0.8], [770, 288, 0.7], [812, 262, 0.65],
      [420, 250, 1], [392, 268, 0.9], [1220, 350, 0.8], [1250, 336, 0.7], [1290, 356, 0.75], [1160, 428, 0.6], [880, 640, 0.8], [905, 660, 0.7], [860, 675, 0.6], [1120, 618, 0.7], [1150, 602, 0.6], [470, 690, 0.8], [1330, 580, 0.6]].forEach(([x, y, s]) => gull(x, y, s));
    /* ================================================================ 6 — cartouches (windows in the fog) with the three mixed-in styles */
    function cartouche(w) {
      P.erase(ellPoly(w.cx, w.cy, w.rx + 3, w.ry + 3, 48));
      P.scallop(ellPoly(w.cx, w.cy, w.rx, w.ry, 64), { closed: true, r: 7.5, w: 1.05, a: 0.95, rough: 0.5 });
      P.scallop(ellPoly(w.cx, w.cy, w.rx - 9, w.ry - 8, 64), { closed: true, r: 6, w: 0.5, a: 0.5, rough: 0.4 });
      const ring = ellPoly(w.cx, w.cy, w.rx + 1, w.ry + 1, 40).concat(ellPoly(w.cx, w.cy, w.rx - 8, w.ry - 7, 40).reverse());
      P.hatch(ring, { ang: -58, gap: 1.9, a: 0.6, w: 0.45, fade: (x, y) => Math.max(0, Math.min(1, (((x - w.cx) / w.rx) * 0.5 + ((y - w.cy) / w.ry) * 0.86) * 1.3 + 0.05)), piece: 10, inset: 0.6 });
    }
    const GD = (x1, y1, x2, y2, a) => P.guide(x1, y1, x2, y2, { a: a ?? 0.32, w: 0.5, over: 3 });
    const dashdot = (x1, y1, x2, y2, o = {}) => P.dashed(x1, y1, x2, y2, [10, 3, 2, 3], Object.assign({ w: 0.5, a: 0.55 }, o));
    const tsz = (s, x, y, sz, o = {}) => P.text(s, x, y, Object.assign({ size: sz }, o));
    WIN.forEach(cartouche);

    /* ------------ B: construction of the cable curve (style B: circles, tick arcs, tangents, red curve, rulers) ------------ */
    { const cx = 1358, TL = 1235, TR = 1481, topY = 122, vy = 210, deckY = 246, Lh = 123, F = vy - topY;
      const py = x => vy - F * Math.pow((x - cx) / Lh, 2);
      const cat = x => py(x) + 5.5 * (1 - Math.pow((x - cx) / Lh, 2)) * Math.pow((x - cx) / Lh, 2) * 4;
      // towers, deck, suspenders (green, thin)
      [TL, TR].forEach(x => { P.rect(x - 6, topY - 4, 12, deckY + 16 - topY + 4, { w: 1.1, rough: 0.3 }); P.hatch([[x, topY - 4], [x + 6, topY - 4], [x + 6, deckY + 16], [x, deckY + 16]], { ang: 80, gap: 1.8, a: 0.5, w: 0.4, inset: 0.4 }); [150, 190, 226].forEach(y => P.line(x - 6, y, x + 6, y, { w: 0.6, passes: 1, over: 0 })); });
      P.line(1196, deckY, 1520, deckY, { w: 1.1, rough: 0.3 }); P.line(1196, deckY + 5, 1520, deckY + 5, { w: 0.6, a: 0.7, rough: 0.3, passes: 1 });
      for (let x = TL + 8; x < TR - 6; x += 9.6) { const y = py(x) + 1.5; P.line(x, y, x, deckY, { w: 0.55, c: GRN, a: 0.95, passes: 1, over: 0, rough: 0.12 }); }
      // construction geometry (pale ink)
      P.dashed(1214, topY, 1502, topY, [7, 4], { w: 0.55, a: 0.6 });
      dashdot(cx, 96, cx, 300, { a: 0.6 });
      [150, 180].forEach(y => { const d = Lh * Math.sqrt((vy - y) / F); P.dashed(cx - d, y, cx + d, y, [4, 4], { w: 0.5, a: 0.55 }); [-1, 1].forEach(s => P.circle(cx + s * d, y, 2.6, { w: 0.7, passes: 1, rough: 0.1 })); });
      // osculating circle at the vertex, with degree ticks
      const R = (2 * Lh) * (2 * Lh) / (8 * F), ccy = vy - R;
      P.arcTicks(cx, ccy, R, PI * 0.12, PI * 0.88, PI / 36, 6, { len: 6, side: 1, w: 0.75, a: 0.75 });
      P.arcTicks(cx, ccy, R - 12, PI * 0.28, PI * 0.72, PI / 45, 5, { len: 4, side: -1, w: 0.5, a: 0.55 });
      P.dot(cx, ccy, 1.6, {}); P.dashed(cx, ccy, cx, vy, [3, 3], { w: 0.5, a: 0.6 });
      // tangents at the tower heads meet under the vertex
      const ty = topY + (4 * F / (2 * Lh)) * Lh;
      [TL, TR].forEach(x => P.line(x, topY, cx, ty, { w: 0.65, a: 0.8, rough: 0.3, passes: 1 }));
      P.circle(cx, ty, 3, { w: 0.8, passes: 1, rough: 0.1 });
      // catenary (ink dash) and the red parabola
      const pc = [], pp = []; for (let x = TL; x <= TR; x += 3) { pc.push([x, cat(x)]); pp.push([x, py(x)]); }
      P.path(pc.filter((_, i) => i % 7 < 5), { w: 0.7, a: 0.7, rough: 0.2 });
      P.path(pp, { w: 1.7, c: RED, a: 0.95, rough: 0.3 });
      P.path(pp.map(([x, y]) => [x, y + 1.8]), { w: 0.6, c: RED, a: 0.6, rough: 0.3 });
      // dimensions and rulers
      P.dim(cx + 42, topY, cx + 42, vy, 'F', -12, { size: 11 });
      P.ruler(TL, 262, TR, 262, 12.3, 5, { len: 6, side: 1 }); P.ruler(1208, topY, 1208, deckY, 12.8, 5, { len: 6, side: 1 });
      [[0, '0'], [10, '125'], [20, '250 M']].forEach(([k, s]) => tsz(s, TL + k * 12.3 - (k === 0 ? 3 : k === 20 ? 22 : 8), 282, 9, { a: 0.7 }));
      tsz('L = 1280 M', TR - 40, 296, 10, { align: 'right', a: 0.8, ls: 0 });
      P.erase([[cx - 44, 224], [cx + 44, 224], [cx + 44, 240], [cx - 44, 240]]); tsz('PARABOLA', cx, 236, 10.5, { align: 'center', c: RED, a: 0.95 });
      P.erase([[1414, 216], [1470, 216], [1470, 232], [1414, 232]]); tsz('CATENARY', 1416, 229, 9, { a: 0.8 });
      tsz('CABLE GEOMETRY', cx, 84, 13, { align: 'center', a: 0.9 });
      tsz('Y = 4 F X*X / L*L', cx, 101, 10.5, { align: 'center', a: 0.85 });
    }

    /* ------------ C: anchorage cutaway with colour-coded strand bundles (style C: bus traces, pads, route lines) ------------ */
    { const yc = 870, hs = { ang: 50, gap: 2.1, a: 0.6, w: 0.45 };
      const bx0 = 458, bx1 = 548, by0 = 832, by1 = 918, cx0 = 478, cy0 = 848, cy1 = 902;
      // concrete block with hollow chamber (hatched walls) and a gallery in the floor slab
      P.hatch([[bx0, by0], [bx1, by0], [bx1, cy0], [bx0, cy0]], hs); P.hatch([[bx0, cy0], [cx0, cy0], [cx0, cy1], [bx0, cy1]], hs); P.hatch([[bx0, cy1], [bx1, cy1], [bx1, by1], [bx0, by1]], hs);
      P.hatch([[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], { ang: -40, gap: 3.4, a: 0.4, w: 0.4, fade: (x, y) => (x < cx0 || y < cy0 || y > cy1 ? 1 : 0), piece: 12 });
      P.poly([[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], { w: 1.4, rough: 0.4 });
      P.erase([[cx0 + 1, cy0 + 1], [bx1 - 1, cy0 + 1], [bx1 - 1, cy1 - 1], [cx0 + 1, cy1 - 1]]); P.rect(cx0, cy0, bx1 - cx0, cy1 - cy0, { w: 1.0, rough: 0.3 });
      P.line(bx0, 909, bx1, 909, { w: 0.5, a: 0.6, passes: 1 });
      // strand shoes (pads) and splayed bundles: red = live strands, green = spare
      const pads = [856, 866, 876, 886];
      pads.forEach(y => { P.circle(486, y, 2.5, { w: 0.9, passes: 1, rough: 0.1 }); P.line(481, y - 3.5, 481, y + 3.5, { w: 0.8, passes: 1, over: 0 }); });
      const ysS = [862, 868, 874, 880], xt = [548, 542, 540, 546];
      ysS.forEach((ys, j) => P.bus([[598, ys], [xt[j], ys], [xt[j] - 8, pads[j]], [492, pads[j]]], 2, 2.6, { colors: [RED, GRN], w: 1.4, chamfer: 7 }));
      // main cable + splay saddle
      P.line(606, yc - 13, 792, yc - 13, { w: 1.5, rough: 0.4 }); P.line(606, yc + 13, 792, yc + 13, { w: 1.5, rough: 0.4 });
      for (let x = 618; x < 790; x += 14) P.line(x, yc - 13, x, yc + 13, { w: 0.55, a: 0.65, passes: 1, over: 0, rough: 0.1 });
      for (let x = 610; x < 792; x += 4.5) P.line(x, yc + 9, x + 2.5, yc + 13, { w: 0.4, a: 0.5, passes: 1, over: 0 });
      [-7, -2, 3, 8].forEach(d => P.line(606, yc + d, 792, yc + d, { w: 0.35, a: 0.35, passes: 1, over: 0, rough: 0.2 }));
      const sad = [[588, yc - 18], [606, yc - 15], [616, yc - 13], [616, yc + 13], [606, yc + 15], [588, yc + 18]];
      P.pl(sad, { w: 1.2, rough: 0.3 }); P.line(588, yc - 18, 588, yc + 18, { w: 1.2, rough: 0.2 }); P.hatch(sad, { ang: 65, gap: 1.8, a: 0.6, w: 0.45, inset: 0.4 });
      P.pl([[790, yc - 15], [796, yc - 8], [788, yc - 1], [796, yc + 6], [788, yc + 13], [794, yc + 17]], { w: 0.8, rough: 0.2 });
      // inspection route (thin red dashes with arrowheads) through the gallery under the chamber
      const rt = [[782, 912], [560, 912], [470, 912]];
      for (let i2 = 0; i2 + 1 < rt.length; i2++) P.dashed(rt[i2][0], rt[i2][1], rt[i2 + 1][0], rt[i2 + 1][1], [7, 4], { w: 0.95, c: RED, a: 0.95 });
      [[720, 912], [640, 912], [520, 912]].forEach(([x, y]) => { P.line(x, y, x + 6, y - 3, { w: 0.9, c: RED, passes: 1, over: 0 }); P.line(x, y, x + 6, y + 3, { w: 0.9, c: RED, passes: 1, over: 0 }); });
      P.circle(782, 912, 3.2, { w: 0.9, c: RED, passes: 1 }); P.dot(470, 912, 2.4, { c: RED });
      // cable section, 37 strands (hex packed)
      { const sx = 768, sy = 832, r = 2.8, red = [], grn = [], ink = [];
        for (let ring = 0; ring <= 3; ring++) for (let k = 0; k < Math.max(1, 6 * ring); k++) { const side = ring ? Math.floor(k / ring) : 0, pos = ring ? k % ring : 0, a0 = side * PI / 3, a1 = (side + 1) * PI / 3; const p0 = [Math.cos(a0) * ring, Math.sin(a0) * ring], p1 = [Math.cos(a1) * ring, Math.sin(a1) * ring]; const u = ring ? lerp(p0[0], p1[0], pos / ring) : 0, v = ring ? lerp(p0[1], p1[1], pos / ring) : 0; const q = [sx + u * 2 * r, sy + v * 2 * r, r * 0.78]; (k % 3 === 0 && ring === 3 ? red : k % 4 === 1 && ring === 2 ? grn : ink).push(q); }
        P.circle(sx, sy, 4.6 * r, { w: 1.1 }); P.dots(ink, null, 0.6); P.dots(red, RED, 0.9); P.dots(grn, GRN, 0.9);
        tsz('A-A', sx - 26, sy + 3, 9, { a: 0.75, align: 'center' });
      }
      tsz('ANCHORAGE  CUTAWAY', 604, 832, 12, { a: 0.9 });
      P.note('SPLAY SADDLE', 606, 850, 596, 858, { size: 10.5 });
      const lg = (x, col, s, dash) => { if (dash) P.dashed(x, 899, x + 10, 899, [4, 2], { w: 1.2, c: col }); else P.line(x, 899, x + 10, 899, { w: 1.8, c: col, passes: 1, over: 0 }); tsz(s, x + 13, 902.5, 9, { c: col, a: 0.95 }); };
      lg(640, RED, 'LIVE'); lg(686, GRN, 'SPARE'); lg(738, RED, 'ROUTE', true);
    }

    /* ------------ W: cable-spinning wheel ------------ */
    { const cx = 140, cy = 854, r = 19;
      P.line(76, 917, 204, 917, { w: 0.9, rough: 0.3 }); for (let x = 78; x < 203; x += 8) P.line(x, 917, x, 920, { w: 0.4, a: 0.6, passes: 1, over: 0 });
      [[92, 909], [188, 909]].forEach(([x, y]) => { P.circle(x, y, 5.5, { w: 1, passes: 1 }); P.line(x, y + 5.5, x, 917, { w: 0.7, passes: 1, over: 0 }); });
      // wire loop: shoe -> wheel groove -> shoe (with travel arrows)
      P.line(96, 904, 128, 869, { w: 0.9, a: 0.85, rough: 0.3 }); P.line(184, 904, 152, 869, { w: 0.9, a: 0.85, rough: 0.3 });
      [[112, 890, 1], [168, 890, -1]].forEach(([x, y, d]) => { const a = Math.atan2(869 - 904, (d > 0 ? 128 - 96 : 152 - 184)); P.line(x, y, x - Math.cos(a) * 7 + Math.sin(a) * 3, y - Math.sin(a) * 7 - Math.cos(a) * 3, { w: 0.9, passes: 1, over: 0 }); P.line(x, y, x - Math.cos(a) * 7 - Math.sin(a) * 3, y - Math.sin(a) * 7 + Math.cos(a) * 3, { w: 0.9, passes: 1, over: 0 }); });
      // the wheel: rim, groove, spokes; red wire riding in the groove
      P.circle(cx, cy, r, { w: 1.4 }); P.circle(cx, cy, r - 4, { w: 0.6, a: 0.7 }); P.circle(cx, cy, 3, { w: 1, passes: 1 });
      for (let k = 0; k < 8; k++) { const a = k * PI / 4 + 0.2; P.line(cx + Math.cos(a) * 3, cy + Math.sin(a) * 3, cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4), { w: 0.6, a: 0.85, passes: 1, over: 0, rough: 0.1 }); }
      P.arc(cx, cy, r + 2.5, r + 2.5, PI * 0.12, PI * 0.88, { w: 1.6, c: RED, passes: 1, rough: 0.2 });
      P.hatch(ellPoly(cx, cy, r, r, 18), { ang: -55, gap: 2.2, a: 0.5, w: 0.4, fade: (x, y) => ((x - cx) * 0.4 + (y - cy) * 0.9 > 4 ? 0.9 : 0), piece: 6, inset: 5 });
      P.arc(cx, cy, r + 8, r + 8, PI * 1.1, PI * 1.62, { w: 0.7, passes: 1, rough: 0.2 });
      { const a = PI * 1.62, px = cx + Math.cos(a) * (r + 8), py = cy + Math.sin(a) * (r + 8); P.line(px, py, px - 6, py + 1.5, { w: 0.9, passes: 1, over: 0 }); P.line(px, py, px - 1, py + 6.5, { w: 0.9, passes: 1, over: 0 }); }
      tsz('SPINNING WHEEL', cx, 816, 10.5, { align: 'center', a: 0.9 });
      tsz('2 WIRES / TRIP', cx, 934, 8, { align: 'center', a: 0.75 });
    }

    /* ------------ D: orthographic row: tower elevation, leg section, deck section, flutter, tonal swatches ------------ */
    { // pale blue-pencil style guides running through the whole row
      [822, 838, 872, 898, 914].forEach(y => { const hw = 352 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 872) / 78, 2))) - 16; GD(1183 - hw, y, 1183 + hw, y); });
      [900, 1000, 1078, 1296, 1424].forEach(x => { const hh = 78 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 1183) / 352, 2))) - 10; GD(x, 872 - hh, x, 872 + hh, 0.22); });
      // P1 tower elevation (front)
      const tx = 972; [tx - 24, tx + 14].forEach(x => { P.rect(x, 822, 10, 92, { w: 1.1, rough: 0.3, passes: 1 }); P.hatch([[x + 5, 822], [x + 10, 822], [x + 10, 914], [x + 5, 914]], { ang: 80, gap: 1.6, a: 0.6, w: 0.4, inset: 0.3 }); });
      [[832, 838], [852, 858], [872, 878], [898, 906]].forEach(([a, b], i) => { P.rect(tx - 14, a, 28, b - a, { w: 0.9, rough: 0.2, passes: 1 }); if (i < 3) { P.line(tx - 14, b, tx + 14, [852, 872, 898][i], { w: 0.5, a: 0.75, passes: 1, over: 0 }); P.line(tx + 14, b, tx - 14, [852, 872, 898][i], { w: 0.5, a: 0.75, passes: 1, over: 0 }); } });
      P.pl([[tx - 26, 822], [tx - 19, 814], [tx + 19, 814], [tx + 26, 822]], { w: 0.9, rough: 0.2 }); dashdot(tx, 808, tx, 926, { a: 0.5 });
      P.dim(tx + 30, 822, tx + 30, 914, '', -6, { size: 8 }); tsz('TOWER', tx, 925, 10, { align: 'center', a: 0.85 });
      // P2 leg section A-A (cellular box)
      const sx = 1036, sy = 836; P.rect(sx, sy, 38, 42, { w: 1.2, rough: 0.25, passes: 1 }); P.rect(sx + 5, sy + 5, 28, 32, { w: 0.6, rough: 0.2, passes: 1 });
      P.line(sx + 19, sy + 5, sx + 19, sy + 37, { w: 0.5, a: 0.8, passes: 1, over: 0 }); P.line(sx + 5, sy + 21, sx + 33, sy + 21, { w: 0.5, a: 0.8, passes: 1, over: 0 });
      P.hatch([[sx, sy], [sx + 38, sy], [sx + 38, sy + 5], [sx, sy + 5]], { ang: 45, gap: 1.5, a: 0.7, w: 0.4, inset: 0.2 }); P.hatch([[sx, sy + 37], [sx + 38, sy + 37], [sx + 38, sy + 42], [sx, sy + 42]], { ang: 45, gap: 1.5, a: 0.7, w: 0.4, inset: 0.2 });
      P.hatch([[sx, sy + 5], [sx + 5, sy + 5], [sx + 5, sy + 37], [sx, sy + 37]], { ang: 45, gap: 1.5, a: 0.7, w: 0.4, inset: 0.2 }); P.hatch([[sx + 33, sy + 5], [sx + 38, sy + 5], [sx + 38, sy + 37], [sx + 33, sy + 37]], { ang: 45, gap: 1.5, a: 0.7, w: 0.4, inset: 0.2 });
      dashdot(sx - 10, sy + 21, sx + 48, sy + 21, { a: 0.5 }); dashdot(sx + 19, sy - 10, sx + 19, sy + 52, { a: 0.5 });
      P.dim(sx, sy + 42, sx + 38, sy + 42, '9.0', 10, { size: 9 }); tsz('SEC A-A', sx + 19, 925, 10, { align: 'center', a: 0.85 });
      // P3 deck cross-section with trusses, cables, suspenders, tiny traffic
      const dx0 = 1092, dx1 = 1284, dy = 872;
      P.rect(dx0, dy, dx1 - dx0, 5, { w: 1.2, rough: 0.3, passes: 1 }); P.hatch([[dx0, dy], [dx1, dy], [dx1, dy + 5], [dx0, dy + 5]], { ang: 40, gap: 1.4, a: 0.7, w: 0.4, inset: 0.2 });
      P.rect(dx0 + 4, dy + 5, dx1 - dx0 - 8, 26, { w: 1.0, rough: 0.3, passes: 1 });
      for (let x = dx0 + 4; x < dx1 - 12; x += 16) { P.line(x, dy + 5, x + 16, dy + 31, { w: 0.5, a: 0.75, passes: 1, over: 0 }); P.line(x + 16, dy + 5, x, dy + 31, { w: 0.5, a: 0.75, passes: 1, over: 0 }); }
      [dx0 + 26, dx0 + 102, dx1 - 26].forEach((x, i) => { if (i === 1) return; P.line(x, dy, x, dy - 2, { w: 0.5 }); });
      [dx0 + 3, dx1 - 3].forEach(x => { P.circle(x, 836, 5, { w: 1.2, passes: 1 }); P.hatch(ellPoly(x, 836, 5, 5, 10), { ang: 40, gap: 1.3, a: 0.65, w: 0.4, inset: 0.3 }); P.line(x, 841, x, dy, { w: 0.5, a: 0.8, c: GRN, passes: 1, over: 0 }); });
      [[dx0 + 22, 14], [dx0 + 44, 9], [dx1 - 60, 9], [dx1 - 84, 14]].forEach(([x, l]) => { P.pl([[x, dy], [x, dy - 7], [x + 4, dy - 9], [x + l - 4, dy - 9], [x + l, dy - 6], [x + l, dy]], { w: 0.8, rough: 0.1, passes: 1 }); P.circle(x + 3, dy, 1.6, { w: 0.6, passes: 1, rough: 0.05 }); P.circle(x + l - 3, dy, 1.6, { w: 0.6, passes: 1, rough: 0.05 }); });
      P.dashed(dx0 + 20, dy - 0.5, dx1 - 20, dy - 0.5, [9, 8], { w: 0.9, a: 0.8 });
      P.dim(dx0, dy + 40, dx1, dy + 40, 'DECK 60', 6, { size: 9 }); tsz('DECK  SECTION', (dx0 + dx1) / 2, 925, 10, { align: 'center', a: 0.85 });
      // P4 wind flutter sketch
      const fx = 1358, fy = 872;
      const deckAt = (ang, o = {}) => { const c = Math.cos(ang), s = Math.sin(ang), pts = [[-46, -3], [46, -3], [46, 8], [20, 14], [-20, 14], [-46, 8]].map(([a, b]) => [fx + a * c - b * s, fy + a * s + b * c]); return pts; };
      const g1 = deckAt(-0.16), g2 = deckAt(0.16); P.poly(g1, { w: 0.6, a: 0.55, rough: 0.15, passes: 1 }); P.poly(g2, { w: 0.6, a: 0.55, rough: 0.15, passes: 1 });
      const d0 = deckAt(0); P.poly(d0, { w: 1.2, rough: 0.2, passes: 1 }); P.hatch(d0, { ang: 40, gap: 1.6, a: 0.6, w: 0.4, inset: 0.4 });
      const wv = []; for (let x = 1312; x <= 1404; x += 3) wv.push([x, 846 + Math.sin((x - 1312) / 92 * TAU * 1.5) * 7]); P.path(wv, { w: 0.9, c: RED, a: 0.95, rough: 0.15 });
      [1316, 1412].forEach((x, i) => { P.line(x, 900, x + (i ? -1 : 1) * 0, 900, { w: 0.5 }); });
      for (let k = 0; k < 3; k++) { const y = 826 + k * 3.5; P.line(1320, y, 1400, y + 0.001, { w: 0.4, a: 0.35, passes: 1, over: 0 }); }
      tsz('FLUTTER  +/- 9 DEG', fx, 925, 10, { align: 'center', a: 0.85 }); tsz('WIND', 1392, 862, 9, { a: 0.75 });
      P.line(1416, 866, 1394, 866, { w: 0.8, passes: 1, over: 0 }); P.line(1394, 866, 1399, 863, { w: 0.8, passes: 1, over: 0 }); P.line(1394, 866, 1399, 869, { w: 0.8, passes: 1, over: 0 });
      // P5 tonal swatches
      [99, 5.2, 3.6, 2.6, 1.8].forEach((g, i) => { const x = 1436 + i * 17, y = 852; P.rect(x, y, 14, 14, { w: 0.7, rough: 0.15, passes: 1 }); if (g < 50) P.hatch([[x, y], [x + 14, y], [x + 14, y + 14], [x, y + 14]], { ang: -45, gap: g * 0.8, a: 0.75, w: 0.4, inset: 0.3, ragged: 0.3 }); tsz(String(i + 1), x + 7, y + 25, 8, { align: 'center', a: 0.7 }); });
      tsz('TONE  1-5', 1436, 842, 9, { a: 0.75 });
      tsz('PAINT  COVERAGE', 1436, 890, 8.5, { a: 0.6 });
      P.note('CABLE  0.92 M', 1112, 818, 1098, 832, { size: 9 }); 
    }

    /* ------------ notes in the sky / on the water ------------ */
    tsz('REPAINT FROM THE NORTH TOWER, AGAIN', 566, 96, 15, { align: 'center', a: 0.95 });
    tsz('PAINTED 41 TIMES.  NEVER ALL AT ONCE.', 566, 116, 10.5, { align: 'center', a: 0.75 });
    P.note('SOUTH TOWER  -  NOT YET STARTED', 930, 232, 1050, 300, { size: 13 });
    P.note('FRESH PAINT', 488, 224, 452, 298, { size: 13 });
    P.note('UNPAINTED  -  YET', 640, 356, 742, 476, { size: 13 });
    P.note('TRAM + BUS + CYCLES', 404, 720, 468, 632, { size: 12 });
    tsz('FERRY  06:40', 690, 776, 11, { a: 0.7 }); tsz('TUG  "PATIENCE"', 1372, 778, 11, { a: 0.7 });
  }
});
