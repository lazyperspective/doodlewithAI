/* SHEET 12 — Exploded view of a vintage rangefinder camera. True 3D, three-quarter view from above.
   Black fineliner, cross-hatch shading, red only on springs and screws. */
(window.SCENES = window.SCENES || []).push({
  name: 'Camera (exploded)', seed: 151, ink: '#141414', theme: 'archive',
  build(P, n, t) {
    const S = Sketch, D = S.D3, V = S.V3, TAU = S.TAU, lerp = S.lerp;
    const INK = '#141414', RED = '#c3272b', PAPER = '#ffffff';
    const tg = [30, -80, 44], yaw = -0.98, pit = 0.46, dist = 1500;
    const CAM = D.camera({ eye: [tg[0] + dist * Math.sin(yaw) * Math.cos(pit), tg[1] - dist * Math.cos(yaw) * Math.cos(pit), tg[2] + dist * Math.sin(pit)], target: tg, f: 3980, cx: 675, cy: 508 });
    const faces = [], add = f => { (Array.isArray(f) ? f : [f]).forEach(x => faces.push(x)); return f; };
    const custom = (c, fn, bias = 0) => faces.push({ custom: fn, c, bias: bias < 0 ? -bias * 12 + 18 : bias });
    const anchors = [];                                     // [label, world point] for callouts
    const tag = (label, p) => anchors.push([label, p]);

    /* ---------- geometry helpers ---------- */
    const stadium = (hw, r, cx = 0, cy = 0, seg = 10) => { const pts = []; for (let i = 0; i <= seg; i++) { const a = -Math.PI / 2 + Math.PI * i / seg; pts.push([cx + hw + Math.cos(a) * r, cy + Math.sin(a) * r]); } for (let i = 0; i <= seg; i++) { const a = Math.PI / 2 + Math.PI * i / seg; pts.push([cx - hw + Math.cos(a) * r, cy + Math.sin(a) * r]); } return pts; };
    const shell = (outer, inner, z0, z1, o = {}) => {            // hollow wall: outer faces, inner faces, top rim
      const out = D.extrude(outer, z0, z1, { top: false, crease: 0.5 }), inn = D.extrude(inner, z0, z1, { top: false, crease: 0.5 }).map(f => Object.assign({}, f, { v: f.v.slice().reverse(), n: [-f.n[0], -f.n[1], -f.n[2]], hard: [false, false, false, false], tone: 0.82 }));
      const rim = []; for (let i = 0; i < outer.length; i++) { const j = (i + 1) % outer.length; rim.push({ v: [[outer[i][0], outer[i][1], z1], [outer[j][0], outer[j][1], z1], [inner[j][0], inner[j][1], z1], [inner[i][0], inner[i][1], z1]], n: [0, 0, 1], hard: [true, false, true, false] }); }
      return out.concat(inn, rim);
    };
    const box = (x0, y0, z0, x1, y1, z1, o = {}) => D.extrude([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], z0, z1, Object.assign({ crease: 0.3, bottom: !!o.bottom }, o));
    // rotate a lathe part so its local z axis points along -y (toward the viewer), placed at (x0, y0, z0)
    const toFront = (fs, x0, y0, z0) => fs.map(f => Object.assign({}, f, { v: f.v.map(([x, y, z]) => [x0 + x, y0 - z, z0 + y]), n: [f.n[0], -f.n[2], f.n[1]], hdir: f.hdir ? [f.hdir[0], -f.hdir[2], f.hdir[1]] : undefined }));
    const shiftZ = (fs, dz) => D.shift(fs, 0, 0, dz);
    const hole = (x, y, z, r, seg = 12) => ({ v: Array.from({ length: seg }, (_, i) => [x + Math.cos(i * TAU / seg) * r, y + Math.sin(i * TAU / seg) * r, z + 0.05]), n: [0, 0, 1], hard: Array(seg).fill(true), all: true, tone: 0.95, bias: 0.5 });
    const screw = (x, y, z, r = 2.2, len = 7) => {                  // red countersunk screw, head up, with slot
      add(D.cylinder(x, y, r * 0.5, z - len, z, 8).map(f => Object.assign(f, { c: RED, ca: 0.35 })));
      add(D.revolve(x, y, [[r * 0.5, z], [r, z + 1.2], [r, z + 1.8], [0.01, z + 1.8]], { seg: 14 }).map(f => Object.assign(f, { c: RED, ca: 0.55 })));
      custom([x, y, z + 1.9], (PP, cm) => { const a = cm.project([x - r * 0.8, y, z + 1.85]), b = cm.project([x + r * 0.8, y, z + 1.85]); if (a && b) PP.line(a[0], a[1], b[0], b[1], { w: 1, c: RED, a: 1, passes: 1, over: 0, rough: 0.1 }); const pts = []; for (let i = 0; i <= 5 * 10; i++) { const tt = i / 50; pts.push([x + Math.cos(tt * 5 * TAU) * r * 0.52, y + Math.sin(tt * 5 * TAU) * r * 0.52, z - len * tt]); } D.polyline3(PP, pts.filter((_, k) => k % 10 < 5 || true), cm, { w: 0.5, c: RED, a: 0.8 }); }, -1);
    };
    const spring = (x, y, z0, z1, r, turns, axis = 'z') => custom([x, y, (z0 + z1) / 2], (PP, cm) => { const pts = D.helix(0, 0, r, z0, z1, turns, 16).map(([u, v, w]) => axis === 'z' ? [x + u, y + v, w] : [x + u, y - (w - z0) + 0, z0 + v]); D.polyline3(PP, pts, cm, { w: 1.1, c: RED, a: 0.95 }); D.polyline3(PP, pts.map(([a, b, c]) => [a + 0.25, b, c - 0.25]), cm, { w: 0.5, c: RED, a: 0.6 }); }, -2);
    const guide = (a, b) => custom([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], (PP, cm) => D.dashed3(PP, a, b, cm, [7, 4], { w: 0.55, c: INK, a: 0.75 }), 1e6);

    /* ================= the body (z 0..60), open at the top so the film chamber reads ================= */
    const HW = 52, RR = 17;
    const bodyOut = stadium(HW, RR), bodyIn = stadium(HW - 0.4, RR - 2.6);
    { // body shell with a section window cut through the front-left wall
      const OX0 = -HW + 1, OX1 = -24, OZ0 = 7, OZ1 = 53, T = 2.6;
      const sh = shell(bodyOut, bodyIn, 0, 60).filter(f => !(Math.abs(f.n[1] + 1) < 1e-3 && f.v.every(v => Math.abs(v[1] + RR) < 0.05)));
      add(sh);
      const pan = (x0, x1, z0, z1) => add({ v: [[x0, -RR, z0], [x1, -RR, z0], [x1, -RR, z1], [x0, -RR, z1]], n: [0, -1, 0], hard: [true, true, true, true], hdir: [0, 0, 1] });
      pan(-HW, OX0, 0, 60); pan(OX1, HW, 0, 60); pan(OX0, OX1, 0, OZ0); pan(OX0, OX1, OZ1, 60);
      // reveals: the cut wall thickness, drawn as a solid section
      add({ v: [[OX1, -RR, OZ0], [OX1, -RR, OZ1], [OX1, -RR + T, OZ1], [OX1, -RR + T, OZ0]], n: [-1, 0, 0], hard: [true, true, true, true], tone: 0.9 });
      add({ v: [[OX0, -RR, OZ0], [OX1, -RR, OZ0], [OX1, -RR + T, OZ0], [OX0, -RR + T, OZ0]], n: [0, 0, 1], hard: [true, true, true, true], tone: 0.78 });
      // zig-zag break line along the cut, as an engraver would mark a section
      custom([OX0, -RR, 30], (PP, cm) => { const pts = []; for (let i = 0; i <= 12; i++) pts.push([lerp(OX0, OX1, i / 12), -RR - 0.4, OZ1 + (i % 2 ? 1.2 : -0.4)]); D.polyline3(PP, pts, cm, { w: 0.8, c: INK, a: 0.9 }); }, 8);
      // what the window reveals: film leader running from the cassette across the rails, rewind fork, felt light-trap, pressure spring
      custom([-40, -10, 30], (PP, cm) => { const a0 = [-33, -11.5], L = []; for (let z = 18; z <= 42; z += 24) {} const poly = [[-32, -11.8, 16], [-8, -11.8, 16], [-8, -11.8, 44], [-32, -11.8, 44]].map(q => cm.project(q)); if (poly.every(Boolean)) { const pp = poly.map(q => [q[0], q[1]]); PP.occlude(pp, '#ffffff'); PP.hatch(pp, { ang: 90, gap: 2, a: 0.6, w: 0.45, c: INK }); PP.path(pp.concat([pp[0]]), { w: 0.9, c: INK, passes: 1, rough: 0.2 }); for (let x = -31; x < -9; x += 2.6) [18, 42].forEach(z => { const q = cm.project([x, -11.9, z]); if (q) PP.rect(q[0] - 0.8, q[1] - 1, 1.6, 2, { w: 0.4, c: INK, passes: 1, over: 0 }); }); } }, 3);
      add(D.revolve(-44, 0, [[2.2, 55], [2.2, 64], [0.01, 64]], { seg: 10 })); add(box(-45.4, -3, 58, -42.6, 3, 60));
      add(box(-34, -13.4, 8, -32, -11.2, 52)); screw(-33, -12.4, 52, 1.3, 3);
      spring(-38, -9, 10, 22, 1.4, 6); spring(-38, -9, 36, 48, 1.4, 6);
      add(D.gearMesh(-44, 0, 6, 12, 4, 6, 0.1, { root: 0.78 }));
    }
    add({ v: stadium(HW - 0.4, RR - 2.6).map(([x, y]) => [x, y, 3]), n: [0, 0, 1], hard: Array(22).fill(true), all: true, tone: 0.55 });
    // film chamber partitions, pressure rails, frame aperture window
    add(box(-34, -14.4, 3, -31, 14.4, 58)); add(box(31, -14.4, 3, 34, 14.4, 58));
    add(box(-31, -3, 3, 31, 3, 50)); add(box(-19, -3.4, 12, 19, -2.6, 44));
    // film cassette + take-up spool inside chambers (seen from above)
    add(D.revolve(-44, 0, [[11.6, 4], [11.6, 55], [0.01, 55]], { seg: 28 })); add(D.revolve(-44, 0, [[3, 55], [3, 60], [0.01, 60]], { seg: 12 }));
    add(D.revolve(44, 0, [[9, 4], [9, 50], [0.01, 50]], { seg: 24 })); add(D.gearMesh(44, 0, 11.5, 22, 50, 53, 0.1, { root: 0.84 }));
    add(D.gearMesh(20, 8, 7, 16, 50, 53, 0.2, { root: 0.8 })); add(D.gearMesh(-20, 8, 7, 16, 50, 53, 0.4, { root: 0.8 })); add(D.cylinder(20, 8, 1.4, 50, 57, 8)); add(D.cylinder(-20, 8, 1.4, 50, 57, 8));
    // shutter curtain drums (horizontal, across the chamber)
    [[-10, 9], [10, 9]].forEach(([yy]) => {});
    // lens mount flange on the front face
    add(toFront(D.revolve(0, 0, [[24, 0], [24, 2.4], [18, 2.4], [18, 0]], { seg: 32 }), 0, -RR, 30));
    // leatherette on the front: tiny pebbled texture
    custom([0, -RR - 0.2, 30], (PP, cm) => { const pts = []; for (let i = 0; i < 1100; i++) { const x = P.r(-HW, HW), z = P.r(7, 53); if (Math.hypot(x, z - 30) < 25 || x < -24) continue; const q = cm.project([x, -RR - 0.25, z]); if (q) pts.push([q[0], q[1], P.r(0.35, 0.8)]); } PP.dots(pts, INK, 0.55); [7, 53].forEach(z => { const a = cm.project([-24, -RR - 0.3, z]), b = cm.project([HW, -RR - 0.3, z]); if (a && b) PP.line(a[0], a[1], b[0], b[1], { w: 0.7, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 }); }); }, -3);
    // strap lugs
    [-1, 1].forEach(sg => add(box(sg * (HW + RR) - 1.5, -3, 44, sg * (HW + RR) + (sg > 0 ? 3 : -3) * 0 + 1.5, 3, 52)));
    tag('BODY SHELL, DIE-CAST', [-HW - RR, -6, 20]); tag('FILM CASSETTE CHAMBER', [-44, 8, 55]); tag('TAKE-UP SPOOL', [44, 8, 52]); tag('FRAME APERTURE 24 X 36', [0, -3, 44]); tag('BAYONET FLANGE', [22, -RR - 2, 38]);


    /* ================= Z-stack above the body ================= */
    const ZM = 80, ZD = 120, ZT = ZD + 12;                // rangefinder module, top deck base, deck top
    /* ---- rangefinder / gear module floating between body and deck ---- */
    { add(box(-62, -12, ZM, -22, 10, ZM + 16));                                            // optical block
      add(box(-60, -13, ZM + 16, -26, 9, ZM + 18));
      add(D.extrude([[-58, -10], [-50, -10], [-58, -2]], ZM + 18, ZM + 30, { crease: 0.3 }));  // beam-splitter prism
      add(D.extrude([[-34, -10], [-28, -10], [-28, 6], [-34, 6]], ZM + 18, ZM + 20));
      add(D.bodyOfBar([-30, -2], [-6, 12], 1.6, 1.2, ZM + 6, ZM + 9, { crease: 0.3 })); add(D.cylinder(-30, -2, 3, ZM + 4, ZM + 12, 12)); spring(-8, 12, ZM + 2, ZM + 14, 2, 7);   // RF cam lever + spring
      add(D.gearMesh(40, 2, 13, 30, ZM + 4, ZM + 8, 0.1, { root: 0.86 })); add(D.gearMesh(40, 2, 6, 14, ZM + 8, ZM + 12, 0.2, { root: 0.8 }));
      add(D.gearMesh(20, 6, 8, 20, ZM + 4, ZM + 8, 0.3, { root: 0.84 })); add(D.gearMesh(56, -6, 7, 16, ZM + 4, ZM + 8, 0.1, { root: 0.82 }));
      add(box(10, -12, ZM, 64, 14, ZM + 3)); [[40, 2], [20, 6], [56, -6]].forEach(([x, y]) => add(D.cylinder(x, y, 1.3, ZM + 3, ZM + 14, 8)));
      add(D.bodyOfBar([28, -10], [60, 10], 2, 2, ZM + 3, ZM + 5, { crease: 0.3 })); spring(62, 12, ZM + 3, ZM + 14, 1.6, 6);
      tag('RANGEFINDER BLOCK', [-42, -12, ZM + 8]); tag('CAM FOLLOWER + RETURN SPRING', [-8, 12, ZM + 14]); tag('WIND TRAIN, 3 WHEELS', [40, 2, ZM + 12]); 
    }
    /* ---- the top deck ---- */
    { const deckOut = stadium(HW, RR);
      add(D.extrude(deckOut, ZD, ZT, { crease: 0.5, bottom: false }));
      add(box(-66, -15, ZT, -18, 12, ZT + 14));                                             // rangefinder housing on the deck
      add(box(-64, -13, ZT + 14, -20, 10, ZT + 16));
      // windows on the housing front (dark glass, framed)
      const win = (x0, x1, z0, z1) => { add({ v: [[x0, -15.05, z0], [x1, -15.05, z0], [x1, -15.05, z1], [x0, -15.05, z1]], n: [0, -1, 0], hard: [true, true, true, true], tone: 0.95, bias: 0.8 }); add({ v: [[x0 - 1.2, -15.03, z0 - 1.2], [x1 + 1.2, -15.03, z0 - 1.2], [x1 + 1.2, -15.03, z1 + 1.2], [x0 - 1.2, -15.03, z1 + 1.2]], n: [0, -1, 0], hard: [true, true, true, true], tone: 0.2, bias: 0.5 }); };
      win(-62, -52, ZT + 3, ZT + 11); win(-40, -24, ZT + 3, ZT + 11);
      add(box(-48, -14.2, ZT + 5, -44, -13.6, ZT + 9));
      // accessory shoe
      add(box(-52, -8, ZT + 16, -32, 8, ZT + 17)); add(box(-52, -9, ZT + 17, -32, -6, ZT + 19)); add(box(-52, 6, ZT + 17, -32, 9, ZT + 19));
      [[-HW - 6, -5], [-HW - 6, 5], [HW + 6, -5], [HW + 6, 5]].forEach(([x, y]) => add(hole(x, y, ZT, 1.6)));
      [[36, 0, 5], [56, 0, 5.6], [22, -6, 2.4], [48, -11, 2.2]].forEach(([x, y, r]) => add(hole(x, y, ZT, r)));
      tag('TOP DECK, CHROME BRASS', [0, -RR, ZD + 6]); tag('VIEWFINDER WINDOW', [-32, -15, ZT + 7]); tag('RANGEFINDER WINDOW', [-57, -15, ZT + 7]); tag('ACCESSORY SHOE', [-42, 8, ZT + 19]);
    }
    /* ---- dials, knobs, buttons floating above the deck, each with its spring and screw ---- */
    const knurledKnob = (x, y, z, r, h, o = {}) => { add(D.revolve(x, y, [[r, z], [r, z + h], [r - 1.2, z + h + 1.2], [0.01, z + h + 1.2]], { seg: 32 })); custom([x, y, z + h / 2], (PP, cm) => D.knurl(PP, cm, x, y, r + 0.05, z + 0.6, z + h - 0.6, o.n || 64, { c: INK, w: 0.55 }), -0.5); };
    { const ZS = ZT + 28;
      // shutter speed dial: skirt, knurled cap, engraved speeds, index
      add(D.revolve(36, 0, [[8.2, ZS - 3], [8.2, ZS], [0.01, ZS]], { seg: 28 })); knurledKnob(36, 0, ZS, 9.4, 6, { n: 72 });
      custom([36, 0, ZS + 7.3], (PP, cm) => { ['1', '2', '5', '10', '25', '50', '100', '250', '500', 'B'].forEach((txt, i) => { const a = -1.4 + i * 0.36, q = cm.project([36 + Math.cos(a) * 6.4, Math.sin(a) * 6.4, ZS + 7.25]); if (q) PP.text(txt, q[0], q[1] + 2, { size: 4.2, c: INK, align: 'center', a: 0.95 }); }); const a = cm.project([36, 0, ZS + 7.25]), b = cm.project([36, -9.4, ZS + 7.25]); if (a && b) PP.line(a[0], a[1], b[0], b[1], { w: 0.5, c: INK, passes: 1, over: 0 }); }, -3);
      spring(36, 0, ZT + 20, ZS - 8, 3.4, 8); screw(36, 0, ZT + 30, 2.4, 5);
      // film advance knob with its frame counter
      knurledKnob(56, 0, ZS + 18, 10.6, 10, { n: 80 }); add(D.revolve(56, 0, [[4.4, ZS + 8], [4.4, ZS + 18], [0.01, ZS + 18]], { seg: 16 }));
      add(D.revolve(56, 0, [[6.4, ZS + 29.2], [6.4, ZS + 30.2], [0.01, ZS + 30.2]], { seg: 24 })); custom([56, 0, ZS + 30.3], (PP, cm) => { for (let i = 0; i < 36; i++) { const a = i * TAU / 36, p0 = cm.project([56 + Math.cos(a) * 4.2, Math.sin(a) * 4.2, ZS + 30.3]), p1 = cm.project([56 + Math.cos(a) * 6, Math.sin(a) * 6, ZS + 30.3]); if (p0 && p1) PP.line(p0[0], p0[1], p1[0], p1[1], { w: i % 6 ? 0.3 : 0.6, c: INK, a: 0.9, passes: 1, over: 0 }); } }, -3);
      spring(56, 0, ZT + 12, ZT + 34, 4.6, 7); screw(56, 0, ZT + 44, 2.6, 6);
      // shutter release with its return spring and a threaded collar
      add(D.revolve(22, -6, [[2.6, ZT + 70], [2.6, ZT + 76], [2.0, ZT + 77], [0.01, ZT + 77]], { seg: 16 })); add(D.revolve(22, -6, [[4, ZT + 60], [4, ZT + 64], [0.01, ZT + 64]], { seg: 18 })); spring(22, -6, ZT + 42, ZT + 58, 2, 9);
      // rewind knob with fold-out crank
      knurledKnob(-42, 0, ZT + 66, 8.6, 7, { n: 56 }); add(D.revolve(-42, 0, [[3, ZT + 50], [3, ZT + 66], [0.01, ZT + 66]], { seg: 12 })); add(D.bodyOfBar([-42, 0], [-58, 10], 2, 1.4, ZT + 74, ZT + 75.6, { crease: 0.3 })); add(D.cylinder(-58, 10, 1.8, ZT + 75.6, ZT + 82, 10));
      spring(-42, 0, ZT + 34, ZT + 46, 2.6, 6);
      // frame counter window & diopter
      add(D.revolve(48, -11, [[2.4, ZT + 26], [2.4, ZT + 30], [0.01, ZT + 30]], { seg: 12 }));
      // four deck screws, lifted out
      [[-HW - 6, -5], [-HW - 6, 5], [HW + 6, -5], [HW + 6, 5]].forEach(([x, y]) => screw(x, y, ZT + 22, 1.9, 6));
      tag('SHUTTER SPEED DIAL 1 - 1/500', [36, -9.4, ZS + 4]); tag('FILM ADVANCE KNOB', [56 + 10.6, 0, ZS + 24]); tag('FRAME COUNTER', [56, -6, ZS + 30]); tag('SHUTTER RELEASE', [22, -8, ZT + 76]); tag('REWIND KNOB + CRANK', [-58, 10, ZT + 82]); tag('DIAL SPRING', [36 + 3.4, 0, ZT + 26]); tag('DECK SCREW M1.6', [-HW - 6, -5, ZT + 24]);
      [[36, 0], [56, 0], [22, -6], [-42, 0], [-HW - 6, -5], [-HW - 6, 5], [HW + 6, -5], [HW + 6, 5]].forEach(([x, y]) => guide([x, y, 0 + 60], [x, y, ZT + 62]));
    }

    // engraving on the deck: maker, model, serial, and the index dots
    custom([10, 0, ZT], (PP, cm) => { const line = (txt, x0, x1, y, sz) => { const a = cm.project([x0, y, ZT + 0.05]), b = cm.project([x1, y, ZT + 0.05]); if (a && b) PP.text(txt, a[0], a[1], { size: sz, c: INK, rot: Math.atan2(b[1] - a[1], b[0] - a[0]), a: 0.9 }); }; line('AURELIA  II', -10, 26, -8, 6.4); line('No. 371204  GERMANY', -10, 26, 4, 3.6); [[30, -12], [44, -12]].forEach(([x, y]) => { const q = cm.project([x, y, ZT + 0.05]); if (q) PP.dot(q[0], q[1], 1.1, { c: INK }); }); }, 6);
    // bayonet lugs on the mount, three of them
    [0.3, 2.4, 4.5].forEach(a => add(toFront(D.extrude([[Math.cos(a - 0.3) * 16.5, Math.sin(a - 0.3) * 16.5], [Math.cos(a - 0.3) * 20.5, Math.sin(a - 0.3) * 20.5], [Math.cos(a + 0.3) * 20.5, Math.sin(a + 0.3) * 20.5], [Math.cos(a + 0.3) * 16.5, Math.sin(a + 0.3) * 16.5]], 6.4, 8.8, { crease: 0.3 }), 0, -RR - 22, 30)));


    /* ================= mechanism density: levers, cams, pins, small springs in the module and the chamber ================= */
    { const lever = (a, b, w, z, pivot = true) => { add(D.bodyOfBar(a, b, w, w * 0.8, z, z + 1.6, { crease: 0.3 })); if (pivot) { add(D.cylinder(a[0], a[1], w * 1.4, z - 1, z + 3, 10)); add(D.cylinder(b[0], b[1], w * 0.9, z + 1.6, z + 3.4, 8)); } };
      // module plate: shutter-speed cam, escapement for slow speeds, cocking lever, pawls
      const Z = ZM + 3;
      add(D.extrude(Array.from({ length: 24 }, (_, i) => { const a = i * TAU / 24, r = 7 + 3.2 * Math.max(0, Math.sin(a * 1)); return [22 + Math.cos(a) * r, -8 + Math.sin(a) * r]; }), Z, Z + 3, { crease: 0.6 })); add(D.cylinder(22, -8, 1.6, Z + 3, Z + 9, 8));
      lever([30, -10], [58, 6], 1.5, Z + 5); lever([12, 10], [34, 12], 1.2, Z + 8); lever([60, -10], [48, -2], 1.1, Z + 6);
      add(D.gearMesh(28, 10, 4.6, 12, Z + 9, Z + 11, 0.2, { root: 0.78 })); add(D.gearMesh(52, 10, 3.6, 10, Z + 9, Z + 11, 0.1, { root: 0.78 }));
      spring(34, 12, Z + 9, Z + 18, 1.3, 6); spring(48, -2, Z + 7, Z + 16, 1.2, 5); screw(14, -10, Z + 12, 1.5, 4); screw(62, 12, Z + 12, 1.5, 4);
      // slow-speed escapement: star wheel and anchor
      add(D.extrude(Array.from({ length: 20 }, (_, i) => { const a = i * TAU / 20, r = i % 2 ? 3.2 : 5.4; return [44 + Math.cos(a) * r, -9 + Math.sin(a) * r]; }), Z + 5, Z + 6.6, { crease: 0.2 }));
      add(D.bodyOfBar([40, -13], [48, -14], 0.9, 0.9, Z + 7, Z + 8.4, { crease: 0.3 }));
      // rangefinder side: mirror on a pivoted arm, roller, adjusting screw, lenses
      lever([-40, 4], [-24, 12], 1.4, ZM + 17); add(D.cylinder(-24, 12, 2.6, ZM + 12, ZM + 22, 14));
      add(D.poly3([[-46, -6, ZM + 20], [-40, -10, ZM + 20], [-40, -10, ZM + 29], [-46, -6, ZM + 29]], [-40, 10, ZM + 25], { tone: 0.72 }));
      screw(-28, -6, ZM + 26, 1.5, 5); spring(-20, 4, ZM + 17, ZM + 27, 1.3, 6);
      [[-56, -2], [-36, -2]].forEach(([x, y]) => { add(D.poly3(Array.from({ length: 14 }, (_, i) => [x + Math.cos(i * TAU / 14) * 3.6, y, ZM + 22 + Math.sin(i * TAU / 14) * 3.6]), [x, y + 10, ZM + 22], { tone: 0.05, noHatch: true })); });
      tag('SPEED CAM + ESCAPEMENT', [44, -9, Z + 6]); tag('RANGEFINDER MIRROR', [-43, -8, ZM + 29]);
      // chamber: sprocket shaft, film rails and pressure guides, curtain drum ends visible inside
      add(D.gearMesh(26, -8, 5.2, 8, 44, 48, 0.1, { root: 0.66 })); add(D.gearMesh(26, -8, 5.2, 8, 20, 24, 0.1, { root: 0.66 })); add(D.cylinder(26, -8, 1.6, 20, 50, 8));
      [[-26, 12], [26, 12]].forEach(([x, y]) => add(D.cylinder(x, y, 3.6, 8, 48, 14)));
      [-3.6, 3.6].forEach(y => add(box(-30, y - 0.5, 50, 30, y + 0.5, 51)));
      tag('FILM SPROCKET', [26, -13, 48]);
    }


    /* ================= film chamber packed: curtain shafts across, gear trains in the gaps, levers & springs ================= */
    { const alongX = (fs, x0, y0, z0) => fs.map(f => Object.assign({}, f, { v: f.v.map(([x, y, z]) => [x0 + z, y0 + x, z0 + y]), n: [f.n[2], f.n[0], f.n[1]], hdir: f.hdir ? [f.hdir[2], f.hdir[0], f.hdir[1]] : undefined }));
      [[-9, 40], [9, 40], [-9, 16], [9, 16]].forEach(([y, z], i) => { add(alongX(D.revolve(0, 0, [[1.3, 0], [1.3, 60], [0.01, 60]], { seg: 10 }), -30, y, z)); add(alongX(D.revolve(0, 0, [[4.2, 0], [4.2, 4], [0.01, 4]], { seg: 16 }), -30 + (i % 2 ? 52 : 4), y, z)); });
      [[-36, 10, 30], [36, -10, 30], [-36, -10, 20], [36, 10, 44]].forEach(([x, y, z], i) => { add(D.gearMesh(x, y, 3.8, 12, z, z + 2, i * 0.2, { root: 0.78 })); add(D.cylinder(x, y, 0.9, z - 6, z + 5, 8)); });
      [[-26, -10, 40], [26, 10, 30]].forEach(([x, y, z]) => { add(D.bodyOfBar([x, y], [x + 8, y + 3], 1.1, 0.9, z, z + 1.2, { crease: 0.3 })); spring(x + 8, y + 3, z - 8, z, 1, 5); });
      screw(-30, 13, 54, 1.4, 4); screw(30, -13, 54, 1.4, 4);
      tag('CURTAIN SHAFTS', [-30, -9, 40]);
    }


    /* ================= surface detail: mount screws, lug rings, seams, knurled lens rings, vents ================= */
    { // six screws around the mount flange (front face), drawn as small domed heads
      for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.26, x = Math.cos(a) * 21, z = 30 + Math.sin(a) * 21; add(toFront(D.revolve(0, 0, [[1.6, 0], [1.6, 0.6], [1.1, 1.2], [0.01, 1.4]], { seg: 10 }), x, -RR - 2.4, z)); }
      // strap lug rings
      [-1, 1].forEach(sg => add(D.poly3 ? [] : [])); [-1, 1].forEach(sg => { const lx = sg * (HW + RR + 2), ring = D.ringSolid(0, 0, 3.4, 5, -0.8, 0.8, 18); add(ring.map(f => Object.assign({}, f, { v: f.v.map(([x, y, z]) => [lx + z, y, 48 + x]), n: [f.n[2], f.n[1], f.n[0]] }))); });
      // body seams where the top cover meets the shell, and around the leatherette
      custom([0, -RR, 30], (PP, cm) => { [[-HW, 55.5, HW, 55.5], [-HW, 5, HW, 5]].forEach(([x0, z0, x1, z1]) => { for (const dz of [0, 1.1]) { const a = cm.project([x0, -RR - 0.3, z0 + dz]), b = cm.project([x1, -RR - 0.3, z1 + dz]); if (a && b) PP.line(a[0], a[1], b[0], b[1], { w: 0.6, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.15 }); } }); }, 6);
      // vent slots on the rangefinder housing top
      custom([-42, 0, ZT + 16], (PP, cm) => { for (let k = 0; k < 9; k++) { const x = -62 + k * 4.2, a = cm.project([x, -9, ZT + 16.05]), b = cm.project([x, 6, ZT + 16.05]); if (a && b) PP.line(a[0], a[1], b[0], b[1], { w: 1.4, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.1 }); } }, 6);
      // knurled grip bands on the helicoid, front barrel and hood base (drawn on the lathe surface, visible side only)
      const G2 = 32; [[22 + G2 + 14, 22 + G2 + 26, 21.7, 0.25], [22 + 3 * G2 + 60, 22 + 3 * G2 + 66, 21.6, 0.0]].forEach(([d0, d1, r]) => custom([0, -RR - d0, 30], (PP, cm) => { for (let i = 0; i < 96; i++) { const a = i * TAU / 96, x = Math.cos(a) * r, z = 30 + Math.sin(a) * r; if ((cm.eye[0] - x) * Math.cos(a) + (cm.eye[2] - z) * Math.sin(a) < 0) continue; if (a > Math.PI / 2 && a < Math.PI) continue; const p0 = cm.project([x, -RR - d0, z]), p1 = cm.project([x, -RR - d1, z]); if (p0 && p1) PP.line(p0[0], p0[1], p1[0], p1[1], { w: 0.7, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.1 }); } }, 6));
      // rewind release button and the frame-counter window on the body front
      add(toFront(D.revolve(0, 0, [[2.6, 0], [2.6, 2.4], [2, 3], [0.01, 3]], { seg: 14 }), 46, -RR, 46));
      add(box(26, -RR - 0.6, 40, 38, -RR, 48)); add({ v: [[28, -RR - 0.62, 42], [36, -RR - 0.62, 42], [36, -RR - 0.62, 46], [28, -RR - 0.62, 46]], n: [0, -1, 0], hard: [true, true, true, true], tone: 0.95, bias: 1 });
    }

    /* ================= Z-stack below the body ================= */
    const ZB = -62;
    { // film cassette dropping out of the bottom-loading chamber
      add(D.revolve(-44, 0, [[12, -52], [12, -14], [0.01, -14]], { seg: 28 })); add(D.revolve(-44, 0, [[4, -14], [4, -9], [0.01, -9]], { seg: 14 })); add(D.revolve(-44, 0, [[4, -57], [4, -52], [0.01, -52]], { seg: 14 }));
      add(box(-44, -13, -48, -31, -11, -18)); custom([-44, -12, -33], (PP, cm) => { for (let z = -47; z < -19; z += 3.2) { const a = cm.project([-40, -13.1, z]), b = cm.project([-33, -13.1, z]); if (a && b) PP.line(a[0], a[1], b[0], b[1], { w: 0.4, c: INK, a: 0.8, passes: 1, over: 0 }); } }, -2);
      add(D.revolve(44, 0, [[8, -50], [8, -16], [0.01, -16]], { seg: 22 })); add(D.revolve(44, 0, [[10.5, -18], [10.5, -16], [0.01, -16]], { seg: 22 })); add(D.revolve(44, 0, [[10.5, -52], [10.5, -50], [0.01, -50]], { seg: 22 }));
      // baseplate with the locking key, tripod socket
      add(D.extrude(stadium(HW, RR), ZB - 5, ZB, { crease: 0.5 }));
      add(D.revolve(-44, 0, [[6, ZB], [6, ZB + 2], [0.01, ZB + 2]], { seg: 20 })); add(box(-50, -1.4, ZB + 2, -38, 1.4, ZB + 5));
      add(hole(10, 0, ZB, 3.2)); add(D.revolve(10, 0, [[3.2, ZB + 0.05], [3.2, ZB + 4], [0.01, ZB + 4]], { seg: 14 }));
      spring(-44, 0, ZB + 7, -60, 3.6, 4); guide([-44, 0, ZB], [-44, 0, 0]); guide([44, 0, ZB], [44, 0, 0]); guide([10, 0, ZB], [10, 0, 0]);
      tag('35 MM FILM CASSETTE', [-56, 0, -30]); tag('TAKE-UP SPOOL, REMOVABLE', [52.5, 0, -30]); tag('BASEPLATE + LOCKING KEY', [-50, 0, ZB + 5]); tag('TRIPOD SOCKET 1/4 IN', [10, -3, ZB + 4]); tag('CASSETTE SPRING', [-40, 0, -70]);
    }

    /* ================= focal-plane shutter unit, lifted out to the right; its parts float apart vertically ================= */
    { const SX = 196, SY = -44, SZ = 34, LEN = 46;
      const drum = (z, r, label, gearT) => { const f = pr => add(toFront(D.revolve(0, 0, pr, { seg: 28 }), SX, SY, z));
        f([[r, 0], [r, LEN], [0.01, LEN]]); f([[r + 2.6, -1.8], [r + 2.6, 0], [0.01, 0]]); f([[r + 2.6, LEN], [r + 2.6, LEN + 1.8], [0.01, LEN + 1.8]]); f([[1.5, -10], [1.5, LEN + 10], [0.01, LEN + 10]]);
        custom([SX, SY - LEN / 2, z], (PP, cm) => { for (let k = 1; k < 9; k++) { const pts = []; for (let i = 0; i <= 14; i++) { const a = Math.PI * 0.2 + i * 0.1; pts.push([SX + Math.cos(a) * (r + 0.05), SY - k * LEN / 9, z + Math.sin(a) * (r + 0.05)]); } D.polyline3(PP, pts, cm, { w: 0.4, c: INK, a: 0.7 }); } }, 5);
        if (gearT) add(toFront(D.gearMesh(0, 0, r + 4.4, gearT, LEN + 2.2, LEN + 5.2, 0.1, { root: 0.86 }), SX, SY, z));
        if (label) tag(label, [SX + r, SY - LEN / 2, z]); };
      drum(SZ + 116, 7.6, 'FIRST CURTAIN DRUM', 26); drum(SZ + 70, 4.4, 'TENSION ROLLER'); drum(SZ + 24, 7.6, 'SECOND CURTAIN DRUM', 26);
      // the cloth curtain: a ribbon running from the drum down to the roller, with its brass-edged slit
      custom([SX + 8, SY - LEN / 2, SZ + 93], (PP, cm) => { const c = [[SX + 7.6, SY - 1, SZ + 116], [SX + 7.6, SY - LEN + 1, SZ + 116], [SX + 4.4, SY - LEN + 1, SZ + 70], [SX + 4.4, SY - 1, SZ + 70]].map(q => cm.project(q)); if (!c.every(Boolean)) return; const pp = c.map(q => [q[0], q[1]]); PP.occlude(pp, '#ffffff'); PP.hatch(pp, { ang: Math.atan2(pp[1][1] - pp[0][1], pp[1][0] - pp[0][0]) * 180 / Math.PI + 90, gap: 1.9, a: 0.75, w: 0.45, c: INK, cross: 70 }); PP.path(pp.concat([pp[0]]), { w: 1.1, c: INK, a: 0.95, rough: 0.2, passes: 1 }); [0.42, 0.5].forEach(u => { const a = cm.project([SX + lerp(7.6, 4.4, u), SY - 1, SZ + lerp(116, 70, u)]), b = cm.project([SX + lerp(7.6, 4.4, u), SY - LEN + 1, SZ + lerp(116, 70, u)]); if (a && b) PP.line(a[0], a[1], b[0], b[1], { w: 1.2, c: INK, a: 0.95, passes: 1, over: 0 }); }); const a = cm.project([SX + 6, SY - 1, SZ + 95]), b = cm.project([SX + 6, SY - LEN + 1, SZ + 95]); if (a && b) PP.occlude([[a[0], a[1] - 3], [b[0], b[1] - 3], [b[0], b[1] + 3], [a[0], a[1] + 3]], '#ffffff'); }, 10);
      // curtain springs inside the drums, pulled out beside them (red)
      [[SZ + 116, 4.2], [SZ + 24, 4.2], [SZ + 70, 2.6]].forEach(([z, r]) => custom([SX, SY + 18, z], (PP, cm) => { const pts = D.helix(0, 0, r, 0, 26, 10, 14).map(([u, v, w]) => [SX + u, SY + 12 + w, z + v]); D.polyline3(PP, pts, cm, { w: 1, c: RED, a: 0.95 }); }, 8));
      // shutter crate: a frame plate floating below, with its gate and fixing screws
      add(box(SX - 16, SY - LEN - 4, SZ - 30, SX + 16, SY + 4, SZ - 27)); add(box(SX - 10, SY - LEN + 6, SZ - 27, SX + 10, SY - 6, SZ - 26.4));
      [[-12, 0], [12, 0], [-12, -LEN], [12, -LEN]].forEach(([u, v]) => screw(SX + u, SY + v, SZ - 12, 1.7, 5));
      [SZ + 116, SZ + 70, SZ + 24].forEach(z => custom([SX, SY - LEN / 2, z], (PP, cm) => D.dashed3(PP, [SX, SY + 16, z], [SX, SY - LEN - 16, z], cm, [7, 4], { w: 0.55, c: INK, a: 0.75 }), 1e6));
      custom([SX, SY, 100], (PP, cm) => { D.dashed3(PP, [SX, SY - LEN / 2, SZ - 30], [SX, SY - LEN / 2, SZ + 140], cm, [7, 4], { w: 0.55, c: INK, a: 0.75 }); D.dashed3(PP, [SX - 20, SY - LEN / 2, SZ + 70], [22, -2, 30], cm, [2, 5], { w: 0.5, c: INK, a: 0.55 }); }, 1e6);
      tag('CURTAIN, RUBBERISED SILK', [SX + 6, SY - LEN / 2, SZ + 93]); tag('CURTAIN TENSION SPRINGS', [SX, SY + 24, SZ + 116]); tag('SHUTTER CRATE', [SX + 16, SY - LEN, SZ - 28]);
    }
    /* ================= extra body detail: front controls, rim screws, rails, engraving ================= */
    { // slow-speed dial on the front, self-timer lever, flash sync sockets, focusing tab
      add(toFront(D.revolve(0, 0, [[6.6, 0], [6.6, 3], [5.6, 4], [0.01, 4]], { seg: 24 }), -34, -RR, 44)); custom([-34, -RR - 4, 44], (PP, cm) => { for (let i = 0; i < 40; i++) { const a = i * TAU / 40, p0 = cm.project([-34 + Math.cos(a) * 6.62, -RR - 0.4, 44 + Math.sin(a) * 6.62]), p1 = cm.project([-34 + Math.cos(a) * 6.62, -RR - 2.8, 44 + Math.sin(a) * 6.62]); if (p0 && p1) PP.line(p0[0], p0[1], p1[0], p1[1], { w: 0.45, c: INK, a: 0.8, passes: 1, over: 0 }); } }, 4);
      add(toFront(D.revolve(0, 0, [[3, 0], [3, 5], [0.01, 5]], { seg: 14 }), 34, -RR, 14)); add(toFront(D.revolve(0, 0, [[3, 0], [3, 5], [0.01, 5]], { seg: 14 }), 42, -RR, 14));
      add(D.bodyOfBar([-38, -RR - 1], [-46, -RR - 12], 1.8, 1.4, 22, 24.4, { crease: 0.3 })); add(D.cylinder(-38, -RR - 1, 3.4, 20, 26, 12));
      spring(-38, -RR - 1, 26, 34, 1.8, 4);
      // engraved maker's line on the body front
      custom([0, -RR, 10], (PP, cm) => { const a = cm.project([-46, -RR - 0.4, 9]); if (a) { const b = cm.project([-10, -RR - 0.4, 9]); PP.text('AURELIA  WETZLAR-STYLE  No. 371 204', a[0], a[1], { size: 4.2, c: INK, rot: Math.atan2(b[1] - a[1], b[0] - a[0]) }); } }, 6);
      // screw heads around the top rim of the body
      [[-HW - 6, -5], [-HW - 6, 5], [HW + 6, -5], [HW + 6, 5]].forEach(([x, y]) => add(hole(x, y, 60, 1.4)));
      tag('SLOW-SPEED DIAL', [-34, -RR - 4, 50]); tag('SELF-TIMER LEVER', [-46, -RR - 12, 24]); tag('FLASH SYNC SOCKETS', [38, -RR - 5, 17]); 
    }

    /* ================= the lens, pulled forward along its optical axis ================= */
    { const LX = 0, LZ = 30, Y0 = -RR, G = 32;
      const glass = (lf, cx, y, z) => lf;
      const part = (prof, dy, o = {}) => add(toFront(D.revolve(0, 0, prof, Object.assign({ seg: 36 }, o)), LX, Y0 - dy, LZ));
      part([[23, 0], [23, 3], [19, 3], [19, 7], [16.5, 7], [16.5, 0]], 22);                                  // bayonet mount
      [0, 1, 2].forEach(i => { const a = i * TAU / 3 + 0.4; add(toFront(D.revolve(0, 0, [[0.01, 0], [0.01, 0]], {}), 0, 0, 0)); });
      part([[18, 0], [18, 14], [21.6, 14], [21.6, 26], [18, 26], [18, 32], [15.5, 32], [15.5, 0], [18, 0]], 22 + G, { a0: Math.PI, a1: Math.PI * 2.5, tube: true, cutTone: 0.7 });       // helicoid + focus ring
      custom([0, Y0 - 22 - G - 20, LZ], (PP, cm) => { for (let i = 0; i < 70; i++) { const a = i * TAU / 70, x = Math.cos(a) * 21.7, z = Math.sin(a) * 21.7; const nx = Math.cos(a), nz = Math.sin(a); if ((cm.eye[0] - x) * nx + (cm.eye[2] - (LZ + z)) * nz < 0) continue; const p0 = cm.project([LX + x, Y0 - 22 - G - 14.5, LZ + z]), p1 = cm.project([LX + x, Y0 - 22 - G - 25.5, LZ + z]); if (p0 && p1) PP.line(p0[0], p0[1], p1[0], p1[1], { w: 0.55, c: INK, a: 0.85, passes: 1, over: 0, rough: 0.1 }); } }, -1);
      // aperture unit: ring + iris blades + rear glass
      part([[19, 0], [19, 8], [11, 8], [11, 0]], 22 + 2 * G + 20);
      custom([0, Y0 - 22 - 2 * G - 24, LZ], (PP, cm) => { for (let k = 0; k < 10; k++) { const a0 = k * TAU / 10, pts = []; for (let q = 0; q <= 8; q++) { const a = a0 + q * 0.09; pts.push([LX + Math.cos(a) * lerp(11, 5, q / 8), Y0 - 22 - 2 * G - 24, LZ + Math.sin(a) * lerp(11, 5, q / 8)]); } D.polyline3(PP, pts, cm, { w: 0.6, c: INK, a: 0.9 }); } }, -2);
      part([[14, 0], [15, 2], [15, 5], [13, 7], [0.01, 8]], 22 + 2 * G + 36, { seg: 28 });                           // rear element
      part([[20.5, 0], [20.5, 18], [21.5, 20], [21.5, 26], [17, 26], [17, 0], [20.5, 0]], 22 + 3 * G + 40, { a0: Math.PI, a1: Math.PI * 2.5, tube: true, cutTone: 0.7 });                  // front barrel + name ring
      custom([0, Y0 - 22 - 3 * G - 60, LZ], (PP, cm) => { 'SUMMAR 1:2 F=5CM'.split('').forEach((ch, i) => { const a = Math.PI * 0.62 - i * 0.12, q = cm.project([LX + Math.cos(a) * 19.3, Y0 - 22 - 3 * G - 40 - 26.05, LZ + Math.sin(a) * 19.3]); if (q) PP.text(ch, q[0], q[1] + 1.5, { size: 3.8, c: INK, align: 'center' }); }); }, -3);
      part([[16, 0], [17, 3], [17, 6], [14, 9], [0.01, 11]], 22 + 4 * G + 44, { seg: 28 });                          // front element
      part([[21, 0], [22, 0], [28, 22], [27, 22]], 22 + 4 * G + 72);                                                // hood
      part([[29, 0], [29, 6], [0.01, 6]], 22 + 5 * G + 84);                                                         // cap
      // retaining screws on the mount + spring clip
      [0.5, 2.6, 4.7].forEach(a => { const x = Math.cos(a) * 20.5, z = LZ + Math.sin(a) * 20.5; custom([x, Y0 - 16, z], (PP, cm) => { const c0 = [x, Y0 - 8, z]; const pts = []; for (let i = 0; i <= 10; i++) pts.push([x + Math.cos(i * 0.6) * 1.2, Y0 - 6 - i * 1, z + Math.sin(i * 0.6) * 1.2]); D.polyline3(PP, pts, cm, { w: 0.8, c: RED, a: 0.95 }); const q = cm.project(c0); if (q) { PP.circle(q[0], q[1], 2.2, { w: 1, c: RED, passes: 1 }); PP.line(q[0] - 1.6, q[1], q[0] + 1.6, q[1], { w: 0.8, c: RED, passes: 1, over: 0 }); } D.dashed3(PP, [x, Y0 - 16, z], [x, Y0, z], cm, [3, 3], { w: 0.4, c: INK, a: 0.7 }); }, -1); });


      // glass inside the cut barrels: a cemented doublet in the front barrel, a meniscus + spacer in the helicoid
      part([[16.4, 0], [16.4, 3], [13, 6.4], [0.01, 7.6]], 22 + 3 * G + 48, { seg: 28, color: '#eef2f2', ca: 0.2 });
      part([[16.4, -4.6], [16.4, 0], [0.01, 0.8]], 22 + 3 * G + 48, { seg: 28 });
      part([[14.6, 0], [14.6, 2.4], [11, 5], [0.01, 5.8]], 22 + G + 10, { seg: 28 });
      part([[15.4, 0], [15.4, 1.4], [13.6, 1.4], [13.6, 0], [15.4, 0]], 22 + G + 20, { seg: 28, tube: true });
      tag('CEMENTED DOUBLET', [0, -RR - 22 - 3 * G - 52, 30 + 12]); tag('SECTION CUT, BARREL WALL', [-19, -RR - 22 - G - 16, 30 + 2]);
      // engraved focus scale on the helicoid and aperture numbers on the aperture ring
      custom([0, Y0 - 22 - G - 10, LZ], (PP, cm) => { ['INF', '10', '5', '3', '2', '1.5', '1.2', '1'].forEach((txt, i) => { const a = Math.PI * 0.32 + i * 0.2, x = Math.cos(a) * 18.05, z = Math.sin(a) * 18.05; const q = cm.project([LX + x, Y0 - 22 - G - 6, LZ + z]); if (q) PP.text(txt, q[0], q[1] + 1.4, { size: 3.8, c: INK, align: 'center' }); const q0 = cm.project([LX + x, Y0 - 22 - G - 9.5, LZ + z]), q1 = cm.project([LX + x, Y0 - 22 - G - 11.5, LZ + z]); if (q0 && q1) PP.line(q0[0], q0[1], q1[0], q1[1], { w: 0.4, c: INK, passes: 1, over: 0 }); }); }, 6);
      custom([0, Y0 - 22 - 2 * G - 24, LZ], (PP, cm) => { ['2', '2.8', '4', '5.6', '8', '11', '16'].forEach((txt, i) => { const a = Math.PI * 0.3 + i * 0.25, q = cm.project([LX + Math.cos(a) * 19.05, Y0 - 22 - 2 * G - 24, LZ + Math.sin(a) * 19.05]); if (q) PP.text(txt, q[0], q[1] + 1.4, { size: 3.6, c: INK, align: 'center' }); }); }, 6);
      [[22 + 2 * G + 36, 15], [22 + 4 * G + 44, 17]].forEach(([dy, r]) => custom([0, Y0 - dy - 8, LZ], (PP, cm) => { [0.55, 0.38].forEach((k, j) => { const pts = []; for (let i = 0; i <= 10; i++) { const a = 2.2 + i * 0.1 + j * 0.2; pts.push([LX + Math.cos(a) * r * k, Y0 - dy - 9, LZ + Math.sin(a) * r * k]); } D.polyline3(PP, pts, cm, { w: 0.8, c: INK, a: 0.8 }); }); }, 8));

      guide([LX, Y0, LZ], [LX, Y0 - 22 - 5 * G - 96, LZ]);
      tag('BAYONET MOUNT', [23, Y0 - 25, LZ]); tag('HELICOID + FOCUS RING', [21.7, Y0 - 22 - G - 20, LZ]); tag('IRIS DIAPHRAGM, 10 BLADES', [0, Y0 - 22 - 2 * G - 24, LZ + 19]); tag('REAR ELEMENT', [15, Y0 - 22 - 2 * G - 40, LZ]); tag('FRONT BARREL', [21.5, Y0 - 22 - 3 * G - 60, LZ]); tag('FRONT ELEMENT', [17, Y0 - 22 - 4 * G - 50, LZ]); tag('LENS HOOD', [28, Y0 - 22 - 4 * G - 94, LZ]); tag('LENS CAP', [29, Y0 - 22 - 5 * G - 90, LZ]); 
    }



    /* ================= small floating hardware on every axis: washers, circlips, bushings, pins ================= */
    const G = 32;
    { const washer = (x, y, z, r0, r1, t = 0.8) => add(D.ringSolid(x, y, r0, r1, z, z + t, 20));
      const clip = (x, y, z, r) => { add(D.ringSolid(x, y, r * 0.62, r, z, z + 0.7, 18, { a0: 0.5, a1: 0.5 + TAU * 0.82 })); };
      const bush = (x, y, z, r, h) => add(D.revolve(x, y, [[r * 1.5, z], [r * 1.5, z + 1], [r, z + 1], [r, z + h], [r * 0.55, z + h], [r * 0.55, z]], { seg: 16 }));
      // along the dial axes between deck and knobs
      [[36, 0, 7], [56, 0, 8], [-42, 0, 6]].forEach(([x, y, r], i) => { washer(x, y, ZT + 6, r * 0.45, r * 0.95); clip(x, y, ZT + 10, r * 0.6); bush(x, y, ZT + 14, r * 0.34, 5); washer(x, y, ZT + 42 + i * 3, r * 0.3, r * 0.75, 0.6); });
      // along the module: pins and bushings for the wind train, rangefinder arm
      [[40, 2], [20, 6], [56, -6], [-30, -2]].forEach(([x, y]) => { bush(x, y, ZM - 16, 1.6, 4); washer(x, y, ZM - 9, 1.3, 3.2, 0.6); });
      // below the body: cassette lock pins and the take-up spool's clip
      [[-44, 0, -8], [44, 0, -10]].forEach(([x, y, z]) => { washer(x, y, z, 3, 6, 0.8); clip(x, y, z - 3.4, 4); });
      [[-60, -8], [60, -8], [-60, 8], [60, 8]].forEach(([x, y]) => { add(D.cylinder(x, y, 1.2, -30, -22, 8)); guide([x, y, ZB], [x, y, 0]); screw(x, y, ZB - 12, 1.8, 5); });
      // lens: retaining ring and spacer between elements, loose ball bearing of the click stops
      [[22 + 2 * G + 12, 16, 18.5], [22 + 3 * G + 24, 17, 20]].forEach(([dy, r0, r1]) => add(toFront(D.ringSolid(0, 0, r0, r1, 0, 1.4, 32), 0, -RR - dy, 30)));
      add(toFront(D.revolve(0, 0, [[1.4, 0], [1.4, 0.01], [0.01, 2.8]], { seg: 10 }), 22, -RR - 22 - G - 14, 44));
      tag('CIRCLIPS + WASHERS', [36 + 4, 0, ZT + 10]); tag('BRASS BUSHINGS', [40, 2, ZM - 14]); tag('BASEPLATE SCREWS', [60, -8, ZB - 10]); tag('RETAINING RING', [18.5, -RR - 22 - 3 * G - 24, 30]);
    }
    /* ================= DETAIL A: the iris diaphragm, drawn large in its own camera ================= */
    { const cx0 = 700, cy0 = 748, rr = 84;
      const cm = D.camera({ eye: [0, -150, 120], target: [0, 0, 0], f: 300, cx: cx0 + 20, cy: cy0 + 36 });
      const F = [];
      F.push(...D.ringSolid(0, 0, 44, 58, -6, 0, 48)); F.push(...D.ringSolid(0, 0, 50, 58, 0, 7, 48));
      for (let k = 0; k < 10; k++) { const a0 = k * TAU / 10, pts = []; for (let q = 0; q <= 8; q++) { const a = a0 + q * 0.11; pts.push([Math.cos(a) * lerp(52, 17, q / 8), Math.sin(a) * lerp(52, 17, q / 8)]); } for (let q = 8; q >= 0; q--) { const a = a0 + q * 0.11 + 0.5; pts.push([Math.cos(a) * lerp(52, 21, q / 8), Math.sin(a) * lerp(52, 21, q / 8)]); } F.push(...D.extrude(pts, 0.3 + k * 0.12, 0.9 + k * 0.12, { crease: 0.4 }).map(f => Object.assign(f, { tone: f.n[2] > 0.9 ? 0.2 + (k % 3) * 0.14 : 0.6 }))); }
      for (let k = 0; k < 10; k++) { const a = k * TAU / 10 + 0.05; F.push(...D.cylinder(Math.cos(a) * 53, Math.sin(a) * 53, 1.8, 1.4, 4, 10)); }
      D.render(P, F, cm, { ink: INK, paper: PAPER, light: [-0.6, -0.4, 0.7], ambient: 0.1, gap: 3.4, w: 1.1, rough: 0.2, zw: 0, hatchMin: 0.14, rich: true, darken: 1.3, style: 'mixed' });
      const q = cm.project([0, 0, 1]); if (q) { const hole = Array.from({ length: 10 }, (_, i) => { const p = cm.project([Math.cos(i * TAU / 10 + 0.3) * 17, Math.sin(i * TAU / 10 + 0.3) * 17, 1.4]); return [p[0], p[1]]; }); P.occlude(hole, '#1a1a1a'); P.poly(hole, { w: 0.9, c: INK, passes: 1, over: 0 }); }
      P.text('DETAIL A', cx0 + rr + 36, cy0 + 10, { size: 11, c: INK, font: S.HAND }); P.text('IRIS, 10 BLADES, F/8', cx0 + rr + 36, cy0 + 24, { size: 7, c: INK }); P.text('SCALE 8 : 1', cx0 + rr + 36, cy0 + 36, { size: 7, c: INK, a: 0.8 });
      const lp = CAM.project([0, -RR - 22 - 2 * G - 24, 30 - 19]); if (lp) { P.dashed(lp[0], lp[1], cx0 + rr * 0.3, cy0 - rr * 0.95, [3, 4], { w: 0.5, c: INK, a: 0.7 }); P.circle(lp[0], lp[1], 10, { w: 0.5, c: INK, a: 0.7, passes: 1 }); }
    }

    D.render(P, faces, CAM, { ink: INK, paper: PAPER, light: [-0.55, -0.25, 0.55], ambient: 0.02, gap: 3.9, w: 1.35, rough: 0.22, zw: 0, hatchMin: 0.14, rich: true, darken: 1.3, style: 'mixed' });


    /* ================= DETAIL B: film advance knob in section; DETAIL C: curtain drum cut open ================= */
    const detailCam = (cx0, cy0, f) => D.camera({ eye: [-130, -150, 110], target: [0, 0, 0], f, cx: cx0, cy: cy0 });
    { const cx0 = 1300, cy0 = 780, cm = detailCam(cx0, cy0, 540), F = [], cut = { a0: Math.PI * 0.75, a1: Math.PI * 2.25, tube: true, cutTone: 0.72 };
      F.push(...D.revolve(0, 0, [[20, 0], [20, 14], [18, 16], [6, 16], [6, 4], [4, 4], [4, -18], [2.4, -18], [2.4, 0.01], [18, 0.01], [20, 0]], Object.assign({ seg: 40 }, cut)));
      F.push(...D.gearMesh(0, 0, 11, 18, -14, -11, 0.1, { root: 0.8 }));
      F.push(...D.cylinder(0, 0, 1.6, -30, 18, 10));
      const knX = [-20, 0]; void knX;
      D.render(P, F, cm, { ink: INK, paper: PAPER, light: [-0.6, -0.4, 0.7], ambient: 0.1, gap: 3.4, w: 1.1, rough: 0.2, zw: 0, hatchMin: 0.14, rich: true, darken: 1.3, style: 'mixed' });
      D.knurl(P, cm, 0, 0, 20.1, 1, 13, 90, { c: INK, w: 0.5 });
      const hp = D.helix(0, 0, 9, -9, 3, 5, 18); D.polyline3(P, hp, cm, { w: 1.1, c: RED, a: 0.95 });
      [[0, 0, 16.2]].forEach(p => { const q = cm.project(p); if (q) { P.circle(q[0], q[1], 3, { w: 1, c: RED, passes: 1 }); P.line(q[0] - 2.2, q[1], q[0] + 2.2, q[1], { w: 0.9, c: RED, passes: 1, over: 0 }); } });
      P.text('DETAIL B', cx0 - 60, cy0 - 70, { size: 11, c: INK, font: S.HAND }); P.text('ADVANCE KNOB, SECTION', cx0 - 60, cy0 - 57, { size: 6.8, c: INK }); P.text('SCALE 5 : 1', cx0 - 60, cy0 - 46, { size: 6.6, c: INK, a: 0.8 });
      const n1 = cm.project([9, 0, -3]); if (n1) P.note('CLICK SPRING', cx0 + 62, cy0 + 40, n1[0], n1[1], { size: 7.4, c: INK });
      const n2 = cm.project([11, 0, -12]); if (n2) P.note('RATCHET', cx0 + 62, cy0 + 16, n2[0], n2[1], { size: 7.4, c: INK });
    }
    { const cx0 = 1180, cy0 = 300, cm = detailCam(cx0, cy0, 470), F = [], cut = { a0: Math.PI * 0.8, a1: Math.PI * 2.3, tube: true, cutTone: 0.72 };
      F.push(...D.revolve(0, 0, [[12, 0], [12, 46], [10.4, 46], [10.4, 0], [12, 0]], Object.assign({ seg: 36 }, cut)));
      F.push(...D.revolve(0, 0, [[15, -2], [15, 0], [2.2, 0], [2.2, -2], [15, -2]], { seg: 36, tube: true }));
      F.push(...D.cylinder(0, 0, 2, -10, 56, 10));
      D.render(P, F, cm, { ink: INK, paper: PAPER, light: [-0.6, -0.4, 0.7], ambient: 0.1, gap: 3.4, w: 1.1, rough: 0.2, zw: 0, hatchMin: 0.14, rich: true, darken: 1.3, style: 'mixed' });
      D.polyline3(P, D.helix(0, 0, 6.4, 2, 44, 12, 16), cm, { w: 1, c: RED, a: 0.95 });
      P.text('DETAIL C', cx0 - 40, cy0 + 38, { size: 11, c: INK, font: S.HAND }); P.text('CURTAIN DRUM, CUT OPEN', cx0 - 40, cy0 + 51, { size: 6.8, c: INK }); P.text('TORSION SPRING INSIDE', cx0 - 40, cy0 + 62, { size: 6.6, c: INK, a: 0.8 });
    }
    /* ================= engineer's dimensions on the lens and body ================= */
    { const pr = p => CAM.project(p), dimS = (a, b, lb, off) => { const A = pr(a), B = pr(b); if (A && B) P.dim(A[0], A[1], B[0], B[1], lb, off, { size: 7.4 }); };
      dimS([0, -RR - 22, 30 - 26], [0, -RR - 22 - 5 * G - 90, 30 - 26], 'LENS STACK 262', 26);
    }


    /* ================= artistic layer: assembled thumbnail, pencil construction, foxing, stamp, margin notes ================= */
    { const PEN = '#6f6a5e';
      // --- paper foxing: small brown spots and a faint tide mark
      for (let i = 0; i < 38; i++) { const x = P.r(70, 1530), y = P.r(60, 840), r = P.r(0.6, 2.6); P.wash(Array.from({ length: 10 }, (_, k) => [x + Math.cos(k * TAU / 10) * r * P.r(0.8, 1.2), y + Math.sin(k * TAU / 10) * r * P.r(0.8, 1.2)]), '#a07840', P.r(0.12, 0.3), { edge: 0, jit: 0.2, steps: 1 }); }
      { const cx = 1470, cy = 190, rr = 64, pts = Array.from({ length: 40 }, (_, k) => [cx + Math.cos(k * TAU / 40) * rr * P.r(0.96, 1.04), cy + Math.sin(k * TAU / 40) * rr * 0.92 * P.r(0.96, 1.04)]); P.path(pts.concat([pts[0]]), { w: 2.2, c: '#b8955a', a: 0.28, rough: 1.2, passes: 1 }); P.path(pts.map(([x, y]) => [x + 3, y + 2]), { w: 0.8, c: '#b8955a', a: 0.2, rough: 1.2, passes: 1 }); }
      // --- pencil construction: extended axes and guide ellipses behind parts
      const pc = (a, b) => { const A = CAM.project(a), B = CAM.project(b); if (A && B) P.line(A[0], A[1], B[0], B[1], { w: 0.45, c: PEN, a: 0.35, rough: 0.4, over: 6, passes: 1 }); };
      pc([0, -RR + 40, 30], [0, -RR - 330, 30]); pc([-HW - RR - 30, 0, 0], [HW + RR + 40, 0, 0]); pc([-HW - RR - 30, -RR, 60], [HW + RR + 40, -RR, 60]);
      [22, 22 + 32, 22 + 3 * 32 + 40, 22 + 4 * 32 + 72].forEach(dy => { const pts = []; for (let k = 0; k <= 48; k++) { const a = k * TAU / 48; pts.push([Math.cos(a) * 30, -RR - dy, 30 + Math.sin(a) * 30]); } const q = pts.map(CAM.project).filter(Boolean).map(p => [p[0], p[1]]); P.path(q, { w: 0.4, c: PEN, a: 0.3, rough: 0.6, passes: 1 }); });
      [[36, 0], [56, 0], [-42, 0]].forEach(([x, y]) => { const pts = []; for (let k = 0; k <= 36; k++) { const a = k * TAU / 36; pts.push([x + Math.cos(a) * 16, y + Math.sin(a) * 16, ZT + 1]); } const q = pts.map(CAM.project).filter(Boolean).map(p => [p[0], p[1]]); P.path(q, { w: 0.4, c: PEN, a: 0.3, rough: 0.6, passes: 1 }); });
      // --- assembled thumbnail, loose pencil, top-middle
      { const tc = D.camera({ eye: [-360, -520, 300], target: [0, -20, 34], f: 640, cx: 690, cy: 285 }), F = [];
        F.push(...D.extrude(stadium(HW, RR), 0, 60, { crease: 0.5 })); F.push(...D.extrude(stadium(HW, RR), 60, 72, { crease: 0.5 }));
        F.push(...box(-66, -15, 72, -18, 12, 86)); F.push(...D.revolve(36, 0, [[9, 72], [9, 80], [0.01, 80]], { seg: 24 })); F.push(...D.revolve(56, 0, [[10.5, 72], [10.5, 84], [0.01, 84]], { seg: 24 })); F.push(...D.revolve(-42, 0, [[8.6, 72], [8.6, 80], [0.01, 80]], { seg: 20 }));
        F.push(...toFront(D.revolve(0, 0, [[23, 0], [23, 8], [21.6, 8], [21.6, 30], [20, 30], [20, 50], [21.5, 52], [21.5, 60], [0.01, 60]], { seg: 32 }), 0, -RR, 30));
        [[-62, -52], [-40, -24]].forEach(([x0, x1]) => F.push({ v: [[x0, -15.05, 75], [x1, -15.05, 75], [x1, -15.05, 83], [x0, -15.05, 83]], n: [0, -1, 0], hard: [true, true, true, true], tone: 0.9, bias: 1 }));
        D.render(P, F, tc, { ink: PEN, paper: '#ffffff', light: [-0.55, -0.25, 0.55], ambient: 0.1, gap: 3.4, w: 0.8, rough: 0.35, zw: 0, hatchMin: 0.25 });
        D.knurl(P, tc, 0, 0, 21.7, 0, 0, 0); P.text('ASSEMBLED', 690, 356, { size: 9, c: PEN, align: 'center', font: S.HAND, a: 0.8 }); P.text('(SCALE 1 : 1)', 690, 368, { size: 6.4, c: PEN, align: 'center', a: 0.7 }); }
      // --- archive stamp: double ring, text round the rim, date in the middle, faded violet
      { const sx = 1180, sy = 590, V = '#5d4f86'; P.circle(sx, sy, 38, { w: 1.4, c: V, a: 0.55, passes: 1, rough: 0.6 }); P.circle(sx, sy, 31, { w: 0.8, c: V, a: 0.5, passes: 1, rough: 0.6 }); const txt = 'MUSEUM OF OPTICS * ARCHIVE * '; for (let i = 0; i < txt.length; i++) { const a = -Math.PI / 2 + i * TAU / txt.length; P.text(txt[i], sx + Math.cos(a) * 34.5, sy + Math.sin(a) * 34.5 + 2, { size: 5.4, c: V, a: 0.55, align: 'center', rot: a + Math.PI / 2 }); } P.text('12 III 1954', sx, sy + 3, { size: 8.4, c: V, a: 0.6, align: 'center', rot: -0.12 }); P.line(sx - 22, sy - 9, sx + 22, sy - 12, { w: 0.6, c: V, a: 0.45, passes: 1, over: 0 }); P.line(sx - 22, sy + 12, sx + 22, sy + 9, { w: 0.6, c: V, a: 0.45, passes: 1, over: 0 }); }
      // --- pencilled margin notes and a check mark
      P.text('check helicoid pitch - 0.75 mm?', 1010, 482, { size: 10, c: PEN, a: 0.6, font: S.NOTE, rot: -0.05 });
      P.text('curtain silk: order from Lyon', 980, 830, { size: 10, c: PEN, a: 0.55, font: S.NOTE, rot: -0.03 });
      P.path([[1250, 470], [1256, 478], [1270, 458]], { w: 1.4, c: PEN, a: 0.55, rough: 0.5, passes: 1 });
    }

    /* ================= the archive plate: border, fold, callouts, parts table, title band ================= */
    { const L0 = 58, T0 = 52, R0 = 1542, B0 = 900;
      P.rect(L0, T0, R0 - L0, B0 - T0, { w: 0.9, c: INK, a: 0.85, rough: 0.2, over: 0, passes: 1 }); P.rect(L0 - 6, T0 - 6, R0 - L0 + 12, B0 - T0 + 12, { w: 0.4, c: INK, a: 0.6, rough: 0.2, over: 0, passes: 1 });
      // the fold down the middle of the archive sheet
      for (let y = 20; y < 980; y += 3) P.line(800 + P.r(-0.4, 0.4), y, 800 + P.r(-0.4, 0.4), y + 3, { w: 0.5, c: '#b8a882', a: 0.35, passes: 1, over: 0, rough: 0.1 });
      // project the anchors and split them into a left and right column
      const KEEP = ["SHUTTER SPEED DIAL 1 - 1/500", "FILM ADVANCE KNOB", "REWIND KNOB + CRANK", "TOP DECK, CHROME BRASS", "RANGEFINDER BLOCK", "WIND TRAIN, 3 WHEELS", "BODY SHELL, DIE-CAST", "35 MM FILM CASSETTE", "BASEPLATE + LOCKING KEY", "BAYONET MOUNT", "HELICOID + FOCUS RING", "CEMENTED DOUBLET", "FRONT BARREL", "LENS HOOD", "FIRST CURTAIN DRUM", "CURTAIN, RUBBERISED SILK", "SHUTTER CRATE"];
      const pts = anchors.filter(([lb]) => KEEP.includes(lb)).map(([lb, p], i) => { const q = CAM.project(p); return q ? { lb, x: q[0], y: q[1], i } : null; }).filter(Boolean);
      const left = pts.filter(q => q.x < 640 && !(q.x > 560 && q.y > 420)).sort((a, b) => a.y - b.y), right = pts.filter(q => !(q.x < 640 && !(q.x > 560 && q.y > 420))).sort((a, b) => a.y - b.y);
      const settle = (arr, top, bot, gap) => { arr.forEach(q => q.ly = q.y); for (let k = 1; k < arr.length; k++) arr[k].ly = Math.max(arr[k].ly, arr[k - 1].ly + gap); const over = arr.length ? arr[arr.length - 1].ly - bot : 0; if (over > 0) arr.forEach(q => q.ly -= over); for (let k = arr.length - 2; k >= 0; k--) arr[k].ly = Math.min(arr[k].ly, arr[k + 1].ly - gap); if (arr.length && arr[0].ly < top) { const d = top - arr[0].ly; arr.forEach(q => q.ly += d); } };
      settle(left, T0 + 24, 836, 20); settle(right, T0 + 24, 836, 20);
      let num = 1; const all = left.concat(right); all.forEach(q => q.n = num++);
      const draw = (q, side) => { const lx = side < 0 ? 200 : 1392, tx = side < 0 ? lx - 16 : lx + 16, kx = side < 0 ? lx + 22 : lx - 22;
        P.dot(q.x, q.y, 1.6, { c: INK, a: 0.95 });
        P.line(q.x, q.y, kx, q.ly, { w: 0.45, c: INK, a: 0.8, passes: 1, over: 0, rough: 0.15 }); P.line(kx, q.ly, lx, q.ly, { w: 0.45, c: INK, a: 0.8, passes: 1, over: 0, rough: 0.1 });
        P.circle(lx + side * -0, q.ly, 7.6, { w: 0.7, c: INK, passes: 1, rough: 0.1 }); P.text(String(q.n), lx, q.ly + 3.2, { size: 8.2, c: INK, align: 'center' });
        P.text(q.lb, tx, q.ly + 3.4, { size: 9, c: INK, align: side < 0 ? 'right' : 'left', a: 0.95 }); };
      left.forEach(q => draw(q, -1)); right.forEach(q => draw(q, 1));
      // title band
      P.line(L0, B0 - 44, R0, B0 - 44, { w: 0.8, c: INK, passes: 1, over: 0, rough: 0.2 });
      [300, 700, 1000, 1330].forEach(x => P.line(x, B0 - 44, x, B0, { w: 0.6, c: INK, passes: 1, over: 0 }));
      P.text('AURELIA II  -  35 MM RANGEFINDER', L0 + 12, B0 - 18, { size: 14, c: INK, font: S.HAND }); P.text('EXPLODED VIEW, THREE-QUARTER FROM ABOVE', 312, B0 - 24, { size: 9, c: INK }); P.text('PLATE 12 OF 12  -  MUSEUM OF OPTICS ARCHIVE', 312, B0 - 10, { size: 7.4, c: INK, a: 0.85 });
      P.text('DRAWN  A.R.   CHECKED  M.K.', 712, B0 - 24, { size: 8, c: INK }); P.text('SCALE 2 : 1   DIM. MM', 712, B0 - 10, { size: 7.4, c: INK, a: 0.85 }); P.text('INV. NO. 1954-0371', 1012, B0 - 24, { size: 9, c: INK }); P.text('INK ON CARTRIDGE', 1012, B0 - 10, { size: 7.4, c: INK, a: 0.85 }); P.text('SHEET 12', 1436, B0 - 18, { size: 12, c: INK, align: 'center', font: S.HAND });
    }

  }
});
