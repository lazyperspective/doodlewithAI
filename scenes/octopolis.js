/* OCTOPOLIS — a dense black-and-white ink doodle: an octopus whose tentacles harden, from root to tip, into walls,
   viaducts, streets and towers, until each tip is a little city of its own. Black ink only, light from the upper left. */
(window.SCENES = window.SCENES || []).push({
  name: 'Octopolis', seed: 808, ink: '#0b0b0b', theme: 'pencil',
  note: 'An ink octopus whose tentacles turn, from root to tip, into walls, viaducts, streets and a little city of towers.',
  build(P) {
    const S = Sketch, TAU = S.TAU, lerp = S.lerp, K = '#0b0b0b', Wh = '#ffffff';
    const D = SketchDoodle.kit(P, { ink: K }), R = D.R, pick = D.pick;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), smooth = (a, b, t) => { const u = clamp((t - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };

    /* ---------- bookkeeping: every solid shape, so the background only fills the gaps ---------- */
    const solids = [];
    const bbox = p => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; p.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }); return [x0, y0, x1, y1]; };
    const addSolid = p => { solids.push({ p, b: bbox(p) }); return p; };
    const inSolid = (x, y, pad = 0) => solids.some(({ p, b }) => x >= b[0] - pad && x <= b[2] + pad && y >= b[1] - pad && y <= b[3] + pad && (S.pip(p, x, y) || (pad && (S.pip(p, x + pad, y) || S.pip(p, x - pad, y) || S.pip(p, x, y + pad) || S.pip(p, x, y - pad)))));

    /* ---------- an even-spaced centreline through a few control points ---------- */
    const resample = (pts, step) => { const out = [pts[0]]; let acc = 0; for (let i = 1; i < pts.length; i++) { let [ax, ay] = pts[i - 1]; const [bx, by] = pts[i]; let seg = Math.hypot(bx - ax, by - ay); while (acc + seg >= step) { const t = (step - acc) / seg; ax = ax + (bx - ax) * t; ay = ay + (by - ay) * t; out.push([ax, ay]); seg = Math.hypot(bx - ax, by - ay); acc = 0; } acc += seg; } return out; };

    /* ---------- the tentacle specs: control points root → tip, root half-width, where the city begins ---------- */
    const T = {
      A: { pts: [[470, 400], [380, 365], [290, 330], [200, 300], [125, 250], [95, 170], [135, 105], [200, 95]], w0: 32, city: 0.38 },
      I: { pts: [[660, 380], [770, 330], [860, 260], [950, 175], [1050, 115], [1150, 100]], w0: 28, city: 0.4 },
      B: { pts: [[640, 410], [740, 385], [850, 345], [980, 310], [1110, 290], [1240, 250], [1330, 190], [1370, 120]], w0: 32, city: 0.36 },
      G: { pts: [[470, 445], [360, 470], [260, 500], [170, 495], [100, 445], [80, 375]], w0: 28, city: 0.42 },
      F: { pts: [[640, 440], [770, 475], [910, 500], [1050, 490], [1200, 460], [1340, 420], [1460, 360], [1530, 270]], w0: 38, city: 0.34 },
      C: { pts: [[495, 455], [400, 540], [300, 640], [215, 720], [150, 810], [150, 890], [220, 930]], w0: 40, city: 0.42 },
      E: { pts: [[610, 460], [700, 580], [830, 650], [980, 690], [1130, 715], [1280, 760], [1410, 830], [1520, 900]], w0: 44, city: 0.34 },
      D: { pts: [[548, 465], [530, 620], [565, 745], [655, 830], [790, 880], [930, 905], [1010, 900]], w0: 44, city: 0.4 },
    };

    /* ---------- construction: faint spines and the oval of the head, so the drawing looks planned ---------- */
    const MANTLE = P.sample([[440, 470], [380, 400], [348, 310], [345, 205], [385, 115], [462, 62], [560, 50], [645, 80], [705, 150], [735, 250], [732, 340], [700, 420], [655, 480], [560, 505]], true, 3);
    P.path(MANTLE.concat([MANTLE[0]]), { w: 0.6, a: 0.3, rough: 0.5, passes: 1 });
    Object.values(T).forEach(t => P.curve(t.pts, { w: 0.5, a: 0.22, rough: 0.4, passes: 1 }));

    /* ---------- city vocabulary: one building, vertical, standing at (x, base) ---------- */
    const KINDS = ['flat', 'flat', 'gable', 'gable', 'dome', 'spire', 'step', 'onion', 'flat', 'gable'];
    const building = (x, base, edgeY, bw, bh, o = {}) => {
      const back = !!o.back, x0 = x - bw / 2, x1 = x + bw / 2, top = base - bh, kind = o.kind || pick(KINDS), dep = Math.max(2.5, bw * 0.22), lw = back ? 0.9 : 1.3;
      // roof profile, left to right
      let roof = [[x0, top], [x1, top]], peak = top;
      if (kind === 'gable') { peak = top - bw * 0.55; roof = [[x0 - 1.5, top], [x, peak], [x1 + 1.5, top]]; }
      else if (kind === 'spire') { peak = top - bw * 1.7; roof = [[x0, top], [x, peak], [x1, top]]; }
      else if (kind === 'dome') { roof = []; for (let k = 0; k <= 10; k++) { const a = Math.PI + k * Math.PI / 10; roof.push([x + Math.cos(a) * bw / 2, top + Math.sin(a) * bw * 0.5]); } peak = top - bw * 0.5; }
      else if (kind === 'onion') { const h = bw * 1.1; roof = P.sample([[x0, top], [x0 - bw * 0.12, top - h * 0.3], [x - bw * 0.15, top - h * 0.75], [x, top - h], [x + bw * 0.15, top - h * 0.75], [x1 + bw * 0.12, top - h * 0.3], [x1, top]], false, 2); peak = top - h; }
      const body = [[x0, base], ...roof, [x1, base]];
      const side = [[x1, base], [x1, top], [x1 + dep, top - dep * 0.55], [x1 + dep, base - dep * 0.55]];
      const lid = [[x0, top], [x0 + dep, top - dep * 0.55], [x1 + dep, top - dep * 0.55], [x1, top]];
      const boxy = kind === 'flat' || kind === 'step';
      D.white(body); D.white(side); if (boxy) D.white(lid);
      addSolid(body); addSolid(side);
      // tone: the side away from the light, darker in front, a grey veil over the back row
      P.hatch(side, { ang: 90, gap: back ? 2.4 : 1.7, a: 0.85, w: 0.5, c: K, cross: back ? undefined : 50 });
      if (back) P.hatch(body, { ang: 90, gap: 3.2, a: 0.45, w: 0.4, c: K });
      if (kind === 'gable') P.hatch([[x, peak], [x1 + 1.5, top], [x1 + dep, top - dep * 0.55]], { ang: 30, gap: 2, a: 0.8, w: 0.45, c: K });
      if (kind === 'dome' || kind === 'onion') P.hatch(roof.filter(([px]) => px >= x - 1).concat([[x, top]]), { ang: 70, gap: 2, a: 0.8, w: 0.45, c: K });
      // windows: rows from the roof down to where the street hides the base
      const wy1 = Math.min(base, edgeY) - 4, cols = Math.max(1, Math.floor((bw - 3) / 5.5)), ww = Math.min(2.6, bw * 0.18), wh = 3.6;
      if (bw > 6) for (let yy = top + 5; yy + wh < wy1; yy += 7.5) for (let c = 0; c < cols; c++) {
        const wx = x0 + (c + 0.5) * bw / cols - ww / 2;
        if (back) { if (P.R() > 0.45) P.dot(wx + ww / 2, yy + wh / 2, 0.9, { c: Wh, a: 1 }); continue; }
        const q = [[wx, yy], [wx + ww, yy], [wx + ww, yy + wh], [wx, yy + wh]];
        if (P.R() > 0.3) D.black(q); else P.poly(q, { w: 0.45, c: K, passes: 1, over: 0, rough: 0.1 });
      }
      // outlines: silhouette heavier than the inner edges
      P.path(body.slice(0, body.length), { w: lw, c: K, a: 0.97, rough: 0.25, passes: 1 });
      P.path([[x1, base], [x1, top]], { w: lw * 0.7, c: K, a: 0.9, rough: 0.2, passes: 1 });
      P.path([[x1, top], [x1 + dep, top - dep * 0.55], [x1 + dep, base - dep * 0.55]], { w: lw * 0.8, c: K, a: 0.95, rough: 0.2, passes: 1 });
      if (boxy) P.path([[x0, top], [x0 + dep, top - dep * 0.55], [x1 + dep, top - dep * 0.55]], { w: lw * 0.8, c: K, a: 0.95, rough: 0.2, passes: 1 });
      // roof furniture
      if (!back && kind === 'flat' && bw > 12 && P.R() > 0.45) { const tx = x + R(-bw * 0.2, bw * 0.15), ty = top - dep * 0.3; P.line(tx - 3, ty, tx - 3, ty - 6, { w: 0.6, c: K, passes: 1, over: 0 }); P.line(tx + 3, ty, tx + 3, ty - 6, { w: 0.6, c: K, passes: 1, over: 0 }); const tank = [[tx - 4, ty - 6], [tx + 4, ty - 6], [tx + 4, ty - 12], [tx, ty - 15], [tx - 4, ty - 12]]; D.white(tank); P.hatch(tank, { ang: 90, gap: 1.6, a: 0.8, w: 0.4, c: K, fade: px => (px - tx + 4) / 8 }); P.poly(tank, { w: 0.8, c: K, passes: 1, over: 0, rough: 0.1 }); }
      if (kind === 'gable' && !back && P.R() > 0.4) { const cx = x + bw * 0.25, cy = lerp(peak, top, 0.45); const ch = [[cx - 2, cy], [cx + 2, cy], [cx + 2, cy - 8], [cx - 2, cy - 8]]; D.white(ch); D.black(ch); P.curve([[cx, cy - 9], [cx + 3, cy - 15], [cx - 1, cy - 21], [cx + 4, cy - 28], [cx + 2, cy - 34]], { w: 0.6, c: K, rough: 0.2, passes: 1, a: 0.8 }); }
      if (kind === 'spire' || kind === 'onion' || kind === 'dome') { P.line(x, peak, x, peak - 9, { w: 0.8, c: K, passes: 1, over: 0 }); if (P.R() > 0.5) D.black([[x, peak - 9], [x + 7, peak - 7], [x, peak - 5]]); else P.dot(x, peak - 9, 1.4, { c: K }); }
      if (kind === 'step' && bh > 30) building(x - dep * 0.2, top + 2, top + 2, bw * 0.62, bh * 0.4, { back, kind: P.R() > 0.5 ? 'flat' : 'spire' });
      if (!back && bw > 14 && bh > 26 && P.R() > 0.6) { // a door with a light over it where the base shows
        const dy = Math.min(base, edgeY) - 1; if (dy - top > 18) { const d = [[x - 2.5, dy], [x - 2.5, dy - 6], [x, dy - 8.5], [x + 2.5, dy - 6], [x + 2.5, dy]]; D.black(d); } }
      return peak;
    };

    /* ---------- one tentacle: skin with suckers near the root, masonry and arches toward the tip, buildings on top ---------- */
    const tentacle = (key) => {
      const t = T[key], C = resample(P.sample(t.pts, false, 3), 4), N = C.length;
      const nrm = [], wid = [];
      C.forEach((p, i) => { const q = C[Math.min(N - 1, i + 1)], o = C[Math.max(0, i - 1)]; let tx = q[0] - o[0], ty = q[1] - o[1]; const l = Math.hypot(tx, ty) || 1; nrm.push([-ty / l, tx / l]); wid.push(lerp(t.w0, 3.2, Math.pow(i / (N - 1), 0.85))); });
      // which side is the top (faces the sky): the normal side with the more upward pointing average
      const s = nrm.reduce((a, n) => a + n[1], 0) < 0 ? 1 : -1;
      const at = (i, v) => [C[i][0] + nrm[i][0] * s * v * wid[i], C[i][1] + nrm[i][1] * s * v * wid[i]];
      const up = i => [nrm[i][0] * s, nrm[i][1] * s];
      const top = C.map((_, i) => at(i, 1)), bot = C.map((_, i) => at(i, -1));
      const poly = top.concat(bot.slice().reverse());
      const iCity = Math.round(N * t.city);
      D.white(poly); addSolid(poly);
      // underside shading: strokes combed in from the lower rim, longer near the root
      for (let i = 1; i < N - 2; i++) { const L = wid[i] * lerp(0.55, 0.3, i / N); for (let m = 0; m < 2; m++) { const a = at(i, -1 + 0.04 + m * 0.03), b = at(i, -1 + 0.04 + L / wid[i] * (1 - m * 0.45)); if (i % 1 === 0) P.line(a[0], a[1], b[0], b[1], { w: 0.45, c: K, passes: 1, over: 0, rough: 0.1, a: 0.85 }); } }
      // skin: suckers in two staggered rows on the underside, morphing into round windows near the city
      let acc = 0;
      for (let i = 2; i < N - 4; i++) {
        acc += 4; const r = wid[i] * 0.2, need = r * 2.6 + 3; if (acc < need) continue; acc = 0;
        const cityness = smooth(iCity - 18, iCity + 12, i);
        [0.15, -0.5].forEach((v, row) => {
          const j = Math.min(N - 1, i + row * 2), c = at(j, v - (row ? 0 : 0)), rr = wid[j] * (row ? 0.26 : 0.2);
          if (rr < 1.6) return;
          if (P.R() > cityness) { // a sucker: rim, cup, dark crescent on the shadow side
            if (row === 0 && i < iCity - 4) return;
            D.white(D.circ(c[0], c[1], rr, 14)); P.circle(c[0], c[1], rr, { w: 0.9, c: K, passes: 1, rough: 0.2 }); P.circle(c[0], c[1], rr * 0.5, { w: 0.6, c: K, passes: 1, rough: 0.2 });
            P.arc(c[0], c[1], rr * 0.82, rr * 0.82, -0.6, 1.9, { w: 1.1, c: K, passes: 1, rough: 0.1 }); P.dot(c[0] - rr * 0.1, c[1] - rr * 0.1, Math.max(0.6, rr * 0.12), { c: K });
          } else if (row === 1) { // an arch of a viaduct, oriented to the tentacle
            const u = up(j), tg = [u[1] * -1, u[0]], ah = rr * 2.1, aw = rr * 0.85, base2 = at(j, -0.95), arch = [];
            arch.push([base2[0] - tg[0] * aw, base2[1] - tg[1] * aw]);
            for (let k = 0; k <= 8; k++) { const a = Math.PI * k / 8, ux = -Math.cos(a) * aw, uy = ah - aw + Math.sin(a) * aw; arch.push([base2[0] + tg[0] * ux + u[0] * uy, base2[1] + tg[1] * ux + u[1] * uy]); }
            arch.push([base2[0] + tg[0] * aw, base2[1] + tg[1] * aw]);
            D.black(arch); P.path(arch, { w: 0.8, c: K, passes: 1, rough: 0.15 });
          } else { // a round window
            D.white(D.circ(c[0], c[1], rr * 0.8, 12)); D.black(D.circ(c[0], c[1], rr * 0.55, 10)); P.circle(c[0], c[1], rr * 0.8, { w: 0.8, c: K, passes: 1 }); P.line(c[0] - rr * 0.55, c[1], c[0] + rr * 0.55, c[1], { w: 0.5, c: Wh, passes: 1, over: 0, a: 1 });
          }
        });
      }
      // skin texture near the root: stipple fading toward the light
      const rootPoly = top.slice(0, iCity).concat(bot.slice(0, iCity).reverse());
      P.stipple(rootPoly, Math.round(iCity * wid[0] * 0.5), { a: 0.85, r: 0.7, c: K, fade: (x, y) => { let best = 1e9, bi = 0; for (let i = 0; i < iCity; i += 3) { const d = Math.hypot(x - C[i][0], y - C[i][1]); if (d < best) { best = d; bi = i; } } const n = nrm[bi], v = ((x - C[bi][0]) * n[0] + (y - C[bi][1]) * n[1]) * s / wid[bi]; return clamp(0.5 - v * 0.6, 0, 1) * 0.7; } });
      // masonry: brick courses along the upper half of the city part, joints staggered
      for (let v = 0.75; v > -0.15; v -= 0.22) { let seg = []; for (let i = iCity - 10; i < N - 3; i++) { if (i < 0) continue; if (P.R() < 0.04 || seg.length > 18) { if (seg.length > 2) P.path(seg, { w: 0.45, c: K, rough: 0.15, passes: 1, a: 0.8 }); seg = []; if (P.R() < 0.5) continue; } const fadeIn = smooth(iCity - 10, iCity + 6, i); if (P.R() > fadeIn) { if (seg.length > 2) P.path(seg, { w: 0.45, c: K, rough: 0.15, passes: 1, a: 0.8 }); seg = []; continue; } seg.push(at(i, v)); } if (seg.length > 2) P.path(seg, { w: 0.45, c: K, rough: 0.15, passes: 1, a: 0.8 });
        for (let i = iCity + ((v * 10) % 2 ? 0 : 2); i < N - 4; i += 4) { if (wid[i] < 5) break; const a = at(i, v), b = at(i, v + 0.22); P.line(a[0], a[1], b[0], b[1], { w: 0.4, c: K, passes: 1, over: 0, rough: 0.1, a: 0.75 }); } }
      // the street along the top edge of the city part
      { const st = []; for (let i = iCity; i < N - 2; i++) st.push(at(i, 0.86)); if (st.length > 2) P.path(st, { w: 0.6, c: K, rough: 0.15, passes: 1, a: 0.9 }); }
      // the silhouette, heaviest line on the page
      D.ol(poly, 2.2);
      // the tip: a beaded spire if the tip points up, otherwise a curl of beads
      const tipU = C[N - 1][1] < C[N - 6][1];
      // buildings: a back row (taller, greyed), then a front row
      const edgeAt = (i, xa, xb) => { let m = -1e9; for (let j = Math.max(0, i - 14); j < Math.min(N, i + 14); j++) { const p = top[j]; if (p[0] >= xa - 0.5 && p[0] <= xb + 0.5) m = Math.max(m, p[1]); } return m > -1e9 ? m : top[i][1]; };
      const row = (back) => {
        let i = iCity + (back ? 3 : 0);
        while (i < N - 6) {
          const u = up(i), w = wid[i];
          if (-u[1] < 0.55) { i += 3; continue; }
          const bw = clamp(w * R(0.7, 1.35) * (back ? 0.9 : 1), 6, 34), bh = clamp(bw * R(1.0, 2.4) * (back ? 1.55 : 1) * (P.R() < 0.12 ? 1.6 : 1), 9, 170);
          const x = top[i][0], ey = edgeAt(i, x - bw / 2, x + bw / 2);
          if (ey - bh - bw > 30) building(x, ey + 3, top[i][1], bw, bh, { back });
          i += Math.max(2, Math.round(bw * (back ? 1.3 : 0.95) / 4));
        }
      };
      row(true); row(false);
      // under the city: lanterns, bead chains and roots hanging from the viaduct
      for (let i = iCity + 4; i < N - 8; i += P.ri(7, 13)) { const u = up(i); if (u[1] > -0.6 || wid[i] < 6) continue; const b = at(i, -1), kind = pick([0, 1, 1, 'lamp', 'lamp']), L = R(14, 26) + wid[i] * R(0.6, 1.6);
        const pts = D.wander(b[0], b[1] + 1, Math.PI / 2 + R(-0.12, 0.12), L, { step: 4, curl: R(-0.02, 0.02), jit: 0.03, stop: (x, y) => inSolid(x, y, 2) || y > 975 }); if (pts.length < 4) continue;
        if (kind === 'lamp') { const e = pts[pts.length - 1]; D.pl(pts, 0.6); const l = [[e[0], e[1]], [e[0] + 3.2, e[1] + 4], [e[0] + 2.2, e[1] + 9], [e[0] - 2.2, e[1] + 9], [e[0] - 3.2, e[1] + 4]]; D.white(l); D.black(l); P.dot(e[0] - 0.6, e[1] + 5, 0.9, { c: Wh, a: 1 }); }
        else D.tendril(pts, kind); }
      if (tipU) D.spire(C[N - 1][0], C[N - 1][1] + 2, R(40, 70));
      return { C, top, bot, nrm, wid, s, N, iCity, poly };
    };

    /* ---------- the head: mantle, packed with ink motifs, dark on the side away from the light ---------- */
    const mantle = () => {
      const m = MANTLE;
      D.white(m); addSolid(m); D.ol(m, 2.6);
      const cx = 555, cy = 280;
      const eyes = [[478, 412, 34], [628, 402, 32]];
      const pk = D.packer(); eyes.forEach(([x, y, r]) => pk.add(x, y, r + 10));
      // the shadow: a crescent along the rim away from the light (upper left), widest at the lower right
      const outer = [], inner = []; m.forEach(([x, y]) => { const a = Math.atan2(y - cy, x - cx), sh = Math.cos(a - 0.55); if (sh < 0.12) return; const d = 135 * Math.pow(sh, 1.3) * (1 + 0.12 * Math.sin(a * 7)); outer.push([x, y]); inner.push([x + (cx - x) / Math.hypot(cx - x, cy - y) * d, y + (cy - y) / Math.hypot(cx - x, cy - y) * d]); });
      const shade = [outer.concat(inner.reverse())]; shade.forEach(D.black);
      const dark = (x, y) => shade.some(p => S.pip(p, x, y));
      const inside = (x, y, pad = 0) => { const r = Math.max(0, pad) / 0.35 * 1.12 + 7; if (!S.pip(m, x, y)) return false; for (let k = 0; k < 10; k++) { const a = k * TAU / 10; if (!S.pip(m, x + Math.cos(a) * r, y + Math.sin(a) * r)) return false; } return true; };
      D.grow({ inside, dark, packer: pk, bounds: [350, 60, 750, 510], schedule: [[28, 80], [22, 200], [17, 400], [13, 700], [10, 1100], [7, 1600], [4.5, 2600], [2.6, 3600]], big: ['puff', 'puff', 'ripple', 'cells', 'shell', 'honey', 'scales', 'curl', 'puff', 'rosette', 'bands', 'maze'], small: ['puff', 'ripple', 'cells', 'puff'] });
      // the volume: fringe on the shadow side of the whole head, a highlight left bare
      D.fringe(m, cx, cy, 220, { rows: 2, w: 0.5 });
      D.ol(D.offset(m, -6), 0.6);
      // eyes: lid, iris, horizontal slit pupil
      eyes.forEach(([x, y, r], k) => {
        const lidP = D.blobR(x, y - 4, r * 1.25, r * 0.95, k ? 0.15 : -0.15, 14, 0.04); D.white(lidP); D.fringe(lidP, x, y, r * 1.2, { rows: 2 }); D.ol(lidP, 1.6);
        const ball = D.circ(x, y, r * 0.86, 30); D.white(ball);
        for (let q = 0; q < 46; q++) { const a = q * TAU / 46; D.ln(x + Math.cos(a) * r * 0.38, y + Math.sin(a) * r * 0.38, x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, 0.45); }
        P.circle(x, y, r * 0.86, { w: 1.5, c: K, passes: 1 });
        const pupil = D.blobR(x, y, r * 0.5, r * 0.16, k ? 0.08 : -0.08, 12, 0.02); D.white(D.offset(pupil, 3)); D.black(pupil);
        P.dot(x - r * 0.28, y - r * 0.32, r * 0.11, { c: Wh, a: 1 }); P.dot(x - r * 0.12, y - r * 0.45, r * 0.05, { c: Wh, a: 1 });
        // the heavy upper lid
        const lid = []; for (let q = 0; q <= 14; q++) { const a = Math.PI + 0.15 + q * (Math.PI - 0.3) / 14; lid.push([x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92]); }
        for (let q = 14; q >= 0; q--) { const a = Math.PI + 0.15 + q * (Math.PI - 0.3) / 14; lid.push([x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.62 - r * 0.05]); }
        D.black(lid);
      });
      return m;
    };

    // back to front: the far tentacles, the head, then the near tentacles
    const TT = {};
    // the web between the arms, in shadow under the head
    { const web = P.sample([[440, 440], [480, 500], [525, 530], [585, 532], [640, 500], [680, 445], [560, 420]], true, 3); D.white(web); addSolid(web); D.black(D.offset(web, -3)); P.dots(Array.from({ length: 260 }, () => [R(440, 680), R(430, 535), R(0.4, 1.1)]).filter(([x, y]) => S.pip(D.offset(web, -6), x, y)), Wh, 0.9); }
    ['A', 'I', 'B', 'G', 'F', 'C', 'E', 'D'].forEach(k => { TT[k] = tentacle(k); });
    mantle();

    /* ---------- the sky between the arms: a few clouds and birds where the gaps are widest ---------- */
    { const G = 10, nx = 154, ny = 94, dist = new Float32Array(nx * ny);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = 30 + i * G, y = 30 + j * G; dist[j * nx + i] = inSolid(x, y) ? 0 : 1e9; }
      for (let pass = 0; pass < 2; pass++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const jj = pass ? ny - 1 - j : j, ii = pass ? nx - 1 - i : i, k = jj * nx + ii, d = pass ? 1 : -1; let v = dist[k]; [[d, 0], [0, d], [d, d], [-d, d]].forEach(([a, b]) => { const i2 = ii + a, j2 = jj + b; if (i2 >= 0 && i2 < nx && j2 >= 0 && j2 < ny) v = Math.min(v, dist[j2 * nx + i2] + Math.hypot(a, b) * G); }); dist[k] = v; }
      const edgeD = (i, j) => Math.min(dist[j * nx + i], (30 + i * G) - 40, 1560 - (30 + i * G), (30 + j * G) - 30, 930 - (30 + j * G));
      const take = (minD) => { let best = -1, bi = 0, bj = 0; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const d = edgeD(i, j); if (d > best) { best = d; bi = i; bj = j; } } if (best < minD) return null; const x = 30 + bi * G, y = 30 + bj * G; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const d = Math.hypot(30 + i * G - x, 30 + j * G - y); if (d < best * 1.9) dist[j * nx + i] = Math.min(dist[j * nx + i], Math.max(0, d - best * 0.9)); } return [x, y, best]; };
      for (let q = 0; q < 6; q++) { const g = take(40); if (!g) break; const [x, y, d] = g, w = Math.min(150, d * 1.45), h = w * R(0.38, 0.5);
        // an ink cloud: round puffs along a bell, upper ones first, a flat underside, shade arcs inside the lower right
        const n = Math.max(4, Math.round(w / 24)), base = y + h * 0.3, puffs = [];
        for (let k = 0; k < n; k++) { const t2 = (k + R(-0.2, 0.2)) / (n - 1), bell = Math.sin(Math.PI * clamp(t2, 0.04, 0.96)); puffs.push([x - w / 2 + t2 * w, base - h * 0.12 - bell * h * 0.45, h * (0.2 + 0.32 * bell) * R(0.9, 1.1)]); }
        for (let k = 0; k < 2; k++) puffs.push([x + R(-w * 0.2, w * 0.2), base - h * R(0.55, 0.75), h * R(0.28, 0.4)]);
        puffs.sort((a, b) => a[1] - b[1]).forEach(([px, py, r]) => { const c = D.circ(px, py, r, 30); D.white(c); addSolid(c); P.circle(px, py, r, { w: 1, c: K, passes: 1, rough: 0.3 }); for (let q = 0; q < 3; q++) P.arc(px, py, r * (0.84 - q * 0.12), r * (0.84 - q * 0.12), 0.1 + q * 0.15, 1.5 - q * 0.1, { w: 0.5, c: K, passes: 1, rough: 0.2, a: 0.8 }); });
        { let x0 = 1e9, x1 = -1e9; puffs.forEach(([px, py, r]) => { if (py + r > base) { x0 = Math.min(x0, px - r); x1 = Math.max(x1, px + r); } }); D.white([[x0 - 1, base + 0.6], [x1 + 1, base + 0.6], [x1 + 1, base + h * 0.45], [x0 - 1, base + h * 0.45]]); P.line(x - w / 2 + 4, base, x + w / 2 - 4, base, { w: 1, c: K, passes: 1, over: 0 }); for (let k = 1; k < 3; k++) { const a = R(0.15, 0.35), b2 = R(0.6, 0.85); P.line(x - w / 2 + w * a, base + k * 4, x - w / 2 + w * b2, base + k * 4, { w: 0.5, c: K, passes: 1, over: 0, a: 0.7 }); } }
        for (let b = 0; b < P.ri(2, 5); b++) { const bx = x + R(-w * 0.7, w * 0.7), by = y - h * R(0.7, 1.4), s2 = R(3.5, 7); if (inSolid(bx, by, 10)) continue; P.curve([[bx - s2, by - s2 * 0.3], [bx - s2 * 0.45, by - s2 * 0.45], [bx, by]], { w: 0.8, c: K, rough: 0.1, passes: 1 }); P.curve([[bx, by], [bx + s2 * 0.45, by - s2 * 0.5], [bx + s2, by - s2 * 0.25]], { w: 0.8, c: K, rough: 0.1, passes: 1 }); } }
    }

    /* ---------- the background: bubbles and specks drifting off the creature, thinning with distance ---------- */
    const pk = D.packer();
    const bubble = (x, y, r) => { if (!pk.free(x, y, r, 1.5) || inSolid(x, y, r + 2)) return; pk.add(x, y, r); if (r > 2.6) { D.white(D.circ(x, y, r, 14)); P.circle(x, y, r, { w: 0.75, c: K, passes: 1 }); P.arc(x, y, r * 0.62, r * 0.62, 3.6, 4.7, { w: 0.55, c: K, passes: 1 }); } else P.dot(x, y, Math.max(0.5, r * 0.45), { c: K, a: 0.9 }); };
    // trails of bubbles rising off the head, growing as they rise
    [[470, 110, -0.3], [560, 70, 0.05], [655, 95, 0.35], [400, 175, -0.5]].forEach(([x, y, lean]) => { let yy = y - 8, xx = x, r = 1.6; while (yy > 22) { bubble(xx + R(-4, 4), yy, r); yy -= r * 2 + R(3, 8); xx += lean * R(2, 8) + Math.sin(yy * 0.05) * 2; r = Math.min(8, r * R(1.08, 1.22)); } });
    // specks and small bubbles hugging the silhouettes, thinning fast with distance
    for (let i = 0; i < 16000; i++) {
      const x = R(40, 1560), y = R(30, 965); if (inSolid(x, y, 3)) continue;
      let d = 1e9; for (const { p, b } of solids) { const dx = Math.max(b[0] - x, 0, x - b[2]), dy = Math.max(b[1] - y, 0, y - b[3]); if (Math.hypot(dx, dy) > 40) continue; for (let k = 0; k < p.length; k += 3) d = Math.min(d, Math.hypot(p[k][0] - x, p[k][1] - y)); }
      if (P.R() > 0.55 * Math.exp(-d / 9)) continue;
      bubble(x, y, P.R() < 0.85 ? R(0.6, 2.2) : R(2.6, 4.5));
    }

    /* ---------- notes ---------- */
    P.text('OCTOPOLIS', 1530, 955, { size: 16, align: 'right', a: 0.85 });
    P.label('the suburbs grow at the tips', 1530, 978, { size: 11, align: 'right', a: 0.6 });
    P.note('suckers become windows, windows become arches', 285, 975, 543, 728, { size: 11, a: 0.65, from: 'end' });
  }
});
