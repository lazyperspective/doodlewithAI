/* SHEET 14 — Doodle: an abstract, ambiguous 3D ink drawing. Black and white only. */
(window.SCENES = window.SCENES || []).push({
  name: 'Doodle', seed: 211, ink: '#101010', theme: 'pencil',
  build(P, n, t) {
    const S = Sketch, D = S.D3, V = S.V3, TAU = S.TAU, lerp = S.lerp, INK = '#101010';
    const faces = [], add = f => { (Array.isArray(f) ? f : [f]).forEach(x => faces.push(x)); return f; };
    const custom = (c, fn, bias = 30) => faces.push({ custom: fn, c, bias });
    /* ---- swept tube along a 3D curve (parallel-transport frame); rings every `ringEvery` segments are inked */
    const tube = (pathFn, n, rFn, seg = 14, ringEvery = 3, longEvery = 0) => {
      const C = [], T = []; for (let i = 0; i <= n; i++) C.push(pathFn(i / n));
      for (let i = 0; i <= n; i++) { const a = C[Math.max(0, i - 1)], b = C[Math.min(n, i + 1)]; T.push(V.norm(V.sub(b, a))); }
      let N0 = V.norm(V.cross(T[0], Math.abs(T[0][2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])); const Ns = [N0];
      for (let i = 1; i <= n; i++) { const Np = Ns[i - 1], tt = T[i]; Ns.push(V.norm(V.sub(Np, V.mul(tt, V.dot(Np, tt))))); }
      const ring = i => { const N = Ns[i], B = V.cross(T[i], N), r = rFn(i / n); return Array.from({ length: seg }, (_, k) => { const a = k * TAU / seg; return V.add(C[i], V.add(V.mul(N, Math.cos(a) * r), V.mul(B, Math.sin(a) * r))); }); };
      let prev = ring(0);
      for (let i = 1; i <= n; i++) { const cur = ring(i);
        for (let k = 0; k < seg; k++) { const k2 = (k + 1) % seg, v = [prev[k], prev[k2], cur[k2], cur[k]], c = V.mul(V.add(V.add(v[0], v[1]), V.add(v[2], v[3])), 0.25), mid = V.mul(V.add(C[i - 1], C[i]), 0.5);
          faces.push({ v, n: V.norm(V.sub(c, mid)), hard: [false, longEvery && k % longEvery === 0, i % ringEvery === 0, false], hdir: T[i] }); }
        prev = cur; }
    };
    /* ---- 1. the knot: a (3,2) torus knot tube, thick and thin like a drawn line */
    tube(u => { const a = u * TAU, p = 2, q = 5, r = 150 + 75 * Math.cos(q * a); return [Math.cos(p * a) * r, Math.sin(p * a) * r, 150 + 95 * Math.sin(q * a)]; }, 520, u => 9 + 8 * Math.pow(Math.sin(u * TAU * 5 + 1), 2), 14, 4);
    /* ---- 2. the egg: a hollow shell cracked open (wedge removed), with a spiral stair rising inside to nowhere */
    { const E = [0, 0, 60], prof = []; for (let k = 0; k <= 16; k++) { const a = -Math.PI / 2 + Math.PI * k / 16; prof.push([Math.cos(a) * 78 + 0.01, E[2] + Math.sin(a) * 100]); } const inner = prof.slice().reverse().map(([r, z]) => [Math.max(0.01, r - 5), z]); 
      add(D.revolve(E[0], E[1], prof.concat(inner), { seg: 40, a0: -0.6, a1: -0.6 + TAU * 0.62, tube: true, cutTone: 0.95 }));
      // jagged crack rim drawn as a zig-zag along both cut edges
      custom(E, (PP, cm) => { [-0.6, -0.6 + TAU * 0.62].forEach(a => { const pts = prof.map(([r, z], k) => [E[0] + Math.cos(a + (k % 2 ? 0.06 : -0.06)) * (r + 1), E[1] + Math.sin(a + (k % 2 ? 0.06 : -0.06)) * (r + 1), z]); D.polyline3(PP, pts, cm, { w: 1.2, c: INK, a: 0.95 }); }); }, 60);
      // stair: 34 treads on a helix around a thin column
      add(D.cylinder(E[0], E[1], 5, -30, 150, 14));
      for (let k = 0; k < 34; k++) { const a = k * 0.42, z = -24 + k * 4.6, r0 = 7, r1 = 44; add(D.extrude([[Math.cos(a - 0.19) * r0, Math.sin(a - 0.19) * r0], [Math.cos(a - 0.19) * r1, Math.sin(a - 0.19) * r1], [Math.cos(a + 0.19) * r1, Math.sin(a + 0.19) * r1], [Math.cos(a + 0.19) * r0, Math.sin(a + 0.19) * r0]].map(([x, y]) => [E[0] + x, E[1] + y]), z, z + 2.2, { crease: 0.3 })); }
      // a small door at the top of the stair, standing alone
      add(D.extrude([[E[0] + 18, E[1] - 3], [E[0] + 30, E[1] - 3], [E[0] + 30, E[1] + 1], [E[0] + 18, E[1] + 1]], 134, 156, { crease: 0.3 })); add({ v: [[E[0] + 20, E[1] - 3.05, 136], [E[0] + 28, E[1] - 3.05, 136], [E[0] + 28, E[1] - 3.05, 152], [E[0] + 20, E[1] - 3.05, 152]], n: [0, -1, 0], hard: [true, true, true, true], tone: 1, bias: 1 });
    }
    /* ---- 3. stepped monoliths drifting out of the frame, an inverted staircase above them */
    [[-260, 60, 0, 40, 30, 120], [-300, 150, 30, 30, 30, 90], [-230, -60, -40, 26, 26, 150], [280, -90, -20, 34, 34, 110], [250, 140, 60, 22, 60, 50]].forEach(([x, y, z0, w, d, h]) => add(D.extrude([[x - w, y - d], [x + w, y - d], [x + w, y + d], [x - w, y + d]], z0, z0 + h, { crease: 0.3, bottom: true })));
    for (let k = 0; k < 12; k++) { const x = 170 - k * 9, z = 330 - k * 7; add(D.extrude([[x, -40], [x + 9, -40], [x + 9, 20], [x, 20]], z, z + 7, { crease: 0.3, bottom: true })); }
    /* ---- 4. the ring (a gate? a halo? an iris?) and a column that ends in an eye */
    add(D.ringSolid(0, 0, 0, 0, 0, 0, 3)); 
    { const ringF = D.ringSolid(0, 0, 70, 86, -6, 6, 48); add(ringF.map(f => Object.assign({}, f, { v: f.v.map(([x, y, z]) => [260 + x, 30 + z, 250 + y]), n: [f.n[0], f.n[2], f.n[1]] }))); }
    add(D.cylinder(-120, 170, 10, -60, 220, 18));
    { const eye = D.revolve(-120, 170, Array.from({ length: 13 }, (_, k) => { const a = -Math.PI / 2 + Math.PI * k / 12; return [Math.cos(a) * 26 + 0.01, 246 + Math.sin(a) * 26]; }), { seg: 30 }); add(eye);
      custom([-120, 150, 246], (PP, cm) => { const pts = Array.from({ length: 24 }, (_, k) => cm.project([-120 + Math.cos(k * TAU / 24) * 12, 170 - 25, 246 + Math.sin(k * TAU / 24) * 12])); if (pts.every(Boolean)) { const pp = pts.map(q => [q[0], q[1]]); PP.occlude(pp, '#ffffff'); PP.path(pp.concat([pp[0]]), { w: 1.2, c: INK, passes: 1, rough: 0.2 }); for (let k = 0; k < 24; k++) { const q0 = cm.project([-120 + Math.cos(k * TAU / 24) * 5, 145, 246 + Math.sin(k * TAU / 24) * 5]), q1 = cm.project([-120 + Math.cos(k * TAU / 24) * 12, 145, 246 + Math.sin(k * TAU / 24) * 12]); if (q0 && q1) PP.line(q0[0], q0[1], q1[0], q1[1], { w: 0.5, c: INK, passes: 1, over: 0 }); } const c = cm.project([-120, 144, 246]); if (c) PP.wash(Array.from({ length: 14 }, (_, k) => [c[0] + Math.cos(k * TAU / 14) * 4.2, c[1] + Math.sin(k * TAU / 14) * 4.2]), '#050505', 1, { edge: 0, steps: 1, jit: 0 }); if (c) PP.dot(c[0] - 1.5, c[1] - 1.6, 1.1, { c: '#ffffff', a: 1 }); } }, 80);
    }
    /* ---- 5. small spheres scattered like seeds, planets or cells */
    for (let k = 0; k < 22; k++) { const x = P.r(-340, 340), y = P.r(-260, 260), z = P.r(-40, 360), r = P.r(4, 16); add(D.revolve(x, y, Array.from({ length: 9 }, (_, q) => { const a = -Math.PI / 2 + Math.PI * q / 8; return [Math.cos(a) * r + 0.01, z + Math.sin(a) * r]; }), { seg: 16 })); }
    /* ---- render ---- */
    const cam = D.camera({ eye: [-560, -980, 640], target: [0, 20, 130], f: 1900, cx: 800, cy: 450 });
    D.render(P, faces, cam, { ink: INK, paper: '#ffffff', light: [-0.5, -0.35, 0.8], ambient: 0.05, gap: 4, w: 1.3, rough: 0.25, zw: 0, hatchMin: 0.12, rich: true, darken: 1.3, style: 'mixed' });
    /* ---- loose marks: a horizon that is not a horizon, a signature ---- */
    P.curve([[80, 780], [400, 760], [800, 790], [1200, 750], [1520, 770]], { w: 0.5, a: 0.35, rough: 1.2 });
    P.text('UNTITLED  (MACHINE, OR ANIMAL, OR WEATHER)', 1520, 956, { size: 9, align: 'right', a: 0.7 });
  }
});
