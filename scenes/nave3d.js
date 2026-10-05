/* SHEET 11 — Cinematic: the nave of a Gothic cathedral, low-angle one-point perspective in true 3D.
   Cross-hatched by a light that falls through the clerestory, with cast shadows, light shafts and depth fog. */
(window.SCENES = window.SCENES || []).push({
  name: 'Nave (cinematic 3D)', seed: 131, ink: '#3a2a1c', theme: 'sepia',
  build(P, n, t) {
    const S = Sketch, D = S.D3, V = S.V3, TAU = S.TAU, lerp = S.lerp;
    const INK = '#3a2a1c', GOLD = '#f0c060', PAPER = '#ffffff';
    const R = (a, b) => P.r(a, b);
    const HW = 7.5, SPR = 30, RISE = 8.4, ARC = 11, ARCR = 5.6, TRI0 = 17.2, TRI1 = 21.4;
    const BAYS = [-32, -24, -16, -8, 0, 8, 16, 24, 32, 40, 48, 56, 64, 72], YEND = 72, YEND2 = 72;
    const cam = D.camera({ eye: [-2.4, -27, 1.7], target: [0.4, 44, 17.5], f: 860, cx: 800, cy: 505 });
    const faces = [], add = f => { (Array.isArray(f) ? f : [f]).forEach(x => faces.push(x)); };
    const pointed = (x0, x1, z0, rise, k = 14) => { const w = x1 - x0, Rr = (w * w / 4 + rise * rise) / w, ta = Math.atan2(rise, (x0 + x1) / 2 - (x0 + Rr)), pts = []; for (let i = 0; i <= k; i++) { const th = Math.PI + (ta - Math.PI) * i / k; pts.push([x0 + Rr + Rr * Math.cos(th), z0 + Rr * -Math.sin(th) * -1 * -1]); } const out = []; for (let i = 0; i <= k; i++) { const th = Math.PI + (ta - Math.PI) * i / k; out.push([x0 + Rr + Rr * Math.cos(th), z0 - Rr * Math.sin(th) * -1]); } void pts; const L = [], Rp = []; for (let i = 0; i <= k; i++) { const th = Math.PI - (Math.PI - ta) * i / k; L.push([x0 + Rr + Rr * Math.cos(th), z0 + Rr * Math.sin(th)]); } for (let i = k - 1; i >= 0; i--) { const th = Math.PI - (Math.PI - ta) * i / k; Rp.push([x1 - Rr - Rr * Math.cos(th), z0 + Rr * Math.sin(th)]); } void out; return L.concat(Rp); };
    const wallX = (x, y0, y1, prof) => prof.map(([u, z]) => [x, lerp(y0, y1, u), z]);           // helper not used for arches
    void wallX;
    // ---- floor (checker), pools, shadows collected first ----
    const LD = V.norm([0.62, 0.12, -0.78]);
    for (let ix = -13; ix < 13; ix++) for (let iy = -16; iy < 36; iy++) { const x0 = ix * 1.15, y0 = iy * 2.1, dark = (ix + iy) % 2 === 0; if (Math.abs(x0) > HW - 0.1 && Math.abs(x0) < HW + 0.9) { } add({ v: [[x0, y0, 0], [x0 + 1.15, y0, 0], [x0 + 1.15, y0 + 2.1, 0], [x0, y0 + 2.1, 0]], n: [0, 0, 1], hard: [false, false, false, false], layer: 0, tone: dark ? 0.42 : 0.06, noEdge: true }); }
    const inside = [0, 30, 15];
    // ---- piers, capitals, vaulting shafts ----
    const pierShadows = [];
    BAYS.forEach(y => { [-1, 1].forEach(sg => {
      const px = sg * HW, base = [px + sg * 0.9, y];
      add(D.cylinder(px + sg * 0.9, y, 1.15, 0, 0.7, 20)); add(D.cylinder(px + sg * 0.9, y, 0.95, 0.7, ARC - 0.6, 20, { crease: 3 })); add(D.cylinder(px + sg * 0.9, y, 1.2, ARC - 0.6, ARC, 20));
      [[-0.75, 0], [0.75, 0], [0, -0.75], [0, 0.75]].forEach(([dx, dy]) => { add(D.cylinder(px + sg * 0.9 + dx, y + dy, 0.28, 0.7, ARC - 0.2, 10, { crease: 3 })); });
      // shafts rising on the nave face to the vault
      [-0.5, 0.5].forEach(dy => { add(D.cylinder(px - sg * 0.3, y + dy, 0.24, ARC, SPR + 0.8, 10, { crease: 3 })); add(D.cylinder(px - sg * 0.3, y + dy, 0.34, SPR, SPR + 0.8, 10)); });
      add(D.cylinder(px - sg * 0.3, y, 0.42, ARC, ARC + 0.4, 12)); add(D.cylinder(px - sg * 0.3, y, 0.32, TRI1, TRI1 + 0.35, 12));
      if (sg < 0) pierShadows.push([px + sg * 0.9, y, ARC]);
    }); });
    // ---- walls per bay (inner nave face at x = ±HW), arcade openings, aisle, triforium, clerestory ----
    for (let b = 0; b + 1 < BAYS.length; b++) {
      const y0 = BAYS[b] + 0.55, y1 = BAYS[b + 1] - 0.55, ym = (y0 + y1) / 2;
      [-1, 1].forEach(sg => {
        const x = sg * HW, ins = [0, ym, 12];
        const arch = pointed(-1, 1, 0, 1.0, 1).length && null; void arch;
        // arcade arch: profile in (y,z) plane
        const ap = (() => { const w = y1 - y0, Rr = (w * w / 4 + ARCR * ARCR) / w, ta = Math.atan2(ARCR, w / 2 - Rr), pts = []; for (let i = 0; i <= 12; i++) { const th = Math.PI - (Math.PI - ta) * i / 12; pts.push([y0 + Rr + Rr * Math.cos(th), ARC + Rr * Math.sin(th) - (Rr - ARCR) * 0]); } for (let i = 11; i >= 0; i--) { const th = Math.PI - (Math.PI - ta) * i / 12; pts.push([y1 - Rr - Rr * Math.cos(th), ARC + Rr * Math.sin(th)]); } return pts; })();
        // shift: the arch apex should be ARC + ARCR: recompute via chord so left/right meet
        const w = y1 - y0, Rr = (w * w / 4 + ARCR * ARCR) / w; const left = [], right = [];
        for (let i = 0; i <= 12; i++) { const u = i / 12, th = Math.PI - Math.atan2(ARCR, Rr - w / 2 + 0) * 0 - (Math.PI - Math.atan2(ARCR, w / 2 - Rr)) * u; left.push([y0 + Rr + Rr * Math.cos(th), ARC + Rr * Math.sin(th) - Rr * Math.sin(Math.PI - (Math.PI - Math.atan2(ARCR, w / 2 - Rr)) * 0) * 0]); }
        void ap; void left; void right;
        const pf = (u) => { // pointed profile: param u in [0,1] across the opening -> (y,z)
          const yy = lerp(y0, y1, u), half = (y1 - y0) / 2, dx = Math.abs(u - 0.5) * (y1 - y0), Rc = (half * half + ARCR * ARCR) / (2 * half) * 1.0, cxr = half - Rc;   // arc centre offset from the axis
          const zz = Math.sqrt(Math.max(0, Rc * Rc - (dx - (u < 0.5 ? cxr : cxr) * -1 * -1 * 0 - 0) ** 2)); void zz; const off = half - Rc, dd = dx + off * -1; void dd;
          const cx2 = (u < 0.5 ? y0 + Rc : y1 - Rc), r2 = Rc, zt = Math.sqrt(Math.max(0, r2 * r2 - (yy - cx2) ** 2)); return [yy, ARC + zt]; };
        const arc = []; for (let i = 0; i <= 16; i++) arc.push(pf(i / 16));
        // aisle back wall + glowing window, seen through the arch
        const ax = sg * 14.6; add(V3poly([[ax, y0 - 0.6, 0], [ax, y1 + 0.6, 0], [ax, y1 + 0.6, 12.5], [ax, y0 - 0.6, 12.5]], [0, ym, 6], { layer: 1.5, tone: 0.42 }));
        { const wc = []; for (let i = 0; i <= 10; i++) { const u = i / 10, yy = lerp(y0 + 1.2, y1 - 1.2, u), zz = 5 + 4.2 * Math.sin(Math.PI * Math.min(1, u)) ** 0.6 * 0 + 0; wc.push([yy, zz]); } const wy0 = y0 + 1.6, wy1 = y1 - 1.6, wp = [[ax, wy0, 3.4], [ax, wy1, 3.4], [ax, wy1, 8.4]]; for (let i = 6; i >= 0; i--) { const th = Math.PI * i / 6, cy = (wy0 + wy1) / 2, rr = (wy1 - wy0) / 2; wp.push([ax, cy + Math.cos(th) * rr, 8.4 + Math.sin(th) * rr * 1.5]); } wp.push([ax, wy0, 8.4]); add(V3poly(wp, [0, ym, 6], { layer: 1.6, c: GOLD, ca: 0.55, tone: 0.3 })); }
        // spandrel (wall from arch up to triforium base), triforium band with 4 dark lights, clerestory wall with 2 glowing lancets
        const sp = [[x, y0, 0], [x, y0, ARC]]; arc.forEach(([yy, zz]) => sp.push([x, yy, zz])); sp.push([x, y1, ARC], [x, y1, 0]);
        // spandrel polygon = region above the arch up to z=TRI0 (drawn as arch outline reversed + top line)
        const spand = arc.map(([yy, zz]) => [x, yy, zz]).concat([[x, y1, TRI0], [x, y0, TRI0]]);
        add(V3poly(spand, [0, ym, 12], { layer: 2 }));
        add(V3poly([[x, y0, TRI0], [x, y1, TRI0], [x, y1, TRI1], [x, y0, TRI1]], [0, ym, 12], { layer: 2 }));
        for (let k2 = 0; k2 < 4; k2++) { const a0 = lerp(y0, y1, (k2 + 0.15) / 4), a1 = lerp(y0, y1, (k2 + 0.85) / 4); add(V3poly([[x - sg * 0.02, a0, TRI0 + 0.5], [x - sg * 0.02, a1, TRI0 + 0.5], [x - sg * 0.02, a1, TRI1 - 1.2], [x - sg * 0.02, (a0 + a1) / 2, TRI1 - 0.3], [x - sg * 0.02, a0, TRI1 - 1.2]], [0, ym, 12], { layer: 2, tone: 0.86, bias: -6, noEdge: false })); }
        // clerestory wall + windows
        add(V3poly([[x, y0, TRI1], [x, y1, TRI1], [x, y1, SPR + 4], [x, y0, SPR + 4]], [0, ym, 12], { layer: 2, tone: 0.32 }));
        for (let k2 = 0; k2 < 2; k2++) { const wy0 = lerp(y0, y1, k2 ? 0.55 : 0.12), wy1 = lerp(y0, y1, k2 ? 0.88 : 0.45), cy = (wy0 + wy1) / 2, rr = (wy1 - wy0) / 2, wp = [[x - sg * 0.03, wy0, TRI1 + 1.0], [x - sg * 0.03, wy1, TRI1 + 1.0], [x - sg * 0.03, wy1, 29]]; for (let i = 0; i <= 8; i++) { const th = Math.PI * i / 8; wp.push([x - sg * 0.03, cy + Math.cos(th) * rr, 29 + Math.sin(th) * rr * 2.2]); } wp.push([x - sg * 0.03, wy0, 29]); add(V3poly(wp, [0, ym, 12], { layer: 2, c: GOLD, ca: 0.65, tone: 0.25, bias: -8 })); add(V3poly([[x - sg * 0.04, cy - 0.12, TRI1 + 1], [x - sg * 0.04, cy + 0.12, TRI1 + 1], [x - sg * 0.04, cy + 0.12, 29 + rr * 2.1], [x - sg * 0.04, cy - 0.12, 29 + rr * 2.1]], [0, ym, 12], { layer: 2, tone: 0.9, bias: -10 })); }
        // pier-to-pier arch soffit ring (shows thickness)
        const th2 = 0.55; const ring2 = []; arc.forEach(([yy, zz]) => ring2.push([x, yy, zz])); const ringOut = arc.map(([yy, zz]) => [x - sg * th2, yy, zz]); for (let i = 0; i + 1 < arc.length; i++) add(V3poly([ring2[i], ring2[i + 1], ringOut[i + 1], ringOut[i]], [0, ym, 12], { layer: 2, tone: 0.75, bias: 4 }));
      });
    }
    function V3poly(v, inside, o) { return D.poly3(v, inside, o); }
    // ---- vault: barrel web with ribs (transverse + diagonal + ridge), bosses ----
    const vprof = []; for (let i = 0; i <= 14; i++) { const u = i / 14, x = lerp(-HW + 0.3, HW - 0.3, u), half = HW - 0.3, Rc = (half * half + RISE * RISE) / (2 * half), cxr = u < 0.5 ? -half + Rc : half - Rc, zz = Math.sqrt(Math.max(0, Rc * Rc - (x - cxr) ** 2)); vprof.push([x, SPR + 0.8 + zz - (Rc - RISE) * 0 - (Rc - RISE) * 0 + 0]); }
    { const apex = Math.max(...vprof.map(q => q[1])); void apex;
      for (let b = 0; b + 1 < BAYS.length; b++) { const y0 = BAYS[b] + 0.4, y1 = BAYS[b + 1] - 0.4;
        for (let i = 0; i < 14; i++) { const a = vprof[i], c = vprof[i + 1]; add(V3poly([[a[0], y0, a[1]], [c[0], y0, c[1]], [c[0], y1, c[1]], [a[0], y1, a[1]]], [0, (y0 + y1) / 2, 10], { layer: 2, hard: [false, false, false, false], tone: 0.28 + 0.4 * Math.abs(i - 7) / 7 })); }
        [-1, 1].forEach(sg => { const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, ang = Math.PI * u, xx = sg * lerp(-HW + 0.3, HW - 0.3, u) * -1 * 1, yy = lerp(y0, y1, u), zi = Math.min(Math.floor(u * 14), 13), zz = vprof[Math.round(u * 14)][1] + 0.25; void xx; void ang; void zi; pts.push([lerp(-HW + 0.3, HW - 0.3, sg > 0 ? u : 1 - u) * 1, yy, zz]); } pts.forEach((p, i) => { if (i) { const q = pts[i - 1]; add(D.bodyOfBar3 ? [] : []); void q; } }); D.polyline3(P, pts, cam, { w: 1.6, c: INK, a: 0.9, rough: 0.35 }); D.polyline3(P, pts.map(p => [p[0], p[1], p[2] + 0.18]), cam, { w: 0.7, c: INK, a: 0.6, rough: 0.3 }); });
        const tp = vprof.map(q => [q[0], y0, q[1] + 0.22]); D.polyline3(P, tp, cam, { w: 1.5, c: INK, a: 0.9, rough: 0.3 });
      }
      const ridge = [0, YEND].map(y => [0, y, Math.max(...vprof.map(q => q[1])) + 0.2]); D.polyline3(P, [[0, -32, ridge[0][2]], [0, YEND, ridge[0][2]]], cam, { w: 1.4, c: INK, a: 0.85, rough: 0.35 });
    }
    // ---- east end: apse wall with lancets + rose ----
    { const y = YEND, ins = [0, 30, 15];
      add(V3poly([[-HW, y, 0], [HW, y, 0], [HW, y, 34], [-HW, y, 34]], ins, { layer: 2, tone: 0.3 }));
      add(V3poly([[-HW, y - 0.2, 34], [HW, y - 0.2, 34], [HW, y - 0.2, SPR + 8.5], [0, y - 0.2, SPR + 9.6], [-HW, y - 0.2, SPR + 8.5]], ins, { layer: 2, tone: 0.3 }));
      for (let k = -1; k <= 1; k++) { const cx = k * 4.6, rr = 1.5, wp = [[cx - rr, y - 0.3, 9], [cx + rr, y - 0.3, 9], [cx + rr, y - 0.3, 25]]; for (let i = 0; i <= 7; i++) { const th = Math.PI * i / 7; wp.push([cx + Math.cos(th) * rr, y - 0.3, 25 + Math.sin(th) * rr * 2.6]); } wp.push([cx - rr, y - 0.3, 25]); add(V3poly(wp, ins, { layer: 2, c: GOLD, ca: 0.75, tone: 0, bias: -20, noHatch: true })); }
      const rc = [0, y - 0.3, 34.6], rose = []; for (let i = 0; i < 28; i++) { const a = i * TAU / 28; rose.push([Math.cos(a) * 3.6, y - 0.4, 34.6 + Math.sin(a) * 3.6]); } add(V3poly(rose, ins, { layer: 2, c: GOLD, ca: 0.8, tone: 0, bias: -22, noHatch: true }));
      // altar + reredos + candles
      add(D.extrude([[-2.2, 66], [2.2, 66], [2.2, 68], [-2.2, 68]], 0, 1.3, { crease: 0.3 })); add(D.extrude([[-2.6, 65.6], [2.6, 65.6], [2.6, 68.4], [-2.6, 68.4]], 1.3, 1.5, { crease: 0.3 }));
    }
    // ---- hanging corona lamps ----
    [22, 46].forEach(y => { const z = 24.5, r = 2.1; add(D.ringSolid(0.4, y, r - 0.08, r, z, z + 0.25, 24)); for (let i = 0; i < 10; i++) { const a = i * TAU / 10; add(D.cylinder(0.4 + Math.cos(a) * (r - 0.05), y + Math.sin(a) * (r - 0.05), 0.07, z + 0.25, z + 0.55, 6, { topColor: GOLD })); } D.dashed3(P, [0.4, y, 38], [0.4 + r, y, z], cam, [1, 0], { w: 0.4 }); });
    // ---- pier + figure shadows on the floor, and light pools from the clerestory ----
    const floorShadow = (poly) => { add(D.poly3(poly, [0, 30, 20], { layer: 1, tone: 0.86, noEdge: true, bias: 0 })); };
    pierShadows.forEach(([px, py, h]) => { const dir = [LD[0], LD[1]]; const l = 7.5, a = [px, py - 1.1], b = [px, py + 1.1]; floorShadow([[a[0], a[1], 0.02], [b[0], b[1], 0.02], [b[0] + dir[0] / -LD[2] * h * 0.55, b[1] + dir[1] / -LD[2] * h * 0.55, 0.02], [a[0] + dir[0] / -LD[2] * h * 0.55, a[1] + dir[1] / -LD[2] * h * 0.55, 0.02]]); void l; });
    { const pools = []; for (let b = 0; b + 1 < BAYS.length; b++) { const y0 = BAYS[b] + 0.5, y1 = BAYS[b + 1] - 0.5; [[0.12, 0.45], [0.55, 0.88]].forEach(([f0, f1]) => { const wy0 = lerp(y0, y1, f0), wy1 = lerp(y0, y1, f1), x = -HW; const P0 = D3p([x, wy0, TRI1 + 1]), P1 = D3p([x, wy1, TRI1 + 1]), P2 = D3p([x, wy1, 29 + 4.4]), P3 = D3p([x, wy0, 29 + 4.4]); pools.push([P0, P1, P2, P3]); }); }
      function D3p(p) { return D.onFloor(p, LD, 0.03); }
      pools.forEach(q => { const hull = [q[0], q[1], q[2], q[3]]; const cx = hull.reduce((s, p) => s + p[0], 0) / 4, cy = hull.reduce((s, p) => s + p[1], 0) / 4; const poly = [q[0], q[1], q[2], q[3]]; // pool quad: window sill footprint -> head footprint
        const conv = [q[0], q[1], q[2], q[3]].map(p => [p[0], p[1], 0.05]); const c2 = [[Math.min(q[0][0], q[3][0]), q[0][1], 0.05], [Math.max(q[1][0], q[2][0]), q[1][1], 0.05], [Math.max(q[1][0], q[2][0]), q[2][1], 0.05], [Math.min(q[0][0], q[3][0]), q[3][1], 0.05]]; void conv; void c2; void poly; void cx; void cy;
        const v = [q[0], q[1], q[2], q[3]]; add(D.poly3(v, [0, 30, 20], { layer: 1, tone: 0.0, c: GOLD, ca: 0.55, noEdge: false, noHatch: true, bias: -2, hard: [true, true, true, true] })); });
    }
    // ---- congregation for scale: seven figures ----
    const figure = (x, y, s = 1) => { add(D.extrude([[x - 0.28 * s, y - 0.18], [x + 0.28 * s, y - 0.18], [x + 0.34 * s, y + 0.2], [x - 0.34 * s, y + 0.2]], 0, 1.35 * s, { crease: 0.4 })); add(D.cylinder(x, y, 0.16 * s, 1.35 * s, 1.68 * s, 10)); floorShadow([[x - 0.3, y, 0.02], [x + 0.3, y, 0.02], [x + 0.3 + 1.5 * s, y + 0.3, 0.02], [x - 0.3 + 1.5 * s, y + 0.3, 0.02]]); };
    [[-2.6, 9.6], [-1.2, 11.1], [0.6, 12.2], [2.4, 14.4], [-3.4, 17.2], [1.5, 20.5], [-0.4, 26], [2.4, 31.5]].forEach(([x, y], i) => figure(x, y, 1 + (i % 3) * 0.04));
    D.render(P, faces, cam, { ink: INK, paper: PAPER, light: [0.4, 0.15, 0.9], ambient: 0.22, gap: 5.2, w: 1.15, fog: [14, 78], zw: 0 });
    /* ---- volumetric shafts: fine light lines from each window to its pool, drawn on top of everything with fog ---- */
    for (let b = 0; b + 1 < BAYS.length; b++) { const y0 = BAYS[b] + 0.5, y1 = BAYS[b + 1] - 0.5; [[0.12, 0.45], [0.55, 0.88]].forEach(([f0, f1]) => { const wy0 = lerp(y0, y1, f0), wy1 = lerp(y0, y1, f1); for (let k = 0; k <= 10; k++) { const u = k / 10, wy = lerp(wy0, wy1, u), zt = 25 + 3.5 * Math.sin(Math.PI * u), p0 = [-HW + 0.3, wy, zt]; const hit = D.onFloor(p0, LD, 0.05); const a = cam.project(p0), c = cam.project(hit); if (a && c && b > 3 && b < 9) P.line(a[0], a[1], c[0], c[1], { w: 0.4, c: '#8a6420', a: 0.2, passes: 1, over: 0, rough: 0.3 }); } }); }
    P.text('THE NAVE, LOOKING EAST', 84, 918, { size: 22, c: INK, font: S.HAND, a: 0.95 }); P.text('PLATE XI  -  ONE-POINT PERSPECTIVE, SUN AT 10 O\'CLOCK', 84, 938, { size: 10, c: INK, a: 0.85 });
    P.rect(46, 46, 1508, 908, { w: 1.4, c: INK, a: 0.9, rough: 0.4, over: 1, passes: 1 });
  }
});
