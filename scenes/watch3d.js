/* SHEET 10 — The grand-complication movement in true perspective: an exploded axial view with real depth. */
(window.SCENES = window.SCENES || []).push({
  name: 'Watch (3D)', seed: 101, ink: '#15151a', theme: 'ink',
  build(P, n, t) {
    const S = Sketch, D = S.D3, V = S.V3, TAU = S.TAU, lerp = S.lerp;
    const INK = '#15151a', RED = '#c1272d', RUBY = '#d8434b', MID = '#5a5a60';
    const R = (a, b) => P.r(a, b);
    P.frame('CALIBRE 9  -  EXPLODED VIEW', 'AXIAL EXPLOSION IN DEPTH', n, t, { scale: 'SCALE 4 : 1', note: 'perspective, ink + red' });
    const K = 0.8, W = (px, py) => [(px - 474) * K, -(py - 494) * K];                // plate coords -> world XY
    const cam = D.camera({ eye: [0, 0, 0], target: [0, 0, 0] });                     // replaced below
    const tgt = [10, 30, 250], yaw = 0.52, pit = 0.5, Dd = 1750;
    const C3 = D.camera({ eye: [tgt[0] + Dd * Math.sin(yaw) * Math.cos(pit), tgt[1] - Dd * Math.cos(yaw) * Math.cos(pit), tgt[2] + Dd * Math.sin(pit)], target: tgt, f: 1720, cx: 476, cy: 470 });
    void cam;
    const ring2 = (cx, cy, r0, r1, z0, z1, seg = 32, o = {}) => D.ringSolid(cx, cy, r0, r1, z0, z1, seg, o);
    const faces = [];
    const add = f => { f.forEach(x => faces.push(x)); return f; };
    const jew = (x, y, z, r = 3.6) => { add(D.cylinder(x, y, r + 3.4, z, z + 3.2, 14)); add(D.cylinder(x, y, r, z + 3.2, z + 5.2, 14, { topColor: RUBY, sideColor: RUBY })); };
    const sdisc = (cx, cy, r, z0, z1, seg = 40, o = {}) => D.cylinder(cx, cy, r, z0, z1, seg, o);
    /* an open wheel with real spoke windows and a hub */
    const wheel = (cx, cy, r, z, z0, z1, rot, o = {}) => {
      const sp = o.spokes ?? 5, rimIn = r * 0.74, hub = r * 0.2, out = [];
      out.push(...D.gearMesh(cx, cy, r, z, z0, z1, rot, { root: 0.86, ghost: false }));
      for (let i = 0; i < sp; i++) { const a0 = rot + i * TAU / sp + 0.11, a1 = rot + (i + 1) * TAU / sp - 0.11, w = []; for (let q = 0; q <= 5; q++) { const a = lerp(a0, a1, q / 5); w.push([cx + Math.cos(a) * rimIn, cy + Math.sin(a) * rimIn, z1 + 0.15]); } for (let q = 5; q >= 0; q--) { const a = lerp(a0 + 0.03, a1 - 0.03, q / 5); w.push([cx + Math.cos(a) * hub * 1.5, cy + Math.sin(a) * hub * 1.5, z1 + 0.15]); } out.push({ v: w, n: [0, 0, 1], hard: w.map(() => true), all: true, bias: 2, dark: true }); }
      out.push(...D.cylinder(cx, cy, hub, z1, z1 + 5, 16, { crease: 3 }));
      return out;
    };
    const hullPts = (centers, w, k = 12) => { const pts = []; centers.forEach(([cx, cy]) => { for (let i = 0; i < k; i++) { const a = i * TAU / k; pts.push([cx + Math.cos(a) * w, cy + Math.sin(a) * w]); } }); pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = []; pts.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }); pts.slice().reverse().forEach(q => { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }); lo.pop(); up.pop(); return lo.concat(up); };
    const zBack = 0, zCase = 26, zPlate = 100, zTrain = 108;

    /* ---- layer 0: sapphire case-back (ghost) and the case middle with crown ---- */
    add(sdisc(0, 0, 286, zBack, zBack + 5, 56, { ghost: true }));
    add(ring2(0, 0, 268, 296, zCase, zCase + 48, 56));
    add(D.extrude([[292, -13], [340, -13], [340, 13], [292, 13]], zCase + 14, zCase + 36, { crease: 0.3 })); add(D.extrude([[336, -19], [366, -19], [366, 19], [336, 19]], zCase + 8, zCase + 42, { crease: 0.3 }));
    /* ---- layer 1: main plate with jewel settings ---- */
    add(sdisc(0, 0, 262, zPlate, zPlate + 10, 60));
    const pivots = { B: W(352, 404), CW: W(474, 494), TW: W(561, 421), FW: W(636, 448), TB: W(636, 558) };
    Object.values(pivots).forEach(([x, y]) => jew(x, y, zPlate + 10));
    /* ---- layer 2: going train ---- */
    { const [bx, by] = pivots.B; const zt = zTrain + 4;
      add(wheel(pivots.CW[0], pivots.CW[1], 70 * K, 40, zt, zt + 6, 0.11, { spokes: 5 }));
      add(wheel(pivots.TW[0], pivots.TW[1], 44 * K, 30, zt + 10, zt + 16, 0.06, { spokes: 4 }));
      add(wheel(pivots.FW[0], pivots.FW[1], 36 * K, 24, zt + 20, zt + 26, 0.02, { spokes: 4 }));
      // barrel: base + toothed wall with a quarter cut away, red mainspring inside
      add(D.gearMesh(bx, by, 86 * K, 44, zt - 2, zt + 4, 0.02, { root: 0.86 }));
      add(ring2(bx, by, 66 * K, 72 * K, zt + 4, zt + 34, 40, { a0: 0.9, a1: 0.9 + TAU * 0.78 }));
      const sp = [], sq = [], turns = 6.2; for (let a = 0; a <= turns * TAU; a += 0.16) { const r = (20 + a * (44 / (turns * TAU))) * K; sp.push([bx + Math.cos(a + 0.6) * r, by + Math.sin(a + 0.6) * r]); } for (let a = turns * TAU; a >= 0; a -= 0.16) { const r = (20 + a * (44 / (turns * TAU)) + 3.4) * K; sq.push([bx + Math.cos(a + 0.6) * r, by + Math.sin(a + 0.6) * r]); }
      add(D.extrude(sp.concat(sq), zt + 4, zt + 24, { topColor: RUBY, sideColor: RUBY, crease: 1.2 }));
      add(D.cylinder(bx, by, 15 * K, zt + 4, zt + 38, 18)); add(D.gearMesh(bx, by, 36 * K, 24, zt + 38, zt + 44, 0.2, { root: 0.8 }));
    }



    /* ---- more of the works, in depth: perlage, strike train, repeater snail + rack, governor, power reserve, winding, gong ---- */
    { const plateTop = zPlate + 10.4;
      faces.push({ custom: (PP, cm) => { const pts = []; for (let row = 0, y = -250; y < 250; y += 9 * 0.866, row++) for (let x = -250 + (row % 2) * 4.5; x < 250; x += 9) { if (Math.hypot(x, y) < 252) { const q = cm.project([x, y, plateTop]); if (q) pts.push([q[0], q[1], 0.6]); } } PP.dots(pts, INK, 0.2); }, c: [0, 0, plateTop], bias: 30 });
      const SN = W(474, 704), zs = zTrain + 4;
      const sn = []; for (let k = 0; k < 12; k++) { const r = (62 - k * 2.5) * K, a0 = Math.PI / 2 - k * TAU / 12, a1 = a0 - TAU / 12; for (let q = 0; q <= 3; q++) { const a = lerp(a0, a1, q / 3); sn.push([SN[0] + Math.cos(a) * r, SN[1] + Math.sin(a) * r]); } }
      add(D.extrude(sn, zs, zs + 12, { crease: 0.4 })); add(D.cylinder(SN[0], SN[1], 7, zs + 12, zs + 22, 12)); jew(SN[0], SN[1], zs + 22, 2.2);
      const RPv = W(560, 776); add(D.ringSolid(RPv[0], RPv[1], 54 * K, 66 * K, zs, zs + 6, 22, { a0: -4.5, a1: -3.4 })); add(D.bodyOfBar(RPv, [SN[0] + 26 * K, SN[1] - 46 * K], 3.2, 2, zs + 6, zs + 10, { crease: 0.3 })); add(D.cylinder(RPv[0], RPv[1], 6, zs, zs + 14, 12)); add(D.cylinder(SN[0] + 26 * K, SN[1] - 46 * K, 2.4, zs + 6, zs + 12, 8, { topColor: RUBY, sideColor: RUBY }));
      const G = W(340, 664), SW = W(420, 780), SW2 = W(352, 730);
      add(wheel(SW[0], SW[1], 30 * K, 30, zs, zs + 5, 0.03, { spokes: 4 })); add(wheel(SW2[0], SW2[1], 24 * K, 24, zs + 8, zs + 13, 0.08, { spokes: 4 })); add(D.gearMesh(G[0], G[1], 22 * K, 20, zs + 16, zs + 20, 0.1, { root: 0.82 }));
      const G2 = W(296, 710); add(D.bodyOfBar([G2[0] - 20, G2[1] - 10], [G2[0] + 20, G2[1] + 10], 2.6, 2.6, zs + 22, zs + 26, { crease: 0.3 })); [[-20, -10], [20, 10]].forEach(([dx, dy]) => add(D.cylinder(G2[0] + dx, G2[1] + dy, 3.4, zs + 26, zs + 32, 10, { topColor: RUBY, sideColor: RUBY }))); add(D.cylinder(G2[0], G2[1], 4, zs + 22, zs + 36, 10));
      const PD = W(208, 640); add(wheel(PD[0], PD[1], 34 * K, 36, zs, zs + 5, 0.06, { spokes: 5 })); [0.5, 0.5 + Math.PI].forEach(a => { add(D.gearMesh(PD[0] + Math.cos(a) * 34 * K, PD[1] + Math.sin(a) * 34 * K, 12 * K, 14, zs + 8, zs + 12, 0.2, { root: 0.8 })); }); add(D.ringSolid(PD[0], PD[1], 50 * K, 62 * K, zs, zs + 4, 24, { a0: -2.7, a1: -1.05, topColor: RUBY }));
      // winding works at 3 o'clock: stem, clutch, crown wheel
      const CL = W(742, 494), CRW = W(750, 432); add(D.bodyOfBar([CL[0] - 8, CL[1]], [260, CL[1]], 3, 3, zs, zs + 5, { crease: 0.3 })); add(D.gearMesh(CL[0], CL[1], 20 * K, 16, zs, zs + 6, 0.05, { root: 0.8 })); add(wheel(CRW[0], CRW[1], 26 * K, 24, zs + 6, zs + 11, 0.1, { spokes: 4 }));
      // repeater gong wire ring on the plate rim and two hammers
      add(D.ringSolid(0, 0, 240, 246, zTrain, zTrain + 5, 64, { a0: -1.9, a1: 2.8 })); add(D.ringSolid(0, 0, 231, 236, zTrain, zTrain + 5, 64, { a0: -1.7, a1: 2.6 }));
      [[2.42, 1], [2.12, 2]].forEach(([a, k]) => { const hx = Math.cos(-a) * 264 * 0.78, hy = Math.sin(-a) * 264 * 0.78; add(D.bodyOfBar([hx, hy], [hx + 18, hy - 22], 2.6, 2, zTrain, zTrain + 4, { crease: 0.3 })); add(D.cylinder(hx, hy, 5, zTrain, zTrain + 9, 10)); void k; });
      // case screws on the case middle and slotted screws on bridges
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + 0.26, x = Math.cos(a) * 282, y = Math.sin(a) * 282; add(D.cylinder(x, y, 4.6, zCase + 48, zCase + 50.5, 12)); add(D.bodyOfBar([x - Math.cos(a + 0.7) * 3.4, y - Math.sin(a + 0.7) * 3.4], [x + Math.cos(a + 0.7) * 3.4, y + Math.sin(a + 0.7) * 3.4], 0.5, 0.5, zCase + 50.5, zCase + 51.4, { crease: 0.3 })); }
      [W(300, 470), W(322, 380), W(560, 378), W(620, 470), W(560, 680), W(612, 630)].forEach(([x, y]) => { add(D.cylinder(x, y, 3.8, zTrain + 40, zTrain + 44, 10)); });
    }

    /* ---- layer 3: tourbillon, exploded in five sub-layers around its own axis ---- */
    const TBc = pivots.TB, zT0 = 150, zEsc = 190, zBal = 232, zTop = 270;
    { const [tx, ty] = TBc;
      add(D.gearMesh(tx, ty, 76 * K, 72, zT0, zT0 + 6, 0.02, { root: 0.9 }));
      add(ring2(tx, ty, 54 * K, 66 * K, zT0 + 6, zT0 + 9, 36));
      for (let i = 0; i < 3; i++) { const a = 0.52 + i * TAU / 3; add(D.bodyOfBar([tx + Math.cos(a) * 12, ty + Math.sin(a) * 12], [tx + Math.cos(a) * 58 * K, ty + Math.sin(a) * 58 * K], 3.4, 2.8, zT0 + 9, zT0 + 17, { crease: 0.3 })); }
      [0.9, 3, 5.1].forEach(a => add(D.cylinder(tx + Math.cos(a) * 58 * K, ty + Math.sin(a) * 58 * K, 3.2, zT0 + 17, zEsc - 4, 10)));
      add(D.gearMesh(tx, ty - 18 * K, 18 * K, 15, zEsc, zEsc + 3, 0.2, { root: 0.7 })); add(D.cylinder(tx, ty - 18 * K, 4, zEsc + 3, zEsc + 8, 10));
      add(D.bodyOfBar([tx, ty + 6 * K], [tx - 16 * K, ty - 4 * K], 2.4, 1.8, zEsc + 6, zEsc + 9, { crease: 0.3 })); add(D.bodyOfBar([tx, ty + 6 * K], [tx + 16 * K, ty - 4 * K], 2.4, 1.8, zEsc + 6, zEsc + 9, { crease: 0.3 })); add(D.bodyOfBar([tx, ty + 6 * K], [tx, ty + 34 * K], 2.2, 1.6, zEsc + 6, zEsc + 9, { crease: 0.3 }));
      add(D.cylinder(tx - 16 * K, ty - 4 * K, 2.6, zEsc + 9, zEsc + 12, 8, { topColor: RUBY, sideColor: RUBY })); add(D.cylinder(tx + 16 * K, ty - 4 * K, 2.6, zEsc + 9, zEsc + 12, 8, { topColor: RUBY, sideColor: RUBY }));
      const bc = [tx, ty + 8 * K];
      add(ring2(bc[0], bc[1], 34 * K, 42 * K, zBal, zBal + 4, 44)); [0.3, 2.4, 4.5].forEach(a => add(D.bodyOfBar([bc[0] + Math.cos(a) * 5, bc[1] + Math.sin(a) * 5], [bc[0] + Math.cos(a) * 36 * K, bc[1] + Math.sin(a) * 36 * K], 2, 1.6, zBal, zBal + 3, { crease: 0.3 })));
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + 0.1; add(D.cylinder(bc[0] + Math.cos(a) * 41 * K, bc[1] + Math.sin(a) * 41 * K, 2.2, zBal + 4, zBal + 9, 8)); }
      { const hp = [], hq = [], tn = 9; for (let a = 0; a <= tn * TAU; a += 0.2) { const r = (5 + a * (20 / (tn * TAU))) * K; hp.push([bc[0] + Math.cos(a + 1) * r, bc[1] + Math.sin(a + 1) * r]); } for (let a = tn * TAU; a >= 0; a -= 0.2) { const r = (5 + a * (20 / (tn * TAU)) + 0.9) * K; hq.push([bc[0] + Math.cos(a + 1) * r, bc[1] + Math.sin(a + 1) * r]); } add(D.extrude(hp.concat(hq), zBal + 16, zBal + 17.5, { topColor: RED, sideColor: RED, crease: 2 })); }
      add(D.cylinder(bc[0], bc[1], 3.4, zBal, zBal + 24, 10));
      [0.52, 2.62, 4.72].forEach(a => add(D.bodyOfBar([tx, ty], [tx + Math.cos(a) * 62 * K, ty + Math.sin(a) * 62 * K], 3.6, 2.8, zTop, zTop + 6, { crease: 0.3 }))); add(D.cylinder(tx, ty, 9, zTop, zTop + 6, 14)); jew(tx, ty, zTop + 6, 3);
    }
    /* ---- layer 4: bridges ---- */
    { const zb = 304, br = (cs, w) => { const h = hullPts(cs, w); add(D.extrude(h, zb, zb + 8, { crease: 0.6 })); cs.forEach(([x, y]) => jew(x, y, zb + 8, 3)); };
      br([pivots.CW, pivots.TW, pivots.FW], 13);
      br([W(196, 508), W(268, 556), W(330, 520)], 18);
      [[W(230, 532)], [W(300, 546)]].forEach(([q]) => { add(D.cylinder(q[0], q[1], 4, zb + 8, zb + 11, 12)); });
    }


    /* ---- layer 5: perpetual-calendar module on its own sector plate ---- */
    { const zc = 366, PC = W(474, 222), MS = W(566, 258), DS = W(386, 258), MP = W(486, 330);
      add(ring2(0, 0, 118, 256, zc - 6, zc, 48, { a0: 0.52, a1: 2.62 }));
      const ml = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], cam = []; for (let k = 0; k < 48; k++) { const len = k === 37 ? 29 : ml[k % 12], r = (20 + (len - 24) * 4.6) * K, a0 = Math.PI / 2 - k * TAU / 48, a1 = a0 - TAU / 48; cam.push([PC[0] + Math.cos(a0) * r, PC[1] + Math.sin(a0) * r], [PC[0] + Math.cos(a1) * r, PC[1] + Math.sin(a1) * r]); }
      add(D.extrude(cam, zc, zc + 12, { crease: 0.4 }));
      { const a0 = Math.PI / 2 - 37 * TAU / 48, a1 = a0 - TAU / 48, r = (20 + 5 * 4.6) * K; add(D.extrude([[PC[0] + Math.cos(a0) * 14, PC[1] + Math.sin(a0) * 14], [PC[0] + Math.cos(a0) * r, PC[1] + Math.sin(a0) * r], [PC[0] + Math.cos(a1) * r, PC[1] + Math.sin(a1) * r], [PC[0] + Math.cos(a1) * 14, PC[1] + Math.sin(a1) * 14]], zc + 12, zc + 13.4, { topColor: RED, sideColor: RED, crease: 3 })); }
      add(D.cylinder(PC[0], PC[1], 8, zc + 12, zc + 22, 14)); jew(PC[0], PC[1], zc + 22, 2.6);
      { const pts = []; for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + 0.2; pts.push([MS[0] + Math.cos(a - 0.11) * 18 * K, MS[1] + Math.sin(a - 0.11) * 18 * K], [MS[0] + Math.cos(a) * 31 * K, MS[1] + Math.sin(a) * 31 * K], [MS[0] + Math.cos(a + 0.11) * 18 * K, MS[1] + Math.sin(a + 0.11) * 18 * K]); } add(D.extrude(pts, zc, zc + 8, { crease: 0.3 })); add(D.cylinder(MS[0], MS[1], 6, zc + 8, zc + 14, 12)); }
      add(D.gearMesh(DS[0], DS[1], 40 * K, 31, zc, zc + 7, 0.1, { root: 0.86 })); add(D.cylinder(DS[0], DS[1], 8, zc + 7, zc + 12, 12)); jew(DS[0], DS[1], zc + 12, 2.4);
      add(D.gearMesh(MP[0], MP[1], 40 * K, 40, zc, zc + 6, 0, { root: 0.94 })); [0, Math.PI].forEach(a => add(D.cylinder(MP[0] + Math.cos(a + 1.2) * 20 * K, MP[1] + Math.sin(a + 1.2) * 20 * K, 8 * K + 1, zc + 6, zc + 10, 14))); add(D.cylinder(MP[0], MP[1], 5, zc + 6, zc + 12, 10));
      [[MS[0] + 46 * K, MS[1] - 20 * K], [DS[0] - 44 * K, DS[1] + 12 * K]].forEach(([x, y]) => { add(D.cylinder(x, y, 4.4, zc, zc + 8, 10)); });
    }
    /* ---- layer 6: dial (ghost), hour markers, hands, and the crystal (ghost) ---- */
    { const zd = 452; add(ring2(0, 0, 176, 262, zd, zd + 3, 56, { ghost: true }));
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12, r = 236, cx = Math.cos(a) * r, cy = Math.sin(a) * r, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux, L = i % 3 === 0 ? 16 : 10, w = i % 3 === 0 ? 3.6 : 2.4; add(D.extrude([[cx - ux * L + nx * w, cy - uy * L + ny * w], [cx + ux * L + nx * w, cy + uy * L + ny * w], [cx + ux * L - nx * w, cy + uy * L - ny * w], [cx - ux * L - nx * w, cy - uy * L - ny * w]], zd + 3, zd + 8, { crease: 0.3, topColor: i === 0 ? RED : undefined })); }
      const zh = 496; add(D.cylinder(0, 0, 9, zh - 30, zh + 12, 16));
      const hand = (ang, len, w, z, red) => { const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux; add(D.extrude([[ux * -20 + nx * w * 0.5, uy * -20 + ny * w * 0.5], [ux * len * 0.32 + nx * w * 1.6, uy * len * 0.32 + ny * w * 1.6], [ux * len, uy * len], [ux * len * 0.32 - nx * w * 1.6, uy * len * 0.32 - ny * w * 1.6], [ux * -20 - nx * w * 0.5, uy * -20 - ny * w * 0.5]], z, z + 3, { crease: 0.4 })); if (red) add(D.extrude([[ux * len * 0.78 + nx * w * 0.9, uy * len * 0.78 + ny * w * 0.9], [ux * len, uy * len], [ux * len * 0.78 - nx * w * 0.9, uy * len * 0.78 - ny * w * 0.9]], z + 3, z + 4, { topColor: RED, sideColor: RED, crease: 3 })); };
      hand(Math.PI / 2 + 0.55 * 1.0 + 1.0, 128, 6, zh, false); hand(Math.PI / 2 - 1.04, 196, 4.4, zh + 6, true);
      const zk = 560; add(sdisc(0, 0, 262, zk, zk + 4, 56, { ghost: true }));
    }


    /* ================= detail plates in their own cameras: real depth, close up ================= */
    const dplate = (x0, y0, w, h, title, sub) => { P.rect(x0, y0, w, h, { w: 1.3, c: INK, a: 0.95, rough: 0.3, over: 1, passes: 1 }); P.rect(x0 + 4, y0 + 4, w - 8, h - 8, { w: 0.4, c: INK, a: 0.5, rough: 0.3, over: 0, passes: 1 }); P.text(title, x0 + 14, y0 + 20, { size: 12, c: INK, font: S.HAND, a: 0.97 }); if (sub) P.text(sub, x0 + 14, y0 + 34, { size: 7.4, c: MID, a: 0.95 }); };
    const dcam = (x0, y0, w, h, tg, yawv, pitv, dist, f, dy = 14) => D.camera({ eye: [tg[0] + dist * Math.sin(yawv) * Math.cos(pitv), tg[1] - dist * Math.cos(yawv) * Math.cos(pitv), tg[2] + dist * Math.sin(pitv)], target: tg, f, cx: x0 + w / 2, cy: y0 + h / 2 + dy });
    const rotz = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    /* --- the lever escapement as a solid: wheel, fork with ruby pallets, roller table with the red impulse jewel --- */
    const escape3D = (phi, theta, psi) => {
      const out = [], a = -theta; const RP = (x, y) => rotz(x, y, a);
      // escape wheel (club teeth) with spoke windows
      const wp = []; for (let k = 0; k < 15; k++) { const b = (psi + k * 24) * Math.PI / 180; [[-0.10, 34], [-0.03, 50.5], [0.03, 52], [0.075, 48], [0.17, 34], [0.29, 34]].forEach(([f, rr]) => wp.push([Math.cos(-b - f) * rr, -72 + Math.sin(-b - f) * rr])); }
      out.push(...D.extrude(wp, 0, 5, { crease: 0.5 }));
      for (let i = 0; i < 6; i++) { const a0 = -i * Math.PI / 3 + 0.15, a1 = a0 - Math.PI / 3 + 0.3, w = []; for (let q = 0; q <= 4; q++) { const t = a0 + (a1 - a0) * q / 4; w.push([Math.cos(t) * 30, -72 + Math.sin(t) * 30, 5.2]); } for (let q = 4; q >= 0; q--) { const t = a0 + (a1 - a0) * q / 4; w.push([Math.cos(t) * 11, -72 + Math.sin(t) * 11, 5.2]); } out.push({ v: w, n: [0, 0, 1], hard: w.map(() => true), all: true, bias: 2 }); }
      out.push(...D.cylinder(0, -72, 8, 5, 12, 14)); out.push(...D.cylinder(0, -72, 4.4, 12, 14, 12, { topColor: RUBY, sideColor: RUBY }));
      // fork: two arms, tail with horns, pivot boss
      const bar = (p1, p2, w0, w1, z0, z1) => D.bodyOfBar(p1, p2, w0, w1, z0, z1, { crease: 0.3 });
      const sL = RP(-30.6, -30), sR = RP(30.6, -30), tl = RP(0, 58);
      out.push(...bar([0, 0], sL, 5.4, 4.2, 8, 13)); out.push(...bar([0, 0], sR, 5.4, 4.2, 8, 13)); out.push(...bar([0, 0], tl, 4.8, 3.6, 8, 13));
      [-1, 1].forEach(q => { const h1 = RP(q * 3.6, 56), h2 = RP(q * 3.8, 76); out.push(...bar(h1, h2, 2.2, 1.8, 8, 15)); });
      [sL, sR].forEach(q => out.push(...D.cylinder(q[0], q[1], 5, 13, 19, 10, { topColor: RUBY, sideColor: RUBY })));
      out.push(...D.cylinder(0, 0, 8, 13, 17, 14));
      [[-46, -34], [46, -34]].forEach(([x, y]) => out.push(...D.cylinder(x, y, 3.6, 0, 24, 10)));
      // roller table with the impulse jewel hanging into the fork slot, safety roller below
      const bcx = 0, bcy = 84; out.push(...D.cylinder(bcx, bcy, 24, 20, 25, 30)); out.push(...D.cylinder(bcx, bcy, 12.4, 25, 28, 20));
      const ip = [bcx + 14 * Math.sin(phi), bcy - 14 * Math.cos(phi)]; out.push(...D.cylinder(ip[0], ip[1], 3.6, 14, 25, 10, { topColor: RUBY, sideColor: RUBY }));
      // balance rim (ring) and three arms floating above
      out.push(...D.ringSolid(bcx, bcy, 56, 66, 36, 41, 40)); [0.4, 2.5, 4.6].forEach(q => out.push(...bar([bcx, bcy], [bcx + Math.cos(q) * 60, bcy + Math.sin(q) * 60], 3, 2.4, 36, 40)));
      out.push(...D.cylinder(bcx, bcy, 6, 28, 40, 12));
      return out;
    };
    const stg = [['LOCKED', 'TOOTH RESTS ON THE ENTRY PALLET', -1.05, -0.09, 18.0], ['IMPULSE', 'FORK FLIPS: THE WHEEL PUSHES', 0.0, 0.0, 24.0]];
    stg.forEach(([tt, sb, phi, th, psi], i) => { const x0 = 930 + i * 312, y0 = 58, w = 300, h = 272; dplate(x0, y0, w, h, `ESCAPEMENT: ${tt}`, sb); const cm = dcam(x0, y0, w, h, [0, 14, 12], 0.5 - i * 0.18, 0.7, 520, 410, 6); D.render(P, escape3D(phi, th, psi), cm, { ink: INK, gap: 4.6, w: 1.05 }); const ipp = cm.project([14 * Math.sin(phi), 84 - 14 * Math.cos(phi), 22]); if (ipp) P.note('IMPULSE JEWEL', x0 + 196, y0 + 52, ipp[0], ipp[1], { size: 8, c: INK }); const pp = cm.project([-30, -30, 17]); if (pp) P.note('RUBY PALLET', x0 + 14, y0 + 256, pp[0], pp[1], { size: 8, c: INK }); const ww = cm.project([44, -50, 5]); if (ww) P.note('ESCAPE WHEEL', x0 + 196, y0 + 256, ww[0], ww[1], { size: 8, c: INK }); });
    /* --- mainspring barrel: quarter cut away, spring in red, ratchet and click exploded above --- */
    { const x0 = 930, y0 = 340, w = 300, h = 272; dplate(x0, y0, w, h, 'MAINSPRING BARREL, CUT AWAY', '8.4 TURNS, RATCHET + CLICK LIFTED OFF'); const F = [];
      F.push(...D.gearMesh(0, 0, 86, 56, 0, 6, 0.02, { root: 0.88 })); F.push(...D.ringSolid(0, 0, 66, 74, 6, 40, 56, { a0: 0.5, a1: 0.5 + TAU * 0.72 }));
      const sp = [], sq = [], turns = 6.6; for (let a = 0; a <= turns * TAU; a += 0.14) { const r = 20 + a * (44 / (turns * TAU)); sp.push([Math.cos(a + 0.6) * r, Math.sin(a + 0.6) * r]); } for (let a = turns * TAU; a >= 0; a -= 0.14) { const r = 20 + a * (44 / (turns * TAU)) + 3.2; sq.push([Math.cos(a + 0.6) * r, Math.sin(a + 0.6) * r]); }
      F.push(...D.extrude(sp.concat(sq), 6, 30, { topColor: RUBY, sideColor: RUBY, crease: 1.2 })); F.push(...D.cylinder(0, 0, 15, 6, 44, 20)); F.push({ v: D.circlePts(0, 0, 6, 10).map(q => [q[0], q[1], 44.2]), n: [0, 0, 1], hard: Array(10).fill(true), all: true });
      const rp = []; for (let i = 0; i < 36; i++) { const a = i * TAU / 36 - 0.4; rp.push([Math.cos(a) * 36, Math.sin(a) * 36], [Math.cos(a + 0.17) * 30, Math.sin(a + 0.17) * 30]); } F.push(...D.extrude(rp, 84, 92, { crease: 0.5 })); F.push(...D.cylinder(0, 0, 12, 92, 98, 14));
      F.push(...D.bodyOfBar([-50, 26], [-24, 30], 4, 3, 84, 90, { crease: 0.3 })); F.push(...D.cylinder(-52, 26, 6, 84, 92, 12));
      const cm = dcam(x0, y0, w, h, [0, 0, 44], 0.42, 0.62, 560, 640, 6); D.render(P, F, cm, { ink: INK, gap: 4.4, w: 1.05 });
      D.dashed3(P, [0, 0, 44], [0, 0, 84], cm, [6, 4], { w: 0.6, c: RED, a: 0.9 }); const q1 = cm.project([30, 0, 20]); if (q1) P.note('MAINSPRING', x0 + 206, y0 + 74, q1[0], q1[1], { size: 8, c: INK }); const q2 = cm.project([0, 30, 92]); if (q2) P.note('RATCHET WHEEL', x0 + 196, y0 + 44, q2[0], q2[1], { size: 8, c: INK }); const q3 = cm.project([-52, 26, 92]); if (q3) P.note('CLICK', x0 + 16, y0 + 74, q3[0], q3[1], { size: 8, c: INK }); const q4 = cm.project([-80, -20, 4]); if (q4) P.note('TOOTHED DRUM, 80 T', x0 + 16, y0 + 252, q4[0], q4[1], { size: 8, c: INK }); }
    /* --- tourbillon cage assembled, seen from a low angle --- */
    { const x0 = 1242, y0 = 340, w = 300, h = 272; dplate(x0, y0, w, h, 'TOURBILLON CAGE, ASSEMBLED', 'TURNS ONCE A MINUTE, CANCELS GRAVITY ERROR'); const F = [];
      F.push(...D.gearMesh(0, 0, 76, 96, 0, 6, 0.02, { root: 0.92 })); F.push(...D.ringSolid(0, 0, 58, 66, 6, 10, 40));
      for (let i = 0; i < 3; i++) { const a = 0.52 + i * TAU / 3; F.push(...D.bodyOfBar([Math.cos(a) * 12, Math.sin(a) * 12], [Math.cos(a) * 60, Math.sin(a) * 60], 3.6, 3, 10, 16, { crease: 0.3 })); F.push(...D.cylinder(Math.cos(a + 0.5) * 60, Math.sin(a + 0.5) * 60, 3.6, 10, 46, 10)); }
      F.push(...D.gearMesh(0, -22, 19, 15, 16, 19, 0.2, { root: 0.7 })); F.push(...D.bodyOfBar([0, 4], [-16, -8], 2.4, 1.8, 20, 23, { crease: 0.3 })); F.push(...D.bodyOfBar([0, 4], [16, -8], 2.4, 1.8, 20, 23, { crease: 0.3 })); F.push(...D.bodyOfBar([0, 4], [0, 32], 2.2, 1.6, 20, 23, { crease: 0.3 }));
      F.push(...D.cylinder(-16, -8, 2.6, 23, 26, 8, { topColor: RUBY, sideColor: RUBY })); F.push(...D.cylinder(16, -8, 2.6, 23, 26, 8, { topColor: RUBY, sideColor: RUBY }));
      F.push(...D.ringSolid(0, 8, 33, 42, 28, 32, 44)); [0.3, 2.4, 4.5].forEach(a => F.push(...D.bodyOfBar([Math.cos(a) * 5, 8 + Math.sin(a) * 5], [Math.cos(a) * 36, 8 + Math.sin(a) * 36], 2, 1.6, 28, 31, { crease: 0.3 })));
      for (let i = 0; i < 14; i++) { const a = i * TAU / 14 + 0.1; F.push(...D.cylinder(Math.cos(a) * 41.5, 8 + Math.sin(a) * 41.5, 2.2, 32, 37, 8)); }
      { const hp = [], hq = [], tn = 9; for (let a = 0; a <= tn * TAU; a += 0.2) { const r = 5 + a * (22 / (tn * TAU)); hp.push([Math.cos(a + 1) * r, 8 + Math.sin(a + 1) * r]); } for (let a = tn * TAU; a >= 0; a -= 0.2) { const r = 5 + a * (22 / (tn * TAU)) + 0.9; hq.push([Math.cos(a + 1) * r, 8 + Math.sin(a + 1) * r]); } F.push(...D.extrude(hp.concat(hq), 38, 39.6, { topColor: RED, sideColor: RED, crease: 2 })); }
      [0.52, 2.62, 4.72].forEach(a => F.push(...D.bodyOfBar([0, 0], [Math.cos(a) * 64, Math.sin(a) * 64], 4, 3, 46, 52, { crease: 0.3 }))); F.push(...D.cylinder(0, 0, 10, 46, 56, 16)); F.push(...D.cylinder(0, 0, 4, 56, 59, 12, { topColor: RUBY, sideColor: RUBY }));
      const cm = dcam(x0, y0, w, h, [0, 0, 24], 0.5, 0.5, 640, 800, 12); D.render(P, F, cm, { ink: INK, gap: 4.4, w: 1.05 });
      const u = cm.project([0, 8, 38]); if (u) P.note('RED HAIRSPRING', x0 + 206, y0 + 60, u[0], u[1], { size: 8, c: INK }); const v = cm.project([-16, -8, 26]); if (v) P.note('PALLET RUBY', x0 + 14, y0 + 58, v[0], v[1], { size: 8, c: INK }); const q = cm.project([0, 0, 58]); if (q) P.note('CAGE BRIDGE JEWEL', x0 + 170, y0 + 254, q[0], q[1], { size: 8, c: INK }); }
    /* --- jewel bearing with shock protection: cut-away in three-quarter view --- */
    { const x0 = 930, y0 = 622, w = 300, h = 238; dplate(x0, y0, w, h, 'JEWEL BEARING, CUT AWAY', 'RUBY HOLE + CAP JEWEL + SPRING LYRE'); const F = [];
      F.push(...D.ringSolid(0, 0, 30, 46, 0, 12, 40, { a0: 0.6, a1: 0.6 + TAU * 0.7 })); F.push(...D.ringSolid(0, 0, 16, 30, 4, 14, 40, { a0: 0.6, a1: 0.6 + TAU * 0.7, topColor: RUBY, sideColor: RUBY })); F.push(...D.ringSolid(0, 0, 6, 16, 6, 12, 40, { a0: 0.6, a1: 0.6 + TAU * 0.7, topColor: RUBY, sideColor: RUBY }));
      F.push(...D.cylinder(0, 0, 18, 22, 26, 30, { topColor: RUBY, sideColor: RUBY, ghost: false })); F.push(...D.cylinder(0, 0, 4.4, -22, 22, 14));
      for (let i = 0; i < 2; i++) { const a = i * Math.PI + 0.3; F.push(...D.bodyOfBar([Math.cos(a) * 14, Math.sin(a) * 14], [Math.cos(a) * 44, Math.sin(a) * 44], 2.4, 2, 28, 31, { crease: 0.3 })); }
      const cm = dcam(x0, y0, w, h, [0, 0, 4], 0.6, 0.6, 340, 620, 6); D.render(P, F, cm, { ink: INK, gap: 3.8, w: 1.05 });
      const a1 = cm.project([18, 8, 26]); if (a1) P.note('CAP JEWEL', x0 + 200, y0 + 56, a1[0], a1[1], { size: 8, c: INK }); const a2 = cm.project([-30, 8, 8]); if (a2) P.note('RUBY HOLE', x0 + 16, y0 + 190, a2[0], a2[1], { size: 8, c: INK }); const a3 = cm.project([0, 0, -20]); if (a3) P.note('PIVOT, 0.1 MM', x0 + 196, y0 + 222, a3[0], a3[1], { size: 8, c: INK }); const a4 = cm.project([30, 30, 29]); if (a4) P.note('SPRING LYRE', x0 + 194, y0 + 100, a4[0], a4[1], { size: 8, c: INK }); }
    /* --- programme cam close-up with its feeler --- */
    { const x0 = 1242, y0 = 622, w = 300, h = 238; dplate(x0, y0, w, h, 'PERPETUAL CALENDAR CAM', '48 STEPS = 4 YEARS, ONE DEEPER STEP = LEAP'); const F = [];
      const ml = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], cam = []; for (let k = 0; k < 48; k++) { const len = k === 37 ? 29 : ml[k % 12], r = 20 + (len - 24) * 4.6, a0 = Math.PI / 2 - k * TAU / 48, a1 = a0 - TAU / 48; cam.push([Math.cos(a0) * r, Math.sin(a0) * r], [Math.cos(a1) * r, Math.sin(a1) * r]); }
      F.push(...D.extrude(cam, 0, 12, { crease: 0.4 })); { const a0 = Math.PI / 2 - 37 * TAU / 48, a1 = a0 - TAU / 48, r = 20 + 5 * 4.6; F.push(...D.extrude([[Math.cos(a0) * 14, Math.sin(a0) * 14], [Math.cos(a0) * r, Math.sin(a0) * r], [Math.cos(a1) * r, Math.sin(a1) * r], [Math.cos(a1) * 14, Math.sin(a1) * 14]], 12, 13.4, { topColor: RED, sideColor: RED, crease: 3 })); }
      F.push(...D.cylinder(0, 0, 9, 12, 26, 14)); F.push(...D.bodyOfBar([-70, 20], [-20, 44], 4, 3, 4, 10, { crease: 0.3 })); F.push(...D.cylinder(-70, 20, 8, 4, 12, 12)); F.push(...D.cylinder(-20, 44, 3, 4, 12, 8, { topColor: RUBY, sideColor: RUBY }));
      const cm = dcam(x0, y0, w, h, [0, 0, 8], 0.35, 0.66, 400, 700, 8); D.render(P, F, cm, { ink: INK, gap: 4.2, w: 1.05 });
      const b1 = cm.project([0, -55, 13]); if (b1) P.note('LEAP-YEAR STEP', x0 + 190, y0 + 214, b1[0], b1[1], { size: 8, c: RED }); const b2 = cm.project([-20, 44, 12]); if (b2) P.note('FEELER RUBY', x0 + 14, y0 + 62, b2[0], b2[1], { size: 8, c: INK }); }


    faces.push({ custom: (PP, cm) => { for (let i = 0; i < 60; i++) { const a = i * TAU / 60, r0 = i % 5 === 0 ? 246 : 252, x0 = Math.cos(a) * r0, y0 = Math.sin(a) * r0, x1 = Math.cos(a) * 258, y1 = Math.sin(a) * 258, p0 = cm.project([x0, y0, 456]), p1 = cm.project([x1, y1, 456]); if (p0 && p1) PP.line(p0[0], p0[1], p1[0], p1[1], { w: i % 5 === 0 ? 1.1 : 0.55, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.2 }); } }, c: [0, 0, 456], bias: 0 });

    const cnt = D.render(P, faces, C3, { ink: INK, gap: 5.6 });

    /* ---- assembly axes, layer captions, and the direction-of-assembly arrow ---- */
    { const ax = (x, y, z0, z1, c = RED) => D.dashed3(P, [x, y, z0], [x, y, z1], C3, [10, 4, 2, 4], { w: 0.7, c, a: 0.85 });
      ax(0, 0, 0, 590); ax(...pivots.B, 100, 380); ax(...TBc, 100, 340); ax(...pivots.FW, 100, 330);
      const cap = (txt, at, dx, dy) => D.label3(P, txt, at, C3, dx, dy, { size: 11, c: INK });
      cap('SAPPHIRE CASE-BACK (GHOSTED)', [-200, -200, 4], -150, 96); cap('CASE MIDDLE + CROWN', [366, 0, 60], 24, 40);
      cap('MAIN PLATE, PERLAGE + STRIKE TRAIN', [-262, -20, 108], -120, 40); cap('BARREL + RED MAINSPRING', pivots.B.concat([120]), -150, -88);
      cap('GOING TRAIN', [pivots.CW[0], pivots.CW[1], 124], 60, 120); cap('TOURBILLON CAGE', TBc.concat([154]), 150, 90);
      cap('PALLET FORK + ESCAPE WHEEL', TBc.concat([196]), 170, 4); cap('BALANCE + HAIRSPRING', TBc.concat([240]), 170, -40); cap('CAGE BRIDGE', TBc.concat([276]), 160, -76);
      cap('TRAIN BRIDGE', [pivots.TW[0], pivots.TW[1], 312], 160, -110); cap('BARREL BRIDGE', [W(268, 556)[0], W(268, 556)[1], 312], -150, -40);
      cap('PERPETUAL CALENDAR', [0, 150, 372], -260, -60); cap('DIAL RING + INDEXES', [-200, 90, 456], -140, -50); cap('HANDS', [60, 70, 500], -170, -130); cap('CRYSTAL', [-262, 0, 562], -50, -30);
    }

  }
});
