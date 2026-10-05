/* SHEET 13 — "The Rotunda of Instruments": a circular library-observatory drawn as an architect's cutaway in true 3D.
   Three-quarter view from above; a stepped wedge is sawn out of the drum so that the floor slabs, the cantilevered
   stone flights hugging the wall, the lift core and the glazed observatory lantern all read in section.
   Everything is hidden-surface sorted storey by storey (lowest first) and shaded with layered engraving + sepia washes. */
(window.SCENES = window.SCENES || []).push({
  name: 'Rotunda (cutaway)', seed: 171, ink: '#3b2616', theme: 'sepia',
  build(P, n, t) {
    const S = Sketch, D = S.D3, V = S.V3, TAU = S.TAU, lerp = S.lerp, DG = Math.PI / 180;
    const INK = '#3b2616', PAPER = '#ffffff';
    const WL = '#e4bd88', WM = '#cf9258', WD = '#a96b3d', WX = '#7d4a2a', CUT = '#bf7f47', EARTH = '#a8804f';
    const L = V.norm([-0.62, -0.4, 0.68]), AMB = 0.16;
    const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), T = x => clamp(x, 0, 0.96);

    /* ---------------- camera ---------------- */
    const PHE = -104 * DG, PIT = 27 * DG, DIST = 84, TG = [0, 0, 6.5];
    const EYE = [TG[0] + DIST * Math.cos(PHE) * Math.cos(PIT), TG[1] + DIST * Math.sin(PHE) * Math.cos(PIT), TG[2] + DIST * Math.sin(PIT)];
    const cam = D.camera({ eye: EYE, target: TG, f: 2240, cx: 770, cy: 488 });
    const pr = p => cam.project(p);

    /* ---------------- geometry helpers ---------------- */
    const pol = (r, a, z) => [Math.cos(a) * r, Math.sin(a) * r, z];
    const cen = v => { const c = [0, 0, 0]; v.forEach(p => { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }); return [c[0] / v.length, c[1] / v.length, c[2] / v.length]; };
    const facing = (nn, c) => V.dot(nn, V.sub(EYE, c)) > 0.001;
    const darkOf = nn => 1 - (AMB + (1 - AMB) * Math.max(0, V.dot(nn, L)));

    /* lathe: profile [[r, z, kind, hardVertex]] swept about (cx,cy) from a0..a1. Silhouette edges (visible face next to a
       hidden or missing one) are inked, so curved bodies get their contour lines; kind 'skip' emits no faces. */
    function lathe(prof, o = {}) {
      const cx = o.cx || 0, cy = o.cy || 0, a0 = o.a0 ?? 0, a1 = o.a1 ?? TAU, full = Math.abs(a1 - a0 - TAU) < 1e-6;
      const seg = o.seg ?? Math.max(1, Math.ceil((a1 - a0) / ((o.step ?? 6) * DG) - 1e-6));
      const np = prof.length, ns = o.closed ? np : np - 1, out = [];
      const Q = (r, z, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z], A = i => a0 + (a1 - a0) * i / seg;
      const sn = []; for (let j = 0; j < ns; j++) { const p = prof[j], q = prof[(j + 1) % np], dr = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dr, dz) || 1; sn.push([dz / l, -dr / l]); }
      const crease = j => { if (o.closed) j = (j + ns) % ns; if (prof[j] && prof[j][3]) return true; const jp = o.closed ? (j - 1 + ns) % ns : j - 1; if (jp < 0 || j >= ns) return true; const a = sn[jp], b = sn[j]; return a[0] * b[0] + a[1] * b[1] < Math.cos(o.crease ?? 0.45); };
      const G = []; let lastK = null;
      for (let j = 0; j < ns; j++) {
        const row = [], p = prof[j], q = prof[(j + 1) % np]; for (let jj = j; jj >= 0; jj--) if (prof[jj][2]) { lastK = prof[jj][2]; break; } const kind = lastK || o.kind || 'obj';
        for (let i = 0; i < seg; i++) {
          if (kind === 'skip' || (p[0] < 1e-4 && q[0] < 1e-4)) { row.push(null); continue; }
          const t0 = A(i), t1 = A(i + 1), tm = (t0 + t1) / 2;
          const v = [Q(p[0], p[1], t0), Q(p[0], p[1], t1), Q(q[0], q[1], t1), Q(q[0], q[1], t0)];
          const nn = V.norm([Math.cos(tm) * sn[j][0], Math.sin(tm) * sn[j][0], sn[j][1]]), c = cen(v);
          row.push({ v, n: nn, vis: facing(nn, c), kind, rr: (p[0] + q[0]) / 2, j });
        }
        G.push(row);
      }
      const nb = (jj, ii) => { if (o.closed) jj = (jj + ns) % ns; if (jj < 0 || jj >= ns) return null; if (ii < 0 || ii >= seg) { if (!full) return null; ii = (ii + seg) % seg; } return G[jj][ii]; };
      const hid = x => !x || !x.vis;
      for (let j = 0; j < ns; j++) for (let i = 0; i < seg; i++) {
        const F = G[j][i]; if (!F || !F.vis) continue;
        const eA = o.edgeA !== false, eB = o.edgeB !== false;
        const hard = [crease(j) || hid(nb(j - 1, i)), (i === seg - 1 && !full) ? eB : !!o.vHard || hid(nb(j, i + 1)), crease(j + 1) || hid(nb(j + 1, i)), (i === 0 && !full) ? eA : !!o.vHard || hid(nb(j, i - 1))];
        out.push(Object.assign({ v: F.v, n: F.n, hard, hdir: [0, 0, 1], kind: F.kind, rr: F.rr }, o.f));
      }
      if (!full) [[a0, -1, o.capA], [a1, 1, o.capB]].forEach(([tt, sg, on]) => {
        if (on === false) return;
        let pts = prof.map(p => Q(p[0], p[1], tt)); if (!o.closed) pts = pts.concat([Q(0, prof[np - 1][1], tt), Q(0, prof[0][1], tt)]);
        const nn = [-Math.sin(tt) * sg, Math.cos(tt) * sg, 0]; if (!facing(nn, cen(pts))) return;
        out.push(Object.assign({ v: pts, n: nn, hard: pts.map(() => true), kind: o.capKind || 'cut' }, o.f, o.capF));
      });
      return out;
    }
    /* cylinder along an arbitrary axis (telescope tubes, pipes, legs) with silhouettes */
    function tube(p0, p1, r0, r1 = r0, seg = 10, o = {}) {
      const ax = V.norm(V.sub(p1, p0)), tmp = Math.abs(ax[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0], u = V.norm(V.cross(ax, tmp)), w = V.cross(ax, u);
      const ring = (c, rr) => Array.from({ length: seg }, (_, i) => { const a = i * TAU / seg; return V.add(c, V.add(V.mul(u, Math.cos(a) * rr), V.mul(w, Math.sin(a) * rr))); });
      const A = ring(p0, r0), B = ring(p1, r1), F = [];
      for (let i = 0; i < seg; i++) { const j = (i + 1) % seg, am = (i + 0.5) * TAU / seg, nn = V.norm(V.add(V.mul(u, Math.cos(am)), V.mul(w, Math.sin(am)))), v = [A[i], A[j], B[j], B[i]]; F.push({ v, n: nn, vis: facing(nn, cen(v)) }); }
      const out = [], capv = [facing(ax, p1), facing(V.mul(ax, -1), p0)];
      F.forEach((f, i) => { if (!f.vis) return; out.push(Object.assign({ v: f.v, n: f.n, hard: [!capv[1], !F[(i + 1) % seg].vis, !capv[0], !F[(i - 1 + seg) % seg].vis], hdir: ax, kind: o.kind || 'obj' }, o.f)); });
      if (o.caps !== false) { if (capv[0]) out.push(Object.assign({ v: B.slice().reverse(), n: ax, hard: B.map(() => true), kind: o.capKind || o.kind || 'obj' }, o.f)); if (capv[1]) out.push(Object.assign({ v: A.slice(), n: V.mul(ax, -1), hard: A.map(() => true), kind: o.capKind || o.kind || 'obj' }, o.f)); }
      return out;
    }
    const box = (x, y, w, d, rot, z0, z1, o = {}) => { const c = Math.cos(rot), s = Math.sin(rot), pts = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([a, b]) => [x + a * c - b * s, y + a * s + b * c]); return D.extrude(pts, z0, z1, { crease: 0.3 }).map(f => Object.assign(f, { kind: o.kind || 'obj' }, o.f)); };
    const quad = (v, nn, o = {}) => Object.assign({ v, n: nn, hard: v.map(() => true), kind: 'obj' }, o);

    /* ---------------- building constants ---------------- */
    const RI = 11.4, RO = 12.0, RS = 1.62, RL = 1.25, TH = 0.45, KR = 1.2;
    const Z = [-3.8, 0.6, 5.0, 9.4, 13.8, 17.9], H = [46, 53, 80, 100, 105, 105].map(d => d * DG), PHC = -100 * DG;
    const ret = k => [PHC + H[k], PHC + TAU - H[k]];
    const WIN = Array.from({ length: 16 }, (_, m) => (11.25 + 22.5 * m) * DG), DOOR = -40 * DG;
    const NR = 22, DA = 75 * DG / NR, SR0 = RI - 1.95, SR1 = RI - 0.02, WB = SR0 - 0.1;
    const FAL = k => ret(k + 1)[1] - 4 * DG - 75 * DG, WELL = k => { const b = FAL(k - 1) + (NR - 1) * DA; return [b - 38 * DG, b]; };

    const GR = []; for (let k = 0; k < 6; k++) GR.push({ slab: [], inw: [], main: [] });
    const put = (k, pass, fs) => { (Array.isArray(fs) ? fs : [fs]).forEach(f => GR[k][pass].push(f)); };
    const cust = (k, pass, c, fn, bias = 0) => GR[k][pass].push({ custom: fn, c, bias });
    const LN = { w: 0.8, c: INK, a: 0.9, passes: 1, over: 0, rough: 0.2 };
    const seg3 = (PP, a, b, o) => { const p = pr(a), q = pr(b); if (p && q) PP.line(p[0], p[1], q[0], q[1], Object.assign({}, LN, o)); };
    const pl3 = (PP, pts, o) => D.polyline3(PP, pts, cam, Object.assign({ w: 0.8, c: INK, a: 0.9, rough: 0.25 }, o));

    /* ---------------- walls ---------------- */
    function wallStorey(k) {
      const z0 = Z[k], z1 = Z[k + 1] - TH, [ta, tb] = ret(k), [na, nb] = k < 4 ? ret(k + 1) : [ta, tb];
      const hw = 3.9 * DG, zs = z0 + (k === 1 ? 0.75 : 1.0), zh = z0 + (k === 1 ? 3.3 : 3.1), zm = z0 + (z1 - z0) * 0.6;
      const norm = w => { while (w < ta) w += TAU; while (w >= ta + TAU) w -= TAU; return w; };
      const wins = k === 0 ? [] : WIN.map(norm).filter(w => w - hw > ta + 2 * DG && w + hw < tb - 2 * DG && !(k === 1 && Math.abs(w - norm(DOOR)) < 2 * hw)).map(w => ({ w, hw })); if (k === 1) wins.push({ w: norm(DOOR), hw: 4 * DG, door: true });
      const bps = new Set([ta, tb]); if (na > ta && na < tb) bps.add(na); if (nb > ta && nb < tb) bps.add(nb);
      wins.forEach(o => { bps.add(o.w - o.hw); bps.add(o.w + o.hw); });
      const arr = [...bps].sort((a, b) => a - b);
      // outer profile split: rusticated ground storey, buried basement
      const outer = [];
      if (k === 0) { outer.push([RO, z0, 'skip'], [RO, 0, 'out']); }
      else if (k === 1) { for (let z = z0; z < z1 - 0.3; z += 0.8) outer.push([RO, z, 'out', true]); }
      else outer.push([RO, z0, 'out'], [RO, (z0 + z1) / 2, 'out']);
      for (let i = 0; i + 1 < arr.length; i++) {
        const a = arr[i], b = arr[i + 1]; if (b - a < 1e-6) continue;
        const m = (a + b) / 2, exposed = k === 4 || m < na || m > nb, win = wins.find(o => Math.abs(m - o.w) < o.hw);
        const top = k === 4 ? 'skip' : exposed ? 'wtop' : 'skip', capA = Math.abs(a - ta) < 1e-9, capB = Math.abs(b - tb) < 1e-9;
        const oo = { a0: a, a1: b, closed: true, step: 8, capA: capA ? undefined : false, capB: capB ? undefined : false, edgeA: capA, edgeB: capB };
        if (!win) {
          put(k, 'main', lathe(outer.concat([[RO, z1, top], [RI, z1, 'inU'], [RI, zm, 'inL'], [RI, z0, 'skip']]), oo).filter(f => f.kind !== 'inU' && f.kind !== 'inL'));
          put(k, 'inw', lathe(outer.concat([[RO, z1, top], [RI, z1, 'inU'], [RI, zm, 'inL'], [RI, z0, 'skip']]), oo).filter(f => f.kind === 'inU' || f.kind === 'inL'));
          continue;
        }
        const s0 = win.door ? z0 : zs, h0 = win.door ? z0 + 3.0 : zh;
        if (!win.door) {
          const f = lathe(outer.filter(p => p[1] < s0 - 0.05).concat([[RO, s0, 'sill'], [RI, s0, 'inL'], [RI, z0, 'skip']]), Object.assign({}, oo, { edgeA: true, edgeB: true }));
          put(k, 'main', f.filter(q => q.kind !== 'inL')); put(k, 'inw', f.filter(q => q.kind === 'inL'));
        }
        const hp = [[RO, h0, 'out']].concat(outer.filter(p => p[1] > h0 + 0.05).map(p => [RO, p[1], 'out', true]), [[RO, z1, top], [RI, z1, 'inU'], [RI, h0, 'skip']]);
        const f2 = lathe(hp, Object.assign({}, oo, { edgeA: true, edgeB: true }));
        put(k, 'main', f2.filter(q => q.kind !== 'inU')); put(k, 'inw', f2.filter(q => q.kind === 'inU'));
        // jambs (window reveals) and glass
        const wa = win.w - win.hw, wb = win.w + win.hw;
        put(k, 'main', quad([pol(RI, wa, s0), pol(RO, wa, s0), pol(RO, wa, h0), pol(RI, wa, h0)], [-Math.sin(wa), Math.cos(wa), 0], { kind: 'jamb' }));
        put(k, 'main', quad([pol(RO, wb, s0), pol(RI, wb, s0), pol(RI, wb, h0), pol(RO, wb, h0)], [Math.sin(wb), -Math.cos(wb), 0], { kind: 'jamb' }));
        const rg = RO - 0.16;
        put(k, 'main', lathe([[rg, s0, win.door ? 'door' : 'glass'], [rg, h0]], { a0: wa, a1: wb, seg: 2, capA: false, capB: false, edgeA: true, edgeB: true }));
        // glazing bars / door panels (drawn from inside and outside)
        const wm = win.w, zt = lerp(s0, h0, 0.64);
        cust(k, 'main', pol(rg, wm, (s0 + h0) / 2), PP => {
          if (win.door) { seg3(PP, pol(rg + 0.02, wm, s0), pol(rg + 0.02, wm, h0), { w: 1.1 }); [0.3, 0.7].forEach(u => { const z = lerp(s0, h0, u); seg3(PP, pol(rg + 0.02, wa + 0.4 * DG, z), pol(rg + 0.02, wb - 0.4 * DG, z), { w: 0.6, a: 0.6 }); }); return; }
          seg3(PP, pol(rg, wm, s0), pol(rg, wm, h0), { w: 1.0 }); seg3(PP, pol(rg, wa, zt), pol(rg, wb, zt), { w: 0.9 });
          [0.33, 0.66].forEach(u => { const aa = lerp(wa, wb, u); seg3(PP, pol(rg, aa, zt), pol(rg, aa, h0), { w: 0.5, a: 0.7 }); });
          seg3(PP, pol(rg, wa, lerp(zt, h0, 0.5)), pol(rg, wb, lerp(zt, h0, 0.5)), { w: 0.5, a: 0.7 });
        }, 0.08);
        // keystone / lintel line over each window on the exterior
        if (!win.door) cust(k, 'main', pol(RO + 0.02, wm, h0 + 0.2), PP => { const pts = []; for (let u = 0; u <= 6; u++) pts.push(pol(RO + 0.02, lerp(wa - 0.8 * DG, wb + 0.8 * DG, u / 6), h0 + 0.28)); pl3(PP, pts, { w: 0.6, a: 0.7 }); seg3(PP, pol(RO + 0.03, wm - 0.9 * DG, h0), pol(RO + 0.03, wm - 1.2 * DG, h0 + 0.5), { w: 0.6, a: 0.75 }); seg3(PP, pol(RO + 0.03, wm + 0.9 * DG, h0), pol(RO + 0.03, wm + 1.2 * DG, h0 + 0.5), { w: 0.6, a: 0.75 }); }, -0.1);
      }
      if (k === 4) {   // coping and railing round the open top of the drum
        put(k, 'main', lathe([[RO + 0.14, z1 - 0.1, 'out'], [RO + 0.14, z1 + 0.28, 'ptop'], [RI - 0.1, z1 + 0.28, 'pin'], [RI - 0.1, z1, 'skip'], [RI, z1, 'skip']], { closed: true, a0: ta, a1: tb, step: 4 }));
        const r = (RO + RI) / 2, zp = z1 + 0.28;
        for (let a = ta; a < tb - 0.3 * DG; a += 2.6 * DG) { const b = Math.min(tb, a + 2.6 * DG); cust(k, 'main', pol(r, (a + b) / 2, zp + 0.5), PP => { seg3(PP, pol(r, a, zp), pol(r, a, zp + 1.0), { w: 0.9 }); seg3(PP, pol(r, a, zp + 1.02), pol(r, b, zp + 1.02), { w: 1.5 }); seg3(PP, pol(r, a, zp + 0.55), pol(r, b, zp + 0.55), { w: 0.5, a: 0.6 }); }, 0.2); }
      }
    }

    /* ---------------- floor slabs ---------------- */
    function slab(k) {
      const z1 = Z[k], z0 = k === 0 ? Z[0] - 0.6 : Z[k] - TH, [ta, tb] = ret(k), ro = k === 0 ? RO : RO + 0.15;
      const [OPA, OPB] = k ? WELL(k) : [0, 0], R0 = k === 4 ? 3.4 : RL + 0.01;
      const full = (k === 0 ? [[RO, z0, 'skip'], [RO, z1, 'skip']] : [[ro, z0, 'out'], [ro, z1, 'skip'], [RO, z1, 'skip']]).concat([[RI, z1, 'top'], [WB, z1, 'top'], [5.4, z1, 'top'], [R0, z1, 'slabIn'], [R0, z0, 'skip']]);
      const inner = [[WB, z0, 'skip'], [WB, z1, 'top'], [5.4, z1, 'top'], [R0, z1, 'slabIn'], [R0, z0, 'skip']];
      if (k === 4) put(k, 'slab', lathe([[3.4, z0, 'well'], [3.4, z1, 'top'], [1.8, z1, 'top'], [0.001, z1]], { seg: 24 }));
      const o = { closed: true, step: 9 };
      if (k === 0) { put(k, 'slab', lathe(full, Object.assign({ a0: ta, a1: tb }, o))); return; }
      put(k, 'slab', lathe(full, Object.assign({ a0: ta, a1: OPA, capB: false, edgeB: false }, o)));
      put(k, 'slab', lathe(full, Object.assign({ a0: OPB, a1: tb, capA: false, edgeA: false }, o)));
      put(k, 'slab', lathe(inner.map((p, i) => i === 0 ? [WB, z0, 'well'] : p), Object.assign({ a0: OPA, a1: OPB, capA: false, capB: false, edgeA: false, edgeB: false }, o)));
      // ends of the stair well
      put(k, 'slab', quad([pol(WB, OPA, z0), pol(RI, OPA, z0), pol(RI, OPA, z1), pol(WB, OPA, z1)], [Math.sin(OPA), -Math.cos(OPA), 0], { kind: 'well' }));
      put(k, 'slab', quad([pol(RI, OPB, z0), pol(WB, OPB, z0), pol(WB, OPB, z1), pol(RI, OPB, z1)], [-Math.sin(OPB), Math.cos(OPB), 0], { kind: 'well' }));
      // balustrade round the well
      const zb = z1, rb = WB - 0.05;
      for (let a = OPA; a < OPB - 0.5 * DG; a += 3.2 * DG) { const b = Math.min(OPB, a + 3.2 * DG); cust(k, 'main', pol(rb, (a + b) / 2, zb + 0.5), PP => { seg3(PP, pol(rb, a, zb), pol(rb, a, zb + 0.95), { w: 0.9 }); seg3(PP, pol(rb, a, zb + 0.97), pol(rb, b, zb + 0.97), { w: 1.4 }); seg3(PP, pol(rb, a, zb + 0.5), pol(rb, b, zb + 0.5), { w: 0.5, a: 0.6 }); seg3(PP, pol(rb, a, zb + 0.08), pol(rb, b, zb + 0.08), { w: 0.7, a: 0.8 }); }); }
      for (let i = 0; i <= 4; i++) { const r = lerp(rb, RI, i / 4), r2 = lerp(rb, RI, (i + 1) / 4); cust(k, 'main', pol(r, OPA, zb + 0.5), PP => { seg3(PP, pol(r, OPA, zb), pol(r, OPA, zb + 0.95), { w: 0.9 }); if (i < 4) { seg3(PP, pol(r, OPA, zb + 0.97), pol(r2, OPA, zb + 0.97), { w: 1.4 }); seg3(PP, pol(r, OPA, zb + 0.5), pol(r2, OPA, zb + 0.5), { w: 0.5, a: 0.6 }); } }); }
    }

    /* ---------------- cantilevered spiral flight from storey k to k+1 ---------------- */
    function flight(k) {
      const z0 = Z[k], rise = (Z[k + 1] - z0) / NR, AL = FAL(k);
      for (let i = 0; i < NR - 1; i++) {
        const top = z0 + (i + 1) * rise, a0 = AL + i * DA, a1 = a0 + DA;
        put(k, 'main', lathe([[SR1, top - 0.2, 'skip'], [SR1, top, 'tread'], [SR0, top, 'treadIn'], [SR0, top - 0.2, 'skip']], { closed: true, a0, a1, seg: 1, capKind: 'riser' }));
      }
      for (let i = 0; i < NR; i++) {
        const a = AL + i * DA, b = a + DA, za = z0 + i * rise, zb = za + rise, r = SR0 - 0.06, m = (a + b) / 2;
        put(k, 'main', quad([pol(r, a, za - 0.42), pol(r, b, zb - 0.42), pol(r, b, zb + 0.1), pol(r, a, za + 0.1)], [-Math.cos(m), -Math.sin(m), 0], { kind: 'string', hard: [true, false, true, false] }));
        const rr = SR0 + 0.04;
        cust(k, 'main', pol(rr, m, za + 0.6), PP => {
          seg3(PP, pol(rr, a, za + 1.02), pol(rr, b, zb + 1.02), { w: 1.5, a: 0.95 }); seg3(PP, pol(rr, a, za + 0.52), pol(rr, b, zb + 0.52), { w: 0.5, a: 0.55 });
          if (i % 2 === 0) seg3(PP, pol(rr, m, za + rise * 0.5 + 0.12), pol(rr, m, za + rise * 0.5 + 1.02), { w: 0.85 });
        }, 0.3);
      }
    }

    /* ---------------- people ---------------- */
    function figure(k, x, y, z, o = {}) {
      const s = o.s || 1, sty = { kind: 'fig' }, zz = v => z + v * s;
      if (o.lady) put(k, 'main', lathe([[0.34 * s, zz(0), 'fig'], [0.27 * s, zz(0.45)], [0.17 * s, zz(0.95)], [0.14 * s, zz(1.1)], [0.2 * s, zz(1.36)], [0.1 * s, zz(1.46)], [0.001, zz(1.48)]], Object.assign({ cx: x, cy: y, seg: 7 }, sty)));
      else {
        [-1, 1].forEach(sg => put(k, 'main', lathe([[0.075 * s, zz(0), 'leg'], [0.07 * s, zz(0.62)], [0.001, zz(0.62)]], { cx: x + sg * 0.09 * s * Math.cos(o.rot || 0), cy: y + sg * 0.09 * s * Math.sin(o.rot || 0), seg: 5 })));
        put(k, 'main', lathe([[0.23 * s, zz(0.5), 'fig'], [0.19 * s, zz(1.1)], [0.22 * s, zz(1.38)], [0.1 * s, zz(1.48)], [0.001, zz(1.5)]], Object.assign({ cx: x, cy: y, seg: 7 }, sty)));
      }
      put(k, 'main', lathe([[0.001, zz(1.47), 'head'], [0.085 * s, zz(1.5)], [0.1 * s, zz(1.59)], [0.085 * s, zz(1.68)], [0.001, zz(1.71)]], { cx: x, cy: y, seg: 6 }));
      if (o.hat !== false) {
        const hb = o.lady ? 0.2 : 0.16, hc = o.top ? 0.2 : 0.1;
        put(k, 'main', lathe([[hb * s, zz(1.65), 'hat'], [hb * s, zz(1.675)], [0.095 * s, zz(1.675)], [0.095 * s, zz(1.675 + hc)], [0.001, zz(1.68 + hc)]], { cx: x, cy: y, seg: 7 }));
      }
      // soft contact shadow
      cust(k, 'main', [x, y, z + 0.01], PP => { const pts = []; for (let i = 0; i < 12; i++) { const a = i * TAU / 12; const q = pr([x + 0.45 * s + Math.cos(a) * 0.55 * s, y + 0.25 * s + Math.sin(a) * 0.3 * s, z + 0.01]); if (q) pts.push([q[0], q[1]]); } if (pts.length > 4) PP.hatch(pts, { ang: -30, gap: 1.6, a: 0.5, w: 0.45, c: INK, inset: 0.3, ragged: 0.4 }); }, -2);
    }

    /* ---------------- furniture ---------------- */
    const at = (r, a) => [Math.cos(a * DG) * r * KR, Math.sin(a * DG) * r * KR];
    function bookcase(k, a, r0, r1, h) {
      const z = Z[k], ang = a * DG, [x0, y0] = at(r0, a), [x1, y1] = at(r1, a), xm = (x0 + x1) / 2, ym = (y0 + y1) / 2, len = (r1 - r0) * KR, th = 0.42;
      put(k, 'main', box(xm, ym, len, th, ang, z, z + h, { kind: 'wood' }));
      put(k, 'main', box(xm, ym, len + 0.1, th + 0.1, ang, z + h, z + h + 0.12, { kind: 'wood' }));
      // books on the visible long face
      const nrm = [-Math.sin(ang), Math.cos(ang), 0], side = facing(nrm, [xm, ym, z + 1]) ? 1 : -1, off = side * (th / 2 + 0.01);
      const P3 = (u, zz) => [x0 + Math.cos(ang) * u - Math.sin(ang) * off, y0 + Math.sin(ang) * u + Math.cos(ang) * off, zz];
      cust(k, 'main', [xm - Math.sin(ang) * off, ym + Math.cos(ang) * off, z + h / 2], PP => {
        const nsh = Math.floor(h / 0.42);
        for (let s = 0; s <= nsh; s++) { const zz = z + 0.12 + s * (h - 0.12) / nsh; seg3(PP, P3(0.05, zz), P3(len - 0.05, zz), { w: 0.8 }); }
        for (let s = 0; s < nsh; s++) { const zb = z + 0.12 + s * (h - 0.12) / nsh, zt = zb + (h - 0.12) / nsh; let u = 0.08; while (u < len - 0.1) { const bw = P.r(0.05, 0.11), bh = P.r(0.55, 0.9) * (zt - zb); if (P.r() < 0.9) seg3(PP, P3(u, zb), P3(u + (P.r() < 0.1 ? 0.06 : 0), zb + bh), { w: 0.55, a: 0.75 }); u += bw; } }
      }, 0.05);
    }
    function table(k, r, a, w, d, rotOff = 90) {
      const z = Z[k], [x, y] = at(r, a), rot = (a + rotOff) * DG, c = Math.cos(rot), s = Math.sin(rot);
      put(k, 'main', box(x, y, w, d, rot, z + 0.72, z + 0.78, { kind: 'wood' }));
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([u, v]) => { const lx = x + (u * (w / 2 - 0.08)) * c - (v * (d / 2 - 0.08)) * s, ly = y + (u * (w / 2 - 0.08)) * s + (v * (d / 2 - 0.08)) * c; put(k, 'main', box(lx, ly, 0.07, 0.07, rot, z, z + 0.72, { kind: 'wood' })); });
      return { x, y, z: z + 0.78, rot };
    }
    function lamp(k, x, y, z) { put(k, 'main', lathe([[0.08, z, 'brass'], [0.02, z + 0.04], [0.02, z + 0.36], [0.2, z + 0.42, 'shade'], [0.16, z + 0.54], [0.001, z + 0.56]], { cx: x, cy: y, seg: 8 })); }
    function books(k, x, y, z, rot) { put(k, 'main', box(x, y, 0.32, 0.24, rot, z, z + 0.05, { kind: 'paper' })); put(k, 'main', box(x + 0.05, y - 0.03, 0.28, 0.22, rot + 0.3, z + 0.05, z + 0.1, { kind: 'wood' })); }
    function column(k, r, a) {
      const z = Z[k], zc = Z[k + 1] - TH, [x, y] = at(r, a);
      put(k, 'main', lathe([[0.36, z, 'stone'], [0.36, z + 0.26], [0.2, z + 0.42], [0.18, z + 3.4], [0.34, z + 3.64], [0.4, z + 3.66], [0.4, zc], [0.001, zc]], { cx: x, cy: y, seg: 8, crease: 0.5 }));
    }

    /* ======================= BUILD ======================= */
    for (let k = 0; k < 5; k++) { wallStorey(k); slab(k); }
    for (let k = 0; k < 4; k++) flight(k);


    /* ---------------- sun shadows thrown by the slab above onto each floor: world-space hatch clipped exactly ---------------- */
    const inRet = (a, k) => { const [ta, tb] = ret(k); while (a < ta) a += TAU; while (a >= ta + TAU) a -= TAU; return a <= tb; };
    const inWell = (x, y, k) => { if (!k || k > 4) return false; const r = Math.hypot(x, y); if (r < WB || r > RI) return false; const [a0, a1] = WELL(k); let a = Math.atan2(y, x); while (a < a0 - Math.PI) a += TAU; while (a > a0 + Math.PI) a -= TAU; return a >= a0 && a <= a1; };
    function floorShadow(k) {
      const z = Z[k] + 0.01, dz = Z[k + 1] - TH - Z[k], ox = L[0] / L[2] * dz, oy = L[1] / L[2] * dz;
      const onFloor = (x, y) => { const r = Math.hypot(x, y); return r > RS + 0.05 && r < RI - 0.05 && inRet(Math.atan2(y, x), k) && !inWell(x, y, k); };
      const shaded = (x, y) => { const qx = x + ox, qy = y + oy, r = Math.hypot(qx, qy); return r < RO + 0.15 && r > (k + 1 === 4 ? 0 : RS) && (inRet(Math.atan2(qy, qx), k + 1) || (k + 1 === 4 && r < 3.4)) && !inWell(qx, qy, k + 1); };
      cust(k, 'slab', [0, 0, Z[k]], PP => {   // a darker wash under the hatching, built from angular runs in thin rings
        const [ta, tb] = ret(k), ivals = r => { const out = []; let a0 = null; for (let a = ta; a <= tb + 0.5 * DG; a += 0.6 * DG) { const x = Math.cos(a) * r, y = Math.sin(a) * r, ins = a <= tb && onFloor(x, y) && shaded(x, y); if (ins && a0 === null) a0 = a; else if (!ins && a0 !== null) { out.push([a0, a]); a0 = null; } } return out; };
        let prev = ivals(RS + 0.08);
        for (let r0 = RS + 0.08; r0 < RI - 0.1; r0 += 0.4) {
          const r1 = Math.min(RI - 0.08, r0 + 0.4), cur = ivals(r1), same = cur.length === prev.length && cur.length > 0, mid = same ? null : ivals((r0 + r1) / 2);
          (same ? cur : mid).forEach((iv, i) => { const A = same ? prev[i] : iv, B = iv, pts = []; for (let u = 0; u <= 6; u++) pts.push(pr(pol(r0, lerp(A[0], A[1], u / 6), z))); for (let u = 6; u >= 0; u--) pts.push(pr(pol(r1, lerp(B[0], B[1], u / 6), z))); if (pts.every(q => q)) PP.wash(pts.map(q => [q[0], q[1]]), '#8a5a34', 0.3, { edge: 0, jit: 0.3, steps: 1 }); });
          prev = cur;
        }
        [[24, 0.2, 0.5], [-58, 0.27, 0.38]].forEach(([beta, gap, al]) => {
          const b = beta * DG, dx = Math.cos(b), dy = Math.sin(b), nx = -dy, ny = dx;
          for (let s = -RI; s <= RI; s += gap) {
            let run = null;
            for (let tt = -RI; tt <= RI + 0.1; tt += 0.1) {
              const x = nx * s + dx * tt, y = ny * s + dy * tt, ins = onFloor(x, y) && shaded(x, y);
              if (ins && !run) run = [x, y]; else if (!ins && run) { const a = pr([run[0], run[1], z]), c = pr([x - dx * 0.1, y - dy * 0.1, z]); if (a && c && Math.hypot(c[0] - a[0], c[1] - a[1]) > 2) PP.line(a[0], a[1], c[0], c[1], { w: 0.5, c: INK, a: al * P.r(0.75, 1), passes: 1, over: 0.3, rough: 0.35 }); run = null; }
            }
          }
        });
      }, 1e4);
    }
    for (let k = 0; k < 4; k++) floorShadow(k);

    /* earth drum with the paved terrace (cut with the basement) */
    { const [ta, tb] = ret(0), zb = -4.8;
      put(0, 'main', lathe([[RO + 2.4, zb, 'earthOut'], [RO + 2.4, -0.3, 'earthOut'], [RO + 2.4, 0, 'terrace'], [RO + 1.2, 0, 'terrace'], [RO, 0, 'skip'], [RO, zb, 'skip']], { closed: true, a0: ta, a1: tb, step: 5, capKind: 'earth' }));
      // paving joints on the terrace
      cust(0, 'main', pol(RO + 1.2, (ta + tb) / 2, 0.02), PP => { [RO + 1.2].forEach(r => { const pts = []; for (let a = ta; a <= tb + 1e-6; a += 2 * DG) pts.push(pol(r, a, 0.01)); pl3(PP, pts, { w: 0.6, a: 0.7 }); }); for (let a = ta + 2 * DG; a < tb; a += 4 * DG) { seg3(PP, pol(RO + 0.2, a, 0.01), pol(RO + 1.2, a, 0.01), { w: 0.45, a: 0.55 }); seg3(PP, pol(RO + 1.2, a + 2 * DG, 0.01), pol(RO + 2.3, a + 2 * DG, 0.01), { w: 0.45, a: 0.55 }); } }, -40);
    }
    { const [ta, tb] = ret(0); [[ta, 1], [tb, -1]].forEach(([a, sg]) => cust(0, 'main', pol(RO + 1.2, a, -2.4), PP => { for (let i = 0; i < 26; i++) { const r = P.r(RO + 0.25, RO + 2.25), zz = P.r(-4.6, -0.4), q = pr(pol(r, a, zz)); if (q) PP.ellipse(q[0], q[1], P.r(1.2, 3.2), P.r(0.9, 2), { w: 0.6, a: 0.75, passes: 1, rough: 0.3, rot: P.r(0, 3) }); } }, 0.6)); }
    // lamp standards on the terrace
    [158, 184, -44].forEach(a => { const x = Math.cos(a * DG) * (RO + 1.9), y = Math.sin(a * DG) * (RO + 1.9); put(1, 'main', lathe([[0.16, 0, 'iron'], [0.16, 0.3], [0.06, 0.4], [0.05, 3.1], [0.001, 3.1]], { cx: x, cy: y, seg: 7 })); put(1, 'main', lathe([[0.001, 3.05, 'brass'], [0.2, 3.2], [0.24, 3.55], [0.12, 3.7], [0.001, 3.8]], { cx: x, cy: y, seg: 8 })); });
    /* basement: radial archive stacks, a boiler, crates */
    { const k = 0, z = Z[0];
      [-30, -10, 10, 30, 50].forEach(a => bookcase(k, a, 4.4, 8.4, 2.6));
      put(k, 'main', lathe([[0.95, z, 'iron'], [0.95, z + 2.0], [0.8, z + 2.35], [0.35, z + 2.5], [0.2, z + 2.5], [0.2, z + 3.0], [0.001, z + 3.0]], { cx: at(4.9, 150)[0], cy: at(4.9, 150)[1], seg: 14 }));
      { const [bx, by] = at(4.9, 150); put(k, 'main', tube([bx, by, z + 2.9], [bx - 1.6, by + 2.6, z + 3.4], 0.12, 0.12, 8, { kind: 'iron' })); put(k, 'main', tube([bx + 0.9, by, z + 0.9], [bx + 2.6, by - 0.4, z + 0.9], 0.1, 0.1, 8, { kind: 'iron' }));
        cust(k, 'main', [bx, by - 0.96, z + 1.0], PP => { const c = pr([bx + Math.cos(-100 * DG) * 0.96, by + Math.sin(-100 * DG) * 0.96, z + 0.8]); if (c) { PP.circle(c[0], c[1], 5, { w: 0.8, passes: 1, c: INK }); PP.dot(c[0], c[1], 1.4, { c: INK }); } }, 0.2); }
      put(k, 'main', box(...at(5.6, 176), 0.9, 0.9, 0.2, z, z + 0.8, { kind: 'wood' })); put(k, 'main', box(...at(6.3, 184), 0.8, 0.7, 0.5, z, z + 0.7, { kind: 'wood' })); put(k, 'main', box(...at(5.6, 177), 0.7, 0.6, 0.4, z + 0.8, z + 1.4, { kind: 'wood' }));
      figure(k, ...at(6.3, 0), z, { top: false }); figure(k, ...at(6.2, 199), z, { hat: false });
      [[7.4, 196], [8.1, 192], [7.9, 201.5], [8.6, 198]].forEach(([r, a], i) => { const [x, y] = at(r, a); put(k, 'main', lathe([[0.36, z, 'wood'], [0.42, z + 0.45], [0.36, z + 0.9, 'wood'], [0.001, z + 0.9]], { cx: x, cy: y, seg: 10 })); cust(k, 'main', [x, y, z + 0.5], PP => [0.2, 0.7].forEach(h => { const pts = []; for (let j = 0; j <= 12; j++) { const aa = j * TAU / 12; pts.push([x + Math.cos(aa) * (0.4 + 0.02 * (h === 0.2 ? 0 : 0)), y + Math.sin(aa) * 0.4, z + h]); } pl3(PP, pts.filter(q => V.dot([q[0] - x, q[1] - y, 0], V.sub(EYE, q)) > 0), { w: 0.6, a: 0.7 }); }), 0.3); }); figure(k, ...at(5.0, 164), z, { hat: true });
    }
    /* ground storey: entrance hall with a ring of columns, curved desk, mosaic */
    { const k = 1, z = Z[1];
      [15, 45, 75, 105, 135, 165, -15].forEach(a => column(k, 4.5, a));
      put(k, 'main', lathe([[7.6, z, 'wood'], [7.6, z + 1.0], [7.7, z + 1.0], [7.7, z + 1.08, 'wood'], [7.0, z + 1.08], [7.0, z + 1.0], [7.1, z + 1.0], [7.1, z]], { closed: true, a0: 18 * DG, a1: 58 * DG, step: 4, capKind: 'wood' }));
      figure(k, ...at(6.9, 38), z, { hat: false }); figure(k, ...at(5.4, -22), z, { top: true }); figure(k, ...at(5.9, -10), z, { lady: true });
      figure(k, ...at(3.2, 180), z, {}); figure(k, ...at(6.6, 88), z, { lady: true }); figure(k, ...at(7.1, 96), z, { top: true });
      put(k, 'main', box(...at(7.9, -32), 1.8, 0.45, 58 * DG, z, z + 0.45, { kind: 'wood' })); put(k, 'main', box(...at(6.4, 148), 1.8, 0.45, 58 * DG, z, z + 0.45, { kind: 'wood' }));
      // mosaic on the hall floor
      cust(k, 'slab', [0, 0, z], PP => { const [ta, tb] = ret(k); [2.3, 2.5, 3.7, 6.9].forEach((r, i) => { const pts = []; for (let a = ta; a <= tb + 1e-6; a += 2 * DG) pts.push(pol(r, a, z + 0.01)); pl3(PP, pts, { w: i === 3 ? 0.5 : 0.7, a: 0.6 }); }); for (let a = ta + 3 * DG; a < tb; a += 7.5 * DG) { seg3(PP, pol(2.5, a, z + 0.01), pol(3.7, a + 3.75 * DG, z + 0.01), { w: 0.5, a: 0.55 }); seg3(PP, pol(2.5, a + 7.5 * DG, z + 0.01), pol(3.7, a + 3.75 * DG, z + 0.01), { w: 0.5, a: 0.55 }); } }, 1e4);
      // entrance: steps and a small portico outside the door
      const d0 = DOOR - 7 * DG, d1 = DOOR + 7 * DG;
      [[RO + 0.15, RO + 0.6, 0.45], [RO + 0.6, RO + 1.05, 0.3], [RO + 1.05, RO + 1.5, 0.15]].forEach(([r0, r1, h]) => put(k, 'main', lathe([[r1, 0, 'stone'], [r1, h, 'stepTop'], [r0, h, 'skip'], [r0, 0, 'skip']], { closed: true, a0: d0, a1: d1, step: 3.5, capKind: 'stone' })));
      [-6.2, 6.2].forEach(da => { const x = Math.cos(DOOR + da * DG) * (RO + 0.42), y = Math.sin(DOOR + da * DG) * (RO + 0.42); put(k, 'main', lathe([[0.2, z, 'stone'], [0.2, z + 0.2], [0.14, z + 0.28], [0.13, z + 3.0], [0.2, z + 3.15], [0.001, z + 3.15]], { cx: x, cy: y, seg: 10 })); });
      put(k, 'main', lathe([[RO + 0.72, z + 3.15, 'stone'], [RO + 0.72, z + 3.55, 'stepTop'], [RO, z + 3.55, 'skip'], [RO, z + 3.15, 'skip']], { closed: true, a0: d0 - 1 * DG, a1: d1 + 1 * DG, step: 3, capKind: 'stone' }));
      figure(k, ...at(12.0, -44), 0, { top: true }); figure(k, ...at(12.3, -40), 0, { lady: true }); figure(k, ...at(11.7, -24), 0, {});
    }
    /* first floor: the reading room — radial alcove bookcases, reading tables with lamps */
    { const k = 2, z = Z[2];
      [0, 22.5, 45].forEach(a => bookcase(k, a, 6.9, 9.35, 2.9));
      [[4.9, -4], [4.9, 22], [4.9, 60], [4.6, 158]].forEach(([r, a], i) => { const tt = table(k, r, a, 2.2, 0.9); lamp(k, tt.x, tt.y, tt.z); books(k, tt.x + 0.5 * Math.cos(tt.rot), tt.y + 0.5 * Math.sin(tt.rot), tt.z, tt.rot); if (i === 1) books(k, tt.x - 0.6 * Math.cos(tt.rot), tt.y - 0.6 * Math.sin(tt.rot), tt.z, tt.rot + 0.4); });
      figure(k, ...at(5.8, 5), z, { hat: false }); figure(k, ...at(5.9, 26), z, { lady: true, hat: false }); figure(k, ...at(3.9, 64), z, { top: true }); figure(k, ...at(3.5, 165), z, {});
      figure(k, ...at(8.0, 11), z, { hat: false });
    }
    /* second floor: gallery — vitrines, a great globe, a statue, framed pictures */
    { const k = 3, z = Z[3];
      [14, 40, 66, 112].forEach(a => { const [x, y] = at(6.3, a), rot = (a + 90) * DG; put(k, 'main', box(x, y, 1.7, 0.75, rot, z, z + 0.85, { kind: 'wood' })); put(k, 'main', box(x, y, 1.7, 0.75, rot, z + 0.85, z + 1.45, { kind: 'glass3', f: { ghost: true } }).map(f => Object.assign(f, { all: true })));
        for (let i = -1; i <= 1; i++) { const px = x + Math.cos(rot) * i * 0.5, py = y + Math.sin(rot) * i * 0.5; put(k, 'main', lathe([[0.001, z + 0.85, 'brass'], [0.1, z + 0.9], [0.13, z + 1.02], [0.06, z + 1.14], [0.08, z + 1.2], [0.001, z + 1.2]], { cx: px, cy: py, seg: 7 })); } });
      { const [x, y] = at(4.3, 138); put(k, 'main', lathe([[0.4, z, 'wood'], [0.1, z + 0.2], [0.08, z + 0.7], [0.001, z + 0.7]], { cx: x, cy: y, seg: 10 }));
        const sp = []; for (let i = 0; i <= 8; i++) { const ph = -Math.PI / 2 + Math.PI * i / 8; sp.push([Math.max(0.001, Math.cos(ph) * 0.62), z + 1.35 + Math.sin(ph) * 0.62, i === 0 ? 'globe' : undefined]); } put(k, 'main', lathe(sp, { cx: x, cy: y, seg: 16 }));
        cust(k, 'main', [x, y, z + 1.35], PP => { const pts = []; for (let i = 0; i <= 32; i++) { const th = -Math.PI / 2 + Math.PI * 2 * i / 32 * 0.75; pts.push([x + Math.cos(0.4) * Math.cos(th) * 0.7, y + Math.sin(0.4) * Math.cos(th) * 0.7, z + 1.35 + Math.sin(th) * 0.7]); } pl3(PP, pts, { w: 1.2, c: INK }); [0.3, -0.25].forEach(lat => { const q = []; for (let i = 0; i <= 20; i++) { const th = -2.2 + 2.8 * i / 20; q.push([x + Math.cos(th) * Math.cos(lat) * 0.625, y + Math.sin(th) * Math.cos(lat) * 0.625, z + 1.35 + Math.sin(lat) * 0.625]); } pl3(PP, q, { w: 0.5, a: 0.6 }); }); }, 1); }
      { const [x, y] = at(4.0, 18); put(k, 'main', box(x, y, 0.8, 0.8, 0.3, z, z + 1.1, { kind: 'stone' })); put(k, 'main', lathe([[0.3, z + 1.1, 'stone'], [0.24, z + 1.6], [0.18, z + 2.1], [0.26, z + 2.35], [0.12, z + 2.5], [0.001, z + 2.52]], { cx: x, cy: y, seg: 9 })); put(k, 'main', lathe([[0.001, z + 2.48, 'stone'], [0.1, z + 2.55], [0.11, z + 2.66], [0.001, z + 2.76]], { cx: x, cy: y, seg: 7 })); }
      [22.5, 45].forEach(a => { const aa = a * DG, w = 2.8 * DG, r = RI - 0.04, z0 = z + 1.5, z1 = z + 2.6; put(k, 'main', quad([pol(r, aa + w, z0), pol(r, aa - w, z0), pol(r, aa - w, z1), pol(r, aa + w, z1)], [-Math.cos(aa), -Math.sin(aa), 0], { kind: 'frame', bias: 0.3 })); put(k, 'main', quad([pol(r - 0.02, aa + w * 0.8, z0 + 0.12), pol(r - 0.02, aa - w * 0.8, z0 + 0.12), pol(r - 0.02, aa - w * 0.8, z1 - 0.12), pol(r - 0.02, aa + w * 0.8, z1 - 0.12)], [-Math.cos(aa), -Math.sin(aa), 0], { kind: 'canvas', bias: 0.4 })); });
      figure(k, ...at(5.6, 26), z, { top: true }); figure(k, ...at(4.6, 70), z, { lady: true }); figure(k, ...at(5.2, 92), z, {}); figure(k, ...at(3.4, 128), z, { hat: false });
      figure(k, ...at(7.3, 30), z, { hat: false, s: 0.97 });
    }
    /* third floor: instrument room — armillary sphere, chart tables, a regulator clock, telescope at a window */
    { const k = 4, z = Z[4];
      { const [x, y] = at(5.5, 42), zc = z + 1.9, R = 0.95; put(k, 'main', lathe([[0.55, z, 'stone'], [0.55, z + 0.18], [0.16, z + 0.3], [0.12, z + 0.8], [0.3, z + 0.9], [0.001, z + 0.92]], { cx: x, cy: y, seg: 12 }));
        put(k, 'main', lathe([[0.001, zc - 0.18, 'brass'], [0.18, zc], [0.001, zc + 0.18]], { cx: x, cy: y, seg: 8 }));
        cust(k, 'main', [x, y, zc], PP => {
          const ring = (tilt, az, r, w) => { const pts = []; for (let i = 0; i <= 40; i++) { const th = i * TAU / 40; const lx = Math.cos(th) * r, ly = Math.sin(th) * r * Math.cos(tilt), lz = Math.sin(th) * r * Math.sin(tilt); pts.push([x + lx * Math.cos(az) - ly * Math.sin(az), y + lx * Math.sin(az) + ly * Math.cos(az), zc + lz]); } pl3(PP, pts, { w, c: INK }); };
          ring(Math.PI / 2, 0.3, R, 1.5); ring(Math.PI / 2, 1.87, R, 1.1); ring(0, 0, R, 1.3); ring(0.41, 0.3, R * 0.97, 1.0); ring(0.85, 0.9, R * 0.9, 0.7); ring(0, 0, R * 0.55, 0.6);
          seg3(PP, [x - 0.4, y - 0.3, zc - 1.1], [x + 0.4, y + 0.3, zc + 1.1], { w: 1.3 }); seg3(PP, [x, y, z + 0.92], [x, y, zc - R], { w: 1.2 }); }, 0.5); }
      { const tt = table(k, 5.9, 24, 2.0, 1.1); put(k, 'main', D.poly3([[tt.x - 0.9, tt.y - 0.45, tt.z + 0.02], [tt.x + 0.9, tt.y - 0.45, tt.z + 0.02], [tt.x + 0.9, tt.y + 0.3, tt.z + 0.3], [tt.x - 0.9, tt.y + 0.3, tt.z + 0.3]].map(p => { const dx = p[0] - tt.x, dy = p[1] - tt.y, c = Math.cos(tt.rot), s = Math.sin(tt.rot); return [tt.x + dx * c - dy * s, tt.y + dx * s + dy * c, p[2]]; }), [tt.x, tt.y, tt.z - 3], { kind: 'paper' })); }
      { const [x, y] = at(8.8, 62); put(k, 'main', box(x, y, 0.7, 0.45, 152 * DG, z, z + 2.4, { kind: 'wood' })); put(k, 'main', box(x, y, 0.8, 0.5, 152 * DG, z + 2.4, z + 2.6, { kind: 'wood' })); cust(k, 'main', [x - 0.2, y - 0.25, z + 2.0], PP => { const c = pr([x + 0.05, y - 0.24, z + 2.15]); if (c) { PP.circle(c[0], c[1], 4.5, { w: 0.8, passes: 1, c: INK }); PP.line(c[0], c[1], c[0] + 2, c[1] - 3, Object.assign({}, LN, { w: 0.6 })); } const a = pr([x + 0.05, y - 0.24, z + 1.8]), b = pr([x + 0.05, y - 0.24, z + 0.6]); if (a && b) PP.line(a[0], a[1], b[0] + 3, b[1], Object.assign({}, LN, { w: 0.6 })); }, 0.3); }
      { const [x, y] = at(7.6, 95), zp = z + 1.45, dir = [Math.cos(100 * DG) * 0.8, Math.sin(100 * DG) * 0.8, 0.45];
        put(k, 'main', tube([x - dir[0] * 1.2, y - dir[1] * 1.2, zp - dir[2] * 1.2], [x + dir[0] * 1.5, y + dir[1] * 1.5, zp + dir[2] * 1.5], 0.16, 0.2, 10, { kind: 'brass' }));
        cust(k, 'main', [x, y, z + 0.7], PP => { [0, 2.1, 4.2].forEach(a => seg3(PP, [x, y, zp - 0.1], [x + Math.cos(a) * 0.7, y + Math.sin(a) * 0.7, z], { w: 1.1 })); }, 0.4); }
      cust(k, 'slab', [0, 0, z], PP => { const [ta, tb] = ret(k); [3.9, 4.15].forEach(r => { const pts = []; for (let a = ta; a <= tb + 1e-6; a += 2 * DG) pts.push(pol(r, a, z + 0.01)); pl3(PP, pts, { w: 0.8, a: 0.7 }); }); for (let a = ta + 1 * DG; a < tb; a += 5 * DG) seg3(PP, pol(3.9, a, z + 0.01), pol(Math.round((a / DG) / 5) % 6 === 0 ? 4.6 : 4.15, a, z + 0.01), { w: 0.6, a: 0.7 }); seg3(PP, pol(3.5, 90 * DG, z + 0.01), pol(RI - 0.2, 90 * DG, z + 0.01), { w: 1.6, c: '#9a6a2c', a: 0.9 }); seg3(PP, pol(3.5, 90 * DG + 0.004, z + 0.01), pol(RI - 0.2, 90 * DG + 0.003, z + 0.01), { w: 0.6, a: 0.8 }); }, 1e4 + 1);
      figure(k, ...at(4.3, 30), z, { top: true }); figure(k, ...at(4.3, 112), z, { hat: false }); figure(k, ...at(6.0, 130), z, { lady: true });
    }
    /* lift core: a glazed see-through shaft (mullions front and back), lattice gates, the car at the reading-room level */
    const hull = pts => { pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = []; for (const p of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); } for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); } return lo.slice(0, -1).concat(up.slice(0, -1)); };
    put(0, 'slab', lathe([[RL, Z[0], 'pit'], [0.001, Z[0]]], { seg: 16 }));
    const CAR = Z[2] + 0.05;
    for (let k = 0; k < 4; k++) {
      const z0 = Z[k], z1 = Z[k + 1], zm = z0 + 2.4, NS = 12;
      for (let i = 0; i < NS; i++) { const a = i * TAU / NS, b = a + TAU / NS, m = (a + b) / 2; [[z0, zm], [zm, z1]].forEach(([zb, zt], j) => put(k, 'main', { v: [pol(RL, a, zb), pol(RL, b, zb), pol(RL, b, zt), pol(RL, a, zt)], n: [Math.cos(m), Math.sin(m), 0], hard: [j === 0, true, true, false], ghost: true, kind: 'glassL' })); }
      cust(k, 'main', [0, 0, (z0 + z1) / 2], PP => { const q = []; for (let i = 0; i < 36; i++) { const a = i * TAU / 36; [z0, z1].forEach(z => { const r = pr(pol(RL, a, z)); if (r) q.push([r[0], r[1]]); }); } PP.wash(hull(q), '#c9a27a', 0.16, { edge: 0, jit: 0.2, steps: 1 }); }, 1.6);
      if (k === 2) {   // lift car
        put(k, 'main', box(0, 0, 1.5, 1.5, -14 * DG, CAR, CAR + 2.3, { kind: 'wood' })); put(k, 'main', box(0, 0, 1.62, 1.62, -14 * DG, CAR + 2.3, CAR + 2.42, { kind: 'wood' }));
      }
      if (k >= 2) cust(k, 'main', [0, 0, z1 - 0.2], PP => { [-0.18, 0.18].forEach(d => seg3(PP, [d, 0, k === 2 ? CAR + 2.42 : z0], [d, 0, z1], { w: 0.6, a: 0.8 })); }, 0.2);
      put(k, 'main', lathe([[RL + 0.03, z0, 'liftDoor'], [RL + 0.03, z0 + 2.2]], { a0: -40 * DG, a1: -16 * DG, seg: 3, capA: false, capB: false, f: { ghost: true } }));
      cust(k, 'main', pol(RL + 0.06, -28 * DG, z0 + 1.2), PP => { for (let i = 0; i <= 6; i++) { const a = lerp(-40, -16, i / 6) * DG; seg3(PP, pol(RL + 0.05, a, z0), pol(RL + 0.05, a, z0 + 2.2), { w: 0.5, a: 0.7 }); } for (let i = 0; i < 6; i++) { const a0 = lerp(-40, -16, i / 6) * DG, a1 = lerp(-40, -16, (i + 1) / 6) * DG; seg3(PP, pol(RL + 0.05, a0, z0 + 0.1), pol(RL + 0.05, a1, z0 + 2.1), { w: 0.4, a: 0.55 }); seg3(PP, pol(RL + 0.05, a1, z0 + 0.1), pol(RL + 0.05, a0, z0 + 2.1), { w: 0.4, a: 0.55 }); } }, 0.5);
    }

    /* ======================= TOP FLOOR (open to the sky): the glazed observatory lantern ======================= */
    { const k = 4, z = Z[4];
      // lantern: plinth, glazed drum (see-through), cornice, ribbed dome, cupola, flag
      const zl = z + 0.35, zt = zl + 2.7;
      put(k, 'main', lathe([[3.1, z, 'stone'], [3.1, zl, 'ptop'], [2.7, zl]], { seg: 24 }));
      put(k, 'main', lathe([[2.8, zl, 'glassL'], [2.8, zl + 0.9, 'glassL', true], [2.8, zl + 1.8, 'glassL', true], [2.8, zt]], { seg: 20, vHard: true, f: { ghost: true } }));
      // the back half of the drum as ghost faces is drawn by the renderer only when front-facing; add the far mullions explicitly
      for (let i = 0; i < 20; i++) { const a = i * TAU / 20, b = a + TAU / 20; cust(k, 'main', pol(2.8, a + TAU / 40, zl + 1.4), PP => { seg3(PP, pol(2.8, a, zl), pol(2.8, a, zt), { w: 0.8, a: 0.8 }); [zl + 0.9, zl + 1.8].forEach(zz => seg3(PP, pol(2.8, a, zz), pol(2.8, b, zz), { w: 0.7, a: 0.7 })); }, 0.1); }
      put(k, 'main', lathe([[2.9, zt, 'stone'], [3.15, zt + 0.16], [3.15, zt + 0.36, 'ptop'], [2.95, zt + 0.36]], { seg: 24 }));
      const dome = []; for (let i = 0; i <= 7; i++) { const ph = i / 7 * 78 * DG; dome.push([Math.cos(ph) * 2.95 + (i === 7 ? 0 : 0), zt + 0.36 + Math.sin(ph) * 1.7, 'dome']); } dome.push([0.001, dome[7][1]]);
      put(k, 'main', lathe(dome, { seg: 24 }));
      cust(k, 'main', [0, 0, zt + 1.5], PP => { for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + 0.13, pts = []; for (let j = 0; j <= 7; j++) { const ph = j / 7 * 78 * DG; pts.push(pol(Math.cos(ph) * 2.97, a, zt + 0.36 + Math.sin(ph) * 1.71)); } const c = pts[3]; if (V.dot([Math.cos(a), Math.sin(a), 0.3], V.sub(EYE, c)) > 0) pl3(PP, pts, { w: 0.9, a: 0.85 }); } }, 3);
      const zc = dome[7][1];
      put(k, 'main', lathe([[0.62, zc, 'stone'], [0.62, zc + 0.6], [0.75, zc + 0.68], [0.001, zc + 1.2]], { seg: 12 }));
      cust(k, 'main', [0, 0, zc + 2], PP => { seg3(PP, [0, 0, zc + 1.2], [0, 0, zc + 1.9], { w: 1.2 }); const a = pr([0, 0, zc + 1.95]); if (a) PP.circle(a[0], a[1], 2.2, { w: 0.9, passes: 1, c: INK }); }, 5);
      // telescope inside the lantern
      put(k, 'main', lathe([[0.55, z, 'stone'], [0.55, z + 0.15], [0.4, z + 0.25], [0.38, z + 1.1], [0.5, z + 1.2], [0.001, z + 1.22]], { seg: 12 }));
      { const c0 = [0, 0, z + 1.75], dr = V.norm([Math.cos(62 * DG), Math.sin(62 * DG), 1.0]);
        put(k, 'main', tube(V.add(c0, V.mul(dr, -1.2)), V.add(c0, V.mul(dr, 1.9)), 0.3, 0.36, 12, { kind: 'brass' }));
        put(k, 'main', tube(V.add(c0, V.mul(dr, -1.5)), V.add(c0, V.mul(dr, -1.2)), 0.12, 0.12, 8, { kind: 'brass' }));
        put(k, 'main', box(0, 0, 0.18, 0.7, 62 * DG, z + 1.22, z + 1.8, { kind: 'iron' })); }
      figure(k, ...at(6.9, 76), z, { lady: true }); figure(k, ...at(7.4, 82), z, {});
    }

    /* ======================= CULL what the slabs above hide completely (saves thousands of strokes) ======================= */
    const underSlab = (p, k) => {
      for (let m = k + 1; m <= 4; m++) {
        const zt = Z[m]; if (p[2] >= zt - 1e-6) continue;
        const u = (zt - p[2]) / (EYE[2] - p[2]), x = p[0] + (EYE[0] - p[0]) * u, y = p[1] + (EYE[1] - p[1]) * u, r = Math.hypot(x, y);
        if (m === 4 && r < 3.35) return true;
        if (r > RS + 0.05 && r < RO + 0.1 && inRet(Math.atan2(y, x), m) && !inWell(x, y, m)) return true;
      }
      return false;
    };
    GR.forEach((g, k) => ['slab', 'inw', 'main'].forEach(ps => { g[ps] = g[ps].filter(f => f.custom ? !(f.cull !== false && underSlab(f.c, k) && k < 4 && f.bias < 100) : !f.v.every(v => underSlab(v, k)) || !f.v.length); }));

    /* ======================= STYLE ======================= */
    const set = (f, key, v) => { if (f[key] === undefined) f[key] = v; };
    const STY = {
      out: f => { set(f, 'c', WM); set(f, 'ca', 0.5); },
      ledge: f => { set(f, 'tone', 0.08); set(f, 'c', WL); set(f, 'ca', 0.4); },
      ptop: f => { set(f, 'tone', 0.1); set(f, 'c', WL); set(f, 'ca', 0.4); },
      pin: f => { set(f, 'tone', T(0.4 + 0.3 * darkOf(f.n))); set(f, 'c', WM); set(f, 'ca', 0.45); },
      top: (f, k) => { set(f, 'tone', 0.05 + 0.06 * (f.rr || 5) / RI); set(f, 'c', WL); set(f, 'ca', 0.5); },
      inU: f => { set(f, 'tone', T(0.68 + 0.22 * darkOf(f.n))); set(f, 'c', WD); set(f, 'ca', 0.55); },
      inL: f => { set(f, 'tone', T(0.52 + 0.22 * darkOf(f.n))); set(f, 'c', WM); set(f, 'ca', 0.6); },
      cut: f => { set(f, 'tone', 0.22); set(f, 'c', CUT); set(f, 'ca', 0.72); },
      wtop: f => { set(f, 'tone', 0.22); set(f, 'c', CUT); set(f, 'ca', 0.62); },
      well: f => { set(f, 'tone', 0.3); set(f, 'c', CUT); set(f, 'ca', 0.6); },
      sill: f => { set(f, 'tone', 0.12); set(f, 'c', WL); set(f, 'ca', 0.4); },
      jamb: f => { set(f, 'tone', T(0.45 + 0.4 * darkOf(f.n))); set(f, 'c', WD); set(f, 'ca', 0.45); },
      glass: f => { set(f, 'tone', 0.84); set(f, 'c', WX); set(f, 'ca', 0.45); },
      door: f => { set(f, 'tone', 0.9); set(f, 'c', WX); set(f, 'ca', 0.55); },
      slabIn: f => { set(f, 'tone', 0.3); set(f, 'c', CUT); set(f, 'ca', 0.55); },
      lift: f => { set(f, 'tone', T(0.2 + 0.6 * darkOf(f.n))); set(f, 'c', WM); set(f, 'ca', 0.3 + 0.4 * darkOf(f.n)); },
      liftDoor: f => { set(f, 'tone', 0.88); set(f, 'c', WX); set(f, 'ca', 0.5); f.bias = 0.2; },
      liftTop: f => { set(f, 'tone', 0.3); set(f, 'c', CUT); },
      earthOut: f => { set(f, 'tone', T(0.2 + 0.45 * darkOf(f.n))); set(f, 'c', EARTH); set(f, 'ca', 0.4); },
      earth: f => { set(f, 'tone', 0.5); set(f, 'c', EARTH); set(f, 'ca', 0.55); },
      terrace: f => { set(f, 'tone', 0.06); set(f, 'c', WL); set(f, 'ca', 0.3); },
      tread: f => { set(f, 'tone', 0.1); set(f, 'c', WL); set(f, 'ca', 0.45); },
      treadIn: f => { set(f, 'tone', 0.45); set(f, 'c', CUT); set(f, 'ca', 0.5); },
      riser: f => { set(f, 'tone', 0.62); set(f, 'c', WD); set(f, 'ca', 0.5); },
      string: f => { set(f, 'tone', T(0.4 + 0.35 * darkOf(f.n))); set(f, 'c', WM); set(f, 'ca', 0.5); },
      fig: f => { set(f, 'noHatch', true); set(f, 'c', WX); set(f, 'ca', 0.55 + 0.35 * darkOf(f.n)); },
      leg: f => { set(f, 'noHatch', true); set(f, 'c', '#4a2a16'); set(f, 'ca', 0.85); },
      head: f => { set(f, 'noHatch', true); set(f, 'c', '#dcae7e'); set(f, 'ca', 0.35 + 0.4 * darkOf(f.n)); },
      hat: f => { set(f, 'noHatch', true); set(f, 'c', '#4a2a16'); set(f, 'ca', 0.6 + 0.3 * darkOf(f.n)); },
      wood: f => { set(f, 'tone', T(0.28 + 0.66 * darkOf(f.n))); set(f, 'c', WD); set(f, 'ca', 0.5); },
      stone: f => { set(f, 'tone', T(0.05 + 0.8 * darkOf(f.n))); set(f, 'c', WL); set(f, 'ca', 0.4); },
      stepTop: f => { set(f, 'tone', 0.06); set(f, 'c', WL); set(f, 'ca', 0.35); },
      iron: f => { set(f, 'tone', T(0.45 + 0.5 * darkOf(f.n))); set(f, 'c', WX); set(f, 'ca', 0.45); },
      brass: f => { set(f, 'tone', T(0.2 + 0.7 * darkOf(f.n))); set(f, 'c', '#c7913e'); set(f, 'ca', 0.55); },
      shade: f => { set(f, 'tone', T(0.3 + 0.5 * darkOf(f.n))); set(f, 'c', '#8f9a58'); set(f, 'ca', 0.5); },
      paper: f => { set(f, 'tone', 0.05); set(f, 'noHatch', true); },
      globe: f => { set(f, 'tone', T(0.1 + 0.8 * darkOf(f.n))); set(f, 'c', '#b89a5c'); set(f, 'ca', 0.55); },
      frame: f => { set(f, 'tone', 0.35); set(f, 'c', '#c7913e'); set(f, 'ca', 0.5); },
      canvas: f => { set(f, 'tone', 0.8); set(f, 'c', WX); set(f, 'ca', 0.5); },
      dome: f => { set(f, 'tone', T(0.12 + 0.75 * darkOf(f.n))); set(f, 'c', WM); set(f, 'ca', 0.5); },
      glassL: () => {}, glass3: () => {}, pit: f => { set(f, 'tone', 0.75); set(f, 'c', WX); set(f, 'ca', 0.5); },
      obj: f => { set(f, 'tone', T(0.12 + 0.8 * darkOf(f.n))); set(f, 'c', WM); set(f, 'ca', 0.42); },
    };
    GR.forEach((g, k) => ['slab', 'inw', 'main'].forEach(ps => g[ps].forEach(f => { if (f.custom) return; (STY[f.kind] || STY.obj)(f, k); })));

    /* ======================= DRAW ======================= */
    // ground plane, sketched loosely on the paper before the model: a pale wash apron, terrain lines running off the plinth, tufts
    { const ap = []; for (let i = 0; i <= 48; i++) { const q = pr(pol(RO + 6.5 + 1.2 * Math.sin(i * 1.7), i * TAU / 48, 0)); if (q) ap.push([q[0], q[1]]); } P.wash(ap, '#c69a62', 0.14, { edge: 1, jit: 3 }); const g0 = pr(pol(RO + 2.4, 196 * DG, 0)), g1 = pr(pol(RO + 2.4, -22 * DG, 0));
      if (g0) { P.curve([[g0[0] + 4, g0[1]], [g0[0] - 90, g0[1] + 10], [g0[0] - 190, g0[1] + 4], [g0[0] - 300, g0[1] + 18]], { w: 0.8, a: 0.5, rough: 1 }); P.curve([[g0[0] - 40, g0[1] + 46], [g0[0] - 150, g0[1] + 62], [g0[0] - 250, g0[1] + 60]], { w: 0.6, a: 0.3, rough: 1.2 }); }
      if (g1) { P.curve([[g1[0] - 4, g1[1]], [g1[0] + 90, g1[1] - 8], [g1[0] + 200, g1[1] + 4], [g1[0] + 310, g1[1] - 10]], { w: 0.8, a: 0.5, rough: 1 }); P.curve([[g1[0] + 60, g1[1] + 40], [g1[0] + 170, g1[1] + 52], [g1[0] + 280, g1[1] + 46]], { w: 0.6, a: 0.3, rough: 1.2 }); }
      [g0, g1].forEach((g, side) => { if (!g) return; for (let i = 0; i < 14; i++) { const x = g[0] + (side ? 1 : -1) * P.r(20, 260), y = g[1] + P.r(4, 40); for (let j = 0; j < 3; j++) P.line(x + j * 2.5, y, x + j * 2.5 + P.r(-2, 2), y - P.r(3, 7), { w: 0.5, a: 0.45, passes: 1, over: 0, rough: 0.3 }); } });
    }
    const RO_ = { ink: INK, paper: PAPER, light: L, ambient: AMB, gap: 6.0, w: 1.15, rough: 0.28, zw: 0, hatchMin: 0.13, rich: true, darken: 1.18 };

    for (let k = 0; k < 5; k++) { D.render(P, GR[k].slab, cam, RO_); D.render(P, GR[k].inw, cam, RO_); D.render(P, GR[k].main, cam, RO_); }

    /* ---------------- sheet furniture: folds, stains, title ---------------- */
    [[540, 0, 540, 1000], [1070, 0, 1070, 1000], [0, 505, 1600, 505]].forEach(([x1, y1, x2, y2]) => { P.line(x1, y1, x2, y2, { w: 0.6, a: 0.13, c: INK, rough: 0.6, passes: 1 }); P.line(x1 + (x1 === x2 ? 2 : 0), y1 + (y1 === y2 ? 2 : 0), x2 + (x1 === x2 ? 2 : 0), y2 + (y1 === y2 ? 2 : 0), { w: 1.4, a: 0.05, c: '#ffffff', rough: 0.6, passes: 1 }); });
    for (let i = 0; i < 7; i++) { const cx = P.r(80, 1520), cy = P.r(80, 920), r = P.r(14, 60), pts = []; for (let j = 0; j < 14; j++) { const a = j * TAU / 14; pts.push([cx + Math.cos(a) * r * P.r(0.7, 1.2), cy + Math.sin(a) * r * P.r(0.6, 1.1)]); } P.wash(pts, '#b98a4c', P.r(0.05, 0.1), { edge: 1 }); }
    P.text('The Rotunda of Instruments', 70, 930, { size: 24, c: INK, font: S.HAND, a: 0.9 });
    P.text('cut-away perspective  -  library, galleries & observatory lantern', 72, 954, { size: 11, c: INK, a: 0.75 });
    { const a = pr([0, 0, 0]), b = pr([0, 0, 5]), u = Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.8, x0 = 1540 - 2 * u, y0 = 942; P.line(x0, y0, x0 + 2 * u, y0, { w: 1, a: 0.8, c: INK, passes: 1 }); P.hatch([[x0, y0 - 3], [x0 + u, y0 - 3], [x0 + u, y0], [x0, y0]], { ang: 0, gap: 1.2, a: 0.7, w: 0.6, c: INK, inset: 0 }); for (let i = 0; i <= 2; i++) { P.line(x0 + i * u, y0 - 4, x0 + i * u, y0 + 4, { w: 0.8, a: 0.8, c: INK, passes: 1, over: 0 }); P.text(String(i * 5), x0 + i * u, y0 + 18, { size: 9, c: INK, a: 0.7, align: 'center' }); } P.text('m', x0 + 2 * u + 10, y0 + 18, { size: 9, c: INK, a: 0.7 }); }
    // level tags on the left, leaders to the section faces
    { let yl = 0; [['observatory lantern', 4, pol(2.2, 200 * DG, Z[4] + 3.6)], ['instrument room', 4], ['gallery', 3], ['reading room', 2], ['entrance hall', 1], ['stacks', 0]].forEach(([s, kk, p3]) => {
        const q = pr(p3 || pol(RI - 1.2, ret(kk)[1] - 0.01, Z[kk] + 1.3)); if (!q) return; const y = Math.max(yl + 30, q[1] + 4); yl = y;
        P.note(s, 330, y, q[0] - 6, q[1], { size: 12, c: INK, a: 0.75, align: 'right' }); }); }
  }
});
