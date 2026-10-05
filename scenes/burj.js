/* SHEET 2 — Burj Khalifa: worm's-eye pen-and-ink on kraft (style A) + cloud ropes (E) + orbit/trajectory overlay (B) + circled callouts (D) */
(window.SCENES = window.SCENES || []).push({
  name: 'Burj Khalifa', seed: 23, theme: 'kraft', ink: '#1b1b20',
  build(P, n, t) {
    const S = Sketch, TAU = S.TAU, lerp = S.lerp;
    const INK = '#1b1b20', SLATE = '#4b4e58', HI = '#fff', RED = '#cf2f26', WARM = '#f6e7bd', PAPER = '#b68b56';
    const D = 100;
    const cam = S.cam({ pos: [0, 2, -D], yaw: 0, pitch: 0.9, f: 760, cx: 800, cy: 555 });
    const pp = (x, y, z) => { const q = cam([x, y, z]); return q ? [q[0], q[1]] : [800, -900]; };
    const dep = (x, y, z) => { const q = cam([x, y, z]); return q ? q[2] : 1; };

    /* ------------------------------------------------------------ small geometry helpers */
    const clipPoly = (poly, x0, y0, x1, y1) => {
      const edges = [
        (p) => p[0] >= x0, (p) => p[0] <= x1, (p) => p[1] >= y0, (p) => p[1] <= y1];
      const isect = [
        (a, b) => { const k = (x0 - a[0]) / (b[0] - a[0]); return [x0, a[1] + (b[1] - a[1]) * k]; },
        (a, b) => { const k = (x1 - a[0]) / (b[0] - a[0]); return [x1, a[1] + (b[1] - a[1]) * k]; },
        (a, b) => { const k = (y0 - a[1]) / (b[1] - a[1]); return [a[0] + (b[0] - a[0]) * k, y0]; },
        (a, b) => { const k = (y1 - a[1]) / (b[1] - a[1]); return [a[0] + (b[0] - a[0]) * k, y1]; }];
      let out = poly;
      for (let e = 0; e < 4 && out.length; e++) {
        const inp = out; out = [];
        for (let i = 0; i < inp.length; i++) {
          const a = inp[i], b = inp[(i + 1) % inp.length], ia = edges[e](a), ib = edges[e](b);
          if (ia && ib) out.push(b);
          else if (ia && !ib) out.push(isect[e](a, b));
          else if (!ia && ib) { out.push(isect[e](a, b)); out.push(b); }
        }
      }
      return out;
    };
    const FX0 = -40, FY0 = -40, FX1 = 1640, FY1 = 1040;
    const inFrame = (p) => p[0] > FX0 && p[0] < FX1 && p[1] > FY0 && p[1] < FY1;
    /* clipped line: Liang-Barsky against slightly enlarged frame */
    const seg = (x1, y1, x2, y2, o) => {
      let t0 = 0, t1 = 1; const dx = x2 - x1, dy = y2 - y1;
      const pr = [-dx, dx, -dy, dy], qs = [x1 - FX0, FX1 - x1, y1 - FY0, FY1 - y1];
      for (let i = 0; i < 4; i++) {
        if (pr[i] === 0) { if (qs[i] < 0) return; }
        else { const r = qs[i] / pr[i]; if (pr[i] < 0) { if (r > t1) return; if (r > t0) t0 = r; } else { if (r < t0) return; if (r < t1) t1 = r; } }
      }
      if (t1 - t0 <= 0) return;
      P.line(x1 + dx * t0, y1 + dy * t0, x1 + dx * t1, y1 + dy * t1, o);
    };
    const hull = (pts) => {
      const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p;
      const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
      const lo = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
      const up = []; for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
      lo.pop(); up.pop(); return lo.concat(up);
    };
    const clipHalf = (poly, ax, ay, bx, by, side) => {
      const f = (p) => ((bx - ax) * (p[1] - ay) - (by - ay) * (p[0] - ax)) * side;
      const out = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b);
        if (fa >= 0) out.push(a);
        if ((fa >= 0) !== (fb >= 0)) { const k = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
      }
      return out;
    };
    const blob = (cx, cy, w, h, k = 1, m = 26) => { const a = []; for (let i = 0; i < m; i++) { const q = i / m * TAU; a.push([cx + Math.cos(q) * w / 2 * k, cy + Math.sin(q) * h / 2 * k]); } return a; };
    const rectP = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const slateWash = (poly, a, o) => P.wash(poly, SLATE, a, Object.assign({ edge: 0, steps: 3, jit: 0.5 }, o));
    const angOf = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    const bird = (x, y, s, o = {}) => {
      const a = o.a ?? 0.9, c = o.c || INK;
      P.curve([[x - 9 * s, y + 1 * s], [x - 4.5 * s, y - 5 * s], [x, y]], { w: 0.9 * Math.max(0.8, s), c, a, rough: 0.2 });
      P.curve([[x, y], [x + 4.5 * s, y - 5.5 * s], [x + 9 * s, y + 2 * s]], { w: 0.9 * Math.max(0.8, s), c, a, rough: 0.2 });
    };
    /* paper-backed handwritten tag with leader arrow */
    const tag = (str, x, y, tx, ty, o = {}) => {
      const size = o.size || 14, w = P.measure(str, size) + 14, h = size * 0.62 + 11, al = o.align || 'left';
      const x0 = al === 'left' ? x - 7 : al === 'right' ? x - w + 7 : x - w / 2;
      P.erase(rectP(x0, y - h + 4, w, h));
      P.rect(x0 + 1, y - h + 5, w - 2, h - 2, { w: 0.5, a: 0.5, rough: 0.3, passes: 1, over: 0 });
      P.text(str, x, y, { size, align: al, c: o.c || INK, a: 0.95 });
      if (tx !== undefined) {
        const sx = tx < x0 + 4 ? x0 : tx > x0 + w - 4 ? x0 + w : x0 + w / 2, sy = tx >= x0 && tx <= x0 + w ? (ty > y ? y + 5 : y - h + 4) : y - h / 2 + 4;
        const cx1 = lerp(sx, tx, 0.5) + P.r(-8, 8), cy1 = lerp(sy, ty, 0.5) + P.r(-8, 8);
        P.curve([[sx, sy], [cx1, cy1], [tx, ty]], { w: 2.6, c: HI, a: 0.45, rough: 0.3 });
        P.curve([[sx, sy], [cx1, cy1], [tx, ty]], { w: 0.8, c: INK, a: 0.95, rough: 0.3 });
        P.dot(tx, ty, 2.2, { c: INK, a: 0.95 }); P.circle(tx, ty, 4.2, { w: 0.7, c: HI, a: 0.9, passes: 1, rough: 0.2 });
      }
    };

    /* ------------------------------------------------------------------ 1  SKY */
    const FR = [[0, 0], [1600, 0], [1600, 1000], [0, 1000]];
    P.wash(FR, SLATE, 0.62, { edge: 0, steps: 3, jit: 0 });
    // long hand hatching in several overlapping layers, heavier towards the top and the edges
    P.hatch(FR, { ang: 63, gap: 3, w: 0.64, a: 0.8, rough: 0.9, jit: 0.4, ragged: 2.5, inset: 0 });
    P.hatch([[0, 0], [1600, 0], [1600, 330], [0, 560]], { ang: 55, gap: 4.4, w: 0.6, a: 0.62, rough: 0.9, ragged: 3, inset: 0 });
    P.hatch([[0, 0], [430, 0], [140, 1000], [0, 1000]], { ang: 72, gap: 3.8, w: 0.58, a: 0.6, rough: 0.9, ragged: 3, inset: 0 });
    P.hatch([[1600, 0], [1170, 0], [1460, 1000], [1600, 1000]], { ang: 58, gap: 3.8, w: 0.58, a: 0.6, rough: 0.9, ragged: 3, inset: 0 });
    P.hatch(FR, { ang: 41, gap: 9, w: 0.5, a: 0.4, rough: 0.9, ragged: 5, inset: 0 });
    /* ---------------------------------------------------------------- cloud helpers */
    function puff(cx, cy, w, h, o = {}) {
      P.erase(blob(cx, cy, w * 0.98, h * 1.0, 1, 22));
      P.wash(blob(cx + w * 0.12, cy + h * 0.2, w * 0.74, h * 0.58, 1, 16), SLATE, o.sh ?? 0.55, { edge: 0, steps: 2, jit: 1.2 });
      const sh = blob(cx + w * 0.1, cy + h * 0.16, w * 0.8, h * 0.62, 1, 14);
      P.hatch(sh, { ang: -54, gap: o.gap || 2.7, w: 0.5, a: 0.62, c: '#22242b', rough: 0.4, inset: 1, ragged: 2 });
      P.hatch(sh.map(q => [lerp(cx + w * 0.16, q[0], 0.7), lerp(cy + h * 0.24, q[1], 0.7)]), { ang: -20, gap: 4, w: 0.45, a: 0.45, c: '#22242b', rough: 0.4, ragged: 2 });
      P.cloud(cx, cy, w, h, { hi: HI, c: '#26282f', lobes: o.lobes || 8, inner: o.inner ?? 2, r: o.r, w: o.w || 1.25, a: 0.95, shade: false });
    }
    /* cauliflower cumulus made of overlapping puffs, back to front */
    function cumulus(cx, cy, s, o = {}) {
      const k = o.n || 6, list = [];
      for (let i = 0; i < k; i++) {
        const q = k === 1 ? 0.5 : i / (k - 1), sn = Math.sin(q * Math.PI);
        const pw = s * (0.34 + 0.24 * sn) * P.r(0.88, 1.1);
        list.push([cx + (q - 0.5) * s * 0.86 + P.r(-0.04, 0.04) * s, cy - sn * s * (o.rise ?? 0.15) + P.r(-0.03, 0.03) * s, pw, pw * P.r(0.72, 0.9)]);
      }
      list.sort((a, b) => a[1] - b[1]);
      list.forEach(([x, y, w, h]) => puff(x, y, w, h, { lobes: o.lobes || 8, sh: o.sh, inner: 2 }));
    }
    /* rope of overlapping cloud lobes along a path (style E smoke tube) */
    function tube(path, r0, r1, o = {}) {
      const S0 = P.sample(path, false, 2.5), m = S0.length, cum = [0];
      for (let i = 1; i < m; i++) cum.push(cum[i - 1] + Math.hypot(S0[i][0] - S0[i - 1][0], S0[i][1] - S0[i - 1][1]));
      const tot = cum[m - 1]; if (tot < 4) return;
      const C = []; let d = 0, j = 0;
      while (d <= tot) {
        while (j < m - 2 && cum[j + 1] < d) j++;
        const u = d / tot, rr = lerp(r0, r1, u) * P.r(0.93, 1.07);
        const a = S0[Math.max(0, j - 1)], b = S0[Math.min(m - 1, j + 2)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        const k = (d - cum[j]) / Math.max(0.01, cum[j + 1] - cum[j]);
        C.push([lerp(S0[j][0], S0[j + 1][0], k), lerp(S0[j][1], S0[j + 1][1], k), tx, ty, rr]);
        d += rr * (o.pitch || 0.95);
      }
      const n2 = C.length; if (n2 < 3) return;
      const EO = 0.62, L = C.map(q => [q[0] - q[3] * q[4] * EO, q[1] + q[2] * q[4] * EO]), R = C.map(q => [q[0] + q[3] * q[4] * EO, q[1] - q[2] * q[4] * EO]);
      // erase the whole rope (dense offset polygon, generous for the bulges)
      const el = [], er = [];
      C.forEach(q => { el.push([q[0] - q[3] * q[4] * 1.22, q[1] + q[2] * q[4] * 1.22]); er.push([q[0] + q[3] * q[4] * 1.22, q[1] - q[2] * q[4] * 1.22]); });
      P.erase(el.concat(er.reverse()));
      const bump = (A, B2, side, hf) => {
        const dx = B2[0] - A[0], dy = B2[1] - A[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * side, ny = dx / l * side, h = l * hf * P.r(0.9, 1.12), pp2 = [];
        for (let u = 0; u <= 7; u++) { const t = u / 7, bb = Math.pow(Math.sin(Math.PI * t), 0.8) * h; pp2.push([A[0] + dx * t + nx * bb, A[1] + dy * t + ny * bb]); }
        return pp2;
      };
      let lo = [], ro = [];
      const ss = o.shape || 0.56;
      for (let i = 0; i + 1 < n2; i++) { lo = lo.concat(bump(L[i], L[i + 1], 1, ss)); ro = ro.concat(bump(R[i], R[i + 1], -1, ss)); }
      // inner lobes: arcs across the rope from lobe to lobe
      const c1 = o.c || '#26282f', w1 = o.w || 1.15;
      // slate underside wash then hatch
      const poly = L.concat(R.slice().reverse());
      if (o.sh !== 0) P.wash(poly.map((q, i) => i < n2 ? [lerp(q[0], C[i][0], 0.15), lerp(q[1], C[i][1], 0.15)] : q), SLATE, o.sh ?? 0.4, { edge: 0, steps: 2, jit: 1 });
      for (let i = 1; i + 1 < n2; i++) {
        const q = C[i], rr = q[4], mid = [q[0] + q[2] * rr * 0.45, q[1] + q[3] * rr * 0.45];
        P.curve([L[i], mid, R[i]], { rough: 0.35, w: w1 * 0.75, c: c1, a: 0.85 });
      }
      P.hatch(poly, { ang: o.ang ?? -58, gap: o.gap || 2.4, a: 0.6, w: 0.45, c: c1, fade: (x, y) => 0.7, piece: 10, inset: 1 });
      P.path(lo, { rough: 0.45, w: w1, c: c1, a: 0.95 }); P.path(ro, { rough: 0.45, w: w1, c: c1, a: 0.95 });
      // white pen highlights on the lit lobes (left/upper side)
      for (let i = 1; i + 1 < n2; i += (o.hi || 2)) {
        const q = C[i], rr = q[4], an = Math.atan2(-q[2], q[3]) + Math.PI;     // pointing to the "left" of travel
        const hx = q[0] + Math.cos(an) * rr * 0.4, hy = q[1] + Math.sin(an) * rr * 0.4;
        P.arc(hx, hy, rr * 0.5, rr * 0.5, an - 1.2, an + 0.2, { c: HI, w: 1, a: 0.9, passes: 1, rough: 0.25 });
      }
    }

    /* ------------------------------------------------------------ 2  far clouds, contrails, birds */
    cumulus(170, 105, 290, { n: 5 });
    cumulus(1500, 62, 190, { n: 4 });
    cumulus(1215, 650, 240, { n: 4 });
    cumulus(500, 610, 150, { n: 3 });
    cumulus(1420, 880, 220, { n: 4 });
    cumulus(300, 690, 200, { n: 4 });
    tube([[380, 36], [520, 58], [680, 34], [780, 44]], 4, 7, { hi: 3 });
    tube([[1600, 352], [1520, 372], [1450, 404], [1390, 436]], 8, 4, { hi: 3 });
    tube([[10, 330], [90, 302], [190, 306], [270, 270]], 4, 8, { hi: 3 });
    tube([[900, 78], [1010, 72], [1120, 58], [1230, 52]], 3.5, 8, { hi: 3, pitch: 1.05 });
    { const px = 1256, py = 48;   // the aircraft making it
      P.erase(blob(px, py, 44, 26, 1, 12));
      P.line(px - 12, py, px + 10, py - 1, { w: 1.6, a: 0.95, c: INK, passes: 1, over: 0, rough: 0.1 });
      P.line(px - 3, py, px - 12, py + 9, { w: 1.1, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(px - 3, py, px - 12, py - 9, { w: 1.1, a: 0.95, passes: 1, over: 0, rough: 0.1 });
      P.line(px - 12, py, px - 17, py - 4, { w: 1.1, a: 0.95, passes: 1, over: 0, rough: 0.1 });
      P.line(px + 4, py - 0.5, px + 1, py + 4, { w: 0.8, a: 0.9, passes: 1, over: 0 }); P.line(px + 4, py - 0.5, px + 1, py - 5, { w: 0.8, a: 0.9, passes: 1, over: 0 });
      P.line(px - 10, py - 1.4, px + 8, py - 2.2, { w: 0.6, a: 0.9, c: HI, passes: 1, over: 0 }); }
    /* ------------------------------------------------------------ 3  tower model */
    const TH = [520, 553, 585], CORE_TOP = 601;
    const wingAng = [-68, 52, 172].map(d => d * Math.PI / 180);
    const SETB = [
      [[0, 40], [90, 34], [178, 28.5], [266, 23.5], [352, 19], [430, 15], [490, 11.5]],
      [[0, 40], [120, 34], [208, 28.5], [296, 23.5], [382, 19], [458, 15], [518, 11.5]],
      [[0, 40], [150, 34], [238, 28.5], [326, 23.5], [412, 19], [486, 15], [548, 11.5]]];
    const HWs = [[6.5, 11.3], [12, 10.6], [18, 9.5], [24, 8.4], [30, 7.2], [36, 6], [41, 5]];
    const hwAt = (u) => { for (let i = 0; i + 1 < HWs.length; i++) if (u <= HWs[i + 1][0]) return lerp(HWs[i][1], HWs[i + 1][1], (u - HWs[i][0]) / (HWs[i + 1][0] - HWs[i][0])); return HWs[HWs.length - 1][1]; };
    const ueAt = (i, h) => { if (h >= TH[i]) return 0; let v = 40; for (const [hh, u] of SETB[i]) if (hh <= h) v = u; return v; };
    function planOf(ue) {
      const pts = [];
      for (let i = 0; i < 3; i++) {
        const th = wingAng[i], c = Math.cos(th), s = Math.sin(th), W = (u, v) => [u * c - v * s, u * s + v * c];
        if (ue[i] < 9) { pts.push({ p: W(6.5, -11.3), k: 'core' }, { p: W(6.5, 11.3), k: 'core' }); continue; }
        const e = ue[i], te = e - 2.5, hh = hwAt(te), st = HWs.filter(q => q[0] < te - 0.5);
        st.forEach(q => pts.push({ p: W(q[0], -q[1]), k: 'side' }));
        pts.push({ p: W(te, -hh), k: 'bevel' }, { p: W(e, -(hh - 2.4)), k: 'tip' }, { p: W(e, hh - 2.4), k: 'bevel' }, { p: W(te, hh), k: 'side' });
        for (let j = st.length - 1; j >= 0; j--) pts.push({ p: W(st[j][0], st[j][1]), k: j === 0 ? 'core' : 'side' });
      }
      const out = [];
      pts.forEach((q, i) => { const pr = out[out.length - 1]; if (!pr || Math.hypot(q.p[0] - pr.p[0], q.p[1] - pr.p[1]) > 0.05) out.push(q); });
      if (out.length > 1 && Math.hypot(out[0].p[0] - out[out.length - 1].p[0], out[0].p[1] - out[out.length - 1].p[1]) < 0.05) out.pop();
      return out;
    }
    const bps = [0];
    SETB.forEach(a => a.forEach(([h]) => { if (h > 0) bps.push(h); }));
    TH.forEach(h => bps.push(h)); bps.push(CORE_TOP);
    const B = Array.from(new Set(bps)).sort((a, b) => a - b);
    const planAt = (h) => planOf([0, 1, 2].map(i => ueAt(i, h)));
    const areaSign = (pl) => { let A = 0; for (let i = 0; i < pl.length; i++) { const a = pl[i].p, b = pl[(i + 1) % pl.length].p; A += a[0] * b[1] - b[0] * a[1]; } return A > 0 ? 1 : -1; };
    const LDIR = [-0.9, -0.4];
    const items = [];
    const tipPos = (i, h) => { const u = ueAt(i, h); if (u < 9) return null; const th = wingAng[i]; return [Math.cos(th) * u, Math.sin(th) * u]; };

    /* one facade: perspective quad with floors, mullions, shading, lit windows */
    function wall(a, b, h0, h1, lit, kind, hi) {
      const A0 = pp(a[0], h0, a[1]), B0 = pp(b[0], h0, b[1]), B1 = pp(b[0], h1, b[1]), A1 = pp(a[0], h1, a[1]);
      const cq = clipPoly([A0, B0, B1, A1], -6, -6, 1606, 1006); if (cq.length < 3) return;
      const dark = (1 - lit) / 2;                     // 0 lit .. 1 dark
      const tone = dark > 0.62 ? 2 : dark > 0.4 ? 1 : 0;
      P.erase(cq);
      const ang = angOf(A0, A1);
      if (tone === 2) slateWash(cq, 0.72, {}); else if (tone === 1) slateWash(cq, 0.3, {});
      if (tone === 2) {
        P.hatch(cq, { ang, gap: 1.4, w: 0.55, a: 0.9, rough: 0.5, inset: 0.6, ragged: 1.2 });
        P.hatch(cq, { ang: ang + 33, gap: 2.1, w: 0.5, a: 0.7, rough: 0.5, inset: 0.6, ragged: 1.6 });
      } else if (tone === 1) {
        P.hatch(cq, { ang, gap: 2.8, w: 0.5, a: 0.6, rough: 0.5, inset: 0.6, ragged: 2 });
        P.hatch(cq, { ang: ang + 40, gap: 6, w: 0.45, a: 0.4, rough: 0.5, inset: 0.6, ragged: 3 });
      } else {
        P.hatch(cq, { ang, gap: 5.2, w: 0.45, a: 0.45, rough: 0.5, inset: 0.6, ragged: 4, fade: (x, y) => 0.25 + 0.75 * Math.pow(y / 1000, 1.5), piece: 50 });
      }
      // reflective glass streaks (dense vertical strips) and a dark mechanical band under each step
      {
        const nS = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2.3));
        for (let j = 0; j < nS; j++) {
          if (P.r() > (tone === 2 ? 0.2 : 0.3)) continue;
          const s0 = j / nS, s1 = Math.min(1, (j + 1 + (P.r() < 0.5 ? 1 : 0)) / nS);
          const pa = pp(lerp(a[0], b[0], s0), h0, lerp(a[1], b[1], s0)), pb = pp(lerp(a[0], b[0], s1), h0, lerp(a[1], b[1], s1)), pc = pp(lerp(a[0], b[0], s1), h1, lerp(a[1], b[1], s1)), pd = pp(lerp(a[0], b[0], s0), h1, lerp(a[1], b[1], s0));
          const cs = clipPoly([pa, pb, pc, pd], -6, -6, 1606, 1006);
          if (cs.length > 2 && Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) > 2.5) P.hatch(cs, { ang: angOf(pa, pd), gap: tone === 2 ? 1.5 : 2.1, w: 0.5, a: tone === 2 ? 0.5 : 0.55, inset: 0.5, ragged: 3 });
        }
        const bh = Math.min(9, (h1 - h0) * 0.35);
        if (h1 - h0 > 24) {
          const qa = [pp(a[0], h1 - bh, a[1]), pp(b[0], h1 - bh, b[1]), B1, A1], cb = clipPoly(qa, -6, -6, 1606, 1006);
          if (cb.length > 2) {
            if (tone < 2) slateWash(cb, 0.42, { jit: 0.3 });
            P.hatch(cb, { ang: ang + 90 - 20, gap: 1.9, w: 0.55, a: 0.75, inset: 0.4, ragged: 1.2 });
            P.hatch(cb, { ang: ang, gap: 2.2, w: 0.5, a: 0.6, inset: 0.4, ragged: 1.2 });
          }
        }
      }
      const Lp = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const cols = Math.max(1, Math.round(Lp / 2.3)), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const fl = 3.6;
      const yA = pp(mid[0], Math.max(h0, 10), mid[1]), yB = pp(mid[0], Math.max(h0, 10) + fl, mid[1]);
      const spacing = Math.hypot(yB[0] - yA[0], yB[1] - yA[1]);
      const skipF = Math.max(1, Math.ceil(2.6 / Math.max(0.3, spacing)));
      const wc = tone === 2 ? HI : INK, wa = tone === 2 ? 0.34 : tone === 1 ? 0.36 : 0.3;
      let fi = 0;
      for (let h = Math.ceil(h0 / fl) * fl; h < h1; h += fl, fi++) {
        if (fi % skipF) continue;
        const p = pp(a[0], h, a[1]), q = pp(b[0], h, b[1]);
        seg(p[0], p[1], q[0], q[1], { w: (fi % (10 * skipF)) === 0 ? 0.8 : 0.4, a: (fi % (10 * skipF)) === 0 ? wa * 1.6 : wa, c: wc, passes: 1, over: 0, rough: 0.2, step: 30 });
      }
      const wpx = Math.hypot(B0[0] - A0[0], B0[1] - A0[1]);
      const cstep = wpx / cols < 3.2 ? 2 : 1;
      for (let j = 1; j < cols; j += cstep) {
        const s = j / cols, x = lerp(a[0], b[0], s), z = lerp(a[1], b[1], s);
        const p = pp(x, h0, z), q = pp(x, h1, z);
        seg(p[0], p[1], q[0], q[1], { w: 0.4, a: wa, c: wc, passes: 1, over: 0, rough: 0.2, step: 30 });
      }
      // lit apartments
      if (tone >= 1 && wpx / cols > 4) {
        const step = tone === 2 ? 0.16 : 0.07;
        for (let h = Math.max(fl, Math.ceil(h0 / fl) * fl); h < h1 - fl; h += fl) {
          for (let j = 0; j < cols; j++) {
            if (P.r() > step) continue;
            const s0 = (j + 0.2) / cols, s1 = (j + 0.8) / cols;
            const q = [pp(lerp(a[0], b[0], s0), h + 0.5, lerp(a[1], b[1], s0)), pp(lerp(a[0], b[0], s1), h + 0.5, lerp(a[1], b[1], s1)), pp(lerp(a[0], b[0], s1), h + fl - 0.7, lerp(a[1], b[1], s1)), pp(lerp(a[0], b[0], s0), h + fl - 0.7, lerp(a[1], b[1], s0))];
            if (!q.every(inFrame)) continue;
            P.wash(q, WARM, 0.92, { edge: 0, steps: 1, jit: 0.12 });
          }
        }
      }
      // edges + pen highlights
      const eo = { w: 1.35, a: 0.95, passes: 1, over: 0.3, rough: 0.5 };
      seg(A0[0], A0[1], A1[0], A1[1], eo); seg(B0[0], B0[1], B1[0], B1[1], eo);
      seg(A1[0], A1[1], B1[0], B1[1], eo); seg(A0[0], A0[1], B0[0], B0[1], eo);
      if (tone === 0 || hi) {
        const l = A0[0] < B0[0] ? [A0, A1] : [B0, B1];
        seg(l[0][0] + 2.6, l[0][1], l[1][0] + 2.2, l[1][1], { w: 0.9, a: 0.9, c: HI, passes: 1, over: 0, rough: 0.3 });
        seg(A1[0], A1[1] + 2.3, B1[0], B1[1] + 2.3, { w: 0.7, a: 0.7, c: HI, passes: 1, over: 0, rough: 0.3 });
      } else {
        const l = A0[0] > B0[0] ? [A0, A1] : [B0, B1];
        seg(l[0][0] - 2.2, l[0][1], l[1][0] - 2.0, l[1][1], { w: 0.7, a: 0.55, c: HI, passes: 1, over: 0, rough: 0.3 });
      }
      // sky-garden foliage overhanging a step
      if (kind === 'tip' && h1 < 560 && lit > -0.1) {
        const fp = A1[0] < B1[0] ? [A1, B1] : [B1, A1];
        const ln = Math.hypot(fp[1][0] - fp[0][0], fp[1][1] - fp[0][1]);
        if (ln > 12) {
          const r = Math.max(2.5, Math.min(9, ln / 5.5));
          P.scallop([[fp[0][0], fp[0][1] - 1], [fp[1][0], fp[1][1] - 1]], { r, side: -1, w: 1, c: INK, a: 0.95, bulge: 1.1 });
          P.scallop([[fp[0][0] + 3, fp[0][1] - 4], [fp[1][0] - 3, fp[1][1] - 4]], { r: r * 0.8, side: -1, w: 0.7, c: INK, a: 0.75, bulge: 1 });
          for (let k = 0; k < 3; k++) { const q = lerp(0.2, 0.8, k / 2); P.arc(lerp(fp[0][0], fp[1][0], q), lerp(fp[0][1], fp[1][1], q) - r * 1.1, r * 0.55, r * 0.55, 3.5, 4.6, { c: HI, w: 0.8, a: 0.9, passes: 1, rough: 0.2 }); }
        }
      }
    }
    /* ring balcony (observation decks) */
    function balcony(h, out) {
      const pl = planAt(h), sg = areaSign(pl), m = pl.length;
      const off = pl.map((q, i) => {
        const a = pl[(i + m - 1) % m].p, b = q.p, c = pl[(i + 1) % m].p;
        const n1 = (() => { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return sg > 0 ? [dz / l, -dx / l] : [-dz / l, dx / l]; })();
        const n2 = (() => { const dx = c[0] - b[0], dz = c[1] - b[1], l = Math.hypot(dx, dz) || 1; return sg > 0 ? [dz / l, -dx / l] : [-dz / l, dx / l]; })();
        let mx = n1[0] + n2[0], mz = n1[1] + n2[1]; const ml = Math.hypot(mx, mz) || 1; mx /= ml; mz /= ml;
        const k = out / Math.max(0.55, mx * n1[0] + mz * n1[1]);
        return [b[0] + mx * k, b[1] + mz * k];
      });
      for (let i = 0; i < m; i++) {
        const a = pl[i].p, b = pl[(i + 1) % m].p, a2 = off[i], b2 = off[(i + 1) % m];
        const dx = b[0] - a[0], dz = b[1] - a[1], nrm = sg > 0 ? [dz, -dx] : [-dz, dx];
        if (nrm[0] * (0 - a[0]) + nrm[1] * (-D - a[1]) <= 0) continue;
        const key = Math.hypot((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + D) - 0.4;
        items.push({ key, fn: () => {
          const u = [pp(a[0], h, a[1]), pp(b[0], h, b[1]), pp(b2[0], h - 0.6, b2[1]), pp(a2[0], h - 0.6, a2[1])];
          const cu = clipPoly(u, -6, -6, 1606, 1006); if (cu.length < 3) return;
          P.erase(cu); slateWash(cu, 0.6, {});
          P.hatch(cu, { ang: angOf(u[0], u[3]), gap: 1.6, w: 0.55, a: 0.75, inset: 0.4, ragged: 1 });
          const ln = Math.hypot(u[1][0] - u[0][0], u[1][1] - u[0][1]), k = Math.max(2, Math.round(ln / 5));
          for (let j = 0; j <= k; j++) { const s = j / k; seg(lerp(u[0][0], u[1][0], s), lerp(u[0][1], u[1][1], s), lerp(u[3][0], u[2][0], s), lerp(u[3][1], u[2][1], s), { w: 0.45, a: 0.6, c: HI, passes: 1, over: 0, rough: 0.2 }); }
          const o2 = [pp(a2[0], h - 0.6, a2[1]), pp(b2[0], h - 0.6, b2[1]), pp(b2[0], h + 1.1, b2[1]), pp(a2[0], h + 1.1, a2[1])];
          const co = clipPoly(o2, -6, -6, 1606, 1006); if (co.length > 2) { P.erase(co); P.hatch(co, { ang: angOf(o2[1], o2[2]), gap: 2.4, w: 0.5, a: 0.55, inset: 0.4 }); }
          const eo = { w: 1.2, a: 0.95, passes: 1, over: 0.3, rough: 0.4 };
          seg(u[3][0], u[3][1], u[2][0], u[2][1], eo); seg(o2[3][0], o2[3][1], o2[2][0], o2[2][1], eo); seg(u[0][0], u[0][1], u[1][0], u[1][1], { w: 0.8, a: 0.8, passes: 1, over: 0, rough: 0.3 });
          seg(o2[3][0], o2[3][1] + 2, o2[2][0], o2[2][1] + 2, { w: 0.8, a: 0.9, c: HI, passes: 1, over: 0, rough: 0.2 });
        } });
      }
    }
    // gather wall items
    for (let bi = 0; bi + 1 < B.length; bi++) {
      const h0 = B[bi], h1 = B[bi + 1], pl = planAt(h0 + 0.01), sg = areaSign(pl), m = pl.length;
      for (let i = 0; i < m; i++) {
        const a = pl[i].p, b = pl[(i + 1) % m].p, kind = pl[i].k;
        const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
        const nrm = sg > 0 ? [dz / l, -dx / l] : [-dz / l, dx / l];
        if (nrm[0] * (0 - a[0]) + nrm[1] * (-D - a[1]) <= 0) continue;
        const lit = nrm[0] * LDIR[0] + nrm[1] * LDIR[1];
        const key = Math.hypot((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + D);
        items.push({ key, fn: () => wall(a, b, h0, h1, lit, kind, false) });
      }
    }
    balcony(452, 2.4); balcony(555, 2.0);
    items.sort((p, q) => q.key - p.key);

    /* ---------------------------------------------- lattice / gantry building blocks */
    function lattice(x0, z0, x1, z1, y0, y1, o = {}) {
      const bay = o.bay || 7, pan = o.pan || 2, cs = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
      const nlev = Math.max(1, Math.round((y1 - y0) / bay));
      const midY = (y0 + y1) / 2;
      const wN = o.w ?? 0.75;
      for (let f = 0; f < 4; f++) {
        const a = cs[f], b = cs[(f + 1) % 4], dx = b[0] - a[0], dz = b[1] - a[1];
        const nrm = [dz, -dx];                       // CCW-ish outward for this ordering (checked below)
        const cxm = (x0 + x1) / 2, czm = (z0 + z1) / 2, mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
        const outward = ((mx - cxm) * nrm[0] + (mz - czm) * nrm[1]) >= 0 ? 1 : -1;
        const near = outward * (nrm[0] * (0 - mx) + nrm[1] * (-D - mz)) > 0;
        const c = o.c || INK, al = near ? 0.92 : 0.55, w = near ? wN : wN * 0.7;
        const lo = { w, a: al, c, passes: 1, over: 0, rough: 0.35, step: 24 };
        // screen spacing of a bay decides how many levels to skip
        const p0 = pp(a[0], midY, a[1]), p1 = pp(a[0], midY + bay, a[1]);
        const sp = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        const sk = Math.max(1, Math.ceil(2.4 / Math.max(0.2, sp)));
        for (let L = 0; L <= nlev; L += sk) {
          const yy = Math.min(y1, y0 + L * bay), yy2 = Math.min(y1, y0 + (L + sk) * bay);
          const pa = pp(a[0], yy, a[1]), pb = pp(b[0], yy, b[1]);
          seg(pa[0], pa[1], pb[0], pb[1], lo);
          if (L < nlev) {
            for (let k = 0; k < pan; k++) {
              const s0 = k / pan, s1 = (k + 1) / pan;
              const xa = lerp(a[0], b[0], s0), za = lerp(a[1], b[1], s0), xb = lerp(a[0], b[0], s1), zb = lerp(a[1], b[1], s1);
              const q00 = pp(xa, yy, za), q10 = pp(xb, yy, zb), q01 = pp(xa, yy2, za), q11 = pp(xb, yy2, zb);
              const flip = (L / sk + k + f) % 3;
              if (flip !== 0) seg(q00[0], q00[1], q11[0], q11[1], lo);
              if (near && flip !== 1) seg(q10[0], q10[1], q01[0], q01[1], lo);
              if (near && k > 0) seg(q00[0], q00[1], q01[0], q01[1], Object.assign({}, lo, { w: w * 0.75 }));
              if (near && P.r() < 0.1) { const hx = lerp(q00[0], q10[0], 0.5), hy = lerp(q00[1], q10[1], 0.5), tx = lerp(q01[0], q11[0], 0.5), ty = lerp(q01[1], q11[1], 0.5); seg(hx, hy, tx, ty, Object.assign({}, lo, { w: w * 0.6, a: al * 0.7 })); }
            }
          }
        }
      }
      // corner posts, heavier
      cs.forEach(([x, z]) => { const p = pp(x, y0, z), q = pp(x, y1, z); seg(p[0], p[1], q[0], q[1], { w: (o.w ?? 0.75) * 1.7, a: 0.95, c: o.c || INK, passes: 1, over: 0.3, rough: 0.3 }); seg(p[0] + 1.8, p[1], q[0] + 1.6, q[1], { w: 0.6, a: 0.7, c: HI, passes: 1, over: 0, rough: 0.2 }); });
    }
    /* underside of a platform, seen from below */
    function deck(x0, z0, x1, z1, y, o = {}) {
      const q = [pp(x0, y, z0), pp(x1, y, z0), pp(x1, y, z1), pp(x0, y, z1)];
      const cq = clipPoly(q, -6, -6, 1606, 1006); if (cq.length < 3) return;
      P.erase(cq); slateWash(cq, o.a ?? 0.3, {});
      const nj = o.joists || 9, ins = o.rim ?? 2.2;
      const ax = Math.min(x0, x1), bx = Math.max(x0, x1), az = Math.min(z0, z1), bz = Math.max(z0, z1);
      const strips = [[ax, az, bx, az + ins], [ax, bz - ins, bx, bz], [ax, az + ins, ax + ins, bz - ins], [bx - ins, az + ins, bx, bz - ins]];
      strips.forEach(([xa, za, xb, zb]) => {
        const r = [pp(xa, y, za), pp(xb, y, za), pp(xb, y, zb), pp(xa, y, zb)], cr = clipPoly(r, -6, -6, 1606, 1006);
        if (cr.length < 3) return;
        slateWash(cr, 0.55, { jit: 0.3 });
        P.hatch(cr, { ang: angOf(r[0], r[3]), gap: 1.6, w: 0.55, a: 0.8, inset: 0.3, ragged: 1 });
        P.hatch(cr, { ang: angOf(r[0], r[1]) + 10, gap: 2.6, w: 0.5, a: 0.6, inset: 0.3, ragged: 1 });
      });
      // joists across the opening
      for (let j = 1; j < nj; j++) {
        const s = j / nj;
        seg(lerp(q[0][0], q[1][0], s), lerp(q[0][1], q[1][1], s), lerp(q[3][0], q[2][0], s), lerp(q[3][1], q[2][1], s), { w: 0.5, a: 0.6, passes: 1, over: 0, rough: 0.2 });
      }
      for (let j = 1; j < 3; j++) { const s = j / 3; seg(lerp(q[0][0], q[3][0], s), lerp(q[0][1], q[3][1], s), lerp(q[1][0], q[2][0], s), lerp(q[1][1], q[2][1], s), { w: 0.5, a: 0.5, passes: 1, over: 0, rough: 0.2 }); }
      const eo = { w: 1.25, a: 0.95, passes: 1, over: 0.3, rough: 0.4 };
      for (let i = 0; i < 4; i++) seg(q[i][0], q[i][1], q[(i + 1) % 4][0], q[(i + 1) % 4][1], eo);
      seg(q[0][0], q[0][1] - 2, q[1][0], q[1][1] - 2, { w: 0.8, a: 0.85, c: HI, passes: 1, over: 0, rough: 0.2 });
    }
    function gantry(x0, z0, x1, z1, y0, y1, o = {}) {
      const cs = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], pts = [];
      cs.forEach(c => { pts.push(pp(c[0], y0, c[1]), pp(c[0], y1, c[1])); });
      const hl = clipPoly(hull(pts), -6, -6, 1606, 1006);
      if (hl.length > 2) {
        P.erase(hl); slateWash(hl, 0.32, {});
        const a0 = pp((x0 + x1) / 2, y0, (z0 + z1) / 2), a1 = pp((x0 + x1) / 2, y1, (z0 + z1) / 2);
        P.hatch(hl, { ang: angOf(a0, a1), gap: 3.4, w: 0.5, a: 0.5, inset: 0.3, ragged: 3 });
        const sd = clipHalf(hl, a0[0], a0[1], a1[0], a1[1], o.shadeSide || 1);
        if (sd.length > 2) { slateWash(sd, 0.3, {}); P.hatch(sd, { ang: angOf(a0, a1), gap: 1.7, w: 0.55, a: 0.75, inset: 0.3, ragged: 1.5 }); P.hatch(sd, { ang: angOf(a0, a1) + 38, gap: 3, w: 0.5, a: 0.55, inset: 0.3, ragged: 2 }); }
      }
      lattice(x0, z0, x1, z1, y0, y1, { bay: o.bay || 6, pan: o.pan || 2, w: o.w });
      if (o.decks) o.decks.forEach(([y, side, len, ph]) => {
        const zA = z0 - 1, zB = z1 + 1, xa = side > 0 ? x1 : x0 - len, xb = side > 0 ? x1 + len : x0;
        lattice(xa, zA, xb, zB, y - ph, y, { bay: 3.4, pan: 3, w: 0.65 });
        deck(xa, zA, xb, zB, y - ph, { joists: 10 });
        // dark outer skin on the shaded end
        const e0 = side > 0 ? xb : xa;
        const q = [pp(e0, y - ph, zA), pp(e0, y - ph, zB), pp(e0, y, zB), pp(e0, y, zA)], cq = clipPoly(q, -6, -6, 1606, 1006);
        if (cq.length > 2) { slateWash(cq, 0.4, {}); P.hatch(cq, { ang: angOf(q[0], q[3]), gap: 2, w: 0.5, a: 0.6, inset: 0.3 }); }
        seg(q[3][0], q[3][1] + 2, q[2][0], q[2][1] + 2, { w: 0.9, a: 0.9, c: HI, passes: 1, over: 0, rough: 0.2 });
      });
      // hoist cable + car
      if (o.hoist) { const [hx, hz, ya, yb] = o.hoist; const p = pp(hx, ya, hz), q = pp(hx, yb, hz); seg(p[0], p[1], q[0], q[1], { w: 0.9, a: 0.9, passes: 1, over: 0, rough: 0.2 }); seg(p[0] + 2, p[1], q[0] + 2, q[1], { w: 0.6, a: 0.8, c: HI, passes: 1, over: 0, rough: 0.2 }); }
    }

    /* ------------------------------------------------ 4  tower crane behind the tower */
    const craneAt = (mx, mz, hTop, jibDir) => {
      lattice(mx - 1.6, mz - 1.6, mx + 1.6, mz + 1.6, 0, hTop, { bay: 3, pan: 1, w: 0.6 });
      // jib + counter-jib as triangular lattice booms along jibDir (unit x,z)
      const [dx, dz] = jibDir, J = 62, C = 24, hh = hTop;
      const L = (u, v, y) => pp(mx + dx * u - dz * v, y, mz + dz * u + dx * v);
      const tip = L(J, 0, hh + 1), back = L(-C, 0, hh + 1), top = L(0, 0, hh + 1);
      const rr = { w: 1.2, a: 0.95, passes: 1, over: 0.2, rough: 0.35 };
      seg(back[0], back[1], tip[0], tip[1], rr);
      for (let u = -C; u < J; u += 3.4) {
        const a = L(u, 0, hh + 1), b = L(u + 3.4, 0, hh + 1), c1 = L(u, 1.3, hh - 1.6), c2 = L(u + 3.4, 1.3, hh - 1.6), c3 = L(u, -1.3, hh - 1.6), c4 = L(u + 3.4, -1.3, hh - 1.6);
        seg(a[0], a[1], c2[0], c2[1], { w: 0.5, a: 0.85, passes: 1, over: 0, rough: 0.2 }); seg(c1[0], c1[1], b[0], b[1], { w: 0.5, a: 0.85, passes: 1, over: 0, rough: 0.2 });
        seg(a[0], a[1], c4[0], c4[1], { w: 0.5, a: 0.7, passes: 1, over: 0, rough: 0.2 }); seg(c3[0], c3[1], b[0], b[1], { w: 0.5, a: 0.7, passes: 1, over: 0, rough: 0.2 });
        seg(c1[0], c1[1], c3[0], c3[1], { w: 0.45, a: 0.7, passes: 1, over: 0, rough: 0.2 });
        seg(c1[0], c1[1], c2[0], c2[1], { w: 0.6, a: 0.85, passes: 1, over: 0, rough: 0.2 }); seg(c3[0], c3[1], c4[0], c4[1], { w: 0.6, a: 0.85, passes: 1, over: 0, rough: 0.2 });
      }
      // apex + pendants
      const apex = L(0, 0, hh + 13);
      seg(top[0], top[1], apex[0], apex[1], rr);
      [[J * 0.92], [J * 0.55], [-C * 0.9]].forEach(([u]) => { const p = L(u, 0, hh + 1); seg(apex[0], apex[1], p[0], p[1], { w: 0.6, a: 0.9, passes: 1, over: 0, rough: 0.2 }); });
      // counterweight & trolley cable + load
      const cw = L(-C * 0.85, 0, hh - 2), cw2 = L(-C * 0.85, 0, hh - 8);
      P.wash([cw, L(-C * 0.7, 0, hh - 2), L(-C * 0.7, 0, hh - 8), cw2], SLATE, 0.7, { edge: 0, steps: 2, jit: 0.3 });
      P.hatch([cw, L(-C * 0.7, 0, hh - 2), L(-C * 0.7, 0, hh - 8), cw2], { ang: 60, gap: 1.6, a: 0.7, w: 0.5 });
      const tr = L(J * 0.62, 0, hh - 1.2), ld = L(J * 0.62, 0, hh - 44);
      seg(tr[0], tr[1], ld[0], ld[1], { w: 0.7, a: 0.9, passes: 1, over: 0, rough: 0.2 });
      const lb = [L(J * 0.62 - 3.5, 1.5, hh - 44), L(J * 0.62 + 3.5, 1.5, hh - 44), L(J * 0.62 + 3.5, 1.5, hh - 50), L(J * 0.62 - 3.5, 1.5, hh - 50)];
      P.erase(lb); P.poly(lb, { w: 1, a: 0.95, rough: 0.2 }); P.hatch(lb, { ang: 40, gap: 1.6, a: 0.7, w: 0.45 });
    };
    gantry(138, 44, 152, 58, 0, 440, { bay: 9, pan: 2, w: 0.6, shadeSide: -1,
      decks: [[110, -1, 10, 4], [230, -1, 9, 4], [350, -1, 8, 3.5]], hoist: [139, 45, 20, 420] });
    craneAt(46, 14, 400, [-0.98, -0.2]);

    /* ------------------------------------------- 5  far half of the cloud ring, then the tower */
    const ringPts = (R, h, a0, a1, k, wob) => {
      const out = [];
      for (let i = 0; i <= k; i++) { const a = lerp(a0, a1, i / k), rr = R + Math.sin(a * 3 + wob) * 4, hh = h + Math.cos(a * 2 + wob) * 8; out.push([rr * Math.cos(a), hh, rr * Math.sin(a)]); }
      return out;
    };
    const ringTube = (R, h, a0, a1, Rt, wob, o = {}) => {
      const wp = ringPts(R, h, a0, a1, 18, wob), sp = wp.map(q => pp(q[0], q[1], q[2])), rd = wp.map(q => 760 * Rt / dep(q[0], q[1], q[2]));
      const nseg = o.nseg || 3, per = (sp.length - 1) / nseg;
      for (let s = 0; s < nseg; s++) {
        const i0 = Math.floor(s * per), i1 = Math.min(sp.length - 1, Math.ceil((s + 1) * per));
        tube(sp.slice(i0, i1 + 1), rd[i0], rd[i1], { hi: 3, k: 1.22 });
      }
    };
    ringTube(48, 150, 0.0, 1.0 * Math.PI, 8, 0.4, { nseg: 5 });      // far half, behind the tower
    items.forEach(it => it.fn());

    /* spire: telescoping steel sections */
    const spire = [[601, 6.6, 5.8], [636, 5.6, 4.7], [676, 4.4, 3.7], [714, 3.4, 2.8], [750, 2.6, 2.1], [782, 1.9, 1.5], [808, 1.25, 0.9], [828, 0.6, 0.2]];
    spire.forEach(([hb, r0, r1], k) => {
      const ht = k + 1 < spire.length ? spire[k + 1][0] + 1.5 : 830, N = 12;
      const faces = [];
      for (let i = 0; i < N; i++) {
        const a0 = i / N * TAU, a1 = (i + 1) / N * TAU, am = (a0 + a1) / 2;
        const nx = Math.cos(am), nz = Math.sin(am);
        if (nx * (0 - nx * r0) + nz * (-D - nz * r0) <= 0) continue;
        faces.push([a0, a1, nx * LDIR[0] + nz * LDIR[1]]);
      }
      faces.forEach(([a0, a1, lit]) => {
        const q = [pp(r0 * Math.cos(a0), hb, r0 * Math.sin(a0)), pp(r0 * Math.cos(a1), hb, r0 * Math.sin(a1)), pp(r1 * Math.cos(a1), ht, r1 * Math.sin(a1)), pp(r1 * Math.cos(a0), ht, r1 * Math.sin(a0))];
        P.erase(q);
        if (lit < 0.1) { slateWash(q, 0.55, { jit: 0.2 }); P.hatch(q, { ang: angOf(q[0], q[3]), gap: 1.5, w: 0.5, a: 0.8, inset: 0.2, ragged: 0.6 }); }
        else if (lit < 0.5) P.hatch(q, { ang: angOf(q[0], q[3]), gap: 2.4, w: 0.45, a: 0.55, inset: 0.2, ragged: 0.6 });
      });
      const l = pp(-r0, hb, 0), r = pp(r0, hb, 0), lt = pp(-r1, ht, 0), rt = pp(r1, ht, 0);
      const eo = { w: 1.15, a: 0.95, passes: 1, over: 0.2, rough: 0.25 };
      P.line(l[0], l[1], lt[0], lt[1], eo); P.line(r[0], r[1], rt[0], rt[1], eo);
      P.line(l[0] - 1.2, l[1], r[0] + 1.2, r[1], { w: 1.3, a: 1, passes: 1, over: 0, rough: 0.15 });
      P.line(lt[0] - 0.4, lt[1] + 1.5, l[0] - 0.4, l[1] - 1.5, { w: 0.7, a: 0.9, c: HI, passes: 1, over: 0, rough: 0.1 });
    });
    { const tp = pp(0, 830, 0); P.line(tp[0], tp[1], tp[0], tp[1] - 12, { w: 0.9, passes: 1, over: 0, rough: 0.1 }); P.circle(tp[0], tp[1] - 12, 1.6, { w: 0.8, passes: 1, rough: 0.1 });
      for (let a = 0; a < 6; a++) { const an = a / 6 * TAU; P.line(tp[0] + Math.cos(an) * 3.6, tp[1] - 12 + Math.sin(an) * 3.6, tp[0] + Math.cos(an) * 7.5, tp[1] - 12 + Math.sin(an) * 7.5, { c: HI, w: 0.8, a: 0.9, passes: 1, over: 0, rough: 0.1 }); } }

    /* -------------------------------- 6  near half of ring, hugging scaffold cages, mid clouds */
    ringTube(48, 150, 1.0 * Math.PI, 2.0 * Math.PI, 8, 0.4, { nseg: 5 });
    // climbing-scaffold cages hugging the wing tips
    [[0, 232, 274, 8], [1, 372, 424, 7], [2, 452, 492, 6], [0, 130, 168, 8.5]].forEach(([wi, y0, y1, hw]) => {
      const tp = tipPos(wi, (y0 + y1) / 2); if (!tp) return;
      const th = wingAng[wi], ux = Math.cos(th), uz = Math.sin(th);
      const cx = tp[0] + ux * 1.4, cz = tp[1] + uz * 1.4;
      lattice(cx - hw, cz - hw, cx + hw, cz + hw, y0, y1, { bay: 3.2, pan: 3, w: 0.6 });
      deck(cx - hw, cz - hw, cx + hw, cz + hw, y0, { joists: 8, a: 0.55 });
    });
    // window-washing cradle hanging from a roof rail on the big lit wing face
    { const wi = 2, th = wingAng[wi], cs = Math.cos(th), sn = Math.sin(th);
      const F = (u, y, dv) => { const v = (hwAt(u) + dv); return pp(u * cs - v * sn, y, u * sn + v * cs); };
      const hC = 84, hT = 120, uC = 20, wC = 5.2;
      const c0 = F(uC - wC, hC, 0.8), c1 = F(uC + wC, hC, 0.8), c2 = F(uC + wC, hC + 3.4, 0.8), c3 = F(uC - wC, hC + 3.4, 0.8);
      const r0 = F(uC - 12, hT, 0.9), r1 = F(uC + 12, hT, 0.9), t0 = F(uC - wC + 1, hT, 0.9), t1 = F(uC + wC - 1, hT, 0.9);
      P.line(r0[0], r0[1], r1[0], r1[1], { w: 1.6, a: 0.95, passes: 1, over: 0.3, rough: 0.3 });
      P.line(r0[0] + 2, r0[1] - 1, r1[0] + 2, r1[1] - 1, { w: 0.9, a: 0.95, c: HI, passes: 1, over: 0, rough: 0.2 });
      const tro = [t0, t1].map(q => [[q[0] - 3, q[1] - 2], [q[0] + 3, q[1] - 2], [q[0] + 3, q[1] + 2], [q[0] - 3, q[1] + 2]]);
      tro.forEach(q => { P.erase(q); P.poly(q, { w: 1, a: 0.95, rough: 0.2, passes: 1 }); });
      P.line(t0[0], t0[1] + 2, c3[0], c3[1], { w: 0.8, a: 0.95, passes: 1, over: 0, rough: 0.2 });
      P.line(t1[0], t1[1] + 2, c2[0], c2[1], { w: 0.8, a: 0.95, passes: 1, over: 0, rough: 0.2 });
      const cb = [c0, c1, c2, c3]; P.erase(cb); slateWash(cb, 0.45, { jit: 0.2 }); P.poly(cb, { w: 1.2, a: 0.95, rough: 0.2, passes: 1 });
      P.hatch(cb, { ang: angOf(c0, c3), gap: 1.6, a: 0.6, w: 0.45 });
      P.line(c3[0], c3[1] + 1.5, c2[0], c2[1] + 1.5, { w: 0.8, a: 0.95, c: HI, passes: 1, over: 0, rough: 0.2 });
      // the window washer
      const mx = (c0[0] + c1[0]) / 2, my = (c0[1] + c1[1]) / 2 - 1, sc = Math.max(0.7, Math.hypot(c1[0] - c0[0], c1[1] - c0[1]) / 46);
      P.circle(mx - 2 * sc, my - 15 * sc, 2.1 * sc, { w: 0.9, a: 0.95, passes: 1, rough: 0.1 }); P.dot(mx - 2 * sc, my - 15.2 * sc, 1.5 * sc, { a: 0.9 });
      P.line(mx - 2 * sc, my - 12.6 * sc, mx - 2 * sc, my - 5 * sc, { w: 1.4, a: 0.95, passes: 1, over: 0, rough: 0.1 });
      P.line(mx - 2 * sc, my - 11 * sc, mx + 4 * sc, my - 15 * sc, { w: 0.9, a: 0.95, passes: 1, over: 0, rough: 0.1 });
      P.line(mx + 4 * sc, my - 18 * sc, mx + 4 * sc, my - 12 * sc, { w: 1.2, a: 0.95, passes: 1, over: 0, rough: 0.1 });
      P.line(mx - 2 * sc, my - 5 * sc, mx - 4 * sc, my, { w: 0.9, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(mx - 2 * sc, my - 5 * sc, mx, my, { w: 0.9, a: 0.95, passes: 1, over: 0, rough: 0.1 });
      // clean strip already washed: a few white pen streaks
      for (let k = 0; k < 4; k++) { const q = F(uC - wC + 1 + k * 2.4, hC - 14, 0.05), r = F(uC - wC + 1 + k * 2.4, hC - 2, 0.05); P.line(q[0], q[1], r[0], r[1], { w: 0.8, a: 0.8, c: HI, passes: 1, over: 0, rough: 0.2 }); }
    }
    // antenna arrays on the roofs of the wings
    [0, 1, 2].forEach(wi => {
      const u = Math.max(9.5, ueAt(wi, TH[wi] - 1) * 0.6), th = wingAng[wi];
      const x = Math.cos(th) * u, z = Math.sin(th) * u, base = pp(x, TH[wi], z);
      const hgt = 12 + wi * 3;
      const tp = pp(x, TH[wi] + hgt, z);
      P.line(base[0], base[1], tp[0], tp[1], { w: 1, a: 0.95, passes: 1, over: 0, rough: 0.15 });
      for (let k = 1; k <= 3; k++) { const q = pp(x, TH[wi] + hgt * (0.35 + 0.22 * k), z), wd = 5.5 - k * 1.2; P.line(q[0] - wd, q[1], q[0] + wd, q[1], { w: 0.8, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(q[0] - wd, q[1], q[0] - wd, q[1] + 2, { w: 0.6, a: 0.9, passes: 1, over: 0 }); P.line(q[0] + wd, q[1], q[0] + wd, q[1] + 2, { w: 0.6, a: 0.9, passes: 1, over: 0 }); }
      P.dot(tp[0], tp[1] - 1, 1.5, { c: RED, a: 0.95 });
    });
    cumulus(1262, 322, 130, { n: 3 });
    cumulus(950, 905, 190, { n: 4, rise: 0.2 });
    cumulus(690, 118, 150, { n: 3 });

    /* ------------------------------------------- 7  foreground gantries, left & right */
    gantry(-86, -54, -70, -38, 0, 330, { bay: 7, pan: 2, w: 0.8, shadeSide: 1,
      dark: (x, y) => 0.6,
      decks: [[70, 1, 15, 5], [132, 1, 11, 4.5], [204, 1, 16, 5], [272, 1, 9, 4]], hoist: [-69, -39, 20, 310] });
    gantry(58, -8, 72, 6, 0, 290, { bay: 7, pan: 2, w: 0.8, shadeSide: -1,
      dark: (x, y) => 0.75,
      decks: [[96, -1, 13, 5], [166, -1, 10, 4.5], [236, -1, 14, 5]], hoist: [59, -7, 10, 270] });
    /* ------------------------------------------- 8  low haze puffs at the bottom */
    cumulus(170, 1000, 330, { n: 5, rise: 0.3 });
    cumulus(1450, 1000, 380, { n: 6, rise: 0.3 });
    cumulus(770, 1030, 260, { n: 4, rise: 0.25 });
    cumulus(1110, 1020, 230, { n: 4, rise: 0.25 });

    /* ================================================================ 9  overlays: orbit + trajectory (B), callouts (D), notes */
    const leader = (x1, y1, x2, y2, o = {}) => {
      const mx = lerp(x1, x2, 0.5) + P.r(-5, 5), my = lerp(y1, y2, 0.5) + P.r(-5, 5);
      P.curve([[x1, y1], [mx, my], [x2, y2]], { w: 2.6, c: HI, a: 0.5, rough: 0.25 });
      P.curve([[x1, y1], [mx, my], [x2, y2]], { w: 0.85, c: INK, a: 0.95, rough: 0.25 });
      P.dot(x2, y2, 2, { c: INK, a: 0.95 }); P.circle(x2, y2, 4, { w: 0.7, c: HI, a: 0.9, passes: 1, rough: 0.2 });
    };
    /* --- B: sun path (top-left) --- */
    { const cx = 330, cy = 860, R = 690, a0 = -118 * Math.PI / 180, a1 = -62 * Math.PI / 180;
      P.arcTicks(cx, cy, R, a0, a1, 3 * Math.PI / 180, 5, { c: HI, a: 0.85, len: 9, w: 0.8 });
      P.arcTicks(cx, cy, R - 14, a0, a1, 15 * Math.PI / 180, 1, { c: HI, a: 0.6, len: 6, w: 0.6 });
      P.arc(cx, cy, R + 24, R + 24, a0, a1, { c: HI, w: 0.5, a: 0.5, passes: 1, rough: 0.4 });
      for (let k = 0; k <= 4; k++) { const an = a0 + k * 15 * Math.PI / 180 + 0.02; if (an > a1) break; P.text(String(11 + k), cx + Math.cos(an) * (R - 32), cy + Math.sin(an) * (R - 32) + 4, { size: 11, c: HI, a: 0.9, align: 'center', rot: an + Math.PI / 2 }); }
      const sa = -76 * Math.PI / 180, sx = cx + Math.cos(sa) * R, sy = cy + Math.sin(sa) * R;
      P.erase(blob(sx, sy, 58, 58, 1, 20));
      P.circle(sx, sy, 12, { w: 1.2, c: INK, a: 0.95, passes: 1 });
      P.hatch(blob(sx, sy, 22, 22, 1, 12), { ang: 45, gap: 2.4, w: 0.5, a: 0.7 });
      for (let k = 0; k < 16; k++) { const an = k / 16 * TAU, l = k % 2 ? 6 : 11; P.line(sx + Math.cos(an) * 17, sy + Math.sin(an) * 17, sx + Math.cos(an) * (17 + l), sy + Math.sin(an) * (17 + l), { w: 0.9, a: 0.95, passes: 1, over: 0, rough: 0.15 }); }
      // shadow line from the sun through the spire tip
      const tp = pp(0, 828, 0);
      P.dashed(sx + 30, sy + 22, tp[0] - 6, tp[1] - 2, [10, 6], { w: 0.7, c: HI, a: 0.75 });
      tag('SUN 11:40', sx - 30, sy - 36, undefined, undefined, { size: 12, align: 'center' });
    }
    /* --- B: orbit construction circles round the spire and the red BASE-jump path --- */
    const circ3 = (R, h, a0, a1, k) => { const o = []; for (let i = 0; i <= k; i++) { const a = lerp(a0, a1, i / k); o.push(pp(R * Math.cos(a), h, R * Math.sin(a))); } return o; };
    [[26, 740], [34, 610], [44, 470], [58, 330], [74, 210]].forEach(([R, h], ci) => {
      const pts = circ3(R, h, 0, TAU, 72);
      P.path(pts.map(q => q.slice()), { w: 0.7, a: 0.75, c: HI, passes: 1, rough: 0.3, closed: true });
      for (let d = 0; d < 360; d += 15) {
        const a = d * Math.PI / 180, l = d % 90 === 0 ? 6 : 3;
        const A = pp(R * Math.cos(a), h, R * Math.sin(a)), B = pp((R + l * 0.9) * Math.cos(a), h, (R + l * 0.9) * Math.sin(a));
        seg(A[0], A[1], B[0], B[1], { w: 0.6, a: 0.8, c: HI, passes: 1, over: 0, rough: 0.1 });
      }
    });
    { // axis
      const A = pp(0, 0, 0), B = pp(0, 900, 0);
      P.dashed(B[0], B[1] - 14, A[0], Math.min(1000, A[1]), [14, 7, 2, 7], { w: 0.6, c: HI, a: 0.6 });
    }
    const jump = []; const NJ = 150;
    for (let i = 0; i <= NJ; i++) {
      const u = i / NJ, h = 826 - 440 * Math.pow(u, 0.95), r = 9 + 62 * Math.pow(u, 0.75), a = 1.75 * Math.PI + u * 2.25 * TAU;
      const x = r * Math.cos(a), z = r * Math.sin(a); jump.push({ p: pp(x, h, z), front: z < 0, h });
    }
    const jumpEnd = [1112, 452];
    { const last = jump[jump.length - 1].p, pre = jump[jump.length - 6].p;
      const ex = last[0] - pre[0], ey = last[1] - pre[1];
      const glide = P.sample([last, [last[0] + ex * 3, last[1] + ey * 3 + 10], [(last[0] + jumpEnd[0]) / 2 + 30, (last[1] + jumpEnd[1]) / 2 - 20], jumpEnd], false, 6);
      for (let i = 0; i + 1 < jump.length; i++) {
        const A = jump[i].p, B = jump[i + 1].p, fr = jump[i].front;
        if (fr) { seg(A[0], A[1], B[0], B[1], { w: 3.4, c: '#f0d29c', a: 0.55, passes: 1, over: 0, rough: 0.1 }); }
      }
      // halo first, then the red line: solid in front of the tower, dashed behind
      for (let i = 0; i + 1 < jump.length; i++) {
        const A = jump[i].p, B = jump[i + 1].p, fr = jump[i].front;
        if (fr) seg(A[0], A[1], B[0], B[1], { w: 2.1, c: RED, a: 0.97, passes: 1, over: 0, rough: 0.2 });
        else if (i % 2 === 0) seg(A[0], A[1], B[0], B[1], { w: 1.5, c: RED, a: 0.9, passes: 1, over: 0, rough: 0.2 });
      }
      P.path(glide, { w: 3.4, c: '#f0d29c', a: 0.55, rough: 0.2 });
      P.path(glide, { w: 2.1, c: RED, a: 0.97, rough: 0.25 });
      // height marks every 100 m along the path
      let nextH = 700;
      jump.forEach((q, i) => {
        if (q.h <= nextH && i > 0 && i + 1 < jump.length) {
          const A = jump[i - 1].p, B = jump[i + 1].p, tx = B[0] - A[0], ty = B[1] - A[1], tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
          P.line(q.p[0] - nx * 6, q.p[1] - ny * 6, q.p[0] + nx * 6, q.p[1] + ny * 6, { w: 1.4, c: RED, a: 1, passes: 1, over: 0, rough: 0.1 });
          if (q.front && nextH % 200 === 0 && nextH < 700) tag(String(nextH), q.p[0] + nx * 22, q.p[1] + ny * 22 + 4, undefined, undefined, { size: 10, align: 'center', c: RED });
          nextH -= 100;
        }
      });
      // start marker
      const st = jump[0].p; P.circle(st[0], st[1], 5, { w: 1.4, c: RED, a: 1, passes: 1 }); P.dot(st[0], st[1], 1.8, { c: RED, a: 1 });
      // canopy + jumper at the landing end
      const [kx, ky] = jumpEnd;
      P.erase(blob(kx, ky - 6, 84, 60, 1, 18));
      P.arc(kx, ky - 22, 30, 15, Math.PI, TAU, { w: 1.8, c: RED, a: 1, passes: 1, rough: 0.3 });
      P.line(kx - 30, ky - 22, kx + 30, ky - 22, { w: 1.2, c: RED, a: 0.95, passes: 1, over: 0, rough: 0.2 });
      for (let k = -2; k <= 2; k++) P.curve([[kx + k * 6.5, ky - 22 - 14 * Math.cos(k * 0.36)], [kx + k * 7.5, ky - 20], [kx + k * 7.8, ky - 18]], { w: 0.7, c: RED, a: 0.85, rough: 0.2 });
      P.hatch([[kx - 28, ky - 24], [kx + 28, ky - 24], [kx + 20, ky - 32], [kx - 20, ky - 32]], { ang: 60, gap: 2, c: RED, a: 0.6, w: 0.5 });
      [-1, 1].forEach(sg => P.line(kx + sg * 28, ky - 22, kx + sg * 1.5, ky + 4, { w: 0.6, a: 0.85, passes: 1, over: 0, rough: 0.1 }));
      P.circle(kx, ky + 7, 2.3, { w: 1, a: 0.95, passes: 1, rough: 0.1 }); P.line(kx, ky + 9.5, kx, ky + 18, { w: 1.3, a: 0.95, passes: 1, over: 0, rough: 0.1 });
      P.line(kx, ky + 12, kx - 5, ky + 8, { w: 0.9, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(kx, ky + 12, kx + 5, ky + 8, { w: 0.9, a: 0.95, passes: 1, over: 0, rough: 0.1 });
      P.line(kx, ky + 18, kx - 3, ky + 26, { w: 0.9, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(kx, ky + 18, kx + 3, ky + 26, { w: 0.9, a: 0.95, passes: 1, over: 0, rough: 0.1 });
      tag('BASE JUMP  828 M  >  0', kx, ky + 50, undefined, undefined, { size: 12, align: 'center', c: RED });
    }

    /* --- hot-air balloon below the upper floors, and birds --- */
    { const bx = 498, by = 498, r = 34;
      P.erase(blob(bx, by + 14, r * 2.2, r * 3.1, 1, 20));
      const env = [];
      for (let i = 0; i <= 32; i++) { const a = -Math.PI * 0.5 + i / 32 * TAU; let rr = r; const dn = Math.sin(a); const px = bx + Math.cos(a) * rr * (dn > 0.2 ? 1 - (dn - 0.2) * 0.85 : 1), py = by + dn * rr * (dn > 0 ? 1.18 : 1); env.push([px, py]); }
      P.wash(env, WARM, 0.35, { edge: 0, steps: 2, jit: 0.4 });
      const gore = (k) => { const q = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI; q.push([bx + Math.cos(a) * r * k * (i > 7 ? 1 - (i - 7) * 0.17 : 1), by + Math.sin(a) * r * (a > 0 ? 1.18 : 1)]); } return q; };
      [-0.72, -0.4, 0, 0.4, 0.72].forEach((k, i) => { const q = []; for (let j = 0; j <= 12; j++) { const t = j / 12, a = -Math.PI / 2 + t * Math.PI; q.push([bx + k * r * Math.sin(a + Math.PI / 2 * 0) * Math.sin(Math.PI * t) * (1 - 0.72 * Math.max(0, t - 0.65) / 0.35), by + (-Math.cos(Math.PI * t)) * r * (t > 0.5 ? 1.18 : 1)]); } P.curve(q, { w: 0.8, a: 0.85, rough: 0.2 }); });
      P.path(env, { w: 1.4, a: 0.95, rough: 0.3, closed: true });
      // striped gores
      [[-0.72, -0.4], [0, 0.4]].forEach(([k0, k1]) => { const poly = []; for (let j = 0; j <= 10; j++) { const t = j / 10, sn = Math.sin(Math.PI * t) * (1 - 0.72 * Math.max(0, t - 0.65) / 0.35), yy = by + (-Math.cos(Math.PI * t)) * r * (t > 0.5 ? 1.18 : 1); poly.push([bx + k0 * r * sn, yy]); } for (let j = 10; j >= 0; j--) { const t = j / 10, sn = Math.sin(Math.PI * t) * (1 - 0.72 * Math.max(0, t - 0.65) / 0.35), yy = by + (-Math.cos(Math.PI * t)) * r * (t > 0.5 ? 1.18 : 1); poly.push([bx + k1 * r * sn, yy]); } slateWash(poly, 0.5, { jit: 0.2 }); P.hatch(poly, { ang: 80, gap: 2, w: 0.5, a: 0.7, inset: 0.5 }); });
      P.arc(bx - r * 0.35, by - r * 0.35, r * 0.5, r * 0.5, 3.6, 4.7, { c: HI, w: 1.2, a: 0.95, passes: 1, rough: 0.2 });
      // ropes + basket + burner
      const nb = [bx - 7, by + r * 1.05]; const nb2 = [bx + 7, by + r * 1.05];
      P.line(nb[0], nb[1], bx - 8, by + r * 1.05 + 14, { w: 0.6, a: 0.9, passes: 1, over: 0 }); P.line(nb2[0], nb2[1], bx + 8, by + r * 1.05 + 14, { w: 0.6, a: 0.9, passes: 1, over: 0 });
      P.rect(bx - 9, by + r * 1.05 + 14, 18, 10, { w: 1, a: 0.95, rough: 0.15, passes: 1 }); P.hatch(rectP(bx - 9, by + r * 1.05 + 14, 18, 10), { ang: 20, gap: 1.6, w: 0.45, a: 0.8, cross: 90 });
      [-4, 1, 6].forEach(o => { P.circle(bx + o, by + r * 1.05 + 12, 1.5, { w: 0.7, a: 0.9, passes: 1, rough: 0.1 }); });
      P.line(bx, by + r * 1.05 + 1, bx, by + r * 1.05 + 9, { w: 0.6, a: 0.9, passes: 1, over: 0 });
      P.dot(bx, by + r * 1.05 + 4, 1.6, { c: RED, a: 0.95 });
    }
    [[610, 428, 1], [634, 412, 0.8], [588, 408, 0.9], [652, 440, 0.7], [1010, 352, 1], [1036, 366, 0.8], [988, 372, 0.8], [402, 470, 0.8], [384, 486, 0.7], [1140, 560, 0.9], [1160, 546, 0.7]].forEach(([x, y, sc]) => bird(x, y, sc * 1.15, { c: HI, a: 0.95 }));
    { const bx = 700, by = 180; bird(bx, by, 1.3, { c: INK, a: 0.95 }); bird(bx + 18, by - 12, 1.1, { c: INK, a: 0.95 }); bird(bx - 16, by - 9, 1, { c: INK, a: 0.95 }); }

    /* --- D-style circled callouts on paper-coloured erased discs --- */
    const discPoly = (cx, cy, r) => { const a = []; for (let i = 0; i < 44; i++) a.push([cx + Math.cos(i / 44 * TAU) * r, cy + Math.sin(i / 44 * TAU) * r]); return a; };
    const callout = (cx, cy, r, letter, title) => {
      P.erase(discPoly(cx, cy, r + 7));
      P.circle(cx, cy, r + 4, { w: 1.6, a: 0.95, passes: 1, rough: 0.3 }); P.circle(cx, cy, r, { w: 0.6, a: 0.7, passes: 1, rough: 0.3 });
      P.erase(discPoly(cx - r * 0.72, cy - r * 0.72, 11)); P.circle(cx - r * 0.72, cy - r * 0.72, 11, { w: 1.2, passes: 1, rough: 0.2 });
      P.text(letter, cx - r * 0.72, cy - r * 0.72 + 5, { size: 14, align: 'center', a: 0.95 });
      if (title) tag(title, cx, cy + r + 24, undefined, undefined, { size: 12, align: 'center' });
    };
    const th = { w: 0.7, a: 0.9, passes: 1, rough: 0.2 };

    /* A: spire telescoping joints */
    { const cx = 1400, cy = 190, r = 90;
      callout(cx, cy, r, 'A', 'SPIRE  TELESCOPING JOINTS');
      const K = 1.3, secs = [[20, 17.2], [17.2, 14.6], [14.6, 12], [12, 9.8], [9.8, 7.6], [7.6, 5.6], [5.6, 3.6], [3.6, 2.2]].map(q => q.map(v => v * K * 0.85));
      let yb = cy + 70; const sh = 17;
      secs.forEach(([w0, w1], k) => {
        const yt = yb - sh;
        const L = [[cx - w0, yb], [cx + w0, yb], [cx + w1, yt], [cx - w1, yt]];
        P.poly(L, { w: 1.1, a: 0.95, rough: 0.25, passes: 1, over: 0.2 });
        P.hatch([[cx + w0 * 0.2, yb], [cx + w0, yb], [cx + w1, yt], [cx + w1 * 0.2, yt]], { ang: 90 - 2, gap: 1.7, w: 0.5, a: 0.8, inset: 0.4, ragged: 0.6 });
        P.hatch([[cx + w0 * 0.55, yb], [cx + w0, yb], [cx + w1, yt], [cx + w1 * 0.55, yt]], { ang: 60, gap: 2.2, w: 0.45, a: 0.6, inset: 0.4, ragged: 0.6 });
        P.line(cx - w0 * 0.55, yb - 1, cx - w1 * 0.55, yt + 1, { w: 0.8, c: HI, a: 0.95, passes: 1, over: 0, rough: 0.1 });
        // joint collar with bolts
        P.rect(cx - w1 - 2.6, yt - 1.6, (w1 + 2.6) * 2, 3.4, { w: 0.9, a: 0.95, rough: 0.15, passes: 1 });
        for (let b = -2; b <= 2; b++) P.dot(cx + b * (w1 + 1) / 2.2, yt + 0.1, 0.7, { a: 0.9 });
        if (k < 3) { // cut-away: hollow steel tube with ladder and bracing
          const iw = w0 * 0.42;
          P.erase([[cx - w0 * 0.85, yb - 2], [cx - w0 * 0.1, yb - 2], [cx - w1 * 0.1, yt + 2], [cx - w1 * 0.85, yt + 2]]);
          P.line(cx - iw * 1.9, yb - 2, cx - iw * 1.55, yt + 2, th); P.line(cx - iw * 0.3, yb - 2, cx - iw * 0.2, yt + 2, th);
          for (let q = 0; q < 4; q++) { const y0 = yb - 3 - q * 4; P.line(cx - iw * 1.85, y0, cx - iw * 0.3, y0 - 2, { w: 0.4, a: 0.7, passes: 1, over: 0, rough: 0.1 }); P.line(cx - iw * 0.3, y0, cx - iw * 1.85, y0 - 2, { w: 0.4, a: 0.7, passes: 1, over: 0, rough: 0.1 }); }
        }
        yb = yt;
      });
      // pinnacle + aircraft light
      P.line(cx, yb - 1, cx, yb - 12, { w: 0.9, a: 0.95, passes: 1, over: 0 }); P.circle(cx, yb - 14, 2, { w: 0.9, a: 0.95, passes: 1 }); P.dot(cx, yb - 14, 1.1, { c: RED, a: 1 });
      for (let k = 0; k < 8; k++) { const an = k / 8 * TAU; P.line(cx + Math.cos(an) * 4.5, yb - 14 + Math.sin(an) * 4.5, cx + Math.cos(an) * 8, yb - 14 + Math.sin(an) * 8, { w: 0.6, a: 0.9, passes: 1, over: 0, rough: 0.1 }); }
      // diameters, height dimension
      P.text('D 6.6 M', cx - 32, cy + 66, { size: 11, align: 'right', a: 0.9 });
      P.text('D 0.4 M', cx + 14, yb + 7, { size: 11, a: 0.9 }); P.line(cx + 12, yb + 3, cx + 4, yb + 1, th);
      P.dim(cx + 62, cy + 62, cx + 62, cy - 60, '227 M', -8, { size: 11 });
      // enlarged joint (D-style zoom inset)
      { const zx = cx + 38, zy = cy + 34, zr = 21;
        P.erase(discPoly(zx, zy, zr + 3)); P.circle(zx, zy, zr, { w: 1.2, a: 0.95, passes: 1, rough: 0.2 });
        P.circle(zx, zy, zr * 0.66, { w: 0.9, a: 0.9, passes: 1, rough: 0.2 }); P.circle(zx, zy, zr * 0.36, { w: 0.9, a: 0.9, passes: 1, rough: 0.2 });
        P.hatch(discPoly(zx, zy, zr * 0.62), { ang: 40, gap: 1.8, w: 0.45, a: 0.7, inset: zr * 0.36 });
        for (let k = 0; k < 8; k++) { const an = k / 8 * TAU + 0.2; P.dot(zx + Math.cos(an) * zr * 0.81, zy + Math.sin(an) * zr * 0.81, 1.1, { a: 0.95 }); }
        P.line(cx + 12, cy + 22, zx - zr * 0.7, zy - zr * 0.7, { w: 0.5, a: 0.7, passes: 1, over: 0 });
        P.text('COLLAR', zx + 2, zy + zr + 13, { size: 10, align: 'center', a: 0.9 }); }
      leader(cx - r - 6, cy - 8, pp(0, 700, 0)[0] + 4, pp(0, 700, 0)[1], {});
      // tonal swatches
      const sw = [0, 8, 4.5, 2.6, 1.9];
      sw.forEach((g, k) => { const x = cx - 60 + k * 26, y = cy + r + 40; P.erase(rectP(x - 1, y - 1, 24, 14)); P.rect(x, y, 22, 12, { w: 0.8, a: 0.9, rough: 0.2, passes: 1, over: 0 });
        if (g) P.hatch(rectP(x, y, 22, 12), { ang: 60 - k * 6, gap: g, w: 0.45, a: 0.7, inset: 0.4, cross: k > 2 ? 60 : undefined });
        if (k === 4) slateWash(rectP(x, y, 22, 12), 0.55, { jit: 0.2 }); });
    }

    /* B: vertical-city cut-away */
    { const cx = 1395, cy = 560, r = 118;
      callout(cx, cy, r, 'B', 'A CITY ON END  -  LEVELS 122 TO 126');
      const U = (u) => cx + u, V = (v) => cy + v, ln = (u1, v1, u2, v2, o = th) => P.line(U(u1), V(v1), U(u2), V(v2), o);
      // sky outside the façade: light hatch, clipped to the disc
      { const a0 = Math.acos(-46 / (r - 2)), poly = []; for (let i = 0; i <= 24; i++) { const an = a0 + (TAU - 2 * a0) * i / 24; poly.push([cx + Math.cos(an) * (r - 2), cy + Math.sin(an) * (r - 2)]); }
        P.hatch(poly, { ang: 63, gap: 3.4, w: 0.45, a: 0.45, inset: 0.5, ragged: 2 }); }
      // floor slabs
      const slabs = [[-106, 50], [-56, 104], [-6, 112], [44, 108], [94, 70]];
      slabs.forEach(([v, u1], i) => {
        const u0 = i === 1 ? -98 : i === 2 ? -74 : -46;
        P.rect(U(u0), V(v) - 1.6, u1 - u0, 3.6, { w: 0.9, a: 0.95, rough: 0.15, passes: 1, over: 0 });
        P.hatch(rectP(U(u0), V(v) - 1.6, u1 - u0, 3.6), { ang: 0, gap: 1.3, w: 0.45, a: 0.8, inset: 0.3 });
      });
      // façade: double mullion line with transoms
      ln(-46, -106, -46, 94, { w: 1.3, a: 0.95, passes: 1, over: 0, rough: 0.2 }); ln(-50, -104, -50, 92, { w: 0.6, a: 0.8, passes: 1, over: 0, rough: 0.2 });
      for (let v = -104; v < 94; v += 6.2) ln(-50, v, -46, v, { w: 0.4, a: 0.7, passes: 1, over: 0, rough: 0.1 });
      // row 1: observation deck  --  people at the glass, one waving from the balcony
      [[-33, 1], [-19, 0.9], [-3, 1], [16, 0.95]].forEach(([u, s]) => { const x = U(u), y = V(-56) - 2; P.circle(x, y - 22 * s, 2.6 * s, th); P.line(x, y - 19 * s, x, y - 8 * s, { w: 1.2, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(x, y - 8 * s, x - 3, y, th); P.line(x, y - 8 * s, x + 3, y, th); P.line(x, y - 16 * s, x - 5 * s, y - 10 * s, th); P.line(x, y - 16 * s, x + 5 * s, y - 10 * s, th); });
      ln(-96, -56, -96, -74, { w: 0.9, a: 0.95, passes: 1, over: 0, rough: 0.1 }); ln(-96, -74, -50, -74, { w: 0.9, a: 0.95, passes: 1, over: 0, rough: 0.1 });
      for (let u = -94; u < -50; u += 5) ln(u, -74, u, -58, { w: 0.4, a: 0.8, passes: 1, over: 0, rough: 0.1 });
      P.erase(blob(U(-74), V(-84), 30, 34, 1, 12));
      { const x = U(-74), y = V(-58);
        P.circle(x, y - 24, 3.2, { w: 1, a: 0.95, passes: 1, rough: 0.1 }); P.line(x, y - 20.5, x, y - 9, { w: 1.6, a: 0.95, passes: 1, over: 0, rough: 0.1 });
        P.line(x, y - 9, x - 3.5, y, th); P.line(x, y - 9, x + 3.5, y, th); P.line(x, y - 17, x - 6, y - 10, th);
        P.line(x, y - 17, x + 7, y - 26, { w: 0.9, a: 0.95, passes: 1, over: 0, rough: 0.1 });         // waving arm
        P.arc(x + 9, y - 28, 4, 5, -1.9, 0.4, { w: 0.6, a: 0.85, passes: 1, rough: 0.1 }); P.arc(x + 9, y - 28, 7, 8, -1.9, 0.4, { w: 0.5, a: 0.7, passes: 1, rough: 0.1 });
      }
      // row 2: sky garden with trees
      [[-63, -6, 0.75], [-26, -6, 1], [8, -6, 1.1], [42, -6, 0.95], [76, -6, 1]].forEach(([u, v, s], i) => {
        const x = U(u), y = V(v) - 2;
        P.line(x, y, x, y - 18 * s, { w: 1.5, a: 0.95, passes: 1, over: 0, rough: 0.2 });
        P.line(x, y - 9 * s, x + 6 * s, y - 15 * s, th); P.line(x, y - 7 * s, x - 5 * s, y - 13 * s, th);
        const cw = 26 * s, ch = 22 * s;
        P.erase(blob(x, y - 26 * s, cw + 4, ch + 4, 1, 12));
        const out = P.cloud(x, y - 26 * s, cw, ch, { hi: HI, c: INK, lobes: 8, inner: 1, w: 0.9, gap: 2, r: 4 * s });
        P.rect(x - 7 * s, y - 2, 14 * s, 4, { w: 0.8, a: 0.9, rough: 0.15, passes: 1, over: 0 });
      });
      tag('SKY GARDEN', U(-6), V(-24), undefined, undefined, { size: 11, align: 'center' });
      P.erase(rectP(U(-46), V(-56) - 8, 4, 4));
      // row 3 + 4: apartments with lit windows
      [[-6, 44], [44, 94]].forEach(([v0, v1], ri) => {
        const parts = [-46, 6, 60, 112];
        for (let k = 0; k < 3; k++) {
          const u0 = parts[k] + 1, u1 = parts[k + 1] - 1;
          ln(u1 + 1, v0 + 2, u1 + 1, v1 - 2, { w: 0.9, a: 0.9, passes: 1, over: 0, rough: 0.1 });
          const on = (k + ri * 2) % 3 !== 1;
          if (on) { const q = rectP(U(u0 + 6), V(v0 + 8), (u1 - u0) - 12, 26); P.wash(q, WARM, 0.9, { edge: 0, steps: 1, jit: 0.2 }); P.hatch(q, { ang: 80, gap: 4, a: 0.25, w: 0.4 }); P.rect(U(u0 + 6), V(v0 + 8), (u1 - u0) - 12, 26, { w: 0.8, a: 0.95, rough: 0.15, passes: 1, over: 0 }); ln(u0 + 6 + ((u1 - u0) - 12) / 2, v0 + 8, u0 + 6 + ((u1 - u0) - 12) / 2, v0 + 34, { w: 0.5, a: 0.8, passes: 1, over: 0, rough: 0.1 }); }
          else { P.hatch(rectP(U(u0 + 6), V(v0 + 8), (u1 - u0) - 12, 26), { ang: 70, gap: 2, w: 0.5, a: 0.6, inset: 0.3, cross: 40 }); P.rect(U(u0 + 6), V(v0 + 8), (u1 - u0) - 12, 26, { w: 0.8, a: 0.95, rough: 0.15, passes: 1, over: 0 }); }
          // furniture: sofa + lamp + plant
          const fx = U(u0 + 8 + k * 3), fy = V(v1) - 3;
          P.rrect(fx, fy - 8, 20, 8, 2, { w: 0.8, a: 0.9, passes: 1 }); P.line(fx, fy - 8, fx, fy - 13, th); P.line(fx + 20, fy - 8, fx + 20, fy - 13, th);
          P.line(fx + 30, fy, fx + 30, fy - 14, { w: 0.6, a: 0.9, passes: 1, over: 0 }); P.circle(fx + 30, fy - 16, 2.5, { w: 0.7, a: 0.9, passes: 1 });
          P.dot(U((u0 + u1) / 2), V(v0) + 6, 1.6, { c: '#f4dda0', a: 1 });
          if ((k + ri) % 2 === 0) { const px = fx + 42; P.circle(px, fy - 14, 2.2, th); P.line(px, fy - 12, px, fy - 5, { w: 1, a: 0.95, passes: 1, over: 0 }); P.line(px, fy - 5, px - 2, fy, th); P.line(px, fy - 5, px + 2, fy, th); }
        }
      });
      // window-washer cradle hanging from the terrace slab
      { const c1 = -68, c2 = -52, top = -4, cyv = 56;
        ln(-72, top, -72, top - 2, th); P.rect(U(-74), V(top) + 1, 26, 3, { w: 0.9, a: 0.95, rough: 0.1, passes: 1, over: 0 });
        ln(c1, top + 4, c1, cyv, { w: 0.7, a: 0.95, passes: 1, over: 0, rough: 0.1 }); ln(c2, top + 4, c2, cyv, { w: 0.7, a: 0.95, passes: 1, over: 0, rough: 0.1 });
        P.erase(rectP(U(c1 - 3), V(cyv - 1), 22, 12));
        P.rect(U(c1 - 3), V(cyv), 22, 9, { w: 1, a: 0.95, rough: 0.15, passes: 1, over: 0 }); P.hatch(rectP(U(c1 - 3), V(cyv), 22, 9), { ang: 70, gap: 1.6, a: 0.6, w: 0.45 });
        const x = U(-59), y = V(cyv);
        P.circle(x, y - 15, 2.5, th); P.line(x, y - 12.5, x, y - 3, { w: 1.4, a: 0.95, passes: 1, over: 0, rough: 0.1 }); P.line(x, y - 10, x + 8, y - 12, th); P.line(x + 8, y - 16, x + 8, y - 9, { w: 1.1, a: 0.95, passes: 1, over: 0, rough: 0.1 });
        P.line(U(-72), V(cyv) - 18, U(-72), V(cyv) - 6, { w: 0.0001, a: 0, passes: 1 });
      }
      // one bird outside + a wisp of cloud
      bird(U(-92), V(14), 1.1, { c: INK, a: 0.95 }); bird(U(-82), V(26), 0.8, { c: INK, a: 0.95 });
      tag('LEVEL 124', U(-72), V(-92), undefined, undefined, { size: 11, align: 'center' });
      leader(cx - r - 4, cy - 30, pp(tipPos(2, 451)[0], 452, tipPos(2, 451)[1])[0], pp(tipPos(2, 451)[0], 452, tipPos(2, 451)[1])[1], {});
    }

    /* C: the Y plan */
    { const cx = 185, cy = 728, r = 82;
      callout(cx, cy, r, 'C', 'Y  PLAN  -  TYPICAL FLOOR');
      const pl = planOf([40, 40, 40]).map(q => q.p), sc = 1.5;
      const pts = pl.map(([x, z]) => [cx + x * sc, cy + z * sc - 2]);
      // ring scale round the disc
      P.arcTicks(cx, cy, r - 8, 0, TAU - 0.01, 10 * Math.PI / 180, 3, { len: 5, w: 0.6, a: 0.8 });
      P.poly(pts, { w: 1.5, a: 0.97, rough: 0.25, over: 0.3 });
      const cen = [cx, cy - 2], ins = pts.map(q => [lerp(cen[0], q[0], 0.9), lerp(cen[1], q[1], 0.9)]);
      P.poly(ins, { w: 0.6, a: 0.7, rough: 0.2, passes: 1 });
      wingAng.forEach((th2, i) => {
        const c = Math.cos(th2), sn = Math.sin(th2), W = (u, v) => [cx + (u * c - v * sn) * sc, cy - 2 + (u * sn + v * c) * sc];
        const poly = [W(12, -10), W(38, -5.5), W(38, 5.5), W(12, 10)];
        P.hatch(poly, { ang: 40 + i * 25, gap: 3.2, w: 0.45, a: 0.5, inset: 0.6, ragged: 1.5 });
        for (let u = 14; u < 38; u += 4.5) { const hw = hwAt(u) * 0.86; const a = W(u, -hw), b = W(u, hw); P.line(a[0], a[1], b[0], b[1], { w: 0.4, a: 0.55, passes: 1, over: 0, rough: 0.15 }); }
        const e0 = W(12, 0), e1 = W(38, 0); P.line(e0[0], e0[1], e1[0], e1[1], { w: 0.4, a: 0.5, passes: 1, over: 0, rough: 0.15 });
        [-1, 1].forEach(sg => [18, 27, 35].forEach(u => { const q = W(u, sg * hwAt(u) * 0.86); P.dot(q[0], q[1], 1, { a: 0.9 }); }));
        const tp = W(41, 0); P.circle(tp[0], tp[1], 2.2, { w: 0.7, passes: 1, rough: 0.1 });
      });
      const hex = []; for (let i = 0; i < 6; i++) hex.push([cx + Math.cos(i * 1.047 + 0.52) * 13 * sc * 0.82, cy - 2 + Math.sin(i * 1.047 + 0.52) * 13 * sc * 0.82]);
      P.erase(hex); P.poly(hex, { w: 1.3, a: 0.97, rough: 0.2 }); P.hatch(hex, { ang: 45, gap: 2, w: 0.5, a: 0.75, cross: 90 }); slateWash(hex, 0.45, { jit: 0.2 });
      P.circle(cx, cy - 2, 4.5, { w: 0.9, a: 0.95, passes: 1 }); P.dot(cx, cy - 2, 1.4);
      P.text('3 WINGS x 40 M', cx, cy + r - 22, { size: 11, align: 'center', a: 0.9 });
      // north arrow
      P.line(cx + 60, cy - 42, cx + 60, cy - 62, { w: 1, a: 0.95, passes: 1, over: 0 }); P.pl([[cx + 56, cy - 56], [cx + 60, cy - 63], [cx + 64, cy - 56]], { w: 1, a: 0.95, over: 0 });
      P.text('N', cx + 60, cy - 66, { size: 10, align: 'center', a: 0.9 });
      leader(cx + r + 6, cy - 22, pp(-30, 60, -10)[0] + 40, pp(-30, 60, -10)[1] + 60, {});
    }

    /* --- handwritten height / weather notes --- */
    { const a601 = pp(0, 601, 0), t555 = tipPos(2, 554), a555 = pp(t555[0], 555, t555[1]), t452 = tipPos(2, 451), a452 = pp(t452[0], 452, t452[1]);
      tag('-6°C  AT THE TOP', 900, 178, pp(0, 720, 0)[0] + 4, pp(0, 720, 0)[1], { size: 13 });
      tag('FLOOR 148  555 M', 900, 212, a555[0] + 5, a555[1], { size: 13 });
      tag('FLOOR 124  452 M', 900, 246, a452[0] + 5, a452[1], { size: 13 });
      { // Karman vortex street behind the spire's shadow side
        const y0 = 108, xs = [372, 412, 448, 480];
        P.dashed(340, y0, 520, y0, [12, 5], { w: 0.7, c: HI, a: 0.85 });
        P.pl([[520, y0], [511, y0 - 4], [511, y0 + 4]], { w: 0.8, c: HI, a: 0.9, over: 0, closed: true });
        xs.forEach((x, i) => { const yy = y0 + (i % 2 ? 13 : -13), rr = 10 - i * 1.4;
          P.arcTicks(x, yy, rr, 0, TAU - 0.05, Math.PI / 6, 3, { c: HI, a: 0.85, len: 3.5, w: 0.7 });
          P.arc(x, yy, rr * 0.55, rr * 0.55, 0.6, 4.6 + i, { c: HI, w: 0.7, a: 0.8, passes: 1, rough: 0.2 }); });
        tag('WIND  32 KT', 340, 148, undefined, undefined, { size: 12 });
      }
      const cr = pp(46 - 30, 400, 14);
      tag('TOWER CRANE  400 M', 985, 290, cr[0], cr[1], { size: 12 });
      tag('CLOUD BAND  150 M', 435, 452, 578, 468, { size: 12 });
      tag('HOT AIR BALLOON', 350, 575, 480, 548, { size: 12 });
      const wc = (() => { const th2 = wingAng[2], u = 20, v = hwAt(u) + 0.8; return pp(u * Math.cos(th2) - v * Math.sin(th2), 84, u * Math.sin(th2) + v * Math.cos(th2)); })();
      tag('WINDOW CRADLE', 430, 722, wc[0] - 26, wc[1], { size: 12 });
      tag('LIGHTS ON  -  2 PM', 1050, 812, 946, 752, { size: 12 });
      { const sg = tipPos(0, 176), sgp = pp(sg[0], 178, sg[1]); tag('SKY GARDEN  L 73', 1010, 618, sgp[0] + 4, sgp[1] - 3, { size: 12 }); }
    }

    /* signature */
    tag(`SHEET ${n}/${t} – BURJ KHALIFA`, 1552, 958, undefined, undefined, { size: 12, align: 'right' });
  }
});
