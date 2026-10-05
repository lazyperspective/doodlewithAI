/* Exploded view of a vintage desk typewriter. True 3D, three-quarter view from the front left and above.
   Blue-black ballpoint on graph paper, red only on springs and screws. */
(window.SCENES = window.SCENES || []).push({
  name: 'Typewriter (exploded)', seed: 88, ink: '#1c2a3e', theme: 'mint',
  note: 'A vintage manual typewriter pulled apart along its vertical axis, every part numbered, on graph paper.',
  build(P, n, total) {
    const S = Sketch, D = S.D3, V = S.V3, TAU = S.TAU, lerp = S.lerp;
    const INK = '#1c2a3e', RED = '#c3272b', PAPER = '#f4f9f6';
    const tg = [20, 10, 272], yaw = -0.72, pit = 0.34, dist = 1800;
    const CAM = D.camera({ eye: [tg[0] + dist * Math.sin(yaw) * Math.cos(pit), tg[1] - dist * Math.cos(yaw) * Math.cos(pit), tg[2] + dist * Math.sin(pit)], target: tg, f: 2050, cx: 800, cy: 440 });
    const faces = [], add = f => { (Array.isArray(f) ? f : [f]).forEach(x => faces.push(x)); return f; };
    const custom = (c, fn, bias = 0) => faces.push({ custom: fn, c, bias: bias < 0 ? -bias * 12 + 18 : bias });
    const anchors = [];
    const tag = (label, p) => anchors.push([label, p]);

    /* ---------- geometry helpers ---------- */
    const box = (x0, y0, z0, x1, y1, z1, o = {}) => D.extrude([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], z0, z1, Object.assign({ crease: 0.3 }, o));
    const rrect = (hw, hh, r, seg = 6, yc = 0) => { const pts = [], cs = [[hw - r, hh - r, 0], [-hw + r, hh - r, 1], [-hw + r, -hh + r, 2], [hw - r, -hh + r, 3]]; cs.forEach(([cx, cy, q]) => { for (let i = 0; i <= seg; i++) { const a = q * Math.PI / 2 + Math.PI / 2 * i / seg; pts.push([cx + Math.cos(a) * r, cy + yc + Math.sin(a) * r]); } }); return pts; };
    // rotate a z-axis solid so its axis runs along +x: (x, y, z) -> (x0 + z, y0 + x, zc + y)
    const toX = (fs, x0, y0, zc) => fs.map(f => Object.assign({}, f, { v: f.v.map(([x, y, z]) => [x0 + z, y0 + x, zc + y]), n: [f.n[2], f.n[0], f.n[1]], hdir: f.hdir ? [f.hdir[2], f.hdir[0], f.hdir[1]] : undefined }));
    const cylX = (xa, xb, y, z, r, seg = 22, o = {}) => toX(D.cylinder(0, 0, r, 0, xb - xa, seg, o), xa, y, z);
    // prism along x from a side profile [[y, z], ...] (counter-clockwise with y to the right, z up)
    const prismX = (prof, x0, x1, o = {}) => { const fs = [], m = prof.length;
      for (let i = 0; i < m; i++) { const a = prof[i], b = prof[(i + 1) % m], dy = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dy, dz) || 1; fs.push(Object.assign({ v: [[x0, a[0], a[1]], [x1, a[0], a[1]], [x1, b[0], b[1]], [x0, b[0], b[1]]], n: [0, dz / L, -dy / L], hard: [true, true, true, true] }, o)); }
      fs.push(Object.assign({ v: prof.map(p => [x1, p[0], p[1]]), n: [1, 0, 0], hard: prof.map(() => true), all: true }, o)); fs.push(Object.assign({ v: prof.map(p => [x0, p[0], p[1]]).reverse(), n: [-1, 0, 0], hard: prof.map(() => true), all: true }, o)); return fs; };
    const screw = (x, y, z, r = 3.4, len = 12) => {
      add(D.cylinder(x, y, r * 0.5, z - len, z, 8).map(f => Object.assign(f, { c: RED, ca: 0.35 })));
      add(D.revolve(x, y, [[r * 0.5, z], [r, z + 1.6], [r, z + 2.6], [0.01, 2.6 + z]], { seg: 14 }).map(f => Object.assign(f, { c: RED, ca: 0.55 })));
      custom([x, y, z + 2.7], (PP, cm) => { const a = cm.project([x - r * 0.8, y, z + 2.7]), b = cm.project([x + r * 0.8, y, z + 2.7]); if (a && b) PP.line(a[0], a[1], b[0], b[1], { w: 1, c: RED, a: 1, passes: 1, over: 0, rough: 0.1 }); }, -1);
    };
    const spring = (x, y, z0, z1, r, turns) => custom([x, y, (z0 + z1) / 2], (PP, cm) => { const pts = D.helix(0, 0, r, z0, z1, turns, 16).map(([u, v, w]) => [x + u, y + v, w]); D.polyline3(PP, pts, cm, { w: 1.2, c: RED, a: 0.95 }); D.polyline3(PP, pts.map(([a, b, c]) => [a + 0.3, b, c - 0.3]), cm, { w: 0.5, c: RED, a: 0.6 }); }, -2);
    const guide = (a, b) => custom([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], (PP, cm) => D.dashed3(PP, a, b, cm, [7, 4], { w: 0.55, c: INK, a: 0.7 }), 1e6);

    /* layer heights (the explosion) */
    const Z_BASE = 0, Z_MECH = 108, Z_SHELL = 276, Z_DECK = 396, Z_CARR = 422, Z_PLAT = 508;

    /* ================= 1. base: plate, feet, side frame ================= */
    { const bp = rrect(182, 128, 20, 5);
      add(D.extrude(bp, Z_BASE, Z_BASE + 8, { bottom: true, crease: 1, bottomEdge: true }));
      [[-152, -98], [152, -98], [-152, 98], [152, 98]].forEach(([x, y]) => { add(D.revolve(x, y, [[15, Z_BASE - 14], [15, Z_BASE - 2], [13, Z_BASE], [0.01, Z_BASE]], { seg: 16 })); });
      add(box(-182, -108, 8, -170, 112, 58)); add(box(170, -108, 8, 182, 112, 58));       // side frames
      add(box(-170, 104, 8, 170, 114, 48)); add(box(-170, -112, 8, 170, -104, 30));       // rear and front cross rails
      // a pierced web in each side frame, just lines
      [-1, 1].forEach(sg => { const xs = sg * 182 + (sg > 0 ? 0 : 0); [-60, 0, 60].forEach(y => { custom([xs, y, 40], (PP, cm) => { const pts = []; for (let i = 0; i < 18; i++) { const a = i * TAU / 18; pts.push([xs + sg * 0.15, y + Math.cos(a) * 18, 42 + Math.sin(a) * 18]); } const q = pts.map(cm.project).filter(Boolean).map(p => [p[0], p[1]]); if (sg < 0) PP.path(q.concat([q[0]]), { w: 0.7, c: INK, a: 0.8, passes: 1, rough: 0.2 }); }, -1); }); });
      tag('BASE PLATE, PRESSED STEEL', [-130, -120, Z_BASE + 8]); tag('RUBBER FEET (4)', [-152, -98, Z_BASE - 12]);
      tag('SIDE FRAME + CROSS RAILS', [-182, -20, 58]);
      [[-176, -108], [176, -108], [-176, 108], [176, 108]].forEach(([x, y]) => screw(x, y, 58 + 40, 3.6, 12));
      [[-176, -108], [176, -108], [-176, 108], [176, 108]].forEach(([x, y]) => guide([x, y, 60], [x, y, 94]));
      tag('FRAME SCREWS (4)', [176, -108, 58 + 44]);
    }

    /* ================= 2. working mechanism: type segment, typebars, levers, rack ================= */
    { const z0 = Z_MECH, cx = 0, cy = 62;
      add(D.ringSolid(cx, cy, 98, 108, z0, z0 + 14, 44, { a0: -2.7, a1: -0.44 }));                    // the type segment, an arc round the printing point
      tag('TYPE SEGMENT (BASKET)', [cx + Math.cos(-2.4) * 103, cy + Math.sin(-2.4) * 103, z0 + 14]);
      const NB = 24; for (let i = 0; i < NB; i++) { const a = lerp(-2.62, -0.52, i / (NB - 1)), p = [cx + Math.cos(a) * 98, cy + Math.sin(a) * 98], q = [cx + Math.cos(a) * 42, cy + Math.sin(a) * 42];
        add(D.bodyOfBar(p, q, 1.3, 0.9, z0 + 10, z0 + 13)); add(box(q[0] - 2.2, q[1] - 2.2, z0 + 9, q[0] + 2.2, q[1] + 2.2, z0 + 15)); }
      tag('TYPEBARS WITH TYPE SLUGS (24)', [cx + Math.cos(-1.9) * 70, cy + Math.sin(-1.9) * 70, z0 + 13]);
      for (let i = 0; i < 11; i++) add(box(-110 + i * 22 - 1.6, -126, z0 + 2, -110 + i * 22 + 1.6, -26, z0 + 5));   // key levers
      tag('KEY LEVERS', [66, -112, z0 + 5]);
      add(box(-126, -34, z0 + 4, 126, -27, z0 + 15)); tag('UNIVERSAL BAR', [-126, -30, z0 + 15]);
      add(D.cylinder(-136, 74, 22, z0, z0 + 16, 28)); add(D.gearMesh(-136, 74, 16, 18, z0 + 16, z0 + 22, 0.1));
      custom([-136, 74, z0 + 23], (PP, cm) => { const pts = []; for (let i = 0; i <= 60; i++) { const t = i / 60, a = t * 5 * TAU, r = 2 + 12 * t; pts.push([-136 + Math.cos(a) * r, 74 + Math.sin(a) * r, z0 + 22.4]); } D.polyline3(PP, pts, cm, { w: 1.1, c: RED, a: 0.95 }); }, -2);
      tag('MAINSPRING DRUM', [-136 - 22, 74, z0 + 16]);
      // escapement rack: a sawtooth bar along the back
      { const pts = []; for (let x = -150; x <= 150; x += 6) { pts.push([x, 120]); pts.push([x + 3, 114]); } pts.push([150, 126], [-150, 126]); add(D.extrude(pts, z0 + 18, z0 + 26, { crease: 0.9 })); tag('ESCAPEMENT RACK', [-120, 120, z0 + 26]); }
      add(D.gearMesh(118, 98, 11, 14, z0 + 18, z0 + 26, 0.2)); add(D.cylinder(118, 98, 3, z0 + 26, z0 + 33, 8)); tag('ESCAPEMENT WHEEL + DOG', [118 + 10, 98, z0 + 26]);
      spring(-150, -70, z0 + 6, z0 + 76, 6, 10); spring(150, -70, z0 + 6, z0 + 76, 6, 10);
      tag('RETURN SPRINGS (2)', [150, -70, z0 + 60]);
      guide([-150, -70, z0 + 76], [-150, -70, Z_SHELL]); guide([150, -70, z0 + 76], [150, -70, Z_SHELL]);
    }

    /* ================= 3. body shell ================= */
    { const z0 = Z_SHELL, H = 56, pts = [];
      const arc = (cx, cy, r, a0, a1, seg = 6) => { for (let i = 0; i <= seg; i++) { const a = a0 + (a1 - a0) * i / seg; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
      arc(-150, -95, 30, Math.PI, 1.5 * Math.PI); arc(150, -95, 30, 1.5 * Math.PI, 2 * Math.PI);
      pts.push([182, 126], [152, 126], [152, 14], [-152, 14], [-152, 126], [-182, 126]);
      const sh = D.extrude(pts, z0, z0 + H, { crease: 0.5 });
      sh.filter(f => f.n[2] > 0.9).forEach(f => { f.c = '#6f9b91'; f.ca = 0.1; });
      add(sh);
      // chrome trim strip round the lower edge, and a name plate on the front face
      custom([0, -125, z0 + 30], (PP, cm) => { const a = cm.project([-120, -125.4, z0 + 30]), b = cm.project([120, -125.4, z0 + 30]); if (!a || !b) return; const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        PP.line(a[0], a[1] + 14, b[0], b[1] + 14, { w: 0.8, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 }); PP.line(a[0], a[1] - 14, b[0], b[1] - 14, { w: 0.8, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 });
        PP.text('MERIDIAN  STANDARD  No. 5', mx, my + 3, { size: 10, align: 'center', rot: ang, c: INK, a: 0.9 }); }, 2);
      // ventilation slots on the left flank
      for (let i = 0; i < 7; i++) { const y = -60 + i * 16; custom([-182, y, z0 + 28], (PP, cm) => { const a = cm.project([-182.3, y, z0 + 16]), b = cm.project([-182.3, y, z0 + 40]); if (a && b) { PP.line(a[0], a[1], b[0], b[1], { w: 1.3, c: INK, a: 0.8, passes: 1, over: 0, rough: 0.2 }); } }, 2); }
      tag('BODY SHELL, ENAMELLED', [-182, -76, z0 + 44]);
      [[-150, -112], [150, -112]].forEach(([x, y]) => guide([x, y, z0 + H], [x, y, Z_DECK - 4]));
    }

    /* ================= 4. ribbon spools (pulled out to the right) ================= */
    { const z0 = Z_SHELL + 30, ys = 20, xs = [330, 404];
      xs.forEach(x => { add(D.cylinder(x, ys, 22, z0, z0 + 12, 24)); add(D.cylinder(x, ys, 27, z0 + 12, z0 + 14, 26)); add(D.cylinder(x, ys, 4, z0 + 14, z0 + 24, 10)); add(D.cylinder(x, ys, 27, z0 - 2, z0, 26)); guide([x, ys, z0 - 3], [x, ys, z0 - 50]); });
      add(box(359, -58, z0 + 1, 375, -50, z0 + 18)); add(box(363, -62, z0 + 1, 371, -58, z0 + 6));
      custom([300, ys - 20, z0 + 9], (PP, cm) => { const a = cm.project([316, ys - 20, z0 + 7]), b = cm.project([418, ys - 20, z0 + 7]), m = cm.project([367, -56, z0 + 7]); if (a && b && m) PP.curve([[a[0], a[1]], [lerp(a[0], m[0], 0.75), lerp(a[1], m[1], 0.75)], [m[0], m[1]], [lerp(b[0], m[0], 0.75), lerp(b[1], m[1], 0.75)], [b[0], b[1]]], { w: 1.8, c: INK, a: 0.9, rough: 0.2, passes: 1 }); }, -3);
      tag('RIBBON SPOOLS (2)', [404, ys, z0 + 24]); tag('INKED RIBBON', [336, -30, z0 + 7]); tag('RIBBON VIBRATOR', [367, -56, z0 + 18]);
    }

    /* ================= 5. keyboard deck, keys, space bar ================= */
    { const z0 = Z_DECK, yf = -126, yb = -18;
      add(prismX([[yf, z0], [yb, z0], [yb, z0 + 36], [yf, z0 + 8]], -168, 168, { c: undefined }));
      const slope = y => z0 + 8 + (y - yf) / (yb - yf) * 28;
      tag('KEYBOARD DECK, SLOPED', [-168, -80, slope(-80) - 2]);
      const rows = [['ZXCVBNM,.', -96, 14], ['ASDFGHJKL;', -74, 3], ['QWERTYUIOP', -52, -8], ['1234567890', -30, -19]], LIFT = 40;
      let first = true;
      rows.forEach(([chars, y, x0]) => { for (let i = 0; i < chars.length; i++) { const x = x0 + (i - (chars.length - 1) / 2) * 25 - (chars.length - 1) * 0 - (y === -96 ? 10 : 0) + (y === -30 ? 0 : 0), zt = slope(y) + LIFT;
        add(D.cylinder(x, y, 2.2, slope(y), zt, 6)); add(D.revolve(x, y, [[8.6, zt], [8.6, zt + 9], [7.6, zt + 11.5], [0.01, zt + 11.5]], { seg: 12, crease: 0.4 }));
        const ch = chars[i]; custom([x, y, zt + 12], (PP, cm) => { const q = cm.project([x, y, zt + 11.7]); if (q) PP.text(ch, q[0], q[1] + 2.6, { size: 8, align: 'center', c: INK, a: 1, lw: 0.9 }); }, 1e6);
        if ((i === 0 || i === chars.length - 1) && (y === -96 || y === -30)) guide([x, y, slope(y) + 1], [x, y, zt - 1]); } });
      tag('KEYS WITH STEMS (39)', [-110, -52, slope(-52) + LIFT + 11]);
      const zs = slope(-130) + LIFT + 4; add(box(-86, -138, zs, 86, -128, zs + 7)); tag('SPACE BAR', [86, -133, zs + 7]);
      guide([-80, -133, zs - 1], [-80, -133, z0 + 6]); guide([80, -133, zs - 1], [80, -133, z0 + 6]);
    }

    /* ================= 6. carriage frame: rails, end plates, rack, bail, return lever ================= */
    { const z0 = Z_CARR, yb = 100;
      add(box(-196, yb - 18, z0, 196, yb - 10, z0 + 16)); add(box(-196, yb + 22, z0, 196, yb + 30, z0 + 16));   // front and back rails
      add(box(-198, yb - 20, z0, -188, yb + 32, z0 + 46)); add(box(188, yb - 20, z0, 198, yb + 32, z0 + 46));   // end plates
      tag('CARRIAGE RAILS + END PLATES', [-198, yb, z0 + 40]);
      // scale plate with ticks along the front rail
      custom([0, yb - 18, z0 + 17], (PP, cm) => { for (let x = -170; x <= 170; x += 5) { const a = cm.project([x, yb - 17, z0 + 16.2]), b = cm.project([x, yb - 17, z0 + 16.2 + (x % 25 === 0 ? 5 : 3)]); if (a && b) PP.line(a[0], a[1], b[0], b[1], { w: 0.5, c: INK, a: 0.8, passes: 1, over: 0, rough: 0.1 }); } }, -1);
      tag('MARGIN SCALE', [120, yb - 17, z0 + 17]);
      // paper bail: rod with two arms and a pair of rollers
      { const zb = z0 + 66, yp = yb - 52; add(cylX(-176, 176, yp, zb, 2.2, 10)); add(box(-176, yp, zb - 2, -170, yb - 20, zb + 2)); add(box(170, yp, zb - 2, 176, yb - 20, zb + 2)); [-90, 90].forEach(x => add(cylX(x - 8, x + 8, yp, zb, 5, 14)));
        guide([-173, yp, zb - 3], [-173, yp, z0 + 46]); guide([173, yp, zb - 3], [173, yp, z0 + 46]); tag('PAPER BAIL + ROLLERS', [90, yp, zb + 5]); }
      // carriage return lever
      add(D.bodyOfBar([-196, yb + 4], [-262, yb - 36], 2.4, 2.4, z0 + 30, z0 + 34)); add(D.cylinder(-264, yb - 38, 7, z0 + 24, z0 + 40, 14));
      tag('CARRIAGE RETURN LEVER', [-264, yb - 38, z0 + 40]);
    }

    /* ================= 7. platen, knobs, ratchet ================= */
    { const z0 = Z_PLAT, yb = 100, zc = z0 + 22, R = 22;
      add(cylX(-170, 170, yb, zc, R, 26));
      // rubber platen: end caps and a pair of lines near each end
      [-1, 1].forEach(sg => add(cylX(sg > 0 ? 170 : -178, sg > 0 ? 178 : -170, yb, zc, R + 2, 26)));
      tag('RUBBER PLATEN', [-60, yb - R, zc - 4]);
      add(cylX(-206, -178, yb, zc, 5, 10)); add(cylX(-260, -206, yb, zc, 16, 22)); add(cylX(-270, -260, yb, zc, 19, 22)); tag('PLATEN KNOB, LEFT', [-270, yb - 8, zc + 18]);
      add(cylX(178, 214, yb, zc, 5, 10)); add(cylX(214, 262, yb, zc, 16, 22)); add(cylX(262, 270, yb, zc, 19, 22)); tag('PLATEN KNOB, RIGHT', [270, yb - 6, zc + 18]);
      add(toX(D.gearMesh(0, 0, 21, 26, 0, 6, 0.1), 188, yb, zc)); tag('LINE-SPACE RATCHET', [190, yb - 22, zc + 2]);
      // axis line through the platen and the knobs
      guide([-300, yb, zc], [-262, yb, zc]); guide([270, yb, zc], [310, yb, zc]);
      // knurl ridges on the knobs
      [[-260, -206], [214, 262]].forEach(([xa, xb]) => custom([(xa + xb) / 2, yb, zc], (PP, cm) => { for (let k = 0; k < 20; k++) { const a = k * TAU / 20; if (Math.cos(a) > 0.05 || true) { const p0 = cm.project([xa + 3, yb + Math.cos(a) * 16.2, zc + Math.sin(a) * 16.2]), p1 = cm.project([xb - 3, yb + Math.cos(a) * 16.2, zc + Math.sin(a) * 16.2]); const nrm = [0, Math.cos(a), Math.sin(a)]; if (p0 && p1 && V.dot ? true : true) { const ev = [CAM.eye[0], CAM.eye[1] - yb, CAM.eye[2] - zc]; if (nrm[1] * ev[1] + nrm[2] * ev[2] > 0) PP.line(p0[0], p0[1], p1[0], p1[1], { w: 0.45, c: INK, a: 0.7, passes: 1, over: 0, rough: 0.1 }); } } } }, -1));
      guide([-150, yb, zc - R - 2], [-150, yb, Z_CARR + 18]); guide([150, yb, zc - R - 2], [150, yb, Z_CARR + 18]);
    }

    /* ---------- vertical assembly axis: a long chain line through the middle ---------- */

    /* ================= render the 3D part ================= */
    D.render(P, faces, CAM, { light: V.norm([-0.55, -0.55, 0.7]), ink: INK, paper: PAPER, hatchMin: 0.28, gap: 4.4, w: 1.35, rough: 0.35, ambient: 0.12, zw: 2.2, shadowSide: true });

    /* ================= sheet furniture: frame, callouts, notes ================= */
    P.frame('TYPEWRITER, EXPLODED', 'MERIDIAN STANDARD No. 5, 1938', n || 1, total || 1, { note: 'ballpoint on graph paper', scale: 'SCALE  1 : 4' });
    { // callouts: numbered leaders into a left and a right column
      const pts = anchors.map(([lb, p], i) => { const q = CAM.project(p); return q ? { lb, x: q[0], y: q[1] } : null; }).filter(Boolean);
      const left = pts.filter(q => q.x < 800).sort((a, b) => a.y - b.y), right = pts.filter(q => q.x >= 800).sort((a, b) => a.y - b.y);
      const settle = (arr, top, bot, gap) => { arr.forEach(q => q.ly = q.y); for (let k = 1; k < arr.length; k++) arr[k].ly = Math.max(arr[k].ly, arr[k - 1].ly + gap); const over = arr.length ? arr[arr.length - 1].ly - bot : 0; if (over > 0) arr.forEach(q => q.ly -= over); for (let k = arr.length - 2; k >= 0; k--) arr[k].ly = Math.min(arr[k].ly, arr[k + 1].ly - gap); if (arr.length && arr[0].ly < top) { const d = top - arr[0].ly; arr.forEach(q => q.ly += d); } };
      settle(left, 70, 840, 25); settle(right, 70, 780, 25);
      let num = 1; left.concat(right).forEach(q => q.n = num++);
      const draw = (q, side) => { const lx = side < 0 ? 330 : 1270, tx = side < 0 ? lx - 16 : lx + 16, kx = side < 0 ? lx + 22 : lx - 22;
        P.dot(q.x, q.y, 1.8, { c: INK, a: 0.95 });
        P.line(q.x, q.y, kx, q.ly, { w: 0.5, c: INK, a: 0.75, passes: 1, over: 0, rough: 0.15 }); P.line(kx, q.ly, lx, q.ly, { w: 0.5, c: INK, a: 0.75, passes: 1, over: 0, rough: 0.1 });
        P.circle(lx, q.ly, 8.4, { w: 0.8, c: INK, passes: 1, rough: 0.1 }); P.text(String(q.n), lx, q.ly + 3.4, { size: 9, c: INK, align: 'center' });
        P.text(q.lb, tx, q.ly + 3.6, { size: 10.4, c: INK, align: side < 0 ? 'right' : 'left', a: 0.95 }); };
      left.forEach(q => draw(q, -1)); right.forEach(q => draw(q, 1));
    }
    // overall width dimension under the base
    { const a = CAM.project([-182, -128, Z_BASE - 14]), b = CAM.project([182, -128, Z_BASE - 14]); if (a && b) P.dim(a[0], a[1], b[0], b[1], '364 MM', 26, { size: 13 }); }
    { const a = CAM.project([-182, -128, Z_BASE - 14]), b = CAM.project([-182, 128, Z_BASE - 14]); if (a && b) P.dim(a[0], a[1], b[0], b[1], '256 MM', -26, { size: 13 }); }
    P.label('parts shown in order of assembly, bottom to top', 80, 862, { size: 14, a: 0.7 });
    P.label('red = springs and screws', 80, 888, { size: 14, a: 0.7, c: RED });
    P.text('NOTES', 80, 832, { size: 12, a: 0.8 });
  }
});
