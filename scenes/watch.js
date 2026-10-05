/* SHEET 9 — A grand-complication movement: tourbillon, perpetual calendar, minute repeater. Black ink, red highlights. */
(window.SCENES = window.SCENES || []).push({
  name: 'Watch Movement', seed: 97, ink: '#15151a', theme: 'ink',
  build(P, n, t) {
    const S = Sketch, TAU = S.TAU, lerp = S.lerp;
    const INK = '#15151a', RED = '#c1272d', RUBY = '#d8434b', MID = '#5a5a60';
    const R = (a, b) => P.r(a, b);
    P.frame('CALIBRE 9-COMPLICATION', 'TOURBILLON, CALENDAR', n, t, { scale: 'SCALE 5 : 1', note: 'black ink + red' });
    const C = [474, 494], PR = 350;
    const ring = (cx, cy, r0, r1, k = 36) => { const a = [], b = []; for (let i = 0; i <= k; i++) { const th = i * TAU / k; a.push([cx + Math.cos(th) * r1, cy + Math.sin(th) * r1]); b.push([cx + Math.cos(th) * r0, cy + Math.sin(th) * r0]); } return a.concat(b.reverse()); };
    const discPoly = (cx, cy, r, k = 28) => Array.from({ length: k }, (_, i) => [cx + Math.cos(i * TAU / k) * r, cy + Math.sin(i * TAU / k) * r]);
    const clear = (cx, cy, r) => P.erase(discPoly(cx, cy, r));
    const shade = (poly, cx, cy, r, o = {}) => P.hatch(poly, { ang: o.ang ?? -50, gap: o.gap ?? 2.2, a: o.a ?? 0.55, w: 0.45, c: INK, fade: (x, y) => Math.max(0, Math.min(1, ((x - cx) + (y - cy)) / r * 0.55 + 0.32)), piece: 8, inset: 0.4 });
    const capsule = (a, b, w0, w1, k = 8) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), pts = []; for (let i = 0; i <= k; i++) { const th = ang - Math.PI / 2 - Math.PI * i / k; pts.push([a[0] + Math.cos(th) * w0, a[1] + Math.sin(th) * w0]); } for (let i = 0; i <= k; i++) { const th = ang + Math.PI / 2 - Math.PI * i / k; pts.push([b[0] + Math.cos(th) * w1, b[1] + Math.sin(th) * w1]); } void L; return pts; };
    const jewel = (x, y, r = 5) => { P.circle(x, y, r + 3.4, { w: 0.9, c: INK, a: 0.95, passes: 1 }); P.circle(x, y, r + 1.4, { w: 0.5, c: INK, a: 0.7, passes: 1 }); P.wash(discPoly(x, y, r, 14), RUBY, 0.85, { edge: 0.5, jit: 0.2, steps: 2 }); P.circle(x, y, r, { w: 0.9, c: RED, a: 0.95, passes: 1 }); P.circle(x, y, r * 0.38, { w: 0.6, c: INK, a: 0.9, passes: 1 }); P.dot(x, y, r * 0.16, { c: INK }); P.arc(x, y, r * 0.66, r * 0.66, 3.6, 4.7, { w: 0.5, c: '#fff', a: 0.9, passes: 1 }); };
    const screw = (x, y, r = 4, ang = R(0, TAU)) => { P.circle(x, y, r, { w: 0.9, c: INK, a: 0.95, passes: 1 }); P.circle(x, y, r * 0.78, { w: 0.4, c: INK, a: 0.55, passes: 1 }); P.line(x - Math.cos(ang) * r * 0.82, y - Math.sin(ang) * r * 0.82, x + Math.cos(ang) * r * 0.82, y + Math.sin(ang) * r * 0.82, { w: 1.1, c: INK, a: 0.95, passes: 1, over: 0, rough: 0.1 }); };
    const gearPts = (cx, cy, r, z, rot, prof = 0) => { const pts = [], p = TAU / z, r0 = r * 0.86; for (let i = 0; i < z; i++) { const a = rot + i * p; if (prof === 0) { [[-0.34, r0], [-0.16, r * 0.98], [-0.07, r], [0.07, r], [0.16, r * 0.98], [0.34, r0]].forEach(([f, rr]) => pts.push([cx + Math.cos(a + f * p) * rr, cy + Math.sin(a + f * p) * rr])); pts.push([cx + Math.cos(a + 0.5 * p) * r0 * 0.995, cy + Math.sin(a + 0.5 * p) * r0 * 0.995]); } else { [[-0.3, r0], [0.0, r], [0.05, r], [0.42, r0]].forEach(([f, rr]) => pts.push([cx + Math.cos(a + f * p) * rr, cy + Math.sin(a + f * p) * rr])); } } return pts; };
    const gear = (cx, cy, r, z, rot = 0, o = {}) => {
      const pts = gearPts(cx, cy, r, z, rot, o.prof || 0); if (!o.noClear) P.erase(pts); P.wash(pts, '#ffffff', 0, { edge: 0, steps: 1 });
      P.path(pts, { closed: true, w: o.w ?? 1.15, c: INK, a: 0.95, rough: 0.2, passes: 1 });
      const rimIn = r * (o.rim ?? 0.74); P.circle(cx, cy, rimIn, { w: 0.9, c: INK, a: 0.9, passes: 1, rough: 0.3 }); P.circle(cx, cy, rimIn * 0.965, { w: 0.4, c: INK, a: 0.5, passes: 1 });
      const hub = r * (o.hub ?? 0.2), sp = o.spokes ?? 5, sw = o.sw ?? 0.085;
      for (let i = 0; i < sp; i++) { const a = rot + o.sr + i * TAU / sp || rot + i * TAU / sp; const a0 = a - sw * 1.4, a1 = a + sw * 1.4; const arm = [[cx + Math.cos(a0) * hub, cy + Math.sin(a0) * hub], [cx + Math.cos(a0 * 0.99 + a * 0.01) * rimIn * 0.965, cy + Math.sin(a0) * rimIn * 0.965], [cx + Math.cos(a1) * rimIn * 0.965, cy + Math.sin(a1) * rimIn * 0.965], [cx + Math.cos(a1) * hub, cy + Math.sin(a1) * hub]]; P.pl(arm, { w: 0.85, c: INK, a: 0.9, rough: 0.2, over: 0, passes: 1 }); P.erase(arm.map(([x, y]) => [x, y])); }
      for (let i = 0; i < sp; i++) { const a = rot + i * TAU / sp, a0 = a - sw * 1.4, a1 = a + sw * 1.4; const arm = [[cx + Math.cos(a0) * hub, cy + Math.sin(a0) * hub], [cx + Math.cos(a0) * rimIn * 0.965, cy + Math.sin(a0) * rimIn * 0.965], [cx + Math.cos(a1) * rimIn * 0.965, cy + Math.sin(a1) * rimIn * 0.965], [cx + Math.cos(a1) * hub, cy + Math.sin(a1) * hub]]; P.pl(arm, { w: 0.85, c: INK, a: 0.9, rough: 0.2, over: 0, passes: 1 }); }
      P.circle(cx, cy, hub, { w: 1.1, c: INK, a: 0.95, passes: 1 }); P.circle(cx, cy, hub * 0.5, { w: 0.7, c: INK, a: 0.9, passes: 1 }); P.dot(cx, cy, Math.max(1, hub * 0.14), { c: INK });
      if (o.shade !== false) { shade(ring(cx, cy, rimIn * 0.965, r * 0.86, 24), cx, cy, r); }
      if (o.red) { P.wash(ring(cx, cy, hub * 0.5, hub, 14), RUBY, 0.75, { edge: 0, jit: 0.2, steps: 1 }); }
    };
    const pinion = (cx, cy, r, z, rot = 0) => { const pts = gearPts(cx, cy, r, z, rot, 0); P.path(pts, { closed: true, w: 0.8, c: INK, a: 0.95, rough: 0.15, passes: 1 }); P.wash(pts, INK, 0.28, { edge: 0, jit: 0.1, steps: 1 }); };

    const coilLine = (x1, y1, x2, y2, turns, amp, c = INK) => { const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, pts = [[x1, y1]]; for (let i = 0; i < turns * 2; i++) { const t2 = (i + 0.5) / (turns * 2), sg = i % 2 ? -1 : 1; pts.push([x1 + dx * t2 + nx * amp * sg, y1 + dy * t2 + ny * amp * sg]); } pts.push([x2, y2]); P.pl(pts, { w: 0.8, c, a: 0.95, rough: 0.2, over: 0, passes: 1 }); };

    /* ================= 1. case ring, gong wire, main plate with perlage ================= */
    { // case middle: two rings with screws, three pushers and the crown
      P.circle(C[0], C[1], PR + 34, { w: 2.2, c: INK, a: 0.98, passes: 2 }); P.circle(C[0], C[1], PR + 24, { w: 0.9, c: INK, a: 0.8, passes: 1 }); P.circle(C[0], C[1], PR + 8, { w: 1.5, c: INK, a: 0.95, passes: 1 });
      shade(ring(C[0], C[1], PR + 24, PR + 34, 60), C[0], C[1], PR + 34, { gap: 1.8, a: 0.5 });
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + 0.26; screw(C[0] + Math.cos(a) * (PR + 29), C[1] + Math.sin(a) * (PR + 29), 4.4, a + 0.7); }
      [[-0.72, 16], [-0.34, 16], [0.34, 16]].forEach(([a, w]) => { const bx = C[0] + Math.cos(a) * (PR + 34), by = C[1] + Math.sin(a) * (PR + 34), ex = C[0] + Math.cos(a) * (PR + 58), ey = C[1] + Math.sin(a) * (PR + 58); void ex; void ey; });
      // crown at 3 o'clock, fluted, with stem
      const cx0 = C[0] + PR + 34, cy0 = C[1]; P.line(cx0, cy0, cx0 + 26, cy0, { w: 6, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.rect(cx0 + 20, cy0 - 20, 34, 40, { w: 1.5, c: INK, a: 0.98, rough: 0.2, over: 0, passes: 1 }); for (let k = -8; k <= 8; k++) P.line(cx0 + 20, cy0 + k * 2.3, cx0 + 54, cy0 + k * 2.3, { w: 0.55, c: INK, a: 0.75, passes: 1, over: 0, rough: 0.1 }); P.arc(cx0 + 54, cy0, 6, 20, -Math.PI / 2, Math.PI / 2, { w: 1.3, c: INK, passes: 1 }); P.circle(cx0 + 38, cy0, 6.4, { w: 1, c: RED, a: 0.9, passes: 1 }); P.text('R', cx0 + 38, cy0 + 3, { size: 7.4, c: RED, align: 'center', a: 0.95 });
      // corrector pushers at 2, 4 and 10 o'clock
      [-0.6, 0.62, -2.5].forEach(a => { const bx = C[0] + Math.cos(a) * (PR + 34), by = C[1] + Math.sin(a) * (PR + 34); P.line(bx, by, C[0] + Math.cos(a) * (PR + 52), C[1] + Math.sin(a) * (PR + 52), { w: 4, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.circle(C[0] + Math.cos(a) * (PR + 56), C[1] + Math.sin(a) * (PR + 56), 6.4, { w: 1.1, c: INK, a: 0.95, passes: 1 }); P.circle(C[0] + Math.cos(a) * (PR + 56), C[1] + Math.sin(a) * (PR + 56), 3, { w: 0.6, c: INK, a: 0.85, passes: 1 }); });
    }
    // main plate: perlage (overlapping circular graining) dotted in a hex grid, under everything else
    { const pl = [], sp = 7.4; for (let row = 0, y = C[1] - PR; y < C[1] + PR; y += sp * 0.866, row++) for (let x = C[0] - PR + (row % 2) * sp / 2; x < C[0] + PR; x += sp) { if (Math.hypot(x - C[0], y - C[1]) < PR - 6) pl.push([x, y, 0.75]); } P.dots(pl, INK, 0.22); }
    P.circle(C[0], C[1], PR, { w: 2, c: INK, a: 0.98, passes: 2 }); P.circle(C[0], C[1], PR - 6, { w: 0.6, c: INK, a: 0.6, passes: 1 });
    // gong wire (coiled 1.6 turns inside the case) and two repeater hammers
    { const g1 = [], g2 = []; for (let a = -0.4; a < TAU * 1.55; a += 0.05) { const r = PR - 14 - a * 0.9; g1.push([C[0] + Math.cos(a - 0.9) * r, C[1] + Math.sin(a - 0.9) * r]); g2.push([C[0] + Math.cos(a - 0.9) * (r - 3.2), C[1] + Math.sin(a - 0.9) * (r - 3.2)]); } P.path(g1, { w: 1.3, c: INK, a: 0.95, rough: 0.3, passes: 1 }); P.path(g2, { w: 0.7, c: INK, a: 0.75, rough: 0.3, passes: 1 }); for (let k = 0; k < g1.length; k += 6) P.line(g1[k][0], g1[k][1], g2[k][0], g2[k][1], { w: 0.35, c: INK, a: 0.45, passes: 1, over: 0 }); const gp = g1[Math.floor(g1.length * 0.16)]; P.circle(gp[0], gp[1], 4.4, { w: 1, c: INK, passes: 1 }); screw(gp[0], gp[1], 3.6);
      [[2.55, 0], [2.2, 1]].forEach(([a, k]) => { const r = PR - 30, hx = C[0] + Math.cos(a) * r, hy = C[1] + Math.sin(a) * r; const tip = [C[0] + Math.cos(a - 0.1) * (PR - 12), C[1] + Math.sin(a - 0.1) * (PR - 12)]; P.line(hx, hy, tip[0], tip[1], { w: 3.4, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.circle(hx, hy, 6, { w: 1.1, c: INK, a: 0.95, passes: 1 }); screw(hx, hy, 3); P.circle(tip[0], tip[1], 2.4, { w: 0.8, c: INK, passes: 1 }); coilLine(hx + 6, hy + 4, hx + 20, hy - 6, 5, 3); void k; }); }

    /* ================= 2. going train: barrel with red mainspring, ratchet & click, centre / third / fourth wheels ================= */
    const B = [352, 404], CW = [474, 494], TW = [561, 421], FW = [636, 448], TB = [636, 558];
    { // --- barrel: toothed drum, open to show the spring, half covered by the barrel cover
      const bp = gearPts(B[0], B[1], 86, 80, 0.02, 0); P.erase(bp); P.path(bp, { closed: true, w: 1.3, c: INK, a: 0.97, rough: 0.2, passes: 1 });
      P.circle(B[0], B[1], 74, { w: 1.5, c: INK, a: 0.97, passes: 1 }); P.circle(B[0], B[1], 71, { w: 0.6, c: INK, a: 0.6, passes: 1 }); shade(ring(B[0], B[1], 74, 84, 32), B[0], B[1], 86);
      const inner = discPoly(B[0], B[1], 70, 32); P.wash(inner, '#ece6d4', 0.5, { edge: 0, jit: 0.2, steps: 1 });
      const sp1 = [], sp2 = [], turns = 8.4; for (let a = 0; a <= turns * TAU; a += 0.12) { const r = 22 + a * (46 / (turns * TAU)); sp1.push([B[0] + Math.cos(a + 0.6) * r, B[1] + Math.sin(a + 0.6) * r]); sp2.push([B[0] + Math.cos(a + 0.6) * (r + 3.2), B[1] + Math.sin(a + 0.6) * (r + 3.2)]); }
      P.path(sp1, { w: 1.6, c: RED, a: 0.95, rough: 0.2, passes: 1 }); P.path(sp2, { w: 0.6, c: INK, a: 0.7, rough: 0.2, passes: 1 });
      // barrel arbor with hook, and the spring's outer end hooked to the barrel wall
      P.circle(B[0], B[1], 17, { w: 1.4, c: INK, a: 0.95, passes: 1 }); P.circle(B[0], B[1], 11, { w: 0.9, c: INK, passes: 1 }); P.rect(B[0] - 3.6, B[1] - 3.6, 7.2, 7.2, { w: 0.9, c: INK, over: 0, passes: 1 }); P.dot(B[0], B[1], 1.6, { c: INK }); P.poly([[B[0] + 17, B[1] - 3], [B[0] + 24, B[1] - 4], [B[0] + 21, B[1] + 3]], { w: 0.9, c: INK, over: 0, passes: 1 });
      const ea = turns * TAU + 0.6; P.line(B[0] + Math.cos(ea) * 68, B[1] + Math.sin(ea) * 68, B[0] + Math.cos(ea) * 74, B[1] + Math.sin(ea) * 74, { w: 1.6, c: RED, passes: 1, over: 0 });
      // barrel cover (right half) with engraved text & screws
      const cov = [[B[0], B[1] - 72]]; for (let a = -Math.PI / 2; a <= Math.PI / 2; a += 0.08) cov.push([B[0] + Math.cos(a) * 72, B[1] + Math.sin(a) * 72]); cov.push([B[0], B[1] + 72]);
      P.erase(cov); P.wash(cov, '#ffffff', 0.55, { edge: 0, steps: 1 }); P.path(cov.concat([cov[0]]), { w: 1.4, c: INK, a: 0.95, rough: 0.25, passes: 1 }); P.hatch(cov, { ang: 78, gap: 2.4, a: 0.32, w: 0.4, c: INK, inset: 1 }); for (let q = 1; q <= 4; q++) { const rr = 72 - q * 12, arc = []; for (let a = -Math.PI / 2 + 0.05; a <= Math.PI / 2 - 0.05; a += 0.1) arc.push([B[0] + Math.cos(a) * rr, B[1] + Math.sin(a) * rr]); P.path(arc, { w: 0.4, c: INK, a: 0.4, rough: 0.2, passes: 1 }); }
      for (let i = 0; i < 4; i++) { const a = -1.1 + i * 0.73; screw(B[0] + Math.cos(a) * 62, B[1] + Math.sin(a) * 62, 3.6, a); } P.text('BARREL', B[0] + 40, B[1] + 8, { size: 7.4, c: INK, align: 'center', a: 0.85, rot: 0.1 });
      // ratchet wheel on the barrel arbor with click and click spring
      const rp = []; for (let i = 0; i < 36; i++) { const a = i * TAU / 36 - 0.4; rp.push([B[0] + Math.cos(a) * 36, B[1] + Math.sin(a) * 36], [B[0] + Math.cos(a + 0.17) * 30, B[1] + Math.sin(a + 0.17) * 30]); } P.erase(rp); P.path(rp, { closed: true, w: 1.1, c: INK, a: 0.95, rough: 0.2, passes: 1 }); P.circle(B[0], B[1], 24, { w: 0.8, c: INK, passes: 1 }); for (let i = 0; i < 5; i++) { const a = i * TAU / 5 + 0.4; P.line(B[0] + Math.cos(a) * 12, B[1] + Math.sin(a) * 12, B[0] + Math.cos(a) * 24, B[1] + Math.sin(a) * 24, { w: 1.6, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.15 }); } screw(B[0], B[1], 5, 0.3); shade(ring(B[0], B[1], 24, 30, 20), B[0], B[1], 36);
      const clk = [B[0] - 50, B[1] - 26]; P.poly([[clk[0], clk[1] - 4], [clk[0] + 22, clk[1] + 8], [clk[0] + 20, clk[1] + 13], [clk[0], clk[1] + 4]], { w: 1.1, c: INK, rough: 0.15, over: 0, passes: 1 }); P.circle(clk[0], clk[1], 4.4, { w: 1, c: INK, passes: 1 }); screw(clk[0], clk[1], 2.6); coilLine(clk[0] - 2, clk[1] - 6, clk[0] - 30, clk[1] - 22, 5, 3.4);
      jewel(B[0] + 24, B[1] + 58, 3.4);
    }
    { // --- centre wheel (minute hand) with cannon pinion; third wheel; fourth (seconds) wheel
      gear(CW[0], CW[1], 70, 64, 0.11, { spokes: 5, hub: 0.24, red: true }); pinion(CW[0], CW[1], 17, 12, 0.2); jewel(CW[0], CW[1], 3.6);
      gear(TW[0], TW[1], 44, 60, 0.06, { spokes: 4, hub: 0.26 }); pinion(TW[0], TW[1], 12, 10, 0.4); jewel(TW[0], TW[1], 3);
      gear(FW[0], FW[1], 36, 48, 0.02, { spokes: 4, hub: 0.28, red: true }); pinion(FW[0], FW[1], 9, 8, 0.1); jewel(FW[0], FW[1], 2.8);
      // pitch circles and centre lines where wheels mesh (drawing convention)
      [[B, CW, 86, 70], [CW, TW, 70, 44], [TW, FW, 44, 36]].forEach(([a, b, ra, rb]) => { P.dashed(a[0], a[1], b[0], b[1], [10, 3, 2, 3], { w: 0.5, c: RED, a: 0.85 }); P.circle(a[0], a[1], ra * 0.93, { w: 0.35, c: RED, a: 0.35, passes: 1, from: 0, to: 0.01 }); const mx = (a[0] * rb + b[0] * ra) / (ra + rb), my = (a[1] * rb + b[1] * ra) / (ra + rb); P.circle(mx, my, 2.6, { w: 0.6, c: RED, a: 0.95, passes: 1 }); });
    }

    /* ================= 3. the Swiss lever escapement (local coordinates, fork pivot at the origin) ================= */
    const rotp = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const bar = (a, b, w0, w1 = w0) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; return [[a[0] + nx * w0, a[1] + ny * w0], [b[0] + nx * w1, b[1] + ny * w1], [b[0] - nx * w1, b[1] - ny * w1], [a[0] - nx * w0, a[1] - ny * w0]]; };
    const steel = (poly, lw = 1.1, gap = 1.8) => { P.wash(poly, '#ffffff', 0, { edge: 0, steps: 1 }); P.erase(poly); P.poly(poly, { w: lw, c: INK, a: 0.97, rough: 0.15, over: 0, passes: 1 }); let cx = 0, cy = 0; poly.forEach(q => { cx += q[0]; cy += q[1]; }); cx /= poly.length; cy /= poly.length; P.hatch(poly, { ang: 50, gap, a: 0.5, w: 0.4, c: INK, fade: (x, y) => Math.max(0, Math.min(1, ((x - cx) + (y - cy)) / 20 + 0.45)), piece: 6, inset: 0.3 }); };
    const escapement = (phi, theta, psi, o = {}) => {
      const D = 72, Rw = 52, E = [0, D], pi = Math.PI, r0 = Rw * 0.66;
      // escape wheel: club-tooth profile, 15 teeth, six curved spokes, jewelled hub
      const wp = []; for (let k = 0; k < 15; k++) { const a = (psi + k * 24) * pi / 180; [[-0.10, r0], [-0.03, Rw * 0.97], [0.03, Rw], [0.075, Rw * 0.92], [0.17, r0], [0.29, r0]].forEach(([f, rr]) => wp.push([E[0] + Math.cos(a + f) * rr, E[1] + Math.sin(a + f) * rr])); }
      P.erase(wp); P.path(wp, { closed: true, w: 1.3, c: INK, a: 0.97, rough: 0.15, passes: 1 }); P.circle(E[0], E[1], r0 * 0.9, { w: 0.9, c: INK, a: 0.9, passes: 1 });
      for (let i = 0; i < 6; i++) { const a = (psi * pi / 180) + i * pi / 3, arm = bar([E[0] + Math.cos(a) * 9, E[1] + Math.sin(a) * 9], [E[0] + Math.cos(a + 0.1) * r0 * 0.9, E[1] + Math.sin(a + 0.1) * r0 * 0.9], 2.4, 3.2); P.poly(arm, { w: 0.85, c: INK, a: 0.9, rough: 0.15, over: 0, passes: 1 }); }
      P.circle(E[0], E[1], 9, { w: 1.1, c: INK, passes: 1 }); P.wash(discPoly(E[0], E[1], 5, 12), RUBY, 0.85, { edge: 0.4, jit: 0.1, steps: 1 }); P.circle(E[0], E[1], 5, { w: 0.8, c: RED, passes: 1 }); P.dot(E[0], E[1], 1.2, { c: INK });
      P.hatch(ring(E[0], E[1], r0 * 0.9, r0 * 0.99, 24), { ang: -50, gap: 1.6, a: 0.5, w: 0.4, c: INK, fade: (x, y) => Math.max(0, ((x - E[0]) + (y - E[1])) / 60 + 0.4), piece: 6 });
      // fork
      const sL = rotp(-30.6, 30, theta), sR = rotp(30.6, 30, theta), tail = rotp(0, -58, theta), guard = rotp(0, -46, theta);
      steel(bar([0, 0], sL, 5.4, 4.2)); steel(bar([0, 0], sR, 5.4, 4.2)); steel(bar([0, 0], tail, 4.8, 3.6));
      [-1, 1].forEach(q => { const a = rotp(q * 3.4, -56, theta), b = rotp(q * 3.6, -76, theta); steel(bar(a, b, 2.4, 1.8), 1, 1.4); });
      // pallet stones (rubies) and banking pins
      [[sL, -1], [sR, 1]].forEach(([q, sg]) => { const ang = Math.atan2(q[1], q[0]), st = bar([q[0] - Math.cos(ang) * 5, q[1] - Math.sin(ang) * 5], [q[0] + Math.cos(ang) * 6, q[1] + Math.sin(ang) * 6], 4.6, 4.6); P.wash(st, RUBY, 0.88, { edge: 0.5, jit: 0.1, steps: 2 }); P.poly(st, { w: 1, c: RED, a: 0.98, rough: 0.1, over: 0, passes: 1 }); P.line(st[0][0], st[0][1], st[1][0], st[1][1], { w: 0.5, c: '#fff', a: 0.9, passes: 1, over: 0 }); });
      [[-46, 34], [46, 34]].forEach(([x, y]) => { P.circle(x, y, 3.6, { w: 1.1, c: INK, passes: 1 }); P.dot(x, y, 1, { c: INK }); }); P.circle(guard[0], guard[1], 2.2, { w: 1, c: INK, passes: 1 }); P.dot(guard[0], guard[1], 0.9, { c: INK });
      P.circle(0, 0, 8.4, { w: 1.4, c: INK, passes: 1 }); P.circle(0, 0, 4.6, { w: 0.8, c: INK, passes: 1 }); P.dot(0, 0, 1.3, { c: INK }); P.dashed(-16, 0, 16, 0, [4, 2], { w: 0.4, c: INK, a: 0.7 }); P.dashed(0, -14, 0, 14, [4, 2], { w: 0.4, c: INK, a: 0.7 });
      // roller table, safety crescent, and the red impulse jewel
      const BC = [0, -84], dir = pi / 2 - phi, ip = [BC[0] + 14 * Math.cos(dir), BC[1] + 14 * Math.sin(dir)];
      P.circle(BC[0], BC[1], 24, { w: 1.4, c: INK, a: 0.97, passes: 1 }); P.circle(BC[0], BC[1], 21.6, { w: 0.5, c: INK, a: 0.55, passes: 1 }); shade(ring(BC[0], BC[1], 22, 24, 20), BC[0], BC[1], 24, { gap: 1.4 });
      P.arc(BC[0], BC[1], 12.4, 12.4, dir + 0.55, dir + TAU - 0.55, { w: 1.4, c: INK, a: 0.97, passes: 1 }); P.line(BC[0] + Math.cos(dir + 0.55) * 12.4, BC[1] + Math.sin(dir + 0.55) * 12.4, BC[0] + Math.cos(dir + 0.55) * 4.6, BC[1] + Math.sin(dir + 0.55) * 4.6, { w: 0.9, c: INK, passes: 1, over: 0 }); P.line(BC[0] + Math.cos(dir - 0.55 + TAU) * 12.4, BC[1] + Math.sin(dir - 0.55) * 12.4, BC[0] + Math.cos(dir - 0.55) * 4.6, BC[1] + Math.sin(dir - 0.55) * 4.6, { w: 0.9, c: INK, passes: 1, over: 0 });
      P.circle(BC[0], BC[1], 5.4, { w: 1, c: INK, passes: 1 }); P.dot(BC[0], BC[1], 1.4, { c: INK });
      P.wash(discPoly(ip[0], ip[1], 3.6, 12), RUBY, 0.95, { edge: 0.5, jit: 0.1, steps: 2 }); P.circle(ip[0], ip[1], 3.6, { w: 0.9, c: RED, a: 0.98, passes: 1 }); P.arc(ip[0], ip[1], 2.2, 2.2, 3.5, 4.6, { w: 0.5, c: '#fff', passes: 1 });
      return { E, BC, ip, sL, sR, tail };
    };

    /* ================= 4. the flying tourbillon at 3 o'clock: cage, balance with timing screws, red Breguet hairspring, escapement ================= */
    const hull = (centers, w, k = 14) => { const pts = []; centers.forEach(([cx, cy]) => { for (let i = 0; i < k; i++) { const a = i * TAU / k; pts.push([cx + Math.cos(a) * w, cy + Math.sin(a) * w]); } }); pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = []; pts.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }); pts.slice().reverse().forEach(q => { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }); lo.pop(); up.pop(); return lo.concat(up); };
    { const [tx, ty] = TB;
      const cp = gearPts(tx, ty, 76, 96, 0.02, 0); P.erase(cp); P.wash(cp, '#ffffff', 0.6, { edge: 0, steps: 1 }); P.path(cp, { closed: true, w: 1.3, c: INK, a: 0.97, rough: 0.15, passes: 1 });
      P.circle(tx, ty, 66, { w: 1.5, c: INK, a: 0.97, passes: 1 }); P.circle(tx, ty, 62, { w: 0.6, c: INK, a: 0.6, passes: 1 }); shade(ring(tx, ty, 62, 66, 40), tx, ty, 70, { gap: 1.5 }); P.wash(discPoly(tx, ty, 61, 30), '#f7f2e6', 0.55, { edge: 0, jit: 0.2, steps: 1 });
      // fixed fourth wheel under the cage, and the three cage arms
      const fw = gearPts(tx, ty, 20, 30, 0, 0); P.path(fw, { closed: true, w: 0.9, c: INK, a: 0.85, rough: 0.1, passes: 1 });
      [0.52, 2.62, 4.72].forEach(a => steel(bar([tx + Math.cos(a) * 10, ty + Math.sin(a) * 10], [tx + Math.cos(a) * 62, ty + Math.sin(a) * 62], 4, 3.4), 1, 1.6));
      // balance wheel (rim with timing screws), arms, staff
      const bc = [tx, ty - 17], br = 43; P.wash(ring(bc[0], bc[1], br - 5, br, 44), '#ffffff', 0.5, { edge: 0, steps: 1 }); P.circle(bc[0], bc[1], br, { w: 1.3, c: INK, a: 0.97, passes: 1 }); P.circle(bc[0], bc[1], br - 5, { w: 0.8, c: INK, a: 0.9, passes: 1 }); shade(ring(bc[0], bc[1], br - 5, br, 32), bc[0], bc[1], br, { gap: 1.4 });
      [0.3, 2.4, 4.5].forEach(a => steel(bar([bc[0] + Math.cos(a) * 6, bc[1] + Math.sin(a) * 6], [bc[0] + Math.cos(a) * (br - 5), bc[1] + Math.sin(a) * (br - 5)], 2, 1.6), 0.8, 1.4));
      for (let i = 0; i < 16; i++) { const a = i * TAU / 16 + 0.1, big = i % 4 === 0, rr = big ? 3.2 : 2.2, q = [bc[0] + Math.cos(a) * (br - 2.5), bc[1] + Math.sin(a) * (br - 2.5)]; P.circle(q[0], q[1], rr, { w: 0.8, c: INK, a: 0.95, passes: 1 }); P.dot(q[0], q[1], 0.7, { c: INK }); if (big) P.wash(discPoly(q[0], q[1], rr, 8), RED, 0.35, { edge: 0, steps: 1, jit: 0.1 }); }
      // Breguet overcoil hairspring in red, 11 turns
      { const hs = [], turns = 11; for (let a = 0; a <= turns * TAU; a += 0.16) { const r = 5 + a * (18 / (turns * TAU)); hs.push([bc[0] + Math.cos(a + 1) * r, bc[1] + Math.sin(a + 1) * r]); } P.path(hs, { w: 0.85, c: RED, a: 0.97, rough: 0.1, passes: 1 }); const oc = [hs[hs.length - 1], [bc[0] + 26, bc[1] - 26], [bc[0] + 34, bc[1] - 14]]; P.curve(oc, { w: 0.85, c: RED, a: 0.97, rough: 0.1, passes: 1 }); P.circle(bc[0] + 34, bc[1] - 14, 2, { w: 0.7, c: RED, passes: 1 }); }
      P.circle(bc[0], bc[1], 3.8, { w: 1, c: INK, passes: 1 }); P.dot(bc[0], bc[1], 1.1, { c: INK });
      // escapement drawn small, in its own transform
      P.xf(0.3, 0, 0, tx, ty + 12); escapement(0.0, 0.0, 24); P.xfEnd();
      // rotation arrow and label
      P.arc(tx, ty, 86, 86, -0.9, 0.5, { w: 0.9, c: RED, a: 0.95, passes: 1 }); P.line(tx + Math.cos(0.5) * 86, ty + Math.sin(0.5) * 86, tx + Math.cos(0.5 - 0.09) * 92, ty + Math.sin(0.5 - 0.09) * 92, { w: 0.9, c: RED, passes: 1, over: 0 }); P.line(tx + Math.cos(0.5) * 86, ty + Math.sin(0.5) * 86, tx + Math.cos(0.5 - 0.1) * 80, ty + Math.sin(0.5 - 0.1) * 80, { w: 0.9, c: RED, passes: 1, over: 0 });
      // driving pinion of the fourth wheel meshes the cage rim; pallet-bridge and screws
      P.dashed(FW[0], FW[1], tx, ty, [10, 3, 2, 3], { w: 0.5, c: RED, a: 0.85 });
    }
    // ---- bridges: erased hull, bevel, Cotes de Geneve stripes, jewels, screws ----
    const bridge = (centers, w, o = {}) => { const h = hull(centers, w), h2 = hull(centers, w - 3.6); P.erase(h); P.wash(h, '#ffffff', 0.6, { edge: 0, steps: 1 }); P.path(h.concat([h[0]]), { w: 1.6, c: INK, a: 0.98, rough: 0.2, passes: 1 }); P.path(h2.concat([h2[0]]), { w: 0.6, c: INK, a: 0.65, rough: 0.2, passes: 1 }); P.hatch(h2, { ang: o.ang ?? 30, gap: 2.6, a: 0.34, w: 0.4, c: INK, inset: 0.6 }); shade(ring(centers[0][0], centers[0][1], w - 3.6, w, 1), centers[0][0], centers[0][1], 1); (o.screws || []).forEach(([x, y, r]) => screw(x, y, r || 3.8)); centers.forEach(([x, y]) => jewel(x, y, 3.4)); if (o.text) P.text(o.text, o.tx, o.ty, { size: 6.6, c: INK, a: 0.85, rot: o.rot || 0, align: 'center' }); return h; };
    bridge([CW, TW, FW], 15, { ang: 24, screws: [[(CW[0] + TW[0]) / 2 - 5, (CW[1] + TW[1]) / 2 + 12], [TW[0] + 14, TW[1] - 20], [FW[0] + 16, FW[1] + 12]], text: 'TRAIN BRIDGE', tx: (CW[0] + TW[0]) / 2 + 6, ty: (CW[1] + TW[1]) / 2 - 2, rot: -0.75 });
    bridge([[TB[0] + 92, TB[1] - 30], [TB[0] + 92, TB[1] + 44]], 13, { ang: 80, screws: [[TB[0] + 92, TB[1] + 7, 3.4]] });

    /* ================= 5. perpetual calendar at 12 o'clock: 48-step programme cam, month star, date star, moon-phase disc ================= */
    { const PC = [474, 222];
      // programme cam: stepped, 48 steps, one deeper for leap February (red)
      const ml = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], cam = [], leapK = 37; for (let k = 0; k < 48; k++) { const len = k === leapK ? 29 : ml[k % 12], r = 20 + (len - 24) * 4.6, a0 = -Math.PI / 2 + k * TAU / 48, a1 = a0 + TAU / 48; cam.push([PC[0] + Math.cos(a0) * r, PC[1] + Math.sin(a0) * r], [PC[0] + Math.cos(a1) * r, PC[1] + Math.sin(a1) * r]); }
      P.erase(cam); P.wash(cam, '#ffffff', 0.5, { edge: 0, steps: 1 }); P.pl(cam, { closed: true, w: 1.1, c: INK, a: 0.97, rough: 0.12, over: 0, passes: 1 }); P.circle(PC[0], PC[1], 17, { w: 0.9, c: INK, a: 0.9, passes: 1 }); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.3; P.line(PC[0] + Math.cos(a) * 17, PC[1] + Math.sin(a) * 17, PC[0] + Math.cos(a) * 34, PC[1] + Math.sin(a) * 34, { w: 0.6, c: INK, a: 0.7, passes: 1, over: 0, rough: 0.15 }); } shade(cam, PC[0], PC[1], 56, { gap: 1.8 }); screw(PC[0], PC[1], 6, 0.5); jewel(PC[0], PC[1] - 0.01, 2.2);
      { const a0 = -Math.PI / 2 + leapK * TAU / 48, a1 = a0 + TAU / 48; P.wash([[PC[0] + Math.cos(a0) * 24, PC[1] + Math.sin(a0) * 24], [PC[0] + Math.cos(a0) * 43, PC[1] + Math.sin(a0) * 43], [PC[0] + Math.cos(a1) * 43, PC[1] + Math.sin(a1) * 43], [PC[0] + Math.cos(a1) * 24, PC[1] + Math.sin(a1) * 24]], RED, 0.6, { edge: 0.6, jit: 0.15, steps: 2 }); P.line(PC[0] + Math.cos((a0 + a1) / 2) * 46, PC[1] + Math.sin((a0 + a1) / 2) * 46, PC[0] + 96, PC[1] + 104, { w: 0.6, c: RED, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.text('LEAP FEB', PC[0] + 98, PC[1] + 112, { size: 7.2, c: RED, a: 0.95 }); }
      // feeler lever riding the cam with its spring, pivoting on a screw
      const fp = [PC[0] - 92, PC[1] + 8]; P.poly(bar(fp, [PC[0] - 22, PC[1] - 34], 3.4, 2.4), { w: 1.1, c: INK, a: 0.95, rough: 0.12, over: 0, passes: 1 }); P.circle(fp[0], fp[1], 6.4, { w: 1.1, c: INK, passes: 1 }); screw(fp[0], fp[1], 3.2); P.circle(PC[0] - 22, PC[1] - 34, 2.4, { w: 0.9, c: RED, passes: 1 }); coilLine(fp[0] - 4, fp[1] + 6, fp[0] - 30, fp[1] + 28, 5, 3.4);
      // month star wheel, 12 teeth, with jumper
      const MS = [566, 258]; const msp = []; for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + 0.2; msp.push([MS[0] + Math.cos(a - 0.11) * 22, MS[1] + Math.sin(a - 0.11) * 22], [MS[0] + Math.cos(a) * 31, MS[1] + Math.sin(a) * 31], [MS[0] + Math.cos(a + 0.11) * 22, MS[1] + Math.sin(a + 0.11) * 22]); } P.erase(msp); P.path(msp, { closed: true, w: 1.1, c: INK, a: 0.95, rough: 0.12, passes: 1 }); P.circle(MS[0], MS[1], 14, { w: 0.9, c: INK, passes: 1 }); screw(MS[0], MS[1], 4.4); shade(ring(MS[0], MS[1], 16, 24, 16), MS[0], MS[1], 30); P.poly(bar([MS[0] + 44, MS[1] - 28], [MS[0] + 26, MS[1] + 2], 2.6, 1.6), { w: 1, c: INK, rough: 0.12, over: 0, passes: 1 }); P.circle(MS[0] + 44, MS[1] - 28, 4, { w: 0.9, c: INK, passes: 1 }); screw(MS[0] + 44, MS[1] - 28, 2.4); P.text('MONTH STAR', MS[0] + 46, MS[1] + 34, { size: 6.8, c: INK, align: 'center', a: 0.85 });
      // date star (31 teeth) and its jumper
      const DS = [386, 258]; const ds = gearPts(DS[0], DS[1], 40, 31, 0.1, 1); P.erase(ds); P.path(ds, { closed: true, w: 1, c: INK, a: 0.95, rough: 0.1, passes: 1 }); P.circle(DS[0], DS[1], 30, { w: 0.8, c: INK, a: 0.85, passes: 1 }); for (let i = 0; i < 5; i++) { const a = i * TAU / 5; P.poly(bar([DS[0] + Math.cos(a) * 9, DS[1] + Math.sin(a) * 9], [DS[0] + Math.cos(a) * 30, DS[1] + Math.sin(a) * 30], 2.2, 3), { w: 0.8, c: INK, a: 0.9, rough: 0.1, over: 0, passes: 1 }); } P.circle(DS[0], DS[1], 9, { w: 1, c: INK, passes: 1 }); jewel(DS[0], DS[1], 3); shade(ring(DS[0], DS[1], 30, 38, 24), DS[0], DS[1], 40, { gap: 1.6 }); for (let i = 1; i <= 31; i += 5) { const a = 0.1 + i * TAU / 31; P.text(String(i), DS[0] + Math.cos(a) * 33.6, DS[1] + Math.sin(a) * 33.6 + 2, { size: 4.6, c: INK, align: 'center', a: 0.85, rot: a + Math.PI / 2 }); } P.text('DATE STAR', DS[0], DS[1] + 56, { size: 6.8, c: INK, align: 'center', a: 0.85 });
      // moon-phase disc (two moons) with the 59-tooth rim; day-of-week star wheel
      const MP = [486, 330]; const mpp = gearPts(MP[0], MP[1], 40, 59, 0, 1); P.erase(mpp); P.wash(mpp, '#ffffff', 0.5, { edge: 0, steps: 1 }); P.path(mpp, { closed: true, w: 1, c: INK, a: 0.95, rough: 0.1, passes: 1 }); P.circle(MP[0], MP[1], 32, { w: 0.7, c: INK, a: 0.8, passes: 1 }); P.hatch(discPoly(MP[0], MP[1], 31, 24), { ang: 8, gap: 2.4, a: 0.42, w: 0.4, c: INK, fade: () => 0.85, piece: 10 });
      [0, Math.PI].forEach(a0 => { const mx = MP[0] + Math.cos(a0 + 1.2) * 18, my = MP[1] + Math.sin(a0 + 1.2) * 18; P.erase(discPoly(mx, my, 8.6, 14)); P.circle(mx, my, 8.4, { w: 1.1, c: INK, a: 0.97, passes: 1 }); P.wash(discPoly(mx, my, 8, 14), '#ffffff', 0.6, { edge: 0, steps: 1 }); P.dot(mx - 2.6, my - 1.6, 0.8, { c: INK }); P.dot(mx + 2.6, my - 1.6, 0.8, { c: INK }); P.arc(mx, my + 1, 4, 3.4, 0.4, 2.7, { w: 0.7, c: INK, passes: 1 }); P.dot(mx, my + 0.8, 0.6, { c: INK }); P.hatch(discPoly(mx, my, 8, 12), { ang: -50, gap: 1.5, a: 0.4, w: 0.35, c: INK, fade: x => Math.max(0, (x - mx + 4) / 12), piece: 4 }); }); P.circle(MP[0], MP[1], 6, { w: 0.9, c: INK, passes: 1 }); jewel(MP[0], MP[1], 2.2);
      // moon-phase window arc above (dial aperture, shown dashed) and label
      P.arc(MP[0], MP[1], 46, 46, -2.6, -0.5, { w: 0.6, c: RED, a: 0.9, passes: 1 }); P.text('MOON WINDOW', MP[0] - 76, MP[1] - 36, { size: 6.8, c: RED, align: 'center', a: 0.95 });
      // day / date / month / leap-year jumper springs and the driving "date finger" from the twenty-four hour wheel
      P.dashed(CW[0], CW[1] - 70, PC[0] - 8, PC[1] + 60, [8, 3, 2, 3], { w: 0.5, c: RED, a: 0.85 }); P.text('24 H WHEEL', CW[0] + 4, CW[1] - 76, { size: 6.8, c: RED, a: 0.95 });
      P.rect(PC[0] + 76, PC[1] - 4, 44, 12, { w: 0.9, c: INK, rough: 0.15, over: 0, passes: 1 }); for (let k = 0; k < 4; k++) P.line(PC[0] + 84 + k * 9, PC[1] - 4, PC[0] + 84 + k * 9, PC[1] + 8, { w: 0.4, c: INK, a: 0.7, passes: 1, over: 0 }); P.text('DAY LEVER', PC[0] + 96, PC[1] - 8, { size: 6.4, c: INK, align: 'center', a: 0.85 });
    }

    /* ================= 6. minute repeater at 6 o'clock: hour snail, rack, governor, hammers; winding works at 3 ================= */
    { const SN = [474, 704];
      // hour snail: 12 stepped arcs of falling radius
      const sn = []; for (let k = 0; k < 12; k++) { const r = 62 - k * 2.5, a0 = -Math.PI / 2 + k * TAU / 12, a1 = a0 + TAU / 12; for (let q = 0; q <= 3; q++) { const a = lerp(a0, a1, q / 3); sn.push([SN[0] + Math.cos(a) * r, SN[1] + Math.sin(a) * r]); } }
      P.erase(sn); P.wash(sn, '#ffffff', 0.5, { edge: 0, steps: 1 }); P.pl(sn, { closed: true, w: 1.1, c: INK, a: 0.97, rough: 0.12, over: 0, passes: 1 }); shade(sn, SN[0], SN[1], 62, { gap: 1.8 }); P.circle(SN[0], SN[1], 15, { w: 1, c: INK, passes: 1 }); screw(SN[0], SN[1], 6, 0.9); jewel(SN[0], SN[1], 2.2); for (let k = 0; k < 12; k++) { const a = -Math.PI / 2 + (k + 0.5) * TAU / 12, r = 45; P.text(String(k + 1), SN[0] + Math.cos(a) * r, SN[1] + Math.sin(a) * r + 2, { size: 6, c: INK, align: 'center', a: 0.9 }); }
      // rack with 12 teeth arc, feeler tip riding the snail, rack spring, pivot on a screw
      const RP = [560, 776]; const rack = []; for (let i = 0; i <= 16; i++) { const a = 3.4 + i * 0.06; rack.push([RP[0] + Math.cos(a) * 66, RP[1] + Math.sin(a) * 66]); } for (let i = 16; i >= 0; i--) { const a = 3.4 + i * 0.06; const r = 56; rack.push([RP[0] + Math.cos(a) * r, RP[1] + Math.sin(a) * r]); } P.erase(rack); P.path(rack.concat([rack[0]]), { w: 1.2, c: INK, a: 0.97, rough: 0.1, passes: 1 }); for (let i = 0; i <= 16; i++) { const a = 3.4 + i * 0.06; P.line(RP[0] + Math.cos(a) * 66, RP[1] + Math.sin(a) * 66, RP[0] + Math.cos(a) * 71, RP[1] + Math.sin(a) * 71, { w: 1.1, c: INK, a: 0.95, passes: 1, over: 0, rough: 0.1 }); } const tip = [RP[0] + Math.cos(4.7) * 50 - 34, RP[1] - 62]; P.poly(bar(RP, [SN[0] + 30, SN[1] + 50], 4, 2.4), { w: 1.1, c: INK, a: 0.97, rough: 0.12, over: 0, passes: 1 }); void tip; P.circle(SN[0] + 30, SN[1] + 50, 2.6, { w: 1, c: RED, a: 0.98, passes: 1 }); P.wash(discPoly(SN[0] + 30, SN[1] + 50, 2.6, 8), RED, 0.8, { edge: 0, steps: 1, jit: 0.1 }); P.circle(RP[0], RP[1], 8, { w: 1.2, c: INK, passes: 1 }); screw(RP[0], RP[1], 4.4, 0.4); coilLine(RP[0] + 6, RP[1] + 6, RP[0] + 40, RP[1] + 28, 6, 3.6); P.text('RACK', RP[0] + 30, RP[1] - 44, { size: 7, c: INK, a: 0.9 }); P.text('HOUR SNAIL', SN[0], SN[1] + 82, { size: 7, c: INK, align: 'center', a: 0.9 });
      // gathering pallet & governor (centrifugal fly with two red pallets) and its worm wheel
      const G = [340, 664]; const wp = gearPts(G[0], G[1], 22, 24, 0.1, 0); P.erase(wp); P.path(wp, { closed: true, w: 1, c: INK, a: 0.95, rough: 0.1, passes: 1 }); P.circle(G[0], G[1], 14, { w: 0.8, c: INK, passes: 1 }); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; P.line(G[0] + Math.cos(a) * 5, G[1] + Math.sin(a) * 5, G[0] + Math.cos(a) * 14, G[1] + Math.sin(a) * 14, { w: 1.4, c: INK, passes: 1, over: 0 }); } jewel(G[0], G[1], 2.4); shade(ring(G[0], G[1], 14, 20, 16), G[0], G[1], 22, { gap: 1.5 });
      const G2 = [G[0] - 44, G[1] + 46]; P.poly(bar([G2[0] - 26, G2[1] - 14], [G2[0] + 26, G2[1] + 14], 3.4, 3.4), { w: 1.1, c: INK, a: 0.97, rough: 0.12, over: 0, passes: 1 }); [[-26, -14], [26, 14]].forEach(([dx, dy]) => { P.wash(bar([G2[0] + dx - 3, G2[1] + dy - 2], [G2[0] + dx + 4, G2[1] + dy + 3], 4.4, 4.4), RUBY, 0.9, { edge: 0.5, jit: 0.1, steps: 1 }); }); P.circle(G2[0], G2[1], 5, { w: 1, c: INK, passes: 1 }); jewel(G2[0], G2[1], 2.4); P.line(G[0] - 12, G[1] + 16, G2[0] + 4, G2[1] - 8, { w: 0.6, c: INK, a: 0.8, passes: 1, over: 0 }); coilLine(G2[0], G2[1], G2[0] - 30, G2[1] + 22, 4, 3); P.text('GOVERNOR', G2[0] + 24, G2[1] + 34, { size: 7, c: INK, align: 'center', a: 0.9 }); P.text('(CONTROLS STRIKE SPEED)', G2[0] + 24, G2[1] + 44, { size: 5.6, c: INK, align: 'center', a: 0.8 });
      // strike train wheels and the lever to the gong hammers (dashed under the bridge)
      const SW = [420, 780]; gear(SW[0], SW[1], 30, 36, 0.03, { spokes: 4, hub: 0.26 }); jewel(SW[0], SW[1], 2.6); const SW2 = [352, 730]; gear(SW2[0], SW2[1], 24, 28, 0.08, { spokes: 4, hub: 0.3 }); jewel(SW2[0], SW2[1], 2.2);
      bridge([SW, SW2, G], 11, { ang: 60, screws: [[(SW[0] + SW2[0]) / 2, (SW[1] + SW2[1]) / 2 + 8, 3.4]] });
      P.dashed(RP[0] - 60, RP[1] - 6, 220, 640, [10, 3, 2, 3], { w: 0.5, c: RED, a: 0.85 }); P.text('TO HAMMERS', 226, 656, { size: 6.4, c: RED, a: 0.95 });
      // slide with pushpiece: a long lever from the 10 o'clock pusher along the plate edge
      P.poly(bar([132, 262], [190, 340], 4.4, 3.4), { w: 1.1, c: INK, rough: 0.12, over: 0, passes: 1 }); screw(190, 340, 3.6); P.text('SLIDE', 138, 250, { size: 6.4, c: INK, a: 0.85 });
    }
    { // winding works at 3 o'clock: stem, clutch, crown wheel
      P.line(C[0] + PR, C[1], 760, C[1], { w: 6, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 }); P.line(C[0] + PR, C[1] - 2, 760, C[1] - 2, { w: 0.5, c: '#fff', a: 0.7, passes: 1, over: 0 }); for (let x = 770; x < 810; x += 6) P.line(x, C[1] - 4, x + 3, C[1] + 4, { w: 0.5, c: INK, a: 0.6, passes: 1, over: 0 });
      gear(742, C[1], 20, 16, 0.05, { spokes: 3, hub: 0.3 }); const CRW = [750, 432]; gear(CRW[0], CRW[1], 26, 24, 0.1, { spokes: 4, hub: 0.3 }); jewel(CRW[0], CRW[1], 2.4); P.text('CROWN WHEEL', CRW[0] + 4, CRW[1] - 32, { size: 6.4, c: INK, align: 'center', a: 0.9 }); P.text('CLUTCH', 742, C[1] + 34, { size: 6.4, c: INK, align: 'center', a: 0.9 });
      P.dashed(CRW[0] - 26, CRW[1], 470, 462, [8, 3, 2, 3], { w: 0.5, c: RED, a: 0.85 }); P.text('WINDING TRAIN TO RATCHET', 640, 384, { size: 6.4, c: RED, a: 0.95 });
      const yl = [C[0] + 400, C[1] - 44]; void yl;
    }

    /* ================= 7. more of the works: main bridge, power-reserve differential, correctors, hammers, engraved rim text ================= */
    { // main bridge with engraved name, three jewels, blued screws
      const mb = bridge([[196, 508], [268, 556], [330, 520]], 22, { ang: -35, screws: [[230, 532, 4], [300, 546, 4]] }); void mb;
      P.text('GRANDE', 254, 522, { size: 9, c: INK, align: 'center', a: 0.9, rot: 0.42 }); P.text('COMPLICATION', 262, 542, { size: 6.4, c: INK, align: 'center', a: 0.85, rot: 0.42 });
      // power-reserve differential: sun gear with two planets in a carrier, and a 48-tooth sector
      const PD = [208, 640]; gear(PD[0], PD[1], 34, 40, 0.06, { spokes: 5, hub: 0.24 }); [[Math.cos(0.5) * 34, Math.sin(0.5) * 34], [Math.cos(0.5 + Math.PI) * 34, Math.sin(0.5 + Math.PI) * 34]].forEach(([dx, dy]) => { gear(PD[0] + dx, PD[1] + dy, 12, 14, 0.2, { spokes: 3, hub: 0.3, shade: false }); jewel(PD[0] + dx, PD[1] + dy, 1.8); }); P.poly(bar([PD[0] + Math.cos(0.5) * 34, PD[1] + Math.sin(0.5) * 34], [PD[0] - Math.cos(0.5) * 34, PD[1] - Math.sin(0.5) * 34], 3, 3), { w: 0.9, c: INK, a: 0.9, rough: 0.12, over: 0, passes: 1 }); jewel(PD[0], PD[1], 2.6);
      const sec = []; for (let i = 0; i <= 26; i++) { const a = 1.05 + i * 0.05; sec.push([PD[0] + Math.cos(a) * 60, PD[1] + Math.sin(a) * 60]); } for (let i = 26; i >= 0; i--) { const a = 1.05 + i * 0.05; sec.push([PD[0] + Math.cos(a) * 50, PD[1] + Math.sin(a) * 50]); } P.path(sec.concat([sec[0]]), { w: 1, c: INK, a: 0.95, rough: 0.1, passes: 1 }); for (let i = 0; i <= 26; i++) { const a = 1.05 + i * 0.05; P.line(PD[0] + Math.cos(a) * 60, PD[1] + Math.sin(a) * 60, PD[0] + Math.cos(a) * 64, PD[1] + Math.sin(a) * 64, { w: 0.9, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.1 }); } P.wash(sec, RED, 0.28, { edge: 0, steps: 1, jit: 0.1 }); P.text('POWER RESERVE', PD[0] - 8, PD[1] - 52, { size: 6.4, c: INK, align: 'center', a: 0.9 }); P.text('DIFFERENTIAL', PD[0] - 8, PD[1] + 84, { size: 6.4, c: INK, align: 'center', a: 0.9 });
      // correctors: pusher levers to month star and to the moon disc, with return springs
      [[779, 285, 640, 262, 'CORRECTOR: MONTH'], [790, 704, 604, 730, 'CORRECTOR: MOON']].forEach(([x1, y1, x2, y2, lb]) => { P.poly(bar([x1, y1], [x2, y2], 3.6, 2.6), { w: 1, c: INK, a: 0.95, rough: 0.12, over: 0, passes: 1 }); P.circle(x1, y1, 6, { w: 1, c: INK, passes: 1 }); screw(x1, y1, 3.2); P.circle(x2, y2, 3.4, { w: 0.9, c: RED, passes: 1 }); coilLine(x1 - 6, y1 + (y1 > 500 ? -8 : 8), x1 - 34, y1 + (y1 > 500 ? -30 : 30), 5, 3.2); P.text(lb, (x1 + x2) / 2, (y1 + y2) / 2 + (y1 > 500 ? 14 : -10), { size: 6, c: INK, align: 'center', a: 0.85, rot: Math.atan2(y2 - y1, x2 - x1) }); });
      // big repeater hammers: levers with heads striking the gong, wound springs and tail cams
      [[Math.cos(2.42) * 330 + C[0], Math.sin(2.42) * 330 + C[1]], [Math.cos(2.12) * 330 + C[0], Math.sin(2.12) * 330 + C[1]]].forEach(([hx, hy], i) => { const tipx = hx - Math.sin(2.4 - i * 0.2) * 24, tipy = hy + 26; P.poly(bar([hx + 24, hy - 22], [hx - 12, hy + 14], 3, 2), { w: 1, c: INK, a: 0.95, rough: 0.12, over: 0, passes: 1 }); P.circle(hx - 12, hy + 14, 6, { w: 1.1, c: INK, a: 0.97, passes: 1 }); P.wash(discPoly(hx - 12, hy + 14, 6, 10), '#ffffff', 0.7, { edge: 0, steps: 1 }); screw(hx + 24, hy - 22, 3.6); P.circle(hx + 24, hy - 22, 8, { w: 0.9, c: INK, passes: 1 }); void tipx; void tipy; });
      // ring of engraved text along the plate edge, letter by letter
      const label = 'GRANDE COMPLICATION  -  TOURBILLON  -  QUANTIEME PERPETUEL  -  REPETITION MINUTES  -  17 RUBIS  -  612 PIECES  -  ', r = PR - 24; for (let i = 0; i < label.length; i++) { const a = -Math.PI / 2 + 0.15 + i * (TAU / label.length) * 0.94 - 0.0; P.text(label[i], C[0] + Math.cos(a) * r, C[1] + Math.sin(a) * r, { size: 8.4, c: INK, align: 'center', a: 0.85, rot: a + Math.PI / 2 }); }
    }

    /* ================= 8. FOUR STAGES of the escapement, magnified ================= */
    const wplate = (x0, y0, w, h, title, sub) => { P.rect(x0, y0, w, h, { w: 1.3, c: INK, a: 0.95, rough: 0.3, over: 1, passes: 1 }); P.rect(x0 + 4, y0 + 4, w - 8, h - 8, { w: 0.4, c: INK, a: 0.5, rough: 0.3, over: 0, passes: 1 }); P.text(title, x0 + 14, y0 + 20, { size: 13, c: INK, font: S.HAND, a: 0.97 }); if (sub) P.text(sub, x0 + 14, y0 + 35, { size: 8, c: MID, a: 0.95 }); };
    const stages = [
      { t: 'I.  LOCK', sub: 'A TOOTH RESTS ON THE ENTRY PALLET', phi: -1.05, th: -0.09, psi: 18.0 },
      { t: 'II.  UNLOCKING', sub: 'IMPULSE JEWEL ENTERS THE FORK SLOT', phi: -0.47, th: -0.09, psi: 18.4 },
      { t: 'III.  IMPULSE', sub: 'FORK FLIPS, WHEEL PUSHES THE PALLET', phi: 0.0, th: 0.0, psi: 24.0 },
      { t: 'IV.  DROP', sub: 'TOOTH ESCAPES, EXIT PALLET LOCKS', phi: 0.47, th: 0.09, psi: 30.0 },
    ];
    P.text('THE SWISS LEVER ESCAPEMENT, MAGNIFIED 22 X', 908, 54, { size: 12, c: INK, font: S.HAND, a: 0.97 });
    stages.forEach((st, i) => {
      const x0 = 908 + (i % 2) * 330, y0 = 64 + Math.floor(i / 2) * 286, ox = x0 + 156, oy = y0 + 142, K9 = 0.9;
      wplate(x0, y0, 312, 278, st.t, st.sub);
      P.xf(K9, 0, 0, ox, oy); const g = escapement(st.phi, st.th, st.psi); P.xfEnd();
      // balance (above), shown as a dashed rim with three arms
      P.dashed(ox + Math.cos(-2.3) * 66, oy - 84 + Math.sin(-2.3) * 66, ox + Math.cos(-0.85) * 66, oy - 84 + Math.sin(-0.85) * 66, [4, 3], { w: 0.5, c: INK, a: 0.6 }); P.arc(ox, oy - 84, 66, 66, -2.9, -0.25, { w: 0.5, c: INK, a: 0.5, passes: 1 }); P.text('BALANCE', ox + 60, oy - 134, { size: 6.4, c: MID, a: 0.9 });
      // fork angle marker: tick arc around the pivot and a red arrow showing the swing
      P.arcTicks(ox, oy, 96, -Math.PI / 2 - 0.16, -Math.PI / 2 + 0.16, 0.02, 4, { len: 4, c: INK, a: 0.75 }); const ta = -Math.PI / 2 + st.th; P.line(ox, oy, ox + Math.cos(ta) * 102, oy + Math.sin(ta) * 102, { w: 0.7, c: RED, a: 0.9, passes: 1, over: 0 }); P.text(`FORK ${(st.th * 57.3).toFixed(1)} DEG`, ox + 62, oy - 82 + 0, { size: 6.6, c: RED, a: 0.95 });
      // arrows: wheel drive (torque), balance motion
      const dirs = [-1, 1, 1, 1][i]; P.arc(ox, oy + 72, 64, 64, 0.6, 1.2, { w: 0.7, c: RED, a: 0.9, passes: 1 }); P.line(ox + Math.cos(1.2) * 64, oy + 72 + Math.sin(1.2) * 64, ox + Math.cos(1.09) * 68, oy + 72 + Math.sin(1.09) * 68, { w: 0.7, c: RED, passes: 1, over: 0 }); P.line(ox + Math.cos(1.2) * 64, oy + 72 + Math.sin(1.2) * 64, ox + Math.cos(1.09) * 60, oy + 72 + Math.sin(1.09) * 60, { w: 0.7, c: RED, passes: 1, over: 0 }); void dirs;
      // callouts on the parts
      if (i === 0) { P.note('ENTRY PALLET', x0 + 6, y0 + 258, ox - 34, oy + 34, { size: 8, c: INK }); P.note('EXIT PALLET', x0 + 210, y0 + 262, ox + 34, oy + 36, { size: 8, c: INK }); P.note('IMPULSE JEWEL', x0 + 200, y0 + 78, g.ip[0] + ox + 2, g.ip[1] + oy + 1, { size: 8, c: INK }); P.note('ROLLER TABLE', x0 + 190, y0 + 52, ox + 20, oy - 100, { size: 8, c: INK }); P.note('ESCAPE WHEEL', x0 + 34, y0 + 218, ox - 46, oy + 100, { size: 8, c: INK }); }
      if (i === 1) { P.note('FORK HORNS', x0 + 196, y0 + 64, ox + 6, oy - 66, { size: 8, c: INK }); P.note('GUARD PIN', x0 + 36, y0 + 96, ox - 4, oy - 46, { size: 8, c: INK }); P.note('BANKING PIN', x0 + 6, y0 + 232, ox - 46, oy + 34, { size: 8, c: INK }); }
      if (i === 2) { P.note('FORK IN MID-SWING', x0 + 190, y0 + 92, ox + 4, oy - 40, { size: 8, c: INK }); P.note('WHEEL ADVANCES 6 DEG', x0 + 26, y0 + 238, ox - 20, oy + 120, { size: 8, c: INK }); }
      if (i === 3) { P.note('EXIT PALLET LOCKED', x0 + 172, y0 + 244, ox + 32, oy + 38, { size: 8, c: INK }); P.note('THE "TICK"', x0 + 220, y0 + 98, ox + 8, oy - 70, { size: 8, c: INK }); }
      // beat counter and ticks
      P.text(`BEAT ${i + 1} / 4`, x0 + 246, y0 + 270, { size: 6.4, c: MID, align: 'right', a: 0.9 });
    });
    /*__SECTIONS__*/








  }
});
