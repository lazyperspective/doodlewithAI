/* The Sketchbook: every sheet bound into a spiral landscape sketchpad.
   Pages flip over the top binding; each drawing can be watched from a blank page, sped up, paused or finished.
   The drawings themselves (engine.js, engine3d.js, scenes/*.js) are used untouched. */
(function () {
  'use strict';
  const S = Sketch, W = S.W, H = S.H;
  const $ = q => document.querySelector(q);
  const SCENES = window.SCENES || []; SCENES.forEach((s, n) => { s.index = n; });
  const TOTAL = SCENES.length, DURATION = 34;
  const book = $('#book'), sheet = $('#sheet'), paperC = $('#paper'), inkC = $('#ink'), grainEl = $('#grain'), domPage = $('#dom'), penEl = $('#pen'), loading = $('#loading');
  const ictx = inkC.getContext('2d'), pctx = paperC.getContext('2d');
  let k = 1, speedMul = 1, paused = false;

/*THEMES*/
  const THEMES = {
    cream: { base: '#f2ead8', blot: ['rgba(206,176,120,0.10)', 'rgba(255,255,255,0.14)'], grid: { minor: 20, major: 100, mc: 'rgba(96,120,150,0.075)', Mc: 'rgba(96,120,150,0.11)' }, fib: ['rgba(120,96,60,0.07)', 'rgba(255,255,255,0.35)'], vig: 'rgba(120,90,40,0.28)', tape: true, blend: 'multiply', grain: [250, 244, 230, 62] },
    kraft: { base: '#b68b56', blot: ['rgba(80,52,24,0.20)', 'rgba(232,192,132,0.20)'], grid: null, fib: ['rgba(60,38,18,0.20)', 'rgba(244,216,166,0.26)'], fibN: 6200, vig: 'rgba(40,24,8,0.42)', tape: false, blend: 'normal', grain: [246, 222, 176, 46] },
    mint: { base: '#edf4f0', blot: ['rgba(120,160,150,0.10)', 'rgba(255,255,255,0.20)'], grid: { minor: 10, major: 50, mc: 'rgba(60,140,140,0.15)', Mc: 'rgba(60,140,140,0.30)' }, fib: ['rgba(80,120,110,0.06)', 'rgba(255,255,255,0.4)'], vig: 'rgba(70,110,100,0.16)', tape: false, blend: 'multiply', grain: [240, 250, 246, 55] },
    pcb: { base: '#eeefe9', blot: ['rgba(160,150,110,0.08)', 'rgba(255,255,255,0.2)'], grid: { minor: 20, major: 100, mc: 'rgba(60,90,200,0.06)', Mc: 'rgba(60,90,200,0.14)' }, fib: ['rgba(100,100,80,0.06)', 'rgba(255,255,255,0.4)'], vig: 'rgba(120,110,70,0.18)', tape: false, blend: 'multiply', grain: [250, 250, 244, 50] },
    pencil: { base: '#f3efe2', blot: ['rgba(200,180,130,0.10)', 'rgba(255,255,255,0.16)'], grid: null, fib: ['rgba(110,96,64,0.06)', 'rgba(255,255,255,0.35)'], vig: 'rgba(120,100,60,0.18)', tape: false, blend: 'multiply', grain: [250, 246, 234, 70] },
    cyan: { base: '#e9e3d0', blot: ['rgba(150,120,70,0.10)', 'rgba(255,255,255,0.18)'], grid: null, fib: ['rgba(110,90,50,0.08)', 'rgba(255,255,255,0.45)'], vig: 'rgba(80,60,20,0.28)', tape: false, blend: 'normal', grain: [220, 240, 255, 34], glow: 'drop-shadow(0 0 1.1px rgba(190,225,255,0.55))' },
    sepia: { base: '#efe3c6', blot: ['rgba(190,150,90,0.13)', 'rgba(255,250,235,0.22)'], grid: null, fib: ['rgba(110,80,40,0.09)', 'rgba(255,255,255,0.4)'], fibN: 3400, vig: 'rgba(110,80,30,0.32)', tape: false, blend: 'multiply', grain: [250, 240, 216, 58] },
    ink: { base: '#f4f0e4', blot: ['rgba(190,170,120,0.10)', 'rgba(255,255,255,0.22)'], grid: { minor: 10, major: 50, mc: 'rgba(120,120,110,0.05)', Mc: 'rgba(120,120,110,0.10)' }, fib: ['rgba(100,90,60,0.06)', 'rgba(255,255,255,0.4)'], fibN: 2400, vig: 'rgba(100,90,50,0.22)', tape: false, blend: 'multiply', grain: [250, 246, 234, 52] },
    archive: { base: '#f1e9d2', blot: ['rgba(190,160,100,0.10)', 'rgba(255,252,240,0.20)'], grid: null, fib: ['rgba(120,96,60,0.06)', 'rgba(255,255,255,0.35)'], fibN: 3000, vig: 'rgba(130,100,50,0.20)', tape: false, blend: 'multiply', grain: [248, 242, 226, 50] },
    // riso: off-white stock, heavy grain, two inks; the second ink is printed slightly out of register
    riso: { base: '#f3eee2', blot: ['rgba(180,170,150,0.08)', 'rgba(255,255,255,0.18)'], grid: null, fib: ['rgba(90,80,60,0.05)', 'rgba(255,255,255,0.3)'], fibN: 1800, vig: 'rgba(60,50,40,0.10)', tape: false, blend: 'multiply', grain: [246, 240, 228, 95], riso: { offset: [2.2, -1.6], inks: ['#1f4fa3', '#f0506e'] } },
    bluepen: { base: '#efe6d0', blot: ['rgba(200,170,110,0.12)', 'rgba(255,255,255,0.14)'], grid: null, fib: ['rgba(120,96,60,0.07)', 'rgba(255,255,255,0.3)'], vig: 'rgba(140,110,50,0.24)', tape: false, blend: 'multiply', grain: [250, 244, 226, 44] },
  };
/*PAPER*/
  function paintPaperTo(pctx, paperC, theme, k) {
    const w = paperC.width, h = paperC.height, R = S.rng(7), th = theme;
    pctx.setTransform(1, 0, 0, 1, 0, 0);
    pctx.fillStyle = th.base; pctx.fillRect(0, 0, w, h);
    pctx.setTransform(k, 0, 0, k, 0, 0);
    for (let i = 0; i < 26; i++) {
      const x = R() * W, y = R() * H, r = 120 + R() * 380;
      const g = pctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, R() > 0.5 ? th.blot[0] : th.blot[1]);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      pctx.fillStyle = g; pctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    if (th.grid) {
      const G = th.grid;
      pctx.strokeStyle = G.mc; pctx.lineWidth = 1 / k * 0.8; pctx.beginPath();
      for (let x = 0; x <= W; x += G.minor) { pctx.moveTo(x, 0); pctx.lineTo(x, H); }
      for (let y = 0; y <= H; y += G.minor) { pctx.moveTo(0, y); pctx.lineTo(W, y); }
      pctx.stroke();
      pctx.strokeStyle = G.Mc; pctx.beginPath();
      for (let x = 0; x <= W; x += G.major) { pctx.moveTo(x, 0); pctx.lineTo(x, H); }
      for (let y = 0; y <= H; y += G.major) { pctx.moveTo(0, y); pctx.lineTo(W, y); }
      pctx.stroke();
    }
    for (let i = 0; i < (th.fibN || 2600); i++) {
      const x = R() * W, y = R() * H, a = R() * 6.28, l = 3 + R() * 9;
      pctx.strokeStyle = R() > 0.5 ? th.fib[0] : th.fib[1];
      pctx.lineWidth = 0.5; pctx.beginPath(); pctx.moveTo(x, y);
      pctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); pctx.stroke();
    }
    const v = pctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, th.vig);
    pctx.fillStyle = v; pctx.fillRect(0, 0, W, H);
    if (th.tape) for (const [x, y, r] of [[38, 30, -0.7], [W - 38, 30, 0.7], [38, H - 30, 0.7], [W - 38, H - 30, -0.7]]) {
      pctx.save(); pctx.translate(x, y); pctx.rotate(r);
      pctx.fillStyle = 'rgba(232,214,160,0.72)'; pctx.fillRect(-42, -13, 84, 26);
      pctx.strokeStyle = 'rgba(160,130,70,0.35)'; pctx.lineWidth = 0.8; pctx.strokeRect(-42, -13, 84, 26);
      for (let t = -36; t < 40; t += 5) { pctx.beginPath(); pctx.moveTo(t, -13); pctx.lineTo(t + 1.5, 13); pctx.strokeStyle = 'rgba(160,130,70,0.10)'; pctx.stroke(); }
      pctx.restore();
    }
  }
/*GRAIN*/
  function makeGrain(theme) {
    const c = document.createElement('canvas'); c.width = c.height = 220;
    const x = c.getContext('2d'), R = S.rng(99), id = x.createImageData(220, 220), G = theme.grain;
    for (let i = 0; i < id.data.length; i += 4) {
      const v = R();
      id.data[i] = G[0]; id.data[i + 1] = G[1]; id.data[i + 2] = G[2];
      id.data[i + 3] = v > 0.86 ? Math.floor((v - 0.86) * 7.1 * G[3]) : 0;
    }
    x.putImageData(id, 0, 0);
    grainEl.style.backgroundImage = `url(${c.toDataURL()})`;
    grainEl.style.backgroundSize = '220px 220px';
  }
/*PLAYER*/
  /* --------------------------------------------------------------- stroke options */
  const ENH = Object.assign({ nib: 0.22, caps: true, pool: 0.25 }, window.SKETCH_OPTS || {});
  // riso: two drums. Everything in the scene's main ink prints in the first ink; every other colour (except white
  // knock-outs) prints in the second, shifted a little out of register
  function risoShift(ops, main, [dx, dy], inks) { const m = String(main).toLowerCase(), white = c => /^#f{3}(f{3})?$/i.test(c);
    for (const op of ops) { if (!op.c || white(op.c)) continue; delete op.fs; delete op.fp;
      const rgb = S.rgb ? S.rgb(op.c) : null, lum = rgb ? (rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11) / 255 : 1;
      const sat = rgb ? Math.max(...rgb) - Math.min(...rgb) : 0;
      if (String(op.c).toLowerCase() === m || (lum < 0.25 && sat < 40)) { op.c = inks[0]; continue; }   // black and near-black: the first drum
      op.c = inks[1];
      switch (op.k) { case 's': case 'D': op.p = op.p.map(q => [q[0] + dx, q[1] + dy, q[2]]); break; case 'f': op.poly = op.poly.map(q => [q[0] + dx, q[1] + dy]); break; case 'd': op.x += dx; op.y += dy; break; } } }

  class Player {
    constructor(scene) {
      const P = new S.Page(scene.seed, { ink: scene.ink });
      scene.build(P, scene.index + 1, TOTAL);
      { const th = themeFor(scene); if (th.riso) risoShift(P.ops, scene.ink || P.ink, th.riso.offset, th.riso.inks); }
      this.page = P; this.ops = P.ops; this.i = 0; this.j = 0; this.credit = 0; this.seed = scene.seed; this.scene = scene;
      // animated groups: op ranges the scene marked as live; after the pen finishes they are redrawn every frame
      this.anims = (P.anims || []).map(a => Object.assign({ st: {} }, a)); this.skip = new Uint8Array(this.ops.length); this.anims.forEach(a => this.skip.fill(1, a.i0, a.i1)); this.base = null; this.t0 = null; this.reveal = !!scene.reveal; this.full = null;
      this.total = 0;
      for (const op of this.ops) this.total += this.units(op) * this.ucost(op);
    }
    units(op) {
      switch (op.k) { case 's': return Math.max(0, op.p.length - 1); case 'f': return this.reveal ? this.bands(op).n : op.steps; default: return 1; }
    }
    ucost(op) {
      switch (op.k) { case 's': return 1; case 'f': return this.reveal ? (this.bands(op).n > 1 ? 30 : 9) : 9; case 'D': return 1 + op.p.length * 0.12; case 'e': return 2; default: return 1; }
    }
    get done() { return this.i >= this.ops.length; }
    get fraction() { return this.done ? 1 : this.i / this.ops.length; }
    reset() { ictx.setTransform(1, 0, 0, 1, 0, 0); ictx.clearRect(0, 0, inkC.width, inkC.height); ictx.setTransform(k, 0, 0, k, 0, 0); }
    advance(b) {
      this.credit += b;
      while (this.i < this.ops.length) {
        const op = this.ops[this.i], N = this.units(op);
        if (N === 0) { this.i++; this.j = 0; continue; }
        const uc = this.ucost(op), avail = Math.floor(this.credit / uc);
        if (avail < 1) break;
        const take = Math.min(avail, N - this.j);
        this.draw(op, this.j, this.j + take, ictx, this.pat);
        if (op.k === 's') { const q = op.p[Math.min(op.p.length - 1, this.j + take)]; this.pen = [q[0], q[1]]; } else if (op.poly) this.pen = op.poly[0]; else if (op.k === 'd') this.pen = [op.x, op.y];
        this.j += take; this.credit -= take * uc;
        if (this.j >= N) { this.i++; this.j = 0; }
      }
      if (this.done) this.credit = 0;
    }
    finish() { this.advance(Infinity); }
    /* ---- reveal mode: the finished page is rendered up front and the pen uncovers it stroke by stroke,
       so strokes that end up hidden (back faces in the 3D painter's order) never flash on screen ---- */
    ensure() {
      if (!this.reveal && !this.anims.length) return;
      if (this.reveal && (!this.full || this.full.k !== k)) {
        const c = document.createElement('canvas'); c.width = inkC.width; c.height = inkC.height; const x = c.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0); this.drawAll(this.ops, x);
        const pat = ictx.createPattern(c, 'no-repeat'); pat.setTransform(new DOMMatrix([1 / k, 0, 0, 1 / k, 0, 0])); this.full = { c, k, pat };
      }
      if (this.anims.length && (!this.base || this.base.k !== k)) { this.buildBase(); this.anims.forEach(a => { a.st.at = undefined; }); }
    }
    /* a fill is uncovered as a sweep of diagonal strips, so big black masses get inked in rather than popping in */
    bands(op) {
      if (op.rb) return op.rb;
      const white = !op.g && op.a >= 1 && /^#f{3,6}$/i.test(op.c); let A = 0, v0 = 1e9, v1 = -1e9; const ca = Math.cos(-0.7), sa = Math.sin(-0.7);
      for (let i = 0; i < op.poly.length; i++) { const p = op.poly[i], q = op.poly[(i + 1) % op.poly.length]; A += p[0] * q[1] - q[0] * p[1]; const v = -p[0] * sa + p[1] * ca; if (v < v0) v0 = v; if (v > v1) v1 = v; }
      A = Math.abs(A) / 2; const n = white ? 1 : Math.max(1, Math.min(400, Math.round(A / 260)));
      return (op.rb = { n, white, v0, v1, ca, sa });
    }
    get pat() { return this.reveal && this.full ? this.full.pat : null; }
    drawReveal(op, from, to, c, rv) {
      c.fillStyle = rv;
      switch (op.k) {
        case 's': {
          const p = op.p, L = [], Rr = [];
          for (let n = from; n <= to; n++) {
            const q = p[n], a = p[Math.max(0, n - 1)], b = p[Math.min(p.length - 1, n + 1)];
            let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
            const hw = q[2] * 1.1 + 0.8;
            L.push(q[0] - ty * hw, q[1] + tx * hw); Rr.push(q[0] + ty * hw, q[1] - tx * hw);
          }
          c.beginPath(); c.moveTo(L[0], L[1]); for (let n = 2; n < L.length; n += 2) c.lineTo(L[n], L[n + 1]); for (let n = Rr.length - 2; n >= 0; n -= 2) c.lineTo(Rr[n], Rr[n + 1]); c.closePath(); c.fill();
          break;
        }
        case 'f': {
          // fills lay down their own ink (white occluders hide what is behind, washes tint); big ones sweep in as strips
          const B = this.bands(op); c.fillStyle = op.g ? rv : (op.fs || (op.fs = S.rgba(op.c, op.a))); c.save(); c.beginPath(); c.moveTo(op.poly[0][0], op.poly[0][1]); for (let n = 1; n < op.poly.length; n++) c.lineTo(op.poly[n][0], op.poly[n][1]); c.closePath();
          if (B.n === 1) { c.fill(); c.restore(); break; }
          c.clip(); const h = (B.v1 - B.v0) / B.n, a = B.v0 + from * h - 1, b = B.v0 + to * h + 1, L = 4000, px = -B.sa, py = B.ca, ux = B.ca, uy = B.sa;
          c.beginPath(); c.moveTo(px * a - ux * L, py * a - uy * L); c.lineTo(px * a + ux * L, py * a + uy * L); c.lineTo(px * b + ux * L, py * b + uy * L); c.lineTo(px * b - ux * L, py * b - uy * L); c.closePath(); c.fill(); c.restore();
          break;
        }
        case 'd': c.beginPath(); c.arc(op.x, op.y, op.r + 0.8, 0, 6.3); c.fill(); break;
        case 'D': for (const q of op.p) { c.beginPath(); c.arc(q[0], q[1], q[2] + 0.8, 0, 6.3); c.fill(); } break;
        case 'e': c.save(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.moveTo(op.poly[0][0], op.poly[0][1]); for (let n = 1; n < op.poly.length; n++) c.lineTo(op.poly[n][0], op.poly[n][1]); c.closePath(); c.fill(); c.restore(); break;
      }
    }
    /* ---- live animation ---- */
    drawAll(ops, c, skip) { for (let n = 0; n < ops.length; n++) { if (skip && skip[n]) continue; const op = ops[n], N = op.k === 'f' ? op.steps : this.units(op); if (N === 0) continue; this.draw(op, 0, N, c); } }
    buildBase() {
      const c = document.createElement('canvas'); c.width = inkC.width; c.height = inkC.height; const x = c.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0);
      this.drawAll(this.ops, x, this.skip); this.base = { c, k };
    }
    bbox(ops) {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const inc = (x, y, r = 2) => { if (x - r < x0) x0 = x - r; if (y - r < y0) y0 = y - r; if (x + r > x1) x1 = x + r; if (y + r > y1) y1 = y + r; };
      for (const op of ops) { if (op.p) op.p.forEach(q => inc(q[0], q[1], (q[2] || 1) + 2)); if (op.poly) op.poly.forEach(q => inc(q[0], q[1])); if (op.k === 'd') inc(op.x, op.y, op.r + 2); }
      x0 = Math.max(-240, Math.floor(x0)); y0 = Math.max(-240, Math.floor(y0)); x1 = Math.min(W + 240, Math.ceil(x1)); y1 = Math.min(H + 240, Math.ceil(y1));
      return x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
    }
    genAnim(a, t) {
      const Q = new S.Page(this.seed + 7 + Math.floor(t * 4) % 3, { ink: this.page.ink }); a.fn(Q, t); const st = a.st; st.ops = Q.ops; st.at = t; st.k = k;
      if (a.cache) { const bb = this.bbox(Q.ops); st.bb = bb; if (!bb) return; const c = st.c || (st.c = document.createElement('canvas')); c.width = Math.ceil(bb.w * k); c.height = Math.ceil(bb.h * k); const x = c.getContext('2d'); x.setTransform(k, 0, 0, k, -bb.x * k, -bb.y * k); this.drawAll(Q.ops, x); }
    }
    animate(now) {
      if (this.t0 === null) this.t0 = now; const t = (now - this.t0) / 1000;
      if (this.scene.takeover) { const c = ictx; c.setTransform(1, 0, 0, 1, 0, 0); if (this.scene.takeover(c, t, inkC.width, inkC.height, this)) return; }
      this.ensure();
      const c = ictx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, inkC.width, inkC.height); c.drawImage(this.base.c, 0, 0);
      for (const a of this.anims) {
        const st = a.st, fps = a.fps ?? 24;
        if (st.at === undefined || st.k !== k || (fps > 0 && (t - st.at >= 1 / fps || t < st.at))) this.genAnim(a, t);
        c.setTransform(k, 0, 0, k, 0, 0);
        if (a.xf) { const m = a.xf(t); c.translate((m.x || 0) + (m.px || 0), (m.y || 0) + (m.py || 0)); if (m.rot) c.rotate(m.rot); c.translate(-(m.px || 0), -(m.py || 0)); }
        if (a.cache) { if (st.bb) c.drawImage(st.c, st.bb.x, st.bb.y, st.bb.w, st.bb.h); } else this.drawAll(st.ops, c);
      }
      c.setTransform(k, 0, 0, k, 0, 0);
    }
    /* redraw everything already drawn (after a resize / sheet switch) */
    replay() {
      const ti = this.i, tj = this.j;
      this.ensure(); this.reset();
      for (let n = 0; n <= ti && n < this.ops.length; n++) {
        const op = this.ops[n], N = this.units(op);
        if (N === 0) continue;
        this.draw(op, 0, n < ti ? N : tj, ictx, this.pat);
      }
    }
    draw(op, from, to, c = ictx, rv = null) {
      if (op.clip) { c.save(); c.beginPath(); const q = op.clip; c.moveTo(q[0][0], q[0][1]); for (let n = 1; n < q.length; n++) c.lineTo(q[n][0], q[n][1]); c.closePath(); c.clip(); try { const cl = op.clip; op.clip = null; this.draw(op, from, to, c, rv); op.clip = cl; } finally { c.restore(); } return; }
      if (op.blend && !rv) { c.save(); c.globalCompositeOperation = op.blend; try { this.drawOp(op, from, to, c, rv); } finally { c.restore(); } return; }
      this.drawOp(op, from, to, c, rv);
    }
    drawOp(op, from, to, c = ictx, rv = null) {
      if (to <= from && op.k !== 'e') return;
      if (rv) return this.drawReveal(op, from, to, c, rv);
      switch (op.k) {
        case 's': {
          const p = op.p, fs = op.fs || (op.fs = S.rgba(op.c, op.a));
          const L = [], Rr = [];
          const nib = ENH.nib;
          for (let n = from; n <= to; n++) {
            const q = p[n], a = p[Math.max(0, n - 1)], b = p[Math.min(p.length - 1, n + 1)];
            let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
            // a slightly flat nib held at 40 degrees: strokes across it are a little wider than strokes along it
            const hw = q[2] * 0.68 * (nib ? 1 + nib * Math.abs(tx * 0.643 - ty * 0.766) - nib * 0.5 : 1);

            L.push(q[0] - ty * hw, q[1] + tx * hw); Rr.push(q[0] + ty * hw, q[1] - tx * hw);
          }
          c.fillStyle = fs; c.beginPath(); c.moveTo(L[0], L[1]);
          for (let n = 2; n < L.length; n += 2) c.lineTo(L[n], L[n + 1]);
          for (let n = Rr.length - 2; n >= 0; n -= 2) c.lineTo(Rr[n], Rr[n + 1]);
          c.closePath(); c.fill();
          // round ends where the pen lands and lifts, a touch darker: the ink pools while the pen is still
          if (ENH.caps && to > from) { const pool = ENH.pool; c.fillStyle = op.fp || (op.fp = S.rgba(op.c, Math.min(1, op.a * (1 + pool))));
            if (from === 0) { const q = p[0]; c.beginPath(); c.arc(q[0], q[1], q[2] * 0.68 * (1 + pool * 0.5), 0, 6.3); c.fill(); }
            if (to === p.length - 1) { const q = p[to]; c.beginPath(); c.arc(q[0], q[1], q[2] * 0.68 * (1 + pool * 0.5), 0, 6.3); c.fill(); } }
          break;
        }
        case 'f': {
          const steps = op.steps, aStep = a => 1 - Math.pow(1 - a, 1 / steps);
          c.beginPath(); c.moveTo(op.poly[0][0], op.poly[0][1]);
          for (let n = 1; n < op.poly.length; n++) c.lineTo(op.poly[n][0], op.poly[n][1]);
          c.closePath();
          for (let s = from; s < to; s++) {
            if (op.g) {
              const g = op.g, gr = g.r1 !== undefined ? c.createRadialGradient(g.x0, g.y0, g.r0 || 0, g.x0, g.y0, g.r1) : c.createLinearGradient(g.x0, g.y0, g.x1, g.y1);
              gr.addColorStop(0, S.rgba(g.c0, aStep(g.a0))); gr.addColorStop(1, S.rgba(g.c1, aStep(g.a1)));
              c.fillStyle = gr;
            } else c.fillStyle = S.rgba(op.c, aStep(op.a));
            c.fill();
          }
          if (to >= steps && op.edge) {
            c.lineWidth = 1.2; c.lineJoin = 'round';
            c.strokeStyle = S.rgba(op.g ? op.g.c1 : op.c, Math.min(1, (op.g ? op.g.a1 : op.a) * 0.55));
            c.stroke();
          }
          break;
        }
        case 'd': c.fillStyle = S.rgba(op.c, op.a); c.beginPath(); c.arc(op.x, op.y, op.r, 0, 6.3); c.fill(); break;
        case 'D': {
          c.fillStyle = S.rgba(op.c, op.a);
          for (const q of op.p) { c.beginPath(); c.arc(q[0], q[1], q[2], 0, 6.3); c.fill(); }
          break;
        }
        case 'e': {
          c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000';
          c.beginPath(); c.moveTo(op.poly[0][0], op.poly[0][1]);
          for (let n = 1; n < op.poly.length; n++) c.lineTo(op.poly[n][0], op.poly[n][1]);
          c.closePath(); c.fill(); c.restore();
          break;
        }
      }
    }
  }

  function themeFor(scene) { const t = scene && scene.theme; return typeof t === 'string' ? (THEMES[t] || THEMES.cream) : Object.assign({}, THEMES.cream, t || {}); }

  /* ------------------------------------------------------------ the pages */
  const NOTES = {
    'The Bell Garden': 'Dense ink on a floating garden: a bell tower, trees grown out of the lawn, roots hanging below. A sign warns: NO RUNNING, THE TREES ARE TICKING.',
    'The Lunar Observatory': 'A print in every new shading: mezzotint sky, stippled moon, engraved 3D brass, wood-engraved sea, woodcut pines.',
    'Spaceship': 'Soft pencil, orthographic multi-view on cream, with red and green wiring and orbit insets.',
    'Burj Khalifa': 'A worm’s-eye view on kraft paper: black crosshatch, slate wash, white pen highlights.',
    'Bridge': 'Blue ballpoint, fog drawn as scalloped smoke ropes.',
    'Space Elevator': 'Mint graph paper, orbit construction circles and a red ascent path.',
    'Mechanical Robot': 'Circuit-board inking with red and green trace bundles.',
    'Pyramids': 'Kraft, low angle, scaffolding, sun-path geometry and star alignment.',
    'Library Tree': 'Cyanotype: engraved white line-work on Prussian blue, lit rooms drawn in negative.',
    'Cathedral': 'Sepia ink and wash sections: longitudinal, transverse and detail plates.',
    'Watch Movement': 'Black ink and red: the plan of a grand-complication movement.',
    'Watch (3D)': 'A true-perspective exploded view built on the 3D engine.',
    'Nave (cinematic 3D)': 'Low-angle one-point perspective, hatched by the light, with depth fog.',
    'Camera (exploded)': 'An exploded rangefinder in mixed engraving, black spotting and stipple.',
    'Rotunda (cutaway)': 'A domed rotunda cut open to show its structure.',
    'Doodle': 'An abstract doodle in every shading technique at once.',
    'Automatic Doodle': 'A doodle that grows itself, shape by shape.',
    'Ink Garden': 'A random abstract ink mass, grown motif by motif until the page is full.',
    'Tea Engine': 'A Gothic tower crowned with machinery, all for one cup of tea.',
    'The House That Draws Itself': 'A self-portrait: a house of rooms with one lit window, built on everything people wrote down, still being drawn by its own hand.',
    'Clock Island': 'Floating rocks, a clock-lighthouse and a time engine. It keeps moving once drawn.'
  };
  const PAGES = [{ kind: 'cover' }, { kind: 'contents' }].concat(SCENES.map((s, i) => ({ kind: 'scene', i })));
  const pageOfScene = i => i + 2;
  let cur = 0, busy = false, muted = false;
  const audios = {};
  const audioFor = pg => { if (!pg || pg.kind !== 'scene' || !SCENES[pg.i].audio) return null; const sc = SCENES[pg.i]; if (!audios[pg.i]) { const a = new Audio(sc.audio); a.loop = true; a.preload = 'auto'; audios[pg.i] = a; } return audios[pg.i]; };
  function stopAudio() { Object.values(audios).forEach(a => { a.pause(); a.currentTime = 0; }); window.__sceneClock = null; }
  const players = [];
  const playerFor = i => players[i] || (players[i] = new Player(SCENES[i]));

  function coverNode() {
    const d = document.createElement('div'); d.className = 'cover';
    d.innerHTML = `<div class="corner tl"></div><div class="corner bl"></div><div class="corner br"></div><div class="corner tr"></div><div class="band"></div>
      <div class="label"><div class="small">drawings in ink, pencil &amp; code</div><h1>Doodle<br>with Agents</h1><div class="rule"></div><div class="small">${TOTAL} plates · every line drawn by JavaScript</div></div>
      <div class="open">open the book ›</div>`;
    return d;
  }
  function contentsNode() {
    const d = document.createElement('div'); d.className = 'contents';
    const half = Math.ceil(TOTAL / 2), col = a => a.map(i => `<li data-p="${pageOfScene(i)}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${SCENES[i].name}</span><span class="dots"></span><span class="pg">p.${pageOfScene(i) + 1}</span></li>`).join('');
    d.innerHTML = `<h2>Contents</h2><div class="sub">click a plate to turn to it</div><div class="cols"><ol>${col([...Array(half).keys()])}</ol><ol>${col([...Array(TOTAL - half).keys()].map(x => x + half))}</ol></div><div class="sign">— all sheets drawn stroke by stroke, no images, no libraries</div>`;
    return d;
  }

  /* ------------------------------------------------------------- layout */
  function layout() {
    const availW = window.innerWidth - 70, availH = window.innerHeight - 190;
    const scale = Math.max(0.2, Math.min(availW / W, availH / H));
    const cw = Math.floor(W * scale), ch = Math.floor(H * scale), dpr = Math.min(2, window.devicePixelRatio || 1);
    book.style.setProperty('--w', cw + 'px'); book.style.setProperty('--h', ch + 'px'); book.style.setProperty('--s', scale);
    const pw = Math.round(cw * dpr), ph = Math.round(ch * dpr);
    if (paperC.width !== pw || paperC.height !== ph) {
      paperC.width = inkC.width = pw; paperC.height = inkC.height = ph; k = pw / W;
      const pg = PAGES[cur]; if (pg && pg.kind === 'scene') { paintPaperTo(pctx, paperC, themeFor(SCENES[pg.i]), k); if (players[pg.i]) players[pg.i].replay(); }
    }
    drawRings();
  }
  function drawRings() {
    const c = $('#rings'), w = book.clientWidth, dpr = Math.min(2, window.devicePixelRatio || 1); c.width = w * dpr; c.height = 70 * dpr; c.style.width = w + 'px'; c.style.height = '70px';
    const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, 70);
    const n = Math.max(12, Math.round(w / 34)), gap = (w - 60) / (n - 1);
    for (let i = 0; i < n; i++) { const cx = 30 + i * gap;
      x.fillStyle = '#0d0c0b'; x.beginPath(); x.ellipse(cx, 52, 5, 4, 0, 0, 6.3); x.fill();
      const g = x.createLinearGradient(cx - 8, 0, cx + 8, 0); g.addColorStop(0, '#5b5a57'); g.addColorStop(0.45, '#e6e3dc'); g.addColorStop(0.6, '#a19e97'); g.addColorStop(1, '#3d3c39');
      x.strokeStyle = g; x.lineWidth = 3.4; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx - 3, 52); x.bezierCurveTo(cx - 12, 30, cx + 2, 8, cx + 7, 22); x.bezierCurveTo(cx + 9, 30, cx + 6, 44, cx + 3, 50); x.stroke();
      x.strokeStyle = 'rgba(0,0,0,0.35)'; x.lineWidth = 1; x.beginPath(); x.moveTo(cx - 2, 54); x.bezierCurveTo(cx - 10, 34, cx + 2, 12, cx + 6, 25); x.stroke(); }
  }

  /* ---------------------------------------------------------- showing a page */
  function setScene(i) {
    const th = themeFor(SCENES[i]); inkC.style.mixBlendMode = th.blend; inkC.style.filter = th.glow || 'none'; makeGrain(th); paintPaperTo(pctx, paperC, th, k);
  }
  function showPage(idx, fromBlank) {
    stopAudio(); cur = idx; const pg = PAGES[idx]; history.replaceState(null, '', '#' + (idx + 1));
    const au = audioFor(pg); if (au) window.__sceneClock = () => au.currentTime;
    if (pg.kind === 'scene') {
      sheet.classList.add('scene'); domPage.innerHTML = ''; setScene(pg.i); const p = playerFor(pg.i);
      if (fromBlank) { p.i = 0; p.j = 0; p.credit = 0; p.reset(); p.ensure(); } else { p.finish(); p.replay(); }
      p.t0 = null;
    } else {
      sheet.classList.remove('scene'); domPage.innerHTML = ''; domPage.appendChild(pg.kind === 'cover' ? coverNode() : contentsNode());
    }
    updateChrome(); prewarm();
  }
  function updateChrome() {
    const pg = PAGES[cur], sc = pg.kind === 'scene';
    $('#cap-no').textContent = sc ? `Plate ${pg.i + 1} of ${TOTAL}` : pg.kind === 'cover' ? 'Cover' : 'Contents';
    $('#cap-title').textContent = sc ? SCENES[pg.i].name : pg.kind === 'cover' ? 'Doodle with Agents' : `${TOTAL} plates`;
    $('#cap-note').textContent = sc ? (SCENES[pg.i].note || NOTES[SCENES[pg.i].name] || '') : pg.kind === 'cover' ? 'Click the cover or press → to open.' : 'Pick a plate, or turn the pages with ← →.';
    document.querySelectorAll('.draw-only').forEach(b => { b.disabled = !sc; });
    $('#prev').disabled = cur === 0; $('#next').disabled = cur === PAGES.length - 1;
    $('#pause').textContent = paused ? '▶ resume' : '⏸ pause';
    document.querySelectorAll('#speeds button').forEach(b => b.classList.toggle('on', +b.dataset.v === speedMul));
    $('#pageno').textContent = `${cur + 1} / ${PAGES.length}`;
    const hasAu = sc && !!SCENES[pg.i].audio; $('#sound').style.display = hasAu ? '' : 'none'; $('#sound').textContent = muted ? '\u266a sound off' : '\u266a sound on';
  }
  let warmT = null;
  function prewarm() { clearTimeout(warmT); warmT = setTimeout(() => { for (const d of [1, -1]) { const pg = PAGES[cur + d]; if (pg && pg.kind === 'scene' && !players[pg.i]) { playerFor(pg.i); return prewarm(); } } }, 1600); }

  /* -------------------------------------------------------------- faces for the flipping leaf */
  function renderScene(i, live) {
    const th = themeFor(SCENES[i]), c = document.createElement('canvas'); c.width = paperC.width; c.height = paperC.height; const x = c.getContext('2d');
    if (live) x.drawImage(paperC, 0, 0); else paintPaperTo(x, c, th, k);
    let ink = inkC; if (!live) { ink = document.createElement('canvas'); ink.width = c.width; ink.height = c.height; const ix = ink.getContext('2d'); ix.setTransform(k, 0, 0, k, 0, 0); const p = playerFor(i); p.drawAll(p.ops, ix); }
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = th.blend === 'multiply' ? 'multiply' : 'source-over'; x.filter = th.glow || 'none'; x.drawImage(ink, 0, 0); x.globalCompositeOperation = 'source-over'; x.filter = 'none';
    c.className = 'snap'; return c;
  }
  function faceFor(idx, live) { const pg = PAGES[idx]; if (pg.kind === 'scene') return renderScene(pg.i, live); return pg.kind === 'cover' ? coverNode() : contentsNode(); }
  function backFor(front, idx) {
    const b = document.createElement('div'); b.className = 'back' + (PAGES[idx].kind === 'cover' ? ' coverback' : '');
    if (front.tagName === 'CANVAS') { const m = document.createElement('canvas'); m.width = front.width; m.height = front.height; const x = m.getContext('2d'); x.translate(0, m.height); x.scale(1, -1); x.globalAlpha = 0.07; x.drawImage(front, 0, 0); m.className = 'snap'; b.appendChild(m); }
    return b;
  }

  /* ------------------------------------------------------------------ flipping */
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function turnTo(target, opts = {}) {
    if (busy || target === cur || target < 0 || target >= PAGES.length) return; busy = true;
    const dir = target > cur ? 1 : -1, tpg = PAGES[target];
    if (tpg.kind === 'scene' && !players[tpg.i]) { loading.classList.add('on'); await wait(40); playerFor(tpg.i); loading.classList.remove('on'); }
    const leaf = document.createElement('div'); leaf.className = 'leaf';
    const front = dir > 0 ? faceFor(cur, true) : faceFor(target, false), fw = document.createElement('div'); fw.className = 'face front'; fw.appendChild(front); const sh = document.createElement('div'); sh.className = 'shade'; fw.appendChild(sh);
    leaf.appendChild(fw); leaf.appendChild(backFor(front, dir > 0 ? cur : target));
    leaf.classList.add(dir > 0 ? 'down' : 'up'); sheet.appendChild(leaf);
    if (dir > 0) showPage(target, opts.fromBlank); else sheet.classList.add('dim');
    void leaf.offsetWidth; leaf.classList.add('turn', dir > 0 ? 'to-up' : 'to-down'); leaf.classList.remove(dir > 0 ? 'down' : 'up');
    await new Promise(r => { const done = () => { leaf.removeEventListener('transitionend', done); r(); }; leaf.addEventListener('transitionend', done); setTimeout(done, 1400); });
    if (dir < 0) { showPage(target, opts.fromBlank); sheet.classList.remove('dim'); }
    leaf.remove(); busy = false;
  }

  /* ---------------------------------------------------------------- the pen */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const pg = PAGES[cur];
    if (pg && pg.kind === 'scene' && players[pg.i]) {
      const p = players[pg.i];
      if (!p.done) {
        if (!paused) { p.ensure(); p.advance(Math.max(140, p.total / DURATION) * speedMul * dt); p.t0 = null; }
        if (p.pen && !p.done) { const s = paperC.clientWidth / W; penEl.style.transform = `translate(${p.pen[0] * s}px, ${p.pen[1] * s}px)`; penEl.classList.add('on'); } else penEl.classList.remove('on');
        $('#progress').style.width = (p.fraction * 100).toFixed(1) + '%';
      } else { penEl.classList.remove('on'); $('#progress').style.width = '100%'; const au = audioFor(pg); if (au) { au.muted = muted; if (paused) { if (!au.paused) au.pause(); } else if (au.paused) au.play().catch(() => { }); } if ((p.anims.length || p.scene.takeover) && !paused) p.animate(now); }
      if (p.scene.pump) p.scene.pump(p.done);
    } else penEl.classList.remove('on');
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------- controls */
  function current() { const pg = PAGES[cur]; return pg.kind === 'scene' ? playerFor(pg.i) : null; }
  function drawFromBlank() { const p = current(); if (!p) return; const au = audioFor(PAGES[cur]); if (au) { au.pause(); au.currentTime = 0; } paused = false; p.i = 0; p.j = 0; p.credit = 0; p.pen = null; p.reset(); p.ensure(); p.t0 = null; updateChrome(); }
  function finish() { const p = current(); if (!p) return; p.finish(); p.replay(); updateChrome(); }
  function boot() {
    $('#prev').onclick = () => turnTo(cur - 1); $('#next').onclick = () => turnTo(cur + 1);
    $('#toc').onclick = () => turnTo(1);
    $('#draw').onclick = drawFromBlank; $('#finish').onclick = finish;
    $('#pause').onclick = () => { paused = !paused; updateChrome(); };
    $('#sound').onclick = () => { muted = !muted; updateChrome(); };
    document.querySelectorAll('#speeds button').forEach(b => { b.onclick = () => { speedMul = +b.dataset.v; updateChrome(); }; });
    domPage.addEventListener('click', e => { const li = e.target.closest('li[data-p]'); if (li) return turnTo(+li.dataset.p, { fromBlank: $('#autoplay').checked }); if (PAGES[cur].kind === 'cover') turnTo(1); });
    addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') turnTo(cur + 1); else if (e.key === 'ArrowLeft') turnTo(cur - 1);
      else if (e.key === ' ') { e.preventDefault(); finish(); } else if (e.key === 'd' || e.key === 'D') drawFromBlank();
      else if (e.key === 'p' || e.key === 'P') { paused = !paused; updateChrome(); }
      else if (/^[1-5]$/.test(e.key)) { speedMul = [0.5, 1, 2, 4, 8][+e.key - 1]; updateChrome(); }
    });
    addEventListener('resize', layout);
    // auto-play: arriving at a plate by turning pages starts it from a blank sheet when the box is ticked
    const nextBtn = $('#next'), prevBtn = $('#prev');
    nextBtn.onclick = () => turnTo(cur + 1, { fromBlank: $('#autoplay').checked }); prevBtn.onclick = () => turnTo(cur - 1, { fromBlank: $('#autoplay').checked });
    layout();
    const start = Math.max(0, Math.min(PAGES.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));
    showPage(start, false);
    requestAnimationFrame(frame);
    window.__book = { turnTo, get cur() { return cur; }, players, drawFromBlank, finish };
  }
  const fontsReady = document.fonts && document.fonts.load ? Promise.race([Promise.all([document.fonts.load('16px "Architects Daughter"'), document.fonts.load('16px Caveat')]), new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
  fontsReady.catch(() => { }).then(boot);
})();
